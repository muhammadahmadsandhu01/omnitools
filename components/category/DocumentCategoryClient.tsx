'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    ArrowUpRight,
    CheckCircle2,
    ChevronRight,
    FileDown,
    FileText,
    FileUp,
    Home,
    Layers,
    LayoutGrid,
    Lock,
    Search,
    ShieldCheck,
    X,
} from 'lucide-react';

import { categories, tools, type CategoryId } from '@/config/toolsData';
import AdUnit from '@/components/ads/AdUnit';
import {
    ADJACENT_DOCUMENT_TOOL_REFS,
    DOCUMENT_ARCHITECTURE_COMPARISON,
    DOCUMENT_DEVTOOLS_VERIFICATION_STEPS,
    DOCUMENT_TOOL_SPECS,
    getDocumentCategoryFaqs,
    getDocumentCategorySeo,
    resolveDocumentToolGroups,
} from '@/config/documentCategoryConfig';

type GroupFilter = 'all' | string;

const GROUP_ICONS: Record<string, typeof FileText> = {
    'organize-compress-pdfs': Layers,
    'convert-from-pdf': FileDown,
    'convert-to-pdf': FileUp,
    'sign-watermark-redact': Lock,
};

const GROUP_ACCENTS: Record<string, string> = {
    'organize-compress-pdfs': 'text-orange-600 dark:text-orange-400',
    'convert-from-pdf': 'text-blue-600 dark:text-blue-400',
    'convert-to-pdf': 'text-indigo-600 dark:text-indigo-400',
    'sign-watermark-redact': 'text-emerald-600 dark:text-emerald-400',
};

