import { tools, type Tool } from '@/config/toolsData';

export interface SeoSubtopicGroup {
    id: string;
    label: string;
    heading: string;
    description: string;
    slugs: readonly string[];
}

export interface SeoFaqItem {
    question: string;
    answer: string;
}

export interface SeoWorkflowStep {
    step: string;
    title: string;
    detail: string;
    href: string;
    toolLabel: string;
}

export interface SeoComparisonRow {
    criterion: string;
    kivaroClientSide: string;
    legacyAndGatedSites: string;
}

export interface AdjacentSeoLink {
    categoryId: 'developer';
    slug: string;
    hubLabel: string;
}

/**
 * Returns all currently published, visible SEO & Text tools from toolsData.ts.
 */
export function getPublishedSeoTools(): Tool[] {
    return tools.filter(
        (tool) =>
            tool.categoryId === 'seo' &&
            tool.status === 'published' &&
            !tool.hidden
    );
}

/**
 * Logical subtopic workbench definitions covering all published /seo tools
 * in config/toolsData.ts. Places flagship Technical SEO & GEO utilities first
 * and clearly separates the companion static QR utility below SEO & Text groups.
 */
export const SEO_SUBTOPIC_GROUPS: readonly SeoSubtopicGroup[] = [
    {
        id: 'technical-geo-seo',
        label: 'Technical SEO & GEO',
        heading: 'Technical SEO & AI Search (GEO) Tools',
        description:
            'Control AI crawler access and Generative Engine Optimization (GEO) with llmstxt.org v2 files and 45-bot RFC 9309 robots.txt rules, or author W3C HTML meta tags, Open Graph cards, and typed Next.js App Router metadata with live SERP previews.',
        slugs: ['llms-txt-generator', 'meta-generator'],
    },
    {
        id: 'editorial-text-utilities',
        label: 'Editorial & Text',
        heading: 'Editorial, Readability & Text Utilities',
        description:
            'Audit Unicode grapheme counts, 6 academic readability formulas (Flesch, Gunning Fog, SMOG, ARI), N-gram keyword density, and 8-layer grammar rules—or convert copy across 15 editorial and developer identifier cases in 191 locales.',
        slugs: ['text-analyzer', 'text-case-converter'],
    },
    {
        id: 'publishing-marketing-utilities',
        label: 'Static QR & Publishing',
        heading: 'Publishing & Static Marketing Utilities',
        description:
            'Companion publishing utility for generating permanent, non-expiring static QR codes across 8 payload types (URL, Wi-Fi, vCard 3.0, ICS) with custom logos, live optical scan scoring, and print-ready vector SVG or A4 PDF export.',
        slugs: ['qr-generator'],
    },
] as const;

/**
 * Verified per-tool technical spec badges derived directly from config/toolsData.ts.
 */
export const SEO_TOOL_SPECS: Record<string, string> = {
    'llms-txt-generator': '45 AI Bots • 12-Pt GEO Linter',
    'meta-generator': '6 SERP/Social Previews • 100-Pt Audit',
    'text-analyzer': '6 Readability Indices • 8-Layer Coach',
    'text-case-converter': '15 Formats • 191 Locales',
    'qr-generator': '8 Payloads • Vector SVG & A4 PDF',
};

/**
 * Cross-category developer utilities that pair naturally with /seo workflows
 * without duplicating routes across hubs.
 */
export const ADJACENT_SEO_TOOL_REFS: readonly AdjacentSeoLink[] = [
    {
        categoryId: 'developer',
        slug: 'svg-optimizer',
        hubLabel: 'Developer Tools Hub',
    },
    {
        categoryId: 'developer',
        slug: 'regex-tester',
        hubLabel: 'Developer Tools Hub',
    },
    {
        categoryId: 'developer',
        slug: 'json-formatter',
        hubLabel: 'Developer Tools Hub',
    },
] as const;

/**
 * Helper that resolves all published /seo tools into the defined groups
 * plus a safe fallback bucket so newly published tools in toolsData.ts always appear.
 */
export function resolveSeoToolGroups(seoTools: Tool[]) {
    const bySlug = new Map(seoTools.map((tool) => [tool.slug, tool]));
    const assignedSlugs = new Set<string>();

    const groups = SEO_SUBTOPIC_GROUPS.map((group) => {
        const resolvedTools = group.slugs
            .map((slug) => bySlug.get(slug))
            .filter((tool): tool is Tool => Boolean(tool));

        resolvedTools.forEach((tool) => assignedSlugs.add(tool.slug));

        return {
            ...group,
            tools: resolvedTools,
        };
    }).filter((group) => group.tools.length > 0);

    const unassignedTools = seoTools.filter(
        (tool) => !assignedSlugs.has(tool.slug)
    );

    if (unassignedTools.length > 0) {
        groups.push({
            id: 'additional-seo-tools',
            label: 'More SEO & Text Tools',
            heading: 'Additional SEO, GEO & Text Utilities',
            description:
                'Recently published browser-based SEO, GEO, and text utilities in the KivaroTools directory.',
            slugs: unassignedTools.map((t) => t.slug),
            tools: unassignedTools,
        });
    }

    return groups;
}

