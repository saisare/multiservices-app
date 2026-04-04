#!/bin/bash
# Script pour réinitialiser la BD WAMP
# Supprime les 8 BDs et en crée 1 seule

echo "🔴 ATTENTION: Cela va SUPPRIMER TOUTES les BDs et en recréer 1 seule!"
echo "Continuez? (tapez 'OUI')"
read response

if [ "$response" != "OUI" ]; then
  echo "Annulé"
  exit 1
fi

echo "⏳ Suppression des anciennes BDs..."

# Les commandes MySQL pour supprimer et recréer
mysql -u root -p'' -h localhost << EOF
DROP DATABASE IF EXISTS auth_db;
DROP DATABASE IF EXISTS btp_db;
DROP DATABASE IF EXISTS assurance_db;
DROP DATABASE IF EXISTS communication_db;
DROP DATABASE IF EXISTS communication_db;
DROP DATABASE IF EXISTS rh_db;
DROP DATABASE IF EXISTS immigration_db;
DROP DATABASE IF EXISTS logistique_db;
DROP DATABASE IF EXISTS voyage_db;

CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auth_db;

EOF

echo "✅ BDs supprimées et auth_db créée!"
echo "⏳ Création des tables..."

# Exécuter le fichier SQL
mysql -u root -p'' -h localhost auth_db < ./unified_database.sql

echo "✅ BD auth_db initialisée avec succès!"
echo "📊 Contenu:"
mysql -u root -p'' -h localhost auth_db -e "SHOW TABLES;"
