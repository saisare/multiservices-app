require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { verifyToken } = require('./middleware/auth');

console.log('verifyToken =', verifyToken ? '✅ chargé' : '❌ undefined');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Connexion MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'communication_db'
});

db.connect(err => {
    if (err) {
        console.error('❌ Erreur connexion MySQL Communication:', err);
        return;
    }
    console.log(`✅ Connecté à MySQL ${process.env.DB_NAME}`);
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        service: process.env.SERVICE_NAME || 'communication', 
        status: 'OK',
        time: new Date().toISOString()
    });
});

// ===========================================
// ROUTES ANNONCEURS
// ===========================================
app.get('/api/annonceurs', verifyToken, (req, res) => {
    db.query('SELECT * FROM annonceurs ORDER BY date_creation DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/annonceurs/:id', verifyToken, (req, res) => {
    db.query('SELECT * FROM annonceurs WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Annonceur non trouvé' });
        res.json(results[0]);
    });
});

app.post('/api/annonceurs', verifyToken, (req, res) => {
    const { nom_entreprise, contact_nom, contact_email, contact_telephone, adresse, secteur_activite } = req.body;
    
    const code = `ANN-${Date.now().toString().slice(-6)}`;
    
    const sql = `INSERT INTO annonceurs 
                 (code_annonceur, nom_entreprise, contact_nom, contact_email, contact_telephone, adresse, secteur_activite) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [code, nom_entreprise, contact_nom, contact_email, contact_telephone, adresse, secteur_activite],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                code,
                message: 'Annonceur créé avec succès'
            });
        }
    );
});

// ===========================================
// ROUTES CAMPAGNES
// ===========================================
app.get('/api/campagnes', verifyToken, (req, res) => {
    const sql = `
        SELECT c.*, a.nom_entreprise
        FROM campagnes c
        JOIN annonceurs a ON c.annonceur_id = a.id
        ORDER BY c.date_debut DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/campagnes/:id', verifyToken, (req, res) => {
    const sql = `
        SELECT c.*, a.nom_entreprise
        FROM campagnes c
        JOIN annonceurs a ON c.annonceur_id = a.id
        WHERE c.id = ?
    `;
    
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Campagne non trouvée' });
        res.json(results[0]);
    });
});

app.post('/api/campagnes', verifyToken, (req, res) => {
    const { annonceur_id, nom_campagne, type_campagne, objectif, budget, date_debut, date_fin } = req.body;
    
    const code = `CAMP-${Date.now().toString().slice(-6)}`;
    
    const sql = `INSERT INTO campagnes 
                 (code_campagne, annonceur_id, nom_campagne, type_campagne, objectif, budget, date_debut, date_fin) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [code, annonceur_id, nom_campagne, type_campagne, objectif, budget, date_debut, date_fin],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                code,
                message: 'Campagne créée avec succès'
            });
        }
    );
});

// ===========================================
// ROUTES PERFORMANCES
// ===========================================
app.get('/api/performances/campagne/:id', verifyToken, (req, res) => {
    db.query('SELECT * FROM performances WHERE campagne_id = ? ORDER BY date_mesure', 
        [req.params.id], 
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

app.post('/api/performances', verifyToken, (req, res) => {
    const { campagne_id, date_mesure, impressions, clics, conversions, cout, revenu } = req.body;
    
    const sql = `INSERT INTO performances 
                 (campagne_id, date_mesure, impressions, clics, conversions, cout, revenu) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [campagne_id, date_mesure, impressions, clics, conversions, cout, revenu],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                message: 'Performance enregistrée'
            });
        }
    );
});

// ===========================================
// STATISTIQUES GLOBALES
// ===========================================
app.get('/api/stats', verifyToken, (req, res) => {
    const stats = {};
    
    db.query('SELECT COUNT(*) as total FROM annonceurs', (err, result) => {
        stats.annonceurs = result[0].total;
        
        db.query('SELECT COUNT(*) as total FROM campagnes', (err, result) => {
            stats.campagnes = result[0].total;
            
            db.query('SELECT COUNT(*) as total FROM campagnes WHERE statut = "EN_COURS"', (err, result) => {
                stats.campagnes_en_cours = result[0].total;
                
                db.query('SELECT SUM(budget) as total FROM campagnes', (err, result) => {
                    stats.budget_total = result[0].total || 0;
                    
                    db.query('SELECT SUM(revenu - cout) as benefices FROM performances', (err, result) => {
                        stats.benefices = result[0].benefices || 0;
                        res.json(stats);
                    });
                });
            });
        });
    });
});

// ===========================================
// DÉMARRAGE
// ===========================================
app.listen(PORT, () => {
    console.log(`\n🚀 SERVICE COMMUNICATION DÉMARRÉ`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔍 Health: http://localhost:${PORT}/health`);
    console.log(`✅ Prêt à recevoir des requêtes\n`);
});