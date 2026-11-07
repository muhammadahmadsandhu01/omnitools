"use client";

import React, { useState, useRef, useMemo } from 'react';
import {
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

type SaasWorkbenchTab =
    | 'runway_studio'
    | 'captable_dilution'
    | 'exit_waterfall'
    | 'montecarlo_heatmaps'
    | 'venture_linter'
    | 'export_studio';

const SAAS_PRESETS: {
    id: SaasPresetId;
    name: string;
    shortBadge: string;
    description: string;
}[] = [
        {
            id: 'yc_seed_ai_saas',
            name: 'YC Seed AI SaaS (Default Alive Trajectory)',
            shortBadge: 'Default Alive • AI COGS + Series A',
            description:
                '$1.85M cash, $45K MRR (+11.5%/mo), 48% cached LLM token COGS, 2 Post-Money SAFEs ($500K @ $10M + $1.5M @ $18M) converting into a $7.5M Series A.',
        },
        {
            id: 'hypergrowth_fatal_pinch',
            name: 'Hypergrowth B2B (Fatal Pinch Linter Demo)',
            shortBadge: 'Default Dead • Test 1-Click Fix',
            description:
                '$1.15M cash, $82K MRR, high burn multiple, 4.1% leaky churn, uncached AI GPU costs, and 2x Participating Preferred to test 1-Click Auto-Fix.',
        },
        {
            id: 'stacked_safe_pool_shuffle',
            name: 'Stacked SAFEs, MFN & Option Pool Shuffle',
            shortBadge: '4 Tranches • MFN Auto-Upgrade',
            description:
                'Models 4 stacked Pre-Money & Post-Money SAFEs + 8% Convertible Note where a lower-cap bridge triggers an MFN upgrade alongside a 16% Pool Shuffle.',
        },
        {
            id: 'bootstrapped_indie_profitable',
            name: 'Bootstrapped Micro-SaaS to Profitability',
            shortBadge: 'Zero Dilution • 100% Founder Equity',
            description:
                '$220K cash, $28K MRR, 35% annual upfront billing cash boost, 89% gross margin, reaching Default Alive breakeven with 93.5% founder ownership.',
        },
        {
            id: 'series_b_scaleup_waterfall',
            name: 'Series B Scale-Up & Founder Secondary Sale',
            shortBadge: '$1.25M Secondary • Multi-Round',
            description:
                '$420K MRR ($5.04M ARR), $10M Series A + $25M Series B, $1.25M Founder Secondary Cash-Out at Series A, and $250M M&A Exit Waterfall.',
        },
        {
            id: 'deeptech_grant_venture_debt',
            name: 'DeepTech R&D Grant + Venture Debt Bridge',
            shortBadge: '$1M Non-Dilutive Grant + Debt',
            description:
                'Combines two $500K non-dilutive SBIR R&D grant inflows with a $1.5M Venture Debt facility (15m interest-only + 24m principal amortization).',
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
            const seeded = presetParam && SAAS_PRESETS.some((p) => p.id === presetParam)
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
                startingCashDollars: !Number.isNaN(cash) && cash > 0 ? cash : seeded.startingCashDollars,
                startingMrrDollars: !Number.isNaN(mrr) && mrr > 0 ? mrr : seeded.startingMrrDollars,
                monthlyNewMrrGrowthPct: !Number.isNaN(growth) && growth > 0 ? growth : seeded.monthlyNewMrrGrowthPct,
                monthlyGrossChurnMrrPct: !Number.isNaN(churn) && churn >= 0 ? churn : seeded.monthlyGrossChurnMrrPct,
                seriesARound: {
                    ...seeded.seriesARound,
                    preMoneyValuationDollars: !Number.isNaN(preA) && preA > 0 ? preA : seeded.seriesARound.preMoneyValuationDollars,
                    newMoneyInvestmentDollars: !Number.isNaN(newA) && newA > 0 ? newA : seeded.seriesARound.newMoneyInvestmentDollars,
                    targetPostRoundOptionPoolPct: !Number.isNaN(poolA) && poolA > 0 ? poolA : seeded.seriesARound.targetPostRoundOptionPoolPct,
                },
                exitConfig: {
                    ...seeded.exitConfig,
                    targetExitValuationDollars: !Number.isNaN(exitVal) && exitVal > 0 ? exitVal : seeded.exitConfig.targetExitValuationDollars,
                },
            };
        }
        return base;
    });
    const [activeTab, setActiveTab] = useState<SaasWorkbenchTab>('runway_studio');
    const [statusBanner, setStatusBanner] = useState<string | null>(
        'Loaded Preset #1: "VectorPulse AI — YC Seed AI SaaS" (Default Alive, 2 Post-Money SAFEs + Series A, 1,000-Trial Monte Carlo). Click any preset card above to test Fatal Pinch Linter or Stacked SAFE MFN!'
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Tab 1: Historical CSV/JSON Import & New Hiring Role State
    const [historicalCsvText, setHistoricalCsvText] = useState<string>('');
    const [newHireTitle, setNewHireTitle] = useState<string>('');
    const [newHireDept, setNewHireDept] = useState<'R&D' | 'S&M' | 'G&A'>('R&D');
    const [newHireSalary, setNewHireSalary] = useState<number>(145000);
    const [newHireStartMonth, setNewHireStartMonth] = useState<number>(6);

    // Tab 2: New SAFE / Convertible Note Input State
    const [newSafeName, setNewSafeName] = useState<string>('');
    const [newSafeType, setNewSafeType] = useState<ConvertibleInstrumentType>('YC_POST_MONEY_SAFE');
    const [newSafePrincipal, setNewSafePrincipal] = useState<number>(500000);
    const [newSafeCap, setNewSafeCap] = useState<number>(15000000);
    const [newSafeDiscount, setNewSafeDiscount] = useState<number>(20);
    const [newSafeIssueMonth, setNewSafeIssueMonth] = useState<number>(0);

    // Tab 6: Export Studio Preview Format
    const [exportFormat, setExportFormat] = useState<
        | 'cashflow_csv'
        | 'captable_csv'
        | 'waterfall_csv'
        | 'board_markdown'
        | 'interactive_html'
        | 'snapshot_json'
        | 'python_script'
        | 'url_permalink'
        | 'executive_txt'
    >('board_markdown');
    const [copiedExport, setCopiedExport] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const workbenchRef = useRef<HTMLDivElement | null>(null);

    // Synchronously compile all 60-month cash flows, algebraic SAFE conversions, exit waterfalls, Monte Carlo & Linter
    const compiled = useMemo(() => compileAllSaasDeliverables(workspace), [workspace]);

    const handleSelectPreset = (presetId: SaasPresetId) => {
        setErrorMessage(null);
        const next = generateSampleSaasProject(presetId);
        setWorkspace(next);
        const info = SAAS_PRESETS.find((p) => p.id === presetId);
        setStatusBanner(
            `Loaded Preset: "${info?.name || presetId}" — All 60-month cash flows, SAFE conversions, Exit Waterfalls, and 1,000 Monte Carlo runs updated!`
        );
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
        const title = newHireTitle.trim() || `Software Engineer #${workspace.hiringPlan.length + 1}`;
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
            `Added "${newRole.title}" (${newRole.department}, $${newRole.annualBaseSalary.toLocaleString()}/yr starting Month ${newRole.startMonth}) to Hiring Plan!`
        );
    };

    const handleAddConvertible = () => {
        const investorName =
            newSafeName.trim() || `Seed Investor SAFE #${workspace.convertibles.length + 1}`;
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
            `Added "${newItem.investorName}" ($${newItem.principalDollars.toLocaleString()} @ $${(newItem.valuationCapDollars / 1e6).toFixed(1)}M Cap) to Cap Table!`
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
                fixedGpuClusterMonthlyDollars: Math.round(prev.aiTokenCogs.fixedGpuClusterMonthlyDollars * scale),
            },
            hiringPlan: prev.hiringPlan.map((h) => ({
                ...h,
                annualBaseSalary: Math.round(h.annualBaseSalary * scale),
            })),
        }));
        setStatusBanner(
            `Applied Breakeven OpEx Cut (-${compiled.breakevenSolver.requiredImmediateOpexCutPct}%) — Startup trajectory flipped to DEFAULT ALIVE!`
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
            `Applied Breakeven Growth Target (${targetGrowth}%/mo New MRR Growth) — Startup trajectory flipped to DEFAULT ALIVE!`
        );
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

    // SVG Chart Coordinates for Tab 1 (60-Month Cash Balance + MRR vs Gross Burn)
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

        const width = 760;
        const height = 250;
        const padLeft = 56;
        const padRight = 24;
        const padTop = 20;
        const padBottom = 32;
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
            .map((r) => `${xForMonth(r.month).toFixed(1)},${yForFlow(r.cashCollectedFromRevenue).toFixed(1)}`)
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

    return (
        <div className="space-y-6 w-full min-w-0 max-w-full overflow-x-hidden text-slate-900 dark:text-slate-100">
            {/* TOP STUDIO HEADER, CSV/JSON UPLOAD & 6 INSTANT 1-CLICK BENCHMARK PRESETS */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="min-w-0">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-2">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>
                                Paul Graham Default Alive + David Sacks Burn Multiple + YC SAFE v1.1 + Exit Waterfall Studio v
                                {SAAS_ENGINE_VERSION}
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            SaaS Burn Rate, Runway &amp; Cap Table Dilution Simulator
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Model 60-month cohort MRR &amp; AI LLM token COGS, solve Paul Graham Default Alive breakeven,
                            convert stacked Pre/Post-Money SAFEs &amp; Option Pool Shuffles, simulate M&amp;A Exit
                            Waterfalls, and run 1,000-trial Monte Carlo stress tests 100% locally.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
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
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-sm transition"
                        >
                            <Upload className="w-4 h-4 shrink-0" />
                            <span>Import Historical CSV / JSON Model</span>
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
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
                        >
                            <FileSpreadsheet className="w-4 h-4 shrink-0" />
                            <span>Download 3-Tab Excel (.xlsx)</span>
                        </button>
                    </div>
                </div>

                {/* 6 Instant 1-Click Sample Startups & Presets */}
                <div className="pt-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>
                            6 Instant 1-Click Benchmark Startups (Click Any Scenario to Load Live 60m Runway, SAFE Cap Table &amp; Exit Waterfall):
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {SAAS_PRESETS.map((preset) => {
                            const isSelected = workspace.activePreset === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => handleSelectPreset(preset.id)}
                                    className={`min-w-0 text-left p-3.5 rounded-xl border transition group ${isSelected
                                            ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/60 ring-2 ring-indigo-500/30 shadow-xs'
                                            : 'border-slate-200 dark:border-slate-700/80 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-800/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                                            {preset.name}
                                        </span>
                                        <span
                                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${isSelected
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                }`}
                                        >
                                            {isSelected ? '✓ Active' : 'Load'}
                                        </span>
                                    </div>
                                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 mb-1">
                                        {preset.shortBadge}
                                    </span>
                                    <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400 line-clamp-2">
                                        {preset.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Live Active Model Summary Strip */}
                    <div className="mt-3 rounded-xl border border-indigo-200 dark:border-indigo-900/70 bg-indigo-50/70 dark:bg-indigo-950/40 p-3 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2 min-w-0">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="font-bold text-slate-900 dark:text-white truncate">
                                    Active Model:{' '}
                                    <code className="font-mono text-indigo-700 dark:text-indigo-300">
                                        {workspace.companyName}
                                    </code>
                                </span>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${compiled.defaultAliveStatus === 'DEFAULT_ALIVE'
                                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                        }`}
                                >
                                    {compiled.defaultAliveStatus === 'DEFAULT_ALIVE'
                                        ? `DEFAULT ALIVE (Breakeven M${compiled.breakevenMonthIndex ?? 1})`
                                        : `DEFAULT DEAD (${compiled.exactRunwayMonths}m Runway)`}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                    Founders Post-A: {compiled.capTable.foundersCombinedPostSeriesAPct}% • Readiness:{' '}
                                    {compiled.ventureReadinessScore}/100
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('runway_studio');
                                        workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition"
                                >
                                    60m Runway &amp; AI COGS ↓
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('captable_dilution');
                                        workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-500"
                                >
                                    SAFE &amp; Cap Table ({compiled.capTable.stakeholders.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('exit_waterfall');
                                        workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-500"
                                >
                                    Exit Waterfall (${(workspace.exitConfig.targetExitValuationDollars / 1e6).toFixed(0)}M)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('venture_linter');
                                        workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-500"
                                >
                                    12-Point Linter ({compiled.lintIssues.length} Alerts)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Disclosure & Privacy Bar */}
                <details className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <summary className="cursor-pointer font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span>
                                Institutional Methodology (Paul Graham Default Alive, David Sacks Burn Multiple, YC SAFE v1.1) &amp; Zero-Upload Privacy Disclosure
                            </span>
                        </span>
                        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium shrink-0">
                            Click to expand
                        </span>
                    </summary>
                    <div className="mt-2.5 space-y-1.5 leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-2.5">
                        <p>
                            <strong>Privacy &amp; Local Execution:</strong> Your financial inputs, historical CSV/JSON
                            actuals, hiring plans, and cap table configurations are processed locally in your browser and
                            are not uploaded to KivaroTools servers. The website may still load general analytics or
                            other third-party website resources.
                        </p>
                        <p>
                            <strong>Closed-Loop Cash + Cap Table Synchronization:</strong> Scheduling a future SAFE,
                            Series A, or Series B round automatically injects net cash proceeds into your 60-month
                            runway curve at the exact closing month while simultaneously solving the pre-money option
                            pool shuffle, MFN upgrades, and liquidation preference breakpoints.
                        </p>
                    </div>
                </details>
            </div>

            {errorMessage && (
                <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 p-4 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold">Financial Engine Alert</p>
                        <p className="text-xs mt-0.5 break-words">{errorMessage}</p>
                    </div>
                </div>
            )}

            {statusBanner && (
                <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-emerald-900 dark:text-emerald-200">
                    <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{statusBanner}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setStatusBanner(null)}
                        className="text-emerald-700 dark:text-emerald-300 hover:underline font-medium shrink-0"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* 6-CARD LIVE CFO & CAP TABLE TELEMETRY RIBBON */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Cash Runway &amp; Status
                    </div>
                    <div
                        className={`text-sm font-bold mt-0.5 truncate ${compiled.defaultAliveStatus === 'DEFAULT_ALIVE'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : compiled.exactRunwayMonths >= 12
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-rose-600 dark:text-rose-400'
                            }`}
                    >
                        {compiled.runwayExhausted
                            ? `${compiled.exactRunwayMonths} Months`
                            : '60+ Months (Alive)'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                        {compiled.defaultAliveStatus === 'DEFAULT_ALIVE'
                            ? `Breakeven in Month ${compiled.breakevenMonthIndex ?? 1}`
                            : `Raise by Month ${compiled.mandatoryRaiseByMonth}`}
                    </div>
                </div>

                <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Burn Multiple (Sacks)
                    </div>
                    <div
                        className={`text-sm font-bold mt-0.5 truncate ${compiled.davidSacksBurnMultiple <= 1.5
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : compiled.davidSacksBurnMultiple <= 2.5
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-rose-600 dark:text-rose-400'
                            }`}
                    >
                        {compiled.davidSacksBurnMultiple}x ({compiled.burnMultipleTier.split('_')[0]})
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                        Net Burn: ${compiled.currentNetBurnMonthlyDollars.toLocaleString()}/mo
                    </div>
                </div>

                <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        NRR &amp; GTM Magic Number
                    </div>
                    <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">
                        {compiled.annualizedNrrPct}% NRR • {compiled.saasMagicNumber}x
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                        CAC Payback: {compiled.cacPaybackMonths}m • LTV:CAC {compiled.ltvToCacRatio}x
                    </div>
                </div>

                <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Blended Gross Margin
                    </div>
                    <div
                        className={`text-sm font-bold mt-0.5 truncate ${compiled.blendedGrossMarginMonth1Pct >= 65
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                    >
                        {compiled.blendedGrossMarginMonth1Pct}% → {compiled.blendedGrossMarginMonth12Pct}%
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                        {workspace.aiTokenCogs.enabled
                            ? `${workspace.aiTokenCogs.promptCacheHitRatePct}% AI Cache • Rule40: ${compiled.ruleOf40Score}`
                            : `Classical SaaS • Rule40: ${compiled.ruleOf40Score}`}
                    </div>
                </div>

                <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Founders Post-Round %
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                        {compiled.capTable.foundersCombinedPostSeriesAPct}% Post-A
                        {workspace.seriesBRound.enabled
                            ? ` (${compiled.capTable.foundersCombinedPostSeriesBPct}% B)`
                            : ''}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                        Series A PPS: ${compiled.capTable.seriesARoundPps.toFixed(3)}/sh
                    </div>
                </div>

                <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Founder Exit Payout
                    </div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                        ${(compiled.exitWaterfall.targetExitResult.foundersPayoutDollars / 1e6).toFixed(2)}M
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                        @ ${(workspace.exitConfig.targetExitValuationDollars / 1e6).toFixed(0)}M Exit •{' '}
                        {compiled.monteCarlo.probabilityDefaultAlivePct}% MC Alive
                    </div>
                </div>
            </div>

            {/* 6-TAB WORKBENCH NAVIGATION */}
            <div
                ref={workbenchRef}
                className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 scroll-mt-20"
            >
                <button
                    type="button"
                    onClick={() => setActiveTab('runway_studio')}
                    className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'runway_studio'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                >
                    <span className="inline-flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 shrink-0" />
                        <span>1. Cash Runway, AI COGS &amp; Hiring</span>
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('captable_dilution')}
                    className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'captable_dilution'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                >
                    <span className="inline-flex items-center gap-2">
                        <PieChart className="w-4 h-4 shrink-0" />
                        <span>2. SAFE, Option Pool &amp; Cap Table</span>
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('exit_waterfall')}
                    className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'exit_waterfall'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                >
                    <span className="inline-flex items-center gap-2">
                        <DollarSign className="w-4 h-4 shrink-0" />
                        <span>3. M&amp;A Exit Waterfall</span>
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('montecarlo_heatmaps')}
                    className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'montecarlo_heatmaps'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                >
                    <span className="inline-flex items-center gap-2">
                        <Activity className="w-4 h-4 shrink-0" />
                        <span>4. Monte Carlo &amp; 2D Heatmaps</span>
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('venture_linter')}
                    className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'venture_linter'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                >
                    <span className="inline-flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>5. Venture Readiness Linter</span>
                    </span>
                    <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${compiled.lintIssues.length === 0
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-500'
                            }`}
                    >
                        {compiled.lintIssues.length}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('export_studio')}
                    className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'export_studio'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                >
                    <span className="inline-flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 shrink-0" />
                        <span>6. 10-Format Export Studio</span>
                    </span>
                </button>
            </div>

            {/* ============================================================================
                TAB 1: 60-MONTH CASH RUNWAY, MRR COHORT, AI TOKEN COGS & HIRING PLAN STUDIO
               ============================================================================ */}
            {activeTab === 'runway_studio' && (
                <div className="space-y-6">
                    {/* 1-Click Default Alive Breakeven Solver Card */}
                    <div
                        className={`rounded-2xl border p-4 sm:p-5 ${compiled.breakevenSolver.isAlreadyDefaultAlive
                                ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/30'
                                : 'border-rose-300 dark:border-rose-800/80 bg-rose-50/70 dark:bg-rose-950/30'
                            }`}
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Zap
                                        className={`w-4 h-4 shrink-0 ${compiled.breakevenSolver.isAlreadyDefaultAlive
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-rose-600 dark:text-rose-400'
                                            }`}
                                    />
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                        {compiled.breakevenSolver.isAlreadyDefaultAlive
                                            ? `Paul Graham Trajectory: DEFAULT ALIVE (Cash Breakeven in Month ${compiled.breakevenMonthIndex ?? 1})`
                                            : `Paul Graham Trajectory: DEFAULT DEAD — Cash Depletes in ${compiled.exactRunwayMonths} Months (Raise by M${compiled.mandatoryRaiseByMonth})`}
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {compiled.breakevenSolver.isAlreadyDefaultAlive
                                        ? `Your revenue line crosses total gross burn with a minimum 60-month cash trough of $${Math.round(compiled.minimumCashBalanceDollars).toLocaleString()}. Fundraising is optional for acceleration rather than survival.`
                                        : `Deterministic Binary Search Solver: To flip your startup from Default Dead to Default Alive with a $${workspace.minimumSafetyCashBufferDollars.toLocaleString()} minimum cash buffer, either trim immediate OpEx by ${compiled.breakevenSolver.requiredImmediateOpexCutPct}% (-$${compiled.breakevenSolver.requiredImmediateOpexCutMonthlyDollars.toLocaleString()}/mo) OR lift monthly New MRR growth to ${compiled.breakevenSolver.requiredMonthlyNewMrrGrowthPct}%/mo.`}
                                </p>
                            </div>
                            {!compiled.breakevenSolver.isAlreadyDefaultAlive && (
                                <div className="flex flex-wrap items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleApplyBreakevenOpexFix}
                                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition"
                                    >
                                        1-Click Trim OpEx (-{compiled.breakevenSolver.requiredImmediateOpexCutPct}%)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleApplyBreakevenGrowthFix}
                                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition"
                                    >
                                        1-Click Set {compiled.breakevenSolver.requiredMonthlyNewMrrGrowthPct}%/mo Growth
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Interactive Dual-Axis 60-Month SVG Runway & Breakeven Chart */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    60-Month Cash Runway Curve &amp; Revenue vs. Gross Burn Crossover
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Includes scheduled SAFE/Series A/B net equity cash injections, non-dilutive grants,
                                    AI LLM token COGS, and hiring step-functions.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                                <span className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
                                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Ending Cash
                                </span>
                                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Cash Revenue
                                </span>
                                <span className="inline-flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Gross Burn
                                </span>
                            </div>
                        </div>

                        <div className="w-full overflow-x-auto overscroll-x-contain">
                            <svg
                                viewBox={`0 0 ${runwaySvgData.width} ${runwaySvgData.height}`}
                                className="w-full h-auto min-w-[600px] rounded-xl bg-slate-950 p-2 border border-slate-800"
                                role="img"
                                aria-label="60-Month SaaS Cash Runway and Revenue vs Gross Burn Chart"
                            >
                                {/* Zero Cash Horizontal Line */}
                                <line
                                    x1={runwaySvgData.padLeft}
                                    y1={runwaySvgData.zeroY}
                                    x2={runwaySvgData.width - runwaySvgData.padRight}
                                    y2={runwaySvgData.zeroY}
                                    stroke="#475569"
                                    strokeDasharray="4 4"
                                    strokeWidth="1"
                                />
                                {/* Cash Area & Polyline */}
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
                                {/* Cash Revenue Line */}
                                <polyline
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="2"
                                    points={runwaySvgData.revPoints}
                                />
                                {/* Gross Burn Line */}
                                <polyline
                                    fill="none"
                                    stroke="#f43f5e"
                                    strokeWidth="2"
                                    strokeDasharray="5 3"
                                    points={runwaySvgData.burnPoints}
                                />
                                {/* Breakeven Marker */}
                                {compiled.breakevenMonthIndex !== null && (
                                    <g>
                                        <line
                                            x1={runwaySvgData.xForMonth(compiled.breakevenMonthIndex)}
                                            y1={runwaySvgData.padTop}
                                            x2={runwaySvgData.xForMonth(compiled.breakevenMonthIndex)}
                                            y2={runwaySvgData.height - runwaySvgData.padBottom}
                                            stroke="#10b981"
                                            strokeDasharray="3 3"
                                            strokeWidth="1.5"
                                        />
                                        <text
                                            x={Math.min(
                                                runwaySvgData.width - 130,
                                                runwaySvgData.xForMonth(compiled.breakevenMonthIndex) + 6
                                            )}
                                            y={runwaySvgData.padTop + 14}
                                            fill="#34d399"
                                            fontSize="10"
                                            fontWeight="bold"
                                        >
                                            Breakeven M{compiled.breakevenMonthIndex}
                                        </text>
                                    </g>
                                )}
                                {/* Axis Labels */}
                                <text x="8" y={runwaySvgData.padTop + 10} fill="#94a3b8" fontSize="10">
                                    ${(runwaySvgData.maxCash / 1e6).toFixed(1)}M
                                </text>
                                <text x="8" y={runwaySvgData.zeroY - 4} fill="#94a3b8" fontSize="10">
                                    $0 Cash
                                </text>
                                {[1, 12, 24, 36, 48, 60].map((m) => (
                                    <text
                                        key={m}
                                        x={runwaySvgData.xForMonth(m) - 10}
                                        y={runwaySvgData.height - 8}
                                        fill="#94a3b8"
                                        fontSize="10"
                                    >
                                        M{m}
                                    </text>
                                ))}
                            </svg>
                        </div>
                    </div>

                    {/* Grid of Operational Controls: Cash/MRR + Departmental OpEx + AI LLM Token COGS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Column 1: Cash & Cohort MRR Drivers */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span>Cash Balance &amp; Cohort MRR Drivers</span>
                            </h3>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Company / Model Name
                                </label>
                                <input
                                    type="text"
                                    value={workspace.companyName}
                                    onChange={(e) =>
                                        setWorkspace((prev) => ({ ...prev, companyName: e.target.value }))
                                    }
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Starting Cash ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={workspace.startingCashDollars}
                                        onChange={(e) =>
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                startingCashDollars: Math.max(0, Number(e.target.value) || 0),
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Starting MRR ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={workspace.startingMrrDollars}
                                        onChange={(e) =>
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                startingMrrDollars: Math.max(0, Number(e.target.value) || 0),
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        New MRR Growth (%/mo)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={workspace.monthlyNewMrrGrowthPct}
                                        onChange={(e) =>
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                monthlyNewMrrGrowthPct: Math.max(0, Number(e.target.value) || 0),
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Expansion MRR (%/mo)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.2"
                                        value={workspace.monthlyExpansionMrrPct}
                                        onChange={(e) =>
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                monthlyExpansionMrrPct: Math.max(0, Number(e.target.value) || 0),
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Gross Churn (%/mo)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.2"
                                        value={workspace.monthlyGrossChurnMrrPct}
                                        onChange={(e) =>
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                monthlyGrossChurnMrrPct: Math.max(0, Number(e.target.value) || 0),
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Annual Upfront Billing %
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
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Departmental OpEx & Venture Debt */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span>Departmental OpEx &amp; Venture Debt</span>
                            </h3>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        R&amp;D / Eng OpEx ($/mo)
                                    </label>
                                    <input
                                        type="number"
                                        value={workspace.baselineRdOpexDollars}
                                        onChange={(e) =>
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                baselineRdOpexDollars: Math.max(0, Number(e.target.value) || 0),
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Sales &amp; Mktg ($/mo)
                                    </label>
                                    <input
                                        type="number"
                                        value={workspace.baselineSmOpexDollars}
                                        onChange={(e) =>
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                baselineSmOpexDollars: Math.max(0, Number(e.target.value) || 0),
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        G&amp;A / Legal ($/mo)
                                    </label>
                                    <input
                                        type="number"
                                        value={workspace.baselineGaOpexDollars}
                                        onChange={(e) =>
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                baselineGaOpexDollars: Math.max(0, Number(e.target.value) || 0),
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Base SaaS Gross Margin %
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
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={workspace.ventureDebt.enabled}
                                        onChange={(e) =>
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                ventureDebt: { ...prev.ventureDebt, enabled: e.target.checked },
                                            }))
                                        }
                                        className="rounded border-slate-300"
                                    />
                                    <span>Enable Venture Debt Tranche (${(workspace.ventureDebt.principalDollars / 1e6).toFixed(2)}M)</span>
                                </label>
                                {workspace.ventureDebt.enabled && (
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        <div>
                                            <label className="block text-[10px] text-slate-500">Principal ($)</label>
                                            <input
                                                type="number"
                                                value={workspace.ventureDebt.principalDollars}
                                                onChange={(e) =>
                                                    setWorkspace((prev) => ({
                                                        ...prev,
                                                        ventureDebt: {
                                                            ...prev.ventureDebt,
                                                            principalDollars: Math.max(0, Number(e.target.value) || 0),
                                                        },
                                                    }))
                                                }
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500">Draw Month</label>
                                            <input
                                                type="number"
                                                value={workspace.ventureDebt.drawdownMonth}
                                                onChange={(e) =>
                                                    setWorkspace((prev) => ({
                                                        ...prev,
                                                        ventureDebt: {
                                                            ...prev.ventureDebt,
                                                            drawdownMonth: Math.min(60, Math.max(1, Number(e.target.value) || 1)),
                                                        },
                                                    }))
                                                }
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500">IO Months</label>
                                            <input
                                                type="number"
                                                value={workspace.ventureDebt.interestOnlyMonths}
                                                onChange={(e) =>
                                                    setWorkspace((prev) => ({
                                                        ...prev,
                                                        ventureDebt: {
                                                            ...prev.ventureDebt,
                                                            interestOnlyMonths: Math.max(0, Number(e.target.value) || 0),
                                                        },
                                                    }))
                                                }
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs font-mono"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Column 3: AI SaaS LLM Token Inference COGS Engine */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    <span>AI SaaS LLM Token COGS</span>
                                </h3>
                                <label className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={workspace.aiTokenCogs.enabled}
                                        onChange={(e) =>
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                aiTokenCogs: { ...prev.aiTokenCogs, enabled: e.target.checked },
                                            }))
                                        }
                                        className="rounded border-slate-300"
                                    />
                                    <span>Active</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Queries / Customer / Mo
                                    </label>
                                    <input
                                        type="number"
                                        value={workspace.aiTokenCogs.monthlyQueriesPerCustomer}
                                        onChange={(e) =>
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                aiTokenCogs: {
                                                    ...prev.aiTokenCogs,
                                                    monthlyQueriesPerCustomer: Math.max(0, Number(e.target.value) || 0),
                                                },
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Cost / 1M Tokens ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.2"
                                        value={workspace.aiTokenCogs.blendedCostPerMillionTokensDollars}
                                        onChange={(e) =>
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                aiTokenCogs: {
                                                    ...prev.aiTokenCogs,
                                                    blendedCostPerMillionTokensDollars: Math.max(
                                                        0,
                                                        Number(e.target.value) || 0
                                                    ),
                                                },
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Prompt Cache Hit Rate %
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
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Fixed GPU Cluster ($/mo)
                                    </label>
                                    <input
                                        type="number"
                                        value={workspace.aiTokenCogs.fixedGpuClusterMonthlyDollars}
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
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
                                    />
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Month 1 AI Token COGS:{' '}
                                <strong className="text-slate-900 dark:text-white">
                                    ${Math.round(compiled.monthlyRows[0]?.aiTokenInferenceCogs || 0).toLocaleString()}/mo
                                </strong>{' '}
                                • Blended Gross Margin:{' '}
                                <strong className="text-indigo-600 dark:text-indigo-400">
                                    {compiled.blendedGrossMarginMonth1Pct}%
                                </strong>
                            </p>
                        </div>
                    </div>

                    {/* Dynamic Hiring Plan & Historical Actuals Paste Calibration */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Hiring Plan Step-Function Builder */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span>Headcount Hiring Plan Step-Functions ({workspace.hiringPlan.length} Roles)</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                <input
                                    type="text"
                                    placeholder="Role Title (e.g. Staff AI Eng)"
                                    value={newHireTitle}
                                    onChange={(e) => setNewHireTitle(e.target.value)}
                                    className="sm:col-span-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
                                />
                                <input
                                    type="number"
                                    placeholder="Annual Salary ($)"
                                    value={newHireSalary}
                                    onChange={(e) => setNewHireSalary(Number(e.target.value) || 0)}
                                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
                                />
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        min={1}
                                        max={60}
                                        value={newHireStartMonth}
                                        onChange={(e) => setNewHireStartMonth(Number(e.target.value) || 1)}
                                        className="w-16 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 text-xs font-mono"
                                        title="Start Month (1..60)"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddHiringRole}
                                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add</span>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {workspace.hiringPlan.map((role) => (
                                    <div
                                        key={role.id}
                                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs"
                                    >
                                        <div className="min-w-0">
                                            <div className="font-bold text-slate-900 dark:text-white truncate">
                                                {role.title} ({role.department})
                                            </div>
                                            <div className="text-[11px] text-slate-500">
                                                ${role.annualBaseSalary.toLocaleString()}/yr (+{role.benefitsAndTaxBurdenPct}% tax/benefits) • Starts Month {role.startMonth}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setWorkspace((prev) => ({
                                                    ...prev,
                                                    hiringPlan: prev.hiringPlan.filter((r) => r.id !== role.id),
                                                }))
                                            }
                                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60"
                                            title="Remove role"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Historical CSV/JSON Paste Auto-Calibrator */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    <span>1-Click Historical CSV / JSON Auto-Calibrator</span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleApplyHistoricalPaste}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                                >
                                    Calibrate from Paste / Demo CSV
                                </button>
                            </div>
                            <textarea
                                rows={5}
                                value={historicalCsvText}
                                onChange={(e) => setHistoricalCsvText(e.target.value)}
                                placeholder={SAMPLE_HISTORICAL_CSV}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-mono"
                            />
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Paste historical monthly rows (<code>Month, MRR, Total_OpEx, Ending_Cash</code>) from
                                Stripe, QuickBooks, or Mercury, or leave blank and click to test with 5-month Demo CSV.
                            </p>
                        </div>
                    </div>

                    {/* Interactive 60-Month Cohort Cash Flow & Runway Ledger Table */}
                    <details className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
                        <summary className="cursor-pointer text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center justify-between gap-2">
                            <span>Inspect Full 60-Month Cohort MRR, AI Token COGS &amp; Cash Balance Ledger (M1–M60)</span>
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Click to expand table</span>
                        </summary>
                        <div className="w-full mt-4 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 max-h-96">
                            <table className="min-w-[820px] w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-900 dark:text-white sticky top-0">
                                    <tr>
                                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-800">Month</th>
                                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-800 text-right">Ending MRR</th>
                                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-800 text-right">ARR</th>
                                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-800 text-right">AI Token COGS</th>
                                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-800 text-right">Blended GM%</th>
                                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-800 text-right">Gross Burn</th>
                                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-800 text-right">Equity/Grant In</th>
                                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-800 text-right">Net Burn</th>
                                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-800 text-right">Ending Cash</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {compiled.monthlyRows.map((r) => (
                                        <tr key={r.month} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                            <td className="p-2.5 font-mono font-bold">{r.calendarLabel}</td>
                                            <td className="p-2.5 text-right font-mono">${Math.round(r.endingMrr).toLocaleString()}</td>
                                            <td className="p-2.5 text-right font-mono">${Math.round(r.arr).toLocaleString()}</td>
                                            <td className="p-2.5 text-right font-mono">${Math.round(r.aiTokenInferenceCogs).toLocaleString()}</td>
                                            <td className="p-2.5 text-right font-mono">{r.blendedGrossMarginPct}%</td>
                                            <td className="p-2.5 text-right font-mono">${Math.round(r.grossBurn).toLocaleString()}</td>
                                            <td className="p-2.5 text-right font-mono text-indigo-600 dark:text-indigo-400">
                                                {r.nonDilutiveInflow + r.equityFinancingNetInflow > 0
                                                    ? `+$${Math.round(r.nonDilutiveInflow + r.equityFinancingNetInflow).toLocaleString()}`
                                                    : '—'}
                                            </td>
                                            <td className="p-2.5 text-right font-mono text-rose-600 dark:text-rose-400">
                                                ${Math.round(r.netBurn).toLocaleString()}
                                            </td>
                                            <td
                                                className={`p-2.5 text-right font-mono font-bold ${r.endingCash >= 0
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-rose-600 dark:text-rose-400'
                                                    }`}
                                            >
                                                ${Math.round(r.endingCash).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </details>
                </div>
            )}

            {/* ============================================================================
                TAB 2: SAFE / CONVERTIBLE NOTE, OPTION POOL SHUFFLE & CAP TABLE STUDIO
               ============================================================================ */}
            {activeTab === 'captable_dilution' && (
                <div className="space-y-6">
                    {/* Add SAFE / Convertible Note & Configure Series A / B Priced Rounds */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Left: Convertible Instruments Manager */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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
                                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs"
                                />
                                <select
                                    value={newSafeType}
                                    onChange={(e) => setNewSafeType(e.target.value as ConvertibleInstrumentType)}
                                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs"
                                >
                                    <option value="YC_POST_MONEY_SAFE">YC Post-Money SAFE</option>
                                    <option value="PRE_MONEY_SAFE">Pre-Money SAFE</option>
                                    <option value="CONVERTIBLE_NOTE">Convertible Note (8%)</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Investment ($)"
                                    value={newSafePrincipal}
                                    onChange={(e) => setNewSafePrincipal(Number(e.target.value) || 0)}
                                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-mono"
                                />
                                <input
                                    type="number"
                                    placeholder="Valuation Cap ($)"
                                    value={newSafeCap}
                                    onChange={(e) => setNewSafeCap(Number(e.target.value) || 0)}
                                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-mono"
                                />
                                <input
                                    type="number"
                                    placeholder="Discount %"
                                    value={newSafeDiscount}
                                    onChange={(e) => setNewSafeDiscount(Number(e.target.value) || 0)}
                                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddConvertible}
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add SAFE / Note</span>
                                </button>
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {workspace.convertibles.map((conv) => {
                                    const convDetail = compiled.capTable.convertibleDetails.find(
                                        (d) => d.id === conv.id
                                    );
                                    return (
                                        <div
                                            key={conv.id}
                                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-2 text-xs"
                                        >
                                            <div className="min-w-0">
                                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                    <span>{conv.investorName}</span>
                                                    <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px]">
                                                        {conv.type}
                                                    </span>
                                                    {convDetail?.mfnUpgraded && (
                                                        <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px]">
                                                            MFN Upgraded → ${(convDetail.effectiveCapDollarsAfterMfn / 1e6).toFixed(1)}M Cap
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-slate-500 mt-0.5">
                                                    Principal: ${conv.principalDollars.toLocaleString()} • Cap: $
                                                    {(conv.valuationCapDollars / 1e6).toFixed(1)}M • Discount:{' '}
                                                    {conv.discountPct}% • Converts to{' '}
                                                    <strong>
                                                        {convDetail?.convertedShares.toLocaleString() || 0} shares (
                                                        {convDetail?.postSeriesAOwnershipPct || 0}% Post-A)
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
                                                                convertibles: prev.convertibles.map((c) =>
                                                                    c.id === conv.id
                                                                        ? { ...c, mfnEnabled: e.target.checked }
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

                        {/* Right: Series A & Series B Priced Round + Option Pool Shuffle Configurator */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span>Series A &amp; Series B Option Pool Shuffle Configurator</span>
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Series A Pre-Money ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={workspace.seriesARound.preMoneyValuationDollars}
                                        onChange={(e) =>
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                seriesARound: {
                                                    ...prev.seriesARound,
                                                    preMoneyValuationDollars: Math.max(
                                                        1_000_000,
                                                        Number(e.target.value) || 10_000_000
                                                    ),
                                                },
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Series A New Money ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={workspace.seriesARound.newMoneyInvestmentDollars}
                                        onChange={(e) =>
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                seriesARound: {
                                                    ...prev.seriesARound,
                                                    newMoneyInvestmentDollars: Math.max(0, Number(e.target.value) || 0),
                                                },
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Close Month (1..60)
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={60}
                                        value={workspace.seriesARound.closeMonth}
                                        onChange={(e) =>
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                seriesARound: {
                                                    ...prev.seriesARound,
                                                    closeMonth: Math.min(60, Math.max(1, Number(e.target.value) || 12)),
                                                },
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Post-A Option Pool %
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={workspace.seriesARound.targetPostRoundOptionPoolPct}
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
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Pool Carve-Out Mode
                                    </label>
                                    <select
                                        value={workspace.seriesARound.optionPoolCarveoutMode}
                                        onChange={(e) =>
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                seriesARound: {
                                                    ...prev.seriesARound,
                                                    optionPoolCarveoutMode: e.target.value as
                                                        | 'PRE_MONEY_SHUFFLE'
                                                        | 'POST_MONEY_SHARED',
                                                },
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs"
                                    >
                                        <option value="PRE_MONEY_SHUFFLE">Pre-Money Shuffle (Standard VC)</option>
                                        <option value="POST_MONEY_SHARED">Post-Money Shared (Founder Friendly)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        CEO Secondary Cash-Out ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={workspace.founders[0]?.secondarySaleDollarsAtSeriesA || 0}
                                        onChange={(e) => {
                                            const val = Math.max(0, Number(e.target.value) || 0);
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                founders: prev.founders.map((f, idx) =>
                                                    idx === 0 ? { ...f, secondarySaleDollarsAtSeriesA: val } : f
                                                ),
                                            }));
                                        }}
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-mono"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                                <label className="inline-flex items-center gap-2 font-bold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={workspace.seriesBRound.enabled}
                                        onChange={(e) =>
                                            setWorkspace((prev) => ({
                                                ...prev,
                                                seriesBRound: { ...prev.seriesBRound, enabled: e.target.checked },
                                            }))
                                        }
                                    />
                                    <span>Enable Follow-On Series B Round ($25M @ $110M Pre-Money)</span>
                                </label>
                                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                                    Series A PPS: ${compiled.capTable.seriesARoundPps.toFixed(4)} • Pool Top-Up:{' '}
                                    +{compiled.capTable.seriesAOptionPoolTopUpShares.toLocaleString()} sh
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Co-Founder Equity Split, 4-Year Vesting & Secondary Sale Editor */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span>Co-Founder Equity Split, 4-Year Vesting (1-Year Cliff) &amp; Series A Secondary Editor</span>
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
                                                role: 'VP Engineering & Co-Founder',
                                                initialShares: 1_000_000,
                                                vestingMonthsTotal: 48,
                                                cliffMonths: 12,
                                                monthsElapsed: 18,
                                                secondarySaleDollarsAtSeriesA: 0,
                                            },
                                        ],
                                    }));
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Co-Founder</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {workspace.founders.map((f, fIdx) => (
                                <div
                                    key={f.id}
                                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2 text-xs min-w-0"
                                >
                                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                                        <input
                                            type="text"
                                            value={f.name}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setWorkspace((prev) => ({
                                                    ...prev,
                                                    founders: prev.founders.map((item, i) =>
                                                        i === fIdx ? { ...item, name: val } : item
                                                    ),
                                                }));
                                            }}
                                            className="font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs min-w-0 flex-1"
                                        />
                                        <input
                                            type="text"
                                            value={f.role}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setWorkspace((prev) => ({
                                                    ...prev,
                                                    founders: prev.founders.map((item, i) =>
                                                        i === fIdx ? { ...item, role: val } : item
                                                    ),
                                                }));
                                            }}
                                            className="text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs min-w-0 flex-1"
                                        />
                                        {workspace.founders.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setWorkspace((prev) => ({
                                                        ...prev,
                                                        founders: prev.founders.filter((_, i) => i !== fIdx),
                                                    }))
                                                }
                                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60 shrink-0"
                                                title="Remove Co-Founder"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-[10px] text-slate-500">Initial Shares</label>
                                            <input
                                                type="number"
                                                value={f.initialShares}
                                                onChange={(e) => {
                                                    const val = Math.max(0, Number(e.target.value) || 0);
                                                    setWorkspace((prev) => ({
                                                        ...prev,
                                                        founders: prev.founders.map((item, i) =>
                                                            i === fIdx ? { ...item, initialShares: val } : item
                                                        ),
                                                    }));
                                                }}
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500">Months Vested (0..48)</label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={60}
                                                value={f.monthsElapsed}
                                                onChange={(e) => {
                                                    const val = Math.max(0, Number(e.target.value) || 0);
                                                    setWorkspace((prev) => ({
                                                        ...prev,
                                                        founders: prev.founders.map((item, i) =>
                                                            i === fIdx ? { ...item, monthsElapsed: val } : item
                                                        ),
                                                    }));
                                                }}
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500">Series A Secondary ($)</label>
                                            <input
                                                type="number"
                                                value={f.secondarySaleDollarsAtSeriesA}
                                                onChange={(e) => {
                                                    const val = Math.max(0, Number(e.target.value) || 0);
                                                    setWorkspace((prev) => ({
                                                        ...prev,
                                                        founders: prev.founders.map((item, i) =>
                                                            i === fIdx ? { ...item, secondarySaleDollarsAtSeriesA: val } : item
                                                        ),
                                                    }));
                                                }}
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Complete Algebraic Pro-Forma Cap Table Ledger */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3">
                            Pro-Forma Cap Table &amp; Algebraic SAFE/Series A/B Dilution Ledger
                        </h3>
                        <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="min-w-[820px] w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                                    <tr>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800">Stakeholder</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Initial %</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Post-SAFE %</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Post-Series A Shares</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Post-Series A %</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Post-Series B %</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Paper Value ($)</th>
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
                                            <td className="p-3 text-right font-mono text-indigo-600 dark:text-indigo-400">
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
                                                ${row.impliedPaperValuePostRoundDollars.toLocaleString()}
                                            </td>
                                            <td className="p-3 text-slate-500 dark:text-slate-400">{row.notes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================================
                TAB 3: M&A EXIT WATERFALL & LIQUIDATION PREFERENCE SIMULATOR
               ============================================================================ */}
            {activeTab === 'exit_waterfall' && (
                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    M&amp;A Exit Valuation &amp; Liquidation Preference Waterfall Simulator
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Automatically solves voluntary conversion breakpoints for Non-Participating, Full
                                    Participating (&ldquo;Double Dip&rdquo;), and Capped Participating preferred classes.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500">
                                        Target Exit Valuation ($)
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
                                                        1_000_000,
                                                        Number(e.target.value) || 50_000_000
                                                    ),
                                                },
                                            }))
                                        }
                                        className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-mono font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500">
                                        Series A Liquidation Pref
                                    </label>
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
                                        className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
                                    >
                                        <option value="1_NON_PARTICIPATING">1x Non-Participating (96.4% Market Standard)</option>
                                        <option value="1_CAPPED_PARTICIPATING">1x Capped Participating (2x Cap)</option>
                                        <option value="1_FULL_PARTICIPATING">1x Full Participating (Double Dip)</option>
                                        <option value="2_NON_PARTICIPATING">2x Non-Participating</option>
                                        <option value="2_FULL_PARTICIPATING">2x Full Participating (Predatory)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Stakeholder Exit Waterfall Table at Target Valuation */}
                        <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="min-w-[780px] w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                                    <tr>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800">Stakeholder Class</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Invested ($)</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Pref Claim ($)</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800">Optimal Decision</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Conversion Breakpoint</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Total Exit Payout ($)</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">% of Net Exit</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">MOIC</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {compiled.exitWaterfall.targetExitResult.classPayouts.map((c) => (
                                        <tr key={c.classId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                            <td className="p-3 font-bold text-slate-900 dark:text-white">{c.className}</td>
                                            <td className="p-3 text-right font-mono">
                                                ${c.investedCapitalDollars.toLocaleString()}
                                            </td>
                                            <td className="p-3 text-right font-mono">
                                                ${c.liquidationPreferenceDollars.toLocaleString()}
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
                                                    ? `$${(c.voluntaryConversionBreakpointValuation / 1e6).toFixed(1)}M`
                                                    : '—'}
                                            </td>
                                            <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                ${c.totalPayoutDollars.toLocaleString()}
                                            </td>
                                            <td className="p-3 text-right font-mono">{c.shareOfNetExitPct}%</td>
                                            <td className="p-3 text-right font-mono font-bold">
                                                {c.moicMultiple > 0 ? `${c.moicMultiple}x` : 'Founder/ESOP'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 7-Valuation Exit Milestone Comparison Table ($10M to $1B) */}
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pt-2">
                            Multi-Valuation Exit Waterfall Matrix ($10M to $1B Enterprise Exit)
                        </h4>
                        <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="min-w-[720px] w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                                    <tr>
                                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-800">Gross Exit Valuation</th>
                                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-800 text-right">Net Distributable</th>
                                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-800 text-right">Founders Payout ($)</th>
                                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-800 text-right">Founders Share %</th>
                                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-800 text-right">SAFE / Seed ($)</th>
                                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-800 text-right">Series A ($)</th>
                                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-800 text-right">Series B ($)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {compiled.exitWaterfall.milestoneGrid.map((m) => (
                                        <tr key={m.exitValuationDollars}>
                                            <td className="p-2.5 font-bold font-mono">
                                                ${(m.exitValuationDollars / 1e6).toFixed(0)}M
                                            </td>
                                            <td className="p-2.5 text-right font-mono">
                                                ${(m.netDistributableProceedsDollars / 1e6).toFixed(2)}M
                                            </td>
                                            <td className="p-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                ${(m.foundersPayoutDollars / 1e6).toFixed(2)}M
                                            </td>
                                            <td className="p-2.5 text-right font-mono">{m.foundersEffectivePct}%</td>
                                            <td className="p-2.5 text-right font-mono">
                                                ${(m.safeAndSeedPayoutDollars / 1e6).toFixed(2)}M
                                            </td>
                                            <td className="p-2.5 text-right font-mono">
                                                ${(m.seriesAPayoutDollars / 1e6).toFixed(2)}M
                                            </td>
                                            <td className="p-2.5 text-right font-mono">
                                                ${(m.seriesBPayoutDollars / 1e6).toFixed(2)}M
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================================
                TAB 4: 1,000-RUN MONTE CARLO SIMULATOR & 2D SENSITIVITY HEATMAPS
               ============================================================================ */}
            {activeTab === 'montecarlo_heatmaps' && (
                <div className="space-y-6">
                    {/* Monte Carlo Summary Card */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    <span>
                                        1,000-Trial Seeded Monte Carlo Runway &amp; Default Alive Survival Distribution
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Deterministic Mulberry32 PRNG (Seed: {compiled.monteCarlo.seed}) shocking monthly
                                    MRR growth (±{workspace.monteCarloConfig.mrrGrowthVolatilityPct}%), churn (±
                                    {workspace.monteCarloConfig.churnVolatilityPct}%), and OpEx (±
                                    {workspace.monteCarloConfig.opexSlippageVolatilityPct}%).
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                                <div className="text-[11px] text-slate-500">P10 Bear Runway</div>
                                <div className="text-base font-bold text-rose-600 dark:text-rose-400">
                                    {compiled.monteCarlo.p10RunwayMonths} Months
                                </div>
                            </div>
                            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                                <div className="text-[11px] text-slate-500">P25 Conservative</div>
                                <div className="text-base font-bold text-amber-600 dark:text-amber-400">
                                    {compiled.monteCarlo.p25RunwayMonths} Months
                                </div>
                            </div>
                            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                                <div className="text-[11px] text-slate-500">P50 Median Runway</div>
                                <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                                    {compiled.monteCarlo.p50RunwayMonths} Months
                                </div>
                            </div>
                            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                                <div className="text-[11px] text-slate-500">P90 Bull Runway</div>
                                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                    {compiled.monteCarlo.p90RunwayMonths} Months
                                </div>
                            </div>
                            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                                <div className="text-[11px] text-slate-500">Default Alive Probability</div>
                                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                    {compiled.monteCarlo.probabilityDefaultAlivePct}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Two 5x5 Sensitivity Heatmaps */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Heatmap 1: Growth vs. Churn -> Runway Months */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                5×5 Heatmap #1: New MRR Growth % vs. Gross Churn % (Runway Months)
                            </h3>
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
                                                    {c}% Churn
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {compiled.sensitivity.runwayGrowthChurnGrid.map((row, rIdx) => (
                                            <tr key={rIdx}>
                                                <td className="p-2 border border-slate-200 dark:border-slate-800 font-bold bg-slate-50 dark:bg-slate-800">
                                                    {compiled.sensitivity.growthStepsPct[rIdx]}% Growth
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
                                                        {cell.metricValue >= 60 ? '60m+ (Alive)' : `${cell.metricValue}m`}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Heatmap 2: Series A Pre-Money Valuation vs. Option Pool % -> Founder Ownership % */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                5×5 Heatmap #2: Series A Valuation vs. Option Pool % (Founder Post-A %)
                            </h3>
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
                                        {compiled.sensitivity.founderDilutionValPoolGrid.map((row, rIdx) => (
                                            <tr key={rIdx}>
                                                <td className="p-2 border border-slate-200 dark:border-slate-800 font-bold bg-slate-50 dark:bg-slate-800">
                                                    ${(compiled.sensitivity.valuationStepsDollars[rIdx] / 1e6).toFixed(1)}M
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
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================================
                TAB 5: 12-POINT VENTURE READINESS, AI MARGIN & TERM SHEET RISK LINTER
               ============================================================================ */}
            {activeTab === 'venture_linter' && (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    <span>
                                        12-Point Venture Readiness, Burn Multiple &amp; Term Sheet Risk Linter (Score:{' '}
                                        {compiled.ventureReadinessScore}/100)
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Audits Paul Graham Fatal Pinch risk, David Sacks Burn Multiple, Stacked Post-Money
                                    SAFE overhang, Pre-Money Option Pool Shuffles, MFN triggers, and AI Token Margin Traps.
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
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shrink-0"
                                >
                                    <Wrench className="w-4 h-4" />
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
                                <p className="text-xs text-slate-500 max-w-xl mx-auto">
                                    Your model passes all 12 institutional VC checks (Default Alive trajectory, healthy
                                    Burn Multiple, clean 1x Non-Participating terms, and balanced Founder equity).
                                </p>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {compiled.lintIssues.map((iss) => (
                                    <div
                                        key={iss.id}
                                        className={`rounded-xl border p-4 ${iss.severity === 'ERROR'
                                                ? 'border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/30'
                                                : iss.severity === 'WARNING'
                                                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30'
                                                    : 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30'
                                            }`}
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                [{iss.ruleCode}] {iss.title}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/80 dark:bg-slate-900/80">
                                                {iss.severity} • {iss.category}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {iss.detail}
                                        </p>
                                        <p className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 mt-1.5">
                                            Fix Recommendation: {iss.recommendation}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ============================================================================
                TAB 6: 10-FORMAT CFO, INVESTOR DATA ROOM & BOARD EXPORT STUDIO
               ============================================================================ */}
            {activeTab === 'export_studio' && (
                <div className="space-y-5">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    10-Format CFO, Investor Data Room &amp; Board Export Suite
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    All CSV and native multi-tab Excel (<code>.xlsx</code>) deliverables include automatic
                                    CWE-1236 spreadsheet formula injection protection and SHA-256 model integrity hashes.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
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
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5" />
                                    <span>1. Download 3-Tab Excel (.xlsx)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        triggerDownload(
                                            compiled.cashFlowCsv,
                                            '60m_saas_cash_flow_waterfall.csv',
                                            'text/csv;charset=utf-8'
                                        )
                                    }
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                                >
                                    <FileCode className="w-3.5 h-3.5" />
                                    <span>2. 60m Cash Flow (.csv)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        triggerDownload(
                                            compiled.capTableCsv,
                                            'pro_forma_captable_safe_ledger.csv',
                                            'text/csv;charset=utf-8'
                                        )
                                    }
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-blue-600 text-white"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>3. Cap Table Ledger (.csv)</span>
                                </button>
                            </div>
                        </div>

                        {/* Deliverable Selector Pills */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    { id: 'board_markdown' as const, label: '1. Board Deck Report (.md)' },
                                    { id: 'cashflow_csv' as const, label: '2. 60m Cash Flow (.csv)' },
                                    { id: 'captable_csv' as const, label: '3. Pro-Forma Cap Table (.csv)' },
                                    { id: 'waterfall_csv' as const, label: '4. M&A Exit Waterfall (.csv)' },
                                    { id: 'interactive_html' as const, label: '5. Interactive Board Deck (.html)' },
                                    { id: 'snapshot_json' as const, label: '6. SHA-256 Model Snapshot (.json)' },
                                    { id: 'python_script' as const, label: '7. Python Verification (.py)' },
                                    { id: 'url_permalink' as const, label: '8. Shareable URL Query' },
                                    { id: 'executive_txt' as const, label: '9. Term Sheet Audit (.txt)' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setExportFormat(item.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${exportFormat === item.id
                                                ? 'bg-indigo-600 text-white'
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
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white"
                                >
                                    {copiedExport ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                    )}
                                    <span>{copiedExport ? 'Copied!' : 'Copy Output'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const fileMap: Record<typeof exportFormat, { name: string; mime: string }> = {
                                            board_markdown: {
                                                name: 'cfo-board-runway-captable-report.md',
                                                mime: 'text/markdown;charset=utf-8',
                                            },
                                            cashflow_csv: {
                                                name: '60m-cash-flow-waterfall.csv',
                                                mime: 'text/csv;charset=utf-8',
                                            },
                                            captable_csv: {
                                                name: 'pro-forma-captable-safe-ledger.csv',
                                                mime: 'text/csv;charset=utf-8',
                                            },
                                            waterfall_csv: {
                                                name: 'ma-exit-waterfall-payouts.csv',
                                                mime: 'text/csv;charset=utf-8',
                                            },
                                            interactive_html: {
                                                name: 'interactive-investor-board-deck.html',
                                                mime: 'text/html;charset=utf-8',
                                            },
                                            snapshot_json: {
                                                name: 'saas-financial-model-sha256.json',
                                                mime: 'application/json;charset=utf-8',
                                            },
                                            python_script: {
                                                name: 'verify_saas_runway_and_safe_math.py',
                                                mime: 'text/x-python;charset=utf-8',
                                            },
                                            url_permalink: {
                                                name: 'shareable-url-query.txt',
                                                mime: 'text/plain;charset=utf-8',
                                            },
                                            executive_txt: {
                                                name: 'executive-term-sheet-runway-audit.txt',
                                                mime: 'text/plain;charset=utf-8',
                                            },
                                        };
                                        const cfg = fileMap[exportFormat];
                                        triggerDownload(activeExportText, cfg.name, cfg.mime);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download Active File</span>
                                </button>
                            </div>
                        </div>

                        <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-w-full max-h-[520px] whitespace-pre-wrap break-words leading-relaxed">
                            {activeExportText}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}