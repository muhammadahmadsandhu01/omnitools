import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import {
  ArrowUpRight,
  ChevronRight,
  Home,
  ShieldCheck,
  CheckCircle2,
  Globe,
} from 'lucide-react';

import { categories, tools } from '@/config/toolsData';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/config/site';

const PDF_SCRUBBER_GSC_TOKENS = new Set([
  'Title',
  'Annots',
  'OCGs',
  'AcroForm',
  'Thumb',
  'AA',
  'URI',
  'EmbeddedFiles',
  'OpenAction',
  'Launch',
  'JavaScript',
  'Info',
  'Metadata',
  'Outlines',
]);
const PDF_WORD_GSC_TOKENS = new Set(['WinAnsiEncoding', 'FlateDecode']);
const LLMS_GSC_TOKENS = new Set(['admin', 'checkout', 'ai.txt', 'llms-full.txt', 'llms-ctx.txt']);

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

const FINANCE_COUNTRY_LINKS = [
  { slug: 'united-states', name: 'United States Salary Calculator' },
  { slug: 'united-kingdom', name: 'United Kingdom PAYE & NI Calculator' },
  { slug: 'germany', name: 'Germany Brutto-Netto Calculator' },
  { slug: 'canada', name: 'Canada Federal & Provincial Calculator' },
  { slug: 'australia', name: 'Australia ATO & Super Calculator' },
  { slug: 'india', name: 'India New vs Old Tax Regime Calculator' },
  { slug: 'pakistan', name: 'Pakistan FBR Salaried Tax Calculator' },
  { slug: 'united-arab-emirates', name: 'UAE Gratuity & Net Pay Calculator' },
  { slug: 'saudi-arabia', name: 'Saudi Arabia GOSI Salary Calculator' },
  { slug: 'singapore', name: 'Singapore IRAS & CPF Calculator' },
  { slug: 'france', name: 'France Salaire Brut en Net Calculator' },
  { slug: 'japan', name: 'Japan Income & Social Insurance Calculator' },
  { slug: 'switzerland', name: 'Switzerland Cantonal Tax Calculator' },
  { slug: 'netherlands', name: 'Netherlands Box 1 & 30% Ruling Calculator' },
  { slug: 'ireland', name: 'Ireland PAYE, USC & PRSI Calculator' },
  { slug: 'new-zealand', name: 'New Zealand PAYE & KiwiSaver Calculator' },
  { slug: 'spain', name: 'Spain IRPF & Seguridad Social Calculator' },
  { slug: 'italy', name: 'Italy IRPEF & INPS Salary Calculator' },
  { slug: 'south-africa', name: 'South Africa SARS PAYE Calculator' },
  { slug: 'brazil', name: 'Brazil IRPF & INSS Salary Calculator' },
  { slug: 'mexico', name: 'Mexico ISR & IMSS Payroll Calculator' },
  { slug: 'south-korea', name: 'South Korea NTS Net Pay Calculator' },
] as const;

