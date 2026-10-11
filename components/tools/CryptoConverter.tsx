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

export const QUICK_CURRENCY_CODES = ['EUR', 'GBP', 'INR', 'BTC', 'ETH', 'AED'];

export const CURRENT_CACHE_VERSION = 3;
export const CACHE_STORAGE_KEY = 'omnitools_currency_rates_v3';
export const CHART_CACHE_PREFIX = 'omnitools_fx_chart_v2';

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

  // Normalize commas to periods if comma used as decimal separator
  const normalized = trimmed.replace(/,/g, '.');

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
    // If storage corrupted or parsing fails, clear corrupt entry
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

/* =========================================================================
   5. REACT COMPONENT UI LAYER
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

        // Avoid pushing initial empty state
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
        return { text: 'LIVE RATES', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' };
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
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Synchronizing Market Rates...</h2>
        <p className="mt-1 text-xs text-slate-500">Connecting to verified exchange rate providers.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1240px] min-w-0 space-y-6 text-slate-900 dark:text-slate-100">
      {/* Status & Provider Notifications */}
      {statusNotification && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{statusNotification}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
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

            {/* From & To Currency Selectors with Dedicated Swap Layout Space (Fix Bug #1) */}
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

              {/* Central Swap Action Button - Dedicated Clear Layout Space */}
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

            {/* Commercial Spread / Fee Simulator (Fix Bug #2: Robust 2-Column Responsive Layout) */}
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
              {refreshing ? 'Synchronizing Rates...' : 'Refresh Live Market Rates'}
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
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
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
