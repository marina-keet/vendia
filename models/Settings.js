const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Business Information
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
  taxId: {
    type: String,
    default: ''
  },
  managerName: {
    type: String,
    default: 'Gérant'
  },
  logo: {
    type: String,
    default: null
  },
  
  // General Settings
  primaryCurrency: {
    type: String,
    enum: ['FC', 'USD'],
    default: 'FC'
  },
  currencyPosition: {
    type: String,
    enum: ['before', 'after'],
    default: 'after'
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  taxIncluded: {
    type: Boolean,
    default: false
  },
  timezone: {
    type: String,
    default: 'Africa/Kinshasa'
  },
  
  // Inventory Settings
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  criticalStockThreshold: {
    type: Number,
    default: 5
  },
  autoRestockAlerts: {
    type: Boolean,
    default: true
  },
  allowNegativeStock: {
    type: Boolean,
    default: false
  },
  
  // Receipt Settings
  receiptShowLogo: {
    type: Boolean,
    default: true
  },
  receiptShowCompanyInfo: {
    type: Boolean,
    default: true
  },
  receiptShowTax: {
    type: Boolean,
    default: true
  },
  receiptShowTaxId: {
    type: Boolean,
    default: false
  },
  receiptShowCashier: {
    type: Boolean,
    default: true
  },
  receiptShowCustomer: {
    type: Boolean,
    default: true
  },
  receiptShowPaymentMethod: {
    type: Boolean,
    default: true
  },
  receiptHeader: {
    type: String,
    default: ''
  },
  receiptFooter: {
    type: String,
    default: 'Merci de votre visite!'
  },
  receiptTerms: {
    type: String,
    default: ''
  },
  receiptWebsite: {
    type: String,
    default: ''
  },
  receiptSocial: {
    type: String,
    default: ''
  },
  receiptLegalForm: {
    type: String,
    default: ''
  },
  receiptBankAccount: {
    type: String,
    default: ''
  },
  receiptBankName: {
    type: String,
    default: ''
  },
  receiptMobileMoney: {
    type: String,
    default: ''
  },
  receiptRccm: {
    type: String,
    default: ''
  },
  receiptIdNat: {
    type: String,
    default: ''
  },
  receiptPaperSize: {
    type: String,
    enum: ['58mm', '80mm', 'A4'],
    default: '80mm'
  },
  receiptCopies: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  receiptAutoPrint: {
    type: Boolean,
    default: false
  },
  receiptShowBarcode: {
    type: Boolean,
    default: false
  },
  receiptShowQr: {
    type: Boolean,
    default: false
  },
  
  // Loyalty Program Settings
  loyaltyEnabled: {
    type: Boolean,
    default: false
  },
  // Points earned per unit of currency spent (e.g. 0.01 = 1 point per 100 FC)
  loyaltyPointsPerCurrency: {
    type: Number,
    default: 0.01
  },
  // Monetary value of a single point (in FC)
  loyaltyPointValue: {
    type: Number,
    default: 1
  },
  // Minimum points required to redeem
  loyaltyMinPoints: {
    type: Number,
    default: 0
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
