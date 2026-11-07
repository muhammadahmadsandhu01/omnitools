/**
 * KivaroTools — Scenario-Based SaaS Burn Rate, Cash Runway & Equity Dilution Modeling Engine
 * File: lib/saasBurnRateEngine.ts
 * Version: 4.0.0
 *
 * Modular Domain Architecture:
 *   1. Burn & Runway Domain (`runBurnAndRunwayDomain`)
 *   2. SAFE Conversion Domain (`runSafeConversionDomain`)
 *   3. Convertible Note Domain (`runConvertibleNoteDomain`)
 *   4. Option Pool & Priced Round Domain (`runOptionPoolAndPricedRoundDomain`)
 *   5. M&A Liquidation Waterfall Domain (`runLiquidationWaterfallDomain`)
 *   6. Invariant & Conservation Verification Layer (`verifyFinancialModelInvariants`)
 */

export const SAAS_ENGINE_VERSION = '4.0.0';

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

export type SafeLiquidationTreatment =
    | 'SHADOW_PREFERRED_1X'
    | 'CONVERT_TO_COMMON';

export type WaterfallSeniorityMode =
    | 'SERIES_A_SENIOR_TO_SAFE'
    | 'PARI_PASSU_EQUAL_TIER';

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
    interestRatePct: number; // simple annual interest for CONVERTIBLE_NOTE
    durationMonths: number; // accrued months for CONVERTIBLE_NOTE
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
    raisePlanningBufferMonths: number; // default 6 months before zero-cash point
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

    // 4. M&A Liquidation Waterfall Modeling Assumptions
    liquidationPreferenceMultiple: number; // 1x or 2x on New Round Preferred
    liquidationParticipation: LiquidationPrefType;
    participationCapMultiple: number; // 0 = uncapped participation, >0 = e.g. 2x or 3x cap
    safeLiquidationTreatment: SafeLiquidationTreatment;
    waterfallSeniorityMode: WaterfallSeniorityMode;
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
    group:
    | 'FOUNDERS'
    | 'EXISTING_OPTION_POOL'
    | 'SAFE_NOTE_HOLDERS'
    | 'OPTION_POOL_TOPUP'
    | 'NEW_ROUND_INVESTORS';
    preRoundShares: number;
    preRoundPct: number;
    postSafeShares: number;
    postSafePct: number;
    postRoundShares: number;
    postRoundPct: number;
    investedAmount: number;
    accruedInterestAmount: number;
    convertingPrincipalAmount: number;
    effectiveSharePrice: number;
    conversionBasisLabel: string;
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

export interface ModelInvariantVerification {
    allPassed: boolean;
    capTablePreSafeSumPct: number;
    capTablePostSafeSumPct: number;
    capTablePostRoundSumPct: number;
    capTableShareCountConserved: boolean;
    postMoneySafeStandaloneOwnershipConserved: boolean;
    waterfallPayoutConserved: boolean;
    cashFlowAccountingConserved: boolean;
    grossProfitAndBurnConserved: boolean;
    checks: {
        id: string;
        label: string;
        passed: boolean;
        expected: string;
        actual: string;
    }[];
}

export interface SaasCalculationOutput {
    // Core Burn & Runway KPIs
    grossBurnMonthly: number;
    netBurnMonthly: number;
    uncappedStaticRunwayMonths: number; // raw Cash / Net Burn without 60m cap
    staticRunwayMonths: number; // capped at 60m for display consistency
    staticRunwayIsCappedAt60: boolean;
    dynamicRunwayMonths: number; // compounding 60m simulation (rounded to 1 decimal)
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
    netNewArrAnnualized: number; // Modeled Month-1 Forward Net New ARR
    trailing12MonthSimulatedNetNewArr: number; // Month 12 ARR - Initial ARR
    burnMultiple: number; // Modeled Burn Multiple
    burnEfficiencyRating: BurnEfficiencyRating;
    revenueCoverageRatioPct: number;
    netBurnDeficitRatioPct: number;

    // Target Runway & Breakeven Solver (within solver tolerance)
    requiredMonthlyCostCutForTargetRunway: number;
    requiredMonthlyCostCutForDefaultAlive: number;
    requiredMonthlyGrowthPctForDefaultAlive: number;

    // Cap Table, SAFE Conversion & Priced Round Dilution KPIs
    initialShares: number;
    postSafeTotalShares: number;
    postRoundTotalShares: number;
    roundSharePrice: number;
    postMoneyValuation: number;
    standalonePostMoneySafeDilutionPct: number; // sum of (Investment / Post-Money Cap)
    totalSafeDilutionPct: number; // post-round ownership % of all converted SAFEs/Notes
    optionPoolTopUpShares: number;
    optionPoolTopUpDilutionPct: number;
    newRoundInvestorPct: number;
    foundersPreRoundPct: number;
    foundersPostSafePct: number;
    foundersPostRoundPct: number;
    foundersTotalDilutionPctPoints: number;
    foundersPaperValuePostRound: number;
    foundersExitPayout: number;
    investorsExitPayout: number;
    optionPoolExitPayout: number;

    // Schedules, Tables, Scenarios & Verification
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
        totalDistributed: number;
    }[];
    scenarioComparison: {
        conservative: ScenarioComparisonColumn;
        baseCase: ScenarioComparisonColumn;
        optimistic: ScenarioComparisonColumn;
    };
    healthAlerts: FinancialHealthAlert[];
    invariantVerification: ModelInvariantVerification;

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
 * ============================================================================
 * DOMAIN 1: BURN RATE & 60-MONTH CASH RUNWAY SIMULATION ENGINE
 * ============================================================================
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

        // COGS derived from Gross Margin %
        const cogsExpenses = Number((mrr * ((100 - Math.min(100, Math.max(5, state.grossMarginPct))) / 100)).toFixed(2));
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

        // Estimate zero-cash point to one decimal month when cash crosses zero
        if (!runwayExhausted && endingCash <= 0) {
            runwayExhausted = true;
            const monthlyDeficit = Math.max(1, -netCashFlow);
            const fractionCovered = Math.min(1, Math.max(0, startingCash / monthlyDeficit));
            dynamicRunwayMonths = Number(((m - 1) + fractionCovered).toFixed(1));
        }

        // Calculator's Default Alive operational breakeven test (MRR >= Total Gross Burn before cash hits 0)
        if (
            !runwayExhausted &&
            breakevenMonth === null &&
            mrr >= totalGrossBurn &&
            totalGrossBurn > 0
        ) {
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
 * Binary-Search Target Runway & Default Alive Solver (28 Iterations within solver tolerance)
 */
export function solveRunwayAndBreakevenTargets(state: SaasCalculatorState): {
    requiredMonthlyCostCutForTargetRunway: number;
    requiredMonthlyCostCutForDefaultAlive: number;
    requiredMonthlyGrowthPctForDefaultAlive: number;
} {
    const baseline = simulateRunwaySchedule(state);
    const targetMonths = Math.min(60, Math.max(1, state.targetRunwayMonths || 24));

    let requiredMonthlyCostCutForTargetRunway = 0;
    if (baseline.runwayExhausted && baseline.dynamicRunwayMonths < targetMonths) {
        let low = 0;
        let high = state.monthlyOperatingExpenses;
        let best = state.monthlyOperatingExpenses;
        for (let i = 0; i < 28; i++) {
            const mid = (low + high) / 2;
            const sim = simulateRunwaySchedule({
                ...state,
                plannedCostReductionMonthly: state.plannedCostReductionMonthly + mid,
            });
            if (!sim.runwayExhausted || sim.dynamicRunwayMonths >= targetMonths) {
                best = mid;
                high = mid;
            } else {
                low = mid;
            }
        }
        requiredMonthlyCostCutForTargetRunway = Math.ceil(best);
    }

    let requiredMonthlyCostCutForDefaultAlive = 0;
    const isCurrentlyDefaultAlive =
        !baseline.runwayExhausted && baseline.breakevenMonth !== null;
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
        requiredMonthlyGrowthPctForDefaultAlive = Number(
            (Math.ceil(bestGrowth * 10) / 10).toFixed(1)
        );
    }

    return {
        requiredMonthlyCostCutForTargetRunway,
        requiredMonthlyCostCutForDefaultAlive,
        requiredMonthlyGrowthPctForDefaultAlive,
    };
}

