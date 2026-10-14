/**
 * @file preciousMetalsEngine.ts
 * @description Canonical mathematical calculation and conversion engine for precious metals valuation.
 * Supports Gold (XAU), Silver (XAG), Platinum (XPT), and Palladium (XPD) with precise physical
 * constants, metal-specific purities, custom fineness, unit conversions, and dealer payout modeling.
 *
 * All formulas use BIPM / NIST standard physical conversion factors.
 */

/* =========================================================================
   1. TYPES & DOMAIN DEFINITIONS
   ========================================================================= */

export type MetalCode = 'XAU' | 'XAG' | 'XPT' | 'XPD';

export type WeightUnit =
  | 'gram'
  | 'troy_oz'
  | 'oz_avdp'
  | 'dwt'
  | 'tola'
  | 'kg'
  | 'mg'
  | '10g'
  | 'lb_avdp';

export interface UnitDefinition {
  key: WeightUnit;
  label: string;
  short: string;
  gramsPerUnit: number;
  description: string;
  isTroy: boolean;
}

export interface PurityTier {
  id: string;
  metal: MetalCode;
  label: string;
  shortLabel: string;
  fineness: number; // Decimal ratio, e.g. 0.75 for 18K
  partsPerThousand: number; // e.g. 750
  karatEquivalent?: string;
  description: string;
  commonHallmarks: string[];
}

export interface DealerSpreadConfig {
  buyPremiumPercent: number; // e.g. 3.0 for +3%
  sellDiscountPercent: number; // e.g. 10.0 for -10%
  fixedFee: number; // e.g. 5.0 for $5 flat refining fee
}

export interface DealerPayoutTiers {
  meltWholesale: number; // 100% Intrinsic spot value
  refinerHighVolume: number; // Default ~95%
  dealerBullionCash: number; // Default ~88% (85%–90%)
  pawnShopQuickCash: number; // Default ~75% (70%–80%)
  userModeledSell: number; // User custom discount & fee
  userModeledBuy: number; // User custom buy premium
}

export interface SingleCalculationInput {
  metal: MetalCode;
  grossWeight: number;
  weightUnit: WeightUnit;
  purityId: string; // PurityTier id or 'custom'
  customFineness?: number; // 0.001 to 1.0 (or percentage 0.1 to 100.0)
  spotPricePerTroyOz: number; // Spot price in target currency
  quantity?: number;
  spreadConfig?: Partial<DealerSpreadConfig>;
}

export interface SingleCalculationResult {
  metal: MetalCode;
  metalName: string;
  grossWeightInput: number;
  grossWeightUnit: WeightUnit;
  quantity: number;
  totalGrossWeightGrams: number;
  totalGrossWeightTroyOz: number;
  finenessDecimal: number;
  purityLabel: string;
  fineWeightGrams: number;
  fineWeightTroyOz: number;
  fineWeightDwt: number;
  spotPricePerTroyOz: number;
  spotPricePerGram: number;
  spotPricePerDwt: number;
  meltValuePerItem: number;
  totalMeltValue: number;
  payoutTiers: DealerPayoutTiers;
  isValid: boolean;
  validationError?: string;
}

export interface LotItemInput {
  id: string;
  name: string;
  metal: MetalCode;
  grossWeight: number;
  weightUnit: WeightUnit;
  purityId: string;
  customFineness?: number;
  quantity?: number;
}

export interface LotItemResult extends SingleCalculationResult {
  id: string;
  name: string;
}

export interface MetalLotSummary {
  metal: MetalCode;
  itemCount: number;
  totalGrossGrams: number;
  totalFineGrams: number;
  totalFineTroyOz: number;
  totalMeltValue: number;
}

export interface LotCalculationResult {
  items: LotItemResult[];
  metalSummaries: Record<MetalCode, MetalLotSummary>;
  grandTotalGrossGrams: number;
  grandTotalFineGrams: number;
  grandTotalMeltValue: number;
  payoutTiers: DealerPayoutTiers;
  itemCount: number;
}

