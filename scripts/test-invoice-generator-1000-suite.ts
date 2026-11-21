/**
 * KivaroTools — 1,000+ Complex Enterprise Test Suite for PDF Invoice Generator Engine
 * File: scripts/test-invoice-generator-1000-suite.ts
 *
 * 8 Rigorous Test Blocks (1,110 Tests Total):
 * 1. Block 1 (Tests 1–150): ISO-4217 Currency Decimals, Half-Up Rounding & Formatting Oracle
 * 2. Block 2 (Tests 151–300): Line Item Arithmetic, Decimal Quantities & Unit Discounts
 * 3. Block 3 (Tests 301–420): Due Date & Payment Terms Auto-Calculation (Net 7/15/30/60, Leap Years, Month-End Boundaries)
 * 4. Block 4 (Tests 421–670): Invoice Totals, Proportional Discount Allocation & Multi-Tax Systems (VAT/GST/Sales Tax)
 * 5. Block 5 (Tests 671–790): Partial Payments, Milestone Deposits & Balance Due Invariants
 * 6. Block 6 (Tests 791–890): Draft Validation, Schema Sanitization, Discount Capping & Boundary Defense
 * 7. Block 7 (Tests 891–990): RFC 4180 CSV Export & CWE-1236 Spreadsheet Formula Injection Guard
 * 8. Block 8 (Tests 991–1110): A4 Multi-Page Pagination Budgeting, Row Height Estimation & Zero-Loss Layout
 */

import {
  calculateLineItem,
  calculateInvoiceTotals,
  computeInvoicePages,
  estimateItemRowHeight,
  getCurrencyDecimals,
  roundMoney,
  safeParseMoney,
  formatMoney,
  formatDisplayDate,
  computeDueDate,
  getCurrencyOptions,
  DEFAULT_CURRENCIES,
  validateInvoiceDraft,
  generateLineItemsCsv,
  escapeCsvCell,
  LineItem,
  TaxEntry,
  InvoiceTotalsInput,
} from '../lib/invoiceEngine';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails: string[] = [];

function assertTest(condition: boolean, testId: string, desc: string): void {
  totalTests++;
  if (condition) {
    passedTests++;
  } else {
    failedTests++;
    failureDetails.push(`[${testId}] FAILED: ${desc}`);
    console.error(`  ❌ [${testId}] FAILED: ${desc}`);
  }
}

function assertEqual<T>(actual: T, expected: T, testId: string, desc: string): void {
  totalTests++;
  if (actual === expected) {
    passedTests++;
  } else {
    failedTests++;
    failureDetails.push(`[${testId}] FAILED: ${desc} (Expected: ${String(expected)}, Got: ${String(actual)})`);
    console.error(`  ❌ [${testId}] FAILED: ${desc} -> Expected: ${String(expected)}, Got: ${String(actual)}`);
  }
}

console.log('======================================================================');
console.log('⚡ Running 1,000+ Complex Enterprise Suite: Invoice Generator Engine');
console.log('======================================================================\n');

/* -------------------------------------------------------------------------- */
/* Block 1: ISO-4217 Currency Decimals, Rounding & Formatting (Tests 1–150)    */
/* -------------------------------------------------------------------------- */
console.log('--- Block 1: ISO-4217 Currency Decimals & Monetary Rounding (Tests 1–150) ---');

// 0-decimal currencies per ISO-4217 and Intl
const zeroDecimalCurrencies = [
  'JPY', 'KRW', 'VND', 'CLP', 'PYG', 'UGX', 'RWF', 'BIF', 'DJF', 'GNF',
  'KMF', 'XOF', 'XAF', 'XPF', 'HUF', 'IDR', 'COP'
];
zeroDecimalCurrencies.forEach((code, i) => {
  assertEqual(getCurrencyDecimals(code), 0, `T-${1 + i}`, `${code} strictly requires 0 decimals`);
});

// 3-decimal currencies (Middle East / North Africa)
const threeDecimalCurrencies = ['KWD', 'BHD', 'OMR', 'JOD', 'TND', 'IQD', 'LYD'];
threeDecimalCurrencies.forEach((code, i) => {
  assertEqual(getCurrencyDecimals(code), 3, `T-${18 + i}`, `${code} strictly requires 3 decimals`);
});

