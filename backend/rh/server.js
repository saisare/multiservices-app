require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { verifyToken } = require('./middleware/auth');

console.log('verifyToken =', verifyToken ? 'âœ… chargÃ©' : 'âŒ undefined');

const app = express();
const PORT = process.env.PORT || 3006;

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
        console.error('âŒ Erreur connexion MySQL RH:', err);
        return;
    }
    console.log(`âœ… ConnectÃ© Ã  MySQL ${process.env.DB_NAME}`);
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        service: process.env.SERVICE_NAME || 'rh', 
        status: 'OK',
        time: new Date().toISOString()
    });
});

// ===========================================
// ROUTES EMPLOYES
// ===========================================
app.get('/api/employes', verifyToken, (req, res) => {
    db.query('SELECT * FROM employes ORDER BY date_creation DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/employes/:id', verifyToken, (req, res) => {
    db.query('SELECT * FROM employes WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'EmployÃ© non trouvÃ©' });
        res.json(results[0]);
    });
});

app.post('/api/employes', verifyToken, (req, res) => {
    const { nom, prenom, genre, email, telephone, poste, departement, date_embauche, salaire_base } = req.body;
    
    const matricule = `EMP-${Date.now().toString().slice(-6)}`;
    
    const sql = `INSERT INTO employes 
                 (matricule, nom, prenom, genre, email, telephone, poste, departement, date_embauche, salaire_base) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [matricule, nom, prenom, genre, email, telephone, poste, departement, date_embauche, salaire_base],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                matricule,
                message: 'EmployÃ© crÃ©Ã© avec succÃ¨s'
            });
        }
    );
});

app.put('/api/employes/:id', verifyToken, (req, res) => {
    const { nom, prenom, telephone, adresse, poste, departement, salaire_base } = req.body;
    
    const sql = `UPDATE employes 
                 SET nom = ?, prenom = ?, telephone = ?, adresse = ?, 
                     poste = ?, departement = ?, salaire_base = ?
                 WHERE id = ?`;
    
    db.query(sql, [nom, prenom, telephone, adresse, poste, departement, salaire_base, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'EmployÃ© modifiÃ©' });
        }
    );
});

// ===========================================
// ROUTES CONGES
// ===========================================
app.get('/api/conges', verifyToken, (req, res) => {
    const sql = `
        SELECT c.*, e.nom, e.prenom 
        FROM conges c
        JOIN employes e ON c.employe_id = e.id
        ORDER BY c.date_demande DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/conges/employe/:id', verifyToken, (req, res) => {
    db.query('SELECT * FROM conges WHERE employe_id = ? ORDER BY date_demande DESC', 
        [req.params.id], 
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

app.post('/api/conges', verifyToken, (req, res) => {
    const { employe_id, type_conge, date_debut, date_fin, motif } = req.body;
    
    const sql = `INSERT INTO conges 
                 (employe_id, type_conge, date_debut, date_fin, motif) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    db.query(sql, [employe_id, type_conge, date_debut, date_fin, motif],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                message: 'Demande de congÃ© enregistrÃ©e'
            });
        }
    );
});

app.put('/api/conges/:id/statut', verifyToken, (req, res) => {
    const { statut } = req.body;
    
    db.query('UPDATE conges SET statut = ?, date_validation = CURDATE() WHERE id = ?', 
        [statut, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Statut mis Ã  jour' });
        }
    );
});

// ===========================================
// ROUTES FORMATIONS
// ===========================================
app.get('/api/formations', verifyToken, (req, res) => {
    const sql = `
        SELECT f.*, e.nom, e.prenom 
        FROM formations f
        JOIN employes e ON f.employe_id = e.id
        ORDER BY f.date_debut DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/formations', verifyToken, (req, res) => {
    const { employe_id, titre, organisme, date_debut, date_fin, duree_heures, cout } = req.body;
    
    const sql = `INSERT INTO formations 
                 (employe_id, titre, organisme, date_debut, date_fin, duree_heures, cout) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [employe_id, titre, organisme, date_debut, date_fin, duree_heures, cout],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                message: 'Formation enregistrÃ©e'
            });
        }
    );
});

// ===========================================
// ROUTES EVALUATIONS
// ===========================================
app.get('/api/evaluations', verifyToken, (req, res) => {
    const sql = `
        SELECT e.*, emp.nom, emp.prenom 
        FROM evaluations e
        JOIN employes emp ON e.employe_id = emp.id
        ORDER BY e.date_evaluation DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/evaluations', verifyToken, (req, res) => {
    const { employe_id, date_evaluation, periode, note_technique, note_comportement, commentaires, objectifs_futurs } = req.body;
    
    const sql = `INSERT INTO evaluations 
                 (employe_id, date_evaluation, periode, note_technique, note_comportement, commentaires, objectifs_futurs) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [employe_id, date_evaluation, periode, note_technique, note_comportement, commentaires, objectifs_futurs],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                message: 'Ã‰valuation enregistrÃ©e'
            });
        }
    );
});

// ===========================================
// STATISTIQUES RH
// ===========================================
app.get('/api/stats', verifyToken, (req, res) => {
    const stats = {};
    
    db.query('SELECT COUNT(*) as total FROM employes', (err, result) => {
        stats.total_employes = result[0].total;
        
        db.query("SELECT COUNT(*) as total FROM employes WHERE date_embauche > DATE_SUB(NOW(), INTERVAL 1 YEAR)", (err, result) => {
            stats.nouveaux_employes = result[0].total;
            
            db.query("SELECT COUNT(*) as total FROM conges WHERE statut = 'EN_ATTENTE'", (err, result) => {
                stats.conges_attente = result[0].total;
                
                db.query('SELECT AVG(note_global) as moyenne FROM evaluations', (err, result) => {
                    stats.satisfaction_moyenne = result[0].moyenne || 0;
                    res.json(stats);
                });
            });
        });
    });
});

// ===========================================
// DÃ‰MARRAGE
// ===========================================
app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
    console.log(`\nðŸš€ SERVICE RH DÃ‰MARRÃ‰`);
    console.log(`ðŸ“¡ URL: http://localhost:${PORT}`);
    console.log(`ðŸ” Health: http://localhost:${PORT}/health`);
    console.log(`âœ… PrÃªt Ã  recevoir des requÃªtes\n`);
});
