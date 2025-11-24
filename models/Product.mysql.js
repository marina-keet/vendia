const pool = require('../config/mysql');

// Créer un produit
async function createProduct(product) {
  const [result] = await pool.query(
    `INSERT INTO products (name, price, stock, description)
     VALUES (?, ?, ?, ?)`,
    [
      product.name,
      product.price,
      product.stock || 0,
      product.description || ''
    ]
  );
  return result.insertId;
}

// Récupérer tous les produits
async function getProducts() {
  const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
  return rows;
}

module.exports = {
  createProduct,
  getProducts
};
