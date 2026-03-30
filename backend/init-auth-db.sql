#!/bin/bash
# Script pour initialiser la base de données auth_db avec des utilisateurs de test

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="auth_db"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Initialization de auth_db ===${NC}"

# SQL pour nettoyer et créer les tables
SQL_INIT="
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
  INDEX (role)
);

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
);

-- Créer la table notifications
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  recipient_id INT,
  sender_id INT,
  title VARCHAR(200),
  message TEXT,
  data JSON,
  is_read TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (recipient_id),
  INDEX (created_at)
);

-- Insérer des utilisateurs de test
-- Admin avec mot de passe: Blg1app23@
INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, actif, hidden)
VALUES ('ADM001', 'Admin', 'BLG', 'admin@blg-engineering.com', '+33600000000', 'IT', 'Administrateur', 'admin', 'Blg1app23@', 1, 0);

-- Directeur avec mot de passe: Director2@
INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, actif, hidden)
VALUES ('DIR001', 'Martin', 'Jean', 'jean.martin@blg-engineering.com', '+33600000001', 'BTP', 'Directeur', 'directeur', 'Director2@', 1, 0);

-- Secrétaire avec mot de passe: Secr2@
INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, actif, hidden)
VALUES ('SEC001', 'Durand', 'Marie', 'marie.durand@blg-engineering.com', '+33600000002', 'RH', 'Secrétaire', 'secretaire', 'Secr2@', 1, 0);

-- Employé ordinaire avec mot de passe: Emp1@
INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, actif, hidden)
VALUES ('EMP001', 'Dupont', 'Pierre', 'pierre.dupont@blg-engineering.com', '+33600000003', 'BTP', 'Ingénieur', 'employee', 'Emp1@', 1, 0);

SELECT 'Initialisation terminée' AS status;
"

# Exécuter le script SQL
echo -e "${YELLOW}Exécution du script d'initialisation...${NC}"

mysql -h "$DB_HOST" -u "$DB_USER" ${DB_PASSWORD:+-p$DB_PASSWORD} -P "$DB_PORT" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Base de données créée/existante${NC}"
else
    echo -e "${RED}❌ Erreur lors de la création de la base de données${NC}"
    exit 1
fi

# Exécuter le script d'initialisation
echo "$SQL_INIT" | mysql -h "$DB_HOST" -u "$DB_USER" ${DB_PASSWORD:+-p$DB_PASSWORD} -P "$DB_PORT" "$DB_NAME" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Tables créées et utilisateurs importés${NC}"
    echo ""
    echo -e "${YELLOW}=== Compte de test disponibles ===${NC}"
    echo "1. Admin:"
    echo "   Email: admin@blg-engineering.com"
    echo "   Password: Blg1app23@"
    echo ""
    echo "2. Directeur:"
    echo "   Email: jean.martin@blg-engineering.com"
    echo "   Password: Director2@"
    echo ""
    echo "3. Secrétaire:"
    echo "   Email: marie.durand@blg-engineering.com"
    echo "   Password: Secr2@"
    echo ""
    echo "4. Employé:"
    echo "   Email: pierre.dupont@blg-engineering.com"
    echo "   Password: Emp1@"
    echo ""
else
    echo -e "${RED}❌ Erreur lors de l'initialisation des tables${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Initialisation terminée avec succès${NC}"
