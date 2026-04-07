# 🔐 ADMIN DASHBOARD - COMPLETE GUIDE

## 📋 Overview
The Admin Dashboard is now fully functional with:
- ✅ User approval system
- ✅ Password reset for forgotten passwords
- ✅ User management (view, approve, delete)
- ✅ Dashboard with statistics

---

## 🚀 QUICK START

### 1. Start All Services (4 Terminals)

**Terminal 1 - Auth Service:**
```bash
cd backend/auth-service
npm start
```
Port: `3002`

**Terminal 2 - API Gateway:**
```bash
cd backend/api-gateway
npm start
```
Port: `3001`

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```
Port: `3000`

**Terminal 4 - Optional (BTP Service for testing):**
```bash
cd backend/btp
npm start
```
Port: `3003`

---

## 🔑 ADMIN LOGIN

### URL
```
http://localhost:3000/admin
```

### Credentials
| Email | Password | Role |
|-------|----------|------|
| `admin@blg-engineering.com` | `Blg1app23@` | ADMIN |

---

## 📊 ADMIN DASHBOARD FEATURES

### TAB 1: Dashboard (📊)
Shows key statistics:
- **Total Utilisateurs** - Count of all users in the system
- **Utilisateurs Actifs** - Count of approved users (actif=1)
- **En Attente d'Approbation** - Count of pending users (actif=0)

### TAB 2: Utilisateurs (👥)
Complete user management table showing:
- Email
- Nom & Prénom
- Rôle (admin, employee, etc.)
- Département
- Statut (✅ Actif / ⏳ En attente)
- Actions:
  - **Approuver** - Only appears for pending users (actif=0)
  - **Réinitialiser MDP** (Key icon) - Only appears for active users (actif=1)
  - **Supprimer** - Available for all users

### TAB 3: Approbations (✅)
Shows only pending users awaiting approval:
- Email
- Nom & Prénom
- Département
- Date Demande
- Actions:
  - **✅ Approuver** - Approve the user request
  - **❌ Refuser** - Reject the user request

---

## 🎯 COMPLETE WORKFLOW

### Scenario 1: APPROVE A PENDING USER

**Step 1:** Login to admin dashboard
```
Email: admin@blg-engineering.com
Password: Blg1app23@
```

**Step 2:** Go to "Approbations" tab

**Step 3:** Find the user you want to approve (e.g., `nossijunior23@gmail.com`)

**Step 4:** Click **✅ Approuver** button

**Step 5:** Success! User is now `actif=1` and can login

**Step 6:** User verifies login works:
```
URL: http://localhost:3000/login
Email: nossijunior23@gmail.com
Password: (whatever they registered with)
```

---

### Scenario 2: RESET FORGOTTEN PASSWORD

**Step 1:** Login to admin dashboard

**Step 2:** Go to "Utilisateurs" tab

**Step 3:** Find the user who forgot their password

**Step 4:** Click **🔑 MDP** (Key icon) button

![Password reset inline form appears]

**Step 5:** Enter new password (minimum 8 characters)
```
Example: NewPassword2026@
```

**Step 6:** Click **✅ Réinitialiser**

**Step 7:** Success message appears with green alert

**Step 8:** User is notified of new password and can login with it:
```
URL: http://localhost:3000/login
Email: (their email)
Password: NewPassword2026@
```

---

### Scenario 3: REJECT A PENDING USER

**Step 1:** Go to "Approbations" tab

**Step 2:** Find the user to reject

**Step 3:** Click **❌ Refuser** button

**Step 4:** User request is deleted and they receive notification to reapply

---

### Scenario 4: DELETE A USER

**Step 1:** Go to "Utilisateurs" tab

**Step 2:** Find the user to delete

**Step 3:** Click **Supprimer** button

**Step 4:** Confirm deletion

**Step 5:** User is removed from system

---

## 🔧 BACKEND ENDPOINTS

### Auth Service (Port 3002)

#### ✅ GET /api/auth/pending-users
**Requires:** Admin token
**Returns:** List of users with `actif=0` (pending approval)
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "nom": "Dupont",
      "prenom": "Jean",
      "departement": "voyage",
      "created_at": "2026-04-07T10:00:00Z"
    }
  ]
}
```

#### ✅ GET /api/auth/users
**Requires:** Admin token
**Returns:** List of all users
```json
[
  {
    "id": 1,
    "email": "admin@blg-engineering.com",
    "nom": "Admin",
    "prenom": "User",
    "role": "admin",
    "departement": "direction",
    "actif": 1,
    "created_at": "2026-04-01T00:00:00Z"
  }
]
```

