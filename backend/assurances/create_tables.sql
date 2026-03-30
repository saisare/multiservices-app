-- create_tables.sql pour service assurances
-- À exécuter dans phpMyAdmin (localhost:8081) ou MySQL après init.SQL

USE assurance_db;

-- Table des clients assurances
CREATE TABLE IF NOT EXISTS clients_assurances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    telephone VARCHAR(20),
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des contrats d'assurance
CREATE TABLE IF NOT EXISTS contrats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    type_assurance VARCHAR(100) NOT NULL,
    montant_couverture DECIMAL(12, 2) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,
    statut ENUM('ACTIF', 'EXPIRÉ', 'ANNULÉ') DEFAULT 'ACTIF',
    prime DECIMAL(10, 2) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients_assurances(id) ON DELETE CASCADE,
    INDEX (client_id),
    INDEX (statut)
);

-- Table des sinistres
CREATE TABLE IF NOT EXISTS sinistres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contrat_id INT NOT NULL,
    date_sinistre DATE NOT NULL,
    description TEXT,
    montant_reclamation DECIMAL(12, 2),
    statut ENUM('EN_COURS', 'APPROUVÉ', 'REJETÉ', 'PAYÉ') DEFAULT 'EN_COURS',
    date_declaration TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contrat_id) REFERENCES contrats(id) ON DELETE CASCADE,
    INDEX (contrat_id),
    INDEX (statut)
);

-- Table assurés (alias)
CREATE TABLE IF NOT EXISTS assures (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code
