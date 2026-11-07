/**
 * KivaroTools — Client-Side SaaS Burn Rate, Cash Runway & Equity Dilution Calculator Engine
 * File: lib/saasBurnRateEngine.ts
 * Version: 3.0.0
 *
 * 100% Pure Startup Finance & Cap Table Mathematics • Zero Unrelated Jargon
 * Covers: Gross/Net Burn, Static vs. Dynamic Compounding Runway, Zero-Cash & Raise-By Dates,
 * Paul Graham Default Alive/Dead, David Sacks Burn Multiple, Target Runway Expense Solver,
 * Pre/Post-Money SAFE & Convertible Note Dilution, Option Pool Shuffle & Exit Payouts.
 */

export const SAAS_ENGINE_VERSION = '3.0.0';

export type SaasScenarioPresetId =
    | 'seed_saas_default_alive'
    | 'series_a_fundraising_bridge'
    | 'high_burn_cost_cut_needed'
    | 'bootstrapped_profitable_saas'
    | 'stacked_safe_dilution_demo';

export type ConvertibleNoteType =
    | 'POST_MONEY_SAFE'
    | 'PRE_MONEY_SAFE'
    | 'CONVERTIBLE_NOTE';

export type LiquidationPrefType =
    | 'NON_PARTICIPATING'
    | 'PARTICIPATING';

export type TrajectoryStatus =
    | 'DEFAULT_ALIVE'
    | 'DEFAULT_DEAD_RAISE_SOON'
    | 'DEFAULT_DEAD_CRITICAL';

export type BurnEfficiencyRating =
    | 'PROFITABLE'
    | 'ELITE_UNDER_1X'
    | 'GREAT_1X_TO_1_5X'
    | 'GOOD_1_5X_TO_2X'
    | 'HIGH_BURN_OVER_2X';

export interface PlannedHireItem {
    id: string;
    roleTitle: string;
    department: 'Engineering & Product' | 'Sales & Marketing' | 'Operations & G&A';
    headcount: number;
    monthlyFullyLoadedCost: number;
    startMonth: number; // 1..60
}

export interface ConvertibleTranche {
    id: string;
    label: string;
    instrumentType: ConvertibleNoteType;
    investmentAmount: number;
    valuationCap: number;
    discountPct: number;
    interestRatePct: number; // only for CONVERTIBLE_NOTE
    durationMonths: number; // only for CONVERTIBLE_NOTE
}

export interface SaasCalculatorState {
    companyName: string;
    presetId: SaasScenarioPresetId;
    currencyCode: string;
    currencySymbol: string;

    // 1. Core Cash, Revenue & Expense Inputs
    cashOnHand: number;
    monthlyRevenueMrr: number;
    monthlyOperatingExpenses: number;
    monthlyNetRevenueGrowthPct: number;
    monthlyExpenseGrowthPct: number;
    grossMarginPct: number;

    // 2. Target Runway & Runway Extension Levers
    targetRunwayMonths: number;
    plannedCostReductionMonthly: number;
    oneTimeCashInflowAmount: number;
    oneTimeCashInflowMonth: number;
    plannedHires: PlannedHireItem[];

    // 3. Cap Table, SAFE / Convertible Notes & Priced Round Inputs
    foundersInitialOwnershipPct: number; // e.g. 90%
    existingOptionPoolPct: number; // e.g. 10%
    initialTotalShares: number; // default 10,000,000
    convertibleNotes: ConvertibleTranche[];

    includeNextFundingRound: boolean;
    fundingRoundName: string;
    fundingRoundMonth: number; // 1..60 (injects cash into runway in this month)
    preMoneyValuation: number;
    newInvestmentAmount: number;
    targetPostRoundOptionPoolPct: number;
    optionPoolMode: 'PRE_MONEY_CARVEOUT' | 'POST_MONEY_SHARED';
    liquidationPreferenceMultiple: number; // 1x or 2x
    liquidationParticipation: LiquidationPrefType;
    targetExitValuation: number;
}

export interface MonthlyRunwayRow {
    month: number;
    dateLabel: string;
    startingCash: number;
    mrr: number;
    arr: number;
    grossProfit: number;
    baseExpenses: number;
    hiringExpenses: number;
    cogsExpenses: number;
    totalGrossBurn: number;
    fundingOrOneTimeInflow: number;
    netBurn: number;
    netCashFlow: number;
    endingCash: number;
    cumulativeBurn: number;
}

export interface CapTableStakeholder {
    id: string;
    name: string;
    group: 'FOUNDERS' | 'EXISTING_OPTION_POOL' | 'SAFE_NOTE_HOLDERS' | 'OPTION_POOL_TOPUP' | 'NEW_ROUND_INVESTORS';
    preRoundShares: number;
    preRoundPct: number;
    postSafeShares: number;
    postSafePct: number;
    postRoundShares: number;
    postRoundPct: number;
    investedAmount: number;
    effectiveSharePrice: number;
    postRoundPaperValue: number;
    dilutionPctPoints: number;
    exitPayoutAmount: number;
    exitPayoutPct: number;
    exitMultipleMoic: number;
}

export interface ScenarioComparisonColumn {
    name: string;
    subtitle: string;
    monthlyGrowthPct: number;
    monthlyExpenseGrowthPct: number;
    runwayMonths: number;
    breakevenMonth: number | null;
    endingCashMonth18: number;
    endingArrMonth18: number;
    status: TrajectoryStatus;
}

export interface FinancialHealthAlert {
    id: string;
    severity: 'CRITICAL' | 'WARNING' | 'POSITIVE';
    title: string;
    description: string;
    actionLabel: string;
}

export interface SaasCalculationOutput {
    // Core Burn & Runway KPIs
    grossBurnMonthly: number;
    netBurnMonthly: number;
    staticRunwayMonths: number; // simple Cash / Net Burn without growth
    dynamicRunwayMonths: number; // compounding month-by-month runway
    runwayExhausted: boolean;
    zeroCashDateLabel: string;
    raiseByDateLabel: string;
    mandatoryRaiseByMonth: number;
    breakevenMonth: number | null;
    breakevenDateLabel: string | null;
    minimumCashBalance: number;
    trajectoryStatus: TrajectoryStatus;

    // SaaS Capital Efficiency KPIs
    currentArr: number;
    month12Arr: number;
    netNewArrAnnualized: number;
    burnMultiple: number;
    burnEfficiencyRating: BurnEfficiencyRating;
    revenueCoverageRatioPct: number;
    netBurnDeficitRatioPct: number;

    // Target Runway & Breakeven Solver
    requiredMonthlyCostCutForTargetRunway: number;
    requiredMonthlyCostCutForDefaultAlive: number;
    requiredMonthlyGrowthPctForDefaultAlive: number;

    // Cap Table, SAFE Conversion & Priced Round Dilution KPIs
    initialShares: number;
    postRoundTotalShares: number;
    roundSharePrice: number;
    postMoneyValuation: number;
    totalSafeDilutionPct: number;
    optionPoolTopUpShares: number;
    optionPoolTopUpDilutionPct: number;
    newRoundInvestorPct: number;
    foundersPreRoundPct: number;
    foundersPostRoundPct: number;
    foundersTotalDilutionPctPoints: number;
    foundersPaperValuePostRound: number;
    foundersExitPayout: number;
    investorsExitPayout: number;
    optionPoolExitPayout: number;

    // Schedules, Tables & Scenarios
    monthlySchedule: MonthlyRunwayRow[];
    yearlySummary: {
        year: number;
        label: string;
        endingMrr: number;
        endingArr: number;
        totalRevenueCollected: number;
        totalExpensesPaid: number;
        netCashFlow: number;
        endingCash: number;
    }[];
    capTableRows: CapTableStakeholder[];
    exitValuationTable: {
        exitValuation: number;
        foundersPayout: number;
        foundersSharePct: number;
        safeHoldersPayout: number;
        seriesAInvestorsPayout: number;
        optionPoolPayout: number;
    }[];
    scenarioComparison: {
        conservative: ScenarioComparisonColumn;
        baseCase: ScenarioComparisonColumn;
        optimistic: ScenarioComparisonColumn;
    };
    healthAlerts: FinancialHealthAlert[];

    // Export Strings
    runwayCsv: string;
    capTableCsv: string;
    summaryMarkdown: string;
    shareableQueryString: string;
}

