export const COOKIE_CONSENT_STORAGE_KEY = "sj_cookie_consent";
export const COOKIE_CONSENT_COOKIE_NAME = "sj_cookie_consent";
export const COOKIE_CONSENT_UPDATED_EVENT = "sj:cookie-consent-updated";
export const COOKIE_CONSENT_OPEN_EVENT = "sj:cookie-consent-open";

export const COOKIE_CONSENT_VALUES = {
  ACCEPTED: "accepted",
  REFUSED: "refused",
};

function getCookie(name) {
  const row = document.cookie
    .split("; ")
    .find((cookiePart) => cookiePart.startsWith(`${name}=`));

  return row ? decodeURIComponent(row.split("=")[1] || "") : null;
}

function setCookie(name, value, days = 180) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getCookieConsent() {
  const cookieValue = getCookie(COOKIE_CONSENT_COOKIE_NAME);
  if (cookieValue) return cookieValue;

  const legacyValue = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  if (legacyValue) {
    setCookie(COOKIE_CONSENT_COOKIE_NAME, legacyValue);
    return legacyValue;
  }

  return null;
}

export function setCookieConsent(value) {
  setCookie(COOKIE_CONSENT_COOKIE_NAME, value);
  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);

  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, {
      detail: { value },
    }),
  );
}

export function openCookieConsentSettings() {
  window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT));
}

export function hasCookieConsent() {
  return getCookieConsent() === COOKIE_CONSENT_VALUES.ACCEPTED;
}