export default function DocumentCategoryClient() {
    const [activeGroup, setActiveGroup] = useState<GroupFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const documentTools = useMemo(
        () =>
            tools.filter(
                (tool) =>
                    tool.categoryId === 'document' &&
                    tool.status === 'published' &&
                    !tool.hidden
            ),
        []
    );

    const documentSeo = useMemo(
        () => getDocumentCategorySeo(documentTools),
        [documentTools]
    );

    const documentFaqs = useMemo(
        () => getDocumentCategoryFaqs(documentTools),
        [documentTools]
    );

    const allGroups = useMemo(
        () => resolveDocumentToolGroups(documentTools),
        [documentTools]
    );

    const adjacentDocumentTools = useMemo(() => {
        return ADJACENT_DOCUMENT_TOOL_REFS.map((ref) => {
            const matched = tools.find(
                (tool) =>
                    tool.categoryId === ref.categoryId &&
                    tool.slug === ref.slug &&
                    tool.status === 'published' &&
                    !tool.hidden
            );
            if (!matched) return null;
            return {
                tool: matched,
                hubLabel: ref.hubLabel,
            };
        }).filter(
            (
                item
            ): item is {
                tool: (typeof tools)[number];
                hubLabel: string;
            } => Boolean(item)
        );
    }, []);

    const siblingCategories = useMemo(
        () =>
            categories.filter(
                (cat) => !cat.hidden && cat.id !== ('document' as CategoryId)
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
                    const spec = (DOCUMENT_TOOL_SPECS[tool.slug] || '').toLowerCase();
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

    const categoryAdSlot = process.env.NEXT_PUBLIC_ADSENSE_CATEGORY_SLOT || '';

    return (
        <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
            {/* =====================================================================
          1. COMPACT PDF WORKBENCH HERO (MATCHES HOME, FINANCE & DEVELOPER HUBS)
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
                                PDF &amp; Document Utilities
                            </li>
                        </ol>
                    </nav>

                    <div className="max-w-3xl">
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl dark:text-white">
                            {documentSeo.h1Primary}
                            <span className="block text-blue-600 dark:text-blue-400">
                                {documentSeo.h1Accent}
                            </span>
                        </h1>

                        <p className="mt-4 text-base leading-7 text-slate-700 sm:text-lg dark:text-slate-300">
                            {documentSeo.heroLead}
                        </p>

                        {/* Precision Workbench Spec Strip */}
                        <dl className="mt-6 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-3 border-y border-slate-200/90 py-3.5 font-mono text-xs sm:grid-cols-4 dark:border-slate-800">
                            <div>
                                <dt className="text-slate-500 dark:text-slate-400">PDF Tools</dt>
                                <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                                    {documentTools.length} Published
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500 dark:text-slate-400">Workflows</dt>
                                <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                                    {allGroups.length} Suites
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500 dark:text-slate-400">Execution</dt>
                                <dd className="mt-0.5 font-semibold text-emerald-700 dark:text-emerald-400">
                                    Zero File Uploads
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
                                const GroupIcon = GROUP_ICONS[group.id] || FileText;
                                const accent =
                                    GROUP_ACCENTS[group.id] ||
                                    'text-orange-600 dark:text-orange-400';

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
                                href="#pdf-privacy-verification"
                                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-emerald-500 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
                            >
                                <ShieldCheck
                                    className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                                    aria-hidden="true"
                                />
                                <span>F12 Privacy Check</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* =====================================================================
          2. SUBTOPIC DIRECTORY + INSTANT CLIENT-SIDE FILTER
         ===================================================================== */}
            <section
                id="document-directory"
                aria-label="PDF and document tools directory"
                className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-14 lg:px-8"
            >
                {/* Directory Controls Bar */}
                <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end dark:border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                            <span className="font-mono text-xs font-semibold uppercase tracking-wider">
                                Client-Side PDF Utility Directory
                            </span>
                        </div>
                        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                            Showing{' '}
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {visibleToolCount}
                            </span>{' '}
                            of {documentTools.length} free online PDF tools organized by
                            workflow.
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
                            placeholder="Filter by merge, 100KB, Word, Bates, PII..."
                            aria-label="Filter PDF and document tools by name, format, or capability"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 motion-reduce:transition-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                aria-label="Clear PDF tool filter"
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
                        aria-label="Filter PDF tools by subtopic"
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
                            All ({documentTools.length})
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
                            const GroupIcon = GROUP_ICONS[group.id] || FileText;
                            const accent =
                                GROUP_ACCENTS[group.id] ||
                                'text-orange-600 dark:text-orange-400';

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
                                            {group.tools.length === 1 ? 'tool' : 'tools'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {group.tools.map((tool) => {
                                            const specBadge =
                                                DOCUMENT_TOOL_SPECS[tool.slug] || 'Client-Side PDF';

                                            return (
                                                <Link
                                                    key={tool.id}
                                                    href={`/document/${tool.slug}`}
                                                    className="group flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500"
                                                >
                                                    <div>
                                                        {/* Card Top Meta Row */}
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="truncate font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                                                {specBadge}
                                                            </span>
                                                            <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                                Zero Upload
                                                            </span>
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
                                                        <span>Open PDF tool</span>
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
                            No PDF tools match &ldquo;{searchQuery}&rdquo;
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Try searching for Merge, Split, Compress, 100KB, Word, Excel,
                            PowerPoint, JPG, 600 DPI, Sign, Bates, or Redact.
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
          3. PDF-ADJACENT TOOLS IN FINANCE & MEDIA (CROSS-CATEGORY LINKS)
         ===================================================================== */}
            {adjacentDocumentTools.length > 0 && (
                <section
                    aria-labelledby="adjacent-document-tools-heading"
                    className="border-y border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40"
                >
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                            <div>
                                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                                    Cross-Category Document Workflows
                                </span>
                                <h2
                                    id="adjacent-document-tools-heading"
                                    className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white"
                                >
                                    Related PDF-Output Utilities in Finance &amp; Media
                                </h2>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                    Generate watermark-free A4 PDF invoices or strip EXIF/GPS
                                    metadata when converting HEIC and AVIF photos to PDF.
                                </p>
                            </div>
                            <Link
                                href="/media"
                                className="inline-flex min-h-[44px] shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400"
                            >
                                Explore Media &amp; Images
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            {adjacentDocumentTools.map(({ tool, hubLabel }) => (
                                <Link
                                    key={tool.id}
                                    href={`/${tool.categoryId}/${tool.slug}`}
                                    className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500"
                                >
                                    <div>
                                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            {hubLabel}
                                        </span>
                                        <h3 className="mt-1.5 text-sm font-bold text-slate-900 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400">
                                            {tool.name}
                                        </h3>
                                        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                                            {tool.description}
                                        </p>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs font-semibold text-blue-700 dark:border-slate-800 dark:text-blue-400">
                                        <span>Open tool</span>
                                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* =====================================================================
          4. ORIGINAL PUBLISHER CONTENT: CLIENT-SIDE VS UPLOAD & F12 AUDIT
         ===================================================================== */}
            <section
                id="pdf-privacy-verification"
                aria-labelledby="document-architecture-heading"
                className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:px-6 lg:px-8"
            >
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Left Editorial Column */}
                    <div className="lg:col-span-5">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                            <span className="font-mono text-xs font-semibold uppercase tracking-wider">
                                Zero-Upload Document Privacy
                            </span>
                        </div>
                        <h2
                            id="document-architecture-heading"
                            className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                        >
                            Client-Side vs. Upload-Based PDF Sites
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                            Bank statements, tax returns, signed contracts, legal exhibits,
                            and corporate spreadsheets should not have to travel across remote
                            servers just to be merged, compressed, converted, or redacted. All{' '}
                            {documentTools.length} PDF utilities on this page process your
                            files locally in browser RAM using standards-compliant engines
                            (pdf-lib, pdf.js, SheetJS, JSZip, and HTML5 Canvas).
                        </p>
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                            Instead of asking you to trust a server-deletion promise, you can
                            audit every tool in 30 seconds with your browser&apos;s Network
                            inspector before loading confidential files.
                        </p>
                    </div>

                    {/* Right DevTools F12 Audit Grid */}
                    <div className="lg:col-span-7">
                        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/50">
                            <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                                        Verify Zero-Upload Execution in DevTools (F12)
                                    </h3>
                                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                                        Audit any PDF utility on this page in under 30 seconds
                                        before processing confidential documents.
                                    </p>
                                </div>
                                <span className="hidden shrink-0 rounded-md bg-emerald-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-800 sm:inline-block dark:bg-emerald-950/60 dark:text-emerald-300">
                                    File Bytes: 0 Uploads
                                </span>
                            </div>

                            <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {DOCUMENT_DEVTOOLS_VERIFICATION_STEPS.map((item) => (
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

                {/* Client-Side vs. Cloud-Upload Comparison Table */}
                <div className="mt-10 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] border-collapse text-left text-xs sm:text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold text-slate-900 dark:text-white"
                                    >
                                        Criteria
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold text-emerald-800 dark:text-emerald-400"
                                    >
                                        KivaroTools (Client-Side)
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400"
                                    >
                                        Typical Upload-Based PDF Sites
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
                                {DOCUMENT_ARCHITECTURE_COMPARISON.map((row) => (
                                    <tr key={row.criterion}>
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900 dark:text-white"
                                        >
                                            {row.criterion}
                                        </th>
                                        <td className="px-4 py-3 leading-5 text-slate-700 dark:text-slate-300">
                                            {row.kivaroClientSide}
                                        </td>
                                        <td className="px-4 py-3 leading-5 text-slate-600 dark:text-slate-400">
                                            {row.cloudUploadSites}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                aria-labelledby="document-faq-heading"
                className="border-t border-slate-200 dark:border-slate-800"
            >
                <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
                    <h2
                        id="document-faq-heading"
                        className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        PDF &amp; Document Tools — Frequently Asked Questions
                    </h2>

                    <div className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                        {documentFaqs.map((faq, index) => (
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