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
  Plus,
  Trash2,
  RotateCcw,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import {
  WeightUnit,
  UNITS,
  METAL_PURITIES_MAP,
  calculateMeltValue as engineCalculateMeltValue,
  calculateScrapLot,
  LotItemInput,
  SingleCalculationResult,
  LotCalculationResult,
} from '@/lib/preciousMetalsEngine';
import {
  FreshnessState,
  FreshnessEvaluation,
  evaluateQuoteFreshness,
} from '@/lib/preciousMetalsFreshness';
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
  high24hUsd?: number | null;
  low24hUsd?: number | null;
  updatedAt: string;
  timestampMs: number;
  retrievedAt: string;
  source: string;
  rateType: 'spot' | 'futures' | 'reference';
  freshness: FreshnessState;
  freshnessEvaluation: FreshnessEvaluation;
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
  PK: { code: 'PK', name: 'Pakistan', flag: '🇵🇰', currency: 'PKR', locale: 'en-PK', primaryUnit: 'tola', secondaryUnit: '10g', marketLabel: 'Pakistan Spot Conversion (Interbank)', isGulfOrSouthAsia: true },
  US: { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', locale: 'en-US', primaryUnit: 'troy_oz', secondaryUnit: 'gram', marketLabel: 'US Spot Benchmark', isGulfOrSouthAsia: false },
  GB: { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', locale: 'en-GB', primaryUnit: 'troy_oz', secondaryUnit: 'gram', marketLabel: 'UK Spot Benchmark', isGulfOrSouthAsia: false },
  EU: { code: 'EU', name: 'Eurozone / EU', flag: '🇪🇺', currency: 'EUR', locale: 'en-DE', primaryUnit: 'troy_oz', secondaryUnit: 'gram', marketLabel: 'Eurozone Spot Benchmark', isGulfOrSouthAsia: false },
  AE: { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', locale: 'ar-AE', primaryUnit: 'tola', secondaryUnit: '10g', marketLabel: 'UAE Spot Conversion', isGulfOrSouthAsia: true },
  SA: { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', locale: 'ar-SA', primaryUnit: 'tola', secondaryUnit: '10g', marketLabel: 'Saudi Arabia Spot Conversion', isGulfOrSouthAsia: true },
  IN: { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', locale: 'en-IN', primaryUnit: 'tola', secondaryUnit: '10g', marketLabel: 'India Spot Conversion (Interbank)', isGulfOrSouthAsia: true },
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

export const BASELINE_OBSERVATION_UPDATED_AT = '2026-10-14T22:00:00.000Z';
export const BASELINE_OBSERVATION_TIMESTAMP_MS = 1792015200000;

export const DEFAULT_FX_OBSERVATION_UPDATED_AT = '2026-10-14T00:02:32.000Z';
export const DEFAULT_FX_OBSERVATION_TIMESTAMP_MS = 1791936152000;

const INITIAL_UPDATED_AT = BASELINE_OBSERVATION_UPDATED_AT;
const INITIAL_TIMESTAMP_MS = BASELINE_OBSERVATION_TIMESTAMP_MS;

export const DEFAULT_FX_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  PKR: 277.05,
  EUR: 0.893,
  GBP: 0.755,
  AED: 3.6725,
  SAR: 3.75,
  INR: 95.11,
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
  XAU: 4106.50,
  XAG: 55.76,
  XPT: 1605.00,
  XPD: 1118.00,
};

export async function fetchMetalPrice(
  code: MetalCode,
  signal?: AbortSignal
): Promise<MetalPriceData> {
  const fallbackPrice = BASELINE_PRICES[code];
  const url = `https://api.gold-api.com/price/${code}`;
  const now = Date.now();

  try {
    const res = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data || typeof data !== 'object') {
      throw new Error('Malformed API payload: expected JSON object');
    }

    const rawPrice = Number(data.price);
    if (!Number.isFinite(rawPrice) || rawPrice <= 0) {
      throw new Error(`Malformed price for ${code}: ${data.price}`);
    }

    // Response validation: instrument symbol & currency
    if (data.symbol && typeof data.symbol === 'string' && data.symbol.toUpperCase() !== code) {
      throw new Error(`Symbol mismatch: expected ${code}, got ${data.symbol}`);
    }
    if (data.currency && typeof data.currency === 'string' && data.currency.toUpperCase() !== 'USD') {
      throw new Error(`Currency mismatch for ${code}: expected USD, got ${data.currency}`);
    }

    // Response validation: timestamp must be present and recent
    if (!data.updatedAt) {
      throw new Error(`Missing updatedAt timestamp for ${code}`);
    }

    const parsedTimestamp = new Date(data.updatedAt).getTime();
    if (!Number.isFinite(parsedTimestamp) || parsedTimestamp <= 0) {
      throw new Error(`Invalid updatedAt timestamp for ${code}: ${data.updatedAt}`);
    }

    // Sanity check: provider timestamp must not be wildly in the future (>5m) or unreasonably stale (>30 days)
    if (now - parsedTimestamp < -300000) {
      throw new Error(`Clock skew detected: provider timestamp in future for ${code}`);
    }
    if (now - parsedTimestamp > 30 * 86400000) {
      throw new Error(`Provider quote timestamp is older than 30 days for ${code}`);
    }

    const freshnessEvaluation = evaluateQuoteFreshness({
      providerTimestampMs: parsedTimestamp,
      retrievedAtMs: now,
      nowMs: now,
      isFallback: false,
      providerName: 'Gold API — Spot Reference',
    });

    const changeUsd = Number.isFinite(Number(data.ch)) ? Number(data.ch) : 0;
    const changePct = Number.isFinite(Number(data.chp)) ? Number(data.chp) : 0;

    return {
      code,
      name: METALS[code].name,
      priceUsdPerTroyOz: rawPrice,
      change24hUsd: changeUsd,
      change24hPercent: changePct,
      high24hUsd: null,
      low24hUsd: null,
      updatedAt: new Date(parsedTimestamp).toISOString(),
      timestampMs: parsedTimestamp,
      retrievedAt: new Date(now).toISOString(),
      source: 'Gold API — Spot Reference',
      rateType: 'spot',
      freshness: freshnessEvaluation.state,
      freshnessEvaluation,
    };
  } catch {
    const fallbackEvaluation = evaluateQuoteFreshness({
      isFallback: true,
      retrievedAtMs: now,
      nowMs: now,
      providerName: 'Verified Reference Baseline',
    });

    return {
      code,
      name: METALS[code].name,
      priceUsdPerTroyOz: fallbackPrice,
      change24hUsd: 0,
      change24hPercent: 0,
      high24hUsd: null,
      low24hUsd: null,
      updatedAt: BASELINE_OBSERVATION_UPDATED_AT,
      timestampMs: BASELINE_OBSERVATION_TIMESTAMP_MS,
      retrievedAt: new Date(now).toISOString(),
      source: 'Verified Reference Baseline',
      rateType: 'reference',
      freshness: fallbackEvaluation.state,
      freshnessEvaluation: fallbackEvaluation,
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
      const timestampMs = Number.isFinite(rawTs) && rawTs > 0 ? rawTs * 1000 : DEFAULT_FX_OBSERVATION_TIMESTAMP_MS;
      return {
        provider: 'ExchangeRate-API',
        timestampMs,
        baseCurrency: 'USD',
        rates: merged,
      };
    }
    return {
      provider: 'ExchangeRate-API (Reference)',
      timestampMs: DEFAULT_FX_OBSERVATION_TIMESTAMP_MS,
      baseCurrency: 'USD',
      rates: DEFAULT_FX_RATES,
    };
  } catch {
    return {
      provider: 'ExchangeRate-API (Reference)',
      timestampMs: DEFAULT_FX_OBSERVATION_TIMESTAMP_MS,
      baseCurrency: 'USD',
      rates: DEFAULT_FX_RATES,
    };
  }
}

export async function fetchFxRates(signal?: AbortSignal): Promise<Record<CurrencyCode, number>> {
  const result = await fetchFxData(signal);
  return result.rates;
}

export interface HistoricalResult {
  points: HistoricalPoint[];
  symbol?: string;
  instrumentName?: string;
  instrumentType?: string;
  source?: string;
  error?: string;
}

export async function fetchHistoricalPoints(
  code: MetalCode,
  timeframe: ChartTimeframe,
  signal?: AbortSignal
): Promise<HistoricalResult> {
  const endpoint = '/api/precious-metals-history';
  const url = `${endpoint}?metal=${encodeURIComponent(code)}&timeframe=${encodeURIComponent(timeframe)}`;

  try {
    const res = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.points) && data.points.length > 0) {
      const points: HistoricalPoint[] = data.points.map(
        (p: { timestamp: number; date: string; price: number }) => ({
          timestamp: p.timestamp,
          date: p.date,
          price: Number(p.price),
        })
      );

      return {
        points,
        symbol: data.symbol,
        instrumentName: data.instrumentName,
        instrumentType: data.instrumentType,
        source: data.provenance?.provider || data.source,
      };
    }

    throw new Error(data.error || 'No historical quotes available.');
  } catch (err: unknown) {
    if (signal?.aborted) {
      return { points: [] };
    }
    const msg = err instanceof Error ? err.message : 'Failed to retrieve historical data';
    return {
      points: [],
      error: msg,
    };
  }
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
  source: string = 'COMEX / NYMEX via Yahoo Finance Market Data',
  instrumentType: string = 'Futures Settlement'
): string {
  const headers = [
    'Timestamp_UTC',
    'Date',
    'Metal_Code',
    'Currency',
    'Unit',
    'Price',
    'Source',
    'Instrument_Type',
  ];
  const rows = points.map((p) =>
    [
      sanitizeCsvField(new Date(p.timestamp).toISOString()),
      sanitizeCsvField(p.date),
      sanitizeCsvField(metal),
      sanitizeCsvField(currency),
      sanitizeCsvField(unit),
      sanitizeCsvField(p.price.toFixed(4)),
      sanitizeCsvField(source),
      sanitizeCsvField(instrumentType),
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\r\n');
}

/* =========================================================================
   6. REACT COMPONENT — PRECIOUS METALS DASHBOARD
   ========================================================================= */

function buildInitialMetalPrices(): Record<MetalCode, MetalPriceData> {
  const codes: MetalCode[] = ['XAU', 'XAG', 'XPT', 'XPD'];
  const res: Partial<Record<MetalCode, MetalPriceData>> = {};
  for (const c of codes) {
    const fallbackPrice = BASELINE_PRICES[c];
    const evalResult = evaluateQuoteFreshness({
      isFallback: true,
      providerName: 'Verified Reference Baseline',
    });
    res[c] = {
      code: c,
      name: METALS[c].name,
      priceUsdPerTroyOz: fallbackPrice,
      change24hUsd: 0,
      change24hPercent: 0,
      high24hUsd: null,
      low24hUsd: null,
      updatedAt: INITIAL_UPDATED_AT,
      timestampMs: INITIAL_TIMESTAMP_MS,
      retrievedAt: INITIAL_UPDATED_AT,
      source: 'Verified Reference Baseline',
      rateType: 'reference',
      freshness: 'FALLBACK_BENCHMARK',
      freshnessEvaluation: evalResult,
    };
  }
  return res as Record<MetalCode, MetalPriceData>;
}

export default function PreciousMetals() {
  // Navigation & Region Settings
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('PK');
  const [selectedMetal, setSelectedMetal] = useState<MetalCode>('XAU');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('PKR');
  const [selectedUnit, setSelectedUnit] = useState<PriceUnit>('tola');
  const [chartTimeframe, setChartTimeframe] = useState<ChartTimeframe>('1M');

  // Rates Data State — Initial values are verified fallback benchmarks with explicit provenance
  const [metalPrices, setMetalPrices] = useState<Record<MetalCode, MetalPriceData>>(buildInitialMetalPrices);

  const [fxData, setFxData] = useState<FxDataPayload>({
    provider: 'ExchangeRate-API',
    timestampMs: INITIAL_TIMESTAMP_MS,
    baseCurrency: 'USD',
    rates: DEFAULT_FX_RATES,
  });
  const [fxRates, setFxRates] = useState<Record<CurrencyCode, number>>(DEFAULT_FX_RATES);
  const [chartPoints, setChartPoints] = useState<HistoricalPoint[]>([]);
  const [chartMeta, setChartMeta] = useState<{
    symbol?: string;
    instrumentName?: string;
    instrumentType?: string;
    source?: string;
  }>({
    symbol: 'GC=F',
    instrumentName: 'COMEX Gold Futures (Active Front-Month Contract)',
    instrumentType: 'futures',
    source: 'COMEX / NYMEX via Yahoo Finance Market Data',
  });
  const [chartError, setChartError] = useState<string | null>(null);
  const [chartRetryCount, setChartRetryCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Enhanced Calculator State
  const [calcMode, setCalcMode] = useState<'single' | 'lot'>('single');
  const [calcMetal, setCalcMetal] = useState<MetalCode>('XAU');
  const [calcWeight, setCalcWeight] = useState<number>(1.0);
  const [calcUnit, setCalcUnit] = useState<WeightUnit>('tola');
  const [calcPurityId, setCalcPurityId] = useState<string>('24K');
  const [calcCustomFineness, setCalcCustomFineness] = useState<string>('0.925');
  const [calcQuantity, setCalcQuantity] = useState<number>(1);
  const [isManualSpotOverride, setIsManualSpotOverride] = useState<boolean>(false);
  const [manualSpotPrice, setManualSpotPrice] = useState<string>('');
  const [buyPremium, setBuyPremium] = useState<number>(3.0);
  const [sellDiscount, setSellDiscount] = useState<number>(12.0);
  const [dealerFee, setDealerFee] = useState<number>(0);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [copiedLotSummary, setCopiedLotSummary] = useState<boolean>(false);

  // Multi-Item Scrap Lot State
  const [lotItems, setLotItems] = useState<LotItemInput[]>([
    {
      id: 'lot-item-1',
      name: '14K Gold Band',
      metal: 'XAU',
      grossWeight: 5.0,
      weightUnit: 'gram',
      purityId: '14K',
      quantity: 1,
    },
    {
      id: 'lot-item-2',
      name: '18K Gold Chain',
      metal: 'XAU',
      grossWeight: 12.0,
      weightUnit: 'gram',
      purityId: '18K',
      quantity: 1,
    },
    {
      id: 'lot-item-3',
      name: 'Sterling Silver Fork',
      metal: 'XAG',
      grossWeight: 45.0,
      weightUnit: 'gram',
      purityId: '925',
      quantity: 1,
    },
  ]);

  // Form State for Adding an Item to the Scrap Lot
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemMetal, setNewItemMetal] = useState<MetalCode>('XAU');
  const [newItemWeight, setNewItemWeight] = useState<number>(10.0);
  const [newItemUnit, setNewItemUnit] = useState<WeightUnit>('gram');
  const [newItemPurityId, setNewItemPurityId] = useState<string>('14K');
  const [newItemCustomFineness] = useState<string>('0.925');
  const [newItemQuantity] = useState<number>(1);

  // Synchronize calcMetal and default purity when a metal card is clicked
  const handleSelectMetal = (mCode: MetalCode) => {
    setSelectedMetal(mCode);
    setCalcMetal(mCode);
    if (mCode === 'XAU') setCalcPurityId('14K');
    else if (mCode === 'XAG') setCalcPurityId('925');
    else if (mCode === 'XPT') setCalcPurityId('Pt950');
    else if (mCode === 'XPD') setCalcPurityId('Pd950');
  };

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
      setChartError(null);
      fetchHistoricalPoints(selectedMetal, chartTimeframe, controller.signal)
        .then((result) => {
          if (!isCurrent) return;
          if (result.error && result.points.length === 0) {
            setChartError(result.error);
            setChartPoints([]);
            setIsChartLoading(false);
            return;
          }
          if (result.symbol) {
            setChartMeta({
              symbol: result.symbol,
              instrumentName: result.instrumentName,
              instrumentType: result.instrumentType,
              source: result.source,
            });
          }
          const convertedPts = result.points.map((p) => {
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
        .catch((err) => {
          if (isCurrent) {
            setChartError(err instanceof Error ? err.message : 'Historical data unavailable');
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
  }, [selectedMetal, chartTimeframe, selectedCurrency, selectedUnit, fxRates, chartRetryCount]);

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

  // Spot price for the currently active calculator metal in selected currency
  const liveSpotPerTroyOzInSelectedCurrency = useMemo(() => {
    const spotUsd = metalPrices[calcMetal]?.priceUsdPerTroyOz || BASELINE_PRICES[calcMetal];
    return convertCurrency(spotUsd, selectedCurrency, fxRates);
  }, [metalPrices, calcMetal, selectedCurrency, fxRates]);

  const effectiveSpotPriceInSelectedCurrency = useMemo(() => {
    if (isManualSpotOverride) {
      const parsed = parseFloat(manualSpotPrice);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return liveSpotPerTroyOzInSelectedCurrency;
  }, [isManualSpotOverride, manualSpotPrice, liveSpotPerTroyOzInSelectedCurrency]);

  // Spot prices for all 4 metals in selected currency (for lot summing)
  const allSpotsInSelectedCurrency = useMemo<Record<MetalCode, number>>(() => {
    return {
      XAU: convertCurrency(metalPrices.XAU?.priceUsdPerTroyOz || BASELINE_PRICES.XAU, selectedCurrency, fxRates),
      XAG: convertCurrency(metalPrices.XAG?.priceUsdPerTroyOz || BASELINE_PRICES.XAG, selectedCurrency, fxRates),
      XPT: convertCurrency(metalPrices.XPT?.priceUsdPerTroyOz || BASELINE_PRICES.XPT, selectedCurrency, fxRates),
      XPD: convertCurrency(metalPrices.XPD?.priceUsdPerTroyOz || BASELINE_PRICES.XPD, selectedCurrency, fxRates),
    };
  }, [metalPrices, selectedCurrency, fxRates]);

  // Single Item Engine Calculation
  const singleCalcResult = useMemo<SingleCalculationResult>(() => {
    const customNum = parseFloat(calcCustomFineness);
    return engineCalculateMeltValue({
      metal: calcMetal,
      grossWeight: calcWeight,
      weightUnit: calcUnit,
      purityId: calcPurityId,
      customFineness: Number.isFinite(customNum) ? customNum : undefined,
      spotPricePerTroyOz: effectiveSpotPriceInSelectedCurrency,
      quantity: calcQuantity,
      spreadConfig: {
        buyPremiumPercent: buyPremium,
        sellDiscountPercent: sellDiscount,
        fixedFee: dealerFee,
      },
    });
  }, [
    calcMetal,
    calcWeight,
    calcUnit,
    calcPurityId,
    calcCustomFineness,
    effectiveSpotPriceInSelectedCurrency,
    calcQuantity,
    buyPremium,
    sellDiscount,
    dealerFee,
  ]);

  // Scrap Lot Engine Calculation
  const lotCalcResult = useMemo<LotCalculationResult>(() => {
    return calculateScrapLot(lotItems, allSpotsInSelectedCurrency, {
      buyPremiumPercent: buyPremium,
      sellDiscountPercent: sellDiscount,
      fixedFee: dealerFee,
    });
  }, [lotItems, allSpotsInSelectedCurrency, buyPremium, sellDiscount, dealerFee]);

  // Quick Preset Selector
  const applyPreset = (preset: { metal: MetalCode; weight: number; unit: WeightUnit; purityId: string }) => {
    setCalcMetal(preset.metal);
    setCalcWeight(preset.weight);
    setCalcUnit(preset.unit);
    setCalcPurityId(preset.purityId);
    setCalcQuantity(1);
  };

  // Lot Item Handlers
  const handleAddItemToLot = () => {
    const customNum = parseFloat(newItemCustomFineness);
    const item: LotItemInput = {
      id: `lot-item-${Date.now()}`,
      name: newItemName.trim() || `${METALS[newItemMetal].name} Item`,
      metal: newItemMetal,
      grossWeight: Math.max(0.001, newItemWeight || 1),
      weightUnit: newItemUnit,
      purityId: newItemPurityId,
      customFineness: Number.isFinite(customNum) ? customNum : undefined,
      quantity: Math.max(1, Math.floor(newItemQuantity || 1)),
    };
    setLotItems((prev) => [...prev, item]);
    setNewItemName('');
    setNewItemWeight(10);
  };

  const handleRemoveItemFromLot = (id: string) => {
    setLotItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearLot = () => {
    setLotItems([]);
  };

  const handleExportLotCsv = () => {
    if (lotCalcResult.items.length === 0) return;
    const headers = [
      'Item ID',
      'Name',
      'Metal',
      'Gross Weight',
      'Unit',
      'Gross Grams',
      'Purity',
      'Fineness',
      'Pure Grams',
      'Pure Troy Oz',
      'Quantity',
      `Melt Value (${selectedCurrency})`,
    ];
    const rows = lotCalcResult.items.map((it) => [
      it.id,
      `"${it.name.replace(/"/g, '""')}"`,
      it.metal,
      it.grossWeightInput,
      it.grossWeightUnit,
      it.totalGrossWeightGrams.toFixed(3),
      `"${it.purityLabel}"`,
      it.finenessDecimal.toFixed(4),
      it.fineWeightGrams.toFixed(4),
      it.fineWeightTroyOz.toFixed(5),
      it.quantity,
      it.totalMeltValue.toFixed(2),
    ]);

    rows.push([]);
    rows.push([
      'TOTALS',
      '',
      '',
      '',
      '',
      lotCalcResult.grandTotalGrossGrams.toFixed(3),
      '',
      '',
      lotCalcResult.grandTotalFineGrams.toFixed(4),
      (lotCalcResult.grandTotalFineGrams / TROY_OUNCE_TO_GRAMS).toFixed(5),
      lotCalcResult.itemCount,
      lotCalcResult.grandTotalMeltValue.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kivarotools_precious_metals_lot_${selectedCurrency}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLotSummary = () => {
    if (lotCalcResult.items.length === 0) return;
    const lines = [
      `KivaroTools Precious Metals Scrap Lot Summary`,
      `Currency: ${selectedCurrency}`,
      `Items: ${lotCalcResult.itemCount}`,
      `Total Gross Weight: ${formatDecimal(lotCalcResult.grandTotalGrossGrams, 3)} g`,
      `Total Pure Fine Metal: ${formatDecimal(lotCalcResult.grandTotalFineGrams, 3)} g`,
      `Grand Lot Melt Value: ${formatCurrencyValue(lotCalcResult.grandTotalMeltValue, selectedCurrency)}`,
      `Refiner Payout (~95%): ${formatCurrencyValue(lotCalcResult.payoutTiers.refinerHighVolume, selectedCurrency)}`,
      `Bullion Dealer (~88%): ${formatCurrencyValue(lotCalcResult.payoutTiers.dealerBullionCash, selectedCurrency)}`,
      `Pawn Shop (~75%): ${formatCurrencyValue(lotCalcResult.payoutTiers.pawnShopQuickCash, selectedCurrency)}`,
    ];
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(lines.join('\n'));
      setCopiedLotSummary(true);
      setTimeout(() => setCopiedLotSummary(false), 2000);
    }
  };

  // Dynamic Chart Points: Actual provider history (no synthetic fallback)
  const displayedChartPoints = chartPoints;

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
      setErrorMessage('Historical futures time-series is currently unavailable. No quotes to export.');
      return;
    }
    const csvContent = generateCsvExport(
      displayedChartPoints,
      selectedMetal,
      selectedCurrency,
      selectedUnit,
      chartMeta.source || 'Yahoo Finance (Indicative Futures Quotes)',
      chartMeta.instrumentName || 'Futures Indicative Settlement (Front-Month Contract)'
    );
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedMetal}_${selectedCurrency}_${chartTimeframe}_futures_quotes.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySummary = () => {
    const text = `${METALS[selectedMetal].name} Rate: ${formatCurrencyValue(activePriceConverted, selectedCurrency)} per ${UNIT_LABELS[selectedUnit].short} (${formatDeterministicTimestamp(activeMetalData.timestampMs)}). Reference: KivaroTools.`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div className="w-full max-w-full space-y-8">
      {/* =========================================================================
          HERO & MASTER RATE CONTROLS
          ========================================================================= */}
      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-4 sm:p-6 lg:p-8 rounded-3xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                PRECIOUS METALS
              </span>
              <span
                role="status"
                aria-live="polite"
                title={activeMetalData.freshnessEvaluation?.detail}
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 ${
                  activeMetalData.freshnessEvaluation?.state === 'LIVE'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : activeMetalData.freshnessEvaluation?.state === 'MARKET_CLOSED'
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300'
                    : activeMetalData.freshnessEvaluation?.state === 'DELAYED'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                    : activeMetalData.freshnessEvaluation?.state === 'MANUAL_OVERRIDE'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300'
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full bg-current ${activeMetalData.freshnessEvaluation?.state === 'LIVE' ? 'animate-pulse' : ''}`} />
                {activeMetalData.freshnessEvaluation?.badgeLabel || activeMetalData.freshness}
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
                Quote Time:{' '}
                <strong className="text-slate-700 dark:text-slate-300 font-mono">
                  {formatDeterministicTimestamp(activeMetalData.timestampMs)}
                </strong>
              </span>
            </span>
            <span>•</span>
            <span>
              Retrieved:{' '}
              <strong className="text-slate-700 dark:text-slate-300 font-mono">
                {formatDeterministicTimestamp(new Date(activeMetalData.retrievedAt).getTime())}
              </strong>
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
              <strong className="text-slate-700 dark:text-slate-300" title={activeMetalData.freshnessEvaluation?.detail}>
                {activeMetalData.freshnessEvaluation?.badgeLabel || activeMetalData.freshness}
              </strong>
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
              onClick={() => handleSelectMetal(mCode)}
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
                      {mCode} • {mData?.rateType === 'reference' ? 'Baseline Ref' : 'Intl. Spot'}
                    </span>
                  </div>
                </div>
                {isSelected ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    Active
                  </span>
                ) : mData?.rateType === 'reference' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    Baseline
                  </span>
                ) : null}
              </div>

              {/* Price Display */}
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {formatCurrencyValue(finalPrice, selectedCurrency)}
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-slate-400 dark:text-slate-500">
                  <span>per {UNIT_LABELS[selectedUnit].short} ({mData?.rateType === 'reference' ? 'Baseline' : 'Spot'})</span>
                  {mData?.rateType === 'reference' ? (
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium" title="Statutory reference benchmark (API unavailable)">
                      Reference Baseline
                    </span>
                  ) : mData?.change24hPercent && mData.change24hPercent !== 0 ? (
                    <span
                      className={`font-semibold flex items-center gap-0.5 ${
                        mData.change24hPercent > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {mData.change24hPercent > 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {mData.change24hPercent > 0
                        ? `+${mData.change24hPercent.toFixed(2)}%`
                        : `${mData.change24hPercent.toFixed(2)}%`}
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">
                      Indicative Spot
                    </span>
                  )}
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
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm flex flex-col justify-between">
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
            <div className="flex flex-wrap items-center gap-2 max-w-full">
              <div
                role="tablist"
                aria-label="Chart timeframe selection"
                className="flex overflow-x-auto max-w-full bg-gray-100 dark:bg-[#0a0f1a] p-1 rounded-2xl border border-gray-200 dark:border-slate-800"
              >
                {(['1D', '1W', '1M', '3M', '6M', '1Y'] as ChartTimeframe[]).map((tf) => (
                  <button
                    key={tf}
                    role="tab"
                    aria-selected={chartTimeframe === tf}
                    onClick={() => setChartTimeframe(tf)}
                    className={`px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
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
                  ? formatCurrencyValue(chartStats.high, selectedCurrency)
                  : '—'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Period Low</span>
              <strong className="text-slate-800 dark:text-slate-200">
                {displayedChartPoints.length >= 2
                  ? formatCurrencyValue(chartStats.low, selectedCurrency)
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
                  {formatDecimal(chartStats.percentChange, 2)}%
                </strong>
              ) : (
                <span className="text-slate-400 font-medium">Unavailable</span>
              )}
            </div>
          </div>

          {/* Recharts Container / Truthful Historical State */}
          <div className="h-64 sm:h-72 w-full flex-grow relative flex flex-col justify-center">
            {isChartLoading && (
              <div className="absolute inset-0 bg-white/60 dark:bg-[#111827]/60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-2xl">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            )}
            {displayedChartPoints.length >= 2 ? (
              <>
                <div className="flex flex-wrap items-center justify-between p-2 mb-2 bg-slate-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800/80 rounded-xl text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {chartMeta.instrumentName || METALS[selectedMetal].futuresLabel} ({chartMeta.symbol || METALS[selectedMetal].yahooSymbol})
                  </span>
                  <span>Contract: Front-Month Futures Indicative Settlement • Source: {chartMeta.source || 'Yahoo Finance Indicative Reference'}</span>
                </div>
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
                                  per {UNIT_LABELS[selectedUnit].short} (Futures Settlement)
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
                  Historical Futures Quotes Temporarily Unavailable
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-4 leading-relaxed">
                  {chartError || `Unable to fetch historical settlements for ${METALS[selectedMetal].futuresLabel} (${METALS[selectedMetal].yahooSymbol}). Cash spot valuations remain live.`}
                </p>
                <button
                  type="button"
                  onClick={() => setChartRetryCount((c) => c + 1)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Historical Query
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
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-xs">
                  {activeMetalData.low24hUsd != null && activeMetalData.high24hUsd != null ? (
                    `${formatCurrencyValue(
                      convertPriceUnit(convertCurrency(activeMetalData.low24hUsd, selectedCurrency, fxRates), selectedUnit),
                      selectedCurrency
                    )} - ${formatCurrencyValue(
                      convertPriceUnit(convertCurrency(activeMetalData.high24hUsd, selectedCurrency, fxRates), selectedUnit),
                      selectedCurrency
                    )}`
                  ) : (
                    <span className="text-slate-400 font-sans font-normal text-[11px]">
                      Not Reported by Spot Feed
                    </span>
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
            <div className="space-y-1">
              <p className="font-semibold text-blue-950 dark:text-blue-100">
                Indicative Spot Reference &amp; Cash Payout Notice:
              </p>
              <p className="leading-relaxed">
                Quoted rates represent unallocated wholesale spot bullion reference benchmarks (London OTC fix / public market data) converted at mid-market FX rates. Actual physical dealer payouts, retail coin premiums, jewelry buyback offers, assay refining deductions, and pawnbroker cash purchases will differ. Use the Dealer Spread &amp; Cash Payout Modeling tool below to calculate net proceeds based on specific dealer discount tiers and refining fees.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: ADAPTIVE COUNTRY / CURRENCY MARKET REFERENCE TABLE
          ========================================================================= */}
      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm w-full max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentCountryConfig.flag}</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {currentCountryConfig.marketLabel} Table ({selectedCurrency})
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Unallocated wholesale spot bullion rates converted at interbank exchange rates ({fxData.provider}).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Interbank FX ({fxData.baseCurrency}/{selectedCurrency}): {formatDecimal(fxRates[selectedCurrency], 2)}
            </span>
            <span className="px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
              WHOLESALE SPOT BASIS
            </span>
          </div>
        </div>

        {/* Domestic Bullion Market / Sarafa Notice */}
        {currentCountryConfig.code === 'PK' && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-bold text-amber-950 dark:text-amber-100">
                  Important: International Converted Spot vs. Pakistan Sarafa Bullion Market Rates
                </p>
                <p className="leading-relaxed">
                  The rates in this table represent pure international wholesale spot benchmarks (London OTC unallocated bullion) converted at official interbank exchange rates (USD/PKR ~{formatDecimal(fxRates.PKR, 2)}).
                  In Pakistan, domestic bullion rates published by the All Pakistan Sarafa Gems and Jewellers Association (APGJSA) trade at a physical cash premium (typically +1.0% to +2.5% higher, currently indicative circular benchmark around Rs. 432,500 per tola for 24K and Rs. 396,455 for 22K as of October 2026) due to open-market currency spreads, physical import costs, and local physical supply. Note that there is no official automated real-time electronic feed for Sarafa rates; rates are determined daily via trade association circulars and local bazaar associations. Finished retail jewelry also includes 10% to 20% jeweler crafting charges (ujrat) and stone deductions.
                </p>
              </div>
            </div>
          </div>
        )}
        {currentCountryConfig.code === 'IN' && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-bold text-amber-950 dark:text-amber-100">
                  Notice: Converted International Spot vs. India Domestic Bullion (IBJA / MCX)
                </p>
                <p className="leading-relaxed">
                  These rates reflect international spot bullion converted at interbank exchange rates and exclude Indian import duties (6% basic customs duty) and 3% Goods and Services Tax (GST). Domestic retail prices published by IBJA will reflect these statutory additions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Responsive Horizontally Scrollable Table with Fixed Row Integrity */}
        <div className="overflow-x-auto w-full max-w-full overscroll-x-contain">
          <table id="country-market-table" className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th scope="col" className="py-3 px-4 whitespace-nowrap">Metal / Denomination</th>
                <th scope="col" className="py-3 px-4 whitespace-nowrap">Weight</th>
                <th scope="col" className="py-3 px-4 whitespace-nowrap">Purity</th>
                <th scope="col" className="py-3 px-4 text-right whitespace-nowrap">Converted Spot ({selectedCurrency})</th>
                <th scope="col" className="py-3 px-4 text-right whitespace-nowrap">USD Ref</th>
                <th scope="col" className="py-3 px-4 text-center whitespace-nowrap">Pricing Basis</th>
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
          SECTION 4: INTRINSIC METAL MELT VALUE & SCRAP LOT CALCULATOR
          ========================================================================= */}
      <div className="space-y-6">
        {/* Calculator Mode Header & Tabs */}
        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm w-full max-w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Precious Metals Melt Value &amp; Scrap Calculator
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Calculate pure fine metal content, intrinsic wholesale melt values, and estimated dealer cash payouts across Gold, Silver, Platinum, and Palladium.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 sm:inline-flex p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl w-full sm:w-auto" role="tablist" aria-label="Calculator Mode">
              <button
                type="button"
                role="tab"
                aria-selected={calcMode === 'single'}
                onClick={() => setCalcMode('single')}
                className={`px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center text-center gap-1.5 cursor-pointer ${
                  calcMode === 'single'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Quick Calculator</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={calcMode === 'lot'}
                onClick={() => setCalcMode('lot')}
                className={`px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center text-center gap-1.5 cursor-pointer ${
                  calcMode === 'lot'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Scrap Lot ({lotItems.length})</span>
              </button>
            </div>
          </div>

          {/* Pricing Feed & Manual Spot Override Bar */}
          <div className="mt-4 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Spot Reference Basis:</span>
              {!isManualSpotOverride ? (
                <span
                  title={activeMetalData.freshnessEvaluation?.detail}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono font-bold border ${
                    activeMetalData.freshnessEvaluation?.state === 'LIVE'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : activeMetalData.freshnessEvaluation?.state === 'MARKET_CLOSED'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                      : activeMetalData.freshnessEvaluation?.state === 'DELAYED'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeMetalData.freshnessEvaluation?.state === 'LIVE'
                        ? 'bg-emerald-500 animate-pulse'
                        : activeMetalData.freshnessEvaluation?.state === 'MARKET_CLOSED'
                        ? 'bg-indigo-500'
                        : activeMetalData.freshnessEvaluation?.state === 'DELAYED'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  {activeMetalData.freshnessEvaluation?.badgeLabel || 'SPOT FEED'}:{' '}
                  {formatCurrencyValue(liveSpotPerTroyOzInSelectedCurrency, selectedCurrency)} / oz t
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-mono font-bold border border-purple-200 dark:border-purple-800">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  {isManualSpotOverride && Math.abs(effectiveSpotPriceInSelectedCurrency - (432500 / 0.375)) < 1
                    ? `SARAFA BENCHMARK: ${formatCurrencyValue(effectiveSpotPriceInSelectedCurrency, selectedCurrency)} / oz t (~₨ 432,500/tola ref.)`
                    : `MANUAL OVERRIDE: ${formatCurrencyValue(effectiveSpotPriceInSelectedCurrency, selectedCurrency)} / oz t`}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedCountry === 'PK' && calcMetal === 'XAU' && (
                <button
                  type="button"
                  onClick={() => {
                    const sarafaRatePerOz = (432500 / 0.375).toFixed(2);
                    setManualSpotPrice(sarafaRatePerOz);
                    setIsManualSpotOverride(true);
                  }}
                  title="Apply APGJSA circular indicative reference benchmark (~₨ 432,500/tola 24K - indicative reference, not an automated live feed)"
                  className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-200 font-semibold cursor-pointer transition-colors text-xs"
                >
                  Apply Indicative Sarafa Benchmark (~₨ 432.5k/tola)
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (!isManualSpotOverride) {
                    setManualSpotPrice(effectiveSpotPriceInSelectedCurrency.toFixed(2));
                  }
                  setIsManualSpotOverride(!isManualSpotOverride);
                }}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer transition-colors text-xs"
              >
                {isManualSpotOverride ? 'Reset to Spot Reference Feed' : 'Enter Custom Spot Override'}
              </button>

              {isManualSpotOverride && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualSpotPrice}
                    onChange={(e) => setManualSpotPrice(e.target.value)}
                    placeholder="Custom price / oz t"
                    className="w-32 px-2.5 py-1 bg-white dark:bg-[#0a0f1a] border border-amber-300 dark:border-amber-700 rounded-lg font-mono text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualSpotOverride(false);
                      setManualSpotPrice('');
                    }}
                    title="Reset to benchmark spot price"
                    className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            MODE 1: SINGLE ITEM QUICK CALCULATOR
            ========================================================================= */}
        {calcMode === 'single' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Single Item Form */}
            <div className="lg:col-span-7 bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm space-y-5 w-full max-w-full">
              {/* Presets Chips */}
              <div>
                <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  Quick Benchmark Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset({ metal: 'XAU', weight: 5, unit: 'gram', purityId: '14K' })}
                    className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    14K Ring (5g)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset({ metal: 'XAU', weight: 15, unit: 'gram', purityId: '18K' })}
                    className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    18K Chain (15g)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset({ metal: 'XAG', weight: 50, unit: 'gram', purityId: '925' })}
                    className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    Sterling Silver (50g)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset({ metal: 'XAU', weight: 1, unit: 'troy_oz', purityId: '24K' })}
                    className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    1 oz t 24K Coin
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset({ metal: 'XAU', weight: 1, unit: 'tola', purityId: '22K' })}
                    className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    1 Tola 22K Bangle
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset({ metal: 'XAU', weight: 10, unit: 'dwt', purityId: '14K' })}
                    className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    10 dwt 14K Scrap
                  </button>
                </div>
              </div>

              {/* Form Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Metal Selection */}
                <div>
                  <label htmlFor="calc-metal-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Precious Metal
                  </label>
                  <select
                    id="calc-metal-select"
                    value={calcMetal}
                    onChange={(e) => {
                      const newMetal = e.target.value as MetalCode;
                      setCalcMetal(newMetal);
                      if (newMetal === 'XAU') setCalcPurityId('14K');
                      else if (newMetal === 'XAG') setCalcPurityId('925');
                      else if (newMetal === 'XPT') setCalcPurityId('Pt950');
                      else if (newMetal === 'XPD') setCalcPurityId('Pd950');
                    }}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {(Object.keys(METALS) as MetalCode[]).map((mCode) => (
                      <option key={mCode} value={mCode}>
                        {METALS[mCode].name} ({mCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Metal Purity Selection */}
                <div>
                  <label htmlFor="calc-purity-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Purity / Fineness
                  </label>
                  <select
                    id="calc-purity-select"
                    value={calcPurityId}
                    onChange={(e) => setCalcPurityId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {(METAL_PURITIES_MAP[calcMetal] || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                    <option value="custom">Custom Fineness (% or Decimal)...</option>
                  </select>
                </div>

                {/* Custom Fineness (Conditional) */}
                {calcPurityId === 'custom' && (
                  <div className="sm:col-span-2 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
                    <label htmlFor="calc-custom-fineness" className="block text-xs font-bold text-blue-900 dark:text-blue-300 mb-1">
                      Custom Decimal Fineness or Purity %
                    </label>
                    <input
                      id="calc-custom-fineness"
                      type="number"
                      step="any"
                      min="0.001"
                      max="1000"
                      value={calcCustomFineness}
                      onChange={(e) => setCalcCustomFineness(e.target.value)}
                      placeholder="e.g. 0.9167, 91.67, or 916.7"
                      className="w-full px-3 py-2 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold"
                    />
                    <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-1">
                      Enter as decimal (e.g. 0.750), percentage (75.0%), or parts-per-thousand (750).
                    </p>
                  </div>
                )}

                {/* Weight Input */}
                <div>
                  <label htmlFor="calc-weight-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Gross Weight
                  </label>
                  <input
                    id="calc-weight-input"
                    type="number"
                    min="0.001"
                    step="any"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Math.max(0.001, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Weight Unit Selection */}
                <div>
                  <label htmlFor="calc-unit-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Weight Unit
                  </label>
                  <select
                    id="calc-unit-select"
                    value={calcUnit}
                    onChange={(e) => setCalcUnit(e.target.value as WeightUnit)}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {Object.values(UNITS).map((u) => (
                      <option key={u.key} value={u.key}>
                        {u.label} {u.isTroy ? '• (Troy standard)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity Input */}
                <div>
                  <label htmlFor="calc-quantity-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Item Quantity (Count)
                  </label>
                  <input
                    id="calc-quantity-input"
                    type="number"
                    min="1"
                    step="1"
                    value={calcQuantity}
                    onChange={(e) => setCalcQuantity(Math.max(1, Math.floor(parseFloat(e.target.value) || 1)))}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Add to Lot Action Button */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      const item: LotItemInput = {
                        id: `item-${Date.now()}`,
                        name: `${singleCalcResult.purityLabel} ${singleCalcResult.metalName}`,
                        metal: calcMetal,
                        grossWeight: calcWeight,
                        weightUnit: calcUnit,
                        purityId: calcPurityId,
                        customFineness: parseFloat(calcCustomFineness) || undefined,
                        quantity: calcQuantity,
                      };
                      setLotItems((prev) => [...prev, item]);
                      setCalcMode('lot');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Item to Scrap Lot
                  </button>
                </div>
              </div>

              {/* Optional Dealer Spread & Buy/Sell Simulator */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" /> Dealer Spread &amp; Cash Payout Modeling
                  </h4>
                  <span className="text-[11px] text-slate-400">User-Adjustable Scenarios</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label htmlFor="buy-premium-input" className="block text-slate-500 dark:text-slate-400 mb-1 text-[11px]">
                      Buy Premium (%)
                    </label>
                    <input
                      id="buy-premium-input"
                      type="number"
                      min="0"
                      step="0.5"
                      value={buyPremium}
                      onChange={(e) => setBuyPremium(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-lg text-xs font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label htmlFor="sell-discount-input" className="block text-slate-500 dark:text-slate-400 mb-1 text-[11px]">
                      Sell Discount (%)
                    </label>
                    <input
                      id="sell-discount-input"
                      type="number"
                      min="0"
                      step="0.5"
                      value={sellDiscount}
                      onChange={(e) => setSellDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-lg text-xs font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label htmlFor="dealer-fee-input" className="block text-slate-500 dark:text-slate-400 mb-1 text-[11px]">
                      Fixed Assay Fee ({selectedCurrency})
                    </label>
                    <input
                      id="dealer-fee-input"
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

            {/* Right Column: Single Item Output Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900/40 dark:to-slate-900 border border-blue-500/20 text-white p-4 sm:p-6 rounded-3xl shadow-xl flex flex-col justify-between w-full max-w-full">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-300" /> Intrinsic Melt Value
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 font-mono font-bold">
                    {selectedCurrency}
                  </span>
                </div>

                {/* Output Number */}
                <div className="mb-5">
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                    {formatCurrencyValue(singleCalcResult.totalMeltValue, selectedCurrency)}
                  </div>
                  {singleCalcResult.quantity > 1 && (
                    <p className="text-xs text-blue-200/90 mt-1">
                      {formatCurrencyValue(singleCalcResult.meltValuePerItem, selectedCurrency)} per item × {singleCalcResult.quantity} items
                    </p>
                  )}
                  <p className="text-xs text-blue-200/90 mt-1">
                    Intrinsic commodity value of pure metal at benchmark spot reference.
                  </p>
                </div>

                {/* Dealer Payout Tiers Grid */}
                <div className="mb-5 p-3 rounded-2xl bg-black/25 backdrop-blur-md border border-white/10 space-y-2 text-xs">
                  <span className="block font-bold text-blue-200 uppercase tracking-wider text-[10px]">
                    Estimated Dealer Payout Tiers:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-white/10">
                      <span className="text-blue-200 block text-[10px]">Refiner Tier (95%)</span>
                      <span className="font-mono font-bold text-white">
                        {formatCurrencyValue(singleCalcResult.payoutTiers.refinerHighVolume, selectedCurrency)}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/10">
                      <span className="text-blue-200 block text-[10px]">Jeweler Cash (88%)</span>
                      <span className="font-mono font-bold text-white">
                        {formatCurrencyValue(singleCalcResult.payoutTiers.dealerBullionCash, selectedCurrency)}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/10">
                      <span className="text-blue-200 block text-[10px]">Pawn Shop (75%)</span>
                      <span className="font-mono font-bold text-white">
                        {formatCurrencyValue(singleCalcResult.payoutTiers.pawnShopQuickCash, selectedCurrency)}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/10">
                      <span className="text-blue-200 block text-[10px]">User Modeled Sell</span>
                      <span className="font-mono font-bold text-amber-300">
                        {formatCurrencyValue(singleCalcResult.payoutTiers.userModeledSell, selectedCurrency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Technical Calculation Breakdown */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-black/20 backdrop-blur-md text-xs border border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Gross Weight:</span>
                    <span className="font-mono font-semibold">
                      {singleCalcResult.grossWeightInput} {UNITS[singleCalcResult.grossWeightUnit].short} ({formatDecimal(singleCalcResult.totalGrossWeightGrams, 3)} g)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Purity Rating:</span>
                    <span className="font-mono font-semibold">
                      {singleCalcResult.purityLabel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Fine Pure Metal:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {formatDecimal(singleCalcResult.fineWeightGrams, 4)} g ({formatDecimal(singleCalcResult.fineWeightTroyOz, 5)} oz t)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Fine Weight (dwt):</span>
                    <span className="font-mono font-semibold">
                      {formatDecimal(singleCalcResult.fineWeightDwt, 3)} dwt
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                    <span className="text-blue-200">Spot / Gram:</span>
                    <span className="font-mono font-semibold">
                      {formatCurrencyValue(singleCalcResult.spotPricePerGram, selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Spot / Troy Oz:</span>
                    <span className="font-mono font-semibold">
                      {formatCurrencyValue(singleCalcResult.spotPricePerTroyOz, selectedCurrency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `KivaroTools Melt Valuation:
Metal: ${singleCalcResult.metalName} (${singleCalcResult.metal})
Purity: ${singleCalcResult.purityLabel}
Gross Weight: ${singleCalcResult.grossWeightInput} ${singleCalcResult.grossWeightUnit} (${singleCalcResult.totalGrossWeightGrams.toFixed(3)} g)
Pure Fine Metal: ${singleCalcResult.fineWeightGrams.toFixed(4)} g (${singleCalcResult.fineWeightTroyOz.toFixed(5)} oz t)
Quantity: ${singleCalcResult.quantity}
Spot Benchmark: ${formatCurrencyValue(singleCalcResult.spotPricePerTroyOz, selectedCurrency)} / oz t
Estimated Melt Value: ${formatCurrencyValue(singleCalcResult.totalMeltValue, selectedCurrency)}
Typical Payout Range: ${formatCurrencyValue(singleCalcResult.payoutTiers.pawnShopQuickCash, selectedCurrency)} (Pawn) to ${formatCurrencyValue(singleCalcResult.payoutTiers.refinerHighVolume, selectedCurrency)} (Refiner)`;
                    navigator.clipboard.writeText(text);
                    setCopiedSummary(true);
                    setTimeout(() => setCopiedSummary(false), 2000);
                  }}
                  className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSummary ? 'Copied!' : 'Copy Summary'}
                </button>

                <div className="text-[10px] text-blue-200/80 text-right">
                  Client-side calculation • Zero data sent
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODE 2: MULTI-ITEM SCRAP LOT BUILDER
            ========================================================================= */}
        {calcMode === 'lot' && (
          <div className="space-y-6">
            {/* Scrap Lot Item Adder Card */}
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm space-y-4 w-full max-w-full">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" /> Add Item to Scrap Lot
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                <div className="lg:col-span-2">
                  <label htmlFor="lot-item-name" className="block text-[11px] font-bold text-slate-500 mb-1">
                    Item Description
                  </label>
                  <input
                    id="lot-item-name"
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. 14K Herringbone Chain"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="lot-item-metal" className="block text-[11px] font-bold text-slate-500 mb-1">
                    Metal
                  </label>
                  <select
                    id="lot-item-metal"
                    value={newItemMetal}
                    onChange={(e) => {
                      const m = e.target.value as MetalCode;
                      setNewItemMetal(m);
                      if (m === 'XAU') setNewItemPurityId('14K');
                      else if (m === 'XAG') setNewItemPurityId('925');
                      else if (m === 'XPT') setNewItemPurityId('Pt950');
                      else if (m === 'XPD') setNewItemPurityId('Pd950');
                    }}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    {(Object.keys(METALS) as MetalCode[]).map((mCode) => (
                      <option key={mCode} value={mCode}>
                        {METALS[mCode].name} ({mCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="lot-item-purity" className="block text-[11px] font-bold text-slate-500 mb-1">
                    Purity
                  </label>
                  <select
                    id="lot-item-purity"
                    value={newItemPurityId}
                    onChange={(e) => setNewItemPurityId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    {(METAL_PURITIES_MAP[newItemMetal] || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.shortLabel}
                      </option>
                    ))}
                    <option value="custom">Custom...</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="lot-item-weight" className="block text-[11px] font-bold text-slate-500 mb-1">
                    Weight
                  </label>
                  <input
                    id="lot-item-weight"
                    type="number"
                    step="any"
                    min="0.001"
                    value={newItemWeight}
                    onChange={(e) => setNewItemWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>

                <div>
                  <label htmlFor="lot-item-unit" className="block text-[11px] font-bold text-slate-500 mb-1">
                    Unit
                  </label>
                  <select
                    id="lot-item-unit"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value as WeightUnit)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    {Object.values(UNITS).map((u) => (
                      <option key={u.key} value={u.key}>
                        {u.short}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleAddItemToLot}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Item to Lot
                </button>
              </div>
            </div>

            {/* Scrap Lot Items Table & Grand Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Lot Items List */}
              <div className="lg:col-span-8 bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm space-y-4 w-full max-w-full">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Scrap Lot Manifest ({lotItems.length} items)
                  </h4>
                  {lotItems.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExportLotCsv}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyLotSummary}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedLotSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedLotSummary ? 'Copied!' : 'Copy Summary'}
                      </button>
                      <button
                        type="button"
                        onClick={handleClearLot}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear All
                      </button>
                    </div>
                  )}
                </div>

                {lotCalcResult.items.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Scale className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold">Your scrap lot is empty.</p>
                    <p className="text-xs text-slate-500 mt-1">Add items above to calculate aggregated scrap melt value.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto overscroll-x-contain">
                    <table className="min-w-[580px] w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                          <th className="py-2.5 px-3">Item</th>
                          <th className="py-2.5 px-3">Metal</th>
                          <th className="py-2.5 px-3">Gross Wt</th>
                          <th className="py-2.5 px-3">Purity</th>
                          <th className="py-2.5 px-3">Fine (g)</th>
                          <th className="py-2.5 px-3 text-right">Melt ({selectedCurrency})</th>
                          <th className="py-2.5 px-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                        {lotCalcResult.items.map((it) => (
                          <tr key={it.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                              {it.name}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {it.metal}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono">
                              {it.grossWeightInput} {UNITS[it.grossWeightUnit].short}
                            </td>
                            <td className="py-3 px-3">
                              {it.purityLabel}
                            </td>
                            <td className="py-3 px-3 font-mono font-semibold text-amber-600 dark:text-amber-400">
                              {formatDecimal(it.fineWeightGrams, 3)} g
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                              {formatCurrencyValue(it.totalMeltValue, selectedCurrency)}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItemFromLot(it.id)}
                                title="Remove item"
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Right Column: Lot Grand Summary */}
              <div className="lg:col-span-4 bg-gradient-to-br from-indigo-700 to-blue-800 dark:from-indigo-950/60 dark:to-slate-900 border border-indigo-500/20 text-white p-4 sm:p-6 rounded-3xl shadow-xl flex flex-col justify-between w-full max-w-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-300" /> Grand Lot Melt Value
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 font-mono font-bold">
                      {selectedCurrency}
                    </span>
                  </div>

                  {/* Grand Output */}
                  <div className="mb-5">
                    <div className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                      {formatCurrencyValue(lotCalcResult.grandTotalMeltValue, selectedCurrency)}
                    </div>
                    <p className="text-xs text-indigo-200/90 mt-1">
                      Aggregated intrinsic metal content across {lotCalcResult.itemCount} lot items.
                    </p>
                  </div>

                  {/* Payout Estimates */}
                  <div className="mb-5 p-3 rounded-2xl bg-black/25 backdrop-blur-md border border-white/10 space-y-2 text-xs">
                    <span className="block font-bold text-indigo-200 uppercase tracking-wider text-[10px]">
                      Aggregated Cash Payout Tiers:
                    </span>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-indigo-200">Refiner Payout (~95%):</span>
                        <span className="font-mono font-bold text-white">
                          {formatCurrencyValue(lotCalcResult.payoutTiers.refinerHighVolume, selectedCurrency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-indigo-200">Bullion Dealer (~88%):</span>
                        <span className="font-mono font-bold text-white">
                          {formatCurrencyValue(lotCalcResult.payoutTiers.dealerBullionCash, selectedCurrency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-indigo-200">Pawn Shop (~75%):</span>
                        <span className="font-mono font-bold text-white">
                          {formatCurrencyValue(lotCalcResult.payoutTiers.pawnShopQuickCash, selectedCurrency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metal Breakdown Subtotals */}
                  <div className="space-y-2 p-3.5 rounded-2xl bg-black/20 backdrop-blur-md text-xs border border-white/10">
                    <span className="block font-bold text-indigo-200 uppercase tracking-wider text-[10px] mb-1">
                      Pure Metal Weights:
                    </span>
                    {Object.values(lotCalcResult.metalSummaries).map((sum) => (
                      sum.itemCount > 0 && (
                        <div key={sum.metal} className="flex justify-between items-center">
                          <span className="text-indigo-200">{METALS[sum.metal].name}:</span>
                          <span className="font-mono font-semibold">
                            {formatDecimal(sum.totalFineGrams, 3)} g ({formatCurrencyValue(sum.totalMeltValue, selectedCurrency)})
                          </span>
                        </div>
                      )
                    ))}
                    <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                      <span className="text-indigo-200">Total Gross Weight:</span>
                      <span className="font-mono font-semibold">
                        {formatDecimal(lotCalcResult.grandTotalGrossGrams, 3)} g
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-200">Total Pure Fine Metal:</span>
                      <span className="font-mono font-bold text-amber-300">
                        {formatDecimal(lotCalcResult.grandTotalFineGrams, 3)} g
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 text-[10px] text-indigo-200/80">
                  Calculated locally in browser • No personal data sent to servers.
                </div>
              </div>
            </div>
          </div>
        )}
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
          <strong>Market-Data Provenance &amp; Instrument Clarification:</strong> Spot rates (XAU, XAG, XPT, XPD) reflect unallocated institutional bullion benchmarks sourced from public financial feeds (Gold API). Historical price charts represent front-month exchange futures contracts (COMEX/NYMEX via Yahoo Finance) and reflect cost-of-carry contango/backwardation spreads. Futures quotes must not be conflated with physical cash settlement.
        </p>
        <p className="leading-relaxed">
          <strong>Dealer Cash Payout Disclosure:</strong> Bullion spot benchmarks do not guarantee retail dealer redemption payouts. Physical transactions are subject to dealer bid-ask margins, assay verification tests, melted slag deductions, minting premiums, and local sales tax/VAT. Actual payouts will differ from pure wholesale melt value.
        </p>
        <p className="leading-relaxed">
          <strong>Local Bullion Market vs. Converted Spot Notice (Pakistan Sarafa, India MCX, UAE):</strong> Converted rates represent pure international spot prices multiplied by interbank foreign exchange rates. In domestic physical markets such as Pakistan (Karachi/Lahore Sarafa under APGJSA), physical bullion trades at a domestic cash premium (typically +1.0% to +2.5% higher, currently indicative circular benchmark around Rs. 432,500 per tola for 24K and Rs. 396,455 for 22K) due to physical delivery logistics, open-market foreign exchange spreads, and local demand. No official automated real-time electronic feed exists for local Pakistan Sarafa rates; rates are determined daily via trade association circulars and jeweler quotes will vary. In India, domestic market rates on MCX/IBJA include 6% customs duty and 3% GST. These rates must not be confused with physical jeweler retail prices, which also include craftsmanship and making charges (ujrat).
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
