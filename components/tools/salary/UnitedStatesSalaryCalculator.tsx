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
  US_STATES, UsFilingStatus,
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
   UNITED STATES STATUTORY SALARY CALCULATOR ENGINE
   Authority: Internal Revenue Service (IRS) & SSA
   Ruleset: US-FED-2026.2
   ========================================================================= */

export const METADATA = {
  "code": "US",
  "iso3": "USA",
  "name": "United States",
  "flag": "🇺🇸",
  "currency": "USD",
  "symbol": "$",
  "decimals": 2,
  "status": "LIMITED",
  "statusLabel": "Federal Statutory (State Configurable)",
  "freshness": "CURRENT",
  "defaultTaxYear": "2026",
  "supportedTaxYears": [
    "2026",
    "2025"
  ],
  "hasRegions": true,
  "defaultRegion": "TX",
  "rulesetId": "US-FED-2026.2",
  "ruleVersion": "IRS Rev. Proc. 2025-32 (2026 Brackets/Std Deductions) & IRS Rev. Proc. 2024-40 (2025) & SSA 2026 Wage Base Notice",
  "lastVerifiedDate": "2026-10-01",
  "sourceAuthority": "Internal Revenue Service (IRS) & SSA",
  "sources": [
    {
      "authority": "Internal Revenue Service (IRS)",
      "title": "Revenue Procedure 2025-32 (2026 Inflation-Adjusted Tax Items) & Rev. Proc. 2024-40 (2025)",
      "url": "https://www.irs.gov/pub/irs-drop/rp-25-32.pdf",
      "sourceType": "GOVERNMENT",
      "publicationDate": "2025-10-22",
      "effectiveDate": "2026-01-01",
      "lastVerifiedDate": "2026-10-01"
    },
    {
      "authority": "Social Security Administration (SSA)",
      "title": "Social Security Wage Base 2026: $184,500 (ssa.gov/oact/cola/cbb.html)",
      "url": "https://www.ssa.gov/oact/cola/cbb.html",
      "sourceType": "GOVERNMENT",
      "publicationDate": "2025-10-10",
      "effectiveDate": "2026-01-01",
      "lastVerifiedDate": "2026-10-01"
    }
  ],
  "calculationScope": "Models Federal Income Tax by filing status using year-specific brackets (Rev. Proc. 2025-32 for 2026, Rev. Proc. 2024-40 for 2025): standard deductions $16,100/$32,200 (2026) or $15,000/$30,000 (2025); Social Security 6.2% up to $184,500 (2026)/$176,100 (2025) wage base; Medicare 1.45% + 0.9% Additional Medicare over $200k/$250k MFJ; and state income tax (CA/NY progressive brackets; statutory flat rates for other states).",
  "knownExclusions": [
    "Local/municipal income taxes (e.g. New York City resident tax, Yonkers)",
    "Child Tax Credit and Earned Income Tax Credit phaseouts",
    "Alternative Minimum Tax (AMT)"
  ],
  "disclaimerNote": "2026 brackets from IRS Rev. Proc. 2025-32; 2025 brackets from Rev. Proc. 2024-40. State income tax where selected. Local/city taxes excluded. Estimated annualized take-home — not official payroll withholding.",
  "popular": true
};

