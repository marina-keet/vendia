const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Settings = require('../models/Settings');

// Générer rapport PDF
router.get('/generate-pdf', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Récupérer les paramètres
    const settings = await Settings.findOne();
    const managerName = settings?.managerName || 'Gérant';
    const companyName = settings?.companyName || 'Ma Boutique';
    const currencySymbol = settings?.primaryCurrency === 'USD' ? '$' : 'FC';
    
    // Récupérer les données
    let query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateTime;
      }
    }
    
    const sales = await Sale.find(query);
    const allProducts = await Product.find();
    
    // Calculer statistiques
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.finalAmount || 0), 0);
    const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Calculer produits
    const productSales = {};
    
    // Initialiser tous les produits
    for (const product of allProducts) {
      productSales[product.name] = { 
        name: product.name, 
        quantity: 0, 
        revenue: 0,
        category: product.category 
      };
    }
    
    // Ajouter ventes réelles
    for (const sale of sales) {
      if (sale.items && Array.isArray(sale.items)) {
        for (const item of sale.items) {
          if (productSales[item.productName]) {
            productSales[item.productName].quantity += item.quantity || 0;
            productSales[item.productName].revenue += item.subtotal || 0;
          }
        }
      }
    }
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
    
    const worstProducts = Object.values(productSales)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 10);
    
    const totalItems = Object.values(productSales)
      .reduce((sum, p) => sum + p.quantity, 0);
    
    // Créer le PDF
    const doc = new PDFDocument({ 
      size: 'A4', 
      margins: { top: 50, bottom: 50, left: 50, right: 50 } 
    });
    
    // Headers pour le téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=rapport-${new Date().toISOString().split('T')[0]}.pdf`);
    
    doc.pipe(res);
    
    // ========================================
    // EN-TÊTE PROFESSIONNEL
    // ========================================
    doc.save();
    doc.rect(0, 0, 595, 100).fill('#1E40AF');
    doc.restore();
    
    doc.fillColor('#FFFFFF')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('RAPPORT DE VENTES', 50, 30, { align: 'center' });
    
    doc.fontSize(16)
       .font('Helvetica')
       .text(companyName, 50, 60, { align: 'center' });
    
    doc.fillColor('#000000');
    doc.y = 120;
    
    // ========================================
    // INFORMATIONS DE GÉNÉRATION
    // ========================================
    const now = new Date();
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#6B7280')
       .text(`Généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}`, { align: 'center' });
    
    // Période analysée
    let periodeText = '';
    if (startDate && endDate) {
      periodeText = `Période : ${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`;
    } else if (startDate) {
      periodeText = `À partir du ${new Date(startDate).toLocaleDateString('fr-FR')}`;
    } else if (endDate) {
      periodeText = `Jusqu'au ${new Date(endDate).toLocaleDateString('fr-FR')}`;
    } else {
      periodeText = 'Toute la période';
    }
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#1F2937')
       .text(periodeText, { align: 'center' });
    
    doc.moveDown(2);
    
    // Ligne de séparation élégante
    doc.save();
    doc.strokeColor('#3B82F6')
       .lineWidth(2)
       .moveTo(70, doc.y)
       .lineTo(525, doc.y)
       .stroke();
    doc.restore();
    
    doc.moveDown(1.5);
    doc.fillColor('#000000');
    
    // ========================================
    // RÉSUMÉ EXÉCUTIF
    // ========================================
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#1E40AF')
       .text('RÉSUMÉ EXÉCUTIF', 70);
    
    doc.moveDown(0.3);
    
    // Ligne sous le titre
    doc.save();
    doc.strokeColor('#3B82F6')
       .lineWidth(1)
       .moveTo(70, doc.y)
       .lineTo(525, doc.y)
       .stroke();
    doc.restore();
    
    doc.moveDown(0.8);
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#1F2937');
    
    const resumeText = `${periodeText === 'Toute la période' ? 'Sur toute la période' : periodeText.replace('Période : ', 'Durant la période du ')}, l'entreprise a réalisé ${totalSales} vente${totalSales > 1 ? 's' : ''} pour un chiffre d'affaires total de ${totalRevenue.toFixed(0)} ${currencySymbol}.`;
    doc.text(resumeText, 70, doc.y, { align: 'justify', width: 455, lineGap: 5 });
    doc.moveDown(0.8);
    
    if (totalSales > 0) {
      doc.text(`Cela représente une vente moyenne de ${avgSale.toFixed(0)} ${currencySymbol} par transaction. Au total, ${totalItems} article${totalItems > 1 ? 's ont' : ' a'} été vendu${totalItems > 1 ? 's' : ''}.`, 70, doc.y, { width: 455, lineGap: 5 });
      doc.moveDown(0.8);
      
      if (topProducts.length > 0 && topProducts[0].quantity > 0) {
        const bestProduct = topProducts[0];
        doc.font('Helvetica-Bold')
           .text(`Produit phare : `, 70, doc.y, { continued: true })
           .font('Helvetica')
           .text(`"${bestProduct.name}" avec ${bestProduct.quantity} unité${bestProduct.quantity > 1 ? 's' : ''} vendue${bestProduct.quantity > 1 ? 's' : ''}, générant ${bestProduct.revenue.toFixed(0)} ${currencySymbol}.`);
      }
    }
    doc.moveDown(2);
    
    // ========================================
    // INDICATEURS CLÉS
    // ========================================
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#1E40AF')
       .text('INDICATEURS CLÉS (KPI)', 70);
    
    doc.moveDown(0.3);
    doc.save();
    doc.strokeColor('#3B82F6')
       .lineWidth(1)
       .moveTo(70, doc.y)
       .lineTo(525, doc.y)
       .stroke();
    doc.restore();
    doc.moveDown(0.8);
    
    const kpiData = [
      ['Indicateur', 'Valeur', 'Unité'],
      ['Nombre total de ventes', totalSales.toString(), 'transactions'],
      ['Chiffre d\'affaires (CA)', totalRevenue.toFixed(0), currencySymbol],
      ['Ticket moyen', avgSale.toFixed(0), currencySymbol],
      ['Articles vendus', totalItems.toString(), 'unités']
    ];
    
    drawTable(doc, kpiData, doc.y, [260, 110, 85]);
    doc.moveDown(2.5);
    
    // ========================================
    // MEILLEURES VENTES
    // ========================================
    doc.addPage();
    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#1E40AF')
       .text('MEILLEURES VENTES (TOP 10)', 70);
    
    doc.moveDown(0.3);
    doc.save();
    doc.strokeColor('#3B82F6')
       .lineWidth(1)
       .moveTo(70, doc.y)
       .lineTo(525, doc.y)
       .stroke();
    doc.restore();
    doc.moveDown(0.8);
    
    const topData = [['Rang', 'Produit', 'Quantité', 'Revenu', 'Part CA']];
    topProducts.forEach((product, index) => {
      const partCA = totalRevenue > 0 ? ((product.revenue / totalRevenue) * 100).toFixed(1) : '0.0';
      topData.push([
        (index + 1).toString(),
        product.name.substring(0, 30),
        product.quantity.toString(),
        product.revenue.toFixed(0) + ' ' + currencySymbol,
        partCA + '%'
      ]);
    });
    
    drawTable(doc, topData, doc.y, [45, 220, 65, 90, 55]);
    doc.moveDown(2.5);
    
    // ========================================
    // PRODUITS À FAIBLE ROTATION
    // ========================================
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#DC2626')
       .text('PRODUITS À FAIBLE ROTATION', 70);
    
    doc.moveDown(0.3);
    doc.save();
    doc.strokeColor('#EF4444')
       .lineWidth(1)
       .moveTo(70, doc.y)
       .lineTo(525, doc.y)
       .stroke();
    doc.restore();
    doc.moveDown(0.8);
    
    const worstData = [['Rang', 'Produit', 'Quantité', 'Revenu', 'Statut']];
    worstProducts.forEach((product, index) => {
      const status = product.quantity === 0 ? 'NON VENDU' : 'FAIBLE';
      worstData.push([
        (index + 1).toString(),
        product.name.substring(0, 30),
        product.quantity.toString(),
        product.revenue.toFixed(0) + ' ' + currencySymbol,
        status
      ]);
    });
    
    drawTable(doc, worstData, doc.y, [45, 220, 65, 90, 55]);
    doc.moveDown(2.5);
    
    // ========================================
    // RECOMMANDATIONS
    // ========================================
    doc.addPage();
    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#059669')
       .text('RECOMMANDATIONS STRATÉGIQUES', 70);
    
    doc.moveDown(0.3);
    doc.save();
    doc.strokeColor('#10B981')
       .lineWidth(1)
       .moveTo(70, doc.y)
       .lineTo(525, doc.y)
       .stroke();
    doc.restore();
    doc.moveDown(0.8);
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#1F2937');
    
    if (topProducts.length > 0 && topProducts[0].quantity > 0) {
      doc.font('Helvetica-Bold')
         .fillColor('#059669')
         .text('POINT FORT', 70, doc.y);
      
      doc.font('Helvetica')
         .fillColor('#1F2937')
         .text(`Le produit "${topProducts[0].name}" démontre une excellente performance.`, 70, doc.y, { width: 455, lineGap: 5 });
      
      doc.fillColor('#6B7280')
         .text('Recommandation: Maintenir un stock suffisant et envisager des promotions complémentaires.', 90, doc.y, { width: 435, lineGap: 5 });
      doc.moveDown(2);
    }
    
    const nonVendus = worstProducts.filter(p => p.quantity === 0);
    if (nonVendus.length > 0) {
      doc.font('Helvetica-Bold')
         .fillColor('#DC2626')
         .text('ATTENTION', 70, doc.y);
      
      doc.font('Helvetica')
         .fillColor('#1F2937')
         .text(`${nonVendus.length} produit${nonVendus.length > 1 ? 's' : ''} n'ont enregistré aucune vente.`, 70, doc.y, { width: 455, lineGap: 5 });
      
      doc.fillColor('#6B7280')
         .text('Recommandation: Analyser les causes (prix, visibilité, demande) et ajuster la stratégie.', 90, doc.y, { width: 435, lineGap: 5 });
      doc.moveDown(2);
    }
    
    if (totalSales > 0) {
      doc.font('Helvetica-Bold')
         .fillColor('#059669')
         .text('PERFORMANCE GLOBALE', 70, doc.y);
      
      doc.font('Helvetica')
         .fillColor('#1F2937')
         .text(`${totalSales} ventes réalisées avec succès.`, 70, doc.y, { width: 455, lineGap: 5 });
      
      doc.fillColor('#6B7280')
         .text('Recommandation: Continuer sur cette lancée et optimiser le ticket moyen.', 90, doc.y, { width: 435, lineGap: 5 });
    }
    
    // ========================================
    // PIED DE PAGE
    // ========================================
    doc.moveDown(4);
    
    doc.save();
    doc.strokeColor('#3B82F6')
       .lineWidth(2)
       .moveTo(70, doc.y)
       .lineTo(525, doc.y)
       .stroke();
    doc.restore();
    
    doc.moveDown(1);
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#6B7280')
       .text('Établi et vérifié par :', { align: 'center' });
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1E40AF')
       .text(managerName, { align: 'center' });
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#6B7280')
       .text(`Gérant - ${companyName}`, { align: 'center' });
    
    doc.moveDown(1.5);
    
    doc.fontSize(8)
       .fillColor('#9CA3AF')
       .text(`© ${new Date().getFullYear()} ${companyName} - Tous droits réservés`, { align: 'center' });
    
    doc.end();
    
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du rapport PDF' });
  }
});

