const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { requireAuth } = require('../utils/auth');

// Statistiques générales
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};

    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = end;
      }
    }

    const sales = await Sale.find(dateFilter);
    
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.finalAmount, 0);
    const totalDiscount = sales.reduce((sum, sale) => sum + sale.discount, 0);

    res.json({
      totalSales,
      totalRevenue,
      totalDiscount,
      averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ventes par jour
router.get('/sales-by-day', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};

    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = end;
      }
    }

    const salesByDay = await Sale.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$finalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ 
      data: salesByDay.map(day => ({
        date: day._id,
        total: day.total,
        count: day.count
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message, data: [] });
  }
});

// Produits les plus vendus
router.get('/top-products', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Récupérer toutes les ventes avec leurs items
    const sales = await Sale.find().populate('items.productId');
    
    // Grouper les ventes par produit
    const productSales = {};
    
    for (const sale of sales) {
      if (sale.items && Array.isArray(sale.items)) {
        for (const item of sale.items) {
          const productName = item.productName;
          if (!productSales[productName]) {
            productSales[productName] = {
              name: productName,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[productName].quantity += item.quantity || 0;
          productSales[productName].revenue += item.subtotal || 0;
        }
      }
    }
    
    // Trier par quantité décroissante (les plus vendus en premier)
    const sortedProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, parseInt(limit));
    
    res.json(sortedProducts);
  } catch (error) {
    console.error('Erreur top-products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Produits les moins vendus
router.get('/worst-products', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Récupérer tous les produits
    const allProducts = await Product.find();
    
    // Récupérer toutes les ventes avec leurs items
    const sales = await Sale.find();
    
    // Calculer les ventes par produit
    const productSales = {};
    
    // Initialiser tous les produits avec 0 ventes
    for (const product of allProducts) {
      productSales[product.name] = {
        name: product.name,
        quantity: 0,
        revenue: 0
      };
    }
    
    // Ajouter les ventes réelles
    for (const sale of sales) {
      if (sale.items && Array.isArray(sale.items)) {
        for (const item of sale.items) {
          const productName = item.productName;
          if (productSales[productName]) {
            productSales[productName].quantity += item.quantity || 0;
            productSales[productName].revenue += item.subtotal || 0;
          }
        }
      }
    }
    
    // Trier par quantité croissante (les moins vendus en premier, incluant ceux à 0)
    const sortedProducts = Object.values(productSales)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, parseInt(limit));
    
    res.json(sortedProducts);
  } catch (error) {
    console.error('Erreur worst-products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ventes par méthode de paiement
router.get('/payment-methods', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};

    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = end;
      }
    }

    const paymentMethods = await Sale.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$finalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(paymentMethods.map(method => ({
      method: method._id,
      total: method.total,
      count: method.count
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Produits en rupture de stock
router.get('/low-stock', async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    
    const lowStockProducts = await Product.find({
      stock: { $lte: parseInt(threshold) }
    }).sort({ stock: 1 });

    res.json(lowStockProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ventes par catégorie
router.get('/sales-by-category', async (req, res) => {
  try {
    // Récupérer toutes les ventes avec leurs items
    const sales = await Sale.find();
    
    // Récupérer tous les produits pour avoir leurs catégories
    const products = await Product.find();
    const productCategories = {};
    for (const product of products) {
      productCategories[product.name] = product.category;
    }
    
    // Grouper par catégorie
    const categoryData = {};
    
    for (const sale of sales) {
      if (sale.items && Array.isArray(sale.items)) {
        for (const item of sale.items) {
          const category = productCategories[item.productName] || 'Autre';
          if (!categoryData[category]) {
            categoryData[category] = { total_revenue: 0, total_quantity: 0 };
          }
          categoryData[category].total_revenue += item.subtotal || 0;
          categoryData[category].total_quantity += item.quantity || 0;
        }
      }
    }
    
    const result = Object.entries(categoryData).map(([category, data]) => ({
      category,
      total_revenue: data.total_revenue,
      total_quantity: data.total_quantity
    }));
    
    res.json({ data: result });
  } catch (error) {
    console.error('Erreur sales-by-category:', error);
    res.status(500).json({ error: error.message, data: [] });
  }
});

module.exports = router;
