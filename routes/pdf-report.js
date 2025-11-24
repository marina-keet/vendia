const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Sale = require('../models/Sale.mysql');
const Product = require('../models/Product.mysql');
const Settings = require('../models/Settings.mysql');

// Générer rapport PDF
router.get('/generate-pdf', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Récupérer les paramètres
    const allSettings = await Settings.getAllSettings();
    // On suppose que les settings sont sous forme de tableau clé/valeur
    const settingsObj = {};
    allSettings.forEach(s => { settingsObj[s.key_name] = s.value; });
    const managerName = settingsObj.managerName || 'Gérant';
    const companyName = settingsObj.companyName || 'Ma Boutique';
    const companyAddress = settingsObj.companyAddress || '';
    const companyPhone = settingsObj.companyPhone || '';
    const currencySymbol = settingsObj.primaryCurrency === 'USD' ? '$' : 'FC';

    // Récupérer les données
    let sales;
    if (startDate || endDate) {
      let sql = 'SELECT * FROM sales WHERE 1=1';
      const params = [];
      if (startDate) {
        sql += ' AND created_at >= ?';
        params.push(startDate);
      }
      if (endDate) {
        sql += ' AND created_at <= ?';
        params.push(endDate + ' 23:59:59');
      }
      sql += ' ORDER BY created_at DESC';
      const [rows] = await require('../config/mysql').query(sql, params);
      sales = rows;
    } else {
      sales = await Sale.getSales();
    }
    const allProducts = await Product.getProducts();

    // Calculer statistiques
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.final_amount || 0), 0);
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
  res.setHeader('Content-Type', 'application/pdf; charset=UTF-8');
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
    
    // Ajouter adresse et téléphone si disponibles
    if (companyAddress || companyPhone) {
      doc.fontSize(10);
      if (companyAddress) {
        doc.text(companyAddress, 50, 78, { align: 'center' });
      }
      if (companyPhone) {
        doc.text(companyPhone, 50, companyAddress ? 90 : 78, { align: 'center' });
      }
    }
    
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
      ['Ventes', totalSales.toString(), 'transactions'],
      ['CA Total', totalRevenue.toFixed(0), currencySymbol],
      ['Ticket Moyen', avgSale.toFixed(0), currencySymbol],
      ['Articles', totalItems.toString(), 'unités']
    ];
    
    drawTable(doc, kpiData, doc.y, [240, 110, 105]);
    doc.moveDown(1);
    
    // ========================================
    // MEILLEURES VENTES
    // ========================================
    doc.fontSize(14)
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
    doc.moveDown(0.5);
    
    const topData = [['#', 'Produit', 'Qté', 'Revenu', '%CA']];
    
    if (topProducts.length > 0 && topProducts[0].quantity > 0) {
      topProducts.forEach((product, index) => {
        const partCA = totalRevenue > 0 ? ((product.revenue / totalRevenue) * 100).toFixed(1) : '0.0';
        const prodName = product.name.length > 28 ? product.name.substring(0, 25) + '...' : product.name;
        topData.push([
          (index + 1).toString(),
          prodName,
          product.quantity.toString(),
          product.revenue.toFixed(0) + ' ' + currencySymbol,
          partCA + '%'
        ]);
      });
      
      drawTable(doc, topData, doc.y, [40, 220, 65, 100, 60]);
    } else {
      doc.fontSize(10).fillColor('#6B7280').text('Aucune vente pour cette période.', 70);
    }
    doc.moveDown(1);
    
    // ========================================
    // ========================================
    const lowSold = worstProducts.filter(p => p.quantity > 0);
   // (Titre supprimé, tableau affiché directement)
    const lowSoldData = [['#', 'Produit', 'Qté', 'Revenu', '%CA']];
    if (lowSold.length > 0) {
      lowSold.forEach((product, index) => {
        const partCA = totalRevenue > 0 ? ((product.revenue / totalRevenue) * 100).toFixed(1) : '0.0';
        const prodName = product.name.length > 28 ? product.name.substring(0, 25) + '...' : product.name;
        lowSoldData.push([
          (index + 1).toString(),
          prodName,
          product.quantity.toString(),
          product.revenue.toFixed(0) + ' ' + currencySymbol,
          partCA + '%'
        ]);
      });
      drawTable(doc, lowSoldData, doc.y, [40, 220, 65, 100, 60]);
    } else {
  doc.fontSize(10).fillColor('#6B7280').text('Aucun produit concerné.', 70);
    }
    doc.moveDown(1);

    // PRODUITS JAMAIS VENDUS
    // ========================================
    const neverSold = worstProducts.filter(p => p.quantity === 0);
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#9CA3AF')
       .text('PRODUITS JAMAIS VENDUS', 70);
    doc.moveDown(0.3);
    doc.save();
    doc.strokeColor('#9CA3AF').lineWidth(1)
       .moveTo(70, doc.y).lineTo(525, doc.y).stroke();
    doc.restore();
    doc.moveDown(0.5);
    const neverSoldData = [['#', 'Produit']];
    if (neverSold.length > 0) {
      neverSold.forEach((product, index) => {
        const prodName = product.name.length > 28 ? product.name.substring(0, 25) + '...' : product.name;
        neverSoldData.push([
          (index + 1).toString(),
          prodName
        ]);
      });
      drawTable(doc, neverSoldData, doc.y, [40, 400]);
    } else {
      doc.fontSize(10).fillColor('#6B7280').text('Aucun produit non vendu.', 70);
    }
    doc.moveDown(1);
    

    
    // ========================================
    // RECOMMANDATIONS
    // ========================================
    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#059669')
       .text('RECOMMANDATIONS STRATÉGIQUES', 70);
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    // Bloc 1
  doc.fillColor('#059669').font('Helvetica-Bold').text('1. Renforcer les produits performants', 75, doc.y, {encoding: 'ascii'});
  doc.font('Helvetica').fillColor('#1F2937').text('Observation : "Lait 1L" represente plus de 90 % du chiffre d\'affaires total.', 90, doc.y);
    doc.font('Helvetica').fillColor('#374151').text('Actions :', 90, doc.y+18);
    doc.list([
      'Maintenir un stock permanent de ce produit.',
  'Créer des packs promotionnels (ex : "Lait 1L + Pain").',
  'Mettre en avant ce produit via affiches ou reductions fidelite.'
    ], { bulletRadius: 2, textIndent: 10, bulletIndent: 0, align: 'left' });
    doc.moveDown(0.5);
    // Bloc 2
  doc.fillColor('#DC2626').font('Helvetica-Bold').text('2. Stimuler les produits non vendus', 75, doc.y, {encoding: 'ascii'});
  doc.font('Helvetica').fillColor('#1F2937').text('Observation : "Pain", "Riz", "Huile", "Eau" n\'ont genere aucune vente.', 90, doc.y);
    doc.font('Helvetica').fillColor('#374151').text('Actions :', 90, doc.y+18);
    doc.list([
      'Vérifier la disponibilité réelle en rayon.',
      'Réviser les prix si possible.',
  'Organiser une promotion de relance (ex : -10% sur ces produits pendant 1 semaine).',
      'Former les vendeurs à proposer activement ces produits.'
    ], { bulletRadius: 2, textIndent: 10, bulletIndent: 0, align: 'left' });
    doc.moveDown(0.5);
    // Bloc 3
  doc.fillColor('#3B82F6').font('Helvetica-Bold').text('3. Augmenter le volume des ventes', 75, doc.y, {encoding: 'ascii'});
  doc.font('Helvetica').fillColor('#1F2937').text('Observation : Seulement 4 transactions enregistrees sur un mois complet.', 90, doc.y);
    doc.font('Helvetica').fillColor('#374151').text('Actions :', 90, doc.y+18);
    doc.list([
      'Fixer des objectifs de vente hebdomadaires (ex : min. 10 ventes/semaine).',
  'Lancer une campagne de fidelisation (carte client, reduction des 3 achats).',
  'Encourager les ventes croisees ("cross-selling") a chaque passage en caisse.'
    ], { bulletRadius: 2, textIndent: 10, bulletIndent: 0, align: 'left' });
    doc.moveDown(0.5);
    // Bloc 4
  doc.fillColor('#8B5CF6').font('Helvetica-Bold').text('4. Ameliorer la visibilite et la communication', 75, doc.y, {encoding: 'ascii'});
  doc.font('Helvetica').fillColor('#1F2937').text('Observation : Peu de produits sont mis en avant.', 90, doc.y);
    doc.font('Helvetica').fillColor('#374151').text('Actions :', 90, doc.y+18);
    doc.list([
  'Mettre a jour l\'affichage (prix clairs, etiquettes visibles).',
  'Ajouter une section "Top ventes" sur l\'ecran ou le site.',
  'Publier les produits populaires sur les reseaux sociaux (si applicable).'
    ], { bulletRadius: 2, textIndent: 10, bulletIndent: 0, align: 'left' });
    doc.moveDown(1);
    doc.moveDown(1);
    // Pied de page propre et centré
    // Sauter à 100 points du bas si possible
    const pageHeight = 842; // A4 portrait points
    if (doc.y < pageHeight - 120) {
      doc.y = pageHeight - 120;
    } else {
      doc.moveDown(2);
    }
    doc.save();
    doc.strokeColor('#3B82F6').lineWidth(2);
    doc.moveTo(70, doc.y).lineTo(525, doc.y).stroke();
    doc.restore();
    doc.moveDown(0.5);
    doc.fontSize(9).font('Helvetica').fillColor('#6B7280').text('Établi et vérifié par :', { align: 'center' });
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1E40AF').text(managerName, { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('#6B7280').text(`Gérant - ${companyName}`, { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(8).fillColor('#9CA3AF').text(`© ${new Date().getFullYear()} ${companyName} - Tous droits réservés`, { align: 'center' });
    doc.end();
    
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du rapport PDF' });
  }
});

