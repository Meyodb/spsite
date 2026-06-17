#!/usr/bin/env node
// Synchronise la BDD SQLite vers les fichiers JS/JSON du frontend.
// À exécuter après une édition via l'admin UI pour que la source JS reste
// cohérente tant que le frontend utilise encore les fichiers plutôt que l'API.
//
// Usage:
//   node server/scripts/sync-to-js.js [--dry]
//
// Produit :
//   - frontend/src/data/allergensData.js (ALLERGEN_ROWS reconstruit)
//   - frontend/src/locales/fr.json (clés products.<id>.name/description)
//   - frontend/src/locales/en.json (idem)

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const DB_PATH = path.resolve(__dirname, "..", "data", "soupjuice.db");
const ALLERGENS_JS = path.join(ROOT, "frontend", "src", "data", "allergensData.js");
const LOCALE_FR = path.join(ROOT, "frontend", "src", "locales", "fr.json");
const LOCALE_EN = path.join(ROOT, "frontend", "src", "locales", "en.json");

const DRY = process.argv.includes("--dry");

const db = new Database(DB_PATH, { readonly: true });

// ─── Helpers ───────────────────────────────────────────────────────────

function readFileSafe(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function writeFile(p, content) {
  if (DRY) {
    console.log(`  [dry] would write ${path.relative(ROOT, p)} (${content.length} chars)`);
    return;
  }
  fs.writeFileSync(p, content, "utf8");
  console.log(`  ✓ ${path.relative(ROOT, p)}`);
}

// Lit la liste des catégories logiques utilisées dans allergensData.js
// (structure legacy), en les reconstituant depuis subcategory sinon category.label_fr.
function inferLegacyCategory(product) {
  const sub = (product.subcategory || "").trim();
  if (sub) return sub;
  return product.category_label || product.category_code;
}

// ─── Génération allergensData.js ──────────────────────────────────────

function buildAllergensJs() {
  const rows = db
    .prepare(
      `SELECT
         p.id,
         p.name,
         p.subcategory,
         c.code AS category_code,
         c.label_fr AS category_label,
         p.sort_order,
         GROUP_CONCAT(a.code, '|') AS allergen_codes,
         MIN(a.sort_order) AS min_sort
       FROM produit p
       JOIN category c ON c.id = p.category_id
       LEFT JOIN produit_allergene pa ON pa.produit_id = p.id
       LEFT JOIN allergene a ON a.id = pa.allergene_id
       GROUP BY p.id
       ORDER BY c.sort_order, p.sort_order, p.id`
    )
    .all();

  const existing = readFileSafe(ALLERGENS_JS);
  if (!existing) {
    throw new Error(`Fichier ${ALLERGENS_JS} introuvable.`);
  }

  // On conserve tête de fichier (keys + labels) et on remplace le bloc ALLERGEN_ROWS.
  const headerEnd = existing.indexOf("export const ALLERGEN_ROWS = [");
  if (headerEnd === -1) {
    throw new Error("Bloc ALLERGEN_ROWS introuvable dans allergensData.js");
  }
  const header = existing.slice(0, headerEnd);

  // Construit les lignes groupées par catégorie.
  const byCategory = new Map();
  for (const row of rows) {
    const cat = inferLegacyCategory(row);
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(row);
  }

  const lines = [];
  lines.push("export const ALLERGEN_ROWS = [");
  let first = true;
  for (const [cat, items] of byCategory) {
    if (!first) lines.push("");
    first = false;
    lines.push(`  /* ${cat} */`);
    for (const item of items) {
      const allergens = item.allergen_codes
        ? item.allergen_codes.split("|").filter(Boolean)
        : [];
      const allergensJson = `[${allergens.map((c) => `"${c}"`).join(", ")}]`;
      lines.push(
        `  { category: ${JSON.stringify(cat)}, product: ${JSON.stringify(item.name)}, allergens: ${allergensJson} },`
      );
    }
  }
  lines.push("];");
  lines.push("");

  return header + lines.join("\n");
}

// ─── Génération fr.json / en.json ─────────────────────────────────────

function patchLocale(lang) {
  const filePath = lang === "fr" ? LOCALE_FR : LOCALE_EN;
  const raw = readFileSafe(filePath);
  if (!raw) {
    console.log(`  ⚠ locale ${lang} introuvable, on saute.`);
    return null;
  }
  const data = JSON.parse(raw);

  const translations = db
    .prepare(
      `SELECT produit_id, name, description
       FROM produit_translation
       WHERE lang = ?`
    )
    .all(lang);

  if (!data.products || typeof data.products !== "object") {
    data.products = {};
  }
  let updated = 0;
  for (const row of translations) {
    const key = String(row.produit_id);
    const prev = data.products[key] || {};
    const next = {
      ...prev,
      name: row.name,
      description: row.description || prev.description || "",
    };
    if (JSON.stringify(prev) !== JSON.stringify(next)) {
      updated += 1;
      data.products[key] = next;
    }
  }

  return { path: filePath, data, updated };
}

// ─── Exécution ────────────────────────────────────────────────────────

(function main() {
  console.log(
    `Synchronisation BDD → JS${DRY ? " [mode dry-run]" : ""}`
  );
  console.log(`  DB : ${path.relative(ROOT, DB_PATH)}`);

  console.log("\n▸ allergensData.js");
  const allergensJs = buildAllergensJs();
  writeFile(ALLERGENS_JS, allergensJs);

  for (const lang of ["fr", "en"]) {
    console.log(`\n▸ locales/${lang}.json`);
    const out = patchLocale(lang);
    if (!out) continue;
    const serialized = JSON.stringify(out.data, null, 2) + "\n";
    console.log(`  produits mis à jour : ${out.updated}`);
    writeFile(out.path, serialized);
  }

  db.close();
  console.log("\n✓ Terminé.");
})();
