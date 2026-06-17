import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import fs from "fs";
import { PRODUCTS as FRONT_PRODUCTS } from "../frontend/src/data/productsData.js";
import { isJdcSyncProduct } from "./jdc-categories.js";

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
  produitCols = db.pragma("table_info(produit)").map((c) => c.name);
}

if (!produitCols.includes("jdc_id")) {
  db.exec(`ALTER TABLE produit ADD COLUMN jdc_id TEXT;`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_produit_jdc_id ON produit(jdc_id);`);
}

let categoryCols = db.pragma("table_info(category)").map((c) => c.name);
const wasManagedByMissing = !categoryCols.includes("managed_by");
if (wasManagedByMissing) {
  db.exec(`ALTER TABLE category ADD COLUMN managed_by TEXT NOT NULL DEFAULT 'jdc';`);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS jdc_category_mapping (
    jdc_category_id TEXT PRIMARY KEY,
    jdc_category_name TEXT NOT NULL,
    site_category_id INTEGER,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (site_category_id) REFERENCES category(id) ON DELETE SET NULL
  );
  CREATE INDEX IF NOT EXISTS idx_jdc_cat_map_site ON jdc_category_mapping(site_category_id);
`);

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

  CREATE TABLE IF NOT EXISTS produit_translation (
    produit_id INTEGER NOT NULL,
    lang TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    updated_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (produit_id, lang),
    FOREIGN KEY (produit_id) REFERENCES produit(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS produit_sheet (
    produit_id INTEGER PRIMARY KEY,
    why_good TEXT,
    benefits_json TEXT,
    key_ingredients_json TEXT,
    formulas_json TEXT,
    is_vegetarian INTEGER NOT NULL DEFAULT 0,
    is_vegan INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (produit_id) REFERENCES produit(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS pos_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pos_sku TEXT,
    pos_name TEXT,
    pos_button_name TEXT,
    pos_type TEXT,
    pos_price REAL,
    produit_id INTEGER,
    alias_type TEXT,
    confidence TEXT,
    note TEXT,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (produit_id) REFERENCES produit(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_pos_mapping_sku ON pos_mapping(pos_sku);
  CREATE INDEX IF NOT EXISTS idx_pos_mapping_produit ON pos_mapping(produit_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_pos_mapping_produit_unique
    ON pos_mapping(produit_id) WHERE produit_id IS NOT NULL;
  CREATE INDEX IF NOT EXISTS idx_translation_lang ON produit_translation(lang);
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
  "QUICHE SAUMON ÉPINARDS": ["gluten", "oeufs", "poissons", "lait", "fruitsacoque"],
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
  "GRANDE SALADE SUSHI": ["oeufs", "poissons", "soja", "moutarde", "sesame", "sulfites"],
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

// Supprime les doublons : un produit site ne peut être cible que d'une seule ligne POS.
function dedupePosMappingProducts() {
  const dupPids = db
    .prepare(
      `SELECT produit_id AS pid
       FROM pos_mapping
       WHERE produit_id IS NOT NULL
       GROUP BY produit_id
       HAVING COUNT(*) > 1`
    )
    .all();
  if (!dupPids.length) return 0;

  const listRows = db.prepare(
    `SELECT id, confidence, note
     FROM pos_mapping
     WHERE produit_id = ?
     ORDER BY
       CASE confidence
         WHEN 'alias_sku' THEN 4
         WHEN 'alias_nom' THEN 3
         WHEN 'nom_proche' THEN 2
         WHEN 'fuzzy' THEN 1
         ELSE 0
       END DESC,
       id ASC`
  );
  const clearRow = db.prepare(
    `UPDATE pos_mapping
     SET produit_id = NULL, alias_type = NULL, confidence = NULL,
         note = COALESCE(note || '; ', '') || 'doublon produit cible retiré'
     WHERE id = ?`
  );

  let cleared = 0;
  const tx = db.transaction(() => {
    for (const { pid } of dupPids) {
      const rows = listRows.all(pid);
      for (const row of rows.slice(1)) {
        clearRow.run(row.id);
        cleared += 1;
      }
    }
  });
  tx();
  if (cleared) {
    console.log(`[pos_mapping] ${cleared} doublon(s) produit cible supprimé(s).`);
  }
  return cleared;
}

dedupePosMappingProducts();
db.exec(
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_pos_mapping_produit_unique
   ON pos_mapping(produit_id) WHERE produit_id IS NOT NULL`
);

seedIfEmpty();

// Init des catégories gérées 100 % côté site (hors sync JDC).
// Idempotent : réapplique la config par défaut à chaque démarrage.
{
  const info = db
    .prepare(
      `UPDATE category SET managed_by = 'site'
       WHERE code IN ('JUS', 'MILKSHAKES', 'BOOSTERS', 'GOODIES', 'BOISSONS')`
    )
    .run();
  if (info.changes) {
    console.log(
      `Catégories marquées « gérées par le site » (hors sync JDC) : ${info.changes}`
    );
  }
}

// Synchronise intégralement les produits depuis productsData.js vers la DB :
// noms, catégories, prix, descriptions, visibilité, et insertion des nouveaux.
//
// ⚠️ N'est PLUS appelée automatiquement au démarrage : sinon, chaque restart
// du serveur écrase les modifications faites depuis l'admin (nom, prix,
// description, visibilité…). La BDD est désormais la source de vérité.
//
// Pour relancer manuellement la synchro JS → BDD (utile uniquement si on
// vient d'ajouter de nouveaux produits dans productsData.js et qu'on veut les
// importer en BDD), exporter cette fonction et l'appeler depuis un script,
// ou ajouter temporairement `syncProductDetailsFromFrontend();` en bas de
// ce fichier. Le sens « inverse » (BDD → JS) est géré par
// `npm run db:sync-js`.
export function syncProductDetailsFromFrontend() {
  try {
    const catCodeToId = Object.fromEntries(
      db.prepare("SELECT code, id FROM category").all().map((r) => [r.code, r.id])
    );

    const existingIds = new Set(
      db.prepare("SELECT id FROM produit").all().map((r) => r.id)
    );

    const update = db.prepare(`
      UPDATE produit
      SET
        name = @name,
        category_id = @category_id,
        price = @price,
        volume = @volume,
        description = @description,
        subcategory = @subcategory,
        extra_price_label = @extra_price_label,
        visible = @visible,
        updated_at = datetime('now')
      WHERE id = @id
    `);

    const insert = db.prepare(`
      INSERT INTO produit (id, name, category_id, price, volume, description, subcategory, extra_price_label, visible, sort_order)
      VALUES (@id, @name, @category_id, @price, @volume, @description, @subcategory, @extra_price_label, @visible, @sort_order)
    `);

    const syncAll = db.transaction(() => {
      for (let i = 0; i < FRONT_PRODUCTS.length; i++) {
        const p = FRONT_PRODUCTS[i];
        const price =
          p.price === undefined || p.price === null || p.price === ""
            ? null
            : Number(String(p.price).replace(",", "."));
        const categoryId = catCodeToId[p.category] ?? 1;
        const params = {
          id: p.id,
          name: p.name,
          category_id: categoryId,
          price,
          volume: p.volume || null,
          description: p.description || null,
          subcategory: p.subCategory || null,
          extra_price_label: p.extraPrice || null,
          visible: p.afficher === false ? 0 : 1,
          sort_order: i,
        };

        if (existingIds.has(p.id)) {
          update.run(params);
        } else {
          insert.run(params);
        }
      }
    });

    syncAll();
    console.log(`syncProductDetailsFromFrontend: ${FRONT_PRODUCTS.length} produits synchronisés.`);
  } catch (err) {
    console.error("Erreur syncProductDetailsFromFrontend:", err);
  }
}

// ⚠️ Appel auto retiré : la BDD est la source de vérité une fois seedée.
// Voir le commentaire au-dessus de `syncProductDetailsFromFrontend` pour
// la relancer manuellement si besoin (ajout de nouveaux produits dans le JS).

// ─── Diagnostic BDD ──────────────────────────────────────────────────

// Retourne un instantané complet des compteurs de la BDD,
// utile pour vérifier l'état après migration.
export function getDbDiagnostic() {
  const tables = [
    "category",
    "produit",
    "produit_allergene",
    "produit_translation",
    "produit_sheet",
    "allergene",
    "restaurant",
    "pos_mapping",
    "promo",
    "newsletter_subscriber",
    "contact_messages",
  ];
  const counts = {};
  for (const t of tables) {
    try {
      counts[t] = db.prepare(`SELECT COUNT(*) AS c FROM ${t}`).get().c;
    } catch {
      counts[t] = null;
    }
  }

  let productsWithoutAllergens = null;
  let productsWithoutTranslation = null;
  let productsWithoutSheet = null;
  try {
    productsWithoutAllergens = db
      .prepare(
        `SELECT COUNT(*) AS c FROM produit p
         WHERE NOT EXISTS (SELECT 1 FROM produit_allergene pa WHERE pa.produit_id = p.id)`
      )
      .get().c;
    productsWithoutTranslation = db
      .prepare(
        `SELECT COUNT(*) AS c FROM produit p
         WHERE NOT EXISTS (SELECT 1 FROM produit_translation t WHERE t.produit_id = p.id AND t.lang = 'fr')`
      )
      .get().c;
    productsWithoutSheet = db
      .prepare(
        `SELECT COUNT(*) AS c FROM produit p
         WHERE NOT EXISTS (SELECT 1 FROM produit_sheet s WHERE s.produit_id = p.id)`
      )
      .get().c;
  } catch { /* tables pas encore créées */ }

  return {
    counts,
    coverage: {
      products_without_allergens: productsWithoutAllergens,
      products_without_fr_translation: productsWithoutTranslation,
      products_without_sheet: productsWithoutSheet,
    },
    generated_at: new Date().toISOString(),
  };
}

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

// Liste complète des produits pour le frontend (API publique).
// Options :
//  - lang : "fr" | "en" → remplace name/description par la traduction si présente
//  - includeAllergens : bool → ajoute un tableau `allergens` (codes)
//  - includeSheet     : bool → ajoute `hasSheet` et `sheet` (objet minimal)
//  - onlyVisible      : bool → filtre visible = 1
export function getAllProductsForApi(options = {}) {
  const {
    lang = null,
    includeAllergens = false,
    includeSheet = false,
    onlyVisible = false,
  } = options;

  const baseQuery = `
    SELECT
      p.id,
      p.name AS name_default,
      c.code AS category,
      p.subcategory AS subCategory,
      p.price,
      p.volume,
      p.description AS description_default,
      p.extra_price_label AS extraPrice,
      p.image_url AS imageUrl,
      p.image_alt AS imageAlt,
      p.visible,
      p.sort_order,
      t.name AS name_translated,
      t.description AS description_translated
    FROM produit p
    JOIN category c ON c.id = p.category_id
    LEFT JOIN produit_translation t
      ON t.produit_id = p.id AND t.lang = ?
    ${onlyVisible ? "WHERE p.visible = 1" : ""}
    ORDER BY c.sort_order, p.sort_order, p.id
  `;
  const rows = db.prepare(baseQuery).all(lang || "");

  let allergensByProduit = null;
  if (includeAllergens) {
    const liaisons = db
      .prepare(
        `SELECT pa.produit_id AS pid, a.code
         FROM produit_allergene pa
         JOIN allergene a ON a.id = pa.allergene_id
         ORDER BY a.sort_order`
      )
      .all();
    allergensByProduit = new Map();
    for (const { pid, code } of liaisons) {
      if (!allergensByProduit.has(pid)) allergensByProduit.set(pid, []);
      allergensByProduit.get(pid).push(code);
    }
  }

  let sheetsByProduit = null;
  if (includeSheet) {
    const sheets = db
      .prepare(
        `SELECT produit_id AS pid, why_good, benefits_json, key_ingredients_json,
                formulas_json, is_vegetarian, is_vegan
         FROM produit_sheet`
      )
      .all();
    sheetsByProduit = new Map();
    for (const s of sheets) {
      sheetsByProduit.set(s.pid, {
        whyGood: s.why_good,
        benefits: safeParse(s.benefits_json, []),
        keyIngredients: safeParse(s.key_ingredients_json, []),
        formulas: safeParse(s.formulas_json, []),
        isVegetarian: !!s.is_vegetarian,
        isVegan: !!s.is_vegan,
      });
    }
  }

  return rows.map((row) => {
    const out = {
      id: row.id,
      name: row.name_translated || row.name_default,
      category: row.category,
      subCategory: row.subCategory,
      price:
        row.price === null || row.price === undefined
          ? undefined
          : String(row.price),
      volume: row.volume,
      description: row.description_translated || row.description_default,
      extraPrice: row.extraPrice,
      imageUrl: row.imageUrl,
      imageAlt: row.imageAlt,
      visible: row.visible,
      sort_order: row.sort_order,
    };
    if (includeAllergens) {
      out.allergens = allergensByProduit.get(row.id) || [];
    }
    if (includeSheet) {
      const sheet = sheetsByProduit.get(row.id) || null;
      out.hasSheet = !!sheet;
      if (sheet) out.sheet = sheet;
    }
    return out;
  });
}

function safeParse(text, fallback) {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

// Fiche enrichie (unitaire) par produit : used by /api/products/:id/sheet.
// Inclut traductions (name/description dans la langue demandée) + allergènes + détails fiche.
export function getProductSheet(produitId, lang = null) {
  const row = db
    .prepare(
      `SELECT
         p.id,
         p.name AS name_default,
         c.code AS category,
         p.subcategory AS subCategory,
         p.price,
         p.volume,
         p.description AS description_default,
         p.image_url AS imageUrl,
         p.visible,
         t.name AS name_translated,
         t.description AS description_translated,
         s.why_good,
         s.benefits_json,
         s.key_ingredients_json,
         s.formulas_json,
         s.is_vegetarian,
         s.is_vegan
       FROM produit p
       JOIN category c ON c.id = p.category_id
       LEFT JOIN produit_translation t ON t.produit_id = p.id AND t.lang = ?
       LEFT JOIN produit_sheet s ON s.produit_id = p.id
       WHERE p.id = ?`
    )
    .get(lang || "", produitId);
  if (!row) return null;

  const allergens = db
    .prepare(
      `SELECT a.code, a.label_fr, a.label_en
       FROM produit_allergene pa
       JOIN allergene a ON a.id = pa.allergene_id
       WHERE pa.produit_id = ?
       ORDER BY a.sort_order`
    )
    .all(produitId);

  return {
    id: row.id,
    name: row.name_translated || row.name_default,
    category: row.category,
    subCategory: row.subCategory,
    price:
      row.price === null || row.price === undefined
        ? undefined
        : String(row.price),
    volume: row.volume,
    description: row.description_translated || row.description_default,
    imageUrl: row.imageUrl,
    visible: row.visible,
    whyGood: row.why_good,
    benefits: safeParse(row.benefits_json, []),
    keyIngredients: safeParse(row.key_ingredients_json, []),
    formulas: safeParse(row.formulas_json, []),
    isVegetarian: !!row.is_vegetarian,
    isVegan: !!row.is_vegan,
    allergens,
  };
}

// Mapping POS → produit (admin/diagnostic).
export function getPosMapping() {
  return db
    .prepare(
      `SELECT
         m.id,
         m.pos_sku,
         m.pos_name,
         m.pos_button_name,
         m.pos_type,
         m.pos_price,
         m.produit_id,
         p.name AS produit_name,
         c.code AS produit_category,
         m.alias_type,
         m.confidence,
         m.note
       FROM pos_mapping m
       LEFT JOIN produit p ON p.id = m.produit_id
       LEFT JOIN category c ON c.id = p.category_id
       ORDER BY CAST(m.pos_sku AS INTEGER), m.id`
    )
    .all();
}

// ─── Synchro JDC ─────────────────────────────────────────────────────

// Liste des mappings catégorie JDC → catégorie site connus.
// Retourne aussi le détail des catégories JDC vues (depuis le dernier sync) ainsi
// que toutes les catégories site et leur mode (managed_by).
export function getJdcCategoryMappings() {
  return db
    .prepare(
      `SELECT
         m.jdc_category_id,
         m.jdc_category_name,
         m.site_category_id,
         c.code AS site_category_code,
         c.label_fr AS site_category_label,
         c.managed_by AS site_category_managed_by,
         m.updated_at
       FROM jdc_category_mapping m
       LEFT JOIN category c ON c.id = m.site_category_id
       ORDER BY m.jdc_category_name`
    )
    .all();
}

export function listSiteCategoriesWithMode() {
  return db
    .prepare(
      `SELECT id, code, label_fr, label_en, sort_order, managed_by
       FROM category
       ORDER BY sort_order, id`
    )
    .all();
}

// Crée ou met à jour le mapping pour une catégorie JDC.
// Si site_category_id est null/undefined/'' on enregistre quand même la ligne
// (avec site=NULL) pour mémoriser "cette catégorie est connue mais ignorée".
export function upsertJdcCategoryMapping(jdcCategoryId, jdcCategoryName, siteCategoryId) {
  if (!jdcCategoryId) return { ok: false, reason: "missing_jdc_category_id" };
  const siteId =
    siteCategoryId === null || siteCategoryId === undefined || siteCategoryId === ""
      ? null
      : Number(siteCategoryId);

  if (siteId !== null) {
    const exists = db.prepare("SELECT 1 FROM category WHERE id = ?").get(siteId);
    if (!exists) return { ok: false, reason: "site_category_not_found" };
  }

  db.prepare(
    `INSERT INTO jdc_category_mapping (jdc_category_id, jdc_category_name, site_category_id, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(jdc_category_id) DO UPDATE SET
       jdc_category_name = excluded.jdc_category_name,
       site_category_id = excluded.site_category_id,
       updated_at = excluded.updated_at`
  ).run(jdcCategoryId, jdcCategoryName || jdcCategoryId, siteId);

  return { ok: true };
}

export function setCategoryManagedBy(categoryId, managedBy) {
  if (!["jdc", "site"].includes(managedBy)) {
    return { ok: false, reason: "invalid_managed_by" };
  }
  const info = db
    .prepare("UPDATE category SET managed_by = ? WHERE id = ?")
    .run(managedBy, Number(categoryId));
  if (!info.changes) return { ok: false, reason: "category_not_found" };
  return { ok: true };
}

// Synchronisation catalogue JDC → site (v2).
// jdcProducts : tableau d'objets { id, name, category_id, category_name, price_b2c, image_url, ... }
// Règles :
//   1. Si aucun mapping de catégorie n'est défini (avec site_category_id non-NULL),
//      on saute le sync entièrement (garde-fou anti-vidage).
//   2. Pour chaque produit JDC :
//      - Si sa catégorie JDC n'est pas mappée (inconnue OU mappée à NULL = "ignorer"),
//        on l'enregistre dans la table de mapping comme "vue mais ignorée"
//        (pour que l'admin la traite ensuite), puis on saute ce produit.
//      - Sinon, soit `siteCat` la catégorie site cible :
//          * Si `siteCat.managed_by = 'site'`, on saute (cette catégorie n'est pas
//            pilotée par JDC quoi qu'il arrive).
//          * Si un produit local existe déjà avec `jdc_id = jdc.id`, on le laisse
//            tel quel (catégorie, nom, prix, etc.) mais on s'assure qu'il est visible.
//          * Sinon on crée un nouveau produit local avec name/price/category de JDC,
//            visible=1.
//   3. Pour chaque produit local appartenant à une catégorie `managed_by='jdc'` :
//      - Si `jdc_id` absent ou pas dans le set JDC reçu → visible = 0.
//      - Sinon visible = 1 (déjà couvert par le point 2 si le mapping existe).
//   4. Les produits dans des catégories `managed_by='site'` ne sont jamais touchés.
export function applyJdcCatalogSync(jdcProducts) {
  const allProducts = Array.isArray(jdcProducts) ? jdcProducts : [];
  // Sync limitée aux produits JDC des catégories synchronisées (hors jus, boissons, goodies…).
  const products = allProducts.filter(isJdcSyncProduct);

  // ─── Préparation : sets et mappings ─────────────────────────────
  const jdcUuids = new Set(
    products.map((p) => String(p?.id || "").trim()).filter(Boolean)
  );

  const beforeRows = db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN jdc_id IS NOT NULL AND TRIM(jdc_id) <> '' THEN 1 ELSE 0 END) AS mapped,
         SUM(CASE WHEN visible = 1 THEN 1 ELSE 0 END) AS visible_before
       FROM produit`
    )
    .get();

  // Vue snapshot des mappings catégorie connus
  const mappingRows = db
    .prepare(
      `SELECT m.jdc_category_id, m.site_category_id, c.managed_by
       FROM jdc_category_mapping m
       LEFT JOIN category c ON c.id = m.site_category_id`
    )
    .all();
  const catMapByJdc = new Map();
  for (const m of mappingRows) {
    catMapByJdc.set(m.jdc_category_id, {
      siteCatId: m.site_category_id,
      managedBy: m.managed_by, // null si site_category_id NULL
    });
  }

  // Garde-fou : s'il n'y a aucune cat mappée non-NULL ET pointant vers une cat 'jdc',
  // on ne fait rien (sinon on désactiverait tout le site sans rien créer en face).
  const hasAtLeastOneMappedJdcCat = mappingRows.some(
    (m) => m.site_category_id != null && m.managed_by === "jdc"
  );

  const ignored_categories = {}; // { 'NomCategorieJDC': count }
  const created = []; // [{ id, jdc_id, name }]
  const reactivated = []; // produits remappés qui étaient cachés

  if (!hasAtLeastOneMappedJdcCat) {
    return {
      skipped: "no_category_mappings",
      total: beforeRows.total,
      mapped: beforeRows.mapped,
      visible_before: beforeRows.visible_before,
      visible_after: beforeRows.visible_before,
      jdc_received: allProducts.length,
      matched_in_jdc: 0,
      activated: 0,
      deactivated: 0,
      created: [],
      ignored_categories: products.reduce((acc, p) => {
        const n = p?.category_name || "—";
        acc[n] = (acc[n] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  // ─── Transaction principale ─────────────────────────────────────
  const txn = db.transaction(() => {
    // Step 1 : enregistrer toutes les catégories JDC vues dans jdc_category_mapping
    // (avec site_category_id = NULL si pas encore mappées, pour que l'admin les retrouve)
    const upsertCatMap = db.prepare(
      `INSERT INTO jdc_category_mapping (jdc_category_id, jdc_category_name, site_category_id, updated_at)
       VALUES (?, ?, NULL, datetime('now'))
       ON CONFLICT(jdc_category_id) DO UPDATE SET
         jdc_category_name = excluded.jdc_category_name,
         updated_at = excluded.updated_at`
    );
    const seenCats = new Set();
    for (const p of products) {
      const cid = p?.category_id;
      const cname = p?.category_name;
      if (cid && !seenCats.has(cid) && isJdcSyncProduct(p)) {
        seenCats.add(cid);
        // N'écrase JAMAIS un mapping existant (ON CONFLICT préserve site_category_id)
        upsertCatMap.run(cid, cname || cid);
      }
    }

    // Refresh des mappings après insertion (pour avoir les nouveaux dans catMapByJdc)
    const refreshed = db
      .prepare(
        `SELECT m.jdc_category_id, m.site_category_id, c.managed_by
         FROM jdc_category_mapping m
         LEFT JOIN category c ON c.id = m.site_category_id`
      )
      .all();
    catMapByJdc.clear();
    for (const m of refreshed) {
      catMapByJdc.set(m.jdc_category_id, {
        siteCatId: m.site_category_id,
        managedBy: m.managed_by,
      });
    }

    // Step 2 : pour chaque produit JDC, créer / réactiver / ignorer
    const findByJdcId = db.prepare(
      `SELECT p.id, p.visible, p.category_id, c.managed_by
       FROM produit p
       JOIN category c ON c.id = p.category_id
       WHERE p.jdc_id = ?`
    );
    const insertProd = db.prepare(`
      INSERT INTO produit (name, category_id, price, jdc_id, visible, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, 0, datetime('now'), datetime('now'))
    `);
    const reactivate = db.prepare(`
      UPDATE produit SET visible = 1, updated_at = datetime('now') WHERE id = ?
    `);

    for (const p of products) {
      const jdcId = String(p?.id || "").trim();
      if (!jdcId || !isJdcSyncProduct(p)) continue;

      const catInfo = catMapByJdc.get(p?.category_id || "");
      const isMapped =
        catInfo && catInfo.siteCatId != null && catInfo.managedBy === "jdc";
      if (!isMapped) {
        const n = p?.category_name || "—";
        ignored_categories[n] = (ignored_categories[n] || 0) + 1;
        continue;
      }

      const existing = findByJdcId.get(jdcId);
      if (!existing) {
        const price =
          p?.price_b2c === null || p?.price_b2c === undefined
            ? null
            : Number(p.price_b2c) || null;
        const name = String(p?.name || "").trim() || `Produit JDC ${jdcId.slice(0, 8)}`;
        const info = insertProd.run(name, catInfo.siteCatId, price, jdcId);
        created.push({ id: info.lastInsertRowid, jdc_id: jdcId, name });
      } else if (!existing.visible) {
        // Le produit était caché mais JDC le ré-active → on le ré-affiche.
        // Seulement si sa catégorie courante est managed_by='jdc'.
        if (existing.managed_by === "jdc") {
          reactivate.run(existing.id);
          reactivated.push(existing.id);
        }
      }
    }

    // Step 3 : masquer les produits site dans des cat managed_by='jdc' qui
    // n'ont pas (ou plus) de jdc_id dans la liste reçue.
    db.exec("DROP TABLE IF EXISTS _jdc_uuid_tmp;");
    db.exec("CREATE TEMP TABLE _jdc_uuid_tmp (uuid TEXT PRIMARY KEY);");
    if (jdcUuids.size) {
      const ins = db.prepare("INSERT OR IGNORE INTO _jdc_uuid_tmp (uuid) VALUES (?)");
      for (const u of jdcUuids) ins.run(u);
    }
    const deactivated = db.prepare(`
      UPDATE produit
      SET visible = 0, updated_at = datetime('now')
      WHERE visible = 1
        AND category_id IN (SELECT id FROM category WHERE managed_by = 'jdc')
        AND (
          jdc_id IS NULL
          OR TRIM(jdc_id) = ''
          OR jdc_id NOT IN (SELECT uuid FROM _jdc_uuid_tmp)
        )
    `).run().changes;
    db.exec("DROP TABLE IF EXISTS _jdc_uuid_tmp;");

    return { deactivated };
  });

  const { deactivated } = txn();

  const afterRows = db
    .prepare(
      `SELECT SUM(CASE WHEN visible = 1 THEN 1 ELSE 0 END) AS visible_after FROM produit`
    )
    .get();

  // Combien des UUIDs JDC sont effectivement présents en base (mappés)
  const matchedRow = jdcUuids.size
    ? db
        .prepare(
          `SELECT COUNT(*) AS c FROM produit
           WHERE jdc_id IS NOT NULL AND TRIM(jdc_id) <> ''`
        )
        .get()
    : { c: 0 };

  return {
    total: beforeRows.total,
    mapped: beforeRows.mapped,
    matched_in_jdc: matchedRow.c,
    jdc_received: allProducts.length,
    visible_before: beforeRows.visible_before,
    visible_after: afterRows.visible_after ?? 0,
    activated: reactivated.length,
    deactivated,
    created,
    ignored_categories,
  };
}

// Conserve l'ancienne fonction pour compat (utilisée par d'anciens appels éventuels).
export function applyJdcVisibility(jdcUuidSet) {
  const uuids = Array.from(jdcUuidSet || []).filter(Boolean);
  const beforeRows = db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN jdc_id IS NOT NULL AND TRIM(jdc_id) <> '' THEN 1 ELSE 0 END) AS mapped,
         SUM(CASE WHEN visible = 1 THEN 1 ELSE 0 END) AS visible_before
       FROM produit`
    )
    .get();

  const txn = db.transaction(() => {
    db.exec("DROP TABLE IF EXISTS _jdc_sync_tmp;");
    db.exec("CREATE TEMP TABLE _jdc_sync_tmp (uuid TEXT PRIMARY KEY);");
    if (uuids.length) {
      const ins = db.prepare("INSERT OR IGNORE INTO _jdc_sync_tmp (uuid) VALUES (?)");
      for (const u of uuids) ins.run(u);
    }

    const matched = db
      .prepare(
        `SELECT COUNT(*) AS c
           FROM produit
           WHERE jdc_id IS NOT NULL
             AND TRIM(jdc_id) <> ''
             AND jdc_id IN (SELECT uuid FROM _jdc_sync_tmp)`
      )
      .get().c;

    const activated = db.prepare(`
      UPDATE produit
      SET visible = 1, updated_at = datetime('now')
      WHERE visible = 0
        AND jdc_id IS NOT NULL
        AND TRIM(jdc_id) <> ''
        AND jdc_id IN (SELECT uuid FROM _jdc_sync_tmp)
    `).run().changes;

    const deactivated = db.prepare(`
      UPDATE produit
      SET visible = 0, updated_at = datetime('now')
      WHERE visible = 1
        AND (
          jdc_id IS NULL
          OR TRIM(jdc_id) = ''
          OR jdc_id NOT IN (SELECT uuid FROM _jdc_sync_tmp)
        )
    `).run().changes;

    db.exec("DROP TABLE IF EXISTS _jdc_sync_tmp;");
    return { activated, deactivated, matched };
  });

  const { activated, deactivated, matched } = txn();

  const afterRows = db
    .prepare(
      `SELECT SUM(CASE WHEN visible = 1 THEN 1 ELSE 0 END) AS visible_after FROM produit`
    )
    .get();

  return {
    total: beforeRows.total,
    mapped: beforeRows.mapped,
    matched_in_jdc: matched,
    jdc_received: uuids.length,
    visible_before: beforeRows.visible_before,
    visible_after: afterRows.visible_after,
    activated,
    deactivated,
  };
}

export function getJdcMappingsSummary() {
  return db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN jdc_id IS NOT NULL AND TRIM(jdc_id) <> '' THEN 1 ELSE 0 END) AS mapped,
         SUM(CASE WHEN visible = 1 THEN 1 ELSE 0 END) AS visible
       FROM produit`
    )
    .get();
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
        p.jdc_id,
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
      jdc_id,
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
      @jdc_id,
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
    jdc_id: normalizeJdcId(payload.jdc_id),
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
      jdc_id = @jdc_id,
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
    jdc_id: normalizeJdcId(payload.jdc_id),
    visible: payload.visible ? 1 : 0,
    sort_order:
      payload.sort_order === null || payload.sort_order === undefined
        ? 0
        : Number(payload.sort_order),
    updated_at: now,
  });

  return info.changes;
}

function normalizeJdcId(raw) {
  if (raw === null || raw === undefined) return null;
  const v = String(raw).trim();
  return v.length ? v : null;
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

// ─── Admin Allergènes ────────────────────────────────────────────────

export function adminListAllergens() {
  return db
    .prepare(
      `SELECT id, code, label_fr, label_en, sort_order
       FROM allergene
       ORDER BY sort_order, id`
    )
    .all();
}

export function adminGetProductAllergens(produitId) {
  return db
    .prepare(
      `SELECT a.id, a.code, a.label_fr, a.label_en
       FROM produit_allergene pa
       JOIN allergene a ON a.id = pa.allergene_id
       WHERE pa.produit_id = ?
       ORDER BY a.sort_order`
    )
    .all(produitId);
}

export function adminSetProductAllergens(produitId, codes) {
  const normalized = Array.isArray(codes)
    ? Array.from(new Set(codes.map((c) => String(c || "").trim()).filter(Boolean)))
    : [];

  const productExists = db
    .prepare("SELECT 1 FROM produit WHERE id = ?")
    .get(produitId);
  if (!productExists) return { ok: false, reason: "product_not_found" };

  const txn = db.transaction(() => {
    db.prepare("DELETE FROM produit_allergene WHERE produit_id = ?").run(
      produitId
    );

    if (!normalized.length) return { inserted: 0, unknown: [] };

    const findId = db.prepare("SELECT id FROM allergene WHERE code = ?");
    const insert = db.prepare(
      "INSERT OR IGNORE INTO produit_allergene (produit_id, allergene_id) VALUES (?, ?)"
    );

    let inserted = 0;
    const unknown = [];
    for (const code of normalized) {
      const row = findId.get(code);
      if (!row) {
        unknown.push(code);
        continue;
      }
      insert.run(produitId, row.id);
      inserted += 1;
    }
    return { inserted, unknown };
  });

  const result = txn();
  return { ok: true, ...result };
}

// ─── Admin Traductions ──────────────────────────────────────────────

export function adminGetProductTranslations(produitId) {
  const rows = db
    .prepare(
      `SELECT lang, name, description, updated_at
       FROM produit_translation
       WHERE produit_id = ?
       ORDER BY lang`
    )
    .all(produitId);
  const out = {};
  for (const r of rows) {
    out[r.lang] = {
      name: r.name,
      description: r.description,
      updated_at: r.updated_at,
    };
  }
  return out;
}

export function adminSetProductTranslation(produitId, lang, payload) {
  const productExists = db
    .prepare("SELECT 1 FROM produit WHERE id = ?")
    .get(produitId);
  if (!productExists) return { ok: false, reason: "product_not_found" };

  const name = String(payload?.name || "").trim();
  const description = payload?.description == null
    ? null
    : String(payload.description);
  const now = new Date().toISOString();

  if (!name && description === null) {
    db.prepare(
      "DELETE FROM produit_translation WHERE produit_id = ? AND lang = ?"
    ).run(produitId, lang);
    return { ok: true, deleted: true };
  }

  db.prepare(
    `INSERT INTO produit_translation (produit_id, lang, name, description, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(produit_id, lang) DO UPDATE SET
       name = excluded.name,
       description = excluded.description,
       updated_at = excluded.updated_at`
  ).run(produitId, String(lang).toLowerCase(), name, description, now);

  return { ok: true };
}

// ─── Admin Fiches enrichies ─────────────────────────────────────────

export function adminGetProductSheet(produitId) {
  const row = db
    .prepare(
      `SELECT produit_id, why_good, benefits_json, key_ingredients_json,
              formulas_json, is_vegetarian, is_vegan, updated_at
       FROM produit_sheet
       WHERE produit_id = ?`
    )
    .get(produitId);
  if (!row) return null;
  const parse = (s, fallback) => {
    if (!s) return fallback;
    try {
      return JSON.parse(s);
    } catch {
      return fallback;
    }
  };
  return {
    produit_id: row.produit_id,
    why_good: row.why_good,
    benefits: parse(row.benefits_json, []),
    key_ingredients: parse(row.key_ingredients_json, []),
    formulas: parse(row.formulas_json, []),
    is_vegetarian: !!row.is_vegetarian,
    is_vegan: !!row.is_vegan,
    updated_at: row.updated_at,
  };
}

export function adminSetProductSheet(produitId, payload) {
  const productExists = db
    .prepare("SELECT 1 FROM produit WHERE id = ?")
    .get(produitId);
  if (!productExists) return { ok: false, reason: "product_not_found" };

  const now = new Date().toISOString();
  const whyGood = payload?.why_good == null ? null : String(payload.why_good);
  const stringifyArr = (v) => {
    if (v == null) return null;
    if (Array.isArray(v)) return JSON.stringify(v);
    if (typeof v === "string") {
      try {
        const parsed = JSON.parse(v);
        return Array.isArray(parsed) ? JSON.stringify(parsed) : null;
      } catch {
        return null;
      }
    }
    return null;
  };

  db.prepare(
    `INSERT INTO produit_sheet (
        produit_id, why_good, benefits_json, key_ingredients_json, formulas_json,
        is_vegetarian, is_vegan, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(produit_id) DO UPDATE SET
       why_good = excluded.why_good,
       benefits_json = excluded.benefits_json,
       key_ingredients_json = excluded.key_ingredients_json,
       formulas_json = excluded.formulas_json,
       is_vegetarian = excluded.is_vegetarian,
       is_vegan = excluded.is_vegan,
       updated_at = excluded.updated_at`
  ).run(
    produitId,
    whyGood,
    stringifyArr(payload?.benefits),
    stringifyArr(payload?.key_ingredients),
    stringifyArr(payload?.formulas),
    payload?.is_vegetarian ? 1 : 0,
    payload?.is_vegan ? 1 : 0,
    now
  );

  return { ok: true };
}

// ─── Admin POS mapping ──────────────────────────────────────────────

export function adminUpdatePosMapping(id, payload) {
  const existing = db
    .prepare("SELECT id FROM pos_mapping WHERE id = ?")
    .get(id);
  if (!existing) return { ok: false, reason: "pos_not_found" };

  const produitId =
    payload?.produit_id === null || payload?.produit_id === undefined || payload?.produit_id === ""
      ? null
      : Number(payload.produit_id);

  if (produitId !== null) {
    const prod = db.prepare("SELECT 1 FROM produit WHERE id = ?").get(produitId);
    if (!prod) return { ok: false, reason: "product_not_found" };
    const taken = db
      .prepare("SELECT id FROM pos_mapping WHERE produit_id = ? AND id != ?")
      .get(produitId, id);
    if (taken) return { ok: false, reason: "produit_already_mapped" };
  }

  const aliasType = payload?.alias_type ? String(payload.alias_type) : null;
  const confidence =
    payload?.confidence === null || payload?.confidence === undefined || payload?.confidence === ""
      ? null
      : Number(payload.confidence);
  const note = payload?.note == null ? null : String(payload.note);

  db.prepare(
    `UPDATE pos_mapping
     SET produit_id = ?, alias_type = ?, confidence = ?, note = ?
     WHERE id = ?`
  ).run(produitId, aliasType, confidence, note, id);

  return { ok: true };
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
