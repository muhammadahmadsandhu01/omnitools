import assert from 'node:assert/strict';
import {
  projectInvestment,
  solveGoalContribution,
  runMonteCarloSimulations,
  formatCurrency,
  formatPercent,
  sanitizeCsvCell,
  csvCell,
  safeNumber,
  clamp,
  getCurrencyMeta,
  WORLD_CURRENCIES,
  ISO_ACTIVE_CURRENCIES,
  generateCsvReport,
  generateReportHtml,
} from '../components/tools/SipCalculator';

console.log('=================================================================');
console.log('KIVAROTOOLS SIP CALCULATOR 150+ COMPREHENSIVE REGRESSION SUITE');
console.log('=================================================================\n');

let passCount = 0;
let failCount = 0;

function assertClose(actual: number, expected: number, tolerance = 0.01, testId = '', desc = '') {
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    passCount++;
    console.log(`  [PASS] ${testId}: ${desc} (Expected: ${expected.toFixed(2)}, Actual: ${actual.toFixed(2)}, Diff: ${diff.toFixed(4)})`);
  } else {
    failCount++;
    console.error(`  [FAIL] ${testId}: ${desc} (Expected: ${expected.toFixed(2)}, Actual: ${actual.toFixed(2)}, Diff: ${diff.toFixed(4)})`);
    throw new Error(`Assertion failed for ${testId}: Expected ~${expected}, got ${actual} (diff: ${diff})`);
  }
}

function assertTrue(condition: boolean, testId = '', desc = '') {
  if (condition) {
    passCount++;
    console.log(`  [PASS] ${testId}: ${desc}`);
  } else {
    failCount++;
    console.error(`  [FAIL] ${testId}: ${desc}`);
    throw new Error(`Assertion failed for ${testId}: expected condition to be true`);
  }
}

// =================================================================
// SECTION 1: CANONICAL MATHEMATICAL INVARIANTS & COMPOUNDING (35 tests)
// =================================================================
console.log('\n--- SECTION 1: Canonical Mathematical Invariants & Compounding ---');

// 1. Zero return rates
const z1 = projectInvestment({ mode: 'lumpsum', initialInvestment: 1000, annualRate: 0, years: 1 });
assertClose(z1.futureValue, 1000, 0.001, 'INV-01', 'Lump sum 0% return 1 yr preserves principal');
assertClose(z1.netGain, 0, 0.001, 'INV-02', 'Lump sum 0% return yields zero gain');

const z2 = projectInvestment({ mode: 'lumpsum', initialInvestment: 5000, annualRate: 0, years: 10 });
assertClose(z2.futureValue, 5000, 0.001, 'INV-03', 'Lump sum 0% return 10 yrs preserves principal');

const z3 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 0, years: 1, frequency: 'monthly' });
assertClose(z3.futureValue, 1200, 0.001, 'INV-04', 'Monthly SIP 0% return 1 yr equals 12 * $100');
assertClose(z3.totalInvested, 1200, 0.001, 'INV-05', 'Total invested is $1,200');

const z4 = projectInvestment({ mode: 'sip', recurringContribution: 250, annualRate: 0, years: 1, frequency: 'quarterly' });
assertClose(z4.futureValue, 1000, 0.001, 'INV-06', 'Quarterly SIP 0% return 1 yr equals 4 * $250');

const z5 = projectInvestment({ mode: 'sip', recurringContribution: 1000, annualRate: 0, years: 5, frequency: 'yearly' });
assertClose(z5.futureValue, 5000, 0.001, 'INV-07', 'Yearly SIP 0% return 5 yrs equals 5 * $1,000');

// 2. Standard Lump Sum Compounding FV = P * (1 + r)^t
const ls1 = projectInvestment({ mode: 'lumpsum', initialInvestment: 1000, annualRate: 10, years: 1, frequency: 'yearly' });
assertClose(ls1.futureValue, 1100, 0.001, 'INV-08', 'Lump sum 10% 1 yr = $1,100.00');

const ls2 = projectInvestment({ mode: 'lumpsum', initialInvestment: 1000, annualRate: 10, years: 2, frequency: 'yearly' });
assertClose(ls2.futureValue, 1210, 0.001, 'INV-09', 'Lump sum 10% 2 yrs = $1,210.00');

const ls3 = projectInvestment({ mode: 'lumpsum', initialInvestment: 1000, annualRate: 10, years: 3, frequency: 'yearly' });
assertClose(ls3.futureValue, 1331, 0.001, 'INV-10', 'Lump sum 10% 3 yrs = $1,331.00');

