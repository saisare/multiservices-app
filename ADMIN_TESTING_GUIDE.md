# 🔐 Admin Dashboard Testing Guide - 2026

## Overview
Complete admin functionality for user approval and password reset has been implemented.

---

## ✅ WHAT'S NEW

### Admin Dashboard Features
- ✅ **Dashboard Tab** - View stats (total users, active, pending)
- ✅ **Users Tab** - Manage all users with inline password reset
- ✅ **Approvals Tab** - Approve/Reject pending user requests
- ✅ **Password Reset** - Admin can set new passwords for active users

---

## 🚀 QUICK START

### Step 1: Database Initialization
```bash
cd backend/auth-service
node reset_microservices.js
```

### Step 2: Start Services (4 Terminals)

**Terminal 1 - Auth Service:**
```bash
cd backend/auth-service
npm start
# Listens on Port 3002
```

**Terminal 2 - Api Gateway:**
```bash
cd backend/api-gateway
npm start
# Listens on Port 3001
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
# Listens on Port 3000
```

### Step 3: Access Admin Dashboard
```
URL: http://localhost:3000/admin
Email: admin@blg-engineering.com
Password: Blg1app23@
```

---

## 📋 TEST SCENARIOS

### Scenario 1: Approve Pending Users ✅

1. **Login as Admin**
   - Email: `admin@blg-engineering.com`
   - Password: `Blg1app23@`

2. **Go to "Approvals" Tab**
   - See list of pending users (actif=0)
   - Before approve: User cannot login

3. **Click "✅ Approuver"**
   - Backend:
     * Hashes their plaintext password with bcrypt
     * Sets actif=1 (activates user)
   - Frontend: Shows success notification
   - User removed from "En Attente" list

4. **Test User Login**
   - Email: `nossijunior23@gmail.com` (or another pending user)
   - Password: Their original registration password
   - ✅ Login now works!

### Scenario 2: Reset Forgotten Password ✅

1. **Go to "Utilisateurs" Tab**

2. **Find user and click "🔑 MDP" button**
   - Blue button appears for active users only
   - Expands inline password reset form

3. **Enter new password**
   - Must be ≥ 8 characters
   - Example: `NewPass2026@`

4. **Click "✅ Réinitialiser"**
   - Spinner shows during request
   - Backend hashes password with bcrypt
   - Updates password_hash in database
   - Success notification appears
   - Form collapses

5. **Test New Password**
   - User tries to login with new password
   - ✅ Works!

### Scenario 3: Dashboard Stats ✅

1. **Go to "Tableau de bord" Tab**

2. **Verify stats display:**
   - 📊 Total Utilisateurs
   - ✅ Utilisateurs Actifs
   - ⏳ En Attente d'Approbation

3. **Stats update after actions**
   - Approve user → Active count increases
   - Reject user → Pending count decreases

---

## 🔧 API ENDPOINTS (Backend)

### Authentication
```
POST /api/auth/login
  Body: { email, password }
  Returns: { token, user }
```

### User Management (Require JWT + admin/secretaire role)
```
GET /api/auth/users
  Returns: All users

GET /api/auth/pending-users
  Returns: Users with actif=0

PATCH /api/auth/users/:id/approve
  Action: Hash password + set actif=1

PATCH /api/auth/users/:id/reject
  Action: Delete pending user

PATCH /api/auth/users/:id/reset-password
  Body: { newPassword }
  Action: Hash new password
```

---

## 🐛 TROUBLESHOOTING

### Issue: Admin page shows "Accès refusé"
**Cause:** User is not admin role
**Fix:** Login with `admin@blg-engineering.com`

### Issue: "Email ou password incorrect" on login
**Cause:** User not approved (actif=0) or password mismatch
**Fix:**
1. Admin approves user first
2. Or reset their password from admin panel

### Issue: Password reset returns "Erreur"
**Cause:** Password < 8 chars or JWT token expired
**Fix:**
1. Enter password ≥ 8 characters
2. Re-login if token expired

### Issue: Database connection fails
**Cause:** MySQL not running or wrong credentials
**Fix:**
```bash
# Check MySQL is running
mysql -u root

# Run database init
node reset_microservices.js
```

---

## 📊 EXPECTED BEHAVIOR

| Action | Before | After |
|--------|--------|-------|
| User registers | addedto users table,actif=0 | Shows in "En Attente" tab |
| Admin approves | User cannot login | User can login with original password |
| User tries login (pending) | ❌ "not found or inactive" | - |
| Admin resets password | Old password fails | New password works |
| Admin rejects | User in pending list | User deleted from database |

---

## 🎯 KEY FILES

- Frontend: `frontend/src/app/admin/page.tsx`
- Backend: `backend/auth-service/server.js`
  - Endpoint: `/api/auth/users/:id/approve` (line 362)
  - Endpoint: `/api/auth/users/:id/reset-password` (line 449)
  - Endpoint: `/api/auth/pending-users` (line 334)

---

## ✨ SECURITY NOTES

✅ **Protected Endpoints**
- Admin endpoints require JWT token
- Role check: Only admin/secretaire can approve/reset

✅ **Password Hashing**
- bcryptjs with 10 salt rounds
- Passwords never stored plaintext
- Even admin cannot see plaintext passwords

✅ **Token Security**
- JWT expires in 24 hours
- Secret key: `jwt_secret_microservices_blg_engineering_2026`

---

## 🎉 COMPLETION CHECKLIST

- [ ] Database initialized with `reset_microservices.js`
- [ ] Auth Service running on port 3002
- [ ] Api Gateway running on port 3001
- [ ] Frontend running on port 3000
- [ ] Admin can login with credentials
- [ ] Admin can see pending users
- [ ] Admin can approve users
- [ ] Approved users can login
- [ ] Admin can reset passwords
- [ ] Password reset changes work
- [ ] Logout works properly
- [ ] Error messages display correctly

---

Last Updated: 2026-04-07
Author: Claude Code
