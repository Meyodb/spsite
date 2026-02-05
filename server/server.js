import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

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

app.get("/api/menu", (_, res) => res.json(menu));
app.get("/api/promos", (_, res) => res.json(promos));
app.get("/api/stores", (_, res) => res.json(stores));

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
  app.use(express.static(frontendDist));
  // SPA : toute requête GET non-API renvoie index.html
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
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



