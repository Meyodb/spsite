import { ProductImageCarousel } from "./ProductImageCarousel";
import { resolveImageProductId } from "../utils/productImages";

/**
 * Affiche la photo d'un produit (ou carrousel si imageCount > 1).
 */
export function ProductImage({ productId, alt, className, imageCount = 1 }) {
  return (
    <ProductImageCarousel
      productId={resolveImageProductId(productId)}
      alt={alt}
      className={className}
      imageCount={imageCount}
    />
  );
}
