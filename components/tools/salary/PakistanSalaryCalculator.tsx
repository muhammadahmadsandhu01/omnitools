'use client';

import { useState, useId, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  ChevronLeft,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  TaxBracket,
  TaxBracketAudit,
  calculateProgressiveTax,
  formatCurrency,
  formatPercent,
  FREQUENCY_FACTORS,
  PayFrequency,
} from '@/components/tools/SalaryCalculator';
import {
  SalaryPresetBar,
  SalaryInsightsAndExportSuite,
} from '@/components/tools/salary/shared/SalaryAnalysisToolbar';

/* =========================================================================
   PAKISTAN STATUTORY SALARY CALCULATOR ENGINE
   Official Authority: Federal Board of Revenue (FBR)
   Governing Law: Income Tax Ordinance 2001 (First Schedule, Part I, Division I)
   Supports:
   - FY 2026-2027 (Tax Year 2027 — Finance Act 2026: 0%, 1%, 11%, 20%, 25%, 29%, 32%, 35%)
   - FY 2025-2026 (Tax Year 2026 — Finance Act 2025: 0%, 1%, 11%, 23%, 30%, 35% + 9% surcharge >10M)
   - FY 2024-2025 (Tax Year 2025 — Finance Act 2024: 0%, 5%, 15%, 25%, 30%, 35% + 10% surcharge >10M)
   ========================================================================= */

export const PK_METADATA = {
  countryCode: 'PK',
  name: 'Pakistan',
  countryName: 'Pakistan',
  flag: '🇵🇰',
  currency: 'PKR',
  symbol: '₨',
  decimals: 0,
  status: 'VERIFIED' as const,
  defaultTaxYear: '2026-2027',
  supportedTaxYears: ['2026-2027', '2025-2026', '2024-2025'],
  rulesetId: 'PK-FBR-2026.2',
  sourceAuthority: 'Federal Board of Revenue (FBR)',
  lastVerifiedDate: '2026-10-20',
  sources: [
    {
      authority: 'Federal Board of Revenue (FBR)',
      title: 'Income Tax Ordinance 2001 — First Schedule Part I Division I (Finance Act 2026 & 2025 Salaried Slabs)',
      url: 'https://www.fbr.gov.pk',
      sourceType: 'TAX_AUTHORITY',
      publicationDate: '2026-06-30',
      effectiveDate: '2026-07-01',
      lastVerifiedDate: '2026-10-20',
    },
    {
      authority: "Employees' Old-Age Benefits Institution (EOBI)",
      title: 'EOBI Contribution Statutory Minimum Wage Schedule (PKR 37,000/mo basis)',
      url: 'https://eobi.gov.pk',
      sourceType: 'STATUTORY_INSTITUTION',
      publicationDate: '2024-07-01',
      effectiveDate: '2024-07-01',
      lastVerifiedDate: '2026-10-20',
    },
  ],
  calculationScope:
    'Enacted FBR First Schedule Part I Division I salaried income tax slabs across FY 2026-27 (Finance Act 2026: 0%, 1%, 11%, 20%, 25%, 29%, 32%, 35%), FY 2025-26 (Finance Act 2025: 0%, 1%, 11%, 23%, 30%, 35% + 9% surcharge >PKR 10M), and FY 2024-25 (Finance Act 2024: 0%, 5%, 15%, 25%, 30%, 35% + 10% surcharge >PKR 10M), plus optional 10% Medical Allowance exemption, Section 60 Zakat / Provident Fund deductions, and mandatory EOBI contributions.',
  knownExclusions: [
    'Provincial professional tax (Punjab, Sindh, KP, Balochistan)',
    'Full-time teacher / researcher statutory tax reduction (Second Schedule Clause 9A)',
    'Company-provided vehicle perquisite valuation (Section 13)',
  ],
};

