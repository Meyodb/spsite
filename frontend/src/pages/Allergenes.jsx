import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./Allergenes.css";

const ALLERGEN_KEYS = [
  "gluten",
  "crustaces",
  "oeufs",
  "poissons",
  "arachides",
  "soja",
  "lait",
  "fruitsacoque",
  "celeri",
  "moutarde",
  "sesame",
  "sulfites",
  "lupin",
  "mollusques",
];

const DOC_ROWS = [
  { category: "Plats chauds (fiches)", product: "CABILLAUD TERIYAKI", allergens: ["gluten", "poissons", "soja", "sesame"] },
  { category: "Plats chauds (fiches)", product: "POULET KORMA", allergens: ["oeufs", "soja", "lait"] },
  { category: "Plats chauds (fiches)", product: "POULET QUINOA TANDOORI", allergens: ["soja", "lait"] },
  { category: "Plats chauds (fiches)", product: "POULET TIKKA MASSALA", allergens: ["gluten", "oeufs", "soja", "lait", "fruitsacoque"] },
  { category: "Plats chauds (fiches)", product: "PLAT CHAUD LASAGNE BOLOGNESE", allergens: ["gluten", "lait", "fruitsacoque"] },
  { category: "Plats chauds (fiches)", product: "PLAT CHAUD POULET BOMBAY", allergens: ["oeufs", "soja", "lait", "celeri", "moutarde"] },
  { category: "Plats chauds (fiches)", product: "PLAT CHAUD POULET CURRY", allergens: ["oeufs", "soja"] },
  { category: "Plats chauds (fiches)", product: "PLAT CHAUD ROUGAIL THON", allergens: ["poissons"] },
  { category: "Plats chauds (fiches)", product: "PLAT CHAUD SAUMON SAUCE CITRON GINGEMBRE", allergens: ["poissons", "lait", "fruitsacoque"] },
  { category: "Plats chauds (fiches)", product: "LASAGNE VEGAN", allergens: ["gluten", "soja", "fruitsacoque"] },
  { category: "Plats chauds (fiches)", product: "DUO DE RIZ, AUBERGINES, FALAFEL", allergens: ["gluten", "moutarde", "sulfites"] },
  { category: "Plats chauds (fiches)", product: "FAGOTTINI", allergens: ["gluten", "oeufs", "lait"] },
  { category: "Plats chauds (fiches)", product: "PATE AU PESTO", allergens: ["gluten", "lait", "fruitsacoque"] },
  { category: "Quiches & tartes (fiches)", product: "QUICHE LORRAINE", allergens: ["gluten", "oeufs", "lait", "fruitsacoque"] },
  { category: "Quiches & tartes (fiches)", product: "QUICHE RICOTTA TOMATO CERISE", allergens: ["gluten", "oeufs", "lait"] },
  { category: "Quiches & tartes (fiches)", product: "TARTE SAUMON EPINARDS", allergens: ["gluten", "oeufs", "poissons", "lait", "fruitsacoque"] },
  { category: "Quiches & tartes (fiches)", product: "TARTE CHEVRE EPINARDS", allergens: ["gluten", "oeufs", "lait", "fruitsacoque", "sesame"] },
  { category: "Salades (fiches)", product: "SALADE BOLLYWOOD", allergens: ["gluten", "soja", "lait", "sulfites"] },
  { category: "Salades (fiches)", product: "SALADE DE BETTERAVES", allergens: ["lait", "sesame"] },
  { category: "Salades (fiches)", product: "SALADE LENTILLE OEUF POCHE", allergens: ["oeufs", "moutarde"] },
  { category: "Salades (fiches)", product: "SALADE LENTILLE SAUMON", allergens: ["moutarde"] },
  { category: "Salades (fiches)", product: "SALADE POULET CAJUN & MANGUE", allergens: ["gluten", "soja", "lait", "moutarde"] },
  { category: "Salades (fiches)", product: "SALADE RIZ NOIR, PATATE DOUCE, BACON", allergens: ["lait"] },
  { category: "Salades (fiches)", product: "SALADE SAUMON GRAVLAX", allergens: ["gluten", "poissons", "celeri", "moutarde", "sulfites"] },
  { category: "Salades (fiches)", product: "SALADE SUSHI", allergens: ["oeufs", "poissons", "soja", "moutarde", "sesame"] },
  { category: "Salades (fiches)", product: "SALADE EPEAUTRE", allergens: ["gluten", "lait"] },
  { category: "Salades (fiches)", product: "QUINOA & HALLOUMI", allergens: ["gluten", "lait"] },
  { category: "Salades (fiches)", product: "QUINOA & ECREVISSES", allergens: ["crustaces"] },
  { category: "Salades (fiches)", product: "RIZ NOIR & ECREVISSES", allergens: ["crustaces"] },
  { category: "Wraps & bagels (fiches)", product: "WRAP THON", allergens: ["gluten", "oeufs", "poissons", "lait", "celeri", "moutarde"] },
  { category: "Wraps & bagels (fiches)", product: "WRAP SAUMON", allergens: ["gluten", "oeufs", "poissons", "moutarde"] },
  { category: "Wraps & bagels (fiches)", product: "WRAP FETA (VEGETARIEN)", allergens: ["gluten", "lait"] },
  { category: "Wraps & bagels (fiches)", product: "WRAP FALAFEL (VEGETALIEN)", allergens: ["gluten", "sesame"] },
  { category: "Wraps & bagels (fiches)", product: "BAGEL PASTRAMI", allergens: ["gluten", "oeufs", "lait", "moutarde", "sesame"] },
  { category: "Wraps & bagels (fiches)", product: "BAGEL DINDE & CHEDDAR", allergens: ["gluten", "lait", "moutarde", "sesame"] },
  { category: "Wraps & bagels (fiches)", product: "BAGEL HOLLAND STYLE", allergens: ["gluten", "lait", "sesame"] },
  { category: "Wraps & bagels (fiches)", product: "BAGEL MOZZARELLA", allergens: ["gluten", "lait", "sesame"] },
  { category: "Wraps & bagels (fiches)", product: "BAGEL SAUMON", allergens: ["gluten", "lait", "sesame"] },
  { category: "Desserts (fiches)", product: "COMPOTE POMME BANANE", allergens: [] },
  { category: "Desserts (fiches)", product: "COMPOTE POMME FRAISE", allergens: [] },
  { category: "Desserts (fiches)", product: "CRUMBLE POMME FRAISE", allergens: ["gluten", "lait"] },
  { category: "Desserts (fiches)", product: "PERLES CHIA COCO FRAMBOISE", allergens: [] },
  { category: "Desserts (fiches)", product: "PANACOTTA FRAISE FRAMBOISE", allergens: ["lait"] },
  { category: "Desserts (fiches)", product: "PERLES CHIA COCO MANGUE PASSION", allergens: ["lait"] },
  { category: "Desserts (fiches)", product: "CAKE CAROTTE", allergens: ["gluten", "oeufs"] },
  { category: "Desserts (fiches)", product: "CAKE CHOCOLAT EXTREME", allergens: ["gluten", "oeufs", "lait"] },
  { category: "Desserts (fiches)", product: "CAKE CITRON PAVOT", allergens: ["gluten", "oeufs", "lait"] },
  { category: "Desserts (fiches)", product: "CAKE MARBRE CHOCOLAT", allergens: ["gluten", "oeufs", "lait"] },
  { category: "Desserts (fiches)", product: "CAKE POMME NOIX", allergens: ["gluten", "oeufs", "fruitsacoque"] },
  { category: "Desserts (fiches)", product: "CAKE BANANE", allergens: ["gluten", "oeufs", "fruitsacoque"] },
  { category: "Desserts (fiches)", product: "CAKE ANANAS", allergens: ["gluten", "oeufs"] },
  { category: "Desserts (fiches)", product: "CAKE ORANGE", allergens: ["gluten", "oeufs", "lait"] },
  { category: "Desserts (fiches)", product: "CAKE CHOCOLAT BLANC NOISETTE", allergens: ["gluten", "oeufs", "soja", "lait", "fruitsacoque"] },
  { category: "Desserts (fiches)", product: "CAKE GRIOTTE AMANDE", allergens: ["gluten", "oeufs", "fruitsacoque"] },
  { category: "Desserts (fiches)", product: "CAKE PISTACHE CAFE", allergens: ["gluten", "oeufs", "soja", "lait", "fruitsacoque"] },
  { category: "Desserts (fiches)", product: "CITRON MERINGUE", allergens: ["gluten", "oeufs", "lait", "fruitsacoque"] },
  { category: "Desserts (fiches)", product: "CHEESECAKE KEYLIME", allergens: ["gluten", "oeufs", "lait"] },
  { category: "Desserts (fiches)", product: "TARTE MYRTILLE", allergens: ["gluten", "oeufs", "lait"] },
  { category: "Desserts (fiches)", product: "TARTE AUX ABRICOTS", allergens: ["gluten", "oeufs", "lait", "fruitsacoque"] },
];

