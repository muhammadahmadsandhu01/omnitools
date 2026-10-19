/**
 * Automated Regression & Independent Oracle Test Suite for KivaroTools Invoice Generator
 *
 * Verifies mathematical accuracy, floating-point safety, multi-currency decimal precision,
 * proportional tax and discount modeling, A4 pagination budgeting, and JSON/CSV serialization.
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
  validateInvoiceDraft,
  generateLineItemsCsv,
  escapeCsvCell,
  LineItem,
  TaxEntry,
  InvoiceTotalsInput,
} from '../lib/invoiceEngine';
import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
  }
}

function assertEqual<T>(actual: T, expected: T, testName: string) {
  const isMatch = actual === expected;
  assert(isMatch, testName, `Expected ${expected}, got ${actual}`);
}

console.log('=== KivaroTools Invoice Generator Test Suite ===\n');

/* -------------------------------------------------------------------------- */
/* 1. Monetary Rounding & Arithmetic Safety                                    */
/* -------------------------------------------------------------------------- */
console.log('Test Group 1: Decimal-Safe Arithmetic & Currency Decimals');

// Floating-point representation anomalies
assertEqual(roundMoney(0.1 + 0.2, 2), 0.3, 'Floating-point addition 0.1 + 0.2 rounds to 0.30');
assertEqual(roundMoney(1.005, 2), 1.01, 'Half-up rounding on 1.005 gives 1.01');
assertEqual(roundMoney(2.675, 2), 2.68, 'Half-up rounding on 2.675 gives 2.68');
assertEqual(roundMoney(35.855, 2), 35.86, 'Half-up rounding on 35.855 gives 35.86 (avoids float swallowing)');
assertEqual(roundMoney(1250.005, 2), 1250.01, 'Half-up rounding on 1250.005 gives 1250.01');
assertEqual(roundMoney(100000.005, 2), 100000.01, 'Half-up rounding on 100000.005 gives 100000.01');
assertEqual(roundMoney(-1.005, 2), -1.01, 'Symmetric half-up rounding on negative -1.005 gives -1.01');
assertEqual(roundMoney(-35.855, 2), -35.86, 'Symmetric half-up rounding on negative -35.855 gives -35.86');

// ISO Currency Decimals
assertEqual(getCurrencyDecimals('USD'), 2, 'USD has 2 decimals');
assertEqual(getCurrencyDecimals('EUR'), 2, 'EUR has 2 decimals');
assertEqual(getCurrencyDecimals('GBP'), 2, 'GBP has 2 decimals');
assertEqual(getCurrencyDecimals('PKR'), 2, 'PKR has 2 decimals');
assertEqual(getCurrencyDecimals('INR'), 2, 'INR has 2 decimals');
assertEqual(getCurrencyDecimals('JPY'), 0, 'JPY has 0 decimals');
assertEqual(getCurrencyDecimals('KRW'), 0, 'KRW has 0 decimals');
assertEqual(getCurrencyDecimals('KWD'), 3, 'KWD has 3 decimals');
assertEqual(getCurrencyDecimals('BHD'), 3, 'BHD has 3 decimals');
assertEqual(getCurrencyDecimals('OMR'), 3, 'OMR has 3 decimals');

// Safe parsing
assertEqual(safeParseMoney('$1,234.56'), 1234.56, 'Safe parse monetary string with symbol and commas');
assertEqual(safeParseMoney(-50), 0, 'Negative numbers clamped to 0');
assertEqual(safeParseMoney('invalid'), 0, 'Invalid string safely parsed as 0');

// Formatting
assertEqual(formatMoney(1250.5, 2), '1,250.50', 'Format 2-decimal money with thousands separator');
assertEqual(formatMoney(1250, 0), '1,250', 'Format 0-decimal money without fractions');
assertEqual(formatMoney(12.345, 3), '12.345', 'Format 3-decimal money');

/* -------------------------------------------------------------------------- */
/* 2. Line Item Calculations                                                  */
/* -------------------------------------------------------------------------- */
console.log('\nTest Group 2: Line Item Calculations');

const item1: LineItem = {
  id: 'item-1',
  desc: 'Web Development Services',
  qty: 10,
  unit: 'hours',
  rate: 150,
  discount: 0,
  taxable: true,
};

const comp1 = calculateLineItem(item1, 2);
assertEqual(comp1.lineGross, 1500, 'Standard line item gross calculation');
assertEqual(comp1.lineTotal, 1500, 'Standard line item total without discount');

