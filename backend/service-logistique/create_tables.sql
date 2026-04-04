-- ================================================
-- CRÉATION SCHÉMA LOGISTIQUE SERVICE
-- ================================================
-- À exécuter dans phpMyAdmin ou MySQL

USE logistique_db;

-- ================================================
-- TABLE FOURNISSEURS
-- ================================================
CREATE TABLE IF NOT EXISTS fournisseurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_fournisseur VARCHAR(30) UNIQUE NOT NULL,
    nom_entreprise VARCHAR(200) NOT NULL,
    contact_nom VARCHAR(100),
    contact_email VARCHAR(150),
    contact_telephone VARCHAR(20),
    adresse TEXT,
    secteur VARCHAR(100),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE,
    INDEX idx_code (code_fournisseur)
) ENGINE=InnoDB;

-- ================================================
-- TABLE PRODUITS / STOCK
-- ================================================
CREATE TABLE IF NOT EXISTS produits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_produit VARCHAR(30) UNIQUE NOT NULL,
    nom VARCHAR(150) NOT NULL,
    categorie VARCHAR(100),
    fournisseur_id INT,
    description TEXT,
    quantite DECIMAL(10, 3) DEFAULT 0,
    seuil_alerte INT DEFAULT 10,
    prix_unitaire DECIMAL(10, 2) DEFAULT 0,
    prix_achat DECIMAL(10, 2) DEFAULT 0,
    unite VARCHAR(20) DEFAULT 'UNITES',
    localisation VARCHAR(100),
    date_dernier_inventaire DATE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE SET NULL,
    INDEX idx_code (code_produit),
    INDEX idx_categorie (categorie),
    INDEX idx_quantite (quantite)
) ENGINE=InnoDB;

-- ================================================
-- TABLE COMMANDES FOURNISSEURS
-- ================================================
CREATE TABLE IF NOT EXISTS commandes_fournisseurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_commande VARCHAR(30) UNIQUE NOT NULL,
    fournisseur_id INT NOT NULL,
    date_commande DATE DEFAULT CURRENT_DATE,
    date_livraison_prevue DATE,
    date_livraison_reelle DATE,
    montant_total DECIMAL(10, 2) DEFAULT 0,
    statut ENUM('EN_COURS', 'LIVREE', 'ANNULEE', 'EN_RETARD') DEFAULT 'EN_COURS',
    notes TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE SET NULL,
    INDEX idx_statut (statut),
    INDEX idx_fournisseur (fournisseur_id)
) ENGINE=InnoDB;

-- ================================================
-- TABLE LIGNES COMMANDE FOURNISSEUR
-- ================================================
CREATE TABLE IF NOT EXISTS lignes_commande_fournisseur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    commande_id INT NOT NULL,
    produit_id INT,
    quantite DECIMAL(10, 3) NOT NULL,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    montant DECIMAL(10, 2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED,
    FOREIGN KEY (commande_id) REFERENCES commandes_fournisseurs(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ================================================
-- TABLE MOUVEMENTS DE STOCK
-- ================================================
CREATE TABLE IF NOT EXISTS mouvements_stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produit_id INT NOT NULL,
    type_mouvement ENUM('ENTREE', 'SORTIE', 'AJUSTEMENT', 'RETOUR') NOT NULL,
    quantite DECIMAL(10, 3) NOT NULL,
    motif VARCHAR(200),
    reference VARCHAR(50),
    date_mouvement DATE DEFAULT CURRENT_DATE,
    utilisateur VARCHAR(100),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
    INDEX idx_produit (produit_id),
    INDEX idx_date (date_mouvement)
) ENGINE=InnoDB;

-- ================================================
-- TABLE LIVRAISONS / TRANSFERTS
-- ================================================
CREATE TABLE IF NOT EXISTS livraisons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_livraison VARCHAR(30) UNIQUE NOT NULL,
    commande_id INT,
    date_livraison DATE,
    adresse_livraison TEXT,
    statut ENUM('EN_PREPARATION', 'EN_TRANSIT', 'LIVREE', 'RETARD', 'PROBLEME') DEFAULT 'EN_PREPARATION',
    notes TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commande_id) REFERENCES commandes_fournisseurs(id) ON DELETE SET NULL,
    INDEX idx_statut (statut)
) ENGINE=InnoDB;

-- ================================================
-- TABLE INVENTAIRES
-- ================================================
CREATE TABLE IF NOT EXISTS inventaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_inventaire VARCHAR(30) UNIQUE NOT NULL,
    date_inventaire DATE NOT NULL,
    statut ENUM('PLANIFIE', 'EN_COURS', 'TERMINE', 'VALIDE') DEFAULT 'PLANIFIE',
    utilisateur VARCHAR(100),
    notes TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ================================================
-- DONNÉES DE TEST
-- ================================================
-- Les données seront ajoutées via l'API

-- ================================================
-- INDEXES POUR PERFORMANCE
-- ================================================
CREATE INDEX idx_produits_code ON produits(code_produit);
CREATE INDEX idx_produits_seuil ON produits(quantite);
CREATE INDEX idx_commandes_numero ON commandes_fournisseurs(numero_commande);
CREATE INDEX idx_livraisons_numero ON livraisons(numero_livraison);

SELECT '✅ Schéma Logistique créé avec succès!' as message;
