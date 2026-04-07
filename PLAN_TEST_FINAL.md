# 🧪 PLAN DE TEST FINAL - SYSTÈME COMPLET

## ✅ Phase 1: Vérification Build (En cours)

```bash
# Status: Compilation TypeScript...
# Expected: Exit code 0, "successfully"
# Time: ~60-90 secondes
```

**Checklist:**
- [ ] Pas d'erreurs TypeScript
- [ ] Pas de warnings critiques
- [ ] Build output: `.next/` créé

---

## ✅ Phase 2: Démarrage Services (Après build)

### Terminal 1: Auth Service
```bash
cd backend/auth-service
npm start
# Expected: ✅ Connected to MySQL (auth_db)
# Port: 3002
```

### Terminal 2: BTP Service
```bash
cd backend/btp
npm start
# Expected: Server running on port 3003
```

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
# Expected: Ready in X seconds, http://localhost:3000
# Port: 3000
```

---

## 🎯 Phase 3: Tests Frontales Visuels

### 3.1 Page d'Accueil
```
URL: http://localhost:3000
Expected:
✓ Splash screen de chargement visible
✓ Titre "BLG-ENGINEERING" visible
✓ 2 Boutons: "🔴 Administrateur" (RED) + "🔵 Employés" (BLUE)
✓ Description de chaque portail
✓ No JavaScript errors in console
```

### 3.2 Admin Login
```
URL: http://localhost:3000/admin-login
Credentials: admin@blg-engineering.com / BtpAdmin2026@
Expected:
✓ RED theme cohérent
✓ Formulaire complet
✓ Bouton "Se connecter" fonctionnel
✓ Après connexion: redirect à /admin
✓ Success message visible
```

### 3.3 User Login
```
URL: http://localhost:3000/login
Credentials: kaidoxkaid0@gmail.com / Junior23@
Expected:
✓ BLUE theme cohérent
✓ Sélecteur département visible
✓ Après connexion: redirect à /dashboard/[dept]
✓ Dashboard chargé correctement
```

---

## 🔍 Phase 4: Tests Pages Assurance

### 4.1 Page Assurés
```
URL: http://localhost:3000/dashboard/assurance/assures
Expected:
✓ Liste d'assurés affichée (3 cartes)
✓ Recherche fonctionne (taper "Konan")
✓ Filtre type fonctionne (PARTICULIER/ENTREPRISE)
✓ Bouton "Nouvel assuré" visible et cliquable
✓ Pas d'erreur "filter is not a function"

Test Bouton du Nouveau:
→ Click "Nouvel assuré"
✓ URL change à ?action=new
✓ Formulaire d'ajout affiche
✓ BackButton visible en haut à gauche

Test Détails:
→ Click œil sur une card
✓ URL change à ?action=detail&id=1
✓ Informations de l'assuré affichées
✓ Bouton "Supprimer" visible
✓ BackButton fonctionne
```

### 4.2 Page Sinistres
```
URL: http://localhost:3000/dashboard/assurance/sinistres
Expected:
✓ Liste sinistres avec statut badge
✓ Recherche par numéro/nom
✓ Filtre statut fonctionne
✓ Bouton "Nouveau sinistre" visible
✓ Detail page fonctionne
✓ BackButton visible
```

### 4.3 Page Experts
```
URL: http://localhost:3000/dashboard/assurance/expert
Expected:
✓ Liste experts en cards
✓ Recherche fonctionne
✓ Créer nouvel expert possible
✓ Détails expert affichés
✓ Navigation complète
```

---

## 🌐 Phase 5: Tests Voyage & Immigration

### 5.1 Voyage / Dossiers
```
URL: http://localhost:3000/dashboard/voyage/dossiers
Expected:
✓ Page charge sans erreur "filter is not a function"
✓ Filtrage et recherche fonctionnent
✓ Pas de console errors
```

### 5.2 Immigration / Dossiers
```
URL: http://localhost:3000/dashboard/service-immigration/dossiers
Expected:
✓ Page charge correctement
✓ filter() fonctionne sur dossiers
✓ Liste affichée
```

---

## ⚠️ Phase 6: Tests Erreurs

### 6.1 ErrorBoundary
```javascript
// Intentionnellement créer une erreur dans browser console
console.error("Test error");

Or go to: http://localhost:3000/non-existent-page

Expected:
✓ Error Fallback UI affiche (red bg)
✓ Message amical "Oups! Une erreur s'est produite"
✓ Bouton "Réessayer" fonctionne
✓ Bouton "Aller à l'accueil" fonctionne
```

### 6.2 Alertes
```
Expected sur les pages de création:
✓ Alert rouge si champ obligatoire vide
✓ Alert verte après création réussie
✓ Alert disappear après 5 secondes
✓ Bouton X ferme l'alert
```

---

## 📊 Phase 7: Tests Performance

### 7.1 Chargement
```
F12 → Network → Refresh
Expected:
✓ Page chargement < 3 secondes
✓ Pas de pending requests
✓ Pas de 404 errors
✓ Images/assets chargées
```

### 7.2 Interactions
```
Expected:
✓ Transitions lisses (pas de lag)
✓ Boutons répondent immédiatement
✓ Recherche réactive (< 100ms)
✓ Scroll fluide
```

### 7.3 Console
```
F12 → Console
Expected:
✓ Pas de RED errors
✓ Warnings acceptables (eg. deprecated APIs)
✓ Pas de Network errors
```

---

## 📋 Checklist Finale

### Frontend
- [ ] Build réussit (exit 0)
- [ ] http://localhost:3000 se charge
- [ ] Splash screen visible
- [ ] Portals = RED + BLUE
- [ ] Admin login → /admin
- [ ] User login → /dashboard

### Navigation
- [ ] BackButton présent sur pages détail
- [ ] BackButton fonctionne
- [ ] URL params (?action=new, ?id=1) fonctionnent
- [ ] Navigation fluide

### Assurance
- [ ] Assurés: list/new/detail
- [ ] Sinistres: list/new/detail
- [ ] Experts: list/new/detail
- [ ] Recherche + filtrage work
- [ ] No "filter is not a function" errors

### Voyages/Immigration
- [ ] Dossiers page charge
- [ ] Pas d'erreur "filter is not a function"
- [ ] Filtering works

### Erreurs
- [ ] ErrorBoundary déploié
- [ ] Alertes fonctionnent
- [ ] Console propre

### Performance
- [ ] Pages < 3s load
- [ ] Smooth interactions
- [ ] Network clean

---

## 🚀 Résultat Final

```
SYSTÈME COMPLET ✅

Si tous les checks ✓:
→ Ready for production! 🎉
→ Push to GitHub v4.0
→ Deploy final possible

Si quelques ❌:
→ Lister issues
→ Quick fixes
→ Re-test
```

---

## 📝 Notes de Test

- **Auth:** Admin/User credentials déjà configurées
- **BD:** Mock data en localStorage, pas besoin DB réelle
- **Erreurs:** Volontairement crash une page pour tester ErrorBoundary
- **Console:** F12 pour vérifier errors/warnings
- **Network:** F12 → Network pour voir requêtes API

---

**Status:** ⏳ Compilation... À suivre!
