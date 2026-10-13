/**
 * Enterprise / Financial-Planning Grade Financial Calculation Engine
 * 
 * Canonical calculation engine powering:
 * - Deterministic Cash-Flow Projections
 * - Sub-period compounding & contribution timing
 * - Contribution escalation (% and fixed annual increase)
 * - One-time milestone cash flows (deposits & withdrawals)
 * - Expense drag / investment management fees
 * - Transparent multi-mode tax modeling (taxable, tax-deferred, tax-exempt)
 * - Inflation & Fisher equation real purchasing power
 * - Goal-based solvers (Required Contribution, Required Return, Required Horizon)
 * - Multi-scenario comparative planning
 * - Reproducible Monte Carlo risk & sequence-of-returns simulation
 * - Pre-configured stress testing
 * - Retirement / Drawdown longevity modeling
 * - Auditable year-by-year cash-flow schedule & CSV/JSON export
 */

export type CompoundingFrequency =
  | "daily"
  | "monthly"
  | "quarterly"
  | "semi-annually"
  | "annually";

export type ContributionFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "annually";

export type ContributionTiming = "end" | "beginning";

export type TaxTreatment = "taxable" | "deferred" | "exempt";

export type WithdrawalType = "fixed" | "percentage";

export interface OneTimeEvent {
  id: string;
  year: number;
  amount: number;
  type: "deposit" | "withdrawal";
  description?: string;
}

export interface FinancialInputs {
  principal: number;
  annualRate: number;
  years: number;
  compoundingFrequency: CompoundingFrequency;
  contribution: number;
  contributionFrequency: ContributionFrequency;
  contributionTiming: ContributionTiming;
  contributionEscalationPercent?: number;
  contributionEscalationFixed?: number;
  annualFeeRate?: number;
  fixedAnnualFee?: number;
  taxRate?: number;
  taxTreatment?: TaxTreatment;
  inflationRate?: number;
  oneTimeEvents?: OneTimeEvent[];
  drawdownEnabled?: boolean;
  accumulationYears?: number;
  withdrawalAmount?: number;
  withdrawalFrequency?: ContributionFrequency;
  withdrawalType?: WithdrawalType;
  withdrawalInflationAdjusted?: boolean;
}

export interface ScheduleRow {
  period: number;
  year: number;
  openingBalance: number;
  contributions: number;
  escalationAmount: number;
  grossGrowth: number;
  feesPaid: number;
  taxesPaid: number;
  withdrawals: number;
  closingBalance: number;
  cumulativeInvested: number;
  cumulativeGains: number;
  cumulativeFees: number;
  cumulativeTaxes: number;
  cumulativeWithdrawals: number;
  realPurchasingPower: number;
}

export interface ProjectionResult {
  futureValue: number;
  initialInvestment: number;
  totalContributions: number;
  totalInvested: number;
  totalOneTimeDeposits: number;
  totalOneTimeWithdrawals: number;
  grossGains: number;
  totalFeesPaid: number;
  totalTaxesPaid: number;
  netGains: number;
  afterTaxFutureValue: number;
  inflationAdjustedValue: number;
  cumulativeInflationLoss: number;
  effectiveApy: number;
  cagr: number;
  fisherRealReturn: number;
  doublingYears: number | null;
  roiPercent: number;
  annualizedIrr: number | null;
  depletedYear: number | null;
  isDepleted: boolean;
  yearsUsed: number;
  schedule: ScheduleRow[];
}

export interface ScenarioDefinition {
  id: string;
  label: string;
  description: string;
  rateDelta?: number;
  rateOverride?: number;
  inflationDelta?: number;
  feeDelta?: number;
  contributionDelta?: number;
}

export interface ScenarioResultItem {
  id: string;
  label: string;
  description: string;
  rate: number;
  inflationRate: number;
  annualFeeRate: number;
  contribution: number;
  futureValue: number;
  totalInvested: number;
  totalInterest: number;
  totalFees: number;
  afterTaxValue: number;
  realValue: number;
  goalReached: boolean;
  goalDifference: number;
}

export interface MonteCarloPercentilePath {
  year: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface MonteCarloResult {
  simulationCount: number;
  annualVolatility: number;
  probabilityOfGoalSuccess: number;
  probabilityOfLongevitySuccess: number;
  medianEndingValue: number;
  p10EndingValue: number;
  p25EndingValue: number;
  p50EndingValue: number;
  p75EndingValue: number;
  p90EndingValue: number;
  paths: MonteCarloPercentilePath[];
}

export interface StressScenario {
  id: string;
  title: string;
  description: string;
  endingBalance: number;
  lossVsBase: number;
  percentChangeVsBase: number;
  realValue: number;
  goalReached: boolean;
  shortfallVsGoal: number;
  survivesDrawdown: boolean;
}

export interface GoalSolverResult {
  isSolved: boolean;
  status: "achieved" | "shortfall" | "surplus" | "impossible";
  targetGoal: number;
  projectedEndingValue: number;
  fundedPercentage: number;
  gapOrSurplus: number;
  requiredContribution: number | null;
  requiredContributionDelta: number | null;
  requiredReturn: number | null;
  requiredYears: number | null;
}

export const COMPOUNDING_PERIODS: Record<CompoundingFrequency, number> = {
  daily: 365,
  monthly: 12,
  quarterly: 4,
  "semi-annually": 2,
  annually: 1,
};

export const CONTRIBUTION_PERIODS: Record<ContributionFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  quarterly: 4,
  annually: 1,
};

