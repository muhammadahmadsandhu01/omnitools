'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Clock,
  Code2,
  Database,
  FileText,
  Globe,
  Image as ImageIcon,
  LayoutGrid,
  LockKeyhole,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';

import { categories, tools, type CategoryId } from '@/config/toolsData';
import { SALARY_COUNTRIES, type SalaryRegion } from '@/config/salaryCountries';
import { HOME_FAQS } from '@/config/homeFaqs';

export { HOME_FAQS };

type FilterCategory = 'all' | CategoryId;
type RegionFilter = 'All' | SalaryRegion;

interface RecentToolEntry {
  href: string;
  name: string;
}

const RECENT_STORAGE_KEY = 'kivarotools_recent_tools_v1';

/** Tools that explicitly call external/server APIs for live data or URL inspection */
const LIVE_API_TOOL_SLUGS = new Set([
  'precious-metals',
  'crypto-converter',
  'meta-generator',
]);

/**
 * 4 Task-First Workflow Lanes resolved dynamically from toolsData.ts
 * so no hardcoded slug can ever become a 404 broken link.
 */
const WORKFLOW_LANE_DEFS = [
  {
    id: 'inspect-data',
    title: 'Inspect & Query Data',
    subtitle: 'Open binary databases, columnar files, and network traces locally.',
    icon: Database,
    accent: 'text-emerald-600 dark:text-emerald-400',
    categoryFallback: 'developer' as CategoryId,
    preferredSlugs: [
      'sqlite-viewer',
      'parquet-viewer',
      'json-formatter',
      'har-analyzer',
    ],
  },
  {
    id: 'documents-pdf',
    title: 'Edit & Sanitize PDFs',
    subtitle: 'Merge, compress, redact, sign, and convert documents in browser RAM.',
    icon: FileText,
    accent: 'text-orange-600 dark:text-orange-400',
    categoryFallback: 'document' as CategoryId,
    preferredSlugs: [
      'pdf-merge-split',
      'compress-pdf',
      'pdf-scrubber',
      'pdf-signer-bates-stamper',
    ],
  },
  {
    id: 'code-media',
    title: 'Transform Code, Media & SEO',
    subtitle: 'Compile API schemas, optimize images, and generate static QR or meta tags.',
    icon: Code2,
    accent: 'text-blue-600 dark:text-blue-400',
    categoryFallback: 'media' as CategoryId,
    preferredSlugs: [
      'openapi-to-typescript',
      'image-compressor',
      'heic-to-jpg',
      'qr-generator',
    ],
  },
  {
    id: 'finance-tax',
    title: 'Calculate Salaries & Finance',
    subtitle: 'Model take-home pay, mortgages, loans, investments, and clean PDF invoices.',
    icon: Calculator,
    accent: 'text-indigo-600 dark:text-indigo-400',
    categoryFallback: 'finance' as CategoryId,
    preferredSlugs: [
      'salary-calculator',
      'mortgage-calculator',
      'emi-calculator',
      'invoice-generator',
    ],
  },
] as const;

const REGION_TABS: RegionFilter[] = ['All', 'Americas', 'Europe', 'APAC', 'MENA', 'Africa'];

