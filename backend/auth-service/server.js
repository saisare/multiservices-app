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
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'auth_db',
  charset: 'utf8mb4'
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

// ============ LOGIN ============

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
    if (!results.length) {
      console.log('❌ User not found or inactive:', email);
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = results[0];

    if (!user.password_hash) {
      console.log('❌ User has no password:', email);
      return res.status(401).json({ error: 'Utilisateur sans mot de passe' });
    }

    let validPassword = false;

    // Support bcrypt (starts with $2) et plaintext
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
      { id: user.id, email: user.email, role: user.role, departement: user.departement },
      process.env.JWT_SECRET || 'mon_super_secret_2026',
      { expiresIn: '24h' }
    );

    db.query('UPDATE users SET dernier_login = NOW() WHERE id = ?', [user.id], (err) => {
      if (err) console.error('Update login time failed:', err);
    });

    delete user.password_hash;
    console.log('✅ Login success for:', email, 'Role:', user.role);
    res.json({ success: true, token, user });
  });
});

// ============ REGISTRATION (Direct to Users Table) ============

app.post('/api/auth/request-account', async (req, res) => {
  const { email, password, nom, prenom, telephone, poste, departement } = req.body;

  if (!email || !password || !nom || !prenom || !departement) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  // Check if user already exists
  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length) return res.status(409).json({ error: 'Cet email est déjà utilisé' });

    // Insert directly into users table (plaintext password for now, user is inactive)
    const matricule = `USER-${Date.now()}`;
    db.query(
      `INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, actif, hidden, date_creation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NOW())`,
      [matricule, nom, prenom, email, telephone || '', departement, poste || '', 'employee', password],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Cet email a déjà une demande en attente' });
          }
          return res.status(500).json({ error: err.message });
        }

        const newUserId = result.insertId;

        // 📨 CREATE NOTIFICATION FOR ADMIN
        const notificationTitle = `📝 Nouvelle demande de création de compte`;
        const notificationMessage = `
${prenom} ${nom} a demandé la création d'un compte.

Email: ${email}
Département: ${departement}
Poste: ${poste || 'Non spécifié'}
Téléphone: ${telephone || 'Non spécifié'}

Action requise: Veuillez approuver ou rejeter cette demande dans le dashboard admin.
`;

        db.query(
          `INSERT INTO notifications (type, title, message, data, created_at)
           VALUES ('new_user_request', ?, ?, ?, NOW())`,
          [
            notificationTitle,
            notificationMessage,
            JSON.stringify({
              userId: newUserId,
              email: email,
              nom: nom,
              prenom: prenom,
              departement: departement,
              poste: poste,
              telephone: telephone,
              type: 'new_user_request'
            })
          ],
          (notifErr) => {
            if (notifErr) {
              console.warn('⚠️ Notification creation failed:', notifErr.message);
              // Don't fail registration if notification fails
            } else {
              console.log('✅ Notification created for new user request');
            }
          }
        );

        res.status(201).json({
          success: true,
          message: 'Compte créé avec succès!\n\nVotre demande a été enregistrée et est en attente de validation par l\'administration.\n\nUn administrateur a reçu une notification et examinera votre demande bientôt.',
          user: { id: newUserId, email, nom, prenom, departement, status: 'pending' }
        });
      }
    );
  });
});

// ============ USER MANAGEMENT (ADMIN) ============

// List all users
app.get('/api/auth/users', verifyToken, requireRole(ROLE_ADMIN, ROLE_DIRECTOR, ROLE_SECRETAIRE), (req, res) => {
  db.query('SELECT id, nom, prenom, email, departement, role, actif, hidden FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (req.user.role === ROLE_DIRECTOR) {
      res.json(results.filter(user => !user.hidden));
    } else {
      res.json(results);
    }
  });
});

// List pending users (users with actif = 0)
app.get('/api/auth/pending-users', verifyToken, requireRole(ROLE_ADMIN, ROLE_SECRETAIRE), (req, res) => {
  db.query(
    `SELECT id, email, nom, prenom, telephone, poste, departement, date_creation as requested_at
     FROM users
     WHERE actif = 0 AND hidden = 0
     ORDER BY date_creation DESC`,
    (err, users) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(200).json({
        success: true,
        count: users.length,
        users
      });
    }
  );
});

// Create user directly (admin/secretaire)
app.post('/api/auth/users', verifyToken, requireRole(ROLE_ADMIN, ROLE_SECRETAIRE), (req, res) => {
  const { nom, prenom, email, telephone, departement, poste, role, password } = req.body;
  if (!email || !password || !nom || !prenom || !departement || !role) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length) return res.status(409).json({ error: 'Utilisateur déjà existant' });

    db.query(
      'INSERT INTO users (nom, prenom, email, telephone, departement, poste, role, password_hash, actif, hidden, date_creation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW())',
      [nom, prenom, email, telephone || '', departement, poste || '', role, password],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({
          success: true,
          user: { id: result.insertId, nom, prenom, email, departement, role }
        });
      }
    );
  });
});

