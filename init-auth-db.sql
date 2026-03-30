-- Initialiser auth_db avec utilisateurs de test
-- Exécutez ceci avec: mysql -h localhost -u root < init-auth-db.sql

CREATE DATABASE IF NOT EXISTS auth_db;
USE auth_db;

-- Supprimer les tables existantes
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS pending_users;
DROP TABLE IF EXISTS users;

-- Créer la table users
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
  INDEX (role),
  INDEX (actif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Créer la table pending_users
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

-- Créer la table notifications
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  recipient_id INT,
  sender_id INT,
  title VARCHAR(200),
  message LONGTEXT COLLATE utf8mb4_unicode_ci,
  data JSON,
  is_read TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (recipient_id),
  INDEX (sender_id),
  INDEX (created_at),
  INDEX (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insérer les utilisateurs de test
INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, actif, hidden)
VALUES 
  ('ADM001', 'Admin', 'BLG', 'admin@blg-engineering.com', '+33600000000', 'IT', 'Administrateur', 'admin', 'Blg1app23@', 1, 0),
  ('DIR001', 'Martin', 'Jean', 'jean.martin@blg-engineering.com', '+33600000001', 'BTP', 'Directeur', 'directeur', 'Director2@', 1, 0),
  ('SEC001', 'Durand', 'Marie', 'marie.durand@blg-engineering.com', '+33600000002', 'RH', 'Secrétaire', 'secretaire', 'Secr2@', 1, 0),
  ('EMP001', 'Dupont', 'Pierre', 'pierre.dupont@blg-engineering.com', '+33600000003', 'BTP', 'Ingénieur', 'employee', 'Emp1@', 1, 0);

SELECT '✅ Initialisation terminée' AS status;
SELECT 'Utilisateurs créés:' AS info;
SELECT email, role, password_hash FROM users;
