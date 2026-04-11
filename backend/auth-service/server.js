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
const crypto = require('crypto');

// ============ CONFIGURATION ============

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_microservices_blg_engineering_2026';
const PASSWORD_VAULT_SECRET = process.env.PASSWORD_VAULT_SECRET || `${JWT_SECRET}:password-vault`;

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
  seedDepartments();
  ensurePasswordControlTables();
  ensureUserPreferenceTable();
  ensureCoordinationTables();
  ensureErrorReportTable();
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
 * Normalise les noms de départements pour comparer des valeurs incohérentes
 * venant du frontend et de la base.
 */
function normalizeDepartment(value) {
  if (!value) return '';

  const normalized = String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const aliases = {
    'pdg': 'pdg',
    'direction': 'direction',
    'direction generale': 'pdg',
    'pdg direction generale': 'pdg',
    'admin': 'direction',
    'secretaire': 'secretaire',
    'secretariat': 'secretaire',
    'assurance': 'assurance',
    'service assurance': 'assurance',
    'btp': 'btp',
    'btp construction': 'btp',
    'construction': 'btp',
    'rh': 'rh',
    'ressources humaines': 'rh',
    'voyage': 'voyage',
    'immigration': 'voyage',
    'service voyage immigration': 'voyage',
    'service voyage et immigration': 'voyage',
    'service voyage': 'voyage',
    'logistique': 'logistique',
    'service logistique': 'logistique',
    'communication': 'communication',
    'communication digitale': 'communication'
  };

  return aliases[normalized] || normalized;
}

function formatPendingUser(user) {
  return {
    id: user.id,
    email: user.email,
    nom: user.nom,
    prenom: user.prenom,
    telephone: user.telephone,
    poste: user.poste,
    departement: user.departement,
    actif: user.actif,
    status: user.actif ? 'approved' : 'pending',
    date_creation: user.date_creation,
    requested_at: user.date_creation
  };
}

async function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

const DEFAULT_DEPARTMENTS = [
  { code: 'pdg', nom: 'PDG / Direction Générale', description: 'Direction générale et pilotage global' },
  { code: 'secretaire', nom: 'Secrétariat', description: 'Gestion administrative et coordination' },
  { code: 'assurance', nom: 'Service Assurance', description: 'Gestion assurance et sinistres' },
  { code: 'btp', nom: 'BTP & Construction', description: 'Chantiers, ouvriers et matériaux' },
  { code: 'rh', nom: 'Ressources Humaines', description: 'Gestion du personnel' },
  { code: 'voyage', nom: 'Service Voyage & Immigration', description: 'Voyage, visa et immigration' },
  { code: 'logistique', nom: 'Service Logistique', description: 'Stocks, produits et livraisons' },
  { code: 'communication', nom: 'Communication Digitale', description: 'Campagnes et communication' }
];

function seedDepartments() {
  db.query('SELECT COUNT(*) as total FROM departments', (err, results) => {
    if (err) {
      console.error('Failed to inspect departments:', err.message);
      return;
    }

    if (results?.[0]?.total > 0) {
      return;
    }

    DEFAULT_DEPARTMENTS.forEach((department) => {
      db.query(
        'INSERT INTO departments (code, nom, description, created_at) VALUES (?, ?, ?, NOW())',
        [department.code, department.nom, department.description],
        (insertErr) => {
          if (insertErr) {
            console.error(`Failed to seed department ${department.code}:`, insertErr.message);
          }
        }
      );
    });
  });
}

function ensurePasswordControlTables() {
  db.query(
    `CREATE TABLE IF NOT EXISTS password_gate_settings (
       id INT PRIMARY KEY,
       password_hash VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
     )`,
    (settingsErr) => {
      if (settingsErr) {
        console.error('Failed to ensure password_gate_settings:', settingsErr.message);
        return;
      }

      db.query(
        `CREATE TABLE IF NOT EXISTS password_vault (
           user_id INT PRIMARY KEY,
           encrypted_password TEXT NOT NULL,
           iv VARCHAR(64) NOT NULL,
           auth_tag VARCHAR(64) NOT NULL,
           source VARCHAR(50) DEFAULT 'system',
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
         )`,
        (vaultErr) => {
          if (vaultErr) {
            console.error('Failed to ensure password_vault:', vaultErr.message);
            return;
          }

          db.query('SELECT id FROM password_gate_settings WHERE id = 1', async (selectErr, rows) => {
            if (selectErr) {
              console.error('Failed to inspect password gate settings:', selectErr.message);
              return;
            }

            if (rows && rows.length > 0) {
              return;
            }

            try {
              const defaultHash = await bcrypt.hash('root', 10);
              db.query(
                'INSERT INTO password_gate_settings (id, password_hash) VALUES (1, ?)',
                [defaultHash],
                (insertErr) => {
                  if (insertErr) {
                    console.error('Failed to seed password gate settings:', insertErr.message);
                  }
                }
              );
            } catch (hashErr) {
              console.error('Failed to hash default root password:', hashErr.message);
            }
          });
        }
      );
    }
  );
}

function ensureUserPreferenceTable() {
  db.query(
    `CREATE TABLE IF NOT EXISTS user_preferences (
       user_id INT PRIMARY KEY,
       theme VARCHAR(20) DEFAULT 'light',
       timezone VARCHAR(100) DEFAULT 'Africa/Lagos',
       date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
       time_format VARCHAR(10) DEFAULT '24h',
       compact_view TINYINT(1) DEFAULT 0,
       email_notifications TINYINT(1) DEFAULT 1,
       push_notifications TINYINT(1) DEFAULT 1,
       sms_notifications TINYINT(1) DEFAULT 0,
       weekly_report TINYINT(1) DEFAULT 1,
       monthly_report TINYINT(1) DEFAULT 1,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       CONSTRAINT fk_user_preferences_user
         FOREIGN KEY (user_id) REFERENCES users(id)
         ON DELETE CASCADE
     )`,
    (err) => {
      if (err) {
        console.error('Failed to ensure user_preferences:', err.message);
      }
    }
  );
}

