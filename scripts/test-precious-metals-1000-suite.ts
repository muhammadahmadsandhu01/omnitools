/**
 * KivaroTools — 1,000+ Enterprise Test Suite for Precious Metals & Scrap Melt Calculator
 * File: scripts/test-precious-metals-1000-suite.ts
 *
 * 12 Comprehensive Test Blocks (1,350+ Tests Total):
 *  1. Block 1: BIPM/NIST Physical Constants, Updated Units Registry & 9x9 Cross-Unit Matrix
 *  2. Block 2: Upgraded Carat/Karat Hallmarks (ct/K), All 19 Metal Purity Tiers & parseFineness
 *  3. Block 3: 32 Currencies, 32 Countries, FX Conversions & Deterministic Formatters
 *  4. Block 4: Core Engine calculateMeltValue Independent Oracle & FAQ Worked Examples
 *  5. Block 5: UI Calculator Helpers (calculateMeltValue, calculateDealerSpread)
 *  6. Block 6: Dealer Payout Tiers (95% Refiner / 88% Jeweler / 75% Pawn) & Spread Matrix
 *  7. Block 7: Multi-Item Scrap Lot Builder (calculateScrapLot) & Mixed-Metal Conservation
 *  8. Block 8: Quote Freshness State Machine & Clock-Skew / Fallback Isolation
 *  9. Block 9: Bullion Market Calendar, 2024–2030 Holidays & CME Maintenance Break Logic
 * 10. Block 10: CWE-1236 Sanitizer (sanitizeCsvField) & Historical CSV Export Verification
 * 11. Block 11: 100 Adversarial Fuzz Inputs & Engine Performance Throughput Benchmark
 * 12. Block 12: Registry Metadata, 32-Currency/9-Unit Parity, SEO Schema & React SSR
 */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  TROY_OUNCE_TO_GRAMS,
  PENNYWEIGHT_TO_GRAMS,
  AVOIRDUPOIS_OUNCE_TO_GRAMS,
  AVOIRDUPOIS_POUND_TO_GRAMS,
  TOLA_TO_GRAMS,
  KILOGRAM_TO_GRAMS,
  MILLIGRAM_TO_GRAMS,
  TEN_GRAMS_TO_GRAMS,
  GRAM_TO_GRAMS,
  UNITS,
  GOLD_PURITIES,
  SILVER_PURITIES,
  PLATINUM_PURITIES,
  PALLADIUM_PURITIES,
  METAL_PURITIES_MAP,
  METAL_NAMES,
  unitToGrams,
  gramsToUnit,
  convertWeight,
  parseFineness,
  resolvePurity,
  calculateDealerPayoutTiers,
  calculateMeltValue,
  calculateScrapLot,
  type MetalCode,
  type WeightUnit,
  type LotItemInput,
} from '../lib/preciousMetalsEngine';
import {
  getEasternTimeComponents,
  getEasterSunday,
  getThanksgivingDay,
  getMlkDay,
  getPresidentsDay,
  getMemorialDay,
  getLaborDay,
  getJuneteenthObserved,
  getIndependenceDayObserved,
  isBullionMarketHoliday,
  getCmeSpecialSessionStatus,
  getBullionMarketCalendarState,
  formatAge,
  evaluateQuoteFreshness,
} from '../lib/preciousMetalsFreshness';
import PreciousMetals, {
  CURRENCIES,
  COUNTRIES,
  PURITIES,
  UNIT_LABELS,
  BASELINE_PRICES,
  DEFAULT_FX_RATES,
  formatDeterministicTimestamp,
  formatDeterministicDate,
  formatCurrencyValue,
  formatDecimal,
  convertToGrams,
  convertPriceUnit,
  convertCurrency,
  calculateMeltValue as uiCalculateMeltValue,
  calculateDealerSpread,
  sanitizeCsvField,
  generateCsvExport,
  type CurrencyCode,
  type CountryCode,
  type PriceUnit,
  type GoldKarat,
} from '../components/tools/PreciousMetals';
import PreciousMetalsSeo, { PRECIOUS_METALS_FAQS } from '../components/seo/PreciousMetalsSeo';
import { tools } from '../config/toolsData';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assertTest(condition: boolean, id: string, message: string): void {
  totalTests++;
  if (condition) {
    passedTests++;
  } else {
    failedTests++;
    console.error(`❌ [${id}] FAILED: ${message}`);
  }
}

function assertClose(actual: number, expected: number, id: string, message: string, tol = 1e-7): void {
  const diff = Math.abs(actual - expected);
  assertTest(Number.isFinite(actual) && diff <= tol, id, `${message} (actual=${actual}, expected=${expected}, diff=${diff})`);
}

console.log('======================================================================');
console.log('🪙 Running 1,000+ Enterprise Suite: Precious Metals & Scrap Calculator');
console.log('======================================================================\n');

// ============================================================================
// BLOCK 1: Physical Constants, Unit Registry & 9x9 Cross-Unit Matrix
// ============================================================================
console.log('--- Block 1: BIPM/NIST Constants & 9x9 Unit Matrix ---');

assertClose(TROY_OUNCE_TO_GRAMS, 31.1034768, 'B1-CONST-OZT', 'Troy oz = 31.1034768 g');
assertClose(PENNYWEIGHT_TO_GRAMS, 1.55517384, 'B1-CONST-DWT', 'Pennyweight = 1.55517384 g');
assertClose(AVOIRDUPOIS_OUNCE_TO_GRAMS, 28.349523125, 'B1-CONST-AVDP', 'Avdp oz = 28.349523125 g');
assertClose(AVOIRDUPOIS_POUND_TO_GRAMS, 453.59237, 'B1-CONST-LB', 'Pound = 453.59237 g');
assertClose(TOLA_TO_GRAMS, 11.6638038, 'B1-CONST-TOLA', 'Tola = 11.6638038 g');
assertClose(KILOGRAM_TO_GRAMS, 1000.0, 'B1-CONST-KG', 'Kilogram = 1000 g');
assertClose(MILLIGRAM_TO_GRAMS, 0.001, 'B1-CONST-MG', 'Milligram = 0.001 g');
assertClose(TEN_GRAMS_TO_GRAMS, 10.0, 'B1-CONST-10G', '10g = 10.0 g');
assertClose(GRAM_TO_GRAMS, 1.0, 'B1-CONST-G', 'Gram = 1.0 g');

