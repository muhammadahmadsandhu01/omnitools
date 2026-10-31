import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import AdUnit from '@/components/ads/AdUnit';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/config/site';
import SchemaMarkup from '@/components/SchemaMarkup';

// 22 Country Calculators
import PakistanSalaryCalculator from '@/components/tools/salary/PakistanSalaryCalculator';
import UnitedStatesSalaryCalculator from '@/components/tools/salary/UnitedStatesSalaryCalculator';
import UnitedKingdomSalaryCalculator from '@/components/tools/salary/UnitedKingdomSalaryCalculator';
import GermanySalaryCalculator from '@/components/tools/salary/GermanySalaryCalculator';
import IndiaSalaryCalculator from '@/components/tools/salary/IndiaSalaryCalculator';
import CanadaSalaryCalculator from '@/components/tools/salary/CanadaSalaryCalculator';
import AustraliaSalaryCalculator from '@/components/tools/salary/AustraliaSalaryCalculator';
import SingaporeSalaryCalculator from '@/components/tools/salary/SingaporeSalaryCalculator';
import UnitedArabEmiratesSalaryCalculator from '@/components/tools/salary/UnitedArabEmiratesSalaryCalculator';
import SaudiArabiaSalaryCalculator from '@/components/tools/salary/SaudiArabiaSalaryCalculator';
import FranceSalaryCalculator from '@/components/tools/salary/FranceSalaryCalculator';
import JapanSalaryCalculator from '@/components/tools/salary/JapanSalaryCalculator';
import SwitzerlandSalaryCalculator from '@/components/tools/salary/SwitzerlandSalaryCalculator';
import NetherlandsSalaryCalculator from '@/components/tools/salary/NetherlandsSalaryCalculator';
import IrelandSalaryCalculator from '@/components/tools/salary/IrelandSalaryCalculator';
import NewZealandSalaryCalculator from '@/components/tools/salary/NewZealandSalaryCalculator';
import SpainSalaryCalculator from '@/components/tools/salary/SpainSalaryCalculator';
import ItalySalaryCalculator from '@/components/tools/salary/ItalySalaryCalculator';
import SouthAfricaSalaryCalculator from '@/components/tools/salary/SouthAfricaSalaryCalculator';
import BrazilSalaryCalculator from '@/components/tools/salary/BrazilSalaryCalculator';
import MexicoSalaryCalculator from '@/components/tools/salary/MexicoSalaryCalculator';
import SouthKoreaSalaryCalculator from '@/components/tools/salary/SouthKoreaSalaryCalculator';

// 22 Country SEO Companions
import PakistanSalaryCalculatorSeo from '@/components/seo/salary/PakistanSalaryCalculatorSeo';
import UnitedStatesSalaryCalculatorSeo from '@/components/seo/salary/UnitedStatesSalaryCalculatorSeo';
import UnitedKingdomSalaryCalculatorSeo from '@/components/seo/salary/UnitedKingdomSalaryCalculatorSeo';
import GermanySalaryCalculatorSeo from '@/components/seo/salary/GermanySalaryCalculatorSeo';
import IndiaSalaryCalculatorSeo from '@/components/seo/salary/IndiaSalaryCalculatorSeo';
import CanadaSalaryCalculatorSeo from '@/components/seo/salary/CanadaSalaryCalculatorSeo';
import AustraliaSalaryCalculatorSeo from '@/components/seo/salary/AustraliaSalaryCalculatorSeo';
import SingaporeSalaryCalculatorSeo from '@/components/seo/salary/SingaporeSalaryCalculatorSeo';
import UnitedArabEmiratesSalaryCalculatorSeo from '@/components/seo/salary/UnitedArabEmiratesSalaryCalculatorSeo';
import SaudiArabiaSalaryCalculatorSeo from '@/components/seo/salary/SaudiArabiaSalaryCalculatorSeo';
import FranceSalaryCalculatorSeo from '@/components/seo/salary/FranceSalaryCalculatorSeo';
import JapanSalaryCalculatorSeo from '@/components/seo/salary/JapanSalaryCalculatorSeo';
import SwitzerlandSalaryCalculatorSeo from '@/components/seo/salary/SwitzerlandSalaryCalculatorSeo';
import NetherlandsSalaryCalculatorSeo from '@/components/seo/salary/NetherlandsSalaryCalculatorSeo';
import IrelandSalaryCalculatorSeo from '@/components/seo/salary/IrelandSalaryCalculatorSeo';
import NewZealandSalaryCalculatorSeo from '@/components/seo/salary/NewZealandSalaryCalculatorSeo';
import SpainSalaryCalculatorSeo from '@/components/seo/salary/SpainSalaryCalculatorSeo';
import ItalySalaryCalculatorSeo from '@/components/seo/salary/ItalySalaryCalculatorSeo';
import SouthAfricaSalaryCalculatorSeo from '@/components/seo/salary/SouthAfricaSalaryCalculatorSeo';
import BrazilSalaryCalculatorSeo from '@/components/seo/salary/BrazilSalaryCalculatorSeo';
import MexicoSalaryCalculatorSeo from '@/components/seo/salary/MexicoSalaryCalculatorSeo';
import SouthKoreaSalaryCalculatorSeo from '@/components/seo/salary/SouthKoreaSalaryCalculatorSeo';

