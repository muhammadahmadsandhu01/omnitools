import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import AdUnit from '@/components/ads/AdUnit';
import { SITE_URL } from '@/config/site';

// 22 Country Calculators
import PakistanSalaryCalculator, { PK_METADATA } from '@/components/tools/salary/PakistanSalaryCalculator';
import UnitedStatesSalaryCalculator, { METADATA as US_METADATA } from '@/components/tools/salary/UnitedStatesSalaryCalculator';
import UnitedKingdomSalaryCalculator, { METADATA as GB_METADATA } from '@/components/tools/salary/UnitedKingdomSalaryCalculator';
import GermanySalaryCalculator, { METADATA as DE_METADATA } from '@/components/tools/salary/GermanySalaryCalculator';
import IndiaSalaryCalculator, { METADATA as IN_METADATA } from '@/components/tools/salary/IndiaSalaryCalculator';
import CanadaSalaryCalculator, { METADATA as CA_METADATA } from '@/components/tools/salary/CanadaSalaryCalculator';
import AustraliaSalaryCalculator, { METADATA as AU_METADATA } from '@/components/tools/salary/AustraliaSalaryCalculator';
import SingaporeSalaryCalculator, { METADATA as SG_METADATA } from '@/components/tools/salary/SingaporeSalaryCalculator';
import UnitedArabEmiratesSalaryCalculator, { METADATA as AE_METADATA } from '@/components/tools/salary/UnitedArabEmiratesSalaryCalculator';
import SaudiArabiaSalaryCalculator, { METADATA as SA_METADATA } from '@/components/tools/salary/SaudiArabiaSalaryCalculator';
import FranceSalaryCalculator, { METADATA as FR_METADATA } from '@/components/tools/salary/FranceSalaryCalculator';
import JapanSalaryCalculator, { METADATA as JP_METADATA } from '@/components/tools/salary/JapanSalaryCalculator';
import SwitzerlandSalaryCalculator, { METADATA as CH_METADATA } from '@/components/tools/salary/SwitzerlandSalaryCalculator';
import NetherlandsSalaryCalculator, { METADATA as NL_METADATA } from '@/components/tools/salary/NetherlandsSalaryCalculator';
import IrelandSalaryCalculator, { METADATA as IE_METADATA } from '@/components/tools/salary/IrelandSalaryCalculator';
import NewZealandSalaryCalculator, { METADATA as NZ_METADATA } from '@/components/tools/salary/NewZealandSalaryCalculator';
import SpainSalaryCalculator, { METADATA as ES_METADATA } from '@/components/tools/salary/SpainSalaryCalculator';
import ItalySalaryCalculator, { METADATA as IT_METADATA } from '@/components/tools/salary/ItalySalaryCalculator';
import SouthAfricaSalaryCalculator, { METADATA as ZA_METADATA } from '@/components/tools/salary/SouthAfricaSalaryCalculator';
import BrazilSalaryCalculator, { METADATA as BR_METADATA } from '@/components/tools/salary/BrazilSalaryCalculator';
import MexicoSalaryCalculator, { METADATA as MX_METADATA } from '@/components/tools/salary/MexicoSalaryCalculator';
import SouthKoreaSalaryCalculator, { METADATA as KR_METADATA } from '@/components/tools/salary/SouthKoreaSalaryCalculator';

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

interface CountryConfig {
  code: string;
  name: string;
  slug: string;
  tool: React.ComponentType;
  seo: React.ComponentType;
  meta: {
    name?: string;
    countryName?: string;
    flag: string;
    currency: string;
    defaultTaxYear: string;
    calculationScope: string;
    [key: string]: unknown;
  };
}

