import { useState, useCallback } from "react";
import placeholder from "../assets/images/product-placeholder.svg";

const EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

/**
 * URL de l'image d'un produit par convention : public/images/products/{id}.{ext}
 * Déposer les photos dans public/images/products/ avec le nom = id du produit (ex: 26.png, 1.jpg).
 * Extensions acceptées : .png, .jpg, .jpeg, .webp
 */
export function getProductImageUrl(productId, ext = "jpg") {
  return `/images/products/${productId}.${ext}`;
}

/**
 * Affiche la photo d'un produit avec repli sur un placeholder si l'image est absente ou en erreur.
 * Essaie les extensions .png, .jpg, .jpeg, .webp dans cet ordre.
 */
export function ProductImage({ productId, alt, className }) {
  const [tryIndex, setTryIndex] = useState(0);
  const urls = EXTENSIONS.map((ext) => getProductImageUrl(productId, ext));
  const src = tryIndex >= urls.length ? placeholder : urls[tryIndex];

  const onError = useCallback(() => {
    setTryIndex((i) => (i + 1 < urls.length ? i + 1 : urls.length));
  }, [urls.length]);

  return (
    <img
      src={src}
      alt={alt ?? ""}
      className={className}
      loading="lazy"
      onError={onError}
    />
  );
}
