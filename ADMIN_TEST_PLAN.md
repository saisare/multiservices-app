# 🧪 ADMIN DASHBOARD - COMPREHENSIVE TEST PLAN

## ✅ PRE-TEST CHECKLIST

### Prerequisites
- [ ] Frontend build completed successfully
- [ ] All services started (Auth, API Gateway, Frontend)
- [ ] Database initialized and connected
- [ ] Browser cache cleared (optional but recommended)
- [ ] All three service ports accessible (3002, 3001, 3000)

### Test Environment
- Frontend URL: `http://localhost:3000`
- Auth Service: `http://localhost:3002`
- API Gateway: `http://localhost:3001`

---

## 🔐 TEST PHASE 1: ADMIN LOGIN

### Test 1.1: Access Admin Dashboard
```
Step 1: Navigate to http://localhost:3000/admin
Expected: Redirected to /admin-login if not authenticated
Step 2: See login form (if not already logged in)
Expected: Login page with email/password fields
```

### Test 1.2: Admin Login Success
```
Step 1: Enter credentials:
  - Email: admin@blg-engineering.com
  - Password: Blg1app23@
Step 2: Click "Connexion"
Expected:
  - Redirect to /admin dashboard
  - Dashboard tab visible
  - Three tabs: Dashboard, Utilisateurs, Approbations
```

### Test 1.3: Admin Login Rejection
```
Step 1: Try to login with wrong password
Step 2: Try to login with wrong email
Expected: Error message "Email ou password incorrect"
```

---

## 📊 TEST PHASE 2: DASHBOARD STATS

### Test 2.1: View Dashboard Statistics
```
Step 1: Go to "Dashboard" tab
Expected:
  - Card 1: "Total Utilisateurs" (should show number > 0)
  - Card 2: "Utilisateurs Actifs" (number of actif=1 users)
  - Card 3: "En Attente d'Approbation" (number of actif=0 users)
```

### Test 2.2: Verify Statistics Accuracy
```
Step 1: Go to "Utilisateurs" tab (count all users)
Step 2: Go to "Approbations" tab (count pending users)
Step 3: Go back to Dashboard
Expected: Numbers match what you counted
```

---

## 👥 TEST PHASE 3: VIEW ALL USERS

### Test 3.1: View Utilisateurs Tab
```
Step 1: Click "Utilisateurs" tab
Expected:
  - Table showing all users
  - Columns: Email, Nom, Rôle, Département, Statut, Actions
  - At least admin@blg-engineering.com visible
```

### Test 3.2: Verify User Information
```
Step 1: Check admin user row:
  - Email: admin@blg-engineering.com
  - Rôle: admin
  - Statut: ✅ Actif (green)
Expected: All fields populated correctly
```

### Test 3.3: Check User Actions
```
For each user:
  - If Actif: Should have "🔑 MDP" button
  - If Pending: Should have "Approuver" button
  - All users: Should have "Supprimer" button
```

---

## ✅ TEST PHASE 4: USER APPROVAL WORKFLOW

### Test 4.1: View Pending Users
```
Step 1: Click "Approbations" tab
Expected:
  - If no pending users: Message "Aucune demande en attente"
  - If pending users: Table with pending approvals
  - Columns: Email, Nom, Département, Date Demande, Actions
```

### Test 4.2: Approve a User (MAIN WORKFLOW)
```
Prerequisite: Have at least one user with actif=0 (see database if needed)

Step 1: Click "Approbations" tab
Step 2: Find user to approve (if none, check database)
Step 3: Click green "✅ Approuver" button
Expected:
  - Green success alert appears: "Utilisateur approuvé avec succès"
  - User disappears from Approbations tab
  - Alert auto-closes after 3 seconds
```

### Test 4.3: Verify Approved User in Utilisateurs Tab
```
Step 1: Go to "Utilisateurs" tab
Step 2: Search for the user you just approved
Expected:
  - User appears in table
  - Statut shows: "✅ Actif"
  - Has "🔑 MDP" button available
```

### Test 4.4: Reject a User (Optional)
```
Prerequisite: Have another pending user

Step 1: Go to "Approbations" tab
Step 2: Click red "❌ Refuser" button
Expected:
  - User removed from Approbations
  - Success alert: "Demande rejetée"
```

---

## 🔑 TEST PHASE 5: PASSWORD RESET WORKFLOW

### Test 5.1: Trigger Password Reset
```
Step 1: Go to "Utilisateurs" tab
Step 2: Find an active user (Statut: ✅ Actif)
Step 3: Click blue "🔑 MDP" button
Expected:
  - Inline form appears below user row
  - Input field: "Minimum 8 caractères"
  - Two buttons: "Réinitialiser" (green), "Annuler" (gray)
```

### Test 5.2: Reset with Invalid Password
```
Step 1: Click MDP button on a user
Step 2: Enter password with 7 characters: "Passw12"
Step 3: Click "Réinitialiser"
Expected:
  - Red error alert: "Le mot de passe doit avoir au moins 8 caractères"
  - Form stays open
```

### Test 5.3: Reset with Valid Password
```
Step 1: Click MDP button on a user
Step 2: Enter new password: "NewPassword2026@"
Step 3: Click "Réinitialiser"
Expected:
  - Button shows spinner and says "Réinitialisation..."
  - After a moment: Green success alert appears
  - Alert message: "Mot de passe réinitialisé avec succès"
  - Form closes
  - Alert auto-closes after 3 seconds
```

### Test 5.4: User Logs in with New Password
```
Step 1: Logout from admin (click "Déconnexion")
Step 2: Navigate to http://localhost:3000/login
Step 3: Enter user email and NEW password you just set
Step 4: Click "Connexion"
Expected:
  - User successfully authenticated
  - Redirected to their department dashboard
  - Old password no longer works (try it to verify)
```

