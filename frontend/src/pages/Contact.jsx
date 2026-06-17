import { useTranslation } from "react-i18next";
import "./Contact.css";
import { AnimatedSection, AnimatedItem } from "../components/AnimatedSection";
import { PageSEO } from "../components/PageSEO";
import contactLifestyle from "../assets/images/contact-lifestyle.jpg";

const INSTAGRAM_URL = "https://www.instagram.com/soupjuiceparis/?hl=fr";

export const Contact = () => {
  const { t } = useTranslation();
  const siteUrl = "https://www.soup-juice.net";
  const restaurantEntityId = `${siteUrl}/#restaurant`;
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "LocalBusiness"],
    "@id": restaurantEntityId,
    name: "S&J",
    url: `${siteUrl}/contact`,
    image: `${siteUrl}/og-default.jpg`,
    logo: `${siteUrl}/og-default.jpg`,
    email: "contact@soup-juice.com",
    sameAs: ["https://www.instagram.com/soupjuiceparis/"],
    menu: `${siteUrl}/produits`,
    servesCuisine: ["Soupes", "Jus frais", "Healthy", "Salades"],
    priceRange: "€",
    address: {
      "@type": "PostalAddress",
      streetAddress: "54 Avenue Kléber",
      postalCode: "75016",
      addressLocality: "Paris",
      addressCountry: "FR",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "contact@soup-juice.com",
      availableLanguage: ["fr", "en"],
    },
  };

  return (
    <main className="contact-page">
      <PageSEO
        title="Contact"
        description="Contactez S&J : recrutement, partenariats, catering ou question sur nos produits. Réponse rapide garantie."
        path="/contact"
        jsonLd={localBusinessJsonLd}
      />
      <section className="contact-hero">
        <div className="contact-hero-content">
          <AnimatedItem>
            <h1 className="contact-title">{t("contact.title")}</h1>
          </AnimatedItem>
          <AnimatedItem delay={200}>
            <p className="contact-subtitle">
              {t("contact.subtitle")}
            </p>
          </AnimatedItem>
        </div>
      </section>

      <div className="content-section contact-section">
        <AnimatedSection>
          <div className="contact-container">
            <AnimatedItem className="contact-visual-wrap">
              <figure className="contact-visual">
                <img
                  src={contactLifestyle}
                  alt={t("contact.imageAlt")}
                  className="contact-visual-img"
                  loading="lazy"
                  decoding="async"
                  width="388"
                  height="481"
                />
                <div className="contact-visual-overlay" />
              </figure>
            </AnimatedItem>
            <AnimatedItem delay={150}>
              <article
                className="info-card info-card--featured"
                aria-labelledby="contact-info-heading"
              >
                <h2 id="contact-info-heading" className="info-title info-title--featured">
                  {t("contact.infoTitle")}
                </h2>
                <div className="info-item">
                  <span className="info-label">{t("contact.email")}</span>
                  <a href="mailto:contact@soup-juice.com" className="info-value info-value--cta">
                    contact@soup-juice.com
                  </a>
                </div>
                <div className="info-item">
                  <span className="info-label">{t("footer.recruitment")}</span>
                  <a href="mailto:recrutement@soup-juice.com" className="info-value info-value--cta">
                    recrutement@soup-juice.com
                  </a>
                </div>
                <div className="info-item">
                  <span className="info-label">{t("contact.instagramLabel")}</span>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-value info-value--cta"
                  >
                    @soupjuiceparis
                  </a>
                </div>
                <div className="info-item">
                  <span className="info-label">{t("contact.hoursLabel")}</span>
                  <span className="info-value">
                    {t("contact.hours")}
                  </span>
                </div>
              </article>
            </AnimatedItem>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
};
