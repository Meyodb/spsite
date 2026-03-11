import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./CookieBanner.css";
import {
  COOKIE_CONSENT_OPEN_EVENT,
  COOKIE_CONSENT_VALUES,
  getCookieConsent,
  setCookieConsent,
} from "../cookies/consent";

export const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) setVisible(true);

    const openHandler = () => setVisible(true);
    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, openHandler);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, openHandler);
    };
  }, []);

  const handleAccept = () => {
    setCookieConsent(COOKIE_CONSENT_VALUES.ACCEPTED);
    setVisible(false);
  };

  const handleRefuse = () => {
    setCookieConsent(COOKIE_CONSENT_VALUES.REFUSED);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Consentement cookies">
      <div className="cookie-banner-inner">
        <p className="cookie-banner-text">
          Nous utilisons des cookies pour améliorer votre expérience sur notre site.
          En continuant, vous acceptez notre{" "}
          <Link to="/politique-cookies" className="cookie-banner-link">
            politique de cookies
          </Link>.
        </p>
        <div className="cookie-banner-actions">
          <button type="button" className="cookie-btn cookie-btn--accept" onClick={handleAccept}>
            Accepter
          </button>
          <button type="button" className="cookie-btn cookie-btn--refuse" onClick={handleRefuse}>
            Refuser
          </button>
        </div>
      </div>
    </div>
  );
};
