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
  CH_CANTONS,
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
   SWITZERLAND STATUTORY SALARY CALCULATOR ENGINE
   Authority: Federal Tax Administration (ESTV) & Federal Social Insurance Office (BSV)
   Ruleset: CH-ESTV-2026.1
   ========================================================================= */

export const METADATA = {
  "code": "CH",
  "iso3": "CHE",
  "name": "Switzerland",
  "flag": "🇨🇭",
  "currency": "CHF",
  "symbol": "CHF",
  "decimals": 2,
  "status": "LIMITED",
  "statusLabel": "Federal Statutory + Cantonal Benchmark",
  "freshness": "CURRENT",
  "defaultTaxYear": "2026",
  "supportedTaxYears": [
    "2026",
    "2025"
  ],
  "hasRegions": true,
  "defaultRegion": "ZH",
  "rulesetId": "CH-ESTV-2026.1",
  "ruleVersion": "ESTV Direct Federal Tax (Art. 36 DBG) + Cantonal Benchmark + 1st/2nd Pillar (AHV/ALV/BVG)",
  "lastVerifiedDate": "2026-10-01",
  "sourceAuthority": "Federal Tax Administration (ESTV) & Federal Social Insurance Office (BSV)",
  "sources": [
    {
      "authority": "Federal Tax Administration (ESTV / FTA)",
      "title": "Direct Federal Tax Scales (Tarife der direkten Bundessteuer)",
      "url": "https://www.estv.admin.ch/estv/en/home/direct-federal-tax.html",
      "sourceType": "TAX_AUTHORITY",
      "publicationDate": "2025-11-01",
      "effectiveDate": "2026-01-01",
      "lastVerifiedDate": "2026-10-01"
    },
    {
      "authority": "Federal Social Insurance Office (BSV / FSIO)",
      "title": "Social Security Contribution Rates (AHV/IV/EO & ALV)",
      "url": "https://www.bsv.admin.ch/bsv/en/home/social-insurance/overview.html",
      "sourceType": "STATUTORY_INSTITUTION",
      "publicationDate": "2025-10-01",
      "effectiveDate": "2026-01-01",
      "lastVerifiedDate": "2026-10-01"
    }
  ],
  "calculationScope": "Direct Federal Tax (IFD) progressive brackets: 0% to 11.5% (max rate at CHF 808,600). Cantonal & municipal benchmark tax modeled by canton (Zurich, Bern, Geneva, Zug, etc.) with CHF 10,000 personal deduction. 1st Pillar AHV/IV/EO: 5.30% employee and 5.30% employer (uncapped). ALV: 1.10% each up to CHF 148,200. BVG pension: 4.25% each on coordinated earnings. UVG/FAK statutory insurance.",
  "knownExclusions": [
    "Cantonal & Municipal Tax Benchmark: Cantonal and communal taxes (Staats- und Gemeindesteuern) are modeled using representative cantonal baseline rates (e.g. Zurich 13.5%, Geneva 17.5%, Zug 7.5%) rather than individual municipal tax multiplier (Steuerfuss) scales",
    "Church tax (Kirchensteuer)",
    "Municipal Steuerfuss local variation within selected canton",
    "Voluntary Pillar 3a tax deductions",
    "Specific withholding tax (Quellensteuer) tariff codes A/B/C"
  ],
  "disclaimerNote": "ESTV Federal direct tax and cantonal/communal benchmark with 1st/2nd pillar social security. Annualized take-home estimate.",
  "popular": true
};

