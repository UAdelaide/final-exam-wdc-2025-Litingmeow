const express = require('express');
const router = express.Router();
const { db } = require('../app');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT dog_id, name, size FROM Dogs
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

module.exports = router;
