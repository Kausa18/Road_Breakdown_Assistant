import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RequestList = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/requests')
      .then(res => setRequests(res.data))
      .catch(err => {
        console.error("❌ Could not fetch requests:", err.message);
      });
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>📋 Help Requests</h2>
      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <ul>
          {requests.map(req => (
            <li key={req.id}>
              <strong>Issue:</strong> {req.issue_type} | 
              <strong> Location:</strong> ({req.latitude}, {req.longitude}) | 
              <strong> Status:</strong> {req.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RequestList;
