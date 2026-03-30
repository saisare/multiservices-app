# TODO Service BTP ✅ Schema créé

✅ **Tables BTP créées**: `create_tables.sql` prêt !

## 🚀 Prochaines étapes

1. **Exécuter SQL**:
   ```
   # phpMyAdmin http://localhost:8081 → DB multiservices → SQL → coller create_tables.sql → Exécuter
   ```

2. **Démarrer services**:
   ```
   cd multiservices-app/docker && docker compose up -d
   cd ../backend/btp && npm install && npm start
   ```

3. **Tester**:
   ```
   curl http://localhost:3003/health
   # Puis avec token: /api/chantiers /api/stats
   ```

## 📋 À faire
- [ ] Pages frontend BTP (dashboard/chantiers etc.)
- [ ] Upload images chantiers
- [ ] Génération PDF factures
- [ ] Notifications stock faible