/**
 * ============================================================================
 * DOMAIN 2 & 3: CONVERTIBLE NOTE & YC POST-MONEY / PRE-MONEY SAFE ENGINE
 * ============================================================================
 * Under YC Post-Money SAFE v1.1 mechanics:
 * - Each Post-Money SAFE converting at its Valuation Cap locks an ownership
 *   slice `alpha_i = Investment_i / PostMoneyCap_i` of the Post-SAFE
 *   Company Capitalization (prior to new Series A money and new Series A
 *   option pool expansion).
 * - Multiple Post-Money SAFEs stack additively (`Alpha_total = sum(alpha_i)`),
 *   so each Post-Money SAFE preserves its exact `alpha_i` pre-round ownership
 *   without diluting other Post-Money SAFEs!
 * - Pre-Money SAFEs and Convertible Notes (Principal * (1 + r * m/12))
 *   converting at a Pre-Money Cap divide their cap by `initialShares`.
 */
export interface EvaluatedConvertibleItem {
    tranche: ConvertibleTranche;
    accruedInterest: number;
    convertingPrincipal: number;
    convertedShares: number;
    effectiveSharePrice: number;
    conversionBasisLabel: string;
    standalonePostSafePct: number;
}

export function solveConvertiblesAndOptionPoolDomain(state: SaasCalculatorState): {
    initialShares: number;
    founderInitialShares: number;
    existingPoolShares: number;
    evaluatedConvertibles: EvaluatedConvertibleItem[];
    postSafeTotalShares: number;
    optionPoolTopUpShares: number;
    newRoundInvestorShares: number;
    postRoundTotalShares: number;
    roundSharePrice: number;
    postMoneyValuation: number;
    standalonePostMoneySafeDilutionPct: number;
} {
    const initialShares = Math.max(100_000, Math.round(state.initialTotalShares || 10_000_000));
    const foundersPrePct = Math.min(100, Math.max(1, state.foundersInitialOwnershipPct));
    const founderInitialShares = Math.round(initialShares * (foundersPrePct / 100));
    const existingPoolShares = Math.max(0, initialShares - founderInitialShares);

    const preMoneyVal = Math.max(500_000, state.preMoneyValuation || 15_000_000);
    const newInvestment = state.includeNextFundingRound
        ? Math.max(0, state.newInvestmentAmount)
        : 0;
    const postMoneyValuation = preMoneyVal + newInvestment;

    const targetPoolRatio = state.includeNextFundingRound
        ? Math.min(0.45, Math.max(0, state.targetPostRoundOptionPoolPct / 100))
        : existingPoolShares / initialShares;

    // Pre-calculate converting principal (including simple interest for Convertible Notes)
    const noteInputs = state.convertibleNotes.map((tranche) => {
        const inv = Math.max(0, tranche.investmentAmount);
        const accruedInterest =
            tranche.instrumentType === 'CONVERTIBLE_NOTE'
                ? inv *
                (Math.max(0, tranche.interestRatePct) / 100) *
                (Math.max(0, tranche.durationMonths) / 12)
                : 0;
        const convertingPrincipal = inv + accruedInterest;
        return { tranche, accruedInterest, convertingPrincipal };
    });

    // Solve simultaneously for Round Share Price, Post-Money SAFE exact ownership locks,
    // Pre-Money SAFE / Note conversions, and Option Pool Top-Up shares.
    let roundSharePrice = preMoneyVal / initialShares;
    let optionPoolTopUpShares = 0;
    let newRoundInvestorShares = 0;
    let convertedSharesList: number[] = noteInputs.map(() => 0);
    let conversionBasisList: string[] = noteInputs.map(() => 'Round Price');

    for (let iter = 0; iter < 45; iter++) {
        const currentTotalSafeShares = convertedSharesList.reduce((a, b) => a + b, 0);

        // Pre-money share count used to price the new round
        const preMoneySharesForRoundPricing =
            state.includeNextFundingRound && state.optionPoolMode === 'PRE_MONEY_CARVEOUT'
                ? initialShares + currentTotalSafeShares + optionPoolTopUpShares
                : initialShares + currentTotalSafeShares;

        roundSharePrice = preMoneyVal / Math.max(1, preMoneySharesForRoundPricing);

        // Determine for each convertible whether it converts via Post-Money Cap, Pre-Money Cap, or Discount
        // For YC Post-Money SAFEs converting on Cap, their exact ownership fraction of Post-SAFE Capitalization
        // is locked at alpha_i = convertingPrincipal / valuationCap.
        const postMoneyCapAlphas: number[] = [];
        const nonPostMoneyCapShares: number[] = [];
        const modePerNote: ('POST_CAP' | 'PRE_CAP' | 'DISCOUNT' | 'ROUND')[] = [];

        for (let i = 0; i < noteInputs.length; i++) {
            const { tranche, convertingPrincipal } = noteInputs[i];
            if (convertingPrincipal <= 0) {
                postMoneyCapAlphas.push(0);
                nonPostMoneyCapShares.push(0);
                modePerNote.push('ROUND');
                continue;
            }

            const discountMultiplier =
                1 - Math.min(0.8, Math.max(0, tranche.discountPct / 100));
            const discountPrice = roundSharePrice * discountMultiplier;

            if (tranche.instrumentType === 'POST_MONEY_SAFE') {
                // Tentative cap price based on current post-SAFE capitalization
                const tentativePostSafeTotal = Math.max(
                    initialShares,
                    initialShares + currentTotalSafeShares
                );
                const capPrice =
                    tranche.valuationCap > 0
                        ? tranche.valuationCap / tentativePostSafeTotal
                        : Number.POSITIVE_INFINITY;

                if (capPrice <= discountPrice && capPrice <= roundSharePrice && tranche.valuationCap > 0) {
                    const alpha = Math.min(
                        0.85,
                        convertingPrincipal / Math.max(1, tranche.valuationCap)
                    );
                    postMoneyCapAlphas.push(alpha);
                    nonPostMoneyCapShares.push(0);
                    modePerNote.push('POST_CAP');
                } else if (discountPrice < roundSharePrice) {
                    postMoneyCapAlphas.push(0);
                    nonPostMoneyCapShares.push(
                        convertingPrincipal / Math.max(0.0001, discountPrice)
                    );
                    modePerNote.push('DISCOUNT');
                } else {
                    postMoneyCapAlphas.push(0);
                    nonPostMoneyCapShares.push(
                        convertingPrincipal / Math.max(0.0001, roundSharePrice)
                    );
                    modePerNote.push('ROUND');
                }
            } else {
                // PRE_MONEY_SAFE or CONVERTIBLE_NOTE
                const preCapPrice =
                    tranche.valuationCap > 0
                        ? tranche.valuationCap / initialShares
                        : Number.POSITIVE_INFINITY;

                if (preCapPrice <= discountPrice && preCapPrice <= roundSharePrice) {
                    postMoneyCapAlphas.push(0);
                    nonPostMoneyCapShares.push(
                        convertingPrincipal / Math.max(0.0001, preCapPrice)
                    );
                    modePerNote.push('PRE_CAP');
                } else if (discountPrice < roundSharePrice) {
                    postMoneyCapAlphas.push(0);
                    nonPostMoneyCapShares.push(
                        convertingPrincipal / Math.max(0.0001, discountPrice)
                    );
                    modePerNote.push('DISCOUNT');
                } else {
                    postMoneyCapAlphas.push(0);
                    nonPostMoneyCapShares.push(
                        convertingPrincipal / Math.max(0.0001, roundSharePrice)
                    );
                    modePerNote.push('ROUND');
                }
            }
        }

        // Exact Closed-Form Resolution of Post-SAFE Total Shares (`S_post_safe`):
        // Every Post-Money SAFE i converting on its cap receives `alpha_i * S_post_safe` shares.
        // Therefore: S_post_safe = initialShares + sum(nonPostMoneyCapShares) + S_post_safe * sum(postMoneyCapAlphas)
        // => S_post_safe = (initialShares + sum(nonPostMoneyCapShares)) / (1 - sum(postMoneyCapAlphas))
        const sumAlphas = Math.min(
            0.9,
            postMoneyCapAlphas.reduce((a, b) => a + b, 0)
        );
        const sumOtherConvertibleShares = nonPostMoneyCapShares.reduce((a, b) => a + b, 0);
        const exactPostSafeTotalShares =
            (initialShares + sumOtherConvertibleShares) / Math.max(0.1, 1 - sumAlphas);

        const nextConvertedShares: number[] = [];
        const nextBasisLabels: string[] = [];

        for (let i = 0; i < noteInputs.length; i++) {
            const { tranche } = noteInputs[i];
            const mode = modePerNote[i];
            if (mode === 'POST_CAP') {
                nextConvertedShares.push(postMoneyCapAlphas[i] * exactPostSafeTotalShares);
                nextBasisLabels.push(
                    `Post-Money Cap (${(postMoneyCapAlphas[i] * 100).toFixed(2)}% Lock)`
                );
            } else if (mode === 'PRE_CAP') {
                nextConvertedShares.push(nonPostMoneyCapShares[i]);
                nextBasisLabels.push('Pre-Money Cap');
            } else if (mode === 'DISCOUNT') {
                nextConvertedShares.push(nonPostMoneyCapShares[i]);
                nextBasisLabels.push(`${tranche.discountPct}% Discount`);
            } else {
                nextConvertedShares.push(nonPostMoneyCapShares[i]);
                nextBasisLabels.push('Round Price');
            }
        }

        convertedSharesList = nextConvertedShares;
        conversionBasisList = nextBasisLabels;

        const sumSafeSh = convertedSharesList.reduce((a, b) => a + b, 0);
        newRoundInvestorShares =
            state.includeNextFundingRound && newInvestment > 0
                ? newInvestment / Math.max(0.0001, roundSharePrice)
                : 0;

        const nonTopUpTotal = initialShares + sumSafeSh + newRoundInvestorShares;
        if (state.includeNextFundingRound && targetPoolRatio > 0 && targetPoolRatio < 0.85) {
            const reqTopUp =
                (targetPoolRatio * nonTopUpTotal - existingPoolShares) / (1 - targetPoolRatio);
            optionPoolTopUpShares = Math.max(0, reqTopUp);
        } else {
            optionPoolTopUpShares = 0;
        }
    }

    // Round share counts to whole integers while preserving exact sum invariants
    convertedSharesList = convertedSharesList.map((s) => Math.round(s));
    optionPoolTopUpShares = Math.round(optionPoolTopUpShares);
    newRoundInvestorShares = Math.round(newRoundInvestorShares);

    const totalSafeShares = convertedSharesList.reduce((a, b) => a + b, 0);
    const postSafeTotalShares = initialShares + totalSafeShares;
    const postRoundTotalShares =
        initialShares + totalSafeShares + optionPoolTopUpShares + newRoundInvestorShares;

    const evaluatedConvertibles: EvaluatedConvertibleItem[] = noteInputs.map((item, idx) => {
        const sh = convertedSharesList[idx] || 0;
        const effPrice = sh > 0 ? item.convertingPrincipal / sh : roundSharePrice;
        return {
            tranche: item.tranche,
            accruedInterest: Math.round(item.accruedInterest),
            convertingPrincipal: Math.round(item.convertingPrincipal),
            convertedShares: sh,
            effectiveSharePrice: Number(effPrice.toFixed(4)),
            conversionBasisLabel: conversionBasisList[idx] || 'Round Price',
            standalonePostSafePct: Number(((sh / postSafeTotalShares) * 100).toFixed(2)),
        };
    });

    const standalonePostMoneySafeDilutionPct = Number(
        ((totalSafeShares / postSafeTotalShares) * 100).toFixed(2)
    );

    return {
        initialShares,
        founderInitialShares,
        existingPoolShares,
        evaluatedConvertibles,
        postSafeTotalShares,
        optionPoolTopUpShares,
        newRoundInvestorShares,
        postRoundTotalShares,
        roundSharePrice: Number(roundSharePrice.toFixed(4)),
        postMoneyValuation,
        standalonePostMoneySafeDilutionPct,
    };
}

