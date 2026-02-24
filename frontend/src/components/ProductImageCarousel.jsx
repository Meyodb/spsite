import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import placeholder from "../assets/images/product-placeholder.svg";
import "./ProductImageCarousel.css";

const EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

/**
 * URL de l'image d'un produit.
 * Slide 0 : {id}.{ext}
 * Slide 1+ : {id}_{index+1}.png
 */
function getSlideUrl(productId, slideIndex, ext = "png") {
  if (slideIndex === 0) {
    return `/images/products/${productId}.${ext}`;
  }
  return `/images/products/${productId}_${slideIndex + 1}.${ext}`;
}

/**
 * Carrousel d'images produit avec flèches de défilement.
 * Convention : {id}.png (1ère), {id}_2.png, {id}_3.png...
 */
export function ProductImageCarousel({ productId, alt, className, imageCount = 1 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedSlides, setLoadedSlides] = useState({});

  const totalSlides = Math.max(1, imageCount);
  const showArrows = totalSlides > 1;

  const goPrev = useCallback((e) => {
    e?.stopPropagation();
    setCurrentIndex((i) => (i - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goNext = useCallback((e) => {
    e?.stopPropagation();
    setCurrentIndex((i) => (i + 1) % totalSlides);
  }, [totalSlides]);

  const handleImageError = useCallback((slideIndex) => {
    setLoadedSlides((prev) => {
      if (slideIndex === 0) {
        const extIdx = prev["0_ext"] ?? 0;
        if (extIdx + 1 < EXTENSIONS.length) {
          return { ...prev, "0_ext": extIdx + 1 };
        }
      }
      return { ...prev, [slideIndex]: "error" };
    });
  }, []);

  const handleImageLoad = useCallback((slideIndex) => {
    setLoadedSlides((prev) => ({ ...prev, [slideIndex]: "ok" }));
  }, []);

  if (totalSlides === 1) {
    return <ProductImageCarouselSingle productId={productId} alt={alt} className={className} />;
  }

  const getSrcForSlide = (slideIndex) => {
    if (slideIndex === 0) {
      const extIdx = loadedSlides["0_ext"] ?? 0;
      return getSlideUrl(productId, 0, EXTENSIONS[extIdx] || "png");
    }
    return getSlideUrl(productId, slideIndex);
  };
  const src = getSrcForSlide(currentIndex);
  const hasError = loadedSlides[currentIndex] === "error";

  return (
    <div className={`product-image-carousel ${className || ""}`}>
      <div className="product-image-carousel-track">
        {showArrows && (
          <button
            type="button"
            className="product-image-carousel-arrow product-image-carousel-arrow--prev"
            onClick={goPrev}
            aria-label="Photo précédente"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
        )}
        <div className="product-image-carousel-slide">
          <img
            src={hasError ? placeholder : src}
            alt={`${alt ?? ""} (${currentIndex + 1}/${totalSlides})`}
            className="product-image-carousel-img"
            loading="lazy"
            onError={() => handleImageError(currentIndex)}
            onLoad={() => handleImageLoad(currentIndex)}
          />
        </div>
        {showArrows && (
          <button
            type="button"
            className="product-image-carousel-arrow product-image-carousel-arrow--next"
            onClick={goNext}
            aria-label="Photo suivante"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        )}
      </div>
      {showArrows && (
        <div className="product-image-carousel-dots" aria-hidden>
          {Array.from({ length: totalSlides }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`product-image-carousel-dot ${i === currentIndex ? "active" : ""}`}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
              aria-label={`Photo ${i + 1}`}
              aria-current={i === currentIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Affichage single image (fallback quand imageCount = 1) avec support multi-extensions.
 */
function ProductImageCarouselSingle({ productId, alt, className }) {
  const [tryIndex, setTryIndex] = useState(0);
  const urls = EXTENSIONS.map((ext) => getSlideUrl(productId, 0, ext));
  const src = tryIndex >= urls.length ? placeholder : urls[tryIndex];

  return (
    <img
      src={src}
      alt={alt ?? ""}
      className={className}
      loading="lazy"
      onError={() => setTryIndex((i) => (i + 1 < urls.length ? i + 1 : urls.length))}
    />
  );
}
