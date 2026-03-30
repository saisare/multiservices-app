-- docker/init.sql
CREATE DATABASE IF NOT EXISTS multiservices;
USE multiservices;

-- Table des utilisateurs
CREATE TABLE utilisateurs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    matricule VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    departement VARCHAR(50) NOT NULL,
    poste VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    photo_profil TEXT,
    langue VARCHAR(10) DEFAULT 'fr',
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion DATETIME,
    actif BOOLEAN DEFAULT TRUE
);

-- Table des clients
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code_client VARCHAR(30) UNIQUE NOT NULL,
    type_client ENUM('PARTICULIER', 'ENTREPRISE') NOT NULL,
    nom VARCHAR(150) NOT NULL,
    prenom VARCHAR(100),
    entreprise VARCHAR(200),
    telephone VARCHAR(20),
    email VARCHAR(150),
    adresse TEXT,
    categorie ENUM('A', 'B', 'C', 'D') DEFAULT 'C',
    commercial_id INT,
    date_inscription DATE,
    FOREIGN KEY (commercial_id) REFERENCES utilisateurs(id)
);

-- Table des services
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_dossier VARCHAR(50) UNIQUE NOT NULL,
    client_id INT NOT NULL,
    type_service ENUM('VOYAGE', 'IMMIGRATION', 'ASSURANCE', 'LOGISTIQUE', 'COMMUNICATION', 'RH', 'BTP') NOT NULL,
    intitule VARCHAR(200) NOT NULL,
    description TEXT,
    montant DECIMAL(10,2),
    statut ENUM('DEVIS', 'CONFIRME', 'EN_COURS', 'TERMINE', 'ANNULE') DEFAULT 'DEVIS',
    assigne_a INT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_debut DATE,
    date_fin DATE,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (assigne_a) REFERENCES utilisateurs(id)
);

-- Insérer un utilisateur admin pour tester
INSERT INTO utilisateurs (
    matricule, nom, prenom, email, departement, poste, password_hash
) VALUES (
    'EMP-001',
    'Admin',
    'System',
    'admin@multiservices.com',
    'DIRECTION',
    'PDG',
    -- Mot de passe: admin123 (hashé avec bcrypt)
    '$2a$12$K9Qc8vW8bB6g5bV5H6jZMeOVf6V5Q5V5Q5V5Q5V5Q5V5Q5V5Q5V5Q5'
);

-- Insérer quelques clients de test
INSERT INTO clients (code_client, type_client, nom, prenom, telephone, email, categorie) VALUES
('CLT-2024-001', 'ENTREPRISE', 'Tech Solutions', NULL, '+33 1 23 45 67 89', 'contact@techsolutions.fr', 'A'),
('CLT-2024-002', 'PARTICULIER', 'Dupont', 'Marie', '+33 6 12 34 56 78', 'marie.dupont@email.com', 'B'),
('CLT-2024-003', 'PARTICULIER', 'Martin', 'Jean', '+33 6 98 76 54 32', 'jean.martin@email.com', 'C');