import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getRouteETA } from '../utils/getRouteETA'; // Utility function to fetch route and ETA

const ProviderDashboard = () => {
  // Store the list of open help requests
  const [requests, setRequests] = useState([]);
  // Map to store ETA and distance for each request, keyed by request ID
  const [etaMap, setEtaMap] = useState({});
  // Simulated provider ID; in production this should come from auth
  const providerId = 1;

  useEffect(() => {
    // Fetch open requests and compute ETA for each
    const fetchRequestsAndETA = async () => {
      try {
        // Request list of open help requests from backend
        const res = await axios.get('http://localhost:5000/api/open-requests');
        const fetchedRequests = res.data;
        setRequests(fetchedRequests);

        // Simulated provider's location (hardcoded for now)
        const providerLocation = { lat: -15.419, lng: 28.280 };
        const etaResults = {}; // Temp object to hold route info

        // Loop over each request and fetch route/ETA info
        for (const req of fetchedRequests) {
          const userLocation = { lat: req.latitude, lng: req.longitude };
          const routeInfo = await getRouteETA(providerLocation, userLocation);
          if (routeInfo) {
            etaResults[req.id] = {
              duration: routeInfo.duration, // in seconds
              distance: routeInfo.distance  // in meters
            };
          }
        }

        // Update state with all ETA data
        setEtaMap(etaResults);
      } catch (err) {
        console.error('❌ Failed to load requests or ETA:', err);
      }
    };

    fetchRequestsAndETA();
  }, []); // Only run once on component mount

  // Function to assign provider to a request
  const acceptRequest = (requestId) => {
    axios.put(`http://localhost:5000/api/assign-request/${requestId}`, { provider_id: providerId })
      .then(() => {
        alert('✅ Request accepted!');
        // Remove accepted request from the visible list
        setRequests(prev => prev.filter(r => r.id !== requestId));
      })
      .catch(err => {
        console.error('❌ Failed to accept request:', err.message);
        alert('❌ Could not assign request');
      });
  };

  return (
    <div>
      <h2>🛠️ Provider Dashboard</h2>
      {/* Conditional rendering: if no requests, show message */}
      {requests.length === 0 ? (
        <p>No open requests available.</p>
      ) : (
        <ul>
          {requests.map(req => (
            <li key={req.id} style={{ marginBottom: '1rem' }}>
              <strong>Issue:</strong> {req.issue_type}<br />
              <strong>Location:</strong> ({req.latitude}, {req.longitude})<br />

              {/* Show ETA and distance if available */}
              {etaMap[req.id] && (
                <p>
                  <strong>ETA:</strong> {(etaMap[req.id].duration / 60).toFixed(1)} mins<br />
                  <strong>Distance:</strong> {(etaMap[req.id].distance / 1000).toFixed(2)} km
                </p>
              )}

              {/* Display map centered on user's location */}
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

              {/* Accept button for provider */}
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
