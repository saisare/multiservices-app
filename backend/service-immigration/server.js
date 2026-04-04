require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { verifyToken } = require('./middleware/auth');

console.log('verifyToken =', verifyToken ? '✅ chargé' : '❌ undefined');

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());

// Connexion MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || undefined,
    database: process.env.DB_NAME || 'immigration_db',
    charset: 'utf8mb4'
});

db.connect(err => {
    if (err) {
        console.error('❌ Erreur connexion MySQL Immigration:', err);
        return;
    }
    console.log('✅ Connecté à MySQL Immigration');
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        service: 'immigration',
        status: 'OK',
        time: new Date().toISOString()
    });
});

// ===========================================
// ROUTES DEMANDEURS (TABLE: demandeurs)
// ===========================================

// GET tous les demandeurs
app.get('/api/demandeurs', verifyToken, (req, res) => {
    db.query('SELECT * FROM demandeurs WHERE actif = 1 ORDER BY date_creation DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET un demandeur par ID
app.get('/api/demandeurs/:id', verifyToken, (req, res) => {
    db.query('SELECT * FROM demandeurs WHERE id = ? AND actif = 1', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Demandeur non trouvé' });
        res.json(results[0]);
    });
});

// POST créer un demandeur
app.post('/api/demandeurs', verifyToken, (req, res) => {
    const { nom, prenom, date_naissance, nationalite, numero_passeport, date_expiration_passeport, email, telephone, adresse } = req.body;

    if (!nom || !prenom || !email) {
        return res.status(400).json({ error: 'Champs obligatoires: nom, prenom, email' });
    }

    const code_demandeur = `DMD-${Date.now().toString().slice(-6)}`;

    const sql = `INSERT INTO demandeurs
                 (code_demandeur, nom, prenom, date_naissance, nationalite, numero_passeport, date_expiration_passeport, email, telephone, adresse, actif)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`;

    db.query(sql, [code_demandeur, nom, prenom, date_naissance || null, nationalite || null, numero_passeport || null, date_expiration_passeport || null, email, telephone || null, adresse || null],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                code_demandeur,
                message: 'Demandeur créé avec succès'
            });
        }
    );
});

// PUT modifier un demandeur
app.put('/api/demandeurs/:id', verifyToken, (req, res) => {
    const { nom, prenom, date_naissance, nationalite, numero_passeport, date_expiration_passeport, email, telephone, adresse } = req.body;

    const sql = `UPDATE demandeurs
                 SET nom = ?, prenom = ?, date_naissance = ?, nationalite = ?,
                     numero_passeport = ?, date_expiration_passeport = ?,
                     email = ?, telephone = ?, adresse = ?
                 WHERE id = ?`;

    db.query(sql, [nom, prenom, date_naissance || null, nationalite || null, numero_passeport || null, date_expiration_passeport || null, email, telephone || null, adresse || null, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Demandeur non trouvé' });
            res.json({ success: true, message: 'Demandeur modifié avec succès' });
        }
    );
});

// DELETE (soft delete) supprimer un demandeur
app.delete('/api/demandeurs/:id', verifyToken, (req, res) => {
    db.query('UPDATE demandeurs SET actif = 0 WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Demandeur non trouvé' });
        res.json({ success: true, message: 'Demandeur supprimé (archivé) avec succès' });
    });
});

// ===========================================
// ROUTES TYPES DE DEMANDES (TABLE: types_demandes)
// ===========================================

