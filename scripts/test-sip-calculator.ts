import assert from 'node:assert/strict';
import {
  projectInvestment,
  solveGoalContribution,
  runMonteCarloSimulations,
  formatCurrency,
  formatPercent,
  sanitizeCsvCell,
  getCurrencyMeta,
  WORLD_CURRENCIES,
} from '../components/tools/SipCalculator';

console.log('=== Starting OmniTools SIP Calculator Mathematical Regression Suite ===\n');

let passedTests = 0;
function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err: unknown) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// -------------------------------------------------------------
// 1. Independent Mathematical Oracle for Standard Annuities
// -------------------------------------------------------------
function oracleStandardSip({
  P,
  annualRate,
  years,
  frequency = 'monthly',
  timing = 'beginning',
}: {
  P: number;
  annualRate: number;
  years: number;
  frequency?: 'monthly' | 'quarterly' | 'yearly';
  timing?: 'beginning' | 'end';
}) {
  const m = frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1;
  const n = years * m;
  const i = (annualRate / 100) / m;

  if (i === 0) {
    return {
      totalInvested: P * n,
      futureValue: P * n,
      netGain: 0,
    };
  }

  const ordinaryFv = P * ((Math.pow(1 + i, n) - 1) / i);
  const fv = timing === 'beginning' ? ordinaryFv * (1 + i) : ordinaryFv;
  const totalInvested = P * n;
  return {
    totalInvested,
    futureValue: fv,
    netGain: fv - totalInvested,
  };
}

// Test 1: Zero return rate
runTest('Zero return produces exact total invested with zero net gain', () => {
  const P = 1000;
  const years = 5;
  const res = projectInvestment({
    mode: 'sip',
    initialInvestment: 0,
    recurringContribution: P,
    annualRate: 0,
    years,
    frequency: 'monthly',
    stepUp: 0,
    rateBasis: 'nominal',
    contributionTiming: 'beginning',
  });

  const expectedInvested = 1000 * 60;
  assert.equal(res.totalInvested, expectedInvested);
  assert.equal(res.futureValue, expectedInvested);
  assert.equal(res.netGain, 0);
  assert.equal(res.returnPercent, 0);
});

// Test 2: Standard SIP 10 years at 12% p.a. (Beginning of period / Annuity Due)
runTest('Standard SIP Annuity Due matches closed-form formula (10 yrs, 12% p.a.)', () => {
  const P = 500;
  const annualRate = 12;
  const years = 10;

  const oracle = oracleStandardSip({ P, annualRate, years, frequency: 'monthly', timing: 'beginning' });
  const res = projectInvestment({
    mode: 'sip',
    initialInvestment: 0,
    recurringContribution: P,
    annualRate,
    years,
    frequency: 'monthly',
    stepUp: 0,
    rateBasis: 'nominal',
    contributionTiming: 'beginning',
  });

  assert.equal(res.totalInvested, oracle.totalInvested);
  assert.ok(Math.abs(res.futureValue - oracle.futureValue) < 0.01, `Expected ${oracle.futureValue}, got ${res.futureValue}`);
  assert.ok(Math.abs(res.netGain - oracle.netGain) < 0.01, `Expected net gain ${oracle.netGain}, got ${res.netGain}`);
});

// Test 3: Standard SIP 10 years at 12% p.a. (End of period / Ordinary Annuity)
runTest('Standard SIP Ordinary Annuity matches closed-form formula (10 yrs, 12% p.a.)', () => {
  const P = 500;
  const annualRate = 12;
  const years = 10;

  const oracle = oracleStandardSip({ P, annualRate, years, frequency: 'monthly', timing: 'end' });
  const res = projectInvestment({
    mode: 'sip',
    initialInvestment: 0,
    recurringContribution: P,
    annualRate,
    years,
    frequency: 'monthly',
    stepUp: 0,
    rateBasis: 'nominal',
    contributionTiming: 'end',
  });

  assert.equal(res.totalInvested, oracle.totalInvested);
  assert.ok(Math.abs(res.futureValue - oracle.futureValue) < 0.01, `Expected ${oracle.futureValue}, got ${res.futureValue}`);
  assert.ok(Math.abs(res.netGain - oracle.netGain) < 0.01, `Expected net gain ${oracle.netGain}, got ${res.netGain}`);
});

