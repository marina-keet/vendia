const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer.mysql');

// Créer un client (MySQL)
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, address, total_purchases, visit_count } = req.body;
    if (!name) return res.status(400).json({ error: 'Le nom est requis' });
    const customer = {
      name,
      phone,
      email,
      address,
      total_purchases,
      visit_count
    };
    const customerId = await Customer.createCustomer(customer);
    res.json({ success: true, customerId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Liste des clients (MySQL)
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.getCustomers();
    res.json({ customers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
