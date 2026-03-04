import { ProductImageCarousel } from "./ProductImageCarousel";

/**
 * Alias d'ID pour les images produit.
 * Permet par exemple de faire afficher à SLIM DÉTOX (id 1) la photo de MISS SLIM (id 222).
 */
const IMAGE_ID_ALIAS = {
  1: 222,
};

function resolveImageProductId(productId) {
  return IMAGE_ID_ALIAS[productId] ?? productId;
}

/**
 * URL de l'image d'un produit par convention : public/images/products/{id}.{ext}
 */
export function getProductImageUrl(productId, ext = "jpg") {
  const imageProductId = resolveImageProductId(productId);
  return `/images/products/${imageProductId}.${ext}`;
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