export function cleanNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Validates and sanitizes financial inputs into strictly safe, finite bounds.
 */
export function sanitizeFinancialInputs(raw: Partial<FinancialInputs>): FinancialInputs {
  const principal = clamp(cleanNumber(raw.principal, 10000), 0, 1e14);
  const annualRate = clamp(cleanNumber(raw.annualRate, 8), -100, 500);
  const years = clamp(cleanNumber(raw.years, 10), 0.1, 100);
  const compoundingFrequency: CompoundingFrequency =
    raw.compoundingFrequency && raw.compoundingFrequency in COMPOUNDING_PERIODS
      ? raw.compoundingFrequency
      : "monthly";

  const contribution = clamp(cleanNumber(raw.contribution, 500), 0, 1e12);
  const contributionFrequency: ContributionFrequency =
    raw.contributionFrequency && raw.contributionFrequency in CONTRIBUTION_PERIODS
      ? raw.contributionFrequency
      : "monthly";
  const contributionTiming: ContributionTiming =
    raw.contributionTiming === "beginning" ? "beginning" : "end";

  const contributionEscalationPercent = clamp(
    cleanNumber(raw.contributionEscalationPercent, 0),
    -50,
    100
  );
  const contributionEscalationFixed = clamp(
    cleanNumber(raw.contributionEscalationFixed, 0),
    0,
    1e9
  );

  const annualFeeRate = clamp(cleanNumber(raw.annualFeeRate, 0), 0, 20);
  const fixedAnnualFee = clamp(cleanNumber(raw.fixedAnnualFee, 0), 0, 1e8);

  const taxRate = clamp(cleanNumber(raw.taxRate, 0), 0, 100);
  const taxTreatment: TaxTreatment =
    raw.taxTreatment === "deferred" || raw.taxTreatment === "exempt"
      ? raw.taxTreatment
      : "taxable";

  const inflationRate = clamp(cleanNumber(raw.inflationRate, 3), 0, 100);

  const oneTimeEvents: OneTimeEvent[] = Array.isArray(raw.oneTimeEvents)
    ? raw.oneTimeEvents
        .filter((e) => e && typeof e === "object")
        .map((e, idx) => ({
          id: typeof e.id === "string" ? e.id : `evt-${idx}`,
          year: clamp(cleanNumber(e.year, 1), 0.1, 100),
          amount: clamp(cleanNumber(e.amount, 0), 0, 1e12),
          type: e.type === "withdrawal" ? "withdrawal" : "deposit",
          description: typeof e.description === "string" ? e.description : "",
        }))
    : [];

  const drawdownEnabled = Boolean(raw.drawdownEnabled);
  const accumulationYears = clamp(cleanNumber(raw.accumulationYears, years), 0, years);
  const withdrawalAmount = clamp(cleanNumber(raw.withdrawalAmount, 0), 0, 1e12);
  const withdrawalFrequency: ContributionFrequency =
    raw.withdrawalFrequency && raw.withdrawalFrequency in CONTRIBUTION_PERIODS
      ? raw.withdrawalFrequency
      : "monthly";
  const withdrawalType: WithdrawalType =
    raw.withdrawalType === "percentage" ? "percentage" : "fixed";
  const withdrawalInflationAdjusted = Boolean(raw.withdrawalInflationAdjusted);

  return {
    principal,
    annualRate,
    years,
    compoundingFrequency,
    contribution,
    contributionFrequency,
    contributionTiming,
    contributionEscalationPercent,
    contributionEscalationFixed,
    annualFeeRate,
    fixedAnnualFee,
    taxRate,
    taxTreatment,
    inflationRate,
    oneTimeEvents,
    drawdownEnabled,
    accumulationYears,
    withdrawalAmount,
    withdrawalFrequency,
    withdrawalType,
    withdrawalInflationAdjusted,
  };
}

/**
 * Calculates Effective APY: (1 + r/m)^m - 1
 */
export function calculateEffectiveApy(
  annualNominalRate: number,
  compoundingFrequency: CompoundingFrequency
): number {
  if (annualNominalRate <= -100) return -100;
  const m = COMPOUNDING_PERIODS[compoundingFrequency] || 12;
  const periodicRate = annualNominalRate / 100 / m;
  const apy = Math.pow(1 + periodicRate, m) - 1;
  return apy * 100;
}

/**
 * Calculates Fisher Equation Real Return: (1 + nominal) / (1 + inflation) - 1
 */
export function calculateFisherRealReturn(
  nominalRate: number,
  inflationRate: number
): number {
  const nom = nominalRate / 100;
  const inf = inflationRate / 100;
  if (inf <= -1) return nom * 100;
  const real = (1 + nom) / (1 + inf) - 1;
  return real * 100;
}

/**
 * Calculates Rule of 72 Doubling Time
 */
export function calculateRuleOf72(annualRate: number): number | null {
  if (annualRate <= 0) return null;
  return 72 / annualRate;
}

/**
 * Canonical Deterministic Timeline Simulation Engine
 * Runs a high-precision, sub-period synchronized simulation.
 */