export interface CountryMetadata {
  code: string;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
  defaultTaxYear: string;
  rulesetId: string;
  sourceAuthority: string;
}

export const COUNTRY_METADATA: Record<string, CountryMetadata> = {
  PK: {
    code: 'PK',
    name: 'Pakistan',
    flag: '🇵🇰',
    currency: 'PKR',
    symbol: '₨',
    defaultTaxYear: '2026-2027',
    rulesetId: 'PK-FBR-2026.2',
    sourceAuthority: 'Federal Board of Revenue (FBR)',
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    symbol: '$',
    defaultTaxYear: '2026',
    rulesetId: 'US-FED-2026.2',
    sourceAuthority: 'Internal Revenue Service (IRS)',
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    symbol: '£',
    defaultTaxYear: '2026-2027',
    rulesetId: 'UK-HMRC-2026.2',
    sourceAuthority: 'HM Revenue & Customs (HMRC)',
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    currency: 'EUR',
    symbol: '€',
    defaultTaxYear: '2026',
    rulesetId: 'DE-BMF-2026.2',
    sourceAuthority: 'Bundesministerium der Finanzen (BMF)',
  },
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    defaultTaxYear: 'FY 2025-2026 (AY 2026-2027)',
    rulesetId: 'IN-CBDT-2026.2',
    sourceAuthority: 'Income Tax Department (CBDT)',
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    symbol: '$',
    defaultTaxYear: '2026',
    rulesetId: 'CA-CRA-2026.2',
    sourceAuthority: 'Canada Revenue Agency (CRA)',
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    symbol: '$',
    defaultTaxYear: '2026-2027',
    rulesetId: 'AU-ATO-2026.2',
    sourceAuthority: 'Australian Taxation Office (ATO)',
  },
  SG: {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    currency: 'SGD',
    symbol: '$',
    defaultTaxYear: 'YA 2026',
    rulesetId: 'SG-IRAS-2026.2',
    sourceAuthority: 'Inland Revenue Authority of Singapore (IRAS)',
  },
  AE: {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'AED',
    symbol: 'د.إ',
    defaultTaxYear: '2026',
    rulesetId: 'AE-FTA-2026.2',
    sourceAuthority: 'Federal Tax Authority (FTA) / GPSSA',
  },
  SA: {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    currency: 'SAR',
    symbol: '﷼',
    defaultTaxYear: '2026',
    rulesetId: 'SA-ZATCA-2026.2',
    sourceAuthority: 'Zakat, Tax and Customs Authority (ZATCA) / GOSI',
  },
  FR: {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    currency: 'EUR',
    symbol: '€',
    defaultTaxYear: '2026',
    rulesetId: 'FR-DGFIP-2026.2',
    sourceAuthority: 'Direction Générale des Finances Publiques (DGFiP)',
  },
  JP: {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    currency: 'JPY',
    symbol: '¥',
    defaultTaxYear: '2026',
    rulesetId: 'JP-NTA-2026.2',
    sourceAuthority: 'National Tax Agency (NTA)',
  },
  CH: {
    code: 'CH',
    name: 'Switzerland',
    flag: '🇨🇭',
    currency: 'CHF',
    symbol: 'CHF',
    defaultTaxYear: '2026',
    rulesetId: 'CH-ESTV-2026.2',
    sourceAuthority: 'Federal Tax Administration (ESTV)',
  },
  NL: {
    code: 'NL',
    name: 'Netherlands',
    flag: '🇳🇱',
    currency: 'EUR',
    symbol: '€',
    defaultTaxYear: '2026',
    rulesetId: 'NL-BELASTING-2026.2',
    sourceAuthority: 'Belastingdienst',
  },
  IE: {
    code: 'IE',
    name: 'Ireland',
    flag: '🇮🇪',
    currency: 'EUR',
    symbol: '€',
    defaultTaxYear: '2026',
    rulesetId: 'IE-REVENUE-2026.2',
    sourceAuthority: 'Revenue Commissioners',
  },
  NZ: {
    code: 'NZ',
    name: 'New Zealand',
    flag: '🇳🇿',
    currency: 'NZD',
    symbol: '$',
    defaultTaxYear: '2026-2027',
    rulesetId: 'NZ-IRD-2026.2',
    sourceAuthority: 'Inland Revenue (Te Tari Taake)',
  },
  ES: {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    currency: 'EUR',
    symbol: '€',
    defaultTaxYear: '2026',
    rulesetId: 'ES-AEAT-2026.2',
    sourceAuthority: 'Agencia Tributaria (AEAT)',
  },
  IT: {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    currency: 'EUR',
    symbol: '€',
    defaultTaxYear: '2026',
    rulesetId: 'IT-ENTRATE-2026.2',
    sourceAuthority: 'Agenzia delle Entrate',
  },
  ZA: {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    currency: 'ZAR',
    symbol: 'R',
    defaultTaxYear: '2026-2027',
    rulesetId: 'ZA-SARS-2026.2',
    sourceAuthority: 'South African Revenue Service (SARS)',
  },
  BR: {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    currency: 'BRL',
    symbol: 'R$',
    defaultTaxYear: '2026',
    rulesetId: 'BR-RFB-2026.2',
    sourceAuthority: 'Receita Federal do Brasil (RFB)',
  },
  MX: {
    code: 'MX',
    name: 'Mexico',
    flag: '🇲🇽',
    currency: 'MXN',
    symbol: '$',
    defaultTaxYear: '2026',
    rulesetId: 'MX-SAT-2026.2',
    sourceAuthority: 'Servicio de Administración Tributaria (SAT)',
  },
  KR: {
    code: 'KR',
    name: 'South Korea',
    flag: '🇰🇷',
    currency: 'KRW',
    symbol: '₩',
    defaultTaxYear: '2026',
    rulesetId: 'KR-NTS-2026.2',
    sourceAuthority: 'National Tax Service (NTS)',
  },
};

