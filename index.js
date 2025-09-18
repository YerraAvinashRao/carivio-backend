// This must be the first line to load our secret database key
require('dotenv').config();

// Import all our tools
const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const cors = require('cors'); // <-- The CORS fix

const app = express();
const PORT = process.env.PORT || 3001;

// --- Database Connection ---
// This uses the DATABASE_URL from your .env file locally, or from Render's environment variables when live
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- Middleware ---
app.use(cors()); // <-- Use CORS to allow frontend access
app.use(express.json()); // To parse incoming JSON data

// =================================================================
// --- API Routes ---
// =================================================================

// 1. Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", message: "CARIVIO API is running!" });
});

// 2. User Registration Route (with REAL database logic)
app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, password, phoneNumber } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ message: "Full name, email, and password are required." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users (full_name, email, password_hash, phone_number) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role",
      [fullName, email, passwordHash, phoneNumber]
    );
    res.status(201).json({
      message: "User registered successfully!",
      user: newUser.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// 3. Get All Colleges Route
app.get('/api/colleges', async (req, res) => {
  try {
    const allColleges = await pool.query("SELECT * FROM colleges");
    res.json(allColleges.rows);
  } catch (error) {
    console.error("Error fetching colleges:", error);
    res.status(500).json({ message: "Server error while fetching colleges." });
  }
});

// =================================================================
// --- Start The Server ---
// =================================================================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});