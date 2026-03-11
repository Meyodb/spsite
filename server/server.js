import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { saveContactMessage, listContactMessages } from "./db.js";
import { sendContactEmail } from "./mail.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

const menu = {
  soups: [
    { id: 1, name: "Soupe courge coco", price: 8.9, tags: ["chaud", "vegan"] },
    { id: 2, name: "Miso shiitake", price: 7.9, tags: ["chaud"] },
    { id: 3, name: "Gaspacho verde", price: 6.9, tags: ["froid", "detox"] },
  ],
  juices: [
    { id: 11, name: "Jus vert boost", price: 6.5, tags: ["detox", "energie"] },
    { id: 12, name: "Antioxydant rouge", price: 6.7, tags: ["immunite"] },
    { id: 13, name: "Sunrise agrumes", price: 6.2, tags: ["vitamine C"] },
  ],
  combos: [
    { id: 21, name: "Combo midi", price: 13.9, includes: ["soupe", "jus"] },
    { id: 22, name: "Pack énergie", price: 15.5, includes: ["jus", "jus"] },
  ],
};

const promos = [
  { title: "-15% combos midi", description: "Du lundi au vendredi", code: "MIDI15" },
  { title: "Livraison offerte > 35€", description: "Paris intramuros" },
];

const stores = [
  { city: "Paris", address: "12 rue des Soupes", hours: "9h-21h", services: ["click&collect", "terrasse"] },
  { city: "Lyon", address: "5 quai des Jus", hours: "9h-20h", services: ["click&collect"] },
];

app.use(express.json());

// Stockage temporaire des emails (en production, utilisez une base de données)
const newsletterSubscribers = [];

const visibilityPath = path.join(__dirname, "data", "visible-products.json");
const productsPath = path.join(__dirname, "data", "products-soup-juice.json");

app.get("/api/menu", (_, res) => res.json(menu));
app.get("/api/promos", (_, res) => res.json(promos));
app.get("/api/stores", (_, res) => res.json(stores));

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

// Visibilité des produits : utilisé par la page Nos produits. Si visible-products.json n'existe pas, tous les produits sont visibles.
app.get("/api/products/visibility", (_, res) => {
  try {
    const raw = fs.readFileSync(visibilityPath, "utf8");
    const data = JSON.parse(raw);
    res.json({ visibleIds: data.visibleIds || [], lastSync: data.lastSync ?? null });
  } catch (err) {
    if (err.code === "ENOENT") {
      try {
        const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));
        const allIds = Array.isArray(products) ? products.map((p) => p.id) : [];
        return res.json({ visibleIds: allIds, lastSync: null });
      } catch (_) {
        return res.json({ visibleIds: [], lastSync: null });
      }
    }
    res.status(500).json({ error: "Erreur lecture visibilité produits" });
  }
});

// Route pour s'inscrire à la newsletter
app.post("/api/newsletter/subscribe", (req, res) => {
  const { email } = req.body;

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: "Adresse email invalide" 
    });
  }

  // Vérifier si l'email existe déjà
  if (newsletterSubscribers.includes(email)) {
    return res.status(409).json({ 
      success: false, 
      message: "Cet email est déjà inscrit à la newsletter" 
    });
  }

  // Ajouter l'email à la liste
  newsletterSubscribers.push(email);
  
  console.log(`Nouvel abonné à la newsletter: ${email}`);
  console.log(`Total d'abonnés: ${newsletterSubscribers.length}`);

  // ICI: Vous pouvez ajouter l'intégration avec un service d'email marketing
  // Exemples:
  // - Mailchimp API
  // - SendGrid API
  // - Brevo (ex-Sendinblue) API
  // - Envoyer un email de confirmation via nodemailer

  res.json({ 
    success: true, 
    message: "Inscription réussie ! Merci de votre intérêt." 
  });
});

// Route pour obtenir la liste des abonnés (optionnel, pour l'admin)
app.get("/api/newsletter/subscribers", (req, res) => {
  res.json({ 
    count: newsletterSubscribers.length,
    subscribers: newsletterSubscribers 
  });
});

// Servir le frontend buildé (optionnel : pour accès via IP de la box)
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(frontendDist)) {
  // Redirection / vers /?v=timestamp pour forcer le rechargement (cache busting)
  // La version = mtime de index.html, change à chaque build
  app.get("/", (req, res, next) => {
    if (req.query.v) return next();
    const indexPath = path.join(frontendDist, "index.html");
    const version = fs.statSync(indexPath).mtime.getTime();
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    return res.redirect(302, `/?v=${version}`);
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
  // SPA : toute requête GET non-API renvoie index.html (sans cache)
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.sendFile(path.join(frontendDist, "index.html"));
    } else {
      next();
    }
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API mock soup & juice sur http://localhost:${PORT}`);
  console.log(`Accessible depuis le réseau sur http://0.0.0.0:${PORT}`);
});



