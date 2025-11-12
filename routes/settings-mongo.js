const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { requireAuth, requireRole } = require('../utils/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration multer pour l'upload de logo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif)'));
  }
});

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
router.put('/', requireAuth, async (req, res) => {
  try {
    // Enlever requireRole pour permettre à tous les utilisateurs authentifiés
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
    console.error('Erreur PUT /api/settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload logo
router.post('/upload-logo', requireAuth, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    const logoUrl = '/uploads/' + req.file.filename;
    
    // Mettre à jour les settings avec le logo
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ logo: logoUrl });
    } else {
      // Supprimer l'ancien logo si existe
      if (settings.logo) {
        const oldLogoPath = path.join(__dirname, '../public', settings.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      settings.logo = logoUrl;
      settings.updatedAt = Date.now();
    }
    
    await settings.save();
    res.json({ logoUrl, message: 'Logo uploadé avec succès' });
  } catch (error) {
    console.error('Erreur upload logo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Supprimer le logo
router.delete('/logo', requireAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (settings && settings.logo) {
      // Supprimer le fichier
      const logoPath = path.join(__dirname, '../public', settings.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
      
      settings.logo = null;
      settings.updatedAt = Date.now();
      await settings.save();
    }
    
    res.json({ message: 'Logo supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression logo:', error);
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
