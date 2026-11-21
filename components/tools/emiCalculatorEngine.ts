/**
 * Pure Financial Engine & Domain Logic for KivaroTools EMI Calculator.
 *
 * Implements deterministic standard reducing-balance loan amortization,
 * flexible payment frequencies (monthly, biweekly, weekly), ordinary annuity vs
 * annuity due timing, multi-mode prepayment curtailment, fee modeling,
 * CSV audit exports, and deep URL serialization.
 */

/* =========================================================================
   1. TYPES & DOMAIN INTERFACES
   ========================================================================= */

export type PaymentFrequency = 'monthly' | 'biweekly' | 'weekly';
export type PaymentTiming = 'end' | 'beginning';
export type PrepaymentMode = 'term' | 'payment' | 'immediate';

export interface CurrencyItem {
  code: string;
  symbol: string;
  name: string;
  minorUnit: number;
}

export interface LoanParams {
  principal: number;
  annualRate: number; // in percent, e.g. 6.5
  years: number;
  frequency: PaymentFrequency;
  timing: PaymentTiming;
  extraPayment: number;
  oneTimePrepayment: number;
  prepaymentPeriod: number; // 1-based period number
  prepaymentMode: PrepaymentMode;
  originationFee: number;
  recurringFee: number;
}

export interface ScheduleRow {
  period: number;
  openingBalance: number;
  scheduledPayment: number;
  extraPayment: number;
  totalPayment: number;
  principalPaid: number;
  interestPaid: number;
  feePaid: number;
  closingBalance: number;
}

export interface YearlySummaryRow {
  year: number;
  openingBalance: number;
  totalScheduled: number;
  totalExtra: number;
  totalPrincipal: number;
  totalInterest: number;
  totalFees: number;
  closingBalance: number;
}

export interface LoanCalculationResult {
  scheduledPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  originationFee: number;
  totalRecurringFees: number;
  totalFees: number;
  totalPaid: number;
  totalCost: number;
  payoffPeriods: number;
  payoffYears: number;
  requestedPrepayment: number;
  appliedPrepayment: number;
  unappliedPrepayment: number;
  isPrepaymentPastPayoff: boolean;
  schedule: ScheduleRow[];
  yearlySummary: YearlySummaryRow[];
  principalPercent: number;
  interestPercent: number;
  feePercent: number;
}

export interface ComparisonResult {
  interestSaved: number;
  periodsSaved: number;
  yearsSaved: number;
  monthsSaved: number;
  totalCostSaved: number;
  isAccelerated: boolean;
}

/* =========================================================================
   2. CONSTANTS & WORLD CURRENCIES
   ========================================================================= */

export const ISO_ACTIVE_CURRENCIES: string[] = [
  'AED', 'AFN', 'ALL', 'AMD', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD',
  'CAD', 'CDF', 'CHF', 'CLP', 'CNY', 'COP', 'CRC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD',
  'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT',
  'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD',
  'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLE', 'SOS', 'SRD', 'SSP', 'STN',
  'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'UYU', 'UZS', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XCG', 'XOF', 'XPF',
  'YER', 'ZAR', 'ZMW', 'ZWG',
];

