import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-column">
          <h4 className="footer-title">{t("footer.titleYou")}</h4>
          <ul className="footer-links">
            <li><Link to="/adn">{t("footer.engagements")}</Link></li>
            <li><Link to="/nos-piliers">{t("footer.piliers")}</Link></li>
            <li><Link to="/restaurants">{t("footer.restaurants")}</Link></li>
            <li><Link to="/catering">{t("footer.catering")}</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4 className="footer-title">{t("footer.support")}</h4>
          <ul className="footer-links">
            <li><Link to="/contact">{t("footer.contact")}</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/allergenes">{t("footer.allergens")}</Link></li>
            <li><Link to="/contact">{t("footer.recruitment")}</Link></li>
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
          <Link to="/mentions-legales">{t("footer.legal")}</Link>
          <span className="footer-separator">|</span>
          <Link to="/politique-confidentialite">{t("footer.privacy")}</Link>
          <span className="footer-separator">|</span>
          <Link to="/politique-cookies">{t("footer.cookies")}</Link>
          <span className="footer-separator">|</span>
          <Link to="/cgu">{t("footer.cgu")}</Link>
        </div>
      </div>
    </footer>
  );
};
