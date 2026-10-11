'use client';

/* eslint-disable @next/next/no-img-element */

import { useMemo, useRef, useState, useSyncExternalStore, useEffect } from 'react';
import {
  UploadCloud,
  Trash2,
  Plus,
  Download,
  FileText,
  Loader2,
  ReceiptText,
  CalendarDays,
  ChevronDown,
  RotateCcw,
  Printer,
  FileSpreadsheet,
  FileCode,
  Upload,
  Check,
  AlertCircle,
  Info,
  Save,
  X,
  CreditCard,
  Building2,
  User,
} from 'lucide-react';

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

export interface TaxEntry {
  id: string;
  name: string;
  rate: number;
  enabled: boolean;
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

export interface PageData {
  pageNumber: number;
  totalPages: number;
  items: LineItem[];
  isFirstPage: boolean;
  isLastPage: boolean;
  hasSummary: boolean;
  startItemIndex: number;
}

const STORAGE_KEY = 'omni_invoice_draft_v4';

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyItem = (): LineItem => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  desc: '',
  qty: 1,
  unit: 'units',
  rate: 0,
  discount: 0,
  taxable: true,
});

const defaultTax = (): TaxEntry => ({
  id: `tax-${Date.now()}`,
  name: 'VAT / Sales Tax',
  rate: 10,
  enabled: true,
});

function formatDisplayDate(isoDate: string): string {
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

/* -------------------------------------------------------------------------- */
/* Currency & Monetary Helpers                                                */
/* -------------------------------------------------------------------------- */

function getCurrencyDecimals(code: string): number {
  const upper = (code || '').toUpperCase();
  if (upper === 'PKR') return 2;
  if (['JPY', 'KRW', 'VND', 'CLP', 'HUF', 'PYG', 'RWF', 'UGX'].includes(upper)) return 0;
  if (['KWD', 'BHD', 'OMR', 'JOD', 'TND', 'LYD', 'IQD'].includes(upper)) return 3;

  try {
    const nf = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: upper,
    });
    const d = nf.resolvedOptions().maximumFractionDigits;
    return typeof d === 'number' ? d : 2;
  } catch {
    return 2;
  }
}

function roundMoney(value: number, decimals: number): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function formatMoney(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return (0).toFixed(decimals);
  try {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    return value.toFixed(decimals);
  }
}

