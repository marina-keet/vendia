#!/usr/bin/env node

/**
 * Script de démonstration pour l'application de gestion commerciale
 * Génère des données de test réalistes
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'commerce.db');
const db = new sqlite3.Database(dbPath);

console.log('🎭 Génération de données de démonstration...\n');

// Produits supplémentaires
const additionalProducts = [
  ['Yaourt nature', 'Yaourt nature 125g', 250, 40, 'Produits laitiers', '3245678901250'],
  ['Fromage', 'Fromage à tartiner', 1200, 25, 'Produits laitiers', '3245678901251'],
  ['Biscuits', 'Paquet de biscuits', 600, 60, 'Épicerie', '3245678901252'],
  ['Café soluble', 'Café soluble 100g', 1800, 30, 'Épicerie', '3245678901253'],
  ['Thé', 'Boîte de thé 25 sachets', 900, 35, 'Épicerie', '3245678901254'],
  ['Dentifrice', 'Dentifrice menthe fraîche', 800, 45, 'Hygiène', '3245678901255'],
  ['Shampooing', 'Shampooing 250ml', 1500, 20, 'Hygiène', '3245678901256'],
  ['Savon liquide', 'Savon liquide mains 300ml', 700, 30, 'Hygiène', '3245678901257'],
  ['Papier toilette', 'Papier toilette x6', 1200, 50, 'Hygiène', '3245678901258'],
  ['Lessive', 'Lessive en poudre 1kg', 2500, 15, 'Hygiène', '3245678901259'],
  ['Jus d\'orange', 'Jus d\'orange 1L', 1000, 40, 'Boissons', '3245678901260'],
  ['Jus de mangue', 'Jus de mangue 1L', 1000, 35, 'Boissons', '3245678901261'],
  ['Soda citron', 'Soda citron 50cl', 400, 80, 'Boissons', '3245678901262'],
  ['Bière', 'Bière locale 65cl', 800, 70, 'Boissons', '3245678901263'],
  ['Pâtes', 'Pâtes spaghetti 500g', 700, 45, 'Épicerie', '3245678901264'],
  ['Tomate concentrée', 'Concentré de tomate 400g', 500, 50, 'Épicerie', '3245678901265'],
  ['Sardines', 'Boîte de sardines', 600, 40, 'Épicerie', '3245678901266'],
  ['Haricots', 'Haricots rouges 500g', 800, 35, 'Épicerie', '3245678901267'],
  ['Farine', 'Farine de blé 1kg', 900, 30, 'Épicerie', '3245678901268'],
  ['Sel', 'Sel iodé 500g', 200, 60, 'Épicerie', '3245678901269']
];

// Ventes de démonstration
const demoSales = [
  {
    items: [
      { productId: 1, productName: 'Coca-Cola 50cl', quantity: 3, unitPrice: 500 },
      { productId: 7, productName: 'Eau 1.5L', quantity: 2, unitPrice: 400 }
    ],
    paymentMethod: 'cash',
    discount: 0
  },
  {
    items: [
      { productId: 2, productName: 'Pain', quantity: 5, unitPrice: 200 },
      { productId: 3, productName: 'Lait 1L', quantity: 2, unitPrice: 800 }
    ],
    paymentMethod: 'mobile_money',
    discount: 100
  },
  {
    items: [
      { productId: 4, productName: 'Riz 1kg', quantity: 2, unitPrice: 1200 },
      { productId: 5, productName: 'Huile 1L', quantity: 1, unitPrice: 1500 }
    ],
    paymentMethod: 'card',
    discount: 0
  },
  {
    items: [
      { productId: 6, productName: 'Savon', quantity: 3, unitPrice: 300 },
      { productId: 8, productName: 'Sucre 1kg', quantity: 1, unitPrice: 900 }
    ],
    paymentMethod: 'cash',
    discount: 50
  },
  {
    items: [
      { productId: 1, productName: 'Coca-Cola 50cl', quantity: 6, unitPrice: 500 },
      { productId: 7, productName: 'Eau 1.5L', quantity: 4, unitPrice: 400 },
      { productId: 2, productName: 'Pain', quantity: 3, unitPrice: 200 }
    ],
    paymentMethod: 'cash',
    discount: 200
  }
];

db.serialize(() => {
  console.log('📦 Ajout de produits supplémentaires...');
  
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO products (name, description, price, stock, category, barcode) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  additionalProducts.forEach(product => {
    stmt.run(product);
  });
  
  stmt.finalize(() => {
    console.log(`   ✅ ${additionalProducts.length} produits ajoutés\n`);
  });

  // Attendre un peu avant de créer les ventes
  setTimeout(() => {
    console.log('💰 Création de ventes de démonstration...');
    
    demoSales.forEach((sale, index) => {
      const totalAmount = sale.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const finalAmount = totalAmount - sale.discount;

      db.run(`
        INSERT INTO sales (total_amount, discount, final_amount, payment_method, notes)
        VALUES (?, ?, ?, ?, ?)
      `, [totalAmount, sale.discount, finalAmount, sale.paymentMethod, `Vente de démonstration ${index + 1}`], function(err) {
        if (err) {
          console.error('   ❌ Erreur:', err);
          return;
        }

        const saleId = this.lastID;

        // Insérer les articles
        const itemStmt = db.prepare(`
          INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, subtotal)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        const updateStockStmt = db.prepare(`
          UPDATE products SET stock = stock - ? WHERE id = ?
        `);

        sale.items.forEach(item => {
          const subtotal = item.quantity * item.unitPrice;
          itemStmt.run([saleId, item.productId, item.productName, item.quantity, item.unitPrice, subtotal]);
          updateStockStmt.run([item.quantity, item.productId]);
        });

        itemStmt.finalize();
        updateStockStmt.finalize();

        // Insérer le paiement
        db.run(`
          INSERT INTO payments (sale_id, method, amount)
          VALUES (?, ?, ?)
        `, [saleId, sale.paymentMethod, finalAmount]);

        console.log(`   ✅ Vente #${saleId} créée (${finalAmount} FC)`);
      });
    });

    setTimeout(() => {
      console.log('\n🎉 Données de démonstration générées avec succès!');
      console.log('\n📊 Statistiques:');
      
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        console.log(`   - ${row.count} produits en catalogue`);
      });

      db.get('SELECT COUNT(*) as count, SUM(final_amount) as total FROM sales', (err, row) => {
        console.log(`   - ${row.count} ventes (Total: ${row.total} FC)`);
      });

      setTimeout(() => {
        console.log('\n🚀 Accédez à l\'application sur http://localhost:3000');
        console.log('   - Dashboard: http://localhost:3000');
        console.log('   - Produits: http://localhost:3000/products');
        console.log('   - Point de vente: http://localhost:3000/pos');
        console.log('   - Rapports: http://localhost:3000/reports\n');
        
        db.close();
      }, 500);
    }, 2000);
  }, 1000);
});
