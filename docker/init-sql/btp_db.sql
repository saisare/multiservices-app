-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : jeu. 19 mars 2026 à 18:03
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
-- Base de données : `btp_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `chantiers`
--

DROP TABLE IF EXISTS `chantiers`;
CREATE TABLE IF NOT EXISTS `chantiers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_chantier` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_debut` date DEFAULT NULL,
  `date_fin_prevue` date DEFAULT NULL,
  `statut` enum('EN_COURS','TERMINE','SUSPENDU') COLLATE utf8mb4_unicode_ci DEFAULT 'EN_COURS',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_chantier` (`code_chantier`),
  KEY `idx_chantiers_statut` (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `commandes_btp`
--

DROP TABLE IF EXISTS `commandes_btp`;
CREATE TABLE IF NOT EXISTS `commandes_btp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_commande` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fournisseur` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `chantier_id` int DEFAULT NULL,
  `responsable` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_commande` date DEFAULT (curdate()),
  `date_livraison_prevue` date DEFAULT NULL,
  `statut` enum('EN_COURS','LIVREE','ANNULEE') COLLATE utf8mb4_unicode_ci DEFAULT 'EN_COURS',
  `montant_total` decimal(10,2) DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_commande` (`numero_commande`),
  KEY `chantier_id` (`chantier_id`),
  KEY `idx_commandes_statut` (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `factures_btp`
--

DROP TABLE IF EXISTS `factures_btp`;
CREATE TABLE IF NOT EXISTS `factures_btp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_facture` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `chantier_id` int DEFAULT NULL,
  `client_nom` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `montant_ht` decimal(12,2) DEFAULT NULL,
  `tva` decimal(10,2) DEFAULT '20.00',
  `montant_ttc` decimal(12,2) GENERATED ALWAYS AS ((`montant_ht` + `tva`)) STORED,
  `date_emission` date DEFAULT (curdate()),
  `date_echeance` date DEFAULT NULL,
  `statut` enum('ENVOYEE','REGLEE','IMPAYEE','ANNULEE') COLLATE utf8mb4_unicode_ci DEFAULT 'ENVOYEE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_facture` (`numero_facture`),
  KEY `chantier_id` (`chantier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `lignes_commande_btp`
--

DROP TABLE IF EXISTS `lignes_commande_btp`;
CREATE TABLE IF NOT EXISTS `lignes_commande_btp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `commande_id` int NOT NULL,
  `materiau_id` int DEFAULT NULL,
  `designation` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantite` decimal(10,3) DEFAULT NULL,
  `prix_unitaire` decimal(10,2) DEFAULT NULL,
  `montant` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `commande_id` (`commande_id`),
  KEY `materiau_id` (`materiau_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `materiaux`
--

DROP TABLE IF EXISTS `materiaux`;
CREATE TABLE IF NOT EXISTS `materiaux` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_materiau` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categorie` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fournisseur` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantite` int DEFAULT '0',
  `prix_unitaire` decimal(10,2) DEFAULT NULL,
  `unite` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seuil_alerte` int DEFAULT '10',
  `localisation` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_materiau` (`code_materiau`),
  KEY `idx_materiaux_quantite` (`quantite`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `ouvriers`
--

DROP TABLE IF EXISTS `ouvriers`;
CREATE TABLE IF NOT EXISTS `ouvriers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `matricule` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `metier` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_embauche` date DEFAULT NULL,
  `salaire_journalier` decimal(10,2) DEFAULT NULL,
  `actif` tinyint(1) DEFAULT '1',
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricule` (`matricule`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `taches_chantier`
--

DROP TABLE IF EXISTS `taches_chantier`;
CREATE TABLE IF NOT EXISTS `taches_chantier` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chantier_id` int NOT NULL,
  `ouvrier_id` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_debut` date DEFAULT NULL,
  `date_fin` date DEFAULT NULL,
  `priorite` enum('BASSE','NORMALE','HAUTE','URGENTE') COLLATE utf8mb4_unicode_ci DEFAULT 'NORMALE',
  `statut` enum('PLANIFIEE','EN_COURS','TERMINE','ANNULEE') COLLATE utf8mb4_unicode_ci DEFAULT 'PLANIFIEE',
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_to` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `chantier_id` (`chantier_id`),
  KEY `ouvrier_id` (`ouvrier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `commandes_btp`
--
ALTER TABLE `commandes_btp`
  ADD CONSTRAINT `commandes_btp_ibfk_1` FOREIGN KEY (`chantier_id`) REFERENCES `chantiers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `factures_btp`
--
ALTER TABLE `factures_btp`
  ADD CONSTRAINT `factures_btp_ibfk_1` FOREIGN KEY (`chantier_id`) REFERENCES `chantiers` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `lignes_commande_btp`
--
ALTER TABLE `lignes_commande_btp`
  ADD CONSTRAINT `lignes_commande_btp_ibfk_1` FOREIGN KEY (`commande_id`) REFERENCES `commandes_btp` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lignes_commande_btp_ibfk_2` FOREIGN KEY (`materiau_id`) REFERENCES `materiaux` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `taches_chantier`
--
ALTER TABLE `taches_chantier`
  ADD CONSTRAINT `taches_chantier_ibfk_1` FOREIGN KEY (`chantier_id`) REFERENCES `chantiers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `taches_chantier_ibfk_2` FOREIGN KEY (`ouvrier_id`) REFERENCES `ouvriers` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