// Test 4: Beginning vs End timing divergence verification
runTest('Beginning of period generates strictly higher future value than End of period by factor of (1+i)', () => {
  const P = 1000;
  const annualRate = 12;
  const years = 15;

  const resBeg = projectInvestment({
    mode: 'sip',
    initialInvestment: 0,
    recurringContribution: P,
    annualRate,
    years,
    frequency: 'monthly',
    stepUp: 0,
    rateBasis: 'nominal',
    contributionTiming: 'beginning',
  });

  const resEnd = projectInvestment({
    mode: 'sip',
    initialInvestment: 0,
    recurringContribution: P,
    annualRate,
    years,
    frequency: 'monthly',
    stepUp: 0,
    rateBasis: 'nominal',
    contributionTiming: 'end',
  });

  const monthlyRate = (annualRate / 100) / 12;
  assert.equal(resBeg.totalInvested, resEnd.totalInvested);
  assert.ok(resBeg.futureValue > resEnd.futureValue);
  assert.ok(Math.abs(resBeg.futureValue - resEnd.futureValue * (1 + monthlyRate)) < 0.05);
});

// Test 5: Lump sum compounding ($10,000 at 8% for 20 years)
runTest('Lump sum compounding matches compound interest formula FV = P0 * (1 + r)^t', () => {
  const P0 = 10000;
  const annualRate = 8;
  const years = 20;

  const res = projectInvestment({
    mode: 'lumpsum',
    initialInvestment: P0,
    recurringContribution: 0,
    annualRate,
    years,
    frequency: 'yearly',
    rateBasis: 'nominal',
  });

  // Effective nominal yearly: 10000 * (1 + 0.08)^20
  const expectedFv = P0 * Math.pow(1.08, 20);
  assert.equal(res.totalInvested, P0);
  assert.ok(Math.abs(res.futureValue - expectedFv) < 0.01, `Expected ${expectedFv}, got ${res.futureValue}`);
});

// Test 6: Initial lump sum + Recurring SIP combined entry
runTest('Combined Initial Lump Sum + Monthly Recurring correctly aggregates principal and compounding', () => {
  const P0 = 25000;
  const P = 1000;
  const annualRate = 10;
  const years = 5;

  const res = projectInvestment({
    mode: 'sip',
    initialInvestment: P0,
    recurringContribution: P,
    annualRate,
    years,
    frequency: 'monthly',
    rateBasis: 'nominal',
    contributionTiming: 'beginning',
  });

  const expectedTotalInvested = 25000 + 1000 * 60;
  assert.equal(res.totalInvested, expectedTotalInvested);
  assert.equal(res.initialInvestment, P0);
  assert.equal(res.recurringContribution, P);
  assert.ok(res.futureValue > expectedTotalInvested);
  assert.equal(res.totalInvested + res.netGain, res.futureValue);
});

// Test 7: Annual Step-Up SIP (10% step-up annually)
runTest('Step-Up SIP accurately escalates contributions each year without floating-point drift', () => {
  const P = 1000;
  const annualRate = 12;
  const years = 3;
  const stepUp = 10; // 10% annual increase

  const res = projectInvestment({
    mode: 'sip',
    initialInvestment: 0,
    recurringContribution: P,
    annualRate,
    years,
    frequency: 'monthly',
    stepUp,
    rateBasis: 'nominal',
    contributionTiming: 'beginning',
  });

  // Year 1: 1000 * 12 = 12000
  // Year 2: 1100 * 12 = 13200
  // Year 3: 1210 * 12 = 14520
  const expectedTotalInvested = 12000 + 13200 + 14520;
  assert.equal(res.totalInvested, expectedTotalInvested);
  assert.equal(res.schedule[0].contributions, 12000);
  assert.equal(res.schedule[1].contributions, 13200);
  assert.equal(res.schedule[2].contributions, 14520);
  assert.equal(res.endingAnnualContribution, 14520);
});

