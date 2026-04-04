-- ================================================
-- CRÉATION SCHÉMA IMMIGRATION SERVICE - CORRIGÉ
-- ================================================

-- TABLE DEMANDEURS
CREATE TABLE IF NOT EXISTS demandeurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_demandeur VARCHAR(30) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    date_naissance DATE,
    nationalite VARCHAR(100),
    email VARCHAR(150),
    telephone VARCHAR(20),
    adresse TEXT,
    numero_passeport VARCHAR(30),
    date_expiration_passeport DATE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE,
    INDEX idx_code (code_demandeur),
    INDEX idx_email (email)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- TABLE TYPES DE DEMANDES
CREATE TABLE IF NOT EXISTS types_demandes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_type VARCHAR(30) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    duree_traitement_jours INT DEFAULT 30,
    prix DECIMAL(10, 2),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARSET=utf8mb4;

-- TABLE DOSSIERS
CREATE TABLE IF NOT EXISTS dossiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_dossier VARCHAR(30) UNIQUE NOT NULL,
    demandeur_id INT NOT NULL,
    type_demande_id INT NOT NULL,
    pays_destination VARCHAR(100),
    type_visa VARCHAR(100),
    date_depot DATE,
    date_derniere_actualisation TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    statut ENUM('CREATION', 'INCOMPLET', 'COMPLETE', 'ACCEPTE', 'REJETE', 'ANNULE', 'EXPIRANT') DEFAULT 'CREATION',
    motif_rejet TEXT,
    date_rejet DATE,
    visa_numero VARCHAR(50),
    date_visa DATE,
    date_expiration_visa DATE,
    notes TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (demandeur_id) REFERENCES demandeurs(id) ON DELETE CASCADE,
    FOREIGN KEY (type_demande_id) REFERENCES types_demandes(id) ON DELETE RESTRICT,
    INDEX idx_numero (numero_dossier),
    INDEX idx_demandeur (demandeur_id),
    INDEX idx_statut (statut)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- TABLE DOCUMENTS REQUIS
CREATE TABLE IF NOT EXISTS documents_requis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_demande_id INT NOT NULL,
    nom_document VARCHAR(150),
    obligatoire BOOLEAN DEFAULT TRUE,
    ordre INT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_demande_id) REFERENCES types_demandes(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4;

-- TABLE DOCUMENTS SOUMIS
CREATE TABLE IF NOT EXISTS documents_soumis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dossier_id INT NOT NULL,
    document_requis_id INT NOT NULL,
    nom_fichier VARCHAR(255),
    chemin_fichier TEXT,
    date_soumission DATE,
    statut ENUM('ACCEPTE', 'REJETE', 'A_REVISER') DEFAULT 'ACCEPTE',
    motif_rejet TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE,
    FOREIGN KEY (document_requis_id) REFERENCES documents_requis(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4;

-- TABLE RENDEZ-VOUS
CREATE TABLE IF NOT EXISTS rendez_vous (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_rdv VARCHAR(30) UNIQUE NOT NULL,
    dossier_id INT NOT NULL,
    type_rdv ENUM('CONSULTATION', 'ENTRETIEN', 'REMISE_VISA', 'SUIVI') DEFAULT 'CONSULTATION',
    date_rdv DATETIME NOT NULL,
    lieu VARCHAR(200),
    statut ENUM('PROGRAMME', 'CONFIRMÉ', 'EFFECTUÉ', 'REPORT', 'ANNULE') DEFAULT 'PROGRAMME',
    notes_rdv TEXT,
    agent_nom VARCHAR(100),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE,
    INDEX idx_date (date_rdv),
    INDEX idx_statut (statut)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- TABLE DEMANDES D'ASSISTANCE
CREATE TABLE IF NOT EXISTS demandes_assistance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dossier_id INT NOT NULL,
    type_assistance VARCHAR(100),
    description TEXT,
    statut ENUM('PENDING', 'RESOLVED', 'ESCALATED') DEFAULT 'PENDING',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4;

-- DONNÉES DE TEST
INSERT INTO types_demandes (code_type, nom, description, duree_traitement_jours, prix) VALUES
('VISITOR', 'Visa Visiteur', 'Pour tourisme/visite', 15, 50.00),
('STUDENT', 'Visa Étudiant', 'Pour études', 30, 100.00),
('WORK', 'Visa Travail', 'Pour emploi', 45, 150.00),
('RESIDENCE', 'Permis de Résidence', 'Résidence permanente', 90, 300.00)
ON DUPLICATE KEY UPDATE duree_traitement_jours=VALUES(duree_traitement_jours);

SELECT '✅ Schéma Immigration créé avec succès!' as message;
