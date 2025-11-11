const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { requireAuth, requireRole } = require('../utils/auth');

// Récupérer les paramètres
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour les paramètres
router.put('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
      settings.updatedAt = Date.now();
    }
    
    await settings.save();
    res.json({ settings, message: 'Paramètres mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour obtenir les infos de devise (pour compatibilité)
router.get('/currency/info', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }
    
    res.json({
      primaryCurrency: settings.primaryCurrency || 'FC',
      exchangeRate: 2500 // Taux de change FC vers USD (exemple)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