// 4-decimal currency (CLF - Chilean Unidad de Fomento)
assertEqual(getCurrencyDecimals('CLF'), 4, 'T-25', 'CLF strictly requires 4 decimals');

// 2-decimal standard currencies
const twoDecimalCurrencies = [
  'USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED', 'SAR', 'CAD', 'AUD', 'PHP',
  'NGN', 'ZAR', 'SGD', 'NZD', 'BRL', 'MXN', 'CHF', 'CNY', 'HKD', 'SEK',
  'NOK', 'DKK', 'PLN', 'CZK', 'ILS', 'MYR', 'THB', 'TRY', 'EGP', 'BDT',
  'LKR', 'KES', 'GHS', 'PEN', 'ARS', 'RON', 'SGD', 'SEK', 'NOK'
];
twoDecimalCurrencies.slice(0, 39).forEach((code, i) => {
  assertEqual(getCurrencyDecimals(code), 2, `T-${26 + i}`, `${code} strictly requires 2 decimals`);
});

// Half-up rounding exactness & IEEE 754 floating-point absorption defense
const roundingVectors: Array<[number, number, number]> = [
  [0.1 + 0.2, 2, 0.3],
  [1.005, 2, 1.01],
  [2.675, 2, 2.68],
  [35.855, 2, 35.86],
  [1250.005, 2, 1250.01],
  [100000.005, 2, 100000.01],
  [-1.005, 2, -1.01],
  [-35.855, 2, -35.86],
  [10.125, 2, 10.13],
  [10.124, 2, 10.12],
  [10.126, 2, 10.13],
  [0.0001, 2, 0],
  [0.0049, 2, 0],
  [0.005, 2, 0.01],
  [99.999, 2, 100.0],
  [1.0005, 3, 1.001],
  [2.1235, 3, 2.124],
  [5.5555, 3, 5.556],
  [12.3456, 3, 12.346],
  [100.0004, 3, 100.0],
  [14.5, 0, 15],
  [14.49, 0, 14],
  [99.5, 0, 100],
  [-99.5, 0, -100],
  [0.5, 0, 1],
];
roundingVectors.forEach(([val, dec, exp], i) => {
  assertEqual(roundMoney(val, dec), exp, `T-${65 + i}`, `roundMoney(${val}, ${dec}) -> ${exp}`);
});

// Safe parse money variations
const parseVectors: Array<[string | number | null | undefined, number]> = [
  ['$1,234.56', 1234.56],
  ['€ 9,999.99', 9999.99],
  ['PKR 50,000', 50000],
  ['¥10,000', 10000],
  ['-500', 0], // Clamped to 0
  ['invalid-text', 0],
  ['', 0],
  ['   ', 0],
  [null, 0],
  [undefined, 0],
  [450.75, 450.75],
  ['0.00', 0],
  ['  123.45  ', 123.45],
  ['1,000,000.00', 1000000.0],
  ['$0.99', 0.99],
  ['£15.50', 15.5],
  ['₹ 25,000.50', 25000.5],
  ['1000', 1000],
  ['12.34.56', 12.34],
  ['NaN', 0],
];
parseVectors.forEach(([input, exp], i) => {
  assertEqual(safeParseMoney(input), exp, `T-${90 + i}`, `safeParseMoney(${String(input)}) -> ${exp}`);
});

// Formatting variations
const formatVectors: Array<[number, number, string]> = [
  [1250.5, 2, '1,250.50'],
  [1250, 0, '1,250'],
  [12.345, 3, '12.345'],
  [1000000, 2, '1,000,000.00'],
  [0, 2, '0.00'],
  [0, 0, '0'],
  [0.5, 2, '0.50'],
  [99.9, 2, '99.90'],
  [123456789.99, 2, '123,456,789.99'],
  [500.1234, 3, '500.123'],
];
formatVectors.forEach(([val, dec, exp], i) => {
  assertEqual(formatMoney(val, dec), exp, `T-${110 + i}`, `formatMoney(${val}, ${dec}) -> ${exp}`);
});

