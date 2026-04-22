-- BrillantCI - Schema PostgreSQL
-- A executer sur la base de donnees Render apres creation

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS matiere (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(100) NOT NULL,
  couleur VARCHAR(20) NOT NULL DEFAULT '#378ADD',
  icone VARCHAR(50) NOT NULL DEFAULT 'livre'
);

CREATE TABLE IF NOT EXISTS lecon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matiere_id UUID NOT NULL REFERENCES matiere(id) ON DELETE CASCADE,
  titre VARCHAR(200) NOT NULL,
  niveau VARCHAR(20) NOT NULL DEFAULT 'CE2',
  ordre INTEGER NOT NULL DEFAULT 1,
  contenu TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exercice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecon_id UUID NOT NULL REFERENCES lecon(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  enonce TEXT NOT NULL,
  options JSONB,
  bonne_reponse TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS eleve (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom VARCHAR(100) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  classe VARCHAR(20) NOT NULL DEFAULT 'CE2',
  ecole VARCHAR(200),
  mot_de_passe VARCHAR(255) NOT NULL,
  date_inscription DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eleve_id UUID NOT NULL REFERENCES eleve(id) ON DELETE CASCADE,
  debut TIMESTAMP NOT NULL DEFAULT now(),
  fin TIMESTAMP,
  score_total INTEGER NOT NULL DEFAULT 0,
  duree_secondes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reponse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES session(id) ON DELETE CASCADE,
  exercice_id UUID NOT NULL REFERENCES exercice(id) ON DELETE CASCADE,
  reponse_eleve TEXT NOT NULL,
  est_correcte BOOLEAN NOT NULL DEFAULT false,
  points_obtenus INTEGER NOT NULL DEFAULT 0,
  cree_a TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eleve_id UUID NOT NULL REFERENCES eleve(id) ON DELETE CASCADE,
  lecon_id UUID NOT NULL REFERENCES lecon(id) ON DELETE CASCADE,
  score_moyen INTEGER NOT NULL DEFAULT 0,
  nb_tentatives INTEGER NOT NULL DEFAULT 0,
  completee BOOLEAN NOT NULL DEFAULT false,
  derniere_activite TIMESTAMP NOT NULL DEFAULT now()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_lecon_matiere ON lecon(matiere_id);
CREATE INDEX IF NOT EXISTS idx_exercice_lecon ON exercice(lecon_id);
CREATE INDEX IF NOT EXISTS idx_session_eleve ON session(eleve_id);
CREATE INDEX IF NOT EXISTS idx_reponse_session ON reponse(session_id);
CREATE INDEX IF NOT EXISTS idx_progression_eleve ON progression(eleve_id);
