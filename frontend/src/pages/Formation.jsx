import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CodeProtection } from "../components/CodeProtection";
import { FORMATION_SECTIONS } from "./FormationSection";
import "./Formation.css";

export const Formation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSectionClick = (sectionId) => {
    const section = FORMATION_SECTIONS.find(s => s.id === sectionId);
    // Rediriger vers la page de la section si elle a des cartes
    if (section && section.cards && section.cards.length > 0) {
      navigate(`/formation/${sectionId}`);
    }
  };

  return (
    <CodeProtection>
      <main className="formation-page">
        <div className="formation-container">
          <header className="formation-header">
            <h1>{t("formation.spaceTitle")}</h1>
          </header>

          <div className="formation-cards-grid">
            {FORMATION_SECTIONS.map((section) => (
              <div
                key={section.id}
                className="formation-section-card"
                onClick={() => handleSectionClick(section.id)}
                style={{ backgroundColor: section.bgColor }}
              >
                <div className="formation-card-overlay">
                  <h2 className="formation-card-title">{t(`formation.sections.${({ 'service-client': 'serviceClient', 'mise-en-place': 'miseEnPlace' }[section.id] || section.id)}`)}</h2>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </CodeProtection>
  );
};
