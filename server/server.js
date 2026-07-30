import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Charge .env depuis la racine du projet (un niveau au-dessus de /server)
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";
import multer from "multer";
import session from "express-session";
import { chatHandler } from "./chat.js";
import {
  getActivePromos,
  getStores,
  getVisibleProductIds,
  getAllProductsForApi,
  getAllergenes,
  getAllergensForProduct,
  getAllProductAllergens,
  saveContactMessage,
  listContactMessages,
  addNewsletterSubscriber,
  isNewsletterSubscribed,
  listNewsletterSubscribers,
  adminListCategories,
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminListAllergens,
  adminGetProductAllergens,
  adminSetProductAllergens,
  adminGetProductTranslations,
  adminSetProductTranslation,
  adminGetProductSheet,
  adminSetProductSheet,
  adminUpdatePosMapping,
  getDbDiagnostic,
  getProductSheet,
  getPosMapping,
  getJdcCategoryMappings,
  listSiteCategoriesWithMode,
  upsertJdcCategoryMapping,
  setCategoryManagedBy,
} from "./db.js";
import { sendContactEmail } from "./mail.js";
import { verifyPassword, safeEquals } from "./auth.js";
import { createRateLimiter } from "./rate-limit.js";
import {
  runJdcSync,
  getJdcSyncStatus,
  startJdcSyncScheduler,
  fetchJdcCatalog,
} from "./jdc-sync.js";

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Upload images produits ─────────────────────────────────────────────

const uploadsDir = path.join(__dirname, "uploads", "products");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => {
    const safeName = String(file.originalname || "file")
      .toLowerCase()
      .replace(/[^\w.-]+/g, "_");
    const timestamp = Date.now();
    cb(null, `${timestamp}-${safeName}`);
  },
});

const upload = multer({ storage });

// ─── Auth admin (login par session) ────────────────────────────────────

// Identifiants du back-office : uniquement via .env.
// Pour changer le mot de passe : node server/scripts/set-admin-password.js
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;

if (!ADMIN_USER || !ADMIN_PASSWORD_HASH) {
  console.error(
    "ADMIN_USER et ADMIN_PASSWORD_HASH doivent être définis dans .env. " +
      "Générez le hash avec : node server/scripts/set-admin-password.js"
  );
  process.exit(1);
}

if (!ADMIN_SESSION_SECRET) {
  console.error(
    "ADMIN_SESSION_SECRET doit être défini dans .env " +
      "(ex: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\")."
  );
  process.exit(1);
}

if (IS_PRODUCTION) {
  app.set("trust proxy", 1);
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://esm.sh",
          "https://cdn.jsdelivr.net",
          "https://www.googletagmanager.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://basemaps.cartocdn.com",
          "https://*.basemaps.cartocdn.com",
          "https://*.tile.openstreetmap.org",
        ],
        connectSrc: [
          "'self'",
          "https://basemaps.cartocdn.com",
          "https://*.basemaps.cartocdn.com",
          "https://*.tile.openstreetmap.org",
          "https://deliveroo.fr",
          "https://www.google-analytics.com",
          "https://*.google-analytics.com",
          "https://*.analytics.google.com",
        ],
        mediaSrc: ["'self'", "blob:"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        workerSrc: ["'self'", "blob:"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
// En production, seules les origines du site sont autorisées.
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: IS_PRODUCTION ? ALLOWED_ORIGINS : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: ADMIN_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: IS_PRODUCTION,
      // Le cookie couvre la plus longue session (formation, 12 h) ; l'expiration
      // admin, plus courte, est vérifiée séparément dans requireAdminSession.
      maxAge: 1000 * 60 * 60 * 12,
    },
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const SPA_STATIC_ROUTES = new Set([
  "/",
  "/produits",
  "/adn",
  "/nos-piliers",
  "/catering",
  "/restaurants",
  "/contact",
  "/allergenes",
  "/faq",
  "/mentions-legales",
  "/politique-confidentialite",
  "/politique-cookies",
  "/cgu",
  "/formation",
]);

function isValidSpaRoute(pathname) {
  if (SPA_STATIC_ROUTES.has(pathname)) return true;
  if (/^\/formation\/[^/]+$/.test(pathname)) return true;
  if (/^\/restaurants\/[^/]+$/.test(pathname)) return true;
  return false;
}

// 5 tentatives par IP sur 15 min, puis blocage d'une heure.
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  blockMs: 60 * 60 * 1000,
  message: "Trop de tentatives de connexion. Réessayez dans une heure.",
});

const contactLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Trop de messages envoyés. Réessayez dans une heure.",
});

const newsletterLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Trop d'inscriptions depuis cette adresse. Réessayez plus tard.",
});

const formationLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  blockMs: 30 * 60 * 1000,
  message: "Trop de tentatives. Réessayez dans 30 minutes.",
});

const ADMIN_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

function requireAdminSession(req, res, next) {
  const isAdminSessionValid =
    req.session &&
    req.session.isAdmin &&
    req.session.adminExpiresAt > Date.now();

  if (isAdminSessionValid) {
    // Session glissante : chaque action repousse l'expiration.
    req.session.adminExpiresAt = Date.now() + ADMIN_IDLE_TIMEOUT_MS;
    return next();
  }

  if (req.session?.isAdmin) {
    delete req.session.isAdmin;
    delete req.session.adminExpiresAt;
  }
  const wantsJson =
    req.path.startsWith("/api/") ||
    (req.headers.accept && req.headers.accept.includes("application/json"));
  if (wantsJson) {
    return res.status(401).json({ error: "Session admin requise. Reconnectez-vous." });
  }
  return res.redirect("/admin/login");
}

app.get("/admin/login", (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.redirect("/admin");
  }
  res.send(`<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>Connexion administration</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
      :root {
        --green: #82907B;
        --bg: #f7f6f3;
        --bg-panel: #ffffff;
        --border: #e0e0e0;
        --text: #1a1a1a;
        --danger: #c45c5c;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
        background: var(--bg);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px 16px;
      }
      .card {
        width: 100%;
        max-width: 380px;
        background: var(--bg-panel);
        border-radius: 12px;
        border: 1px solid var(--border);
        padding: 24px 24px 20px;
      }
      h1 {
        margin: 0 0 12px;
        font-size: 1.1rem;
      }
      p {
        margin: 0 0 18px;
        font-size: 0.9rem;
      }
      label {
        display: block;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 4px;
      }
      input[type="text"],
      input[type="password"] {
        width: 100%;
        border-radius: 8px;
        border: 1px solid var(--border);
        padding: 8px 10px;
        margin-bottom: 12px;
        font-family: inherit;
        font-size: 0.9rem;
      }
      button {
        width: 100%;
        border-radius: 999px;
        border: none;
        padding: 10px 14px;
        background: var(--green);
        color: #fff;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
      }
      button:hover { opacity: 0.92; }
      .error {
        margin-bottom: 12px;
        font-size: 0.85rem;
        color: var(--danger);
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Connexion admin</h1>
      <p>Veuillez entrer votre identifiant et votre mot de passe.</p>
      ${
        req.query.error
          ? '<div class="error">Identifiants invalides.</div>'
          : ""
      }
      <form method="post" action="/admin/login">
        <label for="username">Identifiant</label>
        <input id="username" name="username" type="text" autocomplete="username" required />
        <label for="password">Mot de passe</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required />
        <button type="submit">Se connecter</button>
      </form>
    </div>
  </body>
</html>`);
});

app.post("/admin/login", loginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  const isValid =
    safeEquals(username, ADMIN_USER) && verifyPassword(password, ADMIN_PASSWORD_HASH);

  if (!isValid) {
    console.warn(`Tentative de connexion admin échouée depuis ${req.ip}`);
    return res.redirect("/admin/login?error=1");
  }

  // Régénère l'identifiant de session après authentification (anti session fixation).
  req.session.regenerate((err) => {
    if (err) {
      console.error("Erreur lors de la régénération de la session admin:", err);
      return res.redirect("/admin/login?error=1");
    }
    req.session.isAdmin = true;
    req.session.adminExpiresAt = Date.now() + ADMIN_IDLE_TIMEOUT_MS;
    return res.redirect("/admin");
  });
});

app.post("/admin/logout", (req, res) => {
  if (!req.session) {
    return res.redirect("/");
  }

  req.session.destroy((err) => {
    if (err) {
      console.error("Erreur lors de la destruction de la session admin:", err);
    }

    // Invalide le cookie de session côté client
    res.clearCookie("connect.sid");
    return res.redirect("/");
  });
});