// Verify upgraded '10g' label removed Bhori label confusion
assertTest(UNITS['10g'].label === '10 Grams (10g)', 'B1-UNIT-10G-LABEL', `UNITS['10g'] label updated to "${UNITS['10g'].label}"`);
assertTest(UNITS.troy_oz.isTroy && UNITS.dwt.isTroy && UNITS.tola.isTroy, 'B1-TROY-FLAGS', 'troy_oz, dwt, tola flagged as troy system');
assertTest(!UNITS.gram.isTroy && !UNITS.oz_avdp.isTroy && !UNITS.lb_avdp.isTroy && !UNITS.kg.isTroy, 'B1-NONTROY-FLAGS', 'gram, oz_avdp, lb_avdp, kg flagged non-troy');

const allUnits: WeightUnit[] = ['gram', 'troy_oz', 'oz_avdp', 'dwt', 'tola', 'kg', 'mg', '10g', 'lb_avdp'];
for (const fromUnit of allUnits) {
  assertTest(convertWeight(12.345, fromUnit, fromUnit) === 12.345, `B1-ID-${fromUnit}`, `Identity convertWeight(${fromUnit} -> ${fromUnit}) exact`);
  for (const toUnit of allUnits) {
    const sampleAmount = fromUnit === 'mg' ? 5000 : fromUnit === 'kg' ? 0.25 : 7.5;
    const forward = convertWeight(sampleAmount, fromUnit, toUnit);
    const back = convertWeight(forward, toUnit, fromUnit);
    assertClose(back, sampleAmount, `B1-MATRIX-${fromUnit}-${toUnit}`, `Round-trip ${sampleAmount} ${fromUnit} -> ${toUnit} -> ${fromUnit}`, 1e-8);
    assertTest(forward > 0, `B1-POS-${fromUnit}-${toUnit}`, `Forward conversion ${fromUnit} -> ${toUnit} positive`);
  }
}

for (const badW of [0, -1, -0.001, Number.NaN, Number.POSITIVE_INFINITY]) {
  assertTest(unitToGrams(badW, 'gram') === 0 && gramsToUnit(badW, 'troy_oz') === 0 && convertWeight(badW, 'tola', 'gram') === 0, `B1-BADW-${String(badW)}`, `Non-positive/non-finite ${badW} returns 0`);
}

// ============================================================================
// BLOCK 2: Upgraded Carat/Karat Hallmarks, 19 Purity Tiers & parseFineness
// ============================================================================
console.log('--- Block 2: Upgraded Carat Hallmarks, 19 Purities & parseFineness ---');

assertTest(GOLD_PURITIES.length === 7, 'B2-GOLD-LEN', '7 gold purity tiers registered');
assertTest(SILVER_PURITIES.length === 5, 'B2-SILVER-LEN', '5 silver purity tiers registered');
assertTest(PLATINUM_PURITIES.length === 4, 'B2-PLAT-LEN', '4 platinum purity tiers registered');
assertTest(PALLADIUM_PURITIES.length === 3, 'B2-PALL-LEN', '3 palladium purity tiers registered');

const expectedGoldCaratFineness: Record<string, number> = {
  '24K': 0.999,
  '22K': 22 / 24,
  '21K': 21 / 24,
  '18K': 18 / 24,
  '14K': 14 / 24,
  '10K': 10 / 24,
  '9K': 9 / 24,
};

GOLD_PURITIES.forEach((tier) => {
  const numPart = tier.id.replace('K', '');
  const expectedCt = `${numPart}ct`;
  assertClose(tier.fineness, expectedGoldCaratFineness[tier.id], `B2-AU-FIN-${tier.id}`, `${tier.id} fineness accurate`);
  assertTest(tier.commonHallmarks.includes(expectedCt), `B2-AU-CT-${tier.id}`, `${tier.id} includes "${expectedCt}" UK/SA carat hallmark`);
  assertTest(tier.label.includes(expectedCt), `B2-AU-LBL-${tier.id}`, `${tier.id} label includes "${expectedCt}" synonym`);
});

const tier9k = GOLD_PURITIES.find((g) => g.id === '9K');
assertTest(Boolean(tier9k?.description.includes('South Africa')), 'B2-9K-ZA', '9K gold description mentions South Africa hallmark usage');
const tier18k = GOLD_PURITIES.find((g) => g.id === '18K');
assertTest(tier18k?.shortLabel === '18K / 18ct (75.0%)', 'B2-18K-SHORT', '18K shortLabel explicitly displays 18K / 18ct');

const metals: MetalCode[] = ['XAU', 'XAG', 'XPT', 'XPD'];
for (const m of metals) {
  assertTest(Boolean(METAL_NAMES[m]), `B2-MNAME-${m}`, `METAL_NAMES has ${m}`);
  for (const tier of METAL_PURITIES_MAP[m]) {
    const res = resolvePurity(m, tier.id);
    assertClose(res.fineness, tier.fineness, `B2-RES-${m}-${tier.id}`, `resolvePurity(${m}, ${tier.id}) exact`);
    assertTest(res.label === tier.label && tier.commonHallmarks.length > 0, `B2-HALL-${m}-${tier.id}`, `${m} ${tier.id} label & hallmarks populated`);
  }
  const fb = resolvePurity(m, 'NON_EXISTENT_PURITY');
  assertClose(fb.fineness, METAL_PURITIES_MAP[m][0].fineness, `B2-FB-${m}`, `Unknown purity for ${m} falls back safely to top tier`);
}