/* =========================================================================
   2. PHYSICAL CONSTANTS & UNIT REGISTRY
   ========================================================================= */

/**
 * Exact NIST / BIPM conversion factors:
 * 1 Troy Ounce = 31.1034768 grams exactly.
 * 1 Pennyweight (dwt) = 1/20 Troy Ounce = 1.55517384 grams exactly.
 * 1 Avoirdupois Ounce = 28.349523125 grams exactly.
 * 1 Avoirdupois Pound = 16 Avoirdupois Ounces = 453.59237 grams exactly.
 * 1 Tola = 180 grains = 3/8 (0.375) Troy Ounce = 11.6638038 grams exactly.
 * 1 Kilogram = 1,000 grams.
 * 1 Milligram = 0.001 grams.
 */
export const TROY_OUNCE_TO_GRAMS = 31.1034768;
export const PENNYWEIGHT_TO_GRAMS = 1.55517384;
export const AVOIRDUPOIS_OUNCE_TO_GRAMS = 28.349523125;
export const AVOIRDUPOIS_POUND_TO_GRAMS = 453.59237;
export const TOLA_TO_GRAMS = 11.6638038;
export const KILOGRAM_TO_GRAMS = 1000.0;
export const MILLIGRAM_TO_GRAMS = 0.001;
export const TEN_GRAMS_TO_GRAMS = 10.0;
export const GRAM_TO_GRAMS = 1.0;

export const UNITS: Record<WeightUnit, UnitDefinition> = {
  gram: {
    key: 'gram',
    label: 'Grams (g)',
    short: 'g',
    gramsPerUnit: GRAM_TO_GRAMS,
    description: 'Metric international standard gram weight.',
    isTroy: false,
  },
  troy_oz: {
    key: 'troy_oz',
    label: 'Troy Ounces (oz t / ozt)',
    short: 'oz t',
    gramsPerUnit: TROY_OUNCE_TO_GRAMS,
    description: 'Standard wholesale bullion trading weight = 31.1035 g.',
    isTroy: true,
  },
  dwt: {
    key: 'dwt',
    label: 'Pennyweight (dwt)',
    short: 'dwt',
    gramsPerUnit: PENNYWEIGHT_TO_GRAMS,
    description: 'Common US jeweler bench unit = 1/20 troy oz = 1.5552 g.',
    isTroy: true,
  },
  oz_avdp: {
    key: 'oz_avdp',
    label: 'Avoirdupois Ounces (kitchen scale oz)',
    short: 'oz (avdp)',
    gramsPerUnit: AVOIRDUPOIS_OUNCE_TO_GRAMS,
    description: 'Standard household kitchen scale ounce = 28.3495 g (~8.86% lighter than troy oz).',
    isTroy: false,
  },
  lb_avdp: {
    key: 'lb_avdp',
    label: 'Pounds (lb)',
    short: 'lb',
    gramsPerUnit: AVOIRDUPOIS_POUND_TO_GRAMS,
    description: 'Standard avoirdupois pound = 16 oz = 453.5924 g.',
    isTroy: false,
  },
  tola: {
    key: 'tola',
    label: 'Tola (South Asian / Gulf standard)',
    short: 'tola',
    gramsPerUnit: TOLA_TO_GRAMS,
    description: 'Traditional Vedic & Middle Eastern standard = 180 grains = 11.6638 g = 0.375 troy oz.',
    isTroy: true,
  },
  kg: {
    key: 'kg',
    label: 'Kilograms (kg)',
    short: 'kg',
    gramsPerUnit: KILOGRAM_TO_GRAMS,
    description: '1,000 grams = 32.1507 troy ounces (standard wholesale bullion bar size).',
    isTroy: false,
  },
  '10g': {
    key: '10g',
    label: '10 Grams (10g / Bhori)',
    short: '10g',
    gramsPerUnit: TEN_GRAMS_TO_GRAMS,
    description: 'Common Indian and Asian retail denomination = 10.0 grams.',
    isTroy: false,
  },
  mg: {
    key: 'mg',
    label: 'Milligrams (mg)',
    short: 'mg',
    gramsPerUnit: MILLIGRAM_TO_GRAMS,
    description: '0.001 grams for micro-scale and casting grain weight.',
    isTroy: false,
  },
};

