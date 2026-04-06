require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3002;

console.log('🔐 AUTH SERVICE STARTING...');
console.log('PORT =', process.env.PORT);
console.log('DB_HOST =', process.env.DB_HOST);

// Middleware
app.use(cors());
app.use(express.json());

// Connexion MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'auth_db'
});

db.connect(err => {
  if (err) {
    console.error('❌ Erreur connexion MySQL Auth:', err);
    process.exit(1);
  } else {
    console.log('✅ Connecté à MySQL Auth');
  }
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token requis' });

  jwt.verify(token, process.env.JWT_SECRET || 'mon_super_secret_2026', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide ou expiré' });
    req.user = user;
    next();
  });
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Action non autorisée', userRole: req.user?.role, requiredRoles: roles });
  }
  next();
};

const ROLE_ADMIN = 'admin';
const ROLE_DIRECTOR = 'directeur';
const ROLE_SECRETAIRE = 'secretaire';

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'auth', status: 'OK', timestamp: new Date().toISOString() });
});

// ============ FIXED LOGIN & AUTH ============

// Login endpoint - FIXED: checks users THEN pending_users
app.post('/api/auth/login', async (req, res) => {
  const { email, password, departement } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

  let sql = 'SELECT * FROM users WHERE email = ? AND actif = 1 AND hidden = 0';
  const params = [email];
  if (departement) {
    sql += ' AND departement = ?';
    params.push(departement);
  }

  db.query(sql, params, async (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: err.message });
    }

    let user = null;

    // 1. Priority: users table
    if (results.length) {
      user = results[0];
    } else {
      // 2. Fallback: pending_users
      let sqlPending = 'SELECT * FROM pending_users WHERE email = ? AND status IN ("pending", "approved")';
      const paramsPending = [email];
      if (departement) {
        sqlPending += ' AND departement = ?';
        paramsPending.push(departement);
      }

      db.query(sqlPending, paramsPending, async (errPending, pendingResults) => {
        if (errPending) {
          console.error('DB pending error:', errPending);
          return res.status(500).json({ error: errPending.message });
        }

        if (!pendingResults.length) {
          console.log('❌ User not found in users or pending:', email);
          return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        user = pendingResults[0];
        user.isPending = true;
        user.role = user.role || 'pending';
        user.actif = 1;

        // Validate password for pending user
        await handleUserValidation(user, password, res, email, true);
      });
      return; // Early return for pending query
    }

    // Validate users table user
    await handleUserValidation(user, password, res, email, false);
  });
});

// Helper function for password validation + token
async function handleUserValidation(user, password, res, email, isPending) {
  if (!user.password_hash) {
    console.log('❌ User has no password:', email);
    return res.status(401).json({ error: 'Utilisateur sans mot de passe' });
  }

  let validPassword = false;

  if (user.password_hash.startsWith('$2')) {
    validPassword = await bcrypt.compare(password, user.password_hash);
  } else {
    validPassword = password === user.password_hash;
  }

  if (!validPassword) {
    console.log('❌ Invalid password for:', email);
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, departement: user.departement || user.departmen, isPending },
    process.env.JWT_SECRET || 'mon_super_secret_2026',
    { expiresIn: '24h' }
  );

  // Update login time only for users table
  if (!isPending) {
    db.query('UPDATE users SET dernier_login = NOW() WHERE id = ?', [user.id]);
  }

  delete user.password_hash;
  console.log('✅ Login success for:', email, 'Role:', user.role, isPending ? '(PENDING)' : '');
  
  res.json({ 
    success: true, 
    token, 
    user: { ...user, isPending },
    message: isPending ? 'Compte en attente de validation admin' : 'Connexion réussie'
  });
}

// ============ ACCOUNT CREATION ============