// 90 parseFineness checks across decimals, percentages, parts-per-thousand & bounds
for (let i = 1; i <= 25; i++) {
  const dec = Number((i / 25).toFixed(3));
  assertClose(parseFineness(dec), Math.min(1, Math.max(0.001, dec)), `B2-PF-DEC-${i}`, `Decimal fineness ${dec}`, 1e-6);
}
for (let i = 1; i <= 25; i++) {
  const pct = i * 3.8 + 1.5; // 5.3 .. 96.5
  assertClose(parseFineness(pct), pct / 100, `B2-PF-PCT-${i}`, `Percent fineness ${pct}%`, 1e-6);
  assertClose(parseFineness(String(pct)), pct / 100, `B2-PF-PCTSTR-${i}`, `String percent "${pct}"`, 1e-6);
}
for (let i = 1; i <= 25; i++) {
  const ppt = 120 + i * 35; // 155 .. 995
  assertClose(parseFineness(ppt), ppt / 1000, `B2-PF-PPT-${i}`, `PPT fineness ${ppt}`, 1e-6);
}
assertTest(parseFineness(undefined) === 1.0 && parseFineness(1500) === 1.0 && parseFineness(0) === 0 && parseFineness(-10) === 0, 'B2-PF-EDGE', 'parseFineness boundary clamping valid');

// ============================================================================
// BLOCK 3: 32 Currencies, 32 Countries, FX Conversions & Deterministic Formatters
// ============================================================================
console.log('--- Block 3: 32 Currencies, 32 Countries & Formatters ---');

const currencyKeys = Object.keys(CURRENCIES) as CurrencyCode[];
const countryKeys = Object.keys(COUNTRIES) as CountryCode[];
const fxKeys = Object.keys(DEFAULT_FX_RATES) as CurrencyCode[];

assertTest(currencyKeys.length === 32, 'B3-CURR-32', `CURRENCIES exports 32 currencies (got ${currencyKeys.length})`);
assertTest(countryKeys.length === 32, 'B3-CNTRY-32', `COUNTRIES exports 32 markets (got ${countryKeys.length})`);
assertTest(fxKeys.length === 32, 'B3-FX-32', `DEFAULT_FX_RATES covers all 32 currencies (got ${fxKeys.length})`);

for (const cCode of currencyKeys) {
  const meta = CURRENCIES[cCode];
  const fx = DEFAULT_FX_RATES[cCode];
  assertTest(Boolean(meta.symbol && meta.name && meta.flag), `B3-CMETA-${cCode}`, `${cCode} metadata complete`);
  assertTest(Number.isFinite(fx) && fx > 0, `B3-FX-POS-${cCode}`, `${cCode} FX rate positive (${fx})`);
  const converted = convertCurrency(2500, cCode, DEFAULT_FX_RATES);
  const backUsd = cCode === 'USD' ? converted : converted / fx;
  assertClose(backUsd, 2500, `B3-FX-RT-${cCode}`, `${cCode} convertCurrency round-trip invariant`, 1e-6);
}

for (const kCode of countryKeys) {
  const c = COUNTRIES[kCode];
  assertTest(Boolean(CURRENCIES[c.currency]) && Boolean(UNIT_LABELS[c.primaryUnit]) && Boolean(UNIT_LABELS[c.secondaryUnit]), `B3-COUNTRY-LINK-${kCode}`, `${c.name} resolves currency & primary/secondary units`);
}

const priceUnits: PriceUnit[] = ['troy_oz', 'tola', 'gram', '10g', 'kg'];
for (const m of metals) {
  const baseSpot = BASELINE_PRICES[m];
  assertTest(baseSpot > 0, `B3-BASE-${m}`, `Baseline spot for ${m} > 0`);
  for (const pu of priceUnits) {
    const unitPrice = convertPriceUnit(baseSpot, pu);
    assertTest(unitPrice > 0 && Number.isFinite(unitPrice), `B3-UPRICE-${m}-${pu}`, `${m} unit price in ${pu} valid (${unitPrice.toFixed(4)})`);
  }
}

assertTest(formatCurrencyValue(1234.567, 'USD') === '$ 1,234.57', 'B3-FMT-USD', 'USD formats with 2 decimals');
assertTest(formatCurrencyValue(1234.567, 'PKR') === 'Rs 1,235', 'B3-FMT-PKR', 'PKR formats with 0 decimals');
assertTest(formatCurrencyValue(12.3456, 'KWD') === 'KD 12.346', 'B3-FMT-KWD', 'KWD formats with 3 decimals');
assertTest(formatDecimal(987654.321, 2) === '987,654.32', 'B3-FMT-DEC', 'formatDecimal formats commas cleanly');
assertTest(formatDeterministicTimestamp(1792015200000) === '14/10/2026, 22:00:00 UTC', 'B3-FMT-TS', 'Deterministic UTC timestamp exact');
assertTest(formatDeterministicDate(1792015200000) === '14/10/2026', 'B3-FMT-DATE', 'Deterministic UTC date exact');

// ============================================================================
// BLOCK 4: Core Engine calculateMeltValue Independent Oracle Matrix
// ============================================================================
console.log('--- Block 4: Core calculateMeltValue Oracle Across All Metals & Units ---');

const spotSamples: Record<MetalCode, number> = { XAU: 4106.5, XAG: 55.76, XPT: 1605.0, XPD: 1118.0 };
const quantities = [1, 3, 10];

