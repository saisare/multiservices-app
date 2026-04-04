-- ================================================
-- CRÉATION TABLE EXPERTS - SERVICE ASSURANCES
-- ================================================

USE assurance_db;

-- TABLE EXPERTS (manquante)
CREATE TABLE IF NOT EXISTS experts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_expert VARCHAR(30) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    specialite VARCHAR(100),
    email VARCHAR(150),
    telephone VARCHAR(20),
    adresse TEXT,
    numero_SIREN VARCHAR(20),
    numero_agrément VARCHAR(30),
    date_expiration_agrement DATE,
    actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code_expert),
    INDEX idx_email (email),
    INDEX idx_actif (actif)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- TABLE POLICES_ASSURANCE (si n'existe pas)
CREATE TABLE IF NOT EXISTS contrats_assurance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_police VARCHAR(30) UNIQUE NOT NULL,
    assure_id INT NOT NULL,
    type_couverture VARCHAR(100),
    date_debut_couverture DATE,
    date_fin_couverture DATE,
    prime_mensuelle DECIMAL(10, 2),
    statut ENUM('ACTIVE', 'EXPIREE', 'RESILIEE', 'EN_ATTENTE') DEFAULT 'ACTIVE',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assure_id) REFERENCES assures(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4;

SELECT '✅ Tables experts et contrats_assurance créées!' as message;
