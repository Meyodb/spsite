import { useTranslation } from "react-i18next";
import "./Legal.css";

export const CGU = () => {
  const { t } = useTranslation();
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <div className="legal-hero-content">
          <h1 className="legal-title">{t("legal.cguTitle")}</h1>
          <p className="legal-subtitle">Soup & Juice</p>
        </div>
      </section>

      <div className="content-section legal-section">
        <div className="legal-container">
          <div className="legal-content">
            <section className="legal-block">
              <h2 className="legal-block-title">{t("legal.editor")}</h2>
              <div className="legal-block-content">
                <p>{t("legal.dataControllerContent")}</p>
              </div>
            </section>

            <section className="legal-block">
              <h2 className="legal-block-title">{t("legal.siteUse")}</h2>
              <div className="legal-block-content">
                <p>{t("legal.siteUseContent1")}</p>
                <p>{t("legal.siteUseContent2")}</p>
              </div>
            </section>

            <section className="legal-block">
              <h2 className="legal-block-title">{t("legal.dataCookies")}</h2>
              <div className="legal-block-content">
                <p>
                  {t("legal.ipDataLabel")} <a href="#/politique-confidentialite" className="legal-link">{t("legal.privacyLink")}</a>. {t("legal.ipCookiesLabel")} <a href="#/politique-cookies" className="legal-link">{t("legal.cookiesLink")}</a>.
                </p>
              </div>
            </section>

            <section className="legal-block">
              <h2 className="legal-block-title">{t("legal.applicableLaw")}</h2>
              <div className="legal-block-content">
                <p>{t("legal.applicableLawContent1")}</p>
                <p>{t("legal.applicableLawContent2")}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};
