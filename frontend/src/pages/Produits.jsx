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
  "GOODIES": "GOODIES",
};

const DESSERT_SUBCATEGORIES_ORDER = ["DOUCEURS", "PATISSERIE", "COOKIES", "CAKE"];
const DESSERT_SUBCATEGORY_PRICES = {
  "COOKIES": "3€",
  "CAKE": "3€",
  "DOUCEURS": "3,5€",
  "PATISSERIE": "4,5€",
};

/** Ordre version web uniquement */
const CATEGORIES_ORDER_WEB = ["JUS", "SOUPES", "PLATS CHAUDS", "MILKSHAKES", "BOOSTERS", "SALADES", "DESSERTS", "BOISSONS", "SANDWICH", "GOODIES"];
/** Ordre version mobile */
const CATEGORIES_ORDER_MOBILE = ["JUS", "SOUPES", "PLATS CHAUDS", "SALADES", "SANDWICH", "MILKSHAKES", "BOOSTERS", "DESSERTS", "BOISSONS", "GOODIES"];

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
      id: 74,
      name: "LENTILLES À L'INDIENNE",
      category: "SOUPES",
      description: "Carotte, lentilles vertes, pois cassés, oignons, jus de citron, coriandre, ail, curry, cumin, poivre."
    },
    {
      id: 72,
      name: "PATATE DOUCE AU LAIT DE COCO",
      category: "SOUPES",
      description: "Patate douce, courgette, lait de coco, oignon, coriandre, ail, curry, gingembre, poivre."
    },
    {
      id: 73,
      name: "CAROTTE PAVOT",
      category: "SOUPES",
      description: "Chou-fleur, carottes, oignons, crème, graines de pavot, cumin, poivre."
    },
    {
      id: 71,
      name: "PETITS POIS MENTHE",
      category: "SOUPES",
      description: "Petits pois, pomme de terre, oignons, menthe, huile d'olive, poivre."
    },
    {
      id: 23,
      name: "THÉ",
      category: "BOISSONS",
      price: "2.5",
      description: "Sélection de thés premium"
    },
    {
      id: 24,
      name: "CAFÉ",
      category: "BOISSONS",
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
      price: "7.5",
      description: "Riz, poulet, crème, oignons, tomates, yaourt, raisins, amandes."
    },
    {
      id: 43,
      name: "TIKKA VÉGÉTARIEN",
      category: "PLATS CHAUDS",
      price: "7.5",
      description: "Riz basmati, tomates, lait de coco, pois chiches, légumes grillés."
    },
    {
      id: 27,
      name: "COUSCOUS POULET",
      category: "PLATS CHAUDS",
      price: "7.5",
      description: "Semoule de blé, poulet, carottes, courgettes, navet, pois chiche, coriandre."
    },
    {
      id: 42,
      name: "TORTELLINI PESTO ROUGE",
      category: "PLATS CHAUDS",
      price: "7.5",
      description: "Pâtes, pesto basilic, courgettes grillées, amandes, pignons, tomates séchées, parmesan."
    },
    {
      id: 28,
      name: "QUICHE CHÈVRE ÉPINARDS",
      category: "PLATS CHAUDS",
      price: "7.5",
      description: "Épinards, chèvre, œuf, crème, farine de blé."
    },
    {
      id: 39,
      name: "QUICHE PATATE DOUCE FETA",
      category: "PLATS CHAUDS",
      price: "7.5",
      description: "Patate douce, feta, pistou, œuf, crème, farine de blé."
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
      id: 29,
      name: "SALADE RISONI PESTO",
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
      name: "COOKIES AU CHOCOLAT",
      category: "DESSERTS",
      subCategory: "COOKIES",
      price: "3",
      description: "Chocolat noir /ou au lait /ou blanc"
    },
    {
      id: 45,
      name: "FROMAGE BLANC",
      category: "DESSERTS",
      subCategory: "DOUCEURS",
      price: "3.5",
      description: "Coulis fraise /ou coulis mangue muesli /ou acai bowl /ou miel muesli /ou crème de marrons speculoos. Matière grasse < 3.5%."
    },
    {
      id: 47,
      name: "MOUSSE AU CHOCOLAT",
      category: "DESSERTS",
      subCategory: "DOUCEURS",
      price: "4",
      description: "Œufs, chocolat noir, beurre, lait écrémé, cacao en poudre."
    },
    {
      id: 48,
      name: "TIRAMISU",
      category: "DESSERTS",
      subCategory: "DOUCEURS",
      price: "4",
      description: "Crème, mascarpone, génoise, arôme naturel de vanille, bourbon, sucre, lait écrémé, café et cacao."
    },
    {
      id: 49,
      name: "MI CUIT FONDANT",
      category: "DESSERTS",
      subCategory: "DOUCEURS",
      price: "4",
      description: "Œuf, huile de colza, sucre, chocolat noir 22%, farine de blé."
    },
    {
      id: 50,
      name: "BROWNIE",
      category: "DESSERTS",
      subCategory: "DOUCEURS",
      price: "4",
      description: "Huile de colza, sucre, chocolat noir 22%, farine de blé, sucre, noix de pécan, œuf."
    },
    {
      id: 51,
      name: "CRUMBLE POMME SPECULOOS",
      category: "DESSERTS",
      subCategory: "DOUCEURS",
      price: "4",
      description: "Pomme, farine de blé, speculoos concassé, beurre, cannelle."
    },
    {
      id: 52,
      name: "TARTE AUX NOIX DE PÉCAN",
      category: "DESSERTS",
      subCategory: "DOUCEURS",
      price: "4",
      description: "Farine de blé, margarine végétale, arôme naturel, sucre roux, jaune d'œuf, noix de pécan, sirop de glucose, œufs, beurre."
    },
    {
      id: 53,
      name: "GRAINES DE CHIA FRAMBOISE",
      category: "DESSERTS",
      subCategory: "DOUCEURS",
      price: "4",
      description: "Lait de coco, framboise, sucre blond de canne, graines de chia, coco râpée."
    },
    {
      id: 66,
      name: "MOUSSE DE SKYR FRUITS ROUGES",
      category: "DESSERTS",
      subCategory: "DOUCEURS",
      price: "3.5",
      description: "Skyr, pomme, crème, fraises, framboises, mélange de graines (lin, carraghénane, courge, tournesol), mûres, amandes en poudre, gélatine de poisson, citron, farine de blé."
    },
    {
      id: 65,
      name: "SALADE FRUIT",
      category: "DESSERTS",
      subCategory: "DOUCEURS",
      price: "4",
      extraPrice: "+0,5€",
      description: "Variété de fruits de saison."
    },
    {
      id: 67,
      name: "TARTE MYRTILLE",
      category: "DESSERTS",
      subCategory: "PATISSERIE",
      price: "4.5",
      description: "Myrtilles fraîches, farine de blé, beurre, lait, sucre, œuf."
    },
    {
      id: 68,
      name: "CHEESECAKE KEYLIME",
      category: "DESSERTS",
      subCategory: "PATISSERIE",
      price: "4.5",
      description: "Philadelphia cream cheese, crème, farine de blé, mascarpone, beurre, jus de citron vert, jaune d'œufs, zestes de citron et citron vert."
    },
    {
      id: 69,
      name: "CHEESECAKE FRUITS ROUGES",
      category: "DESSERTS",
      subCategory: "PATISSERIE",
      price: "4.5",
      description: "Philadelphia cream cheese, sucre, crème, farine de blé, huile végétale, beurre, framboises, myrtille, groseilles, pistaches."
    },
    {
      id: 70,
      name: "TARTE CITRON MERINGUÉE",
      category: "DESSERTS",
      subCategory: "PATISSERIE",
      price: "4.5",
      description: "Crème citron, œufs, jus de citron vert, beurre, zestes de citron, farine de blé, poudre d'amandes."
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
    },
    {
      id: 75,
      name: "VITAMINE WELL",
      category: "BOISSONS",
      price: "3.80",
      description: "Boisson vitaminée"
    },
    {
      id: 76,
      name: "JOMO",
      category: "BOISSONS",
      price: "3.80",
      description: "Grenade litchi, mangue, passion citron vert, pêche hibiscus, gingembre"
    },
    {
      id: 140,
      name: "MUG BAMBOU",
      category: "GOODIES",
      price: "12",
      description: "Mug réutilisable en bambou"
    },
    {
      id: 141,
      name: "TOTE BAG",
      category: "GOODIES",
      price: "8",
      description: "Sac en coton réutilisable"
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

  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Ordre d'affichage : version web vs mobile
  const categoriesOrder = isMobile ? CATEGORIES_ORDER_MOBILE : CATEGORIES_ORDER_WEB;
  const orderedCategories = categoriesOrder.filter((cat) => productsByCategory[cat]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 992px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
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
                        <span className="section-price">7,5€</span>
                      )}
                      {category === "SALADES" && (
                        <span className="section-price">6,50€</span>
                      )}
                      {category === "SANDWICH" && (
                        <span className="section-price">6€</span>
                      )}
                      {category === "DESSERTS" && (
                        <span className="section-price"></span>
                      )}
                      {category === "BOISSONS" && (
                        <span className="section-price">2€ - 3,80€</span>
                      )}
                    </h2>
                  </div>
                  {(category === "PLATS CHAUDS" || category === "SALADES" || category === "SANDWICH" || category === "SOUPES" || category === "MILKSHAKES") && (
                    <p className="section-season-message">
                      {category === "PLATS CHAUDS" && t("products.sectionSeasonMessageWinterSummer", { winter: 10, summer: 6, category: t("products.sectionCategoryLabel.platsChauds") })}
                      {category === "SALADES" && t("products.sectionSeasonMessageWinterSummer", { winter: 7, summer: 10, category: t("products.sectionCategoryLabel.salades") })}
                      {category === "SANDWICH" && t("products.sectionSeasonMessageSandwich")}
                      {category === "SOUPES" && t("products.sectionSeasonMessageSoupes")}
                      {category === "MILKSHAKES" && t("products.sectionSeasonMessageMilkshakes")}
                    </p>
                  )}
                  <div className="section-content">
                    {category === "DESSERTS" ? (
                      DESSERT_SUBCATEGORIES_ORDER.map((subCat) => {
                        const subProducts = categoryProducts.filter((p) => p.subCategory === subCat);
                        if (subProducts.length === 0) return null;
                        const hasHeader = true;
                        return (
                          <div key={subCat} className={`dessert-subcategory${!hasHeader ? " dessert-subcategory--compact" : ""}`}>
                            {hasHeader && (
                              <>
                                <div className={`dessert-subcategory-header${subCat === "DOUCEURS" || subCat === "PATISSERIE" || subCat === "COOKIES" || subCat === "CAKE" ? " dessert-subcategory-header--black-price" : ""}`}>
                                  <span className="dessert-subcategory-title">{t(`products.dessertSub.${subCat}`)}</span>
                                  <span className="dessert-subcategory-header-right">
                                    {subCat === "PATISSERIE" && (
                                      <span className="dessert-subcategory-formula-note">{t("products.dessertSub.formulaNotePatisserie")}</span>
                                    )}
                                    <span className="dessert-subcategory-price">{DESSERT_SUBCATEGORY_PRICES[subCat]}</span>
                                  </span>
                                </div>
                              </>
                            )}
                            {subProducts.map((product) => (
                              <div
                                key={product.id}
                                className="product-item"
                                onClick={() => console.log('Produit sélectionné:', product.name)}
                              >
                                <div className="product-item-content">
                                  <span className="product-name">
                                    {t(`products.items.${product.id}.name`)}
                                    {product.id === 65 && product.extraPrice && <span className="product-extra-price">{product.extraPrice}</span>}
                                  </span>
                                  <span className="product-description">{t(`products.items.${product.id}.description`)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })
                    ) : (
                      categoryProducts.map((product) => (
                        <div 
                          key={product.id} 
                          className={`product-item ${product.isSpecial ? 'product-special' : ''}`}
                          onClick={() => {
                            console.log('Produit sélectionné:', product.name);
                          }}
                        >
                          <div className="product-item-content">
                            <span className="product-name">
                              {t(`products.items.${product.id}.name`)}
                              {product.isPopular && <span className="product-badge-popular">{t("products.popular")}</span>}
                              {product.isVegetarian && <span className="product-badge-vegetarian">{t("products.vegetarian")}</span>}
                              {product.isVegan && <span className="product-badge-vegan">{t("products.vegan")}</span>}
                              {product.extraPrice && <span className="product-extra-price">{product.extraPrice}</span>}
                            </span>
                            <span className="product-description">{t(`products.items.${product.id}.description`)}</span>
                          </div>
                        </div>
                      ))
                    )}
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
                </div>
              );
            };

            /* Mobile : ordre linéaire comme la version web */
            if (isMobile) {
              return (
                <div className="menu-sections menu-sections-mobile">
                  {orderedCategories.map((category) =>
                    renderSection(category, true)
                  )}
                </div>
              );
            }
            /* Desktop : layout en colonnes */
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
