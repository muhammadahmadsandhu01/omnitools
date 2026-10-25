/**
 * KivaroTools Mortgage Calculator - 150+ Deep Automated Test Suite
 *
 * Mathematically validates the mortgage amortization engine across:
 * - Terms: 1 to 100 years
 * - Rates: 0% to 50%
 * - Principal: $1k to $100M
 * - Down Payment: 0% to 100%
 * - Currencies: 0, 2, and 3 minor unit decimals
 * - Prepayments, Escrow, PMI cancellation, and Invariants
 */

import {
  buildMortgageModel,
  calculatePeriodicPayment,
  roundMinor,
  parseCleanNumber,
  toNumber,
  annualizeSchedule,
  CalculationInputs,
  Currency,
  WORLD_CURRENCIES,
} from '../lib/mortgageEngine';

const USD: Currency = { code: 'USD', name: 'US Dollar', minorUnit: 2 };
const JPY: Currency = { code: 'JPY', name: 'Japanese Yen', minorUnit: 0 };
const BHD: Currency = { code: 'BHD', name: 'Bahraini Dinar', minorUnit: 3 };

function createInputs(overrides: Partial<CalculationInputs> = {}): CalculationInputs {
  return {
    price: 300000,
    down: 60000,
    rate: 6.0,
    years: 30,
    tax: 0,
    insurance: 0,
    hoa: 0,
    pmiRate: 0,
    pmiLtv: 80,
    closingPct: 0,
    points: 0,
    lenderFees: 0,
    frequency: 'monthly',
    extra: 0,
    prepay: 0,
    prepayTiming: 'origination',
    prepayPeriod: 12,
    currency: USD,
    ...overrides,
  };
}

let totalTests = 0;
let passedTests = 0;
const failures: string[] = [];

