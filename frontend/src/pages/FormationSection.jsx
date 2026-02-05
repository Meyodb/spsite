import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CodeProtection } from "../components/CodeProtection";
import "./Formation.css";

const SECTION_I18N = { "service-client": "serviceClient", "mise-en-place": "miseEnPlace" };
const CARD_I18N = { "soup-juice": "soupJuice", "phrases-utiles": "phrasesUtiles" };

// Données des sections (à partager avec Formation.jsx)
export const FORMATION_SECTIONS = [
  {
    id: "presentation",
    title: "Présentation",
    description: "Vidéos de présentation de l'entreprise et de ses valeurs",
    bgColor: "#82907B",
    cards: [
      {
        id: "soup-juice",
        title: "Soup & Juice",
        bgColor: "#d4d4d4",
        videoUrl: null // Ajoutez l'URL de la vidéo ici
      },
      {
        id: "menus",
        title: "Menus",
        bgColor: "#f5f5f5",
        videoUrl: null
      },
      {
        id: "phrases-utiles",
        title: "Phrases Utiles",
        bgColor: "#ffffff",
        videoUrl: null
      },
      {
        id: "boosters",
        title: "Les Boosters",
        bgColor: "#e8ede6",
        videoUrl: null
      }
    ]
  },
  {
    id: "caisse",
    title: "La Caisse",
    description: "Formation sur l'utilisation du système de point de vente",
    bgColor: "#e8ede6",
    cards: []
  },
  {
    id: "service-client",
    title: "Service Client",
    description: "Techniques et bonnes pratiques pour le service client",
    bgColor: "#9baa8f",
    cards: []
  },
  {
    id: "recettes",
    title: "Préparations/Recettes",
    description: "Vidéos explicatives pour la préparation des produits",
    bgColor: "#f5f5f5",
    cards: []
  },
  {
    id: "mise-en-place",
    title: "Mise En Place",
    description: "Organisation et préparation de l'espace de travail",
    bgColor: "#d4d4d4",
    cards: []
  },
  {
    id: "logistique",
    title: "Logistique",
    description: "Gestion des stocks et de la logistique",
    bgColor: "#5a6654",
    cards: []
  }
];

export const FormationSection = () => {
  const { t } = useTranslation();
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [playingVideo, setPlayingVideo] = useState(null);

  const section = FORMATION_SECTIONS.find(s => s.id === sectionId);
  const sectionTitleKey = SECTION_I18N[sectionId] || sectionId;
  const sectionTitle = section ? t(`formation.sections.${sectionTitleKey}`) : "";

  if (!section) {
    return (
      <CodeProtection>
        <main className="formation-page">
          <div className="formation-container">
            <p>{t("formation.sectionNotFound")}</p>
            <button onClick={() => navigate("/formation")}>{t("common.back")}</button>
          </div>
        </main>
      </CodeProtection>
    );
  }

  const handleCardClick = (card) => {
    if (card.videoUrl) {
      const cardTitleKey = CARD_I18N[card.id] || card.id;
      const cardTitle = t(`formation.sections.${cardTitleKey}`);
      setPlayingVideo({
        url: card.videoUrl,
        title: cardTitle,
        section: sectionTitle
      });
    } else {
      const cardTitleKey = CARD_I18N[card.id] || card.id;
      const cardTitle = t(`formation.sections.${cardTitleKey}`);
      alert(t("formation.videoSoon", { title: cardTitle }));
    }
  };

  const closeVideo = () => {
    setPlayingVideo(null);
  };

  return (
    <CodeProtection>
      <main className="formation-section-page">
        <div className="formation-section-container">
          <div className="formation-section-header">
            <button 
              className="formation-back-button"
              onClick={() => navigate("/formation")}
            >
              ← Retour
            </button>
            <h1 className="formation-section-title">{section.title.toUpperCase()}</h1>
          </div>

          {section.cards && section.cards.length > 0 ? (
            <div className="subsection-cards-grid">
              {section.cards.map((card) => (
                <div
                  key={card.id}
                  className="subsection-card"
                  onClick={() => handleCardClick(card)}
                  style={{ backgroundColor: card.bgColor }}
                >
                  <div className="subsection-card-overlay">
                    <h3 className="subsection-card-title">{t(`formation.sections.${CARD_I18N[card.id] || card.id}`)}</h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-cards">
              <p>Les cartes pour cette section seront ajoutées prochainement.</p>
            </div>
          )}

          {/* Modal pour la vidéo */}
          {playingVideo && (
            <div className="video-modal" onClick={closeVideo}>
              <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="video-modal-close" onClick={closeVideo}>
                  ×
                </button>
                <h3 className="video-modal-title">{playingVideo.title}</h3>
                {playingVideo.section && (
                  <p className="video-modal-section">{playingVideo.section}</p>
                )}
                <div className="video-modal-player">
                  <video controls autoPlay>
                    <source src={playingVideo.url} type="video/mp4" />
                    {t("formation.videoUnsupported")}
                  </video>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </CodeProtection>
  );
};