// ─── Espace formation (réservé au personnel) ───────────────────────────

// Le code d'accès ne transite plus dans le bundle JS : il est vérifié ici.
const FORMATION_ACCESS_CODE = process.env.FORMATION_ACCESS_CODE;
const FORMATION_SESSION_MS = 12 * 60 * 60 * 1000;

function hasFormationAccess(req) {
  return Boolean(
    req.session &&
      (req.session.isAdmin ||
        (req.session.formationExpiresAt &&
          req.session.formationExpiresAt > Date.now()))
  );
}

function requireFormationSession(req, res, next) {
  if (hasFormationAccess(req)) return next();
  return res.status(401).json({ error: "Accès formation requis." });
}

app.get("/api/formation/session", (req, res) => {
  res.json({ authenticated: hasFormationAccess(req) });
});

app.post("/api/formation/login", formationLimiter, (req, res) => {
  if (!FORMATION_ACCESS_CODE) {
    console.error("FORMATION_ACCESS_CODE n'est pas défini dans .env.");
    return res.status(500).json({ error: "Espace formation non configuré." });
  }

  if (!safeEquals(req.body?.code, FORMATION_ACCESS_CODE)) {
    return res.status(401).json({ error: "Code invalide." });
  }

  req.session.formationExpiresAt = Date.now() + FORMATION_SESSION_MS;
  return res.json({ authenticated: true });
});

app.post("/api/formation/logout", (req, res) => {
  if (req.session) delete req.session.formationExpiresAt;
  res.json({ authenticated: false });
});

// Vidéos servies hors de /public : inaccessibles sans session formation.
app.use(
  "/videos/formation",
  requireFormationSession,
  express.static(path.join(__dirname, "protected-media", "formation"), {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "private, max-age=3600");
    },
  })
);

app.get("/api/promos", (_, res) => res.json(getActivePromos()));
app.get("/api/stores", (_, res) => res.json(getStores()));

app.get("/api/allergenes", (_, res) => res.json(getAllergenes()));

app.get("/api/allergenes/products", (_, res) => res.json(getAllProductAllergens()));

app.get("/api/products/:id/allergenes", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "ID invalide" });
  res.json(getAllergensForProduct(id));
});

// Fiche enrichie d'un produit : nom traduit, ingrédients clés, bienfaits, allergènes, etc.
app.get("/api/products/:id/sheet", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "ID invalide" });
  const lang = normalizeLang(req.query.lang);
  const sheet = getProductSheet(id, lang);
  if (!sheet) return res.status(404).json({ error: "Produit introuvable" });
  res.json(sheet);
});

// Catalogue complet : produits (avec traductions, allergènes, fiches) + référentiel allergènes.
// Destiné à alimenter le frontend en un seul appel.
app.get("/api/catalog", (req, res) => {
  const lang = normalizeLang(req.query.lang);
  const onlyVisible = req.query.onlyVisible === "1";
  const products = getAllProductsForApi({
    lang,
    includeAllergens: true,
    includeSheet: true,
    onlyVisible,
  });
  res.json({
    lang: lang || "fr",
    allergens: getAllergenes(),
    products,
  });
});

function normalizeLang(raw) {
  if (!raw) return null;
  const lang = String(raw).toLowerCase().slice(0, 2);
  return lang === "fr" || lang === "en" ? lang : null;
}

// ─── Chatbot IA (Google Gemini) ──────────────────────────────────────
app.post("/api/chat", chatHandler);