for (const metal of metals) {
  const purities = METAL_PURITIES_MAP[metal];
  for (const unit of allUnits) {
    for (let pIdx = 0; pIdx < purities.length; pIdx++) {
      const purity = purities[pIdx];
      const qty = quantities[(pIdx + unit.length) % quantities.length];
      const weight = 14.75;
      const spot = spotSamples[metal];
      const res = calculateMeltValue({
        metal,
        grossWeight: weight,
        weightUnit: unit,
        purityId: purity.id,
        spotPricePerTroyOz: spot,
        quantity: qty,
      });

      const oracleGrossG = weight * UNITS[unit].gramsPerUnit * qty;
      const oracleFineG = oracleGrossG * purity.fineness;
      const oracleMelt = (oracleFineG / TROY_OUNCE_TO_GRAMS) * spot;

      assertTest(res.isValid, `B4-VALID-${metal}-${unit}-${purity.id}`, `Calculation valid for ${metal} ${purity.id} ${unit}`);
      assertClose(res.totalMeltValue, oracleMelt, `B4-MELT-${metal}-${unit}-${purity.id}`, `totalMeltValue matches independent oracle`, 1e-6);
      assertClose(res.meltValuePerItem * qty, res.totalMeltValue, `B4-QTY-${metal}-${unit}-${purity.id}`, `perItem * qty = totalMeltValue`, 1e-6);
    }
  }
}

// FAQ worked example verification (Silver $50/oz t -> 50g of 925 = $74.35, 100g of 800 = $128.60)
const faqSilver925 = calculateMeltValue({ metal: 'XAG', grossWeight: 50, weightUnit: 'gram', purityId: '925', spotPricePerTroyOz: 50 });
assertClose(faqSilver925.fineWeightGrams, 46.25, 'B4-FAQ-925-FG', '50g 925 sterling = 46.25g pure Ag');
assertClose(faqSilver925.totalMeltValue, 74.35, 'B4-FAQ-925-USD', '50g 925 @ $50/ozt = $74.35', 0.01);

const faqSilver800 = calculateMeltValue({ metal: 'XAG', grossWeight: 100, weightUnit: 'gram', purityId: '800', spotPricePerTroyOz: 50 });
assertClose(faqSilver800.totalMeltValue, 128.60, 'B4-FAQ-800-USD', '100g 800 continental silver @ $50/ozt = $128.60', 0.01);

// Spot price per gram & dwt exact relations
assertClose(faqSilver925.spotPricePerGram * TROY_OUNCE_TO_GRAMS, 50, 'B4-SPOT-G', 'spotPricePerGram * 31.1034768 = spotPerOzt');
assertClose(faqSilver925.spotPricePerDwt * 20, 50, 'B4-SPOT-DWT', 'spotPricePerDwt * 20 = spotPerOzt');

// Invalid inputs rejection
for (const badIn of [
  { metal: 'XAU' as MetalCode, grossWeight: 0, weightUnit: 'gram' as WeightUnit, purityId: '24K', spotPricePerTroyOz: 4000 },
  { metal: 'XAU' as MetalCode, grossWeight: -12, weightUnit: 'tola' as WeightUnit, purityId: '22K', spotPricePerTroyOz: 4000 },
  { metal: 'XAG' as MetalCode, grossWeight: 10, weightUnit: 'gram' as WeightUnit, purityId: '925', spotPricePerTroyOz: 0 },
  { metal: 'XPT' as MetalCode, grossWeight: 10, weightUnit: 'gram' as WeightUnit, purityId: 'Pt950', spotPricePerTroyOz: -50 },
  { metal: 'XPD' as MetalCode, grossWeight: Number.NaN, weightUnit: 'gram' as WeightUnit, purityId: 'Pd950', spotPricePerTroyOz: 1100 },
]) {
  const errRes = calculateMeltValue(badIn);
  assertTest(!errRes.isValid && Boolean(errRes.validationError) && errRes.totalMeltValue === 0, `B4-ERR-${badIn.metal}-${badIn.grossWeight}-${badIn.spotPricePerTroyOz}`, 'Invalid input cleanly rejected with 0 melt');
}

// ============================================================================
// BLOCK 5: UI Calculator Helpers (`uiCalculateMeltValue`, `calculateDealerSpread`)
// ============================================================================
console.log('--- Block 5: UI Calculator Helpers & Spread Formulas ---');

const karats: GoldKarat[] = ['24K', '22K', '21K', '18K', '14K', '9K'];
for (const k of karats) {
  for (const pu of priceUnits) {
    const uiRes = uiCalculateMeltValue('XAU', 10, pu, k, 4000, 'PKR', DEFAULT_FX_RATES);
    const expectedGrams = convertToGrams(10, pu);
    const expectedPureG = expectedGrams * PURITIES[k].ratio;
    const expectedVal = (expectedPureG / TROY_OUNCE_TO_GRAMS) * (4000 * DEFAULT_FX_RATES.PKR);
    assertClose(uiRes.weightGrams, expectedGrams, `B5-UIG-${k}-${pu}`, `UI weightGrams exact for ${k} ${pu}`);
    assertClose(uiRes.baseMarketValue, expectedVal, `B5-UIVAL-${k}-${pu}`, `UI PKR melt value matches oracle for ${k} ${pu}`, 1e-4);
  }
}

for (let i = 0; i < 30; i++) {
  const base = 1000 + i * 250;
  const buyPrem = i * 0.5;
  const sellDisc = i * 2.0;
  const fee = i * 5;
  const sp = calculateDealerSpread(base, buyPrem, sellDisc, fee);
  assertClose(sp.estimatedBuy, base * (1 + buyPrem / 100) + fee, `B5-SP-BUY-${i}`, `Spread buy formula exact (#${i})`);
  assertClose(sp.estimatedSell, Math.max(0, base * (1 - sellDisc / 100) - fee), `B5-SP-SELL-${i}`, `Spread sell formula exact (#${i})`);
  assertTest(sp.estimatedSell >= 0, `B5-SP-NONNEG-${i}`, `Spread sell never negative (#${i})`);
}

// ============================================================================
// BLOCK 6: Dealer Payout Tiers & Spread Sensitivity Matrix
// ============================================================================
console.log('--- Block 6: Dealer Payout Tiers & Sensitivity Matrix ---');

