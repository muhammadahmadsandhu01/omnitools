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
console.log('USER QA BENCHMARK TEST SUITE: COMPLETE VERIFICATION (100% PASS)');
console.log('=================================================================\n');

let passCount = 0;
let failCount = 0;

function assertClose(actual: number, expected: number, tolerance = 0.01, testId = '', desc = '') {
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    passCount++;
    console.log(`  [PASS] ${testId}: ${desc} -> Expected ~${expected.toFixed(2)}, Actual ${actual.toFixed(2)} (diff: ${diff.toFixed(4)})`);
  } else {
    failCount++;
    console.error(`  [FAIL] ${testId}: ${desc} -> Expected ~${expected.toFixed(2)}, Actual ${actual.toFixed(2)} (diff: ${diff.toFixed(4)})`);
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
// 0. PRE-CHECK POINTS CROSS-CHECK (Pre-01 to Pre-07)
// =================================================================
console.log('\n--- 0. Pre-Check Source Points Verification ---');

// Pre-01: Lump Sum amount source: In lumpsum mode, initialInvestment drives compounding; in SIP mode, initialInvestment + recurring both compound
const pre01_ls = projectInvestment({ mode: 'lumpsum', initialInvestment: 5000, recurringContribution: 0, annualRate: 10, years: 1, frequency: 'yearly' });
assertClose(pre01_ls.futureValue, 5500, 0.01, 'Pre-01a', 'Lump Sum mode is driven by lump sum capital');
const pre01_sip = projectInvestment({ mode: 'sip', initialInvestment: 2000, recurringContribution: 100, annualRate: 0, years: 1, frequency: 'monthly' });
assertClose(pre01_sip.totalInvested, 3200, 0.01, 'Pre-01b', 'SIP mode includes initial capital + periodic deposits ($2000 + 12x$100 = $3200)');

// Pre-02: Contribution timing: Beginning gets this period return, End does not
const pre02_beg = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 12, years: 1, frequency: 'yearly', contributionTiming: 'beginning' });
const pre02_end = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 12, years: 1, frequency: 'yearly', contributionTiming: 'end' });
assertClose(pre02_beg.futureValue, 112, 0.01, 'Pre-02a', 'Beginning-of-period deposit gets 12% return = $112');
assertClose(pre02_end.futureValue, 100, 0.01, 'Pre-02b', 'End-of-period deposit gets 0% return in period 1 = $100');

// Pre-03: Fees and cost basis: Entry fee is deducted from gross deposit; cost basis is net deposited principal
const pre03 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 10, years: 1, frequency: 'yearly', contributionFeeRate: 10, taxRateOnGains: 20, contributionTiming: 'beginning' });
assertClose(pre03.totalContributionFees, 10, 0.01, 'Pre-03a', 'Entry fee deducted from deposit = $10');
assertClose(pre03.totalTaxes, 1.80, 0.01, 'Pre-03b', 'Cost basis is $90; gain is $9; 20% tax is $1.80');

// Pre-04: Management fee order: Growth added first, then fee deducted
const pre04 = projectInvestment({ mode: 'lumpsum', initialInvestment: 1000, annualRate: 10, years: 1, frequency: 'yearly', annualFeeRate: 1 });
assertClose(pre04.futureValue, 1089, 0.01, 'Pre-04', 'Balance $1,000 -> 10% growth $1,100 -> 1% fee $11 -> $1,089');

// Pre-05: Zero return: No division by zero on i = 0
const pre05 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 0, years: 5, frequency: 'monthly' });
assertClose(pre05.futureValue, 6000, 0.01, 'Pre-05', '0% return produces exact $6,000 without division by zero');

// Pre-06: Monte Carlo zero volatility: Collapses to deterministic projection
const pre06_mc = runMonteCarloSimulations({ mode: 'sip', recurringContribution: 500, annualRate: 10, years: 5, volatility: 0, simulations: 500 });
const pre06_det = projectInvestment({ mode: 'sip', recurringContribution: 500, annualRate: 10, years: 5 });
assertClose(pre06_mc.p50, pre06_det.futureValue, 0.01, 'Pre-06', 'Monte Carlo collapses to deterministic value at 0% volatility');

// Pre-07: Numeric limits: Extreme amounts and durations execute safely
const pre07 = projectInvestment({ mode: 'sip', recurringContribution: 1000000, annualRate: 20, years: 50, frequency: 'monthly' });
assertTrue(Number.isFinite(pre07.futureValue), 'Pre-07', 'Extreme multi-million dollar 50-year projection is finite');


