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
-- Base de données : `immigration_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `candidats`
--

DROP TABLE IF EXISTS `candidats`;
CREATE TABLE IF NOT EXISTS `candidats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_candidat` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_candidat` enum('PARTICULIER','GROUPE','ENTREPRISE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `nationalite` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passport_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passport_expiration` date DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` text COLLATE utf8mb4_unicode_ci,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_candidat` (`code_candidat`),
  UNIQUE KEY `passport_number` (`passport_number`),
  KEY `idx_candidats_nom` (`nom`,`prenom`),
  KEY `idx_candidats_passport` (`passport_number`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `candidats`
--

INSERT INTO `candidats` (`id`, `code_candidat`, `type_candidat`, `nom`, `prenom`, `date_naissance`, `nationalite`, `passport_number`, `passport_expiration`, `email`, `telephone`, `adresse`, `date_creation`, `created_by`, `updated_by`) VALUES
(1, 'CAND-001', 'PARTICULIER', 'Konan', 'Jean', NULL, 'Ivoirienne', 'PA123456', NULL, 'jean.konan@email.com', NULL, NULL, '2026-03-13 10:19:27', NULL, NULL),
(2, 'CAND-002', 'PARTICULIER', 'Diallo', 'Aminata', NULL, 'Sénégalaise', 'PA789012', NULL, 'aminata.diallo@email.com', NULL, NULL, '2026-03-13 10:19:27', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `clients`
--

DROP TABLE IF EXISTS `clients`;
CREATE TABLE IF NOT EXISTS `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_client` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_client` enum('PARTICULIER','GROUPE','ENTREPRISE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `nationalite` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passport_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passport_expiration` date DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` text COLLATE utf8mb4_unicode_ci,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_client` (`code_client`),
  UNIQUE KEY `passport_number` (`passport_number`),
  KEY `idx_clients_nom` (`nom`,`prenom`),
  KEY `idx_clients_passport` (`passport_number`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `clients`
--

INSERT INTO `clients` (`id`, `code_client`, `type_client`, `nom`, `prenom`, `date_naissance`, `nationalite`, `passport_number`, `passport_expiration`, `email`, `telephone`, `adresse`, `date_creation`) VALUES
(1, 'CLT-001', 'PARTICULIER', 'Konan', 'Jean', NULL, 'Ivoirienne', 'PA123456', NULL, 'jean.konan@email.com', NULL, NULL, '2026-03-12 10:40:25'),
(2, 'CLT-002', 'PARTICULIER', 'Diallo', 'Aminata', NULL, 'Sénégalaise', 'PA789012', NULL, 'aminata.diallo@email.com', NULL, NULL, '2026-03-12 10:40:25'),
(3, 'CLT-456051', 'PARTICULIER', 'Koffi', 'Ama', NULL, 'Ivoirienne', 'PA555555', NULL, 'ama.koffi@email.com', NULL, NULL, '2026-03-13 10:57:36');

-- --------------------------------------------------------

--
-- Structure de la table `consultants`
--

DROP TABLE IF EXISTS `consultants`;
CREATE TABLE IF NOT EXISTS `consultants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_consultant` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specialite` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actif` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_consultant` (`code_consultant`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `consultants`
--

INSERT INTO `consultants` (`id`, `code_consultant`, `nom`, `prenom`, `specialite`, `email`, `telephone`, `actif`) VALUES
(1, 'CONS-001', 'Martin', 'Sophie', 'Droit des étrangers', NULL, NULL, 1),
(2, 'CONS-002', 'Dubois', 'Pierre', 'Visa étudiants', NULL, NULL, 1);

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
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_destination` (`code_destination`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `destinations`
--

INSERT INTO `destinations` (`id`, `code_destination`, `pays`, `ville`, `aeroport_code`, `description`, `saison_haute`, `visa_requis`) VALUES
(1, 'DEST-001', 'Allemagne', 'Berlin', 'BER', NULL, NULL, 1),
(2, 'DEST-002', 'France', 'Paris', 'CDG', NULL, NULL, 0),
(3, 'DEST-003', 'Canada', 'Montréal', 'YUL', NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Structure de la table `documents`
--

DROP TABLE IF EXISTS `documents`;
CREATE TABLE IF NOT EXISTS `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dossier_id` int NOT NULL,
  `type_document` enum('PASSEPORT','DIPLOME','CASIER_JUDICIAIRE','CONTRAT_TRAVAIL','JUSTIFICATIF_DOMICILE','PHOTO_IDENTITE','LETTRE_MOTIVATION','BILLET_AVION','RESERVATION_HOTEL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom_fichier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chemin_fichier` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_upload` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `verifie` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `dossier_id` (`dossier_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `dossiers_immigration`
--

DROP TABLE IF EXISTS `dossiers_immigration`;
CREATE TABLE IF NOT EXISTS `dossiers_immigration` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_dossier` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` int NOT NULL,
  `reservation_id` int DEFAULT NULL,
  `type_demande` enum('VISA_ETUDIANT','VISA_TRAVAIL','VISA_FAMILLE','VISA_TOURISTIQUE','PERMIS_SEJOUR','NATURALISATION') COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_depot` date NOT NULL,
  `date_decision` date DEFAULT NULL,
  `statut` enum('EN_COURS','COMPLET','EN_INSTRUCTION','ACCEPTE','REFUSE','APPELLATION') COLLATE utf8mb4_unicode_ci DEFAULT 'EN_COURS',
  `ambassade` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_dossier_officiel` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `consultant_id` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_dossier` (`numero_dossier`),
  KEY `client_id` (`client_id`),
  KEY `reservation_id` (`reservation_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `dossiers_immigration`
--

INSERT INTO `dossiers_immigration` (`id`, `numero_dossier`, `client_id`, `reservation_id`, `type_demande`, `date_depot`, `date_decision`, `statut`, `ambassade`, `numero_dossier_officiel`, `consultant_id`, `notes`, `created_by`, `assigned_to`) VALUES
(1, 'DOS-2024-001', 1, 1, 'VISA_ETUDIANT', '2024-03-01', NULL, 'EN_INSTRUCTION', NULL, NULL, 1, NULL, NULL, NULL),
(2, 'DOS-2024-002', 2, NULL, 'VISA_TRAVAIL', '2024-03-15', NULL, 'COMPLET', NULL, NULL, 2, NULL, NULL, NULL),
(3, 'DOS-2024-003', 1, 1, 'VISA_ETUDIANT', '2024-03-01', NULL, 'EN_INSTRUCTION', NULL, NULL, 1, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `paiements`
--

DROP TABLE IF EXISTS `paiements`;
CREATE TABLE IF NOT EXISTS `paiements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `reservation_id` int DEFAULT NULL,
  `dossier_id` int DEFAULT NULL,
  `montant` decimal(10,2) NOT NULL,
  `type_paiement` enum('ACOMPTE_VOYAGE','SOLDE_VOYAGE','FRAIS_VISA','FRAIS_CONSULTANT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_paiement` date NOT NULL,
  `mode_paiement` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('EN_ATTENTE','RECU','REMBOURSE') COLLATE utf8mb4_unicode_ci DEFAULT 'RECU',
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `reservation_id` (`reservation_id`),
  KEY `dossier_id` (`dossier_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `rendez_vous`
--

DROP TABLE IF EXISTS `rendez_vous`;
CREATE TABLE IF NOT EXISTS `rendez_vous` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dossier_id` int NOT NULL,
  `type_rdv` enum('AMBASSADE','PREFECTURE','CONSULTANT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_rdv` datetime NOT NULL,
  `lieu` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('PLANIFIE','CONFIRME','ANNULE','PASSE') COLLATE utf8mb4_unicode_ci DEFAULT 'PLANIFIE',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dossier_id` (`dossier_id`),
  KEY `idx_rendez_vous_date` (`date_rdv`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_reservation` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` int NOT NULL,
  `type_reservation` enum('VOL','HOTEL','VOITURE','FORFAIT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `destination_id` int DEFAULT NULL,
  `date_depart` date NOT NULL,
  `date_retour` date NOT NULL,
  `statut` enum('CONFIRMEE','EN_ATTENTE','ANNULEE') COLLATE utf8mb4_unicode_ci DEFAULT 'CONFIRMEE',
  `montant_total` decimal(10,2) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_reservation` (`code_reservation`),
  KEY `client_id` (`client_id`),
  KEY `destination_id` (`destination_id`),
  KEY `idx_reservations_dates` (`date_depart`,`date_retour`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `reservations`
--

INSERT INTO `reservations` (`id`, `code_reservation`, `client_id`, `type_reservation`, `destination_id`, `date_depart`, `date_retour`, `statut`, `montant_total`, `notes`) VALUES
(1, 'RES-001', 1, 'FORFAIT', 1, '2024-06-15', '2024-06-30', 'CONFIRMEE', 2500.00, NULL),
(2, 'RES-002', 2, 'VOL', 2, '2024-07-10', '2024-07-20', 'CONFIRMEE', 850.00, NULL);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