const payoutBases = [100, 500, 1250, 5000, 25000, 100000];
for (const baseVal of payoutBases) {
  const tiers = calculateDealerPayoutTiers(baseVal, { buyPremiumPercent: 4, sellDiscountPercent: 10, fixedFee: 15 });
  assertClose(tiers.meltWholesale, baseVal, `B6-TIER-WHOL-${baseVal}`, '100% melt tier exact');
  assertClose(tiers.refinerHighVolume, baseVal * 0.95, `B6-TIER-REF-${baseVal}`, '95% refiner tier exact');
  assertClose(tiers.dealerBullionCash, baseVal * 0.88, `B6-TIER-DLR-${baseVal}`, '88% jeweler/dealer tier exact');
  assertClose(tiers.pawnShopQuickCash, baseVal * 0.75, `B6-TIER-PAWN-${baseVal}`, '75% pawn reference tier exact');
  assertClose(tiers.userModeledBuy, baseVal * 1.04, `B6-TIER-BUY-${baseVal}`, '+4% modeled buy exact');
  assertClose(tiers.userModeledSell, Math.max(0, baseVal * 0.9 - 15), `B6-TIER-SELL-${baseVal}`, '-10% -$15 modeled sell exact');
}

for (const badMelt of [0, -50, Number.NaN]) {
  const zt = calculateDealerPayoutTiers(badMelt);
  assertTest(zt.meltWholesale === 0 && zt.refinerHighVolume === 0 && zt.userModeledSell === 0 && zt.userModeledBuy === 0, `B6-ZERO-${String(badMelt)}`, 'Non-positive melt zeroes all payout tiers');
}

// Fee exceeding gross melt value clamps cleanly to 0
const extremeFeeTiers = calculateDealerPayoutTiers(50, { sellDiscountPercent: 20, fixedFee: 999 });
assertTest(extremeFeeTiers.userModeledSell === 0, 'B6-FEE-CLAMP', 'Fixed fee > melt value clamps userModeledSell to 0');

// ============================================================================
// BLOCK 7: Multi-Item Scrap Lot Builder (`calculateScrapLot`)
// ============================================================================
console.log('--- Block 7: Multi-Item Scrap Lot Builder & Mixed-Metal Totals ---');

const emptyLot = calculateScrapLot([], spotSamples);
assertTest(emptyLot.itemCount === 0 && emptyLot.grandTotalMeltValue === 0 && emptyLot.grandTotalFineGrams === 0, 'B7-LOT-EMPTY', 'Empty lot returns zero totals');

const mixedLotItems: LotItemInput[] = [
  { id: '1', name: '14K Rope Chain', metal: 'XAU', grossWeight: 22.4, weightUnit: 'gram', purityId: '14K', quantity: 1 },
  { id: '2', name: '22K Bridal Bangles', metal: 'XAU', grossWeight: 2, weightUnit: 'tola', purityId: '22K', quantity: 2 },
  { id: '3', name: '9ct Signet Ring', metal: 'XAU', grossWeight: 5.5, weightUnit: 'dwt', purityId: '9K', quantity: 1 },
  { id: '4', name: 'Sterling Flatware', metal: 'XAG', grossWeight: 300, weightUnit: 'gram', purityId: '925', quantity: 1 },
  { id: '5', name: '800 Silver Tray', metal: 'XAG', grossWeight: 1, weightUnit: 'kg', purityId: '800', quantity: 1 },
  { id: '6', name: 'Pt950 Engagement Band', metal: 'XPT', grossWeight: 12, weightUnit: 'gram', purityId: 'Pt950', quantity: 1 },
  { id: '7', name: 'Pd500 Vintage Ring', metal: 'XPD', grossWeight: 0.5, weightUnit: 'troy_oz', purityId: 'Pd500', quantity: 2 },
  { id: '8', name: 'Custom 19.2K Alloy', metal: 'XAU', grossWeight: 1, weightUnit: '10g', purityId: 'custom', customFineness: 80, quantity: 1 },
  { id: '9', name: 'Invalid Zero Item', metal: 'XAU', grossWeight: 0, weightUnit: 'gram', purityId: '24K', quantity: 1 },
];

const lotRes = calculateScrapLot(mixedLotItems, spotSamples, { sellDiscountPercent: 12, fixedFee: 50 });
assertTest(lotRes.itemCount === 9 && lotRes.items.length === 9, 'B7-LOT-COUNT', 'Preserves all 9 item entries in breakdown');
assertTest(lotRes.metalSummaries.XAU.itemCount === 4, 'B7-LOT-AU-CNT', '4 valid XAU items counted (invalid item #9 skipped from totals)');
assertTest(lotRes.metalSummaries.XAG.itemCount === 2, 'B7-LOT-AG-CNT', '2 valid XAG items counted');
assertTest(lotRes.metalSummaries.XPT.itemCount === 1, 'B7-LOT-PT-CNT', '1 valid XPT item counted');
assertTest(lotRes.metalSummaries.XPD.itemCount === 1, 'B7-LOT-PD-CNT', '1 valid XPD item counted');

const sumByMetal =
  lotRes.metalSummaries.XAU.totalMeltValue +
  lotRes.metalSummaries.XAG.totalMeltValue +
  lotRes.metalSummaries.XPT.totalMeltValue +
  lotRes.metalSummaries.XPD.totalMeltValue;
assertClose(lotRes.grandTotalMeltValue, sumByMetal, 'B7-LOT-CONSERVE-VAL', 'Grand total melt equals sum of 4 metal summaries', 1e-6);

const sumGrossG = lotRes.items.filter((i) => i.isValid).reduce((a, b) => a + b.totalGrossWeightGrams, 0);
const sumFineG = lotRes.items.filter((i) => i.isValid).reduce((a, b) => a + b.fineWeightGrams, 0);
assertClose(lotRes.grandTotalGrossGrams, sumGrossG, 'B7-LOT-CONSERVE-GG', 'Grand total gross grams exact', 1e-6);
assertClose(lotRes.grandTotalFineGrams, sumFineG, 'B7-LOT-CONSERVE-FG', 'Grand total fine grams exact', 1e-6);
assertClose(lotRes.payoutTiers.userModeledSell, lotRes.grandTotalMeltValue * 0.88 - 50, 'B7-LOT-PAYOUT', 'Lot payout tier applies spread & flat fee to grand total', 1e-6);

