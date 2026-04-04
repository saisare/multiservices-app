-- ==========================================
-- BD UNIFIÉE: auth_db
-- Contient TOUT: users, BTP, Assurances, RH, Voyage, etc.
-- ==========================================

-- ============ AUTHENTICATION ============

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matricule VARCHAR(50) UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    departement VARCHAR(100) NOT NULL,
    poste VARCHAR(100),
    role ENUM('admin', 'directeur', 'secretaire', 'btp', 'assurance', 'communication', 'rh', 'immigration', 'logistique', 'voyage', 'employee') NOT NULL DEFAULT 'employee',
    password_hash VARCHAR(255) NOT NULL,
    actif TINYINT DEFAULT 1,
    hidden TINYINT DEFAULT 0,
    verified TINYINT DEFAULT 0,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dernier_login TIMESTAMP NULL,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (email),
    INDEX (role),
    INDEX (departement)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pending_users (
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
    rejection_reason TEXT,
    INDEX (email),
    INDEX (status),
    INDEX (departement)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
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
    INDEX (type),
    INDEX (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS connection_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    email VARCHAR(100),
    departement VARCHAR(100),
    ip_address VARCHAR(45),
    success TINYINT DEFAULT 1,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (user_id),
    INDEX (email),
    INDEX (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ BTP SERVICE ============

CREATE TABLE IF NOT EXISTS chantiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_chantier VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(200) NOT NULL,
    adresse VARCHAR(500),
    description TEXT,
    client_nom VARCHAR(200),
    date_debut DATE,
    date_fin_prevue DATE,
    date_fin_reelle DATE NULL,
    statut ENUM('EN_COURS', 'TERMINE', 'SUSPENDU', 'ANNULE') DEFAULT 'EN_COURS',
    budget DECIMAL(15, 2),
    budget_consomme DECIMAL(15, 2) DEFAULT 0,
    responsable_id INT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (code_chantier),
    INDEX (statut),
    INDEX (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ouvriers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matricule VARCHAR(50) UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telephone VARCHAR(20),
    specialite VARCHAR(100),
    salaire_horaire DECIMAL(10, 2),
    statut ENUM('ACTIF', 'INACTIF', 'EN_CONGE') DEFAULT 'ACTIF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS materiaux (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    unite VARCHAR(20),
    prix_unitaire DECIMAL(10, 2),
    stock_actuel INT DEFAULT 0,
    stock_min INT DEFAULT 10,
    fournisseur VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS commandes_btp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    chantier_id INT,
    fournisseur VARCHAR(200),
    date_commande DATE,
    date_livraison_prevue DATE,
    date_livraison_reelle DATE NULL,
    statut ENUM('EN_COURS', 'LIVREE', 'ANNULEE') DEFAULT 'EN_COURS',
    montant_total DECIMAL(15, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chantier_id) REFERENCES chantiers(id),
    INDEX (numero_commande),
    INDEX (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lignes_commande_btp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    commande_id INT NOT NULL,
    materiau_id INT,
    quantite INT,
    prix_unitaire DECIMAL(10, 2),
    total_ligne DECIMAL(15, 2),
    FOREIGN KEY (commande_id) REFERENCES commandes_btp(id),
    FOREIGN KEY (materiau_id) REFERENCES materiaux(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ ASSURANCES SERVICE ============

CREATE TABLE IF NOT EXISTS polices_assurance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_police VARCHAR(50) UNIQUE NOT NULL,
    type_couverture VARCHAR(100),
    entreprise_assurance VARCHAR(200),
    date_debut DATE,
    date_fin DATE,
    montant_couverture DECIMAL(15, 2),
    prime_annuelle DECIMAL(15, 2),
    statut ENUM('ACTIVE', 'EXPIRATION', 'RESILIEE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (numero_police),
    INDEX (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    prenom VARCHAR(100),
    email VARCHAR(100),
    telephone VARCHAR(20),
    adresse TEXT,
    type_assure ENUM('PERSONNE_PHYSIQUE', 'ENTREPRISE') DEFAULT 'PERSONNE_PHYSIQUE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sinistres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_sinistre VARCHAR(50) UNIQUE NOT NULL,
    police_id INT,
    assure_id INT,
    date_sinistre DATE,
    description TEXT,
    montant_reclame DECIMAL(15, 2),
    montant_indemnise DECIMAL(15, 2),
    statut ENUM('DECLARE', 'EN_COURS', 'CLOS', 'REJETE') DEFAULT 'DECLARE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (police_id) REFERENCES polices_assurance(id),
    FOREIGN KEY (assure_id) REFERENCES assures(id),
    INDEX (numero_sinistre),
    INDEX (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ RH SERVICE ============

CREATE TABLE IF NOT EXISTS contrats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_contrat VARCHAR(50) UNIQUE NOT NULL,
    user_id INT,
    type_contrat VARCHAR(50),
    date_debut DATE,
    date_fin DATE NULL,
    salaire_net DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX (numero_contrat)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    date_debut DATE,
    date_fin DATE,
    type_conge VARCHAR(50),
    statut ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ VOYAGE SERVICE ============

CREATE TABLE IF NOT EXISTS destinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    pays VARCHAR(100),
    description TEXT,
    prix_base DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reservations_voyage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_reservation VARCHAR(50) UNIQUE NOT NULL,
    user_id INT,
    destination_id INT,
    date_depart DATE,
    date_retour DATE,
    statut ENUM('CONFIRMED', 'PENDING', 'CANCELLED') DEFAULT 'PENDING',
    prix_total DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (destination_id) REFERENCES destinations(id),
    INDEX (numero_reservation),
    INDEX (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ IMMIGRATION SERVICE ============

CREATE TABLE IF NOT EXISTS dossiers_immigration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_dossier VARCHAR(50) UNIQUE NOT NULL,
    user_id INT,
    type_visa VARCHAR(50),
    pays_destination VARCHAR(100),
    statut ENUM('PREPARATION', 'SOUMIS', 'APPROUVE', 'REJETE') DEFAULT 'PREPARATION',
    date_soumission DATE NULL,
    date_decision DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX (numero_dossier),
    INDEX (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ COMMUNICATION SERVICE ============

CREATE TABLE IF NOT EXISTS campagnes_communication (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    type_campagne VARCHAR(50),
    statut ENUM('DRAFT', 'PUBLIEE', 'ARCHIVEE') DEFAULT 'DRAFT',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ LOGISTIQUE SERVICE ============

CREATE TABLE IF NOT EXISTS produits_logistique (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_produit VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    prix_unitaire DECIMAL(10, 2),
    stock_actuel INT DEFAULT 0,
    stock_min INT DEFAULT 5,
    fournisseur VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (code_produit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ COMPTES DE TEST ============

-- ADMIN (DIRECTOR + déplacer au top du système)
INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, actif, verified)
VALUES ('ADM001', 'Admin', 'System', 'admin@blg-engineering.com', '+33600000000', 'DIRECTION', 'Administrateur', 'admin', '$2a$10$vI8aWBYW2e7Ybnk56eDOm.a4coqgdgUiiPEFfuKVHGhJuFvFu.gOa', 1, 1);

-- DIRECTEUR
INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, actif, verified)
VALUES ('DIR001', 'Martin', 'Jean', 'jean.martin@blg-engineering.com', '+33600000001', 'BTP', 'Directeur', 'directeur', '$2a$10$pSvw97bDQMLmCSIYSwQJcO5bK8F4J02m8tDYf4Xzh5f7fYpBhGKxK', 1, 1);

-- SECRÉTAIRE
INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, actif, verified)
VALUES ('SEC001', 'Durand', 'Marie', 'marie.durand@blg-engineering.com', '+33600000002', 'RH', 'Secrétaire', 'secretaire', '$2a$10$95HWJdmFNJQHtV3LM5khA.eXXq0LlWdGZYbvTRqc0dHdJKHPNPUWe', 1, 1);

-- TEST DATA - À ENLEVER EN PRODUCTION
INSERT INTO chantiers (code_chantier, nom, adresse, date_debut, statut, budget, created_by)
VALUES ('CH001', 'Construction Immeuble A', '123 Rue de Paris', '2026-01-15', 'EN_COURS', 500000, 1);

INSERT INTO destinations (nom, pays, prix_base)
VALUES ('Paris', 'France', 1500);

COMMIT;
