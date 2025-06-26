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
      console.error('MySQL error:', err);
      return res.status(500).json({ message: 'Failed to save request' });
    }

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

  // Ensure provider_id is provided
  if (!provider_id) {
    return res.status(400).json({ message: 'Missing provider ID' });
  }

  // SQL query to update the request with the assigned provider and change its status
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

// Provider signup (register new provider)
app.post('/api/provider-signup', async (req, res) => {
  const { name, email, password, phone, service_type, latitude, longitude } = req.body;

  // Validate required input
  if (!name || !email || !password || !service_type || latitude == null || longitude == null) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Step 1: Insert user with role 'provider' into users table
    const [userResult] = await db.promise().query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, phone, 'provider']
    );

    const userId = userResult.insertId;

    // Step 2: Insert corresponding entry in service_providers table
    await db.promise().query(
      'INSERT INTO service_providers (user_id, service_type, latitude, longitude) VALUES (?, ?, ?, ?)',
      [userId, service_type, latitude, longitude]
    );

    res.status(201).json({ message: 'Provider registered successfully', providerId: userId });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Signup failed', error: err.code });
  }
});

// User signup (register a regular user)
app.post('/api/user-signup', async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Validate required input
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Insert into users table with role 'user'
    const [result] = await db.promise().query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, phone || '', 'user']
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (err) {
    console.error('User signup error:', err);
    res.status(500).json({ message: 'Signup failed', error: err.code });
  }
});

// Login route for both users and providers
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});


// Start the server and listen on the specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
