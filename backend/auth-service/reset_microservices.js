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

  console.log('🔴 RÉINITIALISATION BD MICROSERVICES');
  console.log('Version: Chaque service sa BD + auth_db centralisée\n');

  // Lire le fichier SQL
  const sqlPath = path.join(__dirname, '../microservices_database.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // Supprimer les ANCIENNES BDs
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

  console.log('⏳ ÉTAPE 1: Suppression des anciennes BDs...');
  db.query(dropQueries, (err) => {
    if (err) console.error('Erreur suppression:', err.message);
    console.log('✅ Anciennes BDs supprimées');

    console.log('\n⏳ ÉTAPE 2: Création des BDs MICROSERVICES...');
    db.query(sqlContent, (err) => {
      if (err) {
        console.error('❌ Erreur création BDs:', err.message);
        db.end();
        process.exit(1);
      }

      console.log('✅ BDs créées avec succès!\n');

      // Vérifier les BDs créées
      db.query(`SHOW DATABASES LIKE '%_db'`, (err, databases) => {
        console.log('📊 BDS CRÉÉES:');
        databases.forEach(d => {
          const dbName = Object.values(d)[0];
          if (!['mysql', 'information_schema', 'performance_schema', 'sys'].includes(dbName)) {
            console.log(`  ✓ ${dbName}`);
          }
        });

        // Vérifier les users
        db.query('SELECT id, email, role, nom, prenom FROM auth_db.users', (err, users) => {
          console.log('\n👥 COMPTES DE TEST (auth_db.users):');
          if (!err && users.length > 0) {
            users.forEach(u => {
              console.log(`  ${u.id}. ${u.email} (${u.role}) - ${u.prenom} ${u.nom}`);
            });
          }

          // Vérifier les chantiers
          db.query('SELECT id, code_chantier, nom FROM btp_db.chantiers', (err, chantiers) => {
            console.log('\n🏗️  CHANTIERS TEST (btp_db.chantiers):');
            if (!err && chantiers.length > 0) {
              chantiers.forEach(c => {
                console.log(`  ${c.id}. ${c.code_chantier} - ${c.nom}`);
              });
            }

            console.log('\n✅ RÉINITIALISATION COMPLÈTE!');
            console.log('\n🔐 Comptes de test:');
            console.log('  Admin: admin@blg-engineering.com / Blg1app23@');
            console.log('  Directeur: jean.martin@blg-engineering.com / Director2@');
            console.log('  Secrétaire: marie.durand@blg-engineering.com / Secr2@');
            console.log('\n⚙️  Configuration des services:');
            console.log('  - auth_db: pour authentification + users');
            console.log('  - btp_db: pour données BTP');
            console.log('  - assurance_db: pour données assurances');
            console.log('  - rh_db: pour données RH');
            console.log('  - voyage_db: pour données voyage');
            console.log('  - immigration_db: pour données immigration');
            console.log('  - communication_db: pour données communication');
            console.log('  - logistique_db: pour données logistique');
            console.log('\nChaque service reste ISOLÉ = Sécurité renforcée!\n');

            db.end();
          });
        });
      });
    });
  });
});