const CURRENCY_NAMES: Record<string, string> = {
  AED: 'UAE Dirham', AFN: 'Afghan Afghani', ALL: 'Albanian Lek', AMD: 'Armenian Dram',
  AOA: 'Angolan Kwanza', ARS: 'Argentine Peso', AUD: 'Australian Dollar',
  AWG: 'Aruban Florin', AZN: 'Azerbaijani Manat', BAM: 'Bosnia-Herzegovina Convertible Mark', BBD: 'Barbadian Dollar',
  BDT: 'Bangladeshi Taka', BHD: 'Bahraini Dinar', BIF: 'Burundian Franc', BMD: 'Bermudan Dollar', BND: 'Brunei Dollar',
  BOB: 'Bolivian Boliviano', BRL: 'Brazilian Real', BSD: 'Bahamian Dollar', BTN: 'Bhutanese Ngultrum', BWP: 'Botswanan Pula',
  BYN: 'Belarusian Ruble', BZD: 'Belize Dollar', CAD: 'Canadian Dollar', CDF: 'Congolese Franc', CHF: 'Swiss Franc',
  CLP: 'Chilean Peso', CNY: 'Chinese Yuan', COP: 'Colombian Peso', CRC: 'Costa Rican Colon', CUP: 'Cuban Peso',
  CVE: 'Cape Verdean Escudo', CZK: 'Czech Koruna', DJF: 'Djiboutian Franc', DKK: 'Danish Krone', DOP: 'Dominican Peso',
  DZD: 'Algerian Dinar', EGP: 'Egyptian Pound', ERN: 'Eritrean Nakfa', ETB: 'Ethiopian Birr', EUR: 'Euro',
  FJD: 'Fijian Dollar', FKP: 'Falkland Islands Pound', GBP: 'British Pound', GEL: 'Georgian Lari', GHS: 'Ghanaian Cedi',
  GIP: 'Gibraltar Pound', GMD: 'Gambian Dalasi', GNF: 'Guinean Franc', GTQ: 'Guatemalan Quetzal', GYD: 'Guyanaese Dollar',
  HKD: 'Hong Kong Dollar', HNL: 'Honduran Lempira', HTG: 'Haitian Gourde', HUF: 'Hungarian Forint', IDR: 'Indonesian Rupiah',
  ILS: 'Israeli New Shekel', INR: 'Indian Rupee', IQD: 'Iraqi Dinar', IRR: 'Iranian Rial', ISK: 'Icelandic Krona',
  JMD: 'Jamaican Dollar', JOD: 'Jordanian Dinar', JPY: 'Japanese Yen', KES: 'Kenyan Shilling', KGS: 'Kyrgystani Som',
  KHR: 'Cambodian Riel', KMF: 'Comorian Franc', KPW: 'North Korean Won', KRW: 'South Korean Won', KWD: 'Kuwaiti Dinar',
  KYD: 'Cayman Islands Dollar', KZT: 'Kazakhstani Tenge', LAK: 'Laotian Kip', LBP: 'Lebanese Pound', LKR: 'Sri Lankan Rupee',
  LRD: 'Liberian Dollar', LSL: 'Lesotho Loti', LYD: 'Libyan Dinar', MAD: 'Moroccan Dirham', MDL: 'Moldovan Leu',
  MGA: 'Malagasy Ariary', MKD: 'Macedonian Denar', MMK: 'Myanmar Kyat', MNT: 'Mongolian Tugrik', MOP: 'Macanese Pataca',
  MRU: 'Mauritanian Ouguiya', MUR: 'Mauritian Rupee', MVR: 'Maldivian Rufiyaa', MWK: 'Malawian Kwacha', MXN: 'Mexican Peso',
  MYR: 'Malaysian Ringgit', MZN: 'Mozambican Metical', NAD: 'Namibian Dollar', NGN: 'Nigerian Naira', NIO: 'Nicaraguan Cordoba',
  NOK: 'Norwegian Krone', NPR: 'Nepalese Rupee', NZD: 'New Zealand Dollar', OMR: 'Omani Rial', PAB: 'Panamanian Balboa',
  PEN: 'Peruvian Sol', PGK: 'Papua New Guinean Kina', PHP: 'Philippine Peso', PKR: 'Pakistani Rupee', PLN: 'Polish Zloty',
  PYG: 'Paraguayan Guarani', QAR: 'Qatari Riyal', RON: 'Romanian Leu', RSD: 'Serbian Dinar', RUB: 'Russian Ruble',
  RWF: 'Rwandan Franc', SAR: 'Saudi Riyal', SBD: 'Solomon Islands Dollar', SCR: 'Seychellois Rupee', SDG: 'Sudanese Pound',
  SEK: 'Swedish Krona', SGD: 'Singapore Dollar', SHP: 'Saint Helena Pound', SLE: 'Sierra Leonean Leone', SOS: 'Somali Shilling',
  SRD: 'Surinamese Dollar', SSP: 'South Sudanese Pound', STN: 'Sao Tome & Principe Dobra', SVC: 'Salvadoran Colon',
  SYP: 'Syrian Pound', SZL: 'Swazi Lilangeni', THB: 'Thai Baht', TJS: 'Tajikistani Somoni', TMT: 'Turkmenistani Manat',
  TND: 'Tunisian Dinar', TOP: 'Tongan Paanga', TRY: 'Turkish Lira', TTD: 'Trinidad & Tobago Dollar', TWD: 'New Taiwan Dollar',
  TZS: 'Tanzanian Shilling', UAH: 'Ukrainian Hryvnia', UGX: 'Ugandan Shilling', USD: 'US Dollar', UYU: 'Uruguayan Peso',
  UZS: 'Uzbekistani Som', VES: 'Venezuelan Bolivar', VND: 'Vietnamese Dong', VUV: 'Vanuatu Vatu', WST: 'Samoan Tala',
  XAF: 'Central African CFA Franc', XCD: 'East Caribbean Dollar', XCG: 'Caribbean Guilder', XOF: 'West African CFA Franc',
  XPF: 'CFP Franc', YER: 'Yemeni Rial', ZAR: 'South African Rand', ZMW: 'Zambian Kwacha', ZWG: 'Zimbabwe Gold',
};

