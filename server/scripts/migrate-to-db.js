/**
 * Migration one-shot : consolide toutes les sources de données dans la BDD SQLite.
 *
 * Usage depuis la racine du projet :
 *   node server/scripts/migrate-to-db.js
 *
 * Idempotent : peut être rejoué sans duplication (utilise des UPSERT).
 * Ne supprime aucun fichier source — se contente d'alimenter la BDD.
 *
 * Sources importées :
 *  - frontend/src/data/allergensData.js     → produit_allergene
 *  - frontend/src/locales/fr.json / en.json → produit_translation
 *  - frontend/src/data/productSheetData.js  → produit_sheet
 *  - server/data/mapping-pos-to-db.csv      → pos_mapping
 */

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const DB_PATH = path.join(ROOT, "server/data/soupjuice.db");

if (!fs.existsSync(DB_PATH)) {
  console.error(
    `Base ${DB_PATH} introuvable. Lancez d'abord le serveur (npm run dev) pour l'initialiser.`
  );
  process.exit(1);
}

const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");

db.exec(`
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
  CREATE INDEX IF NOT EXISTS idx_translation_lang ON produit_translation(lang);
`);

const REPORT = {
  allergens: { matched: 0, unmatched: [], autoCreated: [], inserted: 0 },
  translations: { fr: 0, en: 0, unmatchedIds: [] },
  sheets: { inserted: 0, unmatchedIds: [] },
  pos: { inserted: 0, unresolved: 0 },
};

// ─── Helpers ─────────────────────────────────────────────────────────

function normName(s) {
  if (!s) return "";
  let n = String(s)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Œ/g, "OE")
    .replace(/œ/g, "oe")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  n = n.replace(/^PLAT CHAUD /, "");
  n = n.replace(/\bCHOUX\b/g, "CHOU");
  n = n.replace(/\bRAZ EL HANOUT\b/g, "RAS EL HANOUT");
  return n;
}

// Alias explicites : nom allergène (clé) → nom productsData (valeur).
// Utilisés quand la normalisation n'est pas suffisante.
const NAME_ALIASES = {
  "POULET QUINOA TANDOORI": "POULET TANDOORI QUINOA",
  "GRANDE SALADE BUDDHA BOWL": "GRANDE BUDDHA BOWL",
  "SALADE CHOU ROUGE": "SALADE CHOU ROUGE",
  "SALADE DE CHOU ROUGE": "SALADE CHOU ROUGE",
  "WRAP RAS EL HANOUT": "WRAP POULET RAS EL HANOUT",
  "SALADE RISONI": "SALADE RISONI PESTO",
  "SALADE SUSHI": "GRANDE SALADE SUSHI",
  "Grande salade sushi": "GRANDE SALADE SUSHI",
};

// Catégorie par défaut pour création automatique des produits "fiche only"
// (présents dans allergensData mais absents du menu).
function inferCategoryCode(categoryLabel) {
  const l = String(categoryLabel || "").toLowerCase();
  if (l.includes("soupe")) return "SOUPES";
  if (l.includes("plat")) return "PLATS CHAUDS";
  if (l.includes("quiche")) return "PLATS CHAUDS";
  if (l.includes("salade")) return "SALADES";
  if (l.includes("wrap") || l.includes("bagel") || l.includes("sandwich")) return "SANDWICH";
  if (l.includes("dessert")) return "DESSERTS";
  return "PLATS CHAUDS";
}

function buildNameIndex() {
  const rows = db.prepare("SELECT id, name FROM produit").all();
  const byName = new Map();
  for (const row of rows) {
    byName.set(normName(row.name), row.id);
  }
  return byName;
}

function resolveProduitId(nameIdx, rawName) {
  const n = normName(rawName);
  if (nameIdx.has(n)) return nameIdx.get(n);
  const alias = NAME_ALIASES[n];
  if (alias) {
    const an = normName(alias);
    if (nameIdx.has(an)) return nameIdx.get(an);
  }
  return null;
}

// ─── 1. Allergènes ───────────────────────────────────────────────────

