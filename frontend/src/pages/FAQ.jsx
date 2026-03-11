import { useState } from "react";
import { Link } from "react-router-dom";
import { PageSEO } from "../components/PageSEO";
import { RESTAURANT_COUNT, RESTAURANT_NAMES_LIST } from "../data/restaurantsData";
import "./FAQ.css";

const FAQ_ITEMS = [
  {
    category: "Nos restaurants",
    questions: [
      {
        q: "Où se trouvent vos restaurants ?",
        a: `Nous avons ${RESTAURANT_COUNT} restaurants à Paris et Neuilly-sur-Seine : ${RESTAURANT_NAMES_LIST}. Retrouvez toutes les adresses et la carte interactive sur notre page Restaurants.`,
        link: "/restaurants",
      },
      {
        q: "Quels sont vos horaires d'ouverture ?",
        a: "Tous nos restaurants sont ouverts du lundi au vendredi, de 9h00 à 15h00. Nous sommes fermés le week-end et les jours fériés.",
      },
      {
        q: "Proposez-vous la livraison ?",
        a: "Oui, notre restaurant de Neuilly-sur-Seine est disponible sur Deliveroo. Pour les autres adresses, rendez-vous directement en boutique.",
      },
    ],
  },
  {
    category: "Notre carte & produits",
    questions: [
      {
        q: "Que proposez-vous à la carte ?",
        a: "Notre carte comprend des jus frais pressés (33cl et 47cl), des soupes maison (33cl et 47cl), des salades, des sandwichs (wraps et bagels), des plats chauds, des milkshakes, des desserts (cakes, pâtisseries, perles de chia) et des boosters santé. Nous proposons aussi des formules menu dès 13,50€.",
        link: "/produits",
      },
      {
        q: "Vos jus sont-ils vraiment frais ?",
        a: "Absolument ! Chaque jus est préparé minute sous vos yeux, directement dans nos restaurants, à partir de fruits et légumes frais soigneusement sélectionnés. Aucun conservateur, aucun sucre ajouté, aucun additif — juste le meilleur de la nature, dans votre verre.",
      },
      {
        q: "La carte change-t-elle selon les saisons ?",
        a: "Oui. Nos soupes et plats chauds sont plus nombreux en hiver (jusqu'à 10 recettes), tandis qu'en été nous proposons davantage de salades (jusqu'à 10 variétés) et de gaspachos. Certains produits peuvent varier selon les arrivages.",
      },
      {
        q: "Proposez-vous des formules menu ?",
        a: "Oui, nous proposons 3 formules : Menu Sandwich (13,50€), Menu Salade (14€) et Menu Plat Chaud (14,50€). Chaque formule inclut un plat principal + une soupe ou un jus.",
      },
    ],
  },
  {
    category: "Allergènes & régimes alimentaires",
    questions: [
      {
        q: "Comment consulter les allergènes de vos produits ?",
        a: "La liste complète des allergènes est disponible sur notre page Allergènes, avec un tableau détaillé produit par produit pour les 14 allergènes réglementaires. Vous pouvez aussi la télécharger en PDF.",
        link: "/allergenes",
      },
      {
        q: "Avez-vous des options végétariennes ou vegan ?",
        a: "Oui, une grande partie de nos soupes sont végétariennes voire vegan. Nous proposons aussi des plats chauds vegan (lasagne vegan, duo de riz aubergines falafel), des wraps végétariens (wrap feta, wrap houmous falafel) et des desserts sans produits laitiers (perles de chia framboise).",
      },
      {
        q: "Vos produits contiennent-ils du gluten ?",
        a: "Certains produits contiennent du gluten (soupes, sandwichs, pâtisseries). Cependant, nos jus frais, plusieurs soupes et certaines salades en sont exempts. Consultez notre tableau allergènes pour le détail par produit. Attention : tous nos plats sont préparés dans nos laboratoires et peuvent contenir des traces.",
      },
      {
        q: "Proposez-vous des produits sans lactose ?",
        a: "Oui, de nombreux jus, soupes et plats sont sans produits laitiers. Par exemple : gaspacho de tomates, gaspacho de carottes, tomate au basilic, haricot rouge à la mexicaine, ou encore les perles de chia framboise. Vérifiez le tableau allergènes pour chaque produit.",
      },
    ],
  },
  {
    category: "Catering & événements",
    questions: [
      {
        q: "Proposez-vous un service traiteur ?",
        a: "Oui, Soup & Juice propose un service de catering pour vos événements d'entreprise, séminaires, réceptions et cocktails. Nous préparons des plateaux de jus frais, soupes, mini-salades et finger food sur mesure.",
        link: "/catering",
      },
      {
        q: "Comment passer commande pour un événement ?",
        a: "Contactez-nous via notre formulaire de contact en sélectionnant le sujet \"Professionnel\", directement en magasin ou par email à contact@soup-juice.com. Précisez la date, le nombre de personnes et le type d'événement. Nous vous recontacterons sous 24h avec un devis personnalisé.",
        link: "/contact",
      },
      {
        q: "Quel est le délai minimum pour une commande traiteur ?",
        a: "Nous recommandons de nous contacter au minimum 48 à 72 heures avant votre événement pour les petites commandes, et au moins une semaine à l'avance pour les événements de plus de 50 personnes.",
      },
    ],
  },
  {
    category: "Recrutement & rejoindre l'équipe",
    questions: [
      {
        q: "Recrutez-vous en ce moment ?",
        a: "Nous sommes toujours ouverts aux candidatures spontanées ! Nous recherchons régulièrement des équipiers polyvalents, des responsables de boutique et des alternants.",
      },
      {
        q: "Comment postuler chez Soup & Juice ?",
        a: "Envoyez votre candidature via notre formulaire de contact en sélectionnant le sujet \"Recrutement\". Indiquez le poste souhaité, votre disponibilité et la boutique qui vous intéresse. Vous pouvez aussi vous présenter directement en boutique.",
        link: "/contact",
      },
    ],
  },
  {
    category: "Engagements & valeurs",
    questions: [
      {
        q: "D'où viennent vos ingrédients ?",
        a: "Nous privilégions les circuits courts et les fournisseurs locaux. Nos fruits et légumes sont sélectionnés pour leur fraîcheur et leur qualité, en favorisant les producteurs français quand la saison le permet.",
      },
      {
        q: "Quels sont vos engagements environnementaux ?",
        a: "Nous travaillons sur la réduction de nos emballages, l'utilisation de contenants recyclables et la lutte contre le gaspillage alimentaire. Nos recettes sont conçues pour limiter les pertes.",
        link: "/adn",
      },
      {
        q: "Que signifient vos 3 piliers : Forme, Régime, Santé ?",
        a: "Ce sont les 3 axes de notre philosophie nutritionnelle. Forme : des recettes énergétiques pour le quotidien. Régime : des options légères et équilibrées. Santé : des ingrédients aux bienfaits reconnus (antioxydants, vitamines, fibres).",
        link: "/nos-piliers",
      },
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.flatMap((cat) =>
    cat.questions.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    }))
  ),
};

