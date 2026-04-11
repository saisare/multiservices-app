require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { verifyToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3008;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || undefined,
    database: process.env.DB_NAME || 'logistique_db',
    charset: 'utf8mb4'
});

db.connect(err => {
    if (err) {
        console.error('âŒ Erreur connexion MySQL:', err);
        process.exit(1);
    }
    console.log(`âœ… ConnectÃ© Ã  MySQL (${process.env.DB_NAME})`);
});

// Middleware d'authentification (simplifiÃ© pour le moment)
const authMiddleware = (req, res, next) => {
    // Ã€ implÃ©menter avec JWT plus tard
    next();
};

// ===========================================
// ROUTES PUBLIQUES (sans auth pour test)
// ===========================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        service: process.env.SERVICE_NAME,
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// ===========================================
// ROUTES PRODUITS
// ===========================================

// GET /api/produits - Liste tous les produits
app.get('/api/produits', verifyToken, (req, res) => {
    const sql = 'SELECT * FROM produits ORDER BY nom';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur SQL:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// GET /api/produits/:id - Detail d'un produit
app.get('/api/produits/:id', verifyToken, (req, res) => {
    const sql = 'SELECT * FROM produits WHERE id = ?';
    
    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Produit non trouvÃ©' });
        }
        res.json(results[0]);
    });
});

// POST /api/produits - Ajouter un produit
app.post('/api/produits', verifyToken, (req, res) => {
    const { code_produit, nom, categorie, fournisseur, quantite, seuil_alerte, prix_unitaire, localisation } = req.body;
    
    // Validation
    if (!code_produit || !nom) {
        return res.status(400).json({ error: 'Code produit et nom requis' });
    }
    
    const sql = `INSERT INTO produits 
                 (code_produit, nom, categorie, fournisseur, quantite, seuil_alerte, prix_unitaire, localisation) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [code_produit, nom, categorie, fournisseur, quantite || 0, seuil_alerte || 10, prix_unitaire, localisation], 
        (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Code produit dÃ©jÃ  existant' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                id: result.insertId,
                message: 'Produit ajoutÃ© avec succÃ¨s'
            });
        }
    );
});

// PUT /api/produits/:id - Modifier un produit
app.put('/api/produits/:id', verifyToken, (req, res) => {
    const { nom, categorie, fournisseur, quantite, seuil_alerte, prix_unitaire, localisation } = req.body;
    
    const sql = `UPDATE produits 
                 SET nom = ?, categorie = ?, fournisseur = ?, quantite = ?, 
                     seuil_alerte = ?, prix_unitaire = ?, localisation = ?,
                     date_modification = NOW()
                 WHERE id = ?`;
    
    db.query(sql, [nom, categorie, fournisseur, quantite, seuil_alerte, prix_unitaire, localisation, req.params.id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Produit non trouvÃ©' });
            }
            res.json({ message: 'Produit modifiÃ© avec succÃ¨s' });
        }
    );
});

// DELETE /api/produits/:id - Supprimer un produit
app.delete('/api/produits/:id', verifyToken, (req, res) => {
    const sql = 'DELETE FROM produits WHERE id = ?';
    
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Produit non trouvÃ©' });
        }
        res.json({ message: 'Produit supprimÃ© avec succÃ¨s' });
    });
});

// ===========================================
// ROUTES STOCK (ENTRÃ‰ES/SORTIES)
// ===========================================

// POST /api/entrees - Ajouter une entree de stock
app.post('/api/entrees', verifyToken, (req, res) => {
    const { produit_id, fournisseur_id, quantite, prix_unitaire_achat, numero_bon_livraison, date_entree, notes } = req.body;
    
    // Commencer une transaction
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: err.message });
        
        // 1. Ajouter l'entrÃ©e
        const sql1 = `INSERT INTO entrees_stock 
                      (produit_id, fournisseur_id, quantite, prix_unitaire_achat, numero_bon_livraison, date_entree, notes) 
                      VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        db.query(sql1, [produit_id, fournisseur_id, quantite, prix_unitaire_achat, numero_bon_livraison, date_entree, notes], (err, result) => {
            if (err) {
                return db.rollback(() => res.status(500).json({ error: err.message }));
            }
            
            // 2. Mettre Ã  jour le stock
            const sql2 = 'UPDATE produits SET quantite = quantite + ? WHERE id = ?';
            
            db.query(sql2, [quantite, produit_id], (err, result2) => {
                if (err) {
                    return db.rollback(() => res.status(500).json({ error: err.message }));
                }
                
                // 3. VÃ©rifier le seuil d'alerte
                const sql3 = 'SELECT quantite, seuil_alerte FROM produits WHERE id = ?';
                
                db.query(sql3, [produit_id], (err, results) => {
                    if (err) {
                        return db.rollback(() => res.status(500).json({ error: err.message }));
                    }
                    
                    const produit = results[0];
                    if (produit.quantite <= produit.seuil_alerte) {
                        const sql4 = `INSERT INTO alertes_stock (produit_id, seuil_actuel, seuil_minimum) 
                                      VALUES (?, ?, ?)`;
                        
                        db.query(sql4, [produit_id, produit.quantite, produit.seuil_alerte], (err) => {
                            if (err) console.error('Erreur crÃ©ation alerte:', err);
                        });
                    }
                    
                    db.commit(err => {
                        if (err) {
                            return db.rollback(() => res.status(500).json({ error: err.message }));
                        }
                        res.status(201).json({ message: 'EntrÃ©e enregistrÃ©e avec succÃ¨s' });
                    });
                });
            });
        });
    });
});

