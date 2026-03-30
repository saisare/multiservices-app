// Script pour initialiser la base de données auth_db avec des utilisateurs de test
// Usage: node init-auth-db.js

require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'mysql'
});

const dbName = 'auth_db';

db.connect(err => {
  if (err) {
    console.error('❌ Erreur connexion:', err.message);
    process.exit(1);
  }
  console.log('✅ Connecté à MySQL');
  initializeDatabase();
});

function initializeDatabase() {
  // D'abord créer la base de données
  db.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (err) => {
    if (err) {
      console.error('❌ Erreur création DB:', err.message);
      db.end();
      process.exit(1);
    }
    console.log(`✅ Base de données '${dbName}' créée/existante`);

    // Se connecter à la base nouvellement créée
    db.changeUser({ database: dbName }, (err) => {
      if (err) {
        console.error('❌ Erreur changement BD:', err);
        db.end();
        process.exit(1);
      }
      dropExistingTables();
    });
  });
}

function dropExistingTables() {
  const dropSql = `
    DROP TABLE IF EXISTS notifications;
    DROP TABLE IF EXISTS pending_users;
    DROP TABLE IF EXISTS users;
  `;
  
  db.query('DROP TABLE IF EXISTS notifications', (err) => {
    if (err && err.code !== 'ER_BAD_TABLE_ERROR') console.error('Drop notifications:', err);
    
    db.query('DROP TABLE IF EXISTS pending_users', (err) => {
      if (err && err.code !== 'ER_BAD_TABLE_ERROR') console.error('Drop pending_users:', err);
      
      db.query('DROP TABLE IF EXISTS users', (err) => {
        if (err && err.code !== 'ER_BAD_TABLE_ERROR') console.error('Drop users:', err);
        createTables();
      });
    });
  });
}

function createTables() {
  console.log('📝 Création des tables...');
  
  // Créer la table users
  const createUsersSql = `
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      matricule VARCHAR(50) UNIQUE,
      nom VARCHAR(100) NOT NULL,
      prenom VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      telephone VARCHAR(20),
      departement VARCHAR(100) NOT NULL,
      poste VARCHAR(100),
      role ENUM('admin', 'directeur', 'secretaire', 'employee') NOT NULL DEFAULT 'employee',
      password_hash VARCHAR(255) NOT NULL,
      actif TINYINT DEFAULT 1,
      hidden TINYINT DEFAULT 0,
      date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      dernier_login TIMESTAMP NULL,
      INDEX (email),
      INDEX (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  db.query(createUsersSql, (err) => {
    if (err) {
      console.error('❌ Erreur création table users:', err.message);
      db.end();
      process.exit(1);
    }
    console.log('✅ Table users créée');

    // Créer la table pending_users
    const createPendingSql = `
      CREATE TABLE pending_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        telephone VARCHAR(20),
        poste VARCHAR(100),
        departement VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP NULL,
        approved_by INT,
        INDEX (email),
        INDEX (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    db.query(createPendingSql, (err) => {
      if (err) {
        console.error('❌ Erreur création table pending_users:', err.message);
        db.end();
        process.exit(1);
      }
      console.log('✅ Table pending_users créée');

      // Créer la table notifications
      const createNotifSql = `
        CREATE TABLE notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          type VARCHAR(50) NOT NULL,
          recipient_id INT,
          sender_id INT,
          title VARCHAR(200),
          message TEXT COLLATE utf8mb4_unicode_ci,
          data JSON,
          is_read TINYINT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX (recipient_id),
          INDEX (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;

      db.query(createNotifSql, (err) => {
        if (err) {
          console.error('❌ Erreur création table notifications:', err.message);
          db.end();
          process.exit(1);
        }
        console.log('✅ Table notifications créée');
        insertTestUsers();
      });
    });
  });
}

function insertTestUsers() {
  console.log('👥 Insertion des utilisateurs de test...');

  const users = [
    {
      matricule: 'ADM001',
      nom: 'Admin',
      prenom: 'BLG',
      email: 'admin@blg-engineering.com',
      telephone: '+33600000000',
      departement: 'IT',
      poste: 'Administrateur',
      role: 'admin',
      password: 'Blg1app23@'
    },
    {
      matricule: 'DIR001',
      nom: 'Martin',
      prenom: 'Jean',
      email: 'jean.martin@blg-engineering.com',
      telephone: '+33600000001',
      departement: 'BTP',
      poste: 'Directeur',
      role: 'directeur',
      password: 'Director2@'
    },
    {
      matricule: 'SEC001',
      nom: 'Durand',
      prenom: 'Marie',
      email: 'marie.durand@blg-engineering.com',
      telephone: '+33600000002',
      departement: 'RH',
      poste: 'Secrétaire',
      role: 'secretaire',
      password: 'Secr2@'
    },
    {
      matricule: 'EMP001',
      nom: 'Dupont',
      prenom: 'Pierre',
      email: 'pierre.dupont@blg-engineering.com',
      telephone: '+33600000003',
      departement: 'BTP',
      poste: 'Ingénieur',
      role: 'employee',
      password: 'Emp1@'
    }
  ];

  let insertedCount = 0;

  users.forEach((user, index) => {
    const sql = `
      INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, actif, hidden)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
    `;

    db.query(sql, [
      user.matricule, user.nom, user.prenom, user.email, user.telephone,
      user.departement, user.poste, user.role, user.password
    ], (err) => {
      if (err) {
        console.error(`❌ Erreur insertion ${user.email}:`, err.message);
      } else {
        insertedCount++;
        console.log(`✅ ${user.email} (${user.role}) inséré`);
      }

      if (insertedCount === users.length) {
        displayResults();
      }
    });
  });
}

function displayResults() {
  console.log('\n' + '='.repeat(60));
  console.log('✅ INITIALISATION TERMINÉE');
  console.log('='.repeat(60));
  console.log('\n📋 Comptes de test disponibles:\n');

  const testAccounts = [
    { email: 'admin@blg-engineering.com', password: 'Blg1app23@', role: 'Admin' },
    { email: 'jean.martin@blg-engineering.com', password: 'Director2@', role: 'Directeur' },
    { email: 'marie.durand@blg-engineering.com', password: 'Secr2@', role: 'Secrétaire' },
    { email: 'pierre.dupont@blg-engineering.com', password: 'Emp1@', role: 'Employé' }
  ];

  testAccounts.forEach((acc, i) => {
    console.log(`${i + 1}. ${acc.role}`);
    console.log(`   Email: ${acc.email}`);
    console.log(`   Password: ${acc.password}\n`);
  });

  console.log('='.repeat(60));
  console.log('🚀 Vous pouvez maintenant vous connecter à l\'application!\n');

  db.end();
  process.exit(0);
}
