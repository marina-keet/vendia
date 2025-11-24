const pool = require('../config/mysql');

// Mettre à jour ou créer un paramètre
async function setSetting(key, value) {
  await pool.query(
    `INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?`,
    [key, value, value]
  );
}

// Récupérer un paramètre
async function getSetting(key) {
  const [rows] = await pool.query('SELECT * FROM settings WHERE key_name = ?', [key]);
  return rows[0] || null;
}

// Récupérer tous les paramètres
async function getAllSettings() {
  const [rows] = await pool.query('SELECT * FROM settings');
  return rows;
}

module.exports = {
  setSetting,
  getSetting,
  getAllSettings
};
