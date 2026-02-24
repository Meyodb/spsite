import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoVert from "../assets/images/logo-vert.png";

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export const Header = () => {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/" || pathname === "";
  const currentLang = LANGUAGES.find((l) => l.code === (i18n.language || "fr")) || LANGUAGES[0];

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!langDropdownOpen) return;
    const closeDropdown = () => setLangDropdownOpen(false);
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, [langDropdownOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) setLangDropdownOpen(false);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!isHome) return;
    const threshold = window.innerHeight * 0.85;
    const onScroll = () => setScrolledPastHero(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const headerClasses = [
    "main-header",
    isHome && scrolledPastHero ? "header-past-hero" : ""
  ].filter(Boolean).join(" ");

  return (
    <header className={headerClasses}>
      <nav className="main-nav">
        <div className="header-bar">
        <div className="nav-left">
          <Link to="/" className="logo">
            <img src={logoVert} alt="Soup & Juice" />
          </Link>
        </div>
        <button 
          className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMobileMenuOpen(!mobileMenuOpen);
          }}
          aria-label={t("header.ariaMenu")}
          aria-expanded={mobileMenuOpen}
          type="button"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        </div>
        {mobileMenuOpen && (
          <div 
            className="mobile-overlay"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          ></div>
        )}
        <div 
          className={`nav-right ${mobileMenuOpen ? 'mobile-open' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Link 
            to="/" 
            className="nav-link" 
            onClick={() => {
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          >
            {t("header.navHome")}
          </Link>
          <Link 
            to="/produits" 
            className="nav-link" 
            onClick={() => {
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          >
            {t("header.navProducts")}
          </Link>
          <Link to="/restaurants" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t("header.navRestaurants")}</Link>
          <Link to="/adn" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t("header.navAdn")}</Link>
          <Link to="/nos-piliers" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t("header.navPiliers")}</Link>
          <Link to="/contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t("header.navContact")}</Link>
          <div className="nav-right-bottom">
            <a
              href="https://www.instagram.com/soupjuiceparis/?hl=fr"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-header instagram-header"
              onClick={() => setMobileMenuOpen(false)}
              aria-label={t("header.ariaInstagram")}
            >
              <svg className="instagram-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Instagram</span>
            </a>
            <div className={`header-lang-dropdown ${langDropdownOpen ? "is-open" : ""}`}>
            <button
              type="button"
              className="header-lang-trigger"
              onClick={(e) => {
                e.stopPropagation();
                setLangDropdownOpen((open) => !open);
              }}
              aria-expanded={langDropdownOpen}
              aria-haspopup="true"
              aria-label={currentLang.label}
            >
              <span className="header-lang-code">{currentLang.code.toUpperCase()}</span>
              <svg className="header-lang-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {langDropdownOpen && (
              <ul className="header-lang-menu" role="menu">
                {LANGUAGES.map((lang) => (
                  <li key={lang.code} role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className={`header-lang-option ${i18n.language === lang.code ? "active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        localStorage.setItem("soup-juice-lang", lang.code);
                        i18n.changeLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                    >
                      <span className="header-lang-option-flag" aria-hidden="true">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
