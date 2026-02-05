import { useTranslation } from "react-i18next";
import { AnimatedSection, AnimatedItem } from "../components/AnimatedSection";

export const ADN = () => {
  const { t } = useTranslation();

  return (
    <main className="adn-page">
      <AnimatedSection id="adn" animation="fadeInUp" className="adn-section">
        <section className="adn-hero" aria-label={t("adn.ariaHero")}>
          <div className="adn-hero-content">
            <AnimatedItem animation="fadeInUp" delay={100}>
              <h1 className="adn-hero-title">{t("adn.heroTitle")}</h1>
            </AnimatedItem>
            <AnimatedItem animation="fadeInUp" delay={200}>
              <p className="adn-hero-subtitle">{t("adn.heroSubtitle")}</p>
            </AnimatedItem>
            <AnimatedItem animation="fadeInUp" delay={250}>
              <span className="adn-hero-sep" aria-hidden="true">⸻</span>
            </AnimatedItem>
          </div>
        </section>

        <div className="adn-pillars">
          <AnimatedItem animation="fadeInUp" delay={100} className="adn-pillar">
            <article className="adn-pillar-card" aria-labelledby="adn-forme-title">
              <h2 id="adn-forme-title" className="adn-pillar-title">{t("adn.forme.title")}</h2>
              <p className="adn-pillar-intro">{t("adn.forme.intro")}</p>
              <p className="adn-pillar-body">{t("adn.forme.body")}</p>
              <p className="adn-pillar-result-label">{t("adn.forme.resultLabel")}</p>
              <ul className="adn-pillar-list">
                <li>{t("adn.forme.bullet1")}</li>
                <li>{t("adn.forme.bullet2")}</li>
                <li>{t("adn.forme.bullet3")}</li>
              </ul>
              <p className="adn-pillar-tagline">{t("adn.forme.tagline")}</p>
            </article>
          </AnimatedItem>

          <AnimatedItem animation="fadeInUp" delay={150} className="adn-pillar">
            <article className="adn-pillar-card" aria-labelledby="adn-regime-title">
              <h2 id="adn-regime-title" className="adn-pillar-title">{t("adn.regime.title")}</h2>
              <p className="adn-pillar-intro">{t("adn.regime.intro")}</p>
              <p className="adn-pillar-body">{t("adn.regime.body")}</p>
              <p className="adn-pillar-tagline">{t("adn.regime.tagline")}</p>
            </article>
          </AnimatedItem>

          <AnimatedItem animation="fadeInUp" delay={200} className="adn-pillar">
            <article className="adn-pillar-card" aria-labelledby="adn-sante-title">
              <span className="adn-pillar-icon" aria-hidden="true">🌿</span>
              <h2 id="adn-sante-title" className="adn-pillar-title">{t("adn.sante.title")}</h2>
              <p className="adn-pillar-intro">{t("adn.sante.intro")}</p>
              <p className="adn-pillar-body">{t("adn.sante.body")}</p>
              <p className="adn-pillar-tagline">{t("adn.sante.tagline")}</p>
            </article>
          </AnimatedItem>
        </div>

        <section className="adn-resume" aria-labelledby="adn-resume-title">
          <AnimatedItem animation="fadeInUp" delay={100}>
            <h2 id="adn-resume-title" className="adn-resume-title">{t("adn.resume.title")}</h2>
            <p className="adn-resume-body">{t("adn.resume.body")}</p>
          </AnimatedItem>
        </section>
      </AnimatedSection>
    </main>
  );
};