/* =========================================================================
   3. PURITY & FINENESS STANDARDS REGISTRY
   ========================================================================= */

export const GOLD_PURITIES: PurityTier[] = [
  {
    id: '24K',
    metal: 'XAU',
    label: '24 Karat (24K) — 99.9% Pure Fine Gold',
    shortLabel: '24K (99.9%)',
    fineness: 0.999,
    partsPerThousand: 999,
    karatEquivalent: '24K',
    description: 'Investment bullion bars, sovereign minted coins (999 or 999.9 fineness).',
    commonHallmarks: ['999', '999.9', '24K', '.999'],
  },
  {
    id: '22K',
    metal: 'XAU',
    label: '22 Karat (22K) — 91.67% Fine Gold (Crown Gold)',
    shortLabel: '22K (91.7%)',
    fineness: 22 / 24, // 0.9166666666666666
    partsPerThousand: 916.7,
    karatEquivalent: '22K',
    description: 'Traditional South Asian, Middle Eastern bridal jewelry and British Sovereigns.',
    commonHallmarks: ['916', '22K', '.916'],
  },
  {
    id: '21K',
    metal: 'XAU',
    label: '21 Karat (21K) — 87.5% Fine Gold',
    shortLabel: '21K (87.5%)',
    fineness: 21 / 24, // 0.875
    partsPerThousand: 875.0,
    karatEquivalent: '21K',
    description: 'Popular in Arabian Gulf, Egypt, and Mediterranean fine artisanal jewelry.',
    commonHallmarks: ['875', '21K', '.875'],
  },
  {
    id: '18K',
    metal: 'XAU',
    label: '18 Karat (18K) — 75.0% Fine Gold',
    shortLabel: '18K (75.0%)',
    fineness: 18 / 24, // 0.750
    partsPerThousand: 750.0,
    karatEquivalent: '18K',
    description: 'Global standard for luxury diamond mountings, fine jewelry and Swiss timepieces.',
    commonHallmarks: ['750', '18K', '18KT', '.750'],
  },
  {
    id: '14K',
    metal: 'XAU',
    label: '14 Karat (14K) — 58.33% Fine Gold',
    shortLabel: '14K (58.3%)',
    fineness: 14 / 24, // 0.5833333333333334
    partsPerThousand: 583.3,
    karatEquivalent: '14K',
    description: 'Most common North American everyday durable jewelry alloy (stamped 585 or 14K).',
    commonHallmarks: ['585', '583', '14K', '14KT', '.585'],
  },
  {
    id: '10K',
    metal: 'XAU',
    label: '10 Karat (10K) — 41.67% Fine Gold',
    shortLabel: '10K (41.7%)',
    fineness: 10 / 24, // 0.4166666666666667
    partsPerThousand: 416.7,
    karatEquivalent: '10K',
    description: 'Minimum legal karat standard in the United States; common in school class rings.',
    commonHallmarks: ['417', '416', '10K', '10KT', '.417'],
  },
  {
    id: '9K',
    metal: 'XAU',
    label: '9 Karat (9K) — 37.5% Fine Gold',
    shortLabel: '9K (37.5%)',
    fineness: 9 / 24, // 0.375
    partsPerThousand: 375.0,
    karatEquivalent: '9K',
    description: 'Popular entry-level commercial jewelry hallmark in the UK, Australia, and New Zealand.',
    commonHallmarks: ['375', '9K', '.375'],
  },
];

