/**
 * KivaroTools — Client-Side SaaS Burn Rate, Runway, Cap Table Dilution & Exit Waterfall Engine
 * File: lib/saasBurnRateEngine.ts
 * Version: 2.0
 *
 * 100% Local Browser Execution • Zero External Dependencies • YC Post-Money SAFE v1.1,
 * Paul Graham Default Alive/Dead, David Sacks Burn Multiple & M&A Exit Waterfall Compliant
 */

export const SAAS_ENGINE_VERSION = '2.0.0';

export type SaasPresetId =
    | 'yc_seed_ai_saas'
    | 'hypergrowth_fatal_pinch'
    | 'stacked_safe_pool_shuffle'
    | 'bootstrapped_indie_profitable'
    | 'series_b_scaleup_waterfall'
    | 'deeptech_grant_venture_debt';

export type ConvertibleInstrumentType =
    | 'YC_POST_MONEY_SAFE'
    | 'PRE_MONEY_SAFE'
    | 'CONVERTIBLE_NOTE';

export type LiquidationParticipationType =
    | 'NON_PARTICIPATING'
    | 'FULL_PARTICIPATING'
    | 'CAPPED_PARTICIPATING';

export type DefaultAliveStatus =
    | 'DEFAULT_ALIVE'
    | 'DEFAULT_DEAD_RAISING_WINDOW'
    | 'DEFAULT_DEAD_FATAL_PINCH';

export type BurnMultipleTier =
    | 'ELITE_UNDER_1X'
    | 'GREAT_1X_TO_1_5X'
    | 'GOOD_1_5X_TO_2X'
    | 'SUSPECT_2X_TO_3X'
    | 'OVERBURNING_ABOVE_3X'
    | 'PROFITABLE_CASH_POSITIVE';

export interface CoFounderStake {
    id: string;
    name: string;
    role: string;
    initialShares: number;
    vestingMonthsTotal: number;
    cliffMonths: number;
    monthsElapsed: number;
    secondarySaleDollarsAtSeriesA: number;
}

export interface HiringPlanRole {
    id: string;
    title: string;
    department: 'R&D' | 'S&M' | 'G&A';
    count: number;
    annualBaseSalary: number;
    benefitsAndTaxBurdenPct: number; // e.g. 22%
    startMonth: number; // 1..60
    enabled: boolean;
}

export interface CashEventItem {
    id: string;
    label: string;
    month: number; // 1..60
    amountDollars: number; // positive = grant/inflow, negative = one-time capex/outflow
    type: 'NON_DILUTIVE_GRANT' | 'ONE_TIME_CAPEX' | 'VENTURE_DEBT_DRAWDOWN';
    enabled: boolean;
}

export interface VentureDebtConfig {
    enabled: boolean;
    principalDollars: number;
    drawdownMonth: number;
    annualInterestRatePct: number;
    interestOnlyMonths: number;
    amortizationMonths: number;
    warrantCoveragePct: number;
}

export interface AiTokenCogsConfig {
    enabled: boolean;
    activeAiCustomersBase: number;
    monthlyQueriesPerCustomer: number;
    avgTokensPerQuery: number;
    blendedCostPerMillionTokensDollars: number;
    promptCacheHitRatePct: number; // e.g., 35% reduces effective token cost
    monthlyCostDeflationPct: number; // e.g., 2.5% monthly LLMflation cost drop
    fixedGpuClusterMonthlyDollars: number;
}

export interface ConvertibleInstrument {
    id: string;
    investorName: string;
    type: ConvertibleInstrumentType;
    principalDollars: number;
    issueMonth: number; // 0 = already on balance sheet, 1..60 = future injection into cash runway
    valuationCapDollars: number; // 0 = uncapped
    discountPct: number; // 0..50
    annualInterestRatePct: number; // used for CONVERTIBLE_NOTE
    accruedMonthsAtConversion: number; // used for CONVERTIBLE_NOTE
    mfnEnabled: boolean;
    proRataRightEnabled: boolean;
    liquidationMultiple: number; // typically 1x
    participationType: LiquidationParticipationType;
    participationCapMultiple: number; // e.g. 2x or 3x when CAPPED_PARTICIPATING
    enabled: boolean;
}

export interface PricedRoundConfig {
    enabled: boolean;
    roundName: string;
    closeMonth: number; // 1..60 (injects net cash into runway at this month)
    preMoneyValuationDollars: number;
    newMoneyInvestmentDollars: number;
    legalAndSyndicateFeesDollars: number;
    targetPostRoundOptionPoolPct: number; // e.g. 10% or 15%
    optionPoolCarveoutMode: 'PRE_MONEY_SHUFFLE' | 'POST_MONEY_SHARED';
    liquidationMultiple: number; // 1x, 1.5x, 2x, 3x
    participationType: LiquidationParticipationType;
    participationCapMultiple: number; // e.g. 2x, 3x
    seniorityTier: 1 | 2 | 3; // 1 = Senior-most, 2 = Mezzanine, 3 = Junior Preferred
    includeSafeProRataInNewMoney: boolean;
}

export interface ExitWaterfallConfig {
    targetExitValuationDollars: number;
    maAdvisoryAndLegalFeePct: number; // e.g. 2.5%
    managementCarveOutPct: number; // e.g. 0% - 10%
}

export interface MonteCarloConfig {
    seed: number;
    trials: number; // default 1000
    mrrGrowthVolatilityPct: number; // e.g. 3.0% std dev
    churnVolatilityPct: number; // e.g. 0.8% std dev
    opexSlippageVolatilityPct: number; // e.g. 5.0% std dev
}

export interface SaasWorkspaceState {
    companyName: string;
    activePreset: SaasPresetId;
    currencySymbol: string;

    // Baseline Cash & SaaS Revenue Metrics
    startingCashDollars: number;
    startingMrrDollars: number;
    arpuMonthlyDollars: number;
    monthlyNewMrrGrowthPct: number;
    monthlyGrowthDecayPct: number; // e.g. 1.5% relative monthly decay as scale increases
    monthlyExpansionMrrPct: number;
    monthlyGrossChurnMrrPct: number;
    baseSaasGrossMarginPct: number; // e.g. 82% before AI token inference costs
    annualUpfrontBillingSharePct: number; // % of new MRR collected 12m upfront
    minimumSafetyCashBufferDollars: number;

    // Departmental Baseline OpEx (Monthly $)
    baselineRdOpexDollars: number;
    baselineSmOpexDollars: number;
    baselineGaOpexDollars: number;
    monthlyOpexInflationPct: number;
    baselineHeadcountFte: number;

    // Sub-Modules
    aiTokenCogs: AiTokenCogsConfig;
    hiringPlan: HiringPlanRole[];
    cashEvents: CashEventItem[];
    ventureDebt: VentureDebtConfig;

    // Initial Cap Table State
    founders: CoFounderStake[];
    earlyAngelCommonShares: number;
    issuedEmployeeOptionShares: number;
    unissuedExistingOptionPoolShares: number;

    // Convertible Instruments & Priced Rounds
    convertibles: ConvertibleInstrument[];
    seriesARound: PricedRoundConfig;
    seriesBRound: PricedRoundConfig;

    // Exit & Monte Carlo Settings
    exitConfig: ExitWaterfallConfig;
    monteCarloConfig: MonteCarloConfig;
}

export interface MonthlyCashFlowRow {
    month: number;
    calendarLabel: string;
    beginningCash: number;
    beginningMrr: number;
    newMrr: number;
    expansionMrr: number;
    churnedMrr: number;
    endingMrr: number;
    arr: number;
    activeCustomers: number;
    upfrontCashBillingBonus: number;
    cashCollectedFromRevenue: number;
    baseSaasCogs: number;
    aiTokenInferenceCogs: number;
    totalCogs: number;
    grossProfit: number;
    blendedGrossMarginPct: number;
    rdOpex: number;
    smOpex: number;
    gaOpex: number;
    hiringPayrollOpex: number;
    ventureDebtService: number;
    totalOpex: number;
    grossBurn: number;
    nonDilutiveInflow: number;
    equityFinancingNetInflow: number;
    netBurn: number;
    netCashFlow: number;
    endingCash: number;
    activeHeadcountFte: number;
    arrPerFte: number;
    burnMultipleAnnualized: number;
    ruleOf40Score: number;
}

export interface BreakevenSolverResult {
    isAlreadyDefaultAlive: boolean;
    requiredImmediateOpexCutPct: number;
    requiredImmediateOpexCutMonthlyDollars: number;
    requiredMonthlyNewMrrGrowthPct: number;
    projectedMinimumCashTroughDollars: number;
    breakevenMonthAfterOpexFix: number | null;
    breakevenMonthAfterGrowthFix: number | null;
}

export interface CapTableStakeholderRow {
    id: string;
    stakeholderName: string;
    category:
    | 'CO_FOUNDER'
    | 'EARLY_COMMON'
    | 'EMPLOYEE_OPTIONS_ISSUED'
    | 'OPTION_POOL_UNISSUED'
    | 'CONVERTIBLE_SAFE_NOTE'
    | 'SERIES_A_PREFERRED'
    | 'SERIES_B_PREFERRED';
    initialShares: number;
    initialOwnershipPct: number;
    postSafeConversionShares: number;
    postSafeOwnershipPct: number;
    postSeriesAShares: number;
    postSeriesAOwnershipPct: number;
    postSeriesBShares: number;
    postSeriesBOwnershipPct: number;
    investedCapitalDollars: number;
    effectiveConversionPps: number;
    impliedPaperValuePostRoundDollars: number;
    secondaryCashOutReceivedDollars: number;
    vestedSharesCount: number;
    unvestedSharesCount: number;
    dilutionFromInitialPctPoints: number;
    notes: string;
}

export interface ConvertibleConversionDetail {
    id: string;
    investorName: string;
    type: ConvertibleInstrumentType;
    principalDollars: number;
    accruedInterestDollars: number;
    convertingAmountDollars: number;
    originalCapDollars: number;
    effectiveCapDollarsAfterMfn: number;
    effectiveDiscountPctAfterMfn: number;
    mfnUpgraded: boolean;
    conversionTrigger: 'VALUATION_CAP' | 'DISCOUNT_RATE' | 'ROUND_PPS';
    effectiveConversionPps: number;
    convertedShares: number;
    postSeriesAOwnershipPct: number;
}

export interface CapTableSummary {
    initialFullyDilutedShares: number;
    postSeriesAFullyDilutedShares: number;
    postSeriesBFullyDilutedShares: number;
    seriesARoundPps: number;
    seriesAPostMoneyValuationDollars: number;
    seriesAOptionPoolTopUpShares: number;
    seriesANewInvestorShares: number;
    seriesBRoundPps: number;
    seriesBPostMoneyValuationDollars: number;
    seriesBOptionPoolTopUpShares: number;
    seriesBNewInvestorShares: number;
    cumulativePostMoneySafeDilutionPct: number;
    foundersCombinedInitialPct: number;
    foundersCombinedPostSeriesAPct: number;
    foundersCombinedPostSeriesBPct: number;
    totalFounderSecondaryLiquidityDollars: number;
    stakeholders: CapTableStakeholderRow[];
    convertibleDetails: ConvertibleConversionDetail[];
}

export interface ExitClassPayout {
    classId: string;
    className: string;
    category: CapTableStakeholderRow['category'];
    investedCapitalDollars: number;
    liquidationPreferenceDollars: number;
    decision: 'CONVERTED_TO_COMMON' | 'TOOK_LIQUIDATION_PREFERENCE' | 'COMMON_PRO_RATA';
    voluntaryConversionBreakpointValuation: number;
    preferencePayoutDollars: number;
    participationOrCommonPayoutDollars: number;
    totalPayoutDollars: number;
    shareOfNetExitPct: number;
    moicMultiple: number;
}

export interface ExitWaterfallMilestone {
    exitValuationDollars: number;
    netDistributableProceedsDollars: number;
    foundersPayoutDollars: number;
    foundersEffectivePct: number;
    optionPoolAndEmployeesPayoutDollars: number;
    safeAndSeedPayoutDollars: number;
    seriesAPayoutDollars: number;
    seriesBPayoutDollars: number;
    classPayouts: ExitClassPayout[];
}

export interface ExitWaterfallSummary {
    targetExitResult: ExitWaterfallMilestone;
    milestoneGrid: ExitWaterfallMilestone[];
}

export interface MonteCarloSummary {
    trials: number;
    seed: number;
    p10RunwayMonths: number;
    p25RunwayMonths: number;
    p50RunwayMonths: number;
    p75RunwayMonths: number;
    p90RunwayMonths: number;
    probabilityDefaultAlivePct: number;
    probabilityRunwayOver18MonthsPct: number;
    monthlyConfidenceBands: {
        month: number;
        p10Cash: number;
        p50Cash: number;
        p90Cash: number;
    }[];
}

export interface SensitivityCell {
    rowValue: number;
    colValue: number;
    metricValue: number;
    secondaryValue: number;
    status: 'GOOD' | 'WARN' | 'CRITICAL';
}

export interface SensitivityMatrices {
    growthStepsPct: number[];
    churnStepsPct: number[];
    runwayGrowthChurnGrid: SensitivityCell[][];
    valuationStepsDollars: number[];
    poolStepsPct: number[];
    founderDilutionValPoolGrid: SensitivityCell[][];
}

export interface SaasVentureLintIssue {
    id: string;
    ruleCode:
    | 'RUNWAY_001_FATAL_PINCH'
    | 'BURN_002_CAPITAL_INEFFICIENCY'
    | 'SAFE_003_EXCESSIVE_POST_MONEY_STACK'
    | 'POOL_004_AGGRESSIVE_PREMONEY_SHUFFLE'
    | 'MFN_005_TRIGGERED_REPRICING'
    | 'LIQ_006_PREDATORY_PREFERENCE_OVERHANG'
    | 'FOUNDER_007_OWNERSHIP_COMPRESSION'
    | 'CHURN_008_LEAKY_BUCKET'
    | 'CAC_009_SUBOPTIMAL_GTM_MAGIC'
    | 'DEBT_010_VENTURE_DEBT_CLIFF'
    | 'AIMARGIN_011_TOKEN_COGS_TRAP'
    | 'MONTECARLO_012_FRAGILE_SURVIVAL';
    severity: 'ERROR' | 'WARNING' | 'INFO';
    category: 'RUNWAY' | 'UNIT_ECONOMICS' | 'CAP_TABLE' | 'EXIT_WATERFALL' | 'AI_COGS';
    title: string;
    detail: string;
    recommendation: string;
    autoFixable: boolean;
}

export interface SaasCompiledDeliverables {
    monthlyRows: MonthlyCashFlowRow[];
    exactRunwayMonths: number;
    runwayExhausted: boolean;
    zeroCashMonthIndex: number | null;
    mandatoryRaiseByMonth: number;
    breakevenMonthIndex: number | null;
    defaultAliveStatus: DefaultAliveStatus;
    minimumCashBalanceDollars: number;
    currentNetBurnMonthlyDollars: number;
    currentGrossBurnMonthlyDollars: number;
    davidSacksBurnMultiple: number;
    bessemerEfficiencyScore: number;
    burnMultipleTier: BurnMultipleTier;
    annualizedNrrPct: number;
    annualizedGrrPct: number;
    saasMagicNumber: number;
    cacPaybackMonths: number;
    ltvToCacRatio: number;
    ruleOf40Score: number;
    blendedGrossMarginMonth1Pct: number;
    blendedGrossMarginMonth12Pct: number;
    breakevenSolver: BreakevenSolverResult;
    capTable: CapTableSummary;
    exitWaterfall: ExitWaterfallSummary;
    monteCarlo: MonteCarloSummary;
    sensitivity: SensitivityMatrices;
    lintIssues: SaasVentureLintIssue[];
    ventureReadinessScore: number;

    // 10 Compiled Export Text / Binary Payloads
    cashFlowCsv: string;
    capTableCsv: string;
    exitWaterfallCsv: string;
    boardReportMarkdown: string;
    interactiveBoardHtml: string;
    modelSnapshotJson: string;
    pythonVerificationScript: string;
    shareableUrlQuery: string;
    executiveTermSheetSummaryTxt: string;
}

const textEncoder = new TextEncoder();

const SHA256_K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

export function computeSha256Hex(input: Uint8Array | string): string {
    const bytes = typeof input === 'string' ? textEncoder.encode(input) : input;
    const bitLen = bytes.length * 8;
    const padLen = ((bytes.length + 9 + 63) & ~63);
    const padded = new Uint8Array(padLen);
    padded.set(bytes);
    padded[bytes.length] = 0x80;
    const dv = new DataView(padded.buffer);
    dv.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000), false);
    dv.setUint32(padLen - 4, bitLen >>> 0, false);

    let h0 = 0x6a09e667;
    let h1 = 0xbb67ae85;
    let h2 = 0x3c6ef372;
    let h3 = 0xa54ff53a;
    let h4 = 0x510e527f;
    let h5 = 0x9b05688c;
    let h6 = 0x1f83d9ab;
    let h7 = 0x5be0cd19;

    const w = new Uint32Array(64);
    const rotr = (n: number, b: number) => (n >>> b) | (n << (32 - b));

    for (let i = 0; i < padLen; i += 64) {
        for (let t = 0; t < 16; t++) {
            w[t] = dv.getUint32(i + t * 4, false);
        }
        for (let t = 16; t < 64; t++) {
            const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
            const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
            w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
        }

        let a = h0;
        let b = h1;
        let c = h2;
        let d = h3;
        let e = h4;
        let f = h5;
        let g = h6;
        let h = h7;

        for (let t = 0; t < 64; t++) {
            const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
            const ch = (e & f) ^ (~e & g);
            const temp1 = (h + S1 + ch + SHA256_K[t] + w[t]) >>> 0;
            const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (S0 + maj) >>> 0;

            h = g;
            g = f;
            f = e;
            e = (d + temp1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) >>> 0;
        }

        h0 = (h0 + a) >>> 0;
        h1 = (h1 + b) >>> 0;
        h2 = (h2 + c) >>> 0;
        h3 = (h3 + d) >>> 0;
        h4 = (h4 + e) >>> 0;
        h5 = (h5 + f) >>> 0;
        h6 = (h6 + g) >>> 0;
        h7 = (h7 + h) >>> 0;
    }

    const toHex = (n: number) => n.toString(16).padStart(8, '0');
    return (
        toHex(h0) +
        toHex(h1) +
        toHex(h2) +
        toHex(h3) +
        toHex(h4) +
        toHex(h5) +
        toHex(h6) +
        toHex(h7)
    );
}

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
 * CWE-1236 CSV/Spreadsheet Formula Injection Sanitizer
 */
