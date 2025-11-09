const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'commerce.db');
const db = new sqlite3.Database(dbPath);

// Extension du schéma pour les nouvelles fonctionnalités
db.serialize(() => {
  
  // Table des utilisateurs avec authentification
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT,
      role TEXT NOT NULL DEFAULT 'cashier',
      phone TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      created_by INTEGER,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Table des clients
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      loyalty_points INTEGER DEFAULT 0,
      total_purchases REAL DEFAULT 0,
      visit_count INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Lier les ventes aux clients et utilisateurs (ignorer si déjà existant)
  db.run(`
    ALTER TABLE sales ADD COLUMN customer_id INTEGER REFERENCES customers(id)
  `, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Erreur ajout customer_id:', err.message);
    }
  });
  
  db.run(`
    ALTER TABLE sales ADD COLUMN user_id INTEGER REFERENCES users(id)
  `, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Erreur ajout user_id:', err.message);
    }
  });

  // Table des sessions
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Table de configuration/paramètres
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      category TEXT,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Paramètres par défaut
  const defaultSettings = [
    ['business_name', 'Mon Commerce', 'business', 'Nom du commerce'],
    ['business_address', 'Kinshasa, RDC', 'business', 'Adresse'],
    ['business_phone', '+243 XX XX XX XX', 'business', 'Téléphone'],
    ['business_email', 'contact@moncommerce.cd', 'business', 'Email'],
    ['currency', 'FC', 'general', 'Devise (FC ou USD)'],
    ['secondary_currency', 'USD', 'general', 'Devise secondaire'],
    ['exchange_rate', '2500', 'general', 'Taux de change (1 USD = X FC)'],
    ['tax_rate', '0', 'general', 'Taux de TVA (%)'],
    ['low_stock_threshold', '5', 'inventory', 'Seuil stock faible'],
    ['receipt_footer', 'Merci de votre visite!', 'receipt', 'Message reçu'],
    ['loyalty_enabled', '0', 'loyalty', 'Programme fidélité actif'],
    ['loyalty_points_ratio', '100', 'loyalty', 'Points pour 100 FC']
  ];

  const settingStmt = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value, category, description) 
    VALUES (?, ?, ?, ?)
  `);
  
  defaultSettings.forEach(setting => settingStmt.run(setting));
  settingStmt.finalize();

  // Créer un utilisateur admin par défaut
  const crypto = require('crypto');
  const defaultPassword = 'admin123';
  const hash = crypto.createHash('sha256').update(defaultPassword).digest('hex');

  db.run(`
    INSERT OR IGNORE INTO users (username, password, full_name, role, email) 
    VALUES (?, ?, ?, ?, ?)
  `, ['admin', hash, 'Administrateur', 'admin', 'admin@moncommerce.com'], (err) => {
    if (!err) {
      console.log('👤 Utilisateur admin créé (username: admin, password: admin123)');
    }
  });

  // Quelques clients de démonstration
  const demoCustomers = [
    ['Jean Kouassi', 'jean@email.com', '+225 01 02 03 04', 'Abidjan, Cocody', 0, 0, 0, 'Client régulier'],
    ['Marie Traoré', 'marie@email.com', '+225 05 06 07 08', 'Abidjan, Yopougon', 0, 0, 0, 'VIP'],
    ['Ibrahim Diallo', null, '+225 09 10 11 12', 'Abidjan, Plateau', 0, 0, 0, null]
  ];

  const customerStmt = db.prepare(`
    INSERT OR IGNORE INTO customers (name, email, phone, address, loyalty_points, total_purchases, visit_count, notes) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  demoCustomers.forEach(customer => customerStmt.run(customer));
  customerStmt.finalize();

  console.log('✅ Schéma étendu avec succès (Users, Customers, Settings)');
});

module.exports = db;
