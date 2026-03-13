import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import multer from "multer";
import session from "express-session";
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
} from "./db.js";
import { sendContactEmail } from "./mail.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

// Identifiants actuels du back-office.
// Pour les modifier, change simplement ces valeurs et redémarre le serveur.
const ADMIN_USER = "Soupandjuice";
const ADMIN_PASSWORD = "wU48wJ29";
const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || "change-this-session-secret";

if (process.env.NODE_ENV === "production") {
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
app.use(cors());
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
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 30,
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

function requireAdminSession(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
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

app.post("/admin/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect("/admin");
  }
  return res.redirect("/admin/login?error=1");
});

app.post("/admin/logout", (req, res) => {
  req.session?.destroy(() => {
    res.redirect("/");
  });
});

app.get("/api/promos", (_, res) => res.json(getActivePromos()));
app.get("/api/stores", (_, res) => res.json(getStores()));

app.get("/api/allergenes", (_, res) => res.json(getAllergenes()));

app.get("/api/allergenes/products", (_, res) => res.json(getAllProductAllergens()));

app.get("/api/products/:id/allergenes", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "ID invalide" });
  res.json(getAllergensForProduct(id));
});

app.post("/api/contact", async (req, res) => {
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

  console.log("---- Nouveau message de contact (DB) ----");
  console.log({ id, ...storedMessage });

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

// (Optionnel) route d'admin pour lister les derniers messages
app.get("/api/contact/messages", (req, res) => {
  const limit = Number(req.query.limit) || 100;
  const safeLimit = Number.isFinite(limit) && limit > 0 && limit <= 500 ? limit : 100;
  const messages = listContactMessages(safeLimit);
  res.json({ count: messages.length, messages });
});

app.get("/api/products/visibility", (_, res) => {
  const visibleIds = getVisibleProductIds();
  res.json({ visibleIds, lastSync: null });
});

app.get("/api/products", (_, res) => {
  const products = getAllProductsForApi();
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

app.post("/api/newsletter/subscribe", (req, res) => {
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

  console.log(`Nouvel abonné newsletter: ${email}`);
  res.json({
    success: true,
    message: "Inscription réussie ! Merci de votre intérêt.",
  });
});

app.get("/api/newsletter/subscribers", (req, res) => {
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
});



