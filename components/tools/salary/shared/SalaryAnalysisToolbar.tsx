'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Download,
  Printer,
  Copy,
  Check,
  Target,
  ArrowRight,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  PieChart,
  Calendar,
} from 'lucide-react';
import { PayFrequency } from '@/components/tools/SalaryCalculator';

/* =========================================================================
   TYPE DEFINITIONS
   ========================================================================= */

export interface SalaryPreset {
  label: string;
  amount: string;
  freq?: PayFrequency;
}

export interface SalaryPresetBarProps {
  currency: string;
  symbol: string;
  presets: SalaryPreset[];
  onSelectPreset: (amt: string, freq?: PayFrequency) => void;
  preTaxDeductionInput?: string;
  onPreTaxDeductionChange?: (val: string) => void;
  preTaxDeductionLabel?: string;
  preTaxDeductionHint?: string;
}

export interface SalaryResultSummary {
  annualGross: number;
  annualPreTaxDeductions?: number;
  annualIncomeTax: number;
  annualEmployeeSocial: number;
  annualTotalDeductions: number;
  annualNet: number;
  annualEmployerSocial?: number;
  annualEmployerCost?: number;
  effectiveTaxRate?: number;
  effectiveTotalRate?: number;
  marginalRate?: number;
}

export interface ComputedGrossNetBreakdown {
  annualNet: number;
  annualIncomeTax: number;
  annualEmployeeSocial: number;
  annualTotalDeductions: number;
  annualEmployerCost?: number;
}

export interface SalaryInsightsAndExportSuiteProps {
  countryName: string;
  currency: string;
  symbol: string;
  decimals?: number;
  taxYear?: string;
  rulesetId?: string;
  result: SalaryResultSummary;
  computeNetFromAnnualGross?: (candGross: number) => ComputedGrossNetBreakdown;
  onApplyRequiredGross?: (reqAnnual: number) => void;
}

/* =========================================================================
   HELPER FORMATTERS
   ========================================================================= */

