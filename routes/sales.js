const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { generateReceipt } = require('../utils/receipt');
const { requireAuth } = require('../utils/auth');

// Créer une nouvelle vente
router.post('/', requireAuth, (req, res) => {
  const { items, paymentMethod, discount = 0, notes = '', customerId = null, customerName = 'Client anonyme' } = req.body;
  const userId = req.user.id; // ID de l'utilisateur connecté

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Aucun article dans la vente' });
  }

  // Calculer le total
  let totalAmount = 0;
  items.forEach(item => {
    totalAmount += item.quantity * item.unitPrice;
  });

  const finalAmount = totalAmount - discount;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Insérer la vente avec user_id, customer_id et customer_name
    const saleQuery = `
      INSERT INTO sales (total_amount, discount, final_amount, payment_method, notes, user_id, customer_id, customer_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(saleQuery, [totalAmount, discount, finalAmount, paymentMethod, notes, userId, customerId, customerName], function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }

      const saleId = this.lastID;

      // Insérer les articles vendus
      const itemStmt = db.prepare(`
        INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const updateStockStmt = db.prepare(`
        UPDATE products SET stock = stock - ? WHERE id = ?
      `);

      let hasError = false;

      items.forEach(item => {
        const subtotal = item.quantity * item.unitPrice;
        itemStmt.run([saleId, item.productId, item.productName, item.quantity, item.unitPrice, subtotal], (err) => {
          if (err) hasError = true;
        });
        updateStockStmt.run([item.quantity, item.productId], (err) => {
          if (err) hasError = true;
        });
      });

      itemStmt.finalize();
      updateStockStmt.finalize();

      if (hasError) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la vente' });
      }

      // Enregistrer le paiement
      const paymentQuery = `
        INSERT INTO payments (sale_id, method, amount)
        VALUES (?, ?, ?)
      `;

      db.run(paymentQuery, [saleId, paymentMethod, finalAmount], (err) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }

        db.run('COMMIT');

        res.json({
          success: true,
          saleId: saleId,
          message: 'Vente enregistrée avec succès'
        });
      });
    });
  });
});

// Récupérer toutes les ventes
router.get('/', (req, res) => {
  const { startDate, endDate, paymentMethod, limit = 50 } = req.query;
  let query = 'SELECT * FROM sales WHERE 1=1';
  const params = [];

  if (startDate) {
    query += ' AND DATE(created_at) >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND DATE(created_at) <= ?';
    params.push(endDate);
  }

  if (paymentMethod) {
    query += ' AND payment_method = ?';
    params.push(paymentMethod);
  }

  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(parseInt(limit));

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ sales: rows });
  });
});

// Récupérer les détails d'une vente
router.get('/:id', (req, res) => {
  const saleId = req.params.id;

  db.get('SELECT * FROM sales WHERE id = ?', [saleId], (err, sale) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!sale) {
      return res.status(404).json({ error: 'Vente non trouvée' });
    }

    db.all('SELECT * FROM sale_items WHERE sale_id = ?', [saleId], (err, items) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.get('SELECT * FROM payments WHERE sale_id = ?', [saleId], (err, payment) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Récupérer le nom du client
        let customerName = 'Client anonyme';
        const getCustomer = (callback) => {
          if (!sale.customer_id) {
            return callback();
          }
          db.get('SELECT name FROM customers WHERE id = ?', [sale.customer_id], (err, customer) => {
            if (!err && customer) {
              customerName = customer.name;
            }
            callback();
          });
        };

        // Récupérer le nom du caissier
        let cashierName = 'N/A';
        const getCashier = (callback) => {
          if (!sale.user_id) {
            return callback();
          }
          db.get('SELECT username, full_name FROM users WHERE id = ?', [sale.user_id], (err, user) => {
            if (!err && user) {
              cashierName = user.full_name || user.username;
            }
            callback();
          });
        };

        // Récupérer les deux infos puis renvoyer la réponse
        getCustomer(() => {
          getCashier(() => {
            res.json({
              sale: sale,
              items: items,
              payment: payment,
              customerName: customerName,
              cashierName: cashierName
            });
          });
        });
      });
    });
  });
});