function assert(condition: boolean, testId: string, description: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testId}: ${description}`);
  } else {
    failures.push(`${testId}: ${description} ${details ? `(${details})` : ''}`);
    console.error(`  [FAIL] ${testId}: ${description} ${details ? `(${details})` : ''}`);
  }
}

function assertClose(actual: number, expected: number, tolerance: number, testId: string, description: string) {
  const diff = Math.abs(actual - expected);
  assert(diff <= tolerance, testId, description, `expected ${expected}, got ${actual}, diff ${diff}`);
}

console.log('================================================================');
console.log('       KIVAROTOOLS MORTGAGE CALCULATOR 150+ TEST SUITE          ');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// SECTION 1: Standard Loan Terms (11 tests)
// -----------------------------------------------------------------------------
console.log('--- Section 1: Standard Loan Terms (1 to 50 Years) ---');
const termTestCases = [
  { years: 1, expectedPmt: 20655.94 },
  { years: 3, expectedPmt: 7301.26 },
  { years: 5, expectedPmt: 4639.87 },
  { years: 7, expectedPmt: 3506.05 },
  { years: 10, expectedPmt: 2664.49 },
  { years: 15, expectedPmt: 2025.26 },
  { years: 20, expectedPmt: 1719.43 },
  { years: 25, expectedPmt: 1546.32 },
  { years: 30, expectedPmt: 1438.92 },
  { years: 40, expectedPmt: 1320.51 },
  { years: 50, expectedPmt: 1263.37 },
];

termTestCases.forEach((t, i) => {
  const res = buildMortgageModel(createInputs({ years: t.years }));
  assertClose(
    res.scheduled,
    t.expectedPmt,
    0.02,
    `TERM-${String(i + 1).padStart(2, '0')}`,
    `${t.years}-year term @ 6.0% loan $240,000 -> $${t.expectedPmt}/mo`,
  );
});

// -----------------------------------------------------------------------------
// SECTION 2: Interest Rate Spectrum (16 tests)
// -----------------------------------------------------------------------------
console.log('\n--- Section 2: Interest Rate Spectrum (0% to 50%) ---');
const rateTestCases = [
  { rate: 0.0, expectedPmt: 666.67 },     // 240,000 / 360 = 666.67
  { rate: 0.001, expectedPmt: 666.77 },
  { rate: 0.01, expectedPmt: 667.67 },
  { rate: 0.1, expectedPmt: 676.74 },
  { rate: 1.0, expectedPmt: 771.93 },
  { rate: 2.5, expectedPmt: 948.29 },
  { rate: 3.5, expectedPmt: 1077.71 },
  { rate: 4.875, expectedPmt: 1270.10 },
  { rate: 5.75, expectedPmt: 1400.57 },
  { rate: 6.0, expectedPmt: 1438.92 },
  { rate: 7.125, expectedPmt: 1616.92 },
  { rate: 8.5, expectedPmt: 1845.39 },
  { rate: 12.0, expectedPmt: 2468.67 },
  { rate: 18.0, expectedPmt: 3617.00 },
  { rate: 25.0, expectedPmt: 5002.99 },
  { rate: 50.0, expectedPmt: 10000.00 },
];

rateTestCases.forEach((t, i) => {
  const res = buildMortgageModel(createInputs({ rate: t.rate }));
  assertClose(
    res.scheduled,
    t.expectedPmt,
    0.02,
    `RATE-${String(i + 1).padStart(2, '0')}`,
    `Rate ${t.rate}% on $240,000 30yr -> $${t.expectedPmt}/mo`,
  );
});

// -----------------------------------------------------------------------------
// SECTION 3: Principal & Loan Size Spectrum (24 tests)
// -----------------------------------------------------------------------------
console.log('\n--- Section 3: Loan Size Spectrum ($1,000 to $100,000,000) ---');
const sizeCases = [
  { price: 1250, down: 250, loan: 1000, expectedPmt: 6.00 },
  { price: 6250, down: 1250, loan: 5000, expectedPmt: 29.98 },
  { price: 12500, down: 2500, loan: 10000, expectedPmt: 59.96 },
  { price: 62500, down: 12500, loan: 50000, expectedPmt: 299.78 },
  { price: 125000, down: 25000, loan: 100000, expectedPmt: 599.55 },
  { price: 300000, down: 60000, loan: 240000, expectedPmt: 1438.92 },
  { price: 625000, down: 125000, loan: 500000, expectedPmt: 2997.75 },
  { price: 1000000, down: 200000, loan: 800000, expectedPmt: 4796.40 },
  { price: 2000000, down: 400000, loan: 1600000, expectedPmt: 9592.81 },
  { price: 5000000, down: 1000000, loan: 4000000, expectedPmt: 23982.01 },
  { price: 12500000, down: 2500000, loan: 10000000, expectedPmt: 59955.05 },
  { price: 125000000, down: 25000000, loan: 100000000, expectedPmt: 599550.53 },
];

sizeCases.forEach((t, i) => {
  const res = buildMortgageModel(createInputs({ price: t.price, down: t.down }));
  assertClose(
    res.scheduled,
    t.expectedPmt,
    0.1,
    `SIZE-${String(i + 1).padStart(2, '0')}`,
    `Loan $${t.loan.toLocaleString()} -> $${t.expectedPmt.toLocaleString()}/mo`,
  );
  assert(res.loan === t.loan, `SIZE-${String(i + 1).padStart(2, '0')}-L`, `Loan amount conserved: ${res.loan}`);
});

// -----------------------------------------------------------------------------
// SECTION 4: Down Payment Spectrum (0% to 100%) (26 tests)
// -----------------------------------------------------------------------------
console.log('\n--- Section 4: Down Payment Variations (0% to 100%) ---');
const downCases = [
  { pct: 0, down: 0, loan: 300000, expectedPmt: 1798.65 },
  { pct: 3, down: 9000, loan: 291000, expectedPmt: 1744.69 },
  { pct: 3.5, down: 10500, loan: 289500, expectedPmt: 1735.70 },
  { pct: 5, down: 15000, loan: 285000, expectedPmt: 1708.72 },
  { pct: 10, down: 30000, loan: 270000, expectedPmt: 1618.79 },
  { pct: 15, down: 45000, loan: 255000, expectedPmt: 1528.85 },
  { pct: 20, down: 60000, loan: 240000, expectedPmt: 1438.92 },
  { pct: 25, down: 75000, loan: 225000, expectedPmt: 1348.99 },
  { pct: 35, down: 105000, loan: 195000, expectedPmt: 1169.12 },
  { pct: 50, down: 150000, loan: 150000, expectedPmt: 899.33 },
  { pct: 80, down: 240000, loan: 60000, expectedPmt: 359.73 },
  { pct: 95, down: 285000, loan: 15000, expectedPmt: 89.93 },
  { pct: 100, down: 300000, loan: 0, expectedPmt: 0.00 },
];

downCases.forEach((t, i) => {
  const res = buildMortgageModel(createInputs({ price: 300000, down: t.down }));
  assertClose(
    res.scheduled,
    t.expectedPmt,
    0.02,
    `DOWN-${String(i + 1).padStart(2, '0')}`,
    `Down payment ${t.pct}% ($${t.down}) -> P&I $${t.expectedPmt}/mo`,
  );
  assert(res.loan === t.loan, `DOWN-${String(i + 1).padStart(2, '0')}-L`, `Loan amount is $${t.loan}`);
});

// -----------------------------------------------------------------------------
// SECTION 5: Dynamic PMI & Statutory Cancellation (18 tests)
// -----------------------------------------------------------------------------
console.log('\n--- Section 5: Dynamic PMI & Cancellation (HPA 1998) ---');
const pmiCases = [
  { price: 300000, down: 15000, pmiRate: 0.5, pmiLtv: 80, expectedInitMonthly: 118.75 },
  { price: 300000, down: 15000, pmiRate: 0.85, pmiLtv: 80, expectedInitMonthly: 201.88 },
  { price: 300000, down: 15000, pmiRate: 1.0, pmiLtv: 80, expectedInitMonthly: 237.50 },
  { price: 300000, down: 30000, pmiRate: 0.5, pmiLtv: 80, expectedInitMonthly: 112.50 },
  { price: 300000, down: 60000, pmiRate: 0.5, pmiLtv: 80, expectedInitMonthly: 0.00 },
  { price: 300000, down: 90000, pmiRate: 1.0, pmiLtv: 80, expectedInitMonthly: 0.00 },
];

pmiCases.forEach((t, i) => {
  const res = buildMortgageModel(createInputs({
    price: t.price,
    down: t.down,
    pmiRate: t.pmiRate,
    pmiLtv: t.pmiLtv,
  }));
  assertClose(
    res.initialPmiMonthly,
    t.expectedInitMonthly,
    0.05,
    `PMI-${String(i + 1).padStart(2, '0')}`,
    `Price $${t.price}, Down $${t.down}, PMI ${t.pmiRate}% -> Init PMI $${t.expectedInitMonthly}/mo`,
  );
  if (t.expectedInitMonthly > 0) {
    const lastRow = res.rows[res.rows.length - 1];
    assert(lastRow.pmi === 0, `PMI-${String(i + 1).padStart(2, '0')}-END`, 'PMI drops to $0 before loan end');
    const cancelledRow = res.rows.find((r) => r.pmi === 0 && r.period > 1);
    assert(!!cancelledRow, `PMI-${String(i + 1).padStart(2, '0')}-DROP`, 'PMI successfully drops during loan');
    if (cancelledRow) {
      assert(
        (cancelledRow.balance / t.price) * 100 <= t.pmiLtv,
        `PMI-${String(i + 1).padStart(2, '0')}-THRESH`,
        `PMI cancels when LTV <= ${t.pmiLtv}% (actual: ${((cancelledRow.balance / t.price) * 100).toFixed(2)}%)`,
      );
    }
  }
});

// -----------------------------------------------------------------------------
// SECTION 6: Escrow Housing Expenses (PITI + HOA) (12 tests)
// -----------------------------------------------------------------------------
console.log('\n--- Section 6: Escrow PITI & HOA Combinations ---');
const escrowCases = [
  { tax: 0, ins: 0, hoa: 0, expectedEscrow: 0.00 },
  { tax: 1200, ins: 0, hoa: 0, expectedEscrow: 100.00 },
  { tax: 3600, ins: 1200, hoa: 0, expectedEscrow: 400.00 },
  { tax: 3600, ins: 1200, hoa: 250, expectedEscrow: 650.00 },
  { tax: 6000, ins: 2400, hoa: 500, expectedEscrow: 1200.00 },
  { tax: 12000, ins: 3600, hoa: 1000, expectedEscrow: 2300.00 },
];

escrowCases.forEach((t, i) => {
  const res = buildMortgageModel(createInputs({
    tax: t.tax,
    insurance: t.ins,
    hoa: t.hoa,
  }));
  const escrowActual = roundMinor(res.tax + res.insurance + res.hoa, 2);
  assertClose(
    escrowActual,
    t.expectedEscrow,
    0.01,
    `ESCROW-${String(i + 1).padStart(2, '0')}`,
    `Tax $${t.tax}/yr, Ins $${t.ins}/yr, HOA $${t.hoa}/mo -> Escrow $${t.expectedEscrow}/mo`,
  );
  assertClose(
    res.monthly,
    roundMinor(res.monthlyBase + t.expectedEscrow, 2),
    0.01,
    `ESCROW-${String(i + 1).padStart(2, '0')}-TOT`,
    `Total monthly payment = Base P&I ($${res.monthlyBase}) + Escrow ($${t.expectedEscrow})`,
  );
});

// -----------------------------------------------------------------------------
// SECTION 7: Cash to Close Matrix (12 tests)
// -----------------------------------------------------------------------------
console.log('\n--- Section 7: Cash to Close Matrix ---');
const ctcCases = [
  { down: 60000, closingPct: 0, points: 0, fees: 0, expectedCTC: 60000 },
  { down: 60000, closingPct: 2, points: 0, fees: 0, expectedCTC: 66000 },
  { down: 60000, closingPct: 2, points: 1, fees: 0, expectedCTC: 68400 },
  { down: 60000, closingPct: 2, points: 1, fees: 1500, expectedCTC: 69900 },
  { down: 60000, closingPct: 2.5, points: 1, fees: 1500, expectedCTC: 71400 },
  { down: 60000, closingAmount: 7500, closingPct: 0, points: 1, fees: 1500, expectedCTC: 71400 },
];

ctcCases.forEach((t, i) => {
  const res = buildMortgageModel(createInputs({
    price: 300000,
    down: t.down,
    closingPct: t.closingPct,
    closingAmount: t.closingAmount,
    points: t.points,
    lenderFees: t.fees,
  }));
  assert(
    res.cashToClose === t.expectedCTC,
    `CTC-${String(i + 1).padStart(2, '0')}`,
    `Cash to close equals $${t.expectedCTC} (got ${res.cashToClose})`,
  );
  assert(
    res.cashToClose === roundMinor(res.down + res.closing + res.points + res.upfrontFees, 2),
    `CTC-${String(i + 1).padStart(2, '0')}-ADD`,
    'Cash to close exactly equals sum of down + closing + points + fees',
  );
});

// -----------------------------------------------------------------------------
// SECTION 8: Prepayment & Payoff Acceleration (16 tests)
// -----------------------------------------------------------------------------
console.log('\n--- Section 8: Extra Principal & Prepayments ---');
const extraCases = [
  { extra: 0, expectedPeriods: 360 },
  { extra: 50, expectedPeriods: 329 },
  { extra: 100, expectedPeriods: 304 },
  { extra: 200, expectedPeriods: 265 },
  { extra: 500, expectedPeriods: 194 },
  { extra: 1000, expectedPeriods: 136 },
];

extraCases.forEach((t, i) => {
  const res = buildMortgageModel(createInputs({ extra: t.extra }));
  assert(
    res.payoffPeriods === t.expectedPeriods,
    `EXTRA-${String(i + 1).padStart(2, '0')}-PER`,
    `Extra $${t.extra}/mo -> payoff periods: ${res.payoffPeriods} (expected: ${t.expectedPeriods})`,
  );
  if (t.extra > 0) {
    const baseRes = buildMortgageModel(createInputs({ extra: 0 }));
    assert(
      res.interestTotal < baseRes.interestTotal,
      `EXTRA-${String(i + 1).padStart(2, '0')}-INT`,
      `Extra $${t.extra}/mo reduced total interest from $${baseRes.interestTotal} to $${res.interestTotal}`,
    );
  }
});

// Prepayments at origination (lowers monthly payment) and period (shortens term)
const origPrepay = buildMortgageModel(createInputs({ prepay: 5000, prepayTiming: 'origination' }));
const baseModel = buildMortgageModel(createInputs());
assert(origPrepay.scheduled < baseModel.scheduled, 'PREPAY-ORIG-01', `Origination prepay lowers monthly P&I ($${origPrepay.scheduled} vs $${baseModel.scheduled})`);
assert(origPrepay.interestTotal < baseModel.interestTotal, 'PREPAY-ORIG-02', `Origination prepay saves interest ($${(baseModel.interestTotal - origPrepay.interestTotal).toFixed(2)})`);

const periodPrepay = buildMortgageModel(createInputs({ prepay: 5000, prepayTiming: 'period', prepayPeriod: 12 }));
assert(periodPrepay.payoffPeriods < baseModel.payoffPeriods, 'PREPAY-PER-01', `Schedule prepay shortens term (${periodPrepay.payoffPeriods} vs ${baseModel.payoffPeriods})`);
assert(periodPrepay.interestTotal < baseModel.interestTotal, 'PREPAY-PER-02', `Schedule prepay saves interest ($${(baseModel.interestTotal - periodPrepay.interestTotal).toFixed(2)})`);

// -----------------------------------------------------------------------------
// SECTION 9: Biweekly Frequency & Compounding (10 tests)
// -----------------------------------------------------------------------------
console.log('\n--- Section 9: Biweekly vs Monthly Comparisons ---');
const biweeklyCases = [
  { years: 15, rate: 5.75, monthlyPmt: 1992.98, biweeklyPmt: 996.49 },
  { years: 20, rate: 6.0, monthlyPmt: 1719.43, biweeklyPmt: 859.72 },
  { years: 30, rate: 6.0, monthlyPmt: 1438.92, biweeklyPmt: 719.46 },
  { years: 30, rate: 6.5, monthlyPmt: 1516.96, biweeklyPmt: 758.48 },
  { years: 30, rate: 0.0, monthlyPmt: 666.67, biweeklyPmt: 333.34 },
];

biweeklyCases.forEach((t, i) => {
  const mRes = buildMortgageModel(createInputs({ years: t.years, rate: t.rate, frequency: 'monthly' }));
  const bRes = buildMortgageModel(createInputs({ years: t.years, rate: t.rate, frequency: 'biweekly' }));

  assertClose(
    bRes.scheduled,
    t.biweeklyPmt,
    0.02,
    `BIWEEKLY-${String(i + 1).padStart(2, '0')}-PMT`,
    `${t.years}yr @ ${t.rate}%: Biweekly payment = $${t.biweeklyPmt} (half of monthly $${t.monthlyPmt})`,
  );

  if (t.rate > 0) {
    assert(
      bRes.payoffYears < mRes.payoffYears,
      `BIWEEKLY-${String(i + 1).padStart(2, '0')}-ACCEL`,
      `Accelerated biweekly reduced term from ${mRes.payoffYears} yrs to ${bRes.payoffYears} yrs`,
    );
    assert(
      bRes.interestTotal < mRes.interestTotal,
      `BIWEEKLY-${String(i + 1).padStart(2, '0')}-SAVINGS`,
      `Accelerated biweekly saved $${(mRes.interestTotal - bRes.interestTotal).toFixed(2)} in interest`,
    );
  }
});

// -----------------------------------------------------------------------------
// SECTION 10: Multi-Currency Minor Unit Precision (16 tests)
// -----------------------------------------------------------------------------
console.log('\n--- Section 10: Multi-Currency Minor Unit Decimals ---');
const currenciesToTest: Currency[] = [
  JPY,
  { code: 'KRW', name: 'Won', minorUnit: 0 },
  { code: 'CLP', name: 'Chilean Peso', minorUnit: 0 },
  USD,
  { code: 'EUR', name: 'Euro', minorUnit: 2 },
  { code: 'GBP', name: 'Pound Sterling', minorUnit: 2 },
  { code: 'PKR', name: 'Pakistan Rupee', minorUnit: 2 },
  { code: 'INR', name: 'Indian Rupee', minorUnit: 2 },
  BHD,
  { code: 'KWD', name: 'Kuwaiti Dinar', minorUnit: 3 },
  { code: 'OMR', name: 'Rial Omani', minorUnit: 3 },
  { code: 'JOD', name: 'Jordanian Dinar', minorUnit: 3 },
];

currenciesToTest.forEach((c, i) => {
  const res = buildMortgageModel(createInputs({ currency: c }));
  const pmtStr = res.scheduled.toString();
  const decimals = pmtStr.includes('.') ? pmtStr.split('.')[1].length : 0;
  assert(
    decimals <= c.minorUnit,
    `CURR-${String(i + 1).padStart(2, '0')}`,
    `${c.code} (${c.minorUnit} decimals) produced compliant payment: ${res.scheduled} (has ${decimals} decimals)`,
  );
  if (c.minorUnit === 0) {
    assert(Number.isInteger(res.scheduled), `CURR-${String(i + 1).padStart(2, '0')}-INT`, `${c.code} is integer`);
  }
});

// -----------------------------------------------------------------------------
// SECTION 11: String Input Parsing & Sanitization (16 tests)
// -----------------------------------------------------------------------------
console.log('\n--- Section 11: String Input Parsing & Sanitization ---');
const parseCases = [
  { input: '300000', expected: 300000 },
  { input: ' 300000 ', expected: 300000 },
  { input: '300,000', expected: 300000 },
  { input: '300,000.50', expected: 300000.5 },
  { input: '$300,000', expected: 300000 },
  { input: '$ 300,000.99', expected: 300000.99 },
  { input: '€250,000', expected: 250000 },
  { input: '£180,000', expected: 180000 },
  { input: '¥10,000,000', expected: 10000000 },
  { input: '₹5,000,000', expected: 5000000 },
  { input: '0', expected: 0 },
  { input: '-500', expected: -500 },
  { input: '', expected: 0 },
  { input: 'abc', expected: 0 },
  { input: '$abc', expected: 0 },
  { input: '   ', expected: 0 },
];

parseCases.forEach((t, i) => {
  const actual = toNumber(t.input);
  assert(
    actual === t.expected,
    `PARSE-${String(i + 1).padStart(2, '0')}`,
    `toNumber("${t.input}") -> ${actual} (expected: ${t.expected})`,
  );
});

// -----------------------------------------------------------------------------
// SECTION 12: Financial Conservation Invariants (24 tests)
// -----------------------------------------------------------------------------
console.log('\n--- Section 12: Financial Conservation & Invariants ---');
const invariantConfigs = [
  createInputs({ price: 200000, down: 40000, rate: 4.5, years: 15 }),
  createInputs({ price: 350000, down: 70000, rate: 6.5, years: 30 }),
  createInputs({ price: 500000, down: 25000, rate: 7.0, years: 30, pmiRate: 0.85 }),
  createInputs({ price: 400000, down: 80000, rate: 5.5, years: 20, extra: 150 }),
  createInputs({ price: 300000, down: 0, rate: 0.0, years: 10 }),
  createInputs({ price: 600000, down: 120000, rate: 6.0, years: 30, frequency: 'biweekly' }),
];

invariantConfigs.forEach((cfg, i) => {
  const res = buildMortgageModel(cfg);
  const sumPrincipal = roundMinor(
    res.rows.reduce((acc, r) => acc + r.principal, 0),
    cfg.currency.minorUnit,
  );
  const lastRow = res.rows[res.rows.length - 1];

  assert(
    Math.abs(sumPrincipal - res.loan) <= 0.02,
    `INVAR-${String(i + 1).padStart(2, '0')}-SUM`,
    `Sum of periodic principal ($${sumPrincipal}) equals loan ($${res.loan})`,
  );

  assert(
    lastRow ? lastRow.balance === 0 : res.loan === 0,
    `INVAR-${String(i + 1).padStart(2, '0')}-ZERO`,
    `Final period ending balance is exactly $0 (got ${lastRow?.balance})`,
  );

  let monotonic = true;
  for (let p = 1; p < res.rows.length; p++) {
    if (res.rows[p].balance > res.rows[p - 1].balance) {
      monotonic = false;
      break;
    }
  }
  assert(monotonic, `INVAR-${String(i + 1).padStart(2, '0')}-MONO`, 'Balances strictly non-increasing');

  const noNegative = res.rows.every((r) => r.balance >= 0);
  assert(noNegative, `INVAR-${String(i + 1).padStart(2, '0')}-NONEG`, 'No periodic balance is negative');
});

// -----------------------------------------------------------------------------
// SECTION 13: 100-Year Extreme Amortization (5 tests)
// -----------------------------------------------------------------------------
console.log('\n--- Section 13: 100-Year Biweekly Extreme Stress Test ---');
const extreme100Yr = buildMortgageModel(createInputs({
  price: 500000,
  down: 100000,
  rate: 5.0,
  years: 100,
  frequency: 'biweekly',
}));

assert(extreme100Yr.rows.length === 1295, 'EXTREME-01', `100-year biweekly generated exactly 1,295 accelerated periods without truncation`);
assert(extreme100Yr.rows[extreme100Yr.rows.length - 1].balance === 0, 'EXTREME-02', '100-year biweekly fully amortizes to zero');
assert(Number.isFinite(extreme100Yr.totalCost), 'EXTREME-03', 'Total cost is finite number');
assert(extreme100Yr.interestTotal > 0, 'EXTREME-04', 'Total interest is calculated');
const sumExtPrincipal = roundMinor(extreme100Yr.rows.reduce((acc, r) => acc + r.principal, 0), 2);
assert(Math.abs(sumExtPrincipal - 400000) <= 0.05, 'EXTREME-05', 'Principal conserved across 100 years');

// -----------------------------------------------------------------------------
// SECTION 14: Annual Aggregation Schedule (5 tests)
// -----------------------------------------------------------------------------
console.log('\n--- Section 14: Annual Aggregation Consistency ---');
const standard30 = buildMortgageModel(createInputs());
const annual30 = annualizeSchedule(standard30.rows, 2);

assert(annual30.length === 30, 'ANNUAL-01', `30-year monthly loan produces exactly 30 annual rows (got ${annual30.length})`);
const annualSumPrincipal = roundMinor(annual30.reduce((acc, r) => acc + r.principal, 0), 2);
assert(annualSumPrincipal === 240000, 'ANNUAL-02', `Annual principal sum ($${annualSumPrincipal}) equals $240,000`);
const annualSumInterest = roundMinor(annual30.reduce((acc, r) => acc + r.interest, 0), 2);
assert(annualSumInterest === standard30.interestTotal, 'ANNUAL-03', `Annual interest sum matches model total: $${annualSumInterest}`);
assert(annual30[29].balance === 0, 'ANNUAL-04', 'Year 30 ending balance is 0');
assert(annual30[0].year === 1 && annual30[29].year === 30, 'ANNUAL-05', 'Year indexing matches 1 to 30');

// -----------------------------------------------------------------------------
// SUMMARY REPORT
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TOTAL TESTS EXECUTED: ${totalTests}`);
console.log(`PASSED:               ${passedTests}`);
console.log(`FAILED:               ${failures.length}`);
console.log('================================================================');

if (failures.length > 0) {
  console.error('\nFAILURES:');
  failures.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
} else {
  console.log('\n🎉 ALL 150+ MORTGAGE ENGINE TEST CASES PASSED WITH 100% ACCURACY!');
  process.exit(0);
}
