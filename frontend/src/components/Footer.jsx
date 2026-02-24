import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-column">
          <h4 className="footer-title">{t("footer.titleYou")}</h4>
          <ul className="footer-links">
            <li><a href="#/adn">{t("footer.engagements")}</a></li>
            <li><a href="#/nos-piliers">{t("footer.piliers")}</a></li>
            <li><a href="#/restaurants">{t("footer.restaurants")}</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4 className="footer-title">{t("footer.support")}</h4>
          <ul className="footer-links">
            <li><a href="#/contact">{t("footer.contact")}</a></li>
            <li><a href="#/allergenes">{t("footer.allergens")}</a></li>
            <li><a href="#/contact">{t("footer.recruitment")}</a></li>
            <li><a href="#/contact">{t("footer.catering")}</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4 className="footer-title">{t("footer.followUs")}</h4>
          <ul className="footer-links">
            <li>
              <a
                href="https://www.instagram.com/soupjuiceparis/?hl=fr"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-instagram-btn"
                aria-label={t("footer.ariaInstagram")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="24"
                  height="24"
                  aria-hidden="true"
                >
                  {/* Carré à coins arrondis (contour appareil) */}
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  {/* Cercle central (objectif) */}
                  <circle cx="12" cy="12" r="4" />
                  {/* Point flash en haut à droite */}
                  <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>{t("footer.copyright")}</p>
        <div className="footer-legal">
          <a href="#/mentions-legales">{t("footer.legal")}</a>
          <span className="footer-separator">|</span>
          <a href="#/politique-confidentialite">{t("footer.privacy")}</a>
          <span className="footer-separator">|</span>
          <a href="#/politique-cookies">{t("footer.cookies")}</a>
          <span className="footer-separator">|</span>
          <a href="#/cgu">{t("footer.cgu")}</a>
        </div>
      </div>
    </footer>
  );
};
