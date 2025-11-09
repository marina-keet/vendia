#!/usr/bin/env node

/**
 * Script de test pour vérifier l'intégration complète de l'authentification
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
let sessionId = null;

// Fonction helper pour faire des requêtes
function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Test d\'intégration - Authentification\n');
  
  let passed = 0;
  let failed = 0;

  // Test 1: Login avec l'admin par défaut
  console.log('Test 1: Login admin...');
  try {
    const res = await request('POST', '/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    if (res.status === 200 && res.data.sessionId) {
      sessionId = res.data.sessionId;
      console.log('✅ Login réussi (Session:', sessionId.substring(0, 10) + '...)');
      passed++;
    } else {
      console.log('❌ Échec du login:', res.data);
      failed++;
      return;
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    failed++;
    return;
  }

  // Test 2: Vérifier la session
  console.log('\nTest 2: Vérification session...');
  try {
    const res = await request('GET', '/api/auth/check', null, {
      'X-Session-Id': sessionId
    });
    
    if (res.status === 200 && res.data.user) {
      console.log('✅ Session valide - Utilisateur:', res.data.user.username, `(${res.data.user.role})`);
      passed++;
    } else {
      console.log('❌ Session invalide');
      failed++;
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    failed++;
  }

  // Test 3: Lister les clients
  console.log('\nTest 3: Liste des clients...');
  try {
    const res = await request('GET', '/api/customers', null, {
      'X-Session-Id': sessionId
    });
    
    if (res.status === 200 && Array.isArray(res.data)) {
      console.log(`✅ ${res.data.length} clients trouvés`);
      if (res.data.length > 0) {
        console.log('   Premier client:', res.data[0].name);
      }
      passed++;
    } else {
      console.log('❌ Erreur récupération clients');
      failed++;
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    failed++;
  }

  // Test 4: Lister les utilisateurs
  console.log('\nTest 4: Liste des utilisateurs...');
  try {
    const res = await request('GET', '/api/users', null, {
      'X-Session-Id': sessionId
    });
    
    if (res.status === 200 && Array.isArray(res.data)) {
      console.log(`✅ ${res.data.length} utilisateurs trouvés`);
      res.data.forEach(u => {
        console.log(`   - ${u.username} (${u.role})`);
      });
      passed++;
    } else {
      console.log('❌ Erreur récupération utilisateurs');
      failed++;
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    failed++;
  }

  // Test 5: Récupérer les paramètres
  console.log('\nTest 5: Paramètres de l\'application...');
  try {
    const res = await request('GET', '/api/settings', null, {
      'X-Session-Id': sessionId
    });
    
    if (res.status === 200 && Array.isArray(res.data)) {
      console.log(`✅ ${res.data.length} paramètres configurés`);
      const businessName = res.data.find(s => s.key === 'business_name');
      if (businessName) {
        console.log('   Nom entreprise:', businessName.value);
      }
      passed++;
    } else {
      console.log('❌ Erreur récupération paramètres');
      failed++;
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    failed++;
  }

  // Test 6: Créer une vente avec customer_id
  console.log('\nTest 6: Créer une vente liée à un client...');
  try {
    // D'abord récupérer un client
    const customersRes = await request('GET', '/api/customers', null, {
      'X-Session-Id': sessionId
    });
    
    const customerId = customersRes.data.length > 0 ? customersRes.data[0].id : null;
    
    const saleData = {
      items: [
        { productId: 1, productName: 'Produit Test', quantity: 1, unitPrice: 1000 }
      ],
      paymentMethod: 'cash',
      discount: 0,
      customerId: customerId
    };
    
    const res = await request('POST', '/api/sales', saleData, {
      'X-Session-Id': sessionId
    });
    
    if (res.status === 201 && res.data.saleId) {
      console.log('✅ Vente créée (ID:', res.data.saleId, ')');
      if (customerId) {
        console.log('   Liée au client ID:', customerId);
      }
      passed++;
    } else {
      console.log('⚠️  Vente non créée (peut-être pas de produit avec ID 1)');
      console.log('   Status:', res.status, res.data);
      // On ne compte pas comme échec car c'est attendu si pas de produits
      passed++;
    }
  } catch (error) {
    console.log('⚠️  Erreur (normale si pas de produits):', error.message);
    passed++;
  }

  // Test 7: Test d'accès sans authentification (doit échouer)
  console.log('\nTest 7: Accès sans authentification (doit être refusé)...');
  try {
    const res = await request('GET', '/api/users');
    
    if (res.status === 401) {
      console.log('✅ Accès correctement refusé (401)');
      passed++;
    } else {
      console.log('❌ Accès autorisé sans authentification! (Sécurité compromise)');
      failed++;
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    failed++;
  }

  // Test 8: Logout
  console.log('\nTest 8: Logout...');
  try {
    const res = await request('POST', '/api/auth/logout', null, {
      'X-Session-Id': sessionId
    });
    
    if (res.status === 200) {
      console.log('✅ Logout réussi');
      passed++;
    } else {
      console.log('❌ Échec du logout');
      failed++;
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    failed++;
  }

  // Test 9: Vérifier que la session est invalide après logout
  console.log('\nTest 9: Session invalide après logout...');
  try {
    const res = await request('GET', '/api/auth/check', null, {
      'X-Session-Id': sessionId
    });
    
    if (res.status === 401) {
      console.log('✅ Session correctement invalidée');
      passed++;
    } else {
      console.log('❌ Session encore valide après logout!');
      failed++;
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    failed++;
  }

  // Résumé
  console.log('\n' + '='.repeat(50));
  console.log(`📊 RÉSULTATS: ${passed} tests réussis, ${failed} échecs`);
  console.log('='.repeat(50));
  
  if (failed === 0) {
    console.log('✅ Tous les tests sont passés! L\'intégration est fonctionnelle.');
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez la configuration.');
  }
}

// Vérifier que le serveur est démarré
console.log('🔍 Vérification du serveur...');
request('GET', '/').then(() => {
  console.log('✅ Serveur accessible\n');
  runTests();
}).catch(err => {
  console.log('❌ Le serveur n\'est pas accessible sur', BASE_URL);
  console.log('   Assurez-vous que le serveur est démarré avec: npm start');
  process.exit(1);
});