// POST /api/sorties - Ajouter une sortie de stock
app.post('/api/sorties', verifyToken, (req, res) => {
    const { produit_id, quantite, destinataire, type_sortie, numero_commande, date_sortie, notes } = req.body;
    
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: err.message });
        
        // 1. VÃ©rifier le stock disponible
        const sql0 = 'SELECT quantite FROM produits WHERE id = ?';
        
        db.query(sql0, [produit_id], (err, results) => {
            if (err) {
                return db.rollback(() => res.status(500).json({ error: err.message }));
            }
            
            const stockDispo = results[0]?.quantite || 0;
            if (stockDispo < quantite) {
                return db.rollback(() => res.status(400).json({ 
                    error: 'Stock insuffisant',
                    disponible: stockDispo,
                    demande: quantite
                }));
            }
            
            // 2. Ajouter la sortie
            const sql1 = `INSERT INTO sorties_stock 
                          (produit_id, quantite, destinataire, type_sortie, numero_commande, date_sortie, notes) 
                          VALUES (?, ?, ?, ?, ?, ?, ?)`;
            
            db.query(sql1, [produit_id, quantite, destinataire, type_sortie, numero_commande, date_sortie, notes], (err) => {
                if (err) {
                    return db.rollback(() => res.status(500).json({ error: err.message }));
                }
                
                // 3. Mettre Ã  jour le stock
                const sql2 = 'UPDATE produits SET quantite = quantite - ? WHERE id = ?';
                
                db.query(sql2, [quantite, produit_id], (err) => {
                    if (err) {
                        return db.rollback(() => res.status(500).json({ error: err.message }));
                    }
                    
                    db.commit(err => {
                        if (err) {
                            return db.rollback(() => res.status(500).json({ error: err.message }));
                        }
                        res.status(201).json({ message: 'Sortie enregistrÃ©e avec succÃ¨s' });
                    });
                });
            });
        });
    });
});

