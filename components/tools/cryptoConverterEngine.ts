/**
 * KivaroTools Currency & Crypto Conversion Engine
 *
 * Deterministic mathematical conversion engine and multi-source market rate aggregator.
 * Sourced from:
 * 1. European Central Bank (ECB) daily reference rates via Frankfurter API (Primary Fiat)
 * 2. Open ExchangeRate-API (Secondary Fiat Fallback)
 * 3. CoinGecko Order Book Volume-Weighted Spot Prices (Cryptocurrencies)
 */

/* =========================================================================
   1. TYPES & DOMAIN INTERFACES
   ========================================================================= */

export type CurrencyType = 'fiat' | 'crypto';

export type FreshnessState =
  | 'LIVE'
  | 'FRESH_CACHE'
  | 'STALE_CACHE'
  | 'OFFLINE'
  | 'UNAVAILABLE';

export type FiatProviderSource = 'frankfurter' | 'exchangerate-api' | 'cache' | 'none';

export interface CurrencyMetadata {
  code: string;
  name: string;
  type: CurrencyType;
  symbol: string;
  flag?: string;
  decimals: number;
}

export type RateMap = Record<string, number>;

export interface CryptoMarketInfo {
  usdPrice: number;
  change24h: number | null;
  lastUpdatedAt: number | null;
}

export interface NormalizedRatesPayload {
  timestamp: number;
  rates: RateMap;
  cryptoInfo: Record<string, CryptoMarketInfo>;
  fiatSource: FiatProviderSource;
  fiatDataUpdatedAt: number | null;
  freshness: FreshnessState;
  schemaVersion: number;
}

export interface ConversionParams {
  amount: number;
  fromCur: string;
  toCur: string;
  rateMap: RateMap;
  markupPercent?: number;
  fixedFee?: number;
}

export interface ConversionResult {
  amount: number;
  fromCur: string;
  toCur: string;
  referenceRate: number | null;
  markupPercent: number;
  fixedFee: number;
  effectiveRate: number | null;
  rawConvertedAmount: number | null;
  isValid: boolean;
  errorMessage?: string;
}

export interface CalculationAudit {
  amount: number;
  fromCur: string;
  toCur: string;
  referenceRate: number;
  effectiveRate: number;
  markupPercent: number;
  markupCost: number;
  fixedFee: number;
  grossAmount: number;
  finalAmount: number;
  formula: string;
}

export interface HistoricalChartPoint {
  date: string;
  isoDate: string;
  timestamp: number;
  rate: number;
}

export interface ProviderErrorDetails {
  provider: string;
  code: 'NETWORK_ERROR' | 'TIMEOUT' | 'INVALID_RESPONSE' | 'RATE_LIMIT' | 'HTTP_ERROR';
  message: string;
  status?: number;
}

/* =========================================================================
   2. DOMAIN CONSTANTS & CURRENCY UNIVERSE
   ========================================================================= */

