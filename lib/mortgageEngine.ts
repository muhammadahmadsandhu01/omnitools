/**
 * OmniTools Mortgage & Financial Amortization Engine
 *
 * Deterministic mathematical calculation engine for conventional fixed-rate mortgages,
 * PITI escrow obligations, dynamic PMI drop-off, biweekly compounding, prepayments,
 * and multi-currency formatting.
 */

export type Currency = {
  code: string;
  name: string;
  minorUnit: number;
};

export type Frequency = 'monthly' | 'biweekly';
export type ScheduleView = 'yearly' | 'monthly';
export type PrepayTiming = 'origination' | 'period';

export type ScheduleRow = {
  period: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  pmi: number;
  extra: number;
  balance: number;
};

export type CalculationInputs = {
  price: number;
  down: number;
  rate: number;
  years: number;
  tax: number;
  insurance: number;
  hoa: number;
  pmiRate: number;
  pmiLtv: number;
  closingPct: number;
  points: number;
  lenderFees: number;
  frequency: Frequency;
  extra: number;
  prepay: number;
  prepayTiming: PrepayTiming;
  prepayPeriod: number;
  currency: Currency;
};

export type MortgageModelResult = {
  price: number;
  down: number;
  loan: number;
  scheduled: number;
  monthlyBase: number;
  tax: number;
  insurance: number;
  hoa: number;
  closing: number;
  points: number;
  upfrontFees: number;
  cashToClose: number;
  monthly: number;
  initialPmiMonthly: number;
  initialPmiPeriod: number;
  interestTotal: number;
  principalTotal: number;
  pmiTotal: number;
  extraTotal: number;
  totalTax: number;
  totalInsurance: number;
  totalHoa: number;
  totalCost: number;
  payoffPeriods: number;
  payoffYears: number;
  appliedPrepayAtOrigination: number;
  unappliedPrepayment: number;
  rows: ScheduleRow[];
};

export type PresetScenario = {
  id: string;
  label: string;
  description: string;
  values: {
    homePrice: string;
    downPayment: string;
    downPct: string;
    rate: string;
    term: string;
    tax: string;
    insurance: string;
    hoa: string;
    pmiRate: string;
    pmiLtv: string;
    closingPct: string;
    points: string;
    lenderFees: string;
    extra: string;
    prepay: string;
    prepayTiming: PrepayTiming;
    prepayPeriod: string;
    frequency: Frequency;
  };
};

