const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const db = require('../database/init');
const { formatCurrency, convertCurrency, getCurrencySettings } = require('./currency');

// Créer le dossier receipts s'il n'existe pas
const receiptsDir = path.join(__dirname, '..', 'receipts');
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir);
}

async function generateReceipt(sale, items, callback) {
  try {
    // Récupérer les paramètres (logo, infos commerce, devise)
    const settings = await new Promise((resolve, reject) => {
      db.all('SELECT key, value FROM settings', (err, rows) => {
        if (err) reject(err);
        const settingsObj = {};
        rows.forEach(row => {
          settingsObj[row.key] = row.value;
        });
        resolve(settingsObj);
      });
    });

    // Récupérer le nom du client si customer_id existe
    const customerName = sale.customer_id ? await new Promise((resolve, reject) => {
      db.get('SELECT name FROM customers WHERE id = ?', [sale.customer_id], (err, row) => {
        if (err) reject(err);
        resolve(row ? row.name : 'Client anonyme');
      });
    }) : 'Client anonyme';

    // Récupérer le nom du caissier
    const cashierName = await new Promise((resolve, reject) => {
      db.get('SELECT username, full_name FROM users WHERE id = ?', [sale.user_id], (err, row) => {
        if (err) reject(err);
        resolve(row ? (row.full_name || row.username) : 'N/A');
      });
    });

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const filename = `receipt-${sale.id}-${Date.now()}.pdf`;
    const filepath = path.join(receiptsDir, filename);

    doc.pipe(fs.createWriteStream(filepath));

    // Couleurs
    const primaryColor = settings.primary_color || '#2563eb'; // Bleu par défaut
    const secondaryColor = settings.secondary_color || '#1e40af';

    // Logo si disponible
    if (settings.logo) {
      try {
        const logoPath = path.join(__dirname, '..', 'public', settings.logo);
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, 50, { width: 100 });
          doc.moveDown(4);
        }
      } catch (e) {
        // Si erreur de chargement du logo, continuer sans
      }
    }

    // En-tête avec couleur
    doc.fillColor(primaryColor).fontSize(24).text('REÇU DE VENTE', { align: 'center' });
    doc.fillColor('#000000');
    doc.moveDown();

    // Informations du commerce
    const businessName = settings.business_name || 'Mon Commerce';
    const address = settings.address || '123 Rue du Commerce, Ville';
    const phone = settings.phone || '+243 XX XX XX XX';
    const email = settings.email || 'contact@moncommerce.cd';

    doc.fontSize(14).font('Helvetica-Bold').text(businessName, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(address, { align: 'center' });
    doc.text(`Tél: ${phone} | Email: ${email}`, { align: 'center' });
    doc.moveDown();

    // Ligne de séparation colorée
    doc.strokeColor(primaryColor).lineWidth(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.strokeColor('#000000').lineWidth(1);
    doc.moveDown();

    // Informations de la vente avec fond coloré
    const infoBoxY = doc.y;
    doc.rect(50, infoBoxY, 500, 80).fillAndStroke('#f3f4f6', '#d1d5db');
    
    doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold');
    doc.text(`N° de Facture: ${sale.id}`, 60, infoBoxY + 10);
    doc.text(`Date: ${new Date(sale.created_at).toLocaleString('fr-FR')}`, 320, infoBoxY + 10);
    
    doc.font('Helvetica');
    doc.text(`Client: ${customerName}`, 60, infoBoxY + 30);
    doc.text(`Caissier: ${cashierName}`, 320, infoBoxY + 30);
    
    if (sale.notes) {
      doc.fontSize(9).text(`Note: ${sale.notes}`, 60, infoBoxY + 50, { width: 480 });
    }

    doc.y = infoBoxY + 90;
    doc.moveDown();

    // En-têtes du tableau avec couleur
    const tableTop = doc.y;
    doc.rect(50, tableTop, 500, 25).fillAndStroke(primaryColor, primaryColor);
    
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
    doc.text('Article', 60, tableTop + 8);
    doc.text('Qté', 300, tableTop + 8, { width: 50, align: 'center' });
    doc.text('P.U.', 360, tableTop + 8, { width: 80, align: 'right' });
    doc.text('Total', 460, tableTop + 8, { width: 80, align: 'right' });

    doc.y = tableTop + 25;
    doc.moveDown(0.5);

    // Articles avec lignes alternées
    doc.fillColor('#000000').font('Helvetica');
    let rowY = doc.y;
    items.forEach((item, index) => {
      // Fond alterné
      if (index % 2 === 0) {
        doc.rect(50, rowY - 5, 500, 25).fillAndStroke('#f9fafb', '#f9fafb');
      }

      const y = rowY;
      doc.fillColor('#000000');
      doc.text(item.product_name, 60, y, { width: 230 });
      doc.text(item.quantity.toString(), 300, y, { width: 50, align: 'center' });
      doc.text(formatCurrency(item.unit_price, settings.currency || 'FC'), 360, y, { width: 80, align: 'right' });
      doc.text(formatCurrency(item.subtotal, settings.currency || 'FC'), 460, y, { width: 80, align: 'right' });
      
      rowY += 25;
      doc.y = rowY;
    });

    doc.moveDown();
    doc.strokeColor(primaryColor).lineWidth(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.strokeColor('#000000').lineWidth(1);
    doc.moveDown();

    // Totaux
    const totalsX = 350;
    doc.font('Helvetica').fontSize(11);
    
    doc.text('Sous-total:', totalsX, doc.y);
    doc.text(formatCurrency(sale.total_amount, settings.currency || 'FC'), 460, doc.y, { width: 80, align: 'right' });
    doc.moveDown(0.5);

    if (sale.discount > 0) {
      doc.fillColor('#dc2626').text('Remise:', totalsX, doc.y);
      doc.text(`-${formatCurrency(sale.discount, settings.currency || 'FC')}`, 460, doc.y, { width: 80, align: 'right' });
      doc.fillColor('#000000');
      doc.moveDown(0.5);
    }

    doc.strokeColor('#d1d5db');
    doc.moveTo(350, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Total principal
    doc.font('Helvetica-Bold').fontSize(14).fillColor(primaryColor);
    doc.text('TOTAL:', totalsX, doc.y);
    doc.text(formatCurrency(sale.final_amount, settings.currency || 'FC'), 460, doc.y, { width: 80, align: 'right' });
    doc.moveDown(0.5);

    // Équivalent en devise secondaire (sans afficher le taux)
    const exchangeRate = parseFloat(settings.exchange_rate || 2500);
    const secondaryCurrency = settings.secondary_currency || 'USD';
    const totalSecondary = settings.currency === 'FC' 
      ? sale.final_amount / exchangeRate 
      : sale.final_amount * exchangeRate;

    doc.font('Helvetica').fontSize(10).fillColor('#6b7280');
    doc.text(`Équivalent: ${formatCurrency(totalSecondary, secondaryCurrency)}`, totalsX, doc.y);
    doc.fillColor('#000000');
    doc.moveDown(2);

    // Méthode de paiement
    doc.font('Helvetica').fontSize(10);
    doc.text(`Mode de paiement: ${getPaymentMethodLabel(sale.payment_method)}`, totalsX, doc.y);
    doc.moveDown(2);

    // Ligne de séparation
    doc.strokeColor(primaryColor).lineWidth(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.strokeColor('#000000').lineWidth(1);
    doc.moveDown();

    // Pied de page
    doc.fontSize(12).font('Helvetica-Bold').fillColor(primaryColor).text('Merci de votre visite!', { align: 'center' });
    doc.fontSize(9).font('Helvetica').fillColor('#6b7280').text('À bientôt!', { align: 'center' });
    doc.moveDown(0.5);
    
    if (settings.website) {
      doc.fontSize(8).text(settings.website, { align: 'center' });
    }

    // Footer avec numéro de page
    doc.fontSize(8).fillColor('#9ca3af');
    doc.text(`Imprimé le ${new Date().toLocaleString('fr-FR')} | Page 1`, 50, doc.page.height - 50, { align: 'center', width: 500 });

    // Finaliser le PDF
    doc.end();

    doc.on('finish', () => {
      callback(null, filepath);
    });

    doc.on('error', (err) => {
      callback(err);
    });
  } catch (error) {
    callback(error);
  }
}

function getPaymentMethodLabel(method) {
  const labels = {
    'cash': 'Espèces',
    'card': 'Carte bancaire',
    'mobile_money': 'Mobile Money',
    'other': 'Autre'
  };
  return labels[method] || method;
}

module.exports = { generateReceipt };

