const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erreur connexion:', err.message);
    process.exit(1);
  }
  console.log('✅ Connecté à MySQL\n');

  db.query("SHOW DATABASES", (err, results) => {
    console.log('📊 BASES DE DONNÉES:');
    results.forEach(r => {
      const dbName = Object.values(r)[0];
      if (!['mysql', 'information_schema', 'performance_schema', 'sys'].includes(dbName)) {
        console.log('  ✓', dbName);
      }
    });

    db.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'auth_db'", (err, tables) => {
      console.log('\n📋 TABLES DANS auth_db:');
      if (!err && tables.length > 0) {
        tables.forEach(t => console.log('  ✓', t.TABLE_NAME));
        
        db.query("SELECT id, email, role, nom, prenom, departement, actif FROM auth_db.users", (err, users) => {
          console.log('\n👥 COMPTES ACTIFS:', users ? users.length : 0);
          if (users && users.length > 0) {
            users.forEach(u => {
              console.log(`  ${u.id}. ${u.email} (${u.role}) - ${u.nom} ${u.prenom} - ${u.departement} ${u.actif ? '✓' : '✗'}`);
            });
          }
          
          db.query("SELECT id, email, nom, prenom, departement, status FROM auth_db.pending_users", (err, pending) => {
            console.log('\n⏳ COMPTES EN ATTENTE:', pending ? pending.length : 0);
            if (pending && pending.length > 0) {
              pending.forEach(p => {
                console.log(`  ${p.id}. ${p.email} (${p.departement}) - ${p.status}`);
              });
            }
            db.end();
          });
        });
      } else {
        console.log('  ❌ auth_db not found');
        db.end();
      }
    });
  });
});