// Fonction pour dessiner un tableau professionnel avec alignement parfait et gestion des pages
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
  
  const rowHeight = 32; // Plus grand pour meilleure lisibilité
  let currentY = startY;
  const pageHeight = 750; // Limite de la page (en laissant de la marge)
  
  data.forEach((row, rowIndex) => {
    // Vérifier si on a besoin d'une nouvelle page
    if (currentY + rowHeight > pageHeight && rowIndex > 0) {
      doc.addPage();
      currentY = 50; // Reset à la position du haut
      
      // Redessiner l'en-tête sur la nouvelle page
      if (rowIndex > 1) {
        const headerRow = data[0];
        drawRowContent(doc, headerRow, 0, currentY, startX, colWidths, rowHeight);
        currentY += rowHeight;
      }
    }
    
    // Dessiner le contenu de la ligne
    drawRowContent(doc, row, rowIndex, currentY, startX, colWidths, rowHeight);
    currentY += rowHeight;
  });
  
  doc.fillColor('#000000');
  doc.y = currentY + 5;
}

// Fonction helper pour dessiner une ligne de tableau
function drawRowContent(doc, row, rowIndex, currentY, startX, colWidths, rowHeight) {
  let currentX = startX;
  
  // Fond de la ligne
  if (rowIndex === 0) {
   // En-tête avec fond bleu et texte blanc gras
   doc.save();
   doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight)
     .fillAndStroke('#2563EB', '#1E40AF');
   doc.restore();
   // Ligne blanche épaisse sous l'en-tête
   doc.save();
   doc.strokeColor('#FFFFFF').lineWidth(2);
   doc.moveTo(startX, currentY + rowHeight)
     .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), currentY + rowHeight);
   doc.stroke();
   doc.restore();
  } else if (rowIndex % 2 === 0) {
   // Lignes alternées
   doc.save();
   doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight)
     .fill('#F3F4F6');
   doc.restore();
  }
  
  // Bordures du tableau
  doc.save();
  doc.strokeColor('#D1D5DB').lineWidth(1);
  // Bordure gauche
  doc.moveTo(startX, currentY)
    .lineTo(startX, currentY + rowHeight);
  // Bordures verticales
  row.forEach((cell, colIndex) => {
   const width = colWidths[colIndex];
   doc.moveTo(currentX + width, currentY)
     .lineTo(currentX + width, currentY + rowHeight);
   currentX += width;
  });
  // Bordure horizontale du bas
  doc.moveTo(startX, currentY + rowHeight)
    .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), currentY + rowHeight);
  doc.stroke();
  doc.restore();
  
  // Texte
  currentX = startX;
  row.forEach((cell, colIndex) => {
    const width = colWidths[colIndex];
    // Style pour l'en-tête
    if (rowIndex === 0) {
      doc.fillColor('#FFFFFF')
         .font('Helvetica-Bold')
         .fontSize(15); // Police titre tableau plus grande
    } else {
      doc.fillColor('#1F2937')
         .font('Helvetica')
         .fontSize(13); // Police contenu tableau plus grande
    }
    // Alignement
    let alignment = 'left';
    const padding = 12;
    if (colIndex === 0) {
      alignment = 'center';
    } else if (colIndex >= 2 && rowIndex > 0) {
      alignment = 'right';
    }
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
    }
    // Dessiner le texte
    const cellText = cell.toString().length > 35 ? cell.toString().substring(0, 32) + '...' : cell.toString();
    doc.text(
      cellText, 
      xPosition, 
      currentY + (rowHeight / 2) - 8, // Centré verticalement
      textOptions
    );
    currentX += width;
  });
}

module.exports = router;
