require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { verifyToken } = require('./middleware/auth');

console.log('verifyToken =', verifyToken ? 'âœ… chargÃ©' : 'âŒ undefined');

const app = express();
const PORT = process.env.PORT || 3003;

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
        console.error('âŒ Erreur connexion MySQL BTP:', err);
        return;
    }
    console.log(`âœ… ConnectÃ© Ã  MySQL ${process.env.DB_NAME}`);
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
    db.query('SELECT * FROM chantiers ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET un chantier par ID
app.get('/api/chantiers/:id', verifyToken, (req, res) => {
    db.query('SELECT * FROM chantiers WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Chantier non trouvÃ©' });
        res.json(results[0]);
    });
});

// POST crÃ©er un chantier
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
                message: 'Chantier crÃ©Ã© avec succÃ¨s'
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
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Chantier non trouvÃ©' });
            res.json({ success: true, message: 'Chantier modifiÃ© avec succÃ¨s' });
        }
    );
});

// ===========================================
// ROUTES MATERIAUX
// ===========================================

// GET tous les matÃ©riaux
app.get('/api/materiaux', verifyToken, (req, res) => {
    db.query('SELECT * FROM materiaux ORDER BY nom', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/materiaux-btp', verifyToken, (req, res) => {
    db.query('SELECT * FROM materiaux ORDER BY nom', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET un matÃ©riau par ID
app.get('/api/materiaux/:id', verifyToken, (req, res) => {
    db.query('SELECT * FROM materiaux WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'MatÃ©riau non trouvÃ©' });
        res.json(results[0]);
    });
});

// POST crÃ©er un matÃ©riau
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
                message: 'MatÃ©riau crÃ©Ã© avec succÃ¨s'
            });
        }
    );
});

// PUT modifier quantitÃ©
app.put('/api/materiaux/:id/stock', verifyToken, (req, res) => {
    const { quantite } = req.body;
    
    db.query('UPDATE materiaux SET quantite = ? WHERE id = ?', [quantite, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Stock mis Ã  jour' });
        }
    );
});

app.delete('/api/materiaux/:id', verifyToken, (req, res) => {
    const materiauId = req.params.id;

    db.query(
        'SELECT COUNT(*) AS total FROM lignes_commande_btp WHERE materiau_id = ?',
        [materiauId],
        (checkErr, checkRows) => {
            if (checkErr) return res.status(500).json({ error: checkErr.message });

            if (checkRows[0].total > 0) {
                return res.status(409).json({
                    error: 'Suppression impossible: ce materiau est deja utilise dans une commande.'
                });
            }

            db.query('DELETE FROM materiaux WHERE id = ?', [materiauId], (deleteErr, result) => {
                if (deleteErr) return res.status(500).json({ error: deleteErr.message });
                if (!result.affectedRows) return res.status(404).json({ error: 'Materiau non trouve' });

                res.json({
                    success: true,
                    id: Number(materiauId),
                    message: 'Materiau supprime avec succes'
                });
            });
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

// GET un ouvrier par ID
app.get('/api/ouvriers/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM ouvriers WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Ouvrier non trouvÃ©' });
        res.json(results[0]);
    });
});

