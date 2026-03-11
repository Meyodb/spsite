import { AnimatedSection, AnimatedItem } from "../components/AnimatedSection";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PageSEO } from "../components/PageSEO";
import traiteurJus from "../assets/images/catering/traiteur-jus.png";
import miniSalades from "../assets/images/catering/mini-salades.png";

export const Catering = () => {
  const { t } = useTranslation();

  const description = t("catering.description");

  return (
    <main className="adn-page">
      <PageSEO
        title="Traiteur & Catering"
        description="Soup & Juice traiteur : plateaux de jus frais, soupes, mini-salades et finger food pour vos événements d'entreprise et réceptions à Paris."
        path="/catering"
      />
      <AnimatedSection id="catering" animation="fadeInUp" className="adn-section">
        {/* Bloc texte principal + photo jus */}
        <section className="adn-identity-section">
          <div className="adn-identity-container">
            <div className="adn-identity-content">
              <AnimatedItem animation="fadeInUp" delay={100}>
                <span className="adn-section-label">{t("catering.label")}</span>
                <h1 className="adn-identity-title">{t("catering.title")}</h1>
                <p className="adn-identity-text">
                  {description}
                </p>
              </AnimatedItem>
            </div>
            <AnimatedItem animation="fadeInUp" delay={200} className="adn-identity-image">
              <div className="adn-photo-placeholder">
                <img
                  src={traiteurJus}
                  alt={t("catering.imageJuicesAlt")}
                  className="adn-photo"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </AnimatedItem>
          </div>
        </section>

        {/* Bloc mini-plats / finger food */}
        <section className="adn-quality-section">
          <div className="adn-quality-container">
            <AnimatedItem animation="fadeInUp" delay={200} className="adn-quality-image">
              <div className="adn-photo-placeholder">
                <img
                  src={miniSalades}
                  alt={t("catering.imageBuffetAlt")}
                  className="adn-photo"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </AnimatedItem>
            <div className="adn-quality-content">
              <AnimatedItem animation="fadeInUp" delay={100}>
                <span className="adn-section-label">{t("catering.sectionFormatsLabel")}</span>
                <h2 className="adn-quality-title">{t("catering.sectionFormatsTitle")}</h2>
                <p className="adn-quality-text">{t("catering.sectionFormatsText")}</p>
              </AnimatedItem>
            </div>
          </div>
        </section>

        {/* CTA Nous contacter */}
        <section className="adn-pillars-cta-section">
          <div className="adn-pillars-cta-container">
            <AnimatedItem animation="fadeInUp" delay={100}>
              <h2 className="adn-pillars-cta-title">{t("catering.ctaTitle")}</h2>
              <Link to="/contact" className="adn-pillars-cta-link">
                {t("catering.ctaContact")}
              </Link>
            </AnimatedItem>
          </div>
        </section>
      </AnimatedSection>
    </main>
  );
};