// Approve user (activate and hash password)
app.patch('/api/auth/users/:id/approve', verifyToken, requireRole(ROLE_ADMIN, ROLE_SECRETAIRE), async (req, res) => {
  const userId = parseInt(req.params.id);

  db.query('SELECT * FROM users WHERE id = ?', [userId], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results.length) return res.status(404).json({ error: 'User not found' });

    const user = results[0];
    const plainPassword = user.password_hash;

    // Hash the password
    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(plainPassword, salt);

      db.query(
        'UPDATE users SET password_hash = ?, actif = 1 WHERE id = ?',
        [hashedPassword, userId],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });

          res.status(200).json({
            success: true,
            message: 'Utilisateur approuvé avec succès',
            user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom }
          });
        }
      );
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
});

// Reject user (delete from users)
app.patch('/api/auth/users/:id/reject', verifyToken, requireRole(ROLE_ADMIN, ROLE_SECRETAIRE), (req, res) => {
  const userId = parseInt(req.params.id);
  const { reason } = req.body;

  db.query('DELETE FROM users WHERE id = ? AND actif = 0', [userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({
      success: true,
      message: 'Demande rejetée'
    });
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

// Delete user permanently
app.delete('/api/auth/users/:id', verifyToken, requireRole(ROLE_ADMIN), (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Utilisateur supprimé définitivement.' });
  });
});

// Activate/deactivate user
app.patch('/api/auth/users/:id/activate', verifyToken, requireRole(ROLE_ADMIN, ROLE_SECRETAIRE), (req, res) => {
  const { id } = req.params;
  const { actif } = req.body;
  db.query('UPDATE users SET actif = ? WHERE id = ?', [actif ? 1 : 0, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: actif ? 'Utilisateur activé.' : 'Utilisateur désactivé.' });
  });
});

// ============ NOTIFICATIONS ============

// Get notifications for admin
app.get('/api/auth/notifications', verifyToken, requireRole(ROLE_ADMIN, ROLE_SECRETAIRE), (req, res) => {
  db.query(
    `SELECT id, type, title, message, data, created_at, is_read
     FROM notifications
     WHERE type = 'new_user_request'
     ORDER BY created_at DESC
     LIMIT 50`,
    (err, notifications) => {
      if (err) {
        console.warn('⚠️ Notifications query failed:', err.message);
        return res.status(200).json({ success: true, notifications: [] });
      }

      // Parse JSON data for each notification
      const parsed = (notifications || []).map(notif => ({
        ...notif,
        data: notif.data ? JSON.parse(notif.data) : {}
      }));

      res.json({
        success: true,
        count: parsed.length,
        notifications: parsed
      });
    }
  );
});

// Mark notification as read
app.patch('/api/auth/notifications/:id/read', verifyToken, requireRole(ROLE_ADMIN, ROLE_SECRETAIRE), (req, res) => {
  const notifId = parseInt(req.params.id);

  db.query(
    'UPDATE notifications SET is_read = 1 WHERE id = ?',
    [notifId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Notification marked as read' });
    }
  );
});

// Get pending users with notification details
app.get('/api/auth/pending-users-with-notifications', verifyToken, requireRole(ROLE_ADMIN, ROLE_SECRETAIRE), (req, res) => {
  db.query(
    `SELECT
      u.id,
      u.email,
      u.nom,
      u.prenom,
      u.telephone,
      u.poste,
      u.departement,
      u.date_creation as requested_at,
      n.id as notification_id,
      n.created_at as notified_at
     FROM users u
     LEFT JOIN notifications n ON n.data LIKE CONCAT('%', u.id, '%') AND n.type = 'new_user_request'
     WHERE u.actif = 0 AND u.hidden = 0
     ORDER BY u.date_creation DESC`,
    (err, users) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(200).json({
        success: true,
        count: users.length,
        users: users.map(user => ({
          ...user,
          has_notification: !!user.notification_id
        }))
      });
    }
  );
});

// ============ PASSWORD MANAGEMENT ============

// Change password
app.post('/api/auth/change-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password required' });
  }

  db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results.length) return res.status(404).json({ error: 'User not found' });

    const user = results[0];
    let validPassword = false;

    if (user.password_hash.startsWith('$2')) {
      validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    } else {
      validPassword = currentPassword === user.password_hash;
    }

    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    db.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, req.user.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Password changed successfully' });
      }
    );
  });
});

// Get user profile
app.get('/api/auth/me', verifyToken, (req, res) => {
  db.query('SELECT id, email, role, departement, nom, prenom FROM users WHERE id = ?', [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results.length) return res.status(404).json({ error: 'User not found' });
    res.json(results[0]);
  });
});

// Update user profile
app.patch('/api/auth/me', verifyToken, (req, res) => {
  const { telephone, langue } = req.body;
  let updates = [];
  let values = [];

  if (telephone !== undefined) {
    updates.push('telephone = ?');
    values.push(telephone);
  }
  if (langue !== undefined) {
    updates.push('langue = ?');
    values.push(langue);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(req.user.id);
  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Profil mis à jour' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Auth service running on port ${PORT}`);
});
