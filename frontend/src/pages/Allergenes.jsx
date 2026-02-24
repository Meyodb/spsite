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
  /* Soupes (fiches) */
  { category: "Soupes (fiches)", product: "PETITS POIS MENTHE", allergens: ["gluten", "soja", "celeri"] },
  { category: "Soupes (fiches)", product: "PATATE DOUCE AU LAIT DE COCO", allergens: ["celeri", "lait"] },
  { category: "Soupes (fiches)", product: "CAROTTE PAVOT", allergens: ["gluten", "soja", "celeri"] },
  { category: "Soupes (fiches)", product: "LENTILLES À L'INDIENNE", allergens: ["gluten", "soja"] },
  { category: "Soupes (fiches)", product: "CAROTTE COURGETTE PANAIS", allergens: ["gluten", "soja", "celeri"] },
  { category: "Soupes (fiches)", product: "ASPERGES", allergens: ["gluten", "soja", "celeri"] },
  { category: "Soupes (fiches)", product: "CHAMPIGNONS", allergens: ["gluten", "soja", "celeri"] },
  { category: "Soupes (fiches)", product: "CHAMPIGNONS MIEL", allergens: ["gluten", "soja", "sulfites", "celeri"] },
  { category: "Soupes (fiches)", product: "BROCOLIS AU BLEU", allergens: ["gluten", "soja", "lait", "celeri"] },
  { category: "Soupes (fiches)", product: "CAPONATA", allergens: ["gluten", "soja", "celeri"] },
  { category: "Soupes (fiches)", product: "CÉLERI POMMES NOISETTES", allergens: ["gluten", "soja", "celeri", "fruitsacoque"] },
  { category: "Soupes (fiches)", product: "CAROTTES POMMES ET CURRY", allergens: ["gluten", "soja"] },
  { category: "Soupes (fiches)", product: "CAROTTE ORANGE", allergens: ["gluten", "soja"] },
  { category: "Soupes (fiches)", product: "CHAMPIGNONS FAÇON RISOTTO", allergens: ["celeri"] },
  { category: "Soupes (fiches)", product: "COCO BLANCS À LA TOMATE", allergens: ["gluten", "soja", "celeri"] },
  { category: "Soupes (fiches)", product: "COURGETTES GINGEMBRE", allergens: ["gluten", "soja", "lait", "celeri"] },
  { category: "Soupes (fiches)", product: "ÉPINARD FETA", allergens: ["gluten", "soja", "lait", "celeri"] },
  { category: "Soupes (fiches)", product: "ESPAGNOLE À LA CORIANDRE", allergens: ["celeri"] },
  { category: "Soupes (fiches)", product: "TOMATE ET FENOUIL", allergens: ["gluten", "soja", "celeri"] },
  { category: "Soupes (fiches)", product: "GASPACHO DE BROCOLIS", allergens: ["gluten", "soja", "lait", "celeri"] },
  { category: "Soupes (fiches)", product: "GASPACHO DE CAROTTES", allergens: [] },
  { category: "Soupes (fiches)", product: "GASPACHO DE TOMATES", allergens: [] },
  { category: "Soupes (fiches)", product: "HARICOTS VERTS", allergens: ["gluten", "soja", "celeri"] },
  { category: "Soupes (fiches)", product: "LENTILLES CORAIL AU LAIT DE COCO", allergens: ["lait"] },
  { category: "Soupes (fiches)", product: "MAÏS AU POIVRON", allergens: ["celeri"] },
  { category: "Soupes (fiches)", product: "MÉDITERRANÉENNE", allergens: ["celeri"] },
  { category: "Soupes (fiches)", product: "HARICOT ROUGE À LA MEXICAINE", allergens: [] },
  { category: "Soupes (fiches)", product: "MIX LÉGUMES À LA CORIANDRE", allergens: ["celeri"] },
  { category: "Soupes (fiches)", product: "PETITS POIS ET CAROTTES", allergens: ["gluten", "soja", "celeri"] },
  { category: "Soupes (fiches)", product: "MULLIGATOWNY", allergens: ["lait", "moutarde", "arachides", "fruitsacoque"] },
  { category: "Soupes (fiches)", product: "POIREAUX PDT À L'ESTRAGON", allergens: ["gluten", "soja", "celeri"] },
  { category: "Soupes (fiches)", product: "POIS CASSÉS", allergens: ["gluten", "soja", "celeri"] },
  { category: "Soupes (fiches)", product: "POTIMARRON", allergens: ["celeri"] },
  { category: "Soupes (fiches)", product: "POTIMARRON AU LAIT DE COCO", allergens: ["lait"] },
  { category: "Soupes (fiches)", product: "TOMATE AU BASILIC", allergens: [] },
  { category: "Soupes (fiches)", product: "VICHYSSOISE", allergens: ["gluten", "soja", "celeri"] },
  { category: "Soupes (fiches)", product: "VELOUTÉ D'OSEILLE", allergens: ["gluten", "soja", "lait", "celeri"] },
  { category: "Soupes (fiches)", product: "BUTTERNUT FENOUIL", allergens: [] },
  { category: "Soupes (fiches)", product: "PANAIS AU MIEL", allergens: [] },
  { category: "Soupes (fiches)", product: "POIRE ET BROCOLIS", allergens: [] },
  { category: "Soupes (fiches)", product: "PANAIS", allergens: ["gluten", "soja"] },
  /* Plats chauds (fiches) */
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
  { category: "Plats chauds (fiches)", product: "DUO DE RIZ AUBERGINES FALAFEL", allergens: ["gluten", "moutarde", "sulfites"] },
  { category: "Plats chauds (fiches)", product: "FAGOTTINI", allergens: ["gluten", "oeufs", "lait"] },
  { category: "Plats chauds (fiches)", product: "PÂTES AU PESTO", allergens: ["gluten", "lait", "fruitsacoque"] },
  { category: "Quiches & tartes (fiches)", product: "QUICHE LORRAINE", allergens: ["gluten", "oeufs", "lait", "fruitsacoque"] },
  { category: "Quiches & tartes (fiches)", product: "QUICHE 3 FROMAGES", allergens: ["gluten", "oeufs", "lait"] },
  { category: "Quiches & tartes (fiches)", product: "QUICHE RICOTTA TOMATO CERISE", allergens: ["gluten", "oeufs", "lait"] },
  { category: "Quiches & tartes (fiches)", product: "TARTE SAUMON ÉPINARDS", allergens: ["gluten", "oeufs", "poissons", "lait", "fruitsacoque"] },
  { category: "Quiches & tartes (fiches)", product: "TARTE CHÈVRE ÉPINARDS", allergens: ["gluten", "oeufs", "lait", "fruitsacoque", "sesame"] },
  { category: "Salades (fiches)", product: "SALADE BOLLYWOOD", allergens: ["gluten", "soja", "lait", "sulfites"] },
  { category: "Salades (fiches)", product: "SALADE DE BETTERAVES", allergens: ["lait", "sesame"] },
  { category: "Salades (fiches)", product: "SALADE LENTILLE ŒUF POCHÉ", allergens: ["oeufs", "moutarde"] },
  { category: "Salades (fiches)", product: "SALADE LENTILLE SAUMON", allergens: ["moutarde"] },
  { category: "Salades (fiches)", product: "SALADE POULET CAJUN & MANGUE", allergens: ["gluten", "soja", "lait", "moutarde"] },
  { category: "Salades (fiches)", product: "SALADE RIZ NOIR PATATE DOUCE BACON", allergens: ["lait"] },
  { category: "Salades (fiches)", product: "SALADE RIZ NOIR TAPENADE DE THON", allergens: ["poissons", "celeri", "oeufs", "moutarde", "lait"] },
  { category: "Salades (fiches)", product: "SALADE LOW CARB", allergens: ["moutarde", "oeufs", "lait", "fruitsacoque"] },
  { category: "Salades (fiches)", product: "SALADE SAUMON GRAVLAX", allergens: ["gluten", "poissons", "celeri", "moutarde", "sulfites"] },
  { category: "Salades (fiches)", product: "SALADE SUSHI", allergens: ["oeufs", "poissons", "soja", "moutarde", "sesame"] },
  { category: "Salades (fiches)", product: "SALADE ÉPEAUTRE", allergens: ["gluten", "lait"] },
  { category: "Salades (fiches)", product: "QUINOA & HALLOUMI", allergens: ["gluten", "lait"] },
  { category: "Salades (fiches)", product: "QUINOA & ÉCREVISSES", allergens: ["crustaces"] },
  { category: "Salades (fiches)", product: "RIZ NOIR & ÉCREVISSES", allergens: ["crustaces"] },
  { category: "Wraps & bagels (fiches)", product: "WRAP THON", allergens: ["gluten", "oeufs", "poissons", "lait", "celeri", "moutarde"] },
  { category: "Wraps & bagels (fiches)", product: "WRAP SAUMON", allergens: ["gluten", "oeufs", "poissons", "moutarde"] },
  { category: "Wraps & bagels (fiches)", product: "WRAP FETA (VÉGÉTARIEN)", allergens: ["gluten", "lait"] },
  { category: "Wraps & bagels (fiches)", product: "WRAP FALAFEL (VÉGÉTALIEN)", allergens: ["gluten", "sesame"] },
  { category: "Wraps & bagels (fiches)", product: "BAGEL PASTRAMI", allergens: ["gluten", "oeufs", "lait", "moutarde", "sesame"] },
  { category: "Wraps & bagels (fiches)", product: "BAGEL DINDE & CHEDDAR", allergens: ["gluten", "lait", "moutarde", "sesame"] },
  { category: "Wraps & bagels (fiches)", product: "BAGEL HOLLAND STYLE", allergens: ["gluten", "lait", "sesame"] },
  { category: "Wraps & bagels (fiches)", product: "BAGEL MOZZARELLA", allergens: ["gluten", "lait", "sesame"] },
  { category: "Wraps & bagels (fiches)", product: "BAGEL SAUMON", allergens: ["gluten", "lait", "sesame"] },
  { category: "Wraps & bagels (fiches)", product: "BATBOUT THON", allergens: ["gluten", "poissons"] },
  { category: "Desserts (fiches)", product: "COMPOTE POMME BANANE", allergens: [] },
  { category: "Desserts (fiches)", product: "COMPOTE POMME FRAISE", allergens: [] },
  { category: "Desserts (fiches)", product: "CRUMBLE POMME FRAISE", allergens: ["gluten", "lait"] },
  { category: "Desserts (fiches)", product: "PERLES CHIA FRAMBOISE", allergens: [] },
  { category: "Desserts (fiches)", product: "PANACOTTA FRAISE FRAMBOISE", allergens: ["lait"] },
  { category: "Desserts (fiches)", product: "PERLES CHIA MANGUE PASSION", allergens: ["lait"] },
  { category: "Desserts (fiches)", product: "CAKE CAROTTE", allergens: ["gluten", "oeufs"] },
  { category: "Desserts (fiches)", product: "CAKE CHOCOLAT EXTREME", allergens: ["gluten", "oeufs", "lait"] },
  { category: "Desserts (fiches)", product: "CAKE CITRON PAVOT", allergens: ["gluten", "oeufs", "lait"] },
  { category: "Desserts (fiches)", product: "CAKE MARBRÉ CHOCOLAT", allergens: ["gluten", "oeufs", "lait"] },
  { category: "Desserts (fiches)", product: "CAKE POMME NOIX", allergens: ["gluten", "oeufs", "fruitsacoque"] },
  { category: "Desserts (fiches)", product: "CAKE BANANE", allergens: ["gluten", "oeufs", "fruitsacoque"] },
  { category: "Desserts (fiches)", product: "CAKE ANANAS", allergens: ["gluten", "oeufs"] },
  { category: "Desserts (fiches)", product: "CAKE ORANGE", allergens: ["gluten", "oeufs", "lait"] },
  { category: "Desserts (fiches)", product: "CAKE CHOCOLAT BLANC NOISETTE", allergens: ["gluten", "oeufs", "soja", "lait", "fruitsacoque"] },
  { category: "Desserts (fiches)", product: "CAKE GRIOTTE AMANDE", allergens: ["gluten", "oeufs", "fruitsacoque"] },
  { category: "Desserts (fiches)", product: "CAKE PISTACHE CAFÉ", allergens: ["gluten", "oeufs", "soja", "lait", "fruitsacoque"] },
  { category: "Desserts (fiches)", product: "TARTE CITRON MERINGUÉE", allergens: ["gluten", "oeufs", "lait", "fruitsacoque"] },
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

        <div className="allergenes-disclaimer">
          <p>
            Tous nos plats ayant tous été travaillés dans nos laboratoires peuvent contenir des traces de céréales 
            contenant du gluten (blé, seigle, orge, avoine, épeautre, kamut ou leurs souches hybridées) et produits 
            à base de céréales, de crustacés et produits à base de crustacés, d'oeufs et produits à base d'oeufs, 
            de poissons et produits à base de poissons, d'arachides et produits à base d'Arachides, d'oeufs et 
            produits à base d'oeufs, de soja et produits à base de soja, de lait et produits à base de lait 
            (y compris lactose) de fruits à coques (amandes, noisettes, noix, noix de cajou, noix de pécan, 
            noix du Brésil, pistaches) et produits à base de fruits à coques, de céleri et produits à base de 
            céleri, de moutarde, de graines de sésame et produits à base de graines de sésame, de Anhydride 
            sulfureux et sulfites en concentration de plus de 10mg/kg ou 10 mg/l (exprimé en SO2), de lupin et 
            produits à base de lupin, de mollusques et produits à base de mollusques.
          </p>
        </div>
      </div>
    </main>
  );
};
