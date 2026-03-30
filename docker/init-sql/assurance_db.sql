-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : jeu. 19 mars 2026 à 18:02
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
-- Base de données : `assurance_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `assures`
--

DROP TABLE IF EXISTS `assures`;
CREATE TABLE IF NOT EXISTS `assures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_assure` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_assure` enum('PARTICULIER','ENTREPRISE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entreprise` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` text COLLATE utf8mb4_unicode_ci,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_assure` (`code_assure`),
  KEY `idx_assures_nom` (`nom`,`prenom`),
  KEY `idx_assures_code` (`code_assure`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `assures`
--

INSERT INTO `assures` (`id`, `code_assure`, `type_assure`, `nom`, `prenom`, `entreprise`, `date_naissance`, `email`, `telephone`, `adresse`, `date_creation`, `created_by`, `updated_by`) VALUES
(1, 'ASS-001', 'PARTICULIER', 'Koffi', 'Ama', NULL, NULL, 'ama.koffi@email.com', '0123456789', NULL, '2026-03-13 19:00:59', NULL, NULL),
(2, 'ASS-002', 'PARTICULIER', 'Konan', 'Jean', NULL, NULL, 'jean.konan@email.com', '0234567890', NULL, '2026-03-13 19:00:59', NULL, NULL),
(3, 'ASS-003', 'ENTREPRISE', 'Tech Solutions', NULL, NULL, NULL, 'contact@techsolutions.fr', '0345678901', NULL, '2026-03-13 19:00:59', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `contrats_assurance`
--

DROP TABLE IF EXISTS `contrats_assurance`;
CREATE TABLE IF NOT EXISTS `contrats_assurance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_contrat` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assure_id` int DEFAULT NULL,
  `type_assurance` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_effet` date DEFAULT NULL,
  `date_echeance` date DEFAULT NULL,
  `montant` decimal(10,2) DEFAULT NULL,
  `statut` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_contrat` (`numero_contrat`),
  KEY `assure_id` (`assure_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `experts`
--

DROP TABLE IF EXISTS `experts`;
CREATE TABLE IF NOT EXISTS `experts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_expert` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specialite` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` text COLLATE utf8mb4_unicode_ci,
  `actif` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_expert` (`code_expert`),
  KEY `idx_experts_specialite` (`specialite`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `experts`
--

INSERT INTO `experts` (`id`, `code_expert`, `nom`, `prenom`, `specialite`, `email`, `telephone`, `adresse`, `actif`) VALUES
(1, 'EXP-001', 'Dubois', 'Pierre', 'Expert automobile', 'pierre.dubois@expert.fr', '0123456789', NULL, 1),
(2, 'EXP-002', 'Martin', 'Sophie', 'Expert habitation', 'sophie.martin@expert.fr', '0234567890', NULL, 1),
(3, 'EXP-003', 'Bernard', 'Jean', 'Expert santé', 'jean.bernard@expert.fr', '0345678901', NULL, 1);

-- --------------------------------------------------------

--
-- Structure de la table `polices_assurance`
--

DROP TABLE IF EXISTS `polices_assurance`;
CREATE TABLE IF NOT EXISTS `polices_assurance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_police` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assure_id` int NOT NULL,
  `type_assurance` enum('AUTO','HABITATION','SANTE','VIE','PROFESSIONNELLE','VOYAGE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_effet` date NOT NULL,
  `date_echeance` date NOT NULL,
  `prime_annuelle` decimal(10,2) NOT NULL,
  `franchise` decimal(10,2) DEFAULT NULL,
  `plafond_remboursement` decimal(12,2) DEFAULT NULL,
  `statut` enum('ACTIVE','SUSPENDUE','RESILIEE','EXPIREE') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `conditions` text COLLATE utf8mb4_unicode_ci,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_police` (`numero_police`),
  KEY `idx_polices_assure` (`assure_id`),
  KEY `idx_polices_numero` (`numero_police`),
  KEY `idx_polices_echeance` (`date_echeance`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `polices_assurance`
--

INSERT INTO `polices_assurance` (`id`, `numero_police`, `assure_id`, `type_assurance`, `date_effet`, `date_echeance`, `prime_annuelle`, `franchise`, `plafond_remboursement`, `statut`, `conditions`, `date_creation`, `created_by`, `assigned_to`) VALUES
(1, 'POL-2024-001', 1, 'AUTO', '2024-01-01', '2024-12-31', 500.00, 150.00, 10000.00, 'ACTIVE', NULL, '2026-03-13 19:00:59', NULL, NULL),
(2, 'POL-2024-002', 2, 'HABITATION', '2024-02-01', '2025-01-31', 300.00, 200.00, 50000.00, 'ACTIVE', NULL, '2026-03-13 19:00:59', NULL, NULL),
(3, 'POL-2024-003', 3, 'PROFESSIONNELLE', '2024-03-01', '2025-02-28', 1200.00, 500.00, 100000.00, 'ACTIVE', NULL, '2026-03-13 19:00:59', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `reglements`
--

DROP TABLE IF EXISTS `reglements`;
CREATE TABLE IF NOT EXISTS `reglements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sinistre_id` int NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `date_reglement` date NOT NULL,
  `mode_reglement` enum('VIREMENT','CHEQUE','ESPECES') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `beneficiaire` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reglements_sinistre` (`sinistre_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `reglements`
--

INSERT INTO `reglements` (`id`, `sinistre_id`, `montant`, `date_reglement`, `mode_reglement`, `reference`, `beneficiaire`, `notes`, `date_creation`) VALUES
(1, 1, 2000.00, '2024-03-20', 'VIREMENT', 'VIR-2024-001', 'Jean Konan', NULL, '2026-03-13 19:00:59');

-- --------------------------------------------------------

--
-- Structure de la table `sinistres`
--

DROP TABLE IF EXISTS `sinistres`;
CREATE TABLE IF NOT EXISTS `sinistres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_sinistre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `police_id` int NOT NULL,
  `date_sinistre` date NOT NULL,
  `lieu_sinistre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `montant_estime` decimal(10,2) DEFAULT NULL,
  `montant_rembourse` decimal(10,2) DEFAULT NULL,
  `statut` enum('DECLARE','EN_INSTRUCTION','ACCEPTE','REFUSE','INDEMNISE') COLLATE utf8mb4_unicode_ci DEFAULT 'DECLARE',
  `expert_id` int DEFAULT NULL,
  `date_decision` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_sinistre` (`numero_sinistre`),
  KEY `idx_sinistres_police` (`police_id`),
  KEY `idx_sinistres_statut` (`statut`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sinistres`
--

INSERT INTO `sinistres` (`id`, `numero_sinistre`, `police_id`, `date_sinistre`, `lieu_sinistre`, `description`, `montant_estime`, `montant_rembourse`, `statut`, `expert_id`, `date_decision`, `notes`, `date_creation`, `created_by`, `assigned_to`) VALUES
(1, 'SIN-2024-001', 1, '2024-03-10', 'Abidjan, Cocody', 'Accident de voiture avec dégâts matériels', 2500.00, NULL, 'EN_INSTRUCTION', 1, NULL, NULL, '2026-03-13 19:00:59', NULL, NULL),
(2, 'SIN-2024-002', 2, '2024-03-15', 'Abidjan, Plateau', 'Dégât des eaux dans appartement', 800.00, NULL, 'DECLARE', 2, NULL, NULL, '2026-03-13 19:00:59', NULL, NULL);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
