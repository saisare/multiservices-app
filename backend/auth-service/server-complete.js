require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3002;

console.log('🔐 AUTH SERVICE STARTING - FIXED VERSION...');
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
    console.log('✅ Connecté à MySQL Auth - FIXED');
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
  res.json({ service: 'auth', status: 'OK-FIXED', timestamp: new Date().toISOString() });
});

// FIXED LOGIN - Checks users THEN pending_users
app.post('/api/auth/login', (req, res) => {
  const { email, password, departement } = req.body;
  console.log('🔍 Login attempt:', email, departement);

  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

  // 1. Check users table
  let sql = 'SELECT * FROM users WHERE email = ? AND actif = 1 AND hidden = 0';
  let params = [email];
  if (departement) {
    sql += ' AND departement = ?';
    params.push(departement);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('DB users error:', err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length) {
      console.log('👤 Found in users:', results[0].email);
      return handleLoginSuccess(results[0], password, res, false);
    }

    // 2. Fallback pending_users
    let sqlPending = 'SELECT * FROM pending_users WHERE email = ? AND status = "pending"';
    params = [email];
    if (departement) {
      sqlPending += ' AND departement = ?';
      params.push(departement);
    }

    db.query(sqlPending, params, (errPending, pendingResults) => {
      if (errPending) {
        console.error('DB pending error:', errPending);
        return res.status(500).json({ error: errPending.message });
      }

      if (!pendingResults.length) {
        console.log('❌ Not found:', email);
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      console.log('👤 Found in pending_users:', pendingResults[0].email);
      const user = pendingResults[0];
      user.isPending = true;
      user.role = 'employee'; // Default for pending
      handleLoginSuccess(user, password, res, true);
    });
  });
});

// Unified success handler
function handleLoginSuccess(user, password, res, isPending) {
  if (!user.password_hash) {
    console.log('❌ No password:', user.email);
    return res.status(401).json({ error: 'Utilisateur sans mot de passe' });
  }

  bcrypt.compare(password, user.password_hash, (err, validPassword) => {
    if (err || !validPassword) {
      console.log('❌ Invalid password:', user.email);
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, departement: user.departement, isPending },
      process.env.JWT_SECRET || 'mon_super_secret_2026',
      { expiresIn: '24h' }
    );

    if (!isPending) {
      db.query('UPDATE users SET dernier_login = NOW() WHERE id = ?', [user.id]);
    }

    delete user.password_hash;
    console.log('✅ LOGIN SUCCESS:', user.email, '→', user.departement, isPending ? '(PENDING)' : '');

    res.json({ 
      success: true, 
      token, 
      user,
      message: isPending ? 'Compte pending - accès limité' : 'Connexion réussie'
    });
  });
}

// Request account (unchanged)
app.post('/api/auth/request-account', (req, res) => {
  const { email, password, nom, prenom, telephone, poste, departement } = req.body;
  if (!email || !password || !nom || !prenom || !departement) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length) return res.status(409).json({ error: 'Email déjà utilisé' });

    db.query(
      `INSERT INTO pending_users (email, nom, prenom, telephone, poste, departement, password_hash, status, requested_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [email, nom, prenom, telephone || '', poste || '', departement, password],
      (err2, result) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json({
          success: true,
          message: 'Compte créé - en attente validation',
          user: { id: result.insertId, email, nom, prenom, departement, status: 'pending' }
        });
      }
    );
  });
});

// All other endpoints unchanged...
app.get('/api/auth/users', verifyToken, requireRole(ROLE_ADMIN, ROLE_DIRECTOR, ROLE_SECRETAIRE), (req, res) => {
  db.query('SELECT id, matricule, nom, prenom, email, departement, role, actif, hidden FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/auth/users', verifyToken, requireRole(ROLE_ADMIN, ROLE_SECRETAIRE), (req, res) => {
  const { matricule, nom, prenom, email, telephone, departement, poste, role, password } = req.body;
  db.query(
    'INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, actif, hidden, date_creation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW())',
    [matricule || '', nom, prenom, email, telephone || '', departement, poste || '', role, password],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ success: true, user: { id: result.insertId } });
    }
  );
});

// Health + test
app.get('/test', (req, res) => res.json({ message: 'Auth FIXED - Pending OK' }));
app.get('/health', (req, res) => res.json({ service: 'auth-fixed', status: 'OK' }));

app.listen(PORT, () => {
  console.log('\n🚀 AUTH FIXED LIVE!');
  console.log('📍 Login: http://localhost:' + PORT + '/api/auth/login');
  console.log('📍 Health: http://localhost:' + PORT + '/health');
  console.log('✅ Pending_users login enabled!');
});
