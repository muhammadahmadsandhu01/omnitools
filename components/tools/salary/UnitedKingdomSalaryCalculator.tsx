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
  UK_REGIONS,
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
   UNITED KINGDOM STATUTORY SALARY CALCULATOR ENGINE
   Authority: HM Revenue & Customs (HMRC)
   Ruleset: GB-PAYE-2026.1
   ========================================================================= */

export const METADATA = {
  "code": "GB",
  "iso3": "GBR",
  "name": "United Kingdom",
  "flag": "🇬🇧",
  "currency": "GBP",
  "symbol": "£",
  "decimals": 2,
  "status": "VERIFIED",
  "statusLabel": "Verified Statutory",
  "freshness": "CURRENT",
  "defaultTaxYear": "2026-2027",
  "supportedTaxYears": [
    "2026-2027",
    "2025-2026"
  ],
  "hasRegions": true,
  "defaultRegion": "EWNI",
  "rulesetId": "GB-PAYE-2026.1",
  "ruleVersion": "HMRC PAYE Bands & Class 1 National Insurance",
  "lastVerifiedDate": "2026-04-06",
  "sourceAuthority": "HM Revenue & Customs (HMRC)",
  "sources": [
    {
      "authority": "HM Revenue & Customs (HMRC)",
      "title": "Rates and thresholds for employers 2025 to 2026 and 2026 to 2027",
      "url": "https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026",
      "sourceType": "GOVERNMENT",
      "publicationDate": "2024-10-30",
      "effectiveDate": "2025-04-06",
      "lastVerifiedDate": "2026-04-06"
    },
    {
      "authority": "Scottish Government",
      "title": "Scottish Income Tax Devolved Rates and Bands",
      "url": "https://www.gov.scot/policies/taxes/income-tax/",
      "sourceType": "LEGISLATION",
      "publicationDate": "2024-12-04",
      "effectiveDate": "2025-04-06",
      "lastVerifiedDate": "2026-04-06"
    }
  ],
  "calculationScope": "Personal Allowance (£12,570 with £1-for-£2 taper > £100k), Basic (20%), Higher (40%), and Additional (45%) rates; Scottish devolved bands (19% to 48%); Class 1 Employee NI (8% and 2%); and Employer NI (15.0% above £5,000 threshold).",
  "knownExclusions": [
    "Student Loan repayments (Plan 1/2/4/Postgraduate)",
    "Marriage Allowance transfer and Blind Person Allowance",
    "Salary sacrifice pension arrangement variations"
  ],
  "disclaimerNote": "Models Personal Allowance (£12,570 with £1-for-£2 taper above £100k), Basic (20%), Higher (40%), and Additional (45%) rates, plus Class 1 Employee NI (8% and 2%) and Scottish devolved bands.",
  "popular": true
};

