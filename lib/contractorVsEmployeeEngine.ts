/**
 * KivaroTools — Enterprise Universal Contractor vs. Full-Time (W-2 / 1099 / S-Corp / UK IR35 / Global EOR) Engine
 * File: lib/contractorVsEmployeeEngine.ts
 *
 * 100% Client-Side, Zero-Dependency Statutory Tax, Total Compensation, Reverse Break-Even Solver,
 * UK Inside/Outside IR35 Key Information Document (KID) Waterfall, US IRS Schedule C / Schedule SE /
 * Section 199A QBI / S-Corp 1120-S Split Optimizer, 12-Point Worker Classification & IR35 CEST Linter,
 * Global EOR Cost Comparator (Deel / Remote / Oyster), and 6-Format Enterprise Exporter.
 */

export const CONTRACTOR_VS_EMPLOYEE_ENGINE_VERSION = '2.4.0';

export type SupportedJurisdictionCode =
    | 'US'
    | 'UK'
    | 'CA'
    | 'AU'
    | 'DE'
    | 'IN'
    | 'PK'
    | 'AE'
    | 'GLOBAL_CUSTOM';

export interface IsoCurrencyEntry {
    code: string;
    name: string;
    symbol: string;
    decimals: 0 | 2 | 3;
    regionGroup: 'AMERICAS' | 'EUROPE' | 'ASIA_PACIFIC' | 'MIDDLE_EAST_CENTRAL_ASIA' | 'AFRICA';
}

export const REFERENCE_FX_UNITS_PER_USD: Record<string, number> = {
    USD: 1.0, EUR: 0.92, GBP: 0.79, CAD: 1.39, AUD: 1.53, CHF: 0.88, JPY: 154.0, SGD: 1.34,
    AED: 3.6725, INR: 84.4, PKR: 278.5, SAR: 3.75, CNY: 7.24, HKD: 7.78, NZD: 1.68,
    AFN: 68.0, ALL: 93.0, AMD: 388.0, ANG: 1.79, AOA: 915.0, ARS: 995.0, AWG: 1.8,
    AZN: 1.7, BAM: 1.8, BBD: 2.0, BDT: 119.5, BGN: 1.8, BHD: 0.376, BIF: 2900.0,
    BMD: 1.0, BND: 1.34, BOB: 6.91, BRL: 5.78, BSD: 1.0, BTN: 84.4, BWP: 13.5,
    BYN: 3.27, BZD: 2.0, CDF: 2850.0, CLP: 975.0, COP: 4420.0, CRC: 512.0, CUP: 24.0,
    CVE: 101.5, CZK: 23.4, DJF: 177.7, DKK: 6.86, DOP: 60.2, DZD: 133.5, EGP: 49.3,
    ERN: 15.0, ETB: 121.0, FJD: 2.26, FKP: 0.79, GEL: 2.73, GHS: 15.9, GIP: 0.79,
    GMD: 71.0, GNF: 8650.0, GTQ: 7.72, GYD: 209.0, HNL: 25.1, HTG: 131.5, HUF: 376.0,
    IDR: 15850.0, ILS: 3.74, IQD: 1310.0, IRR: 42000.0, ISK: 138.0, JMD: 158.0, JOD: 0.709,
    KES: 129.0, KGS: 86.5, KHR: 4060.0, KMF: 452.0, KRW: 1400.0, KWD: 0.307, KYD: 0.83,
    KZT: 495.0, LAK: 21900.0, LBP: 89500.0, LKR: 292.0, LRD: 192.0, LSL: 18.1, LYD: 4.86,
    MAD: 9.9, MDL: 18.0, MGA: 4650.0, MKD: 56.6, MMK: 2100.0, MNT: 3420.0, MOP: 8.01,
    MRU: 39.7, MUR: 46.5, MVR: 15.4, MWK: 1735.0, MXN: 20.3, MYR: 4.45, MZN: 63.9,
    NAD: 18.1, NGN: 1650.0, NIO: 36.8, NOK: 11.1, NPR: 135.0, OMR: 0.385, PAB: 1.0,
    PEN: 3.78, PGK: 3.98, PHP: 58.7, PLN: 4.01, PYG: 7820.0, QAR: 3.64, RON: 4.58,
    RSD: 108.0, RUB: 98.0, RWF: 1365.0, SBD: 8.45, SCR: 13.6, SDG: 601.0, SEK: 10.7,
    SHP: 0.79, SLE: 22.6, SOS: 571.0, SRD: 35.2, SSP: 1300.0, STN: 22.6, SYP: 13000.0,
    SZL: 18.1, THB: 34.6, TJS: 10.65, TMT: 3.5, TND: 3.12, TOP: 2.37, TRY: 34.4,
    TTD: 6.78, TWD: 32.4, TZS: 2660.0, UAH: 41.3, UGX: 3675.0, UYU: 42.5, UZS: 12800.0,
    VES: 45.0, VND: 25350.0, VUV: 120.0, WST: 2.75, XAF: 603.5, XCD: 2.7, XOF: 603.5,
    XPF: 110.0, YER: 250.0, ZAR: 18.1, ZMW: 27.3, ZWG: 25.5,
};

export function computeCrossRate(fromCurrency: string, toCurrency: string): number {
    if (!fromCurrency || !toCurrency || fromCurrency.toUpperCase() === toCurrency.toUpperCase()) return 1.0;
    const fromPerUsd = REFERENCE_FX_UNITS_PER_USD[fromCurrency.toUpperCase()] || 1.0;
    const toPerUsd = REFERENCE_FX_UNITS_PER_USD[toCurrency.toUpperCase()] || 1.0;
    return Number((toPerUsd / fromPerUsd).toFixed(6));
}

export type RateInputMode = 'HOURLY' | 'DAILY' | 'MONTHLY' | 'ANNUAL';

export type FilingStatusCode = 'SINGLE' | 'MARRIED_JOINT' | 'HEAD_OF_HOUSEHOLD';

export interface JurisdictionMetadata {
    code: SupportedJurisdictionCode;
    name: string;
    currencyCode: string;
    currencySymbol: string;
    taxYearLabel: string;
    employeeRegimeName: string;
    standardContractorRegimeName: string;
    optimizedEntityRegimeName: string;
    authorityName: string;
    classificationTestName: string;
    defaultStateOrRegion: string;
    regionOptions: { code: string; label: string; stateTaxRatePercent: number }[];
    defaultEmployeeSalary: number;
    defaultContractorHourlyRate: number;
    defaultHealthBenefitAnnual: number;
    defaultBusinessExpensesAnnual: number;
    defaultAccountingAndEntityFeesAnnual: number;
    eorMonthlyPlatformFeeLocal: number;
    contractorMgmtMonthlyFeeLocal: number;
}

export interface ClassificationAuditFlags {
    hasUnfetteredRightOfSubstitution: boolean;
    clientControlsHowAndWhenWorkDone: boolean;
    hasMutualityOfObligation: boolean;
    usesClientProvidedEquipment: boolean;
    bearsFinancialRiskAndFixedPriceRemediation: boolean;
    singleClientOver80PercentRevenue: boolean;
    integratedIntoClientOrgChartAndPerks: boolean;
    contractDurationOver12MonthsContinuous: boolean;
    carriesProfessionalIndemnityInsurance: boolean;
    operatesRegisteredBusinessEntityOrWebsite: boolean;
    canWorkForMultipleClientsSimultaneously: boolean;
    writtenStatementOfWorkWithDeliverables: boolean;
}

export interface ContractorVsEmployeeInputs {
    jurisdiction: SupportedJurisdictionCode;
    taxYear?: '2026' | '2025';
    currencyCode?: string;
    fxConversionRate?: number; // Units of display currency per 1 unit of statutory currency
    regionCode: string;
    filingStatus: FilingStatusCode;
    stateTaxRatePercent: number;
    customEmployeeIncomeTaxPercent?: number;
    customEmployeeSocialTaxPercent?: number;
    customEmployerSocialTaxPercent?: number;
    customContractorIncomeTaxPercent?: number;
    customContractorSocialTaxPercent?: number;
    customCorporateTaxPercent?: number;
    customDividendTaxPercent?: number;

    // Country-Specific Statutory Eligibility & Override Controls
    usScorpReasonableSalaryOverride?: number; // Explicit $ salary override (0 = use entityOwnerSalaryPercent)
    usIsSpecifiedServiceTradeOrBusinessSstb?: boolean; // IRS Sec 199A SSTB phase-out flag
    ukDirectorSalaryStrategy?: 'NI_THRESHOLD_5000' | 'PERSONAL_ALLOWANCE_12570';
    ukClaimsEmploymentAllowance?: boolean;
    indiaIsEligibleProfession44ADA?: boolean;
    indiaHas95PercentDigitalReceipts?: boolean;
    pakistanHasValidPsebCertificate?: boolean;
    pakistanHasValidPrcCode9186?: boolean;
    uaeQualifiesForFreeZoneOrSbr?: boolean;

    // Full-Time Employee (W-2 / PAYE / T4 / Salaried) Parameters
    employeeBaseSalaryAnnual: number;
    employeeAnnualBonus: number;
    employerHealthInsuranceAnnual: number;
    employerRetirementMatchPercent: number;
    employeeRetirementContributionPercent: number;
    paidVacationAndHolidaysDays: number;
    paidSickDays: number;
    employerOtherPerksAnnual: number;

    // Independent Contractor / Freelancer / Umbrella / Entity Parameters
    contractorRateMode: RateInputMode;
    contractorRateInput: number;
    billableHoursPerDay: number;
    workingDaysPerWeek: number;
    billableWeeksPerYear: number;
    deductibleBusinessExpensesAnnual: number;
    contractorSelfFundedHealthAnnual: number;
    contractorRetirementContributionAnnual: number;
    entityAccountingAndUmbrellaFeesAnnual: number;

    // Entity Optimization (S-Corp Reasonable Salary % / UK Ltd Director Salary / PSEB / Sec 44ADA)
    entityOwnerSalaryPercent: number;

    // Classification / IR35 Audit Flags
    classificationFlags: ClassificationAuditFlags;
}

export interface RegimeFinancialBreakdown {
    regimeId: 'FULL_TIME_EMPLOYEE' | 'STANDARD_CONTRACTOR' | 'OPTIMIZED_ENTITY';
    regimeTitle: string;
    regimeSubtitle: string;
    grossTopLineAnnual: number;
    deductibleExpensesAndFeesAnnual: number;
    employerSideDeductionsFromAssignmentAnnual: number; // e.g. UK Inside IR35 Employer NI + Levy + Umbrella fee
    taxableIncomeBaseAnnual: number;
    incomeTaxFederalOrNationalAnnual: number;
    stateOrProvincialTaxAnnual: number;
    socialSecurityOrEmployeeNiAnnual: number;
    selfEmploymentOrDividendTaxAnnual: number;
    corporateOrEntityTaxAnnual: number;
    totalTaxesAndStatutoryDeductionsAnnual: number;
    effectiveTaxRatePercent: number;
    marginalTaxRatePercent: number;
    netCashTakeHomeAnnual: number;
    netCashTakeHomeMonthly: number;
    netEffectiveHourlyTakeHome: number;
    monetizedBenefitsAndRetirementValueAnnual: number;
    trueTotalEconomicPackageAnnual: number;
    qbiOrSpecialDeductionSavedAnnual: number;
    lineItemNotes: string[];
}

export interface BreakEvenRateRow {
    billableWeeks: number;
    billableHoursAnnual: number;
    hourlyRateToMatchCashOnly: number;
    dailyRateToMatchCashOnly: number;
    annualGrossToMatchCashOnly: number;
    hourlyRateToMatchTotalPackage: number;
    dailyRateToMatchTotalPackage: number;
    annualGrossToMatchTotalPackage: number;
    recommendedHourlyRateWith15PctBuffer: number;
    recommendedDailyRateWith15PctBuffer: number;
}

export interface UkIr35KidWaterfall {
    assignmentGrossAnnual: number;
    umbrellaMarginAnnual: number;
    employerNationalInsuranceAnnual: number;
    apprenticeshipLevyAnnual: number;
    employerPensionContributionAnnual: number;
    grossTaxablePayeSalaryAnnual: number;
    rolledUpHolidayPayComponentAnnual: number;
    employeeIncomeTaxAnnual: number;
    employeeNationalInsuranceAnnual: number;
    netInsideIr35TakeHomeAnnual: number;
    outsideIr35DirectorSalaryAnnual: number;
    outsideIr35CorporationTaxAnnual: number;
    outsideIr35NetCompanyProfitForDividends: number;
    outsideIr35DividendTaxAnnual: number;
    outsideIr35NetTakeHomeAnnual: number;
    outsideIr35AnnualGainOverInside: number;
}

export interface UsScheduleSeAndScorpBreakdown {
    scheduleCNetProfit: number;
    scheduleSeTaxableBase9235: number;
    socialSecurityWageCap: number;
    socialSecurityTax124: number;
    medicareTax29: number;
    additionalMedicareTax09: number;
    totalSelfEmploymentTax: number;
    halfSeTaxAboveTheLineDeduction: number;
    qbiSection199ADeduction20Pct: number;
    scorpReasonableSalaryAnnual: number;
    scorpK1DistributionAnnual: number;
    scorpEmployerAndEmployeeFicaAnnual: number;
    scorpCorporatePayrollAndCpaCostAnnual: number;
    scorpNetTaxSavingsVs1099SoleProp: number;
}

export interface ClassificationLintIssue {
    id: string;
    ruleCode: string;
    severity: 'CRITICAL' | 'WARNING' | 'OPTIMIZATION';
    factorCategory: 'SUBSTITUTION' | 'CONTROL' | 'MUTUALITY_OF_OBLIGATION' | 'FINANCIAL_RISK' | 'INTEGRATION_AND_EXCLUSIVITY';
    title: string;
    explanation: string;
    remediationClause: string;
}

export interface EmployerTceAndEorComparison {
    directEmployeeBaseAndBonusAnnual: number;
    directEmployerPayrollTaxesAnnual: number;
    directEmployerBenefitsAndRetirementAnnual: number;
    directEmployerWorkersCompAndOverheadAnnual: number;
    directEmployeeTotalCostOfEmploymentAnnual: number;
    eorAnnualPlatformFee: number;
    eorTotalAnnualCost: number;
    contractorGrossInvoiceAnnual: number;
    contractorManagementPlatformFeeAnnual: number;
    contractorTotalCompanySpendAnnual: number;
    employerAnnualSavingsHiringContractorVsDirect: number;
    employerAnnualSavingsHiringContractorVsEor: number;
    estimatedMisclassificationBackTaxAndPenaltyRisk: number;
}

export interface CompiledContractorVsEmployeeReport {
    engineVersion: string;
    jurisdictionMeta: JurisdictionMetadata;
    activeCurrency: IsoCurrencyEntry;
    contractorAnnualGrossRevenue: number;
    totalBillableHoursPerYear: number;
    totalBillableDaysPerYear: number;
    employeeRegime: RegimeFinancialBreakdown;
    standardContractorRegime: RegimeFinancialBreakdown;
    optimizedEntityRegime: RegimeFinancialBreakdown;
    winningRegime: RegimeFinancialBreakdown;
    netAnnualAdvantageOfContractorVsEmployee: number;
    netAnnualAdvantageOfOptimizedEntityVsEmployee: number;
    netAnnualAdvantageOfOptimizedEntityVsStandardContractor: number;
    exactBreakEvenHourlyRateTotalPkg: number;
    exactBreakEvenDailyRateTotalPkg: number;
    exactBreakEvenAnnualGrossTotalPkg: number;
    exactBreakEvenHourlyRateOptimizedEntity: number;
    exactBreakEvenDailyRateOptimizedEntity: number;
    exactBreakEvenAnnualGrossOptimizedEntity: number;
    recommendedHourlyRateWithBuffer: number;
    recommendedDailyRateWithBuffer: number;
    unbillablePtoAndHolidayReplacementCostAnnual: number;
    breakEvenMatrix: BreakEvenRateRow[];
    ukIr35KidWaterfall: UkIr35KidWaterfall;
    usScheduleSeAndScorp: UsScheduleSeAndScorpBreakdown;
    employerTceComparison: EmployerTceAndEorComparison;
    statutoryCurrencyCode: string;
    statutoryCurrencySymbol: string;
    appliedFxRateDisplayPerStatutory: number;
    breakEvenSolverConverged: boolean;
    validationWarnings: string[];
    calculationAssumptionsAuditTrail: {
        stepNumber: number;
        category: string;
        label: string;
        formulaOrRule: string;
        statutoryAmountFormatted: string;
    }[];
    contractualAddendumClausesText: string;
    classificationComplianceScore: number;
    classificationVerdict: 'OUTSIDE_IR35_SAFE_INDEPENDENT' | 'BORDERLINE_GREY_ZONE' | 'INSIDE_IR35_HIGH_MISCLASSIFICATION_RISK';
    classificationLintIssues: ClassificationLintIssue[];
    recruiterNegotiationBriefText: string;
    markdownTaxAndKidReport: string;
    auditCertificateJson: string;
    svgWaterfallChart: string;
    sha256Signature: string;
}

// ============================================================================
// 1. CRYPTOGRAPHIC SHA-256, CRC32 & CWE-1236 SPREADSHEET FORMULA GUARD
// ============================================================================

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

const textEncoder = new TextEncoder();

export function computeSha256Hex(input: Uint8Array | string): string {
    const bytes = typeof input === 'string' ? textEncoder.encode(input) : input;
    const bitLen = bytes.length * 8;
    const padLen = ((bytes.length + 8) >> 6) * 64 + 64;
    const padded = new Uint8Array(padLen);
    padded.set(bytes);
    padded[bytes.length] = 0x80;
    const view = new DataView(padded.buffer);
    view.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000), false);
    view.setUint32(padLen - 4, bitLen >>> 0, false);

    let h0 = 0x6a09e667;
    let h1 = 0xbb67ae85;
    let h2 = 0x3c6ef372;
    let h3 = 0xa54ff53a;
    let h4 = 0x510e527f;
    let h5 = 0x9b05688c;
    let h6 = 0x1f83d9ab;
    let h7 = 0x5be0cd19;
    const w = new Uint32Array(64);

    for (let offset = 0; offset < padLen; offset += 64) {
        for (let i = 0; i < 16; i++) {
            w[i] = view.getUint32(offset + i * 4, false);
        }
        for (let i = 16; i < 64; i++) {
            const v15 = w[i - 15];
            const s0 = ((v15 >>> 7) | (v15 << 25)) ^ ((v15 >>> 18) | (v15 << 14)) ^ (v15 >>> 3);
            const v2 = w[i - 2];
            const s1 = ((v2 >>> 17) | (v2 << 15)) ^ ((v2 >>> 19) | (v2 << 13)) ^ (v2 >>> 10);
            w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
        }

        let a = h0;
        let b = h1;
        let c = h2;
        let d = h3;
        let e = h4;
        let f = h5;
        let g = h6;
        let h = h7;

        for (let i = 0; i < 64; i++) {
            const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
            const ch = (e & f) ^ (~e & g);
            const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
            const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
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

    return [h0, h1, h2, h3, h4, h5, h6, h7]
        .map((n) => n.toString(16).padStart(8, '0'))
        .join('');
}

const CRC32_TABLE = (() => {
    const tbl = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        tbl[i] = c >>> 0;
    }
    return tbl;
})();