export const TOP_FIAT_CURRENCIES: CurrencyMetadata[] = [
  { code: 'USD', name: 'US Dollar', type: 'fiat', symbol: '$', flag: '🇺🇸', decimals: 2 },
  { code: 'EUR', name: 'Euro', type: 'fiat', symbol: '€', flag: '🇪🇺', decimals: 2 },
  { code: 'GBP', name: 'British Pound', type: 'fiat', symbol: '£', flag: '🇬🇧', decimals: 2 },
  { code: 'PKR', name: 'Pakistani Rupee', type: 'fiat', symbol: '₨', flag: '🇵🇰', decimals: 2 },
  { code: 'INR', name: 'Indian Rupee', type: 'fiat', symbol: '₹', flag: '🇮🇳', decimals: 2 },
  { code: 'AUD', name: 'Australian Dollar', type: 'fiat', symbol: 'A$', flag: '🇦🇺', decimals: 2 },
  { code: 'CAD', name: 'Canadian Dollar', type: 'fiat', symbol: 'C$', flag: '🇨🇦', decimals: 2 },
  { code: 'AED', name: 'UAE Dirham', type: 'fiat', symbol: 'د.إ', flag: '🇦🇪', decimals: 2 },
  { code: 'SAR', name: 'Saudi Riyal', type: 'fiat', symbol: '﷼', flag: '🇸🇦', decimals: 2 },
  { code: 'JPY', name: 'Japanese Yen', type: 'fiat', symbol: '¥', flag: '🇯🇵', decimals: 0 },
  { code: 'CNY', name: 'Chinese Yuan', type: 'fiat', symbol: '¥', flag: '🇨🇳', decimals: 2 },
  { code: 'SGD', name: 'Singapore Dollar', type: 'fiat', symbol: 'S$', flag: '🇸🇬', decimals: 2 },
  { code: 'CHF', name: 'Swiss Franc', type: 'fiat', symbol: 'CHF', flag: '🇨🇭', decimals: 2 },
  { code: 'NZD', name: 'New Zealand Dollar', type: 'fiat', symbol: 'NZ$', flag: '🇳🇿', decimals: 2 },
  { code: 'HKD', name: 'Hong Kong Dollar', type: 'fiat', symbol: 'HK$', flag: '🇭🇰', decimals: 2 },
  { code: 'TRY', name: 'Turkish Lira', type: 'fiat', symbol: '₺', flag: '🇹🇷', decimals: 2 },
  { code: 'BRL', name: 'Brazilian Real', type: 'fiat', symbol: 'R$', flag: '🇧🇷', decimals: 2 },
  { code: 'ZAR', name: 'South African Rand', type: 'fiat', symbol: 'R', flag: '🇿🇦', decimals: 2 },
  { code: 'KRW', name: 'South Korean Won', type: 'fiat', symbol: '₩', flag: '🇰🇷', decimals: 0 },
];

export const TOP_CRYPTO_CURRENCIES: CurrencyMetadata[] = [
  { code: 'BTC', name: 'Bitcoin', type: 'crypto', symbol: '₿', flag: '🪙', decimals: 8 },
  { code: 'ETH', name: 'Ethereum', type: 'crypto', symbol: 'Ξ', flag: '🪙', decimals: 8 },
  { code: 'USDT', name: 'Tether USD', type: 'crypto', symbol: '₮', flag: '🪙', decimals: 4 },
  { code: 'BNB', name: 'BNB', type: 'crypto', symbol: 'BNB', flag: '🪙', decimals: 6 },
  { code: 'SOL', name: 'Solana', type: 'crypto', symbol: 'SOL', flag: '🪙', decimals: 6 },
  { code: 'XRP', name: 'XRP', type: 'crypto', symbol: 'XRP', flag: '🪙', decimals: 6 },
  { code: 'ADA', name: 'Cardano', type: 'crypto', symbol: 'ADA', flag: '🪙', decimals: 6 },
  { code: 'DOGE', name: 'Dogecoin', type: 'crypto', symbol: 'Ð', flag: '🪙', decimals: 4 },
];

export const CRYPTO_COINGECKO_MAP: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  BNB: 'binancecoin',
  SOL: 'solana',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
};

const METADATA_MAP: Record<string, CurrencyMetadata> = {};
for (const item of [...TOP_FIAT_CURRENCIES, ...TOP_CRYPTO_CURRENCIES]) {
  METADATA_MAP[item.code] = item;
}

export const QUICK_CURRENCY_CODES = ['EUR', 'GBP', 'PKR', 'INR', 'BTC', 'ETH', 'AED', 'SAR'];

export const POPULAR_PAIRS = [
  { from: 'USD', to: 'EUR', label: 'USD to EUR' },
  { from: 'EUR', to: 'USD', label: 'EUR to USD' },
  { from: 'USD', to: 'PKR', label: 'USD to PKR' },
  { from: 'GBP', to: 'PKR', label: 'GBP to PKR' },
  { from: 'USD', to: 'INR', label: 'USD to INR' },
  { from: 'USD', to: 'AED', label: 'USD to AED' },
  { from: 'BTC', to: 'USD', label: 'BTC to USD' },
  { from: 'ETH', to: 'USD', label: 'ETH to USD' },
  { from: 'SOL', to: 'USD', label: 'SOL to USD' },
  { from: 'BTC', to: 'PKR', label: 'BTC to PKR' },
];