interface CountryConfig {
  code: string;
  name: string;
  slug: string;
  tool: React.ComponentType;
  seo: React.ComponentType;
  meta: CountryMetadata;
}

export const COUNTRY_REGISTRY: Record<string, CountryConfig> = {
  'pakistan': {
    code: 'PK',
    name: 'Pakistan',
    slug: 'pakistan',
    tool: PakistanSalaryCalculator,
    seo: PakistanSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.PK,
  },
  'united-states': {
    code: 'US',
    name: 'United States',
    slug: 'united-states',
    tool: UnitedStatesSalaryCalculator,
    seo: UnitedStatesSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.US,
  },
  'united-kingdom': {
    code: 'GB',
    name: 'United Kingdom',
    slug: 'united-kingdom',
    tool: UnitedKingdomSalaryCalculator,
    seo: UnitedKingdomSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.GB,
  },
  'germany': {
    code: 'DE',
    name: 'Germany',
    slug: 'germany',
    tool: GermanySalaryCalculator,
    seo: GermanySalaryCalculatorSeo,
    meta: COUNTRY_METADATA.DE,
  },
  'india': {
    code: 'IN',
    name: 'India',
    slug: 'india',
    tool: IndiaSalaryCalculator,
    seo: IndiaSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.IN,
  },
  'canada': {
    code: 'CA',
    name: 'Canada',
    slug: 'canada',
    tool: CanadaSalaryCalculator,
    seo: CanadaSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.CA,
  },
  'australia': {
    code: 'AU',
    name: 'Australia',
    slug: 'australia',
    tool: AustraliaSalaryCalculator,
    seo: AustraliaSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.AU,
  },
  'singapore': {
    code: 'SG',
    name: 'Singapore',
    slug: 'singapore',
    tool: SingaporeSalaryCalculator,
    seo: SingaporeSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.SG,
  },
  'united-arab-emirates': {
    code: 'AE',
    name: 'United Arab Emirates',
    slug: 'united-arab-emirates',
    tool: UnitedArabEmiratesSalaryCalculator,
    seo: UnitedArabEmiratesSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.AE,
  },
  'saudi-arabia': {
    code: 'SA',
    name: 'Saudi Arabia',
    slug: 'saudi-arabia',
    tool: SaudiArabiaSalaryCalculator,
    seo: SaudiArabiaSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.SA,
  },
  'france': {
    code: 'FR',
    name: 'France',
    slug: 'france',
    tool: FranceSalaryCalculator,
    seo: FranceSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.FR,
  },
  'japan': {
    code: 'JP',
    name: 'Japan',
    slug: 'japan',
    tool: JapanSalaryCalculator,
    seo: JapanSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.JP,
  },
  'switzerland': {
    code: 'CH',
    name: 'Switzerland',
    slug: 'switzerland',
    tool: SwitzerlandSalaryCalculator,
    seo: SwitzerlandSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.CH,
  },
  'netherlands': {
    code: 'NL',
    name: 'Netherlands',
    slug: 'netherlands',
    tool: NetherlandsSalaryCalculator,
    seo: NetherlandsSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.NL,
  },
  'ireland': {
    code: 'IE',
    name: 'Ireland',
    slug: 'ireland',
    tool: IrelandSalaryCalculator,
    seo: IrelandSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.IE,
  },
  'new-zealand': {
    code: 'NZ',
    name: 'New Zealand',
    slug: 'new-zealand',
    tool: NewZealandSalaryCalculator,
    seo: NewZealandSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.NZ,
  },
  'spain': {
    code: 'ES',
    name: 'Spain',
    slug: 'spain',
    tool: SpainSalaryCalculator,
    seo: SpainSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.ES,
  },
  'italy': {
    code: 'IT',
    name: 'Italy',
    slug: 'italy',
    tool: ItalySalaryCalculator,
    seo: ItalySalaryCalculatorSeo,
    meta: COUNTRY_METADATA.IT,
  },
  'south-africa': {
    code: 'ZA',
    name: 'South Africa',
    slug: 'south-africa',
    tool: SouthAfricaSalaryCalculator,
    seo: SouthAfricaSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.ZA,
  },
  'brazil': {
    code: 'BR',
    name: 'Brazil',
    slug: 'brazil',
    tool: BrazilSalaryCalculator,
    seo: BrazilSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.BR,
  },
  'mexico': {
    code: 'MX',
    name: 'Mexico',
    slug: 'mexico',
    tool: MexicoSalaryCalculator,
    seo: MexicoSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.MX,
  },
  'south-korea': {
    code: 'KR',
    name: 'South Korea',
    slug: 'south-korea',
    tool: SouthKoreaSalaryCalculator,
    seo: SouthKoreaSalaryCalculatorSeo,
    meta: COUNTRY_METADATA.KR,
  },
};

