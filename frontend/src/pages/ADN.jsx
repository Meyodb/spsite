import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AnimatedSection, AnimatedItem } from "../components/AnimatedSection";
import recetteImage from "../assets/images/photo menu/photo-qualite-recettes.jpg";
import logoSoupJuice from "../assets/images/logo vert.png";

export const ADN = () => {
  const { t } = useTranslation();

  return (
    <main className="adn-page">
      <AnimatedSection id="adn" animation="fadeInUp" className="adn-section">
        {/* Section Identité & Vision */}
        <section className="adn-identity-section">
          <div className="adn-identity-container">
            <AnimatedItem animation="fadeInUp" delay={200} className="adn-identity-image">
              <div className="adn-photo-placeholder adn-identity-logo-frame">
                <img src={logoSoupJuice} alt="Soup & Juice" className="adn-identity-logo" />
              </div>
            </AnimatedItem>
            <div className="adn-identity-content">
              <AnimatedItem animation="fadeInUp" delay={100}>
                <span className="adn-section-label">{t("adn.identite.label")}</span>
                <h2 className="adn-identity-title">{t("adn.identite.title")}</h2>
                <p className="adn-identity-text">{t("adn.identite.text")}</p>
              </AnimatedItem>
            </div>
          </div>
        </section>

        {/* Section Qualité & Savoir-faire */}
        <section className="adn-quality-section">
          <div className="adn-quality-container">
            <AnimatedItem animation="fadeInUp" delay={200} className="adn-quality-image">
              <div className="adn-photo-placeholder">
                <img src={recetteImage} alt={t("adn.qualite.imageAlt")} className="adn-photo" />
              </div>
            </AnimatedItem>
            <div className="adn-quality-content">
              <AnimatedItem animation="fadeInUp" delay={100}>
                <span className="adn-section-label">{t("adn.qualite.label")}</span>
                <h2 className="adn-quality-title">{t("adn.qualite.title")}</h2>
                <p className="adn-quality-text">{t("adn.qualite.text")}</p>
              </AnimatedItem>
            </div>
          </div>
        </section>

        {/* Section Nos Engagements */}
        <section className="adn-engagements-section">
          <div className="adn-engagements-container">
            <AnimatedItem animation="fadeInUp" delay={100}>
              <h2 className="adn-engagements-main-title">{t("adn.engagements.subtitle")}</h2>
            </AnimatedItem>
            
            <div className="adn-engagements-grid">
              <AnimatedItem animation="fadeInUp" delay={150} className="adn-engagement-card">
                <article className="adn-engagement-item" aria-labelledby="engagement-1-title">
                  <h3 id="engagement-1-title" className="adn-engagement-title">{t("adn.engagements.jus.title")}</h3>
                  <p className="adn-engagement-text">{t("adn.engagements.jus.text")}</p>
                </article>
              </AnimatedItem>

              <AnimatedItem animation="fadeInUp" delay={200} className="adn-engagement-card">
                <article className="adn-engagement-item" aria-labelledby="engagement-2-title">
                  <h3 id="engagement-2-title" className="adn-engagement-title">{t("adn.engagements.soupes.title")}</h3>
                  <p className="adn-engagement-text">{t("adn.engagements.soupes.text")}</p>
                </article>
              </AnimatedItem>

              <AnimatedItem animation="fadeInUp" delay={250} className="adn-engagement-card">
                <article className="adn-engagement-item" aria-labelledby="engagement-3-title">
                  <h3 id="engagement-3-title" className="adn-engagement-title">{t("adn.engagements.emballages.title")}</h3>
                  <p className="adn-engagement-text">{t("adn.engagements.emballages.text")}</p>
                </article>
              </AnimatedItem>

              <AnimatedItem animation="fadeInUp" delay={300} className="adn-engagement-card">
                <article className="adn-engagement-item" aria-labelledby="engagement-4-title">
                  <h3 id="engagement-4-title" className="adn-engagement-title">{t("adn.engagements.local.title")}</h3>
                  <p className="adn-engagement-text">{t("adn.engagements.local.text")}</p>
                </article>
              </AnimatedItem>
            </div>
          </div>
        </section>

        {/* Section Nos piliers - CTA vers page dédiée */}
        <section className="adn-pillars-cta-section">
          <div className="adn-pillars-cta-container">
            <AnimatedItem animation="fadeInUp" delay={100}>
              <h2 className="adn-pillars-cta-title">{t("adn.pillars.title")}</h2>
              <Link to="/nos-piliers" className="adn-pillars-cta-link">
                {t("adn.pillars.cta")}
              </Link>
            </AnimatedItem>
          </div>
        </section>
      </AnimatedSection>
    </main>
  );
};