// 3. United Kingdom PAYE & National Insurance (2024–2026)
export function calculateUkTax(grossTaxableAnnual: number, region = 'EWNI', taxYear = '2026-2027'): {
  incomeTax: number;
  nationalInsurance: number;
  employerNi: number;
  personalAllowance: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  let personalAllowance = 12570;
  if (grossTaxableAnnual > 100000) {
    const excess = grossTaxableAnnual - 100000;
    personalAllowance = Math.max(0, 12570 - excess / 2);
  }

  const taxableIncome = Math.max(0, grossTaxableAnnual - personalAllowance);

  let ukBrackets: TaxBracket[];
  if (region === 'SCT') {
    // Scottish Devolved Tax Bands
    ukBrackets = [
      { min: 0, max: 2306, rate: 0.19, baseTax: 0 },
      { min: 2306, max: 13991, rate: 0.20, baseTax: 438.14 },
      { min: 13991, max: 31092, rate: 0.21, baseTax: 2775.14 },
      { min: 31092, max: 62430, rate: 0.42, baseTax: 6366.35 },
      { min: 62430, max: Math.max(62430, 125140 - personalAllowance), rate: 0.45, baseTax: 19527.91 },
      { min: Math.max(62430, 125140 - personalAllowance), max: null, rate: 0.48, baseTax: 47747.41 },
    ];
  } else {
    // England, Wales, NI standard bands
    ukBrackets = [
      { min: 0, max: 37700, rate: 0.20, baseTax: 0 },
      { min: 37700, max: Math.max(37700, 125140 - personalAllowance), rate: 0.40, baseTax: 7540 },
      { min: Math.max(37700, 125140 - personalAllowance), max: null, rate: 0.45, baseTax: 42516 },
    ];
  }

  const { totalTax: incomeTax, audits, marginalRate } = calculateProgressiveTax(taxableIncome, ukBrackets);

  // Employee Class 1 NI (8% £12,570–£50,270 annual PT→UEL, 2% above UEL)
  // Annual Primary Threshold (PT): £12,570 — frozen for 2024-25, 2025-26, 2026-27 (HMRC)
  // Annual Upper Earnings Limit (UEL): £50,270 — frozen for the same period
  let nationalInsurance = 0;
  if (grossTaxableAnnual > 12570) {
    const mainBand = Math.min(grossTaxableAnnual, 50270) - 12570;
    nationalInsurance += mainBand * 0.08;
    if (grossTaxableAnnual > 50270) {
      nationalInsurance += (grossTaxableAnnual - 50270) * 0.02;
    }
  }

  // Employer NI: For 2025–26 and 2026–27 (Autumn Budget 2024), 15.0% above £5,000. For historical 2024–25, 13.8% above £9,100.
  const isHistoricalPre2025 = taxYear === '2024-2025';
  const employerNiThreshold = isHistoricalPre2025 ? 9100 : 5000;
  const employerNiRate = isHistoricalPre2025 ? 0.138 : 0.15;
  const employerNi = grossTaxableAnnual > employerNiThreshold ? (grossTaxableAnnual - employerNiThreshold) * employerNiRate : 0;

  return {
    incomeTax,
    nationalInsurance,
    employerNi,
    personalAllowance,
    audits,
    marginalRate,
  };
}


export type UkStudentLoanPlan = 'none' | 'plan1' | 'plan2' | 'plan4' | 'plan5';

export function computeUkStudentLoan(
  annualGross: number,
  plan: UkStudentLoanPlan,
  postgradLoan: boolean
): number {
  let total = 0;
  // 2026-27 GOV.UK Student Loan Repayment Thresholds (9% above threshold)
  const thresholds: Record<UkStudentLoanPlan, number> = {
    none: Infinity,
    plan1: 26900,
    plan2: 29385,
    plan4: 33795,
    plan5: 25000,
  };
  if (plan !== 'none' && annualGross > thresholds[plan]) {
    total += (annualGross - thresholds[plan]) * 0.09;
  }
  // Postgraduate Loan: 6% above £21,000
  if (postgradLoan && annualGross > 21000) {
    total += (annualGross - 21000) * 0.06;
  }
  return total;
}