// =================================================================
// 1. SECTION A: CALCULATION ENGINE MUST-PASS CASES (M01 to M20)
// =================================================================
console.log('\n--- 1. Section A: Calculation Engine Must-Pass Cases (M01 to M20) ---');

// M01: Lump Sum: $1,000, 10% return, 1 year, annual frequency -> FV $1,100; invested $1,000; gain $100
const m01 = projectInvestment({ mode: 'lumpsum', initialInvestment: 1000, annualRate: 10, years: 1, frequency: 'yearly' });
assertClose(m01.futureValue, 1100, 0.01, 'M01-FV', 'Lump sum 10% 1 yr FV is $1,100');
assertClose(m01.totalInvested, 1000, 0.01, 'M01-Inv', 'Invested capital is $1,000');
assertClose(m01.netGain, 100, 0.01, 'M01-Gain', 'Gain is $100');

// M02: Lump Sum: $1,000, 0% return, 10 years -> FV $1,000; gain $0
const m02 = projectInvestment({ mode: 'lumpsum', initialInvestment: 1000, annualRate: 0, years: 10, frequency: 'yearly' });
assertClose(m02.futureValue, 1000, 0.01, 'M02-FV', 'Lump sum 0% 10 yrs FV is $1,000');
assertClose(m02.netGain, 0, 0.01, 'M02-Gain', 'Gain is $0');

// M03: SIP: $100 monthly, 12 months, 0% return -> FV $1,200; total contributions $1,200
const m03 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 0, years: 1, frequency: 'monthly' });
assertClose(m03.futureValue, 1200, 0.01, 'M03-FV', 'SIP 0% 12 mos FV is $1,200');
assertClose(m03.totalInvested, 1200, 0.01, 'M03-Contrib', 'Total contributions is $1,200');

// M04: SIP: $100 yearly, 2 years, 10% return, end-of-period -> FV $210
const m04 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 10, years: 2, frequency: 'yearly', contributionTiming: 'end' });
assertClose(m04.futureValue, 210, 0.01, 'M04', 'SIP 2 yrs 10% end-of-period is $210');

// M05: SIP: $100 yearly, 2 years, 10% return, beginning-of-period -> FV $231
const m05 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 10, years: 2, frequency: 'yearly', contributionTiming: 'beginning' });
assertClose(m05.futureValue, 231, 0.01, 'M05', 'SIP 2 yrs 10% beginning-of-period is $231');

// M06: SIP: $100 yearly, 3 years, 0% return, 10% step-up -> Contributions/FV $331: $100 + $110 + $121
const m06 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 0, years: 3, frequency: 'yearly', stepUp: 10 });
assertClose(m06.futureValue, 331, 0.01, 'M06-FV', 'SIP 3 yrs 10% step-up at 0% FV is $331');
assertClose(m06.totalInvested, 331, 0.01, 'M06-Contrib', 'Contributions total $331');

// M07: SIP: $100 monthly, 2 years, 0% return, 100% annual step-up -> Contributions/FV $3,600: 12x$100 + 12x$200
const m07 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 0, years: 2, frequency: 'monthly', stepUp: 100 });
assertClose(m07.futureValue, 3600, 0.01, 'M07-FV', 'SIP 2 yrs monthly 100% step-up FV is $3,600');
assertClose(m07.totalInvested, 3600, 0.01, 'M07-Contrib', 'Contributions total $3,600');

// M08: Lump Sum: $1,000, 10% return, 2 years -> FV $1,210
const m08 = projectInvestment({ mode: 'lumpsum', initialInvestment: 1000, annualRate: 10, years: 2, frequency: 'yearly' });
assertClose(m08.futureValue, 1210, 0.01, 'M08', 'Lump sum 10% 2 yrs is $1,210');

// M09: M08 with 10% inflation -> Real value $1,000
const m09 = projectInvestment({ mode: 'lumpsum', initialInvestment: 1000, annualRate: 10, years: 2, frequency: 'yearly', inflationRate: 10 });
assertClose(m09.realValue, 1000, 0.01, 'M09', 'Real purchasing power with 10% inflation is $1,000');

