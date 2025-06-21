const express = require('express');
const router = express.Router();
const db = require('../models/db');


// GET all users (for admin/testing)
// router.get('/', async (req, res) => {
//   try {
//     const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
//     res.json(rows);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch users' });
//   }
// });

// // POST a new user (simple signup)
// router.post('/register', async (req, res) => {
//   const { username, email, password, role } = req.body;

//   try {
//     const [result] = await db.query(`
//       INSERT INTO Users (username, email, password_hash, role)
//       VALUES (?, ?, ?, ?)
//     `, [username, email, password, role]);

//     res.status(201).json({ message: 'User registered', user_id: result.insertId });
//   } catch (error) {
//     res.status(500).json({ error: 'Registration failed' });
//   }
// });

// POST login with session
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Query the database for a user with the provided username
    const [rows] = await db.query(`
      SELECT user_id, username, email, password_hash, role FROM Users
      WHERE username = ?
    `, [username]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = rows[0];

    // Compare password hash
    const isMatch = password === user.password_hash;
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Store user info in session
    req.session.user = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.json({ message: 'Login successful', role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET current session user
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// // POST login (dummy version)
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const [rows] = await db.query(`
//       SELECT user_id, username, role FROM Users
//       WHERE email = ? AND password_hash = ?
//     `, [email, password]);

//     if (rows.length === 0) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     res.json({ message: 'Login successful', user: rows[0] });
//   } catch (error) {
//     res.status(500).json({ error: 'Login failed' });
//   }
// });

module.exports = router;