export const CURRENT_CACHE_VERSION = 3;
export const CACHE_STORAGE_KEY = 'kivarotools_currency_rates_v3';
export const CHART_CACHE_PREFIX = 'kivarotools_fx_chart_v2';

export const FIAT_CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours for Frankfurter daily FX
export const FALLBACK_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes for fallback provider
export const CRYPTO_FRESHNESS_TTL_MS = 10 * 60 * 1000; // 10 minutes for crypto
export const CHART_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours for 30-day historical points

const COINGECKO_DEMO_KEY =
  typeof process !== 'undefined'
    ? process.env?.NEXT_PUBLIC_COINGECKO_DEMO_API_KEY?.trim() || ''
    : '';

let globalFetchSequence = 0;

/* =========================================================================
   3. PURE FINANCIAL CONVERSION ENGINE (Deterministic Mathematics)
   ========================================================================= */

/**
 * Returns metadata for a given currency code, falling back to sensible defaults.
 */
export function getCurrencyMetadata(code: string): CurrencyMetadata {
  const upper = (code || '').toUpperCase().trim();
  if (METADATA_MAP[upper]) {
    return METADATA_MAP[upper];
  }
  const isCryptoAsset = Boolean(CRYPTO_COINGECKO_MAP[upper]);
  return {
    code: upper,
    name: upper,
    type: isCryptoAsset ? 'crypto' : 'fiat',
    symbol: upper,
    decimals: isCryptoAsset ? 6 : 2,
  };
}

export function isCryptoCurrency(code: string): boolean {
  const upper = (code || '').toUpperCase().trim();
  return Boolean(CRYPTO_COINGECKO_MAP[upper]);
}

/**
 * Calculates raw, unrounded cross-rate between fromCur and toCur.
 * In the canonical reference model, all rateMap values express units per 1 USD (USD = 1.0).
 *
 * Formula:
 * rate(from -> to) = rateMap[to] / rateMap[from]
 */
export function calculateCrossRate(
  fromCur: string,
  toCur: string,
  rateMap: RateMap
): number | null {
  const from = (fromCur || '').toUpperCase().trim();
  const to = (toCur || '').toUpperCase().trim();

  if (!from || !to) return null;

  const rateFrom = rateMap[from];
  const rateTo = rateMap[to];

  if (
    typeof rateFrom !== 'number' ||
    typeof rateTo !== 'number' ||
    !Number.isFinite(rateFrom) ||
    !Number.isFinite(rateTo) ||
    rateFrom <= 0 ||
    rateTo <= 0
  ) {
    return null;
  }

  if (from === to) {
    return 1.0;
  }

  // Exact unrounded intermediate quotient
  return rateTo / rateFrom;
}

/**
 * Executes a full deterministic currency conversion with spread/markup and optional fixed fee.
 *
 * Semantics:
 * 1. referenceRate = rateMap[to] / rateMap[from]
 * 2. effectiveRate = referenceRate * (1 + markupPercent / 100)
 * 3. rawConvertedAmount = Math.max(0, amount * effectiveRate - fixedFee)
 */
export function calculateConversion({
  amount,
  fromCur,
  toCur,
  rateMap,
  markupPercent = 0,
  fixedFee = 0,
}: ConversionParams): ConversionResult {
  const from = (fromCur || '').toUpperCase().trim();
  const to = (toCur || '').toUpperCase().trim();

  // Validate amount
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
    return {
      amount: 0,
      fromCur: from,
      toCur: to,
      referenceRate: null,
      markupPercent: Math.max(0, markupPercent),
      fixedFee: Math.max(0, fixedFee),
      effectiveRate: null,
      rawConvertedAmount: null,
      isValid: false,
      errorMessage: 'Invalid conversion amount: must be a non-negative finite number.',
    };
  }

  const referenceRate = calculateCrossRate(from, to, rateMap);

  if (referenceRate === null) {
    return {
      amount,
      fromCur: from,
      toCur: to,
      referenceRate: null,
      markupPercent: Math.max(0, markupPercent),
      fixedFee: Math.max(0, fixedFee),
      effectiveRate: null,
      rawConvertedAmount: null,
      isValid: false,
      errorMessage: `Exchange rate data for pair ${from}/${to} is unavailable.`,
    };
  }

  const safeMarkup = Math.max(0, markupPercent);
  const safeFee = Math.max(0, fixedFee);

  const effectiveRate = referenceRate * (1 + safeMarkup / 100);
  const grossAmount = amount * effectiveRate;
  const rawConvertedAmount = Math.max(0, grossAmount - safeFee);

  return {
    amount,
    fromCur: from,
    toCur: to,
    referenceRate,
    markupPercent: safeMarkup,
    fixedFee: safeFee,
    effectiveRate,
    rawConvertedAmount,
    isValid: true,
  };
}

