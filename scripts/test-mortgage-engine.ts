/**
 * Automated Test Suite for OmniTools Mortgage Calculation Engine
 * Run with: npx tsx scratch/test-mortgage-calculator.ts
 */

import {
  calculatePeriodicPayment,
  roundMinor,
  buildMortgageModel,
  annualizeSchedule,
  generateMortgageCsv,
  escapeCsvValue,
  WORLD_CURRENCIES,
  MORTGAGE_PRESETS,
  CalculationInputs,
} from '../lib/mortgageEngine';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  FAIL: ${testName} ${details ? `(${details})` : ''}`);
  }
}

function assertClose(actual: number, expected: number, tolerance: number, testName: string) {
  totalTests++;
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    passedTests++;
    console.log(`  PASS: ${testName} (actual: ${actual}, expected: ${expected}, diff: ${diff.toFixed(4)})`);
  } else {
    failedTests++;
    console.error(`  FAIL: ${testName} (actual: ${actual}, expected: ${expected}, diff: ${diff.toFixed(4)} > tol: ${tolerance})`);
  }
}

console.log('--- 1. Testing Core Fixed-Rate Formula & Reference Cases ---');

// Case 1: Standard 30-year fixed, $320,000 at 6.50%
{
  const payment = calculatePeriodicPayment(320000, 6.50, 360, 12, 2);
  assertClose(payment, 2022.62, 0.01, '30-Yr Fixed $320k @ 6.5% -> $2,022.62/mo');
}

// Case 2: Standard 15-year fixed, $320,000 at 5.75%
{
  const payment = calculatePeriodicPayment(320000, 5.75, 180, 12, 2);
  assertClose(payment, 2657.31, 0.01, '15-Yr Fixed $320k @ 5.75% -> $2,657.31/mo');
}

// Case 3: FHA 30-year loan, $285,000 at 6.75%
{
  const payment = calculatePeriodicPayment(285000, 6.75, 360, 12, 2);
  assertClose(payment, 1848.50, 0.01, '30-Yr Fixed $285k @ 6.75% -> $1,848.50/mo');
}

console.log('\n--- 2. Testing Critical Mathematical Edge Cases ---');

// Edge Case A: Zero Interest Rate (Exact linear repayment P / N)
{
  const paymentZero = calculatePeriodicPayment(120000, 0, 120, 12, 2);
  assertClose(paymentZero, 1000.00, 0.001, 'Zero interest rate: $120k / 120 periods = $1,000.00 exactly');
}

// Edge Case B: Very low positive interest rate (0.01%)
{
  const paymentLow = calculatePeriodicPayment(100000, 0.01, 360, 12, 2);
  assertClose(paymentLow, 278.20, 0.02, 'Low interest rate: 0.01% on $100k -> $278.20/mo');
}

// Edge Case C: High interest rate (25.00%)
{
  const paymentHigh = calculatePeriodicPayment(50000, 25.0, 60, 12, 2);
  assertClose(paymentHigh, 1467.57, 0.01, 'High interest rate: 25% on $50k over 5 yrs -> $1,467.57/mo');
}

// Edge Case D: Zero principal or zero periods
{
  const zeroPrinc = calculatePeriodicPayment(0, 6.5, 360, 12, 2);
  assert(zeroPrinc === 0, 'Zero principal returns 0 payment');
  const zeroPer = calculatePeriodicPayment(100000, 6.5, 0, 12, 2);
  assert(zeroPer === 0, 'Zero periods returns 0 payment');
}

console.log('\n--- 3. Testing Multi-Currency Minor Unit Precision ---');

{
  // JPY: 0 decimals
  const pJpy = calculatePeriodicPayment(30000000, 1.5, 360, 12, 0);
  assert(Number.isInteger(pJpy), `JPY (0 decimals) yields integer payment: ${pJpy}`);

  // BHD: 3 decimals
  const pBhd = calculatePeriodicPayment(50000, 6.0, 240, 12, 3);
  const bhdStr = pBhd.toString();
  const decimalPart = bhdStr.split('.')[1] || '';
  assert(decimalPart.length <= 3, `BHD (3 decimals) maintains <= 3 decimals: ${pBhd}`);
}

console.log('\n--- 4. Testing Full Amortization Model & Schedule Conservation ---');

{
  const usd = WORLD_CURRENCIES.find((c) => c.code === 'USD')!;
  const inputs: CalculationInputs = {
    price: 400000,
    down: 80000,
    rate: 6.5,
    years: 30,
    tax: 4800,
    insurance: 1440,
    hoa: 0,
    pmiRate: 0,
    pmiLtv: 80,
    closingPct: 2,
    points: 0,
    lenderFees: 1200,
    frequency: 'monthly',
    extra: 0,
    prepay: 0,
    prepayTiming: 'origination',
    prepayPeriod: 12,
    currency: usd,
  };

  const model = buildMortgageModel(inputs);

  assertClose(model.loan, 320000, 0.01, 'Financed loan is $320,000');
  assertClose(model.monthlyBase, 2022.62, 0.01, 'Scheduled monthly P&I is $2,022.62');
  assertClose(model.tax, 400.00, 0.01, 'Monthly property tax is $400.00');
  assertClose(model.insurance, 120.00, 0.01, 'Monthly home insurance is $120.00');
  assertClose(model.monthly, 2542.62, 0.01, 'Total monthly housing outflow is $2,542.62');
  assert(model.rows.length === 360, `Exactly 360 monthly periods generated (got ${model.rows.length})`);

  // Balance conservation test:
  const lastRow = model.rows[model.rows.length - 1];
  assert(lastRow.balance === 0, `Final period ending balance is exactly $0 (got ${lastRow.balance})`);

  const sumPrincipal = roundMinor(
    model.rows.reduce((acc, r) => acc + r.principal, 0),
    2,
  );
  assertClose(sumPrincipal, 320000, 0.02, `Sum of principal paid across all periods equals $320,000 (got ${sumPrincipal})`);

  // Cash to close check: down ($80k) + closing 2% ($8k) + lender fees ($1.2k) = $89,200
  assertClose(model.cashToClose, 89200, 0.01, 'Cash to close is $89,200 ($80k down + $8k closing + $1.2k fees)');
}

console.log('\n--- 5. Testing Dynamic PMI Cancellation ---');

{
  const usd = WORLD_CURRENCIES.find((c) => c.code === 'USD')!;
  // $300k home, 5% down ($15k), $285k loan (95% LTV). PMI 0.85%, cancels at 80% LTV ($240k balance)
  const inputs: CalculationInputs = {
    price: 300000,
    down: 15000,
    rate: 6.5,
    years: 30,
    tax: 3600,
    insurance: 1200,
    hoa: 0,
    pmiRate: 0.85,
    pmiLtv: 80,
    closingPct: 2,
    points: 0,
    lenderFees: 1000,
    frequency: 'monthly',
    extra: 0,
    prepay: 0,
    prepayTiming: 'origination',
    prepayPeriod: 12,
    currency: usd,
  };

  const model = buildMortgageModel(inputs);
  assert(model.initialPmiPeriod > 0, `Initial PMI is active ($${model.initialPmiPeriod}/mo)`);

  // Find the exact period when PMI drops to 0
  const firstZeroPmiRow = model.rows.find((r) => r.pmi === 0);
  assert(!!firstZeroPmiRow, 'PMI successfully drops to $0 during schedule');
  if (firstZeroPmiRow) {
    const prevRow = model.rows[firstZeroPmiRow.period - 2];
    assert(
      firstZeroPmiRow.balance <= 240000 || (prevRow && prevRow.balance <= 240000),
      `PMI cancelled at or below 80% LTV ($240,000 balance). Row balance: ${firstZeroPmiRow.balance}`,
    );
  }

  // Ensure all subsequent periods have pmi === 0
  const pmiDroppedIndex = model.rows.findIndex((r) => r.pmi === 0);
  const remainingRowsHaveZeroPmi = model.rows.slice(pmiDroppedIndex).every((r) => r.pmi === 0);
  assert(remainingRowsHaveZeroPmi, 'Once cancelled, PMI remains $0 for all subsequent periods');
}

console.log('\n--- 6. Testing Biweekly Frequency & Prepayment Acceleration ---');

{
  const usd = WORLD_CURRENCIES.find((c) => c.code === 'USD')!;
  const baseMonthlyInputs: CalculationInputs = {
    price: 400000,
    down: 80000,
    rate: 6.5,
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
    currency: usd,
  };

  const monthlyModel = buildMortgageModel(baseMonthlyInputs);

  // Compare with extra $200/month prepayment
  const extraInputs: CalculationInputs = {
    ...baseMonthlyInputs,
    extra: 200,
  };
  const extraModel = buildMortgageModel(extraInputs);

  assert(extraModel.payoffPeriods < monthlyModel.payoffPeriods, `Extra $200/mo reduced payoff periods from ${monthlyModel.payoffPeriods} to ${extraModel.payoffPeriods}`);
  assert(extraModel.interestTotal < monthlyModel.interestTotal, `Extra payment reduced interest from $${monthlyModel.interestTotal} to $${extraModel.interestTotal}`);

  // Test Accelerated Biweekly schedule (26 periods/year, half-monthly payment)
  const biweeklyInputs: CalculationInputs = {
    ...baseMonthlyInputs,
    frequency: 'biweekly',
  };
  const biweeklyModel = buildMortgageModel(biweeklyInputs);
  assert(
    biweeklyModel.payoffPeriods === 628,
    `30-yr accelerated biweekly loan pays off in 628 periods (~24.15 yrs, saving ~5.8 yrs) instead of 780 (got ${biweeklyModel.payoffPeriods})`,
  );
}

console.log('\n--- 7. Testing 100-Year Biweekly Loan (Zero Truncation) ---');

{
  const usd = WORLD_CURRENCIES.find((c) => c.code === 'USD')!;
  const inputs100Yr: CalculationInputs = {
    price: 1000000,
    down: 200000,
    rate: 5.0,
    years: 100,
    tax: 0,
    insurance: 0,
    hoa: 0,
    pmiRate: 0,
    pmiLtv: 80,
    closingPct: 0,
    points: 0,
    lenderFees: 0,
    frequency: 'biweekly',
    extra: 0,
    prepay: 0,
    prepayTiming: 'origination',
    prepayPeriod: 12,
    currency: usd,
  };

  const model100 = buildMortgageModel(inputs100Yr);
  assert(
    model100.rows.length === 1295,
    `100-year accelerated biweekly loan generated exactly 1,295 periods without truncation (got ${model100.rows.length})`,
  );
  assert(model100.rows[model100.rows.length - 1].balance === 0, '100-year loan fully amortizes to $0 ending balance');
}

console.log('\n--- 8. Testing Annual Amortization Aggregation ---');

{
  const usd = WORLD_CURRENCIES.find((c) => c.code === 'USD')!;
  const inputs: CalculationInputs = {
    price: 300000,
    down: 60000,
    rate: 6.0,
    years: 15,
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
    currency: usd,
  };
  const model = buildMortgageModel(inputs);
  const yearly = annualizeSchedule(model.rows, 2);

  assert(yearly.length === 15, `15-year loan produces 15 yearly summary rows (got ${yearly.length})`);
  const totalYearlyPrincipal = roundMinor(yearly.reduce((acc, y) => acc + y.principal, 0), 2);
  assertClose(totalYearlyPrincipal, 240000, 0.02, 'Annual aggregated principal equals $240,000');
}

console.log('\n--- 9. Testing Preset Scenarios Consistency ---');

{
  assert(MORTGAGE_PRESETS.length === 5, `All 5 presets registered (got ${MORTGAGE_PRESETS.length})`);
  for (const p of MORTGAGE_PRESETS) {
    const price = Number(p.values.homePrice);
    const down = Number(p.values.downPayment);
    const rate = Number(p.values.rate);
    const term = Number(p.values.term);
    assert(price > 0 && down >= 0 && rate >= 0 && term >= 1, `Preset "${p.label}" has valid positive numbers`);
  }
}

console.log('\n--- 10. Testing CSV Generation & RFC-4180 Formula Injection Defense ---');

{
  // Test escapeCsvValue formula defense
  assert(escapeCsvValue('=SUM(A1:A10)') === "'=SUM(A1:A10)", 'Prepends single quote to leading "=" formula');
  assert(escapeCsvValue('+123') === "'+123", 'Prepends single quote to leading "+" formula');
  assert(escapeCsvValue('-123') === "'-123", 'Prepends single quote to leading "-" formula');
  assert(escapeCsvValue('@malicious') === "'@malicious", 'Prepends single quote to leading "@" formula');
  assert(escapeCsvValue('Safe text') === 'Safe text', 'Standard text untouched');
  assert(escapeCsvValue('Text with "quotes"') === '"Text with ""quotes"""', 'Quotes escaped with RFC-4180 double-quotes');

  const usd = WORLD_CURRENCIES.find((c) => c.code === 'USD')!;
  const inputs: CalculationInputs = {
    price: 200000,
    down: 40000,
    rate: 6.0,
    years: 5,
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
    currency: usd,
  };
  const model = buildMortgageModel(inputs);
  const csv = generateMortgageCsv(model.rows, {
    currencyName: usd.name,
    currencyCode: usd.code,
    minorUnit: 2,
    frequency: 'monthly',
    price: 200000,
    down: 40000,
    downPct: 20,
    loan: 160000,
    rate: 6.0,
    term: 5,
    cashToClose: 40000,
    interestTotal: model.interestTotal,
    pmiTotal: model.pmiTotal,
    totalCost: model.totalCost,
    scheduleView: 'monthly',
  });

  assert(csv.startsWith('\uFEFF# OmniTools Mortgage Amortization Schedule'), 'CSV starts with UTF-8 BOM and title comment');
  assert(csv.includes('Period,Year,Payment,Principal,Interest,PMI,Extra Principal,Ending Balance'), 'CSV contains header columns');
  assert(csv.split('\r\n').length >= 65, 'CSV contains metadata + headers + 60 monthly rows');
}

console.log('\n========================================');
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('========================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL MORTGAGE ENGINE TESTS PASSED CLEANLY.');
  process.exit(0);
}
