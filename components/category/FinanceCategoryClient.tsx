'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
    AlertCircle,
    ArrowUpRight,
    Briefcase,
    Calculator,
    CheckCircle2,
    ChevronRight,
    Coins,
    Globe,
    Home,
    Landmark,
    LayoutGrid,
    Receipt,
    Search,
    ShieldCheck,
    TrendingUp,
    X,
} from 'lucide-react';

import { categories, tools, type CategoryId } from '@/config/toolsData';
import { SALARY_COUNTRIES, type SalaryRegion } from '@/config/salaryCountries';
import AdUnit from '@/components/ads/AdUnit';
import {
    FINANCE_ARCHITECTURE_PILLARS,
    FINANCE_CATEGORY_FAQS,
    FINANCE_CATEGORY_SEO,
    FINANCE_LIVE_API_SLUGS,
    FINANCE_TOOL_SPECS,
    resolveFinanceToolGroups,
} from '@/config/financeCategoryConfig';

type GroupFilter = 'all' | string;
type RegionFilter = 'All' | SalaryRegion;

const REGION_OPTIONS: readonly RegionFilter[] = [
    'All',
    'Americas',
    'Europe',
    'APAC',
    'MENA',
    'Africa',
] as const;

const GROUP_ICONS: Record<string, typeof Calculator> = {
    'loans-mortgages': Landmark,
    'salary-payroll-tax': Briefcase,
    'investing-wealth': TrendingUp,
    'startup-business-invoicing': Receipt,
    'metals-currency-fx': Coins,
};

const GROUP_ACCENTS: Record<string, string> = {
    'loans-mortgages': 'text-blue-600 dark:text-blue-400',
    'salary-payroll-tax': 'text-emerald-600 dark:text-emerald-400',
    'investing-wealth': 'text-indigo-600 dark:text-indigo-400',
    'startup-business-invoicing': 'text-violet-600 dark:text-violet-400',
    'metals-currency-fx': 'text-amber-600 dark:text-amber-400',
};

