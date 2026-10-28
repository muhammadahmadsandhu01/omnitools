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
   AUSTRALIA STATUTORY SALARY CALCULATOR ENGINE
   Authority: Australian Taxation Office (ATO)
   Ruleset: AU-ATO-2026.2
   ========================================================================= */

export const METADATA = {
  "code": "AU",
  "iso3": "AUS",
  "name": "Australia",
  "flag": "🇦🇺",
  "currency": "AUD",
  "symbol": "$",
  "decimals": 2,
  "status": "VERIFIED",
  "statusLabel": "Verified Statutory",
  "freshness": "CURRENT",
  "defaultTaxYear": "2026-2027",
  "supportedTaxYears": [
    "2026-2027",
    "2025-2026"
  ],
  "hasRegions": false,
  "rulesetId": "AU-ATO-2026.2",
  "ruleVersion": "ATO Individual Tax Rates 2026-27 (Treasury Laws Amendment Act 2024 — Stage 3 revised, 15% second bracket) + LITO",
  "lastVerifiedDate": "2026-10-01",
  "sourceAuthority": "Australian Taxation Office (ATO)",
  "sources": [
    {
      "authority": "Australian Taxation Office (ATO)",
      "title": "Individual income tax rates 2025-26 and 2026-27 (Stage 3 revised; second bracket 16% → 15% effective 1 July 2026)",
      "url": "https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents",
      "sourceType": "GOVERNMENT",
      "publicationDate": "2024-03-05",
      "effectiveDate": "2026-07-01",
      "lastVerifiedDate": "2026-10-01"
    }
  ],
  "calculationScope": "FY 2026-27: 0%/$18,200, 15%/$45,000, 30%/$135,000, 37%/$190,000, 45% above (second bracket reduced from 16% in 2025-26). LITO up to $700 (phases out $37,500–$66,667). 2.0% Medicare Levy. 12.0% Employer Superannuation Guarantee (employer cost only, not an employee deduction).",
  "knownExclusions": [
    "Medicare Levy Surcharge (MLS) for individuals without private hospital cover",
    "HELP / HECS student debt repayments",
    "Division 293 tax on high superannuation contributions",
    "Low-Income Superannuation Tax Offset (LISTO)"
  ],
  "disclaimerNote": "FY 2026-27: 15% second bracket (16% in 2025-26), LITO (max $700), 2.0% Medicare levy, 12.0% Employer Super Guarantee. Estimated annualized take-home only.",
  "popular": true
};

// 7. Australia Individual Income Tax + LITO + Medicare (FY 2025-26 and 2026-27)
// Sources: ATO — Individual Income Tax Rates; Treasury Laws Amendment Act 2024 (Stage 3 revised)
//          ATO — Low Income Tax Offset (LITO); ATO — Medicare Levy
export function calculateAustraliaTax(grossTaxableAnnual: number, taxYear = '2026-2027'): {
  incomeTax: number;
  lito: number;
  medicareLevy: number;
  employerSuperannuation: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  // 2026-27: second bracket REDUCED to 15% (legislated, effective 1 July 2026)
  // 2025-26 and earlier: 16% second bracket (Stage 3 revised, effective 1 July 2024)
  // 2027-28 onwards: further reduction to 14% (already legislated)
  const is202627 = taxYear === '2026-2027';
  const secondRate = is202627 ? 0.15 : 0.16;
  const baseTaxAt45k = is202627 ? 4020 : 4288;  // secondRate × (45,000 - 18,200)
  const baseTaxAt135k = baseTaxAt45k + 27000;    // + 30% × (135,000 - 45,000)
  const baseTaxAt190k = baseTaxAt135k + 20350;   // + 37% × (190,000 - 135,000)

  const auBrackets: TaxBracket[] = [
    { min: 0, max: 18200, rate: 0.0, baseTax: 0 },
    { min: 18200, max: 45000, rate: secondRate, baseTax: 0 },
    { min: 45000, max: 135000, rate: 0.30, baseTax: baseTaxAt45k },
    { min: 135000, max: 190000, rate: 0.37, baseTax: baseTaxAt135k },
    { min: 190000, max: null, rate: 0.45, baseTax: baseTaxAt190k },
  ];

  const { totalTax: incomeTaxBeforeLito, audits, marginalRate } = calculateProgressiveTax(grossTaxableAnnual, auBrackets);

  // Low Income Tax Offset (LITO) — non-refundable, ATO 2025-26 and 2026-27
  // Maximum: $700 for taxable income ≤ $37,500
  // Phase-out 1: $0.05 per $1 over $37,500 (down to $325 at $45,000)
  // Phase-out 2: $0.015 per $1 over $45,000 (reaches $0 at ~$66,667)
  let lito = 0;
  if (grossTaxableAnnual <= 37500) {
    lito = 700;
  } else if (grossTaxableAnnual <= 45000) {
    lito = Math.max(0, 700 - 0.05 * (grossTaxableAnnual - 37500));
  } else if (grossTaxableAnnual < 66667) {
    lito = Math.max(0, 325 - 0.015 * (grossTaxableAnnual - 45000));
  }
  const incomeTax = Math.max(0, incomeTaxBeforeLito - lito);

  // Medicare Levy: 2.0% (simplified — actual has low-income reduction threshold ~$26,000)
  const medicareLevy = grossTaxableAnnual > 26000 ? grossTaxableAnnual * 0.02 : 0;

  // Employer Superannuation Guarantee: 12.0% of OTE — employer cost, NOT an employee deduction
  const employerSuperannuation = grossTaxableAnnual * 0.12;

  return {
    incomeTax,
    lito,
    medicareLevy,
    employerSuperannuation,
    audits,
    marginalRate: marginalRate + (grossTaxableAnnual > 26000 ? 2.0 : 0),
  };
}