/**
 * ============================================================================
 * DOMAIN 5: SCENARIO-BASED M&A LIQUIDATION WATERFALL ENGINE
 * ============================================================================
 * Explicitly models:
 * - Seniority Mode: Series A Senior to Converted SAFE/Seed vs. Pari Passu (Equal Tier)
 * - SAFE Liquidation Treatment: 1x Shadow Preferred Claim vs. Convert to Common
 * - Participation Mode: Non-Participating vs. Participating (with optional Participation Cap)
 * - Exact Total Distribution Conservation (Founders + SAFEs + Series A + Option Pool === Exit Valuation)
 */
export function evaluateExitWaterfallAtValuation(
    exitVal: number,
    state: SaasCalculatorState,
    capDomain: ReturnType<typeof solveConvertiblesAndOptionPoolDomain>
): {
    exitValuation: number;
    foundersPayout: number;
    foundersSharePct: number;
    safeHoldersPayout: number;
    seriesAInvestorsPayout: number;
    optionPoolPayout: number;
    totalDistributed: number;
} {
    const netExit = Math.max(0, Math.round(exitVal));
    if (netExit === 0) {
        return {
            exitValuation: 0,
            foundersPayout: 0,
            foundersSharePct: 0,
            safeHoldersPayout: 0,
            seriesAInvestorsPayout: 0,
            optionPoolPayout: 0,
            totalDistributed: 0,
        };
    }

    const {
        founderInitialShares,
        existingPoolShares,
        evaluatedConvertibles,
        optionPoolTopUpShares,
        newRoundInvestorShares,
        postRoundTotalShares,
    } = capDomain;

    const totalSafeShares = evaluatedConvertibles.reduce((a, b) => a + b.convertedShares, 0);
    const totalSafeInvested = evaluatedConvertibles.reduce(
        (a, b) => a + b.convertingPrincipal,
        0
    );
    const seriesAInvested = state.includeNextFundingRound
        ? Math.max(0, state.newInvestmentAmount)
        : 0;

    const prefMultiple = Math.max(1, state.liquidationPreferenceMultiple || 1);
    const seriesAPrefClaim = seriesAInvested * prefMultiple;
    const safePrefClaim =
        state.safeLiquidationTreatment === 'SHADOW_PREFERRED_1X' ? totalSafeInvested : 0;

    const seriesAOwnership = newRoundInvestorShares / Math.max(1, postRoundTotalShares);
    const safeOwnership = totalSafeShares / Math.max(1, postRoundTotalShares);

    // Determine whether each preferred class converts to common or takes preference
    const capMult = state.participationCapMultiple > 0 ? state.participationCapMultiple : 0;

    const seriesAConverts =
        seriesAInvested <= 0 ||
        (state.liquidationParticipation === 'NON_PARTICIPATING' &&
            netExit * seriesAOwnership > seriesAPrefClaim) ||
        (state.liquidationParticipation === 'PARTICIPATING' &&
            capMult > 0 &&
            netExit * seriesAOwnership > seriesAInvested * capMult);

    const safeConverts =
        totalSafeInvested <= 0 ||
        state.safeLiquidationTreatment === 'CONVERT_TO_COMMON' ||
        netExit * safeOwnership > safePrefClaim;

    let remainingProceeds = netExit;
    let seriesAPrefPaid = 0;
    let safePrefPaid = 0;

    if (state.waterfallSeniorityMode === 'PARI_PASSU_EQUAL_TIER') {
        const activeSeriesAClaim = seriesAConverts ? 0 : seriesAPrefClaim;
        const activeSafeClaim = safeConverts ? 0 : safePrefClaim;
        const combinedClaim = activeSeriesAClaim + activeSafeClaim;
        if (combinedClaim > 0) {
            const totalPrefPaid = Math.min(remainingProceeds, combinedClaim);
            seriesAPrefPaid = totalPrefPaid * (activeSeriesAClaim / combinedClaim);
            safePrefPaid = totalPrefPaid * (activeSafeClaim / combinedClaim);
            remainingProceeds = Math.max(0, remainingProceeds - totalPrefPaid);
        }
    } else {
        // SERIES_A_SENIOR_TO_SAFE (Standard Tiered Seniority)
        if (!seriesAConverts && seriesAPrefClaim > 0) {
            seriesAPrefPaid = Math.min(remainingProceeds, seriesAPrefClaim);
            remainingProceeds = Math.max(0, remainingProceeds - seriesAPrefPaid);
        }
        if (!safeConverts && safePrefClaim > 0) {
            safePrefPaid = Math.min(remainingProceeds, safePrefClaim);
            remainingProceeds = Math.max(0, remainingProceeds - safePrefPaid);
        }
    }

    // Distribute remaining proceeds among Common, Option Pool, Converted Preferred, and Participating Preferred
    const totalOptionPoolShares = existingPoolShares + optionPoolTopUpShares;
    const seriesAParticipatesInRemainder =
        seriesAConverts || state.liquidationParticipation === 'PARTICIPATING';
    const safeParticipatesInRemainder = safeConverts;

    const participatingSharesTotal = Math.max(
        1,
        founderInitialShares +
        totalOptionPoolShares +
        (seriesAParticipatesInRemainder ? newRoundInvestorShares : 0) +
        (safeParticipatesInRemainder ? totalSafeShares : 0)
    );

    let seriesARemainderCut = seriesAParticipatesInRemainder
        ? remainingProceeds * (newRoundInvestorShares / participatingSharesTotal)
        : 0;

    // Enforce Participation Cap if configured on Participating Preferred
    if (
        !seriesAConverts &&
        state.liquidationParticipation === 'PARTICIPATING' &&
        capMult > 0
    ) {
        const maxAllowedSeriesATotal = seriesAInvested * capMult;
        const maxAllowedExtra = Math.max(0, maxAllowedSeriesATotal - seriesAPrefPaid);
        if (seriesARemainderCut > maxAllowedExtra) {
            seriesARemainderCut = maxAllowedExtra;
        }
    }

    const poolAfterSeriesAParticipation = Math.max(0, remainingProceeds - seriesARemainderCut);
    const nonSeriesAParticipatingShares = Math.max(
        1,
        founderInitialShares +
        totalOptionPoolShares +
        (safeParticipatesInRemainder ? totalSafeShares : 0)
    );

    const safeRemainderCut = safeParticipatesInRemainder
        ? poolAfterSeriesAParticipation * (totalSafeShares / nonSeriesAParticipatingShares)
        : 0;
    const optionPoolCut =
        poolAfterSeriesAParticipation *
        (totalOptionPoolShares / nonSeriesAParticipatingShares);

    const seriesAInvestorsPayout = Math.round(seriesAPrefPaid + seriesARemainderCut);
    const safeHoldersPayout = Math.round(safePrefPaid + safeRemainderCut);
    const optionPoolPayout = Math.round(optionPoolCut);

    // Exact Conservation Guard: Founders receive the exact residual dollar so sum === netExit
    const foundersPayout = Math.max(
        0,
        netExit - seriesAInvestorsPayout - safeHoldersPayout - optionPoolPayout
    );

    return {
        exitValuation: netExit,
        foundersPayout,
        foundersSharePct: Number(((foundersPayout / netExit) * 100).toFixed(1)),
        safeHoldersPayout,
        seriesAInvestorsPayout,
        optionPoolPayout,
        totalDistributed:
            foundersPayout + safeHoldersPayout + seriesAInvestorsPayout + optionPoolPayout,
    };
}

