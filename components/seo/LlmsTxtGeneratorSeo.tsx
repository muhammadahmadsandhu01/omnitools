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
    Code2,
    FileText,
    CheckCircle2,
    FileCode2,
} from 'lucide-react';

export interface FaqItem {
    question: string;
    answer: string;
}

export const LLMS_TXT_GENERATOR_FAQS: FaqItem[] = [
    {
        question: 'What is llms.txt, and is it an official W3C or IETF web standard?',
        answer:
            'An llms.txt file is a proposed Markdown convention served at /llms.txt (following the llmstxt.org v2 format proposed by Jeremy Howard at Answer.AI). It uses a single # H1 title, a concise > blockquote summary, and ## H2 link sections so AI assistants and coding tools can read your key documentation. It is an emerging community convention—not a ratified W3C or IETF standard.',
    },
    {
        question: 'How is llms.txt different from robots.txt and sitemap.xml?',
        answer:
            'robots.txt (RFC 9309) sets crawler Allow/Disallow access rules, sitemap.xml lists every indexable URL for search engines, and llms.txt curates a lightweight Markdown table of contents of your highest-value docs and guides for LLMs. Use all three together: robots.txt manages crawler access, sitemap.xml supports search indexing, and llms.txt guides AI assistants to clean reference pages.',
    },
    {
        question: 'What is the difference between llms.txt, llms-full.txt, and llms-ctx.txt?',
        answer:
            'llms.txt is a compact index of annotated Markdown links. llms-full.txt concatenates the complete cleaned Markdown text of your primary documentation pages into one file so an LLM can ingest your docs in a single request. llms-ctx.txt wraps those documents inside structured XML (<project><documents><document>) tags for direct prompt context. KivaroTools compiles all three files for free in Tabs 1, 4, and 5.',
    },
    {
        question: 'Does Google use llms.txt, or does it guarantee ChatGPT and Perplexity citations?',
        answer:
            'No. llms.txt is not a Google Search ranking factor and does not guarantee citations in ChatGPT, Claude, or Perplexity. Real-world adoption is currently strongest among developer documentation platforms and AI coding agents (such as Cursor and Windsurf). Likewise, robots.txt is a voluntary protocol—your server access logs remain the only reliable proof of crawler behavior.',
    },
    {
        question: 'Why does KivaroTools ask me to paste or upload sitemap.xml instead of auto-crawling my live URL?',
        answer:
            'KivaroTools runs locally in your browser without a remote server-side web crawler. Pasting or uploading local sitemap.xml, RSS feeds, raw HTML, or existing llms.txt/robots.txt files lets you build and validate files for localhost, staging servers, and private documentation behind VPNs or logins without CORS proxy errors or exposing unpublished URLs to third-party crawlers. The local importer parses up to 5,000 URLs.',
    },
    {
        question: 'How do I validate an existing llms.txt file, and what common errors break it?',
        answer:
            'Open Tab 3 (12-Point Linter & Token Budget) and paste your existing draft into the llms.txt validator and checker. It evaluates 12 deterministic rules—catching missing H1 titles, blockquotes over 360 characters, relative or malformed URLs, duplicate links, promotional buzzwords, vague anchor text, and robots.txt conflicts—and repairs auto-fixable issues with 1-Click Auto-Fix.',
    },
    {
        question: 'How do I block AI training bots (GPTBot, ClaudeBot) while allowing AI search citations (OAI-SearchBot, PerplexityBot)?',
        answer:
            'Use separate User-agent blocks in robots.txt that disallow foundation model training crawlers (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, Meta-ExternalAgent, CCBot) while keeping AI search citation bots (OAI-SearchBot, Claude-SearchBot, PerplexityBot) and user-triggered live fetchers (ChatGPT-User, Claude-User, Perplexity-User) allowed. KivaroTools’ GEO Maximum Search Visibility preset configures all 45 user-agents in one click.',
    },
    {
        question: 'What is the RFC 9309 §2.2.1 Specific-Group Override Leak in robots.txt?',
        answer:
            'Under RFC 9309, when a crawler matches its own dedicated User-agent block (for example, User-agent: OAI-SearchBot), it completely ignores your wildcard User-agent: * group. If User-agent: * disallows /admin/ and /checkout/ but your OAI-SearchBot block only says Allow: /, OAI-SearchBot is permitted to crawl /admin/ and /checkout/. Keeping the RFC 9309 Disallow Inheritance toggle enabled copies global Disallow paths into every allowed bot block.',
    },
    {
        question: 'Will blocking Google-Extended or Applebot-Extended hurt my Google Search or Siri rankings?',
        answer:
            'No. Google-Extended and Applebot-Extended are usage-control tokens rather than web search crawlers. Keeping Googlebot and Applebot allowed preserves standard Google Search and Apple Spotlight/Siri indexing while disallowing Google-Extended and Applebot-Extended signals an opt-out from Gemini and Apple Intelligence model training.',
    },
    {
        question: 'Where do I upload and host llms.txt and robots.txt on Next.js, WordPress, or Cloudflare?',
        answer:
            'Serve both files at your domain root (/llms.txt and /robots.txt) returning HTTP 200 OK with UTF-8 plain text (for example, /public/ on Next.js, Vercel, or Netlify, or /public_html/ on WordPress/cPanel; subfolder indexes such as /docs/llms.txt are also supported in v2). Tab 5 exports ready-to-paste Next.js App Router handlers (app/llms.txt/route.ts and app/robots.ts) plus Cloudflare and Nginx header snippets.',
    },
    {
        question: 'How many LLM tokens should llms.txt stay under, and how does the Multi-Model Token Budget work?',
        answer:
            'Keep /llms.txt concise—typically your top 15–50 canonical docs with secondary pages moved under ## Optional so LLMs can skip them when context is tight. Tab 3 runs an in-browser BPE token heuristic estimating token counts and context-window usage across GPT-4o / o3-mini (128K), Claude 4 / 3.7 Sonnet (200K), Gemini 2.5 Pro (1M), and DeepSeek R1 / V3 (128K).',
    },
    {
        question: 'What is /.well-known/tdmrep.json, and does it guarantee EU DSM Article 4 legal compliance?',
        answer:
            '/.well-known/tdmrep.json is a machine-readable JSON file defined by the W3C Text and Data Mining Reservation Protocol (TDMRep) that publishes a tdm-reservation flag and optional tdm-policy URL at your origin. It provides a technical opt-out signal only—it does not constitute legal advice or guarantee legal compliance under EU Directive 2019/790 (DSM Article 4). Consult qualified legal counsel for copyright enforcement.',
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
        name: 'How to Generate, Validate, and Deploy llms.txt, llms-full.txt, and AI Crawler robots.txt Files',
        description:
            'Step-by-step workflow to create spec-compliant llms.txt and free llms-full.txt files from local sitemap XML or HTML, run 12-point validation with 1-click auto-fix, configure 45 AI crawler rules in robots.txt, and export 10 deployment formats.',
        step: [
            {
                '@type': 'HowToStep',
                position: 1,
                name: 'Load a Sample Project or Import Local Sitemap XML, RSS, or Existing Drafts',
                text: 'Choose a built-in sample workspace or paste/upload your local sitemap.xml (up to 5,000 URLs), RSS feed, raw HTML, or existing llms.txt / robots.txt file directly in your browser.',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Curate H2 Sections in Tab 1 and Compile HTML to llms-full.txt in Tab 4',
                text: 'Set your # H1 title, canonical Base Site URL, > blockquote abstract, and curated ## H2 link sections (placing secondary pages under ## Optional), then strip boilerplate HTML into clean Markdown for llms-full.txt.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Configure the 45-Bot AI Crawler Matrix and RFC 9309 Inheritance Guard in Tab 2',
                text: 'Apply a governance preset such as GEO Maximum Search Visibility to allow 11 search citation bots and 6 live fetchers while blocking 28 training crawlers, opt-out tokens, and bulk scrapers with RFC 9309 Disallow inheritance active.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Run the 12-Point Checker, 1-Click Auto-Fix, and 10-Format Export',
                text: 'Check your 0–100 score and Multi-Model BPE Token Budget in Tab 3, click 1-Click Auto-Fix for flagged issues, and export llms.txt, llms-full.txt, llms-ctx.txt, robots.txt, tdmrep.json, Next.js route.ts, or .xlsx in Tab 5.',
            },
        ],
    };

    return (
        <article className="not-prose mt-16 w-full min-w-0 max-w-full overflow-x-hidden space-y-12 text-slate-700 dark:text-slate-300">
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
                SECTION 1: BUILD LLMS.TXT V2 FROM LOCAL SITEMAP XML, RSS, OR PRIVATE DOCS
                ============================================================================ */}
            <section
                aria-labelledby="llms-txt-builder-overview"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2
                        id="llms-txt-builder-overview"
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
                    >
                        Build <code>llms.txt</code> v2 from Sitemap XML, RSS, or Private Docs (No Remote Crawl Needed)
                    </h2>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shrink-0">
                        <Sparkles className="h-3.5 w-3.5" />
                        llmstxt.org v2 • RFC 9309 • IETF AIPREF
                    </span>
                </div>

                <p className="mt-3 w-full text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Use this <strong><code>llms.txt</code> generator free</strong> in your browser as a unified{' '}
                    <strong><code>llms.txt</code> validator</strong>, <strong><code>llms.txt</code> checker</strong>, and{' '}
                    <strong>AI crawler <code>robots.txt</code> generator</strong>. Technical SEO teams and developers can{' '}
                    <strong>create <code>llms.txt</code> file</strong> indexes, run the built-in{' '}
                    <strong><code>llms-full.txt</code> generator</strong> and{' '}
                    <strong><code>llms-ctx.txt</code> generator</strong>, audit existing drafts against 12 deterministic rules,
                    and configure 45 AI bots—with zero signup, zero paywalls, and no watermarks.
                </p>

                <blockquote className="p-4 my-6 bg-indigo-50/80 border-l-4 border-indigo-600 rounded-r-xl dark:bg-slate-800/80 not-italic">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
                        <strong>Local Browser Workflow &amp; Privacy Disclosure:</strong> KivaroTools does not run a remote
                        server-side web crawler. Instead, you paste or upload local <code>sitemap.xml</code>, RSS, HTML, or
                        existing <code>llms.txt</code> / <code>robots.txt</code> files directly in your browser. Your pasted and
                        uploaded contents are processed locally and are not sent to KivaroTools servers—ideal for{' '}
                        <code>localhost</code>, private staging docs, and zero-CORS workflows. (The webpage itself may still
                        load general site analytics or third-party website resources.)
                    </p>
                </blockquote>

                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    <p>
                        Most online utilities split AI indexing and crawler governance across separate pages. Standalone{' '}
                        <code>llms txt generator</code> tools often charge for <code>llms-full.txt</code> compilation or skip
                        pre-publish validation, while generic <code>robots.txt</code> generators lump{' '}
                        <strong>AI search citation bots</strong> (<code>OAI-SearchBot</code>, <code>Claude-SearchBot</code>,{' '}
                        <code>PerplexityBot</code>) together with <strong>foundation model training crawlers</strong> (
                        <code>GPTBot</code>, <code>ClaudeBot</code>, <code>CCBot</code>).
                    </p>
                    <p>
                        Keeping both files synchronized in one studio prevents cross-file conflicts—such as publishing{' '}
                        <code>/llms.txt</code> while accidentally blocking <code>OAI-SearchBot</code> in <code>robots.txt</code>,
                        or introducing an <strong>RFC 9309 §2.2.1 group-override leak</strong> that exposes <code>/admin/</code>{' '}
                        and <code>/checkout/</code> when adding a dedicated bot block.
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                            <FileText className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            Sitemap to <code>llms.txt</code> Importer
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Paste or upload raw <code>sitemap.xml</code>, RSS feeds, or newline URLs (up to <code>5,000</code>{' '}
                            URLs locally) to auto-classify links into <code>## H2</code> sections with <code>## Optional</code>{' '}
                            sorted last per <code>llmstxt.org</code> v2.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                            <Bot className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            45-Bot Matrix &amp; RFC 9309 Guard
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Allow 11 Search Citation bots and 6 Live Fetchers while blocking 28 Training, Opt-Out, and Bulk
                            Scraper bots—with automatic RFC 9309 <code>Disallow</code> inheritance and an existing{' '}
                            <code>robots.txt</code> auditor.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            <Code2 className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            12-Point Checker &amp; 10 Dev Exports
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Validate pre-publish drafts on a 0–100 scale, run 1-Click Auto-Fix, check BPE token budgets across
                            4 LLM families, and export Next.js <code>route.ts</code>/<code>robots.ts</code>,{' '}
                            <code>tdmrep.json</code>, and <code>.xlsx</code>.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
                SECTION 2: STEP-BY-STEP WORKFLOW (ZERO OUTER LIST MARKERS)
                ============================================================================ */}
            <section
                aria-labelledby="llms-txt-step-by-step"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <h2
                            id="llms-txt-step-by-step"
                            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                        >
                            How to Create and Validate <code>llms.txt</code> &amp; AI <code>robots.txt</code> in 4 Steps
                        </h2>
                    </div>
                    <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Follow this four-step workflow to build, audit, and export production-ready files for developer docs,
                        SaaS applications, or publishing sites:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            Step 1: Load a Sample or Import Local Sitemap XML / Existing Drafts
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Start with one of the three built-in sample workspaces (<strong>AcmeCloud Docs</strong>,{' '}
                            <strong>LuxeCart Linter Demo</strong>, or <strong>QuantumDigest Publisher</strong>), or upload/paste
                            your own <code>sitemap.xml</code>, RSS feed, raw HTML, or existing <code>llms.txt</code> /{' '}
                            <code>robots.txt</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            Step 2: Curate H2 Sections &amp; Compile HTML to <code>llms-full.txt</code>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            In Tab 1, set your <code># H1</code> title, canonical Base Site URL, <code>&gt; blockquote</code>{' '}
                            summary, and curated <code>## H2</code> links (placing secondary pages under <code>## Optional</code>).
                            In Tab 4, paste raw HTML to strip <code>&lt;nav&gt;</code>, <code>&lt;script&gt;</code>, and{' '}
                            <code>&lt;footer&gt;</code> boilerplate into clean Markdown.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            Step 3: Configure the 45-Bot AI Crawler Matrix &amp; RFC 9309 Guard
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            In Tab 2, pick a preset (such as <code>GEO Maximum Search Visibility</code>) to allow AI search
                            citation bots and live fetchers while blocking training crawlers and bulk scrapers. Keep{' '}
                            <strong>Enforce RFC 9309 Disallow Inheritance</strong> enabled so private paths stay protected.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            Step 4: Run the 12-Point Checker, 1-Click Auto-Fix &amp; 10-Format Export
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            In Tab 3, check your 0–100 score and Multi-Model BPE Token Budget (clicking{' '}
                            <strong>1-Click Auto-Fix</strong> to resolve relative URLs, duplicates, or fluff). In Tab 5, download{' '}
                            <code>llms.txt</code>, <code>llms-full.txt</code>, <code>llms-ctx.txt</code>, <code>robots.txt</code>,{' '}
                            <code>tdmrep.json</code>, Next.js <code>route.ts</code>/<code>robots.ts</code>, or <code>.xlsx</code>.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
                SECTION 3: FREE LLMS-FULL.TXT & LLMS-CTX.TXT VIA HTML-TO-MARKDOWN
                ============================================================================ */}
            <section
                aria-labelledby="llms-full-txt-compiler"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5"
            >
                <div className="flex items-center gap-2">
                    <FileCode2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <h2
                        id="llms-full-txt-compiler"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Free <code>llms-full.txt</code> &amp; <code>llms-ctx.txt</code> Compilation via HTML-to-Markdown
                    </h2>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Several standalone generators charge a per-file fee (such as $2.99 / $1.49 promo) to unlock full-text bundles
                    or omit them altogether. Tab 4 gives you a free browser-local HTML-to-Markdown compiler that strips{' '}
                    <code>&lt;nav&gt;</code>, <code>&lt;script&gt;</code>, <code>&lt;style&gt;</code>, and{' '}
                    <code>&lt;footer&gt;</code> noise while preserving headings, fenced code blocks, and lists—compiling both{' '}
                    <code>llms-full.txt</code> (concatenated Markdown) and <code>llms-ctx.txt</code> (XML-wrapped{' '}
                    <code>&lt;project&gt;&lt;documents&gt;&lt;document&gt;</code> context) simultaneously.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-1.5">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white"><code>/llms.txt</code> (Index)</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Lightweight Markdown table of contents with your <code># H1</code> title, <code>&gt; blockquote</code>{' '}
                            abstract, and curated <code>## H2</code> links—ideal for fast agent navigation.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-1.5">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white"><code>/llms-full.txt</code> (Full Bundle)</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Concatenates cleaned Markdown bodies of your primary docs into one file so coding agents can read
                            core references in a single HTTP request.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-1.5">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white"><code>/llms-ctx.txt</code> (XML Context)</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Wraps each curated document in structured XML tags for direct paste-into-prompt workflows across
                            Claude, ChatGPT, and Gemini.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
                SECTION 4: 12-POINT LLMS.TXT VALIDATOR/CHECKER, AUTO-FIX & TOKEN BUDGET
                ============================================================================ */}
            <section
                aria-labelledby="llms-txt-validator-linter"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-8"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <h2
                            id="llms-txt-validator-linter"
                            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                        >
                            12-Point <code>llms.txt</code> Validator/Checker, 1-Click Auto-Fix &amp; BPE Token Budget
                        </h2>
                    </div>
                    <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Paste any pre-publish draft into Tab 3 to score compliance from 0–100, inspect context-window budgets
                        across <strong>GPT-4o / o3-mini (128K)</strong>, <strong>Claude 4 / 3.7 Sonnet (200K)</strong>,{' '}
                        <strong>Gemini 2.5 Pro (1M)</strong>, and <strong>DeepSeek R1 / V3 (128K)</strong>, and resolve
                        auto-fixable errors in one click:
                    </p>
                </div>

                {/* Before vs After Example 1 */}
                <div className="space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-xs font-mono">Worked Example</span>
                        <span>
                            Pre-Publish Validator Repair: Broken Draft (Relative URLs &amp; Fluff) → Valid <code>llmstxt.org</code> v2
                        </span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                            <div className="text-rose-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                BEFORE: Invalid Draft (Relative Links, Buzzwords &amp; Vague Anchors)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`## Welcome to AcmeCloud!
