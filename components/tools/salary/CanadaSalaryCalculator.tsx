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
  CA_PROVINCES,
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
   CANADA STATUTORY SALARY CALCULATOR ENGINE
   Authority: Canada Revenue Agency (CRA)
   Ruleset: CA-CRA-2026.2
   ========================================================================= */

export const METADATA = {
  "code": "CA",
  "iso3": "CAN",
  "name": "Canada",
  "flag": "🇨🇦",
  "currency": "CAD",
  "symbol": "$",
  "decimals": 2,
  "status": "LIMITED",
  "statusLabel": "Federal Statutory + Provincial Benchmark",
  "freshness": "CURRENT",
  "defaultTaxYear": "2026",
  "supportedTaxYears": [
    "2026",
    "2025"
  ],
  "hasRegions": true,
  "defaultRegion": "ON",
  "rulesetId": "CA-CRA-2026.2",
  "ruleVersion": "CRA T4032 Payroll Deductions Tables 2025/2026; CPP/EI Contribution Notices (canada.ca)",
  "lastVerifiedDate": "2026-10-01",
  "sourceAuthority": "Canada Revenue Agency (CRA)",
  "sources": [
    {
      "authority": "Canada Revenue Agency (CRA)",
      "title": "Payroll Deductions Tables T4032 2025 & 2026 + CPP/EI Annual Maximums Notice",
      "url": "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables.html",
      "sourceType": "GOVERNMENT",
      "publicationDate": "2025-11-15",
      "effectiveDate": "2026-01-01",
      "lastVerifiedDate": "2026-10-01"
    }
  ],
  "calculationScope": "2026: Federal brackets at 14%/20.5%/26%/29%/33% (indexed 2.0%) with BPA $16,452; CPP1 5.95% on $3,500–$74,600 YMPE (max $4,230.45 each); EI 1.63% up to $68,900 MIE (max employee $1,123.07); employer EI at 1.4× employee. 2025: 15% bottom bracket, BPA $15,705, CPP YMPE $71,300, EI 1.64%/$65,700. Provincial flat-rate approximation applies.",
  "knownExclusions": [
    "Provincial Income Tax Benchmark: Provincial tax is modeled using a representative baseline rate (e.g., Ontario standard 5.05% baseline) rather than full multi-tier provincial brackets and local surtaxes",
    "CPP2 Second Additional Contribution (4% on earnings between YMPE $74,600 and YAMPE $85,000 for 2026; $71,300–$81,900 for 2025)",
    "Quebec Parental Insurance Plan (QPIP) — replaces EI for Quebec residents",
    "Ontario Health Premium graduated surtax",
    "Child Care Expense deductions"
  ],
  "disclaimerNote": "2026: Federal 14%/20.5%/26%/29%/33% brackets, BPA $16,452, CPP1 5.95% to YMPE $74,600, EI 1.63% to $68,900. Employer EI = 1.4× employee. CPP2 above YMPE and QPIP are known exclusions. Estimated annualized take-home only.",
  "popular": true
};

// 6. Canada Federal & Statutory Deductions (2025 / 2026)
// Sources: CRA T4032 Payroll Deductions Tables; CPP/EI Contribution Notices (canada.ca);
//          Federal Budget 2025 (14% bottom bracket for 2026 full year)
export function calculateCanadaTax(grossTaxableAnnual: number, provinceCode = 'ON', taxYear = '2026'): {
  federalTax: number;
  provincialTax: number;
  cpp: number;
  ei: number;
  employerCpp: number;
  employerEi: number;
  basicPersonalAmount: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  const is2026 = taxYear === '2026';

  // BPA: $16,452 (2026, indexed 2.0%); $15,705 (2025 CRA T4032)
  // Bottom bracket rate: 14% (2026 — reduced under 2025 legislation); 15% (2025)
  const basicPersonalAmount = is2026 ? 16452 : 15705;
  const bottomRate = is2026 ? 0.14 : 0.15;

  const caBrackets: TaxBracket[] = is2026
    ? [
        // 2026 federal brackets — indexed 2.0% per CRA; bottom rate 14% for full year
        { min: 0, max: 58523, rate: 0.14, baseTax: 0 },
        { min: 58523, max: 117045, rate: 0.205, baseTax: 8193.22 },
        { min: 117045, max: 181440, rate: 0.26, baseTax: 20190.23 },
        { min: 181440, max: 258482, rate: 0.29, baseTax: 36932.93 },
        { min: 258482, max: null, rate: 0.33, baseTax: 59275.11 },
      ]
    : [
        // 2025 federal brackets — CRA T4032 Payroll Deductions Tables
        { min: 0, max: 55867, rate: 0.15, baseTax: 0 },
        { min: 55867, max: 111733, rate: 0.205, baseTax: 8380.05 },
        { min: 111733, max: 173205, rate: 0.26, baseTax: 19832.58 },
        { min: 173205, max: 246752, rate: 0.29, baseTax: 35815.3 },
        { min: 246752, max: null, rate: 0.33, baseTax: 57143.93 },
      ];

  const { totalTax: grossTax, audits, marginalRate } = calculateProgressiveTax(grossTaxableAnnual, caBrackets);
  // BPA credit rate = bottom bracket rate (non-refundable federal tax credit)
  const bpaCredit = basicPersonalAmount * bottomRate;
  const federalTax = Math.max(0, grossTax - bpaCredit);

  // CPP1 (Canada Pension Plan — First Additional Contribution)
  // 2026: YMPE $74,600 | Exemption $3,500 | Rate 5.95% | Max contribution $4,230.45 (each side)
  // 2025: YMPE $71,300 | Exemption $3,500 | Rate 5.95%
  const ympe = is2026 ? 74600 : 71300;
  let cpp = 0;
  if (grossTaxableAnnual > 3500) {
    cpp = (Math.min(grossTaxableAnnual, ympe) - 3500) * 0.0595;
  }

  // Employment Insurance (EI)
  // 2026: MIE $68,900 | Employee rate 1.63% | Max employee $1,123.07 | Employer 2.282% (1.4×)
  // 2025: MIE $65,700 | Employee rate 1.64% | Employer 2.296% (1.4×)
  const eiMie = is2026 ? 68900 : 65700;
  const eiRate = is2026 ? 0.0163 : 0.0164;
  const ei = Math.min(grossTaxableAnnual, eiMie) * eiRate;

  // Employer: CPP = same as employee; EI = 1.4× employee (statutory employer multiplier)
  const employerCpp = cpp;
  const employerEi = ei * 1.4;

  const provMeta = CA_PROVINCES.find((p) => p.code === provinceCode);
  const provRate = provMeta?.taxRatePercent ? provMeta.taxRatePercent / 100 : 0.0505;
  const provincialTax = Math.max(0, grossTaxableAnnual - 11000) * provRate;

  return {
    federalTax,
    provincialTax,
    cpp,
    ei,
    employerCpp,
    employerEi,
    basicPersonalAmount,
    audits,
    marginalRate,
  };
}