type PageProps = {
  params: Promise<{
    category: string;
    slug: string;
    country: string;
  }>;
};

const DEFAULT_TAX_YEARS: Record<string, string> = {
  PK: '2026-2027',
  US: '2026',
  GB: '2026-2027',
  DE: '2026',
  IN: 'FY 2025-2026 (AY 2026-2027)',
  CA: '2026',
  AU: '2026-2027',
  SG: 'YA 2026',
  AE: '2026',
  SA: '2026',
  FR: '2026',
  JP: '2026',
  CH: '2026',
  NL: '2026',
  IE: '2026',
  NZ: '2026-2027',
  ES: '2026',
  IT: '2026',
  ZA: '2026-2027',
  BR: '2026',
  MX: '2026',
  KR: '2026',
};

export function buildCountryProgrammaticKeywords(
  countryName = '',
  currency = '',
  taxYear = '',
  authority = '',
  rulesetId = ''
): string[] {
  const lower = String(countryName || '').toLowerCase();
  const curLower = String(currency || '').toLowerCase();
  const cleanAuth = String(authority || '').replace(/[()]/g, '').trim();
  return [
    `${countryName} salary calculator`,
    `${countryName} take home pay ${taxYear}`,
    `${countryName} income tax calculator`,
    `${currency} net salary calculator`,
    `${lower} income tax calculator`,
    `${lower} gross to net salary ${currency}`,
    `${lower} paycheck tax calculator`,
    `${lower} payroll cost calculator`,
    `${lower} salary calculator`,
    `${lower} take home pay calculator ${taxYear}`,
    `${lower} income tax calculator ${taxYear}`,
    `${lower} gross to net salary calculator ${curLower}`,
    `${lower} net salary calculator after tax and social security`,
    `${lower} paycheck calculator monthly biweekly weekly daily hourly`,
    `${lower} total employer cost of employment ctc calculator`,
    `${lower} progressive tax brackets and marginal vs effective tax rate`,
    `${lower} statutory payroll deduction ledger ${rulesetId.toLowerCase()}`,
    `${lower} salary after tax ${currency} ${taxYear} ${cleanAuth.toLowerCase()}`,
    `calculate net take home pay in ${lower} from gross salary`,
    `${lower} employee social security and employer payroll contribution calculator`,
    `${lower} annual to monthly and hourly net wage converter`,
    `${lower} tax free allowance and progressive slab breakdown ${taxYear}`,
    `free client side ${lower} salary and payroll tax calculator no signup`,
    `${lower} expatriate and resident net salary comparison ${currency}`,
    `${lower} job offer gross to net paycheck estimator ${taxYear}`,
    `${lower} biweekly 26 pay periods vs monthly 12 pay periods calculator`,
    `${lower} daily rate 260 working days and hourly rate 2080 hours tax`,
    `${lower} statutory income tax reconciliation table csv export`,
    `how much tax do i pay on my salary in ${lower} ${taxYear}`,
    `${lower} effective tax rate vs marginal tax bracket calculator`,
    `${lower} employer social insurance surcharge and payroll overhead`,
    `${lower} private in-browser salary tax calculator zero data logging`,
    `${lower} talent.com and adp paycheck calculator free alternative`,
    `${lower} glassdoor and payscale gross to net take home alternative`,
    `${lower} statutory tax ruleset ${rulesetId} verified payroll model`,
    `${lower} remote worker and software engineer net salary calculator`,
    `${lower} overtime bonus and gross compensation tax withholding`,
    `${lower} ${currency} payslip generator and tax audit breakdown ${taxYear}`,
  ];
}

