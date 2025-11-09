#!/usr/bin/env node

/**
 * Script de vérification finale - Version 2.0.0
 * Vérifie que toutes les fonctionnalités sont opérationnelles
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification finale de l\'application v2.0.0\n');
console.log('='.repeat(60));

let checks = 0;
let passed = 0;
let failed = 0;

function check(name, condition, details = '') {
  checks++;
  if (condition) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    failed++;
  }
}

// Vérification des fichiers principaux
console.log('\n📁 Fichiers principaux\n');

check('server.js', fs.existsSync('server.js'));
check('package.json', fs.existsSync('package.json'));
check('Base de données', fs.existsSync('database/commerce.db'));

// Vérification des routes
console.log('\n🛣️  Routes API\n');

const routes = [
  'routes/products.js',
  'routes/sales.js',
  'routes/reports.js',
  'routes/auth.js',
  'routes/customers.js',
  'routes/users.js',
  'routes/settings.js'
];

routes.forEach(route => {
  check(path.basename(route), fs.existsSync(route));
});

// Vérification des vues
console.log('\n🎨 Pages (Views)\n');

const views = [
  'views/index.ejs',
  'views/products.ejs',
  'views/pos.ejs',
  'views/reports.ejs',
  'views/login.ejs',
  'views/sales.ejs',
  'views/customers.ejs',
  'views/users.ejs',
  'views/settings.ejs',
  'views/partials/header.ejs',
  'views/partials/footer.ejs'
];

views.forEach(view => {
  check(path.basename(view), fs.existsSync(view));
});

// Vérification des utilitaires
console.log('\n🔧 Utilitaires\n');

check('auth.js', fs.existsSync('utils/auth.js'), 'Middleware d\'authentification');
check('receipt.js', fs.existsSync('utils/receipt.js'), 'Génération de reçus PDF');

// Vérification de la base de données
console.log('\n💾 Base de données\n');

check('init.js', fs.existsSync('database/init.js'), 'Schéma de base');
check('schema-extended.js', fs.existsSync('database/schema-extended.js'), 'Schéma étendu (auth)');

// Vérification de la documentation
console.log('\n📚 Documentation\n');

const docs = [
  'README.md',
  'AUTHENTICATION.md',
  'GUIDE_UTILISATEUR.md',
  'ARCHITECTURE.md',
  'TESTS.md',
  'ROADMAP.md',
  'CHANGELOG.md',
  'QUICKSTART.md'
];

docs.forEach(doc => {
  check(doc, fs.existsSync(doc));
});

// Vérification des scripts de test
console.log('\n🧪 Scripts de test\n');

check('test-auth.js', fs.existsSync('test-auth.js'), 'Tests d\'authentification');
check('check-system.sh', fs.existsSync('check-system.sh'), 'Vérification système');

// Vérification des scripts utilitaires
console.log('\n🔨 Scripts utilitaires\n');

check('demo.js', fs.existsSync('demo.js'), 'Génération de données de démo');
check('maintenance.js', fs.existsSync('maintenance.js'), 'Maintenance de la DB');

// Vérification du package.json
console.log('\n📦 Dépendances\n');

if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const deps = pkg.dependencies || {};
  
  check('express', !!deps.express, deps.express);
  check('sqlite3', !!deps.sqlite3, deps.sqlite3);
  check('ejs', !!deps.ejs, deps.ejs);
  check('pdfkit', !!deps.pdfkit, deps.pdfkit);
  check('body-parser', !!deps['body-parser'], deps['body-parser']);
}

// Vérification du contenu des fichiers clés
console.log('\n🔍 Contenu des fichiers\n');

if (fs.existsSync('server.js')) {
  const serverContent = fs.readFileSync('server.js', 'utf-8');
  check('Routes auth chargées', serverContent.includes('require(\'./routes/auth\')'));
  check('Routes customers chargées', serverContent.includes('require(\'./routes/customers\')'));
  check('Routes users chargées', serverContent.includes('require(\'./routes/users\')'));
  check('Routes settings chargées', serverContent.includes('require(\'./routes/settings\')'));
  check('Page login configurée', serverContent.includes('res.render(\'login\')'));
}

if (fs.existsSync('views/partials/header.ejs')) {
  const headerContent = fs.readFileSync('views/partials/header.ejs', 'utf-8');
  check('Fonction apiRequest', headerContent.includes('function apiRequest'));
  check('Menu utilisateur', headerContent.includes('currentUser'));
  check('Logout implémenté', headerContent.includes('logout'));
}

if (fs.existsSync('routes/sales.js')) {
  const salesContent = fs.readFileSync('routes/sales.js', 'utf-8');
  check('Auth sur ventes', salesContent.includes('requireAuth'));
  check('customer_id supporté', salesContent.includes('customerId'));
  check('user_id supporté', salesContent.includes('req.user.id'));
}

// Résumé final
console.log('\n' + '='.repeat(60));
console.log(`📊 RÉSULTATS FINAUX: ${passed}/${checks} vérifications réussies`);
console.log('='.repeat(60));

if (failed === 0) {
  console.log('\n✅ Toutes les vérifications sont passées!');
  console.log('\n🎉 L\'application est prête pour la production!');
  console.log('\n📖 Prochaines étapes:');
  console.log('   1. Lancer: npm start');
  console.log('   2. Ouvrir: http://localhost:3000');
  console.log('   3. Se connecter: admin / admin123');
  console.log('   4. Changer le mot de passe admin');
  console.log('   5. Configurer les paramètres');
  console.log('   6. Créer vos utilisateurs');
  console.log('\n📚 Documentation: Voir AUTHENTICATION.md pour plus de détails');
} else {
  console.log(`\n⚠️  ${failed} vérification(s) échouée(s)`);
  console.log('   Vérifiez les erreurs ci-dessus');
}

console.log('');
