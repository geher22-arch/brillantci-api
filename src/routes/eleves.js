const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inscription
router.post('/inscription', async (req, res) => {
  try {
    const { prenom, nom, ecole, mot_de_passe, classe } = req.body;
    const niveauValide = ['CE1','CE2','CM1','CM2'].includes(classe) ? classe : 'CE2';
    const hash = await bcrypt.hash(mot_de_passe, 10);
    const result = await pool.query(
      `INSERT INTO eleve (prenom, nom, ecole, mot_de_passe, classe)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, prenom, nom, classe`,
      [prenom, nom, ecole, hash, niveauValide]
    );
    res.json({ message: 'Inscription réussie !', eleve: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// Connexion
router.post('/connexion', async (req, res) => {
  try {
    const { prenom, mot_de_passe } = req.body;
    const result = await pool.query(
      'SELECT * FROM eleve WHERE prenom = $1', [prenom]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ erreur: 'Élève non trouvé' });

    const eleve = result.rows[0];
    const valide = await bcrypt.compare(mot_de_passe, eleve.mot_de_passe);
    if (!valide)
      return res.status(401).json({ erreur: 'Mot de passe incorrect' });

    const token = jwt.sign(
      { id: eleve.id, prenom: eleve.prenom },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, eleve: { id: eleve.id, prenom: eleve.prenom, classe: eleve.classe || 'CE2' } });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;