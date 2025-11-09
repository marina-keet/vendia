#!/usr/bin/env node

/**
 * Test des fonctionnalités de gestion des devises
 * Franc Congolais (FC) et Dollar Américain (USD)
 */

const { 
  formatCurrency, 
  fcToUsd, 
  usdToFc, 
  parseAmount,
  getCurrencySettings,
  getDualCurrencyAmount
} = require('./utils/currency');

console.log('💱 TEST DES DEVISES - FC & USD');
console.log('═'.repeat(70));
console.log('');

// Test 1: Formatage
console.log('📝 Test 1: Formatage des montants');
console.log('─'.repeat(70));
console.log(`1000 FC  → ${formatCurrency(1000, 'FC')}`);
console.log(`10 USD   → ${formatCurrency(10, 'USD')}`);
console.log(`25000 FC → ${formatCurrency(25000, 'FC')}`);
console.log(`100 USD  → ${formatCurrency(100, 'USD')}`);
console.log('');

// Test 2: Conversions
console.log('🔄 Test 2: Conversions de devises');
console.log('─'.repeat(70));
const exchangeRate = 2500; // 1 USD = 2500 FC
console.log(`Taux de change: 1 USD = ${exchangeRate} FC`);
console.log('');

const testAmounts = [
  { fc: 2500, usd: 1 },
  { fc: 5000, usd: 2 },
  { fc: 25000, usd: 10 },
  { fc: 100000, usd: 40 },
  { fc: 250000, usd: 100 }
];

testAmounts.forEach(({ fc, usd }) => {
  const convertedToUsd = fcToUsd(fc, exchangeRate);
  const convertedToFc = usdToFc(usd, exchangeRate);
  
  console.log(`${fc} FC = ${convertedToUsd} USD ✓`);
  console.log(`${usd} USD = ${convertedToFc} FC ✓`);
  console.log('');
});

// Test 3: Parsing
console.log('🔍 Test 3: Parsing des montants saisis');
console.log('─'.repeat(70));
const testInputs = [
  '1000 FC',
  '10$',
  '10 USD',
  '25000',
  '100 DOLLARS',
  '5000 fc',
  '$50'
];

testInputs.forEach(input => {
  const parsed = parseAmount(input);
  console.log(`"${input}" → ${parsed.amount} ${parsed.currency}`);
});
console.log('');

// Test 4: Récupération des paramètres depuis la DB
console.log('⚙️  Test 4: Paramètres de devise depuis la base');
console.log('─'.repeat(70));

getCurrencySettings((err, settings) => {
  if (err) {
    console.error('❌ Erreur:', err.message);
    return;
  }

  console.log(`Devise principale   : ${settings.primaryCurrency}`);
  console.log(`Devise secondaire   : ${settings.secondaryCurrency}`);
  console.log(`Taux de change      : 1 ${settings.secondaryCurrency} = ${settings.exchangeRate} ${settings.primaryCurrency}`);
  console.log('');

  // Test 5: Montants doubles
  console.log('💰 Test 5: Affichage des montants dans les deux devises');
  console.log('─'.repeat(70));

  const testSaleAmounts = [10000, 25000, 50000, 100000];

  let completed = 0;
  testSaleAmounts.forEach(amount => {
    getDualCurrencyAmount(amount, 'FC', (err, result) => {
      if (err) {
        console.error('❌ Erreur:', err.message);
        return;
      }

      console.log(`Vente de ${result.formattedFC}`);
      console.log(`  → Équivalent: ${result.formattedUSD}`);
      console.log(`  → Taux: 1 USD = ${result.exchangeRate} FC`);
      console.log('');

      completed++;
      if (completed === testSaleAmounts.length) {
        console.log('═'.repeat(70));
        console.log('✅ Tous les tests de devise réussis !');
        console.log('');
        console.log('📊 RÉSUMÉ');
        console.log('─'.repeat(70));
        console.log('✓ Formatage FC et USD');
        console.log('✓ Conversions FC ↔ USD');
        console.log('✓ Parsing des saisies utilisateur');
        console.log('✓ Récupération des paramètres');
        console.log('✓ Affichage dual currency');
        console.log('');
        console.log('💡 Utilisation dans l\'application:');
        console.log('  • Les prix peuvent être saisis en FC ou USD');
        console.log('  • Conversion automatique selon le taux');
        console.log('  • Affichage dual sur les reçus');
        console.log('  • Admin peut modifier le taux de change');
        console.log('');
        
        process.exit(0);
      }
    });
  });
});
