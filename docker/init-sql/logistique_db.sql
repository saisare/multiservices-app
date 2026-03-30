-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : jeu. 19 mars 2026 à 18:04
-- Version du serveur : 8.4.7
-- Version de PHP : 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `logistique_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `alertes_stock`
--

DROP TABLE IF EXISTS `alertes_stock`;
CREATE TABLE IF NOT EXISTS `alertes_stock` (
  `id` int NOT NULL AUTO_INCREMENT,
  `produit_id` int DEFAULT NULL,
  `seuil_actuel` int DEFAULT NULL,
  `seuil_minimum` int DEFAULT NULL,
  `date_alerte` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `traitee` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `produit_id` (`produit_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `commandes`
--

DROP TABLE IF EXISTS `commandes`;
CREATE TABLE IF NOT EXISTS `commandes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_commande` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_nom` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_adresse` text COLLATE utf8mb4_unicode_ci,
  `client_telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_commande` date DEFAULT (curdate()),
  `date_livraison_souhaitee` date DEFAULT NULL,
  `statut` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'EN_ATTENTE',
  `total_ht` decimal(10,2) DEFAULT '0.00',
  `tva` decimal(10,2) DEFAULT '0.00',
  `total_ttc` decimal(10,2) DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_commande` (`numero_commande`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `entrees_stock`
--

DROP TABLE IF EXISTS `entrees_stock`;
CREATE TABLE IF NOT EXISTS `entrees_stock` (
  `id` int NOT NULL AUTO_INCREMENT,
  `produit_id` int DEFAULT NULL,
  `fournisseur_id` int DEFAULT NULL,
  `quantite` int NOT NULL,
  `prix_unitaire_achat` decimal(10,2) DEFAULT NULL,
  `numero_bon_livraison` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_entree` date NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `produit_id` (`produit_id`),
  KEY `fournisseur_id` (`fournisseur_id`)
) ;

-- --------------------------------------------------------

--
-- Structure de la table `factures`
--

DROP TABLE IF EXISTS `factures`;
CREATE TABLE IF NOT EXISTS `factures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_facture` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `commande_id` int DEFAULT NULL,
  `date_emission` date DEFAULT (curdate()),
  `date_echeance` date DEFAULT NULL,
  `montant_ht` decimal(10,2) DEFAULT NULL,
  `montant_ttc` decimal(10,2) DEFAULT NULL,
  `statut` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'EN_ATTENTE',
  `chemin_pdf` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_facture` (`numero_facture`),
  UNIQUE KEY `commande_id` (`commande_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `fournisseurs`
--

DROP TABLE IF EXISTS `fournisseurs`;
CREATE TABLE IF NOT EXISTS `fournisseurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_fournisseur` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` text COLLATE utf8mb4_unicode_ci,
  `ville` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pays` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'France',
  `actif` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_fournisseur` (`code_fournisseur`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `fournisseurs`
--

INSERT INTO `fournisseurs` (`id`, `code_fournisseur`, `nom`, `contact`, `telephone`, `email`, `adresse`, `ville`, `pays`, `actif`) VALUES
(1, 'FOUR-001', 'Papeterie Moderne', 'Jean Martin', '0123456789', 'contact@papeterie.fr', NULL, 'Paris', 'France', 1),
(2, 'FOUR-002', 'Emballages Pro', 'Marie Dubois', '0234567890', 'commercial@emballages-pro.fr', NULL, 'Lyon', 'France', 1),
(3, 'FOUR-003', 'Palettes Plus', 'Pierre Durand', '0345678901', 'pierre@palettesplus.fr', NULL, 'Marseille', 'France', 1);

-- --------------------------------------------------------

--
-- Structure de la table `lignes_commande`
--

DROP TABLE IF EXISTS `lignes_commande`;
CREATE TABLE IF NOT EXISTS `lignes_commande` (
  `id` int NOT NULL AUTO_INCREMENT,
  `commande_id` int DEFAULT NULL,
  `produit_id` int DEFAULT NULL,
  `quantite` int NOT NULL,
  `prix_unitaire` decimal(10,2) DEFAULT NULL,
  `total_ligne` decimal(10,2) GENERATED ALWAYS AS ((`quantite` * `prix_unitaire`)) STORED,
  PRIMARY KEY (`id`),
  KEY `commande_id` (`commande_id`),
  KEY `produit_id` (`produit_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `livraisons`
--

DROP TABLE IF EXISTS `livraisons`;
CREATE TABLE IF NOT EXISTS `livraisons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `commande_id` int DEFAULT NULL,
  `numero_suivi` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transporteur` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_expedition` date DEFAULT NULL,
  `date_livraison_prevue` date DEFAULT NULL,
  `date_livraison_reelle` date DEFAULT NULL,
  `statut` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'PREPARATION',
  `adresse_livraison` text COLLATE utf8mb4_unicode_ci,
  `frais_port` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `commande_id` (`commande_id`),
  UNIQUE KEY `numero_suivi` (`numero_suivi`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `produits`
--

DROP TABLE IF EXISTS `produits`;
CREATE TABLE IF NOT EXISTS `produits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_produit` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categorie` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fournisseur` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantite` int DEFAULT '0',
  `seuil_alerte` int DEFAULT '10',
  `prix_unitaire` decimal(10,2) DEFAULT NULL,
  `localisation` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` timestamp NULL DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_produit` (`code_produit`)
) ;

--
-- Déchargement des données de la table `produits`
--

INSERT INTO `produits` (`id`, `code_produit`, `nom`, `categorie`, `fournisseur`, `quantite`, `seuil_alerte`, `prix_unitaire`, `localisation`, `description`, `date_creation`, `date_modification`, `created_by`, `updated_by`) VALUES
(1, 'PROD-001', 'Carton 40x30', 'Emballage', 'Papeterie Moderne', 500, 100, 2.50, 'Rayon A-01', NULL, '2026-03-09 21:08:07', NULL, NULL, NULL),
(2, 'PROD-002', 'Ruban adhésif 50mm', 'Emballage', 'Papeterie Moderne', 1200, 200, 1.20, 'Rayon A-02', NULL, '2026-03-09 21:08:07', NULL, NULL, NULL),
(3, 'PROD-003', 'Palette Europe', 'Palette', 'Palettes Plus', 45, 20, 15.00, 'Zone P-01', NULL, '2026-03-09 21:08:07', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `sorties_stock`
--

DROP TABLE IF EXISTS `sorties_stock`;
CREATE TABLE IF NOT EXISTS `sorties_stock` (
  `id` int NOT NULL AUTO_INCREMENT,
  `produit_id` int DEFAULT NULL,
  `quantite` int NOT NULL,
  `destinataire` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_sortie` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_commande` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_sortie` date NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `produit_id` (`produit_id`)
) ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
