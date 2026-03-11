import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, Clock, Navigation, ArrowLeft, Train, ChevronLeft, ChevronRight, X, ZoomIn, UtensilsCrossed } from "lucide-react";
import { PageSEO } from "../components/PageSEO";
import { Map, Marker } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { RESTAURANTS } from "../data/restaurantsData";
import { RATP_LINE_COLORS } from "../data/ratpLineColors";
import logoVert from "../assets/images/logo-vert.png";
import deliveroLogo from "../assets/images/delivero.svg";
import photoLondre from "../assets/images/restaurants/photo_londre.jpg";
import photoBourse from "../assets/images/restaurants/photo_bourse.png";
import photoHaussmann from "../assets/images/restaurants/photo_haussmann.png";
import photoEcuries from "../assets/images/restaurants/photo_Ecuries.png";
import photoEcuries2 from "../assets/images/restaurants/photo_Ecuries_2.png";
import photoEtoile from "../assets/images/restaurants/photo_etoile.png";
import photoKleber2 from "../assets/images/restaurants/photo_kleber_2.png";
import photoOpera from "../assets/images/restaurants/photo_opera.png";
import photoNeuilly from "../assets/images/restaurants/photo_neuilly.jpg";
import photoHonore from "../assets/images/restaurants/photo_honore.png";
import photoMadeleine from "../assets/images/restaurants/photo_madeleine.png";
import "./RestaurantDetail.css";

const restaurantPhotos = {
  1: [photoLondre],
  2: [photoBourse],
  3: [photoHaussmann],
  4: [photoEcuries2, photoEcuries],
  5: [photoEtoile, photoKleber2],
  6: [photoOpera],
  7: [photoNeuilly],
  8: [photoHonore],
  9: [photoMadeleine],
};

const siteUrl = "https://www.soup-juice.net";

const parseRestaurantAddress = (address) => {
  const streetAddress = address.replace(/,\s*\d{5}\s*.+$/, "");
  const postalCode = address.match(/(\d{5})/)?.[1] || "";
  const addressLocality = address.match(/\d{5}\s+(.+)/)?.[1] || "Paris";
  return { streetAddress, postalCode, addressLocality };
};