function ensureCoordinationTables() {
  db.query(
    `CREATE TABLE IF NOT EXISTS announcements (
       id INT PRIMARY KEY AUTO_INCREMENT,
       sender_id INT NOT NULL,
       target_department VARCHAR(50) DEFAULT 'all',
       title VARCHAR(255) NOT NULL,
       message TEXT NOT NULL,
       priority VARCHAR(20) DEFAULT 'normal',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       CONSTRAINT fk_announcements_sender
         FOREIGN KEY (sender_id) REFERENCES users(id)
         ON DELETE CASCADE
     )`,
    (announcementErr) => {
      if (announcementErr) {
        console.error('Failed to ensure announcements:', announcementErr.message);
      }
    }
  );

  db.query(
    `CREATE TABLE IF NOT EXISTS internal_messages (
       id INT PRIMARY KEY AUTO_INCREMENT,
       sender_id INT NOT NULL,
       recipient_id INT NULL,
       target_department VARCHAR(50) DEFAULT NULL,
       subject VARCHAR(255) NOT NULL,
       message TEXT NOT NULL,
       status VARCHAR(20) DEFAULT 'sent',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       CONSTRAINT fk_internal_messages_sender
         FOREIGN KEY (sender_id) REFERENCES users(id)
         ON DELETE CASCADE,
       CONSTRAINT fk_internal_messages_recipient
         FOREIGN KEY (recipient_id) REFERENCES users(id)
         ON DELETE SET NULL
     )`,
    (messageErr) => {
      if (messageErr) {
        console.error('Failed to ensure internal_messages:', messageErr.message);
      }
    }
  );

  db.query(
    `CREATE TABLE IF NOT EXISTS document_transfers (
       id INT PRIMARY KEY AUTO_INCREMENT,
       sender_id INT NOT NULL,
       recipient_department VARCHAR(50) NOT NULL,
       title VARCHAR(255) NOT NULL,
       document_type VARCHAR(100) DEFAULT 'document',
       reference_code VARCHAR(100) DEFAULT NULL,
       notes TEXT DEFAULT NULL,
       status VARCHAR(20) DEFAULT 'transmis',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       CONSTRAINT fk_document_transfers_sender
         FOREIGN KEY (sender_id) REFERENCES users(id)
         ON DELETE CASCADE
     )`,
    (documentErr) => {
      if (documentErr) {
        console.error('Failed to ensure document_transfers:', documentErr.message);
      }
    }
  );
}

function ensureErrorReportTable() {
  db.query(
    `CREATE TABLE IF NOT EXISTS error_reports (
       id INT PRIMARY KEY AUTO_INCREMENT,
       user_id INT NULL,
       service_name VARCHAR(100) NOT NULL,
       page_url TEXT NULL,
       action_name VARCHAR(255) NULL,
       error_message TEXT NOT NULL,
       stack_trace TEXT NULL,
       severity VARCHAR(20) DEFAULT 'error',
       metadata JSON NULL,
       resolved TINYINT(1) DEFAULT 0,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       CONSTRAINT fk_error_reports_user
         FOREIGN KEY (user_id) REFERENCES users(id)
         ON DELETE SET NULL
     )`,
    (err) => {
      if (err) {
        console.error('Failed to ensure error_reports:', err.message);
      }
    }
  );
}

function getVaultKey() {
  return crypto.scryptSync(PASSWORD_VAULT_SECRET, 'auth-password-vault', 32);
}

function encryptPasswordForVault(plainPassword) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getVaultKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainPassword, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedPassword: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

function decryptPasswordFromVault(record) {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    getVaultKey(),
    Buffer.from(record.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(record.auth_tag, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(record.encrypted_password, 'hex')),
    decipher.final()
  ]);
  return decrypted.toString('utf8');
}

function upsertPasswordVault(userId, plainPassword, source = 'system') {
  if (!userId || !plainPassword) return;

  const payload = encryptPasswordForVault(plainPassword);

  db.query(
    `INSERT INTO password_vault (user_id, encrypted_password, iv, auth_tag, source, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW())
     ON DUPLICATE KEY UPDATE
       encrypted_password = VALUES(encrypted_password),
       iv = VALUES(iv),
       auth_tag = VALUES(auth_tag),
       source = VALUES(source),
       updated_at = NOW()`,
    [userId, payload.encryptedPassword, payload.iv, payload.authTag, source],
    (err) => {
      if (err) {
        console.error('Failed to upsert password vault:', err.message);
      }
    }
  );
}

function verifyGatePassword(candidatePassword) {
  return new Promise((resolve, reject) => {
    db.query('SELECT password_hash FROM password_gate_settings WHERE id = 1', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      if (!rows || rows.length === 0) {
        resolve(false);
        return;
      }

      try {
        const matches = await bcrypt.compare(candidatePassword, rows[0].password_hash);
        resolve(matches);
      } catch (compareErr) {
        reject(compareErr);
      }
    });
  });
}

function storeSession({ userId, token, ipAddress, userAgent, expiresAt }) {
  if (!userId || !token || !expiresAt) return;

  db.query(
    `INSERT INTO sessions (user_id, token, ip_address, user_agent, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [userId, token, ipAddress || null, userAgent || null, expiresAt],
    (err) => {
      if (err) {
        console.error('Failed to store session:', err.message);
      }
    }
  );
}

function getDefaultRecipientId(callback) {
  db.query(
    "SELECT id FROM users WHERE role IN ('admin', 'secretaire', 'directeur', 'pdg') AND actif = 1 ORDER BY FIELD(role, 'admin', 'secretaire', 'directeur', 'pdg'), id LIMIT 1",
    (err, results) => {
      if (err || !results || results.length === 0) {
        callback(1);
        return;
      }
      callback(results[0].id);
    }
  );
}

function logConnectionAttempt({ userId = null, email = null, departement = null, success = true, reason = null, ipAddress = null, type = 'normal', sharedBy = null, duration = null, expiresAt = null, userAgent = null }) {
  db.query(
    `INSERT INTO connection_logs (user_id, email, departement, success, type, ip, user_agent, shared_by, reason, duration, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
    [userId || 0, email, departement, success ? 1 : 0, type, ipAddress, userAgent, sharedBy, reason, duration, expiresAt],
    (err) => {
      if (err) {
        console.error('Failed to save connection log:', err.message);
      }
    }
  );
}

function createNotification({ type, title, message, recipientId = null, senderId = null, data = null }) {
  getDefaultRecipientId((resolvedRecipientId) => {
    db.query(
      `INSERT INTO notifications (type, recipient_id, sender_id, title, message, data, \`read\`, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, NOW(), ?)`,
      [type, recipientId || resolvedRecipientId, senderId, title, message, data ? JSON.stringify(data) : null, data?.expiresAt || null],
      (err) => {
        if (err) {
          console.error('Failed to create notification:', err.message);
        }
      }
    );
  });
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

function parseNotification(row) {
  let data = row.data;

  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      data = null;
    }
  }

  return {
    ...row,
    is_read: row.read ?? 0,
    data
  };
}