export const Allergenes = () => {
  const { t } = useTranslation();

  const rows = useMemo(
    () =>
      DOC_ROWS.map((row) => ({
        ...row,
        allergenSet: new Set(row.allergens),
      })),
    []
  );

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <main className="allergenes-page">
      <div className="allergenes-container">
        <header className="allergenes-header hide-on-print">
          <h1 className="allergenes-title">{t("allergens.title")}</h1>
          <p className="allergenes-subtitle">{t("allergens.subtitle")}</p>
          <div className="allergenes-actions">
            <button type="button" className="allergenes-pdf-btn" onClick={handleDownloadPdf}>
              {t("allergens.downloadPdf")}
            </button>
            <span className="allergenes-count">{t("allergens.totalProducts", { count: rows.length })}</span>
          </div>
        </header>

        <div className="allergenes-notice hide-on-print">
          <p>{t("allergens.noticePrimary")}</p>
          <p>{t("allergens.noticeSecondary")}</p>
        </div>

        <div className="allergenes-table-wrapper" role="region" aria-label={t("allergens.tableAria")}>
          <table className="allergenes-table">
            <thead>
              <tr>
                <th>{t("allergens.headers.category")}</th>
                <th>{t("allergens.headers.product")}</th>
                {ALLERGEN_KEYS.map((key) => (
                  <th key={key}>{t(`allergens.list.${key}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.category}-${row.product}`}>
                  <td className="allergenes-category-cell">{row.category.replace(" (fiches)", "")}</td>
                  <td className="allergenes-product-cell">{row.product}</td>
                  {ALLERGEN_KEYS.map((key) => (
                    <td key={key} className="allergenes-mark-cell">
                      {row.allergenSet.has(key) ? <span className="allergenes-mark">●</span> : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="allergenes-legend">{t("allergens.legend")}</p>
      </div>
    </main>
  );
};
