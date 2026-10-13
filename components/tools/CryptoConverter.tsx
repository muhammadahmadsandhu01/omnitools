'use client';

import {
  AlertTriangle,
  ArrowRightLeft,
  Calculator,
  Check,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Clock,
  Info,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export * from './cryptoConverterEngine';
import {
  type RateMap,
  type NormalizedRatesPayload,
  type HistoricalChartPoint,
  TOP_FIAT_CURRENCIES,
  TOP_CRYPTO_CURRENCIES,
  QUICK_CURRENCY_CODES,
  POPULAR_PAIRS,
  isCryptoCurrency,
  calculateConversion,
  generateCalculationAudit,
  formatCurrencyAmount,
  validateAmountInput,
  getConsolidatedMarketRates,
  getHistoricalChartData,
} from './cryptoConverterEngine';

/* =========================================================================
   REACT COMPONENT UI LAYER
   ========================================================================= */

export default function CryptoConverter() {
  const [ratesPayload, setRatesPayload] = useState<NormalizedRatesPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // User input states
  const [amountStr, setAmountStr] = useState('1');
  const [debouncedAmount, setDebouncedAmount] = useState(1);
  const [fromCur, setFromCur] = useState('USD');
  const [toCur, setToCur] = useState('PKR');

  // Commercial markup & fee simulator states
  const [includeMarkup, setIncludeMarkup] = useState(false);
  const [markupOption, setMarkupOption] = useState('2');
  const [customMarkup, setCustomMarkup] = useState('4');
  const [fixedFeeStr, setFixedFeeStr] = useState('0');

  // Audit breakdown accordion state
  const [showAuditPanel, setShowAuditPanel] = useState(false);

  // Chart states
  const [chartPoints, setChartPoints] = useState<HistoricalChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartMessage, setChartMessage] = useState('');

  const [copied, setCopied] = useState(false);

  // Active rate map
  const rateMap: RateMap = useMemo(() => {
    return ratesPayload?.rates || {};
  }, [ratesPayload]);

  // Currencies list
  const availableOtherCurrencies = useMemo(() => {
    const topCodes = new Set([
      ...TOP_FIAT_CURRENCIES.map((c) => c.code),
      ...TOP_CRYPTO_CURRENCIES.map((c) => c.code),
    ]);

    return Object.keys(rateMap)
      .filter((code) => !topCodes.has(code))
      .sort();
  }, [rateMap]);

  // Primary market rate data fetcher
  const loadMarketRates = useCallback(async (forceRefresh = false) => {
    setRefreshing(true);
    setErrorMessage(null);

    try {
      const result = await getConsolidatedMarketRates(forceRefresh);
      setRatesPayload(result.payload);

      if (result.errorMessage) {
        setErrorMessage(result.errorMessage);
      } else if (result.warningMessage) {
        setStatusNotification(result.warningMessage);
      } else {
        setStatusNotification(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to synchronize market rates.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initialize from URL parameters or timezone locale
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window === 'undefined') return;

      const params = new URLSearchParams(window.location.search);
      const urlAmt = params.get('amount');
      const urlFrom = params.get('from')?.toUpperCase().trim();
      const urlTo = params.get('to')?.toUpperCase().trim();
      const urlMarkup = params.get('markup');

      if (urlAmt) {
        const validated = validateAmountInput(urlAmt);
        if (validated.isValid && validated.parsedValue > 0) {
          setAmountStr(urlAmt);
          setDebouncedAmount(validated.parsedValue);
        }
      }

      if (urlFrom && urlFrom.length >= 3) {
        setFromCur(urlFrom);
      }

      if (urlTo && urlTo.length >= 3) {
        setToCur(urlTo);
      } else {
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
          if (tz.includes('Karachi')) setToCur('PKR');
          else if (tz.includes('Kolkata')) setToCur('INR');
          else if (tz.includes('London')) setToCur('GBP');
          else if (tz.includes('Dubai')) setToCur('AED');
          else if (tz.includes('Riyadh')) setToCur('SAR');
          else if (tz.includes('Sydney')) setToCur('AUD');
        } catch {}
      }

      if (urlMarkup) {
        const numMarkup = Number(urlMarkup);
        if (Number.isFinite(numMarkup) && numMarkup > 0) {
          setIncludeMarkup(true);
          if (['1', '2', '3'].includes(urlMarkup)) {
            setMarkupOption(urlMarkup);
          } else {
            setMarkupOption('custom');
            setCustomMarkup(urlMarkup);
          }
        }
      }

      void loadMarketRates(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [loadMarketRates]);

  // Debounce amount input and synchronize shareable URL
  const isFirstSyncRef = useRef(true);
  useEffect(() => {
    const handler = setTimeout(() => {
      const validated = validateAmountInput(amountStr);
      setDebouncedAmount(validated.isValid ? validated.parsedValue : 0);

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);

        if (amountStr.trim() && amountStr.trim() !== '1') {
          url.searchParams.set('amount', amountStr.trim());
        } else {
          url.searchParams.delete('amount');
        }

        url.searchParams.set('from', fromCur);
        url.searchParams.set('to', toCur);

        if (includeMarkup) {
          const effectivePct = markupOption === 'custom' ? customMarkup : markupOption;
          url.searchParams.set('markup', effectivePct);
        } else {
          url.searchParams.delete('markup');
        }

        if (!isFirstSyncRef.current) {
          window.history.replaceState({}, '', url.toString());
        } else {
          isFirstSyncRef.current = false;
        }
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [amountStr, fromCur, toCur, includeMarkup, markupOption, customMarkup]);

  // Compute active markup percentage and fixed fee
  const activeMarkupPercent = useMemo(() => {
    if (!includeMarkup) return 0;
    if (markupOption === 'custom') {
      const val = Number(customMarkup);
      return Number.isFinite(val) && val >= 0 ? val : 0;
    }
    return Number(markupOption) || 0;
  }, [includeMarkup, markupOption, customMarkup]);

  const activeFixedFee = useMemo(() => {
    if (!includeMarkup) return 0;
    const val = Number(fixedFeeStr);
    return Number.isFinite(val) && val >= 0 ? val : 0;
  }, [includeMarkup, fixedFeeStr]);

  // Primary conversion calculation using canonical engine
  const conversionResult = useMemo(() => {
    return calculateConversion({
      amount: debouncedAmount,
      fromCur,
      toCur,
      rateMap,
      markupPercent: activeMarkupPercent,
      fixedFee: activeFixedFee,
    });
  }, [debouncedAmount, fromCur, toCur, rateMap, activeMarkupPercent, activeFixedFee]);

  // Audit breakdown derived from canonical result
  const calculationAudit = useMemo(() => {
    return generateCalculationAudit(conversionResult);
  }, [conversionResult]);

  // Load 30-day historical chart points for fiat pairs
  const loadChartData = useCallback(async () => {
    const isFromCrypto = isCryptoCurrency(fromCur);
    const isToCrypto = isCryptoCurrency(toCur);

    if (isFromCrypto || isToCrypto) {
      setChartPoints([]);
      setChartMessage(
        'Historical 30-day trend is charted for fiat currency pairs. Real-time 24h market movement is displayed below for crypto assets.'
      );
      return;
    }

    if (fromCur === toCur) {
      setChartPoints([]);
      setChartMessage('Identical base and target currency selected.');
      return;
    }

    setChartLoading(true);
    setChartMessage('');

    try {
      const result = await getHistoricalChartData(fromCur, toCur);
      setChartPoints(result.points);
      if (result.message && result.points.length === 0) {
        setChartMessage(result.message);
      }
    } catch {
      setChartPoints([]);
      setChartMessage('Historical market trend is temporarily unavailable.');
    } finally {
      setChartLoading(false);
    }
  }, [fromCur, toCur]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading && Object.keys(rateMap).length > 0) {
        void loadChartData();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [loading, fromCur, toCur, rateMap, loadChartData]);

  // Swap currencies with mathematical inversion
  const handleSwap = () => {
    setFromCur(toCur);
    setToCur(fromCur);
  };

  // Copy result to clipboard
  const handleCopy = async () => {
    if (!conversionResult.isValid || conversionResult.rawConvertedAmount === null) return;

    const fromFormatted = formatCurrencyAmount(debouncedAmount, fromCur, isCryptoCurrency(fromCur));
    const toFormatted = formatCurrencyAmount(
      conversionResult.rawConvertedAmount,
      toCur,
      isCryptoCurrency(toCur)
    );
    const text = `${fromFormatted} ${fromCur} = ${toFormatted} ${toCur}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  // Crypto market stats
  const activeCryptoInfo = useMemo(() => {
    const cryptoCur = isCryptoCurrency(fromCur)
      ? fromCur
      : isCryptoCurrency(toCur)
      ? toCur
      : null;
    if (!cryptoCur || !ratesPayload?.cryptoInfo[cryptoCur]) return null;
    return {
      code: cryptoCur,
      ...ratesPayload.cryptoInfo[cryptoCur],
    };
  }, [fromCur, toCur, ratesPayload]);

  // Freshness metadata helpers
  const freshnessLabel = useMemo(() => {
    const state = ratesPayload?.freshness || 'UNAVAILABLE';
    switch (state) {
      case 'LIVE':
        return { text: 'LATEST RATES', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' };
      case 'FRESH_CACHE':
        return { text: 'CACHED (FRESH)', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' };
      case 'STALE_CACHE':
        return { text: 'CACHED (STALE)', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' };
      case 'OFFLINE':
        return { text: 'OFFLINE MODE', color: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800' };
      default:
        return { text: 'RATES UNAVAILABLE', color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' };
    }
  }, [ratesPayload]);

  const sourceName = useMemo(() => {
    if (!ratesPayload) return 'Reference data';
    if (ratesPayload.fiatSource === 'frankfurter') return 'Frankfurter (ECB Daily Reference FX)';
    if (ratesPayload.fiatSource === 'exchangerate-api') return 'ExchangeRate-API (Secondary Fallback)';
    return 'Cached Market Data';
  }, [ratesPayload]);

  const formatTimestamp = (ts: number | null | undefined) => {
    if (!ts) return 'N/A';
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(ts);
  };

  const validation = validateAmountInput(amountStr);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1240px] rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-[#070b14] shadow-sm">
        <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mb-3" />
        <p role="status" className="text-base font-bold text-slate-900 dark:text-white">Synchronizing Market Rates...</p>
        <p className="mt-1 text-xs text-slate-500">Connecting to verified exchange rate providers.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1240px] min-w-0 space-y-6 text-slate-900 dark:text-slate-100">
      {/* Status & Provider Notifications */}
      {statusNotification && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{statusNotification}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Input Form & Controls (5 Cols) */}
        <section className="space-y-5 lg:col-span-5 min-w-0">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-[#070b14] shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Conversion Parameters</h2>
              </div>
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${freshnessLabel.color}`}>
                {freshnessLabel.text}
              </span>
            </div>

            {/* Quick Popular Currency Pair Selectors */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Popular Currency Pairs
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_PAIRS.map((pair) => {
                  const isSelected = fromCur === pair.from && toCur === pair.to;
                  return (
                    <button
                      key={`${pair.from}-${pair.to}`}
                      type="button"
                      onClick={() => {
                        setFromCur(pair.from);
                        setToCur(pair.to);
                      }}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs dark:bg-blue-500'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-slate-800'
                      }`}
                    >
                      {pair.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label htmlFor="currency-amount" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Conversion Amount
              </label>
              <div className="relative">
                <input
                  id="currency-amount"
                  type="text"
                  inputMode="decimal"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="1.00"
                  aria-invalid={!validation.isValid}
                  className={`w-full rounded-2xl border px-4 py-3.5 text-xl font-mono font-bold tracking-tight outline-none transition ${
                    !validation.isValid
                      ? 'border-rose-500 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 focus:ring-4 focus:ring-rose-500/10'
                      : 'border-slate-300 bg-slate-50 dark:border-slate-700/80 dark:bg-slate-950 text-slate-950 dark:text-white hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                  }`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">
                  {fromCur}
                </span>
              </div>
              {!validation.isValid && (
                <p className="mt-1.5 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                  {validation.errorMessage}
                </p>
              )}
            </div>

            {/* From & To Currency Selectors with Dedicated Swap Button */}
            <div className="flex flex-col gap-3 min-w-0">
              {/* From Currency */}
              <div>
                <label htmlFor="currency-from" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  From (Source Currency)
                </label>
                <select
                  id="currency-from"
                  value={fromCur}
                  onChange={(e) => setFromCur(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 dark:border-slate-700/80 dark:bg-slate-950 dark:text-slate-100 outline-none hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <optgroup label="Major Fiat Currencies">
                    {TOP_FIAT_CURRENCIES.map((c) => (
                      <option key={`from-${c.code}`} value={c.code}>
                        {c.code} — {c.name} ({c.symbol})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Major Cryptocurrencies">
                    {TOP_CRYPTO_CURRENCIES.map((c) => (
                      <option key={`from-${c.code}`} value={c.code}>
                        {c.code} — {c.name} ({c.symbol})
                      </option>
                    ))}
                  </optgroup>
                  {availableOtherCurrencies.length > 0 && (
                    <optgroup label="Additional World Currencies">
                      {availableOtherCurrencies.map((code) => (
                        <option key={`from-${code}`} value={code}>
                          {code}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Central Swap Action Button */}
              <div className="flex justify-center py-1">
                <button
                  type="button"
                  onClick={handleSwap}
                  aria-label={`Swap ${fromCur} and ${toCur}`}
                  title="Swap currencies"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-600 shadow-md transition hover:scale-110 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-400 dark:hover:bg-slate-800"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </button>
              </div>

              {/* To Currency */}
              <div>
                <label htmlFor="currency-to" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  To (Target Currency)
                </label>
                <select
                  id="currency-to"
                  value={toCur}
                  onChange={(e) => setToCur(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 dark:border-slate-700/80 dark:bg-slate-950 dark:text-slate-100 outline-none hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <optgroup label="Major Fiat Currencies">
                    {TOP_FIAT_CURRENCIES.map((c) => (
                      <option key={`to-${c.code}`} value={c.code}>
                        {c.code} — {c.name} ({c.symbol})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Major Cryptocurrencies">
                    {TOP_CRYPTO_CURRENCIES.map((c) => (
                      <option key={`to-${c.code}`} value={c.code}>
                        {c.code} — {c.name} ({c.symbol})
                      </option>
                    ))}
                  </optgroup>
                  {availableOtherCurrencies.length > 0 && (
                    <optgroup label="Additional World Currencies">
                      {availableOtherCurrencies.map((code) => (
                        <option key={`to-${code}`} value={code}>
                          {code}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>

            {/* Commercial Spread / Fee Simulator */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-3 min-w-0">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMarkup}
                  onChange={(e) => setIncludeMarkup(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                />
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Simulate Card / Bank Spread & Fee
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Models realistic retail conversion costs (card markup spread or fixed gateway fee) over reference rates.
                  </span>
                </div>
              </label>

              {includeMarkup && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="min-w-0 w-full">
                    <label htmlFor="spread-select" className="block text-[10px] font-bold uppercase text-slate-500 mb-1 leading-tight break-words">
                      Exchange Markup Spread
                    </label>
                    <div className="flex items-center gap-2 w-full min-w-0">
                      <select
                        id="spread-select"
                        value={markupOption}
                        onChange={(e) => setMarkupOption(e.target.value)}
                        className="flex-1 min-w-0 w-full max-w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 outline-none"
                      >
                        <option value="1">1% (Low Tier)</option>
                        <option value="2">2% (Typical Card)</option>
                        <option value="3">3% (Bank FX)</option>
                        <option value="custom">Custom %</option>
                      </select>
                      {markupOption === 'custom' && (
                        <div className="relative shrink-0 w-16 min-w-0 max-w-[40%]">
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={customMarkup}
                            onChange={(e) => setCustomMarkup(e.target.value)}
                            placeholder="0.0"
                            className="w-full min-w-0 max-w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-xs text-right font-mono dark:border-slate-700 dark:bg-slate-900 outline-none"
                          />
                          <span className="pointer-events-none absolute right-1.5 top-1.5 text-[10px] text-slate-400">%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 w-full">
                    <label htmlFor="fixed-fee-input" className="block text-[10px] font-bold uppercase text-slate-500 mb-1 leading-tight break-words">
                      Fixed Transaction Fee ({toCur})
                    </label>
                    <input
                      id="fixed-fee-input"
                      type="number"
                      min="0"
                      step="any"
                      value={fixedFeeStr}
                      onChange={(e) => setFixedFeeStr(e.target.value)}
                      placeholder="0.00"
                      className="w-full min-w-0 max-w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => void loadMarketRates(true)}
              disabled={refreshing}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Synchronizing Rates...' : 'Refresh Market Exchange Rates'}
            </button>
          </div>
        </section>

        {/* Right Column: Hero Result, Audit Breakdown, Charts & Quick Rates (7 Cols) */}
        <section className="space-y-5 lg:col-span-7 min-w-0">
          {/* Main Converted Output Hero Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
            <TrendingUp className="pointer-events-none absolute -right-6 -bottom-6 h-40 w-40 text-white/10" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                  Estimated Total Converted Value
                </span>
                <span className="rounded-full bg-white/15 px-3 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                  {toCur}
                </span>
              </div>

              {/* Converted Amount Primary Display */}
              <div className="text-3xl sm:text-5xl font-extrabold tracking-tight font-mono whitespace-nowrap overflow-x-auto py-1">
                {conversionResult.isValid && conversionResult.rawConvertedAmount !== null ? (
                  formatCurrencyAmount(
                    conversionResult.rawConvertedAmount,
                    toCur,
                    isCryptoCurrency(toCur)
                  )
                ) : (
                  <span className="text-white/60 text-2xl font-sans">—</span>
                )}
              </div>

              {/* Conversion Reference & Copy Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-black/25 px-3.5 py-1.5 text-xs font-mono font-medium backdrop-blur-md">
                  <Info className="h-3.5 w-3.5 shrink-0 text-blue-200" />
                  <span>
                    1 {fromCur} ={' '}
                    {conversionResult.effectiveRate !== null
                      ? formatCurrencyAmount(
                          conversionResult.effectiveRate,
                          toCur,
                          isCryptoCurrency(toCur)
                        )
                      : '—'}{' '}
                    {toCur}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  disabled={!conversionResult.isValid}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/30 disabled:opacity-50"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Clipboard className="h-3.5 w-3.5" />
                      Copy Pair
                    </>
                  )}
                </button>
              </div>

              {includeMarkup && (
                <p className="text-[11px] text-blue-100/90 pt-1">
                  Adjusted for simulated {activeMarkupPercent}% spread
                  {activeFixedFee > 0 ? ` and ${activeFixedFee} ${toCur} fixed fee` : ''}.
                </p>
              )}
            </div>
          </div>

          {/* Calculation Audit / Breakdown Panel */}
          <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#070b14] shadow-sm overflow-hidden min-w-0">
            <button
              type="button"
              onClick={() => setShowAuditPanel((prev) => !prev)}
              aria-expanded={showAuditPanel}
              className="flex w-full items-center justify-between p-4 sm:px-6 text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Transparent Calculation Breakdown & Audit</span>
              </div>
              {showAuditPanel ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {showAuditPanel && calculationAudit && (
              <div className="border-t border-slate-200 dark:border-slate-800 p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40 space-y-3 font-mono text-xs">
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span>Input Principal:</span>
                  <span className="text-right text-slate-900 dark:text-white font-bold">
                    {calculationAudit.amount} {calculationAudit.fromCur}
                  </span>

                  <span>Base Market Rate:</span>
                  <span className="text-right text-slate-900 dark:text-white font-bold">
                    1 {fromCur} = {calculationAudit.referenceRate.toFixed(6)} {toCur}
                  </span>

                  <span>Applied Spread:</span>
                  <span className="text-right text-amber-600 dark:text-amber-400 font-bold">
                    +{calculationAudit.markupPercent.toFixed(2)}% (+{calculationAudit.markupCost.toFixed(2)} {toCur})
                  </span>

                  {calculationAudit.fixedFee > 0 && (
                    <>
                      <span>Fixed Transaction Fee:</span>
                      <span className="text-right text-rose-600 dark:text-rose-400 font-bold">
                        -{calculationAudit.fixedFee.toFixed(2)} {toCur}
                      </span>
                    </>
                  )}

                  <span>Effective Client Rate:</span>
                  <span className="text-right text-blue-600 dark:text-blue-400 font-bold">
                    1 {fromCur} = {calculationAudit.effectiveRate.toFixed(6)} {toCur}
                  </span>

                  <span>Net Converted Amount:</span>
                  <span className="text-right text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    {calculationAudit.finalAmount.toFixed(4)} {toCur}
                  </span>
                </div>

                <div className="pt-1 text-[11px] text-slate-500 font-sans">
                  <strong>Auditable Formula:</strong> <code>{calculationAudit.formula}</code>
                </div>
              </div>
            )}
          </div>

          {/* Historical Trend / Crypto Market Movement Chart Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-[#070b14] shadow-sm space-y-4 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isCryptoCurrency(fromCur) || isCryptoCurrency(toCur)
                    ? 'Crypto Market Movement'
                    : `30-Day FX Historical Trend (${fromCur}/${toCur})`}
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">
                {chartLoading ? 'Loading data...' : 'Historical Reference'}
              </span>
            </div>

            {chartPoints.length > 0 ? (
              <div className="h-48 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartPoints}>
                    <XAxis dataKey="date" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                      formatter={(val: unknown) => [
                        `${Number(val).toFixed(4)} ${toCur}`,
                        `${fromCur}/${toCur}`,
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-4 text-center text-xs text-slate-500">
                {chartMessage || 'No chart data available for this selection.'}
              </div>
            )}

            {/* Crypto 24h market stats banner */}
            {activeCryptoInfo && (
              <div className="flex flex-wrap items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs">
                <div>
                  <span className="text-slate-500">{activeCryptoInfo.code} 24h Change: </span>
                  <span
                    className={`font-mono font-bold ${
                      (activeCryptoInfo.change24h ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {(activeCryptoInfo.change24h ?? 0) >= 0 ? '+' : ''}
                    {activeCryptoInfo.change24h !== null ? activeCryptoInfo.change24h.toFixed(2) : '0.00'}%
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Last trade: {formatTimestamp(activeCryptoInfo.lastUpdatedAt)}
                </div>
              </div>
            )}
          </div>

          {/* Quick Conversion Cards (Canonical Engine Powered) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-[#070b14] shadow-sm space-y-3 min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Quick Conversions ({debouncedAmount} {fromCur})
            </h3>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {QUICK_CURRENCY_CODES.map((code) => {
                if (code === fromCur || !rateMap[code]) return null;

                const quickResult = calculateConversion({
                  amount: debouncedAmount,
                  fromCur,
                  toCur: code,
                  rateMap,
                  markupPercent: activeMarkupPercent,
                  fixedFee: 0,
                });

                if (!quickResult.isValid || quickResult.rawConvertedAmount === null) return null;

                return (
                  <div
                    key={`quick-${code}`}
                    className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-900/50 min-w-0"
                  >
                    <span className="text-[10px] font-bold text-slate-500">{code}</span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">
                      {formatCurrencyAmount(
                        quickResult.rawConvertedAmount,
                        code,
                        isCryptoCurrency(code)
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Provenance & Privacy Disclosure Footer */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[11px] leading-relaxed text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              <span>Data Provenance & Privacy Guarantee</span>
            </div>
            <p>
              Primary Source: <strong>{sourceName}</strong> · Rates synchronized: {formatTimestamp(ratesPayload?.timestamp)}.
            </p>
            <p>
              Fiat exchange rates represent institutional daily reference data. Cryptocurrency prices represent continuous orderbook feeds.
            </p>
            <p className="text-emerald-700 dark:text-emerald-400 font-medium">
              Privacy Notice: Conversion amounts and calculations execute 100% locally in your browser. Amounts are never sent to external rate providers.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