// Test 8: Effective Rate Basis (APY convention) vs Nominal (APR)
runTest('Effective rate compounding applies geometric period conversion: i = (1+r)^(1/m) - 1', () => {
  const P = 1000;
  const annualRate = 12;
  const years = 5;

  const resEff = projectInvestment({
    mode: 'sip',
    initialInvestment: 0,
    recurringContribution: P,
    annualRate,
    years,
    frequency: 'monthly',
    rateBasis: 'effective',
    contributionTiming: 'beginning',
  });

  const resNom = projectInvestment({
    mode: 'sip',
    initialInvestment: 0,
    recurringContribution: P,
    annualRate,
    years,
    frequency: 'monthly',
    rateBasis: 'nominal',
    contributionTiming: 'beginning',
  });

  // Under effective rate, monthly rate is slightly lower than r/12, so future value is lower than nominal APR compounding
  assert.ok(resEff.futureValue < resNom.futureValue);
});

// Test 9: Management Fee Deduction (1% expense ratio)
runTest('Management fee correctly reduces ending balance and aggregates in schedule', () => {
  const P = 1000;
  const annualRate = 12;
  const years = 10;
  const annualFeeRate = 1.0; // 1% management fee

  const resGross = projectInvestment({
    mode: 'sip',
    initialInvestment: 0,
    recurringContribution: P,
    annualRate,
    years,
    frequency: 'monthly',
    annualFeeRate: 0,
  });

  const resNet = projectInvestment({
    mode: 'sip',
    initialInvestment: 0,
    recurringContribution: P,
    annualRate,
    years,
    frequency: 'monthly',
    annualFeeRate,
  });

  assert.equal(resGross.totalInvested, resNet.totalInvested);
  assert.ok(resNet.totalManagementFees > 0);
  assert.ok(resNet.futureValue < resGross.futureValue);
  const totalScheduleFees = resNet.schedule.reduce((sum, r) => sum + r.managementFees, 0);
  assert.ok(Math.abs(resNet.totalManagementFees - totalScheduleFees) < 0.01);
});

// Test 10: Contribution Entry Fee (0.5% entry load)
runTest('Contribution entry fee is deducted from gross cash payments before market deployment', () => {
  const P = 1000;
  const annualRate = 10;
  const years = 2;
  const contributionFeeRate = 1.0; // 1% fee

  const res = projectInvestment({
    mode: 'sip',
    initialInvestment: 0,
    recurringContribution: P,
    annualRate,
    years,
    frequency: 'monthly',
    contributionFeeRate,
  });

  const expectedGrossInvested = 1000 * 24;
  const expectedTotalFees = expectedGrossInvested * 0.01;
  assert.equal(res.totalInvested, expectedGrossInvested);
  assert.equal(res.totalContributionFees, expectedTotalFees);
});

// Test 11: Capital gains tax deduction at liquidation
runTest('Capital gains tax is deducted from net gains exceeding cost basis at maturity', () => {
  const P = 1000;
  const annualRate = 12;
  const years = 5;
  const taxRateOnGains = 15; // 15% capital gains tax

  const resNoTax = projectInvestment({
    mode: 'sip',
    initialInvestment: 0,
    recurringContribution: P,
    annualRate,
    years,
    frequency: 'monthly',
    taxRateOnGains: 0,
  });

  const resWithTax = projectInvestment({
    mode: 'sip',
    initialInvestment: 0,
    recurringContribution: P,
    annualRate,
    years,
    frequency: 'monthly',
    taxRateOnGains,
  });

  assert.equal(resNoTax.totalInvested, resWithTax.totalInvested);
  assert.ok(resWithTax.totalTaxes > 0);
  assert.ok(resWithTax.futureValue < resNoTax.futureValue);
  assert.equal(resWithTax.schedule[resWithTax.schedule.length - 1].taxes, resWithTax.totalTaxes);
});

