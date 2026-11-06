import React from 'react';
import Link from 'next/link';
import {
    Bot,
    ShieldCheck,
    Layers,
    AlertTriangle,
    Terminal,
    HelpCircle,
    Sparkles,
    FileSpreadsheet,
    Cpu,
    Search,
    Code2,
    FileText,
} from 'lucide-react';

export interface FaqItem {
    question: string;
    answer: string;
}

export const LLMS_TXT_GENERATOR_FAQS: FaqItem[] = [
    {
        question: 'What is an llms.txt file and how does it differ from robots.txt and sitemap.xml?',
        answer:
            'An llms.txt file is a structured Markdown index served at the root of a domain (https://example.com/llms.txt) following the llmstxt.org v2 specification proposed by Jeremy Howard (Answer.AI). While robots.txt (RFC 9309) sets crawler access rules (Allow/Disallow) and sitemap.xml lists every indexable URL for search engines, llms.txt curates your highest-value documentation, API references, and guides in priority order with concise one-line descriptions so Large Language Models and AI coding assistants can understand your site within their context window.',
    },
    {
        question: 'What is the difference between llms.txt, llms-full.txt, and llms-ctx.txt?',
        answer:
            'llms.txt is the lightweight table-of-contents index containing an H1 title, a blockquote summary, and H2 sections of annotated Markdown links. llms-full.txt (popularized by Mintlify and Anthropic) concatenates the complete cleaned Markdown text of your primary documentation pages into a single file so AI agents can ingest your entire documentation in one HTTP request. llms-ctx.txt wraps each curated document inside structured XML (<project><documents><document>) tags for direct prompt injection. KivaroTools compiles all three files simultaneously for free.',
    },
    {
        question: 'Are my sitemaps, HTML pages, or configuration files uploaded to any server?',
        answer:
            'No. Your selected file contents, XML sitemaps, and HTML pages are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources.',
    },
    {
        question: 'Why does blocking all AI bots in robots.txt hurt ChatGPT Search and Perplexity visibility?',
        answer:
            'Many basic robots.txt generators lump all AI user-agents together. If you block OAI-SearchBot (OpenAI ChatGPT Search), Claude-SearchBot (Anthropic Claude Search), and PerplexityBot alongside training crawlers, your website becomes invisible in AI search answers and loses clickable source citations. To opt out of model training while keeping AI search traffic, allow AI Search Citation bots (OAI-SearchBot, Claude-SearchBot, PerplexityBot) and User-Triggered Fetchers (ChatGPT-User, Claude-User) while blocking Foundation Model Training crawlers (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, Meta-ExternalAgent, CCBot).',
    },
    {
        question: 'What is the RFC 9309 §2.2.1 Specific-Group Override Leak in robots.txt?',
        answer:
            'Under RFC 9309 (Robots Exclusion Protocol), a crawler that matches its own named User-agent group (such as User-agent: OAI-SearchBot) completely ignores the wildcard User-agent: * group. If your User-agent: * block contains Disallow: /admin/ and Disallow: /checkout/, and you add a dedicated User-agent: OAI-SearchBot block with Allow: / without repeating those Disallow lines, OAI-SearchBot is granted permission to crawl /admin/ and /checkout/. KivaroTools includes an automatic RFC 9309 Specific-Group Inheritance Guard that copies global Disallow paths into every allowed AI bot group.',
    },
    {
        question: 'How do Google-Extended and Applebot-Extended differ from Googlebot and Applebot?',
        answer:
            'Google-Extended and Applebot-Extended are usage-control tokens rather than standalone web crawlers. Googlebot and Applebot perform the actual HTTP fetching for Google Search and Apple Spotlight/Siri. Disallowing Google-Extended in robots.txt opts your pages out of training Google Gemini foundation models without hurting your Google Search rankings. Similarly, disallowing Applebot-Extended opts out of Apple Intelligence training while keeping Siri and Spotlight search active.',
    },
    {
        question: 'What is the IETF AIPREF Content-Usage directive in robots.txt?',
        answer:
            'The IETF AI Preferences (AIPREF) working group draft standardizes a purpose-based Content-Usage rule for robots.txt and HTTP headers (for example, Content-Usage: search=y, ai=y, train-ai=n). Unlike traditional robots.txt Disallow rules which only block fetching by bot name, Content-Usage declares whether fetched content may be used for search indexing (search), live AI grounding (ai), or foundation model training (train-ai).',
    },
    {
        question: 'What is W3C /.well-known/tdmrep.json and when should I deploy it?',
        answer:
            'The W3C Text and Data Mining Reservation Protocol (TDMRep) defines a machine-readable JSON file at /.well-known/tdmrep.json supporting Article 4 of the European Union Digital Single Market (DSM) Copyright Directive (2019/790). Setting "tdm-reservation": 1 formally reserves all text and data mining rights and points commercial AI trainers to your licensing policy URL ("tdm-policy").',
    },
    {
        question: 'What is the special purpose of the "## Optional" section in the llmstxt.org v2 spec?',
        answer:
            'In the official llmstxt.org v2 specification, the H2 heading "## Optional" has reserved semantic meaning: it designates secondary or lower-priority URLs (such as changelogs, release notes, or legal policies) that an LLM or context-packing tool may skip when working within a tight token budget. Our compiler automatically places "## Optional" as the final section of llms.txt and calculates what percentage of your token budget it represents.',
    },
    {
        question: 'How does the Sitemap XML and HTML-to-Markdown importer work in the browser?',
        answer:
            'In Tab 1, you can upload or paste any sitemap.xml (up to 5,000 URLs), RSS feed, or URL list; the engine extracts <loc>, <lastmod>, and <priority> tags, classifies URLs into H2 sections (Core Documentation, API & SDK Reference, Guides & Tutorials, Product & Pricing, Optional), and humanizes URL slugs into titles and factual descriptions. In Tab 4, pasting raw HTML strips <nav>, <script>, <style>, and <footer> boilerplate and converts headings, code blocks, and lists into clean Markdown for llms-full.txt.',
    },
    {
        question: 'Why does the 12-Point Linter flag marketing buzzwords and relative URLs in llms.txt?',
        answer:
            'AI agents rely on link descriptions in llms.txt to decide which documentation URL to fetch during inference. Promotional superlatives like "revolutionary", "world-class", or "synergistic" consume tokens without conveying technical scope. Likewise, relative URLs (such as /docs/auth) fail when a developer copies your llms.txt content into ChatGPT, Claude, or Cursor outside your domain origin. Clicking "1-Click Auto-Fix" resolves relative URLs against your base Site URL and replaces marketing fluff with clean descriptions.',
    },
    {
        question: 'How are LLM token counts and context window percentages calculated?',
        answer:
            'Tab 3 runs an in-browser BPE token heuristic calibrated for Markdown syntax, URL path segments, and punctuation, estimating token consumption and per-1,000-read input costs across GPT-4o / o3-mini (128k context), Claude 4 / 3.7 Sonnet (200k context), Gemini 2.5 Pro (1M context), and DeepSeek R1 / V3 (128k context).',
    },
    {
        question: 'Which deprecated AI crawler user-agents should be removed from robots.txt?',
        answer:
            'Legacy tokens such as anthropic-ai, Claude-Web, and FacebookBot have been retired by their operators and replaced by ClaudeBot, Claude-SearchBot, Claude-User, Meta-ExternalAgent, and Meta-ExternalFetcher. Relying solely on retired tokens leaves your site unprotected against current training crawlers. Our importer detects deprecated user-agents automatically.',
    },
    {
        question: 'Can I generate Next.js App Router (app/llms.txt/route.ts & app/robots.ts) code directly?',
        answer:
            'Yes. In Tab 5 (10-Format Export Studio), select "7. Next.js route.ts & robots.ts" to generate ready-to-paste TypeScript route handlers for Next.js 14/15/16 App Router—including force-static caching headers for /llms.txt and MetadataRoute.Robots rules with RFC 9309 inheritance protection.',
    },
    {
        question: 'How do I enforce AI crawler rules at the CDN edge if a bot ignores robots.txt?',
        answer:
            'Because robots.txt is an advisory protocol, aggressive scrapers may ignore Disallow rules. In Tab 5, select "8. Cloudflare / Nginx Headers" to export a ready-to-use Cloudflare WAF custom rule expression matching blocked AI user-agents, along with Cloudflare Pages _headers and nginx.conf snippets for X-Robots-Tag: noai, noimageai and Content-Usage.',
    },
    {
        question: 'Can I export my AI crawler governance policy and sitemap links to Excel (.xlsx) or CSV?',
        answer:
            'Yes. Click "Export Excel (.xlsx)" or "Export CSV (.csv)" in Tab 5 to download a complete spreadsheet inventory of all curated llms.txt links and all 45 AI crawler permission rules, protected by CWE-1236 spreadsheet formula injection guards.',
    },
];

