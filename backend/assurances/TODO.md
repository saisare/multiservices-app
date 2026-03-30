# TODO - Résolution Erreurs Service Assurances

## ✅ TERMINÉ
- [x] Créé `.env` avec variables DB/JWT
- [x] Créé `create_tables.sql` avec tables manquantes (assures, polices, sinistres, experts)
- [x] `npm install` exécuté (dépendances installées)

## 🔄 À FAIRE (manuel)
1. **Importer SQL en DB** :
   ```
   # Option Docker (recommander)
   docker-compose up -d mysql phpmyadmin
   # phpMyAdmin: http://localhost:8081 (user root, pass root)
   # Importez multiservices-app/docker/init.SQL puis assurances/create_tables.sql
   ```
   
   OU si MySQL local :
   ```
   mysql -u root -p multiservices < docker/init.SQL
   mysql -u root -p multiservices < assurances/create_tables.sql
   ```

2. **Démarrer serveur assurances** :
   ```
   cd multiservices-app/backend/assurances
   npm start
   ```
   Health check: `curl http://localhost:3004/health`

## 📝 Test Auth
Le middleware JWT requiert token de auth-service (localhost:3000/api/auth/login avec admin@multiservices.com / admin123)

**Statut : PRÊT À FONCTIONNER après import SQL !**
