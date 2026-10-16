/**
 * OmniTools Invoice Calculation & Pagination Engine
 *
 * Deterministic mathematical calculation layer, decimal-safe monetary arithmetic,
 * multi-currency formatting, height-aware A4 pagination budgeting, and draft validation.
 *
 * 100% pure TypeScript: no DOM, browser globals, or side-effects.
 */

/* -------------------------------------------------------------------------- */
/* Types & Interfaces                                                         */
/* -------------------------------------------------------------------------- */

export interface LineItem {
  id: string;
  desc: string;
  qty: number;
  unit: string;
  rate: number;
  discount: number;
  taxable: boolean;
}

export interface ComputedLineItem extends LineItem {
  lineGross: number;
  lineDiscount: number;
  lineTotal: number;
}

export interface TaxEntry {
  id: string;
  name: string;
  rate: number;
  enabled: boolean;
}

export interface ComputedTaxEntry extends TaxEntry {
  amount: number;
}

export interface Sender {
  name: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  taxId: string;
  regNumber: string;
  bank: string;
}

export interface Client {
  name: string;
  address: string;
  shippingAddress: string;
  email: string;
  phone: string;
  taxId: string;
}

export type InvoiceStatus =
  | 'Draft'
  | 'Sent'
  | 'Partially Paid'
  | 'Paid'
  | 'Overdue'
  | 'Cancelled';

export interface InvoiceMeta {
  invNum: string;
  date: string;
  dueDate: string;
  paymentTerms: string;
  status: InvoiceStatus;
  poNumber: string;
  notes: string;
  terms: string;
}

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
}

export interface InvoiceTotalsInput {
  items: LineItem[];
  taxes?: TaxEntry[];
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  shipping?: number;
  additionalFee?: number;
  amountPaid?: number;
  decimals?: number;
}

export interface InvoiceTotals {
  computedItems: ComputedLineItem[];
  subtotal: number;
  taxableSubtotal: number;
  nonTaxableSubtotal: number;
  discountAmount: number;
  effectiveTaxableDiscount: number;
  taxableBase: number;
  nonTaxableBase: number;
  computedTaxes: ComputedTaxEntry[];
  totalTax: number;
  shippingAmount: number;
  feeAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  isFreshEmpty: boolean;
}

export interface PaginationOptions {
  hasLogo?: boolean;
  hasNotes?: boolean;
  notesLength?: number;
  hasBank?: boolean;
  bankLength?: number;
  taxCount?: number;
  hasDiscount?: boolean;
  hasShipping?: boolean;
  hasFee?: boolean;
  hasPaid?: boolean;
  hasClientShipping?: boolean;
  usablePageHeight?: number;
}

export interface PageData {
  pageNumber: number;
  totalPages: number;
  items: LineItem[];
  isFirstPage: boolean;
  isLastPage: boolean;
  hasSummary: boolean;
  startItemIndex: number;
}

export interface InvoiceDraft {
  version?: number;
  meta: InvoiceMeta;
  sender: Sender;
  client: Client;
  items: LineItem[];
  taxes: TaxEntry[];
  discountType: 'percent' | 'fixed';
  discountValue: number;
  shipping: number;
  additionalFee: number;
  additionalFeeLabel: string;
  amountPaid: number;
  currencyCode: string;
  logo?: string;
}

/* -------------------------------------------------------------------------- */
/* Currency & Decimal-Safe Monetary Arithmetic                                */
/* -------------------------------------------------------------------------- */

/**
 * Returns the standard minor-unit decimal places for a currency code per ISO 4217.
 * Defaults to 2 decimals if unrecognized.
 */
export function getCurrencyDecimals(code: string): number {
  const upper = (code || '').toUpperCase().trim();
  if (upper === 'PKR') return 2;
  // Zero-decimal currencies
  if (['JPY', 'KRW', 'VND', 'CLP', 'HUF', 'PYG', 'RWF', 'UGX'].includes(upper)) return 0;
  // Three-decimal currencies (Middle East / North Africa)
  if (['KWD', 'BHD', 'OMR', 'JOD', 'TND', 'LYD', 'IQD'].includes(upper)) return 3;

  try {
    if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
      const nf = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: upper,
      });
      const d = nf.resolvedOptions().maximumFractionDigits;
      return typeof d === 'number' ? d : 2;
    }
  } catch {
    // Ignore invalid code and fall back to 2
  }
  return 2;
}