### Test 5.5: Cancel Password Reset
```
Step 1: Click MDP button on a user
Step 2: Start typing a password
Step 3: Click "Annuler" button
Expected:
  - Form closes without saving
  - Password field cleared
  - User password unchanged
```

---

## 🗑️ TEST PHASE 6: USER DELETION

### Test 6.1: Delete a User
```
Prerequisite: Have a test user you don't need
  (Don't delete real users or admin account!)

Step 1: Go to "Utilisateurs" tab
Step 2: Find a non-critical user
Step 3: Click red "Supprimer" button
Step 4: Confirm deletion
Expected:
  - User removed from table
  - Success alert: "Utilisateur supprimé"
  - User no longer appears in any tabs
```

### Test 6.2: Verify Deleted User Cannot Login
```
Step 1: Logout from admin
Step 2: Go to http://localhost:3000/login
Step 3: Try to login with deleted user's email and password
Expected:
  - Error message: "Email ou password incorrect"
  - User cannot authenticate
```

---

## ⚠️ TEST PHASE 7: ERROR HANDLING

### Test 7.1: Network Error Handling
```
Step 1: Stop auth service (Ctrl+C in Terminal 1)
Step 2: Try to approve a user in admin
Expected:
  - Red error alert appears
  - Message indicates connection issue
  - System remains responsive
```

### Test 7.2: Invalid Token Handling
```
Step 1: Open browser dev console (F12)
Step 2: In Console tab, run: localStorage.removeItem('token')
Step 3: Refresh admin page (F5)
Expected:
  - Redirected to /admin-login
  - Must login again
```

### Test 7.3: Non-Admin Access
```
Step 1: Login with regular user (if available)
Step 2: Manually navigate to http://localhost:3000/admin
Expected:
  - Redirected to /login
  - Cannot access admin dashboard
```

---

## 📈 TEST PHASE 8: INTEGRATION TEST

### Complete User Lifecycle
```
Step 1: Create test user account (if not existing)
Step 2: Check user in Approbations tab (pending)
Step 3: Approve the user
Step 4: Verify user in Utilisateurs tab (active)
Step 5: Try to login as that user (should work)
Step 6: Reset password as admin
Step 7: Logout and login with new password (should work)
Step 8: Delete the user
Step 9: Verify deleted user cannot login anymore
Expected: All steps complete successfully
```

---

## ✅ ACCEPTANCE CRITERIA

### Admin Dashboard Checklist
- [ ] Admin can login successfully
- [ ] Dashboard shows accurate statistics
- [ ] All users are listed in Utilisateurs tab
- [ ] Pending users shown in Approbations tab
- [ ] User approval works (actif changes 0→1)
- [ ] Approved user appears in Utilisateurs tab
- [ ] Password reset form appears inline
- [ ] Password validation works (min 8 chars)
- [ ] Password reset successful
- [ ] User can login with new password
- [ ] User deletion works
- [ ] Deleted user cannot login
- [ ] Error messages display properly
- [ ] Success alerts auto-close after 3 seconds
- [ ] Loading spinners show during operations

### User Workflow Checklist
- [ ] Pending user → Approval → Active user → Able to login
- [ ] Active user → Password reset → New password works
- [ ] Active user → Delete → Cannot login anymore

---

## 📋 EXPECTED DATABASE STATES

### After Approval
```sql
SELECT email, actif FROM users
WHERE email = 'user@example.com';

Result:
  email              | actif
  user@example.com   | 1       ← Changed from 0 to 1
```

### After Password Reset
```sql
SELECT email, password_hash FROM users
WHERE email = 'user@example.com';

Result:
  email              | password_hash (changed, ~60 chars)
  user@example.com   | $2b$10$...new_hash...
```

### After Deletion
```sql
SELECT COUNT(*) FROM users
WHERE email = 'user@example.com';

Result: 0  ← User completely removed
```

---

## 🎯 SUCCESS CRITERIA

**All tests pass if:**
- ✅ Login system works
- ✅ User approval workflow complete
- ✅ Password reset workflow complete
- ✅ User lifecycle works end-to-end
- ✅ Error handling shows helpful messages
- ✅ All data persists correctly
- ✅ UI remains responsive

**Status for Production:** 🟢 READY when:
- All tests in section 1-4 pass
- User lifecycle test (section 8) succeeds
- No critical errors in console

---

## 📞 TROUBLESHOOTING DURING TESTS

### If Approval Fails
1. Check auth service is running (listen on 3002)
2. Check database connection
3. Check browser console (F12) for error details
4. Verify admin user has role='admin'

### If Password Reset Fails
1. Verify password ≥ 8 characters
2. Check auth service is running
3. Check database write permissions
4. Look at server console for SQL errors

### If User Cannot Login After Approval
1. Verify actif=1 in database
2. Verify password_hash was updated
3. Check JWT_SECRET matches in services
4. Check token is created after approval

### If Build Timeout
1. Close other applications to free memory
2. Try: `npm run build` again
3. If persistent, check `build.log` for errors

---

**Version:** 1.0
**Test Date:** [Complete this when testing]
**Tester:** [Your name]
**Result:** [PASS/FAIL]
**Notes:** [Add any issues found]

---

## 📚 RELATED DOCUMENTATION

- `ADMIN_DASHBOARD_GUIDE.md` - User operations guide
- `ADMIN_IMPLEMENTATION_COMPLETE.md` - Technical details
- `ADMIN_NEXT_STEPS.md` - Setup and deployment

---

**Ready to test?** Start with Phase 1 and proceed sequentially through all phases.