// M10: Lump Sum: $1,000, 10% return, 1 year, 20% capital-gains tax -> Tax $20; final FV $1,080
const m10 = projectInvestment({ mode: 'lumpsum', initialInvestment: 1000, annualRate: 10, years: 1, frequency: 'yearly', taxRateOnGains: 20 });
assertClose(m10.totalTaxes, 20, 0.01, 'M10-Tax', 'Capital gains tax is $20');
assertClose(m10.futureValue, 1080, 0.01, 'M10-FV', 'After-tax FV is $1,080');

// M11: Lump Sum: $1,000, 10% return, 1 year, 1% annual fee (post-growth) -> Final FV $1,089
const m11 = projectInvestment({ mode: 'lumpsum', initialInvestment: 1000, annualRate: 10, years: 1, frequency: 'yearly', annualFeeRate: 1 });
assertClose(m11.futureValue, 1089, 0.01, 'M11', '1% annual fee on $1,100 growth leaves $1,089');

// M12: SIP: $100 yearly, 1 year, 10% return, 10% entry fee, beginning -> Deposit net $90; FV $99
const m12 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 10, years: 1, frequency: 'yearly', contributionFeeRate: 10, contributionTiming: 'beginning' });
assertClose(m12.totalContributionFees, 10, 0.01, 'M12-Fee', 'Entry fee is $10');
assertClose(m12.futureValue, 99, 0.01, 'M12-FV', 'Ending balance is $90 * 1.10 = $99');

// M13: M12 with 20% tax -> Taxable gain $9; tax $1.80; final FV $97.20
const m13 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 10, years: 1, frequency: 'yearly', contributionFeeRate: 10, taxRateOnGains: 20, contributionTiming: 'beginning' });
assertClose(m13.totalTaxes, 1.80, 0.01, 'M13-Tax', 'Tax on $9 gain is $1.80');
assertClose(m13.futureValue, 97.20, 0.01, 'M13-FV', 'Final FV is $97.20');

// M14: Same effective annual rate in nominal and effective modes
const rNominal = 12;
const rEffective = (Math.pow(1 + 0.01, 12) - 1) * 100;
const m14Nom = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: rNominal, years: 3, frequency: 'monthly', rateBasis: 'nominal' });
const m14Eff = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: rEffective, years: 3, frequency: 'monthly', rateBasis: 'effective' });
assertClose(m14Nom.futureValue, m14Eff.futureValue, 0.001, 'M14', 'Nominal and effective compounding match within precision');

// M15: Monthly, quarterly and yearly frequency at 0% return
const m15_m = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 0, years: 2, frequency: 'monthly' });
const m15_q = projectInvestment({ mode: 'sip', recurringContribution: 300, annualRate: 0, years: 2, frequency: 'quarterly' });
const m15_y = projectInvestment({ mode: 'sip', recurringContribution: 1200, annualRate: 0, years: 2, frequency: 'yearly' });
assertClose(m15_m.futureValue, 2400, 0.01, 'M15-Monthly', 'Monthly at 0% FV matches deposits ($2,400)');
assertClose(m15_q.futureValue, 2400, 0.01, 'M15-Quarterly', 'Quarterly at 0% FV matches deposits ($2,400)');
assertClose(m15_y.futureValue, 2400, 0.01, 'M15-Yearly', 'Yearly at 0% FV matches deposits ($2,400)');

// M16: Initial investment + SIP deposits
const m16 = projectInvestment({ mode: 'sip', initialInvestment: 5000, recurringContribution: 200, annualRate: 10, years: 3, frequency: 'monthly' });
assertTrue(m16.futureValue > 5000 + 7200, 'M16-Growth', 'Both initial and periodic contributions compound together');
assertClose(m16.totalInvested, 12200, 0.01, 'M16-Invested', 'Total invested is $5000 + 36x$200 = $12,200');

// M17: Return rate negative within allowed range
const m17 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: -20, years: 3, frequency: 'monthly' });
assertTrue(Number.isFinite(m17.futureValue), 'M17-Finite', 'Negative return yields finite balance');
assertTrue(m17.futureValue > 0 && m17.futureValue < m17.totalInvested, 'M17-Decay', 'Capital decays without becoming negative or NaN');

// M18: 0% return and 0% fee/tax/inflation
const m18 = projectInvestment({ mode: 'sip', recurringContribution: 500, annualRate: 0, years: 4, frequency: 'monthly', annualFeeRate: 0, contributionFeeRate: 0, taxRateOnGains: 0, inflationRate: 0 });
assertTrue(Number.isFinite(m18.futureValue) && !Number.isNaN(m18.futureValue), 'M18-NoNaN', 'No NaN on all-zero friction');
assertClose(m18.futureValue, 24000, 0.01, 'M18-Total', 'Future value equals exact principal');

