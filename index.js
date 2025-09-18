const express = require('express');
const bcrypt = require('bcrypt'); // <-- Import bcrypt

const app = express();
const PORT = 3001;

// This is a crucial piece of "middleware".
// It tells Express to automatically parse incoming JSON data for us.
app.use(express.json());

// --- Our Routes ---

// 1. Health Check Route (from before)
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    message: "CARIVIO API is running!"
  });
});

// 2. NEW: User Registration Route
app.post('/api/auth/register', async (req, res) => {
  // Get the user data from the incoming request body
  const { fullName, email, password, phoneNumber } = req.body;

  // --- Input Validation (simple version) ---
  if (!email || !password || !fullName) {
    // If any key data is missing, send a "Bad Request" error
    return res.status(400).json({ message: "Full name, email, and password are required." });
  }

  try {
    // --- Password Hashing ---
    const saltRounds = 10; // A standard value for the "work factor"
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // --- Database Logic (Simulated) ---
    // In the future, we would save the user to the database here.
    // For now, let's just log it to the console to prove it works.
    console.log("New user to be created:");
    console.log({
      fullName,
      email,
      passwordHash, // We log the HASHED password, not the original!
      phoneNumber
    });

    // Send a success response back to the client
    res.status(201).json({
      message: "User registered successfully!",
      user: { fullName, email } // Don't send the password hash back
    });

  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// --- NEW: Get All Colleges Route ---
app.get('/api/colleges', async (req, res) => {
  try {
    const allColleges = await pool.query("SELECT * FROM colleges");
    res.json(allColleges.rows);
  } catch (error) {
    console.error("Error fetching colleges:", error);
    res.status(500).json({ message: "Server error while fetching colleges." });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});