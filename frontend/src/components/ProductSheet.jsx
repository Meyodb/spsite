import { useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ZoomIn } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { AllergenPictograms, getAllergensForProduct } from "./AllergenPictograms";
import { PRODUCT_SHEET_DATA } from "../data/productSheetData";
import { CATEGORY_I18N_KEYS } from "../data/productsData";
import "./ProductSheet.css";

/**
 * Fiche produit détaillée (modal).
 * Affiche menu, nutriments, bénéfices, allergènes, formules.
 */
export function ProductSheet({ open, onClose, product, onViewImage }) {
  const { t } = useTranslation();
  const sheetRef = useRef(null);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleClose]);

  if (!open || !product) return null;

  const name = t(`products.items.${product.id}.name`) !== `products.items.${product.id}.name`
    ? t(`products.items.${product.id}.name`)
    : product.name;
  const description = t(`products.items.${product.id}.description`) !== `products.items.${product.id}.description`
    ? t(`products.items.${product.id}.description`)
    : product.description;

  const sheetData = PRODUCT_SHEET_DATA[product.id];
  const hasSheetData = !!sheetData;
  const allergens = getAllergensForProduct(product.name);
  const showAllergensSection = ["PLATS CHAUDS", "SALADES", "SANDWICH"].includes(product.category);

  return (
    <div
      className="product-sheet-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-sheet-title"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        ref={sheetRef}
        className="product-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="product-sheet-close"
          onClick={handleClose}
          aria-label="Fermer"
        >
          ×
        </button>

        <div className="product-sheet-content">
          <div className="product-sheet-image-wrap">
            <ProductImage
              productId={product.id}
              alt={name}
              className="product-sheet-image"
            />
            {onViewImage && (
              <button
                type="button"
                className="product-sheet-image-zoom"
                onClick={() => onViewImage(product.id, name)}
                aria-label={`Voir ${name} en grand`}
              >
                <ZoomIn size={22} strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="product-sheet-body">
            <h1 id="product-sheet-title" className="product-sheet-name">
              {name}
            </h1>

            <div className="product-sheet-meta">
              <span className="product-sheet-category">
                {t(`products.categories.${CATEGORY_I18N_KEYS[product.category] || product.category}`)}
              </span>
              {product.price && (
                <span className="product-sheet-price">
                  {product.price.replace(".", ",")}€
                </span>
              )}
            </div>

            {description && (
              <p className="product-sheet-description">{description}</p>
            )}

            {hasSheetData && (sheetData.isVegetarian !== undefined || sheetData.isVegan !== undefined) && (
              <div className="product-sheet-block product-sheet-diet">
                {sheetData.isVegan && <span className="product-sheet-badge product-sheet-badge--vegan">Végan</span>}
                {!sheetData.isVegan && sheetData.isVegetarian && (
                  <span className="product-sheet-badge product-sheet-badge--vegetarian">Végétarien</span>
                )}
                {!sheetData.isVegetarian && !sheetData.isVegan && (
                  <span className="product-sheet-badge product-sheet-badge--standard">Contient des protéines animales</span>
                )}
              </div>
            )}

            {hasSheetData && sheetData.whyGood && (
              <div className="product-sheet-block">
                <h3 className="product-sheet-block-title">Pourquoi c'est bon</h3>
                <p className="product-sheet-why-good">{sheetData.whyGood}</p>
              </div>
            )}

            {hasSheetData && sheetData.benefits?.length > 0 && (
              <div className="product-sheet-block">
                <h3 className="product-sheet-block-title">Bénéfices</h3>
                <ul className="product-sheet-benefits">
                  {sheetData.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {hasSheetData && sheetData.keyIngredients?.length > 0 && (
              <div className="product-sheet-block">
                <h3 className="product-sheet-block-title">Ingrédients clés</h3>
                <ul className="product-sheet-ingredients">
                  {sheetData.keyIngredients.map((ing, i) => (
                    <li key={i}>
                      <strong>{ing.name}</strong> — {ing.benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasSheetData && sheetData.formulas?.length > 0 && (
              <div className="product-sheet-block">
                <h3 className="product-sheet-block-title">Dans les menus</h3>
                <ul className="product-sheet-formulas">
                  {sheetData.formulas.map((f, i) => (
                    <li key={i}>{f.name} ({f.price})</li>
                  ))}
                </ul>
              </div>
            )}

            {showAllergensSection && (
              <div className="product-sheet-block product-sheet-block--allergens">
                <h3 className="product-sheet-block-title">Allergènes</h3>
                <div className="product-sheet-allergens">
                  {allergens.length > 0 ? (
                    <AllergenPictograms allergens={allergens} size={32} className="product-sheet-allergen-pictograms" />
                  ) : (
                    <p className="product-sheet-allergens-empty">Aucun allergène majeur identifié</p>
                  )}
                </div>
                <a href="#/allergenes" className="product-sheet-allergens-link">
                  Voir le tableau des allergènes
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
