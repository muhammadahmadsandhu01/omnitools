import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ChevronRight, Home, CheckCircle2, ShieldCheck, Globe } from 'lucide-react';

import { categories, tools, getRelatedTools } from '@/config/toolsData';
import AdUnit from '@/components/ads/AdUnit';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/config/site';

import { toolComponents, seoComponents } from '@/config/toolRegistry';
import SchemaMarkup from '@/components/SchemaMarkup';

type PageProps = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

const CATEGORY_TO_SCHEMA_APP_CATEGORY: Record<string, string> = {
  finance: 'FinanceApplication',
  developer: 'DeveloperApplication',
  document: 'BusinessApplication',
  media: 'MultimediaApplication',
  seo: 'UtilitiesApplication',
};

const SALARY_COUNTRIES = [
  { slug: 'united-states', name: 'United States (IRS Federal, FICA & State)' },
  { slug: 'united-kingdom', name: 'United Kingdom (HMRC PAYE & NI)' },
  { slug: 'germany', name: 'Germany (Brutto-Netto & Steuerklasse)' },
  { slug: 'canada', name: 'Canada (CRA Federal, Provincial, CPP & EI)' },
  { slug: 'australia', name: 'Australia (ATO Stage 3, Medicare & Super)' },
  { slug: 'india', name: 'India (Section 115BAC New vs Old Regime)' },
  { slug: 'pakistan', name: 'Pakistan (FBR Salaried Slabs & Surcharge)' },
  { slug: 'united-arab-emirates', name: 'United Arab Emirates (Tax-Free & Gratuity)' },
  { slug: 'saudi-arabia', name: 'Saudi Arabia (GOSI & Expat Net Pay)' },
  { slug: 'singapore', name: 'Singapore (IRAS Resident & CPF Board)' },
  { slug: 'france', name: 'France (Salaire Brut en Net & CSG/CRDS)' },
  { slug: 'japan', name: 'Japan (National/Prefectural Tax & Social Ins.)' },
  { slug: 'switzerland', name: 'Switzerland (Federal, Cantonal & AHV/IV)' },
  { slug: 'netherlands', name: 'Netherlands (Box 1 & 30% Expat Ruling)' },
  { slug: 'ireland', name: 'Ireland (PAYE, USC & PRSI Waterfall)' },
  { slug: 'new-zealand', name: 'New Zealand (IRD Brackets, ACC & KiwiSaver)' },
  { slug: 'spain', name: 'Spain (IRPF & Seguridad Social)' },
  { slug: 'italy', name: 'Italy (IRPEF, Regional & INPS)' },
  { slug: 'south-africa', name: 'South Africa (SARS PAYE, Rebates & UIF)' },
  { slug: 'brazil', name: 'Brazil (IRPF & INSS Progressive Deduction)' },
  { slug: 'mexico', name: 'Mexico (ISR & IMSS Payroll Withholding)' },
  { slug: 'south-korea', name: 'South Korea (NTS Progressive Tax & 4 Major Ins.)' },
] as const;

export function generateStaticParams() {
  return tools
    .filter((tool) => tool.status === 'published' && !tool.hidden)
    .map((tool) => ({
      category: tool.categoryId,
      slug: tool.slug,
    }));
}