> Our revolutionary world-class platform supercharges your workflow!

- [Click here](/docs/quickstart): Our cutting-edge guide.
- [Read more](/api/authentication): Best-in-class security.`}</pre>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                            <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                AFTER: 100/100 Auto-Fixed llmstxt.org v2 Output
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`# AcmeCloud Edge Runtime & SDK

> Serverless WebAssembly compute platform, TypeScript SDK, and REST API reference.

## Core Documentation

- [Quickstart & CLI Installation](https://docs.example.com/docs/quickstart): Install acme-cli and deploy edge functions.

## API & SDK Reference

- [REST API v2 Authentication](https://docs.example.com/api/authentication): Bearer RS256 JWT tokens and HMAC webhooks.`}</pre>
                        </div>
                    </div>
                </div>

                {/* 12-Point Linter Table */}
                <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">#</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Rule Code</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Severity</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Scope</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">What It Checks &amp; How 1-Click Auto-Fix Resolves It</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {[
                                ['1', 'MISSING_OR_MULTIPLE_H1', 'CRITICAL', 'llms.txt', 'Flags missing # H1 project title on Line 1; fills a clean default heading.'],
                                ['2', 'MISSING_OR_LONG_BLOCKQUOTE', 'HIGH / MEDIUM', 'llms.txt', 'Flags missing or >360-character > blockquote summaries; trims to a concise abstract.'],
                                ['3', 'EMPTY_SECTIONS_OR_LINKS', 'CRITICAL', 'llms.txt', 'Flags workspaces with zero active curated Markdown links.'],
                                ['4', 'RELATIVE_URL_IN_LLMS_TXT', 'HIGH', 'llms.txt', 'Flags relative paths (/docs/api) and malformed URLs; resolves relative links against your canonical Site URL.'],
                                ['5', 'DUPLICATE_LINK_URL', 'MEDIUM', 'llms.txt', 'Detects repeated URLs wasting context tokens; deduplicates automatically.'],
                                ['6', 'MARKETING_FLUFF_DESCRIPTION', 'MEDIUM', 'llms.txt', 'Detects promotional superlatives ("revolutionary", "world-class", "synergistic"); rewrites clean prose without duplicate words.'],
                                ['7', 'VAGUE_LINK_TITLE', 'MEDIUM', 'llms.txt', 'Flags generic anchors ("Click here", "Read more"); derives descriptive titles from URL slugs.'],
                                ['8', 'MISSING_OPTIONAL_SECTION_FOR_LARGE_INDEX', 'MEDIUM', 'llms.txt', 'Flags indexes with >= 8 links lacking ## Optional; moves secondary links to ## Optional.'],
                                ['9', 'ROBOTS_BLOCKS_AI_SEARCH_CITATIONS', 'CRITICAL', 'cross-file', 'Flags when OAI-SearchBot, Claude-SearchBot, or PerplexityBot are blocked while publishing llms.txt.'],
                                ['10', 'RFC9309_SPECIFIC_GROUP_INHERITANCE_LEAK', 'CRITICAL', 'robots.txt', 'Detects allowed AI bot groups omitting global Disallow paths; activates RFC 9309 Inheritance Guard.'],
                                ['11', 'ROBOTS_BLOCKS_LLMS_TXT_PATH', 'CRITICAL', 'cross-file', 'Detects Disallow rules blocking /llms.txt; inserts explicit Allow directives.'],
                                ['12', 'DEPRECATED_BOT_USER_AGENT', 'MEDIUM', 'robots.txt', 'Flags retired user-agent tokens (anthropic-ai, Claude-Web, FacebookBot) and purges them in 1 click.'],
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
                SECTION 5: 45-BOT AI CRAWLER MATRIX & RFC 9309 ROBOTS.TXT
                ============================================================================ */}
            <section
                aria-labelledby="llms-txt-bot-taxonomy"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Cpu className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <h2
                            id="llms-txt-bot-taxonomy"
                            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                        >
                            45-Bot AI Crawler Matrix &amp; RFC 9309 <code>robots.txt</code> (Allow Search vs. Block Training)
                        </h2>
                    </div>
                    <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Tab 2 acts as both an <strong>AI <code>robots.txt</code> generator</strong> and an existing{' '}
                        <strong><code>robots.txt</code> validator</strong> (auditing retired tokens and RFC 9309 inheritance
                        leaks, though without a live URL-path match simulator). When writing{' '}
                        <strong>block AI crawlers <code>robots.txt</code></strong> rules, separating search-citation bots and
                        live fetchers (17 total) from model-training crawlers, opt-out tokens, and bulk scrapers (28 total)
                        preserves AI search referrals while signaling training opt-outs across all 45 user-agents:
                    </p>
                </div>

                <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[720px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Taxonomic Role</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">User-Agents in Matrix</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Primary Behavior</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Typical GEO Policy</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">
                                    1. AI Search &amp; Web Search Bots (11)
                                </th>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                                    OAI-SearchBot, Claude-SearchBot, PerplexityBot, DuckAssistBot, Amzn-SearchBot, YouBot, PhindBot, Google-CloudVertexBot, Googlebot, bingbot, Applebot
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Index pages for real-time search answers, source citations, and standard web search.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    ALLOW (Keep 3 web search bots even in Lockdown)
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">
                                    2. User-Triggered Live Fetchers (6)
                                </th>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                                    ChatGPT-User, Claude-User, Perplexity-User, MistralAI-User, Meta-ExternalFetcher, Google-Read-Aloud
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Fetch a specific page or <code>/llms.txt</code> on demand when a user shares your link in an AI chat.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    ALLOW (Enables on-demand doc lookups)
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400">
                                    3. Usage Opt-Out Control Tokens (2)
                                </th>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                                    Google-Extended, Applebot-Extended
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Control whether pages crawled by Googlebot/Applebot may train Gemini or Apple Intelligence models.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 font-bold">
                                    BLOCK to opt out of training (Zero search impact)
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">
                                    4. Foundation Model Training Crawlers (12)
                                </th>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                                    GPTBot, ClaudeBot, Meta-ExternalAgent, Amazonbot, Cohere-ai, cohere-training-data-crawler, DeepSeekBot, GrokBot, xAI-Bot, PanguBot, AI2Bot, Ai2Bot-Dolma
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Collect web text for foundation language model pre-training corpora.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 font-bold">
                                    BLOCK (Unless open-source SDK docs)
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400">
                                    5. Bulk Dataset Scrapers &amp; Brokers (14)
                                </th>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                                    CCBot, Bytespider, Diffbot, ImagesiftBot, omgili, omgilibot, PetalBot, TimpiBot, VelenPublicWebCrawler, Kangaroo Bot, Scrapy, img2dataset, FriendlyCrawler, ICC-Crawler
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Archive or resell large web datasets without generating direct search referral traffic.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 font-bold">
                                    BLOCK in robots.txt &amp; Edge WAF
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* RFC 9309 Before vs After */}
                <div className="space-y-3 pt-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                        <Terminal className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Publisher AI Policy: Preventing RFC 9309 Specific-Group Override Leaks</span>
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
                SECTION 6: 10 DEPLOYMENT EXPORTS (NEXT.JS, CLOUDFLARE, AI.TXT, TDMREP)
                ============================================================================ */}
            <section
                aria-labelledby="llms-txt-export-deliverables"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <h2
                            id="llms-txt-export-deliverables"
                            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                        >
                            10 Deployment Exports: Next.js <code>route.ts</code>/<code>robots.ts</code>, Cloudflare/Nginx, <code>ai.txt</code> &amp; W3C <code>tdmrep.json</code>
                        </h2>
                    </div>
                    <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Tab 5 compiles your workspace into 10 ready-to-deploy developer and governance outputs—including a free{' '}
                        <strong><code>tdmrep.json</code> generator</strong> for W3C TDMRep signals and CWE-1236 formula-safe
                        spreadsheets:
                    </p>
                </div>

                <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[680px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">#</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Export File</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Deployment Path / Target</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Format &amp; Purpose</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {[
                                ['1', 'llms.txt', '/llms.txt', 'llmstxt.org v2 curated Markdown index (# H1, > blockquote, ## H2 lists, ## Optional)'],
                                ['2', 'llms-full.txt', '/llms-full.txt', 'Full-text concatenated Markdown documentation bundle compiled from Tab 1 & Tab 4'],
                                ['3', 'llms-ctx.txt', '/llms-ctx.txt', 'XML-tagged (<project><documents><document>) context file for direct LLM prompts'],
                                ['4', 'robots.txt', '/robots.txt', 'RFC 9309 crawler rules across 45 AI & web search bots + IETF Content-Usage'],
                                ['5', 'ai.txt', '/ai.txt', 'Per-extension AI training and inference policy declarations'],
                                ['6', 'tdmrep.json', '/.well-known/tdmrep.json', 'W3C TDM Reservation Protocol JSON (technical rights-reservation signal only; not legal advice)'],
                                ['7', 'Next.js Handlers', 'app/llms.txt/route.ts & app/robots.ts', 'Next.js App Router TypeScript route handler & MetadataRoute.Robots config'],
                                ['8', 'Edge & Server Config', 'Cloudflare WAF / _headers / nginx.conf', 'WAF user-agent match expression + X-Robots-Tag: noai, noimageai & Content-Usage headers'],
                                ['9', 'Governance Matrix', 'geo_ai_governance_matrix.xlsx / .csv', 'OpenXML Excel workbook & RFC 4180 CSV with CWE-1236 formula-injection guards'],
                                ['10', 'SHA-256 Audit Cert', 'geo-sha256-compliance-certificate.json', 'Cryptographic SHA-256 digest of generated files and current policy snapshot'],
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

                <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl px-4 py-2.5 leading-relaxed">
                    <strong>EU DSM Art. 4 / W3C TDMRep Disclaimer:</strong> The exported <code>/.well-known/tdmrep.json</code>{' '}
                    file and IETF <code>Content-Usage</code> headers emit technical machine-readable opt-out signals only. They
                    do not constitute legal advice or guarantee legal compliance under EU Directive 2019/790.
                </p>
            </section>

            {/* ============================================================================
                SECTION 7: COMPETITOR COMPARISON MATRIX (HONEST, DIRECTLY OBSERVED)
                ============================================================================ */}
            <section
                aria-labelledby="llms-txt-competitor-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="llms-txt-competitor-matrix"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    How KivaroTools Compares to Top <code>llms.txt</code> Generators, Validators &amp; AI <code>robots.txt</code> Tools
                </h2>
                <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Different workflows call for different tools. Cloud-crawling generators fetch public URLs automatically,
                    while KivaroTools focuses on browser-local staging/private docs, free <code>llms-full.txt</code>{' '}
                    compilation, pre-publish auto-fix linting, and unified 45-bot governance:
                </p>
                <div className="w-full mt-5 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[860px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Capability</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-indigo-600 dark:text-indigo-400">
                                    KivaroTools Studio
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    llmstxtgenerate.com
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Writesonic Generator
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Hostinger Validator
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    SitemapToLLMs / LLMrefs
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    AgentReady.md / Nuxt SEO
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Input Mode &amp; Remote Crawling
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Local paste/upload (up to 5,000 URLs; works on localhost &amp; private staging; no remote HTTP crawler)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400">
                                    Auto-crawls public Website / Sitemap URL
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Auto-crawls nested sitemaps (capped at 3 files/day &amp; 150 pages free)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Live public URL check only (CORS proxy; no paste mode)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Auto-crawls remote sitemaps/domains (SitemapToLLMs expires in 24h free; LLMrefs is SaaS lead-gen)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Split across separate pages / Nuxt SEO focuses on robots.txt
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Free <code>llms-full.txt</code> &amp; <code>llms-ctx.txt</code>
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    100% Free (HTML-to-Markdown compiler included)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-amber-600">
                                    Paid ($2.99 / $1.49 promo for llms-full.txt)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Not included</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Validator only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Not included</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Not included</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    <code>llms.txt</code> Validator &amp; 1-Click Auto-Fix
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    12-Point Linter (0–100) + 1-Click Auto-Fix
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">No auto-fix linter</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">0–100 validator (no 1-click auto-fix)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Basic pass/fail check only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">No validator / auto-fix</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">No 1-click auto-fix</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    AI Crawler <code>robots.txt</code> &amp; RFC 9309 Guard
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    45 Bots (5 Roles) + RFC 9309 Inheritance Guard
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">AgentReady: 21 bots; Nuxt SEO: robots.txt + URL rule tester</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    BPE Token Budget &amp; 10 Developer Exports
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    4 LLM Context Budgets + Next.js, Cloudflare, <code>tdmrep.json</code>, <code>.xlsx</code>
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Plain .txt + CMS guides</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Plain .txt only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Plain .txt only (no token budget)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Content-Signal / robots.txt only</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
                SECTION 8: HONEST ADOPTION REALITY & 6 COMMON MISTAKES
                ============================================================================ */}
            <section
                aria-labelledby="llms-txt-honest-reality"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
            >
                <div>
                    <h2
                        id="llms-txt-honest-reality"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        <code>llms.txt</code> vs. <code>robots.txt</code> vs. <code>sitemap.xml</code>: Honest Adoption Reality &amp; Common Mistakes
                    </h2>
                    <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Keep expectations grounded: <code>llms.txt</code> is an emerging Markdown convention—not a Google ranking
                        factor and not a guarantee of ChatGPT or Perplexity citations. Its clearest practical value today is
                        giving AI coding assistants and documentation agents a clean, low-token index, while{' '}
                        <code>robots.txt</code> and edge WAF rules manage crawler access (remember that <code>robots.txt</code>{' '}
                        is voluntary; server logs are the only proof of enforcement). Avoid these six common mistakes:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Putting Disallow Rules Inside llms.txt</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Issue:</strong> <code>llms.txt</code> is a curated reading guide, not an access-control file.
                            <br />
                            <strong>Fix:</strong> Put crawler permissions in <code>/robots.txt</code> and CDN WAF rules while
                            keeping <code>/llms.txt</code> pure Markdown.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>CDN Bot Fight Mode Returning 403</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Issue:</strong> Even when <code>robots.txt</code> allows <code>OAI-SearchBot</code> or{' '}
                            <code>PerplexityBot</code>, aggressive WAF rules can block <code>/llms.txt</code>.
                            <br />
                            <strong>Fix:</strong> Verify in server logs that allowed bots receive HTTP <code>200 OK</code> on{' '}
                            <code>/llms.txt</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>RFC 9309 Specific-Group Override Leaks</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Issue:</strong> Adding a named <code>User-agent: OAI-SearchBot</code> block overrides{' '}
                            <code>User-agent: *</code> <code>Disallow</code> lines.
                            <br />
                            <strong>Fix:</strong> Keep <strong>Enforce RFC 9309 Disallow Inheritance</strong> checked in Tab 2.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Confusing Google-Extended with Googlebot</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Issue:</strong> Blocking <code>Googlebot</code> removes your site from Google Search.
                            <br />
                            <strong>Fix:</strong> Keep <code>Googlebot</code> and <code>Applebot</code> allowed while blocking{' '}
                            <code>Google-Extended</code> and <code>Applebot-Extended</code> to opt out of training.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Dumping Thousands of Unfiltered URLs</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Issue:</strong> Publishing 5,000 raw sitemap URLs in <code>llms.txt</code> bloats token
                            counts and buries primary docs.
                            <br />
                            <strong>Fix:</strong> Curate your top 15–50 canonical docs and move secondary pages into{' '}
                            <code>## Optional</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Missing UTF-8 Headers on /llms.txt</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Issue:</strong> Serving <code>/llms.txt</code> without UTF-8 headers or CORS can break
                            browser-based AI tools and IDE extensions.
                            <br />
                            <strong>Fix:</strong> Use Tab 5’s Next.js <code>route.ts</code> or Cloudflare/Nginx headers to serve{' '}
                            <code>text/plain; charset=utf-8</code>.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
                SECTION 9: FREQUENTLY ASKED QUESTIONS (12 GROUNDED FAQS)
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
                SECTION 10: VERIFIED RELATED SEO & DEVELOPER TOOLS (ZERO OUTER BULLET DOTS)
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
                        Related KivaroTools SEO &amp; Developer Utilities
                    </h2>
                </div>
                <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed break-words">
                    Continue your technical SEO, metadata auditing, and web engineering workflow with these browser-based tools:
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/seo/meta-generator"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0 no-underline"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            Meta Tags &amp; Open Graph Generator →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Build SERP titles, meta descriptions, social cards, and Next.js metadata objects with length checks.
                        </p>
                    </Link>

                    <Link
                        href="/seo/text-analyzer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0 no-underline"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            Word Counter &amp; Text Analyzer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Check reading time, readability scores, and keyword density before publishing documentation pages.
                        </p>
                    </Link>

                    <Link
                        href="/seo/text-case-converter"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0 no-underline"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            Text Case Converter →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Standardize documentation headings, URL slugs, and code identifiers across 15 naming formats.
                        </p>
                    </Link>

                    <Link
                        href="/developer/json-formatter"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0 no-underline"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            JSON Formatter &amp; Validator →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Validate and format W3C tdmrep.json files, Schema.org JSON-LD graphs, and OpenAPI payloads.
                        </p>
                    </Link>

                    <Link
                        href="/developer/regex-tester"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0 no-underline"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            Regex Tester &amp; Debugger →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Test Cloudflare WAF user-agent expressions and robots.txt path wildcards locally.
                        </p>
                    </Link>

                    <Link
                        href="/seo/qr-generator"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0 no-underline"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            Static QR Code Generator →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Generate permanent vector SVG, PDF, and PNG QR codes for documentation links and product packaging.
                        </p>
                    </Link>
                </div>
            </section>
        </article>
    );
}