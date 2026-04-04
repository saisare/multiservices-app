-- Test data for BTP service
-- Execute in phpMyAdmin after create_tables.sql

USE multiservices;

-- Test Chantiers
INSERT INTO chantiers (code_chantier, nom, adresse, date_debut, budget, statut) VALUES
('CHT-001', 'Construction École Primaire', 'Paris 15e', '2026-04-01', 150000.00, 'EN_COURS'),
('CHT-002', 'Rénovation Hôtel', 'Lyon Centre', '2026-03-15', 85000.00, 'PLANIFIE');

-- Test Ouvriers  
INSERT INTO ouvriers (matricule, nom, prenom, metier, telephone, salaire_journalier) VALUES
('OUV-001', 'DUPONT', 'Jean', 'Maçon', '0612345678', 180.50),
('OUV-002', 'MARTIN', 'Pierre', 'Électricien', '0678901234', 210.00),
('OUV-003', 'DURAND', 'Marie', 'Plombier', '0698765432', 195.75);

-- Test Materiaux
INSERT INTO materiaux (code_materiau, nom, categorie, fournisseur, quantite, prix_unitaire, unite, seuil_alerte) VALUES
('MAT-001', 'Ciment CPJ 35', 'Ciment', 'Lafarge', 150, 8.50, 'SAC', 20),
('MAT-002', 'Brique creuse 20x20x5', 'Maçonnerie', 'Saint-Gobain', 5000, 0.45, 'UNITES', 100),
('MAT-003', 'Câble électrique 2.5mm²', 'Électricité', 'Legrand', 1200, 1.20, 'METRE', 50);

SELECT '✅ Test data inserted!' as status;

