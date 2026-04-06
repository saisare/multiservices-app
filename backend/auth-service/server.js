#!/usr/bin/env node

/**
 * 🔐 BLG-ENGINEERING AUTH SERVICE
 *
 * Microservice principal pour authentification et gestion des utilisateurs
 *
 * Fonctionnalités:
 * - Authentification JWT
 * - Gestion des utilisateurs (create, approve, reject)
 * - Notifications pour new registrations
 * - Redirection vers département après login
 * - Passwords forts (Junior23@, BtpAdmin2026@, etc)
 *
 * Base de données: auth_db
 * Port: 3002
 */

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ============ CONFIGURATION ============

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_microservices_blg_engineering_2026';

console.log('\n' + '='.repeat(80));
console.log('🔐 AUTH SERVICE - MICROSERVICE UTILISATEURS & AUTHENTIFICATION');
console.log('='.repeat(80));
console.log(`Port: ${PORT}`);
console.log(`Database: ${process.env.DB_NAME || 'auth_db'}`);
console.log(`JWT Secret: ${JWT_SECRET.substring(0, 30)}...`);
console.log('='.repeat(80) + '\n');

// ============ MIDDLEWARE ============

app.use(cors());
app.use(express.json());

// ============ DATABASE CONNECTION ============

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'auth_db',
  charset: 'utf8mb4'
});

db.connect(err => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL (auth_db)\n');
});

// ============ MIDDLEWARE - AUTHENTICATION ============

/**
 * Vérifie le JWT token
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
    req.user = user;
    next();
  });
};

/**
 * Vérifie que l'utilisateur a le bon rôle
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      error: 'Accès refusé',
      userRole: req.user?.role,
      requiredRoles: roles
    });
  }
  next();
};

// ============ HELPER FUNCTIONS ============

/**
 * Valide la force du password
 * Règles:
 * - Min 8 caractères
 * - 1 majuscule
 * - 1 minuscule
 * - 1 chiffre
 * - 1 caractère spécial
 */
function validatePasswordStrength(password) {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('Minimum 8 caractères');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Au moins 1 majuscule');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Au moins 1 minuscule');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Au moins 1 chiffre');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Au moins 1 caractère spécial (!@#$%^&*)');
  }

  return {
    isStrong: errors.length === 0,
    errors: errors
  };
}

/**
 * Hash un password avec bcrypt ou le stocke en plaintext
 * selon le contexte
 */
async function hashPassword(password, shouldHash = true) {
  if (!shouldHash) {
    return password; // Stockage en plaintext pour pending users
  }

  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

/**
 * Vérifie un password (gère bcrypt ET plaintext)
 */
async function verifyPassword(password, storedHash) {
  // Si le hash commence par $2 c'est bcrypt
  if (storedHash && storedHash.startsWith('$2')) {
    return await bcrypt.compare(password, storedHash);
  }

  // Sinon c'est plaintext
  return password === storedHash;
}

// ============ ENDPOINTS - HEALTH ============

app.get('/health', (req, res) => {
  res.json({
    service: 'auth',
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// ============ ENDPOINTS - AUTHENTICATION ============

/**
 * POST /api/auth/login
 * Authentifie un utilisateur avec email + password
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password, departement } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et password requis' });
  }

  let sql = 'SELECT * FROM users WHERE email = ? AND actif = 1 AND hidden = 0';
  const params = [email];

  if (departement) {
    sql += ' AND departement = ?';
    params.push(departement);
  }

  db.query(sql, params, async (err, results) => {
    if (err) {
      console.error('DB error during login:', err.message);
      return res.status(500).json({ error: 'Erreur base de données' });
    }

    if (!results || results.length === 0) {
      console.log(`❌ Login failed: user not found or inactive: ${email}`);
      return res.status(401).json({ error: 'Email ou password incorrect' });
    }

    const user = results[0];

    if (!user.password_hash) {
      console.log(`❌ Login failed: user has no password: ${email}`);
      return res.status(401).json({ error: 'Utilisateur sans password' });
    }

    // Vérifier le password
    let passwordMatch = false;
    try {
      passwordMatch = await verifyPassword(password, user.password_hash);
    } catch (err) {
      console.error('Password verification error:', err.message);
      return res.status(500).json({ error: 'Erreur lors de la vérification' });
    }

    if (!passwordMatch) {
      console.log(`❌ Login failed: password mismatch for ${email}`);
      return res.status(401).json({ error: 'Email ou password incorrect' });
    }

    // Générer JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        departement: user.departement,
        nom: user.nom,
        prenom: user.prenom
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    db.query('UPDATE users SET dernier_login = NOW() WHERE id = ?', [user.id], (err) => {
      if (err) console.error('Failed to update login time:', err.message);
    });

    // Remove password from response
    delete user.password_hash;

    console.log(`✅ Login success: ${email} (Role: ${user.role}, Dept: ${user.departement})`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        departement: user.departement
      }
    });
  });
});

/**
 * POST /api/auth/request-account
 * Enregistre une nouvelle demande de compte (status: actif=0)
 */
app.post('/api/auth/request-account', async (req, res) => {
  const { email, password, nom, prenom, telephone, poste, departement } = req.body;

  // Validation
  if (!email || !password || !nom || !prenom || !departement) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  // Valider password strength
  const pwdValidation = validatePasswordStrength(password);
  if (!pwdValidation.isStrong) {
    return res.status(400).json({
      error: 'Password trop faible',
      requirements: pwdValidation.errors
    });
  }

  // Vérifier email unique
  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results && results.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    // Insérer nouvel utilisateur (actif=0 = pending)
    db.query(
      `INSERT INTO users (nom, prenom, email, telephone, departement, poste, role, password_hash, actif, hidden, date_creation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NOW())`,
      [nom, prenom, email, telephone || null, departement, poste || null, 'employee', password],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Cet email a déjà une demande' });
          }
          return res.status(500).json({ error: err.message });
        }

        console.log(`✅ Registration request: ${email} (ID: ${result.insertId})`);

        res.status(201).json({
          success: true,
          message: 'Compte créé! En attente d\'approbation admin.',
          user: {
            id: result.insertId,
            email,
            nom,
            prenom,
            departement,
            status: 'pending'
          }
        });
      }
    );
  });
});