export function calculatePakistanTax(
  taxableIncomeAnnual: number,
  taxYear = '2026-2027'
): {
  incomeTax: number;
  surcharge: number;
  employeeEobi: number;
  employerEobi: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  let pkBrackets: TaxBracket[];
  let surchargeRate = 0;

  if (taxYear === '2026-2027') {
    // Finance Act 2026 (Tax Year 2027 — Effective 1 July 2026)
    pkBrackets = [
      { min: 0, max: 600000, rate: 0.0, baseTax: 0 },
      { min: 600000, max: 1200000, rate: 0.01, baseTax: 0 },
      { min: 1200000, max: 2200000, rate: 0.11, baseTax: 6000 },
      { min: 2200000, max: 3200000, rate: 0.20, baseTax: 116000 },
      { min: 3200000, max: 4100000, rate: 0.25, baseTax: 316000 },
      { min: 4100000, max: 5600000, rate: 0.29, baseTax: 541000 },
      { min: 5600000, max: 7000000, rate: 0.32, baseTax: 976000 },
      { min: 7000000, max: null, rate: 0.35, baseTax: 1424000 },
    ];
    surchargeRate = 0; // 9% salaried surcharge abolished in Finance Act 2026
  } else if (taxYear === '2025-2026') {
    // Finance Act 2025 (Tax Year 2026 — Effective 1 July 2025 to 30 June 2026)
    pkBrackets = [
      { min: 0, max: 600000, rate: 0.0, baseTax: 0 },
      { min: 600000, max: 1200000, rate: 0.01, baseTax: 0 },
      { min: 1200000, max: 2200000, rate: 0.11, baseTax: 6000 },
      { min: 2200000, max: 3200000, rate: 0.23, baseTax: 116000 },
      { min: 3200000, max: 4100000, rate: 0.30, baseTax: 346000 },
      { min: 4100000, max: null, rate: 0.35, baseTax: 616000 },
    ];
    surchargeRate = 0.09; // 9% surcharge on income tax when taxable income > PKR 10,000,000
  } else {
    // Finance Act 2024 (Tax Year 2025 — Effective 1 July 2024 to 30 June 2025)
    pkBrackets = [
      { min: 0, max: 600000, rate: 0.0, baseTax: 0 },
      { min: 600000, max: 1200000, rate: 0.05, baseTax: 0 },
      { min: 1200000, max: 2200000, rate: 0.15, baseTax: 30000 },
      { min: 2200000, max: 3200000, rate: 0.25, baseTax: 180000 },
      { min: 3200000, max: 4100000, rate: 0.30, baseTax: 430000 },
      { min: 4100000, max: null, rate: 0.35, baseTax: 700000 },
    ];
    surchargeRate = 0.10; // 10% surcharge on income tax when taxable income > PKR 10,000,000
  }

  const { totalTax: baseTax, audits, marginalRate } = calculateProgressiveTax(
    taxableIncomeAnnual,
    pkBrackets
  );

  let incomeTax = baseTax;
  let surcharge = 0;
  if (taxableIncomeAnnual > 10000000 && surchargeRate > 0) {
    surcharge = baseTax * surchargeRate;
    incomeTax += surcharge;
  }

  // Statutory minimum wage basis: PKR 37,000/mo -> Employee EOBI 1% (PKR 370/mo = PKR 4,440/yr), Employer 5% (PKR 1,850/mo = PKR 22,200/yr)
  const employeeEobi = taxableIncomeAnnual > 0 ? Math.min(taxableIncomeAnnual, 370 * 12) : 0;
  const employerEobi = taxableIncomeAnnual > 0 ? 1850 * 12 : 0;

  return {
    incomeTax,
    surcharge,
    employeeEobi,
    employerEobi,
    audits,
    marginalRate: taxableIncomeAnnual > 10000000 && surchargeRate > 0 ? marginalRate * (1 + surchargeRate) : marginalRate,
  };
}

const PK_PRESETS: { label: string; amount: string; freq: PayFrequency }[] = [
  { label: '₨75,000 / mo', amount: '75000', freq: 'monthly' },
  { label: '₨150,000 / mo', amount: '150000', freq: 'monthly' },
  { label: '₨250,000 / mo', amount: '250000', freq: 'monthly' },
  { label: '₨500,000 / mo', amount: '500000', freq: 'monthly' },
  { label: '₨1,000,000 / mo', amount: '1000000', freq: 'monthly' },
];

