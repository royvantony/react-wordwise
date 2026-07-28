import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import styles from "./Map.module.css";
import {
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useState } from "react";
import { useCities } from "../Contexts/CitiesContext";
import { useGeolocation } from "../hooks/useGeoLocation";
import Button from "./Button";
import { useUrlPosition } from "../hooks/useUrlPosition";
function Map() {
  const { cities } = useCities();
  const [mapPosition, setMapPosition] = useState([50, 13]);
  const {
    isLoading: isLoadingPosition,
    position: geolocationPosition,
    error,
    getPosition,
  } = useGeolocation();

  // ✅ Safer parsing of query params
  // const getValidNumber = (param, fallback) => {
  //   const value = Number(param);
  //   return !isNaN(value) && param !== null && param !== "" ? value : fallback;
  // };

  const [mapLat, mapLng] = useUrlPosition();

  useEffect(() => {
    if (geolocationPosition)
      setMapPosition([geolocationPosition.lat, geolocationPosition.lng]);
  }, [geolocationPosition]);

  useEffect(() => {
    if (mapLat && mapLng) setMapPosition([mapLat, mapLng]);
  }, [mapLat, mapLng]);

  return (
    <div className={styles.mapContainer}>
      {!geolocationPosition && (
        <Button type="position" onClick={getPosition}>
          {isLoadingPosition ? "Loading..." : "Use your position"}
        </Button>
      )}

      {error && <div className={styles.error}>Error: {error}</div>}
      <MapContainer
        center={mapPosition}
        zoom={5}
        scrollWheelZoom={true}
        className={styles.map}
      >
        <LayersControl position="topright">
          {/* 🌍 Default street map */}
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          {/* 🛰️ Aerial / Satellite view (Esri World Imagery) */}
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution="Tiles © Esri — Source: Esri, Maxar, GeoEye"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {cities.map((city) => (
          <Marker
            key={city.id}
            position={[city.position.lat, city.position.lng]}
            // eventHandlers={{
            //   click: () => {
            //     navigate(`/?lat=${city.position.lat}&lng=${city.position.lng}`);
            //     setMapPosition([city.position.lat, city.position.lng]);
            //   },
            // }}
          >
            <Popup>
              {city.cityName}, {city.country}
            </Popup>
          </Marker>
        ))}

        <ChangeCenter position={mapPosition} />
        <DetectClick />
      </MapContainer>
    </div>
  );
}

function ChangeCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 5);
  }, [map, position]);
  return null;
}

function DetectClick() {
  const navigate = useNavigate();

  useMapEvents({
    click: (e) => {
      navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
    },
  });
}
export default Map;