/* Full active ISO-4217 world currency dataset */
export const CURRENCY_DATA: ReadonlyArray<readonly [string, string, number]> = [
  ['AED', 'UAE Dirham', 2], ['AFN', 'Afghani', 2], ['ALL', 'Lek', 2], ['AMD', 'Armenian Dram', 2], ['AOA', 'Kwanza', 2],
  ['ARS', 'Argentine Peso', 2], ['AUD', 'Australian Dollar', 2], ['AWG', 'Aruban Florin', 2], ['AZN', 'Azerbaijan Manat', 2],
  ['BAM', 'Convertible Mark', 2], ['BBD', 'Barbados Dollar', 2], ['BDT', 'Taka', 2], ['BHD', 'Bahraini Dinar', 3], ['BIF', 'Burundi Franc', 0],
  ['BMD', 'Bermudian Dollar', 2], ['BND', 'Brunei Dollar', 2], ['BOB', 'Boliviano', 2], ['BRL', 'Brazilian Real', 2], ['BSD', 'Bahamian Dollar', 2],
  ['BTN', 'Ngultrum', 2], ['BWP', 'Pula', 2], ['BYN', 'Belarusian Ruble', 2], ['BZD', 'Belize Dollar', 2], ['CAD', 'Canadian Dollar', 2],
  ['CDF', 'Congolese Franc', 2], ['CHF', 'Swiss Franc', 2], ['CLP', 'Chilean Peso', 0], ['CNY', 'Yuan Renminbi', 2], ['COP', 'Colombian Peso', 2],
  ['CRC', 'Costa Rican Colon', 2], ['CUP', 'Cuban Peso', 2], ['CVE', 'Cabo Verde Escudo', 2], ['CZK', 'Czech Koruna', 2], ['DJF', 'Djibouti Franc', 0],
  ['DKK', 'Danish Krone', 2], ['DOP', 'Dominican Peso', 2], ['DZD', 'Algerian Dinar', 2], ['EGP', 'Egyptian Pound', 2], ['ERN', 'Nakfa', 2],
  ['ETB', 'Ethiopian Birr', 2], ['EUR', 'Euro', 2], ['FJD', 'Fiji Dollar', 2], ['FKP', 'Falkland Islands Pound', 2], ['GBP', 'Pound Sterling', 2],
  ['GEL', 'Lari', 2], ['GHS', 'Ghana Cedi', 2], ['GIP', 'Gibraltar Pound', 2], ['GMD', 'Dalasi', 2], ['GNF', 'Guinean Franc', 0],
  ['GTQ', 'Quetzal', 2], ['GYD', 'Guyana Dollar', 2], ['HKD', 'Hong Kong Dollar', 2], ['HNL', 'Lempira', 2], ['HTG', 'Gourde', 2],
  ['HUF', 'Forint', 2], ['IDR', 'Rupiah', 2], ['ILS', 'New Israeli Sheqel', 2], ['INR', 'Indian Rupee', 2], ['IQD', 'Iraqi Dinar', 3],
  ['IRR', 'Iranian Rial', 2], ['ISK', 'Iceland Krona', 0], ['JMD', 'Jamaican Dollar', 2], ['JOD', 'Jordanian Dinar', 3], ['JPY', 'Yen', 0],
  ['KES', 'Kenyan Shilling', 2], ['KGS', 'Som', 2], ['KHR', 'Riel', 2], ['KMF', 'Comorian Franc', 0], ['KPW', 'North Korean Won', 2],
  ['KRW', 'Won', 0], ['KWD', 'Kuwaiti Dinar', 3], ['KYD', 'Cayman Islands Dollar', 2], ['KZT', 'Tenge', 2], ['LAK', 'Lao Kip', 2],
  ['LBP', 'Lebanese Pound', 2], ['LKR', 'Sri Lanka Rupee', 2], ['LRD', 'Liberian Dollar', 2], ['LSL', 'Loti', 2], ['LYD', 'Libyan Dinar', 3],
  ['MAD', 'Moroccan Dirham', 2], ['MDL', 'Moldovan Leu', 2], ['MGA', 'Malagasy Ariary', 2], ['MKD', 'Denar', 2], ['MMK', 'Kyat', 2],
  ['MNT', 'Tugrik', 2], ['MOP', 'Pataca', 2], ['MRU', 'Ouguiya', 2], ['MUR', 'Mauritius Rupee', 2], ['MVR', 'Rufiyaa', 2],
  ['MWK', 'Malawi Kwacha', 2], ['MXN', 'Mexican Peso', 2], ['MYR', 'Malaysian Ringgit', 2], ['MZN', 'Mozambique Metical', 2], ['NAD', 'Namibia Dollar', 2],
  ['NGN', 'Naira', 2], ['NIO', 'Cordoba Oro', 2], ['NOK', 'Norwegian Krone', 2], ['NPR', 'Nepalese Rupee', 2], ['NZD', 'New Zealand Dollar', 2],
  ['OMR', 'Rial Omani', 3], ['PAB', 'Balboa', 2], ['PEN', 'Sol', 2], ['PGK', 'Kina', 2], ['PHP', 'Philippine Peso', 2], ['PKR', 'Pakistan Rupee', 2],
  ['PLN', 'Zloty', 2], ['PYG', 'Guarani', 0], ['QAR', 'Qatari Rial', 2], ['RON', 'Romanian Leu', 2], ['RSD', 'Serbian Dinar', 2], ['RUB', 'Russian Ruble', 2],
  ['RWF', 'Rwanda Franc', 0], ['SAR', 'Saudi Riyal', 2], ['SBD', 'Solomon Islands Dollar', 2], ['SCR', 'Seychelles Rupee', 2], ['SDG', 'Sudanese Pound', 2],
  ['SEK', 'Swedish Krone', 2], ['SGD', 'Singapore Dollar', 2], ['SHP', 'Saint Helena Pound', 2], ['SLE', 'Leone', 2], ['SOS', 'Somali Shilling', 2],
  ['SRD', 'Surinamese Dollar', 2], ['SSP', 'South Sudanese Pound', 2], ['STN', 'Dobra', 2], ['SVC', 'El Salvador Colon', 2], ['SYP', 'Syrian Pound', 2],
  ['SZL', 'Lilangeni', 2], ['THB', 'Baht', 2], ['TJS', 'Somoni', 2], ['TMT', 'Turkmenistan Manat', 2], ['TND', 'Tunisian Dinar', 3],
  ['TOP', 'Pa’anga', 2], ['TRY', 'Turkish Lira', 2], ['TTD', 'Trinidad and Tobago Dollar', 2], ['TWD', 'New Taiwan Dollar', 2], ['TZS', 'Tanzanian Shilling', 2],
  ['UAH', 'Hryvnia', 2], ['UGX', 'Uganda Shilling', 0], ['USD', 'US Dollar', 2], ['UYU', 'Peso Uruguayo', 2], ['UZS', 'Uzbekistan Sum', 2],
  ['VES', 'Bolívar Soberano', 2], ['VND', 'Dong', 0], ['VUV', 'Vatu', 0], ['WST', 'Tala', 2], ['XAF', 'CFA Franc BEAC', 0], ['XCD', 'East Caribbean Dollar', 2],
  ['XCG', 'Caribbean Guilder', 2], ['XOF', 'CFA Franc BCEAO', 0], ['XPF', 'CFP Franc', 0], ['YER', 'Yemeni Rial', 2], ['ZAR', 'Rand', 2], ['ZMW', 'Zambian Kwacha', 2],
  ['ZWG', 'Zimbabwe Gold', 2],
];

