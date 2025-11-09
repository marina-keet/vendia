#!/usr/bin/env node

/**
 * Script pour réinitialiser complètement la base de données
 * Supprime toutes les données et recrée les données par défaut
 */

const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const db = new sqlite3.Database('./database/commerce.db');

console.log('🔄 RÉINITIALISATION COMPLÈTE DE LA BASE DE DONNÉES');
console.log('━'.repeat(70));
console.log('');
console.log('Cette opération va :');
console.log('  1. Supprimer toutes les données existantes');
console.log('  2. Recréer l\'utilisateur admin par défaut');
console.log('  3. Recréer les paramètres par défaut');
console.log('');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

db.serialize(() => {
  console.log('🗑️  Suppression des données...\n');
  
  // Désactiver les contraintes
  db.run('PRAGMA foreign_keys = OFF');

  // Supprimer toutes les données
  db.run('DELETE FROM sessions');
  db.run('DELETE FROM settings');
  db.run('DELETE FROM payments');
  db.run('DELETE FROM sale_items');
  db.run('DELETE FROM sales');
  db.run('DELETE FROM products');
  db.run('DELETE FROM customers');
  db.run('DELETE FROM users');
  db.run('DELETE FROM sqlite_sequence');

  console.log('✅ Données supprimées\n');
  console.log('🔧 Recréation des données par défaut...\n');

  // Recréer l'utilisateur admin
  const adminPassword = hashPassword('admin123');
  db.run(`
    INSERT INTO users (username, password, full_name, email, role, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `, ['admin', adminPassword, 'Administrateur', 'admin@moncommerce.com', 'admin', 1], (err) => {
    if (err) {
      console.error('❌ Erreur création admin:', err.message);
    } else {
      console.log('✅ Utilisateur admin créé (username: admin, password: admin123)');
    }
  });

  // Recréer les paramètres par défaut
  const defaultSettings = [
    ['business_name', 'Mon Commerce', 'business', 'Nom du commerce'],
    ['business_address', 'Kinshasa, RDC', 'business', 'Adresse'],
    ['business_phone', '+243 XX XX XX XX', 'business', 'Téléphone'],
    ['business_email', 'contact@moncommerce.cd', 'business', 'Email'],
    ['currency', 'FC', 'general', 'Devise principale (FC ou USD)'],
    ['secondary_currency', 'USD', 'general', 'Devise secondaire'],
    ['exchange_rate', '2500', 'general', 'Taux de change (1 USD = X FC)'],
    ['tax_rate', '0', 'general', 'Taux de TVA (%)'],
    ['low_stock_threshold', '10', 'inventory', 'Seuil stock bas'],
    ['receipt_footer', 'Merci de votre visite !', 'receipt', 'Pied de page reçu'],
    ['loyalty_enabled', 'false', 'loyalty', 'Programme fidélité activé'],
    ['loyalty_points_per_currency', '0.01', 'loyalty', 'Points par unité monétaire']
  ];

  const stmt = db.prepare(`
    INSERT INTO settings (key, value, category, description)
    VALUES (?, ?, ?, ?)
  `);

  let settingsCount = 0;
  defaultSettings.forEach(setting => {
    stmt.run(setting, (err) => {
      if (err) {
        console.error(`❌ Erreur paramètre ${setting[0]}:`, err.message);
      }
      settingsCount++;
      if (settingsCount === defaultSettings.length) {
        console.log(`✅ ${defaultSettings.length} paramètres par défaut créés`);
        stmt.finalize();
        
        // Réactiver les contraintes
        db.run('PRAGMA foreign_keys = ON', () => {
          console.log('\n✅ Base de données réinitialisée avec succès !\n');
          console.log('━'.repeat(70));
          console.log('📊 État final :');
          console.log('  • 1 utilisateur (admin)');
          console.log('  • 10 paramètres par défaut');
          console.log('  • 0 produits');
          console.log('  • 0 clients');
          console.log('  • 0 ventes');
          console.log('');
          console.log('🔐 Connexion :');
          console.log('   Utilisateur : admin');
          console.log('   Mot de passe : admin123');
          console.log('');
          console.log('💡 Pour ajouter des données de test :');
          console.log('   $ node demo.js');
          console.log('');
          db.close();
        });
      }
    });
  });
});