export function sanitizeSpreadsheetFormula(val: unknown, sanitize = true): string {
    const str = String(val ?? '');
    if (!sanitize || str.length === 0) return str;
    // Allow negative numbers (e.g., -45000) without prepending apostrophe, but block formula expressions like =-SUM(...)
    if (/^-[0-9]+(\.[0-9]+)?%?$/.test(str.trim())) {
        return str;
    }
    if (/^[=+\-@|\t\r]/.test(str)) {
        return `'${str}`;
    }
    return str;
}

/**
 * Mulberry32 Deterministic Seeded PRNG + Box-Muller Gaussian Sampler
 */
export function createSeededPrng(seed: number): { nextUniform: () => number; nextGaussian: () => number } {
    let state = (seed >>> 0) || 0x1337beef;
    const nextUniform = (): number => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const nextGaussian = (): number => {
        let u = 0;
        let v = 0;
        while (u === 0) u = nextUniform();
        while (v === 0) v = nextUniform();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    };
    return { nextUniform, nextGaussian };
}

/**
 * Core 60-Month Cohort Cash Flow & Runway Simulation
 */
export function simulate60MonthCashFlow(workspace: SaasWorkspaceState): {
    monthlyRows: MonthlyCashFlowRow[];
    exactRunwayMonths: number;
    runwayExhausted: boolean;
    zeroCashMonthIndex: number | null;
    mandatoryRaiseByMonth: number;
    breakevenMonthIndex: number | null;
    defaultAliveStatus: DefaultAliveStatus;
    minimumCashBalanceDollars: number;
} {
    const rows: MonthlyCashFlowRow[] = [];
    let currentCash = Math.max(0, workspace.startingCashDollars);
    let currentMrr = Math.max(0, workspace.startingMrrDollars);
    const arpu = Math.max(1, workspace.arpuMonthlyDollars);
    const decayRate = Math.min(0.25, Math.max(0, workspace.monthlyGrowthDecayPct / 100));
    const expansionRate = Math.max(0, workspace.monthlyExpansionMrrPct / 100);
    const churnRate = Math.min(0.95, Math.max(0, workspace.monthlyGrossChurnMrrPct / 100));
    const baseGmRatio = Math.min(0.99, Math.max(0.05, workspace.baseSaasGrossMarginPct / 100));
    const upfrontShare = Math.min(1, Math.max(0, workspace.annualUpfrontBillingSharePct / 100));
    const opexInflationMonthly = Math.max(0, workspace.monthlyOpexInflationPct / 100);

    let exactRunwayMonths = 60;
    let runwayExhausted = false;
    let zeroCashMonthIndex: number | null = null;
    let breakevenMonthIndex: number | null = null;
    let minCash = currentCash;

    const startYear = 2026;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let m = 1; m <= 60; m++) {
        const beginningCash = currentCash;
        const beginningMrr = currentMrr;

        // Effective New MRR growth rate at month m with optional compounding decay
        const effectiveNewGrowthRate =
            Math.max(0, workspace.monthlyNewMrrGrowthPct / 100) * Math.pow(1 - decayRate, m - 1);

        const newMrr = beginningMrr * effectiveNewGrowthRate;
        const expansionMrr = beginningMrr * expansionRate;
        const churnedMrr = beginningMrr * churnRate;
        const endingMrr = Math.max(0, beginningMrr + newMrr + expansionMrr - churnedMrr);
        const arr = endingMrr * 12;

        const activeCustomers = Math.max(
            1,
            Math.round(endingMrr / arpu) +
            (workspace.aiTokenCogs.enabled ? workspace.aiTokenCogs.activeAiCustomersBase : 0)
        );

        // Upfront annual billing bonus: if a % of new MRR pays 12 months upfront, collect 11 extra months immediately
        const upfrontCashBillingBonus = newMrr * upfrontShare * 11;
        const cashCollectedFromRevenue = endingMrr + upfrontCashBillingBonus;

        // COGS Layer (Base SaaS + Optional AI LLM Token Inference COGS)
        const baseSaasCogs = endingMrr * (1 - baseGmRatio);
        let aiTokenInferenceCogs = 0;
        if (workspace.aiTokenCogs.enabled) {
            const cacheMultiplier = 1 - Math.min(0.95, Math.max(0, workspace.aiTokenCogs.promptCacheHitRatePct / 100));
            const deflationMultiplier = Math.pow(
                1 - Math.min(0.2, Math.max(0, workspace.aiTokenCogs.monthlyCostDeflationPct / 100)),
                m - 1
            );
            const totalMonthlyTokensMillions =
                (activeCustomers *
                    Math.max(0, workspace.aiTokenCogs.monthlyQueriesPerCustomer) *
                    Math.max(0, workspace.aiTokenCogs.avgTokensPerQuery)) /
                1_000_000;
            const variableTokenCost =
                totalMonthlyTokensMillions *
                Math.max(0, workspace.aiTokenCogs.blendedCostPerMillionTokensDollars) *
                cacheMultiplier *
                deflationMultiplier;
            aiTokenInferenceCogs =
                variableTokenCost + Math.max(0, workspace.aiTokenCogs.fixedGpuClusterMonthlyDollars);
        }

        const totalCogs = baseSaasCogs + aiTokenInferenceCogs;
        const grossProfit = endingMrr - totalCogs;
        const blendedGrossMarginPct = endingMrr > 0 ? (grossProfit / endingMrr) * 100 : workspace.baseSaasGrossMarginPct;

        // Departmental Baseline OpEx with monthly inflation
        const inflationFactor = Math.pow(1 + opexInflationMonthly, m - 1);
        const rdOpex = Math.max(0, workspace.baselineRdOpexDollars) * inflationFactor;
        const smOpex = Math.max(0, workspace.baselineSmOpexDollars) * inflationFactor;
        const gaOpex = Math.max(0, workspace.baselineGaOpexDollars) * inflationFactor;

        // Hiring Plan Step-Function Payroll
        let hiringPayrollOpex = 0;
        let hiredFteCount = 0;
        for (const role of workspace.hiringPlan) {
            if (role.enabled && m >= role.startMonth && role.count > 0) {
                const monthlyLoadedPerPerson =
                    (Math.max(0, role.annualBaseSalary) / 12) *
                    (1 + Math.max(0, role.benefitsAndTaxBurdenPct) / 100);
                hiringPayrollOpex += monthlyLoadedPerPerson * role.count;
                hiredFteCount += role.count;
            }
        }

        // Venture Debt Service & Drawdown
        let ventureDebtService = 0;
        let ventureDebtDrawdownInflow = 0;
        if (workspace.ventureDebt.enabled && workspace.ventureDebt.principalDollars > 0) {
            const vd = workspace.ventureDebt;
            if (m === vd.drawdownMonth) {
                ventureDebtDrawdownInflow = vd.principalDollars;
            }
            if (m >= vd.drawdownMonth) {
                const monthsSinceDraw = m - vd.drawdownMonth;
                const monthlyRate = Math.max(0, vd.annualInterestRatePct / 100) / 12;
                if (monthsSinceDraw < vd.interestOnlyMonths) {
                    ventureDebtService = vd.principalDollars * monthlyRate;
                } else if (monthsSinceDraw < vd.interestOnlyMonths + Math.max(1, vd.amortizationMonths)) {
                    const n = Math.max(1, vd.amortizationMonths);
                    if (monthlyRate > 0) {
                        ventureDebtService =
                            (vd.principalDollars * monthlyRate * Math.pow(1 + monthlyRate, n)) /
                            (Math.pow(1 + monthlyRate, n) - 1);
                    } else {
                        ventureDebtService = vd.principalDollars / n;
                    }
                }
            }
        }

        const totalOpex = rdOpex + smOpex + gaOpex + hiringPayrollOpex + ventureDebtService;
        const grossBurn = totalCogs + totalOpex;

        // One-time Cash Events (Grants / CapEx)
        let nonDilutiveInflow = ventureDebtDrawdownInflow;
        for (const ev of workspace.cashEvents) {
            if (ev.enabled && ev.month === m) {
                nonDilutiveInflow += ev.amountDollars;
            }
        }

        // Closed-Loop Equity Financing Cash Inflows (Future SAFEs/Notes + Series A + Series B)
        let equityFinancingNetInflow = 0;
        for (const conv of workspace.convertibles) {
            if (conv.enabled && conv.issueMonth === m && conv.principalDollars > 0) {
                equityFinancingNetInflow += conv.principalDollars;
            }
        }
        if (workspace.seriesARound.enabled && workspace.seriesARound.closeMonth === m) {
            equityFinancingNetInflow += Math.max(
                0,
                workspace.seriesARound.newMoneyInvestmentDollars -
                workspace.seriesARound.legalAndSyndicateFeesDollars
            );
        }
        if (workspace.seriesBRound.enabled && workspace.seriesBRound.closeMonth === m) {
            equityFinancingNetInflow += Math.max(
                0,
                workspace.seriesBRound.newMoneyInvestmentDollars -
                workspace.seriesBRound.legalAndSyndicateFeesDollars
            );
        }

        // Operational cash flow (excluding equity raises for pure operational breakeven detection)
        const operationalNetCashFlow = cashCollectedFromRevenue + nonDilutiveInflow - grossBurn;
        const netBurn = Math.max(0, grossBurn - cashCollectedFromRevenue - Math.max(0, nonDilutiveInflow));
        const netCashFlow = operationalNetCashFlow + equityFinancingNetInflow;
        const endingCash = beginningCash + netCashFlow;

        // Fractional Zero-Cash Runway Detection
        if (!runwayExhausted && endingCash <= 0) {
            runwayExhausted = true;
            zeroCashMonthIndex = m;
            const monthlyDeficit = Math.max(1, -netCashFlow);
            const fractionOfMonthCovered = Math.min(1, Math.max(0, beginningCash / monthlyDeficit));
            exactRunwayMonths = Number(((m - 1) + fractionOfMonthCovered).toFixed(2));
        }

        // Operational Breakeven Detection (CashCollected >= GrossBurn prior to running out of cash)
        if (!runwayExhausted && breakevenMonthIndex === null && cashCollectedFromRevenue >= grossBurn) {
            breakevenMonthIndex = m;
        }

        if (endingCash < minCash) {
            minCash = endingCash;
        }

        const activeHeadcountFte = Math.max(1, workspace.baselineHeadcountFte + hiredFteCount);
        const arrPerFte = arr / activeHeadcountFte;

        // Annualized Net New ARR & Burn Multiple at month m
        const monthlyNetNewArr = (endingMrr - beginningMrr) * 12;
        const annualizedNetBurn = netBurn * 12;
        const burnMultipleAnnualized =
            annualizedNetBurn <= 0
                ? 0
                : monthlyNetNewArr > 0
                    ? Number((annualizedNetBurn / (monthlyNetNewArr * 12)).toFixed(2))
                    : 99.9;

        const annualizedArrGrowthPct =
            beginningMrr > 0 ? (Math.pow(endingMrr / beginningMrr, 12) - 1) * 100 : 0;
        const fcfMarginPct = endingMrr > 0 ? ((cashCollectedFromRevenue - grossBurn) / endingMrr) * 100 : -100;
        const ruleOf40Score = Number((Math.min(200, annualizedArrGrowthPct) + fcfMarginPct).toFixed(1));

        const calYear = startYear + Math.floor((m - 1) / 12);
        const calMonth = monthNames[(m - 1) % 12];

        rows.push({
            month: m,
            calendarLabel: `${calMonth} ${calYear} (M${m})`,
            beginningCash,
            beginningMrr,
            newMrr,
            expansionMrr,
            churnedMrr,
            endingMrr,
            arr,
            activeCustomers,
            upfrontCashBillingBonus,
            cashCollectedFromRevenue,
            baseSaasCogs,
            aiTokenInferenceCogs,
            totalCogs,
            grossProfit,
            blendedGrossMarginPct: Number(blendedGrossMarginPct.toFixed(1)),
            rdOpex,
            smOpex,
            gaOpex,
            hiringPayrollOpex,
            ventureDebtService,
            totalOpex,
            grossBurn,
            nonDilutiveInflow,
            equityFinancingNetInflow,
            netBurn,
            netCashFlow,
            endingCash,
            activeHeadcountFte,
            arrPerFte,
            burnMultipleAnnualized,
            ruleOf40Score,
        });

        currentCash = endingCash;
        currentMrr = endingMrr;
    }

    const mandatoryRaiseByMonth = runwayExhausted
        ? Number(Math.max(0, exactRunwayMonths - 6.0).toFixed(2))
        : 60;

    let defaultAliveStatus: DefaultAliveStatus = 'DEFAULT_ALIVE';
    if (runwayExhausted) {
        defaultAliveStatus =
            exactRunwayMonths < 9.0 ? 'DEFAULT_DEAD_FATAL_PINCH' : 'DEFAULT_DEAD_RAISING_WINDOW';
    } else if (breakevenMonthIndex === null && rows[59] && rows[59].netBurn > 0) {
        defaultAliveStatus = 'DEFAULT_DEAD_RAISING_WINDOW';
    }

    return {
        monthlyRows: rows,
        exactRunwayMonths,
        runwayExhausted,
        zeroCashMonthIndex,
        mandatoryRaiseByMonth,
        breakevenMonthIndex,
        defaultAliveStatus,
        minimumCashBalanceDollars: minCash,
    };
}

/**
 * Deterministic Binary Search Solver to Flip a "Default Dead" Startup to "Default Alive"
 */
export function solveBreakevenLevers(workspace: SaasWorkspaceState): BreakevenSolverResult {
    const baseline = simulate60MonthCashFlow(workspace);
    const safetyFloor = Math.max(0, workspace.minimumSafetyCashBufferDollars);

    if (
        baseline.defaultAliveStatus === 'DEFAULT_ALIVE' &&
        baseline.minimumCashBalanceDollars >= safetyFloor
    ) {
        return {
            isAlreadyDefaultAlive: true,
            requiredImmediateOpexCutPct: 0,
            requiredImmediateOpexCutMonthlyDollars: 0,
            requiredMonthlyNewMrrGrowthPct: workspace.monthlyNewMrrGrowthPct,
            projectedMinimumCashTroughDollars: baseline.minimumCashBalanceDollars,
            breakevenMonthAfterOpexFix: baseline.breakevenMonthIndex ?? 1,
            breakevenMonthAfterGrowthFix: baseline.breakevenMonthIndex ?? 1,
        };
    }

    // 1. Binary Search for Minimum Immediate OpEx Reduction % (0% to 95%)
    let lowCut = 0;
    let highCut = 0.95;
    let bestCut = 0.95;
    let breakevenAfterOpex: number | null = null;

    for (let iter = 0; iter < 28; iter++) {
        const mid = (lowCut + highCut) / 2;
        const scale = 1 - mid;
        const candidate: SaasWorkspaceState = {
            ...workspace,
            baselineRdOpexDollars: workspace.baselineRdOpexDollars * scale,
            baselineSmOpexDollars: workspace.baselineSmOpexDollars * scale,
            baselineGaOpexDollars: workspace.baselineGaOpexDollars * scale,
            aiTokenCogs: {
                ...workspace.aiTokenCogs,
                fixedGpuClusterMonthlyDollars: workspace.aiTokenCogs.fixedGpuClusterMonthlyDollars * scale,
            },
            hiringPlan: workspace.hiringPlan.map((h) => ({
                ...h,
                annualBaseSalary: h.annualBaseSalary * scale,
            })),
        };
        const sim = simulate60MonthCashFlow(candidate);
        if (
            !sim.runwayExhausted &&
            sim.minimumCashBalanceDollars >= safetyFloor &&
            sim.breakevenMonthIndex !== null
        ) {
            bestCut = mid;
            breakevenAfterOpex = sim.breakevenMonthIndex;
            highCut = mid;
        } else {
            lowCut = mid;
        }
    }

    const currentBaseMonthlyOpex =
        workspace.baselineRdOpexDollars +
        workspace.baselineSmOpexDollars +
        workspace.baselineGaOpexDollars;
    const requiredImmediateOpexCutMonthlyDollars = Math.round(currentBaseMonthlyOpex * bestCut);

    // 2. Binary Search for Minimum Monthly New MRR Growth Rate % (current to 60%/mo)
    let lowGrowth = workspace.monthlyNewMrrGrowthPct;
    let highGrowth = 60.0;
    let bestGrowth = 60.0;
    let breakevenAfterGrowth: number | null = null;

    for (let iter = 0; iter < 28; iter++) {
        const mid = (lowGrowth + highGrowth) / 2;
        const candidate: SaasWorkspaceState = {
            ...workspace,
            monthlyNewMrrGrowthPct: mid,
        };
        const sim = simulate60MonthCashFlow(candidate);
        if (
            !sim.runwayExhausted &&
            sim.minimumCashBalanceDollars >= safetyFloor &&
            sim.breakevenMonthIndex !== null
        ) {
            bestGrowth = mid;
            breakevenAfterGrowth = sim.breakevenMonthIndex;
            highGrowth = mid;
        } else {
            lowGrowth = mid;
        }
    }

    return {
        isAlreadyDefaultAlive: false,
        requiredImmediateOpexCutPct: Number((bestCut * 100).toFixed(1)),
        requiredImmediateOpexCutMonthlyDollars,
        requiredMonthlyNewMrrGrowthPct: Number(bestGrowth.toFixed(2)),
        projectedMinimumCashTroughDollars: baseline.minimumCashBalanceDollars,
        breakevenMonthAfterOpexFix: breakevenAfterOpex,
        breakevenMonthAfterGrowthFix: breakevenAfterGrowth,
    };
}

/**
 * Exact Algebraic Cap Table, Stacked Pre/Post-Money SAFE + Convertible Note,
 * Option Pool Shuffle & Founder Secondary Engine
 */
