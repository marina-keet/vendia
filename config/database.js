const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vendia';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connecté avec succès!');
    
    // Initialiser les données de démonstration si la base est vide
    await initializeData();
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

const initializeData = async () => {
  const User = require('../models/User');
  const Product = require('../models/Product');
  const Settings = require('../models/Settings');
  
  try {
    // Créer un utilisateur admin par défaut
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123',
        fullName: 'Administrateur',
        role: 'admin',
        email: 'admin@vendia.com'
      });
      console.log('✅ Utilisateur admin créé: admin / admin123');
    }
    
    // Créer des produits de démonstration
    const productsCount = await Product.countDocuments();
    if (productsCount === 0) {
      const demoProducts = [
        { name: 'Coca-Cola 50cl', description: 'Boisson gazeuse', price: 500, stock: 100, category: 'Boissons', barcode: '3245678901234' },
        { name: 'Pain', description: 'Pain frais du jour', price: 200, stock: 50, category: 'Boulangerie', barcode: '3245678901235' },
        { name: 'Lait 1L', description: 'Lait entier pasteurisé', price: 800, stock: 30, category: 'Produits laitiers', barcode: '3245678901236' },
        { name: 'Riz 1kg', description: 'Riz blanc de qualité', price: 1200, stock: 75, category: 'Épicerie', barcode: '3245678901237' },
        { name: 'Huile 1L', description: 'Huile végétale', price: 1500, stock: 40, category: 'Épicerie', barcode: '3245678901238' },
        { name: 'Savon', description: 'Savon de Marseille', price: 300, stock: 60, category: 'Hygiène', barcode: '3245678901239' },
        { name: 'Eau 1.5L', description: 'Eau minérale', price: 400, stock: 120, category: 'Boissons', barcode: '3245678901240' },
        { name: 'Sucre 1kg', description: 'Sucre cristallisé', price: 900, stock: 55, category: 'Épicerie', barcode: '3245678901241' }
      ];
      
      await Product.insertMany(demoProducts);
      console.log('✅ Produits de démonstration créés');
    }
    
    // Créer les paramètres par défaut
    const settingsExist = await Settings.findOne();
    if (!settingsExist) {
      await Settings.create({
        companyName: 'VENDIA Commerce',
        companyAddress: 'Kinshasa, RDC',
        companyPhone: '+243 XXX XXX XXX',
        primaryCurrency: 'FC'
      });
      console.log('✅ Paramètres par défaut créés');
    }
  } catch (error) {
    console.error('❌ Erreur initialisation données:', error.message);
  }
};

module.exports = connectDB;
