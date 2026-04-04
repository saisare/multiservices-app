// ============================================================================
// 🔧 ENDPOINTS MANQUANTS À AJOUTER À backend/auth-service/server.js
// ============================================================================
// Insérez ce code APRÈS les endpoints existants (après la ligne ~290)
// ============================================================================

// 1. ENDPOINT: POST /api/auth/share-login (Partage de compte)
// ============================================================================
app.post('/api/auth/share-login', (req, res) => {
  const { email, password, reason, duration, sharedBy } = req.body;

  // Validation
  if (!email || !password || !reason || !duration) {
    return res.status(400).json({
      error: 'Missing required fields: email, password, reason, duration'
    });
  }

  // 1. Vérifier les credentials du propriétaire
  db.query(
    'SELECT * FROM users WHERE email = ? AND actif = 1 AND hidden = 0',
    [email],
    (err, users) => {
      if (err) return res.status(500).json({ error: err.message });
      if (users.length === 0) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      const user = users[0];
      const passwordMatch =
        user.password_hash.startsWith('$2') 
          ? require('bcryptjs').compareSync(password, user.password_hash)
          : password === user.password_hash;

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      // 2. Créer un token temporaire pour le partage
      const expiresIn = parseInt(duration) * 60; // convertir minutes en secondes
      const tempToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          departement: user.departement,
          isShared: true,
          sharedBy: email,
          originalId: user.id
        },
        process.env.JWT_SECRET || 'mon_super_secret_2026',
        { expiresIn }
      );

      // 3. Enregistrer le partage dans les notifications
      const expiresAt = new Date(Date.now() + expiresIn * 1000);
      db.query(
        `INSERT INTO notifications (type, recipient_id, sender_id, title, message, data, created_at)
         VALUES ('account_shared', ?, ?, ?, ?, ?, NOW())`,
        [
          sharedBy?.id || 0,
          user.id,
          `Compte partagé par ${user.prenom} ${user.nom}`,
          `Le compte a été partagé jusqu'à ${expiresAt.toISOString()}`,
          JSON.stringify({
            sharedBy: email,
            reason,
            duration,
            expiresAt,
            token: tempToken
          })
        ],
        (err) => {
          if (err) console.error('Notification error:', err);
        }
      );

      // 4. Retourner le token temporaire
      res.status(200).json({
        success: true,
        token: tempToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          departement: user.departement,
          nom: user.nom,
          prenom: user.prenom,
          isShared: true
        },
        expiresAt: expiresAt.toISOString()
      });
    }
  );
});

