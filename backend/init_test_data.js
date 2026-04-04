// Script pour initialiser les données TEST dans immigration_db et voyage_db
const mysql = require('mysql2');

const auth_db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: undefined,
  database: 'auth_db'
});

const immigration_db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: undefined,
  database: 'immigration_db'
});

const voyage_db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: undefined,
  database: 'voyage_db'
});

auth_db.connect(() => console.log('✅ auth_db connectée'));
immigration_db.connect(() => console.log('✅ immigration_db connectée'));
voyage_db.connect(() => console.log('✅ voyage_db connectée'));

// ===== IMMIGRATION TEST DATA =====

console.log('\n🔄 Initialisation IMMIGRATION_DB...\n');

// 1. Demandeurs
const demandeurs_sql = `
INSERT INTO demandeurs (code_demandeur, nom, prenom, date_naissance, nationalite, email, telephone, numero_passeport, date_expiration_passeport, adresse, actif)
VALUES
('DMD-001', 'Dupont', 'Jean', '1990-05-15', 'Cameroun', 'jean.dupont@example.com', '+237682755076', 'CM123456789', '2028-12-31', '123 Rue de Paris, Yaoundé', 1),
('DMD-002', 'Martin', 'Marie', '1992-08-20', 'France', 'marie.martin@example.com', '+33612345678', 'FR987654321', '2027-06-30', '456 Avenue des Champs, Paris', 1),
('DMD-003', 'Ndong', 'Pierre', '1988-03-10', 'Gabon', 'pierre.ndong@example.com', '+24177123456', 'GA456789012', '2029-02-28', '789 Boulevard du Monde, Libreville', 1);
`;

// 2. Dossiers
const dossiers_sql = `
INSERT INTO dossiers (numero_dossier, demandeur_id, type_demande_id, pays_destination, type_visa, date_depot, statut, date_derniere_actualisation)
VALUES
('DOS-2026-0001', 1, 1, 'France', 'LONG_SEJOUR', CURDATE(), 'EN_COURS', NOW()),
('DOS-2026-0002', 2, 2, 'Allemagne', 'COURT_SEJOUR', CURDATE(), 'APPROUVE', NOW()),
('DOS-2026-0003', 3, 3, 'Canada', 'RESIDENCE_PERMANENTE', CURDATE(), 'EN_ATTENTE_DOCUMENTS', NOW());
`;

// 3. Rendez-vous
const rdv_sql = `
INSERT INTO rendez_vous (numero_rdv, dossier_id, type_rdv, date_rdv, lieu, statut)
VALUES
('RDV-2026-0001', 1, 'ENTRETIEN', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Consulat de France - Yaoundé', 'PROGRAMME'),
('RDV-2026-0002', 3, 'REMISE_DOCUMENTS', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Ambassade du Canada - Douala', 'PROGRAMME');
`;

// ===== VOYAGE TEST DATA =====

console.log('🔄 Initialisation VOYAGE_DB...\n');

// 1. Destinations
const destinations_sql = `
INSERT INTO destinations (nom, pays, continent, description, saison_meilleure, prix_moyen, image_url)
VALUES
('Paris', 'France', 'Europe', 'La Ville Lumière - Monuments, musées et gastronomie', 'Mai-Septembre', 1200.00, 'https://example.com/paris.jpg'),
('Montréal', 'Canada', 'Amérique du Nord', 'Métropole québécoise - Culture française en Amérique', 'Juin-Octobre', 1100.00, 'https://example.com/montreal.jpg'),
('Douala', 'Cameroun', 'Afrique', 'Porte de l\'Afrique - Commerce, culture et vie nocturne', 'Décembre-Février', 600.00, 'https://example.com/douala.jpg');
`;

// 2. Clients Voyage
const clients_voyage_sql = `
INSERT INTO clients_voyage (nom, prenom, email, telephone, adresse, date_inscription)
VALUES
('Dupont', 'Jean', 'jean.dupont@example.com', '+237682755076', '123 Rue de Paris, Yaoundé', NOW()),
('Martin', 'Marie', 'marie.martin@example.com', '+33612345678', '456 Avenue des Champs, Paris', NOW()),
('Ndong', 'Pierre', 'pierre.ndong@example.com', '+24177123456', '789 Boulevard du Monde, Libreville', NOW());
`;

