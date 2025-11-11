// Charger les variables d'environnement
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à MongoDB
connectDB();

// Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes API - MongoDB
const productsRoutes = require('./routes/products-mongo');
const salesRoutes = require('./routes/sales-mongo');
const reportsRoutes = require('./routes/reports-mongo');
const authRoutes = require('./routes/auth-mongo');
const customersRoutes = require('./routes/customers-mongo');
const usersRoutes = require('./routes/users-mongo');
const settingsRoutes = require('./routes/settings-mongo');
const pdfReportRoutes = require('./routes/pdf-report');

app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/pdf-report', pdfReportRoutes);

// Pages principales
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/products', (req, res) => {
  res.render('products');
});

app.get('/pos', (req, res) => {
  res.render('pos', { user: req.session?.user || null });
});

app.get('/sales', (req, res) => {
  res.render('sales');
});

app.get('/customers', (req, res) => {
  res.render('customers');
});

app.get('/users', (req, res) => {
  res.render('users');
});

app.get('/settings', (req, res) => {
  res.render('settings');
});

app.get('/reports', (req, res) => {
  res.render('reports');
});

app.get('/invoices', (req, res) => {
  res.render('invoices');
});

app.get('/edit-invoice/:id', (req, res) => {
  res.render('edit-invoice');
});

// Middleware d'erreur 404
app.use((req, res, next) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 - Page non trouvée</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100">
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <p class="text-xl text-gray-600 mb-8">Page non trouvée</p>
          <a href="/" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Retour à l'accueil
          </a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Middleware d'erreur global
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.stack);
  
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Une erreur est survenue' 
    : err.message;
  
  if (req.accepts('html')) {
    res.status(statusCode).send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erreur ${statusCode}</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100">
        <div class="min-h-screen flex items-center justify-center">
          <div class="text-center">
            <h1 class="text-6xl font-bold text-red-600 mb-4">${statusCode}</h1>
            <p class="text-xl text-gray-600 mb-8">${message}</p>
            <a href="/" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Retour à l'accueil
            </a>
          </div>
        </div>
      </body>
      </html>
    `);
  } else {
    res.status(statusCode).json({ error: message });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🛒 Point de vente: http://localhost:${PORT}/pos`);
  console.log(`📦 Produits: http://localhost:${PORT}/products`);
  console.log(`📈 Rapports: http://localhost:${PORT}/reports`);
});

module.exports = app;