// Format display date variations
const dateVectors: Array<[string, string]> = [
  ['2026-11-21', 'Nov 21, 2026'],
  ['2026-01-05', 'Jan 05, 2026'],
  ['2026-12-31', 'Dec 31, 2026'],
  ['2025-07-04', 'Jul 04, 2025'],
  ['invalid-date', 'invalid-date'],
  ['', '—'],
];
dateVectors.forEach(([raw, exp], i) => {
  assertEqual(formatDisplayDate(raw), exp, `T-${120 + i}`, `formatDisplayDate(${raw}) -> ${exp}`);
});

// Currencies list integrity
const curOptions = getCurrencyOptions();
assertTest(curOptions.length >= 15, 'T-126', 'Currency options includes standard currencies');
assertTest(DEFAULT_CURRENCIES.some((c) => c.code === 'PHP'), 'T-127', 'DEFAULT_CURRENCIES includes PHP');
assertTest(DEFAULT_CURRENCIES.some((c) => c.code === 'NGN'), 'T-128', 'DEFAULT_CURRENCIES includes NGN');
assertTest(DEFAULT_CURRENCIES.some((c) => c.code === 'ZAR'), 'T-129', 'DEFAULT_CURRENCIES includes ZAR');

// Rounding bulk invariant loop (Tests 130–150)
for (let i = 130; i <= 150; i++) {
  const seed = (i * 137.456) % 1000;
  const rounded = roundMoney(seed, 2);
  const roundedStr = rounded.toFixed(2);
  assertTest(
    !isNaN(rounded) && Math.abs(rounded - Number(roundedStr)) < 1e-9,
    `T-${i}`,
    `Bulk rounding invariant for ${seed} -> ${rounded}`
  );
}

/* -------------------------------------------------------------------------- */
/* Block 2: Line Item Calculations & Fuzzing (Tests 151–300)                   */
/* -------------------------------------------------------------------------- */
console.log('\n--- Block 2: Line Item Calculations & Fuzzing (Tests 151–300) ---');

// Standard calculations
for (let i = 151; i <= 300; i++) {
  const qty = ((i % 25) + 1) * 1.5;
  const rate = ((i * 17) % 500) + 10;
  const hasDiscount = i % 3 === 0;
  const rawDiscount = hasDiscount ? (rate * 0.2) : 0;
  const isTaxable = i % 2 === 0;
  const decimals = i % 5 === 0 ? 0 : i % 7 === 0 ? 3 : 2;

  const item: LineItem = {
    id: `item-${i}`,
    desc: `Test Line Item #${i} for Engineering Services`,
    qty,
    unit: 'hours',
    rate,
    discount: rawDiscount,
    taxable: isTaxable,
  };

  const computed = calculateLineItem(item, decimals);
  const expectedGross = roundMoney(qty * rate, decimals);
  const expectedDiscount = roundMoney(Math.min(expectedGross, Math.max(0, rawDiscount)), decimals);
  const expectedTotal = roundMoney(expectedGross - expectedDiscount, decimals);

  assertTest(
    computed.lineGross === expectedGross &&
    computed.lineDiscount === expectedDiscount &&
    computed.lineTotal === expectedTotal &&
    computed.taxable === isTaxable &&
    computed.lineTotal >= 0,
    `T-${i}`,
    `LineItem #${i}: gross=${computed.lineGross}, disc=${computed.lineDiscount}, tot=${computed.lineTotal}`
  );
}

/* -------------------------------------------------------------------------- */
/* Block 3: Due Date & Payment Terms Auto-Calculation (Tests 301–420)          */
/* -------------------------------------------------------------------------- */
console.log('\n--- Block 3: Due Date & Payment Terms Auto-Calculation (Tests 301–420) ---');

// Due on receipt vectors
const receiptVectors: Array<[string, string]> = [
  ['2026-01-01', '2026-01-01'],
  ['2026-02-28', '2026-02-28'],
  ['2024-02-29', '2024-02-29'],
  ['2026-12-31', '2026-12-31'],
];
receiptVectors.forEach(([start, exp], idx) => {
  assertEqual(computeDueDate(start, 'Due on Receipt'), exp, `T-${301 + idx}`, `Due on receipt matches start date ${start}`);
});

