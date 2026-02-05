import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Restaurants.css";
import { AnimatedItem } from "../components/AnimatedSection";
import deliveroLogo from "../assets/images/delivero.svg";

// Créer une icône personnalisée avec les couleurs du site
const createCustomIcon = (isSelected = false) => {
  const color = isSelected ? '#5a6654' : '#82907B'; // green-dark ou green
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(130, 144, 123, 0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 12px;
          height: 12px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// Fix pour les icônes de Leaflet par défaut (fallback)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const restaurants = [
  {
    id: 1,
    name: "SOUP & JUICE ST LAZARE",
    address: "4 Rue de Londres, 75008 Paris",
    coordinates: [48.877614, 2.327728],
    hours: "Lundi - Vendredi: 9h00 - 15h00",
    phone: "+33 1 XX XX XX XX"
  },
  {
    id: 2,
    name: "SOUP & JUICE BOURSE",
    address: "135 Rue Montmartre, 75002 Paris",
    coordinates: [48.8685, 2.3435],
    hours: "Lundi - Vendredi: 9h00 - 15h00",
    phone: "+33 1 XX XX XX XX"
  },
  {
    id: 3,
    name: "SOUP & JUICE HAUSSMANN",
    address: "23 Rue Taitbout, 75009 Paris",
    coordinates: [48.87313, 2.33526],
    hours: "Lundi - Vendredi: 9h00 - 15h00",
    phone: "+33 1 XX XX XX XX"
  },
  {
    id: 4,
    name: "SOUP & JUICE ÉCURIES",
    address: "7 Rue des Petites Écuries, 75010 Paris",
    coordinates: [48.8731, 2.3533],
    hours: "Lundi - Vendredi: 9h00 - 15h00",
    phone: "+33 1 XX XX XX XX"
  },
  {
    id: 5,
    name: "SOUP & JUICE ÉTOILE",
    address: "54 Avenue Kléber, 75016 Paris",
    coordinates: [48.8685, 2.2886],
    hours: "Lundi - Vendredi: 9h00 - 15h00",
    phone: "+33 1 XX XX XX XX"
  },
  {
    id: 6,
    name: "SOUP & JUICE OPÉRA",
    address: "24 Rue du 4 septembre, 75002 Paris",
    coordinates: [48.869615, 2.336415],
    hours: "Lundi - Vendredi: 9h00 - 15h00",
    phone: "+33 1 XX XX XX XX"
  },
  {
    id: 7,
    name: "SOUP & JUICE NEUILLY",
    address: "38 Rue Ybry, 92200 Neuilly-sur-Seine",
    coordinates: [48.8846, 2.26965],
    hours: "Lundi - Vendredi: 9h00 - 15h00",
    phone: "06 37 79 03 01",
    deliverooUrl: "https://deliveroo.fr/fr/menu/paris/neuilly-sur-seine/soup-and-juice-neuilly"
  },
  {
    id: 8,
    name: "SOUP & JUICE HONORÉ",
    address: "38 Rue de Berri, 75008 Paris",
    coordinates: [48.87389, 2.30694],
    hours: "Lundi - Vendredi: 9h00 - 15h00",
    phone: "+33 1 XX XX XX XX"
  },
  {
    id: 9,
    name: "SOUP & JUICE ANJOU",
    address: "24 Rue d'Anjou, 75008 Paris",
    coordinates: [48.8715, 2.318],
    hours: "Lundi - Vendredi: 9h00 - 15h00",
    phone: "+33 1 XX XX XX XX"
  }
];

// Composant pour changer la vue de la carte (quand l'utilisateur sélectionne un restaurant)
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

// Composant pour ajuster la carte afin que tous les points soient visibles au chargement
function FitBoundsToMarkers({ restaurants }) {
  const map = useMap();
  useEffect(() => {
    if (!restaurants?.length) return;
    const bounds = L.latLngBounds(
      restaurants.map((r) => r.coordinates)
    );
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 14
    });
  }, [map, restaurants]);
  return null;
}

// Composant pour gérer le redimensionnement réactif de la carte
function MapResizeHandler() {
  const map = useMap();
  
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Redimensionner au montage
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [map]);

  return null;
}

