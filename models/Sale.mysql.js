const pool = require('../config/mysql');

// Exemple : créer une vente
async function createSale(sale) {
  const [result] = await pool.query(
    `INSERT INTO sales (total_amount, discount, final_amount, payment_method, status, notes, user_id, customer_id, customer_name, amount_received, amount_returned)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sale.totalAmount,
      sale.discount,
      sale.finalAmount,
      sale.paymentMethod,
      sale.status || 'completed',
      sale.notes || '',
      sale.userId || null,
      sale.customerId || null,
      sale.customerName || 'Client anonyme',
      sale.amountReceived || 0,
      sale.amountReturned || 0
    ]
  );
  return result.insertId;
}

// Exemple : récupérer toutes les ventes
async function getSales() {
  const [rows] = await pool.query('SELECT * FROM sales ORDER BY created_at DESC');
  return rows;
}

module.exports = {
  createSale,
  getSales
};
