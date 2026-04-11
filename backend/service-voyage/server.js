require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3009;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const voyageDb = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.VOYAGE_DB || 'voyage_db',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10
});

const immigrationDb = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.IMMIGRATION_DB || 'immigration_db',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10
});

const voyageQuery = async (sql, params = []) => {
  const [rows] = await voyageDb.query(sql, params);
  return rows;
};

const immigrationQuery = async (sql, params = []) => {
  const [rows] = await immigrationDb.query(sql, params);
  return rows;
};

const buildClientCode = () => `CLT-${Date.now().toString().slice(-5)}`;
const buildReservationCodeExpr = "CONCAT('RES-', LPAD(r.id, 4, '0'))";
const buildInvoiceNumber = () => `FAC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
const buildDossierNumber = () => `DOS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
const buildRendezVousNumber = () => `RDV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

app.get('/health', async (req, res) => {
  try {
    await voyageQuery('SELECT 1');
    await immigrationQuery('SELECT 1');
    res.json({
      service: 'service-voyage',
      status: 'OK',
      port: PORT,
      databases: [process.env.VOYAGE_DB || 'voyage_db', process.env.IMMIGRATION_DB || 'immigration_db'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ service: 'service-voyage', status: 'ERROR', error: error.message });
  }
});

app.get('/api/voyage/clients', authenticateToken, async (req, res) => {
  try {
    const clients = await voyageQuery(`
      SELECT
        id,
        CONCAT('CLT-', LPAD(id, 4, '0')) AS code_client,
        'PARTICULIER' AS type_client,
        nom,
        prenom,
        NULL AS entreprise,
        NULL AS date_naissance,
        NULL AS nationalite,
        NULL AS passport_number,
        NULL AS passport_expiration,
        email,
        telephone,
        NULL AS adresse,
        date_creation
      FROM clients_voyage
      ORDER BY date_creation DESC, id DESC
      LIMIT 200
    `);
    res.json({ clients, database: process.env.VOYAGE_DB || 'voyage_db' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voyage/clients', authenticateToken, async (req, res) => {
  try {
    const { nom, prenom, email, telephone } = req.body;

    if (!nom) {
      return res.status(400).json({ error: 'nom requis' });
    }

    const result = await voyageQuery(
      'INSERT INTO clients_voyage (nom, prenom, email, telephone, created_by) VALUES (?, ?, ?, ?, ?)',
      [nom, prenom || null, email || null, telephone || null, req.user?.id || null]
    );

    res.status(201).json({ success: true, id: result.insertId, code_client: buildClientCode() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/voyage/destinations', authenticateToken, async (req, res) => {
  try {
    const destinations = await voyageQuery('SELECT * FROM destinations ORDER BY pays ASC, ville ASC LIMIT 200');
    res.json({ destinations, database: process.env.VOYAGE_DB || 'voyage_db' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voyage/destinations', authenticateToken, async (req, res) => {
  try {
    const { pays, ville, aeroport_code, description, saison_haute, visa_requis, prix_moyen } = req.body;

    if (!pays || !ville) {
      return res.status(400).json({ error: 'pays et ville sont requis' });
    }

    const code_destination = `DEST-${Date.now().toString().slice(-5)}`;
    const result = await voyageQuery(
      `INSERT INTO destinations
       (code_destination, pays, ville, aeroport_code, description, saison_haute, visa_requis, prix_moyen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [code_destination, pays, ville, aeroport_code || null, description || null, saison_haute || null, visa_requis ? 1 : 0, prix_moyen || null]
    );

    res.status(201).json({ success: true, id: result.insertId, code_destination });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/voyage/vols', authenticateToken, async (req, res) => {
  try {
    const vols = await voyageQuery(`
      SELECT v.*, d.pays, d.ville
      FROM vols v
      JOIN destinations d ON v.destination_id = d.id
      ORDER BY v.date_depart DESC, v.id DESC
      LIMIT 200
    `);
    res.json({ vols, database: process.env.VOYAGE_DB || 'voyage_db' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voyage/vols', authenticateToken, async (req, res) => {
  try {
    const { destination_id, compagnie, date_depart, date_arrivee, prix, places_disponibles } = req.body;

    if (!destination_id || !date_depart || !date_arrivee) {
      return res.status(400).json({ error: 'destination_id, date_depart et date_arrivee sont requis' });
    }

    const code_vol = `VOL-${Date.now().toString().slice(-5)}`;
    const result = await voyageQuery(
      `INSERT INTO vols
       (code_vol, destination_id, compagnie, date_depart, date_arrivee, prix, places_disponibles)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code_vol, destination_id, compagnie || null, date_depart, date_arrivee, prix || null, places_disponibles || 0]
    );

    res.status(201).json({ success: true, id: result.insertId, code_vol });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/voyage/hotels', authenticateToken, async (req, res) => {
  try {
    const hotels = await voyageQuery(`
      SELECT h.*, d.pays, d.ville
      FROM hotels h
      JOIN destinations d ON h.destination_id = d.id
      ORDER BY h.nom ASC
      LIMIT 200
    `);
    res.json({ hotels, database: process.env.VOYAGE_DB || 'voyage_db' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voyage/hotels', authenticateToken, async (req, res) => {
  try {
    const { nom, destination_id, adresse, etoiles, prix_nuit, telephone, email } = req.body;

    if (!nom || !destination_id) {
      return res.status(400).json({ error: 'nom et destination_id sont requis' });
    }

    const result = await voyageQuery(
      `INSERT INTO hotels
       (nom, destination_id, adresse, etoiles, prix_nuit, telephone, email)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nom, destination_id, adresse || null, etoiles || null, prix_nuit || null, telephone || null, email || null]
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/voyage/reservations', authenticateToken, async (req, res) => {
  try {
    const reservations = await voyageQuery(`
      SELECT
        r.id,
        ${buildReservationCodeExpr} AS code_reservation,
        r.client_id,
        r.destination,
        r.date_depart,
        r.date_retour,
        r.statut,
        r.created_by,
        r.assigned_to,
        c.nom AS client_nom,
        c.prenom AS client_prenom
      FROM reservations r
      LEFT JOIN clients_voyage c ON r.client_id = c.id
      ORDER BY r.date_depart DESC, r.id DESC
      LIMIT 200
    `);
    res.json({ reservations, database: process.env.VOYAGE_DB || 'voyage_db' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voyage/reservations', authenticateToken, async (req, res) => {
  try {
    const { client_id, destination, date_depart, date_retour, statut } = req.body;

    if (!client_id || !destination || !date_depart) {
      return res.status(400).json({ error: 'client_id, destination et date_depart sont requis' });
    }

    const result = await voyageQuery(
      `INSERT INTO reservations
       (client_id, destination, date_depart, date_retour, statut, created_by, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [client_id, destination, date_depart, date_retour || null, statut || 'EN_ATTENTE', req.user?.id || null, null]
    );

    res.status(201).json({ success: true, reservationId: result.insertId, code_reservation: `RES-${String(result.insertId).padStart(4, '0')}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/voyage/factures', authenticateToken, async (req, res) => {
  try {
    const factures = await voyageQuery(`
      SELECT f.*, ${buildReservationCodeExpr} AS code_reservation
      FROM factures_voyage f
      JOIN reservations r ON f.reservation_id = r.id
      ORDER BY f.id DESC
      LIMIT 200
    `);
    res.json({ factures, database: process.env.VOYAGE_DB || 'voyage_db' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voyage/factures', authenticateToken, async (req, res) => {
  try {
    const { reservation_id, date_emission, montant_ht, tva, montant_ttc, statut, chemin_pdf } = req.body;

    if (!reservation_id) {
      return res.status(400).json({ error: 'reservation_id requis' });
    }

    const numero_facture = buildInvoiceNumber();
    const result = await voyageQuery(
      `INSERT INTO factures_voyage
       (numero_facture, reservation_id, date_emission, montant_ht, tva, montant_ttc, statut, chemin_pdf)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [numero_facture, reservation_id, date_emission || null, montant_ht || 0, tva || 0, montant_ttc || 0, statut || 'EMISE', chemin_pdf || null]
    );

    res.status(201).json({ success: true, id: result.insertId, numero_facture });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/voyage/paiements', authenticateToken, async (req, res) => {
  try {
    const paiements = await voyageQuery(`
      SELECT p.*, f.numero_facture
      FROM paiements_voyage p
      JOIN factures_voyage f ON p.reservation_id = f.reservation_id
      ORDER BY p.date_creation DESC, p.id DESC
      LIMIT 200
    `);
    res.json({ paiements, database: process.env.VOYAGE_DB || 'voyage_db' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voyage/paiements', authenticateToken, async (req, res) => {
  try {
    const { reservation_id, montant, type_paiement, date_paiement, mode_paiement, reference, statut } = req.body;

    if (!reservation_id || !montant || !type_paiement || !date_paiement) {
      return res.status(400).json({ error: 'reservation_id, montant, type_paiement et date_paiement sont requis' });
    }

    const result = await voyageQuery(
      `INSERT INTO paiements_voyage
       (reservation_id, montant, type_paiement, date_paiement, mode_paiement, reference, statut)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [reservation_id, montant, type_paiement, date_paiement, mode_paiement || null, reference || null, statut || 'RECU']
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/voyage/offres', authenticateToken, async (req, res) => {
  try {
    const vols = await voyageQuery(`
      SELECT
        v.id,
        CONCAT('Vol ', v.code_vol) AS nom,
        v.prix,
        d.pays AS destination_pays,
        'vol' AS type
      FROM vols v
      JOIN destinations d ON v.destination_id = d.id
      ORDER BY v.id DESC
      LIMIT 100
    `);

    const hotels = await voyageQuery(`
      SELECT
        h.id + 100000 AS id,
        h.nom,
        h.prix_nuit AS prix,
        d.pays AS destination_pays,
        'hotel' AS type
      FROM hotels h
      JOIN destinations d ON h.destination_id = d.id
      ORDER BY h.id DESC
      LIMIT 100
    `);

    res.json({ offres: [...vols, ...hotels], database: process.env.VOYAGE_DB || 'voyage_db' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/voyage/immigration/demandeurs', authenticateToken, async (req, res) => {
  try {
    const demandeurs = await immigrationQuery('SELECT * FROM demandeurs ORDER BY date_creation DESC, id DESC LIMIT 200');
    res.json({ demandeurs, database: process.env.IMMIGRATION_DB || 'immigration_db' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voyage/immigration/demandeurs', authenticateToken, async (req, res) => {
  try {
    const {
      nom,
      prenom,
      date_naissance,
      nationalite,
      email,
      telephone,
      adresse,
      numero_passeport,
      date_expiration_passeport,
      actif
    } = req.body;

    if (!nom) {
      return res.status(400).json({ error: 'nom requis' });
    }

    const code_demandeur = `DEM-${Date.now().toString().slice(-5)}`;
    const result = await immigrationQuery(
      `INSERT INTO demandeurs
       (code_demandeur, nom, prenom, date_naissance, nationalite, email, telephone, adresse, numero_passeport, date_expiration_passeport, actif)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code_demandeur, nom, prenom || null, date_naissance || null, nationalite || null, email || null, telephone || null, adresse || null, numero_passeport || null, date_expiration_passeport || null, actif === false ? 0 : 1]
    );

    res.status(201).json({ success: true, id: result.insertId, code_demandeur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/voyage/immigration/types-demandes', authenticateToken, async (req, res) => {
  try {
    const types = await immigrationQuery('SELECT * FROM types_demandes ORDER BY nom ASC');
    res.json({ types, database: process.env.IMMIGRATION_DB || 'immigration_db' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/voyage/immigration/dossiers', authenticateToken, async (req, res) => {
  try {
    const dossiers = await immigrationQuery(`
      SELECT
        d.*,
        td.nom AS type_demande,
        dm.nom AS demandeur_nom,
        dm.prenom AS demandeur_prenom
      FROM dossiers d
      JOIN types_demandes td ON d.type_demande_id = td.id
      JOIN demandeurs dm ON d.demandeur_id = dm.id
      ORDER BY d.date_creation DESC, d.id DESC
      LIMIT 200
    `);
    res.json({ dossiers, database: process.env.IMMIGRATION_DB || 'immigration_db' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voyage/immigration/dossiers', authenticateToken, async (req, res) => {
  try {
    const { demandeur_id, type_demande_id, pays_destination, type_visa, date_depot, statut, notes } = req.body;

    if (!demandeur_id || !type_demande_id) {
      return res.status(400).json({ error: 'demandeur_id et type_demande_id sont requis' });
    }

    const numero_dossier = buildDossierNumber();
    const result = await immigrationQuery(
      `INSERT INTO dossiers
       (numero_dossier, demandeur_id, type_demande_id, pays_destination, type_visa, date_depot, statut, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [numero_dossier, demandeur_id, type_demande_id, pays_destination || null, type_visa || null, date_depot || null, statut || 'CREATION', notes || null]
    );

    res.status(201).json({ success: true, dossierId: result.insertId, numero_dossier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/voyage/immigration/rendez-vous', authenticateToken, async (req, res) => {
  try {
    const rendezVous = await immigrationQuery(`
      SELECT
        rv.*,
        d.numero_dossier,
        td.nom AS type_demande
      FROM rendez_vous rv
      JOIN dossiers d ON rv.dossier_id = d.id
      JOIN types_demandes td ON d.type_demande_id = td.id
      ORDER BY rv.date_rdv DESC, rv.id DESC
      LIMIT 200
    `);
    res.json({ rendezVous, database: process.env.IMMIGRATION_DB || 'immigration_db' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voyage/immigration/rendez-vous', authenticateToken, async (req, res) => {
  try {
    const { dossier_id, type_rdv, date_rdv, lieu, statut, notes_rdv, agent_nom } = req.body;

    if (!dossier_id || !date_rdv) {
      return res.status(400).json({ error: 'dossier_id et date_rdv sont requis' });
    }

    const numero_rdv = buildRendezVousNumber();
    const result = await immigrationQuery(
      `INSERT INTO rendez_vous
       (numero_rdv, dossier_id, type_rdv, date_rdv, lieu, statut, notes_rdv, agent_nom)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [numero_rdv, dossier_id, type_rdv || 'CONSULTATION', date_rdv, lieu || null, statut || 'PROGRAMME', notes_rdv || null, agent_nom || null]
    );

    res.status(201).json({ success: true, id: result.insertId, numero_rdv });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/voyage/stats', authenticateToken, async (req, res) => {
  try {
    const voyageStats = await voyageQuery(`
      SELECT
        (SELECT COUNT(*) FROM clients_voyage) AS totalClients,
        (SELECT COUNT(*) FROM reservations) AS totalReservations,
        (SELECT COUNT(*) FROM destinations) AS destinations,
        (SELECT COUNT(*) FROM vols) AS vols,
        (SELECT COUNT(*) FROM hotels) AS hotels,
        (SELECT COALESCE(SUM(montant_ttc), 0) FROM factures_voyage) AS chiffreAffaires
    `);
    const immigrationStats = await immigrationQuery(`
      SELECT
        (SELECT COUNT(*) FROM dossiers) AS totalDossiers,
        (SELECT COUNT(*) FROM dossiers WHERE statut = 'ACCEPTE') AS approves,
        (SELECT COUNT(*) FROM rendez_vous) AS totalRendezVous,
        (SELECT COUNT(*) FROM demandeurs) AS totalDemandeurs
    `);

    res.json({
      voyage: voyageStats[0],
      immigration: immigrationStats[0],
      databases: [process.env.VOYAGE_DB || 'voyage_db', process.env.IMMIGRATION_DB || 'immigration_db']
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
  console.log(`SERVICE VOYAGE DEMARRE sur http://localhost:${PORT}`);
});