/**
 * Calculates inverse conversion rate and proves reciprocal invariant.
 */
export function calculateInverseRate(
  referenceRate: number,
  markupPercent = 0
): {
  inverseReference: number;
  inverseEffective: number;
  reciprocalProduct: number;
} {
  if (!Number.isFinite(referenceRate) || referenceRate <= 0) {
    return { inverseReference: 0, inverseEffective: 0, reciprocalProduct: 0 };
  }

  const inverseReference = 1 / referenceRate;
  const inverseEffective = inverseReference * (1 + Math.max(0, markupPercent) / 100);
  const reciprocalProduct = referenceRate * inverseReference;

  return {
    inverseReference,
    inverseEffective,
    reciprocalProduct,
  };
}

/**
 * Generates an auditable breakdown of the conversion calculation.
 */
export function generateCalculationAudit(
  result: ConversionResult
): CalculationAudit | null {
  if (
    !result.isValid ||
    result.referenceRate === null ||
    result.effectiveRate === null ||
    result.rawConvertedAmount === null
  ) {
    return null;
  }

  const grossAmount = result.amount * result.effectiveRate;
  const markupCost = result.amount * result.referenceRate * (result.markupPercent / 100);

  const formula =
    result.fixedFee > 0
      ? `(${result.amount} × ${result.referenceRate.toFixed(6)} × (1 + ${result.markupPercent}%)) - ${result.fixedFee}`
      : `${result.amount} × ${result.referenceRate.toFixed(6)} × (1 + ${result.markupPercent}%)`;

  return {
    amount: result.amount,
    fromCur: result.fromCur,
    toCur: result.toCur,
    referenceRate: result.referenceRate,
    effectiveRate: result.effectiveRate,
    markupPercent: result.markupPercent,
    markupCost,
    fixedFee: result.fixedFee,
    grossAmount,
    finalAmount: result.rawConvertedAmount,
    formula,
  };
}

/**
 * Formats monetary amounts safely without premature rounding or scientific notation.
 * Preserves satoshi precision for crypto and sub-cent precision for micro-fiat.
 */
export function formatCurrencyAmount(
  value: number | null,
  currencyCode: string,
  isCrypto = false,
  options?: {
    maxDecimals?: number;
    minDecimals?: number;
  }
): string {
  if (value === null || typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }

  if (value === 0) {
    return isCrypto ? '0.0000' : '0.00';
  }

  const absVal = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  let maxDecimals: number;
  let minDecimals = options?.minDecimals ?? 2;

  if (options?.maxDecimals !== undefined) {
    maxDecimals = options.maxDecimals;
  } else if (isCrypto) {
    const upper = currencyCode.toUpperCase();
    if (upper === 'BTC' || upper === 'ETH') {
      maxDecimals = 8;
      minDecimals = 4;
    } else {
      maxDecimals = 6;
      minDecimals = 2;
    }
  } else {
    // Fiat currencies
    const meta = getCurrencyMetadata(currencyCode);
    if (meta.decimals === 0) {
      maxDecimals = 0;
      minDecimals = 0;
    } else if (absVal < 0.0001) {
      maxDecimals = 8;
      minDecimals = 4;
    } else if (absVal < 0.01) {
      maxDecimals = 6;
      minDecimals = 4;
    } else {
      maxDecimals = 2;
      minDecimals = 2;
    }
  }

  // Handle tiny numbers without scientific notation
  const formattedNumber = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(absVal);

  return `${sign}${formattedNumber}`;
}