app.post("/api/contact", contactLimiter, async (req, res) => {
  const {
    sujet,
    nom,
    prenom,
    email,
    telephone,
    entreprise,
    fonction,
    message,
  } = req.body || {};

  // Validation basique côté serveur (le frontend valide déjà, mais on revérifie)
  const errors = [];

  if (!sujet) errors.push("sujet");
  if (!nom || !String(nom).trim()) errors.push("nom");
  if (!prenom || !String(prenom).trim()) errors.push("prenom");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) errors.push("email");
  if (!telephone || !String(telephone).trim()) errors.push("telephone");
  if (!message || String(message).trim().length < 10) errors.push("message");

  if (sujet === "pro") {
    if (!entreprise || !String(entreprise).trim()) errors.push("entreprise");
    if (!fonction || !String(fonction).trim()) errors.push("fonction");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Champs manquants ou invalides",
      invalidFields: errors,
    });
  }

  const storedMessage = {
    sujet,
    nom,
    prenom,
    email,
    telephone,
    entreprise: entreprise || null,
    fonction: fonction || null,
    message,
    created_at: new Date().toISOString(),
    ip: req.ip,
    user_agent: req.get("user-agent") || null,
  };

  const id = saveContactMessage(storedMessage);

  // Pas de données personnelles dans les logs : elles sont consultables en base.
  console.log(`Nouveau message de contact enregistré (id=${id}, sujet=${sujet})`);

  // Envoi d'email non bloquant pour le client : on essaie, mais on ne casse pas la réponse en cas d'erreur
  try {
    await sendContactEmail({ id, ...storedMessage });
  } catch (err) {
    console.error("Erreur lors de l'envoi de l'email de contact:", err);
  }

  return res.status(201).json({
    success: true,
    message: "Message reçu, merci pour votre contact.",
    id,
  });
});

// Route d'admin pour lister les derniers messages (données personnelles).
app.get("/api/contact/messages", requireAdminSession, (req, res) => {
  const limit = Number(req.query.limit) || 100;
  const safeLimit = Number.isFinite(limit) && limit > 0 && limit <= 500 ? limit : 100;
  const messages = listContactMessages(safeLimit);
  res.json({ count: messages.length, messages });
});

app.get("/api/products/visibility", (_, res) => {
  const visibleIds = getVisibleProductIds();
  res.json({ visibleIds, lastSync: null });
});

app.get("/api/products", (req, res) => {
  const lang = normalizeLang(req.query.lang);
  const includes = String(req.query.include || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const products = getAllProductsForApi({
    lang,
    includeAllergens: includes.includes("allergens"),
    includeSheet: includes.includes("sheet"),
    onlyVisible: req.query.onlyVisible === "1",
  });
  res.json({ products });
});

// ─── Routes Admin protégées ────────────────────────────────────────────

app.get("/admin", requireAdminSession, (req, res) => {
  const adminHtml = path.join(__dirname, "admin.html");
  if (fs.existsSync(adminHtml)) {
    return res.sendFile(adminHtml);
  }
  return res
    .status(500)
    .send("Fichier admin.html manquant côté serveur.");
});

app.get("/api/admin/categories", requireAdminSession, (req, res) => {
  const categories = adminListCategories();
  res.json(categories);
});

app.get("/api/admin/diagnostic", requireAdminSession, (req, res) => {
  res.json(getDbDiagnostic());
});

app.get("/api/admin/pos-mapping", requireAdminSession, (req, res) => {
  res.json(getPosMapping());
});

app.get("/api/admin/products", requireAdminSession, (req, res) => {
  const products = adminListProducts();
  res.json(products);
});

app.post(
  "/api/admin/upload-image",
  requireAdminSession,
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier reçu" });
  }
    const url = `/uploads/products/${req.file.filename}`;
    return res.status(201).json({ url, filename: req.file.filename });
  }
);

app.post("/api/admin/products", requireAdminSession, (req, res) => {
  const {
    name,
    category_id,
    subcategory,
    price,
    volume,
    description,
    extra_price,
    extra_price_label,
    image_url,
    image_alt,
    jdc_id,
    visible,
    sort_order,
  } = req.body || {};

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "Le nom du produit est obligatoire." });
  }
  if (!category_id || !Number.isFinite(Number(category_id))) {
    return res
      .status(400)
      .json({ error: "category_id est obligatoire et doit être un nombre." });
  }

  const id = adminCreateProduct({
    name,
    category_id,
    subcategory,
    price,
    volume,
    description,
    extra_price,
    extra_price_label,
    image_url,
    image_alt,
    jdc_id,
    visible: !!visible,
    sort_order,
  });

  return res.status(201).json({ id });
});

app.put("/api/admin/products/:id", requireAdminSession, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "ID invalide." });
  }

  const {
    name,
    category_id,
    subcategory,
    price,
    volume,
    description,
    extra_price,
    extra_price_label,
    image_url,
    image_alt,
    jdc_id,
    visible,
    sort_order,
  } = req.body || {};

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "Le nom du produit est obligatoire." });
  }
  if (!category_id || !Number.isFinite(Number(category_id))) {
    return res
      .status(400)
      .json({ error: "category_id est obligatoire et doit être un nombre." });
  }

  const changes = adminUpdateProduct(id, {
    name,
    category_id,
    subcategory,
    price,
    volume,
    description,
    extra_price,
    extra_price_label,
    image_url,
    image_alt,
    jdc_id,
    visible: !!visible,
    sort_order,
  });

  if (!changes) {
    return res.status(404).json({ error: "Produit introuvable." });
  }

  return res.json({ updated: true });
});