export default function AustraliaSalaryCalculator() {
  const formId = useId();

  // Fresh initial state (Zero-Prefill)
  const [grossSalaryInput, setGrossSalaryInput] = useState<string>('');
  const [frequency, setFrequency] = useState<PayFrequency>('annual');
  const [preTaxDeductionInput, setPreTaxDeductionInput] = useState<string>('');
  const [taxYear, setTaxYear] = useState<string>(METADATA.defaultTaxYear);


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

    const res = calculateAustraliaTax(taxableGrossAfterPreTax, taxYear);
    const annualIncomeTax = res.incomeTax;
    const annualEmployeeSocial = res.medicareLevy;
    const annualTotalDeductions = annualIncomeTax + annualEmployeeSocial + effectivePreTax;
    const annualNet = Math.max(0, annualGross - annualTotalDeductions);
    const annualEmployerSocial = res.employerSuperannuation;
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
  }, [annualGross, periodsPerYear, taxYear, parsedPreTax]);

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
          <span className="text-4xl select-none" role="img" aria-label="Australia Flag">
            {METADATA.flag}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                Australia Salary &amp; Take-Home Calculator
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
              Calculate net pay, statutory withholding, and employer payroll cost for Australia ({taxYear}).
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
          presets={[{"label":"A$65,000 / yr","amount":"65000","freq":"annual"},{"label":"A$95,000 / yr","amount":"95000","freq":"annual"},{"label":"A$125,000 / yr","amount":"125000","freq":"annual"},{"label":"A$160,000 / yr","amount":"160000","freq":"annual"},{"label":"A$220,000 / yr","amount":"220000","freq":"annual"}]}
          onSelectPreset={(amt, freq) => {
            setGrossSalaryInput(amt);
            if (freq) setFrequency(freq);
          }}
          preTaxDeductionInput={preTaxDeductionInput}
          onPreTaxDeductionChange={setPreTaxDeductionInput}
          preTaxDeductionLabel="Annual Salary Sacrifice Superannuation / Work Deductions"
          preTaxDeductionHint="Concessional salary sacrifice super contributions or work-related deductions reducing ATO assessable income."
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
              <span className="text-slate-600 dark:text-slate-400">ATO Income Tax (post-LITO)</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.incomeTax, METADATA.currency, METADATA.symbol, METADATA.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">Medicare Levy (2.0%)</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.medicareLevy, METADATA.currency, METADATA.symbol, METADATA.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">Superannuation Guarantee (12.0% Employer)</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{formatCurrency(result.rawRes.employerSuperannuation, METADATA.currency, METADATA.symbol, METADATA.decimals)}
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
              const r = calculateAustraliaTax(Math.max(0, candGross - effPre), taxYear);
              const tax = r.incomeTax;
              const soc = r.medicareLevy;
              const tot = tax + soc + effPre;
              return { annualNet: Math.max(0, candGross - tot), annualIncomeTax: tax, annualEmployeeSocial: soc, annualTotalDeductions: tot, annualEmployerCost: candGross + r.employerSuperannuation };
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
