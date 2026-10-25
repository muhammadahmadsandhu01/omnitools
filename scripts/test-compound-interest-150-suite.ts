/**
 * 150+ Enterprise Grade Verification Suite for Compound Interest Engine
 * Covers:
 * - Deterministic Compounding Invariants (40 tests)
 * - Sub-Period Contribution Timing & Frequencies (30 tests)
 * - Contribution Escalation (% and Fixed) (15 tests)
 * - Advisory / Management Fees and Multi-Account Tax Drag (20 tests)
 * - Milestone Cash Flows (Deposits & Withdrawals) (15 tests)
 * - Retirement Drawdown, Longevity & Depletion (15 tests)
 * - Goal Solvers, Multi-Scenario Comparative & Monte Carlo (20 tests)
 */

import {
  simulateTimeline,
  sanitizeFinancialInputs,
  calculateEffectiveApy,
  calculateFisherRealReturn,
  calculateRuleOf72,
  analyzeGoal,
  generateScenarios,
  runMonteCarloSimulation,
  runStressTests,
  generateCsvReport,
  cleanNumber,
  clamp,
  CompoundingFrequency,
  ContributionFrequency,
} from "../components/tools/compoundInterestEngine";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testId: string, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testId}: ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testId}: ${message}`);
  }
}

function assertClose(actual: number, expected: number, tolerance = 0.05, testId: string, message: string) {
  const diff = Math.abs(actual - expected);
  assert(diff <= tolerance, testId, `${message} (Expected: ${expected.toFixed(2)}, Actual: ${actual.toFixed(2)}, Diff: ${diff.toFixed(4)})`);
}

console.log("=================================================================");
console.log("STARTING 150+ COMPREHENSIVE COMPOUND INTEREST TEST SUITE");
console.log("=================================================================\n");

// -------------------------------------------------------------
// SECTION 1: CORE COMPOUNDING INVARIANTS (40 TESTS)
// -------------------------------------------------------------
console.log("--- SECTION 1: Core Compounding Invariants ---");

// Test 1-5: Zero return / Zero tenure / Zero principal
{
  const res = simulateTimeline({ principal: 0, annualRate: 10, years: 10, contribution: 0 });
  assert(res.futureValue === 0 && res.grossGains === 0, "INV-01", "Zero principal with zero contribution yields $0");
}
{
  const res = simulateTimeline({ principal: 1000, annualRate: 0, years: 1, contribution: 0 });
  assertClose(res.futureValue, 1000, 0.01, "INV-02", "1,000 principal at 0% for 1 year equals 1,000");
}
{
  const res = simulateTimeline({ principal: 1000, annualRate: 10, years: 0, contribution: 0 });
  assertClose(res.futureValue, 1000, 0.01, "INV-03", "Zero duration returns exact initial principal with no interest");
}
{
  const res = simulateTimeline({ principal: 5000, annualRate: 0, years: 5, contribution: 0 });
  assertClose(res.futureValue, 5000, 0.01, "INV-04", "0% return over 5 years preserves principal");
}
{
  const res = simulateTimeline({ principal: 1000, annualRate: 100, years: 1, compoundingFrequency: "annually", contribution: 0 });
  assertClose(res.futureValue, 2000, 0.01, "INV-05", "100% annual return doubles principal in 1 year");
}

// Test 6-15: Compounding Frequency Hierarchy
// For nominal 10% rate, higher frequency must yield higher future value:
// Annually < Semi-annually < Quarterly < Monthly < Daily
{
  const p = 10000;
  const r = 10;
  const y = 5;
  const annual = simulateTimeline({ principal: p, annualRate: r, years: y, compoundingFrequency: "annually", contribution: 0 });
  const semi = simulateTimeline({ principal: p, annualRate: r, years: y, compoundingFrequency: "semi-annually", contribution: 0 });
  const quarterly = simulateTimeline({ principal: p, annualRate: r, years: y, compoundingFrequency: "quarterly", contribution: 0 });
  const monthly = simulateTimeline({ principal: p, annualRate: r, years: y, compoundingFrequency: "monthly", contribution: 0 });
  const daily = simulateTimeline({ principal: p, annualRate: r, years: y, compoundingFrequency: "daily", contribution: 0 });

  assert(semi.futureValue > annual.futureValue, "INV-06", "Semi-annual compounding > Annual compounding");
  assert(quarterly.futureValue > semi.futureValue, "INV-07", "Quarterly compounding > Semi-annual compounding");
  assert(monthly.futureValue > quarterly.futureValue, "INV-08", "Monthly compounding > Quarterly compounding");
  assert(daily.futureValue > monthly.futureValue, "INV-09", "Daily compounding > Monthly compounding");

  assertClose(annual.futureValue, 10000 * Math.pow(1.10, 5), 0.05, "INV-10", "Annual compounding matches (1+r)^t");
  assertClose(semi.futureValue, 10000 * Math.pow(1 + 0.10 / 2, 10), 0.05, "INV-11", "Semi-annual compounding matches (1+r/2)^10");
  assertClose(quarterly.futureValue, 10000 * Math.pow(1 + 0.10 / 4, 20), 0.05, "INV-12", "Quarterly compounding matches (1+r/4)^20");
  assertClose(monthly.futureValue, 10000 * Math.pow(1 + 0.10 / 12, 60), 0.05, "INV-13", "Monthly compounding matches (1+r/12)^60");
  assertClose(daily.futureValue, 10000 * Math.pow(1 + 0.10 / 365, 365 * 5), 0.50, "INV-14", "Daily compounding matches (1+r/365)^1825");
}

// Test 15-25: APY Calculation across Frequencies
{
  assertClose(calculateEffectiveApy(12, "annually"), 12.00, 0.01, "INV-15", "12% APY annual = 12.00%");
  assertClose(calculateEffectiveApy(12, "semi-annually"), 12.36, 0.01, "INV-16", "12% APY semi-annual = 12.36%");
  assertClose(calculateEffectiveApy(12, "quarterly"), 12.55, 0.01, "INV-17", "12% APY quarterly = 12.55%");
  assertClose(calculateEffectiveApy(12, "monthly"), 12.68, 0.01, "INV-18", "12% APY monthly = 12.68%");
  assertClose(calculateEffectiveApy(12, "daily"), 12.75, 0.01, "INV-19", "12% APY daily = 12.75%");
  assert(calculateEffectiveApy(0, "monthly") === 0, "INV-20", "0% APY = 0%");
  assert(calculateEffectiveApy(-100, "monthly") === -100, "INV-21", "-100% APY = -100%");
}

// Test 22-30: Rule of 72 & Doubling Times
{
  assertClose(calculateRuleOf72(6)!, 12.0, 0.01, "INV-22", "Rule of 72 for 6% is 12 years");
  assertClose(calculateRuleOf72(8)!, 9.0, 0.01, "INV-23", "Rule of 72 for 8% is 9 years");
  assertClose(calculateRuleOf72(12)!, 6.0, 0.01, "INV-24", "Rule of 72 for 12% is 6 years");
  assert(calculateRuleOf72(0) === null, "INV-25", "Rule of 72 for 0% returns null");
  assert(calculateRuleOf72(-5) === null, "INV-26", "Rule of 72 for negative return returns null");
}

// Test 27-40: Real Return / Fisher Equation & Purchasing Power
{
  assertClose(calculateFisherRealReturn(10, 3), 6.80, 0.02, "INV-27", "Fisher real return: 10% nom, 3% inf = 6.80%");
  assertClose(calculateFisherRealReturn(7, 2.5), 4.39, 0.02, "INV-28", "Fisher real return: 7% nom, 2.5% inf = 4.39%");
  assertClose(calculateFisherRealReturn(3, 3), 0.00, 0.01, "INV-29", "Fisher real return: 3% nom, 3% inf = 0.00%");
  assertClose(calculateFisherRealReturn(2, 5), -2.86, 0.02, "INV-30", "Fisher real return: 2% nom, 5% inf = -2.86%");

  const inflRes = simulateTimeline({ principal: 10000, annualRate: 8, years: 10, inflationRate: 3, contribution: 0 });
  assert(inflRes.inflationAdjustedValue < inflRes.futureValue, "INV-31", "Real value < Nominal value when inflation > 0");
  assertClose(inflRes.cumulativeInflationLoss, inflRes.futureValue - inflRes.inflationAdjustedValue, 0.01, "INV-32", "Inflation loss equals difference");
  assert(inflRes.schedule[inflRes.schedule.length - 1].realPurchasingPower > 0 || inflRes.inflationAdjustedValue > 0, "INV-33", "Real purchasing power valid");

  // Extreme tenure checks
  const longRes = simulateTimeline({ principal: 1000, annualRate: 5, years: 50, contribution: 0 });
  assert(Number.isFinite(longRes.futureValue), "INV-34", "50-year projection is finite");
  const maxRes = simulateTimeline({ principal: 1000, annualRate: 5, years: 100, contribution: 0 });
  assert(Number.isFinite(maxRes.futureValue), "INV-35", "100-year projection is finite");

  // Negative rates down to -100%
  const neg50 = simulateTimeline({ principal: 1000, annualRate: -50, years: 1, compoundingFrequency: "annually", contribution: 0 });
  assertClose(neg50.futureValue, 500, 0.01, "INV-36", "-50% return halves principal in 1 year");
  const neg100 = simulateTimeline({ principal: 1000, annualRate: -100, years: 1, contribution: 0 });
  assertClose(neg100.futureValue, 0, 0.01, "INV-37", "-100% return eliminates balance");
  const neg150 = simulateTimeline({ principal: 1000, annualRate: -150, years: 1, contribution: 0 });
  assertClose(neg150.futureValue, 0, 0.01, "INV-38", "<-100% rate clamps to 0 with no negative debt");

  // Monotonicity with respect to rate
  const r5 = simulateTimeline({ principal: 1000, annualRate: 5, years: 5, contribution: 100 });
  const r8 = simulateTimeline({ principal: 1000, annualRate: 8, years: 5, contribution: 100 });
  const r10 = simulateTimeline({ principal: 1000, annualRate: 10, years: 5, contribution: 100 });
  assert(r8.futureValue > r5.futureValue, "INV-39", "Higher rate yields higher future value (8% > 5%)");
  assert(r10.futureValue > r8.futureValue, "INV-40", "Higher rate yields higher future value (10% > 8%)");
}

// -------------------------------------------------------------
// SECTION 2: CONTRIBUTION FREQUENCIES & TIMING (30 TESTS)
// -------------------------------------------------------------
console.log("\n--- SECTION 2: Sub-Period Contribution Frequencies & Timing ---");

{
  // Beginning vs End timing invariant: Beginning > End for positive rate
  const frequencies: ContributionFrequency[] = ["weekly", "biweekly", "monthly", "quarterly", "annually"];

  frequencies.forEach((freq, idx) => {
    const endRes = simulateTimeline({
      principal: 1000,
      contribution: 100,
      contributionFrequency: freq,
      contributionTiming: "end",
      annualRate: 8,
      years: 3,
    });
    const begRes = simulateTimeline({
      principal: 1000,
      contribution: 100,
      contributionFrequency: freq,
      contributionTiming: "beginning",
      annualRate: 8,
      years: 3,
    });
    assert(begRes.futureValue > endRes.futureValue, `TIM-0${idx + 1}`, `Beginning timing > End timing for ${freq}`);
  });

  // End vs Beginning with 0% rate: Exactly identical future value and contributions
  frequencies.forEach((freq, idx) => {
    const end0 = simulateTimeline({
      principal: 1000,
      contribution: 100,
      contributionFrequency: freq,
      contributionTiming: "end",
      annualRate: 0,
      years: 2,
    });
    const beg0 = simulateTimeline({
      principal: 1000,
      contribution: 100,
      contributionFrequency: freq,
      contributionTiming: "beginning",
      annualRate: 0,
      years: 2,
    });
    assertClose(beg0.futureValue, end0.futureValue, 0.01, `TIM-0${idx + 6}`, `At 0% rate, beginning === end future value for ${freq}`);
    assertClose(beg0.totalContributions, end0.totalContributions, 0.01, `TIM-0${idx + 11}`, `At 0% rate, total contributions match for ${freq}`);
  });

  // Annual contribution counting
  const monthlyRes = simulateTimeline({ principal: 0, contribution: 100, contributionFrequency: "monthly", years: 1, annualRate: 0 });
  assertClose(monthlyRes.totalContributions, 1200, 0.01, "TIM-16", "Monthly: 12 contributions of $100 = $1,200");

  const quarterlyRes = simulateTimeline({ principal: 0, contribution: 250, contributionFrequency: "quarterly", years: 1, annualRate: 0 });
  assertClose(quarterlyRes.totalContributions, 1000, 0.01, "TIM-17", "Quarterly: 4 contributions of $250 = $1,000");

  const annualContribRes = simulateTimeline({ principal: 0, contribution: 5000, contributionFrequency: "annually", years: 1, annualRate: 0 });
  assertClose(annualContribRes.totalContributions, 5000, 0.01, "TIM-18", "Annually: 1 contribution of $5,000 = $5,000");

  const weeklyRes = simulateTimeline({ principal: 0, contribution: 50, contributionFrequency: "weekly", years: 1, annualRate: 0 });
  assertClose(weeklyRes.totalContributions, 2600, 0.01, "TIM-19", "Weekly: 52 contributions of $50 = $2,600");

  const biweeklyRes = simulateTimeline({ principal: 0, contribution: 100, contributionFrequency: "biweekly", years: 1, annualRate: 0 });
  assertClose(biweeklyRes.totalContributions, 2600, 0.01, "TIM-20", "Biweekly: 26 contributions of $100 = $2,600");

  // Cross-frequency compounding sync (Monthly contrib with Daily/Quarterly/Annual Compounding)
  const mDaily = simulateTimeline({ principal: 1000, contribution: 100, annualRate: 6, years: 2, compoundingFrequency: "daily" });
  const mMonthly = simulateTimeline({ principal: 1000, contribution: 100, annualRate: 6, years: 2, compoundingFrequency: "monthly" });
  const mQuarterly = simulateTimeline({ principal: 1000, contribution: 100, annualRate: 6, years: 2, compoundingFrequency: "quarterly" });
  const mAnnually = simulateTimeline({ principal: 1000, contribution: 100, annualRate: 6, years: 2, compoundingFrequency: "annually" });

  assert(mDaily.futureValue > mMonthly.futureValue, "TIM-21", "Daily compounding > Monthly compounding with monthly contrib");
  assert(mMonthly.futureValue > mQuarterly.futureValue, "TIM-22", "Monthly compounding > Quarterly compounding with monthly contrib");
  assert(mQuarterly.futureValue > mAnnually.futureValue, "TIM-23", "Quarterly compounding > Annually compounding with monthly contrib");

  // Partial years and high periods
  const halfYear = simulateTimeline({ principal: 1000, contribution: 100, annualRate: 12, years: 0.5, contributionTiming: "end" });
  assertClose(halfYear.totalContributions, 600, 0.01, "TIM-24", "0.5 years has 6 monthly contributions = $600");

  // Timing check at duration 5 years
  const fiveEnd = simulateTimeline({ principal: 0, contribution: 200, annualRate: 10, years: 5, contributionTiming: "end" });
  const fiveBeg = simulateTimeline({ principal: 0, contribution: 200, annualRate: 10, years: 5, contributionTiming: "beginning" });
  assert(fiveBeg.futureValue > fiveEnd.futureValue, "TIM-25", "5-year beginning > end");
  assertClose(fiveBeg.totalContributions, fiveEnd.totalContributions, 0.01, "TIM-26", "Contributions identical regardless of timing");

  // Invariant: Total Invested = Initial + Total Contributions + Deposits - Withdrawals
  assertClose(fiveEnd.totalInvested, fiveEnd.initialInvestment + fiveEnd.totalContributions, 0.01, "TIM-27", "Total invested invariant holds");
  assertClose(fiveEnd.grossGains, fiveEnd.futureValue - fiveEnd.totalInvested, 0.01, "TIM-28", "Gross gains invariant holds");
  assert(fiveEnd.schedule.length === 6, "TIM-29", "5-year schedule has 6 rows (year 0 to 5)");
  assert(fiveEnd.schedule[5].closingBalance === fiveEnd.futureValue, "TIM-30", "Schedule closing balance matches futureValue");
}

// -------------------------------------------------------------
// SECTION 3: CONTRIBUTION ESCALATION (% AND FIXED) (15 TESTS)
// -------------------------------------------------------------
console.log("\n--- SECTION 3: Contribution Escalation (% and Fixed) ---");

{
  // 10% annual escalation over 2 years at 0% return
  const esc10 = simulateTimeline({
    principal: 0,
    contribution: 100,
    contributionFrequency: "monthly",
    contributionEscalationPercent: 10,
    years: 2,
    annualRate: 0,
  });
  assertClose(esc10.totalContributions, 2520, 0.01, "ESC-01", "10% escalation over 2 years = $2,520 ($1,200 + $1,320)");
  assertClose(esc10.futureValue, 2520, 0.01, "ESC-02", "Ending balance matches contributions at 0%");

  // 5% annual escalation over 3 years at 0% return
  // Yr 1: 12 * 100 = 1200
  // Yr 2: 12 * 105 = 1260
  // Yr 3: 12 * 110.25 = 1323
  // Total = 3783
  const esc5 = simulateTimeline({
    principal: 0,
    contribution: 100,
    contributionFrequency: "monthly",
    contributionEscalationPercent: 5,
    years: 3,
    annualRate: 0,
  });
  assertClose(esc5.totalContributions, 3783, 0.01, "ESC-03", "5% escalation over 3 years = $3,783");

  // Fixed escalation: +$20/mo each year
  // Yr 1: 12 * 100 = 1200
  // Yr 2: 12 * 120 = 1440
  // Yr 3: 12 * 140 = 1680
  // Total = 4320
  const fixedEsc = simulateTimeline({
    principal: 0,
    contribution: 100,
    contributionFrequency: "monthly",
    contributionEscalationFixed: 20,
    years: 3,
    annualRate: 0,
  });
  assertClose(fixedEsc.totalContributions, 4320, 0.01, "ESC-04", "+$20/yr fixed escalation over 3 years = $4,320");

  // Both % and fixed escalation combined
  const combEsc = simulateTimeline({
    principal: 0,
    contribution: 100,
    contributionFrequency: "monthly",
    contributionEscalationPercent: 10,
    contributionEscalationFixed: 10,
    years: 2,
    annualRate: 0,
  });
  // Yr 1: 100 * 12 = 1200
  // Yr 2: (100 * 1.10 + 10) * 12 = 120 * 12 = 1440
  // Total = 2640
  assertClose(combEsc.totalContributions, 2640, 0.01, "ESC-05", "Combined % and fixed escalation = $2,640");

  // Escalation with growth
  const escWithGrowth = simulateTimeline({
    principal: 1000,
    contribution: 100,
    contributionEscalationPercent: 5,
    annualRate: 8,
    years: 5,
  });
  const noEscWithGrowth = simulateTimeline({
    principal: 1000,
    contribution: 100,
    contributionEscalationPercent: 0,
    annualRate: 8,
    years: 5,
  });
  assert(escWithGrowth.futureValue > noEscWithGrowth.futureValue, "ESC-06", "Escalated savings yields higher future value");
  assert(escWithGrowth.totalContributions > noEscWithGrowth.totalContributions, "ESC-07", "Escalated total contributions higher");

  // Negative escalation (gradual reduction in savings)
  const negEsc = simulateTimeline({
    principal: 0,
    contribution: 100,
    contributionEscalationPercent: -10,
    years: 2,
    annualRate: 0,
  });
  // Yr 1: 1200, Yr 2: 12 * 90 = 1080. Total = 2280
  assertClose(negEsc.totalContributions, 2280, 0.01, "ESC-08", "-10% escalation over 2 years = $2,280");

  // Escalation tracking in schedule rows
  assertClose(esc10.schedule[1].contributions, 1200, 0.01, "ESC-09", "Year 1 schedule contribution is $1,200");
  assertClose(esc10.schedule[2].contributions, 1320, 0.01, "ESC-10", "Year 2 schedule contribution is $1,320");
  assertClose(esc10.schedule[2].escalationAmount, 120, 0.01, "ESC-11", "Year 2 schedule tracks escalation delta of $120");

  // Escalation boundary checks
  const escZeroYear = simulateTimeline({ principal: 1000, contribution: 100, contributionEscalationPercent: 10, years: 0 });
  assert(escZeroYear.totalContributions === 0, "ESC-12", "0 duration with escalation yields 0 contributions");
  const escHighYear = simulateTimeline({ principal: 1000, contribution: 100, contributionEscalationPercent: 2, years: 20 });
  assert(Number.isFinite(escHighYear.futureValue), "ESC-13", "20-year escalation is finite");
  assert(escHighYear.schedule.length === 21, "ESC-14", "20-year schedule has 21 rows");
  assert(escHighYear.futureValue > escHighYear.totalInvested, "ESC-15", "Net gains positive on positive return with escalation");
}

// -------------------------------------------------------------
// SECTION 4: MANAGEMENT FEES AND TAX DRAG (20 TESTS)
// -------------------------------------------------------------
console.log("\n--- SECTION 4: Management Fees and Tax Drag ---");

{
  // 1% annual fee on $1,000 at 10% annual return for 1 year
  // Gross growth = $100. Fee = 1% of $1,000 = $10. Ending = $1,090.00
  const fee1 = simulateTimeline({
    principal: 1000,
    annualRate: 10,
    annualFeeRate: 1.0,
    years: 1,
    compoundingFrequency: "annually",
    contribution: 0,
  });
  assertClose(fee1.futureValue, 1090.00, 0.01, "FEE-01", "1% annual fee reduces 10% return from $1,100 to $1,090");
  assertClose(fee1.totalFeesPaid, 10.00, 0.50, "FEE-02", "Total fees paid equals ~$10.00");

  // Fixed annual fee
  const fixedFee = simulateTimeline({
    principal: 10000,
    annualRate: 5,
    fixedAnnualFee: 50,
    years: 1,
    compoundingFrequency: "annually",
    contribution: 0,
  });
  // 10000 * 1.05 = 10500 - 50 = 10450
  assertClose(fixedFee.futureValue, 10450, 0.01, "FEE-03", "$50 fixed annual fee deducted accurately");
  assertClose(fixedFee.totalFeesPaid, 50, 0.01, "FEE-04", "Total fixed fee equals $50.00");

  // Combined % fee and fixed fee
  const combFee = simulateTimeline({
    principal: 10000,
    annualRate: 5,
    annualFeeRate: 1.0,
    fixedAnnualFee: 50,
    years: 1,
    compoundingFrequency: "annually",
    contribution: 0,
  });
  // 10000 * 1.05 = 10500 - (100 + 50) = 10350
  assertClose(combFee.futureValue, 10350, 0.01, "FEE-05", "Combined % and fixed fee deducted accurately");

  // Taxable Account: 20% tax on gains
  // $1,000 at 10% return for 1 year: gain is $100, tax 20% is $20, after-tax = $1,080.00
  const tax20 = simulateTimeline({
    principal: 1000,
    annualRate: 10,
    taxRate: 20,
    taxTreatment: "taxable",
    years: 1,
    compoundingFrequency: "annually",
    contribution: 0,
  });
  assertClose(tax20.futureValue, 1080.00, 0.01, "TAX-01", "Taxable account: 20% tax on $100 gain yields $1,080.00");
  assertClose(tax20.totalTaxesPaid, 20.00, 0.01, "TAX-02", "Taxable account: total taxes paid = $20.00");

  // Tax-Deferred Account: Pre-tax future value is $1,100.00, afterTaxFutureValue is $1,080.00
  const taxDef = simulateTimeline({
    principal: 1000,
    annualRate: 10,
    taxRate: 20,
    taxTreatment: "deferred",
    years: 1,
    compoundingFrequency: "annually",
    contribution: 0,
  });
  assertClose(taxDef.futureValue, 1100.00, 0.01, "TAX-03", "Deferred account: pre-tax future value is $1,100.00");
  assertClose(taxDef.afterTaxFutureValue, 1080.00, 0.01, "TAX-04", "Deferred account: after-tax future value is $1,080.00");
  assertClose(taxDef.totalTaxesPaid, 20.00, 0.01, "TAX-05", "Deferred account: total taxes paid is $20.00");

  // Tax-Exempt Account: 0 tax
  const taxEx = simulateTimeline({
    principal: 1000,
    annualRate: 10,
    taxRate: 20,
    taxTreatment: "exempt",
    years: 1,
    compoundingFrequency: "annually",
    contribution: 0,
  });
  assertClose(taxEx.futureValue, 1100.00, 0.01, "TAX-06", "Exempt account: future value is $1,100.00");
  assertClose(taxEx.afterTaxFutureValue, 1100.00, 0.01, "TAX-07", "Exempt account: after-tax value is $1,100.00");
  assertClose(taxEx.totalTaxesPaid, 0.00, 0.01, "TAX-08", "Exempt account: total taxes paid is $0.00");

  // Multi-year compounding drag comparison: Exempt > Deferred > Taxable
  const myEx = simulateTimeline({ principal: 10000, annualRate: 8, years: 10, taxRate: 25, taxTreatment: "exempt", contribution: 100 });
  const myDef = simulateTimeline({ principal: 10000, annualRate: 8, years: 10, taxRate: 25, taxTreatment: "deferred", contribution: 100 });
  const myTax = simulateTimeline({ principal: 10000, annualRate: 8, years: 10, taxRate: 25, taxTreatment: "taxable", contribution: 100 });

  assert(myEx.afterTaxFutureValue > myDef.afterTaxFutureValue, "TAX-09", "Exempt after-tax > Deferred after-tax");
  assert(myDef.afterTaxFutureValue > myTax.afterTaxFutureValue, "TAX-10", "Deferred after-tax > Taxable after-tax (benefit of tax-deferred compounding)");
  assert(myDef.futureValue > myTax.futureValue, "TAX-11", "Pre-tax deferred future value > Taxable future value");

  // Combined Fee and Tax Drag
  const zeroDragBaseline = simulateTimeline({
    principal: 10000,
    annualRate: 8,
    years: 5,
    contribution: 100,
  });
  const feeAndTax = simulateTimeline({
    principal: 10000,
    annualRate: 8,
    annualFeeRate: 1.0,
    taxRate: 20,
    taxTreatment: "taxable",
    years: 5,
    contribution: 100,
  });
  assert(feeAndTax.totalFeesPaid > 0, "FEE-06", "Total fees tracked in combined simulation");
  assert(feeAndTax.totalTaxesPaid > 0, "TAX-12", "Total taxes tracked in combined simulation");
  assert(feeAndTax.futureValue < zeroDragBaseline.futureValue, "TAX-13", "Fee and tax drag strictly lower than zero drag");

  // Zero tax rate in taxable account
  const taxZero = simulateTimeline({ principal: 1000, annualRate: 10, taxRate: 0, taxTreatment: "taxable", years: 1 });
  assertClose(taxZero.totalTaxesPaid, 0, 0.01, "TAX-14", "0% tax rate pays zero tax");
  assertClose(taxZero.afterTaxFutureValue, taxZero.futureValue, 0.01, "TAX-15", "0% tax rate after-tax equals future value");
}

// -------------------------------------------------------------
// SECTION 5: MILESTONE CASH FLOWS (15 TESTS)
// -------------------------------------------------------------
console.log("\n--- SECTION 5: Milestone Cash Flows (Deposits & Withdrawals) ---");

{
  // 0% return, 2 years, $500 milestone deposit at year 1 end, $1,000 initial
  const ms1 = simulateTimeline({
    principal: 1000,
    annualRate: 0,
    years: 2,
    contribution: 0,
    oneTimeEvents: [
      { id: "e1", year: 1, amount: 500, type: "deposit", description: "Inheritance" },
    ],
  });
  assertClose(ms1.futureValue, 1500.00, 0.01, "MS-01", "$500 milestone deposit at Yr 1 yields $1,500 at 0%");
  assertClose(ms1.totalOneTimeDeposits, 500.00, 0.01, "MS-02", "Total one-time deposits tracked as $500");

  // Milestone deposit timing with positive return: Start (Yr 0) vs End (Yr 1)
  const msBeg = simulateTimeline({
    principal: 1000,
    annualRate: 10,
    years: 2,
    compoundingFrequency: "annually",
    contribution: 0,
    oneTimeEvents: [{ id: "e-beg", year: 0.1, amount: 500, type: "deposit" }],
  });
  const msEnd = simulateTimeline({
    principal: 1000,
    annualRate: 10,
    years: 2,
    compoundingFrequency: "annually",
    contribution: 0,
    oneTimeEvents: [{ id: "e-end", year: 1.0, amount: 500, type: "deposit" }],
  });
  assert(msBeg.futureValue > msEnd.futureValue, "MS-03", "Earlier milestone deposit compounds longer and yields more");

  // Milestone withdrawal
  const msWith = simulateTimeline({
    principal: 2000,
    annualRate: 0,
    years: 2,
    contribution: 0,
    oneTimeEvents: [{ id: "w1", year: 1, amount: 500, type: "withdrawal", description: "Car down payment" }],
  });
  assertClose(msWith.futureValue, 1500.00, 0.01, "MS-04", "$500 milestone withdrawal reduces balance to $1,500");
  assertClose(msWith.totalOneTimeWithdrawals, 500.00, 0.01, "MS-05", "Total one-time withdrawals tracked as $500");

  // Multiple milestone events (2 deposits, 1 withdrawal)
  const msMulti = simulateTimeline({
    principal: 1000,
    annualRate: 0,
    years: 3,
    contribution: 0,
    oneTimeEvents: [
      { id: "d1", year: 1, amount: 1000, type: "deposit" },
      { id: "w1", year: 2, amount: 500, type: "withdrawal" },
      { id: "d2", year: 2.5, amount: 300, type: "deposit" },
    ],
  });
  // 1000 + 1000 - 500 + 300 = 1800
  assertClose(msMulti.futureValue, 1800.00, 0.01, "MS-06", "Multiple milestones calculated accurately: $1,800");
  assertClose(msMulti.totalOneTimeDeposits, 1300.00, 0.01, "MS-07", "Total milestone deposits: $1,300");
  assertClose(msMulti.totalOneTimeWithdrawals, 500.00, 0.01, "MS-08", "Total milestone withdrawals: $500");

  // Milestone exceeding balance clamps to available balance
  const msExcess = simulateTimeline({
    principal: 1000,
    annualRate: 0,
    years: 2,
    contribution: 0,
    oneTimeEvents: [{ id: "w-huge", year: 1, amount: 5000, type: "withdrawal" }],
  });
  assertClose(msExcess.futureValue, 0.00, 0.01, "MS-09", "Excess milestone withdrawal drains balance to $0 with no negative debt");
  assertClose(msExcess.totalOneTimeWithdrawals, 1000.00, 0.01, "MS-10", "Actual withdrawal clamped to available $1,000");

  // Milestone event in schedule rows
  assert(msMulti.schedule[1].closingBalance >= 2000, "MS-11", "Year 1 schedule reflects Year 1 deposit");
  assert(msMulti.schedule[2].withdrawals >= 500, "MS-12", "Year 2 schedule reflects Year 2 withdrawal");

  // Edge milestones
  const msAtStart = simulateTimeline({
    principal: 1000,
    annualRate: 0,
    years: 1,
    contribution: 0,
    oneTimeEvents: [{ id: "start", year: 0.1, amount: 200, type: "deposit" }],
  });
  assertClose(msAtStart.futureValue, 1200, 0.01, "MS-13", "Milestone at tenure start processed correctly");

  const msAtEnd = simulateTimeline({
    principal: 1000,
    annualRate: 0,
    years: 1,
    contribution: 0,
    oneTimeEvents: [{ id: "end", year: 1.0, amount: 200, type: "deposit" }],
  });
  assertClose(msAtEnd.futureValue, 1200, 0.01, "MS-14", "Milestone at tenure end processed correctly");

  // Deleting milestone event restores baseline
  const baseline = simulateTimeline({ principal: 1000, annualRate: 5, years: 3, contribution: 50 });
  const withEvent = simulateTimeline({ principal: 1000, annualRate: 5, years: 3, contribution: 50, oneTimeEvents: [{ id: "e", year: 1, amount: 500, type: "deposit" }] });
  const afterDelete = simulateTimeline({ principal: 1000, annualRate: 5, years: 3, contribution: 50, oneTimeEvents: [] });
  assert(withEvent.futureValue > baseline.futureValue, "MS-15a", "With event > baseline");
  assertClose(afterDelete.futureValue, baseline.futureValue, 0.01, "MS-15", "Deleting event restores exact baseline");
}

// -------------------------------------------------------------
// SECTION 6: RETIREMENT DRAWDOWN & LONGEVITY (15 TESTS)
// -------------------------------------------------------------
console.log("\n--- SECTION 6: Retirement Drawdown & Longevity ---");

{
  // RET-01: $10,000 initial, 0% return, $100/mo withdrawal, 12 months = $8,800
  const ret01 = simulateTimeline({
    principal: 10000,
    annualRate: 0,
    years: 1,
    contribution: 0,
    drawdownEnabled: true,
    accumulationYears: 0,
    withdrawalAmount: 100,
    withdrawalFrequency: "monthly",
  });
  assertClose(ret01.futureValue, 8800.00, 0.01, "RET-T01", "$10k initial with $100/mo withdrawal over 12 months = $8,800.00");
  assertClose(ret01.schedule[1].withdrawals, 1200.00, 0.01, "RET-T02", "Total withdrawals in Year 1 = $1,200.00");

  // RET-02: $1,000 initial, 0% return, $100/mo contrib for 12 mos, then $200/mo withdrawal for 6 mos
  const ret02 = simulateTimeline({
    principal: 1000,
    annualRate: 0,
    years: 1.5,
    contribution: 100,
    contributionFrequency: "monthly",
    drawdownEnabled: true,
    accumulationYears: 1.0,
    withdrawalAmount: 200,
    withdrawalFrequency: "monthly",
  });
  assertClose(ret02.futureValue, 1000.00, 0.01, "RET-T03", "Accumulate to $2,200 then withdraw 6x$200 leaves $1,000.00");
  assertClose(ret02.totalContributions, 1200.00, 0.01, "RET-T04", "Total contributions in accumulation = $1,200.00");

  // Zero withdrawal amount during drawdown
  const retZero = simulateTimeline({
    principal: 10000,
    annualRate: 5,
    years: 2,
    contribution: 0,
    drawdownEnabled: true,
    accumulationYears: 1.0,
    withdrawalAmount: 0,
  });
  const normalGrowth = simulateTimeline({ principal: 10000, annualRate: 5, years: 2, contribution: 0 });
  assertClose(retZero.futureValue, normalGrowth.futureValue, 0.01, "RET-T05", "$0 withdrawal preserves pure compound growth");

  // Depletion / Unsustainable portfolio detection
  const retDepleted = simulateTimeline({
    principal: 1000,
    annualRate: 0,
    years: 5,
    contribution: 0,
    drawdownEnabled: true,
    accumulationYears: 0,
    withdrawalAmount: 200, // drains in 5 months
    withdrawalFrequency: "monthly",
  });
  assert(retDepleted.isDepleted === true, "RET-T06", "Depletion flagged as true when funds exhausted");
  assert(retDepleted.futureValue === 0, "RET-T07", "Depleted ending future value is exactly 0");
  assert(retDepleted.depletedYear !== null && retDepleted.depletedYear <= 1.0, "RET-T08", "Depleted year identified in year 1");

  // Sustainable portfolio (4% safe withdrawal rule)
  const retSustains = simulateTimeline({
    principal: 1000000,
    annualRate: 7,
    years: 20,
    contribution: 0,
    drawdownEnabled: true,
    accumulationYears: 0,
    withdrawalAmount: 3000, // $36k/yr on $1M at 7%
    withdrawalFrequency: "monthly",
  });
  assert(retSustains.isDepleted === false, "RET-T09", "Conservative withdrawal sustains through 20 years");
  assert(retSustains.futureValue > 1000000, "RET-T10", "Portfolio balance grows under 7% return with 3.6% withdrawal");

  // Inflation-adjusted withdrawals
  const retFixedWith = simulateTimeline({
    principal: 500000,
    annualRate: 5,
    years: 10,
    drawdownEnabled: true,
    accumulationYears: 0,
    withdrawalAmount: 2000,
    withdrawalInflationAdjusted: false,
    inflationRate: 3,
  });
  const retInflWith = simulateTimeline({
    principal: 500000,
    annualRate: 5,
    years: 10,
    drawdownEnabled: true,
    accumulationYears: 0,
    withdrawalAmount: 2000,
    withdrawalInflationAdjusted: true,
    inflationRate: 3,
  });
  assert(retInflWith.futureValue < retFixedWith.futureValue, "RET-T11", "Inflation-adjusted withdrawals consume more capital");

  // Percentage-based withdrawals
  const retPct = simulateTimeline({
    principal: 100000,
    annualRate: 5,
    years: 5,
    drawdownEnabled: true,
    accumulationYears: 0,
    withdrawalAmount: 4, // 4% annually
    withdrawalType: "percentage",
  });
  assert(retPct.futureValue > 0, "RET-T12", "Percentage withdrawal never causes premature negative balance");

  // Schedule row verification for drawdown
  assert(ret01.schedule[1].withdrawals === 1200, "RET-T13", "Schedule row tracks exact annual withdrawals");
  assert(ret01.schedule[1].closingBalance === 8800, "RET-T14", "Schedule closing balance = opening - withdrawals");
  assert(ret01.schedule[1].openingBalance === 10000, "RET-T15", "Schedule opening balance matches initial");
}

// -------------------------------------------------------------
// SECTION 7: GOAL SOLVERS, MULTI-SCENARIO & MONTE CARLO (20 TESTS)
// -------------------------------------------------------------
console.log("\n--- SECTION 7: Solvers, Multi-Scenario & Monte Carlo ---");

{
  // PLAN-04 & PLAN-05: Target $2,500 with CALC-06 inputs ($1,000 init, 12% rate, $100/mo, 12 mos)
  const calc06Inputs = {
    principal: 1000,
    annualRate: 12,
    compoundingFrequency: "monthly" as CompoundingFrequency,
    contribution: 100,
    contributionFrequency: "monthly" as ContributionFrequency,
    contributionTiming: "end" as const,
    years: 1,
  };
  const goalRes = analyzeGoal(2500, calc06Inputs);
  assertClose(goalRes.gapOrSurplus, 104.92, 0.05, "SOLV-01", "Target shortfall is $104.92 on $2,500 target");
  assert(goalRes.status === "shortfall", "SOLV-02", "Status is 'shortfall' when below target");
  assertClose(goalRes.requiredContribution!, 108.28, 0.02, "SOLV-03", "Required contribution rounds up to $108.28/mo");

  // Goal exactly achieved boundary (PLAN-07)
  const calc06Result = simulateTimeline(calc06Inputs);
  const exactGoal = analyzeGoal(calc06Result.futureValue, calc06Inputs);
  assert(exactGoal.status === "achieved", "SOLV-04", "Status is 'achieved' when target matches futureValue exactly");
  assertClose(exactGoal.gapOrSurplus, 0.00, 0.001, "SOLV-05", "Shortfall is $0.00 on exact boundary");

  // Goal exceeded
  const lowGoal = analyzeGoal(1500, calc06Inputs);
  assert(lowGoal.status === "achieved", "SOLV-06", "Status is 'achieved' when goal < futureValue");
  assert(lowGoal.requiredContribution === 0, "SOLV-07", "Required contribution is 0 when already funded");

  // Unreachable goal (PLAN-06)
  const unreachGoal = analyzeGoal(1e9, { principal: 100, annualRate: -100, years: 1, contribution: 0 });
  assert(unreachGoal.status === "shortfall", "SOLV-08", "Unreachable goal flagged as shortfall");

  // Multi-Scenario Planning (PLAN-02 & PLAN-03)
  const scRows = generateScenarios(calc06Inputs, 2, 2500);
  assert(scRows.length === 3, "SCEN-01", "Generates 3 scenarios: Conservative, Base, Optimistic");
  assert(scRows[0].rate < scRows[1].rate, "SCEN-02", "Conservative rate < Base rate");
  assert(scRows[2].rate > scRows[1].rate, "SCEN-03", "Optimistic rate > Base rate");
  assert(scRows[0].futureValue <= scRows[1].futureValue, "SCEN-04", "Conservative FV <= Base FV");
  assert(scRows[1].futureValue <= scRows[2].futureValue, "SCEN-05", "Base FV <= Optimistic FV");

  // 0% Spread makes all scenarios identical (PLAN-03)
  const zeroSpreadRows = generateScenarios(calc06Inputs, 0, 2500);
  assertClose(zeroSpreadRows[0].futureValue, zeroSpreadRows[1].futureValue, 0.01, "SCEN-06", "0% spread: Conservative FV === Base FV");
  assertClose(zeroSpreadRows[1].futureValue, zeroSpreadRows[2].futureValue, 0.01, "SCEN-07", "0% spread: Base FV === Optimistic FV");

  // Monte Carlo Simulation Determinism & Bounds (UI-05 & UI-06)
  const mc1 = runMonteCarloSimulation({ baseInputs: calc06Inputs, simulationCount: 100, seed: 1337 });
  const mc2 = runMonteCarloSimulation({ baseInputs: calc06Inputs, simulationCount: 100, seed: 1337 });
  assert(mc1.medianEndingValue === mc2.medianEndingValue, "MC-01", "Monte Carlo is 100% reproducible with fixed seed");
  assert(mc1.p10EndingValue <= mc1.p50EndingValue, "MC-02", "P10 <= P50 in Monte Carlo distribution");
  assert(mc1.p50EndingValue <= mc1.p90EndingValue, "MC-03", "P50 <= P90 in Monte Carlo distribution");
  assert(mc1.probabilityOfGoalSuccess >= 0 && mc1.probabilityOfGoalSuccess <= 100, "MC-04", "Goal probability within 0-100%");
  assert(mc1.paths.length === 2, "MC-05", "1-year MC path has 2 points (yr 0 and 1)");

  // Pre-configured Stress Tests (UI-07)
  const stress = runStressTests(calc06Inputs, 2500);
  assert(stress.length === 5, "STR-01", "Runs 5 pre-configured stress scenarios");
  assert(stress[0].id === "early-crash", "STR-02", "Includes early market crash stress test");
  assert(stress[0].endingBalance <= calc06Result.futureValue, "STR-03", "Early crash produces lower balance than base plan");

  // CSV Generation (UI-02 / Reports)
  const csv = generateCsvReport(calc06Result, "$");
  assert(csv.includes("Opening Balance ($)"), "CSV-01", "CSV contains standard headers");
  assert(csv.split("\n").length === calc06Result.schedule.length + 1, "CSV-02", "CSV contains all schedule rows plus header");
}

console.log("\n=================================================================");
console.log(`150+ TEST SUITE RESULTS: ${passedTests} PASSED, ${failedTests} FAILED out of ${totalTests} TOTAL`);
console.log("=================================================================");

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log("ALL 150+ ENGINE TESTS PASSED WITH 100% ACCURACY!");
}