export default function CanadaSalaryCalculator() {
  const formId = useId();

  // Fresh initial state (Zero-Prefill)
  const [grossSalaryInput, setGrossSalaryInput] = useState<string>('');
  const [frequency, setFrequency] = useState<PayFrequency>('annual');
  const [preTaxDeductionInput, setPreTaxDeductionInput] = useState<string>('');
  const [taxYear, setTaxYear] = useState<string>(METADATA.defaultTaxYear);
  const [province, setProvince] = useState<string>('ON');

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

    const res = calculateCanadaTax(taxableGrossAfterPreTax, province, taxYear);
    const annualIncomeTax = res.federalTax + res.provincialTax;
    const annualEmployeeSocial = res.cpp + res.ei;
    const annualTotalDeductions = annualIncomeTax + annualEmployeeSocial + effectivePreTax;
    const annualNet = Math.max(0, annualGross - annualTotalDeductions);
    const annualEmployerSocial = res.employerCpp + res.employerEi;
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
  }, [annualGross, periodsPerYear, taxYear, province, parsedPreTax]);

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
          <span className="text-4xl select-none" role="img" aria-label="Canada Flag">
            {METADATA.flag}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                Canada Salary &amp; Take-Home Calculator
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
              Calculate net pay, statutory withholding, and employer payroll cost for Canada ({taxYear}).
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

          {/* Province */}
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-province`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Province / Territory
            </label>
            <select
              id={`${formId}-province`}
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full py-3 px-3 bg-gray-50/70 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {CA_PROVINCES.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name} ({p.code})
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
          presets={[{"label":"$55,000 / yr","amount":"55000","freq":"annual"},{"label":"$75,000 / yr","amount":"75000","freq":"annual"},{"label":"$100,000 / yr","amount":"100000","freq":"annual"},{"label":"$140,000 / yr","amount":"140000","freq":"annual"},{"label":"$200,000 / yr","amount":"200000","freq":"annual"}]}
          onSelectPreset={(amt, freq) => {
            setGrossSalaryInput(amt);
            if (freq) setFrequency(freq);
          }}
          preTaxDeductionInput={preTaxDeductionInput}
          onPreTaxDeductionChange={setPreTaxDeductionInput}
          preTaxDeductionLabel="Annual RRSP / FHSA / RPP Pre-Tax Deduction"
          preTaxDeductionHint="Registered Retirement Savings Plan (RRSP) or First Home Savings Account (FHSA) contributions reduce CRA federal & provincial taxable income."
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
              <span className="text-slate-600 dark:text-slate-400">Federal Income Tax</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.federalTax, METADATA.currency, METADATA.symbol, METADATA.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">Provincial Tax ({province})</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.provincialTax, METADATA.currency, METADATA.symbol, METADATA.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">CPP / QPP Contribution</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.cpp, METADATA.currency, METADATA.symbol, METADATA.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">Employment Insurance (EI)</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.ei, METADATA.currency, METADATA.symbol, METADATA.decimals)}
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
              const r = calculateCanadaTax(Math.max(0, candGross - effPre), province, taxYear);
              const tax = r.federalTax + r.provincialTax;
              const soc = r.cpp + r.ei;
              const tot = tax + soc + effPre;
              return { annualNet: Math.max(0, candGross - tot), annualIncomeTax: tax, annualEmployeeSocial: soc, annualTotalDeductions: tot, annualEmployerCost: candGross + r.employerCpp + r.employerEi };
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