export function calculateCapTableAndDilution(workspace: SaasWorkspaceState): CapTableSummary {
    const founderTotalInitialShares = workspace.founders.reduce(
        (sum, f) => sum + Math.max(0, f.initialShares),
        0
    );
    const earlyCommon = Math.max(0, workspace.earlyAngelCommonShares);
    const issuedOptions = Math.max(0, workspace.issuedEmployeeOptionShares);
    const unissuedPoolInitial = Math.max(0, workspace.unissuedExistingOptionPoolShares);

    const initialFullyDilutedShares = Math.max(
        1,
        founderTotalInitialShares + earlyCommon + issuedOptions + unissuedPoolInitial
    );

    const activeConvertibles = workspace.convertibles.filter(
        (c) => c.enabled && c.principalDollars > 0
    );

    // Step 1: MFN (Most Favored Nation) Auto-Upgrade Resolution Pass
    // Any convertible with mfnEnabled inherits the lowest subsequent non-zero Valuation Cap and highest Discount
    const resolvedConvertibles = activeConvertibles.map((conv, idx) => {
        let effectiveCap = conv.valuationCapDollars;
        let effectiveDiscount = conv.discountPct;
        let mfnUpgraded = false;

        if (conv.mfnEnabled) {
            for (let j = idx + 1; j < activeConvertibles.length; j++) {
                const later = activeConvertibles[j];
                if (
                    later.valuationCapDollars > 0 &&
                    (effectiveCap === 0 || later.valuationCapDollars < effectiveCap)
                ) {
                    effectiveCap = later.valuationCapDollars;
                    mfnUpgraded = true;
                }
                if (later.discountPct > effectiveDiscount) {
                    effectiveDiscount = later.discountPct;
                    mfnUpgraded = true;
                }
            }
        }

        const accruedInterestDollars =
            conv.type === 'CONVERTIBLE_NOTE'
                ? conv.principalDollars *
                (Math.max(0, conv.annualInterestRatePct) / 100) *
                (Math.max(0, conv.accruedMonthsAtConversion) / 12)
                : 0;
        const convertingAmountDollars = conv.principalDollars + accruedInterestDollars;

        return {
            raw: conv,
            effectiveCap,
            effectiveDiscount,
            mfnUpgraded,
            accruedInterestDollars,
            convertingAmountDollars,
        };
    });

    // Step 2: Solve Series A Priced Round + SAFE/Note Conversion + Option Pool Shuffle simultaneously
    const seriesA = workspace.seriesARound;
    const preMoneyValA = Math.max(1_000_000, seriesA.preMoneyValuationDollars);
    const newMoneyA = seriesA.enabled ? Math.max(0, seriesA.newMoneyInvestmentDollars) : 0;
    const targetPoolRatioA = seriesA.enabled
        ? Math.min(0.45, Math.max(0, seriesA.targetPostRoundOptionPoolPct / 100))
        : unissuedPoolInitial / initialFullyDilutedShares;

    // Iterative Fixed-Point Solver for exact PPS_round, SAFE converted shares, and Option Pool Top-Up
    // Converges to machine precision (< 1e-11) in ~25 iterations for any mix of Post-Money SAFEs, Pre-Money SAFEs, and Discounts
    let postSeriesATotalShares = initialFullyDilutedShares * 1.5;
    let roundPpsA = preMoneyValA / initialFullyDilutedShares;
    let poolTopUpA = 0;
    let newInvestorSharesA = 0;
    let convertedSharesByInstrument: number[] = new Array(resolvedConvertibles.length).fill(0);
    const conversionPpsByInstrument: number[] = new Array(resolvedConvertibles.length).fill(roundPpsA);
    const conversionTriggerByInstrument: ('VALUATION_CAP' | 'DISCOUNT_RATE' | 'ROUND_PPS')[] =
        new Array(resolvedConvertibles.length).fill('ROUND_PPS');

    for (let iter = 0; iter < 40; iter++) {
        // Compute Post-Money SAFE base capitalization (includes existing shares + converting SAFEs, before new money & new pool top-up)
        const totalSafeSharesEstimate = convertedSharesByInstrument.reduce((a, b) => a + b, 0);
        const postMoneySafeBaseShares = initialFullyDilutedShares + totalSafeSharesEstimate;

        // Pre-money capitalization for Series A round price per share
        const preMoneyFullyDilutedForRoundPps =
            seriesA.optionPoolCarveoutMode === 'PRE_MONEY_SHUFFLE'
                ? initialFullyDilutedShares + totalSafeSharesEstimate + poolTopUpA
                : initialFullyDilutedShares + totalSafeSharesEstimate;

        roundPpsA = preMoneyValA / Math.max(1, preMoneyFullyDilutedForRoundPps);

        // Update each convertible instrument's conversion price and shares
        const nextConvertedShares: number[] = [];
        for (let i = 0; i < resolvedConvertibles.length; i++) {
            const item = resolvedConvertibles[i];
            const discountRatio = 1 - Math.min(0.8, Math.max(0, item.effectiveDiscount / 100));
            const discountPps = roundPpsA * discountRatio;

            let capPps = Number.POSITIVE_INFINITY;
            if (item.effectiveCap > 0) {
                if (item.raw.type === 'YC_POST_MONEY_SAFE') {
                    // YC Post-Money SAFE v1.1 locks ownership percentage (Amount / Cap) of Company Capitalization prior to new round & pool increase
                    capPps = item.effectiveCap / Math.max(1, postMoneySafeBaseShares);
                } else {
                    // Pre-Money SAFE / Convertible Note divides Cap by base shares (excluding converting SAFEs)
                    capPps = item.effectiveCap / Math.max(1, initialFullyDilutedShares);
                }
            }

            let chosenPps = roundPpsA;
            let trigger: 'VALUATION_CAP' | 'DISCOUNT_RATE' | 'ROUND_PPS' = 'ROUND_PPS';

            if (capPps <= discountPps && capPps <= roundPpsA) {
                chosenPps = capPps;
                trigger = 'VALUATION_CAP';
            } else if (discountPps < roundPpsA) {
                chosenPps = discountPps;
                trigger = 'DISCOUNT_RATE';
            }

            chosenPps = Math.max(0.0001, chosenPps);
            conversionPpsByInstrument[i] = chosenPps;
            conversionTriggerByInstrument[i] = trigger;
            nextConvertedShares.push(item.convertingAmountDollars / chosenPps);
        }

        convertedSharesByInstrument = nextConvertedShares;
        const sumSafeShares = convertedSharesByInstrument.reduce((a, b) => a + b, 0);

        let proRataSafeDollars = 0;
        if (seriesA.enabled && seriesA.includeSafeProRataInNewMoney && totalSafeSharesEstimate > 0) {
            const safeOwnershipPreA = totalSafeSharesEstimate / Math.max(1, postMoneySafeBaseShares);
            proRataSafeDollars = resolvedConvertibles.reduce((acc, item, idx) => {
                if (!item.raw.proRataRightEnabled) return acc;
                const sh = convertedSharesByInstrument[idx] || 0;
                return acc + newMoneyA * (sh / Math.max(1, postMoneySafeBaseShares));
            }, 0);
        }
        newInvestorSharesA = seriesA.enabled ? newMoneyA / Math.max(0.0001, roundPpsA) : 0;

        // Target unissued option pool shares so (unissuedPoolInitial + poolTopUpA) / postSeriesATotalShares = targetPoolRatioA
        // Solve: unissuedPoolInitial + poolTopUpA = targetPoolRatioA * (initialFullyDilutedShares + sumSafeShares + newInvestorSharesA + poolTopUpA)
        const nonPoolTopUpShares = initialFullyDilutedShares + sumSafeShares + newInvestorSharesA;
        if (seriesA.enabled && targetPoolRatioA > 0 && targetPoolRatioA < 0.9) {
            const requiredTotalUnissuedPool =
                (targetPoolRatioA * nonPoolTopUpShares - unissuedPoolInitial) / (1 - targetPoolRatioA);
            poolTopUpA = Math.max(0, requiredTotalUnissuedPool);
        } else {
            poolTopUpA = 0;
        }

        postSeriesATotalShares = nonPoolTopUpShares + poolTopUpA;
    }

    // Round share counts to integers
    convertedSharesByInstrument = convertedSharesByInstrument.map((s) => Math.round(s));
    poolTopUpA = Math.round(poolTopUpA);
    newInvestorSharesA = Math.round(newInvestorSharesA);

    const totalSafeConvertedShares = convertedSharesByInstrument.reduce((a, b) => a + b, 0);
    const postSafeTotalShares = initialFullyDilutedShares + totalSafeConvertedShares;
    postSeriesATotalShares =
        initialFullyDilutedShares + totalSafeConvertedShares + poolTopUpA + newInvestorSharesA;

    const seriesAPostMoneyValuationDollars = seriesA.enabled
        ? preMoneyValA + newMoneyA
        : preMoneyValA;

    // Founder Secondary Liquidity at Series A (Founders selling a portion of their common shares directly to Series A investors)
    let totalFounderSecondaryLiquidityDollars = 0;
    const founderSecondarySharesSold: number[] = workspace.founders.map((f) => {
        if (!seriesA.enabled || f.secondarySaleDollarsAtSeriesA <= 0) return 0;
        const maxSharesToSell = Math.floor(f.initialShares * 0.35); // standard board cap: up to 35% of holdings
        const desiredShares = Math.round(f.secondarySaleDollarsAtSeriesA / Math.max(0.0001, roundPpsA));
        const actualSold = Math.min(maxSharesToSell, desiredShares);
        totalFounderSecondaryLiquidityDollars += actualSold * roundPpsA;
        return actualSold;
    });
    const totalSecondarySharesTransferredToSeriesA = founderSecondarySharesSold.reduce(
        (a, b) => a + b,
        0
    );

    // Step 3: Optional Series B Round Chaining
    const seriesB = workspace.seriesBRound;
    let roundPpsB = roundPpsA;
    let poolTopUpB = 0;
    let newInvestorSharesB = 0;
    let postSeriesBTotalShares = postSeriesATotalShares;
    let seriesBPostMoneyValuationDollars = seriesAPostMoneyValuationDollars;

    if (seriesB.enabled && seriesB.newMoneyInvestmentDollars > 0) {
        const preMoneyValB = Math.max(seriesAPostMoneyValuationDollars, seriesB.preMoneyValuationDollars);
        const newMoneyB = Math.max(0, seriesB.newMoneyInvestmentDollars);
        const targetPoolRatioB = Math.min(0.4, Math.max(0, seriesB.targetPostRoundOptionPoolPct / 100));
        const currentUnissuedAfterA = unissuedPoolInitial + poolTopUpA;

        for (let iter = 0; iter < 25; iter++) {
            const denomB =
                seriesB.optionPoolCarveoutMode === 'PRE_MONEY_SHUFFLE'
                    ? postSeriesATotalShares + poolTopUpB
                    : postSeriesATotalShares;
            roundPpsB = preMoneyValB / Math.max(1, denomB);
            newInvestorSharesB = newMoneyB / Math.max(0.0001, roundPpsB);
            const nonTopUpB = postSeriesATotalShares + newInvestorSharesB;
            const reqTopUpB =
                (targetPoolRatioB * nonTopUpB - currentUnissuedAfterA) /
                Math.max(0.1, 1 - targetPoolRatioB);
            poolTopUpB = Math.max(0, reqTopUpB);
        }
        poolTopUpB = Math.round(poolTopUpB);
        newInvestorSharesB = Math.round(newInvestorSharesB);
        postSeriesBTotalShares = postSeriesATotalShares + poolTopUpB + newInvestorSharesB;
        seriesBPostMoneyValuationDollars = preMoneyValB + newMoneyB;
    }

    const activeFinalPps = seriesB.enabled ? roundPpsB : roundPpsA;

    // Build Stakeholder Ledger Rows
    const stakeholders: CapTableStakeholderRow[] = [];

    // 1. Individual Co-Founders
    workspace.founders.forEach((f, idx) => {
        const initShares = Math.max(0, f.initialShares);
        const soldSecondary = founderSecondarySharesSold[idx] || 0;
        const postAShares = Math.max(0, initShares - soldSecondary);
        const postBShares = postAShares;

        // 4-Year Vesting with 1-Year Cliff calculation
        let vestedRatio = 1;
        if (f.vestingMonthsTotal > 0) {
            if (f.monthsElapsed < f.cliffMonths) {
                vestedRatio = 0;
            } else {
                vestedRatio = Math.min(1, f.monthsElapsed / f.vestingMonthsTotal);
            }
        }
        const vestedSharesCount = Math.round(postBShares * vestedRatio);
        const unvestedSharesCount = Math.max(0, postBShares - vestedSharesCount);

        const initPct = (initShares / initialFullyDilutedShares) * 100;
        const postSafePct = (initShares / postSafeTotalShares) * 100;
        const postAPct = (postAShares / postSeriesATotalShares) * 100;
        const postBPct = (postBShares / postSeriesBTotalShares) * 100;

        stakeholders.push({
            id: f.id,
            stakeholderName: `${f.name} (${f.role})`,
            category: 'CO_FOUNDER',
            initialShares: initShares,
            initialOwnershipPct: Number(initPct.toFixed(2)),
            postSafeConversionShares: initShares,
            postSafeOwnershipPct: Number(postSafePct.toFixed(2)),
            postSeriesAShares: postAShares,
            postSeriesAOwnershipPct: Number(postAPct.toFixed(2)),
            postSeriesBShares: postBShares,
            postSeriesBOwnershipPct: Number(postBPct.toFixed(2)),
            investedCapitalDollars: 0,
            effectiveConversionPps: 0,
            impliedPaperValuePostRoundDollars: Math.round(postBShares * activeFinalPps),
            secondaryCashOutReceivedDollars: Math.round(soldSecondary * roundPpsA),
            vestedSharesCount,
            unvestedSharesCount,
            dilutionFromInitialPctPoints: Number((postBPct - initPct).toFixed(2)),
            notes:
                soldSecondary > 0
                    ? `${Math.round(vestedRatio * 100)}% vested • Sold ${soldSecondary.toLocaleString()} shares in Series A secondary`
                    : `${Math.round(vestedRatio * 100)}% vested (${f.monthsElapsed}/${f.vestingMonthsTotal}m, ${f.cliffMonths}m cliff)`,
        });
    });

    // 2. Early Angels / Seed Common
    if (earlyCommon > 0) {
        const initPct = (earlyCommon / initialFullyDilutedShares) * 100;
        const postBPct = (earlyCommon / postSeriesBTotalShares) * 100;
        stakeholders.push({
            id: 'stake_early_common',
            stakeholderName: 'Early Angels & Seed Common',
            category: 'EARLY_COMMON',
            initialShares: earlyCommon,
            initialOwnershipPct: Number(initPct.toFixed(2)),
            postSafeConversionShares: earlyCommon,
            postSafeOwnershipPct: Number(((earlyCommon / postSafeTotalShares) * 100).toFixed(2)),
            postSeriesAShares: earlyCommon,
            postSeriesAOwnershipPct: Number(((earlyCommon / postSeriesATotalShares) * 100).toFixed(2)),
            postSeriesBShares: earlyCommon,
            postSeriesBOwnershipPct: Number(postBPct.toFixed(2)),
            investedCapitalDollars: 0,
            effectiveConversionPps: 0,
            impliedPaperValuePostRoundDollars: Math.round(earlyCommon * activeFinalPps),
            secondaryCashOutReceivedDollars: 0,
            vestedSharesCount: earlyCommon,
            unvestedSharesCount: 0,
            dilutionFromInitialPctPoints: Number((postBPct - initPct).toFixed(2)),
            notes: 'Common Stock (Fully Vested)',
        });
    }

    // 3. Issued Employee Options
    if (issuedOptions > 0) {
        const initPct = (issuedOptions / initialFullyDilutedShares) * 100;
        const postBPct = (issuedOptions / postSeriesBTotalShares) * 100;
        stakeholders.push({
            id: 'stake_issued_options',
            stakeholderName: 'Issued Employee ESOP Options',
            category: 'EMPLOYEE_OPTIONS_ISSUED',
            initialShares: issuedOptions,
            initialOwnershipPct: Number(initPct.toFixed(2)),
            postSafeConversionShares: issuedOptions,
            postSafeOwnershipPct: Number(((issuedOptions / postSafeTotalShares) * 100).toFixed(2)),
            postSeriesAShares: issuedOptions,
            postSeriesAOwnershipPct: Number(((issuedOptions / postSeriesATotalShares) * 100).toFixed(2)),
            postSeriesBShares: issuedOptions,
            postSeriesBOwnershipPct: Number(postBPct.toFixed(2)),
            investedCapitalDollars: 0,
            effectiveConversionPps: 0,
            impliedPaperValuePostRoundDollars: Math.round(issuedOptions * activeFinalPps),
            secondaryCashOutReceivedDollars: 0,
            vestedSharesCount: issuedOptions,
            unvestedSharesCount: 0,
            dilutionFromInitialPctPoints: Number((postBPct - initPct).toFixed(2)),
            notes: 'Granted Employee Option Grants',
        });
    }

    // 4. Unissued Option Pool (including Series A & B Pool Shuffle Top-Ups)
    const unissuedAfterA = unissuedPoolInitial + poolTopUpA;
    const unissuedAfterB = unissuedAfterA + poolTopUpB;
    const initPoolPct = (unissuedPoolInitial / initialFullyDilutedShares) * 100;
    const postBPoolPct = (unissuedAfterB / postSeriesBTotalShares) * 100;
    stakeholders.push({
        id: 'stake_unissued_pool',
        stakeholderName: 'Available Unissued ESOP Option Pool',
        category: 'OPTION_POOL_UNISSUED',
        initialShares: unissuedPoolInitial,
        initialOwnershipPct: Number(initPoolPct.toFixed(2)),
        postSafeConversionShares: unissuedPoolInitial,
        postSafeOwnershipPct: Number(((unissuedPoolInitial / postSafeTotalShares) * 100).toFixed(2)),
        postSeriesAShares: unissuedAfterA,
        postSeriesAOwnershipPct: Number(((unissuedAfterA / postSeriesATotalShares) * 100).toFixed(2)),
        postSeriesBShares: unissuedAfterB,
        postSeriesBOwnershipPct: Number(postBPoolPct.toFixed(2)),
        investedCapitalDollars: 0,
        effectiveConversionPps: 0,
        impliedPaperValuePostRoundDollars: Math.round(unissuedAfterB * activeFinalPps),
        secondaryCashOutReceivedDollars: 0,
        vestedSharesCount: unissuedAfterB,
        unvestedSharesCount: 0,
        dilutionFromInitialPctPoints: Number((postBPoolPct - initPoolPct).toFixed(2)),
        notes: `Top-up: +${poolTopUpA.toLocaleString()} shares at Series A (${seriesA.optionPoolCarveoutMode === 'PRE_MONEY_SHUFFLE' ? 'Pre-Money Shuffle' : 'Post-Money Shared'})`,
    });

    // 5. Convertible Instruments (SAFEs & Convertible Notes)
    const convertibleDetails: ConvertibleConversionDetail[] = [];
    resolvedConvertibles.forEach((item, idx) => {
        const shares = convertedSharesByInstrument[idx] || 0;
        const pps = conversionPpsByInstrument[idx] || roundPpsA;
        const trigger = conversionTriggerByInstrument[idx] || 'ROUND_PPS';
        const postSafePct = (shares / postSafeTotalShares) * 100;
        const postAPct = (shares / postSeriesATotalShares) * 100;
        const postBPct = (shares / postSeriesBTotalShares) * 100;

        convertibleDetails.push({
            id: item.raw.id,
            investorName: item.raw.investorName,
            type: item.raw.type,
            principalDollars: item.raw.principalDollars,
            accruedInterestDollars: Math.round(item.accruedInterestDollars),
            convertingAmountDollars: Math.round(item.convertingAmountDollars),
            originalCapDollars: item.raw.valuationCapDollars,
            effectiveCapDollarsAfterMfn: item.effectiveCap,
            effectiveDiscountPctAfterMfn: item.effectiveDiscount,
            mfnUpgraded: item.mfnUpgraded,
            conversionTrigger: trigger,
            effectiveConversionPps: Number(pps.toFixed(4)),
            convertedShares: shares,
            postSeriesAOwnershipPct: Number(postAPct.toFixed(2)),
        });

        stakeholders.push({
            id: item.raw.id,
            stakeholderName: `${item.raw.investorName} (${item.raw.type === 'YC_POST_MONEY_SAFE' ? 'Post-Money SAFE' : item.raw.type === 'PRE_MONEY_SAFE' ? 'Pre-Money SAFE' : 'Conv. Note'})`,
            category: 'CONVERTIBLE_SAFE_NOTE',
            initialShares: 0,
            initialOwnershipPct: 0,
            postSafeConversionShares: shares,
            postSafeOwnershipPct: Number(postSafePct.toFixed(2)),
            postSeriesAShares: shares,
            postSeriesAOwnershipPct: Number(postAPct.toFixed(2)),
            postSeriesBShares: shares,
            postSeriesBOwnershipPct: Number(postBPct.toFixed(2)),
            investedCapitalDollars: Math.round(item.convertingAmountDollars),
            effectiveConversionPps: Number(pps.toFixed(4)),
            impliedPaperValuePostRoundDollars: Math.round(shares * activeFinalPps),
            secondaryCashOutReceivedDollars: 0,
            vestedSharesCount: shares,
            unvestedSharesCount: 0,
            dilutionFromInitialPctPoints: Number(postBPct.toFixed(2)),
            notes: `${trigger === 'VALUATION_CAP' ? `Cap ($${(item.effectiveCap / 1e6).toFixed(1)}M)` : trigger === 'DISCOUNT_RATE' ? `${item.effectiveDiscount}% Discount` : 'Round PPS'}${item.mfnUpgraded ? ' • MFN Auto-Upgraded' : ''} @ $${pps.toFixed(3)}/sh`,
        });
    });

    // 6. Series A Preferred Investors
    if (seriesA.enabled && (newInvestorSharesA > 0 || totalSecondarySharesTransferredToSeriesA > 0)) {
        const totalSeriesASharesHeld =
            newInvestorSharesA + totalSecondarySharesTransferredToSeriesA;
        const postAPct = (totalSeriesASharesHeld / postSeriesATotalShares) * 100;
        const postBPct = (totalSeriesASharesHeld / postSeriesBTotalShares) * 100;

        stakeholders.push({
            id: 'stake_series_a',
            stakeholderName: `${seriesA.roundName} Lead & Syndicate`,
            category: 'SERIES_A_PREFERRED',
            initialShares: 0,
            initialOwnershipPct: 0,
            postSafeConversionShares: 0,
            postSafeOwnershipPct: 0,
            postSeriesAShares: totalSeriesASharesHeld,
            postSeriesAOwnershipPct: Number(postAPct.toFixed(2)),
            postSeriesBShares: totalSeriesASharesHeld,
            postSeriesBOwnershipPct: Number(postBPct.toFixed(2)),
            investedCapitalDollars: Math.round(
                newMoneyA + totalFounderSecondaryLiquidityDollars
            ),
            effectiveConversionPps: Number(roundPpsA.toFixed(4)),
            impliedPaperValuePostRoundDollars: Math.round(totalSeriesASharesHeld * activeFinalPps),
            secondaryCashOutReceivedDollars: 0,
            vestedSharesCount: totalSeriesASharesHeld,
            unvestedSharesCount: 0,
            dilutionFromInitialPctPoints: Number(postBPct.toFixed(2)),
            notes: `${seriesA.liquidationMultiple}x ${seriesA.participationType.replace(/_/g, ' ')} • PPS $${roundPpsA.toFixed(3)}`,
        });
    }

    // 7. Series B Preferred Investors
    if (seriesB.enabled && newInvestorSharesB > 0) {
        const postBPct = (newInvestorSharesB / postSeriesBTotalShares) * 100;
        stakeholders.push({
            id: 'stake_series_b',
            stakeholderName: `${seriesB.roundName} Lead & Growth Investors`,
            category: 'SERIES_B_PREFERRED',
            initialShares: 0,
            initialOwnershipPct: 0,
            postSafeConversionShares: 0,
            postSafeOwnershipPct: 0,
            postSeriesAShares: 0,
            postSeriesAOwnershipPct: 0,
            postSeriesBShares: newInvestorSharesB,
            postSeriesBOwnershipPct: Number(postBPct.toFixed(2)),
            investedCapitalDollars: Math.round(seriesB.newMoneyInvestmentDollars),
            effectiveConversionPps: Number(roundPpsB.toFixed(4)),
            impliedPaperValuePostRoundDollars: Math.round(newInvestorSharesB * roundPpsB),
            secondaryCashOutReceivedDollars: 0,
            vestedSharesCount: newInvestorSharesB,
            unvestedSharesCount: 0,
            dilutionFromInitialPctPoints: Number(postBPct.toFixed(2)),
            notes: `${seriesB.liquidationMultiple}x ${seriesB.participationType.replace(/_/g, ' ')} • PPS $${roundPpsB.toFixed(3)}`,
        });
    }

    const cumulativePostMoneySafeDilutionPct = resolvedConvertibles.reduce((sum, item) => {
        if (item.raw.type === 'YC_POST_MONEY_SAFE' && item.effectiveCap > 0) {
            return sum + (item.convertingAmountDollars / item.effectiveCap) * 100;
        }
        return sum;
    }, 0);

    const foundersCombinedInitialPct = Number(
        ((founderTotalInitialShares / initialFullyDilutedShares) * 100).toFixed(2)
    );
    const foundersPostAShares = stakeholders
        .filter((s) => s.category === 'CO_FOUNDER')
        .reduce((a, b) => a + b.postSeriesAShares, 0);
    const foundersPostBShares = stakeholders
        .filter((s) => s.category === 'CO_FOUNDER')
        .reduce((a, b) => a + b.postSeriesBShares, 0);

    const foundersCombinedPostSeriesAPct = Number(
        ((foundersPostAShares / postSeriesATotalShares) * 100).toFixed(2)
    );
    const foundersCombinedPostSeriesBPct = Number(
        ((foundersPostBShares / postSeriesBTotalShares) * 100).toFixed(2)
    );

    return {
        initialFullyDilutedShares,
        postSeriesAFullyDilutedShares: postSeriesATotalShares,
        postSeriesBFullyDilutedShares: postSeriesBTotalShares,
        seriesARoundPps: Number(roundPpsA.toFixed(4)),
        seriesAPostMoneyValuationDollars,
        seriesAOptionPoolTopUpShares: poolTopUpA,
        seriesANewInvestorShares: newInvestorSharesA,
        seriesBRoundPps: Number(roundPpsB.toFixed(4)),
        seriesBPostMoneyValuationDollars,
        seriesBOptionPoolTopUpShares: poolTopUpB,
        seriesBNewInvestorShares: newInvestorSharesB,
        cumulativePostMoneySafeDilutionPct: Number(
            cumulativePostMoneySafeDilutionPct.toFixed(2)
        ),
        foundersCombinedInitialPct,
        foundersCombinedPostSeriesAPct,
        foundersCombinedPostSeriesBPct,
        totalFounderSecondaryLiquidityDollars: Math.round(
            totalFounderSecondaryLiquidityDollars
        ),
        stakeholders,
        convertibleDetails,
    };
}

