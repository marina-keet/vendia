const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale.mysql');

// Créer une vente (MySQL)
router.post('/', async (req, res) => {
  try {
    const {
      items = [],
      paymentMethod,
      discount = 0,
      notes = '',
      customerId = null,
      customerName = 'Client anonyme',
      amountReceived = 0,
      amountReturned = 0,
      userId = null
    } = req.body;

    // Calculer le total
    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += item.quantity * item.unitPrice;
    });
    const finalAmount = totalAmount - discount;

    const sale = {
      totalAmount,
      discount,
      finalAmount,
      paymentMethod,
      status: 'completed',
      notes,
      userId,
      customerId,
      customerName,
      amountReceived,
      amountReturned
    };

    const saleId = await Sale.createSale(sale);
    res.json({ success: true, saleId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Liste des ventes (MySQL)
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.getSales();
    res.json({ sales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
