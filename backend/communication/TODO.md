# TODO Service Communication ✅ Erreurs corrigées

## 🚀 Démarrage
```
cd backend/communication
npm start  # ou npm run dev
```

## 📋 Tests Postman (localhost:3008 - no token)
| Endpoint | Method | Exemple |
|----------|--------|---------|
| `/health` | GET | OK |
| `/api/annonceurs` | GET | Liste |
| `/api/annonceurs` | POST | `{"nom_entreprise":"Test", "contact_email":"test@test.com"}` |
| `/api/campagnes` | POST | `{"annonceur_id":1, "nom_campagne":"Test Campagne"}` |

## ⏳ À faire
- [ ] Frontend pages communication
- [ ] Dashboard campagnes (charts perf)
- [ ] Export CSV performances
- [ ] Alertes budget dépassé