const ls4 = projectInvestment({ mode: 'lumpsum', initialInvestment: 10000, annualRate: 7, years: 10, frequency: 'yearly' });
assertClose(ls4.futureValue, 10000 * Math.pow(1.07, 10), 0.01, 'INV-11', 'Lump sum 7% 10 yrs matches compound interest');

// 3. Standard SIP Annuity Due vs Ordinary Annuity
// P = $100/mo, 12 mos, 12% p.a.
// Monthly rate i = 0.01.
// Ordinary annuity: 100 * ((1.01^12 - 1) / 0.01) = 1,268.2503
// Annuity due: 1,268.2503 * 1.01 = 1,280.9328
const sipEnd = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 12, years: 1, frequency: 'monthly', contributionTiming: 'end' });
assertClose(sipEnd.futureValue, 1268.25, 0.01, 'INV-12', 'SIP Ordinary Annuity 12% 1 yr = $1,268.25');

const sipBeg = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 12, years: 1, frequency: 'monthly', contributionTiming: 'beginning' });
assertClose(sipBeg.futureValue, 1280.93, 0.01, 'INV-13', 'SIP Annuity Due 12% 1 yr = $1,280.93');

assertTrue(sipBeg.futureValue > sipEnd.futureValue, 'INV-14', 'Beginning-of-period strictly exceeds end-of-period');
assertClose(sipBeg.futureValue / sipEnd.futureValue, 1.01, 0.001, 'INV-15', 'Ratio of beginning to end is exactly (1 + i)');

// 4. Quarterly Annuities
// P = $300/qtr, 4 qtrs, 8% p.a. -> i = 0.02
const qEnd = projectInvestment({ mode: 'sip', recurringContribution: 300, annualRate: 8, years: 1, frequency: 'quarterly', contributionTiming: 'end' });
const expectedQEnd = 300 * ((Math.pow(1.02, 4) - 1) / 0.02);
assertClose(qEnd.futureValue, expectedQEnd, 0.01, 'INV-16', 'Quarterly ordinary annuity matches formula');

const qBeg = projectInvestment({ mode: 'sip', recurringContribution: 300, annualRate: 8, years: 1, frequency: 'quarterly', contributionTiming: 'beginning' });
assertClose(qBeg.futureValue, expectedQEnd * 1.02, 0.01, 'INV-17', 'Quarterly annuity due matches formula');

// 5. Yearly Annuities
const yEnd = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 10, years: 2, frequency: 'yearly', contributionTiming: 'end' });
assertClose(yEnd.futureValue, 210, 0.01, 'INV-18', 'Yearly ordinary annuity 2 yrs 10% = $210');

const yBeg = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 10, years: 2, frequency: 'yearly', contributionTiming: 'beginning' });
assertClose(yBeg.futureValue, 231, 0.01, 'INV-19', 'Yearly annuity due 2 yrs 10% = $231');

// 6. Multi-year SIP (10 years @ 12% p.a., monthly)
const sip10y = projectInvestment({ mode: 'sip', recurringContribution: 500, annualRate: 12, years: 10, frequency: 'monthly', contributionTiming: 'beginning' });
const oracle10y = 500 * ((Math.pow(1.01, 120) - 1) / 0.01) * 1.01;
assertClose(sip10y.futureValue, oracle10y, 0.01, 'INV-20', '10-year monthly SIP matches oracle ($116,169.54)');
assertClose(sip10y.totalInvested, 60000, 0.01, 'INV-21', 'Total invested across 10 years is $60,000');
assertClose(sip10y.netGain, oracle10y - 60000, 0.01, 'INV-22', 'Net gain equals FV - invested');

// 7. Combined Initial Lump Sum + Monthly SIP
const comb = projectInvestment({ mode: 'sip', initialInvestment: 10000, recurringContribution: 500, annualRate: 12, years: 10, frequency: 'monthly', contributionTiming: 'beginning' });
const lsPortion = 10000 * Math.pow(1.01, 120);
assertClose(comb.futureValue, lsPortion + oracle10y, 0.05, 'INV-23', 'Combined initial + SIP equals sum of components');
assertClose(comb.totalInvested, 70000, 0.01, 'INV-24', 'Total invested includes initial capital ($70,000)');

// 8. Monotonicity checks
const r6 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 6, years: 5 });
const r8 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 8, years: 5 });
const r10 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 10, years: 5 });
assertTrue(r6.futureValue < r8.futureValue && r8.futureValue < r10.futureValue, 'INV-25', 'Higher returns strictly increase future value');

