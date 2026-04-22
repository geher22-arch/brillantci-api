const express = require('express');
const router = express.Router();
const pool = require('../db');

// Récupérer le profil gamification d'un élève
router.get('/profil/:eleve_id', async (req, res) => {
  try {
    const { eleve_id } = req.params;

    // Total XP
    const xpResult = await pool.query(
      `SELECT COALESCE(SUM(points_obtenus), 0) as xp_total
       FROM reponse r
       JOIN session s ON r.session_id = s.id
       WHERE s.eleve_id = $1`,
      [eleve_id]
    );
    const xp_total = parseInt(xpResult.rows[0].xp_total);
    const niveau = Math.floor(xp_total / 50) + 1;

    // Badges
    const badges = [];
    if (xp_total >= 10)  badges.push({ nom: 'Débutant',    icone: '🌱' });
    if (xp_total >= 50)  badges.push({ nom: 'Apprenti',    icone: '📚' });
    if (xp_total >= 100) badges.push({ nom: 'Savant',      icone: '🔬' });
    if (xp_total >= 200) badges.push({ nom: 'Champion',    icone: '🏆' });
    if (xp_total >= 500) badges.push({ nom: 'Légendaire',  icone: '👑' });

    // Nombre de leçons faites (au moins 1 exercice)
    const leconsResult = await pool.query(
      `SELECT COUNT(DISTINCT e.lecon_id)::int as nb_lecons_faites
       FROM reponse r
       JOIN session s ON r.session_id = s.id
       JOIN exercice e ON r.exercice_id = e.id
       WHERE s.eleve_id = $1`,
      [eleve_id]
    );
    const nb_lecons_faites = leconsResult.rows[0].nb_lecons_faites || 0;
    if (nb_lecons_faites >= 5)  badges.push({ nom: '5 leçons',  icone: '📖' });
    if (nb_lecons_faites >= 20) badges.push({ nom: '20 leçons', icone: '🎓' });

    // Série (nb de jours consécutifs avec au moins 1 réponse)
    const serieResult = await pool.query(
      `SELECT DATE(r.cree_a) as jour
       FROM reponse r
       JOIN session s ON r.session_id = s.id
       WHERE s.eleve_id = $1
       GROUP BY DATE(r.cree_a)
       ORDER BY jour DESC`,
      [eleve_id]
    );
    let serie = 0;
    const jours = serieResult.rows.map(r => r.jour.toISOString().slice(0, 10));
    const today = new Date().toISOString().slice(0, 10);
    for (let i = 0; i < jours.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (jours[i] === expected.toISOString().slice(0, 10)) serie++;
      else break;
    }
    if (serie >= 3) badges.push({ nom: '3 jours', icone: '🔥' });
    if (serie >= 7) badges.push({ nom: '7 jours', icone: '⚡' });

    // Progression par matière
    const progression = await pool.query(
      `SELECT m.nom as matiere,
              COUNT(r.id)::int as exercices_faits,
              SUM(CASE WHEN r.est_correcte THEN 1 ELSE 0 END)::int as bonnes_reponses,
              COUNT(DISTINCT e.lecon_id)::int as lecons_faites
       FROM reponse r
       JOIN session s ON r.session_id = s.id
       JOIN exercice e ON r.exercice_id = e.id
       JOIN lecon l ON e.lecon_id = l.id
       JOIN matiere m ON l.matiere_id = m.id
       WHERE s.eleve_id = $1
       GROUP BY m.nom`,
      [eleve_id]
    );

    res.json({ xp_total, niveau, badges, serie, nb_lecons_faites, progression: progression.rows });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// Classement général
router.get('/classement', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.prenom, e.nom,
              COALESCE(SUM(r.points_obtenus), 0) as xp_total
       FROM eleve e
       LEFT JOIN session s ON s.eleve_id = e.id
       LEFT JOIN reponse r ON r.session_id = s.id
       GROUP BY e.id, e.prenom, e.nom
       ORDER BY xp_total DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;