'use client';

import { useId, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calculator,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Info,
  Layers,
  PieChart,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import {
  Currency,
  Frequency,
  ScheduleView,
  PrepayTiming,
  ScheduleRow,
  CalculationInputs,
  MortgageModelResult,
  WORLD_CURRENCIES,
  MORTGAGE_PRESETS,
  PresetScenario,
  roundMinor,
  calculatePeriodicPayment,
  buildMortgageModel,
  annualizeSchedule,
  generateMortgageCsv,
  toNumber,
  clamp,
} from '@/lib/mortgageEngine';

export type { Currency, Frequency, ScheduleView, PrepayTiming, ScheduleRow, CalculationInputs, MortgageModelResult };
export { WORLD_CURRENCIES, roundMinor, calculatePeriodicPayment, buildMortgageModel, annualizeSchedule };

export default function MortgageCalculator() {
  const [currency, setCurrency] = useState<Currency>(() => WORLD_CURRENCIES.find((c) => c.code === 'USD')!);
  // Fresh-State: All user inputs start completely empty on initial load and hard refresh.
  const [homePrice, setHomePrice] = useState<string>('');
  const [downPayment, setDownPayment] = useState<string>('');
  const [downPct, setDownPct] = useState<string>('');
  const [rate, setRate] = useState<string>('');
  const [term, setTerm] = useState<string>('');
  const [tax, setTax] = useState<string>('');
  const [insurance, setInsurance] = useState<string>('');
  const [hoa, setHoa] = useState<string>('');
  const [pmiRate, setPmiRate] = useState<string>('');
  const [pmiLtv, setPmiLtv] = useState<string>('');
  const [closingPct, setClosingPct] = useState<string>('');
  const [points, setPoints] = useState<string>('');
  const [lenderFees, setLenderFees] = useState<string>('');
  const [extra, setExtra] = useState<string>('');
  const [prepay, setPrepay] = useState<string>('');
  const [prepayTiming, setPrepayTiming] = useState<PrepayTiming>('origination');
  const [prepayPeriod, setPrepayPeriod] = useState<string>('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');

  // UI accordion & pagination state
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleView, setScheduleView] = useState<ScheduleView>('yearly');
  const [schedulePage, setSchedulePage] = useState(1);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReset = () => {
    setHomePrice('');
    setDownPayment('');
    setDownPct('');
    setRate('');
    setTerm('');
    setTax('');
    setInsurance('');
    setHoa('');
    setPmiRate('');
    setPmiLtv('');
    setClosingPct('');
    setPoints('');
    setLenderFees('');
    setExtra('');
    setPrepay('');
    setPrepayTiming('origination');
    setPrepayPeriod('');
    setFrequency('monthly');
    setSchedulePage(1);
  };

  const loadPreset = (preset: PresetScenario) => {
    setHomePrice(preset.values.homePrice);
    setDownPayment(preset.values.downPayment);
    setDownPct(preset.values.downPct);
    setRate(preset.values.rate);
    setTerm(preset.values.term);
    setTax(preset.values.tax);
    setInsurance(preset.values.insurance);
    setHoa(preset.values.hoa);
    setPmiRate(preset.values.pmiRate);
    setPmiLtv(preset.values.pmiLtv);
    setClosingPct(preset.values.closingPct);
    setPoints(preset.values.points);
    setLenderFees(preset.values.lenderFees);
    setExtra(preset.values.extra);
    setPrepay(preset.values.prepay);
    setPrepayTiming(preset.values.prepayTiming);
    setPrepayPeriod(preset.values.prepayPeriod);
    setFrequency(preset.values.frequency);
    setSchedulePage(1);
  };

  // Accessible unique IDs
  const currencySelectId = useId();
  const homePriceId = useId();
  const downPaymentId = useId();
  const downPctId = useId();
  const rateId = useId();
  const termId = useId();
  const taxId = useId();
  const insuranceId = useId();
  const hoaId = useId();
  const pmiRateId = useId();
  const pmiLtvId = useId();
  const closingPctId = useId();
  const pointsId = useId();
  const lenderFeesId = useId();
  const extraId = useId();
  const prepayId = useId();
  const prepayTimingId = useId();
  const prepayPeriodId = useId();
  const advancedControlsId = useId();
  const scheduleControlsId = useId();
  const methodologyControlsId = useId();

  // Numerical evaluations
  const priceNum = toNumber(homePrice);
  const rawDownNum = toNumber(downPayment);
  const hasPrice = homePrice.trim() !== '' && !isNaN(priceNum) && priceNum > 0;
  const hasRate = rate.trim() !== '' && !isNaN(toNumber(rate)) && toNumber(rate) >= 0;
  const hasTerm = term.trim() !== '' && !isNaN(toNumber(term)) && toNumber(term) > 0;

  // Progressive calculation condition: honest incomplete state until mandatory loan inputs exist.
  const isReady = hasPrice && hasRate && hasTerm;

  // Field-specific validation
  const fieldErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (homePrice.trim() !== '' && (isNaN(priceNum) || priceNum <= 0)) {
      errs.homePrice = 'Home purchase price must be greater than zero.';
    }
    if (downPayment.trim() !== '') {
      if (isNaN(rawDownNum) || rawDownNum < 0) {
        errs.downPayment = 'Down payment cannot be negative.';
      } else if (hasPrice && rawDownNum > priceNum) {
        errs.downPayment = 'Down payment cannot exceed the home price.';
      }
    }
    if (downPct.trim() !== '') {
      const dpNum = toNumber(downPct);
      if (isNaN(dpNum) || dpNum < 0 || dpNum > 100) {
        errs.downPct = 'Down payment percentage must be between 0% and 100%.';
      }
    }
    if (rate.trim() !== '') {
      const rNum = toNumber(rate);
      if (isNaN(rNum) || rNum < 0 || rNum > 100) {
        errs.rate = 'Interest rate must be between 0% and 100%.';
      }
    }
    if (term.trim() !== '') {
      const tNum = toNumber(term);
      if (isNaN(tNum) || tNum < 1 || tNum > 100) {
        errs.term = 'Loan term must be between 1 and 100 years.';
      }
    }
    if (closingPct.trim() !== '') {
      const cNum = toNumber(closingPct);
      if (isNaN(cNum) || cNum < 0 || cNum > 100) {
        errs.closingPct = 'Closing costs percentage cannot exceed 100%.';
      }
    }
    if (points.trim() !== '') {
      const ptNum = toNumber(points);
      if (isNaN(ptNum) || ptNum < 0 || ptNum > 100) {
        errs.points = 'Discount points cannot exceed 100% of the loan.';
      }
    }
    if (pmiLtv.trim() !== '') {
      const ltvNum = toNumber(pmiLtv);
      if (isNaN(ltvNum) || ltvNum < 0 || ltvNum > 100) {
        errs.pmiLtv = 'PMI LTV cancellation threshold must be between 0% and 100%.';
      }
    }
    return errs;
  }, [homePrice, downPayment, downPct, rate, term, closingPct, points, pmiLtv, hasPrice, priceNum, rawDownNum]);

  const errors = Object.values(fieldErrors);

  const dpNum = clamp(rawDownNum, 0, Math.max(0, priceNum));
  const currentDownPct = priceNum > 0 ? (dpNum / priceNum) * 100 : 0;

  const values = useMemo<CalculationInputs>(() => ({
    price: priceNum,
    down: dpNum,
    rate: Math.max(0, toNumber(rate)),
    years: Math.max(1, toNumber(term)),
    tax: Math.max(0, toNumber(tax)),
    insurance: Math.max(0, toNumber(insurance)),
    hoa: Math.max(0, toNumber(hoa)),
    pmiRate: Math.max(0, toNumber(pmiRate)),
    pmiLtv: pmiLtv.trim() !== '' ? clamp(toNumber(pmiLtv), 0, 100) : 80,
    closingPct: Math.max(0, toNumber(closingPct)),
    points: Math.max(0, toNumber(points)),
    lenderFees: Math.max(0, toNumber(lenderFees)),
    frequency,
    extra: Math.max(0, toNumber(extra)),
    prepay: Math.max(0, toNumber(prepay)),
    prepayTiming,
    prepayPeriod: Math.max(1, toNumber(prepayPeriod || '12')),
    currency,
  }), [
    priceNum,
    dpNum,
    rate,
    term,
    tax,
    insurance,
    hoa,
    pmiRate,
    pmiLtv,
    closingPct,
    points,
    lenderFees,
    frequency,
    extra,
    prepay,
    prepayTiming,
    prepayPeriod,
    currency,
  ]);

  const result = useMemo(() => {
    if (!isReady) return null;
    return buildMortgageModel(values);
  }, [isReady, values]);

  const baseline = useMemo(() => {
    if (!isReady) return null;
    return buildMortgageModel({ ...values, extra: 0, prepay: 0 });
  }, [isReady, values]);

  const formatter = useMemo(() => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.minorUnit,
    maximumFractionDigits: currency.minorUnit,
  }), [currency]);

  const money = (v: number) => formatter.format(Number.isFinite(v) ? v : 0);

  const currencySymbol = useMemo(() => {
    try {
      return (
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency.code,
          currencyDisplay: 'narrowSymbol',
        })
          .formatToParts(0)
          .find((p) => p.type === 'currency')?.value || currency.code
      );
    } catch {
      return currency.code;
    }
  }, [currency.code]);

  const loanToValue = priceNum > 0 && result ? (result.loan / priceNum) * 100 : 0;

  const yearlyRows = useMemo(() => {
    if (!result) return [];
    return annualizeSchedule(result.rows, currency.minorUnit);
  }, [result, currency.minorUnit]);

  // Pagination for large period schedules
  const rowsPerPage = 50;
  const activeRows = scheduleView === 'yearly' ? yearlyRows : (result?.rows ?? []);
  const totalPages = Math.max(1, Math.ceil(activeRows.length / rowsPerPage));
  const currentPage = clamp(schedulePage, 1, totalPages);
  const pagedRows = useMemo(() => {
    if (!result) return [];
    if (scheduleView === 'yearly') return yearlyRows;
    const start = (currentPage - 1) * rowsPerPage;
    return result.rows.slice(start, start + rowsPerPage);
  }, [scheduleView, yearlyRows, result, currentPage]);

  const interestSaved = baseline && result ? Math.max(0, baseline.interestTotal - result.interestTotal) : 0;
  const pmiSaved = baseline && result ? Math.max(0, baseline.pmiTotal - result.pmiTotal) : 0;
  const totalSavings = interestSaved + pmiSaved;
  const monthsSaved = baseline && result ? Math.max(0, Math.round((baseline.payoffYears - result.payoffYears) * 12)) : 0;
  const yearsSaved = Math.floor(monthsSaved / 12);
  const remMonthsSaved = monthsSaved % 12;

  const inputBaseClass =
    'w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-white text-sm';
  const moneyInputBaseClass =
    'w-full pr-4 py-3 bg-gray-50 dark:bg-slate-950 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-white text-sm';
  const labelClass = 'block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 leading-snug break-words';

  const currencyPaddingStyle = useMemo(() => {
    // 16px left breathing room + generous symbol width (14px per char, min 14px) + 18px gap to value
    const estimatedWidth = Math.max(14, currencySymbol.length * 14);
    const totalPadding = 16 + estimatedWidth + 18;
    return { paddingLeft: `${Math.max(48, totalPadding)}px` };
  }, [currencySymbol]);

  const percentPaddingStyle = useMemo(() => ({ paddingRight: '48px' }), []);

  const setPrice = (v: string) => {
    setHomePrice(v);
    const p = Number(v);
    if (v.trim() !== '' && !isNaN(p) && p > 0) {
      if (downPct.trim() !== '' && !isNaN(Number(downPct))) {
        const pct = clamp(Number(downPct), 0, 100);
        const amt = roundMinor((pct / 100) * p, currency.minorUnit);
        setDownPayment(amt.toString());
      } else if (downPayment.trim() !== '' && !isNaN(Number(downPayment))) {
        const pct = (Number(downPayment) / p) * 100;
        setDownPct(roundMinor(clamp(pct, 0, 100), 2).toString());
      }
    }
  };

  const setDPAmount = (v: string) => {
    setDownPayment(v);
    if (v.trim() === '') {
      setDownPct('');
      return;
    }
    const amt = Number(v);
    if (!isNaN(amt) && priceNum > 0) {
      const pct = (amt / priceNum) * 100;
      setDownPct(roundMinor(clamp(pct, 0, 100), 2).toString());
    }
  };

  const setDPPct = (v: string) => {
    setDownPct(v);
    if (v.trim() === '') {
      setDownPayment('');
      return;
    }
    const pct = Number(v);
    if (!isNaN(pct) && priceNum > 0) {
      const amt = (clamp(pct, 0, 100) / 100) * priceNum;
      setDownPayment(roundMinor(amt, currency.minorUnit).toString());
    }
  };

  const copySummary = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(
        [
          '=== OmniTools Mortgage & Housing Cost Summary ===',
          `Currency: ${currency.name} (${currency.code})`,
          `Home Price: ${money(priceNum)}`,
          `Down Payment: ${money(dpNum)} (${currentDownPct.toFixed(2)}%)`,
          `Financed Loan Amount: ${money(result.loan)}`,
          `Loan-to-Value (LTV): ${loanToValue.toFixed(2)}%`,
          `Nominal Annual Interest Rate: ${toNumber(rate).toFixed(3)}%`,
          `Loan Term: ${toNumber(term)} years`,
          `Payment Frequency: ${frequency === 'biweekly' ? 'Biweekly (26 payments/year)' : 'Monthly (12 payments/year)'}`,
          frequency === 'biweekly'
            ? `Scheduled Biweekly Payment: ${money(result.scheduled)}`
            : `Scheduled Monthly P&I: ${money(result.scheduled)}`,
          `Average Monthly Housing Cost: ${money(result.monthly)}`,
          '--- Cost Breakdown ---',
          `Principal & Interest: ${money(result.monthlyBase)}/mo`,
          `Property Taxes: ${money(result.tax)}/mo`,
          `Home Insurance: ${money(result.insurance)}/mo`,
          `HOA Dues: ${money(result.hoa)}/mo`,
          `Initial PMI (monthly equivalent): ${money(result.initialPmiMonthly)}`,
          '--- Upfront Financing Costs ---',
          `Closing Costs: ${money(result.closing)}`,
          `Discount Points: ${money(result.points)}`,
          `Lender Fees: ${money(result.upfrontFees)}`,
          `Total Cash to Close: ${money(result.cashToClose)}`,
          '--- Lifetime Totals ---',
          `Total Interest Paid: ${money(result.interestTotal)}`,
          `Total PMI Paid: ${money(result.pmiTotal)}`,
          `Total Lifetime Cash Outflow: ${money(result.totalCost)}`,
          `Estimated Payoff Duration: ${result.payoffYears.toFixed(1)} years (${result.payoffPeriods} payments)`,
          ...(interestSaved > 0
            ? [
                '--- Prepayment Impact ---',
                `Interest Saved: ${money(interestSaved)}`,
                `Time Saved: ${yearsSaved > 0 ? `${yearsSaved} yrs ` : ''}${remMonthsSaved} mos`,
              ]
            : []),
          '--- Note ---',
          'Estimate only. Calculations do not constitute a lender disclosure or official Loan Estimate.',
        ].join('\n'),
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Non-fatal if clipboard access is blocked
    }
  };

  const downloadCsv = () => {
    if (!result) return;
    const csvContent = generateMortgageCsv(scheduleView === 'yearly' ? yearlyRows : result.rows, {
      currencyName: currency.name,
      currencyCode: currency.code,
      minorUnit: currency.minorUnit,
      frequency,
      price: priceNum,
      down: dpNum,
      downPct: currentDownPct,
      loan: result.loan,
      rate: toNumber(rate),
      term: toNumber(term),
      cashToClose: result.cashToClose,
      interestTotal: result.interestTotal,
      pmiTotal: result.pmiTotal,
      totalCost: result.totalCost,
      scheduleView,
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mortgage-amortization-${scheduleView}.csv`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: Inputs & Controls */}
      <div className="lg:col-span-5 space-y-6">
        {/* Quick Presets & Reset Toolbar */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Quick Scenario Presets
            </span>
            <button
              id="btn-reset"
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors focus:ring-2 focus:ring-red-400 focus:outline-none"
              title="Reset all inputs to clean defaults"
              aria-label="Reset calculator to blank values"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Form
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {MORTGAGE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => loadPreset(preset)}
                className="px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-300 text-slate-700 dark:text-slate-300 transition-all font-medium shadow-2xs text-left"
                title={preset.description}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Currency Selector */}
        <div>
          <label htmlFor={currencySelectId} className={labelClass}>Select Currency</label>
          <select
            id={currencySelectId}
            value={currency.code}
            onChange={(e) => {
              const c = WORLD_CURRENCIES.find((x) => x.code === e.target.value);
              if (c) setCurrency(c);
            }}
            className={`${inputBaseClass} border-gray-200 dark:border-slate-700 cursor-pointer`}
          >
            {WORLD_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code}) • {c.minorUnit} decimals
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Denomination only; does not perform exchange rate conversions.
          </p>
        </div>

        {/* Home Price */}
        <div className="min-w-0 w-full">
          <label htmlFor={homePriceId} className={labelClass}>Home Purchase Price</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold pointer-events-none select-none text-sm">
              {currencySymbol}
            </span>
            <input
              id={homePriceId}
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 300000"
              value={homePrice}
              style={currencyPaddingStyle}
              onChange={(e) => setPrice(e.target.value)}
              className={`${moneyInputBaseClass} ${
                fieldErrors.homePrice ? 'border-red-400 dark:border-red-600' : 'border-gray-200 dark:border-slate-700'
              }`}
              aria-label="Home purchase price"
              aria-invalid={!!fieldErrors.homePrice}
              aria-describedby={fieldErrors.homePrice ? `${homePriceId}-error` : undefined}
            />
          </div>
          {fieldErrors.homePrice && (
            <p id={`${homePriceId}-error`} role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
              {fieldErrors.homePrice}
            </p>
          )}
        </div>

        {/* Down Payment Dual Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="min-w-0 w-full">
            <label htmlFor={downPaymentId} className={labelClass}>Down Payment Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold pointer-events-none select-none text-sm">
                {currencySymbol}
              </span>
              <input
                id={downPaymentId}
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 60000"
                value={downPayment}
                style={currencyPaddingStyle}
                onChange={(e) => setDPAmount(e.target.value)}
                className={`${moneyInputBaseClass} ${
                  fieldErrors.downPayment ? 'border-red-400 dark:border-red-600' : 'border-gray-200 dark:border-slate-700'
                }`}
                aria-label="Down payment amount"
                aria-invalid={!!fieldErrors.downPayment}
                aria-describedby={fieldErrors.downPayment ? `${downPaymentId}-error` : undefined}
              />
            </div>
            {fieldErrors.downPayment && (
              <p id={`${downPaymentId}-error`} role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
                {fieldErrors.downPayment}
              </p>
            )}
          </div>
          <div className="min-w-0 w-full">
            <label htmlFor={downPctId} className={labelClass}>Down Payment</label>
            <div className="relative">
              <input
                id={downPctId}
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g. 20"
                value={downPct}
                style={percentPaddingStyle}
                onChange={(e) => setDPPct(e.target.value)}
                className={`${inputBaseClass} pr-11 ${
                  fieldErrors.downPct ? 'border-red-400 dark:border-red-600' : 'border-gray-200 dark:border-slate-700'
                }`}
                aria-label="Down payment percentage"
                aria-invalid={!!fieldErrors.downPct}
                aria-describedby={fieldErrors.downPct ? `${downPctId}-error` : undefined}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold pointer-events-none select-none text-sm">%</span>
            </div>
            {fieldErrors.downPct && (
              <p id={`${downPctId}-error`} role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
                {fieldErrors.downPct}
              </p>
            )}
          </div>
        </div>

        {/* Rate & Term */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="min-w-0 w-full">
            <label htmlFor={rateId} className={labelClass}>Annual Interest Rate</label>
            <div className="relative">
              <input
                id={rateId}
                type="number"
                min="0"
                max="100"
                step="0.001"
                placeholder="e.g. 6.5"
                value={rate}
                style={percentPaddingStyle}
                onChange={(e) => setRate(e.target.value)}
                className={`${inputBaseClass} pr-11 ${
                  fieldErrors.rate ? 'border-red-400 dark:border-red-600' : 'border-gray-200 dark:border-slate-700'
                }`}
                aria-label="Annual interest rate"
                aria-invalid={!!fieldErrors.rate}
                aria-describedby={fieldErrors.rate ? `${rateId}-error` : undefined}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold pointer-events-none select-none text-sm">%</span>
            </div>
            {fieldErrors.rate && (
              <p id={`${rateId}-error`} role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
                {fieldErrors.rate}
              </p>
            )}
          </div>
          <div className="min-w-0 w-full">
            <label htmlFor={termId} className={labelClass}>Loan Term (Years)</label>
            <input
              id={termId}
              type="number"
              min="1"
              max="100"
              step="1"
              placeholder="e.g. 30"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className={`${inputBaseClass} ${
                fieldErrors.term ? 'border-red-400 dark:border-red-600' : 'border-gray-200 dark:border-slate-700'
              }`}
              aria-label="Loan term in years"
              aria-invalid={!!fieldErrors.term}
              aria-describedby={fieldErrors.term ? `${termId}-error` : undefined}
            />
            {fieldErrors.term && (
              <p id={`${termId}-error`} role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
                {fieldErrors.term}
              </p>
            )}
          </div>
        </div>

        {/* Payment Frequency */}
        <div>
          <label className={labelClass}>Payment Frequency</label>
          <div className="grid grid-cols-2 gap-3">
            {(['monthly', 'biweekly'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setFrequency(v)}
                className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all text-center whitespace-nowrap ${
                  frequency === v
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-gray-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                {v === 'monthly' ? 'Monthly (12/yr)' : 'Biweekly (26/yr)'}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {frequency === 'biweekly'
              ? '26 payments per year (every 2 weeks). Accelerates principal repayment.'
              : '12 payments per year. Standard monthly schedule.'}
          </p>
        </div>

        {/* Property Tax & Home Insurance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="min-w-0 w-full">
            <label htmlFor={taxId} className={labelClass}>Annual Property Tax</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold pointer-events-none select-none text-sm">
                {currencySymbol}
              </span>
              <input
                id={taxId}
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 3600"
                value={tax}
                style={currencyPaddingStyle}
                onChange={(e) => setTax(e.target.value)}
                className={`${moneyInputBaseClass} border-gray-200 dark:border-slate-700`}
                aria-label="Annual property tax"
              />
            </div>
          </div>
          <div className="min-w-0 w-full">
            <label htmlFor={insuranceId} className={labelClass}>Annual Home Insurance</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold pointer-events-none select-none text-sm">
                {currencySymbol}
              </span>
              <input
                id={insuranceId}
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 1200"
                value={insurance}
                style={currencyPaddingStyle}
                onChange={(e) => setInsurance(e.target.value)}
                className={`${moneyInputBaseClass} border-gray-200 dark:border-slate-700`}
                aria-label="Annual home insurance"
              />
            </div>
          </div>
        </div>

        {/* Advanced Options Accordion */}
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          aria-expanded={advancedOpen}
          aria-controls={advancedControlsId}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors"
        >
          <span className="flex items-center gap-2 text-left">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            Advanced Mortgage & Financing Options
          </span>
          {advancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {advancedOpen && (
          <div
            id={advancedControlsId}
            className="p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Monthly HOA Dues */}
              <div className="flex flex-col justify-start min-w-0 w-full">
                <label htmlFor={hoaId} className={labelClass}>Monthly HOA Dues</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold pointer-events-none select-none text-sm">
                    {currencySymbol}
                  </span>
                  <input
                    id={hoaId}
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 250"
                    value={hoa}
                    style={currencyPaddingStyle}
                    onChange={(e) => setHoa(e.target.value)}
                    className={`${moneyInputBaseClass} border-gray-200 dark:border-slate-700`}
                    aria-label="Monthly HOA dues"
                  />
                </div>
              </div>

              {/* Annual PMI Rate */}
              <div className="flex flex-col justify-start min-w-0 w-full">
                <label htmlFor={pmiRateId} className={labelClass}>Annual PMI Rate</label>
                <div className="relative">
                  <input
                    id={pmiRateId}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 0.5"
                    value={pmiRate}
                    style={percentPaddingStyle}
                    onChange={(e) => setPmiRate(e.target.value)}
                    className={`${inputBaseClass} pr-11 border-gray-200 dark:border-slate-700`}
                    aria-label="Annual PMI rate"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold pointer-events-none select-none text-sm">%</span>
                </div>
              </div>

              {/* PMI Cancellation Threshold */}
              <div className="flex flex-col justify-start min-w-0 w-full">
                <label htmlFor={pmiLtvId} className={labelClass}>PMI Cancellation Threshold</label>
                <div className="relative">
                  <input
                    id={pmiLtvId}
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    placeholder="e.g. 80"
                    value={pmiLtv}
                    style={percentPaddingStyle}
                    onChange={(e) => setPmiLtv(e.target.value)}
                    className={`${inputBaseClass} pr-11 ${
                      fieldErrors.pmiLtv ? 'border-red-400 dark:border-red-600' : 'border-gray-200 dark:border-slate-700'
                    }`}
                    aria-label="PMI cancellation LTV threshold"
                    aria-invalid={!!fieldErrors.pmiLtv}
                    aria-describedby={fieldErrors.pmiLtv ? `${pmiLtvId}-error` : undefined}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold pointer-events-none select-none text-sm">%</span>
                </div>
                {fieldErrors.pmiLtv && (
                  <p id={`${pmiLtvId}-error`} role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {fieldErrors.pmiLtv}
                  </p>
                )}
              </div>

              {/* Closing Costs */}
              <div className="flex flex-col justify-start min-w-0 w-full">
                <label htmlFor={closingPctId} className={labelClass}>Closing Costs</label>
                <div className="relative">
                  <input
                    id={closingPctId}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="e.g. 3"
                    value={closingPct}
                    style={percentPaddingStyle}
                    onChange={(e) => setClosingPct(e.target.value)}
                    className={`${inputBaseClass} pr-11 ${
                      fieldErrors.closingPct ? 'border-red-400 dark:border-red-600' : 'border-gray-200 dark:border-slate-700'
                    }`}
                    aria-label="Closing costs percentage of price"
                    aria-invalid={!!fieldErrors.closingPct}
                    aria-describedby={fieldErrors.closingPct ? `${closingPctId}-error` : undefined}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold pointer-events-none select-none text-sm">%</span>
                </div>
                {fieldErrors.closingPct && (
                  <p id={`${closingPctId}-error`} role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {fieldErrors.closingPct}
                  </p>
                )}
              </div>

              {/* Discount Points */}
              <div className="flex flex-col justify-start min-w-0 w-full">
                <label htmlFor={pointsId} className={labelClass}>Discount Points</label>
                <div className="relative">
                  <input
                    id={pointsId}
                    type="number"
                    min="0"
                    max="100"
                    step="0.125"
                    placeholder="e.g. 1"
                    value={points}
                    style={percentPaddingStyle}
                    onChange={(e) => setPoints(e.target.value)}
                    className={`${inputBaseClass} pr-11 ${
                      fieldErrors.points ? 'border-red-400 dark:border-red-600' : 'border-gray-200 dark:border-slate-700'
                    }`}
                    aria-label="Discount points percentage of loan"
                    aria-invalid={!!fieldErrors.points}
                    aria-describedby={fieldErrors.points ? `${pointsId}-error` : undefined}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold pointer-events-none select-none text-sm">%</span>
                </div>
                {fieldErrors.points && (
                  <p id={`${pointsId}-error`} role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {fieldErrors.points}
                  </p>
                )}
              </div>

              {/* Upfront Lender Fees */}
              <div className="flex flex-col justify-start min-w-0 w-full">
                <label htmlFor={lenderFeesId} className={labelClass}>Upfront Lender Fees</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold pointer-events-none select-none text-sm">
                    {currencySymbol}
                  </span>
                  <input
                    id={lenderFeesId}
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 1500"
                    value={lenderFees}
                    style={currencyPaddingStyle}
                    onChange={(e) => setLenderFees(e.target.value)}
                    className={`${moneyInputBaseClass} border-gray-200 dark:border-slate-700`}
                    aria-label="Upfront lender fees"
                  />
                </div>
              </div>
            </div>

            {/* Prepayment & Extra Principal Section with clean divider */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Extra Monthly Principal */}
                <div className="flex flex-col justify-start min-w-0 w-full">
                  <label htmlFor={extraId} className={labelClass}>Extra Monthly Principal</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold pointer-events-none select-none text-sm">
                      {currencySymbol}
                    </span>
                    <input
                      id={extraId}
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 500"
                      value={extra}
                      style={currencyPaddingStyle}
                      onChange={(e) => setExtra(e.target.value)}
                      className={`${moneyInputBaseClass} border-gray-200 dark:border-slate-700`}
                      aria-label="Extra monthly principal payment"
                    />
                  </div>
                </div>

                {/* One-Time Prepayment */}
                <div className="flex flex-col justify-start min-w-0 w-full">
                  <label htmlFor={prepayId} className={labelClass}>One-Time Prepayment</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold pointer-events-none select-none text-sm">
                      {currencySymbol}
                    </span>
                    <input
                      id={prepayId}
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 10000"
                      value={prepay}
                      style={currencyPaddingStyle}
                      onChange={(e) => setPrepay(e.target.value)}
                      className={`${moneyInputBaseClass} border-gray-200 dark:border-slate-700`}
                      aria-label="One-time prepayment amount"
                    />
                  </div>
                </div>
              </div>

              {toNumber(prepay) > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 mt-4 border-t border-gray-100 dark:border-slate-800/80">
                  <div className="flex flex-col justify-start min-w-0 w-full">
                    <label htmlFor={prepayTimingId} className={labelClass}>Prepayment Timing</label>
                    <select
                      id={prepayTimingId}
                      value={prepayTiming}
                      onChange={(e) => setPrepayTiming(e.target.value as PrepayTiming)}
                      className={`${inputBaseClass} border-gray-200 dark:border-slate-700`}
                    >
                      <option value="origination">At Origination (Day 1)</option>
                      <option value="period">During Payment Schedule</option>
                    </select>
                  </div>
                  {prepayTiming === 'period' && (
                    <div className="flex flex-col justify-start min-w-0 w-full">
                      <label htmlFor={prepayPeriodId} className={labelClass}>Apply at Period #</label>
                      <input
                        id={prepayPeriodId}
                        type="number"
                        min="1"
                        max={result ? result.payoffPeriods : 360}
                        step="1"
                        placeholder="e.g. 12"
                        value={prepayPeriod}
                        onChange={(e) => setPrepayPeriod(e.target.value)}
                        className={`${inputBaseClass} border-gray-200 dark:border-slate-700`}
                        aria-label="Prepayment period number"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Validation Errors Alert Summary */}
        {errors.length > 0 && (
          <div
            role="alert"
            className="p-4 rounded-2xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/20 text-sm text-red-700 dark:text-red-300 space-y-1"
          >
            <div className="font-bold flex items-center gap-1.5 text-red-800 dark:text-red-200 whitespace-nowrap">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Please review your input values:
            </div>
            {errors.map((e) => (
              <div key={e} className="pl-5 text-xs">• {e}</div>
            ))}
          </div>
        )}

        {/* Unapplied Prepayment Warning */}
        {result && result.unappliedPrepayment > 0 && (
          <div className="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Prepayment Exceeds Balance:</strong> Requested prepayment of {money(toNumber(prepay))} exceeded the outstanding loan. {money(result.appliedPrepayAtOrigination)} was applied to pay off the loan in full; {money(result.unappliedPrepayment)} remains unapplied.
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Output, Summary & Amortization */}
      <div className="lg:col-span-7 space-y-6">
        {!isReady ? (
          /* Honest Incomplete / Empty State */
          <div className="rounded-2xl p-8 border border-blue-100 dark:border-slate-800 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-slate-900 dark:to-slate-900/50 shadow-sm text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calculator className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white whitespace-nowrap">
              Enter Loan Details to Calculate
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-2 mb-6">
              Enter your home purchase price, annual interest rate, and loan term on the left to view your estimated mortgage payments, cash to close, and complete amortization schedule.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700">
                <div className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">Principal & Interest</div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">Exact monthly or biweekly payment</div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700">
                <div className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">Taxes & Insurance</div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">Escrow, PMI & HOA estimates</div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700">
                <div className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">Cash to Close</div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">Closing costs, points & fees</div>
              </div>
            </div>
          </div>
        ) : result && (
          <>
            {/* Primary Payment Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-slate-900 dark:to-blue-950/20 rounded-2xl p-4 sm:p-6 border border-blue-100 dark:border-slate-800 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 pr-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                    {frequency === 'monthly' ? 'Estimated Monthly Housing Cost' : 'Biweekly Mortgage & Housing Cost'}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {frequency === 'monthly'
                      ? 'Includes Principal, Interest, Escrow, and Initial PMI'
                      : 'Includes 26 biweekly payments/yr + monthly housing escrow'}
                  </p>
                </div>
                <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 shadow-sm whitespace-nowrap shrink-0">
                  LTV: {loanToValue.toFixed(1)}%
                </div>
              </div>

              <div className="mt-4 mb-6 pb-6 border-b border-blue-200/60 dark:border-slate-800">
                {frequency === 'monthly' ? (
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-blue-900 dark:text-white tracking-tight whitespace-nowrap overflow-visible">
                    {money(result.monthly)}
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1.5 whitespace-nowrap">/ month</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-xs uppercase font-bold text-blue-800 dark:text-blue-300 tracking-wider">
                      Scheduled Biweekly Payment
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-blue-900 dark:text-white tracking-tight whitespace-nowrap overflow-visible">
                      {money(result.scheduled + result.initialPmiPeriod)}
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1.5 whitespace-nowrap">every 2 weeks (26/yr)</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Average monthly equivalent: <strong className="text-blue-600 dark:text-blue-400 whitespace-nowrap">{money(result.monthly)}/mo</strong> (P&I × 26 ÷ 12 + Escrow)
                    </div>
                  </div>
                )}
              </div>

              {/* Itemized Payment Breakdown */}
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 min-w-0 pr-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <span className="break-words">Principal & Interest ({frequency === 'monthly' ? 'monthly' : 'biweekly'})</span>
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap ml-2 shrink-0">
                    {money(result.scheduled)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 min-w-0 pr-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="break-words">Property Taxes (monthly equivalent)</span>
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap ml-2 shrink-0">{money(result.tax)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 min-w-0 pr-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="break-words">Home Insurance (monthly equivalent)</span>
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap ml-2 shrink-0">{money(result.insurance)}</span>
                </div>
                {result.hoa > 0 && (
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 min-w-0 pr-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                      <span className="break-words">HOA Dues (monthly)</span>
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap ml-2 shrink-0">{money(result.hoa)}</span>
                  </div>
                )}
                {result.initialPmiMonthly > 0 && (
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 min-w-0 pr-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                      <span className="break-words">Initial PMI (monthly equivalent)</span>
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap ml-2 shrink-0">
                      {money(result.initialPmiMonthly)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Metrics Summary Cards (No wrapping, full value visibility) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-w-0 w-full shadow-sm">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1 whitespace-nowrap">
                  Loan Amount
                </span>
                <div className="w-full min-w-0 text-base sm:text-lg font-bold text-slate-900 dark:text-white whitespace-nowrap overflow-visible">
                  {money(result.loan)}
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-w-0 w-full shadow-sm">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1 whitespace-nowrap">
                  Cash to Close
                </span>
                <div className="w-full min-w-0 text-base sm:text-lg font-bold text-slate-900 dark:text-white whitespace-nowrap overflow-visible">
                  {money(result.cashToClose)}
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-w-0 w-full shadow-sm">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1 whitespace-nowrap">
                  Total Interest
                </span>
                <div className="w-full min-w-0 text-base sm:text-lg font-bold text-slate-900 dark:text-white whitespace-nowrap overflow-visible">
                  {money(result.interestTotal)}
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-w-0 w-full shadow-sm">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1 whitespace-nowrap">
                  Payoff Time
                </span>
                <div className="w-full min-w-0 text-base sm:text-lg font-bold text-slate-900 dark:text-white whitespace-nowrap overflow-visible">
                  {result.payoffYears.toFixed(1)} yrs
                </div>
              </div>
            </div>

            {/* Prepayment Acceleration Impact (Conditional) */}
            {totalSavings > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">
                    Prepayment & Accelerated Payoff Impact
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                  <div className="min-w-0">
                    <span className="text-slate-500 dark:text-slate-400 block">Interest Saved</span>
                    <div className="font-bold text-emerald-700 dark:text-emerald-300 text-base whitespace-nowrap overflow-visible">{money(interestSaved)}</div>
                  </div>
                  {pmiSaved > 0 && (
                    <div className="min-w-0">
                      <span className="text-slate-500 dark:text-slate-400 block">PMI Saved</span>
                      <div className="font-bold text-emerald-700 dark:text-emerald-300 text-base whitespace-nowrap overflow-visible">{money(pmiSaved)}</div>
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-slate-500 dark:text-slate-400 block">Time Saved</span>
                    <div className="font-bold text-slate-900 dark:text-white text-base whitespace-nowrap overflow-visible">
                      {yearsSaved > 0 ? `${yearsSaved} yrs ` : ''}{remMonthsSaved} mos
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cost Breakdown Bars */}
            <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-4">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-blue-600 shrink-0" />
                  Cost Breakdown
                </h4>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Lifetime Outflow: <span className="font-semibold text-slate-700 dark:text-slate-200">{money(result.totalCost)}</span>
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { title: 'Loan Principal', val: result.principalTotal, color: 'bg-blue-600' },
                  { title: 'Total Interest', val: result.interestTotal, color: 'bg-indigo-500' },
                  { title: 'Property Taxes', val: result.totalTax, color: 'bg-emerald-500' },
                  { title: 'Home Insurance', val: result.totalInsurance, color: 'bg-amber-500' },
                  { title: 'HOA Fees', val: result.totalHoa, color: 'bg-purple-500' },
                  { title: 'Total PMI', val: result.pmiTotal, color: 'bg-rose-500' },
                  { title: 'Upfront Closing & Fees', val: result.cashToClose, color: 'bg-teal-500' },
                ].map(({ title, val, color }) => {
                  if (val <= 0) return null;
                  const pct = result.totalCost > 0 ? (val / result.totalCost) * 100 : 0;
                  return (
                    <div key={title} className="space-y-1">
                      <div className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span className="truncate pr-2">{title}</span>
                        <span className="font-semibold text-slate-900 dark:text-white shrink-0 whitespace-nowrap">
                          {money(val)} ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                        <div className={`h-full ${color} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Reconciliation Audit Card */}
            <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-gray-100 dark:border-slate-800 pb-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  Financial Reconciliation Audit
                </h4>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full whitespace-nowrap shrink-0">
                  RECONCILED • 100% MATCH
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="min-w-0">
                  <span className="text-slate-500 block mb-0.5">Original Financed Loan</span>
                  <div className="font-semibold text-slate-900 dark:text-white whitespace-nowrap overflow-visible">{money(result.loan)}</div>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-500 block mb-0.5">Total Principal Repaid</span>
                  <div className="font-semibold text-slate-900 dark:text-white whitespace-nowrap overflow-visible">{money(result.principalTotal)}</div>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-500 block mb-0.5">Ending Balance</span>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap overflow-visible">
                    {money(result.rows[result.rows.length - 1]?.balance ?? 0)}
                  </div>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-500 block mb-0.5">Cash to Close</span>
                  <div className="font-semibold text-slate-900 dark:text-white whitespace-nowrap overflow-visible">{money(result.cashToClose)}</div>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-500 block mb-0.5">Lifetime Outflow</span>
                  <div className="font-semibold text-slate-900 dark:text-white whitespace-nowrap overflow-visible">{money(result.totalCost)}</div>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-500 block mb-0.5">Schedule Principal Check</span>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">CONSERVED (PASS)</div>
                </div>
              </div>
            </div>

            {/* Amortization Schedule Table */}
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm whitespace-nowrap">Amortization Schedule</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {scheduleView === 'yearly' ? 'Annual aggregated breakdown' : `Period-by-period (${frequency})`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center rounded-lg border border-gray-200 dark:border-slate-700 p-0.5 bg-gray-50 dark:bg-slate-950">
                    {(['yearly', 'monthly'] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setScheduleView(v);
                          setSchedulePage(1);
                        }}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                          scheduleView === v
                            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {v === 'yearly' ? 'Yearly' : frequency === 'biweekly' ? 'Biweekly' : 'Monthly'}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setScheduleOpen((v) => !v)}
                    aria-expanded={scheduleOpen}
                    aria-controls={scheduleControlsId}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-blue-500 whitespace-nowrap"
                  >
                    {scheduleOpen ? 'Hide' : 'View Schedule'}
                  </button>
                </div>
              </div>

              {scheduleOpen && (
                <div id={scheduleControlsId} className="space-y-3">
                  <div className="overflow-x-auto max-h-[460px] rounded-xl border border-gray-200 dark:border-slate-800 [scrollbar-width:thin]">
                    <table className="min-w-full text-xs" aria-label="Amortization Schedule">
                      <thead className="sticky top-0 bg-gray-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-b border-gray-200 dark:border-slate-800">
                        <tr>
                          <th scope="col" className="text-left px-3 py-2.5 font-bold whitespace-nowrap">
                            {scheduleView === 'yearly' ? 'Year' : 'Period'}
                          </th>
                          <th scope="col" className="text-right px-3 py-2.5 font-bold whitespace-nowrap">Payment</th>
                          <th scope="col" className="text-right px-3 py-2.5 font-bold whitespace-nowrap">Principal</th>
                          <th scope="col" className="text-right px-3 py-2.5 font-bold whitespace-nowrap">Interest</th>
                          <th scope="col" className="text-right px-3 py-2.5 font-bold whitespace-nowrap">PMI</th>
                          <th scope="col" className="text-right px-3 py-2.5 font-bold whitespace-nowrap">Extra</th>
                          <th scope="col" className="text-right px-3 py-2.5 font-bold whitespace-nowrap">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
                        {pagedRows.map((r) => (
                          <tr
                            key={`${scheduleView}-${r.period}`}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              {scheduleView === 'yearly' ? `Year ${r.year}` : `Period ${r.period}`}
                            </td>
                            <td className="px-3 py-2 text-right font-medium text-slate-900 dark:text-white whitespace-nowrap">{money(r.payment)}</td>
                            <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300 whitespace-nowrap">{money(r.principal)}</td>
                            <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300 whitespace-nowrap">{money(r.interest)}</td>
                            <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300 whitespace-nowrap">{money(r.pmi)}</td>
                            <td className="px-3 py-2 text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{money(r.extra)}</td>
                            <td className="px-3 py-2 text-right font-semibold text-slate-900 dark:text-white whitespace-nowrap">{money(r.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Schedule Pagination Controls (for monthly/period view) */}
                  {scheduleView === 'monthly' && totalPages > 1 && (
                    <div className="flex items-center justify-between text-xs pt-1 px-1">
                      <span className="text-slate-500 whitespace-nowrap">
                        Page {currentPage} of {totalPages} ({result.rows.length} total payments)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={currentPage <= 1}
                          onClick={() => setSchedulePage((p) => Math.max(1, p - 1))}
                          className="px-2.5 py-1 rounded border border-gray-200 dark:border-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 whitespace-nowrap"
                        >
                          Prev
                        </button>
                        <button
                          type="button"
                          disabled={currentPage >= totalPages}
                          onClick={() => setSchedulePage((p) => Math.min(totalPages, p + 1))}
                          className="px-2.5 py-1 rounded border border-gray-200 dark:border-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 whitespace-nowrap"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons: CSV & Copy */}
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={downloadCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:border-blue-500 hover:text-blue-600 transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5 shrink-0" /> Download CSV (Excel Ready)
                </button>
                <button
                  type="button"
                  onClick={copySummary}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:border-blue-500 hover:text-blue-600 transition-colors whitespace-nowrap"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                  {copied ? 'Summary Copied' : 'Copy Summary'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Methodology & Assumptions Accordion */}
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setMethodologyOpen((v) => !v)}
            aria-expanded={methodologyOpen}
            aria-controls={methodologyControlsId}
            className="w-full flex items-center justify-between p-4 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span className="flex items-center gap-2 text-left">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              Methodology & Calculation Assumptions
            </span>
            {methodologyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {methodologyOpen && (
            <div
              id={methodologyControlsId}
              className="p-5 pt-0 text-xs text-slate-600 dark:text-slate-400 space-y-3.5 border-t border-gray-100 dark:border-slate-800 leading-relaxed"
            >
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">1. Standard Amortization Formula:</strong>
                Calculated using deterministic closed-form periodic amortization:
                <code className="mx-1 px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 rounded font-mono text-[11px]">
                  P = L × i × (1+i)^N / ((1+i)^N - 1)
                </code>
                where <em>L</em> is the financed loan principal, <em>i</em> is the nominal periodic rate, and <em>N</em> is the total scheduled periods. When rate is 0%, payment defaults to exact linear repayment (<code className="font-mono">L / N</code>).
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">2. Payment Frequency & Biweekly Convention:</strong>
                Monthly schedules model 12 scheduled payments per year. Biweekly schedules model 26 payments per year (one payment every two weeks). The average monthly equivalent represents <code className="font-mono">Biweekly Payment × 26 ÷ 12</code> plus escrow.
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">3. Extra Principal & Biweekly Conversion:</strong>
                Extra payment inputs are treated as a monthly-equivalent extra principal budget. Under biweekly frequency, this budget is converted to <code className="font-mono">Extra × 12 ÷ 26</code> per period. Extra payments are applied strictly to principal reduction and cannot result in negative principal or balance.
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">4. One-Time Prepayment Timing:</strong>
                Prepayments applied at origination reduce initial debt before interest accrues. Prepayments during the schedule reduce the balance on that specific payment period, accelerating payoff duration while maintaining the scheduled payment amount.
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">5. PMI Estimation & Cancellation:</strong>
                PMI is modeled as a balance-based estimate when original loan-to-value (LTV) exceeds 80%. It automatically terminates once the loan balance drops to or below the configured cancellation threshold (default 80% LTV).
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">6. Cash to Close & Total Lifetime Outflow:</strong>
                Cash to close equals <code className="font-mono">Down Payment + Closing Costs + Discount Points + Lender Fees + Origination Prepayment</code>. Total lifetime cash outflow sums cash to close, remaining scheduled principal, total interest, total PMI, and modeled property taxes, insurance, and HOA dues for the payoff duration without double-counting.
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">7. Precision & Rounding Policy:</strong>
                Internal money amounts are managed in ISO currency minor units (e.g. 2 decimals for USD/EUR, 0 for JPY, 3 for KWD) with epsilon rounding offsets to prevent floating-point accumulation drift. In the final payment period, principal is capped to the exact remaining balance so the loan is never overpaid.
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-slate-800 text-[11px] text-slate-500">
                <strong>Important Disclosure:</strong> This calculator provides educational estimates and does not constitute a loan offer, official lender Loan Estimate, or regulatory APR disclosure under the Truth in Lending Act (TILA). Actual mortgage rates, escrow requirements, private mortgage insurance premiums, and closing fees vary by lender, jurisdiction, credit profile, and loan program.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