// Clean Latin/Unicode symbols — Arabic-script currencies use crisp ISO codes to prevent tofu boxes in Latin-only fonts
const CURRENCY_SYMBOLS: Record<string, string> = {
  AED: 'AED ', AFN: 'AFN ', ALL: 'L', AMD: 'AMD ', AOA: 'Kz', ARS: '$', AUD: 'A$', AWG: 'ƒ', AZN: '₼', BAM: 'KM',
  BBD: 'Bds$', BDT: '৳', BHD: 'BHD ', BIF: 'FBu', BMD: '$', BND: 'B$', BOB: 'Bs', BRL: 'R$', BSD: 'B$', BTN: 'Nu.',
  BWP: 'P', BYN: 'Br', BZD: 'BZ$', CAD: 'C$', CDF: 'FC', CHF: 'CHF ', CLP: '$', CNY: '¥', COP: '$', CRC: '₡', CUP: '$',
  CVE: '$', CZK: 'Kč', DJF: 'Fdj', DKK: 'kr', DOP: 'RD$', DZD: 'DZD ', EGP: 'E£', ERN: 'Nfk', ETB: 'Br', EUR: '€',
  FJD: 'FJ$', FKP: '£', GBP: '£', GEL: '₾', GHS: 'GH₵', GIP: '£', GMD: 'D', GNF: 'FG', GTQ: 'Q', GYD: 'G$',
  HKD: 'HK$', HNL: 'L', HTG: 'G', HUF: 'Ft', IDR: 'Rp', ILS: '₪', INR: '₹', IQD: 'IQD ', IRR: 'IRR ', ISK: 'kr',
  JMD: 'J$', JOD: 'JOD ', JPY: '¥', KES: 'KSh', KGS: 'KGS ', KHR: 'KHR ', KMF: 'CF', KPW: '₩', KRW: '₩', KWD: 'KWD ',
  KYD: 'CI$', KZT: '₸', LAK: '₭', LBP: 'LBP ', LKR: 'Rs', LRD: 'L$', LSL: 'L', LYD: 'LYD ', MAD: 'MAD ', MDL: 'L',
  MGA: 'Ar', MKD: 'MKD ', MMK: 'K', MNT: '₮', MOP: 'MOP$', MRU: 'UM', MUR: '₨', MVR: 'Rf', MWK: 'MK', MXN: 'Mex$',
  MYR: 'RM', MZN: 'MT', NAD: 'N$', NGN: '₦', NIO: 'C$', NOK: 'kr', NPR: '₨', NZD: 'NZ$', OMR: 'OMR ', PAB: 'B/.',
  PEN: 'S/', PGK: 'K', PHP: '₱', PKR: '₨', PLN: 'zł', PYG: '₲', QAR: 'QAR ', RON: 'lei', RSD: 'RSD ', RUB: '₽',
  RWF: 'FRw', SAR: 'SAR ', SBD: 'SI$', SCR: '₨', SDG: 'SDG ', SEK: 'kr', SGD: 'S$', SHP: '£', SLE: 'Le', SOS: 'S',
  SRD: '$', SSP: '£', STN: 'Db', SVC: '$', SYP: '£', SZL: 'E', THB: '฿', TJS: 'SM', TMT: 'm', TND: 'TND ',
  TOP: 'T$', TRY: '₺', TTD: 'TT$', TWD: 'NT$', TZS: 'TSh', UAH: '₴', UGX: 'USh', USD: '$', UYU: '$U', UZS: 'UZS ',
  VES: 'Bs.S', VND: '₫', VUV: 'VT', WST: 'WS$', XAF: 'FCFA ', XCD: 'EC$', XCG: 'Cg.', XOF: 'CFA ', XPF: '₣',
  YER: 'YER ', ZAR: 'R', ZMW: 'ZK', ZWG: 'ZWG ',
};

const CURRENCY_MINOR_UNITS: Record<string, number> = {
  BHD: 3, IQD: 3, JOD: 3, KWD: 3, LYD: 3, OMR: 3, TND: 3,
  BIF: 0, CLP: 0, DJF: 0, GNF: 0, ISK: 0, JPY: 0, KMF: 0, KRW: 0, PYG: 0, RWF: 0, UGX: 0, VND: 0, VUV: 0, XAF: 0, XOF: 0, XPF: 0,
};

export const WORLD_CURRENCIES: CurrencyItem[] = ISO_ACTIVE_CURRENCIES.map((code) => ({
  code,
  symbol: CURRENCY_SYMBOLS[code] ?? `${code} `,
  name: CURRENCY_NAMES[code] ?? code,
  minorUnit: CURRENCY_MINOR_UNITS[code] ?? 2,
})).sort((a, b) => a.name.localeCompare(b.name));

/* =========================================================================
   3. VALIDATION & SANITIZATION HELPERS
   ========================================================================= */