const textEncoder = new TextEncoder();

const CRC32_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        table[i] = c >>> 0;
    }
    return table;
})();

export function computeCrc32(bytes: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
        crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

/**
 * CWE-1236 Spreadsheet Formula Injection Sanitizer
 */
export function sanitizeSpreadsheetCell(val: unknown): string {
    const str = String(val ?? '');
    if (!str) return '';
    if (/^-[0-9]+(\.[0-9]+)?%?$/.test(str.trim())) {
        return str;
    }
    if (/^[=+\-@|\t\r]/.test(str)) {
        return `'${str}`;
    }
    return str;
}

/**
 * Simulate 60-Month Cash Flow Trajectory
 */
export function simulateRunwaySchedule(state: SaasCalculatorState): {
    monthlySchedule: MonthlyRunwayRow[];
    dynamicRunwayMonths: number;
    runwayExhausted: boolean;
    breakevenMonth: number | null;
    minimumCashBalance: number;
} {
    const rows: MonthlyRunwayRow[] = [];
    let currentCash = Math.max(0, state.cashOnHand);
    let currentMrr = Math.max(0, state.monthlyRevenueMrr);
    let currentBaseExpense = Math.max(
        0,
        state.monthlyOperatingExpenses - Math.max(0, state.plannedCostReductionMonthly)
    );

    const revGrowthRate = state.monthlyNetRevenueGrowthPct / 100;
    const expGrowthRate = Math.max(0, state.monthlyExpenseGrowthPct / 100);
    const grossMarginRatio = Math.min(1, Math.max(0.05, state.grossMarginPct / 100));

    let dynamicRunwayMonths = 60;
    let runwayExhausted = false;
    let breakevenMonth: number | null = null;
    let minimumCashBalance = currentCash;
    let cumulativeBurn = 0;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const baseYear = 2026;
    const baseMonthIdx = 10; // Nov 2026

    for (let m = 1; m <= 60; m++) {
        const startingCash = currentCash;
        const mrr = m === 1 ? currentMrr : Math.max(0, currentMrr * (1 + revGrowthRate));
        const arr = mrr * 12;

        // COGS from Gross Margin %
        const cogsExpenses = mrr * (1 - grossMarginRatio);
        const grossProfit = mrr - cogsExpenses;

        const baseExpenses =
            m === 1 ? currentBaseExpense : currentBaseExpense * (1 + expGrowthRate);

        // Planned Hires Payroll
        let hiringExpenses = 0;
        for (const hire of state.plannedHires) {
            if (m >= hire.startMonth && hire.headcount > 0 && hire.monthlyFullyLoadedCost > 0) {
                hiringExpenses += hire.headcount * hire.monthlyFullyLoadedCost;
            }
        }

        const totalGrossBurn = baseExpenses + hiringExpenses + cogsExpenses;

        // One-Time Cash Inflow or Scheduled Priced Funding Round Proceeds
        let fundingOrOneTimeInflow = 0;
        if (state.oneTimeCashInflowAmount !== 0 && state.oneTimeCashInflowMonth === m) {
            fundingOrOneTimeInflow += state.oneTimeCashInflowAmount;
        }
        if (
            state.includeNextFundingRound &&
            state.fundingRoundMonth === m &&
            state.newInvestmentAmount > 0
        ) {
            fundingOrOneTimeInflow += state.newInvestmentAmount;
        }

        const operationalNetCashFlow = mrr - totalGrossBurn;
        const netBurn = Math.max(0, totalGrossBurn - mrr);
        const netCashFlow = operationalNetCashFlow + fundingOrOneTimeInflow;
        const endingCash = startingCash + netCashFlow;

        if (netBurn > 0) {
            cumulativeBurn += netBurn;
        }

        // Detect exact fractional zero-cash month
        if (!runwayExhausted && endingCash <= 0) {
            runwayExhausted = true;
            const monthlyDeficit = Math.max(1, -netCashFlow);
            const fractionCovered = Math.min(1, Math.max(0, startingCash / monthlyDeficit));
            dynamicRunwayMonths = Number(((m - 1) + fractionCovered).toFixed(1));
        }

        // Detect operational breakeven month (MRR >= Total Gross Burn before running out of cash)
        if (!runwayExhausted && breakevenMonth === null && mrr >= totalGrossBurn && totalGrossBurn > 0) {
            breakevenMonth = m;
        }

        if (endingCash < minimumCashBalance) {
            minimumCashBalance = endingCash;
        }

        const absMonth = baseMonthIdx + (m - 1);
        const calYear = baseYear + Math.floor(absMonth / 12);
        const calMonth = monthNames[absMonth % 12];

        rows.push({
            month: m,
            dateLabel: `${calMonth} ${calYear} (M${m})`,
            startingCash,
            mrr,
            arr,
            grossProfit,
            baseExpenses,
            hiringExpenses,
            cogsExpenses,
            totalGrossBurn,
            fundingOrOneTimeInflow,
            netBurn,
            netCashFlow,
            endingCash,
            cumulativeBurn,
        });

        currentCash = endingCash;
        currentMrr = mrr;
        currentBaseExpense = baseExpenses;
    }

    return {
        monthlySchedule: rows,
        dynamicRunwayMonths,
        runwayExhausted,
        breakevenMonth,
        minimumCashBalance,
    };
}

/**
 * Solve Exact Monthly Expense Cut or Revenue Growth Required for Target Runway & Default Alive
 */
export function solveRunwayAndBreakevenTargets(state: SaasCalculatorState): {
    requiredMonthlyCostCutForTargetRunway: number;
    requiredMonthlyCostCutForDefaultAlive: number;
    requiredMonthlyGrowthPctForDefaultAlive: number;
} {
    const baseline = simulateRunwaySchedule(state);
    const targetMonths = Math.min(60, Math.max(1, state.targetRunwayMonths || 24));

    // 1. Solve Monthly Cost Cut for Target Runway
    let requiredMonthlyCostCutForTargetRunway = 0;
    if (baseline.runwayExhausted && baseline.dynamicRunwayMonths < targetMonths) {
        let low = 0;
        let high = state.monthlyOperatingExpenses;
        for (let i = 0; i < 25; i++) {
            const mid = (low + high) / 2;
            const sim = simulateRunwaySchedule({
                ...state,
                plannedCostReductionMonthly: state.plannedCostReductionMonthly + mid,
            });
            if (!sim.runwayExhausted || sim.dynamicRunwayMonths >= targetMonths) {
                requiredMonthlyCostCutForTargetRunway = mid;
                high = mid;
            } else {
                low = mid;
            }
        }
    }

    // 2. Solve Monthly Cost Cut for Default Alive (Breakeven before Cash hits 0)
    let requiredMonthlyCostCutForDefaultAlive = 0;
    const isCurrentlyDefaultAlive = !baseline.runwayExhausted && baseline.breakevenMonth !== null;
    if (!isCurrentlyDefaultAlive) {
        let low = 0;
        let high = state.monthlyOperatingExpenses;
        let bestCut = state.monthlyOperatingExpenses;
        for (let i = 0; i < 28; i++) {
            const mid = (low + high) / 2;
            const sim = simulateRunwaySchedule({
                ...state,
                plannedCostReductionMonthly: state.plannedCostReductionMonthly + mid,
            });
            if (!sim.runwayExhausted && sim.breakevenMonth !== null) {
                bestCut = mid;
                high = mid;
            } else {
                low = mid;
            }
        }
        requiredMonthlyCostCutForDefaultAlive = Math.ceil(bestCut);
    }

    // 3. Solve Monthly Revenue Growth % for Default Alive
    let requiredMonthlyGrowthPctForDefaultAlive = state.monthlyNetRevenueGrowthPct;
    if (!isCurrentlyDefaultAlive) {
        let low = state.monthlyNetRevenueGrowthPct;
        let high = 60.0;
        let bestGrowth = 60.0;
        for (let i = 0; i < 28; i++) {
            const mid = (low + high) / 2;
            const sim = simulateRunwaySchedule({
                ...state,
                monthlyNetRevenueGrowthPct: mid,
            });
            if (!sim.runwayExhausted && sim.breakevenMonth !== null) {
                bestGrowth = mid;
                high = mid;
            } else {
                low = mid;
            }
        }
        requiredMonthlyGrowthPctForDefaultAlive = Number((Math.ceil(bestGrowth * 10) / 10).toFixed(1));
    }

    return {
        requiredMonthlyCostCutForTargetRunway: Math.ceil(requiredMonthlyCostCutForTargetRunway),
        requiredMonthlyCostCutForDefaultAlive,
        requiredMonthlyGrowthPctForDefaultAlive,
    };
}

/**
 * Calculate Pre/Post-Money SAFE Conversions, Option Pool Top-Up & Priced Round Ownership Dilution
 */
export function calculateCapTableDilution(state: SaasCalculatorState): {
    initialShares: number;
    postRoundTotalShares: number;
    roundSharePrice: number;
    postMoneyValuation: number;
    totalSafeDilutionPct: number;
    optionPoolTopUpShares: number;
    optionPoolTopUpDilutionPct: number;
    newRoundInvestorPct: number;
    foundersPreRoundPct: number;
    foundersPostRoundPct: number;
    foundersTotalDilutionPctPoints: number;
    foundersPaperValuePostRound: number;
    foundersExitPayout: number;
    investorsExitPayout: number;
    optionPoolExitPayout: number;
    capTableRows: CapTableStakeholder[];
    exitValuationTable: SaasCalculationOutput['exitValuationTable'];
} {
    const initialShares = Math.max(100_000, state.initialTotalShares || 10_000_000);
    const foundersPrePct = Math.min(100, Math.max(1, state.foundersInitialOwnershipPct));
    const existingPoolPct = Math.min(100 - foundersPrePct, Math.max(0, state.existingOptionPoolPct));

    const founderInitialShares = Math.round(initialShares * (foundersPrePct / 100));
    const existingPoolShares = Math.max(0, initialShares - founderInitialShares);

    const preMoneyVal = Math.max(500_000, state.preMoneyValuation || 15_000_000);
    const newInvestment = state.includeNextFundingRound
        ? Math.max(0, state.newInvestmentAmount)
        : 0;
    const postMoneyValuation = preMoneyVal + newInvestment;

    const targetPoolRatio = state.includeNextFundingRound
        ? Math.min(0.4, Math.max(0, state.targetPostRoundOptionPoolPct / 100))
        : existingPoolShares / initialShares;

    // Solve simultaneously for Round Share Price, SAFE Converted Shares, and Option Pool Top-Up
    let roundSharePrice = preMoneyVal / initialShares;
    let optionPoolTopUpShares = 0;
    let newRoundInvestorShares = 0;
    let safeConvertedShares: number[] = state.convertibleNotes.map(() => 0);
    const safeConversionPrices: number[] = state.convertibleNotes.map(() => roundSharePrice);

    for (let iter = 0; iter < 35; iter++) {
        const sumSafeShares = safeConvertedShares.reduce((a, b) => a + b, 0);
        const postSafeCapitalization = initialShares + sumSafeShares;

        const preMoneyShareCountForRoundPrice =
            state.optionPoolMode === 'PRE_MONEY_CARVEOUT'
                ? initialShares + sumSafeShares + optionPoolTopUpShares
                : initialShares + sumSafeShares;

        roundSharePrice = preMoneyVal / Math.max(1, preMoneyShareCountForRoundPrice);

        const nextSafeShares: number[] = [];
        for (let i = 0; i < state.convertibleNotes.length; i++) {
            const note = state.convertibleNotes[i];
            if (note.investmentAmount <= 0) {
                nextSafeShares.push(0);
                continue;
            }
            const interestFactor =
                note.instrumentType === 'CONVERTIBLE_NOTE'
                    ? 1 + (Math.max(0, note.interestRatePct) / 100) * (Math.max(0, note.durationMonths) / 12)
                    : 1;
            const convertingPrincipal = note.investmentAmount * interestFactor;

            const discountMultiplier = 1 - Math.min(0.8, Math.max(0, note.discountPct / 100));
            const discountedPrice = roundSharePrice * discountMultiplier;

            let capPrice = Number.POSITIVE_INFINITY;
            if (note.valuationCap > 0) {
                if (note.instrumentType === 'POST_MONEY_SAFE') {
                    capPrice = note.valuationCap / Math.max(1, postSafeCapitalization);
                } else {
                    capPrice = note.valuationCap / Math.max(1, initialShares);
                }
            }

            const effectivePrice = Math.max(
                0.0001,
                Math.min(roundSharePrice, discountedPrice, capPrice)
            );
            safeConversionPrices[i] = effectivePrice;
            nextSafeShares.push(convertingPrincipal / effectivePrice);
        }

        safeConvertedShares = nextSafeShares;
        const totalSafeSh = safeConvertedShares.reduce((a, b) => a + b, 0);
        newRoundInvestorShares =
            state.includeNextFundingRound && newInvestment > 0
                ? newInvestment / Math.max(0.0001, roundSharePrice)
                : 0;

        const nonTopUpTotal = initialShares + totalSafeSh + newRoundInvestorShares;
        if (state.includeNextFundingRound && targetPoolRatio > 0 && targetPoolRatio < 0.85) {
            const reqTopUp =
                (targetPoolRatio * nonTopUpTotal - existingPoolShares) / (1 - targetPoolRatio);
            optionPoolTopUpShares = Math.max(0, reqTopUp);
        } else {
            optionPoolTopUpShares = 0;
        }
    }

    safeConvertedShares = safeConvertedShares.map((s) => Math.round(s));
    optionPoolTopUpShares = Math.round(optionPoolTopUpShares);
    newRoundInvestorShares = Math.round(newRoundInvestorShares);

    const totalSafeShares = safeConvertedShares.reduce((a, b) => a + b, 0);
    const postSafeTotalShares = initialShares + totalSafeShares;
    const postRoundTotalShares =
        initialShares + totalSafeShares + optionPoolTopUpShares + newRoundInvestorShares;

    // Evaluate M&A Exit Payout helper at any Exit Valuation
    const computeExitSplit = (exitVal: number) => {
        const netExit = Math.max(0, exitVal);
        const prefMultiple = Math.max(1, state.liquidationPreferenceMultiple || 1);
        const totalSafeInvested = state.convertibleNotes.reduce(
            (sum, n) => sum + Math.max(0, n.investmentAmount),
            0
        );
        const seriesAInvested = state.includeNextFundingRound ? newInvestment : 0;

        // Evaluate Series A Preferred and SAFE/Note Holders independently by seniority (Series A senior to Seed/SAFE)
        const seriesAPrefClaim = seriesAInvested * prefMultiple;
        const safePrefClaim = totalSafeInvested * 1; // Standard 1x on converted SAFEs

        const seriesAOwnershipRatio = newRoundInvestorShares / Math.max(1, postRoundTotalShares);
        const safeOwnershipRatio = totalSafeShares / Math.max(1, postRoundTotalShares);

        let remainingPool = netExit;
        let seriesAPrefPaid = 0;
        let safePrefPaid = 0;

        const seriesAConverts =
            state.liquidationParticipation === 'NON_PARTICIPATING' &&
            netExit * seriesAOwnershipRatio > seriesAPrefClaim;
        if (!seriesAConverts && seriesAInvested > 0) {
            seriesAPrefPaid = Math.min(remainingPool, seriesAPrefClaim);
            remainingPool = Math.max(0, remainingPool - seriesAPrefPaid);
        }

        const safeConverts =
            state.liquidationParticipation === 'NON_PARTICIPATING' &&
            netExit * safeOwnershipRatio > safePrefClaim;
        if (!safeConverts && totalSafeInvested > 0) {
            safePrefPaid = Math.min(remainingPool, safePrefClaim);
            remainingPool = Math.max(0, remainingPool - safePrefPaid);
        }

        const participatingCommonShares =
            founderInitialShares +
            existingPoolShares +
            optionPoolTopUpShares +
            (seriesAConverts || state.liquidationParticipation === 'PARTICIPATING'
                ? newRoundInvestorShares
                : 0) +
            (safeConverts || state.liquidationParticipation === 'PARTICIPATING'
                ? totalSafeShares
                : 0);

        const denomShares = Math.max(1, participatingCommonShares);

        const foundersPayout = Math.round(
            remainingPool * (founderInitialShares / denomShares)
        );
        const optionPoolPayout = Math.round(
            remainingPool * ((existingPoolShares + optionPoolTopUpShares) / denomShares)
        );
        const seriesAParticipation =
            seriesAConverts || state.liquidationParticipation === 'PARTICIPATING'
                ? remainingPool * (newRoundInvestorShares / denomShares)
                : 0;
        const safeParticipation =
            safeConverts || state.liquidationParticipation === 'PARTICIPATING'
                ? remainingPool * (totalSafeShares / denomShares)
                : 0;

        const seriesAInvestorsPayout = Math.round(seriesAPrefPaid + seriesAParticipation);
        const safeHoldersPayout = Math.round(safePrefPaid + safeParticipation);

        return {
            exitValuation: netExit,
            foundersPayout,
            foundersSharePct:
                netExit > 0 ? Number(((foundersPayout / netExit) * 100).toFixed(1)) : 0,
            safeHoldersPayout,
            seriesAInvestorsPayout,
            optionPoolPayout,
        };
    };

    const targetExitSplit = computeExitSplit(state.targetExitValuation || 100_000_000);
    const exitMilestones = [
        10_000_000,
        25_000_000,
        50_000_000,
        100_000_000,
        250_000_000,
        500_000_000,
    ].map((v) => computeExitSplit(v));

    // Build Stakeholder Cap Table Rows
    const capTableRows: CapTableStakeholder[] = [];

    const foundersPostRoundPct = Number(
        ((founderInitialShares / postRoundTotalShares) * 100).toFixed(2)
    );
    capTableRows.push({
        id: 'row_founders',
        name: 'Founders (Common Stock)',
        group: 'FOUNDERS',
        preRoundShares: founderInitialShares,
        preRoundPct: Number(foundersPrePct.toFixed(2)),
        postSafeShares: founderInitialShares,
        postSafePct: Number(((founderInitialShares / postSafeTotalShares) * 100).toFixed(2)),
        postRoundShares: founderInitialShares,
        postRoundPct: foundersPostRoundPct,
        investedAmount: 0,
        effectiveSharePrice: 0,
        postRoundPaperValue: Math.round(founderInitialShares * roundSharePrice),
        dilutionPctPoints: Number((foundersPostRoundPct - foundersPrePct).toFixed(2)),
        exitPayoutAmount: targetExitSplit.foundersPayout,
        exitPayoutPct: targetExitSplit.foundersSharePct,
        exitMultipleMoic: 0,
    });

    // Existing Option Pool + Top-Up
    const totalPoolSharesPostRound = existingPoolShares + optionPoolTopUpShares;
    const poolPostRoundPct = Number(
        ((totalPoolSharesPostRound / postRoundTotalShares) * 100).toFixed(2)
    );
    capTableRows.push({
        id: 'row_option_pool',
        name: `Employee Option Pool (ESOP${optionPoolTopUpShares > 0 ? ' + Top-Up' : ''})`,
        group: 'EXISTING_OPTION_POOL',
        preRoundShares: existingPoolShares,
        preRoundPct: Number(existingPoolPct.toFixed(2)),
        postSafeShares: existingPoolShares,
        postSafePct: Number(((existingPoolShares / postSafeTotalShares) * 100).toFixed(2)),
        postRoundShares: totalPoolSharesPostRound,
        postRoundPct: poolPostRoundPct,
        investedAmount: 0,
        effectiveSharePrice: 0,
        postRoundPaperValue: Math.round(totalPoolSharesPostRound * roundSharePrice),
        dilutionPctPoints: Number((poolPostRoundPct - existingPoolPct).toFixed(2)),
        exitPayoutAmount: targetExitSplit.optionPoolPayout,
        exitPayoutPct:
            state.targetExitValuation > 0
                ? Number(
                    ((targetExitSplit.optionPoolPayout / state.targetExitValuation) * 100).toFixed(1)
                )
                : 0,
        exitMultipleMoic: 0,
    });

    // Individual SAFE / Convertible Note Tranches
    state.convertibleNotes.forEach((note, idx) => {
        const sh = safeConvertedShares[idx] || 0;
        const pps = safeConversionPrices[idx] || roundSharePrice;
        const postSafePct = Number(((sh / postSafeTotalShares) * 100).toFixed(2));
        const postRoundPct = Number(((sh / postRoundTotalShares) * 100).toFixed(2));
        const trancheExitShare =
            totalSafeShares > 0
                ? Math.round(targetExitSplit.safeHoldersPayout * (sh / totalSafeShares))
                : 0;

        capTableRows.push({
            id: note.id,
            name: `${note.label} (${note.instrumentType === 'POST_MONEY_SAFE' ? 'Post-Money SAFE' : note.instrumentType === 'PRE_MONEY_SAFE' ? 'Pre-Money SAFE' : 'Conv. Note'})`,
            group: 'SAFE_NOTE_HOLDERS',
            preRoundShares: 0,
            preRoundPct: 0,
            postSafeShares: sh,
            postSafePct,
            postRoundShares: sh,
            postRoundPct,
            investedAmount: note.investmentAmount,
            effectiveSharePrice: Number(pps.toFixed(4)),
            postRoundPaperValue: Math.round(sh * roundSharePrice),
            dilutionPctPoints: postRoundPct,
            exitPayoutAmount: trancheExitShare,
            exitPayoutPct:
                state.targetExitValuation > 0
                    ? Number(((trancheExitShare / state.targetExitValuation) * 100).toFixed(1))
                    : 0,
            exitMultipleMoic:
                note.investmentAmount > 0
                    ? Number((trancheExitShare / note.investmentAmount).toFixed(2))
                    : 0,
        });
    });

    // New Priced Round Investors
    const newRoundInvestorPct = Number(
        ((newRoundInvestorShares / postRoundTotalShares) * 100).toFixed(2)
    );
    if (state.includeNextFundingRound && newRoundInvestorShares > 0) {
        capTableRows.push({
            id: 'row_new_round',
            name: `${state.fundingRoundName} Investors`,
            group: 'NEW_ROUND_INVESTORS',
            preRoundShares: 0,
            preRoundPct: 0,
            postSafeShares: 0,
            postSafePct: 0,
            postRoundShares: newRoundInvestorShares,
            postRoundPct: newRoundInvestorPct,
            investedAmount: newInvestment,
            effectiveSharePrice: Number(roundSharePrice.toFixed(4)),
            postRoundPaperValue: Math.round(newRoundInvestorShares * roundSharePrice),
            dilutionPctPoints: newRoundInvestorPct,
            exitPayoutAmount: targetExitSplit.seriesAInvestorsPayout,
            exitPayoutPct:
                state.targetExitValuation > 0
                    ? Number(
                        (
                            (targetExitSplit.seriesAInvestorsPayout /
                                state.targetExitValuation) *
                            100
                        ).toFixed(1)
                    )
                    : 0,
            exitMultipleMoic:
                newInvestment > 0
                    ? Number((targetExitSplit.seriesAInvestorsPayout / newInvestment).toFixed(2))
                    : 0,
        });
    }

    const totalSafeDilutionPct = Number(
        ((totalSafeShares / postRoundTotalShares) * 100).toFixed(2)
    );
    const optionPoolTopUpDilutionPct = Number(
        ((optionPoolTopUpShares / postRoundTotalShares) * 100).toFixed(2)
    );

    return {
        initialShares,
        postRoundTotalShares,
        roundSharePrice: Number(roundSharePrice.toFixed(4)),
        postMoneyValuation,
        totalSafeDilutionPct,
        optionPoolTopUpShares,
        optionPoolTopUpDilutionPct,
        newRoundInvestorPct,
        foundersPreRoundPct: Number(foundersPrePct.toFixed(2)),
        foundersPostRoundPct,
        foundersTotalDilutionPctPoints: Number((foundersPrePct - foundersPostRoundPct).toFixed(2)),
        foundersPaperValuePostRound: Math.round(founderInitialShares * roundSharePrice),
        foundersExitPayout: targetExitSplit.foundersPayout,
        investorsExitPayout:
            targetExitSplit.safeHoldersPayout + targetExitSplit.seriesAInvestorsPayout,
        optionPoolExitPayout: targetExitSplit.optionPoolPayout,
        capTableRows,
        exitValuationTable: exitMilestones,
    };
}

/**
 * Master Calculator Compiler
 */
export function calculateSaasBurnRunwayAndDilution(
    state: SaasCalculatorState
): SaasCalculationOutput {
    const sim = simulateRunwaySchedule(state);
    const solvers = solveRunwayAndBreakevenTargets(state);
    const cap = calculateCapTableDilution(state);

    const m1 = sim.monthlySchedule[0];
    const m12 = sim.monthlySchedule[11] || m1;

    const grossBurnMonthly = Math.round(m1.totalGrossBurn);
    const netBurnMonthly = Math.round(m1.netBurn);

    // Static Runway (Cash / Current Net Burn without compounding growth)
    const staticRunwayMonths =
        netBurnMonthly <= 0
            ? 60
            : Number(Math.min(60, state.cashOnHand / netBurnMonthly).toFixed(1));

    const mandatoryRaiseByMonth = sim.runwayExhausted
        ? Number(Math.max(0, sim.dynamicRunwayMonths - 6.0).toFixed(1))
        : 60;

    const zeroCashRow =
        sim.runwayExhausted && sim.monthlySchedule.length > 0
            ? sim.monthlySchedule[Math.min(59, Math.max(0, Math.ceil(sim.dynamicRunwayMonths) - 1))]
            : null;
    const zeroCashDateLabel = zeroCashRow
        ? zeroCashRow.dateLabel.split(' ')[0] + ' ' + zeroCashRow.dateLabel.split(' ')[1]
        : '60+ Months (Self-Sustaining)';

    const raiseByRow =
        sim.runwayExhausted && mandatoryRaiseByMonth >= 1
            ? sim.monthlySchedule[Math.min(59, Math.max(0, Math.floor(mandatoryRaiseByMonth) - 1))]
            : null;
    const raiseByDateLabel = raiseByRow
        ? raiseByRow.dateLabel.split(' ')[0] + ' ' + raiseByRow.dateLabel.split(' ')[1]
        : 'Optional (Default Alive)';

    const breakevenRow =
        sim.breakevenMonth !== null ? sim.monthlySchedule[sim.breakevenMonth - 1] : null;
    const breakevenDateLabel = breakevenRow
        ? breakevenRow.dateLabel.split(' ')[0] + ' ' + breakevenRow.dateLabel.split(' ')[1]
        : null;

    let trajectoryStatus: TrajectoryStatus = 'DEFAULT_ALIVE';
    if (sim.runwayExhausted) {
        trajectoryStatus =
            sim.dynamicRunwayMonths < 9.0 ? 'DEFAULT_DEAD_CRITICAL' : 'DEFAULT_DEAD_RAISE_SOON';
    } else if (sim.breakevenMonth === null && sim.monthlySchedule[59]?.netBurn > 0) {
        trajectoryStatus = 'DEFAULT_DEAD_RAISE_SOON';
    }

    // David Sacks Burn Multiple = Annualized Net Burn / Annualized Net New ARR
    const currentArr = Math.round(state.monthlyRevenueMrr * 12);
    const month12Arr = Math.round(m12.arr);
    const monthlyNetNewMrr =
        state.monthlyRevenueMrr * (state.monthlyNetRevenueGrowthPct / 100);
    const netNewArrAnnualized = Math.round(monthlyNetNewMrr * 12);
    const annualizedNetBurn = netBurnMonthly * 12;

    const burnMultiple =
        annualizedNetBurn <= 0
            ? 0
            : netNewArrAnnualized > 0
                ? Number((annualizedNetBurn / netNewArrAnnualized).toFixed(2))
                : 99.9;

    let burnEfficiencyRating: BurnEfficiencyRating = 'GOOD_1_5X_TO_2X';
    if (annualizedNetBurn <= 0) {
        burnEfficiencyRating = 'PROFITABLE';
    } else if (burnMultiple < 1.0) {
        burnEfficiencyRating = 'ELITE_UNDER_1X';
    } else if (burnMultiple <= 1.5) {
        burnEfficiencyRating = 'GREAT_1X_TO_1_5X';
    } else if (burnMultiple <= 2.0) {
        burnEfficiencyRating = 'GOOD_1_5X_TO_2X';
    } else {
        burnEfficiencyRating = 'HIGH_BURN_OVER_2X';
    }

    const totalOutflowM1 = Math.max(1, m1.mrr + netBurnMonthly);
    const revenueCoverageRatioPct = Number(((m1.mrr / totalOutflowM1) * 100).toFixed(1));
    const netBurnDeficitRatioPct = Number((100 - revenueCoverageRatioPct).toFixed(1));

    // 5-Year Yearly Summary
    const yearlySummary = [1, 2, 3, 4, 5].map((yr) => {
        const slice = sim.monthlySchedule.slice((yr - 1) * 12, yr * 12);
        const last = slice[slice.length - 1];
        return {
            year: yr,
            label: `Year ${yr} (M${(yr - 1) * 12 + 1}–M${yr * 12})`,
            endingMrr: Math.round(last.mrr),
            endingArr: Math.round(last.arr),
            totalRevenueCollected: Math.round(slice.reduce((a, b) => a + b.mrr, 0)),
            totalExpensesPaid: Math.round(slice.reduce((a, b) => a + b.totalGrossBurn, 0)),
            netCashFlow: Math.round(slice.reduce((a, b) => a + b.netCashFlow, 0)),
            endingCash: Math.round(last.endingCash),
        };
    });

    // 3-Scenario Comparison Matrix (Conservative / Base / Optimistic)
    const buildScenarioCol = (
        name: string,
        subtitle: string,
        growthDelta: number,
        expDelta: number
    ): ScenarioComparisonColumn => {
        const g = Math.max(0, Number((state.monthlyNetRevenueGrowthPct + growthDelta).toFixed(1)));
        const e = Math.max(0, Number((state.monthlyExpenseGrowthPct + expDelta).toFixed(1)));
        const sSim = simulateRunwaySchedule({
            ...state,
            monthlyNetRevenueGrowthPct: g,
            monthlyExpenseGrowthPct: e,
        });
        const m18 = sSim.monthlySchedule[17] || sSim.monthlySchedule[0];
        const status: TrajectoryStatus = sSim.runwayExhausted
            ? sSim.dynamicRunwayMonths < 9
                ? 'DEFAULT_DEAD_CRITICAL'
                : 'DEFAULT_DEAD_RAISE_SOON'
            : 'DEFAULT_ALIVE';
        return {
            name,
            subtitle,
            monthlyGrowthPct: g,
            monthlyExpenseGrowthPct: e,
            runwayMonths: sSim.dynamicRunwayMonths,
            breakevenMonth: sSim.breakevenMonth,
            endingCashMonth18: Math.round(m18.endingCash),
            endingArrMonth18: Math.round(m18.arr),
            status,
        };
    };

    const scenarioComparison = {
        conservative: buildScenarioCol(
            'Conservative (Slow Growth)',
            'Slower sales & +1.5% expense creep',
            -3.0,
            1.5
        ),
        baseCase: buildScenarioCol(
            'Base Case (Current Plan)',
            'Your active growth & expense settings',
            0,
            0
        ),
        optimistic: buildScenarioCol(
            'Optimistic (Accelerated)',
            '+3.5% faster MRR growth & lean spend',
            3.5,
            -0.5
        ),
    };

    // Actionable Financial Health Alerts
    const healthAlerts: FinancialHealthAlert[] = [];
    if (trajectoryStatus === 'DEFAULT_DEAD_CRITICAL') {
        healthAlerts.push({
            id: 'alert_critical_runway',
            severity: 'CRITICAL',
            title: `Critical Runway Alert: ${sim.dynamicRunwayMonths} Months Left (Under 9-Month Safety Threshold)`,
            description: `Typical venture rounds take 4 to 6 months to close. With ${sim.dynamicRunwayMonths} months of cash left, reduce monthly expenses by ${state.currencySymbol}${solvers.requiredMonthlyCostCutForDefaultAlive.toLocaleString()}/mo or bridge immediately.`,
            actionLabel: `Apply ${state.currencySymbol}${solvers.requiredMonthlyCostCutForDefaultAlive.toLocaleString()}/mo Expense Reduction`,
        });
    } else if (trajectoryStatus === 'DEFAULT_DEAD_RAISE_SOON') {
        healthAlerts.push({
            id: 'alert_default_dead',
            severity: 'WARNING',
            title: `Default Dead Trajectory: Cash Runs Out in Month ${sim.dynamicRunwayMonths} (Start Raising by Month ${mandatoryRaiseByMonth})`,
            description: `At ${state.monthlyNetRevenueGrowthPct}%/mo revenue growth, expenses outpace revenue before cash reaches zero. Lifting growth to ${solvers.requiredMonthlyGrowthPctForDefaultAlive}%/mo or trimming ${state.currencySymbol}${solvers.requiredMonthlyCostCutForDefaultAlive.toLocaleString()}/mo flips you to Default Alive.`,
            actionLabel: `Flip to Default Alive`,
        });
    } else {
        healthAlerts.push({
            id: 'alert_default_alive',
            severity: 'POSITIVE',
            title: `Default Alive: Reaches Cash Breakeven in Month ${sim.breakevenMonth ?? 1} (${breakevenDateLabel || 'Profitable'})`,
            description: `Your recurring revenue overtakes total monthly expenses with ${state.currencySymbol}${Math.round(sim.minimumCashBalance).toLocaleString()} in minimum cash reserves remaining.`,
            actionLabel: 'Trajectory Healthy',
        });
    }

    if (burnMultiple > 2.0 && netBurnMonthly > 0) {
        healthAlerts.push({
            id: 'alert_burn_multiple',
            severity: 'WARNING',
            title: `High Burn Multiple (${burnMultiple}x): Burning ${state.currencySymbol}${burnMultiple} per ${state.currencySymbol}1 of Net New ARR`,
            description: `Investors benchmark Seed/Series A SaaS startups for a Burn Multiple below 1.5x. Slowing non-essential hiring or increasing net revenue growth improves capital efficiency.`,
            actionLabel: 'Optimize Burn Multiple',
        });
    }

    if (cap.foundersPostRoundPct < 45) {
        healthAlerts.push({
            id: 'alert_founder_dilution',
            severity: 'WARNING',
            title: `High Founder Dilution: Founders Hold ${cap.foundersPostRoundPct}% After ${state.fundingRoundName}`,
            description: `Stacked SAFEs (${cap.totalSafeDilutionPct}% dilution) and the ${state.targetPostRoundOptionPoolPct}% option pool reduce founder ownership by ${cap.foundersTotalDilutionPctPoints} percentage points.`,
            actionLabel: 'Review Cap Table Terms',
        });
    }

    // Export Payloads
    const toCsvRow = (vals: (string | number)[]) =>
        vals
            .map((v) => {
                const s = sanitizeSpreadsheetCell(v).replace(/"/g, '""');
                return /[",\n\r]/.test(s) ? `"${s}"` : s;
            })
            .join(',');

    const runwayCsv =
        '\uFEFF' +
        [
            toCsvRow([
                'Month',
                'Date',
                'Starting_Cash',
                'Monthly_Revenue_MRR',
                'Annualized_ARR',
                'Base_Operating_Expenses',
                'Planned_Hiring_Expenses',
                'COGS_Expenses',
                'Total_Gross_Burn',
                'Funding_And_OneTime_Inflow',
                'Net_Burn',
                'Net_Cash_Flow',
                'Ending_Cash',
            ]),
            ...sim.monthlySchedule.map((r) =>
                toCsvRow([
                    r.month,
                    r.dateLabel,
                    Math.round(r.startingCash),
                    Math.round(r.mrr),
                    Math.round(r.arr),
                    Math.round(r.baseExpenses),
                    Math.round(r.hiringExpenses),
                    Math.round(r.cogsExpenses),
                    Math.round(r.totalGrossBurn),
                    Math.round(r.fundingOrOneTimeInflow),
                    Math.round(r.netBurn),
                    Math.round(r.netCashFlow),
                    Math.round(r.endingCash),
                ])
            ),
        ].join('\n');

    const capTableCsv =
        '\uFEFF' +
        [
            toCsvRow([
                'Stakeholder_Group',
                'Pre_Round_Shares',
                'Pre_Round_Ownership_Pct',
                'Post_SAFE_Shares',
                'Post_SAFE_Ownership_Pct',
                'Post_Round_Shares',
                'Post_Round_Ownership_Pct',
                'Invested_Capital',
                'Effective_Share_Price',
                'Post_Round_Paper_Value',
                'Projected_Exit_Payout',
                'Exit_MOIC',
            ]),
            ...cap.capTableRows.map((c) =>
                toCsvRow([
                    c.name,
                    c.preRoundShares,
                    c.preRoundPct,
                    c.postSafeShares,
                    c.postSafePct,
                    c.postRoundShares,
                    c.postRoundPct,
                    c.investedAmount,
                    c.effectiveSharePrice,
                    c.postRoundPaperValue,
                    c.exitPayoutAmount,
                    c.exitMultipleMoic,
                ])
            ),
        ].join('\n');

    const summaryMarkdown = [
        `# ${state.companyName} — SaaS Burn Rate, Runway & Dilution Summary`,
        ``,
        `## 1. Cash Burn & Runway Overview`,
        `- **Current Cash on Hand**: ${state.currencySymbol}${state.cashOnHand.toLocaleString()}`,
        `- **Monthly Recurring Revenue (MRR)**: ${state.currencySymbol}${state.monthlyRevenueMrr.toLocaleString()} (${state.currencySymbol}${currentArr.toLocaleString()} ARR)`,
        `- **Monthly Gross Burn**: ${state.currencySymbol}${grossBurnMonthly.toLocaleString()}/mo`,
        `- **Monthly Net Burn**: ${state.currencySymbol}${netBurnMonthly.toLocaleString()}/mo`,
        `- **Dynamic Cash Runway**: **${sim.runwayExhausted ? `${sim.dynamicRunwayMonths} Months (Zero Cash: ${zeroCashDateLabel})` : '60+ Months (Default Alive)'}**`,
        `- **Static Runway (Zero Growth)**: ${staticRunwayMonths} Months`,
        `- **Paul Graham Trajectory**: **${trajectoryStatus.replace(/_/g, ' ')}**${breakevenDateLabel ? ` (Breakeven in Month ${sim.breakevenMonth} — ${breakevenDateLabel})` : ` (Recommended Raise-By Date: ${raiseByDateLabel})`}`,
        `- **Burn Multiple (Net Burn / Net New ARR)**: **${burnMultiple}x**`,
        ``,
        `## 2. Cap Table & Equity Dilution (${state.fundingRoundName})`,
        `- **Pre-Money Valuation**: ${state.currencySymbol}${state.preMoneyValuation.toLocaleString()}`,
        `- **New Round Investment**: ${state.currencySymbol}${state.newInvestmentAmount.toLocaleString()} (Post-Money: ${state.currencySymbol}${cap.postMoneyValuation.toLocaleString()})`,
        `- **Round Share Price**: ${state.currencySymbol}${cap.roundSharePrice.toFixed(4)}/share`,
        `- **Founders Ownership**: ${cap.foundersPreRoundPct}% Pre-Round → **${cap.foundersPostRoundPct}% Post-Round** (-${cap.foundersTotalDilutionPctPoints}% dilution)`,
        `- **Projected Founder Exit Payout (@ ${state.currencySymbol}${state.targetExitValuation.toLocaleString()} Exit)**: **${state.currencySymbol}${cap.foundersExitPayout.toLocaleString()}**`,
    ].join('\n');

    const shareableQueryString = `?preset=${encodeURIComponent(state.presetId)}&cash=${state.cashOnHand}&mrr=${state.monthlyRevenueMrr}&opex=${state.monthlyOperatingExpenses}&growth=${state.monthlyNetRevenueGrowthPct}&expGrowth=${state.monthlyExpenseGrowthPct}&preVal=${state.preMoneyValuation}&newInv=${state.newInvestmentAmount}&pool=${state.targetPostRoundOptionPoolPct}&exit=${state.targetExitValuation}`;

    return {
        grossBurnMonthly,
        netBurnMonthly,
        staticRunwayMonths,
        dynamicRunwayMonths: sim.dynamicRunwayMonths,
        runwayExhausted: sim.runwayExhausted,
        zeroCashDateLabel,
        raiseByDateLabel,
        mandatoryRaiseByMonth,
        breakevenMonth: sim.breakevenMonth,
        breakevenDateLabel,
        minimumCashBalance: Math.round(sim.minimumCashBalance),
        trajectoryStatus,
        currentArr,
        month12Arr,
        netNewArrAnnualized,
        burnMultiple,
        burnEfficiencyRating,
        revenueCoverageRatioPct,
        netBurnDeficitRatioPct,
        requiredMonthlyCostCutForTargetRunway: solvers.requiredMonthlyCostCutForTargetRunway,
        requiredMonthlyCostCutForDefaultAlive: solvers.requiredMonthlyCostCutForDefaultAlive,
        requiredMonthlyGrowthPctForDefaultAlive: solvers.requiredMonthlyGrowthPctForDefaultAlive,
        initialShares: cap.initialShares,
        postRoundTotalShares: cap.postRoundTotalShares,
        roundSharePrice: cap.roundSharePrice,
        postMoneyValuation: cap.postMoneyValuation,
        totalSafeDilutionPct: cap.totalSafeDilutionPct,
        optionPoolTopUpShares: cap.optionPoolTopUpShares,
        optionPoolTopUpDilutionPct: cap.optionPoolTopUpDilutionPct,
        newRoundInvestorPct: cap.newRoundInvestorPct,
        foundersPreRoundPct: cap.foundersPreRoundPct,
        foundersPostRoundPct: cap.foundersPostRoundPct,
        foundersTotalDilutionPctPoints: cap.foundersTotalDilutionPctPoints,
        foundersPaperValuePostRound: cap.foundersPaperValuePostRound,
        foundersExitPayout: cap.foundersExitPayout,
        investorsExitPayout: cap.investorsExitPayout,
        optionPoolExitPayout: cap.optionPoolExitPayout,
        monthlySchedule: sim.monthlySchedule,
        yearlySummary,
        capTableRows: cap.capTableRows,
        exitValuationTable: cap.exitValuationTable,
        scenarioComparison,
        healthAlerts,
        runwayCsv,
        capTableCsv,
        summaryMarkdown,
        shareableQueryString,
    };
}

/**
 * Native 3-Sheet OpenXML Excel (.xlsx) Workbook Builder (Zero External Dependencies)
 */
export function exportSaasCalculatorXlsx(
    state: SaasCalculatorState,
    output?: SaasCalculationOutput
): Uint8Array {
    const data = output ?? calculateSaasBurnRunwayAndDilution(state);

    const xmlEscape = (str: string): string =>
        str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');

    const colLetter = (idx: number): string => {
        let s = '';
        let n = idx + 1;
        while (n > 0) {
            const rem = (n - 1) % 26;
            s = String.fromCharCode(65 + rem) + s;
            n = Math.floor((n - 1) / 26);
        }
        return s;
    };

    const buildSheetXml = (rows: (string | number)[][]): string => {
        const rowsXml = rows
            .map((row, rIdx) => {
                const rowNum = rIdx + 1;
                const cellsXml = row
                    .map((cellVal, cIdx) => {
                        const ref = `${colLetter(cIdx)}${rowNum}`;
                        const styleAttr = rIdx === 0 ? ' s="1"' : '';
                        if (typeof cellVal === 'number' && Number.isFinite(cellVal)) {
                            return `<c r="${ref}"${styleAttr}><v>${cellVal}</v></c>`;
                        }
                        const safeVal = xmlEscape(sanitizeSpreadsheetCell(cellVal));
                        return `<c r="${ref}" t="inlineStr"${styleAttr}><is><t>${safeVal}</t></is></c>`;
                    })
                    .join('');
                return `<row r="${rowNum}">${cellsXml}</row>`;
            })
            .join('');

        return (
            `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
            `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
            `<sheetData>${rowsXml}</sheetData>` +
            `</worksheet>`
        );
    };

    const sheet1Rows: (string | number)[][] = [
        [
            'Month',
            'Date',
            'Starting_Cash',
            'Monthly_Revenue_MRR',
            'Annualized_ARR',
            'Base_Operating_Expenses',
            'Planned_Hiring_Expenses',
            'COGS_Expenses',
            'Total_Gross_Burn',
            'Funding_Inflow',
            'Net_Burn',
            'Net_Cash_Flow',
            'Ending_Cash',
        ],
        ...data.monthlySchedule.map((r) => [
            r.month,
            r.dateLabel,
            Math.round(r.startingCash),
            Math.round(r.mrr),
            Math.round(r.arr),
            Math.round(r.baseExpenses),
            Math.round(r.hiringExpenses),
            Math.round(r.cogsExpenses),
            Math.round(r.totalGrossBurn),
            Math.round(r.fundingOrOneTimeInflow),
            Math.round(r.netBurn),
            Math.round(r.netCashFlow),
            Math.round(r.endingCash),
        ]),
    ];

    const sheet2Rows: (string | number)[][] = [
        [
            'Stakeholder_Group',
            'Pre_Round_Shares',
            'Pre_Round_Pct',
            'Post_SAFE_Shares',
            'Post_SAFE_Pct',
            'Post_Round_Shares',
            'Post_Round_Pct',
            'Invested_Amount',
            'Effective_Share_Price',
            'Post_Round_Paper_Value',
            'Projected_Exit_Payout',
            'Exit_MOIC',
        ],
        ...data.capTableRows.map((c) => [
            c.name,
            c.preRoundShares,
            c.preRoundPct,
            c.postSafeShares,
            c.postSafePct,
            c.postRoundShares,
            c.postRoundPct,
            c.investedAmount,
            c.effectiveSharePrice,
            c.postRoundPaperValue,
            c.exitPayoutAmount,
            c.exitMultipleMoic,
        ]),
    ];

    const sheet3Rows: (string | number)[][] = [
        [
            'Exit_Valuation',
            'Founders_Payout',
            'Founders_Share_Pct',
            'SAFE_Holders_Payout',
            'Series_A_Investors_Payout',
            'Employee_Option_Pool_Payout',
        ],
        ...data.exitValuationTable.map((e) => [
            e.exitValuation,
            e.foundersPayout,
            e.foundersSharePct,
            e.safeHoldersPayout,
            e.seriesAInvestorsPayout,
            e.optionPoolPayout,
        ]),
    ];

    const contentTypesXml =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
        `<Default Extension="xml" ContentType="application/xml"/>` +
        `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
        `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
        `<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
        `<Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
        `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
        `</Types>`;

    const rootRelsXml =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
        `</Relationships>`;

    const workbookXml =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
        `<sheets>` +
        `<sheet name="Runway_Schedule_60m" sheetId="1" r:id="rId1"/>` +
        `<sheet name="Cap_Table_Dilution" sheetId="2" r:id="rId2"/>` +
        `<sheet name="Exit_Payout_Comparison" sheetId="3" r:id="rId3"/>` +
        `</sheets>` +
        `</workbook>`;

    const workbookRelsXml =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
        `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>` +
        `<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>` +
        `<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
        `</Relationships>`;

    const stylesXml =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
        `<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>` +
        `<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>` +
        `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
        `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
        `<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>` +
        `</styleSheet>`;

    const zipEntries: { name: string; data: Uint8Array }[] = [
        { name: '[Content_Types].xml', data: textEncoder.encode(contentTypesXml) },
        { name: '_rels/.rels', data: textEncoder.encode(rootRelsXml) },
        { name: 'xl/workbook.xml', data: textEncoder.encode(workbookXml) },
        { name: 'xl/_rels/workbook.xml.rels', data: textEncoder.encode(workbookRelsXml) },
        { name: 'xl/styles.xml', data: textEncoder.encode(stylesXml) },
        { name: 'xl/worksheets/sheet1.xml', data: textEncoder.encode(buildSheetXml(sheet1Rows)) },
        { name: 'xl/worksheets/sheet2.xml', data: textEncoder.encode(buildSheetXml(sheet2Rows)) },
        { name: 'xl/worksheets/sheet3.xml', data: textEncoder.encode(buildSheetXml(sheet3Rows)) },
    ];

    const localParts: Uint8Array[] = [];
    const centralParts: Uint8Array[] = [];
    let offset = 0;

    for (const entry of zipEntries) {
        const nameBytes = textEncoder.encode(entry.name);
        const crc = computeCrc32(entry.data);
        const size = entry.data.length;

        const localHeader = new Uint8Array(30 + nameBytes.length);
        const lv = new DataView(localHeader.buffer);
        lv.setUint32(0, 0x04034b50, true);
        lv.setUint16(4, 20, true);
        lv.setUint16(6, 0, true);
        lv.setUint16(8, 0, true);
        lv.setUint16(10, 0, true);
        lv.setUint16(12, 0, true);
        lv.setUint32(14, crc, true);
        lv.setUint32(18, size, true);
        lv.setUint32(22, size, true);
        lv.setUint16(26, nameBytes.length, true);
        lv.setUint16(28, 0, true);
        localHeader.set(nameBytes, 30);

        localParts.push(localHeader, entry.data);

        const centralHeader = new Uint8Array(46 + nameBytes.length);
        const cv = new DataView(centralHeader.buffer);
        cv.setUint32(0, 0x02014b50, true);
        cv.setUint16(4, 20, true);
        cv.setUint16(6, 20, true);
        cv.setUint16(8, 0, true);
        cv.setUint16(10, 0, true);
        cv.setUint16(12, 0, true);
        cv.setUint16(14, 0, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, size, true);
        cv.setUint32(24, size, true);
        cv.setUint16(28, nameBytes.length, true);
        cv.setUint16(30, 0, true);
        cv.setUint16(32, 0, true);
        cv.setUint16(34, 0, true);
        cv.setUint16(36, 0, true);
        cv.setUint32(38, 0, true);
        cv.setUint32(42, offset, true);
        centralHeader.set(nameBytes, 46);

        centralParts.push(centralHeader);
        offset += localHeader.length + size;
    }

    const centralSize = centralParts.reduce((acc, p) => acc + p.length, 0);
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, zipEntries.length, true);
    ev.setUint16(10, zipEntries.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);
    ev.setUint16(20, 0, true);

    const totalLen = offset + centralSize + 22;
    const out = new Uint8Array(totalLen);
    let pos = 0;
    for (const p of localParts) {
        out.set(p, pos);
        pos += p.length;
    }
    for (const p of centralParts) {
        out.set(p, pos);
        pos += p.length;
    }
    out.set(eocd, pos);
    return out;
}

/**
 * 5 Clean, Practical Startup Scenario Presets
 */
export function getSaasScenarioPreset(presetId: SaasScenarioPresetId): SaasCalculatorState {
    if (presetId === 'seed_saas_default_alive') {
        return {
            companyName: 'CloudMetrics SaaS (Seed Stage)',
            presetId: 'seed_saas_default_alive',
            currencyCode: 'USD',
            currencySymbol: '$',
            cashOnHand: 1_500_000,
            monthlyRevenueMrr: 45_000,
            monthlyOperatingExpenses: 95_000,
            monthlyNetRevenueGrowthPct: 8.5,
            monthlyExpenseGrowthPct: 1.5,
            grossMarginPct: 82,
            targetRunwayMonths: 24,
            plannedCostReductionMonthly: 0,
            oneTimeCashInflowAmount: 0,
            oneTimeCashInflowMonth: 6,
            plannedHires: [
                {
                    id: 'hire_1',
                    roleTitle: 'Senior Full-Stack Engineer',
                    department: 'Engineering & Product',
                    headcount: 1,
                    monthlyFullyLoadedCost: 14_000,
                    startMonth: 4,
                },
                {
                    id: 'hire_2',
                    roleTitle: 'Account Executive (Sales)',
                    department: 'Sales & Marketing',
                    headcount: 1,
                    monthlyFullyLoadedCost: 11_000,
                    startMonth: 8,
                },
            ],
            foundersInitialOwnershipPct: 90,
            existingOptionPoolPct: 10,
            initialTotalShares: 10_000_000,
            convertibleNotes: [
                {
                    id: 'safe_1',
                    label: 'Pre-Seed Post-Money SAFE',
                    instrumentType: 'POST_MONEY_SAFE',
                    investmentAmount: 500_000,
                    valuationCap: 10_000_000,
                    discountPct: 0,
                    interestRatePct: 0,
                    durationMonths: 0,
                },
                {
                    id: 'safe_2',
                    label: 'Seed Post-Money SAFE',
                    instrumentType: 'POST_MONEY_SAFE',
                    investmentAmount: 1_000_000,
                    valuationCap: 15_000_000,
                    discountPct: 20,
                    interestRatePct: 0,
                    durationMonths: 0,
                },
            ],
            includeNextFundingRound: true,
            fundingRoundName: 'Series A Round',
            fundingRoundMonth: 15,
            preMoneyValuation: 28_000_000,
            newInvestmentAmount: 7_000_000,
            targetPostRoundOptionPoolPct: 10,
            optionPoolMode: 'PRE_MONEY_CARVEOUT',
            liquidationPreferenceMultiple: 1,
            liquidationParticipation: 'NON_PARTICIPATING',
            targetExitValuation: 100_000_000,
        };
    }

    if (presetId === 'series_a_fundraising_bridge') {
        const base = getSaasScenarioPreset('seed_saas_default_alive');
        return {
            ...base,
            companyName: 'ScaleFlow B2B (Series A Bridge)',
            presetId: 'series_a_fundraising_bridge',
            cashOnHand: 2_800_000,
            monthlyRevenueMrr: 140_000,
            monthlyOperatingExpenses: 260_000,
            monthlyNetRevenueGrowthPct: 6.5,
            monthlyExpenseGrowthPct: 2.0,
            grossMarginPct: 80,
            fundingRoundMonth: 12,
            preMoneyValuation: 40_000_000,
            newInvestmentAmount: 10_000_000,
            targetPostRoundOptionPoolPct: 12,
            targetExitValuation: 150_000_000,
        };
    }

    if (presetId === 'high_burn_cost_cut_needed') {
        const base = getSaasScenarioPreset('seed_saas_default_alive');
        return {
            ...base,
            companyName: 'RapidSpend SaaS (High Burn Alert)',
            presetId: 'high_burn_cost_cut_needed',
            cashOnHand: 680_000,
            monthlyRevenueMrr: 32_000,
            monthlyOperatingExpenses: 125_000,
            monthlyNetRevenueGrowthPct: 4.0,
            monthlyExpenseGrowthPct: 2.5,
            includeNextFundingRound: false,
        };
    }

    if (presetId === 'bootstrapped_profitable_saas') {
        const base = getSaasScenarioPreset('seed_saas_default_alive');
        return {
            ...base,
            companyName: 'IndiePulse SaaS (Bootstrapped)',
            presetId: 'bootstrapped_profitable_saas',
            cashOnHand: 250_000,
            monthlyRevenueMrr: 28_000,
            monthlyOperatingExpenses: 36_000,
            monthlyNetRevenueGrowthPct: 7.5,
            monthlyExpenseGrowthPct: 1.0,
            grossMarginPct: 88,
            plannedHires: [],
            foundersInitialOwnershipPct: 100,
            existingOptionPoolPct: 0,
            convertibleNotes: [],
            includeNextFundingRound: false,
            targetExitValuation: 25_000_000,
        };
    }

    // stacked_safe_dilution_demo
    const base = getSaasScenarioPreset('seed_saas_default_alive');
    return {
        ...base,
        companyName: 'CapStack Tech (Multiple SAFEs + Note)',
        presetId: 'stacked_safe_dilution_demo',
        convertibleNotes: [
            {
                id: 'safe_s1',
                label: 'Angel Pre-Seed SAFE',
                instrumentType: 'POST_MONEY_SAFE',
                investmentAmount: 400_000,
                valuationCap: 8_000_000,
                discountPct: 0,
                interestRatePct: 0,
                durationMonths: 0,
            },
            {
                id: 'safe_s2',
                label: 'Seed Round SAFE',
                instrumentType: 'POST_MONEY_SAFE',
                investmentAmount: 1_200_000,
                valuationCap: 12_000_000,
                discountPct: 20,
                interestRatePct: 0,
                durationMonths: 0,
            },
            {
                id: 'note_s3',
                label: 'Bridge Convertible Note (8% Interest)',
                instrumentType: 'CONVERTIBLE_NOTE',
                investmentAmount: 750_000,
                valuationCap: 16_000_000,
                discountPct: 20,
                interestRatePct: 8,
                durationMonths: 12,
            },
        ],
        preMoneyValuation: 24_000_000,
        newInvestmentAmount: 6_000_000,
        targetPostRoundOptionPoolPct: 15,
    };
}