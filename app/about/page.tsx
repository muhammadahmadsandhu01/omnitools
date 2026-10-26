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
import { SITE_URL, CONTACT_EMAIL, OPERATOR_LOCATION } from '@/config/site';

export const metadata: Metadata = {
  title: 'About KivaroTools — Architecture, Methodology & Privacy Standards',
  description:
    'Learn about KivaroTools, our 100% client-side browser utility architecture, mathematical & statutory verification methodology, and commitment to privacy-conscious computing.',
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: 'About KivaroTools — Architecture, Methodology & Privacy Standards',
    description:
      'Learn about KivaroTools, our 100% client-side browser utility architecture, mathematical & statutory verification methodology, and commitment to privacy-conscious computing.',
    url: `${SITE_URL}/about`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About KivaroTools — Architecture, Methodology & Privacy Standards',
    description:
      'Learn about KivaroTools, our 100% client-side browser utility architecture, mathematical & statutory verification methodology, and commitment to privacy-conscious computing.',
  },
};

export default function AboutPage() {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About KivaroTools',
    url: `${SITE_URL}/about`,
    description:
      'Overview of KivaroTools client-side software architecture, editorial & mathematical accuracy verification standards, and privacy model.',
    mainEntity: {
      '@type': 'Organization',
      name: 'KivaroTools',
      url: SITE_URL,
      email: CONTACT_EMAIL,
    },
  };

  return (
    <main className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
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
            KivaroTools provides 23+ free, enterprise-grade browser-based utilities and 22 statutory country salary
            calculators for software engineers, financial planners, creators, and businesses worldwide. We believe
            essential computational tools should be fast, deterministic, and private—without registration walls,
            watermarks, or server data uploads.
          </p>
        </header>

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
                Financial modeling, code formatting, image compression, PDF operations, cryptographic generation, and text
                transformations execute directly within your browser runtime via Web Workers, Web Crypto API, and HTML5 Canvas.
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
                or email registrations are required to format code, generate PDF invoices, or compute payroll taxes.
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
                Calculators and parsers are codified against official RFC specifications, BIPM/NIST metrology constants,
                and published statutory tax schedules with automated regression test suites.
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
                  <strong className="text-slate-900 dark:text-white">Statutory &amp; RFC Grounding:</strong> Financial calculators
                  cite primary statutory tax authorities (IRS, HMRC, BMF, CBDT, FBR, CRA, ATO, IRAS) with explicit ruleset version IDs
                  and documented exclusions. Developer tools strictly follow IETF RFC 8259 (JSON), RFC 4648 (Base64), RFC 4180 (CSV),
                  and ISO/IEC 18004 (QR Code) specifications.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 dark:text-white">Automated Mathematical Oracle Testing:</strong> Calculation engines
                  are validated against hundreds of boundary test vectors, floating-point conservation invariants, and spreadsheet
                  formula injection (CWE-1236) security checks.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Scale className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 dark:text-white">Honest Documentation:</strong> Every tool page is accompanied by
                  comprehensive technical documentation explaining the exact mathematical formulas, algorithmic trade-offs, and browser
                  memory limits actually implemented in the code.
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
              Tool Catalogue
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
            Because operations execute in the client browser runtime, user documents (such as uploaded images,
            PDFs, JSON datasets, and custom passwords) remain in local browser memory. KivaroTools does not operate
            a central user database to store your inputs, documents, or financial calculations.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
            >
              <span>Explore All Tools</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <span>Read Privacy Policy</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
