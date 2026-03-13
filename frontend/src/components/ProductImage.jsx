import { ProductImageCarousel } from "./ProductImageCarousel";

/**
 * Alias d'ID pour les images produit.
 * Permet par exemple de faire afficher à SLIM DÉTOX (id 1) la photo de MISS SLIM (id 222).
 */
const IMAGE_ID_ALIAS = {
  1: 222,
  42: 90, // Tortellini pesto rouge : affiche la photo des pâtes au pesto (fusion)
  // Soupes : partage d'images pour recettes similaires
  186: 185, // CHAMPIGNONS MIEL → CHAMPIGNONS
  191: 190, // CAROTTE ORANGE → CAROTTES POMMES ET CURRY
  212: 211, // POTIMARRON AU LAIT DE COCO → POTIMARRON
};

function resolveImageProductId(productId) {
  return IMAGE_ID_ALIAS[productId] ?? productId;
}

const IMG_BASE_URL = import.meta.env.VITE_IMG_BASE_URL || "";

function withImageBase(path) {
  if (!IMG_BASE_URL) return path;
  const base = IMG_BASE_URL.endsWith("/") ? IMG_BASE_URL.slice(0, -1) : IMG_BASE_URL;
  return `${base}${path}`;
}

/**
 * URL de l'image d'un produit par convention : public/images/products/{id}.{ext}
 * Si VITE_IMG_BASE_URL est défini, on pointe vers le CDN.
 */
export function getProductImageUrl(productId, ext = "jpg") {
  const imageProductId = resolveImageProductId(productId);
  return withImageBase(`/images/products/${imageProductId}.${ext}`);
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
