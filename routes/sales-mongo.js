const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { requireAuth, requireRole } = require('../utils/auth');
const PDFDocument = require('pdfkit');

// Créer une vente
router.post('/', requireAuth, async (req, res) => {
  try {
    const { items, paymentMethod, discount = 0, notes = '', customerId = null, customerName = 'Client anonyme' } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Aucun article dans la vente' });
    }

    // Calculer le total
    let totalAmount = 0;
    const saleItems = items.map(item => {
      const subtotal = item.quantity * item.unitPrice;
      totalAmount += subtotal;
      return {
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: subtotal
      };
    });

    const finalAmount = totalAmount - discount;

    // Créer la vente
    const sale = new Sale({
      totalAmount,
      discount,
      finalAmount,
      paymentMethod,
      notes,
      userId,
      customerId,
      customerName,
      items: saleItems
    });

    await sale.save();

    // Mettre à jour le stock des produits
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    res.json({
      success: true,
      saleId: sale._id,
      message: 'Vente enregistrée avec succès'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer toutes les ventes
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod, limit = 50 } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    const sales = await Sale.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'username')
      .populate('customerId', 'name phone');

    // Formater les données pour l'API
    const formattedSales = sales.map(sale => ({
      id: sale._id,
      total_amount: sale.totalAmount,
      discount: sale.discount,
      final_amount: sale.finalAmount,
      payment_method: sale.paymentMethod,
      status: sale.status,
      notes: sale.notes,
      user_id: sale.userId?._id,
      customer_id: sale.customerId?._id,
      customer_name: sale.customerName,
      created_at: sale.createdAt
    }));

    res.json({ sales: formattedSales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les détails d'une vente
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('userId', 'username')
      .populate('customerId', 'name phone');

    if (!sale) {
      return res.status(404).json({ error: 'Vente non trouvée' });
    }

    // Formater pour l'API
    const formattedSale = {
      id: sale._id,
      total_amount: sale.totalAmount,
      discount: sale.discount,
      final_amount: sale.finalAmount,
      payment_method: sale.paymentMethod,
      status: sale.status,
      notes: sale.notes,
      user_id: sale.userId?._id,
      customer_id: sale.customerId?._id,
      customer_name: sale.customerName,
      created_at: sale.createdAt
    };

    const formattedItems = sale.items.map(item => ({
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal
    }));

    res.json({
      sale: formattedSale,
      items: formattedItems,
      customerName: sale.customerName,
      cashierName: sale.userId?.username || 'N/A'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Générer un reçu PDF
router.get('/:id/receipt', async (req, res) => {
  try {
    const Settings = require('../models/Settings');
    const sale = await Sale.findById(req.params.id).populate('userId', 'username');
    
    if (!sale) {
      return res.status(404).json({ error: 'Vente non trouvée' });
    }

    const settings = await Settings.findOne() || {};
    const currency = settings.primaryCurrency || 'FC';
    const currencySymbol = currency === 'USD' ? '$' : 'FC';

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${sale._id}.pdf`);
    doc.pipe(res);

    // En-tête
    doc.fontSize(20).text(settings.companyName || 'VENDIA Commerce', { align: 'center' });
    doc.fontSize(10).text(settings.companyAddress || '', { align: 'center' });
    doc.text(settings.companyPhone || '', { align: 'center' });
    doc.moveDown();

    // Informations de la vente
    doc.fontSize(16).text(`Reçu N° ${sale._id}`, { align: 'center' });
    doc.fontSize(10).text(`Date: ${new Date(sale.createdAt).toLocaleString('fr-FR')}`, { align: 'center' });
    doc.text(`Caissier: ${sale.userId?.username || 'N/A'}`, { align: 'center' });
    doc.text(`Client: ${sale.customerName}`, { align: 'center' });
    doc.moveDown();

    // Ligne de séparation
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Articles
    doc.fontSize(12).text('Articles:', { underline: true });
    doc.moveDown(0.5);

    sale.items.forEach(item => {
      doc.fontSize(10)
        .text(`${item.productName}`, 50, doc.y, { continued: true })
        .text(`${item.quantity} x ${item.unitPrice} ${currencySymbol}`, 300, doc.y, { continued: true })
        .text(`${item.subtotal} ${currencySymbol}`, 450, doc.y, { align: 'right' });
      doc.moveDown(0.5);
    });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Totaux
    doc.fontSize(12)
      .text(`Sous-total: ${sale.totalAmount} ${currencySymbol}`, { align: 'right' });
    
    if (sale.discount > 0) {
      doc.text(`Remise: -${sale.discount} ${currencySymbol}`, { align: 'right' });
    }
    
    doc.fontSize(14).font('Helvetica-Bold')
      .text(`TOTAL: ${sale.finalAmount} ${currencySymbol}`, { align: 'right' });

    doc.moveDown();
    doc.fontSize(10).font('Helvetica')
      .text(`Paiement: ${sale.paymentMethod}`, { align: 'center' });

    // Pied de page
    doc.moveDown(2);
    doc.fontSize(10).text(settings.receiptFooter || 'Merci de votre visite!', { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer une vente (admin uniquement)
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ error: 'Vente non trouvée' });
    }
    
    // Optionnel: restaurer le stock
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } }
      );
    }
    
    res.json({ message: 'Vente supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