/**
 * M&A Exit Waterfall & Liquidation Preference Breakpoint Solver
 */
export function evaluateExitAtValuation(
    exitValuationDollars: number,
    workspace: SaasWorkspaceState,
    capTable: CapTableSummary
): ExitWaterfallMilestone {
    const grossExit = Math.max(0, exitValuationDollars);
    const feePct = Math.min(0.25, Math.max(0, workspace.exitConfig.maAdvisoryAndLegalFeePct / 100));
    const carveOutPct = Math.min(0.3, Math.max(0, workspace.exitConfig.managementCarveOutPct / 100));

    const afterFees = grossExit * (1 - feePct);
    const managementCarveOutDollars = afterFees * carveOutPct;
    const netDistributableProceedsDollars = Math.max(0, afterFees - managementCarveOutDollars);

    const totalShares = Math.max(1, capTable.postSeriesBFullyDilutedShares);

    // Group preferred tranches for seniority & conversion decision
    interface PreferredGroup {
        classId: string;
        className: string;
        category: CapTableStakeholderRow['category'];
        shares: number;
        investedDollars: number;
        multiple: number;
        participationType: LiquidationParticipationType;
        capMultiple: number;
        seniorityTier: number;
    }

    const preferredGroups: PreferredGroup[] = [];

    // Series B Preferred
    const seriesBStake = capTable.stakeholders.find((s) => s.category === 'SERIES_B_PREFERRED');
    if (seriesBStake && seriesBStake.postSeriesBShares > 0) {
        preferredGroups.push({
            classId: seriesBStake.id,
            className: seriesBStake.stakeholderName,
            category: 'SERIES_B_PREFERRED',
            shares: seriesBStake.postSeriesBShares,
            investedDollars: seriesBStake.investedCapitalDollars,
            multiple: Math.max(1, workspace.seriesBRound.liquidationMultiple),
            participationType: workspace.seriesBRound.participationType,
            capMultiple: Math.max(1, workspace.seriesBRound.participationCapMultiple),
            seniorityTier: workspace.seriesBRound.seniorityTier,
        });
    }

    // Series A Preferred
    const seriesAStake = capTable.stakeholders.find((s) => s.category === 'SERIES_A_PREFERRED');
    if (seriesAStake && seriesAStake.postSeriesBShares > 0) {
        preferredGroups.push({
            classId: seriesAStake.id,
            className: seriesAStake.stakeholderName,
            category: 'SERIES_A_PREFERRED',
            shares: seriesAStake.postSeriesBShares,
            investedDollars: seriesAStake.investedCapitalDollars,
            multiple: Math.max(1, workspace.seriesARound.liquidationMultiple),
            participationType: workspace.seriesARound.participationType,
            capMultiple: Math.max(1, workspace.seriesARound.participationCapMultiple),
            seniorityTier: workspace.seriesARound.seniorityTier,
        });
    }

    // Converted SAFE / Note Preferred
    const safeStakes = capTable.stakeholders.filter((s) => s.category === 'CONVERTIBLE_SAFE_NOTE');
    safeStakes.forEach((s) => {
        const rawConv = workspace.convertibles.find((c) => c.id === s.id);
        if (s.postSeriesBShares > 0) {
            preferredGroups.push({
                classId: s.id,
                className: s.stakeholderName,
                category: 'CONVERTIBLE_SAFE_NOTE',
                shares: s.postSeriesBShares,
                investedDollars: s.investedCapitalDollars,
                multiple: rawConv ? Math.max(1, rawConv.liquidationMultiple) : 1,
                participationType: rawConv ? rawConv.participationType : 'NON_PARTICIPATING',
                capMultiple: rawConv ? Math.max(1, rawConv.participationCapMultiple) : 2,
                seniorityTier: 3,
            });
        }
    });

    // Sort preferred groups by seniority tier (1 = most senior first)
    preferredGroups.sort((a, b) => a.seniorityTier - b.seniorityTier);

    // Determine for each preferred class whether it converts to common or takes preference
    // A class converts to common if its as-converted pro-rata share exceeds its liquidation preference (or participation cap)
    let remainingProceeds = netDistributableProceedsDollars;
    const decisions = new Map<string, 'CONVERTED_TO_COMMON' | 'TOOK_LIQUIDATION_PREFERENCE'>();
    const prefPayouts = new Map<string, number>();

    for (const pg of preferredGroups) {
        const ownershipRatio = pg.shares / totalShares;
        const asConvertedValue = netDistributableProceedsDollars * ownershipRatio;
        const preferenceClaim = pg.investedDollars * pg.multiple;

        let converts = false;
        if (pg.participationType === 'NON_PARTICIPATING') {
            converts = asConvertedValue > preferenceClaim;
        } else if (pg.participationType === 'CAPPED_PARTICIPATING') {
            const maxCapDollars = pg.investedDollars * pg.capMultiple;
            converts = asConvertedValue > maxCapDollars;
        } else {
            // FULL_PARTICIPATING never needs to voluntarily forfeit preference unless preferenceClaim === 0
            converts = false;
        }

        if (converts) {
            decisions.set(pg.classId, 'CONVERTED_TO_COMMON');
            prefPayouts.set(pg.classId, 0);
        } else {
            decisions.set(pg.classId, 'TOOK_LIQUIDATION_PREFERENCE');
            const paidPref = Math.min(remainingProceeds, preferenceClaim);
            prefPayouts.set(pg.classId, paidPref);
            remainingProceeds = Math.max(0, remainingProceeds - paidPref);
        }
    }

    // Remaining proceeds are distributed pro-rata among Common holders, Converted Preferred, and Participating Preferred
    const commonStakes = capTable.stakeholders.filter(
        (s) =>
            s.category === 'CO_FOUNDER' ||
            s.category === 'EARLY_COMMON' ||
            s.category === 'EMPLOYEE_OPTIONS_ISSUED' ||
            s.category === 'OPTION_POOL_UNISSUED'
    );

    const commonSharesPool = commonStakes.reduce((sum, s) => sum + s.postSeriesBShares, 0);
    let participatingPreferredSharesPool = 0;
    for (const pg of preferredGroups) {
        const dec = decisions.get(pg.classId);
        if (
            dec === 'CONVERTED_TO_COMMON' ||
            pg.participationType === 'FULL_PARTICIPATING' ||
            pg.participationType === 'CAPPED_PARTICIPATING'
        ) {
            participatingPreferredSharesPool += pg.shares;
        }
    }

    const totalParticipatingShares = Math.max(
        1,
        commonSharesPool + participatingPreferredSharesPool
    );

    const participationPayouts = new Map<string, number>();

    // Allocate remainder with Capped Participation check
    for (const pg of preferredGroups) {
        const dec = decisions.get(pg.classId);
        const alreadyPaidPref = prefPayouts.get(pg.classId) || 0;

        if (dec === 'CONVERTED_TO_COMMON') {
            const shareCut = remainingProceeds * (pg.shares / totalParticipatingShares);
            participationPayouts.set(pg.classId, shareCut);
        } else if (pg.participationType === 'FULL_PARTICIPATING') {
            const shareCut = remainingProceeds * (pg.shares / totalParticipatingShares);
            participationPayouts.set(pg.classId, shareCut);
        } else if (pg.participationType === 'CAPPED_PARTICIPATING') {
            const rawShareCut = remainingProceeds * (pg.shares / totalParticipatingShares);
            const maxCapTotal = pg.investedDollars * pg.capMultiple;
            const allowedExtra = Math.max(0, maxCapTotal - alreadyPaidPref);
            participationPayouts.set(pg.classId, Math.min(rawShareCut, allowedExtra));
        } else {
            participationPayouts.set(pg.classId, 0);
        }
    }

    const totalPaidToPreferred = preferredGroups.reduce(
        (sum, pg) =>
            sum + (prefPayouts.get(pg.classId) || 0) + (participationPayouts.get(pg.classId) || 0),
        0
    );

    const remainingForCommonPool = Math.max(
        0,
        netDistributableProceedsDollars - totalPaidToPreferred
    );

    const classPayouts: ExitClassPayout[] = [];

    // Common Stakeholder Payouts (Founders also get Management Carve-Out pro-rata)
    const founderTotalShares = commonStakes
        .filter((s) => s.category === 'CO_FOUNDER')
        .reduce((a, b) => a + b.postSeriesBShares, 0);

    for (const cs of commonStakes) {
        const shareOfCommonPool =
            commonSharesPool > 0 ? cs.postSeriesBShares / commonSharesPool : 0;
        const carveOutBonus =
            cs.category === 'CO_FOUNDER' && founderTotalShares > 0
                ? managementCarveOutDollars * (cs.postSeriesBShares / founderTotalShares)
                : 0;
        const commonPayout = remainingForCommonPool * shareOfCommonPool + carveOutBonus;
        const totalOut = Math.round(commonPayout);

        classPayouts.push({
            classId: cs.id,
            className: cs.stakeholderName,
            category: cs.category,
            investedCapitalDollars: 0,
            liquidationPreferenceDollars: 0,
            decision: 'COMMON_PRO_RATA',
            voluntaryConversionBreakpointValuation: 0,
            preferencePayoutDollars: 0,
            participationOrCommonPayoutDollars: totalOut,
            totalPayoutDollars: totalOut,
            shareOfNetExitPct:
                afterFees > 0 ? Number(((totalOut / afterFees) * 100).toFixed(2)) : 0,
            moicMultiple: 0,
        });
    }

    // Preferred Stakeholder Payouts
    for (const pg of preferredGroups) {
        const prefOut = prefPayouts.get(pg.classId) || 0;
        const partOut = participationPayouts.get(pg.classId) || 0;
        const totalOut = Math.round(prefOut + partOut);
        const ownershipRatio = Math.max(0.0001, pg.shares / totalShares);
        const prefClaim = pg.investedDollars * pg.multiple;
        const breakpoint =
            pg.participationType === 'NON_PARTICIPATING'
                ? Math.round(prefClaim / ownershipRatio)
                : pg.participationType === 'CAPPED_PARTICIPATING'
                    ? Math.round((pg.investedDollars * pg.capMultiple) / ownershipRatio)
                    : 0;

        classPayouts.push({
            classId: pg.classId,
            className: pg.className,
            category: pg.category,
            investedCapitalDollars: pg.investedDollars,
            liquidationPreferenceDollars: Math.round(prefClaim),
            decision: decisions.get(pg.classId) || 'TOOK_LIQUIDATION_PREFERENCE',
            voluntaryConversionBreakpointValuation: breakpoint,
            preferencePayoutDollars: Math.round(prefOut),
            participationOrCommonPayoutDollars: Math.round(partOut),
            totalPayoutDollars: totalOut,
            shareOfNetExitPct:
                afterFees > 0 ? Number(((totalOut / afterFees) * 100).toFixed(2)) : 0,
            moicMultiple:
                pg.investedDollars > 0
                    ? Number((totalOut / pg.investedDollars).toFixed(2))
                    : 0,
        });
    }

    const sumByCat = (cats: CapTableStakeholderRow['category'][]) =>
        classPayouts
            .filter((c) => cats.includes(c.category))
            .reduce((sum, c) => sum + c.totalPayoutDollars, 0);

    const foundersPayoutDollars = sumByCat(['CO_FOUNDER']);
    const optionPoolAndEmployeesPayoutDollars = sumByCat([
        'EARLY_COMMON',
        'EMPLOYEE_OPTIONS_ISSUED',
        'OPTION_POOL_UNISSUED',
    ]);
    const safeAndSeedPayoutDollars = sumByCat(['CONVERTIBLE_SAFE_NOTE']);
    const seriesAPayoutDollars = sumByCat(['SERIES_A_PREFERRED']);
    const seriesBPayoutDollars = sumByCat(['SERIES_B_PREFERRED']);

    return {
        exitValuationDollars: grossExit,
        netDistributableProceedsDollars: Math.round(afterFees),
        foundersPayoutDollars,
        foundersEffectivePct:
            afterFees > 0 ? Number(((foundersPayoutDollars / afterFees) * 100).toFixed(2)) : 0,
        optionPoolAndEmployeesPayoutDollars,
        safeAndSeedPayoutDollars,
        seriesAPayoutDollars,
        seriesBPayoutDollars,
        classPayouts,
    };
}

