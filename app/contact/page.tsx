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
} from 'lucide-react';
import { CONTACT_EMAIL, OPERATOR_LOCATION } from '@/config/site';

export const metadata: Metadata = {
  title: 'Contact KivaroTools',
  description:
    'Get in touch with KivaroTools for feedback, bug reports, tool suggestions, or general inquiries. Serving users worldwide.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact KivaroTools',
    description:
      'Get in touch with KivaroTools for feedback, bug reports, tool suggestions, or general inquiries.',
    url: '/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact KivaroTools',
    description:
      'Get in touch with KivaroTools for feedback, bug reports, tool suggestions, or general inquiries.',
  },
};

export default function ContactPage() {
  return (
    <main className="w-full">
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
            Support &amp; Feedback
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            Contact <span className="text-blue-600">KivaroTools</span>
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
            We welcome constructive feedback, bug reports, calculation discrepancy reports, and
            feature suggestions from users worldwide.
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
                Independent Digital Utility
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                KivaroTools is an independent web utility project developed and operated by an individual
                based in {OPERATOR_LOCATION}, serving visitors and developers across the globe. We build
                transparent, client-side tools designed to make common calculations and formatting tasks
                accessible without registration barriers.
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
                <h3 className="text-base font-semibold">Email Channel</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Inquiries, suggestions, and corrections</p>
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
                      <p className="font-semibold text-sm mb-1">Dedicated Support Email Pending Launch</p>
                      <p>
                        A dedicated domain email inbox for user correspondence is being configured for the
                        upcoming public release. No placeholder or unmonitored mailbox is published here.
                        Please check back shortly or review our{' '}
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
                Bug &amp; Discrepancy Reports
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                If you encounter a calculation issue, statutory tax discrepancy, browser compatibility problem,
                or UI glitch, please include the tool URL, your browser/device type, and the inputs used so we
                can reproduce and rectify it.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                Feature &amp; Tool Suggestions
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Have an idea for a new client-side calculator, conversion format, or developer utility that fits
                our privacy-first ethos? We review community recommendations for upcoming development cycles.
              </p>
            </div>
          </div>
        </section>

        {/* Responsible Security Disclosure */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Security &amp; Responsible Disclosure
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                We take security seriously. Because our tools process data locally in client browser memory,
                server-side exposure is minimized by architecture. If you discover a potential vulnerability
                or security concern, please disclose it responsibly with actionable reproduction steps.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
