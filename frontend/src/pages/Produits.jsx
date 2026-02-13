import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./Produits.css";
import jus from "../assets/images/jus.png";
import soupe from "../assets/images/soupe.png";
import citron from "../assets/images/citron.png";
import ananas from "../assets/images/ananas.png";
import palmier from "../assets/images/palmier.png";
import backImage from "../assets/images/back.png";
import photoMenu1 from "../assets/images/photo menu/photo-sandwich.jpg";
import photoMenu2 from "../assets/images/photo menu/photo-salade.jpg";
import photoMenu3 from "../assets/images/photo menu/photo-platchaud.jpg";
import photoMilkshake from "../assets/images/photo menu/photo-milkshak.jpg";
import photoBooster from "../assets/images/photo menu/photo-booster.jpg";
import photoSoupe from "../assets/images/photo menu/photo-soupe.png";
import photoSaladesBowls from "../assets/images/photo menu/photo-salades-bowls.jpg";
import photoDesserts from "../assets/images/photo menu/photo-desserts.jpg";

const CATEGORY_I18N_KEYS = {
  "JUS": "JUS",
  "BOOSTERS": "BOOSTERS",
  "MILKSHAKES": "MILKSHAKES",
  "SOUPES": "SOUPES",
  "PLATS CHAUDS": "PLATS_CHAUDS",
  "SALADES": "SALADES",
  "SANDWICH": "SANDWICH",
  "DESSERTS": "DESSERTS",
  "THÉ & CAFÉ": "THE_CAFE",
  "BOOSTERS SPÉCIAUX": "BOOSTERS_SPECIAL",
  "BOISSONS": "BOISSONS",
};

/** Ordre d'affichage : ligne 1 Jus | Soupes | Plats chauds, ligne 2 Milkshakes | Booster | Salades, ligne 3 Desserts | Sandwich, puis Thé & Café */
const FIRST_ROW_ORDER = ["JUS", "SOUPES", "PLATS CHAUDS"];
const OTHER_CATEGORIES_ORDER = ["MILKSHAKES", "BOOSTERS", "SALADES", "DESSERTS", "THÉ & CAFÉ", "SANDWICH"];