function parsePreferenceRow(row, fallbackLanguage = 'fr') {
  return {
    theme: row?.theme || 'light',
    language: row?.langue || fallbackLanguage || 'fr',
    timezone: row?.timezone || 'Africa/Lagos',
    dateFormat: row?.date_format || 'DD/MM/YYYY',
    timeFormat: row?.time_format || '24h',
    compactView: Boolean(row?.compact_view),
    emailNotifications: Boolean(row?.email_notifications ?? 1),
    pushNotifications: Boolean(row?.push_notifications ?? 1),
    smsNotifications: Boolean(row?.sms_notifications ?? 0),
    weeklyReport: Boolean(row?.weekly_report ?? 1),
    monthlyReport: Boolean(row?.monthly_report ?? 1)
  };
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

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('DB error during login:', err.message);
      return res.status(500).json({ error: 'Erreur base de données' });
    }

    if (!results || results.length === 0) {
      console.log(`❌ Login failed: user not found: ${email}`);
      return res.status(401).json({ error: 'Email ou password incorrect' });
    }

    const user = results[0];

    if (!user.actif) {
      return res.status(403).json({ error: 'Compte en attente de validation administrative' });
    }

    if (user.hidden) {
      return res.status(403).json({ error: 'Compte restreint par la direction. Seuls l’administrateur ou le directeur peuvent lever cette restriction.' });
    }
    const requestedDepartment = normalizeDepartment(departement);
    const actualDepartment = normalizeDepartment(user.departement);

    if (requestedDepartment && requestedDepartment !== actualDepartment && !['admin', 'directeur'].includes(user.role)) {
      logConnectionAttempt({
        userId: user.id,
        email,
        departement,
        success: false,
        reason: `Département invalide: attendu ${user.departement}`,
        ipAddress: req.ip
      });
      return res.status(401).json({ error: 'Département incorrect pour cet utilisateur' });
    }

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
      logConnectionAttempt({
        userId: user.id,
        email,
        departement: user.departement,
        success: false,
        reason: 'Mot de passe incorrect',
        ipAddress: req.ip
      });
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
    const sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update last login
    db.query('UPDATE users SET dernier_login = NOW() WHERE id = ?', [user.id], (err) => {
      if (err) console.error('Failed to update login time:', err.message);
    });
    storeSession({
      userId: user.id,
      token,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      expiresAt: sessionExpiresAt
    });
    logConnectionAttempt({
      userId: user.id,
      email: user.email,
      departement: user.departement,
      success: true,
      reason: 'Connexion réussie',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
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

    hashPassword(password)
      .then((hashedPassword) => {
        db.query(
          `INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, actif, hidden, date_creation)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NOW())`,
          [`PND-${Date.now()}`, nom, prenom, email, telephone || null, departement, poste || null, 'employee', hashedPassword],
          (err, result) => {
            if (err) {
              if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Cet email a déjà une demande' });
              }
              return res.status(500).json({ error: err.message });
            }

            createNotification({
              type: 'new-account',
              title: 'Nouvelle demande de compte',
              message: `${prenom} ${nom} a demandé un compte pour ${departement}`,
              data: { email, nom, prenom, telephone, poste, departement }
            });
            upsertPasswordVault(result.insertId, password, 'request-account');

            console.log(`✅ Registration request: ${email} (ID: ${result.insertId})`);

            res.status(201).json({
              success: true,
              message: 'Compte créé! En attente d\'approbation admin.',
              user: {
                id: result.insertId,
                email,
                nom,
                prenom,
                telephone,
                poste,
                departement,
                status: 'pending'
              }
            });
          }
        );
      })
      .catch((hashErr) => {
        console.error('Registration hash error:', hashErr.message);
        res.status(500).json({ error: 'Erreur lors de la sécurisation du password' });
      });
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
        users: (users || []).map(formatPendingUser)
      });
    }
  );
});

/**
 * PATCH /api/auth/users/:id/approve
 * Approuve un utilisateur (actif=0 → actif=1)
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

    db.query(
      'UPDATE users SET actif = 1 WHERE id = ?',
      [userId],
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        createNotification({
          type: 'account-approved',
          title: 'Compte approuvé',
          message: `Le compte de ${user.prenom} ${user.nom} a été approuvé`,
          recipientId: user.id,
          senderId: req.user.id,
          data: { userId: user.id, email: user.email }
        });

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
  db.query('SELECT id, email, nom, prenom FROM users WHERE id = ? AND actif = 0', [userId], (findErr, users) => {
    if (findErr) {
      return res.status(500).json({ error: findErr.message });
    }

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé ou déjà actif' });
    }

    const pendingUser = users[0];

    db.query('DELETE FROM users WHERE id = ? AND actif = 0', [userId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Utilisateur non trouvé ou déjà actif' });
      }

      createNotification({
        type: 'account-rejected',
        title: 'Compte rejeté',
        message: `La demande de ${pendingUser.prenom} ${pendingUser.nom} a été rejetée`,
        senderId: req.user.id,
        data: { userId: pendingUser.id, email: pendingUser.email }
      });

      console.log(`✅ Registration rejected: user ID ${userId}`);

      res.json({
        success: true,
        message: 'Demande rejetée',
        user: pendingUser
      });
    });
  });
});

/**
 * PATCH /api/auth/users/:id/reset-password
 * Admin réinitialise le password d'un utilisateur
 */
