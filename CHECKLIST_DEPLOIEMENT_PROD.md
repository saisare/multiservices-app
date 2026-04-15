# CHECKLIST DEPLOIEMENT PRODUCTION - MULTISERVICES-APP

## 1) Pre-deploiement
- [ ] `git pull` sur branche cible
- [ ] Variables d'environnement completes pour chaque service
- [ ] Secrets non hardcodes (JWT, DB creds)
- [ ] Build frontend OK (`npm run build`)
- [ ] Test integration backend OK (`node backend/test-all-services.js`)
- [ ] Diagnostic DB OK (`node backend/check_db.js`)

## 2) Base de donnees
- [ ] Sauvegarde complete avant deploiement
- [ ] Existence des bases: `auth_db`, `btp_db`, `assurance_db`, `communication_db`, `rh_db`, `logistique_db`, `voyage_db`, `immigration_db`
- [ ] Tables auth critiques presentes: users, notifications, user_preferences, internal_messages, document_transfers, connection_logs
- [ ] Compte admin actif valide

## 3) Ordre de demarrage recommande
1. [ ] DB
2. [ ] auth-service (3002)
3. [ ] services metier (3003, 3004, 3005, 3006, 3008, 3009)
4. [ ] api-gateway (3001)
5. [ ] frontend (3000)

## 4) Monitoring/observabilite
- [ ] Gateway `/health` repond 200
- [ ] Gateway `/ready` repond 200 (ou 503 explicite si upstream down)
- [ ] Gateway `/metrics` expose compteurs runtime
- [ ] Correlation ID (`x-request-id`) visible dans logs gateway
- [ ] Logs centralises (stdout aggregator ou ELK/Datadog/Loki)
- [ ] Alertes configurees:
  - [ ] Gateway 5xx rate
  - [ ] Upstream error rate
  - [ ] Latence p95/p99
  - [ ] DB saturation/erreurs connexions

## 5) Resilience/scalabilite
- [ ] Timeouts gateway ajustes (`PROXY_TIMEOUT_MS`, `HEALTH_TIMEOUT_MS`)
- [ ] Keep-alive/timeouts HTTP ajustes
- [ ] Restart policy active (systemd/docker/k8s)
- [ ] Readiness/liveness utilises par orchestrateur
- [ ] Min 2 replicas gateway en prod (si LB)
- [ ] Load balancer actif + healthcheck

## 6) Securite
- [ ] CORS strict en production
- [ ] HTTPS force (TLS)
- [ ] Rotation des secrets planifiee
- [ ] Headers de securite (via reverse proxy)
- [ ] Comptes admin verifies et tracabilite des actions

## 7) Validation fonctionnelle post-deploiement
- [ ] Login admin OK
- [ ] Profil + preferences OK
- [ ] Notifications OK
- [ ] Messages internes OK
- [ ] Document transfers OK
- [ ] Dashboards departements OK
- [ ] Flux BTP/Assurance/Communication/RH/Logistique/Voyage OK

## 8) Plan de rollback
- [ ] Snapshot DB disponible
- [ ] Version N-1 packagee
- [ ] Procedure rollback documentee (code + variables + DB)
- [ ] Critere de rollback defini (SLO/SLA)

## 9) Commandes utiles
```powershell
# Frontend build
cd frontend; npm run build

# Backend integration tests
cd ..\backend; node test-all-services.js

# DB quick check
cd ..\backend; node check_db.js

# Gateway hardening checks
Invoke-WebRequest http://localhost:3001/health -UseBasicParsing
Invoke-WebRequest http://localhost:3001/ready -UseBasicParsing
Invoke-WebRequest http://localhost:3001/metrics -UseBasicParsing
```
