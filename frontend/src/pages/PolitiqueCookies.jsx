import { useTranslation } from "react-i18next";
import "./Legal.css";

export const PolitiqueCookies = () => {
  const { t } = useTranslation();
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <div className="legal-hero-content">
          <h1 className="legal-title">{t("legal.cookiesTitle")}</h1>
          <p className="legal-subtitle">Soup & Juice</p>
        </div>
      </section>

      <div className="content-section legal-section">
        <div className="legal-container">
          <div className="legal-content">
            <section className="legal-block">
              <h2 className="legal-block-title">{t("legal.whatIsCookie")}</h2>
              <div className="legal-block-content">
                <p>{t("legal.whatIsCookieContent")}</p>
              </div>
            </section>

            <section className="legal-block">
              <h2 className="legal-block-title">{t("legal.cookiesUsed")}</h2>
              <div className="legal-block-content">
                <p>{t("legal.cookiesUsedContent")}</p>
              </div>
            </section>

            <section className="legal-block">
              <h2 className="legal-block-title">{t("legal.cookiesRights")}</h2>
              <div className="legal-block-content">
                <p>{t("legal.cookiesRightsContent1")}</p>
                <p>{t("legal.cookiesRightsContent2")}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};