// Fonction pour dessiner un tableau professionnel avec alignement parfait
function drawTable(doc, data, startY, columnWidths = null) {
  const startX = 70;
  const pageWidth = 455;
  const totalCols = data[0].length;
  
  // Calculer les largeurs automatiques si non fournies
  let colWidths = columnWidths;
  if (!colWidths) {
    const baseWidth = pageWidth / totalCols;
    colWidths = Array(totalCols).fill(baseWidth);
  }
  
  const rowHeight = 32;
  let currentY = startY;
  
  data.forEach((row, rowIndex) => {
    let currentX = startX;
    
    // En-tête avec fond bleu
    if (rowIndex === 0) {
      doc.save();
      doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight)
         .fillAndStroke('#2563EB', '#1E40AF');
      doc.restore();
    } else {
      // Lignes alternées
      if (rowIndex % 2 === 0) {
        doc.save();
        doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight)
           .fill('#F9FAFB');
        doc.restore();
      }
    }
    
    // Dessiner les bordures du tableau
    doc.save();
    doc.strokeColor('#D1D5DB').lineWidth(0.5);
    
    // Bordure gauche de la ligne
    doc.moveTo(startX, currentY)
       .lineTo(startX, currentY + rowHeight);
    
    // Bordures verticales et texte pour chaque cellule
    row.forEach((cell, colIndex) => {
      const width = colWidths[colIndex];
      
      // Bordure droite de la cellule
      doc.moveTo(currentX + width, currentY)
         .lineTo(currentX + width, currentY + rowHeight);
      
      currentX += width;
    });
    
    // Bordure horizontale du bas
    if (rowIndex === 0) {
      doc.strokeColor('#1E40AF').lineWidth(1.5);
    }
    doc.moveTo(startX, currentY + rowHeight)
       .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), currentY + rowHeight);
    
    doc.stroke();
    doc.restore();
    
    // Maintenant dessiner le texte SANS clipping
    currentX = startX;
    row.forEach((cell, colIndex) => {
      const width = colWidths[colIndex];
      
      // Style pour l'en-tête
      if (rowIndex === 0) {
        doc.fillColor('#FFFFFF')
           .font('Helvetica-Bold')
           .fontSize(10);
      } else {
        doc.fillColor('#1F2937')
           .font('Helvetica')
           .fontSize(10);
      }
      
      // Alignement selon la colonne
      let alignment = 'left';
      const padding = 10;
      
      if (colIndex === 0) {
        alignment = 'center'; // Rang centré
      } else if (colIndex >= 2 && rowIndex > 0) {
        alignment = 'right'; // Chiffres à droite
      }
      
      // Position du texte selon alignement
      let textOptions = {
        width: width - (padding * 2),
        align: alignment,
        lineBreak: false
      };
      
      let xPosition = currentX + padding;
      if (alignment === 'center') {
        textOptions.align = 'center';
        xPosition = currentX;
        textOptions.width = width;
      } else if (alignment === 'right') {
        xPosition = currentX + padding;
      }
      
      // Dessiner le texte
      doc.text(
        cell.toString(), 
        xPosition, 
        currentY + (rowHeight / 2) - 6, 
        textOptions
      );
      
      currentX += width;
    });
    
    currentY += rowHeight;
  });
  
  doc.fillColor('#000000');
  doc.y = currentY + 5;
}

module.exports = router;
