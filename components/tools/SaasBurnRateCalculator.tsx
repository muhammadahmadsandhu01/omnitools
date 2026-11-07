"use client";

import React, { useState, useRef, useMemo } from 'react';
import {
    Calculator,
    TrendingUp,
    ShieldCheck,
    ShieldAlert,
    Upload,
    Download,
    AlertTriangle,
    CheckCircle2,
    FileSpreadsheet,
    FileCode,
    FileText,
    Sparkles,
    Layers,
    Terminal,
    Cpu,
    Zap,
    Copy,
    Check,
    Plus,
    Trash2,
    Sliders,
    Info,
    Wrench,
    DollarSign,
    PieChart,
    Activity,
    Users,
    BarChart3,
    RotateCcw,
    Share2,
    ChevronDown,
    Calendar,
} from 'lucide-react';

import {
    SAAS_ENGINE_VERSION,
    compileAllSaasDeliverables,
    exportSaasModelXlsx,
    generateSampleSaasProject,
    autoFixSaasWorkspace,
    parseHistoricalActualsCsvOrJson,
    type SaasPresetId,
    type SaasWorkspaceState,
    type ConvertibleInstrumentType,
    type LiquidationParticipationType,
    type ConvertibleInstrument,
    type HiringPlanRole,
} from '@/lib/saasBurnRateEngine';

type SaasScheduleTab =
    | 'cashflow_schedule'
    | 'captable_dilution'
    | 'exit_waterfall'
    | 'montecarlo_heatmaps'
    | 'venture_linter'
    | 'export_studio';

const CURRENCY_OPTIONS: { code: string; symbol: string; label: string }[] = [
    { code: 'USD', symbol: '$', label: 'United States dollar (USD) — $' },
    { code: 'EUR', symbol: '€', label: 'Euro (EUR) — €' },
    { code: 'GBP', symbol: '£', label: 'British pound sterling (GBP) — £' },
    { code: 'CAD', symbol: 'CA$', label: 'Canadian dollar (CAD) — CA$' },
    { code: 'AUD', symbol: 'A$', label: 'Australian dollar (AUD) — A$' },
    { code: 'SGD', symbol: 'S$', label: 'Singapore dollar (SGD) — S$' },
    { code: 'INR', symbol: '₹', label: 'Indian rupee (INR) — ₹' },
    { code: 'PKR', symbol: '₨', label: 'Pakistani rupee (PKR) — ₨' },
    { code: 'AED', symbol: 'AED ', label: 'UAE dirham (AED) — AED' },
];

const QUICK_SCENARIO_PRESETS: {
    id: SaasPresetId;
    pillLabel: string;
    badge: string;
}[] = [
        {
            id: 'yc_seed_ai_saas',
            pillLabel: 'YC Seed AI SaaS ($1.85M Cash)',
            badge: 'Default Alive • 2 SAFEs + Series A',
        },
        {
            id: 'hypergrowth_fatal_pinch',
            pillLabel: 'Hypergrowth B2B (Fatal Pinch)',
            badge: 'Default Dead • Test 1-Click Fix',
        },
        {
            id: 'stacked_safe_pool_shuffle',
            pillLabel: '4 Stacked SAFEs + Pool Shuffle',
            badge: 'MFN Auto-Upgrade + 16% Pool',
        },
        {
            id: 'bootstrapped_indie_profitable',
            pillLabel: 'Bootstrapped Micro-SaaS',
            badge: 'Zero Dilution • 93.5% Founders',
        },
        {
            id: 'series_b_scaleup_waterfall',
            pillLabel: 'Series B + $1.25M Secondary',
            badge: '$5M ARR • $250M Exit Waterfall',
        },
        {
            id: 'deeptech_grant_venture_debt',
            pillLabel: 'DeepTech Grant + Venture Debt',
            badge: '$1M Grant + $1.5M Venture Debt',
        },
    ];

const SAMPLE_HISTORICAL_CSV = `Month,MRR_USD,Total_OpEx_USD,Ending_Cash_USD
2026-06,28500,82000,1980000
2026-07,32400,85000,1927400
2026-08,36900,88500,1875800
2026-09,41800,91000,1826600
2026-10,47500,94000,1780100`;

