const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'commerce.db');
const db = new sqlite3.Database(dbPath);

// Initialisation de la base de données
db.serialize(() => {
  // Table des produits
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      category TEXT,
      barcode TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table des ventes
  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_amount REAL NOT NULL,
      discount REAL DEFAULT 0,
      final_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      user_id INTEGER,
      customer_id INTEGER,
      customer_name TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  // Ajouter les colonnes manquantes si la table existe déjà
  db.run(`ALTER TABLE sales ADD COLUMN user_id INTEGER`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.log('Colonne user_id déjà existante ou autre erreur:', err.message);
    }
  });
  
  db.run(`ALTER TABLE sales ADD COLUMN customer_id INTEGER`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.log('Colonne customer_id déjà existante ou autre erreur:', err.message);
    }
  });
  
  db.run(`ALTER TABLE sales ADD COLUMN customer_name TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.log('Colonne customer_name déjà existante ou autre erreur:', err.message);
    }
  });

  // Table des articles vendus
  db.run(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Table des paiements
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      method TEXT NOT NULL,
      amount REAL NOT NULL,
      reference TEXT,
      status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sale_id) REFERENCES sales(id)
    )
  `);

  // Insérer des données de démonstration
  const demoProducts = [
    ['Coca-Cola 50cl', 'Boisson gazeuse', 500, 100, 'Boissons', '3245678901234'],
    ['Pain', 'Pain frais du jour', 200, 50, 'Boulangerie', '3245678901235'],
    ['Lait 1L', 'Lait entier pasteurisé', 800, 30, 'Produits laitiers', '3245678901236'],
    ['Riz 1kg', 'Riz blanc de qualité', 1200, 75, 'Épicerie', '3245678901237'],
    ['Huile 1L', 'Huile végétale', 1500, 40, 'Épicerie', '3245678901238'],
    ['Savon', 'Savon de Marseille', 300, 60, 'Hygiène', '3245678901239'],
    ['Eau 1.5L', 'Eau minérale', 400, 120, 'Boissons', '3245678901240'],
    ['Sucre 1kg', 'Sucre cristallisé', 900, 55, 'Épicerie', '3245678901241']
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO products (name, description, price, stock, category, barcode) VALUES (?, ?, ?, ?, ?, ?)');
  demoProducts.forEach(product => {
    stmt.run(product);
  });
  stmt.finalize();

  console.log('Base de données initialisée avec succès!');
});

module.exports = db;