app.delete("/api/admin/products/:id", requireAdminSession, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "ID invalide." });
  }

  const changes = adminDeleteProduct(id);
  if (!changes) {
    return res.status(404).json({ error: "Produit introuvable." });
  }

  return res.json({ deleted: true });
});

// ─── Admin Allergènes (CRUD) ────────────────────────────────────────

app.get("/api/admin/allergens", requireAdminSession, (_req, res) => {
  res.json(adminListAllergens());
});

app.get(
  "/api/admin/products/:id/allergens",
  requireAdminSession,
  (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "ID invalide." });
    }
    return res.json(adminGetProductAllergens(id));
  }
);

app.put(
  "/api/admin/products/:id/allergens",
  requireAdminSession,
  (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "ID invalide." });
    }
    const codes = Array.isArray(req.body?.codes) ? req.body.codes : [];
    const result = adminSetProductAllergens(id, codes);
    if (!result.ok) {
      if (result.reason === "product_not_found") {
        return res.status(404).json({ error: "Produit introuvable." });
      }
      return res.status(400).json({ error: "Impossible de sauvegarder." });
    }
    return res.json({
      updated: true,
      inserted: result.inserted,
      unknown: result.unknown,
    });
  }
);

// ─── Admin Traductions (CRUD) ───────────────────────────────────────

app.get(
  "/api/admin/products/:id/translations",
  requireAdminSession,
  (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "ID invalide." });
    }
    return res.json(adminGetProductTranslations(id));
  }
);

app.put(
  "/api/admin/products/:id/translations/:lang",
  requireAdminSession,
  (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "ID invalide." });
    }
    const lang = String(req.params.lang || "").toLowerCase();
    if (!["fr", "en"].includes(lang)) {
      return res.status(400).json({ error: "Langue non supportée." });
    }
    const result = adminSetProductTranslation(id, lang, req.body || {});
    if (!result.ok) {
      if (result.reason === "product_not_found") {
        return res.status(404).json({ error: "Produit introuvable." });
      }
      return res.status(400).json({ error: "Impossible de sauvegarder." });
    }
    return res.json({ updated: true, deleted: !!result.deleted });
  }
);

// ─── Admin Fiches enrichies (CRUD) ──────────────────────────────────

app.get(
  "/api/admin/products/:id/sheet",
  requireAdminSession,
  (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "ID invalide." });
    }
    const sheet = adminGetProductSheet(id);
    return res.json(sheet || {});
  }
);

app.put(
  "/api/admin/products/:id/sheet",
  requireAdminSession,
  (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "ID invalide." });
    }
    const result = adminSetProductSheet(id, req.body || {});
    if (!result.ok) {
      if (result.reason === "product_not_found") {
        return res.status(404).json({ error: "Produit introuvable." });
      }
      return res.status(400).json({ error: "Impossible de sauvegarder." });
    }
    return res.json({ updated: true });
  }
);

// ─── Admin Synchro JDC ──────────────────────────────────────────────

app.get("/api/admin/jdc-sync/status", requireAdminSession, (_req, res) => {
  res.json(getJdcSyncStatus());
});

app.post("/api/admin/jdc-sync/run", requireAdminSession, async (_req, res) => {
  const result = await runJdcSync({ source: "admin" });
  if (!result.ok) {
    return res.status(502).json({
      error: result.error || "Échec de la synchronisation JDC.",
      lastSync: result.lastSync,
    });
  }
  return res.json({ ok: true, lastSync: result.lastSync });
});

app.get("/api/admin/jdc-sync/catalog", requireAdminSession, async (_req, res) => {
  try {
    const products = await fetchJdcCatalog();
    res.json({ count: products.length, products });
  } catch (err) {
    res.status(502).json({ error: err?.message || "Impossible de récupérer le catalogue JDC." });
  }
});