/**
 * Decimal-safe financial rounding function implementing standard commercial "Round Half Away From Zero".
 * Avoids IEEE-754 floating-point representation anomalies across all magnitudes by shifting the decimal exponent.
 */
export function roundMoney(value: number, decimals: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return -roundMoney(-value, decimals);
  const parts = String(value).split('e');
  const exp = parts[1] ? Number(parts[1]) + decimals : decimals;
  const shifted = Math.round(Number(parts[0] + 'e' + exp));
  const unshiftedParts = String(shifted).split('e');
  const unexp = unshiftedParts[1] ? Number(unshiftedParts[1]) - decimals : -decimals;
  const result = Number(unshiftedParts[0] + 'e' + unexp);
  return Object.is(result, -0) ? 0 : result;
}

/**
 * Safely parses monetary input strings, stripping extraneous characters and validating finiteness.
 */
export function safeParseMoney(input: string | number | undefined | null): number {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? Math.max(0, input) : 0;
  }
  if (!input || typeof input !== 'string') return 0;
  const cleaned = input.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

/**
 * Formats a numeric value into a localized currency string with explicit decimal places.
 */
export function formatMoney(value: number, decimals: number, locale = 'en-US'): string {
  if (!Number.isFinite(value)) return (0).toFixed(decimals);
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    return value.toFixed(decimals);
  }
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into a clean, human-readable display date (DD MMM YYYY).
 */
export function formatDisplayDate(isoDate: string): string {
  if (!isoDate || typeof isoDate !== 'string') return '—';
  try {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(Date.UTC(year, month, day));
      if (!isNaN(d.getTime())) {
        return new Intl.DateTimeFormat('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC',
        }).format(d);
      }
    }
    return isoDate;
  } catch {
    return isoDate;
  }
}

/**
 * Common currency fallback list when Intl.supportedValuesOf is unavailable.
 */
export const DEFAULT_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', decimals: 2 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2 },
  { code: 'AED', name: 'United Arab Emirates Dirham', symbol: 'د.إ', decimals: 2 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimals: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', decimals: 2 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2 },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimals: 2 },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', decimals: 3 },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', decimals: 3 },
  { code: 'OMR', name: 'Omani Rial', symbol: 'OMR', decimals: 3 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0 },
];

/**
 * Returns available currency options using Intl metadata where available, with safe fallback.
 */
export function getCurrencyOptions(): CurrencyOption[] {
  try {
    const codes =
      typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function'
        ? Intl.supportedValuesOf('currency')
        : [];

    if (!codes.length) return DEFAULT_CURRENCIES;

    const displayNames =
      typeof Intl !== 'undefined' && 'DisplayNames' in Intl
        ? new Intl.DisplayNames(['en'], { type: 'currency' })
        : null;

    const formatterCache = new Map<string, string>();

    const getSymbol = (code: string) => {
      if (formatterCache.has(code)) return formatterCache.get(code)!;
      try {
        const parts = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: code,
          currencyDisplay: 'narrowSymbol',
        }).formatToParts(0);
        const currencyPart = parts.find((part) => part.type === 'currency');
        const symbol = currencyPart?.value || code;
        formatterCache.set(code, symbol);
        return symbol;
      } catch {
        return code;
      }
    };

    const options = codes.map((code) => ({
      code,
      name: displayNames?.of(code) || code,
      symbol: getSymbol(code),
      decimals: getCurrencyDecimals(code),
    }));

    // Prioritize key commerce currencies at the top
    const priorityOrder = ['USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED', 'SAR', 'CAD', 'AUD', 'JPY', 'CNY', 'CHF'];
    options.sort((a, b) => {
      const aIdx = priorityOrder.indexOf(a.code);
      const bIdx = priorityOrder.indexOf(b.code);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    return options;
  } catch {
    return DEFAULT_CURRENCIES;
  }
}

