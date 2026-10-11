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
  
  TaxBracketAudit,
  
  formatCurrency,
  formatPercent,
  FREQUENCY_FACTORS,
  PayFrequency
} from '@/components/tools/SalaryCalculator';

/* =========================================================================
   UNITED ARAB EMIRATES STATUTORY SALARY CALCULATOR ENGINE
   Authority: Ministry of Human Resources & Emiratisation (MOHRE) & GPSSA
   Ruleset: AE-MOHRE-2026.1
   ========================================================================= */

export const METADATA = {
  "code": "AE",
  "iso3": "ARE",
  "name": "United Arab Emirates",
  "flag": "🇦🇪",
  "currency": "AED",
  "symbol": "AED",
  "decimals": 2,
  "status": "LIMITED",
  "statusLabel": "0% PIT + GPSSA / Gratuity Scope",
  "freshness": "CURRENT",
  "defaultTaxYear": "2026",
  "supportedTaxYears": [
    "2026",
    "2025"
  ],
  "hasRegions": false,
  "rulesetId": "AE-MOHRE-2026.1",
  "ruleVersion": "UAE Federal Decree-Law No. (33) of 2021 & GPSSA Law",
  "lastVerifiedDate": "2026-10-10",
  "sourceAuthority": "Ministry of Human Resources & Emiratisation (MOHRE) & GPSSA",
  "sources": [
    {
      "authority": "Federal Tax Authority (FTA)",
      "title": "UAE Federal Tax Legislation (0% PIT on Employment Income)",
      "url": "https://tax.gov.ae/en/legislation.aspx",
      "sourceType": "TAX_AUTHORITY",
      "publicationDate": "2022-12-09",
      "effectiveDate": "2023-01-01",
      "lastVerifiedDate": "2026-10-10"
    },
    {
      "authority": "General Pension and Social Security Authority (GPSSA)",
      "title": "Federal Law No. 7 of 1999 on Pension & Social Security (5% Employee / AED 50k Cap Baseline)",
      "url": "https://www.gpssa.gov.ae",
      "sourceType": "STATUTORY_INSTITUTION",
      "publicationDate": "1999-01-01",
      "effectiveDate": "1999-01-01",
      "lastVerifiedDate": "2026-10-10"
    }
  ],
  "calculationScope": "0% personal income tax. GPSSA social security for UAE/GCC nationals (5% employee, 12.5% employer, capped at AED 50,000/mo under Federal Law No. 7 of 1999). Expatriate end-of-service gratuity provision (~5.75% of basic salary) modeled on employer side, never reducing employee net pay.",
  "knownExclusions": [
    "Federal Decree-Law No. 57/2023 new entrant scheme for post-November 2023 joiners (11% employee contribution, AED 70,000/mo cap)",
    "Voluntary savings schemes (DIFC Workplace Savings Scheme)",
    "Corporate tax obligations for sole proprietorships > AED 375,000",
    "Housing fee deductions for Dubai residents"
  ],
  "disclaimerNote": "0% Personal Income Tax. Models GPSSA for UAE Nationals, and Employer End-of-Service gratuity provision for Expatriates.",
  "popular": true
};

export function calculateUaeTax(
  annualGross: number,
  residency: 'national' | 'expatriate' = 'expatriate',
  _taxYear = '2026'
): {
  incomeTax: number;
  employeeSocial: number;
  employerSocial: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  void _taxYear;
  let employeeSocial = 0;
  let employerSocial = 0;
  if (residency === 'national') {
    const gpssaBase = Math.min(annualGross, 600000);
    employeeSocial = gpssaBase * 0.05;
    employerSocial = gpssaBase * 0.125;
  } else {
    employeeSocial = 0;
    employerSocial = annualGross * 0.0575;
  }
  return {
    incomeTax: 0,
    employeeSocial,
    employerSocial,
    audits: [{ bracketIndex: 1, min: 0, max: null, taxableAmountInBracket: annualGross, rate: 0, taxForBracket: 0, cumulativeTax: 0 }],
    marginalRate: 0,
  };
}