const y5 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 8, years: 5 });
const y10 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 8, years: 10 });
const y15 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 8, years: 15 });
assertTrue(y5.futureValue < y10.futureValue && y10.futureValue < y15.futureValue, 'INV-26', 'Longer horizons strictly increase future value');

// 9. Negative return rate handling
const neg = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: -10, years: 5, frequency: 'monthly' });
assertTrue(neg.futureValue < neg.totalInvested, 'INV-27', 'Negative return decays capital below invested amount');
assertTrue(neg.futureValue > 0, 'INV-28', 'Negative return leaves positive balance');
assertTrue(Number.isFinite(neg.futureValue), 'INV-29', 'Negative return yields finite balance');
assertClose(neg.totalInvested, 6000, 0.01, 'INV-30', 'Negative return preserves accurate total invested');

// 10. APR vs APY equivalence (Effective Rate Basis)
const rNom = 12;
const rEff = (Math.pow(1 + 0.01, 12) - 1) * 100;
const pNom = projectInvestment({ mode: 'sip', recurringContribution: 200, annualRate: rNom, years: 5, frequency: 'monthly', rateBasis: 'nominal' });
const pEff = projectInvestment({ mode: 'sip', recurringContribution: 200, annualRate: rEff, years: 5, frequency: 'monthly', rateBasis: 'effective' });
assertClose(pNom.futureValue, pEff.futureValue, 0.001, 'INV-31', 'Nominal vs Effective rate basis produce identical values');

// 11. Extreme tenures (50 & 100 years)
const t50 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 8, years: 50, frequency: 'monthly' });
assertTrue(Number.isFinite(t50.futureValue), 'INV-32', '50-year horizon produces finite result');
assertClose(t50.schedule.length, 50, 0.001, 'INV-33', '50-year schedule has 50 rows');

const t100 = projectInvestment({ mode: 'sip', recurringContribution: 50, annualRate: 6, years: 100, frequency: 'monthly' });
assertTrue(Number.isFinite(t100.futureValue), 'INV-34', '100-year horizon produces finite result');
assertClose(t100.schedule.length, 100, 0.001, 'INV-35', '100-year schedule has 100 rows');


// =================================================================
// SECTION 2: ANNUAL STEP-UP MODELING (25 tests)
// =================================================================
console.log('\n--- SECTION 2: Annual Step-Up Modeling ---');

// 1. Step-up at 0% return
const su1 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 0, years: 3, frequency: 'yearly', stepUp: 10 });
assertClose(su1.totalInvested, 331, 0.01, 'STP-01', '10% step-up 3 yrs at 0% = $331 (100 + 110 + 121)');
assertClose(su1.futureValue, 331, 0.01, 'STP-02', 'Future value equals $331');

const su2 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 0, years: 2, frequency: 'monthly', stepUp: 100 });
assertClose(su2.totalInvested, 3600, 0.01, 'STP-03', '100% step-up 2 yrs monthly = $3,600 (1200 + 2400)');
assertClose(su2.futureValue, 3600, 0.01, 'STP-04', 'Future value equals $3,600');

// 2. Schedule year contributions verification
assertClose(su1.schedule[0].contributions, 100, 0.01, 'STP-05', 'Year 1 contributions = $100');
assertClose(su1.schedule[1].contributions, 110, 0.01, 'STP-06', 'Year 2 contributions = $110');
assertClose(su1.schedule[2].contributions, 121, 0.01, 'STP-07', 'Year 3 contributions = $121');

// 3. Step-up with growth
const suGrowth = projectInvestment({ mode: 'sip', recurringContribution: 500, annualRate: 10, years: 5, frequency: 'monthly', stepUp: 10 });
const noStepUp = projectInvestment({ mode: 'sip', recurringContribution: 500, annualRate: 10, years: 5, frequency: 'monthly', stepUp: 0 });
assertTrue(suGrowth.futureValue > noStepUp.futureValue, 'STP-08', 'Step-up strictly increases future value under positive return');
assertTrue(suGrowth.totalInvested > noStepUp.totalInvested, 'STP-09', 'Step-up strictly increases total capital invested');

// 4. Ending annual contribution metric
assertClose(su1.endingAnnualContribution, 121, 0.01, 'STP-10', 'Ending annual contribution for 3-yr yearly step-up is $121');
assertClose(su2.endingAnnualContribution, 2400, 0.01, 'STP-11', 'Ending annual contribution for 2-yr monthly step-up is $2,400');