export default function LlmsTxtGeneratorSeo() {
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: LLMS_TXT_GENERATOR_FAQS.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    const howToSchema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to Generate llms.txt, llms-full.txt, and AI Crawler robots.txt Files Online',
        description:
            'Step-by-step guide to creating spec-compliant llms.txt and llms-full.txt files from sitemaps or HTML, configuring 45 AI search and training crawlers in robots.txt, and exporting Next.js routes or W3C tdmrep.json.',
        step: [
            {
                '@type': 'HowToStep',
                position: 1,
                name: 'Select a GEO Strategy Preset or Import Your Sitemap / HTML',
                text: 'Choose one of the 6 GEO presets (such as GEO Maximum Search Visibility) or upload/paste your sitemap.xml, existing llms.txt, or robots.txt file locally in your browser.',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Curate H2 Link Sections & Convert HTML Docs for llms-full.txt',
                text: 'Organize your primary documentation, API reference, and ## Optional links in Tab 1, and convert raw HTML documentation pages into clean Markdown in Tab 4.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Configure the 45-Bot AI Crawler Matrix & RFC 9309 Inheritance Guard',
                text: 'In Tab 2, allow AI Search Citation bots (OAI-SearchBot, Claude-SearchBot, PerplexityBot) while blocking Model Training crawlers (GPTBot, ClaudeBot, CCBot) and keeping the RFC 9309 Disallow Inheritance Guard active.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Run 1-Click Auto-Fix & Export All 10 GEO Deliverables',
                text: 'Verify 100/100 compliance in Tab 3 and download llms.txt, llms-full.txt, robots.txt, ai.txt, /.well-known/tdmrep.json, Next.js route.ts, or Excel (.xlsx) in Tab 5.',
            },
        ],
    };

    return (
        <article className="mt-16 w-full min-w-0 max-w-full overflow-x-hidden space-y-12 text-slate-700 dark:text-slate-300">
            {/* Structured Data Scripts (FAQPage & HowTo) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />

            {/* ============================================================================
          SECTION 1: EXECUTIVE OVERVIEW & GEO ARCHITECTURE
          ============================================================================ */}
            <section
                aria-labelledby="llms-txt-architecture-overview"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2
                        id="llms-txt-architecture-overview"
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
                    >
                        Client-Side <code>llms.txt</code>, <code>llms-full.txt</code> &amp; AI Crawler (<code>robots.txt</code>) Studio
                    </h2>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shrink-0">
                        <Sparkles className="h-3.5 w-3.5" />
                        llmstxt.org v2 + RFC 9309 + IETF AIPREF
                    </span>
                </div>

                <p className="mt-3 w-full text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Generate spec-compliant <strong><code>llms.txt</code></strong>, <strong><code>llms-full.txt</code></strong>,
                    and <strong><code>llms-ctx.txt</code></strong> files from <code>sitemap.xml</code> or raw HTML, configure{' '}
                    <strong>45 verified 2026 AI crawler user-agents</strong> in <code>robots.txt</code> without RFC 9309
                    inheritance leaks, and export <strong>IETF AIPREF <code>Content-Usage</code></strong>,{' '}
                    <strong>W3C <code>/.well-known/tdmrep.json</code></strong>, and <strong>Next.js <code>route.ts</code></strong>{' '}
                    handlers 100% locally in your browser.
                </p>

                <blockquote className="p-4 my-6 bg-indigo-50/80 border-l-4 border-indigo-600 rounded-r-xl dark:bg-slate-800/80 not-italic">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
                        <strong>Local Browser Processing &amp; Privacy Disclosure:</strong> Your selected file contents, XML
                        sitemaps, and HTML pages are processed locally in your browser and are not uploaded to KivaroTools servers.
                        The website may still load general analytics or other third-party website resources.
                    </p>
                </blockquote>

                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    <p>
                        In Generative Engine Optimization (GEO) and modern technical documentation, websites face two intertwined
                        challenges: <strong>helping AI answer engines and coding assistants understand your site accurately</strong>{' '}
                        (via <code>/llms.txt</code> and <code>/llms-full.txt</code>) while{' '}
                        <strong>controlling which AI bots may crawl your pages for search citations versus foundation model training</strong>{' '}
                        (via <code>/robots.txt</code>, IETF <code>Content-Usage</code>, and W3C <code>tdmrep.json</code>).
                    </p>
                    <p>
                        Existing online utilities handle these files in isolation—and often introduce severe regressions. Standalone{' '}
                        <code>llms.txt</code> generators create a Markdown index (or charge $2.99 to unlock{' '}
                        <code>llms-full.txt</code>) without checking whether your <code>robots.txt</code> blocks the very AI search
                        bots meant to read it. Conversely, generic &quot;Block All AI&quot; <code>robots.txt</code> wizards lump{' '}
                        <strong>AI Search Citation bots</strong> (<code>OAI-SearchBot</code>, <code>Claude-SearchBot</code>,{' '}
                        <code>PerplexityBot</code>) together with <strong>Foundation Model Training scrapers</strong> (
                        <code>GPTBot</code>, <code>ClaudeBot</code>, <code>CCBot</code>), accidentally de-indexing your website from
                        ChatGPT Search and Perplexity live answers—or introducing <strong>RFC 9309 §2.2.1 group-override leaks</strong>{' '}
                        that expose <code>/admin/</code> and <code>/checkout/</code> to allowed AI bots. KivaroTools unifies both
                        workflows inside a single 5-tab verification and compilation studio.
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                            <FileText className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            Free llms.txt, llms-full.txt &amp; Sitemap/HTML Parser
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Imports up to <code>5,000</code> URLs from <code>sitemap.xml</code>, classifies links into{' '}
                            <code>## H2</code> sections (placing <code>## Optional</code> last per <code>llmstxt.org</code> v2), and
                            converts raw HTML into clean Markdown for <code>llms-full.txt</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                            <Bot className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            45-Bot Taxonomic Matrix &amp; RFC 9309 Inheritance Guard
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Separates <strong>AI Search Citation</strong> &amp; <strong>User Fetchers</strong> from{' '}
                            <strong>Model Training</strong> &amp; <strong>Bulk Scrapers</strong>, and repeats global{' '}
                            <code>Disallow</code> paths inside allowed bot blocks so private folders never leak.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            <Code2 className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            12-Point Linter, Token Budget &amp; 10 Export Formats
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Audits token budgets across GPT-4o, Claude 4, Gemini 2.5 &amp; DeepSeek R1, fixes relative URLs and
                            marketing fluff in 1 click, and exports Next.js <code>route.ts</code>, <code>tdmrep.json</code>, and{' '}
                            <code>.xlsx</code>.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 2: COMPLETE INTERNAL WORKING STRUCTURE (HOW THE ENGINE WORKS)
          ============================================================================ */}
            <section
                aria-labelledby="llms-txt-working-structure"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2.5 mb-2">
                    <Cpu className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="llms-txt-working-structure"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Complete Working Structure: How the Client-Side GEO &amp; AI Crawler Engine Works
                    </h2>
                </div>
                <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    <code>lib/llmsTxtGeneratorEngine.ts</code> executes a 5-stage deterministic pipeline entirely in browser
                    memory:
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                            1
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Sitemap XML &amp; HTML DOM Ingestion
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Parses <code>&lt;url&gt;&lt;loc&gt;</code> entries from <code>sitemap.xml</code> (up to{' '}
                            <code>5,000</code> URLs), classifies paths into <code>## H2</code> sections, and strips{' '}
                            <code>&lt;nav&gt;</code>/<code>&lt;script&gt;</code>/<code>&lt;footer&gt;</code> from raw HTML.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                            2
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            llmstxt.org v2 AST Compilation
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Synthesizes the mandatory <code># H1</code> heading, <code>&gt; blockquote</code> abstract,{' '}
                            <code>## H2</code> file lists (sorting <code>## Optional</code> strictly last),{' '}
                            <code>llms-full.txt</code>, and XML <code>llms-ctx.txt</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
                            3
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            45-Bot Taxonomic Matrix &amp; RFC 9309
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Maps 45 AI user-agents across 5 functional roles, inherits global <code>Disallow</code> paths into
                            allowed bot groups, and appends IETF <code>Content-Usage</code> rules.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white">
                            4
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            12-Point Cross-File Linter &amp; Auto-Fix
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Detects relative URLs, duplicate links, marketing buzzwords, retired bot tokens (<code>Claude-Web</code>),
                            and <code>robots.txt</code> vs. <code>llms.txt</code> contradictions.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                            5
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Token Budgeting &amp; 10-Format Export
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Computes BPE token budgets across 4 LLM families, SHA-256 digests, Next.js <code>route.ts</code> code,
                            W3C <code>tdmrep.json</code>, and CWE-1236 safe <code>.xlsx</code> workbooks.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 2B: COMPLETE STEP-BY-STEP USER GUIDE
          ============================================================================ */}
            <section
                aria-labelledby="llms-txt-complete-user-guide"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
            >
                <div>
                    <h2
                        id="llms-txt-complete-user-guide"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Complete Step-by-Step Guide: How to Build &amp; Validate <code>llms.txt</code> and AI <code>robots.txt</code>
                    </h2>
                    <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Follow these four steps to prepare your documentation, SaaS application, or e-commerce store for AI answer
                        engines and coding assistants:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Step 1: Choose a Sample Project or Import Your Sitemap / Existing Files
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Click one of the three built-in sample projects (<strong>AcmeCloud Developer Platform</strong>,{' '}
                            <strong>LuxeCart E-Commerce Storefront</strong>, or <strong>QuantumDigest Research Publisher</strong>) or
                            upload your own <code>sitemap.xml</code>, <code>llms.txt</code>, or <code>robots.txt</code> file.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Step 2: Curate H2 Sections in Tab 1 &amp; Convert HTML Pages in Tab 4
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            In Tab 1, edit your <code># H1</code> title, <code>&gt; blockquote</code> summary, and curated links across{' '}
                            <code>## Core Documentation</code>, <code>## API &amp; SDK Reference</code>, and <code>## Optional</code>.
                            In Tab 4, paste raw HTML pages to strip navigation/script noise and append clean Markdown to{' '}
                            <code>llms-full.txt</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Step 3: Configure the 45-Bot AI Crawler Matrix &amp; RFC 9309 Guard in Tab 2
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Select a GEO Strategy Preset (such as <code>GEO Maximum Search Visibility</code>) to allow AI Search
                            Citation bots (<code>OAI-SearchBot</code>, <code>Claude-SearchBot</code>, <code>PerplexityBot</code>)
                            while blocking training scrapers (<code>GPTBot</code>, <code>ClaudeBot</code>, <code>CCBot</code>) and
                            inheriting global <code>Disallow</code> paths.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Step 4: Run 1-Click Auto-Fix in Tab 3 &amp; Export 10 Formats in Tab 5
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Open Tab 3 to inspect the 12-Point Linter and Multi-Model Token Budget table (clicking{' '}
                            <strong>1-Click Auto-Fix</strong> if any issues are flagged), then open Tab 5 to download{' '}
                            <code>llms.txt</code>, <code>llms-full.txt</code>, <code>robots.txt</code>, <code>tdmrep.json</code>,
                            Next.js <code>route.ts</code>, or <code>.xlsx</code>.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 3: REAL PRACTICAL EXAMPLES (BEFORE VS. AFTER SHOWCASES)
          ============================================================================ */}
            <section
                aria-labelledby="llms-txt-real-examples"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-8"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Terminal className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <h2
                            id="llms-txt-real-examples"
                            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                        >
                            Real-World Examples: <code>llmstxt.org</code> v2 Structure, RFC 9309 Fix &amp; W3C <code>tdmrep.json</code>
                        </h2>
                    </div>
                    <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Compare broken, low-signal configurations against the spec-compliant files produced by KivaroTools:
                    </p>
                </div>

                {/* Example 1 */}
                <div className="space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-xs font-mono">Example 1</span>
                        <span>
                            Broken Marketing <code>llms.txt</code> (Relative URLs &amp; Fluff) vs. Spec-Valid <code>llmstxt.org</code> v2 Output
                        </span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                            <div className="text-rose-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                BEFORE: Invalid llms.txt (Relative Links + Marketing Fluff)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`## Welcome to AcmeCloud!