/**
 * ============================================================================
 * DOMAIN 6: INVARIANT & CONSERVATION VERIFICATION LAYER
 * ============================================================================
 */
export function verifyFinancialModelInvariants(
    state: SaasCalculatorState,
    monthlySchedule: MonthlyRunwayRow[],
    capDomain: ReturnType<typeof solveConvertiblesAndOptionPoolDomain>,
    capTableRows: CapTableStakeholder[],
    targetExitSplit: ReturnType<typeof evaluateExitWaterfallAtValuation>
): ModelInvariantVerification {
    const preRoundSumPct = Number(
        capTableRows.reduce((a, b) => a + b.preRoundPct, 0).toFixed(2)
    );
    const postSafeSumPct = Number(
        capTableRows.reduce((a, b) => a + b.postSafePct, 0).toFixed(2)
    );
    const postRoundSumPct = Number(
        capTableRows.reduce((a, b) => a + b.postRoundPct, 0).toFixed(2)
    );

    const sumPostRoundShares = capTableRows.reduce((a, b) => a + b.postRoundShares, 0);
    const capTableShareCountConserved =
        sumPostRoundShares === capDomain.postRoundTotalShares;

    // Verify Post-Money SAFE standalone ownership lock: each Post-Money SAFE converting on cap
    // must match Investment / Valuation Cap within 0.05% rounding tolerance
    let postMoneySafeStandaloneOwnershipConserved = true;
    for (const ev of capDomain.evaluatedConvertibles) {
        if (
            ev.tranche.instrumentType === 'POST_MONEY_SAFE' &&
            ev.conversionBasisLabel.startsWith('Post-Money Cap') &&
            ev.tranche.valuationCap > 0
        ) {
            const expectedPct =
                (ev.convertingPrincipal / ev.tranche.valuationCap) * 100;
            if (Math.abs(ev.standalonePostSafePct - expectedPct) > 0.06) {
                postMoneySafeStandaloneOwnershipConserved = false;
            }
        }
    }

    const waterfallPayoutConserved =
        targetExitSplit.totalDistributed === targetExitSplit.exitValuation;

    let cashFlowAccountingConserved = true;
    let grossProfitAndBurnConserved = true;
    for (const r of monthlySchedule) {
        if (Math.abs(r.startingCash + r.netCashFlow - r.endingCash) > 0.01) {
            cashFlowAccountingConserved = false;
        }
        if (Math.abs(r.mrr - r.cogsExpenses - r.grossProfit) > 0.01) {
            grossProfitAndBurnConserved = false;
        }
        const expectedNetBurn = Math.max(0, r.totalGrossBurn - r.mrr);
        if (Math.abs(r.netBurn - expectedNetBurn) > 0.01) {
            grossProfitAndBurnConserved = false;
        }
    }

    const checks = [
        {
            id: 'inv_cap_100',
            label: 'Post-Round Cap Table Ownership Sum',
            passed: Math.abs(postRoundSumPct - 100) <= 0.15,
            expected: '100.00% (±0.15%)',
            actual: `${postRoundSumPct.toFixed(2)}%`,
        },
        {
            id: 'inv_shares_sum',
            label: 'Fully Diluted Integer Share Conservation',
            passed: capTableShareCountConserved,
            expected: `${capDomain.postRoundTotalShares.toLocaleString()} shares`,
            actual: `${sumPostRoundShares.toLocaleString()} shares`,
        },
        {
            id: 'inv_post_safe_lock',
            label: 'YC Post-Money SAFE Pre-Round Ownership Lock (Investment ÷ Cap)',
            passed: postMoneySafeStandaloneOwnershipConserved,
            expected: 'Exact additive pre-Series A ownership lock',
            actual: postMoneySafeStandaloneOwnershipConserved
                ? `Verified (${capDomain.standalonePostMoneySafeDilutionPct}% Post-SAFE)`
                : 'Deviation detected',
        },
        {
            id: 'inv_waterfall_sum',
            label: 'M&A Exit Waterfall Payout Conservation',
            passed: waterfallPayoutConserved,
            expected: `${state.currencySymbol}${targetExitSplit.exitValuation.toLocaleString()}`,
            actual: `${state.currencySymbol}${targetExitSplit.totalDistributed.toLocaleString()}`,
        },
        {
            id: 'inv_cashflow_continuity',
            label: '60-Month Cash Flow Continuity (Starting Cash + Net Flow = Ending Cash)',
            passed: cashFlowAccountingConserved && grossProfitAndBurnConserved,
            expected: '60/60 months reconciled',
            actual:
                cashFlowAccountingConserved && grossProfitAndBurnConserved
                    ? '60/60 months reconciled'
                    : 'Mismatch detected',
        },
    ];

    const allPassed = checks.every((c) => c.passed);

    return {
        allPassed,
        capTablePreSafeSumPct: preRoundSumPct,
        capTablePostSafeSumPct: postSafeSumPct,
        capTablePostRoundSumPct: postRoundSumPct,
        capTableShareCountConserved,
        postMoneySafeStandaloneOwnershipConserved,
        waterfallPayoutConserved,
        cashFlowAccountingConserved,
        grossProfitAndBurnConserved,
        checks,
    };
}

