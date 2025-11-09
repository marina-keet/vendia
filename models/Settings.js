const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: 'Ma Boutique'
  },
  companyAddress: {
    type: String,
    default: ''
  },
  companyPhone: {
    type: String,
    default: ''
  },
  companyEmail: {
    type: String,
    default: ''
  },
  primaryCurrency: {
    type: String,
    enum: ['FC', 'USD'],
    default: 'FC'
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  receiptFooter: {
    type: String,
    default: 'Merci de votre visite!'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
