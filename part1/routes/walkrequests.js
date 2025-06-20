const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM WalkRequests WHERE status = 'open'
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve open walk requests' });
  }
});

module.exports = router;