/* -------------------------------------------------------------------------- */
/* Line Item & Invoice Totals Calculations                                    */
/* -------------------------------------------------------------------------- */

/**
 * Computes individual line item gross, discount, and final line total.
 */
export function calculateLineItem(item: LineItem, decimals: number): ComputedLineItem {
  const qty = Number.isFinite(item.qty) ? Math.max(0, item.qty) : 0;
  const rate = Number.isFinite(item.rate) ? Math.max(0, item.rate) : 0;
  const rawGross = roundMoney(qty * rate, decimals);
  const lineDisc = Number.isFinite(item.discount)
    ? Math.max(0, Math.min(rawGross, item.discount))
    : 0;
  const lineTotal = roundMoney(rawGross - lineDisc, decimals);

  return {
    ...item,
    qty,
    rate,
    discount: lineDisc,
    lineGross: rawGross,
    lineDiscount: lineDisc,
    lineTotal,
    taxable: item.taxable !== false,
  };
}

/**
 * Pure, deterministic financial calculation engine.
 * Computes subtotal, discounts, taxable base, multi-tax breakdowns, shipping,
 * fees, grand total, and outstanding balance due.
 */
export function calculateInvoiceTotals(input: InvoiceTotalsInput): InvoiceTotals {
  const decimals = typeof input.decimals === 'number' ? Math.max(0, Math.min(4, input.decimals)) : 2;
  const items = Array.isArray(input.items) ? input.items : [];
  const taxes = Array.isArray(input.taxes) ? input.taxes : [];
  const discountType = input.discountType === 'fixed' ? 'fixed' : 'percent';
  const discountValue = Number.isFinite(input.discountValue) ? Math.max(0, input.discountValue || 0) : 0;
  const shipping = Number.isFinite(input.shipping) ? Math.max(0, input.shipping || 0) : 0;
  const additionalFee = Number.isFinite(input.additionalFee) ? Math.max(0, input.additionalFee || 0) : 0;
  const amountPaid = Number.isFinite(input.amountPaid) ? Math.max(0, input.amountPaid || 0) : 0;

  // 1. Line items calculation
  const computedItems = items.map((it) => calculateLineItem(it, decimals));

  // 2. Subtotal
  const subtotal = roundMoney(
    computedItems.reduce((acc, it) => acc + it.lineTotal, 0),
    decimals,
  );

  // 3. Fresh empty state check
  const isFreshEmpty =
    items.length === 1 &&
    !items[0].desc &&
    items[0].rate === 0 &&
    subtotal === 0;

  // 4. Global invoice discount
  let discountAmount = 0;
  if (discountType === 'percent') {
    const p = Math.min(100, Math.max(0, discountValue));
    discountAmount = roundMoney(subtotal * (p / 100), decimals);
  } else {
    discountAmount = roundMoney(Math.min(subtotal, discountValue), decimals);
  }

  // 5. Taxable vs Non-Taxable Subtotal
  const taxableSubtotal = roundMoney(
    computedItems.filter((it) => it.taxable).reduce((acc, it) => acc + it.lineTotal, 0),
    decimals,
  );
  const nonTaxableSubtotal = roundMoney(Math.max(0, subtotal - taxableSubtotal), decimals);

  // 6. Proportional discount allocation to taxable base
  let effectiveTaxableDiscount = 0;
  if (subtotal > 0 && taxableSubtotal > 0 && discountAmount > 0) {
    effectiveTaxableDiscount = roundMoney((taxableSubtotal / subtotal) * discountAmount, decimals);
  }

  // 7. Taxable Base & Non-Taxable Base
  const taxableBase = Math.max(0, roundMoney(taxableSubtotal - effectiveTaxableDiscount, decimals));
  const nonTaxableDiscount = Math.max(0, roundMoney(discountAmount - effectiveTaxableDiscount, decimals));
  const nonTaxableBase = Math.max(0, roundMoney(nonTaxableSubtotal - nonTaxableDiscount, decimals));

  // 8. Taxes
  const computedTaxes: ComputedTaxEntry[] = taxes
    .filter((t) => t.enabled && t.rate > 0)
    .map((t) => {
      const rate = Math.min(100, Math.max(0, Number(t.rate) || 0));
      const amount = roundMoney(taxableBase * (rate / 100), decimals);
      return {
        ...t,
        rate,
        amount,
      };
    });

  const totalTax = roundMoney(
    computedTaxes.reduce((acc, t) => acc + t.amount, 0),
    decimals,
  );

  // 9. Shipping & Additional Fee
  const shippingAmount = roundMoney(shipping, decimals);
  const feeAmount = roundMoney(additionalFee, decimals);

  // 10. Grand Total
  const grandTotal = roundMoney(
    taxableBase + nonTaxableBase + totalTax + shippingAmount + feeAmount,
    decimals,
  );

  // 11. Amount Paid & Balance Due
  const paidAmount = roundMoney(amountPaid, decimals);
  const balanceDue = roundMoney(Math.max(0, grandTotal - paidAmount), decimals);

  return {
    computedItems,
    subtotal,
    taxableSubtotal,
    nonTaxableSubtotal,
    discountAmount,
    effectiveTaxableDiscount,
    taxableBase,
    nonTaxableBase,
    computedTaxes,
    totalTax,
    shippingAmount,
    feeAmount,
    grandTotal,
    paidAmount,
    balanceDue,
    isFreshEmpty,
  };
}