// 2. ENDPOINT: POST /api/logs/connection (Log de connexion)
// ============================================================================
app.post('/api/logs/connection', (req, res) => {
  const { userId, email, departement, success } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email requis' });
  }

  // Créer une table de logs si elle n'existe pas
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS connection_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      email VARCHAR(100),
      departement VARCHAR(100),
      success TINYINT DEFAULT 1,
      ip_address VARCHAR(45),
      user_agent VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createTableQuery, (err) => {
    if (err) console.error('Create table error:', err);

    // Insérer le log
    db.query(
      `INSERT INTO connection_logs (user_id, email, departement, success, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [userId || null, email, departement || 'unknown', success ? 1 : 0],
      (err) => {
        if (err) {
          console.error('Insert log error:', err);
          return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
          success: true,
          message: 'Connection logged'
        });
      }
    );
  });
});

// 3. ENDPOINT: POST /api/notifications/share-request (Notification de partage)
// ============================================================================
app.post('/api/notifications/share-request', (req, res) => {
  const { senderId, recipientEmail, reason, departement } = req.body;

  if (!recipientEmail || !reason) {
    return res.status(400).json({
      error: 'Missing required fields: recipientEmail, reason'
    });
  }

  // Trouver le destinataire
  db.query(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [recipientEmail],
    (err, recipients) => {
      if (err) return res.status(500).json({ error: err.message });
      if (recipients.length === 0) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      const recipientId = recipients[0].id;

      // Créer la notification
      db.query(
        `INSERT INTO notifications (type, recipient_id, sender_id, title, message, data, created_at)
         VALUES ('share_request', ?, ?, ?, ?, ?, NOW())`,
        [
          recipientId,
          senderId || null,
          'Demande de partage de compte',
          `${reason} - Département: ${departement}`,
          JSON.stringify({
            reason,
            departement,
            timestamp: new Date().toISOString()
          })
        ],
        (err) => {
          if (err) {
            console.error('Insert notification error:', err);
            return res.status(500).json({ error: err.message });
          }

          res.status(201).json({
            success: true,
            message: 'Share request notification created'
          });
        }
      );
    }
  );
});

// 4. ENDPOINT: PATCH /api/auth/users/:id/approve (Approuver un compte en attente)
// ============================================================================
app.patch('/api/auth/users/:id/approve', verifyToken, (req, res) => {
  // Vérifier que l'utilisateur a le rôle d'admin ou secretaire
  if (!['admin', 'secretaire'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  const pendingUserId = parseInt(req.params.id);

  // Récupérer le compte en attente
  db.query(
    'SELECT * FROM pending_users WHERE id = ?',
    [pendingUserId],
    (err, pending) => {
      if (err) return res.status(500).json({ error: err.message });
      if (pending.length === 0) {
        return res.status(404).json({ error: 'Pending user not found' });
      }

      const user = pending[0];

      // Créer un hash bcrypt du mot de passe
      const salt = require('bcryptjs').genSaltSync(10);
      const hashedPassword = require('bcryptjs').hashSync(user.password_hash, salt);

      // Insérer dans la table users
      db.query(
        `INSERT INTO users (matricule, nom, prenom, email, telephone, departement, poste, role, password_hash, actif, date_creation)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'employee', ?, 1, NOW())`,
        [
          `USR${pendingUserId}`,  // Auto-générer matricule
          user.nom,
          user.prenom,
          user.email,
          user.telephone || null,
          user.departement,
          user.poste || null,
          hashedPassword
        ],
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Mettre à jour pending_users
          db.query(
            `UPDATE pending_users SET status = 'approved', approved_at = NOW(), approved_by = ?
             WHERE id = ?`,
            [req.user.id, pendingUserId],
            (err) => {
              if (err) return res.status(500).json({ error: err.message });

              // Créer une notification pour l'utilisateur
              db.query(
                `INSERT INTO notifications (type, recipient_id, sender_id, title, message, created_at)
                 VALUES ('account_approved', ?, ?, 'Compte approuvé', 
                         'Votre demande de compte a été approuvée!', NOW())`,
                [result.insertId, req.user.id],
                (err) => {
                  if (err) console.error('Notification error:', err);
                }
              );

              res.status(200).json({
                success: true,
                message: 'User approved and created',
                user: {
                  id: result.insertId,
                  email: user.email,
                  nom: user.nom,
                  prenom: user.prenom,
                  departement: user.departement
                }
              });
            }
          );
        }
      );
    }
  );
});

// 5. ENDPOINT: GET /api/auth/pending-users (Lister les comptes en attente)
// ============================================================================
app.get('/api/auth/pending-users', verifyToken, (req, res) => {
  // Vérifier que l'utilisateur a le rôle d'admin ou secretaire
  if (!['admin', 'secretaire'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  db.query(
    `SELECT id, email, nom, prenom, telephone, poste, departement, status, requested_at, approved_at
     FROM pending_users
     WHERE status = 'pending'
     ORDER BY requested_at DESC`,
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

// 6. ENDPOINT: PATCH /api/auth/users/:id/reject (Rejeter un compte en attente)
// ============================================================================
app.patch('/api/auth/users/:id/reject', verifyToken, (req, res) => {
  // Vérifier que l'utilisateur a le rôle d'admin ou secretaire
  if (!['admin', 'secretaire'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  const pendingUserId = parseInt(req.params.id);
  const { reason } = req.body;

  db.query(
    `UPDATE pending_users SET status = 'rejected', approved_at = NOW(), approved_by = ?
     WHERE id = ?`,
    [req.user.id, pendingUserId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(200).json({
        success: true,
        message: 'User request rejected',
        reason: reason || 'No reason provided'
      });
    }
  );
});

// ============================================================================
// FIN DES ENDPOINTS À AJOUTER
// ============================================================================