export const WORLD_CURRENCIES: Currency[] = CURRENCY_DATA
  .map(([code, name, minorUnit]): Currency => ({ code, name, minorUnit }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const MORTGAGE_PRESETS: PresetScenario[] = [
  {
    id: 'conv-30yr',
    label: 'Conventional 30-Yr (20% Down)',
    description: '$400k home, 20% down payment ($80k), 6.5% interest rate, 30-year term with zero PMI.',
    values: {
      homePrice: '400000',
      downPayment: '80000',
      downPct: '20',
      rate: '6.5',
      term: '30',
      tax: '4800',
      insurance: '1440',
      hoa: '0',
      pmiRate: '0',
      pmiLtv: '80',
      closingPct: '2',
      points: '0',
      lenderFees: '1200',
      extra: '0',
      prepay: '0',
      prepayTiming: 'origination',
      prepayPeriod: '12',
      frequency: 'monthly',
    },
  },
  {
    id: 'fha-30yr',
    label: 'FHA 30-Yr (3.5% Down + PMI)',
    description: '$300k home, 3.5% down ($10.5k), 6.75% rate, 0.85% annual PMI with dynamic cancellation.',
    values: {
      homePrice: '300000',
      downPayment: '10500',
      downPct: '3.5',
      rate: '6.75',
      term: '30',
      tax: '3600',
      insurance: '1200',
      hoa: '50',
      pmiRate: '0.85',
      pmiLtv: '80',
      closingPct: '2.5',
      points: '0',
      lenderFees: '1500',
      extra: '0',
      prepay: '0',
      prepayTiming: 'origination',
      prepayPeriod: '12',
      frequency: 'monthly',
    },
  },
  {
    id: 'conv-15yr',
    label: '15-Yr Fixed Accelerated',
    description: '$400k home, 20% down ($80k), 5.75% interest rate, 15-year term saving substantial lifetime interest.',
    values: {
      homePrice: '400000',
      downPayment: '80000',
      downPct: '20',
      rate: '5.75',
      term: '15',
      tax: '4800',
      insurance: '1440',
      hoa: '0',
      pmiRate: '0',
      pmiLtv: '80',
      closingPct: '2',
      points: '0',
      lenderFees: '1200',
      extra: '0',
      prepay: '0',
      prepayTiming: 'origination',
      prepayPeriod: '12',
      frequency: 'monthly',
    },
  },
  {
    id: 'extra-payoff',
    label: 'Extra $200/Mo Payoff',
    description: '$350k home, 10% down ($35k), 6.5% rate, with $200/mo extra principal prepayment shortening the loan.',
    values: {
      homePrice: '350000',
      downPayment: '35000',
      downPct: '10',
      rate: '6.5',
      term: '30',
      tax: '4200',
      insurance: '1300',
      hoa: '0',
      pmiRate: '0.6',
      pmiLtv: '80',
      closingPct: '2',
      points: '0',
      lenderFees: '1200',
      extra: '200',
      prepay: '0',
      prepayTiming: 'origination',
      prepayPeriod: '12',
      frequency: 'monthly',
    },
  },
  {
    id: 'zero-down',
    label: 'Zero Down (100% Financed)',
    description: '$250k home, $0 down payment (VA/USDA style), 6.5% interest rate, 30-year term.',
    values: {
      homePrice: '250000',
      downPayment: '0',
      downPct: '0',
      rate: '6.5',
      term: '30',
      tax: '3000',
      insurance: '1000',
      hoa: '0',
      pmiRate: '0',
      pmiLtv: '80',
      closingPct: '2',
      points: '0',
      lenderFees: '1000',
      extra: '0',
      prepay: '0',
      prepayTiming: 'origination',
      prepayPeriod: '12',
      frequency: 'monthly',
    },
  },
];

export const toNumber = (v: number | string): number => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

/**
 * Money precision rounding helper strictly respecting currency minor units.
 * Number.EPSILON prevents JavaScript binary IEEE 754 floating-point edge rounding anomalies.
 */
export function roundMinor(amount: number, minorUnit: number): number {
  if (!Number.isFinite(amount)) return 0;
  const factor = 10 ** minorUnit;
  return Math.round((amount + Number.EPSILON) * factor) / factor;
}

/**
 * Closed-form periodic payment formula:
 * M = P * [ r * (1 + r)^n ] / [ (1 + r)^n - 1 ]
 *
 * For zero-interest loans: M = P / n (linear division)
 */
export function calculatePeriodicPayment(
  principal: number,
  annualRate: number,
  periods: number,
  paymentsPerYear: number,
  minorUnit: number,
): number {
  if (principal <= 0 || periods <= 0) return 0;
  if (annualRate <= 0) return roundMinor(principal / periods, minorUnit);
  const r = annualRate / 100 / paymentsPerYear;
  const factor = (1 + r) ** periods;
  // If factor calculation yields Infinity due to extreme periods/rates:
  if (!Number.isFinite(factor) || factor <= 1) {
    return roundMinor(principal * r, minorUnit);
  }
  const payment = principal * ((r * factor) / (factor - 1));
  return roundMinor(payment, minorUnit);
}

/**
 * Deterministic Financial Amortization Engine
 * Correctly models standard 15/30-year mortgages up to 100-year biweekly mortgages (2,600+ periods) without truncation.
 */
export function buildMortgageModel(inputs: CalculationInputs): MortgageModelResult {
  const minorUnit = inputs.currency?.minorUnit ?? 2;
  const price = Math.max(0, inputs.price);
  const down = Math.min(price, Math.max(0, inputs.down));
  const loan = roundMinor(Math.max(0, price - down), minorUnit);
  const paymentsPerYear = inputs.frequency === 'biweekly' ? 26 : 12;
  const periods = Math.max(1, Math.round(inputs.years * paymentsPerYear));

  let balance = loan;
  let appliedPrepayAtOrigination = 0;
  let unappliedPrepayment = 0;

  if (inputs.prepay > 0 && inputs.prepayTiming === 'origination') {
    appliedPrepayAtOrigination = roundMinor(Math.min(inputs.prepay, balance), minorUnit);
    unappliedPrepayment = roundMinor(Math.max(0, inputs.prepay - balance), minorUnit);
    balance = roundMinor(balance - appliedPrepayAtOrigination, minorUnit);
  }

  const scheduled = calculatePeriodicPayment(balance, inputs.rate, periods, paymentsPerYear, minorUnit);
  const extraPerPeriod = roundMinor((Math.max(0, inputs.extra) * 12) / paymentsPerYear, minorUnit);

  const tax = roundMinor(Math.max(0, inputs.tax) / 12, minorUnit);
  const insurance = roundMinor(Math.max(0, inputs.insurance) / 12, minorUnit);
  const hoa = roundMinor(Math.max(0, inputs.hoa), minorUnit);

  const closing = roundMinor((price * Math.max(0, inputs.closingPct)) / 100, minorUnit);
  const points = roundMinor((loan * Math.max(0, inputs.points)) / 100, minorUnit);
  const upfrontFees = roundMinor(Math.max(0, inputs.lenderFees), minorUnit);
  const cashToClose = roundMinor(down + closing + points + upfrontFees + appliedPrepayAtOrigination, minorUnit);

  let interestTotal = 0;
  let principalTotal = appliedPrepayAtOrigination;
  let pmiTotal = 0;
  let extraTotal = appliedPrepayAtOrigination;
  const rows: ScheduleRow[] = [];

  const originalLtv = price > 0 ? (loan / price) * 100 : 0;
  const pmiThreshold = clamp(inputs.pmiLtv, 0, 100);
  // Support 100-year biweekly loans (2,600 periods) with zero silent truncation.
  const maxPeriods = Math.max(3000, periods + 50);

  for (let period = 1; balance > 0 && period <= maxPeriods; period += 1) {
    const periodicRate = inputs.rate > 0 ? inputs.rate / 100 / paymentsPerYear : 0;
    const interest = roundMinor(balance * periodicRate, minorUnit);
    const amountDue = roundMinor(balance + interest, minorUnit);

    let scheduledPrincipal = 0;
    let extra = 0;
    let principal = 0;

    // Check if this is the final payoff period
    if (period >= periods || amountDue <= scheduled || balance <= roundMinor(scheduled - interest, minorUnit)) {
      principal = balance;
      scheduledPrincipal = balance;
      extra = 0;
    } else {
      scheduledPrincipal = roundMinor(Math.min(balance, Math.max(0, scheduled - interest)), minorUnit);
      const remainingAfterScheduled = roundMinor(balance - scheduledPrincipal, minorUnit);

      let periodExtra = extraPerPeriod;
      if (inputs.prepay > 0 && inputs.prepayTiming === 'period' && period === inputs.prepayPeriod) {
        periodExtra = roundMinor(periodExtra + inputs.prepay, minorUnit);
      }

      extra = roundMinor(Math.min(periodExtra, remainingAfterScheduled), minorUnit);
      principal = roundMinor(scheduledPrincipal + extra, minorUnit);
    }

    const nextBalance = roundMinor(Math.max(0, balance - principal), minorUnit);

    // Dynamic PMI calculation: cancels once balance amortizes down to specified LTV threshold
    const currentLtv = price > 0 ? (nextBalance / price) * 100 : 0;
    const pmiApplicable = originalLtv > 80 && currentLtv > pmiThreshold && nextBalance > 0;
    const pmi = pmiApplicable
      ? roundMinor(nextBalance * (Math.max(0, inputs.pmiRate) / 100 / paymentsPerYear), minorUnit)
      : 0;

    const payment = roundMinor(principal + interest + pmi, minorUnit);

    interestTotal = roundMinor(interestTotal + interest, minorUnit);
    principalTotal = roundMinor(principalTotal + principal, minorUnit);
    pmiTotal = roundMinor(pmiTotal + pmi, minorUnit);
    extraTotal = roundMinor(extraTotal + extra, minorUnit);

    rows.push({
      period,
      year: Math.ceil(period / paymentsPerYear),
      payment,
      principal,
      interest,
      pmi,
      extra,
      balance: nextBalance,
    });

    balance = nextBalance;
    if (balance <= 0) break;
  }

  const monthlyBase = inputs.frequency === 'biweekly' ? roundMinor((scheduled * 26) / 12, minorUnit) : scheduled;
  const initialPmiPeriod = rows[0]?.pmi ?? 0;
  const initialPmiMonthly = inputs.frequency === 'biweekly' ? roundMinor((initialPmiPeriod * 26) / 12, minorUnit) : initialPmiPeriod;
  const payoffPeriods = rows.length;
  const payoffYears = roundMinor(payoffPeriods / paymentsPerYear, 2);

  const monthsEquivalent = inputs.frequency === 'biweekly' ? (payoffPeriods * 12) / 26 : payoffPeriods;
  const totalTax = roundMinor(tax * monthsEquivalent, minorUnit);
  const totalInsurance = roundMinor(insurance * monthsEquivalent, minorUnit);
  const totalHoa = roundMinor(hoa * monthsEquivalent, minorUnit);

  const totalOutOfPocket = roundMinor(
    cashToClose + (principalTotal - appliedPrepayAtOrigination) + interestTotal + pmiTotal + totalTax + totalInsurance + totalHoa,
    minorUnit,
  );

  return {
    price,
    down,
    loan,
    scheduled,
    monthlyBase,
    tax,
    insurance,
    hoa,
    closing,
    points,
    upfrontFees,
    cashToClose,
    monthly: roundMinor(monthlyBase + tax + insurance + hoa + initialPmiMonthly, minorUnit),
    initialPmiMonthly,
    initialPmiPeriod,
    interestTotal,
    principalTotal,
    pmiTotal,
    extraTotal,
    totalTax,
    totalInsurance,
    totalHoa,
    totalCost: totalOutOfPocket,
    payoffPeriods,
    payoffYears,
    appliedPrepayAtOrigination,
    unappliedPrepayment,
    rows,
  };
}

/**
 * Aggregates periodic schedule into annual summaries.
 */
export function annualizeSchedule(rows: ScheduleRow[], minorUnit: number): ScheduleRow[] {
  const map = new Map<number, {
    payment: number;
    principal: number;
    interest: number;
    pmi: number;
    extra: number;
    balance: number;
  }>();

  for (const r of rows) {
    const cur = map.get(r.year) || { payment: 0, principal: 0, interest: 0, pmi: 0, extra: 0, balance: 0 };
    cur.payment = roundMinor(cur.payment + r.payment, minorUnit);
    cur.principal = roundMinor(cur.principal + r.principal, minorUnit);
    cur.interest = roundMinor(cur.interest + r.interest, minorUnit);
    cur.pmi = roundMinor(cur.pmi + r.pmi, minorUnit);
    cur.extra = roundMinor(cur.extra + r.extra, minorUnit);
    cur.balance = r.balance;
    map.set(r.year, cur);
  }

  const result: ScheduleRow[] = [];
  for (const [year, d] of map.entries()) {
    result.push({
      period: year,
      year,
      payment: d.payment,
      principal: d.principal,
      interest: d.interest,
      pmi: d.pmi,
      extra: d.extra,
      balance: d.balance,
    });
  }
  return result;
}

/**
 * RFC-4180 CSV escaping with spreadsheet formula injection protection.
 * Prepends a single quote to prevent DDE/formula execution in Excel/Calc if values start with '=', '+', '-', or '@'.
 */
export function escapeCsvValue(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export type MortgageCsvMeta = {
  currencyName: string;
  currencyCode: string;
  minorUnit: number;
  frequency: Frequency;
  price: number;
  down: number;
  downPct: number;
  loan: number;
  rate: number;
  term: number;
  cashToClose: number;
  interestTotal: number;
  pmiTotal: number;
  totalCost: number;
  scheduleView: ScheduleView;
};

/**
 * Generates an RFC-4180 compliant CSV text string for amortization schedules.
 */
export function generateMortgageCsv(rows: ScheduleRow[], meta: MortgageCsvMeta): string {
  const lines: string[] = [
    '\uFEFF# OmniTools Mortgage Amortization Schedule',
    `# Currency: ${meta.currencyName} (${meta.currencyCode})`,
    `# Payment Frequency: ${meta.frequency === 'biweekly' ? 'Biweekly (26/yr)' : 'Monthly (12/yr)'}`,
    `# Home Price: ${meta.price}`,
    `# Down Payment: ${meta.down} (${meta.downPct.toFixed(2)}%)`,
    `# Financed Loan Amount: ${meta.loan}`,
    `# Nominal Annual Rate: ${meta.rate}%`,
    `# Loan Term: ${meta.term} years`,
    `# Total Cash to Close: ${meta.cashToClose}`,
    `# Total Interest Paid: ${meta.interestTotal}`,
    `# Total PMI Paid: ${meta.pmiTotal}`,
    `# Lifetime Total Cash Outflow: ${meta.totalCost}`,
    '',
    [
      'Period',
      'Year',
      'Payment',
      'Principal',
      'Interest',
      'PMI',
      'Extra Principal',
      'Ending Balance',
    ].map(escapeCsvValue).join(','),
  ];

  for (const r of rows) {
    lines.push(
      [
        meta.scheduleView === 'yearly' ? `Year ${r.year}` : `Period ${r.period}`,
        r.year,
        r.payment.toFixed(meta.minorUnit),
        r.principal.toFixed(meta.minorUnit),
        r.interest.toFixed(meta.minorUnit),
        r.pmi.toFixed(meta.minorUnit),
        r.extra.toFixed(meta.minorUnit),
        r.balance.toFixed(meta.minorUnit),
      ].map(escapeCsvValue).join(','),
    );
  }

  return lines.join('\r\n');
}