// 2. United States Federal + FICA + State Selection (2025 / 2026)
export function calculateUsTax(
  taxableIncomeAnnual: number,
  grossCompensationAnnual: number,
  filingStatus: UsFilingStatus,
  stateCode = 'TX',
  taxYear = '2026'
): {
  federalIncomeTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  stateIncomeTax: number;
  employerFica: number;
  standardDeduction: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  // Year-discriminated standard deductions and brackets
  // 2026: IRS Rev. Proc. 2025-32 (inflation-adjusted + OBBBA provisions)
  // 2025: IRS Rev. Proc. 2024-40
  const is2026Us = taxYear === '2026';

  const standardDeductions: Record<UsFilingStatus, number> = is2026Us
    ? { single: 16100, mfj: 32200, mfs: 16100, hoh: 24150 }  // Rev. Proc. 2025-32
    : { single: 15000, mfj: 30000, mfs: 15000, hoh: 22500 };  // Rev. Proc. 2024-40
  const standardDeduction = standardDeductions[filingStatus];

  let brackets: TaxBracket[];
  if (filingStatus === 'mfj') {
    brackets = is2026Us
      ? [
          // 2026 MFJ — Rev. Proc. 2025-32
          { min: 0, max: 24800, rate: 0.10, baseTax: 0 },
          { min: 24800, max: 100800, rate: 0.12, baseTax: 2480 },
          { min: 100800, max: 211400, rate: 0.22, baseTax: 11600 },
          { min: 211400, max: 403550, rate: 0.24, baseTax: 35932 },
          { min: 403550, max: 512450, rate: 0.32, baseTax: 82048 },
          { min: 512450, max: 768700, rate: 0.35, baseTax: 116896 },
          { min: 768700, max: null, rate: 0.37, baseTax: 206583.5 },
        ]
      : [
          // 2025 MFJ — Rev. Proc. 2024-40
          { min: 0, max: 23850, rate: 0.10, baseTax: 0 },
          { min: 23850, max: 96950, rate: 0.12, baseTax: 2385 },
          { min: 96950, max: 206700, rate: 0.22, baseTax: 11157 },
          { min: 206700, max: 394600, rate: 0.24, baseTax: 35302 },
          { min: 394600, max: 501050, rate: 0.32, baseTax: 80398 },
          { min: 501050, max: 751600, rate: 0.35, baseTax: 114462 },
          { min: 751600, max: null, rate: 0.37, baseTax: 202154.5 },
        ];
  } else if (filingStatus === 'hoh') {
    brackets = is2026Us
      ? [
          // 2026 HOH — Rev. Proc. 2025-32
          { min: 0, max: 17700, rate: 0.10, baseTax: 0 },
          { min: 17700, max: 67450, rate: 0.12, baseTax: 1770 },
          { min: 67450, max: 105700, rate: 0.22, baseTax: 7740 },
          { min: 105700, max: 201775, rate: 0.24, baseTax: 16155 },
          { min: 201775, max: 256225, rate: 0.32, baseTax: 39213 },
          { min: 256225, max: 640600, rate: 0.35, baseTax: 56637 },
          { min: 640600, max: null, rate: 0.37, baseTax: 191168.25 },
        ]
      : [
          // 2025 HOH — Rev. Proc. 2024-40
          { min: 0, max: 17000, rate: 0.10, baseTax: 0 },
          { min: 17000, max: 64850, rate: 0.12, baseTax: 1700 },
          { min: 64850, max: 103350, rate: 0.22, baseTax: 7442 },
          { min: 103350, max: 197300, rate: 0.24, baseTax: 15912 },
          { min: 197300, max: 250500, rate: 0.32, baseTax: 38460 },
          { min: 250500, max: 626350, rate: 0.35, baseTax: 55484 },
          { min: 626350, max: null, rate: 0.37, baseTax: 187031.5 },
        ];
  } else {
    // Single and MFS use same brackets
    brackets = is2026Us
      ? [
          // 2026 Single/MFS — Rev. Proc. 2025-32
          { min: 0, max: 12400, rate: 0.10, baseTax: 0 },
          { min: 12400, max: 50400, rate: 0.12, baseTax: 1240 },
          { min: 50400, max: 105700, rate: 0.22, baseTax: 5800 },
          { min: 105700, max: 201775, rate: 0.24, baseTax: 17966 },
          { min: 201775, max: 256225, rate: 0.32, baseTax: 41024 },
          { min: 256225, max: 640600, rate: 0.35, baseTax: 58448 },
          { min: 640600, max: null, rate: 0.37, baseTax: 192979.25 },
        ]
      : [
          // 2025 Single/MFS — Rev. Proc. 2024-40
          { min: 0, max: 11925, rate: 0.10, baseTax: 0 },
          { min: 11925, max: 48475, rate: 0.12, baseTax: 1192.5 },
          { min: 48475, max: 103350, rate: 0.22, baseTax: 5578.5 },
          { min: 103350, max: 197300, rate: 0.24, baseTax: 17651 },
          { min: 197300, max: 250525, rate: 0.32, baseTax: 40199 },
          { min: 250525, max: 626350, rate: 0.35, baseTax: 57231 },
          { min: 626350, max: null, rate: 0.37, baseTax: 188769.75 },
        ];
  }

  const incomeAfterStdDeduction = Math.max(0, taxableIncomeAnnual - standardDeduction);
  const { totalTax: federalIncomeTax, audits, marginalRate } = calculateProgressiveTax(incomeAfterStdDeduction, brackets);

  // FICA Social Security: 6.2% up to $184,500 (2026 SSA statutory wage base; $176,100 in 2025)
  // Source: SSA Notice of Wage Base and Benefit Rates (announced Oct 2025, effective Jan 1 2026)
  const ssWageCap = taxYear === '2025' ? 176100 : 184500;
  const ssTaxableWages = Math.min(grossCompensationAnnual, ssWageCap);
  const socialSecurityTax = ssTaxableWages * 0.062;

  // FICA Medicare: 1.45% uncapped + 0.9% additional over $200k (Single) / $250k (MFJ)
  const additionalMedicareThreshold = filingStatus === 'mfj' ? 250000 : 200000;
  let medicareTax = grossCompensationAnnual * 0.0145;
  if (grossCompensationAnnual > additionalMedicareThreshold) {
    medicareTax += (grossCompensationAnnual - additionalMedicareThreshold) * 0.009;
  }

  // State Tax: Supports progressive CA and NY, statutory flat rates, and 0% states
  let stateIncomeTax = 0;
  if (stateCode === 'CA') {
    const caStdDed = filingStatus === 'mfj' ? 11080 : 5540;
    const caTaxable = Math.max(0, taxableIncomeAnnual - caStdDed);
    const caBrackets: TaxBracket[] = filingStatus === 'mfj'
      ? [
          { min: 0, max: 21512, rate: 0.01, baseTax: 0 },
          { min: 21512, max: 50998, rate: 0.02, baseTax: 215.12 },
          { min: 50998, max: 80490, rate: 0.04, baseTax: 804.84 },
          { min: 80490, max: 111732, rate: 0.06, baseTax: 1984.52 },
          { min: 111732, max: 141212, rate: 0.08, baseTax: 3859.04 },
          { min: 141212, max: 721318, rate: 0.093, baseTax: 6217.44 },
          { min: 721318, max: 865574, rate: 0.103, baseTax: 60167.3 },
          { min: 865574, max: 1442628, rate: 0.113, baseTax: 75025.66 },
          { min: 1442628, max: 2000000, rate: 0.123, baseTax: 140232.76 },
          { min: 2000000, max: null, rate: 0.133, baseTax: 208789.52 },
        ]
      : [
          { min: 0, max: 10756, rate: 0.01, baseTax: 0 },
          { min: 10756, max: 25499, rate: 0.02, baseTax: 107.56 },
          { min: 25499, max: 40245, rate: 0.04, baseTax: 402.42 },
          { min: 40245, max: 55866, rate: 0.06, baseTax: 992.26 },
          { min: 55866, max: 70606, rate: 0.08, baseTax: 1929.52 },
          { min: 70606, max: 360659, rate: 0.093, baseTax: 3108.72 },
          { min: 360659, max: 432787, rate: 0.103, baseTax: 30083.65 },
          { min: 432787, max: 721314, rate: 0.113, baseTax: 37512.83 },
          { min: 721314, max: 1000000, rate: 0.123, baseTax: 70116.38 },
          { min: 1000000, max: null, rate: 0.133, baseTax: 104394.86 },
        ];
    stateIncomeTax = calculateProgressiveTax(caTaxable, caBrackets).totalTax;
  } else if (stateCode === 'NY') {
    const nyStdDed = filingStatus === 'mfj' ? 16050 : 8000;
    const nyTaxable = Math.max(0, taxableIncomeAnnual - nyStdDed);
    const nyBrackets: TaxBracket[] = filingStatus === 'mfj'
      ? [
          { min: 0, max: 17150, rate: 0.04, baseTax: 0 },
          { min: 17150, max: 23600, rate: 0.045, baseTax: 686 },
          { min: 23600, max: 27900, rate: 0.0525, baseTax: 976.25 },
          { min: 27900, max: 161550, rate: 0.055, baseTax: 1202 },
          { min: 161550, max: 323200, rate: 0.06, baseTax: 8552.75 },
          { min: 323200, max: 2155350, rate: 0.0685, baseTax: 18251.75 },
          { min: 2155350, max: 5000000, rate: 0.0965, baseTax: 143754.02 },
          { min: 5000000, max: null, rate: 0.109, baseTax: 418262.89 },
        ]
      : [
          { min: 0, max: 8500, rate: 0.04, baseTax: 0 },
          { min: 8500, max: 11700, rate: 0.045, baseTax: 340 },
          { min: 11700, max: 13900, rate: 0.0525, baseTax: 484 },
          { min: 13900, max: 80650, rate: 0.055, baseTax: 599.5 },
          { min: 80650, max: 215400, rate: 0.06, baseTax: 4270.75 },
          { min: 215400, max: 1077550, rate: 0.0685, baseTax: 12355.75 },
          { min: 1077550, max: 5000000, rate: 0.0965, baseTax: 71418.03 },
          { min: 5000000, max: null, rate: 0.109, baseTax: 449934.45 },
        ];
    stateIncomeTax = calculateProgressiveTax(nyTaxable, nyBrackets).totalTax;
  } else {
    const stateMeta = US_STATES.find((s) => s.code === stateCode);
    if (stateMeta && stateMeta.taxRatePercent) {
      stateIncomeTax = incomeAfterStdDeduction * (stateMeta.taxRatePercent / 100);
    }
  }

  const employerFica = ssTaxableWages * 0.062 + grossCompensationAnnual * 0.0145;

  return {
    federalIncomeTax,
    socialSecurityTax,
    medicareTax,
    stateIncomeTax,
    employerFica,
    standardDeduction,
    audits,
    marginalRate,
  };
}

