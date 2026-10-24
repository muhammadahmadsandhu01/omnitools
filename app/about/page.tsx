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
} from 'lucide-react';
import { categories } from '@/config/toolsData';

export const metadata: Metadata = {
  title: 'About KivaroTools',
  description:
    'Learn about KivaroTools, our browser-based utility suite, client-side execution model, and commitment to privacy-conscious computing.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About KivaroTools',
    description:
      'Learn about KivaroTools, our browser-based utility suite, client-side execution model, and commitment to privacy-conscious computing.',
    url: '/about',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About KivaroTools',
    description:
      'Learn about KivaroTools, our browser-based utility suite, client-side execution model, and commitment to privacy-conscious computing.',
  },
};

export default function AboutPage() {
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
              About
            </li>
          </ol>
        </nav>

        {/* Hero Header */}
        <header className="mb-12 border-b border-slate-200 pb-10 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
            <ShieldCheck className="h-4 w-4" />
            Privacy-Conscious Utility Suite
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            Powerful Tools. <span className="text-blue-600">Private by Design.</span>
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
            KivaroTools provides free, browser-based utilities for developers, creators, businesses,
            and everyday digital tasks. We believe essential computational tools should be fast,
            accessible, and private—without registration walls or unnecessary data transmission.
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
                Client-Side Processing
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Calculations, formatting, image compression, PDF operations, and text transformations execute
                directly within your browser runtime via Web Workers and Web APIs.
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
                Every tool is immediately accessible. No account sign-ups, credit cards, or email registrations
                are required to format code, generate invoices, or compute payroll taxes.
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
                Calculators are codified with explicit statutory schedules, documented assumptions, and
                ruleset version identifiers to ensure predictable, transparent results.
              </p>
            </div>
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
                      Explore free, browser-based utilities in {cat.name.toLowerCase()}.
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
          </div>
        </section>
      </div>
    </main>
  );
}
