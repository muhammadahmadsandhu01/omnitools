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
   IRELAND STATUTORY SALARY CALCULATOR ENGINE
   Authority: Revenue Commissioners & Department of Social Protection
   Ruleset: IE-REV-2026.1
   ========================================================================= */

export const METADATA = {
  "code": "IE",
  "iso3": "IRL",
  "name": "Ireland",
  "flag": "🇮🇪",
  "currency": "EUR",
  "symbol": "€",
  "decimals": 2,
  "status": "VERIFIED",
  "statusLabel": "Verified Statutory",
  "freshness": "CURRENT",
  "defaultTaxYear": "2026",
  "supportedTaxYears": [
    "2026",
    "2025"
  ],
  "hasRegions": false,
  "rulesetId": "IE-REV-2026.1",
  "ruleVersion": "Revenue Commissioners Budget 2025/2026 — PAYE Income Tax, USC & PRSI Class A",
  "lastVerifiedDate": "2026-10-01",
  "sourceAuthority": "Revenue Commissioners & Department of Social Protection",
  "sources": [
    {
      "authority": "Revenue Commissioners",
      "title": "Tax Relief Charts — Standard Rate Cut-Off Points & USC Rates",
      "url": "https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/tax-relief-charts/index.aspx",
      "sourceType": "TAX_AUTHORITY",
      "publicationDate": "2024-10-01",
      "effectiveDate": "2025-01-01",
      "lastVerifiedDate": "2026-10-01"
    },
    {
      "authority": "Department of Social Protection",
      "title": "SW14 PRSI Contribution Rates (Class A)",
      "url": "https://www.gov.ie/en/publication/14ef8a-prsi-rates/",
      "sourceType": "STATUTORY_INSTITUTION",
      "publicationDate": "2024-10-01",
      "effectiveDate": "2025-01-01",
      "lastVerifiedDate": "2026-10-01"
    }
  ],
  "calculationScope": "Standard 20% income tax up to €44,000 cut-off, 40% higher rate. Single personal (€2,000) and Employee PAYE (€2,000) tax credits (€4,000 total). USC rates: 0.5% to €12,012, 2% to €27,382, 3% to €70,044, 8% balance (exempt if income ≤ €13,000). PRSI Class A: 4.10% employee (tapered credit €352-€424/wk), 11.15% employer.",
  "knownExclusions": [
    "Married / Civil Partner transferred rate bands (€53,000/€88,000)",
    "Age tax credits (age 65+)",
    "Home Carer Tax Credit",
    "PRSI Class S (Self-Employed)"
  ],
  "disclaimerNote": "Revenue Commissioners PAYE, USC, and DSP PRSI Class A. Annualized statutory take-home estimate.",
  "popular": true
};

