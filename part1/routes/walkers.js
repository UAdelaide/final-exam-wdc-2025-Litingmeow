const express = require('express');
const router = express.Router();
const { db } = require('../app');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT username, email FROM Users WHERE role = 'walker'
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch walkers summary' });
  }
});

module.exports = router;
