// This must be the first line to load our secret database key
require('dotenv').config();

// Import all our tools
const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Database Connection ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- NEW: Test DB Connection on Startup ---
pool.connect((err, client, release) => {
  if (err) {
    return console.error('!!! DATABASE CONNECTION ERROR !!!', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    console.log('✅ Database connection successful. Current time:', result.rows[0].now);
  });
});

// --- Middleware ---
app.use(cors());
app.use(express.json());

// =================================================================
// --- API Routes ---
// =================================================================

// ... (Your health and register routes are the same)
app.get('/api/health', (req, res) => { /* ... same as before ... */ });
app.post('/api/auth/register', async (req, res) => { /* ... same as before ... */ });


// --- Get All Colleges Route (with ENHANCED logging) ---
app.get('/api/colleges', async (req, res) => {
  try {
    console.log("Attempting to fetch colleges..."); // Log the attempt
    const allColleges = await pool.query("SELECT * FROM colleges");
    console.log(`Successfully fetched ${allColleges.rows.length} colleges.`);
    res.json(allColleges.rows);
  } catch (error) {
    // --- NEW: Log the FULL error object ---
    console.error("--- DETAILED ERROR FETCHING COLLEGES ---");
    console.error(error); 
    console.error("--- END OF DETAILED ERROR ---");
    res.status(500).json({ message: "Server error while fetching colleges." });
  }
});


// ... (Your single college route is the same)
app.get('/api/colleges/:id', async (req, res) => { /* ... same as before ... */ });


// =================================================================
// --- Start The Server ---
// =================================================================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});