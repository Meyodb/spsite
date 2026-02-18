import { useTranslation } from "react-i18next";
import "./Legal.css";

export const MentionsLegales = () => {
  const { t } = useTranslation();
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <div className="legal-hero-content">
          <h1 className="legal-title">{t("legal.mentionsTitle")}</h1>
          <p className="legal-subtitle">Soup & Juice</p>
        </div>
      </section>

      <div className="content-section legal-section">
        <div className="legal-container">
          <div className="legal-content">
            <section className="legal-block">
              <h2 className="legal-block-title">{t("legal.editor")}</h2>
              <div className="legal-block-content">
                <p>
                  <strong>WHATEVER</strong> (SAS) — 54 avenue Kléber, 75016 Paris.<br />
                  SIREN : 439 077 462. Directeur de publication : WHATEVER.
                </p>
              </div>
            </section>

            <section className="legal-block">
              <h2 className="legal-block-title">{t("common.contact")}</h2>
              <div className="legal-block-content">
                <p>contact@soup-juice.fr</p>
              </div>
            </section>

            <section className="legal-block">
              <h2 className="legal-block-title">{t("legal.hosting")}</h2>
              <div className="legal-block-content">
                <p>
                  <strong>Vercel Inc.</strong> — 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.<br />
                  <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="legal-link">https://vercel.com</a>
                </p>
              </div>
            </section>

            <section className="legal-block">
              <h2 className="legal-block-title">{t("legal.ipRights")}</h2>
              <div className="legal-block-content">
                <p>{t("legal.ipContent1")}</p>
                <p>
                  {t("legal.ipDataLabel")} <a href="#/politique-confidentialite" className="legal-link">{t("legal.privacyLink")}</a>. {t("legal.ipCookiesLabel")} <a href="#/politique-cookies" className="legal-link">{t("legal.cookiesLink")}</a>.
                </p>
                <p>{t("legal.ipContent3")}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};
