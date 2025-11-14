const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Route d'initialisation : crée un admin par défaut si aucun utilisateur n'existe
router.post('/init-admin', async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      return res.status(400).json({ error: 'Des utilisateurs existent déjà.' });
    }
    const { username = 'admin', password = 'admin123', fullName = 'Admin' } = req.body;
    const user = new User({ username, password, fullName, role: 'admin' });
    await user.save();
    res.json({ success: true, message: 'Admin initialisé', user: { username, fullName, role: 'admin' } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
