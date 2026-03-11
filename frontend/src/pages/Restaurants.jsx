import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { PageSEO } from "../components/PageSEO";
import { Map, Marker, Popup } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import "./Restaurants.css";
import deliveroLogo from "../assets/images/delivero.svg";
import logoVert from "../assets/images/logo-vert.png";
import metroLogo from "../assets/images/metro-logo.png";
import photoEcuries from "../assets/images/restaurants/photo_Ecuries.png";
import photoEcuries2 from "../assets/images/restaurants/photo_Ecuries_2.png";
import photoMadeleine from "../assets/images/restaurants/photo_madeleine.png";
import photoLondre from "../assets/images/restaurants/photo_londre.jpg";
import photoNeuilly from "../assets/images/restaurants/photo_neuilly.jpg";
import photoHonore from "../assets/images/restaurants/photo_honore.png";
import photoKleber from "../assets/images/restaurants/photo_kleber.png";
import photoKleber2 from "../assets/images/restaurants/photo_kleber_2.png";
import photoEtoile from "../assets/images/restaurants/photo_etoile.png";
import photoHaussmann from "../assets/images/restaurants/photo_haussmann.png";
import photoBourse from "../assets/images/restaurants/photo_bourse.png";
import photoOpera from "../assets/images/restaurants/photo_opera.png";
import iconMonumentEiffel from "../assets/images/monuments/paris-eiffel.svg";
import iconMonumentArcTriomphe from "../assets/images/monuments/paris-arc-de-triomphe.svg";
import iconMonumentNotreDame from "../assets/images/monuments/paris-notre-dame.svg";
import iconMonumentLouvre from "../assets/images/monuments/paris-louvre.svg";
import iconMonumentPompidou from "../assets/images/monuments/paris-pompidou.svg";
import { metroStationsParis } from "../data/metroStationsParis";
import { RATP_LINE_COLORS } from "../data/ratpLineColors";
import { monumentsParis } from "../data/monumentsParis";
import { RESTAURANTS, RESTAURANT_COUNT } from "../data/restaurantsData";

const monumentIcons = {
  eiffel: iconMonumentEiffel,
  "arc-triomphe": iconMonumentArcTriomphe,
  "notre-dame": iconMonumentNotreDame,
  louvre: iconMonumentLouvre,
  pompidou: iconMonumentPompidou,
};

const METRO_VISIBLE_ZOOM = 14;   // logos métro visibles à partir de ce zoom
const MONUMENT_VISIBLE_ZOOM = 13; // monuments visibles à partir de ce zoom (un peu moins loin que 12)

// Photos des restaurants (fallback: logo)
// Tableau pour permettre plusieurs photos par restaurant.
const restaurantPhotos = {
  1: [photoLondre],                    // ST LAZARE - Rue de Londres
  2: [photoBourse],                    // BOURSE
  3: [photoHaussmann],                 // HAUSSMANN
  4: [photoEcuries2, photoEcuries],    // ÉCURIES
  5: [photoEtoile, photoKleber2],      // ÉTOILE - Avenue Kléber (boutique Keleber)
  6: [photoOpera],                     // OPÉRA
  7: [photoNeuilly],                   // NEUILLY
  8: [photoHonore],                    // HONORÉ - Saint Honoré
  9: [photoMadeleine],                 // MADELEINE
};

const CLOSE_DURATION_MS = 280;