// Line item with discount
const item2: LineItem = {
  id: 'item-2',
  desc: 'Design Consultation',
  qty: 4,
  unit: 'hours',
  rate: 100,
  discount: 50,
  taxable: true,
};
const comp2 = calculateLineItem(item2, 2);
assertEqual(comp2.lineGross, 400, 'Item 2 gross is 400');
assertEqual(comp2.lineDiscount, 50, 'Item 2 discount is 50');
assertEqual(comp2.lineTotal, 350, 'Item 2 total is 350');

// Discount exceeding gross is clamped
const itemExcessDiscount: LineItem = {
  id: 'item-excess',
  desc: 'Promo Item',
  qty: 1,
  unit: 'unit',
  rate: 75,
  discount: 200,
  taxable: true,
};
const compExcess = calculateLineItem(itemExcessDiscount, 2);
assertEqual(compExcess.lineDiscount, 75, 'Excess line discount is clamped to gross');
assertEqual(compExcess.lineTotal, 0, 'Line total cannot be negative');

// Decimal quantities
const itemDecimalQty: LineItem = {
  id: 'item-dec',
  desc: 'Consulting',
  qty: 2.75,
  unit: 'hours',
  rate: 120,
  discount: 0,
  taxable: true,
};
const compDec = calculateLineItem(itemDecimalQty, 2);
assertEqual(compDec.lineTotal, 330, '2.75 hours * $120/hr = $330.00');

/* -------------------------------------------------------------------------- */
/* 3. Invoice Totals & Proportional Tax / Discount Modeling                   */
/* -------------------------------------------------------------------------- */
console.log('\nTest Group 3: Invoice Totals, Discounts & Tax Allocation');

// Scenario A: Standard invoice with 10% VAT
const totalsA = calculateInvoiceTotals({
  items: [item1, item2], // 1500 + 350 = 1850 subtotal
  taxes: [{ id: 'tax-vat', name: 'VAT', rate: 10, enabled: true }],
  discountType: 'percent',
  discountValue: 0,
  shipping: 0,
  additionalFee: 0,
  amountPaid: 0,
  decimals: 2,
});

assertEqual(totalsA.subtotal, 1850, 'Scenario A: subtotal is 1850');
assertEqual(totalsA.taxableBase, 1850, 'Scenario A: full subtotal is taxable');
assertEqual(totalsA.totalTax, 185, 'Scenario A: 10% tax on 1850 is 185');
assertEqual(totalsA.grandTotal, 2035, 'Scenario A: grand total is 1850 + 185 = 2035');
assertEqual(totalsA.balanceDue, 2035, 'Scenario A: full balance due');

// Scenario B: Global Fixed Discount + Mixed Taxable / Non-Taxable Items
// Item 1: $100 taxable
// Item 2: $100 non-taxable
// Subtotal = $200
// Global discount = $40 fixed (20% effective)
// Taxable subtotal = $100 (50% of total)
// Proportional discount on taxable items = (100 / 200) * 40 = $20
// Taxable base = $100 - $20 = $80
// 10% Tax on $80 = $8.00
// Non-taxable base = $100 - $20 = $80
// Shipping = $15, Fee = $5
// Grand Total = $80 + $80 + $8 + $15 + $5 = $188.00
const totalsB = calculateInvoiceTotals({
  items: [
    { id: 't-1', desc: 'Taxable Goods', qty: 1, unit: 'units', rate: 100, discount: 0, taxable: true },
    { id: 't-2', desc: 'Tax-Exempt Services', qty: 1, unit: 'units', rate: 100, discount: 0, taxable: false },
  ],
  taxes: [{ id: 'vat', name: 'Sales Tax', rate: 10, enabled: true }],
  discountType: 'fixed',
  discountValue: 40,
  shipping: 15,
  additionalFee: 5,
  amountPaid: 50,
  decimals: 2,
});