/* -------------------------------------------------------------------------- */
/* Height-Aware A4 Multi-Page Pagination Engine                               */
/* -------------------------------------------------------------------------- */

/**
 * Estimates the vertical pixel height of a line item row in printable A4 format.
 * Accounts for text line-wrapping in standard column widths and discount badges.
 */
export function estimateItemRowHeight(item: LineItem): number {
  const desc = item.desc || '';
  // In a ~320px column with ~9px font, approximately 46 characters fit per line.
  const lines = Math.max(1, Math.ceil(desc.length / 46));
  const base = 22;
  const wrapExtra = (lines - 1) * 13;
  const discExtra = item.discount > 0 ? 11 : 0;
  return base + wrapExtra + discExtra;
}

/**
 * Dynamic A4 pagination algorithm that splits invoice items across pages
 * without table clipping or orphaned summary blocks.
 */
export function computeInvoicePages(
  items: LineItem[],
  options: PaginationOptions = {},
): PageData[] {
  if (items.length === 0) {
    return [
      {
        pageNumber: 1,
        totalPages: 1,
        items: [],
        isFirstPage: true,
        isLastPage: true,
        hasSummary: true,
        startItemIndex: 0,
      },
    ];
  }

  // Standard A4: 1123px height. Top/bottom padding (44px) + footer (26px) + safety reserve (23px) = 1030px usable.
  const USABLE_PAGE_HEIGHT = options.usablePageHeight || 1030;

  // Page 1 Overhead: Header (logo ? 140 : 110) + Billed To (80 or 100) + Table Header (26)
  const page1HeaderOverhead =
    (options.hasLogo ? 140 : 110) +
    (options.hasClientShipping ? 100 : 80) +
    26;

  // Continuation Page Overhead: Compact Header (24) + Table Header (24) + Margin (10) = 58px
  const contHeaderOverhead = 58;

  // Totals & Remittance Overhead:
  const taxLines = (options.taxCount || 0) * 12;
  const discLines = options.hasDiscount ? 22 : 0;
  const shipLine = options.hasShipping ? 12 : 0;
  const feeLine = options.hasFee ? 12 : 0;
  const paidLines = options.hasPaid ? 24 : 0;
  const totalsCardHeight = 54 + taxLines + discLines + shipLine + feeLine + paidLines;

  // Left column notes and bank routing height:
  const bankLines = Math.max(1, Math.ceil((options.bankLength || 0) / 44));
  const notesLines = options.hasNotes ? Math.max(1, Math.ceil((options.notesLength || 0) / 44)) : 0;
  const leftSummaryHeight = 18 + bankLines * 11 + (options.hasNotes ? 16 + notesLines * 11 : 0);

  const summaryHeight = Math.max(totalsCardHeight, leftSummaryHeight) + 16;

  // Available item budgets
  const PAGE1_WITH_SUMMARY_BUDGET = USABLE_PAGE_HEIGHT - page1HeaderOverhead - summaryHeight;
  const PAGE1_WITHOUT_SUMMARY_BUDGET = Math.min(520, USABLE_PAGE_HEIGHT - page1HeaderOverhead);
  const CONT_WITH_SUMMARY_BUDGET = USABLE_PAGE_HEIGHT - contHeaderOverhead - summaryHeight;
  const CONT_WITHOUT_SUMMARY_BUDGET = Math.min(700, USABLE_PAGE_HEIGHT - contHeaderOverhead);

  const itemHeights = items.map(estimateItemRowHeight);
  const totalItemsHeight = itemHeights.reduce((a, b) => a + b, 0);

  // If 15 items or fewer fit within the single-page budget, keep on 1 page!
  if (items.length <= 15 && totalItemsHeight <= PAGE1_WITH_SUMMARY_BUDGET) {
    return [
      {
        pageNumber: 1,
        totalPages: 1,
        items,
        isFirstPage: true,
        isLastPage: true,
        hasSummary: true,
        startItemIndex: 0,
      },
    ];
  }

  // Multi-page distribution
  const pages: { items: LineItem[]; hasSummary: boolean; startItemIndex: number }[] = [];
  let currentIndex = 0;
  let isFirst = true;

  while (currentIndex < items.length) {
    const isFirstPage = isFirst;
    isFirst = false;

    let remainingHeight = 0;
    for (let j = currentIndex; j < items.length; j++) {
      remainingHeight += itemHeights[j];
    }

    const budgetWithSummary = isFirstPage
      ? PAGE1_WITH_SUMMARY_BUDGET
      : CONT_WITH_SUMMARY_BUDGET;
    const budgetWithoutSummary = isFirstPage
      ? PAGE1_WITHOUT_SUMMARY_BUDGET
      : CONT_WITHOUT_SUMMARY_BUDGET;

    // Check if ALL remaining items fit on this page WITH summary
    if (remainingHeight <= budgetWithSummary && (!isFirstPage || items.length <= 15)) {
      pages.push({
        items: items.slice(currentIndex),
        hasSummary: true,
        startItemIndex: currentIndex,
      });
      currentIndex = items.length;
      break;
    }

    // Otherwise, fill page up to budgetWithoutSummary
    let currentSum = 0;
    let takeCount = 0;
    while (
      currentIndex + takeCount < items.length &&
      currentSum + itemHeights[currentIndex + takeCount] <= budgetWithoutSummary
    ) {
      currentSum += itemHeights[currentIndex + takeCount];
      takeCount++;
    }

    if (takeCount === 0) {
      takeCount = 1;
    }

    // Avoid leaving only 1 or 0 items orphaned on the final page if we can split more evenly
    if (currentIndex + takeCount === items.length && takeCount > 1) {
      const leaveForNext = Math.min(Math.max(1, Math.floor(takeCount * 0.25)), 4);
      takeCount = Math.max(1, takeCount - leaveForNext);
    }

    pages.push({
      items: items.slice(currentIndex, currentIndex + takeCount),
      hasSummary: false,
      startItemIndex: currentIndex,
    });
    currentIndex += takeCount;
  }

  // Safety: If final page doesn't have summary, append dedicated summary page
  if (pages.length > 0 && !pages[pages.length - 1].hasSummary) {
    pages.push({
      items: [],
      hasSummary: true,
      startItemIndex: items.length,
    });
  }

  const totalPages = pages.length;
  return pages.map((p, idx) => ({
    pageNumber: idx + 1,
    totalPages,
    items: p.items,
    isFirstPage: idx === 0,
    isLastPage: idx === totalPages - 1,
    hasSummary: p.hasSummary,
    startItemIndex: p.startItemIndex,
  }));
}