app.patch('/api/auth/users/:id/reset-password', verifyToken, async (req, res) => {
  if (!['admin', 'secretaire'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  const userId = parseInt(req.params.id);
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Password doit avoir au moins 8 caractères' });
  }

  try {
    // Hash le nouveau password
    const hashedPassword = await hashPassword(newPassword);

    // Mettre à jour le password
    db.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, userId],
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        upsertPasswordVault(userId, newPassword, 'admin-reset');
        console.log(`✅ Password reset for user ID ${userId}`);

        res.json({
          success: true,
          message: 'Password réinitialisé avec succès',
          newPassword: newPassword
        });
      }
    );
  } catch (err) {
    return res.status(500).json({ error: 'Erreur lors du hachage' });
  }
});

/**
 * GET /api/auth/users
 * Liste tous les utilisateurs (admin only)
 */
app.get('/api/auth/users', verifyToken, requireRole('admin', 'directeur', 'secretaire', 'pdg'), (req, res) => {
  const query = req.user.role === 'admin'
    ? `SELECT u.id, u.matricule, u.nom, u.prenom, u.email, u.departement, u.role, u.actif, u.hidden, u.date_creation AS created_at,
              CASE WHEN pv.user_id IS NULL THEN 0 ELSE 1 END AS has_password_vault
       FROM users u
       LEFT JOIN password_vault pv ON pv.user_id = u.id`
    : ['directeur', 'pdg'].includes(req.user.role)
    ? `SELECT u.id, u.matricule, u.nom, u.prenom, u.email, u.departement, u.role, u.actif, u.hidden, u.date_creation AS created_at,
              CASE WHEN pv.user_id IS NULL THEN 0 ELSE 1 END AS has_password_vault
       FROM users u
       LEFT JOIN password_vault pv ON pv.user_id = u.id
       WHERE u.hidden = 0 AND u.role <> 'admin'`
    : `SELECT u.id, u.matricule, u.nom, u.prenom, u.email, u.departement, u.role, u.actif, u.hidden, u.date_creation AS created_at,
              CASE WHEN pv.user_id IS NULL THEN 0 ELSE 1 END AS has_password_vault
       FROM users u
       LEFT JOIN password_vault pv ON pv.user_id = u.id
       WHERE u.role <> 'admin'`;

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

  db.query('SELECT id FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results && results.length > 0) return res.status(409).json({ error: 'Utilisateur déjà existant' });

    try {
      const hashedPassword = await hashPassword(password);

      db.query(
        `INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, actif, hidden, date_creation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW())`,
        [matricule || `USR-${Date.now()}`, nom, prenom, email, telephone || '', departement, poste || '', role, hashedPassword],
        (insertErr, result) => {
          if (insertErr) return res.status(500).json({ error: insertErr.message });
          upsertPasswordVault(result.insertId, password, 'admin-create');

          res.status(201).json({
            success: true,
            user: { id: result.insertId, matricule, nom, prenom, email, departement, role }
          });
        }
      );
    } catch (hashErr) {
      return res.status(500).json({ error: hashErr.message });
    }
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

app.get('/api/auth/profile/:id', verifyToken, (req, res) => {
  const profileId = parseInt(req.params.id, 10);

  if (req.user.id !== profileId && !['admin', 'directeur'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès au profil refusé' });
  }

  db.query(
    `SELECT id, matricule, nom, prenom, email, telephone, departement, poste, role,
            photo_profil, langue, date_creation, dernier_login
     FROM users
     WHERE id = ?`,
    [profileId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!results || !results.length) {
        return res.status(404).json({ error: 'Profil introuvable' });
      }

      res.json(results[0]);
    }
  );
});

app.patch('/api/auth/profile/:id', verifyToken, (req, res) => {
  const profileId = parseInt(req.params.id, 10);

  if (req.user.id !== profileId && !['admin', 'directeur'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Modification du profil refusée' });
  }

  const { prenom, nom, telephone, adresse, poste, langue, photo_profil } = req.body;

  db.query(
    `UPDATE users
     SET prenom = COALESCE(?, prenom),
         nom = COALESCE(?, nom),
         telephone = COALESCE(?, telephone),
         poste = COALESCE(?, poste),
         langue = COALESCE(?, langue),
         photo_profil = COALESCE(?, photo_profil)
     WHERE id = ?`,
    [prenom ?? null, nom ?? null, telephone ?? null, poste ?? null, langue ?? null, photo_profil ?? null, profileId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!result.affectedRows) {
        return res.status(404).json({ error: 'Profil introuvable' });
      }

      res.json({ success: true, message: 'Profil mis à jour avec succès' });
    }
  );
});

app.get('/api/auth/preferences/:id', verifyToken, (req, res) => {
  const profileId = parseInt(req.params.id, 10);

  if (!profileId) {
    return res.status(400).json({ error: 'Identifiant utilisateur invalide' });
  }

  if (req.user.id !== profileId && !['admin', 'directeur'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  db.query(
    `SELECT u.langue, p.theme, p.timezone, p.date_format, p.time_format, p.compact_view,
            p.email_notifications, p.push_notifications, p.sms_notifications,
            p.weekly_report, p.monthly_report
     FROM users u
     LEFT JOIN user_preferences p ON p.user_id = u.id
     WHERE u.id = ?
     LIMIT 1`,
    [profileId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }

      res.json({
        success: true,
        preferences: parsePreferenceRow(rows[0], rows[0].langue)
      });
    }
  );
});

app.patch('/api/auth/preferences/:id', verifyToken, (req, res) => {
  const profileId = parseInt(req.params.id, 10);

  if (!profileId) {
    return res.status(400).json({ error: 'Identifiant utilisateur invalide' });
  }

  if (req.user.id !== profileId && !['admin', 'directeur'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  const payload = {
    theme: req.body.theme || 'light',
    language: req.body.language || 'fr',
    timezone: req.body.timezone || 'Africa/Lagos',
    dateFormat: req.body.dateFormat || 'DD/MM/YYYY',
    timeFormat: req.body.timeFormat || '24h',
    compactView: req.body.compactView ? 1 : 0,
    emailNotifications: req.body.emailNotifications === false ? 0 : 1,
    pushNotifications: req.body.pushNotifications === false ? 0 : 1,
    smsNotifications: req.body.smsNotifications ? 1 : 0,
    weeklyReport: req.body.weeklyReport === false ? 0 : 1,
    monthlyReport: req.body.monthlyReport === false ? 0 : 1
  };

  db.query('UPDATE users SET langue = ? WHERE id = ?', [payload.language, profileId], (userErr) => {
    if (userErr) {
      return res.status(500).json({ error: userErr.message });
    }

    db.query(
      `INSERT INTO user_preferences (
         user_id, theme, timezone, date_format, time_format, compact_view,
         email_notifications, push_notifications, sms_notifications,
         weekly_report, monthly_report, created_at, updated_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         theme = VALUES(theme),
         timezone = VALUES(timezone),
         date_format = VALUES(date_format),
         time_format = VALUES(time_format),
         compact_view = VALUES(compact_view),
         email_notifications = VALUES(email_notifications),
         push_notifications = VALUES(push_notifications),
         sms_notifications = VALUES(sms_notifications),
         weekly_report = VALUES(weekly_report),
         monthly_report = VALUES(monthly_report),
         updated_at = NOW()`,
      [
        profileId,
        payload.theme,
        payload.timezone,
        payload.dateFormat,
        payload.timeFormat,
        payload.compactView,
        payload.emailNotifications,
        payload.pushNotifications,
        payload.smsNotifications,
        payload.weeklyReport,
        payload.monthlyReport
      ],
      (prefErr) => {
        if (prefErr) {
          return res.status(500).json({ error: prefErr.message });
        }

        res.json({
          success: true,
          message: 'Préférences enregistrées',
          preferences: {
            theme: payload.theme,
            language: payload.language,
            timezone: payload.timezone,
            dateFormat: payload.dateFormat,
            timeFormat: payload.timeFormat,
            compactView: Boolean(payload.compactView),
            emailNotifications: Boolean(payload.emailNotifications),
            pushNotifications: Boolean(payload.pushNotifications),
            smsNotifications: Boolean(payload.smsNotifications),
            weeklyReport: Boolean(payload.weeklyReport),
            monthlyReport: Boolean(payload.monthlyReport)
          }
        });
      }
    );
  });
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
    const hashedPassword = await hashPassword(newPassword);

    db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, req.user.id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      upsertPasswordVault(req.user.id, newPassword, 'self-change');
      res.json({ success: true, message: 'Password changé avec succès' });
    });
  });
});

app.post('/api/auth/share-login', async (req, res) => {
  const { email, password, duration } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et password requis' });
  }

  db.query('SELECT * FROM users WHERE email = ? AND actif = 1 AND hidden = 0', [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur base de données' });
    }

    if (!results || results.length === 0) {
      return res.status(401).json({ error: 'Email ou password incorrect' });
    }

    const user = results[0];
    const passwordMatch = await verifyPassword(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou password incorrect' });
    }

    const expiresInMinutes = Math.max(5, Math.min(parseInt(duration, 10) || 15, 720));
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        departement: user.departement,
        nom: user.nom,
        prenom: user.prenom,
        isShared: true
      },
      JWT_SECRET,
      { expiresIn: `${expiresInMinutes}m` }
    );
    storeSession({
      userId: user.id,
      token,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      expiresAt
    });
    logConnectionAttempt({
      userId: user.id,
      email: user.email,
      departement: user.departement,
      success: true,
      reason: 'Connexion partagée réussie',
      ipAddress: req.ip,
      type: 'share',
      sharedBy: req.body?.sharedBy?.email || null,
      duration: expiresInMinutes,
      expiresAt,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      token,
      expiresAt: expiresAt.toISOString(),
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

app.get('/api/auth/notifications', verifyToken, requireRole('admin', 'secretaire', 'directeur', 'pdg'), (req, res) => {
  db.query(
    `SELECT id, type, title, message, data, created_at, \`read\`, read_at, expires_at
     FROM notifications
     ORDER BY created_at DESC
     LIMIT 100`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        success: true,
        notifications: (results || []).map(parseNotification)
      });
    }
  );
});

app.patch('/api/auth/notifications/:id/read', verifyToken, requireRole('admin', 'secretaire', 'directeur', 'pdg'), (req, res) => {
  db.query(
    'UPDATE notifications SET `read` = 1, read_at = NOW() WHERE id = ?',
    [parseInt(req.params.id)],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!result.affectedRows) {
        return res.status(404).json({ error: 'Notification non trouvée' });
      }

      res.json({ success: true });
    }
  );
});