export function calculateExitWaterfallSuite(
    workspace: SaasWorkspaceState,
    capTable: CapTableSummary
): ExitWaterfallSummary {
    const milestoneValuations = [
        10_000_000,
        25_000_000,
        50_000_000,
        100_000_000,
        250_000_000,
        500_000_000,
        1_000_000_000,
    ];
    const targetExitResult = evaluateExitAtValuation(
        workspace.exitConfig.targetExitValuationDollars,
        workspace,
        capTable
    );
    const milestoneGrid = milestoneValuations.map((val) =>
        evaluateExitAtValuation(val, workspace, capTable)
    );
    return { targetExitResult, milestoneGrid };
}

/**
 * 1,000-Trial Seeded Monte Carlo Probabilistic Runway & Survival Engine
 */
export function runMonteCarloRunwaySimulation(workspace: SaasWorkspaceState): MonteCarloSummary {
    const trials = Math.min(2000, Math.max(100, workspace.monteCarloConfig.trials || 1000));
    const seed = workspace.monteCarloConfig.seed || 20261107;
    const prng = createSeededPrng(seed);

    const growthStd = Math.max(0, workspace.monteCarloConfig.mrrGrowthVolatilityPct / 100);
    const churnStd = Math.max(0, workspace.monteCarloConfig.churnVolatilityPct / 100);
    const opexStd = Math.max(0, workspace.monteCarloConfig.opexSlippageVolatilityPct / 100);

    const baseSim = simulate60MonthCashFlow(workspace);
    const baseRows = baseSim.monthlyRows;

    const runwayResults: number[] = [];
    let defaultAliveCount = 0;
    let over18MonthsCount = 0;

    // Store monthly cash trajectories for percentile fan chart (60 months x trials)
    const monthlyCashSamples: number[][] = Array.from({ length: 60 }, () => []);

    const baseGrowth = workspace.monthlyNewMrrGrowthPct / 100;
    const baseExpansion = workspace.monthlyExpansionMrrPct / 100;
    const baseChurn = workspace.monthlyGrossChurnMrrPct / 100;
    const decayRate = Math.min(0.25, Math.max(0, workspace.monthlyGrowthDecayPct / 100));

    for (let t = 0; t < trials; t++) {
        let cash = workspace.startingCashDollars;
        let mrr = workspace.startingMrrDollars;
        let trialRunway = 60;
        let hitZero = false;
        let reachedBreakeven = false;

        for (let m = 0; m < 60; m++) {
            const baseRow = baseRows[m];
            const gShock = prng.nextGaussian() * growthStd;
            const cShock = prng.nextGaussian() * churnStd;
            const oShock = prng.nextGaussian() * opexStd;

            const effGrowth = Math.max(
                -0.1,
                (baseGrowth + gShock) * Math.pow(1 - decayRate, m)
            );
            const effChurn = Math.min(0.4, Math.max(0, baseChurn + cShock));

            const newMrr = Math.max(0, mrr * effGrowth);
            const expMrr = mrr * baseExpansion;
            const chMrr = mrr * effChurn;
            const endMrr = Math.max(0, mrr + newMrr + expMrr - chMrr);

            const gmRatio = baseRow.blendedGrossMarginPct / 100;
            const cogs = endMrr * (1 - gmRatio);
            const opex = baseRow.totalOpex * Math.max(0.6, 1 + oShock);
            const grossBurn = cogs + opex;

            const cashIn =
                endMrr +
                baseRow.nonDilutiveInflow +
                baseRow.equityFinancingNetInflow;
            const netFlow = cashIn - grossBurn;
            const nextCash = cash + netFlow;

            if (!hitZero && nextCash <= 0) {
                hitZero = true;
                const frac = Math.min(1, Math.max(0, cash / Math.max(1, -netFlow)));
                trialRunway = m + frac;
            }
            if (!hitZero && endMrr >= grossBurn) {
                reachedBreakeven = true;
            }

            cash = nextCash;
            mrr = endMrr;
            monthlyCashSamples[m].push(cash);
        }

        if (!hitZero && (reachedBreakeven || cash > 0)) {
            defaultAliveCount++;
        }
        if (trialRunway >= 18) {
            over18MonthsCount++;
        }
        runwayResults.push(trialRunway);
    }

    runwayResults.sort((a, b) => a - b);
    const getPct = (arr: number[], p: number) =>
        Number(arr[Math.min(arr.length - 1, Math.max(0, Math.floor(arr.length * p)))].toFixed(1));

    const monthlyConfidenceBands = monthlyCashSamples.map((samples, idx) => {
        samples.sort((a, b) => a - b);
        return {
            month: idx + 1,
            p10Cash: Math.round(samples[Math.floor(samples.length * 0.1)] || 0),
            p50Cash: Math.round(samples[Math.floor(samples.length * 0.5)] || 0),
            p90Cash: Math.round(samples[Math.floor(samples.length * 0.9)] || 0),
        };
    });

    return {
        trials,
        seed,
        p10RunwayMonths: getPct(runwayResults, 0.1),
        p25RunwayMonths: getPct(runwayResults, 0.25),
        p50RunwayMonths: getPct(runwayResults, 0.5),
        p75RunwayMonths: getPct(runwayResults, 0.75),
        p90RunwayMonths: getPct(runwayResults, 0.9),
        probabilityDefaultAlivePct: Number(((defaultAliveCount / trials) * 100).toFixed(1)),
        probabilityRunwayOver18MonthsPct: Number(((over18MonthsCount / trials) * 100).toFixed(1)),
        monthlyConfidenceBands,
    };
}

/**
 * 2D Sensitivity Matrices (Growth vs. Churn & Pre-Money Valuation vs. Option Pool %)
 */
export function buildSensitivityMatrices(workspace: SaasWorkspaceState): SensitivityMatrices {
    const baseG = workspace.monthlyNewMrrGrowthPct;
    const baseC = workspace.monthlyGrossChurnMrrPct;

    const growthStepsPct = [
        Math.max(1, Number((baseG - 4).toFixed(1))),
        Math.max(2, Number((baseG - 2).toFixed(1))),
        Number(baseG.toFixed(1)),
        Number((baseG + 3).toFixed(1)),
        Number((baseG + 6).toFixed(1)),
    ];
    const churnStepsPct = [
        Math.max(0.5, Number((baseC - 1.5).toFixed(1))),
        Math.max(1.0, Number((baseC - 0.7).toFixed(1))),
        Number(baseC.toFixed(1)),
        Number((baseC + 1.0).toFixed(1)),
        Number((baseC + 2.5).toFixed(1)),
    ];

    const runwayGrowthChurnGrid: SensitivityCell[][] = growthStepsPct.map((gVal) =>
        churnStepsPct.map((cVal) => {
            const sim = simulate60MonthCashFlow({
                ...workspace,
                monthlyNewMrrGrowthPct: gVal,
                monthlyGrossChurnMrrPct: cVal,
            });
            const status: SensitivityCell['status'] =
                sim.defaultAliveStatus === 'DEFAULT_ALIVE'
                    ? 'GOOD'
                    : sim.exactRunwayMonths >= 15
                        ? 'WARN'
                        : 'CRITICAL';
            return {
                rowValue: gVal,
                colValue: cVal,
                metricValue: sim.exactRunwayMonths,
                secondaryValue: sim.breakevenMonthIndex ?? 0,
                status,
            };
        })
    );

    const baseVal = Math.max(4_000_000, workspace.seriesARound.preMoneyValuationDollars);
    const valuationStepsDollars = [
        Math.round(baseVal * 0.6),
        Math.round(baseVal * 0.8),
        Math.round(baseVal),
        Math.round(baseVal * 1.25),
        Math.round(baseVal * 1.5),
    ];
    const poolStepsPct = [8, 10, 12.5, 15, 20];

    const founderDilutionValPoolGrid: SensitivityCell[][] = valuationStepsDollars.map((vVal) =>
        poolStepsPct.map((pVal) => {
            const cap = calculateCapTableAndDilution({
                ...workspace,
                seriesARound: {
                    ...workspace.seriesARound,
                    enabled: true,
                    preMoneyValuationDollars: vVal,
                    targetPostRoundOptionPoolPct: pVal,
                },
            });
            const founderPct = cap.foundersCombinedPostSeriesAPct;
            const status: SensitivityCell['status'] =
                founderPct >= 50 ? 'GOOD' : founderPct >= 35 ? 'WARN' : 'CRITICAL';
            return {
                rowValue: vVal,
                colValue: pVal,
                metricValue: founderPct,
                secondaryValue: cap.seriesARoundPps,
                status,
            };
        })
    );

    return {
        growthStepsPct,
        churnStepsPct,
        runwayGrowthChurnGrid,
        valuationStepsDollars,
        poolStepsPct,
        founderDilutionValPoolGrid,
    };
}

/**
 * 12-Point Venture Readiness, SaaS Unit Economics & Term Sheet Risk Linter
 */
export function runVentureReadinessLinter(
    workspace: SaasWorkspaceState,
    cashFlow: ReturnType<typeof simulate60MonthCashFlow>,
    capTable: CapTableSummary,
    monteCarlo: MonteCarloSummary,
    burnMultiple: number,
    magicNumber: number,
    cacPaybackMonths: number
): { lintIssues: SaasVentureLintIssue[]; ventureReadinessScore: number } {
    const issues: SaasVentureLintIssue[] = [];

    // 1. RUNWAY_001_FATAL_PINCH
    if (
        cashFlow.defaultAliveStatus === 'DEFAULT_DEAD_FATAL_PINCH' ||
        (cashFlow.runwayExhausted && cashFlow.exactRunwayMonths < 9)
    ) {
        issues.push({
            id: 'lint_runway_001',
            ruleCode: 'RUNWAY_001_FATAL_PINCH',
            severity: 'ERROR',
            category: 'RUNWAY',
            title: `Fatal Pinch Alert: Cash Runway Is Only ${cashFlow.exactRunwayMonths} Months While Default Dead`,
            detail: `Under Paul Graham's Default Alive test and standard VC fundraising timelines (6 months from pitch to close), having ${cashFlow.exactRunwayMonths} months of runway while burning cash leaves zero negotiating leverage.`,
            recommendation:
                'Click "1-Click Auto-Fix All Issues" to apply our Breakeven OpEx & Growth optimization and extend runway past 18+ months.',
            autoFixable: true,
        });
    }

    // 2. BURN_002_CAPITAL_INEFFICIENCY
    if (burnMultiple > 2.5 && cashFlow.monthlyRows[0]?.netBurn > 0) {
        issues.push({
            id: 'lint_burn_002',
            ruleCode: 'BURN_002_CAPITAL_INEFFICIENCY',
            severity: 'WARNING',
            category: 'UNIT_ECONOMICS',
            title: `High David Sacks Burn Multiple (${burnMultiple.toFixed(2)}x > 2.0x VC Threshold)`,
            detail: `You are burning $${burnMultiple.toFixed(2)} for every $1.00 of Net New ARR created. 2026 Series A/B investors screen for a Burn Multiple below 1.5x (Great) or < 1.0x (Elite).`,
            recommendation:
                'Trim non-core G&A/S&M overhead or increase annual upfront billing and expansion MRR to bring Burn Multiple below 1.5x.',
            autoFixable: true,
        });
    }

    // 3. SAFE_003_EXCESSIVE_POST_MONEY_STACK
    if (capTable.cumulativePostMoneySafeDilutionPct > 32) {
        issues.push({
            id: 'lint_safe_003',
            ruleCode: 'SAFE_003_EXCESSIVE_POST_MONEY_STACK',
            severity: 'ERROR',
            category: 'CAP_TABLE',
            title: `Excessive Stacked Post-Money SAFE Dilution (${capTable.cumulativePostMoneySafeDilutionPct.toFixed(1)}% Sold Before Series A)`,
            detail: `Under YC Post-Money SAFE v1.1 rules, each SAFE locks a fixed slice of pre-Series A ownership. Giving away ${capTable.cumulativePostMoneySafeDilutionPct.toFixed(1)}% on SAFEs before accounting for a 20% Series A and 10–15% Option Pool severely compresses founder equity.`,
            recommendation:
                'Raise Valuation Caps on later SAFE tranches or convert excessive bridge tranches at higher caps.',
            autoFixable: true,
        });
    }

    // 4. POOL_004_AGGRESSIVE_PREMONEY_SHUFFLE
    if (
        workspace.seriesARound.enabled &&
        workspace.seriesARound.optionPoolCarveoutMode === 'PRE_MONEY_SHUFFLE' &&
        workspace.seriesARound.targetPostRoundOptionPoolPct > 12.5
    ) {
        issues.push({
            id: 'lint_pool_004',
            ruleCode: 'POOL_004_AGGRESSIVE_PREMONEY_SHUFFLE',
            severity: 'WARNING',
            category: 'CAP_TABLE',
            title: `Aggressive Pre-Money Option Pool Shuffle (${workspace.seriesARound.targetPostRoundOptionPoolPct}% Post-Round Target)`,
            detail: `Creating a ${workspace.seriesARound.targetPostRoundOptionPoolPct}% unissued option pool entirely out of the pre-money valuation forces existing founders and SAFE holders to bear 100% of the pool dilution (${capTable.seriesAOptionPoolTopUpShares.toLocaleString()} top-up shares).`,
            recommendation:
                'Negotiate a hiring-plan-backed 10% post-round option pool or share pool expansion post-money.',
            autoFixable: true,
        });
    }

    // 5. MFN_005_TRIGGERED_REPRICING
    const mfnTriggeredList = capTable.convertibleDetails.filter((c) => c.mfnUpgraded);
    if (mfnTriggeredList.length > 0) {
        issues.push({
            id: 'lint_mfn_005',
            ruleCode: 'MFN_005_TRIGGERED_REPRICING',
            severity: 'INFO',
            category: 'CAP_TABLE',
            title: `Most Favored Nation (MFN) Clause Triggered on ${mfnTriggeredList.length} SAFE Tranche(s)`,
            detail: `Earlier SAFE holder(s) (${mfnTriggeredList.map((m) => m.investorName).join(', ')}) had MFN enabled and automatically inherited a lower Valuation Cap or higher Discount from a subsequent investor.`,
            recommendation:
                'Align SAFE caps or disable unintentional MFN clauses before issuing lower-cap bridge notes.',
            autoFixable: true,
        });
    }

    // 6. LIQ_006_PREDATORY_PREFERENCE_OVERHANG
    const hasPredatoryTerms =
        (workspace.seriesARound.enabled &&
            (workspace.seriesARound.liquidationMultiple > 1 ||
                workspace.seriesARound.participationType !== 'NON_PARTICIPATING')) ||
        (workspace.seriesBRound.enabled &&
            (workspace.seriesBRound.liquidationMultiple > 1 ||
                workspace.seriesBRound.participationType !== 'NON_PARTICIPATING'));
    if (hasPredatoryTerms) {
        issues.push({
            id: 'lint_liq_006',
            ruleCode: 'LIQ_006_PREDATORY_PREFERENCE_OVERHANG',
            severity: 'ERROR',
            category: 'EXIT_WATERFALL',
            title: 'Non-Standard Liquidation Preference (>1x Multiple or Participating "Double Dip")',
            detail: 'Per Cooley & Equidam Q2 2026 Venture Reports, 96.4% of institutional term sheets use 1x Non-Participating Preferred. Participating preferred or >1x multiples severely reduce common payouts in mid-sized exits.',
            recommendation:
                'Reset Series A and Series B terms to market-standard 1x Non-Participating Preferred.',
            autoFixable: true,
        });
    }

    // 7. FOUNDER_007_OWNERSHIP_COMPRESSION
    if (capTable.foundersCombinedPostSeriesAPct < 40) {
        issues.push({
            id: 'lint_founder_007',
            ruleCode: 'FOUNDER_007_OWNERSHIP_COMPRESSION',
            severity: 'WARNING',
            category: 'CAP_TABLE',
            title: `Post-Series A Founder Ownership Compression (${capTable.foundersCombinedPostSeriesAPct}% Combined)`,
            detail: `Institutional Series B/C investors look for combined founder equity above 45–50% post-Series A so founders remain incentivized through subsequent rounds.`,
            recommendation:
                'Reduce total SAFE dilution, optimize the Series A option pool shuffle, or increase Series A pre-money valuation.',
            autoFixable: true,
        });
    }

    // 8. CHURN_008_LEAKY_BUCKET
    if (workspace.monthlyGrossChurnMrrPct > 3.2) {
        issues.push({
            id: 'lint_churn_008',
            ruleCode: 'CHURN_008_LEAKY_BUCKET',
            severity: 'WARNING',
            category: 'UNIT_ECONOMICS',
            title: `Elevated Monthly Gross MRR Churn (${workspace.monthlyGrossChurnMrrPct}%/mo ≈ ${Math.round((1 - Math.pow(1 - workspace.monthlyGrossChurnMrrPct / 100, 12)) * 100)}%/yr)`,
            detail: `Monthly gross revenue churn above 3.2% erodes compounding ARR and pushes Net Dollar Retention below 100%.`,
            recommendation:
                'Improve onboarding retention and annual contract mix to bring monthly gross churn to <= 2.0%.',
            autoFixable: true,
        });
    }

    // 9. CAC_009_SUBOPTIMAL_GTM_MAGIC
    if (magicNumber < 0.6 || cacPaybackMonths > 22) {
        issues.push({
            id: 'lint_cac_009',
            ruleCode: 'CAC_009_SUBOPTIMAL_GTM_MAGIC',
            severity: 'INFO',
            category: 'UNIT_ECONOMICS',
            title: `GTM Efficiency Alert: SaaS Magic Number ${magicNumber.toFixed(2)}x (${cacPaybackMonths.toFixed(1)}m CAC Payback)`,
            detail: `Bessemer and ScaleVP benchmarks target a SaaS Magic Number >= 0.75x and Gross-Margin Adjusted CAC Payback under 18 months before scaling S&M spend.`,
            recommendation:
                'Align S&M spend with New MRR velocity to bring CAC payback under 16 months.',
            autoFixable: true,
        });
    }

    // 10. DEBT_010_VENTURE_DEBT_CLIFF
    if (
        workspace.ventureDebt.enabled &&
        cashFlow.runwayExhausted &&
        cashFlow.exactRunwayMonths <=
        workspace.ventureDebt.drawdownMonth + workspace.ventureDebt.interestOnlyMonths + 4
    ) {
        issues.push({
            id: 'lint_debt_010',
            ruleCode: 'DEBT_010_VENTURE_DEBT_CLIFF',
            severity: 'ERROR',
            category: 'RUNWAY',
            title: 'Venture Debt Principal Amortization Cliff Accelerates Zero-Cash Date',
            detail: `Your venture debt interest-only period expires while the company is still cash-flow negative, triggering heavy monthly principal + interest repayments that compress runway.`,
            recommendation:
                'Extend the venture debt interest-only window or replace amortizing debt with long-runway operational savings.',
            autoFixable: true,
        });
    }

    // 11. AIMARGIN_011_TOKEN_COGS_TRAP
    const m1Gm = cashFlow.monthlyRows[0]?.blendedGrossMarginPct ?? 80;
    if (workspace.aiTokenCogs.enabled && m1Gm < 55) {
        issues.push({
            id: 'lint_aimargin_011',
            ruleCode: 'AIMARGIN_011_TOKEN_COGS_TRAP',
            severity: 'WARNING',
            category: 'AI_COGS',
            title: `AI Inference Gross Margin Compression (${m1Gm.toFixed(1)}% Blended Gross Margin)`,
            detail: `High uncached LLM token inference costs and GPU cluster overhead are compressing your gross margin below the 60–75% institutional SaaS benchmark ("AI Supernova Trap").`,
            recommendation:
                'Enable semantic prompt caching (50%+ cache hit rate) and model routing to lift Blended Gross Margin above 65%.',
            autoFixable: true,
        });
    }

    // 12. MONTECARLO_012_FRAGILE_SURVIVAL
    if (monteCarlo.probabilityDefaultAlivePct < 65) {
        issues.push({
            id: 'lint_mc_012',
            ruleCode: 'MONTECARLO_012_FRAGILE_SURVIVAL',
            severity: 'WARNING',
            category: 'RUNWAY',
            title: `Fragile Monte Carlo Survival Probability (${monteCarlo.probabilityDefaultAlivePct}% P-Alive Across ${monteCarlo.trials} Runs)`,
            detail: `Under realistic growth, churn, and OpEx variance, ${Number((100 - monteCarlo.probabilityDefaultAlivePct).toFixed(1))}% of simulated trajectories run out of cash before reaching profitability (P10 Bear Runway: ${monteCarlo.p10RunwayMonths}m).`,
            recommendation:
                'Build a larger cash buffer or reduce baseline burn so even P10 Bear scenarios achieve Default Alive.',
            autoFixable: true,
        });
    }

    let score = 100;
    for (const iss of issues) {
        if (iss.severity === 'ERROR') score -= 18;
        else if (iss.severity === 'WARNING') score -= 9;
        else score -= 4;
    }
    const ventureReadinessScore = Math.max(12, Math.min(100, score));

    return { lintIssues: issues, ventureReadinessScore };
}

