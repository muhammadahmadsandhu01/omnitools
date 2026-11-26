import { tools, type Tool } from '@/config/toolsData';

export interface DeveloperSubtopicGroup {
    id: string;
    label: string;
    heading: string;
    description: string;
    slugs: readonly string[];
}

export interface DeveloperFaqItem {
    question: string;
    answer: string;
}

/**
 * Returns all currently published, visible developer tools from toolsData.ts.
 */
export function getPublishedDeveloperTools(): Tool[] {
    return tools.filter(
        (tool) =>
            tool.categoryId === 'developer' &&
            tool.status === 'published' &&
            !tool.hidden
    );
}

/**
 * Evidence-backed SEO metadata for /developer (KivaroTools Category Page)
 * with automatic live tool counts derived from config/toolsData.ts.
 * Note: app/layout.tsx applies `template: '%s | KivaroTools'`, so `seoTitle`
 * renders as "Free Online Developer Tools | KivaroTools" (41 characters).
 */
export function getDeveloperCategorySeo(
    developerTools: Tool[] = getPublishedDeveloperTools()
) {
    const totalTools = developerTools.length;

    return {
        seoTitle: 'Free Online Developer Tools',
        seoDescription: `Use ${totalTools} free online developer tools & utilities in your browser: format JSON & SQL, inspect SQLite/Parquet/HAR, debug JWT/SAML, and test Regex locally.`,
        h1Primary: 'Free Online Developer Tools',
        h1Accent: '& Local Browser Utilities.',
        heroLead:
            'Format JSON and 19 SQL dialects, inspect SQLite, DuckDB, Parquet, and HAR files, generate TypeScript and Zod schemas from OpenAPI, debug JWT/PASETO/SAML tokens, and build 7-dialect cron schedules—directly in your browser with zero server uploads.',
        keywords: [
            'free online developer tools',
            'online dev tools',
            'online developer tools',
            'developer utilities online',
            'online developer utilities',
            'developer tools online',
            'privacy-first developer tools',
            'client-side developer tools',
            'developer toolbox online',
            'web developer tools online',
            'free developer utilities',
            'free online tools for developers',
            'web developer utilities',
        ],
    } as const;
}

/**
 * 5 logical subtopic workbenches covering published developer tools
 * in config/toolsData.ts without inventing routes or omitting flagship tools.
 */
export const DEVELOPER_SUBTOPIC_GROUPS: readonly DeveloperSubtopicGroup[] = [
    {
        id: 'json-lakehouse',
        label: 'JSON & Data Formats',
        heading: 'JSON, Lakehouse & Data Format Tools',
        description:
            'Format, validate, flatten, and inspect structured JSON payloads alongside binary Apache Parquet, Avro, and Arrow Feather datasets locally in browser memory.',
        slugs: ['json-formatter', 'json-converter', 'parquet-viewer'],
    },
    {
        id: 'sql-databases',
        label: 'SQL & Databases',
        heading: 'SQL & Local Database Tools',
        description:
            'Open local SQLite and DuckDB database files with schema inspection and ER diagrams, or format and lint SQL queries across 19 database dialects.',
        slugs: ['sqlite-viewer', 'sql-formatter'],
    },
    {
        id: 'auth-security-crypto',
        label: 'Auth & Crypto',
        heading: 'Auth, Security & Crypto Utilities',
        description:
            'Audit JWT, PASETO, and SAML 2.0 authentication tokens or generate CSPRNG passwords, API secrets, HMAC digests, and SHA file checksums offline.',
        slugs: ['jwt-debugger', 'password-generator'],
    },
    {
        id: 'api-network-debugging',
        label: 'API & Network',
        heading: 'API & Network Debugging Tools',
        description:
            'Compile OpenAPI and Swagger specifications into strict TypeScript, Zod, and MSW mocks, or inspect and sanitize HAR network waterfalls before sharing.',
        slugs: ['openapi-to-typescript', 'har-analyzer'],
    },
    {
        id: 'encoding-regex-cron-svg',
        label: 'Encoding, Regex & Cron',
        heading: 'Encoding, Regex, Cron & SVG Utilities',
        description:
            'Encode UTF-8 and binary Base64 payloads, test regular expressions with ReDoS checks, simulate 7-dialect cron schedules across DST shifts, and minify SVGs.',
        slugs: [
            'base64-encoder',
            'regex-tester',
            'cron-expression-generator',
            'svg-optimizer',
        ],
    },
] as const;

/**
 * Verified per-tool technical spec badges derived directly from config/toolsData.ts.
 */
export const DEVELOPER_TOOL_SPECS: Record<string, string> = {
    'json-formatter': '25 MB • RFC 8259',
    'json-converter': '50 MB • 200k Rows',
    'parquet-viewer': '250 MB • INT64',
    'sqlite-viewer': 'SQLite & DuckDB',
    'sql-formatter': '19 SQL Dialects',
    'jwt-debugger': 'JWT • PASETO • SAML',
    'password-generator': 'CSPRNG • 1 GB SHA',
    'openapi-to-typescript': 'OpenAPI 3.1 • Zod',
    'har-analyzer': 'HAR 1.2 • 14 Surfaces',
    'base64-encoder': '25 MB • RFC 4648',
    'regex-tester': 'AST • ReDoS Guard',
    'cron-expression-generator': '7 Dialects • DST',
    'svg-optimizer': 'Vector • Defs Pruner',
};

