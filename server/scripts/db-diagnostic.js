/**
 * Affiche un diagnostic de l'état de la BDD (compteurs et couverture).
 * Usage : node server/scripts/db-diagnostic.js
 */

import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../data/soupjuice.db");

const db = new Database(DB_PATH, { readonly: true });

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

console.log("\n=== Compteurs par table ===");
for (const t of tables) {
  try {
    const { c } = db.prepare(`SELECT COUNT(*) AS c FROM ${t}`).get();
    console.log(`  ${t.padEnd(24)} : ${c}`);
  } catch {
    console.log(`  ${t.padEnd(24)} : (table absente)`);
  }
}

console.log("\n=== Couverture produits ===");
const totalProduits = db.prepare(`SELECT COUNT(*) AS c FROM produit`).get().c;
console.log(`  Produits total           : ${totalProduits}`);

try {
  const noAllerg = db
    .prepare(
      `SELECT COUNT(*) AS c FROM produit p
       WHERE NOT EXISTS (SELECT 1 FROM produit_allergene pa WHERE pa.produit_id = p.id)`
    )
    .get().c;
  console.log(`  Sans allergène           : ${noAllerg}`);
} catch { /* ignore */ }

try {
  const noFr = db
    .prepare(
      `SELECT COUNT(*) AS c FROM produit p
       WHERE NOT EXISTS (SELECT 1 FROM produit_translation t WHERE t.produit_id = p.id AND t.lang = 'fr')`
    )
    .get().c;
  const noEn = db
    .prepare(
      `SELECT COUNT(*) AS c FROM produit p
       WHERE NOT EXISTS (SELECT 1 FROM produit_translation t WHERE t.produit_id = p.id AND t.lang = 'en')`
    )
    .get().c;
  console.log(`  Sans traduction FR       : ${noFr}`);
  console.log(`  Sans traduction EN       : ${noEn}`);
} catch { /* ignore */ }

try {
  const noSheet = db
    .prepare(
      `SELECT COUNT(*) AS c FROM produit p
       WHERE NOT EXISTS (SELECT 1 FROM produit_sheet s WHERE s.produit_id = p.id)`
    )
    .get().c;
  console.log(`  Sans fiche enrichie      : ${noSheet}`);
} catch { /* ignore */ }

console.log("\n=== Produits sans allergène (extraits) ===");
try {
  const rows = db
    .prepare(
      `SELECT p.id, p.name, c.code AS cat
       FROM produit p JOIN category c ON c.id = p.category_id
       WHERE NOT EXISTS (SELECT 1 FROM produit_allergene pa WHERE pa.produit_id = p.id)
         AND p.visible = 1
       ORDER BY c.sort_order, p.sort_order
       LIMIT 30`
    )
    .all();
  if (!rows.length) console.log("  (aucun)");
  for (const r of rows)
    console.log(`  [${String(r.id).padStart(3)}] ${r.cat.padEnd(14)} ${r.name}`);
} catch { /* ignore */ }

console.log();
db.close();
