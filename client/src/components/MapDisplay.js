import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import providersData from '../mock_providers.json';
import 'leaflet/dist/leaflet.css';

// Fix default icon path for Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapDisplay = () => {
  // Fallback to Lusaka if location fails
  const fallbackPos = [-15.4167, 28.2833];
  const [userPos, setUserPos] = useState(fallbackPos);
  const [locationStatus, setLocationStatus] = useState("Detecting your location...");
  const [providers] = useState(providersData);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          console.log("Location granted:", coords.latitude, coords.longitude);
          setUserPos([coords.latitude, coords.longitude]);
          setLocationStatus("Location detected ✅");
        },
        (err) => {
          console.warn("⚠️ Location error:", err.message);
          setLocationStatus("⚠️ Could not get your exact location. Showing default.");
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0
        }
      );
    } else {
      setLocationStatus("❌ Geolocation not supported.");
    }
  }, []);

  return (
    <div>
      <div style={{ padding: '0.5rem', textAlign: 'center' }}>{locationStatus}</div>
      <MapContainer center={userPos} zoom={13} style={{ height: '100%', minHeight: '60vh', width: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker for the user or fallback location */}
        <Marker position={userPos}>
          <Popup>Your location</Popup>
        </Marker>

        {/* Loop through service providers */}
        {providers.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <strong>{p.name}</strong><br />
              Service: {p.service}<br />
              Status: {p.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapDisplay;
