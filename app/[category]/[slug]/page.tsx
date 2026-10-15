import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

import { categories, tools, getRelatedTools } from '@/config/toolsData';
import AdUnit from '@/components/ads/AdUnit';
import { SITE_URL } from '@/config/site';

import { toolComponents, seoComponents } from '@/config/toolRegistry';

type PageProps = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

/**
 * Generate dynamic SEO metadata for each tool page.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category, slug } = await params;

  const resolvedCategory =
    category === 'image'
      ? 'media'
      : category === 'seo' && slug === 'regex-tester'
      ? 'developer'
      : category;
  const resolvedSlug =
    slug === 'webp-converter'
      ? 'webp-to-jpg-png'
      : slug === 'case-converter'
      ? 'text-case-converter'
      : slug === 'currency-converter'
      ? 'crypto-converter'
      : slug;

  const tool =
    tools.find((item) => item.slug === slug && item.categoryId === category) ||
    tools.find((item) => item.slug === resolvedSlug && item.categoryId === resolvedCategory);

  if (!tool) {
    return {
      title: 'Tool Not Found',
      description: 'The requested OmniTools tool could not be found.',
    };
  }

  const metaTitle = tool.seoTitle || tool.name;
  const metaDescription = tool.seoDescription || tool.description;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: `/${resolvedCategory}/${resolvedSlug}`,
    },
    openGraph: {
      title: `${metaTitle} — OmniTools`,
      description: metaDescription,
      url: `/${resolvedCategory}/${resolvedSlug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${metaTitle} — OmniTools`,
      description: metaDescription,
    },
  };
}

/**
 * Dynamic tool page.
 */
export default async function ToolPage({ params }: PageProps) {
  const { category, slug } = await params;

  const resolvedCategory =
    category === 'image'
      ? 'media'
      : category === 'seo' && slug === 'regex-tester'
      ? 'developer'
      : category;
  const resolvedSlug =
    slug === 'webp-converter'
      ? 'webp-to-jpg-png'
      : slug === 'case-converter'
      ? 'text-case-converter'
      : slug === 'currency-converter'
      ? 'crypto-converter'
      : slug;

  if (category !== resolvedCategory || slug !== resolvedSlug) {
    permanentRedirect(`/${resolvedCategory}/${resolvedSlug}`);
  }

  const tool =
    tools.find((item) => item.slug === slug && item.categoryId === category) ||
    tools.find((item) => item.slug === resolvedSlug && item.categoryId === resolvedCategory);

  const categoryData =
    categories.find((item) => item.id === category) ||
    categories.find((item) => item.id === resolvedCategory);

  if (!tool || !categoryData) {
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

  /**
   * Structured data for search engines.
   */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url: `${SITE_URL}/${resolvedCategory}/${resolvedSlug}`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
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
        <AdUnit slotId="TOP_AD_SLOT" />

        {/* Tool Workspace */}
        <section
          aria-label={`${tool.name} tool`}
          className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl sm:p-8"
        >
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
        <AdUnit slotId="BOTTOM_AD_SLOT" />

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