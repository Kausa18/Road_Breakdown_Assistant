import React from 'react';
import axios from 'axios';

const RequestHelp = ({ userLocation }) => {
  const handleRequest = async () => {
    if (!userLocation) {
      alert("Location not detected yet.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/request-help', {
        latitude: userLocation[0],
        longitude: userLocation[1],
        issue_type: "Breakdown"
      });

      alert("✅ " + response.data.message);
    } catch (error) {
      console.error("❌ Error:", error.message);
      alert("❌ Failed to send request: " + error.message);
    }
  };

  return (
    <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1000 }}>
      <button onClick={handleRequest} style={{ padding: '10px 20px', fontWeight: 'bold' }}>
        🚨 Request Help
      </button>
    </div>
  );
};

export default RequestHelp;
