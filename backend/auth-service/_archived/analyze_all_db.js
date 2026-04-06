const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost', port: 3306, user: 'root', password: '',
});

db.connect(() => {
  const databases = [
    'auth_db', 'btp_db', 'assurance_db', 'communication_db', 
    'rh_db', 'immigration_db', 'logistique_db', 'voyage_db'
  ];

  console.log('🔍 ANALYSE COMPLÈTE DE TOUTES LES BASES\n');

  let processed = 0;
  databases.forEach(dbName => {
    db.query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`, [dbName], (err, tables) => {
      console.log(`\n${dbName}:`);
      if (err || !tables || tables.length === 0) {
        console.log('  ❌ Vide ou erreur');
      } else {
        tables.forEach(t => {
          const tableName = t.TABLE_NAME;
          db.query(`SELECT COUNT(*) as cnt FROM ${dbName}.${tableName}`, (err, cnt) => {
            if (!err) {
              console.log(`  - ${tableName}: ${cnt[0].cnt} rows`);
            }
          });
        });
      }
      processed++;
      if (processed === databases.length) {
        setTimeout(() => db.end(), 500);
      }
    });
  });
});
