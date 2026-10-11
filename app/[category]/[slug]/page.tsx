import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

import { categories, tools } from '@/config/toolsData';
import AdUnit from '@/components/ads/AdUnit';
import { SITE_URL } from '@/config/site';

// Tool components
import EmiCalculator from '@/components/tools/EmiCalculator';
import MortgageCalculator from '@/components/tools/MortgageCalculator';
import CompoundInterest from '@/components/tools/CompoundInterest';
import SipCalculator from '@/components/tools/SipCalculator';
import JsonFormatter from '@/components/tools/JsonFormatter';
import QrGenerator from '@/components/tools/QrGenerator';
import Base64Encoder from '@/components/tools/Base64Encoder';
import CryptoConverter from '@/components/tools/CryptoConverter';
import PdfMergeSplit from '@/components/tools/PdfMergeSplit';
import ImageCompressor from '@/components/tools/ImageCompressor';
import TextAnalyzer from '@/components/tools/TextAnalyzer';
import PasswordGenerator from '@/components/tools/PasswordGenerator';
import SvgOptimizer from '@/components/tools/SvgOptimizer';
import InvoiceGenerator from '@/components/tools/InvoiceGenerator';
import JsonConverter from '@/components/tools/JsonConverter';
import SqlFormatter from '@/components/tools/SqlFormatter';
import RegexTester from '@/components/tools/RegexTester';
import PreciousMetals from '@/components/tools/PreciousMetals';
import SalaryCalculator from '@/components/tools/SalaryCalculator';
import ImageToPdf from '@/components/tools/ImageToPdf';
import WebpToJpgPng from '@/components/tools/WebpToJpgPng';
import TextCaseConverter from '@/components/tools/TextCaseConverter';
import MetaGenerator from '@/components/tools/MetaGenerator';

// SEO content components
import EmiCalculatorSeo from '@/components/seo/EmiCalculatorSeo';
import MortgageCalculatorSeo from '@/components/seo/MortgageCalculatorSeo';
import CompoundInterestSeo from '@/components/seo/CompoundInterestSeo';
import SipCalculatorSeo from '@/components/seo/SipCalculatorSeo';
import JsonFormatterSeo from '@/components/seo/JsonFormatterSeo';
import QrGeneratorSeo from '@/components/seo/QrGeneratorSeo';
import Base64EncoderSeo from '@/components/seo/Base64EncoderSeo';
import CryptoConverterSeo from '@/components/seo/CryptoConverterSeo';
import PdfMergeSplitSeo from '@/components/seo/PdfMergeSplitSeo';
import ImageCompressorSeo from '@/components/seo/ImageCompressorSeo';
import TextAnalyzerSeo from '@/components/seo/TextAnalyzerSeo';
import PasswordGeneratorSeo from '@/components/seo/PasswordGeneratorSeo';
import SvgOptimizerSeo from '@/components/seo/SvgOptimizerSeo';
import InvoiceGeneratorSeo from '@/components/seo/InvoiceGeneratorSeo';
import JsonConverterSeo from '@/components/seo/JsonConverterSeo';
import SqlFormatterSeo from '@/components/seo/SqlFormatterSeo';
import RegexTesterSeo from '@/components/seo/RegexTesterSeo';
import PreciousMetalsSeo from '@/components/seo/PreciousMetalsSeo';
import SalaryCalculatorSeo from '@/components/seo/SalaryCalculatorSeo';
import ImageToPdfSeo from '@/components/seo/ImageToPdfSeo';
import WebpToJpgPngSeo from '@/components/seo/WebpToJpgPngSeo';
import TextCaseConverterSeo from '@/components/seo/TextCaseConverterSeo';
import MetaGeneratorSeo from '@/components/seo/MetaGeneratorSeo';

type PageProps = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

/**
 * Tool component registry.
 *
 * Keeping the mapping here makes the page much easier to maintain
 * as more tools are added to OmniTools.
 */