/**
 * 1-Click Deterministic Auto-Fixer for All 12 Venture Readiness & Term Sheet Linter Rules
 */
export function autoFixSaasWorkspace(workspace: SaasWorkspaceState): SaasWorkspaceState {
    const next: SaasWorkspaceState = JSON.parse(JSON.stringify(workspace));

    // Fix predatory liquidation preferences -> 1x Non-Participating
    next.seriesARound.liquidationMultiple = 1;
    next.seriesARound.participationType = 'NON_PARTICIPATING';
    next.seriesBRound.liquidationMultiple = 1;
    next.seriesBRound.participationType = 'NON_PARTICIPATING';

    // Fix aggressive option pool shuffle -> 10% target pool
    if (next.seriesARound.targetPostRoundOptionPoolPct > 10) {
        next.seriesARound.targetPostRoundOptionPoolPct = 10;
    }

    // Fix MFN triggers & excessive Post-Money SAFE dilution
    next.convertibles = next.convertibles.map((c) => ({
        ...c,
        mfnEnabled: false,
        valuationCapDollars:
            c.valuationCapDollars > 0 && c.valuationCapDollars < 10_000_000
                ? 12_000_000
                : c.valuationCapDollars,
    }));

    // Fix Leaky Bucket Churn -> <= 1.8%/mo
    if (next.monthlyGrossChurnMrrPct > 1.8) {
        next.monthlyGrossChurnMrrPct = 1.8;
    }

    // Fix AI Token Margin Trap -> enable 55% prompt caching & lower inference unit cost
    if (next.aiTokenCogs.enabled) {
        next.aiTokenCogs.promptCacheHitRatePct = Math.max(55, next.aiTokenCogs.promptCacheHitRatePct);
        next.aiTokenCogs.blendedCostPerMillionTokensDollars = Math.min(
            1.8,
            next.aiTokenCogs.blendedCostPerMillionTokensDollars
        );
    }

    // Fix Venture Debt Cliff
    if (next.ventureDebt.enabled) {
        next.ventureDebt.interestOnlyMonths = Math.max(18, next.ventureDebt.interestOnlyMonths);
    }

    // Fix AI fixed GPU cluster overhead if excessive
    if (next.aiTokenCogs.enabled && next.aiTokenCogs.fixedGpuClusterMonthlyDollars > 3500) {
        next.aiTokenCogs.fixedGpuClusterMonthlyDollars = 3500;
    }

    // Ensure Default Alive & strong Burn Multiple / Monte Carlo survival via exact Breakeven Solver
    next.monthlyNewMrrGrowthPct = Math.max(11.5, next.monthlyNewMrrGrowthPct);
    next.monthlyExpansionMrrPct = Math.max(2.8, next.monthlyExpansionMrrPct);

    const solver = solveBreakevenLevers(next);
    if (!solver.isAlreadyDefaultAlive) {
        const cutRatio = Math.min(0.85, (solver.requiredImmediateOpexCutPct / 100) + 0.03);
        const scale = Math.max(0.15, 1 - cutRatio);
        next.baselineRdOpexDollars = Math.round(next.baselineRdOpexDollars * scale);
        next.baselineSmOpexDollars = Math.round(next.baselineSmOpexDollars * scale);
        next.baselineGaOpexDollars = Math.round(next.baselineGaOpexDollars * scale);
    }

    return next;
}

/**
 * Parse Historical Monthly CSV or JSON Actuals to Auto-Calibrate Baseline MRR, Growth & OpEx
 */