app.delete('/api/auth/notifications/:id', verifyToken, (req, res) => {
  const notificationId = parseInt(req.params.id, 10);

  db.query('DELETE FROM notifications WHERE id = ?', [notificationId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Notification introuvable' });
    }

    res.json({ success: true });
  });
});

app.delete('/api/auth/notifications/clear/:userId', verifyToken, (req, res) => {
  const targetUserId = parseInt(req.params.userId, 10);

  if (req.user.id !== targetUserId && !['admin', 'directeur'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Suppression refusée' });
  }

  db.query('DELETE FROM notifications WHERE recipient_id = ? OR recipient_id IS NULL', [targetUserId], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ success: true });
  });
});

app.post('/api/auth/notifications/send', verifyToken, requireRole('admin', 'directeur', 'secretaire', 'pdg'), (req, res) => {
  const title = String(req.body.title || '').trim();
  const message = String(req.body.message || '').trim();
  const department = normalizeDepartment(req.body.department || '');
  const explicitRecipientId = parseInt(req.body.recipientId, 10) || null;

  if (!title || !message) {
    return res.status(400).json({ error: 'Titre et message requis' });
  }

  if (explicitRecipientId) {
    return db.query(
      `INSERT INTO notifications (type, recipient_id, sender_id, title, message, data, \`read\`, created_at)
       VALUES ('manual', ?, ?, ?, ?, ?, 0, NOW())`,
      [explicitRecipientId, req.user.id, title, message, JSON.stringify({ department: department || null })],
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.status(201).json({ success: true, delivered: 1 });
      }
    );
  }

  const query = department && department !== 'all'
    ? `SELECT id FROM users WHERE actif = 1 AND hidden = 0 AND departement = ?`
    : `SELECT id FROM users WHERE actif = 1 AND hidden = 0 AND role <> 'admin'`;
  const params = department && department !== 'all' ? [department] : [];

  db.query(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Aucun destinataire trouvé pour cette diffusion' });
    }

    const values = rows.map((row) => [
      'manual',
      row.id,
      req.user.id,
      title,
      message,
      JSON.stringify({ department: department || 'all' }),
      0
    ]);

    db.query(
      `INSERT INTO notifications (type, recipient_id, sender_id, title, message, data, \`read\`, created_at)
       VALUES ?`,
      [values.map((value) => [...value, new Date()])],
      (insertErr) => {
        if (insertErr) {
          return res.status(500).json({ error: insertErr.message });
        }

        res.status(201).json({
          success: true,
          delivered: rows.length,
          department: department || 'all'
        });
      }
    );
  });
});

