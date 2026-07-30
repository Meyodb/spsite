import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./CodeProtection.css";

const TRAINING_CODE = "SOUP2024";
const STORAGE_KEY = "training_access_granted";
// Durée de validité d'une session d'accès à l'espace formation (12 heures).
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

export const CodeProtection = ({ children }) => {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const expiresAt = Number(localStorage.getItem(STORAGE_KEY));
    if (expiresAt && Date.now() < expiresAt) {
      // Lecture client au montage (localStorage) : requise pour le SSR.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  // Verrouille automatiquement la page quand la session expire pendant la navigation.
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const expiresAt = Number(localStorage.getItem(STORAGE_KEY));
    if (!expiresAt) return undefined;
    const timeoutId = setTimeout(() => {
      localStorage.removeItem(STORAGE_KEY);
      setIsAuthenticated(false);
    }, Math.max(0, expiresAt - Date.now()));
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (code.trim() === TRAINING_CODE) {
      localStorage.setItem(STORAGE_KEY, String(Date.now() + SESSION_DURATION_MS));
      setIsAuthenticated(true);
    } else {
      setError(t("codeProtection.error"));
      setCode("");
    }
  };

  if (isLoading) {
    return (
      <div className="code-protection-container">
        <div className="code-protection-loader">{t("codeProtection.loading")}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="code-protection-container">
        <div className="code-protection-box">
          <div className="code-protection-header">
            <h2>{t("codeProtection.title")}</h2>
            <p>{t("codeProtection.subtitle")}</p>
          </div>
          <form onSubmit={handleSubmit} className="code-protection-form">
            <div className="code-input-group">
              <label htmlFor="code">{t("codeProtection.codeLabel")}</label>
              <input
                id="code"
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t("codeProtection.codePlaceholder")}
                className={error ? "error" : ""}
                autoFocus
              />
              {error && <span className="error-message">{error}</span>}
            </div>
            <button type="submit" className="code-submit-btn">
              {t("codeProtection.submit")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
