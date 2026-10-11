'use client';

import { useState, useId, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  ChevronLeft,
  CheckCircle2,
  ArrowRight,
  Info
} from 'lucide-react';
import {
  TaxBracket,
  TaxBracketAudit,
  calculateProgressiveTax,
  formatCurrency,
  formatPercent,
  FREQUENCY_FACTORS,
  PayFrequency
} from '@/components/tools/SalaryCalculator';

/* =========================================================================
   PAKISTAN STATUTORY SALARY CALCULATOR ENGINE
   Official Authority: Federal Board of Revenue (FBR)
   Governing Law: Finance Act 2024 / Income Tax Ordinance 2001 (First Schedule, Part I, Division I)
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
  supportedTaxYears: ['2026-2027', '2025-2026'],
  rulesetId: 'PK-SALARY-2026.1',
  sourceAuthority: 'Federal Board of Revenue (FBR)',
  lastVerifiedDate: '2026-10-10',
  sources: [
    {
      authority: 'Federal Board of Revenue (FBR)',
      title: 'Income Tax Ordinance 2001 - First Schedule Part I Division I (Salaried Slabs)',
      url: 'https://www.fbr.gov.pk',
      sourceType: 'TAX_AUTHORITY',
      publicationDate: '2024-06-30',
      effectiveDate: '2024-07-01',
      lastVerifiedDate: '2026-10-10'
    },
    {
      authority: "Employees' Old-Age Benefits Institution (EOBI)",
      title: 'EOBI Contribution Statutory Minimum Wage Schedule',
      url: 'https://eobi.gov.pk',
      sourceType: 'STATUTORY_INSTITUTION',
      publicationDate: '2024-07-01',
      effectiveDate: '2024-07-01',
      lastVerifiedDate: '2026-10-10'
    }
  ],
  calculationScope: 'Statutory projection based on FBR First Schedule Part I Division I salaried slabs (0% to 35%) enacted under Finance Act 2024 and mandatory EOBI contributions. Tax Year 2026-27 is a forward projection applying the unamended Finance Act 2024 regime; official Finance Act 2026 has not yet been promulgated into primary legislation.',
  knownExclusions: [
    'Provincial professional tax (Punjab, Sindh, KP, Balochistan)',
    'Full-time teacher / researcher statutory tax reduction (Section 138)',
    'Charitable donations / Zakat tax credit (Section 61 / Section 60)'
  ]
};

export function calculatePakistanTax(
  taxableIncomeAnnual: number,
  _taxYear = '2026-2027'
): {
  incomeTax: number;
  surcharge: number;
  employeeEobi: number;
  employerEobi: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  void _taxYear;
  const pkBrackets: TaxBracket[] = [
    { min: 0, max: 600000, rate: 0.0, baseTax: 0 },
    { min: 600000, max: 1200000, rate: 0.05, baseTax: 0 },
    { min: 1200000, max: 2200000, rate: 0.15, baseTax: 30000 },
    { min: 2200000, max: 3200000, rate: 0.25, baseTax: 180000 },
    { min: 3200000, max: 4100000, rate: 0.30, baseTax: 430000 },
    { min: 4100000, max: null, rate: 0.35, baseTax: 700000 },
  ];

  const { totalTax: baseTax, audits, marginalRate } = calculateProgressiveTax(taxableIncomeAnnual, pkBrackets);

  let incomeTax = baseTax;
  let surcharge = 0;
  // Finance Act: 10% surcharge on tax when taxable income > PKR 10,000,000
  if (taxableIncomeAnnual > 10000000) {
    surcharge = baseTax * 0.10;
    incomeTax += surcharge;
  }

  // Minimum wage basis: PKR 37,000/mo. Employee EOBI: 1% = PKR 370/mo = PKR 4,440/yr. Employer: 5% = PKR 1,850/mo = PKR 22,200/yr.
  const employeeEobi = taxableIncomeAnnual > 0 ? Math.min(taxableIncomeAnnual, 370 * 12) : 0;
  const employerEobi = taxableIncomeAnnual > 0 ? 1850 * 12 : 0;

  return {
    incomeTax,
    surcharge,
    employeeEobi,
    employerEobi,
    audits,
    marginalRate: taxableIncomeAnnual > 10000000 ? marginalRate * 1.1 : marginalRate,
  };
}

export default function PakistanSalaryCalculator() {
  const formId = useId();

  // Fresh initial state (Zero-Prefill)
  const [grossSalaryInput, setGrossSalaryInput] = useState<string>('');
  const [frequency, setFrequency] = useState<PayFrequency>('monthly');
  const [taxYear, setTaxYear] = useState<string>(PK_METADATA.defaultTaxYear);

  const parsedGross = useMemo(() => {
    const cleaned = grossSalaryInput.replace(/[^0-9.]/g, '');
    const val = parseFloat(cleaned);
    return isNaN(val) || val < 0 ? 0 : val;
  }, [grossSalaryInput]);

  const periodsPerYear = FREQUENCY_FACTORS[frequency]?.periodsPerYear || 12;
  const annualGross = parsedGross * periodsPerYear;

  const result = useMemo(() => {
    if (annualGross <= 0) return null;

    const { incomeTax, employeeEobi, employerEobi, audits, marginalRate } = calculatePakistanTax(annualGross, taxYear);
    const annualTotalDeductions = incomeTax + employeeEobi;
    const annualNet = Math.max(0, annualGross - annualTotalDeductions);
    const annualEmployerCost = annualGross + employerEobi;

    const periodGross = annualGross / periodsPerYear;
    const periodTax = incomeTax / periodsPerYear;
    const periodEmployeeEobi = employeeEobi / periodsPerYear;
    const periodNet = annualNet / periodsPerYear;
    const periodEmployerCost = annualEmployerCost / periodsPerYear;

    const effectiveTaxRate = (incomeTax / annualGross) * 100;
    const effectiveTotalRate = (annualTotalDeductions / annualGross) * 100;

    return {
      annualGross,
      annualIncomeTax: incomeTax,
      annualEmployeeEobi: employeeEobi,
      annualTotalDeductions,
      annualNet,
      annualEmployerEobi: employerEobi,
      annualEmployerCost,
      periodGross,
      periodTax,
      periodEmployeeEobi,
      periodNet,
      periodEmployerCost,
      effectiveTaxRate,
      effectiveTotalRate,
      marginalRate,
      audits
    };
  }, [annualGross, periodsPerYear, taxYear]);

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
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                Pakistan Salary & Take-Home Calculator
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
                <Info className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Statutory Projection</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Calculate estimated net salary after FBR income tax slabs and mandatory EOBI contributions ({taxYear}).
            </p>
          </div>
        </div>
      </header>

      {/* Statutory Metadata Context Box */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-medium">
          <div>
            <span className="text-slate-400 block text-[11px]">Authority</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{PK_METADATA.sourceAuthority}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Ruleset</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{PK_METADATA.rulesetId}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Tax Year</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{taxYear}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Last Verified</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{PK_METADATA.lastVerifiedDate}</span>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] leading-relaxed">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Statutory Scope: </span>
          {PK_METADATA.calculationScope}
        </div>
      </div>

      {/* Statutory Status Notice Banner */}
      {taxYear === '2026-2027' ? (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Statutory Projection Notice:</span> Tax Year 2026–27 (FY 2026–27) calculation is a forward projection applying the unamended salaried slabs enacted under Finance Act, 2024 (Tax Year 2025). The official Finance Act 2026 has not yet been enacted into primary legislation. Do not rely on this projection as a final tax return filing computation.
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Enacted Statutory Rules:</span> Tax Year 2025–26 is fully verified against <em>The Gazette of Pakistan: Finance Act, 2024</em> (Act No. VIII of 2024, First Schedule Part I Division I salaried slabs 0%–35%), 10% super-tax surcharge on taxable income exceeding PKR 10M, and statutory EOBI contributions.
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Gross Salary */}
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor={`${formId}-salary`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Gross Salary ({PK_METADATA.currency})
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
              Tax Year (Finance Act)
            </label>
            <select
              id={`${formId}-year`}
              value={taxYear}
              onChange={(e) => setTaxYear(e.target.value)}
              className="w-full py-3 px-3 bg-gray-50/70 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {PK_METADATA.supportedTaxYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr} {yr === PK_METADATA.defaultTaxYear ? '(Current)' : ''}
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
      </div>

      {/* Results Section */}
      {result ? (
        <div className="space-y-6">
          {/* Primary Take-Home Pay Hero */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-700 dark:to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/15 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-100">
                  Estimated Take-Home Pay ({frequency})
                </span>
                <div className="text-3xl sm:text-5xl font-extrabold tracking-tight tabular-nums mt-1">
                  {formatCurrency(result.periodNet, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                </div>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-emerald-100 block">Annual Take-Home</span>
                <span className="text-xl sm:text-2xl font-bold tabular-nums">
                  {formatCurrency(result.annualNet, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-100 block text-[11px]">Effective Tax Rate</span>
                <span className="text-base font-bold tabular-nums">{formatPercent(result.effectiveTaxRate)}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-100 block text-[11px]">Total Deductions</span>
                <span className="text-base font-bold tabular-nums">{formatPercent(result.effectiveTotalRate)}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-100 block text-[11px]">Marginal Tax Bracket</span>
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

          {/* Reconciliation Ledger */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Statutory Reconciliation Ledger</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-2.5 pr-4">Ledger Item</th>
                    <th className="py-2.5 px-4 text-right">Per Period ({frequency})</th>
                    <th className="py-2.5 pl-4 text-right">Annualized</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300 tabular-nums">
                  <tr>
                    <td className="py-2.5 pr-4 font-semibold text-slate-900 dark:text-slate-100">Contractual Gross Salary</td>
                    <td className="py-2.5 px-4 text-right font-medium">
                      {formatCurrency(result.periodGross, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                    <td className="py-2.5 pl-4 text-right font-medium">
                      {formatCurrency(result.annualGross, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                  </tr>
                  <tr className="text-rose-600 dark:text-rose-400">
                    <td className="py-2.5 pr-4">− Income Tax (FBR Salaried Slabs)</td>
                    <td className="py-2.5 px-4 text-right font-medium">
                      −{formatCurrency(result.periodTax, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                    <td className="py-2.5 pl-4 text-right font-medium">
                      −{formatCurrency(result.annualIncomeTax, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                  </tr>
                  <tr className="text-amber-600 dark:text-amber-400">
                    <td className="py-2.5 pr-4">− Employee EOBI (1% of statutory min wage)</td>
                    <td className="py-2.5 px-4 text-right font-medium">
                      −{formatCurrency(result.periodEmployeeEobi, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                    <td className="py-2.5 pl-4 text-right font-medium">
                      −{formatCurrency(result.annualEmployeeEobi, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                  </tr>
                  <tr className="bg-emerald-50/60 dark:bg-emerald-950/20 font-bold text-emerald-800 dark:text-emerald-300">
                    <td className="py-3 pr-4 text-sm">= Net Take-Home Pay</td>
                    <td className="py-3 px-4 text-right text-sm">
                      {formatCurrency(result.periodNet, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                    <td className="py-3 pl-4 text-right text-sm">
                      {formatCurrency(result.annualNet, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                  </tr>
                  <tr className="text-slate-500 dark:text-slate-400 text-[11px] pt-2">
                    <td className="py-2 pr-4">+ Employer EOBI Contribution (5%)</td>
                    <td className="py-2 px-4 text-right">
                      +{formatCurrency(result.annualEmployerEobi / periodsPerYear, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                    <td className="py-2 pl-4 text-right">
                      +{formatCurrency(result.annualEmployerEobi, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
                    </td>
                  </tr>
                  <tr className="font-semibold text-slate-800 dark:text-slate-200">
                    <td className="py-2.5 pr-4">Total Employer Cost (CTC)</td>
                    <td className="py-2.5 px-4 text-right">
                      {formatCurrency(result.periodEmployerCost, PK_METADATA.currency, PK_METADATA.symbol, PK_METADATA.decimals)}
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
              FBR Progressive Slabs Breakdown ({taxYear})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-2 pr-2">Slab</th>
                    <th className="py-2 px-3">Annual Range</th>
                    <th className="py-2 px-3 text-right">Rate</th>
                    <th className="py-2 px-3 text-right">Taxable in Slab</th>
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
                      <td className="py-2 px-3 text-right font-medium">{a.rate}%</td>
                      <td className="py-2 px-3 text-right">
                        ₨{Math.round(a.taxableAmountInBracket).toLocaleString()}
                      </td>
                      <td className="py-2 pl-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                        ₨{Math.round(a.taxForBracket).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
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
