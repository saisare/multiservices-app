# ⚡ GUIDE RAPIDE DE DÉMARRAGE

## 🚨 URGENT - Première chose à faire

### 1️⃣ Initialiser la Base de Données

Ouvrez CMD et exécutez:

```bash
cd "C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app"
mysql -h localhost -u root < init-auth-db.sql
```

✅ Vous devrais voir: `Initialisation terminée`

---

## 🎯 Démarrer l'Appli (3 Terminaux)

### Terminal 1 - Backend Auth

```bash
cd "C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\backend\auth-service"
npm install
npm start
```

**Attendez:** Vous devriez voir `✅ SERVICE AUTH DÉMARRÉ sur port 3002`

---

### Terminal 2 - Backend Gateway

```bash
cd "C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\backend\api-gateway"
npm install
npm start
```

**Attendez:** `API Gateway running on port 3001`

---

### Terminal 3 - Frontend

```bash
cd "C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\frontend"
npm run dev
```

**Attendez:** `http://localhost:3000`

---

## 🔐 Se Connecter

Accédez à: **http://localhost:3000/login**

### Compte Admin:
```
Email: admin@blg-engineering.com
Password: Blg1app23@
```

### Compte Directeur:
```
Email: jean.martin@blg-engineering.com
Password: Director2@
```

### Compte Secrétaire:
```
Email: marie.durand@blg-engineering.com
Password: Secr2@
```

---

## ✅ Vérifications Complètes

- [ ] MySQL démarré
- [ ] DB `auth_db` créée (4 utilisateurs)
- [ ] Auth Service démarré (3002)
- [ ] Gateway démarré (3001)
- [ ] Frontend démarré (3000)
- [ ] Login Admin réussi
- [ ] Redirection vers /dashboard/admin
- [ ] Panier de nul utilisateurs visible

---

## 🆘 Si Erreur 401 au Login

```bash
# Vérifier la BD
mysql -h localhost -u root
USE auth_db;
SELECT email, role, password_hash FROM users;
```

Si vide → Re-run: `mysql -h localhost -u root < init-auth-db.sql`

---

## 📖 Documentation Complète

Voir:
- `README-SETUP.md` - Guide complet (20+ scénarios)
- `CORRECTIONS-25-03-2026.md` - Journal all corrections

---

## 🎊 C'est Tout!

Vous avez maintenant un système COMPLET:
- ✅ Login/Logout
- ✅ 4 Rôles (admin/directeur/secretaire/employee)
- ✅ 3 Dashboards différents
- ✅ Gestion des utilisateurs (cacher/supprimer)
- ✅ Barre de force du mot de passe
- ✅ Protection des routes

Bon développement! 🚀