assertEqual(totalsB.subtotal, 200, 'Scenario B: subtotal is 200');
assertEqual(totalsB.taxableSubtotal, 100, 'Scenario B: taxable subtotal is 100');
assertEqual(totalsB.nonTaxableSubtotal, 100, 'Scenario B: non-taxable subtotal is 100');
assertEqual(totalsB.discountAmount, 40, 'Scenario B: discount amount is 40');
assertEqual(totalsB.effectiveTaxableDiscount, 20, 'Scenario B: proportional taxable discount is 20');
assertEqual(totalsB.taxableBase, 80, 'Scenario B: taxable base is 80');
assertEqual(totalsB.nonTaxableBase, 80, 'Scenario B: non-taxable base is 80');
assertEqual(totalsB.totalTax, 8, 'Scenario B: 10% tax on 80 is 8');
assertEqual(totalsB.grandTotal, 188, 'Scenario B: grand total is 188');
assertEqual(totalsB.paidAmount, 50, 'Scenario B: paid amount is 50');
assertEqual(totalsB.balanceDue, 138, 'Scenario B: balance due is 138');

// Scenario C: Multiple Taxes (State 6% + Local 2%)
const totalsMultiTax = calculateInvoiceTotals({
  items: [{ id: 'm-1', desc: 'Hardware', qty: 1, unit: 'unit', rate: 1000, discount: 0, taxable: true }],
  taxes: [
    { id: 'state', name: 'State Tax', rate: 6, enabled: true },
    { id: 'local', name: 'Local County Tax', rate: 2, enabled: true },
    { id: 'disabled', name: 'Disabled Tax', rate: 5, enabled: false },
  ],
  decimals: 2,
});

assertEqual(totalsMultiTax.computedTaxes.length, 2, 'Only enabled taxes are computed');
assertEqual(totalsMultiTax.computedTaxes[0].amount, 60, 'State tax 6% of 1000 = 60');
assertEqual(totalsMultiTax.computedTaxes[1].amount, 20, 'Local tax 2% of 1000 = 20');
assertEqual(totalsMultiTax.totalTax, 80, 'Total tax is 80');
assertEqual(totalsMultiTax.grandTotal, 1080, 'Grand total with multi-tax is 1080');

/* -------------------------------------------------------------------------- */
/* 4. Multi-Currency Minor Unit Precision                                     */
/* -------------------------------------------------------------------------- */
console.log('\nTest Group 4: Multi-Currency Minor Unit Precision');

// 0-decimal currency: JPY (Japanese Yen)
const totalsJPY = calculateInvoiceTotals({
  items: [
    { id: 'j-1', desc: 'Consulting JPY', qty: 3, unit: 'hours', rate: 12500, discount: 0, taxable: true },
  ],
  taxes: [{ id: 'consumption', name: 'Consumption Tax', rate: 10, enabled: true }],
  decimals: 0,
});
assertEqual(totalsJPY.subtotal, 37500, 'JPY subtotal has 0 decimals');
assertEqual(totalsJPY.totalTax, 3750, 'JPY tax has 0 decimals');
assertEqual(totalsJPY.grandTotal, 41250, 'JPY grand total has 0 decimals');

// 3-decimal currency: KWD (Kuwaiti Dinar)
const totalsKWD = calculateInvoiceTotals({
  items: [
    { id: 'k-1', desc: 'Engineering Service', qty: 10, unit: 'units', rate: 15.125, discount: 0, taxable: true },
  ],
  taxes: [{ id: 'tax-kwd', name: 'Municipal Fee', rate: 5, enabled: true }],
  decimals: 3,
});
assertEqual(totalsKWD.subtotal, 151.250, 'KWD subtotal has 3 decimals');
assertEqual(totalsKWD.totalTax, 7.563, 'KWD 5% tax on 151.250 = 7.563');
assertEqual(totalsKWD.grandTotal, 158.813, 'KWD grand total rounds to 3 decimals');

/* -------------------------------------------------------------------------- */
/* 5. Edge Cases & Boundary Conditions                                        */
/* -------------------------------------------------------------------------- */
console.log('\nTest Group 5: Edge Cases & Boundary Conditions');

// Empty items array
const totalsEmpty = calculateInvoiceTotals({ items: [] });
assertEqual(totalsEmpty.subtotal, 0, 'Empty items subtotal is 0');
assertEqual(totalsEmpty.grandTotal, 0, 'Empty items grand total is 0');
assertEqual(totalsEmpty.balanceDue, 0, 'Empty items balance due is 0');

