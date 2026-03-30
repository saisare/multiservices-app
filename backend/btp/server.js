require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { verifyToken } = require('./middleware/auth');

console.log('verifyToken =', verifyToken ? '✅ chargé' : '❌ undefined');

const app = express();
const PORT = process.env.PORT || 3003;

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
        console.error('❌ Erreur connexion MySQL BTP:', err);
        return;
    }
    console.log(`✅ Connecté à MySQL ${process.env.DB_NAME}`);
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        service: process.env.SERVICE_NAME || 'btp', 
        status: 'OK',
        time: new Date().toISOString()
    });
});

// ===========================================
// ROUTES CHANTIERS
// ===========================================

// GET tous les chantiers
app.get('/api/chantiers', verifyToken, (req, res) => {
    db.query('SELECT * FROM chantiers ORDER BY date_creation DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET un chantier par ID
app.get('/api/chantiers/:id', verifyToken, (req, res) => {
    db.query('SELECT * FROM chantiers WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Chantier non trouvé' });
        res.json(results[0]);
    });
});

// POST créer un chantier
app.post('/api/chantiers', verifyToken, (req, res) => {
    const { code_chantier, nom, adresse, date_debut, date_fin_prevue, statut, budget } = req.body;
    
    if (!code_chantier || !nom) {
        return res.status(400).json({ error: 'code_chantier et nom sont requis' });
    }
    
    const sql = `INSERT INTO chantiers 
                 (code_chantier, nom, adresse, date_debut, date_fin_prevue, statut, budget) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [code_chantier, nom, adresse, date_debut, date_fin_prevue, statut || 'EN_COURS', budget],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                code_chantier,
                message: 'Chantier créé avec succès'
            });
        }
    );
});

// PUT modifier un chantier
app.put('/api/chantiers/:id', verifyToken, (req, res) => {
    const { nom, adresse, date_debut, date_fin_prevue, date_fin_reelle, statut, budget } = req.body;
    
    const sql = `UPDATE chantiers 
                 SET nom = ?, adresse = ?, date_debut = ?, date_fin_prevue = ?, 
                     date_fin_reelle = ?, statut = ?, budget = ?
                 WHERE id = ?`;
    
    db.query(sql, [nom, adresse, date_debut, date_fin_prevue, date_fin_reelle, statut, budget, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Chantier non trouvé' });
            res.json({ success: true, message: 'Chantier modifié avec succès' });
        }
    );
});

// ===========================================
// ROUTES MATERIAUX
// ===========================================

// GET tous les matériaux
app.get('/api/materiaux', verifyToken, (req, res) => {
    db.query('SELECT * FROM materiaux ORDER BY nom', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET un matériau par ID
app.get('/api/materiaux/:id', verifyToken, (req, res) => {
    db.query('SELECT * FROM materiaux WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Matériau non trouvé' });
        res.json(results[0]);
    });
});

// POST créer un matériau
app.post('/api/materiaux', verifyToken, (req, res) => {
    const { code_materiau, nom, categorie, fournisseur, quantite, prix_unitaire, unite, seuil_alerte, localisation } = req.body;
    
    const sql = `INSERT INTO materiaux 
                 (code_materiau, nom, categorie, fournisseur, quantite, prix_unitaire, unite, seuil_alerte, localisation) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [code_materiau, nom, categorie, fournisseur, quantite || 0, prix_unitaire, unite, seuil_alerte || 10, localisation],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                code_materiau,
                message: 'Matériau créé avec succès'
            });
        }
    );
});

// PUT modifier quantité
app.put('/api/materiaux/:id/stock', verifyToken, (req, res) => {
    const { quantite } = req.body;
    
    db.query('UPDATE materiaux SET quantite = ? WHERE id = ?', [quantite, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Stock mis à jour' });
        }
    );
});

// ===========================================
// ROUTES OUVRIERS
// ===========================================