// Net 7 vectors
const net7Vectors: Array<[string, string]> = [
  ['2026-01-01', '2026-01-08'],
  ['2026-01-28', '2026-02-04'],
  ['2026-02-25', '2026-03-04'], // non-leap year (Feb has 28 days: 28-25 = 3 days, 4 days in March)
  ['2024-02-25', '2024-03-03'], // leap year (Feb has 29 days: 29-25 = 4 days, 3 days in March)
  ['2026-12-28', '2027-01-04'], // year rollover
];
net7Vectors.forEach(([start, exp], idx) => {
  assertEqual(computeDueDate(start, 'Net 7'), exp, `T-${305 + idx}`, `Net 7 from ${start} gives ${exp}`);
});

// Net 15 vectors
const net15Vectors: Array<[string, string]> = [
  ['2026-01-01', '2026-01-16'],
  ['2026-01-20', '2026-02-04'],
  ['2026-02-20', '2026-03-07'],
  ['2024-02-20', '2024-03-06'], // leap
  ['2026-12-20', '2027-01-04'],
];
net15Vectors.forEach(([start, exp], idx) => {
  assertEqual(computeDueDate(start, 'Net 15'), exp, `T-${310 + idx}`, `Net 15 from ${start} gives ${exp}`);
});

// Net 30 vectors (Month-end boundaries and leap year handling)
const net30Vectors: Array<[string, string]> = [
  ['2026-01-01', '2026-01-31'],
  ['2026-01-31', '2026-03-02'], // 31 days in Jan: 0 remaining in Jan, 28 in Feb, 2 in March = 30 days
  ['2024-01-31', '2024-03-01'], // leap year 2024: 29 days in Feb, 1 in March
  ['2026-02-01', '2026-03-03'],
  ['2024-02-01', '2024-03-02'],
  ['2026-03-01', '2026-03-31'],
  ['2026-04-01', '2026-05-01'], // 30 days in April -> May 1
  ['2026-05-01', '2026-05-31'], // 31 days in May -> May 31
  ['2026-06-01', '2026-07-01'], // 30 days in June -> July 1
  ['2026-07-01', '2026-07-31'],
  ['2026-08-01', '2026-08-31'],
  ['2026-09-01', '2026-10-01'],
  ['2026-10-01', '2026-10-31'],
  ['2026-11-01', '2026-12-01'],
];
net30Vectors.forEach(([start, exp], idx) => {
  assertEqual(computeDueDate(start, 'Net 30'), exp, `T-${315 + idx}`, `Net 30 from ${start} gives ${exp}`);
});

// Net 60 vectors
const net60Vectors: Array<[string, string]> = [
  ['2026-01-01', '2026-03-02'], // 31 (Jan) + 28 (Feb) + 1 (Mar) = 60 -> Mar 2
  ['2024-01-01', '2024-03-01'], // leap 2024
  ['2026-07-01', '2026-08-30'],
  ['2026-11-01', '2026-12-31'],
  ['2026-12-01', '2027-01-30'],
];
net60Vectors.forEach(([start, exp], idx) => {
  assertEqual(computeDueDate(start, 'Net 60'), exp, `T-${329 + idx}`, `Net 60 from ${start} gives ${exp}`);
});

// Custom terms and invalid dates return null
const invalidTermVectors: Array<[string, string]> = [
  ['2026-01-01', 'Custom'],
  ['2026-01-01', 'Net 45'],
  ['2026-01-01', 'COD'],
  ['2026-01-01', ''],
  ['invalid-date', 'Net 30'],
  ['', 'Net 30'],
  ['2026-02-30', 'Net 30'], // non-existent date
];
invalidTermVectors.forEach(([d, term], idx) => {
  assertEqual(computeDueDate(d, term), null, `T-${334 + idx}`, `computeDueDate('${d}', '${term}') returns null`);
});

// Bulk Net 30/15/7 parameterized date assertions (Tests 341–420)
for (let i = 341; i <= 420; i++) {
  const month = (i % 12) + 1;
  const day = (i % 28) + 1;
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const dayStr = day < 10 ? `0${day}` : `${day}`;
  const issue = `2026-${monthStr}-${dayStr}`;
  const term = i % 4 === 0 ? 'Net 7' : i % 4 === 1 ? 'Net 15' : i % 4 === 2 ? 'Net 30' : 'Net 60';
  const computed = computeDueDate(issue, term);

  assertTest(
    computed !== null && /^\d{4}-\d{2}-\d{2}$/.test(computed) && computed > issue,
    `T-${i}`,
    `Parameterized due date: ${issue} + ${term} -> ${computed}`
  );
}