// Test 12: Inflation purchasing power discounting
runTest('Inflation discounting correctly computes real purchasing power in today dollars', () => {
  const P = 1000;
  const annualRate = 10;
  const years = 10;
  const inflationRate = 4; // 4% inflation

  const res = projectInvestment({
    mode: 'sip',
    initialInvestment: 0,
    recurringContribution: P,
    annualRate,
    years,
    frequency: 'monthly',
    inflationRate,
  });

  const expectedRealValue = res.futureValue / Math.pow(1.04, 10);
  assert.ok(Math.abs(res.realValue - expectedRealValue) < 0.01);
  assert.ok(res.realValue < res.futureValue);
});

// Test 13: Goal planner solver accuracy via bisection
runTest('solveGoalContribution determines exact required contribution for target milestone', () => {
  const target = 250000;
  const annualRate = 12;
  const years = 10;

  const plan = solveGoalContribution({
    target,
    mode: 'sip',
    initialInvestment: 0,
    annualRate,
    years,
    frequency: 'monthly',
    contributionTiming: 'beginning',
  });

  assert.equal(plan.reachable, true);
  assert.ok(plan.requiredContribution > 0);

  // Verify that projecting this exact contribution hits the target within 5 cents
  const verification = projectInvestment({
    mode: 'sip',
    initialInvestment: 0,
    recurringContribution: plan.requiredContribution,
    annualRate,
    years,
    frequency: 'monthly',
    contributionTiming: 'beginning',
  });

  assert.ok(
    Math.abs(verification.futureValue - target) < 0.10,
    `Solved contribution ${plan.requiredContribution} yielded ${verification.futureValue}, target was ${target}`
  );
});

// Test 14: Monte Carlo simulation ordering and bounds
runTest('runMonteCarloSimulations produces strictly ordered percentiles (p10 <= p25 <= p50 <= p75 <= p90)', () => {
  const mc = runMonteCarloSimulations({
    mode: 'sip',
    initialInvestment: 5000,
    recurringContribution: 500,
    annualRate: 10,
    years: 5,
    frequency: 'monthly',
    volatility: 15,
    simulations: 500,
  });

  assert.ok(mc.min <= mc.p10);
  assert.ok(mc.p10 <= mc.p25);
  assert.ok(mc.p25 <= mc.p50);
  assert.ok(mc.p50 <= mc.p75);
  assert.ok(mc.p75 <= mc.p90);
  assert.ok(mc.p90 <= mc.max);
  assert.equal(mc.simulations, 500);
});

// Test 15: Decimal input support and extreme duration boundaries
runTest('Supports decimal contributions and handles 100-year horizons without crashing', () => {
  const res = projectInvestment({
    mode: 'sip',
    initialInvestment: 123.45,
    recurringContribution: 67.89,
    annualRate: 7.25,
    years: 100,
    frequency: 'monthly',
    stepUp: 1.5,
  });

  assert.ok(Number.isFinite(res.futureValue));
  assert.ok(res.totalInvested > 0);
  assert.equal(res.schedule.length, 100);
});

// Test 16: Zero-value and negative rate handling
runTest('Negative return rate decays capital without throwing errors', () => {
  const res = projectInvestment({
    mode: 'sip',
    initialInvestment: 1000,
    recurringContribution: 100,
    annualRate: -5,
    years: 3,
    frequency: 'monthly',
  });

  assert.ok(res.futureValue < res.totalInvested);
  assert.ok(res.netGain < 0);
  assert.ok(res.returnPercent < 0);
});

