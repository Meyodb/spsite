/**
 * Construction des URL de photos produit.
 *
 * Convention : public/images/products/{id}.{ext} pour la première image,
 * puis {id}_2.{ext}, {id}_3.{ext}... pour les suivantes.
 */

// Formats essayés en fallback (pas de webp/avif : les photos produit sont
// déposées telles quelles depuis le back-office).
export const PRODUCT_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg"];

/**
 * Alias d'ID : permet à un produit d'afficher la photo d'un autre.
 * Ex. Tortellini pesto rouge (42) réutilise la photo des pâtes au pesto (90).
 */
const IMAGE_ID_ALIAS = {
  42: 90,
  260: 90,
  186: 185, // CHAMPIGNONS MIEL → CHAMPIGNONS
  191: 190, // CAROTTE ORANGE → CAROTTES POMMES ET CURRY
  212: 211, // POTIMARRON AU LAIT DE COCO → POTIMARRON
};

const IMG_BASE_URL = import.meta.env.VITE_IMG_BASE_URL || "";

// Change à chaque build pour forcer le rechargement des photos mises à jour.
const BUILD_VERSION = typeof __BUILD_VERSION__ !== "undefined" ? __BUILD_VERSION__ : "";

export function resolveImageProductId(productId) {
  return IMAGE_ID_ALIAS[productId] ?? productId;
}

function withImageBase(path) {
  if (!IMG_BASE_URL) return path;
  const base = IMG_BASE_URL.endsWith("/") ? IMG_BASE_URL.slice(0, -1) : IMG_BASE_URL;
  return `${base}${path}`;
}

function withCacheBust(url) {
  if (!BUILD_VERSION) return url;
  return url.includes("?") ? `${url}&v=${BUILD_VERSION}` : `${url}?v=${BUILD_VERSION}`;
}

export function getProductImageUrl(productId, ext = "jpg") {
  return getSlideUrl(resolveImageProductId(productId), 0, ext);
}

export function getSlideUrl(productId, slideIndex, ext = "png") {
  const suffix = slideIndex === 0 ? "" : `_${slideIndex + 1}`;
  return withCacheBust(withImageBase(`/images/products/${productId}${suffix}.${ext}`));
}