export function generateStaticParams() {
  return categories
    .filter((cat) => !cat.hidden)
    .map((cat) => ({
      category: cat.id,
    }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;

  if (
    categorySlug === '$' ||
    categorySlug === '&' ||
    categorySlug === '%24' ||
    categorySlug === '%26' ||
    categorySlug === 'health'
  ) {
    permanentRedirect('/');
  }
  if (PDF_SCRUBBER_GSC_TOKENS.has(categorySlug)) {
    permanentRedirect('/document/pdf-scrubber');
  }
  if (PDF_WORD_GSC_TOKENS.has(categorySlug)) {
    permanentRedirect('/document/pdf-to-word');
  }
  if (LLMS_GSC_TOKENS.has(categorySlug)) {
    permanentRedirect('/seo/llms-txt-generator');
  }

  const resolvedCategorySlug =
    categorySlug === 'image' || categorySlug === 'photo'
      ? 'media'
      : categorySlug === 'pdf' || categorySlug === 'legal'
        ? 'document'
        : categorySlug === 'dev'
          ? 'developer'
          : categorySlug === 'tax' || categorySlug === 'payroll'
            ? 'finance'
            : categorySlug;

  const category = categories.find(
    (item) => item.id === resolvedCategorySlug
  );

  if (!category || category.hidden) {
    return {
      title: 'Category Not Found',
      description: 'The requested KivaroTools category could not be found.',
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const categoryTools = tools.filter(
    (tool) => tool.categoryId === category.id && tool.status === 'published' && !tool.hidden
  );

  const categoryTitle =
    category.seoTitle ||
    (category.name.endsWith('Tools') || category.name.endsWith('Utilities')
      ? category.name
      : `${category.name} Tools`);

  const categoryDescription =
    category.seoDescription ||
    `Explore ${categoryTools.length} free ${category.name.toLowerCase()} from KivaroTools. Fast, easy-to-use browser-based utilities with 100% client-side privacy.`;

  const canonicalUrl = `${SITE_URL}/${category.id}`;

  return {
    title: categoryTitle,
    description: categoryDescription,
    keywords: category.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${categoryTitle} — KivaroTools`,
      description: categoryDescription,
      url: canonicalUrl,
      type: 'website',
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@kivarotools',
      creator: '@kivarotools',
      title: `${categoryTitle} — KivaroTools`,
      description: categoryDescription,
      images: [`${SITE_URL}/og-image.png`],
    },
  };
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { category: categorySlug } = await params;

  if (categorySlug === '$' || categorySlug === '&' || categorySlug === '%24' || categorySlug === '%26') {
    permanentRedirect('/');
  }

  if (categorySlug === 'health') {
    permanentRedirect('/');
  }
  if (PDF_SCRUBBER_GSC_TOKENS.has(categorySlug)) {
    permanentRedirect('/document/pdf-scrubber');
  }
  if (PDF_WORD_GSC_TOKENS.has(categorySlug)) {
    permanentRedirect('/document/pdf-to-word');
  }
  if (LLMS_GSC_TOKENS.has(categorySlug)) {
    permanentRedirect('/seo/llms-txt-generator');
  }

  if (categorySlug === 'image' || categorySlug === 'photo') {
    permanentRedirect('/media');
  }
  if (categorySlug === 'pdf' || categorySlug === 'legal') {
    permanentRedirect('/document');
  }
  if (categorySlug === 'dev') {
    permanentRedirect('/developer');
  }
  if (categorySlug === 'tax' || categorySlug === 'payroll') {
    permanentRedirect('/finance');
  }

  const category = categories.find(
    (item) => item.id === categorySlug
  );

  if (!category || category.hidden) {
    notFound();
  }

  const categoryTools = tools.filter(
    (tool) => tool.categoryId === category.id && tool.status === 'published' && !tool.hidden
  );

  const Icon = category.icon;
  const canonicalUrl = `${SITE_URL}/${category.id}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: category.name, item: canonicalUrl },
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${canonicalUrl}#collection`,
    name: `${category.name} — KivaroTools`,
    description:
      category.description ||
      `Explore ${categoryTools.length} free browser-based ${category.name.toLowerCase()} on KivaroTools.`,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: categoryTools.length,
      itemListElement: categoryTools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.name,
        description: tool.description,
        url: `${SITE_URL}/${category.id}/${tool.slug}`,
      })),
    },
  };

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />

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

            <li
              aria-current="page"
              className="text-slate-800 dark:text-slate-200"
            >
              {category.name}
            </li>

          </ol>
        </nav>

        {/* Category Header */}
        <header className="mb-10 border-b border-slate-200 pb-8 dark:border-slate-800">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            {/* Category Icon */}
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${category.color}`}
            >
              <Icon
                className="h-8 w-8"
                aria-hidden="true"
              />
            </div>

            {/* Heading */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  {category.name.endsWith('Tools') || category.name.endsWith('Utilities')
                    ? category.name
                    : `${category.name} Tools`}
                </h1>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {categoryTools.length}{' '}
                  {categoryTools.length === 1 ? 'Tool' : 'Tools'}
                </span>
              </div>

              <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-400">
                {category.description ||
                  `Explore free ${category.name.toLowerCase()} tools designed to be fast, simple, and easy to use with 100% client-side privacy.`}
              </p>
            </div>

          </div>
        </header>

        {/* Tools */}
        {categoryTools.length > 0 ? (
          <section aria-labelledby="category-tools-heading">

            <div className="mb-5">
              <h2
                id="category-tools-heading"
                className="text-xl font-bold text-slate-900 dark:text-white"
              >
                Explore {category.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Select any utility below to launch its client-side workspace immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {categoryTools.map((tool) => (
                <Link
                  href={`/${category.id}/${tool.slug}`}
                  key={tool.id}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
                >
                  {/* Card Top */}
                  <div className="mb-5 flex items-start justify-between gap-4">

                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 ${category.color}`}
                    >
                      <Icon
                        className="h-6 w-6"
                        aria-hidden="true"
                      />
                    </div>

                    <ArrowUpRight
                      className="h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:text-blue-600 dark:text-slate-600 dark:group-hover:text-blue-400"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col">

                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tool.name}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {tool.description}
                    </p>

                    {tool.featureList && tool.featureList.length > 0 && (
                      <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        {tool.featureList.slice(0, 3).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                            <span className="line-clamp-2">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                  </div>

                  {/* Card Action */}
                  <div className="mt-5 flex items-center justify-between text-sm font-semibold text-blue-600 transition-colors group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
                    <span>Open tool</span>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      Client-Side
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* 22 Country Statutory Salary Calculators Directory on /finance Category Hub */}
            {category.id === 'finance' && (
              <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Globe className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Global Statutory Payroll &amp; Tax Engines
                  </span>
                </div>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  22 Country Salary &amp; Net Take-Home Pay Calculators
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Calculate gross-to-net paycheck take-home pay, progressive income tax brackets, social security deductions, and employer payroll cost across 22 jurisdictions:
                </p>
                <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {FINANCE_COUNTRY_LINKS.map((country) => (
                    <Link
                      key={country.slug}
                      href={`/finance/salary-calculator/${country.slug}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-400"
                    >
                      {country.name} &rarr;
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Category Architecture & Cross-Category Hub Links */}
            <div className="mt-14 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Privacy-First Architecture &amp; Technical Standards
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Why Professionals Choose KivaroTools for {category.name}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {category.description} Every utility in our {category.name.toLowerCase()} suite executes locally inside your browser memory with zero server uploads and includes comprehensive methodology documentation, formula verification tables, and interactive FAQs directly below the workspace.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                {categories
                  .filter((c) => !c.hidden && c.id !== category.id)
                  .map((otherCat) => (
                    <Link
                      key={otherCat.id}
                      href={`/${otherCat.id}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-400"
                    >
                      Explore {otherCat.name} &rarr;
                    </Link>
                  ))}
              </div>
            </div>
          </section>
        ) : (
          /* Empty State */
          <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/50">
            <div className="mx-auto max-w-md">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-900">
                <Icon
                  className={`h-7 w-7 ${category.color}`}
                  aria-hidden="true"
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                More tools coming soon
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                We&apos;re working on useful tools for this category.
                Check back soon or explore the other tools available on
                KivaroTools.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Browse all tools
                <ArrowUpRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>

            </div>
          </section>
        )}

      </div>
    </main>
  );
}