/**
 * Sanitizes and validates user amount input text.
 */
export function validateAmountInput(rawInput: string): {
  isValid: boolean;
  parsedValue: number;
  sanitizedString: string;
  errorMessage?: string;
} {
  const trimmed = (rawInput || '').trim();

  if (trimmed === '') {
    return {
      isValid: true,
      parsedValue: 0,
      sanitizedString: '',
    };
  }

  // Locale-aware number parsing: handles US (1,500.75), EU (1.500,75 or 1500,75), and standard decimals
  let normalized = trimmed;
  if (normalized.includes(',') && normalized.includes('.')) {
    const lastComma = normalized.lastIndexOf(',');
    const lastDot = normalized.lastIndexOf('.');
    if (lastComma < lastDot) {
      // US format: 1,500.75 -> remove thousand commas
      normalized = normalized.replace(/,/g, '');
    } else {
      // European format: 1.500,75 -> remove thousand periods, convert comma to decimal point
      normalized = normalized.replace(/\./g, '').replace(/,/g, '.');
    }
  } else if (normalized.includes(',')) {
    // Comma-only decimal format: 1500,75 or 125,50
    normalized = normalized.replace(/,/g, '.');
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || isNaN(parsed)) {
    return {
      isValid: false,
      parsedValue: 0,
      sanitizedString: trimmed,
      errorMessage: 'Please enter a valid numeric amount.',
    };
  }

  if (parsed < 0) {
    return {
      isValid: false,
      parsedValue: 0,
      sanitizedString: trimmed,
      errorMessage: 'Amount cannot be negative.',
    };
  }

  if (parsed > 1e15) {
    return {
      isValid: false,
      parsedValue: 1e15,
      sanitizedString: trimmed,
      errorMessage: 'Amount exceeds maximum supported limit (1 quadrillion).',
    };
  }

  return {
    isValid: true,
    parsedValue: parsed,
    sanitizedString: trimmed,
  };
}

/**
 * Validates, filters, deduplicates, and sorts historical exchange rate points chronologically.
 */
export function filterAndSortHistoricalPoints(
  rawPoints: Array<{ date?: unknown; rate?: unknown }>
): HistoricalChartPoint[] {
  if (!Array.isArray(rawPoints)) return [];

  const validPoints: HistoricalChartPoint[] = [];
  const seenDates = new Set<string>();

  for (const pt of rawPoints) {
    if (!pt || typeof pt !== 'object') continue;

    const rate = Number(pt.rate);
    if (!Number.isFinite(rate) || rate <= 0) continue;

    let isoDate = '';
    if (typeof pt.date === 'string' && pt.date.length >= 10) {
      isoDate = pt.date.slice(0, 10);
    } else {
      continue;
    }

    if (seenDates.has(isoDate)) continue;
    seenDates.add(isoDate);

    const timestamp = new Date(`${isoDate}T00:00:00Z`).getTime();
    if (isNaN(timestamp)) continue;

    const displayDate = new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    validPoints.push({
      date: displayDate,
      isoDate,
      timestamp,
      rate,
    });
  }

  // Sort ascending by timestamp
  validPoints.sort((a, b) => a.timestamp - b.timestamp);

  return validPoints;
}

/* =========================================================================
   4. DATA PROVIDER RESILIENCE & CACHE INFRASTRUCTURE
   ========================================================================= */

export function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Robust JSON fetch wrapper with AbortController timeout.
 */
export async function fetchWithTimeout<T>(
  url: string,
  timeoutMs = 12000,
  options?: RequestInit
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options?.headers || {}),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const err: ProviderErrorDetails = {
        provider: url,
        code: response.status === 429 ? 'RATE_LIMIT' : 'HTTP_ERROR',
        status: response.status,
        message: `HTTP ${response.status} from ${new URL(url).hostname}`,
      };
      throw err;
    }

    const json = (await response.json()) as T;
    return json;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      throw error;
    }
    const isTimeout =
      error instanceof Error &&
      (error.name === 'AbortError' || error.message.includes('aborted'));
    const err: ProviderErrorDetails = {
      provider: url,
      code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
      message: isTimeout ? 'Request timed out' : 'Network communication error',
    };
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches and strictly validates fiat rates from Frankfurter API (Primary).
 */