// 3. Vols
const vols_sql = `
INSERT INTO vols (code_vol, compagnie, aeroportdepart, aeroportunrivee, datedepart, datearrivee, prix, places_disponibles)
VALUES
('AF123', 'Air France', 'CMN', 'CDG', DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 11 DAY), 650.00, 120),
('AC456', 'Air Canada', 'CDG', 'YUL', DATE_ADD(CURDATE(), INTERVAL 15 DAY), DATE_ADD(CURDATE(), INTERVAL 17 DAY), 800.00, 85),
('SN789', 'Brussels Airlines', 'YUL', 'CMN', DATE_ADD(CURDATE(), INTERVAL 25 DAY), DATE_ADD(CURDATE(), INTERVAL 27 DAY), 750.00, 95);
`;

// 4. Héhels
const hotels_sql = `
INSERT INTO hotels (nom, destination_id, ville, etoiles, prix_par_nuit, description, image_url)
VALUES
('Le Marais Boutique', 1, 'Paris', 4, 120.00, 'Hôtel 4 étoiles en plein cœur du Marais', 'https://example.com/hotelmarais.jpg'),
('Fairmont Royal York', 2, 'Montréal', 5, 220.00, 'Luxe au cœur du centre-ville', 'https://example.com/fairmont.jpg'),
('Hilton Douala', 3, 'Douala', 4, 95.00, 'Confort moderne au cœur de Douala', 'https://example.com/hilton-douala.jpg');
`;

// 5. Réservations
const reservations_sql = `
INSERT INTO reservations (numero_reservation, client_id, destination_id, vol_id, datedepart, datearrivee, statut)
VALUES
('RES-2026-001', 1, 1, 1, DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'CONFIRMEE'),
('RES-2026-002', 2, 2, 2, DATE_ADD(CURDATE(), INTERVAL 15 DAY), DATE_ADD(CURDATE(), INTERVAL 23 DAY), 'CONFIRMEE'),
('RES-2026-003', 3, 3, 3, DATE_ADD(CURDATE(), INTERVAL 25 DAY), DATE_ADD(CURDATE(), INTERVAL 32 DAY), 'EN_ATTENTE');
`;

// Exécuter les insertions
let completed = 0;

pagination_db.query(demandeurs_sql, (err) => {
  if (err) console.log('❌ Demandeurs:', err.message);
  else console.log('✅ 3 demandeurs insérés');
  completed++;
  check_completion();
});

immigration_db.query(dossiers_sql, (err) => {
  if (err) console.log('❌ Dossiers:', err.message);
  else console.log('✅ 3 dossiers insérés');
  completed++;
  check_completion();
});

immigration_db.query(rdv_sql, (err) => {
  if (err) console.log('❌ RDV:', err.message);
  else console.log('✅ 2 rendez-vous insérés');
  completed++;
  check_completion();
});

voyage_db.query(destinations_sql, (err) => {
  if (err) console.log('❌ Destinations:', err.message);
  else console.log('✅ 3 destinations insérées');
  completed++;
  check_completion();
});

voyage_db.query(clients_voyage_sql, (err) => {
  if (err) console.log('❌ Clients Voyage:', err.message);
  else console.log('✅ 3 clients voyage insérés');
  completed++;
  check_completion();
});

voyage_db.query(vols_sql, (err) => {
  if (err) console.log('❌ Vols:', err.message);
  else console.log('✅ 3 vols insérés');
  completed++;
  check_completion();
});

voyage_db.query(hotels_sql, (err) => {
  if (err) console.log('❌ Hôtels:', err.message);
  else console.log('✅ 3 hôtels insérés');
  completed++;
  check_completion();
});

voyage_db.query(reservations_sql, (err) => {
  if (err) console.log('❌ Réservations:', err.message);
  else console.log('✅ 3 réservations insérées');
  completed++;
  check_completion();
});

function check_completion() {
  if (completed === 8) {
    console.log('\n✅ INITIALISATION COMPLÈTE!');
    console.log('\n📊 Données insérées:');
    console.log('  Immigration: 3 demandeurs + 3 dossiers + 2 RDV');
    console.log('  Voyage: 3 destinations + 3 clients + 3 vols + 3 hôtels + 3 réservations');

    auth_db.end();
    immigration_db.end();
    voyage_db.end();
    process.exit(0);
  }
}