// 5. Various step-up percentages (5%, 15%, 25%, 50%)
for (const pct of [5, 15, 25, 50]) {
  const res = projectInvestment({ mode: 'sip', recurringContribution: 200, annualRate: 8, years: 4, frequency: 'monthly', stepUp: pct });
  assertTrue(Number.isFinite(res.futureValue), `STP-12-${pct}`, `${pct}% step-up generates finite future value`);
  assertTrue(res.endingAnnualContribution > 2400, `STP-13-${pct}`, `${pct}% step-up increases final annual contribution`);
}

// 6. Quarterly step-up
const qStep = projectInvestment({ mode: 'sip', recurringContribution: 1000, annualRate: 0, years: 3, frequency: 'quarterly', stepUp: 10 });
assertClose(qStep.schedule[0].contributions, 4000, 0.01, 'STP-14', 'Quarterly Yr 1 = $4,000');
assertClose(qStep.schedule[1].contributions, 4400, 0.01, 'STP-15', 'Quarterly Yr 2 = $4,400');
assertClose(qStep.schedule[2].contributions, 4840, 0.01, 'STP-16', 'Quarterly Yr 3 = $4,840');
assertClose(qStep.totalInvested, 13240, 0.01, 'STP-17', 'Quarterly total invested = $13,240');

// 7. Step-up ignored in lump sum mode
const lsStep = projectInvestment({ mode: 'lumpsum', initialInvestment: 10000, annualRate: 10, years: 5, stepUp: 20 });
const lsNormal = projectInvestment({ mode: 'lumpsum', initialInvestment: 10000, annualRate: 10, years: 5, stepUp: 0 });
assertClose(lsStep.futureValue, lsNormal.futureValue, 0.001, 'STP-18', 'Step-up parameter ignored in Lump Sum mode');


// =================================================================
// SECTION 3: INSTITUTIONAL COST & TAX MODELING (25 tests)
// =================================================================
console.log('\n--- SECTION 3: Institutional Cost & Tax Modeling ---');

// 1. Entry / Contribution Fee
// $100 deposit, 10% entry fee -> $10 fee, $90 net invested
const fee1 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 10, years: 1, frequency: 'yearly', contributionFeeRate: 10, contributionTiming: 'beginning' });
assertClose(fee1.totalContributionFees, 10, 0.01, 'FEE-01', 'Contribution fee is $10.00');
assertClose(fee1.futureValue, 99, 0.01, 'FEE-02', 'Ending balance is $90 * 1.10 = $99.00');

// 2. Annual Management Fee (TER)
// $1,000 initial lump sum, 10% return, 1% annual fee
// Balance grows to $1,100, 1% fee = $11 -> $1,089
const mgmt1 = projectInvestment({ mode: 'lumpsum', initialInvestment: 1000, annualRate: 10, years: 1, frequency: 'yearly', annualFeeRate: 1 });
assertClose(mgmt1.futureValue, 1089, 0.01, 'FEE-03', '1% annual fee reduces 10% return from $1,100 to $1,089');
assertClose(mgmt1.totalManagementFees, 11, 0.01, 'FEE-04', 'Total management fees paid = $11.00');

// 3. Capital Gains Tax on Liquidation
// $1,000 lump sum, 10% return -> $1,100. Gain = $100. 20% tax = $20 -> $1,080
const tax1 = projectInvestment({ mode: 'lumpsum', initialInvestment: 1000, annualRate: 10, years: 1, frequency: 'yearly', taxRateOnGains: 20 });
assertClose(tax1.futureValue, 1080, 0.01, 'TAX-01', '20% capital gains tax yields $1,080.00');
assertClose(tax1.totalTaxes, 20, 0.01, 'TAX-02', 'Total taxes paid = $20.00');

// 4. Combined Entry Fee + Tax (M13)
// $100 deposit, 10% entry fee ($10), $90 net. 10% growth = $99. Net gain = $9. 20% tax = $1.80. Final = $97.20
const m13Res = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 10, years: 1, frequency: 'yearly', contributionFeeRate: 10, taxRateOnGains: 20, contributionTiming: 'beginning' });
assertClose(m13Res.futureValue, 97.20, 0.01, 'TAX-03', 'Combined entry fee + tax yields $97.20');
assertClose(m13Res.totalTaxes, 1.80, 0.01, 'TAX-04', 'Total tax equals $1.80');
assertClose(m13Res.totalContributionFees, 10, 0.01, 'TAX-05', 'Total entry fees equals $10.00');

