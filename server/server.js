import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import multer from "multer";
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

// ─── Auth basique pour l'admin ─────────────────────────────────────────

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-me";

function adminAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme !== "Basic" || !encoded) {
    res.setHeader("WWW-Authenticate", 'Basic realm="admin"');
    return res.status(401).send("Authentification requise");
  }

  let decoded = "";
  try {
    decoded = Buffer.from(encoded, "base64").toString("utf8");
  } catch {
    res.setHeader("WWW-Authenticate", 'Basic realm="admin"');
    return res.status(401).send("Identifiants invalides");
  }

  const idx = decoded.indexOf(":");
  const username = decoded.slice(0, idx);
  const password = decoded.slice(idx + 1);

  if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
    return next();
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="admin"');
  return res.status(401).send("Identifiants invalides");
}

if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://esm.sh", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://basemaps.cartocdn.com", "https://*.basemaps.cartocdn.com", "https://*.tile.openstreetmap.org"],
      connectSrc: ["'self'", "https://basemaps.cartocdn.com", "https://*.basemaps.cartocdn.com", "https://*.tile.openstreetmap.org", "https://deliveroo.fr"],
      mediaSrc: ["'self'", "blob:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      workerSrc: ["'self'", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors());
app.use(express.json());
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

app.get("/admin", adminAuth, (req, res) => {
  const adminHtml = path.join(__dirname, "admin.html");
  if (fs.existsSync(adminHtml)) {
    return res.sendFile(adminHtml);
  }
  return res
    .status(500)
    .send("Fichier admin.html manquant côté serveur.");
});

app.get("/api/admin/categories", adminAuth, (req, res) => {
  const categories = adminListCategories();
  res.json(categories);
});

app.get("/api/admin/products", adminAuth, (req, res) => {
  const products = adminListProducts();
  res.json(products);
});

app.post(
  "/api/admin/upload-image",
  adminAuth,
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }
    const url = `/uploads/products/${req.file.filename}`;
    return res.status(201).json({ url, filename: req.file.filename });
  }
);

app.post("/api/admin/products", adminAuth, (req, res) => {
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

app.put("/api/admin/products/:id", adminAuth, (req, res) => {
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

app.delete("/api/admin/products/:id", adminAuth, (req, res) => {
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



