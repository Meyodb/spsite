// Catégories JDC : matières premières / entretien (jamais synchronisées).
export const JDC_SUPPLY_CATEGORIES = new Set([
  "Antipasti",
  "Produit d'entretien",
  "Fruits et pulpe",
  "Sauces",
  "Produits de la mer",
  "Pains sandwiches",
]);

// Catégories JDC produit fini mais gérées manuellement sur le site (pas de sync).
// Les pâtisseries (Desserts / Desserts individuels / Cakes sucrés) sont aussi
// gérées manuellement car elles changent souvent et ont leurs fiches site enrichies.
export const JDC_MANUAL_SITE_CATEGORIES = new Set([
  "Boissons",
  "Goodies",
  "Desserts",
  "Desserts individuels",
  "Cakes sucrés",
]);

// Catégories site toujours hors sync JDC (100 % manuelles).
export const SITE_MANAGED_CATEGORY_CODES = new Set([
  "JUS",
  "MILKSHAKES",
  "BOOSTERS",
  "GOODIES",
  "BOISSONS",
  "DESSERTS",
]);

/** Produit JDC éligible à la synchronisation catalogue site. */
export function isJdcSyncProduct(product) {
  const name = String(product?.category_name || "").trim();
  if (!name) return false;
  if (JDC_SUPPLY_CATEGORIES.has(name)) return false;
  if (JDC_MANUAL_SITE_CATEGORIES.has(name)) return false;
  return true;
}

/** @deprecated Utiliser isJdcSyncProduct */
export function isJdcFinishedProduct(product) {
  return isJdcSyncProduct(product);
}

export function getJdcSyncCategoryNames(categoryNames) {
  return (categoryNames || []).filter(
    (n) => n && !JDC_SUPPLY_CATEGORIES.has(n) && !JDC_MANUAL_SITE_CATEGORIES.has(n)
  );
}

// Département caisse → catégories JDC synchronisées.
export const POS_DEPT_TO_JDC_SYNC = {
  soupes: ["Soupes"],
  "formules soupe": ["Soupes"],
  plats: ["Plats chauds"],
  salade: ["Salades"],
  sandwich: ["Sandwichs"],
};

// Département caisse → catégorie site gérée manuellement (hors sync JDC).
export const POS_DEPT_TO_SITE_MANUAL = {
  "jus de fruits": "JUS",
  "jus de fruit": "JUS",
  "formules jus": "JUS",
  soft: "BOISSONS",
  boissons: "BOISSONS",
  "boissons à emporter": "BOISSONS",
  biere: "BOISSONS",
  autres: "BOISSONS",
  divers: "GOODIES",
  desserts: "DESSERTS",
  dessert: "DESSERTS",
};