export default function UnitedStatesSalaryCalculator() {
  const formId = useId();

  // Fresh initial state (Zero-Prefill)
  const [grossSalaryInput, setGrossSalaryInput] = useState<string>('');
  const [frequency, setFrequency] = useState<PayFrequency>('annual');
  const [preTaxDeductionInput, setPreTaxDeductionInput] = useState<string>('');
  const [taxYear, setTaxYear] = useState<string>(METADATA.defaultTaxYear);
  const [filingStatus, setFilingStatus] = useState<UsFilingStatus>('single');
  const [stateCode, setStateCode] = useState<string>('TX');

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

    const res = calculateUsTax(taxableGrossAfterPreTax, annualGross, filingStatus, stateCode, taxYear);
    const annualIncomeTax = res.federalIncomeTax + res.stateIncomeTax;
    const annualEmployeeSocial = res.socialSecurityTax + res.medicareTax;
    const annualTotalDeductions = annualIncomeTax + annualEmployeeSocial + effectivePreTax;
    const annualNet = Math.max(0, annualGross - annualTotalDeductions);
    const annualEmployerSocial = res.employerFica;
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
  }, [annualGross, periodsPerYear, taxYear, filingStatus, stateCode, parsedPreTax]);

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
          <span className="text-4xl select-none" role="img" aria-label="United States Flag">
            {METADATA.flag}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                United States Salary &amp; Take-Home Calculator
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
              Calculate net pay, statutory withholding, and employer payroll cost for United States ({taxYear}).
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
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

          {/* Filing Status */}
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-filing`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Filing Status
            </label>
            <select
              id={`${formId}-filing`}
              value={filingStatus}
              onChange={(e) => setFilingStatus(e.target.value as UsFilingStatus)}
              className="w-full py-3 px-3 bg-gray-50/70 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="single">Single Filer</option>
              <option value="mfj">Married Filing Jointly</option>
              <option value="mfs">Married Filing Separately</option>
              <option value="hoh">Head of Household</option>
            </select>
          </div>

          {/* State Jurisdiction */}
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-state`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
              State Jurisdiction
            </label>
            <select
              id={`${formId}-state`}
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="w-full py-3 px-3 bg-gray-50/70 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {US_STATES.map((st) => (
                <option key={st.code} value={st.code}>
                  {st.name} ({st.code})
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
          presets={[{"label":"$60,000 / yr","amount":"60000","freq":"annual"},{"label":"$85,000 / yr","amount":"85000","freq":"annual"},{"label":"$120,000 / yr","amount":"120000","freq":"annual"},{"label":"$175,000 / yr","amount":"175000","freq":"annual"},{"label":"$250,000 / yr","amount":"250000","freq":"annual"}]}
          onSelectPreset={(amt, freq) => {
            setGrossSalaryInput(amt);
            if (freq) setFrequency(freq);
          }}
          preTaxDeductionInput={preTaxDeductionInput}
          onPreTaxDeductionChange={setPreTaxDeductionInput}
          preTaxDeductionLabel="Annual Pre-Tax 401(k) / 403(b) / HSA / Traditional IRA Contributions"
          preTaxDeductionHint="2026 IRS elective deferral limit: $24,500 for 401(k) + $4,400 self-only ($8,750 family) for HSA. Reduces federal & state taxable income."
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
                −{formatCurrency(result.rawRes.federalIncomeTax, METADATA.currency, METADATA.symbol, METADATA.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">State Income Tax ({stateCode})</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.stateIncomeTax, METADATA.currency, METADATA.symbol, METADATA.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">Social Security Tax (OASDI 6.2%)</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.socialSecurityTax, METADATA.currency, METADATA.symbol, METADATA.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">Medicare (HI 1.45% + Addl)</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.medicareTax, METADATA.currency, METADATA.symbol, METADATA.decimals)}
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
              const r = calculateUsTax(Math.max(0, candGross - effPre), candGross, filingStatus, stateCode, taxYear);
              const tax = r.federalIncomeTax + r.stateIncomeTax;
              const soc = r.socialSecurityTax + r.medicareTax;
              const tot = tax + soc + effPre;
              return { annualNet: Math.max(0, candGross - tot), annualIncomeTax: tax, annualEmployeeSocial: soc, annualTotalDeductions: tot, annualEmployerCost: candGross + r.employerFica };
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
