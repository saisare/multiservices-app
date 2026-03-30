-- Exemple d'insertion utilisateur BTP (exécutez dans votre DB auth_db)
-- Remplacez 'votre_password_plain' par mot de passe fort ex: 'BtpUser2024!'
-- Utilisez bcrypt pour hasher: node -e "console.log(require('bcryptjs').hashSync('BtpUser2024!', 10))"

INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, photo_profil, langue, date_creation, actif) 
VALUES (
  'BTP-001', 
  'Martin', 
  'Jean', 
  'jean.martin@blg-engineering.com', 
  '+33612345678', 
  'btp', 
  'Ouvrier', 
  'user', 
  '$2y$10$example_hash_here_from_bcrypt', 
  NULL, 
  'fr', 
  NOW(), 
  1
);

-- Vérifier
SELECT * FROM users WHERE matricule = 'BTP-001';

