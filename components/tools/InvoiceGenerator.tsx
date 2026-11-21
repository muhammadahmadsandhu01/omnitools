'use client';

/* eslint-disable @next/next/no-img-element */

import { useMemo, useRef, useState, useSyncExternalStore, useEffect, useCallback } from 'react';
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
  Sparkles,
  Eye,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Engine & Helper Imports                                                    */
/* -------------------------------------------------------------------------- */

import {
  type LineItem,
  type TaxEntry,
  type Sender,
  type Client,
  type InvoiceStatus,
  type InvoiceMeta,
  type CurrencyOption,
  type PageData,
  type PaginationOptions,
  type InvoiceTotals,
  roundMoney,
  formatMoney,
  getCurrencyOptions,
  calculateInvoiceTotals,
  computeInvoicePages,
  formatDisplayDate,
  computeDueDate,
  validateInvoiceDraft,
  escapeCsvCell,
} from '@/lib/invoiceEngine';

export type {
  LineItem,
  TaxEntry,
  Sender,
  Client,
  InvoiceStatus,
  InvoiceMeta,
  CurrencyOption,
  PageData,
  PaginationOptions,
  InvoiceTotals,
};

const STORAGE_KEY = 'omni_invoice_draft_v4';

const emptySubscribe = () => () => { };
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

function checkStoredDraftSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
}

