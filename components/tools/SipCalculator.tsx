'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Calculator,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileText,
  Info,
  RotateCcw,
  Share2,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

/* =====================================================================
   1. TYPES & DATA STRUCTURES
   ===================================================================== */

export type Mode = 'sip' | 'lumpsum';
export type Frequency = 'monthly' | 'quarterly' | 'yearly';
export type RateBasis = 'nominal' | 'effective';
export type ContributionTiming = 'beginning' | 'end';

export type CurrencyCode =
  | 'AED' | 'AFN' | 'ALL' | 'AMD' | 'AOA' | 'ARS' | 'AUD' | 'AWG' | 'AZN' | 'BAM' | 'BBD' | 'BDT' | 'BHD'
  | 'BIF' | 'BMD' | 'BND' | 'BOB' | 'BRL' | 'BSD' | 'BTN' | 'BWP' | 'BYN' | 'BZD' | 'CAD' | 'CDF' | 'CHF'
  | 'CLP' | 'CNY' | 'COP' | 'CRC' | 'CUP' | 'CVE' | 'CZK' | 'DJF' | 'DKK' | 'DOP' | 'DZD' | 'EGP' | 'ERN'
  | 'ETB' | 'EUR' | 'FJD' | 'FKP' | 'GBP' | 'GEL' | 'GHS' | 'GIP' | 'GMD' | 'GNF' | 'GTQ' | 'GYD' | 'HKD'
  | 'HNL' | 'HTG' | 'HUF' | 'IDR' | 'ILS' | 'INR' | 'IQD' | 'IRR' | 'ISK' | 'JMD' | 'JOD' | 'JPY' | 'KES'
  | 'KGS' | 'KHR' | 'KMF' | 'KPW' | 'KRW' | 'KWD' | 'KYD' | 'KZT' | 'LAK' | 'LBP' | 'LKR' | 'LRD' | 'LSL'
  | 'LYD' | 'MAD' | 'MDL' | 'MGA' | 'MKD' | 'MMK' | 'MNT' | 'MOP' | 'MRU' | 'MUR' | 'MVR' | 'MWK' | 'MXN'
  | 'MYR' | 'MZN' | 'NAD' | 'NGN' | 'NIO' | 'NOK' | 'NPR' | 'NZD' | 'OMR' | 'PAB' | 'PEN' | 'PGK' | 'PHP'
  | 'PKR' | 'PLN' | 'PYG' | 'QAR' | 'RON' | 'RSD' | 'RUB' | 'RWF' | 'SAR' | 'SBD' | 'SCR' | 'SDG' | 'SEK'
  | 'SGD' | 'SHP' | 'SLE' | 'SOS' | 'SRD' | 'SSP' | 'STN' | 'SVC' | 'SYP' | 'SZL' | 'THB' | 'TJS' | 'TMT'
  | 'TND' | 'TOP' | 'TRY' | 'TTD' | 'TWD' | 'TZS' | 'UAH' | 'UGX' | 'USD' | 'UYU' | 'UZS' | 'VES' | 'VND'
  | 'VUV' | 'WST' | 'XAF' | 'XCD' | 'XCG' | 'XOF' | 'XPF' | 'YER' | 'ZAR' | 'ZMW' | 'ZWG';

export interface CurrencyOption {
  code: CurrencyCode;
  name: string;
  symbol: string;
  fractionDigits: number;
}

export interface ScheduleRow {
  year: number;
  startingBalance: number;
  contributions: number;
  grossGrowth: number;
  contributionFees: number;
  managementFees: number;
  taxes: number;
  endingBalance: number;
  netGain: number;
  inflationAdjustedValue: number;
}

export interface InvestmentProjectionResult {
  initialInvestment: number;
  recurringContribution: number;
  totalInvested: number;
  grossGrowth: number;
  totalContributionFees: number;
  totalManagementFees: number;
  totalFees: number;
  totalTaxes: number;
  futureValue: number;
  netGain: number;
  realValue: number;
  returnPercent: number;
  investedPercent: number;
  returnsPercent: number;
  endingAnnualContribution: number;
  multiple: number;
  totalPeriods: number;
  schedule: ScheduleRow[];
  overflow: boolean;
}

export interface MonteCarloResult {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  min: number;
  max: number;
  mean: number;
  probabilityTarget: number | null;
  simulations: number;
  deterministicValue: number;
}

export interface GoalPlanResult {
  target: number;
  requiredContribution: number;
  projectedValue: number;
  reachable: boolean;
  frequencyLabel: string;
}

/* =====================================================================
   2. CURRENCIES DATABASE (ISO-4217 COMPLIANT)
   ===================================================================== */

export const ISO_ACTIVE_CURRENCIES: CurrencyCode[] = [
  'AED','AFN','ALL','AMD','AOA','ARS','AUD','AWG','AZN','BAM','BBD','BDT','BHD','BIF','BMD','BND','BOB','BRL','BSD','BTN','BWP','BYN','BZD',
  'CAD','CDF','CHF','CLP','CNY','COP','CRC','CUP','CVE','CZK','DJF','DKK','DOP','DZD','EGP','ERN','ETB','EUR','FJD','FKP','GBP','GEL','GHS','GIP','GMD',
  'GNF','GTQ','GYD','HKD','HNL','HTG','HUF','IDR','ILS','INR','IQD','IRR','ISK','JMD','JOD','JPY','KES','KGS','KHR','KMF','KPW','KRW','KWD','KYD','KZT',
  'LAK','LBP','LKR','LRD','LSL','LYD','MAD','MDL','MGA','MKD','MMK','MNT','MOP','MRU','MUR','MVR','MWK','MXN','MYR','MZN','NAD','NGN','NIO','NOK','NPR','NZD',
  'OMR','PAB','PEN','PGK','PHP','PKR','PLN','PYG','QAR','RON','RSD','RUB','RWF','SAR','SBD','SCR','SDG','SEK','SGD','SHP','SLE','SOS','SRD','SSP','STN',
  'SVC','SYP','SZL','THB','TJS','TMT','TND','TOP','TRY','TTD','TWD','TZS','UAH','UGX','USD','UYU','UZS','VES','VND','VUV','WST','XAF','XCD','XCG','XOF','XPF',
  'YER','ZAR','ZMW','ZWG',
];

export const CURRENCY_NAMES: Record<CurrencyCode, string> = {
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

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  AED: 'د.إ', AFN: '؋', ALL: 'L', AMD: '֏', AOA: 'Kz', ARS: '$', AUD: 'A$', AWG: 'ƒ', AZN: '₼', BAM: 'KM',
  BBD: 'Bds$', BDT: '৳', BHD: '.د.ب', BIF: 'FBu', BMD: '$', BND: 'B$', BOB: 'Bs', BRL: 'R$', BSD: 'B$', BTN: 'Nu.',
  BWP: 'P', BYN: 'Br', BZD: 'BZ$', CAD: 'C$', CDF: 'FC', CHF: 'CHF', CLP: '$', CNY: '¥', COP: '$', CRC: '₡', CUP: '$',
  CVE: '$', CZK: 'Kč', DJF: 'Fdj', DKK: 'kr', DOP: 'RD$', DZD: 'دج', EGP: 'E£', ERN: 'Nfk', ETB: 'Br', EUR: '€',
  FJD: 'FJ$', FKP: '£', GBP: '£', GEL: '₾', GHS: 'GH₵', GIP: '£', GMD: 'D', GNF: 'FG', GTQ: 'Q', GYD: 'G$',
  HKD: 'HK$', HNL: 'L', HTG: 'G', HUF: 'Ft', IDR: 'Rp', ILS: '₪', INR: '₹', IQD: 'ع.د', IRR: '﷼', ISK: 'kr',
  JMD: 'J$', JOD: 'د.ا', JPY: '¥', KES: 'KSh', KGS: 'с', KHR: '៛', KMF: 'CF', KPW: '₩', KRW: '₩', KWD: 'د.ك',
  KYD: 'CI$', KZT: '₸', LAK: '₭', LBP: 'ل.ل', LKR: 'Rs', LRD: 'L$', LSL: 'L', LYD: 'ل.د', MAD: 'د.م.', MDL: 'L',
  MGA: 'Ar', MKD: 'ден', MMK: 'K', MNT: '₮', MOP: 'MOP$', MRU: 'UM', MUR: '₨', MVR: 'Rf', MWK: 'MK', MXN: 'Mex$',
  MYR: 'RM', MZN: 'MT', NAD: 'N$', NGN: '₦', NIO: 'C$', NOK: 'kr', NPR: '₨', NZD: 'NZ$', OMR: 'ر.ع.', PAB: 'B/.',
  PEN: 'S/', PGK: 'K', PHP: '₱', PKR: '₨', PLN: 'zł', PYG: '₲', QAR: 'ر.ق', RON: 'lei', RSD: 'дин', RUB: '₽',
  RWF: 'FRw', SAR: '﷼', SBD: 'SI$', SCR: '₨', SDG: 'ج.س.', SEK: 'kr', SGD: 'S$', SHP: '£', SLE: 'Le', SOS: 'S',
  SRD: '$', SSP: '£', STN: 'Db', SVC: '$', SYP: '£', SZL: 'E', THB: '฿', TJS: 'SM', TMT: 'm', TND: 'د.ت',
  TOP: 'T$', TRY: '₺', TTD: 'TT$', TWD: 'NT$', TZS: 'TSh', UAH: '₴', UGX: 'USh', USD: '$', UYU: '$U', UZS: 'soʻm',
  VES: 'Bs.S', VND: '₫', VUV: 'VT', WST: 'WS$', XAF: 'FCFA', XCD: 'EC$', XCG: 'Cg.', XOF: 'CFA', XPF: '₣',
  YER: '﷼', ZAR: 'R', ZMW: 'ZK', ZWG: 'ZWG',
};

export const CURRENCY_DECIMALS: Record<CurrencyCode, number> = {
  BHD: 3, JOD: 3, KWD: 3, OMR: 3, TND: 3,
  BIF: 0, CLP: 0, DJF: 0, GNF: 0, ISK: 0, JPY: 0, KMF: 0, KRW: 0, PYG: 0, RWF: 0, UGX: 0, VND: 0, VUV: 0, XAF: 0, XOF: 0, XPF: 0,
  // Standard 2 decimal places for all other ISO active currencies
  AED: 2, AFN: 2, ALL: 2, AMD: 2, AOA: 2, ARS: 2, AUD: 2, AWG: 2, AZN: 2, BAM: 2, BBD: 2, BDT: 2, BMD: 2, BND: 2, BOB: 2, BRL: 2, BSD: 2, BTN: 2, BWP: 2, BYN: 2, BZD: 2,
  CAD: 2, CDF: 2, CHF: 2, CNY: 2, COP: 2, CRC: 2, CUP: 2, CVE: 2, CZK: 2, DKK: 2, DOP: 2, DZD: 2, EGP: 2, ERN: 2, ETB: 2, EUR: 2, FJD: 2, FKP: 2, GBP: 2, GEL: 2, GHS: 2, GIP: 2, GMD: 2,
  GTQ: 2, GYD: 2, HKD: 2, HNL: 2, HTG: 2, HUF: 2, IDR: 2, ILS: 2, INR: 2, IQD: 2, IRR: 2, JMD: 2, KES: 2, KGS: 2, KHR: 2, KPW: 2, KYD: 2, KZT: 2, LAK: 2, LBP: 2, LKR: 2, LRD: 2, LSL: 2,
  LYD: 2, MAD: 2, MDL: 2, MGA: 2, MKD: 2, MMK: 2, MNT: 2, MOP: 2, MRU: 2, MUR: 2, MVR: 2, MWK: 2, MXN: 2, MYR: 2, MZN: 2, NAD: 2, NGN: 2, NIO: 2, NOK: 2, NPR: 2, NZD: 2, PAB: 2,
  PEN: 2, PGK: 2, PHP: 2, PKR: 2, PLN: 2, QAR: 2, RON: 2, RSD: 2, RUB: 2, SAR: 2, SBD: 2, SCR: 2, SDG: 2, SEK: 2, SGD: 2, SHP: 2, SLE: 2, SOS: 2, SRD: 2, SSP: 2, STN: 2, SVC: 2,
  SYP: 2, SZL: 2, THB: 2, TJS: 2, TMT: 2, TOP: 2, TRY: 2, TTD: 2, TWD: 2, TZS: 2, UAH: 2, USD: 2, UYU: 2, UZS: 2, VES: 2, WST: 2, XCD: 2, XCG: 2, YER: 2, ZAR: 2, ZMW: 2, ZWG: 2,
};

