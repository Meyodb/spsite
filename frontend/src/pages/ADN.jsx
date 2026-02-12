import { useTranslation } from "react-i18next";
import { AnimatedSection, AnimatedItem } from "../components/AnimatedSection";
import qualiteImage from "../assets/images/photo menu/Photoroom_20250704_124732.JPG";
import logoSoupJuice from "../assets/images/logo vert.png";

export const ADN = () => {
  const { t } = useTranslation();

  return (
    <main className="adn-page">
      <AnimatedSection id="adn" animation="fadeInUp" className="adn-section">
        {/* Hero Section */}
        <section className="adn-hero" aria-label={t("adn.ariaHero")}>
          <div className="adn-hero-content">
            <AnimatedItem animation="fadeInUp" delay={100}>
              <h1 className="adn-hero-title">{t("adn.heroTitle")}</h1>
            </AnimatedItem>
            <AnimatedItem animation="fadeInUp" delay={200}>
              <p className="adn-hero-subtitle">{t("adn.heroSubtitle")}</p>
            </AnimatedItem>
          </div>
        </section>

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

        {/* Section Les 3 piliers : FORME, RÉGIME, SANTÉ */}
        <section className="adn-pillars-section">
          <div className="adn-pillars-container">
            <AnimatedItem animation="fadeInUp" delay={100}>
              <h2 className="adn-pillars-section-title">{t("adn.pillars.title")}</h2>
              <p className="adn-pillars-section-intro">{t("adn.pillars.intro")}</p>
            </AnimatedItem>
            
            <div className="adn-pillars-grid">
              <AnimatedItem animation="fadeInUp" delay={150} className="adn-pillar">
                <article className="adn-pillar-card" aria-labelledby="adn-forme-title">
                  <h3 id="adn-forme-title" className="adn-pillar-title">{t("adn.forme.title")}</h3>
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
                <article className="adn-pillar-card" aria-labelledby="adn-regime-title">
                  <h3 id="adn-regime-title" className="adn-pillar-title">{t("adn.regime.title")}</h3>
                  <p className="adn-pillar-intro">{t("adn.regime.intro")}</p>
                  <p className="adn-pillar-body">{t("adn.regime.body")}</p>
                  <p className="adn-pillar-tagline">{t("adn.regime.tagline")}</p>
                </article>
              </AnimatedItem>

              <AnimatedItem animation="fadeInUp" delay={250} className="adn-pillar">
                <article className="adn-pillar-card" aria-labelledby="adn-sante-title">
                  <h3 id="adn-sante-title" className="adn-pillar-title">{t("adn.sante.title")}</h3>
                  <p className="adn-pillar-intro">{t("adn.sante.intro")}</p>
                  <p className="adn-pillar-body">{t("adn.sante.body")}</p>
                  <p className="adn-pillar-tagline">{t("adn.sante.tagline")}</p>
                </article>
              </AnimatedItem>
            </div>
          </div>
        </section>

        {/* Section Qualité & Savoir-faire */}
        <section className="adn-quality-section">
          <div className="adn-quality-container">
            <AnimatedItem animation="fadeInUp" delay={200} className="adn-quality-image">
              <div className="adn-photo-placeholder">
                <img src={qualiteImage} alt={t("adn.qualite.imageAlt")} className="adn-photo" />
                <div className="adn-photo-placeholder-text">{t("adn.photoPlaceholder")}</div>
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
      </AnimatedSection>
    </main>
  );
};
