require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'auth_db',
  multipleStatements: true
});

const email = `debug-${Date.now()}@test.com`;

console.log('\n🔍 DEBUG: Testing registration email check\n');
console.log(`Email to test: ${email}\n`);

// Test the SELECT query
db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
  if(err) {
    console.log(`❌ SQL Error: ${err.message}`);
  } else {
    console.log(`SELECT Results: ${results.length} rows`);
    if(results.length > 0) {
      console.log('   Found:', results);
    } else {
      console.log('   ✅ Email NOT found (good for registration)\n');
    }
  }

  // Now try INSERT
  console.log(`Attempting INSERT...\n`);
  db.query(
    `INSERT INTO users (nom, prenom, email, telephone, departement, poste, role, password_hash, actif, hidden, date_creation)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NOW())`,
    ['Test', 'User', email, '0612345678', 'voyage', 'Ouvrier', 'employee', 'TestPass123@'],
    (err, result) => {
      if(err) {
        console.log(`❌ INSERT Error: ${err.message}`);
        console.log(`   Code: ${err.code}`);
      } else {
        console.log(`✅ INSERT successful!`);
        console.log(`   New ID: ${result.insertId}`);
        console.log(`   Affected rows: ${result.affectedRows}\n`);
      }
      
      db.end();
    }
  );
});
