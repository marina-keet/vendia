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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes API - MongoDB
const productsRoutes = require('./routes/products-mongo');
const salesRoutes = require('./routes/sales-mongo');
const reportsRoutes = require('./routes/reports-mongo');
const authRoutes = require('./routes/auth-mongo');
const customersRoutes = require('./routes/customers-mongo');
const usersRoutes = require('./routes/users-mongo');
const settingsRoutes = require('./routes/settings-mongo');

app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);

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
  res.render('pos');
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

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🛒 Point de vente: http://localhost:${PORT}/pos`);
  console.log(`📦 Produits: http://localhost:${PORT}/products`);
  console.log(`📈 Rapports: http://localhost:${PORT}/reports`);
});

module.exports = app;
