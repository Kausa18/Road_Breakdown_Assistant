// Import required modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/db'); // Import database connection

const app = express();

// Enable CORS for cross-origin requests
app.use(cors());
// Parse incoming JSON request bodies
app.use(bodyParser.json());

// Test route to confirm API is reachable
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Endpoint to handle incoming help requests
app.post('/api/request-help', (req, res) => {
  const { latitude, longitude, issue_type } = req.body;

  // Validate that required data is provided
  if (latitude === undefined || longitude === undefined || !issue_type) {
    return res.status(400).json({ message: 'Missing required data' });
  }

  // SQL query to insert a new help request into the database
  const sql = `
    INSERT INTO requests (user_id, provider_id, issue_type, latitude, longitude)
    VALUES (NULL, NULL, ?, ?, ?)
  `;

  // Execute the query with provided values
  db.query(sql, [issue_type, latitude, longitude], (err, result) => {
    if (err) {
      console.error('MySQL error:', err); // Log database error
      return res.status(500).json({ message: 'Failed to save request' });
    }

    // Log success and respond with confirmation
    console.log('Request saved with ID:', result.insertId);
    res.status(200).json({ message: 'Request saved successfully', id: result.insertId });
  });
});

// Fetch all help requests
app.get('/api/requests', (req, res) => {
  const sql = 'SELECT * FROM requests ORDER BY created_at DESC';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Failed to fetch requests:', err);
      return res.status(500).json({ message: 'Error fetching requests' });
    }

    res.status(200).json(results);
  });
});

// Start the server and listen on the specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Get all pending (open) requests for providers
app.get('/api/open-requests', (req, res) => {
  const sql = `
    SELECT * FROM requests
    WHERE status = 'pending' AND provider_id IS NULL
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Failed to fetch open requests:', err);
      return res.status(500).json({ message: 'Error fetching open requests' });
    }

    res.status(200).json(results);
  });
});

// Assign a provider to a request
app.put('/api/assign-request/:id', (req, res) => {
  const requestId = req.params.id;
  const { provider_id } = req.body;

  if (!provider_id) {
    return res.status(400).json({ message: 'Missing provider ID' });
  }

  const sql = `
    UPDATE requests
    SET provider_id = ?, status = 'accepted'
    WHERE id = ?
  `;

  db.query(sql, [provider_id, requestId], (err, result) => {
    if (err) {
      console.error('❌ Failed to assign provider:', err);
      return res.status(500).json({ message: 'Failed to assign provider' });
    }

    res.status(200).json({ message: 'Request accepted by provider' });
  });
});
