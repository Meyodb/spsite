import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PageSEO } from "../components/PageSEO";
import { ALLERGEN_KEYS, ALLERGEN_ROWS } from "../data/allergensData";
import "./Allergenes.css";

export const Allergenes = () => {
  const { t } = useTranslation();

  const rows = useMemo(
    () =>
      ALLERGEN_ROWS.map((row) => ({
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
      <PageSEO
        title="Allergènes"
        description="Consultez la liste complète des allergènes présents dans les produits S&J. Informations détaillées pour chaque recette."
        path="/allergenes"
        noindex
      />
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