// 11. Switzerland (CH) — ESTV Direct Federal Tax (Art. 36 DBG) + Cantonal Benchmark + 1st/2nd Pillar
export function calculateSwitzerlandTax(
  grossTaxableAnnual: number,
  canton = 'ZH',
  _taxYear = '2026'
): {
  federalTax: number;
  cantonalTax: number;
  employeeSocial: number;
  employerSocial: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  void _taxYear;
  if (grossTaxableAnnual <= 0) {
    return {
      federalTax: 0,
      cantonalTax: 0,
      employeeSocial: 0,
      employerSocial: 0,
      audits: [],
      marginalRate: 0,
    };
  }
  // Art. 36 para. 1 DBG Federal Direct Tax tariffs for single taxpayers
  const chFederalBrackets: TaxBracket[] = [
    { min: 0, max: 14500, rate: 0.0, baseTax: 0 },
    { min: 14500, max: 31600, rate: 0.0077, baseTax: 0 },
    { min: 31600, max: 41400, rate: 0.0088, baseTax: 131.67 },
    { min: 41400, max: 55200, rate: 0.0264, baseTax: 217.91 },
    { min: 55200, max: 72500, rate: 0.0297, baseTax: 582.23 },
    { min: 72500, max: 78100, rate: 0.0594, baseTax: 1096.04 },
    { min: 78100, max: 103600, rate: 0.066, baseTax: 1428.68 },
    { min: 103600, max: 134600, rate: 0.088, baseTax: 3111.68 },
    { min: 134600, max: 176000, rate: 0.11, baseTax: 5839.68 },
    { min: 176000, max: 755200, rate: 0.132, baseTax: 10393.68 },
    { min: 755200, max: null, rate: 0.115, baseTax: 86848.08 },
  ];

  const { totalTax: rawFedTax, audits, marginalRate } = calculateProgressiveTax(grossTaxableAnnual, chFederalBrackets);
  // Statutory maximum constitutional ceiling on Direct Federal Tax (Art. 36 para. 1 lit. k DBG: max 11.5%)
  const federalTax = Math.min(rawFedTax, grossTaxableAnnual * 0.115);

  // Cantonal & Municipal Tax Benchmark (after CHF 10,000 standard personal/employment deduction)
  const cantonalRates: Record<string, number> = {
    ZH: 0.135,
    BE: 0.185,
    LU: 0.115,
    ZG: 0.065,
    BS: 0.17,
    GE: 0.19,
    VD: 0.18,
  };
  const cantonalRate = cantonalRates[canton] ?? 0.135;
  const cantonalTaxable = Math.max(0, grossTaxableAnnual - 10000);
  const cantonalTax = cantonalTaxable * cantonalRate;

  // Social Security:
  // 1st Pillar (AHV/IV/EO): 5.30% employee, 5.30% employer (uncapped)
  const ahvEmployee = grossTaxableAnnual * 0.053;
  const ahvEmployer = grossTaxableAnnual * 0.053;

  // ALV (Unemployment Insurance): 1.10% capped at CHF 148,200
  const alvLiableWage = Math.min(grossTaxableAnnual, 148200);
  const alvEmployee = alvLiableWage * 0.011;
  const alvEmployer = alvLiableWage * 0.011;

  // 2nd Pillar (BVG / Occupational Pension): Entry threshold CHF 22,680; max coordinated CHF 62,475
  let bvgEmployee = 0;
  let bvgEmployer = 0;
  if (grossTaxableAnnual >= 22680) {
    const coordinatedWage = Math.min(Math.max(3675, grossTaxableAnnual - 25725), 62475);
    bvgEmployee = coordinatedWage * 0.0425;
    bvgEmployer = coordinatedWage * 0.0425;
  }

  // Accident Insurance (UVG): Non-occupational NBU (1.0% employee) + Occupational BU (1.6% employer) capped at CHF 148,200
  const uvgLiableWage = Math.min(grossTaxableAnnual, 148200);
  const uvgEmployee = uvgLiableWage * 0.01;
  const uvgEmployer = uvgLiableWage * 0.016;

  // Family Allowances (FAK): ~1.4% employer uncapped
  const fakEmployer = grossTaxableAnnual * 0.014;

  const employeeSocial = ahvEmployee + alvEmployee + bvgEmployee + uvgEmployee;
  const employerSocial = ahvEmployer + alvEmployer + bvgEmployer + uvgEmployer + fakEmployer;

  return {
    federalTax,
    cantonalTax,
    employeeSocial,
    employerSocial,
    audits,
    marginalRate: marginalRate + cantonalRate * 100,
  };
}

