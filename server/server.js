const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Simple test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Handle POST help request
app.post('/api/request-help', (req, res) => {
  const { latitude, longitude, issue_type } = req.body;

  // Validate required inputs
  if (!latitude || !longitude || !issue_type) {
    return res.status(400).json({ message: 'Missing required data' });
  }

  // Insert into MySQL
  const sql = `
    INSERT INTO requests (user_id, provider_id, issue_type, latitude, longitude)
    VALUES (NULL, NULL, ?, ?, ?)
  `;

  db.query(sql, [issue_type, latitude, longitude], (err, result) => {
    if (err) {
      console.error('❌ MySQL error:', err);
      return res.status(500).json({ message: 'Failed to save request' });
    }

    console.log('✅ Request saved with ID:', result.insertId);
    res.status(200).json({ message: 'Request saved successfully', id: result.insertId });
  });
});