// ============================================================================
// BLOCK 8: Quote Freshness State Machine & Clock Skew Protection
// ============================================================================
console.log('--- Block 8: Quote Freshness State Machine ---');

const baseOpenUtc = Date.UTC(2026, 4, 14, 15, 0, 0); // Thursday 11:00 ET (Market OPEN)

for (let minsOld = 0; minsOld <= 20; minsOld++) {
  const f = evaluateQuoteFreshness({
    providerTimestampMs: baseOpenUtc - minsOld * 60_000,
    retrievedAtMs: baseOpenUtc,
    nowMs: baseOpenUtc,
    isFallback: false,
    providerName: 'Gold API — Spot Reference',
  });
  assertTest(Boolean(f.state && f.badgeLabel && typeof f.isLive === 'boolean'), `B8-AGE-${minsOld}`, `Freshness evaluated cleanly at ${minsOld}m age`);
  if (minsOld === 0) {
    assertTest(f.isLive && f.state === 'LIVE', 'B8-AGE-0-LIVE', '0m age is LIVE');
  }
}

const staleEval = evaluateQuoteFreshness({
  providerTimestampMs: baseOpenUtc - 180 * 60_000, // 3 hours old while market OPEN
  retrievedAtMs: baseOpenUtc,
  nowMs: baseOpenUtc,
  isFallback: false,
});
assertTest(!staleEval.isLive && staleEval.state !== 'LIVE', 'B8-STALE-3H', '3-hour old quote while open is flagged non-fresh/stale');

const fbEval = evaluateQuoteFreshness({ isFallback: true, providerName: 'Verified Reference Baseline' });
assertTest(fbEval.state === 'FALLBACK_BENCHMARK' && !fbEval.isLive && fbEval.provenance.isFallback, 'B8-FALLBACK', 'Fallback mode strictly isolated');

for (const badTs of [null, undefined, -1, 0, Number.NaN, baseOpenUtc + 10 * 60_000]) {
  const u = evaluateQuoteFreshness({ providerTimestampMs: badTs as number | null | undefined, nowMs: baseOpenUtc });
  assertTest(u.state === 'UNVERIFIED_TIMESTAMP' && !u.isLive, `B8-UNVER-${String(badTs)}`, `Invalid/future timestamp ${badTs} triggers UNVERIFIED_TIMESTAMP`);
}

assertTest(formatAge(500).length > 0 && formatAge(45_000).includes('s') && formatAge(180_000).includes('m') && formatAge(7_200_000).includes('h'), 'B8-FMT-AGE', 'formatAge produces readable s/m/h labels');

// ============================================================================
// BLOCK 9: Bullion Market Calendar, 2024–2030 Holidays & CME Maintenance
// ============================================================================
console.log('--- Block 9: Bullion Market Calendar & 2024–2030 Holidays ---');

const knownEasters: Record<number, [number, number]> = {
  2024: [3, 31],
  2025: [4, 20],
  2026: [4, 5],
  2027: [3, 28],
  2028: [4, 16],
  2029: [4, 1],
  2030: [4, 21],
};
for (const [yrStr, [em, ed]] of Object.entries(knownEasters)) {
  const yr = Number(yrStr);
  const calc = getEasterSunday(yr);
  assertTest(calc.month === em && calc.day === ed, `B9-EASTER-${yr}`, `Easter ${yr} = ${em}/${ed}`);

  const mlk = getMlkDay(yr);
  const pres = getPresidentsDay(yr);
  const mem = getMemorialDay(yr);
  const lab = getLaborDay(yr);
  const thx = getThanksgivingDay(yr);
  const jun = getJuneteenthObserved(yr);
  const ind = getIndependenceDayObserved(yr);

  // Full-day bullion market closures: Jan 1, Dec 25, Good Friday
  const easterDate = new Date(Date.UTC(yr, em - 1, ed));
  const goodFriday = new Date(easterDate.getTime() - 2 * 86_400_000);
  assertTest(isBullionMarketHoliday(yr, 1, 1), `B9-HOL-NYD-${yr}`, `New Year ${yr}-01-01 is bullion holiday`);
  assertTest(isBullionMarketHoliday(yr, 12, 25), `B9-HOL-XMAS-${yr}`, `Christmas ${yr}-12-25 is bullion holiday`);
  assertTest(
    isBullionMarketHoliday(yr, goodFriday.getUTCMonth() + 1, goodFriday.getUTCDate()),
    `B9-HOL-GF-${yr}`,
    `Good Friday ${yr}-${goodFriday.getUTCMonth() + 1}-${goodFriday.getUTCDate()} is bullion holiday`
  );

  // CME Globex Special Sessions (13:00–17:59 ET halts)
  const junDow = new Date(Date.UTC(yr, jun.month - 1, jun.day)).getUTCDay();
  const indDow = new Date(Date.UTC(yr, ind.month - 1, ind.day)).getUTCDay();
  assertTest(getCmeSpecialSessionStatus(yr, 1, mlk, 1, 14, 0)?.reason === 'SPECIAL_SESSION_HALT', `B9-CME-MLK-${yr}`, `MLK Day ${yr}-01-${mlk} 14:00 ET halts`);
  assertTest(getCmeSpecialSessionStatus(yr, 2, pres, 1, 14, 0)?.reason === 'SPECIAL_SESSION_HALT', `B9-CME-PRES-${yr}`, `Presidents Day ${yr}-02-${pres} 14:00 ET halts`);
  assertTest(getCmeSpecialSessionStatus(yr, 5, mem, 1, 14, 0)?.reason === 'SPECIAL_SESSION_HALT', `B9-CME-MEM-${yr}`, `Memorial Day ${yr}-05-${mem} 14:00 ET halts`);
  assertTest(getCmeSpecialSessionStatus(yr, 9, lab, 1, 14, 0)?.reason === 'SPECIAL_SESSION_HALT', `B9-CME-LAB-${yr}`, `Labor Day ${yr}-09-${lab} 14:00 ET halts`);
  assertTest(getCmeSpecialSessionStatus(yr, 11, thx, 4, 14, 0)?.reason === 'SPECIAL_SESSION_HALT', `B9-CME-THX-${yr}`, `Thanksgiving ${yr}-11-${thx} 14:00 ET halts`);
  assertTest(getCmeSpecialSessionStatus(yr, jun.month, jun.day, junDow, 14, 0)?.reason === 'SPECIAL_SESSION_HALT', `B9-CME-JUN-${yr}`, `Juneteenth ${yr}-${jun.month}-${jun.day} 14:00 ET halts`);
  assertTest(getCmeSpecialSessionStatus(yr, ind.month, ind.day, indDow, 14, 0)?.reason === 'SPECIAL_SESSION_HALT', `B9-CME-IND-${yr}`, `Independence Day ${yr}-${ind.month}-${ind.day} 14:00 ET halts`);
}

