const pool = require('../config/mysql');

// Créer un client
async function createCustomer(customer) {
  const [result] = await pool.query(
    `INSERT INTO customers (name, phone, email, address, total_purchases, visit_count)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      customer.name,
      customer.phone || '',
      customer.email || '',
      customer.address || '',
      customer.total_purchases || 0,
      customer.visit_count || 0
    ]
  );
  return result.insertId;
}

// Récupérer tous les clients
async function getCustomers() {
  const [rows] = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
  return rows;
}

module.exports = {
  createCustomer,
  getCustomers
};
