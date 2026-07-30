import {
  COOKIE_CONSENT_VALUES,
  getCookieConsent,
  hasCookieConsent,
} from "./consent";

const GA_SCRIPT_ID = "sj-ga-script";
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

const isBrowser = () => typeof window !== "undefined";

// Google Analytics reste désactivé par défaut : le drapeau ga-disable-* doit
// être posé avant tout chargement du script.
function setGaDisabled(disabled) {
  if (!isBrowser() || !GA_MEASUREMENT_ID) return;
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = disabled;
}

setGaDisabled(true);

function initGoogleAnalytics() {
  if (!isBrowser() || !GA_MEASUREMENT_ID) return;
  if (document.getElementById(GA_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = GA_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
}

export function applyOptionalServicesFromConsent() {
  if (!isBrowser()) return;

  if (getCookieConsent() === COOKIE_CONSENT_VALUES.ACCEPTED) {
    initGoogleAnalytics();
    setGaDisabled(false);
    return;
  }

  setGaDisabled(true);
}

export function isAnalyticsEnabled() {
  return hasCookieConsent() && Boolean(GA_MEASUREMENT_ID);
}