app.get('/api/auth/announcements', verifyToken, requireRole('admin', 'secretaire', 'directeur', 'pdg'), (req, res) => {
  const department = normalizeDepartment(req.query.department || req.user.departement || '');
  db.query(
    `SELECT a.id, a.target_department, a.title, a.message, a.priority, a.created_at,
            u.nom AS sender_nom, u.prenom AS sender_prenom
     FROM announcements a
     JOIN users u ON u.id = a.sender_id
     WHERE a.target_department = 'all' OR a.target_department = ?
     ORDER BY a.created_at DESC
     LIMIT 50`,
    [department],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(rows || []);
    }
  );
});

app.post('/api/auth/announcements', verifyToken, requireRole('admin', 'secretaire', 'directeur', 'pdg'), (req, res) => {
  const title = String(req.body.title || '').trim();
  const message = String(req.body.message || '').trim();
  const targetDepartment = normalizeDepartment(req.body.targetDepartment || 'all') || 'all';
  const priority = String(req.body.priority || 'normal').trim() || 'normal';

  if (!title || !message) {
    return res.status(400).json({ error: 'Titre et message requis' });
  }

  db.query(
    `INSERT INTO announcements (sender_id, target_department, title, message, priority, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [req.user.id, targetDepartment, title, message, priority],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        success: true,
        id: result.insertId,
        message: 'Annonce enregistrée'
      });
    }
  );
});

app.get('/api/auth/internal-messages', verifyToken, requireRole('admin', 'secretaire', 'directeur', 'pdg'), (req, res) => {
  const department = normalizeDepartment(req.user.departement || '');
  db.query(
    `SELECT m.id, m.subject, m.message, m.status, m.target_department, m.created_at,
            s.nom AS sender_nom, s.prenom AS sender_prenom,
            r.nom AS recipient_nom, r.prenom AS recipient_prenom
     FROM internal_messages m
     JOIN users s ON s.id = m.sender_id
     LEFT JOIN users r ON r.id = m.recipient_id
     WHERE m.sender_id = ? OR m.recipient_id = ? OR m.target_department = ? OR m.target_department IS NULL
     ORDER BY m.created_at DESC
     LIMIT 100`,
    [req.user.id, req.user.id, department],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(rows || []);
    }
  );
});

app.post('/api/auth/internal-messages', verifyToken, requireRole('admin', 'secretaire', 'directeur', 'pdg'), (req, res) => {
  const subject = String(req.body.subject || '').trim();
  const message = String(req.body.message || '').trim();
  const recipientId = parseInt(req.body.recipientId, 10) || null;
  const targetDepartment = normalizeDepartment(req.body.targetDepartment || '') || null;

  if (!subject || !message) {
    return res.status(400).json({ error: 'Objet et message requis' });
  }

  db.query(
    `INSERT INTO internal_messages (sender_id, recipient_id, target_department, subject, message, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'sent', NOW())`,
    [req.user.id, recipientId, targetDepartment, subject, message],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        success: true,
        id: result.insertId,
        message: 'Message transmis'
      });
    }
  );
});

app.get('/api/auth/document-transfers', verifyToken, requireRole('admin', 'secretaire', 'directeur', 'pdg'), (req, res) => {
  const department = normalizeDepartment(req.user.departement || '');
  db.query(
    `SELECT d.id, d.recipient_department, d.title, d.document_type, d.reference_code, d.notes, d.status, d.created_at,
            u.nom AS sender_nom, u.prenom AS sender_prenom
     FROM document_transfers d
     JOIN users u ON u.id = d.sender_id
     WHERE d.sender_id = ? OR d.recipient_department = ?
     ORDER BY d.created_at DESC
     LIMIT 100`,
    [req.user.id, department],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(rows || []);
    }
  );
});

app.post('/api/auth/document-transfers', verifyToken, requireRole('admin', 'secretaire', 'directeur', 'pdg'), (req, res) => {
  const recipientDepartment = normalizeDepartment(req.body.recipientDepartment || '');
  const title = String(req.body.title || '').trim();
  const documentType = String(req.body.documentType || 'document').trim();
  const referenceCode = String(req.body.referenceCode || '').trim() || null;
  const notes = String(req.body.notes || '').trim() || null;

  if (!recipientDepartment || !title) {
    return res.status(400).json({ error: 'Département destinataire et titre requis' });
  }

  db.query(
    `INSERT INTO document_transfers (sender_id, recipient_department, title, document_type, reference_code, notes, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'transmis', NOW())`,
    [req.user.id, recipientDepartment, title, documentType, referenceCode, notes],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        success: true,
        id: result.insertId,
        message: 'Document transmis'
      });
    }
  );
});

app.post('/api/auth/error-reports', (req, res) => {
  const userId = parseInt(req.body.userId, 10) || null;
  const serviceName = String(req.body.serviceName || 'frontend').trim();
  const pageUrl = String(req.body.pageUrl || '').trim() || null;
  const actionName = String(req.body.actionName || '').trim() || null;
  const errorMessage = String(req.body.errorMessage || '').trim();
  const stackTrace = String(req.body.stackTrace || '').trim() || null;
  const severity = String(req.body.severity || 'error').trim() || 'error';
  const metadata = req.body.metadata ? JSON.stringify(req.body.metadata) : null;

  if (!errorMessage) {
    return res.status(400).json({ error: 'errorMessage requis' });
  }

  db.query(
    `INSERT INTO error_reports
     (user_id, service_name, page_url, action_name, error_message, stack_trace, severity, metadata, resolved, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
    [userId, serviceName, pageUrl, actionName, errorMessage, stackTrace, severity, metadata],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      createNotification({
        type: 'incident',
        title: `Incident ${serviceName}`,
        message: errorMessage,
        data: { reportId: result.insertId, serviceName, actionName, pageUrl, severity }
      });

      res.status(201).json({ success: true, id: result.insertId });
    }
  );
});