export default function FinanceCategoryClient() {
    const [activeGroup, setActiveGroup] = useState<GroupFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeRegion, setActiveRegion] = useState<RegionFilter>('All');

    const financeTools = useMemo(
        () =>
            tools.filter(
                (tool) =>
                    tool.categoryId === 'finance' &&
                    tool.status === 'published' &&
                    !tool.hidden
            ),
        []
    );

    const allGroups = useMemo(
        () => resolveFinanceToolGroups(financeTools),
        [financeTools]
    );

    const localToolCount = useMemo(
        () =>
            financeTools.filter((tool) => !FINANCE_LIVE_API_SLUGS.has(tool.slug))
                .length,
        [financeTools]
    );

    const liveApiToolCount = financeTools.length - localToolCount;

    const siblingCategories = useMemo(
        () =>
            categories.filter(
                (cat) => !cat.hidden && cat.id !== ('finance' as CategoryId)
            ),
        []
    );

    const normalizedQuery = searchQuery.trim().toLowerCase();

    const visibleGroups = useMemo(() => {
        return allGroups
            .filter((group) => activeGroup === 'all' || group.id === activeGroup)
            .map((group) => {
                if (!normalizedQuery) return group;
                const matchedTools = group.tools.filter((tool) => {
                    const spec = (FINANCE_TOOL_SPECS[tool.slug] || '').toLowerCase();
                    const features = (tool.featureList || []).join(' ').toLowerCase();
                    return (
                        tool.name.toLowerCase().includes(normalizedQuery) ||
                        tool.slug.toLowerCase().includes(normalizedQuery) ||
                        tool.description.toLowerCase().includes(normalizedQuery) ||
                        spec.includes(normalizedQuery) ||
                        features.includes(normalizedQuery)
                    );
                });
                return {
                    ...group,
                    tools: matchedTools,
                };
            })
            .filter((group) => group.tools.length > 0);
    }, [allGroups, activeGroup, normalizedQuery]);

    const visibleToolCount = useMemo(
        () => visibleGroups.reduce((sum, group) => sum + group.tools.length, 0),
        [visibleGroups]
    );

    const filteredSalaryCountries = useMemo(() => {
        if (activeRegion === 'All') return SALARY_COUNTRIES;
        return SALARY_COUNTRIES.filter((c) => c.region === activeRegion);
    }, [activeRegion]);

    const categoryAdSlot = process.env.NEXT_PUBLIC_ADSENSE_CATEGORY_SLOT || '';

    return (
        <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
            {/* =====================================================================
          1. COMPACT FINANCIAL WORKBENCH HERO (MATCHES HOMEPAGE & DEVELOPER HUB)
         ===================================================================== */}
            <section className="relative border-b border-slate-200 bg-slate-50/70 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:22px_22px] dark:border-slate-800 dark:bg-slate-950 dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)]">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                    {/* Breadcrumbs */}
                    <nav aria-label="Breadcrumb" className="mb-6">
                        <ol className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600 sm:text-sm dark:text-slate-400">
                            <li>
                                <Link
                                    href="/"
                                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:text-blue-400"
                                >
                                    <Home className="h-4 w-4" aria-hidden="true" />
                                    <span>Home</span>
                                </Link>
                            </li>
                            <li aria-hidden="true">
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                            </li>
                            <li
                                aria-current="page"
                                className="font-semibold text-slate-900 dark:text-slate-100"
                            >
                                Finance &amp; Calculators
                            </li>
                        </ol>
                    </nav>

                    <div className="max-w-3xl">
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl dark:text-white">
                            {FINANCE_CATEGORY_SEO.h1Primary}
                            <span className="block text-blue-600 dark:text-blue-400">
                                {FINANCE_CATEGORY_SEO.h1Accent}
                            </span>
                        </h1>

                        <p className="mt-4 text-base leading-7 text-slate-700 sm:text-lg dark:text-slate-300">
                            {FINANCE_CATEGORY_SEO.heroLead}
                        </p>

                        {/* Precision Workbench Spec Strip */}
                        <dl className="mt-6 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-3 border-y border-slate-200/90 py-3.5 font-mono text-xs sm:grid-cols-4 dark:border-slate-800">
                            <div>
                                <dt className="text-slate-500 dark:text-slate-400">Calculators</dt>
                                <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                                    {financeTools.length} Published
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500 dark:text-slate-400">Salary Engines</dt>
                                <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                                    {SALARY_COUNTRIES.length} Countries
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500 dark:text-slate-400">Execution</dt>
                                <dd className="mt-0.5 font-semibold text-emerald-700 dark:text-emerald-400">
                                    {localToolCount} Local · {liveApiToolCount} Live API
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500 dark:text-slate-400">Access</dt>
                                <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                                    Zero Signup
                                </dd>
                            </div>
                        </dl>

                        {/* Crawlable Subtopic Jump-Links (44px touch targets) */}
                        <div className="mt-6 flex flex-wrap items-center gap-2">
                            {allGroups.map((group) => {
                                const GroupIcon = GROUP_ICONS[group.id] || Calculator;
                                const accent =
                                    GROUP_ACCENTS[group.id] || 'text-blue-600 dark:text-blue-400';

                                return (
                                    <a
                                        key={group.id}
                                        href={`#${group.id}`}
                                        onClick={() => {
                                            setActiveGroup('all');
                                            setSearchQuery('');
                                        }}
                                        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-blue-500 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
                                    >
                                        <GroupIcon
                                            className={`h-4 w-4 shrink-0 ${accent}`}
                                            aria-hidden="true"
                                        />
                                        <span>{group.label}</span>
                                        <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                                            ({group.tools.length})
                                        </span>
                                    </a>
                                );
                            })}

                            <a
                                href="#country-salary-engines"
                                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-blue-500 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
                            >
                                <Globe
                                    className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400"
                                    aria-hidden="true"
                                />
                                <span>22 Country Tax Engines</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* =====================================================================
          2. SUBTOPIC DIRECTORY + INSTANT CLIENT-SIDE FILTER
         ===================================================================== */}
            <section
                id="finance-directory"
                aria-label="Financial calculators directory"
                className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-14 lg:px-8"
            >
                {/* Directory Controls Bar */}
                <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end dark:border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                            <span className="font-mono text-xs font-semibold uppercase tracking-wider">
                                Financial Calculator Directory
                            </span>
                        </div>
                        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                            Showing{' '}
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {visibleToolCount}
                            </span>{' '}
                            of {financeTools.length} online financial calculators organized by workflow.
                        </p>
                    </div>

                    {/* Instant Search Filter (44px height) */}
                    <div className="relative w-full sm:max-w-xs">
                        <Search
                            aria-hidden="true"
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by mortgage, EMI, tax, SIP..."
                            aria-label="Filter financial calculators by name, topic, or currency feature"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 motion-reduce:transition-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                aria-label="Clear financial calculator filter"
                                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:text-slate-200"
                            >
                                <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Subtopic Filter Tabs (44px touch targets) */}
                <div className="mt-6 overflow-x-auto pb-2">
                    <div
                        className="flex min-w-max gap-2"
                        role="tablist"
                        aria-label="Filter financial calculators by subtopic"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeGroup === 'all'}
                            onClick={() => setActiveGroup('all')}
                            className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none ${activeGroup === 'all'
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                                }`}
                        >
                            All ({financeTools.length})
                        </button>

                        {allGroups.map((group) => {
                            const isActive = activeGroup === group.id;
                            return (
                                <button
                                    key={group.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => setActiveGroup(group.id)}
                                    className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none ${isActive
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                                        }`}
                                >
                                    {group.label} ({group.tools.length})
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Grouped Subtopic Tool Sections */}
                {visibleGroups.length > 0 ? (
                    <div className="mt-8 space-y-12">
                        {visibleGroups.map((group) => {
                            const GroupIcon = GROUP_ICONS[group.id] || Calculator;
                            const accent =
                                GROUP_ACCENTS[group.id] || 'text-blue-600 dark:text-blue-400';

                            return (
                                <section
                                    key={group.id}
                                    id={group.id}
                                    aria-labelledby={`${group.id}-heading`}
                                    className="scroll-mt-24"
                                >
                                    <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                                        <div className="max-w-3xl">
                                            <div className="flex items-center gap-2">
                                                <GroupIcon
                                                    className={`h-5 w-5 shrink-0 ${accent}`}
                                                    aria-hidden="true"
                                                />
                                                <h2
                                                    id={`${group.id}-heading`}
                                                    className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white"
                                                >
                                                    {group.heading}
                                                </h2>
                                            </div>
                                            <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                                {group.description}
                                            </p>
                                        </div>
                                        <span className="shrink-0 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            {group.tools.length}{' '}
                                            {group.tools.length === 1 ? 'calculator' : 'calculators'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {group.tools.map((tool) => {
                                            const specBadge =
                                                FINANCE_TOOL_SPECS[tool.slug] || 'Multi-Currency';
                                            const isLiveApi = FINANCE_LIVE_API_SLUGS.has(tool.slug);

                                            return (
                                                <Link
                                                    key={tool.id}
                                                    href={`/finance/${tool.slug}`}
                                                    className="group flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500"
                                                >
                                                    <div>
                                                        {/* Card Top Meta Row */}
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="truncate font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                                                {specBadge}
                                                            </span>
                                                            {isLiveApi ? (
                                                                <span className="shrink-0 rounded-md bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                                                    Local + API
                                                                </span>
                                                            ) : (
                                                                <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                                    In-Browser
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Tool Title */}
                                                        <h3 className="mt-3 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400">
                                                            {tool.name}
                                                        </h3>

                                                        {/* Concise Description */}
                                                        <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600 dark:text-slate-400">
                                                            {tool.description}
                                                        </p>

                                                        {/* Verified Capability Highlights */}
                                                        {tool.featureList && tool.featureList.length > 0 && (
                                                            <ul className="mt-3.5 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                                                                {tool.featureList.slice(0, 2).map((feat, idx) => (
                                                                    <li
                                                                        key={idx}
                                                                        className="flex items-start gap-1.5"
                                                                    >
                                                                        <CheckCircle2
                                                                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400"
                                                                            aria-hidden="true"
                                                                        />
                                                                        <span className="line-clamp-2">{feat}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>

                                                    {/* Card Footer CTA */}
                                                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-blue-700 dark:border-slate-800 dark:text-blue-400">
                                                        <span>Open calculator</span>
                                                        <ArrowUpRight
                                                            className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
                                                            aria-hidden="true"
                                                        />
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-8 rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            No financial calculators match &ldquo;{searchQuery}&rdquo;
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Try searching for Mortgage, EMI, Salary, IR35, Compound Interest, SIP, Burn Rate, Invoice, Gold, or FX.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setActiveGroup('all');
                            }}
                            className="mt-4 inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-blue-700 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-blue-400"
                        >
                            Reset filters
                        </button>
                    </div>
                )}
            </section>

            {/* Optional AdSense Unit (renders only when valid client + slot env vars exist) */}
            {categoryAdSlot && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <AdUnit slotId={categoryAdSlot} />
                </div>
            )}

            {/* =====================================================================
          3. 22 STATUTORY COUNTRY SALARY & TAX CALCULATORS (REGION FILTERED)
         ===================================================================== */}
            <section
                id="country-salary-engines"
                aria-labelledby="country-salary-engines-heading"
                className="scroll-mt-20 border-y border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40"
            >
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                <Globe className="h-4 w-4" aria-hidden="true" />
                                <span className="font-mono text-xs font-semibold uppercase tracking-wider">
                                    Global Statutory Payroll &amp; Tax Engines
                                </span>
                            </div>
                            <h2
                                id="country-salary-engines-heading"
                                className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white"
                            >
                                22 Country Salary &amp; Net Take-Home Pay Calculators
                            </h2>
                            <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                Filter by region to jump directly into country-specific income tax brackets, social security caps, and employer payroll breakdowns across Americas, Europe, APAC, MENA, and Africa.
                            </p>
                        </div>

                        <Link
                            href="/finance/salary-calculator"
                            className="inline-flex min-h-[44px] shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400"
                        >
                            Open Global Salary Hub
                            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                    </div>

                    {/* Region Filter Pills (44px touch targets) */}
                    <div className="mt-6 overflow-x-auto pb-2">
                        <div
                            className="flex min-w-max gap-2"
                            role="tablist"
                            aria-label="Filter country salary calculators by region"
                        >
                            {REGION_OPTIONS.map((region) => {
                                const isActive = activeRegion === region;
                                const count =
                                    region === 'All'
                                        ? SALARY_COUNTRIES.length
                                        : SALARY_COUNTRIES.filter((c) => c.region === region).length;

                                return (
                                    <button
                                        key={region}
                                        type="button"
                                        role="tab"
                                        aria-selected={isActive}
                                        onClick={() => setActiveRegion(region)}
                                        className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none ${isActive
                                                ? 'border-blue-600 bg-blue-600 text-white'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                                            }`}
                                    >
                                        {region} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Country Engine Cards */}
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {filteredSalaryCountries.map((country) => (
                            <Link
                                key={country.slug}
                                href={`/finance/salary-calculator/${country.slug}`}
                                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400">
                                            <span aria-hidden="true">{country.flag}</span>
                                            <span>{country.name}</span>
                                        </span>
                                        <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                            {country.currency}
                                        </span>
                                    </div>
                                    <p className="mt-1.5 text-xs leading-5 text-slate-600 dark:text-slate-400">
                                        {country.shortLabel}
                                    </p>
                                </div>
                                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] font-semibold text-blue-700 dark:border-slate-800 dark:text-blue-400">
                                    <span>Calculate net pay</span>
                                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* =====================================================================
          4. ORIGINAL PUBLISHER CONTENT: METHODOLOGY, PRIVACY & YMYL DISCLAIMER
         ===================================================================== */}
            <section
                aria-labelledby="finance-methodology-heading"
                className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
            >
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Left Editorial Column */}
                    <div className="lg:col-span-5">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                            <span className="font-mono text-xs font-semibold uppercase tracking-wider">
                                Methodology &amp; Privacy Standards
                            </span>
                        </div>
                        <h2
                            id="finance-methodology-heading"
                            className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                        >
                            Transparent Financial Modeling &amp; Local Privacy
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                            Salary offers, mortgage down payments, startup burn schedules, and client invoices contain sensitive personal and corporate figures. Eight of our ten finance calculators run completely inside your browser with zero server uploads, while our Precious Metals and Currency &amp; Crypto converters connect to public market feeds strictly to retrieve live spot and mid-market exchange rates.
                        </p>
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                            Every calculator pairs transparent formulas—reducing-balance amortization, CFPB 80%/78% LTV PMI thresholds, statutory payroll tax waterfalls, and multi-path Monte Carlo simulations—with clean CSV, Excel, or A4 PDF exports and zero bank upsells.
                        </p>

                        {/* Explicit YMYL Educational Estimates Disclaimer */}
                        <div
                            role="note"
                            aria-label="Financial and tax disclaimer"
                            className="mt-5 rounded-xl border border-amber-200/90 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/30"
                        >
                            <div className="flex items-start gap-2.5">
                                <AlertCircle
                                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400"
                                    aria-hidden="true"
                                />
                                <div className="text-xs leading-5 text-amber-950 dark:text-amber-200">
                                    <p className="font-bold">
                                        Educational Estimates Only — Not Financial, Tax, or Legal Advice
                                    </p>
                                    <p className="mt-1 text-amber-900/90 dark:text-amber-300/90">
                                        Results on KivaroTools are mathematical estimates for planning and comparison purposes only. Statutory tax rules, lender terms, and spot market rates change frequently; consult a qualified CPA, tax advisor, or licensed financial professional before making binding decisions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right 4-Pillar Architecture Grid */}
                    <div className="lg:col-span-7">
                        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/50">
                            <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                                        How KivaroTools Finance Architecture Works
                                    </h3>
                                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                                        Clear separation between local browser calculation and public live market rate lookups.
                                    </p>
                                </div>
                                <span className="hidden shrink-0 rounded-md bg-emerald-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-800 sm:inline-block dark:bg-emerald-950/60 dark:text-emerald-300">
                                    {localToolCount} Local · {liveApiToolCount} Live API
                                </span>
                            </div>

                            <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {FINANCE_ARCHITECTURE_PILLARS.map((item) => (
                                    <li
                                        key={item.step}
                                        className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">
                                                {item.step}
                                            </span>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                {item.title}
                                            </span>
                                        </div>
                                        <p className="mt-1.5 text-xs leading-5 text-slate-600 dark:text-slate-400">
                                            {item.detail}
                                        </p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>

                {/* Sibling Category Hub Links */}
                <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-6 dark:border-slate-800">
                    <span className="mr-2 font-mono text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Other Categories:
                    </span>
                    {siblingCategories.map((cat) => {
                        const CatIcon = cat.icon;
                        return (
                            <Link
                                key={cat.id}
                                href={`/${cat.id}`}
                                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-500 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
                            >
                                <CatIcon className={`h-4 w-4 ${cat.color}`} aria-hidden="true" />
                                <span>{cat.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* =====================================================================
          5. CATEGORY FAQS (MATCHES JSON-LD FAQPage SCHEMA VERBATIM)
         ===================================================================== */}
            <section
                aria-labelledby="finance-faq-heading"
                className="border-t border-slate-200 dark:border-slate-800"
            >
                <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
                    <h2
                        id="finance-faq-heading"
                        className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Financial Calculators — Frequently Asked Questions
                    </h2>

                    <div className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                        {FINANCE_CATEGORY_FAQS.map((faq, index) => (
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