// 5. Full Institutional Drag Hierarchy: Gross > After-Fee > After-Tax
const grossRes = projectInvestment({ mode: 'sip', recurringContribution: 500, annualRate: 12, years: 10, frequency: 'monthly' });
const feeRes = projectInvestment({ mode: 'sip', recurringContribution: 500, annualRate: 12, years: 10, frequency: 'monthly', annualFeeRate: 1.5 });
const taxRes = projectInvestment({ mode: 'sip', recurringContribution: 500, annualRate: 12, years: 10, frequency: 'monthly', annualFeeRate: 1.5, taxRateOnGains: 15 });

assertTrue(grossRes.futureValue > feeRes.futureValue, 'DRG-01', 'Gross future value > After-fee future value');
assertTrue(feeRes.futureValue > taxRes.futureValue, 'DRG-02', 'After-fee future value > After-tax future value');

// 6. Inflation Discounting (Fisher Purchasing Power)
// $1,000, 10% return, 2 yrs -> $1,210. 10% inflation -> $1,000 real value
const inf1 = projectInvestment({ mode: 'lumpsum', initialInvestment: 1000, annualRate: 10, years: 2, frequency: 'yearly', inflationRate: 10 });
assertClose(inf1.futureValue, 1210, 0.01, 'INF-01', 'Nominal future value is $1,210');
assertClose(inf1.realValue, 1000, 0.01, 'INF-02', 'Real purchasing power is $1,000');
assertTrue(inf1.realValue < inf1.futureValue, 'INF-03', 'Positive inflation makes real value strictly lower than nominal');

// 7. Schedule reconciliation row checks
const sched = taxRes.schedule;
for (let yr = 0; yr < sched.length; yr++) {
  const row = sched[yr];
  const calculatedEnd = row.startingBalance + row.contributions + row.grossGrowth - row.contributionFees - row.managementFees - row.taxes;
  assertClose(row.endingBalance, calculatedEnd, 0.01, `REC-${yr + 1}`, `Schedule Yr ${yr + 1} balance reconciles accurately`);
}


// =================================================================
// SECTION 4: GOAL PLANNER BISECTION SOLVER (25 tests)
// =================================================================
console.log('\n--- SECTION 4: Goal Planner Bisection Solver ---');

// 1. Exact zero return solver
const g01 = solveGoalContribution({ target: 12000, mode: 'sip', annualRate: 0, years: 10, frequency: 'monthly' });
assertClose(g01.requiredContribution, 100, 0.01, 'GL-01', 'Goal $12k in 10 yrs at 0% = $100/mo');
assertTrue(g01.reachable, 'GL-02', 'Goal is reachable');
assertClose(g01.projectedValue, 12000, 0.01, 'GL-03', 'Projected value matches target');

const g02 = solveGoalContribution({ target: 12000, mode: 'sip', annualRate: 0, years: 10, frequency: 'yearly' });
assertClose(g02.requiredContribution, 1200, 0.01, 'GL-04', 'Goal $12k in 10 yrs yearly at 0% = $1,200/yr');

// 2. Target = 0 and Negative Target
const g03 = solveGoalContribution({ target: 0, mode: 'sip', annualRate: 10, years: 5 });
assertClose(g03.requiredContribution, 0, 0.001, 'GL-05', 'Target = 0 requires $0 contribution');
assertTrue(g03.reachable, 'GL-06', 'Target = 0 is marked reachable');

const g04 = solveGoalContribution({ target: -500, mode: 'sip', annualRate: 10, years: 5 });
assertClose(g04.requiredContribution, 0, 0.001, 'GL-07', 'Negative target requires $0 contribution');
assertTrue(!g04.reachable, 'GL-08', 'Negative target is marked unreachable');

// 3. Lump Sum Goal Solver
const gLs = solveGoalContribution({ target: 100000, mode: 'lumpsum', annualRate: 10, years: 10, frequency: 'yearly' });
const expectedLsReq = 100000 / Math.pow(1.10, 10);
assertClose(gLs.requiredContribution, expectedLsReq, 0.1, 'GL-09', 'Lump sum goal solver computes discounted present value');
assertTrue(gLs.reachable, 'GL-10', 'Lump sum goal is reachable');

// 4. Positive return verification loop (Forward Verification)
const testTargets = [25000, 50000, 100000, 500000, 1000000];
for (let idx = 0; idx < testTargets.length; idx++) {
  const tgt = testTargets[idx];
  const solved = solveGoalContribution({ target: tgt, mode: 'sip', annualRate: 12, years: 10, frequency: 'monthly', contributionTiming: 'beginning' });
  assertTrue(solved.reachable, `GL-FWD-${idx + 1}-R`, `Target $${tgt} is reachable`);
  const verifyProj = projectInvestment({ mode: 'sip', recurringContribution: solved.requiredContribution, annualRate: 12, years: 10, frequency: 'monthly', contributionTiming: 'beginning' });
  assertClose(verifyProj.futureValue, tgt, 0.05, `GL-FWD-${idx + 1}`, `Solved contribution delivers target $${tgt}`);
}