// Générer un reçu
router.get('/:id/receipt', (req, res) => {
  const saleId = req.params.id;

  db.get('SELECT * FROM sales WHERE id = ?', [saleId], (err, sale) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!sale) {
      return res.status(404).json({ error: 'Vente non trouvée' });
    }

    db.all('SELECT * FROM sale_items WHERE sale_id = ?', [saleId], (err, items) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Générer le PDF
      generateReceipt(sale, items, (err, pdfPath) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.download(pdfPath);
      });
    });
  });
});

// Supprimer une vente (Admin uniquement)
router.delete('/:id', requireAuth, (req, res) => {
  const saleId = req.params.id;
  const userId = req.user.id;

  // Vérifier que l'utilisateur est admin
  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé. Seul l\'admin peut supprimer des factures.' });
    }

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Restaurer le stock des produits avant de supprimer
      db.all('SELECT product_id, quantity FROM sale_items WHERE sale_id = ?', [saleId], (err, items) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }

        const restoreStockStmt = db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?');
        items.forEach(item => {
          restoreStockStmt.run([item.quantity, item.product_id]);
        });
        restoreStockStmt.finalize();

        // Supprimer les enregistrements
        db.run('DELETE FROM sale_items WHERE sale_id = ?', [saleId], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }

          db.run('DELETE FROM payments WHERE sale_id = ?', [saleId], (err) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: err.message });
            }

            db.run('DELETE FROM sales WHERE id = ?', [saleId], (err) => {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
              }

              db.run('COMMIT');
              res.json({ success: true, message: 'Facture supprimée avec succès' });
            });
          });
        });
      });
    });
  });
});

// Modifier une vente (Admin uniquement)
router.put('/:id', requireAuth, (req, res) => {
  const saleId = req.params.id;
  const userId = req.user.id;
  const { items, discount, notes, customerId } = req.body;

  // Vérifier que l'utilisateur est admin
  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé. Seul l\'admin peut modifier des factures.' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Aucun article dans la vente' });
    }

    // Calculer le nouveau total
    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += item.quantity * item.unitPrice;
    });
    const finalAmount = totalAmount - (discount || 0);

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Récupérer les anciens items pour restaurer le stock
      db.all('SELECT product_id, quantity FROM sale_items WHERE sale_id = ?', [saleId], (err, oldItems) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }

        // Restaurer le stock des anciens items
        const restoreStmt = db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?');
        oldItems.forEach(item => {
          restoreStmt.run([item.quantity, item.product_id]);
        });
        restoreStmt.finalize();

        // Supprimer les anciens items
        db.run('DELETE FROM sale_items WHERE sale_id = ?', [saleId], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }

          // Insérer les nouveaux items
          const itemStmt = db.prepare(`
            INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, subtotal)
            VALUES (?, ?, ?, ?, ?, ?)
          `);

          const updateStockStmt = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

          let hasError = false;
          items.forEach(item => {
            const subtotal = item.quantity * item.unitPrice;
            itemStmt.run([saleId, item.productId, item.productName, item.quantity, item.unitPrice, subtotal], (err) => {
              if (err) hasError = true;
            });
            updateStockStmt.run([item.quantity, item.productId], (err) => {
              if (err) hasError = true;
            });
          });

          itemStmt.finalize();
          updateStockStmt.finalize();

          if (hasError) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Erreur lors de la modification de la facture' });
          }

          // Mettre à jour la vente
          const updateSaleQuery = `
            UPDATE sales 
            SET total_amount = ?, discount = ?, final_amount = ?, notes = ?, customer_id = ?
            WHERE id = ?
          `;

          db.run(updateSaleQuery, [totalAmount, discount || 0, finalAmount, notes || '', customerId, saleId], (err) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: err.message });
            }

            // Mettre à jour le paiement
            db.run('UPDATE payments SET amount = ? WHERE sale_id = ?', [finalAmount, saleId], (err) => {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
              }

              db.run('COMMIT');
              res.json({ success: true, message: 'Facture modifiée avec succès' });
            });
          });
        });
      });
    });
  });
});

module.exports = router;
