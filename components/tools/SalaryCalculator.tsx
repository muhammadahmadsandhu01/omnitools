'use client';

import { useId, useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Info,
  Sliders,
  X,
  Globe,
  Building2,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

/* =========================================================================
   1. GLOBAL COUNTRY / TERRITORY CATALOGUE & TAXONOMY (212 JURISDICTIONS)
   ========================================================================= */

export type CalculationStatus = 'VERIFIED' | 'LIMITED' | 'CUSTOM_ESTIMATE' | 'UNAVAILABLE' | 'CUSTOM';
export type CalculationFreshness = 'CURRENT' | 'STALE';

export type RulesetMaturity =
  | 'VERIFIED_CURRENT'
  | 'VERIFIED_HISTORICAL'
  | 'LIMITED_CURRENT'
  | 'LIMITED_HISTORICAL'
  | 'CUSTOM_ESTIMATE'
  | 'STALE'
  | 'UNAVAILABLE';

export function getRulesetMaturity(country: CountryDefinition, selectedTaxYear: string): RulesetMaturity {
  if (country.status === 'UNAVAILABLE') return 'UNAVAILABLE';
  if (country.status === 'CUSTOM_ESTIMATE' || country.status === 'CUSTOM') return 'CUSTOM_ESTIMATE';
  if (country.freshness === 'STALE') return 'STALE';

  const isCurrentYear = selectedTaxYear === country.defaultTaxYear;

  if (country.status === 'VERIFIED') {
    return isCurrentYear ? 'VERIFIED_CURRENT' : 'VERIFIED_HISTORICAL';
  }

  if (country.status === 'LIMITED') {
    return isCurrentYear ? 'LIMITED_CURRENT' : 'LIMITED_HISTORICAL';
  }

  return 'CUSTOM_ESTIMATE';
}

export function getMaturityLabel(maturity: RulesetMaturity): string {
  switch (maturity) {
    case 'VERIFIED_CURRENT':
      return 'Verified Current Statutory';
    case 'VERIFIED_HISTORICAL':
      return 'Verified Historical Ruleset';
    case 'LIMITED_CURRENT':
      return 'Limited Current Statutory';
    case 'LIMITED_HISTORICAL':
      return 'Limited Historical Ruleset';
    case 'CUSTOM_ESTIMATE':
      return 'User-Defined Custom Estimate';
    case 'STALE':
      return 'Stale Statutory Verification';
    case 'UNAVAILABLE':
      return 'Statutory Model Unavailable';
  }
}

export interface ComponentCoverage {
  incomeTax: 'Full Statutory Slabs' | 'Standard Benchmark' | 'User Custom Estimate';
  employeeContributions: 'Full Statutory Schemes' | 'Benchmark Scope' | 'User Custom Estimate' | 'Exempt / Zero';
  employerContributions: 'Full Statutory Schemes' | 'Benchmark Scope' | 'User Custom Estimate' | 'Exempt / Zero';
  regionalRules: 'Full Devolved / State Rates' | 'Standard Benchmark' | 'Federal Only / None';
  benefitsModel: 'Full Pre/Post Tax Model' | 'Custom User Entered';
}

export function getComponentCoverage(countryCode: string): ComponentCoverage {
  switch (countryCode) {
    case 'PK':
      return {
        incomeTax: 'Full Statutory Slabs',
        employeeContributions: 'Full Statutory Schemes',
        employerContributions: 'Full Statutory Schemes',
        regionalRules: 'Federal Only / None',
        benefitsModel: 'Full Pre/Post Tax Model',
      };
    case 'GB':
      return {
        incomeTax: 'Full Statutory Slabs',
        employeeContributions: 'Full Statutory Schemes',
        employerContributions: 'Full Statutory Schemes',
        regionalRules: 'Full Devolved / State Rates',
        benefitsModel: 'Full Pre/Post Tax Model',
      };
    case 'DE':
      return {
        incomeTax: 'Full Statutory Slabs',
        employeeContributions: 'Full Statutory Schemes',
        employerContributions: 'Full Statutory Schemes',
        regionalRules: 'Full Devolved / State Rates',
        benefitsModel: 'Full Pre/Post Tax Model',
      };
    case 'IN':
      return {
        incomeTax: 'Full Statutory Slabs',
        employeeContributions: 'Full Statutory Schemes',
        employerContributions: 'Benchmark Scope',
        regionalRules: 'Federal Only / None',
        benefitsModel: 'Full Pre/Post Tax Model',
      };
    case 'AU':
      return {
        incomeTax: 'Full Statutory Slabs',
        employeeContributions: 'Full Statutory Schemes',
        employerContributions: 'Full Statutory Schemes',
        regionalRules: 'Federal Only / None',
        benefitsModel: 'Full Pre/Post Tax Model',
      };
    case 'US':
      return {
        incomeTax: 'Full Statutory Slabs',
        employeeContributions: 'Full Statutory Schemes',
        employerContributions: 'Full Statutory Schemes',
        regionalRules: 'Full Devolved / State Rates',
        benefitsModel: 'Full Pre/Post Tax Model',
      };
    case 'CA':
      return {
        incomeTax: 'Full Statutory Slabs',
        employeeContributions: 'Full Statutory Schemes',
        employerContributions: 'Benchmark Scope',
        regionalRules: 'Full Devolved / State Rates',
        benefitsModel: 'Full Pre/Post Tax Model',
      };
    case 'SG':
      return {
        incomeTax: 'Full Statutory Slabs',
        employeeContributions: 'Full Statutory Schemes',
        employerContributions: 'Full Statutory Schemes',
        regionalRules: 'Federal Only / None',
        benefitsModel: 'Full Pre/Post Tax Model',
      };
    case 'AE':
    case 'SA':
      return {
        incomeTax: 'Full Statutory Slabs',
        employeeContributions: 'Full Statutory Schemes',
        employerContributions: 'Full Statutory Schemes',
        regionalRules: 'Federal Only / None',
        benefitsModel: 'Full Pre/Post Tax Model',
      };
    case 'CH':
    case 'ES':
    case 'IT':
      return {
        incomeTax: 'Full Statutory Slabs',
        employeeContributions: 'Full Statutory Schemes',
        employerContributions: 'Full Statutory Schemes',
        regionalRules: 'Full Devolved / State Rates',
        benefitsModel: 'Full Pre/Post Tax Model',
      };
    case 'NL':
      return {
        incomeTax: 'Full Statutory Slabs',
        employeeContributions: 'Exempt / Zero',
        employerContributions: 'Full Statutory Schemes',
        regionalRules: 'Federal Only / None',
        benefitsModel: 'Full Pre/Post Tax Model',
      };
    case 'IE':
    case 'NZ':
    case 'BR':
    case 'MX':
    case 'ZA':
    case 'KR':
      return {
        incomeTax: 'Full Statutory Slabs',
        employeeContributions: 'Full Statutory Schemes',
        employerContributions: 'Full Statutory Schemes',
        regionalRules: 'Federal Only / None',
        benefitsModel: 'Full Pre/Post Tax Model',
      };
    case 'FR':
    case 'JP':
      return {
        incomeTax: 'Full Statutory Slabs',
        employeeContributions: 'Benchmark Scope',
        employerContributions: 'Benchmark Scope',
        regionalRules: 'Federal Only / None',
        benefitsModel: 'Full Pre/Post Tax Model',
      };
    default:
      return {
        incomeTax: 'User Custom Estimate',
        employeeContributions: 'User Custom Estimate',
        employerContributions: 'User Custom Estimate',
        regionalRules: 'Federal Only / None',
        benefitsModel: 'Custom User Entered',
      };
  }
}

export interface StatutorySource {
  authority: string;
  title: string;
  url: string;
  sourceType: 'GOVERNMENT' | 'REGULATOR' | 'TAX_AUTHORITY' | 'LEGISLATION' | 'STATUTORY_INSTITUTION';
  publicationDate: string;
  effectiveDate: string;
  lastVerifiedDate: string;
}

export interface CountryRegion {
  code: string;
  name: string;
  taxRatePercent?: number; // Approximate flat or standard state rate
  isZeroTax?: boolean;
}

export interface CountryDefinition {
  code: string; // ISO 2-letter
  iso3: string;
  name: string;
  commonName?: string;
  flag: string;
  currency: string;
  symbol: string;
  decimals: number;
  status: CalculationStatus;
  statusLabel: string;
  freshness: CalculationFreshness;
  defaultTaxYear: string;
  supportedTaxYears: string[];
  hasRegions: boolean;
  regions?: CountryRegion[];
  defaultRegion?: string;
  rulesetId: string;
  ruleVersion: string;
  lastVerifiedDate: string;
  sourceAuthority: string;
  sources: StatutorySource[];
  calculationScope: string;
  knownExclusions: string[];
  disclaimerNote: string;
  popular?: boolean;
}

export const US_STATES: CountryRegion[] = [
  { code: 'CA', name: 'California (Progressive 1%–13.3%)' },
  { code: 'NY', name: 'New York (Progressive 4%–10.9%)' },
  { code: 'TX', name: 'Texas (0% State Tax)', isZeroTax: true, taxRatePercent: 0 },
  { code: 'FL', name: 'Florida (0% State Tax)', isZeroTax: true, taxRatePercent: 0 },
  { code: 'WA', name: 'Washington (0% State Tax on Wages)', isZeroTax: true, taxRatePercent: 0 },
  { code: 'IL', name: 'Illinois (4.95% Statutory Flat)', taxRatePercent: 4.95 },
  { code: 'PA', name: 'Pennsylvania (3.07% Statutory Flat)', taxRatePercent: 3.07 },
  { code: 'OH', name: 'Ohio (3.50% Top Graduated)', taxRatePercent: 3.5 },
  { code: 'NC', name: 'North Carolina (4.50% Statutory Flat)', taxRatePercent: 4.5 },
  { code: 'MI', name: 'Michigan (4.25% Statutory Flat)', taxRatePercent: 4.25 },
  { code: 'GA', name: 'Georgia (5.39% Statutory Flat)', taxRatePercent: 5.39 },
  { code: 'NJ', name: 'New Jersey (5.53% Statutory Median)', taxRatePercent: 5.525 },
  { code: 'VA', name: 'Virginia (5.75% Top Graduated)', taxRatePercent: 5.75 },
  { code: 'MA', name: 'Massachusetts (5.00% Statutory Flat)', taxRatePercent: 5.0 },
  { code: 'AZ', name: 'Arizona (2.50% Statutory Flat)', taxRatePercent: 2.5 },
  { code: 'TN', name: 'Tennessee (0% State Tax)', isZeroTax: true, taxRatePercent: 0 },
  { code: 'IN', name: 'Indiana (3.05% Statutory Flat)', taxRatePercent: 3.05 },
  { code: 'MO', name: 'Missouri (4.70% Top Graduated)', taxRatePercent: 4.7 },
  { code: 'MD', name: 'Maryland (4.75% Statutory State Rate)', taxRatePercent: 4.75 },
  { code: 'WI', name: 'Wisconsin (5.30% Statutory Median)', taxRatePercent: 5.3 },
  { code: 'CO', name: 'Colorado (4.40% Statutory Flat)', taxRatePercent: 4.4 },
  { code: 'MN', name: 'Minnesota (6.80% Statutory Median)', taxRatePercent: 6.8 },
  { code: 'SC', name: 'South Carolina (6.20% Top Graduated)', taxRatePercent: 6.2 },
  { code: 'AL', name: 'Alabama (5.00% Top Graduated)', taxRatePercent: 5.0 },
  { code: 'LA', name: 'Louisiana (4.25% Top Graduated)', taxRatePercent: 4.25 },
  { code: 'KY', name: 'Kentucky (4.00% Statutory Flat)', taxRatePercent: 4.0 },
  { code: 'OR', name: 'Oregon (8.75% Statutory Median)', taxRatePercent: 8.75 },
  { code: 'OK', name: 'Oklahoma (4.75% Top Graduated)', taxRatePercent: 4.75 },
  { code: 'CT', name: 'Connecticut (5.50% Statutory Median)', taxRatePercent: 5.5 },
  { code: 'UT', name: 'Utah (4.65% Statutory Flat)', taxRatePercent: 4.65 },
  { code: 'IA', name: 'Iowa (3.80% Statutory Flat)', taxRatePercent: 3.8 },
  { code: 'NV', name: 'Nevada (0% State Tax)', isZeroTax: true, taxRatePercent: 0 },
  { code: 'AR', name: 'Arkansas (4.40% Top Graduated)', taxRatePercent: 4.4 },
  { code: 'MS', name: 'Mississippi (4.00% Statutory Flat)', taxRatePercent: 4.0 },
  { code: 'KS', name: 'Kansas (5.58% Statutory Flat)', taxRatePercent: 5.58 },
  { code: 'NM', name: 'New Mexico (4.90% Statutory Median)', taxRatePercent: 4.9 },
  { code: 'NE', name: 'Nebraska (5.20% Top Graduated)', taxRatePercent: 5.2 },
  { code: 'ID', name: 'Idaho (5.695% Statutory Flat)', taxRatePercent: 5.695 },
  { code: 'WV', name: 'West Virginia (5.12% Top Graduated)', taxRatePercent: 5.12 },
  { code: 'HI', name: 'Hawaii (7.20% Statutory Median)', taxRatePercent: 7.2 },
  { code: 'NH', name: 'New Hampshire (0% Wage Income)', isZeroTax: true, taxRatePercent: 0 },
  { code: 'ME', name: 'Maine (6.75% Statutory Median)', taxRatePercent: 6.75 },
  { code: 'RI', name: 'Rhode Island (4.75% Statutory Median)', taxRatePercent: 4.75 },
  { code: 'MT', name: 'Montana (5.90% Top Graduated)', taxRatePercent: 5.9 },
  { code: 'DE', name: 'Delaware (5.55% Statutory Median)', taxRatePercent: 5.55 },
  { code: 'SD', name: 'South Dakota (0% State Tax)', isZeroTax: true, taxRatePercent: 0 },
  { code: 'ND', name: 'North Dakota (2.25% Statutory Median)', taxRatePercent: 2.25 },
  { code: 'AK', name: 'Alaska (0% State Tax)', isZeroTax: true, taxRatePercent: 0 },
  { code: 'DC', name: 'District of Columbia (6.00% Statutory Median)', taxRatePercent: 6.0 },
  { code: 'VT', name: 'Vermont (6.60% Statutory Median)', taxRatePercent: 6.6 },
  { code: 'WY', name: 'Wyoming (0% State Tax)', isZeroTax: true, taxRatePercent: 0 },
];

export const CA_PROVINCES: CountryRegion[] = [
  {
    "code": "ON",
    "name": "Ontario",
    "taxRatePercent": 5.05
  },
  {
    "code": "BC",
    "name": "British Columbia",
    "taxRatePercent": 5.06
  },
  {
    "code": "AB",
    "name": "Alberta",
    "taxRatePercent": 10
  },
  {
    "code": "QC",
    "name": "Quebec",
    "taxRatePercent": 14
  },
  {
    "code": "MB",
    "name": "Manitoba",
    "taxRatePercent": 10.8
  },
  {
    "code": "SK",
    "name": "Saskatchewan",
    "taxRatePercent": 10.5
  },
  {
    "code": "NS",
    "name": "Nova Scotia",
    "taxRatePercent": 8.79
  },
  {
    "code": "NB",
    "name": "New Brunswick",
    "taxRatePercent": 9.4
  },
  {
    "code": "NL",
    "name": "Newfoundland and Labrador",
    "taxRatePercent": 8.7
  },
  {
    "code": "PE",
    "name": "Prince Edward Island",
    "taxRatePercent": 9.8
  },
  {
    "code": "NT",
    "name": "Northwest Territories",
    "taxRatePercent": 5.9
  },
  {
    "code": "YT",
    "name": "Yukon",
    "taxRatePercent": 6.4
  },
  {
    "code": "NU",
    "name": "Nunavut",
    "taxRatePercent": 4
  }
];

export const UK_REGIONS: CountryRegion[] = [
  {
    "code": "EWNI",
    "name": "England, Wales & Northern Ireland (Standard UK Rates)"
  },
  {
    "code": "SCT",
    "name": "Scotland (Scottish Income Tax Devolved Bands)"
  }
];

export const DE_STATES: CountryRegion[] = [
  {
    "code": "NW",
    "name": "Nordrhein-Westfalen (9% Church Tax)"
  },
  {
    "code": "BY",
    "name": "Bayern / Bavaria (8% Church Tax)"
  },
  {
    "code": "BW",
    "name": "Baden-Württemberg (8% Church Tax)"
  },
  {
    "code": "NI",
    "name": "Niedersachsen (9% Church Tax)"
  },
  {
    "code": "HE",
    "name": "Hessen (9% Church Tax)"
  },
  {
    "code": "SN",
    "name": "Sachsen (9% Church Tax)"
  },
  {
    "code": "RP",
    "name": "Rheinland-Pfalz (9% Church Tax)"
  },
  {
    "code": "BE",
    "name": "Berlin (9% Church Tax)"
  },
  {
    "code": "SH",
    "name": "Schleswig-Holstein (9% Church Tax)"
  },
  {
    "code": "BB",
    "name": "Brandenburg (9% Church Tax)"
  },
  {
    "code": "ST",
    "name": "Sachsen-Anhalt (9% Church Tax)"
  },
  {
    "code": "TH",
    "name": "Thüringen (9% Church Tax)"
  },
  {
    "code": "HH",
    "name": "Hamburg (9% Church Tax)"
  },
  {
    "code": "MV",
    "name": "Mecklenburg-Vorpommern (9% Church Tax)"
  },
  {
    "code": "SL",
    "name": "Saarland (9% Church Tax)"
  },
  {
    "code": "HB",
    "name": "Bremen (9% Church Tax)"
  }
];

export const CH_CANTONS: CountryRegion[] = [
  { code: 'ZH', name: 'Zurich (ZH — ~13.5% Cantonal & Municipal Benchmark)', taxRatePercent: 13.5 },
  { code: 'BE', name: 'Bern (BE — ~18.5% Cantonal & Municipal Benchmark)', taxRatePercent: 18.5 },
  { code: 'LU', name: 'Lucerne (LU — ~11.5% Cantonal & Municipal Benchmark)', taxRatePercent: 11.5 },
  { code: 'ZG', name: 'Zug (ZG — ~6.5% Cantonal & Municipal Low-Tax Benchmark)', taxRatePercent: 6.5 },
  { code: 'BS', name: 'Basel-Stadt (BS — ~17.0% Cantonal & Municipal Benchmark)', taxRatePercent: 17.0 },
  { code: 'GE', name: 'Geneva (GE — ~19.0% Cantonal & Municipal Benchmark)', taxRatePercent: 19.0 },
  { code: 'VD', name: 'Vaud (VD — ~18.0% Cantonal & Municipal Benchmark)', taxRatePercent: 18.0 },
];

export const ES_COMMUNITIES: CountryRegion[] = [
  { code: 'MD', name: 'Madrid (Comunidad de Madrid — Top Marginal ~45.0%)', taxRatePercent: 21.0 },
  { code: 'CT', name: 'Cataluña (Catalunya — Top Marginal ~50.0%)', taxRatePercent: 25.5 },
  { code: 'AN', name: 'Andalucía (Top Marginal ~47.0%)', taxRatePercent: 22.5 },
  { code: 'VC', name: 'Comunidad Valenciana (Top Marginal ~54.0%)', taxRatePercent: 25.0 },
  { code: 'GEN', name: 'General / Benchmark (Standard Complementary Scale)', taxRatePercent: 22.5 },
];

export const IT_REGIONS: CountryRegion[] = [
  { code: 'LOM', name: 'Lombardia (Milan — Addizionale Regionale 1.23%–1.73%)', taxRatePercent: 1.73 },
  { code: 'LAZ', name: 'Lazio (Rome — Addizionale Regionale 1.73%–3.33%)', taxRatePercent: 3.33 },
  { code: 'PIE', name: 'Piemonte (Turin — Addizionale Regionale 1.62%–3.32%)', taxRatePercent: 3.32 },
  { code: 'VEN', name: 'Veneto (Venice — Addizionale Regionale 1.23%)', taxRatePercent: 1.23 },
  { code: 'GEN', name: 'National Average Benchmark (1.73% Regional Surtax)', taxRatePercent: 1.73 },
];

// Complete 212 Countries and Payroll Territories
export const POPULAR_COUNTRY_CODES: string[] = [
  'PK', 'US', 'GB', 'DE', 'IN', 'CA', 'AU', 'CH', 'NL', 'IE', 'NZ', 'ES', 'IT', 'BR', 'MX', 'ZA', 'KR', 'SG', 'AE', 'SA', 'FR', 'JP'
];

export const GLOBAL_COUNTRIES: Record<string, CountryDefinition> = {
  "PK": {
    "code": "PK",
    "iso3": "PAK",
    "name": "Pakistan",
    "flag": "🇵🇰",
    "currency": "PKR",
    "symbol": "₨",
    "decimals": 2,
    "status": "VERIFIED",
    "statusLabel": "Verified Statutory",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026-2027",
    "supportedTaxYears": [
      "2026-2027",
      "2025-2026"
    ],
    "hasRegions": false,
    "rulesetId": "PK-SALARY-2026.1",
    "ruleVersion": "FBR Salaried Slabs (Finance Act 2024 / Ordinance 2001)",
    "lastVerifiedDate": "2026-10-10",
    "sourceAuthority": "Federal Board of Revenue (FBR) Pakistan",
    "sources": [
      {
        "authority": "Federal Board of Revenue (FBR)",
        "title": "Income Tax Ordinance 2001 - First Schedule Part I Division I (Salaried Slabs)",
        "url": "https://www.fbr.gov.pk",
        "sourceType": "TAX_AUTHORITY",
        "publicationDate": "2024-06-30",
        "effectiveDate": "2024-07-01",
        "lastVerifiedDate": "2026-10-10"
      },
      {
        "authority": "Employees Old-Age Benefits Institution (EOBI)",
        "title": "EOBI Contribution Statutory Minimum Wage Schedule",
        "url": "https://eobi.gov.pk",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2024-07-01",
        "effectiveDate": "2024-07-01",
        "lastVerifiedDate": "2026-10-10"
      }
    ],
    "calculationScope": "Statutory projection based on FBR First Schedule Part I Division I salaried slabs (0% to 35%) enacted under Finance Act 2024 and mandatory EOBI contributions. Tax Year 2026-27 is a forward projection applying the unamended Finance Act 2024 regime; official Finance Act 2026 has not yet been promulgated into primary legislation.",
    "knownExclusions": [
      "Provincial professional taxes (e.g. Sindh/Punjab professional tax)",
      "Tax credits under Section 61 (charitable donations)",
      "Advance withholding tax on banking transactions"
    ],
    "disclaimerNote": "Tax Year 2026-27 is a statutory forward projection applying the unamended Finance Act 2024 slabs. Finance Act 2026 has not yet been enacted into primary legislation.",
    "popular": true
  },
  "US": {
    "code": "US",
    "iso3": "USA",
    "name": "United States",
    "flag": "🇺🇸",
    "currency": "USD",
    "symbol": "$",
    "decimals": 2,
    "status": "LIMITED",
    "statusLabel": "Federal Statutory (State Configurable)",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026",
    "supportedTaxYears": [
      "2026",
      "2025"
    ],
    "hasRegions": true,
    "defaultRegion": "TX",
    "rulesetId": "US-FED-2026.2",
    "ruleVersion": "IRS Rev. Proc. 2025-32 (2026 Brackets/Std Deductions) & IRS Rev. Proc. 2024-40 (2025) & SSA 2026 Wage Base Notice",
    "lastVerifiedDate": "2026-10-01",
    "sourceAuthority": "Internal Revenue Service (IRS) & SSA",
    "sources": [
      {
        "authority": "Internal Revenue Service (IRS)",
        "title": "Revenue Procedure 2025-32 (2026 Inflation-Adjusted Tax Items) & Rev. Proc. 2024-40 (2025)",
        "url": "https://www.irs.gov/pub/irs-drop/rp-25-32.pdf",
        "sourceType": "GOVERNMENT",
        "publicationDate": "2025-10-22",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-10-01"
      },
      {
        "authority": "Social Security Administration (SSA)",
        "title": "Social Security Wage Base 2026: $184,500 (ssa.gov/oact/cola/cbb.html)",
        "url": "https://www.ssa.gov/oact/cola/cbb.html",
        "sourceType": "GOVERNMENT",
        "publicationDate": "2025-10-10",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-10-01"
      }
    ],
    "calculationScope": "Models Federal Income Tax by filing status using year-specific brackets (Rev. Proc. 2025-32 for 2026, Rev. Proc. 2024-40 for 2025): standard deductions $16,100/$32,200 (2026) or $15,000/$30,000 (2025); Social Security 6.2% up to $184,500 (2026)/$176,100 (2025) wage base; Medicare 1.45% + 0.9% Additional Medicare over $200k/$250k MFJ; and state income tax (CA/NY progressive brackets; statutory flat rates for other states).",
    "knownExclusions": [
      "Local/municipal income taxes (e.g. New York City resident tax, Yonkers)",
      "Child Tax Credit and Earned Income Tax Credit phaseouts",
      "Alternative Minimum Tax (AMT)"
    ],
    "disclaimerNote": "2026 brackets from IRS Rev. Proc. 2025-32; 2025 brackets from Rev. Proc. 2024-40. State income tax where selected. Local/city taxes excluded. Estimated annualized take-home — not official payroll withholding.",
    "popular": true
  },
  "GB": {
    "code": "GB",
    "iso3": "GBR",
    "name": "United Kingdom",
    "flag": "🇬🇧",
    "currency": "GBP",
    "symbol": "£",
    "decimals": 2,
    "status": "VERIFIED",
    "statusLabel": "Verified Statutory",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026-2027",
    "supportedTaxYears": [
      "2026-2027",
      "2025-2026"
    ],
    "hasRegions": true,
    "defaultRegion": "EWNI",
    "rulesetId": "GB-PAYE-2026.1",
    "ruleVersion": "HMRC PAYE Bands & Class 1 National Insurance",
    "lastVerifiedDate": "2026-04-06",
    "sourceAuthority": "HM Revenue & Customs (HMRC)",
    "sources": [
      {
        "authority": "HM Revenue & Customs (HMRC)",
        "title": "Rates and thresholds for employers 2025 to 2026 and 2026 to 2027",
        "url": "https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026",
        "sourceType": "GOVERNMENT",
        "publicationDate": "2024-10-30",
        "effectiveDate": "2025-04-06",
        "lastVerifiedDate": "2026-04-06"
      },
      {
        "authority": "Scottish Government",
        "title": "Scottish Income Tax Devolved Rates and Bands",
        "url": "https://www.gov.scot/policies/taxes/income-tax/",
        "sourceType": "LEGISLATION",
        "publicationDate": "2024-12-04",
        "effectiveDate": "2025-04-06",
        "lastVerifiedDate": "2026-04-06"
      }
    ],
    "calculationScope": "Personal Allowance (£12,570 with £1-for-£2 taper > £100k), Basic (20%), Higher (40%), and Additional (45%) rates; Scottish devolved bands (19% to 48%); Class 1 Employee NI (8% and 2%); and Employer NI (15.0% above £5,000 threshold).",
    "knownExclusions": [
      "Student Loan repayments (Plan 1/2/4/Postgraduate)",
      "Marriage Allowance transfer and Blind Person Allowance",
      "Salary sacrifice pension arrangement variations"
    ],
    "disclaimerNote": "Models Personal Allowance (£12,570 with £1-for-£2 taper above £100k), Basic (20%), Higher (40%), and Additional (45%) rates, plus Class 1 Employee NI (8% and 2%) and Scottish devolved bands.",
    "popular": true
  },
  "DE": {
    "code": "DE",
    "iso3": "DEU",
    "name": "Germany",
    "flag": "🇩🇪",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "VERIFIED",
    "statusLabel": "Verified Statutory",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026",
    "supportedTaxYears": [
      "2026",
      "2025"
    ],
    "hasRegions": true,
    "defaultRegion": "NW",
    "rulesetId": "DE-ESTG-2026.1",
    "ruleVersion": "BMF Einkommensteuergesetz (EStG) & Sozialversicherung",
    "lastVerifiedDate": "2026-01-01",
    "sourceAuthority": "Bundesministerium der Finanzen (BMF)",
    "sources": [
      {
        "authority": "Bundesministerium der Finanzen (BMF)",
        "title": "Einkommensteuertarif 2025/2026 (§ 32a EStG) & Steuerfortentwicklungsgesetz",
        "url": "https://www.bundesfinanzministerium.de",
        "sourceType": "GOVERNMENT",
        "publicationDate": "2024-11-20",
        "effectiveDate": "2025-01-01",
        "lastVerifiedDate": "2026-01-01"
      },
      {
        "authority": "Bundesministerium für Arbeit und Soziales (BMAS)",
        "title": "Sozialversicherungs-Rechengrößenverordnung 2026 (Beitragsbemessungsgrenzen)",
        "url": "https://www.bmas.de/DE/Service/Gesetze-und-Gesetzesvorhaben/sozialversicherungsrechengroessenverordnung-2026.html",
        "sourceType": "GOVERNMENT",
        "publicationDate": "2025-10-15",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Grundfreibetrag (€12,348 for 2026; €12,096 for 2025), Steuerklasse I–VI, Solidaritätszuschlag (exempt up to €18,130 tax liability), conditional Kirchensteuer (8% BY/BW, 9% other 14 states, 0% non-member), and statutory social insurance with official BMAS BBG ceilings (€101,400 RV/AV, €69,750 KV/PV for 2026; €96,600 RV/AV, €66,150 KV/PV for 2025).",
    "knownExclusions": [
      "Private health insurance (PKV) individual tariff variances",
      "Kinderfreibetrag child tax allowance annual reconciliation",
      "Commuter allowance (Pendlerpauschale)"
    ],
    "disclaimerNote": "Models Grundfreibetrag (€12,348 for 2026; €12,096 for 2025), Steuerklasse I–VI, Solidaritätszuschlag, conditional church tax by Bundesland, and statutory social contributions with official BMAS BBG ceilings (€101,400 RV/AV and €69,750 KV/PV for 2026).",
    "popular": true
  },
  "IN": {
    "code": "IN",
    "iso3": "IND",
    "name": "India",
    "flag": "🇮🇳",
    "currency": "INR",
    "symbol": "₹",
    "decimals": 2,
    "status": "VERIFIED",
    "statusLabel": "Verified Statutory",
    "freshness": "CURRENT",
    "defaultTaxYear": "FY 2025-2026 (AY 2026-2027)",
    "supportedTaxYears": [
      "FY 2025-2026 (AY 2026-2027)",
      "FY 2024-2025 (AY 2025-2026)"
    ],
    "hasRegions": false,
    "rulesetId": "IN-CBDT-2026.2",
    "ruleVersion": "Finance (No. 2) Act 2024 (Enacted AY 2025-26); Union Budget 2025 (Projected AY 2026-27)",
    "lastVerifiedDate": "2026-10-10",
    "sourceAuthority": "Income Tax Department of India (CBDT)",
    "sources": [
      {
        "authority": "Income Tax Department / CBDT",
        "title": "e-Filing Individual Tax Rates & Slabs under Section 115BAC",
        "url": "https://www.incometax.gov.in/iec/fportal/",
        "sourceType": "TAX_AUTHORITY",
        "publicationDate": "2025-02-01",
        "effectiveDate": "2025-04-01",
        "lastVerifiedDate": "2026-10-10"
      },
      {
        "authority": "Ministry of Finance / CBDT",
        "title": "The Gazette of India: Finance (No. 2) Act, 2024 (Section 115BAC Revised Slabs)",
        "url": "https://incometaxindia.gov.in",
        "sourceType": "LEGISLATION",
        "publicationDate": "2024-07-23",
        "effectiveDate": "2024-07-23",
        "lastVerifiedDate": "2026-10-10"
      }
    ],
    "calculationScope": "Enacted Law: AY 2025-26 governed by The Gazette of India: Finance (No. 2) Act, 2024 (Act No. 15 of 2024) with ₹75,000 standard deduction, Section 87A rebate and marginal relief up to ₹7 Lakhs, 6 revised slabs (0%–30%), and 4% Health & Education Cess. Forward Projection: AY 2026-27 models proposed Union Budget 2025 revisions (7 slabs 0%–30%, ₹12 Lakh Section 87A rebate threshold with marginal relief, ₹75,000 standard deduction). Old Regime remains unchanged.",
    "knownExclusions": [
      "House Rent Allowance (HRA) exemption under Old Regime",
      "Section 80D health insurance premium deductions",
      "Chapter VI-A deductions other than standard 80C/80D under Old Regime"
    ],
    "disclaimerNote": "Enacted legislation applies to AY 2025-26 (Finance (No. 2) Act, 2024: 6 slabs, ₹7L rebate threshold, ₹75k standard deduction). AY 2026-27 is a forward projection incorporating Union Budget 2025 proposals (7 slabs, ₹12L rebate threshold). Calculations do not constitute formal tax advice or filing verification.",
    "popular": true
  },
  "AU": {
    "code": "AU",
    "iso3": "AUS",
    "name": "Australia",
    "flag": "🇦🇺",
    "currency": "AUD",
    "symbol": "$",
    "decimals": 2,
    "status": "VERIFIED",
    "statusLabel": "Verified Statutory",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026-2027",
    "supportedTaxYears": [
      "2026-2027",
      "2025-2026"
    ],
    "hasRegions": false,
    "rulesetId": "AU-ATO-2026.2",
    "ruleVersion": "ATO Individual Tax Rates 2026-27 (Treasury Laws Amendment Act 2024 \u2014 Stage 3 revised, 15% second bracket) + LITO",
    "lastVerifiedDate": "2026-10-01",
    "sourceAuthority": "Australian Taxation Office (ATO)",
    "sources": [
      {
        "authority": "Australian Taxation Office (ATO)",
        "title": "Individual income tax rates 2025-26 and 2026-27 (Stage 3 revised; second bracket 16% \u2192 15% effective 1 July 2026)",
        "url": "https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents",
        "sourceType": "GOVERNMENT",
        "publicationDate": "2024-03-05",
        "effectiveDate": "2026-07-01",
        "lastVerifiedDate": "2026-10-01"
      }
    ],
    "calculationScope": "FY 2026-27: 0%/$18,200, 15%/$45,000, 30%/$135,000, 37%/$190,000, 45% above (second bracket reduced from 16% in 2025-26). LITO up to $700 (phases out $37,500\u2013$66,667). 2.0% Medicare Levy. 12.0% Employer Superannuation Guarantee (employer cost only, not an employee deduction).",
    "knownExclusions": [
      "Medicare Levy Surcharge (MLS) for individuals without private hospital cover",
      "HELP / HECS student debt repayments",
      "Division 293 tax on high superannuation contributions",
      "Low-Income Superannuation Tax Offset (LISTO)"
    ],
    "disclaimerNote": "FY 2026-27: 15% second bracket (16% in 2025-26), LITO (max $700), 2.0% Medicare levy, 12.0% Employer Super Guarantee. Estimated annualized take-home only.",
    "popular": true
  },
  "CA": {
    "code": "CA",
    "iso3": "CAN",
    "name": "Canada",
    "flag": "🇨🇦",
    "currency": "CAD",
    "symbol": "$",
    "decimals": 2,
    "status": "LIMITED",
    "statusLabel": "Federal Statutory + Provincial Benchmark",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026",
    "supportedTaxYears": [
      "2026",
      "2025"
    ],
    "hasRegions": true,
    "defaultRegion": "ON",
    "rulesetId": "CA-CRA-2026.2",
    "ruleVersion": "CRA T4032 Payroll Deductions Tables 2025/2026; CPP/EI Contribution Notices (canada.ca)",
    "lastVerifiedDate": "2026-10-01",
    "sourceAuthority": "Canada Revenue Agency (CRA)",
    "sources": [
      {
        "authority": "Canada Revenue Agency (CRA)",
        "title": "Payroll Deductions Tables T4032 2025 & 2026 + CPP/EI Annual Maximums Notice",
        "url": "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables.html",
        "sourceType": "GOVERNMENT",
        "publicationDate": "2025-11-15",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-10-01"
      }
    ],
    "calculationScope": "2026: Federal brackets at 14%/20.5%/26%/29%/33% (indexed 2.0%) with BPA $16,452; CPP1 5.95% on $3,500–$74,600 YMPE (max $4,230.45 each); EI 1.63% up to $68,900 MIE (max employee $1,123.07); employer EI at 1.4× employee. 2025: 15% bottom bracket, BPA $15,705, CPP YMPE $71,300, EI 1.64%/$65,700. Provincial flat-rate approximation applies.",
    "knownExclusions": [
      "Provincial Income Tax Benchmark: Provincial tax is modeled using a representative baseline rate (e.g., Ontario standard 5.05% baseline) rather than full multi-tier provincial brackets and local surtaxes",
      "CPP2 Second Additional Contribution (4% on earnings between YMPE $74,600 and YAMPE $85,000 for 2026; $71,300–$81,900 for 2025)",
      "Quebec Parental Insurance Plan (QPIP) — replaces EI for Quebec residents",
      "Ontario Health Premium graduated surtax",
      "Child Care Expense deductions"
    ],
    "disclaimerNote": "2026: Federal 14%/20.5%/26%/29%/33% brackets, BPA $16,452, CPP1 5.95% to YMPE $74,600, EI 1.63% to $68,900. Employer EI = 1.4× employee. CPP2 above YMPE and QPIP are known exclusions. Estimated annualized take-home only.",
    "popular": true
  },
  "SG": {
    "code": "SG",
    "iso3": "SGP",
    "name": "Singapore",
    "flag": "🇸🇬",
    "currency": "SGD",
    "symbol": "$",
    "decimals": 2,
    "status": "LIMITED",
    "statusLabel": "Statutory IRAS + CPF (Age <= 55)",
    "freshness": "CURRENT",
    "defaultTaxYear": "YA 2026",
    "supportedTaxYears": [
      "YA 2026",
      "YA 2025"
    ],
    "hasRegions": false,
    "rulesetId": "SG-IRAS-2026.1",
    "ruleVersion": "IRAS Resident Tax Rates & CPF Board Phased OW Ceilings (Budget 2023)",
    "lastVerifiedDate": "2026-10-10",
    "sourceAuthority": "Inland Revenue Authority of Singapore (IRAS) & CPF Board",
    "sources": [
      {
        "authority": "Inland Revenue Authority of Singapore (IRAS)",
        "title": "Individual Income Tax Rates for Resident Individuals",
        "url": "https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates",
        "sourceType": "TAX_AUTHORITY",
        "publicationDate": "2024-12-01",
        "effectiveDate": "2025-01-01",
        "lastVerifiedDate": "2026-10-10"
      },
      {
        "authority": "Central Provident Fund (CPF) Board",
        "title": "Statutory CPF Contribution Rates & OW Monthly Ceiling",
        "url": "https://www.cpf.gov.sg/employer/employer-obligations/how-much-cpf-contributions-to-pay",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2024-12-01",
        "effectiveDate": "2025-01-01",
        "lastVerifiedDate": "2026-10-10"
      }
    ],
    "calculationScope": "Statutory IRAS progressive resident tax (2% to 24%) and CPF contribution rates for Citizens/PRs (20% employee, 17% employer, 0% for foreigners). CPF Ordinary Wage (OW) monthly ceiling follows the Budget 2023 phased schedule: S$8,000/mo (S$96,000/yr) for payroll calendar 2026 and S$7,400/mo (S$88,800/yr) for calendar 2025.",
    "knownExclusions": [
      "Graduated reduced CPF contribution rates for 1st and 2nd year Permanent Residents",
      "Graduated reduced CPF contribution rates for employees aged above 55",
      "Voluntary CPF cash top-up tax relief",
      "Supplementary Retirement Scheme (SRS) tax deductions"
    ],
    "disclaimerNote": "IRAS resident rates (0% to 24%) and standard statutory CPF (20% employee, 17% employer). Ordinary Wage monthly ceiling is S$8,000/mo ($96,000/yr) for calendar 2026 (S$7,400/mo in 2025). 0% CPF for Foreigners.",
    "popular": true
  },
  "AE": {
    "code": "AE",
    "iso3": "ARE",
    "name": "United Arab Emirates",
    "flag": "🇦🇪",
    "currency": "AED",
    "symbol": "AED",
    "decimals": 2,
    "status": "LIMITED",
    "statusLabel": "0% PIT + GPSSA / Gratuity Scope",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026",
    "supportedTaxYears": [
      "2026",
      "2025"
    ],
    "hasRegions": false,
    "rulesetId": "AE-MOHRE-2026.1",
    "ruleVersion": "UAE Federal Decree-Law No. (33) of 2021 & GPSSA Law",
    "lastVerifiedDate": "2026-10-10",
    "sourceAuthority": "Ministry of Human Resources & Emiratisation (MOHRE) & GPSSA",
    "sources": [
      {
        "authority": "Federal Tax Authority (FTA)",
        "title": "UAE Federal Tax Legislation (0% PIT on Employment Income)",
        "url": "https://tax.gov.ae/en/legislation.aspx",
        "sourceType": "TAX_AUTHORITY",
        "publicationDate": "2022-12-09",
        "effectiveDate": "2023-01-01",
        "lastVerifiedDate": "2026-10-10"
      },
      {
        "authority": "General Pension and Social Security Authority (GPSSA)",
        "title": "Federal Law No. 7 of 1999 on Pension & Social Security (5% Employee / AED 50k Cap Baseline)",
        "url": "https://www.gpssa.gov.ae",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "1999-01-01",
        "effectiveDate": "1999-01-01",
        "lastVerifiedDate": "2026-10-10"
      }
    ],
    "calculationScope": "0% personal income tax. GPSSA social security for UAE/GCC nationals (5% employee, 12.5% employer, capped at AED 50,000/mo under Federal Law No. 7 of 1999). Expatriate end-of-service gratuity provision (~5.75% of basic salary) modeled on employer side, never reducing employee net pay.",
    "knownExclusions": [
      "Federal Decree-Law No. 57/2023 new entrant scheme for post-November 2023 joiners (11% employee contribution, AED 70,000/mo cap)",
      "Voluntary savings schemes (DIFC Workplace Savings Scheme)",
      "Corporate tax obligations for sole proprietorships > AED 375,000",
      "Housing fee deductions for Dubai residents"
    ],
    "disclaimerNote": "0% Personal Income Tax. Models GPSSA for UAE Nationals, and Employer End-of-Service gratuity provision for Expatriates.",
    "popular": true
  },
  "SA": {
    "code": "SA",
    "iso3": "SAU",
    "name": "Saudi Arabia",
    "flag": "🇸🇦",
    "currency": "SAR",
    "symbol": "SAR",
    "decimals": 2,
    "status": "LIMITED",
    "statusLabel": "0% PIT + GOSI Statutory Scope",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026",
    "supportedTaxYears": [
      "2026",
      "2025"
    ],
    "hasRegions": false,
    "rulesetId": "SA-GOSI-2026.1",
    "ruleVersion": "GOSI Social Insurance Law (Royal Decree M/33 & M/224) & SANED Regulations",
    "lastVerifiedDate": "2026-10-10",
    "sourceAuthority": "General Organization for Social Insurance (GOSI)",
    "sources": [
      {
        "authority": "General Organization for Social Insurance (GOSI)",
        "title": "GOSI Contribution Rates (Annuity & SANED Statutory Schedule)",
        "url": "https://www.gosi.gov.sa/en/ContributionRates",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2024-07-01",
        "effectiveDate": "2024-07-01",
        "lastVerifiedDate": "2026-10-10"
      },
      {
        "authority": "Zakat, Tax and Customs Authority (ZATCA)",
        "title": "ZATCA Income Tax Regulations (0% PIT for Individuals)",
        "url": "https://zatca.gov.sa/en/RulesRegulations/Taxes/Pages/default.aspx",
        "sourceType": "TAX_AUTHORITY",
        "publicationDate": "2024-07-01",
        "effectiveDate": "2024-07-01",
        "lastVerifiedDate": "2026-10-10"
      }
    ],
    "calculationScope": "0% personal income tax on employment earnings. GOSI social insurance for Saudi nationals: 9.75% employee contribution (9% Annuities + 0.75% SANED unemployment insurance, established Jan 1, 2022) and 11.75% employer contribution (9% Annuities + 0.75% SANED + 2% Occupational Hazards), capped at SAR 45,000/month (SAR 540,000/year). Expatriate workers: 0% PIT and 0% employee GOSI, with 2% employer Occupational Hazards (capped at SAR 45,000/month).",
    "knownExclusions": [
      "Zakat obligations for Saudi businesses",
      "Expatriate dependent levy payments",
      "Private medical insurance policy premium deductions"
    ],
    "disclaimerNote": "0% Personal Income Tax. Models GOSI social insurance for Saudi Nationals (9.75% employee rate established 2022: 9% Annuity + 0.75% SANED; 11.75% employer) capped at SAR 45,000/month. 2% Employer Occupational Hazard for Expatriates.",
    "popular": true
  },
  "FR": {
    "code": "FR",
    "iso3": "FRA",
    "name": "France",
    "flag": "🇫🇷",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "LIMITED",
    "statusLabel": "Barème Progressif IR + Social Benchmark",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026",
    "supportedTaxYears": [
      "2026",
      "2025"
    ],
    "hasRegions": false,
    "rulesetId": "FR-DGFIP-2026.1",
    "ruleVersion": "Code général des impôts (CGI) Barème de l'impôt sur le revenu",
    "lastVerifiedDate": "2026-10-10",
    "sourceAuthority": "Direction Générale des Finances Publiques (DGFiP) / URSSAF",
    "sources": [
      {
        "authority": "DGFiP & Service Public",
        "title": "Barème progressif de l'impôt sur le revenu (Article 197 du CGI)",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F1419",
        "sourceType": "GOVERNMENT",
        "publicationDate": "2024-12-20",
        "effectiveDate": "2025-01-01",
        "lastVerifiedDate": "2026-10-10"
      }
    ],
    "calculationScope": "Progressive income tax tranches (0%, 11%, 30%, 41%, 45%) with 10% standard professional expenses deduction. Benchmark employee social contributions (~22%) and employer charges (~42%).",
    "knownExclusions": [
      "Employee Social Charges Benchmark: Employee social security (CSG, CRDS, health, pension) is modeled using a representative benchmark of 21.0% rather than itemized URSSAF/Agirc-Arrco tranche breakdowns",
      "Employer Social Charges Benchmark: Employer payroll taxes are modeled at a representative statutory benchmark of 30.0%",
      "Quotient familial parts calculation for dependent children",
      "Complementaire Sante / Mutuelle mandatory employer packages",
      "Contribution Exceptionnelle sur les Hauts Revenus (CEHR)"
    ],
    "disclaimerNote": "Progressive tranches with 10% standard deduction + standard statutory social security benchmark. Excludes specific company mutuelle and cadre tiers.",
    "popular": true
  },
  "JP": {
    "code": "JP",
    "iso3": "JPN",
    "name": "Japan",
    "flag": "🇯🇵",
    "currency": "JPY",
    "symbol": "¥",
    "decimals": 0,
    "status": "LIMITED",
    "statusLabel": "Shotokuzei + Juminzei + Shakai Hoken",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026",
    "supportedTaxYears": [
      "2026",
      "2025"
    ],
    "hasRegions": false,
    "rulesetId": "JP-NTA-2026.1",
    "ruleVersion": "NTA Shotokuzei Slabs & Shakai Hoken Schedule",
    "lastVerifiedDate": "2026-10-10",
    "sourceAuthority": "National Tax Agency (NTA) & Japan Pension Service",
    "sources": [
      {
        "authority": "National Tax Agency (NTA)",
        "title": "Income Tax Rates (Shotokuzei Slabs) — Tax Answer No. 2260",
        "url": "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm",
        "sourceType": "TAX_AUTHORITY",
        "publicationDate": "2024-12-15",
        "effectiveDate": "2025-01-01",
        "lastVerifiedDate": "2026-10-10"
      },
      {
        "authority": "National Tax Agency (NTA)",
        "title": "Employment Income Deduction (Kyuyo Shotoku Kojo) — Tax Answer No. 1410",
        "url": "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm",
        "sourceType": "TAX_AUTHORITY",
        "publicationDate": "2024-12-15",
        "effectiveDate": "2025-01-01",
        "lastVerifiedDate": "2026-10-10"
      }
    ],
    "calculationScope": "National Income Tax (Shotokuzei 5% to 45%) with Employment Income Deduction (Kyuyo Shotoku Kojo), Basic Exemption (¥480,000), 2.1% Reconstruction Special Income Tax, standard 10% Resident Tax (Juminzei), and Shakai Hoken benchmark (~14.5% employee, ~15.5% employer).",
    "knownExclusions": [
      "Social Insurance (Shakai Hoken) Benchmark: Employee social insurance (health, pension, employment) is modeled using a representative flat benchmark of 15.0% (and 15.0% employer) rather than Kyokai Kenpo prefecture-specific standard monthly remuneration (hyojun hoshu getsugaku) grade brackets",
      "Corporate defined contribution pension (iDeCo / 401k) exemptions",
      "Spouse deduction (Haigusha Kojo) income phase-outs",
      "Kyoto/Tokyo municipal specific additions"
    ],
    "disclaimerNote": "National income tax, Reconstruction surtax, standard 10% Inhabitant Tax with employment income deduction, and standard Shakai Hoken benchmarks. Excludes company-specific union funds.",
    "popular": true
  },
  "CN": {
    "code": "CN",
    "iso3": "CHN",
    "name": "China",
    "flag": "🇨🇳",
    "currency": "CNY",
    "symbol": "¥",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "CN-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": true
  },
  "MY": {
    "code": "MY",
    "iso3": "MYS",
    "name": "Malaysia",
    "flag": "🇲🇾",
    "currency": "MYR",
    "symbol": "RM",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "MY-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "ID": {
    "code": "ID",
    "iso3": "IDN",
    "name": "Indonesia",
    "flag": "🇮🇩",
    "currency": "IDR",
    "symbol": "Rp",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "ID-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "NZ": {
    "code": "NZ",
    "iso3": "NZL",
    "name": "New Zealand",
    "flag": "🇳🇿",
    "currency": "NZD",
    "symbol": "$",
    "decimals": 2,
    "status": "VERIFIED",
    "statusLabel": "Verified Statutory",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026-2027",
    "supportedTaxYears": [
      "2026-2027",
      "2025-2026"
    ],
    "hasRegions": false,
    "rulesetId": "NZ-IRD-2026.1",
    "ruleVersion": "Inland Revenue PAYE Tax Rates (Budget 2024 Threshold Adjustments) + ACC Earner Levy",
    "lastVerifiedDate": "2026-10-01",
    "sourceAuthority": "Inland Revenue (Te Tari Taake)",
    "sources": [
      {
        "authority": "Inland Revenue (Te Tari Taake)",
        "title": "Individual income tax rates 2025-26 and 2026-27",
        "url": "https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals",
        "sourceType": "TAX_AUTHORITY",
        "publicationDate": "2024-07-31",
        "effectiveDate": "2024-07-31",
        "lastVerifiedDate": "2026-10-01"
      },
      {
        "authority": "Accident Compensation Corporation (ACC)",
        "title": "Earners' Levy Rates and Maximum Liable Earnings",
        "url": "https://www.acc.co.nz/about-us/our-levies/",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2025-04-01",
        "effectiveDate": "2025-04-01",
        "lastVerifiedDate": "2026-10-01"
      }
    ],
    "calculationScope": "PAYE personal income tax: 10.5% up to $15,600, 17.5% to $53,500, 30.0% to $78,100, 33.0% to $180,000, 39.0% excess. ACC Earners' Levy: 1.60% capped at $142,283 maximum liable earnings. KiwiSaver: configurable 0%-10% employee contribution (default 3%) with 3% statutory employer matching.",
    "knownExclusions": [
      "Independent Earner Tax Credit (IETC)",
      "Student loan repayment deductions (12% over threshold)",
      "Working for Families Tax Credits"
    ],
    "disclaimerNote": "Inland Revenue individual PAYE rates, ACC levy (1.60% capped), and KiwiSaver. Annualized statutory liability estimate.",
    "popular": true
  },
  "ZA": {
    "code": "ZA",
    "iso3": "ZAF",
    "name": "South Africa",
    "flag": "🇿🇦",
    "currency": "ZAR",
    "symbol": "R",
    "decimals": 2,
    "status": "VERIFIED",
    "statusLabel": "Verified Statutory",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026-2027",
    "supportedTaxYears": [
      "2026-2027",
      "2025-2026"
    ],
    "hasRegions": false,
    "rulesetId": "ZA-SARS-2026.1",
    "ruleVersion": "SARS Rates for Individuals (Income Tax Act 1962) + Primary Rebate & UIF",
    "lastVerifiedDate": "2026-10-01",
    "sourceAuthority": "South African Revenue Service (SARS)",
    "sources": [
      {
        "authority": "South African Revenue Service (SARS)",
        "title": "Tax Rates for Individuals 2025/2026 & 2026/2027",
        "url": "https://www.sars.gov.za/tax-rates/income-tax/rates-for-individuals/",
        "sourceType": "TAX_AUTHORITY",
        "publicationDate": "2025-02-26",
        "effectiveDate": "2025-03-01",
        "lastVerifiedDate": "2026-10-01"
      },
      {
        "authority": "Department of Employment and Labour",
        "title": "Unemployment Insurance Contributions Act (UIF)",
        "url": "https://www.labour.gov.za/",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2024-03-01",
        "effectiveDate": "2024-03-01",
        "lastVerifiedDate": "2026-10-01"
      }
    ],
    "calculationScope": "SARS PAYE progressive tax brackets: 18% to 45% with Primary Tax Rebate R 17,235 (tax threshold R 95,750). UIF: 1.0% employee and 1.0% employer capped at R 17,712/month (R 212,544/year). Employer Skills Development Levy (SDL): 1.0%.",
    "knownExclusions": [
      "Secondary and tertiary age rebates (age 65+ and 75+)",
      "Medical Scheme Fees Tax Credits (Section 6A/6B)",
      "Retirement annuity fund deductions (Section 11F)"
    ],
    "disclaimerNote": "SARS statutory tax tables, primary rebate, and UIF contributions. Estimated annualized take-home.",
    "popular": true
  },
  "BR": {
    "code": "BR",
    "iso3": "BRA",
    "name": "Brazil",
    "flag": "🇧🇷",
    "currency": "BRL",
    "symbol": "R$",
    "decimals": 2,
    "status": "VERIFIED",
    "statusLabel": "Verified Statutory",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026",
    "supportedTaxYears": [
      "2026",
      "2025"
    ],
    "hasRegions": false,
    "rulesetId": "BR-RFB-2026.1",
    "ruleVersion": "Receita Federal Tabela Progressiva IRPF + INSS Progressivo (Portaria Interministerial) & FGTS",
    "lastVerifiedDate": "2026-10-01",
    "sourceAuthority": "Receita Federal do Brasil (RFB) & Previdência Social",
    "sources": [
      {
        "authority": "Receita Federal do Brasil (RFB)",
        "title": "Tabela Progressiva Mensal do Imposto de Renda Pessoa Física",
        "url": "https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas",
        "sourceType": "TAX_AUTHORITY",
        "publicationDate": "2024-05-01",
        "effectiveDate": "2024-05-01",
        "lastVerifiedDate": "2026-10-01"
      },
      {
        "authority": "Ministério da Previdência Social",
        "title": "Portaria Interministerial MPS/MF — Tabela de Contribuição do INSS",
        "url": "https://www.gov.br/previdencia/",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2025-01-01",
        "effectiveDate": "2025-01-01",
        "lastVerifiedDate": "2026-10-01"
      }
    ],
    "calculationScope": "IRPF monthly progressive table (0%, 7.5%, 15%, 22.5%, 27.5%) with simplified monthly discount (R$ 564.80). INSS progressive employee tiers (7.5%, 9.0%, 12.0%, 14.0%) capped at R$ 7,786.02/month. INSS is deductible before IRPF. Employer statutory CLT burden: 20% INSS + 5.8% Terceiros + 2% RAT + 8% FGTS = 35.8%.",
    "knownExclusions": [
      "13th salary and 1/3 vacation bonus separate taxation",
      "Dependent deduction (Dedução por dependente R$ 189.59/month)",
      "Medical and private education deductions"
    ],
    "disclaimerNote": "Receita Federal IRPF and INSS progressive tables. Annualized standard CLT model.",
    "popular": true
  },
  "MX": {
    "code": "MX",
    "iso3": "MEX",
    "name": "Mexico",
    "flag": "🇲🇽",
    "currency": "MXN",
    "symbol": "$",
    "decimals": 2,
    "status": "VERIFIED",
    "statusLabel": "Verified Statutory",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026",
    "supportedTaxYears": [
      "2026",
      "2025"
    ],
    "hasRegions": false,
    "rulesetId": "MX-SAT-2026.1",
    "ruleVersion": "SAT Tarifa Anual ISR (Art. 152 Ley del ISR) + IMSS Cuotas Obrero-Patronales",
    "lastVerifiedDate": "2026-10-01",
    "sourceAuthority": "Servicio de Administración Tributaria (SAT)",
    "sources": [
      {
        "authority": "Servicio de Administración Tributaria (SAT)",
        "title": "Resolución Miscelánea Fiscal — Tarifa Anual del ISR para Personas Físicas (Art. 152)",
        "url": "https://www.sat.gob.mx/declaracion/28555/simulador-de-declaracion-anual",
        "sourceType": "TAX_AUTHORITY",
        "publicationDate": "2025-01-01",
        "effectiveDate": "2025-01-01",
        "lastVerifiedDate": "2026-10-01"
      },
      {
        "authority": "Instituto Mexicano del Seguro Social (IMSS)",
        "title": "Tabla de Cuotas Obrero-Patronales IMSS",
        "url": "https://www.imss.gob.mx/patrones/cuotas",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2025-01-01",
        "effectiveDate": "2025-01-01",
        "lastVerifiedDate": "2026-10-01"
      }
    ],
    "calculationScope": "ISR annual progressive tariff (11 slabs from 1.92% to 35.00% under Art. 152 LISR). Employee IMSS statutory contribution: 2.75% of salary capped at 25 UMAs ($1,032,000/year). Employer IMSS + Infonavit (5%) + ISN payroll tax (3%): 25.0% capped at 25 UMAs.",
    "knownExclusions": [
      "Employee IMSS Social Contribution Benchmark: Employee IMSS is modeled as a composite benchmark of 2.75% capped at 25 UMAs ($1,032,400/yr) rather than itemized insurance branch withholdings (Enfermedades y Maternidad, Invalidez y Vida, Retiro, Cesantía)",
      "Employer Social Contribution Benchmark: Employer payroll taxes (IMSS, Infonavit 5%, ISN 3%) are modeled at a 25.50% composite benchmark capped at 25 UMAs",
      "Subsidio para el empleo (applies strictly to lowest-wage earners below 1.2 minimum wages)",
      "Annual personal deductions (Deducciones personales: medical, mortgage interest up to 5 UMAs limit)",
      "PTU profit-sharing distribution"
    ],
    "disclaimerNote": "SAT annual progressive ISR rates and IMSS social security contributions. Annualized statutory estimate.",
    "popular": true
  },
  "AR": {
    "code": "AR",
    "iso3": "ARG",
    "name": "Argentina",
    "flag": "🇦🇷",
    "currency": "ARS",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "AR-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "QA": {
    "code": "QA",
    "iso3": "QAT",
    "name": "Qatar",
    "flag": "🇶🇦",
    "currency": "QAR",
    "symbol": "QR",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "QA-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "KW": {
    "code": "KW",
    "iso3": "KWT",
    "name": "Kuwait",
    "flag": "🇰🇼",
    "currency": "KWD",
    "symbol": "KD",
    "decimals": 3,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "KW-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "BH": {
    "code": "BH",
    "iso3": "BHR",
    "name": "Bahrain",
    "flag": "🇧🇭",
    "currency": "BHD",
    "symbol": "BD",
    "decimals": 3,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "BH-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "OM": {
    "code": "OM",
    "iso3": "OMN",
    "name": "Oman",
    "flag": "🇴🇲",
    "currency": "OMR",
    "symbol": "OMR",
    "decimals": 3,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "OM-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "CH": {
    "code": "CH",
    "iso3": "CHE",
    "name": "Switzerland",
    "flag": "🇨🇭",
    "currency": "CHF",
    "symbol": "CHF",
    "decimals": 2,
    "status": "VERIFIED",
    "statusLabel": "Verified Statutory",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026",
    "supportedTaxYears": [
      "2026",
      "2025"
    ],
    "hasRegions": true,
    "defaultRegion": "ZH",
    "rulesetId": "CH-ESTV-2026.1",
    "ruleVersion": "ESTV Direct Federal Tax (Art. 36 DBG) + Cantonal Benchmark + 1st/2nd Pillar (AHV/ALV/BVG)",
    "lastVerifiedDate": "2026-10-01",
    "sourceAuthority": "Federal Tax Administration (ESTV) & Federal Social Insurance Office (BSV)",
    "sources": [
      {
        "authority": "Federal Tax Administration (ESTV / FTA)",
        "title": "Direct Federal Tax Scales (Tarife der direkten Bundessteuer)",
        "url": "https://www.estv.admin.ch/estv/en/home/direct-federal-tax.html",
        "sourceType": "TAX_AUTHORITY",
        "publicationDate": "2025-11-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-10-01"
      },
      {
        "authority": "Federal Social Insurance Office (BSV / FSIO)",
        "title": "Social Security Contribution Rates (AHV/IV/EO & ALV)",
        "url": "https://www.bsv.admin.ch/bsv/en/home/social-insurance/overview.html",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2025-10-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-10-01"
      }
    ],
    "calculationScope": "Direct Federal Tax (IFD) progressive brackets: 0% to 11.5% (max rate at CHF 808,600). Cantonal & municipal benchmark tax modeled by canton (Zurich, Bern, Geneva, Zug, etc.) with CHF 10,000 personal deduction. 1st Pillar AHV/IV/EO: 5.30% employee and 5.30% employer (uncapped). ALV: 1.10% each up to CHF 148,200. BVG pension: 4.25% each on coordinated earnings. UVG/FAK statutory insurance.",
    "knownExclusions": [
      "Cantonal & Municipal Tax Benchmark: Cantonal and communal taxes (Staats- und Gemeindesteuern) are modeled using representative cantonal baseline rates (e.g. Zurich 13.5%, Geneva 17.5%, Zug 7.5%) rather than individual municipal tax multiplier (Steuerfuss) scales",
      "Church tax (Kirchensteuer)",
      "Municipal Steuerfuss local variation within selected canton",
      "Voluntary Pillar 3a tax deductions",
      "Specific withholding tax (Quellensteuer) tariff codes A/B/C"
    ],
    "disclaimerNote": "ESTV Federal direct tax and cantonal/communal benchmark with 1st/2nd pillar social security. Annualized take-home estimate.",
    "popular": true
  },
  "NL": {
    "code": "NL",
    "iso3": "NLD",
    "name": "Netherlands",
    "flag": "🇳🇱",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "VERIFIED",
    "statusLabel": "Verified Statutory",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026",
    "supportedTaxYears": [
      "2026",
      "2025"
    ],
    "hasRegions": false,
    "rulesetId": "NL-BELAST-2026.1",
    "ruleVersion": "Belastingdienst Box 1 Inkomstenbelasting (Belastingplan 2025/2026) + AHK & Arbeidskorting",
    "lastVerifiedDate": "2026-10-01",
    "sourceAuthority": "Belastingdienst (Tax and Customs Administration)",
    "sources": [
      {
        "authority": "Belastingdienst",
        "title": "Tarieven inkomstenbelasting Box 1 en heffingskortingen 2025/2026",
        "url": "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/",
        "sourceType": "TAX_AUTHORITY",
        "publicationDate": "2025-12-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-10-01"
      },
      {
        "authority": "Ministerie van Financiën",
        "title": "Belastingplan 2025 & 2026",
        "url": "https://www.rijksoverheid.nl/onderwerpen/belastingplan",
        "sourceType": "GOVERNMENT",
        "publicationDate": "2025-09-16",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-10-01"
      }
    ],
    "calculationScope": "Box 1 employment income tax: 2026 rates 35.82% up to €38,843, 37.48% to €77,654, 49.50% excess (national insurance AOW/Anw/Wlz integrated into bracket 1). General Tax Credit (AHK max €3,068) and Labour Tax Credit (Arbeidskorting max €5,635). Optional 30% expat ruling. Employer Werknemersverzekeringen 16.63% capped at €75,860.",
    "knownExclusions": [
      "Box 2 (substantial interest) and Box 3 (savings and investments)",
      "Mortgage interest deduction (hypotheekrenteaftrek)",
      "Zorgtoeslag (healthcare allowance) and Huurtoeslag subsidies"
    ],
    "disclaimerNote": "Belastingdienst Box 1 progressive rates, AHK and Arbeidskorting credits. Annualized take-home estimate.",
    "popular": true
  },
  "BE": {
    "code": "BE",
    "iso3": "BEL",
    "name": "Belgium",
    "flag": "🇧🇪",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "BE-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "AT": {
    "code": "AT",
    "iso3": "AUT",
    "name": "Austria",
    "flag": "🇦🇹",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "AT-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "IE": {
    "code": "IE",
    "iso3": "IRL",
    "name": "Ireland",
    "flag": "🇮🇪",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "VERIFIED",
    "statusLabel": "Verified Statutory",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026",
    "supportedTaxYears": [
      "2026",
      "2025"
    ],
    "hasRegions": false,
    "rulesetId": "IE-REV-2026.1",
    "ruleVersion": "Revenue Commissioners Budget 2025/2026 — PAYE Income Tax, USC & PRSI Class A",
    "lastVerifiedDate": "2026-10-01",
    "sourceAuthority": "Revenue Commissioners & Department of Social Protection",
    "sources": [
      {
        "authority": "Revenue Commissioners",
        "title": "Tax Relief Charts — Standard Rate Cut-Off Points & USC Rates",
        "url": "https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/tax-relief-charts/index.aspx",
        "sourceType": "TAX_AUTHORITY",
        "publicationDate": "2024-10-01",
        "effectiveDate": "2025-01-01",
        "lastVerifiedDate": "2026-10-01"
      },
      {
        "authority": "Department of Social Protection",
        "title": "SW14 PRSI Contribution Rates (Class A)",
        "url": "https://www.gov.ie/en/publication/14ef8a-prsi-rates/",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2024-10-01",
        "effectiveDate": "2025-01-01",
        "lastVerifiedDate": "2026-10-01"
      }
    ],
    "calculationScope": "Standard 20% income tax up to €44,000 cut-off, 40% higher rate. Single personal (€2,000) and Employee PAYE (€2,000) tax credits (€4,000 total). USC rates: 0.5% to €12,012, 2% to €27,382, 3% to €70,044, 8% balance (exempt if income ≤ €13,000). PRSI Class A: 4.10% employee (tapered credit €352-€424/wk), 11.15% employer.",
    "knownExclusions": [
      "Married / Civil Partner transferred rate bands (€53,000/€88,000)",
      "Age tax credits (age 65+)",
      "Home Carer Tax Credit",
      "PRSI Class S (Self-Employed)"
    ],
    "disclaimerNote": "Revenue Commissioners PAYE, USC, and DSP PRSI Class A. Annualized statutory take-home estimate.",
    "popular": true
  },
  "ES": {
    "code": "ES",
    "iso3": "ESP",
    "name": "Spain",
    "flag": "🇪🇸",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "VERIFIED",
    "statusLabel": "Verified Statutory",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026",
    "supportedTaxYears": [
      "2026",
      "2025"
    ],
    "hasRegions": true,
    "defaultRegion": "MD",
    "rulesetId": "ES-AEAT-2026.1",
    "ruleVersion": "Agencia Tributaria IRPF (Escala Estatal y Autonómica) + Seguridad Social Régimen General",
    "lastVerifiedDate": "2026-10-01",
    "sourceAuthority": "Agencia Estatal de Administración Tributaria (AEAT) & Seguridad Social",
    "sources": [
      {
        "authority": "Agencia Estatal de Administración Tributaria (AEAT)",
        "title": "Manual de Renta — Escala General y Autonómica del IRPF",
        "url": "https://sede.agenciatributaria.gob.es/Sede/irpf.html",
        "sourceType": "TAX_AUTHORITY",
        "publicationDate": "2025-01-01",
        "effectiveDate": "2025-01-01",
        "lastVerifiedDate": "2026-10-01"
      },
      {
        "authority": "Seguridad Social",
        "title": "Bases y Tipos de Cotización Régimen General",
        "url": "https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2025-01-01",
        "effectiveDate": "2025-01-01",
        "lastVerifiedDate": "2026-10-01"
      }
    ],
    "calculationScope": "IRPF combined state scale (9.5%–24.5%) and regional autonomic scale (Madrid, Cataluña, Andalucía, Valencia, or General) with €2,000 employment expense deduction and €5,550 personal minimum tax credit. Seguridad Social employee: 6.50% (contingencias comunes, desempleo, formación, MEI) capped at €58,950/year. Employer SS: 31.90% capped at €58,950/year.",
    "knownExclusions": [
      "Deducción por maternidad y familia numerosa",
      "Aportaciones a planes de pensiones privados",
      "Exención por despido o indemnización",
      "Régimen especial de trabajadores desplazados (Ley Beckham)"
    ],
    "disclaimerNote": "AEAT IRPF dual scales and Seguridad Social contributions. Annualized statutory estimate.",
    "popular": true
  },
  "IT": {
    "code": "IT",
    "iso3": "ITA",
    "name": "Italy",
    "flag": "🇮🇹",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "VERIFIED",
    "statusLabel": "Verified Statutory",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026",
    "supportedTaxYears": [
      "2026",
      "2025"
    ],
    "hasRegions": true,
    "defaultRegion": "LOM",
    "rulesetId": "IT-ADE-2026.1",
    "ruleVersion": "Agenzia delle Entrate IRPEF a 3 Scaglioni (D.Lgs. 216/2023) + Addizionali & INPS",
    "lastVerifiedDate": "2026-10-01",
    "sourceAuthority": "Agenzia delle Entrate & INPS",
    "sources": [
      {
        "authority": "Agenzia delle Entrate",
        "title": "Riforma dell'IRPEF — Aliquote e Scaglioni di Reddito",
        "url": "https://www.agenziaentrate.gov.it/portale/imposta-sul-reddito-delle-persone-fisiche-irpef",
        "sourceType": "TAX_AUTHORITY",
        "publicationDate": "2024-12-30",
        "effectiveDate": "2025-01-01",
        "lastVerifiedDate": "2026-10-01"
      },
      {
        "authority": "Istituto Nazionale della Previdenza Sociale (INPS)",
        "title": "Aliquote Contributive Gestione Lavoratori Dipendenti",
        "url": "https://www.inps.it/",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2025-01-15",
        "effectiveDate": "2025-01-01",
        "lastVerifiedDate": "2026-10-01"
      }
    ],
    "calculationScope": "IRPEF 3 progressive brackets: 23% up to €28,000, 35% to €50,000, 43% excess. Detrazione da lavoro dipendente (up to €1,955). Regional surtax by region (Lombardia, Lazio, Piemonte, Veneto, etc.) and municipal surtax 0.80%. Employee INPS: 9.19% (plus 1% solidarity over €55,008) capped at massimale €116,366/year. INPS is deductible before IRPEF. Employer INPS: ~30.0% capped.",
    "knownExclusions": [
      "Regional & Municipal Surtax Benchmark: Addizionale Regionale is modeled using representative baseline rates (e.g. Lombardia 1.73%, Lazio 3.33%) and Addizionale Comunale at a standard 0.80% benchmark rather than progressive regional/municipal scales",
      "Trattamento Integrativo (ex Bonus Renzi €100/mo) specific conditionality",
      "Detrazioni per carichi di famiglia (figli a carico / coniuge)",
      "Spese sanitarie e mutui detraibili al 19%",
      "TFR (Trattamento di Fine Rapporto) separate taxation"
    ],
    "disclaimerNote": "Agenzia delle Entrate IRPEF reform, addizionali and INPS social contributions. Annualized statutory estimate.",
    "popular": true
  },
  "PT": {
    "code": "PT",
    "iso3": "PRT",
    "name": "Portugal",
    "flag": "🇵🇹",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "PT-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "SE": {
    "code": "SE",
    "iso3": "SWE",
    "name": "Sweden",
    "flag": "🇸🇪",
    "currency": "SEK",
    "symbol": "kr",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "SE-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "NO": {
    "code": "NO",
    "iso3": "NOR",
    "name": "Norway",
    "flag": "🇳🇴",
    "currency": "NOK",
    "symbol": "kr",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "NO-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "DK": {
    "code": "DK",
    "iso3": "DNK",
    "name": "Denmark",
    "flag": "🇩🇰",
    "currency": "DKK",
    "symbol": "kr",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "DK-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "FI": {
    "code": "FI",
    "iso3": "FIN",
    "name": "Finland",
    "flag": "🇫🇮",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "FI-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "PL": {
    "code": "PL",
    "iso3": "POL",
    "name": "Poland",
    "flag": "🇵🇱",
    "currency": "PLN",
    "symbol": "zł",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "PL-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "CZ": {
    "code": "CZ",
    "iso3": "CZE",
    "name": "Czech Republic",
    "flag": "🇨🇿",
    "currency": "CZK",
    "symbol": "Kč",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "CZ-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "HU": {
    "code": "HU",
    "iso3": "HUN",
    "name": "Hungary",
    "flag": "🇭🇺",
    "currency": "HUF",
    "symbol": "Ft",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "HU-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "RO": {
    "code": "RO",
    "iso3": "ROU",
    "name": "Romania",
    "flag": "🇷🇴",
    "currency": "RON",
    "symbol": "lei",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "RO-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "TR": {
    "code": "TR",
    "iso3": "TUR",
    "name": "Turkey",
    "flag": "🇹🇷",
    "currency": "TRY",
    "symbol": "₺",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "TR-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "KR": {
    "code": "KR",
    "iso3": "KOR",
    "name": "South Korea",
    "flag": "🇰🇷",
    "currency": "KRW",
    "symbol": "₩",
    "decimals": 0,
    "status": "VERIFIED",
    "statusLabel": "Verified Statutory",
    "freshness": "CURRENT",
    "defaultTaxYear": "2026",
    "supportedTaxYears": [
      "2026",
      "2025"
    ],
    "hasRegions": false,
    "rulesetId": "KR-NTS-2026.1",
    "ruleVersion": "National Tax Service Income Tax Act (소득세법) + 4 Major Insurances (4대보험)",
    "lastVerifiedDate": "2026-10-10",
    "sourceAuthority": "National Tax Service (NTS / 국세청) & NHIS (국민건강보험공단)",
    "sources": [
      {
        "authority": "National Tax Service (국세청)",
        "title": "Individual Income Tax Guide & Progressive Rates (근로소득세 기본세율)",
        "url": "https://www.nts.go.kr/english/cm/cntnts/cntntsView.do?mi=10793&cntntsId=8644",
        "sourceType": "TAX_AUTHORITY",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-10-10"
      },
      {
        "authority": "National Health Insurance Service (NHIS)",
        "title": "4 Major Social Insurances Contribution Rates & Caps (4대 사회보험료율)",
        "url": "https://www.nhis.or.kr/english/index.do",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-10-10"
      }
    ],
    "calculationScope": "Statutory Korean individual employment income taxation: Earned Income Deduction (근로소득공제), Basic Personal Deduction (기본공제), 8 progressive national tax brackets (6%–45%), Local Income Tax (지방소득세 10% surtax), Earned Income Tax Credit (근로소득세액공제), and 4 Major Insurances (National Pension 4.5% capped at ₩6,170,000/mo, Health Insurance 3.545%, Long-Term Care 12.95% of NHI = 0.459%, Employment Insurance 0.90%).",
    "knownExclusions": [
      "Special family deductions (부양가족공제) beyond single filer",
      "Special expense tax credits (medical, education, donation, housing credits)",
      "Severance pay retirement income tax (퇴직소득세)",
      "Non-taxable meal/transport allowance caps exceeding statutory limits"
    ],
    "disclaimerNote": "Statutory model for individual salaried wage earner under Korean Income Tax Act & 4 Major Insurances. Excludes discretionary personal and year-end settlement credits.",
    "popular": true
  },
  "TH": {
    "code": "TH",
    "iso3": "THA",
    "name": "Thailand",
    "flag": "🇹🇭",
    "currency": "THB",
    "symbol": "฿",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "TH-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "PH": {
    "code": "PH",
    "iso3": "PHL",
    "name": "Philippines",
    "flag": "🇵🇭",
    "currency": "PHP",
    "symbol": "₱",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "PH-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "VN": {
    "code": "VN",
    "iso3": "VNM",
    "name": "Vietnam",
    "flag": "🇻🇳",
    "currency": "VND",
    "symbol": "₫",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "VN-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "NG": {
    "code": "NG",
    "iso3": "NGA",
    "name": "Nigeria",
    "flag": "🇳🇬",
    "currency": "NGN",
    "symbol": "₦",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "NG-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "KE": {
    "code": "KE",
    "iso3": "KEN",
    "name": "Kenya",
    "flag": "🇰🇪",
    "currency": "KES",
    "symbol": "KSh",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "KE-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "EG": {
    "code": "EG",
    "iso3": "EGY",
    "name": "Egypt",
    "flag": "🇪🇬",
    "currency": "EGP",
    "symbol": "E£",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "EG-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "BD": {
    "code": "BD",
    "iso3": "BGD",
    "name": "Bangladesh",
    "flag": "🇧🇩",
    "currency": "BDT",
    "symbol": "৳",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "BD-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "CL": {
    "code": "CL",
    "iso3": "CHL",
    "name": "Chile",
    "flag": "🇨🇱",
    "currency": "CLP",
    "symbol": "$",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "CL-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "CO": {
    "code": "CO",
    "iso3": "COL",
    "name": "Colombia",
    "flag": "🇨🇴",
    "currency": "COP",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "CO-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "PE": {
    "code": "PE",
    "iso3": "PER",
    "name": "Peru",
    "flag": "🇵🇪",
    "currency": "PEN",
    "symbol": "S/",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "PE-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "IL": {
    "code": "IL",
    "iso3": "ISR",
    "name": "Israel",
    "flag": "🇮🇱",
    "currency": "ILS",
    "symbol": "₪",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "IL-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "GR": {
    "code": "GR",
    "iso3": "GRC",
    "name": "Greece",
    "flag": "🇬🇷",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "GR-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "CY": {
    "code": "CY",
    "iso3": "CYP",
    "name": "Cyprus",
    "flag": "🇨🇾",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "CY-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "LU": {
    "code": "LU",
    "iso3": "LUX",
    "name": "Luxembourg",
    "flag": "🇱🇺",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "LU-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "HK": {
    "code": "HK",
    "iso3": "HKG",
    "name": "Hong Kong",
    "flag": "🇭🇰",
    "currency": "HKD",
    "symbol": "HK$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "HK-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "TW": {
    "code": "TW",
    "iso3": "TWN",
    "name": "Taiwan",
    "flag": "🇹🇼",
    "currency": "TWD",
    "symbol": "NT$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "TW-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "IS": {
    "code": "IS",
    "iso3": "ISL",
    "name": "Iceland",
    "flag": "🇮🇸",
    "currency": "ISK",
    "symbol": "kr",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "IS-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "EE": {
    "code": "EE",
    "iso3": "EST",
    "name": "Estonia",
    "flag": "🇪🇪",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "EE-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "LV": {
    "code": "LV",
    "iso3": "LVA",
    "name": "Latvia",
    "flag": "🇱🇻",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "LV-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "LT": {
    "code": "LT",
    "iso3": "LTU",
    "name": "Lithuania",
    "flag": "🇱🇹",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "LT-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "SK": {
    "code": "SK",
    "iso3": "SVK",
    "name": "Slovakia",
    "flag": "🇸🇰",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "SK-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "SI": {
    "code": "SI",
    "iso3": "SVN",
    "name": "Slovenia",
    "flag": "🇸🇮",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "SI-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "HR": {
    "code": "HR",
    "iso3": "HRV",
    "name": "Croatia",
    "flag": "🇭🇷",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "HR-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "BG": {
    "code": "BG",
    "iso3": "BGR",
    "name": "Bulgaria",
    "flag": "🇧🇬",
    "currency": "BGN",
    "symbol": "лв",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "BG-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "RS": {
    "code": "RS",
    "iso3": "SRB",
    "name": "Serbia",
    "flag": "🇷🇸",
    "currency": "RSD",
    "symbol": "din",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "RS-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "BA": {
    "code": "BA",
    "iso3": "BIH",
    "name": "Bosnia and Herzegovina",
    "flag": "🇧🇦",
    "currency": "BAM",
    "symbol": "KM",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "BA-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "ME": {
    "code": "ME",
    "iso3": "MNE",
    "name": "Montenegro",
    "flag": "🇲🇪",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "ME-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "MK": {
    "code": "MK",
    "iso3": "MKD",
    "name": "North Macedonia",
    "flag": "🇲🇰",
    "currency": "MKD",
    "symbol": "den",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "MK-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "AL": {
    "code": "AL",
    "iso3": "ALB",
    "name": "Albania",
    "flag": "🇦🇱",
    "currency": "ALL",
    "symbol": "L",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "AL-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "MT": {
    "code": "MT",
    "iso3": "MLT",
    "name": "Malta",
    "flag": "🇲🇹",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "MT-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "UA": {
    "code": "UA",
    "iso3": "UKR",
    "name": "Ukraine",
    "flag": "🇺🇦",
    "currency": "UAH",
    "symbol": "₴",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "UA-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "MD": {
    "code": "MD",
    "iso3": "MDA",
    "name": "Moldova",
    "flag": "🇲🇩",
    "currency": "MDL",
    "symbol": "L",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "MD-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "GE": {
    "code": "GE",
    "iso3": "GEO",
    "name": "Georgia",
    "flag": "🇬🇪",
    "currency": "GEL",
    "symbol": "₾",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "GE-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "AM": {
    "code": "AM",
    "iso3": "ARM",
    "name": "Armenia",
    "flag": "🇦🇲",
    "currency": "AMD",
    "symbol": "֏",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "AM-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "AZ": {
    "code": "AZ",
    "iso3": "AZE",
    "name": "Azerbaijan",
    "flag": "🇦🇿",
    "currency": "AZN",
    "symbol": "₼",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "AZ-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "KZ": {
    "code": "KZ",
    "iso3": "KAZ",
    "name": "Kazakhstan",
    "flag": "🇰🇿",
    "currency": "KZT",
    "symbol": "₸",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "KZ-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "UZ": {
    "code": "UZ",
    "iso3": "UZB",
    "name": "Uzbekistan",
    "flag": "🇺🇿",
    "currency": "UZS",
    "symbol": "so'm",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "UZ-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "MA": {
    "code": "MA",
    "iso3": "MAR",
    "name": "Morocco",
    "flag": "🇲🇦",
    "currency": "MAD",
    "symbol": "DH",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "MA-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "DZ": {
    "code": "DZ",
    "iso3": "DZA",
    "name": "Algeria",
    "flag": "🇩🇿",
    "currency": "DZD",
    "symbol": "DA",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "DZ-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "TN": {
    "code": "TN",
    "iso3": "TUN",
    "name": "Tunisia",
    "flag": "🇹🇳",
    "currency": "TND",
    "symbol": "DT",
    "decimals": 3,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "TN-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "GH": {
    "code": "GH",
    "iso3": "GHA",
    "name": "Ghana",
    "flag": "🇬🇭",
    "currency": "GHS",
    "symbol": "GH₵",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "GH-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "ET": {
    "code": "ET",
    "iso3": "ETH",
    "name": "Ethiopia",
    "flag": "🇪🇹",
    "currency": "ETB",
    "symbol": "Br",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "ET-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "TZ": {
    "code": "TZ",
    "iso3": "TZA",
    "name": "Tanzania",
    "flag": "🇹🇿",
    "currency": "TZS",
    "symbol": "TSh",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "TZ-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "UG": {
    "code": "UG",
    "iso3": "UGA",
    "name": "Uganda",
    "flag": "🇺🇬",
    "currency": "UGX",
    "symbol": "USh",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "UG-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "RW": {
    "code": "RW",
    "iso3": "RWA",
    "name": "Rwanda",
    "flag": "🇷🇼",
    "currency": "RWF",
    "symbol": "FRw",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "RW-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "SN": {
    "code": "SN",
    "iso3": "SEN",
    "name": "Senegal",
    "flag": "🇸🇳",
    "currency": "XOF",
    "symbol": "CFA",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "SN-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "CI": {
    "code": "CI",
    "iso3": "CIV",
    "name": "Ivory Coast",
    "flag": "🇨🇮",
    "currency": "XOF",
    "symbol": "CFA",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "CI-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "CM": {
    "code": "CM",
    "iso3": "CMR",
    "name": "Cameroon",
    "flag": "🇨🇲",
    "currency": "XAF",
    "symbol": "FCFA",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "CM-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "AO": {
    "code": "AO",
    "iso3": "AGO",
    "name": "Angola",
    "flag": "🇦🇴",
    "currency": "AOA",
    "symbol": "Kz",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "AO-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "MZ": {
    "code": "MZ",
    "iso3": "MOZ",
    "name": "Mozambique",
    "flag": "🇲🇿",
    "currency": "MZN",
    "symbol": "MT",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "MZ-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "MU": {
    "code": "MU",
    "iso3": "MUS",
    "name": "Mauritius",
    "flag": "🇲🇺",
    "currency": "MUR",
    "symbol": "₨",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "MU-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "JO": {
    "code": "JO",
    "iso3": "JOR",
    "name": "Jordan",
    "flag": "🇯🇴",
    "currency": "JOD",
    "symbol": "JD",
    "decimals": 3,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "JO-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "LB": {
    "code": "LB",
    "iso3": "LBN",
    "name": "Lebanon",
    "flag": "🇱🇧",
    "currency": "LBP",
    "symbol": "L£",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "LB-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "IQ": {
    "code": "IQ",
    "iso3": "IRQ",
    "name": "Iraq",
    "flag": "🇮🇶",
    "currency": "IQD",
    "symbol": "ID",
    "decimals": 3,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "IQ-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "LK": {
    "code": "LK",
    "iso3": "LKA",
    "name": "Sri Lanka",
    "flag": "🇱🇰",
    "currency": "LKR",
    "symbol": "Rs",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "LK-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "NP": {
    "code": "NP",
    "iso3": "NPL",
    "name": "Nepal",
    "flag": "🇳🇵",
    "currency": "NPR",
    "symbol": "Rs",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "NP-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "UY": {
    "code": "UY",
    "iso3": "URY",
    "name": "Uruguay",
    "flag": "🇺🇾",
    "currency": "UYU",
    "symbol": "$U",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "UY-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "PY": {
    "code": "PY",
    "iso3": "PRY",
    "name": "Paraguay",
    "flag": "🇵🇾",
    "currency": "PYG",
    "symbol": "₲",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "PY-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "EC": {
    "code": "EC",
    "iso3": "ECU",
    "name": "Ecuador",
    "flag": "🇪🇨",
    "currency": "USD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "EC-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "BO": {
    "code": "BO",
    "iso3": "BOL",
    "name": "Bolivia",
    "flag": "🇧🇴",
    "currency": "BOB",
    "symbol": "Bs",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "BO-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "CR": {
    "code": "CR",
    "iso3": "CRI",
    "name": "Costa Rica",
    "flag": "🇨🇷",
    "currency": "CRC",
    "symbol": "₡",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "CR-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "PA": {
    "code": "PA",
    "iso3": "PAN",
    "name": "Panama",
    "flag": "🇵🇦",
    "currency": "PAB",
    "symbol": "B/.",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "PA-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "DO": {
    "code": "DO",
    "iso3": "DOM",
    "name": "Dominican Republic",
    "flag": "🇩🇴",
    "currency": "DOP",
    "symbol": "RD$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "DO-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "JM": {
    "code": "JM",
    "iso3": "JAM",
    "name": "Jamaica",
    "flag": "🇯🇲",
    "currency": "JMD",
    "symbol": "J$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "JM-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "TT": {
    "code": "TT",
    "iso3": "TTO",
    "name": "Trinidad and Tobago",
    "flag": "🇹🇹",
    "currency": "TTD",
    "symbol": "TT$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "TT-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "GT": {
    "code": "GT",
    "iso3": "GTM",
    "name": "Guatemala",
    "flag": "🇬🇹",
    "currency": "GTQ",
    "symbol": "Q",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "GT-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "SV": {
    "code": "SV",
    "iso3": "SLV",
    "name": "El Salvador",
    "flag": "🇸🇻",
    "currency": "USD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "SV-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "HN": {
    "code": "HN",
    "iso3": "HND",
    "name": "Honduras",
    "flag": "🇭🇳",
    "currency": "HNL",
    "symbol": "L",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "HN-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "NI": {
    "code": "NI",
    "iso3": "NIC",
    "name": "Nicaragua",
    "flag": "🇳🇮",
    "currency": "NIO",
    "symbol": "C$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "NI-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "FJ": {
    "code": "FJ",
    "iso3": "FJI",
    "name": "Fiji",
    "flag": "🇫🇯",
    "currency": "FJD",
    "symbol": "FJ$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "FJ-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "PG": {
    "code": "PG",
    "iso3": "PNG",
    "name": "Papua New Guinea",
    "flag": "🇵🇬",
    "currency": "PGK",
    "symbol": "K",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "PG-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "KH": {
    "code": "KH",
    "iso3": "KHM",
    "name": "Cambodia",
    "flag": "🇰🇭",
    "currency": "KHR",
    "symbol": "៛",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "KH-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "MM": {
    "code": "MM",
    "iso3": "MMR",
    "name": "Myanmar",
    "flag": "🇲🇲",
    "currency": "MMK",
    "symbol": "K",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "MM-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "LA": {
    "code": "LA",
    "iso3": "LAO",
    "name": "Laos",
    "flag": "🇱🇦",
    "currency": "LAK",
    "symbol": "₭",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "LA-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "BN": {
    "code": "BN",
    "iso3": "BRN",
    "name": "Brunei",
    "flag": "🇧🇳",
    "currency": "BND",
    "symbol": "B$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "BN-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "MN": {
    "code": "MN",
    "iso3": "MNG",
    "name": "Mongolia",
    "flag": "🇲🇳",
    "currency": "MNT",
    "symbol": "₮",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "MN-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "MV": {
    "code": "MV",
    "iso3": "MDV",
    "name": "Maldives",
    "flag": "🇲🇻",
    "currency": "MVR",
    "symbol": "Rf",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "MV-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "BT": {
    "code": "BT",
    "iso3": "BTN",
    "name": "Bhutan",
    "flag": "🇧🇹",
    "currency": "BTN",
    "symbol": "Nu.",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "BT-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "LI": {
    "code": "LI",
    "iso3": "LIE",
    "name": "Liechtenstein",
    "flag": "🇱🇮",
    "currency": "CHF",
    "symbol": "CHF",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "LI-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "MC": {
    "code": "MC",
    "iso3": "MCO",
    "name": "Monaco",
    "flag": "🇲🇨",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "MC-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "SM": {
    "code": "SM",
    "iso3": "SMR",
    "name": "San Marino",
    "flag": "🇸🇲",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "SM-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "AD": {
    "code": "AD",
    "iso3": "AND",
    "name": "Andorra",
    "flag": "🇦🇩",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "AD-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "GI": {
    "code": "GI",
    "iso3": "GIB",
    "name": "Gibraltar",
    "flag": "🇬🇮",
    "currency": "GIP",
    "symbol": "£",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "GI-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "IM": {
    "code": "IM",
    "iso3": "IMN",
    "name": "Isle of Man",
    "flag": "🇮🇲",
    "currency": "GBP",
    "symbol": "£",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "IM-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "JE": {
    "code": "JE",
    "iso3": "JEY",
    "name": "Jersey",
    "flag": "🇯🇪",
    "currency": "GBP",
    "symbol": "£",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "JE-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "GG": {
    "code": "GG",
    "iso3": "GGY",
    "name": "Guernsey",
    "flag": "🇬🇬",
    "currency": "GBP",
    "symbol": "£",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "GG-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "BM": {
    "code": "BM",
    "iso3": "BMU",
    "name": "Bermuda",
    "flag": "🇧🇲",
    "currency": "BMD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "BM-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "KY": {
    "code": "KY",
    "iso3": "CYM",
    "name": "Cayman Islands",
    "flag": "🇰🇾",
    "currency": "KYD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "KY-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "BS": {
    "code": "BS",
    "iso3": "BHS",
    "name": "Bahamas",
    "flag": "🇧🇸",
    "currency": "BSD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "BS-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "BB": {
    "code": "BB",
    "iso3": "BRB",
    "name": "Barbados",
    "flag": "🇧🇧",
    "currency": "BBD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "BB-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "AF": {
    "code": "AF",
    "iso3": "AFG",
    "name": "Afghanistan",
    "flag": "🇦🇫",
    "currency": "AFN",
    "symbol": "؋",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "AF-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "AG": {
    "code": "AG",
    "iso3": "ATG",
    "name": "Antigua and Barbuda",
    "flag": "🇦🇬",
    "currency": "XCD",
    "symbol": "EC$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "AG-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "AI": {
    "code": "AI",
    "iso3": "AIA",
    "name": "Anguilla",
    "flag": "🇦🇮",
    "currency": "XCD",
    "symbol": "EC$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "AI-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "AW": {
    "code": "AW",
    "iso3": "ABW",
    "name": "Aruba",
    "flag": "🇦🇼",
    "currency": "AWG",
    "symbol": "Afl.",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "AW-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "BF": {
    "code": "BF",
    "iso3": "BFA",
    "name": "Burkina Faso",
    "flag": "🇧🇫",
    "currency": "XOF",
    "symbol": "CFA",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "BF-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "BI": {
    "code": "BI",
    "iso3": "BDI",
    "name": "Burundi",
    "flag": "🇧🇮",
    "currency": "BIF",
    "symbol": "FBu",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "BI-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "BJ": {
    "code": "BJ",
    "iso3": "BEN",
    "name": "Benin",
    "flag": "🇧🇯",
    "currency": "XOF",
    "symbol": "CFA",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "BJ-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "BW": {
    "code": "BW",
    "iso3": "BWA",
    "name": "Botswana",
    "flag": "🇧🇼",
    "currency": "BWP",
    "symbol": "P",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "BW-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "BZ": {
    "code": "BZ",
    "iso3": "BLZ",
    "name": "Belize",
    "flag": "🇧🇿",
    "currency": "BZD",
    "symbol": "BZ$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "BZ-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "CD": {
    "code": "CD",
    "iso3": "COD",
    "name": "DR Congo",
    "flag": "🇨🇩",
    "currency": "CDF",
    "symbol": "FC",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "CD-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "CF": {
    "code": "CF",
    "iso3": "CAF",
    "name": "Central African Republic",
    "flag": "🇨🇫",
    "currency": "XAF",
    "symbol": "FCFA",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "CF-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "CG": {
    "code": "CG",
    "iso3": "COG",
    "name": "Republic of the Congo",
    "flag": "🇨🇬",
    "currency": "XAF",
    "symbol": "FCFA",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "CG-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "CU": {
    "code": "CU",
    "iso3": "CUB",
    "name": "Cuba",
    "flag": "🇨🇺",
    "currency": "CUP",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "CU-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "CV": {
    "code": "CV",
    "iso3": "CPV",
    "name": "Cape Verde",
    "flag": "🇨🇻",
    "currency": "CVE",
    "symbol": "Esc",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "CV-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "CW": {
    "code": "CW",
    "iso3": "CUW",
    "name": "Curaçao",
    "flag": "🇨🇼",
    "currency": "ANG",
    "symbol": "NAƒ",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "CW-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "DJ": {
    "code": "DJ",
    "iso3": "DJI",
    "name": "Djibouti",
    "flag": "🇩🇯",
    "currency": "DJF",
    "symbol": "Fdj",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "DJ-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "DM": {
    "code": "DM",
    "iso3": "DMA",
    "name": "Dominica",
    "flag": "🇩🇲",
    "currency": "XCD",
    "symbol": "EC$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "DM-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "ER": {
    "code": "ER",
    "iso3": "ERI",
    "name": "Eritrea",
    "flag": "🇪🇷",
    "currency": "ERN",
    "symbol": "Nfk",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "ER-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "FO": {
    "code": "FO",
    "iso3": "FRO",
    "name": "Faroe Islands",
    "flag": "🇫🇴",
    "currency": "DKK",
    "symbol": "kr",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "FO-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "GA": {
    "code": "GA",
    "iso3": "GAB",
    "name": "Gabon",
    "flag": "🇬🇦",
    "currency": "XAF",
    "symbol": "FCFA",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "GA-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "GD": {
    "code": "GD",
    "iso3": "GRD",
    "name": "Grenada",
    "flag": "🇬🇩",
    "currency": "XCD",
    "symbol": "EC$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "GD-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "GL": {
    "code": "GL",
    "iso3": "GRL",
    "name": "Greenland",
    "flag": "🇬🇱",
    "currency": "DKK",
    "symbol": "kr",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "GL-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "GM": {
    "code": "GM",
    "iso3": "GMB",
    "name": "The Gambia",
    "flag": "🇬🇲",
    "currency": "GMD",
    "symbol": "D",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "GM-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "GN": {
    "code": "GN",
    "iso3": "GIN",
    "name": "Guinea",
    "flag": "🇬🇳",
    "currency": "GNF",
    "symbol": "FG",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "GN-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "GQ": {
    "code": "GQ",
    "iso3": "GNQ",
    "name": "Equatorial Guinea",
    "flag": "🇬🇶",
    "currency": "XAF",
    "symbol": "FCFA",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "GQ-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "GU": {
    "code": "GU",
    "iso3": "GUM",
    "name": "Guam",
    "flag": "🇬🇺",
    "currency": "USD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "GU-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "GW": {
    "code": "GW",
    "iso3": "GNB",
    "name": "Guinea-Bissau",
    "flag": "🇬🇼",
    "currency": "XOF",
    "symbol": "CFA",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "GW-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "GY": {
    "code": "GY",
    "iso3": "GUY",
    "name": "Guyana",
    "flag": "🇬🇾",
    "currency": "GYD",
    "symbol": "G$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "GY-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "HT": {
    "code": "HT",
    "iso3": "HTI",
    "name": "Haiti",
    "flag": "🇭🇹",
    "currency": "HTG",
    "symbol": "G",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "HT-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "IR": {
    "code": "IR",
    "iso3": "IRN",
    "name": "Iran",
    "flag": "🇮🇷",
    "currency": "IRR",
    "symbol": "﷼",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "IR-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "KI": {
    "code": "KI",
    "iso3": "KIR",
    "name": "Kiribati",
    "flag": "🇰🇮",
    "currency": "AUD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "KI-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "KM": {
    "code": "KM",
    "iso3": "COM",
    "name": "Comoros",
    "flag": "🇰🇲",
    "currency": "KMF",
    "symbol": "CF",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "KM-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "KN": {
    "code": "KN",
    "iso3": "KNA",
    "name": "Saint Kitts and Nevis",
    "flag": "🇰🇳",
    "currency": "XCD",
    "symbol": "EC$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "KN-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "KP": {
    "code": "KP",
    "iso3": "PRK",
    "name": "North Korea",
    "flag": "🇰🇵",
    "currency": "KPW",
    "symbol": "₩",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "KP-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "LC": {
    "code": "LC",
    "iso3": "LCA",
    "name": "Saint Lucia",
    "flag": "🇱🇨",
    "currency": "XCD",
    "symbol": "EC$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "LC-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "LR": {
    "code": "LR",
    "iso3": "LBR",
    "name": "Liberia",
    "flag": "🇱🇷",
    "currency": "LRD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "LR-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "LS": {
    "code": "LS",
    "iso3": "LSO",
    "name": "Lesotho",
    "flag": "🇱🇸",
    "currency": "LSL",
    "symbol": "L",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "LS-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "LY": {
    "code": "LY",
    "iso3": "LYB",
    "name": "Libya",
    "flag": "🇱🇾",
    "currency": "LYD",
    "symbol": "LD",
    "decimals": 3,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "LY-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "MG": {
    "code": "MG",
    "iso3": "MDG",
    "name": "Madagascar",
    "flag": "🇲🇬",
    "currency": "MGA",
    "symbol": "Ar",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "MG-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "MH": {
    "code": "MH",
    "iso3": "MHL",
    "name": "Marshall Islands",
    "flag": "🇲🇭",
    "currency": "USD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "MH-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "ML": {
    "code": "ML",
    "iso3": "MLI",
    "name": "Mali",
    "flag": "🇲🇱",
    "currency": "XOF",
    "symbol": "CFA",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "ML-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "MO": {
    "code": "MO",
    "iso3": "MAC",
    "name": "Macao",
    "flag": "🇲🇴",
    "currency": "MOP",
    "symbol": "MOP$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "MO-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "MR": {
    "code": "MR",
    "iso3": "MRT",
    "name": "Mauritania",
    "flag": "🇲🇷",
    "currency": "MRU",
    "symbol": "UM",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "MR-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "MW": {
    "code": "MW",
    "iso3": "MWI",
    "name": "Malawi",
    "flag": "🇲🇼",
    "currency": "MWK",
    "symbol": "MK",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "MW-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "NA": {
    "code": "NA",
    "iso3": "NAM",
    "name": "Namibia",
    "flag": "🇳🇦",
    "currency": "NAD",
    "symbol": "N$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "NA-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "NC": {
    "code": "NC",
    "iso3": "NCL",
    "name": "New Caledonia",
    "flag": "🇳🇨",
    "currency": "XPF",
    "symbol": "₣",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "NC-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "NE": {
    "code": "NE",
    "iso3": "NER",
    "name": "Niger",
    "flag": "🇳🇪",
    "currency": "XOF",
    "symbol": "CFA",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "NE-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "NR": {
    "code": "NR",
    "iso3": "NRU",
    "name": "Nauru",
    "flag": "🇳🇷",
    "currency": "AUD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "NR-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "PF": {
    "code": "PF",
    "iso3": "PYF",
    "name": "French Polynesia",
    "flag": "🇵🇫",
    "currency": "XPF",
    "symbol": "₣",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "PF-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "PR": {
    "code": "PR",
    "iso3": "PRI",
    "name": "Puerto Rico",
    "flag": "🇵🇷",
    "currency": "USD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "PR-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "PW": {
    "code": "PW",
    "iso3": "PLW",
    "name": "Palau",
    "flag": "🇵🇼",
    "currency": "USD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "PW-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "SB": {
    "code": "SB",
    "iso3": "SLB",
    "name": "Solomon Islands",
    "flag": "🇸🇧",
    "currency": "SBD",
    "symbol": "SI$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "SB-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "SC": {
    "code": "SC",
    "iso3": "SYC",
    "name": "Seychelles",
    "flag": "🇸🇨",
    "currency": "SCR",
    "symbol": "SR",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "SC-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "SD": {
    "code": "SD",
    "iso3": "SDN",
    "name": "Sudan",
    "flag": "🇸🇩",
    "currency": "SDG",
    "symbol": "SD",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "SD-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "SL": {
    "code": "SL",
    "iso3": "SLE",
    "name": "Sierra Leone",
    "flag": "🇸🇱",
    "currency": "SLE",
    "symbol": "Le",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "SL-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "SO": {
    "code": "SO",
    "iso3": "SOM",
    "name": "Somalia",
    "flag": "🇸🇴",
    "currency": "SOS",
    "symbol": "Sh",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "SO-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "SR": {
    "code": "SR",
    "iso3": "SUR",
    "name": "Suriname",
    "flag": "🇸🇷",
    "currency": "SRD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "SR-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "SS": {
    "code": "SS",
    "iso3": "SSD",
    "name": "South Sudan",
    "flag": "🇸🇸",
    "currency": "SSP",
    "symbol": "£",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "SS-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "ST": {
    "code": "ST",
    "iso3": "STP",
    "name": "Sao Tome and Principe",
    "flag": "🇸🇹",
    "currency": "STN",
    "symbol": "Db",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "ST-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "SY": {
    "code": "SY",
    "iso3": "SYR",
    "name": "Syria",
    "flag": "🇸🇾",
    "currency": "SYP",
    "symbol": "£S",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "SY-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "SZ": {
    "code": "SZ",
    "iso3": "SWZ",
    "name": "Eswatini",
    "flag": "🇸🇿",
    "currency": "SZL",
    "symbol": "E",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "SZ-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "TC": {
    "code": "TC",
    "iso3": "TCA",
    "name": "Turks and Caicos Islands",
    "flag": "🇹🇨",
    "currency": "USD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "TC-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "TD": {
    "code": "TD",
    "iso3": "TCD",
    "name": "Chad",
    "flag": "🇹🇩",
    "currency": "XAF",
    "symbol": "FCFA",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "TD-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "TG": {
    "code": "TG",
    "iso3": "TGO",
    "name": "Togo",
    "flag": "🇹🇬",
    "currency": "XOF",
    "symbol": "CFA",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "TG-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "TJ": {
    "code": "TJ",
    "iso3": "TJK",
    "name": "Tajikistan",
    "flag": "🇹🇯",
    "currency": "TJS",
    "symbol": "SM",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "TJ-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "TL": {
    "code": "TL",
    "iso3": "TLS",
    "name": "Timor-Leste",
    "flag": "🇹🇱",
    "currency": "USD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "TL-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "TM": {
    "code": "TM",
    "iso3": "TKM",
    "name": "Turkmenistan",
    "flag": "🇹🇲",
    "currency": "TMT",
    "symbol": "T",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "TM-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "TO": {
    "code": "TO",
    "iso3": "TON",
    "name": "Tonga",
    "flag": "🇹🇴",
    "currency": "TOP",
    "symbol": "T$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "TO-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "TV": {
    "code": "TV",
    "iso3": "TUV",
    "name": "Tuvalu",
    "flag": "🇹🇻",
    "currency": "AUD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "TV-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "VA": {
    "code": "VA",
    "iso3": "VAT",
    "name": "Vatican City",
    "flag": "🇻🇦",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "VA-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "VC": {
    "code": "VC",
    "iso3": "VCT",
    "name": "Saint Vincent and the Grenadines",
    "flag": "🇻🇨",
    "currency": "XCD",
    "symbol": "EC$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "VC-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "VG": {
    "code": "VG",
    "iso3": "VGB",
    "name": "British Virgin Islands",
    "flag": "🇻🇬",
    "currency": "USD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "VG-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "VI": {
    "code": "VI",
    "iso3": "VIR",
    "name": "U.S. Virgin Islands",
    "flag": "🇻🇮",
    "currency": "USD",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "VI-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "VU": {
    "code": "VU",
    "iso3": "VUT",
    "name": "Vanuatu",
    "flag": "🇻🇺",
    "currency": "VUV",
    "symbol": "VT",
    "decimals": 0,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "VU-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "WS": {
    "code": "WS",
    "iso3": "WSM",
    "name": "Samoa",
    "flag": "🇼🇸",
    "currency": "WST",
    "symbol": "WS$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "WS-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "YE": {
    "code": "YE",
    "iso3": "YEM",
    "name": "Yemen",
    "flag": "🇾🇪",
    "currency": "YER",
    "symbol": "﷼",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "YE-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "ZM": {
    "code": "ZM",
    "iso3": "ZMB",
    "name": "Zambia",
    "flag": "🇿🇲",
    "currency": "ZMW",
    "symbol": "K",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "ZM-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "ZW": {
    "code": "ZW",
    "iso3": "ZWE",
    "name": "Zimbabwe",
    "flag": "🇿🇼",
    "currency": "ZWG",
    "symbol": "$",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "ZW-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "PS": {
    "code": "PS",
    "iso3": "PSE",
    "name": "Palestine",
    "flag": "🇵🇸",
    "currency": "ILS",
    "symbol": "₪",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "PS-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  },
  "XK": {
    "code": "XK",
    "iso3": "XKX",
    "name": "Kosovo",
    "flag": "🇽🇰",
    "currency": "EUR",
    "symbol": "€",
    "decimals": 2,
    "status": "CUSTOM_ESTIMATE",
    "statusLabel": "Custom Estimate",
    "freshness": "CURRENT",
    "defaultTaxYear": "Current",
    "supportedTaxYears": [
      "Current"
    ],
    "hasRegions": false,
    "rulesetId": "XK-ESTIMATE-2026.1",
    "ruleVersion": "Custom Estimate (User Defined)",
    "lastVerifiedDate": "Flexible",
    "sourceAuthority": "User Defined / Benchmark Estimate",
    "sources": [
      {
        "authority": "User Configuration",
        "title": "User-Defined Benchmark Estimation Model",
        "url": "#",
        "sourceType": "STATUTORY_INSTITUTION",
        "publicationDate": "2026-01-01",
        "effectiveDate": "2026-01-01",
        "lastVerifiedDate": "2026-01-01"
      }
    ],
    "calculationScope": "Illustrative custom estimate based on user-defined effective tax, employee social contribution, and employer payroll cost rates. Not a statutory payroll calculation.",
    "knownExclusions": [
      "Statutory local progressive tax brackets",
      "Mandatory employer and employee social insurance ceilings",
      "Statutory tax allowances and credits"
    ],
    "disclaimerNote": "Illustrative custom estimate based on user-entered assumptions. Not a statutory payroll calculation.",
    "popular": false
  }
};
// Attach regions references to countries
GLOBAL_COUNTRIES['US'].regions = US_STATES;
GLOBAL_COUNTRIES['CA'].regions = CA_PROVINCES;
GLOBAL_COUNTRIES['GB'].regions = UK_REGIONS;
GLOBAL_COUNTRIES['DE'].regions = DE_STATES;
GLOBAL_COUNTRIES['CH'].regions = CH_CANTONS;
GLOBAL_COUNTRIES['ES'].regions = ES_COMMUNITIES;
GLOBAL_COUNTRIES['IT'].regions = IT_REGIONS;

export type PayFrequency = 'annual' | 'monthly' | 'semimonthly' | 'biweekly' | 'weekly' | 'daily' | 'hourly';
export type EmploymentType = 'salaried' | 'hourly' | 'contractor' | 'director';
export type UsFilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh';
export type GermanTaxClass = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
export type IndiaTaxRegime = 'new' | 'old';
export type SingaporeResidency = 'citizen' | 'pr' | 'foreigner';
export type GulfResidency = 'expat' | 'national';

export interface EarningsState {
  baseSalary: number;
  bonus: number;
  commission: number;
  overtime: number;
  allowances: number;
  taxableBenefits: number;
  nonTaxableBenefits: number;
  otherIncome: number;
}

export interface DeductionsState {
  retirementPreTax: number;
  retirementPreTaxType: 'percent' | 'fixed';
  healthInsurancePreTax: number;
  hsaFsaPreTax: number;
  otherPreTax: number;
  unionDuesPostTax: number;
  postTaxInsurance: number;
  loanRepaymentPostTax: number;
  otherPostTax: number;
}

export interface EmployerSettingsState {
  enabled: boolean;
  pensionMatchPercent: number;
  healthBenefitMonthly: number;
  otherBenefitsMonthly: number;
  payrollTaxOverridePercent: number | null;
}

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
  baseTax?: number;
}

export interface TaxBracketAudit {
  bracketIndex: number;
  min: number;
  max: number | null;
  taxableAmountInBracket: number;
  rate: number;
  taxForBracket: number;
  cumulativeTax: number;
}

export interface CalculationResult {
  // Jurisdiction & Currency Context
  countryCode: string;
  countryName: string;
  currency: string;
  currencySymbol: string;
  currencyDecimals: number;
  taxYear: string;
  payFrequency: PayFrequency;
  periodCount: number;
  status: CalculationStatus;
  statusLabel: string;

  // Annual Compensation Ledger
  annualBaseSalary: number;
  annualTaxableBonus: number;
  annualCommission: number;
  annualOvertime: number;
  annualTaxableAllowances: number;
  annualTaxableBenefits: number;
  annualOtherTaxable: number;
  annualNonTaxableBenefits: number;
  annualGrossCompensation: number;
  annualGrossTaxable: number;

  annualPreTaxDeductions: number;
  annualStandardDeduction: number;
  annualTaxableIncome: number;

  annualIncomeTax: number;
  annualEmployeeSocialContributions: number;
  annualStateTax: number;
  annualPostTaxDeductions: number;
  annualTotalEmployeeDeductions: number;

  annualNetTakeHome: number;

  // Period Reconciliation
  periodGross: number;
  periodTaxableIncome: number;
  periodIncomeTax: number;
  periodSocialContributions: number;
  periodPreTaxDeductions: number;
  periodPostTaxDeductions: number;
  periodNetTakeHome: number;

  // Monthly Reconciliation
  monthlyGross: number;
  monthlyIncomeTax: number;
  monthlySocialContributions: number;
  monthlyPreTaxDeductions: number;
  monthlyPostTaxDeductions: number;
  monthlyNetTakeHome: number;

  // Rates & Metrics
  effectiveTaxRate: number;
  socialContributionRate: number;
  totalDeductionRate: number;
  netTakeHomeRate: number;
  marginalTaxRate: number;

  // Progressive Trace
  bracketAudits: TaxBracketAudit[];

  // Employer Cost
  annualEmployerSocialContributions: number;
  annualEmployerBenefits: number;
  annualTotalEmployerCost: number;
  periodEmployerCost: number;
  monthlyEmployerCost: number;
  employeeToEmployerRatio: number;

  // Metadata & Trust Provenance
  rulesetId: string;
  calculationStatus: CalculationStatus;
  freshness: CalculationFreshness;
  rulesetMaturity: RulesetMaturity;
  calculationScope: string;
  knownExclusions: string[];
  ruleVersion: string;
  sourceAuthority: string;
  disclaimerNote: string;
}

export interface ReverseSalaryGoalResult {
  targetNet: number;
  targetFrequency: 'monthly' | 'annual';
  requiredGrossAnnual: number;
  requiredGrossMonthly: number;
  resultingNetAnnual: number;
  resultingNetMonthly: number;
  estimatedTaxAnnual: number;
  estimatedContributionsAnnual: number;
  effectiveTaxRate: number;
  iterations: number;
  converged: boolean;
  discrepancy: number;
}

export const FREQUENCY_FACTORS: Record<PayFrequency, { periodsPerYear: number; label: string; short: string }> = {
  annual: { periodsPerYear: 1, label: 'Annual (Yearly)', short: 'yr' },
  monthly: { periodsPerYear: 12, label: 'Monthly (12 paychecks)', short: 'mo' },
  semimonthly: { periodsPerYear: 24, label: 'Semi-Monthly (24 paychecks, 1st & 15th)', short: 'semi-mo' },
  biweekly: { periodsPerYear: 26, label: 'Bi-Weekly (26 paychecks, every 2 weeks)', short: 'bi-wk' },
  weekly: { periodsPerYear: 52, label: 'Weekly (52 paychecks)', short: 'wk' },
  daily: { periodsPerYear: 260, label: 'Daily (260 working days)', short: 'day' },
  hourly: { periodsPerYear: 2080, label: 'Hourly (2,080 working hours)', short: 'hr' },
};

/* =========================================================================
   2. DETERMINISTIC FORMATTERS (ZERO HYDRATION MISMATCH & MONEY FORENSICS)
   ========================================================================= */

export function parseNumericInput(raw: string | number): number {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? Math.max(0, raw) : 0;
  }
  if (!raw || typeof raw !== 'string') return 0;
  const trimmed = raw.trim();
  if (trimmed.startsWith('-') || trimmed.startsWith('(') || trimmed.includes(' -')) {
    return 0;
  }
  const cleaned = trimmed.replace(/[^\d.]/g, '').trim();
  if (!cleaned) return 0;
  const parts = cleaned.split('.');
  const sanitized = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : parts[0];
  const parsed = parseFloat(sanitized);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return 0;
  return Math.max(0, parsed);
}

export function formatCurrency(
  amount: number,
  currencyCode = 'USD',
  symbolOverride?: string,
  decimals = 2,
  includeSymbol = true
): string {
  if (!Number.isFinite(amount)) return '—';
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const fixed = absVal.toFixed(decimals);
  const parts = fixed.split('.');
  const integerFormatted = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formattedNumber = parts.length > 1 && decimals > 0 ? `${integerFormatted}.${parts[1]}` : integerFormatted;
  const sign = isNegative ? '-' : '';

  if (!includeSymbol) return `${sign}${formattedNumber}`;

  const cMeta = GLOBAL_COUNTRIES[currencyCode];
  const symbol = symbolOverride || cMeta?.symbol || currencyCode;

  // Single-character symbols ($, £, €, ¥, ₨, ₹) use minimal spacing, multi-character use space
  const spacing = symbol.length > 1 ? ' ' : '';
  return `${sign}${symbol}${spacing}${formattedNumber}`;
}

export function formatPercent(rate: number, decimals = 2): string {
  if (!Number.isFinite(rate)) return '0.00%';
  return `${rate.toFixed(decimals)}%`;
}

/* =========================================================================
   3. PROGRESSIVE TAX CALCULATION ENGINES
   ========================================================================= */

export function calculateProgressiveTax(
  taxableIncome: number,
  brackets: TaxBracket[]
): { totalTax: number; audits: TaxBracketAudit[]; marginalRate: number } {
  if (!Number.isFinite(taxableIncome) || taxableIncome <= 0 || brackets.length === 0) {
    return { totalTax: 0, audits: [], marginalRate: 0 };
  }

  let totalTax = 0;
  let marginalRate = 0;
  const audits: TaxBracketAudit[] = [];

  for (let i = 0; i < brackets.length; i++) {
    const b = brackets[i];
    if (taxableIncome > b.min) {
      const ceiling = b.max !== null ? b.max : Infinity;
      const taxableInBracket = Math.min(taxableIncome, ceiling) - b.min;
      const taxForBracket = taxableInBracket * b.rate;
      totalTax += taxForBracket;
      marginalRate = b.rate * 100;

      audits.push({
        bracketIndex: i + 1,
        min: b.min,
        max: b.max,
        taxableAmountInBracket: taxableInBracket,
        rate: b.rate * 100,
        taxForBracket,
        cumulativeTax: totalTax,
      });
    } else {
      audits.push({
        bracketIndex: i + 1,
        min: b.min,
        max: b.max,
        taxableAmountInBracket: 0,
        rate: b.rate * 100,
        taxForBracket: 0,
        cumulativeTax: totalTax,
      });
    }
  }

  return { totalTax, audits, marginalRate };
}

// 1. Pakistan Salaried Slabs (FBR Finance Act 2026 / 2025 / 2024)
export function calculatePakistanTax(
  taxableIncomeAnnual: number,
  taxYear = '2026-2027'
): {
  incomeTax: number;
  surcharge: number;
  employeeEobi: number;
  employerEobi: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  let pkBrackets: TaxBracket[];
  let surchargeRate = 0;

  if (taxYear === '2026-2027') {
    // Finance Act 2026 (Tax Year 2027 — Effective 1 July 2026)
    pkBrackets = [
      { min: 0, max: 600000, rate: 0.0, baseTax: 0 },
      { min: 600000, max: 1200000, rate: 0.01, baseTax: 0 },
      { min: 1200000, max: 2200000, rate: 0.11, baseTax: 6000 },
      { min: 2200000, max: 3200000, rate: 0.20, baseTax: 116000 },
      { min: 3200000, max: 4100000, rate: 0.25, baseTax: 316000 },
      { min: 4100000, max: 5600000, rate: 0.29, baseTax: 541000 },
      { min: 5600000, max: 7000000, rate: 0.32, baseTax: 976000 },
      { min: 7000000, max: null, rate: 0.35, baseTax: 1424000 },
    ];
    surchargeRate = 0;
  } else if (taxYear === '2025-2026') {
    // Finance Act 2025 (Tax Year 2026)
    pkBrackets = [
      { min: 0, max: 600000, rate: 0.0, baseTax: 0 },
      { min: 600000, max: 1200000, rate: 0.01, baseTax: 0 },
      { min: 1200000, max: 2200000, rate: 0.11, baseTax: 6000 },
      { min: 2200000, max: 3200000, rate: 0.23, baseTax: 116000 },
      { min: 3200000, max: 4100000, rate: 0.30, baseTax: 346000 },
      { min: 4100000, max: null, rate: 0.35, baseTax: 616000 },
    ];
    surchargeRate = 0.09;
  } else {
    // Finance Act 2024 (Tax Year 2025)
    pkBrackets = [
      { min: 0, max: 600000, rate: 0.0, baseTax: 0 },
      { min: 600000, max: 1200000, rate: 0.05, baseTax: 0 },
      { min: 1200000, max: 2200000, rate: 0.15, baseTax: 30000 },
      { min: 2200000, max: 3200000, rate: 0.25, baseTax: 180000 },
      { min: 3200000, max: 4100000, rate: 0.30, baseTax: 430000 },
      { min: 4100000, max: null, rate: 0.35, baseTax: 700000 },
    ];
    surchargeRate = 0.10;
  }

  const { totalTax: baseTax, audits, marginalRate } = calculateProgressiveTax(taxableIncomeAnnual, pkBrackets);

  let incomeTax = baseTax;
  let surcharge = 0;
  if (taxableIncomeAnnual > 10000000 && surchargeRate > 0) {
    surcharge = baseTax * surchargeRate;
    incomeTax += surcharge;
  }

  // Statutory minimum wage basis: PKR 37,000/month.
  // Employee EOBI: 1% of minimum wage = PKR 370/month = PKR 4,440/year (capped at actual income if income < min wage, 0 if 0).
  // Employer EOBI: 5% of minimum wage = PKR 1,850/month = PKR 22,200/year (0 if 0).
  const employeeEobi = taxableIncomeAnnual > 0 ? Math.min(taxableIncomeAnnual, 370 * 12) : 0;
  const employerEobi = taxableIncomeAnnual > 0 ? 1850 * 12 : 0;

  return {
    incomeTax,
    surcharge,
    employeeEobi,
    employerEobi,
    audits,
    marginalRate: taxableIncomeAnnual > 10000000 && surchargeRate > 0 ? marginalRate * (1 + surchargeRate) : marginalRate,
  };
}

// 2. United States Federal + FICA + State Selection (2025 / 2026)
export function calculateUsTax(
  taxableIncomeAnnual: number,
  grossCompensationAnnual: number,
  filingStatus: UsFilingStatus,
  stateCode = 'TX',
  taxYear = '2026'
): {
  federalIncomeTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  stateIncomeTax: number;
  employerFica: number;
  standardDeduction: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  // Year-discriminated standard deductions and brackets
  // 2026: IRS Rev. Proc. 2025-32 (inflation-adjusted + OBBBA provisions)
  // 2025: IRS Rev. Proc. 2024-40
  const is2026Us = taxYear === '2026';

  const standardDeductions: Record<UsFilingStatus, number> = is2026Us
    ? { single: 16100, mfj: 32200, mfs: 16100, hoh: 24150 }  // Rev. Proc. 2025-32
    : { single: 15000, mfj: 30000, mfs: 15000, hoh: 22500 };  // Rev. Proc. 2024-40
  const standardDeduction = standardDeductions[filingStatus];

  let brackets: TaxBracket[];
  if (filingStatus === 'mfj') {
    brackets = is2026Us
      ? [
          // 2026 MFJ — Rev. Proc. 2025-32
          { min: 0, max: 24800, rate: 0.10, baseTax: 0 },
          { min: 24800, max: 100800, rate: 0.12, baseTax: 2480 },
          { min: 100800, max: 211400, rate: 0.22, baseTax: 11600 },
          { min: 211400, max: 403550, rate: 0.24, baseTax: 35932 },
          { min: 403550, max: 512450, rate: 0.32, baseTax: 82048 },
          { min: 512450, max: 768700, rate: 0.35, baseTax: 116896 },
          { min: 768700, max: null, rate: 0.37, baseTax: 206583.5 },
        ]
      : [
          // 2025 MFJ — Rev. Proc. 2024-40
          { min: 0, max: 23850, rate: 0.10, baseTax: 0 },
          { min: 23850, max: 96950, rate: 0.12, baseTax: 2385 },
          { min: 96950, max: 206700, rate: 0.22, baseTax: 11157 },
          { min: 206700, max: 394600, rate: 0.24, baseTax: 35302 },
          { min: 394600, max: 501050, rate: 0.32, baseTax: 80398 },
          { min: 501050, max: 751600, rate: 0.35, baseTax: 114462 },
          { min: 751600, max: null, rate: 0.37, baseTax: 202154.5 },
        ];
  } else if (filingStatus === 'hoh') {
    brackets = is2026Us
      ? [
          // 2026 HOH — Rev. Proc. 2025-32
          { min: 0, max: 17700, rate: 0.10, baseTax: 0 },
          { min: 17700, max: 67450, rate: 0.12, baseTax: 1770 },
          { min: 67450, max: 105700, rate: 0.22, baseTax: 7740 },
          { min: 105700, max: 201775, rate: 0.24, baseTax: 16155 },
          { min: 201775, max: 256225, rate: 0.32, baseTax: 39213 },
          { min: 256225, max: 640600, rate: 0.35, baseTax: 56637 },
          { min: 640600, max: null, rate: 0.37, baseTax: 191168.25 },
        ]
      : [
          // 2025 HOH — Rev. Proc. 2024-40
          { min: 0, max: 17000, rate: 0.10, baseTax: 0 },
          { min: 17000, max: 64850, rate: 0.12, baseTax: 1700 },
          { min: 64850, max: 103350, rate: 0.22, baseTax: 7442 },
          { min: 103350, max: 197300, rate: 0.24, baseTax: 15912 },
          { min: 197300, max: 250500, rate: 0.32, baseTax: 38460 },
          { min: 250500, max: 626350, rate: 0.35, baseTax: 55484 },
          { min: 626350, max: null, rate: 0.37, baseTax: 187031.5 },
        ];
  } else {
    // Single and MFS use same brackets
    brackets = is2026Us
      ? [
          // 2026 Single/MFS — Rev. Proc. 2025-32
          { min: 0, max: 12400, rate: 0.10, baseTax: 0 },
          { min: 12400, max: 50400, rate: 0.12, baseTax: 1240 },
          { min: 50400, max: 105700, rate: 0.22, baseTax: 5800 },
          { min: 105700, max: 201775, rate: 0.24, baseTax: 17966 },
          { min: 201775, max: 256225, rate: 0.32, baseTax: 41024 },
          { min: 256225, max: 640600, rate: 0.35, baseTax: 58448 },
          { min: 640600, max: null, rate: 0.37, baseTax: 192979.25 },
        ]
      : [
          // 2025 Single/MFS — Rev. Proc. 2024-40
          { min: 0, max: 11925, rate: 0.10, baseTax: 0 },
          { min: 11925, max: 48475, rate: 0.12, baseTax: 1192.5 },
          { min: 48475, max: 103350, rate: 0.22, baseTax: 5578.5 },
          { min: 103350, max: 197300, rate: 0.24, baseTax: 17651 },
          { min: 197300, max: 250525, rate: 0.32, baseTax: 40199 },
          { min: 250525, max: 626350, rate: 0.35, baseTax: 57231 },
          { min: 626350, max: null, rate: 0.37, baseTax: 188769.75 },
        ];
  }

  const incomeAfterStdDeduction = Math.max(0, taxableIncomeAnnual - standardDeduction);
  const { totalTax: federalIncomeTax, audits, marginalRate } = calculateProgressiveTax(incomeAfterStdDeduction, brackets);

  // FICA Social Security: 6.2% up to $184,500 (2026 SSA statutory wage base; $176,100 in 2025)
  // Source: SSA Notice of Wage Base and Benefit Rates (announced Oct 2025, effective Jan 1 2026)
  const ssWageCap = taxYear === '2025' ? 176100 : 184500;
  const ssTaxableWages = Math.min(grossCompensationAnnual, ssWageCap);
  const socialSecurityTax = ssTaxableWages * 0.062;

  // FICA Medicare: 1.45% uncapped + 0.9% additional over $200k (Single) / $250k (MFJ)
  const additionalMedicareThreshold = filingStatus === 'mfj' ? 250000 : 200000;
  let medicareTax = grossCompensationAnnual * 0.0145;
  if (grossCompensationAnnual > additionalMedicareThreshold) {
    medicareTax += (grossCompensationAnnual - additionalMedicareThreshold) * 0.009;
  }

  // State Tax: Supports progressive CA and NY, statutory flat rates, and 0% states
  let stateIncomeTax = 0;
  if (stateCode === 'CA') {
    const caStdDed = filingStatus === 'mfj' ? 11080 : 5540;
    const caTaxable = Math.max(0, taxableIncomeAnnual - caStdDed);
    const caBrackets: TaxBracket[] = filingStatus === 'mfj'
      ? [
          { min: 0, max: 21512, rate: 0.01, baseTax: 0 },
          { min: 21512, max: 50998, rate: 0.02, baseTax: 215.12 },
          { min: 50998, max: 80490, rate: 0.04, baseTax: 804.84 },
          { min: 80490, max: 111732, rate: 0.06, baseTax: 1984.52 },
          { min: 111732, max: 141212, rate: 0.08, baseTax: 3859.04 },
          { min: 141212, max: 721318, rate: 0.093, baseTax: 6217.44 },
          { min: 721318, max: 865574, rate: 0.103, baseTax: 60167.3 },
          { min: 865574, max: 1442628, rate: 0.113, baseTax: 75025.66 },
          { min: 1442628, max: 2000000, rate: 0.123, baseTax: 140232.76 },
          { min: 2000000, max: null, rate: 0.133, baseTax: 208789.52 },
        ]
      : [
          { min: 0, max: 10756, rate: 0.01, baseTax: 0 },
          { min: 10756, max: 25499, rate: 0.02, baseTax: 107.56 },
          { min: 25499, max: 40245, rate: 0.04, baseTax: 402.42 },
          { min: 40245, max: 55866, rate: 0.06, baseTax: 992.26 },
          { min: 55866, max: 70606, rate: 0.08, baseTax: 1929.52 },
          { min: 70606, max: 360659, rate: 0.093, baseTax: 3108.72 },
          { min: 360659, max: 432787, rate: 0.103, baseTax: 30083.65 },
          { min: 432787, max: 721314, rate: 0.113, baseTax: 37512.83 },
          { min: 721314, max: 1000000, rate: 0.123, baseTax: 70116.38 },
          { min: 1000000, max: null, rate: 0.133, baseTax: 104394.86 },
        ];
    stateIncomeTax = calculateProgressiveTax(caTaxable, caBrackets).totalTax;
  } else if (stateCode === 'NY') {
    const nyStdDed = filingStatus === 'mfj' ? 16050 : 8000;
    const nyTaxable = Math.max(0, taxableIncomeAnnual - nyStdDed);
    const nyBrackets: TaxBracket[] = filingStatus === 'mfj'
      ? [
          { min: 0, max: 17150, rate: 0.04, baseTax: 0 },
          { min: 17150, max: 23600, rate: 0.045, baseTax: 686 },
          { min: 23600, max: 27900, rate: 0.0525, baseTax: 976.25 },
          { min: 27900, max: 161550, rate: 0.055, baseTax: 1202 },
          { min: 161550, max: 323200, rate: 0.06, baseTax: 8552.75 },
          { min: 323200, max: 2155350, rate: 0.0685, baseTax: 18251.75 },
          { min: 2155350, max: 5000000, rate: 0.0965, baseTax: 143754.02 },
          { min: 5000000, max: null, rate: 0.109, baseTax: 418262.89 },
        ]
      : [
          { min: 0, max: 8500, rate: 0.04, baseTax: 0 },
          { min: 8500, max: 11700, rate: 0.045, baseTax: 340 },
          { min: 11700, max: 13900, rate: 0.0525, baseTax: 484 },
          { min: 13900, max: 80650, rate: 0.055, baseTax: 599.5 },
          { min: 80650, max: 215400, rate: 0.06, baseTax: 4270.75 },
          { min: 215400, max: 1077550, rate: 0.0685, baseTax: 12355.75 },
          { min: 1077550, max: 5000000, rate: 0.0965, baseTax: 71418.03 },
          { min: 5000000, max: null, rate: 0.109, baseTax: 449934.45 },
        ];
    stateIncomeTax = calculateProgressiveTax(nyTaxable, nyBrackets).totalTax;
  } else {
    const stateMeta = US_STATES.find((s) => s.code === stateCode);
    if (stateMeta && stateMeta.taxRatePercent) {
      stateIncomeTax = incomeAfterStdDeduction * (stateMeta.taxRatePercent / 100);
    }
  }

  const employerFica = ssTaxableWages * 0.062 + grossCompensationAnnual * 0.0145;

  return {
    federalIncomeTax,
    socialSecurityTax,
    medicareTax,
    stateIncomeTax,
    employerFica,
    standardDeduction,
    audits,
    marginalRate,
  };
}

// 3. United Kingdom PAYE & National Insurance (2024–2026)
export function calculateUkTax(grossTaxableAnnual: number, region = 'EWNI', taxYear = '2026-2027'): {
  incomeTax: number;
  nationalInsurance: number;
  employerNi: number;
  personalAllowance: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  let personalAllowance = 12570;
  if (grossTaxableAnnual > 100000) {
    const excess = grossTaxableAnnual - 100000;
    personalAllowance = Math.max(0, 12570 - excess / 2);
  }

  const taxableIncome = Math.max(0, grossTaxableAnnual - personalAllowance);

  let ukBrackets: TaxBracket[];
  if (region === 'SCT') {
    // Scottish Devolved Tax Bands
    ukBrackets = [
      { min: 0, max: 2306, rate: 0.19, baseTax: 0 },
      { min: 2306, max: 13991, rate: 0.20, baseTax: 438.14 },
      { min: 13991, max: 31092, rate: 0.21, baseTax: 2775.14 },
      { min: 31092, max: 62430, rate: 0.42, baseTax: 6366.35 },
      { min: 62430, max: Math.max(62430, 125140 - personalAllowance), rate: 0.45, baseTax: 19527.91 },
      { min: Math.max(62430, 125140 - personalAllowance), max: null, rate: 0.48, baseTax: 47747.41 },
    ];
  } else {
    // England, Wales, NI standard bands
    ukBrackets = [
      { min: 0, max: 37700, rate: 0.20, baseTax: 0 },
      { min: 37700, max: Math.max(37700, 125140 - personalAllowance), rate: 0.40, baseTax: 7540 },
      { min: Math.max(37700, 125140 - personalAllowance), max: null, rate: 0.45, baseTax: 42516 },
    ];
  }

  const { totalTax: incomeTax, audits, marginalRate } = calculateProgressiveTax(taxableIncome, ukBrackets);

  // Employee Class 1 NI (8% £12,570–£50,270 annual PT→UEL, 2% above UEL)
  // Annual Primary Threshold (PT): £12,570 — frozen for 2024-25, 2025-26, 2026-27 (HMRC)
  // Annual Upper Earnings Limit (UEL): £50,270 — frozen for the same period
  let nationalInsurance = 0;
  if (grossTaxableAnnual > 12570) {
    const mainBand = Math.min(grossTaxableAnnual, 50270) - 12570;
    nationalInsurance += mainBand * 0.08;
    if (grossTaxableAnnual > 50270) {
      nationalInsurance += (grossTaxableAnnual - 50270) * 0.02;
    }
  }

  // Employer NI: For 2025–26 and 2026–27 (Autumn Budget 2024), 15.0% above £5,000. For historical 2024–25, 13.8% above £9,100.
  const isHistoricalPre2025 = taxYear === '2024-2025';
  const employerNiThreshold = isHistoricalPre2025 ? 9100 : 5000;
  const employerNiRate = isHistoricalPre2025 ? 0.138 : 0.15;
  const employerNi = grossTaxableAnnual > employerNiThreshold ? (grossTaxableAnnual - employerNiThreshold) * employerNiRate : 0;

  return {
    incomeTax,
    nationalInsurance,
    employerNi,
    personalAllowance,
    audits,
    marginalRate,
  };
}

// 4. Germany BMF EStG & Social Insurance (2025)
export function calculateGermanyTax(
  grossTaxableAnnual: number,
  taxClass: GermanTaxClass = 'I',
  churchTaxOpted = false,
  stateCode = 'NW',
  taxYear = '2026'
): {
  incomeTax: number;
  solidaritySurcharge: number;
  churchTax: number;
  socialSecurity: number;
  employerSocialSecurity: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  // Grundfreibetrag: €12,348 for 2026 (€12,096 for 2025)
  const grundfreibetrag = taxYear === '2025' ? 12096 : 12348;
  let basicAllowance = grundfreibetrag;
  if (taxClass === 'III') basicAllowance = grundfreibetrag * 2;
  if (taxClass === 'II') basicAllowance = grundfreibetrag + 4260;
  if (taxClass === 'VI') basicAllowance = 0;

  const taxableIncome = Math.max(0, grossTaxableAnnual - basicAllowance);

  // German EStG Progressive Brackets
  const deBrackets: TaxBracket[] = [
    { min: 0, max: 5221, rate: 0.14, baseTax: 0 },
    { min: 5221, max: 54976, rate: 0.24, baseTax: 730.94 },
    { min: 54976, max: 266041, rate: 0.42, baseTax: 12672.14 },
    { min: 266041, max: null, rate: 0.45, baseTax: 101319.44 },
  ];

  const { totalTax: incomeTax, audits, marginalRate } = calculateProgressiveTax(taxableIncome, deBrackets);

  let solidaritySurcharge = 0;
  if (incomeTax > 18130) {
    solidaritySurcharge = incomeTax * 0.055;
  }

  // Conditional Church Tax: 8% in Bayern and Baden-Württemberg, 9% in other 14 states, 0% if non-member
  const churchTaxRate = (stateCode === 'BY' || stateCode === 'BW') ? 0.08 : 0.09;
  const churchTax = churchTaxOpted ? incomeTax * churchTaxRate : 0;

  // Statutory social insurance contribution ceilings (BMAS Sozialversicherungs-Rechengrößenverordnung)
  // 2026: RV/AV €101,400 (€8,450/mo), KV/PV €69,750 (€5,812.50/mo)
  // 2025: RV/AV €96,600 (€8,050/mo), KV/PV €66,150 (€5,512.50/mo)
  const is2025De = taxYear === '2025';
  const bbgRv = is2025De ? 96600 : 101400; // Renten- & Arbeitslosenversicherung
  const bbgKv = is2025De ? 66150 : 69750;  // Kranken- & Pflegeversicherung

  const rvBase = Math.min(grossTaxableAnnual, bbgRv);
  const kvBase = Math.min(grossTaxableAnnual, bbgKv);

  const empRv = rvBase * 0.093;
  const empAv = rvBase * 0.013;
  const empKv = kvBase * 0.090;
  const empPv = kvBase * 0.022;
  const socialSecurity = empRv + empAv + empKv + empPv;

  const employerSocialSecurity = rvBase * 0.093 + rvBase * 0.013 + kvBase * 0.073 + kvBase * 0.022;

  return {
    incomeTax,
    solidaritySurcharge,
    churchTax,
    socialSecurity,
    employerSocialSecurity,
    audits,
    marginalRate,
  };
}

// 5. India New Tax Regime (Section 115BAC)
// AY 2026-27: Finance Act 2025 (Budget 2025) — revised 7-slab structure, Section 87A rebate up to ₹12L
// AY 2025-26: Finance (No. 2) Act 2024 — 6-slab structure, Section 87A rebate up to ₹7L
export function calculateIndiaTax(
  grossTaxableAnnual: number,
  regime: IndiaTaxRegime = 'new',
  taxYear = 'FY 2025-2026 (AY 2026-2027)'
): {
  incomeTax: number;
  cess: number;
  totalTax: number;
  standardDeduction: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  // Standard deduction: ₹75,000 for new regime (both AYs); ₹50,000 for old regime
  const standardDeduction = regime === 'new' ? 75000 : 50000;
  const taxableIncome = Math.max(0, grossTaxableAnnual - standardDeduction);

  const isAY2627 = taxYear === 'FY 2025-2026 (AY 2026-2027)';

  let indiaBrackets: TaxBracket[];
  if (regime === 'new') {
    if (isAY2627) {
      // Finance Act 2025 (Budget 2025) — New Tax Regime slabs effective AY 2026-27
      // Source: Ministry of Finance, Union Budget 2025, Section 115BAC
      indiaBrackets = [
        { min: 0, max: 400000, rate: 0.0, baseTax: 0 },
        { min: 400000, max: 800000, rate: 0.05, baseTax: 0 },
        { min: 800000, max: 1200000, rate: 0.10, baseTax: 20000 },
        { min: 1200000, max: 1600000, rate: 0.15, baseTax: 60000 },
        { min: 1600000, max: 2000000, rate: 0.20, baseTax: 120000 },
        { min: 2000000, max: 2400000, rate: 0.25, baseTax: 200000 },
        { min: 2400000, max: null, rate: 0.30, baseTax: 300000 },
      ];
    } else {
      // Finance (No. 2) Act 2024 (Budget 2024) — New Tax Regime slabs effective AY 2025-26
      indiaBrackets = [
        { min: 0, max: 300000, rate: 0.0, baseTax: 0 },
        { min: 300000, max: 700000, rate: 0.05, baseTax: 0 },
        { min: 700000, max: 1000000, rate: 0.10, baseTax: 20000 },
        { min: 1000000, max: 1200000, rate: 0.15, baseTax: 50000 },
        { min: 1200000, max: 1500000, rate: 0.20, baseTax: 80000 },
        { min: 1500000, max: null, rate: 0.30, baseTax: 140000 },
      ];
    }
  } else {
    // Old Regime: unchanged for both AY 2025-26 and AY 2026-27 (no change in Budget 2025)
    indiaBrackets = [
      { min: 0, max: 250000, rate: 0.0, baseTax: 0 },
      { min: 250000, max: 500000, rate: 0.05, baseTax: 0 },
      { min: 500000, max: 1000000, rate: 0.20, baseTax: 12500 },
      { min: 1000000, max: null, rate: 0.30, baseTax: 112500 },
    ];
  }

  const taxCalc = calculateProgressiveTax(taxableIncome, indiaBrackets);
  let baseTax = taxCalc.totalTax;
  const { audits, marginalRate } = taxCalc;

  // Section 87A Rebate & Marginal Relief:
  // AY 2026-27 New Regime: full rebate for taxable income ≤ ₹12,00,000 (Finance Act 2025).
  // Marginal relief: For income exceeding ₹12,00,000, tax payable shall not exceed the amount by which total income exceeds ₹12,00,000 (Section 87A proviso).
  // AY 2025-26 New Regime: full rebate for taxable income ≤ ₹7,00,000; marginal relief caps tax at excess over ₹7,00,000.
  // Old Regime (both AYs): full rebate for taxable income ≤ ₹5,00,000.
  if (regime === 'new') {
    const rebateThreshold = isAY2627 ? 1200000 : 700000;
    if (taxableIncome <= rebateThreshold) {
      baseTax = 0;
    } else {
      const excessIncome = taxableIncome - rebateThreshold;
      if (baseTax > excessIncome) {
        baseTax = excessIncome; // Section 87A Marginal Relief
      }
    }
  } else if (regime === 'old' && taxableIncome <= 500000) {
    baseTax = 0;
  }

  const cess = baseTax * 0.04;
  const totalTax = baseTax + cess;

  return {
    incomeTax: baseTax,
    cess,
    totalTax,
    standardDeduction,
    audits,
    marginalRate: marginalRate * 1.04,
  };
}

// 6. Canada Federal & Statutory Deductions (2025 / 2026)
// Sources: CRA T4032 Payroll Deductions Tables; CPP/EI Contribution Notices (canada.ca);
//          Federal Budget 2025 (14% bottom bracket for 2026 full year)
export function calculateCanadaTax(grossTaxableAnnual: number, provinceCode = 'ON', taxYear = '2026'): {
  federalTax: number;
  provincialTax: number;
  cpp: number;
  ei: number;
  employerCpp: number;
  employerEi: number;
  basicPersonalAmount: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  const is2026 = taxYear === '2026';

  // BPA: $16,452 (2026, indexed 2.0%); $15,705 (2025 CRA T4032)
  // Bottom bracket rate: 14% (2026 — reduced under 2025 legislation); 15% (2025)
  const basicPersonalAmount = is2026 ? 16452 : 15705;
  const bottomRate = is2026 ? 0.14 : 0.15;

  const caBrackets: TaxBracket[] = is2026
    ? [
        // 2026 federal brackets — indexed 2.0% per CRA; bottom rate 14% for full year
        { min: 0, max: 58523, rate: 0.14, baseTax: 0 },
        { min: 58523, max: 117045, rate: 0.205, baseTax: 8193.22 },
        { min: 117045, max: 181440, rate: 0.26, baseTax: 20190.23 },
        { min: 181440, max: 258482, rate: 0.29, baseTax: 36932.93 },
        { min: 258482, max: null, rate: 0.33, baseTax: 59275.11 },
      ]
    : [
        // 2025 federal brackets — CRA T4032 Payroll Deductions Tables
        { min: 0, max: 55867, rate: 0.15, baseTax: 0 },
        { min: 55867, max: 111733, rate: 0.205, baseTax: 8380.05 },
        { min: 111733, max: 173205, rate: 0.26, baseTax: 19832.58 },
        { min: 173205, max: 246752, rate: 0.29, baseTax: 35815.3 },
        { min: 246752, max: null, rate: 0.33, baseTax: 57143.93 },
      ];

  const { totalTax: grossTax, audits, marginalRate } = calculateProgressiveTax(grossTaxableAnnual, caBrackets);
  // BPA credit rate = bottom bracket rate (non-refundable federal tax credit)
  const bpaCredit = basicPersonalAmount * bottomRate;
  const federalTax = Math.max(0, grossTax - bpaCredit);

  // CPP1 (Canada Pension Plan — First Additional Contribution)
  // 2026: YMPE $74,600 | Exemption $3,500 | Rate 5.95% | Max contribution $4,230.45 (each side)
  // 2025: YMPE $71,300 | Exemption $3,500 | Rate 5.95%
  const ympe = is2026 ? 74600 : 71300;
  let cpp = 0;
  if (grossTaxableAnnual > 3500) {
    cpp = (Math.min(grossTaxableAnnual, ympe) - 3500) * 0.0595;
  }

  // Employment Insurance (EI)
  // 2026: MIE $68,900 | Employee rate 1.63% | Max employee $1,123.07 | Employer 2.282% (1.4×)
  // 2025: MIE $65,700 | Employee rate 1.64% | Employer 2.296% (1.4×)
  const eiMie = is2026 ? 68900 : 65700;
  const eiRate = is2026 ? 0.0163 : 0.0164;
  const ei = Math.min(grossTaxableAnnual, eiMie) * eiRate;

  // Employer: CPP = same as employee; EI = 1.4× employee (statutory employer multiplier)
  const employerCpp = cpp;
  const employerEi = ei * 1.4;

  const provMeta = CA_PROVINCES.find((p) => p.code === provinceCode);
  const provRate = provMeta?.taxRatePercent ? provMeta.taxRatePercent / 100 : 0.0505;
  const provincialTax = Math.max(0, grossTaxableAnnual - 11000) * provRate;

  return {
    federalTax,
    provincialTax,
    cpp,
    ei,
    employerCpp,
    employerEi,
    basicPersonalAmount,
    audits,
    marginalRate,
  };
}

// 7. Australia Individual Income Tax + LITO + Medicare (FY 2025-26 and 2026-27)
// Sources: ATO — Individual Income Tax Rates; Treasury Laws Amendment Act 2024 (Stage 3 revised)
//          ATO — Low Income Tax Offset (LITO); ATO — Medicare Levy
export function calculateAustraliaTax(grossTaxableAnnual: number, taxYear = '2026-2027'): {
  incomeTax: number;
  lito: number;
  medicareLevy: number;
  employerSuperannuation: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  // 2026-27: second bracket REDUCED to 15% (legislated, effective 1 July 2026)
  // 2025-26 and earlier: 16% second bracket (Stage 3 revised, effective 1 July 2024)
  // 2027-28 onwards: further reduction to 14% (already legislated)
  const is202627 = taxYear === '2026-2027';
  const secondRate = is202627 ? 0.15 : 0.16;
  const baseTaxAt45k = is202627 ? 4020 : 4288;  // secondRate × (45,000 - 18,200)
  const baseTaxAt135k = baseTaxAt45k + 27000;    // + 30% × (135,000 - 45,000)
  const baseTaxAt190k = baseTaxAt135k + 20350;   // + 37% × (190,000 - 135,000)

  const auBrackets: TaxBracket[] = [
    { min: 0, max: 18200, rate: 0.0, baseTax: 0 },
    { min: 18200, max: 45000, rate: secondRate, baseTax: 0 },
    { min: 45000, max: 135000, rate: 0.30, baseTax: baseTaxAt45k },
    { min: 135000, max: 190000, rate: 0.37, baseTax: baseTaxAt135k },
    { min: 190000, max: null, rate: 0.45, baseTax: baseTaxAt190k },
  ];

  const { totalTax: incomeTaxBeforeLito, audits, marginalRate } = calculateProgressiveTax(grossTaxableAnnual, auBrackets);

  // Low Income Tax Offset (LITO) — non-refundable, ATO 2025-26 and 2026-27
  // Maximum: $700 for taxable income ≤ $37,500
  // Phase-out 1: $0.05 per $1 over $37,500 (down to $325 at $45,000)
  // Phase-out 2: $0.015 per $1 over $45,000 (reaches $0 at ~$66,667)
  let lito = 0;
  if (grossTaxableAnnual <= 37500) {
    lito = 700;
  } else if (grossTaxableAnnual <= 45000) {
    lito = Math.max(0, 700 - 0.05 * (grossTaxableAnnual - 37500));
  } else if (grossTaxableAnnual < 66667) {
    lito = Math.max(0, 325 - 0.015 * (grossTaxableAnnual - 45000));
  }
  const incomeTax = Math.max(0, incomeTaxBeforeLito - lito);

  // Medicare Levy: 2.0% (simplified — actual has low-income reduction threshold ~$26,000)
  const medicareLevy = grossTaxableAnnual > 26000 ? grossTaxableAnnual * 0.02 : 0;

  // Employer Superannuation Guarantee: 12.0% of OTE — employer cost, NOT an employee deduction
  const employerSuperannuation = grossTaxableAnnual * 0.12;

  return {
    incomeTax,
    lito,
    medicareLevy,
    employerSuperannuation,
    audits,
    marginalRate: marginalRate + (grossTaxableAnnual > 26000 ? 2.0 : 0),
  };
}

// 8. Singapore IRAS Progressive Tiers & CPF (YA 2025)
export function calculateSingaporeTax(grossTaxableAnnual: number, residency: SingaporeResidency = 'citizen', taxYear = 'YA 2026'): {
  incomeTax: number;
  employeeCpf: number;
  employerCpf: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  const sgBrackets: TaxBracket[] = [
    { min: 0, max: 20000, rate: 0.0, baseTax: 0 },
    { min: 20000, max: 30000, rate: 0.02, baseTax: 0 },
    { min: 30000, max: 40000, rate: 0.035, baseTax: 200 },
    { min: 40000, max: 80000, rate: 0.07, baseTax: 550 },
    { min: 80000, max: 120000, rate: 0.115, baseTax: 3350 },
    { min: 120000, max: 160000, rate: 0.15, baseTax: 7950 },
    { min: 160000, max: 200000, rate: 0.18, baseTax: 13950 },
    { min: 200000, max: 240000, rate: 0.19, baseTax: 21150 },
    { min: 240000, max: 280000, rate: 0.195, baseTax: 28750 },
    { min: 280000, max: 320000, rate: 0.20, baseTax: 36550 },
    { min: 320000, max: 500000, rate: 0.22, baseTax: 44550 },
    { min: 500000, max: 1000000, rate: 0.23, baseTax: 84150 },
    { min: 1000000, max: null, rate: 0.24, baseTax: 199150 },
  ];

  const { totalTax: residentTax, audits, marginalRate } = calculateProgressiveTax(grossTaxableAnnual, sgBrackets);
  let incomeTax = residentTax;

  // Non-residents (foreigners) are taxed at higher of flat 15% or progressive resident rates per IRAS
  if (residency === 'foreigner') {
    const flat15 = grossTaxableAnnual * 0.15;
    if (flat15 > incomeTax) {
      incomeTax = flat15;
    }
  }

  let employeeCpf = 0;
  let employerCpf = 0;
  if (residency !== 'foreigner') {
    // CPF Ordinary Wage ceiling: $8,000/mo ($96,000/yr) for 2026 / YA 2026 ($7,400/mo = $88,800/yr in 2025)
    const annualCpfCeiling = taxYear === 'YA 2025' ? 88800 : 96000;
    const cappedWages = Math.min(grossTaxableAnnual, annualCpfCeiling);
    employeeCpf = cappedWages * 0.20;
    employerCpf = cappedWages * 0.17;
  }

  return {
    incomeTax,
    employeeCpf,
    employerCpf,
    audits,
    marginalRate,
  };
}

// 8b. UAE GPSSA & Gratuity Model
export function calculateUaeTax(
  annualGross: number,
  residency: 'national' | 'expatriate' = 'expatriate',
  _taxYear = '2026'
): {
  incomeTax: number;
  employeeSocial: number;
  employerSocial: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  void _taxYear;
  let employeeSocial = 0;
  let employerSocial = 0;
  if (residency === 'national') {
    const gpssaBase = Math.min(annualGross, 600000);
    employeeSocial = gpssaBase * 0.05;
    employerSocial = gpssaBase * 0.125;
  } else {
    employeeSocial = 0;
    employerSocial = annualGross * 0.0575;
  }
  return {
    incomeTax: 0,
    employeeSocial,
    employerSocial,
    audits: [{ bracketIndex: 1, min: 0, max: null, taxableAmountInBracket: annualGross, rate: 0, taxForBracket: 0, cumulativeTax: 0 }],
    marginalRate: 0,
  };
}

// 8c. Saudi Arabia GOSI Model
export function calculateSaudiTax(
  annualGross: number,
  residency: 'national' | 'expatriate' = 'expatriate',
  _taxYear = '2026'
): {
  incomeTax: number;
  employeeSocial: number;
  employerSocial: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  void _taxYear;
  let employeeSocial = 0;
  let employerSocial = 0;
  if (residency === 'national') {
    const gosiBase = Math.min(annualGross, 540000);
    employeeSocial = gosiBase * 0.0975;
    employerSocial = gosiBase * 0.1175;
  } else {
    const hazardBase = Math.min(annualGross, 540000);
    employeeSocial = 0;
    employerSocial = hazardBase * 0.02;
  }
  return {
    incomeTax: 0,
    employeeSocial,
    employerSocial,
    audits: [{ bracketIndex: 1, min: 0, max: null, taxableAmountInBracket: annualGross, rate: 0, taxForBracket: 0, cumulativeTax: 0 }],
    marginalRate: 0,
  };
}

// 9. France DGFiP Barème (2024–2025)
export function calculateFranceTax(grossTaxableAnnual: number): {
  incomeTax: number;
  socialContributions: number;
  employerContributions: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  const fraisPro = Math.min(14171, Math.max(495, grossTaxableAnnual * 0.10));
  const taxableNet = Math.max(0, grossTaxableAnnual - fraisPro);

  const frBrackets: TaxBracket[] = [
    { min: 0, max: 11294, rate: 0.0, baseTax: 0 },
    { min: 11294, max: 28797, rate: 0.11, baseTax: 0 },
    { min: 28797, max: 82341, rate: 0.30, baseTax: 1925.33 },
    { min: 82341, max: 177106, rate: 0.41, baseTax: 17988.53 },
    { min: 177106, max: null, rate: 0.45, baseTax: 56842.18 },
  ];

  const { totalTax: incomeTax, audits, marginalRate } = calculateProgressiveTax(taxableNet, frBrackets);
  const socialContributions = grossTaxableAnnual * 0.21;
  const employerContributions = grossTaxableAnnual * 0.30;

  return {
    incomeTax,
    socialContributions,
    employerContributions,
    audits,
    marginalRate,
  };
}

// 10. Japan NTA National Tax & Social Insurance (2024–2025)
export function calculateJapanTax(grossTaxableAnnual: number): {
  incomeTax: number;
  socialInsurance: number;
  employerSocialInsurance: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  let deduction = 550000;
  if (grossTaxableAnnual > 8500000) deduction = 1950000;
  else if (grossTaxableAnnual > 3600000) deduction = grossTaxableAnnual * 0.20 + 440000;
  else if (grossTaxableAnnual > 1800000) deduction = grossTaxableAnnual * 0.30 + 80000;

  const taxableIncome = Math.max(0, grossTaxableAnnual - deduction);

  const jpBrackets: TaxBracket[] = [
    { min: 0, max: 1950000, rate: 0.05, baseTax: 0 },
    { min: 1950000, max: 3300000, rate: 0.10, baseTax: 97500 },
    { min: 3300000, max: 6950000, rate: 0.20, baseTax: 232500 },
    { min: 6950000, max: 9000000, rate: 0.23, baseTax: 962500 },
    { min: 9000000, max: 18000000, rate: 0.33, baseTax: 1434000 },
    { min: 18000000, max: 40000000, rate: 0.40, baseTax: 4404000 },
    { min: 40000000, max: null, rate: 0.45, baseTax: 13204000 },
  ];

  const { totalTax: incomeTax, audits, marginalRate } = calculateProgressiveTax(taxableIncome, jpBrackets);
  const socialInsurance = grossTaxableAnnual * 0.15;
  const employerSocialInsurance = grossTaxableAnnual * 0.15;

  return {
    incomeTax,
    socialInsurance,
    employerSocialInsurance,
    audits,
    marginalRate,
  };
}

// 11. Switzerland (CH) — ESTV Direct Federal Tax (Art. 36 DBG) + Cantonal Benchmark + 1st/2nd Pillar
export function calculateSwitzerlandTax(
  grossTaxableAnnual: number,
  canton = 'ZH',
  _taxYear = '2026'
): {
  federalTax: number;
  cantonalTax: number;
  employeeSocial: number;
  employerSocial: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  void _taxYear;
  if (grossTaxableAnnual <= 0) {
    return {
      federalTax: 0,
      cantonalTax: 0,
      employeeSocial: 0,
      employerSocial: 0,
      audits: [],
      marginalRate: 0,
    };
  }
  // Art. 36 para. 1 DBG Federal Direct Tax tariffs for single taxpayers
  const chFederalBrackets: TaxBracket[] = [
    { min: 0, max: 14500, rate: 0.0, baseTax: 0 },
    { min: 14500, max: 31600, rate: 0.0077, baseTax: 0 },
    { min: 31600, max: 41400, rate: 0.0088, baseTax: 131.67 },
    { min: 41400, max: 55200, rate: 0.0264, baseTax: 217.91 },
    { min: 55200, max: 72500, rate: 0.0297, baseTax: 582.23 },
    { min: 72500, max: 78100, rate: 0.0594, baseTax: 1096.04 },
    { min: 78100, max: 103600, rate: 0.066, baseTax: 1428.68 },
    { min: 103600, max: 134600, rate: 0.088, baseTax: 3111.68 },
    { min: 134600, max: 176000, rate: 0.11, baseTax: 5839.68 },
    { min: 176000, max: 755200, rate: 0.132, baseTax: 10393.68 },
    { min: 755200, max: null, rate: 0.115, baseTax: 86848.08 },
  ];

  const { totalTax: rawFedTax, audits, marginalRate } = calculateProgressiveTax(grossTaxableAnnual, chFederalBrackets);
  // Statutory maximum constitutional ceiling on Direct Federal Tax (Art. 36 para. 1 lit. k DBG: max 11.5%)
  const federalTax = Math.min(rawFedTax, grossTaxableAnnual * 0.115);

  // Cantonal & Municipal Tax Benchmark (after CHF 10,000 standard personal/employment deduction)
  const cantonalRates: Record<string, number> = {
    ZH: 0.135,
    BE: 0.185,
    LU: 0.115,
    ZG: 0.065,
    BS: 0.17,
    GE: 0.19,
    VD: 0.18,
  };
  const cantonalRate = cantonalRates[canton] ?? 0.135;
  const cantonalTaxable = Math.max(0, grossTaxableAnnual - 10000);
  const cantonalTax = cantonalTaxable * cantonalRate;

  // Social Security:
  // 1st Pillar (AHV/IV/EO): 5.30% employee, 5.30% employer (uncapped)
  const ahvEmployee = grossTaxableAnnual * 0.053;
  const ahvEmployer = grossTaxableAnnual * 0.053;

  // ALV (Unemployment Insurance): 1.10% capped at CHF 148,200
  const alvLiableWage = Math.min(grossTaxableAnnual, 148200);
  const alvEmployee = alvLiableWage * 0.011;
  const alvEmployer = alvLiableWage * 0.011;

  // 2nd Pillar (BVG / Occupational Pension): Entry threshold CHF 22,680; max coordinated CHF 62,475
  let bvgEmployee = 0;
  let bvgEmployer = 0;
  if (grossTaxableAnnual >= 22680) {
    const coordinatedWage = Math.min(Math.max(3675, grossTaxableAnnual - 25725), 62475);
    bvgEmployee = coordinatedWage * 0.0425;
    bvgEmployer = coordinatedWage * 0.0425;
  }

  // Accident Insurance (UVG): Non-occupational NBU (1.0% employee) + Occupational BU (1.6% employer) capped at CHF 148,200
  const uvgLiableWage = Math.min(grossTaxableAnnual, 148200);
  const uvgEmployee = uvgLiableWage * 0.01;
  const uvgEmployer = uvgLiableWage * 0.016;

  // Family Allowances (FAK): ~1.4% employer uncapped
  const fakEmployer = grossTaxableAnnual * 0.014;

  const employeeSocial = ahvEmployee + alvEmployee + bvgEmployee + uvgEmployee;
  const employerSocial = ahvEmployer + alvEmployer + bvgEmployer + uvgEmployer + fakEmployer;

  return {
    federalTax,
    cantonalTax,
    employeeSocial,
    employerSocial,
    audits,
    marginalRate: marginalRate + cantonalRate * 100,
  };
}

// 12. Netherlands (NL) — Belastingdienst Box 1 (Belastingplan 2025/2026) + AHK & Arbeidskorting
export function calculateNetherlandsTax(
  grossTaxableAnnual: number,
  ruling30 = false,
  _taxYear = '2026'
): {
  incomeTax: number;
  employeeSocial: number;
  employerSocial: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  void _taxYear;
  // If 30% facility is granted, 30% of salary is tax-free allowance
  const taxableWage = ruling30 ? grossTaxableAnnual * 0.7 : grossTaxableAnnual;

  // Belastingdienst Box 1 Brackets (2025/2026 Belastingplan)
  const nlBox1Brackets: TaxBracket[] = [
    { min: 0, max: 38441, rate: 0.3582, baseTax: 0 },
    { min: 38441, max: 77654, rate: 0.3748, baseTax: 13769.57 },
    { min: 77654, max: null, rate: 0.495, baseTax: 28468.41 },
  ];

  const { totalTax: grossBox1Tax, audits, marginalRate } = calculateProgressiveTax(taxableWage, nlBox1Brackets);

  // Algemene Heffingskorting (General Tax Credit — AHK): max €3,068, phase-out rate 6.337% above €28,406
  const ahk = Math.max(0, 3068 - Math.max(0, taxableWage - 28406) * 0.06337);

  // Arbeidskorting (Labour Tax Credit):
  let arbeidskorting = 0;
  if (taxableWage <= 11490) {
    arbeidskorting = taxableWage * 0.08425;
  } else if (taxableWage <= 24820) {
    arbeidskorting = 968 + (taxableWage - 11490) * 0.31433;
  } else if (taxableWage <= 39957) {
    arbeidskorting = 5158 + (taxableWage - 24820) * 0.02471;
  } else {
    arbeidskorting = Math.max(0, 5532 - (taxableWage - 39957) * 0.0651);
  }

  const totalCredits = Math.min(grossBox1Tax, ahk + arbeidskorting);
  const incomeTax = Math.max(0, grossBox1Tax - totalCredits);

  // In the Netherlands, employee national insurances (AOW, Anw, Wlz) are statutory integrated into Box 1.
  const employeeSocial = 0;

  // Employer Social Insurance (Premies werknemersverzekeringen & Zvw ~16.63% capped at €75,860 max wage base)
  const employerSocial = Math.min(grossTaxableAnnual, 75860) * 0.1663;

  return {
    incomeTax,
    employeeSocial,
    employerSocial,
    audits,
    marginalRate,
  };
}

// 13. Ireland (IE) — Revenue Commissioners PAYE Income Tax, USC & PRSI Class A (Budget 2025/2026)
export function calculateIrelandTax(
  grossTaxableAnnual: number,
  _taxYear = '2026'
): {
  incomeTax: number;
  usc: number;
  prsi: number;
  employeeSocial: number;
  employerPrsi: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  void _taxYear;
  // PAYE: SRCOP €44,000 for single individual (20% standard, 40% higher)
  const iePayeBrackets: TaxBracket[] = [
    { min: 0, max: 44000, rate: 0.2, baseTax: 0 },
    { min: 44000, max: null, rate: 0.4, baseTax: 8800 },
  ];
  const { totalTax: grossPayeTax, audits, marginalRate } = calculateProgressiveTax(grossTaxableAnnual, iePayeBrackets);

  // Statutory Non-Refundable Tax Credits: Single Person (€2,000) + Employee PAYE Credit (€2,000) = €4,000
  const totalTaxCredits = 4000;
  const incomeTax = Math.max(0, grossPayeTax - totalTaxCredits);

  // Universal Social Charge (USC): Exempt if income <= €13,000
  let usc = 0;
  if (grossTaxableAnnual > 13000) {
    const uscBrackets: TaxBracket[] = [
      { min: 0, max: 12012, rate: 0.005, baseTax: 0 },
      { min: 12012, max: 27382, rate: 0.02, baseTax: 60.06 },
      { min: 27382, max: 70044, rate: 0.03, baseTax: 367.46 },
      { min: 70044, max: null, rate: 0.08, baseTax: 1647.32 },
    ];
    const uscRes = calculateProgressiveTax(grossTaxableAnnual, uscBrackets);
    usc = uscRes.totalTax;
  }

  // PRSI Class A Employee: 4.10% on earnings over €352/wk (€18,304/yr)
  const weeklyWage = grossTaxableAnnual / 52;
  let prsi = 0;
  if (weeklyWage > 352) {
    const rawPrsi = grossTaxableAnnual * 0.041;
    if (weeklyWage <= 424) {
      // Tapered PRSI credit: max €12/wk reduced by 1/6th of earnings above €352
      const weeklyCredit = Math.max(0, 12 - (weeklyWage - 352) / 6);
      const annualCredit = weeklyCredit * 52;
      prsi = Math.max(0, rawPrsi - annualCredit);
    } else {
      prsi = rawPrsi;
    }
  }

  // Employer PRSI Class A: 8.90% if <= €496/wk (€25,792/yr), else 11.15% uncapped
  const employerPrsi = weeklyWage <= 496 ? grossTaxableAnnual * 0.089 : grossTaxableAnnual * 0.1115;

  return {
    incomeTax,
    usc,
    prsi,
    employeeSocial: usc + prsi,
    employerPrsi,
    audits,
    marginalRate,
  };
}

// 14. New Zealand (NZ) — Inland Revenue PAYE (Budget 2024 Thresholds) + ACC Earner Levy & KiwiSaver
export function calculateNewZealandTax(
  grossTaxableAnnual: number,
  kiwisaverRate = 0.03,
  taxYear = '2026-2027'
): {
  incomeTax: number;
  accLevy: number;
  kiwisaverEmployee: number;
  kiwisaverEmployer: number;
  employeeSocial: number;
  employerSocial: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  // Budget 2024 enacted PAYE progressive brackets (effective 31 July 2024 onwards)
  const nzPayeBrackets: TaxBracket[] = [
    { min: 0, max: 15600, rate: 0.105, baseTax: 0 },
    { min: 15600, max: 53500, rate: 0.175, baseTax: 1638 },
    { min: 53500, max: 78100, rate: 0.3, baseTax: 8270.5 },
    { min: 78100, max: 180000, rate: 0.33, baseTax: 15650.5 },
    { min: 180000, max: null, rate: 0.39, baseTax: 49277.5 },
  ];

  const { totalTax: incomeTax, audits, marginalRate } = calculateProgressiveTax(grossTaxableAnnual, nzPayeBrackets);

  // ACC Earners' Levy:
  // 2026/27 (from 1 April 2026): 1.75% capped at $156,641
  // 2025/26 (from 1 April 2025): 1.67% capped at $152,790
  // 2024/25: 1.60% capped at $142,283
  let accRate = 0.0175;
  let accCap = 156641;
  if (taxYear === '2025-2026') {
    accRate = 0.0167;
    accCap = 152790;
  } else if (taxYear === '2024-2025') {
    accRate = 0.0160;
    accCap = 142283;
  }
  const accLiableWage = Math.min(grossTaxableAnnual, accCap);
  const accLevy = accLiableWage * accRate;

  // KiwiSaver Contribution: default 3% optional/statutory scheme
  const kiwisaverEmployee = grossTaxableAnnual * Math.max(0, kiwisaverRate);
  const kiwisaverEmployer = kiwisaverRate > 0 ? grossTaxableAnnual * 0.03 : 0;

  const employeeSocial = accLevy + kiwisaverEmployee;
  const employerSocial = kiwisaverEmployer;

  return {
    incomeTax,
    accLevy,
    kiwisaverEmployee,
    kiwisaverEmployer,
    employeeSocial,
    employerSocial,
    audits,
    marginalRate,
  };
}

// 15. Spain (ES) — Agencia Tributaria IRPF (Escala Estatal y Autonómica) + Seguridad Social
export function calculateSpainTax(
  grossTaxableAnnual: number,
  community = 'MD',
  _taxYear = '2026'
): {
  incomeTax: number;
  employeeSocial: number;
  employerSocial: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  void _taxYear;
  // Seguridad Social Régimen General: Base máxima €58,950/yr (€4,912.50/mo)
  const baseCotizacion = Math.min(58950, Math.max(0, grossTaxableAnnual));
  const employeeSocial = baseCotizacion * 0.065; // 4.70% comunes + 1.55% desempleo + 0.10% FP + 0.15% MEI
  const employerSocial = baseCotizacion * 0.319; // ~31.90% total patronal

  // Rendimiento Neto del Trabajo = Gross - Employee SS
  const rendimientoNeto = Math.max(0, grossTaxableAnnual - employeeSocial);
  // Gastos generales de difícil justificación (Art. 19.2.f LIRPF): €2,000 flat deduction
  const baseLiquidable = Math.max(0, rendimientoNeto - 2000);

  // Escala Estatal (State Scale)
  const esStateBrackets: TaxBracket[] = [
    { min: 0, max: 12450, rate: 0.095, baseTax: 0 },
    { min: 12450, max: 20200, rate: 0.12, baseTax: 1182.75 },
    { min: 20200, max: 35200, rate: 0.15, baseTax: 2112.75 },
    { min: 35200, max: 60000, rate: 0.185, baseTax: 4362.75 },
    { min: 60000, max: 300000, rate: 0.225, baseTax: 8950.75 },
    { min: 300000, max: null, rate: 0.245, baseTax: 62950.75 },
  ];

  // Escala Autonómica (Regional Scale)
  const esRegionalBracketsMadrid: TaxBracket[] = [
    { min: 0, max: 12960.45, rate: 0.085, baseTax: 0 },
    { min: 12960.45, max: 18561.45, rate: 0.107, baseTax: 1101.64 },
    { min: 18561.45, max: 34789.26, rate: 0.128, baseTax: 1700.95 },
    { min: 34789.26, max: 56931.42, rate: 0.174, baseTax: 3778.11 },
    { min: 56931.42, max: null, rate: 0.205, baseTax: 7630.85 },
  ];

  const regionalBrackets = community === 'MD' ? esRegionalBracketsMadrid : esStateBrackets;

  const stateRes = calculateProgressiveTax(baseLiquidable, esStateBrackets);
  const regionalRes = calculateProgressiveTax(baseLiquidable, regionalBrackets);

  // Mínimo personal y familiar: €5,550 base tax credit
  const stateCredit = calculateProgressiveTax(5550, esStateBrackets).totalTax;
  const regionalCredit = calculateProgressiveTax(5550, regionalBrackets).totalTax;

  const netStateTax = Math.max(0, stateRes.totalTax - stateCredit);
  const netRegionalTax = Math.max(0, regionalRes.totalTax - regionalCredit);
  const incomeTax = netStateTax + netRegionalTax;

  return {
    incomeTax,
    employeeSocial,
    employerSocial,
    audits: stateRes.audits,
    marginalRate: stateRes.marginalRate + regionalRes.marginalRate,
  };
}

// 16. Italy (IT) — Agenzia delle Entrate IRPEF a 3 Scaglioni (D.Lgs. 216/2023) + Addizionali & INPS
export function calculateItalyTax(
  grossTaxableAnnual: number,
  region = 'LOM',
  _taxYear = '2026'
): {
  incomeTax: number;
  regionalTax: number;
  employeeSocial: number;
  employerSocial: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  void _taxYear;
  // INPS Employee Contributions: 9.19% up to €55,008; 10.19% above; capped at massimale €116,366/yr
  const inpsLiableGross = Math.min(grossTaxableAnnual, 116366);
  let employeeSocial = 0;
  if (inpsLiableGross <= 55008) {
    employeeSocial = inpsLiableGross * 0.0919;
  } else {
    employeeSocial = 55008 * 0.0919 + (inpsLiableGross - 55008) * 0.1019;
  }

  // Employer INPS: ~30.0% capped at massimale €116,366
  const employerSocial = inpsLiableGross * 0.3;

  // INPS is fully tax-deductible from gross income to determine IRPEF taxable base
  const taxableBase = Math.max(0, grossTaxableAnnual - employeeSocial);

  // IRPEF 3 Scaglioni (D.Lgs. 216/2023)
  const itIrpefBrackets: TaxBracket[] = [
    { min: 0, max: 28000, rate: 0.23, baseTax: 0 },
    { min: 28000, max: 50000, rate: 0.35, baseTax: 6440 },
    { min: 50000, max: null, rate: 0.43, baseTax: 14140 },
  ];

  const { totalTax: grossIrpef, audits, marginalRate } = calculateProgressiveTax(taxableBase, itIrpefBrackets);

  // Detrazione da lavoro dipendente (Art. 13 TUIR)
  let detrazione = 0;
  if (taxableBase > 0) {
    if (taxableBase <= 15000) {
      detrazione = 1955;
    } else if (taxableBase <= 28000) {
      detrazione = 1910 + 1190 * ((28000 - taxableBase) / 13000);
    } else if (taxableBase <= 50000) {
      detrazione = 1910 * ((50000 - taxableBase) / 22000);
    }
  }

  const incomeTax = Math.max(0, grossIrpef - detrazione);

  // Addizionale Regionale e Comunale
  const regionalSurtaxRates: Record<string, number> = {
    LOM: 0.0173,
    LAZ: 0.0333,
    PIE: 0.0332,
    VEN: 0.0123,
    GEN: 0.0173,
  };
  const regRate = regionalSurtaxRates[region] ?? 0.0173;
  const municipalRate = 0.008; // 0.8% Addizionale comunale benchmark
  const regionalTax = taxableBase * (regRate + municipalRate);

  return {
    incomeTax,
    regionalTax,
    employeeSocial,
    employerSocial,
    audits,
    marginalRate: marginalRate + (regRate + municipalRate) * 100,
  };
}

// 17. Brazil (BR) — Receita Federal IRPF Progressivo + INSS Progressivo CLT & Encargos Patronais
export function calculateBrazilTax(
  grossTaxableAnnual: number,
  taxYear = '2026'
): {
  incomeTax: number;
  employeeSocial: number;
  employerSocial: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  // CLT payroll is officially evaluated on monthly compensation
  const monthlyGross = grossTaxableAnnual / 12;

  // Tabela Progressiva INSS:
  // - 2026: Portaria Interministerial MPS/MF nº 13/2026 (teto R$ 8.475,55; faixas: R$ 1.621,00 / R$ 2.902,84 / R$ 4.354,27 / R$ 8.475,55)
  // - 2025: Portaria Interministerial MPS/MF nº 6/2025 (teto R$ 8.157,41; faixas: R$ 1.518,00 / R$ 2.793,88 / R$ 4.190,83 / R$ 8.157,41)
  // - 2024: Portaria Interministerial MPS/MF nº 2/2024 (teto R$ 7.786,02; faixas: R$ 1.412,00 / R$ 2.666,68 / R$ 4.000,03 / R$ 7.786,02)
  const is2024 = taxYear === '2024';
  const is2025 = taxYear === '2025';
  const t1 = is2024 ? 1412.0 : is2025 ? 1518.0 : 1621.0;
  const t2 = is2024 ? 2666.68 : is2025 ? 2793.88 : 2902.84;
  const t3 = is2024 ? 4000.03 : is2025 ? 4190.83 : 4354.27;
  const t4 = is2024 ? 7786.02 : is2025 ? 8157.41 : 8475.55;

  let monthlyInss = 0;
  if (monthlyGross > 0) {
    const tier1 = Math.min(monthlyGross, t1) * 0.075;
    const tier2 = Math.max(0, Math.min(monthlyGross, t2) - t1) * 0.09;
    const tier3 = Math.max(0, Math.min(monthlyGross, t3) - t2) * 0.12;
    const tier4 = Math.max(0, Math.min(monthlyGross, t4) - t3) * 0.14;
    monthlyInss = tier1 + tier2 + tier3 + tier4;
  }
  const employeeSocial = monthlyInss * 12;

  // Monthly IRPF Base: worker benefits from higher of legal INSS deduction or simplified discount R$ 564.80/mo
  const monthlyDeduction = Math.max(monthlyInss, 564.8);
  const monthlyBase = Math.max(0, monthlyGross - monthlyDeduction);

  // Tabela Progressiva Mensal IRPF (Receita Federal)
  let monthlyIrpf = 0;
  let marginalRate = 0;
  if (monthlyBase > 4664.68) {
    monthlyIrpf = monthlyBase * 0.275 - 896.0;
    marginalRate = 27.5;
  } else if (monthlyBase > 3751.05) {
    monthlyIrpf = monthlyBase * 0.225 - 662.77;
    marginalRate = 22.5;
  } else if (monthlyBase > 2826.65) {
    monthlyIrpf = monthlyBase * 0.15 - 381.44;
    marginalRate = 15.0;
  } else if (monthlyBase > 2259.2) {
    monthlyIrpf = monthlyBase * 0.075 - 169.44;
    marginalRate = 7.5;
  } else {
    monthlyIrpf = 0;
    marginalRate = 0;
  }
  monthlyIrpf = Math.max(0, monthlyIrpf);
  const incomeTax = monthlyIrpf * 12;

  // Employer Statutory Burden CLT: 35.8% (20% INSS Patronal + 5.8% Terceiros + 2% RAT + 8% FGTS)
  const employerSocial = grossTaxableAnnual * 0.358;

  const audits: TaxBracketAudit[] = [
    {
      bracketIndex: 1,
      min: 0,
      max: 2259.2 * 12,
      taxableAmountInBracket: Math.min(monthlyBase * 12, 2259.2 * 12),
      rate: 0,
      taxForBracket: 0,
      cumulativeTax: 0,
    },
    {
      bracketIndex: 2,
      min: 2259.2 * 12,
      max: null,
      taxableAmountInBracket: Math.max(0, monthlyBase * 12 - 2259.2 * 12),
      rate: marginalRate,
      taxForBracket: incomeTax,
      cumulativeTax: incomeTax,
    },
  ];

  return {
    incomeTax,
    employeeSocial,
    employerSocial,
    audits,
    marginalRate,
  };
}

// 18. Mexico (MX) — SAT Tarifa Anual ISR (Art. 152 Ley del ISR) + IMSS Cuotas Obrero-Patronales
export function calculateMexicoTax(
  grossTaxableAnnual: number,
  _taxYear = '2026'
): {
  incomeTax: number;
  employeeSocial: number;
  employerSocial: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  void _taxYear;
  // Art. 152 LISR 11-bracket annual tariff
  const mxIsrBrackets: TaxBracket[] = [
    { min: 0, max: 8952.49, rate: 0.0192, baseTax: 0 },
    { min: 8952.49, max: 75984.55, rate: 0.064, baseTax: 171.88 },
    { min: 75984.55, max: 133536.07, rate: 0.1088, baseTax: 4461.94 },
    { min: 133536.07, max: 155229.8, rate: 0.16, baseTax: 10724.55 },
    { min: 155229.8, max: 185852.57, rate: 0.1792, baseTax: 14195.54 },
    { min: 185852.57, max: 374837.88, rate: 0.2136, baseTax: 19682.13 },
    { min: 374837.88, max: 590796.0, rate: 0.2352, baseTax: 60049.4 },
    { min: 590796.0, max: 1127926.84, rate: 0.3, baseTax: 110847.14 },
    { min: 1127926.84, max: 1503902.46, rate: 0.32, baseTax: 271986.39 },
    { min: 1503902.46, max: 4511707.37, rate: 0.34, baseTax: 392298.59 },
    { min: 4511707.37, max: null, rate: 0.35, baseTax: 1414952.26 },
  ];

  const { totalTax: incomeTax, audits, marginalRate } = calculateProgressiveTax(grossTaxableAnnual, mxIsrBrackets);

  // IMSS Cuotas Obreras: ~2.75% capped at 25 UMAs daily ($1,032,400/yr)
  const imssLiableWage = Math.min(grossTaxableAnnual, 1032400);
  const employeeSocial = imssLiableWage * 0.0275;

  // Employer IMSS + Infonavit + ISN: ~25.50% capped at 25 UMAs
  const employerSocial = imssLiableWage * 0.255;

  return {
    incomeTax,
    employeeSocial,
    employerSocial,
    audits,
    marginalRate,
  };
}

// 19. South Africa (ZA) — SARS Rates for Individuals (Income Tax Act 1962) + Primary Rebate & UIF
export function calculateSouthAfricaTax(
  grossTaxableAnnual: number,
  _taxYear = '2026-2027'
): {
  incomeTax: number;
  employeeSocial: number;
  employerSocial: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  void _taxYear;
  // SARS 7 progressive brackets for individuals
  const zaPayeBrackets: TaxBracket[] = [
    { min: 0, max: 237100, rate: 0.18, baseTax: 0 },
    { min: 237100, max: 370500, rate: 0.26, baseTax: 42678 },
    { min: 370500, max: 512800, rate: 0.31, baseTax: 77362 },
    { min: 512800, max: 673000, rate: 0.36, baseTax: 121475 },
    { min: 673000, max: 857900, rate: 0.39, baseTax: 179147 },
    { min: 857900, max: 1817000, rate: 0.41, baseTax: 251258 },
    { min: 1817000, max: null, rate: 0.45, baseTax: 644489 },
  ];

  const { totalTax: grossTax, audits, marginalRate } = calculateProgressiveTax(grossTaxableAnnual, zaPayeBrackets);

  // Primary Tax Rebate: R 17,235 for taxpayers below age 65
  const primaryRebate = 17235;
  const incomeTax = Math.max(0, grossTax - primaryRebate);

  // UIF (Unemployment Insurance Fund): 1.0% employee, capped at R 17,712/mo (R 212,544/yr) = max R 2,125.44
  const uifLiableWage = Math.min(grossTaxableAnnual, 212544);
  const employeeSocial = uifLiableWage * 0.01;

  // Employer UIF (1.0% capped) + SDL (Skills Development Levy 1.0% uncapped)
  const employerUif = uifLiableWage * 0.01;
  const employerSdl = grossTaxableAnnual * 0.01;
  const employerSocial = employerUif + employerSdl;

  return {
    incomeTax,
    employeeSocial,
    employerSocial,
    audits,
    marginalRate,
  };
}

// 20. South Korea (KR) — NTS Income Tax Act (소득세법) + 4 Major Insurances (4대보험)
export function calculateSouthKoreaTax(
  grossTaxableAnnual: number,
  _taxYear = '2026'
): {
  incomeTax: number;
  localIncomeTax: number;
  employeeSocial: number;
  employerSocial: number;
  audits: TaxBracketAudit[];
  marginalRate: number;
} {
  void _taxYear;
  // Earned Income Deduction (근로소득공제 - Art. 47)
  let earnedIncomeDeduction = 0;
  if (grossTaxableAnnual <= 5000000) {
    earnedIncomeDeduction = grossTaxableAnnual * 0.7;
  } else if (grossTaxableAnnual <= 15000000) {
    earnedIncomeDeduction = 3500000 + (grossTaxableAnnual - 5000000) * 0.4;
  } else if (grossTaxableAnnual <= 45000000) {
    earnedIncomeDeduction = 7500000 + (grossTaxableAnnual - 15000000) * 0.15;
  } else if (grossTaxableAnnual <= 100000000) {
    earnedIncomeDeduction = 12000000 + (grossTaxableAnnual - 45000000) * 0.05;
  } else {
    earnedIncomeDeduction = Math.min(20000000, 14750000 + (grossTaxableAnnual - 100000000) * 0.02);
  }

  // Basic Personal Deduction (기본공제): ₩1,500,000 for single worker
  const basicDeduction = 1500000;
  const taxableIncome = Math.max(0, grossTaxableAnnual - earnedIncomeDeduction - basicDeduction);

  // 8 National Progressive Brackets (Art. 55)
  const krNationalBrackets: TaxBracket[] = [
    { min: 0, max: 14000000, rate: 0.06, baseTax: 0 },
    { min: 14000000, max: 50000000, rate: 0.15, baseTax: 840000 },
    { min: 50000000, max: 88000000, rate: 0.24, baseTax: 6240000 },
    { min: 88000000, max: 150000000, rate: 0.35, baseTax: 15360000 },
    { min: 150000000, max: 300000000, rate: 0.38, baseTax: 37060000 },
    { min: 300000000, max: 500000000, rate: 0.4, baseTax: 94060000 },
    { min: 500000000, max: 1000000000, rate: 0.42, baseTax: 174060000 },
    { min: 1000000000, max: null, rate: 0.45, baseTax: 384060000 },
  ];

  const { totalTax: rawNationalTax, audits, marginalRate } = calculateProgressiveTax(taxableIncome, krNationalBrackets);

  // Earned Income Tax Credit (근로소득세액공제 - Art. 59)
  let taxCredit = 0;
  if (rawNationalTax > 0) {
    if (rawNationalTax <= 1300000) {
      taxCredit = rawNationalTax * 0.55;
    } else {
      taxCredit = 715000 + (rawNationalTax - 1300000) * 0.3;
    }
    // Credit ceiling by gross income
    const creditCap = grossTaxableAnnual <= 33000000 ? 740000 : grossTaxableAnnual <= 70000000 ? 660000 : 500000;
    taxCredit = Math.min(taxCredit, creditCap);
  }

  const netNationalTax = Math.max(0, rawNationalTax - taxCredit);
  // Local Income Tax (지방소득세): 10% statutory surtax
  const localIncomeTax = netNationalTax * 0.1;
  const incomeTax = netNationalTax + localIncomeTax;

  // 4 Major Insurances (4대보험):
  // National Pension (국민연금): 4.5% capped at ₩74,040,000/yr (₩6,170,000/mo)
  const npsLiable = Math.min(grossTaxableAnnual, 74040000);
  const npsEmployee = npsLiable * 0.045;
  const npsEmployer = npsLiable * 0.045;

  // Health Insurance (국민건강보험): 3.545%
  const nhiEmployee = grossTaxableAnnual * 0.03545;
  const nhiEmployer = grossTaxableAnnual * 0.03545;

  // Long-Term Care (장기요양보험): 12.95% of NHI = ~0.459%
  const ltcEmployee = nhiEmployee * 0.1295;
  const ltcEmployer = nhiEmployer * 0.1295;

  // Employment Insurance (고용보험): 0.90% employee, 1.15% employer
  const eiEmployee = grossTaxableAnnual * 0.009;
  const eiEmployer = grossTaxableAnnual * 0.0115;

  const employeeSocial = npsEmployee + nhiEmployee + ltcEmployee + eiEmployee;
  const employerSocial = npsEmployer + nhiEmployer + ltcEmployer + eiEmployer;

  return {
    incomeTax,
    localIncomeTax,
    employeeSocial,
    employerSocial,
    audits,
    marginalRate: marginalRate * 1.1,
  };
}

/* =========================================================================
   4. MASTER GROSS-TO-NET CALCULATION WATERFALL
   ========================================================================= */

export function calculateSalaryTakeHome(
  countryCode: string,
  taxYear: string,
  payFrequency: PayFrequency,
  earnings: EarningsState,
  deductions: DeductionsState,
  profile: {
    region?: string;
    filingStatus?: UsFilingStatus;
    germanTaxClass?: GermanTaxClass;
    churchTax?: boolean;
    indiaRegime?: IndiaTaxRegime;
    singaporeResidency?: SingaporeResidency;
    gulfResidency?: GulfResidency;
    customTaxRate?: number;
    customSocialRate?: number;
    customEmployerRate?: number;
    nzKiwisaverRate?: number;
    nlRuling30?: boolean;
  },
  employerSettings?: EmployerSettingsState
): CalculationResult {
  const cDef = GLOBAL_COUNTRIES[countryCode] || GLOBAL_COUNTRIES['US'];
  const factor = FREQUENCY_FACTORS[payFrequency] || FREQUENCY_FACTORS.monthly;
  const periods = factor.periodsPerYear;

  // 1. Annualize Compensation
  const annualBaseSalary = Math.max(0, earnings.baseSalary * periods);
  const annualTaxableBonus = Math.max(0, earnings.bonus);
  const annualCommission = Math.max(0, earnings.commission * periods);
  const annualOvertime = Math.max(0, earnings.overtime * periods);
  const annualTaxableAllowances = Math.max(0, earnings.allowances * periods);
  const annualTaxableBenefits = Math.max(0, earnings.taxableBenefits * periods);
  const annualNonTaxableBenefits = Math.max(0, earnings.nonTaxableBenefits * periods);
  const annualOtherTaxable = Math.max(0, earnings.otherIncome * periods);

  const annualGrossTaxable =
    annualBaseSalary +
    annualTaxableBonus +
    annualCommission +
    annualOvertime +
    annualTaxableAllowances +
    annualTaxableBenefits +
    annualOtherTaxable;

  const annualGrossCompensation = annualGrossTaxable + annualNonTaxableBenefits;

  // 2. Pre-Tax Deductions
  let annualRetirementPreTax = 0;
  if (deductions.retirementPreTaxType === 'percent') {
    const pct = Math.min(100, Math.max(0, deductions.retirementPreTax));
    annualRetirementPreTax = annualBaseSalary * (pct / 100);
  } else {
    annualRetirementPreTax = Math.max(0, deductions.retirementPreTax * periods);
  }

  const annualHealthPreTax = Math.max(0, deductions.healthInsurancePreTax * periods);
  const annualHsaFsaPreTax = Math.max(0, deductions.hsaFsaPreTax * periods);
  const annualOtherPreTax = Math.max(0, deductions.otherPreTax * periods);

  const annualPreTaxDeductions =
    annualRetirementPreTax + annualHealthPreTax + annualHsaFsaPreTax + annualOtherPreTax;

  const netTaxableBeforeStandard = Math.max(0, annualGrossTaxable - annualPreTaxDeductions);

  // 3. Country-Specific Tax Execution
  let annualIncomeTax = 0;
  let annualEmployeeSocialContributions = 0;
  let annualStateTax = 0;
  let annualStandardDeduction = 0;
  let annualEmployerSocialContributions = 0;
  let bracketAudits: TaxBracketAudit[] = [];
  let marginalTaxRate = 0;

  switch (countryCode) {
    case 'PK': {
      const pk = calculatePakistanTax(netTaxableBeforeStandard, taxYear);
      annualIncomeTax = pk.incomeTax;
      annualEmployeeSocialContributions = pk.employeeEobi;
      annualEmployerSocialContributions = pk.employerEobi;
      bracketAudits = pk.audits;
      marginalTaxRate = pk.marginalRate;
      break;
    }
    case 'US': {
      const filing = profile.filingStatus || 'single';
      const st = profile.region || 'TX';
      const us = calculateUsTax(netTaxableBeforeStandard, annualGrossCompensation, filing, st, taxYear);
      annualIncomeTax = us.federalIncomeTax;
      annualEmployeeSocialContributions = us.socialSecurityTax + us.medicareTax;
      annualStateTax = us.stateIncomeTax;
      annualStandardDeduction = us.standardDeduction;
      annualEmployerSocialContributions = us.employerFica;
      bracketAudits = us.audits;
      marginalTaxRate = us.marginalRate;
      break;
    }
    case 'GB': {
      const reg = profile.region || 'EWNI';
      const uk = calculateUkTax(netTaxableBeforeStandard, reg, taxYear);
      annualIncomeTax = uk.incomeTax;
      annualEmployeeSocialContributions = uk.nationalInsurance;
      annualStandardDeduction = uk.personalAllowance;
      annualEmployerSocialContributions = uk.employerNi;
      bracketAudits = uk.audits;
      marginalTaxRate = uk.marginalRate;
      break;
    }
    case 'DE': {
      const de = calculateGermanyTax(netTaxableBeforeStandard, profile.germanTaxClass || 'I', profile.churchTax || false, profile.region || 'NW', taxYear);
      annualIncomeTax = de.incomeTax + de.solidaritySurcharge + de.churchTax;
      annualEmployeeSocialContributions = de.socialSecurity;
      annualEmployerSocialContributions = de.employerSocialSecurity;
      bracketAudits = de.audits;
      marginalTaxRate = de.marginalRate;
      break;
    }
    case 'IN': {
      const reg = profile.indiaRegime || 'new';
      const ind = calculateIndiaTax(netTaxableBeforeStandard, reg, taxYear);
      annualIncomeTax = ind.totalTax;
      annualStandardDeduction = ind.standardDeduction;
      bracketAudits = ind.audits;
      marginalTaxRate = ind.marginalRate;
      break;
    }
    case 'CA': {
      const prov = profile.region || 'ON';
      // Pass taxYear so 2025 vs 2026 constants are correctly selected
      const ca = calculateCanadaTax(netTaxableBeforeStandard, prov, taxYear);
      annualIncomeTax = ca.federalTax + ca.provincialTax;
      annualEmployeeSocialContributions = ca.cpp + ca.ei;
      annualStandardDeduction = 0; // BPA is a non-refundable federal tax credit, not a deduction
      // Employer: CPP = same as employee; EI = 1.4× employee (statutory employer multiplier)
      annualEmployerSocialContributions = ca.employerCpp + ca.employerEi;
      bracketAudits = ca.audits;
      marginalTaxRate = ca.marginalRate;
      break;
    }
    case 'AU': {
      // Pass taxYear: 2025-26 uses 16% second bracket; 2026-27 uses 15% (legislated cut)
      const au = calculateAustraliaTax(netTaxableBeforeStandard, taxYear);
      annualIncomeTax = au.incomeTax; // post-LITO income tax
      annualEmployeeSocialContributions = au.medicareLevy; // 2% Medicare Levy
      annualEmployerSocialContributions = au.employerSuperannuation; // 12% SGC — employer cost only
      bracketAudits = au.audits;
      marginalTaxRate = au.marginalRate;
      break;
    }
    case 'SG': {
      const res = profile.singaporeResidency || 'citizen';
      const sg = calculateSingaporeTax(netTaxableBeforeStandard, res, taxYear);
      annualIncomeTax = sg.incomeTax;
      annualEmployeeSocialContributions = sg.employeeCpf;
      annualEmployerSocialContributions = sg.employerCpf;
      bracketAudits = sg.audits;
      marginalTaxRate = sg.marginalRate;
      break;
    }
    case 'AE': {
      const res = profile.gulfResidency === 'national' ? 'national' : 'expatriate';
      const ae = calculateUaeTax(annualBaseSalary, res, taxYear);
      annualIncomeTax = ae.incomeTax;
      annualEmployeeSocialContributions = ae.employeeSocial;
      annualEmployerSocialContributions = ae.employerSocial;
      bracketAudits = ae.audits;
      marginalTaxRate = ae.marginalRate;
      break;
    }
    case 'SA': {
      const res = profile.gulfResidency === 'national' ? 'national' : 'expatriate';
      const sa = calculateSaudiTax(annualBaseSalary, res, taxYear);
      annualIncomeTax = sa.incomeTax;
      annualEmployeeSocialContributions = sa.employeeSocial;
      annualEmployerSocialContributions = sa.employerSocial;
      bracketAudits = sa.audits;
      marginalTaxRate = sa.marginalRate;
      break;
    }
    case 'FR': {
      const fr = calculateFranceTax(netTaxableBeforeStandard);
      annualIncomeTax = fr.incomeTax;
      annualEmployeeSocialContributions = fr.socialContributions;
      annualEmployerSocialContributions = fr.employerContributions;
      bracketAudits = fr.audits;
      marginalTaxRate = fr.marginalRate;
      break;
    }
    case 'JP': {
      const jp = calculateJapanTax(netTaxableBeforeStandard);
      annualIncomeTax = jp.incomeTax;
      annualEmployeeSocialContributions = jp.socialInsurance;
      annualEmployerSocialContributions = jp.employerSocialInsurance;
      bracketAudits = jp.audits;
      marginalTaxRate = jp.marginalRate;
      break;
    }
    case 'CH': {
      const canton = profile.region || 'ZH';
      const ch = calculateSwitzerlandTax(netTaxableBeforeStandard, canton, taxYear);
      annualIncomeTax = ch.federalTax;
      annualStateTax = ch.cantonalTax;
      annualEmployeeSocialContributions = ch.employeeSocial;
      annualEmployerSocialContributions = ch.employerSocial;
      bracketAudits = ch.audits;
      marginalTaxRate = ch.marginalRate;
      break;
    }
    case 'NL': {
      const nl = calculateNetherlandsTax(netTaxableBeforeStandard, profile.nlRuling30 ?? false, taxYear);
      annualIncomeTax = nl.incomeTax;
      annualEmployeeSocialContributions = nl.employeeSocial;
      annualEmployerSocialContributions = nl.employerSocial;
      bracketAudits = nl.audits;
      marginalTaxRate = nl.marginalRate;
      break;
    }
    case 'IE': {
      const ie = calculateIrelandTax(netTaxableBeforeStandard, taxYear);
      annualIncomeTax = ie.incomeTax;
      annualEmployeeSocialContributions = ie.employeeSocial;
      annualEmployerSocialContributions = ie.employerPrsi;
      bracketAudits = ie.audits;
      marginalTaxRate = ie.marginalRate;
      break;
    }
    case 'NZ': {
      const nz = calculateNewZealandTax(netTaxableBeforeStandard, profile.nzKiwisaverRate ?? 0.03, taxYear);
      annualIncomeTax = nz.incomeTax;
      annualEmployeeSocialContributions = nz.employeeSocial;
      annualEmployerSocialContributions = nz.employerSocial;
      bracketAudits = nz.audits;
      marginalTaxRate = nz.marginalRate;
      break;
    }
    case 'ES': {
      const comm = profile.region || 'MD';
      const es = calculateSpainTax(netTaxableBeforeStandard, comm, taxYear);
      annualIncomeTax = es.incomeTax;
      annualEmployeeSocialContributions = es.employeeSocial;
      annualEmployerSocialContributions = es.employerSocial;
      bracketAudits = es.audits;
      marginalTaxRate = es.marginalRate;
      break;
    }
    case 'IT': {
      const reg = profile.region || 'LOM';
      const it = calculateItalyTax(netTaxableBeforeStandard, reg, taxYear);
      annualIncomeTax = it.incomeTax;
      annualStateTax = it.regionalTax;
      annualEmployeeSocialContributions = it.employeeSocial;
      annualEmployerSocialContributions = it.employerSocial;
      bracketAudits = it.audits;
      marginalTaxRate = it.marginalRate;
      break;
    }
    case 'BR': {
      const br = calculateBrazilTax(netTaxableBeforeStandard, taxYear);
      annualIncomeTax = br.incomeTax;
      annualEmployeeSocialContributions = br.employeeSocial;
      annualEmployerSocialContributions = br.employerSocial;
      bracketAudits = br.audits;
      marginalTaxRate = br.marginalRate;
      break;
    }
    case 'MX': {
      const mx = calculateMexicoTax(netTaxableBeforeStandard, taxYear);
      annualIncomeTax = mx.incomeTax;
      annualEmployeeSocialContributions = mx.employeeSocial;
      annualEmployerSocialContributions = mx.employerSocial;
      bracketAudits = mx.audits;
      marginalTaxRate = mx.marginalRate;
      break;
    }
    case 'ZA': {
      const za = calculateSouthAfricaTax(netTaxableBeforeStandard, taxYear);
      annualIncomeTax = za.incomeTax;
      annualEmployeeSocialContributions = za.employeeSocial;
      annualEmployerSocialContributions = za.employerSocial;
      bracketAudits = za.audits;
      marginalTaxRate = za.marginalRate;
      break;
    }
    case 'KR': {
      const kr = calculateSouthKoreaTax(netTaxableBeforeStandard, taxYear);
      annualIncomeTax = kr.incomeTax;
      annualEmployeeSocialContributions = kr.employeeSocial;
      annualEmployerSocialContributions = kr.employerSocial;
      bracketAudits = kr.audits;
      marginalTaxRate = kr.marginalRate;
      break;
    }
    default: {
      const taxRate = Math.max(0, Math.min(100, profile.customTaxRate ?? 15.0)) / 100;
      const socialRate = Math.max(0, Math.min(100, profile.customSocialRate ?? 5.0)) / 100;
      const empRate = Math.max(0, Math.min(100, profile.customEmployerRate ?? 8.0)) / 100;

      annualIncomeTax = netTaxableBeforeStandard * taxRate;
      annualEmployeeSocialContributions = netTaxableBeforeStandard * socialRate;
      annualEmployerSocialContributions = netTaxableBeforeStandard * empRate;

      bracketAudits = [
        {
          bracketIndex: 1,
          min: 0,
          max: null,
          taxableAmountInBracket: netTaxableBeforeStandard,
          rate: taxRate * 100,
          taxForBracket: annualIncomeTax,
          cumulativeTax: annualIncomeTax,
        },
      ];
      marginalTaxRate = taxRate * 100;
      break;
    }
  }

  // 4. Post-Tax Deductions
  const annualUnionPostTax = Math.max(0, deductions.unionDuesPostTax * periods);
  const annualPostTaxInsurance = Math.max(0, deductions.postTaxInsurance * periods);
  const annualLoanPostTax = Math.max(0, deductions.loanRepaymentPostTax * periods);
  const annualOtherPostTax = Math.max(0, deductions.otherPostTax * periods);

  const annualPostTaxDeductions =
    annualUnionPostTax + annualPostTaxInsurance + annualLoanPostTax + annualOtherPostTax;

  // annualStateTax is non-zero only for US; must be included so net take-home correctly reflects
  // state income tax withholding in the reconciliation ledger (Gross − Deductions = Net)
  const annualTotalEmployeeDeductions =
    annualIncomeTax +
    annualStateTax +
    annualEmployeeSocialContributions +
    annualPreTaxDeductions +
    annualPostTaxDeductions;

  // 5. Net Take-Home Pay
  const annualNetTakeHome = Math.max(0, annualGrossCompensation - annualTotalEmployeeDeductions);

  // 6. Period Reconciliation
  const finalTaxableIncome = Math.max(0, netTaxableBeforeStandard - annualStandardDeduction);
  const periodGross = annualGrossCompensation / periods;
  const periodTaxableIncome = finalTaxableIncome / periods;
  const periodIncomeTax = annualIncomeTax / periods;
  const periodSocialContributions = annualEmployeeSocialContributions / periods;
  const periodPreTaxDeductions = annualPreTaxDeductions / periods;
  const periodPostTaxDeductions = annualPostTaxDeductions / periods;
  const periodNetTakeHome = annualNetTakeHome / periods;

  const monthlyGross = annualGrossCompensation / 12;
  const monthlyIncomeTax = annualIncomeTax / 12;
  const monthlySocialContributions = annualEmployeeSocialContributions / 12;
  const monthlyPreTaxDeductions = annualPreTaxDeductions / 12;
  const monthlyPostTaxDeductions = annualPostTaxDeductions / 12;
  const monthlyNetTakeHome = annualNetTakeHome / 12;

  // effectiveTaxRate includes all income taxes (federal + state for US) so the metric reflects the
  // total income-tax burden on gross pay — the most meaningful single-rate indicator for users
  const effectiveTaxRate = annualGrossCompensation > 0 ? ((annualIncomeTax + annualStateTax) / annualGrossCompensation) * 100 : 0;
  const socialContributionRate =
    annualGrossCompensation > 0 ? (annualEmployeeSocialContributions / annualGrossCompensation) * 100 : 0;
  const totalDeductionRate =
    annualGrossCompensation > 0 ? (annualTotalEmployeeDeductions / annualGrossCompensation) * 100 : 0;
  const netTakeHomeRate = annualGrossCompensation > 0 ? (annualNetTakeHome / annualGrossCompensation) * 100 : 0;

  // 8. Employer Cost Model
  let annualEmployerBenefits = 0;
  if (employerSettings?.enabled) {
    const pensionMatch = annualBaseSalary * (Math.max(0, employerSettings.pensionMatchPercent) / 100);
    const healthBenefits = Math.max(0, employerSettings.healthBenefitMonthly) * 12;
    const otherBenefits = Math.max(0, employerSettings.otherBenefitsMonthly) * 12;
    annualEmployerBenefits = pensionMatch + healthBenefits + otherBenefits;

    if (employerSettings.payrollTaxOverridePercent !== null) {
      annualEmployerSocialContributions = annualBaseSalary * (employerSettings.payrollTaxOverridePercent / 100);
    }
  }

  const annualTotalEmployerCost =
    annualGrossCompensation + annualEmployerSocialContributions + annualEmployerBenefits;
  const periodEmployerCost = annualTotalEmployerCost / periods;
  const monthlyEmployerCost = annualTotalEmployerCost / 12;
  const employeeToEmployerRatio =
    annualTotalEmployerCost > 0 ? (annualNetTakeHome / annualTotalEmployerCost) * 100 : 0;

  return {
    countryCode,
    countryName: cDef.name,
    taxYear,
    currency: cDef.currency,
    currencySymbol: cDef.symbol,
    currencyDecimals: cDef.decimals,
    payFrequency,
    periodCount: periods,
    status: cDef.status,
    statusLabel: cDef.statusLabel,

    annualBaseSalary,
    annualTaxableBonus,
    annualCommission,
    annualOvertime,
    annualTaxableAllowances,
    annualTaxableBenefits,
    annualOtherTaxable,
    annualNonTaxableBenefits,
    annualGrossCompensation,
    annualGrossTaxable,

    annualPreTaxDeductions,
    annualStandardDeduction,
    annualTaxableIncome: finalTaxableIncome,

    annualIncomeTax,
    annualEmployeeSocialContributions,
    annualStateTax,
    annualPostTaxDeductions,
    annualTotalEmployeeDeductions,

    annualNetTakeHome,

    periodGross,
    periodTaxableIncome,
    periodIncomeTax,
    periodSocialContributions,
    periodPreTaxDeductions,
    periodPostTaxDeductions,
    periodNetTakeHome,

    monthlyGross,
    monthlyIncomeTax,
    monthlySocialContributions,
    monthlyPreTaxDeductions,
    monthlyPostTaxDeductions,
    monthlyNetTakeHome,

    effectiveTaxRate,
    socialContributionRate,
    totalDeductionRate,
    netTakeHomeRate,
    marginalTaxRate: annualGrossCompensation > 0 ? marginalTaxRate : 0,

    bracketAudits,

    annualEmployerSocialContributions,
    annualEmployerBenefits,
    annualTotalEmployerCost,
    periodEmployerCost,
    monthlyEmployerCost,
    employeeToEmployerRatio,

    rulesetId: cDef.rulesetId,
    calculationStatus: cDef.status,
    freshness: taxYear === cDef.defaultTaxYear ? cDef.freshness : 'STALE',
    rulesetMaturity: getRulesetMaturity(cDef, taxYear),
    calculationScope: cDef.calculationScope,
    knownExclusions: cDef.knownExclusions,
    ruleVersion: cDef.ruleVersion,
    sourceAuthority: cDef.sourceAuthority,
    disclaimerNote: cDef.disclaimerNote,
  };
}

/* =========================================================================
   5. REVERSE SALARY GOAL SOLVER
   ========================================================================= */

export function solveRequiredGrossSalary(
  targetNet: number,
  targetFrequency: 'monthly' | 'annual',
  countryCode: string,
  taxYear: string,
  deductions: DeductionsState,
  profile: {
    region?: string;
    filingStatus?: UsFilingStatus;
    germanTaxClass?: GermanTaxClass;
    churchTax?: boolean;
    indiaRegime?: IndiaTaxRegime;
    singaporeResidency?: SingaporeResidency;
    gulfResidency?: GulfResidency;
    customTaxRate?: number;
    customSocialRate?: number;
    customEmployerRate?: number;
    nzKiwisaverRate?: number;
    nlRuling30?: boolean;
  }
): ReverseSalaryGoalResult {
  const targetAnnualNet = targetFrequency === 'monthly' ? targetNet * 12 : targetNet;

  if (targetAnnualNet <= 0 || !Number.isFinite(targetAnnualNet)) {
    return {
      targetNet,
      targetFrequency,
      requiredGrossAnnual: 0,
      requiredGrossMonthly: 0,
      resultingNetAnnual: 0,
      resultingNetMonthly: 0,
      estimatedTaxAnnual: 0,
      estimatedContributionsAnnual: 0,
      effectiveTaxRate: 0,
      iterations: 0,
      converged: true,
      discrepancy: 0,
    };
  }

  let low = targetAnnualNet;
  let high = Math.max(100000, targetAnnualNet * 4 + 100000);
  let iterations = 0;
  const maxIterations = 50;
  const tolerance = 0.5;

  const emptyEarnings: EarningsState = {
    baseSalary: 0,
    bonus: 0,
    commission: 0,
    overtime: 0,
    allowances: 0,
    taxableBenefits: 0,
    nonTaxableBenefits: 0,
    otherIncome: 0,
  };

  let bestMid = low;
  let bestResult = calculateSalaryTakeHome(
    countryCode,
    taxYear,
    'annual',
    { ...emptyEarnings, baseSalary: bestMid },
    deductions,
    profile
  );

  if (Math.abs(bestResult.annualNetTakeHome - targetAnnualNet) <= 0.001) {
    return {
      targetNet,
      targetFrequency,
      requiredGrossAnnual: Math.round(low * 100) / 100,
      requiredGrossMonthly: Math.round((low / 12) * 100) / 100,
      resultingNetAnnual: bestResult.annualNetTakeHome,
      resultingNetMonthly: bestResult.monthlyNetTakeHome,
      estimatedTaxAnnual: bestResult.annualIncomeTax,
      estimatedContributionsAnnual: bestResult.annualEmployeeSocialContributions,
      effectiveTaxRate: bestResult.effectiveTaxRate,
      iterations: 0,
      converged: true,
      discrepancy: 0,
    };
  }

  while (iterations < maxIterations && high - low > tolerance) {
    iterations++;
    const mid = (low + high) / 2;
    const current = calculateSalaryTakeHome(
      countryCode,
      taxYear,
      'annual',
      { ...emptyEarnings, baseSalary: mid },
      deductions,
      profile
    );

    bestMid = mid;
    bestResult = current;

    const diff = current.annualNetTakeHome - targetAnnualNet;
    if (Math.abs(diff) <= tolerance) {
      break;
    }

    if (diff < 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const discrepancy = Math.abs(bestResult.annualNetTakeHome - targetAnnualNet);

  return {
    targetNet,
    targetFrequency,
    requiredGrossAnnual: bestMid,
    requiredGrossMonthly: bestMid / 12,
    resultingNetAnnual: bestResult.annualNetTakeHome,
    resultingNetMonthly: bestResult.monthlyNetTakeHome,
    estimatedTaxAnnual: bestResult.annualIncomeTax,
    estimatedContributionsAnnual: bestResult.annualEmployeeSocialContributions,
    effectiveTaxRate: bestResult.effectiveTaxRate,
    iterations,
    converged: discrepancy <= 5.0,
    discrepancy,
  };
}

/* =========================================================================
   6. RFC-4180 CSV EXPORT & FORMULA INJECTION DEFENSE
   ========================================================================= */

export function sanitizeCsvField(val: unknown): string {
  const str = String(val ?? '');
  let sanitized = str;
  if (/^[=+\-@\t\r]/.test(sanitized)) {
    sanitized = "'" + sanitized;
  }
  if (/[",\r\n]/.test(sanitized)) {
    sanitized = `"${sanitized.replace(/"/g, '""')}"`;
  }
  return sanitized;
}

export function generateSalaryCsvExport(result: CalculationResult): string {
  const headers = [
    'Parameter',
    'Annual Amount',
    'Monthly Amount',
    'Pay Period Amount',
    'Currency',
    'Country',
    'Tax Year',
    'Ruleset ID',
    'Rule Version',
  ];

  const rows = [
    ['Gross Base Salary', result.annualBaseSalary.toFixed(2), (result.annualBaseSalary / 12).toFixed(2), (result.annualBaseSalary / result.periodCount).toFixed(2)],
    ['Taxable Bonuses & Extras', (result.annualGrossTaxable - result.annualBaseSalary).toFixed(2), ((result.annualGrossTaxable - result.annualBaseSalary) / 12).toFixed(2), ((result.annualGrossTaxable - result.annualBaseSalary) / result.periodCount).toFixed(2)],
    ['Gross Total Compensation', result.annualGrossCompensation.toFixed(2), result.monthlyGross.toFixed(2), result.periodGross.toFixed(2)],
    ['Pre-Tax Deductions', result.annualPreTaxDeductions.toFixed(2), result.monthlyPreTaxDeductions.toFixed(2), result.periodPreTaxDeductions.toFixed(2)],
    ['Taxable Income', result.annualTaxableIncome.toFixed(2), (result.annualTaxableIncome / 12).toFixed(2), result.periodTaxableIncome.toFixed(2)],
    ['Income Tax', result.annualIncomeTax.toFixed(2), result.monthlyIncomeTax.toFixed(2), result.periodIncomeTax.toFixed(2)],
    ['Employee Social / Statutory Contributions', result.annualEmployeeSocialContributions.toFixed(2), result.monthlySocialContributions.toFixed(2), result.periodSocialContributions.toFixed(2)],
    ['Post-Tax Deductions', result.annualPostTaxDeductions.toFixed(2), result.monthlyPostTaxDeductions.toFixed(2), result.periodPostTaxDeductions.toFixed(2)],
    ['Total Employee Deductions', result.annualTotalEmployeeDeductions.toFixed(2), (result.annualTotalEmployeeDeductions / 12).toFixed(2), (result.annualTotalEmployeeDeductions / result.periodCount).toFixed(2)],
    ['Estimated Net Take-Home Pay', result.annualNetTakeHome.toFixed(2), result.monthlyNetTakeHome.toFixed(2), result.periodNetTakeHome.toFixed(2)],
    ['Total Employer Cost', result.annualTotalEmployerCost.toFixed(2), result.monthlyEmployerCost.toFixed(2), result.periodEmployerCost.toFixed(2)],
    ['Effective Tax Rate (%)', result.effectiveTaxRate.toFixed(2), result.effectiveTaxRate.toFixed(2), result.effectiveTaxRate.toFixed(2)],
    ['Marginal Tax Rate (%)', result.marginalTaxRate.toFixed(2), result.marginalTaxRate.toFixed(2), result.marginalTaxRate.toFixed(2)],
  ];

  const csvLines = [headers.join(',')];

  for (const r of rows) {
    const fullRow = [
      sanitizeCsvField(r[0]),
      sanitizeCsvField(r[1]),
      sanitizeCsvField(r[2]),
      sanitizeCsvField(r[3]),
      sanitizeCsvField(result.currency),
      sanitizeCsvField(result.countryName),
      sanitizeCsvField(result.taxYear),
      sanitizeCsvField(result.rulesetId || result.ruleVersion),
      sanitizeCsvField(result.ruleVersion),
    ];
    csvLines.push(fullRow.join(','));
  }

  return csvLines.join('\r\n');
}

/* =========================================================================
   7. MAIN REACT COMPONENT — SALARY CALCULATOR COUNTRY DIRECTORY (PHASE 1)
   ========================================================================= */

export function getCountrySlug(country: CountryDefinition): string {
  return country.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export const FEATURED_COUNTRY_CODES: string[] = [
  'PK', 'US', 'GB', 'DE', 'IN', 'CA', 'AU', 'SG', 'AE', 'SA', 'FR', 'JP',
  'CH', 'NL', 'IE', 'NZ', 'ES', 'IT', 'BR', 'MX', 'ZA', 'KR'
];

function getCountryCardDescription(c: CountryDefinition): string {
  switch (c.code) {
    case 'PK':
      return "Calculate estimated salary using Pakistan's current implemented FBR tax brackets and EOBI payroll contributions.";
    case 'US':
      return "Calculate estimated salary using implemented U.S. federal income tax, FICA, and state payroll rules. State/local coverage is limited.";
    case 'GB':
      return "Calculate estimated salary using UK HMRC PAYE income tax (including Scottish devolved rates) and National Insurance.";
    case 'DE':
      return "Calculate estimated salary using Germany's Einkommensteuer progressive tariff, Solidarity surcharge, and social insurance.";
    case 'IN':
      return "Calculate estimated salary using India's Section 115BAC New and Old Tax Regimes with statutory Standard Deductions.";
    case 'CA':
      return "Calculate estimated salary using Canada CRA federal income tax, CPP, EI, and provincial benchmark tax rates.";
    case 'AU':
      return "Calculate estimated salary using Australia ATO individual income tax brackets and statutory Medicare Levy.";
    case 'SG':
      return "Calculate estimated salary using Singapore IRAS tax brackets and statutory CPF citizen/PR contributions.";
    case 'AE':
      return "Calculate estimated compensation for 0% personal income tax jurisdiction with statutory employer costs.";
    case 'SA':
      return "Calculate estimated compensation for 0% personal income tax jurisdiction with statutory employer costs.";
    case 'FR':
      return "Calculate estimated salary using France's Barème progressif de l'impôt and statutory social benchmarks.";
    case 'JP':
      return "Calculate estimated salary using Japan's NTA progressive income tax and social insurance benchmarks.";
    case 'CH':
      return "Calculate estimated salary using Swiss Direct Federal Tax (Art. 36 DBG), cantonal benchmarks, and 1st/2nd Pillar.";
    case 'NL':
      return "Calculate estimated salary using Dutch Box 1 income tax, AHK, Arbeidskorting, and optional 30% ruling facility.";
    case 'IE':
      return "Calculate estimated salary using Irish PAYE income tax, Universal Social Charge (USC), and PRSI Class A.";
    case 'NZ':
      return "Calculate estimated salary using New Zealand Budget 2024 PAYE brackets, ACC earners' levy, and KiwiSaver.";
    case 'ES':
      return "Calculate estimated salary using Spanish dual scale IRPF, personal minimum, and Seguridad Social.";
    case 'IT':
      return "Calculate estimated salary using Italian 3-scaglioni IRPEF, regional surtaxes, and INPS contributions.";
    case 'BR':
      return "Calculate estimated salary using Brazilian progressive IRPF, INSS CLT brackets, and employer charges.";
    case 'MX':
      return "Calculate estimated salary using Mexican Art. 152 ISR annual tariff and IMSS social security.";
    case 'ZA':
      return "Calculate estimated salary using South African SARS progressive PAYE, primary rebate, and UIF.";
    case 'KR':
      return "Calculate estimated salary using South Korean NTS progressive income tax and 4 Major Insurances.";
    default:
      return `Country catalogue entry available for ${c.name}. Standard user-defined benchmark estimation model.`;
  }
}

export default function SalaryCalculator() {
  const formId = useId();

  // Search & Filter State — Starts strictly EMPTY / Zero-Prefill
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'LIMITED' | 'CUSTOM_ESTIMATE'>('ALL');
  const [selectedCountryModal, setSelectedCountryModal] = useState<CountryDefinition | null>(null);
  const [catalogDisplayLimit, setCatalogDisplayLimit] = useState<number>(24);

  // Instant Hub Quick-Calculator State
  const [quickCountryCode, setQuickCountryCode] = useState<string>('PK');
  const [quickSalaryInput, setQuickSalaryInput] = useState<string>('');
  const [quickFreq, setQuickFreq] = useState<PayFrequency>('monthly');

  const quickCountryDef = GLOBAL_COUNTRIES[quickCountryCode] || GLOBAL_COUNTRIES['PK'];
  const quickParsedGross = useMemo(() => parseNumericInput(quickSalaryInput), [quickSalaryInput]);
  const quickResult = useMemo(() => {
    if (quickParsedGross <= 0) return null;
    return calculateSalaryTakeHome(
      quickCountryCode,
      quickCountryDef.defaultTaxYear,
      quickFreq,
      {
        baseSalary: quickParsedGross,
        bonus: 0,
        commission: 0,
        overtime: 0,
        allowances: 0,
        taxableBenefits: 0,
        nonTaxableBenefits: 0,
        otherIncome: 0,
      },
      {
        retirementPreTax: 0,
        retirementPreTaxType: 'fixed',
        healthInsurancePreTax: 0,
        hsaFsaPreTax: 0,
        otherPreTax: 0,
        unionDuesPostTax: 0,
        postTaxInsurance: 0,
        loanRepaymentPostTax: 0,
        otherPostTax: 0,
      },
      {
        region: quickCountryDef.defaultRegion,
        filingStatus: 'single',
        germanTaxClass: 'I',
        indiaRegime: 'new',
        singaporeResidency: 'citizen',
        gulfResidency: 'expat',
      }
    );
  }, [quickCountryCode, quickCountryDef, quickFreq, quickParsedGross]);

  // Close modal on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSelectedCountryModal(null);
    }
  }, []);

  useEffect(() => {
    if (selectedCountryModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedCountryModal, handleKeyDown]);

  // All countries list
  const allCountries = useMemo(() => {
    return Object.values(GLOBAL_COUNTRIES);
  }, []);

  // Country counts
  const stats = useMemo(() => {
    let verified = 0;
    let limited = 0;
    let custom = 0;
    for (const c of allCountries) {
      if (c.status === 'VERIFIED') verified++;
      else if (c.status === 'LIMITED') limited++;
      else custom++;
    }
    return { total: allCountries.length, verified, limited, custom };
  }, [allCountries]);

  // Featured list
  const featuredCountries = useMemo(() => {
    return FEATURED_COUNTRY_CODES.map((code) => GLOBAL_COUNTRIES[code]).filter(Boolean) as CountryDefinition[];
  }, []);

  // Catalogue list (excluding featured, sorted alphabetically)
  const remainingCatalogCountries = useMemo(() => {
    const featuredSet = new Set(FEATURED_COUNTRY_CODES);
    return allCountries
      .filter((c) => !featuredSet.has(c.code))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allCountries]);

  // Filtered countries based on query and statusFilter
  const isSearchOrFilterActive = searchQuery.trim() !== '' || statusFilter !== 'ALL';

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    return allCountries.filter((c) => {
      // Status filter check
      if (statusFilter === 'VERIFIED' && c.status !== 'VERIFIED') return false;
      if (statusFilter === 'LIMITED' && c.status !== 'LIMITED') return false;
      if (statusFilter === 'CUSTOM_ESTIMATE' && c.status !== 'CUSTOM_ESTIMATE' && c.status !== 'CUSTOM') return false;

      // Search query check
      if (!q) return true;

      const nameNorm = c.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const commonNameNorm = (c.commonName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const code = c.code.toLowerCase();
      const iso3 = c.iso3.toLowerCase();
      const currency = c.currency.toLowerCase();

      return (
        nameNorm.includes(q) ||
        commonNameNorm.includes(q) ||
        code.includes(q) ||
        iso3.includes(q) ||
        currency.includes(q)
      );
    }).sort((a, b) => {
      // Sort priority: featured first, then verified, then alphabetical
      const aFeatured = FEATURED_COUNTRY_CODES.includes(a.code);
      const bFeatured = FEATURED_COUNTRY_CODES.includes(b.code);
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;

      if (a.status === 'VERIFIED' && b.status !== 'VERIFIED') return -1;
      if (a.status !== 'VERIFIED' && b.status === 'VERIFIED') return 1;

      return a.name.localeCompare(b.name);
    });
  }, [allCountries, searchQuery, statusFilter]);

  // Reset search
  const handleResetSearch = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCatalogDisplayLimit(24);
  };

  const renderCountryCard = (country: CountryDefinition) => {
    const isVerified = country.status === 'VERIFIED';
    const isLimited = country.status === 'LIMITED';
    const isCustom = !isVerified && !isLimited;

    return (
      <div
        key={country.code}
        data-country-code={country.code}
        className="flex flex-col justify-between bg-white dark:bg-[#0f172a] rounded-2xl p-5 border border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-md transition-all group"
      >
        <div className="space-y-3">
          {/* Flag & Header */}
          <div className="flex items-start justify-between gap-3">
            <span className="text-3xl select-none" role="img" aria-label={`${country.name} flag`}>
              {country.flag}
            </span>
            {isVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Verified</span>
              </span>
            ) : isLimited ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 whitespace-nowrap">
                <Info className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>Limited</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 whitespace-nowrap">
                <Sliders className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                <span>Custom</span>
              </span>
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {country.name}
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Salary & Net Take-Home
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              {country.currency} {country.symbol !== country.currency ? `(${country.symbol})` : ''}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {country.defaultTaxYear}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
            {getCountryCardDescription(country)}
          </p>
        </div>

        <div className="pt-4 mt-3 border-t border-gray-100 dark:border-slate-800/80 space-y-2">
          {!isCustom ? (
            <>
              <Link
                href={`/finance/salary-calculator/${getCountrySlug(country)}`}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                  isVerified
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <span>Calculate {country.name} Salary</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setSelectedCountryModal(country)}
                className="w-full text-center text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                View coverage &amp; methodology
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSelectedCountryModal(country)}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700"
            >
              <span>View Status</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 py-4 sm:py-6">
      {/* 1. HERO HEADER */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold tracking-wide shadow-sm">
          <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Country &amp; Territory Directory · 212 Jurisdictions</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Salary & Net Take-Home by Country
        </h2>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Choose a country to calculate estimated take-home pay using the applicable payroll and tax assumptions. Select a jurisdiction below to inspect verified statutory rulesets, deductions, and coverage limitations.
        </p>

        {/* Trust Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{stats.verified} Verified Statutory</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{stats.limited} Limited Statutory</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>{stats.custom} Custom Estimate</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Privacy Standard · No salary data stored or transmitted</span>
          </div>
        </div>
      </div>

      {/* 1.5 INSTANT GLOBAL SALARY CALCULATOR BAR */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border-2 border-blue-200 dark:border-blue-900/60 shadow-md space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Instant 1-Step Calculation
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Quick Take-Home Pay Calculator (22 Statutory Countries)
            </h3>
          </div>
          <Link
            href={`/finance/salary-calculator/${getCountrySlug(quickCountryDef)}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <span>Open Full {quickCountryDef.name} Calculator</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Select Country */}
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-quick-country`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
              1. Select Country
            </label>
            <select
              id={`${formId}-quick-country`}
              value={quickCountryCode}
              onChange={(e) => {
                const nextCode = e.target.value;
                setQuickCountryCode(nextCode);
                const monthlySet = new Set(['PK', 'SG', 'AE', 'SA', 'BR', 'MX', 'ZA']);
                setQuickFreq(monthlySet.has(nextCode) ? 'monthly' : 'annual');
              }}
              className="w-full py-3 px-3 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {featuredCountries.map((fc) => (
                <option key={fc.code} value={fc.code}>
                  {fc.flag} {fc.name} ({fc.currency} · {fc.defaultTaxYear})
                </option>
              ))}
            </select>
          </div>

          {/* Enter Gross Salary */}
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-quick-salary`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
              2. Enter Gross Salary ({quickCountryDef.currency})
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 font-bold text-slate-400 select-none">
                {quickCountryDef.symbol}
              </span>
              <input
                id={`${formId}-quick-salary`}
                type="text"
                inputMode="numeric"
                value={quickSalaryInput}
                onChange={(e) => setQuickSalaryInput(e.target.value)}
                placeholder={quickFreq === 'monthly' ? 'e.g. 150,000' : 'e.g. 85,000'}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums"
              />
            </div>
          </div>

          {/* Select Frequency */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              3. Pay Cycle
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['monthly', 'annual'] as PayFrequency[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setQuickFreq(f)}
                  className={`py-3 px-3 rounded-xl text-xs font-bold capitalize border transition-all ${
                    quickFreq === f
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Instant Result Strip */}
        {quickResult && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-emerald-100 block">
                Net Monthly Take-Home
              </span>
              <span className="text-xl sm:text-2xl font-extrabold tabular-nums">
                {formatCurrency(quickResult.monthlyNetTakeHome, quickResult.currency, quickResult.currencySymbol, quickResult.currencyDecimals)}
              </span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-emerald-100 block">
                Net Annual Take-Home
              </span>
              <span className="text-lg sm:text-xl font-bold tabular-nums">
                {formatCurrency(quickResult.annualNetTakeHome, quickResult.currency, quickResult.currencySymbol, quickResult.currencyDecimals)}
              </span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-emerald-100 block">
                Annual Income Tax + Social
              </span>
              <span className="text-sm sm:text-base font-bold tabular-nums">
                −{formatCurrency(quickResult.annualTotalEmployeeDeductions, quickResult.currency, quickResult.currencySymbol, quickResult.currencyDecimals)} ({formatPercent(quickResult.totalDeductionRate, 1)})
              </span>
            </div>
            <div className="sm:text-right">
              <Link
                href={`/finance/salary-calculator/${getCountrySlug(quickCountryDef)}`}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-xs"
              >
                <span>Full Breakdown &amp; Slabs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 2. SEARCH & FILTER SECTION */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="relative">
          <label htmlFor={`${formId}-search`} className="sr-only">
            Search countries by name, ISO code, or currency
          </label>
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              id={`${formId}-search`}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search countries by name, code (e.g. PK, US, GB), or currency (e.g. PKR, USD, EUR)..."
              className="w-full pl-11 pr-10 py-3 sm:py-3.5 bg-gray-50/70 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
              Filter by:
            </span>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              All Jurisdictions ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('VERIFIED')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                statusFilter === 'VERIFIED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/60'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified ({stats.verified})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('LIMITED')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                statusFilter === 'LIMITED'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/60'
              }`}
            >
              <Info className="w-3 h-3" />
              <span>Limited ({stats.limited})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('CUSTOM_ESTIMATE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                statusFilter === 'CUSTOM_ESTIMATE'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Custom Estimate ({stats.custom})</span>
            </button>
          </div>

          {isSearchOrFilterActive && (
            <button
              type="button"
              onClick={handleResetSearch}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filter</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. DIRECTORY GRID DISPLAY */}
      {isSearchOrFilterActive ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Search Results ({filteredCountries.length} jurisdictions found)
            </h2>
            {searchQuery && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Matching &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>

          {filteredCountries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredCountries.map((c) => renderCountryCard(c))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-white dark:bg-[#0f172a] rounded-3xl border border-gray-200 dark:border-slate-800 space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                No countries match your search
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                We could not find any country matching &ldquo;{searchQuery}&rdquo;. Try searching by country name, ISO code (e.g. PK, US), or currency code (e.g. PKR, USD).
              </p>
              <button
                type="button"
                onClick={handleResetSearch}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section A: Featured Statutory Calculators */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Featured Statutory Calculators</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Jurisdictions with codified statutory payroll engines, progressive tax slabs, and mandatory social insurance contributions.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {featuredCountries.map((c) => renderCountryCard(c))}
            </div>
          </div>

          {/* Section B: Country Catalogue */}
          <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <span>Country Catalogue ({remainingCatalogCountries.length} Jurisdictions)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Comprehensive global directory of sovereign territories with user-defined benchmark estimation models.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {remainingCatalogCountries.slice(0, catalogDisplayLimit).map((c) => renderCountryCard(c))}
            </div>

            {catalogDisplayLimit < remainingCatalogCountries.length && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setCatalogDisplayLimit((prev) => Math.min(prev + 24, remainingCatalogCountries.length))}
                  className="px-6 py-2.5 bg-white dark:bg-[#0f172a] hover:bg-gray-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors"
                >
                  Show More Countries (Showing {Math.min(catalogDisplayLimit, remainingCatalogCountries.length)} of {remainingCatalogCountries.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. COVERAGE & METHODOLOGY TRUST SECTION */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0d1424] dark:to-slate-900/60 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 space-y-6">
        <div className="space-y-1.5">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>About Country Coverage & Statutory Methodology</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
            Salary and payroll rules vary significantly by country. This directory transparently separates verified and limited calculator coverage so you can see what statutory rules are currently implemented before calculating.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Verified */}
          <div className="p-5 bg-white dark:bg-[#0f172a] rounded-2xl border border-emerald-100 dark:border-emerald-950/60 shadow-sm space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Verified Statutory</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Country-specific rules have been implemented and verified against current official tax authority schedules. All progressive brackets, standard deductions, and employee contributions pass automated boundary testing.
            </p>
          </div>

          {/* Limited */}
          <div className="p-5 bg-white dark:bg-[#0f172a] rounded-2xl border border-blue-100 dark:border-blue-950/60 shadow-sm space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
              <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Limited Statutory</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Core federal or national income tax and social insurance are implemented, but material statutory limitations remain (e.g. municipal surtaxes, specific provincial scales, or sector exemptions are simplified).
            </p>
          </div>

          {/* Custom Estimate */}
          <div className="p-5 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              <Sliders className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Custom Estimate</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The jurisdiction is present in the global directory, but an independently verified statutory calculator is not currently available. Uses customizable benchmark estimation without claiming statutory authority.
            </p>
          </div>
        </div>

        {/* Privacy Standard */}
        <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">Privacy Standard:</span>
            <span>100% client-side evaluation. No salary data stored or transmitted. Zero salary inputs, searches, or calculations are ever stored in cookies, local storage, or sent across the network.</span>
          </div>
        </div>
      </div>

      {/* 5. COUNTRY STATUTORY PROFILE MODAL */}
      {selectedCountryModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="country-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCountryModal(null);
          }}
        >
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-lg w-full border border-gray-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-4xl select-none" role="img" aria-label={`${selectedCountryModal.name} flag`}>
                  {selectedCountryModal.flag}
                </span>
                <div>
                  <h3 id="country-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {selectedCountryModal.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedCountryModal.currency} ({selectedCountryModal.symbol}) · ISO {selectedCountryModal.code} / {selectedCountryModal.iso3}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCountryModal(null)}
                aria-label="Close dialog"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Ruleset Badge */}
            <div className="flex flex-wrap items-center gap-2">
              {selectedCountryModal.status === 'VERIFIED' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Statutory Model</span>
                </span>
              ) : selectedCountryModal.status === 'LIMITED' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Limited Statutory Model</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>User-Defined Custom Estimate</span>
                </span>
              )}
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Tax Year {selectedCountryModal.defaultTaxYear}
              </span>
            </div>

            {/* Metadata Details */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-[#0a0f1a] rounded-xl border border-gray-100 dark:border-slate-800/80 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">Ruleset & Authority:</span>
                <p className="text-slate-600 dark:text-slate-400">
                  {selectedCountryModal.sourceAuthority} — <span className="font-mono">{selectedCountryModal.rulesetId}</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedCountryModal.ruleVersion}
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-[#0a0f1a] rounded-xl border border-gray-100 dark:border-slate-800/80 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">Statutory Calculation Scope:</span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedCountryModal.calculationScope}
                </p>
              </div>

              {selectedCountryModal.knownExclusions && selectedCountryModal.knownExclusions.length > 0 && (
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                  <span className="font-bold text-amber-900 dark:text-amber-300">Documented Exclusions / Limitations:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-amber-800/90 dark:text-amber-300/80 text-[11px]">
                    {selectedCountryModal.knownExclusions.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Dedicated Statutory Route or Custom Estimate Action */}
            {selectedCountryModal.status === "VERIFIED" || selectedCountryModal.status === "LIMITED" ? (
              <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-300 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Dedicated Statutory Calculator Active</span>
                </div>
                <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
                  Launch the standalone <span className="font-mono font-semibold">/finance/salary-calculator/{getCountrySlug(selectedCountryModal)}</span> calculator to model {selectedCountryModal.name} progressive tax brackets, social security caps, pay periods, and employer payroll cost.
                </p>
                <Link
                  href={`/finance/salary-calculator/${getCountrySlug(selectedCountryModal)}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <span>Open {selectedCountryModal.name} Salary Calculator</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Custom Benchmark Estimation Model</span>
                </div>
                <p className="text-[11px] text-blue-800/90 dark:text-blue-300/90 leading-relaxed">
                  {selectedCountryModal.name} ({selectedCountryModal.currency}) is catalogued in our 212-jurisdiction directory under user-defined custom estimation rules. Select any of the 22 featured statutory calculators above for codified government tax schedules.
                </p>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCountryModal(null)}
                className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

