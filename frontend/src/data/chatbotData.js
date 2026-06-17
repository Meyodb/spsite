import { PRODUCTS } from "./productsData";
import { RESTAURANTS } from "./restaurantsData";

/**
 * Structure d'un noeud :
 * {
 *   text: string,                         // message du bot
 *   items?: Array<{                       // éléments listés (optionnel)
 *     title: string,
 *     subtitle?: string,
 *     to?: string,                        // lien interne
 *   }>,
 *   options: Array<{
 *     label: string,
 *     action: { type, ... }
 *   }>
 * }
 *
 * Types d'action supportés :
 *   { type: 'goto', nodeId, params? }     → navigue vers un autre noeud
 *   { type: 'link', to }                  → redirige vers une route
 *   { type: 'reset' }                     → retour à l'accueil du bot
 */

const CATEGORY_I18N = {
  JUS: "JUS",
  MILKSHAKES: "MILKSHAKES",
  BOOSTERS: "BOOSTERS",
  SOUPES: "SOUPES",
  PLATS_CHAUDS: "PLATS_CHAUDS",
  SALADES: "SALADES",
  SANDWICH: "SANDWICH",
  DESSERTS: "DESSERTS",
  BOISSONS: "BOISSONS",
};

const MAX_ITEMS_PER_CATEGORY = 12;

function getVisibleProductsByCategory(category) {
  return PRODUCTS.filter((p) => p.category === category && p.afficher !== false);
}

function translateProduct(product, t) {
  const translatedName = t(`products.items.${product.id}.name`, {
    defaultValue: product.name,
  });
  const translatedDesc = t(`products.items.${product.id}.description`, {
    defaultValue: product.description || "",
  });
  return { name: translatedName, description: translatedDesc };
}

function buildRootNode(t) {
  return {
    text: t("chatbot.welcome"),
    options: [
      {
        label: `🥤 ${t("chatbot.menu.products")}`,
        action: { type: "goto", nodeId: "products-menu" },
      },
      {
        label: `📍 ${t("chatbot.menu.restaurants")}`,
        action: { type: "goto", nodeId: "restaurants-menu" },
      },
      {
        label: `❓ ${t("chatbot.menu.faq")}`,
        action: { type: "goto", nodeId: "faq-menu" },
      },
      {
        label: `✉️ ${t("chatbot.menu.contact")}`,
        action: { type: "link", to: "/contact" },
      },
    ],
  };
}

function buildProductsMenu(t) {
  const categories = [
    { key: "JUS", emoji: "🍊" },
    { key: "MILKSHAKES", emoji: "🥛" },
    { key: "BOOSTERS", emoji: "💪" },
    { key: "SOUPES", emoji: "🍲" },
    { key: "PLATS_CHAUDS", emoji: "🍛" },
    { key: "SALADES", emoji: "🥗" },
    { key: "SANDWICH", emoji: "🥪" },
    { key: "DESSERTS", emoji: "🍰" },
  ];

  return {
    text: t("chatbot.products.chooseCategory"),
    options: [
      ...categories.map(({ key, emoji }) => ({
        label: `${emoji} ${t(`products.categories.${CATEGORY_I18N[key]}`)}`,
        action: { type: "goto", nodeId: "products-list", params: { category: key } },
      })),
      {
        label: `📋 ${t("chatbot.products.allergensTable")}`,
        action: { type: "link", to: "/allergenes" },
      },
      {
        label: `← ${t("chatbot.common.backToMenu")}`,
        action: { type: "reset" },
      },
    ],
  };
}