// 13. Ireland (IE) — Revenue Commissioners PAYE Income Tax, USC & PRSI Class A (Budget 2025/2026)
export function calculateIrelandTax(
  grossTaxableAnnual: number,
  _taxYear = '2026'
): {
  incomeTax: number;
  usc: number;
  prsi: number;
  employeeSocial: number;
  employerPrsi: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  void _taxYear;
  // PAYE: SRCOP €44,000 for single individual (20% standard, 40% higher)
  const iePayeBrackets: TaxBracket[] = [
    { min: 0, max: 44000, rate: 0.2, baseTax: 0 },
    { min: 44000, max: null, rate: 0.4, baseTax: 8800 },
  ];
  const { totalTax: grossPayeTax, audits, marginalRate } = calculateProgressiveTax(grossTaxableAnnual, iePayeBrackets);

  // Statutory Non-Refundable Tax Credits: Single Person (€2,000) + Employee PAYE Credit (€2,000) = €4,000
  const totalTaxCredits = 4000;
  const incomeTax = Math.max(0, grossPayeTax - totalTaxCredits);

  // Universal Social Charge (USC): Exempt if income <= €13,000
  let usc = 0;
  if (grossTaxableAnnual > 13000) {
    const uscBrackets: TaxBracket[] = [
      { min: 0, max: 12012, rate: 0.005, baseTax: 0 },
      { min: 12012, max: 27382, rate: 0.02, baseTax: 60.06 },
      { min: 27382, max: 70044, rate: 0.03, baseTax: 367.46 },
      { min: 70044, max: null, rate: 0.08, baseTax: 1647.32 },
    ];
    const uscRes = calculateProgressiveTax(grossTaxableAnnual, uscBrackets);
    usc = uscRes.totalTax;
  }

  // PRSI Class A Employee: 4.10% on earnings over €352/wk (€18,304/yr)
  const weeklyWage = grossTaxableAnnual / 52;
  let prsi = 0;
  if (weeklyWage > 352) {
    const rawPrsi = grossTaxableAnnual * 0.041;
    if (weeklyWage <= 424) {
      // Tapered PRSI credit: max €12/wk reduced by 1/6th of earnings above €352
      const weeklyCredit = Math.max(0, 12 - (weeklyWage - 352) / 6);
      const annualCredit = weeklyCredit * 52;
      prsi = Math.max(0, rawPrsi - annualCredit);
    } else {
      prsi = rawPrsi;
    }
  }

  // Employer PRSI Class A: 8.90% if <= €496/wk (€25,792/yr), else 11.15% uncapped
  const employerPrsi = weeklyWage <= 496 ? grossTaxableAnnual * 0.089 : grossTaxableAnnual * 0.1115;

  return {
    incomeTax,
    usc,
    prsi,
    employeeSocial: usc + prsi,
    employerPrsi,
    audits,
    marginalRate,
  };
}

export default function IrelandSalaryCalculator() {
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

    const res = calculateIrelandTax(taxableGrossAfterPreTax, taxYear);
    const annualIncomeTax = res.incomeTax;
    const annualEmployeeSocial = res.employeeSocial;
    const annualTotalDeductions = annualIncomeTax + annualEmployeeSocial + effectivePreTax;
    const annualNet = Math.max(0, annualGross - annualTotalDeductions);
    const annualEmployerSocial = res.employerPrsi;
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
          <span className="text-4xl select-none" role="img" aria-label="Ireland Flag">
            {METADATA.flag}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                Ireland Salary &amp; Take-Home Calculator
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
              Calculate net pay, statutory withholding, and employer payroll cost for Ireland ({taxYear}).
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
          presets={[{"label":"€40,000 / yr","amount":"40000","freq":"annual"},{"label":"€55,000 / yr","amount":"55000","freq":"annual"},{"label":"€75,000 / yr","amount":"75000","freq":"annual"},{"label":"€105,000 / yr","amount":"105000","freq":"annual"},{"label":"€4,500 / mo","amount":"4500","freq":"monthly"}]}
          onSelectPreset={(amt, freq) => {
            setGrossSalaryInput(amt);
            if (freq) setFrequency(freq);
          }}
          preTaxDeductionInput={preTaxDeductionInput}
          onPreTaxDeductionChange={setPreTaxDeductionInput}
          preTaxDeductionLabel="Annual PRSA / Occupational Pension / AVC Pre-Tax Contribution"
          preTaxDeductionHint="Qualifying pension contributions receive full PAYE income tax relief at your marginal rate (20% or 40%)."
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
              <span className="text-slate-600 dark:text-slate-400">PAYE Income Tax (Net of Credits)</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.incomeTax, METADATA.currency, METADATA.symbol, METADATA.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">USC &amp; PRSI Class A (Employee)</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.employeeSocial, METADATA.currency, METADATA.symbol, METADATA.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">Employer PRSI (11.05%)</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                +{formatCurrency(result.rawRes.employerPrsi, METADATA.currency, METADATA.symbol, METADATA.decimals)}
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
              const r = calculateIrelandTax(Math.max(0, candGross - effPre), taxYear);
              const tot = r.incomeTax + r.employeeSocial + effPre;
              return { annualNet: Math.max(0, candGross - tot), annualIncomeTax: r.incomeTax, annualEmployeeSocial: r.employeeSocial, annualTotalDeductions: tot, annualEmployerCost: candGross + r.employerPrsi };
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