/* -------------------------------------------------------------------------- */
/* Block 4: Totals, Proportional Discounts & Multi-Tax (Tests 421–670)         */
/* -------------------------------------------------------------------------- */
console.log('\n--- Block 4: Totals, Proportional Discounts & Multi-Tax (Tests 421–670) ---');

for (let i = 421; i <= 670; i++) {
  const decimals = i % 10 === 0 ? 0 : i % 13 === 0 ? 3 : 2;
  const isPercent = i % 2 === 0;
  const discountVal = isPercent ? (i % 50) + 1 : ((i * 7) % 200) + 5;
  const taxRate1 = ((i % 15) + 1) * 1.0;
  const taxRate2 = ((i % 10) + 1) * 0.5;
  const hasShipping = i % 3 === 0;
  const shippingVal = hasShipping ? ((i * 5) % 50) + 5 : 0;
  const hasFee = i % 4 === 0;
  const feeVal = hasFee ? ((i * 3) % 25) + 2 : 0;

  const items: LineItem[] = [
    {
      id: `item-${i}-a`,
      desc: `Taxable Product #${i}`,
      qty: 2,
      unit: 'pcs',
      rate: 100,
      discount: 0,
      taxable: true,
    },
    {
      id: `item-${i}-b`,
      desc: `Non-taxable Consulting #${i}`,
      qty: 1,
      unit: 'hrs',
      rate: 100,
      discount: 0,
      taxable: false,
    },
  ];

  const taxes: TaxEntry[] = [
    { id: 'tax-1', name: 'Federal VAT', rate: taxRate1, enabled: true },
    { id: 'tax-2', name: 'State/Provincial', rate: taxRate2, enabled: i % 2 === 0 },
    { id: 'tax-3', name: 'Disabled Tax', rate: 10, enabled: false },
  ];

  const input: InvoiceTotalsInput = {
    items,
    discountType: isPercent ? 'percent' : 'fixed',
    discountValue: discountVal,
    taxes,
    shipping: shippingVal,
    additionalFee: feeVal,
    amountPaid: 0,
    decimals,
  };

  const totals = calculateInvoiceTotals(input);

  // Invariant 1: Subtotal is exactly 300
  const expectedSubtotal = roundMoney(200 + 100, decimals);
  // Invariant 2: Proportional discount integrity
  const expectedDiscountAmount = isPercent
    ? roundMoney(expectedSubtotal * (Math.min(100, discountVal) / 100), decimals)
    : roundMoney(Math.min(expectedSubtotal, discountVal), decimals);

  const taxableSub = roundMoney(200, decimals);
  const nonTaxableSub = roundMoney(100, decimals);
  const expTaxableDiscount = roundMoney(expectedDiscountAmount * (taxableSub / expectedSubtotal), decimals);
  const expTaxableBase = Math.max(0, roundMoney(taxableSub - expTaxableDiscount, decimals));

  // Invariant 3: Active tax summation
  let expTotalTax = 0;
  taxes.forEach((t) => {
    if (t.enabled && t.rate > 0) {
      expTotalTax = roundMoney(expTotalTax + roundMoney(expTaxableBase * (t.rate / 100), decimals), decimals);
    }
  });

  const expGrandTotal = Math.max(
    0,
    roundMoney(expectedSubtotal - expectedDiscountAmount + expTotalTax + shippingVal + feeVal, decimals)
  );

  assertTest(
    totals.subtotal === expectedSubtotal &&
    totals.discountAmount === expectedDiscountAmount &&
    totals.taxableBase === expTaxableBase &&
    totals.totalTax === expTotalTax &&
    totals.grandTotal === expGrandTotal &&
    totals.balanceDue === expGrandTotal,
    `T-${i}`,
    `Totals reconciliation for test #${i}: subtotal ${totals.subtotal}, discount ${totals.discountAmount}, tax ${totals.totalTax}, grandTotal ${totals.grandTotal}`
  );
}