function FAQItem({ q, a, link, isOpen, onToggle }) {
  return (
    <div className={`faq-item ${isOpen ? "faq-item--open" : ""}`}>
      <button
        type="button"
        className="faq-question"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>{q}</span>
        <svg
          className="faq-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div className="faq-answer" aria-hidden={!isOpen}>
        <p>{a}</p>
        {link && (
          <Link to={link} className="faq-link">
            En savoir plus →
          </Link>
        )}
      </div>
    </div>
  );
}

export const FAQ = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (key) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="faq-page">
      <PageSEO
        title="Questions fréquentes (FAQ)"
        description="Retrouvez les réponses aux questions les plus posées sur Soup & Juice : restaurants, carte, allergènes, livraison, catering, recrutement et engagements."
        path="/faq"
        jsonLd={faqJsonLd}
      />
      <section className="faq-hero">
        <div className="faq-hero-content">
          <h1 className="faq-title">Questions fréquentes</h1>
          <p className="faq-subtitle">
            Tout ce que vous devez savoir sur Soup & Juice
          </p>
        </div>
      </section>

      <div className="faq-container">
        {FAQ_ITEMS.map((cat, catIndex) => (
          <section key={catIndex} className="faq-category">
            <h2 className="faq-category-title">{cat.category}</h2>
            <div className="faq-list">
              {cat.questions.map((item, qIndex) => {
                const key = `${catIndex}-${qIndex}`;
                return (
                  <FAQItem
                    key={key}
                    q={item.q}
                    a={item.a}
                    link={item.link}
                    isOpen={!!openItems[key]}
                    onToggle={() => toggleItem(key)}
                  />
                );
              })}
            </div>
          </section>
        ))}

        <section className="faq-contact-cta">
          <h2>Vous n'avez pas trouvé votre réponse ?</h2>
          <p>Notre équipe est là pour vous aider.</p>
          <Link to="/contact" className="faq-contact-btn">
            Nous contacter
          </Link>
        </section>
      </div>
    </main>
  );
};