/* -------------------------------------------------------------------------- */
/* Draft Validation, Sanitization & CSV Export                                */
/* -------------------------------------------------------------------------- */

/**
 * Validates and sanitizes imported JSON invoice draft data to prevent script injection or malformed states.
 */
export function validateInvoiceDraft(data: unknown): {
  valid: boolean;
  errors: string[];
  sanitized: InvoiceDraft | null;
} {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Input data is not a valid JSON object.'], sanitized: null };
  }

  const obj = data as Record<string, unknown>;

  const metaRaw = (obj.meta as Record<string, unknown>) || {};
  const meta: InvoiceMeta = {
    invNum: typeof metaRaw.invNum === 'string' ? metaRaw.invNum.trim().slice(0, 50) : 'INV-0001',
    date: typeof metaRaw.date === 'string' ? metaRaw.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    dueDate: typeof metaRaw.dueDate === 'string' ? metaRaw.dueDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    paymentTerms: typeof metaRaw.paymentTerms === 'string' ? metaRaw.paymentTerms.slice(0, 50) : 'Due on Receipt',
    status: (['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'].includes(
      metaRaw.status as string,
    )
      ? metaRaw.status
      : 'Draft') as InvoiceStatus,
    poNumber: typeof metaRaw.poNumber === 'string' ? metaRaw.poNumber.trim().slice(0, 50) : '',
    notes: typeof metaRaw.notes === 'string' ? metaRaw.notes.slice(0, 2000) : '',
    terms: typeof metaRaw.terms === 'string' ? metaRaw.terms.slice(0, 2000) : '',
  };

  const senderRaw = (obj.sender as Record<string, unknown>) || {};
  const sender: Sender = {
    name: typeof senderRaw.name === 'string' ? senderRaw.name.slice(0, 100) : '',
    address: typeof senderRaw.address === 'string' ? senderRaw.address.slice(0, 300) : '',
    email: typeof senderRaw.email === 'string' ? senderRaw.email.slice(0, 100) : '',
    phone: typeof senderRaw.phone === 'string' ? senderRaw.phone.slice(0, 50) : '',
    website: typeof senderRaw.website === 'string' ? senderRaw.website.slice(0, 100) : '',
    taxId: typeof senderRaw.taxId === 'string' ? senderRaw.taxId.slice(0, 50) : '',
    regNumber: typeof senderRaw.regNumber === 'string' ? senderRaw.regNumber.slice(0, 50) : '',
    bank: typeof senderRaw.bank === 'string' ? senderRaw.bank.slice(0, 500) : '',
  };

  const clientRaw = (obj.client as Record<string, unknown>) || {};
  const client: Client = {
    name: typeof clientRaw.name === 'string' ? clientRaw.name.slice(0, 100) : '',
    address: typeof clientRaw.address === 'string' ? clientRaw.address.slice(0, 300) : '',
    shippingAddress: typeof clientRaw.shippingAddress === 'string' ? clientRaw.shippingAddress.slice(0, 300) : '',
    email: typeof clientRaw.email === 'string' ? clientRaw.email.slice(0, 100) : '',
    phone: typeof clientRaw.phone === 'string' ? clientRaw.phone.slice(0, 50) : '',
    taxId: typeof clientRaw.taxId === 'string' ? clientRaw.taxId.slice(0, 50) : '',
  };

  const rawItems = Array.isArray(obj.items) ? obj.items : [];
  const items: LineItem[] = rawItems.map((it: unknown, idx: number) => {
    const r = (it as Record<string, unknown>) || {};
    return {
      id: typeof r.id === 'string' ? r.id : `item-${Date.now()}-${idx}`,
      desc: typeof r.desc === 'string' ? r.desc.slice(0, 500) : '',
      qty: Number.isFinite(r.qty) ? Math.max(0, Number(r.qty)) : 1,
      unit: typeof r.unit === 'string' ? r.unit.slice(0, 30) : 'units',
      rate: Number.isFinite(r.rate) ? Math.max(0, Number(r.rate)) : 0,
      discount: Number.isFinite(r.discount) ? Math.max(0, Number(r.discount)) : 0,
      taxable: r.taxable !== false,
    };
  });

  if (items.length === 0) {
    items.push({
      id: `item-${Date.now()}-0`,
      desc: '',
      qty: 1,
      unit: 'units',
      rate: 0,
      discount: 0,
      taxable: true,
    });
  }

  const rawTaxes = Array.isArray(obj.taxes) ? obj.taxes : [];
  const taxes: TaxEntry[] = rawTaxes.map((t: unknown, idx: number) => {
    const r = (t as Record<string, unknown>) || {};
    return {
      id: typeof r.id === 'string' ? r.id : `tax-${Date.now()}-${idx}`,
      name: typeof r.name === 'string' ? r.name.slice(0, 50) : `Tax ${idx + 1}`,
      rate: Number.isFinite(r.rate) ? Math.min(100, Math.max(0, Number(r.rate))) : 0,
      enabled: r.enabled !== false,
    };
  });

  const discountType = obj.discountType === 'fixed' ? 'fixed' : 'percent';
  const discountValue = Number.isFinite(obj.discountValue) ? Math.max(0, Number(obj.discountValue)) : 0;
  const shipping = Number.isFinite(obj.shipping) ? Math.max(0, Number(obj.shipping)) : 0;
  const additionalFee = Number.isFinite(obj.additionalFee) ? Math.max(0, Number(obj.additionalFee)) : 0;
  const additionalFeeLabel =
    typeof obj.additionalFeeLabel === 'string' ? obj.additionalFeeLabel.slice(0, 50) : 'Processing Fee';
  const amountPaid = Number.isFinite(obj.amountPaid) ? Math.max(0, Number(obj.amountPaid)) : 0;
  const currencyCode = typeof obj.currencyCode === 'string' ? obj.currencyCode.slice(0, 10).toUpperCase() : 'USD';
  const logo = typeof obj.logo === 'string' && obj.logo.startsWith('data:image/') ? obj.logo : undefined;

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      version: 4,
      meta,
      sender,
      client,
      items,
      taxes,
      discountType,
      discountValue,
      shipping,
      additionalFee,
      additionalFeeLabel,
      amountPaid,
      currencyCode,
      logo,
    },
  };
}

