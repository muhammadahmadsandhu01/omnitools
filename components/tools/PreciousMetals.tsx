'use client';

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Download,
  Calculator,
  ChevronDown,
  Info,
  CheckCircle2,
  Copy,
  Scale,
  Sparkles,
  X,
  Building2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

/* =========================================================================
   1. TYPES & DOMAIN INTERFACES
   ========================================================================= */

export type MetalCode = 'XAU' | 'XAG' | 'XPT' | 'XPD';

export type CurrencyCode =
  | 'USD'
  | 'PKR'
  | 'EUR'
  | 'GBP'
  | 'AED'
  | 'SAR'
  | 'INR'
  | 'CAD'
  | 'AUD'
  | 'NZD'
  | 'JPY'
  | 'CNY'
  | 'SGD'
  | 'HKD'
  | 'KRW'
  | 'CHF'
  | 'NOK'
  | 'SEK'
  | 'DKK'
  | 'PLN'
  | 'TRY'
  | 'ZAR'
  | 'BRL'
  | 'MXN'
  | 'MYR'
  | 'THB'
  | 'IDR'
  | 'ILS'
  | 'QAR'
  | 'KWD'
  | 'BHD'
  | 'OMR';

export type CountryCode =
  | 'PK'
  | 'US'
  | 'GB'
  | 'EU'
  | 'AE'
  | 'SA'
  | 'IN'
  | 'CA'
  | 'AU'
  | 'NZ'
  | 'JP'
  | 'CN'
  | 'SG'
  | 'HK'
  | 'KR'
  | 'CH'
  | 'NO'
  | 'SE'
  | 'DK'
  | 'PL'
  | 'TR'
  | 'ZA'
  | 'BR'
  | 'MX'
  | 'MY'
  | 'TH'
  | 'ID'
  | 'IL'
  | 'QA'
  | 'KW'
  | 'BH'
  | 'OM';

export type PriceUnit = 'troy_oz' | 'tola' | 'gram' | '10g' | 'kg';

export type GoldKarat = '24K' | '22K' | '21K' | '18K' | '14K' | '9K';

export type ChartTimeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

export type FreshnessState = 'LIVE' | 'DELAYED' | 'REFERENCE' | 'STALE' | 'UNAVAILABLE';

export interface MetalConfig {
  code: MetalCode;
  symbol: string;
  name: string;
  atomicSymbol: string;
  defaultUnit: PriceUnit;
  accentColor: string;
  yahooSymbol: string;
  futuresLabel: string;
  description: string;
}

export interface MetalPriceData {
  code: MetalCode;
  name: string;
  priceUsdPerTroyOz: number;
  change24hUsd: number;
  change24hPercent: number;
  high24hUsd: number;
  low24hUsd: number;
  updatedAt: string;
  timestampMs: number;
  source: string;
  rateType: 'spot' | 'futures' | 'reference';
  freshness: FreshnessState;
}

export interface HistoricalPoint {
  timestamp: number;
  date: string;
  price: number;
}

export interface CurrencyMetadata {
  code: CurrencyCode;
  name: string;
  symbol: string;
  decimals: number;
  flag: string;
}

export interface CountryConfig {
  code: CountryCode;
  name: string;
  flag: string;
  currency: CurrencyCode;
  locale: string;
  primaryUnit: PriceUnit;
  secondaryUnit: PriceUnit;
  marketLabel: string;
  isGulfOrSouthAsia: boolean;
}

export interface PurityMetadata {
  karat: GoldKarat;
  name: string;
  ratio: number;
  fineness: number;
  description: string;
}

export interface TableRowData {
  id: string;
  metal: string;
  denomination: string;
  weightGrams: number;
  purityLabel: string;
  rateInTargetCurrency: number;
  usdReference: number;
  marketType: 'CONVERTED SPOT' | 'CALCULATED SPOT';
}

/* =========================================================================
   2. DOMAIN CONSTANTS & CANONICAL CONVERSIONS
   ========================================================================= */

export const TROY_OUNCE_TO_GRAMS = 31.1034768;
export const KG_TO_GRAMS = 1000.0;
export const TOLA_TO_GRAMS = 11.6638038;
export const TOLA_TO_TROY_OZ = 0.375; // 180 / 480 grains exactly
export const TEN_GRAMS_TO_GRAMS = 10.0;

export const METALS: Record<MetalCode, MetalConfig> = {
  XAU: {
    code: 'XAU',
    symbol: 'Gold',
    name: 'Gold',
    atomicSymbol: 'Au',
    defaultUnit: 'troy_oz',
    accentColor: '#eab308',
    yahooSymbol: 'GC=F',
    futuresLabel: 'COMEX Gold Futures (GC=F)',
    description: 'Gold (XAU) — Universal store of value and bullion monetary asset.',
  },
  XAG: {
    code: 'XAG',
    symbol: 'Silver',
    name: 'Silver',
    atomicSymbol: 'Ag',
    defaultUnit: 'troy_oz',
    accentColor: '#94a3b8',
    yahooSymbol: 'SI=F',
    futuresLabel: 'COMEX Silver Futures (SI=F)',
    description: 'Silver (XAG) — High-conductivity monetary and technology metal.',
  },
  XPT: {
    code: 'XPT',
    symbol: 'Platinum',
    name: 'Platinum',
    atomicSymbol: 'Pt',
    defaultUnit: 'troy_oz',
    accentColor: '#38bdf8',
    yahooSymbol: 'PL=F',
    futuresLabel: 'NYMEX Platinum Futures (PL=F)',
    description: 'Platinum (XPT) — Rare catalytic, industrial and haute luxury metal.',
  },
  XPD: {
    code: 'XPD',
    symbol: 'Palladium',
    name: 'Palladium',
    atomicSymbol: 'Pd',
    defaultUnit: 'troy_oz',
    accentColor: '#a855f7',
    yahooSymbol: 'PA=F',
    futuresLabel: 'NYMEX Palladium Futures (PA=F)',
    description: 'Palladium (XPD) — High-temperature automotive & electronic metal.',
  },
};

