import { useTranslation } from "react-i18next";
import { AnimatedSection, AnimatedItem } from "../components/AnimatedSection";
import { PageSEO } from "../components/PageSEO";
import qualiteImage from "../assets/images/photo-menu/Photoroom_20250704_124732.JPG";

export const NosPiliers = () => {
  const { t } = useTranslation();

  return (
    <main className="piliers-page">
      <PageSEO
        title="Nos 3 Piliers : Forme, Régime, Santé"
        description="Les 3 piliers de Soup & Juice : Forme, Régime et Santé. Des recettes conçues pour votre bien-être au quotidien avec des ingrédients frais et naturels."
        path="/nos-piliers"
      />
      <AnimatedSection id="piliers" animation="fadeInUp" className="piliers-section">
        {/* Section Les 3 piliers : FORME, RÉGIME, SANTÉ */}
        <section className="adn-pillars-section">
          <div className="adn-pillars-container">
            <AnimatedItem animation="fadeInUp" delay={100}>
              <h1 className="adn-pillars-section-title">{t("adn.pillars.title")}</h1>
            </AnimatedItem>

            <AnimatedItem animation="fadeInUp" delay={120}>
              <div className="adn-pillars-photo">
                <img src={qualiteImage} alt={t("adn.qualite.imageAlt")} className="adn-photo" loading="lazy" decoding="async" />
              </div>
            </AnimatedItem>

            <div className="adn-pillars-grid">
              <AnimatedItem animation="fadeInUp" delay={150} className="adn-pillar">
                <article className="adn-pillar-card" aria-labelledby="piliers-forme-title">
                  <h3 id="piliers-forme-title" className="adn-pillar-title">{t("adn.forme.title")}</h3>
                  <p className="adn-pillar-intro">{t("adn.forme.intro")}</p>
                  <p className="adn-pillar-body">{t("adn.forme.body")}</p>
                  <div className="adn-pillar-results">
                    <p className="adn-pillar-result-label">{t("adn.forme.resultLabel")}</p>
                    <ul className="adn-pillar-list">
                      <li>{t("adn.forme.bullet1")}</li>
                      <li>{t("adn.forme.bullet2")}</li>
                      <li>{t("adn.forme.bullet3")}</li>
                    </ul>
                  </div>
                  <p className="adn-pillar-tagline">{t("adn.forme.tagline")}</p>
                </article>
              </AnimatedItem>

              <AnimatedItem animation="fadeInUp" delay={200} className="adn-pillar">
                <article className="adn-pillar-card" aria-labelledby="piliers-regime-title">
                  <h3 id="piliers-regime-title" className="adn-pillar-title">{t("adn.regime.title")}</h3>
                  <p className="adn-pillar-intro">{t("adn.regime.intro")}</p>
                  <p className="adn-pillar-body">{t("adn.regime.body")}</p>
                  <p className="adn-pillar-tagline">{t("adn.regime.tagline")}</p>
                </article>
              </AnimatedItem>

              <AnimatedItem animation="fadeInUp" delay={250} className="adn-pillar">
                <article className="adn-pillar-card" aria-labelledby="piliers-sante-title">
                  <h3 id="piliers-sante-title" className="adn-pillar-title">{t("adn.sante.title")}</h3>
                  <p className="adn-pillar-intro">{t("adn.sante.intro")}</p>
                  <p className="adn-pillar-body">{t("adn.sante.body")}</p>
                  <p className="adn-pillar-tagline">{t("adn.sante.tagline")}</p>
                </article>
              </AnimatedItem>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </main>
  );
};
