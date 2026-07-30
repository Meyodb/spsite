import { lazy, Suspense, useEffect } from "react";

// MapLibre pèse environ 1 Mo : il est isolé derrière un import dynamique pour
// qu'il ne soit téléchargé que sur les pages qui affichent réellement la carte.
const MapLibre = lazy(async () => {
  const [{ Map, Marker }] = await Promise.all([
    import("@vis.gl/react-maplibre"),
    import("maplibre-gl/dist/maplibre-gl.css"),
  ]);

  const MapWithMarker = ({ longitude, latitude, markerImage }) => (
    <Map
      initialViewState={{ longitude, latitude, zoom: 15 }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
      attributionControl
      cooperativeGestures
    >
      <Marker longitude={longitude} latitude={latitude} anchor="center">
        <div className="rd-marker">
          <div
            className="rd-marker-inner"
            style={{ backgroundImage: `url(${markerImage})` }}
          />
        </div>
      </Marker>
    </Map>
  );

  return { default: MapWithMarker };
});

export const RestaurantMap = ({ longitude, latitude, markerImage, loadingLabel }) => {
  useEffect(() => {
    // Précharge la carte dès que le navigateur est disponible.
    import("@vis.gl/react-maplibre");
  }, []);

  return (
    <Suspense fallback={<div className="rd-map-placeholder">{loadingLabel}</div>}>
      <MapLibre longitude={longitude} latitude={latitude} markerImage={markerImage} />
    </Suspense>
  );
};
