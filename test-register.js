#!/usr/bin/env node

/**
 * Test de la fonctionnalité d'inscription
 */

const http = require('http');

const testCases = [
  {
    name: 'Inscription réussie',
    data: {
      username: 'testuser',
      password: 'test123',
      confirm_password: 'test123',
      email: 'test@example.com',
      full_name: 'Test User'
    }
  },
  {
    name: 'Mot de passe trop court',
    data: {
      username: 'testuser2',
      password: '123',
      confirm_password: '123',
      email: 'test2@example.com',
      full_name: 'Test User 2'
    },
    expectError: true
  },
  {
    name: 'Mots de passe non correspondants',
    data: {
      username: 'testuser3',
      password: 'test123',
      confirm_password: 'test456',
      email: 'test3@example.com',
      full_name: 'Test User 3'
    },
    expectError: true
  },
  {
    name: 'Username déjà existant',
    data: {
      username: 'admin',
      password: 'test123',
      confirm_password: 'test123',
      email: 'test4@example.com',
      full_name: 'Test User 4'
    },
    expectError: true
  }
];

function runTest(testCase) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testCase.data);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ statusCode: res.statusCode, result });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runAllTests() {
  console.log('🧪 Test de la fonctionnalité d\'inscription');
  console.log('═'.repeat(70));
  console.log('');

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      console.log(`📝 Test: ${testCase.name}`);
      console.log(`   Données:`, JSON.stringify(testCase.data, null, 2).split('\n').join('\n   '));

      const { statusCode, result } = await runTest(testCase);

      if (testCase.expectError) {
        if (statusCode >= 400) {
          console.log(`   ✅ Erreur détectée comme attendu: ${result.error}`);
          passed++;
        } else {
          console.log(`   ❌ Devrait échouer mais a réussi`);
          failed++;
        }
      } else {
        if (statusCode === 200 && result.success) {
          console.log(`   ✅ Inscription réussie`);
          console.log(`   📊 Utilisateur créé:`, result.user);
          if (result.sessionId) {
            console.log(`   🔑 Session ID: ${result.sessionId}`);
          }
          passed++;
        } else {
          console.log(`   ❌ Échec: ${result.error || 'Erreur inconnue'}`);
          failed++;
        }
      }
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
      failed++;
    }

    console.log('');
  }

  console.log('═'.repeat(70));
  console.log(`\n📊 Résultats: ${passed} réussis, ${failed} échoués sur ${testCases.length} tests`);
  
  if (failed === 0) {
    console.log('✅ Tous les tests sont passés !');
  } else {
    console.log('❌ Certains tests ont échoué');
  }
}

// Vérifier que le serveur est démarré
const checkServer = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET'
}, (res) => {
  runAllTests();
});

checkServer.on('error', (error) => {
  console.error('❌ Le serveur ne semble pas démarré sur http://localhost:3000');
  console.error('   Démarrez-le avec: npm start');
  process.exit(1);
});

checkServer.end();
