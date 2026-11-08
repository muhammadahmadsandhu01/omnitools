import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

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
                                                : slug;

  const resolvedCategory =
    resolvedSlug === 'image-to-pdf' ||
      resolvedSlug === 'pdf-merge-split' ||
      resolvedSlug === 'pdf-to-word' ||
      resolvedSlug === 'word-to-pdf' ||
      resolvedSlug === 'pdf-to-excel' ||
      resolvedSlug === 'excel-to-pdf' ||
      resolvedSlug === 'pdf-to-ppt' ||
      resolvedSlug === 'pdf-to-jpg' ||
      resolvedSlug === 'compress-pdf' ||
      resolvedSlug === 'pdf-scrubber'
      ? 'document'
      : category === 'pdf'
        ? 'document'
        : category === 'image' || resolvedSlug === 'heic-to-jpg'
          ? 'media'
          : category === 'seo' && resolvedSlug === 'regex-tester'
            ? 'developer'
            : resolvedSlug === 'saas-burn-rate-calculator' ||
              resolvedSlug === 'contractor-vs-employee-calculator' ||
              resolvedSlug === 'mortgage-calculator' ||
              resolvedSlug === 'emi-calculator'
              ? 'finance'
              : resolvedSlug === 'parquet-viewer' ||
                resolvedSlug === 'har-analyzer' ||
                resolvedSlug === 'sqlite-viewer' ||
                resolvedSlug === 'openapi-to-typescript' ||
                resolvedSlug === 'jwt-debugger' ||
                resolvedSlug === 'cron-expression-generator'
                ? 'developer'
                : resolvedSlug === 'llms-txt-generator'
                  ? 'seo'
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
    return {
      title: 'Health Calculator',
      robots: { index: false, follow: false },
    };
  }

  const { resolvedCategory, resolvedSlug } = resolveCanonicalRoute(category, slug);

  const tool =
    tools.find((item) => item.slug === slug && item.categoryId === category) ||
    tools.find((item) => item.slug === resolvedSlug && item.categoryId === resolvedCategory);

  if (!tool) {
    return {
      title: 'Tool Not Found',
      description: 'The requested KivaroTools tool could not be found.',
    };
  }

  const metaTitle = tool.seoTitle || tool.name;
  const metaDescription = tool.seoDescription || tool.description;

  const isPublicAndPublished = !tool.hidden && tool.status === 'published';
  const canonicalUrl = `${SITE_URL}/${resolvedCategory}/${resolvedSlug}`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: tool.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: isPublicAndPublished
      ? {
        index: true,
        follow: true,
      }
      : {
        index: false,
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
    tools.find((item) => item.slug === slug && item.categoryId === category) ||
    tools.find((item) => item.slug === resolvedSlug && item.categoryId === resolvedCategory);

  const categoryData =
    categories.find((item) => item.id === category) ||
    categories.find((item) => item.id === resolvedCategory);

  if (!tool || !categoryData || tool.status !== 'published') {
    notFound();
  }

  const relatedTools = getRelatedTools(tool);

  const ToolComponent =
    toolComponents[slug] ||
    toolComponents[tool.slug] ||
    toolComponents[resolvedSlug];

  const SeoComponent =
    seoComponents[slug] ||
    seoComponents[tool.slug] ||
    seoComponents[resolvedSlug];

  const metaDescription = tool.seoDescription || tool.description;
  const canonicalUrl = `${SITE_URL}/${resolvedCategory}/${resolvedSlug}`;
  const topAdSlot = process.env.NEXT_PUBLIC_ADSENSE_TOP_SLOT || "";
  const bottomAdSlot = process.env.NEXT_PUBLIC_ADSENSE_BOTTOM_SLOT || "";

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

        {/* Structured Data (GEO / AEO) */}
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