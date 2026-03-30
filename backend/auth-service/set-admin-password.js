const mysql = require('mysql2');
const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'auth_db' });

db.query("UPDATE users SET password_hash = 'Blg1app23@' WHERE role = 'admin'", (err, result) => {
  if (err) {
    console.error('Erreur update admin password', err);
    process.exit(1);
  }
  console.log('Admin password changed');
  db.end();
});
