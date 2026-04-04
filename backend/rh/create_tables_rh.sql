-- ================================================
-- CRÉATION SCHÉMA RH SERVICE - COMPLET
-- ================================================

USE rh_db;

-- TABLE EMPLOYES
CREATE TABLE IF NOT EXISTS employes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matricule VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    telephone VARCHAR(20),
    date_naissance DATE,
    adresse TEXT,
    poste VARCHAR(100),
    departement VARCHAR(100),
    date_embauche DATE,
    date_fin_contrat DATE,
    statut ENUM('ACTIF', 'EN_CONGE', 'SUSPENDU', 'PARTI') DEFAULT 'ACTIF',
    photo_profil LONGBLOB,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_matricule (matricule),
    INDEX idx_email (email),
    INDEX idx_statut (statut)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- TABLE CONTRATS
CREATE TABLE IF NOT EXISTS contrats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employe_id INT NOT NULL,
    type_contrat ENUM('CDI', 'CDD', 'STAGE', 'FREELANCE') DEFAULT 'CDI',
    date_debut DATE NOT NULL,
    date_fin DATE,
    salaire_mensuel DECIMAL(10, 2),
    lieu_travail VARCHAR(200),
    responsable_hierarchique_id INT,
    statut ENUM('ACTIF', 'TERMINÉ', 'SUSPENDU') DEFAULT 'ACTIF',
    termes_conditions TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE,
    FOREIGN KEY (responsable_hierarchique_id) REFERENCES employes(id) ON DELETE SET NULL
) ENGINE=InnoDB CHARSET=utf8mb4;

-- TABLE CONGES
CREATE TABLE IF NOT EXISTS conges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employe_id INT NOT NULL,
    type_conge ENUM('ANNUEL', 'MALADIE', 'MATERNITE', 'PATERNITE', 'SANS_SOLDE', 'SABBATIQUE') DEFAULT 'ANNUEL',
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    nombre_jours INT,
    raison TEXT,
    statut ENUM('DEMANDE', 'APPROUVE', 'REJETE', 'EN_COURS', 'TERMINE') DEFAULT 'DEMANDE',
    approuve_par INT,
    date_approbation TIMESTAMP NULL,
    commentaires TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE,
    FOREIGN KEY (approuve_par) REFERENCES employes(id) ON DELETE SET NULL,
    INDEX idx_employe (employe_id),
    INDEX idx_statut (statut)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- TABLE FORMATIONS
CREATE TABLE IF NOT EXISTS formations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employe_id INT NOT NULL,
    titre VARCHAR(200) NOT NULL,
    organisme VARCHAR(200),
    description TEXT,
    date_debut DATE NOT NULL,
    date_fin DATE,
    duree_heures INT,
    cout DECIMAL(10, 2),
    statut ENUM('PLANIFIEE', 'EN_COURS', 'COMPLETEE', 'ANNULEE') DEFAULT 'PLANIFIEE',
    certificat_obtenu BOOLEAN DEFAULT FALSE,
    niveau_certification VARCHAR(100),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE,
    INDEX idx_employe (employe_id)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- TABLE EVALUATIONS
CREATE TABLE IF NOT EXISTS evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employe_id INT NOT NULL,
    evaluateur_id INT,
    date_evaluation DATE NOT NULL,
    periode VARCHAR(50),
    note_technique INT DEFAULT 0,
    note_comportement INT DEFAULT 0,
    note_assiduité INT DEFAULT 0,
    note_cooperation INT DEFAULT 0,
    note_global INT DEFAULT 0,
    commentaires TEXT,
    points_forts TEXT,
    points_a_ameliorer TEXT,
    objectifs_futurs TEXT,
    recommandations TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluateur_id) REFERENCES employes(id) ON DELETE SET NULL,
    INDEX idx_employe (employe_id),
    INDEX idx_date (date_evaluation)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- TABLE DOCUMENTS RH
CREATE TABLE IF NOT EXISTS documents_rh (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employe_id INT NOT NULL,
    type_document ENUM('CONTRAT', 'BULLETIN_PAIE', 'ATTESTATION', 'AUTRE') DEFAULT 'AUTRE',
    nom_document VARCHAR(255),
    chemin_fichier TEXT,
    date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_document DATE,
    FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE,
    INDEX idx_employe (employe_id)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- TABLE PAIE
CREATE TABLE IF NOT EXISTS paie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employe_id INT NOT NULL,
    periode_mois INT,
    periode_annee INT,
    salaire_brut DECIMAL(10, 2),
    cotisations_patronales DECIMAL(10, 2),
    cotisations_salariales DECIMAL(10, 2),
    impot_revenu DECIMAL(10, 2),
    autres_retenues DECIMAL(10, 2),
    salaire_net DECIMAL(10, 2),
    bonus DECIMAL(10, 2) DEFAULT 0,
    primes DECIMAL(10, 2) DEFAULT 0,
    date_paiement DATE,
    statut_paiement ENUM('EN_ATTENTE', 'PAYE', 'ANNULE') DEFAULT 'EN_ATTENTE',
    bulletin_paie_id INT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE,
    INDEX idx_employe (employe_id),
    INDEX idx_periode (periode_mois, periode_annee)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- DONNÉES DE TEST
INSERT INTO employes (matricule, nom, prenom, poste, departement, date_embauche, statut) VALUES
('EMP001', 'Dupont', 'Jean', 'Directeur', 'Direction', CURDATE() - INTERVAL 5 YEAR, 'ACTIF'),
('EMP002', 'Martin', 'Marie', 'Responsable RH', 'RH', CURDATE() - INTERVAL 3 YEAR, 'ACTIF'),
('EMP003', 'Lefevre', 'Pierre', 'Ingénieur', 'IT', CURDATE() - INTERVAL 2 YEAR, 'ACTIF')
ON DUPLICATE KEY UPDATE nom=VALUES(nom);

SELECT '✅ Schéma RH créé avec succès!' as message;
