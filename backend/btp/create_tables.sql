-- create_tables.sql pour service BTP
-- À exécuter dans phpMyAdmin (localhost:8081) ou MySQL après init.SQL

USE btp_db;

-- ===========================================
-- TABLE CHANTIERS (requis pour commandes_btp)
-- ===========================================
CREATE TABLE IF NOT EXISTS chantiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_chantier VARCHAR(30) UNIQUE NOT NULL,
    nom VARCHAR(200) NOT NULL,
    adresse TEXT,
    date_debut DATE,
    date_fin_prevue DATE,
    date_fin_reelle DATE,
    statut ENUM('PLANIFIE', 'EN_COURS', 'TERMINE', 'SUSPENDU', 'ANNULE') DEFAULT 'PLANIFIE',
    budget DECIMAL(12,2) DEFAULT 0,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===========================================
-- TABLE OUVRIERS
-- ===========================================
CREATE TABLE IF NOT EXISTS ouvriers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matricule VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    metier VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(150),
    date_embauche DATE,
    salaire_journalier DECIMAL(8,2) DEFAULT 0,
    actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===========================================
-- TABLE MATERIAUX / STOCK
-- ===========================================
CREATE TABLE IF NOT EXISTS materiaux (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_materiau VARCHAR(30) UNIQUE NOT NULL,
    nom VARCHAR(150) NOT NULL,
    categorie VARCHAR(100),
    fournisseur VARCHAR(200),
    quantite DECIMAL(10,3) DEFAULT 0,
    prix_unitaire DECIMAL(10,2) DEFAULT 0,
    unite VARCHAR(20) DEFAULT 'UNITES',
    seuil_alerte INT DEFAULT 10,
    localisation VARCHAR(100),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===========================================
-- TABLE TACHES CHANTIER
-- ===========================================
CREATE TABLE IF NOT EXISTS taches_chantier (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chantier_id INT NOT NULL,
    ouvrier_id INT,
    description TEXT NOT NULL,
    date_debut DATE,
    date_fin DATE,
    priorite ENUM('BASSE', 'NORMALE', 'HAUTE', 'URGENTE') DEFAULT 'NORMALE',
    statut ENUM('PLANIFIEE', 'EN_COURS', 'TERMINE', 'ANNULEE') DEFAULT 'PLANIFIEE',
    FOREIGN KEY (chantier_id) REFERENCES chantiers(id) ON DELETE CASCADE,
    FOREIGN KEY (ouvrier_id) REFERENCES ouvriers(id) ON DELETE SET NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===========================================
-- TABLE COMMANDES BTP (script utilisateur corrigé)
-- ===========================================
CREATE TABLE IF NOT EXISTS commandes_btp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_commande VARCHAR(30) UNIQUE NOT NULL,
    fournisseur VARCHAR(200) NOT NULL,
    chantier_id INT,
    responsable VARCHAR(150),
    date_commande DATE DEFAULT (CURDATE()),
    date_livraison_prevue DATE,
    statut ENUM('EN_COURS', 'LIVREE', 'ANNULEE') DEFAULT 'EN_COURS',
    montant_total DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chantier_id) REFERENCES chantiers(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ===========================================
-- TABLE LIGNES COMMANDE (pour détail)
-- ===========================================
CREATE TABLE IF NOT EXISTS lignes_commande_btp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    commande_id INT NOT NULL,
    materiau_id INT,
    designation VARCHAR(200) NOT NULL,
    quantite DECIMAL(10,3),
    prix_unitaire DECIMAL(10,2),
    montant DECIMAL(10,2),
    FOREIGN KEY (commande_id) REFERENCES commandes_btp(id) ON DELETE CASCADE,
    FOREIGN KEY (materiau_id) REFERENCES materiaux(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ===========================================
-- TABLE FACTURES BTP
-- ===========================================
CREATE TABLE IF NOT EXISTS factures_btp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_facture VARCHAR(30) UNIQUE NOT NULL,
    chantier_id INT,
    client_nom VARCHAR(200),
    montant_ht DECIMAL(12,2),
    tva DECIMAL(10,2) DEFAULT 20.00,
    montant_ttc DECIMAL(12,2) AS (montant_ht + tva) STORED,
    date_emission DATE DEFAULT CURRENT_DATE,
    date_echeance DATE,
    statut ENUM('ENVOYEE', 'REGLEE', 'IMPAYEE', 'ANNULEE') DEFAULT 'ENVOYEE',
    FOREIGN KEY (chantier_id) REFERENCES chantiers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Indexes pour perf
CREATE INDEX idx_commandes_statut ON commandes_btp(statut);
CREATE INDEX idx_chantiers_statut ON chantiers(statut);
CREATE INDEX idx_materiaux_quantite ON materiaux(quantite);

-- ===========================================
-- DONNEES DE TEST (optionnel)
-- ===========================================
-- INSERT INTO chantiers (code_chantier, nom, adresse, budget) VALUES ('CHT-001', 'Bâtiment Ecole', 'Paris 15e', 150000.00);
-- SELECT '✅ Schema BTP créé !' as message;