export default function UnitedKingdomSalaryCalculator() {
  const formId = useId();

  // Fresh initial state (Zero-Prefill)
  const [grossSalaryInput, setGrossSalaryInput] = useState<string>('');
  const [frequency, setFrequency] = useState<PayFrequency>('annual');
  const [preTaxDeductionInput, setPreTaxDeductionInput] = useState<string>('');
  const [taxYear, setTaxYear] = useState<string>(METADATA.defaultTaxYear);
  const [region, setRegion] = useState<string>('EWNI');
  const [studentLoanPlan, setStudentLoanPlan] = useState<UkStudentLoanPlan>('none');
  const [postgradLoan, setPostgradLoan] = useState<boolean>(false);

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

    const res = calculateUkTax(taxableGrossAfterPreTax, region, taxYear);
    const annualIncomeTax = res.incomeTax;
    const studentLoanAnnual = computeUkStudentLoan(annualGross, studentLoanPlan, postgradLoan);
    const annualEmployeeSocial = res.nationalInsurance + studentLoanAnnual;
    const annualTotalDeductions = annualIncomeTax + annualEmployeeSocial + effectivePreTax;
    const annualNet = Math.max(0, annualGross - annualTotalDeductions);
    const annualEmployerSocial = res.employerNi;
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
  }, [annualGross, periodsPerYear, taxYear, region, parsedPreTax, studentLoanPlan, postgradLoan]);

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
          <span className="text-4xl select-none" role="img" aria-label="United Kingdom Flag">
            {METADATA.flag}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                United Kingdom Salary &amp; Take-Home Calculator
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
              Calculate net pay, statutory withholding, and employer payroll cost for United Kingdom ({taxYear}).
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

          {/* Region */}
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-region`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
              UK Tax Jurisdiction
            </label>
            <select
              id={`${formId}-region`}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full py-3 px-3 bg-gray-50/70 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {UK_REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
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

        
        {/* UK Student Loan & Postgraduate Loan Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-slate-800/80">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              UK Student Loan Plan (Optional — 9% above threshold)
            </label>
            <select
              value={studentLoanPlan}
              onChange={(e) => setStudentLoanPlan(e.target.value as UkStudentLoanPlan)}
              className="w-full py-2.5 px-3 bg-gray-50/70 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">No Undergraduate Student Loan</option>
              <option value="plan1">Plan 1 — Threshold £26,900/yr (9%)</option>
              <option value="plan2">Plan 2 — Threshold £29,385/yr (9%)</option>
              <option value="plan4">Plan 4 (Scotland) — Threshold £33,795/yr (9%)</option>
              <option value="plan5">Plan 5 (Post-Aug 2023) — Threshold £25,000/yr (9%)</option>
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={postgradLoan}
                onChange={(e) => setPostgradLoan(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span>Include Postgraduate Loan (6% above £21,000/yr)</span>
            </label>
          </div>
        </div>
        {/* Quick Salary Presets & Pre-Tax Deduction Drawer */}
        <SalaryPresetBar
          currency={METADATA.currency}
          symbol={METADATA.symbol}
          presets={[{"label":"£30,000 / yr","amount":"30000","freq":"annual"},{"label":"£45,000 / yr","amount":"45000","freq":"annual"},{"label":"£65,000 / yr","amount":"65000","freq":"annual"},{"label":"£100,000 / yr","amount":"100000","freq":"annual"},{"label":"£150,000 / yr","amount":"150000","freq":"annual"}]}
          onSelectPreset={(amt, freq) => {
            setGrossSalaryInput(amt);
            if (freq) setFrequency(freq);
          }}
          preTaxDeductionInput={preTaxDeductionInput}
          onPreTaxDeductionChange={setPreTaxDeductionInput}
          preTaxDeductionLabel="Annual Salary Sacrifice / Workplace Pension Contribution (Pre-Tax)"
          preTaxDeductionHint="Reduces UK PAYE taxable income (and helps preserve your £12,570 Personal Allowance when earning above £100,000)."
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
              <span className="text-slate-600 dark:text-slate-400">PAYE Income Tax</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.incomeTax, METADATA.currency, METADATA.symbol, METADATA.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">National Insurance (Employee)</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.nationalInsurance, METADATA.currency, METADATA.symbol, METADATA.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">Personal Allowance</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(result.rawRes.personalAllowance, METADATA.currency, METADATA.symbol, METADATA.decimals)}
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
            <div className="overflow-x-auto overscroll-x-contain">
              <table className="min-w-[580px] w-full text-xs text-left">
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
              const r = calculateUkTax(Math.max(0, candGross - effPre), region, taxYear);
              const tax = r.incomeTax;
              const soc = r.nationalInsurance + computeUkStudentLoan(candGross, studentLoanPlan, postgradLoan);
              const tot = tax + soc + effPre;
              return { annualNet: Math.max(0, candGross - tot), annualIncomeTax: tax, annualEmployeeSocial: soc, annualTotalDeductions: tot, annualEmployerCost: candGross + r.employerNi };
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