function buildProductsList(t, { category }) {
  const visible = getVisibleProductsByCategory(category);
  const shown = visible.slice(0, MAX_ITEMS_PER_CATEGORY);
  const remaining = visible.length - shown.length;
  const categoryLabel = t(`products.categories.${CATEGORY_I18N[category]}`);

  const items = shown.map((p) => {
    const { name, description } = translateProduct(p, t);
    return {
      title: name,
      subtitle: description,
    };
  });

  const text =
    remaining > 0
      ? t("chatbot.products.listWithMore", {
          category: categoryLabel,
          count: remaining,
        })
      : t("chatbot.products.list", { category: categoryLabel });

  return {
    text,
    items,
    options: [
      {
        label: `🛒 ${t("chatbot.products.viewFullMenu")}`,
        action: { type: "link", to: "/produits" },
      },
      {
        label: `📋 ${t("chatbot.products.allergensTable")}`,
        action: { type: "link", to: "/allergenes" },
      },
      {
        label: `← ${t("chatbot.common.backToProducts")}`,
        action: { type: "goto", nodeId: "products-menu" },
      },
      {
        label: `🏠 ${t("chatbot.common.backToMenu")}`,
        action: { type: "reset" },
      },
    ],
  };
}

function buildRestaurantsMenu(t) {
  const items = RESTAURANTS.map((r) => {
    const metroNames = (r.metro || []).map((m) => m.name).join(" · ");
    const shortName = r.name.replace("S&J ", "");
    return {
      title: shortName,
      subtitle: `${r.address}${metroNames ? ` — 🚇 ${metroNames}` : ""}`,
      to: `/restaurants/${r.slug}`,
    };
  });

  return {
    text: t("chatbot.restaurants.list", { count: RESTAURANTS.length }),
    items,
    options: [
      {
        label: `🗺️ ${t("chatbot.restaurants.viewMap")}`,
        action: { type: "link", to: "/restaurants" },
      },
      {
        label: `🚇 ${t("chatbot.restaurants.byMetroLine")}`,
        action: { type: "goto", nodeId: "restaurants-by-line" },
      },
      {
        label: `← ${t("chatbot.common.backToMenu")}`,
        action: { type: "reset" },
      },
    ],
  };
}

function buildRestaurantsByLineMenu(t) {
  const lineMap = new Map();
  RESTAURANTS.forEach((r) => {
    (r.metro || []).forEach((stop) => {
      (stop.lines || []).forEach((line) => {
        if (!lineMap.has(line)) lineMap.set(line, new Set());
        lineMap.get(line).add(r.id);
      });
    });
  });

  const sortedLines = Array.from(lineMap.keys()).sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    if (Number.isNaN(na) || Number.isNaN(nb)) return String(a).localeCompare(String(b));
    return na - nb;
  });

  return {
    text: t("chatbot.restaurants.chooseLine"),
    options: [
      ...sortedLines.map((line) => ({
        label: `🚇 ${t("chatbot.restaurants.line", { line })}`,
        action: {
          type: "goto",
          nodeId: "restaurants-line-result",
          params: { line },
        },
      })),
      {
        label: `← ${t("chatbot.common.backToRestaurants")}`,
        action: { type: "goto", nodeId: "restaurants-menu" },
      },
    ],
  };
}

function buildRestaurantsLineResult(t, { line }) {
  const matching = RESTAURANTS.filter((r) =>
    (r.metro || []).some((stop) => (stop.lines || []).includes(line)),
  );

  const items = matching.map((r) => ({
    title: r.name.replace("S&J ", ""),
    subtitle: r.address,
    to: `/restaurants/${r.slug}`,
  }));

  const text =
    matching.length > 0
      ? t("chatbot.restaurants.lineResult", { line, count: matching.length })
      : t("chatbot.restaurants.lineNoResult", { line });

  return {
    text,
    items,
    options: [
      {
        label: `← ${t("chatbot.restaurants.chooseAnotherLine")}`,
        action: { type: "goto", nodeId: "restaurants-by-line" },
      },
      {
        label: `🏠 ${t("chatbot.common.backToMenu")}`,
        action: { type: "reset" },
      },
    ],
  };
}