export function simulateTimeline(rawInputs: Partial<FinancialInputs>): ProjectionResult {
  const inputs = sanitizeFinancialInputs(rawInputs);
  const {
    principal,
    annualRate,
    years,
    compoundingFrequency,
    contribution,
    contributionFrequency,
    contributionTiming,
    contributionEscalationPercent = 0,
    contributionEscalationFixed = 0,
    annualFeeRate = 0,
    fixedAnnualFee = 0,
    taxRate = 0,
    taxTreatment = "taxable",
    inflationRate = 0,
    oneTimeEvents = [],
    drawdownEnabled = false,
    accumulationYears = years,
    withdrawalAmount = 0,
    withdrawalFrequency = "monthly",
    withdrawalType = "fixed",
    withdrawalInflationAdjusted = false,
  } = inputs;

  const DAYS_PER_YEAR = 365;
  const totalDays = Math.max(1, Math.round(years * DAYS_PER_YEAR));
  const yearsUsed = totalDays / DAYS_PER_YEAR;

  const compPeriods = COMPOUNDING_PERIODS[compoundingFrequency];
  const contribPeriods = CONTRIBUTION_PERIODS[contributionFrequency];
  const withdrawPeriods = CONTRIBUTION_PERIODS[withdrawalFrequency];

  const contribIntervalDays = DAYS_PER_YEAR / contribPeriods;
  const withdrawIntervalDays = DAYS_PER_YEAR / withdrawPeriods;

  // Daily growth multiplier derived from compounding frequency:
  // (1 + r/m)^(m/365)
  let dailyGrowthMultiplier = 1;
  if (annualRate > -100) {
    const periodicRate = annualRate / 100 / compPeriods;
    if (1 + periodicRate > 0) {
      dailyGrowthMultiplier = Math.pow(1 + periodicRate, compPeriods / DAYS_PER_YEAR);
    } else {
      dailyGrowthMultiplier = 0;
    }
  } else {
    dailyGrowthMultiplier = 0;
  }

  const dailyFeeRate = (annualFeeRate / 100) / DAYS_PER_YEAR;
  const dailyFixedFee = fixedAnnualFee / DAYS_PER_YEAR;
  const effectiveTaxRate = taxTreatment === "exempt" ? 0 : Math.max(0, taxRate) / 100;

  // Sort one-time events by timing day
  const sortedEvents = [...oneTimeEvents]
    .map((e) => ({
      ...e,
      targetDay: Math.max(1, Math.min(totalDays, Math.round(e.year * DAYS_PER_YEAR))),
      processed: false,
    }))
    .sort((a, b) => a.targetDay - b.targetDay);

  let balance = principal;
  let invested = principal;
  let totalContributions = 0;
  let totalOneTimeDeposits = 0;
  let totalOneTimeWithdrawals = 0;
  let grossGains = 0;
  let totalFeesPaid = 0;
  let totalTaxesPaid = 0;
  let totalWithdrawals = 0;

  let nextContributionDay = contributionTiming === "beginning" ? 1 : contribIntervalDays;
  let nextWithdrawalDay =
    (drawdownEnabled ? accumulationYears * DAYS_PER_YEAR : 0) + withdrawIntervalDays;

  let depletedDay: number | null = null;

  // Annual schedule tracking
  const schedule: ScheduleRow[] = [];
  let yearOpeningBalance = balance;
  let yearContribs = 0;
  let yearEscalation = 0;
  let yearGrossGrowth = 0;
  let yearFees = 0;
  let yearTaxes = 0;
  let yearWithdrawals = 0;

  // Initial row at Year 0
  schedule.push({
    period: 0,
    year: 0,
    openingBalance: principal,
    contributions: 0,
    escalationAmount: 0,
    grossGrowth: 0,
    feesPaid: 0,
    taxesPaid: 0,
    withdrawals: 0,
    closingBalance: principal,
    cumulativeInvested: principal,
    cumulativeGains: 0,
    cumulativeFees: 0,
    cumulativeTaxes: 0,
    cumulativeWithdrawals: 0,
    realPurchasingPower: principal,
  });

  for (let day = 1; day <= totalDays; day++) {
    const currentYearIndex = Math.floor((day - 1) / DAYS_PER_YEAR);
    const isAccumulationPhase = !drawdownEnabled || (day / DAYS_PER_YEAR) <= accumulationYears;

    // 1. One-time cash flows due on this day
    for (const evt of sortedEvents) {
      if (!evt.processed && evt.targetDay === day) {
        evt.processed = true;
        if (evt.type === "deposit") {
          balance += evt.amount;
          invested += evt.amount;
          totalOneTimeDeposits += evt.amount;
        } else {
          const maxWithdraw = Math.max(0, balance);
          const actualWithdraw = Math.min(evt.amount, maxWithdraw);
          balance -= actualWithdraw;
          totalOneTimeWithdrawals += actualWithdraw;
          yearWithdrawals += actualWithdraw;
          totalWithdrawals += actualWithdraw;
        }
      }
    }

    // 2. Beginning of period contributions
    if (isAccumulationPhase && contribution > 0 && contributionTiming === "beginning") {
      while (day + 1e-9 >= nextContributionDay && nextContributionDay <= totalDays + 1e-5) {
        // Calculate escalation for current year
        const escalatedAmount =
          contribution * Math.pow(1 + contributionEscalationPercent / 100, currentYearIndex) +
          contributionEscalationFixed * currentYearIndex;
        const safeContribution = Math.max(0, escalatedAmount);
        const escalationDiff = Math.max(0, safeContribution - contribution);

        balance += safeContribution;
        invested += safeContribution;
        totalContributions += safeContribution;
        yearContribs += safeContribution;
        yearEscalation += escalationDiff;

        nextContributionDay += contribIntervalDays;
      }
    }

    // 3. Investment Growth & Daily Drag
    if (balance > 0) {
      const growthMultiplier = dailyGrowthMultiplier;
      const dayGrossGrowth = balance * (growthMultiplier - 1);
      grossGains += dayGrossGrowth;
      yearGrossGrowth += dayGrossGrowth;
      balance += dayGrossGrowth;

      // Fees
      const dayFee = balance * dailyFeeRate + dailyFixedFee;
      const actualFee = Math.min(balance, Math.max(0, dayFee));
      balance -= actualFee;
      totalFeesPaid += actualFee;
      yearFees += actualFee;

      // Taxable account annual/daily drag on net gain after fees
      if (taxTreatment === "taxable" && effectiveTaxRate > 0 && dayGrossGrowth > 0) {
        const netGainBeforeTax = Math.max(0, dayGrossGrowth - actualFee);
        const dayTax = netGainBeforeTax * effectiveTaxRate;
        const actualTax = Math.min(balance, Math.max(0, dayTax));
        balance -= actualTax;
        totalTaxesPaid += actualTax;
        yearTaxes += actualTax;
      }
    }

    // 4. End of period contributions
    if (isAccumulationPhase && contribution > 0 && contributionTiming === "end") {
      while (day + 1e-9 >= nextContributionDay && nextContributionDay <= totalDays + 1e-5) {
        const escalatedAmount =
          contribution * Math.pow(1 + contributionEscalationPercent / 100, currentYearIndex) +
          contributionEscalationFixed * currentYearIndex;
        const safeContribution = Math.max(0, escalatedAmount);
        const escalationDiff = Math.max(0, safeContribution - contribution);

        balance += safeContribution;
        invested += safeContribution;
        totalContributions += safeContribution;
        yearContribs += safeContribution;
        yearEscalation += escalationDiff;

        nextContributionDay += contribIntervalDays;
      }
    }

    // 5. Drawdown / Retirement Withdrawals
    if (drawdownEnabled && !isAccumulationPhase && withdrawalAmount > 0) {
      while (day + 1e-9 >= nextWithdrawalDay && nextWithdrawalDay <= totalDays + 1e-5) {
        let currentWithdrawal = withdrawalAmount;
        if (withdrawalType === "percentage") {
          currentWithdrawal = (balance * (withdrawalAmount / 100)) / withdrawPeriods;
        }
        if (withdrawalInflationAdjusted && inflationRate > 0) {
          const yearsIntoDrawdown = Math.max(0, (day / DAYS_PER_YEAR) - accumulationYears);
          currentWithdrawal *= Math.pow(1 + inflationRate / 100, yearsIntoDrawdown);
        }

        const actualWithdraw = Math.min(Math.max(0, balance), Math.max(0, currentWithdrawal));
        balance -= actualWithdraw;
        totalWithdrawals += actualWithdraw;
        yearWithdrawals += actualWithdraw;

        if (balance <= 0 && depletedDay === null) {
          depletedDay = day;
          balance = 0;
        }

        nextWithdrawalDay += withdrawIntervalDays;
      }
    }

    // Safety floor
    if (balance < 0) {
      balance = 0;
    }

    // Year boundary or final day: capture schedule row
    const isYearEnd = day % DAYS_PER_YEAR === 0;
    const isFinalDay = day === totalDays;

    if (isYearEnd || isFinalDay) {
      const yearElapsed = day / DAYS_PER_YEAR;
      const inflationFactor = Math.pow(1 + Math.max(0, inflationRate) / 100, yearElapsed);
      const realValue = inflationFactor > 0 ? balance / inflationFactor : balance;

      schedule.push({
        period: schedule.length,
        year: Math.round(yearElapsed * 100) / 100,
        openingBalance: yearOpeningBalance,
        contributions: yearContribs,
        escalationAmount: yearEscalation,
        grossGrowth: yearGrossGrowth,
        feesPaid: yearFees,
        taxesPaid: yearTaxes,
        withdrawals: yearWithdrawals,
        closingBalance: balance,
        cumulativeInvested: invested,
        cumulativeGains: balance - invested + totalWithdrawals,
        cumulativeFees: totalFeesPaid,
        cumulativeTaxes: totalTaxesPaid,
        cumulativeWithdrawals: totalWithdrawals,
        realPurchasingPower: realValue,
      });

      yearOpeningBalance = balance;
      yearContribs = 0;
      yearEscalation = 0;
      yearGrossGrowth = 0;
      yearFees = 0;
      yearTaxes = 0;
      yearWithdrawals = 0;
    }
  }

  // Final tax adjustments for tax-deferred accounts upon exit
  let afterTaxFutureValue = balance;
  if (taxTreatment === "deferred" && effectiveTaxRate > 0) {
    const taxableGains = Math.max(0, balance - invested);
    const deferredTax = taxableGains * effectiveTaxRate;
    afterTaxFutureValue = Math.max(0, balance - deferredTax);
    totalTaxesPaid += deferredTax;
  } else if (taxTreatment === "taxable") {
    afterTaxFutureValue = balance;
  } else {
    // exempt
    afterTaxFutureValue = balance;
  }

  const futureValue = balance;
  const netGains = futureValue - invested + totalWithdrawals;
  const finalInflationFactor = Math.pow(1 + Math.max(0, inflationRate) / 100, yearsUsed);
  const inflationAdjustedValue =
    finalInflationFactor > 0 ? futureValue / finalInflationFactor : futureValue;
  const cumulativeInflationLoss = Math.max(0, futureValue - inflationAdjustedValue);

  const effectiveApy = calculateEffectiveApy(annualRate, compoundingFrequency);
  const fisherRealReturn = calculateFisherRealReturn(annualRate, inflationRate);
  const doublingYears = calculateRuleOf72(annualRate);

  const roiPercent =
    invested > 0 ? ((futureValue + totalWithdrawals - invested) / invested) * 100 : 0;

  // CAGR calculation
  let cagr = 0;
  if (yearsUsed > 0 && principal > 0) {
    if (totalContributions === 0 && totalOneTimeDeposits === 0) {
      cagr = (Math.pow(Math.max(0, futureValue) / principal, 1 / yearsUsed) - 1) * 100;
    } else {
      cagr = ((futureValue - invested) / invested / yearsUsed) * 100;
    }
  }

  // Calculate Money-Weighted Return / IRR
  const annualizedIrr = calculateIrr({
    principal,
    contributions: totalContributions,
    years: yearsUsed,
    oneTimeEvents,
    futureValue,
    totalWithdrawals,
  });

  return {
    futureValue,
    initialInvestment: principal,
    totalContributions,
    totalInvested: invested,
    totalOneTimeDeposits,
    totalOneTimeWithdrawals,
    grossGains,
    totalFeesPaid,
    totalTaxesPaid,
    netGains,
    afterTaxFutureValue,
    inflationAdjustedValue,
    cumulativeInflationLoss,
    effectiveApy,
    cagr,
    fisherRealReturn,
    doublingYears,
    roiPercent,
    annualizedIrr,
    depletedYear: depletedDay !== null ? Math.round((depletedDay / DAYS_PER_YEAR) * 10) / 10 : null,
    isDepleted: depletedDay !== null,
    yearsUsed,
    schedule,
  };
}

