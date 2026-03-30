require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { verifyToken } = require('./middleware/auth');

console.log('verifyToken =', verifyToken ? '✅ chargé' : '❌ undefined');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Connexion MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'multiservices'
});
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('❌ Erreur connexion MySQL Assurance:', err);
        return;
    }
    console.log(`✅ Connecté à MySQL ${process.env.DB_NAME}`);
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        service: process.env.SERVICE_NAME || 'assurance', 
        status: 'OK',
        time: new Date().toISOString()
    });
});

// ===========================================
// ROUTES ASSURES
// ===========================================

// GET tous les assurés
app.get('/api/assures', verifyToken, (req, res) => {
    db.query('SELECT * FROM assures ORDER BY date_creation DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET un assuré par ID
app.get('/api/assures/:id', verifyToken, (req, res) => {
    db.query('SELECT * FROM assures WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Assuré non trouvé' });
        res.json(results[0]);
    });
});

// POST créer un assuré
app.post('/api/assures', verifyToken, (req, res) => {
    const { type_assure, nom, prenom, entreprise, date_naissance, email, telephone, adresse } = req.body;
    
    if (!type_assure || !nom) {
        return res.status(400).json({ error: 'type_assure et nom sont requis' });
    }
    
    const code_assure = `ASS-${Date.now().toString().slice(-6)}`;
    
    const sql = `INSERT INTO assures 
                 (code_assure, type_assure, nom, prenom, entreprise, date_naissance, email, telephone, adresse) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [code_assure, type_assure, nom, prenom, entreprise, date_naissance, email, telephone, adresse],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                code_assure,
                message: 'Assuré créé avec succès'
            });
        }
    );
});

// ===========================================
// ROUTES POLICES D'ASSURANCE
// ===========================================

// GET toutes les polices
app.get('/api/polices', verifyToken, (req, res) => {
    const sql = `
        SELECT p.*, a.nom as assure_nom, a.prenom as assure_prenom
        FROM polices_assurance p
        JOIN assures a ON p.assure_id = a.id
        ORDER BY p.date_effet DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET une police par ID
app.get('/api/polices/:id', verifyToken, (req, res) => {
    const sql = `
        SELECT p.*, a.nom as assure_nom, a.prenom as assure_prenom
        FROM polices_assurance p
        JOIN assures a ON p.assure_id = a.id
        WHERE p.id = ?
    `;
    
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Police non trouvée' });
        res.json(results[0]);
    });
});

// POST créer une police
app.post('/api/polices', verifyToken, (req, res) => {
    const { assure_id, type_assurance, date_effet, date_echeance, prime_annuelle, franchise, plafond_remboursement, conditions } = req.body;
    
    const numero_police = `POL-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    
    const sql = `INSERT INTO polices_assurance 
                 (numero_police, assure_id, type_assurance, date_effet, date_echeance, prime_annuelle, franchise, plafond_remboursement, conditions) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [numero_police, assure_id, type_assurance, date_effet, date_echeance, prime_annuelle, franchise, plafond_remboursement, conditions],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                numero_police,
                message: 'Police créée avec succès'
            });
        }
    );
});

// ===========================================
// ROUTES SINISTRES
// ===========================================

// GET tous les sinistres
app.get('/api/sinistres', verifyToken, (req, res) => {
    const sql = `
        SELECT s.*, p.numero_police, a.nom as assure_nom, a.prenom as assure_prenom,
               e.nom as expert_nom, e.prenom as expert_prenom
        FROM sinistres s
        JOIN polices_assurance p ON s.police_id = p.id
        JOIN assures a ON p.assure_id = a.id
        LEFT JOIN experts e ON s.expert_id = e.id
        ORDER BY s.date_sinistre DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST créer un sinistre
app.post('/api/sinistres', verifyToken, (req, res) => {
    const { police_id, date_sinistre, lieu_sinistre, description, montant_estime, expert_id } = req.body;
    
    const numero_sinistre = `SIN-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    
    const sql = `INSERT INTO sinistres 
                 (numero_sinistre, police_id, date_sinistre, lieu_sinistre, description, montant_estime, expert_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [numero_sinistre, police_id, date_sinistre, lieu_sinistre, description, montant_estime, expert_id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                numero_sinistre,
                message: 'Sinistre déclaré avec succès'
            });
        }
    );
});

// ===========================================
// ROUTES EXPERTS
// ===========================================

// GET tous les experts
app.get('/api/experts', verifyToken, (req, res) => {
    db.query('SELECT * FROM experts WHERE actif = 1', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ===========================================
// DÉMARRAGE
// ===========================================
app.listen(PORT, () => {
    console.log(`\n🚀 SERVICE ${process.env.SERVICE_NAME?.toUpperCase() || 'ASSURANCE'} DÉMARRÉ`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔍 Health: http://localhost:${PORT}/health`);
    console.log(`✅ Prêt à recevoir des requêtes\n`);
});