// 5. Goal with fees and taxes enabled
const gComplex = solveGoalContribution({ target: 200000, mode: 'sip', annualRate: 10, years: 15, frequency: 'monthly', annualFeeRate: 1, taxRateOnGains: 15 });
assertTrue(gComplex.reachable, 'GL-11', 'Complex goal with fees/taxes is reachable');
const verifyComplex = projectInvestment({ mode: 'sip', recurringContribution: gComplex.requiredContribution, annualRate: 10, years: 15, frequency: 'monthly', annualFeeRate: 1, taxRateOnGains: 15 });
assertClose(verifyComplex.futureValue, 200000, 0.1, 'GL-12', 'Complex goal forward projection meets $200k target');

// 6. Target already satisfied by initial investment
const gSatisfied = solveGoalContribution({ target: 15000, mode: 'sip', initialInvestment: 10000, annualRate: 10, years: 5 });
assertClose(gSatisfied.requiredContribution, 0, 0.001, 'GL-13', 'Satisfied goal requires $0 contribution');
assertTrue(gSatisfied.reachable, 'GL-14', 'Satisfied goal is reachable');


// =================================================================
// SECTION 5: MONTE CARLO STOCHASTIC SIMULATION (25 tests)
// =================================================================
console.log('\n--- SECTION 5: Monte Carlo Stochastic Simulation ---');

// 1. Zero volatility collapse to deterministic value
const mcZero = runMonteCarloSimulations({ mode: 'sip', recurringContribution: 500, annualRate: 10, years: 10, volatility: 0, simulations: 1000 });
const det = projectInvestment({ mode: 'sip', recurringContribution: 500, annualRate: 10, years: 10 });
assertClose(mcZero.p10, det.futureValue, 0.01, 'MC-01', '0% volatility: P10 equals deterministic FV');
assertClose(mcZero.p50, det.futureValue, 0.01, 'MC-02', '0% volatility: P50 equals deterministic FV');
assertClose(mcZero.p90, det.futureValue, 0.01, 'MC-03', '0% volatility: P90 equals deterministic FV');
assertClose(mcZero.mean, det.futureValue, 0.01, 'MC-04', '0% volatility: Mean equals deterministic FV');

// 2. Strict percentile ordering
const mcStandard = runMonteCarloSimulations({ mode: 'sip', recurringContribution: 500, annualRate: 10, years: 10, volatility: 15, simulations: 1500 });
assertTrue(mcStandard.min <= mcStandard.p10, 'MC-05', 'min <= p10');
assertTrue(mcStandard.p10 <= mcStandard.p25, 'MC-06', 'p10 <= p25');
assertTrue(mcStandard.p25 <= mcStandard.p50, 'MC-07', 'p25 <= p50');
assertTrue(mcStandard.p50 <= mcStandard.p75, 'MC-08', 'p50 <= p75');
assertTrue(mcStandard.p75 <= mcStandard.p90, 'MC-09', 'p75 <= p90');
assertTrue(mcStandard.p90 <= mcStandard.max, 'MC-10', 'p90 <= max');

// 3. Deterministic PRNG seed reproducibility
const mcRun1 = runMonteCarloSimulations({ mode: 'sip', recurringContribution: 250, annualRate: 8, years: 7, volatility: 12, simulations: 1000 });
const mcRun2 = runMonteCarloSimulations({ mode: 'sip', recurringContribution: 250, annualRate: 8, years: 7, volatility: 12, simulations: 1000 });
assertClose(mcRun1.p10, mcRun2.p10, 0.0001, 'MC-11', 'Seed reproducibility: P10 identical across runs');
assertClose(mcRun1.p50, mcRun2.p50, 0.0001, 'MC-12', 'Seed reproducibility: P50 identical across runs');
assertClose(mcRun1.p90, mcRun2.p90, 0.0001, 'MC-13', 'Seed reproducibility: P90 identical across runs');
assertClose(mcRun1.mean, mcRun2.mean, 0.0001, 'MC-14', 'Seed reproducibility: Mean identical across runs');