// GET /api/entrees - Historique des entrees
app.get('/api/entrees', verifyToken, (req, res) => {
    const sql = `SELECT e.*, p.nom as produit_nom, f.nom as fournisseur_nom
                 FROM entrees_stock e
                 JOIN produits p ON e.produit_id = p.id
                 LEFT JOIN fournisseurs f ON e.fournisseur_id = f.id
                 ORDER BY e.date_entree DESC
                 LIMIT 100`;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET /api/sorties - Historique des sorties
app.get('/api/sorties', verifyToken, (req, res) => {
    const sql = `SELECT s.*, p.nom as produit_nom
                 FROM sorties_stock s
                 JOIN produits p ON s.produit_id = p.id
                 ORDER BY s.date_sortie DESC
                 LIMIT 100`;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ===========================================
// ROUTES COMMANDES
// ===========================================

// POST /api/commandes - Creer une commande
app.post('/api/commandes', verifyToken, (req, res) => {
    const { client_nom, client_adresse, client_telephone, date_livraison_souhaitee, lignes } = req.body;
    
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: err.message });
        
        // GÃ©nÃ©rer numÃ©ro commande
        const sqlNum = "SELECT CONCAT('CMD-', DATE_FORMAT(NOW(), '%Y%m'), '-', LPAD(COUNT(*)+1, 4, '0')) as numero FROM commandes WHERE MONTH(date_commande) = MONTH(NOW())";
        
        db.query(sqlNum, (err, numResult) => {
            if (err) {
                return db.rollback(() => res.status(500).json({ error: err.message }));
            }
            
            const numero_commande = numResult[0].numero;
            
            // Calculer totaux
            let total_ht = 0;
            for (const ligne of lignes) {
                total_ht += ligne.quantite * ligne.prix_unitaire;
            }
            const tva = total_ht * 0.20;
            const total_ttc = total_ht + tva;
            
            // InsÃ©rer commande
            const sql1 = `INSERT INTO commandes 
                          (numero_commande, client_nom, client_adresse, client_telephone, date_livraison_souhaitee, total_ht, tva, total_ttc) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            
            db.query(sql1, [numero_commande, client_nom, client_adresse, client_telephone, date_livraison_souhaitee, total_ht, tva, total_ttc], 
                (err, result) => {
                    if (err) {
                        return db.rollback(() => res.status(500).json({ error: err.message }));
                    }
                    
                    const commande_id = result.insertId;
                    
                    // InsÃ©rer les lignes
                    let lignesOk = 0;
                    lignes.forEach((ligne, index) => {
                        const sql2 = `INSERT INTO lignes_commande (commande_id, produit_id, quantite, prix_unitaire) 
                                      VALUES (?, ?, ?, ?)`;
                        
                        db.query(sql2, [commande_id, ligne.produit_id, ligne.quantite, ligne.prix_unitaire], (err) => {
                            if (err) {
                                return db.rollback(() => res.status(500).json({ error: err.message }));
                            }
                            
                            lignesOk++;
                            if (lignesOk === lignes.length) {
                                db.commit(err => {
                                    if (err) {
                                        return db.rollback(() => res.status(500).json({ error: err.message }));
                                    }
                                    res.status(201).json({
                                        numero_commande,
                                        message: 'Commande crÃ©Ã©e avec succÃ¨s'
                                    });
                                });
                            }
                        });
                    });
                }
            );
        });
    });
});

// GET /api/commandes - Liste des commandes
app.get('/api/commandes', verifyToken, (req, res) => {
    const sql = `SELECT c.*, 
                        COUNT(lc.id) as nb_lignes,
                        lv.statut as statut_livraison
                 FROM commandes c
                 LEFT JOIN lignes_commande lc ON c.id = lc.commande_id
                 LEFT JOIN livraisons lv ON c.id = lv.commande_id
                 GROUP BY c.id
                 ORDER BY c.date_commande DESC`;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET /api/commandes/:id - DÃ©tail d'une commande
app.get('/api/commandes/:id', verifyToken, (req, res) => {
    const sql1 = 'SELECT * FROM commandes WHERE id = ?';
    const sql2 = `SELECT lc.*, p.nom as produit_nom, p.code_produit as produit_code,
                         (lc.quantite * lc.prix_unitaire) as total_ligne
                  FROM lignes_commande lc
                  JOIN produits p ON lc.produit_id = p.id
                  WHERE lc.commande_id = ?`;
    
    db.query(sql1, [req.params.id], (err, commande) => {
        if (err) return res.status(500).json({ error: err.message });
        if (commande.length === 0) return res.status(404).json({ error: 'Commande non trouvÃ©e' });
        
        db.query(sql2, [req.params.id], (err, lignes) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({
                ...commande[0],
                lignes
            });
        });
    });
});

app.put('/api/commandes/:id', verifyToken, (req, res) => {
    const { client_nom, client_adresse, client_telephone, date_livraison_souhaitee, notes, statut } = req.body;

    const sql = `UPDATE commandes
                 SET client_nom = COALESCE(?, client_nom),
                     client_adresse = COALESCE(?, client_adresse),
                     client_telephone = COALESCE(?, client_telephone),
                     date_livraison_souhaitee = COALESCE(?, date_livraison_souhaitee),
                     notes = COALESCE(?, notes),
                     statut = COALESCE(?, statut)
                 WHERE id = ?`;

    db.query(
        sql,
        [client_nom || null, client_adresse || null, client_telephone || null, date_livraison_souhaitee || null, notes || null, statut || null, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Commande non trouvée' });
            }
            res.json({ message: 'Commande mise à jour avec succès' });
        }
    );
});

// ===========================================
// ROUTES LIVRAISONS
// ===========================================

app.get('/api/livraisons', verifyToken, (req, res) => {
    const sql = `SELECT l.*, c.numero_commande AS commande_numero, c.client_nom, c.client_adresse
                 FROM livraisons l
                 JOIN commandes c ON c.id = l.commande_id
                 ORDER BY l.created_at DESC`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results || []);
    });
});

app.get('/api/livraisons/:id', verifyToken, (req, res) => {
    const sql = `SELECT l.*, c.numero_commande AS commande_numero, c.client_nom, c.client_adresse
                 FROM livraisons l
                 JOIN commandes c ON c.id = l.commande_id
                 WHERE l.id = ?`;

    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!results || results.length === 0) {
            return res.status(404).json({ error: 'Livraison non trouvée' });
        }
        res.json(results[0]);
    });
});

app.post('/api/livraisons', verifyToken, (req, res) => {
    const {
        commande_id,
        transporteur,
        numero_suivi,
        date_expedition,
        date_livraison_prevue,
        adresse_livraison,
        frais_port,
        statut
    } = req.body;

    if (!commande_id || !transporteur) {
        return res.status(400).json({ error: 'Commande et transporteur requis' });
    }

    const sql = `INSERT INTO livraisons
                 (commande_id, numero_suivi, transporteur, date_expedition, date_livraison_prevue, statut, adresse_livraison, frais_port, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

    db.query(
        sql,
        [
            commande_id,
            numero_suivi || null,
            transporteur,
            date_expedition || null,
            date_livraison_prevue || null,
            statut || 'PREPARATION',
            adresse_livraison || null,
            frais_port || 0
        ],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: result.insertId, message: 'Livraison créée avec succès' });
        }
    );
});

app.put('/api/livraisons/:id', verifyToken, (req, res) => {
    const {
        transporteur,
        numero_suivi,
        date_expedition,
        date_livraison_prevue,
        date_livraison_reelle,
        adresse_livraison,
        frais_port,
        statut
    } = req.body;

    const sql = `UPDATE livraisons
                 SET transporteur = ?, numero_suivi = ?, date_expedition = ?, date_livraison_prevue = ?,
                     date_livraison_reelle = ?, adresse_livraison = ?, frais_port = ?, statut = ?
                 WHERE id = ?`;

    db.query(
        sql,
        [
            transporteur || null,
            numero_suivi || null,
            date_expedition || null,
            date_livraison_prevue || null,
            date_livraison_reelle || null,
            adresse_livraison || null,
            frais_port || 0,
            statut || 'PREPARATION',
            req.params.id
        ],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Livraison non trouvée' });
            }
            res.json({ message: 'Livraison mise à jour avec succès' });
        }
    );
});