// GET tous les ouvriers
app.get('/api/ouvriers', verifyToken, (req, res) => {
    db.query('SELECT * FROM ouvriers WHERE actif = 1 ORDER BY nom', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST créer un ouvrier
app.post('/api/ouvriers', verifyToken, (req, res) => {
    const { matricule, nom, prenom, metier, telephone, email, date_embauche, salaire_journalier } = req.body;
    
    const sql = `INSERT INTO ouvriers 
                 (matricule, nom, prenom, metier, telephone, email, date_embauche, salaire_journalier) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [matricule, nom, prenom, metier, telephone, email, date_embauche, salaire_journalier],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                matricule,
                message: 'Ouvrier créé avec succès'
            });
        }
    );
});

// ===========================================
// ROUTES TACHES CHANTIER
// ===========================================

// GET toutes les tâches d'un chantier
app.get('/api/chantiers/:id/taches', verifyToken, (req, res) => {
    const sql = `
        SELECT t.*, o.nom as ouvrier_nom, o.prenom as ouvrier_prenom
        FROM taches_chantier t
        LEFT JOIN ouvriers o ON t.ouvrier_id = o.id
        WHERE t.chantier_id = ?
        ORDER BY t.date_debut
    `;
    
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST créer une tâche
app.post('/api/taches', verifyToken, (req, res) => {
    const { chantier_id, ouvrier_id, description, date_debut, date_fin, priorite } = req.body;
    
    const sql = `INSERT INTO taches_chantier 
                 (chantier_id, ouvrier_id, description, date_debut, date_fin, priorite) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [chantier_id, ouvrier_id, description, date_debut, date_fin, priorite || 'NORMALE'],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                message: 'Tâche créée avec succès'
            });
        }
    );
});

// PUT mettre à jour statut tâche
app.put('/api/taches/:id/statut', verifyToken, (req, res) => {
    const { statut } = req.body;
    
    db.query('UPDATE taches_chantier SET statut = ? WHERE id = ?', [statut, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Statut mis à jour' });
        }
    );
});

// ===========================================
// ROUTES COMMANDES BTP
// ===========================================

// GET toutes les commandes
app.get('/api/commandes-btp', verifyToken, (req, res) => {
    const sql = `
        SELECT c.*, COUNT(l.id) as nb_lignes
        FROM commandes_btp c
        LEFT JOIN lignes_commande_btp l ON c.id = l.commande_id
        GROUP BY c.id
        ORDER BY c.date_commande DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST créer une commande
app.post('/api/commandes-btp', verifyToken, (req, res) => {
    const { fournisseur, date_livraison_prevue, notes } = req.body;
    
    const numero = `CMD-BTP-${Date.now().toString().slice(-6)}`;
    
    const sql = `INSERT INTO commandes_btp 
                 (numero_commande, fournisseur, date_livraison_prevue, notes) 
                 VALUES (?, ?, ?, ?)`;
    
    db.query(sql, [numero, fournisseur, date_livraison_prevue, notes],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                numero_commande: numero,
                message: 'Commande créée avec succès'
            });
        }
    );
});

// ===========================================
// ROUTES FACTURES BTP
// ===========================================

// GET toutes les factures
app.get('/api/factures-btp', verifyToken, (req, res) => {
    const sql = `
        SELECT f.*, c.nom as chantier_nom
        FROM factures_btp f
        JOIN chantiers c ON f.chantier_id = c.id
        ORDER BY f.date_emission DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST créer une facture
app.post('/api/factures-btp', verifyToken, (req, res) => {
    const { chantier_id, client_nom, montant_ht, tva, date_echeance } = req.body;
    
    const numero = `FAC-BTP-${Date.now().toString().slice(-6)}`;
    const montant_ttc = montant_ht + (tva || montant_ht * 0.2);
    
    const sql = `INSERT INTO factures_btp 
                 (numero_facture, chantier_id, client_nom, montant_ht, tva, montant_ttc, date_echeance) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [numero, chantier_id, client_nom, montant_ht, tva || 0, montant_ttc, date_echeance],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                numero_facture: numero,
                message: 'Facture créée avec succès'
            });
        }
    );
});

// ===========================================
// STATISTIQUES
// ===========================================
app.get('/api/stats', verifyToken, (req, res) => {
    const stats = {};
    
    db.query('SELECT COUNT(*) as total FROM chantiers', (err, result) => {
        stats.chantiers = result[0].total;
        
        db.query('SELECT COUNT(*) as total FROM ouvriers WHERE actif = 1', (err, result) => {
            stats.ouvriers = result[0].total;
            
            db.query('SELECT SUM(quantite * prix_unitaire) as valeur FROM materiaux', (err, result) => {
                stats.valeur_stock = result[0].valeur || 0;
                
                db.query("SELECT COUNT(*) as total FROM chantiers WHERE statut = 'EN_COURS'", (err, result) => {
                    stats.chantiers_en_cours = result[0].total;
                    res.json(stats);
                });
            });
        });
    });
});

// ===========================================
// DÉMARRAGE
// ===========================================
app.listen(PORT, () => {
    console.log(`\n🚀 SERVICE BTP DÉMARRÉ`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔍 Health: http://localhost:${PORT}/health`);
    console.log(`✅ Prêt à recevoir des requêtes\n`);
});