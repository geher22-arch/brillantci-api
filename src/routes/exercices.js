const express = require('express');
const router = express.Router();
const pool = require('../db');

// Récupérer les exercices d'une leçon
router.get('/lecon/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM exercice WHERE lecon_id = $1 ORDER BY RANDOM()',
      [id]
    );
    const exercices = result.rows.map(e => ({
      id:            e.id,
      lecon_id:      e.lecon_id,
      question:      e.enonce,
      bonne_reponse: e.bonne_reponse,
      points:        e.points,
      choix:         e.options?.choix      || [],
      bonne:         e.options?.bonne      ?? -1,
      explication:   e.options?.explication || '',
    }));
    res.json(exercices);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// Vérifier une réponse et attribuer les points
router.post('/repondre', async (req, res) => {
  try {
    const { session_id, exercice_id, reponse_eleve } = req.body;

    const ex = await pool.query(
      'SELECT * FROM exercice WHERE id = $1', [exercice_id]
    );
    const exercice = ex.rows[0];
    const est_correcte = reponse_eleve.trim().toLowerCase() === 
                         exercice.bonne_reponse.trim().toLowerCase();
    const points_obtenus = est_correcte ? exercice.points : 0;

    await pool.query(
      `INSERT INTO reponse (session_id, exercice_id, reponse_eleve, est_correcte, points_obtenus)
       VALUES ($1, $2, $3, $4, $5)`,
      [session_id, exercice_id, reponse_eleve, est_correcte, points_obtenus]
    );

    res.json({ est_correcte, points_obtenus });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;