app.get('/api/auth/error-reports', verifyToken, requireRole('admin'), (req, res) => {
  db.query(
    `SELECT er.*, u.email, u.nom, u.prenom
     FROM error_reports er
     LEFT JOIN users u ON u.id = er.user_id
     ORDER BY er.created_at DESC
     LIMIT 200`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(rows || []);
    }
  );
});

app.patch('/api/auth/error-reports/:id/resolve', verifyToken, requireRole('admin'), (req, res) => {
  db.query(
    'UPDATE error_reports SET resolved = 1 WHERE id = ?',
    [req.params.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!result.affectedRows) {
        return res.status(404).json({ error: 'Rapport introuvable' });
      }

      res.json({ success: true, message: 'Rapport marqué comme traité' });
    }
  );
});

app.get('/api/auth/pending-users-with-notifications', verifyToken, requireRole('admin', 'secretaire', 'directeur', 'pdg'), (req, res) => {
  db.query(
    `SELECT
       u.id, u.email, u.nom, u.prenom, u.telephone, u.poste, u.departement, u.date_creation AS requested_at,
       MAX(n.id) AS notification_id,
       CASE WHEN MAX(n.id) IS NULL THEN 0 ELSE 1 END AS has_notification
     FROM users u
     LEFT JOIN notifications n
       ON n.type = 'new-account'
      AND JSON_EXTRACT(n.data, '$.email') = JSON_QUOTE(u.email)
     WHERE u.actif = 0 AND u.hidden = 0
     GROUP BY u.id, u.email, u.nom, u.prenom, u.telephone, u.poste, u.departement, u.date_creation
     ORDER BY u.date_creation DESC`,
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        success: true,
        users: users || []
      });
    }
  );
});

app.post('/api/notifications/new-account', (req, res) => {
  const { email, nom, prenom, telephone, poste, departement, timestamp } = req.body;

  createNotification({
    type: 'new-account',
    title: 'Nouvelle demande de compte',
    message: `${prenom || ''} ${nom || ''}`.trim() + ` souhaite rejoindre ${departement || 'un département'}`,
    data: { email, nom, prenom, telephone, poste, departement, timestamp }
  });

  res.status(201).json({ success: true });
});

app.post('/api/notifications/share-request', (req, res) => {
  const { ownerEmail, sharedByEmail, sharedByName, department, reason, duration, timestamp, expiresAt } = req.body;

  createNotification({
    type: 'share-request',
    title: 'Demande de partage de compte',
    message: `${sharedByName || sharedByEmail || 'Un utilisateur'} demande un partage pour ${department || 'un département'}`,
    data: { ownerEmail, sharedByEmail, sharedByName, department, reason, duration, timestamp, expiresAt }
  });

  res.status(201).json({ success: true });
});

app.post('/api/logs/connection', (req, res) => {
  const { userId, email, departement, success, reason, type, sharedBy, duration, expiresAt } = req.body;
  logConnectionAttempt({
    userId,
    email,
    departement,
    success: success !== false,
    reason: reason || null,
    ipAddress: req.ip,
    type: type || 'api',
    sharedBy: sharedBy || null,
    duration: duration || null,
    expiresAt: expiresAt || null,
    userAgent: req.headers['user-agent']
  });
  res.status(201).json({ success: true });
});

app.get('/api/logs/connection', verifyToken, requireRole('admin', 'secretaire', 'directeur', 'pdg'), (req, res) => {
  const limit = Math.max(1, Math.min(parseInt(req.query.limit, 10) || 100, 500));

  db.query(
    `SELECT id, user_id, email, departement, ip, type, shared_by, success, reason, duration, expires_at, created_at
     FROM connection_logs
     ORDER BY created_at DESC
     LIMIT ?`,
    [limit],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(results || []);
    }
  );
});

app.get('/api/auth/departments', (req, res) => {
  db.query(
    'SELECT id, code, nom, description, created_at FROM departments ORDER BY nom ASC',
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(results || []);
    }
  );
});

app.get('/api/auth/account-status', (req, res) => {
  const email = String(req.query.email || '').trim();

  if (!email) {
    return res.status(400).json({ error: 'Email requis' });
  }

  db.query(
    `SELECT id, email, nom, prenom, departement, role, actif, hidden, date_creation
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const user = results?.[0];
      if (!user) {
        return res.status(404).json({ error: 'Compte introuvable' });
      }

      res.json({
        success: true,
        status: user.actif ? 'approved' : 'pending',
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          departement: user.departement,
          role: user.role,
          actif: user.actif,
          hidden: user.hidden,
          date_creation: user.date_creation
        }
      });
    }
  );
});

app.get('/api/auth/sessions', verifyToken, requireRole('admin', 'secretaire', 'directeur', 'pdg'), (req, res) => {
  db.query(
    `SELECT id, user_id, token, ip_address, user_agent, expires_at, created_at
     FROM sessions
     ORDER BY created_at DESC
     LIMIT 100`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(results || []);
    }
  );
});

app.get('/api/auth/stats/dashboard', verifyToken, requireRole('admin', 'secretaire', 'directeur', 'pdg'), (req, res) => {
  db.query(
    `SELECT
       (SELECT COUNT(*) FROM users WHERE role <> 'admin') AS total_users,
       (SELECT COUNT(*) FROM users WHERE actif = 1 AND hidden = 0 AND role <> 'admin') AS active_users,
       (SELECT COUNT(*) FROM users WHERE actif = 0 AND role <> 'admin') AS pending_approvals,
       (SELECT COUNT(*) FROM departments) AS services_active,
       (SELECT COUNT(*) FROM connection_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS weekly_activity`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(results?.[0] || {});
    }
  );
});

app.get('/api/alerts/critical', verifyToken, requireRole('admin', 'secretaire', 'directeur', 'pdg'), (req, res) => {
  db.query(
    `SELECT 1 AS id, 'warning' AS type,
            'Comptes en attente' AS title,
            CONCAT(COUNT(*), ' compte(s) attendent une validation administrative') AS message,
            NOW() AS timestamp
     FROM users
     WHERE actif = 0 AND role <> 'admin'
     HAVING COUNT(*) > 0
     UNION ALL
     SELECT 2 AS id, 'critical' AS type,
            'Comptes restreints' AS title,
            CONCAT(COUNT(*), ' compte(s) sont actuellement restreints par la direction') AS message,
            NOW() AS timestamp
     FROM users
     WHERE hidden = 1 AND role <> 'admin'
     HAVING COUNT(*) > 0
     UNION ALL
     SELECT 3 AS id, 'info' AS type,
            'Notifications non lues' AS title,
            CONCAT(COUNT(*), ' notification(s) nécessitent encore une action') AS message,
            NOW() AS timestamp
     FROM notifications
     WHERE \`read\` = 0
     HAVING COUNT(*) > 0`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(rows || []);
    }
  );
});