async function migrateAllergens() {
  console.log("\n[1/4] Allergènes depuis allergensData.js …");
  const mod = await import(
    path.join(ROOT, "frontend/src/data/allergensData.js")
  );
  const rows = mod.ALLERGEN_ROWS || [];

  let nameIdx = buildNameIndex();
  const allergenIdByCode = Object.fromEntries(
    db.prepare("SELECT code, id FROM allergene").all().map((r) => [r.code, r.id])
  );
  const catIdByCode = Object.fromEntries(
    db.prepare("SELECT code, id FROM category").all().map((r) => [r.code, r.id])
  );

  const upsertProduitAllergene = db.prepare(
    "INSERT OR IGNORE INTO produit_allergene (produit_id, allergene_id) VALUES (?, ?)"
  );
  const clearProduitAllergens = db.prepare(
    "DELETE FROM produit_allergene WHERE produit_id = ?"
  );
  const insertProduit = db.prepare(
    `INSERT INTO produit (name, category_id, visible, sort_order)
     VALUES (?, ?, 0, 9999)`
  );

  const tx = db.transaction(() => {
    for (const row of rows) {
      let produitId = resolveProduitId(nameIdx, row.product);

      if (!produitId) {
        // Création automatique d'un produit masqué pour ne rien perdre.
        const catCode = inferCategoryCode(row.category);
        const catId = catIdByCode[catCode] || catIdByCode["PLATS CHAUDS"] || 3;
        const info = insertProduit.run(row.product, catId);
        produitId = Number(info.lastInsertRowid);
        nameIdx.set(normName(row.product), produitId);
        REPORT.allergens.autoCreated.push(
          `${row.product} (id=${produitId}, cat=${catCode})`
        );
      }

      clearProduitAllergens.run(produitId);
      for (const code of row.allergens || []) {
        const aid = allergenIdByCode[code];
        if (!aid) continue;
        upsertProduitAllergene.run(produitId, aid);
        REPORT.allergens.inserted += 1;
      }
      REPORT.allergens.matched += 1;
    }
  });
  tx();

  console.log(
    `   ✓ ${REPORT.allergens.matched} produits mappés, ${REPORT.allergens.inserted} liaisons, ${REPORT.allergens.autoCreated.length} produits auto-créés`
  );
}

// ─── 2. Traductions ──────────────────────────────────────────────────

function migrateTranslations() {
  console.log("\n[2/4] Traductions depuis fr.json / en.json …");
  const existing = new Set(
    db.prepare("SELECT id FROM produit").all().map((r) => r.id)
  );

  const upsert = db.prepare(
    `INSERT INTO produit_translation (produit_id, lang, name, description, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(produit_id, lang) DO UPDATE SET
       name = excluded.name,
       description = excluded.description,
       updated_at = datetime('now')`
  );

  const files = [
    { lang: "fr", path: "frontend/src/locales/fr.json" },
    { lang: "en", path: "frontend/src/locales/en.json" },
  ];

  const unmatched = new Set();
  const tx = db.transaction(() => {
    for (const { lang, path: rel } of files) {
      const json = JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
      const items = json?.products?.items || {};
      for (const [idStr, entry] of Object.entries(items)) {
        const id = Number(idStr);
        if (!existing.has(id)) {
          unmatched.add(id);
          continue;
        }
        upsert.run(
          id,
          lang,
          entry.name || "",
          entry.description || null
        );
        REPORT.translations[lang] += 1;
      }
    }
  });
  tx();

  REPORT.translations.unmatchedIds = [...unmatched].sort((a, b) => a - b);
  console.log(
    `   ✓ FR:${REPORT.translations.fr}  EN:${REPORT.translations.en}  non-matchés(ids):${REPORT.translations.unmatchedIds.length}`
  );
}

// ─── 3. Fiches enrichies ─────────────────────────────────────────────

async function migrateSheets() {
  console.log("\n[3/4] Fiches enrichies depuis productSheetData.js …");
  const mod = await import(
    path.join(ROOT, "frontend/src/data/productSheetData.js")
  );
  const data = mod.PRODUCT_SHEET_DATA || {};

  const existing = new Set(
    db.prepare("SELECT id FROM produit").all().map((r) => r.id)
  );

  const upsert = db.prepare(
    `INSERT INTO produit_sheet
       (produit_id, why_good, benefits_json, key_ingredients_json, formulas_json, is_vegetarian, is_vegan, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(produit_id) DO UPDATE SET
       why_good = excluded.why_good,
       benefits_json = excluded.benefits_json,
       key_ingredients_json = excluded.key_ingredients_json,
       formulas_json = excluded.formulas_json,
       is_vegetarian = excluded.is_vegetarian,
       is_vegan = excluded.is_vegan,
       updated_at = datetime('now')`
  );

  const unmatched = [];
  const tx = db.transaction(() => {
    for (const [idStr, sheet] of Object.entries(data)) {
      const id = Number(idStr);
      if (!existing.has(id)) {
        unmatched.push(id);
        continue;
      }
      upsert.run(
        id,
        sheet.whyGood || null,
        JSON.stringify(sheet.benefits || []),
        JSON.stringify(sheet.keyIngredients || []),
        JSON.stringify(sheet.formulas || []),
        sheet.isVegetarian ? 1 : 0,
        sheet.isVegan ? 1 : 0
      );
      REPORT.sheets.inserted += 1;
    }
  });
  tx();

  REPORT.sheets.unmatchedIds = unmatched.sort((a, b) => a - b);
  console.log(
    `   ✓ ${REPORT.sheets.inserted} fiches insérées, ${REPORT.sheets.unmatchedIds.length} id(s) non-matché(s)`
  );
}

// ─── 4. Mapping POS ──────────────────────────────────────────────────

