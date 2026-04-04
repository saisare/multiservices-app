-- ================================================
-- CRÉATION SCHÉMA COMMUNICATION SERVICE
-- ================================================
-- À exécuter dans phpMyAdmin ou MySQL

USE communication_db;

-- ================================================
-- TABLE ANNONCEURS
-- ================================================
CREATE TABLE IF NOT EXISTS annonceurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_annonceur VARCHAR(30) UNIQUE NOT NULL,
    nom_entreprise VARCHAR(200) NOT NULL,
    contact_nom VARCHAR(100),
    contact_email VARCHAR(150),
    contact_telephone VARCHAR(20),
    adresse TEXT,
    secteur_activite VARCHAR(100),
    budget_total DECIMAL(12, 2) DEFAULT 0,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code_annonceur),
    INDEX idx_date_creation (date_creation)
) ENGINE=InnoDB;

-- ================================================
-- TABLE CAMPAGNES
-- ================================================
CREATE TABLE IF NOT EXISTS campagnes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_campagne VARCHAR(30) UNIQUE NOT NULL,
    annonceur_id INT NOT NULL,
    nom_campagne VARCHAR(200) NOT NULL,
    description TEXT,
    type_campagne VARCHAR(100),
    objectif VARCHAR(200),
    budget DECIMAL(12, 2) NOT NULL,
    budget_utilise DECIMAL(12, 2) DEFAULT 0,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    statut ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'ENDED', 'CANCELLED') DEFAULT 'DRAFT',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (annonceur_id) REFERENCES annonceurs(id) ON DELETE CASCADE,
    INDEX idx_annonceur (annonceur_id),
    INDEX idx_statut (statut),
    INDEX idx_dates (date_debut, date_fin)
) ENGINE=InnoDB;

-- ================================================
-- TABLE PLATEFORMES PUBLICITAIRES
-- ================================================
CREATE TABLE IF NOT EXISTS plateformes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    type_plateforme VARCHAR(100),
    description TEXT,
    active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- ================================================
-- TABLE PERFORMANCES QUOTIDIENNES
-- ================================================
CREATE TABLE IF NOT EXISTS performances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campagne_id INT NOT NULL,
    plateforme_id INT NOT NULL,
    date_mesure DATE NOT NULL,
    impressions INT DEFAULT 0,
    clics INT DEFAULT 0,
    conversions INT DEFAULT 0,
    cout DECIMAL(10, 2) DEFAULT 0,
    revenu DECIMAL(10, 2) DEFAULT 0,
    ctr DECIMAL(5, 2) DEFAULT 0,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campagne_id) REFERENCES campagnes(id) ON DELETE CASCADE,
    FOREIGN KEY (plateforme_id) REFERENCES plateformes(id) ON DELETE CASCADE,
    INDEX idx_campagne (campagne_id),
    INDEX idx_plateforme (plateforme_id),
    INDEX idx_date (date_mesure),
    UNIQUE KEY unique_performance (campagne_id, plateforme_id, date_mesure)
) ENGINE=InnoDB;

-- ================================================
-- TABLE CREATIFS / CONTENUS
-- ================================================
CREATE TABLE IF NOT EXISTS creatifs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campagne_id INT NOT NULL,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    type_contenu VARCHAR(50),
    url_media VARCHAR(500),
    actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campagne_id) REFERENCES campagnes(id) ON DELETE CASCADE,
    INDEX idx_campagne (campagne_id)
) ENGINE=InnoDB;

-- ================================================
-- TABLE RAPPORT MENSUEL
-- ================================================
CREATE TABLE IF NOT EXISTS rapports_mensuels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campagne_id INT NOT NULL,
    mois_annee VARCHAR(7) NOT NULL,
    impressions_total INT DEFAULT 0,
    clics_total INT DEFAULT 0,
    conversions_total INT DEFAULT 0,
    cout_total DECIMAL(10, 2) DEFAULT 0,
    revenu_total DECIMAL(10, 2) DEFAULT 0,
    roi DECIMAL(5, 2) DEFAULT 0,
    ctr_moyen DECIMAL(5, 2) DEFAULT 0,
    date_generation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campagne_id) REFERENCES campagnes(id) ON DELETE CASCADE,
    INDEX idx_campagne (campagne_id),
    UNIQUE KEY unique_rapport (campagne_id, mois_annee)
) ENGINE=InnoDB;

-- ================================================
-- DONNÉES DE TEST
-- ================================================
INSERT INTO plateformes (nom, type_plateforme, description) VALUES
('Facebook', 'Social Media', 'Plateforme de réseautage social'),
('Instagram', 'Social Media', 'Plateforme de partage d''images'),
('Google Ads', 'Search Advertising', 'Plateforme de publicités Google'),
('LinkedIn', 'Professional Network', 'Réseau professionnel'),
('TikTok', 'Social Media', 'Plateforme vidéo courte')
ON DUPLICATE KEY UPDATE type_plateforme=VALUES(type_plateforme);

-- ================================================
-- INDEXES POUR PERFORMANCE
-- ================================================
CREATE INDEX idx_campagnes_code ON campagnes(code_campagne);
CREATE INDEX idx_annonceurs_email ON annonceurs(contact_email);
CREATE INDEX idx_performances_intervalle ON performances(date_mesure);

SELECT '✅ Schéma Communication créé avec succès!' as message;
