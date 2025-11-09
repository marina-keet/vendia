// Configuration de l'application

module.exports = {
  // Informations du commerce
  business: {
    name: 'Mon Commerce',
    address: '123 Rue du Commerce, Ville',
    phone: '+225 XX XX XX XX',
    email: 'contact@moncommerce.com',
    website: 'www.moncommerce.com'
  },

  // Configuration du serveur
  server: {
    port: process.env.PORT || 3000,
    host: 'localhost'
  },

  // Configuration de la base de données
  database: {
    path: './database/commerce.db'
  },

  // Configuration des reçus
  receipts: {
    directory: './receipts',
    currency: 'FCFA',
    locale: 'fr-FR',
    taxRate: 0, // Taux de TVA (0 = pas de TVA)
    footer: {
      message: 'Merci de votre visite!',
      subMessage: 'À bientôt!'
    }
  },

  // Alertes de stock
  stock: {
    lowStockThreshold: 5, // Alerte si stock <= 5
    criticalStockThreshold: 2 // Stock critique
  },

  // Configuration des rapports
  reports: {
    defaultDays: 30, // Nombre de jours par défaut pour les rapports
    topProductsLimit: 10 // Nombre de produits dans le top
  },

  // Méthodes de paiement
  paymentMethods: [
    { value: 'cash', label: 'Espèces', icon: 'fa-money-bill' },
    { value: 'card', label: 'Carte bancaire', icon: 'fa-credit-card' },
    { value: 'mobile_money', label: 'Mobile Money', icon: 'fa-mobile' },
    { value: 'other', label: 'Autre', icon: 'fa-wallet' }
  ],

  // Catégories de produits par défaut
  defaultCategories: [
    'Boissons',
    'Boulangerie',
    'Produits laitiers',
    'Épicerie',
    'Hygiène',
    'Fruits et légumes',
    'Viandes et poissons',
    'Autres'
  ]
};