const toolComponents = {
  'precious-metals': PreciousMetals,
  'emi-calculator': EmiCalculator,
  'mortgage-calculator': MortgageCalculator,
  'compound-interest': CompoundInterest,
  'sip-calculator': SipCalculator,
  'json-formatter': JsonFormatter,
  'qr-generator': QrGenerator,
  'base64-encoder': Base64Encoder,
  'crypto-converter': CryptoConverter,
  'currency-converter': CryptoConverter,
  'pdf-merge-split': PdfMergeSplit,
  'image-compressor': ImageCompressor,
  'text-analyzer': TextAnalyzer,
  'password-generator': PasswordGenerator,
  'svg-optimizer': SvgOptimizer,
  'invoice-generator': InvoiceGenerator,
  'json-converter': JsonConverter,
  'sql-formatter': SqlFormatter,
  'regex-tester': RegexTester,
  'salary-calculator': SalaryCalculator,
  'image-to-pdf': ImageToPdf,
  'webp-to-jpg-png': WebpToJpgPng,
  'webp-converter': WebpToJpgPng,
  'text-case-converter': TextCaseConverter,
  'case-converter': TextCaseConverter,
  'meta-generator': MetaGenerator,
  'meta-tags-generator': MetaGenerator,
  'open-graph-generator': MetaGenerator,
} as const;

/**
 * SEO content registry.
 */
const seoComponents = {
  'precious-metals': PreciousMetalsSeo,
  'emi-calculator': EmiCalculatorSeo,
  'mortgage-calculator': MortgageCalculatorSeo,
  'compound-interest': CompoundInterestSeo,
  'sip-calculator': SipCalculatorSeo,
  'json-formatter': JsonFormatterSeo,
  'qr-generator': QrGeneratorSeo,
  'base64-encoder': Base64EncoderSeo,
  'crypto-converter': CryptoConverterSeo,
  'currency-converter': CryptoConverterSeo,
  'pdf-merge-split': PdfMergeSplitSeo,
  'image-compressor': ImageCompressorSeo,
  'text-analyzer': TextAnalyzerSeo,
  'password-generator': PasswordGeneratorSeo,
  'svg-optimizer': SvgOptimizerSeo,
  'invoice-generator': InvoiceGeneratorSeo,
  'json-converter': JsonConverterSeo,
  'sql-formatter': SqlFormatterSeo,
  'regex-tester': RegexTesterSeo,
  'salary-calculator': SalaryCalculatorSeo,
  'image-to-pdf': ImageToPdfSeo,
  'webp-to-jpg-png': WebpToJpgPngSeo,
  'webp-converter': WebpToJpgPngSeo,
  'text-case-converter': TextCaseConverterSeo,
  'case-converter': TextCaseConverterSeo,
  'meta-generator': MetaGeneratorSeo,
  'meta-tags-generator': MetaGeneratorSeo,
  'open-graph-generator': MetaGeneratorSeo,
} as const;

/**
 * Generate dynamic SEO metadata for each tool page.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category, slug } = await params;

  const resolvedCategory = category === 'image' ? 'media' : category;
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

  return {
    title: tool.name,
    description: tool.description,
    alternates: {
      canonical: `/${resolvedCategory}/${resolvedSlug}`,
    },
    openGraph: {
      title: `${tool.name} — OmniTools`,
      description: tool.description,
      url: `/${resolvedCategory}/${resolvedSlug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} — OmniTools`,
      description: tool.description,
    },
  };
}

/**
 * Dynamic tool page.
 */
export default async function ToolPage({ params }: PageProps) {
  const { category, slug } = await params;

  const resolvedCategory = category === 'image' ? 'media' : category;
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

  const ToolComponent =
    toolComponents[slug as keyof typeof toolComponents] ||
    toolComponents[tool.slug as keyof typeof toolComponents] ||
    toolComponents[resolvedSlug as keyof typeof toolComponents];

  const SeoComponent =
    seoComponents[slug as keyof typeof seoComponents] ||
    seoComponents[tool.slug as keyof typeof seoComponents] ||
    seoComponents[resolvedSlug as keyof typeof seoComponents];

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

      </div>
    </main>
  );
}