export const COUNTRY_REGISTRY: Record<string, CountryConfig> = {
  'pakistan': {
    code: 'PK',
    name: 'Pakistan',
    slug: 'pakistan',
    tool: PakistanSalaryCalculator,
    seo: PakistanSalaryCalculatorSeo,
    meta: PK_METADATA,
  },
  'united-states': {
    code: 'US',
    name: 'United States',
    slug: 'united-states',
    tool: UnitedStatesSalaryCalculator,
    seo: UnitedStatesSalaryCalculatorSeo,
    meta: US_METADATA,
  },
  'united-kingdom': {
    code: 'GB',
    name: 'United Kingdom',
    slug: 'united-kingdom',
    tool: UnitedKingdomSalaryCalculator,
    seo: UnitedKingdomSalaryCalculatorSeo,
    meta: GB_METADATA,
  },
  'germany': {
    code: 'DE',
    name: 'Germany',
    slug: 'germany',
    tool: GermanySalaryCalculator,
    seo: GermanySalaryCalculatorSeo,
    meta: DE_METADATA,
  },
  'india': {
    code: 'IN',
    name: 'India',
    slug: 'india',
    tool: IndiaSalaryCalculator,
    seo: IndiaSalaryCalculatorSeo,
    meta: IN_METADATA,
  },
  'canada': {
    code: 'CA',
    name: 'Canada',
    slug: 'canada',
    tool: CanadaSalaryCalculator,
    seo: CanadaSalaryCalculatorSeo,
    meta: CA_METADATA,
  },
  'australia': {
    code: 'AU',
    name: 'Australia',
    slug: 'australia',
    tool: AustraliaSalaryCalculator,
    seo: AustraliaSalaryCalculatorSeo,
    meta: AU_METADATA,
  },
  'singapore': {
    code: 'SG',
    name: 'Singapore',
    slug: 'singapore',
    tool: SingaporeSalaryCalculator,
    seo: SingaporeSalaryCalculatorSeo,
    meta: SG_METADATA,
  },
  'united-arab-emirates': {
    code: 'AE',
    name: 'United Arab Emirates',
    slug: 'united-arab-emirates',
    tool: UnitedArabEmiratesSalaryCalculator,
    seo: UnitedArabEmiratesSalaryCalculatorSeo,
    meta: AE_METADATA,
  },
  'saudi-arabia': {
    code: 'SA',
    name: 'Saudi Arabia',
    slug: 'saudi-arabia',
    tool: SaudiArabiaSalaryCalculator,
    seo: SaudiArabiaSalaryCalculatorSeo,
    meta: SA_METADATA,
  },
  'france': {
    code: 'FR',
    name: 'France',
    slug: 'france',
    tool: FranceSalaryCalculator,
    seo: FranceSalaryCalculatorSeo,
    meta: FR_METADATA,
  },
  'japan': {
    code: 'JP',
    name: 'Japan',
    slug: 'japan',
    tool: JapanSalaryCalculator,
    seo: JapanSalaryCalculatorSeo,
    meta: JP_METADATA,
  },
  'switzerland': {
    code: 'CH',
    name: 'Switzerland',
    slug: 'switzerland',
    tool: SwitzerlandSalaryCalculator,
    seo: SwitzerlandSalaryCalculatorSeo,
    meta: CH_METADATA,
  },
  'netherlands': {
    code: 'NL',
    name: 'Netherlands',
    slug: 'netherlands',
    tool: NetherlandsSalaryCalculator,
    seo: NetherlandsSalaryCalculatorSeo,
    meta: NL_METADATA,
  },
  'ireland': {
    code: 'IE',
    name: 'Ireland',
    slug: 'ireland',
    tool: IrelandSalaryCalculator,
    seo: IrelandSalaryCalculatorSeo,
    meta: IE_METADATA,
  },
  'new-zealand': {
    code: 'NZ',
    name: 'New Zealand',
    slug: 'new-zealand',
    tool: NewZealandSalaryCalculator,
    seo: NewZealandSalaryCalculatorSeo,
    meta: NZ_METADATA,
  },
  'spain': {
    code: 'ES',
    name: 'Spain',
    slug: 'spain',
    tool: SpainSalaryCalculator,
    seo: SpainSalaryCalculatorSeo,
    meta: ES_METADATA,
  },
  'italy': {
    code: 'IT',
    name: 'Italy',
    slug: 'italy',
    tool: ItalySalaryCalculator,
    seo: ItalySalaryCalculatorSeo,
    meta: IT_METADATA,
  },
  'south-africa': {
    code: 'ZA',
    name: 'South Africa',
    slug: 'south-africa',
    tool: SouthAfricaSalaryCalculator,
    seo: SouthAfricaSalaryCalculatorSeo,
    meta: ZA_METADATA,
  },
  'brazil': {
    code: 'BR',
    name: 'Brazil',
    slug: 'brazil',
    tool: BrazilSalaryCalculator,
    seo: BrazilSalaryCalculatorSeo,
    meta: BR_METADATA,
  },
  'mexico': {
    code: 'MX',
    name: 'Mexico',
    slug: 'mexico',
    tool: MexicoSalaryCalculator,
    seo: MexicoSalaryCalculatorSeo,
    meta: MX_METADATA,
  },
  'south-korea': {
    code: 'KR',
    name: 'South Korea',
    slug: 'south-korea',
    tool: SouthKoreaSalaryCalculator,
    seo: SouthKoreaSalaryCalculatorSeo,
    meta: KR_METADATA,
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

export function generateStaticParams() {
  return Object.keys(COUNTRY_REGISTRY).map((country) => ({
    category: 'finance',
    slug: 'salary-calculator',
    country,
  }));
}

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
  const title = `${entry.name} Salary Calculator ${taxYear}`;
  const description = `Calculate ${entry.name} salary take-home pay using applicable ${taxYear} statutory income tax, employee contributions, and payroll rules. See gross pay, deductions, net salary, and employer cost.`;
  const canonicalUrl = `/finance/salary-calculator/${entry.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${entry.name} Salary Calculator ${taxYear} — KivaroTools`,
      description,
      url: canonicalUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${entry.name} Salary Calculator ${taxYear}`,
    url: `${SITE_URL}/finance/salary-calculator/${entry.slug}`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    description: `Calculate ${entry.name} net take-home pay, statutory deductions, income tax, and employer contributions for ${taxYear}.`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: entry.meta?.currency || 'USD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] py-8 sm:py-12 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
          <AdUnit slotId="TOP_AD_SLOT" />

          {/* Page Header */}
          <header className="mx-auto my-8 max-w-4xl text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
              {entry.name} Salary Calculator {taxYear}
            </h1>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400 sm:text-lg">
              Calculate {entry.name} net take-home pay, statutory deductions, income tax, and employer contributions for {taxYear}.
            </p>
          </header>

          {/* Main Country Tool Component */}
          <main className="mb-12">
            <ToolComponent />
          </main>

          {/* Bottom Advertisement */}
          <AdUnit slotId="BOTTOM_AD_SLOT" />

          {/* Country SEO & Educational Methodology Component */}
          <section className="mt-12" aria-label="Statutory Methodology and Ruleset Documentation">
            <SeoComponent />
          </section>
        </div>
      </div>
    </>
  );
}