export const SILVER_PURITIES: PurityTier[] = [
  {
    id: '999',
    metal: 'XAG',
    label: 'Fine Silver (.999) — 99.9% Pure Silver',
    shortLabel: 'Fine 999 (99.9%)',
    fineness: 0.999,
    partsPerThousand: 999.0,
    description: 'Pure investment bullion bars, rounds, and Silver Maples.',
    commonHallmarks: ['999', '9999', '.999', 'FS'],
  },
  {
    id: '958',
    metal: 'XAG',
    label: 'Britannia Silver (.958) — 95.8% Pure Silver',
    shortLabel: 'Britannia 958 (95.8%)',
    fineness: 0.958,
    partsPerThousand: 958.0,
    description: 'Historical British standard introduced in 1697 and early Britannia coins.',
    commonHallmarks: ['958', '.958'],
  },
  {
    id: '925',
    metal: 'XAG',
    label: 'Sterling Silver (.925) — 92.5% Pure Silver',
    shortLabel: 'Sterling 925 (92.5%)',
    fineness: 0.925,
    partsPerThousand: 925.0,
    description: 'Universal standard for silver tableware, holloware, flatware, and fine jewelry.',
    commonHallmarks: ['925', 'STERLING', 'STER', '.925'],
  },
  {
    id: '900',
    metal: 'XAG',
    label: 'Coin Silver / US 90% Junk Silver (.900)',
    shortLabel: 'Coin 900 (90.0%)',
    fineness: 0.900,
    partsPerThousand: 900.0,
    description: 'Pre-1965 US dimes, quarters, and half-dollars, plus historical European coinage.',
    commonHallmarks: ['900', 'COIN', '.900'],
  },
  {
    id: '800',
    metal: 'XAG',
    label: 'European Continental Silver (.800) — 80.0% Pure',
    shortLabel: 'European 800 (80.0%)',
    fineness: 0.800,
    partsPerThousand: 800.0,
    description: 'Traditional German, Italian, and continental European decorative silver.',
    commonHallmarks: ['800', '.800'],
  },
];

export const PLATINUM_PURITIES: PurityTier[] = [
  {
    id: 'Pt999',
    metal: 'XPT',
    label: 'Fine Platinum (.999) — 99.9% Pure Platinum',
    shortLabel: 'Pt999 (99.9%)',
    fineness: 0.999,
    partsPerThousand: 999.0,
    description: 'Investment bullion bars and legal tender platinum sovereign coins.',
    commonHallmarks: ['999', 'Pt999', 'PLAT999'],
  },
  {
    id: 'Pt950',
    metal: 'XPT',
    label: 'Platinum 950 (.950) — 95.0% Pure Platinum',
    shortLabel: 'Pt950 (95.0%)',
    fineness: 0.950,
    partsPerThousand: 950.0,
    description: 'Standard global benchmark for platinum engagement rings and fine jewelry.',
    commonHallmarks: ['950', 'Pt950', 'PLAT', 'PLAT950'],
  },
  {
    id: 'Pt900',
    metal: 'XPT',
    label: 'Platinum 900 (.900) — 90.0% Pure Platinum',
    shortLabel: 'Pt900 (90.0%)',
    fineness: 0.900,
    partsPerThousand: 900.0,
    description: 'Traditional Japanese fine jewelry standard and vintage platinum settings.',
    commonHallmarks: ['900', 'Pt900', 'PLAT900'],
  },
  {
    id: 'Pt850',
    metal: 'XPT',
    label: 'Platinum 850 (.850) — 85.0% Pure Platinum',
    shortLabel: 'Pt850 (85.0%)',
    fineness: 0.850,
    partsPerThousand: 850.0,
    description: 'Hard platinum alloy used for delicate chainwork and high-wear components.',
    commonHallmarks: ['850', 'Pt850'],
  },
];

export const PALLADIUM_PURITIES: PurityTier[] = [
  {
    id: 'Pd999',
    metal: 'XPD',
    label: 'Fine Palladium (.999) — 99.9% Pure Palladium',
    shortLabel: 'Pd999 (99.9%)',
    fineness: 0.999,
    partsPerThousand: 999.0,
    description: 'Bullion investment bars and mint-issued palladium rounds.',
    commonHallmarks: ['999', 'Pd999', '.999'],
  },
  {
    id: 'Pd950',
    metal: 'XPD',
    label: 'Palladium 950 (.950) — 95.0% Pure Palladium',
    shortLabel: 'Pd950 (95.0%)',
    fineness: 0.950,
    partsPerThousand: 950.0,
    description: 'Hallmark standard for palladium wedding bands and jewelry.',
    commonHallmarks: ['950', 'Pd950', '.950'],
  },
  {
    id: 'Pd500',
    metal: 'XPD',
    label: 'Palladium 500 (.500) — 50.0% Pure Palladium',
    shortLabel: 'Pd500 (50.0%)',
    fineness: 0.500,
    partsPerThousand: 500.0,
    description: 'Lightweight commercial jewelry alloy hallmarked in the UK and Europe.',
    commonHallmarks: ['500', 'Pd500', '.500'],
  },
];

