import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ChevronRight,
  Home,
  ShieldCheck,
  LockKeyhole,
  Zap,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Scale,
} from 'lucide-react';
import { categories } from '@/config/toolsData';
import { SITE_URL, CONTACT_EMAIL, OPERATOR_LOCATION, OFFICIAL_SOCIAL_LINKS, DEFAULT_OG_IMAGE } from '@/config/site';

export const metadata: Metadata = {
  title: 'About KivaroTools — Privacy & Architecture',
  description:
    'Learn how KivaroTools builds 42 free client-side browser utilities and 22 country salary calculators with Web Workers, WebAssembly, and zero server uploads.',
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: 'About KivaroTools — Privacy & Architecture | KivaroTools',
    description:
      'Learn how KivaroTools builds 42 free client-side browser utilities and 22 country salary calculators with Web Workers, WebAssembly, and zero server uploads.',
    url: `${SITE_URL}/about`,
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kivarotools',
    creator: '@kivarotools',
    title: 'About KivaroTools — Privacy & Architecture | KivaroTools',
    description:
      'Learn how KivaroTools builds 42 free client-side browser utilities and 22 country salary calculators with Web Workers, WebAssembly, and zero server uploads.',
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function AboutPage() {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${SITE_URL}/about#webpage`,
    name: 'About KivaroTools',
    url: `${SITE_URL}/about`,
    description:
      'Overview of KivaroTools client-side software architecture, editorial & mathematical accuracy verification standards, and privacy model across 42 browser tools and 22 country tax calculators.',
    mainEntity: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'KivaroTools',
      legalName: 'KivaroTools',
      url: SITE_URL,
      foundingDate: '2026',
      founder: {
        '@type': 'Person',
        name: 'Muhammad Ahmad',
        jobTitle: 'Founder & Lead Software Architect',
        url: 'https://www.linkedin.com/in/muhammad-ahmad-b81794291/',
      },
      disambiguatingDescription:
        'KivaroTools (https://kivarotools.com) is an independent, 100% free browser-based utility platform founded by software engineer Muhammad Ahmad, providing 42 client-side developer, financial, PDF, image, and SEO tools plus 22 statutory country salary calculators (64 specialized tools total) with zero user registration, zero login forms, and zero credential collection. KivaroTools operates independently and is not affiliated with Kivaro Tech (kivarotech.com), Kivaro AI (kivaroai.com), or Kivaro Home.',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/kivaro-logo-512.png`,
        width: 512,
        height: 512,
      },
      image: `${SITE_URL}/og-image.png`,
      sameAs: OFFICIAL_SOCIAL_LINKS,
      contactPoint: {
        '@type': 'ContactPoint',
        email: CONTACT_EMAIL,
        contactType: 'customer support',
        availableLanguage: ['English'],
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE_URL}/about` },
    ],
  };

  return (
    <main className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
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
            <li aria-current="page" className="text-slate-800 dark:text-slate-200">
              About
            </li>
          </ol>
        </nav>

        {/* Hero Header */}
        <header className="mb-12 border-b border-slate-200 pb-10 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
            <ShieldCheck className="h-4 w-4" />
            Privacy-Conscious Enterprise Utility Suite
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            Powerful Tools. <span className="text-blue-600">Private by Design.</span>
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
            KivaroTools provides <strong>42 free, enterprise-grade browser-based utilities</strong> and{' '}
            <strong>22 statutory country salary calculators</strong> (64 specialized tools in total) for software engineers,
            financial planners, legal operations teams, creators, and businesses worldwide. We believe essential computational
            tools should be fast, deterministic, and private—without registration walls, watermarks, or server data uploads.
          </p>
        </header>

        {/* Brand Independence & Zero-Credential Security Notice */}
        <section aria-label="Brand Independence Notice" className="mb-12 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div className="text-sm leading-6 text-emerald-950 dark:text-emerald-200">
              <span className="font-bold text-emerald-900 dark:text-emerald-300">
                Brand Independence &amp; Zero-Credential Security Notice:
              </span>{' '}
              KivaroTools (kivarotools.com) is an independent browser utility platform founded and engineered by Muhammad Ahmad (BSCS). KivaroTools is not affiliated with Kivaro Tech (kivarotech.com), Kivaro AI (kivaroai.com), or Kivaro Home. KivaroTools has zero user accounts, zero login or registration forms, and never asks for passwords, credentials, or payment details.
            </div>
          </div>
        </section>

        {/* Core Architecture Principles */}
        <section className="mb-12 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Our Architectural Principles
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                100% Client-Side Execution
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Financial modeling, SQLite/Parquet database querying, PDF digital signing &amp; redaction, HEIC/AVIF conversion,
                and JWT/SAML debugging execute directly inside your browser runtime via Web Workers, Web Crypto API, and HTML5 Canvas.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                Zero Mandatory Accounts
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Every utility is immediately accessible without paywalls or daily quotas. No account sign-ups, credit cards,
                or email registrations are required to format code, Bates-stamp legal PDFs, or compute global payroll taxes.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                Deterministic Accuracy
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Calculators and binary parsers are codified against official IETF/W3C/ISO specifications, BIPM/NIST metrology
                constants, and published statutory tax schedules with multi-thousand-case automated regression test suites.
              </p>
            </div>
          </div>
        </section>

        {/* Engineering & Editorial Methodology (E-E-A-T) */}
        <section className="mb-12 space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Engineering &amp; Editorial Verification Standards
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
            <p>
              KivaroTools is engineered and maintained by an independent software engineering team based in {OPERATOR_LOCATION},
              serving users worldwide. Every tool on our platform undergoes a rigorous multi-stage verification process before publication:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 dark:text-white">Statutory &amp; RFC Specification Grounding:</strong> Financial
                  and payroll calculators cite primary statutory tax authorities (IRS Rev. Proc. 2025-32, UK HMRC PAYE &amp; Off-Payroll
                  IR35, German BMF EStG, India CBDT Sec 115BAC &amp; 44ADA, Pakistan FBR Finance Act, Canada CRA T4/CCPC, Australia ATO
                  Stage 3, Singapore IRAS/CPF) with explicit ruleset version IDs. Developer, document, and GEO tools strictly implement
                  IETF RFC 8259 (JSON), RFC 7519/7515/7516 (JWT/JWS/JWE), OASIS SAML 2.0, OpenAPI 3.1.0, RFC 4648 (Base64), RFC 4180 (CSV),
                  RFC 9309 (<code>robots.txt</code>), W3C TDM Reservation Protocol (<code>tdmrep.json</code>), ISO 32000-1 (PDF 1.7), and
                  ISO/IEC 18004 (QR Code).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 dark:text-white">Automated Mathematical &amp; Binary Oracle Testing:</strong> Calculation
                  and parsing engines are validated against thousands of boundary test vectors, IEEE-754 and <code>BigInt</code> conservation
                  invariants, IANA timezone DST transitions, and spreadsheet formula injection (CWE-1236) security checks.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Scale className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 dark:text-white">Transparent Technical Documentation:</strong> Every tool page includes
                  an in-depth engineering reference explaining the exact mathematical formulas, binary container layouts, algorithmic
                  trade-offs, and browser memory limits implemented in the source code.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Categories Overview */}
        <section className="mb-12 space-y-6">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Tool Catalogue (5 Core Suites • 64 Specialized Utilities)
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {categories.filter((cat) => !cat.hidden).map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={`/${cat.id}`}
                  className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-colors hover:border-blue-300 hover:bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900 dark:hover:bg-slate-800/60"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 ${cat.color}`}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {cat.name}
                      </h3>
                      <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {cat.description || `Explore free, browser-based utilities in ${cat.name.toLowerCase()}.`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Data Handling & Transparency */}
        <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900/40">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Data Handling &amp; Security Model
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Because operations execute in the client browser runtime, user payloads—such as uploaded PDFs, HEIC/AVIF images,
            SQLite/DuckDB databases, Parquet files, HAR network captures, JWT/SAML tokens, and salary/cap-table inputs—remain in
            local browser memory. KivaroTools does not operate a central user database to store your files or calculations.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
            >
              <span>Explore All 42 Tools</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <span>Read Privacy Policy</span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <span>Contact Engineering Team</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}