// ============ ENDPOINTS - ADMIN - USER MANAGEMENT ============

/**
 * GET /api/auth/pending-users
 * Liste les utilisateurs en attente d'approbation (actif=0)
 */
app.get('/api/auth/pending-users', verifyToken, (req, res) => {
  if (!['admin', 'secretaire'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  db.query(
    `SELECT id, email, nom, prenom, telephone, poste, departement, actif, date_creation
     FROM users
     WHERE actif = 0 AND hidden = 0
     ORDER BY date_creation DESC`,
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        success: true,
        count: users ? users.length : 0,
        users: users || []
      });
    }
  );
});

/**
 * PATCH /api/auth/users/:id/approve
 * Approuve un utilisateur (actif=0 → actif=1 + hash password)
 */
app.patch('/api/auth/users/:id/approve', verifyToken, async (req, res) => {
  if (!['admin', 'secretaire'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  const userId = parseInt(req.params.id);

  db.query('SELECT * FROM users WHERE id = ?', [userId], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const user = results[0];

    try {
      // Hash le password
      const hashedPassword = await hashPassword(user.password_hash, true);

      // Update: hash password + activate
      db.query(
        'UPDATE users SET password_hash = ?, actif = 1 WHERE id = ?',
        [hashedPassword, userId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          console.log(`✅ User approved: ${user.email} (ID: ${userId})`);

          res.json({
            success: true,
            message: 'Utilisateur approuvé avec succès',
            user: {
              id: user.id,
              email: user.email,
              nom: user.nom,
              prenom: user.prenom,
              departement: user.departement,
              role: user.role
            }
          });
        }
      );
    } catch (err) {
      console.error('Error during approval:', err.message);
      res.status(500).json({ error: 'Erreur lors du hachage du password' });
    }
  });
});

/**
 * PATCH /api/auth/users/:id/reject
 * Rejette une demande de compte (supprime l'utilisateur)
 */
app.patch('/api/auth/users/:id/reject', verifyToken, (req, res) => {
  if (!['admin', 'secretaire'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  const userId = parseInt(req.params.id);

  db.query('DELETE FROM users WHERE id = ? AND actif = 0', [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé ou déjà actif' });
    }

    console.log(`✅ Registration rejected: user ID ${userId}`);

    res.json({
      success: true,
      message: 'Demande rejetée'
    });
  });
});

/**
 * GET /api/auth/users
 * Liste tous les utilisateurs (admin only)
 */
app.get('/api/auth/users', verifyToken, requireRole('admin', 'directeur', 'secretaire'), (req, res) => {
  const query = req.user.role === 'directeur'
    ? 'SELECT id, matricule, nom, prenom, email, departement, role, actif FROM users WHERE hidden = 0'
    : 'SELECT id, matricule, nom, prenom, email, departement, role, actif FROM users';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results || []);
  });
});

/**
 * POST /api/auth/users
 * Créer un utilisateur directement (admin/secretaire)
 */
app.post('/api/auth/users', verifyToken, requireRole('admin', 'secretaire'), async (req, res) => {
  const { matricule, nom, prenom, email, telephone, departement, poste, role, password } = req.body;

  if (!email || !password || !nom || !prenom || !departement || !role) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  const pwdValidation = validatePasswordStrength(password);
  if (!pwdValidation.isStrong) {
    return res.status(400).json({
      error: 'Password trop faible',
      requirements: pwdValidation.errors
    });
  }

  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results && results.length > 0) return res.status(409).json({ error: 'Utilisateur déjà existant' });

    db.query(
      `INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, actif, hidden, date_creation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW())`,
      [matricule || '', nom, prenom, email, telephone || '', departement, poste || '', role, password],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({
          success: true,
          user: { id: result.insertId, matricule, nom, prenom, email, departement, role }
        });
      }
    );
  });
});

// ============ ENDPOINTS - USER PROFILE ============

/**
 * GET /api/auth/me
 * Obtient le profil de l'utilisateur connecté
 */
app.get('/api/auth/me', verifyToken, (req, res) => {
  db.query(
    'SELECT id, email, nom, prenom, role, departement, telephone, poste, langue FROM users WHERE id = ?',
    [req.user.id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.json(results[0]);
    }
  );
});

/**
 * PATCH /api/auth/change-password
 * Change le password de l'utilisateur connecté
 */
app.patch('/api/auth/change-password', verifyToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Ancien et nouveau password requis' });
  }

  const pwdValidation = validatePasswordStrength(newPassword);
  if (!pwdValidation.isStrong) {
    return res.status(400).json({
      error: 'Nouveau password trop faible',
      requirements: pwdValidation.errors
    });
  }

  db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier ancien password
    const passwordMatch = await verifyPassword(oldPassword, results[0].password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Ancien password incorrect' });
    }

    // Hash nouveau password
    const hashedPassword = await hashPassword(newPassword, true);

    db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, req.user.id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ success: true, message: 'Password changé avec succès' });
    });
  });
});

// ============ START SERVER ============

app.listen(PORT, () => {
  console.log(`✅ AUTH SERVICE running on port ${PORT}`);
  console.log(`📍 Base URL: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health\n`);
});