/**
 * ============================================================================
 * MASTER CALCULATOR ORCHESTRATOR
 * ============================================================================
 */
export function calculateSaasBurnRunwayAndDilution(
    state: SaasCalculatorState
): SaasCalculationOutput {
    const sim = simulateRunwaySchedule(state);
    const solvers = solveRunwayAndBreakevenTargets(state);
    const capDomain = solveConvertiblesAndOptionPoolDomain(state);

    const m1 = sim.monthlySchedule[0];
    const m12 = sim.monthlySchedule[11] || m1;

    const grossBurnMonthly = Math.round(m1.totalGrossBurn);
    const netBurnMonthly = Math.round(m1.netBurn);

    // Uncapped vs Capped Static Runway (Cash / Current Net Burn assuming 0% growth)
    const uncappedStaticRunwayMonths =
        netBurnMonthly <= 0
            ? 999
            : Number((state.cashOnHand / netBurnMonthly).toFixed(1));
    const staticRunwayIsCappedAt60 = uncappedStaticRunwayMonths > 60;
    const staticRunwayMonths = Number(
        Math.min(60, uncappedStaticRunwayMonths).toFixed(1)
    );

    const bufferMonths = Math.max(1, state.raisePlanningBufferMonths || 6);
    const mandatoryRaiseByMonth = sim.runwayExhausted
        ? Number(Math.max(0, sim.dynamicRunwayMonths - bufferMonths).toFixed(1))
        : 60;

    const zeroCashRow =
        sim.runwayExhausted && sim.monthlySchedule.length > 0
            ? sim.monthlySchedule[
            Math.min(59, Math.max(0, Math.ceil(sim.dynamicRunwayMonths) - 1))
            ]
            : null;
    const zeroCashDateLabel = zeroCashRow
        ? zeroCashRow.dateLabel.split(' ')[0] + ' ' + zeroCashRow.dateLabel.split(' ')[1]
        : '60+ Months (Self-Sustaining)';

    const raiseByRow =
        sim.runwayExhausted && mandatoryRaiseByMonth >= 1
            ? sim.monthlySchedule[
            Math.min(59, Math.max(0, Math.floor(mandatoryRaiseByMonth) - 1))
            ]
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
            sim.dynamicRunwayMonths < 9.0
                ? 'DEFAULT_DEAD_CRITICAL'
                : 'DEFAULT_DEAD_RAISE_SOON';
    } else if (sim.breakevenMonth === null && sim.monthlySchedule[59]?.netBurn > 0) {
        trajectoryStatus = 'DEFAULT_DEAD_RAISE_SOON';
    }

    // Modeled Burn Multiple = Annualized Net Burn / Annualized Net New ARR
    const currentArr = Math.round(state.monthlyRevenueMrr * 12);
    const month12Arr = Math.round(m12.arr);
    const trailing12MonthSimulatedNetNewArr = Math.max(0, month12Arr - currentArr);
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

    // Evaluate M&A Exit Waterfall at Target Exit Valuation & 6 Valuation Milestones
    const targetExitSplit = evaluateExitWaterfallAtValuation(
        state.targetExitValuation || 100_000_000,
        state,
        capDomain
    );
    const exitValuationTable = [
        10_000_000,
        25_000_000,
        50_000_000,
        100_000_000,
        250_000_000,
        500_000_000,
    ].map((v) => evaluateExitWaterfallAtValuation(v, state, capDomain));

    // Build Stakeholder Cap Table Rows
    const {
        initialShares,
        founderInitialShares,
        existingPoolShares,
        evaluatedConvertibles,
        postSafeTotalShares,
        optionPoolTopUpShares,
        newRoundInvestorShares,
        postRoundTotalShares,
        roundSharePrice,
        postMoneyValuation,
        standalonePostMoneySafeDilutionPct,
    } = capDomain;

    const totalSafeShares = evaluatedConvertibles.reduce(
        (a, b) => a + b.convertedShares,
        0
    );

    const foundersPreRoundPct = Number(
        ((founderInitialShares / initialShares) * 100).toFixed(2)
    );
    const foundersPostSafePct = Number(
        ((founderInitialShares / postSafeTotalShares) * 100).toFixed(2)
    );
    const foundersPostRoundPct = Number(
        ((founderInitialShares / postRoundTotalShares) * 100).toFixed(2)
    );

    const capTableRows: CapTableStakeholder[] = [];

    capTableRows.push({
        id: 'row_founders',
        name: 'Founders (Common Stock)',
        group: 'FOUNDERS',
        preRoundShares: founderInitialShares,
        preRoundPct: foundersPreRoundPct,
        postSafeShares: founderInitialShares,
        postSafePct: foundersPostSafePct,
        postRoundShares: founderInitialShares,
        postRoundPct: foundersPostRoundPct,
        investedAmount: 0,
        accruedInterestAmount: 0,
        convertingPrincipalAmount: 0,
        effectiveSharePrice: 0,
        conversionBasisLabel: 'Common Stock',
        postRoundPaperValue: Math.round(founderInitialShares * roundSharePrice),
        dilutionPctPoints: Number((foundersPostRoundPct - foundersPreRoundPct).toFixed(2)),
        exitPayoutAmount: targetExitSplit.foundersPayout,
        exitPayoutPct: targetExitSplit.foundersSharePct,
        exitMultipleMoic: 0,
    });

    const totalPoolSharesPostRound = existingPoolShares + optionPoolTopUpShares;
    const existingPoolPrePct = Number(
        ((existingPoolShares / initialShares) * 100).toFixed(2)
    );
    const existingPoolPostSafePct = Number(
        ((existingPoolShares / postSafeTotalShares) * 100).toFixed(2)
    );
    const poolPostRoundPct = Number(
        ((totalPoolSharesPostRound / postRoundTotalShares) * 100).toFixed(2)
    );

    capTableRows.push({
        id: 'row_option_pool',
        name: `Employee Option Pool (ESOP${optionPoolTopUpShares > 0 ? ' + Top-Up' : ''})`,
        group: 'EXISTING_OPTION_POOL',
        preRoundShares: existingPoolShares,
        preRoundPct: existingPoolPrePct,
        postSafeShares: existingPoolShares,
        postSafePct: existingPoolPostSafePct,
        postRoundShares: totalPoolSharesPostRound,
        postRoundPct: poolPostRoundPct,
        investedAmount: 0,
        accruedInterestAmount: 0,
        convertingPrincipalAmount: 0,
        effectiveSharePrice: 0,
        conversionBasisLabel:
            optionPoolTopUpShares > 0
                ? state.optionPoolMode === 'PRE_MONEY_CARVEOUT'
                    ? `Pre-Money Pool Top-Up (+${optionPoolTopUpShares.toLocaleString()} sh)`
                    : `Post-Money Shared Top-Up (+${optionPoolTopUpShares.toLocaleString()} sh)`
                : 'Existing Option Pool',
        postRoundPaperValue: Math.round(totalPoolSharesPostRound * roundSharePrice),
        dilutionPctPoints: Number((poolPostRoundPct - existingPoolPrePct).toFixed(2)),
        exitPayoutAmount: targetExitSplit.optionPoolPayout,
        exitPayoutPct:
            state.targetExitValuation > 0
                ? Number(
                    (
                        (targetExitSplit.optionPoolPayout / state.targetExitValuation) *
                        100
                    ).toFixed(1)
                )
                : 0,
        exitMultipleMoic: 0,
    });

    for (const ev of evaluatedConvertibles) {
        const postRoundPct = Number(
            ((ev.convertedShares / postRoundTotalShares) * 100).toFixed(2)
        );
        const trancheExitShare =
            totalSafeShares > 0
                ? Math.round(
                    targetExitSplit.safeHoldersPayout *
                    (ev.convertedShares / totalSafeShares)
                )
                : 0;

        capTableRows.push({
            id: ev.tranche.id,
            name: `${ev.tranche.label} (${ev.tranche.instrumentType === 'POST_MONEY_SAFE'
                    ? 'Post-Money SAFE'
                    : ev.tranche.instrumentType === 'PRE_MONEY_SAFE'
                        ? 'Pre-Money SAFE'
                        : 'Conv. Note'
                })`,
            group: 'SAFE_NOTE_HOLDERS',
            preRoundShares: 0,
            preRoundPct: 0,
            postSafeShares: ev.convertedShares,
            postSafePct: ev.standalonePostSafePct,
            postRoundShares: ev.convertedShares,
            postRoundPct,
            investedAmount: ev.tranche.investmentAmount,
            accruedInterestAmount: ev.accruedInterest,
            convertingPrincipalAmount: ev.convertingPrincipal,
            effectiveSharePrice: ev.effectiveSharePrice,
            conversionBasisLabel: ev.conversionBasisLabel,
            postRoundPaperValue: Math.round(ev.convertedShares * roundSharePrice),
            dilutionPctPoints: postRoundPct,
            exitPayoutAmount: trancheExitShare,
            exitPayoutPct:
                state.targetExitValuation > 0
                    ? Number(((trancheExitShare / state.targetExitValuation) * 100).toFixed(1))
                    : 0,
            exitMultipleMoic:
                ev.tranche.investmentAmount > 0
                    ? Number((trancheExitShare / ev.tranche.investmentAmount).toFixed(2))
                    : 0,
        });
    }

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
            investedAmount: state.newInvestmentAmount,
            accruedInterestAmount: 0,
            convertingPrincipalAmount: state.newInvestmentAmount,
            effectiveSharePrice: roundSharePrice,
            conversionBasisLabel: 'New Priced Round Preferred',
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
                state.newInvestmentAmount > 0
                    ? Number(
                        (
                            targetExitSplit.seriesAInvestorsPayout /
                            state.newInvestmentAmount
                        ).toFixed(2)
                    )
                    : 0,
        });
    }

    const totalSafeDilutionPct = Number(
        ((totalSafeShares / postRoundTotalShares) * 100).toFixed(2)
    );
    const optionPoolTopUpDilutionPct = Number(
        ((optionPoolTopUpShares / postRoundTotalShares) * 100).toFixed(2)
    );

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

    // 3-Scenario Comparison Matrix
    const buildScenarioCol = (
        name: string,
        subtitle: string,
        growthDelta: number,
        expDelta: number
    ): ScenarioComparisonColumn => {
        const g = Math.max(
            0,
            Number((state.monthlyNetRevenueGrowthPct + growthDelta).toFixed(1))
        );
        const e = Math.max(
            0,
            Number((state.monthlyExpenseGrowthPct + expDelta).toFixed(1))
        );
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

    const healthAlerts: FinancialHealthAlert[] = [];
    if (trajectoryStatus === 'DEFAULT_DEAD_CRITICAL') {
        healthAlerts.push({
            id: 'alert_critical_runway',
            severity: 'CRITICAL',
            title: `Critical Runway Alert: ${sim.dynamicRunwayMonths} Months Projected (Under 9-Month Buffer)`,
            description: `Fundraising rounds often take several months to close. With ${sim.dynamicRunwayMonths} months of projected cash left, reducing monthly spend by ${state.currencySymbol}${solvers.requiredMonthlyCostCutForDefaultAlive.toLocaleString()}/mo or bridging capital is recommended.`,
            actionLabel: `Apply ${state.currencySymbol}${solvers.requiredMonthlyCostCutForDefaultAlive.toLocaleString()}/mo Cost Reduction`,
        });
    } else if (trajectoryStatus === 'DEFAULT_DEAD_RAISE_SOON') {
        healthAlerts.push({
            id: 'alert_default_dead',
            severity: 'WARNING',
            title: `Default Dead Trajectory: Projected Zero-Cash in Month ${sim.dynamicRunwayMonths} (Raise-By Indicator: Month ${mandatoryRaiseByMonth})`,
            description: `Under current growth (${state.monthlyNetRevenueGrowthPct}%/mo) and expense assumptions, cash reaches zero before operational breakeven. Lifting growth to ${solvers.requiredMonthlyGrowthPctForDefaultAlive}%/mo or trimming ${state.currencySymbol}${solvers.requiredMonthlyCostCutForDefaultAlive.toLocaleString()}/mo flips the model to Default Alive.`,
            actionLabel: 'Flip to Default Alive',
        });
    } else {
        healthAlerts.push({
            id: 'alert_default_alive',
            severity: 'POSITIVE',
            title: `Default Alive Trajectory: Reaches Operational Breakeven in Month ${sim.breakevenMonth ?? 1} (${breakevenDateLabel || 'Profitable'})`,
            description: `Under your modeled growth and expense assumptions, recurring revenue overtakes monthly gross burn with ${state.currencySymbol}${Math.round(sim.minimumCashBalance).toLocaleString()} in minimum cash reserves.`,
            actionLabel: 'Trajectory Healthy',
        });
    }

    if (burnMultiple > 2.0 && netBurnMonthly > 0) {
        healthAlerts.push({
            id: 'alert_burn_multiple',
            severity: 'WARNING',
            title: `Elevated Modeled Burn Multiple (${burnMultiple}x): Burning ${state.currencySymbol}${burnMultiple} per ${state.currencySymbol}1 of Net New ARR`,
            description: `SaaS investors commonly look for a Burn Multiple below 1.5x–2.0x. Pacing non-essential hiring or accelerating net revenue growth improves capital efficiency.`,
            actionLabel: 'Optimize Burn Multiple',
        });
    }

    // Run Domain 6 Invariant Verification
    const invariantVerification = verifyFinancialModelInvariants(
        state,
        sim.monthlySchedule,
        capDomain,
        capTableRows,
        targetExitSplit
    );

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
                'Conversion_Basis',
                'Pre_Round_Shares',
                'Pre_Round_Ownership_Pct',
                'Post_SAFE_Shares',
                'Post_SAFE_Ownership_Pct',
                'Post_Round_Shares',
                'Post_Round_Ownership_Pct',
                'Invested_Capital',
                'Converting_Principal_With_Interest',
                'Effective_Share_Price',
                'Post_Round_Paper_Value',
                'Scenario_Exit_Payout',
                'Exit_MOIC',
            ]),
            ...capTableRows.map((c) =>
                toCsvRow([
                    c.name,
                    c.conversionBasisLabel,
                    c.preRoundShares,
                    c.preRoundPct,
                    c.postSafeShares,
                    c.postSafePct,
                    c.postRoundShares,
                    c.postRoundPct,
                    c.investedAmount,
                    c.convertingPrincipalAmount,
                    c.effectiveSharePrice,
                    c.postRoundPaperValue,
                    c.exitPayoutAmount,
                    c.exitMultipleMoic,
                ])
            ),
        ].join('\n');

    const summaryMarkdown = [
        `# ${state.companyName} — Scenario-Based Burn Rate, Runway & Dilution Model`,
        ``,
        `## 1. Cash Burn & Runway Projection`,
        `- **Current Cash on Hand**: ${state.currencySymbol}${state.cashOnHand.toLocaleString()}`,
        `- **Monthly Recurring Revenue (MRR)**: ${state.currencySymbol}${state.monthlyRevenueMrr.toLocaleString()} (${state.currencySymbol}${currentArr.toLocaleString()} ARR)`,
        `- **Monthly Gross Burn**: ${state.currencySymbol}${grossBurnMonthly.toLocaleString()}/mo`,
        `- **Monthly Net Burn**: ${state.currencySymbol}${netBurnMonthly.toLocaleString()}/mo`,
        `- **Projected Dynamic Cash Runway**: **${sim.runwayExhausted ? `${sim.dynamicRunwayMonths} Months (Projected Zero-Cash: ${zeroCashDateLabel})` : '60+ Months (Default Alive)'}**`,
        `- **Static Runway (Zero Growth)**: ${staticRunwayIsCappedAt60 ? `60+ Months (${uncappedStaticRunwayMonths}m uncapped)` : `${staticRunwayMonths} Months`}`,
        `- **Modeled Burn Multiple**: **${burnMultiple}x**`,
        ``,
        `## 2. Modeled Cap Table & Dilution (${state.fundingRoundName})`,
        `- **Pre-Money Valuation**: ${state.currencySymbol}${state.preMoneyValuation.toLocaleString()}`,
        `- **New Round Investment**: ${state.currencySymbol}${state.newInvestmentAmount.toLocaleString()} (Post-Money: ${state.currencySymbol}${postMoneyValuation.toLocaleString()})`,
        `- **Modeled Round Share Price**: ${state.currencySymbol}${roundSharePrice.toFixed(4)}/share`,
        `- **Standalone Post-SAFE Dilution**: ${standalonePostMoneySafeDilutionPct}%`,
        `- **Founders Ownership**: ${foundersPreRoundPct}% Pre-Round → ${foundersPostSafePct}% Post-SAFE → **${foundersPostRoundPct}% Post-Round**`,
        `- **Scenario Founder Exit Payout (@ ${state.currencySymbol}${state.targetExitValuation.toLocaleString()} Exit)**: **${state.currencySymbol}${targetExitSplit.foundersPayout.toLocaleString()}**`,
    ].join('\n');

    const shareableQueryString = `?preset=${encodeURIComponent(state.presetId)}&cash=${state.cashOnHand}&mrr=${state.monthlyRevenueMrr}&opex=${state.monthlyOperatingExpenses}&growth=${state.monthlyNetRevenueGrowthPct}&expGrowth=${state.monthlyExpenseGrowthPct}&preVal=${state.preMoneyValuation}&newInv=${state.newInvestmentAmount}&pool=${state.targetPostRoundOptionPoolPct}&exit=${state.targetExitValuation}`;

    return {
        grossBurnMonthly,
        netBurnMonthly,
        uncappedStaticRunwayMonths,
        staticRunwayMonths,
        staticRunwayIsCappedAt60,
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
        trailing12MonthSimulatedNetNewArr,
        burnMultiple,
        burnEfficiencyRating,
        revenueCoverageRatioPct,
        netBurnDeficitRatioPct,
        requiredMonthlyCostCutForTargetRunway: solvers.requiredMonthlyCostCutForTargetRunway,
        requiredMonthlyCostCutForDefaultAlive: solvers.requiredMonthlyCostCutForDefaultAlive,
        requiredMonthlyGrowthPctForDefaultAlive: solvers.requiredMonthlyGrowthPctForDefaultAlive,
        initialShares,
        postSafeTotalShares,
        postRoundTotalShares,
        roundSharePrice,
        postMoneyValuation,
        standalonePostMoneySafeDilutionPct,
        totalSafeDilutionPct,
        optionPoolTopUpShares,
        optionPoolTopUpDilutionPct,
        newRoundInvestorPct,
        foundersPreRoundPct,
        foundersPostSafePct,
        foundersPostRoundPct,
        foundersTotalDilutionPctPoints: Number(
            (foundersPreRoundPct - foundersPostRoundPct).toFixed(2)
        ),
        foundersPaperValuePostRound: Math.round(founderInitialShares * roundSharePrice),
        foundersExitPayout: targetExitSplit.foundersPayout,
        investorsExitPayout:
            targetExitSplit.safeHoldersPayout + targetExitSplit.seriesAInvestorsPayout,
        optionPoolExitPayout: targetExitSplit.optionPoolPayout,
        monthlySchedule: sim.monthlySchedule,
        yearlySummary,
        capTableRows,
        exitValuationTable,
        scenarioComparison,
        healthAlerts,
        invariantVerification,
        runwayCsv,
        capTableCsv,
        summaryMarkdown,
        shareableQueryString,
    };
}

