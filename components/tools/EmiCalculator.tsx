'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Calculator,
  PieChart,
  CalendarDays,
  Download,
  Link2,
  Check,
  TrendingDown,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ShieldCheck,
  Sliders,
  AlertCircle,
} from 'lucide-react';

/* =========================================================================
   1. TYPES & DOMAIN ENGINE IMPORTS
   ========================================================================= */

import {
  type PaymentFrequency,
  type PaymentTiming,
  type PrepaymentMode,
  type CurrencyItem,
  type LoanParams,
  type ScheduleRow,
  type YearlySummaryRow,
  type LoanCalculationResult,
  type ComparisonResult,
  WORLD_CURRENCIES,
  safeNumber,
  validateLoanParams,
  getPeriodsPerYear,
  calculatePeriodicRate,
  calculateScheduledPayment,
  generateAmortizationSchedule,
  generateYearlySummary,
  calculateLoan,
  compareScenarios,
  parseCleanNumber,
  formatCurrencyAmount,
  formatDuration,
  serializeLoanUrl,
  deserializeLoanUrl,
  escapeCsvCell,
  generateCsvExport,
} from './emiCalculatorEngine';

export type {
  PaymentFrequency,
  PaymentTiming,
  PrepaymentMode,
  CurrencyItem,
  LoanParams,
  ScheduleRow,
  YearlySummaryRow,
  LoanCalculationResult,
  ComparisonResult,
};

export {
  WORLD_CURRENCIES,
  parseCleanNumber,
  safeNumber,
  validateLoanParams,
  getPeriodsPerYear,
  calculatePeriodicRate,
  calculateScheduledPayment,
  generateAmortizationSchedule,
  generateYearlySummary,
  calculateLoan,
  compareScenarios,
  formatCurrencyAmount,
  formatDuration,
  serializeLoanUrl,
  deserializeLoanUrl,
  escapeCsvCell,
  generateCsvExport,
};

/* =========================================================================
   2. REACT COMPONENT UI
   ========================================================================= */