export function getCurrencyMeta(code: CurrencyCode): CurrencyOption {
  const fractionDigits = CURRENCY_DECIMALS[code] ?? 2;
  return { code, name: CURRENCY_NAMES[code] ?? code, symbol: CURRENCY_SYMBOLS[code] || code, fractionDigits };
}

export const WORLD_CURRENCIES: CurrencyOption[] = ISO_ACTIVE_CURRENCIES.map(getCurrencyMeta).sort((a, b) => a.name.localeCompare(b.name));
export const DEFAULT_CURRENCY = WORLD_CURRENCIES.find((c) => c.code === 'USD') || WORLD_CURRENCIES[0];

/* =====================================================================
   3. MATHEMATICAL & FORMATTING UTILITIES
   ===================================================================== */

export function safeNumber(value: number | string, fallback = 0): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }
  const clean = String(value).trim().replace(/,/g, '');
  if (!clean) return fallback;
  const n = Number(clean);
  return Number.isFinite(n) ? n : fallback;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function formatCurrency(value: number, currencyCode: CurrencyCode = 'USD'): string {
  if (!Number.isFinite(value)) return `${currencyCode} 0`;
  const meta = getCurrencyMeta(currencyCode);
  const normalized = Math.abs(value) < 1e-9 ? 0 : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: meta.code,
    minimumFractionDigits: meta.fractionDigits,
    maximumFractionDigits: meta.fractionDigits,
  }).format(normalized);
}

export function formatPercent(value: number, decimals = 2): string {
  const normalized = Math.abs(value) < 1e-9 ? 0 : value;
  return `${normalized.toFixed(decimals)}%`;
}

export function sanitizeCsvCell(value: string | number): string {
  let str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return str;
}

export function csvCell(value: string | number): string {
  const sanitized = sanitizeCsvCell(value);
  return `"${sanitized.replace(/"/g, '""')}"`;
}

/* =====================================================================
   4. CANONICAL FINANCIAL CALCULATION ENGINE
   ===================================================================== */

export function projectInvestment({
  mode,
  initialInvestment = 0,
  recurringContribution = 0,
  annualRate,
  years,
  frequency = 'monthly',
  stepUp = 0,
  rateBasis = 'nominal',
  contributionTiming = 'beginning',
  annualFeeRate = 0,
  contributionFeeRate = 0,
  taxRateOnGains = 0,
  inflationRate = 0,
}: {
  mode: Mode;
  initialInvestment?: number;
  recurringContribution?: number;
  annualRate: number;
  years: number;
  frequency?: Frequency;
  stepUp?: number;
  rateBasis?: RateBasis;
  contributionTiming?: ContributionTiming;
  annualFeeRate?: number;
  contributionFeeRate?: number;
  taxRateOnGains?: number;
  inflationRate?: number;
}): InvestmentProjectionResult {
  const T = Math.max(1, Math.min(100, Math.floor(years)));
  const periodsPerYear = frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1;
  const totalPeriods = T * periodsPerYear;

  const annualRateDecimal = annualRate / 100;
  const periodicRate = rateBasis === 'effective'
    ? Math.pow(Math.max(0.0001, 1 + annualRateDecimal), 1 / periodsPerYear) - 1
    : annualRateDecimal / periodsPerYear;

  const annualFeeDecimal = Math.max(0, annualFeeRate / 100);
  const periodicFeeRate = annualFeeDecimal >= 1
    ? 1
    : 1 - Math.pow(Math.max(0, 1 - annualFeeDecimal), 1 / periodsPerYear);

  const contributionFeeDecimal = Math.max(0, contributionFeeRate / 100);
  const taxRateDecimal = Math.max(0, taxRateOnGains / 100);

  let balance = 0;
  let totalInvested = 0;
  let totalContributionFees = 0;
  let totalManagementFees = 0;
  let totalGrossGrowth = 0;

  const schedule: ScheduleRow[] = [];

  // Initial lump sum capital entry
  const grossInitial = Math.max(0, initialInvestment);
  const initialEntryFee = grossInitial * contributionFeeDecimal;
  const netInitial = grossInitial - initialEntryFee;

  const baseRecurring = mode === 'lumpsum' ? 0 : Math.max(0, recurringContribution);
  const annualStepUpDecimal = Math.max(0, stepUp / 100);

  for (let year = 1; year <= T; year++) {
    const yearStartBalance = balance;
    let yearContributions = 0;
    let yearContribFees = 0;
    let yearGrossGrowth = 0;
    let yearMgmtFees = 0;

    if (year === 1 && grossInitial > 0) {
      totalInvested += grossInitial;
      totalContributionFees += initialEntryFee;
      yearContributions += grossInitial;
      yearContribFees += initialEntryFee;
      balance += netInitial;
    }

    // Escalated contribution for this year (zero cumulative floating-point drift)
    const currentYearContribution = stepUp > 0
      ? Math.round(baseRecurring * Math.pow(1 + annualStepUpDecimal, year - 1) * 100) / 100
      : baseRecurring;

    for (let p = 1; p <= periodsPerYear; p++) {

      const grossContrib = currentYearContribution;
      const entryFee = grossContrib * contributionFeeDecimal;
      const netContrib = grossContrib - entryFee;

      if (grossContrib > 0) {
        totalInvested += grossContrib;
        totalContributionFees += entryFee;
        yearContributions += grossContrib;
        yearContribFees += entryFee;
      }

      // Timing: Beginning of period
      if (contributionTiming === 'beginning') {
        balance += netContrib;
      }

      // Investment Growth
      const growth = balance * periodicRate;
      balance += growth;
      yearGrossGrowth += growth;
      totalGrossGrowth += growth;

      // Management Fee Deduction
      const mgmtFee = Math.max(0, balance) * periodicFeeRate;
      balance -= mgmtFee;
      yearMgmtFees += mgmtFee;
      totalManagementFees += mgmtFee;

      // Timing: End of period
      if (contributionTiming === 'end') {
        balance += netContrib;
      }
    }

    // Capital Gains Tax at Final Liquidation Horizon
    let yearTax = 0;
    if (year === T) {
      const netPrincipal = totalInvested - totalContributionFees;
      const taxableGain = Math.max(0, balance - netPrincipal);
      yearTax = taxableGain * taxRateDecimal;
      balance -= yearTax;
    }

    const netGain = balance - totalInvested;
    const inflationAdjustedValue = balance / Math.pow(1 + inflationRate / 100, year);

    schedule.push({
      year,
      startingBalance: yearStartBalance,
      contributions: yearContributions,
      grossGrowth: yearGrossGrowth,
      contributionFees: yearContribFees,
      managementFees: yearMgmtFees,
      taxes: yearTax,
      endingBalance: balance,
      netGain,
      inflationAdjustedValue,
    });
  }

  const futureValue = balance;
  const totalTaxes = schedule.reduce((sum, r) => sum + r.taxes, 0);
  const totalFees = totalContributionFees + totalManagementFees;
  const netGain = futureValue - totalInvested;
  const realValue = futureValue / Math.pow(1 + inflationRate / 100, T);
  const returnPercent = totalInvested > 0 ? (netGain / totalInvested) * 100 : 0;
  const investedPercent = futureValue > 0 ? clamp((totalInvested / futureValue) * 100, 0, 100) : 0;
  const returnsPercent = futureValue > 0 ? clamp((netGain / futureValue) * 100, 0, 100) : 0;
  const multiple = totalInvested > 0 ? futureValue / totalInvested : 0;
  const endingAnnualContribution = mode === 'sip'
    ? (stepUp > 0
        ? (Math.round(baseRecurring * Math.pow(1 + annualStepUpDecimal, Math.max(0, T - 1)) * 100) / 100)
        : baseRecurring) * periodsPerYear
    : grossInitial;

  const overflow = !Number.isFinite(futureValue) || !Number.isFinite(totalInvested) || futureValue > 1e18;

  return {
    initialInvestment: grossInitial,
    recurringContribution: baseRecurring,
    totalInvested,
    grossGrowth: totalGrossGrowth,
    totalContributionFees,
    totalManagementFees,
    totalFees,
    totalTaxes,
    futureValue,
    netGain,
    realValue,
    returnPercent,
    investedPercent,
    returnsPercent,
    endingAnnualContribution,
    multiple,
    totalPeriods,
    schedule,
    overflow,
  };
}

/* =====================================================================
   5. GOAL PLANNER NUMERICAL SOLVER (BISECTION)
   ===================================================================== */

export function solveGoalContribution({
  target,
  mode,
  initialInvestment = 0,
  annualRate,
  years,
  frequency = 'monthly',
  stepUp = 0,
  rateBasis = 'nominal',
  contributionTiming = 'beginning',
  annualFeeRate = 0,
  contributionFeeRate = 0,
  taxRateOnGains = 0,
  inflationRate = 0,
}: {
  target: number;
  mode: Mode;
  initialInvestment?: number;
  annualRate: number;
  years: number;
  frequency?: Frequency;
  stepUp?: number;
  rateBasis?: RateBasis;
  contributionTiming?: ContributionTiming;
  annualFeeRate?: number;
  contributionFeeRate?: number;
  taxRateOnGains?: number;
  inflationRate?: number;
}): GoalPlanResult {
  const targetAmount = Math.max(1, target);
  const frequencyLabel = mode === 'lumpsum' ? 'one-time' : frequency === 'monthly' ? 'monthly' : frequency === 'quarterly' ? 'quarterly' : 'yearly';

  const projectWithCandidate = (candidateContribution: number) => {
    return projectInvestment({
      mode,
      initialInvestment: mode === 'lumpsum' ? candidateContribution : initialInvestment,
      recurringContribution: mode === 'lumpsum' ? 0 : candidateContribution,
      annualRate,
      years,
      frequency,
      stepUp,
      rateBasis,
      contributionTiming,
      annualFeeRate,
      contributionFeeRate,
      taxRateOnGains,
      inflationRate,
    });
  };

  // Check if target is already met with zero recurring contribution
  const zeroContribResult = projectWithCandidate(0);
  if (zeroContribResult.futureValue >= targetAmount) {
    return {
      target: targetAmount,
      requiredContribution: 0,
      projectedValue: zeroContribResult.futureValue,
      reachable: true,
      frequencyLabel,
    };
  }

  // Upper bound bracket search
  let low = 0;
  let high = targetAmount;
  let maxSearchIterations = 60;
  while (projectWithCandidate(high).futureValue < targetAmount && high < 1e15 && maxSearchIterations > 0) {
    high *= 2;
    maxSearchIterations--;
  }

  if (projectWithCandidate(high).futureValue < targetAmount) {
    return {
      target: targetAmount,
      requiredContribution: 0,
      projectedValue: 0,
      reachable: false,
      frequencyLabel,
    };
  }

  // Bisection loop
  for (let iter = 0; iter < 80; iter++) {
    const mid = (low + high) / 2;
    const test = projectWithCandidate(mid);
    if (test.futureValue >= targetAmount) {
      high = mid;
    } else {
      low = mid;
    }
  }

  const requiredContribution = high;
  const verifiedResult = projectWithCandidate(requiredContribution);

  return {
    target: targetAmount,
    requiredContribution,
    projectedValue: verifiedResult.futureValue,
    reachable: verifiedResult.futureValue >= targetAmount - 0.05,
    frequencyLabel,
  };
}

