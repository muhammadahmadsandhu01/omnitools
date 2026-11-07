"use client";

import React, { useState, useMemo, useRef } from 'react';
import {
    Calculator,
    PieChart,
    Sparkles,
    RotateCcw,
    ChevronDown,
    Calendar,
    Layers,
    DollarSign,
    TrendingUp,
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    Download,
    Share2,
    Check,
    Plus,
    Trash2,
    Info,
    FileSpreadsheet,
    Users,
    Zap,
} from 'lucide-react';

import {
    calculateSaasBurnRunwayAndDilution,
    exportSaasCalculatorXlsx,
    getSaasScenarioPreset,
    type SaasScenarioPresetId,
    type SaasCalculatorState,
    type ConvertibleNoteType,
    type LiquidationPrefType,
    type SafeLiquidationTreatment,
    type WaterfallSeniorityMode,
    type PlannedHireItem,
    type ConvertibleTranche,
} from '@/lib/saasBurnRateEngine';

type BottomScheduleTab =
    | 'runway_schedule'
    | 'captable_dilution'
    | 'scenario_comparison'
    | 'exit_waterfall';

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
    id: SaasScenarioPresetId;
    label: string;
}[] = [
        { id: 'seed_saas_default_alive', label: 'Seed SaaS ($1.5M Cash • Default Alive)' },
        { id: 'series_a_fundraising_bridge', label: 'Series A Bridge ($140k MRR)' },
        { id: 'high_burn_cost_cut_needed', label: 'High Burn (Cost-Cut Needed)' },
        { id: 'bootstrapped_profitable_saas', label: 'Bootstrapped to Profitability' },
        { id: 'stacked_safe_dilution_demo', label: 'Stacked SAFEs + 15% Option Pool' },
    ];

