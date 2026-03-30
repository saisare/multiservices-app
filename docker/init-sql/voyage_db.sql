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
-- Base de données : `voyage_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `clients_voyage`
--

DROP TABLE IF EXISTS `clients_voyage`;
CREATE TABLE IF NOT EXISTS `clients_voyage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `destinations`
--

DROP TABLE IF EXISTS `destinations`;
CREATE TABLE IF NOT EXISTS `destinations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_destination` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pays` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ville` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aeroport_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `saison_haute` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visa_requis` tinyint(1) DEFAULT '0',
  `prix_moyen` decimal(10,2) DEFAULT NULL,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_destination` (`code_destination`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `factures_voyage`
--

DROP TABLE IF EXISTS `factures_voyage`;
CREATE TABLE IF NOT EXISTS `factures_voyage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_facture` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reservation_id` int NOT NULL,
  `date_emission` date DEFAULT NULL,
  `montant_ht` decimal(10,2) DEFAULT NULL,
  `tva` decimal(10,2) DEFAULT '0.00',
  `montant_ttc` decimal(10,2) DEFAULT NULL,
  `statut` enum('EMISE','PAYEE','ANNULEE') COLLATE utf8mb4_unicode_ci DEFAULT 'EMISE',
  `chemin_pdf` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_facture` (`numero_facture`),
  KEY `reservation_id` (`reservation_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `hotels`
--

DROP TABLE IF EXISTS `hotels`;
CREATE TABLE IF NOT EXISTS `hotels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `destination_id` int NOT NULL,
  `adresse` text COLLATE utf8mb4_unicode_ci,
  `etoiles` int DEFAULT NULL,
  `prix_nuit` decimal(10,2) DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_hotels_destination` (`destination_id`)
) ;

-- --------------------------------------------------------

--
-- Structure de la table `paiements_voyage`
--

DROP TABLE IF EXISTS `paiements_voyage`;
CREATE TABLE IF NOT EXISTS `paiements_voyage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reservation_id` int NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `type_paiement` enum('ACOMPTE','SOLDE','REMBOURSEMENT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_paiement` date NOT NULL,
  `mode_paiement` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('EN_ATTENTE','RECU','REMBOURSE') COLLATE utf8mb4_unicode_ci DEFAULT 'RECU',
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_paiements_reservation` (`reservation_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int DEFAULT NULL,
  `destination` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_depart` date DEFAULT NULL,
  `date_retour` date DEFAULT NULL,
  `statut` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_reservations_client` (`client_id`),
  KEY `idx_reservations_dates` (`date_depart`,`date_retour`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `vols`
--

DROP TABLE IF EXISTS `vols`;
CREATE TABLE IF NOT EXISTS `vols` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_vol` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `destination_id` int NOT NULL,
  `compagnie` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_depart` datetime NOT NULL,
  `date_arrivee` datetime NOT NULL,
  `prix` decimal(10,2) DEFAULT NULL,
  `places_disponibles` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_vol` (`code_vol`),
  KEY `idx_vols_destination` (`destination_id`),
  KEY `idx_vols_date` (`date_depart`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
