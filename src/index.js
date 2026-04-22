const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3001').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o.trim()))) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
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

app.use('/api/eleves', eleveRoutes);
app.use('/api/matieres', matiereRoutes);
app.use('/api/exercices', exerciceRoutes);
app.use('/api/gamification', gamificationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});