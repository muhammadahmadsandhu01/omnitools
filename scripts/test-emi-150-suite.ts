/**
 * Comprehensive 150+ Test Suite for KivaroTools EMI & Loan Calculator Engine
 *
 * Covers:
 * 1. Standard reducing-balance loans across 1 to 50 year tenures
 * 2. 0% interest and near-zero sub-basis point interest rates
 * 3. High interest rates (20%, 36%, 50%, 100%) and extreme boundary rates
 * 4. Payment frequencies: Monthly (12/yr), Biweekly (26/yr), Weekly (52/yr)
 * 5. Ordinary Annuity (End of Period / In Arrears) vs Annuity Due (Beginning of Period / In Advance)
 * 6. Extra recurring payments of various amounts
 * 7. One-time prepayments at different periods and modes (term reduction, payment re-cast, immediate)
 * 8. Prepayment boundary conditions (prepayments exceeding balance, prepayments past payoff)
 * 9. Fee modeling (origination fees, periodic recurring fees, combined fees)
 * 10. Multi-currency formatting across minor units (0, 2, 3 decimals)
 * 11. String parsing and sanitization (commas, spaces, symbols, negative clamping)
 * 12. Mathematical conservation laws and invariants (Principal sum, non-negative balance, final balance = 0)
 * 13. URL serialization & deserialization round-trips
 * 14. RFC-4180 CSV export validation and formula injection defense
 * 15. Yearly summary aggregation and schedule reconciliation
 */