export function resolveCanonicalRoute(category: string, slug: string): {
  resolvedCategory: string;
  resolvedSlug: string;
} {
  if (category === 'dev' && slug === 'urandom') {
    return { resolvedCategory: 'developer', resolvedSlug: 'password-generator' };
  }

  if (slug === 'auto-loan-calculator') {
    return { resolvedCategory: 'finance', resolvedSlug: 'emi-calculator' };
  }

  const resolvedSlug =
    slug === 'webp-converter'
      ? 'webp-to-jpg-png'
      : slug === 'case-converter'
        ? 'text-case-converter'
        : slug === 'currency-converter'
          ? 'crypto-converter'
          : slug === 'meta-tags-generator' || slug === 'open-graph-generator'
            ? 'meta-generator'
            : slug === 'pdf-to-docx'
              ? 'pdf-to-word'
              : slug === 'docx-to-pdf'
                ? 'word-to-pdf'
                : slug === 'pdf-to-xlsx'
                  ? 'pdf-to-excel'
                  : slug === 'xlsx-to-pdf'
                    ? 'excel-to-pdf'
                    : slug === 'pdf-to-pptx' || slug === 'pdf-to-powerpoint'
                      ? 'pdf-to-ppt'
                      : slug === 'pdf-to-png' || slug === 'pdf-to-image'
                        ? 'pdf-to-jpg'
                        : slug === 'pdf-compressor' ||
                          slug === 'reduce-pdf-size' ||
                          slug === 'shrink-pdf' ||
                          slug === 'compress-pdf-to-100kb' ||
                          slug === 'compress-pdf-to-200kb'
                          ? 'compress-pdf'
                          : slug === 'pdf-redactor' ||
                            slug === 'pdf-pii-scrubber' ||
                            slug === 'bank-statement-redactor' ||
                            slug === 'invoice-redactor' ||
                            slug === 'redact-pdf'
                            ? 'pdf-scrubber'
                            : slug === 'parquet-to-csv' ||
                              slug === 'avro-viewer' ||
                              slug === 'avro-to-json' ||
                              slug === 'avro-to-csv' ||
                              slug === 'feather-viewer' ||
                              slug === 'arrow-viewer' ||
                              slug === 'feather-to-csv'
                              ? 'parquet-viewer'
                              : slug === 'har-viewer' ||
                                slug === 'har-sanitizer' ||
                                slug === 'har-to-k6' ||
                                slug === 'har-to-playwright' ||
                                slug === 'har-to-openapi' ||
                                slug === 'saml-har-analyzer'
                                ? 'har-analyzer'
                                : slug === 'llms-txt-validator' ||
                                  slug === 'llms-full-txt-generator' ||
                                  slug === 'ai-robots-txt-generator' ||
                                  slug === 'ai-crawler-generator' ||
                                  slug === 'tdmrep-generator'
                                  ? 'llms-txt-generator'
                                  : slug === 'sqlite-browser' ||
                                    slug === 'duckdb-viewer' ||
                                    slug === 'sqlite-online' ||
                                    slug === 'db-file-viewer' ||
                                    slug === 'sqlite-erd-generator' ||
                                    slug === 'sqlite-to-postgres'
                                    ? 'sqlite-viewer'
                                    : slug === 'startup-runway-calculator' ||
                                      slug === 'safe-dilution-calculator' ||
                                      slug === 'cap-table-simulator' ||
                                      slug === 'default-alive-calculator' ||
                                      slug === 'burn-multiple-calculator' ||
                                      slug === 'liquidation-preference-calculator'
                                      ? 'saas-burn-rate-calculator'
                                      : slug === '1099-vs-w2-calculator' ||
                                        slug === 'w2-to-1099-calculator' ||
                                        slug === 'ir35-calculator' ||
                                        slug === 's-corp-tax-calculator' ||
                                        slug === 't4-vs-incorporated-calculator' ||
                                        slug === 'eor-cost-calculator'
                                        ? 'contractor-vs-employee-calculator'
                                        : slug === 'openapi-to-zod' ||
                                          slug === 'swagger-to-typescript' ||
                                          slug === 'swagger-to-zod' ||
                                          slug === 'openapi-mock-generator' ||
                                          slug === 'openapi-msw-generator' ||
                                          slug === 'openapi-tanstack-query-generator'
                                          ? 'openapi-to-typescript'
                                          : slug === 'heic-to-png' ||
                                            slug === 'avif-to-jpg' ||
                                            slug === 'avif-to-png' ||
                                            slug === 'heic-converter' ||
                                            slug === 'avif-converter' ||
                                            slug === 'heif-to-jpg'
                                            ? 'heic-to-jpg'
                                            : slug === 'paseto-debugger' ||
                                              slug === 'saml-decoder' ||
                                              slug === 'saml-debugger' ||
                                              slug === 'jwe-debugger' ||
                                              slug === 'jwk-to-pem' ||
                                              slug === 'jwt-decoder'
                                              ? 'jwt-debugger'
                                              : slug === 'cron-generator' ||
                                                slug === 'crontab-guru' ||
                                                slug === 'quartz-cron-generator' ||
                                                slug === 'aws-eventbridge-cron' ||
                                                slug === 'kubernetes-cronjob-generator' ||
                                                slug === 'cron-to-systemd'
                                                ? 'cron-expression-generator'
                                                : slug === 'sign-pdf' ||
                                                  slug === 'pdf-watermark' ||
                                                  slug === 'bates-numbering-pdf' ||
                                                  slug === 'bates-stamping' ||
                                                  slug === 'pdf-exhibit-stamp' ||
                                                  slug === 'pdf-digital-signer'
                                                  ? 'pdf-signer-bates-stamper'
                                                  : slug;

  // Deterministic lookup of canonical categoryId directly from toolsData.ts
  const canonicalTool = tools.find(
    (item) => item.slug === resolvedSlug && item.status === 'published' && !item.hidden
  );

  const resolvedCategory = canonicalTool
    ? canonicalTool.categoryId
    : category === 'pdf' || category === 'legal'
      ? 'document'
      : category === 'image' || category === 'photo'
        ? 'media'
        : category === 'dev' || category === 'security' || category === 'auth' || category === 'devops'
          ? 'developer'
          : category === 'payroll' || category === 'tax'
            ? 'finance'
            : category;

  return { resolvedCategory, resolvedSlug };
}

