require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const { authenticateToken, generateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3009;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Pool de connexion MySQL
let voyageDb, immigrationDb;

async function initializeDatabases() {
  try {
    voyageDb = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.VOYAGE_DB || 'voyage_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    immigrationDb = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.IMMIGRATION_DB || 'voyage_immigration_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connexions
    const voyageConn = await voyageDb.getConnection();
    const immigrationConn = await immigrationDb.getConnection();
    voyageConn.release();
    immigrationConn.release();

    console.log('✅ [SERVICE-VOYAGE] Connexions BD établies');
  } catch (error) {
    console.error('❌ Erreur connexion BD:', error);
    process.exit(1);
  }
}

initializeDatabases();

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.json({
    service: 'service-voyage',
    status: 'active',
    port: PORT,
    databases: [process.env.VOYAGE_DB, process.env.IMMIGRATION_DB],
    timestamp: new Date().toISOString()
  });
});

// ==================== VOYAGE ROUTES ====================

// Récupérer tous les clients voyage
app.get('/api/voyage/clients', authenticateToken, async (req, res) => {
  try {
    const [clients] = await voyageDb.query('SELECT * FROM clients LIMIT 100');
    res.json({ clients, database: 'voyage_db' });
  } catch (error) {
    console.error('Erreur voyage/clients:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les destinations voyage
app.get('/api/voyage/destinations', authenticateToken, async (req, res) => {
  try {
    const [destinations] = await voyageDb.query('SELECT * FROM destinations LIMIT 100');
    res.json({ destinations, database: 'voyage_db' });
  } catch (error) {
    console.error('Erreur voyage/destinations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les offres voyage
app.get('/api/voyage/offres', authenticateToken, async (req, res) => {
  try {
    const [offres] = await voyageDb.query('SELECT * FROM offres LIMIT 100');
    res.json({ offres, database: 'voyage_db' });
  } catch (error) {
    console.error('Erreur voyage/offres:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer nouvelle réservation voyage
app.post('/api/voyage/reservations', authenticateToken, async (req, res) => {
  try {
    const { client_id, destination_id, date_depart, date_retour, montant } = req.body;
    const [result] = await voyageDb.query(
      'INSERT INTO reservations (client_id, destination_id, date_depart, date_retour, montant, statut, date_creation) VALUES (?, ?, ?, ?, ?, "EN_ATTENTE", NOW())',
      [client_id, destination_id, date_depart, date_retour, montant]
    );
    res.json({ success: true, reservationId: result.insertId, database: 'voyage_db' });
  } catch (error) {
    console.error('Erreur création réservation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ==================== IMMIGRATION ROUTES ====================

// Récupérer tous les dossiers immigration
app.get('/api/voyage/immigration/candidates', authenticateToken, async (req, res) => {
  try {
    const [candidates] = await immigrationDb.query('SELECT * FROM candidats LIMIT 100');
    res.json({ candidates, database: 'voyage_immigration_db' });
  } catch (error) {
    console.error('Erreur immigration/candidates:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les dossiers immigration
app.get('/api/voyage/immigration/dossiers', authenticateToken, async (req, res) => {
  try {
    const [dossiers] = await immigrationDb.query('SELECT * FROM dossiers LIMIT 100');
    res.json({ dossiers, database: 'voyage_immigration_db' });
  } catch (error) {
    console.error('Erreur immigration/dossiers:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les rendez-vous immigration
app.get('/api/voyage/immigration/rendez-vous', authenticateToken, async (req, res) => {
  try {
    const [rendezVous] = await immigrationDb.query('SELECT * FROM rendez_vous LIMIT 100');
    res.json({ rendezVous, database: 'voyage_immigration_db' });
  } catch (error) {
    console.error('Erreur immigration/rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer nouveau dossier immigration
app.post('/api/voyage/immigration/dossiers', authenticateToken, async (req, res) => {
  try {
    const { candidat_id, type_visa, statut, date_depot } = req.body;
    const [result] = await immigrationDb.query(
      'INSERT INTO dossiers (candidat_id, type_visa, statut, date_depot) VALUES (?, ?, ?, ?)',
      [candidat_id, type_visa, statut || 'EN_ATTENTE', date_depot || new Date()]
    );
    res.json({ success: true, dossierId: result.insertId, database: 'voyage_immigration_db' });
  } catch (error) {
    console.error('Erreur création dossier:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ==================== DASHBOARD STATS ====================

app.get('/api/voyage/stats', authenticateToken, async (req, res) => {
  try {
    const [voyageStats] = await voyageDb.query(
      'SELECT COUNT(*) as totalClients, COUNT(DISTINCT destination_id) as destinations FROM reservations'
    );
    const [immigrationStats] = await immigrationDb.query(
      'SELECT COUNT(*) as totalDossiers, SUM(CASE WHEN statut = "APPROUVE" THEN 1 ELSE 0 END) as approves FROM dossiers'
    );

    res.json({
      voyage: voyageStats[0],
      immigration: immigrationStats[0],
      databases: ['voyage_db', 'voyage_immigration_db']
    });
  } catch (error) {
    console.error('Erreur stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ==================== DÉMARRAGE ====================

app.listen(PORT, () => {
  console.log(`\n🚀 [SERVICE-VOYAGE] DÉMARRÉ (PORT ${PORT})`);
  console.log(`📁 BD Voyage: ${process.env.VOYAGE_DB}`);
  console.log(`📁 BD Immigration: ${process.env.IMMIGRATION_DB}`);
  console.log(`✅ Prêt!\n`);
});