export default function SaasBurnRateCalculator() {
    const [workspace, setWorkspace] = useState<SaasWorkspaceState>(() => {
        const base = generateSampleSaasProject('yc_seed_ai_saas');
        if (typeof window !== 'undefined' && window.location.search) {
            const params = new URLSearchParams(window.location.search);
            const presetParam = params.get('preset') as SaasPresetId | null;
            const seeded =
                presetParam && QUICK_SCENARIO_PRESETS.some((p) => p.id === presetParam)
                    ? generateSampleSaasProject(presetParam)
                    : base;
            const cash = Number(params.get('cash'));
            const mrr = Number(params.get('mrr'));
            const growth = Number(params.get('growth'));
            const churn = Number(params.get('churn'));
            const preA = Number(params.get('preA'));
            const newA = Number(params.get('newA'));
            const poolA = Number(params.get('poolA'));
            const exitVal = Number(params.get('exit'));
            return {
                ...seeded,
                startingCashDollars:
                    !Number.isNaN(cash) && cash >= 0 ? cash : seeded.startingCashDollars,
                startingMrrDollars:
                    !Number.isNaN(mrr) && mrr >= 0 ? mrr : seeded.startingMrrDollars,
                monthlyNewMrrGrowthPct:
                    !Number.isNaN(growth) && growth >= 0
                        ? growth
                        : seeded.monthlyNewMrrGrowthPct,
                monthlyGrossChurnMrrPct:
                    !Number.isNaN(churn) && churn >= 0
                        ? churn
                        : seeded.monthlyGrossChurnMrrPct,
                seriesARound: {
                    ...seeded.seriesARound,
                    preMoneyValuationDollars:
                        !Number.isNaN(preA) && preA > 0
                            ? preA
                            : seeded.seriesARound.preMoneyValuationDollars,
                    newMoneyInvestmentDollars:
                        !Number.isNaN(newA) && newA >= 0
                            ? newA
                            : seeded.seriesARound.newMoneyInvestmentDollars,
                    targetPostRoundOptionPoolPct:
                        !Number.isNaN(poolA) && poolA >= 0
                            ? poolA
                            : seeded.seriesARound.targetPostRoundOptionPoolPct,
                },
                exitConfig: {
                    ...seeded.exitConfig,
                    targetExitValuationDollars:
                        !Number.isNaN(exitVal) && exitVal > 0
                            ? exitVal
                            : seeded.exitConfig.targetExitValuationDollars,
                },
            };
        }
        return base;
    });

    const [currencyCode, setCurrencyCode] = useState<string>('USD');
    const [activeTab, setActiveTab] = useState<SaasScheduleTab>('cashflow_schedule');
    const [statusBanner, setStatusBanner] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

    // Collapsible Left-Column Advanced Drawers (Matching EMI & Mortgage Calculator)
    const [openAiCogsDrawer, setOpenAiCogsDrawer] = useState<boolean>(false);
    const [openHiringDebtDrawer, setOpenHiringDebtDrawer] = useState<boolean>(false);
    const [openCapTableDrawer, setOpenCapTableDrawer] = useState<boolean>(false);

    // Historical CSV Paste & Hiring Role Builder State
    const [historicalCsvText, setHistoricalCsvText] = useState<string>('');
    const [newHireTitle, setNewHireTitle] = useState<string>('');
    const [newHireDept, setNewHireDept] = useState<'R&D' | 'S&M' | 'G&A'>('R&D');
    const [newHireSalary, setNewHireSalary] = useState<number>(145000);
    const [newHireStartMonth, setNewHireStartMonth] = useState<number>(6);

    // New SAFE / Convertible Note Input State
    const [newSafeName, setNewSafeName] = useState<string>('');
    const [newSafeType, setNewSafeType] =
        useState<ConvertibleInstrumentType>('YC_POST_MONEY_SAFE');
    const [newSafePrincipal, setNewSafePrincipal] = useState<number>(500000);
    const [newSafeCap, setNewSafeCap] = useState<number>(15000000);
    const [newSafeDiscount, setNewSafeDiscount] = useState<number>(20);
    const [newSafeIssueMonth, setNewSafeIssueMonth] = useState<number>(0);

    // Export Studio Active Format
    const [exportFormat, setExportFormat] = useState<
        | 'board_markdown'
        | 'cashflow_csv'
        | 'captable_csv'
        | 'waterfall_csv'
        | 'interactive_html'
        | 'snapshot_json'
        | 'python_script'
        | 'url_permalink'
        | 'executive_txt'
    >('board_markdown');
    const [copiedExport, setCopiedExport] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const bottomTabsRef = useRef<HTMLDivElement | null>(null);

    const sym = workspace.currencySymbol || '$';

    // Synchronously compile all 60-month cash flows, algebraic SAFE conversions, exit waterfalls, Monte Carlo & Linter
    const compiled = useMemo(() => compileAllSaasDeliverables(workspace), [workspace]);

    const totalBaselineMonthlyOpex =
        workspace.baselineRdOpexDollars +
        workspace.baselineSmOpexDollars +
        workspace.baselineGaOpexDollars;

    const handleCurrencyChange = (code: string) => {
        setCurrencyCode(code);
        const found = CURRENCY_OPTIONS.find((c) => c.code === code);
        if (found) {
            setWorkspace((prev) => ({ ...prev, currencySymbol: found.symbol }));
        }
    };

    const handleSelectPreset = (presetId: SaasPresetId) => {
        setErrorMessage(null);
        const next = generateSampleSaasProject(presetId);
        next.currencySymbol = sym;
        setWorkspace(next);
        const info = QUICK_SCENARIO_PRESETS.find((p) => p.id === presetId);
        setStatusBanner(
            `Loaded Scenario: "${info?.pillLabel || presetId}" — Runway, Cap Table Dilution, and 1,000 Monte Carlo runs updated.`
        );
    };

    const handleResetForm = () => {
        setErrorMessage(null);
        const base = generateSampleSaasProject('yc_seed_ai_saas');
        setWorkspace({
            ...base,
            companyName: 'My SaaS Startup',
            currencySymbol: sym,
            startingCashDollars: 0,
            startingMrrDollars: 0,
            monthlyNewMrrGrowthPct: 0,
            monthlyExpansionMrrPct: 0,
            monthlyGrossChurnMrrPct: 0,
            baselineRdOpexDollars: 0,
            baselineSmOpexDollars: 0,
            baselineGaOpexDollars: 0,
            hiringPlan: [],
            cashEvents: [],
            aiTokenCogs: { ...base.aiTokenCogs, enabled: false },
            ventureDebt: { ...base.ventureDebt, enabled: false },
        });
        setStatusBanner('Form reset to zero. Enter your cash balance, MRR, and monthly expenses on the left.');
    };

    const handleTotalOpexSliderChange = (newTotalOpex: number) => {
        const cleanTotal = Math.max(0, newTotalOpex);
        if (totalBaselineMonthlyOpex <= 0) {
            setWorkspace((prev) => ({
                ...prev,
                baselineRdOpexDollars: Math.round(cleanTotal * 0.5),
                baselineSmOpexDollars: Math.round(cleanTotal * 0.32),
                baselineGaOpexDollars: Math.round(cleanTotal * 0.18),
            }));
        } else {
            const ratio = cleanTotal / totalBaselineMonthlyOpex;
            setWorkspace((prev) => ({
                ...prev,
                baselineRdOpexDollars: Math.round(prev.baselineRdOpexDollars * ratio),
                baselineSmOpexDollars: Math.round(prev.baselineSmOpexDollars * ratio),
                baselineGaOpexDollars: Math.round(prev.baselineGaOpexDollars * ratio),
            }));
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setErrorMessage(null);
        try {
            const text = await file.text();
            const res = parseHistoricalActualsCsvOrJson(text, workspace);
            setWorkspace(res.updatedWorkspace);
            setStatusBanner(res.summaryMessage);
        } catch (err: unknown) {
            setErrorMessage(
                err instanceof Error ? err.message : 'Unable to parse uploaded CSV/JSON file.'
            );
        }
        e.target.value = '';
    };

    const handleApplyHistoricalPaste = () => {
        setErrorMessage(null);
        const raw = historicalCsvText.trim() || SAMPLE_HISTORICAL_CSV;
        try {
            const res = parseHistoricalActualsCsvOrJson(raw, workspace);
            setWorkspace(res.updatedWorkspace);
            setHistoricalCsvText('');
            setStatusBanner(res.summaryMessage);
        } catch (err: unknown) {
            setErrorMessage(
                err instanceof Error ? err.message : 'Invalid CSV/JSON format.'
            );
        }
    };

    const handleAddHiringRole = () => {
        const title =
            newHireTitle.trim() || `Software Engineer #${workspace.hiringPlan.length + 1}`;
        const newRole: HiringPlanRole = {
            id: `hire_${Date.now()}`,
            title,
            department: newHireDept,
            count: 1,
            annualBaseSalary: Math.max(24000, Number(newHireSalary) || 120000),
            benefitsAndTaxBurdenPct: 18,
            startMonth: Math.min(60, Math.max(1, Number(newHireStartMonth) || 6)),
            enabled: true,
        };
        setWorkspace((prev) => ({
            ...prev,
            hiringPlan: [newRole, ...prev.hiringPlan],
        }));
        setNewHireTitle('');
        setStatusBanner(
            `Added "${newRole.title}" (${newRole.department}, ${sym}${newRole.annualBaseSalary.toLocaleString()}/yr starting M${newRole.startMonth}).`
        );
    };

    const handleAddConvertible = () => {
        const investorName =
            newSafeName.trim() || `Seed SAFE #${workspace.convertibles.length + 1}`;
        const newItem: ConvertibleInstrument = {
            id: `conv_${Date.now()}`,
            investorName,
            type: newSafeType,
            principalDollars: Math.max(10000, Number(newSafePrincipal) || 500000),
            issueMonth: Math.min(60, Math.max(0, Number(newSafeIssueMonth) || 0)),
            valuationCapDollars: Math.max(0, Number(newSafeCap) || 15000000),
            discountPct: Math.min(50, Math.max(0, Number(newSafeDiscount) || 0)),
            annualInterestRatePct: newSafeType === 'CONVERTIBLE_NOTE' ? 8.0 : 0,
            accruedMonthsAtConversion: newSafeType === 'CONVERTIBLE_NOTE' ? 12 : 0,
            mfnEnabled: false,
            proRataRightEnabled: true,
            liquidationMultiple: 1,
            participationType: 'NON_PARTICIPATING',
            participationCapMultiple: 2,
            enabled: true,
        };
        setWorkspace((prev) => ({
            ...prev,
            convertibles: [...prev.convertibles, newItem],
        }));
        setNewSafeName('');
        setStatusBanner(
            `Added "${newItem.investorName}" (${sym}${newItem.principalDollars.toLocaleString()} @ ${sym}${(newItem.valuationCapDollars / 1e6).toFixed(1)}M Cap).`
        );
    };

    const handleApplyBreakevenOpexFix = () => {
        const cutRatio = compiled.breakevenSolver.requiredImmediateOpexCutPct / 100;
        const scale = Math.max(0.1, 1 - cutRatio - 0.01);
        setWorkspace((prev) => ({
            ...prev,
            baselineRdOpexDollars: Math.round(prev.baselineRdOpexDollars * scale),
            baselineSmOpexDollars: Math.round(prev.baselineSmOpexDollars * scale),
            baselineGaOpexDollars: Math.round(prev.baselineGaOpexDollars * scale),
            aiTokenCogs: {
                ...prev.aiTokenCogs,
                fixedGpuClusterMonthlyDollars: Math.round(
                    prev.aiTokenCogs.fixedGpuClusterMonthlyDollars * scale
                ),
            },
            hiringPlan: prev.hiringPlan.map((h) => ({
                ...h,
                annualBaseSalary: Math.round(h.annualBaseSalary * scale),
            })),
        }));
        setStatusBanner(
            `Applied Breakeven OpEx Cut (-${compiled.breakevenSolver.requiredImmediateOpexCutPct}%) — Startup flipped to DEFAULT ALIVE!`
        );
    };

    const handleApplyBreakevenGrowthFix = () => {
        const targetGrowth = Number(
            (compiled.breakevenSolver.requiredMonthlyNewMrrGrowthPct + 0.3).toFixed(2)
        );
        setWorkspace((prev) => ({
            ...prev,
            monthlyNewMrrGrowthPct: targetGrowth,
        }));
        setStatusBanner(
            `Applied Breakeven Growth Target (${targetGrowth}%/mo New MRR Growth) — Startup flipped to DEFAULT ALIVE!`
        );
    };

    const handleCopyShareScenario = () => {
        const origin =
            typeof window !== 'undefined'
                ? `${window.location.origin}${window.location.pathname}`
                : 'https://kivarotools.com/finance/saas-burn-rate-calculator';
        const fullUrl = `${origin}${compiled.shareableUrlQuery}`;
        void navigator.clipboard?.writeText(fullUrl);
        setCopiedShareLink(true);
        setTimeout(() => setCopiedShareLink(false), 2000);
        setStatusBanner('Copied shareable scenario link to clipboard!');
    };

    const triggerDownload = (
        content: Uint8Array | string,
        fileName: string,
        mimeType: string
    ) => {
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

    const activeExportText = useMemo(() => {
        if (exportFormat === 'cashflow_csv') return compiled.cashFlowCsv;
        if (exportFormat === 'captable_csv') return compiled.capTableCsv;
        if (exportFormat === 'waterfall_csv') return compiled.exitWaterfallCsv;
        if (exportFormat === 'board_markdown') return compiled.boardReportMarkdown;
        if (exportFormat === 'interactive_html') return compiled.interactiveBoardHtml;
        if (exportFormat === 'snapshot_json') return compiled.modelSnapshotJson;
        if (exportFormat === 'python_script') return compiled.pythonVerificationScript;
        if (exportFormat === 'url_permalink') return compiled.shareableUrlQuery;
        return compiled.executiveTermSheetSummaryTxt;
    }, [exportFormat, compiled]);

    // SVG Chart Coordinates (60-Month Cash Balance + MRR vs Gross Burn)
    const runwaySvgData = useMemo(() => {
        const rows = compiled.monthlyRows;
        const maxCash = Math.max(
            100_000,
            ...rows.map((r) => Math.max(0, r.endingCash)),
            workspace.startingCashDollars
        );
        const minCash = Math.min(0, ...rows.map((r) => r.endingCash));
        const cashSpan = Math.max(1, maxCash - minCash);

        const maxFlow = Math.max(
            10_000,
            ...rows.map((r) => Math.max(r.cashCollectedFromRevenue, r.grossBurn))
        );

        const width = 680;
        const height = 210;
        const padLeft = 52;
        const padRight = 20;
        const padTop = 18;
        const padBottom = 28;
        const plotW = width - padLeft - padRight;
        const plotH = height - padTop - padBottom;

        const xForMonth = (m: number) => padLeft + ((m - 1) / 59) * plotW;
        const yForCash = (c: number) =>
            padTop + plotH - ((c - minCash) / cashSpan) * plotH;
        const yForFlow = (f: number) =>
            padTop + plotH - (Math.min(maxFlow, Math.max(0, f)) / maxFlow) * plotH;

        const zeroY = yForCash(0);

        const cashPoints = rows
            .map((r) => `${xForMonth(r.month).toFixed(1)},${yForCash(r.endingCash).toFixed(1)}`)
            .join(' ');
        const cashAreaPoints = `${xForMonth(1).toFixed(1)},${zeroY.toFixed(1)} ${cashPoints} ${xForMonth(60).toFixed(1)},${zeroY.toFixed(1)}`;

        const revPoints = rows
            .map(
                (r) =>
                    `${xForMonth(r.month).toFixed(1)},${yForFlow(r.cashCollectedFromRevenue).toFixed(1)}`
            )
            .join(' ');
        const burnPoints = rows
            .map((r) => `${xForMonth(r.month).toFixed(1)},${yForFlow(r.grossBurn).toFixed(1)}`)
            .join(' ');

        return {
            width,
            height,
            padLeft,
            padRight,
            padTop,
            padBottom,
            zeroY,
            maxCash,
            maxFlow,
            xForMonth,
            cashPoints,
            cashAreaPoints,
            revPoints,
            burnPoints,
        };
    }, [compiled.monthlyRows, workspace.startingCashDollars]);

    // Revenue vs Net Burn Progress Bar Ratio for the Blue Hero Card
    const m1Row = compiled.monthlyRows[0];
    const m1Rev = Math.max(0, m1Row?.cashCollectedFromRevenue || 0);
    const m1NetBurn = Math.max(0, compiled.currentNetBurnMonthlyDollars);
    const m1GrossTotal = Math.max(1, m1Rev + m1NetBurn);
    const revCoveragePct = Number(((m1Rev / m1GrossTotal) * 100).toFixed(1));
    const burnDeficitPct = Number((100 - revCoveragePct).toFixed(1));

    const isZeroInputState =
        workspace.startingCashDollars <= 0 &&
        workspace.startingMrrDollars <= 0 &&
        totalBaselineMonthlyOpex <= 0;

    return (
        <div className="space-y-6 w-full min-w-0 max-w-full overflow-x-hidden text-slate-900 dark:text-slate-100">
            {/* STATUS / ERROR BANNERS */}
            {errorMessage && (
                <div className="rounded-2xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 p-4 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold">Calculation Input Alert</p>
                        <p className="text-xs mt-0.5 break-words">{errorMessage}</p>
                    </div>
                </div>
            )}

            {statusBanner && (
                <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/40 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-indigo-950 dark:text-indigo-200">
                    <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span className="truncate font-medium">{statusBanner}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setStatusBanner(null)}
                        className="text-indigo-700 dark:text-indigo-300 hover:underline font-semibold shrink-0"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* ============================================================================
                MAIN 2-COLUMN KIVAROTOOLS FINANCE CALCULATOR LAYOUT (LEFT INPUTS | RIGHT HERO RESULTS)
               ============================================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ========================================================================
                    LEFT COLUMN (5 COLS): SCENARIO PRESETS, SLIDERS, SEGMENTED TOGGLES & DRAWERS
                   ======================================================================== */}
                <div className="lg:col-span-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-5 min-w-0">
                    {/* Header: Parameters + Reset */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                Runway, Burn &amp; Equity Parameters
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleResetForm}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset Form</span>
                        </button>
                    </div>

                    {/* Quick Scenario Presets Box (Matches Mortgage Calculator Left Preset Card) */}
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span>Quick Scenario Presets</span>
                            </span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.json,.txt"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                <Upload className="w-3 h-3" />
                                <span>Import CSV/JSON</span>
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {QUICK_SCENARIO_PRESETS.map((p) => {
                                const isActive =
                                    !isZeroInputState && workspace.activePreset === p.id;
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => handleSelectPreset(p.id)}
                                        title={p.badge}
                                        className={`px-2.5 py-1.5 rounded-full text-xs font-medium border transition ${isActive
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                            }`}
                                    >
                                        {p.pillLabel}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Select Currency Dropdown (Matches EMI & Mortgage Calculator) */}
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                            Currency
                        </label>
                        <select
                            value={currencyCode}
                            onChange={(e) => handleCurrencyChange(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        >
                            {CURRENCY_OPTIONS.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            Denomination only; does not perform exchange rate conversions.
                        </p>
                    </div>

                    {/* Slider Input 1: Current Cash Balance */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                Current Bank Cash Balance
                            </label>
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 px-3 py-1.5 w-36">
                                <span className="text-xs font-semibold text-slate-400 mr-1.5">
                                    {sym}
                                </span>
                                <input
                                    type="number"
                                    value={workspace.startingCashDollars}
                                    onChange={(e) =>
                                        setWorkspace((prev) => ({
                                            ...prev,
                                            startingCashDollars: Math.max(
                                                0,
                                                Number(e.target.value) || 0
                                            ),
                                        }))
                                    }
                                    className="w-full bg-transparent text-right text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none"
                                />
                            </div>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={15000000}
                            step={25000}
                            value={Math.min(15000000, workspace.startingCashDollars)}
                            onChange={(e) =>
                                setWorkspace((prev) => ({
                                    ...prev,
                                    startingCashDollars: Number(e.target.value),
                                }))
                            }
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    {/* Slider Input 2: Current Monthly Recurring Revenue (MRR) */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                Current Monthly Revenue (MRR)
                            </label>
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 px-3 py-1.5 w-36">
                                <span className="text-xs font-semibold text-slate-400 mr-1.5">
                                    {sym}
                                </span>
                                <input
                                    type="number"
                                    value={workspace.startingMrrDollars}
                                    onChange={(e) =>
                                        setWorkspace((prev) => ({
                                            ...prev,
                                            startingMrrDollars: Math.max(
                                                0,
                                                Number(e.target.value) || 0
                                            ),
                                        }))
                                    }
                                    className="w-full bg-transparent text-right text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none"
                                />
                            </div>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={1000000}
                            step={5000}
                            value={Math.min(1000000, workspace.startingMrrDollars)}
                            onChange={(e) =>
                                setWorkspace((prev) => ({
                                    ...prev,
                                    startingMrrDollars: Number(e.target.value),
                                }))
                            }
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    {/* Slider Input 3: Total Monthly Operating Expenses (R&D + S&M + G&A) */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                                    Monthly Operating Expenses
                                </label>
                                <span className="text-[10px] text-slate-400">
                                    R&amp;D {sym}
                                    {(workspace.baselineRdOpexDollars / 1000).toFixed(0)}k • S&amp;M{' '}
                                    {sym}
                                    {(workspace.baselineSmOpexDollars / 1000).toFixed(0)}k • G&amp;A{' '}
                                    {sym}
                                    {(workspace.baselineGaOpexDollars / 1000).toFixed(0)}k
                                </span>
                            </div>
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 px-3 py-1.5 w-36">
                                <span className="text-xs font-semibold text-slate-400 mr-1.5">
                                    {sym}
                                </span>
                                <input
                                    type="number"
                                    value={totalBaselineMonthlyOpex}
                                    onChange={(e) =>
                                        handleTotalOpexSliderChange(Number(e.target.value) || 0)
                                    }
                                    className="w-full bg-transparent text-right text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none"
                                />
                            </div>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={1000000}
                            step={5000}
                            value={Math.min(1000000, totalBaselineMonthlyOpex)}
                            onChange={(e) => handleTotalOpexSliderChange(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    {/* Slider Input 4: Compound Monthly New MRR Growth Rate % */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                                    Monthly MRR Growth Rate
                                </label>
                                <span className="text-[10px] text-slate-400">
                                    Compound monthly new recurring revenue rate
                                </span>
                            </div>
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 px-3 py-1.5 w-28">
                                <input
                                    type="number"
                                    step="0.5"
                                    value={workspace.monthlyNewMrrGrowthPct}
                                    onChange={(e) =>
                                        setWorkspace((prev) => ({
                                            ...prev,
                                            monthlyNewMrrGrowthPct: Math.max(
                                                0,
                                                Number(e.target.value) || 0
                                            ),
                                        }))
                                    }
                                    className="w-full bg-transparent text-right text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none"
                                />
                                <span className="text-xs font-semibold text-slate-400 ml-1">
                                    %
                                </span>
                            </div>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={35}
                            step={0.5}
                            value={Math.min(35, workspace.monthlyNewMrrGrowthPct)}
                            onChange={(e) =>
                                setWorkspace((prev) => ({
                                    ...prev,
                                    monthlyNewMrrGrowthPct: Number(e.target.value),
                                }))
                            }
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    {/* 2-Column Compact Pair: Expansion MRR % & Gross Churn % (Like Down Payment / Tax in Mortgage Calc) */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                                Expansion MRR / Mo
                            </label>
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 px-3 py-2">
                                <input
                                    type="number"
                                    step="0.2"
                                    value={workspace.monthlyExpansionMrrPct}
                                    onChange={(e) =>
                                        setWorkspace((prev) => ({
                                            ...prev,
                                            monthlyExpansionMrrPct: Math.max(
                                                0,
                                                Number(e.target.value) || 0
                                            ),
                                        }))
                                    }
                                    className="w-full bg-transparent text-xs sm:text-sm font-semibold font-mono text-slate-900 dark:text-white focus:outline-none"
                                />
                                <span className="text-xs font-semibold text-slate-400 ml-1">%</span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                                Gross Churn / Mo
                            </label>
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 px-3 py-2">
                                <input
                                    type="number"
                                    step="0.2"
                                    value={workspace.monthlyGrossChurnMrrPct}
                                    onChange={(e) =>
                                        setWorkspace((prev) => ({
                                            ...prev,
                                            monthlyGrossChurnMrrPct: Math.max(
                                                0,
                                                Number(e.target.value) || 0
                                            ),
                                        }))
                                    }
                                    className="w-full bg-transparent text-xs sm:text-sm font-semibold font-mono text-slate-900 dark:text-white focus:outline-none"
                                />
                                <span className="text-xs font-semibold text-slate-400 ml-1">%</span>
                            </div>
                        </div>
                    </div>

                    {/* Segmented Toggle Buttons: Option Pool Shuffle Mode (Matches Monthly / Biweekly Toggle in Mortgage Calc) */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                            Series A Option Pool Carve-Out Mode
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() =>
                                    setWorkspace((prev) => ({
                                        ...prev,
                                        seriesARound: {
                                            ...prev.seriesARound,
                                            optionPoolCarveoutMode: 'PRE_MONEY_SHUFFLE',
                                        },
                                    }))
                                }
                                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${workspace.seriesARound.optionPoolCarveoutMode ===
                                        'PRE_MONEY_SHUFFLE'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                    }`}
                            >
                                Pre-Money Shuffle (VC Std)
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setWorkspace((prev) => ({
                                        ...prev,
                                        seriesARound: {
                                            ...prev.seriesARound,
                                            optionPoolCarveoutMode: 'POST_MONEY_SHARED',
                                        },
                                    }))
                                }
                                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${workspace.seriesARound.optionPoolCarveoutMode ===
                                        'POST_MONEY_SHARED'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                    }`}
                            >
                                Post-Money Shared
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            Pre-money shuffle dilutes existing founders &amp; SAFEs; post-money shares pool dilution with Series A.
                        </p>
                    </div>

                    {/* 2-Column Pair: Series A Pre-Money Valuation & New Investment */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                                Series A Pre-Money
                            </label>
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 px-3 py-2">
                                <span className="text-xs font-semibold text-slate-400 mr-1">
                                    {sym}
                                </span>
                                <input
                                    type="number"
                                    value={workspace.seriesARound.preMoneyValuationDollars}
                                    onChange={(e) =>
                                        setWorkspace((prev) => ({
                                            ...prev,
                                            seriesARound: {
                                                ...prev.seriesARound,
                                                preMoneyValuationDollars: Math.max(
                                                    1000000,
                                                    Number(e.target.value) || 10000000
                                                ),
                                            },
                                        }))
                                    }
                                    className="w-full bg-transparent text-xs sm:text-sm font-semibold font-mono text-slate-900 dark:text-white focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                                Series A New Money (M{workspace.seriesARound.closeMonth})
                            </label>
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 px-3 py-2">
                                <span className="text-xs font-semibold text-slate-400 mr-1">
                                    {sym}
                                </span>
                                <input
                                    type="number"
                                    value={workspace.seriesARound.newMoneyInvestmentDollars}
                                    onChange={(e) =>
                                        setWorkspace((prev) => ({
                                            ...prev,
                                            seriesARound: {
                                                ...prev.seriesARound,
                                                newMoneyInvestmentDollars: Math.max(
                                                    0,
                                                    Number(e.target.value) || 0
                                                ),
                                            },
                                        }))
                                    }
                                    className="w-full bg-transparent text-xs sm:text-sm font-semibold font-mono text-slate-900 dark:text-white focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* COLLAPSIBLE DRAWER 1: Advanced AI Token COGS & Gross Margin Options */}
                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setOpenAiCogsDrawer((v) => !v)}
                            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition"
                        >
                            <span className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 shrink-0" />
                                <span>
                                    Advanced AI LLM Token COGS &amp; Gross Margin Options
                                </span>
                            </span>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform ${openAiCogsDrawer ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                        {openAiCogsDrawer && (
                            <div className="p-4 pt-2 border-t border-slate-200/70 dark:border-slate-800 space-y-3 text-xs">
                                <label className="inline-flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={workspace.aiTokenCogs.enabled}
                                        onChange={(e) =>
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                aiTokenCogs: {
                                                    ...prev.aiTokenCogs,
                                                    enabled: e.target.checked,
                                                },
                                            }))
                                        }
                                        className="rounded border-slate-300"
                                    />
                                    <span>Enable Variable AI LLM Token Inference COGS</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            Base SaaS Margin (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={workspace.baseSaasGrossMarginPct}
                                            onChange={(e) =>
                                                setWorkspace((prev) => ({
                                                    ...prev,
                                                    baseSaasGrossMarginPct: Math.min(
                                                        99,
                                                        Math.max(10, Number(e.target.value) || 80)
                                                    ),
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            Upfront Annual Bill (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={workspace.annualUpfrontBillingSharePct}
                                            onChange={(e) =>
                                                setWorkspace((prev) => ({
                                                    ...prev,
                                                    annualUpfrontBillingSharePct: Math.min(
                                                        100,
                                                        Math.max(0, Number(e.target.value) || 0)
                                                    ),
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            Cost / 1M Tokens ({sym})
                                        </label>
                                        <input
                                            type="number"
                                            step="0.2"
                                            value={
                                                workspace.aiTokenCogs
                                                    .blendedCostPerMillionTokensDollars
                                            }
                                            onChange={(e) =>
                                                setWorkspace((prev) => ({
                                                    ...prev,
                                                    aiTokenCogs: {
                                                        ...prev.aiTokenCogs,
                                                        blendedCostPerMillionTokensDollars:
                                                            Math.max(0, Number(e.target.value) || 0),
                                                    },
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            Prompt Cache Hit (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={workspace.aiTokenCogs.promptCacheHitRatePct}
                                            onChange={(e) =>
                                                setWorkspace((prev) => ({
                                                    ...prev,
                                                    aiTokenCogs: {
                                                        ...prev.aiTokenCogs,
                                                        promptCacheHitRatePct: Math.min(
                                                            95,
                                                            Math.max(0, Number(e.target.value) || 0)
                                                        ),
                                                    },
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            Queries / Cust / Mo
                                        </label>
                                        <input
                                            type="number"
                                            value={workspace.aiTokenCogs.monthlyQueriesPerCustomer}
                                            onChange={(e) =>
                                                setWorkspace((prev) => ({
                                                    ...prev,
                                                    aiTokenCogs: {
                                                        ...prev.aiTokenCogs,
                                                        monthlyQueriesPerCustomer: Math.max(
                                                            0,
                                                            Number(e.target.value) || 0
                                                        ),
                                                    },
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            Fixed GPU Infra ({sym}/mo)
                                        </label>
                                        <input
                                            type="number"
                                            value={
                                                workspace.aiTokenCogs.fixedGpuClusterMonthlyDollars
                                            }
                                            onChange={(e) =>
                                                setWorkspace((prev) => ({
                                                    ...prev,
                                                    aiTokenCogs: {
                                                        ...prev.aiTokenCogs,
                                                        fixedGpuClusterMonthlyDollars: Math.max(
                                                            0,
                                                            Number(e.target.value) || 0
                                                        ),
                                                    },
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* COLLAPSIBLE DRAWER 2: Departmental OpEx Split, Hiring Plan & Venture Debt */}
                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setOpenHiringDebtDrawer((v) => !v)}
                            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition"
                        >
                            <span className="flex items-center gap-2">
                                <Sliders className="w-4 h-4 shrink-0" />
                                <span>
                                    Departmental OpEx, Hiring Plan ({workspace.hiringPlan.length}) &amp; Venture Debt
                                </span>
                            </span>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform ${openHiringDebtDrawer ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                        {openHiringDebtDrawer && (
                            <div className="p-4 pt-2 border-t border-slate-200/70 dark:border-slate-800 space-y-3 text-xs">
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            R&amp;D OpEx ({sym})
                                        </label>
                                        <input
                                            type="number"
                                            value={workspace.baselineRdOpexDollars}
                                            onChange={(e) =>
                                                setWorkspace((prev) => ({
                                                    ...prev,
                                                    baselineRdOpexDollars: Math.max(
                                                        0,
                                                        Number(e.target.value) || 0
                                                    ),
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            S&amp;M OpEx ({sym})
                                        </label>
                                        <input
                                            type="number"
                                            value={workspace.baselineSmOpexDollars}
                                            onChange={(e) =>
                                                setWorkspace((prev) => ({
                                                    ...prev,
                                                    baselineSmOpexDollars: Math.max(
                                                        0,
                                                        Number(e.target.value) || 0
                                                    ),
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            G&amp;A OpEx ({sym})
                                        </label>
                                        <input
                                            type="number"
                                            value={workspace.baselineGaOpexDollars}
                                            onChange={(e) =>
                                                setWorkspace((prev) => ({
                                                    ...prev,
                                                    baselineGaOpexDollars: Math.max(
                                                        0,
                                                        Number(e.target.value) || 0
                                                    ),
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 font-mono"
                                        />
                                    </div>
                                </div>

                                {/* Add Planned Hire */}
                                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 space-y-2">
                                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                                        Add Planned Headcount Role
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Role Title (e.g. Senior AI Eng)"
                                            value={newHireTitle}
                                            onChange={(e) => setNewHireTitle(e.target.value)}
                                            className="col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Annual Base Salary"
                                            value={newHireSalary}
                                            onChange={(e) =>
                                                setNewHireSalary(Number(e.target.value) || 0)
                                            }
                                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="number"
                                                min={1}
                                                max={60}
                                                value={newHireStartMonth}
                                                onChange={(e) =>
                                                    setNewHireStartMonth(
                                                        Number(e.target.value) || 1
                                                    )
                                                }
                                                className="w-16 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 font-mono"
                                                title="Start Month (1..60)"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddHiringRole}
                                                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>Add</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Venture Debt Toggle */}
                                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800">
                                    <label className="inline-flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={workspace.ventureDebt.enabled}
                                            onChange={(e) =>
                                                setWorkspace((prev) => ({
                                                    ...prev,
                                                    ventureDebt: {
                                                        ...prev.ventureDebt,
                                                        enabled: e.target.checked,
                                                    },
                                                }))
                                            }
                                            className="rounded border-slate-300"
                                        />
                                        <span>
                                            Include Venture Debt ({sym}
                                            {(workspace.ventureDebt.principalDollars / 1e6).toFixed(
                                                2
                                            )}
                                            M @ {workspace.ventureDebt.annualInterestRatePct}%)
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* COLLAPSIBLE DRAWER 3: Stacked SAFEs, Option Pool % & Exit Valuation */}
                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setOpenCapTableDrawer((v) => !v)}
                            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition"
                        >
                            <span className="flex items-center gap-2">
                                <Layers className="w-4 h-4 shrink-0" />
                                <span>
                                    SAFE Tranches ({workspace.convertibles.length}), Option Pool &amp; Exit Valuation
                                </span>
                            </span>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform ${openCapTableDrawer ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                        {openCapTableDrawer && (
                            <div className="p-4 pt-2 border-t border-slate-200/70 dark:border-slate-800 space-y-3 text-xs">
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            Post-A Option Pool (%)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={
                                                workspace.seriesARound.targetPostRoundOptionPoolPct
                                            }
                                            onChange={(e) =>
                                                setWorkspace((prev) => ({
                                                    ...prev,
                                                    seriesARound: {
                                                        ...prev.seriesARound,
                                                        targetPostRoundOptionPoolPct: Math.min(
                                                            35,
                                                            Math.max(0, Number(e.target.value) || 10)
                                                        ),
                                                    },
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            Target M&amp;A Exit ({sym})
                                        </label>
                                        <input
                                            type="number"
                                            step="5000000"
                                            value={workspace.exitConfig.targetExitValuationDollars}
                                            onChange={(e) =>
                                                setWorkspace((prev) => ({
                                                    ...prev,
                                                    exitConfig: {
                                                        ...prev.exitConfig,
                                                        targetExitValuationDollars: Math.max(
                                                            1000000,
                                                            Number(e.target.value) || 50000000
                                                        ),
                                                    },
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('captable_dilution');
                                        bottomTabsRef.current?.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'start',
                                        });
                                    }}
                                    className="w-full py-2 rounded-xl font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
                                >
                                    Open Full SAFE, Co-Founder Vesting &amp; Series B Editor ↓
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ========================================================================
                    RIGHT COLUMN (7 COLS): ROYAL BLUE HERO CARD, 2x2 METRIC PILLS, DARK CALLOUT BAR & ACTIONS
                   ======================================================================== */}
                <div className="lg:col-span-7 space-y-5 min-w-0">
                    <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-5">
                        {/* Section Header */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    Runway Breakdown, Capital Efficiency &amp; Equity Metrics
                                </h2>
                            </div>
                            <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${compiled.defaultAliveStatus === 'DEFAULT_ALIVE'
                                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                    }`}
                            >
                                {compiled.defaultAliveStatus === 'DEFAULT_ALIVE'
                                    ? `DEFAULT ALIVE (Breakeven M${compiled.breakevenMonthIndex ?? 1})`
                                    : `DEFAULT DEAD (Raise by M${compiled.mandatoryRaiseByMonth})`}
                            </span>
                        </div>

                        {/* ROYAL BLUE / INDIGO GRADIENT HERO DISPLAY CARD (Matches EMI Calculator Screenshot #4) */}
                        <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 p-6 sm:p-7 text-white shadow-md space-y-4">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-100">
                                    Estimated Cash Runway &amp; Trajectory
                                </span>
                                <span className="px-2.5 py-0.5 rounded-lg bg-white/15 backdrop-blur-xs text-xs font-bold text-white">
                                    {currencyCode} • {compiled.monteCarlo.probabilityDefaultAlivePct}% MC Alive
                                </span>
                            </div>

                            <div className="flex flex-wrap items-baseline justify-between gap-4">
                                <div className="text-3xl sm:text-5xl font-extrabold tracking-tight font-mono">
                                    {isZeroInputState
                                        ? '0.0 Months'
                                        : compiled.runwayExhausted
                                            ? `${compiled.exactRunwayMonths} Months`
                                            : '60+ Months (Alive)'}
                                </div>
                                <div className="text-right">
                                    <div className="text-[11px] uppercase tracking-wider text-blue-200">
                                        Monthly Net Burn (M1)
                                    </div>
                                    <div className="text-lg sm:text-xl font-bold font-mono">
                                        {sym}
                                        {compiled.currentNetBurnMonthlyDollars.toLocaleString()}/mo
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs sm:text-sm text-blue-100">
                                {isZeroInputState
                                    ? 'Enter starting cash balance, MRR, and monthly operating expenses on the left to compute runway and equity dilution.'
                                    : compiled.defaultAliveStatus === 'DEFAULT_ALIVE'
                                        ? `Reaches cash-flow profitability in Month ${compiled.breakevenMonthIndex ?? 1} with a minimum 60-month cash trough of ${sym}${Math.round(compiled.minimumCashBalanceDollars).toLocaleString()}.`
                                        : `Cash depletes in Month ${compiled.exactRunwayMonths}. Start fundraising by Month ${compiled.mandatoryRaiseByMonth} (6-month VC buffer) or use the 1-Click Breakeven Solver below.`}
                            </p>

                            {/* Horizontal Split Progress Bar (Revenue Coverage vs Net Burn Deficit) */}
                            <div className="space-y-1.5 pt-1">
                                <div className="flex items-center justify-between text-xs font-semibold text-blue-100">
                                    <span>Revenue Coverage: {revCoveragePct}%</span>
                                    <span>Net Burn Deficit: {burnDeficitPct}%</span>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-blue-950/50 overflow-hidden flex">
                                    <div
                                        style={{ width: `${revCoveragePct}%` }}
                                        className="bg-emerald-400 h-full transition-all duration-300"
                                    />
                                    <div
                                        style={{ width: `${burnDeficitPct}%` }}
                                        className="bg-rose-400 h-full transition-all duration-300"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2x2 CLEAN METRIC PILL GRID (Matches EMI Calculator Screenshot #4) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-4 py-3 flex items-center justify-between gap-2">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    David Sacks Burn Multiple:
                                </span>
                                <span
                                    className={`text-sm font-bold font-mono ${compiled.davidSacksBurnMultiple <= 1.5
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : compiled.davidSacksBurnMultiple <= 2.5
                                                ? 'text-amber-600 dark:text-amber-400'
                                                : 'text-rose-600 dark:text-rose-400'
                                        }`}
                                >
                                    {compiled.davidSacksBurnMultiple}x (
                                    {compiled.burnMultipleTier.split('_')[0]})
                                </span>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-4 py-3 flex items-center justify-between gap-2">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Annualized NRR &amp; Magic #:
                                </span>
                                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                                    {compiled.annualizedNrrPct}% • {compiled.saasMagicNumber}x
                                </span>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-4 py-3 flex items-center justify-between gap-2">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Blended Gross Margin (M1→M12):
                                </span>
                                <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">
                                    {compiled.blendedGrossMarginMonth1Pct}% →{' '}
                                    {compiled.blendedGrossMarginMonth12Pct}%
                                </span>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-4 py-3 flex items-center justify-between gap-2">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Founders Post-Series A Equity:
                                </span>
                                <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                    {compiled.capTable.foundersCombinedPostSeriesAPct}% ({sym}
                                    {compiled.capTable.seriesARoundPps.toFixed(2)}/sh)
                                </span>
                            </div>
                        </div>

                        {/* DARK NAVY SUMMARY CALLOUT BANNER (Matches "Total Amount Paid" Banner in EMI Calculator Screenshot #4/#5) */}
                        <div className="rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-white">
                            <div>
                                <div className="text-xs sm:text-sm font-bold text-white">
                                    Projected Founder M&amp;A Exit Payout (@ {sym}
                                    {(
                                        workspace.exitConfig.targetExitValuationDollars / 1e6
                                    ).toFixed(0)}
                                    M Exit)
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                    After {workspace.exitConfig.maAdvisoryAndLegalFeePct}% M&amp;A fees,{' '}
                                    {workspace.convertibles.length} SAFE conversions &amp;{' '}
                                    {workspace.seriesARound.liquidationMultiple}x{' '}
                                    {workspace.seriesARound.participationType.replace(/_/g, ' ')} prefs
                                </div>
                            </div>
                            <div className="text-xl sm:text-2xl font-extrabold font-mono text-sky-400">
                                {sym}
                                {compiled.exitWaterfall.targetExitResult.foundersPayoutDollars.toLocaleString()}
                            </div>
                        </div>

                        {/* 1-CLICK DEFAULT ALIVE BREAKEVEN SOLVER ALERT (When Default Dead) */}
                        {!compiled.breakevenSolver.isAlreadyDefaultAlive && !isZeroInputState && (
                            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/70 bg-rose-50/70 dark:bg-rose-950/30 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                                <div className="space-y-0.5">
                                    <div className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                        <span>
                                            1-Click Default Alive Solver: Cut OpEx by{' '}
                                            {compiled.breakevenSolver.requiredImmediateOpexCutPct}% or Grow MRR{' '}
                                            {compiled.breakevenSolver.requiredMonthlyNewMrrGrowthPct}%/mo
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-rose-700 dark:text-rose-300">
                                        Automatically calibrates your burn or growth to reach cash breakeven before zero cash.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleApplyBreakevenOpexFix}
                                        className="px-3 py-1.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white transition"
                                    >
                                        Trim OpEx (-{compiled.breakevenSolver.requiredImmediateOpexCutPct}%)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleApplyBreakevenGrowthFix}
                                        className="px-3 py-1.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition"
                                    >
                                        Set {compiled.breakevenSolver.requiredMonthlyNewMrrGrowthPct}% Growth
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* COMPACT 60-MONTH CASH RUNWAY & BREAKEVEN CROSSOVER CHART */}
                        <div className="space-y-2 pt-1">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                    60-Month Cash Trajectory &amp; Revenue vs. Gross Burn
                                </span>
                                <div className="flex items-center gap-3 text-[11px]">
                                    <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                                        <span className="w-2 h-2 rounded-full bg-indigo-500" /> Ending Cash
                                    </span>
                                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Revenue
                                    </span>
                                    <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                                        <span className="w-2 h-2 rounded-full bg-rose-500" /> Gross Burn
                                    </span>
                                </div>
                            </div>
                            <div className="w-full overflow-x-auto overscroll-x-contain">
                                <svg
                                    viewBox={`0 0 ${runwaySvgData.width} ${runwaySvgData.height}`}
                                    className="w-full h-auto min-w-[520px] rounded-2xl bg-slate-950 p-2 border border-slate-800"
                                    role="img"
                                    aria-label="60-Month SaaS Cash Runway and Revenue vs Gross Burn Chart"
                                >
                                    <line
                                        x1={runwaySvgData.padLeft}
                                        y1={runwaySvgData.zeroY}
                                        x2={runwaySvgData.width - runwaySvgData.padRight}
                                        y2={runwaySvgData.zeroY}
                                        stroke="#475569"
                                        strokeDasharray="4 4"
                                        strokeWidth="1"
                                    />
                                    <polygon
                                        points={runwaySvgData.cashAreaPoints}
                                        fill="rgba(99, 102, 241, 0.18)"
                                    />
                                    <polyline
                                        fill="none"
                                        stroke="#6366f1"
                                        strokeWidth="2.5"
                                        points={runwaySvgData.cashPoints}
                                    />
                                    <polyline
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="2"
                                        points={runwaySvgData.revPoints}
                                    />
                                    <polyline
                                        fill="none"
                                        stroke="#f43f5e"
                                        strokeWidth="2"
                                        strokeDasharray="5 3"
                                        points={runwaySvgData.burnPoints}
                                    />
                                    {compiled.breakevenMonthIndex !== null && (
                                        <g>
                                            <line
                                                x1={runwaySvgData.xForMonth(
                                                    compiled.breakevenMonthIndex
                                                )}
                                                y1={runwaySvgData.padTop}
                                                x2={runwaySvgData.xForMonth(
                                                    compiled.breakevenMonthIndex
                                                )}
                                                y2={runwaySvgData.height - runwaySvgData.padBottom}
                                                stroke="#10b981"
                                                strokeDasharray="3 3"
                                                strokeWidth="1.5"
                                            />
                                            <text
                                                x={Math.min(
                                                    runwaySvgData.width - 115,
                                                    runwaySvgData.xForMonth(
                                                        compiled.breakevenMonthIndex
                                                    ) + 5
                                                )}
                                                y={runwaySvgData.padTop + 12}
                                                fill="#34d399"
                                                fontSize="10"
                                                fontWeight="bold"
                                            >
                                                Breakeven M{compiled.breakevenMonthIndex}
                                            </text>
                                        </g>
                                    )}
                                    <text
                                        x="6"
                                        y={runwaySvgData.padTop + 10}
                                        fill="#94a3b8"
                                        fontSize="10"
                                    >
                                        {sym}
                                        {(runwaySvgData.maxCash / 1e6).toFixed(1)}M
                                    </text>
                                    <text
                                        x="6"
                                        y={runwaySvgData.zeroY - 4}
                                        fill="#94a3b8"
                                        fontSize="10"
                                    >
                                        {sym}0
                                    </text>
                                    {[1, 12, 24, 36, 48, 60].map((m) => (
                                        <text
                                            key={m}
                                            x={runwaySvgData.xForMonth(m) - 8}
                                            y={runwaySvgData.height - 7}
                                            fill="#94a3b8"
                                            fontSize="10"
                                        >
                                            M{m}
                                        </text>
                                    ))}
                                </svg>
                            </div>
                        </div>

                        {/* ACTION PILL BUTTONS ROW (Matches "Share Scenario" + "Export Amortization CSV" in EMI Calculator Screenshot #5) */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={handleCopyShareScenario}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-400 transition shadow-2xs"
                            >
                                {copiedShareLink ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                                )}
                                <span>{copiedShareLink ? 'Scenario Link Copied!' : 'Share Scenario'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    triggerDownload(
                                        compiled.cashFlowCsv,
                                        '60m_saas_cash_flow_schedule.csv',
                                        'text/csv;charset=utf-8'
                                    )
                                }
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Export 60m Runway CSV</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    const xlsxBytes = exportSaasModelXlsx(workspace, compiled);
                                    triggerDownload(
                                        xlsxBytes,
                                        'saas_runway_captable_waterfall_model.xlsx',
                                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                    );
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                <span>Export 3-Tab Excel (.xlsx)</span>
                            </button>
                        </div>
                    </div>

                    {/* METHODOLOGY & CALCULATION ASSUMPTIONS ACCORDION (Matches Mortgage Calculator Screenshot #2) */}
                    <details className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3.5 shadow-2xs text-xs text-slate-600 dark:text-slate-300">
                        <summary className="cursor-pointer font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2 select-none list-none">
                            <span className="flex items-center gap-2">
                                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span>Methodology &amp; Calculation Assumptions (YC SAFE v1.1, Default Alive &amp; Local Privacy)</span>
                            </span>
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        </summary>
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 leading-relaxed">
                            <p>
                                <strong>Privacy &amp; Local Execution:</strong> Your financial inputs, historical
                                CSV/JSON actuals, hiring plans, and cap table configurations are processed locally in
                                your browser and are not uploaded to KivaroTools servers. The website may still load
                                general analytics or other third-party website resources.
                            </p>
                            <p>
                                <strong>Cohort Runway &amp; Option Pool Shuffle Math:</strong> Runway is interpolated to
                                fractional months when Ending Cash crosses zero. YC Post-Money SAFEs lock ownership
                                prior to new priced round dilution, and Pre-Money Option Pool Shuffles allocate top-up
                                ESOP shares out of pre-money capitalization.
                            </p>
                        </div>
                    </details>
                </div>
            </div>

            {/* ============================================================================
                BOTTOM FULL-WIDTH SCHEDULE & DEEP-DIVE CARD (MATCHES EMI CALCULATOR SCREENSHOT #5)
               ============================================================================ */}
            <div
                ref={bottomTabsRef}
                className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-6 scroll-mt-20"
            >
                {/* Pill Tab Navigation Bar (Matches "Amortization Schedule | Yearly Summary | Methodology" in Screenshot #5) */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab('cashflow_schedule')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition ${activeTab === 'cashflow_schedule'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>60-Month Runway Schedule</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('captable_dilution')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition ${activeTab === 'captable_dilution'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <Layers className="w-4 h-4 shrink-0" />
                        <span>Cap Table &amp; SAFE Dilution ({compiled.capTable.stakeholders.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('exit_waterfall')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition ${activeTab === 'exit_waterfall'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <DollarSign className="w-4 h-4 shrink-0" />
                        <span>M&amp;A Exit Waterfall</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('montecarlo_heatmaps')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition ${activeTab === 'montecarlo_heatmaps'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <Activity className="w-4 h-4 shrink-0" />
                        <span>Monte Carlo &amp; 5×5 Heatmaps</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('venture_linter')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition ${activeTab === 'venture_linter'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>12-Point Venture Linter ({compiled.lintIssues.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('export_studio')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition ${activeTab === 'export_studio'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <FileSpreadsheet className="w-4 h-4 shrink-0" />
                        <span>10-Format Export Studio</span>
                    </button>
                </div>

                {/* ========================================================================
                    BOTTOM TAB 1: 60-MONTH CASH FLOW SCHEDULE & HISTORICAL CSV CALIBRATOR
                   ======================================================================== */}
                {activeTab === 'cashflow_schedule' && (
                    <div className="space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    Month-by-Month Cohort MRR, AI Token COGS &amp; Cash Runway Schedule (M1–M60)
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Tracks monthly New MRR, Expansion, Churn, AI inference COGS, departmental payroll,
                                    and scheduled SAFE/Series A/B capital injections.
                                </p>
                            </div>
                        </div>

                        <div className="w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200 dark:border-slate-800 max-h-[460px]">
                            <table className="min-w-[840px] w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-900 dark:text-white sticky top-0">
                                    <tr>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800">Month</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Ending MRR</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">ARR</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">AI Token COGS</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Blended GM%</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Gross Burn</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Equity / Grant In</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Net Burn</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Ending Cash</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {compiled.monthlyRows.map((r) => (
                                        <tr key={r.month} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                            <td className="p-2.5 font-mono font-bold">{r.calendarLabel}</td>
                                            <td className="p-2.5 text-right font-mono">
                                                {sym}
                                                {Math.round(r.endingMrr).toLocaleString()}
                                            </td>
                                            <td className="p-2.5 text-right font-mono">
                                                {sym}
                                                {Math.round(r.arr).toLocaleString()}
                                            </td>
                                            <td className="p-2.5 text-right font-mono">
                                                {sym}
                                                {Math.round(r.aiTokenInferenceCogs).toLocaleString()}
                                            </td>
                                            <td className="p-2.5 text-right font-mono">{r.blendedGrossMarginPct}%</td>
                                            <td className="p-2.5 text-right font-mono">
                                                {sym}
                                                {Math.round(r.grossBurn).toLocaleString()}
                                            </td>
                                            <td className="p-2.5 text-right font-mono text-blue-600 dark:text-blue-400 font-semibold">
                                                {r.nonDilutiveInflow + r.equityFinancingNetInflow > 0
                                                    ? `+${sym}${Math.round(r.nonDilutiveInflow + r.equityFinancingNetInflow).toLocaleString()}`
                                                    : '—'}
                                            </td>
                                            <td className="p-2.5 text-right font-mono text-rose-600 dark:text-rose-400">
                                                {sym}
                                                {Math.round(r.netBurn).toLocaleString()}
                                            </td>
                                            <td
                                                className={`p-2.5 text-right font-mono font-bold ${r.endingCash >= 0
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-rose-600 dark:text-rose-400'
                                                    }`}
                                            >
                                                {sym}
                                                {Math.round(r.endingCash).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Historical CSV/JSON Auto-Calibrator */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span>1-Click Historical CSV / JSON Actuals Auto-Calibrator</span>
                                </h4>
                                <button
                                    type="button"
                                    onClick={handleApplyHistoricalPaste}
                                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white"
                                >
                                    Calibrate from Paste / Demo CSV
                                </button>
                            </div>
                            <textarea
                                rows={3}
                                value={historicalCsvText}
                                onChange={(e) => setHistoricalCsvText(e.target.value)}
                                placeholder={SAMPLE_HISTORICAL_CSV}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-mono"
                            />
                        </div>
                    </div>
                )}

                {/* ========================================================================
                    BOTTOM TAB 2: SAFE / CONVERTIBLE NOTE, OPTION POOL SHUFFLE & CAP TABLE
                   ======================================================================== */}
                {activeTab === 'captable_dilution' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Left: Stacked SAFEs & Convertible Notes Manager */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 p-4 space-y-3">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span>
                                        Stacked SAFEs &amp; Convertible Notes ({workspace.convertibles.length} Tranches •{' '}
                                        {compiled.capTable.cumulativePostMoneySafeDilutionPct}% Pre-Round SAFE Lock)
                                    </span>
                                </h3>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Investor / SAFE Name"
                                        value={newSafeName}
                                        onChange={(e) => setNewSafeName(e.target.value)}
                                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs"
                                    />
                                    <select
                                        value={newSafeType}
                                        onChange={(e) =>
                                            setNewSafeType(e.target.value as ConvertibleInstrumentType)
                                        }
                                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs"
                                    >
                                        <option value="YC_POST_MONEY_SAFE">YC Post-Money SAFE</option>
                                        <option value="PRE_MONEY_SAFE">Pre-Money SAFE</option>
                                        <option value="CONVERTIBLE_NOTE">Convertible Note (8%)</option>
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Principal ($)"
                                        value={newSafePrincipal}
                                        onChange={(e) => setNewSafePrincipal(Number(e.target.value) || 0)}
                                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-mono"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Valuation Cap ($)"
                                        value={newSafeCap}
                                        onChange={(e) => setNewSafeCap(Number(e.target.value) || 0)}
                                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-mono"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Discount %"
                                        value={newSafeDiscount}
                                        onChange={(e) => setNewSafeDiscount(Number(e.target.value) || 0)}
                                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddConvertible}
                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add SAFE</span>
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-56 overflow-y-auto">
                                    {workspace.convertibles.map((conv) => {
                                        const convDetail = compiled.capTable.convertibleDetails.find(
                                            (d) => d.id === conv.id
                                        );
                                        return (
                                            <div
                                                key={conv.id}
                                                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2 text-xs"
                                            >
                                                <div className="min-w-0">
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                        <span>{conv.investorName}</span>
                                                        <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px]">
                                                            {conv.type}
                                                        </span>
                                                        {convDetail?.mfnUpgraded && (
                                                            <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px]">
                                                                MFN → {sym}
                                                                {(
                                                                    convDetail.effectiveCapDollarsAfterMfn /
                                                                    1e6
                                                                ).toFixed(1)}
                                                                M Cap
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                                        {sym}
                                                        {conv.principalDollars.toLocaleString()} • Cap:{' '}
                                                        {sym}
                                                        {(conv.valuationCapDollars / 1e6).toFixed(1)}M •{' '}
                                                        Converts to{' '}
                                                        <strong>
                                                            {convDetail?.convertedShares.toLocaleString() ||
                                                                0}{' '}
                                                            sh ({convDetail?.postSeriesAOwnershipPct || 0}% Post-A)
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <label className="inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={conv.mfnEnabled}
                                                            onChange={(e) =>
                                                                setWorkspace((prev) => ({
                                                                    ...prev,
                                                                    convertibles: prev.convertibles.map(
                                                                        (c) =>
                                                                            c.id === conv.id
                                                                                ? {
                                                                                    ...c,
                                                                                    mfnEnabled:
                                                                                        e.target.checked,
                                                                                }
                                                                                : c
                                                                    ),
                                                                }))
                                                            }
                                                        />
                                                        <span>MFN</span>
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setWorkspace((prev) => ({
                                                                ...prev,
                                                                convertibles: prev.convertibles.filter(
                                                                    (c) => c.id !== conv.id
                                                                ),
                                                            }))
                                                        }
                                                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right: Co-Founder Equity Split, 4-Year Vesting & Secondary Cash-Out Editor */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 p-4 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span>
                                            Co-Founder Vesting (4Yr / 1Yr Cliff) &amp; Series A Secondary
                                        </span>
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const nextIdx = workspace.founders.length + 1;
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                founders: [
                                                    ...prev.founders,
                                                    {
                                                        id: `f_${Date.now()}`,
                                                        name: `Co-Founder #${nextIdx}`,
                                                        role: 'VP Engineering',
                                                        initialShares: 1_000_000,
                                                        vestingMonthsTotal: 48,
                                                        cliffMonths: 12,
                                                        monthsElapsed: 18,
                                                        secondarySaleDollarsAtSeriesA: 0,
                                                    },
                                                ],
                                            }));
                                        }}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white hover:bg-blue-500"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Co-Founder</span>
                                    </button>
                                </div>

                                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                                    {workspace.founders.map((f, fIdx) => (
                                        <div
                                            key={f.id}
                                            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <input
                                                    type="text"
                                                    value={f.name}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setWorkspace((prev) => ({
                                                            ...prev,
                                                            founders: prev.founders.map((item, i) =>
                                                                i === fIdx
                                                                    ? { ...item, name: val }
                                                                    : item
                                                            ),
                                                        }));
                                                    }}
                                                    className="font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs min-w-0 flex-1"
                                                />
                                                <input
                                                    type="text"
                                                    value={f.role}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setWorkspace((prev) => ({
                                                            ...prev,
                                                            founders: prev.founders.map((item, i) =>
                                                                i === fIdx
                                                                    ? { ...item, role: val }
                                                                    : item
                                                            ),
                                                        }));
                                                    }}
                                                    className="text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs min-w-0 flex-1"
                                                />
                                                {workspace.founders.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setWorkspace((prev) => ({
                                                                ...prev,
                                                                founders: prev.founders.filter(
                                                                    (_, i) => i !== fIdx
                                                                ),
                                                            }))
                                                        }
                                                        className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div>
                                                    <label className="block text-[10px] text-slate-500">
                                                        Initial Shares
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={f.initialShares}
                                                        onChange={(e) => {
                                                            const val = Math.max(
                                                                0,
                                                                Number(e.target.value) || 0
                                                            );
                                                            setWorkspace((prev) => ({
                                                                ...prev,
                                                                founders: prev.founders.map(
                                                                    (item, i) =>
                                                                        i === fIdx
                                                                            ? {
                                                                                ...item,
                                                                                initialShares: val,
                                                                            }
                                                                            : item
                                                                ),
                                                            }));
                                                        }}
                                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 font-mono"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-slate-500">
                                                        Months Vested
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={60}
                                                        value={f.monthsElapsed}
                                                        onChange={(e) => {
                                                            const val = Math.max(
                                                                0,
                                                                Number(e.target.value) || 0
                                                            );
                                                            setWorkspace((prev) => ({
                                                                ...prev,
                                                                founders: prev.founders.map(
                                                                    (item, i) =>
                                                                        i === fIdx
                                                                            ? {
                                                                                ...item,
                                                                                monthsElapsed: val,
                                                                            }
                                                                            : item
                                                                ),
                                                            }));
                                                        }}
                                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 font-mono"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-slate-500">
                                                        Secondary Sale ({sym})
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={f.secondarySaleDollarsAtSeriesA}
                                                        onChange={(e) => {
                                                            const val = Math.max(
                                                                0,
                                                                Number(e.target.value) || 0
                                                            );
                                                            setWorkspace((prev) => ({
                                                                ...prev,
                                                                founders: prev.founders.map(
                                                                    (item, i) =>
                                                                        i === fIdx
                                                                            ? {
                                                                                ...item,
                                                                                secondarySaleDollarsAtSeriesA:
                                                                                    val,
                                                                            }
                                                                            : item
                                                                ),
                                                            }));
                                                        }}
                                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Pro-Forma Cap Table Ledger */}
                        <div className="w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200 dark:border-slate-800">
                            <table className="min-w-[820px] w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                                    <tr>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800">Stakeholder</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Initial %</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Post-SAFE %</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Post-Series A Shares</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Post-Series A %</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Post-Series B %</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Paper Value ({sym})</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800">Vesting &amp; Conversion Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {compiled.capTable.stakeholders.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                            <td className="p-3 font-bold text-slate-900 dark:text-white">
                                                {row.stakeholderName}
                                            </td>
                                            <td className="p-3 text-right font-mono">{row.initialOwnershipPct}%</td>
                                            <td className="p-3 text-right font-mono text-blue-600 dark:text-blue-400">
                                                {row.postSafeOwnershipPct}%
                                            </td>
                                            <td className="p-3 text-right font-mono">
                                                {row.postSeriesAShares.toLocaleString()}
                                            </td>
                                            <td className="p-3 text-right font-mono font-bold">
                                                {row.postSeriesAOwnershipPct}%
                                            </td>
                                            <td className="p-3 text-right font-mono">
                                                {row.postSeriesBOwnershipPct}%
                                            </td>
                                            <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                                {sym}
                                                {row.impliedPaperValuePostRoundDollars.toLocaleString()}
                                            </td>
                                            <td className="p-3 text-slate-500 dark:text-slate-400">{row.notes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ========================================================================
                    BOTTOM TAB 3: M&A EXIT WATERFALL & LIQUIDATION PREFERENCES
                   ======================================================================== */}
                {activeTab === 'exit_waterfall' && (
                    <div className="space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    M&amp;A Exit Waterfall &amp; Voluntary Conversion Breakpoint Table
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Compares 1x–3x Non-Participating, Full Participating (&ldquo;Double Dip&rdquo;), and
                                    Capped Participating preferred payouts across exit valuations.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <select
                                    value={`${workspace.seriesARound.liquidationMultiple}_${workspace.seriesARound.participationType}`}
                                    onChange={(e) => {
                                        const [multStr, part] = e.target.value.split('_');
                                        const mult = Number(multStr) || 1;
                                        const pType = part as LiquidationParticipationType;
                                        setWorkspace((prev) => ({
                                            ...prev,
                                            seriesARound: {
                                                ...prev.seriesARound,
                                                liquidationMultiple: mult,
                                                participationType: pType,
                                            },
                                        }));
                                    }}
                                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                                >
                                    <option value="1_NON_PARTICIPATING">1x Non-Participating (96.4% Market Std)</option>
                                    <option value="1_CAPPED_PARTICIPATING">1x Capped Participating (2x Cap)</option>
                                    <option value="1_FULL_PARTICIPATING">1x Full Participating (Double Dip)</option>
                                    <option value="2_NON_PARTICIPATING">2x Non-Participating</option>
                                    <option value="2_FULL_PARTICIPATING">2x Full Participating (Predatory)</option>
                                </select>
                            </div>
                        </div>

                        <div className="w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200 dark:border-slate-800">
                            <table className="min-w-[780px] w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                                    <tr>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800">Stakeholder Class</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Invested ({sym})</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Pref Claim ({sym})</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800">Optimal Decision</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Conversion Breakpoint</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Total Exit Payout ({sym})</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">% of Net Exit</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">MOIC</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {compiled.exitWaterfall.targetExitResult.classPayouts.map((c) => (
                                        <tr key={c.classId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                            <td className="p-3 font-bold text-slate-900 dark:text-white">{c.className}</td>
                                            <td className="p-3 text-right font-mono">
                                                {sym}
                                                {c.investedCapitalDollars.toLocaleString()}
                                            </td>
                                            <td className="p-3 text-right font-mono">
                                                {sym}
                                                {c.liquidationPreferenceDollars.toLocaleString()}
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.decision === 'CONVERTED_TO_COMMON'
                                                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                                            : c.decision === 'TOOK_LIQUIDATION_PREFERENCE'
                                                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                                        }`}
                                                >
                                                    {c.decision.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right font-mono">
                                                {c.voluntaryConversionBreakpointValuation > 0
                                                    ? `${sym}${(c.voluntaryConversionBreakpointValuation / 1e6).toFixed(1)}M`
                                                    : '—'}
                                            </td>
                                            <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                {sym}
                                                {c.totalPayoutDollars.toLocaleString()}
                                            </td>
                                            <td className="p-3 text-right font-mono">{c.shareOfNetExitPct}%</td>
                                            <td className="p-3 text-right font-mono font-bold">
                                                {c.moicMultiple > 0 ? `${c.moicMultiple}x` : 'Common'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ========================================================================
                    BOTTOM TAB 4: 1,000-RUN MONTE CARLO & 5x5 SENSITIVITY HEATMAPS
                   ======================================================================== */}
                {activeTab === 'montecarlo_heatmaps' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                                <div className="text-[11px] text-slate-500">P10 Bear Runway</div>
                                <div className="text-base font-bold text-rose-600 dark:text-rose-400 font-mono">
                                    {compiled.monteCarlo.p10RunwayMonths} Months
                                </div>
                            </div>
                            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                                <div className="text-[11px] text-slate-500">P25 Conservative</div>
                                <div className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono">
                                    {compiled.monteCarlo.p25RunwayMonths} Months
                                </div>
                            </div>
                            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                                <div className="text-[11px] text-slate-500">P50 Median Runway</div>
                                <div className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
                                    {compiled.monteCarlo.p50RunwayMonths} Months
                                </div>
                            </div>
                            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                                <div className="text-[11px] text-slate-500">P90 Bull Runway</div>
                                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                    {compiled.monteCarlo.p90RunwayMonths} Months
                                </div>
                            </div>
                            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                                <div className="text-[11px] text-slate-500">Default Alive Odds</div>
                                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                    {compiled.monteCarlo.probabilityDefaultAlivePct}%
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                    5×5 Heatmap #1: New MRR Growth % vs. Gross Churn % (Runway)
                                </h4>
                                <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl">
                                    <table className="w-full text-center text-xs border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                                                    Growth \ Churn
                                                </th>
                                                {compiled.sensitivity.churnStepsPct.map((c) => (
                                                    <th
                                                        key={c}
                                                        className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                                                    >
                                                        {c}%
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {compiled.sensitivity.runwayGrowthChurnGrid.map((row, rIdx) => (
                                                <tr key={rIdx}>
                                                    <td className="p-2 border border-slate-200 dark:border-slate-800 font-bold bg-slate-50 dark:bg-slate-800">
                                                        {compiled.sensitivity.growthStepsPct[rIdx]}%/mo
                                                    </td>
                                                    {row.map((cell, cIdx) => (
                                                        <td
                                                            key={cIdx}
                                                            className={`p-2 border border-slate-200 dark:border-slate-800 font-mono font-bold ${cell.status === 'GOOD'
                                                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                                                    : cell.status === 'WARN'
                                                                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                                                                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                                                                }`}
                                                        >
                                                            {cell.metricValue >= 60
                                                                ? '60m+'
                                                                : `${cell.metricValue}m`}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                    5×5 Heatmap #2: Series A Pre-Money vs. Option Pool % (Founder %)
                                </h4>
                                <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl">
                                    <table className="w-full text-center text-xs border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                                                    Pre-Money \ Pool
                                                </th>
                                                {compiled.sensitivity.poolStepsPct.map((p) => (
                                                    <th
                                                        key={p}
                                                        className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                                                    >
                                                        {p}% Pool
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {compiled.sensitivity.founderDilutionValPoolGrid.map(
                                                (row, rIdx) => (
                                                    <tr key={rIdx}>
                                                        <td className="p-2 border border-slate-200 dark:border-slate-800 font-bold bg-slate-50 dark:bg-slate-800">
                                                            {sym}
                                                            {(
                                                                compiled.sensitivity
                                                                    .valuationStepsDollars[rIdx] /
                                                                1e6
                                                            ).toFixed(1)}
                                                            M
                                                        </td>
                                                        {row.map((cell, cIdx) => (
                                                            <td
                                                                key={cIdx}
                                                                className={`p-2 border border-slate-200 dark:border-slate-800 font-mono font-bold ${cell.status === 'GOOD'
                                                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                                                        : cell.status === 'WARN'
                                                                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                                                                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                                                                    }`}
                                                            >
                                                                {cell.metricValue}%
                                                            </td>
                                                        ))}
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================
                    BOTTOM TAB 5: 12-POINT VENTURE READINESS & TERM SHEET RISK LINTER
                   ======================================================================== */}
                {activeTab === 'venture_linter' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    12-Point Venture Readiness, AI Margin &amp; Term Sheet Risk Linter (Score:{' '}
                                    {compiled.ventureReadinessScore}/100)
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Audits Fatal Pinch risk, David Sacks Burn Multiple, Stacked Post-Money SAFE overhang,
                                    Option Pool Shuffles, MFN triggers, and AI Token Margin Traps.
                                </p>
                            </div>
                            {compiled.lintIssues.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setWorkspace((prev) => autoFixSaasWorkspace(prev));
                                        setStatusBanner(
                                            'Applied 1-Click Deterministic Auto-Fix across Runway, AI Token Caching, Option Pool Shuffle, and Liquidation Preferences!'
                                        );
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs shrink-0"
                                >
                                    <Wrench className="w-3.5 h-3.5" />
                                    <span>1-Click Auto-Fix All {compiled.lintIssues.length} Issues</span>
                                </button>
                            )}
                        </div>

                        {compiled.lintIssues.length === 0 ? (
                            <div className="py-8 text-center space-y-2">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                                <div className="text-sm font-bold text-slate-900 dark:text-white">
                                    100/100 Venture Readiness — Zero Operational or Term Sheet Risk Flags!
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {compiled.lintIssues.map((iss) => (
                                    <div
                                        key={iss.id}
                                        className={`rounded-2xl border p-4 ${iss.severity === 'ERROR'
                                                ? 'border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/30'
                                                : iss.severity === 'WARNING'
                                                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30'
                                                    : 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30'
                                            }`}
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                [{iss.ruleCode}] {iss.title}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/80 dark:bg-slate-900/80">
                                                {iss.severity} • {iss.category}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {iss.detail}
                                        </p>
                                        <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 mt-1.5">
                                            Fix Recommendation: {iss.recommendation}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================================================
                    BOTTOM TAB 6: 10-FORMAT CFO, INVESTOR DATA ROOM & BOARD EXPORT STUDIO
                   ======================================================================== */}
                {activeTab === 'export_studio' && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    { id: 'board_markdown' as const, label: '1. Board Deck (.md)' },
                                    { id: 'cashflow_csv' as const, label: '2. 60m Cash Flow (.csv)' },
                                    { id: 'captable_csv' as const, label: '3. Cap Table (.csv)' },
                                    { id: 'waterfall_csv' as const, label: '4. Exit Waterfall (.csv)' },
                                    { id: 'interactive_html' as const, label: '5. HTML Deck (.html)' },
                                    { id: 'snapshot_json' as const, label: '6. SHA-256 Model (.json)' },
                                    { id: 'python_script' as const, label: '7. Python Audit (.py)' },
                                    { id: 'url_permalink' as const, label: '8. Shareable URL' },
                                    { id: 'executive_txt' as const, label: '9. Audit Summary (.txt)' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setExportFormat(item.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${exportFormat === item.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        void navigator.clipboard?.writeText(activeExportText);
                                        setCopiedExport(true);
                                        setTimeout(() => setCopiedExport(false), 2000);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-900 text-white"
                                >
                                    {copiedExport ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                    )}
                                    <span>{copiedExport ? 'Copied!' : 'Copy'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const xlsx = exportSaasModelXlsx(workspace, compiled);
                                        triggerDownload(
                                            xlsx,
                                            'saas_runway_captable_waterfall_model.xlsx',
                                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                        );
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5" />
                                    <span>10. Download 3-Tab .xlsx</span>
                                </button>
                            </div>
                        </div>

                        <pre className="rounded-2xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-w-full max-h-[420px] whitespace-pre-wrap break-words leading-relaxed">
                            {activeExportText}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}