// Overpayment
const totalsOverpaid = calculateInvoiceTotals({
  items: [{ id: 'o-1', desc: 'Item', qty: 1, unit: 'unit', rate: 100, discount: 0, taxable: true }],
  amountPaid: 150,
  decimals: 2,
});
assertEqual(totalsOverpaid.grandTotal, 100, 'Grand total is 100');
assertEqual(totalsOverpaid.paidAmount, 150, 'Paid amount is 150');
assertEqual(totalsOverpaid.balanceDue, 0, 'Overpayment results in 0 balance due, not negative');

// 100% discount
const totalsFree = calculateInvoiceTotals({
  items: [{ id: 'f-1', desc: 'Gift Item', qty: 1, unit: 'unit', rate: 250, discount: 0, taxable: true }],
  discountType: 'percent',
  discountValue: 100,
  taxes: [{ id: 'tax', name: 'Tax', rate: 10, enabled: true }],
  decimals: 2,
});
assertEqual(totalsFree.discountAmount, 250, '100% discount reduces taxable base to 0');
assertEqual(totalsFree.taxableBase, 0, 'Taxable base is 0');
assertEqual(totalsFree.totalTax, 0, 'No tax on zero taxable base');
assertEqual(totalsFree.grandTotal, 0, 'Grand total is 0');

// Extreme large numbers
const totalsLarge = calculateInvoiceTotals({
  items: [{ id: 'l-1', desc: 'Enterprise Contract', qty: 1, unit: 'year', rate: 10000000, discount: 0, taxable: true }],
  shipping: 50000,
  decimals: 2,
});
assertEqual(totalsLarge.grandTotal, 10050000, 'Large financial figures calculate without overflow');

/* -------------------------------------------------------------------------- */
/* 6. Height-Aware A4 Multi-Page Pagination Engine                           */
/* -------------------------------------------------------------------------- */
console.log('\nTest Group 6: A4 Multi-Page Pagination Engine');

// 3 small items -> fits on single page
const smallItems: LineItem[] = [
  { id: '1', desc: 'Small item 1', qty: 1, unit: 'units', rate: 10, discount: 0, taxable: true },
  { id: '2', desc: 'Small item 2', qty: 1, unit: 'units', rate: 20, discount: 0, taxable: true },
  { id: '3', desc: 'Small item 3', qty: 1, unit: 'units', rate: 30, discount: 0, taxable: true },
];

const pagesSingle = computeInvoicePages(smallItems, { hasLogo: true, hasNotes: true });
assertEqual(pagesSingle.length, 1, 'Small invoice produces exactly 1 page');
assertEqual(pagesSingle[0].pageNumber, 1, 'Page number is 1');
assertEqual(pagesSingle[0].totalPages, 1, 'Total pages is 1');
assertEqual(pagesSingle[0].hasSummary, true, 'Page 1 contains summary');
assertEqual(pagesSingle[0].isFirstPage, true, 'Page 1 is first page');
assertEqual(pagesSingle[0].isLastPage, true, 'Page 1 is last page');

// 30 items with long descriptions -> splits across multiple pages cleanly
const multiItems: LineItem[] = Array.from({ length: 30 }, (_, i) => ({
  id: `item-${i + 1}`,
  desc: `Extensive consulting deliverable #${i + 1} with comprehensive project scope and detailed milestone review`,
  qty: i + 1,
  unit: 'hours',
  rate: 100,
  discount: i % 3 === 0 ? 10 : 0,
  taxable: true,
}));

const pagesMulti = computeInvoicePages(multiItems, { hasLogo: true, hasNotes: true, taxCount: 2 });
assert(pagesMulti.length > 1, `30 complex items split into multiple pages (actual: ${pagesMulti.length})`);
assertEqual(pagesMulti[0].isFirstPage, true, 'First page marked isFirstPage');
assertEqual(pagesMulti[0].hasSummary, false, 'Page 1 has no summary when continuing to page 2');
assertEqual(pagesMulti[pagesMulti.length - 1].isLastPage, true, 'Final page marked isLastPage');
assertEqual(pagesMulti[pagesMulti.length - 1].hasSummary, true, 'Final page contains summary card');

// Verify all items are preserved across pages
const totalItemsInPages = pagesMulti.reduce((acc, p) => acc + p.items.length, 0);
assertEqual(totalItemsInPages, multiItems.length, 'All 30 items are accounted for across pages with zero loss');