/** Lightbox plein écran pour les photos de restaurant */
const RestaurantPhotoLightbox = ({ open, photos, initialIndex, onClose }) => {
  const [index, setIndex] = useState(initialIndex);
  const [isClosing, setIsClosing] = useState(false);
  const handleCloseRef = useRef(() => {});

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  const handleClose = useCallback(() => {
    setIsClosing((prev) => (prev ? prev : true));
  }, []);
  handleCloseRef.current = handleClose;

  useEffect(() => {
    if (!open) return;
    const onEscape = (e) => { if (e.key === "Escape") handleCloseRef.current(); };
    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!isClosing) return;
    const t = setTimeout(() => { onClose(); setIsClosing(false); }, CLOSE_DURATION_MS);
    return () => clearTimeout(t);
  }, [isClosing, onClose]);

  const goPrev = (e) => {
    e.stopPropagation();
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  };
  const goNext = (e) => {
    e.stopPropagation();
    setIndex((i) => (i + 1) % photos.length);
  };

  if (!open || !photos?.length) return null;

  return (
    <div
      className={`restaurant-photo-lightbox ${isClosing ? "restaurant-photo-lightbox--closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Photo du restaurant en plein écran"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <button
        type="button"
        className="restaurant-photo-lightbox-close"
        onClick={handleClose}
        aria-label="Fermer"
      >
        ×
      </button>
      <div className="restaurant-photo-lightbox-content" onClick={(e) => e.stopPropagation()}>
        {photos.length > 1 && (
          <>
            <button
              type="button"
              className="restaurant-photo-lightbox-arrow restaurant-photo-lightbox-arrow--prev"
              onClick={goPrev}
              aria-label="Photo précédente"
            >
              ‹
            </button>
            <button
              type="button"
              className="restaurant-photo-lightbox-arrow restaurant-photo-lightbox-arrow--next"
              onClick={goNext}
              aria-label="Photo suivante"
            >
              ›
            </button>
          </>
        )}
        <img
          src={photos[index]}
          alt=""
          className="restaurant-photo-lightbox-img"
        />
        {photos.length > 1 && (
          <div className="restaurant-photo-lightbox-dots" aria-hidden="true">
            {photos.map((_, i) => (
              <span
                key={i}
                className={`restaurant-photo-lightbox-dot ${i === index ? "active" : ""}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const RestaurantPhotoCarousel = ({ photos, initialIndex = 0 }) => {
  const [index, setIndex] = useState(initialIndex);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setIndex(initialIndex);
  }, [photos, initialIndex]);

  if (!photos || photos.length === 0) {
    return null;
  }

  const goPrev = (e) => {
    e?.stopPropagation?.();
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  };

  const goNext = (e) => {
    e?.stopPropagation?.();
    setIndex((i) => (i + 1) % photos.length);
  };

  const openLightbox = () => setLightboxOpen(true);

  const PhotoWrapper = ({ children }) => (
    <button
      type="button"
      className="restaurant-photo-carousel-photo-wrap"
      onClick={openLightbox}
      aria-label="Voir la photo en plein écran"
    >
      {children}
    </button>
  );

  if (photos.length === 1) {
    return (
      <>
        <PhotoWrapper>
          <img
            src={photos[0]}
            alt=""
            className="restaurant-detail-panel-logo restaurant-detail-panel-photo"
          />
        </PhotoWrapper>
        <RestaurantPhotoLightbox
          open={lightboxOpen}
          photos={photos}
          initialIndex={0}
          onClose={() => setLightboxOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="restaurant-photo-carousel">
        <button
          type="button"
          className="restaurant-photo-carousel-arrow restaurant-photo-carousel-arrow--prev"
          onClick={goPrev}
          aria-label="Photo précédente du restaurant"
        >
          ‹
        </button>
        <PhotoWrapper>
          <img
            src={photos[index]}
            alt=""
            className="restaurant-detail-panel-logo restaurant-detail-panel-photo"
          />
        </PhotoWrapper>
        <button
          type="button"
          className="restaurant-photo-carousel-arrow restaurant-photo-carousel-arrow--next"
          onClick={goNext}
          aria-label="Photo suivante du restaurant"
        >
          ›
        </button>
        <div className="restaurant-photo-carousel-dots" aria-hidden="true">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`restaurant-photo-carousel-dot ${i === index ? "active" : ""}`}
              onClick={(e) => { e.stopPropagation(); setIndex(i); }}
            />
          ))}
        </div>
      </div>
      <RestaurantPhotoLightbox
        open={lightboxOpen}
        photos={photos}
        initialIndex={index}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
};

