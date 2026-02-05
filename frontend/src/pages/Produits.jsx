import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./Produits.css";
import jus from "../assets/images/jus.png";
import soupe from "../assets/images/soupe.png";
import citron from "../assets/images/citron.png";
import ananas from "../assets/images/ananas.png";
import palmier from "../assets/images/palmier.png";
import backImage from "../assets/images/back.png";

const CATEGORY_I18N_KEYS = {
  "JUS": "JUS",
  "BOOSTERS": "BOOSTERS",
  "MILKSHAKES": "MILKSHAKES",
  "SOUPES": "SOUPES",
  "THÉ & CAFÉ": "THE_CAFE",
  "BOOSTERS SPÉCIAUX": "BOOSTERS_SPECIAL",
};

export const Produits = () => {
  const { t } = useTranslation();
  const [products] = useState([
    {
      id: 1,
      name: "SLIM DÉTOX",
      category: "JUS",
      price: "5.8",
      volume: "47 cl",
      description: "ananas, orange, citron vert, menthe",
    },
    {
      id: 2,
      name: "SUNNY WAKE UP",
      category: "JUS",
      price: "5.8",
      volume: "47 cl",
      description: "açaï, orange, fraise, kiwi",
    },
    {
      id: 3,
      name: "SUPERFLY",
      category: "JUS",
      price: "5.8",
      volume: "47 cl",
      description: "pomme, citron, gingembre",
    },
    {
      id: 4,
      name: "STRESS OVER",
      category: "JUS",
      price: "5.8",
      volume: "47 cl",
      description: "orange, banane, fraise",
    },
    {
      id: 5,
      name: "PURPLE DÉTOX",
      category: "JUS",
      price: "5.8",
      volume: "47 cl",
      description: "pomme, betterave, gingembre, fraise",
    },
    {
      id: 6,
      name: "C++",
      category: "JUS",
      price: "5.8",
      volume: "47 cl",
      description: "orange, carotte, gingembre, curcuma",
    },
    {
      id: 7,
      name: "PURA VIDA",
      category: "JUS",
      price: "5.8",
      volume: "47 cl",
      description: "concombre, citron, pomme, graine de chia",
    },
    {
      id: 8,
      name: "SHREK",
      category: "JUS",
      price: "5.8",
      volume: "47 cl",
      description: "pomme, citron vert, épinard",
    },
    {
      id: 9,
      name: "SPIRULINE",
      category: "BOOSTERS",
      price: "1",
      description: "macro et micronutriments, complément alimentaire, bon atout contre l'anémie"
    },
    {
      id: 10,
      name: "CURCUMA",
      category: "BOOSTERS",
      price: "1",
      description: "bon pour la santé digestive et hépatique, articulaire et circulation sanguine"
    },
    {
      id: 11,
      name: "AÇAÏ",
      category: "BOOSTERS",
      price: "1",
      description: "acides gras (oméga 3, 6 et 9), en vitamines C, E, nombreux antioxydants, anti-inflammatoire"
    },
    {
      id: 12,
      name: "MACA",
      category: "BOOSTERS",
      price: "1",
      description: "potassium, calcium, oligo-éléments bon atout système nerveux central, fertilité & régulateur hormonal"
    },
    {
      id: 13,
      name: "GUARANA",
      category: "BOOSTERS",
      price: "1",
      description: "calcium, phosphore, fer, cuivre, zinc, magnésium, oligoéléments et vitamines, propriétés stimulantes"
    },
    {
      id: 14,
      name: "GRAINES DE CHIA",
      category: "BOOSTERS",
      price: "1",
      description: "riche en protéines, fibres, oméga-3, minéraux et vitamines, antioxydants"
    },
    {
      id: 15,
      name: "DARYL ALL NIGHT LONG",
      category: "MILKSHAKES",
      price: "6",
      volume: "47 cl",
      description: "avocat, lait, miel, datte",
    },
    {
      id: 16,
      name: "MAX AFTER SURF",
      category: "MILKSHAKES",
      price: "6",
      volume: "47 cl",
      description: "mangue, lait, miel, banane",
    },
    {
      id: 17,
      name: "CAM & LOLO",
      category: "MILKSHAKES",
      price: "6",
      volume: "47 cl",
      description: "fraise, lait, miel, amande",
    },
    {
      id: 18,
      name: "MATCHA LOVA",
      category: "MILKSHAKES",
      price: "6",
      volume: "47 cl",
      description: "lait, miel, matcha",
    },
    {
      id: 19,
      name: "MATCHA FRAGOLA",
      category: "MILKSHAKES",
      price: "6",
      volume: "47 cl",
      description: "fraise, lait, miel, matcha",
    },
    {
      id: 20,
      name: "AÇAÏ WILD LIFE",
      category: "MILKSHAKES",
      price: "6",
      volume: "47 cl",
      description: "lait, miel, açaï, fraise et graines de chia",
    },
    {
      id: 21,
      name: "HAILEY'S TWIST",
      category: "MILKSHAKES",
      price: "6",
      volume: "47 cl",
      description: "lait de coco, fraise, miel, datte, copeaux de noix de coco, collagène",
    },
    {
      id: 22,
      name: "SOUPE DU JOUR",
      category: "SOUPES",
      price: "Variable",
      description: "Toutes nos recettes sont maison et nous sommes aussi distributeur depuis 2001",
      isSpecial: true
    },
    {
      id: 23,
      name: "THÉ",
      category: "THÉ & CAFÉ",
      price: "2.5",
      description: "Sélection de thés premium"
    },
    {
      id: 24,
      name: "CAFÉ",
      category: "THÉ & CAFÉ",
      price: "2.5",
      description: "Café arabica bio"
    },
    {
      id: 25,
      name: "BOOSTER COLLAGÈNE",
      category: "BOOSTERS SPÉCIAUX",
      price: "2.5",
      description: "À mettre soit dans vos jus / milkshakes ou soupes",
      isSpecial: true
    }
  ]);

  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <main id="produits" className={`produits-page ${isReady ? 'produits-ready' : ''}`}>
      {/* Fond tropical avec motifs Sj food fresh */}
      <div 
        className="tropical-background"
        style={{ backgroundImage: `url(${backImage})` }}
      ></div>
      
      {/* Décorations en arrière-plan */}
      <div className="background-decorations">
        <img src={citron} alt="Citron" className="decoration decoration-citron" />
        <img src={ananas} alt="Ananas" className="decoration decoration-ananas" />
        <img src={palmier} alt="Palmier" className="decoration decoration-palmier" />
      </div>
      <div className="menu-container">
        {/* Section Formules GOOD DAY */}
        <div className="formulas-section">
          <h1 className="good-day-title">{t("products.goodDay")}</h1>
          <div className="formulas-subtitle">
            {t("products.inAllMenus")}
          </div>
          <div className="formulas-description">
            {t("products.formulaDesc")}
          </div>
          
          <div className="formulas-grid">
            <div className="formula-item">
              <div className="formula-header">
                <span className="formula-name">{t("products.menuSandwich")}</span>
                <span className="formula-price">13,50€</span>
              </div>
              <div className="formula-details">
                {t("products.menuSandwichDesc")}
              </div>
            </div>

            <div className="formula-item">
              <div className="formula-header">
                <span className="formula-name">{t("products.menuSalad")}</span>
                <span className="formula-price">14€</span>
              </div>
              <div className="formula-details">
                {t("products.menuSaladDesc")}
              </div>
            </div>

            <div className="formula-item">
              <div className="formula-header">
                <span className="formula-name">{t("products.menuHot")}</span>
                <span className="formula-price">14,50€</span>
              </div>
              <div className="formula-details">
                {t("products.menuHotDesc")}
              </div>
            </div>
          </div>

          <div className="formulas-note">
            {t("products.formulaNote")}
          </div>
        </div>

        <div className="menu-sections">
          {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
            <div key={category} className="menu-section">
              <div className="section-header">
                <h2 className="section-title">
                  <span>{t(`products.categories.${CATEGORY_I18N_KEYS[category] || category}`)}</span>
                  {category === "JUS" && (
                    <span className="section-price">
                      <span className="size-label">
                        <div className="size-container">
                          <span className="size-icon-wrap">
                            <img src={jus} alt="Petit" className="size-icon size-icon-small" />
                          </span>
                          <span className="size-volume">33cl</span>
                        </div>
                      </span>
                      <span className="price-value">4.80€</span>
                      <span className="size-label">
                        <div className="size-container">
                          <span className="size-icon-wrap">
                            <img src={jus} alt="Grand" className="size-icon size-icon-large" />
                          </span>
                          <span className="size-volume">47cl</span>
                        </div>
                      </span>
                      <span className="price-value">5.80€</span>
                    </span>
                  )}
                  {category === "BOOSTERS" && (
                    <span className="section-price">
                      1€ <span className="dose-label">{t("products.sizeDose")}</span>
                    </span>
                  )}
                  {category === "MILKSHAKES" && (
                    <span className="section-price">
                      <span className="size-label">
                        <div className="size-container">
                          <span className="size-icon-wrap">
                            <img src={jus} alt="Milkshake" className="size-icon size-icon-large" />
                          </span>
                          <span className="size-volume">47cl</span>
                        </div>
                      </span>
                      <span className="price-value">6€</span>
                    </span>
                  )}
                  {category === "SOUPES" && (
                    <span className="section-price">
                      <span className="size-label">
                        <div className="size-container">
                          <span className="size-icon-wrap">
                            <img src={soupe} alt="Petite" className="size-icon size-icon-small" />
                          </span>
                          <span className="size-volume">33cl</span>
                        </div>
                      </span>
                      <span className="price-value">4.60€</span>
                      <span className="size-label">
                        <div className="size-container">
                          <span className="size-icon-wrap">
                            <img src={soupe} alt="Grande" className="size-icon size-icon-large" />
                          </span>
                          <span className="size-volume">47cl</span>
                        </div>
                      </span>
                      <span className="price-value">5.60€</span>
                    </span>
                  )}
                  {category === "THÉ & CAFÉ" && (
                    <span className="section-price">2.5€</span>
                  )}
                  {category === "BOOSTERS SPÉCIAUX" && (
                    <span className="section-price">2.5€</span>
                  )}
                </h2>
              </div>
              <div className="section-content">
                {categoryProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className={`product-item ${product.isSpecial ? 'product-special' : ''}`}
                    onClick={() => {
                      console.log('Produit sélectionné:', product.name);
                      // Ici vous pouvez ajouter une action (modal, panier, etc.)
                    }}
                  >
                    <span className="product-name">{t(`products.items.${product.id}.name`)}</span>
                    <span className="product-description">{t(`products.items.${product.id}.description`)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {productsByCategory["JUS"] && (
          <div className="info-box">
            <p className="info-text">
              {t("products.infoJuices")}
            </p>
          </div>
        )}

        <div className="allergens-link-container">
          <a href="#/allergenes" className="allergens-link">
            {t("products.allergensLink")}
          </a>
        </div>
      </div>
    </main>
  );
};