// Définition des catégories FAQ + clés i18n (le contenu est dans les locales)
const FAQ_CATEGORIES = [
  {
    id: "restaurants",
    key: "faqCat.restaurants",
    emoji: "📍",
    questions: ["locations", "hours", "delivery"],
  },
  {
    id: "menu",
    key: "faqCat.menu",
    emoji: "🥗",
    questions: ["carte", "juicesFresh", "seasons", "formulas"],
  },
  {
    id: "allergens",
    key: "faqCat.allergens",
    emoji: "⚠️",
    questions: ["howConsult", "vegOptions", "gluten", "lactose"],
  },
  {
    id: "catering",
    key: "faqCat.catering",
    emoji: "🎉",
    questions: ["cateringOffer", "cateringOrder", "cateringDelay"],
  },
  {
    id: "jobs",
    key: "faqCat.jobs",
    emoji: "💼",
    questions: ["hiring", "apply"],
  },
  {
    id: "values",
    key: "faqCat.values",
    emoji: "🌱",
    questions: ["ingredients", "environment", "pillars"],
  },
];

// Lien optionnel pour chaque question
const FAQ_QUESTION_LINKS = {
  locations: "/restaurants",
  carte: "/produits",
  howConsult: "/allergenes",
  cateringOffer: "/catering",
  cateringOrder: "/contact",
  apply: "/contact",
  environment: "/adn",
  pillars: "/nos-piliers",
};

function buildFaqMenu(t) {
  return {
    text: t("chatbot.faq.chooseCategory"),
    options: [
      ...FAQ_CATEGORIES.map((cat) => ({
        label: `${cat.emoji} ${t(`chatbot.${cat.key}`)}`,
        action: {
          type: "goto",
          nodeId: "faq-category",
          params: { categoryId: cat.id },
        },
      })),
      {
        label: `← ${t("chatbot.common.backToMenu")}`,
        action: { type: "reset" },
      },
    ],
  };
}

function buildFaqCategory(t, { categoryId }) {
  const cat = FAQ_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return buildFaqMenu(t);

  return {
    text: t("chatbot.faq.chooseQuestion", { category: t(`chatbot.${cat.key}`) }),
    options: [
      ...cat.questions.map((qId) => ({
        label: t(`chatbot.faqQ.${qId}.q`),
        action: {
          type: "goto",
          nodeId: "faq-answer",
          params: { categoryId, questionId: qId },
        },
      })),
      {
        label: `← ${t("chatbot.common.backToFaq")}`,
        action: { type: "goto", nodeId: "faq-menu" },
      },
    ],
  };
}

function buildFaqAnswer(t, { categoryId, questionId }) {
  const link = FAQ_QUESTION_LINKS[questionId];
  const options = [];

  if (link) {
    options.push({
      label: `🔗 ${t("chatbot.common.learnMore")}`,
      action: { type: "link", to: link },
    });
  }

  options.push({
    label: `← ${t("chatbot.faq.backToCategory")}`,
    action: {
      type: "goto",
      nodeId: "faq-category",
      params: { categoryId },
    },
  });
  options.push({
    label: `❓ ${t("chatbot.faq.otherQuestion")}`,
    action: { type: "goto", nodeId: "faq-menu" },
  });
  options.push({
    label: `✉️ ${t("chatbot.menu.contact")}`,
    action: { type: "link", to: "/contact" },
  });
  options.push({
    label: `🏠 ${t("chatbot.common.backToMenu")}`,
    action: { type: "reset" },
  });

  return {
    text: t(`chatbot.faqQ.${questionId}.a`),
    options,
  };
}

/**
 * Point d'entrée unique : renvoie le noeud demandé.
 * Tous les textes sont traduits via `t` pour rester synchronisés avec la langue active.
 */
export function getNode(nodeId, t, params = {}) {
  switch (nodeId) {
    case "root":
      return buildRootNode(t);
    case "products-menu":
      return buildProductsMenu(t);
    case "products-list":
      return buildProductsList(t, params);
    case "restaurants-menu":
      return buildRestaurantsMenu(t);
    case "restaurants-by-line":
      return buildRestaurantsByLineMenu(t);
    case "restaurants-line-result":
      return buildRestaurantsLineResult(t, params);
    case "faq-menu":
      return buildFaqMenu(t);
    case "faq-category":
      return buildFaqCategory(t, params);
    case "faq-answer":
      return buildFaqAnswer(t, params);
    default:
      return buildRootNode(t);
  }
}