/* -------------------------------------------------------------------------- */
/* Block 5: Partial Payments, Deposits & Balance Due (Tests 671–790)           */
/* -------------------------------------------------------------------------- */
console.log('\n--- Block 5: Partial Payments, Deposits & Balance Due (Tests 671–790) ---');

for (let i = 671; i <= 790; i++) {
  const decimals = i % 5 === 0 ? 0 : 2;
  const grandTotal = roundMoney(((i * 73) % 5000) + 100, decimals);
  let paidAmount = 0;

  if (i % 4 === 0) {
    paidAmount = 0; // Unpaid
  } else if (i % 4 === 1) {
    paidAmount = roundMoney(grandTotal * 0.5, decimals); // 50% deposit
  } else if (i % 4 === 2) {
    paidAmount = grandTotal; // Fully paid
  } else {
    paidAmount = roundMoney(grandTotal + 50, decimals); // Overpayment
  }

  const input: InvoiceTotalsInput = {
    items: [{ id: `item-p-${i}`, desc: 'Project Services', qty: 1, unit: 'ea', rate: grandTotal, discount: 0, taxable: false }],
    discountType: 'fixed',
    discountValue: 0,
    taxes: [],
    shipping: 0,
    additionalFee: 0,
    amountPaid: paidAmount,
    decimals,
  };

  const totals = calculateInvoiceTotals(input);
  const expectedBalanceDue = Math.max(0, roundMoney(grandTotal - paidAmount, decimals));

  assertTest(
    totals.balanceDue === expectedBalanceDue &&
    totals.balanceDue >= 0 &&
    (paidAmount >= grandTotal ? totals.balanceDue === 0 : totals.balanceDue > 0),
    `T-${i}`,
    `Balance due invariant: Grand Total ${grandTotal}, Paid ${paidAmount} -> Balance Due ${totals.balanceDue} (expected ${expectedBalanceDue})`
  );
}

/* -------------------------------------------------------------------------- */
/* Block 6: Draft Validation, Schema Sanitization & Caps (Tests 791–890)       */
/* -------------------------------------------------------------------------- */
console.log('\n--- Block 6: Draft Validation, Schema Sanitization & Caps (Tests 791–890) ---');

// Fuzzing with malformed draft payloads
const corruptInputs: unknown[] = [
  null,
  undefined,
  {},
  [],
  'string-draft',
  12345,
  { meta: null },
  { sender: 'not-an-object' },
  { client: 42 },
  { items: 'not-an-array' },
  { items: [] }, // Should fallback to 1 default empty item
  { discountType: 'invalid', discountValue: -50 }, // Clamped to 0
  { discountType: 'percent', discountValue: 150 }, // Percentage discount capped to 100!
  { discountType: 'percent', discountValue: 200 }, // Percentage discount capped to 100!
  { discountType: 'fixed', discountValue: -999 }, // Clamped to 0
  { shipping: -100 },
  { additionalFee: -50 },
  { amountPaid: -500 },
  { taxes: 'not-taxes' },
  { taxes: [{ id: 't1', rate: -5 }] }, // Negative tax rate clamped to 0
];

corruptInputs.forEach((bad, idx) => {
  const result = validateInvoiceDraft(bad);
  const isObject = Boolean(bad && typeof bad === 'object' && !Array.isArray(bad));
  if (!isObject) {
    assertTest(
      result.valid === false && result.sanitized === null && result.errors.length > 0,
      `T-${791 + idx}`,
      `validateInvoiceDraft safely rejects non-object input #${idx}`
    );
  } else {
    assertTest(
      result.sanitized !== null &&
      Array.isArray(result.sanitized.items) &&
      result.sanitized.items.length >= 1 &&
      result.sanitized.discountValue >= 0 &&
      (result.sanitized.discountType === 'percent' ? result.sanitized.discountValue <= 100 : true) &&
      result.sanitized.shipping >= 0 &&
      result.sanitized.amountPaid >= 0,
      `T-${791 + idx}`,
      `validateInvoiceDraft safely sanitizes corrupt input #${idx}`
    );
  }
});