/**
 * Generates structured RFC 4180 CSV export content for invoice line items.
 */
/**
 * Escapes a cell value for RFC 4180 CSV export.
 * Neutralizes spreadsheet formula injection (CWE-1236) for strings starting with =, +, -, @, \t, \r,
 * while ensuring legitimate negative numeric amounts (e.g. -10.00, -1,234.56) remain usable numbers.
 */
export function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const s = String(val);
  const trimmed = s.trim();

  // A legitimate negative or positive numeric amount (e.g. -10, -10.50, -1,234.56) is safe for spreadsheets
  // and must remain a usable numeric amount rather than being mangled into a text string with a leading quote.
  const isNumeric =
    (typeof val === 'number' && Number.isFinite(val)) ||
    /^-?\d+(?:\.\d+)?$/.test(trimmed) ||
    /^-?\d{1,3}(?:,\d{3})*(?:\.\d+)?$/.test(trimmed);

  // Check both the raw string and trimmed string for formula triggers: =, +, -, @, \t, \r, \n
  const isFormulaTrigger =
    /^[=+\-@\t\r\n]/.test(s) || (/^[=+\-@\t\r\n]/.test(trimmed) && trimmed.length > 0);

  let escaped = s;
  if (!isNumeric && isFormulaTrigger) {
    escaped = `'${s}`;
  }

  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')) {
    return `"${escaped.replace(/"/g, '""')}"`;
  }
  return escaped;
}

/**
 * Generates structured RFC 4180 CSV export content for invoice line items.
 */
export function generateLineItemsCsv(
  items: LineItem[],
  currencyCode = 'USD',
  decimals = 2,
): string {
  const headers = [
    'Item #',
    'Description',
    'Quantity',
    'Unit',
    'Unit Rate',
    'Line Discount',
    'Taxable',
    'Line Total',
    'Currency',
  ];

  const computedItems = items.map((it) => calculateLineItem(it, decimals));
  const rows = computedItems.map((it, idx) => [
    idx + 1,
    escapeCsvCell(it.desc),
    it.qty,
    escapeCsvCell(it.unit),
    it.rate.toFixed(decimals),
    it.discount.toFixed(decimals),
    it.taxable ? 'Yes' : 'No',
    it.lineTotal.toFixed(decimals),
    currencyCode,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}
