/**
 * 🔒 COHERENCE CHECK: Database ↔ Backend ↔ Frontend
 *
 * Validates consistency between:
 * 1. Database structure
 * 2. Backend API endpoints
 * 3. Frontend API calls
 */

// DATABASE SCHEMA vs BACKEND ENDPOINTS
const COHERENCE_MAP = {
  'auth_db.users': {
    expectedColumns: [
      'id', 'nom', 'prenom', 'email', 'telephone',
      'departement', 'poste', 'role', 'password_hash',
      'actif', 'hidden', 'date_creation', 'dernier_login', 'langue', 'photo_profil'
    ],
    backendEndpoints: [
      'POST /api/auth/login',
      'POST /api/auth/request-account',
      'GET /api/auth/users (admin only)',
      'POST /api/auth/users (admin only)',
      'PATCH /api/auth/users/:id/approve (admin only)',
      'PATCH /api/auth/users/:id/reject (admin only)',
      'PATCH /api/auth/users/:id/hide (admin only)',
      'DELETE /api/auth/users/:id (admin only)',
      'GET /api/auth/me (protected)',
      'PATCH /api/auth/me (protected)'
    ],
    frontendEndpoints: [
      '/login - calls POST /api/auth/login',
      '/admin-login - calls POST /api/auth/login',
      '/register - calls POST /api/auth/request-account',
      '/dashboard - calls GET /api/auth/me (protected)',
      '/admin - calls GET /api/auth/users (admin only)'
    ]
  },

  'btp_db.chantiers': {
    expectedColumns: [
      'id', 'code', 'nom', 'adresse', 'ville', 'code_postal',
      'date_debut', 'date_fin_prevue', 'date_fin_reelle',
      'budget_initial', 'budget_depense', 'statut',
      'responsable_id', 'client_id', 'description',
      'date_creation', 'date_modification'
    ],
    backendEndpoints: [
      'GET /api/chantiers',
      'POST /api/chantiers',
      'GET /api/chantiers/:id',
      'PUT /api/chantiers/:id',
      'DELETE /api/chantiers/:id'
    ],
    frontendEndpoints: [
      '/dashboard/btp/chantiers - lists all',
      '/dashboard/btp/chantiers/nuevo - creates new',
      '/dashboard/btp/chantiers/[id] - shows detail',
      '/dashboard/btp/chantiers/[id]/edit - edits'
    ]
  },

  'voyage_db.clients': {
    expectedColumns: [
      'id', 'nom', 'prenom', 'email', 'telephone',
      'adresse', 'ville', 'code_postal', 'pays',
      'date_inscription', 'statut'
    ],
    backendEndpoints: [
      'GET /api/voyage/clients',
      'POST /api/voyage/clients',
      'GET /api/voyage/clients/:id',
      'PUT /api/voyage/clients/:id'
    ]
  },

  'immigration_db.demandeurs': {
    expectedColumns: [
      'id', 'nom', 'prenom', 'email', 'telephone',
      'date_naissance', 'nationalite', 'statut_contrat',
      'date_inscription', 'statut'
    ],
    backendEndpoints: [
      'GET /api/immigration/demandeurs',
      'POST /api/immigration/demandeurs',
      'GET /api/immigration/demandeurs/:id'
    ]
  },

  'logistique_db.transports': {
    expectedColumns: [
      'id', 'code', 'type_transport', 'marque', 'modele',
      'immatriculation', 'capacite', 'statut',
      'date_acquisition', 'date_maintenance_prevue'
    ],
    backendEndpoints: [
      'GET /api/logistique/transports',
      'POST /api/logistique/transports',
      'GET /api/logistique/transports/:id',
      'PUT /api/logistique/transports/:id'
    ]
  }
};

// IMPORT VALIDATION
const API_IMPORTS_FRONTEND = {
  'frontend/src/services/api/auth.api.ts': {
    expectations: [
      'login(email, password)',
      'requestAccount(data)',
      'getUsers()',
      'approveUser(id)',
      'changePassword(current, new)'
    ]
  },
  'frontend/src/services/api/btp.api.ts': {
    expectations: [
      'getChantiers()',
      'getChantier(id)',
      'createChantier(data)',
      'updateChantier(id, data)',
      'deleteChantier(id)',
      'getOuvriers()',
      'createOuvrier(data)'
    ]
  },
  'frontend/src/services/api/voyage.api.ts': {
    expectations: [
      'getDestinations()',
      'getClients()',
      'getReservations()',
      'createReservation(data)'
    ]
  }
};

// ERROR BOUNDARY REQUIREMENTS
const ERROR_BOUNDARIES_REQUIRED = {
  '/admin': {
    description: 'Admin portal - errors must not affect user portal',
    shouldCatch: ['auth errors', 'user management errors', 'notification errors'],
    shouldNotAffect: ['/login', '/dashboard', '/register']
  },
  '/login': {
    description: 'User login - errors must not affect admin',
    shouldCatch: ['auth errors', 'password errors'],
    shouldNotAffect: ['/admin-login', '/admin']
  },
  '/dashboard/btp': {
    description: 'BTP module - errors isolated to BTP',
    shouldCatch: ['chantiers errors', 'ouvriers errors'],
    shouldNotAffect: ['/dashboard/voyage', '/dashboard/immigration']
  },
  '/dashboard/voyage': {
    description: 'Voyage module - errors isolated to voyage',
    shouldCatch: ['clients errors', 'destinations errors'],
    shouldNotAffect: ['/dashboard/btp', '/dashboard/immigration']
  }
};

module.exports = {
  COHERENCE_MAP,
  API_IMPORTS_FRONTEND,
  ERROR_BOUNDARIES_REQUIRED
};