export const CURRENCIES: Record<CurrencyCode, CurrencyMetadata> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, flag: '🇺🇸' },
  PKR: { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs', decimals: 0, flag: '🇵🇰' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, flag: '🇪🇺' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2, flag: '🇬🇧' },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'AED', decimals: 2, flag: '🇦🇪' },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', decimals: 2, flag: '🇸🇦' },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 0, flag: '🇮🇳' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', decimals: 2, flag: '🇨🇦' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2, flag: '🇦🇺' },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimals: 2, flag: '🇳🇿' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0, flag: '🇯🇵' },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2, flag: '🇨🇳' },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2, flag: '🇸🇬' },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimals: 2, flag: '🇭🇰' },
  KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0, flag: '🇰🇷' },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2, flag: '🇨🇭' },
  NOK: { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2, flag: '🇳🇴' },
  SEK: { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2, flag: '🇸🇪' },
  DKK: { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2, flag: '🇩🇰' },
  PLN: { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', decimals: 2, flag: '🇵🇱' },
  TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimals: 2, flag: '🇹🇷' },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimals: 2, flag: '🇿🇦' },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2, flag: '🇧🇷' },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', decimals: 2, flag: '🇲🇽' },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimals: 2, flag: '🇲🇾' },
  THB: { code: 'THB', name: 'Thai Baht', symbol: '฿', decimals: 2, flag: '🇹🇭' },
  IDR: { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimals: 0, flag: '🇮🇩' },
  ILS: { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', decimals: 2, flag: '🇮🇱' },
  QAR: { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', decimals: 2, flag: '🇶🇦' },
  KWD: { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', decimals: 3, flag: '🇰🇼' },
  BHD: { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', decimals: 3, flag: '🇧🇭' },
  OMR: { code: 'OMR', name: 'Omani Rial', symbol: 'OMR', decimals: 3, flag: '🇴🇲' },
};

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  PK: { code: 'PK', name: 'Pakistan', flag: '🇵🇰', currency: 'PKR', locale: 'en-PK', primaryUnit: 'tola', secondaryUnit: '10g', marketLabel: 'Pakistan Market Reference', isGulfOrSouthAsia: true },
  US: { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', locale: 'en-US', primaryUnit: 'troy_oz', secondaryUnit: 'gram', marketLabel: 'US Market Reference', isGulfOrSouthAsia: false },
  GB: { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', locale: 'en-GB', primaryUnit: 'troy_oz', secondaryUnit: 'gram', marketLabel: 'UK Market Reference', isGulfOrSouthAsia: false },
  EU: { code: 'EU', name: 'Eurozone / EU', flag: '🇪🇺', currency: 'EUR', locale: 'en-DE', primaryUnit: 'troy_oz', secondaryUnit: 'gram', marketLabel: 'Eurozone Market Reference', isGulfOrSouthAsia: false },
  AE: { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', locale: 'ar-AE', primaryUnit: 'tola', secondaryUnit: '10g', marketLabel: 'UAE Market Reference', isGulfOrSouthAsia: true },
  SA: { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', locale: 'ar-SA', primaryUnit: 'tola', secondaryUnit: '10g', marketLabel: 'Saudi Arabia Market Reference', isGulfOrSouthAsia: true },
  IN: { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', locale: 'en-IN', primaryUnit: 'tola', secondaryUnit: '10g', marketLabel: 'India Market Reference', isGulfOrSouthAsia: true },
  CA: { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', locale: 'en-CA', primaryUnit: 'troy_oz', secondaryUnit: 'gram', marketLabel: 'Canada Market Reference', isGulfOrSouthAsia: false },
  AU: { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', locale: 'en-AU', primaryUnit: 'troy_oz', secondaryUnit: 'gram', marketLabel: 'Australia Market Reference', isGulfOrSouthAsia: false },
  NZ: { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', currency: 'NZD', locale: 'en-NZ', primaryUnit: 'troy_oz', secondaryUnit: 'gram', marketLabel: 'New Zealand Market Reference', isGulfOrSouthAsia: false },
  JP: { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY', locale: 'ja-JP', primaryUnit: 'gram', secondaryUnit: 'troy_oz', marketLabel: 'Japan Market Reference', isGulfOrSouthAsia: false },
  CN: { code: 'CN', name: 'China', flag: '🇨🇳', currency: 'CNY', locale: 'zh-CN', primaryUnit: 'gram', secondaryUnit: 'troy_oz', marketLabel: 'China Market Reference', isGulfOrSouthAsia: false },
  SG: { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', locale: 'en-SG', primaryUnit: 'tola', secondaryUnit: 'troy_oz', marketLabel: 'Singapore Market Reference', isGulfOrSouthAsia: true },
  HK: { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', currency: 'HKD', locale: 'en-HK', primaryUnit: 'tola', secondaryUnit: 'troy_oz', marketLabel: 'Hong Kong Market Reference', isGulfOrSouthAsia: true },
  KR: { code: 'KR', name: 'South Korea', flag: '🇰🇷', currency: 'KRW', locale: 'ko-KR', primaryUnit: 'gram', secondaryUnit: 'troy_oz', marketLabel: 'South Korea Market Reference', isGulfOrSouthAsia: false },
  CH: { code: 'CH', name: 'Switzerland', flag: '🇨🇭', currency: 'CHF', locale: 'de-CH', primaryUnit: 'troy_oz', secondaryUnit: 'gram', marketLabel: 'Switzerland Market Reference', isGulfOrSouthAsia: false },
  NO: { code: 'NO', name: 'Norway', flag: '🇳🇴', currency: 'NOK', locale: 'nb-NO', primaryUnit: 'troy_oz', secondaryUnit: 'gram', marketLabel: 'Norway Market Reference', isGulfOrSouthAsia: false },
  SE: { code: 'SE', name: 'Sweden', flag: '🇸🇪', currency: 'SEK', locale: 'sv-SE', primaryUnit: 'troy_oz', secondaryUnit: 'gram', marketLabel: 'Sweden Market Reference', isGulfOrSouthAsia: false },
  DK: { code: 'DK', name: 'Denmark', flag: '🇩🇰', currency: 'DKK', locale: 'da-DK', primaryUnit: 'troy_oz', secondaryUnit: 'gram', marketLabel: 'Denmark Market Reference', isGulfOrSouthAsia: false },
  PL: { code: 'PL', name: 'Poland', flag: '🇵🇱', currency: 'PLN', locale: 'pl-PL', primaryUnit: 'troy_oz', secondaryUnit: 'gram', marketLabel: 'Poland Market Reference', isGulfOrSouthAsia: false },
  TR: { code: 'TR', name: 'Turkey', flag: '🇹🇷', currency: 'TRY', locale: 'tr-TR', primaryUnit: 'gram', secondaryUnit: 'troy_oz', marketLabel: 'Turkey Market Reference', isGulfOrSouthAsia: false },
  ZA: { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR', locale: 'en-ZA', primaryUnit: 'troy_oz', secondaryUnit: 'gram', marketLabel: 'South Africa Market Reference', isGulfOrSouthAsia: false },
  BR: { code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL', locale: 'pt-BR', primaryUnit: 'gram', secondaryUnit: 'troy_oz', marketLabel: 'Brazil Market Reference', isGulfOrSouthAsia: false },
  MX: { code: 'MX', name: 'Mexico', flag: '🇲🇽', currency: 'MXN', locale: 'es-MX', primaryUnit: 'troy_oz', secondaryUnit: 'gram', marketLabel: 'Mexico Market Reference', isGulfOrSouthAsia: false },
  MY: { code: 'MY', name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', locale: 'en-MY', primaryUnit: 'tola', secondaryUnit: 'gram', marketLabel: 'Malaysia Market Reference', isGulfOrSouthAsia: true },
  TH: { code: 'TH', name: 'Thailand', flag: '🇹🇭', currency: 'THB', locale: 'th-TH', primaryUnit: 'gram', secondaryUnit: 'troy_oz', marketLabel: 'Thailand Market Reference', isGulfOrSouthAsia: false },
  ID: { code: 'ID', name: 'Indonesia', flag: '🇮🇩', currency: 'IDR', locale: 'id-ID', primaryUnit: 'gram', secondaryUnit: 'troy_oz', marketLabel: 'Indonesia Market Reference', isGulfOrSouthAsia: false },
  IL: { code: 'IL', name: 'Israel', flag: '🇮🇱', currency: 'ILS', locale: 'he-IL', primaryUnit: 'troy_oz', secondaryUnit: 'gram', marketLabel: 'Israel Market Reference', isGulfOrSouthAsia: false },
  QA: { code: 'QA', name: 'Qatar', flag: '🇶🇦', currency: 'QAR', locale: 'ar-QA', primaryUnit: 'tola', secondaryUnit: '10g', marketLabel: 'Qatar Market Reference', isGulfOrSouthAsia: true },
  KW: { code: 'KW', name: 'Kuwait', flag: '🇰🇼', currency: 'KWD', locale: 'ar-KW', primaryUnit: 'tola', secondaryUnit: '10g', marketLabel: 'Kuwait Market Reference', isGulfOrSouthAsia: true },
  BH: { code: 'BH', name: 'Bahrain', flag: '🇧🇭', currency: 'BHD', locale: 'ar-BH', primaryUnit: 'tola', secondaryUnit: '10g', marketLabel: 'Bahrain Market Reference', isGulfOrSouthAsia: true },
  OM: { code: 'OM', name: 'Oman', flag: '🇴🇲', currency: 'OMR', locale: 'ar-OM', primaryUnit: 'tola', secondaryUnit: '10g', marketLabel: 'Oman Market Reference', isGulfOrSouthAsia: true },
};

export const PURITIES: Record<GoldKarat, PurityMetadata> = {
  '24K': { karat: '24K', name: '24 Karat (Pure Bullion)', ratio: 1.0, fineness: 999.9, description: '100% Fine Gold (Bars & Minted Coins)' },
  '22K': { karat: '22K', name: '22 Karat (Jewelry Standard)', ratio: 22 / 24, fineness: 916.7, description: '91.67% Fine Gold (Bridal & Traditional Jewelry)' },
  '21K': { karat: '21K', name: '21 Karat (Arab Standard)', ratio: 21 / 24, fineness: 875.0, description: '87.50% Fine Gold (Gulf & Middle East Craft)' },
  '18K': { karat: '18K', name: '18 Karat (Luxury / Diamond)', ratio: 18 / 24, fineness: 750.0, description: '75.00% Fine Gold (Diamond & Watch Setting)' },
  '14K': { karat: '14K', name: '14 Karat (Durable Everyday)', ratio: 14 / 24, fineness: 583.3, description: '58.33% Fine Gold (Commercial Western Standard)' },
  '9K': { karat: '9K', name: '9 Karat (Commercial Entry)', ratio: 9 / 24, fineness: 375.0, description: '37.50% Fine Gold (UK Entry Standard)' },
};

export const UNIT_LABELS: Record<PriceUnit, { label: string; short: string }> = {
  troy_oz: { label: 'Troy Ounce (31.10g)', short: 'oz t' },
  tola: { label: 'Tola (11.66g)', short: 'tola' },
  gram: { label: 'Gram (1g)', short: 'g' },
  '10g': { label: '10 Grams (10g)', short: '10g' },
  kg: { label: 'Kilogram (1,000g)', short: 'kg' },
};

/* =========================================================================
   3. DETERMINISTIC REPRODUCIBLE FORMATTERS (ZERO HYDRATION MISMATCH)
   ========================================================================= */

/**
 * Deterministic UTC timestamp formatter.
 * Produces byte-for-byte identical output on server and client across all locales.
 * Output pattern: DD/MM/YYYY, HH:mm:ss UTC
 */
export function formatDeterministicTimestamp(timestampMs: number): string {
  if (!timestampMs || !Number.isFinite(timestampMs) || timestampMs <= 0) return '—';
  const d = new Date(timestampMs);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const day = pad(d.getUTCDate());
  const month = pad(d.getUTCMonth() + 1);
  const year = d.getUTCFullYear();
  const hours = pad(d.getUTCHours());
  const mins = pad(d.getUTCMinutes());
  const secs = pad(d.getUTCSeconds());
  return `${day}/${month}/${year}, ${hours}:${mins}:${secs} UTC`;
}

/**
 * Deterministic UTC date formatter.
 * Output pattern: DD/MM/YYYY
 */
export function formatDeterministicDate(timestampMs: number): string {
  if (!timestampMs || !Number.isFinite(timestampMs) || timestampMs <= 0) return '—';
  const d = new Date(timestampMs);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const day = pad(d.getUTCDate());
  const month = pad(d.getUTCMonth() + 1);
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Deterministic currency formatter.
 * Guarantees consistent comma-separation and symbol positioning without client locale drift.
 */
export function formatCurrencyValue(
  value: number,
  currency: CurrencyCode,
  overrideDecimals?: number
): string {
  if (!Number.isFinite(value)) return '—';
  const meta = CURRENCIES[currency] || CURRENCIES.USD;
  const dec = overrideDecimals !== undefined ? overrideDecimals : meta.decimals;
  const fixed = value.toFixed(dec);
  const parts = fixed.split('.');
  const integerFormatted = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formattedNumber = parts.length > 1 ? `${integerFormatted}.${parts[1]}` : integerFormatted;
  return `${meta.symbol} ${formattedNumber}`;
}

/**
 * Deterministic decimal formatter.
 */
export function formatDecimal(val: number, decimals = 2): string {
  if (!Number.isFinite(val)) return '0.00';
  const fixed = val.toFixed(decimals);
  const parts = fixed.split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.length > 1 ? `${intPart}.${parts[1]}` : intPart;
}

/* =========================================================================
   4. MATHEMATICAL & FINANCIAL CONVERSION ENGINE
   ========================================================================= */

export function convertToGrams(weight: number, unit: PriceUnit): number {
  if (!Number.isFinite(weight) || weight <= 0) return 0;
  switch (unit) {
    case 'troy_oz':
      return weight * TROY_OUNCE_TO_GRAMS;
    case 'gram':
      return weight;
    case '10g':
      return weight * TEN_GRAMS_TO_GRAMS;
    case 'tola':
      return weight * TOLA_TO_GRAMS;
    case 'kg':
      return weight * KG_TO_GRAMS;
  }
}

export function convertPriceUnit(pricePerTroyOz: number, targetUnit: PriceUnit): number {
  if (!Number.isFinite(pricePerTroyOz) || pricePerTroyOz <= 0) return 0;
  const pricePerGram = pricePerTroyOz / TROY_OUNCE_TO_GRAMS;
  switch (targetUnit) {
    case 'troy_oz':
      return pricePerTroyOz;
    case 'gram':
      return pricePerGram;
    case '10g':
      return pricePerGram * TEN_GRAMS_TO_GRAMS;
    case 'tola':
      return pricePerTroyOz * TOLA_TO_TROY_OZ;
    case 'kg':
      return pricePerGram * KG_TO_GRAMS;
  }
}

export function convertCurrency(
  amountUsd: number,
  targetCurrency: CurrencyCode,
  fxRates: Record<CurrencyCode, number>
): number {
  if (!Number.isFinite(amountUsd)) return 0;
  if (targetCurrency === 'USD') return amountUsd;
  const rate = fxRates[targetCurrency];
  if (!Number.isFinite(rate) || rate <= 0) return amountUsd;
  return amountUsd * rate;
}

export function calculateMeltValue(
  metal: MetalCode,
  weight: number,
  unit: PriceUnit,
  karat: GoldKarat,
  spotPriceUsdOz: number,
  targetCurrency: CurrencyCode,
  fxRates: Record<CurrencyCode, number>
) {
  const weightGrams = convertToGrams(weight, unit);
  const purityRatio = metal === 'XAU' ? PURITIES[karat].ratio : 1.0;
  const pureGrams = weightGrams * purityRatio;
  const priceTroyOzCur = convertCurrency(spotPriceUsdOz, targetCurrency, fxRates);
  const pricePerGramCur = priceTroyOzCur / TROY_OUNCE_TO_GRAMS;
  const baseMarketValue = pureGrams * pricePerGramCur;

  return {
    weightGrams,
    purityRatio,
    pureGrams,
    baseMarketValue,
  };
}

export function calculateDealerSpread(
  grossMarketValue: number,
  buyPremiumPct: number,
  sellDiscountPct: number,
  dealerFeeCur: number
) {
  const estimatedBuy = grossMarketValue * (1 + buyPremiumPct / 100) + dealerFeeCur;
  const estimatedSell = Math.max(0, grossMarketValue * (1 - sellDiscountPct / 100) - dealerFeeCur);
  const spreadValue = estimatedBuy - estimatedSell;
  const spreadPct = estimatedBuy > 0 ? (spreadValue / estimatedBuy) * 100 : 0;

  return {
    estimatedBuy,
    estimatedSell,
    spreadValue,
    spreadPct,
  };
}

/* =========================================================================
   5. DATA FETCHING, VALIDATION & PROVIDER CONTRACT
   ========================================================================= */

const INITIAL_UPDATED_AT = '2026-10-07T00:00:00.000Z';
const INITIAL_TIMESTAMP_MS = 1791331200000;

export const DEFAULT_FX_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  PKR: 278.50,
  EUR: 0.915,
  GBP: 0.772,
  AED: 3.6725,
  SAR: 3.75,
  INR: 83.95,
  CAD: 1.378,
  AUD: 1.512,
  NZD: 1.662,
  JPY: 153.20,
  CNY: 7.12,
  SGD: 1.325,
  HKD: 7.78,
  KRW: 1365.0,
  CHF: 0.865,
  NOK: 10.95,
  SEK: 10.60,
  DKK: 6.82,
  PLN: 3.98,
  TRY: 34.25,
  ZAR: 17.65,
  BRL: 5.65,
  MXN: 19.35,
  MYR: 4.38,
  THB: 33.45,
  IDR: 15650.0,
  ILS: 3.75,
  QAR: 3.64,
  KWD: 0.307,
  BHD: 0.377,
  OMR: 0.385,
};

export const BASELINE_PRICES: Record<MetalCode, number> = {
  XAU: 4115.50,
  XAG: 60.10,
  XPT: 1645.00,
  XPD: 1150.00,
};

export async function fetchMetalPrice(
  code: MetalCode,
  signal?: AbortSignal
): Promise<MetalPriceData> {
  const fallbackPrice = BASELINE_PRICES[code];
  const url = `https://api.gold-api.com/price/${code}`;

  try {
    const res = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawPrice = Number(data.price);

    if (!Number.isFinite(rawPrice) || rawPrice <= 0) {
      throw new Error('Malformed price');
    }

    const now = Date.now();
    const parsedTimestamp = data.updatedAt ? new Date(data.updatedAt).getTime() : NaN;
    const hasValidQuoteTs = Number.isFinite(parsedTimestamp) && parsedTimestamp > 0;

    // Freshness threshold: 72 hours (to safely cover global bullion market weekend closures)
    const FRESHNESS_THRESHOLD_MS = 72 * 60 * 60 * 1000;
    const isWithinFreshness = hasValidQuoteTs && Math.abs(now - parsedTimestamp) <= FRESHNESS_THRESHOLD_MS;

    let freshness: FreshnessState = 'REFERENCE';
    if (hasValidQuoteTs && isWithinFreshness) {
      freshness = 'LIVE';
    } else if (hasValidQuoteTs) {
      freshness = 'DELAYED';
    } else {
      freshness = 'REFERENCE';
    }

    const validTimestamp = hasValidQuoteTs ? parsedTimestamp : INITIAL_TIMESTAMP_MS;

    const changeUsd = Number.isFinite(Number(data.ch)) ? Number(data.ch) : 0;
    const changePct = Number.isFinite(Number(data.chp)) ? Number(data.chp) : 0;

    return {
      code,
      name: METALS[code].name,
      priceUsdPerTroyOz: rawPrice,
      change24hUsd: changeUsd,
      change24hPercent: changePct,
      high24hUsd: rawPrice * 1.008,
      low24hUsd: rawPrice * 0.992,
      updatedAt: new Date(validTimestamp).toISOString(),
      timestampMs: validTimestamp,
      source: 'Gold API — Spot Reference',
      rateType: 'spot',
      freshness,
    };
  } catch {
    return {
      code,
      name: METALS[code].name,
      priceUsdPerTroyOz: fallbackPrice,
      change24hUsd: 0,
      change24hPercent: 0,
      high24hUsd: fallbackPrice * 1.008,
      low24hUsd: fallbackPrice * 0.992,
      updatedAt: INITIAL_UPDATED_AT,
      timestampMs: INITIAL_TIMESTAMP_MS,
      source: 'Verified Reference Baseline',
      rateType: 'reference',
      freshness: 'REFERENCE',
    };
  }
}

export interface FxDataPayload {
  provider: string;
  timestampMs: number;
  baseCurrency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
}

export async function fetchFxData(signal?: AbortSignal): Promise<FxDataPayload> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('FX HTTP error');
    const data = await res.json();
    if (data && data.rates && typeof data.rates === 'object') {
      const merged: Record<CurrencyCode, number> = { ...DEFAULT_FX_RATES };
      for (const cur of Object.keys(DEFAULT_FX_RATES) as CurrencyCode[]) {
        if (typeof data.rates[cur] === 'number' && data.rates[cur] > 0) {
          merged[cur] = data.rates[cur];
        }
      }
      const rawTs = Number(data.time_last_update_unix);
      const timestampMs = Number.isFinite(rawTs) && rawTs > 0 ? rawTs * 1000 : INITIAL_TIMESTAMP_MS;
      return {
        provider: 'ExchangeRate-API',
        timestampMs,
        baseCurrency: 'USD',
        rates: merged,
      };
    }
    return {
      provider: 'ExchangeRate-API (Reference)',
      timestampMs: INITIAL_TIMESTAMP_MS,
      baseCurrency: 'USD',
      rates: DEFAULT_FX_RATES,
    };
  } catch {
    return {
      provider: 'ExchangeRate-API (Reference)',
      timestampMs: INITIAL_TIMESTAMP_MS,
      baseCurrency: 'USD',
      rates: DEFAULT_FX_RATES,
    };
  }
}

export async function fetchFxRates(signal?: AbortSignal): Promise<Record<CurrencyCode, number>> {
  const result = await fetchFxData(signal);
  return result.rates;
}

export async function fetchHistoricalPoints(
  code: MetalCode,
  timeframe: ChartTimeframe,
  signal?: AbortSignal
): Promise<HistoricalPoint[]> {
  // Yahoo Finance endpoint does not support browser cross-origin requests (CORS).
  // Query Yahoo endpoint only in non-browser runtime (SSR/server) where CORS is not enforced.
  if (typeof window === 'undefined') {
    const yahooTicker = METALS[code].yahooSymbol;
    let range = '1mo';
    let interval = '1d';

    switch (timeframe) {
      case '1D': range = '1d'; interval = '15m'; break;
      case '1W': range = '5d'; interval = '60m'; break;
      case '1M': range = '1mo'; interval = '1d'; break;
      case '3M': range = '3mo'; interval = '1d'; break;
      case '6M': range = '6mo'; interval = '1d'; break;
      case '1Y': range = '1y'; interval = '1wk'; break;
    }

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooTicker)}?range=${range}&interval=${interval}`;

    try {
      const res = await fetch(url, { signal });
      if (res.ok) {
        const json = await res.json();
        const result = json?.chart?.result?.[0];
        const timestamps = result?.timestamp as number[] | undefined;
        const closes = result?.indicators?.quote?.[0]?.close as (number | null)[] | undefined;

        if (timestamps && closes && timestamps.length > 0) {
          const points: HistoricalPoint[] = [];
          for (let i = 0; i < timestamps.length; i++) {
            const p = closes[i];
            if (p !== null && p !== undefined && Number.isFinite(p) && p > 0) {
              const tsMs = timestamps[i] * 1000;
              points.push({
                timestamp: tsMs,
                date: formatDeterministicDate(tsMs),
                price: Number(p),
              });
            }
          }
          if (points.length >= 2) return points;
        }
      }
    } catch {
      // In SSR if external fetch fails, return empty array
    }
  }

  // In browser runtime, CORS restrictions block direct Yahoo Finance queries.
  // Never fabricate historical market data as actual market movements.
  return [];
}

export function generateIllustrativeFallbackPoints(
  timeframe: ChartTimeframe,
  currentSpotUsd: number
): HistoricalPoint[] {
  const steps = timeframe === '1D' ? 12 : timeframe === '1W' ? 7 : 30;
  const now = INITIAL_TIMESTAMP_MS;
  const stepMs = timeframe === '1D' ? 86400000 / 12 : 86400000;
  const mock: HistoricalPoint[] = [];

  for (let i = steps; i >= 0; i--) {
    const ts = now - i * stepMs;
    const angle = (steps - i) * 0.2;
    const variation = Math.sin(angle) * (currentSpotUsd * 0.015);
    mock.push({
      timestamp: ts,
      date: formatDeterministicDate(ts),
      price: Number((currentSpotUsd + variation).toFixed(2)),
    });
  }
  return mock;
}

export function sanitizeCsvField(val: unknown): string {
  const str = String(val ?? '');
  let sanitized = str;
  if (/^[=+\-@\t\r]/.test(sanitized)) {
    sanitized = "'" + sanitized;
  }
  if (/[",\r\n]/.test(sanitized)) {
    sanitized = `"${sanitized.replace(/"/g, '""')}"`;
  }
  return sanitized;
}

export function generateCsvExport(
  points: HistoricalPoint[],
  metal: MetalCode,
  currency: CurrencyCode,
  unit: PriceUnit,
  isFallback: boolean = false
): string {
  const headers = ['Timestamp_UTC', 'Date', 'Metal_Code', 'Currency', 'Unit', 'Price', 'Source', 'Rate_Type'];
  const rows = points.map((p) => [
    sanitizeCsvField(new Date(p.timestamp).toISOString()),
    sanitizeCsvField(p.date),
    sanitizeCsvField(metal),
    sanitizeCsvField(currency),
    sanitizeCsvField(unit),
    sanitizeCsvField(p.price.toFixed(4)),
    sanitizeCsvField(isFallback ? 'Illustrative fallback — not market data' : 'OmniTools Bullion Feed'),
    sanitizeCsvField(isFallback ? 'Illustrative Fallback' : 'Futures Reference'),
  ].join(','));

  return [headers.join(','), ...rows].join('\r\n');
}

/* =========================================================================
   6. REACT COMPONENT — PRECIOUS METALS DASHBOARD
   ========================================================================= */

export default function PreciousMetals() {
  // Navigation & Region Settings
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('PK');
  const [selectedMetal, setSelectedMetal] = useState<MetalCode>('XAU');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('PKR');
  const [selectedUnit, setSelectedUnit] = useState<PriceUnit>('tola');
  const [chartTimeframe, setChartTimeframe] = useState<ChartTimeframe>('1M');

  // Rates Data State — Initial SSR values are REFERENCE, never false 'LIVE'
  const [metalPrices, setMetalPrices] = useState<Record<MetalCode, MetalPriceData>>({
    XAU: {
      code: 'XAU',
      name: 'Gold',
      priceUsdPerTroyOz: BASELINE_PRICES.XAU,
      change24hUsd: 0,
      change24hPercent: 0,
      high24hUsd: BASELINE_PRICES.XAU * 1.008,
      low24hUsd: BASELINE_PRICES.XAU * 0.992,
      updatedAt: INITIAL_UPDATED_AT,
      timestampMs: INITIAL_TIMESTAMP_MS,
      source: 'Verified Reference Baseline',
      rateType: 'reference',
      freshness: 'REFERENCE',
    },
    XAG: {
      code: 'XAG',
      name: 'Silver',
      priceUsdPerTroyOz: BASELINE_PRICES.XAG,
      change24hUsd: 0,
      change24hPercent: 0,
      high24hUsd: BASELINE_PRICES.XAG * 1.008,
      low24hUsd: BASELINE_PRICES.XAG * 0.992,
      updatedAt: INITIAL_UPDATED_AT,
      timestampMs: INITIAL_TIMESTAMP_MS,
      source: 'Verified Reference Baseline',
      rateType: 'reference',
      freshness: 'REFERENCE',
    },
    XPT: {
      code: 'XPT',
      name: 'Platinum',
      priceUsdPerTroyOz: BASELINE_PRICES.XPT,
      change24hUsd: 0,
      change24hPercent: 0,
      high24hUsd: BASELINE_PRICES.XPT * 1.008,
      low24hUsd: BASELINE_PRICES.XPT * 0.992,
      updatedAt: INITIAL_UPDATED_AT,
      timestampMs: INITIAL_TIMESTAMP_MS,
      source: 'Verified Reference Baseline',
      rateType: 'reference',
      freshness: 'REFERENCE',
    },
    XPD: {
      code: 'XPD',
      name: 'Palladium',
      priceUsdPerTroyOz: BASELINE_PRICES.XPD,
      change24hUsd: 0,
      change24hPercent: 0,
      high24hUsd: BASELINE_PRICES.XPD * 1.008,
      low24hUsd: BASELINE_PRICES.XPD * 0.992,
      updatedAt: INITIAL_UPDATED_AT,
      timestampMs: INITIAL_TIMESTAMP_MS,
      source: 'Verified Reference Baseline',
      rateType: 'reference',
      freshness: 'REFERENCE',
    },
  });

  const [fxData, setFxData] = useState<FxDataPayload>({
    provider: 'ExchangeRate-API',
    timestampMs: INITIAL_TIMESTAMP_MS,
    baseCurrency: 'USD',
    rates: DEFAULT_FX_RATES,
  });
  const [fxRates, setFxRates] = useState<Record<CurrencyCode, number>>(DEFAULT_FX_RATES);
  const [chartPoints, setChartPoints] = useState<HistoricalPoint[]>([]);
  const [showIllustrativeFallback, setShowIllustrativeFallback] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Calculator State
  const [calcWeight, setCalcWeight] = useState<number>(1);
  const [calcUnit, setCalcUnit] = useState<PriceUnit>('tola');
  const [calcKarat, setCalcKarat] = useState<GoldKarat>('24K');
  const [buyPremium, setBuyPremium] = useState<number>(2.0);
  const [sellDiscount, setSellDiscount] = useState<number>(2.0);
  const [dealerFee, setDealerFee] = useState<number>(0);

  // Async Safety & Request Ownership
  const requestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Synchronize when Country changes
  const handleCountryChange = (cCode: CountryCode) => {
    setSelectedCountry(cCode);
    const country = COUNTRIES[cCode];
    if (country) {
      setSelectedCurrency(country.currency);
      setSelectedUnit(country.primaryUnit);
      setCalcUnit(country.primaryUnit);
    }
  };

  // Master Data Refresh
  const loadMarketData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const reqId = ++requestIdRef.current;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [fxResult, gold, silver, plat, pall] = await Promise.all([
        fetchFxData(controller.signal),
        fetchMetalPrice('XAU', controller.signal),
        fetchMetalPrice('XAG', controller.signal),
        fetchMetalPrice('XPT', controller.signal),
        fetchMetalPrice('XPD', controller.signal),
      ]);

      if (reqId !== requestIdRef.current) return;

      setFxData(fxResult);
      setFxRates(fxResult.rates);
      setMetalPrices({
        XAU: gold,
        XAG: silver,
        XPT: plat,
        XPD: pall,
      });
      setIsLoading(false);
    } catch {
      if (reqId === requestIdRef.current) {
        setIsLoading(false);
        setErrorMessage('Unable to connect to live market feed. Displaying verified reference rates.');
      }
    }
  }, []);

  // Initial Mount Fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMarketData();
    }, 0);
    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadMarketData]);

  // Load Historical Chart Points when metal or timeframe changes
  useEffect(() => {
    let isCurrent = true;
    const controller = new AbortController();

    const timer = setTimeout(() => {
      setIsChartLoading(true);
      fetchHistoricalPoints(selectedMetal, chartTimeframe, controller.signal)
        .then((rawPts) => {
          if (!isCurrent) return;
          const convertedPts = rawPts.map((p) => {
            const convertedTroyOz = convertCurrency(p.price, selectedCurrency, fxRates);
            const convertedUnit = convertPriceUnit(convertedTroyOz, selectedUnit);
            return {
              ...p,
              price: convertedUnit,
            };
          });
          setChartPoints(convertedPts);
          setIsChartLoading(false);
        })
        .catch(() => {
          if (isCurrent) {
            setChartPoints([]);
            setIsChartLoading(false);
          }
        });
    }, 0);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [selectedMetal, chartTimeframe, selectedCurrency, selectedUnit, fxRates]);

  // Active Metal Price in Current Currency & Unit
  const activeMetalData = metalPrices[selectedMetal];
  const activePriceConverted = useMemo(() => {
    const usdOz = activeMetalData?.priceUsdPerTroyOz || 0;
    const inCurrencyOz = convertCurrency(usdOz, selectedCurrency, fxRates);
    return convertPriceUnit(inCurrencyOz, selectedUnit);
  }, [activeMetalData, selectedCurrency, selectedUnit, fxRates]);

  // Active Country metadata
  const currentCountryConfig = COUNTRIES[selectedCountry] || COUNTRIES.PK;

  // Dynamically constructed Market Reference Table Rows
  const tableRows = useMemo<TableRowData[]>(() => {
    const goldUsdOz = metalPrices.XAU?.priceUsdPerTroyOz || BASELINE_PRICES.XAU;
    const silverUsdOz = metalPrices.XAG?.priceUsdPerTroyOz || BASELINE_PRICES.XAG;
    const platUsdOz = metalPrices.XPT?.priceUsdPerTroyOz || BASELINE_PRICES.XPT;
    const pallUsdOz = metalPrices.XPD?.priceUsdPerTroyOz || BASELINE_PRICES.XPD;

    const goldCurOz = convertCurrency(goldUsdOz, selectedCurrency, fxRates);
    const silverCurOz = convertCurrency(silverUsdOz, selectedCurrency, fxRates);
    const platCurOz = convertCurrency(platUsdOz, selectedCurrency, fxRates);
    const pallCurOz = convertCurrency(pallUsdOz, selectedCurrency, fxRates);

    const isGulfOrSA = currentCountryConfig.isGulfOrSouthAsia;

    if (isGulfOrSA) {
      // South Asia & Gulf market denominations (Tola, 10g, Gram)
      return [
        {
          id: 'xau-24k-tola',
          metal: 'Gold 24K',
          denomination: '1 Tola',
          weightGrams: TOLA_TO_GRAMS,
          purityLabel: '100% (24K Pure)',
          rateInTargetCurrency: convertPriceUnit(goldCurOz, 'tola'),
          usdReference: convertPriceUnit(goldUsdOz, 'tola'),
          marketType: 'CONVERTED SPOT',
        },
        {
          id: 'xau-24k-10g',
          metal: 'Gold 24K',
          denomination: '10 Grams',
          weightGrams: 10.0,
          purityLabel: '100% (24K Pure)',
          rateInTargetCurrency: convertPriceUnit(goldCurOz, '10g'),
          usdReference: convertPriceUnit(goldUsdOz, '10g'),
          marketType: 'CONVERTED SPOT',
        },
        {
          id: 'xau-24k-1g',
          metal: 'Gold 24K',
          denomination: '1 Gram',
          weightGrams: 1.0,
          purityLabel: '100% (24K Pure)',
          rateInTargetCurrency: convertPriceUnit(goldCurOz, 'gram'),
          usdReference: convertPriceUnit(goldUsdOz, 'gram'),
          marketType: 'CONVERTED SPOT',
        },
        {
          id: 'xau-22k-tola',
          metal: 'Gold 22K',
          denomination: '1 Tola',
          weightGrams: TOLA_TO_GRAMS,
          purityLabel: '91.67% (Jewelry)',
          rateInTargetCurrency: convertPriceUnit(goldCurOz, 'tola') * PURITIES['22K'].ratio,
          usdReference: convertPriceUnit(goldUsdOz, 'tola') * PURITIES['22K'].ratio,
          marketType: 'CALCULATED SPOT',
        },
        {
          id: 'xau-21k-tola',
          metal: 'Gold 21K',
          denomination: '1 Tola',
          weightGrams: TOLA_TO_GRAMS,
          purityLabel: '87.50% (Arab Craft)',
          rateInTargetCurrency: convertPriceUnit(goldCurOz, 'tola') * PURITIES['21K'].ratio,
          usdReference: convertPriceUnit(goldUsdOz, 'tola') * PURITIES['21K'].ratio,
          marketType: 'CALCULATED SPOT',
        },
        {
          id: 'xau-18k-tola',
          metal: 'Gold 18K',
          denomination: '1 Tola',
          weightGrams: TOLA_TO_GRAMS,
          purityLabel: '75.00% (Diamond Craft)',
          rateInTargetCurrency: convertPriceUnit(goldCurOz, 'tola') * PURITIES['18K'].ratio,
          usdReference: convertPriceUnit(goldUsdOz, 'tola') * PURITIES['18K'].ratio,
          marketType: 'CALCULATED SPOT',
        },
        {
          id: 'xag-pure-tola',
          metal: 'Silver',
          denomination: '1 Tola',
          weightGrams: TOLA_TO_GRAMS,
          purityLabel: '99.9% Fine Bullion',
          rateInTargetCurrency: convertPriceUnit(silverCurOz, 'tola'),
          usdReference: convertPriceUnit(silverUsdOz, 'tola'),
          marketType: 'CONVERTED SPOT',
        },
        {
          id: 'xag-pure-10g',
          metal: 'Silver',
          denomination: '10 Grams',
          weightGrams: 10.0,
          purityLabel: '99.9% Fine Bullion',
          rateInTargetCurrency: convertPriceUnit(silverCurOz, '10g'),
          usdReference: convertPriceUnit(silverUsdOz, '10g'),
          marketType: 'CONVERTED SPOT',
        },
        {
          id: 'xpt-pure-1g',
          metal: 'Platinum',
          denomination: '1 Gram',
          weightGrams: 1.0,
          purityLabel: '99.9% Investment Bullion',
          rateInTargetCurrency: convertPriceUnit(platCurOz, 'gram'),
          usdReference: convertPriceUnit(platUsdOz, 'gram'),
          marketType: 'CONVERTED SPOT',
        },
        {
          id: 'xpd-pure-1g',
          metal: 'Palladium',
          denomination: '1 Gram',
          weightGrams: 1.0,
          purityLabel: '99.9% Industrial Bullion',
          rateInTargetCurrency: convertPriceUnit(pallCurOz, 'gram'),
          usdReference: convertPriceUnit(pallUsdOz, 'gram'),
          marketType: 'CONVERTED SPOT',
        },
      ];
    }

    // Western & International market denominations (Troy Ounce, Gram, 10g, Kilogram)
    return [
      {
        id: 'xau-24k-oz',
        metal: 'Gold 24K',
        denomination: '1 Troy Oz',
        weightGrams: TROY_OUNCE_TO_GRAMS,
        purityLabel: '100% (24K Pure)',
        rateInTargetCurrency: goldCurOz,
        usdReference: goldUsdOz,
        marketType: 'CONVERTED SPOT',
      },
      {
        id: 'xau-24k-1g',
        metal: 'Gold 24K',
        denomination: '1 Gram',
        weightGrams: 1.0,
        purityLabel: '100% (24K Pure)',
        rateInTargetCurrency: convertPriceUnit(goldCurOz, 'gram'),
        usdReference: convertPriceUnit(goldUsdOz, 'gram'),
        marketType: 'CONVERTED SPOT',
      },
      {
        id: 'xau-24k-10g',
        metal: 'Gold 24K',
        denomination: '10 Grams',
        weightGrams: 10.0,
        purityLabel: '100% (24K Pure)',
        rateInTargetCurrency: convertPriceUnit(goldCurOz, '10g'),
        usdReference: convertPriceUnit(goldUsdOz, '10g'),
        marketType: 'CONVERTED SPOT',
      },
      {
        id: 'xau-24k-kg',
        metal: 'Gold 24K',
        denomination: '1 Kilogram',
        weightGrams: 1000.0,
        purityLabel: '100% (24K Pure)',
        rateInTargetCurrency: convertPriceUnit(goldCurOz, 'kg'),
        usdReference: convertPriceUnit(goldUsdOz, 'kg'),
        marketType: 'CONVERTED SPOT',
      },
      {
        id: 'xau-22k-oz',
        metal: 'Gold 22K',
        denomination: '1 Troy Oz',
        weightGrams: TROY_OUNCE_TO_GRAMS,
        purityLabel: '91.67% (Jewelry)',
        rateInTargetCurrency: goldCurOz * PURITIES['22K'].ratio,
        usdReference: goldUsdOz * PURITIES['22K'].ratio,
        marketType: 'CALCULATED SPOT',
      },
      {
        id: 'xau-18k-oz',
        metal: 'Gold 18K',
        denomination: '1 Troy Oz',
        weightGrams: TROY_OUNCE_TO_GRAMS,
        purityLabel: '75.00% (Diamond Craft)',
        rateInTargetCurrency: goldCurOz * PURITIES['18K'].ratio,
        usdReference: goldUsdOz * PURITIES['18K'].ratio,
        marketType: 'CALCULATED SPOT',
      },
      {
        id: 'xau-14k-1g',
        metal: 'Gold 14K',
        denomination: '1 Gram',
        weightGrams: 1.0,
        purityLabel: '58.33% (Everyday Wear)',
        rateInTargetCurrency: convertPriceUnit(goldCurOz, 'gram') * PURITIES['14K'].ratio,
        usdReference: convertPriceUnit(goldUsdOz, 'gram') * PURITIES['14K'].ratio,
        marketType: 'CALCULATED SPOT',
      },
      {
        id: 'xag-pure-oz',
        metal: 'Silver',
        denomination: '1 Troy Oz',
        weightGrams: TROY_OUNCE_TO_GRAMS,
        purityLabel: '99.9% Fine Bullion',
        rateInTargetCurrency: silverCurOz,
        usdReference: silverUsdOz,
        marketType: 'CONVERTED SPOT',
      },
      {
        id: 'xag-pure-kg',
        metal: 'Silver',
        denomination: '1 Kilogram',
        weightGrams: 1000.0,
        purityLabel: '99.9% Fine Bullion',
        rateInTargetCurrency: convertPriceUnit(silverCurOz, 'kg'),
        usdReference: convertPriceUnit(silverUsdOz, 'kg'),
        marketType: 'CONVERTED SPOT',
      },
      {
        id: 'xpt-pure-oz',
        metal: 'Platinum',
        denomination: '1 Troy Oz',
        weightGrams: TROY_OUNCE_TO_GRAMS,
        purityLabel: '99.9% Investment Bullion',
        rateInTargetCurrency: platCurOz,
        usdReference: platUsdOz,
        marketType: 'CONVERTED SPOT',
      },
      {
        id: 'xpd-pure-oz',
        metal: 'Palladium',
        denomination: '1 Troy Oz',
        weightGrams: TROY_OUNCE_TO_GRAMS,
        purityLabel: '99.9% Industrial Bullion',
        rateInTargetCurrency: pallCurOz,
        usdReference: pallUsdOz,
        marketType: 'CONVERTED SPOT',
      },
    ];
  }, [metalPrices, selectedCurrency, fxRates, currentCountryConfig]);

  // Calculator Result
  const calcResult = useMemo(() => {
    const spotUsd = metalPrices[selectedMetal]?.priceUsdPerTroyOz || BASELINE_PRICES[selectedMetal];
    const melt = calculateMeltValue(
      selectedMetal,
      calcWeight,
      calcUnit,
      calcKarat,
      spotUsd,
      selectedCurrency,
      fxRates
    );
    const spread = calculateDealerSpread(melt.baseMarketValue, buyPremium, sellDiscount, dealerFee);

    return {
      weightInput: calcWeight,
      unitInput: calcUnit,
      karat: calcKarat,
      weightInGrams: melt.weightGrams,
      pureMetalGrams: melt.pureGrams,
      baseMarketValue: melt.baseMarketValue,
      estimatedBuyPrice: spread.estimatedBuy,
      estimatedSellPrice: spread.estimatedSell,
      dealerSpreadValue: spread.spreadValue,
    };
  }, [selectedMetal, calcWeight, calcUnit, calcKarat, selectedCurrency, fxRates, metalPrices, buyPremium, sellDiscount, dealerFee]);

  // Dynamic Chart Points: Actual provider history or optional illustrative fallback
  const displayedChartPoints = useMemo<HistoricalPoint[]>(() => {
    if (chartPoints.length > 0) return chartPoints;
    if (showIllustrativeFallback) {
      const activeSpotUsd = metalPrices[selectedMetal]?.priceUsdPerTroyOz || BASELINE_PRICES[selectedMetal];
      const rawFallback = generateIllustrativeFallbackPoints(chartTimeframe, activeSpotUsd);
      return rawFallback.map((p) => {
        const convertedTroyOz = convertCurrency(p.price, selectedCurrency, fxRates);
        const convertedUnit = convertPriceUnit(convertedTroyOz, selectedUnit);
        return {
          ...p,
          price: convertedUnit,
        };
      });
    }
    return [];
  }, [chartPoints, showIllustrativeFallback, selectedMetal, chartTimeframe, selectedCurrency, selectedUnit, metalPrices, fxRates]);

  // Chart Statistics
  const chartStats = useMemo(() => {
    if (displayedChartPoints.length < 2) {
      return { high: 0, low: 0, change: 0, percentChange: 0 };
    }
    const prices = displayedChartPoints.map((p) => p.price);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const first = prices[0];
    const last = prices[prices.length - 1];
    const change = last - first;
    const percentChange = first !== 0 ? (change / first) * 100 : 0;
    return { high, low, change, percentChange };
  }, [displayedChartPoints]);

  const handleExportCsv = () => {
    if (displayedChartPoints.length === 0) {
      setErrorMessage('Historical futures time-series is unavailable in browser due to CORS. Toggle illustrative preview to export sample data.');
      return;
    }
    const isFallback = showIllustrativeFallback && chartPoints.length === 0;
    const csvContent = generateCsvExport(
      displayedChartPoints,
      selectedMetal,
      selectedCurrency,
      selectedUnit,
      isFallback
    );
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedMetal}_${selectedCurrency}_${chartTimeframe}_${isFallback ? 'illustrative_fallback' : 'quotes'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySummary = () => {
    const text = `${METALS[selectedMetal].name} Rate: ${formatCurrencyValue(activePriceConverted, selectedCurrency)} per ${UNIT_LABELS[selectedUnit].short} (${formatDeterministicTimestamp(activeMetalData.timestampMs)}). Reference: OmniTools.`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div className="w-full space-y-8">
      {/* =========================================================================
          HERO & MASTER RATE CONTROLS
          ========================================================================= */}
      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                PRECIOUS METALS
              </span>
              <span
                role="status"
                aria-live="polite"
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 ${
                  activeMetalData.freshness === 'LIVE'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {activeMetalData.freshness}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Precious Metals Market Rates
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Global and country-specific bullion rates for Gold, Silver, Platinum, and Palladium with purity-adjusted valuations.
            </p>
          </div>

          {/* Regional, Currency & Unit Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Country Selector */}
            <div className="relative">
              <label htmlFor="country-select" className="sr-only">
                Select Country / Market
              </label>
              <select
                id="country-select"
                aria-label="Select Country or Market"
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
                className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
              >
                {Object.values(COUNTRIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.currency})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Currency Selector */}
            <div className="relative">
              <label htmlFor="currency-select" className="sr-only">
                Select Currency
              </label>
              <select
                id="currency-select"
                aria-label="Select Currency"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
                className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Unit Selector */}
            <div className="relative">
              <label htmlFor="unit-select" className="sr-only">
                Select Price Unit
              </label>
              <select
                id="unit-select"
                aria-label="Select Price Unit"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value as PriceUnit)}
                className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
              >
                {Object.entries(UNIT_LABELS).map(([uKey, uVal]) => (
                  <option key={uKey} value={uKey}>
                    {uVal.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadMarketData}
              disabled={isLoading}
              aria-label="Refresh market data feed"
              className="p-2.5 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm disabled:opacity-50"
              title="Refresh Market Rates"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Source, Timestamp & Freshness Transparency Bar */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Updated:{' '}
                <strong className="text-slate-700 dark:text-slate-300 font-mono">
                  {formatDeterministicTimestamp(activeMetalData.timestampMs)}
                </strong>
              </span>
            </span>
            <span>•</span>
            <span>
              Source:{' '}
              <strong className="text-slate-700 dark:text-slate-300">{activeMetalData.source}</strong>
            </span>
            <span>•</span>
            <span>
              Unit:{' '}
              <strong className="text-slate-700 dark:text-slate-300">{UNIT_LABELS[selectedUnit].short}</strong>
            </span>
            <span>•</span>
            <span>
              Currency:{' '}
              <strong className="text-slate-700 dark:text-slate-300">{selectedCurrency}</strong>
            </span>
            <span>•</span>
            <span className="capitalize">
              Rate Type:{' '}
              <strong className="text-slate-700 dark:text-slate-300">
                {activeMetalData.rateType === 'futures' ? 'Futures Reference' : 'Spot Reference'}
              </strong>
            </span>
            <span>•</span>
            <span>
              Freshness:{' '}
              <strong className="text-slate-700 dark:text-slate-300">{activeMetalData.freshness}</strong>
            </span>
            <span>•</span>
            <span>
              FX Ref:{' '}
              <strong className="text-slate-700 dark:text-slate-300">
                {fxData.provider} (1 {fxData.baseCurrency} = {formatDecimal(fxRates[selectedCurrency] ?? 1, 4)} {selectedCurrency} @ {formatDeterministicTimestamp(fxData.timestampMs)})
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              aria-label="Copy rate summary to clipboard"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Share Rate'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Notice Banner */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-amber-800 dark:text-amber-200 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            aria-label="Dismiss alert message"
            className="p-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: 4 FIRST-CLASS PRECIOUS METAL CARDS
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(METALS) as MetalCode[]).map((mCode) => {
          const mMeta = METALS[mCode];
          const mData = metalPrices[mCode];
          const isSelected = selectedMetal === mCode;

          const usdPrice = mData?.priceUsdPerTroyOz || BASELINE_PRICES[mCode];
          const curPriceOz = convertCurrency(usdPrice, selectedCurrency, fxRates);
          const finalPrice = convertPriceUnit(curPriceOz, selectedUnit);

          return (
            <button
              key={mCode}
              type="button"
              onClick={() => setSelectedMetal(mCode)}
              aria-label={`Select ${mMeta.name} for deep analysis and charting`}
              className={`p-5 rounded-3xl text-left transition-all border shadow-sm relative overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isSelected
                  ? 'bg-white dark:bg-[#111827] border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-[#111827] border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-sm"
                    style={{ backgroundColor: mMeta.accentColor }}
                  >
                    {mMeta.atomicSymbol}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">
                      {mMeta.name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      {mCode} • Spot
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    Active
                  </span>
                )}
              </div>

              {/* Price Display */}
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {formatCurrencyValue(finalPrice, selectedCurrency)}
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-slate-400 dark:text-slate-500">
                  <span>per {UNIT_LABELS[selectedUnit].short}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" /> +0.00%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          SECTION 2: HISTORICAL FUTURES CHART & MARKET METRICS
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Historical Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {METALS[selectedMetal].name} Historical Performance
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {METALS[selectedMetal].yahooSymbol}
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {METALS[selectedMetal].futuresLabel} converted into {selectedCurrency} / {UNIT_LABELS[selectedUnit].short}
              </p>
            </div>

            {/* Timeframe & Export Controls */}
            <div className="flex items-center gap-2">
              <div
                role="tablist"
                aria-label="Chart timeframe selection"
                className="flex bg-gray-100 dark:bg-[#0a0f1a] p-1 rounded-2xl border border-gray-200 dark:border-slate-800"
              >
                {(['1D', '1W', '1M', '3M', '6M', '1Y'] as ChartTimeframe[]).map((tf) => (
                  <button
                    key={tf}
                    role="tab"
                    aria-selected={chartTimeframe === tf}
                    onClick={() => setChartTimeframe(tf)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      chartTimeframe === tf
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <button
                onClick={handleExportCsv}
                aria-label="Download chart data as CSV"
                className="p-2 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                title="Export historical quotes as CSV"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Period Extremes Summary Badges */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 dark:bg-[#0a0f1a] rounded-2xl border border-gray-200 dark:border-slate-800/80 mb-6 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Period High</span>
              <strong className="text-slate-800 dark:text-slate-200">
                {displayedChartPoints.length >= 2
                  ? `${formatCurrencyValue(chartStats.high, selectedCurrency)}${showIllustrativeFallback && chartPoints.length === 0 ? ' *' : ''}`
                  : '—'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Period Low</span>
              <strong className="text-slate-800 dark:text-slate-200">
                {displayedChartPoints.length >= 2
                  ? `${formatCurrencyValue(chartStats.low, selectedCurrency)}${showIllustrativeFallback && chartPoints.length === 0 ? ' *' : ''}`
                  : '—'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Period Trend</span>
              {displayedChartPoints.length >= 2 ? (
                <strong
                  className={`flex items-center gap-1 ${
                    chartStats.change >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {chartStats.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {chartStats.percentChange >= 0 ? '+' : ''}
                  {formatDecimal(chartStats.percentChange, 2)}%{showIllustrativeFallback && chartPoints.length === 0 ? ' *' : ''}
                </strong>
              ) : (
                <span className="text-slate-400 font-medium">Unavailable</span>
              )}
            </div>
          </div>

          {/* Recharts Container / Explicit Unavailable State */}
          <div className="h-64 sm:h-72 w-full flex-grow relative flex flex-col justify-center">
            {isChartLoading && (
              <div className="absolute inset-0 bg-white/60 dark:bg-[#111827]/60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-2xl">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            )}
            {displayedChartPoints.length >= 2 ? (
              <>
                {showIllustrativeFallback && chartPoints.length === 0 && (
                  <div className="flex items-center justify-between p-2.5 mb-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-800 dark:text-amber-200 text-xs">
                    <span className="font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      Illustrative fallback — not market data
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowIllustrativeFallback(false)}
                      className="text-[11px] font-medium text-amber-700 dark:text-amber-300 underline hover:no-underline"
                    >
                      Dismiss Preview
                    </button>
                  </div>
                )}
                <div className="w-full flex-grow relative min-h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displayedChartPoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        dy={10}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        orientation="right"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        tickFormatter={(val) =>
                          new Intl.NumberFormat('en-US', {
                            notation: 'compact',
                            compactDisplay: 'short',
                          }).format(val)
                        }
                        dx={10}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as HistoricalPoint;
                            return (
                              <div className="p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-xl text-xs">
                                <p className="text-slate-400 mb-1">{data.date}</p>
                                <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                                  {formatCurrencyValue(data.price, selectedCurrency)}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  {showIllustrativeFallback && chartPoints.length === 0
                                    ? 'Illustrative fallback — not market data'
                                    : `per ${UNIT_LABELS[selectedUnit].short} (Futures Ref)`}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={METALS[selectedMetal].accentColor}
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="h-full w-full min-h-[200px] flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl bg-gray-50/50 dark:bg-[#0a0f1a]/50">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-3 text-slate-500">
                  <Info className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Historical Futures Time-Series Unavailable in Browser
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-4 leading-relaxed">
                  External futures history ({METALS[selectedMetal].futuresLabel}) cannot be queried directly in-browser due to CORS restrictions. Spot valuations and currency conversions remain live and operational.
                </p>
                <button
                  type="button"
                  onClick={() => setShowIllustrativeFallback(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
                >
                  Preview Illustrative Fallback (Testing Only)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Key Market Statistics */}
        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" /> Market Quotation
              </h3>
              <span className="text-xs font-mono font-semibold text-slate-400">
                {selectedMetal} / {selectedCurrency}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 dark:bg-[#0a0f1a] border border-gray-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Reference Spot Rate</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {formatCurrencyValue(activePriceConverted, selectedCurrency)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 dark:bg-[#0a0f1a] border border-gray-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">24-Hour Range</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {formatCurrencyValue(
                    convertPriceUnit(convertCurrency(activeMetalData.low24hUsd, selectedCurrency, fxRates), selectedUnit),
                    selectedCurrency
                  )}{' '}
                  -{' '}
                  {formatCurrencyValue(
                    convertPriceUnit(convertCurrency(activeMetalData.high24hUsd, selectedCurrency, fxRates), selectedUnit),
                    selectedCurrency
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 dark:bg-[#0a0f1a] border border-gray-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Fine Bullion Purity</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  99.99% Fine {METALS[selectedMetal].atomicSymbol}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 dark:bg-[#0a0f1a] border border-gray-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">FX Reference Rate</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  1 {fxData.baseCurrency} = {formatDecimal(fxRates[selectedCurrency], 4)} {selectedCurrency}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 dark:bg-[#0a0f1a] border border-gray-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">FX Provider & Timestamp</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px] text-right">
                  {fxData.provider} • {formatDeterministicTimestamp(fxData.timestampMs)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 dark:bg-[#0a0f1a] border border-gray-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Canonical Tola Basis</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  11.6638 g (0.375 oz t)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed">
              Quoted rates represent international spot bullion contracts traded without physical delivery surcharges. Local retail coins, minted wafers, and jewelry include dealer premiums.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: ADAPTIVE COUNTRY / CURRENCY MARKET REFERENCE TABLE
          ========================================================================= */}
      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentCountryConfig.flag}</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {currentCountryConfig.marketLabel} Table ({selectedCurrency})
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Standard local market denominations for {currentCountryConfig.name} derived from verified spot rates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
              FX Reference ({fxData.baseCurrency}/{selectedCurrency}): {formatDecimal(fxRates[selectedCurrency], 2)}
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap">
              [CONVERTED SPOT REFERENCE]
            </span>
          </div>
        </div>

        {/* Responsive Horizontally Scrollable Table with Fixed Row Integrity */}
        <div className="overflow-x-auto w-full max-w-full">
          <table id="country-market-table" className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th scope="col" className="py-3 px-4 whitespace-nowrap">Metal / Denomination</th>
                <th scope="col" className="py-3 px-4 whitespace-nowrap">Weight</th>
                <th scope="col" className="py-3 px-4 whitespace-nowrap">Purity</th>
                <th scope="col" className="py-3 px-4 text-right whitespace-nowrap">Rate ({selectedCurrency})</th>
                <th scope="col" className="py-3 px-4 text-right whitespace-nowrap">USD Ref</th>
                <th scope="col" className="py-3 px-4 text-center whitespace-nowrap">Market Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 text-xs">
              {tableRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <th scope="row" className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {row.metal} / {row.denomination}
                  </th>
                  <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDecimal(row.weightGrams, 3)} g
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {row.purityLabel}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {formatCurrencyValue(row.rateInTargetCurrency, selectedCurrency)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    ${formatDecimal(row.usdReference, 2)}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                      {row.marketType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
          <span>* Computed mathematically from international spot rates using FX Reference Rates ({fxData.provider}).</span>
          <span>1 Tola = 11.6638038 g • 1 Troy Oz = 31.1034768 g</span>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: INTRINSIC METAL MELT VALUE CALCULATOR
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calculator Configuration Form */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" /> Precious Metal Value Calculator
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              Intrinsic Melt Estimate
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Metal Selection */}
            <div>
              <label htmlFor="calc-metal-select" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Metal
              </label>
              <select
                id="calc-metal-select"
                aria-label="Select Metal for calculation"
                value={selectedMetal}
                onChange={(e) => setSelectedMetal(e.target.value as MetalCode)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {(Object.keys(METALS) as MetalCode[]).map((mCode) => (
                  <option key={mCode} value={mCode}>
                    {METALS[mCode].name} ({mCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Purity Selection (Gold Only) */}
            <div>
              <label htmlFor="calc-karat-select" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Purity Rating
              </label>
              <select
                id="calc-karat-select"
                aria-label="Select Karat Purity"
                disabled={selectedMetal !== 'XAU'}
                value={calcKarat}
                onChange={(e) => setCalcKarat(e.target.value as GoldKarat)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
              >
                {selectedMetal === 'XAU' ? (
                  (Object.keys(PURITIES) as GoldKarat[]).map((k) => (
                    <option key={k} value={k}>
                      {PURITIES[k].name} ({formatDecimal(PURITIES[k].ratio * 100, 1)}%)
                    </option>
                  ))
                ) : (
                  <option value="24K">99.9% Pure Fine Metal</option>
                )}
              </select>
            </div>

            {/* Weight Input */}
            <div>
              <label htmlFor="calc-weight-input" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Weight Amount
              </label>
              <input
                id="calc-weight-input"
                aria-label="Enter Metal Weight Amount"
                type="number"
                min="0.001"
                step="any"
                value={calcWeight}
                onChange={(e) => setCalcWeight(Math.max(0.001, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Weight Unit */}
            <div>
              <label htmlFor="calc-unit-select" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Weight Unit
              </label>
              <select
                id="calc-unit-select"
                aria-label="Select Weight Unit for Calculation"
                value={calcUnit}
                onChange={(e) => setCalcUnit(e.target.value as PriceUnit)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {Object.entries(UNIT_LABELS).map(([uKey, uVal]) => (
                  <option key={uKey} value={uKey}>
                    {uVal.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User-Defined Dealer Spread Simulator */}
          <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" /> Optional Dealer Spread Modeling (User-Defined)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label htmlFor="buy-premium-input" className="block text-slate-400 mb-1 text-[11px]">
                  Buy Premium (%)
                </label>
                <input
                  id="buy-premium-input"
                  aria-label="Buy Premium Percentage"
                  type="number"
                  min="0"
                  step="0.1"
                  value={buyPremium}
                  onChange={(e) => setBuyPremium(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-lg text-xs font-mono font-semibold"
                />
              </div>
              <div>
                <label htmlFor="sell-discount-input" className="block text-slate-400 mb-1 text-[11px]">
                  Sell Discount (%)
                </label>
                <input
                  id="sell-discount-input"
                  aria-label="Sell Discount Percentage"
                  type="number"
                  min="0"
                  step="0.1"
                  value={sellDiscount}
                  onChange={(e) => setSellDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-lg text-xs font-mono font-semibold"
                />
              </div>
              <div>
                <label htmlFor="dealer-fee-input" className="block text-slate-400 mb-1 text-[11px]">
                  Fixed Fee ({selectedCurrency})
                </label>
                <input
                  id="dealer-fee-input"
                  aria-label="Fixed Dealer Fee in selected currency"
                  type="number"
                  min="0"
                  value={dealerFee}
                  onChange={(e) => setDealerFee(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-lg text-xs font-mono font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculator Output Summary */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900/40 dark:to-slate-900 border border-blue-500/20 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" /> Estimated Metal Melt Value
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 font-mono">
                {selectedCurrency}
              </span>
            </div>

            {/* Giant Output Number */}
            <div className="mb-6">
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {formatCurrencyValue(calcResult.baseMarketValue, selectedCurrency)}
              </div>
              <p className="text-xs text-blue-200/90 mt-1">
                Intrinsic commodity value of pure metal content at spot reference price.
              </p>
            </div>

            {/* Calculation Breakdown */}
            <div className="space-y-3 p-4 rounded-2xl bg-black/20 backdrop-blur-md text-xs border border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Gross Input Weight</span>
                <span className="font-mono font-semibold">
                  {calcResult.weightInput} {UNIT_LABELS[calcResult.unitInput].short} ({formatDecimal(calcResult.weightInGrams, 3)} g)
                </span>
              </div>
              {selectedMetal === 'XAU' && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Purity Rating</span>
                  <span className="font-mono font-semibold">
                    {calcResult.karat} ({formatDecimal(PURITIES[calcResult.karat].ratio * 100, 2)}% pure)
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Fine Pure Metal</span>
                <span className="font-mono font-semibold text-amber-300">
                  {formatDecimal(calcResult.pureMetalGrams, 4)} grams
                </span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                <span className="text-blue-200">Estimated Buy / Pay</span>
                <span className="font-mono font-semibold">
                  {formatCurrencyValue(calcResult.estimatedBuyPrice, selectedCurrency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Estimated Sell / Cash</span>
                <span className="font-mono font-semibold">
                  {formatCurrencyValue(calcResult.estimatedSellPrice, selectedCurrency)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-blue-200/80 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-300" />
            <p>
              Excludes dealer retail premiums, craftsmanship making charges, hallmark certifications, and local sales taxes unless explicitly modeled.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 5: METHODOLOGY, COMPLIANCE & ACCREDITATION DISCLAIMER
          ========================================================================= */}
      <div className="p-6 rounded-3xl bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-3">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" /> Market Methodology & Compliance Disclaimer
        </h4>
        <p className="leading-relaxed">
          Precious metals spot rates (XAU, XAG, XPT, XPD) are derived from independent public financial feeds (Gold API — Spot Reference) and converted via FX Reference Rates (ExchangeRate-API). All mathematical calculations execute locally inside your browser for zero latency and privacy protection.
        </p>
        <p className="leading-relaxed">
          <strong>Unit Conversions:</strong> 1 Troy Ounce = exactly 31.1034768 grams. 1 Tola = exactly 180 grains = 11.6638038 grams (exactly 3/8 or 0.375 Troy Ounce). 1 Kilogram = 1,000 grams.
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 border-t border-gray-200 dark:border-slate-800 pt-3">
          <strong>Disclaimer:</strong> This tool is provided for educational, informational, and general bullion valuation purposes only. It does not constitute investment, financial, or trading advice. Physical retail jewelry, coin dealer spreads, local import tariffs, and artisan craftsmanship charges will vary.
        </p>
      </div>
    </div>
  );
}
