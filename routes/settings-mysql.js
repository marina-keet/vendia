const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings.mysql');

// Mettre à jour ou créer un paramètre (MySQL)
router.post('/', async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'Clé requise' });
    await Settings.setSetting(key, value);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un paramètre (MySQL)
router.get('/:key', async (req, res) => {
  try {
    const setting = await Settings.getSetting(req.params.key);
    res.json({ setting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer tous les paramètres (MySQL)
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getAllSettings();
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
