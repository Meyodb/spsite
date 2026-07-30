import { ProductImageCarousel } from "./ProductImageCarousel";

/**
 * Alias d'ID pour les images produit.
 * Permet par exemple de faire afficher à Tortellini pesto rouge (id 42) la photo des pâtes au pesto (id 90).
 */
const IMAGE_ID_ALIAS = {
  42: 90, // Tortellini pesto rouge : affiche la photo des pâtes au pesto (fusion)
  260: 90, // Pâtes végétarienne pesto (JDC) : affiche la photo des pâtes au pesto
  // Soupes : partage d'images pour recettes similaires
  186: 185, // CHAMPIGNONS MIEL → CHAMPIGNONS
  191: 190, // CAROTTE ORANGE → CAROTTES POMMES ET CURRY
  212: 211, // POTIMARRON AU LAIT DE COCO → POTIMARRON
};

function resolveImageProductId(productId) {
  return IMAGE_ID_ALIAS[productId] ?? productId;
}

const IMG_BASE_URL = import.meta.env.VITE_IMG_BASE_URL || "";
// Cache-busting : change à chaque build (donc à chaque `npm run restart`)
// pour forcer le navigateur à recharger les photos produits.
const BUILD_VERSION = typeof __BUILD_VERSION__ !== "undefined" ? __BUILD_VERSION__ : "";

function withImageBase(path) {
  if (!IMG_BASE_URL) return path;
  const base = IMG_BASE_URL.endsWith("/") ? IMG_BASE_URL.slice(0, -1) : IMG_BASE_URL;
  return `${base}${path}`;
}

function withCacheBust(url) {
  if (!BUILD_VERSION) return url;
  return url.includes("?") ? `${url}&v=${BUILD_VERSION}` : `${url}?v=${BUILD_VERSION}`;
}

/**
 * URL de l'image d'un produit par convention : public/images/products/{id}.{ext}
 * Si VITE_IMG_BASE_URL est défini, on pointe vers le CDN.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function getProductImageUrl(productId, ext = "jpg") {
  const imageProductId = resolveImageProductId(productId);
  return withCacheBust(withImageBase(`/images/products/${imageProductId}.${ext}`));
}

/**
 * Affiche la photo d'un produit (ou carrousel si imageCount > 1).
 * Convention multi-images : {id}.png (1ère), {id}_2.png, {id}_3.png...
 */
export function ProductImage({ productId, alt, className, imageCount = 1 }) {
  const imageProductId = resolveImageProductId(productId);
  return (
    <ProductImageCarousel
      productId={imageProductId}
      alt={alt}
      className={className}
      imageCount={imageCount}
    />
  );
}
