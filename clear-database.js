#!/usr/bin/env node

/**
 * Script pour vider toutes les données de la base de données
 * Conserve la structure des tables mais supprime tous les enregistrements
 */

const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');
const db = new sqlite3.Database('./database/commerce.db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('⚠️  ATTENTION : SUPPRESSION DE TOUTES LES DONNÉES');
console.log('━'.repeat(70));
console.log('');
console.log('Cette opération va supprimer TOUTES les données de la base :');
console.log('  • Tous les utilisateurs (sauf admin par défaut)');
console.log('  • Tous les clients');
console.log('  • Tous les produits');
console.log('  • Toutes les ventes et articles vendus');
console.log('  • Tous les paiements');
console.log('  • Toutes les sessions actives');
console.log('  • Tous les paramètres personnalisés');
console.log('');
console.log('⚠️  LA STRUCTURE DES TABLES SERA CONSERVÉE');
console.log('⚠️  CETTE ACTION EST IRRÉVERSIBLE');
console.log('');

rl.question('Êtes-vous sûr de vouloir continuer ? (tapez "OUI" pour confirmer) : ', (answer) => {
  if (answer.toUpperCase() !== 'OUI') {
    console.log('\n❌ Opération annulée.');
    rl.close();
    db.close();
    return;
  }

  console.log('\n🗑️  Suppression des données en cours...\n');

  db.serialize(() => {
    // Désactiver les contraintes de clés étrangères temporairement
    db.run('PRAGMA foreign_keys = OFF');

    let completed = 0;
    const total = 8;

    function checkComplete() {
      completed++;
      if (completed === total) {
        // Réactiver les contraintes
        db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            console.error('❌ Erreur réactivation contraintes:', err.message);
          }
          
          console.log('\n✅ Toutes les données ont été supprimées !');
          console.log('\n📊 État de la base de données :');
          
          // Vérifier que tout est vide
          db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", (err, tables) => {
            if (err) {
              console.error('Erreur:', err);
              db.close();
              rl.close();
              return;
            }

            let checks = 0;
            tables.forEach(table => {
              db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, row) => {
                if (!err) {
                  console.log(`  • ${table.name.padEnd(20)} : ${row.count} enregistrement(s)`);
                }
                checks++;
                if (checks === tables.length) {
                  console.log('\n💡 Pour recréer les données par défaut :');
                  console.log('   $ node database/schema-extended.js   # Recréer admin');
                  console.log('   $ node demo.js                      # Ajouter données de démo');
                  console.log('');
                  db.close();
                  rl.close();
                }
              });
            });
          });
        });
      }
    }

    // 1. Supprimer les sessions
    db.run('DELETE FROM sessions', (err) => {
      if (err) {
        console.error('❌ Erreur sessions:', err.message);
      } else {
        console.log('✅ Sessions supprimées');
      }
      checkComplete();
    });

    // 2. Supprimer les paramètres (settings)
    db.run('DELETE FROM settings', (err) => {
      if (err) {
        console.error('❌ Erreur settings:', err.message);
      } else {
        console.log('✅ Paramètres supprimés');
      }
      checkComplete();
    });

    // 3. Supprimer les paiements
    db.run('DELETE FROM payments', (err) => {
      if (err) {
        console.error('❌ Erreur payments:', err.message);
      } else {
        console.log('✅ Paiements supprimés');
      }
      checkComplete();
    });

    // 4. Supprimer les articles vendus
    db.run('DELETE FROM sale_items', (err) => {
      if (err) {
        console.error('❌ Erreur sale_items:', err.message);
      } else {
        console.log('✅ Articles vendus supprimés');
      }
      checkComplete();
    });

    // 5. Supprimer les ventes
    db.run('DELETE FROM sales', (err) => {
      if (err) {
        console.error('❌ Erreur sales:', err.message);
      } else {
        console.log('✅ Ventes supprimées');
      }
      checkComplete();
    });

    // 6. Supprimer les produits
    db.run('DELETE FROM products', (err) => {
      if (err) {
        console.error('❌ Erreur products:', err.message);
      } else {
        console.log('✅ Produits supprimés');
      }
      checkComplete();
    });

    // 7. Supprimer les clients
    db.run('DELETE FROM customers', (err) => {
      if (err) {
        console.error('❌ Erreur customers:', err.message);
      } else {
        console.log('✅ Clients supprimés');
      }
      checkComplete();
    });

    // 8. Supprimer les utilisateurs
    db.run('DELETE FROM users', (err) => {
      if (err) {
        console.error('❌ Erreur users:', err.message);
      } else {
        console.log('✅ Utilisateurs supprimés');
      }
      checkComplete();
    });

    // Réinitialiser les séquences auto-increment
    db.run('DELETE FROM sqlite_sequence', (err) => {
      if (err) {
        console.error('⚠️  Attention: Impossible de réinitialiser les séquences:', err.message);
      }
    });
  });
});