const getNavigationUrl = (restaurant) => {
  const query = encodeURIComponent(`${restaurant.name} ${restaurant.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

const toAbsoluteImageUrl = (src) => {
  if (!src) return undefined;
  if (src.startsWith("http")) return src;
  return `${siteUrl}${src}`;
};

export const RestaurantDetail = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const scrollRef = useRef(null);

  const restaurant = useMemo(
    () => RESTAURANTS.find((r) => r.slug === slug),
    [slug]
  );

  const openLightbox = useCallback((i) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(-1), []);

  const lightboxPrev = useCallback(() => {
    setLightboxIndex((prev) => {
      const photos = restaurantPhotos[restaurant?.id] || [];
      return prev > 0 ? prev - 1 : photos.length - 1;
    });
  }, [restaurant?.id]);

  const lightboxNext = useCallback(() => {
    setLightboxIndex((prev) => {
      const photos = restaurantPhotos[restaurant?.id] || [];
      return prev < photos.length - 1 ? prev + 1 : 0;
    });
  }, [restaurant?.id]);

  useEffect(() => {
    if (lightboxIndex < 0) return;
    const handleKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lightboxPrev();
      if (e.key === "ArrowRight") lightboxNext();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, closeLightbox, lightboxPrev, lightboxNext]);

  const scrollGallery = useCallback((dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }, []);

  if (!restaurant) {
    return <Navigate to="/restaurants" replace />;
  }

  const photos = restaurantPhotos[restaurant.id] || [];
  const heroPhoto = photos[0] || null;
  const parsedAddress = parseRestaurantAddress(restaurant.address);
  const restaurantImages = photos.map(toAbsoluteImageUrl);
  const shortName = restaurant.name.replace("SOUP & JUICE ", "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${siteUrl}/restaurants/${restaurant.slug}`,
    name: restaurant.name,
    url: `${siteUrl}/restaurants/${restaurant.slug}`,
    ...(restaurantImages.length > 0
      ? { image: restaurantImages }
      : { image: `${siteUrl}/og-default.jpg` }),
    ...(restaurant.phone ? { telephone: restaurant.phone } : {}),
    ...(restaurant.deliverooUrl
      ? { sameAs: ["https://www.instagram.com/soupjuiceparis/", restaurant.deliverooUrl] }
      : { sameAs: ["https://www.instagram.com/soupjuiceparis/"] }),
    menu: restaurant.deliverooUrl || `${siteUrl}/produits`,
    address: {
      "@type": "PostalAddress",
      streetAddress: parsedAddress.streetAddress,
      addressLocality: parsedAddress.addressLocality,
      postalCode: parsedAddress.postalCode,
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: restaurant.coordinates[1],
      longitude: restaurant.coordinates[0],
    },
    hasMap: getNavigationUrl(restaurant),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "15:00",
    },
    servesCuisine: ["Soupes", "Jus frais", "Healthy", "Salades"],
    priceRange: "€",
    description: restaurant.description,
  };

  return (
    <main className="rd-page">
      <PageSEO
        title={`Restaurant ${shortName} – Soup & Juice`}
        description={restaurant.description}
        path={`/restaurants/${restaurant.slug}`}
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="rd-hero">
        <div className="rd-hero-image-wrap">
          {heroPhoto ? (
            <img src={heroPhoto} alt={restaurant.name} className="rd-hero-image" />
          ) : (
            <div className="rd-hero-placeholder">
              <img src={logoVert} alt="" className="rd-hero-logo" />
            </div>
          )}
          <div className="rd-hero-overlay" />
        </div>
        <div className="rd-hero-content">
          <Link to="/restaurants" className="rd-back-link">
            <ArrowLeft size={18} />
            {t("restaurants.listTitle", "Nos restaurants")}
          </Link>
          <h1 className="rd-hero-title">{restaurant.name}</h1>
          <p className="rd-hero-quartier">{restaurant.quartier}</p>
        </div>
      </section>

      {/* Actions rapides */}
      <div className="rd-actions-bar">
        <div className="rd-actions-inner">
          <a
            href={getNavigationUrl(restaurant)}
            target="_blank"
            rel="noopener noreferrer"
            className="rd-btn rd-btn-primary"
          >
            <Navigation size={16} />
            S'y rendre
          </a>
          {restaurant.deliverooUrl && (
            <a
              href={restaurant.deliverooUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rd-btn rd-btn-deliveroo"
            >
              <img src={deliveroLogo} alt="" width="18" height="18" />
              Commander sur Deliveroo
            </a>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="rd-container">
        <div className="rd-grid">
          {/* Colonne gauche : infos */}
          <div className="rd-info-col">
            <section className="rd-section rd-description">
              <h2 className="rd-section-title">Découvrir ce restaurant</h2>
              <p className="rd-description-text">{restaurant.description}</p>
            </section>

            <section className="rd-section rd-cta-produits">
              <div className="rd-cta-produits-text">
                <span className="rd-cta-produits-icon">
                  <UtensilsCrossed size={18} />
                </span>
                <div>
                  <h3 className="rd-cta-produits-title">Voir la carte Soup &amp; Juice</h3>
                  <p className="rd-cta-produits-desc">
                    Tous nos produits disponibles dans ce restaurant.
                  </p>
                </div>
              </div>
              <Link to="/produits" className="rd-btn rd-btn-primary rd-cta-produits-btn">
                Voir nos produits
              </Link>
            </section>

            <section className="rd-section rd-practical">
              <h2 className="rd-section-title">Informations pratiques</h2>

              <div className="rd-info-row">
                <MapPin size={18} className="rd-info-icon" />
                <div>
                  <span className="rd-info-label">Adresse</span>
                  <span className="rd-info-value">{restaurant.address}</span>
                </div>
              </div>

              <div className="rd-info-row">
                <Clock size={18} className="rd-info-icon" />
                <div>
                  <span className="rd-info-label">Horaires</span>
                  <span className="rd-info-value">{restaurant.hours}</span>
                </div>
              </div>

              {restaurant.metro && restaurant.metro.length > 0 && (
                <div className="rd-info-row">
                  <Train size={18} className="rd-info-icon" />
                  <div>
                    <span className="rd-info-label">Métro</span>
                    <div className="rd-metro-list">
                      {restaurant.metro.map((station) => (
                        <div key={station.name} className="rd-metro-station">
                          <span className="rd-metro-name">{station.name}</span>
                          <div className="rd-metro-lines">
                            {station.lines.map((lineId) => {
                              const colors = RATP_LINE_COLORS[lineId] || { bg: "#555", text: "#fff" };
                              return (
                                <span
                                  key={lineId}
                                  className="rd-metro-badge"
                                  style={{ backgroundColor: colors.bg, color: colors.text }}
                                >
                                  {lineId}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {restaurant.nearbyLandmarks && restaurant.nearbyLandmarks.length > 0 && (
              <section className="rd-section rd-landmarks">
                <h2 className="rd-section-title">À proximité</h2>
                <ul className="rd-landmarks-list">
                  {restaurant.nearbyLandmarks.map((landmark) => (
                    <li key={landmark} className="rd-landmark-item">{landmark}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Colonne droite : carte + galerie */}
          <div className="rd-map-col">
            <div className="rd-map-wrap">
              <Map
                initialViewState={{
                  longitude: restaurant.coordinates[0],
                  latitude: restaurant.coordinates[1],
                  zoom: 15,
                }}
                style={{ width: "100%", height: "100%" }}
                mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
                attributionControl={true}
                cooperativeGestures={true}
              >
                <Marker
                  longitude={restaurant.coordinates[0]}
                  latitude={restaurant.coordinates[1]}
                  anchor="center"
                >
                  <div className="rd-marker">
                    <div
                      className="rd-marker-inner"
                      style={{
                        backgroundImage: `url(${logoVert})`,
                      }}
                    />
                  </div>
                </Marker>
              </Map>
            </div>

            {photos.length > 0 && (
              <div className="rd-gallery">
                <h2 className="rd-section-title">Photos</h2>
                <div className="rd-gallery-carousel-wrap">
                  {photos.length > 1 && (
                    <button
                      type="button"
                      className="rd-gallery-arrow rd-gallery-arrow--left"
                      onClick={() => scrollGallery("left")}
                      aria-label="Photos précédentes"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <div className="rd-gallery-scroll" ref={scrollRef}>
                    {photos.map((photo, i) => (
                      <button
                        key={i}
                        type="button"
                        className="rd-gallery-item"
                        onClick={() => openLightbox(i)}
                        aria-label={`Agrandir photo ${i + 1}`}
                      >
                        <img
                          src={photo}
                          alt={`${restaurant.name} – photo ${i + 1}`}
                          className="rd-gallery-img"
                        />
                        <span className="rd-gallery-zoom">
                          <ZoomIn size={16} />
                        </span>
                      </button>
                    ))}
                  </div>
                  {photos.length > 1 && (
                    <button
                      type="button"
                      className="rd-gallery-arrow rd-gallery-arrow--right"
                      onClick={() => scrollGallery("right")}
                      aria-label="Photos suivantes"
                    >
                      <ChevronRight size={20} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex >= 0 && photos[lightboxIndex] && (
        <div
          className="rd-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo agrandie"
          onClick={(e) => e.target === e.currentTarget && closeLightbox()}
        >
          <button type="button" className="rd-lightbox-close" onClick={closeLightbox} aria-label="Fermer">
            <X size={24} />
          </button>
          {photos.length > 1 && (
            <button type="button" className="rd-lightbox-nav rd-lightbox-nav--prev" onClick={lightboxPrev} aria-label="Photo précédente">
              <ChevronLeft size={28} />
            </button>
          )}
          <div className="rd-lightbox-content">
            <img
              src={photos[lightboxIndex]}
              alt={`${restaurant.name} – photo ${lightboxIndex + 1}`}
              className="rd-lightbox-img"
            />
            {photos.length > 1 && (
              <span className="rd-lightbox-counter">
                {lightboxIndex + 1} / {photos.length}
              </span>
            )}
          </div>
          {photos.length > 1 && (
            <button type="button" className="rd-lightbox-nav rd-lightbox-nav--next" onClick={lightboxNext} aria-label="Photo suivante">
              <ChevronRight size={28} />
            </button>
          )}
        </div>
      )}
    </main>
  );
};
