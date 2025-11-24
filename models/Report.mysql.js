const pool = require('../config/mysql');

// Créer un rapport
async function createReport(report) {
  const [result] = await pool.query(
    `INSERT INTO reports (type, data) VALUES (?, ?)`,
    [report.type, report.data]
  );
  return result.insertId;
}

// Récupérer tous les rapports
async function getReports() {
  const [rows] = await pool.query('SELECT * FROM reports ORDER BY created_at DESC');
  return rows;
}

module.exports = {
  createReport,
  getReports
};
