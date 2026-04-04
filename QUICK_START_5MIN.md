# 🚀 QUICK START - EN 5 MINUTES

## ✅ Tout est PRÊT! Voici comment tester:

---

## 📍 ÉTAPE 1: Démarre 4 Terminaux

### Terminal 1: Auth Service (REQUIS!)
```bash
cd backend/auth-service
npm start
```
**Attend**: ✅ Connected to MySQL Auth
**Port**: 3002

### Terminal 2: BTP
```bash
cd backend/btp
npm start
```
**Port**: 3003

### Terminal 3: API Gateway
```bash
cd backend/api-gateway
npm start
```
**Port**: 3001

### Terminal 4: Frontend
```bash
cd frontend
npm run dev
```
**Port**: 3000

---

## 🏠 ÉTAPE 2: Ouvre Home Page

**URL**: `http://localhost:3000`

Tu vois: 2 Cartes (ADMIN + USERS)

---

## 🔴 TEST 1: Admin Login

```
1. Clique la carte RED "Administrateur"
2. Arrive à /admin-login
3. Entre:
   Email:    admin@blg-engineering.com
   Password: Blg1app23@
4. Clique "Accès Administrateur"
5. ✅ SUCCESS → /admin dashboard!
```

---

## 🔵 TEST 2: Directeur Login

```
1. Retour http://3000
2. Clique carte BLUE "Employés"
3. Arrive à /login
4. Entre:
   Email:    directeur@blg-engineering.com
   Password: Director2026@
   Dept:     (n'importe lequel)
5. Clique "Se connecter"
6. ✅ SUCCESS → /dashboard/directeur!
```

---

## 👤 TEST 3: Employé Login

```
1. Logout (logout button en haut)
2. Va /login
3. Entre:
   Email:    kaidoxkaid0@gmail.com
   Password: Junior23@
   Dept:     Service Voyage...
4. Clique login
5. ✅ SUCCESS → /dashboard/voyage!
```

---

## ❌ TEST 4: Admin Rejeté sur /login

```
1. Va /login directement
2. Sélectionne Department
3. Entre credentials admin:
   Email:    admin@blg-engineering.com
   Password: Blg1app23@
4. Clique login
5. ❌ REJETÉ - Message d'erreur
6. Auto-redirect /admin-login
```

---

## 🎊 C'EST TOUT!

Tout fonctionne! ✅

**Résumé:**
- ✅ Home page 2 portails
- ✅ Admin séparé (RED)
- ✅ Users normal (BLUE)
- ✅ Directeur = vision 360°
- ✅ Employé = department only
- ✅ Sécurité BCRYPT
- ✅ Auto-protection admin

---

## 📚 Pour Plus de Details:

- `DOCUMENTAIRE_COMPLET.md` - Full guide
- `CREDENTIALS_VERIFIEES.md` - Tous les comptes
- `ADMIN_PORTAIL_SEPARE.md` - Architecture sécurité

---

## 🆘 Emergency Fixes:

### Erreur "Cannot reach localhost:3002"?
```
→ Terminal 1 pas démarré!
→ npm start dans backend/auth-service
```

### Erreur "Email ou mot de passe incorrect"?
```
→ Check console F12
→ Vérifier email EXACT
→ Vérifier password EXACT (case-sensitive)
→ Vérifier DB (voir CREDENTIALS_VERIFIEES)
```

### Frontend blank page?
```
→ Ctrl+F5 (hard refresh)
→ Terminal 4: Stop (Ctrl+C) + npm run dev
```

---

## ✅ SUCCESS INDICATORS

Si tu vois ceci = tout OK! ✅

```
Terminal 1: ✅ Connected to MySQL Auth
Terminal 2: ✅ BTP Service running on 3003
Terminal 3: ✅ API Gateway running on 3001
Terminal 4: ✅ Frontend compiled successfully

Browser: 2 Cards visible → HOME PAGE OK! ✅
         Red "Admin" card → Can click
         Blue "Users" card → Can click

Admin login OK: ✅ Dashboard /admin loads
User login OK: ✅ Dashboard /dashboard/voyage loads
```

---

## 🎯 NEXT STEPS

Après tests:
1. Explorer /admin dashboard
2. Approve pending users (8 en attente)
3. Test immigration messages (NEW!)
4. Explore voyage dashboard
5. Lire documentaires au besoin

---

**Ready Go!** 🚀

Questions? F12 Console voie les errors!
