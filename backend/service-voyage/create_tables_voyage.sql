-- ================================================
-- CRÉATION SCHÉMA VOYAGE SERVICE
-- ================================================
-- À exécuter dans phpMyAdmin ou MySQL

USE voyage_db;

-- ================================================
-- TABLE CLIENTS VOYAGE
-- ================================================
CREATE TABLE IF NOT EXISTS clients_voyage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_client VARCHAR(30) UNIQUE NOT NULL,
    type_client ENUM('PARTICULIER', 'GROUPE', 'ENTREPRISE') DEFAULT 'PARTICULIER',
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    email VARCHAR(150),
    telephone VARCHAR(20),
    adresse TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE,
    INDEX idx_code (code_client),
    INDEX idx_type (type_client)
) ENGINE=InnoDB;

-- ================================================
-- TABLE DESTINATIONS
-- ================================================
CREATE TABLE IF NOT EXISTS destinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_destination VARCHAR(30) UNIQUE NOT NULL,
    pays VARCHAR(100) NOT NULL,
    ville VARCHAR(100),
    description TEXT,
    climat VARCHAR(50),
    meilleure_saison VARCHAR(100),
    budget_moyen DECIMAL(10, 2),
    durée_recommandee INT,
    actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code_destination),
    INDEX idx_pays (pays)
) ENGINE=InnoDB;

-- ================================================
-- TABLE OFFRES / PACKAGES VOYAGE
-- ================================================
CREATE TABLE IF NOT EXISTS offres_voyage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_offre VARCHAR(30) UNIQUE NOT NULL,
    titre VARCHAR(200) NOT NULL,
    destination_id INT NOT NULL,
    description TEXT,
    nb_jours INT,
    nb_nuits INT,
    prix_base DECIMAL(10, 2),
    prix_groupe DECIMAL(10, 2),
    prix_entreprise DECIMAL(10, 2),
    inclusions TEXT,
    exclusions TEXT,
    places_disponibles INT DEFAULT 20,
    places_reservees INT DEFAULT 0,
    date_debut DATE,
    date_fin DATE,
    statut ENUM('DRAFT', 'ACTIVE', 'FULL', 'CANCELLED') DEFAULT 'DRAFT',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    INDEX idx_destination (destination_id)
) ENGINE=InnoDB;

-- ================================================
-- TABLE RESERVATIONS
-- ================================================
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_reservation VARCHAR(30) UNIQUE NOT NULL,
    client_id INT NOT NULL,
    offre_id INT NOT NULL,
    date_reservation DATE DEFAULT CURRENT_DATE,
    nombre_personnes INT DEFAULT 1,
    prix_total DECIMAL(10, 2),
    statut ENUM('PENDING', 'CONFIRMEE', 'ANNULEE', 'COMPLETEE') DEFAULT 'PENDING',
    date_paiement DATE,
    montant_paye DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients_voyage(id) ON DELETE CASCADE,
    FOREIGN KEY (offre_id) REFERENCES offres_voyage(id) ON DELETE CASCADE,
    INDEX idx_client (client_id),
    INDEX idx_offre (offre_id),
    INDEX idx_statut (statut)
) ENGINE=InnoDB;

-- ================================================
-- TABLE DOCUMENTS / ASSURANCES
-- ================================================
CREATE TABLE IF NOT EXISTS assurances_voyage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    type_assurance VARCHAR(100),
    prix_assurance DECIMAL(10, 2),
    couverture_maladie BOOLEAN DEFAULT TRUE,
    couverture_accident BOOLEAN DEFAULT TRUE,
    couverture_annulation BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================================================
-- DONNÉES DE TEST
-- ================================================
-- Les données seront ajoutées via l'API

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX idx_clients_email ON clients_voyage(email);
CREATE INDEX idx_offres_dates ON offres_voyage(date_debut, date_fin);
CREATE INDEX idx_reservations_dates ON reservations(date_reservation);

SELECT '✅ Schéma Voyage créé avec succès!' as message;