// CME daily maintenance window (17:00–17:59 ET on Mon–Thu -> MAINTENANCE)
// 2026-05-14 is Thu in EDT (UTC-4): 21:30 UTC = 17:30 ET
const maintDate = new Date(Date.UTC(2026, 4, 14, 21, 30, 0));
const maintState = getBullionMarketCalendarState(maintDate);
assertTest(maintState.status === 'MAINTENANCE', 'B9-CME-MAINT', `Thu 17:30 ET maps to MAINTENANCE (got ${maintState.status})`);

// Weekend closed: Saturday 2026-05-16 12:00 ET = 16:00 UTC
const satState = getBullionMarketCalendarState(new Date(Date.UTC(2026, 4, 16, 16, 0, 0)));
assertTest(satState.status === 'CLOSED', 'B9-WEEKEND-SAT', 'Saturday afternoon maps to CLOSED');

// Sunday Globex Open: 2026-05-17 18:15 ET = 22:15 UTC -> OPEN
const sunOpen = getBullionMarketCalendarState(new Date(Date.UTC(2026, 4, 17, 22, 15, 0)));
assertTest(sunOpen.status === 'OPEN', 'B9-SUN-OPEN', 'Sunday 18:15 ET opens Globex (OPEN)');

// Good Friday & Eastern helpers
const etParts = getEasternTimeComponents(maintDate);
assertTest(etParts.year === 2026 && etParts.month === 5 && etParts.day === 14 && etParts.hour === 17, 'B9-ET-PARTS', 'Eastern time extraction matches EDT 17:xx');
const thxSpec = getCmeSpecialSessionStatus(2026, 11, getThanksgivingDay(2026), 4, 14, 0);
assertTest(thxSpec?.status === 'CLOSED' && thxSpec.isSpecialSession === true, 'B9-CME-SPEC', 'getCmeSpecialSessionStatus closes during Thanksgiving 14:00 ET halt');

// ============================================================================
// BLOCK 10: CWE-1236 Sanitizer & CSV Export Verification
// ============================================================================
console.log('--- Block 10: CWE-1236 CSV Sanitization & Quote Export ---');

const dangerousCells = [
  '=CMD|"/C calc"!A0', '=1+1', '+SUM(A1:A2)', '-2+3', '@SUM(A1)', '\t=1+1', '\r=1+1',
  '=HYPERLINK("http://bad.example")', '=IMPORTXML("x","//a")', '+1+1', '-CMD', '@A1',
  '==CMD', '\tcmd', '\rcmd', '=A1,B1', '+SUM(1,2),"x"', '-1,"quote"', '@SUM("a")',
  '=WEBSERVICE("x")', '=FILTERXML("<a/>","//a")', '+@SUM(1)', '-=1+1', '@-1+1', '=\r\nCMD',
];
dangerousCells.forEach((cell, idx) => {
  const clean = sanitizeCsvField(cell);
  assertTest(!clean.startsWith('=') && !clean.startsWith('+') && !clean.startsWith('-') && !clean.startsWith('@'), `B10-CWE-BAD-${idx}`, `Neutralized formula cell "${cell.slice(0, 12)}" -> "${clean}"`);
  assertTest(clean.includes("'"), `B10-CWE-QUOTE-${idx}`, `Prefix apostrophe inserted for "${cell.slice(0, 12)}"`);
});

const safeCells = ['Gold (XAU)', '24K', '1234.56', 'USD', 'troy_oz', '2026-10-14', 'Yahoo Finance — GC=F', 'spot', 'futures', ''];
safeCells.forEach((cell, idx) => {
  const out = sanitizeCsvField(cell);
  assertTest(out === cell || out === `"${cell}"`, `B10-CWE-SAFE-${idx}`, `Safe cell "${cell}" preserved cleanly`);
});

const csvSample = generateCsvExport(
  [
    { timestamp: Date.UTC(2026, 4, 10), date: '2026-05-10', price: 4100.1234 },
    { timestamp: Date.UTC(2026, 4, 11), date: '2026-05-11', price: 4125.5678 },
    { timestamp: Date.UTC(2026, 4, 12), date: '2026-05-12', price: 4150.9999 },
  ],
  'XAU',
  'USD',
  'troy_oz',
  '=EVIL_SOURCE()',
  '+INJECT_TYPE()'
);
const csvLines = csvSample.split('\n');
assertTest(csvLines.length === 4, 'B10-CSV-ROWS', 'CSV output has 1 header + 3 data rows');
assertTest(csvLines[0].includes('Timestamp_UTC') && csvLines[1].includes("'=EVIL_SOURCE()") && csvLines[1].includes("'+INJECT_TYPE()"), 'B10-CSV-NEUT', 'CSV export neutralizes dangerous source/instrumentType fields');
assertTest(csvLines[2].includes('4125.5678'), 'B10-CSV-PREC', 'CSV formats 4 decimal price places cleanly');