export function computeCrc32(bytes: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
        crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

/**
 * CWE-1236 CSV / Excel Spreadsheet Formula Injection Guard.
 * Prefixes any string cell starting with =, +, -, @, \t, or \r with a single quote (')
 * unless it is a pure signed number.
 */
export function sanitizeSpreadsheetFormula(val: unknown, sanitize = true): string {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (!sanitize || str.length === 0) return str;
    if (/^-?\d+(?:\.\d+)?$/.test(str)) return str;
    const firstChar = str.charAt(0);
    const trimmedFirst = str.trimStart().charAt(0);
    if (
        firstChar === '=' ||
        firstChar === '+' ||
        firstChar === '-' ||
        firstChar === '@' ||
        firstChar === '\t' ||
        firstChar === '\r' ||
        trimmedFirst === '=' ||
        trimmedFirst === '+' ||
        trimmedFirst === '-' ||
        trimmedFirst === '@'
    ) {
        return `'${str}`;
    }
    return str;
}


// ============================================================================
// 1B. COMPLETE WORLDWIDE ISO 4217 ACTIVE CURRENCIES CATALOG (160 CURRENCIES)
// ============================================================================

export const ISO_4217_CURRENCIES: IsoCurrencyEntry[] = [
    // Major Global Reserve & G10 Currencies (Pinned First for Fast Selection)
    { code: 'USD', name: 'United States Dollar', symbol: '$', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'EUR', name: 'Euro (Eurozone)', symbol: '€', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'GBP', name: 'British Pound Sterling', symbol: '£', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0, regionGroup: 'ASIA_PACIFIC' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'AED', name: 'United Arab Emirates Dirham', symbol: 'AED', decimals: 2, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs.', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', decimals: 2, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'CNY', name: 'Chinese Yuan Renminbi', symbol: '¥', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimals: 2, regionGroup: 'ASIA_PACIFIC' },

    // All Remaining Active ISO 4217 Currencies (Alphabetical by Code)
    { code: 'AFN', name: 'Afghan Afghani', symbol: '؋', decimals: 2, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'ALL', name: 'Albanian Lek', symbol: 'L', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'AMD', name: 'Armenian Dram', symbol: '֏', decimals: 2, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'ANG', name: 'Netherlands Antillean Guilder', symbol: 'ƒ', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'ARS', name: 'Argentine Peso', symbol: 'AR$', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'AWG', name: 'Aruban Florin', symbol: 'ƒ', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', decimals: 2, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', decimals: 3, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu', decimals: 0, regionGroup: 'AFRICA' },
    { code: 'BMD', name: 'Bermudan Dollar', symbol: 'BD$', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'BND', name: 'Brunei Dollar', symbol: 'B$', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'BSD', name: 'Bahamian Dollar', symbol: 'B$', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'BWP', name: 'Botswanan Pula', symbol: 'P', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'CDF', name: 'Congolese Franc', symbol: 'FC', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'CLP', name: 'Chilean Peso', symbol: 'CLP$', decimals: 0, regionGroup: 'AMERICAS' },
    { code: 'COP', name: 'Colombian Peso', symbol: 'COL$', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'CUP', name: 'Cuban Peso', symbol: '$MN', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'CVE', name: 'Cape Verdean Escudo', symbol: 'Esc', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj', decimals: 0, regionGroup: 'AFRICA' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'DZD', name: 'Algerian Dinar', symbol: 'DA', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'FKP', name: 'Falkland Islands Pound', symbol: 'FK£', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'GEL', name: 'Georgian Lari', symbol: '₾', decimals: 2, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'GIP', name: 'Gibraltar Pound', symbol: '£', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'GNF', name: 'Guinean Franc', symbol: 'FG', decimals: 0, regionGroup: 'AFRICA' },
    { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'GYD', name: 'Guyanaese Dollar', symbol: 'G$', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'HTG', name: 'Haitian Gourde', symbol: 'G', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', decimals: 0, regionGroup: 'EUROPE' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimals: 0, regionGroup: 'ASIA_PACIFIC' },
    { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', decimals: 2, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'IQD', name: 'Iraqi Dinar', symbol: 'IQD', decimals: 3, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', decimals: 0, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr', decimals: 0, regionGroup: 'EUROPE' },
    { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JD', decimals: 3, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'KGS', name: 'Kyrgystani Som', symbol: 'сом', decimals: 2, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'KMF', name: 'Comorian Franc', symbol: 'CF', decimals: 0, regionGroup: 'AFRICA' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0, regionGroup: 'ASIA_PACIFIC' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', decimals: 3, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'KYD', name: 'Cayman Islands Dollar', symbol: 'CI$', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', decimals: 2, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'LAK', name: 'Laotian Kip', symbol: '₭', decimals: 0, regionGroup: 'ASIA_PACIFIC' },
    { code: 'LBP', name: 'Lebanese Pound', symbol: 'L£', decimals: 0, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'LRD', name: 'Liberian Dollar', symbol: 'L$', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'LSL', name: 'Lesotho Loti', symbol: 'L', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'LYD', name: 'Libyan Dinar', symbol: 'LD', decimals: 3, regionGroup: 'AFRICA' },
    { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', decimals: 0, regionGroup: 'AFRICA' },
    { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', decimals: 0, regionGroup: 'ASIA_PACIFIC' },
    { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'OMR', name: 'Omani Rial', symbol: 'OMR', decimals: 3, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/.', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲', decimals: 0, regionGroup: 'AMERICAS' },
    { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', decimals: 2, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'RON', name: 'Romanian Leu', symbol: 'lei', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин.', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', decimals: 0, regionGroup: 'AFRICA' },
    { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'SDG', name: 'Sudanese Pound', symbol: 'SDG', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'SHP', name: 'Saint Helena Pound', symbol: '£', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'SLE', name: 'Sierra Leonean Leone', symbol: 'Le', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh.So.', decimals: 0, regionGroup: 'AFRICA' },
    { code: 'SRD', name: 'Surinamese Dollar', symbol: 'SRD$', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'SSP', name: 'South Sudanese Pound', symbol: '£', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'STN', name: 'São Tomé and Príncipe Dobra', symbol: 'Db', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'SYP', name: 'Syrian Pound', symbol: '£S', decimals: 0, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'E', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'SM', decimals: 2, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'T', decimals: 2, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'TND', name: 'Tunisian Dinar', symbol: 'DT', decimals: 3, regionGroup: 'AFRICA' },
    { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimals: 2, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: 'TT$', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', decimals: 0, regionGroup: 'AFRICA' },
    { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', decimals: 2, regionGroup: 'EUROPE' },
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', decimals: 0, regionGroup: 'AFRICA' },
    { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'UZS', name: 'Uzbekistani Som', symbol: 'soʻm', decimals: 0, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'VES', name: 'Venezuelan Bolívar Soberano', symbol: 'Bs.S', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'VND', name: 'Vietnamese Đồng', symbol: '₫', decimals: 0, regionGroup: 'ASIA_PACIFIC' },
    { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT', decimals: 0, regionGroup: 'ASIA_PACIFIC' },
    { code: 'WST', name: 'Samoan Tala', symbol: 'WS$', decimals: 2, regionGroup: 'ASIA_PACIFIC' },
    { code: 'XAF', name: 'Central African CFA Franc (BEAC)', symbol: 'FCFA', decimals: 0, regionGroup: 'AFRICA' },
    { code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$', decimals: 2, regionGroup: 'AMERICAS' },
    { code: 'XOF', name: 'West African CFA Franc (BCEAO)', symbol: 'CFA', decimals: 0, regionGroup: 'AFRICA' },
    { code: 'XPF', name: 'CFP Franc', symbol: '₣', decimals: 0, regionGroup: 'ASIA_PACIFIC' },
    { code: 'YER', name: 'Yemeni Rial', symbol: '﷼', decimals: 0, regionGroup: 'MIDDLE_EAST_CENTRAL_ASIA' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', decimals: 2, regionGroup: 'AFRICA' },
    { code: 'ZWG', name: 'Zimbabwe Gold', symbol: 'ZiG', decimals: 2, regionGroup: 'AFRICA' },
];

export function getIsoCurrencyByCode(code?: string, fallbackCode = 'USD'): IsoCurrencyEntry {
    const target = (code || fallbackCode).toUpperCase();
    return (
        ISO_4217_CURRENCIES.find((c) => c.code === target) ||
        ISO_4217_CURRENCIES.find((c) => c.code === fallbackCode) ||
        ISO_4217_CURRENCIES[0]
    );
}

// ============================================================================
// 2. 9-JURISDICTION STATUTORY & WORLDWIDE CUSTOM CATALOG (2025/2026 RATES)
// ============================================================================

export const JURISDICTION_CATALOG: Record<SupportedJurisdictionCode, JurisdictionMetadata> = {
    US: {
        code: 'US',
        name: 'United States (IRS W-2 vs. 1099 Schedule C vs. S-Corp 1120-S)',
        currencyCode: 'USD',
        currencySymbol: '$',
        taxYearLabel: '2026 IRS Statutory (SS Cap $184,500 • QBI Sec 199A 20%)',
        employeeRegimeName: 'W-2 Full-Time Employee',
        standardContractorRegimeName: '1099 Sole Prop / Single-Member LLC',
        optimizedEntityRegimeName: 'S-Corp (Form 1120-S Salary + K-1 Split)',
        authorityName: 'IRS & US Department of Labor (DOL)',
        classificationTestName: 'IRS 3-Factor Common Law & DOL 6-Factor Economic Reality Test',
        defaultStateOrRegion: 'CA',
        regionOptions: [
            { code: 'TX_FL_WA', label: 'No State Income Tax (TX, FL, WA, NV, TN)', stateTaxRatePercent: 0 },
            { code: 'CA', label: 'California (CA — ~8.2% Effective State Tax)', stateTaxRatePercent: 8.2 },
            { code: 'NY', label: 'New York (NY — ~6.8% Effective State Tax)', stateTaxRatePercent: 6.8 },
            { code: 'IL_MA_PA', label: 'Flat Tax State (IL, MA, PA, CO — ~4.95%)', stateTaxRatePercent: 4.95 },
            { code: 'US_AVG', label: 'US National Average State Tax (5.0%)', stateTaxRatePercent: 5.0 },
        ],
        defaultEmployeeSalary: 150000,
        defaultContractorHourlyRate: 95,
        defaultHealthBenefitAnnual: 8400,
        defaultBusinessExpensesAnnual: 6500,
        defaultAccountingAndEntityFeesAnnual: 2400,
        eorMonthlyPlatformFeeLocal: 599,
        contractorMgmtMonthlyFeeLocal: 49,
    },
    UK: {
        code: 'UK',
        name: 'United Kingdom (HMRC PAYE vs. Inside IR35 Umbrella vs. Outside IR35 Ltd)',
        currencyCode: 'GBP',
        currencySymbol: '£',
        taxYearLabel: '2026/27 HMRC Statutory (Employer NI 15% • Corp Tax 19%–25%)',
        employeeRegimeName: 'Permanent Employee (PAYE)',
        standardContractorRegimeName: 'Inside IR35 (Umbrella KID Deduction Chain)',
        optimizedEntityRegimeName: 'Outside IR35 Limited Company (£12,570 Salary + Dividends)',
        authorityName: 'HM Revenue & Customs (HMRC)',
        classificationTestName: 'HMRC Off-Payroll Working (IR35 / CEST) Chapter 10 ITEPA 2003',
        defaultStateOrRegion: 'ENG_NI_WALES',
        regionOptions: [
            { code: 'ENG_NI_WALES', label: 'England, Northern Ireland & Wales (Standard UK Bands)', stateTaxRatePercent: 0 },
            { code: 'SCOTLAND', label: 'Scotland (Scottish Starter/Intermediate/Higher/Top Surtax +1.5%)', stateTaxRatePercent: 1.5 },
        ],
        defaultEmployeeSalary: 95000,
        defaultContractorHourlyRate: 81.25, // £650/day
        defaultHealthBenefitAnnual: 1800,
        defaultBusinessExpensesAnnual: 3600,
        defaultAccountingAndEntityFeesAnnual: 1500,
        eorMonthlyPlatformFeeLocal: 499,
        contractorMgmtMonthlyFeeLocal: 39,
    },
    CA: {
        code: 'CA',
        name: 'Canada (CRA T4 Employee vs. T2125 Sole Prop vs. CCPC Incorporated)',
        currencyCode: 'CAD',
        currencySymbol: 'CA$',
        taxYearLabel: '2026 CRA Statutory (CPP + CPP2 • 12.2% CCPC Small Business Rate)',
        employeeRegimeName: 'T4 Permanent Employee',
        standardContractorRegimeName: 'T2125 Unincorporated Sole Proprietor (2x CPP)',
        optimizedEntityRegimeName: 'CCPC Incorporated Contractor (Small Business Deduction)',
        authorityName: 'Canada Revenue Agency (CRA)',
        classificationTestName: 'CRA Wiebe Door 4-Factor Test & Personal Services Business (PSB) Audit',
        defaultStateOrRegion: 'ON',
        regionOptions: [
            { code: 'ON', label: 'Ontario (ON — ~9.15% Effective Provincial Tax)', stateTaxRatePercent: 9.15 },
            { code: 'BC', label: 'British Columbia (BC — ~8.2% Effective Provincial Tax)', stateTaxRatePercent: 8.2 },
            { code: 'AB', label: 'Alberta (AB — ~8.0% Effective Provincial Tax)', stateTaxRatePercent: 8.0 },
            { code: 'QC', label: 'Quebec (QC — ~13.5% Effective Provincial Tax)', stateTaxRatePercent: 13.5 },
        ],
        defaultEmployeeSalary: 140000,
        defaultContractorHourlyRate: 90,
        defaultHealthBenefitAnnual: 3600,
        defaultBusinessExpensesAnnual: 5500,
        defaultAccountingAndEntityFeesAnnual: 2200,
        eorMonthlyPlatformFeeLocal: 799,
        contractorMgmtMonthlyFeeLocal: 59,
    },
    AU: {
        code: 'AU',
        name: 'Australia (ATO PAYG Employee vs. ABN Sole Trader vs. Pty Ltd Company)',
        currencyCode: 'AUD',
        currencySymbol: 'A$',
        taxYearLabel: '2025/26 ATO Stage 3 Cuts (12% Superannuation Guarantee • 2% Medicare)',
        employeeRegimeName: 'PAYG Permanent Employee (+12% Super)',
        standardContractorRegimeName: 'ABN Sole Trader (Personal Services Income / PSI)',
        optimizedEntityRegimeName: 'Pty Ltd Company (25% Base Rate Entity + Franked Dividends)',
        authorityName: 'Australian Taxation Office (ATO) & Fair Work Commission',
        classificationTestName: 'ATO TR 2023/4 Multi-Factor Test & 80/20 PSI Results Test',
        defaultStateOrRegion: 'NSW',
        regionOptions: [
            { code: 'NSW', label: 'New South Wales (NSW)', stateTaxRatePercent: 0 },
            { code: 'VIC', label: 'Victoria (VIC)', stateTaxRatePercent: 0 },
            { code: 'QLD', label: 'Queensland (QLD)', stateTaxRatePercent: 0 },
        ],
        defaultEmployeeSalary: 165000,
        defaultContractorHourlyRate: 110,
        defaultHealthBenefitAnnual: 2800,
        defaultBusinessExpensesAnnual: 6000,
        defaultAccountingAndEntityFeesAnnual: 2400,
        eorMonthlyPlatformFeeLocal: 899,
        contractorMgmtMonthlyFeeLocal: 69,
    },
    DE: {
        code: 'DE',
        name: 'Germany (Festangestellte Brutto-Netto vs. Freiberufler vs. GmbH)',
        currencyCode: 'EUR',
        currencySymbol: '€',
        taxYearLabel: '2026 BMF Statutory (Einkommensteuer + Sozialversicherung vs. Freiberufler)',
        employeeRegimeName: 'Festangestellter (Statutory Social Insurance Split)',
        standardContractorRegimeName: 'Freiberufler (Self-Employed Professional / PKV)',
        optimizedEntityRegimeName: 'Freiberufler + Betriebsausgaben & Rürup-Rente Shield',
        authorityName: 'Finanzamt & Deutsche Rentenversicherung (DRV)',
        classificationTestName: 'DRV Statusfeststellungsverfahren (§ 7 SGB IV Scheinselbstständigkeit)',
        defaultStateOrRegion: 'DE_STD',
        regionOptions: [
            { code: 'DE_STD', label: 'Germany Standard (No Church Tax / Keine Kirchensteuer)', stateTaxRatePercent: 0 },
            { code: 'DE_CHURCH', label: 'Germany with Church Tax (Kirchensteuer 8%–9% of Income Tax)', stateTaxRatePercent: 1.8 },
        ],
        defaultEmployeeSalary: 95000,
        defaultContractorHourlyRate: 95,
        defaultHealthBenefitAnnual: 4800,
        defaultBusinessExpensesAnnual: 6000,
        defaultAccountingAndEntityFeesAnnual: 1800,
        eorMonthlyPlatformFeeLocal: 550,
        contractorMgmtMonthlyFeeLocal: 45,
    },
    IN: {
        code: 'IN',
        name: 'India (Salaried CTC New Regime vs. Consultant vs. Sec 44ADA 50% Presumptive)',
        currencyCode: 'INR',
        currencySymbol: '₹',
        taxYearLabel: 'FY 2025-26 / AY 2026-27 (Sec 115BAC Slabs • Sec 44ADA 50% Deemed Profit)',
        employeeRegimeName: 'Full-Time Salaried Employee (CTC + EPF + ₹75k Std Ded)',
        standardContractorRegimeName: 'Regular Professional Consultant (Actual Expense Books)',
        optimizedEntityRegimeName: 'Section 44ADA Presumptive Tax (Only 50% of Gross Receipts Taxed!)',
        authorityName: 'Income Tax Department of India (CBDT)',
        classificationTestName: 'Section 192 (Employer-Employee) vs. Section 194J / 44ADA Professional Contract',
        defaultStateOrRegion: 'IN_METRO',
        regionOptions: [
            { code: 'IN_METRO', label: 'Bengaluru / Mumbai / Delhi NCR / Hyderabad (Zero State Income Tax)', stateTaxRatePercent: 0 },
        ],
        defaultEmployeeSalary: 3200000,
        defaultContractorHourlyRate: 2200,
        defaultHealthBenefitAnnual: 45000,
        defaultBusinessExpensesAnnual: 240000,
        defaultAccountingAndEntityFeesAnnual: 35000,
        eorMonthlyPlatformFeeLocal: 49000,
        contractorMgmtMonthlyFeeLocal: 4000,
    },
    PK: {
        code: 'PK',
        name: 'Pakistan (FBR Salaried u/s 149 vs. Freelancer 1% vs. PSEB 0.25% IT Export u/s 154A)',
        currencyCode: 'PKR',
        currencySymbol: 'Rs.',
        taxYearLabel: 'FBR Tax Year 2026/27 (Salaried Slabs up to 35% vs. Sec 154A 0.25% PSEB Final Tax)',
        employeeRegimeName: 'FBR Salaried Employee (Section 149 Progressive Slabs + 10% Surcharge)',
        standardContractorRegimeName: 'IT Export Freelancer — Non-PSEB ATL Filer (1.0% Final Tax u/s 154A)',
        optimizedEntityRegimeName: 'PSEB-Registered IT Exporter (0.25% Final Withholding Tax u/s 154A!)',
        authorityName: 'Federal Board of Revenue (FBR) & Pakistan Software Export Board (PSEB)',
        classificationTestName: 'FBR Section 149 Employment vs. Section 154A Foreign IT Export Remittance (PRC Code 9186)',
        defaultStateOrRegion: 'PK_FED',
        regionOptions: [
            { code: 'PK_FED', label: 'Pakistan Federal FBR Jurisdiction (Islamabad / Lahore / Karachi / Multan)', stateTaxRatePercent: 0 },
        ],
        defaultEmployeeSalary: 7200000,
        defaultContractorHourlyRate: 4800,
        defaultHealthBenefitAnnual: 180000,
        defaultBusinessExpensesAnnual: 450000,
        defaultAccountingAndEntityFeesAnnual: 60000,
        eorMonthlyPlatformFeeLocal: 165000,
        contractorMgmtMonthlyFeeLocal: 13500,
    },
    AE: {
        code: 'AE',
        name: 'UAE / Dubai (Mainland Employee + Gratuity vs. Freelance Permit vs. Free Zone FZ-LLC)',
        currencyCode: 'AED',
        currencySymbol: 'AED ',
        taxYearLabel: '2026 UAE Ministry of Finance (0% Personal Income Tax • 9% Corp Tax > AED 375k)',
        employeeRegimeName: 'UAE Full-Time Employee (0% Tax + EOSB Gratuity + Health/Flights)',
        standardContractorRegimeName: 'UAE Freelance Permit Holder (0% Personal Tax up to AED 1M Turnover)',
        optimizedEntityRegimeName: 'UAE Free Zone FZ-LLC (Small Business Relief / 0% up to AED 375k Profit)',
        authorityName: 'UAE Federal Tax Authority (FTA) & MOHRE',
        classificationTestName: 'UAE MOHRE Employment Contract vs. Independent Freelance Permit / B2B Trade License',
        defaultStateOrRegion: 'DUBAI',
        regionOptions: [
            { code: 'DUBAI', label: 'Dubai / Abu Dhabi (0% Personal Income Tax)', stateTaxRatePercent: 0 },
        ],
        defaultEmployeeSalary: 420000,
        defaultContractorHourlyRate: 260,
        defaultHealthBenefitAnnual: 18000,
        defaultBusinessExpensesAnnual: 24000,
        defaultAccountingAndEntityFeesAnnual: 15000,
        eorMonthlyPlatformFeeLocal: 2200,
        contractorMgmtMonthlyFeeLocal: 180,
    },
    GLOBAL_CUSTOM: {
        code: 'GLOBAL_CUSTOM',
        name: 'Global / Custom Country Regime (Any ISO 4217 Currency + Custom Statutory Rates)',
        currencyCode: 'USD',
        currencySymbol: '$',
        taxYearLabel: 'Worldwide Customizable Statutory Tax, Social Security & Corporate/Dividend Engine (160+ Countries)',
        employeeRegimeName: 'Full-Time Salaried Employee (Local Statutory Payroll)',
        standardContractorRegimeName: 'Independent Freelancer / Sole Proprietor',
        optimizedEntityRegimeName: 'Incorporated B2B Company / Special Tax Regime',
        authorityName: 'National Tax & Labor Authority (Worldwide)',
        classificationTestName: 'ILO Recommendation 198 & Global B2B Independent Contractor Test',
        defaultStateOrRegion: 'GLOBAL_STD',
        regionOptions: [
            { code: 'GLOBAL_STD', label: 'Standard National Jurisdiction (0% Regional Surtax)', stateTaxRatePercent: 0 },
            { code: 'GLOBAL_MUNI_5', label: 'Municipal / Cantonal / Regional Surtax (5.0%)', stateTaxRatePercent: 5.0 },
            { code: 'GLOBAL_MUNI_10', label: 'High Regional / Cantonal Tax (10.0%)', stateTaxRatePercent: 10.0 },
        ],
        defaultEmployeeSalary: 100000,
        defaultContractorHourlyRate: 65,
        defaultHealthBenefitAnnual: 4000,
        defaultBusinessExpensesAnnual: 4500,
        defaultAccountingAndEntityFeesAnnual: 1800,
        eorMonthlyPlatformFeeLocal: 599,
        contractorMgmtMonthlyFeeLocal: 49,
    },
};

// ============================================================================
// 3. PROGRESSIVE BRACKET & STATUTORY TAX ENGINE BY JURISDICTION
// ============================================================================

function computeProgressiveTax(
    taxableIncome: number,
    brackets: { upTo: number; rate: number }[]
): { totalTax: number; marginalRate: number } {
    if (taxableIncome <= 0) return { totalTax: 0, marginalRate: brackets[0]?.rate || 0 };
    let tax = 0;
    let prevLimit = 0;
    let marginalRate = brackets[0]?.rate || 0;

    for (const b of brackets) {
        if (taxableIncome > prevLimit) {
            const slice = Math.min(taxableIncome, b.upTo) - prevLimit;
            tax += slice * b.rate;
            marginalRate = b.rate;
            prevLimit = b.upTo;
        } else {
            break;
        }
    }
    return { totalTax: Math.max(0, tax), marginalRate };
}

/**
 * Computes all 3 regimes for a given contractor annual gross revenue and employee input state.
 * Used both for the primary calculation AND inside the binary-search Reverse Break-Even Rate Solver.
 */
export function validateAndNormalizeCalculatorInputs(
    raw: ContractorVsEmployeeInputs
): {
    normalized: ContractorVsEmployeeInputs;
    validationWarnings: string[];
} {
    const warnings: string[] = [];
    const jurisdiction = JURISDICTION_CATALOG[raw.jurisdiction] ? raw.jurisdiction : 'US';
    const billableHoursPerDay = Math.min(24, Math.max(1, Number(raw.billableHoursPerDay) || 8));
    if (raw.billableHoursPerDay <= 0 || raw.billableHoursPerDay > 24) {
        warnings.push('Clamped Billable Hours/Day to valid range [1..24].');
    }
    const workingDaysPerWeek = Math.min(7, Math.max(1, Number(raw.workingDaysPerWeek) || 5));
    const billableWeeksPerYear = Math.min(52, Math.max(1, Number(raw.billableWeeksPerYear) || 46));
    if (raw.billableWeeksPerYear <= 0 || raw.billableWeeksPerYear > 52) {
        warnings.push('Clamped Billable Weeks/Year to valid range [1..52].');
    }
    const entityOwnerSalaryPercent = Math.min(85, Math.max(15, Number(raw.entityOwnerSalaryPercent) || 40));

    return {
        normalized: {
            ...raw,
            jurisdiction,
            taxYear: raw.taxYear === '2025' ? '2025' : '2026',
            billableHoursPerDay,
            workingDaysPerWeek,
            billableWeeksPerYear,
            entityOwnerSalaryPercent,
            employeeBaseSalaryAnnual: Math.max(0, Number(raw.employeeBaseSalaryAnnual) || 0),
            employeeAnnualBonus: Math.max(0, Number(raw.employeeAnnualBonus) || 0),
            employerHealthInsuranceAnnual: Math.max(0, Number(raw.employerHealthInsuranceAnnual) || 0),
            employerRetirementMatchPercent: Math.min(50, Math.max(0, Number(raw.employerRetirementMatchPercent) || 0)),
            employeeRetirementContributionPercent: Math.min(50, Math.max(0, Number(raw.employeeRetirementContributionPercent) || 0)),
            paidVacationAndHolidaysDays: Math.min(120, Math.max(0, Number(raw.paidVacationAndHolidaysDays) || 0)),
            paidSickDays: Math.min(60, Math.max(0, Number(raw.paidSickDays) || 0)),
            employerOtherPerksAnnual: Math.max(0, Number(raw.employerOtherPerksAnnual) || 0),
            contractorRateInput: Math.max(0, Number(raw.contractorRateInput) || 0),
            deductibleBusinessExpensesAnnual: Math.max(0, Number(raw.deductibleBusinessExpensesAnnual) || 0),
            contractorSelfFundedHealthAnnual: Math.max(0, Number(raw.contractorSelfFundedHealthAnnual) || 0),
            contractorRetirementContributionAnnual: Math.max(0, Number(raw.contractorRetirementContributionAnnual) || 0),
            entityAccountingAndUmbrellaFeesAnnual: Math.max(0, Number(raw.entityAccountingAndUmbrellaFeesAnnual) || 0),
        },
        validationWarnings: warnings,
    };
}

/**
 * Computes all 3 regimes in the jurisdiction's STATUTORY CURRENCY first so tax brackets
 * and statutory caps are never distorted by foreign display currencies.
 */
export function evaluateThreeRegimesForGross(
    rawInputs: ContractorVsEmployeeInputs,
    contractorAnnualGrossOverride?: number
): {
    employeeRegime: RegimeFinancialBreakdown;
    standardContractorRegime: RegimeFinancialBreakdown;
    optimizedEntityRegime: RegimeFinancialBreakdown;
    ukIr35KidWaterfall: UkIr35KidWaterfall;
    usScheduleSeAndScorp: UsScheduleSeAndScorpBreakdown;
} {
    const { normalized: inputs } = validateAndNormalizeCalculatorInputs(rawInputs);
    const meta = JURISDICTION_CATALOG[inputs.jurisdiction];
    const billableDaysPerYear = Math.max(1, inputs.billableWeeksPerYear * inputs.workingDaysPerWeek);
    const billableHoursPerYear = Math.max(1, billableDaysPerYear * inputs.billableHoursPerDay);

    const contractorAnnualGross =
        contractorAnnualGrossOverride !== undefined
            ? Math.max(0, contractorAnnualGrossOverride)
            : inputs.contractorRateMode === 'HOURLY'
                ? Math.max(0, inputs.contractorRateInput * billableHoursPerYear)
                : inputs.contractorRateMode === 'DAILY'
                    ? Math.max(0, inputs.contractorRateInput * billableDaysPerYear)
                    : inputs.contractorRateMode === 'MONTHLY'
                        ? Math.max(0, inputs.contractorRateInput * 12)
                        : Math.max(0, inputs.contractorRateInput);

    const empGrossCash = Math.max(0, inputs.employeeBaseSalaryAnnual + inputs.employeeAnnualBonus);
    const employerRetirementMatchAnnual =
        inputs.employeeBaseSalaryAnnual * (Math.max(0, inputs.employerRetirementMatchPercent) / 100);
    const employeeOwnRetirementAnnual =
        inputs.employeeBaseSalaryAnnual * (Math.max(0, inputs.employeeRetirementContributionPercent) / 100);
    const empMonetizedBenefits =
        Math.max(0, inputs.employerHealthInsuranceAnnual) +
        employerRetirementMatchAnnual +
        Math.max(0, inputs.employerOtherPerksAnnual);

    const expenses = Math.max(0, inputs.deductibleBusinessExpensesAnnual);
    const selfHealth = Math.max(0, inputs.contractorSelfFundedHealthAnnual);
    const contractorRetire = Math.max(0, inputs.contractorRetirementContributionAnnual);
    const entityFees = Math.max(0, inputs.entityAccountingAndUmbrellaFeesAnnual);
    const salarySplitRatio = Math.min(0.85, Math.max(0.15, inputs.entityOwnerSalaryPercent / 100));
    const stateRate = Math.max(0, inputs.stateTaxRatePercent) / 100;

    let usScheduleSeAndScorp: UsScheduleSeAndScorpBreakdown = {
        scheduleCNetProfit: 0,
        scheduleSeTaxableBase9235: 0,
        socialSecurityWageCap: inputs.taxYear === '2025' ? 176100 : 184500,
        socialSecurityTax124: 0,
        medicareTax29: 0,
        additionalMedicareTax09: 0,
        totalSelfEmploymentTax: 0,
        halfSeTaxAboveTheLineDeduction: 0,
        qbiSection199ADeduction20Pct: 0,
        scorpReasonableSalaryAnnual: 0,
        scorpK1DistributionAnnual: 0,
        scorpEmployerAndEmployeeFicaAnnual: 0,
        scorpCorporatePayrollAndCpaCostAnnual: 0,
        scorpNetTaxSavingsVs1099SoleProp: 0,
    };

    let ukIr35KidWaterfall: UkIr35KidWaterfall = {
        assignmentGrossAnnual: contractorAnnualGross,
        umbrellaMarginAnnual: 1300,
        employerNationalInsuranceAnnual: 0,
        apprenticeshipLevyAnnual: 0,
        employerPensionContributionAnnual: contractorRetire,
        grossTaxablePayeSalaryAnnual: 0,
        rolledUpHolidayPayComponentAnnual: 0,
        employeeIncomeTaxAnnual: 0,
        employeeNationalInsuranceAnnual: 0,
        netInsideIr35TakeHomeAnnual: 0,
        outsideIr35DirectorSalaryAnnual: 12570,
        outsideIr35CorporationTaxAnnual: 0,
        outsideIr35NetCompanyProfitForDividends: 0,
        outsideIr35DividendTaxAnnual: 0,
        outsideIr35NetTakeHomeAnnual: 0,
        outsideIr35AnnualGainOverInside: 0,
    };

    // ==========================================================================
    // DEDICATED MODULE 1: UNITED STATES (IRS W-2 vs. 1099 Schedule C vs. S-Corp 1120-S)
    // ==========================================================================
    if (inputs.jurisdiction === 'US') {
        const ssWageCap = inputs.taxYear === '2025' ? 176100 : 184500;
        const stdDed =
            inputs.filingStatus === 'MARRIED_JOINT'
                ? inputs.taxYear === '2025' ? 30000 : 31500
                : inputs.filingStatus === 'HEAD_OF_HOUSEHOLD'
                    ? inputs.taxYear === '2025' ? 22500 : 23625
                    : inputs.taxYear === '2025' ? 15000 : 15750;
        const addMedicareThreshold = inputs.filingStatus === 'MARRIED_JOINT' ? 250000 : 200000;

        // QBI Section 199A Phase-Out Thresholds (2025/2026)
        const qbiPhaseOutStart = inputs.filingStatus === 'MARRIED_JOINT' ? 394600 : 197300;
        const qbiPhaseOutRange = inputs.filingStatus === 'MARRIED_JOINT' ? 100000 : 50000;
        const isSstb = Boolean(inputs.usIsSpecifiedServiceTradeOrBusinessSstb);

        const computeUsQbiDeduction = (qbiEligibleProfit: number, taxableIncomeBeforeQbi: number, w2WagesPaidByEntity: number): number => {
            if (qbiEligibleProfit <= 0 || taxableIncomeBeforeQbi <= 0) return 0;
            const base20 = qbiEligibleProfit * 0.2;
            const overallCap = taxableIncomeBeforeQbi * 0.2;
            if (taxableIncomeBeforeQbi <= qbiPhaseOutStart) {
                return Math.min(base20, overallCap);
            }
            const phaseProgress = Math.min(1, (taxableIncomeBeforeQbi - qbiPhaseOutStart) / qbiPhaseOutRange);
            if (isSstb) {
                // Specified Service Trade or Business (SSTB) phases out to $0 above upper threshold
                const sstbMultiplier = Math.max(0, 1 - phaseProgress);
                const w2Limit = Math.max(w2WagesPaidByEntity * 0.5, w2WagesPaidByEntity * 0.25);
                const phasedBase = base20 * sstbMultiplier;
                const wageCapped = phasedBase - (phasedBase - Math.min(phasedBase, w2Limit * sstbMultiplier)) * phaseProgress;
                return Math.max(0, Math.min(wageCapped, overallCap));
            } else {
                // Non-SSTB is limited by greater of 50% of W-2 wages or 25% of W-2 wages + 2.5% UBIA
                const w2Limit = w2WagesPaidByEntity * 0.5;
                const excessReduction = Math.max(0, base20 - w2Limit) * phaseProgress;
                return Math.max(0, Math.min(base20 - excessReduction, overallCap));
            }
        };

        const usBrackets =
            inputs.filingStatus === 'MARRIED_JOINT'
                ? [
                    { upTo: 24800, rate: 0.1 },
                    { upTo: 100800, rate: 0.12 },
                    { upTo: 211400, rate: 0.22 },
                    { upTo: 403550, rate: 0.24 },
                    { upTo: 512450, rate: 0.32 },
                    { upTo: 768700, rate: 0.35 },
                    { upTo: Infinity, rate: 0.37 },
                ]
                : [
                    { upTo: 12400, rate: 0.1 },
                    { upTo: 50400, rate: 0.12 },
                    { upTo: 105700, rate: 0.22 },
                    { upTo: 201775, rate: 0.24 },
                    { upTo: 256225, rate: 0.32 },
                    { upTo: 640600, rate: 0.35 },
                    { upTo: Infinity, rate: 0.37 },
                ];

        // 1A. W-2 Employee
        const w2SsTax = Math.min(empGrossCash, ssWageCap) * 0.062;
        const w2MedTax =
            empGrossCash * 0.0145 + Math.max(0, empGrossCash - addMedicareThreshold) * 0.009;
        const w2FicaTotal = w2SsTax + w2MedTax;
        const w2Agi = Math.max(0, empGrossCash - employeeOwnRetirementAnnual);
        const w2Taxable = Math.max(0, w2Agi - stdDed);
        const { totalTax: w2FedTax, marginalRate: w2Marginal } = computeProgressiveTax(w2Taxable, usBrackets);
        const w2StateTax = w2Agi * stateRate;
        const w2TotalTax = w2FedTax + w2StateTax + w2FicaTotal;
        const w2NetCash = Math.max(0, empGrossCash - employeeOwnRetirementAnnual - w2TotalTax);

        const employeeRegime: RegimeFinancialBreakdown = {
            regimeId: 'FULL_TIME_EMPLOYEE',
            regimeTitle: meta.employeeRegimeName,
            regimeSubtitle: 'Employee pays 7.65% FICA half; Employer pays matching 7.65% + Benefits',
            grossTopLineAnnual: Math.round(empGrossCash),
            deductibleExpensesAndFeesAnnual: 0,
            employerSideDeductionsFromAssignmentAnnual: 0,
            taxableIncomeBaseAnnual: Math.round(w2Taxable),
            incomeTaxFederalOrNationalAnnual: Math.round(w2FedTax),
            stateOrProvincialTaxAnnual: Math.round(w2StateTax),
            socialSecurityOrEmployeeNiAnnual: Math.round(w2FicaTotal),
            selfEmploymentOrDividendTaxAnnual: 0,
            corporateOrEntityTaxAnnual: 0,
            totalTaxesAndStatutoryDeductionsAnnual: Math.round(w2TotalTax),
            effectiveTaxRatePercent: empGrossCash > 0 ? Number(((w2TotalTax / empGrossCash) * 100).toFixed(2)) : 0,
            marginalTaxRatePercent: Number(((w2Marginal + stateRate) * 100).toFixed(1)),
            netCashTakeHomeAnnual: Math.round(w2NetCash),
            netCashTakeHomeMonthly: Math.round(w2NetCash / 12),
            netEffectiveHourlyTakeHome: Number((w2NetCash / billableHoursPerYear).toFixed(2)),
            monetizedBenefitsAndRetirementValueAnnual: Math.round(empMonetizedBenefits + employeeOwnRetirementAnnual),
            trueTotalEconomicPackageAnnual: Math.round(w2NetCash + empMonetizedBenefits + employeeOwnRetirementAnnual),
            qbiOrSpecialDeductionSavedAnnual: 0,
            lineItemNotes: [
                `Employee FICA (${inputs.taxYear}): $${Math.round(w2SsTax).toLocaleString()} Social Security (6.2% up to $${ssWageCap.toLocaleString()}) + $${Math.round(w2MedTax).toLocaleString()} Medicare`,
                `Standard Deduction ($${stdDed.toLocaleString()}) + Pre-Tax 401(k) deferral ($${Math.round(employeeOwnRetirementAnnual).toLocaleString()})`,
            ],
        };

        // 1B. 1099 Sole Proprietor / Single-Member LLC (Schedule C + Schedule SE + Form 8995 QBI)
        const schedCNetProfit = Math.max(0, contractorAnnualGross - expenses);
        const seTaxableBase = schedCNetProfit * 0.9235;
        const seSsTax = Math.min(seTaxableBase, ssWageCap) * 0.124;
        const seMedTax = seTaxableBase * 0.029;
        const seAddMedTax = Math.max(0, seTaxableBase - addMedicareThreshold) * 0.009;
        const totalSeTax = seSsTax + seMedTax + seAddMedTax;
        const halfSeDeduction = (seSsTax + seMedTax) * 0.5;

        const solePropAgi = Math.max(
            0,
            schedCNetProfit - halfSeDeduction - selfHealth - contractorRetire
        );
        const taxableBeforeQbi = Math.max(0, solePropAgi - stdDed);
        const qbiDeduction = computeUsQbiDeduction(solePropAgi, taxableBeforeQbi, 0);
        const solePropTaxable = Math.max(0, taxableBeforeQbi - qbiDeduction);
        const { totalTax: solePropFedTax, marginalRate: solePropMarginal } = computeProgressiveTax(
            solePropTaxable,
            usBrackets
        );
        const { totalTax: fedWithoutQbi } = computeProgressiveTax(taxableBeforeQbi, usBrackets);
        const qbiTaxSaved = Math.max(0, fedWithoutQbi - solePropFedTax);
        const solePropStateTax = solePropAgi * stateRate;
        const solePropTotalTax = solePropFedTax + solePropStateTax + totalSeTax;
        const solePropNetCash = Math.max(
            0,
            contractorAnnualGross - expenses - selfHealth - contractorRetire - solePropTotalTax
        );

        const standardContractorRegime: RegimeFinancialBreakdown = {
            regimeId: 'STANDARD_CONTRACTOR',
            regimeTitle: meta.standardContractorRegimeName,
            regimeSubtitle: `15.3% SECA on 92.35% of profit ($${ssWageCap.toLocaleString()} SS cap) + 50% SE Ded + Sec 199A QBI`,
            grossTopLineAnnual: Math.round(contractorAnnualGross),
            deductibleExpensesAndFeesAnnual: Math.round(expenses + selfHealth),
            employerSideDeductionsFromAssignmentAnnual: 0,
            taxableIncomeBaseAnnual: Math.round(solePropTaxable),
            incomeTaxFederalOrNationalAnnual: Math.round(solePropFedTax),
            stateOrProvincialTaxAnnual: Math.round(solePropStateTax),
            socialSecurityOrEmployeeNiAnnual: 0,
            selfEmploymentOrDividendTaxAnnual: Math.round(totalSeTax),
            corporateOrEntityTaxAnnual: 0,
            totalTaxesAndStatutoryDeductionsAnnual: Math.round(solePropTotalTax),
            effectiveTaxRatePercent:
                contractorAnnualGross > 0
                    ? Number(((solePropTotalTax / contractorAnnualGross) * 100).toFixed(2))
                    : 0,
            marginalTaxRatePercent: Number(((solePropMarginal + stateRate) * 100).toFixed(1)),
            netCashTakeHomeAnnual: Math.round(solePropNetCash),
            netCashTakeHomeMonthly: Math.round(solePropNetCash / 12),
            netEffectiveHourlyTakeHome: Number((solePropNetCash / billableHoursPerYear).toFixed(2)),
            monetizedBenefitsAndRetirementValueAnnual: Math.round(contractorRetire),
            trueTotalEconomicPackageAnnual: Math.round(solePropNetCash + contractorRetire),
            qbiOrSpecialDeductionSavedAnnual: Math.round(qbiTaxSaved),
            lineItemNotes: [
                `Schedule SE Base (92.35%): $${Math.round(seTaxableBase).toLocaleString()} → SE Tax: $${Math.round(totalSeTax).toLocaleString()} (50% deductible: $${Math.round(halfSeDeduction).toLocaleString()})`,
                `Section 199A QBI Deduction${isSstb ? ' (SSTB Phase-Out Applied)' : ''}: $${Math.round(qbiDeduction).toLocaleString()} (Saved $${Math.round(qbiTaxSaved).toLocaleString()} Fed Tax)`,
            ],
        };

        // 1C. S-Corp Election (Form 1120-S Reasonable W-2 Salary + FICA-Exempt K-1 Distribution)
        const netBeforeOwnerComp = Math.max(0, contractorAnnualGross - expenses - entityFees - selfHealth);
        const rawScorpSalary =
            inputs.usScorpReasonableSalaryOverride && inputs.usScorpReasonableSalaryOverride > 0
                ? Math.min(netBeforeOwnerComp, inputs.usScorpReasonableSalaryOverride)
                : Math.round(netBeforeOwnerComp * salarySplitRatio);
        const scorpSalary = Math.max(0, rawScorpSalary);
        const scorpEmployerFica =
            Math.min(scorpSalary, ssWageCap) * 0.062 + scorpSalary * 0.0145 + Math.min(scorpSalary, 7000) * 0.006;
        const scorpEmployeeFica =
            Math.min(scorpSalary, ssWageCap) * 0.062 +
            scorpSalary * 0.0145 +
            Math.max(0, scorpSalary - addMedicareThreshold) * 0.009;
        const scorpTotalFica = scorpEmployerFica + scorpEmployeeFica;
        const scorpK1Distribution = Math.max(0, netBeforeOwnerComp - scorpSalary - scorpEmployerFica);

        const scorpAgi = Math.max(0, scorpSalary + scorpK1Distribution - contractorRetire);
        const scorpTaxableBeforeQbi = Math.max(0, scorpAgi - stdDed);
        const scorpQbiDeduction = computeUsQbiDeduction(
            Math.max(0, scorpK1Distribution - contractorRetire),
            scorpTaxableBeforeQbi,
            scorpSalary
        );
        const scorpTaxable = Math.max(0, scorpTaxableBeforeQbi - scorpQbiDeduction);
        const { totalTax: scorpFedTax, marginalRate: scorpMarginal } = computeProgressiveTax(
            scorpTaxable,
            usBrackets
        );
        const scorpStateTax = scorpAgi * stateRate;
        const scorpTotalTax = scorpFedTax + scorpStateTax + scorpTotalFica;
        const scorpNetCash = Math.max(
            0,
            contractorAnnualGross - expenses - entityFees - selfHealth - contractorRetire - scorpTotalTax
        );

        usScheduleSeAndScorp = {
            scheduleCNetProfit: Math.round(schedCNetProfit),
            scheduleSeTaxableBase9235: Math.round(seTaxableBase),
            socialSecurityWageCap: ssWageCap,
            socialSecurityTax124: Math.round(seSsTax),
            medicareTax29: Math.round(seMedTax),
            additionalMedicareTax09: Math.round(seAddMedTax),
            totalSelfEmploymentTax: Math.round(totalSeTax),
            halfSeTaxAboveTheLineDeduction: Math.round(halfSeDeduction),
            qbiSection199ADeduction20Pct: Math.round(qbiDeduction),
            scorpReasonableSalaryAnnual: Math.round(scorpSalary),
            scorpK1DistributionAnnual: Math.round(scorpK1Distribution),
            scorpEmployerAndEmployeeFicaAnnual: Math.round(scorpTotalFica),
            scorpCorporatePayrollAndCpaCostAnnual: Math.round(entityFees),
            scorpNetTaxSavingsVs1099SoleProp: Math.round(scorpNetCash - solePropNetCash),
        };

        const optimizedEntityRegime: RegimeFinancialBreakdown = {
            regimeId: 'OPTIMIZED_ENTITY',
            regimeTitle: meta.optimizedEntityRegimeName,
            regimeSubtitle: `W-2 Reasonable Salary ($${Math.round(scorpSalary).toLocaleString()}) + FICA-Exempt K-1 Distribution ($${Math.round(scorpK1Distribution).toLocaleString()})`,
            grossTopLineAnnual: Math.round(contractorAnnualGross),
            deductibleExpensesAndFeesAnnual: Math.round(expenses + entityFees + selfHealth),
            employerSideDeductionsFromAssignmentAnnual: 0,
            taxableIncomeBaseAnnual: Math.round(scorpTaxable),
            incomeTaxFederalOrNationalAnnual: Math.round(scorpFedTax),
            stateOrProvincialTaxAnnual: Math.round(scorpStateTax),
            socialSecurityOrEmployeeNiAnnual: Math.round(scorpTotalFica),
            selfEmploymentOrDividendTaxAnnual: 0,
            corporateOrEntityTaxAnnual: 0,
            totalTaxesAndStatutoryDeductionsAnnual: Math.round(scorpTotalTax),
            effectiveTaxRatePercent:
                contractorAnnualGross > 0
                    ? Number(((scorpTotalTax / contractorAnnualGross) * 100).toFixed(2))
                    : 0,
            marginalTaxRatePercent: Number(((scorpMarginal + stateRate) * 100).toFixed(1)),
            netCashTakeHomeAnnual: Math.round(scorpNetCash),
            netCashTakeHomeMonthly: Math.round(scorpNetCash / 12),
            netEffectiveHourlyTakeHome: Number((scorpNetCash / billableHoursPerYear).toFixed(2)),
            monetizedBenefitsAndRetirementValueAnnual: Math.round(contractorRetire),
            trueTotalEconomicPackageAnnual: Math.round(scorpNetCash + contractorRetire),
            qbiOrSpecialDeductionSavedAnnual: Math.round(Math.max(0, totalSeTax - scorpTotalFica)),
            lineItemNotes: [
                `Reasonable W-2 Salary Benchmark (35%–55% of net profit = $${Math.round(netBeforeOwnerComp * 0.35).toLocaleString()}–$${Math.round(netBeforeOwnerComp * 0.55).toLocaleString()}): Applied $${Math.round(scorpSalary).toLocaleString()}`,
                `Net S-Corp Advantage vs. 1099 Sole Prop (after $${Math.round(entityFees).toLocaleString()} CPA/Payroll cost): $${Math.round(scorpNetCash - solePropNetCash).toLocaleString()}/yr`,
            ],
        };

        return {
            employeeRegime,
            standardContractorRegime,
            optimizedEntityRegime,
            ukIr35KidWaterfall,
            usScheduleSeAndScorp,
        };
    }

    // ==========================================================================
    // DEDICATED MODULE 2: UNITED KINGDOM (PAYE vs. Inside IR35 KID vs. Outside IR35 Ltd)
    // ==========================================================================
    if (inputs.jurisdiction === 'UK') {
        const computeUkPersonalAllowance = (adjustedNetIncome: number): number => {
            if (adjustedNetIncome <= 100000) return 12570;
            const reduction = Math.floor((adjustedNetIncome - 100000) / 2);
            return Math.max(0, 12570 - reduction);
        };

        const isScotland = inputs.regionCode === 'SCOTLAND';
        const divBasicRate = inputs.taxYear === '2025' ? 0.0875 : 0.1075; // 8.75% in 2025/26, 10.75% in 2026/27

        const computeUkPayeTaxAndNi = (grossSalary: number, pensionSacrifice = 0) => {
            const taxableSalaryAfterPension = Math.max(0, grossSalary - pensionSacrifice);
            const pa = computeUkPersonalAllowance(taxableSalaryAfterPension);
            const taxableAfterPa = Math.max(0, taxableSalaryAfterPension - pa);

            // Official 6-band Scottish Income Tax Table vs. rUK 3-band Table
            const ukBrackets = isScotland
                ? [
                    { upTo: 2306, rate: 0.19 }, // Starter Rate 19%
                    { upTo: 13991, rate: 0.2 }, // Scottish Basic Rate 20%
                    { upTo: 31092, rate: 0.21 }, // Intermediate Rate 21%
                    { upTo: 62430, rate: 0.42 }, // Higher Rate 42%
                    { upTo: 125140 - pa, rate: 0.45 }, // Advanced Rate 45%
                    { upTo: Infinity, rate: 0.48 }, // Top Rate 48%
                ]
                : [
                    { upTo: 37700, rate: 0.2 },
                    { upTo: 125140 - pa, rate: 0.4 },
                    { upTo: Infinity, rate: 0.45 },
                ];

            const { totalTax: incomeTax, marginalRate } = computeProgressiveTax(taxableAfterPa, ukBrackets);
            const niBand1 = Math.max(0, Math.min(taxableSalaryAfterPension, 50270) - 12570) * 0.08;
            const niBand2 = Math.max(0, taxableSalaryAfterPension - 50270) * 0.02;
            const empNi = niBand1 + niBand2;
            return { incomeTax, empNi, marginalRate, taxableAfterPa };
        };

        // 2A. Permanent PAYE Employee
        const perm = computeUkPayeTaxAndNi(empGrossCash, employeeOwnRetirementAnnual);
        const permTotalTax = perm.incomeTax + perm.empNi;
        const permNetCash = Math.max(0, empGrossCash - employeeOwnRetirementAnnual - permTotalTax);

        const employeeRegime: RegimeFinancialBreakdown = {
            regimeId: 'FULL_TIME_EMPLOYEE',
            regimeTitle: meta.employeeRegimeName,
            regimeSubtitle: isScotland
                ? 'Scottish 6-Band PAYE Income Tax (19%–48%) + Class 1 NI (8%/2%)'
                : 'rUK PAYE Income Tax (20%/40%/45%) + Employee Class 1 NI (8%/2%)',
            grossTopLineAnnual: Math.round(empGrossCash),
            deductibleExpensesAndFeesAnnual: 0,
            employerSideDeductionsFromAssignmentAnnual: 0,
            taxableIncomeBaseAnnual: Math.round(perm.taxableAfterPa),
            incomeTaxFederalOrNationalAnnual: Math.round(perm.incomeTax),
            stateOrProvincialTaxAnnual: 0,
            socialSecurityOrEmployeeNiAnnual: Math.round(perm.empNi),
            selfEmploymentOrDividendTaxAnnual: 0,
            corporateOrEntityTaxAnnual: 0,
            totalTaxesAndStatutoryDeductionsAnnual: Math.round(permTotalTax),
            effectiveTaxRatePercent: empGrossCash > 0 ? Number(((permTotalTax / empGrossCash) * 100).toFixed(2)) : 0,
            marginalTaxRatePercent: Number((perm.marginalRate * 100).toFixed(1)),
            netCashTakeHomeAnnual: Math.round(permNetCash),
            netCashTakeHomeMonthly: Math.round(permNetCash / 12),
            netEffectiveHourlyTakeHome: Number((permNetCash / billableHoursPerYear).toFixed(2)),
            monetizedBenefitsAndRetirementValueAnnual: Math.round(empMonetizedBenefits + employeeOwnRetirementAnnual),
            trueTotalEconomicPackageAnnual: Math.round(permNetCash + empMonetizedBenefits + employeeOwnRetirementAnnual),
            qbiOrSpecialDeductionSavedAnnual: 0,
            lineItemNotes: [
                `PAYE Income Tax (${isScotland ? 'Scottish 6-Band' : 'England/NI/Wales'}): £${Math.round(perm.incomeTax).toLocaleString()}`,
                `Employee Class 1 NI (8% / 2%): £${Math.round(perm.empNi).toLocaleString()}`,
            ],
        };

        // 2B. Inside IR35 via Umbrella Company (Key Information Document / KID Waterfall)
        const umbrellaMargin = Math.min(2600, Math.max(1000, entityFees || 1300));
        const distributablePool = Math.max(0, contractorAnnualGross - umbrellaMargin - contractorRetire);
        const grossTaxablePayeSalary =
            distributablePool <= 5000
                ? distributablePool
                : (distributablePool + 5000 * 0.155) / 1.155;
        const employerNiAnnual = Math.max(0, (grossTaxablePayeSalary - 5000) * 0.15);
        const apprenticeshipLevyAnnual = Math.max(0, (grossTaxablePayeSalary - 5000) * 0.005);
        const rolledUpHolidayPay = grossTaxablePayeSalary * 0.1077;
        const insidePaye = computeUkPayeTaxAndNi(grossTaxablePayeSalary, 0);
        const insideTotalDeductions =
            umbrellaMargin +
            contractorRetire +
            employerNiAnnual +
            apprenticeshipLevyAnnual +
            insidePaye.incomeTax +
            insidePaye.empNi;
        const insideNetCash = Math.max(0, contractorAnnualGross - insideTotalDeductions);

        const standardContractorRegime: RegimeFinancialBreakdown = {
            regimeId: 'STANDARD_CONTRACTOR',
            regimeTitle: meta.standardContractorRegimeName,
            regimeSubtitle: 'Assignment Rate minus Umbrella Margin, 15% Employer NI & 0.5% Levy before PAYE',
            grossTopLineAnnual: Math.round(contractorAnnualGross),
            deductibleExpensesAndFeesAnnual: Math.round(umbrellaMargin),
            employerSideDeductionsFromAssignmentAnnual: Math.round(employerNiAnnual + apprenticeshipLevyAnnual),
            taxableIncomeBaseAnnual: Math.round(grossTaxablePayeSalary),
            incomeTaxFederalOrNationalAnnual: Math.round(insidePaye.incomeTax),
            stateOrProvincialTaxAnnual: 0,
            socialSecurityOrEmployeeNiAnnual: Math.round(insidePaye.empNi),
            selfEmploymentOrDividendTaxAnnual: 0,
            corporateOrEntityTaxAnnual: Math.round(employerNiAnnual + apprenticeshipLevyAnnual),
            totalTaxesAndStatutoryDeductionsAnnual: Math.round(
                employerNiAnnual + apprenticeshipLevyAnnual + insidePaye.incomeTax + insidePaye.empNi
            ),
            effectiveTaxRatePercent:
                contractorAnnualGross > 0
                    ? Number(
                        (
                            ((employerNiAnnual + apprenticeshipLevyAnnual + insidePaye.incomeTax + insidePaye.empNi) /
                                contractorAnnualGross) *
                            100
                        ).toFixed(2)
                    )
                    : 0,
            marginalTaxRatePercent: Number(((insidePaye.marginalRate + 0.155) * 100).toFixed(1)),
            netCashTakeHomeAnnual: Math.round(insideNetCash),
            netCashTakeHomeMonthly: Math.round(insideNetCash / 12),
            netEffectiveHourlyTakeHome: Number((insideNetCash / billableHoursPerYear).toFixed(2)),
            monetizedBenefitsAndRetirementValueAnnual: Math.round(contractorRetire),
            trueTotalEconomicPackageAnnual: Math.round(insideNetCash + contractorRetire),
            qbiOrSpecialDeductionSavedAnnual: 0,
            lineItemNotes: [
                `HMRC KID Employer Deductions from Rate: £${Math.round(employerNiAnnual).toLocaleString()} Employer NI (15%) + £${Math.round(apprenticeshipLevyAnnual).toLocaleString()} Levy (0.5%) + £${Math.round(umbrellaMargin).toLocaleString()} Umbrella Fee`,
                `Taxable Gross PAYE Pay: £${Math.round(grossTaxablePayeSalary).toLocaleString()} (includes £${Math.round(rolledUpHolidayPay).toLocaleString()} rolled-up holiday pot)`,
            ],
        };

        // 2C. Outside IR35 via UK Limited Company (Configurable Director Salary £5,000 or £12,570 + Corp Tax + Dividends)
        const targetDirectorSalary =
            inputs.ukDirectorSalaryStrategy === 'NI_THRESHOLD_5000' ? 5000 : 12570;
        const directorSalary = Math.min(targetDirectorSalary, Math.max(0, contractorAnnualGross * 0.5));
        const rawLtdEmpNi = Math.max(0, (directorSalary - 5000) * 0.15);
        const ltdEmployerNi = inputs.ukClaimsEmploymentAllowance ? 0 : rawLtdEmpNi;
        const ltdProfitBeforeTax = Math.max(
            0,
            contractorAnnualGross - expenses - entityFees - directorSalary - ltdEmployerNi - contractorRetire
        );
        // Exact HMRC Corporation Tax with Marginal Relief fraction 3/200 (0.015):
        // For profits between £50,000 and £250,000: Tax = P * 25% - (250,000 - P) * (3 / 200)
        let corpTax = 0;
        if (ltdProfitBeforeTax <= 50000) {
            corpTax = ltdProfitBeforeTax * 0.19;
        } else if (ltdProfitBeforeTax >= 250000) {
            corpTax = ltdProfitBeforeTax * 0.25;
        } else {
            corpTax = ltdProfitBeforeTax * 0.25 - (250000 - ltdProfitBeforeTax) * (3 / 200);
        }
        const distributableDividends = Math.max(0, ltdProfitBeforeTax - corpTax);
        const unusedPersonalAllowance = Math.max(0, 12570 - directorSalary);
        const taxableDividends = Math.max(0, distributableDividends - unusedPersonalAllowance - 500);
        const { totalTax: dividendTax, marginalRate: divMarginal } = computeProgressiveTax(taxableDividends, [
            { upTo: 37700, rate: divBasicRate },
            { upTo: 112570, rate: 0.3375 },
            { upTo: Infinity, rate: 0.3935 },
        ]);
        const outsideTotalTax = ltdEmployerNi + corpTax + dividendTax;
        const outsideNetCash = Math.max(0, directorSalary + distributableDividends - dividendTax);
        const outsideTotalEconomicValue = outsideNetCash + contractorRetire;

        ukIr35KidWaterfall = {
            assignmentGrossAnnual: Math.round(contractorAnnualGross),
            umbrellaMarginAnnual: Math.round(umbrellaMargin),
            employerNationalInsuranceAnnual: Math.round(employerNiAnnual),
            apprenticeshipLevyAnnual: Math.round(apprenticeshipLevyAnnual),
            employerPensionContributionAnnual: Math.round(contractorRetire),
            grossTaxablePayeSalaryAnnual: Math.round(grossTaxablePayeSalary),
            rolledUpHolidayPayComponentAnnual: Math.round(rolledUpHolidayPay),
            employeeIncomeTaxAnnual: Math.round(insidePaye.incomeTax),
            employeeNationalInsuranceAnnual: Math.round(insidePaye.empNi),
            netInsideIr35TakeHomeAnnual: Math.round(insideNetCash),
            outsideIr35DirectorSalaryAnnual: Math.round(directorSalary),
            outsideIr35CorporationTaxAnnual: Math.round(corpTax),
            outsideIr35NetCompanyProfitForDividends: Math.round(distributableDividends),
            outsideIr35DividendTaxAnnual: Math.round(dividendTax),
            outsideIr35NetTakeHomeAnnual: Math.round(outsideNetCash),
            outsideIr35AnnualGainOverInside: Math.round(outsideTotalEconomicValue - (insideNetCash + contractorRetire)),
        };

        const optimizedEntityRegime: RegimeFinancialBreakdown = {
            regimeId: 'OPTIMIZED_ENTITY',
            regimeTitle: meta.optimizedEntityRegimeName,
            regimeSubtitle: `£${Math.round(directorSalary).toLocaleString()} Director Salary + £${Math.round(distributableDividends).toLocaleString()} Net Dividends after Corp Tax`,
            grossTopLineAnnual: Math.round(contractorAnnualGross),
            deductibleExpensesAndFeesAnnual: Math.round(expenses + entityFees),
            employerSideDeductionsFromAssignmentAnnual: Math.round(ltdEmployerNi),
            taxableIncomeBaseAnnual: Math.round(ltdProfitBeforeTax),
            incomeTaxFederalOrNationalAnnual: 0,
            stateOrProvincialTaxAnnual: 0,
            socialSecurityOrEmployeeNiAnnual: Math.round(ltdEmployerNi),
            selfEmploymentOrDividendTaxAnnual: Math.round(dividendTax),
            corporateOrEntityTaxAnnual: Math.round(corpTax),
            totalTaxesAndStatutoryDeductionsAnnual: Math.round(outsideTotalTax),
            effectiveTaxRatePercent:
                contractorAnnualGross > 0
                    ? Number(((outsideTotalTax / contractorAnnualGross) * 100).toFixed(2))
                    : 0,
            marginalTaxRatePercent: Number((divMarginal * 100).toFixed(1)),
            netCashTakeHomeAnnual: Math.round(outsideNetCash),
            netCashTakeHomeMonthly: Math.round(outsideNetCash / 12),
            netEffectiveHourlyTakeHome: Number((outsideNetCash / billableHoursPerYear).toFixed(2)),
            monetizedBenefitsAndRetirementValueAnnual: Math.round(contractorRetire),
            trueTotalEconomicPackageAnnual: Math.round(outsideTotalEconomicValue),
            qbiOrSpecialDeductionSavedAnnual: Math.round(Math.max(0, outsideNetCash - insideNetCash)),
            lineItemNotes: [
                `HMRC Corp Tax (19%–25% with 3/200 Marginal Relief): £${Math.round(corpTax).toLocaleString()} on £${Math.round(ltdProfitBeforeTax).toLocaleString()} company profit`,
                `Outside IR35 Net Cash Gain vs. Inside IR35 Umbrella: +£${Math.round(outsideNetCash - insideNetCash).toLocaleString()}/yr`,
            ],
        };

        return {
            employeeRegime,
            standardContractorRegime,
            optimizedEntityRegime,
            ukIr35KidWaterfall,
            usScheduleSeAndScorp,
        };
    }

    // ==========================================================================
    // DEDICATED MODULE 3: CANADA (CRA T4 vs. T2125 Sole Prop vs. CCPC / PSB)
    // ==========================================================================
    if (inputs.jurisdiction === 'CA') {
        const fedBrackets = [
            { upTo: 16129, rate: 0 },
            { upTo: 57375, rate: 0.145 },
            { upTo: 114750, rate: 0.205 },
            { upTo: 177882, rate: 0.26 },
            { upTo: 253414, rate: 0.29 },
            { upTo: Infinity, rate: 0.33 },
        ];
        // Real Progressive Provincial Tax Brackets for ON, BC, AB, QC
        const provBracketsMap: Record<string, { upTo: number; rate: number }[]> = {
            ON: [
                { upTo: 12747, rate: 0 },
                { upTo: 52886, rate: 0.0505 },
                { upTo: 105775, rate: 0.0915 },
                { upTo: 150000, rate: 0.1116 },
                { upTo: 220000, rate: 0.1216 },
                { upTo: Infinity, rate: 0.1316 },
            ],
            BC: [
                { upTo: 12932, rate: 0 },
                { upTo: 49279, rate: 0.0506 },
                { upTo: 98560, rate: 0.077 },
                { upTo: 113158, rate: 0.105 },
                { upTo: 137407, rate: 0.1229 },
                { upTo: Infinity, rate: 0.147 },
            ],
            AB: [
                { upTo: 22323, rate: 0 },
                { upTo: 151234, rate: 0.1 },
                { upTo: 181481, rate: 0.12 },
                { upTo: 241974, rate: 0.13 },
                { upTo: Infinity, rate: 0.14 },
            ],
            QC: [
                { upTo: 18571, rate: 0 },
                { upTo: 53255, rate: 0.14 },
                { upTo: 106495, rate: 0.19 },
                { upTo: 129590, rate: 0.24 },
                { upTo: Infinity, rate: 0.2575 },
            ],
        };
        const provBrackets = provBracketsMap[inputs.regionCode] || provBracketsMap.ON;

        // Exact CRA CPP (5.95% on $3,500..$71,300) + CPP2 (4% on $71,300..$81,200) + Employee EI (1.64% up to $65,700)
        const computeCaCpp1And2 = (earnedIncome: number) => {
            const cpp1 = Math.max(0, Math.min(earnedIncome, 71300) - 3500) * 0.0595;
            const cpp2 = Math.max(0, Math.min(earnedIncome, 81200) - 71300) * 0.04;
            return cpp1 + cpp2;
        };
        const empCpp = computeCaCpp1And2(empGrossCash);
        const empEi = Math.min(empGrossCash, 65700) * 0.0164;
        const empTaxable = Math.max(0, empGrossCash - employeeOwnRetirementAnnual - empCpp * 0.15);
        const { totalTax: empFed, marginalRate: empFedMarg } = computeProgressiveTax(empTaxable, fedBrackets);
        const { totalTax: empProv, marginalRate: empProvMarg } = computeProgressiveTax(empTaxable, provBrackets);
        const empTotalTax = empFed + empProv + empCpp + empEi;
        const empNet = Math.max(0, empGrossCash - employeeOwnRetirementAnnual - empTotalTax);

        // T2125 Sole Proprietor (Pays 2x CPP1 + 2x CPP2, 50% employer CPP is deductible from taxable income)
        const soleProfitBeforeCpp = Math.max(0, contractorAnnualGross - expenses - selfHealth);
        const soleCpp = computeCaCpp1And2(soleProfitBeforeCpp) * 2;
        const soleTaxable = Math.max(0, soleProfitBeforeCpp - soleCpp * 0.5 - contractorRetire);
        const { totalTax: cFed, marginalRate: cFedMarg } = computeProgressiveTax(soleTaxable, fedBrackets);
        const { totalTax: cProv, marginalRate: cProvMarg } = computeProgressiveTax(soleTaxable, provBrackets);
        const cTotalTax = cFed + cProv + soleCpp;
        const cNet = Math.max(
            0,
            contractorAnnualGross - expenses - selfHealth - contractorRetire - cTotalTax
        );

        // CCPC Incorporated Contractor (Small Business Deduction 12.2% vs. CRA PSB Risk if complianceScore < 55)
        const auditPreview = evaluateClassificationAudit(inputs);
        const isPsbTrap = auditPreview.complianceScore < 55;
        const ccpcProfit = Math.max(
            0,
            contractorAnnualGross - expenses - entityFees - selfHealth - contractorRetire
        );
        // Small Business Deduction applies up to $500,000 active business income (9% Fed + 3.2% ON = 12.2%; General rate = 26.5%; PSB punitive rate = 44.5%)
        const ccpcCorpTax = isPsbTrap
            ? ccpcProfit * 0.445
            : Math.min(ccpcProfit, 500000) * 0.122 + Math.max(0, ccpcProfit - 500000) * 0.265;
        const distributableDiv = Math.max(0, ccpcProfit - ccpcCorpTax);
        // Non-eligible dividend effective personal tax after dividend gross-up & credit
        const divTax = distributableDiv * (isPsbTrap ? 0.28 : 0.155);
        const optTotalTax = ccpcCorpTax + divTax;
        const optNet = Math.max(
            0,
            contractorAnnualGross - expenses - entityFees - selfHealth - contractorRetire - optTotalTax
        );

        return {
            employeeRegime: {
                regimeId: 'FULL_TIME_EMPLOYEE',
                regimeTitle: meta.employeeRegimeName,
                regimeSubtitle: `CRA Federal + ${inputs.regionCode} Provincial Brackets + 1x CPP/CPP2 & EI`,
                grossTopLineAnnual: Math.round(empGrossCash),
                deductibleExpensesAndFeesAnnual: 0,
                employerSideDeductionsFromAssignmentAnnual: 0,
                taxableIncomeBaseAnnual: Math.round(empTaxable),
                incomeTaxFederalOrNationalAnnual: Math.round(empFed),
                stateOrProvincialTaxAnnual: Math.round(empProv),
                socialSecurityOrEmployeeNiAnnual: Math.round(empCpp + empEi),
                selfEmploymentOrDividendTaxAnnual: 0,
                corporateOrEntityTaxAnnual: 0,
                totalTaxesAndStatutoryDeductionsAnnual: Math.round(empTotalTax),
                effectiveTaxRatePercent: empGrossCash > 0 ? Number(((empTotalTax / empGrossCash) * 100).toFixed(2)) : 0,
                marginalTaxRatePercent: Number(((empFedMarg + empProvMarg) * 100).toFixed(1)),
                netCashTakeHomeAnnual: Math.round(empNet),
                netCashTakeHomeMonthly: Math.round(empNet / 12),
                netEffectiveHourlyTakeHome: Number((empNet / billableHoursPerYear).toFixed(2)),
                monetizedBenefitsAndRetirementValueAnnual: Math.round(empMonetizedBenefits + employeeOwnRetirementAnnual),
                trueTotalEconomicPackageAnnual: Math.round(empNet + empMonetizedBenefits + employeeOwnRetirementAnnual),
                qbiOrSpecialDeductionSavedAnnual: 0,
                lineItemNotes: [`Employee CPP + CPP2 ($81,200 ceiling): CA$${Math.round(empCpp).toLocaleString()} + EI: CA$${Math.round(empEi).toLocaleString()}`],
            },
            standardContractorRegime: {
                regimeId: 'STANDARD_CONTRACTOR',
                regimeTitle: meta.standardContractorRegimeName,
                regimeSubtitle: 'CRA Form T2125 Sole Proprietor (Pays both Employer & Employee CPP + CPP2)',
                grossTopLineAnnual: Math.round(contractorAnnualGross),
                deductibleExpensesAndFeesAnnual: Math.round(expenses + selfHealth),
                employerSideDeductionsFromAssignmentAnnual: 0,
                taxableIncomeBaseAnnual: Math.round(soleTaxable),
                incomeTaxFederalOrNationalAnnual: Math.round(cFed),
                stateOrProvincialTaxAnnual: Math.round(cProv),
                socialSecurityOrEmployeeNiAnnual: 0,
                selfEmploymentOrDividendTaxAnnual: Math.round(soleCpp),
                corporateOrEntityTaxAnnual: 0,
                totalTaxesAndStatutoryDeductionsAnnual: Math.round(cTotalTax),
                effectiveTaxRatePercent: contractorAnnualGross > 0 ? Number(((cTotalTax / contractorAnnualGross) * 100).toFixed(2)) : 0,
                marginalTaxRatePercent: Number(((cFedMarg + cProvMarg) * 100).toFixed(1)),
                netCashTakeHomeAnnual: Math.round(cNet),
                netCashTakeHomeMonthly: Math.round(cNet / 12),
                netEffectiveHourlyTakeHome: Number((cNet / billableHoursPerYear).toFixed(2)),
                monetizedBenefitsAndRetirementValueAnnual: Math.round(contractorRetire),
                trueTotalEconomicPackageAnnual: Math.round(cNet + contractorRetire),
                qbiOrSpecialDeductionSavedAnnual: 0,
                lineItemNotes: [`Double Self-Employed CPP + CPP2: CA$${Math.round(soleCpp).toLocaleString()}/yr`],
            },
            optimizedEntityRegime: {
                regimeId: 'OPTIMIZED_ENTITY',
                regimeTitle: isPsbTrap ? 'CCPC Reclassified as CRA Personal Services Business (PSB 44.5% Penalty!)' : meta.optimizedEntityRegimeName,
                regimeSubtitle: isPsbTrap
                    ? 'WARNING: Audit Score < 55 triggers CRA PSB penalty (44.5% Corp Tax — Small Business Deduction denied!)'
                    : '12.2% CCPC Small Business Deduction (up to $500k) + Non-Eligible Dividend Credit',
                grossTopLineAnnual: Math.round(contractorAnnualGross),
                deductibleExpensesAndFeesAnnual: Math.round(expenses + entityFees + selfHealth),
                employerSideDeductionsFromAssignmentAnnual: 0,
                taxableIncomeBaseAnnual: Math.round(ccpcProfit),
                incomeTaxFederalOrNationalAnnual: 0,
                stateOrProvincialTaxAnnual: 0,
                socialSecurityOrEmployeeNiAnnual: 0,
                selfEmploymentOrDividendTaxAnnual: Math.round(divTax),
                corporateOrEntityTaxAnnual: Math.round(ccpcCorpTax),
                totalTaxesAndStatutoryDeductionsAnnual: Math.round(optTotalTax),
                effectiveTaxRatePercent: contractorAnnualGross > 0 ? Number(((optTotalTax / contractorAnnualGross) * 100).toFixed(2)) : 0,
                marginalTaxRatePercent: isPsbTrap ? 58.0 : 27.7,
                netCashTakeHomeAnnual: Math.round(optNet),
                netCashTakeHomeMonthly: Math.round(optNet / 12),
                netEffectiveHourlyTakeHome: Number((optNet / billableHoursPerYear).toFixed(2)),
                monetizedBenefitsAndRetirementValueAnnual: Math.round(contractorRetire),
                trueTotalEconomicPackageAnnual: Math.round(optNet + contractorRetire),
                qbiOrSpecialDeductionSavedAnnual: Math.round(Math.max(0, cTotalTax - optTotalTax)),
                lineItemNotes: [
                    isPsbTrap
                        ? 'CRA PSB Warning: Improve Classification Score >= 55 in Tab 3 to restore the 12.2% Small Business Deduction!'
                        : `CCPC Corporate Tax (12.2%): CA$${Math.round(ccpcCorpTax).toLocaleString()} + Dividend Tax: CA$${Math.round(divTax).toLocaleString()}`,
                ],
            },
            ukIr35KidWaterfall,
            usScheduleSeAndScorp,
        };
    }

    // ==========================================================================
    // DEDICATED MODULE 4: AUSTRALIA (ATO Stage 3 PAYG + 12% Super vs. ABN vs. Pty Ltd)
    // ==========================================================================
    if (inputs.jurisdiction === 'AU') {
        const auBrackets = [
            { upTo: 18200, rate: 0 },
            { upTo: 45000, rate: 0.16 },
            { upTo: 135000, rate: 0.3 },
            { upTo: 190000, rate: 0.37 },
            { upTo: Infinity, rate: 0.45 },
        ];
        // PAYG Permanent Employee: Employer pays 12% Superannuation Guarantee on top (or user match %)
        const superRate = Math.max(0.12, inputs.employerRetirementMatchPercent / 100);
        const employerSuperAnnual = inputs.employeeBaseSalaryAnnual * superRate;
        const auEmpBenefits = Math.max(0, inputs.employerHealthInsuranceAnnual) + employerSuperAnnual + Math.max(0, inputs.employerOtherPerksAnnual);
        const empTaxable = Math.max(0, empGrossCash - employeeOwnRetirementAnnual);
        const { totalTax: empIncTax, marginalRate: empMarg } = computeProgressiveTax(empTaxable, auBrackets);
        const empMedicareLevy = empTaxable > 26000 ? empTaxable * 0.02 : 0;
        const empMls = inputs.employerHealthInsuranceAnnual > 0 || empTaxable <= 97000 ? 0 : empTaxable * 0.01; // Medicare Levy Surcharge if no private hospital cover > $97k
        const empTotalTax = empIncTax + empMedicareLevy + empMls;
        const empNet = Math.max(0, empGrossCash - employeeOwnRetirementAnnual - empTotalTax);

        // ABN Sole Trader (Concessional Super Contribution up to $30,000 cap is taxed at 15% inside super fund instead of marginal rate)
        const concessionalSuper = Math.min(30000, contractorRetire);
        const superFund15PctTax = concessionalSuper * 0.15;
        const abnTaxable = Math.max(0, contractorAnnualGross - expenses - selfHealth - concessionalSuper);
        const { totalTax: abnIncTax, marginalRate: abnMarg } = computeProgressiveTax(abnTaxable, auBrackets);
        const abnMedicare = abnTaxable > 26000 ? abnTaxable * 0.02 : 0;
        const abnTotalTax = abnIncTax + abnMedicare + superFund15PctTax;
        const abnNetCash = Math.max(
            0,
            contractorAnnualGross - expenses - selfHealth - contractorRetire - (abnIncTax + abnMedicare)
        );

        // Pty Ltd Company (Requires passing ATO 80/20 PSI Results Test — if Classification Score < 65, PSI rules attribute all profit to individual!)
        const auditPreview = evaluateClassificationAudit(inputs);
        const passesPsiResultsTest = auditPreview.complianceScore >= 65;
        const ptyProfit = Math.max(0, contractorAnnualGross - expenses - entityFees - selfHealth - concessionalSuper);
        const ptyCorpTax = passesPsiResultsTest ? ptyProfit * 0.25 : 0;
        const frankedDivTax = passesPsiResultsTest ? Math.max(0, (ptyProfit - ptyCorpTax) * 0.08) : abnIncTax + abnMedicare;
        const ptyTotalTax = ptyCorpTax + frankedDivTax + superFund15PctTax;
        const ptyNetCash = Math.max(
            0,
            contractorAnnualGross - expenses - entityFees - selfHealth - contractorRetire - (ptyCorpTax + frankedDivTax)
        );

        return {
            employeeRegime: {
                regimeId: 'FULL_TIME_EMPLOYEE',
                regimeTitle: meta.employeeRegimeName,
                regimeSubtitle: 'ATO Stage 3 Resident Brackets + 2% Medicare Levy + 12% Employer Super Guarantee',
                grossTopLineAnnual: Math.round(empGrossCash),
                deductibleExpensesAndFeesAnnual: 0,
                employerSideDeductionsFromAssignmentAnnual: 0,
                taxableIncomeBaseAnnual: Math.round(empTaxable),
                incomeTaxFederalOrNationalAnnual: Math.round(empIncTax),
                stateOrProvincialTaxAnnual: 0,
                socialSecurityOrEmployeeNiAnnual: Math.round(empMedicareLevy + empMls),
                selfEmploymentOrDividendTaxAnnual: 0,
                corporateOrEntityTaxAnnual: 0,
                totalTaxesAndStatutoryDeductionsAnnual: Math.round(empTotalTax),
                effectiveTaxRatePercent: empGrossCash > 0 ? Number(((empTotalTax / empGrossCash) * 100).toFixed(2)) : 0,
                marginalTaxRatePercent: Number(((empMarg + 0.02) * 100).toFixed(1)),
                netCashTakeHomeAnnual: Math.round(empNet),
                netCashTakeHomeMonthly: Math.round(empNet / 12),
                netEffectiveHourlyTakeHome: Number((empNet / billableHoursPerYear).toFixed(2)),
                monetizedBenefitsAndRetirementValueAnnual: Math.round(auEmpBenefits + employeeOwnRetirementAnnual),
                trueTotalEconomicPackageAnnual: Math.round(empNet + auEmpBenefits + employeeOwnRetirementAnnual),
                qbiOrSpecialDeductionSavedAnnual: 0,
                lineItemNotes: [`Employer 12% Superannuation Guarantee: A$${Math.round(employerSuperAnnual).toLocaleString()}/yr`],
            },
            standardContractorRegime: {
                regimeId: 'STANDARD_CONTRACTOR',
                regimeTitle: meta.standardContractorRegimeName,
                regimeSubtitle: 'ABN Sole Trader + 15% Concessional Super Tax Shield (up to $30k cap)',
                grossTopLineAnnual: Math.round(contractorAnnualGross),
                deductibleExpensesAndFeesAnnual: Math.round(expenses + selfHealth),
                employerSideDeductionsFromAssignmentAnnual: 0,
                taxableIncomeBaseAnnual: Math.round(abnTaxable),
                incomeTaxFederalOrNationalAnnual: Math.round(abnIncTax),
                stateOrProvincialTaxAnnual: 0,
                socialSecurityOrEmployeeNiAnnual: Math.round(abnMedicare),
                selfEmploymentOrDividendTaxAnnual: Math.round(superFund15PctTax),
                corporateOrEntityTaxAnnual: 0,
                totalTaxesAndStatutoryDeductionsAnnual: Math.round(abnTotalTax),
                effectiveTaxRatePercent: contractorAnnualGross > 0 ? Number(((abnTotalTax / contractorAnnualGross) * 100).toFixed(2)) : 0,
                marginalTaxRatePercent: Number(((abnMarg + 0.02) * 100).toFixed(1)),
                netCashTakeHomeAnnual: Math.round(abnNetCash),
                netCashTakeHomeMonthly: Math.round(abnNetCash / 12),
                netEffectiveHourlyTakeHome: Number((abnNetCash / billableHoursPerYear).toFixed(2)),
                monetizedBenefitsAndRetirementValueAnnual: Math.round(contractorRetire - superFund15PctTax),
                trueTotalEconomicPackageAnnual: Math.round(abnNetCash + Math.max(0, contractorRetire - superFund15PctTax)),
                qbiOrSpecialDeductionSavedAnnual: 0,
                lineItemNotes: [`Concessional Super Deduction: A$${Math.round(concessionalSuper).toLocaleString()} taxed at 15% inside fund`],
            },
            optimizedEntityRegime: {
                regimeId: 'OPTIMIZED_ENTITY',
                regimeTitle: passesPsiResultsTest ? meta.optimizedEntityRegimeName : 'Pty Ltd Blocked by ATO PSI Rules (Look-Through to Individual Rates)',
                regimeSubtitle: passesPsiResultsTest
                    ? 'Passes ATO 80/20 PSI Results Test → 25% Base Rate Entity + Franking Credits'
                    : 'ATO PSI Look-Through Applied: Score < 65 means income is taxed at individual marginal rates',
                grossTopLineAnnual: Math.round(contractorAnnualGross),
                deductibleExpensesAndFeesAnnual: Math.round(expenses + entityFees + selfHealth),
                employerSideDeductionsFromAssignmentAnnual: 0,
                taxableIncomeBaseAnnual: Math.round(ptyProfit),
                incomeTaxFederalOrNationalAnnual: 0,
                stateOrProvincialTaxAnnual: 0,
                socialSecurityOrEmployeeNiAnnual: 0,
                selfEmploymentOrDividendTaxAnnual: Math.round(frankedDivTax + superFund15PctTax),
                corporateOrEntityTaxAnnual: Math.round(ptyCorpTax),
                totalTaxesAndStatutoryDeductionsAnnual: Math.round(ptyTotalTax),
                effectiveTaxRatePercent: contractorAnnualGross > 0 ? Number(((ptyTotalTax / contractorAnnualGross) * 100).toFixed(2)) : 0,
                marginalTaxRatePercent: passesPsiResultsTest ? 33.0 : Number(((abnMarg + 0.02) * 100).toFixed(1)),
                netCashTakeHomeAnnual: Math.round(ptyNetCash),
                netCashTakeHomeMonthly: Math.round(ptyNetCash / 12),
                netEffectiveHourlyTakeHome: Number((ptyNetCash / billableHoursPerYear).toFixed(2)),
                monetizedBenefitsAndRetirementValueAnnual: Math.round(Math.max(0, contractorRetire - superFund15PctTax)),
                trueTotalEconomicPackageAnnual: Math.round(ptyNetCash + Math.max(0, contractorRetire - superFund15PctTax)),
                qbiOrSpecialDeductionSavedAnnual: Math.round(Math.max(0, abnTotalTax - ptyTotalTax)),
                lineItemNotes: [
                    passesPsiResultsTest
                        ? `ATO PSI Results Test Passed: 25% Base Rate Entity Tax (A$${Math.round(ptyCorpTax).toLocaleString()})`
                        : 'ATO PSI Warning: Satisfy Results/Substitution/Equipment tests in Tab 3 to unlock Pty Ltd retention!',
                ],
            },
            ukIr35KidWaterfall,
            usScheduleSeAndScorp,
        };
    }

    // ==========================================================================
    // DEDICATED MODULE 5: GERMANY (§ 32a EStG + 4-Pillar Sozialversicherung vs. Freiberufler)
    // ==========================================================================
    if (inputs.jurisdiction === 'DE') {
        const deBrackets = [
            { upTo: 12096, rate: 0 }, // Grundfreibetrag
            { upTo: 17443, rate: 0.19 },
            { upTo: 68480, rate: 0.31 },
            { upTo: 277825, rate: 0.42 },
            { upTo: Infinity, rate: 0.45 }, // Reichensteuer
        ];
        // 4-Pillar Statutory Social Insurance (Employee Half) with Beitragsbemessungsgrenzen (BBG):
        // KV (Health 8.15%) + PV (Care 1.7%) capped at €66,150; RV (Pension 9.3%) + AV (Unemp 1.3%) capped at €96,600
        const bbgHealth = Math.min(empGrossCash, 66150);
        const bbgPension = Math.min(empGrossCash, 96600);
        const empSocial = bbgHealth * (0.0815 + 0.017) + bbgPension * (0.093 + 0.013);
        const empTaxable = Math.max(0, empGrossCash - empSocial * 0.88 - employeeOwnRetirementAnnual - 1230); // includes €1,230 Werbungskostenpauschale
        const { totalTax: empEst, marginalRate: empMarg } = computeProgressiveTax(empTaxable, deBrackets);
        const empSoli = empEst > 18130 ? empEst * 0.055 : 0;
        const empChurch = inputs.regionCode === 'DE_CHURCH' ? empEst * 0.085 : 0;
        const empTotalTax = empEst + empSoli + empChurch + empSocial;
        const empNet = Math.max(0, empGrossCash - employeeOwnRetirementAnnual - empTotalTax);

        // Freiberufler (§ 18 EStG — Exempt from Gewerbesteuer; self-funds PKV health & Basisrente)
        const freiberuflerTaxable = Math.max(
            0,
            contractorAnnualGross - expenses - selfHealth - contractorRetire
        );
        const { totalTax: fEst, marginalRate: fMarg } = computeProgressiveTax(freiberuflerTaxable, deBrackets);
        const fSoli = fEst > 18130 ? fEst * 0.055 : 0;
        const fChurch = inputs.regionCode === 'DE_CHURCH' ? fEst * 0.085 : 0;
        const fTotalTax = fEst + fSoli + fChurch;
        const fNetCash = Math.max(
            0,
            contractorAnnualGross - expenses - selfHealth - contractorRetire - fTotalTax
        );

        // Optimized GmbH / Freiberufler + Rürup-Rente & Investitionsabzugsbetrag (§ 7g EStG)
        const ruerupExtraShield = Math.min(27566, Math.max(contractorRetire, contractorAnnualGross * 0.08));
        const optTaxable = Math.max(
            0,
            contractorAnnualGross - expenses - entityFees - selfHealth - ruerupExtraShield
        );
        const { totalTax: oEst, marginalRate: oMarg } = computeProgressiveTax(optTaxable, deBrackets);
        const oSoli = oEst > 18130 ? oEst * 0.055 : 0;
        const oChurch = inputs.regionCode === 'DE_CHURCH' ? oEst * 0.085 : 0;
        const oTotalTax = oEst + oSoli + oChurch;
        const oNetCash = Math.max(
            0,
            contractorAnnualGross - expenses - entityFees - selfHealth - contractorRetire - oTotalTax
        );

        return {
            employeeRegime: {
                regimeId: 'FULL_TIME_EMPLOYEE',
                regimeTitle: meta.employeeRegimeName,
                regimeSubtitle: '§ 32a EStG + 4-Pillar Sozialversicherung (KV/PV BBG €66,150 • RV/AV BBG €96,600)',
                grossTopLineAnnual: Math.round(empGrossCash),
                deductibleExpensesAndFeesAnnual: 1230,
                employerSideDeductionsFromAssignmentAnnual: 0,
                taxableIncomeBaseAnnual: Math.round(empTaxable),
                incomeTaxFederalOrNationalAnnual: Math.round(empEst + empSoli),
                stateOrProvincialTaxAnnual: Math.round(empChurch),
                socialSecurityOrEmployeeNiAnnual: Math.round(empSocial),
                selfEmploymentOrDividendTaxAnnual: 0,
                corporateOrEntityTaxAnnual: 0,
                totalTaxesAndStatutoryDeductionsAnnual: Math.round(empTotalTax),
                effectiveTaxRatePercent: empGrossCash > 0 ? Number(((empTotalTax / empGrossCash) * 100).toFixed(2)) : 0,
                marginalTaxRatePercent: Number((empMarg * 100).toFixed(1)),
                netCashTakeHomeAnnual: Math.round(empNet),
                netCashTakeHomeMonthly: Math.round(empNet / 12),
                netEffectiveHourlyTakeHome: Number((empNet / billableHoursPerYear).toFixed(2)),
                monetizedBenefitsAndRetirementValueAnnual: Math.round(empMonetizedBenefits + employeeOwnRetirementAnnual),
                trueTotalEconomicPackageAnnual: Math.round(empNet + empMonetizedBenefits + employeeOwnRetirementAnnual),
                qbiOrSpecialDeductionSavedAnnual: 0,
                lineItemNotes: [`Employee KV/PV + RV/AV Social Contributions: €${Math.round(empSocial).toLocaleString()}/yr`],
            },
            standardContractorRegime: {
                regimeId: 'STANDARD_CONTRACTOR',
                regimeTitle: meta.standardContractorRegimeName,
                regimeSubtitle: '§ 18 EStG Freiberufler (Exempt from Gewerbesteuer + Deductible PKV Health)',
                grossTopLineAnnual: Math.round(contractorAnnualGross),
                deductibleExpensesAndFeesAnnual: Math.round(expenses + selfHealth),
                employerSideDeductionsFromAssignmentAnnual: 0,
                taxableIncomeBaseAnnual: Math.round(freiberuflerTaxable),
                incomeTaxFederalOrNationalAnnual: Math.round(fEst + fSoli),
                stateOrProvincialTaxAnnual: Math.round(fChurch),
                socialSecurityOrEmployeeNiAnnual: 0,
                selfEmploymentOrDividendTaxAnnual: 0,
                corporateOrEntityTaxAnnual: 0,
                totalTaxesAndStatutoryDeductionsAnnual: Math.round(fTotalTax),
                effectiveTaxRatePercent: contractorAnnualGross > 0 ? Number(((fTotalTax / contractorAnnualGross) * 100).toFixed(2)) : 0,
                marginalTaxRatePercent: Number((fMarg * 100).toFixed(1)),
                netCashTakeHomeAnnual: Math.round(fNetCash),
                netCashTakeHomeMonthly: Math.round(fNetCash / 12),
                netEffectiveHourlyTakeHome: Number((fNetCash / billableHoursPerYear).toFixed(2)),
                monetizedBenefitsAndRetirementValueAnnual: Math.round(contractorRetire),
                trueTotalEconomicPackageAnnual: Math.round(fNetCash + contractorRetire),
                qbiOrSpecialDeductionSavedAnnual: 0,
                lineItemNotes: [`Taxable § 18 EStG Profit: €${Math.round(freiberuflerTaxable).toLocaleString()}`],
            },
            optimizedEntityRegime: {
                regimeId: 'OPTIMIZED_ENTITY',
                regimeTitle: meta.optimizedEntityRegimeName,
                regimeSubtitle: '§ 18 EStG + Basisrente (Rürup up to €27,566) & § 7g EStG Tax Shield',
                grossTopLineAnnual: Math.round(contractorAnnualGross),
                deductibleExpensesAndFeesAnnual: Math.round(expenses + entityFees + selfHealth),
                employerSideDeductionsFromAssignmentAnnual: 0,
                taxableIncomeBaseAnnual: Math.round(optTaxable),
                incomeTaxFederalOrNationalAnnual: Math.round(oEst + oSoli),
                stateOrProvincialTaxAnnual: Math.round(oChurch),
                socialSecurityOrEmployeeNiAnnual: 0,
                selfEmploymentOrDividendTaxAnnual: 0,
                corporateOrEntityTaxAnnual: 0,
                totalTaxesAndStatutoryDeductionsAnnual: Math.round(oTotalTax),
                effectiveTaxRatePercent: contractorAnnualGross > 0 ? Number(((oTotalTax / contractorAnnualGross) * 100).toFixed(2)) : 0,
                marginalTaxRatePercent: Number((oMarg * 100).toFixed(1)),
                netCashTakeHomeAnnual: Math.round(oNetCash),
                netCashTakeHomeMonthly: Math.round(oNetCash / 12),
                netEffectiveHourlyTakeHome: Number((oNetCash / billableHoursPerYear).toFixed(2)),
                monetizedBenefitsAndRetirementValueAnnual: Math.round(contractorRetire),
                trueTotalEconomicPackageAnnual: Math.round(oNetCash + contractorRetire),
                qbiOrSpecialDeductionSavedAnnual: Math.round(Math.max(0, fTotalTax - oTotalTax)),
                lineItemNotes: [`Rürup / § 7g Tax Shield Saved: €${Math.round(Math.max(0, fTotalTax - oTotalTax)).toLocaleString()}/yr`],
            },
            ukIr35KidWaterfall,
            usScheduleSeAndScorp,
        };
    }

    // ==========================================================================
    // DEDICATED MODULE 6: INDIA (Sec 115BAC + Sec 87A Marginal Relief vs. Sec 44ADA Eligibility Enforcement)
    // ==========================================================================
    if (inputs.jurisdiction === 'IN') {
        const inBrackets = [
            { upTo: 400000, rate: 0 },
            { upTo: 800000, rate: 0.05 },
            { upTo: 1200000, rate: 0.1 },
            { upTo: 1600000, rate: 0.15 },
            { upTo: 2000000, rate: 0.2 },
            { upTo: 2400000, rate: 0.25 },
            { upTo: Infinity, rate: 0.3 },
        ];
        // Exact Section 87A Rebate (0 tax up to ₹12,00,000 taxable income) + Marginal Relief just above ₹12,00,000
        const computeIndiaTaxWith87AMarginalRelief = (taxableIncome: number) => {
            if (taxableIncome <= 1200000) return { totalTaxWithCess: 0, marginalRate: 0 };
            const { totalTax: rawSlabTax, marginalRate } = computeProgressiveTax(taxableIncome, inBrackets);
            const excessOver12L = taxableIncome - 1200000;
            const taxAfterMarginalRelief = Math.min(rawSlabTax, excessOver12L);
            return { totalTaxWithCess: taxAfterMarginalRelief * 1.04, marginalRate: marginalRate * 1.04 };
        };

        const empTaxable = Math.max(0, empGrossCash - 75000 - employeeOwnRetirementAnnual);
        const { totalTaxWithCess: empTotalTax, marginalRate: empMarg } = computeIndiaTaxWith87AMarginalRelief(empTaxable);
        const empNet = Math.max(0, empGrossCash - employeeOwnRetirementAnnual - empTotalTax);

        // Col B: Regular Professional Consultant (Actual Books under Sec 44AA / 44AB)
        const regProfit = Math.max(0, contractorAnnualGross - expenses - selfHealth - contractorRetire);
        const { totalTaxWithCess: regTotalTax, marginalRate: regMarg } = computeIndiaTaxWith87AMarginalRelief(regProfit);
        const regNet = Math.max(
            0,
            contractorAnnualGross - expenses - selfHealth - contractorRetire - regTotalTax
        );

        // Col C: Section 44ADA Presumptive Taxation — Enforce Statutory Eligibility!
        // Must be notified profession u/s 44AA(1) AND Gross Receipts <= ₹75,00,000 (if >=95% digital) or <= ₹50,00,000 (cash >5%)
        const isEligibleProf = inputs.indiaIsEligibleProfession44ADA !== false;
        const has95Digital = inputs.indiaHas95PercentDigitalReceipts !== false;
        const sec44AdaGrossLimit = has95Digital ? 7500000 : 5000000;
        const qualifiesFor44ADA = isEligibleProf && contractorAnnualGross <= sec44AdaGrossLimit;

        const sec44AdaTaxable = qualifiesFor44ADA
            ? Math.max(0, contractorAnnualGross * 0.5 - contractorRetire)
            : Math.max(0, contractorAnnualGross - expenses - entityFees - selfHealth - contractorRetire);
        const { totalTaxWithCess: adaTotalTax, marginalRate: adaMarg } = computeIndiaTaxWith87AMarginalRelief(sec44AdaTaxable);
        const adaNet = Math.max(
            0,
            contractorAnnualGross - expenses - entityFees - selfHealth - contractorRetire - adaTotalTax
        );

        return {
            employeeRegime: {
                regimeId: 'FULL_TIME_EMPLOYEE',
                regimeTitle: meta.employeeRegimeName,
                regimeSubtitle: 'Sec 115BAC New Regime + ₹75,000 Std Deduction + Sec 87A Rebate & 4% Cess',
                grossTopLineAnnual: Math.round(empGrossCash),
                deductibleExpensesAndFeesAnnual: 75000,
                employerSideDeductionsFromAssignmentAnnual: 0,
                taxableIncomeBaseAnnual: Math.round(empTaxable),
                incomeTaxFederalOrNationalAnnual: Math.round(empTotalTax),
                stateOrProvincialTaxAnnual: 0,
                socialSecurityOrEmployeeNiAnnual: 0,
                selfEmploymentOrDividendTaxAnnual: 0,
                corporateOrEntityTaxAnnual: 0,
                totalTaxesAndStatutoryDeductionsAnnual: Math.round(empTotalTax),
                effectiveTaxRatePercent: empGrossCash > 0 ? Number(((empTotalTax / empGrossCash) * 100).toFixed(2)) : 0,
                marginalTaxRatePercent: Number((empMarg * 100).toFixed(1)),
                netCashTakeHomeAnnual: Math.round(empNet),
                netCashTakeHomeMonthly: Math.round(empNet / 12),
                netEffectiveHourlyTakeHome: Number((empNet / billableHoursPerYear).toFixed(2)),
                monetizedBenefitsAndRetirementValueAnnual: Math.round(empMonetizedBenefits + employeeOwnRetirementAnnual),
                trueTotalEconomicPackageAnnual: Math.round(empNet + empMonetizedBenefits + employeeOwnRetirementAnnual),
                qbiOrSpecialDeductionSavedAnnual: 0,
                lineItemNotes: [`Taxable Salary after ₹75,000 Std Deduction: ₹${Math.round(empTaxable).toLocaleString()}`],
            },
            standardContractorRegime: {
                regimeId: 'STANDARD_CONTRACTOR',
                regimeTitle: meta.standardContractorRegimeName,
                regimeSubtitle: 'Regular Books of Account (Gross Receipts minus Documented Expenses)',
                grossTopLineAnnual: Math.round(contractorAnnualGross),
                deductibleExpensesAndFeesAnnual: Math.round(expenses + selfHealth),
                employerSideDeductionsFromAssignmentAnnual: 0,
                taxableIncomeBaseAnnual: Math.round(regProfit),
                incomeTaxFederalOrNationalAnnual: Math.round(regTotalTax),
                stateOrProvincialTaxAnnual: 0,
                socialSecurityOrEmployeeNiAnnual: 0,
                selfEmploymentOrDividendTaxAnnual: 0,
                corporateOrEntityTaxAnnual: 0,
                totalTaxesAndStatutoryDeductionsAnnual: Math.round(regTotalTax),
                effectiveTaxRatePercent: contractorAnnualGross > 0 ? Number(((regTotalTax / contractorAnnualGross) * 100).toFixed(2)) : 0,
                marginalTaxRatePercent: Number((regMarg * 100).toFixed(1)),
                netCashTakeHomeAnnual: Math.round(regNet),
                netCashTakeHomeMonthly: Math.round(regNet / 12),
                netEffectiveHourlyTakeHome: Number((regNet / billableHoursPerYear).toFixed(2)),
                monetizedBenefitsAndRetirementValueAnnual: Math.round(contractorRetire),
                trueTotalEconomicPackageAnnual: Math.round(regNet + contractorRetire),
                qbiOrSpecialDeductionSavedAnnual: 0,
                lineItemNotes: [`Actual Net Professional Profit: ₹${Math.round(regProfit).toLocaleString()}`],
            },
            optimizedEntityRegime: {
                regimeId: 'OPTIMIZED_ENTITY',
                regimeTitle: qualifiesFor44ADA
                    ? meta.optimizedEntityRegimeName
                    : `Section 44ADA Ineligible (Exceeds ₹${(sec44AdaGrossLimit / 100000).toFixed(0)}L Limit or Non-44AA Profession — Taxed on Regular Books)`,
                regimeSubtitle: qualifiesFor44ADA
                    ? `Eligible u/s 44ADA (Receipts <= ₹${(sec44AdaGrossLimit / 100000).toFixed(0)}L): 50% of Gross Receipts Deemed Taxable`
                    : 'Statutory Cap Exceeded: Mandatory Sec 44AB Tax Audit & Regular Expense Accounting Applies',
                grossTopLineAnnual: Math.round(contractorAnnualGross),
                deductibleExpensesAndFeesAnnual: Math.round(expenses + entityFees + selfHealth),
                employerSideDeductionsFromAssignmentAnnual: 0,
                taxableIncomeBaseAnnual: Math.round(sec44AdaTaxable),
                incomeTaxFederalOrNationalAnnual: Math.round(adaTotalTax),
                stateOrProvincialTaxAnnual: 0,
                socialSecurityOrEmployeeNiAnnual: 0,
                selfEmploymentOrDividendTaxAnnual: 0,
                corporateOrEntityTaxAnnual: 0,
                totalTaxesAndStatutoryDeductionsAnnual: Math.round(adaTotalTax),
                effectiveTaxRatePercent: contractorAnnualGross > 0 ? Number(((adaTotalTax / contractorAnnualGross) * 100).toFixed(2)) : 0,
                marginalTaxRatePercent: Number((adaMarg * (qualifiesFor44ADA ? 50 : 100)).toFixed(1)),
                netCashTakeHomeAnnual: Math.round(adaNet),
                netCashTakeHomeMonthly: Math.round(adaNet / 12),
                netEffectiveHourlyTakeHome: Number((adaNet / billableHoursPerYear).toFixed(2)),
                monetizedBenefitsAndRetirementValueAnnual: Math.round(contractorRetire),
                trueTotalEconomicPackageAnnual: Math.round(adaNet + contractorRetire),
                qbiOrSpecialDeductionSavedAnnual: Math.round(Math.max(0, regTotalTax - adaTotalTax)),
                lineItemNotes: [
                    qualifiesFor44ADA
                        ? `Section 44ADA 50% Presumptive Base: ₹${Math.round(sec44AdaTaxable).toLocaleString()} (Tax Saved: ₹${Math.round(Math.max(0, regTotalTax - adaTotalTax)).toLocaleString()})`
                        : `Section 44ADA Disqualified: Gross receipts (₹${Math.round(contractorAnnualGross).toLocaleString()}) exceed ₹${sec44AdaGrossLimit.toLocaleString()} statutory threshold or profession is ineligible.`,
                ],
            },
            ukIr35KidWaterfall,
            usScheduleSeAndScorp,
        };
    }

    // ==========================================================================
    // DEDICATED MODULE 7: PAKISTAN (FBR Sec 149 vs. Sec 154A PSEB & PRC Eligibility Enforcement)
    // ==========================================================================
    if (inputs.jurisdiction === 'PK') {
        const pkSalariedBrackets = [
            { upTo: 600000, rate: 0 },
            { upTo: 1200000, rate: 0.05 },
            { upTo: 2200000, rate: 0.15 },
            { upTo: 3200000, rate: 0.25 },
            { upTo: 4100000, rate: 0.3 },
            { upTo: Infinity, rate: 0.35 },
        ];
        const pkNonSalariedBusinessBrackets = [
            { upTo: 600000, rate: 0 },
            { upTo: 1200000, rate: 0.15 },
            { upTo: 1600000, rate: 0.2 },
            { upTo: 3200000, rate: 0.3 },
            { upTo: 5600000, rate: 0.4 },
            { upTo: Infinity, rate: 0.45 },
        ];
        const empTaxable = Math.max(0, empGrossCash - employeeOwnRetirementAnnual);
        const { totalTax: basePkTax, marginalRate: pkMarginal } = computeProgressiveTax(
            empTaxable,
            pkSalariedBrackets
        );
        const pkSurcharge = empTaxable > 10000000 ? basePkTax * 0.1 : 0;
        const pkEmpTotalTax = basePkTax + pkSurcharge;
        const pkEmpNet = Math.max(0, empGrossCash - employeeOwnRetirementAnnual - pkEmpTotalTax);

        const hasValidPrc = inputs.pakistanHasValidPrcCode9186 !== false;
        const hasValidPseb = inputs.pakistanHasValidPsebCertificate !== false;

        // Col B: Standard Contractor (1.0% Sec 154A if foreign IT export with valid PRC; otherwise Normal Non-Salaried Business Slabs!)
        const nonPsebProfit = Math.max(0, contractorAnnualGross - expenses - selfHealth - contractorRetire);
        const { totalTax: normalSlabTax } = computeProgressiveTax(nonPsebProfit, pkNonSalariedBusinessBrackets);
        const normalSlabWithSurcharge = nonPsebProfit > 10000000 ? normalSlabTax * 1.1 : normalSlabTax;
        const stdContractorTax = hasValidPrc ? contractorAnnualGross * 0.01 : normalSlabWithSurcharge;
        const nonPsebNet = Math.max(
            0,
            contractorAnnualGross - expenses - selfHealth - contractorRetire - stdContractorTax
        );

        // Col C: Optimized PSEB Regime (0.25% ONLY if both hasValidPrc AND hasValidPseb are true!)
        const qualifiesPseb025 = hasValidPrc && hasValidPseb;
        const psebTax = qualifiesPseb025
            ? contractorAnnualGross * 0.0025
            : hasValidPrc
                ? contractorAnnualGross * 0.01
                : normalSlabWithSurcharge;
        const psebNet = Math.max(
            0,
            contractorAnnualGross - expenses - entityFees - selfHealth - contractorRetire - psebTax
        );

        return {
            employeeRegime: {
                regimeId: 'FULL_TIME_EMPLOYEE',
                regimeTitle: meta.employeeRegimeName,
                regimeSubtitle: 'FBR Section 149 Salaried Slabs (0%–35% + 10% Surcharge > Rs. 10M)',
                grossTopLineAnnual: Math.round(empGrossCash),
                deductibleExpensesAndFeesAnnual: 0,
                employerSideDeductionsFromAssignmentAnnual: 0,
                taxableIncomeBaseAnnual: Math.round(empTaxable),
                incomeTaxFederalOrNationalAnnual: Math.round(pkEmpTotalTax),
                stateOrProvincialTaxAnnual: 0,
                socialSecurityOrEmployeeNiAnnual: 0,
                selfEmploymentOrDividendTaxAnnual: 0,
                corporateOrEntityTaxAnnual: 0,
                totalTaxesAndStatutoryDeductionsAnnual: Math.round(pkEmpTotalTax),
                effectiveTaxRatePercent: empGrossCash > 0 ? Number(((pkEmpTotalTax / empGrossCash) * 100).toFixed(2)) : 0,
                marginalTaxRatePercent: Number((pkMarginal * 100).toFixed(1)),
                netCashTakeHomeAnnual: Math.round(pkEmpNet),
                netCashTakeHomeMonthly: Math.round(pkEmpNet / 12),
                netEffectiveHourlyTakeHome: Number((pkEmpNet / billableHoursPerYear).toFixed(2)),
                monetizedBenefitsAndRetirementValueAnnual: Math.round(empMonetizedBenefits + employeeOwnRetirementAnnual),
                trueTotalEconomicPackageAnnual: Math.round(pkEmpNet + empMonetizedBenefits + employeeOwnRetirementAnnual),
                qbiOrSpecialDeductionSavedAnnual: 0,
                lineItemNotes: [`FBR Section 149 Withholding Tax: Rs. ${Math.round(pkEmpTotalTax).toLocaleString()}/yr`],
            },
            standardContractorRegime: {
                regimeId: 'STANDARD_CONTRACTOR',
                regimeTitle: hasValidPrc ? meta.standardContractorRegimeName : 'Non-Compliant / Domestic Freelancer (Normal Business Slabs up to 45%)',
                regimeSubtitle: hasValidPrc
                    ? 'FBR Section 154A 1.0% Final Tax on Foreign IT Export Remittances (Unregistered with PSEB)'
                    : 'Missing Foreign Export PRC Code 9186: Taxed under Normal Non-Salaried Business Slabs',
                grossTopLineAnnual: Math.round(contractorAnnualGross),
                deductibleExpensesAndFeesAnnual: Math.round(expenses + selfHealth),
                employerSideDeductionsFromAssignmentAnnual: 0,
                taxableIncomeBaseAnnual: Math.round(hasValidPrc ? contractorAnnualGross : nonPsebProfit),
                incomeTaxFederalOrNationalAnnual: Math.round(stdContractorTax),
                stateOrProvincialTaxAnnual: 0,
                socialSecurityOrEmployeeNiAnnual: 0,
                selfEmploymentOrDividendTaxAnnual: 0,
                corporateOrEntityTaxAnnual: 0,
                totalTaxesAndStatutoryDeductionsAnnual: Math.round(stdContractorTax),
                effectiveTaxRatePercent: contractorAnnualGross > 0 ? Number(((stdContractorTax / contractorAnnualGross) * 100).toFixed(2)) : 0,
                marginalTaxRatePercent: hasValidPrc ? 1.0 : 45.0,
                netCashTakeHomeAnnual: Math.round(nonPsebNet),
                netCashTakeHomeMonthly: Math.round(nonPsebNet / 12),
                netEffectiveHourlyTakeHome: Number((nonPsebNet / billableHoursPerYear).toFixed(2)),
                monetizedBenefitsAndRetirementValueAnnual: Math.round(contractorRetire),
                trueTotalEconomicPackageAnnual: Math.round(nonPsebNet + contractorRetire),
                qbiOrSpecialDeductionSavedAnnual: 0,
                lineItemNotes: [`Applied Tax: Rs. ${Math.round(stdContractorTax).toLocaleString()}/yr`],
            },
            optimizedEntityRegime: {
                regimeId: 'OPTIMIZED_ENTITY',
                regimeTitle: qualifiesPseb025
                    ? meta.optimizedEntityRegimeName
                    : 'PSEB 0.25% Disqualified (Requires Active PSEB Certificate + Bank PRC Code 9186)',
                regimeSubtitle: qualifiesPseb025
                    ? '0.25% Final Tax u/s 154A (Verified PSEB Certificate + Foreign IT Remittance PRC)'
                    : 'Fallback Rate Applied because PSEB Certificate or Export PRC Condition is unchecked',
                grossTopLineAnnual: Math.round(contractorAnnualGross),
                deductibleExpensesAndFeesAnnual: Math.round(expenses + entityFees + selfHealth),
                employerSideDeductionsFromAssignmentAnnual: 0,
                taxableIncomeBaseAnnual: Math.round(contractorAnnualGross),
                incomeTaxFederalOrNationalAnnual: Math.round(psebTax),
                stateOrProvincialTaxAnnual: 0,
                socialSecurityOrEmployeeNiAnnual: 0,
                selfEmploymentOrDividendTaxAnnual: 0,
                corporateOrEntityTaxAnnual: 0,
                totalTaxesAndStatutoryDeductionsAnnual: Math.round(psebTax),
                effectiveTaxRatePercent: contractorAnnualGross > 0 ? Number(((psebTax / contractorAnnualGross) * 100).toFixed(2)) : 0,
                marginalTaxRatePercent: qualifiesPseb025 ? 0.25 : hasValidPrc ? 1.0 : 45.0,
                netCashTakeHomeAnnual: Math.round(psebNet),
                netCashTakeHomeMonthly: Math.round(psebNet / 12),
                netEffectiveHourlyTakeHome: Number((psebNet / billableHoursPerYear).toFixed(2)),
                monetizedBenefitsAndRetirementValueAnnual: Math.round(contractorRetire),
                trueTotalEconomicPackageAnnual: Math.round(psebNet + contractorRetire),
                qbiOrSpecialDeductionSavedAnnual: Math.round(Math.max(0, stdContractorTax - psebTax)),
                lineItemNotes: [
                    qualifiesPseb025
                        ? `PSEB 0.25% Final Tax u/s 154A: Rs. ${Math.round(psebTax).toLocaleString()}/yr`
                        : 'Enable PSEB Certificate & PRC 9186 in Advanced Options to qualify for 0.25% u/s 154A.',
                ],
            },
            ukIr35KidWaterfall,
            usScheduleSeAndScorp,
        };
    }

    // ==========================================================================
    // DEDICATED MODULE 8: UAE / DUBAI (MOHRE EOSB Gratuity + Federal Corporate Tax Decree-Law 47)
    // ==========================================================================
    if (inputs.jurisdiction === 'AE') {
        // UAE Employee: 0% Personal Income Tax + End-of-Service Gratuity (21 days basic pay per year = ~5.75% of base salary)
        const eosbGratuityAnnual = (inputs.employeeBaseSalaryAnnual / 365) * 21;
        const uaeEmpBenefits = empMonetizedBenefits + eosbGratuityAnnual + employeeOwnRetirementAnnual;
        const empNet = Math.max(0, empGrossCash - employeeOwnRetirementAnnual);

        // UAE Natural Person Freelancer (Cabinet Decision No. 49 of 2023):
        // 0% if annual gross turnover <= AED 1,000,000; if turnover > AED 1,000,000, 9% Corporate Tax on net profit above AED 375,000
        const freelanceNetProfit = Math.max(0, contractorAnnualGross - expenses - selfHealth - contractorRetire);
        const freelanceCorpTax =
            contractorAnnualGross <= 1000000 ? 0 : Math.max(0, (freelanceNetProfit - 375000) * 0.09);
        const freelanceNetCash = Math.max(
            0,
            contractorAnnualGross - expenses - selfHealth - contractorRetire - freelanceCorpTax
        );

        // UAE Free Zone FZ-LLC (Small Business Relief <= AED 3,000,000 revenue OR Qualifying Free Zone Person 0% / 9% > AED 375k)
        const fzProfit = Math.max(0, contractorAnnualGross - expenses - entityFees - selfHealth - contractorRetire);
        const qualifiesSbrOrQfzp = inputs.uaeQualifiesForFreeZoneOrSbr !== false && contractorAnnualGross <= 3000000;
        const fzCorpTax = qualifiesSbrOrQfzp ? 0 : Math.max(0, (fzProfit - 375000) * 0.09);
        const fzNetCash = Math.max(
            0,
            contractorAnnualGross - expenses - entityFees - selfHealth - contractorRetire - fzCorpTax
        );

        return {
            employeeRegime: {
                regimeId: 'FULL_TIME_EMPLOYEE',
                regimeTitle: meta.employeeRegimeName,
                regimeSubtitle: '0% UAE Personal Tax + Statutory MOHRE End-of-Service Gratuity (21 Days/Yr)',
                grossTopLineAnnual: Math.round(empGrossCash),
                deductibleExpensesAndFeesAnnual: 0,
                employerSideDeductionsFromAssignmentAnnual: 0,
                taxableIncomeBaseAnnual: 0,
                incomeTaxFederalOrNationalAnnual: 0,
                stateOrProvincialTaxAnnual: 0,
                socialSecurityOrEmployeeNiAnnual: 0,
                selfEmploymentOrDividendTaxAnnual: 0,
                corporateOrEntityTaxAnnual: 0,
                totalTaxesAndStatutoryDeductionsAnnual: 0,
                effectiveTaxRatePercent: 0,
                marginalTaxRatePercent: 0,
                netCashTakeHomeAnnual: Math.round(empNet),
                netCashTakeHomeMonthly: Math.round(empNet / 12),
                netEffectiveHourlyTakeHome: Number((empNet / billableHoursPerYear).toFixed(2)),
                monetizedBenefitsAndRetirementValueAnnual: Math.round(uaeEmpBenefits),
                trueTotalEconomicPackageAnnual: Math.round(empNet + uaeEmpBenefits),
                qbiOrSpecialDeductionSavedAnnual: 0,
                lineItemNotes: [`Statutory MOHRE EOSB Gratuity Accrual: AED ${Math.round(eosbGratuityAnnual).toLocaleString()}/yr`],
            },
            standardContractorRegime: {
                regimeId: 'STANDARD_CONTRACTOR',
                regimeTitle: meta.standardContractorRegimeName,
                regimeSubtitle: 'Cabinet Decision No. 49: 0% up to AED 1M Turnover; 9% Corp Tax on Profit > AED 375k',
                grossTopLineAnnual: Math.round(contractorAnnualGross),
                deductibleExpensesAndFeesAnnual: Math.round(expenses + selfHealth),
                employerSideDeductionsFromAssignmentAnnual: 0,
                taxableIncomeBaseAnnual: Math.round(freelanceNetProfit),
                incomeTaxFederalOrNationalAnnual: 0,
                stateOrProvincialTaxAnnual: 0,
                socialSecurityOrEmployeeNiAnnual: 0,
                selfEmploymentOrDividendTaxAnnual: 0,
                corporateOrEntityTaxAnnual: Math.round(freelanceCorpTax),
                totalTaxesAndStatutoryDeductionsAnnual: Math.round(freelanceCorpTax),
                effectiveTaxRatePercent: contractorAnnualGross > 0 ? Number(((freelanceCorpTax / contractorAnnualGross) * 100).toFixed(2)) : 0,
                marginalTaxRatePercent: contractorAnnualGross > 1000000 && freelanceNetProfit > 375000 ? 9.0 : 0,
                netCashTakeHomeAnnual: Math.round(freelanceNetCash),
                netCashTakeHomeMonthly: Math.round(freelanceNetCash / 12),
                netEffectiveHourlyTakeHome: Number((freelanceNetCash / billableHoursPerYear).toFixed(2)),
                monetizedBenefitsAndRetirementValueAnnual: Math.round(contractorRetire),
                trueTotalEconomicPackageAnnual: Math.round(freelanceNetCash + contractorRetire),
                qbiOrSpecialDeductionSavedAnnual: 0,
                lineItemNotes: [`UAE Freelance Corporate Tax: AED ${Math.round(freelanceCorpTax).toLocaleString()}/yr`],
            },
            optimizedEntityRegime: {
                regimeId: 'OPTIMIZED_ENTITY',
                regimeTitle: meta.optimizedEntityRegimeName,
                regimeSubtitle: qualifiesSbrOrQfzp
                    ? 'Small Business Relief (Article 21 <= AED 3M) / Qualifying Free Zone 0% Rate'
                    : '9% UAE Federal Corporate Tax on Taxable Profit Exceeding AED 375,000',
                grossTopLineAnnual: Math.round(contractorAnnualGross),
                deductibleExpensesAndFeesAnnual: Math.round(expenses + entityFees + selfHealth),
                employerSideDeductionsFromAssignmentAnnual: 0,
                taxableIncomeBaseAnnual: Math.round(fzProfit),
                incomeTaxFederalOrNationalAnnual: 0,
                stateOrProvincialTaxAnnual: 0,
                socialSecurityOrEmployeeNiAnnual: 0,
                selfEmploymentOrDividendTaxAnnual: 0,
                corporateOrEntityTaxAnnual: Math.round(fzCorpTax),
                totalTaxesAndStatutoryDeductionsAnnual: Math.round(fzCorpTax),
                effectiveTaxRatePercent: contractorAnnualGross > 0 ? Number(((fzCorpTax / contractorAnnualGross) * 100).toFixed(2)) : 0,
                marginalTaxRatePercent: qualifiesSbrOrQfzp ? 0 : 9.0,
                netCashTakeHomeAnnual: Math.round(fzNetCash),
                netCashTakeHomeMonthly: Math.round(fzNetCash / 12),
                netEffectiveHourlyTakeHome: Number((fzNetCash / billableHoursPerYear).toFixed(2)),
                monetizedBenefitsAndRetirementValueAnnual: Math.round(contractorRetire),
                trueTotalEconomicPackageAnnual: Math.round(fzNetCash + contractorRetire),
                qbiOrSpecialDeductionSavedAnnual: Math.round(Math.max(0, freelanceCorpTax - fzCorpTax)),
                lineItemNotes: [`UAE FZ-LLC Corporate Tax: AED ${Math.round(fzCorpTax).toLocaleString()}/yr`],
            },
            ukIr35KidWaterfall,
            usScheduleSeAndScorp,
        };
    }

    // ==========================================================================
    // DEDICATED MODULE 9: GLOBAL CUSTOM COUNTRY REGIME (USER-DEFINED RATES)
    // ==========================================================================
    const activeCur = getIsoCurrencyByCode(inputs.currencyCode, meta.currencyCode);
    const empIncRate = Math.max(0, inputs.customEmployeeIncomeTaxPercent ?? 20) / 100;
    const empSocRate = Math.max(0, inputs.customEmployeeSocialTaxPercent ?? 7.5) / 100;
    const cIncRate = Math.max(0, inputs.customContractorIncomeTaxPercent ?? 20) / 100;
    const cSocRate = Math.max(0, inputs.customContractorSocialTaxPercent ?? 12) / 100;
    const corpRate = Math.max(0, inputs.customCorporateTaxPercent ?? 15) / 100;
    const divRate = Math.max(0, inputs.customDividendTaxPercent ?? 8) / 100;

    const empTaxable = Math.max(0, empGrossCash - employeeOwnRetirementAnnual);
    const empFed = empTaxable * empIncRate;
    const empState = empTaxable * stateRate;
    const empSoc = empGrossCash * empSocRate;
    const empTotalTax = empFed + empState + empSoc;
    const empNet = Math.max(0, empGrossCash - employeeOwnRetirementAnnual - empTotalTax);

    const cProfit = Math.max(0, contractorAnnualGross - expenses - selfHealth - contractorRetire);
    const cFed = cProfit * cIncRate;
    const cState = cProfit * stateRate;
    const cSoc = cProfit * cSocRate;
    const cTotalTax = cFed + cState + cSoc;
    const cNet = Math.max(0, contractorAnnualGross - expenses - selfHealth - contractorRetire - cTotalTax);

    const entityPool = Math.max(0, contractorAnnualGross - expenses - entityFees - selfHealth - contractorRetire);
    const ownerSal = entityPool * salarySplitRatio;
    const ownerSalTax = ownerSal * (empIncRate * 0.75 + empSocRate * 0.5);
    const remCorpProfit = Math.max(0, entityPool - ownerSal);
    const corpTax = remCorpProfit * corpRate;
    const netDivPool = Math.max(0, remCorpProfit - corpTax);
    const divTax = netDivPool * divRate;
    const optTotalTax = ownerSalTax + corpTax + divTax;
    const optNet = Math.max(
        0,
        contractorAnnualGross - expenses - entityFees - selfHealth - contractorRetire - optTotalTax
    );

    return {
        employeeRegime: {
            regimeId: 'FULL_TIME_EMPLOYEE',
            regimeTitle: meta.employeeRegimeName,
            regimeSubtitle: `Custom Income Tax (${(empIncRate * 100).toFixed(1)}%) + Employee Social (${(empSocRate * 100).toFixed(1)}%)`,
            grossTopLineAnnual: Math.round(empGrossCash),
            deductibleExpensesAndFeesAnnual: 0,
            employerSideDeductionsFromAssignmentAnnual: 0,
            taxableIncomeBaseAnnual: Math.round(empTaxable),
            incomeTaxFederalOrNationalAnnual: Math.round(empFed),
            stateOrProvincialTaxAnnual: Math.round(empState),
            socialSecurityOrEmployeeNiAnnual: Math.round(empSoc),
            selfEmploymentOrDividendTaxAnnual: 0,
            corporateOrEntityTaxAnnual: 0,
            totalTaxesAndStatutoryDeductionsAnnual: Math.round(empTotalTax),
            effectiveTaxRatePercent: empGrossCash > 0 ? Number(((empTotalTax / empGrossCash) * 100).toFixed(2)) : 0,
            marginalTaxRatePercent: Number(((empIncRate + empSocRate + stateRate) * 100).toFixed(1)),
            netCashTakeHomeAnnual: Math.round(empNet),
            netCashTakeHomeMonthly: Math.round(empNet / 12),
            netEffectiveHourlyTakeHome: Number((empNet / billableHoursPerYear).toFixed(2)),
            monetizedBenefitsAndRetirementValueAnnual: Math.round(empMonetizedBenefits + employeeOwnRetirementAnnual),
            trueTotalEconomicPackageAnnual: Math.round(empNet + empMonetizedBenefits + employeeOwnRetirementAnnual),
            qbiOrSpecialDeductionSavedAnnual: 0,
            lineItemNotes: [`Statutory Tax & Social Levy: ${activeCur.symbol}${Math.round(empTotalTax).toLocaleString()}`],
        },
        standardContractorRegime: {
            regimeId: 'STANDARD_CONTRACTOR',
            regimeTitle: meta.standardContractorRegimeName,
            regimeSubtitle: `Custom Contractor Tax (${(cIncRate * 100).toFixed(1)}%) + Self-Employed Social (${(cSocRate * 100).toFixed(1)}%)`,
            grossTopLineAnnual: Math.round(contractorAnnualGross),
            deductibleExpensesAndFeesAnnual: Math.round(expenses + selfHealth),
            employerSideDeductionsFromAssignmentAnnual: 0,
            taxableIncomeBaseAnnual: Math.round(cProfit),
            incomeTaxFederalOrNationalAnnual: Math.round(cFed),
            stateOrProvincialTaxAnnual: Math.round(cState),
            socialSecurityOrEmployeeNiAnnual: 0,
            selfEmploymentOrDividendTaxAnnual: Math.round(cSoc),
            corporateOrEntityTaxAnnual: 0,
            totalTaxesAndStatutoryDeductionsAnnual: Math.round(cTotalTax),
            effectiveTaxRatePercent: contractorAnnualGross > 0 ? Number(((cTotalTax / contractorAnnualGross) * 100).toFixed(2)) : 0,
            marginalTaxRatePercent: Number(((cIncRate + cSocRate + stateRate) * 100).toFixed(1)),
            netCashTakeHomeAnnual: Math.round(cNet),
            netCashTakeHomeMonthly: Math.round(cNet / 12),
            netEffectiveHourlyTakeHome: Number((cNet / billableHoursPerYear).toFixed(2)),
            monetizedBenefitsAndRetirementValueAnnual: Math.round(contractorRetire),
            trueTotalEconomicPackageAnnual: Math.round(cNet + contractorRetire),
            qbiOrSpecialDeductionSavedAnnual: 0,
            lineItemNotes: [`Taxable Profit: ${activeCur.symbol}${Math.round(cProfit).toLocaleString()}`],
        },
        optimizedEntityRegime: {
            regimeId: 'OPTIMIZED_ENTITY',
            regimeTitle: meta.optimizedEntityRegimeName,
            regimeSubtitle: `Corporate Tax (${(corpRate * 100).toFixed(1)}%) + Dividend Tax (${(divRate * 100).toFixed(1)}%)`,
            grossTopLineAnnual: Math.round(contractorAnnualGross),
            deductibleExpensesAndFeesAnnual: Math.round(expenses + entityFees + selfHealth),
            employerSideDeductionsFromAssignmentAnnual: 0,
            taxableIncomeBaseAnnual: Math.round(entityPool),
            incomeTaxFederalOrNationalAnnual: Math.round(ownerSalTax),
            stateOrProvincialTaxAnnual: 0,
            socialSecurityOrEmployeeNiAnnual: 0,
            selfEmploymentOrDividendTaxAnnual: Math.round(divTax),
            corporateOrEntityTaxAnnual: Math.round(corpTax),
            totalTaxesAndStatutoryDeductionsAnnual: Math.round(optTotalTax),
            effectiveTaxRatePercent: contractorAnnualGross > 0 ? Number(((optTotalTax / contractorAnnualGross) * 100).toFixed(2)) : 0,
            marginalTaxRatePercent: Number(((corpRate + divRate) * 100).toFixed(1)),
            netCashTakeHomeAnnual: Math.round(optNet),
            netCashTakeHomeMonthly: Math.round(optNet / 12),
            netEffectiveHourlyTakeHome: Number((optNet / billableHoursPerYear).toFixed(2)),
            monetizedBenefitsAndRetirementValueAnnual: Math.round(contractorRetire),
            trueTotalEconomicPackageAnnual: Math.round(optNet + contractorRetire),
            qbiOrSpecialDeductionSavedAnnual: Math.round(Math.max(0, cTotalTax - optTotalTax)),
            lineItemNotes: [`Corporate + Dividend Tax Saved: ${activeCur.symbol}${Math.round(Math.max(0, cTotalTax - optTotalTax)).toLocaleString()}`],
        },
        ukIr35KidWaterfall,
        usScheduleSeAndScorp,
    };
}

// ============================================================================
// 4. UNROUNDED BINARY-SEARCH BREAK-EVEN SOLVER WITH CONVERGENCE CHECK
// ============================================================================

export function solveRequiredContractorAnnualGross(
    inputs: ContractorVsEmployeeInputs,
    targetPackageAnnual: number,
    regimeTarget: 'STANDARD_CONTRACTOR' | 'OPTIMIZED_ENTITY' = 'STANDARD_CONTRACTOR'
): number {
    if (targetPackageAnnual <= 0) return 0;
    let low = targetPackageAnnual * 0.4;
    let high = Math.max(targetPackageAnnual * 3.5 + 100000, 500000);

    const getMetric = (grossVal: number) => {
        const res = evaluateThreeRegimesForGross(inputs, grossVal);
        return regimeTarget === 'OPTIMIZED_ENTITY'
            ? res.optimizedEntityRegime.netCashTakeHomeAnnual
            : res.standardContractorRegime.netCashTakeHomeAnnual;
    };

    while (getMetric(high) < targetPackageAnnual && high < 1e9) {
        high *= 2;
    }

    for (let iter = 0; iter < 54; iter++) {
        const mid = (low + high) / 2;
        if (getMetric(mid) < targetPackageAnnual) {
            low = mid;
        } else {
            high = mid;
        }
    }
    return Number(((low + high) / 2).toFixed(2));
}

// ============================================================================
// 5. JURISDICTION-AWARE WORKER CLASSIFICATION RISK ASSESSMENT (12 INDICATORS)
// ============================================================================

export function evaluateClassificationAudit(
    inputs: ContractorVsEmployeeInputs
): {
    complianceScore: number;
    verdict: CompiledContractorVsEmployeeReport['classificationVerdict'];
    lintIssues: ClassificationLintIssue[];
} {
    const f = inputs.classificationFlags;
    const j = inputs.jurisdiction;
    const issues: ClassificationLintIssue[] = [];
    let score = 100;

    // Jurisdiction-weighted risk penalties
    const subWeight = j === 'UK' || j === 'AU' ? 22 : 16;
    const ctrlWeight = j === 'US' || j === 'DE' ? 22 : 18;
    const singleClientWeight = j === 'DE' || j === 'AU' || j === 'CA' ? 14 : 8;

    if (!f.hasUnfetteredRightOfSubstitution) {
        score -= subWeight;
        issues.push({
            id: 'CLS-001',
            ruleCode: 'IR35-CEST-001_NO_RIGHT_OF_SUBSTITUTION',
            severity: 'CRITICAL',
            factorCategory: 'SUBSTITUTION',
            title: 'Personal Service Requirement (No Unfettered Right of Substitution)',
            explanation:
                'Under UK HMRC CEST (Ready Mixed Concrete v Minister of Pensions), Australian ATO TR 2023/4 delegation rules, and IRS Common Law, if the contractor must perform the work personally and cannot send a qualified substitute, the engagement strongly points to employment status.',
            remediationClause:
                'Contractor retains the unfettered right to provide a suitably qualified and vetted substitute at Contractor’s own expense without unreasonable Client veto.',
        });
    }

    if (f.clientControlsHowAndWhenWorkDone) {
        score -= ctrlWeight;
        issues.push({
            id: 'CLS-002',
            ruleCode: 'IRS-DOL-002_BEHAVIORAL_SUPERVISION_CONTROL',
            severity: 'CRITICAL',
            factorCategory: 'CONTROL',
            title: 'Client Exercises Direct Supervision, Direction & Control (SDC) Over How & When Work Is Done',
            explanation:
                'Mandating fixed 9-to-5 working hours, daily managerial task direction, or step-by-step execution methods fails the IRS Behavioral Control test, HMRC SDC test, and German § 7 SGB IV Weisungsgebundenheit test.',
            remediationClause:
                'Contractor retains full autonomy over methodology, scheduling, and working location, subject only to agreed milestone deliverables and security standards.',
        });
    }

    if (f.hasMutualityOfObligation) {
        score -= 14;
        issues.push({
            id: 'CLS-003',
            ruleCode: 'IR35-MOO-003_MUTUALITY_OF_OBLIGATION',
            severity: 'CRITICAL',
            factorCategory: 'MUTUALITY_OF_OBLIGATION',
            title: 'Ongoing Mutuality of Obligation (MOO) Beyond Project Scope',
            explanation:
                'An obligation for the client to continuously provide paid work beyond the current Statement of Work (and for the worker to accept it) mirrors an ongoing employment contract.',
            remediationClause:
                'Neither Client nor Contractor is under any obligation to offer or accept further work once the contracted Statement of Work milestones are completed.',
        });
    }

    if (f.usesClientProvidedEquipment) {
        score -= 8;
        issues.push({
            id: 'CLS-004',
            ruleCode: 'IRS-FIN-004_CLIENT_PROVIDED_PRIMARY_EQUIPMENT',
            severity: 'WARNING',
            factorCategory: 'FINANCIAL_RISK',
            title: 'Primary Work Performed on Client-Provided Laptop & Tooling',
            explanation:
                'Genuine independent contractors typically invest in and maintain their own primary hardware, software licenses, and development environment (unless restricted solely for zero-trust security compliance).',
            remediationClause:
                'Contractor shall supply all primary computing hardware and software licenses at Contractor’s own cost; any Client VDI/token access is strictly limited to security isolation.',
        });
    }

    if (!f.bearsFinancialRiskAndFixedPriceRemediation) {
        score -= 10;
        issues.push({
            id: 'CLS-005',
            ruleCode: 'DOL-ECON-005_NO_FINANCIAL_RISK_OR_DEFECT_WARRANTY',
            severity: 'WARNING',
            factorCategory: 'FINANCIAL_RISK',
            title: 'Zero Financial Risk or Obligation to Rectify Defective Deliverables at Own Cost',
            explanation:
                'Under the DOL Economic Reality test and ATO TR 2023/4 Results test, a contractor who bills purely for time with no obligation to fix defective work in their own unbilled time resembles a waged employee.',
            remediationClause:
                'Contractor warrants all deliverables against defects and shall rectify any non-conforming work at Contractor’s own unbilled time and expense.',
        });
    }

    if (f.singleClientOver80PercentRevenue) {
        score -= singleClientWeight;
        issues.push({
            id: 'CLS-006',
            ruleCode: 'DE-DRV-006_SINGLE_CLIENT_ECONOMIC_DEPENDENCY',
            severity: 'WARNING',
            factorCategory: 'INTEGRATION_AND_EXCLUSIVITY',
            title: 'Over 80% of Annual Revenue Derived from a Single Client (Scheinselbstständigkeit / PSI / PSB Risk)',
            explanation:
                'In Germany (DRV >5/6 revenue rule), Australia (ATO 80/20 PSI rule), and Canada (CRA PSB), deriving >80% of revenue from one client without unrelated clients triggers automatic audit scrutiny.',
            remediationClause:
                'Engagement is strictly non-exclusive; Contractor actively markets services to the public and maintains multiple concurrent or sequential B2B client engagements.',
        });
    }

    if (f.integratedIntoClientOrgChartAndPerks) {
        score -= 10;
        issues.push({
            id: 'CLS-007',
            ruleCode: 'IRS-REL-007_PART_AND_PARCEL_ORG_INTEGRATION',
            severity: 'CRITICAL',
            factorCategory: 'INTEGRATION_AND_EXCLUSIVITY',
            title: 'Contractor Integrated into Internal Org Chart, Performance Reviews & Employee Perks',
            explanation:
                'Managing internal staff, appearing on the company org chart without an "External Vendor" designation, or receiving employee perks (PTO, bonuses, stipends) undermines independent contractor status.',
            remediationClause:
                'Contractor is identified externally and internally as an Independent B2B Vendor and is excluded from all employee benefit plans, PTO accrual, and internal HR appraisals.',
        });
    }

    if (f.contractDurationOver12MonthsContinuous) {
        score -= 5;
        issues.push({
            id: 'CLS-008',
            ruleCode: 'CRA-PSB-008_INDETERMINATE_ROLLING_TENURE',
            severity: 'OPTIMIZATION',
            factorCategory: 'MUTUALITY_OF_OBLIGATION',
            title: 'Continuous Rolling Contract Exceeding 12–24 Months Without Deliverable Renewal',
            explanation:
                'Multi-year rolling time-and-materials extensions increase permanence risk under the DOL "Permanence of the Relationship" factor.',
            remediationClause:
                'Structure renewals around distinct, fixed-term Statements of Work (SOWs) tied to discrete project phases and acceptance criteria.',
        });
    }

    if (!f.carriesProfessionalIndemnityInsurance) {
        score -= 4;
        issues.push({
            id: 'CLS-009',
            ruleCode: 'B2B-IND-009_MISSING_LIABILITY_INSURANCE',
            severity: 'OPTIMIZATION',
            factorCategory: 'FINANCIAL_RISK',
            title: 'No Commercial General Liability / Professional Indemnity (E&O) Insurance',
            explanation:
                'Maintaining active Professional Indemnity & Public Liability insurance is a strong positive indicator of a genuine business-to-business (B2B) enterprise.',
            remediationClause:
                'Contractor maintains Professional Indemnity (Errors & Omissions) and Commercial General Liability insurance of at least $1,000,000 / £1,000,000.',
        });
    }

    if (!f.writtenStatementOfWorkWithDeliverables) {
        score -= 5;
        issues.push({
            id: 'CLS-010',
            ruleCode: 'SOW-DEL-010_GENERIC_JOB_DESCRIPTION_CONTRACT',
            severity: 'WARNING',
            factorCategory: 'CONTROL',
            title: 'Contract Uses a Role/Job Description Instead of a Deliverable Statement of Work (SOW)',
            explanation:
                'Contracts that copy-paste a full-time job description rather than specifying project milestones and acceptance deliverables fail HMRC and IRS contract reviews.',
            remediationClause:
                'Replace role-based duties with an outcome-based Statement of Work (SOW) specifying concrete technical milestones and invoice acceptance criteria.',
        });
    }

    if (!f.operatesRegisteredBusinessEntityOrWebsite) {
        score -= 4;
        issues.push({
            id: 'CLS-011',
            ruleCode: 'B2B-PRES-011_NO_REGISTERED_ENTITY_OR_TRADE_PRESENCE',
            severity: 'OPTIMIZATION',
            factorCategory: 'INTEGRATION_AND_EXCLUSIVITY',
            title: 'No Registered B2B Business Entity, Trade License, or Independent Commercial Presence',
            explanation:
                'Operating without a registered business trade name, dedicated business bank account, or commercial presence weakens the "In Business on Own Account" test under HMRC CEST and IRS Common Law.',
            remediationClause:
                'Contractor operates through a registered commercial trade entity / business bank account and invoices via formal B2B commercial invoices.',
        });
    }

    if (!f.canWorkForMultipleClientsSimultaneously) {
        score -= 6;
        issues.push({
            id: 'CLS-012',
            ruleCode: 'EXCL-012_RESTRICTIVE_EXCLUSIVITY_CLAUSE',
            severity: 'WARNING',
            factorCategory: 'INTEGRATION_AND_EXCLUSIVITY',
            title: 'Contractual Exclusivity Clause Prohibits Concurrent B2B Clients',
            explanation:
                'Blanket exclusivity clauses barring a contractor from serving other non-competing clients are a major indicator of disguised employment under DOL, HMRC IR35, and German DRV audits.',
            remediationClause:
                'Remove blanket exclusivity; Contractor may provide services to other third-party clients concurrently, subject only to confidentiality and direct IP non-disclosure.',
        });
    }

    const finalScore = Math.max(5, Math.min(100, score));
    const verdict: CompiledContractorVsEmployeeReport['classificationVerdict'] =
        finalScore >= 80
            ? 'OUTSIDE_IR35_SAFE_INDEPENDENT'
            : finalScore >= 55
                ? 'BORDERLINE_GREY_ZONE'
                : 'INSIDE_IR35_HIGH_MISCLASSIFICATION_RISK';

    return { complianceScore: finalScore, verdict, lintIssues: issues };
}

export function applySafeHarborClassificationFixes(
    inputs: ContractorVsEmployeeInputs
): ContractorVsEmployeeInputs {
    return {
        ...inputs,
        classificationFlags: {
            hasUnfetteredRightOfSubstitution: true,
            clientControlsHowAndWhenWorkDone: false,
            hasMutualityOfObligation: false,
            usesClientProvidedEquipment: false,
            bearsFinancialRiskAndFixedPriceRemediation: true,
            singleClientOver80PercentRevenue: false,
            integratedIntoClientOrgChartAndPerks: false,
            contractDurationOver12MonthsContinuous: false,
            carriesProfessionalIndemnityInsurance: true,
            operatesRegisteredBusinessEntityOrWebsite: true,
            canWorkForMultipleClientsSimultaneously: true,
            writtenStatementOfWorkWithDeliverables: true,
        },
    };
}

function scaleRegimeByFx(regime: RegimeFinancialBreakdown, fx: number): RegimeFinancialBreakdown {
    if (fx === 1) return regime;
    const scale = (v: number) => Math.round(v * fx);
    return {
        ...regime,
        grossTopLineAnnual: scale(regime.grossTopLineAnnual),
        deductibleExpensesAndFeesAnnual: scale(regime.deductibleExpensesAndFeesAnnual),
        employerSideDeductionsFromAssignmentAnnual: scale(regime.employerSideDeductionsFromAssignmentAnnual),
        taxableIncomeBaseAnnual: scale(regime.taxableIncomeBaseAnnual),
        incomeTaxFederalOrNationalAnnual: scale(regime.incomeTaxFederalOrNationalAnnual),
        stateOrProvincialTaxAnnual: scale(regime.stateOrProvincialTaxAnnual),
        socialSecurityOrEmployeeNiAnnual: scale(regime.socialSecurityOrEmployeeNiAnnual),
        selfEmploymentOrDividendTaxAnnual: scale(regime.selfEmploymentOrDividendTaxAnnual),
        corporateOrEntityTaxAnnual: scale(regime.corporateOrEntityTaxAnnual),
        totalTaxesAndStatutoryDeductionsAnnual: scale(regime.totalTaxesAndStatutoryDeductionsAnnual),
        netCashTakeHomeAnnual: scale(regime.netCashTakeHomeAnnual),
        netCashTakeHomeMonthly: scale(regime.netCashTakeHomeMonthly),
        netEffectiveHourlyTakeHome: Number((regime.netEffectiveHourlyTakeHome * fx).toFixed(2)),
        monetizedBenefitsAndRetirementValueAnnual: scale(regime.monetizedBenefitsAndRetirementValueAnnual),
        trueTotalEconomicPackageAnnual: scale(regime.trueTotalEconomicPackageAnnual),
        qbiOrSpecialDeductionSavedAnnual: scale(regime.qbiOrSpecialDeductionSavedAnnual),
    };
}

// ============================================================================
// 6. COMPLETE REPORT COMPILER, FX CONVERSION LAYER & 6-FORMAT EXPORTERS
// ============================================================================

export function compileContractorVsEmployeeReport(
    rawInputs: ContractorVsEmployeeInputs
): CompiledContractorVsEmployeeReport {
    const { normalized: inputs, validationWarnings } = validateAndNormalizeCalculatorInputs(rawInputs);
    const baseMeta = JURISDICTION_CATALOG[inputs.jurisdiction];
    const statutoryCurrency = getIsoCurrencyByCode(baseMeta.currencyCode, 'USD');
    const activeCurrency = getIsoCurrencyByCode(inputs.currencyCode, baseMeta.currencyCode);

    // Genuine FX Conversion Layer:
    // For GLOBAL_CUSTOM, calculations already run natively in the chosen currency (fx = 1.0).
    // For the 8 statutory countries, tax brackets & statutory caps execute in the country's statutory currency
    // (e.g. USD for US, GBP for UK) and then convert by fxRate when a different display currency is selected!
    const appliedFxRateDisplayPerStatutory =
        inputs.jurisdiction === 'GLOBAL_CUSTOM' || activeCurrency.code === statutoryCurrency.code
            ? 1.0
            : inputs.fxConversionRate && inputs.fxConversionRate > 0
                ? Number(inputs.fxConversionRate)
                : computeCrossRate(statutoryCurrency.code, activeCurrency.code);

    const meta: JurisdictionMetadata = {
        ...baseMeta,
        currencyCode: activeCurrency.code,
        currencySymbol: activeCurrency.symbol,
    };

    const billableDaysPerYear = Math.max(1, inputs.billableWeeksPerYear * inputs.workingDaysPerWeek);
    const billableHoursPerYear = Math.max(1, billableDaysPerYear * inputs.billableHoursPerDay);

    const statutoryContractorAnnualGross =
        inputs.contractorRateMode === 'HOURLY'
            ? Math.max(0, inputs.contractorRateInput * billableHoursPerYear)
            : inputs.contractorRateMode === 'DAILY'
                ? Math.max(0, inputs.contractorRateInput * billableDaysPerYear)
                : inputs.contractorRateMode === 'MONTHLY'
                    ? Math.max(0, inputs.contractorRateInput * 12)
                    : Math.max(0, inputs.contractorRateInput);

    const rawEval = evaluateThreeRegimesForGross(inputs, statutoryContractorAnnualGross);
    const employeeRegime = scaleRegimeByFx(rawEval.employeeRegime, appliedFxRateDisplayPerStatutory);
    const standardContractorRegime = scaleRegimeByFx(
        rawEval.standardContractorRegime,
        appliedFxRateDisplayPerStatutory
    );
    const optimizedEntityRegime = scaleRegimeByFx(
        rawEval.optimizedEntityRegime,
        appliedFxRateDisplayPerStatutory
    );
    const ukIr35KidWaterfall = rawEval.ukIr35KidWaterfall;
    const usScheduleSeAndScorp = rawEval.usScheduleSeAndScorp;

    const contractorAnnualGrossRevenue = Math.round(
        statutoryContractorAnnualGross * appliedFxRateDisplayPerStatutory
    );

    const regimes = [employeeRegime, standardContractorRegime, optimizedEntityRegime];
    const winningRegime = [...regimes].sort(
        (a, b) => b.trueTotalEconomicPackageAnnual - a.trueTotalEconomicPackageAnnual
    )[0];

    const netAnnualAdvantageOfContractorVsEmployee =
        standardContractorRegime.trueTotalEconomicPackageAnnual -
        employeeRegime.trueTotalEconomicPackageAnnual;
    const netAnnualAdvantageOfOptimizedEntityVsEmployee =
        optimizedEntityRegime.trueTotalEconomicPackageAnnual -
        employeeRegime.trueTotalEconomicPackageAnnual;
    const netAnnualAdvantageOfOptimizedEntityVsStandardContractor =
        optimizedEntityRegime.netCashTakeHomeAnnual - standardContractorRegime.netCashTakeHomeAnnual;

    // Unrounded Binary-Search Break-Even Solver in Statutory Currency, then scaled by FX
    const rawBreakEvenGrossTotalPkg = solveRequiredContractorAnnualGross(
        inputs,
        rawEval.employeeRegime.trueTotalEconomicPackageAnnual,
        'STANDARD_CONTRACTOR'
    );
    const checkSolvedNet = evaluateThreeRegimesForGross(inputs, rawBreakEvenGrossTotalPkg)
        .standardContractorRegime.netCashTakeHomeAnnual;
    const breakEvenSolverConverged =
        Math.abs(checkSolvedNet - rawEval.employeeRegime.trueTotalEconomicPackageAnnual) <= 15;

    const breakEvenGrossTotalPkg = Math.round(
        rawBreakEvenGrossTotalPkg * appliedFxRateDisplayPerStatutory
    );
    const exactBreakEvenHourlyRateTotalPkg = Number(
        ((rawBreakEvenGrossTotalPkg * appliedFxRateDisplayPerStatutory) / billableHoursPerYear).toFixed(2)
    );
    const exactBreakEvenDailyRateTotalPkg = Number(
        ((rawBreakEvenGrossTotalPkg * appliedFxRateDisplayPerStatutory) / billableDaysPerYear).toFixed(2)
    );

    const rawBreakEvenGrossOptimizedEntity = solveRequiredContractorAnnualGross(
        inputs,
        rawEval.employeeRegime.trueTotalEconomicPackageAnnual,
        'OPTIMIZED_ENTITY'
    );
    const breakEvenGrossOptimizedEntity = Math.round(
        rawBreakEvenGrossOptimizedEntity * appliedFxRateDisplayPerStatutory
    );
    const exactBreakEvenHourlyRateOptimizedEntity = Number(
        ((rawBreakEvenGrossOptimizedEntity * appliedFxRateDisplayPerStatutory) / billableHoursPerYear).toFixed(2)
    );
    const exactBreakEvenDailyRateOptimizedEntity = Number(
        ((rawBreakEvenGrossOptimizedEntity * appliedFxRateDisplayPerStatutory) / billableDaysPerYear).toFixed(2)
    );

    const recommendedHourlyRateWithBuffer = Number(
        (exactBreakEvenHourlyRateTotalPkg * 1.15).toFixed(2)
    );
    const recommendedDailyRateWithBuffer = Number(
        (exactBreakEvenDailyRateTotalPkg * 1.15).toFixed(2)
    );
    const totalUnpaidDays = Math.max(0, inputs.paidVacationAndHolidaysDays + inputs.paidSickDays);
    const unbillablePtoAndHolidayReplacementCostAnnual = Math.round(
        (employeeRegime.grossTopLineAnnual / 260) * totalUnpaidDays
    );

    const rawBreakEvenGrossCashOnly = solveRequiredContractorAnnualGross(
        inputs,
        rawEval.employeeRegime.netCashTakeHomeAnnual,
        'STANDARD_CONTRACTOR'
    );
    const breakEvenGrossCashOnly = Math.round(
        rawBreakEvenGrossCashOnly * appliedFxRateDisplayPerStatutory
    );

    const breakEvenMatrix: BreakEvenRateRow[] = [44, 46, 48, 50, 52].map((wks) => {
        const days = wks * inputs.workingDaysPerWeek;
        const hrs = Math.max(1, days * inputs.billableHoursPerDay);
        const hrCash = Number(((rawBreakEvenGrossCashOnly * appliedFxRateDisplayPerStatutory) / hrs).toFixed(2));
        const dayCash = Number(((rawBreakEvenGrossCashOnly * appliedFxRateDisplayPerStatutory) / days).toFixed(2));
        const hrPkg = Number(((rawBreakEvenGrossTotalPkg * appliedFxRateDisplayPerStatutory) / hrs).toFixed(2));
        const dayPkg = Number(((rawBreakEvenGrossTotalPkg * appliedFxRateDisplayPerStatutory) / days).toFixed(2));
        return {
            billableWeeks: wks,
            billableHoursAnnual: hrs,
            hourlyRateToMatchCashOnly: hrCash,
            dailyRateToMatchCashOnly: dayCash,
            annualGrossToMatchCashOnly: breakEvenGrossCashOnly,
            hourlyRateToMatchTotalPackage: hrPkg,
            dailyRateToMatchTotalPackage: dayPkg,
            annualGrossToMatchTotalPackage: breakEvenGrossTotalPkg,
            recommendedHourlyRateWith15PctBuffer: Number((hrPkg * 1.15).toFixed(2)),
            recommendedDailyRateWith15PctBuffer: Number((dayPkg * 1.15).toFixed(2)),
        };
    });

    // Itemized Statutory Employer Cost Estimator (TCE) vs. EOR vs. Contractor
    const statEmpGross = rawEval.employeeRegime.grossTopLineAnnual;
    let statEmployerPayrollTax = 0;
    if (inputs.jurisdiction === 'US') {
        const ssCap = inputs.taxYear === '2025' ? 176100 : 184500;
        statEmployerPayrollTax = Math.min(statEmpGross, ssCap) * 0.062 + statEmpGross * 0.0145 + Math.min(statEmpGross, 7000) * 0.026; // FICA + FUTA/SUTA
    } else if (inputs.jurisdiction === 'UK') {
        statEmployerPayrollTax = Math.max(0, (statEmpGross - 5000) * 0.155); // 15% Employer NI + 0.5% Levy
    } else if (inputs.jurisdiction === 'CA') {
        const cpp1 = Math.max(0, Math.min(statEmpGross, 71300) - 3500) * 0.0595;
        const cpp2 = Math.max(0, Math.min(statEmpGross, 81200) - 71300) * 0.04;
        const eiEmp = Math.min(statEmpGross, 65700) * 0.0164 * 1.4; // Employer EI is 1.4x employee rate
        const eht = statEmpGross * 0.0195; // Employer Health Tax
        statEmployerPayrollTax = cpp1 + cpp2 + eiEmp + eht;
    } else if (inputs.jurisdiction === 'AU') {
        statEmployerPayrollTax = statEmpGross * 0.0485; // State Payroll Tax (~4.85%); 12% Super is already in benefits
    } else if (inputs.jurisdiction === 'DE') {
        statEmployerPayrollTax = Math.min(statEmpGross, 66150) * 0.0985 + Math.min(statEmpGross, 96600) * 0.106; // Arbeitgeberanteil KV/PV + RV/AV
    } else {
        statEmployerPayrollTax = statEmpGross * 0.06;
    }

    const empGross = employeeRegime.grossTopLineAnnual;
    const directEmployerPayrollTaxesAnnual = Math.round(
        statEmployerPayrollTax * appliedFxRateDisplayPerStatutory
    );
    const directEmployerBenefitsAndRetirementAnnual = Math.round(
        (rawEval.employeeRegime.monetizedBenefitsAndRetirementValueAnnual -
            inputs.employeeBaseSalaryAnnual * (inputs.employeeRetirementContributionPercent / 100)) *
        appliedFxRateDisplayPerStatutory
    );
    const directEmployerWorkersCompAndOverheadAnnual = Math.round(empGross * 0.018);
    const directEmployeeTotalCostOfEmploymentAnnual =
        empGross +
        directEmployerPayrollTaxesAnnual +
        directEmployerBenefitsAndRetirementAnnual +
        directEmployerWorkersCompAndOverheadAnnual;

    const eorAnnualPlatformFee = Math.round(
        meta.eorMonthlyPlatformFeeLocal * 12 * appliedFxRateDisplayPerStatutory
    );
    const eorTotalAnnualCost = directEmployeeTotalCostOfEmploymentAnnual + eorAnnualPlatformFee;
    const contractorManagementPlatformFeeAnnual = Math.round(
        meta.contractorMgmtMonthlyFeeLocal * 12 * appliedFxRateDisplayPerStatutory
    );
    const contractorTotalCompanySpendAnnual =
        contractorAnnualGrossRevenue + contractorManagementPlatformFeeAnnual;

    const employerTceComparison: EmployerTceAndEorComparison = {
        directEmployeeBaseAndBonusAnnual: empGross,
        directEmployerPayrollTaxesAnnual,
        directEmployerBenefitsAndRetirementAnnual,
        directEmployerWorkersCompAndOverheadAnnual,
        directEmployeeTotalCostOfEmploymentAnnual,
        eorAnnualPlatformFee,
        eorTotalAnnualCost,
        contractorGrossInvoiceAnnual: contractorAnnualGrossRevenue,
        contractorManagementPlatformFeeAnnual,
        contractorTotalCompanySpendAnnual,
        employerAnnualSavingsHiringContractorVsDirect:
            directEmployeeTotalCostOfEmploymentAnnual - contractorTotalCompanySpendAnnual,
        employerAnnualSavingsHiringContractorVsEor:
            eorTotalAnnualCost - contractorTotalCompanySpendAnnual,
        estimatedMisclassificationBackTaxAndPenaltyRisk: Math.round(
            directEmployerPayrollTaxesAnnual * 1.4 + directEmployerBenefitsAndRetirementAnnual * 0.5
        ),
    };

    // Classification Risk Assessment & Contractual Addendum Clause Generator
    const { complianceScore, verdict, lintIssues } = evaluateClassificationAudit(inputs);

    const cur = meta.currencySymbol;
    const statCur = statutoryCurrency.symbol;

    const calculationAssumptionsAuditTrail = [
        {
            stepNumber: 1,
            category: 'Jurisdiction & Tax Year',
            label: `${baseMeta.name} (${inputs.taxYear || '2026'})`,
            formulaOrRule: baseMeta.taxYearLabel,
            statutoryAmountFormatted: `Statutory Currency: ${statutoryCurrency.code} (${statCur}) | Display Currency: ${activeCurrency.code} (${cur}) @ FX ${appliedFxRateDisplayPerStatutory}`,
        },
        {
            stepNumber: 2,
            category: 'Billable Utilization Schedule',
            label: `${inputs.billableWeeksPerYear} Wks/Yr × ${inputs.workingDaysPerWeek} Days/Wk × ${inputs.billableHoursPerDay} Hrs/Day`,
            formulaOrRule: `${52 - inputs.billableWeeksPerYear} Unbillable Weeks (PTO/Holidays/Bench)`,
            statutoryAmountFormatted: `${billableHoursPerYear} Billable Hours/Yr (${billableDaysPerYear} Days/Yr)`,
        },
        {
            stepNumber: 3,
            category: 'Full-Time Employee Baseline',
            label: rawEval.employeeRegime.regimeTitle,
            formulaOrRule: rawEval.employeeRegime.regimeSubtitle,
            statutoryAmountFormatted: `Gross: ${statCur}${rawEval.employeeRegime.grossTopLineAnnual.toLocaleString()} → Tax: ${statCur}${rawEval.employeeRegime.totalTaxesAndStatutoryDeductionsAnnual.toLocaleString()} → Net Cash: ${statCur}${rawEval.employeeRegime.netCashTakeHomeAnnual.toLocaleString()} (+ ${statCur}${rawEval.employeeRegime.monetizedBenefitsAndRetirementValueAnnual.toLocaleString()} Benefits/Retire)`,
        },
        {
            stepNumber: 4,
            category: 'Standard Contractor Schedule',
            label: rawEval.standardContractorRegime.regimeTitle,
            formulaOrRule: rawEval.standardContractorRegime.regimeSubtitle,
            statutoryAmountFormatted: `Gross: ${statCur}${rawEval.standardContractorRegime.grossTopLineAnnual.toLocaleString()} → Tax: ${statCur}${rawEval.standardContractorRegime.totalTaxesAndStatutoryDeductionsAnnual.toLocaleString()} → Net Cash: ${statCur}${rawEval.standardContractorRegime.netCashTakeHomeAnnual.toLocaleString()}`,
        },
        {
            stepNumber: 5,
            category: 'Optimized Entity / Special Regime',
            label: rawEval.optimizedEntityRegime.regimeTitle,
            formulaOrRule: rawEval.optimizedEntityRegime.regimeSubtitle,
            statutoryAmountFormatted: `Gross: ${statCur}${rawEval.optimizedEntityRegime.grossTopLineAnnual.toLocaleString()} → Tax: ${statCur}${rawEval.optimizedEntityRegime.totalTaxesAndStatutoryDeductionsAnnual.toLocaleString()} → Net Cash: ${statCur}${rawEval.optimizedEntityRegime.netCashTakeHomeAnnual.toLocaleString()}`,
        },
        {
            stepNumber: 6,
            category: 'Reverse Break-Even Solver (54-Iteration Binary Search)',
            label: `Matches 100% of Employee Net Cash + Benefits (${cur}${employeeRegime.trueTotalEconomicPackageAnnual.toLocaleString()})`,
            formulaOrRule: `Converged: ${breakEvenSolverConverged ? 'YES' : 'BOUNDARY_REACHED'}`,
            statutoryAmountFormatted: `Standard Break-Even: ${cur}${exactBreakEvenHourlyRateTotalPkg}/hr (${cur}${exactBreakEvenDailyRateTotalPkg}/day) | Entity Break-Even: ${cur}${exactBreakEvenHourlyRateOptimizedEntity}/hr`,
        },
    ];

    const contractualAddendumClausesText = [
        `INDEPENDENT CONTRACTOR STATEMENT OF WORK (SOW) & SAFE-HARBOR ADDENDUM`,
        `Jurisdiction Reference: ${baseMeta.classificationTestName}`,
        `============================================================================`,
        `1. RIGHT OF SUBSTITUTION & DELEGATION:`,
        `   Contractor retains the unfettered right to engage or substitute a suitably qualified and security-vetted sub-contractor or replacement personnel at Contractor's own expense. Client may only refuse a substitute on reasonable, objective security or qualification grounds.`,
        `2. AUTONOMY & ABSENCE OF SUPERVISION, DIRECTION OR CONTROL (SDC):`,
        `   Contractor retains complete operational autonomy over the manner, methodology, working hours, and location of service delivery, subject solely to agreed technical specifications and milestone deadlines.`,
        `3. ABSENCE OF MUTUALITY OF OBLIGATION (MOO):`,
        `   Client is under no obligation to offer additional projects or tasks beyond the milestones defined in this Statement of Work, and Contractor is under no obligation to accept any future extension.`,
        `4. FINANCIAL RISK, DEFECT REMEDIATION & COMMERCIAL INSURANCE:`,
        `   Contractor warrants all deliverables against material defects and shall rectify any non-conforming deliverable at Contractor's own unbilled time and cost. Contractor maintains active Professional Indemnity and Commercial Liability insurance.`,
        `5. EQUIPMENT & NON-EXCLUSIVITY:`,
        `   Contractor provides all primary computing hardware and software licenses and may concurrently provide services to other non-competing B2B clients.`,
    ].join('\n');

    const recruiterNegotiationBriefText = [
        `SUBJECT: Compensation & Rate Alignment — ${meta.name.split('(')[0].trim()} Contract Engagement`,
        ``,
        `Hi [Recruiter / Hiring Manager Name],`,
        ``,
        `Thank you for sharing the details for the role. I ran a side-by-side statutory tax and total-compensation comparison between a ${cur}${empGross.toLocaleString()}/yr Full-Time (${meta.employeeRegimeName}) package and an independent B2B contract structure over ${inputs.billableWeeksPerYear} billable weeks (${billableHoursPerYear} hours/yr):`,
        ``,
        `1. Full-Time Employee Baseline Package:`,
        `   • Base Salary + Bonus: ${cur}${empGross.toLocaleString()}/yr (Net Cash Take-Home: ${cur}${employeeRegime.netCashTakeHomeAnnual.toLocaleString()}/yr)`,
        `   • Employer Benefits & Retirement Value: +${cur}${employeeRegime.monetizedBenefitsAndRetirementValueAnnual.toLocaleString()}/yr`,
        `   • True Total Full-Time Economic Value: ${cur}${employeeRegime.trueTotalEconomicPackageAnnual.toLocaleString()}/yr`,
        ``,
        `2. Statutory Contractor Overhead & Self-Funded Benefits:`,
        `   • As an independent contractor, I absorb self-employment/entity taxes, ${52 - inputs.billableWeeksPerYear} weeks of unpaid PTO/holidays, self-funded health coverage, and B2B operating/accounting expenses.`,
        ``,
        `3. Break-Even & Target Contract Rate:`,
        `   • Break-Even Rate (to match full-time net cash + benefits): ${cur}${exactBreakEvenHourlyRateTotalPkg}/hr (${cur}${exactBreakEvenDailyRateTotalPkg}/day | ${cur}${breakEvenGrossTotalPkg.toLocaleString()}/yr)`,
        `   • Recommended Commercial Contract Rate (with 15% B2B bench & risk buffer): ${cur}${recommendedHourlyRateWithBuffer}/hr (${cur}${recommendedDailyRateWithBuffer}/day)`,
        ``,
        `At ${cur}${exactBreakEvenHourlyRateTotalPkg}–${cur}${recommendedHourlyRateWithBuffer}/hr, your organization also avoids ${cur}${directEmployerPayrollTaxesAnnual.toLocaleString()}/yr in employer payroll taxes and ${cur}${eorAnnualPlatformFee.toLocaleString()}/yr in EOR overhead. Please let me know if we can align the Statement of Work around ${cur}${recommendedHourlyRateWithBuffer}/hr (${cur}${recommendedDailyRateWithBuffer}/day).`,
        ``,
        `Best regards,`,
        `[Your Name]`,
    ].join('\n');

    const markdownTaxAndKidReport = [
        `# Universal Contractor vs. Full-Time Tax & Total Compensation Dossier`,
        ``,
        `- **Jurisdiction:** ${meta.name} (${inputs.taxYear || '2026'})`,
        `- **Currency & FX Basis:** Statutory ${statutoryCurrency.code} (${statCur}) → Display ${activeCurrency.code} (${cur}) @ FX ${appliedFxRateDisplayPerStatutory}`,
        `- **Billable Schedule:** ${inputs.billableWeeksPerYear} weeks/yr × ${inputs.workingDaysPerWeek} days/wk × ${inputs.billableHoursPerDay} hrs/day (${billableHoursPerYear} billable hrs/yr)`,
        `- **Winning Structure:** **${winningRegime.regimeTitle}** (${cur}${winningRegime.trueTotalEconomicPackageAnnual.toLocaleString()}/yr Total Economic Value)`,
        `- **Worker Classification Risk Score:** **${complianceScore}/100** (\`${verdict}\` — Heuristic Risk Indicator, Not Legal Advice)`,
        ``,
        `## 1. Side-by-Side 3-Regime Financial Waterfall`,
        ``,
        `| Metric | ${employeeRegime.regimeTitle} | ${standardContractorRegime.regimeTitle} | ${optimizedEntityRegime.regimeTitle} |`,
        `| :--- | ---: | ---: | ---: |`,
        `| **Gross Top-Line Revenue / Salary** | ${cur}${employeeRegime.grossTopLineAnnual.toLocaleString()} | ${cur}${standardContractorRegime.grossTopLineAnnual.toLocaleString()} | ${cur}${optimizedEntityRegime.grossTopLineAnnual.toLocaleString()} |`,
        `| **Deductible Expenses & Entity Fees** | ${cur}${employeeRegime.deductibleExpensesAndFeesAnnual.toLocaleString()} | ${cur}${standardContractorRegime.deductibleExpensesAndFeesAnnual.toLocaleString()} | ${cur}${optimizedEntityRegime.deductibleExpensesAndFeesAnnual.toLocaleString()} |`,
        `| **Total Statutory Taxes & NI/FICA/SECA** | ${cur}${employeeRegime.totalTaxesAndStatutoryDeductionsAnnual.toLocaleString()} | ${cur}${standardContractorRegime.totalTaxesAndStatutoryDeductionsAnnual.toLocaleString()} | ${cur}${optimizedEntityRegime.totalTaxesAndStatutoryDeductionsAnnual.toLocaleString()} |`,
        `| **Effective Tax Rate (%)** | ${employeeRegime.effectiveTaxRatePercent}% | ${standardContractorRegime.effectiveTaxRatePercent}% | ${optimizedEntityRegime.effectiveTaxRatePercent}% |`,
        `| **Net Annual Cash Take-Home** | **${cur}${employeeRegime.netCashTakeHomeAnnual.toLocaleString()}** | **${cur}${standardContractorRegime.netCashTakeHomeAnnual.toLocaleString()}** | **${cur}${optimizedEntityRegime.netCashTakeHomeAnnual.toLocaleString()}** |`,
        `| **Monetized Benefits & Retirement Value** | +${cur}${employeeRegime.monetizedBenefitsAndRetirementValueAnnual.toLocaleString()} | +${cur}${standardContractorRegime.monetizedBenefitsAndRetirementValueAnnual.toLocaleString()} | +${cur}${optimizedEntityRegime.monetizedBenefitsAndRetirementValueAnnual.toLocaleString()} |`,
        `| **True Total Economic Package** | **${cur}${employeeRegime.trueTotalEconomicPackageAnnual.toLocaleString()}** | **${cur}${standardContractorRegime.trueTotalEconomicPackageAnnual.toLocaleString()}** | **${cur}${optimizedEntityRegime.trueTotalEconomicPackageAnnual.toLocaleString()}** |`,
        ``,
        `## 2. Break-Even Contractor Rate Benchmarks`,
        `- **Standard Contractor Break-Even Rate:** ${cur}${exactBreakEvenHourlyRateTotalPkg}/hr (${cur}${exactBreakEvenDailyRateTotalPkg}/day)`,
        `- **Optimized Entity Break-Even Rate:** ${cur}${exactBreakEvenHourlyRateOptimizedEntity}/hr (${cur}${exactBreakEvenDailyRateOptimizedEntity}/day)`,
        `- **Recommended Target Rate (+15% Bench & Risk Buffer):** ${cur}${recommendedHourlyRateWithBuffer}/hr (${cur}${recommendedDailyRateWithBuffer}/day)`,
    ].join('\n');

    const maxVal = Math.max(
        1,
        employeeRegime.trueTotalEconomicPackageAnnual,
        standardContractorRegime.trueTotalEconomicPackageAnnual,
        optimizedEntityRegime.trueTotalEconomicPackageAnnual
    );
    const barScale = (v: number) => Math.max(8, Math.round((v / maxVal) * 440));

    const svgWaterfallChart = [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 320" width="760" height="320" style="background:#0f172a;font-family:system-ui,sans-serif;border-radius:16px">`,
        `  <text x="28" y="38" fill="#f8fafc" font-size="16" font-weight="bold">3-Way Net Take-Home &amp; Package Comparison (${meta.currencyCode})</text>`,
        `  <text x="28" y="58" fill="#94a3b8" font-size="12">${meta.name} (${inputs.taxYear || '2026'}) • Break-Even Rate: ${cur}${exactBreakEvenHourlyRateTotalPkg}/hr (${cur}${exactBreakEvenDailyRateTotalPkg}/day)</text>`,
        `  <text x="28" y="105" fill="#e2e8f0" font-size="12" font-weight="bold">1. ${employeeRegime.regimeTitle}</text>`,
        `  <rect x="240" y="88" width="${barScale(employeeRegime.trueTotalEconomicPackageAnnual)}" height="26" rx="6" fill="#3b82f6"/>`,
        `  <text x="${250 + barScale(employeeRegime.trueTotalEconomicPackageAnnual)}" y="106" fill="#93c5fd" font-size="12" font-weight="bold">${cur}${employeeRegime.trueTotalEconomicPackageAnnual.toLocaleString()} (Net + Benefits)</text>`,
        `  <text x="28" y="165" fill="#e2e8f0" font-size="12" font-weight="bold">2. ${standardContractorRegime.regimeTitle.slice(0, 28)}</text>`,
        `  <rect x="240" y="148" width="${barScale(standardContractorRegime.trueTotalEconomicPackageAnnual)}" height="26" rx="6" fill="#6366f1"/>`,
        `  <text x="${250 + barScale(standardContractorRegime.trueTotalEconomicPackageAnnual)}" y="166" fill="#a5b4fc" font-size="12" font-weight="bold">${cur}${standardContractorRegime.netCashTakeHomeAnnual.toLocaleString()} Net Cash</text>`,
        `  <text x="28" y="225" fill="#e2e8f0" font-size="12" font-weight="bold">3. ${optimizedEntityRegime.regimeTitle.slice(0, 28)}</text>`,
        `  <rect x="240" y="208" width="${barScale(optimizedEntityRegime.trueTotalEconomicPackageAnnual)}" height="26" rx="6" fill="#10b981"/>`,
        `  <text x="${250 + barScale(optimizedEntityRegime.trueTotalEconomicPackageAnnual)}" y="226" fill="#6ee7b7" font-size="12" font-weight="bold">${cur}${optimizedEntityRegime.netCashTakeHomeAnnual.toLocaleString()} Net Cash</text>`,
        `  <text x="28" y="285" fill="#cbd5e1" font-size="11">Generated locally by KivaroTools Universal Contractor vs. Full-Time Engine v${CONTRACTOR_VS_EMPLOYEE_ENGINE_VERSION}</text>`,
        `</svg>`,
    ].join('\n');

    const scenarioSummaryObject = {
        schemaType: 'KIVAROTOOLS_SCENARIO_DATA_FINGERPRINT_V2',
        engineVersion: CONTRACTOR_VS_EMPLOYEE_ENGINE_VERSION,
        jurisdiction: meta.code,
        taxYear: inputs.taxYear || '2026',
        statutoryCurrency: statutoryCurrency.code,
        displayCurrency: activeCurrency.code,
        appliedFxRateDisplayPerStatutory,
        financialSummary: {
            employeeNetCashAnnual: employeeRegime.netCashTakeHomeAnnual,
            employeeTotalEconomicPackageAnnual: employeeRegime.trueTotalEconomicPackageAnnual,
            standardContractorNetCashAnnual: standardContractorRegime.netCashTakeHomeAnnual,
            optimizedEntityNetCashAnnual: optimizedEntityRegime.netCashTakeHomeAnnual,
            exactBreakEvenHourlyRate: exactBreakEvenHourlyRateTotalPkg,
            exactBreakEvenDailyRate: exactBreakEvenDailyRateTotalPkg,
            exactBreakEvenHourlyRateOptimizedEntity,
            recommendedHourlyRateWith15PctBuffer: recommendedHourlyRateWithBuffer,
        },
        classificationRiskAssessment: {
            disclaimer: 'Heuristic risk indicator based on user-selected answers; does not constitute formal legal or tax advice.',
            authority: meta.authorityName,
            statutoryFramework: meta.classificationTestName,
            riskScore: complianceScore,
            riskBand: verdict,
            activeRiskFactorsCount: lintIssues.length,
        },
        employerCostEstimate: employerTceComparison,
    };

    const sha256Signature = computeSha256Hex(JSON.stringify(scenarioSummaryObject));
    const auditCertificateJson = JSON.stringify(
        {
            ...scenarioSummaryObject,
            sha256ScenarioDataFingerprint: sha256Signature,
        },
        null,
        2
    );

    return {
        engineVersion: CONTRACTOR_VS_EMPLOYEE_ENGINE_VERSION,
        jurisdictionMeta: meta,
        activeCurrency,
        statutoryCurrencyCode: statutoryCurrency.code,
        statutoryCurrencySymbol: statutoryCurrency.symbol,
        appliedFxRateDisplayPerStatutory,
        breakEvenSolverConverged,
        validationWarnings,
        calculationAssumptionsAuditTrail,
        contractualAddendumClausesText,
        contractorAnnualGrossRevenue,
        totalBillableHoursPerYear: billableHoursPerYear,
        totalBillableDaysPerYear: billableDaysPerYear,
        employeeRegime,
        standardContractorRegime,
        optimizedEntityRegime,
        winningRegime,
        netAnnualAdvantageOfContractorVsEmployee: Math.round(netAnnualAdvantageOfContractorVsEmployee),
        netAnnualAdvantageOfOptimizedEntityVsEmployee: Math.round(
            netAnnualAdvantageOfOptimizedEntityVsEmployee
        ),
        netAnnualAdvantageOfOptimizedEntityVsStandardContractor: Math.round(
            netAnnualAdvantageOfOptimizedEntityVsStandardContractor
        ),
        exactBreakEvenHourlyRateTotalPkg,
        exactBreakEvenDailyRateTotalPkg,
        exactBreakEvenAnnualGrossTotalPkg: breakEvenGrossTotalPkg,
        exactBreakEvenHourlyRateOptimizedEntity,
        exactBreakEvenDailyRateOptimizedEntity,
        exactBreakEvenAnnualGrossOptimizedEntity: breakEvenGrossOptimizedEntity,
        recommendedHourlyRateWithBuffer,
        recommendedDailyRateWithBuffer,
        unbillablePtoAndHolidayReplacementCostAnnual,
        breakEvenMatrix,
        ukIr35KidWaterfall,
        usScheduleSeAndScorp,
        employerTceComparison,
        classificationComplianceScore: complianceScore,
        classificationVerdict: verdict,
        classificationLintIssues: lintIssues,
        recruiterNegotiationBriefText,
        markdownTaxAndKidReport,
        auditCertificateJson,
        svgWaterfallChart,
        sha256Signature,
    };
}

// ============================================================================
// 7. RFC 4180 CSV & NATIVE BINARY EXCEL (.XLSX) EXPORTERS (CWE-1236 SAFE)
// ============================================================================

export function exportComparisonCsv(report: CompiledContractorVsEmployeeReport): string {
    const e = report.employeeRegime;
    const s = report.standardContractorRegime;
    const o = report.optimizedEntityRegime;
    const rows: (string | number)[][] = [
        ['Metric', e.regimeTitle, s.regimeTitle, o.regimeTitle],
        ['Gross Top-Line Revenue / Salary', e.grossTopLineAnnual, s.grossTopLineAnnual, o.grossTopLineAnnual],
        [
            'Deductible Business Expenses & Fees',
            e.deductibleExpensesAndFeesAnnual,
            s.deductibleExpensesAndFeesAnnual,
            o.deductibleExpensesAndFeesAnnual,
        ],
        [
            'Income Tax (Federal / National)',
            e.incomeTaxFederalOrNationalAnnual,
            s.incomeTaxFederalOrNationalAnnual,
            o.incomeTaxFederalOrNationalAnnual,
        ],
        [
            'State / Provincial Tax',
            e.stateOrProvincialTaxAnnual,
            s.stateOrProvincialTaxAnnual,
            o.stateOrProvincialTaxAnnual,
        ],
        [
            'Social Security / Employee NI / FICA',
            e.socialSecurityOrEmployeeNiAnnual,
            s.socialSecurityOrEmployeeNiAnnual,
            o.socialSecurityOrEmployeeNiAnnual,
        ],
        [
            'Self-Employment / Dividend Tax',
            e.selfEmploymentOrDividendTaxAnnual,
            s.selfEmploymentOrDividendTaxAnnual,
            o.selfEmploymentOrDividendTaxAnnual,
        ],
        [
            'Corporate / Entity Tax',
            e.corporateOrEntityTaxAnnual,
            s.corporateOrEntityTaxAnnual,
            o.corporateOrEntityTaxAnnual,
        ],
        [
            'Total Statutory Taxes & Deductions',
            e.totalTaxesAndStatutoryDeductionsAnnual,
            s.totalTaxesAndStatutoryDeductionsAnnual,
            o.totalTaxesAndStatutoryDeductionsAnnual,
        ],
        [
            'Effective Tax Rate (%)',
            `${e.effectiveTaxRatePercent}%`,
            `${s.effectiveTaxRatePercent}%`,
            `${o.effectiveTaxRatePercent}%`,
        ],
        ['Net Annual Cash Take-Home', e.netCashTakeHomeAnnual, s.netCashTakeHomeAnnual, o.netCashTakeHomeAnnual],
        ['Net Monthly Cash Take-Home', e.netCashTakeHomeMonthly, s.netCashTakeHomeMonthly, o.netCashTakeHomeMonthly],
        [
            'Monetized Employer Benefits Value',
            e.monetizedBenefitsAndRetirementValueAnnual,
            s.monetizedBenefitsAndRetirementValueAnnual,
            o.monetizedBenefitsAndRetirementValueAnnual,
        ],
        [
            'True Total Economic Package',
            e.trueTotalEconomicPackageAnnual,
            s.trueTotalEconomicPackageAnnual,
            o.trueTotalEconomicPackageAnnual,
        ],
    ];

    const escapeCsv = (val: string | number): string => {
        const safe = sanitizeSpreadsheetFormula(val, true);
        if (/[",\r\n]/.test(safe)) {
            return `"${safe.replace(/"/g, '""')}"`;
        }
        return safe;
    };

    return '\uFEFF' + rows.map((r) => r.map(escapeCsv).join(',')).join('\r\n');
}

export function exportComparisonXlsx(report: CompiledContractorVsEmployeeReport): Uint8Array {
    const xmlEscape = (str: string): string =>
        str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');

    const e = report.employeeRegime;
    const s = report.standardContractorRegime;
    const o = report.optimizedEntityRegime;

    const allRows: (string | number)[][] = [
        ['KivaroTools Universal Contractor vs. Full-Time Financial Comparison', report.jurisdictionMeta.name, report.jurisdictionMeta.taxYearLabel, ''],
        ['Metric', e.regimeTitle, s.regimeTitle, o.regimeTitle],
        ['Gross Top-Line Annual', e.grossTopLineAnnual, s.grossTopLineAnnual, o.grossTopLineAnnual],
        ['Deductible Expenses & Fees', e.deductibleExpensesAndFeesAnnual, s.deductibleExpensesAndFeesAnnual, o.deductibleExpensesAndFeesAnnual],
        ['Total Statutory Taxes', e.totalTaxesAndStatutoryDeductionsAnnual, s.totalTaxesAndStatutoryDeductionsAnnual, o.totalTaxesAndStatutoryDeductionsAnnual],
        ['Effective Tax Rate (%)', `${e.effectiveTaxRatePercent}%`, `${s.effectiveTaxRatePercent}%`, `${o.effectiveTaxRatePercent}%`],
        ['Net Annual Cash Take-Home', e.netCashTakeHomeAnnual, s.netCashTakeHomeAnnual, o.netCashTakeHomeAnnual],
        ['Net Monthly Cash Take-Home', e.netCashTakeHomeMonthly, s.netCashTakeHomeMonthly, o.netCashTakeHomeMonthly],
        ['Monetized Benefits Value', e.monetizedBenefitsAndRetirementValueAnnual, s.monetizedBenefitsAndRetirementValueAnnual, o.monetizedBenefitsAndRetirementValueAnnual],
        ['True Total Economic Package', e.trueTotalEconomicPackageAnnual, s.trueTotalEconomicPackageAnnual, o.trueTotalEconomicPackageAnnual],
        ['Exact Break-Even Hourly Rate', report.exactBreakEvenHourlyRateTotalPkg, report.recommendedHourlyRateWithBuffer, ''],
    ];

    const colLetter = (idx: number): string => String.fromCharCode(65 + idx);
    const sheetRowsXml = allRows
        .map((row, rIdx) => {
            const rowNum = rIdx + 1;
            const cellsXml = row
                .map((cellVal, cIdx) => {
                    const ref = `${colLetter(cIdx)}${rowNum}`;
                    const safeVal = xmlEscape(sanitizeSpreadsheetFormula(cellVal, true));
                    const styleAttr = rIdx <= 1 ? ' s="1"' : '';
                    return `<c r="${ref}" t="inlineStr"${styleAttr}><is><t>${safeVal}</t></is></c>`;
                })
                .join('');
            return `<row r="${rowNum}">${cellsXml}</row>`;
        })
        .join('');

    const contentTypesXml =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
        `<Default Extension="xml" ContentType="application/xml"/>` +
        `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
        `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
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
        `<sheets><sheet name="Contractor_vs_Employee" sheetId="1" r:id="rId1"/></sheets>` +
        `</workbook>`;

    const workbookRelsXml =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
        `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
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

    const sheetXml =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
        `<sheetData>${sheetRowsXml}</sheetData>` +
        `</worksheet>`;

    const zipEntries: { name: string; data: Uint8Array }[] = [
        { name: '[Content_Types].xml', data: textEncoder.encode(contentTypesXml) },
        { name: '_rels/.rels', data: textEncoder.encode(rootRelsXml) },
        { name: 'xl/workbook.xml', data: textEncoder.encode(workbookXml) },
        { name: 'xl/_rels/workbook.xml.rels', data: textEncoder.encode(workbookRelsXml) },
        { name: 'xl/styles.xml', data: textEncoder.encode(stylesXml) },
        { name: 'xl/worksheets/sheet1.xml', data: textEncoder.encode(sheetXml) },
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
    for (const part of localParts) {
        out.set(part, pos);
        pos += part.length;
    }
    for (const part of centralParts) {
        out.set(part, pos);
        pos += part.length;
    }
    out.set(eocd, pos);
    return out;
}

// ============================================================================
// 8. 5 INSTANT 1-CLICK SCENARIO PRESETS
// ============================================================================

export type ContractorScenarioPresetId =
    | 'us_w2_1099_scorp'
    | 'uk_ir35_inside_outside'
    | 'ca_t4_vs_ccpc'
    | 'pk_pseb_it_exporter'
    | 'audit_risk_demo';

export function getContractorScenarioPreset(
    presetId: ContractorScenarioPresetId
): ContractorVsEmployeeInputs {
    const safeFlags: ClassificationAuditFlags = {
        hasUnfetteredRightOfSubstitution: true,
        clientControlsHowAndWhenWorkDone: false,
        hasMutualityOfObligation: false,
        usesClientProvidedEquipment: false,
        bearsFinancialRiskAndFixedPriceRemediation: true,
        singleClientOver80PercentRevenue: false,
        integratedIntoClientOrgChartAndPerks: false,
        contractDurationOver12MonthsContinuous: false,
        carriesProfessionalIndemnityInsurance: true,
        operatesRegisteredBusinessEntityOrWebsite: true,
        canWorkForMultipleClientsSimultaneously: true,
        writtenStatementOfWorkWithDeliverables: true,
    };

    if (presetId === 'uk_ir35_inside_outside') {
        return {
            jurisdiction: 'UK',
            regionCode: 'ENG_NI_WALES',
            filingStatus: 'SINGLE',
            stateTaxRatePercent: 0,
            employeeBaseSalaryAnnual: 95000,
            employeeAnnualBonus: 5000,
            employerHealthInsuranceAnnual: 1800,
            employerRetirementMatchPercent: 5,
            employeeRetirementContributionPercent: 5,
            paidVacationAndHolidaysDays: 28,
            paidSickDays: 5,
            employerOtherPerksAnnual: 1200,
            contractorRateMode: 'DAILY',
            contractorRateInput: 650,
            billableHoursPerDay: 8,
            workingDaysPerWeek: 5,
            billableWeeksPerYear: 46,
            deductibleBusinessExpensesAnnual: 3600,
            contractorSelfFundedHealthAnnual: 1800,
            contractorRetirementContributionAnnual: 6000,
            entityAccountingAndUmbrellaFeesAnnual: 1440,
            entityOwnerSalaryPercent: 20,
            classificationFlags: safeFlags,
        };
    }

    if (presetId === 'ca_t4_vs_ccpc') {
        return {
            jurisdiction: 'CA',
            regionCode: 'ON',
            filingStatus: 'SINGLE',
            stateTaxRatePercent: 9.15,
            employeeBaseSalaryAnnual: 140000,
            employeeAnnualBonus: 8000,
            employerHealthInsuranceAnnual: 3600,
            employerRetirementMatchPercent: 4,
            employeeRetirementContributionPercent: 4,
            paidVacationAndHolidaysDays: 25,
            paidSickDays: 5,
            employerOtherPerksAnnual: 1500,
            contractorRateMode: 'HOURLY',
            contractorRateInput: 95,
            billableHoursPerDay: 8,
            workingDaysPerWeek: 5,
            billableWeeksPerYear: 46,
            deductibleBusinessExpensesAnnual: 5500,
            contractorSelfFundedHealthAnnual: 3200,
            contractorRetirementContributionAnnual: 8000,
            entityAccountingAndUmbrellaFeesAnnual: 2400,
            entityOwnerSalaryPercent: 35,
            classificationFlags: safeFlags,
        };
    }

    if (presetId === 'pk_pseb_it_exporter') {
        return {
            jurisdiction: 'PK',
            regionCode: 'PK_FED',
            filingStatus: 'SINGLE',
            stateTaxRatePercent: 0,
            employeeBaseSalaryAnnual: 7200000,
            employeeAnnualBonus: 600000,
            employerHealthInsuranceAnnual: 240000,
            employerRetirementMatchPercent: 8,
            employeeRetirementContributionPercent: 8,
            paidVacationAndHolidaysDays: 24,
            paidSickDays: 8,
            employerOtherPerksAnnual: 180000,
            contractorRateMode: 'MONTHLY',
            contractorRateInput: 950000,
            billableHoursPerDay: 8,
            workingDaysPerWeek: 5,
            billableWeeksPerYear: 48,
            deductibleBusinessExpensesAnnual: 420000,
            contractorSelfFundedHealthAnnual: 180000,
            contractorRetirementContributionAnnual: 0,
            entityAccountingAndUmbrellaFeesAnnual: 45000,
            entityOwnerSalaryPercent: 30,
            classificationFlags: safeFlags,
        };
    }

    if (presetId === 'audit_risk_demo') {
        return {
            jurisdiction: 'UK',
            regionCode: 'ENG_NI_WALES',
            filingStatus: 'SINGLE',
            stateTaxRatePercent: 0,
            employeeBaseSalaryAnnual: 85000,
            employeeAnnualBonus: 0,
            employerHealthInsuranceAnnual: 1500,
            employerRetirementMatchPercent: 4,
            employeeRetirementContributionPercent: 4,
            paidVacationAndHolidaysDays: 28,
            paidSickDays: 5,
            employerOtherPerksAnnual: 1000,
            contractorRateMode: 'DAILY',
            contractorRateInput: 550,
            billableHoursPerDay: 8,
            workingDaysPerWeek: 5,
            billableWeeksPerYear: 46,
            deductibleBusinessExpensesAnnual: 2400,
            contractorSelfFundedHealthAnnual: 1500,
            contractorRetirementContributionAnnual: 4000,
            entityAccountingAndUmbrellaFeesAnnual: 1300,
            entityOwnerSalaryPercent: 25,
            classificationFlags: {
                hasUnfetteredRightOfSubstitution: false,
                clientControlsHowAndWhenWorkDone: true,
                hasMutualityOfObligation: true,
                usesClientProvidedEquipment: true,
                bearsFinancialRiskAndFixedPriceRemediation: false,
                singleClientOver80PercentRevenue: true,
                integratedIntoClientOrgChartAndPerks: true,
                contractDurationOver12MonthsContinuous: true,
                carriesProfessionalIndemnityInsurance: false,
                operatesRegisteredBusinessEntityOrWebsite: true,
                canWorkForMultipleClientsSimultaneously: false,
                writtenStatementOfWorkWithDeliverables: false,
            },
        };
    }

    // Default: US Senior Engineer ($150k W-2 vs $95/hr 1099 vs S-Corp Election)
    return {
        jurisdiction: 'US',
        regionCode: 'CA',
        filingStatus: 'SINGLE',
        stateTaxRatePercent: 8.2,
        employeeBaseSalaryAnnual: 150000,
        employeeAnnualBonus: 10000,
        employerHealthInsuranceAnnual: 8400,
        employerRetirementMatchPercent: 4,
        employeeRetirementContributionPercent: 5,
        paidVacationAndHolidaysDays: 22,
        paidSickDays: 5,
        employerOtherPerksAnnual: 2400,
        contractorRateMode: 'HOURLY',
        contractorRateInput: 105,
        billableHoursPerDay: 8,
        workingDaysPerWeek: 5,
        billableWeeksPerYear: 47,
        deductibleBusinessExpensesAnnual: 6800,
        contractorSelfFundedHealthAnnual: 7800,
        contractorRetirementContributionAnnual: 12000,
        entityAccountingAndUmbrellaFeesAnnual: 2400,
        entityOwnerSalaryPercent: 42,
        classificationFlags: safeFlags,
    };
}