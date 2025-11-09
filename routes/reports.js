const express = require('express');
const router = express.Router();
const db = require('../database/init');

// Statistiques globales
router.get('/stats', (req, res) => {
  const stats = {};

  // Total des ventes aujourd'hui
  db.get(`
    SELECT COUNT(*) as count, COALESCE(SUM(final_amount), 0) as total
    FROM sales
    WHERE DATE(created_at) = DATE('now')
  `, (err, todaySales) => {
    if (err) return res.status(500).json({ error: err.message });

    stats.today = todaySales;

    // Total des ventes ce mois
    db.get(`
      SELECT COUNT(*) as count, COALESCE(SUM(final_amount), 0) as total
      FROM sales
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `, (err, monthSales) => {
      if (err) return res.status(500).json({ error: err.message });

      stats.month = monthSales;

      // Produits en rupture de stock
      db.get(`
        SELECT COUNT(*) as count
        FROM products
        WHERE stock <= 5
      `, (err, lowStock) => {
        if (err) return res.status(500).json({ error: err.message });

        stats.lowStock = lowStock.count;

        // Total des produits
        db.get(`
          SELECT COUNT(*) as count, COALESCE(SUM(stock), 0) as totalStock
          FROM products
        `, (err, products) => {
          if (err) return res.status(500).json({ error: err.message });

          stats.products = products;

          res.json({ stats });
        });
      });
    });
  });
});

// Ventes par jour (30 derniers jours)
router.get('/sales-by-day', (req, res) => {
  const days = req.query.days || 30;

  const query = `
    SELECT DATE(created_at) as date, 
           COUNT(*) as count, 
           COALESCE(SUM(final_amount), 0) as total
    FROM sales
    WHERE DATE(created_at) >= DATE('now', '-${days} days')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});

// Ventes par méthode de paiement
router.get('/payment-methods', (req, res) => {
  const query = `
    SELECT payment_method, 
           COUNT(*) as count, 
           COALESCE(SUM(final_amount), 0) as total
    FROM sales
    GROUP BY payment_method
    ORDER BY total DESC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});

// Produits les plus vendus
router.get('/top-products', (req, res) => {
  const limit = req.query.limit || 10;
  const { startDate, endDate } = req.query;

  let query = `
    SELECT si.product_id, si.product_name,
           SUM(si.quantity) as total_quantity,
           COALESCE(SUM(si.subtotal), 0) as total_revenue,
           COUNT(DISTINCT si.sale_id) as times_sold
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    WHERE 1=1
  `;
  const params = [];

  if (startDate) {
    query += ' AND DATE(s.created_at) >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND DATE(s.created_at) <= ?';
    params.push(endDate);
  }

  query += `
    GROUP BY si.product_id, si.product_name
    ORDER BY total_quantity DESC
    LIMIT ?
  `;
  params.push(limit);

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ products: rows });
  });
});

// Produits les moins vendus
router.get('/worst-products', (req, res) => {
  const limit = req.query.limit || 10;
  const { startDate, endDate } = req.query;

  let query = `
    SELECT si.product_id, si.product_name,
           SUM(si.quantity) as total_quantity,
           COALESCE(SUM(si.subtotal), 0) as total_revenue,
           COUNT(DISTINCT si.sale_id) as times_sold
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    WHERE 1=1
  `;
  const params = [];

  if (startDate) {
    query += ' AND DATE(s.created_at) >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND DATE(s.created_at) <= ?';
    params.push(endDate);
  }

  query += `
    GROUP BY si.product_id, si.product_name
    ORDER BY total_quantity ASC
    LIMIT ?
  `;
  params.push(limit);

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ products: rows });
  });
});

// Ventes par catégorie
router.get('/sales-by-category', (req, res) => {
  const query = `
    SELECT p.category,
           SUM(si.quantity) as total_quantity,
           COALESCE(SUM(si.subtotal), 0) as total_revenue
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    WHERE p.category IS NOT NULL
    GROUP BY p.category
    ORDER BY total_revenue DESC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});

// Rapport détaillé
router.get('/detailed', (req, res) => {
  const { startDate, endDate } = req.query;
  let query = `
    SELECT s.*, 
           GROUP_CONCAT(si.product_name || ' (x' || si.quantity || ')', ', ') as items
    FROM sales s
    LEFT JOIN sale_items si ON s.id = si.sale_id
    WHERE 1=1
  `;
  const params = [];

  if (startDate) {
    query += ' AND DATE(s.created_at) >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND DATE(s.created_at) <= ?';
    params.push(endDate);
  }

  query += ' GROUP BY s.id ORDER BY s.created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ sales: rows });
  });
});

module.exports = router;