// 4. Probability target bounds
const mcTarget = runMonteCarloSimulations({ mode: 'sip', recurringContribution: 500, annualRate: 10, years: 10, volatility: 15, simulations: 1000, targetAmount: 100000 });
assertTrue(mcTarget.probabilityTarget !== null, 'MC-15', 'Target probability calculated');
assertTrue(mcTarget.probabilityTarget! >= 0 && mcTarget.probabilityTarget! <= 100, 'MC-16', 'Target probability bounded in [0%, 100%]');

// 5. Extreme trial counts (100, 3000, 5000)
for (const count of [100, 3000, 5000]) {
  const mcRes = runMonteCarloSimulations({ mode: 'sip', recurringContribution: 300, annualRate: 9, years: 5, volatility: 10, simulations: count });
  assertTrue(Number.isFinite(mcRes.p50), `MC-CNT-${count}`, `${count} trials execute with finite median`);
  assertTrue(mcRes.p10 <= mcRes.p90, `MC-ORD-${count}`, `${count} trials preserve percentile ordering`);
}


// =================================================================
// SECTION 6: FORMATTERS, CURRENCIES, SANITIZATION & CSV (20 tests)
// =================================================================
console.log('\n--- SECTION 6: Formatters, Currencies & CSV Security ---');

// 1. Currency meta and decimal places
assertClose(getCurrencyMeta('USD').fractionDigits, 2, 0.001, 'CUR-01', 'USD has 2 decimal digits');
assertClose(getCurrencyMeta('JPY').fractionDigits, 0, 0.001, 'CUR-02', 'JPY has 0 decimal digits');
assertClose(getCurrencyMeta('KWD').fractionDigits, 3, 0.001, 'CUR-03', 'KWD has 3 decimal digits');
assertClose(getCurrencyMeta('BHD').fractionDigits, 3, 0.001, 'CUR-04', 'BHD has 3 decimal digits');
assertClose(getCurrencyMeta('KRW').fractionDigits, 0, 0.001, 'CUR-05', 'KRW has 0 decimal digits');

// 2. formatCurrency and formatPercent
assertTrue(formatCurrency(1234.56, 'USD').includes('1,234.56'), 'FMT-01', 'Formats USD with comma separator');
assertTrue(formatPercent(12.3456).includes('12.35%'), 'FMT-02', 'Formats percent with 2 decimals');

// 3. safeNumber and clamp
assertClose(safeNumber('1,234.56'), 1234.56, 0.001, 'NUM-01', 'safeNumber parses comma-formatted number');
assertClose(safeNumber('invalid', 42), 42, 0.001, 'NUM-02', 'safeNumber returns fallback on invalid text');
assertClose(clamp(150, 0, 100), 100, 0.001, 'NUM-03', 'clamp bounds upper limit');
assertClose(clamp(-50, 0, 100), 0, 0.001, 'NUM-04', 'clamp bounds lower limit');

// 4. CSV Formula Injection Defense (CWE-1236)
assertTrue(sanitizeCsvCell('=SUM(A1:A10)').startsWith("'="), 'CSV-01', 'Neutralizes = prefix');
assertTrue(sanitizeCsvCell('+cmd|...').startsWith("'+"), 'CSV-02', 'Neutralizes + prefix');
assertTrue(sanitizeCsvCell('@SUM').startsWith("'@"), 'CSV-03', 'Neutralizes @ prefix');
assertTrue(sanitizeCsvCell('-cmd|...').startsWith("'-"), 'CSV-04', 'Neutralizes formula with - prefix');
assertTrue(sanitizeCsvCell(-100.5) === '-100.5', 'CSV-05', 'Preserves clean numeric negative number');
assertTrue(sanitizeCsvCell('-50.00') === '-50.00', 'CSV-06', 'Preserves clean numeric negative string');

// 5. CSV and HTML Report generation
const csvOut = generateCsvReport({ mode: 'sip', recurringContribution: 500, annualRate: 12, years: 3 });
assertTrue(csvOut.includes('# KivaroTools Investment & SIP Calculator'), 'CSV-07', 'CSV contains metadata header');
assertTrue(csvOut.includes('"Year","Starting Balance","Contributions"'), 'CSV-08', 'CSV contains column headers');

const htmlOut = generateReportHtml({
  result: projectInvestment({ mode: 'sip', recurringContribution: 500, annualRate: 12, years: 3 }),
  currency: getCurrencyMeta('USD'),
  mode: 'sip',
  annualRate: 12,
  years: 3,
  frequency: 'monthly',
  stepUp: 0,
  rateBasis: 'nominal',
  contributionTiming: 'beginning',
  annualFeeRate: 0,
  contributionFeeRate: 0,
  taxRateOnGains: 0,
  inflationRate: 0,
  goalPlan: null,
  monteCarloResult: null,
});
assertTrue(htmlOut.includes('<!doctype html>'), 'REP-01', 'HTML report includes doctype');
assertTrue(htmlOut.includes('Year-by-Year Accounting Reconciliation Schedule'), 'REP-02', 'HTML report includes schedule table');