export default function EmiCalculator() {
  const [currency, setCurrency] = useState<CurrencyItem>(
    WORLD_CURRENCIES.find((c) => c.code === 'USD') || WORLD_CURRENCIES[0]
  );

  // Core loan inputs (Zero / Fresh State by Default)
  const [principal, setPrincipal] = useState<number>(0);
  const [rate, setRate] = useState<number>(0);
  const [years, setYears] = useState<number>(0);
  const [frequency, setFrequency] = useState<PaymentFrequency>('monthly');
  const [timing, setTiming] = useState<PaymentTiming>('end');

  // Advanced payoff & fee options (Zero / Fresh State by Default)
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [oneTimePrepayment, setOneTimePrepayment] = useState<number>(0);
  const [prepaymentPeriod, setPrepaymentPeriod] = useState<number>(0);
  const [prepaymentMode, setPrepaymentMode] = useState<PrepaymentMode>('term');
  const [originationFee, setOriginationFee] = useState<number>(0);
  const [recurringFee, setRecurringFee] = useState<number>(0);

  // Tab state for schedule vs yearly summary vs methodology
  const [activeTab, setActiveTab] = useState<'schedule' | 'yearly' | 'methodology'>('schedule');

  const [copied, setCopied] = useState<boolean>(false);

  // Enforce 100% clean / fresh state on normal route load and page refresh (F5).
  // Strictly resets both React state and DOM input elements to 0 / empty,
  // neutralizing browser session-history / bfcache form restoration on clean routes.
  useEffect(() => {
    const handleInitAndRefresh = () => {
      if (typeof window === 'undefined') return;

      const { params, currency: urlCurrency, showAdvanced: urlAdvanced, hasSharedState } =
        deserializeLoanUrl(window.location.search || '', WORLD_CURRENCIES);

      if (hasSharedState) {
        setCurrency(urlCurrency);
        setPrincipal(params.principal);
        setRate(params.annualRate);
        setYears(params.years);
        setFrequency(params.frequency);
        setTiming(params.timing);
        setExtraPayment(params.extraPayment);
        setOneTimePrepayment(params.oneTimePrepayment);
        setPrepaymentPeriod(params.prepaymentPeriod);
        setPrepaymentMode(params.prepaymentMode);
        setOriginationFee(params.originationFee);
        setRecurringFee(params.recurringFee);
        if (urlAdvanced) setShowAdvanced(true);
      } else {
        // Normal clean route: reset React state strictly to fresh 0 / empty
        setPrincipal(0);
        setRate(0);
        setYears(0);
        setExtraPayment(0);
        setOneTimePrepayment(0);
        setPrepaymentPeriod(0);
        setOriginationFee(0);
        setRecurringFee(0);

        // Wipe any browser session-history / bfcache / reload form restoration

        const inputIds = [
          'emi-principal',
          'emi-rate',
          'emi-years',
          'emi-extra',
          'emi-prepayment',
          'emi-prepay-period',
          'emi-orig-fee',
          'emi-recur-fee',
        ];
        inputIds.forEach((id) => {
          const el = document.getElementById(id) as HTMLInputElement | null;
          if (el) {
            el.value = '';
          }
        });
      }
    };

    const timer = setTimeout(handleInitAndRefresh, 0);
    window.addEventListener('pageshow', handleInitAndRefresh);
    window.addEventListener('popstate', handleInitAndRefresh);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pageshow', handleInitAndRefresh);
      window.removeEventListener('popstate', handleInitAndRefresh);
    };
  }, []);

  // Current active loan parameters
  const currentLoanParams: LoanParams = useMemo(
    () => ({
      principal,
      annualRate: rate,
      years,
      frequency,
      timing,
      extraPayment,
      oneTimePrepayment,
      prepaymentPeriod,
      prepaymentMode,
      originationFee,
      recurringFee,
    }),
    [
      principal,
      rate,
      years,
      frequency,
      timing,
      extraPayment,
      oneTimePrepayment,
      prepaymentPeriod,
      prepaymentMode,
      originationFee,
      recurringFee,
    ]
  );

  // Baseline scenario (without extra payments or prepayments) for exact savings comparison
  const baseLoanParams: LoanParams = useMemo(
    () => ({
      principal,
      annualRate: rate,
      years,
      frequency,
      timing,
      extraPayment: 0,
      oneTimePrepayment: 0,
      prepaymentPeriod: 1,
      prepaymentMode: 'term',
      originationFee,
      recurringFee,
    }),
    [principal, rate, years, frequency, timing, originationFee, recurringFee]
  );

  // Compute canonical calculation results
  const loanData = useMemo(() => calculateLoan(currentLoanParams), [currentLoanParams]);
  const baseLoanData = useMemo(() => calculateLoan(baseLoanParams), [baseLoanParams]);

  // Compute savings between baseline and accelerated scenario
  const savings = useMemo(
    () => compareScenarios(baseLoanData, loanData, frequency),
    [baseLoanData, loanData, frequency]
  );

  const {
    scheduledPayment,
    totalPrincipal,
    totalInterest,
    totalFees,
    totalCost,
    payoffPeriods,
    schedule,
    yearlySummary,
    principalPercent,
    interestPercent,
    feePercent,
  } = loanData;

  const handleShare = async () => {
    const queryString = serializeLoanUrl(currentLoanParams, currency.code);
    const fullUrl = `${window.location.origin}${window.location.pathname}?${queryString}`;

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy loan scenario URL:', fullUrl);
    }
  };

  const handleExportCsv = () => {
    if (!schedule.length || principal <= 0 || years <= 0) return;
    const csvContent = generateCsvExport(loanData, currentLoanParams, currency);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `loan-amortization-${currency.code}-${Date.now()}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setPrincipal(0);
    setRate(0);
    setYears(0);
    setFrequency('monthly');
    setTiming('end');
    setExtraPayment(0);
    setOneTimePrepayment(0);
    setPrepaymentPeriod(0);
    setPrepaymentMode('term');
    setOriginationFee(0);
    setRecurringFee(0);
    setShowAdvanced(false);

    const inputIds = [
      'emi-principal',
      'emi-rate',
      'emi-years',
      'emi-extra',
      'emi-prepayment',
      'emi-prepay-period',
      'emi-orig-fee',
      'emi-recur-fee',
    ];
    inputIds.forEach((id) => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el) el.value = '';
    });
  };

  const hasCalculatedLoan = principal > 0 && years > 0;

  const paymentLabel =
    frequency === 'weekly'
      ? 'Weekly Payment'
      : frequency === 'biweekly'
      ? 'Biweekly Payment'
      : 'Monthly Payment';

  const totalOngoingCashOutflow = scheduledPayment + extraPayment + recurringFee;

  const isExtremeRecurringFee =
    hasCalculatedLoan &&
    recurringFee > 0 &&
    (recurringFee >= principal * 0.05 || recurringFee >= scheduledPayment);

  const isPrepaymentUnapplied =
    hasCalculatedLoan &&
    oneTimePrepayment > 0 &&
    prepaymentMode !== 'immediate' &&
    loanData.isPrepaymentPastPayoff;

  return (
    <div className="mx-auto w-full max-w-[1240px] min-w-0 space-y-6 text-slate-900 dark:text-slate-100">
      {/* Top Main 2-Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 min-w-0">
        {/* Left Column: Loan Input Controls (5 Cols) */}
        <section className="space-y-5 lg:col-span-5 min-w-0">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-[#070b14] shadow-sm space-y-5 min-w-0">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Loan Parameters</h2>
              </div>
              <button
                type="button"
                onClick={handleReset}
                title="Reset to default loan settings"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
              >
                <RefreshCw className="h-3 w-3" />
                Reset
              </button>
            </div>

            {/* Input Controls Form */}
            <div role="region" aria-label="Loan input controls" className="space-y-5">
              {/* Currency Selector */}
              <div>
                <label htmlFor="emi-currency" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Currency
                </label>
                <select
                  id="emi-currency"
                  autoComplete="off"
                  value={currency.code}
                  onChange={(e) => {
                    const match = WORLD_CURRENCIES.find((c) => c.code === e.target.value);
                    if (match) setCurrency(match);
                  }}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:border-slate-700/80 dark:bg-slate-950 dark:text-slate-100 outline-none hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
                >
                  {WORLD_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code}) — {c.symbol}
                    </option>
                  ))}
                </select>
              </div>

              {/* Principal Amount Input & Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="emi-principal" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Loan Principal Amount
                  </label>
                  <div className="relative w-1/2 min-w-[120px]">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      {currency.symbol}
                    </span>
                    <input
                      id="emi-principal"
                      autoComplete="off"
                      type="number"
                      min="0"
                      max="100000000"
                      step="500"
                      placeholder="0"
                      value={principal === 0 ? '' : principal}
                      onChange={(e) => setPrincipal(safeNumber(e.target.value, 0, 0, 100000000))}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-7 pr-3 py-1.5 text-right font-mono text-sm font-bold text-slate-900 dark:border-slate-700/80 dark:bg-slate-950 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                </div>
                <input
                  aria-label="Loan principal amount slider"
                  autoComplete="off"
                  type="range"
                  min="0"
                  max="1000000"
                  step="1000"
                  value={Math.min(Math.max(principal, 0), 1000000)}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-1"
                />
              </div>

              {/* Interest Rate Input & Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="emi-rate" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Annual Interest Rate
                  </label>
                  <div className="relative w-1/3 min-w-[100px]">
                    <input
                      id="emi-rate"
                      autoComplete="off"
                      type="number"
                      min="0"
                      max="100"
                      step="0.05"
                      placeholder="0"
                      value={rate === 0 ? '' : rate}
                      onChange={(e) => setRate(safeNumber(e.target.value, 0, 0, 100))}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-3 pr-7 py-1.5 text-right font-mono text-sm font-bold text-slate-900 dark:border-slate-700/80 dark:bg-slate-950 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      %
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                  Nominal annual rate used for periodic amortization
                </p>
                <input
                  aria-label="Annual interest rate slider"
                  autoComplete="off"
                  type="range"
                  min="0"
                  max="30"
                  step="0.1"
                  value={Math.min(Math.max(rate, 0), 30)}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-1"
                />
              </div>

              {/* Loan Tenure Input & Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="emi-years" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Loan Tenure (Duration)
                  </label>
                  <div className="relative w-1/3 min-w-[100px]">
                    <input
                      id="emi-years"
                      autoComplete="off"
                      type="number"
                      min="0"
                      max="50"
                      step="0.5"
                      placeholder="0"
                      value={years === 0 ? '' : years}
                      onChange={(e) => setYears(safeNumber(e.target.value, 0, 0, 50))}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-3 pr-9 py-1.5 text-right font-mono text-sm font-bold text-slate-900 dark:border-slate-700/80 dark:bg-slate-950 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Yrs
                    </span>
                  </div>
                </div>
                <input
                  aria-label="Loan tenure slider"
                  autoComplete="off"
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={Math.min(Math.max(years, 0), 40)}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-1"
                />
              </div>

              {/* Frequency & Timing Selectors (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="min-w-0 w-full">
                  <label htmlFor="emi-frequency" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Payment Frequency
                  </label>
                  <select
                    id="emi-frequency"
                    autoComplete="off"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as PaymentFrequency)}
                    className="w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 outline-none focus:border-blue-500"
                  >
                    <option value="monthly">Monthly (12 / yr)</option>
                    <option value="biweekly">Biweekly (26 / yr)</option>
                    <option value="weekly">Weekly (52 / yr)</option>
                  </select>
                </div>

                <div className="min-w-0 w-full">
                  <label htmlFor="emi-timing" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Payment Timing
                  </label>
                  <select
                    id="emi-timing"
                    autoComplete="off"
                    value={timing}
                    onChange={(e) => setTiming(e.target.value as PaymentTiming)}
                    className="w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 outline-none focus:border-blue-500"
                  >
                    <option value="end">End of Period (In Arrears)</option>
                    <option value="beginning">Beginning of Period (In Advance)</option>
                  </select>
                </div>
              </div>

              {/* Collapsible Advanced Payoff & Fee Options */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((prev) => !prev)}
                  className="flex w-full items-center justify-between py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Advanced Payoff & Fee Options</span>
                  </div>
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showAdvanced && (
                  <div className="mt-3 space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                    {/* Extra Recurring Payment */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="emi-extra" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Extra Recurring Payment
                        </label>
                        <div className="relative w-1/2 min-w-[120px]">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            {currency.symbol}
                          </span>
                          <input
                            id="emi-extra"
                            autoComplete="off"
                            type="number"
                            min="0"
                            max="100000000"
                            step="50"
                            placeholder="0"
                            value={extraPayment === 0 ? '' : extraPayment}
                            onChange={(e) => setExtraPayment(safeNumber(e.target.value, 0, 0, 100000000))}
                            className="w-full rounded-xl border border-slate-300 bg-white pl-7 pr-3 py-1.5 text-right font-mono text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Applied directly to principal on every {frequency} payment.
                      </p>
                    </div>

                    {/* One-Time Prepayment */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <label htmlFor="emi-prepayment" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          One-Time Prepayment
                        </label>
                        <div className="relative w-1/2 min-w-[120px]">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            {currency.symbol}
                          </span>
                          <input
                            id="emi-prepayment"
                            autoComplete="off"
                            type="number"
                            min="0"
                            max="100000000"
                            step="500"
                            placeholder="0"
                            value={oneTimePrepayment === 0 ? '' : oneTimePrepayment}
                            onChange={(e) => setOneTimePrepayment(safeNumber(e.target.value, 0, 0, 100000000))}
                            className="w-full rounded-xl border border-slate-300 bg-white pl-7 pr-3 py-1.5 text-right font-mono text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                          />
                        </div>
                      </div>

                      {oneTimePrepayment > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label htmlFor="emi-prepay-period" className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                              Applied at Period #
                            </label>
                            <input
                              id="emi-prepay-period"
                              autoComplete="off"
                              type="number"
                              min="1"
                              max={Math.max(1, Math.round(years * getPeriodsPerYear(frequency)))}
                              placeholder="12"
                              value={prepaymentPeriod === 0 ? '' : prepaymentPeriod}
                              onChange={(e) => setPrepaymentPeriod(safeNumber(e.target.value, 0, 0, 1200))}
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-900"
                            />
                          </div>

                          <div>
                            <label htmlFor="emi-prepay-mode" className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                              Prepayment Mode
                            </label>
                            <select
                              id="emi-prepay-mode"
                              autoComplete="off"
                              value={prepaymentMode}
                              onChange={(e) => setPrepaymentMode(e.target.value as PrepaymentMode)}
                              className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
                            >
                              <option value="term">Reduce Term (Shorten Loan)</option>
                              <option value="payment">Reduce Payment (Re-cast)</option>
                              <option value="immediate">Immediate (At Inception)</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Loan Fees */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="emi-orig-fee" className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Origination Fee ({currency.symbol})
                        </label>
                        <input
                          id="emi-orig-fee"
                          autoComplete="off"
                          type="number"
                          min="0"
                          step="50"
                          value={originationFee === 0 ? '' : originationFee}
                          onChange={(e) => setOriginationFee(safeNumber(e.target.value, 0, 0, 100000000))}
                          placeholder="0"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>

                      <div>
                        <label htmlFor="emi-recur-fee" className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Periodic Fee ({currency.symbol} / {frequency === 'monthly' ? 'mo' : frequency})
                        </label>
                        <input
                          id="emi-recur-fee"
                          autoComplete="off"
                          type="number"
                          min="0"
                          step="5"
                          value={recurringFee === 0 ? '' : recurringFee}
                          onChange={(e) => setRecurringFee(safeNumber(e.target.value, 0, 0, 100000000))}
                          placeholder="0"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Hero Result & Repayment Summary (7 Cols) */}
        <section className="space-y-5 lg:col-span-7 min-w-0">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-[#070b14] shadow-sm space-y-5 min-w-0">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-500" />
              Repayment Breakdown & Payoff Metrics
            </h2>

            {/* Non-Blocking Extreme Fee Warning */}
            {isExtremeRecurringFee && (
              <div role="status" className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 dark:border-amber-800 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>This recurring fee is unusually large relative to the loan amount. Please verify the amount.</span>
              </div>
            )}

            {/* Informational Prepayment Past Payoff State */}
            {isPrepaymentUnapplied && (
              <div role="status" className="rounded-2xl border border-blue-200 bg-blue-50/80 p-3.5 dark:border-blue-900/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Prepayment Allocation Notice</span>
                </div>
                <p>
                  This prepayment is not applied because the loan is projected to be fully repaid before period {prepaymentPeriod}.
                </p>
                <div className="flex flex-wrap gap-4 pt-0.5 font-mono text-[11px]">
                  <span>Requested: <strong>{currency.symbol}{formatCurrencyAmount(loanData.requestedPrepayment, currency)}</strong></span>
                  <span>Applied: <strong>{currency.symbol}0.00</strong></span>
                  <span>Unapplied: <strong>{currency.symbol}{formatCurrencyAmount(loanData.unappliedPrepayment, currency)}</strong></span>
                </div>
              </div>
            )}

            {/* Primary Scheduled Payment Hero Box */}
            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                    {paymentLabel} (Base P&amp;I)
                  </span>
                  <div className="flex items-center gap-2">
                    {timing === 'beginning' && (
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                        In Advance
                      </span>
                    )}
                    <span className="rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-bold text-white">
                      {currency.code}
                    </span>
                  </div>
                </div>

                <div className="text-3xl sm:text-5xl font-extrabold tracking-tight font-mono whitespace-nowrap overflow-x-auto py-1 overscroll-x-contain">
                  {currency.symbol}
                  {hasCalculatedLoan ? formatCurrencyAmount(scheduledPayment, currency) : '0.00'}
                </div>

                {hasCalculatedLoan ? (
                  extraPayment > 0 || recurringFee > 0 ? (
                    <div className="space-y-1.5 pt-1.5 border-t border-white/20">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>
                          Total {frequency === 'weekly' ? 'Weekly' : frequency === 'biweekly' ? 'Biweekly' : 'Monthly'} Cash Outflow:
                        </span>
                        <span className="font-mono text-sm font-extrabold">
                          {currency.symbol}{formatCurrencyAmount(totalOngoingCashOutflow, currency)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-blue-100">
                        <span className="rounded-md bg-white/15 px-2 py-0.5">
                          Base: {currency.symbol}{formatCurrencyAmount(scheduledPayment, currency)}
                        </span>
                        {extraPayment > 0 && (
                          <span className="rounded-md bg-emerald-400/25 text-emerald-100 px-2 py-0.5">
                            Extra: +{currency.symbol}{formatCurrencyAmount(extraPayment, currency)}
                          </span>
                        )}
                        {recurringFee > 0 && (
                          <span className="rounded-md bg-rose-400/25 text-rose-100 px-2 py-0.5">
                            Fee: +{currency.symbol}{formatCurrencyAmount(recurringFee, currency)}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-blue-100 font-medium">
                      Fixed {frequency} payment (Principal &amp; Interest)
                    </p>
                  )
                ) : (
                  <p className="text-xs text-blue-100 font-medium">
                    Enter loan principal and tenure to compute payment
                  </p>
                )}

                {/* Principal vs Interest % Progress Bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs font-semibold mb-1.5 text-blue-100">
                    <span>Principal: {hasCalculatedLoan ? principalPercent.toFixed(1) : '0.0'}%</span>
                    <span>Interest: {hasCalculatedLoan ? interestPercent.toFixed(1) : '0.0'}%</span>
                    {hasCalculatedLoan && totalFees > 0 && <span>Fees: {feePercent.toFixed(1)}%</span>}
                  </div>
                  <div className="w-full h-3 bg-white/20 rounded-full flex overflow-hidden">
                    <div
                      style={{ width: `${hasCalculatedLoan ? principalPercent : 0}%` }}
                      className="bg-emerald-400 transition-all duration-300"
                      title={`Principal: ${principalPercent.toFixed(1)}%`}
                    />
                    <div
                      style={{ width: `${hasCalculatedLoan ? interestPercent : 0}%` }}
                      className="bg-amber-400 transition-all duration-300"
                      title={`Interest: ${interestPercent.toFixed(1)}%`}
                    />
                    {hasCalculatedLoan && totalFees > 0 && (
                      <div
                        style={{ width: `${feePercent}%` }}
                        className="bg-rose-400 transition-all duration-300"
                        title={`Fees: ${feePercent.toFixed(1)}%`}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Summary Rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Principal Amount:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {currency.symbol}{hasCalculatedLoan ? formatCurrencyAmount(totalPrincipal, currency) : '0.00'}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Total Interest Paid:</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  +{currency.symbol}{hasCalculatedLoan ? formatCurrencyAmount(totalInterest, currency) : '0.00'}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Total Loan Fees:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {currency.symbol}{hasCalculatedLoan ? formatCurrencyAmount(totalFees, currency) : '0.00'}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Payoff Duration:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {hasCalculatedLoan ? formatDuration(payoffPeriods, frequency) : '—'}
                </span>
              </div>
            </div>

            {/* Total Cost Highlight Card with Deterministic Reconciliation */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white dark:bg-blue-950/60 dark:border dark:border-blue-900/40 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="block text-xs font-semibold text-slate-300 dark:text-blue-200">
                    Total Amount Paid (Economic Loan Cost)
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-blue-300">
                    Principal + All Interest + All Applied Fees
                  </span>
                </div>
                <span className="font-mono text-xl sm:text-2xl font-extrabold text-blue-400 dark:text-blue-300">
                  {currency.symbol}{hasCalculatedLoan ? formatCurrencyAmount(totalCost, currency) : '0.00'}
                </span>
              </div>
              {hasCalculatedLoan && (
                <div className="border-t border-slate-800 dark:border-blue-900/60 pt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-300 dark:text-blue-200/90 font-mono">
                  <span>Principal: {currency.symbol}{formatCurrencyAmount(totalPrincipal, currency)}</span>
                  <span>+ Interest: {currency.symbol}{formatCurrencyAmount(totalInterest, currency)}</span>
                  {loanData.originationFee > 0 && (
                    <span>+ Origination Fee: {currency.symbol}{formatCurrencyAmount(loanData.originationFee, currency)}</span>
                  )}
                  {loanData.totalRecurringFees > 0 && (
                    <span>+ Recurring Fees: {currency.symbol}{formatCurrencyAmount(loanData.totalRecurringFees, currency)}</span>
                  )}
                  <span className="text-emerald-400 dark:text-emerald-300 font-sans font-semibold">(= Reconciled Total)</span>
                </div>
              )}
            </div>

            {/* Accelerated Payoff Savings Banner */}
            {hasCalculatedLoan && savings.isAccelerated && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300">
                  <TrendingDown className="h-4 w-4" />
                  <span>Accelerated Payoff Savings</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono text-xs">
                  <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/60">
                    <p className="text-[10px] font-sans font-semibold text-emerald-700 dark:text-emerald-400">Interest Saved</p>
                    <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                      {currency.symbol}{formatCurrencyAmount(savings.interestSaved, currency)}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/60">
                    <p className="text-[10px] font-sans font-semibold text-emerald-700 dark:text-emerald-400">Time Saved</p>
                    <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                      {formatDuration(savings.periodsSaved, frequency)}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/60">
                    <p className="text-[10px] font-sans font-semibold text-emerald-700 dark:text-emerald-400">Total Cost Saved</p>
                    <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                      {currency.symbol}{formatCurrencyAmount(savings.totalCostSaved, currency)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions: Share & CSV Export */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleShare}
                disabled={!hasCalculatedLoan}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4 text-blue-600" />}
                {copied ? 'Link Copied to Clipboard!' : 'Share Scenario'}
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                disabled={!hasCalculatedLoan || !schedule.length}
                className="inline-flex items-center gap-2 rounded-2xl border border-blue-600 bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                Export Amortization CSV
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Full-Width Section: Schedule / Yearly Summary / Methodology Tabs */}
      <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#070b14] shadow-sm overflow-hidden min-w-0">
        {/* Navigation Tabs Header */}
        <div
          role="tablist"
          aria-label="Amortization views and documentation"
          className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 p-3 sm:px-6 bg-slate-50 dark:bg-slate-950/60 overflow-x-auto [scrollbar-width:none]"
        >
          <button
            type="button"
            role="tab"
            id="tab-schedule"
            aria-selected={activeTab === 'schedule'}
            aria-controls="panel-schedule"
            onClick={() => setActiveTab('schedule')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${
              activeTab === 'schedule'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            Amortization Schedule {hasCalculatedLoan ? `(${schedule.length} payments)` : ''}
          </button>

          <button
            type="button"
            role="tab"
            id="tab-yearly"
            aria-selected={activeTab === 'yearly'}
            aria-controls="panel-yearly"
            onClick={() => setActiveTab('yearly')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${
              activeTab === 'yearly'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            Yearly Summary {hasCalculatedLoan ? `(${yearlySummary.length} years)` : ''}
          </button>

          <button
            type="button"
            role="tab"
            id="tab-methodology"
            aria-selected={activeTab === 'methodology'}
            aria-controls="panel-methodology"
            onClick={() => setActiveTab('methodology')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${
              activeTab === 'methodology'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Methodology & Assumptions
          </button>
        </div>

        {/* Tab Content 1: Detailed Schedule Table */}
        {activeTab === 'schedule' && (
          <div id="panel-schedule" role="tabpanel" aria-labelledby="tab-schedule" className="p-4 sm:p-6 min-w-0">
            {schedule.length > 0 ? (
              <div className="max-h-[520px] overflow-y-auto overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 [scrollbar-width:thin] overscroll-x-contain">
                <table className="w-full text-left border-collapse min-w-[720px] font-mono text-xs">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 shadow-sm z-10 font-sans uppercase text-[11px] text-slate-600 dark:text-slate-400">
                    <tr>
                      <th className="p-3.5 border-b border-slate-200 dark:border-slate-800">Period</th>
                      <th className="p-3.5 border-b border-slate-200 dark:border-slate-800 text-right">Opening Bal</th>
                      <th className="p-3.5 border-b border-slate-200 dark:border-slate-800 text-right">Payment</th>
                      <th className="p-3.5 border-b border-slate-200 dark:border-slate-800 text-right">Extra / Prepay</th>
                      <th className="p-3.5 border-b border-slate-200 dark:border-slate-800 text-right">Principal</th>
                      <th className="p-3.5 border-b border-slate-200 dark:border-slate-800 text-right">Interest</th>
                      {totalFees > 0 && <th className="p-3.5 border-b border-slate-200 dark:border-slate-800 text-right">Fee</th>}
                      <th className="p-3.5 border-b border-slate-200 dark:border-slate-800 text-right">Closing Bal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-[#070b14]">
                    {schedule.map((row) => (
                      <tr key={row.period} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                        <td className="p-3 font-sans font-bold text-slate-800 dark:text-slate-200">
                          #{row.period}
                        </td>
                        <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                          {formatCurrencyAmount(row.openingBalance, currency)}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                          {formatCurrencyAmount(row.totalPayment, currency)}
                        </td>
                        <td className="p-3 text-right text-emerald-600 dark:text-emerald-400">
                          {row.extraPayment > 0 ? `+${formatCurrencyAmount(row.extraPayment, currency)}` : '—'}
                        </td>
                        <td className="p-3 text-right text-blue-600 dark:text-blue-400 font-semibold">
                          {formatCurrencyAmount(row.principalPaid, currency)}
                        </td>
                        <td className="p-3 text-right text-amber-600 dark:text-amber-400">
                          {formatCurrencyAmount(row.interestPaid, currency)}
                        </td>
                        {totalFees > 0 && (
                          <td className="p-3 text-right text-rose-600 dark:text-rose-400">
                            {row.feePaid > 0 ? formatCurrencyAmount(row.feePaid, currency) : '—'}
                          </td>
                        )}
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrencyAmount(row.closingBalance, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <Calculator className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Start Your Loan Calculation</h3>
                <p className="max-w-md mx-auto text-xs text-slate-500 dark:text-slate-400">
                  Enter your loan principal amount and repayment tenure on the left to instantly generate your period-by-period amortization schedule.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 2: Yearly Summary Table */}
        {activeTab === 'yearly' && (
          <div id="panel-yearly" role="tabpanel" aria-labelledby="tab-yearly" className="p-4 sm:p-6 min-w-0">
            {yearlySummary.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 overscroll-x-contain">
                <table className="w-full text-left border-collapse min-w-[700px] font-mono text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900 font-sans uppercase text-[11px] text-slate-600 dark:text-slate-400">
                    <tr>
                      <th className="p-3.5 border-b border-slate-200 dark:border-slate-800">Year</th>
                      <th className="p-3.5 border-b border-slate-200 dark:border-slate-800 text-right">Start Balance</th>
                      <th className="p-3.5 border-b border-slate-200 dark:border-slate-800 text-right">Scheduled Paid</th>
                      <th className="p-3.5 border-b border-slate-200 dark:border-slate-800 text-right">Extra Principal</th>
                      <th className="p-3.5 border-b border-slate-200 dark:border-slate-800 text-right">Total Principal</th>
                      <th className="p-3.5 border-b border-slate-200 dark:border-slate-800 text-right">Total Interest</th>
                      {totalFees > 0 && <th className="p-3.5 border-b border-slate-200 dark:border-slate-800 text-right">Total Fees</th>}
                      <th className="p-3.5 border-b border-slate-200 dark:border-slate-800 text-right">End Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-[#070b14]">
                    {yearlySummary.map((yr) => (
                      <tr key={yr.year} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                        <td className="p-3.5 font-sans font-bold text-slate-800 dark:text-slate-200">
                          Year {yr.year}
                        </td>
                        <td className="p-3.5 text-right text-slate-600 dark:text-slate-400">
                          {formatCurrencyAmount(yr.openingBalance, currency)}
                        </td>
                        <td className="p-3.5 text-right text-slate-900 dark:text-white font-semibold">
                          {formatCurrencyAmount(yr.totalScheduled, currency)}
                        </td>
                        <td className="p-3.5 text-right text-emerald-600 dark:text-emerald-400">
                          {yr.totalExtra > 0 ? `+${formatCurrencyAmount(yr.totalExtra, currency)}` : '—'}
                        </td>
                        <td className="p-3.5 text-right text-blue-600 dark:text-blue-400 font-bold">
                          {formatCurrencyAmount(yr.totalPrincipal, currency)}
                        </td>
                        <td className="p-3.5 text-right text-amber-600 dark:text-amber-400 font-semibold">
                          {formatCurrencyAmount(yr.totalInterest, currency)}
                        </td>
                        {totalFees > 0 && (
                          <td className="p-3.5 text-right text-rose-600 dark:text-rose-400">
                            {formatCurrencyAmount(yr.totalFees, currency)}
                          </td>
                        )}
                        <td className="p-3.5 text-right font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrencyAmount(yr.closingBalance, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Yearly Breakdown Awaiting Input</h3>
                <p className="max-w-md mx-auto text-xs text-slate-500 dark:text-slate-400">
                  Year-by-year principal, interest, and closing balance aggregations will populate here automatically once loan details are entered.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 3: Transparent Methodology & Assumptions */}
        {activeTab === 'methodology' && (
          <div id="panel-methodology" role="tabpanel" aria-labelledby="tab-methodology" className="p-5 sm:p-8 space-y-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                Deterministic Amortization Methodology & Mathematical Foundations
              </h3>
              <p>
                This loan calculator applies standard fixed-rate actuarial amortization principles. The periodic rate (r) is
                derived by dividing the entered nominal annual interest rate by the compounding payment frequency per year (m):
                12 for monthly, 26 for biweekly, and 52 for weekly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Annual Rate Interpretation & Honesty</h4>
                <p>
                  <strong>Nominal Periodic Amortization:</strong> The rate entered is the nominal contract annual interest rate
                  divided directly by payment frequency (r = annualRate / periodsPerYear).
                </p>
                <p>
                  <strong>Distinct from Regulatory APR:</strong> This tool does NOT compute a jurisdiction-specific regulatory APR
                  (such as US Truth in Lending Act APR that solves for an actuarial internal rate of return incorporating prepaid finance
                  charges) nor an Effective Annual Rate (EAR).
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Payment Timing Conventions</h4>
                <p>
                  <strong>End of Period (In Arrears):</strong> The standard ordinary annuity convention where installment payments occur
                  at the close of each cycle after interest has accrued on the opening balance.
                </p>
                <p>
                  <strong>Beginning of Period (In Advance):</strong> An annuity due convention where payments occur on day 1 of each cycle.
                  Payment #1 incurs zero interest because principal is reduced immediately at inception.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Prepayment Treatment & Allocation</h4>
                <p>
                  <strong>Reduce Term Mode:</strong> Extra principal payments directly accelerate debt payoff while maintaining regular periodic installments.
                </p>
                <p>
                  <strong>Reduce Payment (Re-cast):</strong> After a one-time lump sum, the remaining balance is re-amortized over the remaining term,
                  lowering future periodic obligations.
                </p>
                <p>
                  <strong>Unapplied Prepayments:</strong> If a one-time prepayment is scheduled for a period after the loan is already projected to be fully repaid
                  (e.g., due to extra recurring payments), the prepayment is flagged as unapplied and omitted from schedule balances to preserve mathematical payoff truth.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Fee Treatment & Cost Reconciliation</h4>
                <p>
                  <strong>One-Time Origination Fee:</strong> Assessed at loan inception and included in total borrowing cost.
                </p>
                <p>
                  <strong>Periodic Recurring Fee:</strong> Added to ongoing cash outflow for each payment cycle.
                </p>
                <p>
                  <strong>Deterministic Reconciliation:</strong> Total Principal Repaid + Total Interest + Total One-Time Fees + Total Recurring Fees = Total Cash Paid.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white">Rounding Policy & Final Payment Adjustment</h4>
              <p>
                All intermediate schedule computations use unrounded 64-bit double-precision IEEE 754 floating-point math.
                When the remaining debt is less than the planned principal component, the final installment is capped to the exact
                outstanding balance plus accrued interest. This guarantees closing balance converges to 0.00 without negative balances or overpayment.
                All displayed and exported figures are formatted to the official minor unit of the selected currency (0, 2, or 3 decimals).
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white">Explicit Model Limitations & Unsupported Scenarios</h4>
              <p className="text-slate-500 dark:text-slate-400">
                To maintain mathematical integrity, this calculator does NOT support or imply support for:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <li>Canadian semi-annual compounding mortgage rules</li>
                <li>Actual/360 or Actual/365 day-count interest conventions</li>
                <li>Negative amortization or payment caps allowing principal growth</li>
                <li>Balloon payments, bullet loans, or residual value structures</li>
                <li>Interest-only loan periods or graduated payment plans</li>
                <li>Lender-specific prepayment penalties or administrative closing fees</li>
                <li>Jurisdiction-specific regulatory APR calculations (e.g. US TILA actuarial IRR)</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200">
              <p className="font-bold mb-1">Financial Planning Disclaimer</p>
              <p className="text-[11px]">
                This calculator provides deterministic mathematical projections for planning and educational purposes based on the selected assumptions.
                Actual lender loan terms, interest calculations, fees, taxes, insurance, escrow requirements, day-count conventions, and penalties may differ.
                Always review the formal loan disclosure statement and contract provided by your financial institution.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