export const Produits = () => {
  const { t } = useTranslation();
  const [products] = useState([
    {
      id: 1,
      name: "SLIM DÉTOX",
      category: "JUS",
      price: "5.8",
      volume: "47 cl",
      description: "Ananas, orange, citron vert, menthe",
    },
    {
      id: 2,
      name: "SUNNY WAKE UP",
      category: "JUS",
      price: "5.8",
      volume: "47 cl",
      description: "Açaï, orange, fraise, kiwi",
    },
    {
      id: 3,
      name: "SUPERFLY",
      category: "JUS",
      price: "5.8",
      volume: "47 cl",
      description: "Pomme, citron, gingembre",
    },
    {
      id: 4,
      name: "STRESS OVER",
      category: "JUS",
      price: "5.8",
      volume: "47 cl",
      description: "Orange, banane, fraise",
    },
    {
      id: 5,
      name: "PURPLE DÉTOX",
      category: "JUS",
      price: "5.8",
      volume: "47 cl",
      description: "Pomme, betterave, gingembre, fraise",
    },
    {
      id: 6,
      name: "C++",
      category: "JUS",
      price: "5.8",
      volume: "47 cl",
      description: "Orange, carotte, gingembre, curcuma",
    },
    {
      id: 7,
      name: "PURA VIDA",
      category: "JUS",
      price: "5.8",
      volume: "47 cl",
      description: "Concombre, citron, pomme, graine de chia",
    },
    {
      id: 8,
      name: "SHREK",
      category: "JUS",
      price: "5.8",
      volume: "47 cl",
      description: "Pomme, citron vert, épinard",
    },
    {
      id: 9,
      name: "SPIRULINE",
      category: "BOOSTERS",
      price: "1",
      description: "Macro et micronutriments, complément alimentaire, bon atout contre l'anémie"
    },
    {
      id: 10,
      name: "CURCUMA",
      category: "BOOSTERS",
      price: "1",
      description: "Bon pour la santé digestive et hépatique, articulaire et circulation sanguine"
    },
    {
      id: 11,
      name: "AÇAÏ",
      category: "BOOSTERS",
      price: "1",
      description: "Acides gras (oméga 3, 6 et 9), en vitamines C, E, nombreux antioxydants, anti-inflammatoire"
    },
    {
      id: 12,
      name: "MACA",
      category: "BOOSTERS",
      price: "1",
      description: "Potassium, calcium, oligo-éléments, bon atout système nerveux central, fertilité & régulateur hormonal"
    },
    {
      id: 13,
      name: "GUARANA",
      category: "BOOSTERS",
      price: "1",
      description: "Calcium, phosphore, fer, cuivre, zinc, magnésium, oligoéléments et vitamines, propriétés stimulantes"
    },
    {
      id: 14,
      name: "GRAINES DE CHIA",
      category: "BOOSTERS",
      price: "1",
      description: "Riche en protéines, fibres, oméga-3, minéraux et vitamines, antioxydants"
    },
    {
      id: 15,
      name: "DARYL ALL NIGHT LONG",
      category: "MILKSHAKES",
      price: "6",
      volume: "47 cl",
      description: "Avocat, lait, miel, datte",
    },
    {
      id: 16,
      name: "MAX AFTER SURF",
      category: "MILKSHAKES",
      price: "6",
      volume: "47 cl",
      description: "Mangue, lait, miel, banane",
    },
    {
      id: 17,
      name: "CAM & LOLO",
      category: "MILKSHAKES",
      price: "6",
      volume: "47 cl",
      description: "Fraise, lait, miel, amande",
    },
    {
      id: 18,
      name: "MATCHA LOVA",
      category: "MILKSHAKES",
      price: "6",
      volume: "47 cl",
      description: "Lait, miel, matcha",
    },
    {
      id: 19,
      name: "MATCHA FRAGOLA",
      category: "MILKSHAKES",
      price: "6",
      volume: "47 cl",
      description: "Fraise, lait, miel, matcha",
    },
    {
      id: 20,
      name: "AÇAÏ WILD LIFE",
      category: "MILKSHAKES",
      price: "6",
      volume: "47 cl",
      description: "Lait, miel, açaï, fraise et graines de chia",
    },
    {
      id: 21,
      name: "HAILEY'S TWIST",
      category: "MILKSHAKES",
      price: "6",
      volume: "47 cl",
      description: "Lait de coco, fraise, miel, datte, copeaux de noix de coco, collagène",
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
      id: 57,
      name: "LENTILLES CORAIL AU LAIT DE COCO",
      category: "SOUPES",
      description: "Lentilles corail, purée de tomate, lait de coco, oignon, ail, huile d'olive, huile de colza, cumin, cannelle, poivre."
    },
    {
      id: 58,
      name: "ESPAGNOLE À LA CORIANDRE",
      category: "SOUPES",
      description: "Pommes de terre, poireaux, oignons, huile de colza, huile d'olive, coriandre, ail, poivre."
    },
    {
      id: 59,
      name: "CAROTTE LAIT DE COCO",
      category: "SOUPES",
      description: "Carotte, lait de coco, oignon, crème fraîche, amidon de riz, curcuma."
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
      category: "BOOSTERS",
      price: "1.5",
      description: "Bon pour la peau, les articulations et les os, soutien du tissu conjonctif, anti-âge naturel",
      extraPrice: "+1,50€"
    },
    {
      id: 26,
      name: "POULET TIKKA",
      category: "PLATS CHAUDS",
      price: "7",
      description: "Riz, poulet, crème, oignons, tomates, yaourt, raisins, amandes."
    },
    {
      id: 43,
      name: "TIKKA VÉGÉTARIEN",
      category: "PLATS CHAUDS",
      price: "7",
      description: "Riz basmati, tomates, lait de coco, pois chiches, légumes grillés."
    },
    {
      id: 27,
      name: "COUSCOUS POULET",
      category: "PLATS CHAUDS",
      price: "7",
      description: "Semoule de blé, poulet, carottes, courgettes, navet, pois chiche, coriandre."
    },
    {
      id: 41,
      name: "SOUPE JAPONAISE",
      category: "PLATS CHAUDS",
      price: "7",
      description: "Nouilles de riz, poulet, champignons, coriandre, citronnelle, bouillon de soja."
    },
    {
      id: 42,
      name: "TORTELLINI PESTO ROUGE",
      category: "PLATS CHAUDS",
      price: "7",
      description: "Pâtes, pesto basilic, courgettes grillées, amandes, pignons, tomates séchées, parmesan."
    },
    {
      id: 28,
      name: "QUICHE CHÈVRE ÉPINARDS",
      category: "PLATS CHAUDS",
      price: "7",
      description: "Épinards, chèvre, œuf, crème, farine de blé."
    },
    {
      id: 39,
      name: "QUICHE PATATE DOUCE FETA",
      category: "PLATS CHAUDS",
      price: "7",
      description: "Patate douce, feta, pistou, œuf, crème, farine de blé."
    },
    {
      id: 29,
      name: "SALADE RISONI PESTO POIVRON",
      category: "SALADES",
      price: "6.5",
      description: "Pate risoni de blé dur, paprika, poulet, roquette, courgettes grillées, parmesan, pesto poivron-tomates, huile de colza."
    },
    {
      id: 30,
      name: "SALADE CHOUX ROUGE",
      category: "SALADES",
      price: "6.5",
      description: "Chou rouge, poulet aux épices Italiennes, Féta AOP au lait Grec de brebis pasteurisé, jambon Serrano, noix, Emmental, pousses d'épinards, sel, vinaigre, sésame."
    },
    {
      id: 32,
      name: "SALADE POWERFUL",
      category: "SALADES",
      price: "6.5",
      description: "Épeautre cuit, brocoli cru râpé, choux, chou frisés, amandes grillées, avocat, courgettes grillées, poulet, sel, poivre, ras el hanout."
    },
    {
      id: 31,
      name: "GRANDE BUDDHA BOWL",
      category: "SALADES",
      price: "7.5",
      description: "Mix boulgour & quinoa rouge, courgettes & butternuts grillés, Féta AOP au lait Grec de brebis pasteurisé, canneberges, amandes, roquette, coriandre, persil.",
      extraPrice: "+1€"
    },
    {
      id: 33,
      name: "WRAP CAJUN",
      category: "SANDWICH",
      price: "7.5",
      description: "Pita à la farine de blé, poulet, épices cajun, chou blanc, guacamole, poivrons grillés, Tabasco, oignon jaune.",

    },
    {
      id: 34,
      name: "WRAP CHAUD MEXICAIN",
      category: "SANDWICH",
      price: "7.5",
      description: "Pita à la farine de blé, crème cheese (lait pasteurisé), tapenade de poivrons rouges, avocat, tomates, cornichons, cheddar, bacon."
    },
    {
      id: 35,
      name: "WRAP CHAUD HOUMOUS FALAFEL",
      category: "SANDWICH",
      price: "7.5",
      description: "Pita à la farine de blé et à la pulpe d'avocat, houmous, falafel BIO, aubergines grillées, chou rouge, persil plat."
    },
    {
      id: 36,
      name: "WRAP POULET RAS EL HANOUT",
      category: "SANDWICH",
      price: "7.5",
      description: "Mélange d'épices ras-el-hanout, blanc de poulet, tortillas de farine, hummus, tomate, oignon rouge, mélange de salade."
    },
    {
      id: 37,
      name: "BAGEL NEW YORK",
      category: "SANDWICH",
      price: "7.5",
      description: "Bagel à la farine de blé avec graines de sésames et pavots, tomates, mozzarella (lait pasteurisé), crème cheese (lait pasteurisé), pesto vert."
    },
    {
      id: 38,
      name: "BAGEL CHÈVRE",
      category: "SANDWICH",
      price: "7.5",
      description: "Chèvre, pesto rouge, aubergines grillées."
    },
    {
      id: 44,
      name: "COOKIE CHOCOLAT AU LAIT",
      category: "DESSERTS",
      price: "3",
      description: "Pépites de chocolat au lait, cassonade, vanille."
    },
    {
      id: 54,
      name: "COOKIE CHOCOLAT NOIR",
      category: "DESSERTS",
      price: "3",
      description: "Pépites de chocolat noir, cassonade, vanille."
    },
    {
      id: 55,
      name: "COOKIE CHOCOLAT BLANC",
      category: "DESSERTS",
      price: "3",
      description: "Pépites de chocolat blanc, cassonade, vanille."
    },
    {
      id: 45,
      name: "FROMAGE BLANC COULIS FRUITS ROUGES ET COOKIES",
      category: "DESSERTS",
      price: "4.5",
      description: "Coulis de fraises, cookies, matière grasse < 3.5%."
    },
    {
      id: 46,
      name: "FROMAGE BLANC MUESLI MIEL",
      category: "DESSERTS",
      price: "4.5",
      description: "Miel, muesli, matière grasse < 3.5%."
    },
    {
      id: 56,
      name: "FROMAGE BLANC CRÈME DE MARRONS SPECULOOS",
      category: "DESSERTS",
      price: "4.5",
      description: "Crème de marrons, speculoos, matière grasse < 3.5%."
    },
    {
      id: 47,
      name: "MOUSSE AU CHOCOLAT",
      category: "DESSERTS",
      price: "4",
      description: "Œufs, chocolat noir, beurre, lait écrémé, cacao en poudre."
    },
    {
      id: 48,
      name: "TIRAMISU",
      category: "DESSERTS",
      price: "4",
      description: "Crème, mascarpone, génoise, arôme naturel de vanille, bourbon, sucre, lait écrémé, café et cacao."
    },
    {
      id: 49,
      name: "MI CUIT FONDANT",
      category: "DESSERTS",
      price: "4",
      description: "Œuf, huile de colza, sucre, chocolat noir 22%, farine de blé."
    },
    {
      id: 50,
      name: "BROWNIE",
      category: "DESSERTS",
      price: "4",
      description: "Huile de colza, sucre, chocolat noir 22%, farine de blé, sucre, noix de pécan, œuf."
    },
    {
      id: 51,
      name: "CRUMBLE POMME SPECULOOS",
      category: "DESSERTS",
      price: "4",
      description: "Pomme, farine de blé, speculoos concassé, beurre, cannelle."
    },
    {
      id: 52,
      name: "TARTE AUX NOIX DE PÉCAN",
      category: "DESSERTS",
      price: "4",
      description: "Farine de blé, margarine végétale, arôme naturel, sucre roux, jaune d'œuf, noix de pécan, sirop de glucose, œufs, beurre."
    },
    {
      id: 53,
      name: "GRAINES DE CHIA FRAMBOISE",
      category: "DESSERTS",
      price: "4",
      description: "Lait de coco, framboise, sucre blond de canne, graines de chia, coco râpée."
    },
    {
      id: 60,
      name: "EVIAN",
      category: "BOISSONS",
      price: "2",
      description: "Bouteille 50cl"
    },
    {
      id: 61,
      name: "SAN PELLEGRINO",
      category: "BOISSONS",
      price: "2",
      description: "Bouteille 50cl"
    },
    {
      id: 62,
      name: "COCA COLA",
      category: "BOISSONS",
      price: "2.5",
      description: "Canette 33cl"
    },
    {
      id: 63,
      name: "COCA COLA ZERO",
      category: "BOISSONS",
      price: "2.5",
      description: "Canette 33cl"
    }
  ]);

  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  // S'assurer que PLATS CHAUDS, SANDWICH et DESSERTS existent et sont toujours affichés
  if (!productsByCategory["PLATS CHAUDS"]) {
    productsByCategory["PLATS CHAUDS"] = [];
  }
  if (!productsByCategory["SANDWICH"]) {
    productsByCategory["SANDWICH"] = [];
  }
  if (!productsByCategory["DESSERTS"]) {
    productsByCategory["DESSERTS"] = [];
  }

  // Ordre d'affichage : Jus | Soupes | Plat chaud en première ligne, puis le reste
  const orderedCategories = [
    ...FIRST_ROW_ORDER.filter((cat) => productsByCategory[cat]),
    ...OTHER_CATEGORIES_ORDER.filter((cat) => productsByCategory[cat]),
  ];

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
            <span className="formulas-volume-note">{t("products.formulaNote")}</span>
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

          <div className="formulas-photos-grid">
            <div className="formula-photo-item">
              <img src={photoMenu1} alt="Menu photo 1" className="formula-photo" />
            </div>
            <div className="formula-photo-item">
              <img src={photoMenu2} alt="Menu photo 2" className="formula-photo" />
            </div>
            <div className="formula-photo-item">
              <img src={photoMenu3} alt="Menu photo 3" className="formula-photo" />
            </div>
          </div>
        </div>

        <div className="menu-content">
          {(() => {
            const renderSection = (category, isLastInRow) => {
              const categoryProducts = productsByCategory[category] || [];
              return (
                <div key={category} className={`menu-section ${isLastInRow ? "no-right-border" : ""}`}>
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
                      {category === "PLATS CHAUDS" && (
                        <span className="section-price">7€</span>
                      )}
                      {category === "SALADES" && (
                        <span className="section-price">6,50€</span>
                      )}
                      {category === "SANDWICH" && (
                        <span className="section-price">6€</span>
                      )}
                      {category === "DESSERTS" && (
                        <span className="section-price">3,50€</span>
                      )}
                      {category === "THÉ & CAFÉ" && (
                        <span className="section-price">2.5€</span>
                      )}
                      {category === "BOISSONS" && (
                        <span className="section-price">2€</span>
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
                        }}
                      >
                        <span className="product-name">
                          {t(`products.items.${product.id}.name`)}
                          {product.isPopular && <span className="product-badge-popular">{t("products.popular")}</span>}
                          {product.isVegetarian && <span className="product-badge-vegetarian">{t("products.vegetarian")}</span>}
                          {product.isVegan && <span className="product-badge-vegan">{t("products.vegan")}</span>}
                          {product.extraPrice && <span className="product-extra-price">{product.extraPrice}</span>}
                        </span>
                        <span className="product-description">{t(`products.items.${product.id}.description`)}</span>
                      </div>
                    ))}
                  </div>
                  {category === "MILKSHAKES" && (
                    <div className="section-photo section-photo-portrait section-photo-milkshake">
                      <img src={photoMilkshake} alt="Milkshakes" className="section-photo-img" />
                    </div>
                  )}
                  {category === "BOOSTERS" && (
                    <div className="section-photo section-photo-portrait">
                      <img src={photoBooster} alt="Boosters" className="section-photo-img" />
                    </div>
                  )}
                  {category === "SOUPES" && (
                    <div className="section-photo section-photo-portrait">
                      <img src={photoSoupe} alt="Soupes" className="section-photo-img" />
                    </div>
                  )}
                  {category === "SALADES" && (
                    <div className="section-photo section-photo-portrait">
                      <img src={photoSaladesBowls} alt="Salades" className="section-photo-img" />
                    </div>
                  )}
                  {category === "SANDWICH" && (
                    <div className="section-photo section-photo-portrait">
                      <img src={photoDesserts} alt="Desserts" className="section-photo-img" />
                    </div>
                  )}
                  {category === "THÉ & CAFÉ" && productsByCategory["BOISSONS"] && (
                    <div className="section-sub">
                      <div className="section-header">
                        <h2 className="section-title">
                          <span>{t("products.categories.BOISSONS")}</span>
                          <span className="section-price">2€</span>
                        </h2>
                      </div>
                      <div className="section-content">
                        {productsByCategory["BOISSONS"].map((product) => (
                          <div key={product.id} className="product-item">
                            <span className="product-name">
                              {t(`products.items.${product.id}.name`)}
                            </span>
                            <span className="product-description">{t(`products.items.${product.id}.description`)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            };

            /* Layout en colonnes : col1 = JUS,MILKSHAKES,DESSERTS | col2 = SOUPES,BOOSTERS,THÉ&CAFÉ | col3 = PLATS CHAUDS,SALADES,SANDWICH */
            const columnCount = 3;
            const columns = [];
            for (let col = 0; col < columnCount; col++) {
              const columnCats = orderedCategories.filter((_, idx) => idx % columnCount === col);
              const isLastColumn = col === columnCount - 1;
              columns.push(
                <div key={`col-${col}`} className="menu-column">
                  {columnCats.map((category) =>
                    renderSection(category, isLastColumn)
                  )}
                </div>
              );
            }
            return (
              <div className="menu-sections menu-sections-columns">
                {columns}
              </div>
            );
          })()}
        </div>

        {productsByCategory["JUS"] && (
          <div className="info-box">
            <p className="info-text">
              {t("products.infoJuices")}
            </p>
          </div>
        )}

        <div className="allergenes-cta-wrap">
          <a className="allergenes-cta-btn" href="#/allergenes">
            {t("products.allergensCta")}
          </a>
        </div>

      </div>
    </main>
  );
};
