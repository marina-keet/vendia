const crypto = require('crypto');

// Stockage des sessions (importé depuis auth-mongo.js)
let sessionsStore = null;

// Initialiser le store de sessions
function initSessionStore(authRouter) {
  sessionsStore = authRouter.getSessions();
}

// Middleware d'authentification
function requireAuth(req, res, next) {
  const sessionId = req.headers['x-session-id'] || req.query.session;
  
  if (!sessionId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  // Vérifier avec le module auth s'il est disponible
  if (!sessionsStore) {
    const authRouter = require('../routes/auth-mongo');
    sessionsStore = authRouter.getSessions();
  }

  const session = sessionsStore.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ error: 'Session invalide ou expirée' });
  }

  req.user = {
    id: session.userId,
    username: session.username,
    role: session.role
  };
  
  next();
}

// Middleware pour vérifier le rôle
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    next();
  };
}

// Utilitaire : hasher un mot de passe
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

// Utilitaire : vérifier un mot de passe
function verifyPassword(password, hash, salt) {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// Utilitaire : générer une clé de session
function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  requireAuth,
  requireRole,
  hashPassword,
  verifyPassword,
  generateSessionId,
  initSessionStore
};
