import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CodeProtection } from "../components/CodeProtection";
import { PageSEO } from "../components/PageSEO";
import { FormationCommonActions } from "../components/FormationCommonActions";
import { useFocusTrap } from "../hooks/useFocusTrap";
import "./Formation.css";

const SECTION_I18N = { "service-client": "serviceClient", "mise-en-place": "miseEnPlace" };
const CARD_I18N = {
  "soup-juice": "soupJuice",
  menus: "menus",
  "phrases-utiles": "phrasesUtiles",
  boosters: "boosters",
  "video-client": "serviceClient",
  "video-recettes": "recettes",
  "video-mep": "miseEnPlace",
  "jus-du-jour": "jusDuJour",
  "salade-de-fruits": "saladeDeFruits",
  "recettes-boosters": "recettesBoosters",
  "fromage-blanc-coulis": "fromageBlancCoulis",
  "emballage-cakes-cookies": "emballageCakesCookies",
  "soupe-japonaise": "soupeJaponaise",
  "produits-entretien": "produitsEntretien",
  "reception-marchandises": "receptionMarchandises",
  "chaine-du-froid": "chaineDuFroid"
};

/** soup-juice → soupJuice (clés i18n formation.cardSubtitles.*) */
const kebabToCamel = (id) => id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;

  const shortMatch = url.match(/youtu\.be\/([^?&/]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  const longMatch = url.match(/[?&]v=([^?&/]+)/);
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;

  const embedMatch = url.match(/youtube\.com\/embed\/([^?&/]+)/);
  if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`;

  return null;
};

// Données des sections (à partager avec Formation.jsx)
// eslint-disable-next-line react-refresh/only-export-components
export const FORMATION_SECTIONS = [
  {
    id: "presentation",
    title: "Présentation",
    description: "Vidéos de présentation de l'entreprise et de ses valeurs",
    bgColor: "#82907B",
    imageUrl: "/images/formation/presentation.png",
    cards: [
      {
        id: "soup-juice",
        title: "S&J",
        bgColor: "#d4d4d4",
        imageUrl: "/images/formation/presentation/soup-juice.png",
        videoUrl: "/videos/formation/presentation/sj-presentation.mp4"
      },
      {
        id: "menus",
        title: "Menus",
        bgColor: "#f5f5f5",
        imageUrl: "/images/formation/presentation/menus.png",
        videoUrl: "/videos/formation/presentation/menu-presentation.mp4"
      },
      {
        id: "phrases-utiles",
        title: "Phrases Utiles",
        bgColor: "#ffffff",
        imageUrl: "/images/formation/presentation/phrases-utiles.png",
        videoUrl: "/videos/formation/presentation/phrase-utile-presentation.mp4"
      },
      {
        id: "boosters",
        title: "Les Boosters",
        bgColor: "#e8ede6",
        imageUrl: "/images/formation/presentation/boosters.png",
        videoUrl: "/videos/formation/presentation/booster-presentation.mp4"
      }
    ]
  },
  {
    id: "caisse",
    title: "La Caisse",
    description: "Formation sur l'utilisation du système de point de vente",
    bgColor: "#e8ede6",
    imageUrl: "/images/formation/caisse.png",
    cards: [
      {
        id: "caisse-presentation",
        title: "Présentation",
        bgColor: "#f4f7f2",
        imageUrl: "/images/formation/caisse.png",
        videoUrl: "/videos/formation/caisse/caisse-presentation.mp4"
      },
      {
        id: "caisse-menus",
        title: "Nos Menus",
        bgColor: "#f0f4ee",
        imageUrl: "/images/formation/presentation/menus.png",
        videoUrl: "/videos/formation/caisse/caisse-menus.mp4"
      },
      {
        id: "caisse-paiements",
        title: "Les paiements",
        bgColor: "#e7ece3",
        imageUrl: "/images/formation/caisse-paiements.png",
        videoUrl: "/videos/formation/caisse/caisse-paiements.mp4"
      }
    ]
  },
  {
    id: "service-client",
    title: "Service Client",
    description: "Techniques et bonnes pratiques pour le service client",
    bgColor: "#9baa8f",
    imageUrl: "/images/formation/service-client.png",
    cards: [
      {
        id: "sacs-sos",
        title: "Sacs SOS",
        bgColor: "#d6e0d0",
        imageUrl: "/images/formation/service-client/sacs-sos.png",
        videoUrl: "/videos/formation/service-client/sacs-sos.mp4"
      },
      {
        id: "sacs-cabas",
        title: "Sacs Cabas",
        bgColor: "#dfe7da",
        imageUrl: "/images/formation/service-client/sacs-cabas.png",
        videoUrl: "/videos/formation/service-client/sacs-cabas.mp4"
      },
      {
        id: "tenue",
        title: "Tenue",
        bgColor: "#d1dacb",
        imageUrl: "/images/formation/service-client/tenue.png",
        videoUrl: "/videos/formation/service-client/tenue.mp4"
      },
      {
        id: "interactions-clients",
        title: "Intéractions clients",
        bgColor: "#dce4d7",
        imageUrl: "/images/formation/service-client/interactions-clients.png",
        videoUrl: "/videos/formation/service-client/interactions-clients.mp4"
      },
      {
        id: "questions-produits",
        title: "Questions sur les produits",
        bgColor: "#e5ebdf",
        imageUrl: "/images/formation/service-client/questions-produits.png",
        videoUrl: "/videos/formation/service-client/questions-produits.mp4"
      },
      {
        id: "carte-fidelite",
        title: "Carte de fidélité",
        bgColor: "#d7e1d1",
        imageUrl: "/images/formation/service-client/carte-fidelite.png",
        videoUrl: "/videos/formation/service-client/carte-fidelite.mp4"
      },
      {
        id: "goodies",
        title: "Goodies",
        bgColor: "#e2e8dd",
        imageUrl: "/images/formation/service-client/goodies.png",
        videoUrl: ""
      }
    ]
  },
  {
    id: "recettes",
    title: "Préparations/Recettes",
    description: "Vidéos explicatives pour la préparation des produits",
    bgColor: "#f5f5f5",
    imageUrl: "/images/formation/recettes/preparation-recettes.png",
    cards: [
      {
        id: "jus-du-jour",
        title: "Jus du Jour",
        bgColor: "#fef3e2",
        imageUrl: "/images/formation/recettes/jus-du-jour.png",
        videoUrl: "/videos/formation/recettes/jus-du-jour.mp4"
      },
      {
        id: "salade-de-fruits",
        title: "Salade de Fruits",
        bgColor: "#f5e6f0",
        imageUrl: "/images/formation/recettes/salade-de-fruits.png",
        videoUrl: "/videos/formation/recettes/salade-de-fruits.mp4"
      },
      {
        id: "recettes-boosters",
        title: "Boosters",
        bgColor: "#e8f5e9",
        imageUrl: "/images/formation/recettes/recettes-boosters.png",
        videoUrl: "/videos/formation/recettes/boosters.mp4"
      },
      {
        id: "fromage-blanc-coulis",
        title: "Fromage Blanc et Coulis",
        bgColor: "#fff8e1",
        imageUrl: "/images/formation/recettes/fromage-blanc-coulis.png",
        videoUrl: "/videos/formation/recettes/fromage-blanc-coulis.mp4"
      },
      {
        id: "emballage-cakes-cookies",
        title: "Emballage Cakes et Cookies",
        bgColor: "#fbe9e7",
        imageUrl: "/images/formation/recettes/emballage-cakes-cookies.png",
        videoUrl: "/videos/formation/recettes/emballage-cakes-cookies.mp4"
      },
      {
        id: "soupe-japonaise",
        title: "Soupe Japonaise",
        bgColor: "#e3f2fd",
        imageUrl: "/images/formation/recettes/soupe-japonaise.png",
        videoUrl: "/videos/formation/recettes/soupe-japonaise.mp4"
      }
    ]
  },
  {
    id: "mise-en-place",
    title: "Mise En Place",
    description: "Organisation et préparation de l'espace de travail",
    bgColor: "#d4d4d4",
    imageUrl: "/images/formation/mise-en-place.png",
    cards: [
      {
        id: "mise-en-rayon",
        title: "Mise en rayon",
        bgColor: "#e8e0cc",
        imageUrl: "/images/formation/mise-en-place/mise-en-rayon.png",
        videoUrl: "/videos/formation/mise-en-place/mise-en-rayon.mp4"
      },
      {
        id: "nettoyage-de-la-salle",
        title: "Nettoyage de la salle",
        bgColor: "#dbe7f2",
        imageUrl: "/images/formation/mise-en-place/nettoyage-de-la-salle.png",
        videoUrl: "/videos/formation/mise-en-place/nettoyage-de-la-salle.mp4"
      },
      {
        id: "paniers-de-fruits",
        title: "Paniers de fruits",
        bgColor: "#f4e7d2",
        imageUrl: "/images/formation/mise-en-place/paniers-de-fruits.png",
        videoUrl: "/videos/formation/mise-en-place/nettoyage-de-la-salle.mp4"
      },
      {
        id: "verifications-des-packagings",
        title: "Vérifications des Packagings",
        bgColor: "#e9e9e9",
        imageUrl: "/images/formation/mise-en-place/verifications-des-packagings.png",
        videoUrl: "/videos/formation/mise-en-place/verifications-des-packagings.mp4"
      }
    ]
  },
  {
    id: "logistique",
    title: "Logistique",
    description: "Gestion des stocks et de la logistique",
    bgColor: "#5a6654",
    imageUrl: "/images/formation/logistique/bandeau-logistique.jpg",
    cards: [
      {
        id: "produits-entretien",
        title: "Produits d'entretien",
        bgColor: "#e8ebe6",
        imageUrl: "/images/formation/logistique/produits-entretien.png",
        videoUrl: "/videos/formation/logistique/produits-entretien.mp4"
      },
      {
        id: "reception-marchandises",
        title: "Réception des marchandises",
        bgColor: "#eef0ed",
        imageUrl: "/images/formation/logistique/reception-marchandises.png",
        videoUrl: "/videos/formation/logistique/reception-marchandises.mp4"
      },
      {
        id: "chaine-du-froid",
        title: "Chaîne du froid",
        bgColor: "#dfe3dc",
        imageUrl: "/images/formation/logistique/chaine-du-froid.png",
        videoUrl: "/videos/formation/logistique/chaine-du-froid.mp4"
      }
    ]
  }
];

export const FormationSection = () => {
  const { t } = useTranslation();
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [playingVideo, setPlayingVideo] = useState(null);
  const [infoMessage, setInfoMessage] = useState("");
  const modalRef = useRef(null);

  useFocusTrap(modalRef, { active: Boolean(playingVideo) });

  const section = FORMATION_SECTIONS.find(s => s.id === sectionId);
  const sectionTitleKey = SECTION_I18N[sectionId] || sectionId;
  const sectionTitle = section ? t(`formation.sections.${sectionTitleKey}`) : "";

  if (!section) {
    return (
      <CodeProtection>
        <main className="formation-page">
          <div className="formation-container">
            <p>{t("formation.sectionNotFound")}</p>
            <button
              type="button"
              className="formation-back-button"
              onClick={() => navigate("/formation")}
            >
              <span className="formation-back-button-arrow" aria-hidden="true">←</span>
              <span className="formation-back-button-label">{t("formation.backButtonLabel")}</span>
            </button>
          </div>
        </main>
      </CodeProtection>
    );
  }

  const handleCardClick = (card) => {
    if (card.videoUrl) {
      const cardTitleKey = CARD_I18N[card.id];
      const cardTitle = cardTitleKey ? t(`formation.sections.${cardTitleKey}`) : card.title;
      setPlayingVideo({
        url: card.videoUrl,
        title: cardTitle,
        section: sectionTitle,
        embedUrl: getYoutubeEmbedUrl(card.videoUrl)
      });
      setInfoMessage("");
    } else {
      const cardTitleKey = CARD_I18N[card.id];
      const cardTitle = cardTitleKey ? t(`formation.sections.${cardTitleKey}`) : card.title;
      setInfoMessage(t("formation.videoSoon", { title: cardTitle }));
    }
  };

  const closeVideo = () => {
    setPlayingVideo(null);
  };

  return (
    <CodeProtection>
      <PageSEO
        title={sectionTitle}
        description="Espace de formation réservé au personnel S&J."
        path={`/formation/${sectionId}`}
        noindex
      />
      <main className="formation-section-page">
        <div className="formation-section-container">
          <div className="formation-section-header">
            <button
              type="button"
              className="formation-back-button"
              onClick={() => navigate("/formation")}
            >
              <span className="formation-back-button-arrow" aria-hidden="true">←</span>
              <span className="formation-back-button-label">{t("formation.backButtonLabel")}</span>
            </button>
            <h1 className="formation-section-title">{sectionTitle.toUpperCase()}</h1>
          </div>

          {infoMessage && (
            <div className="formation-info-banner" role="status">
              {infoMessage}
            </div>
          )}

          {section.cards && section.cards.length > 0 ? (
            <div className="subsection-cards-grid">
              {section.cards.map((card) => (
                <div
                  key={card.id}
                  className="subsection-card"
                  onClick={() => handleCardClick(card)}
                  style={{
                    backgroundColor: card.bgColor,
                    backgroundImage: card.imageUrl ? `url(${card.imageUrl})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                >
                  <div className="subsection-card-overlay">
                    <h3 className="subsection-card-title">
                      {CARD_I18N[card.id] ? t(`formation.sections.${CARD_I18N[card.id]}`) : card.title}
                    </h3>
                    <p className="subsection-card-subtitle">
                      {t(`formation.cardSubtitles.${kebabToCamel(card.id)}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-cards">
              <p>{t("formation.noCards")}</p>
            </div>
          )}

          <FormationCommonActions />

          {/* Modal pour la vidéo */}
          {playingVideo && (
            <div className="video-modal" onClick={closeVideo}>
              <div
                className="video-modal-content"
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-label={playingVideo.title}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="video-modal-close" onClick={closeVideo}>
                  ×
                </button>
                <h3 className="video-modal-title">{playingVideo.title}</h3>
                {playingVideo.section && (
                  <p className="video-modal-section">{playingVideo.section}</p>
                )}
                <div className="video-modal-player">
                  {playingVideo.embedUrl ? (
                    <iframe
                      src={playingVideo.embedUrl}
                      title={playingVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <video controls autoPlay>
                      <source src={playingVideo.url} type="video/mp4" />
                      {t("formation.videoUnsupported")}
                    </video>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </CodeProtection>
  );
};