/**
 * Live dynamic counts derived from toolsData.ts.
 */
export function getSeoCategoryStats(
    seoTools: Tool[] = getPublishedSeoTools()
) {
    const totalTools = seoTools.length;
    const groupCount = resolveSeoToolGroups(seoTools).length;

    return {
        totalTools,
        groupCount,
    };
}

/**
 * Evidence-backed SEO metadata for /seo with automatic live counts.
 * Note: app/layout.tsx applies `template: '%s | KivaroTools'`, so `seoTitle`
 * renders as "Free SEO, GEO & Text Tools | KivaroTools" (40 characters).
 */
export function getSeoCategorySeo(
    seoTools: Tool[] = getPublishedSeoTools()
) {
    const { totalTools, groupCount } = getSeoCategoryStats(seoTools);

    return {
        seoTitle: 'Free SEO, GEO & Text Tools',
        seoDescription: `Use ${totalTools} free browser-based SEO, GEO & text tools with no signup: llms.txt & AI robots.txt, Meta/OG/Next.js auditor, Word Counter, Case & QR tools.`,
        h1Primary: 'Free SEO, GEO & Text Tools',
        h1Accent: '(Browser-Local, Zero Signup).',
        heroLead: `Optimize AI search visibility, page metadata, and editorial copy with ${totalTools} browser-based utilities across ${groupCount} focused suites—build llmstxt.org v2 and 45-bot AI crawler robots.txt files, author Open Graph and Next.js metadata with live SERP previews, audit readability and grammar, convert 15 text cases across 191 locales, and export permanent static SVG/PDF QR codes with zero signup and zero ad-block walls.`,
        keywords: [
            'free geo tools',
            'free geo seo tools',
            'geo seo tools free',
            'free ai seo tools',
            'free technical seo tools',
            'free on-page seo tools',
            'online text utilities',
            'free online text tools',
            'free ai crawler tools',
            'free llms.txt & seo tools',
            'free meta tag and seo tools',
            'seo text tools online',
        ],
    } as const;
}

/**
 * Practical 4-step publishing & GEO workflow connecting the /seo utilities.
 */
export const SEO_WORKFLOW_STEPS: readonly SeoWorkflowStep[] = [
    {
        step: '01',
        title: 'Define AI Search & Crawler Access',
        detail:
            'Generate llmstxt.org v2 files (llms.txt, llms-full.txt, llms-ctx.txt), W3C tdmrep.json, and RFC 9309 robots.txt rules across 45 AI bots from your sitemap or HTML drafts.',
        href: '/seo/llms-txt-generator',
        toolLabel: 'llms.txt & AI Crawler Studio',
    },
    {
        step: '02',
        title: 'Author & Preview Page Metadata',
        detail:
            'Build W3C <head> tags, Open Graph markup, X/Twitter Cards, and typed Next.js App Router metadata with 6 live SERP/social previews and a 0–100 SEO audit.',
        href: '/seo/meta-generator',
        toolLabel: 'Meta Tag & OG Auditor',
    },
    {
        step: '03',
        title: 'Audit Readability, Grammar & Casing',
        detail:
            'Verify Unicode character limits, 6 academic readability scores, N-gram density, and 8-layer grammar checks—then standardize headings or slugs across 15 formats.',
        href: '/seo/text-analyzer',
        toolLabel: 'Word Counter & Readability Coach',
    },
    {
        step: '04',
        title: 'Export Permanent Static QR Codes',
        detail:
            'Create non-expiring static QR codes for URLs, Wi-Fi, vCards, or events with live WCAG contrast checks, center logo Level H error correction, and SVG/A4 PDF output.',
        href: '/seo/qr-generator',
        toolLabel: 'Static QR Code Generator',
    },
] as const;

/**
 * Factual comparison between KivaroTools /seo utilities and typical legacy SEO portals / gated GEO SaaS hubs.
 */