#### ✅ PATCH /api/auth/users/:id/approve
**Requires:** Admin token
**Action:** Approves a pending user
- Hashes their password
- Sets `actif=1`
- User can now login

#### ✅ PATCH /api/auth/users/:id/reject
**Requires:** Admin token
**Action:** Rejects a pending user (deletes request)

#### ✅ PATCH /api/auth/users/:id/reset-password
**Requires:** Admin token
**Body:**
```json
{
  "newPassword": "NewPassword2026@"
}
```
**Action:**
- Validates password (minimum 8 characters)
- Hashes new password
- Updates user's password
- User can login with new password

#### ✅ DELETE /api/auth/users/:id
**Requires:** Admin token
**Action:** Deletes user from system

---

## 🧪 TESTING CHECKLIST

### Phase 1: Admin Dashboard Access
- [ ] Navigate to http://localhost:3000/admin
- [ ] Login with admin@blg-engineering.com / Blg1app23@
- [ ] Dashboard tab shows statistics
- [ ] All three tabs are clickable

### Phase 2: User Approval
- [ ] "Approbations" tab shows pending users
- [ ] Click "Approuver" on a pending user
- [ ] Success alert appears
- [ ] User is removed from Approbations tab
- [ ] User appears in "Utilisateurs" tab with ✅ Actif status

### Phase 3: User Login After Approval
- [ ] Logout from admin
- [ ] Navigate to http://localhost:3000/login
- [ ] Login with approved user email and their original password
- [ ] User is successfully authenticated
- [ ] Redirected to their department dashboard

### Phase 4: Password Reset
- [ ] Go back to admin
- [ ] Go to "Utilisateurs" tab
- [ ] Find an active user
- [ ] Click "🔑 MDP" button
- [ ] Inline password reset form appears
- [ ] Enter new password (min 8 chars)
- [ ] Click "Réinitialiser"
- [ ] Success message shows
- [ ] Form closes

### Phase 5: Login with New Password
- [ ] Logout from admin
- [ ] Navigate to http://localhost:3000/login
- [ ] Login with user email and **new password**
- [ ] User successfully authenticates with new password
- [ ] Old password no longer works

### Phase 6: User Deletion
- [ ] Go to "Utilisateurs" tab
- [ ] Click "Supprimer" on any user
- [ ] Confirm deletion
- [ ] User is removed from table
- [ ] User cannot login anymore

---

## 📱 UI/UX Notes

### Alerts
- **Green Alert** - Success messages (auto-closes in 3 seconds)
- **Red Alert** - Error messages (persistent until dismissed)

### Loading States
- Password reset button shows spinner during operation
- Button disabled while resetting

### Validation
- Passwords must be minimum 8 characters
- Email validation on registration
- All fields required

### Responsive Design
- Dark themed interface (gray-900 background)
- Table responsive on mobile
- Form fields stack vertically on small screens

---

## 🐛 TROUBLESHOOTING

### Problem: Admin cannot approve users
**Solution:**
- Check auth service is running on port 3002
- Verify admin token is valid
- Check database connection
- Try refreshing the page

### Problem: Password reset fails
**Solution:**
- Password must be minimum 8 characters
- Check auth service is running
- Verify database write permissions
- Check error message in console

### Problem: User cannot login after approval
**Solution:**
- Verify user was actually approved (check database: `SELECT actif FROM users WHERE email='...'`)
- Verify password is correct
- Check if user is in `users` table (not `pending_users`)
- Verify JWT_SECRET is same in auth service

### Problem: Admin page redirects to login
**Solution:**
- Check token exists in localStorage
- Verify user role is 'admin'
- Check token expiration

---

## 📝 DATABASE STRUCTURE

### users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  nom VARCHAR(100),
  prenom VARCHAR(100),
  role ENUM('admin', 'employee', 'directeur'),
  departement VARCHAR(100),
  actif TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Fields:**
- `actif = 0` - Pending approval
- `actif = 1` - Approved and active
- `password_hash` - bcrypt hash of password (not plaintext!)

---

## 🎯 NEXT STEPS

1. **Build Frontend** - Run `npm run build` to verify no TypeScript errors
2. **Start Services** - Follow Quick Start section
3. **Test Workflow** - Follow Testing Checklist
4. **Deploy** - Push changes to GitHub when ready

---

**Version:** 1.0
**Last Updated:** 2026-04-07
**Status:** ✅ READY FOR TESTING
