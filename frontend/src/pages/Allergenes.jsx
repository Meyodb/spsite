import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Legal.css";
import "./Allergenes.css";

export const Allergenes = () => {
  const { t } = useTranslation();
  return (
    <main className="legal-page allergens-page">
      <section className="legal-hero allergens-hero">
        <div className="legal-hero-content">
          <h1 className="legal-title">{t("allergens.title")}</h1>
          <p className="legal-subtitle">{t("allergens.subtitle")}</p>
        </div>
      </section>

      <div className="content-section legal-section allergens-section">
        <div className="legal-container">
          <div className="legal-content allergens-content">
            <section className="legal-block">
              <h2 className="legal-block-title">{t("allergens.infoTitle")}</h2>
              <div className="legal-block-content">
                <p>
                  {t("allergens.infoText")}
                </p>
                <div className="allergens-contact-cta">
                  <Link to="/contact" className="allergens-contact-btn">
                    {t("allergens.contactCta")}
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};