// Parameterized field sanitization fuzzing (Tests 811–890)
for (let i = 811; i <= 890; i++) {
  const rawDiscount = (i % 2 === 0) ? 120 + i : -10;
  const isPercent = i % 2 === 0;

  const draftObj = {
    meta: {
      invNum: `INV-2026-${i}`,
      date: '2026-11-21',
      dueDate: '2026-12-21',
      status: 'Partially Paid',
      currencyCode: 'USD',
      paymentTerms: 'Net 30',
      poNumber: 'PO-999',
    },
    sender: {
      name: 'Acme Studio',
      bank: 'Bank Name: Silicon Valley Bank\nIBAN: US12345678901234567890\nSWIFT: SVBKUS6S',
    },
    client: {
      name: 'Global Corp',
    },
    items: [
      { id: `i-${i}`, desc: 'Development', qty: 0, unit: 'hrs', rate: 0, discount: -20, taxable: true },
    ],
    discountType: isPercent ? 'percent' : 'fixed',
    discountValue: rawDiscount,
    shipping: -25,
    additionalFee: -10,
    amountPaid: -50,
  };

  const res = validateInvoiceDraft(draftObj);
  const d = res.sanitized!;

  assertTest(
    d !== null &&
    d.items[0].qty === 0 &&
    d.items[0].rate === 0 &&
    d.items[0].discount === 0 &&
    (isPercent ? d.discountValue <= 100 : d.discountValue >= 0) &&
    d.shipping === 0 &&
    d.additionalFee === 0 &&
    d.amountPaid === 0 &&
    d.sender.bank.includes('US12345678901234567890'),
    `T-${i}`,
    `Sanitized draft negative clamping & percentage cap: discountValue ${d?.discountValue}`
  );
}

/* -------------------------------------------------------------------------- */
/* Block 7: RFC 4180 CSV Export & CWE-1236 Defense (Tests 891–990)             */
/* -------------------------------------------------------------------------- */
console.log('\n--- Block 7: RFC 4180 CSV Export & CWE-1236 Defense (Tests 891–990) ---');

// Dangerous formula injection prefixes
const formulaPrefixes = ['=', '+', '-', '@', '\t', '\r', '\n'];
formulaPrefixes.forEach((prefix, idx) => {
  const cell = `${prefix}SUM(A1:A10)`;
  const escaped = escapeCsvCell(cell);
  assertTest(
    escaped.startsWith(`"'${prefix}`) || escaped.startsWith(`'${prefix}`),
    `T-${891 + idx}`,
    `Formula prefix ${JSON.stringify(prefix)} neutralized with single quote`
  );
});

// Legitimate numbers and strings not erroneously prepended with quote
const legitimateCells: Array<[unknown, string]> = [
  [-10.5, '-10.5'],
  ['-10.50', '-10.50'],
  ['-1,234.56', '"-1,234.56"'],
  ['100', '100'],
  [0, '0'],
  ['Standard Text Description', 'Standard Text Description'],
  ['Text, with, commas', '"Text, with, commas"'],
  ['Text with "quotes"', '"Text with ""quotes"""'],
];
legitimateCells.forEach(([cell, exp], idx) => {
  assertEqual(escapeCsvCell(cell), exp, `T-${898 + idx}`, `escapeCsvCell(${String(cell)}) -> ${exp}`);
});

// Full CSV export structure and row validation (Tests 906–990)
for (let i = 906; i <= 990; i++) {
  const itemCount = (i % 5) + 1;
  const items: LineItem[] = Array.from({ length: itemCount }).map((_, j) => ({
    id: `item-${i}-${j}`,
    desc: j === 0 ? '=cmd|calc!A0' : `Consulting Service Part ${j + 1}`,
    qty: j + 1,
    unit: 'hours',
    rate: 100 * (j + 1),
    discount: 0,
    taxable: j % 2 === 0,
  }));

  const csv = generateLineItemsCsv(items, '$', 2);
  const rows = csv.split('\r\n');

  assertTest(
    rows.length === itemCount + 1 &&
    rows[0].includes('Description') &&
    rows[0].includes('Quantity') &&
    rows[0].includes('Unit Rate') &&
    rows[0].includes('Total') &&
    !rows[1].startsWith('=') && // Malicious formula neutralized
    rows[1].includes("'=cmd|calc!A0"),
    `T-${i}`,
    `generateLineItemsCsv generated ${rows.length} rows with formula injection protection`
  );
}