// POST crÃ©er un ouvrier
app.post('/api/ouvriers', verifyToken, (req, res) => {
    const { matricule, nom, prenom, metier, telephone, email, date_embauche, salaire_journalier, adresse } = req.body;
    
    if (!matricule || !nom || !prenom || !metier) {
        return res.status(400).json({ error: 'Champs obligatoires manquants: matricule, nom, prenom, metier' });
    }
    
    const sql = `INSERT INTO ouvriers 
                 (matricule, nom, prenom, metier, telephone, email, date_embauche, salaire_journalier, adresse) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [matricule, nom, prenom, metier, telephone, email, date_embauche, salaire_journalier, adresse],
        (err, result) => {
            if (err) {
                console.error('Erreur crÃ©ation ouvrier:', err);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                id: result.insertId,
                matricule,
                nom,
                prenom,
                metier,
                message: 'Ouvrier crÃ©Ã© avec succÃ¨s'
            });
        }
    );
});

// PUT modifier un ouvrier
app.put('/api/ouvriers/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { matricule, nom, prenom, metier, telephone, email, date_embauche, salaire_journalier, adresse, actif } = req.body;
    
    const fields = [];
    const values = [];
    
    if (matricule !== undefined) { fields.push('matricule = ?'); values.push(matricule); }
    if (nom !== undefined) { fields.push('nom = ?'); values.push(nom); }
    if (prenom !== undefined) { fields.push('prenom = ?'); values.push(prenom); }
    if (metier !== undefined) { fields.push('metier = ?'); values.push(metier); }
    if (telephone !== undefined) { fields.push('telephone = ?'); values.push(telephone); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    if (date_embauche !== undefined) { fields.push('date_embauche = ?'); values.push(date_embauche); }
    if (salaire_journalier !== undefined) { fields.push('salaire_journalier = ?'); values.push(salaire_journalier); }
    if (adresse !== undefined) { fields.push('adresse = ?'); values.push(adresse); }
    if (actif !== undefined) { fields.push('actif = ?'); values.push(actif); }
    
    if (fields.length === 0) {
        return res.status(400).json({ error: 'Aucun champ Ã  modifier' });
    }
    
    values.push(id);
    const sql = `UPDATE ouvriers SET ${fields.join(', ')} WHERE id = ?`;
    
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Erreur modification ouvrier:', err);
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ouvrier non trouvÃ©' });
        }
        res.json({ message: 'Ouvrier modifiÃ© avec succÃ¨s' });
    });
});

// DELETE supprimer un ouvrier
app.delete('/api/ouvriers/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM ouvriers WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Erreur suppression ouvrier:', err);
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ouvrier non trouvÃ©' });
        }
        res.json({ message: 'Ouvrier supprimÃ© avec succÃ¨s' });
    });
});

// ===========================================
// ROUTES TACHES CHANTIER
// ===========================================

// GET toutes les tÃ¢ches d'un chantier
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

// POST crÃ©er une tÃ¢che
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
                message: 'TÃ¢che crÃ©Ã©e avec succÃ¨s'
            });
        }
    );
});

// PUT mettre Ã  jour statut tÃ¢che
app.put('/api/taches/:id/statut', verifyToken, (req, res) => {
    const { statut } = req.body;
    
    db.query('UPDATE taches_chantier SET statut = ? WHERE id = ?', [statut, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Statut mis Ã  jour' });
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

app.get('/api/commandes-btp/:id', verifyToken, (req, res) => {
    const commandeSql = 'SELECT * FROM commandes_btp WHERE id = ?';
    const lignesSql = `
        SELECT l.*, m.nom as materiau_nom, (l.quantite * l.prix_unitaire) as total_ligne
        FROM lignes_commande_btp l
        LEFT JOIN materiaux m ON l.materiau_id = m.id
        WHERE l.commande_id = ?
        ORDER BY l.id ASC
    `;

    db.query(commandeSql, [req.params.id], (commandeErr, commandeResults) => {
        if (commandeErr) return res.status(500).json({ error: commandeErr.message });
        if (commandeResults.length === 0) return res.status(404).json({ error: 'Commande non trouvee' });

        db.query(lignesSql, [req.params.id], (lignesErr, lignesResults) => {
            if (lignesErr) return res.status(500).json({ error: lignesErr.message });
            res.json({
                ...commandeResults[0],
                lignes: lignesResults
            });
        });
    });
});

// POST créer une commande
app.post('/api/commandes-btp', verifyToken, (req, res) => {
    const { fournisseur, date_livraison_prevue, notes, lignes = [] } = req.body;
    
    const numero = `CMD-BTP-${Date.now().toString().slice(-6)}`;
    
    const sql = `INSERT INTO commandes_btp 
                 (numero_commande, fournisseur, date_livraison_prevue, notes) 
                 VALUES (?, ?, ?, ?)`;
    
    db.beginTransaction((transactionErr) => {
        if (transactionErr) return res.status(500).json({ error: transactionErr.message });

        db.query(sql, [numero, fournisseur, date_livraison_prevue, notes], (err, result) => {
            if (err) {
                return db.rollback(() => res.status(500).json({ error: err.message }));
            }

            const commandeId = result.insertId;
            const lignesValides = Array.isArray(lignes)
                ? lignes.filter((ligne) => ligne.materiau_id && ligne.quantite && ligne.prix_unitaire)
                : [];

            if (!lignesValides.length) {
                return db.commit((commitErr) => {
                    if (commitErr) {
                        return db.rollback(() => res.status(500).json({ error: commitErr.message }));
                    }

                    res.status(201).json({
                        id: commandeId,
                        numero_commande: numero,
                        message: 'Commande creee avec succes'
                    });
                });
            }

            const lignesSql = `
                INSERT INTO lignes_commande_btp (commande_id, materiau_id, quantite, prix_unitaire)
                VALUES ?
            `;
            const lignesValues = lignesValides.map((ligne) => [
                commandeId,
                ligne.materiau_id,
                ligne.quantite,
                ligne.prix_unitaire
            ]);

            db.query(lignesSql, [lignesValues], (lignesErr) => {
                if (lignesErr) {
                    return db.rollback(() => res.status(500).json({ error: lignesErr.message }));
                }

                db.commit((commitErr) => {
                    if (commitErr) {
                        return db.rollback(() => res.status(500).json({ error: commitErr.message }));
                    }

                    res.status(201).json({
                        id: commandeId,
                        numero_commande: numero,
                        message: 'Commande creee avec succes'
                    });
                });
            });
        });
    });
});

app.patch('/api/commandes-btp/:id', verifyToken, (req, res) => {
    const { statut } = req.body;

    if (!statut) {
        return res.status(400).json({ error: 'Le statut est requis' });
    }

    db.query('UPDATE commandes_btp SET statut = ? WHERE id = ?', [statut, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!result.affectedRows) return res.status(404).json({ error: 'Commande non trouvee' });

        db.query('SELECT * FROM commandes_btp WHERE id = ?', [req.params.id], (selectErr, results) => {
            if (selectErr) return res.status(500).json({ error: selectErr.message });
            res.json(results[0]);
        });
    });
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

// POST crÃ©er une facture
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
                message: 'Facture crÃ©Ã©e avec succÃ¨s'
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
// DÃ‰MARRAGE
// ===========================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\nðŸš€ SERVICE BTP DÃ‰MARRÃ‰`);
    console.log(`ðŸ“¡ URL Local: http://localhost:${PORT}`);
    console.log(`ðŸŒ URL RÃ©seau: http://192.168.0.104:${PORT}`);
    console.log(`ðŸ” Health: http://0.0.0.0:${PORT}/health`);
    console.log(`âœ… Accessible par collÃ¨gues sur le rÃ©seau\n`);
});

