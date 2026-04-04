-- ================================================
-- CRÉATION TABLES MANQUANTES RH
-- ================================================

USE rh_db;

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

SELECT '✅ Tables formations et evaluations créées!' as message;
