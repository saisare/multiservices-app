require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'auth_db'
});

console.log('\n📋 USERS TABLE CONTENTS\n');

db.query('SELECT id, email, nom, prenom, actif, role FROM users ORDER BY id', (err, rows) => {
  if(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }

  console.log('Total users:', rows.length, '\n');
  rows.forEach(row => {
    const status = row.actif === 1 ? '✅ ACTIVE' : '⏳ PENDING';
    console.log(`${status} | ${row.email.padEnd(40)} | ${row.nom} ${row.prenom} | ${row.role}`);
  });

  console.log('\n');
  db.end();
});