const restaurants = RESTAURANTS;

const center = [
  restaurants.reduce((s, r) => s + r.coordinates[0], 0) / restaurants.length,
  restaurants.reduce((s, r) => s + r.coordinates[1], 0) / restaurants.length,
];

export const Restaurants = () => {
  const { t } = useTranslation();
  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurants[0]);
  const [infoWindowOpen, setInfoWindowOpen] = useState(null);
  const [selectedMetroStation, setSelectedMetroStation] = useState(null);
  const [selectedMonument, setSelectedMonument] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: center[0],
    latitude: center[1],
    zoom: 12,
  });
  const mapContainerRef = useRef(null);

  const getNavigationUrl = (restaurant) => {
    const query = encodeURIComponent(`${restaurant.name} ${restaurant.address}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const handleRestaurantClick = useCallback((restaurant) => {
    setSelectedRestaurant(restaurant);
    setInfoWindowOpen(restaurant.id);
    setViewState({
      longitude: restaurant.coordinates[0],
      latitude: restaurant.coordinates[1],
      zoom: 16,
    });
  }, []);

  const onMarkerClick = useCallback((restaurant) => {
    handleRestaurantClick(restaurant);
  }, [handleRestaurantClick]);

  // Calculer les limites pour afficher tous les restaurants
  const bounds = restaurants.reduce(
    (acc, restaurant) => {
      return {
        minLng: Math.min(acc.minLng, restaurant.coordinates[0]),
        maxLng: Math.max(acc.maxLng, restaurant.coordinates[0]),
        minLat: Math.min(acc.minLat, restaurant.coordinates[1]),
        maxLat: Math.max(acc.maxLat, restaurant.coordinates[1]),
      };
    },
    { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity }
  );

  useEffect(() => {
    // Ajuster la vue pour afficher tous les restaurants au chargement
    const centerLng = (bounds.minLng + bounds.maxLng) / 2;
    const centerLat = (bounds.minLat + bounds.maxLat) / 2;
    setViewState({
      longitude: centerLng,
      latitude: centerLat,
      zoom: 12,
    });
  }, []);

  // Afficher métro et monuments à partir d’un certain zoom ; fermer les popups si on dézoome
  const showMetroMarkers = viewState.zoom >= METRO_VISIBLE_ZOOM;
  const showMonumentMarkers = viewState.zoom >= MONUMENT_VISIBLE_ZOOM;
  useEffect(() => {
    if (!showMetroMarkers && selectedMetroStation) setSelectedMetroStation(null);
    if (!showMonumentMarkers && selectedMonument) setSelectedMonument(null);
  }, [showMetroMarkers, showMonumentMarkers, selectedMetroStation, selectedMonument]);

  return (
    <main className="restaurants-page">
      <PageSEO
        title="Nos Restaurants à Paris"
        description={`Retrouvez les ${RESTAURANT_COUNT} restaurants Soup & Juice à Paris et Neuilly : adresses, horaires, carte interactive. Soupes, jus frais et menus healthy près de chez vous.`}
        path="/restaurants"
        jsonLd={restaurants.map((r) => ({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          name: r.name,
          address: {
            "@type": "PostalAddress",
            streetAddress: r.address.replace(/,\s*\d{5}\s*.+$/, ""),
            addressLocality: r.address.match(/\d{5}\s+(.+)/)?.[1] || "Paris",
            postalCode: r.address.match(/(\d{5})/)?.[1] || "",
            addressCountry: "FR",
          },
          geo: { "@type": "GeoCoordinates", latitude: r.coordinates[1], longitude: r.coordinates[0] },
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "09:00",
            closes: "15:00",
          },
          servesCuisine: ["Soupes", "Jus frais", "Healthy", "Salades"],
          priceRange: "€",
          url: "https://www.soup-juice.net/restaurants",
        }))}
      />
      <div className="restaurants-container">
        <div
          className={`restaurants-layout${infoWindowOpen ? " restaurants-layout--with-panel" : ""}`}
        >
          <div className="restaurants-sidebar">
            <div className="restaurants-list-header">
              <h1 className="restaurants-list-title">{t("restaurants.listTitle")}</h1>
            </div>
            <div className="restaurants-list">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className={`restaurant-card ${selectedRestaurant?.id === restaurant.id ? "selected" : ""}`}
                  onClick={() => handleRestaurantClick(restaurant)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleRestaurantClick(restaurant);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="restaurant-card-content">
                    <h3 className="restaurant-name">{restaurant.name}</h3>
                    <p className="restaurant-address">{restaurant.address}</p>
                    <div className="restaurant-info">
                      <span className="restaurant-hours">{restaurant.hours}</span>
                      <div className="restaurant-card-actions">
                        {restaurant.deliverooUrl && (
                          <a
                            href={restaurant.deliverooUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="restaurant-navigation-btn restaurant-deliveroo-btn"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`${t("restaurants.ariaDeliveroo")} - ${restaurant.name}`}
                          >
                            <img src={deliveroLogo} alt="" width="18" height="18" />
                          </a>
                        )}
                        <a
                          href={getNavigationUrl(restaurant)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="restaurant-navigation-btn"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`${t("restaurants.ariaNavigate")} - ${restaurant.name}`}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {infoWindowOpen && selectedRestaurant && (
            <aside className="restaurant-detail-panel" aria-label={selectedRestaurant.name}>
              <button
                type="button"
                className="restaurant-detail-panel-close"
                onClick={() => setInfoWindowOpen(null)}
                aria-label={t("common.close")}
              >
                <X size={20} strokeWidth={2.5} aria-hidden />
              </button>
              <div className="restaurant-detail-panel-image">
                {restaurantPhotos[selectedRestaurant.id] ? (
                  <RestaurantPhotoCarousel
                    photos={restaurantPhotos[selectedRestaurant.id]}
                    initialIndex={selectedRestaurant.id === 5 ? 1 : 0}
                  />
                ) : (
                  <img
                    src={logoVert}
                    alt=""
                    className="restaurant-detail-panel-logo"
                  />
                )}
              </div>
              <div className="restaurant-detail-panel-body">
                <h2 className="restaurant-detail-panel-name">{selectedRestaurant.name}</h2>
                <p className="restaurant-detail-panel-address">
                  <span className="popup-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  {selectedRestaurant.address}
                </p>
                <a
                  href={getNavigationUrl(selectedRestaurant)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="restaurant-detail-panel-directions"
                >
                  {t("restaurants.popupNavigate")}
                </a>
                <div className="restaurant-detail-panel-hours">
                  <h3 className="restaurant-detail-panel-hours-title">{t("restaurants.hoursTitle")}</h3>
                  <p className="restaurant-detail-panel-hours-text">
                    <span className="popup-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </span>
                    {selectedRestaurant.hours}
                  </p>
                </div>
              </div>
            </aside>
          )}

          <div className="map-container" ref={mapContainerRef}>
            <Map
              {...viewState}
              onMove={(evt) => setViewState(evt.viewState)}
              style={{ width: "100%", height: "100%" }}
              mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
              attributionControl={true}
              cooperativeGestures={true}
            >
              {showMetroMarkers &&
                metroStationsParis.map((station, i) => (
                  <div key={`metro-${i}`}>
                    <Marker
                      longitude={station.coordinates[0]}
                      latitude={station.coordinates[1]}
                      anchor="center"
                    >
                      <button
                        type="button"
                        className="metro-marker"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMetroStation(selectedMetroStation?.name === station.name ? null : station);
                        }}
                        title={station.name}
                        aria-label={`Station ${station.name}`}
                      >
                        <img src={metroLogo} alt="" width={18} height={18} />
                      </button>
                    </Marker>
                    {selectedMetroStation?.name === station.name && (
                      <Popup
                        longitude={station.coordinates[0]}
                        latitude={station.coordinates[1]}
                        anchor="top"
                        offset={[0, -10]}
                        onClose={() => setSelectedMetroStation(null)}
                        closeButton={true}
                        closeOnClick={false}
                      >
                        <div className="popup-content popup-content--metro">
                          <div className="popup-metro-lines" aria-hidden="true">
                            {(station.lines || []).map((lineId) => {
                              const colors = RATP_LINE_COLORS[lineId] || { bg: "#555", text: "#fff" };
                              return (
                                <span
                                  key={lineId}
                                  className="popup-metro-line-badge"
                                  style={{
                                    backgroundColor: colors.bg,
                                    color: colors.text,
                                  }}
                                  title={`Ligne ${lineId}`}
                                >
                                  {lineId}
                                </span>
                              );
                            })}
                          </div>
                          <span className="popup-metro-name">{station.name}</span>
                        </div>
                      </Popup>
                    )}
                  </div>
                ))}
              {showMonumentMarkers &&
                monumentsParis.map((monument, i) => (
                  <div key={`monument-${i}`}>
                    <Marker
                      longitude={monument.coordinates[0]}
                      latitude={monument.coordinates[1]}
                      anchor="center"
                    >
                      <button
                        type="button"
                        className="monument-marker"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMonument(selectedMonument?.name === monument.name ? null : monument);
                        }}
                        title={monument.name}
                        aria-label={`Monument ${monument.name}`}
                      >
                        <img src={monumentIcons[monument.icon] || iconMonumentEiffel} alt="" width={28} height={28} />
                      </button>
                    </Marker>
                    {selectedMonument?.name === monument.name && (
                      <Popup
                        longitude={monument.coordinates[0]}
                        latitude={monument.coordinates[1]}
                        anchor="bottom"
                        offset={[0, -10]}
                        onClose={() => setSelectedMonument(null)}
                        closeButton={true}
                        closeOnClick={false}
                      >
                        <div className="popup-content popup-content--monument">
                          <span className="popup-monument-name">{monument.name}</span>
                        </div>
                      </Popup>
                    )}
                  </div>
                ))}
              {restaurants.map((restaurant) => {
                const isSelected = infoWindowOpen === restaurant.id;
                return (
                  <div key={restaurant.id}>
                    <Marker
                      longitude={restaurant.coordinates[0]}
                      latitude={restaurant.coordinates[1]}
                      anchor="center"
                    >
                      <div
                        onClick={() => onMarkerClick(restaurant)}
                        className={`custom-marker custom-marker-dot ${isSelected ? "selected" : ""}`}
                        style={{
                          position: "relative",
                          width: isSelected ? "32px" : "28px",
                          height: isSelected ? "32px" : "28px",
                          cursor: "pointer",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          transform: isSelected ? "scale(1.2)" : "scale(1)",
                          zIndex: isSelected ? 10 : 1,
                        }}
                      >
                        {/* Point rond avec logo */}
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            border: isSelected ? "3px solid #5a6654" : "2px solid white",
                            boxShadow: isSelected
                              ? "0 3px 15px rgba(90, 102, 84, 0.5), 0 0 0 3px rgba(90, 102, 84, 0.1)"
                              : "0 2px 10px rgba(90, 102, 84, 0.3)",
                            position: "relative",
                            overflow: "hidden",
                            backgroundColor: "white",
                            backgroundImage: `url(${logoVert})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                          }}
                        >
                          {/* Overlay pour améliorer la visibilité */}
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: isSelected ? "rgba(90, 102, 84, 0.15)" : "rgba(130, 144, 123, 0.1)",
                              borderRadius: "50%",
                            }}
                          />
                        </div>
                        {/* Ombre portée */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "-4px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "60%",
                            height: "4px",
                            backgroundColor: "rgba(0, 0, 0, 0.2)",
                            borderRadius: "50%",
                            filter: "blur(3px)",
                            zIndex: -1,
                          }}
                        />
                      </div>
                    </Marker>
                  </div>
                );
              })}
            </Map>
            <p className="map-zoom-hint" aria-hidden="true">
              {t("restaurants.mapZoomHint")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};
