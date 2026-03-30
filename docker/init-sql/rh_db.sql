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
-- Base de données : `rh_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `conges`
--

DROP TABLE IF EXISTS `conges`;
CREATE TABLE IF NOT EXISTS `conges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `type_conge` enum('ANNUEL','MALADIE','SANS_SOLDE','MATERNITE','PATERNITE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `nb_jours` int GENERATED ALWAYS AS (((to_days(`date_fin`) - to_days(`date_debut`)) + 1)) STORED,
  `motif` text COLLATE utf8mb4_unicode_ci,
  `statut` enum('EN_ATTENTE','VALIDE','REFUSE') COLLATE utf8mb4_unicode_ci DEFAULT 'EN_ATTENTE',
  `date_demande` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_validation` date DEFAULT NULL,
  `valide_par` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `employe_id` (`employe_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `contrats`
--

DROP TABLE IF EXISTS `contrats`;
CREATE TABLE IF NOT EXISTS `contrats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `numero_contrat` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_contrat` enum('CDI','CDD','STAGE','FREELANCE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date DEFAULT NULL,
  `poste` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salaire` decimal(10,2) DEFAULT NULL,
  `duree_essai` int DEFAULT NULL,
  `fichier_contrat` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('ACTIF','TERMINE','RESILIE') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIF',
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_contrat` (`numero_contrat`),
  KEY `employe_id` (`employe_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `documents_rh`
--

DROP TABLE IF EXISTS `documents_rh`;
CREATE TABLE IF NOT EXISTS `documents_rh` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `type_document` enum('CV','DIPLOME','CERTIFICAT','CONTRAT','BULLETIN','AUTRE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom_fichier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chemin_fichier` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_upload` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `confidentiel` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `employe_id` (`employe_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `employes`
--

DROP TABLE IF EXISTS `employes`;
CREATE TABLE IF NOT EXISTS `employes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `matricule` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `poste` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_embauche` date DEFAULT NULL,
  `salaire` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricule` (`matricule`),
  KEY `idx_employes_nom` (`nom`,`prenom`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `evaluations`
--

DROP TABLE IF EXISTS `evaluations`;
CREATE TABLE IF NOT EXISTS `evaluations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `evaluateur_id` int DEFAULT NULL,
  `date_evaluation` date NOT NULL,
  `periode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note_technique` int DEFAULT NULL,
  `note_comportement` int DEFAULT NULL,
  `note_global` decimal(3,2) GENERATED ALWAYS AS (((`note_technique` + `note_comportement`) / 2)) STORED,
  `commentaires` text COLLATE utf8mb4_unicode_ci,
  `objectifs_futurs` text COLLATE utf8mb4_unicode_ci,
  `fichier_evaluation` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `employe_id` (`employe_id`)
) ;

-- --------------------------------------------------------

--
-- Structure de la table `formations`
--

DROP TABLE IF EXISTS `formations`;
CREATE TABLE IF NOT EXISTS `formations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `titre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organisme` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_debut` date DEFAULT NULL,
  `date_fin` date DEFAULT NULL,
  `duree_heures` int DEFAULT NULL,
  `cout` decimal(10,2) DEFAULT NULL,
  `certificat_obtenu` tinyint(1) DEFAULT '0',
  `fichier_certificat` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `employe_id` (`employe_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `paie`
--

DROP TABLE IF EXISTS `paie`;
CREATE TABLE IF NOT EXISTS `paie` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `mois` int NOT NULL,
  `annee` int NOT NULL,
  `salaire_base` decimal(10,2) DEFAULT NULL,
  `primes` decimal(10,2) DEFAULT '0.00',
  `indemnites` decimal(10,2) DEFAULT '0.00',
  `cotisations` decimal(10,2) DEFAULT NULL,
  `net_a_payer` decimal(10,2) DEFAULT NULL,
  `date_paie` date DEFAULT NULL,
  `fichier_bulletin` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('PREPARE','VALIDE','PAYE') COLLATE utf8mb4_unicode_ci DEFAULT 'PREPARE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_paie` (`employe_id`,`mois`,`annee`)
) ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