> Our revolutionary world-class platform supercharges your workflow!

- [Click here](/docs/quickstart): Our cutting-edge guide.
- [Read more](/api/authentication): Best-in-class security.`}</pre>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                            <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                AFTER: Auto-Fixed llmstxt.org v2 Compliant Output
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`# AcmeCloud Edge Runtime & SDK

> Serverless WebAssembly compute platform, TypeScript SDK, and REST API reference.

## Core Documentation

- [Quickstart & CLI Installation](https://docs.acmecloud.dev/docs/quickstart): Install acme-cli and deploy edge functions.

## API & SDK Reference

- [REST API v2 Authentication](https://docs.acmecloud.dev/api/authentication): Bearer RS256 JWT tokens and HMAC webhooks.`}</pre>
                        </div>
                    </div>
                </div>

                {/* Example 2 */}
                <div className="space-y-3 pt-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-mono">Example 2</span>
                        <span>
                            Vulnerable AI <code>robots.txt</code> (RFC 9309 Override Leak) vs. Inheritance-Safe GEO <code>robots.txt</code>
                        </span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                            <div className="text-rose-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                BEFORE: RFC 9309 Leak (OAI-SearchBot Ignores User-agent: * Disallow!)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`User-agent: *
Disallow: /admin/
Disallow: /checkout/

# BUG: Under RFC 9309, OAI-SearchBot ignores User-agent: *
# and is now allowed to crawl /admin/ and /checkout/!
User-agent: OAI-SearchBot
Allow: /`}</pre>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                            <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                AFTER: RFC 9309 Inheritance-Safe + IETF AIPREF robots.txt
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`User-agent: *
Allow: /llms.txt
Disallow: /admin/
Disallow: /checkout/
Content-Usage: search=y, ai=y, train-ai=n

User-agent: OAI-SearchBot
User-agent: Claude-SearchBot
User-agent: PerplexityBot
Allow: /
Allow: /llms.txt
Disallow: /admin/
Disallow: /checkout/

User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
Disallow: /`}</pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 4: 5-ROLE AI CRAWLER TAXONOMY MATRIX (45 VERIFIED USER-AGENTS)
          ============================================================================ */}
            <section
                aria-labelledby="llms-txt-bot-taxonomy"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="llms-txt-bot-taxonomy"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Technical Reference: 5-Role AI Crawler Taxonomy (45 Verified 2026 User-Agents)
                </h2>
                <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Understanding the functional distinction between AI Search Citation bots, User-Triggered Fetchers, Usage
                    Opt-Out Tokens, and Foundation Model Training Crawlers is essential before editing <code>robots.txt</code>:
                </p>

                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[720px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Taxonomic Role</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Representative User-Agents</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">What They Actually Do</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Recommended GEO Policy</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">
                                    1. AI Search &amp; Live Citation Bots (11 Bots)
                                </th>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                                    OAI-SearchBot, Claude-SearchBot, PerplexityBot, DuckAssistBot, Amzn-SearchBot, YouBot, PhindBot, Google-CloudVertexBot, Googlebot, bingbot, Applebot
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Index web pages to ground real-time search answers and display clickable source citations.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    ALLOW (Required for ChatGPT, Claude &amp; Perplexity traffic)
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">
                                    2. User-Triggered Live Fetchers (6 Bots)
                                </th>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                                    ChatGPT-User, Claude-User, Perplexity-User, MistralAI-User, Meta-ExternalFetcher, Google-Read-Aloud
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Fetch a specific page or <code>/llms.txt</code> on-demand when a human user pastes your URL into an AI chat.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    ALLOW (Lets users point AI assistants to your docs)
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400">
                                    3. Usage Opt-Out Control Tokens (2 Tokens)
                                </th>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                                    Google-Extended, Applebot-Extended
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Signal whether pages fetched by Googlebot/Applebot may be used to train Gemini or Apple Intelligence models.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 font-bold">
                                    BLOCK to opt out of training (Zero impact on Search)
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">
                                    4. Foundation Model Training Crawlers (12 Bots)
                                </th>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                                    GPTBot, ClaudeBot, Meta-ExternalAgent, Amazonbot, Cohere-ai, cohere-training-data-crawler, DeepSeekBot, GrokBot, xAI-Bot, PanguBot, AI2Bot, Ai2Bot-Dolma
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Harvest web text to pre-train future foundation language models.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 font-bold">
                                    BLOCK (Unless open-source SDK docs)
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400">
                                    5. Bulk Dataset Scrapers &amp; Brokers (14 Bots)
                                </th>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                                    CCBot, Bytespider, Diffbot, ImagesiftBot, omgili, omgilibot, PetalBot, TimpiBot, VelenPublicWebCrawler, Kangaroo Bot, Scrapy, img2dataset, FriendlyCrawler, ICC-Crawler
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Scrape petabyte-scale archives or resell web feeds without sending referral traffic.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 font-bold">
                                    BLOCK in robots.txt &amp; Edge WAF
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 5: COMPETITOR COMPARISON MATRIX
          ============================================================================ */}
            <section
                aria-labelledby="llms-txt-competitor-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="llms-txt-competitor-matrix"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Feature &amp; Architecture Comparison: KivaroTools vs. Standalone Generators &amp; Plugins
                </h2>
                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Capability / Feature</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-indigo-600 dark:text-indigo-400">
                                    KivaroTools GEO &amp; AI Crawler Studio
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Basic Online llms.txt Generators
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Generic AI robots.txt Wizards
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    CMS Plugins (Yoast / AIOSEO Free)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    llms.txt + llms-full.txt + llms-ctx.txt
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    All 3 Generated 100% Free
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-amber-600">
                                    llms.txt only (or $2.99 fee for llms-full.txt)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    llms-full.txt locked behind paid Pro tier
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Search Citation vs. Model Training Split
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Yes — 45 Bots Across 5 Taxonomic Roles
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                                    Mixes search &amp; training (Risks AI de-indexing)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Basic toggle only</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    RFC 9309 Specific-Group Inheritance Guard
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Yes — Automatic Disallow Inheritance + Linter
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                                    No (Exposes /admin/ to allowed bots)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">No</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    IETF AIPREF Content-Usage &amp; W3C tdmrep.json
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Yes — Built-In Standards Compiler
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Rare</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Next.js route.ts, Edge Headers &amp; .XLSX Export
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    10 Export Formats Included
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Plain .txt only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Plain .txt only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">WordPress only</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 6: 10 SUPPORTED EXPORT DELIVERABLES TABLE
          ============================================================================ */}
            <section
                aria-labelledby="llms-txt-export-deliverables"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h2
                        id="llms-txt-export-deliverables"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        10 Supported GEO, AI Governance &amp; Developer Export Formats
                    </h2>
                </div>
                <div className="w-full mt-4 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[680px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">#</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Deliverable File</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Deployment Path / Target</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Standard / Specification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {[
                                ['1', 'llms.txt', '/llms.txt', 'llmstxt.org v2 Curated Markdown Index (H1, Blockquote, H2 Lists, ## Optional)'],
                                ['2', 'llms-full.txt', '/llms-full.txt', 'Mintlify / Anthropic Full-Text Concatenated Documentation Bundle'],
                                ['3', 'llms-ctx.txt', '/llms-ctx.txt', 'Answer.AI XML-Tagged (<project><documents><document>) Context File'],
                                ['4', 'robots.txt', '/robots.txt', 'RFC 9309 + 45 AI Crawlers + Inherited Disallow + IETF Content-Usage'],
                                ['5', 'ai.txt', '/ai.txt', 'Spawning / ai.txt Per-Extension AI Training & Inference Policy'],
                                ['6', 'tdmrep.json', '/.well-known/tdmrep.json', 'W3C TDM Reservation Protocol & EU DSM Directive Art. 4 JSON'],
                                ['7', 'Next.js Route Handlers', 'app/llms.txt/route.ts & app/robots.ts', 'Next.js 14/15/16 App Router TypeScript Route & Metadata Handlers'],
                                ['8', 'Edge & Server Config', 'Cloudflare WAF / _headers / nginx.conf', 'X-Robots-Tag: noai, noimageai + Content-Usage + WAF Bot Expression'],
                                ['9', 'GEO Governance Matrix', 'geo_ai_governance_matrix.xlsx / .csv', 'OpenXML Excel Workbook & RFC 4180 CSV (CWE-1236 Formula-Safe)'],
                                ['10', 'SHA-256 Audit Certificate', 'geo-sha256-compliance-certificate.json', 'Cryptographic SHA-256 Digest & Governance Posture Proof'],
                            ].map(([num, name, path, spec]) => (
                                <tr key={num}>
                                    <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">{num}</td>
                                    <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">{name}</td>
                                    <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">{path}</td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">{spec}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 6B: 12-POINT LLMSTXT.ORG V2 & RFC 9309 CROSS-FILE LINTER RULES
          ============================================================================ */}
            <section
                aria-labelledby="llms-txt-12-point-linter-rules"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="llms-txt-12-point-linter-rules"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        12-Point <code>llmstxt.org</code> v2 &amp; RFC 9309 Cross-File Linter Rules (<code>validateGeoWorkspace</code>)
                    </h2>
                </div>
                <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Every edit inside the workbench is continuously validated against 12 deterministic specification and cross-file
                    security rules—with 1-click remediation via <code>autoFixGeoWorkspace()</code>:
                </p>

                <div className="w-full mt-4 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">#</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Linter Rule Code</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Severity</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Target Scope</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">What It Detects &amp; How 1-Click Auto-Fix Resolves It</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {[
                                ['1', 'MISSING_OR_MULTIPLE_H1', 'CRITICAL', 'llms.txt', 'Flags missing # H1 project title on Line 1; auto-fills default project heading.'],
                                ['2', 'MISSING_OR_LONG_BLOCKQUOTE', 'HIGH / MEDIUM', 'llms.txt', 'Flags missing or overly long (> 360 chars) > blockquote summary; synthesizes or trims to a concise abstract.'],
                                ['3', 'EMPTY_SECTIONS_OR_LINKS', 'CRITICAL', 'llms.txt', 'Flags llms.txt files that have 0 active curated Markdown links across H2 sections.'],
                                ['4', 'RELATIVE_URL_IN_LLMS_TXT', 'HIGH', 'llms.txt', 'Detects relative paths (/docs/api) that break when pasted into external LLMs; auto-prepends canonical Site URL.'],
                                ['5', 'DUPLICATE_LINK_URL', 'MEDIUM', 'llms.txt', 'Detects duplicate URLs across sections that waste context window tokens; deduplicates automatically.'],
                                ['6', 'MARKETING_FLUFF_DESCRIPTION', 'MEDIUM', 'llms.txt', 'Detects promotional superlatives ("revolutionary", "world-class", "synergistic"); rewrites clean technical prose.'],
                                ['7', 'VAGUE_LINK_TITLE', 'MEDIUM', 'llms.txt', 'Flags non-descriptive anchor titles ("Click here", "Read more"); derives semantic titles from URL slugs.'],
                                ['8', 'MISSING_OPTIONAL_SECTION_FOR_LARGE_INDEX', 'MEDIUM', 'llms.txt', 'Flags indexes with >= 8 links that lack an ## Optional section; moves secondary policy/changelog links to ## Optional.'],
                                ['9', 'ROBOTS_BLOCKS_AI_SEARCH_CITATIONS', 'CRITICAL', 'cross-file', 'Flags when OAI-SearchBot, Claude-SearchBot, or PerplexityBot are blocked in robots.txt while publishing llms.txt.'],
                                ['10', 'RFC9309_SPECIFIC_GROUP_INHERITANCE_LEAK', 'CRITICAL', 'robots.txt', 'Detects when allowed AI bot groups omit global Disallow paths (/admin/, /checkout/); enables RFC 9309 Inheritance Guard.'],
                                ['11', 'ROBOTS_BLOCKS_LLMS_TXT_PATH', 'CRITICAL', 'cross-file', 'Detects when Disallow: /llms.txt or Disallow: / blocks AI agents from fetching /llms.txt; adds explicit Allow directives.'],
                                ['12', 'DEPRECATED_BOT_USER_AGENT', 'MEDIUM', 'robots.txt', 'Flags retired user-agent tokens (anthropic-ai, Claude-Web, FacebookBot, cohere-ai-bot) and purges them in 1 click.'],
                            ].map(([num, codeStr, sev, scope, desc]) => (
                                <tr key={num}>
                                    <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">{num}</td>
                                    <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-semibold border border-slate-200 dark:border-slate-700">{codeStr}</td>
                                    <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">{sev}</td>
                                    <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">{scope}</td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">{desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 7: TROUBLESHOOTING COMMON LLMS.TXT & AI ROBOTS.TXT MISTAKES (6 SCENARIOS)
          ============================================================================ */}
            <section
                aria-labelledby="llms-txt-troubleshooting"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="llms-txt-troubleshooting"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Common <code>llms.txt</code> &amp; AI Crawler Mistakes and How to Fix Them
                </h2>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            1. Putting Disallow Directives Inside llms.txt
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Issue:</strong> <code>llms.txt</code> is a curated Markdown reading guide for inference, not an
                            access-control file. Putting <code>Disallow:</code> lines inside <code>llms.txt</code> blocks nothing.
                            <br />
                            <strong>Fix:</strong> Enforce crawler permissions in <code>/robots.txt</code>,{' '}
                            <code>/.well-known/tdmrep.json</code>, and Cloudflare WAF rules while keeping <code>/llms.txt</code> pure
                            Markdown.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            2. Cloudflare Bot Fight Mode Blocking AI Search Bots
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Issue:</strong> Even if <code>robots.txt</code> allows <code>OAI-SearchBot</code> and{' '}
                            <code>PerplexityBot</code>, CDN Bot Fight Mode may return HTTP <code>403 Forbidden</code> when they fetch{' '}
                            <code>/llms.txt</code>.
                            <br />
                            <strong>Fix:</strong> Verify that your CDN/WAF allows verified IP ranges (<code>searchbot.json</code>,{' '}
                            <code>perplexitybot.json</code>) to fetch <code>/llms.txt</code> with HTTP <code>200 OK</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            3. RFC 9309 §2.2.1 Specific-Group Override Leaks
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Issue:</strong> Adding <code>User-agent: OAI-SearchBot</code> with <code>Allow: /</code> causes
                            that bot to ignore <code>User-agent: *</code> <code>Disallow: /admin/</code> rules completely.
                            <br />
                            <strong>Fix:</strong> Keep <strong>Enforce RFC 9309 Disallow Inheritance</strong> enabled in Tab 2 so
                            global private paths are repeated inside every allowed bot block.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            4. Confusing Google-Extended with Googlebot
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Issue:</strong> Blocking <code>Googlebot</code> de-indexes your entire site from Google Search,
                            whereas leaving <code>Google-Extended</code> allowed lets Gemini train on your pages.
                            <br />
                            <strong>Fix:</strong> Keep <code>Googlebot</code> and <code>Applebot</code> <strong>ALLOWED</strong> and
                            block <code>Google-Extended</code> and <code>Applebot-Extended</code> to opt out of model training safely.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            5. Dumping 5,000 Unfiltered Sitemap URLs into llms.txt
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Issue:</strong> Converting an entire 5,000-URL sitemap into <code>llms.txt</code> creates a
                            150,000-token index that overflows LLM context windows and dilutes core documentation.
                            <br />
                            <strong>Fix:</strong> Keep <code>llms.txt</code> focused on your top 15–50 canonical docs/API guides and
                            place secondary links under <code>## Optional</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            6. Serving llms.txt Without UTF-8 Content-Type Headers
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Issue:</strong> Serving <code>/llms.txt</code> with missing charset headers or restrictive CORS
                            blocks browser-based AI tools and IDE extensions from reading your index.
                            <br />
                            <strong>Fix:</strong> Export our Next.js <code>route.ts</code> or Cloudflare/Nginx headers in Tab 5 to
                            serve <code>Content-Type: text/plain; charset=utf-8</code> and <code>Access-Control-Allow-Origin: *</code>.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 8: SEARCH INTENT & WORKFLOW COVERAGE (32 TARGET KEYWORDS)
          ============================================================================ */}
            <section
                aria-labelledby="llms-txt-keyword-coverage"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Search className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="llms-txt-keyword-coverage"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Supported GEO, <code>llms.txt</code> &amp; AI Crawler Governance Workflows
                    </h2>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            llms.txt &amp; llms-full.txt Generation (11 Workflows)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>llms.txt generator</li>
                            <li>free llms.txt generator online</li>
                            <li>llms-full.txt generator</li>
                            <li>generative engine optimization tool</li>
                            <li>geo llms.txt builder</li>
                            <li>sitemap.xml to llms.txt converter</li>
                            <li>html to llms-full.txt markdown</li>
                            <li>nextjs app router llms.txt route.ts</li>
                            <li>cursor windsurf docs llms.txt builder</li>
                            <li>ai search citation optimization tool</li>
                            <li>zero-upload geo governance studio</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            AI Crawler robots.txt &amp; Bot Rules (11 Workflows)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>ai crawler robots.txt generator</li>
                            <li>block gptbot allow oai-searchbot</li>
                            <li>block claudebot allow claude-searchbot</li>
                            <li>perplexitybot robots.txt rules</li>
                            <li>google-extended robots.txt generator</li>
                            <li>applebot-extended opt out rules</li>
                            <li>deepseekbot robots.txt block</li>
                            <li>ccbot common crawl block rules</li>
                            <li>bytespider robots.txt disallow</li>
                            <li>chatgpt search visibility robots.txt</li>
                            <li>claude search citation allowlist</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            Linter, Token Budget &amp; IETF/W3C Standards (10 Workflows)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>llmstxt.org v2 validator</li>
                            <li>rfc 9309 robots.txt inheritance validator</li>
                            <li>ietf aipref content-usage generator</li>
                            <li>w3c tdmrep.json generator</li>
                            <li>eu dsm article 4 ai opt out</li>
                            <li>ai.txt generator for websites</li>
                            <li>x-robots-tag noai noimageai header</li>
                            <li>nextjs metadataroute.robots generator</li>
                            <li>llm context window token calculator</li>
                            <li>client-side llms.txt linter</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 9: FREQUENTLY ASKED QUESTIONS (16 INTERACTIVE ACCORDIONS)
          ============================================================================ */}
            <section
                aria-labelledby="llms-txt-frequently-asked-questions"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="llms-txt-frequently-asked-questions"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="space-y-3">
                    {LLMS_TXT_GENERATOR_FAQS.map((faq, index) => (
                        <details
                            key={index}
                            className="group rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
                        >
                            <summary className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base cursor-pointer select-none list-none flex items-center justify-between gap-3">
                                <span>{faq.question}</span>
                                <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform shrink-0">
                                    &#9662;
                                </span>
                            </summary>
                            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 break-words">
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </section>

            {/* ============================================================================
          SECTION 10: INTERNAL CROSS-LINKING TO RELATED SEO & DEVELOPER TOOLS
          ============================================================================ */}
            <section
                aria-labelledby="llms-txt-related-utilities"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="llms-txt-related-utilities"
                        className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Related Client-Side SEO, Developer &amp; Security Utilities
                    </h2>
                </div>
                <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed break-words">
                    Continue your technical SEO, network debugging, and data engineering workflow with our integrated browser
                    tools:
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/developer/har-analyzer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            HAR File Analyzer, Waterfall Viewer &amp; Sanitizer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect 7-phase HTTP waterfalls, decode SAML 2.0 &amp; JWT tokens, scrub 14 secret surfaces, and export to k6 &amp; OpenAPI 3.1.
                        </p>
                    </Link>

                    <Link
                        href="/developer/parquet-viewer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            Parquet, Avro &amp; Feather Viewer + CSV/XLSX →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect binary lakehouse files locally with 64-bit BigInt safety, 10-dialect SQL DDL, and Excel export.
                        </p>
                    </Link>

                    <Link
                        href="/document/pdf-scrubber"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            PDF Bank Statement &amp; Invoice Data Scrubber →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Permanently redact IBANs, Luhn Card PANs, Tax IDs, and all 12 hidden PDF metadata surfaces before AI uploads.
                        </p>
                    </Link>

                    <Link
                        href="/developer/json-formatter"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            JSON Formatter, Validator &amp; Tree Viewer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Validate and format W3C tdmrep.json files, Schema.org JSON-LD graphs, and OpenAPI specifications.
                        </p>
                    </Link>

                    <Link
                        href="/developer/regex-tester"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            Regex Tester, Debugger &amp; Code Generator →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Test Cloudflare WAF user-agent matching expressions and robots.txt path wildcards with a ReDoS watchdog.
                        </p>
                    </Link>

                    <Link
                        href="/developer/json-converter"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            JSON to CSV, Excel (.xlsx), YAML &amp; XML Converter →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Transform structured crawl inventories, JSON-LD entities, and sitemap feeds into spreadsheets locally.
                        </p>
                    </Link>
                </div>
            </section>
        </article>
    );
}