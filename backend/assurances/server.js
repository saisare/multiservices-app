require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { verifyToken } = require('./middleware/auth');

console.log('verifyToken =', verifyToken ? 'loaded' : 'undefined');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || undefined,
    database: process.env.DB_NAME || 'assurance_db',
    charset: 'utf8mb4'
});

db.connect(err => {
    if (err) {
        console.error('Erreur connexion MySQL Assurance:', err);
        return;
    }
    console.log(`Connecte a MySQL ${process.env.DB_NAME || 'assurance_db'}`);
});

app.get('/health', (req, res) => {
    res.json({
        service: process.env.SERVICE_NAME || 'assurance',
        status: 'OK',
        time: new Date().toISOString()
    });
});

app.get('/api/assures', verifyToken, (req, res) => {
    db.query('SELECT * FROM assures ORDER BY date_creation DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/assures/:id', verifyToken, (req, res) => {
    db.query('SELECT * FROM assures WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Assure non trouve' });
        res.json(results[0]);
    });
});

app.post('/api/assures', verifyToken, (req, res) => {
    const { type_assure, nom, prenom, entreprise, date_naissance, email, telephone, adresse } = req.body;

    if (!type_assure || !nom) {
        return res.status(400).json({ error: 'type_assure et nom sont requis' });
    }

    const code_assure = `ASS-${Date.now().toString().slice(-6)}`;
    const sql = `INSERT INTO assures
                 (code_assure, type_assure, nom, prenom, entreprise, date_naissance, email, telephone, adresse)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [code_assure, type_assure, nom, prenom, entreprise, date_naissance, email, telephone, adresse], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, code_assure, message: 'Assure cree avec succes' });
    });
});

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

app.get('/api/polices/:id', verifyToken, (req, res) => {
    const sql = `
        SELECT p.*, a.nom as assure_nom, a.prenom as assure_prenom
        FROM polices_assurance p
        JOIN assures a ON p.assure_id = a.id
        WHERE p.id = ?
    `;

    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Police non trouvee' });
        res.json(results[0]);
    });
});

app.post('/api/polices', verifyToken, (req, res) => {
    const { assure_id, type_assurance, date_effet, date_echeance, prime_annuelle, franchise, plafond_remboursement, conditions } = req.body;

    const numero_police = `POL-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const sql = `INSERT INTO polices_assurance
                 (numero_police, assure_id, type_assurance, date_effet, date_echeance, prime_annuelle, franchise, plafond_remboursement, conditions)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [numero_police, assure_id, type_assurance, date_effet, date_echeance, prime_annuelle, franchise, plafond_remboursement, conditions], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, numero_police, message: 'Police creee avec succes' });
    });
});

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

app.post('/api/sinistres', verifyToken, (req, res) => {
    const { police_id, date_sinistre, lieu_sinistre, description, montant_estime, expert_id } = req.body;
    const numero_sinistre = `SIN-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const sql = `INSERT INTO sinistres
                 (numero_sinistre, police_id, date_sinistre, lieu_sinistre, description, montant_estime, expert_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [numero_sinistre, police_id, date_sinistre, lieu_sinistre, description, montant_estime, expert_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, numero_sinistre, message: 'Sinistre declare avec succes' });
    });
});

app.get('/api/experts', verifyToken, (req, res) => {
    db.query('SELECT * FROM experts WHERE actif = 1', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/contrats-assurance', verifyToken, (req, res) => {
    const sql = `
        SELECT c.*, a.code_assure, a.nom AS assure_nom, a.prenom AS assure_prenom
        FROM contrats_assurance c
        LEFT JOIN assures a ON c.assure_id = a.id
        ORDER BY c.date_creation DESC, c.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/contrats-assurance', verifyToken, (req, res) => {
    const { assure_id, type_assurance, date_effet, date_echeance, montant, statut } = req.body;

    if (!assure_id || !type_assurance || !date_effet) {
        return res.status(400).json({ error: 'assure_id, type_assurance et date_effet sont requis' });
    }

    const numero_contrat = `CTR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const sql = `INSERT INTO contrats_assurance
                 (numero_contrat, assure_id, type_assurance, date_effet, date_echeance, montant, statut)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(
        sql,
        [numero_contrat, assure_id, type_assurance, date_effet, date_echeance || null, montant || null, statut || 'ACTIF'],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: result.insertId, numero_contrat, message: 'Contrat créé avec succès' });
        }
    );
});

app.get('/api/reglements', verifyToken, (req, res) => {
    const sql = `
        SELECT r.*, s.numero_sinistre, p.numero_police,
               a.nom AS assure_nom, a.prenom AS assure_prenom
        FROM reglements r
        JOIN sinistres s ON r.sinistre_id = s.id
        JOIN polices_assurance p ON s.police_id = p.id
        JOIN assures a ON p.assure_id = a.id
        ORDER BY r.date_creation DESC, r.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/reglements', verifyToken, (req, res) => {
    const { sinistre_id, montant, date_reglement, mode_reglement, reference, beneficiaire, notes } = req.body;

    if (!sinistre_id || !montant || !date_reglement || !mode_reglement) {
        return res.status(400).json({ error: 'sinistre_id, montant, date_reglement et mode_reglement sont requis' });
    }

    const sql = `INSERT INTO reglements
                 (sinistre_id, montant, date_reglement, mode_reglement, reference, beneficiaire, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(
        sql,
        [sinistre_id, montant, date_reglement, mode_reglement, reference || null, beneficiaire || null, notes || null],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: result.insertId, message: 'Règlement enregistré avec succès' });
        }
    );
});

app.get('/api/stats', verifyToken, (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM assures) AS total_assures,
            (SELECT COUNT(*) FROM polices_assurance) AS total_polices,
            (SELECT COUNT(*) FROM sinistres) AS total_sinistres,
            (SELECT COUNT(*) FROM experts WHERE actif = 1) AS total_experts,
            (SELECT COUNT(*) FROM contrats_assurance) AS total_contrats,
            (SELECT COUNT(*) FROM reglements) AS total_reglements,
            (SELECT COALESCE(SUM(montant), 0) FROM reglements) AS montant_regle
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0] || {});
    });
});

app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
    console.log(`Service assurance demarre sur http://localhost:${PORT}`);
});
