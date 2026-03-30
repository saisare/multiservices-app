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
-- Base de données : `communication_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `annonceurs`
--

DROP TABLE IF EXISTS `annonceurs`;
CREATE TABLE IF NOT EXISTS `annonceurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_annonceur` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom_entreprise` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_nom` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` text COLLATE utf8mb4_unicode_ci,
  `secteur_activite` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_annonceur` (`code_annonceur`),
  KEY `idx_annonceurs_secteur` (`secteur_activite`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `annonceurs`
--

INSERT INTO `annonceurs` (`id`, `code_annonceur`, `nom_entreprise`, `contact_nom`, `contact_email`, `contact_telephone`, `adresse`, `secteur_activite`, `date_creation`) VALUES
(1, 'ANN-001', 'Tech Solutions', 'Jean Konan', 'jean@techsolutions.com', NULL, NULL, 'Informatique', '2026-03-14 08:55:00'),
(2, 'ANN-002', 'Mode Express', 'Ama Koffi', 'ama@modeexpress.com', NULL, NULL, 'Commerce', '2026-03-14 08:55:00'),
(3, 'ANN-003', 'Auto Plus', 'Pierre Diallo', 'pierre@autoplus.com', NULL, NULL, 'Automobile', '2026-03-14 08:55:00'),
(4, 'ANN-000001', 'Tech SARL', NULL, 'contact@tech.fr', NULL, NULL, 'Technologie', '2026-03-14 11:37:48'),
(5, 'ANN-000002', 'Auto Groupe', NULL, 'info@auto.fr', NULL, NULL, 'Automobile', '2026-03-14 11:37:48');

-- --------------------------------------------------------

--
-- Structure de la table `campagnes`
--

DROP TABLE IF EXISTS `campagnes`;
CREATE TABLE IF NOT EXISTS `campagnes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_campagne` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `annonceur_id` int NOT NULL,
  `nom_campagne` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_campagne` enum('RESEAUX_SOCIAUX','GOOGLE_ADS','EMAILING','AFFICHAGE','RADIO','TV') COLLATE utf8mb4_unicode_ci NOT NULL,
  `objectif` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `budget` decimal(10,2) DEFAULT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `statut` enum('BROUILLON','EN_COURS','TERMINEE','ANNULEE') COLLATE utf8mb4_unicode_ci DEFAULT 'BROUILLON',
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_campagne` (`code_campagne`),
  KEY `idx_campagnes_annonceur` (`annonceur_id`),
  KEY `idx_campagnes_dates` (`date_debut`,`date_fin`),
  KEY `idx_campagnes_statut` (`statut`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `campagnes`
--

INSERT INTO `campagnes` (`id`, `code_campagne`, `annonceur_id`, `nom_campagne`, `type_campagne`, `objectif`, `budget`, `date_debut`, `date_fin`, `statut`, `date_creation`, `created_by`, `assigned_to`) VALUES
(1, 'CAMP-001', 1, 'Lancement App', 'RESEAUX_SOCIAUX', NULL, 5000.00, '2024-04-01', '2024-05-30', 'BROUILLON', '2026-03-14 08:55:01', NULL, NULL),
(2, 'CAMP-002', 2, 'Soldes Été', 'GOOGLE_ADS', NULL, 3000.00, '2024-06-01', '2024-07-31', 'BROUILLON', '2026-03-14 08:55:01', NULL, NULL),
(3, 'CAMP-003', 3, 'Promo Rentrée', 'EMAILING', NULL, 1500.00, '2024-08-15', '2024-09-15', 'BROUILLON', '2026-03-14 08:55:01', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `contrats_communication`
--

DROP TABLE IF EXISTS `contrats_communication`;
CREATE TABLE IF NOT EXISTS `contrats_communication` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_contrat` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `campagne_id` int NOT NULL,
  `date_signature` date DEFAULT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `montant_total` decimal(10,2) DEFAULT NULL,
  `conditions` text COLLATE utf8mb4_unicode_ci,
  `statut` enum('ACTIF','TERMINE','RESILIE') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIF',
  `chemin_fichier` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_contrat` (`numero_contrat`),
  KEY `campagne_id` (`campagne_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `performances`
--

DROP TABLE IF EXISTS `performances`;
CREATE TABLE IF NOT EXISTS `performances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campagne_id` int NOT NULL,
  `date_mesure` date NOT NULL,
  `impressions` int DEFAULT '0',
  `clics` int DEFAULT '0',
  `conversions` int DEFAULT '0',
  `cout` decimal(10,2) DEFAULT '0.00',
  `revenu` decimal(10,2) DEFAULT '0.00',
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_performances_campagne` (`campagne_id`),
  KEY `idx_performances_date` (`date_mesure`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `performances`
--

INSERT INTO `performances` (`id`, `campagne_id`, `date_mesure`, `impressions`, `clics`, `conversions`, `cout`, `revenu`, `created_by`) VALUES
(1, 1, '2024-04-15', 10000, 500, 50, 1000.00, 2500.00, NULL),
(2, 1, '2024-04-30', 15000, 750, 75, 1500.00, 3750.00, NULL),
(3, 2, '2024-06-15', 8000, 400, 30, 800.00, 1800.00, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `publications`
--

DROP TABLE IF EXISTS `publications`;
CREATE TABLE IF NOT EXISTS `publications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campagne_id` int NOT NULL,
  `plateforme` enum('FACEBOOK','INSTAGRAM','LINKEDIN','TWITTER','TIKTOK','YOUTUBE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `titre` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contenu` text COLLATE utf8mb4_unicode_ci,
  `media_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_publication` datetime DEFAULT NULL,
  `statut` enum('PLANIFIE','PUBLIE','ERREUR') COLLATE utf8mb4_unicode_ci DEFAULT 'PLANIFIE',
  `engagement` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_publications_campagne` (`campagne_id`),
  KEY `idx_publications_date` (`date_publication`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `stats_temps_reel`
--

DROP TABLE IF EXISTS `stats_temps_reel`;
CREATE TABLE IF NOT EXISTS `stats_temps_reel` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campagne_id` int NOT NULL,
  `timestamp_mesure` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `vues_en_direct` int DEFAULT '0',
  `clics_en_direct` int DEFAULT '0',
  `conversions_en_direct` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `campagne_id` (`campagne_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