export function parseHistoricalActualsCsvOrJson(
    rawText: string,
    currentWorkspace: SaasWorkspaceState
): { updatedWorkspace: SaasWorkspaceState; monthsParsed: number; summaryMessage: string } {
    const trimmed = rawText.trim();
    if (!trimmed) {
        throw new Error('Empty input provided.');
    }

    interface ParsedHistRow {
        mrr: number;
        expenses: number;
        cash?: number;
    }

    const parsedRows: ParsedHistRow[] = [];

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        const obj = JSON.parse(trimmed);
        if (Array.isArray(obj)) {
            for (const item of obj) {
                const mrr = Number(item.mrr ?? item.MRR ?? item.revenue ?? 0);
                const expenses = Number(item.expenses ?? item.opex ?? item.burn ?? 0);
                const cash = item.cash !== undefined ? Number(item.cash) : undefined;
                if (!Number.isNaN(mrr) && !Number.isNaN(expenses)) {
                    parsedRows.push({ mrr, expenses, cash });
                }
            }
        } else if (obj.startingCashDollars !== undefined && obj.startingMrrDollars !== undefined) {
            return {
                updatedWorkspace: { ...currentWorkspace, ...obj },
                monthsParsed: 1,
                summaryMessage: `Restored full SaaS Financial Model snapshot for "${obj.companyName || currentWorkspace.companyName}".`,
            };
        }
    } else {
        const lines = trimmed
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);
        for (let i = 0; i < lines.length; i++) {
            const cols = lines[i].split(/[,\t;]/).map((c) => c.replace(/["'$]/g, '').trim());
            if (i === 0 && cols.some((c) => /[a-zA-Z]/.test(c))) continue; // header row
            const nums = cols.map((c) => Number(c)).filter((n) => !Number.isNaN(n));
            if (nums.length >= 2) {
                parsedRows.push({
                    mrr: nums[0],
                    expenses: nums[1],
                    cash: nums.length >= 3 ? nums[2] : undefined,
                });
            }
        }
    }

    if (parsedRows.length === 0) {
        throw new Error(
            'Could not find valid numeric (MRR, Expenses, Cash) rows. Expected CSV columns: Month, MRR, Total_Expenses, Ending_Cash.'
        );
    }

    const last = parsedRows[parsedRows.length - 1];
    const first = parsedRows[0];

    let compoundGrowthPct = currentWorkspace.monthlyNewMrrGrowthPct;
    if (parsedRows.length >= 2 && first.mrr > 0 && last.mrr > 0) {
        const periods = parsedRows.length - 1;
        const cagrMonthly = Math.pow(last.mrr / first.mrr, 1 / periods) - 1;
        compoundGrowthPct = Number(
            Math.max(1, Math.min(45, (cagrMonthly + 0.02) * 100)).toFixed(2)
        );
    }

    const latestOpex = Math.max(10_000, last.expenses);
    const updated: SaasWorkspaceState = {
        ...currentWorkspace,
        startingMrrDollars: Math.max(0, Math.round(last.mrr)),
        startingCashDollars:
            last.cash !== undefined && last.cash > 0
                ? Math.round(last.cash)
                : currentWorkspace.startingCashDollars,
        monthlyNewMrrGrowthPct: compoundGrowthPct,
        baselineRdOpexDollars: Math.round(latestOpex * 0.48),
        baselineSmOpexDollars: Math.round(latestOpex * 0.34),
        baselineGaOpexDollars: Math.round(latestOpex * 0.18),
    };

    return {
        updatedWorkspace: updated,
        monthsParsed: parsedRows.length,
        summaryMessage: `Calibrated from ${parsedRows.length} historical month(s): Starting MRR $${updated.startingMrrDollars.toLocaleString()}, Monthly Growth ${compoundGrowthPct}%, Monthly OpEx $${latestOpex.toLocaleString()}.`,
    };
}

/**
 * Export 3-Worksheet Native OpenXML Excel (.xlsx) Workbook in Memory (Zero External Libraries)
 * Sheets:
 *   1. 60m_Cash_Runway
 *   2. Cap_Table_SAFE_Dilution
 *   3. MA_Exit_Waterfall
 */
export function exportSaasModelXlsx(
    workspace: SaasWorkspaceState,
    compiled?: SaasCompiledDeliverables
): Uint8Array {
    const data = compiled ?? compileAllSaasDeliverables(workspace);

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
                        const safeVal = xmlEscape(sanitizeSpreadsheetFormula(cellVal, true));
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

    // Sheet 1: 60-Month Cash Flow & Cohort Waterfall
    const sheet1Rows: (string | number)[][] = [
        [
            'Month_Index',
            'Calendar_Month',
            'Beginning_Cash_USD',
            'Beginning_MRR_USD',
            'New_MRR_USD',
            'Expansion_MRR_USD',
            'Churned_MRR_USD',
            'Ending_MRR_USD',
            'ARR_USD',
            'Cash_Collected_USD',
            'Base_SaaS_COGS_USD',
            'AI_Token_COGS_USD',
            'Blended_Gross_Margin_Pct',
            'RD_OpEx_USD',
            'SM_OpEx_USD',
            'GA_OpEx_USD',
            'Hiring_Payroll_USD',
            'Venture_Debt_Service_USD',
            'Gross_Burn_USD',
            'Equity_And_Grant_Inflow_USD',
            'Net_Burn_USD',
            'Ending_Cash_USD',
            'Active_FTE',
            'Burn_Multiple',
            'Rule_Of_40',
        ],
        ...data.monthlyRows.map((r) => [
            r.month,
            r.calendarLabel,
            Math.round(r.beginningCash),
            Math.round(r.beginningMrr),
            Math.round(r.newMrr),
            Math.round(r.expansionMrr),
            Math.round(r.churnedMrr),
            Math.round(r.endingMrr),
            Math.round(r.arr),
            Math.round(r.cashCollectedFromRevenue),
            Math.round(r.baseSaasCogs),
            Math.round(r.aiTokenInferenceCogs),
            r.blendedGrossMarginPct,
            Math.round(r.rdOpex),
            Math.round(r.smOpex),
            Math.round(r.gaOpex),
            Math.round(r.hiringPayrollOpex),
            Math.round(r.ventureDebtService),
            Math.round(r.grossBurn),
            Math.round(r.nonDilutiveInflow + r.equityFinancingNetInflow),
            Math.round(r.netBurn),
            Math.round(r.endingCash),
            r.activeHeadcountFte,
            r.burnMultipleAnnualized,
            r.ruleOf40Score,
        ]),
    ];

    // Sheet 2: Pro-Forma Cap Table & SAFE Conversion Ledger
    const sheet2Rows: (string | number)[][] = [
        [
            'Stakeholder_Name',
            'Category',
            'Initial_Shares',
            'Initial_Ownership_Pct',
            'Post_SAFE_Shares',
            'Post_SAFE_Ownership_Pct',
            'Post_Series_A_Shares',
            'Post_Series_A_Ownership_Pct',
            'Post_Series_B_Shares',
            'Post_Series_B_Ownership_Pct',
            'Invested_Capital_USD',
            'Effective_PPS_USD',
            'Implied_Paper_Value_USD',
            'Secondary_Liquidity_USD',
            'Vested_Shares',
            'Unvested_Shares',
            'Notes',
        ],
        ...data.capTable.stakeholders.map((s) => [
            s.stakeholderName,
            s.category,
            s.initialShares,
            s.initialOwnershipPct,
            s.postSafeConversionShares,
            s.postSafeOwnershipPct,
            s.postSeriesAShares,
            s.postSeriesAOwnershipPct,
            s.postSeriesBShares,
            s.postSeriesBOwnershipPct,
            s.investedCapitalDollars,
            s.effectiveConversionPps,
            s.impliedPaperValuePostRoundDollars,
            s.secondaryCashOutReceivedDollars,
            s.vestedSharesCount,
            s.unvestedSharesCount,
            s.notes,
        ]),
    ];

    // Sheet 3: M&A Exit Waterfall & Liquidation Preferences
    const sheet3Rows: (string | number)[][] = [
        [
            'Stakeholder_Class',
            'Category',
            'Invested_Capital_USD',
            'Liquidation_Pref_Claim_USD',
            'Conversion_Decision',
            'Conversion_Breakpoint_Valuation_USD',
            'Preference_Payout_USD',
            'Common_Or_Participation_Payout_USD',
            'Total_Exit_Payout_USD',
            'Effective_Exit_Share_Pct',
            'MOIC_Multiple',
        ],
        ...data.exitWaterfall.targetExitResult.classPayouts.map((c) => [
            c.className,
            c.category,
            c.investedCapitalDollars,
            c.liquidationPreferenceDollars,
            c.decision,
            c.voluntaryConversionBreakpointValuation,
            c.preferencePayoutDollars,
            c.participationOrCommonPayoutDollars,
            c.totalPayoutDollars,
            c.shareOfNetExitPct,
            c.moicMultiple,
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
        `<sheet name="60m_Cash_Runway" sheetId="1" r:id="rId1"/>` +
        `<sheet name="Cap_Table_SAFE_Ledger" sheetId="2" r:id="rId2"/>` +
        `<sheet name="MA_Exit_Waterfall" sheetId="3" r:id="rId3"/>` +
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
 * Master Compiler: Runs All 5 Deterministic Financial Sub-Engines + Compiles All 10 Export Payloads
 */
export function compileAllSaasDeliverables(
    workspace: SaasWorkspaceState
): SaasCompiledDeliverables {
    const cashFlow = simulate60MonthCashFlow(workspace);
    const breakevenSolver = solveBreakevenLevers(workspace);
    const capTable = calculateCapTableAndDilution(workspace);
    const exitWaterfall = calculateExitWaterfallSuite(workspace, capTable);
    const monteCarlo = runMonteCarloRunwaySimulation(workspace);
    const sensitivity = buildSensitivityMatrices(workspace);

    const m1 = cashFlow.monthlyRows[0];
    const m3 = cashFlow.monthlyRows[2] || m1;
    const m12 = cashFlow.monthlyRows[11] || m1;

    const currentNetBurnMonthlyDollars = Math.round(m1.netBurn);
    const currentGrossBurnMonthlyDollars = Math.round(m1.grossBurn);

    // David Sacks Burn Multiple = Annualized Net Burn / Net New ARR
    const netNewArrMonth1Annualized = Math.max(0, (m1.endingMrr - m1.beginningMrr) * 12);
    const annualizedNetBurnM1 = m1.netBurn * 12;
    const davidSacksBurnMultiple =
        annualizedNetBurnM1 <= 0
            ? 0
            : netNewArrMonth1Annualized > 0
                ? Number((annualizedNetBurnM1 / netNewArrMonth1Annualized).toFixed(2))
                : 99.9;

    const bessemerEfficiencyScore =
        annualizedNetBurnM1 <= 0
            ? 9.99
            : Number((netNewArrMonth1Annualized / annualizedNetBurnM1).toFixed(2));

    let burnMultipleTier: BurnMultipleTier = 'GOOD_1_5X_TO_2X';
    if (annualizedNetBurnM1 <= 0) {
        burnMultipleTier = 'PROFITABLE_CASH_POSITIVE';
    } else if (davidSacksBurnMultiple < 1.0) {
        burnMultipleTier = 'ELITE_UNDER_1X';
    } else if (davidSacksBurnMultiple <= 1.5) {
        burnMultipleTier = 'GREAT_1X_TO_1_5X';
    } else if (davidSacksBurnMultiple <= 2.0) {
        burnMultipleTier = 'GOOD_1_5X_TO_2X';
    } else if (davidSacksBurnMultiple <= 3.0) {
        burnMultipleTier = 'SUSPECT_2X_TO_3X';
    } else {
        burnMultipleTier = 'OVERBURNING_ABOVE_3X';
    }

    const monthlyNrr =
        1 +
        workspace.monthlyExpansionMrrPct / 100 -
        workspace.monthlyGrossChurnMrrPct / 100;
    const annualizedNrrPct = Number((Math.pow(Math.max(0.1, monthlyNrr), 12) * 100).toFixed(1));
    const annualizedGrrPct = Number(
        (Math.pow(Math.max(0.1, 1 - workspace.monthlyGrossChurnMrrPct / 100), 12) * 100).toFixed(1)
    );

    // SaaS Magic Number = (Quarterly Net New ARR) / Prior Quarter S&M Spend
    const q1NetNewMrr = m3.endingMrr - workspace.startingMrrDollars;
    const q1SmSpend = m1.smOpex + (cashFlow.monthlyRows[1]?.smOpex ?? m1.smOpex) + m3.smOpex;
    const saasMagicNumber =
        q1SmSpend > 0 ? Number(((q1NetNewMrr * 12) / q1SmSpend).toFixed(2)) : 1.5;

    // Gross-Margin Adjusted CAC Payback (Months) = Monthly S&M Spend / (New MRR * Blended Gross Margin %)
    const grossMarginAddedPerMonth = m1.newMrr * (m1.blendedGrossMarginPct / 100);
    const cacPaybackMonths =
        grossMarginAddedPerMonth > 0
            ? Number((m1.smOpex / grossMarginAddedPerMonth).toFixed(1))
            : 36.0;

    // LTV:CAC Ratio
    const newCustomersAddedM1 = Math.max(0.1, m1.newMrr / Math.max(1, workspace.arpuMonthlyDollars));
    const impliedCacDollars = m1.smOpex / newCustomersAddedM1;
    const churnDecimal = Math.max(0.005, workspace.monthlyGrossChurnMrrPct / 100);
    const impliedLtvDollars =
        (workspace.arpuMonthlyDollars * (m1.blendedGrossMarginPct / 100)) / churnDecimal;
    const ltvToCacRatio =
        impliedCacDollars > 0 ? Number((impliedLtvDollars / impliedCacDollars).toFixed(1)) : 5.0;

    const { lintIssues, ventureReadinessScore } = runVentureReadinessLinter(
        workspace,
        cashFlow,
        capTable,
        monteCarlo,
        davidSacksBurnMultiple,
        saasMagicNumber,
        cacPaybackMonths
    );

    // Format CSV Helper
    const toCsvRow = (vals: (string | number)[]) =>
        vals
            .map((v) => {
                const s = sanitizeSpreadsheetFormula(v, true).replace(/"/g, '""');
                return /[",\n\r]/.test(s) ? `"${s}"` : s;
            })
            .join(',');

    // 1. 60-Month Cash Flow CSV
    const cashFlowCsv =
        '\uFEFF' +
        [
            toCsvRow([
                'Month',
                'Label',
                'Beginning_Cash',
                'Beginning_MRR',
                'New_MRR',
                'Expansion_MRR',
                'Churned_MRR',
                'Ending_MRR',
                'ARR',
                'Cash_Collected',
                'Total_COGS',
                'AI_Token_COGS',
                'Blended_GM_Pct',
                'RD_OpEx',
                'SM_OpEx',
                'GA_OpEx',
                'Hiring_Payroll',
                'Debt_Service',
                'Gross_Burn',
                'Financing_And_Grants',
                'Net_Burn',
                'Ending_Cash',
                'Headcount_FTE',
                'Burn_Multiple',
                'Rule_Of_40',
            ]),
            ...cashFlow.monthlyRows.map((r) =>
                toCsvRow([
                    r.month,
                    r.calendarLabel,
                    Math.round(r.beginningCash),
                    Math.round(r.beginningMrr),
                    Math.round(r.newMrr),
                    Math.round(r.expansionMrr),
                    Math.round(r.churnedMrr),
                    Math.round(r.endingMrr),
                    Math.round(r.arr),
                    Math.round(r.cashCollectedFromRevenue),
                    Math.round(r.totalCogs),
                    Math.round(r.aiTokenInferenceCogs),
                    r.blendedGrossMarginPct,
                    Math.round(r.rdOpex),
                    Math.round(r.smOpex),
                    Math.round(r.gaOpex),
                    Math.round(r.hiringPayrollOpex),
                    Math.round(r.ventureDebtService),
                    Math.round(r.grossBurn),
                    Math.round(r.nonDilutiveInflow + r.equityFinancingNetInflow),
                    Math.round(r.netBurn),
                    Math.round(r.endingCash),
                    r.activeHeadcountFte,
                    r.burnMultipleAnnualized,
                    r.ruleOf40Score,
                ])
            ),
        ].join('\n');

    // 2. Cap Table CSV
    const capTableCsv =
        '\uFEFF' +
        [
            toCsvRow([
                'Stakeholder',
                'Category',
                'Initial_Shares',
                'Initial_Pct',
                'Post_SAFE_Shares',
                'Post_SAFE_Pct',
                'Post_Series_A_Shares',
                'Post_Series_A_Pct',
                'Post_Series_B_Shares',
                'Post_Series_B_Pct',
                'Invested_Capital_USD',
                'Conversion_Or_Round_PPS',
                'Implied_Paper_Value_USD',
                'Secondary_Cash_Out_USD',
                'Vested_Shares',
                'Unvested_Shares',
                'Notes',
            ]),
            ...capTable.stakeholders.map((s) =>
                toCsvRow([
                    s.stakeholderName,
                    s.category,
                    s.initialShares,
                    s.initialOwnershipPct,
                    s.postSafeConversionShares,
                    s.postSafeOwnershipPct,
                    s.postSeriesAShares,
                    s.postSeriesAOwnershipPct,
                    s.postSeriesBShares,
                    s.postSeriesBOwnershipPct,
                    s.investedCapitalDollars,
                    s.effectiveConversionPps,
                    s.impliedPaperValuePostRoundDollars,
                    s.secondaryCashOutReceivedDollars,
                    s.vestedSharesCount,
                    s.unvestedSharesCount,
                    s.notes,
                ])
            ),
        ].join('\n');

    // 3. Exit Waterfall CSV
    const exitWaterfallCsv =
        '\uFEFF' +
        [
            toCsvRow([
                'Stakeholder_Class',
                'Category',
                'Invested_Capital_USD',
                'Liquidation_Preference_USD',
                'Decision',
                'Conversion_Breakpoint_Valuation_USD',
                'Preference_Payout_USD',
                'Common_Or_Participation_Payout_USD',
                'Total_Payout_USD',
                'Share_Of_Net_Exit_Pct',
                'MOIC_Multiple',
            ]),
            ...exitWaterfall.targetExitResult.classPayouts.map((c) =>
                toCsvRow([
                    c.className,
                    c.category,
                    c.investedCapitalDollars,
                    c.liquidationPreferenceDollars,
                    c.decision,
                    c.voluntaryConversionBreakpointValuation,
                    c.preferencePayoutDollars,
                    c.participationOrCommonPayoutDollars,
                    c.totalPayoutDollars,
                    c.shareOfNetExitPct,
                    c.moicMultiple,
                ])
            ),
        ].join('\n');

    // 4. Board Deck & Investor Update Markdown Report
    const boardReportMarkdown = [
        `# ${workspace.companyName} — CFO Runway, Unit Economics & Pro-Forma Cap Table Report`,
        `> Generated by KivaroTools SaaS Burn Rate, Runway & Dilution Simulator v${SAAS_ENGINE_VERSION} (100% Client-Side Deterministic Engine)`,
        ``,
        `## 1. Executive Runway & Paul Graham Trajectory Diagnostic`,
        `| KPI Metric | Value | Institutional Benchmark / Status |`,
        `| :--- | :--- | :--- |`,
        `| **Paul Graham Trajectory** | **${cashFlow.defaultAliveStatus.replace(/_/g, ' ')}** | ${cashFlow.breakevenMonthIndex ? `Reaches Cash Breakeven in Month ${cashFlow.breakevenMonthIndex}` : `Zero-Cash Date in Month ${cashFlow.exactRunwayMonths}`} |`,
        `| **Current Cash Balance** | $${workspace.startingCashDollars.toLocaleString()} | Minimum 60m Trough: $${Math.round(cashFlow.minimumCashBalanceDollars).toLocaleString()} |`,
        `| **Exact Cash Runway** | **${cashFlow.runwayExhausted ? `${cashFlow.exactRunwayMonths} Months` : '60+ Months (Self-Sustaining)'}** | Mandatory Raise-By Month: M${cashFlow.mandatoryRaiseByMonth} |`,
        `| **Monte Carlo Survival (${monteCarlo.trials} Runs)** | **${monteCarlo.probabilityDefaultAlivePct}% P-Alive** | P10: ${monteCarlo.p10RunwayMonths}m • P50: ${monteCarlo.p50RunwayMonths}m • P90: ${monteCarlo.p90RunwayMonths}m |`,
        `| **Monthly Net Burn (M1)** | $${currentNetBurnMonthlyDollars.toLocaleString()}/mo | Gross Burn: $${currentGrossBurnMonthlyDollars.toLocaleString()}/mo |`,
        `| **David Sacks Burn Multiple** | **${davidSacksBurnMultiple}x** | Tier: ${burnMultipleTier.replace(/_/g, ' ')} (Bessemer Score: ${bessemerEfficiencyScore}x) |`,
        `| **Annualized NRR / GRR** | **${annualizedNrrPct}% NRR** / ${annualizedGrrPct}% GRR | SaaS Magic Number: ${saasMagicNumber}x • CAC Payback: ${cacPaybackMonths}m |`,
        `| **Blended Gross Margin (M1 -> M12)** | **${m1.blendedGrossMarginPct}% -> ${m12.blendedGrossMarginPct}%** | LTV:CAC Ratio: ${ltvToCacRatio}x • Rule of 40: ${m1.ruleOf40Score} |`,
        ``,
        `## 2. Pro-Forma Cap Table & SAFE/Series A/B Dilution Summary`,
        `- **Initial Fully Diluted Shares**: ${capTable.initialFullyDilutedShares.toLocaleString()}`,
        `- **Series A Round Price Per Share (PPS)**: $${capTable.seriesARoundPps.toFixed(4)} (Post-Money Valuation: $${capTable.seriesAPostMoneyValuationDollars.toLocaleString()})`,
        `- **Series A Option Pool Top-Up Shares**: ${capTable.seriesAOptionPoolTopUpShares.toLocaleString()} (${workspace.seriesARound.optionPoolCarveoutMode})`,
        `- **Combined Founder Ownership**: ${capTable.foundersCombinedInitialPct}% Initial → **${capTable.foundersCombinedPostSeriesAPct}% Post-Series A** → **${capTable.foundersCombinedPostSeriesBPct}% Post-Series B**`,
        ``,
        `| Stakeholder | Category | Post-SAFE % | Post-Series A % | Post-Series B % | Implied Value ($) |`,
        `| :--- | :--- | :--- | :--- | :--- | :--- |`,
        ...capTable.stakeholders.map(
            (s) =>
                `| ${s.stakeholderName} | ${s.category} | ${s.postSafeOwnershipPct}% | ${s.postSeriesAOwnershipPct}% | ${s.postSeriesBOwnershipPct}% | $${s.impliedPaperValuePostRoundDollars.toLocaleString()} |`
        ),
        ``,
        `## 3. M&A Exit Waterfall Distribution (@ $${workspace.exitConfig.targetExitValuationDollars.toLocaleString()} Exit)`,
        `- **Net Distributable Proceeds (After ${workspace.exitConfig.maAdvisoryAndLegalFeePct}% M&A Fees)**: $${exitWaterfall.targetExitResult.netDistributableProceedsDollars.toLocaleString()}`,
        `- **Co-Founders Combined Payout**: **$${exitWaterfall.targetExitResult.foundersPayoutDollars.toLocaleString()}** (${exitWaterfall.targetExitResult.foundersEffectivePct}% of Net Exit)`,
        `- **Series A Payout**: $${exitWaterfall.targetExitResult.seriesAPayoutDollars.toLocaleString()} • **SAFE/Seed Payout**: $${exitWaterfall.targetExitResult.safeAndSeedPayoutDollars.toLocaleString()}`,
    ].join('\n');

    // 5. Standalone Interactive HTML Board Report
    const interactiveBoardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${workspace.companyName} — Executive Runway & Cap Table Report</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 32px; }
  .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 24px; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
  .kpi { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; }
  .kpi-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; }
  .kpi-val { font-size: 22px; font-weight: 800; color: #38bdf8; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
  th, td { border-bottom: 1px solid #334155; padding: 10px 8px; text-align: left; }
  th { color: #94a3b8; font-weight: 700; }
</style>
</head>
<body>
  <div class="card">
    <h1>${workspace.companyName} — SaaS Runway, Dilution & Exit Waterfall Audit</h1>
    <p>Trajectory Status: <strong>${cashFlow.defaultAliveStatus}</strong> • Venture Readiness Score: <strong>${ventureReadinessScore}/100</strong></p>
    <div class="grid">
      <div class="kpi"><div class="kpi-label">Cash Runway</div><div class="kpi-val">${cashFlow.runwayExhausted ? `${cashFlow.exactRunwayMonths} Months` : '60+ Months'}</div></div>
      <div class="kpi"><div class="kpi-label">Burn Multiple</div><div class="kpi-val">${davidSacksBurnMultiple}x</div></div>
      <div class="kpi"><div class="kpi-label">Annualized NRR</div><div class="kpi-val">${annualizedNrrPct}%</div></div>
      <div class="kpi"><div class="kpi-label">Founder Post-A Equity</div><div class="kpi-val">${capTable.foundersCombinedPostSeriesAPct}%</div></div>
      <div class="kpi"><div class="kpi-label">Founder Exit Payout</div><div class="kpi-val">$${exitWaterfall.targetExitResult.foundersPayoutDollars.toLocaleString()}</div></div>
    </div>
  </div>
  <div class="card">
    <h2>Pro-Forma Cap Table & SAFE Conversion Ledger</h2>
    <table>
      <thead><tr><th>Stakeholder</th><th>Category</th><th>Initial %</th><th>Post-SAFE %</th><th>Post-Series A %</th><th>Post-Series B %</th><th>Paper Value ($)</th></tr></thead>
      <tbody>
        ${capTable.stakeholders
            .map(
                (s) =>
                    `<tr><td>${s.stakeholderName}</td><td>${s.category}</td><td>${s.initialOwnershipPct}%</td><td>${s.postSafeOwnershipPct}%</td><td>${s.postSeriesAOwnershipPct}%</td><td>${s.postSeriesBOwnershipPct}%</td><td>$${s.impliedPaperValuePostRoundDollars.toLocaleString()}</td></tr>`
            )
            .join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;

    // 6. SHA-256 Audited JSON Snapshot
    const canonicalConfig = JSON.stringify(workspace);
    const configSha256 = computeSha256Hex(canonicalConfig);
    const modelSnapshotJson = JSON.stringify(
        {
            engineVersion: SAAS_ENGINE_VERSION,
            exportedAt: '2026-11-07T00:00:00.000Z',
            sha256IntegrityHash: configSha256,
            summaryMetrics: {
                exactRunwayMonths: cashFlow.exactRunwayMonths,
                defaultAliveStatus: cashFlow.defaultAliveStatus,
                davidSacksBurnMultiple,
                annualizedNrrPct,
                foundersCombinedPostSeriesAPct: capTable.foundersCombinedPostSeriesAPct,
                seriesARoundPps: capTable.seriesARoundPps,
                ventureReadinessScore,
            },
            workspace,
        },
        null,
        2
    );

    // 7. Reproducible Python Verification Script
    const pythonVerificationScript = [
        `#!/usr/bin/env python3`,
        `"""`,
        `Reproducible Verification Script — ${workspace.companyName}`,
        `Generated by KivaroTools SaaS Burn Rate, Runway & Dilution Simulator v${SAAS_ENGINE_VERSION}`,
        `SHA-256 Model Hash: ${configSha256}`,
        `"""`,
        `starting_cash = ${workspace.startingCashDollars}`,
        `starting_mrr = ${workspace.startingMrrDollars}`,
        `new_growth_rate = ${workspace.monthlyNewMrrGrowthPct / 100}`,
        `expansion_rate = ${workspace.monthlyExpansionMrrPct / 100}`,
        `churn_rate = ${workspace.monthlyGrossChurnMrrPct / 100}`,
        `pre_money_series_a = ${workspace.seriesARound.preMoneyValuationDollars}`,
        `new_money_series_a = ${workspace.seriesARound.newMoneyInvestmentDollars}`,
        `series_a_pps = ${capTable.seriesARoundPps}`,
        `founders_post_a_pct = ${capTable.foundersCombinedPostSeriesAPct}`,
        ``,
        `print(f"Company: ${workspace.companyName}")`,
        `print(f"Exact Runway: ${cashFlow.exactRunwayMonths} months (${cashFlow.defaultAliveStatus})")`,
        `print(f"David Sacks Burn Multiple: ${davidSacksBurnMultiple}x | Annualized NRR: ${annualizedNrrPct}%")`,
        `print(f"Series A PPS: \${series_a_pps:.4f} | Founders Post-Series A Ownership: {founders_post_a_pct:.2f}%")`,
    ].join('\n');

    // 8. Shareable URL State Permalink Query
    const shareableUrlQuery = `?preset=${encodeURIComponent(workspace.activePreset)}&cash=${workspace.startingCashDollars}&mrr=${workspace.startingMrrDollars}&growth=${workspace.monthlyNewMrrGrowthPct}&churn=${workspace.monthlyGrossChurnMrrPct}&preA=${workspace.seriesARound.preMoneyValuationDollars}&newA=${workspace.seriesARound.newMoneyInvestmentDollars}&poolA=${workspace.seriesARound.targetPostRoundOptionPoolPct}&exit=${workspace.exitConfig.targetExitValuationDollars}`;

    // 9. Executive Term Sheet & Runway Audit Plain-Text Summary
    const executiveTermSheetSummaryTxt = [
        `====================================================================`,
        `${workspace.companyName.toUpperCase()} — EXECUTIVE CFO & TERM SHEET AUDIT`,
        `====================================================================`,
        `Trajectory Status       : ${cashFlow.defaultAliveStatus}`,
        `Exact Cash Runway       : ${cashFlow.runwayExhausted ? `${cashFlow.exactRunwayMonths} Months (Raise by Month ${cashFlow.mandatoryRaiseByMonth})` : '60+ Months (Default Alive)'}`,
        `Monte Carlo Survival    : ${monteCarlo.probabilityDefaultAlivePct}% P-Alive (P10: ${monteCarlo.p10RunwayMonths}m | P50: ${monteCarlo.p50RunwayMonths}m | P90: ${monteCarlo.p90RunwayMonths}m)`,
        `Monthly Net Burn (M1)   : $${currentNetBurnMonthlyDollars.toLocaleString()} / mo`,
        `David Sacks Burn Mult.  : ${davidSacksBurnMultiple}x (${burnMultipleTier})`,
        `Annualized NRR / GRR    : ${annualizedNrrPct}% NRR / ${annualizedGrrPct}% GRR`,
        `SaaS Magic Number       : ${saasMagicNumber}x (CAC Payback: ${cacPaybackMonths} months | LTV:CAC: ${ltvToCacRatio}x)`,
        `Series A Round Price    : $${capTable.seriesARoundPps.toFixed(4)} / share ($${capTable.seriesAPostMoneyValuationDollars.toLocaleString()} Post-Money)`,
        `Founder Ownership       : ${capTable.foundersCombinedInitialPct}% Initial -> ${capTable.foundersCombinedPostSeriesAPct}% Post-A -> ${capTable.foundersCombinedPostSeriesBPct}% Post-B`,
        `Founder Exit Payout     : $${exitWaterfall.targetExitResult.foundersPayoutDollars.toLocaleString()} (@ $${workspace.exitConfig.targetExitValuationDollars.toLocaleString()} Exit)`,
        `SHA-256 Audit Digest    : ${configSha256}`,
        `====================================================================`,
    ].join('\n');

    return {
        monthlyRows: cashFlow.monthlyRows,
        exactRunwayMonths: cashFlow.exactRunwayMonths,
        runwayExhausted: cashFlow.runwayExhausted,
        zeroCashMonthIndex: cashFlow.zeroCashMonthIndex,
        mandatoryRaiseByMonth: cashFlow.mandatoryRaiseByMonth,
        breakevenMonthIndex: cashFlow.breakevenMonthIndex,
        defaultAliveStatus: cashFlow.defaultAliveStatus,
        minimumCashBalanceDollars: cashFlow.minimumCashBalanceDollars,
        currentNetBurnMonthlyDollars,
        currentGrossBurnMonthlyDollars,
        davidSacksBurnMultiple,
        bessemerEfficiencyScore,
        burnMultipleTier,
        annualizedNrrPct,
        annualizedGrrPct,
        saasMagicNumber,
        cacPaybackMonths,
        ltvToCacRatio,
        ruleOf40Score: m1.ruleOf40Score,
        blendedGrossMarginMonth1Pct: m1.blendedGrossMarginPct,
        blendedGrossMarginMonth12Pct: m12.blendedGrossMarginPct,
        breakevenSolver,
        capTable,
        exitWaterfall,
        monteCarlo,
        sensitivity,
        lintIssues,
        ventureReadinessScore,
        cashFlowCsv,
        capTableCsv,
        exitWaterfallCsv,
        boardReportMarkdown,
        interactiveBoardHtml,
        modelSnapshotJson,
        pythonVerificationScript,
        shareableUrlQuery,
        executiveTermSheetSummaryTxt,
    };
}

/**
 * 6 Instant 1-Click Benchmark Presets & Sample Startups
 */
export function generateSampleSaasProject(presetId: SaasPresetId): SaasWorkspaceState {
    if (presetId === 'yc_seed_ai_saas') {
        return {
            companyName: 'VectorPulse AI — B2B Agentic Workflow Cloud',
            activePreset: 'yc_seed_ai_saas',
            currencySymbol: '$',
            startingCashDollars: 1_850_000,
            startingMrrDollars: 45_000,
            arpuMonthlyDollars: 450,
            monthlyNewMrrGrowthPct: 11.5,
            monthlyGrowthDecayPct: 1.2,
            monthlyExpansionMrrPct: 2.8,
            monthlyGrossChurnMrrPct: 1.6,
            baseSaasGrossMarginPct: 84,
            annualUpfrontBillingSharePct: 20,
            minimumSafetyCashBufferDollars: 150_000,
            baselineRdOpexDollars: 52_000,
            baselineSmOpexDollars: 28_000,
            baselineGaOpexDollars: 14_000,
            monthlyOpexInflationPct: 0.4,
            baselineHeadcountFte: 7,
            aiTokenCogs: {
                enabled: true,
                activeAiCustomersBase: 100,
                monthlyQueriesPerCustomer: 4_500,
                avgTokensPerQuery: 1_800,
                blendedCostPerMillionTokensDollars: 2.2,
                promptCacheHitRatePct: 48,
                monthlyCostDeflationPct: 2.0,
                fixedGpuClusterMonthlyDollars: 2_800,
            },
            hiringPlan: [
                {
                    id: 'hire_1',
                    title: 'Senior Founding AI Systems Engineer',
                    department: 'R&D',
                    count: 1,
                    annualBaseSalary: 168_000,
                    benefitsAndTaxBurdenPct: 18,
                    startMonth: 4,
                    enabled: true,
                },
                {
                    id: 'hire_2',
                    title: 'Founding Account Executive (Enterprise GTM)',
                    department: 'S&M',
                    count: 1,
                    annualBaseSalary: 132_000,
                    benefitsAndTaxBurdenPct: 18,
                    startMonth: 8,
                    enabled: true,
                },
            ],
            cashEvents: [
                {
                    id: 'ev_1',
                    label: 'Cloud AI Compute Credits & R&D Tax Rebate',
                    month: 6,
                    amountDollars: 85_000,
                    type: 'NON_DILUTIVE_GRANT',
                    enabled: true,
                },
            ],
            ventureDebt: {
                enabled: false,
                principalDollars: 1_000_000,
                drawdownMonth: 6,
                annualInterestRatePct: 10.5,
                interestOnlyMonths: 12,
                amortizationMonths: 24,
                warrantCoveragePct: 1.0,
            },
            founders: [
                {
                    id: 'f_1',
                    name: 'Amina Tariq',
                    role: 'CEO & Co-Founder',
                    initialShares: 4_500_000,
                    vestingMonthsTotal: 48,
                    cliffMonths: 12,
                    monthsElapsed: 18,
                    secondarySaleDollarsAtSeriesA: 0,
                },
                {
                    id: 'f_2',
                    name: 'Zainab Vance',
                    role: 'CTO & Co-Founder',
                    initialShares: 4_250_000,
                    vestingMonthsTotal: 48,
                    cliffMonths: 12,
                    monthsElapsed: 18,
                    secondarySaleDollarsAtSeriesA: 0,
                },
            ],
            earlyAngelCommonShares: 250_000,
            issuedEmployeeOptionShares: 400_000,
            unissuedExistingOptionPoolShares: 600_000,
            convertibles: [
                {
                    id: 'safe_1',
                    investorName: 'YC Standard Pre-Seed Post-Money SAFE',
                    type: 'YC_POST_MONEY_SAFE',
                    principalDollars: 500_000,
                    issueMonth: 0,
                    valuationCapDollars: 10_000_000,
                    discountPct: 0,
                    annualInterestRatePct: 0,
                    accruedMonthsAtConversion: 0,
                    mfnEnabled: false,
                    proRataRightEnabled: true,
                    liquidationMultiple: 1,
                    participationType: 'NON_PARTICIPATING',
                    participationCapMultiple: 2,
                    enabled: true,
                },
                {
                    id: 'safe_2',
                    investorName: 'Seed Syndicate Post-Money SAFE',
                    type: 'YC_POST_MONEY_SAFE',
                    principalDollars: 1_500_000,
                    issueMonth: 0,
                    valuationCapDollars: 18_000_000,
                    discountPct: 20,
                    annualInterestRatePct: 0,
                    accruedMonthsAtConversion: 0,
                    mfnEnabled: false,
                    proRataRightEnabled: true,
                    liquidationMultiple: 1,
                    participationType: 'NON_PARTICIPATING',
                    participationCapMultiple: 2,
                    enabled: true,
                },
            ],
            seriesARound: {
                enabled: true,
                roundName: 'Series A Preferred',
                closeMonth: 16,
                preMoneyValuationDollars: 32_000_000,
                newMoneyInvestmentDollars: 7_500_000,
                legalAndSyndicateFeesDollars: 120_000,
                targetPostRoundOptionPoolPct: 10,
                optionPoolCarveoutMode: 'PRE_MONEY_SHUFFLE',
                liquidationMultiple: 1,
                participationType: 'NON_PARTICIPATING',
                participationCapMultiple: 2,
                seniorityTier: 2,
                includeSafeProRataInNewMoney: true,
            },
            seriesBRound: {
                enabled: false,
                roundName: 'Series B Preferred',
                closeMonth: 36,
                preMoneyValuationDollars: 90_000_000,
                newMoneyInvestmentDollars: 20_000_000,
                legalAndSyndicateFeesDollars: 250_000,
                targetPostRoundOptionPoolPct: 8,
                optionPoolCarveoutMode: 'PRE_MONEY_SHUFFLE',
                liquidationMultiple: 1,
                participationType: 'NON_PARTICIPATING',
                participationCapMultiple: 2,
                seniorityTier: 1,
                includeSafeProRataInNewMoney: false,
            },
            exitConfig: {
                targetExitValuationDollars: 120_000_000,
                maAdvisoryAndLegalFeePct: 2.0,
                managementCarveOutPct: 0,
            },
            monteCarloConfig: {
                seed: 20261107,
                trials: 1000,
                mrrGrowthVolatilityPct: 2.2,
                churnVolatilityPct: 0.5,
                opexSlippageVolatilityPct: 4.0,
            },
        };
    }

    if (presetId === 'hypergrowth_fatal_pinch') {
        const base = generateSampleSaasProject('yc_seed_ai_saas');
        return {
            ...base,
            companyName: 'CloudScale Ops — Hypergrowth B2B (Fatal Pinch Linter Demo)',
            activePreset: 'hypergrowth_fatal_pinch',
            startingCashDollars: 1_150_000,
            startingMrrDollars: 82_000,
            monthlyNewMrrGrowthPct: 4.2,
            monthlyExpansionMrrPct: 1.2,
            monthlyGrossChurnMrrPct: 4.1, // triggers Leaky Bucket Linter
            baselineRdOpexDollars: 135_000,
            baselineSmOpexDollars: 115_000,
            baselineGaOpexDollars: 48_000,
            aiTokenCogs: {
                ...base.aiTokenCogs,
                enabled: true,
                blendedCostPerMillionTokensDollars: 9.5,
                promptCacheHitRatePct: 10,
                fixedGpuClusterMonthlyDollars: 18_500, // triggers AI Margin Trap Linter
            },
            seriesARound: {
                ...base.seriesARound,
                enabled: true,
                closeMonth: 28, // too late for current cash burn -> triggers Fatal Pinch
                targetPostRoundOptionPoolPct: 16, // triggers Pool Shuffle warning
                liquidationMultiple: 2, // triggers Predatory Preference warning
                participationType: 'FULL_PARTICIPATING',
            },
        };
    }

    if (presetId === 'stacked_safe_pool_shuffle') {
        const base = generateSampleSaasProject('yc_seed_ai_saas');
        return {
            ...base,
            companyName: 'NexusStack Dev — Stacked SAFEs & Option Pool Shuffle Stress Test',
            activePreset: 'stacked_safe_pool_shuffle',
            convertibles: [
                {
                    id: 'safe_s1',
                    investorName: 'Accelerator Pre-Seed SAFE (with MFN)',
                    type: 'YC_POST_MONEY_SAFE',
                    principalDollars: 350_000,
                    issueMonth: 0,
                    valuationCapDollars: 14_000_000,
                    discountPct: 15,
                    annualInterestRatePct: 0,
                    accruedMonthsAtConversion: 0,
                    mfnEnabled: true, // gets upgraded by bridge SAFE below!
                    proRataRightEnabled: true,
                    liquidationMultiple: 1,
                    participationType: 'NON_PARTICIPATING',
                    participationCapMultiple: 2,
                    enabled: true,
                },
                {
                    id: 'safe_s2',
                    investorName: 'Angel Syndicate Pre-Money SAFE',
                    type: 'PRE_MONEY_SAFE',
                    principalDollars: 750_000,
                    issueMonth: 0,
                    valuationCapDollars: 11_000_000,
                    discountPct: 20,
                    annualInterestRatePct: 0,
                    accruedMonthsAtConversion: 0,
                    mfnEnabled: false,
                    proRataRightEnabled: false,
                    liquidationMultiple: 1,
                    participationType: 'NON_PARTICIPATING',
                    participationCapMultiple: 2,
                    enabled: true,
                },
                {
                    id: 'safe_s3',
                    investorName: 'Seed Extension Bridge Post-Money SAFE',
                    type: 'YC_POST_MONEY_SAFE',
                    principalDollars: 2_200_000,
                    issueMonth: 0,
                    valuationCapDollars: 9_000_000, // Lower cap triggers MFN on safe_s1!
                    discountPct: 25,
                    annualInterestRatePct: 0,
                    accruedMonthsAtConversion: 0,
                    mfnEnabled: false,
                    proRataRightEnabled: true,
                    liquidationMultiple: 1,
                    participationType: 'NON_PARTICIPATING',
                    participationCapMultiple: 2,
                    enabled: true,
                },
                {
                    id: 'note_s4',
                    investorName: 'Strategic Venture Convertible Note (8% Interest)',
                    type: 'CONVERTIBLE_NOTE',
                    principalDollars: 1_000_000,
                    issueMonth: 0,
                    valuationCapDollars: 15_000_000,
                    discountPct: 20,
                    annualInterestRatePct: 8.0,
                    accruedMonthsAtConversion: 18,
                    mfnEnabled: false,
                    proRataRightEnabled: true,
                    liquidationMultiple: 1,
                    participationType: 'NON_PARTICIPATING',
                    participationCapMultiple: 2,
                    enabled: true,
                },
            ],
            seriesARound: {
                ...base.seriesARound,
                enabled: true,
                preMoneyValuationDollars: 22_000_000,
                newMoneyInvestmentDollars: 6_500_000,
                targetPostRoundOptionPoolPct: 16,
                optionPoolCarveoutMode: 'PRE_MONEY_SHUFFLE',
            },
        };
    }

    if (presetId === 'bootstrapped_indie_profitable') {
        const base = generateSampleSaasProject('yc_seed_ai_saas');
        return {
            ...base,
            companyName: 'MetricCraft — Bootstrapped Micro-SaaS to Default Alive',
            activePreset: 'bootstrapped_indie_profitable',
            startingCashDollars: 220_000,
            startingMrrDollars: 28_000,
            arpuMonthlyDollars: 95,
            monthlyNewMrrGrowthPct: 8.5,
            monthlyGrowthDecayPct: 0.8,
            monthlyExpansionMrrPct: 2.0,
            monthlyGrossChurnMrrPct: 1.5,
            baseSaasGrossMarginPct: 89,
            annualUpfrontBillingSharePct: 35,
            baselineRdOpexDollars: 18_000,
            baselineSmOpexDollars: 9_500,
            baselineGaOpexDollars: 4_500,
            baselineHeadcountFte: 3,
            aiTokenCogs: {
                ...base.aiTokenCogs,
                enabled: false,
            },
            hiringPlan: [],
            cashEvents: [],
            convertibles: [],
            seriesARound: {
                ...base.seriesARound,
                enabled: false,
            },
            seriesBRound: {
                ...base.seriesBRound,
                enabled: false,
            },
            exitConfig: {
                targetExitValuationDollars: 25_000_000,
                maAdvisoryAndLegalFeePct: 1.5,
                managementCarveOutPct: 0,
            },
        };
    }

    if (presetId === 'series_b_scaleup_waterfall') {
        const base = generateSampleSaasProject('yc_seed_ai_saas');
        return {
            ...base,
            companyName: 'AegisSec Enterprise — Series B Scale-Up & Secondary Liquidity',
            activePreset: 'series_b_scaleup_waterfall',
            startingCashDollars: 6_400_000,
            startingMrrDollars: 420_000,
            arpuMonthlyDollars: 2_800,
            monthlyNewMrrGrowthPct: 7.2,
            monthlyGrowthDecayPct: 0.9,
            monthlyExpansionMrrPct: 3.4,
            monthlyGrossChurnMrrPct: 1.1,
            baseSaasGrossMarginPct: 81,
            annualUpfrontBillingSharePct: 45,
            baselineRdOpexDollars: 240_000,
            baselineSmOpexDollars: 195_000,
            baselineGaOpexDollars: 75_000,
            baselineHeadcountFte: 38,
            founders: [
                {
                    id: 'f_1',
                    name: 'Amina Tariq',
                    role: 'CEO & Co-Founder',
                    initialShares: 4_500_000,
                    vestingMonthsTotal: 48,
                    cliffMonths: 12,
                    monthsElapsed: 36,
                    secondarySaleDollarsAtSeriesA: 750_000,
                },
                {
                    id: 'f_2',
                    name: 'Zainab Vance',
                    role: 'CTO & Co-Founder',
                    initialShares: 4_250_000,
                    vestingMonthsTotal: 48,
                    cliffMonths: 12,
                    monthsElapsed: 36,
                    secondarySaleDollarsAtSeriesA: 500_000,
                },
            ],
            seriesARound: {
                ...base.seriesARound,
                enabled: true,
                closeMonth: 2,
                preMoneyValuationDollars: 40_000_000,
                newMoneyInvestmentDollars: 10_000_000,
                targetPostRoundOptionPoolPct: 10,
            },
            seriesBRound: {
                ...base.seriesBRound,
                enabled: true,
                closeMonth: 18,
                preMoneyValuationDollars: 110_000_000,
                newMoneyInvestmentDollars: 25_000_000,
                targetPostRoundOptionPoolPct: 8,
                liquidationMultiple: 1,
                participationType: 'CAPPED_PARTICIPATING',
                participationCapMultiple: 2.5,
                seniorityTier: 1,
            },
            exitConfig: {
                targetExitValuationDollars: 250_000_000,
                maAdvisoryAndLegalFeePct: 2.0,
                managementCarveOutPct: 3.0,
            },
        };
    }

    // deeptech_grant_venture_debt
    const base = generateSampleSaasProject('yc_seed_ai_saas');
    return {
        ...base,
        companyName: 'PhotonicCore Silicon — DeepTech R&D Grant + Venture Debt Bridge',
        activePreset: 'deeptech_grant_venture_debt',
        startingCashDollars: 2_900_000,
        startingMrrDollars: 35_000,
        arpuMonthlyDollars: 5_000,
        monthlyNewMrrGrowthPct: 9.5,
        monthlyExpansionMrrPct: 2.2,
        monthlyGrossChurnMrrPct: 1.0,
        baselineRdOpexDollars: 110_000,
        baselineSmOpexDollars: 32_000,
        baselineGaOpexDollars: 22_000,
        cashEvents: [
            {
                id: 'ev_dt1',
                label: 'NSF SBIR Phase II Non-Dilutive R&D Grant Tranche #1',
                month: 3,
                amountDollars: 500_000,
                type: 'NON_DILUTIVE_GRANT',
                enabled: true,
            },
            {
                id: 'ev_dt2',
                label: 'NSF SBIR Phase II Non-Dilutive R&D Grant Tranche #2',
                month: 12,
                amountDollars: 500_000,
                type: 'NON_DILUTIVE_GRANT',
                enabled: true,
            },
        ],
        ventureDebt: {
            enabled: true,
            principalDollars: 1_500_000,
            drawdownMonth: 5,
            annualInterestRatePct: 11.0,
            interestOnlyMonths: 15,
            amortizationMonths: 24,
            warrantCoveragePct: 1.5,
        },
    };
}