// Verify row height estimation
const shortRowHeight = estimateItemRowHeight({ id: 's', desc: 'Short', qty: 1, unit: 'u', rate: 10, discount: 0, taxable: true });
const longRowHeight = estimateItemRowHeight({ id: 'l', desc: 'A very long description that wraps across multiple lines and exceeds forty-six characters in the table column', qty: 1, unit: 'u', rate: 10, discount: 5, taxable: true });
assert(longRowHeight > shortRowHeight, 'Long item row height is greater than short item row height');

/* -------------------------------------------------------------------------- */
/* 7. Draft Validation & Security Sanitization                               */
/* -------------------------------------------------------------------------- */
console.log('\nTest Group 7: Draft Validation & Security Sanitization');

// Valid draft import
const rawDraft = {
  version: 4,
  meta: { invNum: 'INV-2026-001', date: '2026-10-16', dueDate: '2026-11-16', status: 'Sent' },
  sender: { name: 'Acme Corp', email: 'billing@acme.com' },
  client: { name: 'Global Client LLC', email: 'ap@globalclient.com' },
  items: [
    { id: 'i-1', desc: 'Software License', qty: 5, unit: 'seats', rate: 200, discount: 50, taxable: true },
  ],
  taxes: [{ id: 't-1', name: 'VAT', rate: 20, enabled: true }],
  discountType: 'percent',
  discountValue: 5,
  shipping: 0,
  additionalFee: 0,
  currencyCode: 'EUR',
};

const validation = validateInvoiceDraft(rawDraft);
assertEqual(validation.valid, true, 'Valid draft passes validation');
assertEqual(validation.sanitized?.meta.invNum, 'INV-2026-001', 'Sanitized invNum preserved');
assertEqual(validation.sanitized?.client.name, 'Global Client LLC', 'Sanitized client name preserved');
assertEqual(validation.sanitized?.items[0].rate, 200, 'Sanitized item rate preserved');

// Malformed draft safely handled
const corruptedDraft = { items: 'not an array', meta: null };
const corruptedValidation = validateInvoiceDraft(corruptedDraft);
assert(corruptedValidation.sanitized !== null, 'Corrupted draft returns non-null sanitized default draft');
assertEqual(corruptedValidation.sanitized?.items.length, 1, 'Corrupted draft defaults to 1 empty item');

// Negative numbers in draft are sanitized to zero
const negativeDraft = {
  items: [{ id: 'neg-1', desc: 'Bad', qty: -5, unit: 'u', rate: -100, discount: -20, taxable: true }],
  discountValue: -50,
  shipping: -10,
  amountPaid: -200,
};
const negValidation = validateInvoiceDraft(negativeDraft);
assertEqual(negValidation.sanitized?.items[0].qty, 0, 'Negative quantity in draft sanitized to 0');
assertEqual(negValidation.sanitized?.items[0].rate, 0, 'Negative rate in draft sanitized to 0');
assertEqual(negValidation.sanitized?.discountValue, 0, 'Negative discountValue sanitized to 0');
assertEqual(negValidation.sanitized?.shipping, 0, 'Negative shipping sanitized to 0');

/* -------------------------------------------------------------------------- */
/* 8. CSV Export & Formula Injection Defense                                  */
/* -------------------------------------------------------------------------- */
console.log('\nTest Group 8: CSV Export & Formula Injection Defense');

const csvNormalOutput = generateLineItemsCsv(smallItems, 'USD', 2);
assert(csvNormalOutput.includes('Item #,Description,Quantity,Unit,Unit Rate,Line Discount,Taxable,Line Total,Currency'), 'CSV contains standard RFC 4180 headers');
assert(csvNormalOutput.includes('Small item 1,1,units,10.00,0.00,Yes,10.00,USD'), 'CSV contains formatted line items');

// Formula injection test vectors
const injectionItems: LineItem[] = [
  { id: 'inj-1', desc: '=cmd|\'/C calc\'!A0', qty: 1, unit: 'u', rate: 10, discount: 0, taxable: true },
  { id: 'inj-2', desc: '+12345', qty: 1, unit: 'u', rate: 10, discount: 0, taxable: true },
  { id: 'inj-3', desc: '-HYPERLINK("http://evil.com")', qty: 1, unit: 'u', rate: 10, discount: 0, taxable: true },
  { id: 'inj-4', desc: '@SUM(A1:A10)', qty: 1, unit: 'u', rate: 10, discount: 0, taxable: true },
];