export const SEO_ARCHITECTURE_COMPARISON: readonly SeoComparisonRow[] = [
    {
        criterion: 'Processing & Privacy',
        kivaroClientSide:
            'Drafts, sitemaps, text audits, case conversions, QR codes, and raw HTML checks run locally in browser memory. Only the optional Live URL Auditor in the Meta Tag Generator fetches a public URL via an SSRF-protected route.',
        legacyAndGatedSites:
            'Often transmit full article drafts, sitemaps, and HTML payloads to remote servers or require account logins to save or inspect outputs.',
    },
    {
        criterion: '2026 GEO & AI Search',
        kivaroClientSide:
            'Includes llmstxt.org v2 authoring, 12-point GEO linting, BPE token budgeting, 45-bot RFC 9309 AI robots.txt rules, and W3C tdmrep.json export.',
        legacyAndGatedSites:
            'Legacy SEO directories omit GEO/llms.txt tools entirely (often keeping defunct Alexa/PageRank scripts), while newer GEO SaaS hubs gate exports behind email or paid plans.',
    },
    {
        criterion: 'Ad-Block & Access Walls',
        kivaroClientSide:
            'Zero signup modals, zero email gates, zero ad-blocker lock screens, and zero watermarks on code or SVG/PDF exports.',
        legacyAndGatedSites:
            'Frequently block access when an ad-blocker is active or restrict multi-format exports to paid tiers.',
    },
    {
        criterion: 'Editorial & Locale Depth',
        kivaroClientSide:
            'Deterministic 6-formula readability scoring, 8-layer grammar coach, N-gram density, and 191 BCP-47 locale casing rules.',
        legacyAndGatedSites:
            'Many free text hubs offer basic character counters or split case conversion into thin single-button pages with no Unicode locale rules.',
    },
    {
        criterion: 'Developer-Ready Exports',
        kivaroClientSide:
            'Typed Next.js App Router Metadata objects, Next.js route.ts/robots.ts templates, Cloudflare/Nginx headers, and infinite-scale vector SVG/A4 PDF QR files.',
        legacyAndGatedSites:
            'Typically limited to raw copy-paste HTML snippets or low-resolution raster PNG downloads.',
    },
] as const;

/**
 * Category-level FAQs grounded in observed SERP, Reddit, and competitor questions.
 * Rendered in visible <details> accordions and mirrored verbatim in FAQPage JSON-LD.
 */
export function getSeoCategoryFaqs(
    seoTools: Tool[] = getPublishedSeoTools()
): readonly SeoFaqItem[] {
    const { totalTools, groupCount } = getSeoCategoryStats(seoTools);

    return [
        {
            question:
                'What is llms.txt and how do llms.txt and robots.txt control AI search crawlers?',
            answer:
                'llms.txt is a Markdown index file following the llmstxt.org v2 specification that helps AI assistants and retrieval systems locate your most important documentation and pages cleanly. robots.txt (RFC 9309) sets crawl directives for specific user agents. Together, our llms.txt & AI Crawler Studio lets you author llms.txt, llms-full.txt, llms-ctx.txt, W3C tdmrep.json, and tailored robots.txt rules across 45 AI search, live fetcher, training, and scraper bots.',
        },
        {
            question:
                'What is the difference between GEO (Generative Engine Optimization) and classic SEO tools?',
            answer:
                'Classic technical and on-page SEO tools focus on how search engines crawl, index, and display web pages—covering HTML meta tags, canonicals, Open Graph previews, readability, and keyword structure. GEO (Generative Engine Optimization) extends this for AI search and answer engines by structuring machine-readable Markdown indexes (llms.txt), estimating LLM token budgets, and defining explicit AI crawler governance in robots.txt.',
        },
        {
            question:
                'Are these SEO, GEO, and text tools completely free without signup or disabling my ad-blocker?',
            answer: `Yes. All ${totalTools} utilities across the ${groupCount} suites on this page are free to use with no account registration, no email gates, no watermarks, and no ad-blocker lock screens.`,
        },
        {
            question:
                'Is my text, draft, sitemap, or website metadata uploaded or stored on a server?',
            answer:
                'Your article drafts, pasted or uploaded sitemap.xml/RSS/HTML files, case conversions, static QR payloads, and raw HTML meta tag audits run 100% locally in your browser memory with zero server uploads. The only optional network request on this hub occurs if you click Live URL Audit inside the Meta Tag Generator, which uses an SSRF-protected server route solely to fetch the public webpage <head> markup that browsers restrict via CORS.',
        },
        {
            question:
                'What free technical SEO and GEO tools should I run first on a website?',
            answer:
                'Start by generating and linting your llms.txt and 45-bot AI crawler robots.txt file to establish clean AI and search crawler rules. Next, run the Meta Tag, Open Graph & Next.js Metadata Auditor to validate title/description pixel lengths, canonical tags, and social share cards. Finally, audit key landing-page copy in the Word Counter & Readability Coach and standardize headings or URL slugs in the Text Case Converter.',
        },
        {
            question:
                'How do free client-side SEO and text utilities compare to paid all-in-one SEO platforms?',
            answer:
                'KivaroTools focuses on deterministic, zero-signup authoring and auditing utilities—GEO/llms.txt generation, HTML/Open Graph/Next.js metadata, readability and grammar analysis, 191-locale case conversion, and static QR publishing. It does not replace paid SaaS platforms for third-party backlink databases, live keyword rank tracking, domain authority crawling, or generative AI article writing.',
        },
    ] as const;
}

/**
 * Default pre-computed exports (automatically derived from toolsData.ts).
 */
export const SEO_CATEGORY_SEO = getSeoCategorySeo();
export const SEO_CATEGORY_FAQS = getSeoCategoryFaqs();