// ===========================================
// ROUTES STATISTIQUES
// ===========================================

// GET /api/stats - Statistiques gÃ©nÃ©rales
app.get('/api/stats', verifyToken, (req, res) => {
    const stats = {};
    
    db.query('SELECT COUNT(*) as total FROM produits', (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.total_produits = result[0].total;
        
        db.query('SELECT SUM(quantite * prix_unitaire) as valeur FROM produits', (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.valeur_stock = result[0].valeur || 0;
            
            db.query('SELECT COUNT(*) as total FROM alertes_stock WHERE traitee = false', (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                stats.alertes_non_traitees = result[0].total;
                
                db.query("SELECT COUNT(*) as total FROM commandes WHERE statut != 'TERMINEE'", (err, result) => {
                    if (err) return res.status(500).json({ error: err.message });
                    stats.commandes_en_cours = result[0].total;
                    
                    res.json(stats);
                });
            });
        });
    });
});

// ===========================================
// DÃ‰MARRAGE DU SERVEUR
// ===========================================
app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
    console.log(`\nðŸš€ SERVICE LOGISTIQUE DÃ‰MARRÃ‰`);
    console.log(`ðŸ“¡ URL: http://localhost:${PORT}`);
    console.log(`ðŸ” Health: http://localhost:${PORT}/health`);
    console.log(`ðŸ“¦ Produits: http://localhost:${PORT}/api/produits`);
    console.log(`âœ… PrÃªt Ã  recevoir des requÃªtes\n`);
});