// Mapping catégories JDC → catégories site + mode (jdc / site) par catégorie site.
app.get("/api/admin/jdc-sync/category-mappings", requireAdminSession, (_req, res) => {
  res.json({
    mappings: getJdcCategoryMappings(),
    site_categories: listSiteCategoriesWithMode(),
  });
});

app.put(
  "/api/admin/jdc-sync/category-mappings/:jdcCategoryId",
  requireAdminSession,
  (req, res) => {
    const { jdcCategoryId } = req.params;
    const { jdc_category_name, site_category_id } = req.body || {};
    const result = upsertJdcCategoryMapping(
      jdcCategoryId,
      jdc_category_name,
      site_category_id
    );
    if (!result.ok) {
      const code = result.reason === "site_category_not_found" ? 404 : 400;
      return res.status(code).json({ error: result.reason });
    }
    return res.json({ ok: true });
  }
);

app.put(
  "/api/admin/categories/:id/managed-by",
  requireAdminSession,
  (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "ID invalide." });
    const result = setCategoryManagedBy(id, req.body?.managed_by);
    if (!result.ok) {
      const code = result.reason === "category_not_found" ? 404 : 400;
      return res.status(code).json({ error: result.reason });
    }
    return res.json({ ok: true });
  }
);

// ─── Admin POS mapping (PUT) ────────────────────────────────────────

app.put("/api/admin/pos-mapping/:id", requireAdminSession, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "ID invalide." });
  }
  const result = adminUpdatePosMapping(id, req.body || {});
  if (!result.ok) {
    if (result.reason === "pos_not_found") {
      return res.status(404).json({ error: "Ligne POS introuvable." });
    }
    if (result.reason === "product_not_found") {
      return res.status(400).json({ error: "Produit cible introuvable." });
    }
    if (result.reason === "produit_already_mapped") {
      return res.status(409).json({
        error: "Ce produit est déjà la cible d'un autre mapping.",
      });
    }
    return res.status(400).json({ error: "Impossible de sauvegarder." });
  }
  return res.json({ updated: true });
});

app.post("/api/newsletter/subscribe", newsletterLimiter, (req, res) => {
  const { email } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Adresse email invalide",
    });
  }

  if (isNewsletterSubscribed(email)) {
    return res.status(409).json({
      success: false,
      message: "Cet email est déjà inscrit à la newsletter",
    });
  }

  const result = addNewsletterSubscriber(email);
  if (!result.inserted) {
    return res.status(409).json({
      success: false,
      message: "Cet email est déjà inscrit à la newsletter",
    });
  }

  console.log("Nouvelle inscription newsletter enregistrée");
  res.json({
    success: true,
    message: "Inscription réussie ! Merci de votre intérêt.",
  });
});

app.get("/api/newsletter/subscribers", requireAdminSession, (req, res) => {
  const subscribers = listNewsletterSubscribers();
  res.json({
    count: subscribers.length,
    subscribers: subscribers.map((s) => s.email),
  });
});

// Servir le frontend buildé (optionnel : pour accès via IP de la box)
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(frontendDist)) {
  // URL canonique propre: si ?v=... est présent, on le supprime
  app.get("/", (req, res, next) => {
    if (req.query.v) {
      return res.redirect(301, "/");
    }
    return next();
  });
  // Fichiers statiques : cache long pour les assets hashés (JS, CSS), pas de cache pour index.html
  app.use(
    express.static(frontendDist, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        } else {
          // Assets hashés (JS, CSS, images) : cache 1 an (le hash change à chaque build)
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );
  // SPA fallback anti "soft 404":
  // - routes frontend connues => index.html en 200
  // - routes inconnues => index.html en 404 (la page NotFound React s'affiche, et le statut HTTP reste correct pour Google)
  app.use((req, res, next) => {
    if ((req.method === "GET" || req.method === "HEAD") && !req.path.startsWith("/api")) {
      // Si l'URL ressemble à un fichier statique manquant (ex: .js/.css/.png), on renvoie un 404 direct.
      if (path.extname(req.path)) {
        return res.status(404).end();
      }

      const isKnownRoute = isValidSpaRoute(req.path);
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      return res.status(isKnownRoute ? 200 : 404).sendFile(path.join(frontendDist, "index.html"));
    } else {
      next();
    }
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API mock soup & juice sur http://localhost:${PORT}`);
  console.log(`Accessible depuis le réseau sur http://0.0.0.0:${PORT}`);
  startJdcSyncScheduler();
});



