// Génère un fichier SQL avec toutes les données (matieres, lecons, exercices)
const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST, port: process.env.DB_PORT,
  database: process.env.DB_NAME, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

function escape(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function exportData() {
  let sql = '-- BrillantCI - Données initiales\n-- Généré le ' + new Date().toISOString() + '\n\n';

  const matieres = await pool.query('SELECT * FROM matiere ORDER BY nom');
  sql += '-- Matières\n';
  for (const m of matieres.rows) {
    sql += `INSERT INTO matiere (id, nom, couleur, icone) VALUES (${escape(m.id)}, ${escape(m.nom)}, ${escape(m.couleur)}, ${escape(m.icone)}) ON CONFLICT (id) DO NOTHING;\n`;
  }

  const lecons = await pool.query('SELECT * FROM lecon ORDER BY matiere_id, id');
  sql += '\n-- Leçons\n';
  for (const l of lecons.rows) {
    sql += `INSERT INTO lecon (id, matiere_id, titre, niveau, ordre, contenu) VALUES (${escape(l.id)}, ${escape(l.matiere_id)}, ${escape(l.titre)}, ${escape(l.niveau)}, ${l.ordre}, ${escape(l.contenu)}) ON CONFLICT (id) DO NOTHING;\n`;
  }

  const exercices = await pool.query('SELECT * FROM exercice ORDER BY lecon_id, id');
  sql += '\n-- Exercices\n';
  for (const e of exercices.rows) {
    sql += `INSERT INTO exercice (id, lecon_id, type, enonce, options, bonne_reponse, points) VALUES (${escape(e.id)}, ${escape(e.lecon_id)}, ${escape(e.type)}, ${escape(e.enonce)}, ${escape(e.options)}, ${escape(e.bonne_reponse)}, ${e.points}) ON CONFLICT (id) DO NOTHING;\n`;
  }

  fs.writeFileSync('data_export.sql', sql, 'utf8');
  console.log(`Export terminé : ${matieres.rows.length} matières, ${lecons.rows.length} leçons, ${exercices.rows.length} exercices`);
  console.log('Fichier créé : data_export.sql');
  await pool.end();
}

exportData().catch(console.error);
