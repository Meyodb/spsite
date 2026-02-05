import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./Contact.css";
import { AnimatedSection, AnimatedItem } from "../components/AnimatedSection";

export const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    sujet: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    entreprise: "",
    fonction: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sujet) {
      newErrors.sujet = t("contact.errors.subject");
    }

    if (!formData.nom.trim()) {
      newErrors.nom = t("contact.errors.lastName");
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = t("contact.errors.firstName");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("contact.errors.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("contact.errors.emailInvalid");
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = t("contact.errors.phone");
    }

    if (formData.sujet === "pro" && !formData.entreprise.trim()) {
      newErrors.entreprise = t("contact.errors.company");
    }

    if (formData.sujet === "pro" && !formData.fonction.trim()) {
      newErrors.fonction = t("contact.errors.function");
    }

    if (!formData.message.trim()) {
      newErrors.message = t("contact.errors.messageRequired");
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t("contact.errors.messageMin");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Ici vous pouvez ajouter l'appel API pour envoyer le formulaire
      // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });
      
      // Simulation d'envoi
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitSuccess(true);
      setFormData({
        sujet: "",
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        entreprise: "",
        fonction: "",
        message: "",
      });

      // Réinitialiser le message de succès après 5 secondes
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Contact submit error:", error);
      alert(t("common.errorRetry"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="contact-page">
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
            <div className="contact-form-wrapper">
              <form onSubmit={handleSubmit} className="contact-form">
                <AnimatedItem>
                  <div className="form-group">
                    <label htmlFor="sujet" className="form-label">
                      Sujet de votre demande <span className="required">*</span>
                    </label>
                    <select
                      id="sujet"
                      name="sujet"
                      value={formData.sujet}
                      onChange={handleChange}
                      className={`form-select ${errors.sujet ? "error" : ""}`}
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="pro">Contact Professionnel</option>
                      <option value="recrutement">Recrutement</option>
                      <option value="autre">Autre demande</option>
                    </select>
                    {errors.sujet && (
                      <span className="error-message">{errors.sujet}</span>
                    )}
                  </div>
                </AnimatedItem>

                <div className="form-row">
                  <AnimatedItem>
                    <div className="form-group">
                      <label htmlFor="nom" className="form-label">
                        {t("contact.lastName")} <span className="required">{t("common.required")}</span>
                      </label>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        className={`form-input ${errors.nom ? "error" : ""}`}
                        placeholder="Votre nom"
                      />
                      {errors.nom && (
                        <span className="error-message">{errors.nom}</span>
                      )}
                    </div>
                  </AnimatedItem>

                  <AnimatedItem>
                    <div className="form-group">
                      <label htmlFor="prenom" className="form-label">
                        {t("contact.firstName")} <span className="required">{t("common.required")}</span>
                      </label>
                      <input
                        type="text"
                        id="prenom"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        className={`form-input ${errors.prenom ? "error" : ""}`}
                        placeholder={t("contact.placeholderFirstname")}
                      />
                      {errors.prenom && (
                        <span className="error-message">{errors.prenom}</span>
                      )}
                    </div>
                  </AnimatedItem>
                </div>

                <div className="form-row">
                  <AnimatedItem>
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        {t("contact.email")} <span className="required">{t("common.required")}</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`form-input ${errors.email ? "error" : ""}`}
                        placeholder="votre.email@exemple.com"
                      />
                      {errors.email && (
                        <span className="error-message">{errors.email}</span>
                      )}
                    </div>
                  </AnimatedItem>

                  <AnimatedItem>
                    <div className="form-group">
                      <label htmlFor="telephone" className="form-label">
                        {t("contact.phone")} <span className="required">{t("common.required")}</span>
                      </label>
                      <input
                        type="tel"
                        id="telephone"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        className={`form-input ${errors.telephone ? "error" : ""}`}
                        placeholder="06 12 34 56 78"
                      />
                      {errors.telephone && (
                        <span className="error-message">{errors.telephone}</span>
                      )}
                    </div>
                  </AnimatedItem>
                </div>

                {formData.sujet === "pro" && (
                  <AnimatedItem>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="entreprise" className="form-label">
                          {t("contact.company")} <span className="required">{t("common.required")}</span>
                        </label>
                        <input
                          type="text"
                          id="entreprise"
                          name="entreprise"
                          value={formData.entreprise}
                          onChange={handleChange}
                          className={`form-input ${errors.entreprise ? "error" : ""}`}
                          placeholder="Nom de votre entreprise"
                        />
                        {errors.entreprise && (
                          <span className="error-message">{errors.entreprise}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="fonction" className="form-label">
                          {t("contact.function")} <span className="required">{t("common.required")}</span>
                        </label>
                        <input
                          type="text"
                          id="fonction"
                          name="fonction"
                          value={formData.fonction}
                          onChange={handleChange}
                          className={`form-input ${errors.fonction ? "error" : ""}`}
                          placeholder={t("contact.placeholderFunction")}
                        />
                        {errors.fonction && (
                          <span className="error-message">{errors.fonction}</span>
                        )}
                      </div>
                    </div>
                  </AnimatedItem>
                )}

                <AnimatedItem>
                  <div className="form-group">
                    <label htmlFor="message" className="form-label">
                      Message <span className="required">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={`form-textarea ${errors.message ? "error" : ""}`}
                      placeholder={t("contact.placeholderMessage")}
                      rows="6"
                    ></textarea>
                    {errors.message && (
                      <span className="error-message">{errors.message}</span>
                    )}
                  </div>
                </AnimatedItem>

                <AnimatedItem>
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t("contact.sending") : t("contact.submit")}
                  </button>
                </AnimatedItem>

                {submitSuccess && (
                  <div className="success-message">
                    <p>{t("contact.successTitle")}</p>
                    <p>{t("contact.successSubtitle")}</p>
                  </div>
                )}
              </form>
            </div>

            <div className="contact-info">
              <AnimatedSection>
                <div className="info-card">
                  <h3 className="info-title">Informations de contact</h3>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <a href="mailto:contact@soup-juice.fr" className="info-value">
                      contact@soup-juice.fr
                    </a>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{t("contact.hoursLabel")}</span>
                    <span className="info-value">
                      {t("contact.hours")}
                    </span>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
};