function subscribeToStorage(callback: () => void) {
  if (typeof window === 'undefined') return () => { };
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

/* -------------------------------------------------------------------------- */
/* UI Design Tokens (KivaroTools Light & Dark Theme Native)                   */
/* -------------------------------------------------------------------------- */

const inputClass =
  'w-full min-w-0 rounded-xl border border-slate-200 dark:border-slate-700/90 bg-white dark:bg-slate-950/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

const labelClass =
  'mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600 dark:text-slate-400';

const cardClass =
  'rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 shadow-2xs';

const secondaryBtnClass =
  'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-950 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

type ToastNotice = {
  type: 'success' | 'error';
  text: string;
};

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function InvoiceGenerator() {
  const isClient = useIsClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<ToastNotice | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const previewSectionRef = useRef<HTMLElement>(null);

  const [zoomMode, setZoomMode] = useState<'fit' | 'manual'>('fit');
  const [manualZoom, setManualZoom] = useState<number>(0.75);
  const [fitScale, setFitScale] = useState<number>(0.65);

  const effectiveScale = zoomMode === 'fit' ? fitScale : manualZoom;
  const [logo, setLogo] = useState('');
  const [currencyCode, setCurrencyCode] = useState('USD');

  /* Progressive Disclosure Panels */
  const [showSenderExtra, setShowSenderExtra] = useState(false);
  const [showClientExtra, setShowClientExtra] = useState(false);
  const [showTermsField, setShowTermsField] = useState(false);

  /* Modals */
  const [showResetModal, setShowResetModal] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<Record<string, unknown> | null>(null);
  const [draftBannerDismissed, setDraftBannerDismissed] = useState(false);

  const showNotice = useCallback((type: 'success' | 'error', text: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, text });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, type === 'error' ? 5000 : 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!showResetModal && !pendingImportData) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowResetModal(false);
        setPendingImportData(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showResetModal, pendingImportData]);

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
  /* Date & Payment Terms Synchronization                                     */
  /* ------------------------------------------------------------------------ */

  const handleIssueDateChange = (newDate: string) => {
    setMeta((prev) => {
      const autoDue = prev.paymentTerms !== 'Custom' ? computeDueDate(newDate, prev.paymentTerms) : null;
      return {
        ...prev,
        date: newDate,
        dueDate: autoDue ?? prev.dueDate,
      };
    });
  };

  const handlePaymentTermsChange = (newTerms: string) => {
    setMeta((prev) => {
      const autoDue = newTerms !== 'Custom' ? computeDueDate(prev.date, newTerms) : null;
      return {
        ...prev,
        paymentTerms: newTerms,
        dueDate: autoDue ?? prev.dueDate,
      };
    });
  };

  const handleDueDateChange = (newDueDate: string) => {
    setMeta((prev) => {
      const expectedForTerm =
        prev.paymentTerms !== 'Custom' ? computeDueDate(prev.date, prev.paymentTerms) : null;
      const nextTerms =
        expectedForTerm && expectedForTerm !== newDueDate ? 'Custom' : prev.paymentTerms;
      return {
        ...prev,
        dueDate: newDueDate,
        paymentTerms: nextTerms,
      };
    });
  };

  /* ------------------------------------------------------------------------ */
  /* Discount Input Clamping (Percent 0..100, Fixed >= 0)                     */
  /* ------------------------------------------------------------------------ */

  const handleDiscountTypeChange = (nextType: 'percent' | 'fixed') => {
    setDiscountType(nextType);
    if (nextType === 'percent' && discountValue > 100) {
      setDiscountValue(100);
      setDiscountInput('100');
    }
  };

  const handleDiscountInputChange = (raw: string) => {
    if (raw === '') {
      setDiscountInput('');
      setDiscountValue(0);
      return;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setDiscountInput('0');
      setDiscountValue(0);
      return;
    }
    if (discountType === 'percent' && parsed > 100) {
      setDiscountInput('100');
      setDiscountValue(100);
      return;
    }
    setDiscountInput(raw);
    setDiscountValue(parsed);
  };

  /* ------------------------------------------------------------------------ */
  /* Calculations (Pure Deterministic Calculation Layer)                       */
  /* ------------------------------------------------------------------------ */

  const totals = useMemo<InvoiceTotals>(() => {
    return calculateInvoiceTotals({
      items,
      taxes,
      discountType,
      discountValue,
      shipping,
      additionalFee,
      amountPaid,
      decimals,
    });
  }, [items, taxes, discountType, discountValue, shipping, additionalFee, amountPaid, decimals]);

  const {
    computedItems,
    subtotal,
    isFreshEmpty,
    discountAmount,
    taxableBase,
    computedTaxes,
    shippingAmount,
    feeAmount,
    grandTotal,
    paidAmount,
    balanceDue,
  } = totals;

  const combinedNotesLength = (meta.notes?.length || 0) + (meta.terms?.length || 0);

  /* Multi-page preview calculation */
  const previewPages = useMemo(
    () =>
      computeInvoicePages(items, {
        hasLogo: Boolean(logo),
        hasNotes: Boolean(meta.notes || meta.terms),
        notesLength: combinedNotesLength,
        hasBank: Boolean(sender.bank),
        bankLength: sender.bank?.length || 0,
        taxCount: computedTaxes.length,
        hasDiscount: discountAmount > 0,
        hasTaxableBase: (discountAmount > 0 || computedTaxes.length > 0) && !isFreshEmpty,
        hasShipping: shippingAmount > 0,
        hasFee: feeAmount > 0,
        hasPaid: paidAmount > 0,
        hasClientShipping: Boolean(client.shippingAddress),
      }),
    [
      items,
      logo,
      meta.notes,
      meta.terms,
      combinedNotesLength,
      sender.bank,
      computedTaxes.length,
      discountAmount,
      isFreshEmpty,
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
    event.target.value = '';
    if (!file) return;

    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      showNotice('error', 'For security and reliable PDF rendering, upload PNG, JPG, or WebP logos.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showNotice('error', 'Please upload a valid image file (PNG, JPG, or WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showNotice('error', 'Image exceeds 2 MB. Please upload a smaller logo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      setLogo((evt.target?.result as string) || '');
      showNotice('success', 'Company logo added to invoice.');
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
      const fit = Math.min(1.0, scaleX);
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
  /* Sample Invoice Loader                                                    */
  /* ------------------------------------------------------------------------ */

  const handleLoadSample = () => {
    const issue = todayISO();
    const due = computeDueDate(issue, 'Net 15') || issue;

    setMeta({
      invNum: 'INV-2026-014',
      date: issue,
      dueDate: due,
      paymentTerms: 'Net 15',
      status: 'Partially Paid',
      poNumber: 'PO-4821',
      notes: 'Thank you for your partnership! Please include invoice number INV-2026-014 on your wire transfer.',
      terms: 'Payment is due within 15 calendar days of issue date. Balance reflects 50% upfront milestone deposit.',
    });
    setSender({
      name: 'Northstar Digital Studio',
      address: '420 Market Street, Suite 300\nSan Francisco, CA 94105',
      email: 'billing@northstardigital.example',
      phone: '+1 (415) 555-0142',
      website: 'https://northstardigital.example',
      taxId: 'US-94-3829104',
      regNumber: 'REG-2021-8841',
      bank: 'Bank Name: Mercury Business Bank\nAccount Name: Northstar Digital Studio LLC\nAccount / IBAN: US8900001234567890\nSWIFT/BIC: MRCYUS33',
    });
    setClient({
      name: 'Acme Cloud Ventures',
      address: '88 King Street West\nToronto, ON M5H 1A1, Canada',
      shippingAddress: '',
      email: 'ap@acmecloud.example',
      phone: '+1 (416) 555-0198',
      taxId: 'CA-829104412RT0001',
    });
    setItems([
      {
        id: `sample-1-${Date.now()}`,
        desc: 'UI/UX Design & Component System Architecture',
        qty: 20,
        unit: 'hrs',
        rate: 85,
        discount: 100,
        taxable: true,
      },
      {
        id: `sample-2-${Date.now()}`,
        desc: 'Third-Party Cloud Hosting Pass-Through (Tax-Exempt)',
        qty: 1,
        unit: 'lot',
        rate: 300,
        discount: 0,
        taxable: false,
      },
    ]);
    setTaxes([{ id: `tax-sample-${Date.now()}`, name: 'Sales Tax', rate: 10, enabled: true }]);
    setDiscountType('percent');
    setDiscountValue(5);
    setDiscountInput('5');
    setShipping(0);
    setShippingInput('0');
    setAdditionalFee(0);
    setAdditionalFeeInput('0');
    setAdditionalFeeLabel('Processing Fee');
    setAmountPaid(1000);
    setAmountPaidInput('1000');
    setCurrencyCode('USD');
    setShowSenderExtra(true);
    setShowClientExtra(true);
    setShowTermsField(true);
    showNotice('success', 'Sample invoice loaded. Edit any field or click Download PDF.');
  };

  /* ------------------------------------------------------------------------ */
  /* Persistence & Reset (Explicit User Controlled)                           */
  /* ------------------------------------------------------------------------ */

  const applySanitizedDraft = (draft: ReturnType<typeof validateInvoiceDraft>['sanitized']) => {
    if (!draft) return;
    setMeta(draft.meta);
    setSender(draft.sender);
    setClient(draft.client);
    setItems(draft.items);
    setTaxes(draft.taxes);
    setDiscountType(draft.discountType);
    setDiscountValue(draft.discountValue);
    setDiscountInput(String(draft.discountValue));
    setShipping(draft.shipping);
    setShippingInput(String(draft.shipping));
    setAdditionalFee(draft.additionalFee);
    setAdditionalFeeInput(String(draft.additionalFee));
    setAdditionalFeeLabel(draft.additionalFeeLabel);
    setAmountPaid(draft.amountPaid);
    setAmountPaidInput(String(draft.amountPaid));
    setCurrencyCode(draft.currencyCode);
    setLogo(draft.logo || '');

    if (draft.sender.phone || draft.sender.website || draft.sender.taxId || draft.sender.regNumber) {
      setShowSenderExtra(true);
    }
    if (draft.client.phone || draft.client.taxId || draft.client.shippingAddress) {
      setShowClientExtra(true);
    }
    if (draft.meta.terms) {
      setShowTermsField(true);
    }
  };

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
      showNotice('success', 'Draft saved to this browser.');
    } catch {
      showNotice(
        'error',
        'Could not save draft. Browser storage quota may be full (try removing the logo image).',
      );
    }
  };

  const handleRestoreDraft = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      const { sanitized } = validateInvoiceDraft(parsed);
      if (!sanitized) {
        showNotice('error', 'Saved draft format was invalid and could not be restored.');
        return;
      }
      applySanitizedDraft(sanitized);
      setDraftBannerDismissed(true);
      showNotice('success', 'Saved draft restored.');
    } catch {
      showNotice('error', 'Failed to restore draft from browser storage.');
    }
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setDraftBannerDismissed(true);
      showNotice('success', 'Saved draft removed from browser storage.');
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
    showNotice('success', 'Invoice reset to clean defaults.');
  };

  /* ------------------------------------------------------------------------ */
  /* CSV Export (RFC-4180 with Formula Injection Protection)                  */
  /* ------------------------------------------------------------------------ */

  const exportCSV = () => {
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

    const csvContent = rows.map((r) => r.map(escapeCsvCell).join(',')).join('\r\n');
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
    showNotice('success', `Exported Invoice_${cleanNum}.csv`);
  };

  /* ------------------------------------------------------------------------ */
  /* JSON Export & Import                                                     */
  /* ------------------------------------------------------------------------ */

  const exportJSON = () => {
    const exportData = {
      schemaVersion: 1,
      generator: 'KivaroTools Business Invoice Generator',
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
    showNotice('success', `Exported Invoice_${cleanNum}.json`);
  };

  const handleJSONFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
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
        showNotice('error', 'Invalid or corrupted JSON file. Please select a valid invoice JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  const confirmJSONImport = () => {
    if (!pendingImportData) return;
    try {
      const invRaw = (pendingImportData.invoice as Record<string, unknown>) || pendingImportData;
      const { sanitized } = validateInvoiceDraft(invRaw);
      if (sanitized) {
        applySanitizedDraft(sanitized);
      }
      setPendingImportData(null);
      showNotice('success', 'Invoice imported and validated.');
    } catch {
      showNotice('error', 'Failed to apply imported invoice data.');
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
    let staging: HTMLDivElement | null = null;

    try {
      staging = document.createElement('div');
      staging.id = 'omni-invoice-pdf-staging';
      staging.style.position = 'fixed';
      staging.style.left = '0';
      staging.style.top = '0';
      staging.style.width = '794px';
      staging.style.height = '1123px';
      staging.style.zIndex = '-9999';
      staging.style.pointerEvents = 'none';
      staging.style.background = '#ffffff';
      staging.style.overflow = 'hidden';
      document.body.appendChild(staging);

      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true,
      });

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const clone = page.cloneNode(true) as HTMLElement;

        clone.style.position = 'relative';
        clone.style.left = '0';
        clone.style.top = '0';
        clone.style.transform = 'none';
        clone.style.zoom = '1';
        clone.style.width = '794px';
        clone.style.height = '1123px';
        clone.style.minHeight = '1123px';
        clone.style.margin = '0';
        clone.style.boxShadow = 'none';

        staging.innerHTML = '';
        staging.appendChild(clone);

        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        const canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          onclone: (clonedDoc: Document) => {
            const cvs = clonedDoc.createElement('canvas');
            cvs.width = 1;
            cvs.height = 1;
            const ctx = cvs.getContext('2d', { willReadFrequently: true });
            const colorCache = new Map<string, string>();

            const toRgb = (colorVal: string): string => {
              if (
                !colorVal ||
                (!colorVal.includes('lab') &&
                  !colorVal.includes('oklch') &&
                  !colorVal.includes('color(') &&
                  !colorVal.includes('color-mix'))
              ) {
                return colorVal;
              }
              if (colorCache.has(colorVal)) return colorCache.get(colorVal)!;
              if (!ctx) return colorVal;
              try {
                ctx.clearRect(0, 0, 1, 1);
                ctx.fillStyle = colorVal;
                ctx.fillRect(0, 0, 1, 1);
                const d = ctx.getImageData(0, 0, 1, 1).data;
                const res =
                  d[3] === 255
                    ? `rgb(${d[0]}, ${d[1]}, ${d[2]})`
                    : `rgba(${d[0]}, ${d[1]}, ${d[2]}, ${(d[3] / 255).toFixed(3)})`;
                colorCache.set(colorVal, res);
                return res;
              } catch {
                return colorVal;
              }
            };

            const allElements = clonedDoc.querySelectorAll('*');
            const colorProps = [
              'color',
              'backgroundColor',
              'borderTopColor',
              'borderRightColor',
              'borderBottomColor',
              'borderLeftColor',
              'outlineColor',
              'textDecorationColor',
            ] as const;

            const view = clonedDoc.defaultView || window;
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              if (!htmlEl.style) return;
              const cs = view.getComputedStyle(htmlEl);
              for (const prop of colorProps) {
                const val = cs[prop];
                if (
                  val &&
                  (val.includes('lab') ||
                    val.includes('oklch') ||
                    val.includes('color(') ||
                    val.includes('color-mix'))
                ) {
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
              .invoice-document,
              .invoice-document *,
              #omni-invoice-pdf-staging {
                overflow: visible !important;
              }
            `;
            clonedDoc.head.appendChild(safeStyle);

            clonedDoc.documentElement.style.backgroundColor = '#ffffff';
            clonedDoc.documentElement.style.color = '#000000';
            clonedDoc.body.style.backgroundColor = '#ffffff';
            clonedDoc.body.style.color = '#000000';
          },
        });

        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }

      const cleanInvNum = (meta.invNum || 'INV-0001').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`Invoice_${cleanInvNum}.pdf`);
      showNotice('success', `Downloaded Invoice_${cleanInvNum}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      showNotice('error', 'Could not generate the PDF. Try using the Print button to Save as PDF.');
    } finally {
      staging?.remove();
      setIsGenerating(false);
    }
  };

  if (!isClient) {
    return (
      <div
        className="mx-auto w-full min-w-0 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-4 sm:p-6 animate-pulse"
        aria-busy="true"
        aria-label="Loading Invoice Generator Workspace"
      >
        <div className="h-16 w-full rounded-2xl bg-slate-200/70 dark:bg-slate-900/80 mb-5" />
        <div className="space-y-4">
          <div className="h-44 rounded-2xl bg-slate-200/60 dark:bg-slate-900/60" />
          <div className="h-56 rounded-2xl bg-slate-200/60 dark:bg-slate-900/60" />
          <div className="h-64 rounded-2xl bg-slate-200/60 dark:bg-slate-900/60" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full min-w-0 text-slate-900 dark:text-slate-100">
      {/* ================================================================== */}
      {/* NON-SHIFTING FLOATING TOAST NOTIFICATION                           */}
      {/* ================================================================== */}
      {toast && (
        <div
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
          className={`fixed bottom-5 right-5 z-50 flex max-w-md items-center gap-2.5 rounded-2xl border px-4 py-3 text-xs font-semibold shadow-xl backdrop-blur-md animate-fadeIn ${toast.type === 'error'
              ? 'border-red-300 bg-red-50/95 text-red-800 dark:border-red-500/40 dark:bg-red-950/95 dark:text-red-200'
              : 'border-emerald-300 bg-emerald-50/95 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/95 dark:text-emerald-200'
            }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0" />
          ) : (
            <Check className="h-4 w-4 shrink-0" />
          )}
          <span className="leading-snug">{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-1 rounded p-0.5 opacity-70 transition hover:opacity-100"
            aria-label="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 sm:p-5 space-y-4">
        {/* ================================================================== */}
        {/* TOP ACTION TOOLBAR                                                 */}
        {/* ================================================================== */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-2xs">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Brand / Live Summary */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
                <ReceiptText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                    Invoice Workspace
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${meta.status === 'Paid'
                          ? 'bg-emerald-500'
                          : meta.status === 'Partially Paid'
                            ? 'bg-blue-500'
                            : meta.status === 'Overdue'
                              ? 'bg-red-500'
                              : meta.status === 'Sent'
                                ? 'bg-violet-500'
                                : 'bg-slate-400'
                        }`}
                    />
                    {meta.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No signup · Zero watermarks · 150+ ISO-4217 currencies
                </p>
              </div>
            </div>

            {/* Primary & Secondary Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={generatePDF}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 dark:hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                <span>{isGenerating ? 'Rendering PDF…' : 'Download PDF'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className={secondaryBtnClass}
                title="Print or Save as selectable PDF via browser print"
              >
                <Printer className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={exportCSV}
                className={secondaryBtnClass}
                title="Export RFC 4180 formula-safe CSV spreadsheet"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>CSV</span>
              </button>

              <button
                type="button"
                onClick={exportJSON}
                className={secondaryBtnClass}
                title="Export reusable JSON backup"
              >
                <FileCode className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>JSON</span>
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
                  className={secondaryBtnClass}
                  title="Import previously exported JSON invoice"
                >
                  <Upload className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Import</span>
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Utility Row: Drafts, Sample, Reset & Live Balance Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Save current draft to browser localStorage"
              >
                <Save className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Populate realistic example invoice data"
              >
                <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                <span>Load Sample</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Reset all fields to start a new invoice"
              >
                <RotateCcw className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>New Invoice</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  {paidAmount > 0 ? 'Balance Due:' : 'Total:'}
                </span>
                <span className="font-mono text-sm font-black text-blue-600 dark:text-blue-400 tabular-nums">
                  {currencySymbol} {formatMoney(paidAmount > 0 ? balanceDue : grandTotal, decimals)}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  previewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Preview ({previewPages.length}p)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Draft Notification Banner */}
        {hasStoredDraft && (
          <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/90 dark:bg-blue-500/10 p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5 text-xs text-blue-900 dark:text-blue-200">
              <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>A previously saved invoice draft is available in your browser storage.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700 dark:hover:bg-blue-500"
              >
                Restore Draft
              </button>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="rounded-lg border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => setDraftBannerDismissed(true)}
                className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                aria-label="Dismiss draft banner"
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
            className="flex items-center gap-2.5 rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3 text-xs font-semibold text-amber-800 dark:text-amber-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Warning: Due date ({meta.dueDate}) is earlier than Issue date ({meta.date}).
            </span>
          </div>
        )}

        {/* ================================================================== */}
        {/* STEP 1: INVOICE DETAILS & LOGO                                     */}
        {/* ================================================================== */}
        <section className={cardClass} aria-labelledby="step-1-heading">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                1
              </span>
              <h3 id="step-1-heading" className="text-sm font-bold text-slate-900 dark:text-white">
                Invoice Details &amp; Logo
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Payment terms auto-calculate due date
            </span>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[164px_minmax(0,1fr)]">
            {/* Logo Uploader */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
              <label className={labelClass} htmlFor="logo-upload-btn">
                Company Logo
              </label>
              <button
                id="logo-upload-btn"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group flex h-[92px] w-full min-w-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950/80 transition hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-500/[0.04]"
              >
                {logo ? (
                  <img
                    src={logo}
                    alt="Company logo preview"
                    className="max-h-[72px] max-w-full object-contain"
                  />
                ) : (
                  <span className="flex flex-col items-center gap-1 text-xs text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-300">
                    <UploadCloud className="h-5 w-5" />
                    <span className="font-medium">Upload Logo</span>
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
              {logo ? (
                <button
                  type="button"
                  onClick={() => setLogo('')}
                  className="mt-1.5 w-full text-center text-[11px] font-semibold text-red-600 dark:text-red-400 hover:underline"
                >
                  Remove logo
                </button>
              ) : (
                <p className="mt-1.5 text-center text-[10px] text-slate-500 dark:text-slate-400">
                  PNG, JPG, WebP · Max 2 MB
                </p>
              )}
            </div>

            {/* Metadata Grid */}
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
                  PO / Reference (Optional)
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
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="meta-date"
                    type="date"
                    value={meta.date}
                    onChange={(e) => handleIssueDateChange(e.target.value)}
                    className={`${inputClass} pl-9`}
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
                  onChange={(e) => handlePaymentTermsChange(e.target.value)}
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

              <div>
                <label className={labelClass} htmlFor="meta-due-date">
                  Due Date
                </label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="meta-due-date"
                    type="date"
                    value={meta.dueDate}
                    aria-invalid={isDueDateInvalid}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    className={`${inputClass} pl-9 ${isDueDateInvalid ? 'border-amber-500 focus:ring-amber-500/20' : ''
                      }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* STEP 2: FROM (SELLER) & BILL TO (CLIENT)                           */}
        {/* ================================================================== */}
        <section aria-labelledby="step-2-heading" className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
          <h3 id="step-2-heading" className="sr-only">
            Business and Client Details
          </h3>

          {/* FROM */}
          <div className={cardClass}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-blue-600 dark:text-blue-400">
                  From · Your Business
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className={labelClass} htmlFor="sender-name">
                  Business / Freelancer Name
                </label>
                <input
                  id="sender-name"
                  value={sender.name}
                  onChange={(e) => setSender((prev) => ({ ...prev, name: e.target.value }))}
                  className={inputClass}
                  placeholder="Your Company or Full Name"
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
                  className={`${inputClass} min-h-[60px] resize-y`}
                  placeholder="Street, City, Postal Code, Country"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="sender-email">
                  Email
                </label>
                <input
                  id="sender-email"
                  type="email"
                  value={sender.email}
                  onChange={(e) => setSender((prev) => ({ ...prev, email: e.target.value }))}
                  className={inputClass}
                  placeholder="billing@company.com"
                />
              </div>

              {/* Progressive Disclosure: Optional Seller Identifiers */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowSenderExtra((v) => !v)}
                  aria-expanded={showSenderExtra}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${showSenderExtra ? 'rotate-180' : ''}`}
                  />
                  <span>
                    {showSenderExtra
                      ? 'Hide Tax ID, Phone, Website & Reg. No.'
                      : 'Add Tax ID / VAT / NTN, Phone, Website & Reg. No.'}
                  </span>
                </button>

                {showSenderExtra && (
                  <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-3">
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
                    <div>
                      <label className={labelClass} htmlFor="sender-website">
                        Website
                      </label>
                      <input
                        id="sender-website"
                        value={sender.website}
                        onChange={(e) => setSender((prev) => ({ ...prev, website: e.target.value }))}
                        className={inputClass}
                        placeholder="https://yourcompany.com"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BILL TO */}
          <div className={cardClass}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-violet-600 dark:text-violet-400">
                  Bill To · Client Details
                </p>
              </div>
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
                  className={`${inputClass} min-h-[60px] resize-y`}
                  placeholder="Street, City, Postal Code, Country"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="client-email">
                  Email
                </label>
                <input
                  id="client-email"
                  type="email"
                  value={client.email}
                  onChange={(e) => setClient((prev) => ({ ...prev, email: e.target.value }))}
                  className={inputClass}
                  placeholder="ap@client.com"
                />
              </div>

              {/* Progressive Disclosure: Optional Client Identifiers */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowClientExtra((v) => !v)}
                  aria-expanded={showClientExtra}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                >
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${showClientExtra ? 'rotate-180' : ''}`}
                  />
                  <span>
                    {showClientExtra
                      ? 'Hide Client Phone, Tax ID & Shipping Address'
                      : 'Add Client Phone, Tax ID / VAT & Shipping Address'}
                  </span>
                </button>

                {showClientExtra && (
                  <div className="mt-3 space-y-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-3">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
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
                        placeholder="Delivery location if different from billing address"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* STEP 3: LINE ITEMS & CURRENCY                                      */}
        {/* ================================================================== */}
        <section
          className={cardClass}
          aria-labelledby="step-3-heading"
          onKeyDown={handleLineItemsKeyDown}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                3
              </span>
              <div>
                <h3 id="step-3-heading" className="text-sm font-bold text-slate-900 dark:text-white">
                  Line Items &amp; Currency
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Line Total = (Qty &times; Unit Price) &minus; Line Discount
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <label htmlFor="currency-select" className="sr-only">
                  Currency
                </label>
                <select
                  id="currency-select"
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  className="h-9 max-w-[230px] appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-3 pr-8 text-xs font-semibold text-slate-900 dark:text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol}) — {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>

              <button
                type="button"
                onClick={addItem}
                aria-label="Add invoice line item"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 dark:hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-3">
            {computedItems.map((item, index) => (
              <div
                key={item.id}
                id={`line-item-card-${item.id}`}
                className="line-item-card rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3 transition hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="mb-2.5">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label
                      htmlFor={`item-desc-${item.id}`}
                      className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                    >
                      Item {index + 1} Description
                    </label>
                    {!item.desc && (
                      <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                        Description recommended
                      </span>
                    )}
                  </div>
                  <input
                    id={`item-desc-${item.id}`}
                    value={item.desc}
                    onChange={(e) => handleItemChange(index, 'desc', e.target.value)}
                    className={inputClass}
                    placeholder={`e.g. Web Development, Design Retainer, or Product SKU ${index + 1}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-6 items-end">
                  <div>
                    <label
                      htmlFor={`item-qty-${item.id}`}
                      className="mb-1 block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400"
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

                  <div>
                    <label
                      htmlFor={`item-unit-${item.id}`}
                      className="mb-1 block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400"
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

                  <div>
                    <label
                      htmlFor={`item-rate-${item.id}`}
                      className="mb-1 block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400"
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

                  <div>
                    <label
                      htmlFor={`item-disc-${item.id}`}
                      className="mb-1 block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400"
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

                  <div>
                    <span className="mb-1 block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                      Total
                    </span>
                    <div className="flex h-[38px] items-center justify-end rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 text-right font-mono text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {currencySymbol} {formatMoney(item.lineTotal, decimals)}
                    </div>
                  </div>

                  <div className="flex h-[38px] items-center justify-between gap-1.5 px-1">
                    <label
                      htmlFor={`item-taxable-${item.id}`}
                      className="flex cursor-pointer select-none items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400"
                      title="Include this line item in the taxable base"
                    >
                      <input
                        id={`item-taxable-${item.id}`}
                        type="checkbox"
                        checked={item.taxable}
                        onChange={(e) => handleItemChange(index, 'taxable', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20"
                      />
                      <span>Tax</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-25"
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

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{items.length}</span>{' '}
              {items.length === 1 ? 'line item' : 'line items'}
              <span className="hidden sm:inline">
                {' '}· Press{' '}
                <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                  Ctrl+Enter
                </kbd>{' '}
                to add next
              </span>
            </p>
            <button
              type="button"
              onClick={addItem}
              aria-label="Add another line item"
              className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/70 dark:bg-blue-950/40 px-3.5 text-xs font-bold text-blue-700 dark:text-blue-400 transition hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Item</span>
            </button>
          </div>
        </section>

        {/* ================================================================== */}
        {/* STEP 4: DISCOUNTS, TAXES, SHIPPING, FEES & PARTIAL PAYMENT         */}
        {/* ================================================================== */}
        <section aria-labelledby="step-4-heading" className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
          <h3 id="step-4-heading" className="sr-only">
            Discounts, Taxes, Shipping, Fees, and Partial Payments
          </h3>

          {/* Discounts & Taxes */}
          <div className={`${cardClass} space-y-4`}>
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label className={labelClass} htmlFor="global-discount-input">
                  Invoice Discount
                </label>
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleDiscountTypeChange('percent')}
                    className={`rounded px-2 py-0.5 font-semibold transition ${discountType === 'percent'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    % Percent
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDiscountTypeChange('fixed')}
                    className={`rounded px-2 py-0.5 font-semibold transition ${discountType === 'fixed'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                  max={discountType === 'percent' ? 100 : undefined}
                  step="any"
                  value={discountInput}
                  onChange={(e) => handleDiscountInputChange(e.target.value)}
                  className={`${inputClass} text-right font-mono`}
                  placeholder="0.00"
                />
                <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {discountType === 'percent' ? '%' : currencyCode}
                </span>
                <span className="ml-auto shrink-0 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  -{currencySymbol} {formatMoney(discountAmount, decimals)}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                Allocated proportionally across taxable and tax-exempt items before tax.
              </p>
            </div>

            {/* Multiple Taxes */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <span className={labelClass}>Taxes (Applied to Taxable Base)</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Taxable Base: {currencySymbol} {formatMoney(taxableBase, decimals)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addTax}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + Add Tax
                </button>
              </div>

              {taxes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-3 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No taxes applied (0% tax-free).
                  </p>
                  <button
                    type="button"
                    onClick={addTax}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
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
                      className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-2"
                    >
                      <input
                        aria-label="Tax Name"
                        value={t.name}
                        onChange={(e) => updateTax(t.id, { name: e.target.value })}
                        className="h-8 flex-1 min-w-[120px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                        placeholder="e.g. VAT, GST, PST"
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
                          className="h-8 w-16 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-right font-mono text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                        />
                        <span className="text-xs text-slate-500 dark:text-slate-400">%</span>
                      </div>

                      <span className="ml-auto font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        +{currencySymbol}{' '}
                        {formatMoney(roundMoney(taxableBase * (t.rate / 100), decimals), decimals)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeTax(t.id)}
                        className="p-1 text-slate-400 transition hover:text-red-600 dark:hover:text-red-400"
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

          {/* Shipping, Fees & Partial Payment */}
          <div className={`${cardClass} space-y-4`}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="shipping-charge-input">
                  Shipping (Untaxed)
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
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center gap-1.5">
                  <input
                    aria-label="Additional fee label"
                    value={additionalFeeLabel}
                    onChange={(e) => setAdditionalFeeLabel(e.target.value)}
                    className="w-full rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500"
                    placeholder="Processing Fee"
                  />
                </div>
                <input
                  id="additional-fee-input"
                  aria-label="Additional fee amount"
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
              </div>
            </div>

            {/* Deposit / Amount Already Paid */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <label className={labelClass} htmlFor="amount-paid-input">
                Amount Already Paid (Deposits / Partial Payments)
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
                <span className="shrink-0 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                  -{currencySymbol} {formatMoney(paidAmount, decimals)}
                </span>
              </div>

              {/* Compact Financial Summary */}
              <div className="mt-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-200 tabular-nums">
                    {currencySymbol} {formatMoney(subtotal, decimals)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount ({discountType === 'percent' ? `${discountValue}%` : 'Fixed'})</span>
                    <span className="font-mono tabular-nums">
                      -{currencySymbol} {formatMoney(discountAmount, decimals)}
                    </span>
                  </div>
                )}
                {computedTaxes.map((t) => (
                  <div key={t.id} className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>
                      {t.name} ({t.rate}%)
                    </span>
                    <span className="font-mono text-slate-900 dark:text-slate-200 tabular-nums">
                      +{currencySymbol} {formatMoney(t.amount, decimals)}
                    </span>
                  </div>
                ))}
                {shippingAmount > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Shipping</span>
                    <span className="font-mono text-slate-900 dark:text-slate-200 tabular-nums">
                      +{currencySymbol} {formatMoney(shippingAmount, decimals)}
                    </span>
                  </div>
                )}
                {feeAmount > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{additionalFeeLabel || 'Additional Fee'}</span>
                    <span className="font-mono text-slate-900 dark:text-slate-200 tabular-nums">
                      +{currencySymbol} {formatMoney(feeAmount, decimals)}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline justify-between border-t border-slate-200 dark:border-slate-800 pt-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">Grand Total</span>
                  <span className="font-mono text-base font-black text-blue-600 dark:text-blue-400 tabular-nums">
                    {currencySymbol} {formatMoney(grandTotal, decimals)}
                  </span>
                </div>
                {paidAmount > 0 && (
                  <div className="flex items-baseline justify-between border-t border-slate-200/80 dark:border-slate-800/80 pt-1.5 font-bold">
                    <span className="text-amber-700 dark:text-amber-300">Balance Remaining</span>
                    <span className="font-mono text-sm text-amber-700 dark:text-amber-400 tabular-nums">
                      {currencySymbol} {formatMoney(balanceDue, decimals)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* STEP 5: PAYMENT INSTRUCTIONS (IBAN/SWIFT) & NOTES / TERMS          */}
        {/* ================================================================== */}
        <section className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Payment Instructions and Notes">
          <div className={cardClass}>
            <div className="mb-2 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-700 dark:text-slate-300" htmlFor="payment-instructions-text">
                Payment Instructions / Bank Details (IBAN &amp; SWIFT)
              </label>
            </div>
            <textarea
              id="payment-instructions-text"
              value={sender.bank}
              onChange={(e) => setSender((prev) => ({ ...prev, bank: e.target.value }))}
              className={`${inputClass} min-h-[96px] resize-y`}
              placeholder={'Bank Name: Example Bank\nAccount Name: Your Company\nAccount / IBAN: GB29EXMP12345678901234\nSWIFT/BIC: EXMPGB2L'}
            />
          </div>

          <div className={`${cardClass} space-y-2.5`}>
            <div>
              <label className={labelClass} htmlFor="notes-terms-text">
                Invoice Notes
              </label>
              <textarea
                id="notes-terms-text"
                value={meta.notes}
                onChange={(e) => setMeta((prev) => ({ ...prev, notes: e.target.value }))}
                className={`${inputClass} min-h-[70px] resize-y`}
                placeholder="Thank you for your business! Please remit payment within payment terms."
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowTermsField((v) => !v)}
                aria-expanded={showTermsField}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${showTermsField ? 'rotate-180' : ''}`}
                />
                <span>{showTermsField ? 'Hide Terms & Conditions' : 'Edit Terms & Conditions'}</span>
              </button>

              {showTermsField && (
                <div className="mt-2">
                  <label className={labelClass} htmlFor="meta-terms-text">
                    Terms &amp; Conditions
                  </label>
                  <textarea
                    id="meta-terms-text"
                    value={meta.terms}
                    onChange={(e) => setMeta((prev) => ({ ...prev, terms: e.target.value }))}
                    className={`${inputClass} min-h-[60px] resize-y`}
                    placeholder="Payment is due within the agreed timeframe."
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* LIVE A4 PREVIEW & EXPORT ACTIONS                                   */}
        {/* ================================================================== */}
        <section
          ref={previewSectionRef}
          className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shadow-xs"
          aria-label="Live A4 Invoice Preview"
        >
          {/* Preview Header & Toolbar */}
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Live A4 Preview</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {previewPages.length === 1 ? 'Page 1 of 1' : `${previewPages.length} Pages`} · Multi-Page A4 · {decimals} Decimals
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/70 p-1 text-xs text-slate-700 dark:text-slate-200">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="rounded px-2.5 py-1 font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
                  aria-label="Zoom out"
                  title="Zoom out"
                >
                  &minus;
                </button>

                <button
                  type="button"
                  onClick={handleZoomFit}
                  className={`rounded px-2.5 py-1 text-[11px] font-bold transition ${zoomMode === 'fit'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  aria-label="Fit invoice to preview"
                  title="Fit document to window"
                >
                  Fit ({Math.round(effectiveScale * 100)}%)
                </button>

                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="rounded px-2.5 py-1 font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
                  aria-label="Zoom in"
                  title="Zoom in"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={generatePDF}
                disabled={isGenerating}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 dark:hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60"
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
            className="flex h-[calc(100vh-210px)] min-h-[600px] max-h-[960px] flex-1 items-start justify-center overflow-auto bg-slate-100/90 dark:bg-[#070b14] p-3 sm:p-5"
          >
            <div className="flex w-full min-w-0 flex-col items-center gap-8 py-2">
              {previewPages.map((pageData) => (
                <div
                  key={pageData.pageNumber}
                  className="flex w-full min-w-0 flex-col items-center"
                >
                  {/* Page Indicator */}
                  <div
                    className="mb-2 flex items-center justify-between px-2 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    style={{ width: `${Math.round(794 * effectiveScale)}px` }}
                  >
                    <span>
                      Page {pageData.pageNumber} of {pageData.totalPages}
                    </span>
                    <span>
                      {pageData.items.length > 0
                        ? `Items ${pageData.startItemIndex + 1}–${pageData.startItemIndex + pageData.items.length
                        }`
                        : 'Summary & Terms'}
                    </span>
                  </div>

                  {/* A4 Page Shell */}
                  <div
                    className="invoice-page-shell relative shrink-0 shadow-xl ring-1 ring-slate-900/10 rounded-sm bg-white"
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
                        style={{ padding: '24px 32px 24px 32px' }}
                      >
                        <div className="min-w-0">
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
                                  <div className="w-[260px] shrink-0 text-right">
                                    <h2 className="text-[13px] font-black tracking-tight text-slate-950 leading-tight">
                                      {sender.name || (
                                        <span className="font-normal italic text-slate-400">
                                          Your business name
                                        </span>
                                      )}
                                    </h2>
                                    {sender.address && (
                                      <p className="mt-0.5 whitespace-pre-line text-[9px] leading-tight text-slate-600 break-words">
                                        {sender.address}
                                      </p>
                                    )}
                                    <div className="mt-1 space-y-0.5 text-[9px] text-slate-600 leading-tight">
                                      {sender.email && <p className="break-words break-all">{sender.email}</p>}
                                      {sender.phone && <p className="break-words">{sender.phone}</p>}
                                      {sender.taxId && (
                                        <p className="font-semibold text-slate-700 break-words">
                                          Tax ID: {sender.taxId}
                                        </p>
                                      )}
                                      {sender.regNumber && (
                                        <p className="text-[8px] text-slate-500 break-words">
                                          Reg: {sender.regNumber}
                                        </p>
                                      )}
                                      {sender.website && (
                                        <p className="text-[8px] text-slate-500 break-words break-all">
                                          {sender.website}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </header>

                              {/* Parties & Dates Grid */}
                              <section className="invoice-row grid grid-cols-[minmax(0,1fr)_260px] gap-4 pb-2 mb-2 border-b border-slate-200">
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
                                    <p className="mt-0.5 whitespace-pre-line text-[9px] leading-tight text-slate-600 break-words">
                                      {client.address}
                                    </p>
                                  )}
                                  <div className="mt-0.5 space-y-0.5 text-[9px] text-slate-600 leading-tight">
                                    {client.email && <p className="break-words break-all">{client.email}</p>}
                                    {client.phone && <p className="break-words">{client.phone}</p>}
                                    {client.taxId && (
                                      <p className="font-semibold text-slate-700 break-words">
                                        Tax ID: {client.taxId}
                                      </p>
                                    )}
                                  </div>
                                  {client.shippingAddress && (
                                    <div className="mt-1.5 pt-1 border-t border-slate-100">
                                      <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">
                                        SHIP TO:
                                      </span>
                                      <p className="mt-0.5 text-[9px] leading-tight text-slate-600 whitespace-pre-line break-words">
                                        {client.shippingAddress}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-[9px] flex flex-col gap-1.5 self-start shadow-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                                      Issue Date:
                                    </span>
                                    <span className="font-semibold text-slate-800 tabular-nums text-right ml-2">
                                      {formatDisplayDate(meta.date)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                                      Due Date:
                                    </span>
                                    <span className="font-semibold text-slate-800 tabular-nums text-right ml-2">
                                      {formatDisplayDate(meta.dueDate)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                                      Terms:
                                    </span>
                                    <span className="font-semibold text-slate-800 text-right ml-2 whitespace-nowrap leading-normal">
                                      {meta.paymentTerms || 'Due on Receipt'}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between border-t border-slate-200/80 pt-1 mt-0.5">
                                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                                      Currency:
                                    </span>
                                    <span className="font-bold text-slate-900 text-right ml-2">
                                      {currencyCode} ({currencySymbol})
                                    </span>
                                  </div>
                                </div>
                              </section>
                            </>
                          ) : (
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

                          {/* LINE ITEMS TABLE */}
                          {pageData.items.length > 0 && (
                            <section className="invoice-items mt-0.5">
                              <table className="w-full table-fixed border-collapse">
                                <thead className="invoice-table-head">
                                  <tr className="border-b border-slate-900 text-[8px] font-black uppercase tracking-[0.14em] text-slate-700 bg-slate-100/70">
                                    <th className="w-[38%] text-left" style={{ padding: '5px 8px' }}>
                                      Product / Service
                                    </th>
                                    <th className="w-[8%] text-center" style={{ padding: '5px 4px' }}>
                                      Qty
                                    </th>
                                    <th className="w-[8%] text-center" style={{ padding: '5px 4px' }}>
                                      Unit
                                    </th>
                                    <th className="w-[16%] text-right" style={{ padding: '5px 8px' }}>
                                      Rate
                                    </th>
                                    <th className="w-[9%] text-center" style={{ padding: '5px 4px' }}>
                                      Tax
                                    </th>
                                    <th className="w-[21%] text-right" style={{ padding: '5px 8px' }}>
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
                                          style={{ padding: '5px 8px' }}
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
                                          className="text-center font-mono text-[9px] font-medium text-slate-700 tabular-nums"
                                          style={{ padding: '5px 4px' }}
                                        >
                                          {qty}
                                        </td>
                                        <td
                                          className="text-center text-[9px] text-slate-500"
                                          style={{ padding: '5px 4px' }}
                                        >
                                          {item.unit || 'units'}
                                        </td>
                                        <td
                                          className="text-right font-mono text-[9px] font-medium text-slate-700 tabular-nums whitespace-nowrap"
                                          style={{ padding: '5px 8px' }}
                                        >
                                          {isItemBlank
                                            ? '—'
                                            : `${currencySymbol} ${formatMoney(rate, decimals)}`}
                                        </td>
                                        <td
                                          className="text-center font-mono text-[8.5px] font-medium text-slate-600 tabular-nums"
                                          style={{ padding: '5px 4px' }}
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
                                          className="text-right font-mono text-[9px] font-bold text-slate-950 tabular-nums whitespace-nowrap"
                                          style={{ padding: '5px 8px' }}
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

                          {/* SUMMARY & FINANCIAL TOTALS */}
                          {pageData.hasSummary && (
                            <section className="invoice-summary mt-2.5 grid grid-cols-[minmax(0,1fr)_290px] gap-4 pt-2 border-t border-slate-200">
                              <div className="min-w-0 pr-2">
                                <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                                  Payment Instructions
                                </p>
                                <p className="mt-0.5 whitespace-pre-line text-[9px] leading-snug text-slate-600 break-words break-all">
                                  {sender.bank || 'Please remit payment as per agreed terms.'}
                                </p>

                                {meta.notes && (
                                  <div className="mt-2">
                                    <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                                      Notes
                                    </p>
                                    <p className="mt-0.5 whitespace-pre-line text-[9px] leading-snug text-slate-500 break-words">
                                      {meta.notes}
                                    </p>
                                  </div>
                                )}

                                {meta.terms && (
                                  <div className="mt-2">
                                    <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                                      Terms &amp; Conditions
                                    </p>
                                    <p className="mt-0.5 whitespace-pre-line text-[8.5px] leading-snug text-slate-500 break-words">
                                      {meta.terms}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-[9px] self-start shadow-xs flex flex-col gap-1">
                                <div className="flex items-center justify-between text-slate-600 py-0.5">
                                  <span className="font-medium text-[9px]">Subtotal</span>
                                  <span className="font-mono font-semibold text-slate-900 tabular-nums shrink-0 ml-2 text-right whitespace-nowrap">
                                    {isFreshEmpty
                                      ? '—'
                                      : `${currencySymbol} ${formatMoney(subtotal, decimals)}`}
                                  </span>
                                </div>

                                {discountAmount > 0 && (
                                  <div className="flex items-center justify-between text-emerald-700 py-0.5 font-medium">
                                    <span className="text-[8.5px] pr-1 leading-normal font-medium">
                                      Discount ({discountType === 'percent' ? `${discountValue}%` : 'Fixed'})
                                    </span>
                                    <span className="font-mono tabular-nums shrink-0 ml-2 text-right whitespace-nowrap">
                                      -{currencySymbol} {formatMoney(discountAmount, decimals)}
                                    </span>
                                  </div>
                                )}

                                {(discountAmount > 0 || computedTaxes.length > 0) && !isFreshEmpty && (
                                  <div className="flex items-center justify-between text-slate-500 py-0.5 text-[8.5px]">
                                    <span className="pr-1 leading-normal">Taxable Base</span>
                                    <span className="font-mono text-slate-700 tabular-nums shrink-0 ml-2 text-right whitespace-nowrap">
                                      {currencySymbol} {formatMoney(taxableBase, decimals)}
                                    </span>
                                  </div>
                                )}

                                {computedTaxes.map((t) => (
                                  <div key={t.id} className="flex items-center justify-between text-slate-600 py-0.5 text-[9px]">
                                    <span className="pr-1 leading-normal">
                                      {t.name} ({t.rate}%)
                                    </span>
                                    <span className="font-mono font-medium text-slate-900 tabular-nums shrink-0 ml-2 text-right whitespace-nowrap">
                                      +{currencySymbol} {formatMoney(t.amount, decimals)}
                                    </span>
                                  </div>
                                ))}

                                {shippingAmount > 0 && (
                                  <div className="flex items-center justify-between text-slate-600 py-0.5 text-[9px]">
                                    <span className="pr-1 leading-normal">Shipping</span>
                                    <span className="font-mono font-medium text-slate-900 tabular-nums shrink-0 ml-2 text-right whitespace-nowrap">
                                      +{currencySymbol} {formatMoney(shippingAmount, decimals)}
                                    </span>
                                  </div>
                                )}

                                {feeAmount > 0 && (
                                  <div className="flex items-center justify-between text-slate-600 py-0.5 text-[9px]">
                                    <span className="pr-1 leading-normal">{additionalFeeLabel || 'Fee'}</span>
                                    <span className="font-mono font-medium text-slate-900 tabular-nums shrink-0 ml-2 text-right whitespace-nowrap">
                                      +{currencySymbol} {formatMoney(feeAmount, decimals)}
                                    </span>
                                  </div>
                                )}

                                <div className="border-t-2 border-slate-900 pt-1.5 pb-1 mt-0.5">
                                  <div className="flex items-baseline justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-950">
                                      Total Due:
                                    </span>
                                    <span className="font-mono text-[13.5px] font-black text-slate-950 tabular-nums shrink-0 ml-2 text-right whitespace-nowrap">
                                      {isFreshEmpty
                                        ? '—'
                                        : `${currencySymbol} ${formatMoney(grandTotal, decimals)}`}
                                    </span>
                                  </div>
                                </div>

                                {paidAmount > 0 && (
                                  <div className="flex items-center justify-between text-blue-800 py-1 font-semibold text-[9px]">
                                    <span className="tracking-wide">Amount Paid:</span>
                                    <span className="font-mono font-bold text-[9.5px] tabular-nums shrink-0 ml-2 text-right whitespace-nowrap">
                                      -{currencySymbol} {formatMoney(paidAmount, decimals)}
                                    </span>
                                  </div>
                                )}

                                {paidAmount > 0 && (
                                  <div className="flex items-baseline justify-between border-t border-slate-300 pt-1.5 pb-0.5 mt-0.5 font-bold text-amber-900">
                                    <span className="uppercase text-[8.5px] font-black tracking-wider">
                                      Balance Due:
                                    </span>
                                    <span className="font-mono text-[12px] font-black tabular-nums shrink-0 ml-2 text-right text-amber-950 whitespace-nowrap">
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

                        <footer className="invoice-footer mt-auto border-t border-slate-200 pt-1.5">
                          <div className="flex items-center justify-between text-[8px] text-slate-400 font-medium">
                            <p>
                              {sender.website || sender.email || 'Thank you for your business'}
                            </p>
                            <p className="text-center text-[7px] text-slate-400/90">
                              General-purpose business invoice. Tax &amp; statutory requirements vary by jurisdiction.
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

        {/* Compact Commercial Notice */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 px-3.5 py-2.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          <strong className="text-slate-700 dark:text-slate-300">Commercial Invoice Notice:</strong>{' '}
          Generates general-purpose English A4 invoices in your browser. Statutory e-invoicing and multi-rate tax rules (such as FBR PRAL, India GST Rule 46, UAE FTA, HMRC VAT, CRA, BIR, NRS/FIRS, or SARS) vary by jurisdiction—verify local requirements before tax filing.
        </div>
      </div>

      {/* ================================================================== */}
      {/* MODAL: RESET CONFIRMATION                                          */}
      {/* ================================================================== */}
      {showResetModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <RotateCcw className="h-5 w-5" />
              </div>
              <h2 id="reset-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Start New Invoice?
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 mb-5">
              This will reset all invoice fields, client data, and line items back to clean defaults. Any unsaved edits will be cleared.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className={secondaryBtnClass}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-700 dark:hover:bg-amber-500"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <FileCode className="h-5 w-5" />
              </div>
              <h2 id="import-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Confirm Invoice Import
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
              Importing this JSON file will replace your current editor fields with the imported invoice data.
            </p>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-700 dark:text-slate-300 mb-5 space-y-1">
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
                className={secondaryBtnClass}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmJSONImport}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 dark:hover:bg-blue-500"
              >
                Import &amp; Replace
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
          line-height: 1.35;
          font-variant-numeric: tabular-nums;
        }

        .invoice-document * {
          box-sizing: border-box;
        }

        .invoice-table-head th {
          font-size: 8px !important;
          line-height: 1.25 !important;
        }

        .invoice-row td {
          font-size: 9px !important;
          line-height: 1.3 !important;
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