-- ================================================
-- CRÉATION SCHÉMA RH SERVICE
-- ================================================
-- À exécuter dans phpMyAdmin ou MySQL

USE rh_db;

-- ================================================
-- TABLE EMPLOYES
-- ================================================
CREATE TABLE IF NOT EXISTS employes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matricule VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    genre ENUM('M', 'F', 'Autre') DEFAULT 'M',
    email VARCHAR(150) UNIQUE,
    telephone VARCHAR(20),
    poste VARCHAR(100),
    departement VARCHAR(100),
    date_embauche DATE,
    salaire_base DECIMAL(10, 2) DEFAULT 0,
    adresse TEXT,
    actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_departement (departement),
    INDEX idx_actif (actif)
) ENGINE=InnoDB;

-- ================================================
-- TABLE TYPES DE CONGÉS
-- ================================================
CREATE TABLE IF NOT EXISTS types_conges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    jours_annuels INT DEFAULT 20,
    description TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ================================================
-- TABLE CONGÉS / ABSENCES
-- ================================================
CREATE TABLE IF NOT EXISTS conges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employe_id INT NOT NULL,
    type_conge_id INT,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    nb_jours INT,
    motif TEXT,
    statut ENUM('PENDING', 'APPROUVE', 'REJETE') DEFAULT 'PENDING',
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_traitement DATETIME,
    FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE,
    FOREIGN KEY (type_conge_id) REFERENCES types_conges(id) ON DELETE SET NULL,
    INDEX idx_employe (employe_id),
    INDEX idx_statut (statut)
) ENGINE=InnoDB;

-- ================================================
-- TABLE ATTESTATIONS / DOCUMENTS
-- ================================================
CREATE TABLE IF NOT EXISTS attestations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employe_id INT NOT NULL,
    type_attestation VARCHAR(100),
    numero_attestation VARCHAR(50) UNIQUE,
    date_emission DATE DEFAULT CURRENT_DATE,
    date_expiration DATE,
    FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE,
    INDEX idx_employe (employe_id)
) ENGINE=InnoDB;

-- ================================================
-- TABLE PAIES / SALAIRES
-- ================================================
CREATE TABLE IF NOT EXISTS paies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employe_id INT NOT NULL,
    mois_annee VARCHAR(7),
    salaire_brut DECIMAL(10, 2),
    retenues DECIMAL(10, 2) DEFAULT 0,
    salaire_net DECIMAL(10, 2),
    date_paie DATE,
    statut ENUM('GENERATED', 'VERIFIED', 'PAID') DEFAULT 'GENERATED',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE,
    INDEX idx_employe (employe_id),
    INDEX idx_mois_annee (mois_annee)
) ENGINE=InnoDB;

-- ================================================
-- DONNÉES DE TEST
-- ================================================
INSERT INTO types_conges (nom, jours_annuels, description) VALUES
('Congé annuel', 20, 'Congé payé'),
('Congé maladie', 30, 'Congé maladie avec certificat'),
('Congé maternité', 112, 'Congé maternité'),
('Congé sans solde', 0, 'Sans rémunération')
ON DUPLICATE KEY UPDATE jours_annuels=VALUES(jours_annuels);

-- ================================================
-- INDEXES POUR PERFORMANCE
-- ================================================
CREATE INDEX idx_employes_email ON employes(email);
CREATE INDEX idx_employes_matricule ON employes(matricule);
CREATE INDEX idx_conges_dates ON conges(date_debut, date_fin);

SELECT '✅ Schéma RH créé avec succès!' as message;
