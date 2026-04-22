const express = require('express');
const router = express.Router();
const pool = require('../db');

// Récupérer toutes les matières avec le nb de leçons
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, COUNT(l.id)::int AS nb_lecons
      FROM matiere m
      LEFT JOIN lecon l ON l.matiere_id = m.id
      GROUP BY m.id
      ORDER BY m.nom
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// Récupérer les leçons d'une matière
router.get('/:id/lecons', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM lecon WHERE matiere_id = $1 ORDER BY id',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;