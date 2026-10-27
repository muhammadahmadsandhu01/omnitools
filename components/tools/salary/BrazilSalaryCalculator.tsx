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
import {
  SalaryPresetBar,
  SalaryInsightsAndExportSuite,
} from '@/components/tools/salary/shared/SalaryAnalysisToolbar';

/* =========================================================================
   BRAZIL STATUTORY SALARY CALCULATOR ENGINE
   Authority: Receita Federal do Brasil (RFB) & Previdência Social
   Ruleset: BR-RFB-2026.1
   ========================================================================= */

export const METADATA = {
  "code": "BR",
  "iso3": "BRA",
  "name": "Brazil",
  "flag": "🇧🇷",
  "currency": "BRL",
  "symbol": "R$",
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
  "rulesetId": "BR-RFB-2026.1",
  "ruleVersion": "Receita Federal Tabela Progressiva IRPF + INSS Progressivo (Portaria Interministerial) & FGTS",
  "lastVerifiedDate": "2026-10-01",
  "sourceAuthority": "Receita Federal do Brasil (RFB) & Previdência Social",
  "sources": [
    {
      "authority": "Receita Federal do Brasil (RFB)",
      "title": "Tabela Progressiva Mensal do Imposto de Renda Pessoa Física",
      "url": "https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas",
      "sourceType": "TAX_AUTHORITY",
      "publicationDate": "2024-05-01",
      "effectiveDate": "2024-05-01",
      "lastVerifiedDate": "2026-10-01"
    },
    {
      "authority": "Ministério da Previdência Social / Ministério da Fazenda",
      "title": "Portaria Interministerial MPS/MF nº 13/2026 — Reajuste dos Benefícios e Tabela de Contribuição do INSS (Teto R$ 8.475,55; DOU Edição 7, Seção 1, Página 54)",
      "url": "https://www.in.gov.br/en/web/dou/-/portaria-interministerial-mps/mf-n-13-de-9-de-janeiro-de-2026",
      "sourceType": "STATUTORY_INSTITUTION",
      "publicationDate": "2026-01-09",
      "effectiveDate": "2026-01-01",
      "lastVerifiedDate": "2026-10-01"
    },
    {
      "authority": "Ministério da Previdência Social",
      "title": "Portaria Interministerial MPS/MF nº 6/2025 — Tabela Histórica de Contribuição do INSS (Teto R$ 8.157,41)",
      "url": "https://www.gov.br/previdencia/",
      "sourceType": "STATUTORY_INSTITUTION",
      "publicationDate": "2025-01-10",
      "effectiveDate": "2025-01-01",
      "lastVerifiedDate": "2026-10-01"
    }
  ],
  "calculationScope": "IRPF monthly progressive table (0%, 7.5%, 15%, 22.5%, 27.5%) with simplified monthly discount (R$ 564.80). INSS progressive employee tiers (7.5%, 9.0%, 12.0%, 14.0%) capped at R$ 8,475.55/month for 2026 (Portaria Interministerial MPS/MF nº 13/2026; max employee contribution R$ 988.09/mo); R$ 8,157.41/month for 2025 (Portaria 6/2025; max R$ 951.63/mo); R$ 7,786.02 for 2024. INSS is deductible before IRPF. Employer statutory CLT burden: 20% INSS + 5.8% Terceiros + 2% RAT + 8% FGTS = 35.8%.",
  "knownExclusions": [
    "13th salary and 1/3 vacation bonus separate taxation",
    "Dependent deduction (Dedução por dependente R$ 189.59/month)",
    "Medical and private education deductions"
  ],
  "disclaimerNote": "Receita Federal IRPF and INSS progressive tables (Portaria Interministerial MPS/MF nº 13/2026 for 2026; Portaria 6/2025 for 2025). Annualized standard CLT model.",
  "popular": true
};