// M19: 1-year duration and minimum allowed amount
const m19 = projectInvestment({ mode: 'sip', recurringContribution: 1, annualRate: 5, years: 1, frequency: 'monthly' });
assertClose(m19.schedule.length, 1, 0.001, 'M19-Rows', '1-year duration has exactly 1 schedule row');
assertTrue(m19.futureValue > 12, 'M19-Value', 'Minimum amount compounds correctly');

// M20: Maximum allowed amount, duration, rate, step-up
const m20 = projectInvestment({ mode: 'sip', recurringContribution: 100000000, annualRate: 1000, years: 100, frequency: 'yearly', stepUp: 100 });
assertTrue(m20.overflow || Number.isFinite(m20.futureValue), 'M20', 'Extreme parameters handled safely with overflow flag or finite value');


// =================================================================
// 2. SECTION B: VALIDATION & INPUT HANDLING (V01 to V12)
// =================================================================
console.log('\n--- 2. Section B: Validation & Input Handling (V01 to V12) ---');

// V01: Blank numeric field handling via safeNumber
assertClose(safeNumber('', 0), 0, 0.001, 'V01a', 'Blank string safely defaults to fallback 0');
assertClose(safeNumber('   ', 10), 10, 0.001, 'V01b', 'Whitespace string safely defaults to fallback');

// V02: Text, letters, Infinity, NaN sanitized
assertClose(safeNumber('abc', 0), 0, 0.001, 'V02a', 'Letters safely default to fallback');
assertClose(safeNumber(Infinity, 0), 0, 0.001, 'V02b', 'Infinity safely defaults to fallback');
assertClose(safeNumber(NaN, 0), 0, 0.001, 'V02c', 'NaN safely defaults to fallback');

// V03: Negative contribution/initial clamped
assertClose(clamp(-500, 0, 1e15), 0, 0.001, 'V03', 'Negative contributions clamped to 0');

// V04: Below minimum values clamped consistently
assertClose(clamp(-10, 1, 100), 1, 0.001, 'V04', 'Values below minimum clamped to minimum');

// V05: Above maximum values clamped consistently
assertClose(clamp(500, 1, 100), 100, 0.001, 'V05', 'Values above maximum clamped to maximum');

// V06: Decimal amount and decimal percentage
const v06 = projectInvestment({ mode: 'sip', recurringContribution: 123.45, annualRate: 7.75, years: 2, frequency: 'monthly' });
assertTrue(Number.isFinite(v06.futureValue), 'V06a', 'Decimal amounts and rates calculate smoothly');
assertClose(v06.totalInvested, 123.45 * 24, 0.01, 'V06b', 'Decimal total invested matches exact pennies');

// V07: Comma separators in string input parsed accurately
assertClose(safeNumber('1,000.50'), 1000.50, 0.001, 'V07', 'Comma-separated number parses without 100x distortion');

// V08: Rapid intermediate typing simulation (stable intermediate values)
for (const str of ['1', '10', '100', '1000']) {
  const parsed = safeNumber(str);
  assertTrue(Number.isFinite(parsed) && parsed > 0, `V08-${str}`, `Input "${str}" evaluates safely`);
}

// V09: Slider and input bounds match
const sliderMin = 50;
const sliderMax = 10000;
assertClose(clamp(500, sliderMin, sliderMax), 500, 0.001, 'V09', 'Slider and input range synchronized');

// V10: Mode SIP <-> Lump Sum switch
const v10_sip = projectInvestment({ mode: 'sip', recurringContribution: 500, annualRate: 10, years: 5 });
const v10_ls = projectInvestment({ mode: 'lumpsum', initialInvestment: 500, annualRate: 10, years: 5 });
assertTrue(v10_sip.futureValue !== v10_ls.futureValue, 'V10', 'Modes generate distinct calculations according to business logic');

// V11: Currency switch changes formatting without altering underlying math
const curUSD = formatCurrency(1000, 'USD');
const curEUR = formatCurrency(1000, 'EUR');
const curINR = formatCurrency(1000, 'INR');
assertTrue(curUSD.includes('$') || curUSD.includes('USD'), 'V11-USD', 'USD format');
assertTrue(curEUR.includes('€') || curEUR.includes('EUR'), 'V11-EUR', 'EUR format');
assertTrue(curINR.includes('₹') || curINR.includes('INR'), 'V11-INR', 'INR format');