export function parseCleanNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (typeof value !== 'string') return NaN;
  const trimmed = value.trim();
  if (trimmed === '') return NaN;
  const cleaned = trimmed.replace(/[$€£¥₹\s,]/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

export function safeNumber(value: unknown, fallback = 0, min = 0, max = Infinity): number {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || isNaN(value)) return fallback;
    return Math.min(max, Math.max(min, value));
  }
  const parsed = parseCleanNumber(value);
  if (isNaN(parsed) || !Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function validateLoanParams(params: Partial<LoanParams>): LoanParams {
  const principal = safeNumber(params.principal, 0, 0, 100000000);
  const annualRate = safeNumber(params.annualRate, 0, 0, 100);
  const years = safeNumber(params.years, 0, 0, 50);
  const frequency: PaymentFrequency =
    params.frequency === 'weekly' || params.frequency === 'biweekly'
      ? params.frequency
      : 'monthly';
  const timing: PaymentTiming = params.timing === 'beginning' ? 'beginning' : 'end';
  const extraPayment = safeNumber(params.extraPayment, 0, 0, 100000000);
  const oneTimePrepayment = safeNumber(params.oneTimePrepayment, 0, 0, 100000000);
  const prepaymentPeriod = safeNumber(params.prepaymentPeriod, 1, 1, 1200);
  const prepaymentMode: PrepaymentMode =
    params.prepaymentMode === 'payment' || params.prepaymentMode === 'immediate'
      ? params.prepaymentMode
      : 'term';
  const originationFee = safeNumber(params.originationFee, 0, 0, 100000000);
  const recurringFee = safeNumber(params.recurringFee, 0, 0, 100000000);

  return {
    principal,
    annualRate,
    years,
    frequency,
    timing,
    extraPayment,
    oneTimePrepayment,
    prepaymentPeriod,
    prepaymentMode,
    originationFee,
    recurringFee,
  };
}

/* =========================================================================
   4. PURE FINANCIAL ENGINE (Deterministic Calculations)
   ========================================================================= */

export function getPeriodsPerYear(frequency: PaymentFrequency): number {
  switch (frequency) {
    case 'weekly':
      return 52;
    case 'biweekly':
      return 26;
    case 'monthly':
    default:
      return 12;
  }
}

export function calculatePeriodicRate(annualRatePercent: number, frequency: PaymentFrequency): number {
  const m = getPeriodsPerYear(frequency);
  return (Math.max(0, annualRatePercent) / 100) / m;
}

/**
 * Calculates standard amortizing periodic loan payment.
 * Supports Ordinary Annuity (end of period) and Annuity Due (beginning of period).
 * Guaranteed numerical stability for 0% and sub-basis-point interest rates.
 */
export function calculateScheduledPayment(
  principal: number,
  periodicRate: number,
  numberOfPeriods: number,
  timing: PaymentTiming = 'end'
): number {
  if (principal <= 0 || numberOfPeriods <= 0) return 0;
  if (periodicRate <= 1e-12) {
    return principal / numberOfPeriods;
  }
  const factor = Math.pow(1 + periodicRate, numberOfPeriods);
  if (!Number.isFinite(factor) || factor <= 1) {
    const ordinaryPayment = principal * periodicRate;
    return timing === 'beginning' ? ordinaryPayment / (1 + periodicRate) : ordinaryPayment;
  }
  const ordinaryPayment = (principal * periodicRate * factor) / (factor - 1);
  return timing === 'beginning' ? ordinaryPayment / (1 + periodicRate) : ordinaryPayment;
}

/**
 * Canonical Amortization Schedule Generator.
 * Serves as the single source of truth for payments, interest, balances, and fees.
 */
export function generateAmortizationSchedule(params: LoanParams): {
  schedule: ScheduleRow[];
  totalPrincipal: number;
  totalInterest: number;
  originationFee: number;
  totalRecurringFees: number;
  totalFees: number;
  totalPaid: number;
  totalCost: number;
  payoffPeriods: number;
  scheduledPayment: number;
  requestedPrepayment: number;
  appliedPrepayment: number;
  unappliedPrepayment: number;
  isPrepaymentPastPayoff: boolean;
} {
  const P = Math.max(0, params.principal);
  const years = Math.max(0, params.years);
  const m = getPeriodsPerYear(params.frequency);
  const totalScheduledPeriods = Math.max(0, Math.round(years * m));
  const r = calculatePeriodicRate(params.annualRate, params.frequency);
  const timing = params.timing || 'end';
  const extra = Math.max(0, params.extraPayment || 0);
  const prepayment = Math.max(0, params.oneTimePrepayment || 0);
  const prepPeriod = Math.max(1, Math.round(params.prepaymentPeriod || 1));
  const prepMode = params.prepaymentMode || 'term';
  const originationFee = Math.max(0, params.originationFee || 0);
  const recurringFee = Math.max(0, params.recurringFee || 0);

  const requestedPrepayment = prepayment;

  if (P <= 0 || totalScheduledPeriods <= 0) {
    return {
      schedule: [],
      totalPrincipal: 0,
      totalInterest: 0,
      originationFee,
      totalRecurringFees: 0,
      totalFees: originationFee,
      totalPaid: originationFee,
      totalCost: originationFee,
      payoffPeriods: 0,
      scheduledPayment: 0,
      requestedPrepayment: 0,
      appliedPrepayment: 0,
      unappliedPrepayment: 0,
      isPrepaymentPastPayoff: false,
    };
  }

  // Handle immediate prepayment mode (applied at inception before amortization)
  let balance = P;
  let initialPrepaymentApplied = 0;
  if (prepMode === 'immediate' && prepayment > 0) {
    initialPrepaymentApplied = Math.min(balance, prepayment);
    balance -= initialPrepaymentApplied;
  }

  const scheduledPayment = calculateScheduledPayment(balance, r, totalScheduledPeriods, timing);
  let currentScheduledPayment = scheduledPayment;

  const schedule: ScheduleRow[] = [];
  let totalInterest = 0;
  let totalPrincipal = initialPrepaymentApplied;
  let totalRecurringFees = 0;
  let appliedPrepayment = initialPrepaymentApplied;
  let period = 0;
  const EPSILON = 1e-7;
  const maxPeriods = totalScheduledPeriods + 600;

  while (balance > EPSILON && period < maxPeriods) {
    period += 1;
    const openingBalance = balance;

    // Check if one-time prepayment occurs in this period
    let currentPeriodPrepayment = 0;
    if (prepMode !== 'immediate' && prepayment > 0 && period === prepPeriod) {
      currentPeriodPrepayment = Math.min(balance, prepayment);
      appliedPrepayment += currentPeriodPrepayment;
    }

    // Determine interest accrued for this period
    let interestPaid = 0;
    if (timing === 'beginning') {
      // In Annuity Due, payment 1 is made at t=0 before interest accrues.
      // Subsequent payments cover interest accrued on previous period's closing balance.
      interestPaid = period === 1 ? 0 : openingBalance * r;
    } else {
      // In Ordinary Annuity (End of Period), interest is calculated on opening balance.
      interestPaid = r <= 1e-12 ? 0 : openingBalance * r;
    }

    // Planned regular principal portion
    const plannedRegularPrincipal = Math.max(0, currentScheduledPayment - interestPaid);

    // Total planned principal reduction
    const plannedPrincipal = plannedRegularPrincipal + extra + currentPeriodPrepayment;

    let payment = 0;
    let actualPrincipalPaid = 0;
    let actualExtraPaid = 0;

    if (plannedPrincipal >= openingBalance - EPSILON) {
      // Final payoff reconciliation: cap principal paid at exact remaining balance
      actualPrincipalPaid = openingBalance;
      balance = 0;
      payment = actualPrincipalPaid + interestPaid;
      actualExtraPaid = Math.max(0, actualPrincipalPaid - plannedRegularPrincipal);
    } else {
      actualPrincipalPaid = plannedPrincipal;
      balance = openingBalance - actualPrincipalPaid;
      payment = currentScheduledPayment + extra + currentPeriodPrepayment;
      actualExtraPaid = extra + currentPeriodPrepayment;
    }

    // Handle re-cast mode after one-time prepayment (re-amortize over remaining periods)
    if (prepMode === 'payment' && currentPeriodPrepayment > 0 && balance > EPSILON) {
      const remainingPeriods = Math.max(1, totalScheduledPeriods - period);
      currentScheduledPayment = calculateScheduledPayment(balance, r, remainingPeriods, timing);
    }

    // Numerical hygiene: if residual balance is less than epsilon, close strictly to 0
    if (balance <= EPSILON) {
      balance = 0;
    }

    totalInterest += interestPaid;
    totalPrincipal += actualPrincipalPaid;
    totalRecurringFees += recurringFee;

    schedule.push({
      period,
      openingBalance,
      scheduledPayment: currentScheduledPayment,
      extraPayment: actualExtraPaid,
      totalPayment: payment,
      principalPaid: actualPrincipalPaid,
      interestPaid,
      feePaid: recurringFee,
      closingBalance: Math.max(0, balance),
    });

    if (balance <= EPSILON) break;
  }

  // Ensure totalPrincipal strictly conserves P when loan is fully paid
  if (balance <= EPSILON) {
    totalPrincipal = P;
  }

  const unappliedPrepayment = Math.max(0, requestedPrepayment - appliedPrepayment);
  const isPrepaymentPastPayoff =
    requestedPrepayment > 0 && prepMode !== 'immediate' && prepPeriod > schedule.length;

  const totalFees = originationFee + totalRecurringFees;
  const totalPaid = totalPrincipal + totalInterest + totalFees;
  const totalCost = totalPaid;

  return {
    schedule,
    totalPrincipal,
    totalInterest,
    originationFee,
    totalRecurringFees,
    totalFees,
    totalPaid,
    totalCost,
    payoffPeriods: schedule.length,
    scheduledPayment,
    requestedPrepayment,
    appliedPrepayment,
    unappliedPrepayment,
    isPrepaymentPastPayoff,
  };
}

/**
 * Aggregates detailed schedule into yearly summary rows.
 * Reconciles 100% with the period-by-period schedule and loan fees.
 */
export function generateYearlySummary(
  schedule: ScheduleRow[],
  frequency: PaymentFrequency,
  originationFee = 0
): YearlySummaryRow[] {
  if (!schedule.length) return [];
  const m = getPeriodsPerYear(frequency);
  const maxPeriod = schedule[schedule.length - 1].period;
  const totalYears = Math.ceil(maxPeriod / m);

  const yearlySummary: YearlySummaryRow[] = [];

  for (let y = 1; y <= totalYears; y++) {
    const yrRows = schedule.filter((row) => Math.ceil(row.period / m) === y);
    if (!yrRows.length) break;

    const openingBalance = yrRows[0].openingBalance;
    const closingBalance = yrRows[yrRows.length - 1].closingBalance;
    const totalScheduled = yrRows.reduce((acc, row) => acc + row.scheduledPayment, 0);
    const totalExtra = yrRows.reduce((acc, row) => acc + row.extraPayment, 0);
    const totalPrincipal = yrRows.reduce((acc, row) => acc + row.principalPaid, 0);
    const totalInterest = yrRows.reduce((acc, row) => acc + row.interestPaid, 0);
    const totalRecurringFees = yrRows.reduce((acc, row) => acc + row.feePaid, 0);
    const totalFees = totalRecurringFees + (y === 1 ? originationFee : 0);

    yearlySummary.push({
      year: y,
      openingBalance,
      totalScheduled,
      totalExtra,
      totalPrincipal,
      totalInterest,
      totalFees,
      closingBalance,
    });
  }

  return yearlySummary;
}

/**
 * Executes canonical loan calculation and returns full structured result.
 */
export function calculateLoan(rawParams: Partial<LoanParams>): LoanCalculationResult {
  const params = validateLoanParams(rawParams);
  const {
    schedule,
    totalPrincipal,
    totalInterest,
    originationFee,
    totalRecurringFees,
    totalFees,
    totalPaid,
    totalCost,
    payoffPeriods,
    scheduledPayment,
    requestedPrepayment,
    appliedPrepayment,
    unappliedPrepayment,
    isPrepaymentPastPayoff,
  } = generateAmortizationSchedule(params);

  const m = getPeriodsPerYear(params.frequency);
  const payoffYears = payoffPeriods > 0 ? payoffPeriods / m : 0;
  const yearlySummary = generateYearlySummary(schedule, params.frequency, originationFee);

  const principalPercent = totalCost > 0 ? (totalPrincipal / totalCost) * 100 : 0;
  const interestPercent = totalCost > 0 ? (totalInterest / totalCost) * 100 : 0;
  const feePercent = totalCost > 0 ? (totalFees / totalCost) * 100 : 0;

  return {
    scheduledPayment,
    totalPrincipal,
    totalInterest,
    originationFee,
    totalRecurringFees,
    totalFees,
    totalPaid,
    totalCost,
    payoffPeriods,
    payoffYears,
    requestedPrepayment,
    appliedPrepayment,
    unappliedPrepayment,
    isPrepaymentPastPayoff,
    schedule,
    yearlySummary,
    principalPercent,
    interestPercent,
    feePercent,
  };
}

/**
 * Compares Base Scenario vs Accelerated Scenario.
 */
export function compareScenarios(
  baseResult: LoanCalculationResult,
  acceleratedResult: LoanCalculationResult,
  frequency: PaymentFrequency
): ComparisonResult {
  const interestSaved = Math.max(0, baseResult.totalInterest - acceleratedResult.totalInterest);
  const periodsSaved = Math.max(0, baseResult.payoffPeriods - acceleratedResult.payoffPeriods);
  const totalCostSaved = Math.max(0, baseResult.totalCost - acceleratedResult.totalCost);

  const m = getPeriodsPerYear(frequency);
  const yearsSaved = Math.floor(periodsSaved / m);
  const remainingPeriods = periodsSaved % m;
  const monthsSaved =
    frequency === 'monthly'
      ? remainingPeriods
      : Math.round((remainingPeriods / m) * 12);

  const isAccelerated = interestSaved > 0 || periodsSaved > 0 || totalCostSaved > 0;

  return {
    interestSaved,
    periodsSaved,
    yearsSaved,
    monthsSaved,
    totalCostSaved,
    isAccelerated,
  };
}

/* =========================================================================
   5. FORMATTING HELPERS
   ========================================================================= */

export function formatCurrencyAmount(
  value: number,
  currency: CurrencyItem,
  showSymbol = false
): string {
  if (!Number.isFinite(value)) return '0.00';
  const locale = currency.code === 'INR' ? 'en-IN' : undefined;
  const formatted = value.toLocaleString(locale, {
    minimumFractionDigits: currency.minorUnit,
    maximumFractionDigits: currency.minorUnit,
  });
  return showSymbol ? `${currency.symbol}${formatted}` : formatted;
}

export function formatDuration(periods: number, frequency: PaymentFrequency): string {
  if (periods <= 0) return '0 periods';
  const m = getPeriodsPerYear(frequency);
  const years = Math.floor(periods / m);
  const remPeriods = periods % m;

  if (frequency === 'monthly') {
    if (years === 0) return `${remPeriods} mo${remPeriods === 1 ? '' : 's'}`;
    if (remPeriods === 0) return `${years} yr${years === 1 ? '' : 's'}`;
    return `${years} yr${years === 1 ? '' : 's'} ${remPeriods} mo${remPeriods === 1 ? '' : 's'}`;
  }

  if (years === 0) return `${remPeriods} ${frequency} payments`;
  if (remPeriods === 0) return `${years} yr${years === 1 ? '' : 's'}`;
  return `${years} yr${years === 1 ? '' : 's'} (${periods} payments)`;
}

/* =========================================================================
   6. URL SERIALIZATION & DESERIALIZATION
   ========================================================================= */

export function serializeLoanUrl(params: LoanParams, currencyCode: string): string {
  const q = new URLSearchParams({
    currency: currencyCode,
    principal: String(params.principal),
    rate: String(params.annualRate),
    years: String(params.years),
    frequency: params.frequency,
    timing: params.timing,
    extra: String(params.extraPayment),
    prepayment: String(params.oneTimePrepayment),
    prepaymentPeriod: String(params.prepaymentPeriod),
    prepaymentMode: params.prepaymentMode,
    originationFee: String(params.originationFee),
    recurringFee: String(params.recurringFee),
  });
  return q.toString();
}

export function deserializeLoanUrl(
  search: string,
  currencies: CurrencyItem[]
): { params: LoanParams; currency: CurrencyItem; showAdvanced: boolean; hasSharedState: boolean } {
  const p = new URLSearchParams(search);

  // Check if intentional shared state is present in the query string
  const hasSharedState =
    p.has('principal') ||
    p.has('p') ||
    p.has('rate') ||
    p.has('r') ||
    p.has('years') ||
    p.has('y');

  const curCode = (p.get('currency') || 'USD').toUpperCase().trim();
  const matchedCurrency = currencies.find((c) => c.code === curCode) || currencies[0];

  if (!hasSharedState) {
    return {
      params: {
        principal: 0,
        annualRate: 0,
        years: 0,
        frequency: 'monthly',
        timing: 'end',
        extraPayment: 0,
        oneTimePrepayment: 0,
        prepaymentPeriod: 12,
        prepaymentMode: 'term',
        originationFee: 0,
        recurringFee: 0,
      },
      currency: matchedCurrency,
      showAdvanced: false,
      hasSharedState: false,
    };
  }

  const parseNum = (keys: string[], def: number, min = 0, max = Infinity) => {
    let raw: string | null = null;
    for (const key of keys) {
      if (p.has(key)) {
        raw = p.get(key);
        break;
      }
    }
    if (raw === null) return def;
    const n = Number(raw);
    return Number.isFinite(n) && n >= min && n <= max ? n : def;
  };

  const rawFreq = p.get('frequency') || p.get('freq');
  const frequency: PaymentFrequency =
    rawFreq === 'weekly' || rawFreq === 'biweekly' ? rawFreq : 'monthly';

  const rawTiming = p.get('timing');
  const timing: PaymentTiming = rawTiming === 'beginning' ? 'beginning' : 'end';

  const rawMode = p.get('prepaymentMode') || p.get('mode');
  const prepaymentMode: PrepaymentMode =
    rawMode === 'payment' || rawMode === 'immediate' ? rawMode : 'term';

  const principal = parseNum(['principal', 'p'], 0, 0, 100000000);
  const annualRate = parseNum(['rate', 'r'], 0, 0, 100);
  const years = parseNum(['years', 'y'], 0, 0, 50);
  const extraPayment = parseNum(['extra', 'e'], 0, 0, 100000000);
  const oneTimePrepayment = parseNum(['prepayment', 'prep'], 0, 0, 100000000);
  const prepaymentPeriod = parseNum(['prepaymentPeriod', 'pp'], 1, 1, 1200);
  const originationFee = parseNum(['originationFee', 'origFee'], 0, 0, 100000000);
  const recurringFee = parseNum(['recurringFee', 'recFee'], 0, 0, 100000000);

  const showAdvanced =
    extraPayment > 0 ||
    oneTimePrepayment > 0 ||
    originationFee > 0 ||
    recurringFee > 0 ||
    frequency !== 'monthly' ||
    timing !== 'end';

  return {
    params: {
      principal,
      annualRate,
      years,
      frequency,
      timing,
      extraPayment,
      oneTimePrepayment,
      prepaymentPeriod,
      prepaymentMode,
      originationFee,
      recurringFee,
    },
    currency: matchedCurrency,
    showAdvanced,
    hasSharedState: true,
  };
}

/* =========================================================================
   7. CSV EXPORT GENERATOR
   ========================================================================= */

export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  let str = String(value);
  // Formula injection defense: prepend single quote if cell starts with dangerous symbols
  if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
    str = `'${str}`;
  }
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCsvExport(
  result: LoanCalculationResult,
  params: LoanParams,
  currency: CurrencyItem
): string {
  const metadata = [
    `# ============================================================`,
    `# EMI & Loan Amortization Schedule Export`,
    `# Generated: ${new Date().toISOString()}`,
    `# Currency: ${currency.name} (${currency.code})`,
    `# Principal Amount: ${params.principal}`,
    `# Annual Interest Rate: ${params.annualRate}% (Nominal annual rate used for periodic amortization)`,
    `# Loan Tenure: ${params.years} Years`,
    `# Payment Frequency: ${params.frequency} (${getPeriodsPerYear(params.frequency)} periods/year)`,
    `# Payment Timing: ${params.timing === 'beginning' ? 'Beginning of Period (In Advance)' : 'End of Period (In Arrears)'}`,
    `# Extra Recurring Payment: ${params.extraPayment}`,
    `# One-Time Prepayment: ${params.oneTimePrepayment} (Period ${params.prepaymentPeriod}, Mode: ${params.prepaymentMode})`,
    `# Prepayment Status: Requested=${result.requestedPrepayment}, Applied=${result.appliedPrepayment}, Unapplied=${result.unappliedPrepayment}`,
    `# One-Time Origination Fee: ${params.originationFee.toFixed(currency.minorUnit)}`,
    `# Periodic Recurring Fee: ${params.recurringFee.toFixed(currency.minorUnit)}`,
    `# Scheduled Periodic Payment: ${result.scheduledPayment.toFixed(currency.minorUnit)}`,
    `# Total Principal Paid: ${result.totalPrincipal.toFixed(currency.minorUnit)}`,
    `# Total Interest Paid: ${result.totalInterest.toFixed(currency.minorUnit)}`,
    `# Total One-Time Fees: ${result.originationFee.toFixed(currency.minorUnit)}`,
    `# Total Recurring Fees: ${result.totalRecurringFees.toFixed(currency.minorUnit)}`,
    `# Total Fees Paid: ${result.totalFees.toFixed(currency.minorUnit)}`,
    `# Total Loan Cost (Total Cash Paid): ${result.totalCost.toFixed(currency.minorUnit)}`,
    `# Reconciliation: Principal + Interest + Fees = Total Cash Paid (${result.totalCost.toFixed(currency.minorUnit)})`,
    `# Total Payoff Periods: ${result.payoffPeriods}`,
    `# ============================================================`,
  ];

  const headers = [
    'Period',
    'Opening Balance',
    'Scheduled Payment',
    'Extra Payment',
    'Total Payment',
    'Principal Paid',
    'Interest Paid',
    'Fee Paid',
    'Closing Balance',
  ];

  const rows = result.schedule.map((r) => [
    escapeCsvCell(r.period),
    escapeCsvCell(r.openingBalance.toFixed(currency.minorUnit)),
    escapeCsvCell(r.scheduledPayment.toFixed(currency.minorUnit)),
    escapeCsvCell(r.extraPayment.toFixed(currency.minorUnit)),
    escapeCsvCell(r.totalPayment.toFixed(currency.minorUnit)),
    escapeCsvCell(r.principalPaid.toFixed(currency.minorUnit)),
    escapeCsvCell(r.interestPaid.toFixed(currency.minorUnit)),
    escapeCsvCell(r.feePaid.toFixed(currency.minorUnit)),
    escapeCsvCell(r.closingBalance.toFixed(currency.minorUnit)),
  ]);

  return [
    ...metadata,
    headers.map(escapeCsvCell).join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');
}