require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

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
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'multiservices'
});

db.connect(err => {
    if (err) {
        console.error('❌ Erreur connexion MySQL:', err);
        process.exit(1);
    }
    console.log(`✅ Connecté à MySQL (${process.env.DB_NAME})`);
});

// Middleware d'authentification (simplifié pour le moment)
const authMiddleware = (req, res, next) => {
    // À implémenter avec JWT plus tard
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
app.get('/api/produits', (req, res) => {
    const sql = 'SELECT * FROM produits ORDER BY nom';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur SQL:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// GET /api/produits/:id - Détail d'un produit
app.get('/api/produits/:id', (req, res) => {
    const sql = 'SELECT * FROM produits WHERE id = ?';
    
    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        res.json(results[0]);
    });
});

// POST /api/produits - Ajouter un produit
app.post('/api/produits', (req, res) => {
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
                    return res.status(400).json({ error: 'Code produit déjà existant' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                id: result.insertId,
                message: 'Produit ajouté avec succès'
            });
        }
    );
});

// PUT /api/produits/:id - Modifier un produit
app.put('/api/produits/:id', (req, res) => {
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
                return res.status(404).json({ error: 'Produit non trouvé' });
            }
            res.json({ message: 'Produit modifié avec succès' });
        }
    );
});

// DELETE /api/produits/:id - Supprimer un produit
app.delete('/api/produits/:id', (req, res) => {
    const sql = 'DELETE FROM produits WHERE id = ?';
    
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        res.json({ message: 'Produit supprimé avec succès' });
    });
});

// ===========================================
// ROUTES STOCK (ENTRÉES/SORTIES)
// ===========================================

// POST /api/entrees - Ajouter une entrée de stock
app.post('/api/entrees', (req, res) => {
    const { produit_id, fournisseur_id, quantite, prix_unitaire_achat, numero_bon_livraison, date_entree, notes } = req.body;
    
    // Commencer une transaction
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: err.message });
        
        // 1. Ajouter l'entrée
        const sql1 = `INSERT INTO entrees_stock 
                      (produit_id, fournisseur_id, quantite, prix_unitaire_achat, numero_bon_livraison, date_entree, notes) 
                      VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        db.query(sql1, [produit_id, fournisseur_id, quantite, prix_unitaire_achat, numero_bon_livraison, date_entree, notes], (err, result) => {
            if (err) {
                return db.rollback(() => res.status(500).json({ error: err.message }));
            }
            
            // 2. Mettre à jour le stock
            const sql2 = 'UPDATE produits SET quantite = quantite + ? WHERE id = ?';
            
            db.query(sql2, [quantite, produit_id], (err, result2) => {
                if (err) {
                    return db.rollback(() => res.status(500).json({ error: err.message }));
                }
                
                // 3. Vérifier le seuil d'alerte
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
                            if (err) console.error('Erreur création alerte:', err);
                        });
                    }
                    
                    db.commit(err => {
                        if (err) {
                            return db.rollback(() => res.status(500).json({ error: err.message }));
                        }
                        res.status(201).json({ message: 'Entrée enregistrée avec succès' });
                    });
                });
            });
        });
    });
});

// POST /api/sorties - Ajouter une sortie de stock
app.post('/api/sorties', (req, res) => {
    const { produit_id, quantite, destinataire, type_sortie, numero_commande, date_sortie, notes } = req.body;
    
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: err.message });
        
        // 1. Vérifier le stock disponible
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
                
                // 3. Mettre à jour le stock
                const sql2 = 'UPDATE produits SET quantite = quantite - ? WHERE id = ?';
                
                db.query(sql2, [quantite, produit_id], (err) => {
                    if (err) {
                        return db.rollback(() => res.status(500).json({ error: err.message }));
                    }
                    
                    db.commit(err => {
                        if (err) {
                            return db.rollback(() => res.status(500).json({ error: err.message }));
                        }
                        res.status(201).json({ message: 'Sortie enregistrée avec succès' });
                    });
                });
            });
        });
    });
});

// GET /api/entrees - Historique des entrées
app.get('/api/entrees', (req, res) => {
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
app.get('/api/sorties', (req, res) => {
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

// POST /api/commandes - Créer une commande
app.post('/api/commandes', (req, res) => {
    const { client_nom, client_adresse, client_telephone, date_livraison_souhaitee, lignes } = req.body;
    
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Générer numéro commande
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
            
            // Insérer commande
            const sql1 = `INSERT INTO commandes 
                          (numero_commande, client_nom, client_adresse, client_telephone, date_livraison_souhaitee, total_ht, tva, total_ttc) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            
            db.query(sql1, [numero_commande, client_nom, client_adresse, client_telephone, date_livraison_souhaitee, total_ht, tva, total_ttc], 
                (err, result) => {
                    if (err) {
                        return db.rollback(() => res.status(500).json({ error: err.message }));
                    }
                    
                    const commande_id = result.insertId;
                    
                    // Insérer les lignes
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
                                        message: 'Commande créée avec succès'
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
app.get('/api/commandes', (req, res) => {
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

// GET /api/commandes/:id - Détail d'une commande
app.get('/api/commandes/:id', (req, res) => {
    const sql1 = 'SELECT * FROM commandes WHERE id = ?';
    const sql2 = `SELECT lc.*, p.nom as produit_nom 
                  FROM lignes_commande lc
                  JOIN produits p ON lc.produit_id = p.id
                  WHERE lc.commande_id = ?`;
    
    db.query(sql1, [req.params.id], (err, commande) => {
        if (err) return res.status(500).json({ error: err.message });
        if (commande.length === 0) return res.status(404).json({ error: 'Commande non trouvée' });
        
        db.query(sql2, [req.params.id], (err, lignes) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({
                ...commande[0],
                lignes
            });
        });
    });
});

// ===========================================
// ROUTES STATISTIQUES
// ===========================================

// GET /api/stats - Statistiques générales
app.get('/api/stats', (req, res) => {
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
// DÉMARRAGE DU SERVEUR
// ===========================================
app.listen(PORT, () => {
    console.log(`\n🚀 SERVICE LOGISTIQUE DÉMARRÉ`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔍 Health: http://localhost:${PORT}/health`);
    console.log(`📦 Produits: http://localhost:${PORT}/api/produits`);
    console.log(`✅ Prêt à recevoir des requêtes\n`);
});