export const Restaurants = () => {
  const { t } = useTranslation();
  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurants[0]);
  const [userHasSelectedRestaurant, setUserHasSelectedRestaurant] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Fonction pour générer le lien de navigation
  const getNavigationUrl = (restaurantName) => {
    const encodedName = encodeURIComponent(restaurantName);
    return `https://www.google.com/maps/search/?api=1&query=${encodedName}`;
  };

  // Calculer le centre de la carte (moyenne des coordonnées)
  const center = [
    restaurants.reduce((sum, r) => sum + r.coordinates[0], 0) / restaurants.length,
    restaurants.reduce((sum, r) => sum + r.coordinates[1], 0) / restaurants.length
  ];

  // Gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
      
      // Redimensionner la carte après un changement de taille
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current.invalidateSize();
        }, 150);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Redimensionner une fois au montage
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Forcer le redimensionnement de la carte après le montage
  useEffect(() => {
    if (mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Redimensionner la carte quand la taille de la fenêtre change
  useEffect(() => {
    if (mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [windowSize]);

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setUserHasSelectedRestaurant(true);
    
    // Forcer le redimensionnement de la carte après changement
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 150);
    }
    
    // Sur mobile, scroller vers la carte après sélection
    if (window.innerWidth <= 768 && mapContainerRef.current) {
      setTimeout(() => {
        mapContainerRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
        // Redimensionner après le scroll
        if (mapRef.current) {
          setTimeout(() => {
            mapRef.current.invalidateSize();
          }, 300);
        }
      }, 100);
    }
  };

  return (
    <main className="restaurants-page">
      <section className="restaurants-hero">
        <div className="restaurants-hero-content">
          <AnimatedItem>
            <h1 className="restaurants-hero-title">{t("restaurants.title")}</h1>
          </AnimatedItem>
          <AnimatedItem delay={200}>
            <p className="restaurants-hero-subtitle">
              {t("restaurants.subtitle")}
            </p>
          </AnimatedItem>
        </div>
      </section>

      <div className="restaurants-container">

        <div className="restaurants-layout">
          {/* Liste des restaurants */}
          <div className="restaurants-list">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className={`restaurant-card ${selectedRestaurant?.id === restaurant.id ? 'selected' : ''}`}
                onClick={() => handleRestaurantClick(restaurant)}
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
                        href={getNavigationUrl(restaurant.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="restaurant-navigation-btn"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`${t("restaurants.ariaNavigate")} - ${restaurant.name}`}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                            fill="currentColor"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carte interactive */}
          <div className="map-container" ref={mapContainerRef}>
            <MapContainer
              center={center}
              zoom={10}
              style={{ 
                height: windowSize.width <= 768 
                  ? (windowSize.width <= 480 ? "300px" : "350px")
                  : "600px", 
                width: "100%" 
              }}
              whenCreated={(mapInstance) => {
                mapRef.current = mapInstance;
                // Redimensionner immédiatement après création
                setTimeout(() => {
                  mapInstance.invalidateSize();
                }, 100);
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
              />
              <MapResizeHandler />
              {!userHasSelectedRestaurant && (
                <FitBoundsToMarkers restaurants={restaurants} />
              )}
              {userHasSelectedRestaurant && selectedRestaurant && (
                <ChangeMapView center={selectedRestaurant.coordinates} zoom={14} />
              )}
              {restaurants.map((restaurant) => (
                <Marker
                  key={restaurant.id}
                  position={restaurant.coordinates}
                  icon={createCustomIcon(selectedRestaurant?.id === restaurant.id)}
                  eventHandlers={{
                    click: () => handleRestaurantClick(restaurant),
                  }}
                >
                  <Popup>
                    <div className="popup-content popup-content--card">
                      <h3 className="popup-title">{restaurant.name}</h3>
                      <div className="popup-details">
                        <p className="popup-address">
                          <span className="popup-icon" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          </span>
                          {restaurant.address}
                        </p>
                        <p className="popup-hours">
                          <span className="popup-icon" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          </span>
                          {restaurant.hours}
                        </p>
                      </div>
                      <a
                        href={getNavigationUrl(restaurant.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="popup-navigation-btn"
                        aria-label={`${t("restaurants.ariaNavigate")} - ${restaurant.name}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        {t("restaurants.popupNavigate")}
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </main>
  );
};
