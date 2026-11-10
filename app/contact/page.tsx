import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ChevronRight,
  Home,
  Mail,
  MessageSquare,
  Bug,
  Sparkles,
  ShieldCheck,
  Globe,
  Clock,
  Scale,
  HelpCircle,
} from 'lucide-react';
import { SITE_URL, CONTACT_EMAIL, OPERATOR_LOCATION, DEFAULT_OG_IMAGE } from '@/config/site';

export const metadata: Metadata = {
  title: 'Contact KivaroTools — Support & Bug Reports',
  description:
    'Contact the KivaroTools engineering team for support, bug reports, tax or financial calculation inquiries, and new browser utility requests worldwide.',
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: 'Contact KivaroTools — Support & Bug Reports | KivaroTools',
    description:
      'Contact the KivaroTools engineering team for support, bug reports, tax or financial calculation inquiries, and new browser utility requests worldwide.',
    url: `${SITE_URL}/contact`,
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kivarotools',
    creator: '@kivarotools',
    title: 'Contact KivaroTools — Support & Bug Reports | KivaroTools',
    description:
      'Contact the KivaroTools engineering team for support, bug reports, tax or financial calculation inquiries, and new browser utility requests worldwide.',
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function ContactPage() {
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${SITE_URL}/contact#webpage`,
    name: 'Contact KivaroTools',
    url: `${SITE_URL}/contact`,
    description: 'Support, bug reporting, statutory tax inquiry, and feedback contact channel for KivaroTools.',
    inLanguage: 'en',
    mainEntity: {
      '@type': 'Organization',
      name: 'KivaroTools',
      url: SITE_URL,
      ...(CONTACT_EMAIL
        ? {
          contactPoint: {
            '@type': 'ContactPoint',
            email: CONTACT_EMAIL,
            contactType: 'customer support',
            availableLanguage: ['English'],
          },
        }
        : {}),
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Contact', item: `${SITE_URL}/contact` },
    ],
  };

  return (
    <main className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
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
              Contact
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-12 border-b border-slate-200 pb-10 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
            <MessageSquare className="h-4 w-4" />
            Support &amp; Engineering Feedback
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            Contact <span className="text-blue-600">KivaroTools</span>
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
            We welcome constructive feedback, bug reports, statutory tax or financial calculation discrepancy inquiries,
            privacy requests, and new utility suggestions from engineers, financial planners, and users worldwide.
          </p>
        </header>

        {/* Operator Profile Notice */}
        <section className="mb-10 rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Independent Digital Utility Suite
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                KivaroTools is an independent web utility platform developed and operated in {OPERATOR_LOCATION},
                serving visitors, software engineers, financial analysts, and businesses across the globe. We build
                transparent, 100% client-side tools designed to make complex calculations, database inspections, and
                document transformations accessible without registration barriers or server uploads.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Email Section */}
        <section className="mb-12 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Direct Communication
          </h2>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Email Support &amp; Engineering Desk</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Technical support, bug reports, statutory tax updates, and legal/privacy notices (Typical response: 24–48 business hours)
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
              {CONTACT_EMAIL ? (
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Send your message directly to:
                  </p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-base font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/40"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{CONTACT_EMAIL}</span>
                  </a>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs leading-5 text-amber-900 dark:text-amber-200">
                      <p className="font-semibold text-sm mb-1">Support Channel Notice</p>
                      <p>
                        Please review our{' '}
                        <Link href="/about" className="underline font-semibold hover:text-amber-950 dark:hover:text-amber-100">
                          About KivaroTools
                        </Link>{' '}
                        page for architecture details.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Communication Guidelines Grid */}
        <section className="mb-12 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            What You Can Contact Us About
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <Bug className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                Bug &amp; Parser Discrepancy Reports
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                If you encounter a calculation issue, PDF/Parquet/SQLite parser edge case, browser compatibility problem,
                or UI glitch, please include the tool URL, your browser/OS version, and non-sensitive reproduction steps
                so our engineering team can verify and patch it promptly.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                Statutory Tax &amp; Financial Ruleset Updates
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Notice a newly enacted Finance Act amendment, social security ceiling adjustment, or regional tax slab
                update across our 22 country salary calculators or Contractor vs. Employee models? Send us the official
                statutory citation for immediate ruleset verification.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                Feature &amp; New Utility Suggestions
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Have an idea for a new client-side calculator, binary file inspector, cryptographic debugger, or document
                workflow that fits our zero-upload ethos? We prioritize community requests in upcoming engineering sprints.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                Security, Privacy &amp; Responsible Disclosure
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Because our tools process data locally in client browser memory, server-side exposure is minimized by
                design. For GDPR/CCPA privacy inquiries or responsible security vulnerability disclosures, reach out
                directly via our support email.
              </p>
            </div>
          </div>
        </section>

        {/* Common Support Questions (Self-Service FAQ) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Frequently Asked Support Questions
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                1. Can KivaroTools recover a PDF, SQLite file, or invoice I processed earlier?
              </h3>
              <p className="mt-1">
                No. Because all 42 tools on KivaroTools execute 100% locally inside your browser&apos;s volatile memory (RAM) with
                zero server uploads, your files and inputs never touch our servers. Once you close your browser tab, the in-memory
                buffer is permanently destroyed.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                2. Do I need to include my confidential file when reporting a bug?
              </h3>
              <p className="mt-1">
                Never send confidential bank statements, production private keys, or live customer databases via email. Instead,
                use our built-in synthetic sample presets or describe the structural format (e.g., PDF producer version, Parquet
                compression codec, or Cron dialect) so we can reproduce the issue safely.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}