const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { requireAuth, requireRole } = require('../utils/auth');

// Récupérer tous les clients
router.get('/', requireAuth, (req, res) => {
  const { search, sortBy = 'name' } = req.query;
  let query = 'SELECT * FROM customers WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ` ORDER BY ${sortBy} ASC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Récupérer un client par ID
router.get('/:id', requireAuth, (req, res) => {
  db.get('SELECT * FROM customers WHERE id = ?', [req.params.id], (err, customer) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!customer) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Récupérer l'historique des achats
    db.all(`
      SELECT s.*, COUNT(si.id) as items_count
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE s.customer_id = ?
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT 20
    `, [req.params.id], (err, sales) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        customer: customer,
        sales_history: sales || []
      });
    });
  });
});

// Créer un client
router.post('/', requireAuth, (req, res) => {
  const { name, email, phone, address, notes } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Nom requis' });
  }

  db.run(`
    INSERT INTO customers (name, email, phone, address, notes)
    VALUES (?, ?, ?, ?, ?)
  `, [name, email, phone, address, notes], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, message: 'Client créé avec succès' });
  });
});

// Mettre à jour un client
router.put('/:id', requireAuth, (req, res) => {
  const { name, email, phone, address, notes } = req.body;

  db.run(`
    UPDATE customers 
    SET name = ?, email = ?, phone = ?, address = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [name, email, phone, address, notes, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    res.json({ message: 'Client mis à jour avec succès' });
  });
});

// Supprimer un client (admin seulement)
router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  // Vérifier si le client a des ventes
  db.get('SELECT COUNT(*) as count FROM sales WHERE customer_id = ?', [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.count > 0) {
      return res.status(400).json({ 
        error: `Impossible de supprimer ce client car il a ${result.count} vente(s) associée(s)` 
      });
    }

    db.run('DELETE FROM customers WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Client non trouvé' });
      }
      res.json({ message: 'Client supprimé avec succès' });
    });
  });
});

// Statistiques d'un client
router.get('/:id/stats', requireAuth, (req, res) => {
  db.get(`
    SELECT 
      COUNT(*) as total_orders,
      COALESCE(SUM(final_amount), 0) as total_spent,
      COALESCE(AVG(final_amount), 0) as avg_order_value,
      MAX(created_at) as last_purchase
    FROM sales
    WHERE customer_id = ?
  `, [req.params.id], (err, stats) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ stats });
  });
});

module.exports = router;
