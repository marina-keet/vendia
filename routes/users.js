const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { requireAuth, requireRole, hashPassword } = require('../utils/auth');

// Récupérer tous les utilisateurs (admin/manager seulement)
router.get('/', requireAuth, requireRole('admin', 'manager'), (req, res) => {
  db.all(`
    SELECT id, username, full_name, email, role, phone, is_active, created_at, last_login
    FROM users
    ORDER BY created_at DESC
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Créer un utilisateur (admin seulement)
router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const { username, password, full_name, email, role = 'cashier', phone } = req.body;

  if (!username || !password || !full_name) {
    return res.status(400).json({ error: 'Username, password et full_name requis' });
  }

  const passwordHash = hashPassword(password);

  db.run(`
    INSERT INTO users (username, password, full_name, email, role, phone, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [username, passwordHash, full_name, email, role, phone, req.user.id], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Username déjà utilisé' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, message: 'Utilisateur créé avec succès' });
  });
});

// Mettre à jour un utilisateur
router.put('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const { full_name, email, role, phone, is_active } = req.body;

  db.run(`
    UPDATE users 
    SET full_name = ?, email = ?, role = ?, phone = ?, is_active = ?
    WHERE id = ?
  `, [full_name, email, role, phone, is_active ? 1 : 0, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({ message: 'Utilisateur mis à jour avec succès' });
  });
});

// Changer le mot de passe
router.put('/:id/password', requireAuth, (req, res) => {
  const { newPassword, currentPassword } = req.body;

  // Vérifier que l'utilisateur change son propre mot de passe ou est admin
  if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Mot de passe trop court (min 6 caractères)' });
  }

  // Si ce n'est pas un admin, vérifier le mot de passe actuel
  if (req.user.role !== 'admin' && currentPassword) {
    const currentHash = hashPassword(currentPassword);
    db.get('SELECT id FROM users WHERE id = ? AND password = ?', 
      [req.params.id, currentHash], (err, user) => {
        if (err || !user) {
          return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
        }
        updatePassword();
      });
  } else {
    updatePassword();
  }

  function updatePassword() {
    const newHash = hashPassword(newPassword);
    db.run('UPDATE users SET password = ? WHERE id = ?', [newHash, req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Mot de passe modifié avec succès' });
    });
  }
});

// Désactiver un utilisateur (admin seulement)
router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  // Ne pas permettre de supprimer son propre compte
  if (req.user.id === parseInt(req.params.id)) {
    return res.status(400).json({ error: 'Impossible de supprimer votre propre compte' });
  }

  db.run('UPDATE users SET is_active = 0 WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Supprimer les sessions de cet utilisateur
    db.run('DELETE FROM sessions WHERE user_id = ?', [req.params.id]);
    
    res.json({ message: 'Utilisateur désactivé avec succès' });
  });
});

// Supprimer définitivement un utilisateur (admin seulement)
router.delete('/:id/permanent', requireAuth, requireRole('admin'), (req, res) => {
  // Ne pas permettre de supprimer son propre compte
  if (req.user.id === parseInt(req.params.id)) {
    return res.status(400).json({ error: 'Impossible de supprimer votre propre compte' });
  }

  // Vérifier si l'utilisateur a des ventes
  db.get('SELECT COUNT(*) as count FROM sales WHERE user_id = ?', [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.count > 0) {
      return res.status(400).json({ 
        error: `Impossible de supprimer cet utilisateur car il a ${result.count} vente(s) associée(s). Désactivez-le plutôt.` 
      });
    }

    // Supprimer les sessions
    db.run('DELETE FROM sessions WHERE user_id = ?', [req.params.id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Supprimer l'utilisateur
      db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json({ message: 'Utilisateur supprimé définitivement' });
      });
    });
  });
});

// Statistiques d'un utilisateur
router.get('/:id/stats', requireAuth, (req, res) => {
  db.get(`
    SELECT 
      COUNT(*) as total_sales,
      COALESCE(SUM(final_amount), 0) as total_revenue,
      COALESCE(AVG(final_amount), 0) as avg_sale_value
    FROM sales
    WHERE user_id = ?
  `, [req.params.id], (err, stats) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ stats });
  });
});

module.exports = router;
