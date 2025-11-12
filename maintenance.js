#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'database', 'commerce.db');

console.log('🔧 Utilitaires de maintenance\n');

const command = process.argv[2];

switch(command) {
  case 'backup':
    backupDatabase();
    break;
  
  case 'clear-sales':
    clearSales();
    break;
  
  case 'reset':
    resetDatabase();
    break;
  
  case 'stats':
    showStats();
    break;
  
  case 'clean-receipts':
    cleanReceipts();
    break;
  
  default:
    showHelp();
}

function showHelp() {
  console.log('Usage: node maintenance.js <command>\n');
  console.log('Commandes disponibles:');
  console.log('  backup          - Créer une sauvegarde de la base de données');
  console.log('  clear-sales     - Supprimer toutes les ventes (conserve les produits)');
  console.log('  reset           - Réinitialiser complètement la base de données');
  console.log('  stats           - Afficher les statistiques de la base de données');
  console.log('  clean-receipts  - Nettoyer les anciens reçus (> 30 jours)');
}

function backupDatabase() {
  const backupPath = path.join(__dirname, 'backups');
  
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath);
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const backupFile = path.join(backupPath, `commerce-backup-${timestamp}.db`);
  
  fs.copyFileSync(dbPath, backupFile);
  console.log(`✅ Sauvegarde créée: ${backupFile}`);
}

function clearSales() {
  const db = new sqlite3.Database(dbPath);
  
  console.log('⚠️  Cette opération va supprimer toutes les ventes.');
  console.log('Les produits seront conservés mais les stocks ne seront pas restaurés.');
  
  db.serialize(() => {
    db.run('DELETE FROM sale_items', (err) => {
      if (err) console.error('Erreur:', err);
    });
    
    db.run('DELETE FROM payments', (err) => {
      if (err) console.error('Erreur:', err);
    });
    
    db.run('DELETE FROM sales', (err) => {
      if (err) {
        console.error('Erreur:', err);
      } else {
        console.log('✅ Toutes les ventes ont été supprimées.');
      }
      db.close();
    });
  });
}

function resetDatabase() {
  console.log('⚠️  ATTENTION: Cette opération va supprimer TOUTES les données!');
  
  if (fs.existsSync(dbPath)) {
    // Créer une sauvegarde avant de supprimer
    backupDatabase();
    
    fs.unlinkSync(dbPath);
    console.log('✅ Base de données supprimée. Redémarrez le serveur pour la recréer.');
  } else {
    console.log('❌ Aucune base de données à supprimer.');
  }
}

function showStats() {
  const db = new sqlite3.Database(dbPath);
  
  db.serialize(() => {
    console.log('📊 Statistiques de la base de données\n');
    
    db.get('SELECT COUNT(*) as count, COALESCE(SUM(stock), 0) as totalStock FROM products', (err, row) => {
      console.log(`Produits: ${row.count} (Stock total: ${row.totalStock})`);
    });
    
    db.get('SELECT COUNT(*) as count, COALESCE(SUM(final_amount), 0) as total FROM sales', (err, row) => {
      console.log(`Ventes: ${row.count} (Total: ${row.total.toFixed(0)} FC)`);
    });
    
    db.get('SELECT COUNT(*) as count FROM products WHERE stock <= 5', (err, row) => {
      console.log(`Produits en stock faible: ${row.count}`);
    });
    
    db.get(`
      SELECT COUNT(*) as today_count, COALESCE(SUM(final_amount), 0) as today_total 
      FROM sales 
      WHERE DATE(created_at) = DATE('now')
    `, (err, row) => {
      console.log(`Ventes aujourd'hui: ${row.today_count} (${row.today_total.toFixed(0)} FC)`);
      db.close();
    });
  });
}

function cleanReceipts() {
  const receiptsPath = path.join(__dirname, 'receipts');
  
  if (!fs.existsSync(receiptsPath)) {
    console.log('❌ Aucun dossier de reçus trouvé.');
    return;
  }
  
  const files = fs.readdirSync(receiptsPath);
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  
  let deletedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(receiptsPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.mtimeMs < thirtyDaysAgo) {
      fs.unlinkSync(filePath);
      deletedCount++;
    }
  });
  
  console.log(`✅ ${deletedCount} reçu(s) ancien(s) supprimé(s).`);
}
