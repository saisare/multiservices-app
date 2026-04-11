require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { verifyToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || undefined,
    database: process.env.DB_NAME || 'rh_db',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10
});

const query = async (sql, params = []) => {
    const [rows] = await db.query(sql, params);
    return rows;
};

const buildMatricule = () => `EMP-${Date.now().toString().slice(-6)}`;
const buildContractNumber = () => `CTR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

app.get('/health', async (req, res) => {
    try {
        await query('SELECT 1');
        res.json({
            service: process.env.SERVICE_NAME || 'rh',
            status: 'OK',
            database: process.env.DB_NAME || 'rh_db',
            time: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ service: 'rh', status: 'ERROR', error: error.message });
    }
});

app.get('/api/employes', verifyToken, async (req, res) => {
    try {
        const rows = await query(`
            SELECT
                id,
                matricule,
                nom,
                prenom,
                poste,
                date_embauche,
                salaire AS salaire_base,
                NULL AS email,
                NULL AS telephone,
                NULL AS departement,
                NULL AS genre,
                NULL AS adresse,
                1 AS actif
            FROM employes
            ORDER BY date_embauche DESC, id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/employes/:id', verifyToken, async (req, res) => {
    try {
        const rows = await query(`
            SELECT
                id,
                matricule,
                nom,
                prenom,
                poste,
                date_embauche,
                salaire AS salaire_base,
                NULL AS email,
                NULL AS telephone,
                NULL AS departement,
                NULL AS genre,
                NULL AS adresse,
                1 AS actif
            FROM employes
            WHERE id = ?
        `, [req.params.id]);

        if (!rows.length) {
            return res.status(404).json({ error: 'Employé non trouvé' });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/employes', verifyToken, async (req, res) => {
    try {
        const { nom, prenom, poste, date_embauche, salaire_base, salaire } = req.body;

        if (!nom || !prenom || !poste || !date_embauche) {
            return res.status(400).json({ error: 'nom, prenom, poste et date_embauche sont requis' });
        }

        const matricule = buildMatricule();
        const result = await query(
            'INSERT INTO employes (matricule, nom, prenom, poste, date_embauche, salaire) VALUES (?, ?, ?, ?, ?, ?)',
            [matricule, nom, prenom, poste, date_embauche, salaire_base || salaire || 0]
        );

        res.status(201).json({ id: result.insertId, matricule, message: 'Employé créé avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/employes/:id', verifyToken, async (req, res) => {
    try {
        const { nom, prenom, poste, date_embauche, salaire_base, salaire } = req.body;
        const result = await query(
            'UPDATE employes SET nom = ?, prenom = ?, poste = ?, date_embauche = ?, salaire = ? WHERE id = ?',
            [nom || null, prenom || null, poste || null, date_embauche || null, salaire_base || salaire || 0, req.params.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Employé non trouvé' });
        }

        res.json({ success: true, message: 'Employé modifié' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/conges', verifyToken, async (req, res) => {
    try {
        const rows = await query(`
            SELECT c.*, e.nom AS employe_nom, e.prenom AS employe_prenom
            FROM conges c
            JOIN employes e ON c.employe_id = e.id
            ORDER BY c.date_demande DESC, c.id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/conges/employe/:id', verifyToken, async (req, res) => {
    try {
        const rows = await query(
            'SELECT * FROM conges WHERE employe_id = ? ORDER BY date_demande DESC, id DESC',
            [req.params.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/conges', verifyToken, async (req, res) => {
    try {
        const { employe_id, type_conge, date_debut, date_fin, motif } = req.body;

        if (!employe_id || !type_conge || !date_debut || !date_fin) {
            return res.status(400).json({ error: 'employe_id, type_conge, date_debut et date_fin sont requis' });
        }

        const result = await query(
            'INSERT INTO conges (employe_id, type_conge, date_debut, date_fin, motif) VALUES (?, ?, ?, ?, ?)',
            [employe_id, type_conge, date_debut, date_fin, motif || null]
        );

        res.status(201).json({ id: result.insertId, message: 'Demande de congé enregistrée' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/conges/:id/statut', verifyToken, async (req, res) => {
    try {
        const { statut } = req.body;
        const result = await query(
            'UPDATE conges SET statut = ?, date_validation = CURDATE() WHERE id = ?',
            [statut, req.params.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Congé non trouvé' });
        }

        res.json({ success: true, message: 'Statut mis à jour' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/formations', verifyToken, async (req, res) => {
    try {
        const rows = await query(`
            SELECT f.*, e.nom AS employe_nom, e.prenom AS employe_prenom
            FROM formations f
            JOIN employes e ON f.employe_id = e.id
            ORDER BY f.date_debut DESC, f.id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/formations', verifyToken, async (req, res) => {
    try {
        const { employe_id, titre, organisme, date_debut, date_fin, duree_heures, cout, certificat_obtenu, fichier_certificat } = req.body;

        if (!employe_id || !titre) {
            return res.status(400).json({ error: 'employe_id et titre sont requis' });
        }

        const result = await query(
            `INSERT INTO formations
             (employe_id, titre, organisme, date_debut, date_fin, duree_heures, cout, certificat_obtenu, fichier_certificat)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [employe_id, titre, organisme || null, date_debut || null, date_fin || null, duree_heures || null, cout || null, certificat_obtenu ? 1 : 0, fichier_certificat || null]
        );

        res.status(201).json({ id: result.insertId, message: 'Formation enregistrée' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/evaluations', verifyToken, async (req, res) => {
    try {
        const rows = await query(`
            SELECT ev.*, emp.nom AS employe_nom, emp.prenom AS employe_prenom,
                   CONCAT(emp.prenom, ' ', emp.nom) AS employe_display_name
            FROM evaluations ev
            JOIN employes emp ON ev.employe_id = emp.id
            ORDER BY ev.date_evaluation DESC, ev.id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/evaluations', verifyToken, async (req, res) => {
    try {
        const { employe_id, evaluateur_id, date_evaluation, periode, note_technique, note_comportement, commentaires, objectifs_futurs, fichier_evaluation } = req.body;

        if (!employe_id || !date_evaluation) {
            return res.status(400).json({ error: 'employe_id et date_evaluation sont requis' });
        }

        const result = await query(
            `INSERT INTO evaluations
             (employe_id, evaluateur_id, date_evaluation, periode, note_technique, note_comportement, commentaires, objectifs_futurs, fichier_evaluation)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [employe_id, evaluateur_id || null, date_evaluation, periode || null, note_technique || null, note_comportement || null, commentaires || null, objectifs_futurs || null, fichier_evaluation || null]
        );

        res.status(201).json({ id: result.insertId, message: 'Évaluation enregistrée' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/contrats', verifyToken, async (req, res) => {
    try {
        const rows = await query(`
            SELECT c.*, e.nom AS employe_nom, e.prenom AS employe_prenom,
                   CONCAT(e.prenom, ' ', e.nom) AS employe_display_name
            FROM contrats c
            JOIN employes e ON c.employe_id = e.id
            ORDER BY c.date_debut DESC, c.id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/contrats', verifyToken, async (req, res) => {
    try {
        const { employe_id, type_contrat, date_debut, date_fin, poste, salaire, duree_essai, fichier_contrat, statut } = req.body;

        if (!employe_id || !type_contrat || !date_debut) {
            return res.status(400).json({ error: 'employe_id, type_contrat et date_debut sont requis' });
        }

        const numero_contrat = buildContractNumber();
        const result = await query(
            `INSERT INTO contrats
             (employe_id, numero_contrat, type_contrat, date_debut, date_fin, poste, salaire, duree_essai, fichier_contrat, statut)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [employe_id, numero_contrat, type_contrat, date_debut, date_fin || null, poste || null, salaire || 0, duree_essai || null, fichier_contrat || null, statut || 'ACTIF']
        );

        res.status(201).json({ id: result.insertId, numero_contrat, message: 'Contrat créé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/documents', verifyToken, async (req, res) => {
    try {
        const rows = await query(`
            SELECT d.*, e.nom AS employe_nom, e.prenom AS employe_prenom
            FROM documents_rh d
            JOIN employes e ON d.employe_id = e.id
            ORDER BY d.date_upload DESC, d.id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/documents', verifyToken, async (req, res) => {
    try {
        const { employe_id, type_document, nom_fichier, chemin_fichier, confidentiel } = req.body;

        if (!employe_id || !type_document) {
            return res.status(400).json({ error: 'employe_id et type_document sont requis' });
        }

        const result = await query(
            `INSERT INTO documents_rh
             (employe_id, type_document, nom_fichier, chemin_fichier, confidentiel)
             VALUES (?, ?, ?, ?, ?)`,
            [employe_id, type_document, nom_fichier || null, chemin_fichier || null, confidentiel ? 1 : 0]
        );

        res.status(201).json({ id: result.insertId, message: 'Document RH enregistré' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/paie', verifyToken, async (req, res) => {
    try {
        const rows = await query(`
            SELECT p.*, e.nom AS employe_nom, e.prenom AS employe_prenom
            FROM paie p
            JOIN employes e ON p.employe_id = e.id
            ORDER BY p.annee DESC, p.mois DESC, p.id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/paie', verifyToken, async (req, res) => {
    try {
        const { employe_id, mois, annee, salaire_base, primes, indemnites, cotisations, net_a_payer, date_paie, fichier_bulletin, statut } = req.body;

        if (!employe_id || !mois || !annee) {
            return res.status(400).json({ error: 'employe_id, mois et annee sont requis' });
        }

        const result = await query(
            `INSERT INTO paie
             (employe_id, mois, annee, salaire_base, primes, indemnites, cotisations, net_a_payer, date_paie, fichier_bulletin, statut)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [employe_id, mois, annee, salaire_base || 0, primes || 0, indemnites || 0, cotisations || 0, net_a_payer || 0, date_paie || null, fichier_bulletin || null, statut || 'PREPARE']
        );

        res.status(201).json({ id: result.insertId, message: 'Ligne de paie enregistrée' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/stats', verifyToken, async (req, res) => {
    try {
        const rows = await query(`
            SELECT
                (SELECT COUNT(*) FROM employes) AS total_employes,
                (SELECT COUNT(*) FROM employes WHERE date_embauche > DATE_SUB(NOW(), INTERVAL 1 YEAR)) AS nouveaux_employes,
                (SELECT COUNT(*) FROM conges WHERE statut = 'EN_ATTENTE') AS conges_attente,
                (SELECT COUNT(*) FROM conges WHERE statut = 'VALIDE' AND CURDATE() BETWEEN date_debut AND date_fin) AS en_conges,
                (SELECT COALESCE(AVG(note_global), 0) FROM evaluations) AS satisfaction_moyenne,
                (SELECT COUNT(*) FROM contrats) AS total_contrats,
                (SELECT COUNT(*) FROM contrats WHERE type_contrat = 'CDI') AS contrats_cdi,
                (SELECT COUNT(*) FROM contrats WHERE type_contrat = 'CDD') AS contrats_cdd,
                (SELECT COUNT(*) FROM formations) AS total_formations,
                (SELECT COUNT(*) FROM documents_rh) AS total_documents,
                (SELECT COUNT(*) FROM paie) AS total_paie
        `);
        res.json(rows[0] || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
    console.log(`SERVICE RH DEMARRE sur http://localhost:${PORT}`);
});