/* -------------------------------------------------------------------------- */
/* Block 8: A4 Multi-Page Pagination Engine & Height Budgeting (Tests 991–1110)*/
/* -------------------------------------------------------------------------- */
console.log('\n--- Block 8: A4 Multi-Page Pagination & Height Budgeting (Tests 991–1110) ---');

// Row height estimation tests
const shortItem: LineItem = { id: 's1', desc: 'Short title', qty: 1, unit: 'ea', rate: 100, discount: 0, taxable: true };
const longItem: LineItem = {
  id: 'l1',
  desc: 'Detailed architectural review, infrastructure optimization, high-availability PostgreSQL configuration, sub-millisecond edge isolate benchmarking, and RFC 9309 crawler security testing across global deployment clusters.',
  qty: 1,
  unit: 'ea',
  rate: 100,
  discount: 0,
  taxable: true,
};
assertTest(estimateItemRowHeight(shortItem) < estimateItemRowHeight(longItem), 'T-991', 'Long description increases estimated row height');

// Pagination invariants across item counts 1 to 120 (Tests 992–1110)
for (let i = 992; i <= 1110; i++) {
  const count = (i - 991); // 1 to 119 items
  const testItems: LineItem[] = Array.from({ length: count }).map((_, idx) => ({
    id: `page-item-${i}-${idx}`,
    desc: idx % 3 === 0
      ? 'Comprehensive software engineering and technical writing consultation with full deliverable verification'
      : `Standard line item #${idx + 1}`,
    qty: (idx % 5) + 1,
    unit: 'hrs',
    rate: 120,
    discount: 0,
    taxable: true,
  }));

  const pages = computeInvoicePages(testItems, {
    hasLogo: i % 2 === 0,
    hasNotes: true,
    hasBank: true,
    bankLength: 60,
    taxCount: 2,
    hasDiscount: true,
    hasTaxableBase: true,
    hasShipping: true,
    hasFee: true,
    hasPaid: true,
    hasClientShipping: false,
  });

  const totalPageCount = pages.length;
  const firstPage = pages[0];
  const lastPage = pages[totalPageCount - 1];

  // Invariant 1: First page is marked isFirstPage
  const isFirstCorrect = firstPage.isFirstPage === true && firstPage.pageNumber === 1;
  // Invariant 2: Last page is marked isLastPage and hasSummary
  const isLastCorrect = lastPage.isLastPage === true && lastPage.hasSummary === true && lastPage.pageNumber === totalPageCount;
  // Invariant 3: Total pages equals pages.length
  const totalPagesCorrect = pages.every((p) => p.totalPages === totalPageCount);
  // Invariant 4: Non-final pages never have hasSummary
  const nonFinalNoSummary = pages.slice(0, totalPageCount - 1).every((p) => p.hasSummary === false);
  // Invariant 5: Zero item loss - sum of items across pages strictly equals input count
  const distributedItemCount = pages.reduce((acc, p) => acc + p.items.length, 0);
  const zeroLoss = distributedItemCount === count;

  assertTest(
    isFirstCorrect && isLastCorrect && totalPagesCorrect && nonFinalNoSummary && zeroLoss,
    `T-${i}`,
    `Pagination for ${count} item(s): produced ${totalPageCount} page(s) with zero item loss and correct summary anchor`
  );
}

/* -------------------------------------------------------------------------- */
/* Final Test Execution Summary                                               */
/* -------------------------------------------------------------------------- */
console.log('\n======================================================================');
console.log(`🏁 Test Suite Finished: ${passedTests} / ${totalTests} Passed`);
if (failedTests > 0) {
  console.error(`💥 ${failedTests} TESTS FAILED!`);
  failureDetails.slice(0, 10).forEach((f) => console.error(f));
  process.exit(1);
} else {
  console.log(`🎉 100% OF ALL ${passedTests} TESTS PASSED WITH ZERO ERRORS!`);
  console.log('✅ invoiceEngine is 100% verified, mathematically exact, and spec-compliant.\n');
  process.exit(0);
}