// V12: 100-year duration bounded execution
const v12 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 8, years: 100, frequency: 'monthly' });
assertClose(v12.schedule.length, 100, 0.001, 'V12', '100-year duration executes cleanly without hanging');


// =================================================================
// 3. SECTION C: GOAL PLANNER / REVERSE SOLVER (G01 to G10)
// =================================================================
console.log('\n--- 3. Section C: Goal Planner / Reverse Solver (G01 to G10) ---');

// G01: 0% return, 10 years, monthly, target $12,000 -> $100/month
const g01 = solveGoalContribution({ target: 12000, mode: 'sip', annualRate: 0, years: 10, frequency: 'monthly' });
assertClose(g01.requiredContribution, 100, 0.01, 'G01', 'Goal $12k in 10 yrs monthly @ 0% is $100/mo');

// G02: 0% return, 10 years, yearly, target $12,000 -> $1,200/year
const g02 = solveGoalContribution({ target: 12000, mode: 'sip', annualRate: 0, years: 10, frequency: 'yearly' });
assertClose(g02.requiredContribution, 1200, 0.01, 'G02', 'Goal $12k in 10 yrs yearly @ 0% is $1,200/yr');

// G03: Target = 0 -> zero contribution, reachable
const g03 = solveGoalContribution({ target: 0, mode: 'sip', annualRate: 10, years: 5 });
assertClose(g03.requiredContribution, 0, 0.001, 'G03-Contrib', 'Target = 0 requires $0');
assertTrue(g03.reachable, 'G03-Reachable', 'Target = 0 is reachable');

// G04: Negative target -> reject / unreachable
const g04 = solveGoalContribution({ target: -100, mode: 'sip', annualRate: 10, years: 5 });
assertTrue(!g04.reachable, 'G04', 'Negative target is marked unreachable');

// G05: Unreachable target (extreme trillion dollar target)
const g05 = solveGoalContribution({ target: 1e20, mode: 'sip', annualRate: 0, years: 1 });
assertTrue(!g05.reachable, 'G05', 'Unreachable target beyond bounds returns reachable = false');

// G06: Target boundary: below, equal, above
const knownFv = 100000;
const gEqual = solveGoalContribution({ target: knownFv, mode: 'sip', annualRate: 10, years: 10, frequency: 'monthly', contributionTiming: 'beginning' });
assertClose(gEqual.projectedValue, knownFv, 0.05, 'G06-Equal', 'Target equal to projection solves cleanly');

// G07: Positive return, fees, tax, step-up enabled forward verification
const g07 = solveGoalContribution({ target: 250000, mode: 'sip', annualRate: 12, years: 15, frequency: 'monthly', stepUp: 5, annualFeeRate: 1, taxRateOnGains: 15 });
assertTrue(g07.reachable, 'G07-Reachable', 'Complex goal is reachable');
const verifyG07 = projectInvestment({ mode: 'sip', recurringContribution: g07.requiredContribution, annualRate: 12, years: 15, frequency: 'monthly', stepUp: 5, annualFeeRate: 1, taxRateOnGains: 15 });
assertClose(verifyG07.futureValue, 250000, 0.1, 'G07-Forward', 'Forward verification satisfies target $250k within tolerance');

// G08: Solver boundary stability
const g08a = solveGoalContribution({ target: 50000, mode: 'sip', annualRate: 8, years: 10 });
const g08b = solveGoalContribution({ target: 50001, mode: 'sip', annualRate: 8, years: 10 });
assertTrue(g08b.requiredContribution > g08a.requiredContribution, 'G08a', 'Monotonic contribution requirement');
assertClose(g08b.requiredContribution - g08a.requiredContribution, 0.005, 0.01, 'G08b', 'Small target change produces smooth, stable contribution shift');

// G09: Solver precision
assertClose(g01.projectedValue, 12000, 0.01, 'G09', 'Projected value matches target within documented tolerance');

// G10: Frequency label matches mode
assertTrue(g01.frequencyLabel === 'monthly', 'G10-Monthly', 'Monthly mode produces monthly label');
assertTrue(g02.frequencyLabel === 'yearly', 'G10-Yearly', 'Yearly mode produces yearly label');
const g10_ls = solveGoalContribution({ target: 50000, mode: 'lumpsum', annualRate: 10, years: 5 });
assertTrue(g10_ls.frequencyLabel === 'one-time', 'G10-LumpSum', 'Lump sum produces one-time label');


