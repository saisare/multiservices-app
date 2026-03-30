const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Mode dev: skip auth (TODO: activer en prod)
    console.log('🔓 Auth skipped (dev mode)');
    req.user = { id: 1, role: 'admin' }; // Mock user
    return next();
    
    // Version prod (commentée):
    /*
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Token requis' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_dev');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token invalide' });
    }
    */
};

module.exports = { verifyToken };
