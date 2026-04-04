require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Services mapping
const services = {
  'auth': 'http://localhost:3002',
  'btp': 'http://localhost:3003',
  'assurances': 'http://localhost:3004',
  'communication': 'http://localhost:3005',
  'rh': 'http://localhost:3006',
  'voyage': 'http://localhost:3009', // Service unifiÃ©: Voyage + Immigration
  'logistique': 'http://localhost:3008'
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    gateway: 'OK', 
    services: Object.keys(services),
    timestamp: new Date().toISOString()
  });
});

// Auth middleware - Valide le token pour l'accÃ¨s au gateway
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) return res.status(401).json({ error: 'Token requis' });
  
  // Le gateway n'a qu'un rÃ´le de proxy - la vraie validation se fait dans chaque service
  // avec son propre JWT_SECRET
  try {
    jwt.verify(token, process.env.JWT_SECRET || 'gateway_secret_key_2026_microservice');
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalide au gateway' });
  }
};

// Routes proxy
app.use('/api/auth/**', createProxyMiddleware({ 
  target: services.auth,
  changeOrigin: true,
  pathRewrite: {'^/api/auth': '/api/auth'}
}));

app.use('/api/btp/**', authMiddleware, createProxyMiddleware({ 
  target: services.btp,
  changeOrigin: true,
  pathRewrite: {'^/api/btp': ''}
}));

app.use('/api/assurances/**', authMiddleware, createProxyMiddleware({ 
  target: services.assurances,
  changeOrigin: true,
  pathRewrite: {'^/api/assurances': ''}
}));

app.use('/api/communication/**', authMiddleware, createProxyMiddleware({ 
  target: services.communication,
  changeOrigin: true,
  pathRewrite: {'^/api/communication': ''}
}));

app.use('/api/rh/**', authMiddleware, createProxyMiddleware({ 
  target: services.rh,
  changeOrigin: true,
  pathRewrite: {'^/api/rh': ''}
}));

app.use('/api/voyage/**', authMiddleware, createProxyMiddleware({ 
  target: services.voyage,
  changeOrigin: true,
  pathRewrite: {'^/api/voyage': '/api/voyage'}
}));

app.use('/api/logistique/**', authMiddleware, createProxyMiddleware({ 
  target: services.logistique,
  changeOrigin: true,
  pathRewrite: {'^/api/logistique': ''}
}));

// Services list
app.get('/api/services', (req, res) => {
  res.json(services);
});

app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
  console.log(`\nðŸš€ API GATEWAY DÃ‰MARRÃ‰ (PORT ${PORT})`);
  console.log('ðŸ“¡ Health: http://localhost:' + PORT + '/health');
  console.log('ðŸ“‹ Services: http://localhost:' + PORT + '/api/services');
  console.log('âœ… PrÃªt !\n');
});


