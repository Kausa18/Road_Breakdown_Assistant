import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const ProviderDashboard = () => {
  const [requests, setRequests] = useState([]);
  const providerId = 1; // 👈 Replace this with the real provider_id you want to test

  useEffect(() => {
    axios.get('http://localhost:5000/api/open-requests')
      .then(res => setRequests(res.data))
      .catch(err => console.error('❌ Could not load requests:', err));
  }, []);

  const acceptRequest = (requestId) => {
    axios.put(`http://localhost:5000/api/assign-request/${requestId}`, {
      provider_id: providerId,
    })
    .then(() => {
      alert('✅ Request accepted!');
      setRequests(prev => prev.filter(r => r.id !== requestId)); // Remove it from the list
    })
    .catch(err => {
      console.error('❌ Failed to accept request:', err.message);
      alert('❌ Could not assign request');
    });
  };

  return (
    <div>
      <h2>🛠️ Provider Dashboard</h2>
      {requests.length === 0 ? (
        <p>No open requests available.</p>
      ) : (
        <ul>
          {requests.map(req => (
            <li key={req.id} style={{ marginBottom: '1rem' }}>
              <strong>Issue:</strong> {req.issue_type}<br />
              <strong>Location:</strong> ({req.latitude}, {req.longitude})<br />
              <MapContainer
                center={[req.latitude, req.longitude]}
                zoom={14}
                style={{ height: '200px', width: '100%', marginTop: '0.5rem' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[req.latitude, req.longitude]}>
                  <Popup>Customer location</Popup>
                </Marker>
              </MapContainer>
              <button onClick={() => acceptRequest(req.id)} style={{ marginTop: '0.5rem' }}>
                ✅ Accept Request
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProviderDashboard;
