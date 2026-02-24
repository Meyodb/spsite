import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./ProduitsMenuTest.css";
import {
  PRODUCTS,
  CATEGORIES_ORDER,
  CATEGORY_I18N_KEYS,
  DESSERT_SUBCATEGORIES_ORDER,
  DESSERT_SUBCATEGORIES_COMPACT_ORDER,
  DESSERT_SUBCATEGORY_PRICES,
} from "../data/productsData";
import { AllergenPictograms, getAllergensForProduct } from "../components/AllergenPictograms";
import { ProductImage } from "../components/ProductImage";
import { ProductImageLightbox } from "../components/ProductImageLightbox";
import { ProductSheet } from "../components/ProductSheet";
import jus from "../assets/images/jus.png";
import soupe from "../assets/images/soupe.png";
import backImage from "../assets/images/back.png";
import citron from "../assets/images/citron.png";
import ananas from "../assets/images/ananas.png";
import palmier from "../assets/images/palmier.png";
import photoMenu1 from "../assets/images/photo menu/photo-sandwich.jpg";
import photoMenu2 from "../assets/images/photo menu/photo-salade.jpg";
import photoMenu3 from "../assets/images/photo menu/photo-platchaud.jpg";

export const ProduitsMenuTest = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [lightboxProduct, setLightboxProduct] = useState(null);
  const [sheetProduct, setSheetProduct] = useState(null);

  const productsByCategory = useMemo(() => {
    const acc = {};
    PRODUCTS.forEach((p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
    });
    return acc;
  }, []);

  const orderedCategories = useMemo(() => {
    return CATEGORIES_ORDER.filter((cat) => productsByCategory[cat]?.length > 0);
  }, [productsByCategory]);

  const displayProducts = activeCategory
    ? (productsByCategory[activeCategory] || [])
    : PRODUCTS;

  useEffect(() => {
    if (orderedCategories.length > 0 && !activeCategory) {
      setActiveCategory(orderedCategories[0]);
    }
  }, [orderedCategories, activeCategory]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 992px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const getProductDisplay = (product) => {
    const nameKey = `products.items.${product.id}.name`;
    const descKey = `products.items.${product.id}.description`;
    const name = t(nameKey);
    const desc = t(descKey);
    return {
      name: name !== nameKey ? name : product.name,
      description: desc !== descKey ? desc : product.description,
    };
  };

  return (
    <main className="produits-menu-test">
      {/* Fond tropical avec motifs Sj food fresh */}
      <div
        className="menu-test-tropical-background"
        style={{ backgroundImage: `url(${backImage})` }}
      />
      <div className="menu-test-background-decorations">
        <img src={citron} alt="" className="menu-test-decoration menu-test-decoration-citron" aria-hidden />
        <img src={ananas} alt="" className="menu-test-decoration menu-test-decoration-ananas" aria-hidden />
        <img src={palmier} alt="" className="menu-test-decoration menu-test-decoration-palmier" aria-hidden />
      </div>
      {/* En-tête GOOD DAY - repris de la page principale */}
      <div className="menu-test-formulas-section">
        <div className="menu-test-formulas-inner">
          <h1 className="menu-test-good-day-title">{t("products.goodDay")}</h1>
          <div className="menu-test-formulas-subtitle">{t("products.inAllMenus")}</div>
          <div className="menu-test-formulas-description">
            {t("products.formulaDesc")}
            <span className="menu-test-formulas-volume-note">{t("products.formulaNote")}</span>
          </div>
          <div className="menu-test-formulas-grid">
            <div className="menu-test-formula-item">
              <div className="menu-test-formula-header">
                <span className="menu-test-formula-name">{t("products.menuSandwich")}</span>
                <span className="menu-test-formula-price">13,50€</span>
              </div>
              <div className="menu-test-formula-details">{t("products.menuSandwichDesc")}</div>
            </div>
            <div className="menu-test-formula-item">
              <div className="menu-test-formula-header">
                <span className="menu-test-formula-name">{t("products.menuSalad")}</span>
                <span className="menu-test-formula-price">14€</span>
              </div>
              <div className="menu-test-formula-details">{t("products.menuSaladDesc")}</div>
            </div>
            <div className="menu-test-formula-item">
              <div className="menu-test-formula-header">
                <span className="menu-test-formula-name">{t("products.menuHot")}</span>
                <span className="menu-test-formula-price">14,50€</span>
              </div>
              <div className="menu-test-formula-details">{t("products.menuHotDesc")}</div>
            </div>
          </div>
          <div className="menu-test-formulas-photos-grid">
            <div className="menu-test-formula-photo-item">
              <img src={photoMenu1} alt="Menu Sandwich" className="menu-test-formula-photo" />
            </div>
            <div className="menu-test-formula-photo-item">
              <img src={photoMenu2} alt="Menu Salade" className="menu-test-formula-photo" />
            </div>
            <div className="menu-test-formula-photo-item">
              <img src={photoMenu3} alt="Menu Plat chaud" className="menu-test-formula-photo" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile : sélecteur de catégorie en haut */}
      {isMobile && (
        <div className="menu-test-mobile-select">
          <select
            value={activeCategory || ""}
            onChange={(e) => setActiveCategory(e.target.value || null)}
            aria-label="Choisir une catégorie"
          >
            {orderedCategories.map((cat) => (
              <option key={cat} value={cat}>
                {t(`products.categories.${CATEGORY_I18N_KEYS[cat] || cat}`)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="menu-test-container">
        {/* Sidebar catégories - style Starbucks (desktop) */}
        <aside className={`menu-test-sidebar ${isMobile ? "menu-test-sidebar--hidden" : ""}`}>
          <h2 className="menu-test-sidebar-title">Menu</h2>
          <nav className="menu-test-nav" aria-label="Catégories du menu">
            {orderedCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`menu-test-nav-item ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
                aria-current={activeCategory === cat ? "true" : undefined}
              >
                {t(`products.categories.${CATEGORY_I18N_KEYS[cat] || cat}`)}
                {productsByCategory[cat] && (
                  <span className="menu-test-nav-count">
                    {productsByCategory[cat].length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Contenu principal - liste des produits */}
        <section className="menu-test-content" aria-label="Liste des produits">
          {(activeCategory === "JUS" || activeCategory === "SOUPES") ? (
            <div className="menu-test-title-size-row">
              <h1 className="menu-test-content-title">
                {t(`products.categories.${CATEGORY_I18N_KEYS[activeCategory] || activeCategory}`)}
              </h1>
              <div className="menu-test-size-price-block menu-test-size-price-block--inline">
                {activeCategory === "JUS" && (
                  <>
                    <div className="menu-test-size-option">
                      <div className="menu-test-size-col">
                        <div className="menu-test-size-icon-wrap">
                          <img src={jus} alt="" className="menu-test-size-icon menu-test-size-icon--small" />
                        </div>
                        <span className="menu-test-size-volume">33cl</span>
                      </div>
                      <span className="menu-test-size-price">4,80€</span>
                    </div>
                    <div className="menu-test-size-option">
                      <div className="menu-test-size-col">
                        <div className="menu-test-size-icon-wrap">
                          <img src={jus} alt="" className="menu-test-size-icon menu-test-size-icon--large" />
                        </div>
                        <span className="menu-test-size-volume">47cl</span>
                      </div>
                      <span className="menu-test-size-price">5,80€</span>
                    </div>
                  </>
                )}
                {activeCategory === "SOUPES" && (
                  <>
                    <div className="menu-test-size-option">
                      <div className="menu-test-size-col">
                        <div className="menu-test-size-icon-wrap">
                          <img src={soupe} alt="" className="menu-test-size-icon menu-test-size-icon--small" />
                        </div>
                        <span className="menu-test-size-volume">33cl</span>
                      </div>
                      <span className="menu-test-size-price">4,60€</span>
                    </div>
                    <div className="menu-test-size-option">
                      <div className="menu-test-size-col">
                        <div className="menu-test-size-icon-wrap">
                          <img src={soupe} alt="" className="menu-test-size-icon menu-test-size-icon--large" />
                        </div>
                        <span className="menu-test-size-volume">47cl</span>
                      </div>
                      <span className="menu-test-size-price">5,60€</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : activeCategory === "PLATS CHAUDS" ? (
            <div className="menu-test-title-size-row">
              <h1 className="menu-test-content-title">
                {t(`products.categories.${CATEGORY_I18N_KEYS[activeCategory] || activeCategory}`)}
              </h1>
              <span className="menu-test-category-price">7,5€</span>
            </div>
          ) : activeCategory === "SALADES" ? (
            <div className="menu-test-title-size-row">
              <h1 className="menu-test-content-title">
                {t(`products.categories.${CATEGORY_I18N_KEYS[activeCategory] || activeCategory}`)}
              </h1>
              <span className="menu-test-category-price">6,5€</span>
            </div>
          ) : activeCategory === "SANDWICH" ? (
            <div className="menu-test-title-size-row">
              <h1 className="menu-test-content-title">
                {t(`products.categories.${CATEGORY_I18N_KEYS[activeCategory] || activeCategory}`)}
              </h1>
              <span className="menu-test-category-price">7,5€</span>
            </div>
          ) : activeCategory === "MILKSHAKES" ? (
            <div className="menu-test-title-size-row">
              <h1 className="menu-test-content-title">
                {t(`products.categories.${CATEGORY_I18N_KEYS[activeCategory] || activeCategory}`)}
              </h1>
              <span className="menu-test-category-price">6€</span>
            </div>
          ) : activeCategory === "BOOSTERS" ? (
            <div className="menu-test-title-size-row">
              <h1 className="menu-test-content-title">
                {t(`products.categories.${CATEGORY_I18N_KEYS[activeCategory] || activeCategory}`)}
              </h1>
              <span className="menu-test-category-price">1€</span>
            </div>
          ) : activeCategory && (
            <h1 className="menu-test-content-title">
              {t(`products.categories.${CATEGORY_I18N_KEYS[activeCategory] || activeCategory}`)}
            </h1>
          )}

          {activeCategory && (
            <p className="menu-test-availability-note">
              {activeCategory === "PLATS CHAUDS" && t("products.sectionSeasonMessageWinterSummer", { winter: 10, summer: 6, category: t("products.sectionCategoryLabel.platsChauds") })}
              {activeCategory === "SALADES" && t("products.sectionSeasonMessageWinterSummer", { winter: 7, summer: 10, category: t("products.sectionCategoryLabel.salades") })}
              {activeCategory === "SANDWICH" && t("products.sectionSeasonMessageSandwich")}
              {activeCategory === "SOUPES" && t("products.sectionSeasonMessageSoupes")}
              {activeCategory === "MILKSHAKES" && t("products.sectionSeasonMessageMilkshakes")}
              {(activeCategory === "PLATS CHAUDS" || activeCategory === "SALADES" || activeCategory === "SANDWICH" || activeCategory === "SOUPES" || activeCategory === "MILKSHAKES") ? " " : ""}
              {t((activeCategory === "PLATS CHAUDS" || activeCategory === "SALADES" || activeCategory === "SANDWICH" || activeCategory === "SOUPES" || activeCategory === "MILKSHAKES") ? "products.availabilityDisclaimerShort" : "products.availabilityDisclaimer")}
            </p>
          )}

          {activeCategory === "DESSERTS" ? (
            <div className="menu-test-desserts-by-subcategory">
              {/* Sous-catégories avec en-tête (DOUCEURS, PATISSERIE) */}
              {DESSERT_SUBCATEGORIES_ORDER.map((subCat) => {
                const subProducts = (productsByCategory["DESSERTS"] || []).filter(
                  (p) => p.subCategory === subCat
                );
                if (subProducts.length === 0) return null;
                return (
                  <div key={subCat} className="menu-test-dessert-subcategory">
                    <div
                      className={`menu-test-dessert-subcategory-header${subCat === "DOUCEURS" || subCat === "PATISSERIE" || subCat === "COOKIES" || subCat === "CAKE" ? " menu-test-dessert-subcategory-header--black-price" : ""}`}
                    >
                      <span className="menu-test-dessert-subcategory-title">
                        {t(`products.dessertSub.${subCat}`)}
                      </span>
                      <span className="menu-test-dessert-subcategory-header-right">
                        {subCat === "PATISSERIE" && (
                          <span className="menu-test-dessert-subcategory-formula-note">
                            {t("products.dessertSub.formulaNotePatisserie")}
                          </span>
                        )}
                        <span className="menu-test-dessert-subcategory-price">
                          {DESSERT_SUBCATEGORY_PRICES[subCat]}
                        </span>
                      </span>
                    </div>
                    <div className="menu-test-products-grid">
                      {subProducts.map((product) => {
                        const { name, description } = getProductDisplay(product);
                        const priceOverride =
                          product.id === 65 && "+0,5€";
                        return (
                          <article
                            key={product.id}
                            className="menu-test-product-card menu-test-product-card--clickable"
                            onClick={() => setSheetProduct(product)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && setSheetProduct(product)}
                            aria-label={t("products.viewProduct", { name })}
                          >
                            <div className="menu-test-product-image-wrap">
                              <ProductImage
                                productId={product.id}
                                alt={name}
                                className="menu-test-product-image"
                                imageCount={product.imageCount}
                              />
                            </div>
                            <div className="menu-test-product-body">
                              <h3 className="menu-test-product-name">
                                {name}
                                {priceOverride && (
                                  <span className="menu-test-product-extra-inline">
                                    {priceOverride}
                                  </span>
                                )}
                              </h3>
                              <div className="menu-test-product-pictograms" aria-label={t("products.pictogramsLabel")} />
                              {description && (
                                <p className="menu-test-product-desc">{description}</p>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {/* Hors catégorie : à la suite, alignés normalement */}
              <div className="menu-test-desserts-compact">
                {DESSERT_SUBCATEGORIES_COMPACT_ORDER.map((subCat) => {
                  const subProducts = (productsByCategory["DESSERTS"] || []).filter(
                    (p) => p.subCategory === subCat
                  );
                  return subProducts.map((product) => {
                    const { name, description } = getProductDisplay(product);
                    const priceOverride =
                      product.id === 65 && "+0,5€";
                    return (
                      <article
                        key={product.id}
                        className="menu-test-product-card menu-test-product-card--clickable"
                        onClick={() => setSheetProduct(product)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setSheetProduct(product)}
                        aria-label={t("products.viewProduct", { name })}
                      >
                        <div className="menu-test-product-image-wrap">
                          <ProductImage
                            productId={product.id}
                            alt={name}
                            className="menu-test-product-image"
                            imageCount={product.imageCount}
                          />
                        </div>
                        <div className="menu-test-product-body">
                          <h3 className="menu-test-product-name">
                            {name}
                            {priceOverride && (
                              <span className="menu-test-product-extra-inline">
                                {priceOverride}
                              </span>
                            )}
                          </h3>
                          <div className="menu-test-product-pictograms" aria-label={t("products.pictogramsLabel")}>
                            {/* Espace pour pictogrammes : végétarien, vegan, allergènes */}
                          </div>
                          {description && (
                            <p className="menu-test-product-desc">{description}</p>
                          )}
                        </div>
                      </article>
                    );
                  });
                })}
              </div>
            </div>
          ) : (
            <div className="menu-test-products-grid">
              {displayProducts.map((product) => {
                const { name, description } = getProductDisplay(product);
                return (
                  <article
                    key={product.id}
                    className="menu-test-product-card menu-test-product-card--clickable"
                    onClick={() => setSheetProduct(product)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setSheetProduct(product)}
                    aria-label={t("products.viewProduct", { name })}
                  >
                    <div className="menu-test-product-image-wrap">
                        <ProductImage
                          productId={product.id}
                          alt={name}
                          className="menu-test-product-image"
                          imageCount={product.imageCount}
                        />
                    </div>
                    <div className="menu-test-product-body">
                      <h3 className="menu-test-product-name">
                        {name}
                        {((activeCategory === "SALADES" || activeCategory === "BOOSTERS") && product.extraPrice) && (
                          <span className="menu-test-product-extra-inline">{product.extraPrice}</span>
                        )}
                      </h3>
                      <div className="menu-test-product-pictograms" aria-label={t("products.pictogramsLabel")}>
                        {(activeCategory === "PLATS CHAUDS" || activeCategory === "SALADES" || activeCategory === "SANDWICH") && (
                          <AllergenPictograms
                            allergens={getAllergensForProduct(product.name)}
                            size={20}
                            className="menu-test-allergen-pictograms"
                          />
                        )}
                      </div>
                      {description && (
                        <p className="menu-test-product-desc">{description}</p>
                      )}
                    </div>
                    {((activeCategory !== "JUS" && activeCategory !== "SOUPES" && activeCategory !== "PLATS CHAUDS" && activeCategory !== "SALADES" && activeCategory !== "SANDWICH" && activeCategory !== "MILKSHAKES" && activeCategory !== "BOOSTERS") && (product.price || product.extraPrice)) && (
                      <div className="menu-test-product-footer">
                        {product.price && (
                          <span className="menu-test-product-price">
                            {product.price.replace(".", ",")}€
                          </span>
                        )}
                        {product.extraPrice && (
                          <span className="menu-test-product-extra">{product.extraPrice}</span>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
      <ProductSheet
        open={!!sheetProduct}
        onClose={() => setSheetProduct(null)}
        product={sheetProduct}
        onViewImage={(product, displayName) => {
          setLightboxProduct({ id: product.id, name: displayName ?? product.name, imageCount: product.imageCount });
          setSheetProduct(null);
        }}
      />
      <ProductImageLightbox
        open={!!lightboxProduct}
        onClose={() => setLightboxProduct(null)}
        productId={lightboxProduct?.id}
        alt={lightboxProduct?.name}
        imageCount={lightboxProduct?.imageCount}
      />
    </main>
  );
};
