const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { hashPassword, createSession } = require('../utils/auth');

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username et password requis' });
  }

  const passwordHash = hashPassword(password);

  db.get(`
    SELECT * FROM users 
    WHERE username = ? AND password = ? AND is_active = 1
  `, [username, passwordHash], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Mettre à jour last_login
    db.run(`UPDATE users SET last_login = datetime('now') WHERE id = ?`, [user.id]);

    // Créer une session
    createSession(db, user.id, (err, sessionId) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur création session' });
      }

      res.json({
        success: true,
        sessionId: sessionId,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          role: user.role,
          email: user.email
        }
      });
    });
  });
});

// Register - DÉSACTIVÉ - Inscription publique non autorisée
// Les comptes sont créés uniquement par les admin/manager via la page Utilisateurs
router.post('/register', (req, res) => {
  return res.status(403).json({ 
    error: 'L\'inscription publique est désactivée. Contactez un administrateur pour créer votre compte.' 
  });
});

// Logout
router.post('/logout', (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.body.sessionId;

  if (sessionId) {
    db.run('DELETE FROM sessions WHERE id = ?', [sessionId]);
  }

  res.json({ success: true, message: 'Déconnexion réussie' });
});

// Vérifier la session
router.get('/check', (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.query.session;

  if (!sessionId) {
    return res.status(401).json({ authenticated: false });
  }

  db.get(`
    SELECT s.*, u.id as user_id, u.username, u.full_name, u.role, u.email
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > datetime('now') AND u.is_active = 1
  `, [sessionId], (err, session) => {
    if (err || !session) {
      return res.status(401).json({ authenticated: false });
    }

    res.json({
      authenticated: true,
      user: {
        id: session.user_id,
        username: session.username,
        fullName: session.full_name,
        role: session.role,
        email: session.email
      }
    });
  });
});

module.exports = router;