function getCurrencyOptions(): CurrencyOption[] {
  try {
    const codes =
      typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function'
        ? Intl.supportedValuesOf('currency')
        : [];

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

    options.sort((a, b) => {
      if (a.code === 'USD') return -1;
      if (b.code === 'USD') return 1;
      if (a.code === 'EUR') return -1;
      if (b.code === 'EUR') return 1;
      if (a.code === 'GBP') return -1;
      if (b.code === 'GBP') return 1;
      if (a.code === 'PKR') return -1;
      if (b.code === 'PKR') return 1;
      if (a.code === 'INR') return -1;
      if (b.code === 'INR') return 1;
      if (a.code === 'CAD') return -1;
      if (b.code === 'CAD') return 1;
      if (a.code === 'AUD') return -1;
      if (b.code === 'AUD') return 1;
      if (a.code === 'JPY') return -1;
      if (b.code === 'JPY') return 1;
      return a.name.localeCompare(b.name);
    });

    return options;
  } catch {
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
      { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
      { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
      { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', decimals: 2 },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2 },
      { code: 'AED', name: 'United Arab Emirates Dirham', symbol: 'د.إ', decimals: 2 },
      { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimals: 2 },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0 },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2 },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', decimals: 2 },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2 },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2 },
      { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', decimals: 3 },
      { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', decimals: 3 },
      { code: 'OMR', name: 'Omani Rial', symbol: 'OMR', decimals: 3 },
      { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0 },
    ];
  }
}

/* -------------------------------------------------------------------------- */
/* Height-Aware Pagination Engine                                             */
/* -------------------------------------------------------------------------- */

function estimateItemRowHeight(item: LineItem): number {
  const desc = item.desc || '';
  // In a 320px column with ~9px font, approximately 46-50 characters fit per line.
  const lines = Math.max(1, Math.ceil(desc.length / 46));
  // Base row height: 5px top/bottom padding + 12px line-height + 1px border = 18px (target 22px)
  const base = 22;
  const wrapExtra = (lines - 1) * 13;
  const discExtra = item.discount > 0 ? 11 : 0;
  return base + wrapExtra + discExtra;
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
}

function computeInvoicePages(
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

  // A4 Total Height = 1123px.
  // Page padding: 24px top + 20px bottom = 44px.
  // Footer: 20px height + 6px border/padding = 26px.
  // Net usable height between padding and footer: 1123 - 44 - 26 = 1053px.
  // Safety reserve: 23px.
  const USABLE_PAGE_HEIGHT = 1030;

  // Page 1 Overhead:
  // Header: logo ? 140px : 110px.
  // Billed To + Meta Dates: ~80px (+20px if clientShipping).
  // Table Header + margin: 26px.
  const page1HeaderOverhead =
    (options.hasLogo ? 140 : 110) +
    (options.hasClientShipping ? 100 : 80) +
    26;

  // Continuation Page Overhead:
  // Compact header (24px) + table header (24px) + margin (10px) = 58px.
  const contHeaderOverhead = 58;

  // Summary / Totals Overhead:
  // Base totals card (Subtotal + Total Due + padding/borders): 54px.
  const taxLines = (options.taxCount || 0) * 12;
  const discLines = options.hasDiscount ? 22 : 0; // discount + taxable base
  const shipLine = options.hasShipping ? 12 : 0;
  const feeLine = options.hasFee ? 12 : 0;
  const paidLines = options.hasPaid ? 24 : 0; // paid + balance due
  const totalsCardHeight = 54 + taxLines + discLines + shipLine + feeLine + paidLines;

  // Left column notes/bank height estimation:
  const bankLines = Math.max(1, Math.ceil((options.bankLength || 0) / 44));
  const notesLines = options.hasNotes ? Math.max(1, Math.ceil((options.notesLength || 0) / 44)) : 0;
  const leftSummaryHeight = 18 + bankLines * 11 + (options.hasNotes ? 16 + notesLines * 11 : 0);

  // Summary section height is the maximum of the two columns + top margin (16px):
  const summaryHeight = Math.max(totalsCardHeight, leftSummaryHeight) + 16;

  // Budgets:
  const PAGE1_WITH_SUMMARY_BUDGET = USABLE_PAGE_HEIGHT - page1HeaderOverhead - summaryHeight;
  const PAGE1_WITHOUT_SUMMARY_BUDGET = Math.min(520, USABLE_PAGE_HEIGHT - page1HeaderOverhead);
  const CONT_WITH_SUMMARY_BUDGET = USABLE_PAGE_HEIGHT - contHeaderOverhead - summaryHeight;
  const CONT_WITHOUT_SUMMARY_BUDGET = Math.min(700, USABLE_PAGE_HEIGHT - contHeaderOverhead);

  const itemHeights = items.map(estimateItemRowHeight);
  const totalItemsHeight = itemHeights.reduce((a, b) => a + b, 0);

  // If items <= 15 and they fit within the budget, keep on 1 page!
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

    // Remaining items height
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

    // Check if ALL remaining items fit on this page WITH summary:
    // (If on first page, only do this if total original items was <= 15)
    if (remainingHeight <= budgetWithSummary && (!isFirstPage || items.length <= 15)) {
      pages.push({
        items: items.slice(currentIndex),
        hasSummary: true,
        startItemIndex: currentIndex,
      });
      currentIndex = items.length;
      break;
    }

    // Otherwise, take as many items as fit without summary
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

    // Ensure we don't leave 0 items for the final page with summary
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

  // Safety: If final page somehow doesn't have summary, append summary page
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

function checkStoredDraftSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
}

function subscribeToStorage(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

/* -------------------------------------------------------------------------- */
/* UI Styles                                                                  */
/* -------------------------------------------------------------------------- */

const inputClass =
  'w-full min-w-0 rounded-xl border border-slate-700/90 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20';

const labelClass =
  'mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400';

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function InvoiceGenerator() {
  const isClient = useIsClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);
  const previewViewportRef = useRef<HTMLDivElement>(null);

  const [zoomMode, setZoomMode] = useState<'fit' | 'manual'>('fit');
  const [manualZoom, setManualZoom] = useState<number>(0.75);
  const [fitScale, setFitScale] = useState<number>(0.65);

  const effectiveScale = zoomMode === 'fit' ? fitScale : manualZoom;
  const [logo, setLogo] = useState('');
  const [currencyCode, setCurrencyCode] = useState('USD');

  /* Modals */
  const [showResetModal, setShowResetModal] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<Record<string, unknown> | null>(null);
  const [draftBannerDismissed, setDraftBannerDismissed] = useState(false);

  const hasStoredDraftInStorage = useSyncExternalStore(
    subscribeToStorage,
    checkStoredDraftSnapshot,
    () => false,
  );
  const hasStoredDraft = hasStoredDraftInStorage && !draftBannerDismissed;

  /* Invoice Metadata */
  const [meta, setMeta] = useState<InvoiceMeta>({
    invNum: 'INV-0001',
    date: todayISO(),
    dueDate: todayISO(),
    paymentTerms: 'Due on Receipt',
    status: 'Draft',
    poNumber: '',
    notes: 'Thank you for your business! Please contact us if you have any questions.',
    terms: 'Payment is due within the agreed timeframe. Late payments may incur standard fees.',
  });

  /* Sender & Client */
  const [sender, setSender] = useState<Sender>({
    name: '',
    address: '',
    email: '',
    phone: '',
    website: '',
    taxId: '',
    regNumber: '',
    bank: '',
  });

  const [client, setClient] = useState<Client>({
    name: '',
    address: '',
    shippingAddress: '',
    email: '',
    phone: '',
    taxId: '',
  });

  /* Line Items */
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);

  /* Financial Adjustments */
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountInput, setDiscountInput] = useState<string>('0');

  const [taxes, setTaxes] = useState<TaxEntry[]>([]);
  const [shipping, setShipping] = useState<number>(0);
  const [shippingInput, setShippingInput] = useState<string>('0');

  const [additionalFee, setAdditionalFee] = useState<number>(0);
  const [additionalFeeInput, setAdditionalFeeInput] = useState<string>('0');
  const [additionalFeeLabel, setAdditionalFeeLabel] = useState<string>('Processing Fee');

  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [amountPaidInput, setAmountPaidInput] = useState<string>('0');

  /* Currency Data */
  const currencies = useMemo(() => getCurrencyOptions(), []);
  const selectedCurrency = useMemo(
    () =>
      currencies.find((c) => c.code === currencyCode) ||
      currencies.find((c) => c.code === 'USD') || {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        decimals: 2,
      },
    [currencies, currencyCode],
  );

  const currencySymbol = selectedCurrency.symbol;
  const decimals = selectedCurrency.decimals;

  /* ------------------------------------------------------------------------ */
  /* Calculations (Pure Deterministic Financial Oracle)                       */
  /* ------------------------------------------------------------------------ */

  const computedItems = useMemo(() => {
    return items.map((item) => {
      const qty = Number.isFinite(item.qty) ? Math.max(0, item.qty) : 0;
      const rate = Number.isFinite(item.rate) ? Math.max(0, item.rate) : 0;
      const rawGross = qty * rate;
      const lineDisc = Number.isFinite(item.discount)
        ? Math.max(0, Math.min(rawGross, item.discount))
        : 0;
      const lineTotal = roundMoney(rawGross - lineDisc, decimals);
      return {
        ...item,
        qty,
        rate,
        discount: lineDisc,
        lineTotal,
        taxable: item.taxable !== false,
      };
    });
  }, [items, decimals]);

  const subtotal = useMemo(() => {
    const raw = computedItems.reduce((acc, it) => acc + it.lineTotal, 0);
    return roundMoney(raw, decimals);
  }, [computedItems, decimals]);

  const isFreshEmpty = useMemo(() => {
    return (
      items.length === 1 &&
      !items[0].desc &&
      items[0].rate === 0 &&
      subtotal === 0
    );
  }, [items, subtotal]);

  const discountAmount = useMemo(() => {
    if (discountType === 'percent') {
      const p = Math.min(100, Math.max(0, Number(discountValue) || 0));
      return roundMoney(subtotal * (p / 100), decimals);
    }
    const f = Math.max(0, Number(discountValue) || 0);
    return roundMoney(Math.min(subtotal, f), decimals);
  }, [discountType, discountValue, subtotal, decimals]);

  const taxableSubtotal = useMemo(() => {
    const raw = computedItems
      .filter((it) => it.taxable)
      .reduce((acc, it) => acc + it.lineTotal, 0);
    return roundMoney(raw, decimals);
  }, [computedItems, decimals]);

  const effectiveTaxableDiscount = useMemo(() => {
    if (subtotal <= 0) return 0;
    return roundMoney((taxableSubtotal / subtotal) * discountAmount, decimals);
  }, [subtotal, taxableSubtotal, discountAmount, decimals]);

  const taxableBase = useMemo(() => {
    return Math.max(0, roundMoney(taxableSubtotal - effectiveTaxableDiscount, decimals));
  }, [taxableSubtotal, effectiveTaxableDiscount, decimals]);

  const computedTaxes = useMemo(() => {
    return taxes
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
  }, [taxes, taxableBase, decimals]);

  const totalTax = useMemo(() => {
    const raw = computedTaxes.reduce((acc, t) => acc + t.amount, 0);
    return roundMoney(raw, decimals);
  }, [computedTaxes, decimals]);

  const shippingAmount = useMemo(
    () => roundMoney(Math.max(0, Number(shipping) || 0), decimals),
    [shipping, decimals],
  );

  const feeAmount = useMemo(
    () => roundMoney(Math.max(0, Number(additionalFee) || 0), decimals),
    [additionalFee, decimals],
  );

  const nonTaxableBase = useMemo(() => {
    const nonTaxableSub = subtotal - taxableSubtotal;
    const nonTaxableDisc = discountAmount - effectiveTaxableDiscount;
    return Math.max(0, roundMoney(nonTaxableSub - nonTaxableDisc, decimals));
  }, [subtotal, taxableSubtotal, discountAmount, effectiveTaxableDiscount, decimals]);

  const grandTotal = useMemo(() => {
    return roundMoney(
      taxableBase + nonTaxableBase + totalTax + shippingAmount + feeAmount,
      decimals,
    );
  }, [taxableBase, nonTaxableBase, totalTax, shippingAmount, feeAmount, decimals]);

  const paidAmount = useMemo(
    () => roundMoney(Math.max(0, Number(amountPaid) || 0), decimals),
    [amountPaid, decimals],
  );

  const balanceDue = useMemo(() => {
    return roundMoney(Math.max(0, grandTotal - paidAmount), decimals);
  }, [grandTotal, paidAmount, decimals]);

  /* Multi-page preview calculation */
  const previewPages = useMemo(
    () =>
      computeInvoicePages(items, {
        hasLogo: Boolean(logo),
        hasNotes: Boolean(meta.notes),
        notesLength: meta.notes?.length || 0,
        hasBank: Boolean(sender.bank),
        bankLength: sender.bank?.length || 0,
        taxCount: computedTaxes.length,
        hasDiscount: discountAmount > 0,
        hasShipping: shippingAmount > 0,
        hasFee: feeAmount > 0,
        hasPaid: paidAmount > 0,
        hasClientShipping: Boolean(client.shippingAddress),
      }),
    [
      items,
      logo,
      meta.notes,
      sender.bank,
      computedTaxes.length,
      discountAmount,
      shippingAmount,
      feeAmount,
      paidAmount,
      client.shippingAddress,
    ],
  );

  /* Inline Date Validation */
  const isDueDateInvalid = useMemo(() => {
    if (!meta.date || !meta.dueDate) return false;
    return meta.dueDate < meta.date;
  }, [meta.date, meta.dueDate]);

  /* ------------------------------------------------------------------------ */
  /* Item Handlers                                                            */
  /* ------------------------------------------------------------------------ */

  const handleItemChange = (
    index: number,
    field: keyof LineItem,
    value: string | number | boolean,
  ) => {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        if (field === 'qty' || field === 'rate' || field === 'discount') {
          const numeric = Math.max(0, Number(value) || 0);
          return { ...item, [field]: numeric };
        }
        return { ...item, [field]: value };
      }),
    );
  };

  const pendingFocusItemIdRef = useRef<string | null>(null);

  const addItem = () => {
    const newItem = emptyItem();
    pendingFocusItemIdRef.current = newItem.id;
    setItems((current) => [...current, newItem]);
  };

  useEffect(() => {
    if (!pendingFocusItemIdRef.current) return;
    const targetId = pendingFocusItemIdRef.current;
    pendingFocusItemIdRef.current = null;

    const timer = setTimeout(() => {
      const inputEl = document.getElementById(`item-desc-${targetId}`);
      if (inputEl) {
        inputEl.focus({ preventScroll: true });
        const cardEl = inputEl.closest('.line-item-card') || inputEl;
        cardEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }
    }, 20);

    return () => clearTimeout(timer);
  }, [items]);

  const handleLineItemsKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      addItem();
    }
  };

  const removeItem = (index: number) => {
    setItems((current) => (current.length === 1 ? current : current.filter((_, i) => i !== index)));
  };

  /* ------------------------------------------------------------------------ */
  /* Tax Handlers                                                             */
  /* ------------------------------------------------------------------------ */

  const addTax = () => {
    setTaxes((current) => [
      ...current,
      {
        ...defaultTax(),
        id: `tax-${Date.now()}-${current.length}`,
        name: current.length === 0 ? 'VAT / Tax' : `Tax ${current.length + 1}`,
      },
    ]);
  };

  const removeTax = (id: string) => {
    setTaxes((current) => current.filter((t) => t.id !== id));
  };

  const updateTax = (id: string, updates: Partial<TaxEntry>) => {
    setTaxes((current) => current.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  /* ------------------------------------------------------------------------ */
  /* Logo Handler                                                             */
  /* ------------------------------------------------------------------------ */

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      alert('For security and consistent PDF rendering, please upload PNG, JPG, or WebP images.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image exceeds 2 MB. Please upload a smaller logo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      setLogo((evt.target?.result as string) || '');
    };
    reader.readAsDataURL(file);
  };

  /* ------------------------------------------------------------------------ */
  /* Fit-to-screen scaling for Preview                                        */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const viewport = previewViewportRef.current;
    if (!viewport) return;

    const updateScale = () => {
      const isMobile = window.innerWidth < 640;
      const padX = isMobile ? 16 : 40;
      const availableWidth = Math.max(220, viewport.clientWidth - padX);
      const scaleX = (availableWidth - 8) / 794;
      const fit = isMobile ? Math.min(1.0, scaleX) : Math.min(1.0, scaleX);
      setFitScale(Math.max(0.25, Math.min(fit, 1.15)));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    window.addEventListener('resize', updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  const handleZoomIn = () => {
    setZoomMode('manual');
    setManualZoom(Math.min(1.8, Math.round((effectiveScale + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    setZoomMode('manual');
    setManualZoom(Math.max(0.25, Math.round((effectiveScale - 0.1) * 10) / 10));
  };

  const handleZoomFit = () => {
    setZoomMode('fit');
  };

  /* ------------------------------------------------------------------------ */
  /* Persistence & Reset (Explicit User Controlled)                           */
  /* ------------------------------------------------------------------------ */

  const handleSaveDraft = () => {
    try {
      const payload = {
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
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setDraftBannerDismissed(false);
      setSaveStatusMessage('Draft saved to browser storage.');
      setTimeout(() => setSaveStatusMessage(null), 3000);
    } catch {
      alert(
        'Could not save draft to local storage. Your storage quota may be exceeded (try removing the logo image).',
      );
    }
  };

  const handleRestoreDraft = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const draft = JSON.parse(stored);
      if (draft.meta) setMeta(draft.meta);
      if (draft.sender) setSender(draft.sender);
      if (draft.client) setClient(draft.client);
      if (Array.isArray(draft.items) && draft.items.length) setItems(draft.items);
      if (Array.isArray(draft.taxes) && draft.taxes.length) setTaxes(draft.taxes);
      if (draft.discountType) setDiscountType(draft.discountType);
      if (typeof draft.discountValue === 'number') {
        setDiscountValue(draft.discountValue);
        setDiscountInput(String(draft.discountValue));
      }
      if (typeof draft.shipping === 'number') {
        setShipping(draft.shipping);
        setShippingInput(String(draft.shipping));
      }
      if (typeof draft.additionalFee === 'number') {
        setAdditionalFee(draft.additionalFee);
        setAdditionalFeeInput(String(draft.additionalFee));
      }
      if (draft.additionalFeeLabel) setAdditionalFeeLabel(draft.additionalFeeLabel);
      if (typeof draft.amountPaid === 'number') {
        setAmountPaid(draft.amountPaid);
        setAmountPaidInput(String(draft.amountPaid));
      }
      if (draft.currencyCode) setCurrencyCode(draft.currencyCode);
      if (typeof draft.logo === 'string') setLogo(draft.logo);
      setDraftBannerDismissed(true);
      setSaveStatusMessage('Saved draft restored successfully.');
      setTimeout(() => setSaveStatusMessage(null), 3000);
    } catch {
      alert('Failed to restore draft from browser storage.');
    }
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setDraftBannerDismissed(true);
    } catch {
      // Ignore
    }
  };

  const confirmReset = () => {
    const today = todayISO();
    setMeta({
      invNum: 'INV-0001',
      date: today,
      dueDate: today,
      paymentTerms: 'Due on Receipt',
      status: 'Draft',
      poNumber: '',
      notes: 'Thank you for your business! Please contact us if you have any questions.',
      terms: 'Payment is due within the agreed timeframe. Late payments may incur standard fees.',
    });
    setSender({
      name: '',
      address: '',
      email: '',
      phone: '',
      website: '',
      taxId: '',
      regNumber: '',
      bank: '',
    });
    setClient({
      name: '',
      address: '',
      shippingAddress: '',
      email: '',
      phone: '',
      taxId: '',
    });
    setItems([emptyItem()]);
    setTaxes([]);
    setDiscountType('percent');
    setDiscountValue(0);
    setDiscountInput('0');
    setShipping(0);
    setShippingInput('0');
    setAdditionalFee(0);
    setAdditionalFeeInput('0');
    setAdditionalFeeLabel('Processing Fee');
    setAmountPaid(0);
    setAmountPaidInput('0');
    setLogo('');
    setCurrencyCode('USD');
    setShowResetModal(false);
    setSaveStatusMessage('Invoice reset to clean defaults.');
    setTimeout(() => setSaveStatusMessage(null), 3000);
  };

  /* ------------------------------------------------------------------------ */
  /* CSV Export (RFC-4180 with Formula Injection Protection)                  */
  /* ------------------------------------------------------------------------ */

  const exportCSV = () => {
    const escapeCell = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      let s = String(val);
      if (/^[=+\-@\t\r]/.test(s)) {
        s = `'${s}`;
      }
      return `"${s.replace(/"/g, '""')}"`;
    };

    const rows: string[][] = [
      ['INVOICE METADATA'],
      ['Invoice Number', meta.invNum],
      ['Status', meta.status],
      ['Issue Date', meta.date],
      ['Due Date', meta.dueDate],
      ['Payment Terms', meta.paymentTerms],
      ['PO / Reference', meta.poNumber || ''],
      ['Currency', currencyCode],
      [],
      ['SELLER (FROM)'],
      ['Company Name', sender.name],
      ['Address', sender.address],
      ['Email', sender.email],
      ['Phone', sender.phone],
      ['Website', sender.website],
      ['Tax ID / VAT', sender.taxId],
      ['Registration No', sender.regNumber],
      [],
      ['CLIENT (BILL TO)'],
      ['Customer Name', client.name],
      ['Billing Address', client.address],
      ['Shipping Address', client.shippingAddress || ''],
      ['Email', client.email],
      ['Phone', client.phone],
      ['Tax ID', client.taxId],
      [],
      ['LINE ITEMS'],
      ['#', 'Description', 'Quantity', 'Unit', 'Unit Price', 'Line Discount', 'Taxable', 'Total'],
      ...computedItems.map((item, idx) => [
        String(idx + 1),
        item.desc,
        String(item.qty),
        item.unit || '',
        formatMoney(item.rate, decimals),
        formatMoney(item.discount, decimals),
        item.taxable ? 'Yes' : 'No',
        formatMoney(item.lineTotal, decimals),
      ]),
      [],
      ['FINANCIAL SUMMARY'],
      ['Subtotal', formatMoney(subtotal, decimals)],
      ['Discount', `-${formatMoney(discountAmount, decimals)}`],
      ['Taxable Subtotal', formatMoney(taxableBase, decimals)],
      ...computedTaxes.map((t) => [`Tax (${t.name} ${t.rate}%)`, formatMoney(t.amount, decimals)]),
      ['Shipping', formatMoney(shippingAmount, decimals)],
      [additionalFeeLabel || 'Additional Fee', formatMoney(feeAmount, decimals)],
      ['Grand Total', formatMoney(grandTotal, decimals)],
      ['Amount Paid', formatMoney(paidAmount, decimals)],
      ['Balance Due', formatMoney(balanceDue, decimals)],
      [],
      ['PAYMENT & TERMS'],
      ['Payment Instructions', sender.bank],
      ['Notes', meta.notes],
      ['Terms & Conditions', meta.terms],
    ];

    const csvContent = rows.map((r) => r.map(escapeCell).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanNum = (meta.invNum || 'Invoice').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `Invoice_${cleanNum}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* ------------------------------------------------------------------------ */
  /* JSON Export & Import                                                     */
  /* ------------------------------------------------------------------------ */

  const exportJSON = () => {
    const exportData = {
      schemaVersion: 1,
      generator: 'OmniTools Business Invoice Generator',
      exportedAt: new Date().toISOString(),
      invoice: {
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

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanNum = (meta.invNum || 'Invoice').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `Invoice_${cleanNum}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleJSONFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('Invalid JSON structure');
        }
        setPendingImportData(parsed);
      } catch {
        alert('Invalid or corrupted JSON file. Please ensure the file is valid JSON.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const confirmJSONImport = () => {
    if (!pendingImportData) return;
    try {
      const inv = (pendingImportData.invoice as Record<string, unknown>) || pendingImportData;
      if (inv.meta) setMeta(inv.meta as InvoiceMeta);
      if (inv.sender) setSender(inv.sender as Sender);
      if (inv.client) setClient(inv.client as Client);
      if (Array.isArray(inv.items) && inv.items.length) setItems(inv.items as LineItem[]);
      if (Array.isArray(inv.taxes) && inv.taxes.length) setTaxes(inv.taxes as TaxEntry[]);
      if (inv.discountType === 'percent' || inv.discountType === 'fixed') {
        setDiscountType(inv.discountType);
      }
      if (typeof inv.discountValue === 'number') {
        setDiscountValue(inv.discountValue);
        setDiscountInput(String(inv.discountValue));
      }
      if (typeof inv.shipping === 'number') {
        setShipping(inv.shipping);
        setShippingInput(String(inv.shipping));
      }
      if (typeof inv.additionalFee === 'number') {
        setAdditionalFee(inv.additionalFee);
        setAdditionalFeeInput(String(inv.additionalFee));
      }
      if (typeof inv.additionalFeeLabel === 'string') {
        setAdditionalFeeLabel(inv.additionalFeeLabel);
      }
      if (typeof inv.amountPaid === 'number') {
        setAmountPaid(inv.amountPaid);
        setAmountPaidInput(String(inv.amountPaid));
      }
      if (typeof inv.currencyCode === 'string') setCurrencyCode(inv.currencyCode);
      if (typeof inv.logo === 'string') setLogo(inv.logo);

      setPendingImportData(null);
      setSaveStatusMessage('Invoice imported successfully.');
      setTimeout(() => setSaveStatusMessage(null), 3000);
    } catch {
      alert('Failed to apply imported invoice data.');
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Print Handler                                                            */
  /* ------------------------------------------------------------------------ */

  const handlePrint = () => {
    window.print();
  };

  /* ------------------------------------------------------------------------ */
  /* PDF Generation                                                           */
  /* ------------------------------------------------------------------------ */

  const generatePDF = async () => {
    const pages = Array.from(document.querySelectorAll('.invoice-document'));
    if (!pages.length) return;

    setIsGenerating(true);
    let wrapper: HTMLDivElement | null = null;

    try {
      wrapper = document.createElement('div');
      wrapper.id = 'omni-invoice-pdf-wrapper';
      wrapper.style.position = 'fixed';
      wrapper.style.left = '-100000px';
      wrapper.style.top = '0';
      wrapper.style.width = '794px';
      wrapper.style.background = '#ffffff';
      wrapper.style.zIndex = '-1';

      pages.forEach((page, idx) => {
        const clone = page.cloneNode(true) as HTMLElement;
        clone.style.transform = 'none';
        clone.style.zoom = '1';
        clone.style.width = '794px';
        clone.style.minHeight = '1123px';
        clone.style.aspectRatio = 'auto';
        clone.style.boxShadow = 'none';
        clone.style.margin = '0';

        if (idx < pages.length - 1) {
          clone.style.pageBreakAfter = 'always';
          clone.style.breakAfter = 'page';
        } else {
          clone.style.pageBreakAfter = 'auto';
          clone.style.breakAfter = 'auto';
        }

        wrapper!.appendChild(clone);
      });

      document.body.appendChild(wrapper);

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      const html2pdf = (await import('html2pdf.js')).default;
      const cleanInvNum = (meta.invNum || 'INV-0001').replace(/[^a-zA-Z0-9_-]/g, '_');

      await html2pdf()
        .from(wrapper)
        .set({
          margin: 0,
          filename: `Invoice_${cleanInvNum}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            onclone: (clonedDoc: Document) => {
              const clonedWrapper = clonedDoc.getElementById('omni-invoice-pdf-wrapper');
              if (clonedWrapper) {
                clonedWrapper.style.position = 'static';
                clonedWrapper.style.left = 'auto';
                clonedWrapper.style.top = 'auto';
                clonedWrapper.style.margin = '0';
                clonedWrapper.style.padding = '0';
              }

              // Color sanitization canvas for modern CSS color formats (lab, oklch, color-mix)
              const cvs = clonedDoc.createElement('canvas');
              cvs.width = 1;
              cvs.height = 1;
              const ctx = cvs.getContext('2d', { willReadFrequently: true });
              const colorCache = new Map<string, string>();

              const toRgb = (colorVal: string): string => {
                if (!colorVal || (!colorVal.includes('lab') && !colorVal.includes('oklch') && !colorVal.includes('color(') && !colorVal.includes('color-mix'))) {
                  return colorVal;
                }
                if (colorCache.has(colorVal)) return colorCache.get(colorVal)!;
                if (!ctx) return colorVal;
                try {
                  ctx.clearRect(0, 0, 1, 1);
                  ctx.fillStyle = colorVal;
                  ctx.fillRect(0, 0, 1, 1);
                  const d = ctx.getImageData(0, 0, 1, 1).data;
                  const res = d[3] === 255 
                    ? `rgb(${d[0]}, ${d[1]}, ${d[2]})` 
                    : `rgba(${d[0]}, ${d[1]}, ${d[2]}, ${(d[3] / 255).toFixed(3)})`;
                  colorCache.set(colorVal, res);
                  return res;
                } catch {
                  return colorVal;
                }
              };

              // Sanitize all elements inside clonedDoc
              const allElements = clonedDoc.querySelectorAll('*');
              const colorProps = [
                'color',
                'backgroundColor',
                'borderTopColor',
                'borderRightColor',
                'borderBottomColor',
                'borderLeftColor',
                'outlineColor',
                'textDecorationColor'
              ] as const;

              const view = clonedDoc.defaultView || window;
              allElements.forEach((el) => {
                const htmlEl = el as HTMLElement;
                if (!htmlEl.style) return;
                const cs = view.getComputedStyle(htmlEl);
                for (const prop of colorProps) {
                  const val = cs[prop];
                  if (val && (val.includes('lab') || val.includes('oklch') || val.includes('color(') || val.includes('color-mix'))) {
                    htmlEl.style[prop] = toRgb(val);
                  }
                }
              });

              const safeStyle = clonedDoc.createElement('style');
              safeStyle.textContent = `
                *, *::before, *::after {
                  border-color: #cbd5e1;
                  outline-color: transparent;
                  text-decoration-color: currentColor;
                }
              `;
              clonedDoc.head.appendChild(safeStyle);

              clonedDoc.documentElement.style.backgroundColor = '#ffffff';
              clonedDoc.documentElement.style.color = '#000000';
              clonedDoc.body.style.backgroundColor = '#ffffff';
              clonedDoc.body.style.color = '#000000';
            },
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
          },
        })
        .save();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Could not generate the PDF. Please try using the Print button to Save as PDF.');
    } finally {
      wrapper?.remove();
      setIsGenerating(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="mx-auto w-full max-w-[1360px] min-w-0 rounded-[28px] border border-slate-800 bg-[#070b14] p-3 shadow-2xl sm:p-5 lg:p-6">
      {/* ================================================================== */}
      {/* HEADER / TOOLBAR                                                   */}
      {/* ================================================================== */}

      <div className="mb-4 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/20">
            <ReceiptText className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-bold text-white sm:text-lg">
                Invoice Generator
              </h2>
              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                Global Business
              </span>
            </div>
            <p className="text-xs text-slate-400">
              International business invoice builder with deterministic multi-currency totals & A4 export.
            </p>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {saveStatusMessage && (
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 animate-fadeIn">
              <Check className="h-3.5 w-3.5" />
              <span>{saveStatusMessage}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
            title="Save draft to this browser"
          >
            <Save className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden sm:inline">Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
            title="Start new invoice"
          >
            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
            <span>New Invoice</span>
          </button>

          <div className="relative inline-block">
            <input
              ref={jsonImportRef}
              type="file"
              accept=".json"
              onChange={handleJSONFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => jsonImportRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
              title="Import JSON invoice file"
            >
              <Upload className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden md:inline">Import JSON</span>
            </button>
          </div>

          <button
            type="button"
            onClick={exportJSON}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
            title="Export invoice data as JSON"
          >
            <FileCode className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden md:inline">JSON</span>
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
            title="Export CSV spreadsheet"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
            title="Print invoice"
          >
            <Printer className="h-3.5 w-3.5 text-slate-300" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Draft Notification Banner */}
      {hasStoredDraft && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 text-xs text-blue-200">
            <Info className="h-4 w-4 shrink-0 text-blue-400" />
            <span>A previous invoice draft is available in your browser storage.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-500"
            >
              Restore Draft
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={() => setDraftBannerDismissed(true)}
              className="p-1 text-slate-400 hover:text-white"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Date Validation Alert Banner */}
      {isDueDateInvalid && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-semibold text-amber-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>Warning: Due date ({meta.dueDate}) is earlier than Issue date ({meta.date}).</span>
        </div>
      )}

      {/* ================================================================== */}
      {/* WORKSPACE GRID                                                     */}
      {/* ================================================================== */}

      <div className="grid w-full min-w-0 grid-cols-1 gap-6">
        {/* ================================================================= */}
        {/* FORM EDITOR                                                       */}
        {/* ================================================================= */}

        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/55">
          <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">Invoice Editor</p>
                <p className="text-[11px] text-slate-400">
                  Fill in business details, line items, taxes, and terms.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                <span
                  className={`h-2 w-2 rounded-full ${
                    meta.status === 'Paid'
                      ? 'bg-emerald-400'
                      : meta.status === 'Partially Paid'
                        ? 'bg-blue-400'
                        : meta.status === 'Overdue'
                          ? 'bg-red-400'
                          : meta.status === 'Sent'
                            ? 'bg-violet-400'
                            : 'bg-slate-400'
                  }`}
                />
                <span>{meta.status}</span>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-5 space-y-5">
            {/* 1. METADATA & LOGO CARD */}
            <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[170px_minmax(0,1fr)]">
              {/* Logo */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3.5">
                <label className={labelClass} htmlFor="logo-upload-btn">
                  Company Logo
                </label>
                <button
                  id="logo-upload-btn"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex h-[100px] w-full min-w-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-700 bg-slate-950/80 transition hover:border-blue-500/60 hover:bg-blue-500/[0.03]"
                >
                  {logo ? (
                    <img
                      src={logo}
                      alt="Company logo preview"
                      className="max-h-[75px] max-w-full object-contain"
                    />
                  ) : (
                    <span className="flex flex-col items-center gap-1.5 text-xs text-slate-400 group-hover:text-slate-300">
                      <UploadCloud className="h-5 w-5 text-slate-500" />
                      <span>Upload Logo</span>
                    </span>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                {logo && (
                  <button
                    type="button"
                    onClick={() => setLogo('')}
                    className="mt-1.5 w-full text-center text-[10px] font-semibold text-red-400 hover:underline"
                  >
                    Remove logo
                  </button>
                )}
                <p className="mt-1 text-[10px] text-slate-400">PNG, JPG, WebP · Max 2MB</p>
              </div>

              {/* Meta fields */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3.5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className={labelClass} htmlFor="meta-inv-num">
                      Invoice Number
                    </label>
                    <input
                      id="meta-inv-num"
                      value={meta.invNum}
                      onChange={(e) => setMeta((prev) => ({ ...prev, invNum: e.target.value }))}
                      className={inputClass}
                      placeholder="INV-0001"
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="meta-status">
                      Status
                    </label>
                    <select
                      id="meta-status"
                      value={meta.status}
                      onChange={(e) =>
                        setMeta((prev) => ({
                          ...prev,
                          status: e.target.value as InvoiceStatus,
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="meta-po-ref">
                      PO / Reference
                    </label>
                    <input
                      id="meta-po-ref"
                      value={meta.poNumber}
                      onChange={(e) => setMeta((prev) => ({ ...prev, poNumber: e.target.value }))}
                      className={inputClass}
                      placeholder="PO-9842"
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="meta-date">
                      Issue Date
                    </label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        id="meta-date"
                        type="date"
                        value={meta.date}
                        onChange={(e) => setMeta((prev) => ({ ...prev, date: e.target.value }))}
                        className={`${inputClass} pl-9 [color-scheme:dark]`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="meta-due-date">
                      Due Date
                    </label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        id="meta-due-date"
                        type="date"
                        value={meta.dueDate}
                        aria-invalid={isDueDateInvalid}
                        onChange={(e) => setMeta((prev) => ({ ...prev, dueDate: e.target.value }))}
                        className={`${inputClass} pl-9 [color-scheme:dark] ${
                          isDueDateInvalid ? 'border-amber-500/80 focus:ring-amber-500/20' : ''
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="meta-payment-terms">
                      Payment Terms
                    </label>
                    <select
                      id="meta-payment-terms"
                      value={meta.paymentTerms}
                      onChange={(e) =>
                        setMeta((prev) => ({ ...prev, paymentTerms: e.target.value }))
                      }
                      className={inputClass}
                    >
                      <option value="Due on Receipt">Due on Receipt</option>
                      <option value="Net 7">Net 7 Days</option>
                      <option value="Net 15">Net 15 Days</option>
                      <option value="Net 30">Net 30 Days</option>
                      <option value="Net 60">Net 60 Days</option>
                      <option value="Custom">Custom Terms</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. PARTIES (FROM & BILL TO) */}
            <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
              {/* FROM */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-400" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-400">
                    From · Business Details
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className={labelClass} htmlFor="sender-name">
                      Business / Seller Name
                    </label>
                    <input
                      id="sender-name"
                      value={sender.name}
                      onChange={(e) => setSender((prev) => ({ ...prev, name: e.target.value }))}
                      className={inputClass}
                      placeholder="Your Company / Brand Name"
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="sender-address">
                      Business Address
                    </label>
                    <textarea
                      id="sender-address"
                      value={sender.address}
                      onChange={(e) => setSender((prev) => ({ ...prev, address: e.target.value }))}
                      className={`${inputClass} min-h-[64px] resize-y`}
                      placeholder="Street, City, Postal Code, Country"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="sender-email">
                        Email
                      </label>
                      <input
                        id="sender-email"
                        value={sender.email}
                        onChange={(e) => setSender((prev) => ({ ...prev, email: e.target.value }))}
                        className={inputClass}
                        placeholder="billing@company.com"
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="sender-phone">
                        Phone
                      </label>
                      <input
                        id="sender-phone"
                        value={sender.phone}
                        onChange={(e) => setSender((prev) => ({ ...prev, phone: e.target.value }))}
                        className={inputClass}
                        placeholder="+1 555-0199"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="sender-tax-id">
                        Tax ID / VAT / GST / NTN
                      </label>
                      <input
                        id="sender-tax-id"
                        value={sender.taxId}
                        onChange={(e) => setSender((prev) => ({ ...prev, taxId: e.target.value }))}
                        className={inputClass}
                        placeholder="e.g. GB123456789 or NTN"
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="sender-reg">
                        Business / Reg. No.
                      </label>
                      <input
                        id="sender-reg"
                        value={sender.regNumber}
                        onChange={(e) =>
                          setSender((prev) => ({ ...prev, regNumber: e.target.value }))
                        }
                        className={inputClass}
                        placeholder="e.g. CRN-849201"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BILL TO */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-violet-400" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-violet-400">
                    Bill To · Client Details
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className={labelClass} htmlFor="client-name">
                      Customer / Client Name
                    </label>
                    <input
                      id="client-name"
                      value={client.name}
                      onChange={(e) => setClient((prev) => ({ ...prev, name: e.target.value }))}
                      className={inputClass}
                      placeholder="Client Name / Corporation"
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="client-address">
                      Billing Address
                    </label>
                    <textarea
                      id="client-address"
                      value={client.address}
                      onChange={(e) => setClient((prev) => ({ ...prev, address: e.target.value }))}
                      className={`${inputClass} min-h-[64px] resize-y`}
                      placeholder="Street, City, Postal Code, Country"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="client-email">
                        Email
                      </label>
                      <input
                        id="client-email"
                        value={client.email}
                        onChange={(e) => setClient((prev) => ({ ...prev, email: e.target.value }))}
                        className={inputClass}
                        placeholder="ap@client.com"
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="client-phone">
                        Phone
                      </label>
                      <input
                        id="client-phone"
                        value={client.phone}
                        onChange={(e) => setClient((prev) => ({ ...prev, phone: e.target.value }))}
                        className={inputClass}
                        placeholder="+1 555-0288"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="client-tax-id">
                        Client Tax ID / VAT
                      </label>
                      <input
                        id="client-tax-id"
                        value={client.taxId}
                        onChange={(e) => setClient((prev) => ({ ...prev, taxId: e.target.value }))}
                        className={inputClass}
                        placeholder="Customer VAT / Tax ID"
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="client-shipping">
                        Shipping Address (Optional)
                      </label>
                      <input
                        id="client-shipping"
                        value={client.shippingAddress}
                        onChange={(e) =>
                          setClient((prev) => ({
                            ...prev,
                            shippingAddress: e.target.value,
                          }))
                        }
                        className={inputClass}
                        placeholder="Delivery location if different"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. LINE ITEMS SECTION */}
            <div
              className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
              onKeyDown={handleLineItemsKeyDown}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Line Items</h3>
                  <p className="text-[11px] text-slate-400">
                    Add products or services. Line Amount = (Qty × Rate) - Line Discount.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Currency Selector */}
                  <div className="relative">
                    <label htmlFor="currency-select" className="sr-only">
                      Currency
                    </label>
                    <select
                      id="currency-select"
                      value={currencyCode}
                      onChange={(e) => setCurrencyCode(e.target.value)}
                      className="h-9 appearance-none rounded-xl border border-slate-700 bg-slate-950 pl-3 pr-8 text-xs font-semibold text-white outline-none transition focus:border-blue-500"
                    >
                      {currencies.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol}) — {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    aria-label="Add invoice line item"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 text-xs font-bold text-white shadow-md shadow-blue-600/10 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="mt-3 space-y-3">
                {computedItems.map((item, index) => (
                  <div
                    key={item.id}
                    id={`line-item-card-${item.id}`}
                    className="line-item-card rounded-xl border border-slate-800 bg-slate-900/60 p-3 transition hover:border-slate-700"
                  >
                    {/* Top Row: Description */}
                    <div className="mb-2.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label
                          htmlFor={`item-desc-${item.id}`}
                          className="text-[10px] font-semibold uppercase text-slate-400"
                        >
                          Item {index + 1} Description *
                        </label>
                        {!item.desc && (
                          <span className="text-[10px] text-amber-400">
                            Description recommended
                          </span>
                        )}
                      </div>
                      <input
                        id={`item-desc-${item.id}`}
                        value={item.desc}
                        onChange={(e) => handleItemChange(index, 'desc', e.target.value)}
                        className={inputClass}
                        placeholder={`e.g. Full-Stack Web Development, Consulting, or Product SKU ${index + 1}`}
                      />
                    </div>

                    {/* Numeric Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-6 items-end">
                      {/* Qty */}
                      <div>
                        <label
                          htmlFor={`item-qty-${item.id}`}
                          className="mb-1 block text-[10px] font-semibold uppercase text-slate-400"
                        >
                          Qty
                        </label>
                        <input
                          id={`item-qty-${item.id}`}
                          type="number"
                          min="0"
                          step="any"
                          value={item.qty}
                          onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                          className={`${inputClass} text-center`}
                        />
                      </div>

                      {/* Unit */}
                      <div>
                        <label
                          htmlFor={`item-unit-${item.id}`}
                          className="mb-1 block text-[10px] font-semibold uppercase text-slate-400"
                        >
                          Unit
                        </label>
                        <input
                          id={`item-unit-${item.id}`}
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          className={inputClass}
                          placeholder="hrs/pcs"
                        />
                      </div>

                      {/* Rate */}
                      <div>
                        <label
                          htmlFor={`item-rate-${item.id}`}
                          className="mb-1 block text-[10px] font-semibold uppercase text-slate-400"
                        >
                          Unit Price ({currencySymbol})
                        </label>
                        <input
                          id={`item-rate-${item.id}`}
                          type="number"
                          min="0"
                          step="any"
                          value={item.rate === 0 ? '' : item.rate}
                          onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          className={`${inputClass} text-right`}
                          placeholder="0.00"
                        />
                      </div>

                      {/* Line Discount */}
                      <div>
                        <label
                          htmlFor={`item-disc-${item.id}`}
                          className="mb-1 block text-[10px] font-semibold uppercase text-slate-400"
                        >
                          Line Disc. ({currencySymbol})
                        </label>
                        <input
                          id={`item-disc-${item.id}`}
                          type="number"
                          min="0"
                          step="any"
                          value={item.discount === 0 ? '' : item.discount}
                          onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                          className={`${inputClass} text-right`}
                          placeholder="0.00"
                        />
                      </div>

                      {/* Line Amount Display */}
                      <div>
                        <span className="mb-1 block text-[10px] font-semibold uppercase text-slate-400">
                          Total
                        </span>
                        <div className="flex h-[38px] items-center justify-end rounded-xl border border-slate-800 bg-slate-950 px-2.5 text-right font-mono text-xs font-bold text-slate-200">
                          {currencySymbol} {formatMoney(item.lineTotal, decimals)}
                        </div>
                      </div>

                      {/* Actions: Taxable checkbox + Delete */}
                      <div className="flex items-center justify-between gap-1.5 h-[38px] px-1">
                        <label
                          htmlFor={`item-taxable-${item.id}`}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 cursor-pointer select-none"
                          title="Is this line item subject to tax?"
                        >
                          <input
                            id={`item-taxable-${item.id}`}
                            type="checkbox"
                            checked={item.taxable}
                            onChange={(e) => handleItemChange(index, 'taxable', e.target.checked)}
                            className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500/20"
                          />
                          <span>Tax</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-20"
                          aria-label={`Remove item ${index + 1}`}
                          title="Delete line item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Add Item Action Bar */}
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-800/80 pt-3">
                <p className="text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">{items.length}</span>{' '}
                  {items.length === 1 ? 'line item' : 'line items'}
                  <span className="hidden sm:inline text-slate-500">
                    {' '}• Press{' '}
                    <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                      Ctrl+Enter
                    </kbd>{' '}
                    to quickly add next
                  </span>
                </p>
                <button
                  type="button"
                  onClick={addItem}
                  aria-label="Add invoice line item"
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-950/40 px-4 text-xs font-bold text-blue-400 shadow-sm transition hover:border-blue-500/60 hover:bg-blue-900/50 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            {/* 4. DISCOUNTS, TAXES, SHIPPING & FEES */}
            <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Discounts & Taxes */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 space-y-4">
                {/* Global Discount */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label className={labelClass}>Invoice Discount</label>
                    <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setDiscountType('percent')}
                        className={`rounded px-2 py-0.5 font-semibold transition ${
                          discountType === 'percent'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        % Percent
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType('fixed')}
                        className={`rounded px-2 py-0.5 font-semibold transition ${
                          discountType === 'fixed'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Fixed ({currencySymbol})
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="global-discount-input"
                      type="number"
                      min="0"
                      step="any"
                      value={discountInput}
                      onChange={(e) => {
                        setDiscountInput(e.target.value);
                        setDiscountValue(Math.max(0, Number(e.target.value) || 0));
                      }}
                      className={`${inputClass} text-right font-mono`}
                      placeholder="0.00"
                    />
                    <span className="text-xs font-semibold text-slate-400 shrink-0">
                      {discountType === 'percent' ? '%' : currencyCode}
                    </span>
                    <span className="ml-auto font-mono text-xs font-semibold text-emerald-400 shrink-0">
                      -{currencySymbol} {formatMoney(discountAmount, decimals)}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Discounts reduce the taxable base before taxes are applied.
                  </p>
                </div>

                {/* Taxes Section */}
                <div className="border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div>
                      <label className={labelClass}>Taxes (Calculated after discount)</label>
                      <p className="text-[10px] text-slate-400">
                        Taxable Base: {currencySymbol} {formatMoney(taxableBase, decimals)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addTax}
                      className="text-[11px] font-bold text-blue-400 hover:text-blue-300"
                    >
                      + Add Tax
                    </button>
                  </div>

                  {taxes.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-3 text-center">
                      <p className="text-xs text-slate-400">No taxes applied (0% tax-free / zero-rated).</p>
                      <button
                        type="button"
                        onClick={addTax}
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Tax (VAT, GST, Sales Tax)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {taxes.map((t) => (
                        <div
                          key={t.id}
                          className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-2"
                        >
                          <input
                            aria-label="Tax Name"
                            value={t.name}
                            onChange={(e) => updateTax(t.id, { name: e.target.value })}
                            className="h-8 flex-1 min-w-[120px] rounded-lg border border-slate-700 bg-slate-950 px-2.5 text-xs text-white outline-none"
                            placeholder="Tax name e.g. VAT"
                          />

                          <div className="flex items-center gap-1">
                            <input
                              aria-label={`${t.name} rate percentage`}
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              value={t.rate}
                              onChange={(e) =>
                                updateTax(t.id, {
                                  rate: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                                })
                              }
                              className="h-8 w-16 rounded-lg border border-slate-700 bg-slate-950 px-2 text-right font-mono text-xs text-white outline-none"
                            />
                            <span className="text-xs text-slate-400">%</span>
                          </div>

                          <span className="font-mono text-xs font-semibold text-slate-300 ml-auto">
                            +{currencySymbol}{' '}
                            {formatMoney(
                              roundMoney(taxableBase * (t.rate / 100), decimals),
                              decimals,
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeTax(t.id)}
                            className="p-1 text-slate-500 hover:text-red-400 transition"
                            aria-label={`Remove tax ${t.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping, Fees & Payment Record */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 space-y-4">
                {/* Shipping */}
                <div>
                  <label className={labelClass} htmlFor="shipping-charge-input">
                    Shipping / Delivery Charge
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="shipping-charge-input"
                      type="number"
                      min="0"
                      step="any"
                      value={shippingInput}
                      onChange={(e) => {
                        setShippingInput(e.target.value);
                        setShipping(Math.max(0, Number(e.target.value) || 0));
                      }}
                      className={`${inputClass} text-right font-mono`}
                      placeholder="0.00"
                    />
                    <span className="font-mono text-xs font-semibold text-slate-300 shrink-0">
                      +{currencySymbol} {formatMoney(shippingAmount, decimals)}
                    </span>
                  </div>
                </div>

                {/* Additional Fee */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      aria-label="Additional fee label"
                      value={additionalFeeLabel}
                      onChange={(e) => setAdditionalFeeLabel(e.target.value)}
                      className="rounded border border-slate-700 bg-slate-950 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-300"
                      placeholder="Fee Label"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="additional-fee-input"
                      type="number"
                      min="0"
                      step="any"
                      value={additionalFeeInput}
                      onChange={(e) => {
                        setAdditionalFeeInput(e.target.value);
                        setAdditionalFee(Math.max(0, Number(e.target.value) || 0));
                      }}
                      className={`${inputClass} text-right font-mono`}
                      placeholder="0.00"
                    />
                    <span className="font-mono text-xs font-semibold text-slate-300 shrink-0">
                      +{currencySymbol} {formatMoney(feeAmount, decimals)}
                    </span>
                  </div>
                </div>

                {/* Amount Paid */}
                <div className="border-t border-slate-800 pt-3">
                  <label className={labelClass} htmlFor="amount-paid-input">
                    Amount Already Paid
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="amount-paid-input"
                      type="number"
                      min="0"
                      step="any"
                      value={amountPaidInput}
                      onChange={(e) => {
                        setAmountPaidInput(e.target.value);
                        setAmountPaid(Math.max(0, Number(e.target.value) || 0));
                      }}
                      className={`${inputClass} text-right font-mono`}
                      placeholder="0.00"
                    />
                    <span className="font-mono text-xs font-semibold text-blue-400 shrink-0">
                      -{currencySymbol} {formatMoney(paidAmount, decimals)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Balance Remaining:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {currencySymbol} {formatMoney(balanceDue, decimals)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. PAYMENT INSTRUCTIONS & TERMS */}
            <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-400" />
                  <label className={labelClass} htmlFor="payment-instructions-text">
                    Payment Instructions / Bank Details
                  </label>
                </div>
                <textarea
                  id="payment-instructions-text"
                  value={sender.bank}
                  onChange={(e) => setSender((prev) => ({ ...prev, bank: e.target.value }))}
                  className={`${inputClass} min-h-[90px] resize-y`}
                  placeholder="Bank Name: Example Bank&#10;Account Name: Your Company&#10;Account / IBAN: GB29EXMP12345678901234&#10;SWIFT/BIC: EXMPGB2L&#10;Payment Link: https://..."
                />
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <label className={labelClass} htmlFor="notes-terms-text">
                  Notes & Terms and Conditions
                </label>
                <textarea
                  id="notes-terms-text"
                  value={meta.notes}
                  onChange={(e) => setMeta((prev) => ({ ...prev, notes: e.target.value }))}
                  className={`${inputClass} min-h-[90px] resize-y`}
                  placeholder="Thank you for your business! Please remit payment within payment terms."
                />
              </div>
            </div>

            {/* 6. FINANCIAL RECONCILIATION SUMMARY */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2 mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Financial Breakdown
                </p>
                <span className="text-[10px] text-slate-400">
                  Deterministic Rounding · {decimals} Decimals
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal (Gross Line Items):</span>
                  <span className="font-mono text-slate-200">
                    {currencySymbol} {formatMoney(subtotal, decimals)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({discountType === 'percent' ? `${discountValue}%` : 'Fixed'}):</span>
                    <span className="font-mono">
                      -{currencySymbol} {formatMoney(discountAmount, decimals)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>Taxable Base:</span>
                  <span className="font-mono text-slate-200">
                    {currencySymbol} {formatMoney(taxableBase, decimals)}
                  </span>
                </div>

                {computedTaxes.map((t) => (
                  <div key={t.id} className="flex justify-between text-slate-400">
                    <span>
                      {t.name} ({t.rate}%):
                    </span>
                    <span className="font-mono text-slate-200">
                      +{currencySymbol} {formatMoney(t.amount, decimals)}
                    </span>
                  </div>
                ))}

                {shippingAmount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping / Delivery:</span>
                    <span className="font-mono text-slate-200">
                      +{currencySymbol} {formatMoney(shippingAmount, decimals)}
                    </span>
                  </div>
                )}

                {feeAmount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>{additionalFeeLabel || 'Additional Fee'}:</span>
                    <span className="font-mono text-slate-200">
                      +{currencySymbol} {formatMoney(feeAmount, decimals)}
                    </span>
                  </div>
                )}

                <div className="border-t border-slate-800 pt-2 mt-2 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">Grand Total:</span>
                  <span className="text-xl font-black text-blue-400 font-mono">
                    {currencySymbol} {formatMoney(grandTotal, decimals)}
                  </span>
                </div>

                {paidAmount > 0 && (
                  <div className="flex justify-between text-blue-300 pt-1">
                    <span>Amount Paid:</span>
                    <span className="font-mono">
                      -{currencySymbol} {formatMoney(paidAmount, decimals)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-t border-slate-800/80 pt-1.5 font-bold">
                  <span className="text-amber-300">Balance Due:</span>
                  <span className="text-base text-amber-400 font-mono">
                    {currencySymbol} {formatMoney(balanceDue, decimals)}
                  </span>
                </div>
              </div>
            </div>

            {/* Regulatory Disclaimer Notice */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-[11px] leading-relaxed text-slate-400">
              <p className="font-semibold text-slate-300 mb-1">
                Standard Business Invoicing Notice:
              </p>
              <p>
                This tool generates general-purpose commercial business invoices. Tax regulations,
                statutory formatting, and e-invoicing compliance requirements (such as FBR, IRS,
                VAT authorities, GST, or PEPPOL) vary across jurisdictions. Verify local statutory
                requirements before using invoices for official tax filing.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* LIVE A4 PREVIEW & EXPORT ACTIONS                                  */}
        {/* ================================================================= */}

        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/55 flex flex-col">
          {/* Preview Header & Toolbar */}
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-3">
            {/* Title & Metadata */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Live A4 Preview</p>
                <p className="text-[11px] text-slate-400">
                  {previewPages.length === 1 ? 'Page 1 of 1' : `${previewPages.length} Pages`} · Height-Aware Multi-Page A4
                </p>
              </div>
            </div>

            {/* Document Viewer Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-950/70 p-1 text-xs text-slate-200">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="rounded px-2.5 py-1 font-bold text-slate-300 transition hover:bg-slate-800 active:scale-95"
                  aria-label="Zoom out"
                  title="Zoom out"
                >
                  −
                </button>

                <button
                  type="button"
                  onClick={handleZoomFit}
                  className={`rounded px-2.5 py-1 text-[11px] font-bold transition ${
                    zoomMode === 'fit'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                  aria-label="Fit invoice to preview"
                  title="Fit document to window"
                >
                  Fit ({Math.round(effectiveScale * 100)}%)
                </button>

                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="rounded px-2.5 py-1 font-bold text-slate-300 transition hover:bg-slate-800 active:scale-95"
                  aria-label="Zoom in"
                  title="Zoom in"
                >
                  +
                </button>
              </div>

              {/* Download PDF button */}
              <button
                type="button"
                onClick={generatePDF}
                disabled={isGenerating}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60"
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                <span>{isGenerating ? 'Rendering…' : 'Download PDF'}</span>
              </button>
            </div>
          </div>

          {/* Viewport with Zoom & Document Canvas */}
          <div
            ref={previewViewportRef}
            className="flex h-[calc(100vh-210px)] min-h-[640px] max-h-[960px] flex-1 items-start justify-center overflow-auto bg-[#070b14] p-3 sm:p-5"
          >
            <div className="flex w-full min-w-0 flex-col items-center gap-8 py-2">
              {previewPages.map((pageData) => (
                <div
                  key={pageData.pageNumber}
                  className="flex w-full min-w-0 flex-col items-center"
                >
                  {/* Page Indicator */}
                  <div
                    className="mb-2 flex items-center justify-between px-2 text-[9px] font-bold uppercase tracking-wider text-slate-400"
                    style={{ width: `${Math.round(794 * effectiveScale)}px` }}
                  >
                    <span>
                      Page {pageData.pageNumber} of {pageData.totalPages}
                    </span>
                    <span>
                      {pageData.items.length > 0
                        ? `Items ${pageData.startItemIndex + 1}–${
                            pageData.startItemIndex + pageData.items.length
                          }`
                        : 'Summary & Terms'}
                    </span>
                  </div>

                  {/* A4 Page Shell */}
                  <div
                    className="invoice-page-shell relative shrink-0 shadow-2xl ring-1 ring-slate-900/10 rounded-sm bg-white"
                    style={{
                      width: `${Math.round(794 * effectiveScale)}px`,
                      height: `${Math.round(1123 * effectiveScale)}px`,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      className="invoice-document absolute left-0 top-0 origin-top-left bg-white text-slate-900"
                      style={{
                        width: '794px',
                        height: '1123px',
                        transform: `scale(${effectiveScale})`,
                        transformOrigin: 'top left',
                        fontFamily:
                          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      }}
                    >
                      <div
                        className="flex h-[1123px] flex-col justify-between"
                        style={{ padding: '24px 32px 20px 32px' }}
                      >
                        {/* PAGE CONTENT */}
                        <div className="min-w-0">
                          {/* ============================================= */}
                          {/* PAGE 1: FULL HEADER & PARTIES                 */}
                          {/* ============================================= */}
                          {pageData.isFirstPage ? (
                            <>
                              {/* Header */}
                              <header className="invoice-row border-b border-slate-900 pb-2 mb-2">
                                <div className="flex items-start justify-between gap-6">
                                  <div className="min-w-0 flex-1">
                                    {logo && (
                                      <img
                                        src={logo}
                                        alt="Company logo"
                                        className="mb-2 max-h-10 max-w-[160px] object-contain object-left"
                                      />
                                    )}
                                    <div className="flex items-center gap-2.5">
                                      <div className="text-[20px] font-black tracking-tight text-slate-950 uppercase leading-none">
                                        INVOICE
                                      </div>
                                      <span className="rounded border border-slate-300 bg-slate-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-700">
                                        {meta.status}
                                      </span>
                                    </div>
                                    <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[9px]">
                                      <div className="flex items-baseline gap-1">
                                        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                                          Invoice No:
                                        </span>
                                        <span className="text-[12px] font-black tracking-tight text-slate-900">
                                          {meta.invNum || 'INV-0001'}
                                        </span>
                                      </div>
                                      {meta.poNumber && (
                                        <div className="flex items-baseline gap-1 text-[9px] text-slate-600">
                                          <span className="font-bold uppercase tracking-wider text-slate-400">
                                            PO / Ref:
                                          </span>
                                          <span className="font-semibold text-slate-700">
                                            {meta.poNumber}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Seller Info */}
                                  <div className="w-[240px] shrink-0 text-right">
                                    <h2 className="text-[13px] font-black tracking-tight text-slate-950 leading-tight">
                                      {sender.name || (
                                        <span className="font-normal italic text-slate-400">
                                          Your business name
                                        </span>
                                      )}
                                    </h2>
                                    {sender.address && (
                                      <p className="mt-0.5 whitespace-pre-line text-[9px] leading-tight text-slate-600">
                                        {sender.address}
                                      </p>
                                    )}
                                    <div className="mt-1 space-y-0.5 text-[9px] text-slate-600 leading-tight">
                                      {sender.email && <p>{sender.email}</p>}
                                      {sender.phone && <p>{sender.phone}</p>}
                                      {sender.taxId && (
                                        <p className="font-semibold text-slate-700">
                                          Tax ID: {sender.taxId}
                                        </p>
                                      )}
                                      {sender.regNumber && (
                                        <p className="text-[8px] text-slate-500">
                                          Reg: {sender.regNumber}
                                        </p>
                                      )}
                                      {sender.website && (
                                        <p className="text-[8px] text-slate-500">
                                          {sender.website}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </header>

                              {/* Parties & Dates Grid */}
                              <section className="invoice-row grid grid-cols-[minmax(0,1fr)_240px] gap-4 pb-2 mb-2 border-b border-slate-200">
                                <div className="min-w-0">
                                  <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                                    BILLED TO
                                  </p>
                                  <h3 className="mt-0.5 text-[12px] font-bold tracking-tight text-slate-950">
                                    {client.name || (
                                      <span className="font-normal italic text-slate-400">
                                        Customer / company name
                                      </span>
                                    )}
                                  </h3>
                                  {client.address && (
                                    <p className="mt-0.5 whitespace-pre-line text-[9px] leading-tight text-slate-600">
                                      {client.address}
                                    </p>
                                  )}
                                  <div className="mt-0.5 space-y-0.5 text-[9px] text-slate-600 leading-tight">
                                    {client.email && <p>{client.email}</p>}
                                    {client.phone && <p>{client.phone}</p>}
                                    {client.taxId && (
                                      <p className="font-semibold text-slate-700">
                                        Tax ID: {client.taxId}
                                      </p>
                                    )}
                                  </div>
                                  {client.shippingAddress && (
                                    <div className="mt-1.5 pt-1 border-t border-slate-100">
                                      <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">
                                        SHIP TO:
                                      </span>
                                      <p className="mt-0.5 text-[9px] leading-tight text-slate-600 whitespace-pre-line">
                                        {client.shippingAddress}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Meta Dates Box */}
                                <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-[9px] space-y-1 self-start shadow-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                                      Issue Date:
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                      {formatDisplayDate(meta.date)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                                      Due Date:
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                      {formatDisplayDate(meta.dueDate)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                                      Terms:
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                      {meta.paymentTerms || 'Due on Receipt'}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between border-t border-slate-200/80 pt-1 mt-0.5">
                                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                                      Currency:
                                    </span>
                                    <span className="font-bold text-slate-900">
                                      {currencyCode} ({currencySymbol})
                                    </span>
                                  </div>
                                </div>
                              </section>
                            </>
                          ) : (
                            /* ============================================= */
                            /* PAGE 2+: COMPACT REPEATING HEADER             */
                            /* ============================================= */
                            <header className="invoice-row border-b border-slate-900 pb-1.5 mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className="text-[12px] font-black uppercase text-slate-950 tracking-tight">
                                  INVOICE
                                </span>
                                <span className="text-[10px] font-bold text-slate-700">
                                  #{meta.invNum || 'INV-0001'}
                                </span>
                                <span className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-700">
                                  {meta.status}
                                </span>
                                {sender.name && (
                                  <span className="text-[9px] font-medium text-slate-500">
                                    · {sender.name}
                                  </span>
                                )}
                              </div>
                              <div className="text-[9px] font-bold text-slate-500">
                                Page {pageData.pageNumber} of {pageData.totalPages}
                              </div>
                            </header>
                          )}

                          {/* ============================================= */}
                          {/* LINE ITEMS TABLE                              */}
                          {/* ============================================= */}
                          {pageData.items.length > 0 && (
                            <section className="invoice-items mt-0.5">
                              <table className="w-full table-fixed border-collapse">
                                <thead className="invoice-table-head">
                                  <tr className="border-b border-slate-900 text-[8px] font-black uppercase tracking-[0.14em] text-slate-700 bg-slate-100/70">
                                    <th className="w-[44%] text-left" style={{ padding: '4px 8px' }}>
                                      Product / Service
                                    </th>
                                    <th className="w-[9%] text-center" style={{ padding: '4px 4px' }}>
                                      Qty
                                    </th>
                                    <th className="w-[10%] text-center" style={{ padding: '4px 4px' }}>
                                      Unit
                                    </th>
                                    <th className="w-[13%] text-right" style={{ padding: '4px 6px' }}>
                                      Rate
                                    </th>
                                    <th className="w-[9%] text-center" style={{ padding: '4px 4px' }}>
                                      Tax
                                    </th>
                                    <th className="w-[15%] text-right" style={{ padding: '4px 8px' }}>
                                      Amount
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pageData.items.map((item) => {
                                    const qty = Math.max(0, Number(item.qty) || 0);
                                    const rate = Math.max(0, Number(item.rate) || 0);
                                    const lineGross = qty * rate;
                                    const lineDisc = Math.max(
                                      0,
                                      Math.min(lineGross, Number(item.discount) || 0),
                                    );
                                    const lineTotal = roundMoney(lineGross - lineDisc, decimals);
                                    const isItemBlank = !item.desc && rate === 0;

                                    return (
                                      <tr
                                        key={item.id}
                                        className="invoice-row border-b border-slate-200/60"
                                      >
                                        <td
                                          className="text-[9px] font-semibold text-slate-900 leading-snug break-words"
                                          style={{ padding: '4px 8px' }}
                                        >
                                          {item.desc ? (
                                            <div>{item.desc}</div>
                                          ) : (
                                            <div className="font-normal italic text-slate-400">
                                              Add a product or service
                                            </div>
                                          )}
                                          {item.discount > 0 && (
                                            <div className="mt-0.5 text-[8px] font-medium text-emerald-700">
                                              Discount: -{currencySymbol}{' '}
                                              {formatMoney(item.discount, decimals)}
                                            </div>
                                          )}
                                        </td>
                                        <td
                                          className="text-center text-[9px] font-medium text-slate-700"
                                          style={{ padding: '4px 4px' }}
                                        >
                                          {qty}
                                        </td>
                                        <td
                                          className="text-center text-[9px] text-slate-500"
                                          style={{ padding: '4px 4px' }}
                                        >
                                          {item.unit || 'units'}
                                        </td>
                                        <td
                                          className="text-right font-mono text-[9px] text-slate-700"
                                          style={{ padding: '4px 6px' }}
                                        >
                                          {isItemBlank
                                            ? '—'
                                            : `${currencySymbol} ${formatMoney(rate, decimals)}`}
                                        </td>
                                        <td
                                          className="text-center text-[8px] font-medium text-slate-600"
                                          style={{ padding: '4px 4px' }}
                                        >
                                          {(() => {
                                            if (isFreshEmpty || taxes.length === 0) return '—';
                                            if (!item.taxable)
                                              return <span className="text-slate-400">Exempt</span>;
                                            const activeTaxes = taxes.filter(
                                              (t) => t.enabled && t.rate > 0,
                                            );
                                            if (!activeTaxes.length) return '—';
                                            return activeTaxes.map((t) => `${t.rate}%`).join(', ');
                                          })()}
                                        </td>
                                        <td
                                          className="text-right font-mono text-[9px] font-bold text-slate-950"
                                          style={{ padding: '4px 8px' }}
                                        >
                                          {isItemBlank
                                            ? '—'
                                            : `${currencySymbol} ${formatMoney(lineTotal, decimals)}`}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </section>
                          )}

                          {/* ============================================= */}
                          {/* SUMMARY & FINANCIAL TOTALS                    */}
                          {/* ============================================= */}
                          {pageData.hasSummary && (
                            <section className="invoice-summary mt-2.5 grid grid-cols-[minmax(0,1fr)_260px] gap-4 pt-1.5 border-t border-slate-200">
                              {/* Left: Payment details & Notes */}
                              <div className="min-w-0 pr-2">
                                <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                                  Payment Instructions
                                </p>
                                <p className="mt-0.5 whitespace-pre-line text-[9px] leading-snug text-slate-600 break-words">
                                  {sender.bank || 'Please remit payment as per agreed terms.'}
                                </p>

                                {meta.notes && (
                                  <div className="mt-2">
                                    <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                                      Notes & Terms
                                    </p>
                                    <p className="mt-0.5 whitespace-pre-line text-[9px] leading-snug text-slate-500 break-words">
                                      {meta.notes}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Right: Totals Card */}
                              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2 text-[9px] space-y-0.5 self-start shadow-xs">
                                <div className="flex justify-between text-slate-600 py-0.5">
                                  <span className="font-medium text-[9px]">Subtotal</span>
                                  <span className="font-mono font-semibold text-slate-900">
                                    {isFreshEmpty
                                      ? '—'
                                      : `${currencySymbol} ${formatMoney(subtotal, decimals)}`}
                                  </span>
                                </div>

                                {discountAmount > 0 && (
                                  <div className="flex justify-between text-emerald-700 py-0.5 font-medium">
                                    <span className="text-[8px]">
                                      Discount ({discountType === 'percent' ? `${discountValue}%` : 'Fixed'})
                                    </span>
                                    <span className="font-mono">
                                      -{currencySymbol} {formatMoney(discountAmount, decimals)}
                                    </span>
                                  </div>
                                )}

                                {(discountAmount > 0 || computedTaxes.length > 0) && !isFreshEmpty && (
                                  <div className="flex justify-between text-slate-500 py-0.5 text-[8px]">
                                    <span>Taxable Base</span>
                                    <span className="font-mono text-slate-700">
                                      {currencySymbol} {formatMoney(taxableBase, decimals)}
                                    </span>
                                  </div>
                                )}

                                {computedTaxes.map((t) => (
                                  <div key={t.id} className="flex justify-between text-slate-600 py-0.5 text-[9px]">
                                    <span>
                                      {t.name} ({t.rate}%)
                                    </span>
                                    <span className="font-mono font-medium text-slate-900">
                                      +{currencySymbol} {formatMoney(t.amount, decimals)}
                                    </span>
                                  </div>
                                ))}

                                {shippingAmount > 0 && (
                                  <div className="flex justify-between text-slate-600 py-0.5 text-[9px]">
                                    <span>Shipping</span>
                                    <span className="font-mono font-medium text-slate-900">
                                      +{currencySymbol} {formatMoney(shippingAmount, decimals)}
                                    </span>
                                  </div>
                                )}

                                {feeAmount > 0 && (
                                  <div className="flex justify-between text-slate-600 py-0.5 text-[9px]">
                                    <span>{additionalFeeLabel || 'Fee'}</span>
                                    <span className="font-mono font-medium text-slate-900">
                                      +{currencySymbol} {formatMoney(feeAmount, decimals)}
                                    </span>
                                  </div>
                                )}

                                <div className="border-t border-slate-900 pt-1 mt-0.5">
                                  <div className="flex items-baseline justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-950">
                                      Total Due:
                                    </span>
                                    <span className="font-mono text-[13px] font-black text-slate-950">
                                      {isFreshEmpty
                                        ? '—'
                                        : `${currencySymbol} ${formatMoney(grandTotal, decimals)}`}
                                    </span>
                                  </div>
                                </div>

                                {paidAmount > 0 && (
                                  <div className="flex justify-between text-blue-700 pt-0.5 font-medium text-[8px]">
                                    <span>Amount Paid:</span>
                                    <span className="font-mono">
                                      -{currencySymbol} {formatMoney(paidAmount, decimals)}
                                    </span>
                                  </div>
                                )}

                                {paidAmount > 0 && (
                                  <div className="flex justify-between border-t border-slate-200 pt-0.5 font-bold text-amber-800 text-[9px]">
                                    <span className="uppercase text-[8px] tracking-wider">
                                      Balance Due:
                                    </span>
                                    <span className="font-mono text-[11px]">
                                      {isFreshEmpty
                                        ? '—'
                                        : `${currencySymbol} ${formatMoney(balanceDue, decimals)}`}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </section>
                          )}
                        </div>

                        {/* ============================================= */}
                        {/* FOOTER                                        */}
                        {/* ============================================= */}
                        <footer className="invoice-footer mt-auto border-t border-slate-200 pt-1.5">
                          <div className="flex items-center justify-between text-[8px] text-slate-400 font-medium">
                            <p>
                              {sender.website ||
                                sender.email ||
                                'Thank you for your business'}
                            </p>
                            <p className="text-center text-[7px] text-slate-400/90">
                              General-purpose business invoice. Tax & statutory requirements vary by jurisdiction.
                            </p>
                            <p className="text-right">
                              Page {pageData.pageNumber} of {pageData.totalPages} · {meta.invNum || 'INV-0001'}
                            </p>
                          </div>
                        </footer>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ================================================================== */}
      {/* MODAL: RESET CONFIRMATION                                          */}
      {/* ================================================================== */}
      {showResetModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <RotateCcw className="h-5 w-5" />
              </div>
              <h2 id="reset-modal-title" className="text-base font-bold text-white">
                Start New Invoice?
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 mb-5">
              This will reset all invoice fields, client data, and line items back to clean
              defaults. Any unsaved edits will be cleared.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-500"
              >
                Yes, Start New Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL: JSON IMPORT CONFIRMATION                                    */}
      {/* ================================================================== */}
      {pendingImportData && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <FileCode className="h-5 w-5" />
              </div>
              <h2 id="import-modal-title" className="text-base font-bold text-white">
                Confirm Invoice Import
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 mb-4">
              Importing this JSON file will replace your current editor fields with the imported invoice data.
            </p>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300 mb-5 space-y-1">
              <p>
                <strong>Invoice:</strong>{' '}
                {String(
                  (pendingImportData.invoice as Record<string, unknown>)?.meta
                    ? ((pendingImportData.invoice as Record<string, unknown>).meta as Record<string, unknown>).invNum
                    : 'Invoice Data',
                )}
              </p>
              <p>
                <strong>Generator:</strong>{' '}
                {String(pendingImportData.generator || 'Standard JSON format')}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingImportData(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmJSONImport}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500"
              >
                Import & Replace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* GLOBAL PRINT & PDF STYLES                                          */}
      {/* ================================================================== */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out forwards;
        }

        .invoice-page-shell {
          position: relative;
          flex: 0 0 auto;
          overflow: visible;
          background: #ffffff;
        }

        .invoice-document {
          box-sizing: border-box;
          overflow: hidden;
          flex: 0 0 auto;
          font-size: 9px;
          line-height: 1.3;
        }

        .invoice-document * {
          box-sizing: border-box;
        }

        .invoice-table-head th {
          font-size: 8px !important;
          line-height: 1.15 !important;
        }

        .invoice-row td {
          font-size: 9px !important;
          line-height: 1.25 !important;
        }

        .invoice-row,
        .invoice-summary,
        .invoice-footer {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .invoice-items {
          break-inside: auto;
          page-break-inside: auto;
          width: 100%;
        }

        .invoice-items thead {
          display: table-header-group;
        }

        .invoice-items table {
          table-layout: fixed;
          width: 100%;
        }

        .invoice-items tbody tr {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        select option {
          background: #0f172a;
          color: #ffffff;
        }

        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          body * {
            visibility: hidden;
          }
          .invoice-document,
          .invoice-document * {
            visibility: visible !important;
          }
          .invoice-document {
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            transform: none !important;
            width: 100% !important;
            min-height: 100vh !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          .invoice-document:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }
      `}</style>
    </div>
  );
}