export default function HomeClient() {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [inlineFilter, setInlineFilter] = useState('');
  const [activeRegion, setActiveRegion] = useState<RegionFilter>('All');
  const [recentTools, setRecentTools] = useState<RecentToolEntry[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setRecentTools(
          parsed
            .filter(
              (item): item is RecentToolEntry =>
                Boolean(item && typeof item.href === 'string' && typeof item.name === 'string')
            )
            .slice(0, 5)
        );
      }
    } catch {
      // Ignore storage errors in private browsing
    }
  }, []);

  function recordToolVisit(href: string, name: string) {
    try {
      const next = [{ href, name }, ...recentTools.filter((item) => item.href !== href)].slice(0, 5);
      setRecentTools(next);
      window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  }

  function clearRecentTools() {
    setRecentTools([]);
    try {
      window.localStorage.removeItem(RECENT_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  const visibleCategories = useMemo(
    () => categories.filter((category) => !category.hidden),
    []
  );

  const publishedTools = useMemo(
    () => tools.filter((tool) => tool.status === 'published' && !tool.hidden),
    []
  );

  const localOnlyCount = useMemo(
    () => publishedTools.filter((tool) => !LIVE_API_TOOL_SLUGS.has(tool.slug)).length,
    [publishedTools]
  );

  // Dynamically resolve workflow lane links from publishedTools (zero 404 risk)
  const resolvedWorkflowLanes = useMemo(() => {
    const bySlug = new Map(publishedTools.map((t) => [t.slug, t]));

    return WORKFLOW_LANE_DEFS.map((lane) => {
      const matched = lane.preferredSlugs
        .map((slug) => bySlug.get(slug))
        .filter((t): t is (typeof publishedTools)[number] => Boolean(t));

      // Backfill up to 4 real tools from the lane's category if any preferred slug changed
      if (matched.length < 4) {
        const used = new Set(matched.map((t) => t.slug));
        for (const candidate of publishedTools) {
          if (candidate.categoryId === lane.categoryFallback && !used.has(candidate.slug)) {
            matched.push(candidate);
            used.add(candidate.slug);
            if (matched.length === 4) break;
          }
        }
      }

      return {
        ...lane,
        links: matched.map((tool) => ({
          label: tool.name,
          href: `/${tool.categoryId}/${tool.slug}`,
        })),
      };
    });
  }, [publishedTools]);

  const filteredTools = useMemo(() => {
    const q = inlineFilter.trim().toLowerCase();
    return publishedTools.filter((tool) => {
      if (activeCategory !== 'all' && tool.categoryId !== activeCategory) {
        return false;
      }
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.slug.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q)
      );
    });
  }, [publishedTools, activeCategory, inlineFilter]);

  const filteredCountries = useMemo(() => {
    if (activeRegion === 'All') return SALARY_COUNTRIES;
    return SALARY_COUNTRIES.filter((c) => c.region === activeRegion);
  }, [activeRegion]);

  const getCategory = (categoryId: CategoryId) =>
    categories.find((category) => category.id === categoryId);

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* =====================================================================
          1. COMPACT TECHNICAL WORKBENCH HERO (SINGLE H1 + SPEC STRIP)
         ===================================================================== */}
      <section className="relative border-b border-slate-200 bg-slate-50/70 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:22px_22px] dark:border-slate-800 dark:bg-slate-950 dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl dark:text-white">
              Free Browser Tools,{' '}
              <span className="text-blue-600 dark:text-blue-400">Private by Design.</span>
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-700 sm:text-lg dark:text-slate-300">
              Run {publishedTools.length} fast utilities for code, documents, media, and{' '}
              {SALARY_COUNTRIES.length} country salary calculators directly in your browser—no
              account, no paywall, and no watermarks.
            </p>

            {/* Precision Workbench Spec Strip */}
            <dl className="mt-6 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-3 border-y border-slate-200/90 py-3.5 font-mono text-xs sm:grid-cols-4 dark:border-slate-800">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Utilities</dt>
                <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                  {publishedTools.length} Published
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Salary Models</dt>
                <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                  {SALARY_COUNTRIES.length} Countries
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Local Engine</dt>
                <dd className="mt-0.5 font-semibold text-emerald-700 dark:text-emerald-400">
                  {localOnlyCount} In-Browser
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Access</dt>
                <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                  Zero Signup
                </dd>
              </div>
            </dl>

            {/* Quick Category Hub Links (Crawlable SSR + 44px touch targets) */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {visibleCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    href={`/${cat.id}`}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-blue-500 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
                  >
                    <Icon className={`h-4 w-4 ${cat.color}`} aria-hidden="true" />
                    <span>{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* On-Device Recently Used Strip (Rendered only after >=1 visit; disclosed localStorage) */}
          {recentTools.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-slate-200/90 pt-5 dark:border-slate-800">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                Recent on this device:
              </span>
              {recentTools.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 transition-colors hover:border-blue-500 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500"
                >
                  {item.name}
                </Link>
              ))}
              <button
                type="button"
                onClick={clearRecentTools}
                aria-label="Clear recently used tools stored locally in your browser"
                className="inline-flex min-h-[44px] items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear
              </button>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                (Saved locally in browser storage only)
              </span>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          2. FOUR TASK-FIRST WORKFLOW LANES (DYNAMICALLY RESOLVED FROM REGISTRY)
         ===================================================================== */}
      <section
        aria-labelledby="workflow-lanes-heading"
        className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2
                id="workflow-lanes-heading"
                className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white"
              >
                Start by Task
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Jump straight into common developer, document, media, and financial workflows.
              </p>
            </div>
            <a
              href="#tool-library"
              className="inline-flex min-h-[44px] items-center gap-1 self-start text-sm font-semibold text-blue-700 hover:underline sm:self-auto dark:text-blue-400"
            >
              Browse all {publishedTools.length} tools
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {resolvedWorkflowLanes.map((lane) => {
              const Icon = lane.icon;
              return (
                <div
                  key={lane.id}
                  className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-5 w-5 shrink-0 ${lane.accent}`} aria-hidden="true" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {lane.title}
                    </h3>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-slate-600 dark:text-slate-400">
                    {lane.subtitle}
                  </p>
                  <ul className="mt-4 space-y-1 border-t border-slate-200/80 pt-3 dark:border-slate-800">
                    {lane.links.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => recordToolVisit(item.href, item.label)}
                          className="group flex min-h-[40px] items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-white hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                        >
                          <span className="truncate">{item.label}</span>
                          <ArrowUpRight
                            className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-400"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. UNIFIED TOOL LIBRARY (SINGLE SSR-CRAWLABLE DIRECTORY)
         ===================================================================== */}
      <section
        id="tool-library"
        aria-labelledby="tool-library-heading"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider">
                Complete Directory
              </span>
            </div>
            <h2
              id="tool-library-heading"
              className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white"
            >
              All {publishedTools.length} Browser Tools
            </h2>
          </div>

          {/* Inline Quick Filter (44px height) */}
          <div className="relative w-full sm:max-w-xs">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={inlineFilter}
              onChange={(e) => setInlineFilter(e.target.value)}
              placeholder="Filter tools by name or format..."
              aria-label="Filter tools in directory"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 motion-reduce:transition-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Category Filter Tabs (44px touch targets) */}
        <div className="mt-6 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-2" role="tablist" aria-label="Filter tools by category">
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
              className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none ${activeCategory === 'all'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                }`}
            >
              All ({publishedTools.length})
            </button>

            {visibleCategories.map((category) => {
              const count = publishedTools.filter((t) => t.categoryId === category.id).length;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(category.id)}
                  className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none ${isActive
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                >
                  {category.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact, High-Scanability Tool Grid */}
        {filteredTools.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => {
              const category = getCategory(tool.categoryId);
              const Icon = category?.icon || ImageIcon;
              const isLiveApi = LIVE_API_TOOL_SLUGS.has(tool.slug);
              const href = `/${tool.categoryId}/${tool.slug}`;

              return (
                <Link
                  key={tool.id}
                  href={href}
                  onClick={() => recordToolVisit(href, tool.name)}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${category?.color || 'text-blue-600'}`}
                          aria-hidden="true"
                        />
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {category?.name}
                        </span>
                      </div>
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold ${isLiveApi
                            ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                      >
                        {isLiveApi ? 'Local + API' : 'In-Browser'}
                      </span>
                    </div>

                    <h3 className="mt-2.5 text-sm font-bold text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400">
                      {tool.name}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                      {tool.description}
                    </p>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs font-semibold text-blue-700 dark:border-slate-800 dark:text-blue-400">
                    <span>Open workspace</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No matching tools found
            </p>
            <button
              type="button"
              onClick={() => {
                setInlineFilter('');
                setActiveCategory('all');
              }}
              className="mt-3 inline-flex min-h-[44px] items-center px-4 text-xs font-semibold text-blue-700 hover:underline dark:text-blue-400"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* =====================================================================
          4. 22-COUNTRY STATUTORY SALARY CALCULATOR STRIP
         ===================================================================== */}
      <section
        aria-labelledby="country-salary-heading"
        className="border-y border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40"
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Globe className="h-4 w-4" aria-hidden="true" />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider">
                  International Payroll &amp; Tax
                </span>
              </div>
              <h2
                id="country-salary-heading"
                className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
              >
                22 Country Salary &amp; Take-Home Pay Calculators
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Dedicated gross-to-net calculators with national tax brackets, social security caps, and employer cost breakdowns.
              </p>
            </div>
            <Link
              href="/finance/salary-calculator"
              className="inline-flex min-h-[44px] shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:underline dark:text-blue-400"
            >
              Open Global Salary Hub
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Region Filter Tabs (44px touch targets) */}
          <div className="mt-6 flex flex-wrap gap-2">
            {REGION_TABS.map((region) => {
              const active = activeRegion === region;
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => setActiveRegion(region)}
                  className={`min-h-[44px] rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none ${active
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                >
                  {region === 'All' ? `All (${SALARY_COUNTRIES.length})` : region}
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {filteredCountries.map((country) => (
              <Link
                key={country.slug}
                href={`/finance/salary-calculator/${country.slug}`}
                onClick={() =>
                  recordToolVisit(
                    `/finance/salary-calculator/${country.slug}`,
                    `${country.name} Salary Calculator`
                  )
                }
                className="group flex min-h-[52px] items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-xs transition-colors hover:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500"
              >
                <span className="text-base leading-none" aria-hidden="true">
                  {country.flag}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-900 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400">
                    {country.name}
                  </div>
                  <div className="truncate font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    {country.currency}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. ORIGINAL PUBLISHER CONTENT: HOW KIVAROTOOLS WORKS & DATA HANDLING
         ===================================================================== */}
      <section
        aria-labelledby="architecture-transparency-heading"
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2
              id="architecture-transparency-heading"
              className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              How KivaroTools Works &amp; Handles Your Data
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Most online utility portals upload your PDFs, database files, or code snippets to remote servers before returning a download link. KivaroTools is built to keep routine file and code processing on your own device whenever technically possible, while clearly labeling the few tools that require live network lookups.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Local-First File &amp; Code Processing
                </h3>
              </div>
              <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-400">
                Utilities marked <strong>In-Browser</strong> run directly in your browser using standard Web APIs (Canvas, Web Workers, Web Crypto, and TypeScript parsers). Your documents, SQLite databases, Parquet datasets, and JSON payloads stay in local memory.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <LockKeyhole className="h-5 w-5" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Transparent Live-API Boundaries
                </h3>
              </div>
              <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-400">
                Tools marked <strong>Local + API</strong> (Precious Metals, Currency &amp; Crypto Converter, and Meta Tag URL Auditor) make targeted outbound requests only to fetch market quotes or inspect a public URL you explicitly submit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. FREQUENTLY ASKED QUESTIONS (MATCHES JSON-LD FAQPage EXACTLY)
         ===================================================================== */}
      <section
        aria-labelledby="home-faq-heading"
        className="border-t border-slate-200 dark:border-slate-800"
      >
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <h2
            id="home-faq-heading"
            className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Frequently Asked Questions
          </h2>

          <div className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {HOME_FAQS.map((faq, index) => (
              <details key={index} className="group p-5">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900 marker:hidden sm:text-base dark:text-white">
                  <span>{faq.question}</span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-xl text-slate-400 transition group-open:rotate-45 motion-reduce:transition-none"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}