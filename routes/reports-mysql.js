const express = require('express');
const router = express.Router();
const Report = require('../models/Report.mysql');

// Créer un rapport (MySQL)
router.post('/', async (req, res) => {
  try {
    const { type, data } = req.body;
    if (!type) return res.status(400).json({ error: 'Type requis' });
    const report = { type, data };
    const reportId = await Report.createReport(report);
    res.json({ success: true, reportId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Liste des rapports (MySQL)
router.get('/', async (req, res) => {
  try {
    const reports = await Report.getReports();
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
