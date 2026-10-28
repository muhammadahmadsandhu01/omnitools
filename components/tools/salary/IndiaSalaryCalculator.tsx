'use client';

import { useState, useId, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  ChevronLeft,
  Info,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import {
  TaxBracket,
  calculateProgressiveTax,
  TaxBracketAudit,
  IndiaTaxRegime,
  formatCurrency,
  formatPercent,
  FREQUENCY_FACTORS,
  PayFrequency
} from '@/components/tools/SalaryCalculator';
import {
  SalaryPresetBar,
  SalaryInsightsAndExportSuite,
} from '@/components/tools/salary/shared/SalaryAnalysisToolbar';

/* =========================================================================
   INDIA STATUTORY SALARY CALCULATOR ENGINE
   Authority: Income Tax Department of India (CBDT)
   Ruleset: IN-CBDT-2026.2
   ========================================================================= */

export const METADATA = {
  "code": "IN",
  "iso3": "IND",
  "name": "India",
  "flag": "🇮🇳",
  "currency": "INR",
  "symbol": "₹",
  "decimals": 2,
  "status": "VERIFIED",
  "statusLabel": "Verified Statutory",
  "freshness": "CURRENT",
  "defaultTaxYear": "FY 2025-2026 (AY 2026-2027)",
  "supportedTaxYears": [
    "FY 2025-2026 (AY 2026-2027)",
    "FY 2024-2025 (AY 2025-2026)"
  ],
  "hasRegions": false,
  "rulesetId": "IN-CBDT-2026.2",
  "ruleVersion": "Finance (No. 2) Act 2024 (Enacted AY 2025-26); Union Budget 2025 (Projected AY 2026-27)",
  "lastVerifiedDate": "2026-10-10",
  "sourceAuthority": "Income Tax Department of India (CBDT)",
  "sources": [
    {
      "authority": "Income Tax Department / CBDT",
      "title": "e-Filing Individual Tax Rates & Slabs under Section 115BAC",
      "url": "https://www.incometax.gov.in/iec/fportal/",
      "sourceType": "TAX_AUTHORITY",
      "publicationDate": "2025-02-01",
      "effectiveDate": "2025-04-01",
      "lastVerifiedDate": "2026-10-10"
    },
    {
      "authority": "Ministry of Finance / CBDT",
      "title": "The Gazette of India: Finance (No. 2) Act, 2024 (Section 115BAC Revised Slabs)",
      "url": "https://incometaxindia.gov.in",
      "sourceType": "LEGISLATION",
      "publicationDate": "2024-07-23",
      "effectiveDate": "2024-07-23",
      "lastVerifiedDate": "2026-10-10"
    }
  ],
  "calculationScope": "Enacted Law: AY 2025-26 governed by The Gazette of India: Finance (No. 2) Act, 2024 (Act No. 15 of 2024) with ₹75,000 standard deduction, Section 87A rebate and marginal relief up to ₹7 Lakhs, 6 revised slabs (0%–30%), and 4% Health & Education Cess. Forward Projection: AY 2026-27 models proposed Union Budget 2025 revisions (7 slabs 0%–30%, ₹12 Lakh Section 87A rebate threshold with marginal relief, ₹75,000 standard deduction). Old Regime remains unchanged.",
  "knownExclusions": [
    "House Rent Allowance (HRA) exemption under Old Regime",
    "Section 80D health insurance premium deductions",
    "Chapter VI-A deductions other than standard 80C/80D under Old Regime"
  ],
  "disclaimerNote": "Enacted legislation applies to AY 2025-26 (Finance (No. 2) Act, 2024: 6 slabs, ₹7L rebate threshold, ₹75k standard deduction). AY 2026-27 is a forward projection incorporating Union Budget 2025 proposals (7 slabs, ₹12L rebate threshold). Calculations do not constitute formal tax advice or filing verification.",
  "popular": true
};

// 5. India New Tax Regime (Section 115BAC)
// AY 2026-27: Finance Act 2025 (Budget 2025) — revised 7-slab structure, Section 87A rebate up to ₹12L
// AY 2025-26: Finance (No. 2) Act 2024 — 6-slab structure, Section 87A rebate up to ₹7L
export function calculateIndiaTax(
  grossTaxableAnnual: number,
  regime: IndiaTaxRegime = 'new',
  taxYear = 'FY 2025-2026 (AY 2026-2027)'
): {
  incomeTax: number;
  cess: number;
  totalTax: number;
  standardDeduction: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  // Standard deduction: ₹75,000 for new regime (both AYs); ₹50,000 for old regime
  const standardDeduction = regime === 'new' ? 75000 : 50000;
  const taxableIncome = Math.max(0, grossTaxableAnnual - standardDeduction);

  const isAY2627 = taxYear === 'FY 2025-2026 (AY 2026-2027)';

  let indiaBrackets: TaxBracket[];
  if (regime === 'new') {
    if (isAY2627) {
      // Finance Act 2025 (Budget 2025) — New Tax Regime slabs effective AY 2026-27
      // Source: Ministry of Finance, Union Budget 2025, Section 115BAC
      indiaBrackets = [
        { min: 0, max: 400000, rate: 0.0, baseTax: 0 },
        { min: 400000, max: 800000, rate: 0.05, baseTax: 0 },
        { min: 800000, max: 1200000, rate: 0.10, baseTax: 20000 },
        { min: 1200000, max: 1600000, rate: 0.15, baseTax: 60000 },
        { min: 1600000, max: 2000000, rate: 0.20, baseTax: 120000 },
        { min: 2000000, max: 2400000, rate: 0.25, baseTax: 200000 },
        { min: 2400000, max: null, rate: 0.30, baseTax: 300000 },
      ];
    } else {
      // Finance (No. 2) Act 2024 (Budget 2024) — New Tax Regime slabs effective AY 2025-26
      indiaBrackets = [
        { min: 0, max: 300000, rate: 0.0, baseTax: 0 },
        { min: 300000, max: 700000, rate: 0.05, baseTax: 0 },
        { min: 700000, max: 1000000, rate: 0.10, baseTax: 20000 },
        { min: 1000000, max: 1200000, rate: 0.15, baseTax: 50000 },
        { min: 1200000, max: 1500000, rate: 0.20, baseTax: 80000 },
        { min: 1500000, max: null, rate: 0.30, baseTax: 140000 },
      ];
    }
  } else {
    // Old Regime: unchanged for both AY 2025-26 and AY 2026-27 (no change in Budget 2025)
    indiaBrackets = [
      { min: 0, max: 250000, rate: 0.0, baseTax: 0 },
      { min: 250000, max: 500000, rate: 0.05, baseTax: 0 },
      { min: 500000, max: 1000000, rate: 0.20, baseTax: 12500 },
      { min: 1000000, max: null, rate: 0.30, baseTax: 112500 },
    ];
  }

  const taxCalc = calculateProgressiveTax(taxableIncome, indiaBrackets);
  let baseTax = taxCalc.totalTax;
  const { audits, marginalRate } = taxCalc;

  // Section 87A Rebate & Marginal Relief:
  // AY 2026-27 New Regime: full rebate for taxable income ≤ ₹12,00,000 (Finance Act 2025).
  // Marginal relief: For income exceeding ₹12,00,000, tax payable shall not exceed the amount by which total income exceeds ₹12,00,000 (Section 87A proviso).
  // AY 2025-26 New Regime: full rebate for taxable income ≤ ₹7,00,000; marginal relief caps tax at excess over ₹7,00,000.
  // Old Regime (both AYs): full rebate for taxable income ≤ ₹5,00,000.
  if (regime === 'new') {
    const rebateThreshold = isAY2627 ? 1200000 : 700000;
    if (taxableIncome <= rebateThreshold) {
      baseTax = 0;
    } else {
      const excessIncome = taxableIncome - rebateThreshold;
      if (baseTax > excessIncome) {
        baseTax = excessIncome; // Section 87A Marginal Relief
      }
    }
  } else if (regime === 'old' && taxableIncome <= 500000) {
    baseTax = 0;
  }

  const cess = baseTax * 0.04;
  const totalTax = baseTax + cess;

  return {
    incomeTax: baseTax,
    cess,
    totalTax,
    standardDeduction,
    audits,
    marginalRate: marginalRate * 1.04,
  };
}

export default function IndiaSalaryCalculator() {
  const formId = useId();

  // Fresh initial state (Zero-Prefill)
  const [grossSalaryInput, setGrossSalaryInput] = useState<string>('');
  const [frequency, setFrequency] = useState<PayFrequency>('annual');
  const [preTaxDeductionInput, setPreTaxDeductionInput] = useState<string>('');
  const [taxYear, setTaxYear] = useState<string>(METADATA.defaultTaxYear);
  const [regime, setRegime] = useState<IndiaTaxRegime>('new');

  const parsedGross = useMemo(() => {
    const cleaned = grossSalaryInput.replace(/[^0-9.]/g, '');
    const val = parseFloat(cleaned);
    return isNaN(val) || val < 0 ? 0 : val;
  }, [grossSalaryInput]);

  const parsedPreTax = useMemo(() => {
    const cleaned = preTaxDeductionInput.replace(/[^0-9.]/g, '');
    const val = parseFloat(cleaned);
    return isNaN(val) || val < 0 ? 0 : val;
  }, [preTaxDeductionInput]);

  const periodsPerYear = FREQUENCY_FACTORS[frequency]?.periodsPerYear || 1;
  const annualGross = parsedGross * periodsPerYear;

  const result = useMemo(() => {
    if (annualGross <= 0) return null;
    const effectivePreTax = Math.min(annualGross, parsedPreTax);
    const taxableGrossAfterPreTax = Math.max(0, annualGross - effectivePreTax);

    const res = calculateIndiaTax(taxableGrossAfterPreTax, regime, taxYear);
    const newRegimeRes = calculateIndiaTax(taxableGrossAfterPreTax, 'new', taxYear);
    const oldRegimeRes = calculateIndiaTax(taxableGrossAfterPreTax, 'old', taxYear);
    const annualIncomeTax = res.totalTax;
    const annualEmployeeSocial = 0;
    const annualTotalDeductions = annualIncomeTax + effectivePreTax;
    const annualNet = Math.max(0, annualGross - annualTotalDeductions);
    const annualEmployerSocial = 0;
    const annualEmployerCost = annualGross;
    const audits = res.audits;
    const marginalRate = res.marginalRate;

    const periodGross = annualGross / periodsPerYear;
    const periodTax = annualIncomeTax / periodsPerYear;
    const periodEmployeeSocial = annualEmployeeSocial / periodsPerYear;
    const periodNet = annualNet / periodsPerYear;
    const periodEmployerCost = annualEmployerCost / periodsPerYear;

    const effectiveTaxRate = (annualIncomeTax / annualGross) * 100;
    const effectiveTotalRate = (annualTotalDeductions / annualGross) * 100;

    return {
      annualGross,
      annualPreTaxDeductions: effectivePreTax,
      annualIncomeTax,
      annualEmployeeSocial,
      annualTotalDeductions,
      annualNet,
      annualEmployerSocial,
      annualEmployerCost,
      periodGross,
      periodTax,
      periodEmployeeSocial,
      periodNet,
      periodEmployerCost,
      effectiveTaxRate,
      effectiveTotalRate,
      marginalRate,
      audits,
      rawRes: res,
      newRegimeTax: newRegimeRes.totalTax,
      oldRegimeTax: oldRegimeRes.totalTax
    };
  }, [annualGross, periodsPerYear, taxYear, regime, parsedPreTax]);

  return (
    <div className="w-full space-y-8">
      {/* Back Link */}
      <nav aria-label="Back to Directory">
        <Link
          href="/finance/salary-calculator"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Country Directory</span>
        </Link>
      </nav>

      {/* Header */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-4xl select-none" role="img" aria-label="India Flag">
            {METADATA.flag}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                India Salary &amp; Take-Home Calculator
              </h2>
              {METADATA.status === 'VERIFIED' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
                  <Info className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>Limited</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Calculate net pay, statutory withholding, and employer payroll cost for India ({taxYear}).
            </p>
          </div>
        </div>
      </header>

      {/* Statutory Metadata Context Box */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-medium">
          <div>
            <span className="text-slate-400 block text-[11px]">Authority</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{METADATA.sourceAuthority}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Ruleset</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{METADATA.rulesetId}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Tax Year</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{taxYear}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Last Verified</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{METADATA.lastVerifiedDate}</span>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] leading-relaxed">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Statutory Scope: </span>
          {METADATA.calculationScope}
        </div>
      </div>

      {/* Statutory Status Notice Banner */}
      {taxYear === 'FY 2025-2026 (AY 2026-2027)' ? (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Budget 2025 Forward Projection Notice:</span> The calculation for FY 2025–26 (AY 2026–27) is a forward projection modeling the proposed 7-slab structure and ₹12,00,000 Section 87A rebate announced in the Union Budget 2025 speech. The currently enacted statutory legislation published in <em>The Gazette of India</em> is <strong>Finance (No. 2) Act, 2024</strong> (Act No. 15 of 2024, applicable to AY 2025–26 with 6 slabs and a ₹7,00,000 rebate threshold). Select &quot;FY 2024-2025 (AY 2025-2026)&quot; to view fully enacted statutory rules.
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Enacted Statutory Rules:</span> FY 2024–25 (AY 2025–26) is fully verified against <em>The Gazette of India: Finance (No. 2) Act, 2024</em> (Act No. 15 of 2024, Section 115BAC), featuring ₹75,000 standard deduction, 6 revised slabs (0%–30%), and Section 87A rebate up to ₹7,00,000 with statutory marginal relief.
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Gross Salary */}
          <div className="space-y-1.5 lg:col-span-2">
            <label htmlFor={`${formId}-salary`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Gross Salary ({METADATA.currency})
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-bold text-slate-400 select-none">
                {METADATA.symbol}
              </span>
              <input
                id={`${formId}-salary`}
                type="text"
                inputMode="numeric"
                value={grossSalaryInput}
                onChange={(e) => setGrossSalaryInput(e.target.value)}
                placeholder="e.g. 50,000"
                className={`w-full ${METADATA.symbol.length > 2 ? 'pl-14' : 'pl-11'} pr-4 py-3 bg-gray-50/70 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-base font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all tabular-nums`}
              />
            </div>
          </div>

          {/* Tax Year */}
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-year`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tax Year
            </label>
            <select
              id={`${formId}-year`}
              value={taxYear}
              onChange={(e) => setTaxYear(e.target.value)}
              className="w-full py-3 px-3 bg-gray-50/70 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {METADATA.supportedTaxYears.map((yr: string) => (
                <option key={yr} value={yr}>
                  {yr} {yr === METADATA.defaultTaxYear ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Tax Regime */}
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-regime`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tax Regime (IT Act)
            </label>
            <select
              id={`${formId}-regime`}
              value={regime}
              onChange={(e) => setRegime(e.target.value as IndiaTaxRegime)}
              className="w-full py-3 px-3 bg-gray-50/70 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="new">New Regime (Section 115BAC - Default)</option>
              <option value="old">Old Regime (Standard Slab System)</option>
            </select>
          </div>
        </div>

        {/* Pay Frequency Buttons */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Pay Frequency
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {(['annual', 'monthly', 'biweekly', 'weekly', 'daily', 'hourly'] as PayFrequency[]).map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => {
                  if (freq !== frequency) {
                    if (parsedGross > 0) {
                      const currentAnnual = parsedGross * (FREQUENCY_FACTORS[frequency]?.periodsPerYear || 1);
                      const nextPeriods = FREQUENCY_FACTORS[freq]?.periodsPerYear || 1;
                      const converted = currentAnnual / nextPeriods;
                      setGrossSalaryInput(String(Math.round(converted * 100) / 100));
                    }
                    setFrequency(freq);
                  }
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all border ${
                  frequency === freq
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-gray-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {freq.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Salary Presets & Pre-Tax Deduction Drawer */}
        <SalaryPresetBar
          currency={METADATA.currency}
          symbol={METADATA.symbol}
          presets={[{"label":"₹8,00,000 / yr","amount":"800000","freq":"annual"},{"label":"₹12,00,000 / yr","amount":"1200000","freq":"annual"},{"label":"₹18,00,000 / yr","amount":"1800000","freq":"annual"},{"label":"₹25,00,000 / yr","amount":"2500000","freq":"annual"},{"label":"₹1,00,000 / mo","amount":"100000","freq":"monthly"}]}
          onSelectPreset={(amt, freq) => {
            setGrossSalaryInput(amt);
            if (freq) setFrequency(freq);
          }}
          preTaxDeductionInput={preTaxDeductionInput}
          onPreTaxDeductionChange={setPreTaxDeductionInput}
          preTaxDeductionLabel="Annual Section 80C / 80CCD(1B) NPS / EPF / HRA Tax-Exempt Deductions"
          preTaxDeductionHint="Enter Chapter VI-A (80C/80D/NPS) or employer NPS (80CCD(2)) deductions to reduce taxable income."
        />
      </div>

      {/* Results Section */}
      {result ? (
        <div className="space-y-6">
          {/* Hero Result Card: Net Take-Home Pay */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/15 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-blue-100">
                  Estimated Take-Home Pay ({frequency})
                </span>
                <div className="text-3xl sm:text-5xl font-extrabold tracking-tight tabular-nums mt-1">
                  {formatCurrency(result.periodNet, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                </div>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-blue-100 block">Annual Net Salary</span>
                <span className="text-xl sm:text-2xl font-bold tabular-nums">
                  {formatCurrency(result.annualNet, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div>
                <span className="text-[11px] text-blue-100 block">Gross ({frequency})</span>
                <span className="text-sm sm:text-base font-bold tabular-nums">
                  {formatCurrency(result.periodGross, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-blue-100 block">Income Tax</span>
                <span className="text-sm sm:text-base font-bold tabular-nums">
                  {formatCurrency(result.periodTax, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-blue-100 block">Social Contributions</span>
                <span className="text-sm sm:text-base font-bold tabular-nums">
                  {formatCurrency(result.periodEmployeeSocial, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-blue-100 block">Take-Home %</span>
                <span className="text-sm sm:text-base font-bold tabular-nums">
                  {formatPercent((result.annualNet / result.annualGross) * 100)}
                </span>
              </div>
            </div>
          </div>

          
          {/* New Regime vs Old Regime Instant Comparison Banner */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-emerald-200 dark:border-emerald-900/50 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Section 115BAC New Regime vs. Old Regime Tax Comparison ({taxYear})
              </h3>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {result.newRegimeTax <= result.oldRegimeTax
                  ? `New Regime saves ₹${Math.round(result.oldRegimeTax - result.newRegimeTax).toLocaleString('en-IN')}/yr`
                  : `Old Regime saves ₹${Math.round(result.newRegimeTax - result.oldRegimeTax).toLocaleString('en-IN')}/yr`}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setRegime('new')}
                className={`text-left p-3.5 rounded-2xl border transition-all ${
                  regime === 'new'
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-600'
                    : 'border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/40'
                }`}
              >
                <div className="font-bold text-slate-900 dark:text-white flex justify-between">
                  <span>New Tax Regime (Section 115BAC)</span>
                  {regime === 'new' && <span className="text-[10px] uppercase text-blue-600 dark:text-blue-400">Selected</span>}
                </div>
                <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(result.newRegimeTax, METADATA.currency, METADATA.symbol, 0)} / yr tax
                </div>
                <div className="text-[11px] text-slate-500">
                  Net Monthly: {formatCurrency((result.annualGross - result.newRegimeTax - result.annualPreTaxDeductions) / 12, METADATA.currency, METADATA.symbol, 0)}/mo (Std Ded: ₹75,000)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRegime('old')}
                className={`text-left p-3.5 rounded-2xl border transition-all ${
                  regime === 'old'
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-600'
                    : 'border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/40'
                }`}
              >
                <div className="font-bold text-slate-900 dark:text-white flex justify-between">
                  <span>Old Tax Regime (4 Slabs)</span>
                  {regime === 'old' && <span className="text-[10px] uppercase text-blue-600 dark:text-blue-400">Selected</span>}
                </div>
                <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(result.oldRegimeTax, METADATA.currency, METADATA.symbol, 0)} / yr tax
                </div>
                <div className="text-[11px] text-slate-500">
                  Net Monthly: {formatCurrency((result.annualGross - result.oldRegimeTax - result.annualPreTaxDeductions) / 12, METADATA.currency, METADATA.symbol, 0)}/mo (Std Ded: ₹50,000)
                </div>
              </button>
            </div>
          </div>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-gray-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">Effective Tax Rate</span>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatPercent(result.effectiveTaxRate)}
              </div>
              <p className="text-[11px] text-slate-400">Income tax as share of gross</p>
            </div>

            <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-gray-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Statutory Retention</span>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatPercent(result.effectiveTotalRate)}
              </div>
              <p className="text-[11px] text-slate-400">Tax + mandatory social charges</p>
            </div>

            <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-gray-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">Marginal Tax Bracket</span>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatPercent(result.marginalRate)}
              </div>
              <p className="text-[11px] text-slate-400">Applied to your next {METADATA.currency} earned</p>
            </div>
          </div>

          {/* Waterfall Reconciliation Ledger */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Annual Payroll Waterfall Ledger</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  const csvRows = [
                    ["Metric", "Per Period (" + frequency + ")", "Annualized (" + METADATA.currency + ")"],
                    ["Contractual Gross Salary", result.periodGross.toFixed(2), result.annualGross.toFixed(2)],
                    ["Statutory Income Tax", result.periodTax.toFixed(2), result.annualIncomeTax.toFixed(2)],
                    ["Total Deductions", (result.annualTotalDeductions / periodsPerYear).toFixed(2), result.annualTotalDeductions.toFixed(2)],
                    ["Net Take-Home Pay", result.periodNet.toFixed(2), result.annualNet.toFixed(2)],
                    ["Total Employer Cost (CTC)", result.periodEmployerCost.toFixed(2), result.annualEmployerCost.toFixed(2)],
                    ["Effective Tax Rate (%)", result.effectiveTaxRate.toFixed(2) + "%", result.effectiveTotalRate.toFixed(2) + "%"],
                    ["Ruleset ID", METADATA.rulesetId, taxYear],
                  ];
                  const csvContent = csvRows.map((r) => r.map((v) => "\"" + String(v).replace(/"/g, "\"\"") + "\"").join(",")).join("\r\n");
                  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = String(METADATA.name || "salary").toLowerCase().replace(/\s+/g, "-") + "-payslip-" + taxYear + ".csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                Export CSV Payslip
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100 dark:border-slate-800/80">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Gross Contractual Salary</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatCurrency(result.annualGross, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                </span>
              </div>
              {result.annualPreTaxDeductions > 0 && (
                <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
                  <span className="text-slate-600 dark:text-slate-400">Pre-Tax Deductions / Salary Sacrifice</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400 tabular-nums">
                    −{formatCurrency(result.annualPreTaxDeductions, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                  </span>
                </div>
              )}

            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">Total Income Tax (incl. 4% Cess)</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.totalTax, METADATA.currency, METADATA.symbol, METADATA.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">Standard Deduction</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(result.rawRes.standardDeduction, METADATA.currency, METADATA.symbol, METADATA.decimals)}
              </span>
            </div>

              <div className="flex items-center justify-between text-xs py-2 bg-blue-50/50 dark:bg-blue-950/20 px-3 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <span className="font-bold text-blue-900 dark:text-blue-200">= Net Annual Spendable Income</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm tabular-nums">
                  {formatCurrency(result.annualNet, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                </span>
              </div>

              {result.annualEmployerSocial > 0 && (
                <div className="pt-3 border-t border-dashed border-gray-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Employer Social Contributions</span>
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                      +{formatCurrency(result.annualEmployerSocial, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 pt-1">
                    <span>Total Employer Payroll Cost</span>
                    <span className="tabular-nums">
                      {formatCurrency(result.annualEmployerCost, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statutory Tax Bracket Audit */}
          {result.audits && result.audits.length > 0 && (
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Statutory Marginal Bracket Audit
              </h3>
              <div className="overflow-x-auto overscroll-x-contain">
                <table className="min-w-[580px] w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2 pr-2">Tier</th>
                      <th className="py-2 px-2">Income Bracket</th>
                      <th className="py-2 px-2">Rate</th>
                      <th className="py-2 px-2">Taxable in Tier</th>
                      <th className="py-2 pl-2 text-right">Tax in Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                    {result.audits.map((a: TaxBracketAudit, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                        <td className="py-2 pr-2 font-semibold">Tier {a.bracketIndex}</td>
                        <td className="py-2 px-2 tabular-nums">
                          {formatCurrency(a.min, METADATA.currency, METADATA.symbol, 0)}
                          {' – '}
                          {a.max !== null ? formatCurrency(a.max, METADATA.currency, METADATA.symbol, 0) : 'Above'}
                        </td>
                        <td className="py-2 px-2 tabular-nums font-semibold">{formatPercent(a.rate)}</td>
                        <td className="py-2 px-2 tabular-nums">
                          {formatCurrency(a.taxableAmountInBracket, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                        </td>
                        <td className="py-2 pl-2 text-right tabular-nums font-semibold text-rose-600 dark:text-rose-400">
                          {formatCurrency(a.taxForBracket, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Visual Allocation Bar, 7-Period Matrix, CSV/Print Export & Reverse Net-to-Gross Solver */}
          <SalaryInsightsAndExportSuite
            countryName={METADATA.name}
            currency={METADATA.currency}
            symbol={METADATA.symbol}
            decimals={METADATA.decimals}
            taxYear={taxYear}
            rulesetId={METADATA.rulesetId}
            result={{
              annualGross: result.annualGross,
              annualPreTaxDeductions: result.annualPreTaxDeductions,
              annualIncomeTax: result.annualIncomeTax,
              annualEmployeeSocial: result.annualEmployeeSocial,
              annualTotalDeductions: result.annualTotalDeductions,
              annualNet: result.annualNet,
              annualEmployerSocial: result.annualEmployerSocial,
              annualEmployerCost: result.annualEmployerCost,
              effectiveTaxRate: result.effectiveTaxRate,
              effectiveTotalRate: result.effectiveTotalRate,
              marginalRate: result.marginalRate,
            }}
            computeNetFromAnnualGross={(candGross) => {
              const effPre = Math.min(candGross, parsedPreTax);
              const r = calculateIndiaTax(Math.max(0, candGross - effPre), regime, taxYear);
              const tax = r.totalTax;
              const tot = tax + effPre;
              return { annualNet: Math.max(0, candGross - tot), annualIncomeTax: tax, annualEmployeeSocial: 0, annualTotalDeductions: tot, annualEmployerCost: candGross };
            }}
            onApplyRequiredGross={(reqAnnual) => {
              const perPeriod = Math.round(reqAnnual / periodsPerYear);
              setGrossSalaryInput(String(perPeriod));
            }}
          />

          {/* Statutory Exclusions Note */}
          {METADATA.knownExclusions && METADATA.knownExclusions.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Statutory Scope Limitations &amp; Exclusions:
              </span>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                {METADATA.knownExclusions.map((ex: string, i: number) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Privacy Standard Banner */}
          <div className="flex items-center gap-2 p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong>Privacy Standard:</strong> No salary data stored or transmitted. All tax arithmetic runs 100% locally in your browser.
            </span>
          </div>
        </div>
      ) : (
        /* Fresh State Prompt */
        <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800 space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Enter Gross Salary to Compute Net Take-Home
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Enter your contractual pay above to view statutory income tax deductions, social security withholdings, take-home net schedule, and employer contributions.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Privacy Standard · No salary data stored or transmitted</span>
          </div>
        </div>
      )}
    </div>
  );
}