function parseCsvLine(line, sep = ";") {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === sep) {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

function migratePosMapping() {
  console.log("\n[4/4] Mapping POS depuis mapping-pos-to-db.csv …");
  const csvPath = path.join(ROOT, "server/data/mapping-pos-to-db.csv");
  if (!fs.existsSync(csvPath)) {
    console.log("   (fichier absent, skip)");
    return;
  }
  const raw = fs.readFileSync(csvPath, "utf8").replace(/\r/g, "");
  const lines = raw.split("\n").filter((l) => l.trim().length > 0);
  const headers = parseCsvLine(lines[0]);
  const idx = Object.fromEntries(headers.map((h, i) => [h.trim(), i]));

  const existing = new Set(
    db.prepare("SELECT id FROM produit").all().map((r) => r.id)
  );

  db.exec("DELETE FROM pos_mapping");

  const insert = db.prepare(
    `INSERT INTO pos_mapping
       (pos_sku, pos_name, pos_button_name, pos_type, pos_price, produit_id, alias_type, confidence, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const tx = db.transaction(() => {
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      const sku = cols[idx.sku_pos]?.trim() || null;
      const posName = cols[idx.nom_pos]?.trim() || null;
      const posButton = cols[idx.nom_bouton_pos]?.trim() || null;
      const posType = cols[idx.type_csv]?.trim() || null;
      const rawPrice = cols[idx.prix_pos]?.trim();
      const price =
        rawPrice && !Number.isNaN(Number(rawPrice.replace(",", ".")))
          ? Number(rawPrice.replace(",", "."))
          : null;
      const idSiteRaw = cols[idx.id_site]?.trim();
      const idSite = idSiteRaw ? Number(idSiteRaw) : null;
      const produitId = idSite && existing.has(idSite) ? idSite : null;
      if (idSite && !produitId) REPORT.pos.unresolved += 1;
      const confidence = cols[idx.confiance]?.trim() || null;
      const note = cols[idx.note]?.trim() || null;
      const aliasType =
        confidence === "alias_sku" || confidence === "alias_nom"
          ? confidence
          : null;

      insert.run(
        sku,
        posName,
        posButton,
        posType,
        price,
        produitId,
        aliasType,
        confidence,
        note
      );
      REPORT.pos.inserted += 1;
    }
  });
  tx();

  console.log(
    `   ✓ ${REPORT.pos.inserted} lignes POS insérées (${REPORT.pos.unresolved} id_site non résolus)`
  );
}

// ─── Rapport ─────────────────────────────────────────────────────────

function printReport() {
  console.log("\n" + "=".repeat(64));
  console.log("RAPPORT DE MIGRATION");
  console.log("=".repeat(64));

  console.log(`\n▸ Allergènes`);
  console.log(`    Produits mappés : ${REPORT.allergens.matched}`);
  console.log(`    Liaisons        : ${REPORT.allergens.inserted}`);
  if (REPORT.allergens.autoCreated.length) {
    console.log(
      `    Produits auto-créés (visible=0, ${REPORT.allergens.autoCreated.length}) :`
    );
    for (const p of REPORT.allergens.autoCreated) console.log(`      - ${p}`);
  }
  if (REPORT.allergens.unmatched.length) {
    console.log(
      `    Non-matchés (${REPORT.allergens.unmatched.length}) :`
    );
    for (const p of REPORT.allergens.unmatched) console.log(`      - ${p}`);
  }

  console.log(`\n▸ Traductions`);
  console.log(`    FR : ${REPORT.translations.fr}`);
  console.log(`    EN : ${REPORT.translations.en}`);
  if (REPORT.translations.unmatchedIds.length) {
    console.log(
      `    IDs non-matchés (${REPORT.translations.unmatchedIds.length}) : ${REPORT.translations.unmatchedIds.join(", ")}`
    );
  }

  console.log(`\n▸ Fiches enrichies`);
  console.log(`    Insérées : ${REPORT.sheets.inserted}`);
  if (REPORT.sheets.unmatchedIds.length) {
    console.log(
      `    IDs non-matchés (${REPORT.sheets.unmatchedIds.length}) : ${REPORT.sheets.unmatchedIds.join(", ")}`
    );
  }

  console.log(`\n▸ Mapping POS`);
  console.log(`    Lignes insérées  : ${REPORT.pos.inserted}`);
  console.log(`    id_site orphelins: ${REPORT.pos.unresolved}`);

  const totals = db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM produit) AS produits,
        (SELECT COUNT(*) FROM produit_allergene) AS liaisons_allergenes,
        (SELECT COUNT(*) FROM produit_translation) AS traductions,
        (SELECT COUNT(*) FROM produit_sheet) AS fiches,
        (SELECT COUNT(*) FROM pos_mapping) AS pos`
    )
    .get();
  console.log("\n" + "=".repeat(64));
  console.log("ÉTAT FINAL DE LA BDD");
  console.log("=".repeat(64));
  for (const [k, v] of Object.entries(totals)) {
    console.log(`  ${k.padEnd(22)} : ${v}`);
  }
  console.log();
}

// ─── Main ────────────────────────────────────────────────────────────

(async () => {
  try {
    await migrateAllergens();
    migrateTranslations();
    await migrateSheets();
    migratePosMapping();
    printReport();
    db.close();
    console.log("✓ Migration terminée.\n");
  } catch (err) {
    console.error("ERREUR :", err);
    process.exit(1);
  }
})();