export const METAL_PURITIES_MAP: Record<MetalCode, PurityTier[]> = {
  XAU: GOLD_PURITIES,
  XAG: SILVER_PURITIES,
  XPT: PLATINUM_PURITIES,
  XPD: PALLADIUM_PURITIES,
};

export const METAL_NAMES: Record<MetalCode, string> = {
  XAU: 'Gold',
  XAG: 'Silver',
  XPT: 'Platinum',
  XPD: 'Palladium',
};

/* =========================================================================
   4. CONVERSION HELPERS
   ========================================================================= */

/**
 * Converts any registered weight unit amount into grams.
 */
export function unitToGrams(amount: number, unit: WeightUnit): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  const config = UNITS[unit];
  if (!config) return 0;
  return amount * config.gramsPerUnit;
}

/**
 * Converts grams into any target registered weight unit.
 */
export function gramsToUnit(grams: number, targetUnit: WeightUnit): number {
  if (!Number.isFinite(grams) || grams <= 0) return 0;
  const config = UNITS[targetUnit];
  if (!config || config.gramsPerUnit <= 0) return 0;
  return grams / config.gramsPerUnit;
}

/**
 * Converts an amount from one unit directly to another.
 */
export function convertWeight(
  amount: number,
  fromUnit: WeightUnit,
  toUnit: WeightUnit
): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (fromUnit === toUnit) return amount;
  const grams = unitToGrams(amount, fromUnit);
  return gramsToUnit(grams, toUnit);
}

/**
 * Normalizes custom fineness input.
 * Accepts:
 * - Decimals: 0.001 to 1.0 (e.g. 0.925 -> 0.925)
 * - Percentages: 0.1 to 100.0 (e.g. 92.5 -> 0.925)
 * - Parts per thousand: 1.0 to 1000.0 (e.g. 925 -> 0.925)
 */
export function parseFineness(val: number | string | undefined): number {
  if (val === undefined || val === null) return 1.0;
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (!Number.isFinite(num) || num <= 0) return 0;

  if (num <= 1.0) {
    return Math.min(1.0, Math.max(0.001, num));
  }
  if (num <= 100.0) {
    return Math.min(1.0, Math.max(0.001, num / 100.0));
  }
  if (num <= 1000.0) {
    return Math.min(1.0, Math.max(0.001, num / 1000.0));
  }
  return 1.0;
}

/**
 * Resolves the effective fineness decimal and human-readable label for any metal and purity key.
 */
export function resolvePurity(
  metal: MetalCode,
  purityId: string,
  customFineness?: number
): { fineness: number; label: string } {
  if (purityId === 'custom') {
    const fineness = parseFineness(customFineness);
    const pct = (fineness * 100).toFixed(2);
    const ppt = (fineness * 1000).toFixed(1);
    return {
      fineness,
      label: `Custom Fineness (${pct}% / ${ppt}‰)`,
    };
  }

  const list = METAL_PURITIES_MAP[metal] || [];
  const found = list.find((p) => p.id === purityId);

  if (found) {
    return {
      fineness: found.fineness,
      label: found.label,
    };
  }

  // Fallback to top purity for the metal
  const fallback = list[0];
  if (fallback) {
    return {
      fineness: fallback.fineness,
      label: fallback.label,
    };
  }

  return { fineness: 1.0, label: 'Pure Fine Metal (100%)' };
}

/* =========================================================================
   5. DEALER SPREAD & PAYOUT SCENARIOS
   ========================================================================= */

