/**
 * Utilitaires pour la gestion des devises
 * Support : Franc Congolais (FC) et Dollar Américain (USD)
 */

const db = require('../database/init');

/**
 * Récupérer les paramètres de devise
 */
function getCurrencySettings(callback) {
  db.all(`
    SELECT key, value FROM settings 
    WHERE key IN ('currency', 'secondary_currency', 'exchange_rate')
  `, (err, rows) => {
    if (err) {
      return callback(err);
    }

    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });

    callback(null, {
      primaryCurrency: settings.currency || 'FC',
      secondaryCurrency: settings.secondary_currency || 'USD',
      exchangeRate: parseFloat(settings.exchange_rate) || 2500
    });
  });
}

/**
 * Convertir un montant de FC vers USD
 */
function fcToUsd(amountFC, exchangeRate) {
  return amountFC / exchangeRate;
}

/**
 * Convertir un montant de USD vers FC
 */
function usdToFc(amountUSD, exchangeRate) {
  return amountUSD * exchangeRate;
}

/**
 * Formater un montant avec la devise
 */
function formatCurrency(amount, currency = 'FC') {
  const formatted = new Intl.NumberFormat('fr-CD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);

  if (currency === 'FC') {
    return `${formatted} FC`;
  } else if (currency === 'USD') {
    return `${formatted} $`;
  } else {
    return `${formatted} ${currency}`;
  }
}

/**
 * Convertir un montant entre deux devises
 */
function convertCurrency(amount, fromCurrency, toCurrency, exchangeRate, callback) {
  if (fromCurrency === toCurrency) {
    return callback(null, amount);
  }

  if (fromCurrency === 'FC' && toCurrency === 'USD') {
    return callback(null, fcToUsd(amount, exchangeRate));
  }

  if (fromCurrency === 'USD' && toCurrency === 'FC') {
    return callback(null, usdToFc(amount, exchangeRate));
  }

  callback(new Error('Conversion non supportée'));
}

/**
 * Calculer le montant équivalent dans les deux devises
 */
function getDualCurrencyAmount(amount, currency, callback) {
  getCurrencySettings((err, settings) => {
    if (err) {
      return callback(err);
    }

    const result = {
      originalAmount: amount,
      originalCurrency: currency,
      exchangeRate: settings.exchangeRate
    };

    if (currency === 'FC') {
      result.amountFC = amount;
      result.amountUSD = fcToUsd(amount, settings.exchangeRate);
      result.formattedFC = formatCurrency(amount, 'FC');
      result.formattedUSD = formatCurrency(result.amountUSD, 'USD');
    } else if (currency === 'USD') {
      result.amountUSD = amount;
      result.amountFC = usdToFc(amount, settings.exchangeRate);
      result.formattedUSD = formatCurrency(amount, 'USD');
      result.formattedFC = formatCurrency(result.amountFC, 'FC');
    }

    callback(null, result);
  });
}

/**
 * Middleware pour ajouter les fonctions de devise à req
 */
function currencyMiddleware(req, res, next) {
  getCurrencySettings((err, settings) => {
    if (err) {
      return next(err);
    }

    req.currency = {
      settings,
      format: (amount, currency) => formatCurrency(amount, currency || settings.primaryCurrency),
      convert: (amount, from, to, callback) => convertCurrency(amount, from, to, settings.exchangeRate, callback),
      getDual: (amount, currency, callback) => getDualCurrencyAmount(amount, currency, callback)
    };

    next();
  });
}

/**
 * Parser un montant saisi avec devise
 * Exemples: "1000 FC", "10$", "10 USD", "1000"
 */
function parseAmount(input) {
  const cleaned = String(input).trim().toUpperCase();
  
  // Montant en FC
  if (cleaned.includes('FC')) {
    const amount = parseFloat(cleaned.replace(/[^0-9.]/g, ''));
    return { amount, currency: 'FC' };
  }
  
  // Montant en USD
  if (cleaned.includes('$') || cleaned.includes('USD') || cleaned.includes('DOLLAR')) {
    const amount = parseFloat(cleaned.replace(/[^0-9.]/g, ''));
    return { amount, currency: 'USD' };
  }
  
  // Par défaut, considérer comme FC
  const amount = parseFloat(cleaned.replace(/[^0-9.]/g, ''));
  return { amount, currency: 'FC' };
}

module.exports = {
  getCurrencySettings,
  formatCurrency,
  convertCurrency,
  fcToUsd,
  usdToFc,
  getDualCurrencyAmount,
  currencyMiddleware,
  parseAmount
};
