#!/usr/bin/env node

/**
 * Mise à jour des paramètres de devise dans la base de données
 */

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/commerce.db');

console.log('💱 MISE À JOUR DES DEVISES');
console.log('═'.repeat(70));
console.log('');

db.serialize(() => {
  // Mettre à jour la devise principale
  db.run(`UPDATE settings SET value = 'FC' WHERE key = 'currency'`, (err) => {
    if (err) {
      console.error('❌ Erreur mise à jour currency:', err.message);
    } else {
      console.log('✅ Devise principale: FC (Franc Congolais)');
    }
  });

  // Ajouter la devise secondaire
  db.run(`
    INSERT OR REPLACE INTO settings (key, value, category, description) 
    VALUES ('secondary_currency', 'USD', 'general', 'Devise secondaire')
  `, (err) => {
    if (err) {
      console.error('❌ Erreur ajout secondary_currency:', err.message);
    } else {
      console.log('✅ Devise secondaire: USD (Dollar Américain)');
    }
  });

  // Ajouter le taux de change
  db.run(`
    INSERT OR REPLACE INTO settings (key, value, category, description) 
    VALUES ('exchange_rate', '2500', 'general', 'Taux de change (1 USD = X FC)')
  `, (err) => {
    if (err) {
      console.error('❌ Erreur ajout exchange_rate:', err.message);
    } else {
      console.log('✅ Taux de change: 1 USD = 2500 FC');
    }
  });

  // Mettre à jour l'adresse par défaut
  db.run(`UPDATE settings SET value = 'Kinshasa, RDC' WHERE key = 'business_address'`, (err) => {
    if (!err) {
      console.log('✅ Adresse mise à jour: Kinshasa, RDC');
    }
  });

  // Mettre à jour le téléphone par défaut
  db.run(`UPDATE settings SET value = '+243 XX XX XX XX' WHERE key = 'business_phone'`, (err) => {
    if (!err) {
      console.log('✅ Téléphone mis à jour: +243 XX XX XX XX');
    }
  });

  // Mettre à jour l'email par défaut
  db.run(`UPDATE settings SET value = 'contact@moncommerce.cd' WHERE key = 'business_email'`, (err) => {
    if (!err) {
      console.log('✅ Email mis à jour: contact@moncommerce.cd');
    }
  });

  // Afficher les paramètres mis à jour
  setTimeout(() => {
    console.log('');
    console.log('📊 PARAMÈTRES DE DEVISE ACTUELS');
    console.log('─'.repeat(70));

    db.all(`
      SELECT key, value, description FROM settings 
      WHERE key IN ('currency', 'secondary_currency', 'exchange_rate', 'business_address', 'business_phone', 'business_email')
      ORDER BY key
    `, (err, rows) => {
      if (err) {
        console.error('❌ Erreur:', err.message);
        db.close();
        return;
      }

      rows.forEach(row => {
        console.log(`${row.description.padEnd(35)} : ${row.value}`);
      });

      console.log('');
      console.log('═'.repeat(70));
      console.log('✅ Mise à jour des devises terminée !');
      console.log('');
      console.log('💡 Configuration RDC:');
      console.log('  • Devise principale: Franc Congolais (FC)');
      console.log('  • Devise secondaire: Dollar Américain (USD)');
      console.log('  • Taux de change: 1 USD = 2500 FC');
      console.log('  • Localisation: Kinshasa, RDC');
      console.log('');
      console.log('🔧 Pour modifier le taux de change:');
      console.log('  • Page Paramètres > Général > Taux de change');
      console.log('  • Ou via API: PUT /api/settings/exchange_rate');
      console.log('');

      db.close();
    });
  }, 500);
});
