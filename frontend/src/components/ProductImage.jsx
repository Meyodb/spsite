import { ProductImageCarousel } from "./ProductImageCarousel";

/**
 * URL de l'image d'un produit par convention : public/images/products/{id}.{ext}
 */
export function getProductImageUrl(productId, ext = "jpg") {
  return `/images/products/${productId}.${ext}`;
}

/**
 * Affiche la photo d'un produit (ou carrousel si imageCount > 1).
 * Convention multi-images : {id}.png (1ère), {id}_2.png, {id}_3.png...
 */
export function ProductImage({ productId, alt, className, imageCount = 1 }) {
  return (
    <ProductImageCarousel
      productId={productId}
      alt={alt}
      className={className}
      imageCount={imageCount}
    />
  );
}