export default function SaasBurnRateCalculator() {
    const [state, setState] = useState<SaasCalculatorState>(() => {
        const base = getSaasScenarioPreset('seed_saas_default_alive');
        if (typeof window !== 'undefined' && window.location.search) {
            const params = new URLSearchParams(window.location.search);
            const presetParam = params.get('preset') as SaasScenarioPresetId | null;
            const seeded =
                presetParam && QUICK_SCENARIO_PRESETS.some((p) => p.id === presetParam)
                    ? getSaasScenarioPreset(presetParam)
                    : base;
            const cash = Number(params.get('cash'));
            const mrr = Number(params.get('mrr'));
            const opex = Number(params.get('opex'));
            const growth = Number(params.get('growth'));
            const expGrowth = Number(params.get('expGrowth'));
            const preVal = Number(params.get('preVal'));
            const newInv = Number(params.get('newInv'));
            const pool = Number(params.get('pool'));
            const exitVal = Number(params.get('exit'));
            return {
                ...seeded,
                cashOnHand: !Number.isNaN(cash) && cash >= 0 ? cash : seeded.cashOnHand,
                monthlyRevenueMrr:
                    !Number.isNaN(mrr) && mrr >= 0 ? mrr : seeded.monthlyRevenueMrr,
                monthlyOperatingExpenses:
                    !Number.isNaN(opex) && opex >= 0 ? opex : seeded.monthlyOperatingExpenses,
                monthlyNetRevenueGrowthPct:
                    !Number.isNaN(growth) && growth >= 0
                        ? growth
                        : seeded.monthlyNetRevenueGrowthPct,
                monthlyExpenseGrowthPct:
                    !Number.isNaN(expGrowth) && expGrowth >= 0
                        ? expGrowth
                        : seeded.monthlyExpenseGrowthPct,
                preMoneyValuation:
                    !Number.isNaN(preVal) && preVal > 0 ? preVal : seeded.preMoneyValuation,
                newInvestmentAmount:
                    !Number.isNaN(newInv) && newInv >= 0 ? newInv : seeded.newInvestmentAmount,
                targetPostRoundOptionPoolPct:
                    !Number.isNaN(pool) && pool >= 0
                        ? pool
                        : seeded.targetPostRoundOptionPoolPct,
                targetExitValuation:
                    !Number.isNaN(exitVal) && exitVal > 0
                        ? exitVal
                        : seeded.targetExitValuation,
            };
        }
        return base;
    });

    const [activeTab, setActiveTab] = useState<BottomScheduleTab>('runway_schedule');
    const [scheduleViewMode, setScheduleViewMode] = useState<'monthly' | 'yearly'>('monthly');
    const [openRunwayDrawer, setOpenRunwayDrawer] = useState<boolean>(false);
    const [openCapTableDrawer, setOpenCapTableDrawer] = useState<boolean>(false);
    const [copiedShare, setCopiedShare] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    // Planned Hire Form State
    const [hireRole, setHireRole] = useState<string>('');
    const [hireCost, setHireCost] = useState<number>(12000);
    const [hireMonth, setHireMonth] = useState<number>(6);

    // SAFE / Convertible Note Form State
    const [safeLabel, setSafeLabel] = useState<string>('');
    const [safeType, setSafeType] = useState<ConvertibleNoteType>('POST_MONEY_SAFE');
    const [safeAmount, setSafeAmount] = useState<number>(500000);
    const [safeCap, setSafeCap] = useState<number>(12000000);
    const [safeDiscount, setSafeDiscount] = useState<number>(20);
    const [safeInterest, setSafeInterest] = useState<number>(8);
    const [safeMonths, setSafeMonths] = useState<number>(12);

    const scheduleSectionRef = useRef<HTMLDivElement | null>(null);

    const sym = state.currencySymbol || '$';

    const results = useMemo(() => calculateSaasBurnRunwayAndDilution(state), [state]);

    const isZeroState =
        state.cashOnHand <= 0 &&
        state.monthlyRevenueMrr <= 0 &&
        state.monthlyOperatingExpenses <= 0;

    const handleCurrencyChange = (code: string) => {
        const found = CURRENCY_OPTIONS.find((c) => c.code === code);
        if (found) {
            setState((prev) => ({
                ...prev,
                currencyCode: found.code,
                currencySymbol: found.symbol,
            }));
        }
    };

    const handleSelectPreset = (presetId: SaasScenarioPresetId) => {
        const next = getSaasScenarioPreset(presetId);
        next.currencyCode = state.currencyCode;
        next.currencySymbol = state.currencySymbol;
        setState(next);
        const found = QUICK_SCENARIO_PRESETS.find((p) => p.id === presetId);
        setStatusMessage(`Loaded Scenario: ${found?.label || presetId}`);
    };

    const handleReset = () => {
        const base = getSaasScenarioPreset('seed_saas_default_alive');
        setState({
            ...base,
            cashOnHand: 0,
            monthlyRevenueMrr: 0,
            monthlyOperatingExpenses: 0,
            monthlyNetRevenueGrowthPct: 0,
            monthlyExpenseGrowthPct: 0,
            plannedCostReductionMonthly: 0,
            oneTimeCashInflowAmount: 0,
            plannedHires: [],
            convertibleNotes: [],
            includeNextFundingRound: false,
        });
        setStatusMessage(
            'Form reset to zero. Enter your cash balance, monthly revenue, and monthly expenses on the left.'
        );
    };

    const handleAddHire = () => {
        const newHire: PlannedHireItem = {
            id: `hire_${Date.now()}`,
            roleTitle: hireRole.trim() || `Team Member #${state.plannedHires.length + 1}`,
            department: 'Engineering & Product',
            headcount: 1,
            monthlyFullyLoadedCost: Math.max(500, Number(hireCost) || 10000),
            startMonth: Math.min(60, Math.max(1, Number(hireMonth) || 6)),
        };
        setState((prev) => ({
            ...prev,
            plannedHires: [...prev.plannedHires, newHire],
        }));
        setHireRole('');
    };

    const handleAddSafeNote = () => {
        const newNote: ConvertibleTranche = {
            id: `safe_${Date.now()}`,
            label: safeLabel.trim() || `SAFE Investor #${state.convertibleNotes.length + 1}`,
            instrumentType: safeType,
            investmentAmount: Math.max(5000, Number(safeAmount) || 250000),
            valuationCap: Math.max(0, Number(safeCap) || 10000000),
            discountPct: Math.min(50, Math.max(0, Number(safeDiscount) || 0)),
            interestRatePct: safeType === 'CONVERTIBLE_NOTE' ? Math.max(0, Number(safeInterest) || 8) : 0,
            durationMonths: safeType === 'CONVERTIBLE_NOTE' ? Math.max(1, Number(safeMonths) || 12) : 0,
        };
        setState((prev) => ({
            ...prev,
            convertibleNotes: [...prev.convertibleNotes, newNote],
        }));
        setSafeLabel('');
    };

    const handleShareScenario = () => {
        const origin =
            typeof window !== 'undefined'
                ? `${window.location.origin}${window.location.pathname}`
                : 'https://kivarotools.com/finance/saas-burn-rate-calculator';
        void navigator.clipboard?.writeText(`${origin}${results.shareableQueryString}`);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
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

    // SVG Chart Coordinates (60-Month Cash Balance + Revenue vs Gross Burn)
    const chartData = useMemo(() => {
        const rows = results.monthlySchedule;
        const maxCash = Math.max(
            100_000,
            ...rows.map((r) => Math.max(0, r.endingCash)),
            state.cashOnHand
        );
        const minCash = Math.min(0, ...rows.map((r) => r.endingCash));
        const span = Math.max(1, maxCash - minCash);

        const width = 660;
        const height = 190;
        const padL = 50;
        const padR = 18;
        const padT = 16;
        const padB = 26;
        const plotW = width - padL - padR;
        const plotH = height - padT - padB;

        const xForM = (m: number) => padL + ((m - 1) / 59) * plotW;
        const yForCash = (c: number) => padT + plotH - ((c - minCash) / span) * plotH;
        const zeroY = yForCash(0);

        const maxFlow = Math.max(
            10_000,
            ...rows.map((r) => Math.max(r.mrr, r.totalGrossBurn))
        );
        const yForFlow = (f: number) =>
            padT + plotH - (Math.min(maxFlow, Math.max(0, f)) / maxFlow) * plotH;

        const cashLine = rows
            .map((r) => `${xForM(r.month).toFixed(1)},${yForCash(r.endingCash).toFixed(1)}`)
            .join(' ');
        const cashArea = `${xForM(1).toFixed(1)},${zeroY.toFixed(1)} ${cashLine} ${xForM(60).toFixed(1)},${zeroY.toFixed(1)}`;
        const revLine = rows
            .map((r) => `${xForM(r.month).toFixed(1)},${yForFlow(r.mrr).toFixed(1)}`)
            .join(' ');
        const burnLine = rows
            .map((r) => `${xForM(r.month).toFixed(1)},${yForFlow(r.totalGrossBurn).toFixed(1)}`)
            .join(' ');

        return {
            width,
            height,
            padL,
            padR,
            padT,
            padB,
            zeroY,
            maxCash,
            xForM,
            cashLine,
            cashArea,
            revLine,
            burnLine,
        };
    }, [results.monthlySchedule, state.cashOnHand]);

    return (
        <div className="space-y-6 w-full min-w-0 max-w-full overflow-x-hidden text-slate-900 dark:text-slate-100">
            {statusMessage && (
                <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/80 dark:bg-blue-950/40 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-blue-950 dark:text-blue-200">
                    <span className="font-medium truncate">{statusMessage}</span>
                    <button
                        type="button"
                        onClick={() => setStatusMessage(null)}
                        className="text-blue-700 dark:text-blue-300 font-semibold hover:underline shrink-0"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* ============================================================================
                2-COLUMN FINANCE CALCULATOR WORKSPACE (MATCHES EMI & MORTGAGE CALCULATORS)
               ============================================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ========================================================================
                    LEFT COLUMN (5 COLS): CLEAN BUSINESS & FINANCE PARAMETERS
                   ======================================================================== */}
                <div className="lg:col-span-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-5 min-w-0">
                    {/* Header Row: Title + Reset */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                Burn Rate, Runway &amp; Equity Inputs
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset Form</span>
                        </button>
                    </div>

                    {/* Quick Scenario Presets Box */}
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span>Quick Scenario Presets</span>
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {QUICK_SCENARIO_PRESETS.map((p) => {
                                const isActive = !isZeroState && state.presetId === p.id;
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => handleSelectPreset(p.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${isActive
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                            }`}
                                    >
                                        {p.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Currency Selector */}
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                            Currency
                        </label>
                        <select
                            value={state.currencyCode}
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

                    {/* Slider Input 1: Cash on Hand (Current Bank Balance) */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                Current Cash Balance
                            </label>
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 px-3 py-1.5 w-36">
                                <span className="text-xs font-semibold text-slate-400 mr-1.5">
                                    {sym}
                                </span>
                                <input
                                    type="number"
                                    value={state.cashOnHand}
                                    onChange={(e) =>
                                        setState((prev) => ({
                                            ...prev,
                                            cashOnHand: Math.max(0, Number(e.target.value) || 0),
                                        }))
                                    }
                                    className="w-full bg-transparent text-right text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none"
                                />
                            </div>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={10000000}
                            step={25000}
                            value={Math.min(10000000, state.cashOnHand)}
                            onChange={(e) =>
                                setState((prev) => ({
                                    ...prev,
                                    cashOnHand: Number(e.target.value),
                                }))
                            }
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    {/* Slider Input 2: Monthly Recurring Revenue (MRR) */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                                    Monthly Revenue (MRR)
                                </label>
                                <span className="text-[10px] text-slate-400">
                                    Annualized ARR: {sym}
                                    {results.currentArr.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 px-3 py-1.5 w-36">
                                <span className="text-xs font-semibold text-slate-400 mr-1.5">
                                    {sym}
                                </span>
                                <input
                                    type="number"
                                    value={state.monthlyRevenueMrr}
                                    onChange={(e) =>
                                        setState((prev) => ({
                                            ...prev,
                                            monthlyRevenueMrr: Math.max(
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
                            max={500000}
                            step={2500}
                            value={Math.min(500000, state.monthlyRevenueMrr)}
                            onChange={(e) =>
                                setState((prev) => ({
                                    ...prev,
                                    monthlyRevenueMrr: Number(e.target.value),
                                }))
                            }
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    {/* Slider Input 3: Monthly Operating Expenses */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                                    Monthly Operating Expenses
                                </label>
                                <span className="text-[10px] text-slate-400">
                                    Payroll, marketing, software &amp; overhead (excl. COGS)
                                </span>
                            </div>
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 px-3 py-1.5 w-36">
                                <span className="text-xs font-semibold text-slate-400 mr-1.5">
                                    {sym}
                                </span>
                                <input
                                    type="number"
                                    value={state.monthlyOperatingExpenses}
                                    onChange={(e) =>
                                        setState((prev) => ({
                                            ...prev,
                                            monthlyOperatingExpenses: Math.max(
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
                            max={500000}
                            step={2500}
                            value={Math.min(500000, state.monthlyOperatingExpenses)}
                            onChange={(e) =>
                                setState((prev) => ({
                                    ...prev,
                                    monthlyOperatingExpenses: Number(e.target.value),
                                }))
                            }
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    {/* 2-Column Pair: Monthly Revenue Growth % & Monthly Expense Growth % */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                                Revenue Growth / Mo
                            </label>
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 px-3 py-2">
                                <input
                                    type="number"
                                    step="0.5"
                                    value={state.monthlyNetRevenueGrowthPct}
                                    onChange={(e) =>
                                        setState((prev) => ({
                                            ...prev,
                                            monthlyNetRevenueGrowthPct: Math.max(
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
                                Expense Growth / Mo
                            </label>
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 px-3 py-2">
                                <input
                                    type="number"
                                    step="0.5"
                                    value={state.monthlyExpenseGrowthPct}
                                    onChange={(e) =>
                                        setState((prev) => ({
                                            ...prev,
                                            monthlyExpenseGrowthPct: Math.max(
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

                    {/* 2-Column Pair: Next Funding Round Pre-Money Valuation & New Investment */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                                Next Round Pre-Money
                            </label>
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 px-3 py-2">
                                <span className="text-xs font-semibold text-slate-400 mr-1">
                                    {sym}
                                </span>
                                <input
                                    type="number"
                                    value={state.preMoneyValuation}
                                    onChange={(e) =>
                                        setState((prev) => ({
                                            ...prev,
                                            preMoneyValuation: Math.max(
                                                500000,
                                                Number(e.target.value) || 10000000
                                            ),
                                        }))
                                    }
                                    className="w-full bg-transparent text-xs sm:text-sm font-semibold font-mono text-slate-900 dark:text-white focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                                New Round Investment
                            </label>
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 px-3 py-2">
                                <span className="text-xs font-semibold text-slate-400 mr-1">
                                    {sym}
                                </span>
                                <input
                                    type="number"
                                    value={state.newInvestmentAmount}
                                    onChange={(e) =>
                                        setState((prev) => ({
                                            ...prev,
                                            newInvestmentAmount: Math.max(
                                                0,
                                                Number(e.target.value) || 0
                                            ),
                                        }))
                                    }
                                    className="w-full bg-transparent text-xs sm:text-sm font-semibold font-mono text-slate-900 dark:text-white focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Segmented Toggle Buttons: Option Pool Carve-Out Mode */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                            Employee Option Pool (ESOP) Expansion Mode
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() =>
                                    setState((prev) => ({
                                        ...prev,
                                        optionPoolMode: 'PRE_MONEY_CARVEOUT',
                                    }))
                                }
                                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${state.optionPoolMode === 'PRE_MONEY_CARVEOUT'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                    }`}
                            >
                                Pre-Money Shuffle (Common)
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setState((prev) => ({
                                        ...prev,
                                        optionPoolMode: 'POST_MONEY_SHARED',
                                    }))
                                }
                                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${state.optionPoolMode === 'POST_MONEY_SHARED'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                    }`}
                            >
                                Post-Money Shared
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            Pre-money carve-out dilutes founders &amp; SAFEs before new round money enters.
                        </p>
                    </div>

                    {/* COLLAPSIBLE DRAWER 1: Runway Extension, Hiring Plan & Cost Reduction */}
                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setOpenRunwayDrawer((v) => !v)}
                            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition"
                        >
                            <span className="flex items-center gap-2">
                                <Users className="w-4 h-4 shrink-0" />
                                <span>
                                    Advanced Hiring Plan ({state.plannedHires.length}) &amp; Runway Extension Options
                                </span>
                            </span>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform ${openRunwayDrawer ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                        {openRunwayDrawer && (
                            <div className="p-4 pt-2 border-t border-slate-200/70 dark:border-slate-800 space-y-3 text-xs">
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            Gross Margin (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={state.grossMarginPct}
                                            onChange={(e) =>
                                                setState((prev) => ({
                                                    ...prev,
                                                    grossMarginPct: Math.min(
                                                        100,
                                                        Math.max(5, Number(e.target.value) || 80)
                                                    ),
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            Monthly Cost Cut ({sym}/mo)
                                        </label>
                                        <input
                                            type="number"
                                            value={state.plannedCostReductionMonthly}
                                            onChange={(e) =>
                                                setState((prev) => ({
                                                    ...prev,
                                                    plannedCostReductionMonthly: Math.max(
                                                        0,
                                                        Number(e.target.value) || 0
                                                    ),
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            One-Time Inflow ({sym})
                                        </label>
                                        <input
                                            type="number"
                                            value={state.oneTimeCashInflowAmount}
                                            onChange={(e) =>
                                                setState((prev) => ({
                                                    ...prev,
                                                    oneTimeCashInflowAmount:
                                                        Number(e.target.value) || 0,
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            Target Runway (Months)
                                        </label>
                                        <input
                                            type="number"
                                            min={6}
                                            max={60}
                                            value={state.targetRunwayMonths}
                                            onChange={(e) =>
                                                setState((prev) => ({
                                                    ...prev,
                                                    targetRunwayMonths: Math.min(
                                                        60,
                                                        Math.max(6, Number(e.target.value) || 24)
                                                    ),
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
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
                                            placeholder="Role Title (e.g. Sales Executive)"
                                            value={hireRole}
                                            onChange={(e) => setHireRole(e.target.value)}
                                            className="col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Monthly Cost ($/mo)"
                                            value={hireCost}
                                            onChange={(e) =>
                                                setHireCost(Number(e.target.value) || 0)
                                            }
                                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="number"
                                                min={1}
                                                max={60}
                                                value={hireMonth}
                                                onChange={(e) =>
                                                    setHireMonth(Number(e.target.value) || 1)
                                                }
                                                className="w-16 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 font-mono"
                                                title="Start Month"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddHire}
                                                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>Add</span>
                                            </button>
                                        </div>
                                    </div>
                                    {state.plannedHires.length > 0 && (
                                        <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                                            {state.plannedHires.map((h) => (
                                                <div
                                                    key={h.id}
                                                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                                                >
                                                    <span className="truncate font-medium">
                                                        {h.roleTitle} ({sym}
                                                        {h.monthlyFullyLoadedCost.toLocaleString()}/mo from M
                                                        {h.startMonth})
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setState((prev) => ({
                                                                ...prev,
                                                                plannedHires:
                                                                    prev.plannedHires.filter(
                                                                        (item) => item.id !== h.id
                                                                    ),
                                                            }))
                                                        }
                                                        className="text-rose-600 hover:bg-rose-50 p-1 rounded"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* COLLAPSIBLE DRAWER 2: SAFE / Convertible Notes & Cap Table Settings */}
                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setOpenCapTableDrawer((v) => !v)}
                            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition"
                        >
                            <span className="flex items-center gap-2">
                                <Layers className="w-4 h-4 shrink-0" />
                                <span>
                                    Advanced SAFE / Convertible Notes ({state.convertibleNotes.length}) &amp; Cap Table Options
                                </span>
                            </span>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform ${openCapTableDrawer ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                        {openCapTableDrawer && (
                            <div className="p-4 pt-2 border-t border-slate-200/70 dark:border-slate-800 space-y-3 text-xs">
                                <label className="inline-flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={state.includeNextFundingRound}
                                        onChange={(e) =>
                                            setState((prev) => ({
                                                ...prev,
                                                includeNextFundingRound: e.target.checked,
                                            }))
                                        }
                                        className="rounded border-slate-300"
                                    />
                                    <span>Include Priced Funding Round in Runway &amp; Cap Table</span>
                                </label>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            Founders Pre-Round (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={state.foundersInitialOwnershipPct}
                                            onChange={(e) => {
                                                const val = Math.min(
                                                    100,
                                                    Math.max(1, Number(e.target.value) || 90)
                                                );
                                                setState((prev) => ({
                                                    ...prev,
                                                    foundersInitialOwnershipPct: val,
                                                    existingOptionPoolPct: Math.max(0, 100 - val),
                                                }));
                                            }}
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            Post-Round Pool Target (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={state.targetPostRoundOptionPoolPct}
                                            onChange={(e) =>
                                                setState((prev) => ({
                                                    ...prev,
                                                    targetPostRoundOptionPoolPct: Math.min(
                                                        35,
                                                        Math.max(0, Number(e.target.value) || 10)
                                                    ),
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            Round Close Month (1..60)
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={60}
                                            value={state.fundingRoundMonth}
                                            onChange={(e) =>
                                                setState((prev) => ({
                                                    ...prev,
                                                    fundingRoundMonth: Math.min(
                                                        60,
                                                        Math.max(1, Number(e.target.value) || 12)
                                                    ),
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            Target Exit Valuation ({sym})
                                        </label>
                                        <input
                                            type="number"
                                            step="5000000"
                                            value={state.targetExitValuation}
                                            onChange={(e) =>
                                                setState((prev) => ({
                                                    ...prev,
                                                    targetExitValuation: Math.max(
                                                        1000000,
                                                        Number(e.target.value) || 50000000
                                                    ),
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ========================================================================
                    RIGHT COLUMN (7 COLS): ROYAL BLUE HERO CARD, 2x2 METRIC PILLS & DARK BANNER
                   ======================================================================== */}
                <div className="lg:col-span-7 space-y-5 min-w-0">
                    <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-5">
                        {/* Section Header */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    Runway Breakdown, Burn Multiple &amp; Dilution Metrics
                                </h2>
                            </div>
                            <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${results.trajectoryStatus === 'DEFAULT_ALIVE'
                                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                    }`}
                            >
                                {results.trajectoryStatus === 'DEFAULT_ALIVE'
                                    ? `DEFAULT ALIVE (Breakeven M${results.breakevenMonth ?? 1})`
                                    : `DEFAULT DEAD (Raise by ${results.raiseByDateLabel})`}
                            </span>
                        </div>

                        {/* ROYAL BLUE GRADIENT HERO CARD */}
                        <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 p-6 sm:p-7 text-white shadow-md space-y-4">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-100">
                                    Projected Cash Runway (60m Dynamic Simulation)
                                </span>
                                <span className="px-2.5 py-0.5 rounded-lg bg-white/15 backdrop-blur-xs text-xs font-bold text-white">
                                    {state.currencyCode} • Static Runway:{' '}
                                    {results.staticRunwayIsCappedAt60
                                        ? `60+m (${results.uncappedStaticRunwayMonths}m)`
                                        : `${results.staticRunwayMonths}m`}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-baseline justify-between gap-4">
                                <div className="text-3xl sm:text-5xl font-extrabold tracking-tight font-mono">
                                    {isZeroState
                                        ? '0.0 Months'
                                        : results.runwayExhausted
                                            ? `${results.dynamicRunwayMonths} Months`
                                            : '60+ Months (Alive)'}
                                </div>
                                <div className="text-right">
                                    <div className="text-[11px] uppercase tracking-wider text-blue-200">
                                        Projected Zero-Cash / Breakeven
                                    </div>
                                    <div className="text-base sm:text-lg font-bold font-mono">
                                        {isZeroState
                                            ? '—'
                                            : results.runwayExhausted
                                                ? results.zeroCashDateLabel
                                                : results.breakevenDateLabel
                                                    ? `Breakeven ${results.breakevenDateLabel}`
                                                    : 'Self-Sustaining'}
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs sm:text-sm text-blue-100">
                                {isZeroState
                                    ? 'Enter current cash balance, monthly revenue, and operating expenses on the left to compute runway and equity dilution.'
                                    : results.trajectoryStatus === 'DEFAULT_ALIVE'
                                        ? `Under modeled growth assumptions, recurring revenue overtakes monthly gross burn in Month ${results.breakevenMonth ?? 1} (${results.breakevenDateLabel || 'Profitable'}) with ${sym}${results.minimumCashBalance.toLocaleString()} in minimum cash reserves.`
                                        : `Projected cash reaches zero in Month ${results.dynamicRunwayMonths} (${results.zeroCashDateLabel}). Plan fundraising by ${results.raiseByDateLabel} (${state.raisePlanningBufferMonths}m buffer) or reduce spend by ~${sym}${results.requiredMonthlyCostCutForDefaultAlive.toLocaleString()}/mo.`}
                            </p>

                            {/* Horizontal Split Progress Bar (Revenue Coverage vs Net Burn Deficit) */}
                            <div className="space-y-1.5 pt-1">
                                <div className="flex items-center justify-between text-xs font-semibold text-blue-100">
                                    <span>Revenue Coverage: {results.revenueCoverageRatioPct}%</span>
                                    <span>Net Burn Deficit: {results.netBurnDeficitRatioPct}%</span>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-blue-950/50 overflow-hidden flex">
                                    <div
                                        style={{ width: `${results.revenueCoverageRatioPct}%` }}
                                        className="bg-emerald-400 h-full transition-all duration-300"
                                    />
                                    <div
                                        style={{ width: `${results.netBurnDeficitRatioPct}%` }}
                                        className="bg-rose-400 h-full transition-all duration-300"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2x2 CLEAN METRIC PILL GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-4 py-3 flex items-center justify-between gap-2">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Monthly Gross Burn:
                                </span>
                                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                                    {sym}
                                    {results.grossBurnMonthly.toLocaleString()}/mo
                                </span>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-4 py-3 flex items-center justify-between gap-2">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Monthly Net Burn:
                                </span>
                                <span className="text-sm font-bold font-mono text-rose-600 dark:text-rose-400">
                                    -{sym}
                                    {results.netBurnMonthly.toLocaleString()}/mo
                                </span>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-4 py-3 flex items-center justify-between gap-2">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Modeled Burn Multiple:
                                </span>
                                <span
                                    className={`text-sm font-bold font-mono ${results.burnMultiple <= 1.5
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : results.burnMultiple <= 2.2
                                                ? 'text-amber-600 dark:text-amber-400'
                                                : 'text-rose-600 dark:text-rose-400'
                                        }`}
                                >
                                    {results.burnMultiple}x
                                </span>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-4 py-3 flex items-center justify-between gap-2">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Founders Post-Round Ownership:
                                </span>
                                <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                    {results.foundersPostRoundPct}% (-{results.foundersTotalDilutionPctPoints}%)
                                </span>
                            </div>
                        </div>

                        {/* DARK NAVY SUMMARY CALLOUT BANNER */}
                        <div className="rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-white">
                            <div>
                                <div className="text-xs sm:text-sm font-bold text-white">
                                    Scenario Founder Equity Value &amp; Exit Payout
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                    Post-SAFE: {results.foundersPostSafePct}% • Post-Round Paper Value:{' '}
                                    {sym}
                                    {results.foundersPaperValuePostRound.toLocaleString()} • Exit @{' '}
                                    {sym}
                                    {(state.targetExitValuation / 1e6).toFixed(0)}M
                                </div>
                            </div>
                            <div className="text-xl sm:text-2xl font-extrabold font-mono text-sky-400">
                                {sym}
                                {results.foundersExitPayout.toLocaleString()}
                            </div>
                        </div>

                        {/* 1-CLICK DEFAULT ALIVE BREAKEVEN SOLVER BAR (When Default Dead) */}
                        {results.trajectoryStatus !== 'DEFAULT_ALIVE' && !isZeroState && (
                            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/70 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                                <div>
                                    <div className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                        <span>
                                            Modeled Breakeven Target: Trim ~{sym}
                                            {results.requiredMonthlyCostCutForDefaultAlive.toLocaleString()}/mo OR Grow MRR at{' '}
                                            {results.requiredMonthlyGrowthPctForDefaultAlive}%/mo
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                                        For a {state.targetRunwayMonths}-month runway target, calculated monthly cost reduction is{' '}
                                        {sym}
                                        {results.requiredMonthlyCostCutForTargetRunway.toLocaleString()}/mo.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setState((prev) => ({
                                                ...prev,
                                                plannedCostReductionMonthly:
                                                    prev.plannedCostReductionMonthly +
                                                    results.requiredMonthlyCostCutForDefaultAlive +
                                                    500,
                                            }))
                                        }
                                        className="px-3 py-1.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-white transition"
                                    >
                                        Apply Cost Cut
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setState((prev) => ({
                                                ...prev,
                                                monthlyNetRevenueGrowthPct: Number(
                                                    (
                                                        results.requiredMonthlyGrowthPctForDefaultAlive +
                                                        0.2
                                                    ).toFixed(1)
                                                ),
                                            }))
                                        }
                                        className="px-3 py-1.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition"
                                    >
                                        Apply {results.requiredMonthlyGrowthPctForDefaultAlive}% Growth
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* COMPACT 60-MONTH CASH BALANCE CHART */}
                        <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                    60-Month Cash Balance &amp; Revenue vs. Gross Burn Forecast
                                </span>
                                <div className="flex items-center gap-3 text-[11px]">
                                    <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                                        <span className="w-2 h-2 rounded-full bg-blue-500" /> Cash
                                    </span>
                                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> MRR
                                    </span>
                                    <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                                        <span className="w-2 h-2 rounded-full bg-rose-500" /> Burn
                                    </span>
                                </div>
                            </div>
                            <div className="w-full overflow-x-auto overscroll-x-contain">
                                <svg
                                    viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                                    className="w-full h-auto min-w-[480px] rounded-2xl bg-slate-950 p-2 border border-slate-800"
                                    role="img"
                                    aria-label="60-Month Startup Cash Balance Forecast Chart"
                                >
                                    <line
                                        x1={chartData.padL}
                                        y1={chartData.zeroY}
                                        x2={chartData.width - chartData.padR}
                                        y2={chartData.zeroY}
                                        stroke="#475569"
                                        strokeDasharray="4 4"
                                        strokeWidth="1"
                                    />
                                    <polygon
                                        points={chartData.cashArea}
                                        fill="rgba(59, 130, 246, 0.22)"
                                    />
                                    <polyline
                                        fill="none"
                                        stroke="#3b82f6"
                                        strokeWidth="2.5"
                                        points={chartData.cashLine}
                                    />
                                    <polyline
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="1.75"
                                        points={chartData.revLine}
                                    />
                                    <polyline
                                        fill="none"
                                        stroke="#f43f5e"
                                        strokeWidth="1.75"
                                        strokeDasharray="4 3"
                                        points={chartData.burnLine}
                                    />
                                    {results.breakevenMonth !== null && (
                                        <g>
                                            <line
                                                x1={chartData.xForM(results.breakevenMonth)}
                                                y1={chartData.padT}
                                                x2={chartData.xForM(results.breakevenMonth)}
                                                y2={chartData.height - chartData.padB}
                                                stroke="#10b981"
                                                strokeDasharray="3 3"
                                                strokeWidth="1.5"
                                            />
                                            <text
                                                x={Math.min(
                                                    chartData.width - 110,
                                                    chartData.xForM(results.breakevenMonth) + 5
                                                )}
                                                y={chartData.padT + 12}
                                                fill="#34d399"
                                                fontSize="10"
                                                fontWeight="bold"
                                            >
                                                Breakeven M{results.breakevenMonth}
                                            </text>
                                        </g>
                                    )}
                                    <text x="6" y={chartData.padT + 10} fill="#94a3b8" fontSize="10">
                                        {sym}
                                        {(chartData.maxCash / 1e6).toFixed(1)}M
                                    </text>
                                    <text x="6" y={chartData.zeroY - 4} fill="#94a3b8" fontSize="10">
                                        {sym}0
                                    </text>
                                    {[1, 12, 24, 36, 48, 60].map((m) => (
                                        <text
                                            key={m}
                                            x={chartData.xForM(m) - 8}
                                            y={chartData.height - 6}
                                            fill="#94a3b8"
                                            fontSize="10"
                                        >
                                            M{m}
                                        </text>
                                    ))}
                                </svg>
                            </div>
                        </div>

                        {/* ACTION PILL BUTTONS ROW */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleShareScenario}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-400 transition shadow-2xs"
                                >
                                    {copiedShare ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    ) : (
                                        <Share2 className="w-3.5 h-3.5 text-slate-500" />
                                    )}
                                    <span>{copiedShare ? 'Scenario Link Copied!' : 'Share Scenario'}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        triggerDownload(
                                            results.runwayCsv,
                                            'saas_runway_schedule_60m.csv',
                                            'text/csv;charset=utf-8'
                                        )
                                    }
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Export Runway CSV</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const xlsx = exportSaasCalculatorXlsx(state, results);
                                        triggerDownload(
                                            xlsx,
                                            'saas_burn_runway_captable_model.xlsx',
                                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                        );
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5" />
                                    <span>Export 3-Sheet Excel (.xlsx)</span>
                                </button>
                            </div>

                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>
                                    {results.invariantVerification.allPassed
                                        ? '5/5 Conservation Checks Verified'
                                        : 'Model Check Active'}
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* METHODOLOGY, ASSUMPTIONS & INVARIANT VERIFICATION ACCORDION */}
                    <details className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3.5 shadow-2xs text-xs text-slate-600 dark:text-slate-300">
                        <summary className="cursor-pointer font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2 select-none list-none">
                            <span className="flex items-center gap-2">
                                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span>Methodology, Modeling Assumptions &amp; Conservation Verification</span>
                            </span>
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        </summary>
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 leading-relaxed">
                            <p>
                                <strong>Scenario-Based Financial Modeling:</strong> This calculator provides
                                scenario-based cash flow, SAFE/Convertible Note conversion, and M&amp;A waterfall
                                modeling. Actual financing and exit outcomes depend on specific legal agreements,
                                charter terms, day-count conventions, and tax treatments.
                            </p>
                            <p>
                                <strong>Static vs. Dynamic Runway:</strong> Uncapped Static Runway divides current cash
                                by Month-1 Net Burn ({results.uncappedStaticRunwayMonths}m raw; capped at 60m in summary
                                badges). Dynamic Runway simulates 60 monthly periods with compounding growth and rounds
                                the zero-cash crossing to one decimal month.
                            </p>
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {results.invariantVerification.checks.map((chk) => (
                                    <div
                                        key={chk.id}
                                        className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60"
                                    >
                                        <span className="text-[11px] font-medium truncate">
                                            ✓ {chk.label}
                                        </span>
                                        <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                            {chk.actual}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </details>
                </div>
            </div>

            {/* ============================================================================
                BOTTOM FULL-WIDTH SCHEDULE & CAP TABLE CARD
               ============================================================================ */}
            <div
                ref={scheduleSectionRef}
                className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-5 scroll-mt-20"
            >
                {/* Pill Tab Navigation Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('runway_schedule')}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition ${activeTab === 'runway_schedule'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <Calendar className="w-4 h-4 shrink-0" />
                            <span>Runway &amp; Cash Flow Schedule</span>
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
                            <span>Cap Table &amp; SAFE Dilution</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('scenario_comparison')}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition ${activeTab === 'scenario_comparison'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <TrendingUp className="w-4 h-4 shrink-0" />
                            <span>3-Scenario Comparison</span>
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
                    </div>

                    {activeTab === 'runway_schedule' && (
                        <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
                            <button
                                type="button"
                                onClick={() => setScheduleViewMode('monthly')}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition ${scheduleViewMode === 'monthly'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-600 dark:text-slate-300'
                                    }`}
                            >
                                Monthly (60m)
                            </button>
                            <button
                                type="button"
                                onClick={() => setScheduleViewMode('yearly')}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition ${scheduleViewMode === 'yearly'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-600 dark:text-slate-300'
                                    }`}
                            >
                                Yearly Summary
                            </button>
                        </div>
                    )}
                </div>

                {/* ========================================================================
                    TAB 1: RUNWAY & CASH FLOW SCHEDULE (MONTHLY OR YEARLY)
                   ======================================================================== */}
                {activeTab === 'runway_schedule' && (
                    <div className="space-y-4">
                        {scheduleViewMode === 'monthly' ? (
                            <div className="w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200 dark:border-slate-800 max-h-[460px]">
                                <table className="min-w-[800px] w-full text-left text-xs border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-900 dark:text-white sticky top-0">
                                        <tr>
                                            <th className="p-3 border-b border-slate-200 dark:border-slate-800">Month</th>
                                            <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Starting Cash</th>
                                            <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Monthly Revenue (MRR)</th>
                                            <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Operating Expenses</th>
                                            <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Hiring + COGS</th>
                                            <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Gross Burn</th>
                                            <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Funding Inflow</th>
                                            <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Net Burn</th>
                                            <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Ending Cash</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {results.monthlySchedule.map((r) => (
                                            <tr key={r.month} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                                <td className="p-2.5 font-mono font-bold">{r.dateLabel}</td>
                                                <td className="p-2.5 text-right font-mono">
                                                    {sym}
                                                    {Math.round(r.startingCash).toLocaleString()}
                                                </td>
                                                <td className="p-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                                                    {sym}
                                                    {Math.round(r.mrr).toLocaleString()}
                                                </td>
                                                <td className="p-2.5 text-right font-mono">
                                                    {sym}
                                                    {Math.round(r.baseExpenses).toLocaleString()}
                                                </td>
                                                <td className="p-2.5 text-right font-mono">
                                                    {sym}
                                                    {Math.round(r.hiringExpenses + r.cogsExpenses).toLocaleString()}
                                                </td>
                                                <td className="p-2.5 text-right font-mono">
                                                    {sym}
                                                    {Math.round(r.totalGrossBurn).toLocaleString()}
                                                </td>
                                                <td className="p-2.5 text-right font-mono text-blue-600 dark:text-blue-400 font-semibold">
                                                    {r.fundingOrOneTimeInflow !== 0
                                                        ? `${r.fundingOrOneTimeInflow > 0 ? '+' : ''}${sym}${Math.round(r.fundingOrOneTimeInflow).toLocaleString()}`
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
                        ) : (
                            <div className="w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200 dark:border-slate-800">
                                <table className="min-w-[680px] w-full text-left text-xs border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-900 dark:text-white">
                                        <tr>
                                            <th className="p-3 border-b border-slate-200 dark:border-slate-800">Year</th>
                                            <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Ending MRR</th>
                                            <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Ending ARR</th>
                                            <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Total Revenue (12m)</th>
                                            <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Total Expenses (12m)</th>
                                            <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Ending Cash Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {results.yearlySummary.map((yr) => (
                                            <tr key={yr.year} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                                <td className="p-3 font-bold">{yr.label}</td>
                                                <td className="p-3 text-right font-mono">
                                                    {sym}
                                                    {yr.endingMrr.toLocaleString()}
                                                </td>
                                                <td className="p-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                                                    {sym}
                                                    {yr.endingArr.toLocaleString()}
                                                </td>
                                                <td className="p-3 text-right font-mono">
                                                    {sym}
                                                    {yr.totalRevenueCollected.toLocaleString()}
                                                </td>
                                                <td className="p-3 text-right font-mono">
                                                    {sym}
                                                    {yr.totalExpensesPaid.toLocaleString()}
                                                </td>
                                                <td
                                                    className={`p-3 text-right font-mono font-bold ${yr.endingCash >= 0
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-rose-600 dark:text-rose-400'
                                                        }`}
                                                >
                                                    {sym}
                                                    {yr.endingCash.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================================================
                    TAB 2: CAP TABLE, SAFE / CONVERTIBLE NOTES & OPTION POOL DILUTION
                   ======================================================================== */}
                {activeTab === 'captable_dilution' && (
                    <div className="space-y-5">
                        {/* Add SAFE / Convertible Note Row */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                    Add SAFE or Convertible Note Tranche ({state.convertibleNotes.length} Active •{' '}
                                    {results.standalonePostMoneySafeDilutionPct}% Post-SAFE Ownership •{' '}
                                    {results.totalSafeDilutionPct}% Post-Round)
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                                        Round Share Price: {sym}
                                        {results.roundSharePrice.toFixed(4)}/sh
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            triggerDownload(
                                                results.capTableCsv,
                                                'saas_cap_table_dilution.csv',
                                                'text/csv;charset=utf-8'
                                            )
                                        }
                                        className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900 dark:bg-slate-700 text-white"
                                    >
                                        Export Cap Table CSV
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 text-xs">
                                <input
                                    type="text"
                                    placeholder="Investor / SAFE Label"
                                    value={safeLabel}
                                    onChange={(e) => setSafeLabel(e.target.value)}
                                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
                                />
                                <select
                                    value={safeType}
                                    onChange={(e) => setSafeType(e.target.value as ConvertibleNoteType)}
                                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
                                >
                                    <option value="POST_MONEY_SAFE">Post-Money SAFE (YC Std)</option>
                                    <option value="PRE_MONEY_SAFE">Pre-Money SAFE</option>
                                    <option value="CONVERTIBLE_NOTE">Convertible Note (Interest)</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Investment ($)"
                                    value={safeAmount}
                                    onChange={(e) => setSafeAmount(Number(e.target.value) || 0)}
                                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 font-mono"
                                />
                                <input
                                    type="number"
                                    placeholder="Valuation Cap ($)"
                                    value={safeCap}
                                    onChange={(e) => setSafeCap(Number(e.target.value) || 0)}
                                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 font-mono"
                                />
                                <input
                                    type="number"
                                    placeholder="Discount %"
                                    min={0}
                                    max={50}
                                    value={safeDiscount}
                                    onChange={(e) => setSafeDiscount(Number(e.target.value) || 0)}
                                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 font-mono"
                                    title="SAFE / Note Conversion Discount %"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSafeNote}
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add SAFE</span>
                                </button>
                            </div>

                            {safeType === 'CONVERTIBLE_NOTE' && (
                                <div className="grid grid-cols-2 gap-2.5 pt-1 max-w-md text-xs">
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            Simple Annual Interest Rate (%)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={safeInterest}
                                            onChange={(e) => setSafeInterest(Number(e.target.value) || 0)}
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                                            Accrued Months Before Conversion
                                        </label>
                                        <input
                                            type="number"
                                            value={safeMonths}
                                            onChange={(e) => setSafeMonths(Number(e.target.value) || 12)}
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono"
                                        />
                                    </div>
                                </div>
                            )}

                            {state.convertibleNotes.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {state.convertibleNotes.map((n) => (
                                        <div
                                            key={n.id}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                                        >
                                            <span className="font-semibold">{n.label}:</span>
                                            <span className="font-mono">
                                                {sym}
                                                {(n.investmentAmount / 1000).toFixed(0)}k @ {sym}
                                                {(n.valuationCap / 1e6).toFixed(1)}M Cap
                                                {n.discountPct > 0 ? ` (${n.discountPct}% Disc)` : ''}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setState((prev) => ({
                                                        ...prev,
                                                        convertibleNotes:
                                                            prev.convertibleNotes.filter(
                                                                (item) => item.id !== n.id
                                                            ),
                                                    }))
                                                }
                                                className="text-rose-600 hover:text-rose-500"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pro-Forma Cap Table Ownership & Dilution Table */}
                        <div className="w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200 dark:border-slate-800">
                            <table className="min-w-[820px] w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-900 dark:text-white">
                                    <tr>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800">Stakeholder Group</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800">Conversion Basis</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Pre-Round %</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Post-SAFE %</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Post-Round Shares</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Post-Round %</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Converting Principal</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Eff. Share Price</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Post-Round Value ({sym})</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {results.capTableRows.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                            <td className="p-3 font-bold text-slate-900 dark:text-white">
                                                {row.name}
                                            </td>
                                            <td className="p-3 text-slate-500 dark:text-slate-400">
                                                {row.conversionBasisLabel}
                                            </td>
                                            <td className="p-3 text-right font-mono">{row.preRoundPct}%</td>
                                            <td className="p-3 text-right font-mono text-blue-600 dark:text-blue-400 font-semibold">
                                                {row.postSafePct}%
                                            </td>
                                            <td className="p-3 text-right font-mono">
                                                {row.postRoundShares.toLocaleString()}
                                            </td>
                                            <td className="p-3 text-right font-mono font-bold">
                                                {row.postRoundPct}%
                                            </td>
                                            <td className="p-3 text-right font-mono">
                                                {row.convertingPrincipalAmount > 0
                                                    ? `${sym}${row.convertingPrincipalAmount.toLocaleString()}`
                                                    : '—'}
                                            </td>
                                            <td className="p-3 text-right font-mono">
                                                {row.effectiveSharePrice > 0
                                                    ? `${sym}${row.effectiveSharePrice.toFixed(4)}`
                                                    : 'Common'}
                                            </td>
                                            <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                {sym}
                                                {row.postRoundPaperValue.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ========================================================================
                    TAB 3: 3-SCENARIO COMPARISON (CONSERVATIVE / BASE / OPTIMISTIC) & ALERTS
                   ======================================================================== */}
                {activeTab === 'scenario_comparison' && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                results.scenarioComparison.conservative,
                                results.scenarioComparison.baseCase,
                                results.scenarioComparison.optimistic,
                            ].map((col, idx) => (
                                <div
                                    key={col.name}
                                    className={`rounded-2xl border p-4 space-y-3 ${idx === 1
                                            ? 'border-blue-500/80 bg-blue-50/40 dark:bg-blue-950/20'
                                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                            {col.name}
                                        </span>
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.status === 'DEFAULT_ALIVE'
                                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                                    : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                                }`}
                                        >
                                            {col.status === 'DEFAULT_ALIVE'
                                                ? 'Default Alive'
                                                : 'Default Dead'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">{col.subtitle}</p>
                                    <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200/80 dark:border-slate-800">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Monthly Growth:</span>
                                            <span className="font-mono font-bold">
                                                {col.monthlyGrowthPct}%/mo
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Projected Runway:</span>
                                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                                {col.runwayMonths >= 60
                                                    ? '60+ Months'
                                                    : `${col.runwayMonths} Months`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Breakeven Month:</span>
                                            <span className="font-mono font-bold">
                                                {col.breakevenMonth
                                                    ? `Month ${col.breakevenMonth}`
                                                    : 'Not Reached'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Month 18 ARR:</span>
                                            <span className="font-mono font-bold">
                                                {sym}
                                                {col.endingArrMonth18.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Month 18 Cash:</span>
                                            <span
                                                className={`font-mono font-bold ${col.endingCashMonth18 >= 0
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-rose-600 dark:text-rose-400'
                                                    }`}
                                            >
                                                {sym}
                                                {col.endingCashMonth18.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Financial Health Diagnostics */}
                        <div className="space-y-2.5">
                            {results.healthAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs ${alert.severity === 'CRITICAL'
                                            ? 'border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/30'
                                            : alert.severity === 'WARNING'
                                                ? 'border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30'
                                                : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30'
                                        }`}
                                >
                                    <div className="space-y-1">
                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                            {alert.severity === 'POSITIVE' ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            ) : (
                                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                            )}
                                            <span>{alert.title}</span>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300">
                                            {alert.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ========================================================================
                    TAB 4: SCENARIO-BASED M&A EXIT WATERFALL & SENIORITY CONTROLS
                   ======================================================================== */}
                {activeTab === 'exit_waterfall' && (
                    <div className="space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                            <div>
                                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                    Scenario-Based M&amp;A Exit Waterfall ({sym}10M to {sym}500M Exit)
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Configure preferred liquidation multiple, participation rights, SAFE conversion
                                    treatment, and seniority structure.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                <select
                                    value={`${state.liquidationPreferenceMultiple}_${state.liquidationParticipation}`}
                                    onChange={(e) => {
                                        const [mStr, pType] = e.target.value.split('_');
                                        setState((prev) => ({
                                            ...prev,
                                            liquidationPreferenceMultiple: Number(mStr) || 1,
                                            liquidationParticipation: pType as LiquidationPrefType,
                                        }));
                                    }}
                                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-2 font-semibold"
                                >
                                    <option value="1_NON_PARTICIPATING">1x Non-Participating</option>
                                    <option value="1_PARTICIPATING">1x Participating (Double Dip)</option>
                                    <option value="2_NON_PARTICIPATING">2x Non-Participating</option>
                                    <option value="2_PARTICIPATING">2x Participating</option>
                                </select>

                                <select
                                    value={state.safeLiquidationTreatment}
                                    onChange={(e) =>
                                        setState((prev) => ({
                                            ...prev,
                                            safeLiquidationTreatment: e.target
                                                .value as SafeLiquidationTreatment,
                                        }))
                                    }
                                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-2 font-semibold"
                                    title="Converted SAFE Liquidation Treatment"
                                >
                                    <option value="SHADOW_PREFERRED_1X">SAFE: 1x Shadow Preferred</option>
                                    <option value="CONVERT_TO_COMMON">SAFE: Convert to Common</option>
                                </select>

                                <select
                                    value={state.waterfallSeniorityMode}
                                    onChange={(e) =>
                                        setState((prev) => ({
                                            ...prev,
                                            waterfallSeniorityMode: e.target
                                                .value as WaterfallSeniorityMode,
                                        }))
                                    }
                                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-2 font-semibold"
                                    title="Preferred Seniority Tiering"
                                >
                                    <option value="SERIES_A_SENIOR_TO_SAFE">Series A Senior to SAFE</option>
                                    <option value="PARI_PASSU_EQUAL_TIER">Pari Passu (Equal Tier)</option>
                                </select>
                            </div>
                        </div>

                        <div className="w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200 dark:border-slate-800">
                            <table className="min-w-[720px] w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-900 dark:text-white">
                                    <tr>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800">Exit Valuation</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Founders Payout ({sym})</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Founders Share %</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">SAFE / Note Holders ({sym})</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Series A Investors ({sym})</th>
                                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Option Pool (ESOP) ({sym})</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {results.exitValuationTable.map((row) => (
                                        <tr
                                            key={row.exitValuation}
                                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                                        >
                                            <td className="p-3 font-bold font-mono">
                                                {sym}
                                                {(row.exitValuation / 1e6).toFixed(0)}M
                                            </td>
                                            <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                {sym}
                                                {row.foundersPayout.toLocaleString()}
                                            </td>
                                            <td className="p-3 text-right font-mono">
                                                {row.foundersSharePct}%
                                            </td>
                                            <td className="p-3 text-right font-mono">
                                                {sym}
                                                {row.safeHoldersPayout.toLocaleString()}
                                            </td>
                                            <td className="p-3 text-right font-mono">
                                                {sym}
                                                {row.seriesAInvestorsPayout.toLocaleString()}
                                            </td>
                                            <td className="p-3 text-right font-mono">
                                                {sym}
                                                {row.optionPoolPayout.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}