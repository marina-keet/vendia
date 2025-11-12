const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { requireAuth } = require('../utils/auth');

// Récupérer tous les clients
router.get('/', requireAuth, async (req, res) => {
  try {
    const Sale = require('../models/Sale');
    const customers = await Customer.find().sort({ name: 1 });
    
    // Enrichir avec la date de première vente
    const enrichedCustomers = await Promise.all(customers.map(async (customer) => {
      const customerObj = customer.toObject();
      
      // Trouver la première vente du client
      const firstSale = await Sale.findOne({ customer_id: customer._id.toString() })
        .sort({ created_at: 1 })
        .select('created_at');
      
      // Utiliser la date de première vente, sinon la date de création du client
      customerObj.member_since = firstSale ? firstSale.created_at : customer.created_at;
      
      return customerObj;
    }));
    
    res.json(enrichedCustomers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les statistiques d'un client (DOIT ÊTRE AVANT /:id)
router.get('/:id/stats', requireAuth, async (req, res) => {
  try {
    const Sale = require('../models/Sale');
    
    const sales = await Sale.find({ customer_id: req.params.id });
    
    const totalPurchases = sales.reduce((sum, sale) => sum + (sale.final_amount || 0), 0);
    const totalSales = sales.length;
    
    res.json({
      totalPurchases,
      totalSales,
      lastPurchases: sales.slice(0, 5).map(s => ({
        id: s.id,
        created_at: s.created_at,
        final_amount: s.final_amount
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un client par ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    res.json({ customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un client
router.post('/', requireAuth, async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.json({ customer, message: 'Client créé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un client
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!customer) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    res.json({ customer, message: 'Client mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un client
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin ou manager
    if (req.session.user.role !== 'admin' && req.session.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès refusé. Seuls les admins et gérants peuvent supprimer des clients.' });
    }

    const customer = await Customer.findByIdAndDelete(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    res.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
