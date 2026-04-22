const express = require('express');
const router = express.Router();
const pool = require('../db');

// Récupérer toutes les matières avec le nb de leçons pour un niveau
router.get('/', async (req, res) => {
  try {
    const niveau = req.query.niveau || 'CE2';
    const result = await pool.query(`
      SELECT m.*, COUNT(l.id)::int AS nb_lecons
      FROM matiere m
      LEFT JOIN lecon l ON l.matiere_id = m.id AND l.niveau = $1
      GROUP BY m.id
      ORDER BY m.nom
    `, [niveau]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// Récupérer les leçons d'une matière pour un niveau
router.get('/:id/lecons', async (req, res) => {
  try {
    const { id } = req.params;
    const niveau = req.query.niveau || 'CE2';
    const result = await pool.query(
      'SELECT * FROM lecon WHERE matiere_id = $1 AND niveau = $2 ORDER BY id',
      [id, niveau]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;