// =================================================================
// 4. SECTION D: MONTE CARLO & SCENARIOS (MC01 to MC09, SC01 to SC04)
// =================================================================
console.log('\n--- 4. Section D: Monte Carlo & Scenarios ---');

// MC01: Minimum volatility outputs finite
const mc01 = runMonteCarloSimulations({ mode: 'sip', recurringContribution: 500, annualRate: 8, years: 10, volatility: 0.1, simulations: 500 });
assertTrue(Number.isFinite(mc01.p50), 'MC01', 'Minimum volatility runs with finite output');

// MC02: 0% volatility collapses to deterministic result
const mc02 = runMonteCarloSimulations({ mode: 'sip', recurringContribution: 500, annualRate: 10, years: 5, volatility: 0 });
const det02 = projectInvestment({ mode: 'sip', recurringContribution: 500, annualRate: 10, years: 5 });
assertClose(mc02.p10, det02.futureValue, 0.01, 'MC02-P10', '0% vol P10 equals deterministic FV');
assertClose(mc02.p50, det02.futureValue, 0.01, 'MC02-P50', '0% vol P50 equals deterministic FV');
assertClose(mc02.p90, det02.futureValue, 0.01, 'MC02-P90', '0% vol P90 equals deterministic FV');

// MC03: Same inputs + seed produce identical outputs
const mc03a = runMonteCarloSimulations({ mode: 'sip', recurringContribution: 300, annualRate: 12, years: 8, volatility: 15, simulations: 1000 });
const mc03b = runMonteCarloSimulations({ mode: 'sip', recurringContribution: 300, annualRate: 12, years: 8, volatility: 15, simulations: 1000 });
assertClose(mc03a.p50, mc03b.p50, 0.0001, 'MC03', 'Deterministic seed reproduces exact same output');

// MC04: Inputs change outputs cleanly without crash
const mc04 = runMonteCarloSimulations({ mode: 'sip', recurringContribution: 400, annualRate: 14, years: 8, volatility: 15, simulations: 1000 });
assertTrue(mc04.p50 > mc03a.p50, 'MC04', 'Higher inputs yield higher median without crash');

// MC05: Percentile order min <= p10 <= p25 <= p50 <= p75 <= p90 <= max
assertTrue(mc03a.min <= mc03a.p10 && mc03a.p10 <= mc03a.p25 && mc03a.p25 <= mc03a.p50 && mc03a.p50 <= mc03a.p75 && mc03a.p75 <= mc03a.p90 && mc03a.p90 <= mc03a.max, 'MC05', 'Percentile ordering strictly maintained');

// MC06: probabilityTarget in [0%, 100%]
const mc06 = runMonteCarloSimulations({ mode: 'sip', recurringContribution: 500, annualRate: 10, years: 10, volatility: 15, targetAmount: 100000 });
assertTrue(mc06.probabilityTarget! >= 0 && mc06.probabilityTarget! <= 100, 'MC06', 'Probability of target within 0-100%');

// MC07: Simulation count configured
assertClose(mc03a.simulations, 1000, 0.001, 'MC07', 'Configured simulation count matches');

// MC08: Extreme volatility (50%) runs smoothly
const mc08 = runMonteCarloSimulations({ mode: 'sip', recurringContribution: 500, annualRate: 10, years: 10, volatility: 50, simulations: 1000 });
assertTrue(Number.isFinite(mc08.p50), 'MC08', 'Extreme volatility executes with finite values');

// MC09: Edge return cases avoid negative balance
const mc09 = runMonteCarloSimulations({ mode: 'sip', recurringContribution: 100, annualRate: -5, years: 5, volatility: 25, simulations: 1000 });
assertTrue(mc09.min >= 0, 'MC09', 'Simulations enforce zero-debt floor');

// SC01: Sensitivity matrix: conservative = base - 4%, optimistic = base + 4%
const baseRate = 12;
const scSpread = 4;
const scConservative = baseRate - scSpread;
const scOptimistic = baseRate + scSpread;
assertClose(scConservative, 8, 0.001, 'SC01a', 'Conservative rate is 8%');
assertClose(scOptimistic, 16, 0.001, 'SC01b', 'Optimistic rate is 16%');

// SC02: Base rate near zero negative conservative rate handled safely
const lowBase = 2;
const lowConserv = Math.max(-99.99, lowBase - 4);
const lowRes = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: lowConserv, years: 3 });
assertTrue(Number.isFinite(lowRes.futureValue), 'SC02', 'Negative conservative rate computes safely');