const DEFAULT_SPREAD: DealerSpreadConfig = {
  buyPremiumPercent: 3.0,
  sellDiscountPercent: 12.0,
  fixedFee: 0.0,
};

export function calculateDealerPayoutTiers(
  baseMeltValue: number,
  config?: Partial<DealerSpreadConfig>
): DealerPayoutTiers {
  if (!Number.isFinite(baseMeltValue) || baseMeltValue <= 0) {
    return {
      meltWholesale: 0,
      refinerHighVolume: 0,
      dealerBullionCash: 0,
      pawnShopQuickCash: 0,
      userModeledSell: 0,
      userModeledBuy: 0,
    };
  }

  const spread = { ...DEFAULT_SPREAD, ...config };

  // Industry benchmark estimates:
  // - Refiner (high volume direct melt): ~95%
  // - Bullion dealer / local jeweler cash offer: ~88% (85%–90% range)
  // - Pawn shop / mall cash buyer: ~75% (70%–80% range)
  const refinerHighVolume = Math.max(0, baseMeltValue * 0.95);
  const dealerBullionCash = Math.max(0, baseMeltValue * 0.88);
  const pawnShopQuickCash = Math.max(0, baseMeltValue * 0.75);

  // User modeled scenarios:
  const userModeledBuy = Math.max(0, baseMeltValue * (1 + spread.buyPremiumPercent / 100));
  const userModeledSell = Math.max(
    0,
    baseMeltValue * (1 - spread.sellDiscountPercent / 100) - spread.fixedFee
  );

  return {
    meltWholesale: baseMeltValue,
    refinerHighVolume,
    dealerBullionCash,
    pawnShopQuickCash,
    userModeledSell,
    userModeledBuy,
  };
}

/* =========================================================================
   6. CORE CALCULATION ENGINES
   ========================================================================= */

/**
 * Calculates melt value and payout breakdowns for a single precious metal item.
 */
export function calculateMeltValue(input: SingleCalculationInput): SingleCalculationResult {
  const metalName = METAL_NAMES[input.metal] || input.metal;
  const quantity = Math.max(1, Math.floor(input.quantity ?? 1));
  const rawWeight = input.grossWeight;
  const unit = input.weightUnit;
  const spotPrice = input.spotPricePerTroyOz;

  // Validation
  if (!Number.isFinite(rawWeight) || rawWeight <= 0) {
    return createEmptyResult(input, 'Please enter a valid weight greater than zero.');
  }
  if (!Number.isFinite(spotPrice) || spotPrice <= 0) {
    return createEmptyResult(input, 'Spot reference price must be greater than zero.');
  }

  const singleGrossGrams = unitToGrams(rawWeight, unit);
  const totalGrossGrams = singleGrossGrams * quantity;
  const totalGrossTroyOz = totalGrossGrams / TROY_OUNCE_TO_GRAMS;

  const { fineness, label } = resolvePurity(
    input.metal,
    input.purityId,
    input.customFineness
  );

  const totalFineGrams = totalGrossGrams * fineness;
  const totalFineTroyOz = totalFineGrams / TROY_OUNCE_TO_GRAMS;
  const totalFineDwt = totalFineGrams / PENNYWEIGHT_TO_GRAMS;

  const spotPerGram = spotPrice / TROY_OUNCE_TO_GRAMS;
  const spotPerDwt = spotPrice / 20.0; // 20 dwt per troy ounce

  const totalMeltValue = totalFineTroyOz * spotPrice;
  const meltValuePerItem = quantity > 1 ? totalMeltValue / quantity : totalMeltValue;

  const payoutTiers = calculateDealerPayoutTiers(totalMeltValue, input.spreadConfig);

  return {
    metal: input.metal,
    metalName,
    grossWeightInput: rawWeight,
    grossWeightUnit: unit,
    quantity,
    totalGrossWeightGrams: totalGrossGrams,
    totalGrossWeightTroyOz: totalGrossTroyOz,
    finenessDecimal: fineness,
    purityLabel: label,
    fineWeightGrams: totalFineGrams,
    fineWeightTroyOz: totalFineTroyOz,
    fineWeightDwt: totalFineDwt,
    spotPricePerTroyOz: spotPrice,
    spotPricePerGram: spotPerGram,
    spotPricePerDwt: spotPerDwt,
    meltValuePerItem,
    totalMeltValue,
    payoutTiers,
    isValid: true,
  };
}

