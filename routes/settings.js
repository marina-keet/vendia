const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { requireAuth, requireRole } = require('../utils/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de multer pour l'upload de logo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
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
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (jpg, png, gif, svg)'));
    }
  }
});

// Récupérer tous les paramètres
router.get('/', requireAuth, requireRole('admin', 'manager'), (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM settings WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY category, key';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Récupérer un paramètre spécifique
router.get('/:key', (req, res) => {
  db.get('SELECT * FROM settings WHERE key = ?', [req.params.key], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Paramètre non trouvé' });
    }
    res.json({ setting: row });
  });
});

// Mettre à jour un paramètre
router.put('/:key', requireAuth, requireRole('admin'), (req, res) => {
  const { value } = req.body;

  if (value === undefined) {
    return res.status(400).json({ error: 'Valeur requise' });
  }

  db.run(`
    UPDATE settings 
    SET value = ?, updated_at = CURRENT_TIMESTAMP
    WHERE key = ?
  `, [value, req.params.key], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Paramètre non trouvé' });
    }
    res.json({ message: 'Paramètre mis à jour avec succès' });
  });
});

// Mettre à jour plusieurs paramètres en une fois
router.post('/bulk-update', requireAuth, requireRole('admin'), (req, res) => {
  const { settings } = req.body;

  if (!settings || !Array.isArray(settings)) {
    return res.status(400).json({ error: 'Format invalide' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    const stmt = db.prepare(`
      UPDATE settings 
      SET value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE key = ?
    `);

    let hasError = false;

    settings.forEach(({ key, value }) => {
      stmt.run([value, key], (err) => {
        if (err) hasError = true;
      });
    });

    stmt.finalize(() => {
      if (hasError) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
      }

      db.run('COMMIT');
      res.json({ message: 'Paramètres mis à jour avec succès' });
    });
  });
});

// Réinitialiser un paramètre à sa valeur par défaut
router.post('/:key/reset', requireAuth, requireRole('admin'), (req, res) => {
  // Cette route nécessiterait une table de valeurs par défaut
  // Pour l'instant, retourner une erreur non implémentée
  res.status(501).json({ error: 'Fonctionnalité non implémentée' });
});

// Convertir un montant entre devises
router.post('/convert', requireAuth, (req, res) => {
  const { amount, fromCurrency, toCurrency } = req.body;

  if (!amount || !fromCurrency || !toCurrency) {
    return res.status(400).json({ error: 'amount, fromCurrency et toCurrency requis' });
  }

  // Récupérer le taux de change
  db.get(`SELECT value FROM settings WHERE key = 'exchange_rate'`, (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const exchangeRate = parseFloat(row?.value || 2500);
    let convertedAmount;

    if (fromCurrency === toCurrency) {
      convertedAmount = amount;
    } else if (fromCurrency === 'FC' && toCurrency === 'USD') {
      convertedAmount = amount / exchangeRate;
    } else if (fromCurrency === 'USD' && toCurrency === 'FC') {
      convertedAmount = amount * exchangeRate;
    } else {
      return res.status(400).json({ error: 'Conversion non supportée' });
    }

    res.json({
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount: parseFloat(convertedAmount.toFixed(2)),
      convertedCurrency: toCurrency,
      exchangeRate: exchangeRate
    });
  });
});

// Récupérer les paramètres de devise
router.get('/currency/info', (req, res) => {
  db.all(`
    SELECT key, value FROM settings 
    WHERE key IN ('currency', 'secondary_currency', 'exchange_rate')
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });

    res.json({
      primaryCurrency: settings.currency || 'FC',
      secondaryCurrency: settings.secondary_currency || 'USD',
      exchangeRate: parseFloat(settings.exchange_rate) || 2500,
      availableCurrencies: ['FC', 'USD'],
      symbols: {
        FC: 'FC',
        USD: '$'
      }
    });
  });
});

// Upload de logo
router.post('/upload-logo', requireAuth, requireRole('admin'), upload.single('logo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier fourni' });
  }

  const logoPath = path.join(__dirname, '..', 'public', 'uploads', req.file.filename);
  const logoUrl = `/uploads/${req.file.filename}`;

  // Supprimer l'ancien logo s'il existe
  db.get(`SELECT value FROM settings WHERE key = 'logo'`, (err, row) => {
    if (row && row.value && row.value.startsWith('/uploads/')) {
      const oldLogoPath = path.join(__dirname, '..', 'public', row.value);
      if (fs.existsSync(oldLogoPath)) {
        try {
          fs.unlinkSync(oldLogoPath);
        } catch (e) {
          console.error('Erreur suppression ancien logo:', e);
        }
      }
    }

    // Mettre à jour le paramètre logo dans la base
    db.run(`
      UPDATE settings 
      SET value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE key = 'logo'
    `, [logoUrl], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Si le paramètre n'existe pas, le créer
      if (this.changes === 0) {
        db.run(`
          INSERT INTO settings (key, value, category)
          VALUES ('logo', ?, 'branding')
        `, [logoUrl], (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ 
            message: 'Logo uploadé avec succès',
            logoUrl: logoUrl
          });
        });
      } else {
        res.json({ 
          message: 'Logo uploadé avec succès',
          logoUrl: logoUrl
        });
      }
    });
  });
});

// Supprimer le logo
router.delete('/logo', requireAuth, requireRole('admin'), (req, res) => {
  db.get(`SELECT value FROM settings WHERE key = 'logo'`, (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (row && row.value) {
      const logoPath = path.join(__dirname, '..', 'public', row.value);
      if (fs.existsSync(logoPath)) {
        try {
          fs.unlinkSync(logoPath);
        } catch (e) {
          console.error('Erreur suppression logo:', e);
        }
      }

      db.run(`UPDATE settings SET value = NULL WHERE key = 'logo'`, (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Logo supprimé avec succès' });
      });
    } else {
      res.json({ message: 'Aucun logo à supprimer' });
    }
  });
});

module.exports = router;

