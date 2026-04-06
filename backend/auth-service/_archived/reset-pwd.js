require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'auth_db',
  charset: 'utf8mb4'
});

console.log('\n🔐 RESETTING ADMIN & DIRECTOR PASSWORDS\n');

const accounts = [
  { email: 'admin@blg-engineering.com', password: 'BtpAdmin2026@' },
  { email: 'directeur@blg-engineering.com', password: 'DirectorBTP2026@' }
];

db.connect(err => {
  if(err) { console.error('❌', err.message); process.exit(1); }

  accounts.forEach(acc => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(acc.password, salt);
    
    db.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [hash, acc.email],
      (err, result) => {
        if(err) console.log('❌', err.message);
        else {
          console.log(`✅ ${acc.email}`);
          console.log(`   Password: ${acc.password}`);
          console.log(`   Updated: ${result.affectedRows} row(s)\n`);
        }
      }
    );
  });

  setTimeout(() => { db.end(); }, 500);
});