function createEmptyResult(
  input: SingleCalculationInput,
  error: string
): SingleCalculationResult {
  const metalName = METAL_NAMES[input.metal] || input.metal;
  return {
    metal: input.metal,
    metalName,
    grossWeightInput: input.grossWeight || 0,
    grossWeightUnit: input.weightUnit,
    quantity: input.quantity ?? 1,
    totalGrossWeightGrams: 0,
    totalGrossWeightTroyOz: 0,
    finenessDecimal: 0,
    purityLabel: 'N/A',
    fineWeightGrams: 0,
    fineWeightTroyOz: 0,
    fineWeightDwt: 0,
    spotPricePerTroyOz: input.spotPricePerTroyOz || 0,
    spotPricePerGram: 0,
    spotPricePerDwt: 0,
    meltValuePerItem: 0,
    totalMeltValue: 0,
    payoutTiers: calculateDealerPayoutTiers(0),
    isValid: false,
    validationError: error,
  };
}

/**
 * Calculates multi-item scrap lots summing multiple metals, purities, and units.
 */
export function calculateScrapLot(
  items: LotItemInput[],
  spotPrices: Record<MetalCode, number>,
  spreadConfig?: Partial<DealerSpreadConfig>
): LotCalculationResult {
  const itemResults: LotItemResult[] = [];

  const metalSummaries: Record<MetalCode, MetalLotSummary> = {
    XAU: { metal: 'XAU', itemCount: 0, totalGrossGrams: 0, totalFineGrams: 0, totalFineTroyOz: 0, totalMeltValue: 0 },
    XAG: { metal: 'XAG', itemCount: 0, totalGrossGrams: 0, totalFineGrams: 0, totalFineTroyOz: 0, totalMeltValue: 0 },
    XPT: { metal: 'XPT', itemCount: 0, totalGrossGrams: 0, totalFineGrams: 0, totalFineTroyOz: 0, totalMeltValue: 0 },
    XPD: { metal: 'XPD', itemCount: 0, totalGrossGrams: 0, totalFineGrams: 0, totalFineTroyOz: 0, totalMeltValue: 0 },
  };

  let grandTotalGrossGrams = 0;
  let grandTotalFineGrams = 0;
  let grandTotalMeltValue = 0;

  for (const item of items) {
    const spot = spotPrices[item.metal] || 0;
    const calc = calculateMeltValue({
      metal: item.metal,
      grossWeight: item.grossWeight,
      weightUnit: item.weightUnit,
      purityId: item.purityId,
      customFineness: item.customFineness,
      spotPricePerTroyOz: spot,
      quantity: item.quantity ?? 1,
      spreadConfig,
    });

    itemResults.push({
      ...calc,
      id: item.id,
      name: item.name || `${item.metal} item`,
    });

    if (calc.isValid) {
      const summary = metalSummaries[item.metal];
      summary.itemCount += 1;
      summary.totalGrossGrams += calc.totalGrossWeightGrams;
      summary.totalFineGrams += calc.fineWeightGrams;
      summary.totalFineTroyOz += calc.fineWeightTroyOz;
      summary.totalMeltValue += calc.totalMeltValue;

      grandTotalGrossGrams += calc.totalGrossWeightGrams;
      grandTotalFineGrams += calc.fineWeightGrams;
      grandTotalMeltValue += calc.totalMeltValue;
    }
  }

  const grandPayoutTiers = calculateDealerPayoutTiers(grandTotalMeltValue, spreadConfig);

  return {
    items: itemResults,
    metalSummaries,
    grandTotalGrossGrams,
    grandTotalFineGrams,
    grandTotalMeltValue,
    payoutTiers: grandPayoutTiers,
    itemCount: items.length,
  };
}
