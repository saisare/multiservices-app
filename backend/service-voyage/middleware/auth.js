const jwt = require('jsonwebtoken');

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Token requis',
      service: 'service-voyage'
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('[SERVICE-VOYAGE] Token invalide:', err.message);
      return res.status(403).json({ 
        error: 'Token invalide ou expiré',
        service: 'service-voyage'
      });
    }
    req.user = user;
    next();
  });
};

// Générer un token JWT
const generateToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '24h' });
};

module.exports = { authenticateToken, generateToken };