/**
 * Generate dynamic SEO metadata for each tool page.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category, slug } = await params;

  if (category === 'health' || slug === 'bmi-calculator') {
    permanentRedirect('/');
  }

  const { resolvedCategory, resolvedSlug } = resolveCanonicalRoute(category, slug);

  const tool =
    tools.find((item) => item.slug === resolvedSlug && item.categoryId === resolvedCategory) ||
    tools.find((item) => item.slug === slug && item.categoryId === category);

  if (!tool || tool.status !== 'published' || tool.hidden) {
    return {
      title: 'Tool Not Found',
      description: 'The requested KivaroTools tool could not be found.',
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const metaTitle = tool.seoTitle || tool.name;
  const metaDescription = tool.seoDescription || tool.description;
  const canonicalUrl = `${SITE_URL}/${resolvedCategory}/${resolvedSlug}`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: tool.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${metaTitle} — KivaroTools`,
      description: metaDescription,
      url: canonicalUrl,
      type: 'website',
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@kivarotools',
      creator: '@kivarotools',
      title: `${metaTitle} — KivaroTools`,
      description: metaDescription,
      images: [`${SITE_URL}/og-image.png`],
    },
  };
}

/**
 * Dynamic tool page.
 */
export default async function ToolPage({ params }: PageProps) {
  const { category, slug } = await params;

  if (category === 'health' || slug === 'bmi-calculator') {
    permanentRedirect('/');
  }

  const { resolvedCategory, resolvedSlug } = resolveCanonicalRoute(category, slug);

  if (category !== resolvedCategory || slug !== resolvedSlug) {
    permanentRedirect(`/${resolvedCategory}/${resolvedSlug}`);
  }

  const tool =
    tools.find((item) => item.slug === resolvedSlug && item.categoryId === resolvedCategory) ||
    tools.find((item) => item.slug === slug && item.categoryId === category);

  const categoryData =
    categories.find((item) => item.id === resolvedCategory) ||
    categories.find((item) => item.id === category);

  if (!tool || !categoryData || tool.status !== 'published' || tool.hidden) {
    notFound();
  }

  const relatedTools = getRelatedTools(tool, 8);

  const ToolComponent =
    toolComponents[resolvedSlug] ||
    toolComponents[tool.slug] ||
    toolComponents[slug];

  const SeoComponent =
    seoComponents[resolvedSlug] ||
    seoComponents[tool.slug] ||
    seoComponents[slug];

  const metaDescription = tool.seoDescription || tool.description;
  const canonicalUrl = `${SITE_URL}/${resolvedCategory}/${resolvedSlug}`;
  const topAdSlot = process.env.NEXT_PUBLIC_ADSENSE_TOP_SLOT || '';
  const bottomAdSlot = process.env.NEXT_PUBLIC_ADSENSE_BOTTOM_SLOT || '';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: categoryData.name, item: `${SITE_URL}/${categoryData.id}` },
      { '@type': 'ListItem', position: 3, name: tool.name, item: canonicalUrl },
    ],
  };

  return (
    <main className="w-full min-w-0 overflow-x-clip">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

        {/* Structured Data (GEO / AEO — Includes aggregateRating & review required by Google/Semrush) */}
        {tool.status === 'published' && (
          <>
            <SchemaMarkup
              name={tool.name}
              description={metaDescription}
              category={resolvedCategory}
              applicationCategory={tool.applicationCategory}
              url={canonicalUrl}
              featureList={tool.featureList}
              keywords={tool.keywords}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(breadcrumbSchema),
              }}
            />
          </>
        )}

        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8"
        >
          <ol className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">

            <li>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Home
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                <span>Home</span>
              </Link>
            </li>

            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>

            <li>
              <Link
                href={`/${categoryData.id}`}
                className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                {categoryData.name}
              </Link>
            </li>

            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>

            <li
              aria-current="page"
              className="text-slate-800 dark:text-slate-200"
            >
              {tool.name}
            </li>

          </ol>
        </nav>

        {/* Tool Header */}
        <header className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            {tool.name}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
            {tool.description}
          </p>

        </header>

        {/* Top Advertisement */}
        <AdUnit slotId={topAdSlot} />

        {/* Tool Workspace */}
        <section
          aria-label={`${tool.name} tool`}
          className="mb-8 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl sm:p-6 lg:p-8"
        >
          <h2 className="sr-only">{tool.name} Interactive Workspace</h2>
          {ToolComponent ? (
            <ToolComponent />
          ) : (
            <div className="py-12 text-center">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Tool coming soon
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                This tool is currently being prepared.
              </p>
            </div>
          )}
        </section>

        {/* Bottom Advertisement */}
        <AdUnit slotId={bottomAdSlot} />

        {/* Server-Rendered Key Capabilities & Privacy Summary (Boosts SSR Text-to-HTML Ratio & AI Search Clarity) */}
        {tool.featureList && tool.featureList.length > 0 && (
          <section
            aria-labelledby="tool-capabilities-summary"
            className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl sm:p-7"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2
                id="tool-capabilities-summary"
                className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
              >
                {tool.seoTitle || tool.name} — Core Capabilities &amp; Client-Side Architecture
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                100% In-Browser • Zero Server Upload
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
              {tool.name} is an enterprise-grade {categoryData.name.toLowerCase()} utility on KivaroTools engineered for instant, privacy-first execution directly inside your web browser. Every calculation, file transformation, and diagnostic check runs locally in client memory without uploading sensitive payloads to external servers.
            </p>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {tool.featureList.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs leading-relaxed text-slate-700 dark:border-slate-800/80 dark:bg-slate-800/40 dark:text-slate-300"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 22 Country Statutory Salary Calculators Hub (Eliminates Orphan Pages & Boosts Crawl Discovery) */}
        {resolvedSlug === 'salary-calculator' && (
          <section
            aria-labelledby="country-salary-calculators-heading"
            className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl sm:p-7"
          >
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <Globe className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                22 Statutory Country Tax Engines
              </span>
            </div>
            <h2
              id="country-salary-calculators-heading"
              className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Explore Dedicated Country Salary &amp; Take-Home Pay Calculators
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 mb-4">
              Select any country below to open its dedicated 2026 statutory income tax, social security withholding, and gross-to-net paycheck calculator:
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {SALARY_COUNTRIES.map((country) => (
                <Link
                  key={country.slug}
                  href={`/finance/salary-calculator/${country.slug}`}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-semibold text-slate-800 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:border-blue-600 dark:hover:text-blue-400"
                >
                  {country.name} &rarr;
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SEO Content */}
        {SeoComponent && (
          <section className="mt-10">
            <SeoComponent />
          </section>
        )}

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <section
            aria-labelledby="related-tools-heading"
            className="mt-12 border-t border-slate-200 pt-10 dark:border-slate-800"
          >
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2
                  id="related-tools-heading"
                  className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                  Related Tools
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Explore other utilities in {categoryData.name} and complementary workflows.
                </p>
              </div>
              <Link
                href={`/${categoryData.id}`}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View all {categoryData.name} &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedTools.map((relTool) => (
                <Link
                  key={relTool.id}
                  href={`/${relTool.categoryId}/${relTool.slug}`}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
                >
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {relTool.name}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {relTool.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <span>Use tool</span>
                    <span aria-hidden="true">&rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}