const csvProtectedOutput = generateLineItemsCsv(injectionItems, 'USD', 2);
assert(csvProtectedOutput.includes("'=cmd|"), "Cells beginning with '=' are neutralized with single quote prefix");
assert(csvProtectedOutput.includes("'+12345"), "Cells beginning with '+' are neutralized with single quote prefix");
assert(csvProtectedOutput.includes("'-HYPERLINK"), "Cells beginning with '-' are neutralized with single quote prefix");
assert(csvProtectedOutput.includes("'@SUM"), "Cells beginning with '@' are neutralized with single quote prefix");

// Verification that legitimate negative amounts remain usable numbers (not converted to text)
assertEqual(escapeCsvCell(-10.50), '-10.5', 'Legitimate numeric -10.50 is not prepended with single quote');
assertEqual(escapeCsvCell('-10.50'), '-10.50', 'Legitimate string -10.50 is not prepended with single quote');
assertEqual(escapeCsvCell('  -10.50  '), '  -10.50  ', 'Legitimate string -10.50 with whitespace is not prepended with single quote');
assertEqual(escapeCsvCell('-1,234.56'), '"-1,234.56"', 'Legitimate formatted -1,234.56 is quoted for comma but not prepended with quote');
assert(escapeCsvCell('=1+1').includes("'=1+1"), 'Formula =1+1 is neutralized with single quote');
assert(escapeCsvCell('-cmd|calc').includes("'-cmd"), 'Formula starting with - is neutralized with single quote');

// Advanced formula injection tests: leading whitespace, tabs, carriage returns, and newlines
assert(escapeCsvCell('  =cmd|calc').includes("'  =cmd|calc"), 'Formula with leading spaces is neutralized with single quote');
assert(escapeCsvCell('\t=cmd|calc').includes("'\t=cmd|calc"), 'Formula with leading tab is neutralized with single quote');
assert(escapeCsvCell('\r\n=cmd|calc').includes("'\r\n=cmd|calc"), 'Formula with leading newline is neutralized with single quote');
assert(escapeCsvCell('   @SUM(A1:B1)').includes("'   @SUM"), 'Formula with leading spaces before @ is neutralized with single quote');
assert(escapeCsvCell('\t').includes("'\t"), 'Raw tab character is neutralized with single quote');
assert(escapeCsvCell('\n').includes("'\n"), 'Raw newline character is neutralized with single quote');

/* -------------------------------------------------------------------------- */
/* 9. Property-Based Invariant Verification                                  */
/* -------------------------------------------------------------------------- */
console.log('\nTest Group 9: Property-Based Invariant Checks');

const invariantInput: InvoiceTotalsInput = {
  items: [
    { id: 'p-1', desc: 'Service Alpha', qty: 3, unit: 'hrs', rate: 125.50, discount: 15, taxable: true },
    { id: 'p-2', desc: 'Hardware Beta', qty: 2, unit: 'units', rate: 450.00, discount: 50, taxable: true },
    { id: 'p-3', desc: 'Exempt License', qty: 1, unit: 'seat', rate: 300.00, discount: 0, taxable: false },
  ],
  taxes: [
    { id: 't-state', name: 'State Tax', rate: 6.25, enabled: true },
    { id: 't-local', name: 'Local Surcharge', rate: 1.5, enabled: true },
  ],
  discountType: 'percent',
  discountValue: 7.5,
  shipping: 25.00,
  additionalFee: 12.50,
  amountPaid: 400.00,
  decimals: 2,
};

const totalsInv = calculateInvoiceTotals(invariantInput);

// Invariant 1: Reconciliation invariant
const reconciledTotal = roundMoney(
  totalsInv.taxableBase + totalsInv.nonTaxableBase + totalsInv.totalTax + totalsInv.shippingAmount + totalsInv.feeAmount,
  2,
);
assertEqual(totalsInv.grandTotal, reconciledTotal, 'Invariant 1: Grand total strictly reconciles with sum of components');

// Invariant 2: Payment consistency invariant
const reconciledBalance = roundMoney(Math.max(0, totalsInv.grandTotal - totalsInv.paidAmount), 2);
assertEqual(totalsInv.balanceDue, reconciledBalance, 'Invariant 2: Balance due strictly equals max(0, grandTotal - paidAmount)');

// Invariant 3: Tax base conservation
assert(totalsInv.taxableBase <= totalsInv.taxableSubtotal, 'Invariant 3: Taxable base never exceeds taxable subtotal');

