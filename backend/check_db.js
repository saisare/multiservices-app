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

  // Lister les bases de données
  db.query("SHOW DATABASES", (err, results) => {
    if (err) console.error(err);
    console.log('📊 BASES DE DONNÉES:');
    results.forEach(r => {
      const dbName = Object.values(r)[0];
      if (!['mysql', 'information_schema', 'performance_schema', 'sys'].includes(dbName)) {
        console.log('  ✓', dbName);
      }
    });

    // Vérifier les tables
    console.log('\n📋 TABLES DANS auth_db:');
    db.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'auth_db'", (err, tables) => {
      if (!err && tables.length > 0) {
        tables.forEach(t => console.log('  ✓', t.TABLE_NAME));
        
        // Compter les utilisateurs
        db.query("SELECT COUNT(*) as count FROM auth_db.users", (err, cnt) => {
          if (!err) {
            console.log('\n👥 COMPTES DANS users:', cnt[0].count);
            
            // Lister les comptes
            db.query("SELECT id, email, role, nom, prenom, departement, actif FROM auth_db.users", (err, users) => {
              if (!err) {
                console.log('\n📝 DÉTAIL DES COMPTES:');
                users.forEach(u => {
                  console.log(`  ${u.id}. ${u.email} (${u.role}) - ${u.nom} ${u.prenom} - ${u.departement} ${u.actif ? '✓' : '✗'}`);
                });
              }
              
              // Vérifier les comptes en attente dans users (actif = 0)
              db.query("SELECT COUNT(*) as count FROM auth_db.users WHERE actif = 0", (err, cnt) => {
                if (!err) {
                  console.log('\n⏳ COMPTES EN ATTENTE (users.actif = 0):', cnt[0].count);
                  db.query("SELECT id, email, nom, prenom, departement, actif FROM auth_db.users WHERE actif = 0", (err, pending) => {
                    if (!err && pending.length > 0) {
                      pending.forEach(p => {
                        console.log(`  ${p.id}. ${p.email} (${p.departement}) - Actif: ${p.actif}`);
                      });
                    }
                    db.end();
                  });
                } else {
                  db.end();
                }
              });
            });
          }
        });
      } else {
        console.log('  ❌ Aucune table ou BD inexistante');
        db.end();
      }
    });
  });
});