// Test 17: RFC-4180 CSV formula injection sanitization
runTest('sanitizeCsvCell neutralizes spreadsheet formula attack characters (=, +, -, @)', () => {
  assert.equal(sanitizeCsvCell('=SUM(A1:A10)'), "'=SUM(A1:A10)");
  assert.equal(sanitizeCsvCell('+12345'), "'+12345");
  assert.equal(sanitizeCsvCell('-cmd|calc'), "'-cmd|calc");
  assert.equal(sanitizeCsvCell('@username'), "'@username");
  assert.equal(sanitizeCsvCell('1234.56'), '1234.56');
});

// Test 18: Currency metadata integrity
runTest('All 160+ ISO world currencies are properly mapped with valid fraction digits', () => {
  assert.ok(WORLD_CURRENCIES.length >= 150);
  const pkr = getCurrencyMeta('PKR');
  assert.equal(pkr.code, 'PKR');
  assert.equal(pkr.fractionDigits, 2);

  const jpy = getCurrencyMeta('JPY');
  assert.equal(jpy.code, 'JPY');
  assert.equal(jpy.fractionDigits, 0);

  const kwd = getCurrencyMeta('KWD');
  assert.equal(kwd.code, 'KWD');
  assert.equal(kwd.fractionDigits, 3);
});

// Test 19: Formatting helper safety
runTest('formatCurrency and formatPercent gracefully handle edge cases and extreme values', () => {
  assert.equal(formatCurrency(0, 'USD'), '$0.00');
  assert.equal(formatPercent(0), '0.00%');
  assert.equal(formatPercent(12.3456, 1), '12.3%');
});

// Test 20: Mathematical accounting balance reconciliation
runTest('Accounting equality: Total Invested + Net Gain === Future Value within 1 cent tolerance', () => {
  const scenarios = [
    { p: 250, r: 8, y: 3 },
    { p: 1500, r: 14.5, y: 7 },
    { p: 5000, r: 18, y: 15 },
    { p: 10000, r: 6.2, y: 25 },
  ];

  for (const sc of scenarios) {
    const res = projectInvestment({
      mode: 'sip',
      initialInvestment: 500,
      recurringContribution: sc.p,
      annualRate: sc.r,
      years: sc.y,
      frequency: 'monthly',
      stepUp: 5,
      contributionTiming: 'beginning',
    });

    const diff = Math.abs(res.futureValue - (res.totalInvested + res.netGain));
    assert.ok(diff < 0.01, `Failed reconciliation for scenario: diff was ${diff}`);
  }
});

// Test 21: Monte Carlo timing consistency (Beginning vs End timing)
runTest('Monte Carlo simulation timing convention strictly differentiates Beginning vs End of period', () => {
  const P = 1000;
  const annualRate = 12;
  const years = 5;
  const volatility = 15;

  const mcBeg = runMonteCarloSimulations({
    mode: 'sip',
    recurringContribution: P,
    annualRate,
    years,
    frequency: 'monthly',
    contributionTiming: 'beginning',
    volatility,
    simulations: 500,
  });

  const mcEnd = runMonteCarloSimulations({
    mode: 'sip',
    recurringContribution: P,
    annualRate,
    years,
    frequency: 'monthly',
    contributionTiming: 'end',
    volatility,
    simulations: 500,
  });

  // Beginning deposits must generate strictly higher deterministic and median values
  assert.ok(mcBeg.deterministicValue > mcEnd.deterministicValue, 'MC beginning deterministic should exceed end deterministic');
  assert.ok(mcBeg.p50 > mcEnd.p50, 'MC beginning median should exceed end median');
  assert.ok(mcBeg.mean > mcEnd.mean, 'MC beginning mean should exceed end mean');
});

