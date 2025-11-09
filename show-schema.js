#!/usr/bin/env node

/**
 * Affichage du schéma de la base de données
 */

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/commerce.db');

console.log('📊 SCHÉMA DE LA BASE DE DONNÉES\n');
console.log('='.repeat(70));

// Récupérer toutes les tables
db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
  if (err) {
    console.error('Erreur:', err);
    return;
  }

  let index = 0;
  
  function showNextTable() {
    if (index >= tables.length) {
      console.log('\n' + '='.repeat(70));
      console.log('\n✅ Base de données : database/commerce.db');
      console.log(`📋 Total : ${tables.length} tables\n`);
      db.close();
      return;
    }

    const table = tables[index++];
    console.log(`\n\n📋 Table: ${table.name.toUpperCase()}`);
    console.log('-'.repeat(70));

    // Récupérer les colonnes
    db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
      if (err) {
        console.error('Erreur:', err);
        showNextTable();
        return;
      }

      console.log('\nColonnes:');
      columns.forEach(col => {
        const pk = col.pk ? ' 🔑 PRIMARY KEY' : '';
        const notnull = col.notnull ? ' NOT NULL' : '';
        const defaultVal = col.dflt_value ? ` DEFAULT ${col.dflt_value}` : '';
        console.log(`  • ${col.name.padEnd(20)} ${col.type.padEnd(15)}${notnull}${defaultVal}${pk}`);
      });

      // Compter les enregistrements
      db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, row) => {
        if (!err && row) {
          console.log(`\n📊 Enregistrements: ${row.count}`);
        }
        showNextTable();
      });
    });
  }

  showNextTable();
});