import {
  calculateLoan,
  calculateScheduledPayment,
  calculatePeriodicRate,
  getPeriodsPerYear,
  safeNumber,
  parseCleanNumber,
  validateLoanParams,
  formatCurrencyAmount,
  formatDuration,
  serializeLoanUrl,
  deserializeLoanUrl,
  generateCsvExport,
  escapeCsvCell,
  compareScenarios,
  WORLD_CURRENCIES,
  LoanParams,
  CurrencyItem,
} from '../components/tools/emiCalculatorEngine';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testId: string, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testId}: ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testId}: ${message}`);
  }
}

console.log('================================================================');
console.log('       KIVAROTOOLS EMI CALCULATOR 150+ TEST SUITE             ');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// SECTION 1: Standard Amortization Benchmarks Across Tenures (1 to 50 years)
// -----------------------------------------------------------------------------
console.log('--- Section 1: Standard Amortization Benchmarks Across Tenures ---');
const standardTenures = [1, 2, 3, 5, 7, 10, 15, 20, 25, 30, 40, 50];
for (const tenure of standardTenures) {
  const p = 50000;
  const rate = 8;
  const res = calculateLoan({ principal: p, annualRate: rate, years: tenure, frequency: 'monthly', timing: 'end' });
  const expectedPeriods = tenure * 12;

  assert(res.payoffPeriods === expectedPeriods, `TENURE-${tenure}Y-PER`, `${tenure}yr loan has exactly ${expectedPeriods} periods (got ${res.payoffPeriods})`);
  assert(Math.abs(res.totalPrincipal - p) < 0.05, `TENURE-${tenure}Y-PRIN`, `${tenure}yr loan repays exactly $${p} principal (got ${res.totalPrincipal.toFixed(2)})`);
  assert(res.schedule[res.schedule.length - 1].closingBalance === 0, `TENURE-${tenure}Y-BAL`, `${tenure}yr loan ending balance is 0.00`);
  assert(res.totalInterest > 0, `TENURE-${tenure}Y-INT`, `${tenure}yr loan has positive interest: $${res.totalInterest.toFixed(2)}`);
}

// -----------------------------------------------------------------------------
// SECTION 2: Zero and Sub-Basis-Point Interest Rates
// -----------------------------------------------------------------------------
console.log('\n--- Section 2: Zero and Sub-Basis-Point Interest Rates ---');
const zeroRateRes = calculateLoan({ principal: 24000, annualRate: 0, years: 2, frequency: 'monthly', timing: 'end' });
assert(Math.abs(zeroRateRes.scheduledPayment - 1000) < 0.01, 'ZERO-RATE-PMT', 'Zero rate payment is exactly P / n: $1,000 (got ' + zeroRateRes.scheduledPayment.toFixed(2) + ')');
assert(zeroRateRes.totalInterest === 0, 'ZERO-RATE-INT', 'Zero rate total interest is exactly 0.00');
assert(Math.abs(zeroRateRes.totalPaid - 24000) < 0.01, 'ZERO-RATE-TOTAL', 'Zero rate total paid equals principal ($24,000)');

const microRates = [0.0001, 0.001, 0.01, 0.05, 0.1];
for (const mr of microRates) {
  const res = calculateLoan({ principal: 10000, annualRate: mr, years: 1, frequency: 'monthly', timing: 'end' });
  assert(Number.isFinite(res.scheduledPayment) && res.scheduledPayment > 0, `MICRO-RATE-${mr}-PMT`, `Rate ${mr}% yields finite positive payment: ${res.scheduledPayment.toFixed(4)}`);
  assert(Number.isFinite(res.totalInterest) && res.totalInterest > 0, `MICRO-RATE-${mr}-INT`, `Rate ${mr}% yields finite positive interest: ${res.totalInterest.toFixed(4)}`);
  assert(res.schedule[res.schedule.length - 1].closingBalance === 0, `MICRO-RATE-${mr}-BAL`, `Rate ${mr}% fully amortizes to 0 balance`);
}

// -----------------------------------------------------------------------------
// SECTION 3: High and Extreme Interest Rates
// -----------------------------------------------------------------------------
console.log('\n--- Section 3: High and Extreme Interest Rates ---');
const highRates = [18, 24, 36, 50, 75, 100];
for (const hr of highRates) {
  const res = calculateLoan({ principal: 10000, annualRate: hr, years: 3, frequency: 'monthly', timing: 'end' });
  assert(Number.isFinite(res.scheduledPayment) && res.scheduledPayment > 0, `HIGH-RATE-${hr}-PMT`, `High rate ${hr}% payment is finite: $${res.scheduledPayment.toFixed(2)}`);
  assert(res.totalInterest > res.totalPrincipal * 0.2, `HIGH-RATE-${hr}-INT`, `High rate ${hr}% interest is proportional and positive`);
  assert(res.schedule[res.schedule.length - 1].closingBalance === 0, `HIGH-RATE-${hr}-BAL`, `High rate ${hr}% fully amortizes to 0 balance`);
}

// Extreme factor stability test (rate 500% over 50 years)
const extremePayment = calculateScheduledPayment(100000, 5, 600, 'end');
assert(Number.isFinite(extremePayment) && !isNaN(extremePayment), 'EXTREME-FACTOR-SAFE', 'Extreme interest factor does not yield NaN or Infinity: ' + extremePayment);

// -----------------------------------------------------------------------------
// SECTION 4: Payment Frequency Comparisons (Monthly vs Biweekly vs Weekly)
// -----------------------------------------------------------------------------
console.log('\n--- Section 4: Payment Frequency Comparisons ---');
const freqCases = [
  { principal: 15000, rate: 9.5, years: 3 },
  { principal: 30000, rate: 7.25, years: 5 },
  { principal: 60000, rate: 6.0, years: 10 },
];

for (let idx = 0; idx < freqCases.length; idx++) {
  const c = freqCases[idx];
  const mRes = calculateLoan({ principal: c.principal, annualRate: c.rate, years: c.years, frequency: 'monthly', timing: 'end' });
  const bRes = calculateLoan({ principal: c.principal, annualRate: c.rate, years: c.years, frequency: 'biweekly', timing: 'end' });
  const wRes = calculateLoan({ principal: c.principal, annualRate: c.rate, years: c.years, frequency: 'weekly', timing: 'end' });

  assert(mRes.payoffPeriods === c.years * 12, `FREQ-${idx}-M-PER`, `Monthly has ${c.years * 12} periods`);
  assert(bRes.payoffPeriods === c.years * 26, `FREQ-${idx}-B-PER`, `Biweekly has ${c.years * 26} periods`);
  assert(wRes.payoffPeriods === c.years * 52, `FREQ-${idx}-W-PER`, `Weekly has ${c.years * 52} periods`);

  assert(bRes.scheduledPayment < mRes.scheduledPayment, `FREQ-${idx}-B-LESS-M`, `Biweekly payment ($${bRes.scheduledPayment.toFixed(2)}) < Monthly ($${mRes.scheduledPayment.toFixed(2)})`);
  assert(wRes.scheduledPayment < bRes.scheduledPayment, `FREQ-${idx}-W-LESS-B`, `Weekly payment ($${wRes.scheduledPayment.toFixed(2)}) < Biweekly ($${bRes.scheduledPayment.toFixed(2)})`);

  // Weekly interest should be less than or equal to monthly interest due to faster principal reduction
  assert(wRes.totalInterest <= mRes.totalInterest + 0.1, `FREQ-${idx}-W-INT-LE-M`, `Weekly interest ($${wRes.totalInterest.toFixed(2)}) <= Monthly interest ($${mRes.totalInterest.toFixed(2)})`);
}

// -----------------------------------------------------------------------------
// SECTION 5: Payment Timing: Ordinary Annuity vs Annuity Due (In Advance)
// -----------------------------------------------------------------------------
console.log('\n--- Section 5: Payment Timing (In Arrears vs In Advance) ---');
const timingRates = [5, 8.5, 12, 15];
for (const tr of timingRates) {
  const endRes = calculateLoan({ principal: 20000, annualRate: tr, years: 3, frequency: 'monthly', timing: 'end' });
  const begRes = calculateLoan({ principal: 20000, annualRate: tr, years: 3, frequency: 'monthly', timing: 'beginning' });

  assert(begRes.scheduledPayment < endRes.scheduledPayment, `TIMING-${tr}-PMT`, `Annuity due payment ($${begRes.scheduledPayment.toFixed(2)}) < Ordinary payment ($${endRes.scheduledPayment.toFixed(2)})`);
  assert(begRes.totalInterest < endRes.totalInterest, `TIMING-${tr}-INT`, `Annuity due total interest ($${begRes.totalInterest.toFixed(2)}) < Ordinary interest ($${endRes.totalInterest.toFixed(2)})`);
  assert(begRes.schedule[0].interestPaid === 0, `TIMING-${tr}-FIRST-INT-ZERO`, `Annuity due Period 1 interest is exactly $0 (paid at inception)`);
  assert(begRes.schedule[begRes.schedule.length - 1].closingBalance === 0, `TIMING-${tr}-BAL`, `Annuity due fully amortizes to 0 balance`);
}

// -----------------------------------------------------------------------------
// SECTION 6: Extra Recurring Principal Prepayments
// -----------------------------------------------------------------------------
console.log('\n--- Section 6: Extra Recurring Principal Prepayments ---');
const extraAmounts = [25, 50, 100, 200, 500];
const baseLoan = calculateLoan({ principal: 25000, annualRate: 10, years: 5, frequency: 'monthly', timing: 'end' });

for (const ex of extraAmounts) {
  const exRes = calculateLoan({ principal: 25000, annualRate: 10, years: 5, frequency: 'monthly', timing: 'end', extraPayment: ex });
  assert(exRes.payoffPeriods < baseLoan.payoffPeriods, `EXTRA-${ex}-TIME`, `Extra $${ex}/mo shortened periods from ${baseLoan.payoffPeriods} to ${exRes.payoffPeriods}`);
  assert(exRes.totalInterest < baseLoan.totalInterest, `EXTRA-${ex}-SAVINGS`, `Extra $${ex}/mo saved interest ($${exRes.totalInterest.toFixed(2)} vs $${baseLoan.totalInterest.toFixed(2)})`);
  assert(exRes.schedule[exRes.schedule.length - 1].closingBalance === 0, `EXTRA-${ex}-BAL`, `Extra $${ex}/mo final balance is exactly 0`);
  assert(Math.abs(exRes.totalPrincipal - 25000) < 0.05, `EXTRA-${ex}-PRIN`, `Extra $${ex}/mo repays exactly principal ($25,000)`);
}

// -----------------------------------------------------------------------------
// SECTION 7: One-Time Prepayment Modes & Periods
// -----------------------------------------------------------------------------
console.log('\n--- Section 7: One-Time Prepayment Modes & Periods ---');
const prepPeriods = [3, 6, 12, 18, 24];
for (const pp of prepPeriods) {
  const termRes = calculateLoan({ principal: 30000, annualRate: 9, years: 4, frequency: 'monthly', timing: 'end', oneTimePrepayment: 3000, prepaymentPeriod: pp, prepaymentMode: 'term' });
  assert(termRes.payoffPeriods < 48, `PREP-PERIOD-${pp}-TERM`, `One-time prepayment at period ${pp} shortens loan tenure (periods: ${termRes.payoffPeriods} < 48)`);
  assert(termRes.appliedPrepayment === 3000, `PREP-PERIOD-${pp}-APPLIED`, `Full prepayment $3,000 was applied at period ${pp}`);

  // Re-cast mode (reduce payment, keep full 48 periods)
  const recastRes = calculateLoan({ principal: 30000, annualRate: 9, years: 4, frequency: 'monthly', timing: 'end', oneTimePrepayment: 3000, prepaymentPeriod: pp, prepaymentMode: 'payment' });
  const postPrepayRow = recastRes.schedule[pp];
  assert(postPrepayRow.scheduledPayment < recastRes.scheduledPayment, `PREP-PERIOD-${pp}-RECAST-PMT`, `Re-cast lowered scheduled payment after period ${pp} ($${postPrepayRow.scheduledPayment.toFixed(2)} < $${recastRes.scheduledPayment.toFixed(2)})`);
  assert(recastRes.schedule[recastRes.schedule.length - 1].closingBalance === 0, `PREP-PERIOD-${pp}-RECAST-BAL`, `Re-cast mode fully amortizes to 0`);
}

// Immediate prepayment mode (inception)
const immRes = calculateLoan({ principal: 20000, annualRate: 8, years: 3, frequency: 'monthly', timing: 'end', oneTimePrepayment: 5000, prepaymentMode: 'immediate' });
assert(immRes.appliedPrepayment === 5000, 'PREP-IMM-APPLIED', 'Immediate prepayment applied at inception: $5,000');
assert(Math.abs(immRes.totalPrincipal - 20000) < 0.05, 'PREP-IMM-PRIN', 'Total principal repaid includes immediate prepayment ($20,000)');

// Prepayment exceeding remaining balance
const capRes = calculateLoan({ principal: 5000, annualRate: 8, years: 1, frequency: 'monthly', timing: 'end', oneTimePrepayment: 10000, prepaymentPeriod: 3 });
assert(capRes.appliedPrepayment < 10000, 'PREP-CAP-BALANCE', `Prepayment capped at balance ($${capRes.appliedPrepayment.toFixed(2)} < $10,000)`);
assert(capRes.schedule[capRes.schedule.length - 1].closingBalance === 0, 'PREP-CAP-NO-NEG', 'Balance never drops below 0');

// Prepayment period beyond payoff
const pastPayoffRes = calculateLoan({ principal: 10000, annualRate: 8, years: 1, frequency: 'monthly', timing: 'end', extraPayment: 1000, oneTimePrepayment: 2000, prepaymentPeriod: 12 });
assert(pastPayoffRes.isPrepaymentPastPayoff, 'PREP-PAST-PAYOFF-FLAG', 'Prepayment past payoff correctly flagged as unapplied');
assert(pastPayoffRes.unappliedPrepayment === 2000, 'PREP-PAST-PAYOFF-UNAPPLIED', 'Unapplied prepayment equals $2,000');

// -----------------------------------------------------------------------------
// SECTION 8: Loan Fee Modeling & Reconciliation
// -----------------------------------------------------------------------------
console.log('\n--- Section 8: Loan Fee Modeling & Reconciliation ---');
const feeCases = [
  { orig: 0, recur: 0 },
  { orig: 250, recur: 0 },
  { orig: 0, recur: 15 },
  { orig: 300, recur: 20 },
  { orig: 1000, recur: 50 },
];

for (let i = 0; i < feeCases.length; i++) {
  const fc = feeCases[i];
  const res = calculateLoan({ principal: 15000, annualRate: 7.5, years: 2, frequency: 'monthly', timing: 'end', originationFee: fc.orig, recurringFee: fc.recur });
  const expectedRecurFees = fc.recur * res.payoffPeriods;
  const expectedTotalFees = fc.orig + expectedRecurFees;

  assert(res.originationFee === fc.orig, `FEE-${i}-ORIG`, `Origination fee matches input: $${fc.orig}`);
  assert(Math.abs(res.totalRecurringFees - expectedRecurFees) < 0.05, `FEE-${i}-RECUR`, `Total recurring fees: $${res.totalRecurringFees.toFixed(2)} (expected: $${expectedRecurFees})`);
  assert(Math.abs(res.totalFees - expectedTotalFees) < 0.05, `FEE-${i}-TOTAL`, `Total fees: $${res.totalFees.toFixed(2)} (expected: $${expectedTotalFees})`);

  // Reconciliation: Total Cost === Total Principal + Total Interest + Total Fees
  const reconciledSum = res.totalPrincipal + res.totalInterest + res.totalFees;
  assert(Math.abs(res.totalCost - reconciledSum) < 0.05, `FEE-${i}-RECONCILE`, `Total cost ($${res.totalCost.toFixed(2)}) perfectly reconciles with Principal + Interest + Fees ($${reconciledSum.toFixed(2)})`);
}

// -----------------------------------------------------------------------------
// SECTION 9: Small Loans and Large Loans Scaling
// -----------------------------------------------------------------------------
console.log('\n--- Section 9: Small and Large Loans Scaling ---');
const microLoans = [0.01, 1, 10, 50, 100];
for (const ml of microLoans) {
  const res = calculateLoan({ principal: ml, annualRate: 6, years: 1, frequency: 'monthly', timing: 'end' });
  assert(Number.isFinite(res.scheduledPayment) && res.scheduledPayment > 0, `MICRO-LOAN-${ml}-PMT`, `Micro loan $${ml} has valid payment: ${res.scheduledPayment.toFixed(4)}`);
  assert(Math.abs(res.totalPrincipal - ml) < 0.01, `MICRO-LOAN-${ml}-PRIN`, `Micro loan $${ml} repays exact principal`);
  assert(res.schedule[res.schedule.length - 1].closingBalance === 0, `MICRO-LOAN-${ml}-BAL`, `Micro loan $${ml} ends at 0 balance`);
}

const macroLoans = [500000, 1000000, 5000000, 10000000, 50000000];
for (const ml of macroLoans) {
  const res = calculateLoan({ principal: ml, annualRate: 7, years: 30, frequency: 'monthly', timing: 'end' });
  assert(Number.isFinite(res.scheduledPayment) && res.scheduledPayment > 0, `MACRO-LOAN-${ml}-PMT`, `Macro loan $${ml.toLocaleString()} has valid payment: $${res.scheduledPayment.toFixed(2)}`);
  assert(Math.abs(res.totalPrincipal - ml) < 1.0, `MACRO-LOAN-${ml}-PRIN`, `Macro loan $${ml.toLocaleString()} repays exact principal`);
  assert(res.schedule[res.schedule.length - 1].closingBalance === 0, `MACRO-LOAN-${ml}-BAL`, `Macro loan $${ml.toLocaleString()} ends at 0 balance`);
}

// -----------------------------------------------------------------------------
// SECTION 10: Multi-Currency Decimals Formatting
// -----------------------------------------------------------------------------
console.log('\n--- Section 10: Multi-Currency Decimals Formatting ---');
const testCurrencies = [
  { code: 'JPY', symbol: '¥', name: 'Japanese yen', minorUnit: 0 },
  { code: 'KRW', symbol: '₩', name: 'South Korean won', minorUnit: 0 },
  { code: 'VND', symbol: '₫', name: 'Vietnamese đồng', minorUnit: 0 },
  { code: 'USD', symbol: '$', name: 'US Dollar', minorUnit: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', minorUnit: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', minorUnit: 2 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', minorUnit: 2 },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini dinar', minorUnit: 3 },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti dinar', minorUnit: 3 },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani rial', minorUnit: 3 },
];

for (const curr of testCurrencies) {
  const formatted = formatCurrencyAmount(1234.5678, curr, true);
  if (curr.minorUnit === 0) {
    assert(formatted === `${curr.symbol}1,235`, `CURR-${curr.code}-0DEC`, `${curr.code} rounds to 0 decimal places: ${formatted}`);
  } else if (curr.minorUnit === 2) {
    assert(formatted === `${curr.symbol}1,234.57`, `CURR-${curr.code}-2DEC`, `${curr.code} rounds to 2 decimal places: ${formatted}`);
  } else if (curr.minorUnit === 3) {
    assert(formatted === `${curr.symbol}1,234.568`, `CURR-${curr.code}-3DEC`, `${curr.code} rounds to 3 decimal places: ${formatted}`);
  }
}

// -----------------------------------------------------------------------------
// SECTION 11: String Input Parsing & Number Sanitization
// -----------------------------------------------------------------------------
console.log('\n--- Section 11: String Input Parsing & Number Sanitization ---');
const parseCases: Array<[string, number]> = [
  ['12000', 12000],
  [' 12000 ', 12000],
  ['12,000', 12000],
  ['12,000.50', 12000.5],
  ['$12,000', 12000],
  ['$ 12,000.50 ', 12000.5],
  ['€250,000', 250000],
  ['£75,000.25', 75000.25],
  ['¥5,000,000', 5000000],
  ['₹1,00,000', 100000],
  ['0', 0],
  ['-500', 0], // clamped to min 0
  ['abc', 0],
  ['$abc', 0],
  ['', 0],
];

for (const [raw, expected] of parseCases) {
  const val = safeNumber(raw, 0, 0, 100000000);
  assert(val === expected, `PARSE-${raw.trim() || 'EMPTY'}`, `safeNumber("${raw}") correctly evaluated to ${expected} (got ${val})`);
}

// -----------------------------------------------------------------------------
// SECTION 12: URL Serialization and Deserialization Round-Trip
// -----------------------------------------------------------------------------
console.log('\n--- Section 12: URL Serialization & Deserialization Round-Trip ---');
const originalParams: LoanParams = {
  principal: 25000,
  annualRate: 8.5,
  years: 3,
  frequency: 'biweekly',
  timing: 'beginning',
  extraPayment: 75,
  oneTimePrepayment: 2000,
  prepaymentPeriod: 14,
  prepaymentMode: 'term',
  originationFee: 350,
  recurringFee: 10,
};

const serializedQuery = serializeLoanUrl(originalParams, 'EUR');
assert(serializedQuery.includes('currency=EUR'), 'URL-SERIALIZE-CURR', 'Serialized query includes currency=EUR');
assert(serializedQuery.includes('principal=25000'), 'URL-SERIALIZE-PRIN', 'Serialized query includes principal=25000');
assert(serializedQuery.includes('rate=8.5'), 'URL-SERIALIZE-RATE', 'Serialized query includes rate=8.5');

const deserialized = deserializeLoanUrl(serializedQuery, WORLD_CURRENCIES);
assert(deserialized.currency.code === 'EUR', 'URL-DESERIALIZE-CURR', 'Deserialized currency matches EUR');
assert(deserialized.params.principal === 25000, 'URL-DESERIALIZE-PRIN', 'Deserialized principal matches 25000');
assert(deserialized.params.annualRate === 8.5, 'URL-DESERIALIZE-RATE', 'Deserialized rate matches 8.5');
assert(deserialized.params.frequency === 'biweekly', 'URL-DESERIALIZE-FREQ', 'Deserialized frequency matches biweekly');
assert(deserialized.params.timing === 'beginning', 'URL-DESERIALIZE-TIMING', 'Deserialized timing matches beginning');
assert(deserialized.params.extraPayment === 75, 'URL-DESERIALIZE-EXTRA', 'Deserialized extra matches 75');
assert(deserialized.params.oneTimePrepayment === 2000, 'URL-DESERIALIZE-PREP', 'Deserialized prepayment matches 2000');
assert(deserialized.showAdvanced === true, 'URL-DESERIALIZE-ADV', 'showAdvanced correctly true for custom loan');
assert(deserialized.hasSharedState === true, 'URL-DESERIALIZE-STATE', 'hasSharedState correctly detected');

// Clean empty URL returns fresh state
const emptyUrl = deserializeLoanUrl('', WORLD_CURRENCIES);
assert(emptyUrl.hasSharedState === false, 'URL-EMPTY-NO-STATE', 'Empty URL correctly has no shared state');
assert(emptyUrl.params.principal === 0, 'URL-EMPTY-ZERO-PRIN', 'Empty URL defaults principal to 0');

// -----------------------------------------------------------------------------
// SECTION 13: RFC-4180 CSV Export and Formula Injection Defense
// -----------------------------------------------------------------------------
console.log('\n--- Section 13: RFC-4180 CSV Export and Formula Injection Defense ---');
assert(escapeCsvCell('simple') === 'simple', 'CSV-CELL-SIMPLE', 'Simple text does not require quotes');
assert(escapeCsvCell('with,comma') === '"with,comma"', 'CSV-CELL-COMMA', 'Text with comma is properly quoted');
assert(escapeCsvCell('with"quote') === '"with""quote"', 'CSV-CELL-QUOTE', 'Double quotes are escaped via doubling');

// Formula injection defense
assert(escapeCsvCell('=1+1').startsWith("'="), 'CSV-INJECTION-EQUALS', '= is prefixed with single quote');
assert(escapeCsvCell('+cmd').startsWith("'+"), 'CSV-INJECTION-PLUS', '+ is prefixed with single quote');
assert(escapeCsvCell('-cmd').startsWith("'-"), 'CSV-INJECTION-MINUS', '- is prefixed with single quote');
assert(escapeCsvCell('@calc').startsWith("'@"), 'CSV-INJECTION-AT', '@ is prefixed with single quote');

const csvResult = calculateLoan({ principal: 10000, annualRate: 7, years: 1, frequency: 'monthly', timing: 'end' });
const csvOutput = generateCsvExport(csvResult, { principal: 10000, annualRate: 7, years: 1, frequency: 'monthly', timing: 'end', extraPayment: 0, oneTimePrepayment: 0, prepaymentPeriod: 1, prepaymentMode: 'term', originationFee: 0, recurringFee: 0 }, WORLD_CURRENCIES[0]);
assert(csvOutput.includes('Period,Opening Balance,Scheduled Payment'), 'CSV-HAS-HEADERS', 'CSV contains valid headers');
assert(csvOutput.includes('10000.00'), 'CSV-HAS-PRINCIPAL', 'CSV contains initial principal');
const csvLines = csvOutput.split('\n');
assert(csvLines.length >= 20, 'CSV-HAS-ROWS', `CSV contains metadata + headers + rows (${csvLines.length} lines)`);

// -----------------------------------------------------------------------------
// SECTION 14: Yearly Summary Consistency with Amortization Schedule
// -----------------------------------------------------------------------------
console.log('\n--- Section 14: Yearly Summary Reconciliation with Amortization Schedule ---');
const multiYearCases = [2, 3, 5, 10, 15];
for (const my of multiYearCases) {
  const res = calculateLoan({ principal: 40000, annualRate: 6.5, years: my, frequency: 'monthly', timing: 'end', originationFee: 200, recurringFee: 5 });
  assert(res.yearlySummary.length === my, `YEARLY-${my}Y-COUNT`, `Yearly summary contains exactly ${my} rows (got ${res.yearlySummary.length})`);

  let yearlySumPrincipal = 0;
  let yearlySumInterest = 0;
  let yearlySumFees = 0;
  for (const yr of res.yearlySummary) {
    yearlySumPrincipal += yr.totalPrincipal;
    yearlySumInterest += yr.totalInterest;
    yearlySumFees += yr.totalFees;
  }

  assert(Math.abs(yearlySumPrincipal - res.totalPrincipal) < 0.05, `YEARLY-${my}Y-PRIN-MATCH`, `Yearly principal sum ($${yearlySumPrincipal.toFixed(2)}) matches total principal ($${res.totalPrincipal.toFixed(2)})`);
  assert(Math.abs(yearlySumInterest - res.totalInterest) < 0.05, `YEARLY-${my}Y-INT-MATCH`, `Yearly interest sum ($${yearlySumInterest.toFixed(2)}) matches total interest ($${res.totalInterest.toFixed(2)})`);
  assert(Math.abs(yearlySumFees - res.totalFees) < 0.05, `YEARLY-${my}Y-FEE-MATCH`, `Yearly fees sum ($${yearlySumFees.toFixed(2)}) matches total fees ($${res.totalFees.toFixed(2)})`);
  assert(res.yearlySummary[res.yearlySummary.length - 1].closingBalance === 0, `YEARLY-${my}Y-END-ZERO`, `Yearly summary final closing balance is 0.00`);
}

// -----------------------------------------------------------------------------
// SECTION 15: Core Conservation Laws and Balance Invariants
// -----------------------------------------------------------------------------
console.log('\n--- Section 15: Core Conservation Laws and Balance Invariants ---');
const invariantLoans = [
  { p: 12000, r: 12, y: 1 },
  { p: 50000, r: 8.5, y: 5 },
  { p: 100000, r: 6.75, y: 15 },
  { p: 250000, r: 5.5, y: 30 },
];

for (let idx = 0; idx < invariantLoans.length; idx++) {
  const il = invariantLoans[idx];
  const res = calculateLoan({ principal: il.p, annualRate: il.r, years: il.y, frequency: 'monthly', timing: 'end' });

  // Invariant 1: Total principal repaid exactly equals loan principal
  assert(Math.abs(res.totalPrincipal - il.p) < 0.05, `INVAR-${idx}-PRIN-CONSERVED`, `Loan ${il.p} principal is 100% conserved (got ${res.totalPrincipal.toFixed(2)})`);

  // Invariant 2: Balances monotonically decrease
  let isMonotonic = true;
  let hasNegative = false;
  let matchesLink = true;

  for (let rIdx = 0; rIdx < res.schedule.length; rIdx++) {
    const row = res.schedule[rIdx];
    if (row.closingBalance < 0) hasNegative = true;
    if (row.closingBalance > row.openingBalance) isMonotonic = false;

    // Start balance - principal paid = end balance
    const diff = Math.abs((row.openingBalance - row.principalPaid) - row.closingBalance);
    if (diff > 0.01) matchesLink = false;

    // Next opening balance = previous closing balance
    if (rIdx < res.schedule.length - 1) {
      const nextRow = res.schedule[rIdx + 1];
      if (Math.abs(row.closingBalance - nextRow.openingBalance) > 0.01) matchesLink = false;
    }
  }

  assert(isMonotonic, `INVAR-${idx}-MONOTONIC`, 'Schedule balances monotonically decrease throughout tenure');
  assert(!hasNegative, `INVAR-${idx}-NO-NEGATIVE`, 'Schedule never encounters negative intermediate or closing balance');
  assert(matchesLink, `INVAR-${idx}-START-END-LINK`, 'Schedule row chain (start - principal = end) is continuous and exact');
  assert(res.schedule[res.schedule.length - 1].closingBalance === 0, `INVAR-${idx}-FINAL-ZERO`, 'Schedule final row closing balance is strictly 0.00');
}

console.log('\n================================================================');
console.log(`TOTAL TESTS EXECUTED: ${totalTests}`);
console.log(`PASSED:               ${passedTests}`);
console.log(`FAILED:               ${failedTests}`);
console.log('================================================================\n');

if (failedTests > 0) {
  console.error(`❌ ${failedTests} TESTS FAILED IN 150+ EMI TEST SUITE`);
  process.exit(1);
} else {
  console.log('🎉 ALL 150+ EMI CALCULATOR ENGINE TESTS PASSED WITH 100% ACCURACY!');
}