export async function fetchFrankfurterRates(): Promise<{
  rates: RateMap;
  updatedAt: number;
  source: 'frankfurter';
}> {
  const data = await fetchWithTimeout<unknown>(
    'https://api.frankfurter.dev/v2/rates?base=USD',
    10000
  );

  if (!Array.isArray(data) || data.length === 0) {
    throw {
      provider: 'frankfurter',
      code: 'INVALID_RESPONSE',
      message: 'Frankfurter response is not a valid non-empty array.',
    } satisfies ProviderErrorDetails;
  }

  const rates: RateMap = { USD: 1.0 };
  let latestDate = '';

  for (const item of data) {
    if (!item || typeof item !== 'object') continue;
    const { quote, rate, date } = item as { quote?: unknown; rate?: unknown; date?: unknown };

    if (
      typeof quote === 'string' &&
      quote.length >= 3 &&
      typeof rate === 'number' &&
      Number.isFinite(rate) &&
      rate > 0
    ) {
      rates[quote.toUpperCase()] = rate;
    }

    if (typeof date === 'string' && date > latestDate) {
      latestDate = date;
    }
  }

  if (Object.keys(rates).length <= 2) {
    throw {
      provider: 'frankfurter',
      code: 'INVALID_RESPONSE',
      message: 'Frankfurter returned insufficient currency pairs.',
    } satisfies ProviderErrorDetails;
  }

  const updatedAt = latestDate
    ? new Date(`${latestDate}T00:00:00Z`).getTime()
    : Date.now();

  return {
    rates,
    updatedAt: isNaN(updatedAt) ? Date.now() : updatedAt,
    source: 'frankfurter',
  };
}

/**
 * Fetches and strictly validates fiat rates from Open ExchangeRate-API (Secondary Fallback).
 */
export async function fetchFallbackExchangeRates(): Promise<{
  rates: RateMap;
  updatedAt: number;
  source: 'exchangerate-api';
}> {
  const data = await fetchWithTimeout<{
    result?: unknown;
    rates?: unknown;
    time_last_update_unix?: unknown;
  }>('https://open.er-api.com/v6/latest/USD', 10000);

  if (
    !data ||
    typeof data !== 'object' ||
    data.result !== 'success' ||
    !data.rates ||
    typeof data.rates !== 'object'
  ) {
    throw {
      provider: 'exchangerate-api',
      code: 'INVALID_RESPONSE',
      message: 'Fallback provider returned an invalid payload structure.',
    } satisfies ProviderErrorDetails;
  }

  const rates: RateMap = { USD: 1.0 };
  for (const [code, rate] of Object.entries(data.rates as Record<string, unknown>)) {
    if (typeof rate === 'number' && Number.isFinite(rate) && rate > 0) {
      rates[code.toUpperCase()] = rate;
    }
  }

  if (Object.keys(rates).length <= 2) {
    throw {
      provider: 'exchangerate-api',
      code: 'INVALID_RESPONSE',
      message: 'Fallback provider returned insufficient rates.',
    } satisfies ProviderErrorDetails;
  }

  const updatedAt =
    typeof data.time_last_update_unix === 'number' && Number.isFinite(data.time_last_update_unix)
      ? data.time_last_update_unix * 1000
      : Date.now();

  return {
    rates,
    updatedAt,
    source: 'exchangerate-api',
  };
}

/**
 * Fetches and strictly validates cryptocurrency market prices from CoinGecko.
 */