function formatMoney(amount: number, currency: string, symbol: string, decimals: number = 0): string {
  const spacing = symbol.length > 1 ? ' ' : '';
  if (!isFinite(amount) || isNaN(amount)) return `${symbol}${spacing}0`;
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol}${spacing}${formatted}`;
}

function formatPct(rate: number): string {
  if (!isFinite(rate) || isNaN(rate)) return '0.0%';
  return `${rate.toFixed(1)}%`;
}

/* =========================================================================
   COMPONENT 1: SalaryPresetBar
   ========================================================================= */

export function SalaryPresetBar({
  currency,
  symbol,
  presets,
  onSelectPreset,
  preTaxDeductionInput = '',
  onPreTaxDeductionChange,
  preTaxDeductionLabel = 'Pre-Tax Deductions / Salary Sacrifice',
  preTaxDeductionHint,
}: SalaryPresetBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hasPreTax = Boolean(onPreTaxDeductionChange);
  const isDeductionActive = Boolean(preTaxDeductionInput && parseFloat(preTaxDeductionInput) > 0);

  return (
    <div className="space-y-3 pt-2">
      {/* Quick Preset Buttons */}
      {presets && presets.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Quick Salary Presets
            </span>
            {hasPreTax && (
              <button
                type="button"
                onClick={() => setDrawerOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                  isDeductionActive || drawerOpen
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{preTaxDeductionLabel.split('/')[0].trim()}</span>
                {isDeductionActive && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
                {drawerOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPreset(preset.amount, preset.freq)}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-800/80 dark:hover:bg-blue-950/50 dark:hover:text-blue-300 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 transition-all active:scale-95"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pre-Tax Deduction Collapsible Drawer */}
      {hasPreTax && drawerOpen && (
        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/50 space-y-2 text-xs transition-all animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800 dark:text-slate-200 block">
              {preTaxDeductionLabel} ({currency})
            </label>
            {isDeductionActive && (
              <button
                type="button"
                onClick={() => onPreTaxDeductionChange?.('')}
                className="text-[11px] text-rose-600 hover:underline font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="relative flex items-center max-w-sm">
            <span className="absolute left-3 font-bold text-slate-400 select-none">
              {symbol}
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={preTaxDeductionInput}
              onChange={(e) => onPreTaxDeductionChange?.(e.target.value)}
              placeholder="e.g. 5,000"
              className={`w-full ${symbol.length > 2 ? 'pl-12' : 'pl-8'} pr-3 py-2 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums`}
            />
          </div>

          {preTaxDeductionHint && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {preTaxDeductionHint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   COMPONENT 2: SalaryInsightsAndExportSuite
   ========================================================================= */

export function SalaryInsightsAndExportSuite({
  countryName,
  currency,
  symbol,
  decimals = 0,
  taxYear = '2026',
  rulesetId,
  result,
  computeNetFromAnnualGross,
  onApplyRequiredGross,
}: SalaryInsightsAndExportSuiteProps) {
  const [copied, setCopied] = useState(false);

  // Target Net Solver State
  const [targetNetInput, setTargetNetInput] = useState('');
  const [targetFreq, setTargetFreq] = useState<'monthly' | 'annual'>('monthly');

  // Allocation Percentages
  const annualGross = Math.max(0, result.annualGross || 0);
  const netPay = Math.max(0, result.annualNet || 0);
  const incomeTax = Math.max(0, result.annualIncomeTax || 0);
  const socialIns = Math.max(0, result.annualEmployeeSocial || 0);
  const preTax = Math.max(0, result.annualPreTaxDeductions || 0);

  const netPct = annualGross > 0 ? (netPay / annualGross) * 100 : 0;
  const taxPct = annualGross > 0 ? (incomeTax / annualGross) * 100 : 0;
  const socialPct = annualGross > 0 ? (socialIns / annualGross) * 100 : 0;
  const preTaxPct = annualGross > 0 ? (preTax / annualGross) * 100 : 0;

  // 7-Period Compensation Breakdown
  const periods = useMemo(() => {
    if (annualGross <= 0) return [];
    return [
      { label: 'Annual', count: 1 },
      { label: 'Semi-Annual', count: 2 },
      { label: 'Quarterly', count: 4 },
      { label: 'Monthly', count: 12 },
      { label: 'Semi-Monthly', count: 24 },
      { label: 'Bi-Weekly', count: 26 },
      { label: 'Weekly', count: 52 },
      { label: 'Daily (260d)', count: 260 },
      { label: 'Hourly (2080h)', count: 2080 },
    ].map((p) => ({
      label: p.label,
      gross: annualGross / p.count,
      tax: incomeTax / p.count,
      social: socialIns / p.count,
      preTax: preTax / p.count,
      net: netPay / p.count,
    }));
  }, [annualGross, incomeTax, socialIns, preTax, netPay]);

  // Copy Summary Handler
  const handleCopySummary = useCallback(() => {
    const text = [
      `--- ${countryName} Salary Calculation Summary (${taxYear}) ---`,
      rulesetId ? `Statutory Ruleset: ${rulesetId}` : null,
      `Annual Gross: ${formatMoney(annualGross, currency, symbol, decimals)}`,
      `Net Take-Home (Annual): ${formatMoney(netPay, currency, symbol, decimals)} (${formatPct(netPct)})`,
      `Net Take-Home (Monthly): ${formatMoney(netPay / 12, currency, symbol, decimals)}`,
      `Income Tax: ${formatMoney(incomeTax, currency, symbol, decimals)} (${formatPct(taxPct)})`,
      `Social Security / National Ins: ${formatMoney(socialIns, currency, symbol, decimals)} (${formatPct(socialPct)})`,
      preTax > 0 ? `Pre-Tax Deductions: ${formatMoney(preTax, currency, symbol, decimals)} (${formatPct(preTaxPct)})` : null,
      result.annualEmployerCost ? `Total Employer Cost: ${formatMoney(result.annualEmployerCost, currency, symbol, decimals)}` : null,
      result.effectiveTaxRate !== undefined ? `Effective Tax Rate: ${formatPct(result.effectiveTaxRate)}` : null,
      result.marginalRate !== undefined ? `Marginal Rate: ${formatPct(result.marginalRate)}` : null,
      `Calculated via KivaroTools: https://kivarotools.com/finance/salary-calculator`,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [countryName, taxYear, rulesetId, annualGross, netPay, incomeTax, socialIns, preTax, result, currency, symbol, decimals, netPct, taxPct, socialPct, preTaxPct]);

  // CSV Export Handler
  const handleExportCsv = useCallback(() => {
    const headers = ['Frequency', 'Gross Salary', 'Income Tax', 'Social Security', 'Pre-Tax Deductions', 'Net Take-Home'];
    const rows = periods.map((p) => [
      p.label,
      p.gross.toFixed(decimals),
      p.tax.toFixed(decimals),
      p.social.toFixed(decimals),
      p.preTax.toFixed(decimals),
      p.net.toFixed(decimals),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${countryName.toLowerCase().replace(/\s+/g, '_')}_salary_schedule_${taxYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [countryName, taxYear, periods, decimals]);

  // Print Handler
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Target Net Reverse Solver (Binary Search)
  const targetSolution = useMemo(() => {
    if (!computeNetFromAnnualGross) return null;
    const cleaned = parseFloat(targetNetInput.replace(/,/g, ''));
    if (!cleaned || cleaned <= 0) return null;

    const annualTarget = targetFreq === 'monthly' ? cleaned * 12 : cleaned;

    // High-precision binary search between target and 5x target (+ fixed buffer for pre-tax deductions)
    let low = annualTarget;
    let high = Math.max(annualTarget * 5, annualTarget + 100000);
    let bestGross = high;
    let bestDiff = Infinity;

    for (let iter = 0; iter < 60; iter++) {
      const mid = (low + high) / 2;
      const res = computeNetFromAnnualGross(mid);
      const diff = res.annualNet - annualTarget;

      if (Math.abs(diff) < bestDiff) {
        bestDiff = Math.abs(diff);
        bestGross = mid;
      }

      if (Math.abs(diff) < 0.005) break;

      if (diff < 0) {
        low = mid;
      } else {
        high = mid;
      }
    }

    const finalRes = computeNetFromAnnualGross(bestGross);
    return {
      annualTarget,
      requiredAnnualGross: bestGross,
      requiredMonthlyGross: bestGross / 12,
      effectiveTax: finalRes.annualIncomeTax,
      effectiveSocial: finalRes.annualEmployeeSocial,
    };
  }, [computeNetFromAnnualGross, targetNetInput, targetFreq]);

  return (
    <div className="space-y-6 pt-2">
      {/* 1. VISUAL ALLOCATION PROGRESS BAR */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Gross Earnings Allocation Breakdown
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500 tabular-nums">
            Total Gross: {formatMoney(annualGross, currency, symbol, decimals)}
          </span>
        </div>

        {/* Stacked Bar */}
        <div className="h-6 w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex shadow-inner">
          {netPct > 0 && (
            <div
              style={{ width: `${netPct}%` }}
              className="bg-emerald-500 hover:bg-emerald-400 transition-all flex items-center justify-center text-[10px] font-extrabold text-white"
              title={`Net Take-Home: ${formatPct(netPct)}`}
            >
              {netPct >= 15 ? formatPct(netPct) : ''}
            </div>
          )}
          {taxPct > 0 && (
            <div
              style={{ width: `${taxPct}%` }}
              className="bg-rose-500 hover:bg-rose-400 transition-all flex items-center justify-center text-[10px] font-extrabold text-white"
              title={`Income Tax: ${formatPct(taxPct)}`}
            >
              {taxPct >= 12 ? formatPct(taxPct) : ''}
            </div>
          )}
          {socialPct > 0 && (
            <div
              style={{ width: `${socialPct}%` }}
              className="bg-amber-500 hover:bg-amber-400 transition-all flex items-center justify-center text-[10px] font-extrabold text-white"
              title={`Social Security / Levies: ${formatPct(socialPct)}`}
            >
              {socialPct >= 10 ? formatPct(socialPct) : ''}
            </div>
          )}
          {preTaxPct > 0 && (
            <div
              style={{ width: `${preTaxPct}%` }}
              className="bg-purple-500 hover:bg-purple-400 transition-all flex items-center justify-center text-[10px] font-extrabold text-white"
              title={`Pre-Tax Deductions: ${formatPct(preTaxPct)}`}
            >
              {preTaxPct >= 10 ? formatPct(preTaxPct) : ''}
            </div>
          )}
        </div>

        {/* Legend Chips */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-700 dark:text-slate-300">
              Net Pay ({formatPct(netPct)}):{' '}
              <strong className="text-slate-900 dark:text-white tabular-nums">
                {formatMoney(netPay, currency, symbol, decimals)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="text-slate-700 dark:text-slate-300">
              Income Tax ({formatPct(taxPct)}):{' '}
              <strong className="text-slate-900 dark:text-white tabular-nums">
                {formatMoney(incomeTax, currency, symbol, decimals)}
              </strong>
            </span>
          </div>

          {socialIns > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="text-slate-700 dark:text-slate-300">
                Social Ins ({formatPct(socialPct)}):{' '}
                <strong className="text-slate-900 dark:text-white tabular-nums">
                  {formatMoney(socialIns, currency, symbol, decimals)}
                </strong>
              </span>
            </div>
          )}

          {preTax > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
              <span className="text-slate-700 dark:text-slate-300">
                Pre-Tax ({formatPct(preTaxPct)}):{' '}
                <strong className="text-slate-900 dark:text-white tabular-nums">
                  {formatMoney(preTax, currency, symbol, decimals)}
                </strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. COMPREHENSIVE PERIODIC COMPENSATION SCHEDULE */}
      {periods.length > 0 && (
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Periodic Compensation Schedule ({taxYear})
              </h3>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                title="Copy Calculation Summary"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                title="Download CSV Spreadsheet"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                title="Print / Save PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto overscroll-x-contain">
            <table className="min-w-[580px] w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5 pr-3">Frequency</th>
                  <th className="py-2.5 px-3">Gross</th>
                  <th className="py-2.5 px-3 text-rose-600 dark:text-rose-400">Income Tax</th>
                  <th className="py-2.5 px-3 text-amber-600 dark:text-amber-400">Social / Levies</th>
                  {preTax > 0 && <th className="py-2.5 px-3 text-purple-600 dark:text-purple-400">Pre-Tax</th>}
                  <th className="py-2.5 pl-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">Net Take-Home</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {periods.map((row) => (
                  <tr key={row.label} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 pr-3 font-semibold text-slate-900 dark:text-slate-100">{row.label}</td>
                    <td className="py-2.5 px-3 tabular-nums font-medium">{formatMoney(row.gross, currency, symbol, decimals)}</td>
                    <td className="py-2.5 px-3 tabular-nums text-rose-600 dark:text-rose-400">−{formatMoney(row.tax, currency, symbol, decimals)}</td>
                    <td className="py-2.5 px-3 tabular-nums text-amber-600 dark:text-amber-400">
                      {row.social > 0 ? `−${formatMoney(row.social, currency, symbol, decimals)}` : '—'}
                    </td>
                    {preTax > 0 && (
                      <td className="py-2.5 px-3 tabular-nums text-purple-600 dark:text-purple-400">−{formatMoney(row.preTax, currency, symbol, decimals)}</td>
                    )}
                    <td className="py-2.5 pl-3 text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums text-sm">
                      {formatMoney(row.net, currency, symbol, decimals)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. REVERSE NET-TO-GROSS TARGET SOLVER */}
      {computeNetFromAnnualGross && onApplyRequiredGross && (
        <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/70 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-indigo-200/80 dark:border-indigo-900/50 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Target Take-Home Pay Solver (Reverse Calculator)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Want a specific net amount in your bank account? Enter your desired take-home to solve for the required gross.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Desired Net Take-Home ({currency})
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 font-bold text-slate-400 select-none">
                  {symbol}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={targetNetInput}
                  onChange={(e) => setTargetNetInput(e.target.value)}
                  placeholder={targetFreq === 'monthly' ? 'e.g. 5,000' : 'e.g. 60,000'}
                  className={`w-full ${symbol.length > 2 ? 'pl-12' : 'pl-9'} pr-3 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Target Pay Cycle
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['monthly', 'annual'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      if (f !== targetFreq) {
                        const val = parseFloat(targetNetInput.replace(/[^0-9.]/g, ''));
                        if (!isNaN(val) && val > 0) {
                          const converted = f === 'annual' ? val * 12 : val / 12;
                          setTargetNetInput(String(Math.round(converted * 100) / 100));
                        }
                        setTargetFreq(f);
                      }
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                      targetFreq === f
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Solved Target Result */}
          {targetSolution && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-indigo-200/90 dark:border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Required Contractual Gross Salary
                </span>
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {formatMoney(
                    targetFreq === 'monthly' ? targetSolution.requiredMonthlyGross : targetSolution.requiredAnnualGross,
                    currency,
                    symbol,
                    decimals
                  )}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    / {targetFreq} ({formatMoney(targetSolution.requiredAnnualGross, currency, symbol, decimals)} / yr)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onApplyRequiredGross(targetSolution.requiredAnnualGross)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors whitespace-nowrap active:scale-95"
              >
                <span>Apply This Gross</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SalaryInsightsAndExportSuite;