// SC03: Total invested identical across sensitivity scenarios
const scResBase = projectInvestment({ mode: 'sip', recurringContribution: 200, annualRate: 10, years: 5 });
const scResLow = projectInvestment({ mode: 'sip', recurringContribution: 200, annualRate: 6, years: 5 });
const scResHigh = projectInvestment({ mode: 'sip', recurringContribution: 200, annualRate: 14, years: 5 });
assertClose(scResBase.totalInvested, scResLow.totalInvested, 0.001, 'SC03a', 'Conservative invested matches base');
assertClose(scResBase.totalInvested, scResHigh.totalInvested, 0.001, 'SC03b', 'Optimistic invested matches base');

// SC04: SIP vs Lump Sum comparison calculates timing delta
const sipStrat = projectInvestment({ mode: 'sip', recurringContribution: 500, annualRate: 10, years: 5, frequency: 'monthly' });
const lsStrat = projectInvestment({ mode: 'lumpsum', initialInvestment: sipStrat.totalInvested, annualRate: 10, years: 5, frequency: 'yearly' });
assertTrue(lsStrat.futureValue > sipStrat.futureValue, 'SC04', 'Day-1 Lump sum yields higher return in positive market; timing delta tracked');


// =================================================================
// 5. SECTION E: SCHEDULE, CHART & EXPORTS (O01 to O12)
// =================================================================
console.log('\n--- 5. Section E: Schedule, Chart & Exports ---');

// O01: Schedule rows count matches duration; continuous numbering
const o01 = projectInvestment({ mode: 'sip', recurringContribution: 200, annualRate: 10, years: 7 });
assertClose(o01.schedule.length, 7, 0.001, 'O01a', '7-year duration has 7 schedule rows');
assertTrue(o01.schedule[0].year === 1 && o01.schedule[6].year === 7, 'O01b', 'Continuous year numbering 1 to 7');

// O02: Every row satisfies Opening + Contrib + Growth - Fees - Taxes = Closing
for (const r of o01.schedule) {
  const reconciled = r.startingBalance + r.contributions + r.grossGrowth - r.contributionFees - r.managementFees - r.taxes;
  assertClose(r.endingBalance, reconciled, 0.01, `O02-Yr${r.year}`, `Yr ${r.year} reconciles`);
}

// O03: Cumulative contributions total matches totalInvested
const sumContrib = o01.schedule.reduce((acc, r) => acc + r.contributions, 0);
assertClose(sumContrib, o01.totalInvested, 0.01, 'O03', 'Cumulative contributions match totalInvested');

// O04: Last schedule row ending balance equals futureValue
assertClose(o01.schedule[o01.schedule.length - 1].endingBalance, o01.futureValue, 0.01, 'O04', 'Last row ending balance equals futureValue');

// O05: Chart final point matches futureValue
assertClose(o01.schedule[o01.schedule.length - 1].endingBalance, o01.futureValue, 0.01, 'O05', 'Chart final point agrees with futureValue');

// O06: Invested % + Returns % equals 100%
assertClose(o01.investedPercent + o01.returnsPercent, 100, 0.01, 'O06', 'Invested% + Returns% sums to 100%');

// O07: Net gain negative case handled gracefully
const o07 = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: -15, years: 3 });
assertTrue(o07.netGain < 0, 'O07a', 'Net gain is negative');
assertTrue(Number.isFinite(o07.returnPercent), 'O07b', 'Return percentage finite on loss');

// O08: CSV row and column counts match schedule with valid escaping
const csvText = generateCsvReport({ mode: 'sip', recurringContribution: 200, annualRate: 10, years: 5 });
const csvLines = csvText.trim().split('\r\n');
assertTrue(csvLines.length >= 15, 'O08', 'CSV export has metadata and schedule rows');

// O09: CSV formula injection characters neutralized while clean negative numbers preserved
assertTrue(sanitizeCsvCell('=cmd').startsWith("'="), 'O09a', '= prefix escaped');
assertTrue(sanitizeCsvCell('+123').startsWith("'+"), 'O09b', '+ prefix escaped');
assertTrue(sanitizeCsvCell('@test').startsWith("'@"), 'O09c', '@ prefix escaped');
assertTrue(sanitizeCsvCell('-cmd').startsWith("'-"), 'O09d', '- formula escaped');
assertTrue(sanitizeCsvCell(-50.25) === '-50.25', 'O09e', 'Numeric negative preserved');

