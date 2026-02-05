import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const TRAINING_CODE = "SOUP2024";
const STORAGE_KEY = "training_access_granted";

export const CodeProtection = ({ children }) => {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessGranted = localStorage.getItem(STORAGE_KEY);
    if (accessGranted === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (code.trim() === TRAINING_CODE) {
      localStorage.setItem(STORAGE_KEY, "true");
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