export default function UnitedArabEmiratesSalaryCalculator() {
  const formId = useId();

  // Fresh initial state (Zero-Prefill)
  const [grossSalaryInput, setGrossSalaryInput] = useState<string>('');
  const [frequency, setFrequency] = useState<PayFrequency>('annual');
  const [taxYear, setTaxYear] = useState<string>(METADATA.defaultTaxYear);
  const [residency, setResidency] = useState<'national' | 'expatriate'>('expatriate');

  const parsedGross = useMemo(() => {
    const cleaned = grossSalaryInput.replace(/[^0-9.]/g, '');
    const val = parseFloat(cleaned);
    return isNaN(val) || val < 0 ? 0 : val;
  }, [grossSalaryInput]);

  const periodsPerYear = FREQUENCY_FACTORS[frequency]?.periodsPerYear || 1;
  const annualGross = parsedGross * periodsPerYear;

  const result = useMemo(() => {
    if (annualGross <= 0) return null;

    const res = calculateUaeTax(annualGross, residency, taxYear);
    const annualIncomeTax = res.incomeTax;
    const annualEmployeeSocial = res.employeeSocial;
    const annualTotalDeductions = annualIncomeTax + annualEmployeeSocial;
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
  }, [annualGross, periodsPerYear, taxYear, residency]);

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
          <span className="text-4xl select-none" role="img" aria-label="United Arab Emirates Flag">
            {METADATA.flag}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                United Arab Emirates Salary &amp; Take-Home Calculator
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
              Calculate net pay, statutory withholding, and employer payroll cost for United Arab Emirates ({taxYear}).
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

      {/* GPSSA Statutory Regime Limitation Banner */}
      {residency === 'national' ? (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">GPSSA Statutory Regime Scope &amp; Limitation:</span>
            <p>
              This calculator applies the baseline regime under <strong>Federal Law No. 7 of 1999 on Pension &amp; Social Security</strong> (5% employee deduction, capped at AED 50,000/month or AED 600,000/year), applicable to UAE nationals whose insured employment commenced <strong>prior to November 17, 2023</strong>.
            </p>
            <p>
              <strong>New Entrant Scheme (Federal Decree-Law No. 57 of 2023):</strong> UAE nationals who joined the insured workforce for the first time on or after <strong>November 17, 2023</strong> are subject to an <strong>11% employee contribution rate</strong> with a higher private sector salary cap of <strong>AED 70,000/month</strong> (AED 840,000/year). Because this tool does not solicit individual employment joining dates, ensure you check whether you fall under the 1999 regime (5%) or the 2023 regime (11%).
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Expatriate Statutory Tax Status:</span> Under UAE Federal Tax Legislation, employment income is subject to <strong>0% Personal Income Tax</strong> and 0% employee social security deductions. The employer-side end-of-service gratuity provision (~5.75% basic salary) is modeled on the employer cost ledger and does not reduce your net take-home pay.
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

          {/* Residency */}
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-residency`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Residency / Nationality
            </label>
            <select
              id={`${formId}-residency`}
              value={residency}
              onChange={(e) => setResidency(e.target.value as 'national' | 'expatriate')}
              className="w-full py-3 px-3 bg-gray-50/70 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="expatriate">Expatriate (0% Personal Tax)</option>
              <option value="national">UAE / GCC National (GPSSA Liable)</option>
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
                {formatPercent(result.marginalRate * 100)}
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
              <span className="text-slate-600 dark:text-slate-400">Personal Income Tax</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                AED 0 (0% Rate)
              </span>
            </div>
            {result.rawRes.employeeSocial > 0 && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
                <span className="text-slate-600 dark:text-slate-400">GPSSA Social Security (5.0%)</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                  −{formatCurrency(result.rawRes.employeeSocial, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">Employer Provision / Contribution</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                +{formatCurrency(result.rawRes.employerSocial, METADATA.currency, METADATA.symbol, METADATA.decimals)}
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
                        <td className="py-2 px-2 tabular-nums font-semibold">{formatPercent(a.rate * 100)}</td>
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
