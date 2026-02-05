import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatedSection, AnimatedItem } from "../components/AnimatedSection";
import videoAccueil from "../assets/videos/Video_accueil.MP4";

export const Home = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      const apiBase = import.meta.env.VITE_API_URL !== undefined
        ? import.meta.env.VITE_API_URL
        : (import.meta.env.DEV ? "http://localhost:4000" : "");
      const response = await fetch(`${apiBase}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNewsletterSubmitted(true);
        setEmail("");
        setTimeout(() => setNewsletterSubmitted(false), 5000);
      } else {
        alert(data.message || t("common.errorRetry"));
      }
    } catch (error) {
      console.error("Newsletter error:", error);
      alert(t("common.errorConnection"));
    }
  };

  return (
    <main>
      <section className="hero-section">
        <video 
          className="hero-video" 
          autoPlay 
          loop 
          muted 
          playsInline 
          preload="auto"
        >
          <source src={videoAccueil} type="video/mp4" />
        </video>
        <div className="hero-content">
          <h1 className="hero-title">{t("home.heroTitle")}</h1>
          <Link to="/produits" className="cta-hero"><span className="cta-hero-text">{t("home.ctaProducts")}</span></Link>
        </div>
      </section>

      <AnimatedSection id="home-stats" animation="fadeInUp" className="home-stats-wrapper">
        <div className="home-stats-container">
          <AnimatedItem animation="fadeInUp" delay={100}>
            <div className="home-stat-item">
              <span className="home-stat-label">{t("home.statSince")}</span>
              <span className="home-stat-value" aria-hidden="true">2001</span>
            </div>
          </AnimatedItem>
          <div className="home-stats-divider" aria-hidden="true" />
          <AnimatedItem animation="fadeInUp" delay={200}>
            <div className="home-stat-item">
              <span className="home-stat-value" aria-hidden="true">9</span>
              <span className="home-stat-label">{t("home.statRestaurants")}</span>
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <AnimatedSection id="sections-duo" animation="fadeInUp" className="sections-duo-wrapper">
        <div className="sections-duo-container">
          <div className="newsletter-container">
            <div className="newsletter-card">
              <AnimatedItem animation="fadeInUp" delay={100}>
                <h2 className="newsletter-title">{t("home.newsletterTitle")}</h2>
              </AnimatedItem>
              <AnimatedItem animation="fadeInUp" delay={200}>
                <div className="newsletter-separator"></div>
              </AnimatedItem>
              <AnimatedItem animation="fadeInUp" delay={300}>
                <p className="newsletter-subtitle">
                  {t("home.newsletterSubtitle")}
                </p>
              </AnimatedItem>
              <AnimatedItem animation="fadeInUp" delay={400}>
                <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                  <input
                    type="email"
                    className="newsletter-input"
                    placeholder={t("home.newsletterPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="newsletter-btn">
                    {t("home.newsletterSubmit")}
                  </button>
                </form>
              {newsletterSubmitted && (
                <p style={{ color: "var(--green)", marginTop: "12px", fontSize: "14px", fontWeight: "500" }}>
                  ✓ {t("home.newsletterThanks")}
                </p>
              )}
                <p className="newsletter-disclaimer">
                  {t("home.newsletterDisclaimer")}
                </p>
              </AnimatedItem>
            </div>
          </div>

          <div className="join-container">
            <div className="join-card">
              <AnimatedItem animation="fadeInUp" delay={100}>
                <h2 className="join-title">{t("home.joinTitle")}</h2>
              </AnimatedItem>
              <AnimatedItem animation="fadeInUp" delay={200}>
                <div className="join-separator"></div>
              </AnimatedItem>
              <AnimatedItem animation="fadeInUp" delay={300}>
                <p className="join-description">
                  {t("home.joinDescription")}
                </p>
              </AnimatedItem>
              <AnimatedItem animation="fadeInUp" delay={400}>
                <Link to="/contact" className="join-button">
                  {t("home.joinCta")}
                </Link>
              </AnimatedItem>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
};