// GET tous les types de demandes
app.get('/api/types-demandes', verifyToken, (req, res) => {
    db.query('SELECT * FROM types_demandes ORDER BY nom', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ===========================================
// ROUTES DOSSIERS (TABLE: dossiers)
// ===========================================

// GET tous les dossiers
app.get('/api/dossiers', verifyToken, (req, res) => {
    const sql = `
        SELECT d.*,
               dem.nom as demandeur_nom,
               dem.prenom as demandeur_prenom,
               dem.numero_passeport,
               dem.email as demandeur_email,
               td.nom as type_demande_nom
        FROM dossiers d
        JOIN demandeurs dem ON d.demandeur_id = dem.id
        JOIN types_demandes td ON d.type_demande_id = td.id
        ORDER BY d.date_creation DESC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET un dossier avec ses documents
app.get('/api/dossiers/:id', verifyToken, (req, res) => {
    const sql = `
        SELECT d.*,
               dem.nom as demandeur_nom,
               dem.prenom as demandeur_prenom,
               dem.numero_passeport,
               dem.email as demandeur_email,
               td.nom as type_demande_nom,
               td.duree_traitement_jours,
               td.prix,
               doc.id as doc_id,
               doc.nom_document,
               ds.id as doc_soumis_id,
               ds.nom_fichier,
               ds.statut as doc_statut,
               ds.date_soumission,
               ds.motif_rejet
        FROM dossiers d
        JOIN demandeurs dem ON d.demandeur_id = dem.id
        JOIN types_demandes td ON d.type_demande_id = td.id
        LEFT JOIN documents_soumis ds ON d.id = ds.dossier_id
        LEFT JOIN documents_requis doc ON ds.document_requis_id = doc.id
        WHERE d.id = ?
    `;

    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Dossier non trouvé' });

        const dossier = {
            id: results[0].id,
            numero_dossier: results[0].numero_dossier,
            demandeur_id: results[0].demandeur_id,
            demandeur_nom: results[0].demandeur_nom,
            demandeur_prenom: results[0].demandeur_prenom,
            demandeur_email: results[0].demandeur_email,
            type_demande_id: results[0].type_demande_id,
            type_demande_nom: results[0].type_demande_nom,
            pays_destination: results[0].pays_destination,
            type_visa: results[0].type_visa,
            date_depot: results[0].date_depot,
            statut: results[0].statut,
            motif_rejet: results[0].motif_rejet,
            visa_numero: results[0].visa_numero,
            date_visa: results[0].date_visa,
            date_expiration_visa: results[0].date_expiration_visa,
            notes: results[0].notes,
            documents: []
        };

        const docsVus = new Set();
        results.forEach(row => {
            if (row.doc_soumis_id && !docsVus.has(row.doc_soumis_id)) {
                docsVus.add(row.doc_soumis_id);
                dossier.documents.push({
                    id: row.doc_soumis_id,
                    nom_document: row.nom_document,
                    nom_fichier: row.nom_fichier,
                    statut: row.doc_statut,
                    date_soumission: row.date_soumission,
                    motif_rejet: row.motif_rejet
                });
            }
        });

        res.json(dossier);
    });
});

// POST créer un dossier
app.post('/api/dossiers', verifyToken, (req, res) => {
    const { demandeur_id, type_demande_id, pays_destination, type_visa, notes } = req.body;

    if (!demandeur_id || !type_demande_id) {
        return res.status(400).json({ error: 'Champs obligatoires: demandeur_id, type_demande_id' });
    }

    const numero_dossier = `DOS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const sql = `INSERT INTO dossiers
                 (numero_dossier, demandeur_id, type_demande_id, pays_destination, type_visa, date_depot, notes, statut, date_derniere_actualisation)
                 VALUES (?, ?, ?, ?, ?, CURDATE(), ?, 'CREATION', NOW())`;

    db.query(sql, [numero_dossier, demandeur_id, type_demande_id, pays_destination || null, type_visa || null, notes || null],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                numero_dossier,
                message: 'Dossier créé avec succès'
            });
        }
    );
});

// PUT mettre à jour dossier
app.put('/api/dossiers/:id', verifyToken, (req, res) => {
    const { pays_destination, type_visa, statut, motif_rejet, visa_numero, date_visa, date_expiration_visa, notes } = req.body;

    const sql = `UPDATE dossiers
                 SET pays_destination = ?,
                     type_visa = ?,
                     statut = ?,
                     motif_rejet = ?,
                     visa_numero = ?,
                     date_visa = ?,
                     date_expiration_visa = ?,
                     notes = ?,
                     date_derniere_actualisation = NOW()
                 WHERE id = ?`;

    db.query(sql, [pays_destination || null, type_visa || null, statut || 'CREATION', motif_rejet || null, visa_numero || null, date_visa || null, date_expiration_visa || null, notes || null, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Dossier non trouvé' });
            res.json({ success: true, message: 'Dossier mis à jour avec succès' });
        }
    );
});

// DELETE (soft) - marquer dossier comme annulé
app.delete('/api/dossiers/:id', verifyToken, (req, res) => {
    db.query('UPDATE dossiers SET statut = "ANNULE", date_derniere_actualisation = NOW() WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Dossier non trouvé' });
        res.json({ success: true, message: 'Dossier annulé avec succès' });
    });
});

// ===========================================
// ROUTES RENDEZ-VOUS (TABLE: rendez_vous)
// ===========================================

