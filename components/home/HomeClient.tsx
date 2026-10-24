'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  LayoutGrid,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';

import { categories, tools, type CategoryId } from '@/config/toolsData';
import AdUnit from '@/components/ads/AdUnit';

type FilterCategory = 'all' | CategoryId;

export default function HomeClient() {
  const [activeCategory, setActiveCategory] =
    useState<FilterCategory>('all');

  const filteredTools = useMemo(() => {
    const visibleTools = tools.filter((tool) => tool.status === 'published' && !tool.hidden);
    if (activeCategory === 'all') {
      return visibleTools;
    }

    return visibleTools.filter((tool) => tool.categoryId === activeCategory);
  }, [activeCategory]);

  const popularTools = useMemo(() => {
    return tools.filter((tool) => tool.isPopular && tool.status === 'published' && !tool.hidden).slice(0, 6);
  }, []);

  const getCategory = (categoryId: CategoryId) =>
    categories.find((category) => category.id === categoryId);

  const homeAdSlot = process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT;

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-500/[0.06] blur-3xl dark:bg-blue-500/[0.08]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
              <Sparkles className="h-4 w-4" />
              Privacy-conscious online tools
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
              Powerful Tools.
              <span className="block text-blue-600">
                Private by Design.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
              Free browser-based tools for developers, creators,
              businesses, and everyday tasks.
            </p>

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              No registration. No unnecessary uploads.
            </p>

            {/* Trust points */}
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                Privacy-conscious
              </span>

              <span className="inline-flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-blue-600" />
                No account required
              </span>

              <span className="inline-flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                Browser-based tools
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tools */}
      {popularTools.length > 0 && (
        <section className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/30">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                  Quick access
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  Popular Tools
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory('all');
                  document
                    .getElementById('all-tools')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hidden items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700 sm:flex"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {popularTools.map((tool) => {
                const category = getCategory(tool.categoryId);

                return (
                  <Link
                    key={tool.id}
                    href={`/${tool.categoryId}/${tool.slug}`}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800 dark:hover:shadow-black/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="mb-3 inline-flex rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                          <Wrench className="h-5 w-5" />
                        </div>

                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {tool.name}
                        </h3>

                        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                          {tool.description}
                        </p>
                      </div>

                      <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:text-blue-600" />
                    </div>

                    {category && (
                      <p className="mt-4 text-xs font-medium text-slate-400">
                        {category.name}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* All Tools */}
      <section
        id="all-tools"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8"
      >
        <div className="mb-8">
          <div className="flex items-center gap-2 text-blue-600">
            <LayoutGrid className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Tool library
            </span>
          </div>

          <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Explore Free Tools
              </h2>

              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Choose a category or browse the complete collection.
              </p>
            </div>

            <span className="text-sm text-slate-500 dark:text-slate-400">
              {filteredTools.length}{' '}
              {filteredTools.length === 1 ? 'tool' : 'tools'}
            </span>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              aria-pressed={activeCategory === 'all'}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeCategory === 'all'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              All Tools
            </button>

            {categories.filter((category) => !category.hidden).map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tool Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool) => {
              const category = getCategory(tool.categoryId);

              return (
                <Link
                  key={tool.id}
                  href={`/${tool.categoryId}/${tool.slug}`}
                  className="group flex min-h-[190px] flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800 dark:hover:shadow-black/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      <Wrench className="h-5 w-5" />
                    </div>

                    <ArrowUpRight className="h-5 w-5 text-slate-300 transition group-hover:text-blue-600 dark:text-slate-600" />
                  </div>

                  <div className="mt-5 flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {tool.name}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {tool.description}
                    </p>
                  </div>

                  {category && (
                    <div className="mt-5 flex items-center gap-2 text-xs font-medium text-slate-400">
                      <span>{category.name}</span>

                      {tool.isPopular && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 dark:text-blue-400">
                            Popular
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
            <Search className="mx-auto h-8 w-8 text-slate-400" />

            <h3 className="mt-4 font-semibold">
              No tools in this category yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              More tools are being added to this category.
            </p>

            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Browse all tools
            </button>
          </div>
        )}
      </section>

      {/* Ad */}
      {homeAdSlot && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AdUnit slotId={homeAdSlot} />
        </div>
      )}

      {/* Why KivaroTools */}
      <section className="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Why KivaroTools
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Simple tools without unnecessary friction
            </h2>

            <p className="mt-4 text-slate-600 dark:text-slate-400">
              KivaroTools is built around straightforward tools that are
              easy to access and simple to use.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Privacy-conscious"
              description="Tools are designed with privacy in mind, with browser-based processing where the individual tool supports it."
            />

            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="Fast & focused"
              description="Open a tool, enter your data, and get the result without unnecessary account or workflow steps."
            />

            <FeatureCard
              icon={<Wrench className="h-5 w-5" />}
              title="Practical tools"
              description="A growing collection covering development, finance, documents, media, SEO, and everyday tasks."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              How it works
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Three simple steps
            </h2>

            <p className="mt-4 max-w-lg leading-7 text-slate-600 dark:text-slate-400">
              Find the tool you need, enter the required information,
              and use the result immediately.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StepCard
              number="01"
              title="Choose a tool"
              description="Search the library or browse by category."
            />

            <StepCard
              number="02"
              title="Enter your data"
              description="Provide the inputs required by the selected tool."
            />

            <StepCard
              number="03"
              title="Get your result"
              description="Use, copy, download, or continue with the result."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              FAQ
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
          </div>

          <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            <FaqItem
              question="Are KivaroTools free to use?"
              answer="The tools currently provided on KivaroTools are intended to be available without registration or a paid account."
            />

            <FaqItem
              question="Do I need to create an account?"
              answer="No account is required for the current tool experience."
            />

            <FaqItem
              question="Are my files uploaded?"
              answer="It depends on the individual tool. Tools that process files should clearly indicate how processing works. Browser-based tools can process supported data locally in the browser."
            />

            <FaqItem
              question="Can I use the tools on mobile?"
              answer="The site is designed to work across modern desktop and mobile browsers, although individual tools may have different interface requirements."
            />

            <FaqItem
              question="Are the results guaranteed to be accurate?"
              answer="Tools provide calculations or transformations based on the information you enter. For financial, legal, medical, or other high-stakes decisions, verify important results with an appropriate professional or authoritative source."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="mx-auto inline-flex rounded-2xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <Wrench className="h-6 w-6" />
          </div>

          <h2 className="mt-5 text-3xl font-bold tracking-tight">
            Find the tool you need
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-400">
            Browse the collection or use search to get started.
          </p>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById('all-tools')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Browse all tools
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="inline-flex rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
        {icon}
      </div>

      <h3 className="mt-5 font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          {number}
        </span>

        <Check className="h-4 w-4 text-blue-600" />
      </div>

      <h3 className="mt-5 font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group p-5 sm:p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:hidden">
        <span>{question}</span>

        <span className="shrink-0 text-xl text-slate-400 transition group-open:rotate-45">
          +
        </span>
      </summary>

      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400">
        {answer}
      </p>
    </details>
  );
}