/**
 * Robust Newton-Raphson & Bisection Internal Rate of Return (IRR) Solver
 */
export function calculateIrr({
  principal,
  contributions,
  years,
  oneTimeEvents = [],
  futureValue,
  totalWithdrawals = 0,
}: {
  principal: number;
  contributions: number;
  years: number;
  oneTimeEvents?: OneTimeEvent[];
  futureValue: number;
  totalWithdrawals?: number;
}): number | null {
  if (years <= 0 || principal + contributions <= 0) return null;

  // Build simplified annual cash flow timeline
  const T = Math.max(1, Math.round(years));
  const cashFlows: { t: number; amount: number }[] = [];

  // Outflow at t=0
  cashFlows.push({ t: 0, amount: -principal });

  // Uniform contributions spread over years 1 to T
  const annualContrib = contributions / T;
  for (let t = 1; t <= T; t++) {
    cashFlows.push({ t, amount: -annualContrib });
  }

  // Add one-time events
  for (const evt of oneTimeEvents) {
    const t = Math.min(T, Math.max(0.1, evt.year));
    cashFlows.push({
      t,
      amount: evt.type === "deposit" ? -evt.amount : evt.amount,
    });
  }

  // Inflow at T (terminal value + withdrawals)
  cashFlows.push({ t: T, amount: futureValue + totalWithdrawals });

  // Function to evaluate NPV at rate r
  function npv(r: number): number {
    let sum = 0;
    for (const cf of cashFlows) {
      sum += cf.amount / Math.pow(1 + r, cf.t);
    }
    return sum;
  }

  // Bisection search between -0.99 and +3.00
  let low = -0.95;
  let high = 3.0;
  const fLow = npv(low);
  const fHigh = npv(high);

  if (fLow * fHigh > 0) {
    // Root not bracketed within standard bounds
    return null;
  }

  for (let iter = 0; iter < 40; iter++) {
    const mid = (low + high) / 2;
    const fMid = npv(mid);

    if (Math.abs(fMid) < 1e-4 || (high - low) < 1e-5) {
      return mid * 100;
    }

    if (fLow * fMid <= 0) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return ((low + high) / 2) * 100;
}

/**
 * Goal-Based Financial Solvers
 */
export function analyzeGoal(
  targetGoal: number,
  baseInputs: Partial<FinancialInputs>
): GoalSolverResult {
  const goal = Math.max(0, cleanNumber(targetGoal, 0));
  const currentResult = simulateTimeline(baseInputs);
  const projectedEndingValue = currentResult.futureValue;

  if (goal <= 0) {
    return {
      isSolved: false,
      status: "achieved",
      targetGoal: 0,
      projectedEndingValue,
      fundedPercentage: 100,
      gapOrSurplus: projectedEndingValue,
      requiredContribution: null,
      requiredContributionDelta: null,
      requiredReturn: null,
      requiredYears: null,
    };
  }

  const fundedPercentage = Math.min(1000, (projectedEndingValue / goal) * 100);
  const gapOrSurplus = Math.abs(projectedEndingValue - goal);
  const status =
    projectedEndingValue >= goal
      ? "achieved"
      : fundedPercentage >= 80
      ? "shortfall"
      : "shortfall";

  // 1. Solver: Required Contribution
  let requiredContribution: number | null = null;
  let requiredContributionDelta: number | null = null;

  if (projectedEndingValue < goal) {
    let low = 0;
    let high = Math.max(goal * 2, 1e8);
    const maxTest = simulateTimeline({
      ...baseInputs,
      contribution: high,
    });
    if (maxTest.futureValue < goal) {
      requiredContribution = null;
      requiredContributionDelta = null;
    } else {
      for (let i = 0; i < 35; i++) {
        const mid = (low + high) / 2;
        const testResult = simulateTimeline({
          ...baseInputs,
          contribution: mid,
        });
        if (testResult.futureValue >= goal) {
          high = mid;
        } else {
          low = mid;
        }
      }
      requiredContribution = Math.round(high * 100) / 100;
      requiredContributionDelta = Math.max(
        0,
        requiredContribution - cleanNumber(baseInputs.contribution, 0)
      );
    }
  } else {
    requiredContribution = 0;
    requiredContributionDelta = 0;
  }

  // 2. Solver: Required Return
  let requiredReturn: number | null = null;
  if (projectedEndingValue < goal) {
    let low = -50;
    let high = 250;
    let found = false;
    for (let i = 0; i < 35; i++) {
      const mid = (low + high) / 2;
      const testResult = simulateTimeline({
        ...baseInputs,
        annualRate: mid,
      });
      if (testResult.futureValue >= goal) {
        high = mid;
        found = true;
      } else {
        low = mid;
      }
    }
    if (found && high <= 245) {
      requiredReturn = Math.round(high * 100) / 100;
    }
  }

  // 3. Solver: Required Years
  let requiredYears: number | null = null;
  if (projectedEndingValue < goal) {
    let low = 0.5;
    let high = 100;
    let found = false;
    for (let i = 0; i < 35; i++) {
      const mid = (low + high) / 2;
      const testResult = simulateTimeline({
        ...baseInputs,
        years: mid,
      });
      if (testResult.futureValue >= goal) {
        high = mid;
        found = true;
      } else {
        low = mid;
      }
    }
    if (found && high <= 99.5) {
      requiredYears = Math.round(high * 10) / 10;
    }
  }

  return {
    isSolved: true,
    status,
    targetGoal: goal,
    projectedEndingValue,
    fundedPercentage,
    gapOrSurplus,
    requiredContribution,
    requiredContributionDelta,
    requiredReturn,
    requiredYears,
  };
}

/**
 * Multi-Scenario Engine
 * Generates side-by-side comparative projections using the canonical engine.
 */
export function generateScenarios(
  baseInputs: Partial<FinancialInputs>,
  spreadPercent = 2,
  targetGoal = 0
): ScenarioResultItem[] {
  const sanitized = sanitizeFinancialInputs(baseInputs);
  const spread = Math.max(0.1, clamp(spreadPercent, 0.1, 20));

  const scenarios: ScenarioDefinition[] = [
    {
      id: "conservative",
      label: "Conservative",
      description: `Annual return reduced by ${spread.toFixed(1)}%`,
      rateDelta: -spread,
    },
    {
      id: "base",
      label: "Base Plan",
      description: "Primary projection assumptions",
      rateDelta: 0,
    },
    {
      id: "optimistic",
      label: "Optimistic",
      description: `Annual return increased by ${spread.toFixed(1)}%`,
      rateDelta: spread,
    },
  ];

  return scenarios.map((sc) => {
    const modifiedRate = Math.max(-100, sanitized.annualRate + (sc.rateDelta || 0));
    const result = simulateTimeline({
      ...sanitized,
      annualRate: modifiedRate,
    });

    const goal = Math.max(0, targetGoal);
    const goalReached = goal > 0 ? result.futureValue >= goal : true;
    const goalDifference = goal > 0 ? result.futureValue - goal : 0;

    return {
      id: sc.id,
      label: sc.label,
      description: sc.description,
      rate: modifiedRate,
      inflationRate: sanitized.inflationRate ?? 0,
      annualFeeRate: sanitized.annualFeeRate || 0,
      contribution: sanitized.contribution,
      futureValue: result.futureValue,
      totalInvested: result.totalInvested,
      totalInterest: result.netGains,
      totalFees: result.totalFeesPaid,
      afterTaxValue: result.afterTaxFutureValue,
      realValue: result.inflationAdjustedValue,
      goalReached,
      goalDifference,
    };
  });
}

/**
 * Mulberry32 Deterministic Seedable PRNG
 */
function createMulberry32(seed: number): () => number {
  let s = (seed >>> 0) || 1337;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Box-Muller Gaussian Normal Variate Generator
 */
function nextGaussian(prng: () => number, mean: number, stdDev: number): number {
  const u1 = Math.max(1e-15, prng());
  const u2 = prng();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

/**
 * Monte Carlo Risk & Sequence-of-Returns Simulation Engine
 * Runs N stochastic paths with deterministic seed for reproducible QA.
 */
export function runMonteCarloSimulation({
  baseInputs,
  simulationCount = 500,
  annualVolatility = 14,
  seed = 42,
  targetGoal = 0,
}: {
  baseInputs: Partial<FinancialInputs>;
  simulationCount?: number;
  annualVolatility?: number;
  seed?: number;
  targetGoal?: number;
}): MonteCarloResult {
  const sanitized = sanitizeFinancialInputs(baseInputs);
  const nRuns = clamp(simulationCount, 50, 2000);
  const vol = clamp(annualVolatility, 1, 50) / 100;
  const prng = createMulberry32(seed);

  const T = Math.max(1, Math.round(sanitized.years));
  const goal = Math.max(0, targetGoal);

  // Store ending balances of all paths
  const endingBalances: number[] = new Array(nRuns);
  let goalSuccessCount = 0;
  let longevitySuccessCount = 0;

  // Grid for percentile fan chart: years 0 to T
  const yearlyPathsGrid: number[][] = Array.from({ length: T + 1 }, () => []);

  for (let run = 0; run < nRuns; run++) {
    let balance = sanitized.principal;
    let depleted = false;
    yearlyPathsGrid[0].push(balance);

    const isDrawdown = sanitized.drawdownEnabled;
    const accumYears = sanitized.accumulationYears ?? T;
    const withdrawAmt = sanitized.withdrawalAmount ?? 0;
    const withdrawPerYear =
      sanitized.withdrawalFrequency ? CONTRIBUTION_PERIODS[sanitized.withdrawalFrequency] : 12;

    for (let t = 1; t <= T; t++) {
      if (balance <= 0) {
        depleted = true;
        balance = 0;
        yearlyPathsGrid[t].push(0);
        continue;
      }

      // Sample stochastic annual return from Gaussian distribution
      const annualReturn = clamp(
        nextGaussian(prng, sanitized.annualRate / 100, vol),
        -0.7,
        1.5
      );

      const inAccumulation = !isDrawdown || t <= accumYears;

      if (inAccumulation && sanitized.contribution > 0) {
        const annualContrib =
          sanitized.contribution *
          CONTRIBUTION_PERIODS[sanitized.contributionFrequency] *
          Math.pow(1 + (sanitized.contributionEscalationPercent || 0) / 100, t - 1);
        balance += annualContrib;
      }

      // Apply annual stochastic growth & fee drag
      const feeRate = (sanitized.annualFeeRate || 0) / 100;
      balance = balance * (1 + annualReturn - feeRate);

      // Tax drag in taxable account
      if (sanitized.taxTreatment === "taxable" && (sanitized.taxRate || 0) > 0 && annualReturn > 0) {
        balance -= balance * annualReturn * ((sanitized.taxRate || 0) / 100);
      }

      if (isDrawdown && !inAccumulation && withdrawAmt > 0) {
        let annualWithdraw = withdrawAmt * withdrawPerYear;
        if (sanitized.withdrawalType === "percentage") {
          annualWithdraw = balance * (withdrawAmt / 100);
        }
        if (sanitized.withdrawalInflationAdjusted && sanitized.inflationRate) {
          annualWithdraw *= Math.pow(1 + sanitized.inflationRate / 100, t - accumYears);
        }
        balance -= annualWithdraw;
        if (balance <= 0) {
          balance = 0;
          depleted = true;
        }
      }

      balance = Math.max(0, balance);
      yearlyPathsGrid[t].push(balance);
    }

    endingBalances[run] = balance;

    if (!depleted) {
      longevitySuccessCount++;
    }

    if (goal > 0) {
      if (balance >= goal) {
        goalSuccessCount++;
      }
    } else {
      if (!depleted) {
        goalSuccessCount++;
      }
    }
  }

  endingBalances.sort((a, b) => a - b);

  const getPercentile = (arr: number[], pct: number) => {
    const idx = Math.min(arr.length - 1, Math.max(0, Math.floor(pct * arr.length)));
    return arr[idx];
  };

  const p10EndingValue = getPercentile(endingBalances, 0.1);
  const p25EndingValue = getPercentile(endingBalances, 0.25);
  const p50EndingValue = getPercentile(endingBalances, 0.5);
  const p75EndingValue = getPercentile(endingBalances, 0.75);
  const p90EndingValue = getPercentile(endingBalances, 0.9);

  // Compute percentile fan points for each year
  const paths: MonteCarloPercentilePath[] = [];
  for (let t = 0; t <= T; t++) {
    const yearValues = yearlyPathsGrid[t].slice().sort((a, b) => a - b);
    paths.push({
      year: t,
      p10: getPercentile(yearValues, 0.1),
      p25: getPercentile(yearValues, 0.25),
      p50: getPercentile(yearValues, 0.5),
      p75: getPercentile(yearValues, 0.75),
      p90: getPercentile(yearValues, 0.9),
    });
  }

  return {
    simulationCount: nRuns,
    annualVolatility: annualVolatility,
    probabilityOfGoalSuccess: Math.round((goalSuccessCount / nRuns) * 100),
    probabilityOfLongevitySuccess: Math.round((longevitySuccessCount / nRuns) * 100),
    medianEndingValue: p50EndingValue,
    p10EndingValue,
    p25EndingValue,
    p50EndingValue,
    p75EndingValue,
    p90EndingValue,
    paths,
  };
}

/**
 * Pre-Configured Stress Scenarios ("What breaks the plan?")
 */
export function runStressTests(
  baseInputs: Partial<FinancialInputs>,
  targetGoal = 0
): StressScenario[] {
  const sanitized = sanitizeFinancialInputs(baseInputs);
  const baseResult = simulateTimeline(sanitized);
  const goal = Math.max(0, targetGoal);

  // 1. Early Market Crash (-20% Year 1, -10% Year 2)
  const crashEvents: OneTimeEvent[] = [
    ...(sanitized.oneTimeEvents || []),
    {
      id: "stress-crash-1",
      year: 1,
      amount: sanitized.principal * 0.2,
      type: "withdrawal",
      description: "Severe Early Market Drawdown (-20%)",
    },
  ];
  const crashResult = simulateTimeline({
    ...sanitized,
    annualRate: Math.max(-20, sanitized.annualRate - 4),
    oneTimeEvents: crashEvents,
  });

  // 2. High Inflation Era (+3% Inflation)
  const highInflationResult = simulateTimeline({
    ...sanitized,
    inflationRate: (sanitized.inflationRate || 3) + 3,
  });

  // 3. Contribution Hiatus (Pause 2 years of contributions)
  const pauseContrib = Math.max(0, sanitized.contribution * 0.7);
  const pauseResult = simulateTimeline({
    ...sanitized,
    contribution: pauseContrib,
  });

  // 4. Elevated Advisory & Management Fees (+1.25% fee drag)
  const feeResult = simulateTimeline({
    ...sanitized,
    annualFeeRate: (sanitized.annualFeeRate || 0) + 1.25,
  });

  // 5. Combined Confluence Stress Test
  const combinedResult = simulateTimeline({
    ...sanitized,
    annualRate: Math.max(-15, sanitized.annualRate - 3),
    inflationRate: (sanitized.inflationRate || 3) + 2.5,
    annualFeeRate: (sanitized.annualFeeRate || 0) + 1.0,
    contribution: pauseContrib,
  });

  const tests = [
    {
      id: "early-crash",
      title: "Early Market Crash",
      description: "Severe early drawdown (-20% in Yr 1) and subdued recovery",
      result: crashResult,
    },
    {
      id: "inflation-surge",
      title: "High Inflation Era",
      description: "+3.0% persistent inflation surge eroding real purchasing power",
      result: highInflationResult,
    },
    {
      id: "contribution-pause",
      title: "Contribution Hiatus",
      description: "Prolonged reduction/pause in recurring savings (30% drop)",
      result: pauseResult,
    },
    {
      id: "fee-drag",
      title: "High Fee Drag",
      description: "+1.25% advisory & fund expense ratio drag",
      result: feeResult,
    },
    {
      id: "combined-stress",
      title: "Worst-Case Confluence",
      description: "Lower returns, elevated inflation, higher fees, and reduced contributions",
      result: combinedResult,
    },
  ];

  return tests.map((t) => {
    const endingBalance = t.result.futureValue;
    const lossVsBase = Math.max(0, baseResult.futureValue - endingBalance);
    const percentChangeVsBase =
      baseResult.futureValue > 0
        ? ((endingBalance - baseResult.futureValue) / baseResult.futureValue) * 100
        : 0;
    const goalReached = goal > 0 ? endingBalance >= goal : true;
    const shortfallVsGoal = goal > 0 ? Math.max(0, goal - endingBalance) : 0;
    const survivesDrawdown = !t.result.isDepleted;

    return {
      id: t.id,
      title: t.title,
      description: t.description,
      endingBalance,
      lossVsBase,
      percentChangeVsBase,
      realValue: t.result.inflationAdjustedValue,
      goalReached,
      shortfallVsGoal,
      survivesDrawdown,
    };
  });
}

/**
 * Generates Auditable CSV Content
 */
export function generateCsvReport(result: ProjectionResult, currencySymbol = "$"): string {
  const headers = [
    "Period",
    "Year",
    `Opening Balance (${currencySymbol})`,
    `Contributions (${currencySymbol})`,
    `Contribution Escalation (${currencySymbol})`,
    `Gross Growth (${currencySymbol})`,
    `Fees Paid (${currencySymbol})`,
    `Taxes Paid (${currencySymbol})`,
    `Withdrawals (${currencySymbol})`,
    `Closing Balance (${currencySymbol})`,
    `Cumulative Invested (${currencySymbol})`,
    `Cumulative Gains (${currencySymbol})`,
    `Real Purchasing Power (${currencySymbol})`,
  ];

  const rows = result.schedule.map((r) =>
    [
      r.period,
      r.year.toFixed(2),
      r.openingBalance.toFixed(2),
      r.contributions.toFixed(2),
      r.escalationAmount.toFixed(2),
      r.grossGrowth.toFixed(2),
      r.feesPaid.toFixed(2),
      r.taxesPaid.toFixed(2),
      r.withdrawals.toFixed(2),
      r.closingBalance.toFixed(2),
      r.cumulativeInvested.toFixed(2),
      r.cumulativeGains.toFixed(2),
      r.realPurchasingPower.toFixed(2),
    ].join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}
