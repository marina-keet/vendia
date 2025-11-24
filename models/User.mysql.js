const pool = require('../config/mysql');

// Créer un utilisateur
async function createUser(user) {
  const [result] = await pool.query(
    `INSERT INTO users (username, password, full_name, role)
     VALUES (?, ?, ?, ?)`,
    [
      user.username,
      user.password,
      user.full_name || '',
      user.role || 'caissier'
    ]
  );
  return result.insertId;
}

// Récupérer tous les utilisateurs
async function getUsers() {
  const [rows] = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
  return rows;
}

module.exports = {
  createUser,
  getUsers
};
