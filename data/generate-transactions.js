const fs = require('fs');

const txnTypes = ['Deposit', 'Withdrawal', 'Transfer', 'Trade', 'Refund', 'Fee'];
const instruments = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'EUR/USD', 'GBP/USD', 'BTC/USD', 'ETH/USD', 'Gold', 'Silver', 'Oil', 'S&P500', 'NASDAQ', 'DAX', 'Nikkei'];
const currencies = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'CHF', 'JPY', 'AUD', 'CAD', 'SGD'];
const statuses = ['Completed', 'Completed', 'Completed', 'Completed', 'Pending', 'Failed', 'Flagged', 'Cancelled'];
const flagReasons = ['', '', '', '', '', 'High amount', 'Unusual pattern', 'Velocity check', 'Geo mismatch', 'AML alert', 'Sanctions match', 'PEP transaction'];
const paymentMethods = ['Bank Transfer', 'Credit Card', 'Debit Card', 'Wire Transfer', 'Crypto Wallet', 'E-Wallet', 'ACH', 'SEPA'];

const exchangeRates = { USD: 1, EUR: 1.08, GBP: 1.27, AED: 0.27, SAR: 0.27, CHF: 1.13, JPY: 0.0067, AUD: 0.65, CAD: 0.74, SGD: 0.74 };

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomAmount() {
  const ranges = [[10, 500], [500, 2000], [2000, 10000], [10000, 50000], [50000, 200000]];
  const weights = [0.35, 0.30, 0.20, 0.10, 0.05];
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) {
      return (Math.random() * (ranges[i][1] - ranges[i][0]) + ranges[i][0]).toFixed(2);
    }
  }
  return (Math.random() * 1000 + 100).toFixed(2);
}

function randomIP() {
  return `${randomInt(1, 223)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
}

function randomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

function generateExternalRef() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = '';
  for (let i = 0; i < 12; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

// Generate 500 transactions
let csv = 'txn_id,user_id,txn_type,instrument,amount,currency,amount_usd,status,flag_reason,payment_method,external_ref,ip_address,created_at,processed_at\n';

const startDate = new Date('2024-01-01');
const endDate = new Date('2025-12-31');

for (let i = 1; i <= 500; i++) {
  const txnId = `TXN-${String(i).padStart(6, '0')}`;
  const userId = randomInt(1, 100);
  const txnType = randomElement(txnTypes);
  const instrument = txnType === 'Trade' ? randomElement(instruments) : '';
  const currency = randomElement(currencies);
  const amount = randomAmount();
  const amountUsd = (parseFloat(amount) * exchangeRates[currency]).toFixed(2);
  
  let status = randomElement(statuses);
  let flagReason = '';
  
  // Higher amounts more likely to be flagged
  if (parseFloat(amountUsd) > 50000 && Math.random() < 0.4) {
    status = 'Flagged';
    flagReason = randomElement(flagReasons.filter(r => r !== ''));
  } else if (status === 'Flagged') {
    flagReason = randomElement(flagReasons.filter(r => r !== ''));
  }
  
  const paymentMethod = randomElement(paymentMethods);
  const externalRef = `EXT-${generateExternalRef()}`;
  const ipAddress = randomIP();
  const createdAt = randomDate(startDate, endDate);
  const createdDate = new Date(createdAt);
  const processedAt = status === 'Pending' ? '' : new Date(createdDate.getTime() + randomInt(1000, 86400000)).toISOString().replace('T', ' ').substring(0, 19);
  
  csv += `${txnId},${userId},${txnType},${instrument},${amount},${currency},${amountUsd},${status},${flagReason},${paymentMethod},${externalRef},${ipAddress},${createdAt},${processedAt}\n`;
}

fs.writeFileSync('transactions.csv', csv);
console.log('Generated 500 transactions in transactions.csv');
