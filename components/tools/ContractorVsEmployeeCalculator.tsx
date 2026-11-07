"use client";

import React, { useState, useMemo, useRef } from 'react';
import {
    Calculator,
    Sparkles,
    RotateCcw,
    SlidersHorizontal,
    PieChart,
    ShieldCheck,
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    Download,
    Copy,
    Check,
    Share2,
    FileSpreadsheet,
    FileCode,
    FileText,
    Briefcase,
    Building2,
    Scale,
    Info,
    Wrench,
    ChevronDown,
    DollarSign,
} from 'lucide-react';

import {
    CONTRACTOR_VS_EMPLOYEE_ENGINE_VERSION,
    ISO_4217_CURRENCIES,
    getIsoCurrencyByCode,
    computeCrossRate,
    JURISDICTION_CATALOG,
    compileContractorVsEmployeeReport,
    applySafeHarborClassificationFixes,
    exportComparisonCsv,
    exportComparisonXlsx,
    getContractorScenarioPreset,
    type SupportedJurisdictionCode,
    type RateInputMode,
    type FilingStatusCode,
    type ContractorVsEmployeeInputs,
    type ContractorScenarioPresetId,
} from '@/lib/contractorVsEmployeeEngine';

type DeepDiveTab =
    | 'three_way_waterfall'
    | 'breakeven_negotiation'
    | 'classification_ir35'
    | 'employer_eor_cost'
    | 'export_studio';

const QUICK_SCENARIO_PRESETS: {
    id: ContractorScenarioPresetId;
    label: string;
    badge: string;
}[] = [
        {
            id: 'us_w2_1099_scorp',
            label: 'US W-2 ($150k) vs. 1099 ($105/hr) + S-Corp',
            badge: 'US IRS Schedule SE + QBI 20%',
        },
        {
            id: 'uk_ir35_inside_outside',
            label: 'UK £95k PAYE vs. £650/d Inside/Outside IR35',
            badge: 'HMRC KID + Ltd Co Dividends',
        },
        {
            id: 'ca_t4_vs_ccpc',
            label: 'Canada T4 ($140k) vs. $95/hr CCPC Corp',
            badge: 'CRA CPP/CPP2 + 12.2% CCPC',
        },
        {
            id: 'pk_pseb_it_exporter',
            label: 'Pakistan Salaried vs. PSEB 0.25% IT Exporter',
            badge: 'FBR Sec 149 vs. Sec 154A',
        },
        {
            id: 'audit_risk_demo',
            label: 'IR35 / 1099 Misclassification Audit Demo',
            badge: 'Test 1-Click Safe-Harbor Fix',
        },
    ];

