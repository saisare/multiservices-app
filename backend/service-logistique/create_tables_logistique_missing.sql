-- ================================================
-- CRÉATION TABLES MANQUANTES LOGISTIQUE (SANS FK STRICTE)
-- ================================================

USE logistique_db;

-- TABLE MOUVEMENTS DE STOCK (remplace entrees_stock et sorties_stock)
CREATE TABLE IF NOT EXISTS mouvements_stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produit_id INT NOT NULL,
    type_mouvement ENUM('ENTREE', 'SORTIE', 'RETOUR', 'AJUSTEMENT') DEFAULT 'ENTREE',
    quantite INT NOT NULL,
    motif VARCHAR(200),
    fournisseur_id INT,
    numero_reference VARCHAR(50),
    date_mouvement DATETIME DEFAULT CURRENT_TIMESTAMP,
    utilisateur_id INT,
    notes TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_produit (produit_id),
    INDEX idx_type (type_mouvement),
    INDEX idx_date (date_mouvement)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- TABLE COMMANDES FOURNISSEURS
CREATE TABLE IF NOT EXISTS commandes_fournisseurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_commande VARCHAR(30) UNIQUE NOT NULL,
    fournisseur_id INT NOT NULL,
    date_commande DATE NOT NULL,
    date_livraison_prevue DATE,
    date_livraison_reelle DATE,
    montant_total DECIMAL(12, 2),
    statut ENUM('BROUILLON', 'CONFIRMEE', 'LIVREE', 'FACTUREE', 'PAYEE', 'ANNULEE') DEFAULT 'BROUILLON',
    notes TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_numero (numero_commande),
    INDEX idx_fournisseur (fournisseur_id),
    INDEX idx_statut (statut),
    INDEX idx_date (date_commande)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- TABLE LIGNES DE COMMANDE FOURNISSEUR
CREATE TABLE IF NOT EXISTS lignes_commande_fournisseur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    commande_fournisseur_id INT NOT NULL,
    produit_id INT NOT NULL,
    quantite INT NOT NULL,
    prix_unitaire DECIMAL(10, 2),
    prix_total DECIMAL(12, 2),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_commande (commande_fournisseur_id),
    INDEX idx_produit (produit_id)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- TABLE ALERTES DE STOCK
CREATE TABLE IF NOT EXISTS alertes_stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produit_id INT NOT NULL,
    type_alerte ENUM('STOCK_BAS', 'RUPTURE', 'SURSTOCK', 'EXPIRATION') DEFAULT 'STOCK_BAS',
    seuil_minimum INT,
    quantite_actuelle INT,
    statut ENUM('ACTIVE', 'RESOLUE', 'IGNOREE') DEFAULT 'ACTIVE',
    date_alerte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_resolution TIMESTAMP NULL,
    notes TEXT,
    INDEX idx_produit (produit_id),
    INDEX idx_type (type_alerte),
    INDEX idx_statut (statut)
) ENGINE=InnoDB CHARSET=utf8mb4;

SELECT '✅ Tables logistique créées avec succès!' as message;
