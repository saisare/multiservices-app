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
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'multiservices'
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
// ROUTES CLIENTS (IMMIGRATION)
// ===========================================

// GET tous les clients
app.get('/api/clients', verifyToken, (req, res) => {
    db.query('SELECT * FROM clients ORDER BY date_creation DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET un client par ID
app.get('/api/clients/:id', verifyToken, (req, res) => {
    db.query('SELECT * FROM clients WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Client non trouvé' });
        res.json(results[0]);
    });
});

// POST créer un client
app.post('/api/clients', verifyToken, (req, res) => {
    const { type_client, nom, prenom, date_naissance, nationalite, passport_number, passport_expiration, email, telephone, adresse } = req.body;
    
    // Générer code_client
    const code_client = `CLT-${Date.now().toString().slice(-6)}`;
    
    const sql = `INSERT INTO clients 
                 (code_client, type_client, nom, prenom, date_naissance, nationalite, passport_number, passport_expiration, email, telephone, adresse) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [code_client, type_client, nom, prenom, date_naissance, nationalite, passport_number, passport_expiration, email, telephone, adresse],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                code_client,
                message: 'Client créé avec succès'
            });
        }
    );
});

// PUT modifier un client
app.put('/api/clients/:id', verifyToken, (req, res) => {
    const { type_client, nom, prenom, date_naissance, nationalite, passport_number, passport_expiration, email, telephone, adresse } = req.body;
    
    const sql = `UPDATE clients 
                 SET type_client = ?, nom = ?, prenom = ?, date_naissance = ?, 
                     nationalite = ?, passport_number = ?, passport_expiration = ?,
                     email = ?, telephone = ?, adresse = ?
                 WHERE id = ?`;
    
    db.query(sql, [type_client, nom, prenom, date_naissance, nationalite, passport_number, passport_expiration, email, telephone, adresse, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Client non trouvé' });
            res.json({ 
                success: true, 
                message: 'Client modifié avec succès' 
            });
        }
    );
});

// DELETE supprimer un client
app.delete('/api/clients/:id', verifyToken, (req, res) => {
    db.query('DELETE FROM clients WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Client non trouvé' });
        res.json({ 
            success: true, 
            message: 'Client supprimé avec succès' 
        });
    });
});

// ===========================================
// ROUTES DOSSIERS IMMIGRATION
// ===========================================

// GET tous les dossiers
app.get('/api/dossiers', verifyToken, (req, res) => {
    const sql = `
        SELECT d.*, c.nom as client_nom, c.prenom as client_prenom, c.passport_number
        FROM dossiers_immigration d
        JOIN clients c ON d.client_id = c.id
        ORDER BY d.date_depot DESC
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
               c.nom as client_nom, c.prenom as client_prenom, c.passport_number,
               con.nom as consultant_nom, con.prenom as consultant_prenom,
               doc.id as doc_id, doc.type_document, doc.nom_fichier, doc.verifie
        FROM dossiers_immigration d
        JOIN clients c ON d.client_id = c.id
        LEFT JOIN consultants con ON d.consultant_id = con.id
        LEFT JOIN documents doc ON d.id = doc.dossier_id
        WHERE d.id = ?
    `;
    
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Dossier non trouvé' });
        
        const dossier = {
            ...results[0],
            documents: []
        };
        
        const docsVus = new Set();
        results.forEach(row => {
            if (row.doc_id && !docsVus.has(row.doc_id)) {
                docsVus.add(row.doc_id);
                dossier.documents.push({
                    id: row.doc_id,
                    type: row.type_document,
                    nom: row.nom_fichier,
                    verifie: row.verifie
                });
            }
        });
        
        delete dossier.doc_id;
        delete dossier.type_document;
        delete dossier.nom_fichier;
        delete dossier.verifie;
        
        res.json(dossier);
    });
});

// POST nouveau dossier
app.post('/api/dossiers', verifyToken, (req, res) => {
    const { client_id, type_demande, date_depot, ambassade, consultant_id, notes } = req.body;
    
    const numero = `DOS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    
    const sql = `INSERT INTO dossiers_immigration 
                 (numero_dossier, client_id, type_demande, date_depot, ambassade, consultant_id, notes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [numero, client_id, type_demande, date_depot, ambassade, consultant_id, notes],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ 
                id: result.insertId, 
                numero,
                message: 'Dossier créé avec succès' 
            });
        }
    );
});

// PUT mettre à jour dossier
app.put('/api/dossiers/:id', verifyToken, (req, res) => {
    const { type_demande, date_depot, date_decision, statut, ambassade, numero_dossier_officiel, consultant_id, notes } = req.body;
    
    const sql = `UPDATE dossiers_immigration 
                 SET type_demande = ?, date_depot = ?, date_decision = ?, 
                     statut = ?, ambassade = ?, numero_dossier_officiel = ?,
                     consultant_id = ?, notes = ?
                 WHERE id = ?`;
    
    db.query(sql, [type_demande, date_depot, date_decision, statut, ambassade, numero_dossier_officiel, consultant_id, notes, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Dossier non trouvé' });
            res.json({ success: true, message: 'Dossier mis à jour avec succès' });
        }
    );
});

// ===========================================
// ROUTES CONSULTANTS
// ===========================================

app.get('/api/consultants', verifyToken, (req, res) => {
    db.query('SELECT * FROM consultants WHERE actif = 1', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ===========================================
// ROUTES DESTINATIONS
// ===========================================

app.get('/api/destinations', verifyToken, (req, res) => {
    db.query('SELECT * FROM destinations ORDER BY pays, ville', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ===========================================
// ROUTES RESERVATIONS
// ===========================================

app.get('/api/reservations', verifyToken, (req, res) => {
    const sql = `
        SELECT r.*, c.nom as client_nom, c.prenom as client_prenom, dest.pays, dest.ville
        FROM reservations r
        JOIN clients c ON r.client_id = c.id
        JOIN destinations dest ON r.destination_id = dest.id
        ORDER BY r.date_depart DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ===========================================
// DÉMARRAGE
// ===========================================
app.listen(PORT, () => {
    console.log(`\n🚀 SERVICE IMMIGRATION DÉMARRÉ`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔍 Health: http://localhost:${PORT}/health`);
    console.log(`✅ Prêt à recevoir des requêtes\n`);
});