app.get('/api/auth/monitoring/overview', verifyToken, requireRole('admin', 'secretaire', 'directeur', 'pdg'), (req, res) => {
  db.query(
    `SELECT
       (SELECT COUNT(*) FROM users) AS total_users,
       (SELECT COUNT(*) FROM users WHERE actif = 1) AS active_users,
       (SELECT COUNT(*) FROM users WHERE actif = 0) AS pending_users,
       (SELECT COUNT(*) FROM users WHERE hidden = 1) AS hidden_users,
       (SELECT COUNT(*) FROM sessions) AS total_sessions,
       (SELECT COUNT(*) FROM notifications) AS total_notifications,
       (SELECT COUNT(*) FROM notifications WHERE \`read\` = 0) AS unread_notifications,
       (SELECT COUNT(*) FROM connection_logs) AS total_connection_logs,
       (SELECT COUNT(*) FROM departments) AS total_departments`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(results?.[0] || {});
    }
  );
});

app.get('/api/auth/password-gate/status', verifyToken, requireRole('admin'), (req, res) => {
  db.query(
    `SELECT
       EXISTS(SELECT 1 FROM password_gate_settings WHERE id = 1) AS configured,
       (SELECT updated_at FROM password_gate_settings WHERE id = 1) AS updated_at`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        configured: Boolean(results?.[0]?.configured),
        updated_at: results?.[0]?.updated_at || null
      });
    }
  );
});

app.post('/api/auth/password-gate/change', verifyToken, requireRole('admin'), async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'Le mot de passe d\'accès doit avoir au moins 4 caractères' });
  }

  try {
    const currentMatches = await verifyGatePassword(currentPassword || '');
    if (!currentMatches) {
      return res.status(401).json({ error: 'Mot de passe d\'accès actuel incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    db.query(
      'UPDATE password_gate_settings SET password_hash = ?, updated_at = NOW() WHERE id = 1',
      [newHash],
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({ success: true, message: 'Mot de passe d\'accès changé avec succès' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message || 'Erreur interne' });
  }
});

app.post('/api/auth/users/:id/password/reveal', verifyToken, requireRole('admin'), async (req, res) => {
  const userId = parseInt(req.params.id);
  const { gatePassword } = req.body;

  if (!gatePassword) {
    return res.status(400).json({ error: 'Mot de passe d\'accès requis' });
  }

  try {
    const gateMatches = await verifyGatePassword(gatePassword);
    if (!gateMatches) {
      return res.status(401).json({ error: 'Mot de passe d\'accès incorrect' });
    }

    db.query(
      `SELECT pv.user_id, pv.encrypted_password, pv.iv, pv.auth_tag, pv.source, pv.updated_at, u.email
       FROM password_vault pv
       JOIN users u ON u.id = pv.user_id
       WHERE pv.user_id = ?`,
      [userId],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (!results || results.length === 0) {
          return res.status(404).json({ error: 'Aucun mot de passe récupérable pour cet utilisateur. Réinitialise-le une fois pour l\'enregistrer.' });
        }

        try {
          const password = decryptPasswordFromVault(results[0]);
          res.json({
            success: true,
            email: results[0].email,
            password,
            source: results[0].source,
            updated_at: results[0].updated_at
          });
        } catch (decryptErr) {
          res.status(500).json({ error: 'Impossible de déchiffrer ce mot de passe' });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message || 'Erreur interne' });
  }
});

app.patch('/api/auth/users/:id/hide', verifyToken, requireRole('admin', 'directeur', 'secretaire', 'pdg'), (req, res) => {
  const userId = parseInt(req.params.id);
  const hidden = req.body.hidden ? 1 : 0;

  if (req.user.role !== 'admin' && hidden === 0) {
    return res.status(403).json({ error: 'Seul l’administrateur peut lever une restriction de compte' });
  }

  db.query('UPDATE users SET hidden = ? WHERE id = ?', [hidden, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      success: true,
      message: hidden ? 'Utilisateur masqué avec succès' : 'Utilisateur réaffiché avec succès'
    });
  });
});

app.patch('/api/auth/users/:id/activate', verifyToken, requireRole('admin', 'secretaire'), (req, res) => {
  const userId = parseInt(req.params.id);
  const actif = req.body.actif ? 1 : 0;

  db.query('UPDATE users SET actif = ? WHERE id = ?', [actif, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      success: true,
      message: actif ? 'Utilisateur activé avec succès' : 'Utilisateur désactivé avec succès'
    });
  });
});

app.delete('/api/auth/users/:id', verifyToken, requireRole('admin'), (req, res) => {
  const userId = parseInt(req.params.id);

  if (userId === req.user.id) {
    return res.status(400).json({ error: 'Suppression de votre propre compte interdite' });
  }

  db.query('SELECT id, email FROM users WHERE id = ?', [userId], (findErr, users) => {
    if (findErr) {
      return res.status(500).json({ error: findErr.message });
    }

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    db.query('DELETE FROM users WHERE id = ?', [userId], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        success: true,
        message: `Utilisateur supprimé: ${users[0].email}`
      });
    });
  });
});

// ============ START SERVER ============

app.listen(PORT, () => {
  console.log(`✅ AUTH SERVICE running on port ${PORT}`);
  console.log(`📍 Base URL: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health\n`);
});
