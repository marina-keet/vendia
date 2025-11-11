const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { requireAuth, requireRole } = require('../utils/auth');

// Route publique pour le POS - sans authentification stricte
router.get('/pos-list', (req, res) => {
  const query = 'SELECT * FROM products WHERE stock > 0 ORDER BY name ASC';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ products: rows });
  });
});

// Récupérer tous les produits (tous les rôles authentifiés)
router.get('/', requireAuth, (req, res) => {
  const { category, search } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (name LIKE ? OR barcode LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY name ASC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ products: rows });
  });
});

// Récupérer les catégories - DOIT être AVANT /:id
router.get('/meta/categories', requireAuth, (req, res) => {
  db.all('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ categories: rows.map(r => r.category) });
  });
});

// Récupérer un produit par ID
router.get('/:id', requireAuth, (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.json({ product: row });
  });
});

// Créer un nouveau produit
router.post('/', requireAuth, requireRole('admin', 'manager'), (req, res) => {
  const { name, description, price, stock, category, barcode } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Nom et prix requis' });
  }

  const query = `
    INSERT INTO products (name, description, price, stock, category, barcode)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [name, description, price, stock || 0, category, barcode], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, message: 'Produit créé avec succès' });
  });
});

// Mettre à jour un produit (admin/manager seulement)
router.put('/:id', requireAuth, requireRole('admin', 'manager'), (req, res) => {
  const { name, description, price, stock, category, barcode } = req.body;

  const query = `
    UPDATE products 
    SET name = ?, description = ?, price = ?, stock = ?, 
        category = ?, barcode = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [name, description, price, stock, category, barcode, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.json({ message: 'Produit mis à jour avec succès' });
  });
});

// Supprimer un produit (admin et manager seulement)
router.delete('/:id', requireAuth, requireRole('admin', 'manager'), (req, res) => {
  // Vérifier si le produit est utilisé dans des ventes
  db.get('SELECT COUNT(*) as count FROM sale_items WHERE product_id = ?', [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.count > 0) {
      return res.status(400).json({ 
        error: `Impossible de supprimer ce produit car il est utilisé dans ${result.count} vente(s)` 
      });
    }

    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }
      res.json({ message: 'Produit supprimé avec succès' });
    });
  });
});

// Recherche par code-barres
router.get('/search/barcode/:barcode', requireAuth, (req, res) => {
  db.get('SELECT * FROM products WHERE barcode = ?', [req.params.barcode], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ product: row || null });
  });
});

module.exports = router;
