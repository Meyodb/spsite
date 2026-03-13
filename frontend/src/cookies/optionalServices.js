import {
  COOKIE_CONSENT_VALUES,
  getCookieConsent,
  hasCookieConsent,
} from "./consent";

const GA_SCRIPT_ID = "sj-ga-script";
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

if (GA_MEASUREMENT_ID) {
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
}

function initGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID || document.getElementById(GA_SCRIPT_ID)) return;

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

function disableGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return;

  window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
}

export function applyOptionalServicesFromConsent() {
  const consent = getCookieConsent();

  if (consent === COOKIE_CONSENT_VALUES.ACCEPTED) {
    initGoogleAnalytics();
    if (GA_MEASUREMENT_ID) {
      window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
    }
    return;
  }

  disableGoogleAnalytics();
}

export function isAnalyticsEnabled() {
  return hasCookieConsent() && Boolean(GA_MEASUREMENT_ID);
}
