const express = require('express');
const router = express.Router();
const Product = require('../models/Product.mysql');

// Créer un produit (MySQL)
router.post('/', async (req, res) => {
  try {
    const { name, price, stock, description } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'Nom et prix requis' });
    const product = {
      name,
      price,
      stock,
      description
    };
    const productId = await Product.createProduct(product);
    res.json({ success: true, productId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Liste des produits (MySQL)
router.get('/', async (req, res) => {
  try {
    const products = await Product.getProducts();
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