// 17. Brazil (BR) — Receita Federal IRPF Progressivo + INSS Progressivo CLT & Encargos Patronais
export function calculateBrazilTax(
  grossTaxableAnnual: number,
  taxYear = '2026'
): {
  incomeTax: number;
  employeeSocial: number;
  employerSocial: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  // CLT payroll is officially evaluated on monthly compensation
  const monthlyGross = grossTaxableAnnual / 12;

  // Tabela Progressiva INSS:
  // - 2026: Portaria Interministerial MPS/MF nº 13/2026 (teto R$ 8.475,55; faixas: R$ 1.621,00 / R$ 2.902,84 / R$ 4.354,27 / R$ 8.475,55)
  // - 2025: Portaria Interministerial MPS/MF nº 6/2025 (teto R$ 8.157,41; faixas: R$ 1.518,00 / R$ 2.793,88 / R$ 4.190,83 / R$ 8.157,41)
  // - 2024: Portaria Interministerial MPS/MF nº 2/2024 (teto R$ 7.786,02; faixas: R$ 1.412,00 / R$ 2.666,68 / R$ 4.000,03 / R$ 7.786,02)
  const is2024 = taxYear === '2024';
  const is2025 = taxYear === '2025';
  const t1 = is2024 ? 1412.0 : is2025 ? 1518.0 : 1621.0;
  const t2 = is2024 ? 2666.68 : is2025 ? 2793.88 : 2902.84;
  const t3 = is2024 ? 4000.03 : is2025 ? 4190.83 : 4354.27;
  const t4 = is2024 ? 7786.02 : is2025 ? 8157.41 : 8475.55;

  let monthlyInss = 0;
  if (monthlyGross > 0) {
    const tier1 = Math.min(monthlyGross, t1) * 0.075;
    const tier2 = Math.max(0, Math.min(monthlyGross, t2) - t1) * 0.09;
    const tier3 = Math.max(0, Math.min(monthlyGross, t3) - t2) * 0.12;
    const tier4 = Math.max(0, Math.min(monthlyGross, t4) - t3) * 0.14;
    monthlyInss = tier1 + tier2 + tier3 + tier4;
  }
  const employeeSocial = monthlyInss * 12;

  // Monthly IRPF Base: worker benefits from higher of legal INSS deduction or simplified discount R$ 564.80/mo
  const monthlyDeduction = Math.max(monthlyInss, 564.8);
  const monthlyBase = Math.max(0, monthlyGross - monthlyDeduction);

  // Tabela Progressiva Mensal IRPF (Receita Federal)
  let monthlyIrpf = 0;
  let marginalRate = 0;
  if (monthlyBase > 4664.68) {
    monthlyIrpf = monthlyBase * 0.275 - 896.0;
    marginalRate = 27.5;
  } else if (monthlyBase > 3751.05) {
    monthlyIrpf = monthlyBase * 0.225 - 662.77;
    marginalRate = 22.5;
  } else if (monthlyBase > 2826.65) {
    monthlyIrpf = monthlyBase * 0.15 - 381.44;
    marginalRate = 15.0;
  } else if (monthlyBase > 2259.2) {
    monthlyIrpf = monthlyBase * 0.075 - 169.44;
    marginalRate = 7.5;
  } else {
    monthlyIrpf = 0;
    marginalRate = 0;
  }
  monthlyIrpf = Math.max(0, monthlyIrpf);
  const incomeTax = monthlyIrpf * 12;

  // Employer Statutory Burden CLT: 35.8% (20% INSS Patronal + 5.8% Terceiros + 2% RAT + 8% FGTS)
  const employerSocial = grossTaxableAnnual * 0.358;

  const audits: TaxBracketAudit[] = [
    {
      bracketIndex: 1,
      min: 0,
      max: 2259.2 * 12,
      taxableAmountInBracket: Math.min(monthlyBase * 12, 2259.2 * 12),
      rate: 0,
      taxForBracket: 0,
      cumulativeTax: 0,
    },
    {
      bracketIndex: 2,
      min: 2259.2 * 12,
      max: null,
      taxableAmountInBracket: Math.max(0, monthlyBase * 12 - 2259.2 * 12),
      rate: marginalRate,
      taxForBracket: incomeTax,
      cumulativeTax: incomeTax,
    },
  ];

  return {
    incomeTax,
    employeeSocial,
    employerSocial,
    audits,
    marginalRate,
  };
}

export default function BrazilSalaryCalculator() {
  const formId = useId();

  // Fresh initial state (Zero-Prefill)
  const [grossSalaryInput, setGrossSalaryInput] = useState<string>('');
  const [frequency, setFrequency] = useState<PayFrequency>('monthly');
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

    const res = calculateBrazilTax(taxableGrossAfterPreTax, taxYear);
    const annualIncomeTax = res.incomeTax;
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
          <span className="text-4xl select-none" role="img" aria-label="Brazil Flag">
            {METADATA.flag}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                Brazil Salary &amp; Take-Home Calculator
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
              Calculate net pay, statutory withholding, and employer payroll cost for Brazil ({taxYear}).
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['annual', 'monthly', 'biweekly', 'weekly'] as PayFrequency[]).map((freq) => (
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
          presets={[{"label":"R$ 5.000 / mo","amount":"5000","freq":"monthly"},{"label":"R$ 8.500 / mo","amount":"8500","freq":"monthly"},{"label":"R$ 12.000 / mo","amount":"12000","freq":"monthly"},{"label":"R$ 20.000 / mo","amount":"20000","freq":"monthly"},{"label":"R$ 120.000 / yr","amount":"120000","freq":"annual"}]}
          onSelectPreset={(amt, freq) => {
            setGrossSalaryInput(amt);
            if (freq) setFrequency(freq);
          }}
          preTaxDeductionInput={preTaxDeductionInput}
          onPreTaxDeductionChange={setPreTaxDeductionInput}
          preTaxDeductionLabel="Annual Previdência Privada (PGBL — up to 12%) / Dependent Deductions"
          preTaxDeductionHint="PGBL private pension or dependent deductions (R$ 2.275,08/yr per dependent) reducing IRPF base."
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
              {result.annualPreTaxDeductions > 0 && (
                <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
                  <span className="text-slate-600 dark:text-slate-400">Pre-Tax Deductions / Salary Sacrifice</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400 tabular-nums">
                    −{formatCurrency(result.annualPreTaxDeductions, METADATA.currency, METADATA.symbol, METADATA.decimals)}
                  </span>
                </div>
              )}

            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">Imposto de Renda (IRRF)</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.incomeTax, METADATA.currency, METADATA.symbol, METADATA.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">INSS Empregado (Tabela Progressiva)</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                −{formatCurrency(result.rawRes.employeeSocial, METADATA.currency, METADATA.symbol, METADATA.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400">FGTS (8%) + Encargos Patronais</span>
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
              const r = calculateBrazilTax(Math.max(0, candGross - effPre), taxYear);
              const tot = r.incomeTax + r.employeeSocial + effPre;
              return { annualNet: Math.max(0, candGross - tot), annualIncomeTax: r.incomeTax, annualEmployeeSocial: r.employeeSocial, annualTotalDeductions: tot, annualEmployerCost: candGross + r.employerSocial };
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
