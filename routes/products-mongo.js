const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { requireAuth, requireRole } = require('../utils/auth');

// Route publique pour le POS - sans authentification stricte
router.get('/pos-list', async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer tous les produits (tous les rôles authentifiés)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ name: 1 });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les catégories - utile pour le filtrage côté client
router.get('/meta/categories', requireAuth, async (req, res) => {
  try {
    const categories = await Product.distinct('category', { category: { $ne: null } });
    res.json({ categories: categories.sort() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un produit par ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un produit (tous les rôles authentifiés)
router.post('/', requireAuth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json({ product, message: 'Produit créé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un produit (tous les rôles authentifiés)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    res.json({ product, message: 'Produit mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un produit (admin et manager seulement)
router.delete('/:id', requireAuth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