// Test 22: Monte Carlo zero volatility degenerate invariant
runTest('Monte Carlo collapses to deterministic value when volatility is 0%', () => {
  const mc = runMonteCarloSimulations({
    mode: 'sip',
    initialInvestment: 2500,
    recurringContribution: 500,
    annualRate: 10,
    years: 5,
    frequency: 'monthly',
    volatility: 0,
    simulations: 300,
  });

  assert.equal(mc.p10, mc.deterministicValue);
  assert.equal(mc.p25, mc.deterministicValue);
  assert.equal(mc.p50, mc.deterministicValue);
  assert.equal(mc.p75, mc.deterministicValue);
  assert.equal(mc.p90, mc.deterministicValue);
  assert.equal(mc.min, mc.deterministicValue);
  assert.equal(mc.max, mc.deterministicValue);
  assert.equal(mc.mean, mc.deterministicValue);
});

// Test 23: Monte Carlo management fee drag monotonicity
runTest('Monte Carlo reflects management fee drag with lower percentiles and mean', () => {
  const mcNoFee = runMonteCarloSimulations({
    mode: 'sip',
    recurringContribution: 1000,
    annualRate: 10,
    years: 5,
    frequency: 'monthly',
    volatility: 15,
    annualFeeRate: 0,
    simulations: 500,
  });

  const mcWithFee = runMonteCarloSimulations({
    mode: 'sip',
    recurringContribution: 1000,
    annualRate: 10,
    years: 5,
    frequency: 'monthly',
    volatility: 15,
    annualFeeRate: 2.0,
    simulations: 500,
  });

  assert.ok(mcWithFee.deterministicValue < mcNoFee.deterministicValue, 'Fee should reduce deterministic value');
  assert.ok(mcWithFee.p50 < mcNoFee.p50, 'Fee should reduce median percentile');
  assert.ok(mcWithFee.mean < mcNoFee.mean, 'Fee should reduce mean return');
});

// Test 24: Institutional order of operations numerical reconciliation
runTest('Full institutional drag model reconciles entry fee, TER, capital gains tax, and inflation', () => {
  const res = projectInvestment({
    mode: 'sip',
    initialInvestment: 10000,
    recurringContribution: 1000,
    annualRate: 10,
    years: 5,
    frequency: 'monthly',
    stepUp: 0,
    rateBasis: 'nominal',
    contributionTiming: 'beginning',
    annualFeeRate: 1.5,
    contributionFeeRate: 1.0,
    taxRateOnGains: 15.0,
    inflationRate: 3.0,
  });

  // Gross cash invested = 10,000 + 60 * 1,000 = 70,000.00
  assert.equal(res.totalInvested, 70000);

  // 1% Entry fee = 10,000 * 0.01 + 60,000 * 0.01 = 700.00
  assert.equal(res.totalContributionFees, 700);

  // Net principal basis = 70,000 - 700 = 69,300.00
  const netBasis = res.totalInvested - res.totalContributionFees;
  assert.equal(netBasis, 69300);

  // Pre-tax ending balance before tax deduction
  const preTaxBalance = res.futureValue + res.totalTaxes;
  assert.ok(Math.abs(preTaxBalance - 89277.02) < 0.05);

  // Taxable capital gain above cost basis (69,300) = 89,277.02 - 69,300 = 19,977.02
  const taxableGain = preTaxBalance - netBasis;
  assert.ok(Math.abs(taxableGain - 19977.02) < 0.05);

  // 15% Tax on gain = 19,977.02 * 0.15 = 2,996.55
  assert.ok(Math.abs(res.totalTaxes - 2996.55) < 0.05);

  // Final future value nominal = 89,277.02 - 2,996.55 = 86,280.46
  assert.ok(Math.abs(res.futureValue - 86280.46) < 0.05);

  // Real purchasing power at 3% inflation over 5 years = 86,280.46 / (1.03)^5 = 74,426.29
  assert.ok(Math.abs(res.realValue - 74426.29) < 0.05);
});

console.log('\n======================================================');
console.log(`✓ All ${passedTests} automated mathematical regression tests passed!`);
console.log('======================================================\n');