// ============================================================================
// BLOCK 11: 100 Adversarial Fuzz Cases & Throughput Benchmark
// ============================================================================
console.log('--- Block 11: 100 Fuzz Cases & Performance Benchmark ---');

const fuzzWeights = [-1e9, -1, 0, 1e-12, 0.001, 1, 31.1034768, 999999, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
const fuzzSpots = [-100, 0, 0.01, 55.76, 4106.5, 1e7, Number.NaN, Number.POSITIVE_INFINITY];

for (let i = 0; i < 100; i++) {
  const m = metals[i % 4];
  const u = allUnits[i % allUnits.length];
  const w = fuzzWeights[i % fuzzWeights.length];
  const s = fuzzSpots[(i * 3) % fuzzSpots.length];
  let threw = false;
  try {
    const res = calculateMeltValue({
      metal: m,
      grossWeight: w,
      weightUnit: u,
      purityId: i % 5 === 0 ? 'custom' : METAL_PURITIES_MAP[m][0].id,
      customFineness: i % 5 === 0 ? (i * 17) % 1200 : undefined,
      spotPricePerTroyOz: s,
      quantity: i % 7 === 0 ? -3 : 2,
    });
    assertTest(Number.isFinite(res.totalMeltValue) && res.totalMeltValue >= 0, `B11-FUZZ-FIN-${i}`, `Fuzz #${i} produces finite non-negative melt`);
  } catch {
    threw = true;
  }
  assertTest(!threw, `B11-FUZZ-SAFE-${i}`, `Fuzz #${i} did not throw`);
}

// Throughput benchmark: 1,000 single calculations + 100 5-item lot calculations < 250ms
const t0 = performance.now();
for (let i = 0; i < 1000; i++) {
  calculateMeltValue({
    metal: metals[i % 4],
    grossWeight: 10 + (i % 50),
    weightUnit: allUnits[i % allUnits.length],
    purityId: 'custom',
    customFineness: 0.75,
    spotPricePerTroyOz: spotSamples[metals[i % 4]],
  });
}
for (let i = 0; i < 100; i++) {
  calculateScrapLot(mixedLotItems, spotSamples);
}
const benchMs = performance.now() - t0;
assertTest(benchMs < 250, 'B11-BENCH', `1,000 melt + 100 lot calculations completed in ${benchMs.toFixed(1)}ms (<250ms)`);

// ============================================================================
// BLOCK 12: Registry Parity, SEO Schema & React SSR Integrity
// ============================================================================
console.log('--- Block 12: Registry Parity, SEO Schema & React SSR ---');

const pmTool = tools.find((t) => t.id === 'precious-metals');
assertTest(Boolean(pmTool), 'B12-REG-EXISTS', 'precious-metals exists in config/toolsData.ts');
assertTest(pmTool?.slug === 'precious-metals' && pmTool?.categoryId === 'finance' && pmTool?.status === 'published', 'B12-REG-META', 'precious-metals route & published status valid');
assertTest(Boolean(pmTool?.description.includes('32 currencies and 9 weight units')), 'B12-REG-32C', 'Description reflects 32 currencies & 9 weight units');
assertTest(
  Boolean(pmTool?.featureList?.some((f) => f.includes('18K/18ct') && f.includes('9K/9ct'))),
  'B12-REG-CARAT',
  'featureList documents upgraded 18K/18ct & 9K/9ct carat hallmarks'
);
assertTest(
  Boolean(pmTool?.featureList?.some((f) => f.includes('CWE-1236'))),
  'B12-REG-CWE1236',
  'featureList documents CWE-1236 sanitized CSV export'
);
assertTest(
  Boolean(pmTool?.keywords?.includes('800 silver scrap price') && pmTool?.keywords?.includes('scrap gold calculator south africa')),
  'B12-REG-KW',
  'Upgraded target keywords present in config/toolsData.ts'
);
assertTest(Boolean(pmTool?.relatedToolSlugs?.every((s) => tools.some((t) => t.slug === s))), 'B12-REG-REL', 'All relatedToolSlugs resolve in toolsData');

assertTest(PRECIOUS_METALS_FAQS.length >= 10, 'B12-SEO-FAQCOUNT', `PRECIOUS_METALS_FAQS exports ${PRECIOUS_METALS_FAQS.length} FAQs`);
const seoHtml = ReactDOMServer.renderToStaticMarkup(React.createElement(PreciousMetalsSeo));
assertTest(
  seoHtml.includes('application/ld+json') && seoHtml.includes('FAQPage') && seoHtml.includes('HowTo'),
  'B12-SEO-SCHEMA',
  'PreciousMetalsSeo emits FAQPage and HowTo JSON-LD cleanly'
);
assertTest(!seoHtml.includes('"@type":"SoftwareApplication"'), 'B12-SEO-NOSOFT', 'PreciousMetalsSeo omits legacy SoftwareApplication JSON-LD');

const uiHtml = ReactDOMServer.renderToStaticMarkup(React.createElement(PreciousMetals));
assertTest(uiHtml.length > 5000, 'B12-UI-SSR-LEN', `PreciousMetals React SSR rendered ${uiHtml.length} chars cleanly`);
assertTest(uiHtml.includes('18K') && uiHtml.includes('9ct Ring (10g)') && uiHtml.includes('1 Tola 22K Bangle'), 'B12-UI-SSR-CONTENT', 'Upgraded PreciousMetals UI renders quick presets, carat options & calculator');

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n======================================================================');
console.log(`🏁 Test Suite Finished: ${passedTests} / ${totalTests} Passed`);
if (failedTests === 0) {
  console.log(`🎉 100% OF ALL ${totalTests} TESTS PASSED WITH ZERO ERRORS!`);
  console.log('✅ preciousMetalsEngine & PreciousMetals are verified and spec-compliant.');
} else {
  console.error(`❌ ${failedTests} tests failed!`);
  process.exit(1);
}
