/**
 * Synchronise la visibilité des produits Soup Juice avec la base JDC (dc_product).
 * Règle : fr_visible_user = 1.
 * Correspondance : par nom normalisé (minuscules, sans accents).
 *
 * Variables d'environnement : MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
 * Exemple : MYSQL_HOST=localhost MYSQL_DATABASE=dev_jdc node server/scripts/sync-jdc-visibility.js
 */

import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Charger .env à la racine du projet si présent
try {
  const envPath = path.join(__dirname, "..", "..", ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    content.split("\n").forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    });
  }
} catch (_) {}
const DATA_DIR = path.join(__dirname, "..", "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products-soup-juice.json");
const VISIBLE_FILE = path.join(DATA_DIR, "visible-products.json");

function normalize(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Retourne true si le produit Soup Juice (name) correspond au titre JDC (fr_title).
 * Critère : chaque mot du nom SJ (normalisé) est présent dans le titre JDC normalisé.
 */
function nameMatches(sjName, jdcTitle) {
  const jdcNorm = normalize(jdcTitle);
  const sjNorm = normalize(sjName);
  const sjWords = sjNorm.split(/\s+/).filter((w) => w.length > 0);
  if (sjWords.length === 0) return false;
  return sjWords.every((word) => jdcNorm.includes(word));
}

/**
 * Pour un titre JDC, trouve le produit Soup Juice qui correspond le mieux (nom le plus long qui matche).
 */
function findBestMatch(jdcTitle, sjProducts) {
  const sorted = [...sjProducts].sort((a, b) => (b.name.length - a.name.length));
  return sorted.find((p) => nameMatches(p.name, jdcTitle)) ?? null;
}

async function run() {
  const host = process.env.MYSQL_HOST || "localhost";
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE || "dev_jdc";

  if (!user || !password) {
    console.error("Définir MYSQL_USER et MYSQL_PASSWORD (et optionnellement MYSQL_HOST, MYSQL_DATABASE).");
    process.exit(1);
  }

  const sjProducts = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8"));
  console.log(`Produits Soup Juice chargés : ${sjProducts.length}`);

  const conn = await mysql.createConnection({
    host,
    user,
    password,
    database,
  });

  try {
    const [rows] = await conn.execute(
      "SELECT id, ref, fr_title FROM dc_product WHERE fr_visible_user = 1 AND fr_title IS NOT NULL AND fr_title != ''"
    );
    console.log(`Produits visibles JDC (fr_visible_user=1) : ${rows.length}`);

    const matchedIds = new Set();
    const unmatched = [];

    for (const row of rows) {
      const title = row.fr_title;
      const match = findBestMatch(title, sjProducts);
      if (match) {
        matchedIds.add(match.id);
      } else {
        unmatched.push(title);
      }
    }

    const visibleIds = Array.from(matchedIds).sort((a, b) => a - b);
    const payload = {
      lastSync: new Date().toISOString(),
      visibleIds,
      source: "jdc",
      matchedCount: visibleIds.length,
      jdcVisibleCount: rows.length,
      unmatchedCount: unmatched.length,
    };

    fs.writeFileSync(VISIBLE_FILE, JSON.stringify(payload, null, 2));
    console.log(`Écrit ${VISIBLE_FILE} : ${visibleIds.length} produits visibles.`);
    if (unmatched.length > 0) {
      console.log(`Sans correspondance Soup Juice (${unmatched.length}) :`);
      unmatched.slice(0, 15).forEach((t) => console.log(`  - ${t}`));
      if (unmatched.length > 15) console.log(`  ... et ${unmatched.length - 15} autres`);
    }
  } finally {
    await conn.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
