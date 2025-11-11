const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');

// Stocker les sessions en mémoire (pour la production, utilisez Redis)
const sessions = new Map();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Créer une session
    const sessionId = crypto.randomBytes(32).toString('hex');
    sessions.set(sessionId, {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
      createdAt: Date.now()
    });

    res.json({
      success: true,
      sessionId,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName || user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vérifier la session
router.get('/check', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.json({ authenticated: false });
  }

  const session = sessions.get(sessionId);
  res.json({
    authenticated: true,
    user: {
      id: session.userId,
      username: session.username,
      role: session.role
    }
  });
});

// Logout
router.post('/logout', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  
  if (sessionId) {
    sessions.delete(sessionId);
  }

  res.json({ success: true, message: 'Déconnexion réussie' });
});

// Middleware pour exporter les sessions
router.getSessions = () => sessions;

module.exports = router;