export async function fetchCoinGeckoCryptoRates(): Promise<{
  rates: RateMap;
  cryptoInfo: Record<string, CryptoMarketInfo>;
}> {
  const ids = Object.values(CRYPTO_COINGECKO_MAP).join(',');
  const params = new URLSearchParams({
    ids,
    vs_currencies: 'usd',
    include_24hr_change: 'true',
    include_last_updated_at: 'true',
  });

  if (COINGECKO_DEMO_KEY) {
    params.set('x_cg_demo_api_key', COINGECKO_DEMO_KEY);
  }

  const data = await fetchWithTimeout<Record<string, unknown>>(
    `https://api.coingecko.com/api/v3/simple/price?${params.toString()}`,
    10000
  );

  if (!data || typeof data !== 'object') {
    throw {
      provider: 'coingecko',
      code: 'INVALID_RESPONSE',
      message: 'CoinGecko returned an invalid object payload.',
    } satisfies ProviderErrorDetails;
  }

  const rates: RateMap = {};
  const cryptoInfo: Record<string, CryptoMarketInfo> = {};

  for (const [symbol, id] of Object.entries(CRYPTO_COINGECKO_MAP)) {
    const coin = data[id] as {
      usd?: unknown;
      usd_24h_change?: unknown;
      last_updated_at?: unknown;
    } | undefined;

    if (!coin || typeof coin !== 'object') continue;

    const usdPrice = Number(coin.usd);
    if (!Number.isFinite(usdPrice) || usdPrice <= 0) continue;

    // Normalize internal rate to units per 1 USD
    rates[symbol] = 1 / usdPrice;

    const change24h =
      typeof coin.usd_24h_change === 'number' && Number.isFinite(coin.usd_24h_change)
        ? coin.usd_24h_change
        : null;

    const lastUpdatedAt =
      typeof coin.last_updated_at === 'number' && Number.isFinite(coin.last_updated_at)
        ? coin.last_updated_at * 1000
        : null;

    cryptoInfo[symbol] = {
      usdPrice,
      change24h,
      lastUpdatedAt,
    };
  }

  return {
    rates,
    cryptoInfo,
  };
}

/**
 * Loads cached rate payload from localStorage, verifying schema version and integrity.
 */
export function loadCachedRates(): NormalizedRatesPayload | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    const raw = window.localStorage.getItem(CACHE_STORAGE_KEY);
    const parsed = safeJsonParse<NormalizedRatesPayload>(raw);

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      parsed.schemaVersion !== CURRENT_CACHE_VERSION ||
      !parsed.rates ||
      typeof parsed.rates !== 'object' ||
      Object.keys(parsed.rates).length === 0
    ) {
      return null;
    }

    return parsed;
  } catch {
    try {
      window.localStorage.removeItem(CACHE_STORAGE_KEY);
    } catch {}
    return null;
  }
}

/**
 * Saves normalized rates to localStorage.
 */
export function saveCachedRates(payload: NormalizedRatesPayload): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(payload));
  } catch {}
}

/**
 * Orchestrates multi-provider rate synchronization with fallbacks, caching,
 * and sequence-based race condition protection.
 */