export function generateStaticParams() {
  return Object.keys(COUNTRY_REGISTRY).map((country) => ({
    category: 'finance',
    slug: 'salary-calculator',
    country,
  }));
}

export const COUNTRY_SEO_META: Record<string, { title: string; description: string }> = {
  'pakistan': {
    title: 'Salary Tax Calculator Pakistan 2026-27 (FBR)',
    description: 'Calculate monthly in-hand salary and FBR income tax in Pakistan (PKR) for FY 2026-2027. Includes latest FBR salaried tax slabs, surcharge, and EOBI net pay.',
  },
  'united-states': {
    title: 'US Salary Paycheck Calculator 2026 — Net Pay',
    description: 'Calculate US take-home pay in USD across all 50 states and DC for 2026. Includes IRS federal tax brackets, standard deduction, state tax, FICA, and Medicare.',
  },
  'united-kingdom': {
    title: 'UK Salary Calculator 2026/27 — Take-Home Pay',
    description: 'Calculate UK net take-home pay in GBP for 2026/27. Includes HMRC PAYE bands (England, Wales, NI & Scotland), £12,570 allowance taper, and Class 1 NI rates.',
  },
  'germany': {
    title: 'Germany Salary Calculator 2026 (Brutto Netto)',
    description: 'Calculate German net salary (Brutto Netto Rechner) in EUR for 2026 across Tax Classes I–VI. Includes Lohnsteuer, church tax, Soli, and social insurance.',
  },
  'india': {
    title: 'India In-Hand Salary Calculator FY 2026-27',
    description: 'Calculate monthly in-hand salary from CTC in India (INR) for FY 2025-26 / AY 2026-27. Compare New vs Old Tax Regime slabs, Section 87A rebate, EPF, and cess.',
  },
  'canada': {
    title: 'Canada Salary Calculator 2026 — After-Tax Pay',
    description: 'Calculate Canadian take-home pay in CAD for 2026. Includes CRA federal tax brackets (14%–33%), basic personal amount, provincial tax, CPP, and EI premiums.',
  },
  'australia': {
    title: 'Australia Pay Calculator 2026-27 — Take-Home',
    description: 'Calculate Australian take-home pay in AUD for FY 2026-27. Includes ATO Stage 3 resident tax brackets, LITO offset, 2% Medicare levy, and Superannuation.',
  },
  'singapore': {
    title: 'Singapore Salary & CPF Calculator 2026 (SGD)',
    description: 'Calculate Singapore net take-home pay in SGD for YA 2026. Includes IRAS progressive resident tax (2%–24%) and Citizen/PR CPF (20% employee, 17% employer).',
  },
  'united-arab-emirates': {
    title: 'UAE Salary Calculator 2026 — Net Pay in AED',
    description: 'Calculate UAE monthly and annual take-home salary in AED for expats and UAE/GCC nationals. Includes 0% income tax, GPSSA pension, and end-of-service gratuity.',
  },
  'saudi-arabia': {
    title: 'Saudi Arabia Salary & GOSI Calculator 2026',
    description: 'Calculate Saudi Arabia net take-home salary in SAR for Saudi nationals and expats. Includes 0% income tax, GOSI pension & SANED deductions, and employer cost.',
  },
  'france': {
    title: 'France Net Salary Calculator 2026 (Brut/Net)',
    description: 'Calculate French net take-home salary (Salaire Brut en Net) in EUR for 2026. Includes CGI progressive income tax (0%–45%), 10% deduction, and social charges.',
  },
  'japan': {
    title: 'Japan Take-Home Salary Calculator 2026 (JPY)',
    description: 'Calculate Japan net salary in JPY for 2026. Includes employment income deduction, NTA national income tax, 10% resident tax, and Shakai Hoken social insurance.',
  },
  'switzerland': {
    title: 'Switzerland Net Salary Calculator 2026 (CHF)',
    description: 'Calculate Swiss gross-to-net salary in CHF for 2026. Includes federal & cantonal tax benchmarks, AHV/IV/EO, ALV unemployment, and BVG pension deductions.',
  },
  'netherlands': {
    title: 'Netherlands Net Salary Calculator 2026 (EUR)',
    description: 'Calculate Dutch gross-to-net pay (Bruto Netto) in EUR for 2026. Includes Belastingdienst Box 1 tax brackets, general & labor tax credits, and 30% ruling.',
  },
  'ireland': {
    title: 'Ireland Salary After Tax Calculator 2026',
    description: 'Calculate Irish net take-home pay in EUR for 2026. Includes Revenue PAYE 20% and 40% tax bands, Universal Social Charge (USC), PRSI, and €4,000 tax credits.',
  },
  'new-zealand': {
    title: 'New Zealand PAYE Salary Calculator 2026-27',
    description: 'Calculate NZ take-home pay in NZD for 2026-27. Includes IRD progressive PAYE income tax brackets (10.5%–39%), ACC Earners Levy, and KiwiSaver (0%–10%).',
  },
  'spain': {
    title: 'Spain Salary Calculator 2026 (Sueldo Neto)',
    description: 'Calculate Spanish net salary (Calculadora Sueldo Bruto a Neto) in EUR for 2026. Includes progressive IRPF income tax bands and Seguridad Social deductions.',
  },
  'italy': {
    title: 'Italy Net Salary Calculator 2026 (Stipendio)',
    description: 'Calculate Italian net take-home pay (Calcolo Stipendio Netto) in EUR for 2026. Includes 3-band IRPEF income tax, INPS social contributions, and surcharges.',
  },
  'south-africa': {
    title: 'South Africa Tax & Salary Calculator 2026',
    description: 'Calculate South African net take-home pay in ZAR for 2026/27. Includes SARS 7-bracket PAYE income tax, Primary Tax Rebate (R 17,235), 1% UIF, and 1% SDL.',
  },
  'brazil': {
    title: 'Brazil CLT Net Salary Calculator 2026 (BRL)',
    description: 'Calculate Brazilian net salary (Salário Líquido CLT) in BRL for 2026. Includes progressive INSS social security, IRRF withholding tax, and employer FGTS.',
  },
  'mexico': {
    title: 'Mexico Net Salary & ISR Tax Calculator 2026',
    description: 'Calculate Mexican net take-home salary (Sueldo Neto) in MXN for 2026. Includes SAT 11-bracket ISR income tax tariff, IMSS employee quotas, and employer cost.',
  },
  'south-korea': {
    title: 'South Korea Net Salary Calculator 2026 (KRW)',
    description: 'Calculate South Korean take-home pay in KRW for 2026. Includes NTS 8-bracket income tax, 10% local tax, National Pension, and health/employment insurance.',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug, country } = await params;

  if (category !== 'finance' || slug !== 'salary-calculator') {
    return {
      title: 'Not Found',
      description: 'The requested salary calculator could not be found.',
    };
  }

  const entry = COUNTRY_REGISTRY[country];
  if (!entry) {
    return {
      title: 'Jurisdiction Not Found',
      description: 'The requested country salary calculator is not supported.',
    };
  }

  const taxYear = (entry.meta && entry.meta.defaultTaxYear) || DEFAULT_TAX_YEARS[entry.code] || '2026';
  const seoEntry = COUNTRY_SEO_META[entry.slug];
  const title = seoEntry?.title || `${entry.name} Salary Calculator ${taxYear} — Take-Home Pay`;
  const description =
    seoEntry?.description ||
    `Calculate ${entry.name} salary take-home pay in ${entry.meta.currency} using ${taxYear} statutory income tax brackets, employee social contributions, and employer payroll cost.`;
  const canonicalUrl = `${SITE_URL}/finance/salary-calculator/${entry.slug}`;

  return {
    title,
    description,
    keywords: buildCountryProgrammaticKeywords(
      entry.name,
      entry.meta.currency,
      taxYear,
      String(entry.meta.sourceAuthority || ''),
      String(entry.meta.rulesetId || entry.code)
    ),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${title} — KivaroTools`,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@kivarotools',
      creator: '@kivarotools',
      title: `${title} — KivaroTools`,
      description,
      images: [`${SITE_URL}/og-image.png`],
    },
  };
}

export default async function CountrySalaryCalculatorPage({ params }: PageProps) {
  const { category, slug, country } = await params;

  if (category !== 'finance' || slug !== 'salary-calculator') {
    notFound();
  }

  const entry = COUNTRY_REGISTRY[country];
  if (!entry) {
    notFound();
  }

  const ToolComponent = entry.tool;
  const SeoComponent = entry.seo;
  const taxYear = (entry.meta && entry.meta.defaultTaxYear) || DEFAULT_TAX_YEARS[entry.code] || '2026';
  const toolName = `${entry.name} Salary Calculator ${taxYear}`;
  const toolDescription = `Calculate ${entry.name} salary take-home pay in ${entry.meta.currency} using applicable ${taxYear} statutory income tax, employee contributions, and payroll rules. See gross pay, deductions, net salary, and employer cost.`;
  const canonicalUrl = `${SITE_URL}/finance/salary-calculator/${entry.slug}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Finance & Calculators', item: `${SITE_URL}/finance` },
      { '@type': 'ListItem', position: 3, name: 'Salary Calculator', item: `${SITE_URL}/finance/salary-calculator` },
      { '@type': 'ListItem', position: 4, name: entry.name, item: canonicalUrl },
    ],
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] py-8 sm:py-12 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Structured Data (GEO / AEO) */}
          <SchemaMarkup
            name={toolName}
            description={toolDescription}
            category="finance"
            applicationCategory="FinanceApplication"
            url={canonicalUrl}
            featureList={[
              `${entry.name} ${taxYear} statutory income tax bracket calculation (${entry.meta.currency})`,
              `Employee social security and mandatory statutory contribution breakdown`,
              `Annual, Monthly, Biweekly, Weekly, Daily, and Hourly pay period normalization`,
              `Total Employer Cost of Employment reconciliation and CSV payroll export`,
            ]}
            keywords={buildCountryProgrammaticKeywords(
              entry.name,
              entry.meta.currency,
              taxYear,
              String(entry.meta.sourceAuthority || ''),
              String(entry.meta.rulesetId || entry.code)
            )}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(breadcrumbSchema),
            }}
          />

          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <li>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  <span>Home</span>
                </Link>
              </li>

              <li aria-hidden="true">
                <ChevronRight className="h-4 w-4" />
              </li>

              <li>
                <Link
                  href="/finance"
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Finance
                </Link>
              </li>

              <li aria-hidden="true">
                <ChevronRight className="h-4 w-4" />
              </li>

              <li>
                <Link
                  href="/finance/salary-calculator"
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Salary Calculator
                </Link>
              </li>

              <li aria-hidden="true">
                <ChevronRight className="h-4 w-4" />
              </li>

              <li aria-current="page" className="text-slate-800 dark:text-slate-200 font-semibold">
                {entry.name}
              </li>
            </ol>
          </nav>

          {/* Top Advertisement */}
          <AdUnit slotId={process.env.NEXT_PUBLIC_ADSENSE_TOP_SLOT || ""} />

          {/* Page Header */}
          <header className="mx-auto my-8 max-w-4xl text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
              {entry.name} Salary Calculator {taxYear}
            </h1>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400 sm:text-lg">
              Calculate {entry.name} net take-home pay, statutory deductions, income tax, and employer contributions in {entry.meta.currency} for {taxYear}.
            </p>
          </header>

          {/* Main Country Tool Component */}
          <main className="mb-12">
            <h2 className="sr-only">{toolName} Interactive Workspace</h2>
            <ToolComponent />
          </main>

          {/* Bottom Advertisement */}
          <AdUnit slotId={process.env.NEXT_PUBLIC_ADSENSE_BOTTOM_SLOT || ""} />

          {/* Country SEO & Educational Methodology Component */}
          <section className="mt-12" aria-label="Statutory Methodology and Ruleset Documentation">
            <SeoComponent />
          </section>

          {/* Explore All 22 Country Salary & Tax Calculators */}
          <section className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-10" aria-label="Global Salary & Tax Calculators">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl mb-4">
              Explore All 22 Country Salary & Tax Calculators
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Compare take-home pay, statutory income tax brackets, social contributions, and payroll overhead across global jurisdictions:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.values(COUNTRY_REGISTRY).map((item) => (
                <Link
                  key={item.slug}
                  href={`/finance/salary-calculator/${item.slug}`}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-all ${
                    item.slug === entry.slug
                      ? 'border-blue-600 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-400 font-semibold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-400'
                  }`}
                >
                  <span className="text-base leading-none">{item.meta.flag}</span>
                  <span className="truncate">{item.name}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