/* =====================================================================
   6. MONTE CARLO STOCHASTIC SIMULATION (SEEDED PRNG)
   ===================================================================== */

export function seededRandom(seed: number): () => number {
  let state = (Math.abs(Math.floor(seed)) || 1) >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function normalRandom(random: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = random();
  while (v === 0) v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function runMonteCarloSimulations({
  mode,
  initialInvestment = 0,
  recurringContribution = 0,
  annualRate,
  years,
  frequency = 'monthly',
  stepUp = 0,
  rateBasis = 'nominal',
  contributionTiming = 'beginning',
  annualFeeRate = 0,
  contributionFeeRate = 0,
  taxRateOnGains = 0,
  volatility,
  simulations = 3000,
  targetAmount = null,
}: {
  mode: Mode;
  initialInvestment?: number;
  recurringContribution?: number;
  annualRate: number;
  years: number;
  frequency?: Frequency;
  stepUp?: number;
  rateBasis?: RateBasis;
  contributionTiming?: ContributionTiming;
  annualFeeRate?: number;
  contributionFeeRate?: number;
  taxRateOnGains?: number;
  volatility: number;
  simulations?: number;
  targetAmount?: number | null;
}): MonteCarloResult {
  const T = Math.max(1, Math.min(100, Math.floor(years)));
  const volPercent = Math.max(0, Math.min(100, volatility)) / 100;
  const totalSims = Math.max(100, Math.min(5000, simulations));

  const deterministic = projectInvestment({
    mode,
    initialInvestment,
    recurringContribution,
    annualRate,
    years: T,
    frequency,
    stepUp,
    rateBasis,
    contributionTiming,
    annualFeeRate,
    contributionFeeRate,
    taxRateOnGains,
  });

  if (volPercent === 0) {
    const prob = targetAmount !== null ? (deterministic.futureValue >= targetAmount ? 100 : 0) : null;
    return {
      p10: deterministic.futureValue,
      p25: deterministic.futureValue,
      p50: deterministic.futureValue,
      p75: deterministic.futureValue,
      p90: deterministic.futureValue,
      min: deterministic.futureValue,
      max: deterministic.futureValue,
      mean: deterministic.futureValue,
      probabilityTarget: prob,
      simulations: totalSims,
      deterministicValue: deterministic.futureValue,
    };
  }

  const seed = Math.round(
    recurringContribution * 13 +
    initialInvestment * 17 +
    annualRate * 101 +
    T * 1009 +
    volPercent * 10007 +
    totalSims
  );
  const random = seededRandom(seed);

  const periodsPerYear = mode === 'lumpsum' ? 1 : frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1;
  const annualFeeDecimal = Math.max(0, annualFeeRate / 100);
  const periodicFeeRate = annualFeeDecimal >= 1 ? 1 : 1 - Math.pow(Math.max(0, 1 - annualFeeDecimal), 1 / periodsPerYear);
  const contributionFeeDecimal = Math.max(0, contributionFeeRate / 100);
  const taxRateDecimal = Math.max(0, taxRateOnGains / 100);
  const stepUpDecimal = Math.max(0, stepUp / 100);

  const baseAnnualFactor = rateBasis === 'effective'
    ? Math.max(0.0001, 1 + annualRate / 100)
    : Math.pow(Math.max(0, 1 + (annualRate / 100) / periodsPerYear), periodsPerYear);

  const meanLog = Math.log(baseAnnualFactor) - 0.5 * Math.pow(volPercent, 2);

  const finalBalances = new Float64Array(totalSims);
  let totalSum = 0;

  for (let s = 0; s < totalSims; s++) {
    let balance = 0;
    let totalInvested = 0;
    let totalContributionFees = 0;

    const grossInitial = Math.max(0, initialInvestment);
    if (grossInitial > 0) {
      const fee = grossInitial * contributionFeeDecimal;
      totalInvested += grossInitial;
      totalContributionFees += fee;
      balance += (grossInitial - fee);
    }

    let recurringP = mode === 'lumpsum' ? 0 : Math.max(0, recurringContribution);

    for (let y = 1; y <= T; y++) {
      const shock = normalRandom(random);
      const yearAnnualGrowth = Math.exp(meanLog + volPercent * shock);
      const yearPeriodicRate = Math.pow(yearAnnualGrowth, 1 / periodsPerYear) - 1;

      for (let p = 1; p <= periodsPerYear; p++) {
        const gross = recurringP;
        const entryFee = gross * contributionFeeDecimal;
        const net = gross - entryFee;

        if (gross > 0) {
          totalInvested += gross;
          totalContributionFees += entryFee;
        }

        if (contributionTiming === 'beginning') balance += net;
        balance *= (1 + yearPeriodicRate);
        balance -= Math.max(0, balance) * periodicFeeRate;
        if (contributionTiming === 'end') balance += net;
      }

      recurringP *= (1 + stepUpDecimal);
    }

    // Capital Gains Tax
    const netPrincipal = totalInvested - totalContributionFees;
    const taxableGain = Math.max(0, balance - netPrincipal);
    balance -= taxableGain * taxRateDecimal;

    const safeFinal = Number.isFinite(balance) && balance > 0 ? balance : 0;
    finalBalances[s] = safeFinal;
    totalSum += safeFinal;
  }

  finalBalances.sort();

  const getPercentile = (q: number) => {
    const idx = Math.min(totalSims - 1, Math.max(0, Math.floor((totalSims - 1) * q)));
    return finalBalances[idx];
  };

  let targetSuccessCount = 0;
  if (targetAmount !== null && targetAmount > 0) {
    for (let i = 0; i < totalSims; i++) {
      if (finalBalances[i] >= targetAmount) targetSuccessCount++;
    }
  }

  return {
    p10: getPercentile(0.10),
    p25: getPercentile(0.25),
    p50: getPercentile(0.50),
    p75: getPercentile(0.75),
    p90: getPercentile(0.90),
    min: finalBalances[0],
    max: finalBalances[totalSims - 1],
    mean: totalSum / totalSims,
    probabilityTarget: targetAmount !== null ? (targetSuccessCount / totalSims) * 100 : null,
    simulations: totalSims,
    deterministicValue: deterministic.futureValue,
  };
}

/* =====================================================================
   7. CSV & PROFESSIONAL REPORT GENERATION (RFC-4180 COMPLIANT)
   ===================================================================== */

export function generateCsvReport({
  mode,
  initialInvestment = 0,
  recurringContribution = 0,
  annualRate,
  years,
  frequency = 'monthly',
  stepUp = 0,
  rateBasis = 'nominal',
  contributionTiming = 'beginning',
  annualFeeRate = 0,
  contributionFeeRate = 0,
  taxRateOnGains = 0,
  inflationRate = 0,
  currencyCode = 'USD',
}: {
  mode: Mode;
  initialInvestment?: number;
  recurringContribution?: number;
  annualRate: number;
  years: number;
  frequency?: Frequency;
  stepUp?: number;
  rateBasis?: RateBasis;
  contributionTiming?: ContributionTiming;
  annualFeeRate?: number;
  contributionFeeRate?: number;
  taxRateOnGains?: number;
  inflationRate?: number;
  currencyCode?: CurrencyCode;
}): string {
  const result = projectInvestment({
    mode,
    initialInvestment,
    recurringContribution,
    annualRate,
    years,
    frequency,
    stepUp,
    rateBasis,
    contributionTiming,
    annualFeeRate,
    contributionFeeRate,
    taxRateOnGains,
    inflationRate,
  });

  const metadata = [
    '# KivaroTools Investment & SIP Calculator Projection Report',
    `# Mode: ${mode === 'sip' ? 'SIP (Periodic Investment)' : 'Lump Sum (One-Time)'}`,
    `# Currency: ${currencyCode}`,
    `# Initial Investment: ${initialInvestment.toFixed(2)}`,
    `# Recurring Contribution: ${recurringContribution.toFixed(2)} (${frequency})`,
    `# Expected Return Rate: ${annualRate.toFixed(2)}% p.a. (${rateBasis})`,
    `# Time Period: ${years} Years`,
    `# Contribution Timing: ${contributionTiming === 'beginning' ? 'Beginning of Period' : 'End of Period'}`,
    `# Annual Step-Up: ${stepUp.toFixed(2)}%`,
    `# Annual Management Fee: ${annualFeeRate.toFixed(2)}%`,
    `# Contribution Fee: ${contributionFeeRate.toFixed(2)}%`,
    `# Tax on Gains: ${taxRateOnGains.toFixed(2)}%`,
    `# Inflation Assumption: ${inflationRate.toFixed(2)}%`,
    '#',
    `# Total Invested: ${result.totalInvested.toFixed(2)}`,
    `# Gross Capital Growth: ${result.grossGrowth.toFixed(2)}`,
    `# Total Contribution Fees: ${result.totalContributionFees.toFixed(2)}`,
    `# Total Management Fees: ${result.totalManagementFees.toFixed(2)}`,
    `# Total Taxes: ${result.totalTaxes.toFixed(2)}`,
    `# Final Portfolio Value: ${result.futureValue.toFixed(2)}`,
    `# Net Gain: ${result.netGain.toFixed(2)}`,
    `# Purchasing Power: ${result.realValue.toFixed(2)}`,
    '#',
  ];

  const headers = [
    'Year',
    'Starting Balance',
    'Contributions',
    'Gross Growth',
    'Contribution Fees',
    'Management Fees',
    'Taxes',
    'Ending Balance',
    'Net Gain',
    'Inflation-Adjusted Value',
  ];

  const rows = result.schedule.map((r) => [
    r.year,
    r.startingBalance.toFixed(2),
    r.contributions.toFixed(2),
    r.grossGrowth.toFixed(2),
    r.contributionFees.toFixed(2),
    r.managementFees.toFixed(2),
    r.taxes.toFixed(2),
    r.endingBalance.toFixed(2),
    r.netGain.toFixed(2),
    r.inflationAdjustedValue.toFixed(2),
  ]);

  const csvBody = [
    headers.map(csvCell).join(','),
    ...rows.map((row) => row.map(csvCell).join(',')),
  ].join('\r\n');

  return '\uFEFF' + metadata.join('\r\n') + '\r\n' + csvBody;
}

export function generateReportHtml({
  result,
  currency,
  mode,
  annualRate,
  years,
  frequency,
  stepUp,
  rateBasis,
  contributionTiming,
  annualFeeRate,
  contributionFeeRate,
  taxRateOnGains,
  inflationRate,
  goalPlan,
  monteCarloResult,
}: {
  result: InvestmentProjectionResult;
  currency: CurrencyOption;
  mode: Mode;
  annualRate: number;
  years: number;
  frequency: Frequency;
  stepUp: number;
  rateBasis: RateBasis;
  contributionTiming: ContributionTiming;
  annualFeeRate: number;
  contributionFeeRate: number;
  taxRateOnGains: number;
  inflationRate: number;
  goalPlan: GoalPlanResult | null;
  monteCarloResult: MonteCarloResult | null;
}): string {
  const formatCur = (val: number) => formatCurrency(val, currency.code);

  const scheduleRows = result.schedule
    .map(
      (r) => `
    <tr>
      <td>${r.year}</td>
      <td>${formatCur(r.startingBalance)}</td>
      <td>${formatCur(r.contributions)}</td>
      <td>${formatCur(r.grossGrowth)}</td>
      <td>${formatCur(r.contributionFees + r.managementFees)}</td>
      <td>${formatCur(r.taxes)}</td>
      <td><strong>${formatCur(r.endingBalance)}</strong></td>
      <td>${formatCur(r.netGain)}</td>
      <td>${formatCur(r.inflationAdjustedValue)}</td>
    </tr>`
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>KivaroTools Investment & SIP Audit Report</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 1040px; margin: 40px auto; padding: 0 24px; color: #0f172a; line-height: 1.5; }
    h1 { font-size: 26px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .subtitle { color: #64748b; font-size: 13px; margin-bottom: 24px; }
    .grid-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
    .kpi-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; background: #f8fafc; }
    .kpi-title { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 4px; }
    .kpi-value { font-size: 20px; font-weight: 800; color: #059669; }
    .kpi-value.sub { color: #0f172a; }
    h2 { font-size: 16px; font-weight: 700; margin-top: 32px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
    th, td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; }
    th:first-child, td:first-child { text-align: left; }
    th { background: #f1f5f9; color: #475569; font-weight: 700; }
    .disclaimer { margin-top: 40px; padding: 16px; background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; font-size: 11px; color: #713f12; }
    @media print { body { margin: 0; padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <h1>KivaroTools Investment & SIP Projection Report</h1>
  <div class="subtitle">Deterministic Audit Report · Generated on ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</div>

  <div class="grid-kpis">
    <div class="kpi-card">
      <div class="kpi-title">Final Portfolio Value</div>
      <div class="kpi-value">${formatCur(result.futureValue)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Total Invested</div>
      <div class="kpi-value sub">${formatCur(result.totalInvested)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Estimated Net Gain</div>
      <div class="kpi-value">${formatCur(result.netGain)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Purchasing Power</div>
      <div class="kpi-value sub">${formatCur(result.realValue)}</div>
    </div>
  </div>

  <h2>Model Parameters & Assumptions</h2>
  <table>
    <tr><th>Parameter</th><th>Value</th><th>Parameter</th><th>Value</th></tr>
    <tr><td>Mode</td><td>${mode === 'sip' ? `SIP (${frequency.charAt(0).toUpperCase() + frequency.slice(1)})` : 'Lump Sum (One-Time)'}</td><td>Contribution Timing</td><td>${contributionTiming === 'beginning' ? 'Beginning of Period' : 'End of Period'}</td></tr>
    <tr><td>Currency</td><td>${currency.name} (${currency.code})</td><td>Return Basis</td><td>${rateBasis === 'effective' ? 'Effective Annual Rate (APY)' : 'Nominal Annual Rate (APR)'}</td></tr>
    <tr><td>Expected Return Rate</td><td>${annualRate.toFixed(2)}% p.a.</td><td>Annual Management Fee</td><td>${annualFeeRate.toFixed(2)}%</td></tr>
    <tr><td>Time Horizon</td><td>${years} Years</td><td>Contribution Fee</td><td>${contributionFeeRate.toFixed(2)}%</td></tr>
    <tr><td>Annual Step-Up</td><td>${stepUp.toFixed(2)}%</td><td>Tax on Gains</td><td>${taxRateOnGains.toFixed(2)}%</td></tr>
    <tr><td>Inflation Assumption</td><td>${inflationRate.toFixed(2)}%</td><td>Total Periodic Cycles</td><td>${result.totalPeriods}</td></tr>
  </table>

  ${
    goalPlan
      ? `
  <h2>Goal Planner Validation</h2>
  <p style="font-size: 13px;">Target Goal: <strong>${formatCur(goalPlan.target)}</strong> · Required ${mode === 'sip' ? goalPlan.frequencyLabel : 'one-time'} contribution: <strong>${formatCur(goalPlan.requiredContribution)}</strong> · Projected Achievement: <strong>${formatCur(goalPlan.projectedValue)}</strong> (${goalPlan.reachable ? 'Target Achieved' : 'Unreachable'})</p>`
      : ''
  }

  ${
    monteCarloResult
      ? `
  <h2>Illustrative Monte Carlo Risk Distribution (3,000 Paths)</h2>
  <p style="font-size: 12px; color: #64748b;">Simulated stochastic pathways assuming lognormal geometric Brownian motion across ${years} years.</p>
  <table>
    <tr><th>10th Percentile (Conservative)</th><th>25th Percentile</th><th>Median (50th Percentile)</th><th>75th Percentile</th><th>90th Percentile (Optimistic)</th></tr>
    <tr><td>${formatCur(monteCarloResult.p10)}</td><td>${formatCur(monteCarloResult.p25)}</td><td><strong>${formatCur(monteCarloResult.p50)}</strong></td><td>${formatCur(monteCarloResult.p75)}</td><td>${formatCur(monteCarloResult.p90)}</td></tr>
  </table>`
      : ''
  }

  <h2>Year-by-Year Accounting Reconciliation Schedule</h2>
  <table>
    <thead>
      <tr>
        <th>Yr</th>
        <th>Start Balance</th>
        <th>Contributions</th>
        <th>Gross Growth</th>
        <th>Total Fees</th>
        <th>Taxes</th>
        <th>Ending Balance</th>
        <th>Net Gain</th>
        <th>Purchasing Power</th>
      </tr>
    </thead>
    <tbody>
      ${scheduleRows}
    </tbody>
  </table>

  <div class="disclaimer">
    <strong>Regulatory & Methodology Disclaimer:</strong> This projection report is generated by a deterministic mathematical calculation model for illustrative educational purposes. Actual financial investment returns vary according to market conditions, fund expenses, tax jurisdiction, and individual circumstances. The tax model represents a simplified capital gains deduction upon full liquidation and does not constitute professional tax, legal, or investment advice.
  </div>
</body>
</html>`;
}

/* =====================================================================
   8. MAIN REACT COMPONENT
   ===================================================================== */

export default function SipCalculator() {
  const idPrefix = useId();

  // Fresh-state inputs (empty strings initially)
  const [mode, setMode] = useState<Mode>('sip');
  const [currency, setCurrency] = useState<CurrencyOption>(DEFAULT_CURRENCY);
  const [initialInvestment, setInitialInvestment] = useState<string>('');
  const [investment, setInvestment] = useState<string>('');
  const [rate, setRate] = useState<string>('');
  const [years, setYears] = useState<string>('');
  const [stepUp, setStepUp] = useState<string>('');
  const [inflation, setInflation] = useState<string>('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [rateBasis, setRateBasis] = useState<RateBasis>('nominal');
  const [contributionTiming, setContributionTiming] = useState<ContributionTiming>('beginning');
  const [annualFee, setAnnualFee] = useState<string>('');
  const [contributionFee, setContributionFee] = useState<string>('');
  const [taxRate, setTaxRate] = useState<string>('');

  // UI state
  const [showPlanning, setShowPlanning] = useState(false);
  const [showScenario, setShowScenario] = useState(false);
  const [showSchedule, setShowSchedule] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  // URL hash state hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleHashChange = () => {
      try {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#state=')) {
          const rawJson = decodeURIComponent(atob(hash.slice(7)));
          const data = JSON.parse(rawJson);
          if (data && typeof data === 'object') {
            if (data.m === 'sip' || data.m === 'lumpsum') setMode(data.m);
            if (typeof data.c === 'string') {
              const foundCurr = WORLD_CURRENCIES.find((item) => item.code === data.c);
              if (foundCurr) setCurrency(foundCurr);
            }
            if (typeof data.p === 'string') setInitialInvestment(String(data.p));
            if (typeof data.i === 'string') setInvestment(String(data.i));
            if (typeof data.r === 'string') setRate(String(data.r));
            if (typeof data.y === 'string') setYears(String(data.y));
            if (typeof data.s === 'string') setStepUp(String(data.s));
            if (typeof data.inf === 'string') setInflation(String(data.inf));
            if (data.f === 'monthly' || data.f === 'quarterly' || data.f === 'yearly') setFrequency(data.f);
            if (data.t === 'beginning' || data.t === 'end') setContributionTiming(data.t);
          }
        }
      } catch {
        // Ignore malformed URL state safely
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    const timer = setTimeout(handleHashChange, 0);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      clearTimeout(timer);
    };
  }, []);

  // Goal planner state
  const [goalAmount, setGoalAmount] = useState<string>('');
  const [showGoalPlanner, setShowGoalPlanner] = useState(false);

  // Monte Carlo state
  const [monteCarloVolatility, setMonteCarloVolatility] = useState<string>('15');
  const [showMonteCarlo, setShowMonteCarlo] = useState(false);


  // Input sanitization & validation
  const parsedInvestment = safeNumber(investment, 0);
  const parsedInitial = safeNumber(initialInvestment, 0);
  const parsedRate = safeNumber(rate, 0);
  const parsedYears = Math.max(1, Math.min(100, Math.floor(safeNumber(years, 10))));

  const isInvestmentEntered = investment.trim() !== '' && parsedInvestment > 0;
  const isInitialEntered = initialInvestment.trim() !== '' && parsedInitial > 0;
  const isRateEntered = rate.trim() !== '' && Number.isFinite(parsedRate);
  const isYearsEntered = years.trim() !== '' && Number.isFinite(safeNumber(years, 0));

  const hasRequiredInputs =
    mode === 'sip'
      ? (isInvestmentEntered || isInitialEntered) && isRateEntered && isYearsEntered
      : isInvestmentEntered && isRateEntered && isYearsEntered;

  // Canonical calculations
  const calculations = useMemo(() => {
    if (!hasRequiredInputs) {
      return null;
    }

    const P = clamp(parsedInvestment, 0, 1e15);
    const P0 = mode === 'lumpsum' ? P : clamp(parsedInitial, 0, 1e15);
    const recurringP = mode === 'lumpsum' ? 0 : P;

    const annualRateVal = clamp(parsedRate, -99.99, 1000);
    const tVal = clamp(parsedYears, 1, 100);
    const annualStepUpVal = mode === 'sip' ? clamp(safeNumber(stepUp, 0), 0, 100) : 0;
    const inflationVal = clamp(safeNumber(inflation, 0), 0, 50);
    const annualFeeVal = clamp(safeNumber(annualFee, 0), 0, 20);
    const contribFeeVal = clamp(safeNumber(contributionFee, 0), 0, 20);
    const taxRateVal = clamp(safeNumber(taxRate, 0), 0, 100);

    return projectInvestment({
      mode,
      initialInvestment: P0,
      recurringContribution: recurringP,
      annualRate: annualRateVal,
      years: tVal,
      frequency,
      stepUp: annualStepUpVal,
      rateBasis,
      contributionTiming,
      annualFeeRate: annualFeeVal,
      contributionFeeRate: contribFeeVal,
      taxRateOnGains: taxRateVal,
      inflationRate: inflationVal,
    });
  }, [
    hasRequiredInputs,
    mode,
    parsedInvestment,
    parsedInitial,
    parsedRate,
    parsedYears,
    frequency,
    stepUp,
    rateBasis,
    contributionTiming,
    annualFee,
    contributionFee,
    taxRate,
    inflation,
  ]);

  // Scenarios derived from canonical engine
  const scenarios = useMemo(() => {
    if (!hasRequiredInputs || !calculations) return [];
    const baseRate = clamp(parsedRate, -99.99, 1000);
    const spread = 4;
    const rates = [Math.max(-99.99, baseRate - spread), baseRate, Math.min(1000, baseRate + spread)];

    return rates.map((scenarioRate, index) => {
      const res = projectInvestment({
        mode,
        initialInvestment: calculations.initialInvestment,
        recurringContribution: calculations.recurringContribution,
        annualRate: scenarioRate,
        years: parsedYears,
        frequency,
        stepUp: safeNumber(stepUp, 0),
        rateBasis,
        contributionTiming,
        annualFeeRate: safeNumber(annualFee, 0),
        contributionFeeRate: safeNumber(contributionFee, 0),
        taxRateOnGains: safeNumber(taxRate, 0),
        inflationRate: safeNumber(inflation, 0),
      });

      return {
        label: index === 0 ? 'Conservative (-4%)' : index === 1 ? 'Base Assumption' : 'Optimistic (+4%)',
        rate: scenarioRate,
        value: res.futureValue,
        gain: res.netGain,
        realValue: res.realValue,
      };
    });
  }, [hasRequiredInputs, calculations, mode, parsedRate, parsedYears, frequency, stepUp, rateBasis, contributionTiming, annualFee, contributionFee, taxRate, inflation]);

  // Goal Planner solver
  const parsedGoal = safeNumber(goalAmount, 0);
  const hasGoalInputs = hasRequiredInputs && goalAmount.trim() !== '' && parsedGoal > 0;

  const goalPlan = useMemo(() => {
    if (!hasGoalInputs) return null;
    return solveGoalContribution({
      target: parsedGoal,
      mode,
      initialInvestment: mode === 'sip' ? parsedInitial : 0,
      annualRate: clamp(parsedRate, -99.99, 1000),
      years: parsedYears,
      frequency,
      stepUp: safeNumber(stepUp, 0),
      rateBasis,
      contributionTiming,
      annualFeeRate: safeNumber(annualFee, 0),
      contributionFeeRate: safeNumber(contributionFee, 0),
      taxRateOnGains: safeNumber(taxRate, 0),
      inflationRate: safeNumber(inflation, 0),
    });
  }, [hasGoalInputs, parsedGoal, mode, parsedInitial, parsedRate, parsedYears, frequency, stepUp, rateBasis, contributionTiming, annualFee, contributionFee, taxRate, inflation]);

  // SIP vs Lump Sum Strategy Comparison
  const comparison = useMemo(() => {
    if (!hasRequiredInputs || mode !== 'sip' || !calculations) return null;
    const sipValue = calculations.futureValue;
    const sameCapitalLumpSum = projectInvestment({
      mode: 'lumpsum',
      initialInvestment: calculations.totalInvested,
      recurringContribution: 0,
      annualRate: clamp(parsedRate, -99.99, 1000),
      years: parsedYears,
      frequency: 'yearly',
      stepUp: 0,
      rateBasis,
      contributionTiming: 'beginning',
      annualFeeRate: safeNumber(annualFee, 0),
      contributionFeeRate: safeNumber(contributionFee, 0),
      taxRateOnGains: safeNumber(taxRate, 0),
      inflationRate: safeNumber(inflation, 0),
    }).futureValue;

    return {
      sipValue,
      sameCapitalLumpSum,
      difference: sameCapitalLumpSum - sipValue,
    };
  }, [hasRequiredInputs, mode, calculations, parsedRate, parsedYears, rateBasis, annualFee, contributionFee, taxRate, inflation]);

  // Monte Carlo stochastic simulation (calculated when section is open)
  const monteCarloResult = useMemo(() => {
    if (!showMonteCarlo || !hasRequiredInputs || !calculations) return null;
    const vol = safeNumber(monteCarloVolatility || '15', 0);
    if (vol <= 0) return null;

    return runMonteCarloSimulations({
      mode,
      initialInvestment: calculations.initialInvestment,
      recurringContribution: calculations.recurringContribution,
      annualRate: clamp(parsedRate, -99.99, 1000),
      years: parsedYears,
      frequency,
      stepUp: safeNumber(stepUp, 0),
      rateBasis,
      contributionTiming,
      annualFeeRate: safeNumber(annualFee, 0),
      contributionFeeRate: safeNumber(contributionFee, 0),
      taxRateOnGains: safeNumber(taxRate, 0),
      volatility: vol,
      simulations: 3000,
      targetAmount: hasGoalInputs ? parsedGoal : null,
    });
  }, [
    showMonteCarlo,
    hasRequiredInputs,
    calculations,
    monteCarloVolatility,
    mode,
    parsedRate,
    parsedYears,
    frequency,
    stepUp,
    rateBasis,
    contributionTiming,
    annualFee,
    contributionFee,
    taxRate,
    hasGoalInputs,
    parsedGoal,
  ]);

  // Reset handler (fresh clean state)
  const handleReset = () => {
    setMode('sip');
    setCurrency(DEFAULT_CURRENCY);
    setInitialInvestment('');
    setInvestment('');
    setRate('');
    setYears('');
    setStepUp('');
    setInflation('');
    setFrequency('monthly');
    setRateBasis('nominal');
    setContributionTiming('beginning');
    setAnnualFee('');
    setContributionFee('');
    setTaxRate('');
    setShowPlanning(false);
    setShowScenario(false);
    setShowSchedule(true);
    setShowDetails(false);
    setCopied(false);
    setGoalAmount('');
    setShowGoalPlanner(false);
    setMonteCarloVolatility('15');
    setShowMonteCarlo(false);
  };

  // Copy Summary handler
  const handleCopySummary = async () => {
    if (!calculations) return;
    const text = [
      'KivaroTools Investment & SIP Calculator Projection Summary',
      `Mode: ${mode === 'sip' ? 'SIP (Periodic Investment)' : 'Lump Sum (One-Time)'}`,
      `Currency: ${currency.code}`,
      ...(mode === 'sip' && calculations.initialInvestment > 0 ? [`Initial Starting Capital: ${formatCurrency(calculations.initialInvestment, currency.code)}`] : []),
      `Investment Amount: ${formatCurrency(mode === 'sip' ? calculations.recurringContribution : calculations.initialInvestment, currency.code)}`,
      ...(mode === 'sip' ? [`Frequency: ${frequency}`, `Annual Step-up: ${formatPercent(safeNumber(stepUp, 0))}`] : []),
      `Expected Return: ${formatPercent(clamp(parsedRate, -99.99, 1000))} p.a. (${rateBasis})`,
      `Time Period: ${parsedYears} years`,
      `Contribution Timing: ${contributionTiming === 'beginning' ? 'Beginning of period' : 'End of period'}`,
      `Annual Management Fee: ${formatPercent(safeNumber(annualFee, 0))}`,
      `Contribution Fee: ${formatPercent(safeNumber(contributionFee, 0))}`,
      `Tax Rate on Gains: ${formatPercent(safeNumber(taxRate, 0))}`,
      `Total Fees: ${formatCurrency(calculations.totalFees, currency.code)}`,
      `Total Taxes: ${formatCurrency(calculations.totalTaxes, currency.code)}`,
      '----------------------------------------',
      `Total Invested: ${formatCurrency(calculations.totalInvested, currency.code)}`,
      `Gross Growth: ${formatCurrency(calculations.grossGrowth, currency.code)}`,
      `Estimated Net Gain: ${formatCurrency(calculations.netGain, currency.code)}`,
      `Future Value: ${formatCurrency(calculations.futureValue, currency.code)}`,
      `Today's Purchasing Power: ${formatCurrency(calculations.realValue, currency.code)}`,
      '----------------------------------------',
      'Projection for estimation only. Not guaranteed or financial advice.',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  // Share calculation handler (URL-safe encoded non-sensitive params)
  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    try {
      const stateObj: Record<string, string> = {
        m: mode,
        c: currency.code,
        i: investment,
        r: rate,
        y: years,
      };
      if (initialInvestment) stateObj.p = initialInvestment;
      if (stepUp) stateObj.s = stepUp;
      if (inflation) stateObj.inf = inflation;
      if (frequency !== 'monthly') stateObj.f = frequency;
      if (contributionTiming !== 'beginning') stateObj.t = contributionTiming;

      const encoded = btoa(encodeURIComponent(JSON.stringify(stateObj)));
      window.location.hash = `state=${encoded}`;
      const shareUrl = `${window.location.origin}${window.location.pathname}#state=${encoded}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 2000);
      } catch {
        setShareCopied(true);
      }
    } catch {
      setShareCopied(false);
    }
  };

  // CSV download handler
  const handleDownloadCsv = () => {
    if (!calculations) return;
    const csvData = generateCsvReport({
      mode,
      initialInvestment: calculations.initialInvestment,
      recurringContribution: calculations.recurringContribution,
      annualRate: clamp(parsedRate, -99.99, 1000),
      years: parsedYears,
      frequency,
      stepUp: safeNumber(stepUp, 0),
      rateBasis,
      contributionTiming,
      annualFeeRate: safeNumber(annualFee, 0),
      contributionFeeRate: safeNumber(contributionFee, 0),
      taxRateOnGains: safeNumber(taxRate, 0),
      inflationRate: safeNumber(inflation, 0),
      currencyCode: currency.code,
    });

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kivarotools-${mode === 'sip' ? 'sip' : 'lumpsum'}-schedule-${currency.code}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Professional HTML report download handler
  const handleDownloadReport = () => {
    if (!calculations) return;
    const htmlReport = generateReportHtml({
      result: calculations,
      currency,
      mode,
      annualRate: clamp(parsedRate, -99.99, 1000),
      years: parsedYears,
      frequency,
      stepUp: safeNumber(stepUp, 0),
      rateBasis,
      contributionTiming,
      annualFeeRate: safeNumber(annualFee, 0),
      contributionFeeRate: safeNumber(contributionFee, 0),
      taxRateOnGains: safeNumber(taxRate, 0),
      inflationRate: safeNumber(inflation, 0),
      goalPlan,
      monteCarloResult,
    });

    const blob = new Blob([htmlReport], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kivarotools-investment-report-${currency.code}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const investmentLabel = mode === 'sip'
    ? frequency === 'monthly' ? 'Monthly Contribution' : frequency === 'quarterly' ? 'Quarterly Contribution' : 'Yearly Contribution'
    : 'Lump Sum Investment Amount';

  const QUICK_PRESETS = [
    { label: 'Starter SIP', desc: '$100/mo · 12% · 10 Yrs', m: 'sip' as Mode, i: '100', r: '12', y: '10', s: '' },
    { label: 'Wealth Builder', desc: '$500/mo · 12% · 15 Yrs', m: 'sip' as Mode, i: '500', r: '12', y: '15', s: '' },
    { label: 'Aggressive Step-Up', desc: '$1,000/mo · 14% · 20 Yrs (5% Step-up)', m: 'sip' as Mode, i: '1000', r: '14', y: '20', s: '5' },
    { label: 'One-Time Lump Sum', desc: '$25,000 · 10% · 10 Yrs', m: 'lumpsum' as Mode, i: '25000', r: '10', y: '10', s: '' },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-full">
      {/* Mode Selection Tabs & Presets */}
      <div className="flex flex-col items-center gap-4">
        <div
          role="tablist"
          aria-label="Investment Calculation Mode"
          className="bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl flex gap-1.5 border border-gray-200 dark:border-slate-700 max-w-md w-full"
        >
          <button
            type="button"
            role="tab"
            id={`${idPrefix}-tab-sip`}
            aria-selected={mode === 'sip'}
            aria-controls={`${idPrefix}-panel-main`}
            onClick={() => setMode('sip')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              mode === 'sip'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            SIP (Periodic)
          </button>
          <button
            type="button"
            role="tab"
            id={`${idPrefix}-tab-lumpsum`}
            aria-selected={mode === 'lumpsum'}
            aria-controls={`${idPrefix}-panel-main`}
            onClick={() => setMode('lumpsum')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              mode === 'lumpsum'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Lump Sum (One-Time)
          </button>
        </div>

        {/* Quick Example Presets */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Quick Illustrative Presets:
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setMode(p.m);
                  setInvestment(p.i);
                  setRate(p.r);
                  setYears(p.y);
                  setStepUp(p.s);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <span className="font-bold">{p.label}:</span>{' '}
                <span className="text-slate-500 dark:text-slate-400">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Inputs / Right Hero KPI */}
      <div
        id={`${idPrefix}-panel-main`}
        role="tabpanel"
        aria-labelledby={mode === 'sip' ? `${idPrefix}-tab-sip` : `${idPrefix}-tab-lumpsum`}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
      >
        {/* Left Column: Form Controls */}
        <div className="space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs">
          {/* Currency Selection */}
          <div>
            <label htmlFor={`${idPrefix}-currency`} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Currency
            </label>
            <select
              id={`${idPrefix}-currency`}
              value={currency.code}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                const selected = WORLD_CURRENCIES.find((c) => c.code === e.target.value);
                if (selected) setCurrency(selected);
              }}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all cursor-pointer text-slate-900 dark:text-white"
            >
              {WORLD_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code}) - {c.symbol}
                </option>
              ))}
            </select>
          </div>

          {/* Initial Starting Investment (Optional in SIP mode) */}
          {mode === 'sip' && (
            <div>
              <label htmlFor={`${idPrefix}-initial-investment`} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Initial Investment / Starting Capital <span className="text-xs font-normal text-slate-500 dark:text-slate-400">(Optional)</span>
              </label>
              <div className="flex items-stretch w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                <span className="shrink-0 flex items-center px-4 text-slate-500 dark:text-slate-400 font-semibold border-r border-gray-200 dark:border-slate-700 select-none">
                  {currency.symbol}
                </span>
                <input
                  id={`${idPrefix}-initial-investment`}
                  type="number"
                  inputMode="decimal"
                  autoComplete="off"
                  min="0"
                  max="1000000000000000"
                  step="any"
                  value={initialInvestment}
                  placeholder="e.g. 10000"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setInitialInvestment(e.target.value)}
                  className="min-w-0 flex-1 px-4 py-3 bg-transparent focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          )}

          {/* Primary Investment Amount */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor={`${idPrefix}-investment`} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {investmentLabel}
              </label>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/20">
                {investment.trim() !== '' ? formatCurrency(parsedInvestment, currency.code) : 'Enter amount'}
              </span>
            </div>
            <div className="flex items-stretch w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
              <span className="shrink-0 flex items-center px-4 text-slate-500 dark:text-slate-400 font-semibold border-r border-gray-200 dark:border-slate-700 select-none">
                {currency.symbol}
              </span>
              <input
                id={`${idPrefix}-investment`}
                type="number"
                inputMode="decimal"
                autoComplete="off"
                min="0"
                max="1000000000000000"
                step="any"
                value={investment}
                placeholder={mode === 'sip' ? 'e.g. 500' : 'e.g. 50000'}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInvestment(e.target.value)}
                className="min-w-0 flex-1 px-4 py-3 bg-transparent focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div className="mt-2.5 px-0.5">
              <input
                type="range"
                aria-label={`${investmentLabel} slider`}
                min={mode === 'sip' ? 50 : 1000}
                max={mode === 'sip' ? 10000 : 250000}
                step={mode === 'sip' ? 50 : 1000}
                value={clamp(parsedInvestment || (mode === 'sip' ? 500 : 25000), mode === 'sip' ? 50 : 1000, mode === 'sip' ? 10000 : 250000)}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInvestment(e.target.value)}
                className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1 select-none">
                <span>{currency.symbol}{mode === 'sip' ? '50' : '1,000'}</span>
                <span className="text-center">{currency.symbol}{mode === 'sip' ? '5,000' : '125,000'}</span>
                <span className="text-right">{currency.symbol}{mode === 'sip' ? '10,000+' : '250,000+'}</span>
              </div>
            </div>
          </div>

          {/* SIP Specific Controls */}
          {mode === 'sip' && (
            <>
              <div>
                <label htmlFor={`${idPrefix}-frequency`} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Contribution Frequency
                </label>
                <select
                  id={`${idPrefix}-frequency`}
                  value={frequency}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setFrequency(e.target.value as Frequency)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all cursor-pointer text-slate-900 dark:text-white"
                >
                  <option value="monthly">Monthly (12 periods/year)</option>
                  <option value="quarterly">Quarterly (4 periods/year)</option>
                  <option value="yearly">Yearly (1 period/year)</option>
                </select>
              </div>

              <div>
                <label htmlFor={`${idPrefix}-stepup`} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Annual SIP Step-up (%)
                </label>
                <input
                  id={`${idPrefix}-stepup`}
                  type="number"
                  inputMode="decimal"
                  autoComplete="off"
                  min="0"
                  max="100"
                  step="0.5"
                  value={stepUp}
                  placeholder="e.g. 5"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setStepUp(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  Increases the periodic payment by this fixed rate at the start of each new year.
                </p>
              </div>
            </>
          )}

          {/* Expected Return Rate with sync slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor={`${idPrefix}-rate`} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Expected Return Rate (% P.A.)
              </label>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/20">
                {rate.trim() !== '' ? `${clamp(parsedRate, -99.99, 1000)}%` : 'Enter rate'}
              </span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <input
                id={`${idPrefix}-rate`}
                type="number"
                inputMode="decimal"
                autoComplete="off"
                min="-99.99"
                max="1000"
                step="0.1"
                value={rate}
                placeholder="e.g. 12"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setRate(e.target.value)}
                className="w-24 sm:w-28 shrink-0 px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 dark:text-white text-sm"
              />
              <div className="flex-1 min-w-0">
                <input
                  type="range"
                  aria-label="Expected return rate slider"
                  min="1"
                  max="30"
                  step="0.5"
                  value={clamp(parsedRate || 12, 1, 30)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setRate(e.target.value)}
                  className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1.5 select-none px-0.5">
                  <span>1%</span>
                  <span className="text-center">15%</span>
                  <span className="text-right">30%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Time Period (Years) with sync slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor={`${idPrefix}-years`} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Time Period (Years)
              </label>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/20">
                {years.trim() !== '' ? (parsedYears === 1 ? '1 Year' : `${parsedYears} Years`) : 'Enter years'}
              </span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <input
                id={`${idPrefix}-years`}
                type="number"
                inputMode="numeric"
                autoComplete="off"
                min="1"
                max="100"
                step="1"
                value={years}
                placeholder="e.g. 10"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setYears(e.target.value)}
                className="w-24 sm:w-28 shrink-0 px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 dark:text-white text-sm"
              />
              <div className="flex-1 min-w-0">
                <input
                  type="range"
                  aria-label="Time period in years"
                  min="1"
                  max="60"
                  value={clamp(parsedYears, 1, 60)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setYears(e.target.value)}
                  className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1.5 select-none px-0.5">
                  <span>1 Year</span>
                  <span className="text-center">30 Years</span>
                  <span className="text-right">60 Years</span>
                </div>
              </div>
            </div>
          </div>

          {/* Inflation Rate */}
          <div>
            <label htmlFor={`${idPrefix}-inflation`} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Expected Inflation Rate (%)
            </label>
            <input
              id={`${idPrefix}-inflation`}
              type="number"
              inputMode="decimal"
              autoComplete="off"
              min="0"
              max="50"
              step="0.5"
              value={inflation}
              placeholder="e.g. 4"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInflation(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Discounts nominal future amount to estimate real purchasing power in today&apos;s money.
            </p>
          </div>

          {/* Advanced Planning Accordion */}
          <div className="rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
            <button
              type="button"
              aria-expanded={showPlanning}
              onClick={() => setShowPlanning((v) => !v)}
              className="w-full px-4 py-3 flex items-center justify-between text-left font-bold text-sm text-slate-800 dark:text-slate-200 bg-gray-50 dark:bg-slate-950/60 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Advanced Fee, Tax &amp; Timing Models</span>
              </span>
              {showPlanning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showPlanning && (
              <div className="p-4 space-y-4 bg-white dark:bg-slate-900/80 border-t border-gray-200 dark:border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`${idPrefix}-rate-basis`} className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Return Rate Compounding Basis
                    </label>
                    <select
                      id={`${idPrefix}-rate-basis`}
                      value={rateBasis}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => setRateBasis(e.target.value as RateBasis)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    >
                      <option value="nominal">Nominal Annual Rate (APR convention)</option>
                      <option value="effective">Effective Annual Rate (APY convention)</option>
                    </select>
                  </div>
                  {mode === 'sip' && (
                    <div>
                      <label htmlFor={`${idPrefix}-timing`} className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        Contribution Timing (Annuity Mode)
                      </label>
                      <select
                        id={`${idPrefix}-timing`}
                        value={contributionTiming}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setContributionTiming(e.target.value as ContributionTiming)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      >
                        <option value="beginning">Beginning of Period (Annuity Due)</option>
                        <option value="end">End of Period (Ordinary Annuity)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor={`${idPrefix}-annual-fee`} className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Annual Management Fee (%)
                    </label>
                    <input
                      id={`${idPrefix}-annual-fee`}
                      type="number"
                      inputMode="decimal"
                      autoComplete="off"
                      min="0"
                      max="20"
                      step="0.05"
                      value={annualFee}
                      placeholder="e.g. 0.75"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setAnnualFee(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label htmlFor={`${idPrefix}-contrib-fee`} className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Contribution / Entry Fee (%)
                    </label>
                    <input
                      id={`${idPrefix}-contrib-fee`}
                      type="number"
                      inputMode="decimal"
                      autoComplete="off"
                      min="0"
                      max="20"
                      step="0.1"
                      value={contributionFee}
                      placeholder="e.g. 0.5"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setContributionFee(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label htmlFor={`${idPrefix}-tax-rate`} className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Tax on Capital Gains (%)
                    </label>
                    <input
                      id={`${idPrefix}-tax-rate`}
                      type="number"
                      inputMode="decimal"
                      autoComplete="off"
                      min="0"
                      max="100"
                      step="1"
                      value={taxRate}
                      placeholder="e.g. 15"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setTaxRate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <strong>Auditable Conventions:</strong> Entry fees are deducted from gross cash contribution prior to investment. Management fees are converted into equivalent compound periodic rates [1 - (1 - F)^(1/periods)]. Capital gains tax is modeled as a lump-sum deduction from net capital gains above cost basis upon final year liquidation.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 min-w-[80px] inline-flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={!hasRequiredInputs}
              className="flex-1 min-w-[95px] inline-flex items-center justify-center gap-1.5 px-3.5 py-3 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {shareCopied ? <Check className="w-4 h-4 shrink-0 text-emerald-600" /> : <Share2 className="w-4 h-4 shrink-0" />}
              <span>{shareCopied ? 'Link Copied!' : 'Share'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopySummary}
              disabled={!hasRequiredInputs}
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3.5 py-3 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {copied ? <Check className="w-4 h-4 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Hero Summary KPI Card */}
        <div className="bg-emerald-50/80 dark:bg-emerald-950/20 rounded-3xl p-6 sm:p-7 border border-emerald-100 dark:border-emerald-800/40 flex flex-col justify-start shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Total Expected Amount</span>
            </h3>
            {calculations && (
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-full border border-emerald-500/20">
                {calculations.totalPeriods} Periods
              </span>
            )}
          </div>

          {!hasRequiredInputs || !calculations ? (
            <div className="min-h-[300px] flex items-center justify-center text-center p-6 border-b border-emerald-200/60 dark:border-emerald-800/40">
              <div className="max-w-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                  <Calculator className="w-6 h-6" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">Ready to calculate</div>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Enter your investment amount and expected return rate to generate an auditable wealth projection.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Primary Future Value Display */}
              <div className="mb-6 pb-6 border-b border-emerald-200/70 dark:border-emerald-800/50">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight break-words">
                  {formatCurrency(calculations.futureValue, currency.code)}
                </div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-2">
                  <span>Purchasing Power (Today&apos;s Money):</span>
                  <strong className="text-slate-900 dark:text-white">{formatCurrency(calculations.realValue, currency.code)}</strong>
                </div>
              </div>

              {/* Progress Distribution Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-600 dark:text-slate-400">
                    Invested Capital: {calculations.investedPercent.toFixed(1)}%
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Estimated Net Returns: {calculations.returnsPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full flex h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                  <div
                    style={{ width: `${calculations.investedPercent}%` }}
                    className="bg-slate-400 dark:bg-slate-500 transition-all duration-300"
                  />
                  <div
                    style={{ width: `${calculations.returnsPercent}%` }}
                    className="bg-emerald-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Interactive SVG Compounding Wealth Area Chart */}
              <div className="mb-6 bg-white/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-emerald-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Compounding Growth Curve
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                      Invested
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Total Wealth
                    </span>
                  </div>
                </div>

                {/* SVG Area Chart */}
                <div className="relative w-full">
                  <svg
                    viewBox="0 0 400 160"
                    className="w-full h-36 overflow-visible select-none"
                    role="img"
                    aria-label={`Compounding growth chart over ${calculations.schedule.length} years`}
                  >
                    <defs>
                      <linearGradient id={`${idPrefix}-wealthGrad`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                      </linearGradient>
                      <linearGradient id={`${idPrefix}-investedGrad`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <line x1="20" y1="20" x2="390" y2="20" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                    <line x1="20" y1="75" x2="390" y2="75" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                    <line x1="20" y1="130" x2="390" y2="130" stroke="currentColor" strokeOpacity="0.15" />

                    {/* Paths generated from calculations.schedule */}
                    {(() => {
                      const sched = calculations.schedule;
                      if (!sched.length) return null;
                      const maxVal = Math.max(...sched.map((s) => s.endingBalance), 1);
                      const chartLeft = 25;
                      const chartRight = 385;
                      const chartTop = 20;
                      const chartBottom = 130;
                      const chartHeight = chartBottom - chartTop;
                      const chartWidth = chartRight - chartLeft;

                      let cumulativeInvested = 0;
                      const points = sched.map((row, idx) => {
                        cumulativeInvested += row.contributions;
                        const x = chartLeft + (idx / Math.max(sched.length - 1, 1)) * chartWidth;
                        const yBal = chartBottom - (Math.max(0, row.endingBalance) / maxVal) * chartHeight;
                        const yInv = chartBottom - (Math.max(0, cumulativeInvested) / maxVal) * chartHeight;
                        return { x, yBal, yInv, row, cumulativeInvested };
                      });

                      const wealthPathD = `M ${points[0].x} ${points[0].yBal} ` + points.slice(1).map((p) => `L ${p.x} ${p.yBal}`).join(' ');
                      const wealthAreaD = `${wealthPathD} L ${points[points.length - 1].x} ${chartBottom} L ${points[0].x} ${chartBottom} Z`;

                      const investedPathD = `M ${points[0].x} ${points[0].yInv} ` + points.slice(1).map((p) => `L ${p.x} ${p.yInv}`).join(' ');
                      const investedAreaD = `${investedPathD} L ${points[points.length - 1].x} ${chartBottom} L ${points[0].x} ${chartBottom} Z`;

                      const activePoint = hoveredYear !== null ? points.find((p) => p.row.year === hoveredYear) || points[points.length - 1] : null;

                      return (
                        <>
                          {/* Areas */}
                          <path d={wealthAreaD} fill={`url(#${idPrefix}-wealthGrad)`} />
                          <path d={investedAreaD} fill={`url(#${idPrefix}-investedGrad)`} />

                          {/* Lines */}
                          <path d={investedPathD} fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                          <path d={wealthPathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

                          {/* Interactive invisible hover columns */}
                          {points.map((p) => (
                            <rect
                              key={p.row.year}
                              x={p.x - chartWidth / (points.length * 2)}
                              y={chartTop}
                              width={chartWidth / points.length}
                              height={chartHeight + 20}
                              fill="transparent"
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredYear(p.row.year)}
                              onMouseLeave={() => setHoveredYear(null)}
                            />
                          ))}

                          {/* Active hover indicator */}
                          {activePoint && (
                            <g>
                              <line
                                x1={activePoint.x}
                                y1={chartTop}
                                x2={activePoint.x}
                                y2={chartBottom}
                                stroke="#10b981"
                                strokeWidth="1.5"
                                strokeDasharray="2 2"
                              />
                              <circle cx={activePoint.x} cy={activePoint.yInv} r="3.5" fill="#94a3b8" stroke="#fff" strokeWidth="1.5" />
                              <circle cx={activePoint.x} cy={activePoint.yBal} r="4.5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                            </g>
                          )}

                          {/* X Axis labels */}
                          <text x={chartLeft} y={chartBottom + 16} fontSize="10" fill="currentColor" fillOpacity="0.5" textAnchor="start">
                            Yr 1
                          </text>
                          {sched.length > 3 && (
                            <text x={(chartLeft + chartRight) / 2} y={chartBottom + 16} fontSize="10" fill="currentColor" fillOpacity="0.5" textAnchor="middle">
                              Yr {Math.round(sched.length / 2)}
                            </text>
                          )}
                          <text x={chartRight} y={chartBottom + 16} fontSize="10" fill="currentColor" fillOpacity="0.5" textAnchor="end">
                            Yr {sched.length}
                          </text>
                        </>
                      );
                    })()}
                  </svg>
                </div>

                {/* Scrubber Tooltip Summary */}
                {hoveredYear !== null && calculations.schedule[hoveredYear - 1] && (
                  <div className="mt-2 pt-2 border-t border-emerald-500/10 flex justify-between items-center text-xs animate-fadeIn">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Year {hoveredYear} Horizon:
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      Invested:{' '}
                      <strong className="text-slate-900 dark:text-white">
                        {formatCurrency(
                          calculations.schedule.slice(0, hoveredYear).reduce((acc, r) => acc + r.contributions, 0),
                          currency.code
                        )}
                      </strong>{' '}
                      · Value:{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(calculations.schedule[hoveredYear - 1].endingBalance, currency.code)}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Detailed Accounting Breakdown */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Total Capital Invested</span>
                  <strong className="text-slate-900 dark:text-white">{formatCurrency(calculations.totalInvested, currency.code)}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Gross Market Growth</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    +{formatCurrency(calculations.grossGrowth, currency.code)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Total Deductions (Fees &amp; Taxes)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-300">
                    -{formatCurrency(calculations.totalFees + calculations.totalTaxes, currency.code)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 border-t border-emerald-200/50 dark:border-emerald-800/40 pt-2 font-bold">
                  <span className="text-emerald-900 dark:text-emerald-300">Estimated Net Gain</span>
                  <span className={calculations.netGain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                    {calculations.netGain >= 0 ? '+' : ''}{formatCurrency(calculations.netGain, currency.code)} ({formatPercent(calculations.returnPercent)})
                  </span>
                </div>
              </div>

              {/* KPI Mini Badges */}
              <div className="mt-5 pt-4 border-t border-emerald-200/70 dark:border-emerald-800/50 grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white/70 dark:bg-slate-900/60 rounded-xl p-3 border border-emerald-500/10">
                  <div className="text-slate-500 dark:text-slate-400 font-medium">Wealth Multiplier</div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                    {calculations.multiple.toFixed(2)}×
                  </div>
                </div>
                <div className="bg-white/70 dark:bg-slate-900/60 rounded-xl p-3 border border-emerald-500/10">
                  <div className="text-slate-500 dark:text-slate-400 font-medium">Ending Annual Contribution</div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                    {formatCurrency(calculations.endingAnnualContribution, currency.code)}
                  </div>
                </div>
              </div>

              {/* Toggleable Details Note */}
              <button
                type="button"
                onClick={() => setShowDetails((v) => !v)}
                className="mt-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline text-left inline-flex items-center gap-1"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{showDetails ? 'Hide calculation details' : 'Show calculation details'}</span>
              </button>

              {showDetails && (
                <div className="mt-3 rounded-xl bg-white/70 dark:bg-slate-900/60 p-4 text-xs text-slate-600 dark:text-slate-400 space-y-2 border border-emerald-500/15">
                  <p>
                    <strong className="text-slate-900 dark:text-white">Timing Convention:</strong> Contributions are processed at the <strong>{contributionTiming === 'beginning' ? 'beginning' : 'end'}</strong> of each {frequency} interval.
                  </p>
                  <p>
                    <strong className="text-slate-900 dark:text-white">Rate Convention:</strong> Annual expected return modeled under <strong>{rateBasis === 'effective' ? 'effective compounding' : 'nominal periodic division'}</strong>.
                  </p>
                  {calculations.totalTaxes > 0 && (
                    <p>
                      <strong className="text-slate-900 dark:text-white">Taxation:</strong> Capital gains tax of {formatCurrency(calculations.totalTaxes, currency.code)} applied to net profits above cost basis at maturity.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Goal Planner Module */}
      <div className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xs">
        <button
          type="button"
          aria-expanded={showGoalPlanner}
          onClick={() => setShowGoalPlanner((v) => !v)}
          className="w-full px-6 py-4 flex items-center justify-between text-left bg-gray-50/80 dark:bg-slate-950/60 hover:bg-gray-100/80 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Goal Planner &amp; Reverse Solver</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Work backwards from a target financial milestone to determine the required contribution.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700">
            {showGoalPlanner ? 'Hide' : 'Open Solver'}
          </span>
        </button>

        {showGoalPlanner && (
          <div className="p-6 border-t border-gray-200 dark:border-slate-800 space-y-4">
            <div>
              <label htmlFor={`${idPrefix}-goal-amount`} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Target Wealth Goal Amount
              </label>
              <div className="flex items-stretch w-full max-w-md bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500">
                <span className="shrink-0 flex items-center px-4 text-slate-500 dark:text-slate-400 font-semibold border-r border-gray-200 dark:border-slate-700 select-none">
                  {currency.symbol}
                </span>
                <input
                  id={`${idPrefix}-goal-amount`}
                  type="number"
                  inputMode="decimal"
                  autoComplete="off"
                  min="1"
                  step="any"
                  value={goalAmount}
                  placeholder="e.g. 250000"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setGoalAmount(e.target.value)}
                  className="min-w-0 flex-1 px-4 py-3 bg-transparent focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {!hasGoalInputs ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your investment duration, expected return rate, and target amount above to solve for the required contribution.
              </p>
            ) : goalPlan && goalPlan.reachable ? (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 p-5 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  Required {mode === 'sip' ? `${goalPlan.frequencyLabel} investment` : 'one-time lump sum'} to reach target:
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(goalPlan.requiredContribution, currency.code)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                  Projected achievement under entered parameters: <strong>{formatCurrency(goalPlan.projectedValue, currency.code)}</strong> (Reconciled target: {formatCurrency(goalPlan.target, currency.code)}).
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 p-4 text-xs text-amber-800 dark:text-amber-300">
                Goal is not reachable under current parameters (e.g. negative net compounding or target beyond supported bounds).
              </div>
            )}
          </div>
        )}
      </div>

      {/* Monte Carlo Risk Range Module */}
      <div className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xs">
        <button
          type="button"
          aria-expanded={showMonteCarlo}
          onClick={() => setShowMonteCarlo((v) => !v)}
          className="w-full px-6 py-4 flex items-center justify-between text-left bg-gray-50/80 dark:bg-slate-950/60 hover:bg-gray-100/80 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Monte Carlo Stochastic Risk Range</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Stress-test the investment across 3,000 randomized annual return pathways.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700">
            {showMonteCarlo ? 'Hide' : 'Open Simulation'}
          </span>
        </button>

        {showMonteCarlo && (
          <div className="p-6 border-t border-gray-200 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end max-w-lg">
              <div>
                <label htmlFor={`${idPrefix}-volatility`} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Assumed Annual Volatility (Standard Deviation %)
                </label>
                <input
                  id={`${idPrefix}-volatility`}
                  type="number"
                  inputMode="decimal"
                  autoComplete="off"
                  min="0.1"
                  max="100"
                  step="0.5"
                  value={monteCarloVolatility}
                  placeholder="e.g. 15"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setMonteCarloVolatility(e.target.value);
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
              <div className="flex items-center px-4 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs font-bold text-purple-700 dark:text-purple-300">
                Live 3,000 Paths Calculated
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              <strong>Illustrative Monte Carlo Simulation:</strong> Models return volatility using lognormal geometric Brownian motion across 3,000 seeded deterministic paths. This is an educational stress test, not a guaranteed forecast or regulated portfolio model.
            </p>

            {monteCarloResult && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3">
                <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-950/40 p-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">10th Percentile</div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-1">
                    {formatCurrency(monteCarloResult.p10, currency.code)}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-950/40 p-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">25th Percentile</div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-1">
                    {formatCurrency(monteCarloResult.p25, currency.code)}
                  </div>
                </div>
                <div className="rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/60 dark:bg-purple-950/30 p-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">Median (50th)</div>
                  <div className="text-sm sm:text-base font-extrabold text-purple-700 dark:text-purple-400 mt-1">
                    {formatCurrency(monteCarloResult.p50, currency.code)}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-950/40 p-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">75th Percentile</div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-1">
                    {formatCurrency(monteCarloResult.p75, currency.code)}
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">90th Percentile</div>
                  <div className="text-sm sm:text-base font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                    {formatCurrency(monteCarloResult.p90, currency.code)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SIP vs Lump Sum Strategy Comparison */}
      {comparison && (
        <div className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden p-6 space-y-4 shadow-xs">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Strategy Comparison: SIP vs. Day-1 Lump Sum</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Evaluates dollar-cost averaging versus investing the exact same cumulative capital upfront at inception.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">SIP Strategy (Dollar-Cost Averaged)</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                {formatCurrency(comparison.sipValue, currency.code)}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-950/40 p-4">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Upfront Lump Sum (Full Capital Day 1)</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(comparison.sameCapitalLumpSum, currency.code)}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Timing delta: <strong>{comparison.difference >= 0 ? '+' : ''}{formatCurrency(comparison.difference, currency.code)}</strong>. When market returns are positive, upfront capital earns returns for the entire holding period, while dollar-cost averaging reduces timing risk during market downturns.
          </p>
        </div>
      )}

      {/* Scenario Sensitivity Matrix */}
      <div className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xs">
        <button
          type="button"
          aria-expanded={showScenario}
          onClick={() => setShowScenario((v) => !v)}
          className="w-full px-6 py-4 flex items-center justify-between text-left bg-gray-50/80 dark:bg-slate-950/60 hover:bg-gray-100/80 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Scenario Sensitivity Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compare final wealth projections under lower, base, and higher return assumptions.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700">
            {showScenario ? 'Hide' : 'Show Scenarios'}
          </span>
        </button>

        {showScenario && (
          <div className="p-6 border-t border-gray-200 dark:border-slate-800">
            {!hasRequiredInputs ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your investment parameters above to generate scenario projections.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scenarios.map((sc) => (
                  <div
                    key={sc.label}
                    className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-950/40 p-4 space-y-1.5"
                  >
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{sc.label}</div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{formatPercent(sc.rate)} Return p.a.</div>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 pt-1">
                      {formatCurrency(sc.value, currency.code)}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Net Gain: {formatCurrency(sc.gain, currency.code)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Year-by-Year Reconciled Accounting Table */}
      <div className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-gray-50/80 dark:bg-slate-950/60 border-b border-gray-200 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Year-by-Year Accounting Reconciliation Schedule</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Audit starting balance, annual contributions, gross market growth, fee deductions, and taxes.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowSchedule((v) => !v)}
              className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              {showSchedule ? 'Hide Table' : 'Show Table'}
            </button>
            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={!hasRequiredInputs}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadReport}
              disabled={!hasRequiredInputs}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Full Report</span>
            </button>
          </div>
        </div>

        {showSchedule && (
          <div className="overflow-x-auto max-w-full">
            <table className="min-w-full text-xs text-left" aria-label="Year-by-year investment schedule">
              <thead className="bg-gray-100/70 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-gray-200 dark:border-slate-800">
                <tr className="h-10">
                  <th scope="col" className="px-4 py-2.5 whitespace-nowrap text-center align-middle font-bold leading-tight">Year</th>
                  <th scope="col" className="px-4 py-2.5 whitespace-nowrap text-center align-middle font-bold leading-tight">Start Balance</th>
                  <th scope="col" className="px-4 py-2.5 whitespace-nowrap text-center align-middle font-bold leading-tight">Contributions</th>
                  <th scope="col" className="px-4 py-2.5 whitespace-nowrap text-center align-middle font-bold leading-tight">Gross Growth</th>
                  <th scope="col" className="px-4 py-2.5 whitespace-nowrap text-center align-middle font-bold leading-tight">Total Fees</th>
                  <th scope="col" className="px-4 py-2.5 whitespace-nowrap text-center align-middle font-bold leading-tight">Taxes</th>
                  <th scope="col" className="px-4 py-2.5 whitespace-nowrap text-center align-middle font-bold leading-tight">Ending Balance</th>
                  <th scope="col" className="px-4 py-2.5 whitespace-nowrap text-center align-middle font-bold leading-tight">Net Gain</th>
                  <th scope="col" className="px-4 py-2.5 whitespace-nowrap text-center align-middle font-bold leading-tight">Purchasing Power</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
                {!hasRequiredInputs || !calculations ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                      Enter investment amount and return rate above to generate the reconciled yearly schedule.
                    </td>
                  </tr>
                ) : (
                  calculations.schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50/60 dark:hover:bg-slate-850 transition-colors h-10">
                      <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white text-center whitespace-nowrap align-middle">{row.year}</td>
                      <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap align-middle">{formatCurrency(row.startingBalance, currency.code)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-900 dark:text-white whitespace-nowrap align-middle">{formatCurrency(row.contributions, currency.code)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap align-middle">+{formatCurrency(row.grossGrowth, currency.code)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap align-middle">
                        {row.contributionFees + row.managementFees > 0 ? `-${formatCurrency(row.contributionFees + row.managementFees, currency.code)}` : '0'}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap align-middle">
                        {row.taxes > 0 ? `-${formatCurrency(row.taxes, currency.code)}` : '0'}
                      </td>
                      <td className="px-4 py-2.5 text-right font-black text-slate-900 dark:text-white whitespace-nowrap align-middle">{formatCurrency(row.endingBalance, currency.code)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap align-middle">{formatCurrency(row.netGain, currency.code)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400 whitespace-nowrap align-middle">{formatCurrency(row.inflationAdjustedValue, currency.code)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Methodology & Financial Audit Disclosure Panel */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-4 shadow-xs">
        <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Calculation Methodology, Accounting Assumptions &amp; Disclosures</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 leading-relaxed">
          <div>
            <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1">1. Compounding &amp; Rate Semantics</h5>
            <p>
              In Nominal (APR) mode, annual return is divided equally across compounding periods: r_period = r / m. In Effective (APY) mode, periodic rate is geometrically derived: r_period = (1 + r)^(1/m) - 1.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1">2. Contribution Timing Conventions</h5>
            <p>
              Under Beginning-of-period (Annuity Due), contributions enter prior to periodic market compounding. Under End-of-period (Ordinary Annuity), contributions enter after compounding.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1">3. Management &amp; Contribution Fee Order</h5>
            <p>
              Entry fees are deducted from gross cash payments. Ongoing management fees are converted into an equivalent per-period charge: f_period = 1 - (1 - F)^(1/m) deducted from end-of-period asset value.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1">4. Simplified Tax-on-Gains Model</h5>
            <p>
              Capital gains tax is modeled as a lump-sum deduction upon maturity against nominal gains exceeding net principal. This simplified model is for estimation only and does not constitute tax advisory.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <strong>Statutory Disclaimer:</strong> This calculator provides mathematical projections based on assumptions you specify. Actual investment returns, mutual fund fees, tax regulations, and inflation fluctuate with market conditions. Past performance is no guarantee of future results. Not intended as financial or investment advice.
        </div>
      </div>
    </div>
  );
}