/**
 * Native 3-Sheet OpenXML Excel (.xlsx) Workbook Builder
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
            'Conversion_Basis',
            'Pre_Round_Shares',
            'Pre_Round_Pct',
            'Post_SAFE_Shares',
            'Post_SAFE_Pct',
            'Post_Round_Shares',
            'Post_Round_Pct',
            'Invested_Amount',
            'Converting_Principal',
            'Effective_Share_Price',
            'Post_Round_Paper_Value',
            'Scenario_Exit_Payout',
            'Exit_MOIC',
        ],
        ...data.capTableRows.map((c) => [
            c.name,
            c.conversionBasisLabel,
            c.preRoundShares,
            c.preRoundPct,
            c.postSafeShares,
            c.postSafePct,
            c.postRoundShares,
            c.postRoundPct,
            c.investedAmount,
            c.convertingPrincipalAmount,
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
            'Total_Distributed',
        ],
        ...data.exitValuationTable.map((e) => [
            e.exitValuation,
            e.foundersPayout,
            e.foundersSharePct,
            e.safeHoldersPayout,
            e.seriesAInvestorsPayout,
            e.optionPoolPayout,
            e.totalDistributed,
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
 * 5 Scenario Presets
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
            raisePlanningBufferMonths: 6,
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
            participationCapMultiple: 0,
            safeLiquidationTreatment: 'SHADOW_PREFERRED_1X',
            waterfallSeniorityMode: 'SERIES_A_SENIOR_TO_SAFE',
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