app.post('/api/auth/request-account', async (req, res) => {
  const { email, password, nom, prenom, telephone, poste, departement } = req.body;

  if (!email || !password || !nom || !prenom || !departement) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  db.query('SELECT id FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length) return res.status(409).json({ error: 'Cet email est déjà utilisé' });

    const plainPassword = password;

    db.query(
      `INSERT INTO pending_users (email, nom, prenom, telephone, poste, departement, password_hash, status, requested_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [email, nom, prenom, telephone || '', poste || '', departement, plainPassword],
      (err2, result) => {
        if (err2) {
          if (err2.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Cet email a déjà une demande en attente' });
          }
          return res.status(500).json({ error: err2.message });
        }
        res.status(201).json({
          success: true,
          message: 'Compte créé avec succès. En attente de validation.',
          user: { id: result.insertId, email, nom, prenom, departement, status: 'pending' }
        });
      }
    );
  });
});

// ... [REST OF ORIGINAL ENDPOINTS UNCHANGED: user management, password, notifications, etc.]

// Liste utilisateurs
app.get('/api/auth/users', verifyToken, requireRole(ROLE_ADMIN, ROLE_DIRECTOR, ROLE_SECRETAIRE), (req, res) => {
  db.query('SELECT id, matricule, nom, prenom, email, departement, role, actif, hidden FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (req.user.role === ROLE_DIRECTOR) {
      res.json(results.filter(user => !user.hidden));
    } else {
      res.json(results);
    }
  });
});

// Create user (admin)
app.post('/api/auth/users', verifyToken, requireRole(ROLE_ADMIN, ROLE_SECRETAIRE), (req, res) => {
  const { matricule, nom, prenom, email, telephone, departement, poste, role, password } = req.body;
  if (!email || !password || !nom || !prenom || !departement || !role) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length) return res.status(409).json({ error: 'Utilisateur déjà existant' });

    db.query(
      'INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, actif, hidden, date_creation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW())',
      [matricule || '', nom, prenom, email, telephone || '', departement, poste || '', role, password],
      (err2, result) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json({
          success: true,
          user: { id: result.insertId, matricule, nom, prenom, email, departement, role }
        });
      }
    );
  });
});

// Hide/show user
app.patch('/api/auth/users/:id/hide', verifyToken, requireRole(ROLE_ADMIN, ROLE_DIRECTOR), (req, res) => {
  const { id } = req.params;
  const { hidden } = req.body;
  db.query('UPDATE users SET hidden = ? WHERE id = ?', [hidden ? 1 : 0, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: hidden ? 'Utilisateur caché.' : 'Utilisateur réaffiché.' });
  });
});

// Delete user
app.delete('/api/auth/users/:id', verifyToken, requireRole(ROLE_ADMIN), (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Utilisateur supprimé définitivement.' });
  });
});

// Activate/deactivate
app.patch('/api/auth/users/:id/activate', verifyToken, requireRole(ROLE_ADMIN, ROLE_SECRETAIRE), (req, res) => {
  const { id } = req.params;
  const { actif } = req.body;
  db.query('UPDATE users SET actif = ? WHERE id = ?', [actif ? 1 : 0, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: actif ? 'Utilisateur activé.' : 'Utilisateur désactivé.' });
  });
});

// Set admin password
app.post('/api/auth/set-admin-password', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Mot de passe requis' });

  let passwordToStore = password;
  if (!password.startsWith('$2')) {
    passwordToStore = password;
  }

  db.query('UPDATE users SET password_hash = ? WHERE role = ?', [passwordToStore, ROLE_ADMIN], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Mot de passe admin mis à jour', affectedRows: result.affectedRows });
  });
});

// Fix passwords
app.post('/api/auth/fix-passwords', verifyToken, requireRole(ROLE_ADMIN), async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Mot de passe requis' });

  db.query('UPDATE users SET password_hash = ? WHERE role != ?', [password, ROLE_ADMIN], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      success: true,
      message: `Mots de passe corrigés pour ${result.affectedRows} utilisateurs`,
      affectedRows: result.affectedRows
    });
  });
});

// Notifications new account
app.post('/api/notifications/new-account', (req, res) => {
  const { email, nom, departement } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  db.query(
    `INSERT INTO notifications (type, recipient_id, title, message, data, created_at)
     VALUES ('new_account_request', NULL, ?, ?, ?, NOW())`,
    [
      `Nouvelle demande de compte: ${nom}`,
      `Demande pour ${email} (${departement})`,
      JSON.stringify({ email, nom, departement })
    ],
    (err) => {
      if (err) {
        console.error('Notification insert failed:', err);
        return res.status(200).json({ success: true, message: 'Account request created (notification system pending)' });
      }
      res.json({ success: true, message: 'Notification envoyée aux administrateurs.' });
    }
  );
});

// Internal notifications
app.post('/api/auth/notifications', verifyToken, (req, res) => {
  const { destinataireRole, message } = req.body;
  if (!destinataireRole || !message) return res.status(400).json({ error: 'destinataireRole et message requis' });

  if (req.user.role === ROLE_DIRECTOR && destinataireRole !== ROLE_ADMIN) {
    return res.status(403).json({ error: 'Directeur ne peut envoyer qu\'au rôle admin' });
  }

  db.query(
    `INSERT INTO notifications (type, recipient_id, sender_id, title, message, data, created_at)
     VALUES ('internal_message', NULL, ?, ?, ?, ?, NOW())`,
    [
      req.user.id,
      `Message ${req.user.role} -> ${destinataireRole}`,
      message,
      JSON.stringify({ senderRole: req.user.role, destinataireRole, senderId: req.user.id })
    ],
    (err) => {
      if (err) {
        console.error('Notification insert failed:', err);
        return res.status(200).json({ success: true, message: 'Message logged' });
      }
      res.json({ success: true, message: 'Notification envoyée.' });
    }
  );
});

// Get notifications
app.get('/api/auth/notifications', verifyToken, (req, res) => {
  db.query(
    `SELECT * FROM notifications 
     WHERE (recipient_id IS NULL OR recipient_id = ?) OR sender_id = ?
     ORDER BY created_at DESC LIMIT 50`,
    [req.user.id, req.user.id],
    (err, results) => {
      if (err) {
        console.error('Notifications fetch failed:', err);
        return res.json([]);
      }
      res.json(results || []);
    }
  );
});

// Test endpoint
app.get('/test', (req, res) => { res.json({ message: 'Test OK - FIXED VERSION' }); });

app.listen(PORT, () => {
  console.log('\n✅ AUTH SERVICE FIXED - DÉMARRÉ');
  console.log('📍 URL: http://localhost:' + PORT);
  console.log('📍 Health: http://localhost:' + PORT + '/health');
  console.log('📍 Login FIXED: http://localhost:' + PORT + '/api/auth/login');
  console.log('🆕 Now supports pending_users login!');
});