export default function ContractorVsEmployeeCalculator() {
    const [activePresetId, setActivePresetId] = useState<ContractorScenarioPresetId | null>(
        'us_w2_1099_scorp'
    );
    const [inputs, setInputs] = useState<ContractorVsEmployeeInputs>(() =>
        getContractorScenarioPreset('us_w2_1099_scorp')
    );

    const [activeDeepDiveTab, setActiveDeepDiveTab] = useState<DeepDiveTab>('three_way_waterfall');
    const [canonicalAnnualGross, setCanonicalAnnualGross] = useState<number | null>(null);
    const [exportCodeFormat, setExportCodeFormat] = useState<
        'negotiation_txt' | 'markdown_dossier' | 'certificate_json' | 'contract_clauses_txt' | 'svg_chart'
    >('negotiation_txt');
    const [copiedNegotiation, setCopiedNegotiation] = useState<boolean>(false);
    const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);
    const [copiedExportCode, setCopiedExportCode] = useState<boolean>(false);
    const [statusNotice, setStatusNotice] = useState<string | null>(null);

    const deepDiveRef = useRef<HTMLDivElement | null>(null);

    const report = useMemo(() => compileContractorVsEmployeeReport(inputs), [inputs]);
    const meta = report.jurisdictionMeta;
    const cur = meta.currencySymbol;

    const handleSelectPreset = (presetId: ContractorScenarioPresetId) => {
        const nextInputs = getContractorScenarioPreset(presetId);
        setActivePresetId(presetId);
        setInputs(nextInputs);
        if (presetId === 'audit_risk_demo') {
            setActiveDeepDiveTab('classification_ir35');
            setStatusNotice(
                'Loaded High-Risk Misclassification Demo: Open Tab 3 below to inspect 9 active IR35/IRS audit red flags and test the 1-Click Safe-Harbor Fixer!'
            );
        } else {
            setStatusNotice(
                `Loaded "${QUICK_SCENARIO_PRESETS.find((p) => p.id === presetId)?.label}" (${JURISDICTION_CATALOG[nextInputs.jurisdiction].taxYearLabel
                }).`
            );
        }
    };

    const handleJurisdictionChange = (code: SupportedJurisdictionCode) => {
        const jMeta = JURISDICTION_CATALOG[code];
        const defaultRegion = jMeta.regionOptions[0];
        setActivePresetId(null);
        setInputs((prev) => ({
            ...prev,
            jurisdiction: code,
            currencyCode: jMeta.currencyCode,
            regionCode: defaultRegion.code,
            stateTaxRatePercent: defaultRegion.stateTaxRatePercent,
            employeeBaseSalaryAnnual: jMeta.defaultEmployeeSalary,
            employeeAnnualBonus: 0,
            employerHealthInsuranceAnnual: jMeta.defaultHealthBenefitAnnual,
            contractorRateMode: code === 'UK' ? 'DAILY' : 'HOURLY',
            contractorRateInput:
                code === 'UK'
                    ? Math.round(jMeta.defaultContractorHourlyRate * 8)
                    : jMeta.defaultContractorHourlyRate,
            deductibleBusinessExpensesAnnual: jMeta.defaultBusinessExpensesAnnual,
            contractorSelfFundedHealthAnnual: jMeta.defaultHealthBenefitAnnual,
            entityAccountingAndUmbrellaFeesAnnual: jMeta.defaultAccountingAndEntityFeesAnnual,
        }));
        setStatusNotice(`Switched statutory tax jurisdiction to ${jMeta.name}.`);
    };

    const handleResetToZero = () => {
        setActivePresetId(null);
        setInputs((prev) => ({
            ...prev,
            employeeBaseSalaryAnnual: 0,
            employeeAnnualBonus: 0,
            employerHealthInsuranceAnnual: 0,
            employerOtherPerksAnnual: 0,
            contractorRateInput: 0,
            deductibleBusinessExpensesAnnual: 0,
            contractorSelfFundedHealthAnnual: 0,
            contractorRetirementContributionAnnual: 0,
        }));
        setStatusNotice('Reset monetary inputs to 0. Click any Quick Scenario Preset chip to load sample numbers.');
    };

    const triggerDownload = (content: Uint8Array | string, fileName: string, mimeType: string) => {
        const blob =
            typeof content === 'string'
                ? new Blob([content], { type: mimeType })
                : new Blob([content as unknown as BlobPart], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleShareScenario = () => {
        const summaryLine = `${meta.name} | Employee (${meta.employeeRegimeName}): ${cur}${report.employeeRegime.netCashTakeHomeAnnual.toLocaleString()} net (${cur}${report.employeeRegime.trueTotalEconomicPackageAnnual.toLocaleString()} w/ benefits) vs. Contractor: ${cur}${report.standardContractorRegime.netCashTakeHomeAnnual.toLocaleString()} net vs. ${meta.optimizedEntityRegimeName}: ${cur}${report.optimizedEntityRegime.netCashTakeHomeAnnual.toLocaleString()} net | Exact Break-Even Rate: ${cur}${report.exactBreakEvenHourlyRateTotalPkg}/hr (${cur}${report.exactBreakEvenDailyRateTotalPkg}/day)`;
        void navigator.clipboard?.writeText(summaryLine);
        setCopiedShareLink(true);
        setTimeout(() => setCopiedShareLink(false), 2500);
    };

    const salarySliderMax =
        inputs.jurisdiction === 'PK'
            ? 30000000
            : inputs.jurisdiction === 'IN'
                ? 15000000
                : inputs.jurisdiction === 'AE'
                    ? 1500000
                    : 500000;

    const salarySliderStep =
        inputs.jurisdiction === 'PK'
            ? 100000
            : inputs.jurisdiction === 'IN'
                ? 50000
                : 2500;

    const rateSliderMax =
        inputs.contractorRateMode === 'HOURLY'
            ? inputs.jurisdiction === 'PK'
                ? 25000
                : inputs.jurisdiction === 'IN'
                    ? 10000
                    : 400
            : inputs.contractorRateMode === 'DAILY'
                ? inputs.jurisdiction === 'PK'
                    ? 200000
                    : inputs.jurisdiction === 'IN'
                        ? 80000
                        : 2500
                : inputs.contractorRateMode === 'MONTHLY'
                    ? salarySliderMax / 10
                    : salarySliderMax * 1.4;

    const employeeTakeHomePctOfGross =
        report.employeeRegime.grossTopLineAnnual > 0
            ? Number(
                (
                    (report.employeeRegime.netCashTakeHomeAnnual /
                        report.employeeRegime.grossTopLineAnnual) *
                    100
                ).toFixed(1)
            )
            : 0;

    const winningTakeHomePctOfGross =
        report.winningRegime.grossTopLineAnnual > 0
            ? Number(
                (
                    (report.winningRegime.netCashTakeHomeAnnual /
                        report.winningRegime.grossTopLineAnnual) *
                    100
                ).toFixed(1)
            )
            : 0;

    const winningTaxPctOfGross =
        report.winningRegime.grossTopLineAnnual > 0
            ? Number((100 - winningTakeHomePctOfGross).toFixed(1))
            : 0;

    const activeExportText = useMemo(() => {
        if (exportCodeFormat === 'negotiation_txt') return report.recruiterNegotiationBriefText;
        if (exportCodeFormat === 'markdown_dossier') return report.markdownTaxAndKidReport;
        if (exportCodeFormat === 'contract_clauses_txt') return report.contractualAddendumClausesText;
        if (exportCodeFormat === 'svg_chart') return report.svgWaterfallChart;
        return report.auditCertificateJson;
    }, [exportCodeFormat, report]);

    return (
        <div className="space-y-6 w-full min-w-0 max-w-full overflow-x-hidden text-slate-900 dark:text-slate-100">
            {/* ============================================================================
          MAIN 2-COLUMN SPLIT-SCREEN WORKBENCH (MATCHING MORTGAGE & EMI CALCULATOR UI)
          LEFT COLUMN: QUICK SCENARIO PRESETS + COMPENSATION & CONTRACT PARAMETERS
          RIGHT COLUMN: ROYAL BLUE HERO METRIC CARD + 2x2 BREAKDOWN + DARK SUMMARY BAR
          ============================================================================ */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-3 sm:p-6 shadow-xs">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* ========================================================================
              LEFT COLUMN (lg:col-span-5): INPUT PARAMETERS, PRESET CHIPS & SLIDERS
              ======================================================================== */}
                    <div className="min-w-0 lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-5 overflow-hidden">
                        {/* Header Bar: Title + Reset Form */}
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 min-w-0">
                                <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                    Compensation &amp; Tax Parameters
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={handleResetToZero}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition cursor-pointer shrink-0"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset</span>
                            </button>
                        </div>

                        {/* QUICK SCENARIO PRESETS BOX (Matching Mortgage Calculator Pill Box) */}
                        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                    <span>Quick Scenario Presets</span>
                                </span>
                                <span className="text-[10px] font-medium text-slate-400">1-Click Load</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {QUICK_SCENARIO_PRESETS.map((preset) => {
                                    const isSelected = activePresetId === preset.id;
                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => handleSelectPreset(preset.id)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition text-left cursor-pointer ${isSelected
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-500'
                                                }`}
                                        >
                                            {preset.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* WORLDWIDE ISO 4217 CURRENCY SELECTOR & LIVE FX CONVERSION LAYER (153 ACTIVE ISO CURRENCIES) */}
                        <div className="space-y-2 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                    Display Currency ({ISO_4217_CURRENCIES.length} Active ISO 4217 Currencies)
                                </label>
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    Statutory Tax Base: {report.statutoryCurrencyCode} ({report.statutoryCurrencySymbol})
                                </span>
                            </div>
                            <select
                                value={report.activeCurrency.code}
                                onChange={(e) => {
                                    const chosen = getIsoCurrencyByCode(e.target.value);
                                    const statCode = JURISDICTION_CATALOG[inputs.jurisdiction].currencyCode;
                                    const autoFx = computeCrossRate(statCode, chosen.code);
                                    setInputs((prev) => ({
                                        ...prev,
                                        currencyCode: chosen.code,
                                        fxConversionRate: autoFx,
                                    }));
                                    setStatusNotice(
                                        chosen.code === statCode
                                            ? `Display currency locked to statutory currency ${chosen.code} (${chosen.symbol}).`
                                            : `Converting statutory ${statCode} outputs to ${chosen.name} (${chosen.code}) at 1 ${statCode} = ${autoFx} ${chosen.code}.`
                                    );
                                }}
                                className="w-full min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {ISO_4217_CURRENCIES.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.name} ({c.code}) — {c.symbol} • {c.decimals} decimals
                                    </option>
                                ))}
                            </select>

                            {inputs.jurisdiction !== 'GLOBAL_CUSTOM' &&
                                report.activeCurrency.code !== report.statutoryCurrencyCode && (
                                    <div className="rounded-xl border border-amber-200 dark:border-amber-900/70 bg-amber-50/70 dark:bg-amber-950/30 p-2.5 space-y-1.5 text-[11px]">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="font-bold text-amber-900 dark:text-amber-200">
                                                FX Conversion Active: 1 {report.statutoryCurrencyCode} ={' '}
                                                {report.appliedFxRateDisplayPerStatutory} {report.activeCurrency.code}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setInputs((prev) => ({
                                                        ...prev,
                                                        currencyCode: report.statutoryCurrencyCode,
                                                        fxConversionRate: 1.0,
                                                    }))
                                                }
                                                className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100 font-bold cursor-pointer"
                                            >
                                                Lock to {report.statutoryCurrencyCode}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-600 dark:text-slate-400 shrink-0">Custom FX Rate:</span>
                                            <input
                                                type="number"
                                                min={0.00001}
                                                step="any"
                                                value={inputs.fxConversionRate ?? report.appliedFxRateDisplayPerStatutory}
                                                onChange={(e) =>
                                                    setInputs((prev) => ({
                                                        ...prev,
                                                        fxConversionRate: Math.max(0.00001, Number(e.target.value) || 1),
                                                    }))
                                                }
                                                className="w-full min-w-0 px-2 py-1 rounded border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                                            />
                                        </div>
                                    </div>
                                )}
                        </div>

                        {/* TAX JURISDICTION & STATUTORY REGIME SELECTOR (8 BUILT-IN COUNTRIES + GLOBAL CUSTOM COUNTRY ENGINE) */}
                        <div className="space-y-1.5 min-w-0">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                Tax Jurisdiction &amp; Statutory Regime (Worldwide)
                            </label>
                            <select
                                value={inputs.jurisdiction}
                                onChange={(e) =>
                                    handleJurisdictionChange(e.target.value as SupportedJurisdictionCode)
                                }
                                className="w-full min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {Object.values(JURISDICTION_CATALOG).map((j) => (
                                    <option key={j.code} value={j.code}>
                                        {j.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {meta.taxYearLabel}
                            </p>
                        </div>

                        {/* CUSTOM WORLDWIDE STATUTORY TAX RATE INPUTS WHEN GLOBAL_CUSTOM IS SELECTED */}
                        {inputs.jurisdiction === 'GLOBAL_CUSTOM' && (
                            <div className="rounded-xl border border-blue-200 dark:border-blue-900/70 bg-blue-50/50 dark:bg-blue-950/30 p-3 space-y-2.5 text-xs min-w-0">
                                <div className="font-bold text-blue-950 dark:text-blue-200">
                                    Worldwide Custom Country Statutory Tax Rates (%)
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 min-w-0">
                                    <div className="min-w-0">
                                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                                            Emp Income Tax %
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={65}
                                            step={0.5}
                                            value={inputs.customEmployeeIncomeTaxPercent ?? 20}
                                            onChange={(e) =>
                                                setInputs((p) => ({
                                                    ...p,
                                                    customEmployeeIncomeTaxPercent: Math.max(0, Number(e.target.value) || 0),
                                                }))
                                            }
                                            className="w-full min-w-0 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                                            Emp Social/NI %
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={45}
                                            step={0.5}
                                            value={inputs.customEmployeeSocialTaxPercent ?? 7.5}
                                            onChange={(e) =>
                                                setInputs((p) => ({
                                                    ...p,
                                                    customEmployeeSocialTaxPercent: Math.max(0, Number(e.target.value) || 0),
                                                }))
                                            }
                                            className="w-full min-w-0 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                                            Freelance Tax %
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={65}
                                            step={0.5}
                                            value={inputs.customContractorIncomeTaxPercent ?? 20}
                                            onChange={(e) =>
                                                setInputs((p) => ({
                                                    ...p,
                                                    customContractorIncomeTaxPercent: Math.max(0, Number(e.target.value) || 0),
                                                }))
                                            }
                                            className="w-full min-w-0 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                                            Self-Emp Social %
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={45}
                                            step={0.5}
                                            value={inputs.customContractorSocialTaxPercent ?? 12}
                                            onChange={(e) =>
                                                setInputs((p) => ({
                                                    ...p,
                                                    customContractorSocialTaxPercent: Math.max(0, Number(e.target.value) || 0),
                                                }))
                                            }
                                            className="w-full min-w-0 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                                            Corporate Tax %
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={50}
                                            step={0.5}
                                            value={inputs.customCorporateTaxPercent ?? 15}
                                            onChange={(e) =>
                                                setInputs((p) => ({
                                                    ...p,
                                                    customCorporateTaxPercent: Math.max(0, Number(e.target.value) || 0),
                                                }))
                                            }
                                            className="w-full min-w-0 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                                            Dividend Tax %
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={50}
                                            step={0.5}
                                            value={inputs.customDividendTaxPercent ?? 8}
                                            onChange={(e) =>
                                                setInputs((p) => ({
                                                    ...p,
                                                    customDividendTaxPercent: Math.max(0, Number(e.target.value) || 0),
                                                }))
                                            }
                                            className="w-full min-w-0 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STATE / PROVINCE & FILING STATUS (2-Column Grid) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                            <div className="min-w-0">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                                    State / Province / Region
                                </label>
                                <select
                                    value={inputs.regionCode}
                                    onChange={(e) => {
                                        const reg = meta.regionOptions.find((r) => r.code === e.target.value);
                                        setInputs((prev) => ({
                                            ...prev,
                                            regionCode: e.target.value,
                                            stateTaxRatePercent: reg ? reg.stateTaxRatePercent : prev.stateTaxRatePercent,
                                        }));
                                    }}
                                    className="w-full min-w-0 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                                >
                                    {meta.regionOptions.map((r) => (
                                        <option key={r.code} value={r.code}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="min-w-0">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                                    Tax Year &amp; Filing Status
                                </label>
                                <div className="flex gap-1.5 mb-1.5">
                                    {(['2026', '2025'] as const).map((yr) => (
                                        <button
                                            key={yr}
                                            type="button"
                                            onClick={() => setInputs((prev) => ({ ...prev, taxYear: yr }))}
                                            className={`flex-1 py-1 rounded-lg text-xs font-bold border cursor-pointer ${(inputs.taxYear || '2026') === yr
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                                }`}
                                        >
                                            {yr} Tax Year
                                        </button>
                                    ))}
                                </div>
                                <select
                                    value={inputs.filingStatus}
                                    onChange={(e) =>
                                        setInputs((prev) => ({
                                            ...prev,
                                            filingStatus: e.target.value as FilingStatusCode,
                                        }))
                                    }
                                    className="w-full min-w-0 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                                >
                                    <option value="SINGLE">Single / Individual Filer</option>
                                    <option value="MARRIED_JOINT">Married Filing Jointly</option>
                                    <option value="HEAD_OF_HOUSEHOLD">Head of Household</option>
                                </select>
                            </div>
                        </div>

                        {/* FULL-TIME EMPLOYEE BASE ANNUAL SALARY + SLIDER (Matching EMI Calculator) */}
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                    Full-Time Base Salary ({meta.employeeRegimeName.split(' ')[0]})
                                </label>
                                <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 w-36 sm:w-40 shrink-0">
                                    <span className="text-xs font-bold text-slate-400 mr-1.5 shrink-0">{cur}</span>
                                    <input
                                        type="number"
                                        min={0}
                                        value={inputs.employeeBaseSalaryAnnual}
                                        onChange={(e) =>
                                            setInputs((prev) => ({
                                                ...prev,
                                                employeeBaseSalaryAnnual: Math.max(0, Number(e.target.value) || 0),
                                            }))
                                        }
                                        className="w-full min-w-0 bg-transparent text-right font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={salarySliderMax}
                                step={salarySliderStep}
                                value={Math.min(inputs.employeeBaseSalaryAnnual, salarySliderMax)}
                                onChange={(e) =>
                                    setInputs((prev) => ({
                                        ...prev,
                                        employeeBaseSalaryAnnual: Number(e.target.value),
                                    }))
                                }
                                className="w-full accent-blue-600 cursor-pointer"
                            />
                        </div>

                        {/* CONTRACTOR RATE MODE & RATE INPUT + SLIDER */}
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                    Contractor Rate &amp; Billing Frequency
                                </label>
                                <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5">
                                    {(
                                        [
                                            { mode: 'HOURLY', label: '/Hr' },
                                            { mode: 'DAILY', label: '/Day' },
                                            { mode: 'MONTHLY', label: '/Mo' },
                                            { mode: 'ANNUAL', label: '/Yr' },
                                        ] as const
                                    ).map((item) => (
                                        <button
                                            key={item.mode}
                                            type="button"
                                            onClick={() => {
                                                const baseStatAnnual =
                                                    canonicalAnnualGross !== null
                                                        ? canonicalAnnualGross
                                                        : inputs.contractorRateMode === 'HOURLY'
                                                            ? inputs.contractorRateInput * report.totalBillableHoursPerYear
                                                            : inputs.contractorRateMode === 'DAILY'
                                                                ? inputs.contractorRateInput * report.totalBillableDaysPerYear
                                                                : inputs.contractorRateMode === 'MONTHLY'
                                                                    ? inputs.contractorRateInput * 12
                                                                    : inputs.contractorRateInput;
                                                setCanonicalAnnualGross(baseStatAnnual);
                                                const nextVal =
                                                    item.mode === 'HOURLY'
                                                        ? Number((baseStatAnnual / report.totalBillableHoursPerYear).toFixed(4))
                                                        : item.mode === 'DAILY'
                                                            ? Number((baseStatAnnual / report.totalBillableDaysPerYear).toFixed(4))
                                                            : item.mode === 'MONTHLY'
                                                                ? Number((baseStatAnnual / 12).toFixed(2))
                                                                : Number(baseStatAnnual.toFixed(2));
                                                setInputs((prev) => ({
                                                    ...prev,
                                                    contractorRateMode: item.mode,
                                                    contractorRateInput: nextVal,
                                                }));
                                            }}
                                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer ${inputs.contractorRateMode === item.mode
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-slate-600 dark:text-slate-300'
                                                }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Annualized Contract Gross:{' '}
                                    <strong className="font-mono text-slate-800 dark:text-slate-200">
                                        {cur}
                                        {report.contractorAnnualGrossRevenue.toLocaleString()}/yr
                                    </strong>
                                </span>
                                <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 w-36 sm:w-40 shrink-0">
                                    <span className="text-xs font-bold text-slate-400 mr-1.5 shrink-0">{cur}</span>
                                    <input
                                        type="number"
                                        min={0}
                                        step="any"
                                        value={inputs.contractorRateInput}
                                        onChange={(e) => {
                                            setCanonicalAnnualGross(null);
                                            setInputs((prev) => ({
                                                ...prev,
                                                contractorRateInput: Math.max(0, Number(e.target.value) || 0),
                                            }));
                                        }}
                                        className="w-full min-w-0 bg-transparent text-right font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <input
                                type="range"
                                min={0}
                                max={rateSliderMax}
                                step={inputs.contractorRateMode === 'HOURLY' ? 1 : 25}
                                value={Math.min(inputs.contractorRateInput, rateSliderMax)}
                                onChange={(e) =>
                                    setInputs((prev) => ({
                                        ...prev,
                                        contractorRateInput: Number(e.target.value),
                                    }))
                                }
                                className="w-full accent-blue-600 cursor-pointer"
                            />
                        </div>

                        {/* BILLABLE WEEKS PER YEAR & HOURS PER DAY */}
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                        Billable Weeks / Year (Tenure)
                                    </label>
                                    <span className="text-[11px] text-slate-500">
                                        {52 - inputs.billableWeeksPerYear} wks unpaid PTO / holidays / bench ({report.totalBillableHoursPerYear} hrs/yr)
                                    </span>
                                </div>
                                <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 w-28 shrink-0">
                                    <input
                                        type="number"
                                        min={1}
                                        max={52}
                                        value={inputs.billableWeeksPerYear}
                                        onChange={(e) =>
                                            setInputs((prev) => ({
                                                ...prev,
                                                billableWeeksPerYear: Math.min(52, Math.max(1, Number(e.target.value) || 46)),
                                            }))
                                        }
                                        className="w-full min-w-0 bg-transparent text-right font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none"
                                    />
                                    <span className="text-xs font-semibold text-slate-400 ml-1.5 shrink-0">Wks</span>
                                </div>
                            </div>
                            <input
                                type="range"
                                min={20}
                                max={52}
                                step={1}
                                value={inputs.billableWeeksPerYear}
                                onChange={(e) =>
                                    setInputs((prev) => ({
                                        ...prev,
                                        billableWeeksPerYear: Number(e.target.value),
                                    }))
                                }
                                className="w-full accent-blue-600 cursor-pointer"
                            />
                        </div>

                        {/* 2-COLUMN SIDE-BY-SIDE INPUTS: EMPLOYER HEALTH SUBSIDY & RETIREMENT MATCH % */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 min-w-0">
                            <div className="min-w-0">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 truncate">
                                    Employer Health Benefit / Yr
                                </label>
                                <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-2">
                                    <span className="text-xs font-bold text-slate-400 mr-1.5 shrink-0">{cur}</span>
                                    <input
                                        type="number"
                                        min={0}
                                        value={inputs.employerHealthInsuranceAnnual}
                                        onChange={(e) =>
                                            setInputs((prev) => ({
                                                ...prev,
                                                employerHealthInsuranceAnnual: Math.max(0, Number(e.target.value) || 0),
                                            }))
                                        }
                                        className="w-full min-w-0 bg-transparent font-mono text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="min-w-0">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 truncate">
                                    401(k) / Pension / Super Match
                                </label>
                                <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-2">
                                    <input
                                        type="number"
                                        min={0}
                                        max={30}
                                        step={0.5}
                                        value={inputs.employerRetirementMatchPercent}
                                        onChange={(e) =>
                                            setInputs((prev) => ({
                                                ...prev,
                                                employerRetirementMatchPercent: Math.max(0, Number(e.target.value) || 0),
                                            }))
                                        }
                                        className="w-full min-w-0 bg-transparent font-mono text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    />
                                    <span className="text-xs font-bold text-slate-400 ml-1.5 shrink-0">%</span>
                                </div>
                            </div>
                        </div>

                        {/* ADVANCED TAX, S-CORP / IR35 ENTITY SPLIT & DEDUCTIONS ACCORDION (Matching EMI Calculator) */}
                        <details className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-3 text-xs">
                            <summary className="cursor-pointer font-bold text-blue-600 dark:text-blue-400 flex items-center justify-between gap-2 select-none">
                                <span className="inline-flex items-center gap-1.5">
                                    <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                                    <span>Advanced Entity Split, Deductions &amp; Benefits Options</span>
                                </span>
                                <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180 shrink-0" />
                            </summary>

                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 min-w-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
                                    <div className="min-w-0">
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 truncate">
                                            Employee Annual Bonus / Equity
                                        </label>
                                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5">
                                            <span className="text-slate-400 mr-1">{cur}</span>
                                            <input
                                                type="number"
                                                min={0}
                                                value={inputs.employeeAnnualBonus}
                                                onChange={(e) =>
                                                    setInputs((prev) => ({
                                                        ...prev,
                                                        employeeAnnualBonus: Math.max(0, Number(e.target.value) || 0),
                                                    }))
                                                }
                                                className="w-full min-w-0 bg-transparent font-mono text-xs font-bold outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="min-w-0">
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 truncate">
                                            Paid Vacation + Holidays (Days)
                                        </label>
                                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5">
                                            <input
                                                type="number"
                                                min={0}
                                                max={90}
                                                value={inputs.paidVacationAndHolidaysDays}
                                                onChange={(e) =>
                                                    setInputs((prev) => ({
                                                        ...prev,
                                                        paidVacationAndHolidaysDays: Math.max(0, Number(e.target.value) || 0),
                                                    }))
                                                }
                                                className="w-full min-w-0 bg-transparent font-mono text-xs font-bold outline-none"
                                            />
                                            <span className="text-slate-400 ml-1 text-[10px]">Days</span>
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 truncate">
                                            Contractor Write-Offs / Yr
                                        </label>
                                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5">
                                            <span className="text-slate-400 mr-1">{cur}</span>
                                            <input
                                                type="number"
                                                min={0}
                                                value={inputs.deductibleBusinessExpensesAnnual}
                                                onChange={(e) =>
                                                    setInputs((prev) => ({
                                                        ...prev,
                                                        deductibleBusinessExpensesAnnual: Math.max(0, Number(e.target.value) || 0),
                                                    }))
                                                }
                                                className="w-full min-w-0 bg-transparent font-mono text-xs font-bold outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="min-w-0">
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 truncate">
                                            Self-Funded Health / Yr
                                        </label>
                                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5">
                                            <span className="text-slate-400 mr-1">{cur}</span>
                                            <input
                                                type="number"
                                                min={0}
                                                value={inputs.contractorSelfFundedHealthAnnual}
                                                onChange={(e) =>
                                                    setInputs((prev) => ({
                                                        ...prev,
                                                        contractorSelfFundedHealthAnnual: Math.max(0, Number(e.target.value) || 0),
                                                    }))
                                                }
                                                className="w-full min-w-0 bg-transparent font-mono text-xs font-bold outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="min-w-0">
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 truncate">
                                            Solo 401(k) / SIPP Pension / Yr
                                        </label>
                                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5">
                                            <span className="text-slate-400 mr-1">{cur}</span>
                                            <input
                                                type="number"
                                                min={0}
                                                value={inputs.contractorRetirementContributionAnnual}
                                                onChange={(e) =>
                                                    setInputs((prev) => ({
                                                        ...prev,
                                                        contractorRetirementContributionAnnual: Math.max(
                                                            0,
                                                            Number(e.target.value) || 0
                                                        ),
                                                    }))
                                                }
                                                className="w-full min-w-0 bg-transparent font-mono text-xs font-bold outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="min-w-0">
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 truncate">
                                            CPA / Umbrella / Corp Fee / Yr
                                        </label>
                                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5">
                                            <span className="text-slate-400 mr-1">{cur}</span>
                                            <input
                                                type="number"
                                                min={0}
                                                value={inputs.entityAccountingAndUmbrellaFeesAnnual}
                                                onChange={(e) =>
                                                    setInputs((prev) => ({
                                                        ...prev,
                                                        entityAccountingAndUmbrellaFeesAnnual: Math.max(
                                                            0,
                                                            Number(e.target.value) || 0
                                                        ),
                                                    }))
                                                }
                                                className="w-full min-w-0 bg-transparent font-mono text-xs font-bold outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Country-Specific Statutory Eligibility & Reasonable Salary Controls */}
                                {inputs.jurisdiction === 'US' && (
                                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                S-Corp Reasonable Salary Override ($/yr, 0 = Use % Slider):
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                placeholder="0 (Use % Split)"
                                                value={inputs.usScorpReasonableSalaryOverride ?? 0}
                                                onChange={(e) =>
                                                    setInputs((prev) => ({
                                                        ...prev,
                                                        usScorpReasonableSalaryOverride: Math.max(0, Number(e.target.value) || 0),
                                                    }))
                                                }
                                                className="w-32 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                                            />
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(inputs.usIsSpecifiedServiceTradeOrBusinessSstb)}
                                                onChange={(e) =>
                                                    setInputs((prev) => ({
                                                        ...prev,
                                                        usIsSpecifiedServiceTradeOrBusinessSstb: e.target.checked,
                                                    }))
                                                }
                                                className="w-3.5 h-3.5 accent-blue-600 rounded"
                                            />
                                            <span className="text-[11px] text-slate-700 dark:text-slate-300">
                                                Specified Service Trade or Business (SSTB — Consulting/Law/Health/Finance QBI Phase-Out)
                                            </span>
                                        </label>
                                    </div>
                                )}

                                {inputs.jurisdiction === 'UK' && (
                                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                Outside IR35 Director Salary Strategy:
                                            </span>
                                            <select
                                                value={inputs.ukDirectorSalaryStrategy || 'PERSONAL_ALLOWANCE_12570'}
                                                onChange={(e) =>
                                                    setInputs((prev) => ({
                                                        ...prev,
                                                        ukDirectorSalaryStrategy: e.target.value as 'NI_THRESHOLD_5000' | 'PERSONAL_ALLOWANCE_12570',
                                                    }))
                                                }
                                                className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                                            >
                                                <option value="PERSONAL_ALLOWANCE_12570">£12,570 (Personal Allowance)</option>
                                                <option value="NI_THRESHOLD_5000">£5,000 (NI Secondary Threshold)</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {inputs.jurisdiction === 'IN' && (
                                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                            India Section 44ADA Statutory Eligibility Conditions:
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={inputs.indiaIsEligibleProfession44ADA !== false}
                                                onChange={(e) =>
                                                    setInputs((prev) => ({
                                                        ...prev,
                                                        indiaIsEligibleProfession44ADA: e.target.checked,
                                                    }))
                                                }
                                                className="w-3.5 h-3.5 accent-blue-600 rounded"
                                            />
                                            <span className="text-[11px]">Notified Profession u/s 44AA(1) (IT, Engineering, Design, Law, Medical, Consulting)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={inputs.indiaHas95PercentDigitalReceipts !== false}
                                                onChange={(e) =>
                                                    setInputs((prev) => ({
                                                        ...prev,
                                                        indiaHas95PercentDigitalReceipts: e.target.checked,
                                                    }))
                                                }
                                                className="w-3.5 h-3.5 accent-blue-600 rounded"
                                            />
                                            <span className="text-[11px]">&gt;=95% Digital Bank Receipts (Unlocks ₹75 Lakh 44ADA limit vs. ₹50 Lakh)</span>
                                        </label>
                                    </div>
                                )}

                                {inputs.jurisdiction === 'PK' && (
                                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                            Pakistan FBR Section 154A (0.25% / 1.0%) Statutory Conditions:
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={inputs.pakistanHasValidPsebCertificate !== false}
                                                onChange={(e) =>
                                                    setInputs((prev) => ({
                                                        ...prev,
                                                        pakistanHasValidPsebCertificate: e.target.checked,
                                                    }))
                                                }
                                                className="w-3.5 h-3.5 accent-blue-600 rounded"
                                            />
                                            <span className="text-[11px]">Active PSEB Freelancer / Company Registration (Required for 0.25% Rate)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={inputs.pakistanHasValidPrcCode9186 !== false}
                                                onChange={(e) =>
                                                    setInputs((prev) => ({
                                                        ...prev,
                                                        pakistanHasValidPrcCode9186: e.target.checked,
                                                    }))
                                                }
                                                className="w-3.5 h-3.5 accent-blue-600 rounded"
                                            />
                                            <span className="text-[11px]">Foreign IT Export Remittance via Banking Channels (PRC Purpose Code 9186)</span>
                                        </label>
                                    </div>
                                )}

                                {/* S-Corp / Ltd Co Reasonable Salary % Split Slider */}
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                            S-Corp / Corp Owner Reasonable Salary Split:
                                        </span>
                                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                            {inputs.entityOwnerSalaryPercent}% Salary / {100 - inputs.entityOwnerSalaryPercent}% Distribution
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={20}
                                        max={80}
                                        step={2}
                                        value={inputs.entityOwnerSalaryPercent}
                                        onChange={(e) =>
                                            setInputs((prev) => ({
                                                ...prev,
                                                entityOwnerSalaryPercent: Number(e.target.value),
                                            }))
                                        }
                                        className="w-full accent-blue-600 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </details>
                    </div>

                    {/* ========================================================================
              RIGHT COLUMN (lg:col-span-7): ROYAL BLUE HERO CARD + 2x2 METRICS + DARK BAR
              (100% Matching KivaroTools EMI & Mortgage Calculator Right-Side Output Card)
              ======================================================================== */}
                    <div className="min-w-0 lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs space-y-5 overflow-hidden">
                        {/* Right Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 min-w-0">
                                <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                                    Take-Home Pay Breakdown, Break-Even Rate &amp; Regime Winner
                                </h2>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                Audit Score: {report.classificationComplianceScore}/100
                            </span>
                        </div>

                        {statusNotice && (
                            <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 px-3.5 py-2 text-xs font-medium text-blue-900 dark:text-blue-200 flex items-center justify-between gap-2">
                                <span className="min-w-0 break-words">✓ {statusNotice}</span>
                                <button
                                    type="button"
                                    onClick={() => setStatusNotice(null)}
                                    className="text-blue-700 dark:text-blue-300 font-bold hover:underline shrink-0 cursor-pointer"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}

                        {/* ROYAL BLUE GRADIENT HERO CARD (Exact Match to EMI Calculator Blue Output Card) */}
                        <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-5 sm:p-6 shadow-md space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-blue-100">
                                    BEST STRUCTURE WINNER: {report.winningRegime.regimeTitle}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs">
                                    {meta.currencyCode}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-baseline justify-between gap-4">
                                <div>
                                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono">
                                        {cur}
                                        {report.winningRegime.netCashTakeHomeAnnual.toLocaleString()}
                                        <span className="text-base sm:text-lg font-normal text-blue-200 ml-1.5">
                                            /yr net cash
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-blue-100 mt-1">
                                        Monthly Take-Home:{' '}
                                        <strong className="text-white font-mono">
                                            {cur}
                                            {report.winningRegime.netCashTakeHomeMonthly.toLocaleString()}/mo
                                        </strong>{' '}
                                        • Effective Hourly Net:{' '}
                                        <strong className="text-white font-mono">
                                            {cur}
                                            {report.winningRegime.netEffectiveHourlyTakeHome}/hr
                                        </strong>
                                    </p>
                                </div>

                                <div className="rounded-xl bg-white/15 backdrop-blur-xs px-3.5 py-2 text-right space-y-1">
                                    <div className="text-[10px] uppercase tracking-wider text-blue-100 font-semibold">
                                        Exact Break-Even Rate
                                    </div>
                                    <div className="text-lg sm:text-xl font-extrabold font-mono text-amber-300">
                                        {cur}
                                        {report.exactBreakEvenHourlyRateTotalPkg}/hr
                                    </div>
                                    <div className="text-[11px] text-blue-100 font-mono">
                                        ({cur}
                                        {report.exactBreakEvenDailyRateTotalPkg}/day • Entity: {cur}
                                        {report.exactBreakEvenHourlyRateOptimizedEntity}/hr)
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setInputs((prev) => ({
                                                ...prev,
                                                contractorRateMode: 'HOURLY',
                                                contractorRateInput: report.exactBreakEvenHourlyRateTotalPkg,
                                            }));
                                            setStatusNotice(
                                                `Set Contractor Rate to exact break-even (${cur}${report.exactBreakEvenHourlyRateTotalPkg}/hr) matching 100% of Full-Time Total Package!`
                                            );
                                        }}
                                        className="mt-1 px-2 py-0.5 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-extrabold transition cursor-pointer"
                                    >
                                        Apply Break-Even Rate
                                    </button>
                                </div>
                            </div>

                            {/* Net Take-Home % vs. Tax & Deductions % Progress Bar */}
                            <div className="space-y-1.5 pt-1">
                                <div className="flex items-center justify-between text-xs font-bold text-blue-100">
                                    <span>Net Take-Home Kept: {winningTakeHomePctOfGross}%</span>
                                    <span>Taxes &amp; Statutory Deductions: {winningTaxPctOfGross}%</span>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-blue-950/60 overflow-hidden flex">
                                    <div
                                        style={{ width: `${Math.min(100, Math.max(0, winningTakeHomePctOfGross))}%` }}
                                        className="bg-emerald-400 h-full transition-all duration-300"
                                    />
                                    <div
                                        style={{ width: `${Math.min(100, Math.max(0, winningTaxPctOfGross))}%` }}
                                        className="bg-amber-400 h-full transition-all duration-300"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2x2 SUMMARY METRIC CARDS (Exact Match to EMI Calculator 2x2 Grid) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-4 py-3 flex items-center justify-between gap-2">
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400 font-medium block">
                                        1. {report.employeeRegime.regimeTitle}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                        +{cur}
                                        {report.employeeRegime.monetizedBenefitsAndRetirementValueAnnual.toLocaleString()}{' '}
                                        benefits ({employeeTakeHomePctOfGross}% net)
                                    </span>
                                </div>
                                <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white shrink-0">
                                    {cur}
                                    {report.employeeRegime.netCashTakeHomeAnnual.toLocaleString()}
                                </span>
                            </div>

                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-4 py-3 flex items-center justify-between gap-2">
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400 font-medium block">
                                        2. {report.standardContractorRegime.regimeTitle}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                        Tax: {cur}
                                        {report.standardContractorRegime.totalTaxesAndStatutoryDeductionsAnnual.toLocaleString()}{' '}
                                        ({report.standardContractorRegime.effectiveTaxRatePercent}%)
                                    </span>
                                </div>
                                <span className="font-mono text-sm font-extrabold text-indigo-600 dark:text-indigo-400 shrink-0">
                                    {cur}
                                    {report.standardContractorRegime.netCashTakeHomeAnnual.toLocaleString()}
                                </span>
                            </div>

                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-4 py-3 flex items-center justify-between gap-2">
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400 font-medium block">
                                        3. {report.optimizedEntityRegime.regimeTitle}
                                    </span>
                                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                        Saves {cur}
                                        {Math.max(
                                            0,
                                            report.netAnnualAdvantageOfOptimizedEntityVsStandardContractor
                                        ).toLocaleString()}
                                        /yr vs Standard
                                    </span>
                                </div>
                                <span className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                                    {cur}
                                    {report.optimizedEntityRegime.netCashTakeHomeAnnual.toLocaleString()}
                                </span>
                            </div>

                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-4 py-3 flex items-center justify-between gap-2">
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400 font-medium block">
                                        Target Rate (+15% Bench Buffer)
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                        Covers unpaid bench &amp; B2B risk
                                    </span>
                                </div>
                                <span className="font-mono text-sm font-extrabold text-amber-600 dark:text-amber-400 shrink-0">
                                    {cur}
                                    {report.recommendedHourlyRateWithBuffer}/hr ({cur}
                                    {report.recommendedDailyRateWithBuffer}/d)
                                </span>
                            </div>
                        </div>

                        {/* DARK ECONOMIC COST & ADVANTAGE SUMMARY BAR (Exact Match to EMI Calculator Dark Card) */}
                        <div className="rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="text-xs sm:text-sm font-bold text-white">
                                    Net Annual Economic Delta (Optimized Contractor vs. Full-Time Package)
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                    Compares {report.optimizedEntityRegime.regimeTitle} Net Cash against Full-Time Net Cash +{' '}
                                    {cur}
                                    {report.employeeRegime.monetizedBenefitsAndRetirementValueAnnual.toLocaleString()}{' '}
                                    Monetized Benefits
                                </div>
                            </div>
                            <div
                                className={`text-xl sm:text-2xl font-extrabold font-mono ${report.netAnnualAdvantageOfOptimizedEntityVsEmployee >= 0
                                        ? 'text-emerald-400'
                                        : 'text-rose-400'
                                    }`}
                            >
                                {report.netAnnualAdvantageOfOptimizedEntityVsEmployee >= 0 ? '+' : ''}
                                {cur}
                                {report.netAnnualAdvantageOfOptimizedEntityVsEmployee.toLocaleString()}/yr
                            </div>
                        </div>

                        {/* SHARE SCENARIO & EXPORT ACTION PILLS (Exact Match to EMI Calculator Bottom Buttons) */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                            <button
                                type="button"
                                onClick={handleShareScenario}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-500 transition cursor-pointer"
                            >
                                {copiedShareLink ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                    <Share2 className="w-3.5 h-3.5 text-blue-600" />
                                )}
                                <span>{copiedShareLink ? 'Copied Scenario Summary!' : 'Share Scenario'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    const csv = exportComparisonCsv(report);
                                    triggerDownload(
                                        csv,
                                        `contractor_vs_employee_${inputs.jurisdiction.toLowerCase()}.csv`,
                                        'text/csv;charset=utf-8'
                                    );
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Export Breakdown CSV</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    const xlsx = exportComparisonXlsx(report);
                                    triggerDownload(
                                        xlsx,
                                        `contractor_vs_employee_${inputs.jurisdiction.toLowerCase()}.xlsx`,
                                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                    );
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition cursor-pointer"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                <span>Export Excel (.xlsx)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setActiveDeepDiveTab('breakeven_negotiation');
                                    deepDiveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 cursor-pointer"
                            >
                                <span>Recruiter Counter-Offer Script ↓</span>
                            </button>
                        </div>

                        {/* METHODOLOGY & STATUTORY ASSUMPTIONS ACCORDION (Matching Mortgage Calculator) */}
                        <details className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 text-xs">
                            <summary className="cursor-pointer font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2 select-none">
                                <span className="inline-flex items-center gap-2">
                                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                    <span>Methodology &amp; Statutory Calculation Assumptions ({meta.code})</span>
                                </span>
                                <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180 shrink-0" />
                            </summary>
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5 text-slate-600 dark:text-slate-400 leading-relaxed">
                                <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                                    <table className="w-full text-left border-collapse text-[11px]">
                                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                            <tr>
                                                <th className="py-1.5 px-2.5">Step</th>
                                                <th className="py-1.5 px-2.5">Calculation Stage &amp; Rule Applied</th>
                                                <th className="py-1.5 px-2.5">Computed Statutory Output</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 font-mono">
                                            {report.calculationAssumptionsAuditTrail.map((st) => (
                                                <tr key={st.stepNumber}>
                                                    <td className="py-1.5 px-2.5 font-bold text-blue-600">#{st.stepNumber}</td>
                                                    <td className="py-1.5 px-2.5 font-sans">
                                                        <strong className="text-slate-900 dark:text-white">{st.category}:</strong> {st.label} ({st.formulaOrRule})
                                                    </td>
                                                    <td className="py-1.5 px-2.5 text-slate-800 dark:text-slate-200">{st.statutoryAmountFormatted}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-[11px] text-slate-500">
                                    <strong>Important Estimation Disclosure:</strong> Calculations represent statutory tax and cash-flow estimates based on your selected parameters and tax year ({inputs.taxYear || '2026'}). Consult a qualified CPA, chartered accountant, or employment attorney for formal tax filings or legal status determinations.
                                </p>
                            </div>
                        </details>
                    </div>
                </div>
            </div>

            {/* ============================================================================
          5-TAB DEEP-DIVE ANALYTICS WORKBENCH BELOW THE 2-COLUMN CALCULATOR
          ============================================================================ */}
            <div
                ref={deepDiveRef}
                className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 scroll-mt-20"
            >
                {[
                    {
                        id: 'three_way_waterfall' as const,
                        label: '1. 3-Way Tax Waterfall & US/UK Deep Dive',
                        badge: '3 Regimes',
                        icon: Scale,
                    },
                    {
                        id: 'breakeven_negotiation' as const,
                        label: '2. Break-Even Matrix & Recruiter Counter-Offer',
                        badge: `${cur}${report.exactBreakEvenHourlyRateTotalPkg}/hr`,
                        icon: DollarSign,
                    },
                    {
                        id: 'classification_ir35' as const,
                        label: '3. Worker Classification Risk Assessment',
                        badge: `${report.classificationComplianceScore}/100`,
                        icon: ShieldCheck,
                    },
                    {
                        id: 'employer_eor_cost' as const,
                        label: '4. Employer Cost & EOR Estimator',
                        badge: 'CFO View',
                        icon: Building2,
                    },
                    {
                        id: 'export_studio' as const,
                        label: '5. 6-Format Export Studio & SVG Chart',
                        badge: '6 Formats',
                        icon: FileCode,
                    },
                ].map((tab) => {
                    const IconComponent = tab.icon;
                    const isSelected = activeDeepDiveTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveDeepDiveTab(tab.id)}
                            className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${isSelected
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400'
                                }`}
                        >
                            <span className="inline-flex items-center gap-2 min-w-0">
                                <IconComponent className="w-4 h-4 shrink-0" />
                                <span className="truncate">{tab.label}</span>
                            </span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 shrink-0">
                                {tab.badge}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ============================================================================
          TAB 1: 3-WAY TAX & TAKE-HOME WATERFALL TABLE + US SCHEDULE SE / UK IR35 KID
          ============================================================================ */}
            {activeDeepDiveTab === 'three_way_waterfall' && (
                <div className="space-y-5">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4 overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Simultaneous 3-Way Statutory Tax &amp; Total Compensation Waterfall ({meta.name})
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Side-by-side comparison of Full-Time Employment, Unincorporated/Umbrella Contracting, and Tax-Optimized Entity Structures.
                                </p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                {inputs.billableWeeksPerYear} Billable Wks ({report.totalBillableHoursPerYear} hrs/yr)
                            </span>
                        </div>

                        <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/90 text-[11px] text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="py-3 px-3.5 font-bold">Financial Line Item</th>
                                        <th className="py-3 px-3.5 font-bold text-blue-700 dark:text-blue-300">
                                            1. {report.employeeRegime.regimeTitle}
                                        </th>
                                        <th className="py-3 px-3.5 font-bold text-indigo-700 dark:text-indigo-300">
                                            2. {report.standardContractorRegime.regimeTitle}
                                        </th>
                                        <th className="py-3 px-3.5 font-bold text-emerald-700 dark:text-emerald-300">
                                            3. {report.optimizedEntityRegime.regimeTitle}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-mono text-xs">
                                    <tr>
                                        <td className="py-2.5 px-3.5 font-sans font-semibold text-slate-900 dark:text-white">
                                            Gross Annual Top-Line (Salary / Contract Revenue)
                                        </td>
                                        <td className="py-2.5 px-3.5 font-bold">
                                            {cur}
                                            {report.employeeRegime.grossTopLineAnnual.toLocaleString()}
                                        </td>
                                        <td className="py-2.5 px-3.5 font-bold">
                                            {cur}
                                            {report.standardContractorRegime.grossTopLineAnnual.toLocaleString()}
                                        </td>
                                        <td className="py-2.5 px-3.5 font-bold">
                                            {cur}
                                            {report.optimizedEntityRegime.grossTopLineAnnual.toLocaleString()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 px-3.5 font-sans text-slate-600 dark:text-slate-400">
                                            Deductible Business Expenses, Health &amp; Entity Fees
                                        </td>
                                        <td className="py-2.5 px-3.5 text-slate-500">
                                            -{cur}
                                            {report.employeeRegime.deductibleExpensesAndFeesAnnual.toLocaleString()}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-slate-500">
                                            -{cur}
                                            {report.standardContractorRegime.deductibleExpensesAndFeesAnnual.toLocaleString()}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-slate-500">
                                            -{cur}
                                            {report.optimizedEntityRegime.deductibleExpensesAndFeesAnnual.toLocaleString()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 px-3.5 font-sans text-slate-600 dark:text-slate-400">
                                            National / Federal Income Tax
                                        </td>
                                        <td className="py-2.5 px-3.5 text-rose-600 dark:text-rose-400">
                                            -{cur}
                                            {report.employeeRegime.incomeTaxFederalOrNationalAnnual.toLocaleString()}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-rose-600 dark:text-rose-400">
                                            -{cur}
                                            {report.standardContractorRegime.incomeTaxFederalOrNationalAnnual.toLocaleString()}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-rose-600 dark:text-rose-400">
                                            -{cur}
                                            {report.optimizedEntityRegime.incomeTaxFederalOrNationalAnnual.toLocaleString()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 px-3.5 font-sans text-slate-600 dark:text-slate-400">
                                            State / Provincial / Regional Tax
                                        </td>
                                        <td className="py-2.5 px-3.5 text-rose-600 dark:text-rose-400">
                                            -{cur}
                                            {report.employeeRegime.stateOrProvincialTaxAnnual.toLocaleString()}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-rose-600 dark:text-rose-400">
                                            -{cur}
                                            {report.standardContractorRegime.stateOrProvincialTaxAnnual.toLocaleString()}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-rose-600 dark:text-rose-400">
                                            -{cur}
                                            {report.optimizedEntityRegime.stateOrProvincialTaxAnnual.toLocaleString()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 px-3.5 font-sans text-slate-600 dark:text-slate-400">
                                            FICA / Employee NI / CPP / Medicare / Social Insurance
                                        </td>
                                        <td className="py-2.5 px-3.5 text-rose-600 dark:text-rose-400">
                                            -{cur}
                                            {report.employeeRegime.socialSecurityOrEmployeeNiAnnual.toLocaleString()}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-rose-600 dark:text-rose-400">
                                            -{cur}
                                            {report.standardContractorRegime.socialSecurityOrEmployeeNiAnnual.toLocaleString()}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-rose-600 dark:text-rose-400">
                                            -{cur}
                                            {report.optimizedEntityRegime.socialSecurityOrEmployeeNiAnnual.toLocaleString()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 px-3.5 font-sans text-slate-600 dark:text-slate-400">
                                            Self-Employment (SECA 15.3%) / Dividend Tax
                                        </td>
                                        <td className="py-2.5 px-3.5 text-slate-400">{cur}0</td>
                                        <td className="py-2.5 px-3.5 text-rose-600 dark:text-rose-400">
                                            -{cur}
                                            {report.standardContractorRegime.selfEmploymentOrDividendTaxAnnual.toLocaleString()}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-rose-600 dark:text-rose-400">
                                            -{cur}
                                            {report.optimizedEntityRegime.selfEmploymentOrDividendTaxAnnual.toLocaleString()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 px-3.5 font-sans text-slate-600 dark:text-slate-400">
                                            Corporate Tax / Inside IR35 Employer NI &amp; Levy
                                        </td>
                                        <td className="py-2.5 px-3.5 text-slate-400">{cur}0</td>
                                        <td className="py-2.5 px-3.5 text-rose-600 dark:text-rose-400">
                                            -{cur}
                                            {report.standardContractorRegime.corporateOrEntityTaxAnnual.toLocaleString()}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-rose-600 dark:text-rose-400">
                                            -{cur}
                                            {report.optimizedEntityRegime.corporateOrEntityTaxAnnual.toLocaleString()}
                                        </td>
                                    </tr>
                                    <tr className="bg-slate-50/80 dark:bg-slate-800/50 font-bold">
                                        <td className="py-2.5 px-3.5 font-sans">Total Statutory Taxes &amp; Deductions</td>
                                        <td className="py-2.5 px-3.5 text-rose-600 dark:text-rose-400">
                                            {cur}
                                            {report.employeeRegime.totalTaxesAndStatutoryDeductionsAnnual.toLocaleString()} (
                                            {report.employeeRegime.effectiveTaxRatePercent}%)
                                        </td>
                                        <td className="py-2.5 px-3.5 text-rose-600 dark:text-rose-400">
                                            {cur}
                                            {report.standardContractorRegime.totalTaxesAndStatutoryDeductionsAnnual.toLocaleString()}{' '}
                                            ({report.standardContractorRegime.effectiveTaxRatePercent}%)
                                        </td>
                                        <td className="py-2.5 px-3.5 text-rose-600 dark:text-rose-400">
                                            {cur}
                                            {report.optimizedEntityRegime.totalTaxesAndStatutoryDeductionsAnnual.toLocaleString()}{' '}
                                            ({report.optimizedEntityRegime.effectiveTaxRatePercent}%)
                                        </td>
                                    </tr>
                                    <tr className="bg-blue-50/50 dark:bg-blue-950/30 font-extrabold text-slate-900 dark:text-white">
                                        <td className="py-3 px-3.5 font-sans">Net Annual Cash Take-Home Pay</td>
                                        <td className="py-3 px-3.5 text-blue-700 dark:text-blue-300">
                                            {cur}
                                            {report.employeeRegime.netCashTakeHomeAnnual.toLocaleString()}/yr
                                        </td>
                                        <td className="py-3 px-3.5 text-indigo-700 dark:text-indigo-300">
                                            {cur}
                                            {report.standardContractorRegime.netCashTakeHomeAnnual.toLocaleString()}/yr
                                        </td>
                                        <td className="py-3 px-3.5 text-emerald-700 dark:text-emerald-300">
                                            {cur}
                                            {report.optimizedEntityRegime.netCashTakeHomeAnnual.toLocaleString()}/yr
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 px-3.5 font-sans text-slate-600 dark:text-slate-400">
                                            Monetized Employer Benefits (Health + Retirement Match + Perks)
                                        </td>
                                        <td className="py-2.5 px-3.5 text-emerald-600 dark:text-emerald-400 font-bold">
                                            +{cur}
                                            {report.employeeRegime.monetizedBenefitsAndRetirementValueAnnual.toLocaleString()}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-slate-400">{cur}0 (Self-Funded)</td>
                                        <td className="py-2.5 px-3.5 text-slate-400">{cur}0 (Self-Funded)</td>
                                    </tr>
                                    <tr className="bg-emerald-50/70 dark:bg-emerald-950/40 font-extrabold text-sm">
                                        <td className="py-3 px-3.5 font-sans text-slate-900 dark:text-white">
                                            True Total Annual Economic Value (Cash + Benefits)
                                        </td>
                                        <td className="py-3 px-3.5 text-slate-900 dark:text-white">
                                            {cur}
                                            {report.employeeRegime.trueTotalEconomicPackageAnnual.toLocaleString()}
                                        </td>
                                        <td className="py-3 px-3.5 text-indigo-700 dark:text-indigo-300">
                                            {cur}
                                            {report.standardContractorRegime.trueTotalEconomicPackageAnnual.toLocaleString()}
                                        </td>
                                        <td className="py-3 px-3.5 text-emerald-700 dark:text-emerald-300">
                                            {cur}
                                            {report.optimizedEntityRegime.trueTotalEconomicPackageAnnual.toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Jurisdiction-Specific Statutory Breakdown Callout (US Schedule SE / S-Corp OR UK IR35 KID) */}
                        {inputs.jurisdiction === 'US' && (
                            <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/70 bg-indigo-50/50 dark:bg-indigo-950/30 p-4 space-y-2 text-xs">
                                <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>
                                        US IRS Schedule SE (92.35%), Section 199A QBI (20%) &amp; Form 1120-S S-Corp Split Audit
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 font-mono">
                                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <div className="text-[10px] font-sans text-slate-500">Schedule SE Base (92.35%)</div>
                                        <div className="font-bold text-slate-900 dark:text-white">
                                            ${report.usScheduleSeAndScorp.scheduleSeTaxableBase9235.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            SE Tax: ${report.usScheduleSeAndScorp.totalSelfEmploymentTax.toLocaleString()} (50% Ded: $
                                            {report.usScheduleSeAndScorp.halfSeTaxAboveTheLineDeduction.toLocaleString()})
                                        </div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <div className="text-[10px] font-sans text-slate-500">Sec 199A 20% QBI Deduction</div>
                                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                                            ${report.usScheduleSeAndScorp.qbiSection199ADeduction20Pct.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            Tax Saved: ${report.standardContractorRegime.qbiOrSpecialDeductionSavedAnnual.toLocaleString()}/yr
                                        </div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <div className="text-[10px] font-sans text-slate-500">S-Corp Salary / K-1 Split</div>
                                        <div className="font-bold text-blue-600 dark:text-blue-400">
                                            ${report.usScheduleSeAndScorp.scorpReasonableSalaryAnnual.toLocaleString()} / $
                                            {report.usScheduleSeAndScorp.scorpK1DistributionAnnual.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-emerald-600">
                                            Net S-Corp Gain: $
                                            {report.usScheduleSeAndScorp.scorpNetTaxSavingsVs1099SoleProp.toLocaleString()}/yr
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {inputs.jurisdiction === 'UK' && (
                            <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/70 bg-indigo-50/50 dark:bg-indigo-950/30 p-4 space-y-2 text-xs">
                                <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>
                                        UK HMRC Inside IR35 Key Information Document (KID) vs. Outside IR35 Limited Company Waterfall
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 font-mono">
                                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <div className="text-[10px] font-sans text-slate-500">Inside IR35 Employer Deductions</div>
                                        <div className="font-bold text-rose-600">
                                            -£
                                            {(
                                                report.ukIr35KidWaterfall.employerNationalInsuranceAnnual +
                                                report.ukIr35KidWaterfall.apprenticeshipLevyAnnual +
                                                report.ukIr35KidWaterfall.umbrellaMarginAnnual
                                            ).toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            15% Employer NI (£{report.ukIr35KidWaterfall.employerNationalInsuranceAnnual.toLocaleString()}) +
                                            0.5% Levy
                                        </div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <div className="text-[10px] font-sans text-slate-500">Gross Taxable PAYE Salary</div>
                                        <div className="font-bold text-slate-900 dark:text-white">
                                            £{report.ukIr35KidWaterfall.grossTaxablePayeSalaryAnnual.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            Includes £{report.ukIr35KidWaterfall.rolledUpHolidayPayComponentAnnual.toLocaleString()} holiday pot
                                        </div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <div className="text-[10px] font-sans text-slate-500">Outside IR35 Net Advantage</div>
                                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                                            +£{report.ukIr35KidWaterfall.outsideIr35AnnualGainOverInside.toLocaleString()}/yr
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            Corp Tax: £{report.ukIr35KidWaterfall.outsideIr35CorporationTaxAnnual.toLocaleString()} | Div Tax: £
                                            {report.ukIr35KidWaterfall.outsideIr35DividendTaxAnnual.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ============================================================================
          TAB 2: BREAK-EVEN RATE MATRIX & RECRUITER COUNTER-OFFER GENERATOR
          ============================================================================ */}
            {activeDeepDiveTab === 'breakeven_negotiation' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="min-w-0 lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3 overflow-hidden">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            Billable Utilization Sensitivity &amp; Exact Break-Even Rate Matrix (44 to 52 Weeks/Yr)
                        </h3>
                        <p className="text-xs text-slate-500">
                            Shows the exact Hourly and Daily Contractor Rate required to match your Full-Time Employee Net Cash ({cur}
                            {report.employeeRegime.netCashTakeHomeAnnual.toLocaleString()}) and True Total Package ({cur}
                            {report.employeeRegime.trueTotalEconomicPackageAnnual.toLocaleString()}).
                        </p>
                        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/90 text-[11px] text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="py-2.5 px-3">Utilization</th>
                                        <th className="py-2.5 px-3">Match Cash Only</th>
                                        <th className="py-2.5 px-3">Match Cash + Benefits</th>
                                        <th className="py-2.5 px-3 text-emerald-700 dark:text-emerald-300">
                                            Target Rate (+15% Buffer)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-mono text-xs">
                                    {report.breakEvenMatrix.map((row) => {
                                        const isCurrent = row.billableWeeks === inputs.billableWeeksPerYear;
                                        return (
                                            <tr
                                                key={row.billableWeeks}
                                                className={isCurrent ? 'bg-blue-50/70 dark:bg-blue-950/40 font-bold' : ''}
                                            >
                                                <td className="py-2.5 px-3 font-sans">
                                                    <strong>{row.billableWeeks} Wks/Yr</strong> ({row.billableHoursAnnual} hrs)
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    {cur}
                                                    {row.hourlyRateToMatchCashOnly}/hr ({cur}
                                                    {row.dailyRateToMatchCashOnly}/d)
                                                </td>
                                                <td className="py-2.5 px-3 text-blue-600 dark:text-blue-400 font-bold">
                                                    {cur}
                                                    {row.hourlyRateToMatchTotalPackage}/hr ({cur}
                                                    {row.dailyRateToMatchTotalPackage}/d)
                                                </td>
                                                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                                                    {cur}
                                                    {row.recommendedHourlyRateWith15PctBuffer}/hr ({cur}
                                                    {row.recommendedDailyRateWith15PctBuffer}/d)
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="min-w-0 lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3 overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Recruiter / Client Rate Negotiation Script
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    void navigator.clipboard?.writeText(report.recruiterNegotiationBriefText);
                                    setCopiedNegotiation(true);
                                    setTimeout(() => setCopiedNegotiation(false), 2000);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                            >
                                {copiedNegotiation ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedNegotiation ? 'Copied Script!' : 'Copy Counter-Offer'}</span>
                            </button>
                        </div>
                        <pre className="rounded-xl bg-slate-950 text-emerald-300 p-3.5 font-mono text-[11px] overflow-x-auto max-h-[340px] whitespace-pre-wrap break-words leading-relaxed">
                            {report.recruiterNegotiationBriefText}
                        </pre>
                    </div>
                </div>
            )}

            {/* ============================================================================
          TAB 3: 12-POINT WORKER CLASSIFICATION, IR35 CEST & MISCLASSIFICATION LINTER
          ============================================================================ */}
            {activeDeepDiveTab === 'classification_ir35' && (
                <div className="space-y-5">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-bold flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                                    <span>
                                        12-Point Worker Classification &amp; IR35 CEST Audit Scorecard ({meta.classificationTestName})
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Toggle contract clauses below to evaluate Right of Substitution, Supervision/Direction/Control (SDC),
                                    Mutuality of Obligation (MOO), and Financial Risk.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${report.classificationComplianceScore >= 80
                                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                            : report.classificationComplianceScore >= 55
                                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                                : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                        }`}
                                >
                                    Score: {report.classificationComplianceScore}/100 ({report.classificationVerdict})
                                </span>
                                {report.classificationLintIssues.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setInputs((prev) => applySafeHarborClassificationFixes(prev));
                                            setStatusNotice(
                                                'Applied 1-Click Safe-Harbor Contractual Clauses: Right of Substitution, Deliverable SOW, Autonomous Control & Indemnity Insurance (Compliance Score: 100/100)!'
                                            );
                                        }}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition cursor-pointer"
                                    >
                                        <Wrench className="w-3.5 h-3.5" />
                                        <span>
                                            Apply Suggested Assessment Answers ({report.classificationLintIssues.length})
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 8 Interactive Contractual Clause Checkboxes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                            {(
                                [
                                    {
                                        key: 'hasUnfetteredRightOfSubstitution',
                                        label: 'Unfettered Right of Substitution in Contract',
                                    },
                                    {
                                        key: 'clientControlsHowAndWhenWorkDone',
                                        label: 'Client Controls Fixed 9–5 Hours & Methodology (Risk!)',
                                    },
                                    {
                                        key: 'hasMutualityOfObligation',
                                        label: 'Ongoing Mutuality of Obligation (MOO) (Risk!)',
                                    },
                                    {
                                        key: 'bearsFinancialRiskAndFixedPriceRemediation',
                                        label: 'Contractor Fixes Defects at Own Unbilled Cost',
                                    },
                                    {
                                        key: 'usesClientProvidedEquipment',
                                        label: 'Uses Client-Supplied Primary Laptop (Risk!)',
                                    },
                                    {
                                        key: 'singleClientOver80PercentRevenue',
                                        label: 'Single Client >80% of Annual Revenue (Risk!)',
                                    },
                                    {
                                        key: 'integratedIntoClientOrgChartAndPerks',
                                        label: 'Included in Client Org Chart / Employee Perks (Risk!)',
                                    },
                                    {
                                        key: 'carriesProfessionalIndemnityInsurance',
                                        label: 'Carries Commercial / Professional Indemnity Insurance',
                                    },
                                    {
                                        key: 'writtenStatementOfWorkWithDeliverables',
                                        label: 'Deliverable Milestone Statement of Work (SOW)',
                                    },
                                    {
                                        key: 'contractDurationOver12MonthsContinuous',
                                        label: 'Continuous Rolling Tenure >12 Months (Risk!)',
                                    },
                                    {
                                        key: 'operatesRegisteredBusinessEntityOrWebsite',
                                        label: 'Operates Registered B2B Entity / Business Bank Account',
                                    },
                                    {
                                        key: 'canWorkForMultipleClientsSimultaneously',
                                        label: 'Permitted to Serve Multiple Clients (Non-Exclusive)',
                                    },
                                ] as const
                            ).map((item) => (
                                <label
                                    key={item.key}
                                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 cursor-pointer select-none"
                                >
                                    <input
                                        type="checkbox"
                                        checked={inputs.classificationFlags[item.key]}
                                        onChange={(e) =>
                                            setInputs((prev) => ({
                                                ...prev,
                                                classificationFlags: {
                                                    ...prev.classificationFlags,
                                                    [item.key]: e.target.checked,
                                                },
                                            }))
                                        }
                                        className="w-4 h-4 accent-blue-600 rounded shrink-0"
                                    />
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                                        {item.label}
                                    </span>
                                </label>
                            ))}
                        </div>

                        {report.classificationLintIssues.length === 0 ? (
                            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span>
                                    <strong>PASSED ALL 12 STATUTORY CLASSIFICATION &amp; IR35 CEST CHECKS (100/100):</strong> Contract
                                    exhibits strong B2B independence (Unfettered Substitution, Autonomous Control, Deliverable SOW,
                                    Financial Risk &amp; Indemnity Coverage).
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {report.classificationLintIssues.map((issue) => (
                                    <div
                                        key={issue.id}
                                        className="p-4 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20 text-xs space-y-2 min-w-0"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                                <span>{issue.title}</span>
                                            </span>
                                            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-900 text-white">
                                                {issue.ruleCode}
                                            </span>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300">{issue.explanation}</p>
                                        <div className="p-2 rounded bg-slate-950 text-emerald-300 font-mono text-[11px]">
                                            Safe-Harbor Clause: &quot;{issue.remediationClause}&quot;
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ============================================================================
          TAB 4: EMPLOYER TOTAL COST OF EMPLOYMENT (TCE) & GLOBAL EOR FEE COMPARATOR
          ============================================================================ */}
            {activeDeepDiveTab === 'employer_eor_cost' && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 overflow-hidden">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Hiring Manager &amp; CFO View: Direct Entity Hire vs. Global EOR (Deel / Remote / Oyster) vs. B2B Contractor
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 space-y-2">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                                1. Direct Local Entity Employee
                            </div>
                            <div className="text-2xl font-extrabold font-mono text-blue-600">
                                {cur}
                                {report.employerTceComparison.directEmployeeTotalCostOfEmploymentAnnual.toLocaleString()}/yr
                            </div>
                            <ul className="space-y-1 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                                <li>
                                    • Base + Bonus: {cur}
                                    {report.employerTceComparison.directEmployeeBaseAndBonusAnnual.toLocaleString()}
                                </li>
                                <li>
                                    • Employer Payroll Tax / NI / Super: +{cur}
                                    {report.employerTceComparison.directEmployerPayrollTaxesAnnual.toLocaleString()}
                                </li>
                                <li>
                                    • Health + Retirement Match: +{cur}
                                    {report.employerTceComparison.directEmployerBenefitsAndRetirementAnnual.toLocaleString()}
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 space-y-2">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                                2. Global EOR Hire (Deel / Remote / Oyster)
                            </div>
                            <div className="text-2xl font-extrabold font-mono text-indigo-600">
                                {cur}
                                {report.employerTceComparison.eorTotalAnnualCost.toLocaleString()}/yr
                            </div>
                            <ul className="space-y-1 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                                <li>
                                    • Direct TCE Base: {cur}
                                    {report.employerTceComparison.directEmployeeTotalCostOfEmploymentAnnual.toLocaleString()}
                                </li>
                                <li>
                                    • EOR Platform Fee ({cur}
                                    {meta.eorMonthlyPlatformFeeLocal}/mo × 12): +{cur}
                                    {report.employerTceComparison.eorAnnualPlatformFee.toLocaleString()}
                                </li>
                                <li>• Zero local entity setup required</li>
                            </ul>
                        </div>

                        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                                3. Independent B2B Contractor Spend
                            </div>
                            <div className="text-2xl font-extrabold font-mono text-emerald-600">
                                {cur}
                                {report.employerTceComparison.contractorTotalCompanySpendAnnual.toLocaleString()}/yr
                            </div>
                            <ul className="space-y-1 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                                <li>
                                    • Gross Contract Invoices: {cur}
                                    {report.employerTceComparison.contractorGrossInvoiceAnnual.toLocaleString()}
                                </li>
                                <li>
                                    • Contractor AOR Platform Fee: +{cur}
                                    {report.employerTceComparison.contractorManagementPlatformFeeAnnual.toLocaleString()}
                                </li>
                                <li className="text-rose-600 font-sans font-semibold">
                                    • Misclassification Back-Tax Exposure: {cur}
                                    {report.employerTceComparison.estimatedMisclassificationBackTaxAndPenaltyRisk.toLocaleString()}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================================
          TAB 5: 6-FORMAT ENTERPRISE EXPORT STUDIO & VECTOR SVG CHART
          ============================================================================ */}
            {activeDeepDiveTab === 'export_studio' && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                            {[
                                { id: 'negotiation_txt' as const, label: '1. Recruiter Negotiation Script (.txt)' },
                                { id: 'markdown_dossier' as const, label: '2. Full Tax & KID Dossier (.md)' },
                                { id: 'certificate_json' as const, label: '3. SHA-256 Scenario Fingerprint (.json)' },
                                { id: 'contract_clauses_txt' as const, label: '4. Safe-Harbor SOW Addendum Clauses (.txt)' },
                                { id: 'svg_chart' as const, label: '5. Vector Comparison Chart (.svg)' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setExportCodeFormat(item.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${exportCodeFormat === item.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    void navigator.clipboard?.writeText(activeExportText);
                                    setCopiedExportCode(true);
                                    setTimeout(() => setCopiedExportCode(false), 2000);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white cursor-pointer"
                            >
                                {copiedExportCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedExportCode ? 'Copied!' : 'Copy Content'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const extMap: Record<typeof exportCodeFormat, string> = {
                                        negotiation_txt: 'contractor_rate_negotiation_brief.txt',
                                        markdown_dossier: 'contractor_vs_employee_tax_dossier.md',
                                        certificate_json: 'scenario_sha256_data_fingerprint.json',
                                        contract_clauses_txt: 'independent_contractor_sow_addendum_clauses.txt',
                                        svg_chart: 'contractor_vs_employee_chart.svg',
                                    };
                                    triggerDownload(activeExportText, extMap[exportCodeFormat], 'text/plain;charset=utf-8');
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download File</span>
                            </button>
                        </div>
                    </div>

                    <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-w-full max-h-[420px] whitespace-pre-wrap break-words leading-relaxed">
                        {activeExportText}
                    </pre>
                </div>
            )}
        </div>
    );
}