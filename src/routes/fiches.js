const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/fiches/:lecon_id
router.get('/:lecon_id', async (req, res) => {
  try {
    const { lecon_id } = req.params;
    const result = await pool.query(
      'SELECT * FROM fiche_revision WHERE lecon_id = $1',
      [lecon_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erreur: 'Fiche introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;
