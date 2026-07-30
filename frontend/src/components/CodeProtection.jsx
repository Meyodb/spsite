import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { apiUrl } from "../utils/apiUrl";
import "./CodeProtection.css";

export const CodeProtection = ({ children }) => {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // L'accès est validé par le serveur : le code ne se trouve plus dans le
  // bundle JS et les vidéos restent inaccessibles sans session valide.
  useEffect(() => {
    let cancelled = false;

    fetch(apiUrl("/api/formation/session"), { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .catch(() => ({ authenticated: false }))
      .then((data) => {
        if (cancelled) return;
        setIsAuthenticated(Boolean(data.authenticated));
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(apiUrl("/api/formation/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: code.trim() }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setCode("");
      } else {
        setError(t("codeProtection.error"));
        setCode("");
      }
    } catch {
      setError(t("common.errorConnection"));
    } finally {
      setIsSubmitting(false);
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
                autoComplete="off"
                autoFocus
              />
              {error && (
                <span className="error-message" role="alert">
                  {error}
                </span>
              )}
            </div>
            <button type="submit" className="code-submit-btn" disabled={isSubmitting}>
              {t("codeProtection.submit")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