// GET rendez-vous d'un dossier
app.get('/api/dossiers/:dossier_id/rendez-vous', verifyToken, (req, res) => {
    db.query('SELECT * FROM rendez_vous WHERE dossier_id = ? ORDER BY date_rdv DESC',
        [req.params.dossier_id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

// POST créer un rendez-vous
app.post('/api/rendez-vous', verifyToken, (req, res) => {
    const { dossier_id, type_rdv, date_rdv, lieu, agent_nom, notes_rdv } = req.body;

    if (!dossier_id || !date_rdv) {
        return res.status(400).json({ error: 'Champs obligatoires: dossier_id, date_rdv' });
    }

    const numero_rdv = `RDV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const sql = `INSERT INTO rendez_vous
                 (numero_rdv, dossier_id, type_rdv, date_rdv, lieu, agent_nom, notes_rdv, statut)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'PROGRAMME')`;

    db.query(sql, [numero_rdv, dossier_id, type_rdv || 'CONSULTATION', date_rdv, lieu || null, agent_nom || null, notes_rdv || null],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                numero_rdv,
                message: 'Rendez-vous créé avec succès'
            });
        }
    );
});

// PUT mettre à jour rendez-vous
app.put('/api/rendez-vous/:id', verifyToken, (req, res) => {
    const { type_rdv, date_rdv, lieu, statut, agent_nom, notes_rdv } = req.body;

    const sql = `UPDATE rendez_vous
                 SET type_rdv = ?, date_rdv = ?, lieu = ?, statut = ?,
                     agent_nom = ?, notes_rdv = ?
                 WHERE id = ?`;

    db.query(sql, [type_rdv || 'CONSULTATION', date_rdv, lieu || null, statut || 'PROGRAMME', agent_nom || null, notes_rdv || null, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Rendez-vous non trouvé' });
            res.json({ success: true, message: 'Rendez-vous mis à jour avec succès' });
        }
    );
});

// ===========================================
// ROUTES DEMANDES D'ASSISTANCE (TABLE: demandes_assistance)
// ===========================================

// GET toutes les demandes d'assistance d'un utilisateur
app.get('/api/demandes-assistance', verifyToken, (req, res) => {
    const user_id = req.user.id;

    db.query(`
        SELECT d.*, dem.nom as demandeur_nom, dem.prenom as demandeur_prenom
        FROM demandes_assistance d
        LEFT JOIN demandeurs dem ON d.demandeur_id = dem.id
        WHERE d.utilisateur_id = ?
        ORDER BY d.date_creation DESC
    `, [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET une demande d'assistance spécifique
app.get('/api/demandes-assistance/:id', verifyToken, (req, res) => {
    db.query(`
        SELECT d.*, dem.nom as demandeur_nom, dem.prenom as demandeur_prenom
        FROM demandes_assistance d
        LEFT JOIN demandeurs dem ON d.demandeur_id = dem.id
        WHERE d.id = ?
    `, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Demande non trouvée' });
        res.json(results[0]);
    });
});

// POST créer une demande d'assistance (MESSAGE)
app.post('/api/demandes-assistance', verifyToken, (req, res) => {
    const { demandeur_id, type, titre, message } = req.body;
    const user_id = req.user.id;

    if (!type || !titre || !message) {
        return res.status(400).json({ error: 'Champs obligatoires: type, titre, message' });
    }

    const numero_demande = `ASS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const sql = `INSERT INTO demandes_assistance
                 (numero_demande, demandeur_id, utilisateur_id, type, titre, message, statut, date_creation)
                 VALUES (?, ?, ?, ?, ?, ?, 'OUVERTE', NOW())`;

    db.query(sql, [numero_demande, demandeur_id || null, user_id, type, titre, message],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                numero_demande,
                message: 'Demande d\'assistance créée avec succès'
            });
        }
    );
});

// PUT mettre à jour une demande (RÉPONSE/COMMENTAIRE)
app.put('/api/demandes-assistance/:id', verifyToken, (req, res) => {
    const { reponse, statut } = req.body;
    const user_id = req.user.id;

    if (!reponse) {
        return res.status(400).json({ error: 'Réponse requise' });
    }

    // Vérifier que c'est l'auteur ou un admin
    db.query('SELECT utilisateur_id FROM demandes_assistance WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Demande non trouvée' });

        // Permettre à l'auteur ou aux admins de répondre
        const is_author = results[0].utilisateur_id === user_id;
        const is_admin = req.user.role === 'admin';

        if (!is_author && !is_admin) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        const sql = `UPDATE demandes_assistance
                     SET reponse = ?, statut = COALESCE(?, statut), date_statut = NOW()
                     WHERE id = ?`;

        db.query(sql, [reponse, statut || null, req.params.id],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                if (result.affectedRows === 0) return res.status(404).json({ error: 'Demande non trouvée' });
                res.json({ success: true, message: 'Demande mise à jour avec succès' });
            }
        );
    });
});

// DELETE une demande (soft delete)
app.delete('/api/demandes-assistance/:id', verifyToken, (req, res) => {
    const user_id = req.user.id;

    // Vérifier ownership
    db.query('SELECT utilisateur_id FROM demandes_assistance WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Demande non trouvée' });

        const is_author = results[0].utilisateur_id === user_id;
        const is_admin = req.user.role === 'admin';

        if (!is_author && !is_admin) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        db.query('UPDATE demandes_assistance SET statut = "FERMEE" WHERE id = ?', [req.params.id],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, message: 'Demande fermée' });
            }
        );
    });
});

// ===========================================
// DÉMARRAGE
// ===========================================
app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
    console.log(`\n🚀 SERVICE IMMIGRATION DÉMARRÉ`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`💚 Health: http://localhost:${PORT}/health`);
    console.log(`✅ Prêt à recevoir des requêtes\n`);
});
