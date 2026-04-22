const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:3001').split(',').map(o => o.trim());
    const isAllowed = allowed.some(o => origin.startsWith(o))
      || origin.endsWith('.netlify.app')
      || origin === 'http://localhost:3001';
    callback(isAllowed ? null : new Error('Non autorisé par CORS'), isAllowed);
  },
  credentials: true,
}));
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API Révision CE2 - Côte d\'Ivoire 🎓' });
});

// Routes
const eleveRoutes = require('./routes/eleves');
const matiereRoutes = require('./routes/matieres');
const exerciceRoutes = require('./routes/exercices');
const gamificationRoutes = require('./routes/gamification');
const ficheRoutes = require('./routes/fiches');

app.use('/api/eleves', eleveRoutes);
app.use('/api/matieres', matiereRoutes);
app.use('/api/exercices', exerciceRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/fiches', ficheRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});