export default function PakistanSalaryCalculator() {
  const formId = useId();

  const [grossSalaryInput, setGrossSalaryInput] = useState<string>('');
  const [frequency, setFrequency] = useState<PayFrequency>('monthly');
  const [taxYear, setTaxYear] = useState<string>(PK_METADATA.defaultTaxYear);
  const [medicalExemptEnabled, setMedicalExemptEnabled] = useState<boolean>(false);
  const [includeEobi, setIncludeEobi] = useState<boolean>(true);
  const [preTaxDeductionInput, setPreTaxDeductionInput] = useState<string>('');

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

  const periodsPerYear = FREQUENCY_FACTORS[frequency]?.periodsPerYear || 12;
  const annualGross = parsedGross * periodsPerYear;

  const computeForAnnualGross = useCallback(
    (candidateAnnualGross: number) => {
      // Under Clause 139 Part I Second Schedule, Medical Allowance up to 10% of basic salary (approx 1/11th of gross if structured) is tax-exempt
      const medicalExemption = medicalExemptEnabled ? candidateAnnualGross / 11 : 0;
      const totalPreTax = Math.min(candidateAnnualGross, medicalExemption + parsedPreTax);
      const taxableAnnual = Math.max(0, candidateAnnualGross - totalPreTax);

      const { incomeTax, surcharge, employeeEobi, employerEobi, audits, marginalRate } =
        calculatePakistanTax(taxableAnnual, taxYear);

      const finalEmployeeEobi = includeEobi ? employeeEobi : 0;
      const finalEmployerEobi = includeEobi ? employerEobi : 0;
      const annualTotalDeductions = incomeTax + finalEmployeeEobi + parsedPreTax;
      const annualNet = Math.max(0, candidateAnnualGross - annualTotalDeductions);
      const annualEmployerCost = candidateAnnualGross + finalEmployerEobi;

      return {
        taxableAnnual,
        medicalExemption,
        annualPreTaxDeductions: parsedPreTax,
        annualIncomeTax: incomeTax,
        surcharge,
        annualEmployeeSocial: finalEmployeeEobi,
        annualTotalDeductions,
        annualNet,
        annualEmployerSocial: finalEmployerEobi,
        annualEmployerCost,
        audits,
        marginalRate,
      };
    },
    [medicalExemptEnabled, parsedPreTax, taxYear, includeEobi]
  );

  const result = useMemo(() => {
    if (annualGross <= 0) return null;

    const calc = computeForAnnualGross(annualGross);

    // Also compute comparison across all 3 tax years so user sees exact budget tax savings!
    const tax2627 = calculatePakistanTax(calc.taxableAnnual, '2026-2027').incomeTax;
    const tax2526 = calculatePakistanTax(calc.taxableAnnual, '2025-2026').incomeTax;
    const tax2425 = calculatePakistanTax(calc.taxableAnnual, '2024-2025').incomeTax;

    const periodGross = annualGross / periodsPerYear;
    const periodTax = calc.annualIncomeTax / periodsPerYear;
    const periodEmployeeEobi = calc.annualEmployeeSocial / periodsPerYear;
    const periodNet = calc.annualNet / periodsPerYear;
    const periodEmployerCost = calc.annualEmployerCost / periodsPerYear;

    const effectiveTaxRate = (calc.annualIncomeTax / annualGross) * 100;
    const effectiveTotalRate = (calc.annualTotalDeductions / annualGross) * 100;

    return {
      annualGross,
      taxableAnnual: calc.taxableAnnual,
      medicalExemption: calc.medicalExemption,
      annualPreTaxDeductions: calc.annualPreTaxDeductions,
      annualIncomeTax: calc.annualIncomeTax,
      surcharge: calc.surcharge,
      annualEmployeeEobi: calc.annualEmployeeSocial,
      annualEmployeeSocial: calc.annualEmployeeSocial,
      annualTotalDeductions: calc.annualTotalDeductions,
      annualNet: calc.annualNet,
      annualEmployerEobi: calc.annualEmployerSocial,
      annualEmployerSocial: calc.annualEmployerSocial,
      annualEmployerCost: calc.annualEmployerCost,
      periodGross,
      periodTax,
      periodEmployeeEobi,
      periodNet,
      periodEmployerCost,
      effectiveTaxRate,
      effectiveTotalRate,
      marginalRate: calc.marginalRate,
      audits: calc.audits,
      taxComparison: {
        '2026-2027': tax2627,
        '2025-2026': tax2526,
        '2024-2025': tax2425,
      },
    };
  }, [annualGross, periodsPerYear, computeForAnnualGross]);

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
          <span className="text-4xl select-none" role="img" aria-label="Pakistan Flag">
            {PK_METADATA.flag}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                Pakistan Salary &amp; FBR Tax Calculator
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Verified FBR Slabs</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Calculate exact net take-home pay under official FBR Salaried Tax Slabs ({taxYear}), 10% Medical Allowance exemption, and EOBI contributions.
            </p>
          </div>
        </div>
      </header>

      {/* Statutory Metadata Context Box */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-medium">
          <div>
            <span className="text-slate-400 block text-[11px]">Authority</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{PK_METADATA.sourceAuthority}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Ruleset</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{PK_METADATA.rulesetId}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Active Fiscal Year</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">FY {taxYear}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Tax-Free Threshold</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">₨600,000/yr (₨50,000/mo)</span>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] leading-relaxed">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Statutory Scope: </span>
          {PK_METADATA.calculationScope}
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Gross Salary */}
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor={`${formId}-salary`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Gross Salary ({PK_METADATA.currency}) — Enter Monthly or Annual Pay
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-bold text-slate-400 select-none">
                {PK_METADATA.symbol}
              </span>
              <input
                id={`${formId}-salary`}
                type="text"
                inputMode="numeric"
                value={grossSalaryInput}
                onChange={(e) => setGrossSalaryInput(e.target.value)}
                placeholder="e.g. 150,000"
                className="w-full pl-11 pr-4 py-3 bg-gray-50/70 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-base font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all tabular-nums"
              />
            </div>
          </div>

          {/* Tax Year */}
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-year`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tax Year (FBR Finance Act)
            </label>
            <select
              id={`${formId}-year`}
              value={taxYear}
              onChange={(e) => setTaxYear(e.target.value)}
              className="w-full py-3 px-3 bg-gray-50/70 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="2026-2027">FY 2026–2027 (Finance Act 2026 — Latest)</option>
              <option value="2025-2026">FY 2025–2026 (Finance Act 2025)</option>
              <option value="2024-2025">FY 2024–2025 (Finance Act 2024)</option>
            </select>
          </div>
        </div>

        {/* Pay Frequency & Statutory Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Pay Frequency
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['monthly', 'annual', 'biweekly', 'weekly'] as PayFrequency[]).map((freq) => (
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

          {/* Pakistan-Specific Statutory Toggles */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={medicalExemptEnabled}
                onChange={(e) => setMedicalExemptEnabled(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span>10% Tax-Exempt Medical Allowance (Clause 139)</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeEobi}
                onChange={(e) => setIncludeEobi(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span>Deduct EOBI (₨370/mo)</span>
            </label>
          </div>
        </div>

        {/* Quick Salary Presets & Pre-Tax Zakat/PF Drawer */}
        <SalaryPresetBar
          currency={PK_METADATA.currency}
          symbol={PK_METADATA.symbol}
          presets={PK_PRESETS}
          onSelectPreset={(amt, freq) => {
            setGrossSalaryInput(amt);
            if (freq) setFrequency(freq);
          }}
          preTaxDeductionInput={preTaxDeductionInput}
          onPreTaxDeductionChange={setPreTaxDeductionInput}
          preTaxDeductionLabel="Annual Zakat (Sec 60) / Recognized Provident Fund Deduction"
          preTaxDeductionHint="Enter annual Zakat or tax-deductible fund contribution to reduce your FBR taxable salary."
        />
      </div>

      {/* Results Section */}
      {result ? (
        <div className="space-y-6">
          {/* Primary Take-Home Pay Hero */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-700 dark:to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/15 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-100">
                  Net Take-Home Salary ({frequency})
                </span>
                <div className="text-3xl sm:text-5xl font-extrabold tracking-tight tabular-nums mt-1">
                  {formatCurrency(result.periodNet, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                </div>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-emerald-100 block">Annual Net Take-Home</span>
                <span className="text-xl sm:text-2xl font-bold tabular-nums">
                  {formatCurrency(result.annualNet, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-100 block text-[11px]">Monthly Tax (FBR)</span>
                <span className="text-base font-bold tabular-nums">
                  {formatCurrency(result.annualIncomeTax / 12, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                </span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-100 block text-[11px]">Effective Tax Rate</span>
                <span className="text-base font-bold tabular-nums">{formatPercent(result.effectiveTaxRate)}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-100 block text-[11px]">Marginal Tax Slab</span>
                <span className="text-base font-bold tabular-nums">{formatPercent(result.marginalRate)}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-100 block text-[11px]">Employer Cost ({frequency})</span>
                <span className="text-base font-bold tabular-nums">
                  {formatCurrency(result.periodEmployerCost, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                </span>
              </div>
            </div>
          </div>

          {/* 3-Year FBR Budget Tax Savings Comparison Banner */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-emerald-200 dark:border-emerald-900/50 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>FBR Multi-Year Budget Comparison (FY 2024–25 vs FY 2025–26 vs FY 2026–27)</span>
              </h3>
              {result.taxComparison['2024-2025'] > result.taxComparison['2026-2027'] && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Annual Tax Relief in FY 2026–27: ₨{Math.round(result.taxComparison['2024-2025'] - result.taxComparison['2026-2027']).toLocaleString()}/yr (₨{Math.round((result.taxComparison['2024-2025'] - result.taxComparison['2026-2027']) / 12).toLocaleString()}/mo)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {(['2026-2027', '2025-2026', '2024-2025'] as const).map((yr) => {
                const yrTax = result.taxComparison[yr];
                const isSelected = taxYear === yr;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setTaxYear(yr)}
                    className={`text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                        : 'border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/40 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>FY {yr}</span>
                      {isSelected && <span className="text-[10px] uppercase text-emerald-600 dark:text-emerald-400">Active</span>}
                    </div>
                    <div className="mt-1.5 text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                      ₨{Math.round(yrTax / 12).toLocaleString()}{' '}
                      <span className="text-xs font-normal text-slate-500">/ mo tax</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                      Annual Tax: ₨{Math.round(yrTax).toLocaleString()} · Net/mo: ₨{Math.round((result.annualGross - yrTax - result.annualEmployeeEobi) / 12).toLocaleString()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reconciliation Ledger */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Statutory Reconciliation Ledger (FY {taxYear})</span>
            </h3>

            <div className="overflow-x-auto overscroll-x-contain">
              <table className="min-w-[580px] w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-2.5 pr-4">Ledger Item</th>
                    <th className="py-2.5 px-4 text-right">Monthly (12x)</th>
                    <th className="py-2.5 pl-4 text-right">Annualized</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300 tabular-nums">
                  <tr>
                    <td className="py-2.5 pr-4 font-semibold text-slate-900 dark:text-slate-100">Contractual Gross Salary</td>
                    <td className="py-2.5 px-4 text-right font-medium">
                      {formatCurrency(result.annualGross / 12, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                    <td className="py-2.5 pl-4 text-right font-medium">
                      {formatCurrency(result.annualGross, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                  </tr>
                  {result.medicalExemption > 0 && (
                    <tr className="text-emerald-600 dark:text-emerald-400">
                      <td className="py-2 pr-4">Exempt Medical Allowance (Clause 139 — 10% of Basic)</td>
                      <td className="py-2 px-4 text-right">
                        {formatCurrency(result.medicalExemption / 12, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                      </td>
                      <td className="py-2 pl-4 text-right">
                        {formatCurrency(result.medicalExemption, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                      </td>
                    </tr>
                  )}
                  {result.annualPreTaxDeductions > 0 && (
                    <tr className="text-blue-600 dark:text-blue-400">
                      <td className="py-2 pr-4">− Pre-Tax Zakat / Provident Fund Deduction</td>
                      <td className="py-2 px-4 text-right">
                        −{formatCurrency(result.annualPreTaxDeductions / 12, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                      </td>
                      <td className="py-2 pl-4 text-right">
                        −{formatCurrency(result.annualPreTaxDeductions, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2 pr-4 text-slate-500">Net Taxable Salary Assessed by FBR</td>
                    <td className="py-2 px-4 text-right font-semibold">
                      {formatCurrency(result.taxableAnnual / 12, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                    <td className="py-2 pl-4 text-right font-semibold">
                      {formatCurrency(result.taxableAnnual, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                  </tr>
                  <tr className="text-rose-600 dark:text-rose-400">
                    <td className="py-2.5 pr-4">
                      − FBR Salaried Income Tax {result.surcharge > 0 ? `(incl. ₨${Math.round(result.surcharge).toLocaleString()} High-Earner Surcharge)` : ''}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium">
                      −{formatCurrency(result.annualIncomeTax / 12, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                    <td className="py-2.5 pl-4 text-right font-medium">
                      −{formatCurrency(result.annualIncomeTax, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                  </tr>
                  {result.annualEmployeeEobi > 0 && (
                    <tr className="text-amber-600 dark:text-amber-400">
                      <td className="py-2.5 pr-4">− Employee EOBI Contribution (1% of min wage)</td>
                      <td className="py-2.5 px-4 text-right font-medium">
                        −{formatCurrency(result.annualEmployeeEobi / 12, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                      </td>
                      <td className="py-2.5 pl-4 text-right font-medium">
                        −{formatCurrency(result.annualEmployeeEobi, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-emerald-50/60 dark:bg-emerald-950/20 font-bold text-emerald-800 dark:text-emerald-300">
                    <td className="py-3 pr-4 text-sm">= Net Take-Home Pay</td>
                    <td className="py-3 px-4 text-right text-sm">
                      {formatCurrency(result.annualNet / 12, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                    <td className="py-3 pl-4 text-right text-sm">
                      {formatCurrency(result.annualNet, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                  </tr>
                  <tr className="text-slate-500 dark:text-slate-400 text-[11px] pt-2">
                    <td className="py-2 pr-4">+ Employer EOBI Contribution (5%)</td>
                    <td className="py-2 px-4 text-right">
                      +{formatCurrency(result.annualEmployerEobi / 12, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                    <td className="py-2 pl-4 text-right">
                      +{formatCurrency(result.annualEmployerEobi, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                  </tr>
                  <tr className="font-semibold text-slate-800 dark:text-slate-200">
                    <td className="py-2.5 pr-4">Total Employer Cost (CTC)</td>
                    <td className="py-2.5 px-4 text-right">
                      {formatCurrency(result.annualEmployerCost / 12, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                    <td className="py-2.5 pl-4 text-right">
                      {formatCurrency(result.annualEmployerCost, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Progressive Tax Slabs Audit Table */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              FBR Progressive Slabs Breakdown (FY {taxYear})
            </h3>
            <div className="overflow-x-auto overscroll-x-contain">
              <table className="min-w-[580px] w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-2 pr-2">Slab</th>
                    <th className="py-2 px-3">Annual Taxable Range</th>
                    <th className="py-2 px-3 text-right">Slab Rate</th>
                    <th className="py-2 px-3 text-right">Your Income in Slab</th>
                    <th className="py-2 pl-3 text-right">Tax Assessed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 tabular-nums">
                  {result.audits.map((a) => (
                    <tr key={a.bracketIndex} className={a.taxForBracket > 0 ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''}>
                      <td className="py-2 pr-2 font-semibold">Slab {a.bracketIndex}</td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                        ₨{a.min.toLocaleString()} – {a.max ? `₨${a.max.toLocaleString()}` : 'Above'}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold">{formatPercent(a.rate)}</td>
                      <td className="py-2 px-3 text-right">
                        ₨{Math.round(a.taxableAmountInBracket).toLocaleString()}
                      </td>
                      <td className="py-2 pl-3 text-right font-semibold text-rose-600 dark:text-rose-400">
                        ₨{Math.round(a.taxForBracket).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shared Insights, 7-Period Matrix, Export & Reverse Net-to-Gross Solver */}
          <SalaryInsightsAndExportSuite
            countryName={PK_METADATA.name}
            currency={PK_METADATA.currency}
            symbol={PK_METADATA.symbol}
            decimals={PK_METADATA.decimals}
            taxYear={taxYear}
            rulesetId={PK_METADATA.rulesetId}
            result={{
              annualGross: result.annualGross,
              annualPreTaxDeductions: result.annualPreTaxDeductions,
              annualIncomeTax: result.annualIncomeTax,
              annualEmployeeSocial: result.annualEmployeeEobi,
              annualTotalDeductions: result.annualTotalDeductions,
              annualNet: result.annualNet,
              annualEmployerSocial: result.annualEmployerEobi,
              annualEmployerCost: result.annualEmployerCost,
              effectiveTaxRate: result.effectiveTaxRate,
              effectiveTotalRate: result.effectiveTotalRate,
              marginalRate: result.marginalRate,
            }}
            computeNetFromAnnualGross={computeForAnnualGross}
            onApplyRequiredGross={(reqAnnual) => {
              const perPeriod = Math.round(reqAnnual / periodsPerYear);
              setGrossSalaryInput(String(perPeriod));
            }}
          />
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800 space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Enter Gross Salary or Click a Quick Benchmark Above
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Enter your monthly or annual pay in PKR (or tap a quick preset like ₨150,000/mo) to view instant FBR slab deductions, multi-year budget comparison, and net take-home pay.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Privacy Standard · 100% Client-Side · Zero salary data transmitted</span>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <footer className="pt-4 border-t border-gray-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Privacy Standard · No salary data stored or transmitted</span>
        </div>
        <Link
          href="/finance/salary-calculator"
          className="hover:underline flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold"
        >
          <span>All 212 Countries</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </footer>
    </div>
  );
}
