require('dotenv').config();
const pool = require('./src/db');
const fs = require('fs');

async function check() {
  const r = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='exercice' ORDER BY ordinal_position"
  );
  const output = r.rows.map(c => c.column_name + ' : ' + c.data_type).join('\n');
  console.log('=== TABLE EXERCICE ===');
  console.log(output);

  const r2 = await pool.query('SELECT * FROM exercice LIMIT 2');
  console.log('\n=== DONNÉES EXISTANTES ===');
  console.log(JSON.stringify(r2.rows, null, 2));

  fs.writeFileSync('schema_result.txt', output + '\n\n' + JSON.stringify(r2.rows, null, 2));
  console.log('\nRésultat sauvegardé dans schema_result.txt');
  pool.end();
}

check().catch(e => { console.error(e.message); pool.end(); });
