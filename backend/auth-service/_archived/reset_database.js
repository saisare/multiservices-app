const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  multipleStatements: true
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erreur connexion:', err.message);
    process.exit(1);
  }

  console.log('🔴 ATTENTION: Cela va SUPPRIMER TOUTES les BDs et en recréer 1 seule!');
  console.log('✅ Démarrage du reset de la BD...\n');

  // Lire le fichier SQL
  const sqlPath = path.join(__dirname, 'unified_database.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // Supprimer les anciennes BDs
  const dropQueries = `
    DROP DATABASE IF EXISTS auth_db;
    DROP DATABASE IF EXISTS btp_db;
    DROP DATABASE IF EXISTS assurance_db;
    DROP DATABASE IF EXISTS communication_db;
    DROP DATABASE IF EXISTS communication_db;
    DROP DATABASE IF EXISTS rh_db;
    DROP DATABASE IF EXISTS immigration_db;
    DROP DATABASE IF EXISTS logistique_db;
    DROP DATABASE IF EXISTS voyage_db;
  `;

  console.log('⏳ Suppression des anciennes BDs...');
  db.query(dropQueries, (err) => {
    if (err) console.error('Erreur suppression:', err.message);
    console.log('✅ BDs supprimées');

    console.log('⏳ Création de auth_db...');
    db.query('CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci', (err) => {
      if (err) console.error('Erreur création DB:', err.message);
      console.log('✅ auth_db créée');

      console.log('⏳ Création des tables...');
      db.query(sqlContent, (err) => {
        if (err) {
          console.error('❌ Erreur création tables:', err.message);
          db.end();
          process.exit(1);
        }

        console.log('✅ Tables créées avec succès!\n');

        // Afficher les tables
        db.query('SHOW TABLES FROM auth_db', (err, tables) => {
          console.log('📊 TABLES CRÉÉES:');
          if (!err && tables.length > 0) {
            tables.forEach(t => {
              const tableName = Object.values(t)[0];
              db.query(`SELECT COUNT(*) as cnt FROM auth_db.\`${tableName}\``, (err, cnt) => {
                if (!err) console.log(`  ✓ ${tableName}: ${cnt[0].cnt} rows`);
              });
            });
          }

          setTimeout(() => {
            console.log('\n✅ RESET COMPLET!');
            db.end();
          }, 1000);
        });
      });
    });
  });
});
