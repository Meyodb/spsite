import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import fs from "fs";
import { PRODUCTS as FRONT_PRODUCTS } from "../frontend/src/data/productsData.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "soupjuice.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── Nettoyage tables obsolètes ─────────────────────────────────────

db.exec("DROP TABLE IF EXISTS menu_item");
db.exec("DROP TABLE IF EXISTS restaurant_service");

// ─── Migrations ─────────────────────────────────────────────────────

let produitCols = db.pragma("table_info(produit)").map((c) => c.name);
if (produitCols.includes("active")) {
  db.exec(`
    UPDATE produit SET visible = active WHERE active = 0 AND visible = 1;
    ALTER TABLE produit DROP COLUMN active;
  `);
  produitCols = db.pragma("table_info(produit)").map((c) => c.name);
}

if (!produitCols.includes("image_url")) {
  db.exec(`ALTER TABLE produit ADD COLUMN image_url TEXT;`);
  produitCols = db.pragma("table_info(produit)").map((c) => c.name);
}

if (!produitCols.includes("image_alt")) {
  db.exec(`ALTER TABLE produit ADD COLUMN image_alt TEXT;`);
}

// ─── Schema ──────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    label_fr TEXT,
    label_en TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS produit (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    subcategory TEXT,
    price REAL,
    volume TEXT,
    description TEXT,
    extra_price REAL,
    extra_price_label TEXT,
    visible INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE RESTRICT ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS restaurant (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    address TEXT NOT NULL,
    coordinates_lng REAL,
    coordinates_lat REAL,
    hours TEXT,
    phone TEXT,
    quartier TEXT,
    description TEXT,
    deliveroo_url TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS promo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    code TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    start_date TEXT,
    end_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS newsletter_subscriber (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT (datetime('now')),
    unsubscribed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sujet TEXT NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT NOT NULL,
    entreprise TEXT,
    fonction TEXT,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT
  );

  CREATE TABLE IF NOT EXISTS allergene (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    label_fr TEXT NOT NULL,
    label_en TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS produit_allergene (
    produit_id INTEGER NOT NULL,
    allergene_id INTEGER NOT NULL,
    PRIMARY KEY (produit_id, allergene_id),
    FOREIGN KEY (produit_id) REFERENCES produit(id) ON DELETE CASCADE,
    FOREIGN KEY (allergene_id) REFERENCES allergene(id) ON DELETE CASCADE
  );
`);

// ─── Seed ────────────────────────────────────────────────────────────

const PRODUCT_CATEGORY_MAP = {
  1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 221: 1,
  73: 2, 74: 2, 185: 2, 190: 2, 195: 2, 211: 2,
  26: 3, 27: 3, 28: 3, 39: 3, 42: 3, 43: 3, 77: 3, 78: 3, 79: 3,
  80: 3, 81: 3, 82: 3, 83: 3, 84: 3, 85: 3, 86: 3, 87: 3, 88: 3,
  89: 3, 91: 3, 92: 3, 93: 3, 94: 3,
  29: 4, 30: 4, 31: 4, 32: 4, 95: 4, 96: 4, 97: 4, 98: 4, 99: 4,
  100: 4, 101: 4, 102: 4, 103: 4, 104: 4, 105: 4, 106: 4, 107: 4,
  108: 4, 146: 4, 147: 4,
  33: 5, 34: 5, 35: 5, 36: 5, 37: 5, 38: 5, 109: 5, 111: 5,
  113: 5, 114: 5, 115: 5, 116: 5, 117: 5, 118: 5, 119: 5, 142: 5,
  15: 6, 16: 6, 17: 6, 18: 6, 19: 6, 20: 6, 21: 6,
  9: 7, 10: 7, 11: 7, 12: 7, 13: 7, 14: 7, 25: 7,
  44: 8, 45: 8, 47: 8, 48: 8, 49: 8, 50: 8, 51: 8, 52: 8,
  65: 8, 66: 8, 67: 8, 68: 8, 69: 8, 70: 8, 123: 8, 124: 8,
  128: 8, 129: 8, 130: 8, 131: 8, 132: 8, 133: 8,
  23: 9, 24: 9, 60: 9, 61: 9, 62: 9, 63: 9, 75: 9, 76: 9,
  141: 10, 143: 10, 144: 10,
};

const PRODUCT_DETAILS = {
  1:  { price: 5.80, volume: "47 cl", description: "Ananas, orange, citron vert, menthe" },
  2:  { price: 5.80, volume: "47 cl", description: "Açaï, orange, fraise, kiwi" },
  3:  { price: 5.80, volume: "47 cl", description: "Pomme, citron, gingembre" },
  9:  { price: 1.00, volume: null,    description: "Macro et micronutriments, complément alimentaire" },
  10: { price: 1.00, volume: null,    description: "Bon pour la santé digestive et hépatique" },
};

const VISIBLE_PRODUCT_IDS = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 221,
  73, 74, 185, 190, 195, 211,
  26, 27, 28, 42, 43, 78, 91, 93, 94,
  30, 31, 32, 99, 146, 147,
  33, 35, 38, 109, 111, 119, 142,
  15, 16, 17, 18, 19, 20, 21,
  9, 10, 11, 12, 13, 14, 25,
  44, 45, 47, 48, 49, 50, 51, 52, 65, 66, 67, 68, 69, 70, 123, 124, 128, 129, 130, 131, 132, 133,
  23, 24, 60, 61, 62, 63, 75, 76,
  141, 143, 144,
]);

const ALLERGENES_SEED = [
  ["gluten",       "Gluten",          "Gluten",      1],
  ["crustaces",    "Crustacés",       "Crustaceans", 2],
  ["oeufs",        "Œufs",            "Eggs",        3],
  ["poissons",     "Poissons",        "Fish",        4],
  ["arachides",    "Arachides",       "Peanuts",     5],
  ["soja",         "Soja",            "Soy",         6],
  ["lait",         "Lait",            "Milk",        7],
  ["fruitsacoque", "Fruits à coque",  "Tree nuts",   8],
  ["celeri",       "Céleri",          "Celery",      9],
  ["moutarde",     "Moutarde",        "Mustard",     10],
  ["sesame",       "Sésame",          "Sesame",      11],
  ["sulfites",     "Sulfites",        "Sulphites",   12],
  ["lupin",        "Lupin",           "Lupin",       13],
  ["mollusques",   "Mollusques",      "Molluscs",    14],
];

const ALLERGEN_BY_PRODUCT = {
  "CABILLAUD TERIYAKI": ["gluten", "poissons", "soja", "sesame"],
  "POULET KORMA": ["oeufs", "soja", "lait"],
  "POULET QUINOA TANDOORI": ["soja", "lait"],
  "POULET TIKKA MASSALA": ["gluten", "oeufs", "soja", "lait", "fruitsacoque"],
  "LASAGNE BOLOGNESE": ["gluten", "lait", "fruitsacoque"],
  "POULET BOMBAY": ["oeufs", "soja", "lait", "celeri", "moutarde"],
  "POULET CURRY": ["oeufs", "soja"],
  "ROUGAIL THON": ["poissons"],
  "SAUMON SAUCE CITRON GINGEMBRE": ["poissons", "lait", "fruitsacoque"],
  "LASAGNE VEGAN": ["gluten", "soja", "fruitsacoque"],
  "DUO DE RIZ AUBERGINES FALAFEL": ["gluten", "moutarde", "sulfites"],
  "FAGOTTINI": ["gluten", "oeufs", "lait"],
  "QUICHE LORRAINE": ["gluten", "oeufs", "lait", "fruitsacoque"],
  "QUICHE RICOTTA TOMATO CERISE": ["gluten", "oeufs", "lait"],
  "TARTE SAUMON ÉPINARDS": ["gluten", "oeufs", "poissons", "lait", "fruitsacoque"],
  "TARTE CHÈVRE ÉPINARDS": ["gluten", "oeufs", "lait", "fruitsacoque", "sesame"],
  "POULET TIKKA": ["gluten", "oeufs", "soja", "lait", "fruitsacoque"],
  "TIKKA VÉGÉTARIEN": ["gluten", "soja", "lait"],
  "COUSCOUS POULET": ["gluten"],
  "TORTELLINI PESTO ROUGE": ["gluten", "lait", "fruitsacoque"],
  "QUICHE CHÈVRE ÉPINARDS": ["gluten", "oeufs", "lait", "fruitsacoque", "sesame"],
  "QUICHE PATATE DOUCE FETA": ["gluten", "oeufs", "lait"],
  "SOUPE JAPONAISE": ["gluten", "soja", "poissons"],
  "SALADE POWERFUL": ["gluten", "lait", "soja", "fruitsacoque"],
  "GRANDE BUDDHA BOWL": ["gluten", "lait"],
  "SALADE RISONI PESTO": ["gluten", "lait"],
  "SALADE CHOUX ROUGE": ["gluten", "lait", "fruitsacoque", "sesame"],
  "SALADE DE BETTERAVES": ["lait", "sesame"],
  "SALADE ÉPEAUTRE": ["gluten", "lait"],
  "SALADE LENTILLE ŒUF POCHÉ": ["oeufs", "moutarde"],
  "GRANDE SALADE LENTILLE ŒUF POCHÉ": ["oeufs", "lait", "moutarde"],
  "SALADE RISONI": ["gluten", "lait"],
  "SALADE SAUMON GRAVLAX": ["gluten", "poissons", "celeri", "moutarde", "sulfites"],
  "SALADE LENTILLE SAUMON": ["moutarde"],
  "SALADE POULET CAJUN & MANGUE": ["gluten", "soja", "lait", "moutarde"],
  "SALADE BOLLYWOOD": ["gluten", "soja", "lait", "sulfites"],
  "QUINOA & ÉCREVISSES": ["crustaces"],
  "QUINOA & HALLOUMI": ["gluten", "lait"],
  "RIZ NOIR & ÉCREVISSES": ["crustaces"],
  "SALADE RIZ NOIR PATATE DOUCE BACON": ["lait"],
  "SALADE RIZ NOIR TAPENADE DE THON": ["poissons", "celeri", "oeufs", "moutarde", "lait"],
  "SALADE LOW CARB": ["moutarde", "oeufs", "lait", "fruitsacoque"],
  "SALADE SUSHI": ["oeufs", "poissons", "soja", "moutarde", "sesame"],
  "WRAP CAJUN": ["gluten"],
  "WRAP CHAUD MEXICAIN": ["gluten", "lait"],
  "WRAP CHAUD HOUMOUS FALAFEL": ["gluten", "sesame"],
  "WRAP POULET RAS EL HANOUT": ["gluten"],
  "BAGEL NEW YORK": ["gluten", "lait", "sesame"],
  "BAGEL CHÈVRE": ["gluten", "lait"],
  "WRAP RAS EL HANOUT": ["gluten", "lait", "sesame"],
  "WRAP FETA (VÉGÉTARIEN)": ["gluten", "lait"],
  "WRAP THON": ["gluten", "oeufs", "poissons", "lait", "celeri", "moutarde"],
  "WRAP SAUMON": ["gluten", "oeufs", "poissons", "moutarde"],
  "BAGEL SAUMON": ["gluten", "lait", "sesame"],
  "BAGEL HOLLAND STYLE": ["gluten", "lait", "sesame"],
  "BAGEL MOZZARELLA": ["gluten", "lait", "sesame"],
  "BAGEL PASTRAMI": ["gluten", "oeufs", "lait", "moutarde", "sesame"],
  "BAGEL DINDE & CHEDDAR": ["gluten", "lait", "moutarde", "sesame"],
  "BATBOUT THON": ["gluten", "poissons"],
  "CHAMPIGNONS": ["gluten", "soja", "celeri"],
  "CAROTTES POMMES ET CURRY": ["gluten", "soja"],
  "CAROTTE PAVOT": ["gluten", "soja", "celeri"],
  "LENTILLES À L'INDIENNE": ["gluten", "soja"],
  "ÉPINARD FETA": ["gluten", "soja", "lait", "celeri"],
  "POTIMARRON": ["celeri"],
  "PERLES CHIA FRAMBOISE": [],
  "PERLES CHIA MANGUE PASSION": ["lait"],
  "CAKE CAROTTE": ["gluten", "oeufs"],
  "CAKE CHOCOLAT EXTREME": ["gluten", "oeufs", "lait"],
  "CAKE CITRON PAVOT": ["gluten", "oeufs", "lait"],
  "CAKE MARBRÉ CHOCOLAT": ["gluten", "oeufs", "lait"],
  "CAKE POMME NOIX": ["gluten", "oeufs", "fruitsacoque"],
  "CAKE BANANE": ["gluten", "oeufs", "fruitsacoque"],
  "TARTE CITRON MERINGUÉE": ["gluten", "oeufs", "lait", "fruitsacoque"],
  "CHEESECAKE KEYLIME": ["gluten", "oeufs", "lait"],
  "TARTE MYRTILLE": ["gluten", "oeufs", "lait"],
  "CHEESECAKE FRUITS ROUGES": ["gluten", "oeufs", "lait"],
};

const RESTAURANTS_SEED = [
  {
    id: 1, name: "SOUP & JUICE ST LAZARE", slug: "st-lazare",
    address: "4 Rue de Londres, 75008 Paris",
    lng: 2.33046, lat: 48.87678,
    hours: "Lundi - Vendredi: 9h00 - 15h00", phone: null,
    quartier: "Quartier Saint-Lazare – 8ème arrondissement",
    description: "Au cœur du quartier Saint-Lazare, à deux pas de la gare et des grands magasins du boulevard Haussmann, notre restaurant vous accueille dans un cadre lumineux et apaisant.",
    deliveroo_url: null,
  },
  {
    id: 2, name: "SOUP & JUICE BOURSE", slug: "bourse",
    address: "135 Rue Montmartre, 75002 Paris",
    lng: 2.34470, lat: 48.86575,
    hours: "Lundi - Vendredi: 9h00 - 15h00", phone: null,
    quartier: "Quartier de la Bourse – 2ème arrondissement",
    description: "Installé rue Montmartre au cœur du 2ème arrondissement, entre la Bourse et les Grands Boulevards, ce restaurant est le repaire idéal des travailleurs du quartier.",
    deliveroo_url: null,
  },
  {
    id: 3, name: "SOUP & JUICE HAUSSMANN", slug: "haussmann",
    address: "23 Rue Taitbout, 75009 Paris",
    lng: 2.33527, lat: 48.87312,
    hours: "Lundi - Vendredi: 9h00 - 15h00", phone: null,
    quartier: "Quartier Haussmann – 9ème arrondissement",
    description: "Niché rue Taitbout dans le 9ème arrondissement, à quelques pas de l'Opéra et des Galeries Lafayette, ce restaurant offre une oasis de fraîcheur.",
    deliveroo_url: null,
  },
  {
    id: 4, name: "SOUP & JUICE ÉCURIES", slug: "ecuries",
    address: "7 Rue des Petites Écuries, 75010 Paris",
    lng: 2.35344, lat: 48.87306,
    hours: "Lundi - Vendredi: 9h00 - 15h00", phone: null,
    quartier: "Quartier des Petites Écuries – 10ème arrondissement",
    description: "Dans la charmante rue des Petites Écuries, au cœur du 10ème arrondissement, ce restaurant allie l'énergie créative du quartier à notre cuisine healthy.",
    deliveroo_url: null,
  },
  {
    id: 5, name: "SOUP & JUICE ÉTOILE", slug: "etoile",
    address: "54 Avenue Kléber, 75016 Paris",
    lng: 2.29115, lat: 48.86880,
    hours: "Lundi - Vendredi: 9h00 - 15h00", phone: null,
    quartier: "Quartier de l'Étoile – 16ème arrondissement",
    description: "Avenue Kléber, à quelques pas de l'Arc de Triomphe et de la place de l'Étoile, notre restaurant vous propose une expérience culinaire healthy.",
    deliveroo_url: null,
  },
  {
    id: 6, name: "SOUP & JUICE OPÉRA", slug: "opera",
    address: "24 Rue du 4 septembre, 75002 Paris",
    lng: 2.33515, lat: 48.86994,
    hours: "Lundi - Vendredi: 9h00 - 15h00", phone: null,
    quartier: "Quartier de l'Opéra – 2ème arrondissement",
    description: "Rue du 4 Septembre, en plein cœur du quartier de l'Opéra, ce restaurant est le point de rendez-vous des actifs du 2ème arrondissement.",
    deliveroo_url: null,
  },
  {
    id: 7, name: "SOUP & JUICE NEUILLY", slug: "neuilly",
    address: "38 Rue Ybry, 92200 Neuilly-sur-Seine",
    lng: 2.26032, lat: 48.88753,
    hours: "Lundi - Vendredi: 9h00 - 15h00", phone: "06 37 79 03 01",
    quartier: "Neuilly-sur-Seine – Hauts-de-Seine",
    description: "Notre restaurant de Neuilly-sur-Seine, rue Ybry, est idéalement situé entre le Bois de Boulogne et la Seine. Livraison possible via Deliveroo !",
    deliveroo_url: "https://deliveroo.fr/fr/menu/paris/neuilly-sur-seine/soup-and-juice-neuilly",
  },
  {
    id: 8, name: "SOUP & JUICE HONORÉ", slug: "honore",
    address: "38 Rue de Berri, 75008 Paris",
    lng: 2.30700, lat: 48.87390,
    hours: "Lundi - Vendredi: 9h00 - 15h00", phone: null,
    quartier: "Quartier des Champs-Élysées – 8ème arrondissement",
    description: "Rue de Berri, à deux pas des Champs-Élysées et de l'avenue George V, ce restaurant se trouve dans l'un des quartiers d'affaires les plus prestigieux de la capitale.",
    deliveroo_url: null,
  },
  {
    id: 9, name: "SOUP & JUICE MADELEINE", slug: "madeleine",
    address: "24 Rue d'Anjou, 75008 Paris",
    lng: 2.32175, lat: 48.87125,
    hours: "Lundi - Vendredi: 9h00 - 15h00", phone: null,
    quartier: "Quartier de la Madeleine – 8ème arrondissement",
    description: "Rue d'Anjou, dans le prestigieux quartier de la Madeleine, notre restaurant est niché entre la place de la Madeleine et le boulevard Haussmann.",
    deliveroo_url: null,
  },
];

function seedIfEmpty() {
  const { c } = db.prepare("SELECT COUNT(*) AS c FROM category").get();
  if (c > 0) return;

  db.transaction(() => {
    const insertCat = db.prepare(
      "INSERT INTO category (code, label_fr, label_en, sort_order) VALUES (?, ?, ?, ?)"
    );
    for (const row of [
      ["JUS",          "Jus",          "Juices",     1],
      ["SOUPES",       "Soupes",       "Soups",      2],
      ["PLATS CHAUDS", "Plats chauds", "Hot meals",  3],
      ["SALADES",      "Salades",      "Salads",     4],
      ["SANDWICH",     "Sandwichs",    "Sandwiches", 5],
      ["MILKSHAKES",   "Milkshakes",   "Milkshakes", 6],
      ["BOOSTERS",     "Boosters",     "Boosters",   7],
      ["DESSERTS",     "Desserts",     "Desserts",   8],
      ["BOISSONS",     "Boissons",     "Drinks",     9],
      ["GOODIES",      "Goodies",      "Goodies",    10],
    ]) insertCat.run(...row);

    const productsPath = path.join(dataDir, "products-soup-juice.json");
    let products = [];
    try {
      products = JSON.parse(fs.readFileSync(productsPath, "utf8"));
    } catch { /* no JSON file — skip product seed */ }

    const insertProduct = db.prepare(
      `INSERT OR IGNORE INTO produit (id, name, category_id, price, volume, description, visible, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const catId = PRODUCT_CATEGORY_MAP[p.id] ?? 1;
      const details = PRODUCT_DETAILS[p.id];
      insertProduct.run(
        p.id,
        p.name,
        catId,
        details?.price ?? null,
        details?.volume ?? null,
        details?.description ?? null,
        VISIBLE_PRODUCT_IDS.has(p.id) ? 1 : 0,
        i,
      );
    }

    const insertRest = db.prepare(
      `INSERT INTO restaurant (id, name, slug, address, coordinates_lng, coordinates_lat, hours, phone, quartier, description, deliveroo_url, active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
    );
    for (let i = 0; i < RESTAURANTS_SEED.length; i++) {
      const r = RESTAURANTS_SEED[i];
      insertRest.run(r.id, r.name, r.slug, r.address, r.lng, r.lat, r.hours, r.phone, r.quartier, r.description, r.deliveroo_url, i);
    }
    const insertAllergene = db.prepare(
      "INSERT INTO allergene (code, label_fr, label_en, sort_order) VALUES (?, ?, ?, ?)"
    );
    for (const row of ALLERGENES_SEED) insertAllergene.run(...row);

    const allergenIdByCode = Object.fromEntries(
      db.prepare("SELECT code, id FROM allergene").all().map((r) => [r.code, r.id])
    );
    const productIdByName = Object.fromEntries(
      db.prepare("SELECT name, id FROM produit").all().map((r) => [r.name, r.id])
    );
    const insertPA = db.prepare(
      "INSERT OR IGNORE INTO produit_allergene (produit_id, allergene_id) VALUES (?, ?)"
    );
    for (const [productName, allergenCodes] of Object.entries(ALLERGEN_BY_PRODUCT)) {
      const pid = productIdByName[productName];
      if (!pid) continue;
      for (const code of allergenCodes) {
        const aid = allergenIdByCode[code];
        if (aid) insertPA.run(pid, aid);
      }
    }
  })();

  console.log("Base de données initialisée avec les données de seed.");
}

seedIfEmpty();

// Synchronise détails des produits avec la config frontend
// (PRODUCTS dans frontend/src/data/productsData.js) pour que l'admin voie les bons prix
// et que l'API /api/products ait des données complètes même avant usage du back-office.
function syncProductDetailsFromFrontend() {
  try {
    const update = db.prepare(
      `
      UPDATE produit
      SET
        price = @price,
        volume = @volume,
        description = @description,
        subcategory = @subcategory,
        extra_price_label = @extra_price_label
      WHERE id = @id
    `
    );

    for (const p of FRONT_PRODUCTS) {
      const price =
        p.price === undefined || p.price === null || p.price === ""
          ? null
          : Number(String(p.price).replace(",", "."));
      const volume = p.volume || null;
      const description = p.description || null;
      const subcategory = p.subCategory || null;
      const extraPriceLabel = p.extraPrice || null;

      update.run({
        id: p.id,
        price,
        volume,
        description,
        subcategory,
        extra_price_label: extraPriceLabel,
      });
    }
  } catch (err) {
    console.error("Erreur syncProductDetailsFromFrontend:", err);
  }
}

syncProductDetailsFromFrontend();

// ─── Allergènes ──────────────────────────────────────────────────────

export function getAllergenes() {
  return db
    .prepare("SELECT id, code, label_fr, label_en FROM allergene ORDER BY sort_order")
    .all();
}

export function getAllergensForProduct(produitId) {
  return db
    .prepare(`
      SELECT a.code, a.label_fr, a.label_en
      FROM produit_allergene pa
      JOIN allergene a ON a.id = pa.allergene_id
      WHERE pa.produit_id = ?
      ORDER BY a.sort_order
    `)
    .all(produitId);
}

export function getAllProductAllergens() {
  return db
    .prepare(`
      SELECT p.id AS produit_id, p.name AS produit_name, c.code AS category,
             a.code AS allergene_code, a.label_fr AS allergene_label
      FROM produit_allergene pa
      JOIN produit p ON p.id = pa.produit_id
      JOIN allergene a ON a.id = pa.allergene_id
      JOIN category c ON c.id = p.category_id
      ORDER BY c.sort_order, p.sort_order, a.sort_order
    `)
    .all();
}

// ─── Promos ──────────────────────────────────────────────────────────

export function getActivePromos() {
  return db
    .prepare("SELECT title, description, code FROM promo WHERE active = 1 ORDER BY id")
    .all();
}

// ─── Stores / Restaurants ────────────────────────────────────────────

export function getStores() {
  return db
    .prepare("SELECT * FROM restaurant WHERE active = 1 ORDER BY sort_order")
    .all()
    .map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      address: r.address,
      coordinates: [r.coordinates_lng, r.coordinates_lat],
      hours: r.hours,
      phone: r.phone,
      quartier: r.quartier,
      description: r.description,
      deliveroo_url: r.deliveroo_url,
    }));
}

// ─── Produits / Visibilité ───────────────────────────────────────────

export function getVisibleProductIds() {
  return db
    .prepare("SELECT id FROM produit WHERE visible = 1 ORDER BY sort_order")
    .all()
    .map((r) => r.id);
}

// Liste complète des produits pour le frontend (API publique)
export function getAllProductsForApi() {
  return db
    .prepare(
      `
      SELECT
        p.id,
        p.name,
        c.code AS category,
        p.subcategory AS subCategory,
        p.price,
        p.volume,
        p.description,
        p.extra_price_label AS extraPrice,
        p.image_url AS imageUrl,
        p.image_alt AS imageAlt,
        p.visible,
        p.sort_order
      FROM produit p
      JOIN category c ON c.id = p.category_id
      ORDER BY c.sort_order, p.sort_order, p.id
    `
    )
    .all()
    .map((row) => ({
      ...row,
      // Normalise les nombres en chaînes comme dans productsData.js
      price:
        row.price === null || row.price === undefined
          ? undefined
          : String(row.price),
    }));
}

// ─── Admin Produits / Catégories ────────────────────────────────────────

export function adminListCategories() {
  return db
    .prepare(
      "SELECT id, code, label_fr, label_en, sort_order FROM category ORDER BY sort_order, id"
    )
    .all();
}

export function adminListProducts() {
  return db
    .prepare(
      `
      SELECT
        p.id,
        p.name,
        p.category_id,
        c.code AS category_code,
        c.label_fr AS category_label,
        p.subcategory,
        p.price,
        p.volume,
        p.description,
        p.extra_price,
        p.extra_price_label,
        p.image_url,
        p.image_alt,
        p.visible,
        p.sort_order,
        p.created_at,
        p.updated_at
      FROM produit p
      JOIN category c ON c.id = p.category_id
      ORDER BY c.sort_order, p.sort_order, p.id
    `
    )
    .all();
}

export function adminCreateProduct(payload) {
  const now = new Date().toISOString();
  const stmt = db.prepare(
    `
    INSERT INTO produit (
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
      created_at,
      updated_at
    ) VALUES (
      @name,
      @category_id,
      @subcategory,
      @price,
      @volume,
      @description,
      @extra_price,
      @extra_price_label,
      @image_url,
      @image_alt,
      @visible,
      @sort_order,
      @created_at,
      @updated_at
    )
  `
  );

  const info = stmt.run({
    name: String(payload.name || "").trim(),
    category_id: Number(payload.category_id),
    subcategory: payload.subcategory || null,
    price:
      payload.price === null || payload.price === undefined
        ? null
        : Number(payload.price),
    volume: payload.volume || null,
    description: payload.description || null,
    extra_price:
      payload.extra_price === null || payload.extra_price === undefined
        ? null
        : Number(payload.extra_price),
    extra_price_label: payload.extra_price_label || null,
    image_url: payload.image_url || null,
    image_alt: payload.image_alt || null,
    visible: payload.visible ? 1 : 0,
    sort_order:
      payload.sort_order === null || payload.sort_order === undefined
        ? 0
        : Number(payload.sort_order),
    created_at: now,
    updated_at: now,
  });

  return info.lastInsertRowid;
}

export function adminUpdateProduct(id, payload) {
  const now = new Date().toISOString();
  const stmt = db.prepare(
    `
    UPDATE produit SET
      name = @name,
      category_id = @category_id,
      subcategory = @subcategory,
      price = @price,
      volume = @volume,
      description = @description,
      extra_price = @extra_price,
      extra_price_label = @extra_price_label,
      image_url = @image_url,
      image_alt = @image_alt,
      visible = @visible,
      sort_order = @sort_order,
      updated_at = @updated_at
    WHERE id = @id
  `
  );

  const info = stmt.run({
    id,
    name: String(payload.name || "").trim(),
    category_id: Number(payload.category_id),
    subcategory: payload.subcategory || null,
    price:
      payload.price === null || payload.price === undefined
        ? null
        : Number(payload.price),
    volume: payload.volume || null,
    description: payload.description || null,
    extra_price:
      payload.extra_price === null || payload.extra_price === undefined
        ? null
        : Number(payload.extra_price),
    extra_price_label: payload.extra_price_label || null,
    image_url: payload.image_url || null,
    image_alt: payload.image_alt || null,
    visible: payload.visible ? 1 : 0,
    sort_order:
      payload.sort_order === null || payload.sort_order === undefined
        ? 0
        : Number(payload.sort_order),
    updated_at: now,
  });

  return info.changes;
}

export function adminDeleteProduct(id) {
  const info = db
    .prepare(
      `
      DELETE FROM produit
      WHERE id = ?
    `
    )
    .run(id);
  return info.changes;
}

// ─── Contact ─────────────────────────────────────────────────────────

export function saveContactMessage(payload) {
  const stmt = db.prepare(`
    INSERT INTO contact_messages (
      sujet, nom, prenom, email, telephone,
      entreprise, fonction, message, created_at, ip, user_agent
    ) VALUES (
      @sujet, @nom, @prenom, @email, @telephone,
      @entreprise, @fonction, @message, @created_at, @ip, @user_agent
    )
  `);
  const info = stmt.run(payload);
  return info.lastInsertRowid;
}

export function listContactMessages(limit = 100) {
  return db
    .prepare("SELECT * FROM contact_messages ORDER BY id DESC LIMIT ?")
    .all(limit);
}

// ─── Newsletter ──────────────────────────────────────────────────────

export function addNewsletterSubscriber(email) {
  try {
    db.prepare("INSERT INTO newsletter_subscriber (email) VALUES (?)").run(email);
    return { inserted: true };
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return { inserted: false, reason: "duplicate" };
    }
    throw err;
  }
}

export function isNewsletterSubscribed(email) {
  const row = db
    .prepare("SELECT 1 FROM newsletter_subscriber WHERE email = ? AND unsubscribed_at IS NULL")
    .get(email);
  return !!row;
}

export function listNewsletterSubscribers() {
  return db
    .prepare("SELECT email, created_at FROM newsletter_subscriber WHERE unsubscribed_at IS NULL ORDER BY id DESC")
    .all();
}
