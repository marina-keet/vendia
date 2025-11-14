const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { requireAuth, requireRole } = require('../utils/auth');
const PDFDocument = require('pdfkit');

// Créer une vente
router.post('/', requireAuth, async (req, res) => {
  try {
    const { items, paymentMethod, discount = 0, notes = '', customerId = null, customerName = 'Client anonyme', amountReceived = 0, amountReturned = 0 } = req.body;
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
      amountReceived,
      amountReturned,
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

    // --- Loyalty: ajouter des points au client si activé et si client fourni ---
    try {
      if (customerId) {
        const Settings = require('../models/Settings');
        const settings = await Settings.findOne() || {};

        if (settings.loyaltyEnabled) {
          // Points = finalAmount * loyaltyPointsPerCurrency
          const pointsPerCurrency = parseFloat(settings.loyaltyPointsPerCurrency) || 0;
          // Use finalAmount as-is (assumes same currency as loyalty settings)
          const rawPoints = (finalAmount || 0) * pointsPerCurrency;
          const pointsEarned = Math.floor(rawPoints);

          if (pointsEarned > 0) {
            const Customer = require('../models/Customer');
            await Customer.findByIdAndUpdate(customerId, {
              $inc: {
                loyalty_points: pointsEarned,
                total_purchases: finalAmount || 0,
                visit_count: 1
              }
            });
          } else {
            // Still increment purchases/visits even if 0 points
            const Customer = require('../models/Customer');
            await Customer.findByIdAndUpdate(customerId, {
              $inc: { total_purchases: finalAmount || 0, visit_count: 1 }
            });
          }
        } else {
          // Loyalty disabled: still update total_purchases and visit_count
          const Customer = require('../models/Customer');
          await Customer.findByIdAndUpdate(customerId, {
            $inc: { total_purchases: finalAmount || 0, visit_count: 1 }
          });
        }
      }
    } catch (err) {
      // Non bloquant: log et continuer
      console.error('Erreur loyalty update:', err);
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
      amount_received: sale.amountReceived,
      amount_returned: sale.amountReturned,
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
      amount_received: sale.amountReceived,
      amount_returned: sale.amountReturned,
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

    let yPosition = 50;

    // En-tête personnalisé
    if (settings.receiptHeader) {
      doc.fontSize(12).fillColor('#2563EB').text(settings.receiptHeader, { align: 'center' });
      doc.moveDown(0.5);
    }

    // Logo (si disponible et activé)
    if (settings.receiptShowLogo && settings.logo) {
      // Note: Pour afficher le logo, il faudrait le chemin complet du fichier
      // doc.image(path.join(__dirname, '..', 'public', settings.logo), 250, yPosition, { width: 100 });
      // yPosition += 110;
    }

    // Nom de l'entreprise
    doc.fontSize(20).fillColor('#000000').font('Helvetica-Bold')
      .text(settings.companyName || 'Ma Boutique', { align: 'center' });
    
    // Forme juridique
    if (settings.receiptLegalForm) {
      doc.fontSize(9).fillColor('#666666').font('Helvetica-Oblique')
        .text(settings.receiptLegalForm, { align: 'center' });
    }
    
    doc.moveDown(0.3);

    // Coordonnées de l'entreprise (si activé)
    if (settings.receiptShowCompanyInfo !== false) {
      doc.fontSize(10).fillColor('#000000').font('Helvetica');
      if (settings.companyAddress) {
        doc.text(settings.companyAddress, { align: 'center' });
      }
      if (settings.companyPhone || settings.companyEmail) {
        let contactLine = '';
        if (settings.companyPhone) contactLine += `📞 ${settings.companyPhone}`;
        if (settings.companyPhone && settings.companyEmail) contactLine += ' | ';
        if (settings.companyEmail) contactLine += `✉️ ${settings.companyEmail}`;
        doc.text(contactLine, { align: 'center' });
      }
    }

    // Numéro fiscal (si activé)
    if (settings.receiptShowTaxId && settings.taxId) {
      doc.fontSize(9).fillColor('#666666')
        .text(`N° Fiscal: ${settings.taxId}`, { align: 'center' });
    }

    // RCCM et ID NAT
    if (settings.receiptRccm) {
      doc.text(`RCCM: ${settings.receiptRccm}`, { align: 'center' });
    }
    if (settings.receiptIdNat) {
      doc.text(`ID NAT: ${settings.receiptIdNat}`, { align: 'center' });
    }

    doc.moveDown();

    // Ligne de séparation
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Informations de la vente
    doc.fontSize(16).fillColor('#000000').font('Helvetica-Bold')
      .text(`Reçu N° ${sale._id}`, { align: 'center' });
    
    doc.fontSize(10).font('Helvetica')
      .text(`Date: ${new Date(sale.createdAt).toLocaleString('fr-FR')}`, { align: 'center' });
    
    // Caissier (si activé)
    if (settings.receiptShowCashier !== false) {
      doc.text(`Caissier: ${sale.userId?.username || 'N/A'}`, { align: 'center' });
    }
    
    // Client (si activé)
    if (settings.receiptShowCustomer !== false) {
      doc.text(`Client: ${sale.customerName || 'Client anonyme'}`, { align: 'center' });
    }
    
    doc.moveDown();

    // Ligne de séparation
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Articles
    doc.fontSize(12).font('Helvetica-Bold').text('Articles:', { underline: true });
    doc.moveDown(0.5);

    // En-tête du tableau
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Produit', 50, doc.y, { width: 200, continued: false });
    doc.text('Qté', 270, doc.y - 12, { width: 50, align: 'center' });
    doc.text('Prix U.', 330, doc.y - 12, { width: 80, align: 'right' });
    doc.text('Total', 430, doc.y - 12, { width: 120, align: 'right' });
    doc.moveDown(0.3);

    // Ligne sous en-tête
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    // Liste des articles
    doc.font('Helvetica');
    sale.items.forEach(item => {
      const startY = doc.y;
      doc.fontSize(10);
      doc.text(item.productName, 50, startY, { width: 200 });
      doc.text(`${item.quantity}`, 270, startY, { width: 50, align: 'center' });
      doc.text(`${item.unitPrice.toFixed(0)} ${currencySymbol}`, 330, startY, { width: 80, align: 'right' });
      doc.text(`${item.subtotal.toFixed(0)} ${currencySymbol}`, 430, startY, { width: 120, align: 'right' });
      doc.moveDown(0.7);
    });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

     // Totaux
     doc.fontSize(11).font('Helvetica');
     doc.text(`Sous-total:`, 350, doc.y, { continued: true })
       .text(`${sale.totalAmount.toFixed(0)} ${currencySymbol}`, { align: 'right' });
     if (sale.discount > 0) {
      doc.fillColor('#DC2626').text(`Remise:`, 350, doc.y, { continued: true })
        .text(`-${sale.discount.toFixed(0)} ${currencySymbol}`, { align: 'right' });
     }
     // TVA (si activée)
     if (settings.receiptShowTax && sale.taxAmount && sale.taxAmount > 0) {
      doc.fillColor('#000000').text(`TVA:`, 350, doc.y, { continued: true })
        .text(`${sale.taxAmount.toFixed(0)} ${currencySymbol}`, { align: 'right' });
     }
     doc.moveDown(0.5);
     doc.fontSize(14).font('Helvetica-Bold').fillColor('#16A34A');
     doc.text(`TOTAL:`, 350, doc.y, { continued: true })
       .text(`${sale.finalAmount.toFixed(0)} ${currencySymbol}`, { align: 'right' });
     doc.moveDown();

     // Argent reçu et rendu
     doc.fontSize(11).font('Helvetica').fillColor('#000000');
     doc.text(`Argent reçu:`, 350, doc.y, { continued: true })
       .text(`${(typeof sale.amountReceived === 'number' ? sale.amountReceived : (typeof sale.amount_received === 'number' ? sale.amount_received : 0)).toFixed(0)} ${currencySymbol}`, { align: 'right' });
     doc.text(`Argent rendu:`, 350, doc.y, { continued: true })
       .text(`${(typeof sale.amountReturned === 'number' ? sale.amountReturned : (typeof sale.amount_returned === 'number' ? sale.amount_returned : 0)).toFixed(0)} ${currencySymbol}`, { align: 'right' });
     doc.moveDown();

    // Mode de paiement (si activé)
    if (settings.receiptShowPaymentMethod !== false) {
      doc.fontSize(10).fillColor('#000000').font('Helvetica')
        .text(`Mode de paiement: ${sale.paymentMethod}`, { align: 'center' });
    }

    // Informations bancaires
    if (settings.receiptBankAccount || settings.receiptMobileMoney) {
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      
      doc.fontSize(11).font('Helvetica-Bold')
        .text('💳 Informations de paiement', { align: 'left' });
      doc.moveDown(0.3);
      
      doc.fontSize(9).font('Helvetica');
      if (settings.receiptBankName && settings.receiptBankAccount) {
        doc.text(`${settings.receiptBankName}: ${settings.receiptBankAccount}`);
      }
      if (settings.receiptMobileMoney) {
        doc.text(`📱 Mobile Money: ${settings.receiptMobileMoney}`);
      }
    }

    // Pied de page
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    doc.fontSize(11).font('Helvetica').fillColor('#000000')
      .text(settings.receiptFooter || 'Merci de votre visite!', { align: 'center' });

    // Site web et réseaux sociaux
    if (settings.receiptWebsite) {
      doc.fontSize(9).fillColor('#2563EB')
        .text(`🌐 ${settings.receiptWebsite}`, { align: 'center', link: settings.receiptWebsite });
    }
    if (settings.receiptSocial) {
      doc.fontSize(9).fillColor('#666666')
        .text(`📱 ${settings.receiptSocial}`, { align: 'center' });
    }

    // Conditions générales
    if (settings.receiptTerms) {
      doc.moveDown();
      doc.fontSize(7).fillColor('#999999').font('Helvetica-Oblique')
        .text(settings.receiptTerms, { align: 'center' });
    }

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