export default function SwitzerlandSalaryCalculator() {
  const formId = useId();

  // Fresh initial state (Zero-Prefill)
  const [grossSalaryInput, setGrossSalaryInput] = useState<string>('');
  const [frequency, setFrequency] = useState<PayFrequency>('annual');
  const [preTaxDeductionInput, setPreTaxDeductionInput] = useState<string>('');
  const [taxYear, setTaxYear] = useState<string>(METADATA.defaultTaxYear);
  const [canton, setCanton] = useState<string>('ZH');

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

    const res = calculateSwitzerlandTax(taxableGrossAfterPreTax, canton, taxYear);
    const annualIncomeTax = res.federalTax + res.cantonalTax;
    const annualEmployeeSocial = res.employeeSocial;
    const annualTotalDeductions = annualIncomeTax + annualEmployeeSocial + effectivePreTax;
    const annualNet = Math.max(0, annualGross - annualTotalDeductions);
    const annualEmployerSocial = res.employerSocial;
    const annualEmployerCost = annualGross + annualEmployerSocial;
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
      rawRes: res
    };
  }, [annualGross, periodsPerYear, taxYear, canton, parsedPreTax]);

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
          <span className="text-4xl select-none" role="img" aria-label="Switzerland Flag">
            {METADATA.flag}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                Switzerland Salary &amp; Take-Home Calculator
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
              Calculate net pay, statutory withholding, and employer payroll cost for Switzerland ({taxYear}).
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
                className="w-full pl-11 pr-4 py-3 bg-gray-50/70 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-base font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all tabular-nums"
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

          {/* Canton */}
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-canton`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Kanton / Canton
            </label>
            <select
              id={`${formId}-canton`}
              value={canton}
              onChange={(e) => setCanton(e.target.value)}
              className="w-full py-3 px-3 bg-gray-50/70 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {CH_CANTONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pay Frequency Buttons */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Pay Frequency
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['annual', 'monthly', 'biweekly', 'weekly'] as PayFrequency[]).map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setFrequency(freq)}
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
          presets={[{"label":"CHF 75,000 / yr","amount":"75000","freq":"annual"},{"label":"CHF 100,000 / yr","amount":"100000","freq":"annual"},{"label":"CHF 130,000 / yr","amount":"130000","freq":"annual"},{"label":"CHF 180,000 / yr","amount":"180000","freq":"annual"},{"label":"CHF 8,500 / mo","amount":"8500","freq":"monthly"}]}
          onSelectPreset={(amt, freq) => {
            setGrossSalaryInput(amt);
            if (freq) setFrequency(freq);
          }}
          preTaxDeductionInput={preTaxDeductionInput}
          onPreTaxDeductionChange={setPreTaxDeductionInput}
          preTaxDeductionLabel="Annual Pillar 3a (Säule 3a — Max CHF 7,258) Tax-Deductible Contribution"
          preTaxDeductionHint="Pillar 3a private pension contributions are 100% deductible from federal, cantonal, and municipal taxable income."
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
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Annual Payroll Waterfall Ledger</span>
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100 dark:border-slate-800/80">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Gross Contractual Salary</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatCurrency(result.annualGross, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                </span>
              </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">Direkte Bundessteuer (IFD Federal)</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.federalTax, METADATA.currency, METADATA.symbol, METADATA.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">Staats- & Gemeindesteuer ({canton})</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.cantonalTax, METADATA.currency, METADATA.symbol, METADATA.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">Sozialabgaben (AVS/AI/APG/AC/BVG ~10.5%)</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.employeeSocial, METADATA.currency, METADATA.symbol, METADATA.decimals)}
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

          {/* Periodic Comparison Table */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Periodic Compensation Schedule
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2 pr-3">Frequency</th>
                    <th className="py-2 px-3">Gross</th>
                    <th className="py-2 px-3">Income Tax</th>
                    <th className="py-2 px-3">Social</th>
                    <th className="py-2 pl-3 text-right">Net Take-Home</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  {[
                    { label: 'Annual', periods: 1 },
                    { label: 'Monthly', periods: 12 },
                    { label: 'Semi-Monthly', periods: 24 },
                    { label: 'Bi-Weekly', periods: 26 },
                    { label: 'Weekly', periods: 52 },
                    { label: 'Daily (260d)', periods: 260 },
                  ].map((row) => (
                    <tr key={row.label} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                      <td className="py-2.5 pr-3 font-semibold text-slate-900 dark:text-slate-100">{row.label}</td>
                      <td className="py-2.5 px-3 tabular-nums">
                        {formatCurrency(result.annualGross / row.periods, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                      </td>
                      <td className="py-2.5 px-3 tabular-nums text-rose-600 dark:text-rose-400">
                        {formatCurrency(result.annualIncomeTax / row.periods, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                      </td>
                      <td className="py-2.5 px-3 tabular-nums text-rose-600 dark:text-rose-400">
                        {formatCurrency(result.annualEmployeeSocial / row.periods, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                      </td>
                      <td className="py-2.5 pl-3 text-right font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                        {formatCurrency(result.annualNet / row.periods, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statutory Tax Bracket Audit */}
          {result.audits && result.audits.length > 0 && (
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Statutory Marginal Bracket Audit
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
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
              const r = calculateSwitzerlandTax(Math.max(0, candGross - effPre), canton, taxYear);
              const tax = r.federalTax + r.cantonalTax;
              const tot = tax + r.employeeSocial + effPre;
              return { annualNet: Math.max(0, candGross - tot), annualIncomeTax: tax, annualEmployeeSocial: r.employeeSocial, annualTotalDeductions: tot, annualEmployerCost: candGross + r.employerSocial };
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