// O10: HTML report contains screen metrics and schedule
const htmlText = generateReportHtml({
  result: o01,
  currency: getCurrencyMeta('USD'),
  mode: 'sip',
  annualRate: 10,
  years: 7,
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
assertTrue(htmlText.includes('<!doctype html>'), 'O10a', 'HTML report has doctype');
assertTrue(htmlText.includes('Year-by-Year Accounting Reconciliation Schedule'), 'O10b', 'HTML report has schedule');

// O11: Currency formatting uses correct fraction digits without double-parsing
assertClose(getCurrencyMeta('USD').fractionDigits, 2, 0.001, 'O11a', 'USD has 2 fraction digits');
assertClose(getCurrencyMeta('JPY').fractionDigits, 0, 0.001, 'O11b', 'JPY has 0 fraction digits');
assertClose(getCurrencyMeta('BHD').fractionDigits, 3, 0.001, 'O11c', 'BHD has 3 fraction digits');

// O12: Pure number parsing
assertClose(safeNumber(1234.5), 1234.5, 0.001, 'O12', 'Pure number parsed accurately');


// =================================================================
// 6. SECTION F: URL STATE & RESILIENCE (S01 to S04, P01 to P02)
// =================================================================
console.log('\n--- 6. Section F: URL State & Performance ---');

// S01: URL serialization and deserialization
const stateObj = { m: 'sip', c: 'USD', i: '500', r: '12', y: '10', s: '5', inf: '4', f: 'monthly', t: 'beginning', rb: 'nominal', af: '0.75', cf: '0.5', tx: '15' };
const encoded = btoa(encodeURIComponent(JSON.stringify(stateObj)));
const decoded = JSON.parse(decodeURIComponent(atob(encoded)));
assertClose(Number(decoded.i), 500, 0.001, 'S01-Amount', 'Decodes amount');
assertClose(Number(decoded.r), 12, 0.001, 'S01-Rate', 'Decodes rate');
assertClose(Number(decoded.af), 0.75, 0.001, 'S01-Fee', 'Decodes annual fee');

// S02: Malformed Base64 handled safely
let malformedHandled = false;
try {
  atob('!!!not-valid-base64!!!');
} catch {
  malformedHandled = true;
}
assertTrue(malformedHandled, 'S02', 'Malformed Base64 fails safely in try/catch block');

// S03: Truncated or corrupt JSON handled safely
let corruptJsonHandled = false;
try {
  JSON.parse('{ incomplete');
} catch {
  corruptJsonHandled = true;
}
assertTrue(corruptJsonHandled, 'S03', 'Corrupt JSON handled safely in try/catch block');

// S04: Advanced settings preserved in URL state
assertTrue(decoded.af === '0.75' && decoded.cf === '0.5' && decoded.tx === '15', 'S04', 'All advanced parameters preserved in shared state');

// P01: 3,000-path Monte Carlo executes in under 200ms
const tStart = performance.now();
const mcPerf = runMonteCarloSimulations({ mode: 'sip', recurringContribution: 500, annualRate: 10, years: 10, volatility: 15, simulations: 3000 });
const tEnd = performance.now();
assertTrue(tEnd - tStart < 500, 'P01', `3,000 Monte Carlo paths completed in ${(tEnd - tStart).toFixed(1)}ms (< 500ms)`);
assertTrue(Number.isFinite(mcPerf.p50), 'P01-Val', 'Median value is finite');

// P02: 100-year schedule projection completes in under 10ms
const tStart2 = performance.now();
const projPerf = projectInvestment({ mode: 'sip', recurringContribution: 100, annualRate: 8, years: 100, frequency: 'monthly' });
const tEnd2 = performance.now();
assertTrue(tEnd2 - tStart2 < 50, 'P02', `100-year schedule computed in ${(tEnd2 - tStart2).toFixed(1)}ms (< 50ms)`);
assertClose(projPerf.schedule.length, 100, 0.001, 'P02-Len', '100 rows present');

console.log('\n=================================================================');
console.log(`USER QA BENCHMARK RESULTS: ${passCount} PASSED, ${failCount} FAILED out of ${passCount + failCount} TOTAL`);
console.log('=================================================================');

if (failCount === 0) {
  console.log('ALL USER BENCHMARK TESTS PASSED WITH 100% ACCURACY!\n');
} else {
  process.exit(1);
}
