// Synchronisation du catalogue site ↔ catalogue JDC.
//
// MODÈLE (v2) :
//   - JDC = source du catalogue : chaque produit JDC dont la catégorie est
//     mappée à une catégorie site `managed_by='jdc'` est créé / réactivé côté site.
//   - Les produits site avec `jdc_id` mais absents du catalogue JDC sont masqués
//     (uniquement dans les catégories `managed_by='jdc'`).
//   - Les catégories `managed_by='site'` (Jus, Milkshakes, Boosters, Goodies)
//     sont 100 % manuelles : JDC est ignoré pour ces catégories.
//   - Les métadonnées riches du site (description, image_alt, allergènes,
//     traductions, fiches enrichies) sont conservées et restent éditables.
//
// Garde-fou : tant qu'aucun mapping catégorie JDC → catégorie site `'jdc'` n'est
// défini, le sync est skippé (sinon il viderait tout le site).

import { applyJdcCatalogSync, getJdcMappingsSummary } from "./db.js";
import { isJdcSyncProduct } from "./jdc-categories.js";

const DEFAULT_URL =
  "https://kmtmwnxtnzqbynhoztks.supabase.co/functions/v1/public-products";

let lastSync = {
  ran_at: null,
  status: "idle", // 'idle' | 'ok' | 'error' | 'running'
  duration_ms: null,
  source_url: null,
  jdc_received: 0,
  matched_in_jdc: 0,
  mapped: 0,
  total: 0,
  visible_before: null,
  visible_after: null,
  activated: 0,
  deactivated: 0,
  created: [], // [{ id, jdc_id, name }]
  ignored_categories: {}, // { 'NomCategorieJDC': count }
  skipped: null, // 'no_category_mappings' | null
  error: null,
};

let interval = null;
let running = false;

function getConfig() {
  return {
    enabled: process.env.JDC_SYNC_ENABLED !== "0",
    url: process.env.JDC_PUBLIC_PRODUCTS_URL || DEFAULT_URL,
    anonKey: (process.env.JDC_ANON_KEY || "").trim() || null,
    intervalMin: Math.max(
      0,
      Number.parseInt(process.env.JDC_SYNC_INTERVAL_MIN || "30", 10) || 0
    ),
  };
}

async function fetchJdcProducts() {
  const { url, anonKey } = getConfig();
  const headers = { Accept: "application/json" };
  if (anonKey) {
    headers.apikey = anonKey;
    headers.Authorization = `Bearer ${anonKey}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${text.slice(0, 200)}`);
  }

  let payload;
  try {
    payload = await res.json();
  } catch (err) {
    throw new Error(`Réponse non-JSON : ${err.message}`);
  }

  const products = Array.isArray(payload?.products)
    ? payload.products
    : Array.isArray(payload)
      ? payload
      : null;
  if (!products) {
    throw new Error("Réponse JDC inattendue : champ `products` absent.");
  }

  return products;
}

// Exécute un cycle de synchronisation.
// `manualSource` est un libellé optionnel pour traçer l'origine (boot, cron, admin).
export async function runJdcSync({ source = "manual" } = {}) {
  if (running) {
    return { ok: false, error: "Sync déjà en cours.", lastSync };
  }
  running = true;
  lastSync = { ...lastSync, status: "running", error: null };

  const start = Date.now();
  const { url } = getConfig();

  try {
    const products = await fetchJdcProducts();
    const stats = applyJdcCatalogSync(products);
    const duration_ms = Date.now() - start;

    lastSync = {
      ran_at: new Date().toISOString(),
      status: "ok",
      duration_ms,
      source_url: url,
      jdc_received: stats.jdc_received,
      matched_in_jdc: stats.matched_in_jdc ?? 0,
      mapped: stats.mapped ?? 0,
      total: stats.total ?? 0,
      visible_before: stats.visible_before,
      visible_after: stats.visible_after,
      activated: stats.activated ?? 0,
      deactivated: stats.deactivated ?? 0,
      created: stats.created ?? [],
      ignored_categories: stats.ignored_categories ?? {},
      skipped: stats.skipped ?? null,
      error: null,
    };

    if (stats.skipped === "no_category_mappings") {
      console.log(
        `[JDC sync ${source}] ignoré : aucun mapping catégorie JDC → site défini (reçus=${stats.jdc_received}). ` +
          `Mappe au moins une catégorie dans l'admin pour armer la synchro.`
      );
    } else {
      console.log(
        `[JDC sync ${source}] reçus=${stats.jdc_received} créés=${(stats.created || []).length} ` +
          `+${stats.activated || 0} réactivés, -${stats.deactivated || 0} désactivés ` +
          `(en ${duration_ms} ms)`
      );
    }

    return { ok: true, lastSync, skipped: stats.skipped || null };
  } catch (err) {
    const duration_ms = Date.now() - start;
    lastSync = {
      ...lastSync,
      ran_at: new Date().toISOString(),
      status: "error",
      duration_ms,
      source_url: url,
      error: String(err?.message || err),
    };
    console.error(`[JDC sync ${source}] échec :`, err?.message || err);
    return { ok: false, error: lastSync.error, lastSync };
  } finally {
    running = false;
  }
}

export function getJdcSyncStatus() {
  const cfg = getConfig();
  const mappings = getJdcMappingsSummary();
  return {
    config: {
      enabled: cfg.enabled,
      url: cfg.url,
      interval_min: cfg.intervalMin,
      has_anon_key: !!cfg.anonKey,
    },
    catalog: {
      total_products: mappings.total,
      mapped_products: mappings.mapped,
      visible_products: mappings.visible,
    },
    last_sync: lastSync,
  };
}

// À appeler une fois au démarrage du serveur.
// - Si activé, lance un sync « best-effort » au boot puis met en place l'intervalle.
// - Si désactivé, ne fait rien.
export function startJdcSyncScheduler() {
  const cfg = getConfig();
  if (!cfg.enabled) {
    console.log("[JDC sync] désactivé via JDC_SYNC_ENABLED=0");
    return;
  }

  runJdcSync({ source: "boot" }).catch((err) => {
    console.error("[JDC sync boot] erreur inattendue :", err);
  });

  if (cfg.intervalMin > 0) {
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      runJdcSync({ source: "cron" }).catch((err) => {
        console.error("[JDC sync cron] erreur inattendue :", err);
      });
    }, cfg.intervalMin * 60_000);
    console.log(
      `[JDC sync] planifié toutes les ${cfg.intervalMin} min depuis ${cfg.url}`
    );
  } else {
    console.log(
      `[JDC sync] auto-refresh désactivé (JDC_SYNC_INTERVAL_MIN=0). Sync au boot uniquement.`
    );
  }
}

// Liste des produits JDC actuels (pour aider à mapper dans l'UI admin).
// Renvoie [{ id, name, category_name }] — pas de cache, appelé à la demande.
export async function fetchJdcCatalog() {
  const products = await fetchJdcProducts();
  return products.filter(isJdcSyncProduct).map((p) => ({
    id: String(p?.id || ""),
    name: String(p?.name || ""),
    category_id: p?.category_id || null,
    category_name: p?.category_name || null,
    unit: p?.unit || null,
    price_b2c: p?.price_b2c ?? null,
  }));
}
