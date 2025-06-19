import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import providersData from '../mock_providers.json';
import RequestHelp from './RequestHelp'; // ✅ Import this
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});

const MapDisplay = () => {
  const [userPos, setUserPos] = useState(null);
  const [providers] = useState(providersData);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          console.log("Location granted:", coords.latitude, coords.longitude);
          setUserPos([coords.latitude, coords.longitude]);
        },
        (err) => {
          console.error("Geolocation denied or failed:", err.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    userPos ? (
      <>
        {/* ✅ Help button above the map */}
        <RequestHelp userLocation={userPos} />

        <MapContainer center={userPos} zoom={13} style={{ height: '100vh', width: '100%' }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User's Location Marker */}
          <Marker position={userPos}>
            <Popup>You are here</Popup>
          </Marker>

          {/* Service Provider Markers */}
          {providers.map(p => (
            <Marker key={p.id} position={[p.lat, p.lng]}>
              <Popup>
                <strong>{p.name}</strong><br />
                Service: {p.service}<br />
                Status: {p.status}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </>
    ) : (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        ⏳ Detecting your location...
      </div>
    )
  );
};

export default MapDisplay;
