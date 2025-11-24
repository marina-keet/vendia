const express = require('express');
const router = express.Router();
const User = require('../models/User.mysql');

// Créer un utilisateur (MySQL)
router.post('/', async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Nom d’utilisateur et mot de passe requis' });
    const user = {
      username,
      password,
      full_name,
      role
    };
    const userId = await User.createUser(user);
    res.json({ success: true, userId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Liste des utilisateurs (MySQL)
router.get('/', async (req, res) => {
  try {
    const users = await User.getUsers();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