export async function getConsolidatedMarketRates(
  forceRefresh = false
): Promise<{
  payload: NormalizedRatesPayload;
  warningMessage?: string;
  errorMessage?: string;
}> {
  const currentSeq = ++globalFetchSequence;
  const cached = loadCachedRates();

  const cachedAge = cached ? Date.now() - cached.timestamp : Infinity;
  const maxTtl =
    cached?.fiatSource === 'exchangerate-api'
      ? FALLBACK_CACHE_TTL_MS
      : FIAT_CACHE_TTL_MS;

  // Use fresh cache if available and not forced
  if (!forceRefresh && cached && cachedAge < maxTtl) {
    return {
      payload: {
        ...cached,
        freshness: 'FRESH_CACHE',
      },
    };
  }

  // Attempt live fetching with resilience
  let fiatData: { rates: RateMap; updatedAt: number; source: FiatProviderSource } | null = null;
  let cryptoData: { rates: RateMap; cryptoInfo: Record<string, CryptoMarketInfo> } | null = null;
  let warningMessage: string | undefined;

  // Fetch fiat (Primary Frankfurter -> Secondary Fallback)
  try {
    fiatData = await fetchFrankfurterRates();
  } catch {
    try {
      fiatData = await fetchFallbackExchangeRates();
      warningMessage = 'Primary FX provider temporarily unavailable. Switched to secondary reference provider.';
    } catch {
      fiatData = null;
    }
  }

  // Fetch crypto
  try {
    cryptoData = await fetchCoinGeckoCryptoRates();
  } catch {
    cryptoData = null;
    if (!warningMessage) {
      warningMessage = 'Cryptocurrency live prices temporarily unavailable. Retaining existing values.';
    }
  }

  // Discard older requests if a newer request overtook
  if (currentSeq !== globalFetchSequence) {
    throw new Error('Superseded by newer request');
  }

  // Combine live data with cached data where partial failures occur
  const combinedRates: RateMap = {
    ...(cached?.rates || {}),
    ...(fiatData?.rates || {}),
    ...(cryptoData?.rates || {}),
  };

  const combinedCryptoInfo: Record<string, CryptoMarketInfo> = {
    ...(cached?.cryptoInfo || {}),
    ...(cryptoData?.cryptoInfo || {}),
  };

  const effectiveFiatSource: FiatProviderSource =
    fiatData?.source || cached?.fiatSource || 'none';

  const effectiveFiatUpdatedAt =
    fiatData?.updatedAt || cached?.fiatDataUpdatedAt || null;

  // If no rates could be obtained anywhere
  if (Object.keys(combinedRates).length === 0) {
    return {
      payload: {
        timestamp: Date.now(),
        rates: {},
        cryptoInfo: {},
        fiatSource: 'none',
        fiatDataUpdatedAt: null,
        freshness: 'UNAVAILABLE',
        schemaVersion: CURRENT_CACHE_VERSION,
      },
      errorMessage: 'Exchange rates are currently unavailable. Please check your internet connection.',
    };
  }

  const freshness: FreshnessState =
    fiatData && cryptoData
      ? 'LIVE'
      : fiatData || cryptoData
      ? 'LIVE'
      : cached
      ? 'STALE_CACHE'
      : 'OFFLINE';

  const newPayload: NormalizedRatesPayload = {
    timestamp: Date.now(),
    rates: combinedRates,
    cryptoInfo: combinedCryptoInfo,
    fiatSource: effectiveFiatSource,
    fiatDataUpdatedAt: effectiveFiatUpdatedAt,
    freshness,
    schemaVersion: CURRENT_CACHE_VERSION,
  };

  // Persist to cache
  saveCachedRates(newPayload);

  return {
    payload: newPayload,
    warningMessage,
  };
}

/**
 * Fetches 30-day historical chart data for fiat currency pairs.
 */
export async function getHistoricalChartData(
  fromCur: string,
  toCur: string
): Promise<{
  points: HistoricalChartPoint[];
  message?: string;
}> {
  const from = (fromCur || '').toUpperCase();
  const to = (toCur || '').toUpperCase();

  if (from === to) {
    return { points: [], message: 'Identical currency pair selected.' };
  }

  const cacheKey = `${CHART_CACHE_PREFIX}_${from}_${to}`;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(cacheKey);
      const cached = safeJsonParse<{ timestamp: number; points: HistoricalChartPoint[] }>(raw);
      if (cached && Date.now() - cached.timestamp < CHART_CACHE_TTL_MS && cached.points.length > 0) {
        return { points: cached.points };
      }
    } catch {}
  }

  const toDate = new Date().toISOString().slice(0, 10);
  const fromDateObj = new Date();
  fromDateObj.setDate(fromDateObj.getDate() - 30);
  const fromDate = fromDateObj.toISOString().slice(0, 10);

  try {
    const rawData = await fetchWithTimeout<unknown>(
      `https://api.frankfurter.dev/v2/rates?from=${fromDate}&to=${toDate}&base=${encodeURIComponent(
        from
      )}&quotes=${encodeURIComponent(to)}`,
      8000
    );

    if (!Array.isArray(rawData)) {
      return {
        points: [],
        message: 'Historical market data is currently unavailable for this pair.',
      };
    }

    const filtered = rawData.filter(
      (item) => item && typeof item === 'object' && (item as { quote?: string }).quote === to
    );

    const sortedPoints = filterAndSortHistoricalPoints(filtered);

    if (sortedPoints.length === 0) {
      return {
        points: [],
        message: 'No historical data points available for this pair.',
      };
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            points: sortedPoints,
          })
        );
      } catch {}
    }

    return { points: sortedPoints };
  } catch {
    return {
      points: [],
      message: 'Historical market trend is temporarily unavailable. Live conversion rate remains functional.',
    };
  }
}