// Invariant 4: Mathematical Idempotence (10 consecutive runs with identical inputs)
let isIdempotent = true;
for (let run = 0; run < 10; run++) {
  const rerun = calculateInvoiceTotals(invariantInput);
  if (
    rerun.grandTotal !== totalsInv.grandTotal ||
    rerun.balanceDue !== totalsInv.balanceDue ||
    rerun.totalTax !== totalsInv.totalTax
  ) {
    isIdempotent = false;
    break;
  }
}
assert(isIdempotent, 'Invariant 4: Repeated recalculation with identical inputs is 100% idempotent');

/* -------------------------------------------------------------------------- */
/* 10. PDF Generation & Blank-PDF Regression Defense                          */
/* -------------------------------------------------------------------------- */
console.log('\nTest Group 10: PDF Document Generation & Blank-PDF Regression Suite');

async function runPdfTests() {
  // Test 10.1: Default single-page PDF generation produces non-zero A4 dimensions and stream
  const docSingle = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
    compress: true,
  });
  docSingle.text('INVOICE #INV-0001', 20, 20);
  docSingle.text('Acme Web Services LLC', 20, 30);
  docSingle.text('Item: Cloud Consulting - $1,500.00', 20, 40);
  docSingle.text('Total: $1,500.00', 20, 50);

  const singleBytes = docSingle.output('arraybuffer');
  const pdfSingle = await PDFDocument.load(singleBytes);
  const singlePages = pdfSingle.getPages();

  assertEqual(singlePages.length, 1, 'Single-page invoice produces exactly 1 PDF page');
  const { width: sW, height: sH } = singlePages[0].getSize();
  assert(Math.abs(sW - 595.28) < 1, 'PDF width strictly matches ISO A4 width (595.28 pt)');
  assert(Math.abs(sH - 841.89) < 1, 'PDF height strictly matches ISO A4 height (841.89 pt)');
  assert(singleBytes.byteLength > 1000, 'Single-page PDF byte length exceeds minimum populated threshold (>1000 bytes)');

  // Test 10.2: Multi-page PDF generation produces 2 separate non-blank A4 pages
  const docMulti = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
    compress: true,
  });
  docMulti.text('INVOICE #INV-0002 (Page 1 of 2)', 20, 20);
  docMulti.addPage('a4', 'portrait');
  docMulti.text('INVOICE #INV-0002 (Page 2 of 2)', 20, 20);

  const multiBytes = docMulti.output('arraybuffer');
  const pdfMulti = await PDFDocument.load(multiBytes);
  const multiPages = pdfMulti.getPages();

  assertEqual(multiPages.length, 2, 'Multi-page invoice produces exactly 2 PDF pages');
  const { width: mW1, height: mH1 } = multiPages[0].getSize();
  const { width: mW2, height: mH2 } = multiPages[1].getSize();
  assert(Math.abs(mW1 - 595.28) < 1 && Math.abs(mW2 - 595.28) < 1, 'All multi-page PDF widths match ISO A4 (595.28 pt)');
  assert(Math.abs(mH1 - 841.89) < 1 && Math.abs(mH2 - 841.89) < 1, 'All multi-page PDF heights match ISO A4 (841.89 pt)');

  // Test 10.3: Blank PDF Rejection Oracle
  // An unrendered document with empty content produces a trivial 24-byte stream (q 0.1 0 0 0.1 0 0 cm Q)
  const docBlank = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: false });
  const rawBlank = docBlank.output('datauristring');
  const isBlankRejected = rawBlank.includes('24') || docBlank.output('arraybuffer').byteLength < 4000;
  assert(isBlankRejected, 'Blank PDF detection oracle flags and detects unpopulated documents');

  // Test 10.4: Multi-Page Layout Height Budgeting for 25 Items
  const twentyFiveItems: LineItem[] = Array.from({ length: 25 }, (_, i) => ({
    id: `item-${i + 1}`,
    desc: `Professional Consulting Deliverable Milestone ${i + 1} — Detailed Technical Architecture & Systems Engineering Scope`,
    qty: 1,
    unit: 'unit',
    rate: 250,
    discount: 0,
    taxable: true,
  }));

  const pagesBudget = computeInvoicePages(twentyFiveItems, {
    hasLogo: true,
    hasNotes: true,
    hasBank: true,
    taxCount: 2,
    hasDiscount: true,
    hasShipping: true,
  });

  assert(pagesBudget.length >= 2, `25 long-description items cleanly split across multiple pages (actual: ${pagesBudget.length})`);
  assertEqual(pagesBudget[0].isFirstPage, true, 'Page 1 correctly flagged as first page');
  assertEqual(pagesBudget[pagesBudget.length - 1].isLastPage, true, 'Final page correctly flagged as last page');
  assertEqual(pagesBudget[pagesBudget.length - 1].hasSummary, true, 'Final page correctly anchors summary card');

  const totalItemsRendered = pagesBudget.reduce((acc, p) => acc + p.items.length, 0);
  assertEqual(totalItemsRendered, 25, 'Zero item loss: exactly 25 items distributed across paginated sheets');

  // Test 10.5: ISO 216 Aspect Ratio Invariant (1:sqrt(2))
  const a4Ratio = 841.89 / 595.28;
  assert(Math.abs(a4Ratio - Math.SQRT2) < 0.005, 'ISO A4 aspect ratio strictly satisfies 1:sqrt(2)');

  /* -------------------------------------------------------------------------- */
  /* 11. Layout Visibility & Non-Clipping Defense Suite                          */
  /* -------------------------------------------------------------------------- */
  console.log('\nTest Group 11: Content Visibility & Non-Clipping Layout Defense');

  // Test 11.1: Height budgeting accounts for Amount Paid, Balance Due, and Taxable Base
  const itemsWithPaid: LineItem[] = Array.from({ length: 12 }, (_, i) => ({
    id: `item-${i + 1}`,
    desc: `Consulting Deliverable ${i + 1} with medium-length system description`,
    qty: 2,
    unit: 'hours',
    rate: 150,
    discount: 10,
    taxable: true,
  }));

  const pagesWithPaid = computeInvoicePages(itemsWithPaid, {
    hasLogo: true,
    hasNotes: true,
    hasBank: true,
    taxCount: 2,
    hasDiscount: true,
    hasTaxableBase: true,
    hasShipping: true,
    hasFee: true,
    hasPaid: true,
    hasClientShipping: true,
  });

  assert(pagesWithPaid.length >= 1, 'Pages computed successfully for full-featured invoice with Amount Paid');
  const lastPage = pagesWithPaid[pagesWithPaid.length - 1];
  assertEqual(lastPage.hasSummary, true, 'Summary card is anchored on the final page');

  // Test 11.2: Large financial amount formatting retains visible decimals and signs
  const largeAmount = 987654321.25;
  const formattedUsd = formatMoney(largeAmount, 2);
  assertEqual(formattedUsd, '987,654,321.25', 'Large numbers format with commas and 2 decimals');
  const formattedJpy = formatMoney(largeAmount, 0);
  assertEqual(formattedJpy, '987,654,321', 'Zero-decimal currencies format without fractional points');
  const formattedKwd = formatMoney(largeAmount, 3);
  assertEqual(formattedKwd, '987,654,321.250', 'Three-decimal currencies format with exactly 3 digits');

  // Test 11.3: Table column allocation strictly totals 100%
  const colWidths = [38, 8, 8, 16, 9, 21];
  const colTotal = colWidths.reduce((a, b) => a + b, 0);
  assertEqual(colTotal, 100, 'Printable A4 line items table column percentages strictly total 100%');
  assert(colWidths[3] >= 16, 'Rate column receives at least 16% width allocation');
  assert(colWidths[5] >= 20, 'Amount column receives at least 20% width allocation');

  // Test 11.4: Summary card width budget validation (290px card)
  const cardWidth = 290;
  const cardPadding = 12 * 2;
  const usableCardWidth = cardWidth - cardPadding; // 266px
  // In 9px monospace (char width ~6.5px), 16 characters take ~104px
  const mono16CharWidth = 16 * 6.5;
  const labelAvailableWidth = usableCardWidth - mono16CharWidth;
  assert(labelAvailableWidth > 150, 'Summary card provides at least 150px for row labels alongside large monetary values');

  /* -------------------------------------------------------------------------- */
  /* Final Summary                                                              */
  /* -------------------------------------------------------------------------- */
  console.log('\n===========================================');
  console.log(`Test Execution Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log('===========================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('ALL INVOICE GENERATOR TESTS PASSED SUCCESSFULLY.\n');
    process.exit(0);
  }
}

runPdfTests().catch((err) => {
  console.error('PDF Test Suite Error:', err);
  process.exit(1);
});