// =================================================================
// SECTION 7: CURRENCY INTEGRITY & EXTRA STRESS BOUNDARIES (20 tests)
// =================================================================
console.log('\n--- SECTION 7: Currency Integrity & Extra Stress Boundaries ---');

// Check world currency count and meta integrity
assertTrue(WORLD_CURRENCIES.length >= 150, 'CUR-06', 'Contains 150+ ISO world currencies (154 total)');
assertTrue(ISO_ACTIVE_CURRENCIES.includes('EUR'), 'CUR-07', 'Contains EUR');
assertTrue(ISO_ACTIVE_CURRENCIES.includes('GBP'), 'CUR-08', 'Contains GBP');
assertTrue(ISO_ACTIVE_CURRENCIES.includes('INR'), 'CUR-09', 'Contains INR');
assertTrue(ISO_ACTIVE_CURRENCIES.includes('PKR'), 'CUR-10', 'Contains PKR');
assertTrue(ISO_ACTIVE_CURRENCIES.includes('AED'), 'CUR-11', 'Contains AED');
assertTrue(ISO_ACTIVE_CURRENCIES.includes('CAD'), 'CUR-12', 'Contains CAD');
assertTrue(ISO_ACTIVE_CURRENCIES.includes('AUD'), 'CUR-13', 'Contains AUD');
assertTrue(ISO_ACTIVE_CURRENCIES.includes('CHF'), 'CUR-14', 'Contains CHF');
assertTrue(ISO_ACTIVE_CURRENCIES.includes('CNY'), 'CUR-15', 'Contains CNY');

// Extreme Rate & Step-Up Stress
const extRate = projectInvestment({ mode: 'sip', recurringContribution: 1000, annualRate: 1000, years: 5, frequency: 'yearly' });
assertTrue(Number.isFinite(extRate.futureValue), 'EXT-01', '1,000% rate computes finite value');

const extTenure = projectInvestment({ mode: 'sip', recurringContribution: 10, annualRate: 5, years: 100, frequency: 'yearly' });
assertTrue(Number.isFinite(extTenure.futureValue), 'EXT-02', '100-year yearly tenure computes finite value');
assertClose(extTenure.schedule.length, 100, 0.001, 'EXT-03', 'Schedule has exactly 100 rows');

// Small contributions
const microContrib = projectInvestment({ mode: 'sip', recurringContribution: 0.01, annualRate: 5, years: 1, frequency: 'monthly' });
assertClose(microContrib.totalInvested, 0.12, 0.001, 'EXT-04', 'Micro contribution of $0.01/mo sums to $0.12');

// Decimals in step-up
const decStep = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 0, years: 2, frequency: 'yearly', stepUp: 5.5 });
assertClose(decStep.totalInvested, 205.50, 0.01, 'EXT-05', 'Decimal step-up of 5.5% computes $205.50 total');

// Decimal return rates (e.g. 7.25%)
const decRate = projectInvestment({ mode: 'lumpsum', initialInvestment: 1000, annualRate: 7.25, years: 1, frequency: 'yearly' });
assertClose(decRate.futureValue, 1072.50, 0.01, 'EXT-06', 'Decimal rate of 7.25% computes $1,072.50');

// All rows startingBalance of Year 1 is 0 for pure SIP
const pureSip = projectInvestment({ mode: 'sip', recurringContribution: 500, annualRate: 10, years: 3 });
assertClose(pureSip.schedule[0].startingBalance, 0, 0.001, 'EXT-07', 'Pure SIP Year 1 starting balance is 0');
assertClose(pureSip.schedule[1].startingBalance, pureSip.schedule[0].endingBalance, 0.001, 'EXT-08', 'Year 2 starting balance matches Year 1 ending balance');
assertClose(pureSip.schedule[2].startingBalance, pureSip.schedule[1].endingBalance, 0.001, 'EXT-09', 'Year 3 starting balance matches Year 2 ending balance');

console.log('\n=================================================================');
console.log(`150+ TEST SUITE RESULTS: ${passCount} PASSED, ${failCount} FAILED out of ${passCount + failCount} TOTAL`);
console.log('=================================================================');

if (failCount === 0) {
  console.log('ALL 150+ ENGINE TESTS PASSED WITH 100% ACCURACY!\n');
} else {
  process.exit(1);
}
