import { useTranslation } from "react-i18next";
import "./Legal.css";

export const PolitiqueConfidentialite = () => {
  const { t } = useTranslation();
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <div className="legal-hero-content">
          <h1 className="legal-title">{t("legal.privacyTitle")}</h1>
          <p className="legal-subtitle">Soup & Juice</p>
        </div>
      </section>

      <div className="content-section legal-section">
        <div className="legal-container">
          <div className="legal-content">
            <section className="legal-block">
              <h2 className="legal-block-title">{t("legal.dataController")}</h2>
              <div className="legal-block-content">
                <p>{t("legal.dataControllerContent")}</p>
              </div>
            </section>

            <section className="legal-block">
              <h2 className="legal-block-title">{t("legal.dataCollected")}</h2>
              <div className="legal-block-content">
                <p>{t("legal.dataCollectedContent")}</p>
              </div>
            </section>

            <section className="legal-block">
              <h2 className="legal-block-title">{t("legal.durationRecipients")}</h2>
              <div className="legal-block-content">
                <p>{t("legal.durationContent")}</p>
              </div>
            </section>

            <section className="legal-block">
              <h2 className="legal-block-title">{t("legal.yourRights")}</h2>
              <div className="legal-block-content">
                <p>{t("legal.rightsContent1")}</p>
                <p>{t("legal.rightsContent2Before")}<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="legal-link">CNIL</a>{t("legal.rightsContent2After")}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};
