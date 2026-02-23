import { useEffect, useState, useCallback, useRef } from "react";
import { ProductImage } from "./ProductImage";
import "./ProductImageLightbox.css";

const CLOSE_DURATION_MS = 280;

/**
 * Lightbox pour afficher la photo d'un produit en grand.
 * Fermeture : clic sur le fond, sur le bouton ou touche Échap.
 */
export function ProductImageLightbox({ open, onClose, productId, alt }) {
  const [isClosing, setIsClosing] = useState(false);
  const handleCloseRef = useRef(() => {});

  const handleClose = useCallback(() => {
    setIsClosing((prev) => {
      if (prev) return prev;
      return true;
    });
  }, []);

  handleCloseRef.current = handleClose;

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") handleCloseRef.current();
    };
    document.addEventListener("keydown", handleEscape);
    const raf = requestAnimationFrame(() => {
      document.body.style.overflow = "hidden";
    });
    return () => {
      document.removeEventListener("keydown", handleEscape);
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!isClosing) return;
    const t = setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, CLOSE_DURATION_MS);
    return () => clearTimeout(t);
  }, [isClosing, onClose]);

  if (!open || !productId) return null;

  return (
    <div
      className={`product-image-lightbox ${isClosing ? "product-image-lightbox--closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={alt ?? "Photo du produit"}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <button
        type="button"
        className="product-image-lightbox-close"
        onClick={handleClose}
        aria-label="Fermer"
      >
        ×
      </button>
      <div className="product-image-lightbox-content" onClick={(e) => e.stopPropagation()}>
        <ProductImage
          productId={productId}
          alt={alt ?? ""}
          className="product-image-lightbox-img"
        />
      </div>
    </div>
  );
}
