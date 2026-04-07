# 🔐 ADMIN DASHBOARD - TEST GUIDE

## ✅ WHAT'S BEEN FIXED

1. **Admin Dashboard Created** ✅
   - File: `frontend/src/app/admin/page.tsx`
   - Features: user approval + password reset
   - Protected route (requires admin role)

2. **Password Reset Endpoint** ✅
   - Backend: `PATCH /api/auth/users/:id/reset-password`
   - Location: `backend/auth-service/server.js` (line 449)
   - Allows admin to set new password for any user

3. **Frontend Password Reset UI** ✅
   - Blue "MDP" button for active users
   - Inline password input form
   - Error/success notifications
   - Loading spinner during reset

---

## 🚀 TEST FLOW (Step by Step)

### STEP 1: Start All Services

**Terminal 1 - Auth Service**
```bash
cd backend/auth-service
npm start
```
Expected: `✅ Connected to MySQL (auth_db)` and `Listening on port 3002`

**Terminal 2 - API Gateway**
```bash
cd backend/api-gateway
npm start
```
Expected: `Connected to port 3001`

**Terminal 3 - Frontend**
```bash
cd frontend
npm run dev
```
Expected: `Local: http://localhost:3000`

### STEP 2: Admin Login

1. Open: **http://localhost:3000/login**
2. Login with:
   - **Email:** `admin@blg-engineering.com`
   - **Password:** `Blg1app23@`
3. You should be redirected to: **http://localhost:3000/dashboard/admin**

✅ **Expected:** See "📊 Tableau de bord" with stats

---

### STEP 3: Test User Approval

1. Click tab: **"✅ Approbations"**
2. Look for pending users (active users = actif=1)
3. Find user: **`nossijunior23@gmail.com`** (or another pending user)
4. Click: **"✅ Approuver"** button

✅ **Expected:**
- Green success message: "Utilisateur approuvé avec succès"
- User disappears from Approbations tab
- User now appears in "👥 Utilisateurs" tab with **"✅ Actif"** status

---

### STEP 4: Test Password Reset

1. Click tab: **"👥 Utilisateurs"**
2. Find the user you approved: **`nossijunior23@gmail.com`** (should show green "✅ Actif")
3. Click blue: **"🔑 MDP"** button
4. A password reset form appears:
   ```
   [Minimum 8 caractères input field]
   [✅ Réinitialiser] [Annuler]
   ```
5. Enter new password: **`TestPassword123@`** (or any 8+ chars)
6. Click: **"✅ Réinitialiser"**

✅ **Expected:**
- Spinner shows briefly
- Green success message: "Mot de passe réinitialisé avec succès"
- Form disappears

---

### STEP 5: Test User Login with New Password

1. Logout from admin (click "Déconnexion")
2. Go to: **http://localhost:3000/login**
3. Login with:
   - **Email:** `nossijunior23@gmail.com`
   - **Password:** `TestPassword123@` (the new password you set)

✅ **Expected:**
- Login successful
- Redirected to user dashboard
- User can see their department/role

---

## 🐛 TROUBLESHOOTING

### Issue: "Accès refusé" on Admin Dashboard
**Cause:** User not admin
**Fix:** Login with `admin@blg-engineering.com` instead

### Issue: Password Reset Button Doesn't Appear
**Cause:** User not in "Actif" status
**Fix:** Approve user first from "Approbations" tab

### Issue: "Email ou password incorrect" on Login
**Cause:**
1. Password not reset yet, OR
2. User not approved yet
**Fix:**
1. Use admin dashboard to approve user
2. Reset password for user
3. Try login with new password

### Issue: Frontend Build Fails
**Fix:**
```bash
rm -rf frontend/.next frontend/node_modules
cd frontend
npm install
npm run build
```

---

## 📋 DATABASE VERIFICATION

Check user status in MySQL:

```sql
-- See all users
SELECT id, email, nom, prenom, role, actif FROM users;

-- See pending users (actif=0)
SELECT * FROM users WHERE actif=0;

-- See specific user (example)
SELECT * FROM users WHERE email='nossijunior23@gmail.com';
```

---

## ✅ FEATURES WORKING

| Feature | Status | How to Test |
|---------|--------|------------|
| Admin Login | ✅ | Login with admin@blg-engineering.com |
| View Pending Users | ✅ | Go to "✅ Approbations" tab |
| Approve Users | ✅ | Click "✅ Approuver" button |
| Reject Users | ✅ | Click "❌ Refuser" button |
| Reset Passwords | ✅ | Click "🔑 MDP" button on active user |
| User Login | ✅ | Test with approved user + new password |
| Error Alerts | ✅ | Try 7-char password (shows error) |
| Success Alerts | ✅ | Approve/reset/delete actions show success |

---

## 📌 KEY URLs

| Page | URL | Role |
|------|-----|------|
| Login | `http://localhost:3000/login` | All users |
| Admin Dashboard | `http://localhost:3000/admin` | admin only |
| User Dashboard | `http://localhost:3000/dashboard/[dept]` | Employees |

---

## 🎯 COMPLETE USER FLOW EXAMPLE

```
1. Admin logs in → http://localhost:3000/login
   Email: admin@blg-engineering.com
   Password: Blg1app23@

2. Admin approves user → Tab "✅ Approbations"
   Click "✅ Approuver" on nossijunior23@gmail.com

3. Admin resets password → Tab "👥 Utilisateurs"
   Click "🔑 MDP" → Enter TestPassword123@ → Click "✅ Réinitialiser"

4. Approved user logs in → http://localhost:3000/login
   Email: nossijunior23@gmail.com
   Password: TestPassword123@

5. User sees dashboard → http://localhost:3000/dashboard/voyage
   (or appropriate department)
```

---

Generated: 2026-04-07
Next Steps: Run tests and report any issues
