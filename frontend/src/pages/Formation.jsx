import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CodeProtection } from "../components/CodeProtection";
import { FormationCommonActions } from "../components/FormationCommonActions";
import { FORMATION_SECTIONS } from "./FormationSection";
import { PageSEO } from "../components/PageSEO";
import "./Formation.css";

const SECTION_I18N = { "service-client": "serviceClient", "mise-en-place": "miseEnPlace" };

export const Formation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSectionClick = (sectionId) => {
    navigate(`/formation/${sectionId}`);
  };

  const getSectionTranslationKey = (sectionId) => SECTION_I18N[sectionId] || sectionId;

  return (
    <CodeProtection>
      <main className="formation-page">
        <PageSEO
          title="Espace formation Soup & Juice"
          description="Espace de formation interne Soup & Juice : vidéos et ressources pédagogiques pour les équipes."
          path="/formation"
          noindex
        />
        <div className="formation-container">
          <header className="formation-header">
            <h1>{t("formation.spaceTitle")}</h1>
            <p className="formation-header-subtitle">
              Une formation simple par thème. Clique sur un thème pour accéder aux vidéos explicatives.
            </p>
          </header>

          <div className="formation-cards-grid">
            {FORMATION_SECTIONS.map((section) => {
              const sectionKey = getSectionTranslationKey(section.id);
              return (
              <div
                key={section.id}
                className="formation-section-card"
                onClick={() => handleSectionClick(section.id)}
                style={{
                  backgroundColor: section.bgColor,
                  backgroundImage: section.imageUrl ? `url(${section.imageUrl})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              >
                <div className="formation-card-overlay">
                  <h2 className="formation-card-title">{t(`formation.sections.${sectionKey}`)}</h2>
                  <p className="formation-card-description">{t(`formation.sections.${sectionKey}Desc`)}</p>
                </div>
              </div>
              );
            })}
          </div>

          <FormationCommonActions />
        </div>
      </main>
    </CodeProtection>
  );
};