/**
 * Developer-adjacent published utilities hosted under /seo (cross-linked only;
 * canonical URLs remain under /seo to prevent category cannibalization).
 */
export const DEVELOPER_ADJACENT_SEO_SLUGS = [
    'llms-txt-generator',
    'text-case-converter',
    'meta-generator',
] as const;

/**
 * Reproducible DevTools Network verification steps for zero-upload auditing.
 */
export const DEVELOPER_DEVTOOLS_VERIFICATION_STEPS = [
    {
        step: '01',
        title: 'Open Browser DevTools',
        detail:
            'Launch any utility from this directory, then press F12 (or Cmd+Option+I on macOS) and open the Network tab.',
    },
    {
        step: '02',
        title: 'Filter Fetch & XHR Traffic',
        detail:
            'Click the Clear icon in the Network panel and select the Fetch/XHR filter to isolate programmatic data requests.',
    },
    {
        step: '03',
        title: 'Run a Sample Payload',
        detail:
            'Paste a JSON object, SQL query, JWT token, or drop a local SQLite, Parquet, or HAR file into the workspace.',
    },
    {
        step: '04',
        title: 'Confirm Zero Outbound Uploads',
        detail:
            'Verify that zero file bytes or code payloads are posted to remote servers—processing finishes locally in browser memory.',
    },
] as const;

/**
 * Category-level FAQs rendered in visible <details> accordions and mirrored
 * verbatim in FAQPage JSON-LD schema on /developer—tool counts update automatically.
 */
export function getDeveloperCategoryFaqs(
    developerTools: Tool[] = getPublishedDeveloperTools()
): readonly DeveloperFaqItem[] {
    const totalTools = developerTools.length;

    return [
        {
            question:
                'Do KivaroTools online developer tools upload my code, tokens, or files to a server?',
            answer: `No. All ${totalTools} developer utilities on this page execute locally inside your browser using standard Web APIs, Web Workers, and client-side parsers. Your JSON payloads, SQL queries, JWT/SAML tokens, HAR captures, SQLite databases, and Parquet files remain in local browser memory with zero server uploads.`,
        },
        {
            question:
                'How can I verify that these developer utilities run 100% client-side?',
            answer:
                'Open any developer tool, press F12 to open DevTools, switch to the Network tab, filter by Fetch/XHR, and clear the log. When you format code, decode a token, or open a local database or HAR file, you can confirm directly that no payload data is transmitted to a backend server.',
        },
        {
            question:
                'Are these online developer utilities free to use without an account?',
            answer:
                'Yes. Every tool in the KivaroTools developer directory is free to use with no account registration, no login wall, and no paywalled export limits.',
        },
        {
            question:
                'Can browser-based developer tools handle large JSON, Parquet, SQLite, or HAR files?',
            answer:
                'Yes. Heavy utilities are built around local TypedArrays, streaming parsers, and virtualized views—supporting up to 25 MB in the JSON Formatter and Base64 tool, up to 50 MB (200,000 rows) in the JSON Converter, and up to 250 MB in the Parquet, Avro & Feather Viewer, bounded only by your device RAM.',
        },
        {
            question:
                'How is an online developer utilities hub different from Chrome DevTools or an IDE?',
            answer:
                'Browser DevTools inspect live pages and IDEs manage full codebases, whereas an online developer utilities hub gives you instant, zero-install workbenches for ad-hoc tasks—such as scrubbing secrets from a HAR file, inspecting a Parquet schema, auditing a SAML 2.0 assertion, or simulating a 7-dialect cron schedule.',
        },
        {
            question:
                'Where can I find related technical tools like llms.txt, case conversion, or meta tag generators?',
            answer:
                'KivaroTools keeps llms.txt & AI crawler robots.txt generation, 15-format developer text case conversion (camelCase, snake_case, PascalCase), and Next.js metadata generation under the SEO & Text Tools category, with direct cross-links provided below the developer directory.',
        },
    ] as const;
}

/**
 * Default pre-computed exports (automatically derived from toolsData.ts).
 */
export const DEVELOPER_CATEGORY_SEO = getDeveloperCategorySeo();
export const DEVELOPER_CATEGORY_FAQS = getDeveloperCategoryFaqs();

/**
 * Helper that resolves all published developer tools into the defined groups
 * plus a safe fallback bucket so newly added tools in toolsData.ts always appear.
 */
export function resolveDeveloperToolGroups(developerTools: Tool[]) {
    const bySlug = new Map(developerTools.map((tool) => [tool.slug, tool]));
    const assignedSlugs = new Set<string>();

    const groups = DEVELOPER_SUBTOPIC_GROUPS.map((group) => {
        const resolvedTools = group.slugs
            .map((slug) => bySlug.get(slug))
            .filter((tool): tool is Tool => Boolean(tool));

        resolvedTools.forEach((tool) => assignedSlugs.add(tool.slug));

        return {
            ...group,
            tools: resolvedTools,
        };
    }).filter((group) => group.tools.length > 0);

    const unassignedTools = developerTools.filter(
        (tool) => !assignedSlugs.has(tool.slug)
    );

    if (unassignedTools.length > 0) {
        groups.push({
            id: 'additional-developer-utilities',
            label: 'More Utilities',
            heading: 'Additional Developer Utilities',
            description:
                'Recently published browser-based developer tools in the KivaroTools directory.',
            slugs: unassignedTools.map((t) => t.slug),
            tools: unassignedTools,
        });
    }

    return groups;
}