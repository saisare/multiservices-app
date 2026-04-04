# TODO - Correction Services (Post-BTP)
✅ logistique.api.ts créé (port 3008)

## Étapes (priorité logistique → autres)

### 1. Créer API Clients (6 fichiers)
- ✅ `frontend/src/services/api/logistique.api.ts` (port 3008)
- [ ] `frontend/src/services/api/assurance.api.ts` (3004)  
- [ ] `frontend/src/services/api/communication.api.ts` (3005)
- [ ] `frontend/src/services/api/rh.api.ts` (3006)
- [ ] `frontend/src/services/api/immigration.api.ts` (3007)
- [ ] `frontend/src/services/api/voyage.api.ts` (3009)

### 2. Intégrer APIs dans Pages (mock → real)
**Logistique (onglets ouverts - priorité):**
- ✅ `dashboard/logistique/page.tsx` (stats → logistiqueApi.getStats())
- [ ] `dashboard/logistique/produits/page.tsx` (mock → logistiqueApi.getProduits())
- ✅ `dashboard/logistique/commandes/page.tsx` (mock → logistiqueApi.getCommandes())
- [ ] `dashboard/logistique/livraison/page.tsx`
- [ ] `dashboard/logistique/fournisseur/page.tsx`

**Prochaine étape:** `dashboard/logistique/produits/page.tsx` → logistiqueApi.getProduits()

**Assurance:**
- [ ] `dashboard/assurance/page.tsx`
- [ ] `dashboard/assurance/assures/page.tsx`
- [ ] `dashboard/assurance/polices/page.tsx`
- [ ] `dashboard/assurance/sinistre/page.tsx`
- [ ] `dashboard/assurance/expert/page.tsx`

**Voyage:**
- [ ] `dashboard/voyage/page.tsx`
- [ ] `dashboard/voyage/clients/page.tsx`
- [ ] `dashboard/voyage/destinations/page.tsx` 
- [ ] `dashboard/voyage/offre/page.tsx`

**Communication:**
- [ ] `dashboard/communication/page.tsx`
- [ ] `dashboard/communication/annonceurs/page.tsx`
- [ ] `dashboard/communication/campagnes/page.tsx`
- [ ] `dashboard/communication/performances/page.tsx`

**RH:**
- [ ] `dashboard/rh/page.tsx`
- [ ] `dashboard/rh/employes/page.tsx`
- [ ] `dashboard/rh/contrast/page.tsx` (contrats?)

**Immigration:**
- [ ] `dashboard/service-immigration/page.tsx`

### 3. Améliorations Globales
- [ ] `dashboard/layout.tsx` : Filtre par `user.departement`
- [ ] Test complet : No "Not Found", données réelles
- [ ] Données test SQL si DB vides

**Prochaine étape:** Intégrer dans `dashboard/logistique/commandes/page.tsx` (mock → logistiqueApi.getCommandes() + getProduits())

