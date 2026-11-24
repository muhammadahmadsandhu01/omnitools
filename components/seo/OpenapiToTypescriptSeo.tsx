import React from 'react';
import Link from 'next/link';
import {
    Code2,
    Layers,
    AlertTriangle,
    Terminal,
    HelpCircle,
    Sparkles,
    FileSpreadsheet,
    Cpu,
    GitBranch,
    Wrench,
} from 'lucide-react';

export interface FaqItem {
    question: string;
    answer: string;
}

export const OPENAPI_TO_TYPESCRIPT_FAQS: FaqItem[] = [
    {
        question: 'How do I generate TypeScript interfaces and Zod schemas from OpenAPI or Swagger online?',
        answer:
            'Paste or import any OpenAPI 3.1, OpenAPI 3.0, or Swagger 2.0 YAML/JSON specification into this openapi to typescript online studio. Tab 1 emits strict TypeScript interfaces (api-types.ts) with ApiPaths operation types, and Tab 2 compiles topologically sorted openapi to zod runtime schemas (api-schemas.zod.ts) with z.infer and z.lazy() cycle guards—all locally in your browser without signup.',
    },
    {
        question: 'Does this converter support legacy Swagger 2.0 as well as OpenAPI 3.0 and 3.1?',
        answer:
            'Yes. Unlike browser converters that reject Swagger 2.0, KivaroTools parses Swagger 2.0 YAML and JSON directly as a swagger to typescript online tool and acts as a swagger 2.0 to openapi 3.1 converter via 1-Click Auto-Fix—migrating definitions, in: body parameters, and response schemas into normalized OpenAPI 3.1.0 JSON.',
    },
    {
        question: 'Why do generated Zod schemas fail with ReferenceError when $ref dependencies are out of order?',
        answer:
            'TypeScript interfaces are erased at compile time and allow forward references, whereas Zod schemas (const CustomerSchema = z.object(...)) are runtime JavaScript constants subject to the Temporal Dead Zone (TDZ). Our compiler builds a directed dependency graph across all $ref pointers and orders Zod schemas topologically so leaf dependencies initialize before parent schemas.',
    },
    {
        question: 'How are circular $ref schemas (like CategoryNode) handled in TypeScript and Zod?',
        answer:
            'Depth-first cycle detection identifies direct and mutually recursive $ref loops. In TypeScript, self-referencing interfaces emit natively; in Zod, the compiler annotates the recursive schema with z.ZodType<any> (avoiding TS7022 inference errors) and wraps recursive references in z.lazy(() => CategoryNodeSchema). The seeded mock generator also caps recursion depth so fixtures terminate cleanly.',
    },
    {
        question: 'Can I generate MSW v2 handlers, TanStack Query v5 hooks, and seeded Mock JSON from OpenAPI?',
        answer:
            'Yes. Alongside TypeScript and Zod, Tab 3 emits MSW v2 request handlers (http.get/post + HttpResponse.json()) for openapi to msw testing, Tab 4 acts as a typed openapi client generator emitting Native Fetch + @tanstack/react-query v5 hooks (useQuery / useMutation) for openapi to tanstack query and openapi to react query workflows, and Tab 5 generates deterministic Mulberry32-seeded mock JSON (1–5 array items).',
    },
    {
        question: 'Should I use an online browser generator or a CLI like openapi-typescript or Orval?',
        answer:
            'Use a CLI like openapi-typescript, Orval, or Hey API inside CI/CD when you want automated git-committed codegen on every backend build. Use this browser studio when you want zero-setup prototyping, instant visual endpoint exploration, 10-point contract linting, 1-click Swagger 2.0 → 3.1 migration, or a quick 3-sheet Excel QA inventory without installing Node packages.',
    },
    {
        question: 'What is the difference between OpenAPI 3.0 nullable: true and OpenAPI 3.1 type arrays?',
        answer:
            'OpenAPI 3.0 uses nullable: true alongside a single type string, whereas OpenAPI 3.1 aligns with JSON Schema Draft 2020-12 and uses type arrays such as type: ["string", "null"] or anyOf branches containing { type: "null" }. Our normalizer converts both into T | null in TypeScript and .nullable() (or .nullish() when enabled) in Zod.',
    },
    {
        question: 'How are oneOf, anyOf, and allOf mapped to TypeScript and Zod?',
        answer:
            'In TypeScript, oneOf and anyOf compile to union types (A | B), while allOf compiles to intersection types (A & B). In Zod, when a union declares discriminator.propertyName with two or more non-lazy object branches, the compiler emits z.discriminatedUnion("type", [...]); otherwise it emits z.union([...]).',
    },
    {
        question: 'Can I generate an Axios client, Python/Go SDK, or convert standalone JSON Schema here?',
        answer:
            'No. Tab 4 generates Native Fetch + TanStack Query v5 TypeScript hooks only (no Axios, SWR, Angular, Vue, or Python/Go/Java SDKs)—though you can import api-types.ts and api-schemas.zod.ts into any Axios client. The parser also expects an OpenAPI 3.1/3.0 or Swagger 2.0 document wrapper (components.schemas / definitions), not raw JSON or standalone JSON Schema.',
    },
    {
        question: 'How do I validate or lint an OpenAPI spec before generating code?',
        answer:
            'Open the bottom 10-Point Linter tab to inspect your 0–100 Health Score across 10 rules (Swagger 2.0 legacy constructs, missing operationIds, dangling $ref pointers, circular refs, undeclared path params, missing error responses, discriminator conflicts, untyped objects, HTTP servers, and missing JSDoc). Malformed JSON or unclosed YAML flow brackets trigger an explicit syntax error banner.',
    },
    {
        question: 'What does the 3-sheet Excel (.xlsx) and CSV contract inventory export include?',
        answer:
            'Clicking .XLSX in the Output header builds a 3-sheet OpenXML workbook locally in your browser: API_Endpoints, Component_Schemas, and Spec_Lint_Audit—sanitized against CWE-1236 spreadsheet formula injection. Clicking .CSV downloads the flat endpoints inventory.',
    },
    {
        question: 'Are my proprietary OpenAPI YAML or JSON files uploaded to a remote server?',
        answer:
            'No. Your OpenAPI YAML and JSON specifications are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources.',
    },
];

export default function OpenapiToTypescriptSeo() {
    const jsonLdFaqPage = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: OPENAPI_TO_TYPESCRIPT_FAQS.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
            },
        })),
    };

    const jsonLdHowTo = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to Convert OpenAPI or Swagger to TypeScript, Zod Schemas, and MSW v2 Mocks Online',
        description:
            'Step-by-step workflow to compile OpenAPI 3.1, 3.0, or Swagger 2.0 YAML/JSON specs into TypeScript interfaces, topologically sorted Zod validators, MSW v2 handlers, TanStack Query v5 hooks, and Excel audit inventories in your browser.',
        step: [
            {
                '@type': 'HowToStep',
                position: 1,
                name: 'Load a Built-In Sample or Import Your OpenAPI YAML / JSON Spec',
                text: 'Click one of the 3 sample buttons (AcmeCloud OpenAPI 3.1 YAML, LuxeCommerce Circular OpenAPI 3.0 JSON, or Legacy Orders Swagger 2.0 YAML) or click Import in the Input Window header.',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Configure TypeScript, Enum & Zod Options or Run 1-Click Auto-Fix',
                text: 'Choose export interface or export type =, Literal Union vs. as const vs. TS enum, and Zod strictness (.strict(), strip, .passthrough()), or click Auto-Fix to upgrade Swagger 2.0 to OpenAPI 3.1.0.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Copy or Download All 6 Real-Time Code Outputs + Excel/CSV Inventories',
                text: 'Switch across the 6 output tabs (TypeScript, Zod, MSW v2, Fetch + Query, Mock JSON, OpenAPI 3.1) and click Copy, Download, .XLSX, or .CSV in the Output header.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Audit Endpoints, Topological $ref Order & 10-Point Linter Findings',
                text: 'Use the bottom Endpoint & Schema Explorer, 10-Point Linter, and 5-Point Invariant Verification tabs to verify your API contract before shipping.',
            },
        ],
    };

    return (
        <article className="not-prose mt-16 space-y-12 w-full min-w-0 max-w-full overflow-x-hidden text-slate-700 dark:text-slate-300">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaqPage) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }}
            />

            {/* ============================================================================
                SECTION 1: EXECUTIVE OVERVIEW & PRIVACY DISCLOSURE
                ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-overview"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2
                        id="openapi-ts-overview"
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
                    >
                        OpenAPI to TypeScript Online &amp; OpenAPI to Zod Generator (Swagger 2.0 – 3.1)
                    </h2>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shrink-0">
                        <Sparkles className="h-3.5 w-3.5" />
                        OpenAPI 3.1 · 3.0 · Swagger 2.0
                    </span>
                </div>

                <p className="mt-3 w-full text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Use this browser-based <strong>openapi to typescript online</strong> studio and{' '}
                    <strong>openapi to typescript converter</strong> to compile <strong>OpenAPI 3.1</strong>,{' '}
                    <strong>OpenAPI 3.0</strong>, and <strong>Swagger 2.0</strong> YAML or JSON specs into strict{' '}
                    <strong>TypeScript 5.x interfaces</strong>, topologically sorted <strong>openapi to zod</strong>{' '}
                    runtime schemas (with <code>z.lazy()</code> cycle guards), <strong>MSW v2 mock handlers</strong>,
                    and <strong>typed Fetch + TanStack Query v5 hooks</strong>—with zero signup and no CLI setup.
                </p>

                <blockquote className="p-4 my-6 bg-indigo-50/80 border-l-4 border-indigo-600 rounded-r-xl dark:bg-slate-800/80 not-italic">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
                        <strong>Local Browser Processing &amp; Privacy Disclosure:</strong> Your OpenAPI YAML and JSON specifications are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources.
                    </p>
                </blockquote>

                <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    Static TypeScript interfaces disappear at runtime, leaving frontend apps exposed to silent API
                    contract drift. Most browser utilities only convert flat JSON snippets or emit TypeScript types
                    without runtime validation—while CLI tools require local Node configs and choke on legacy Swagger
                    2.0 files or dangling <code>$ref</code> pointers. KivaroTools unifies{' '}
                    <strong>openapi to typescript</strong>, <strong>openapi to zod online</strong>,{' '}
                    <strong>swagger to typescript</strong>, and an <strong>openapi mock generator</strong> in one
                    real-time 50/50 split workspace.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                            <GitBranch className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            Topological Zod &amp; Circular <code>z.lazy()</code> Guard
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Orders all <code>#/components/schemas/*</code> pointers topologically to prevent JavaScript
                            TDZ <code>ReferenceError</code>s and wraps recursive cycles in <code>z.lazy()</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                            <Code2 className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            6 Code Tabs + 2 Spreadsheet Audits (8 Total)
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Outputs TypeScript <code>.ts</code>, Zod schemas, MSW v2 <code>http.*</code> handlers,
                            Fetch + TanStack Query v5 hooks, seeded Mock JSON, OpenAPI 3.1 JSON, plus <code>.xlsx</code>{' '}
                            and <code>.csv</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            <Wrench className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            Swagger 2.0 → 3.1 Auto-Fix &amp; 10-Point Linter
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Upgrades legacy Swagger 2.0 <code>definitions</code> and <code>in: body</code> params to
                            OpenAPI 3.1.0, scaffolds dangling <code>$ref</code> targets, and scores contract health
                            0–100.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
                SECTION 2: HOW TO USE IN 4 STEPS (CLEAN CARDS, ZERO OUTER MARKERS)
                ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-how-to"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5"
            >
                <div>
                    <h2
                        id="openapi-ts-how-to"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        How to Convert OpenAPI or Swagger to TypeScript, Zod &amp; MSW v2 in 4 Steps
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Compile, lint, and export production-ready frontend API contracts in under a minute:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            Step 1: Pick a Sample or Import Local YAML / JSON
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Load one of the three top samples (<strong>AcmeCloud Billing 3.1</strong>,{' '}
                            <strong>LuxeCommerce Tree 3.0</strong>, or <strong>Legacy Orders Swagger 2.0</strong>), or
                            paste/import your own <code>.yaml</code>, <code>.yml</code>, or <code>.json</code> contract.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            Step 2: Set TS/Zod Options or Click Auto-Fix
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Select <code>export interface</code> or <code>export type =</code>, Enum style, and Zod
                            strictness—or open <strong>Advanced Options</strong> for <code>readonly</code>,{' '}
                            <code>.nullish()</code>, <code>z.coerce</code>, and PRNG Mock Seed. Click{' '}
                            <strong>Auto-Fix</strong> to upgrade Swagger 2.0 to OpenAPI 3.1.0 in one click.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            Step 3: Copy or Download Any of the 6 Real-Time Tabs
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Switch across <code>TypeScript</code>, <code>Zod</code>, <code>MSW v2</code>,{' '}
                            <code>Fetch + Query</code>, <code>Mock JSON</code>, and <code>OpenAPI 3.1</code> in the
                            Right Window, then click <strong>Copy</strong>, download the active file, or export{' '}
                            <strong>.XLSX</strong> / <strong>.CSV</strong>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            Step 4: Audit Endpoints, Topological Order &amp; Linter Score
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Use the bottom <strong>Endpoint &amp; Schema Explorer</strong>,{' '}
                            <strong>10-Point Linter</strong>, and <strong>5-Point Invariant Verification</strong> tabs
                            to verify every path, circular <code>z.lazy()</code> guard, and contract rule.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
                SECTION 3: 6-STAGE COMPILER ARCHITECTURE (FIXED UNICODE ARROWS)
                ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-working-structure"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2.5 mb-2">
                    <Cpu className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="openapi-ts-working-structure"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Under the Hood: 6-Stage OpenAPI Compiler, Topological Sorter &amp; Linter Pipeline
                    </h2>
                </div>
                <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    <code>lib/openapiToTypescriptEngine.ts</code> runs a deterministic 6-stage pipeline in browser
                    memory (note: expects an OpenAPI 3.1/3.0 or Swagger 2.0 wrapper—not standalone JSON Schema or raw
                    JSON):
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            n: '1',
                            color: 'bg-indigo-600',
                            title: 'Dual YAML 1.2 & JSON Parser',
                            body: 'Parses JSON and indentation-based YAML 1.2 (block scalars | and >, flow arrays [string, null], flow objects, comments) with explicit syntax error checks for malformed JSON and unclosed YAML flow brackets.',
                        },
                        {
                            n: '2',
                            color: 'bg-blue-600',
                            title: 'Swagger 2.0 / 3.0 / 3.1 Normalizer',
                            body: 'Unifies Swagger 2.0 definitions & in: body params, OpenAPI 3.0 nullable: true, and OpenAPI 3.1 type arrays (["string", "null"]), const literals, and $defs into one AST.',
                        },
                        {
                            n: '3',
                            color: 'bg-purple-600',
                            title: 'DFS Topological Sorter & Cycle Detector',
                            body: 'Walks every $ref dependency so leaf Zod schemas emit before parent schemas, flagging direct or mutual cycles in circularSchemas for automatic z.lazy() wrapping.',
                        },
                        {
                            n: '4',
                            color: 'bg-emerald-600',
                            title: 'TypeScript & Zod Constraint Emitters',
                            body: 'Compiles export interface / export type, 3 enum styles, ApiPaths operation types, and Zod validators (.min, .max, .regex, .uuid, .email, z.discriminatedUnion, z.coerce).',
                        },
                        {
                            n: '5',
                            color: 'bg-amber-600',
                            title: 'MSW v2 Mocks & Fetch + TanStack SDK',
                            body: 'Generates Mulberry32-seeded mock JSON (1–5 items), MSW v2 http.* + HttpResponse.json() handlers, and Native Fetch + @tanstack/react-query v5 hooks (useQuery / useMutation).',
                        },
                        {
                            n: '6',
                            color: 'bg-rose-600',
                            title: '10-Rule Linter, Auto-Fix & Invariants',
                            body: 'Runs 10 contract rules (OAPI_001–OAPI_010), performs 1-click Swagger 2.0 → OpenAPI 3.1.0 upgrades, and verifies 5 AST invariants before emitting output.',
                        },
                    ].map((stage) => (
                        <div
                            key={stage.n}
                            className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0"
                        >
                            <span
                                className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${stage.color} text-xs font-bold text-white`}
                            >
                                {stage.n}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{stage.title}</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{stage.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ============================================================================
                SECTION 4: REAL-WORLD WORKED EXAMPLES (ZERO RAW LATEX BUGS)
                ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-real-examples"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-8"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Terminal className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <h2
                            id="openapi-ts-real-examples"
                            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                        >
                            Worked Examples: OpenAPI to Zod Discriminated Unions, Circular <code>z.lazy()</code> &amp; MSW v2
                        </h2>
                    </div>
                    <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Every code block below is compiled directly from the studio’s three built-in samples:
                    </p>
                </div>

                {/* Example 1 */}
                <div className="space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-xs font-mono">
                            Example 1
                        </span>
                        <span>
                            OpenAPI 3.1 Type Arrays &amp; <code>oneOf</code> Discriminator → TypeScript &amp; <code>z.discriminatedUnion()</code>
                        </span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                            <div className="text-indigo-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                INPUT: OpenAPI 3.1.0 YAML (Sample #1 — AcmeCloud Billing)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`CardPaymentMethod:
  type: object
  required: [type, last4, expYear]
  properties:
    type: { const: "card" }
    last4: { type: string, minLength: 4, maxLength: 4 }
    expYear: { type: integer, minimum: 2026, maximum: 2040 }
PaymentMethod:
  discriminator: { propertyName: type }
  oneOf:
    - $ref: "#/components/schemas/CardPaymentMethod"
    - $ref: "#/components/schemas/BankTransferPaymentMethod"
Customer:
  properties:
    id: { type: string, format: uuid }
    companyName: { type: ["string", "null"], minLength: 2, maxLength: 120 }`}</pre>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                            <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                OUTPUT: Topologically Sorted Zod + z.infer (Tab 2)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`export const CardPaymentMethodSchema = z.object({
  type: z.literal("card"),
  last4: z.string().min(4).max(4),
  expYear: z.number().int().min(2026).max(2040),
}).strict();

export const PaymentMethodSchema = z.discriminatedUnion("type", [
  CardPaymentMethodSchema,
  BankTransferPaymentMethodSchema,
]);

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  companyName: z.string().min(2).max(120).nullable().optional(),
}).strict();
export type Customer = z.infer<typeof CustomerSchema>;`}</pre>
                        </div>
                    </div>
                </div>

                {/* Example 2 */}
                <div className="space-y-3 pt-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-mono">
                            Example 2
                        </span>
                        <span>
                            Circular Schema (<code>CategoryNode</code>) → Naive TDZ Crash vs. Automatic <code>z.lazy()</code> Guard
                        </span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                            <div className="text-rose-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                BEFORE: Naive Generator Output (TS7022 &amp; Runtime ReferenceError)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`// Throws ReferenceError: Cannot access 'CategoryNodeSchema' before initialization
export const CategoryNodeSchema = z.object({
  id: z.string().uuid(),
  parentCategory: CategoryNodeSchema.nullable().optional(),
  subcategories: z.array(CategoryNodeSchema),
});`}</pre>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                            <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                AFTER: KivaroTools DFS Cycle Detector + z.lazy() Guard (Sample #2)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`export const CategoryNodeSchema: z.ZodType<any> = z.object({
  id: z.string().uuid(),
  parentCategory: z.lazy(() => CategoryNodeSchema).nullable().optional(),
  subcategories: z.array(z.lazy(() => CategoryNodeSchema)),
}).strict();
export type CategoryNode = z.infer<typeof CategoryNodeSchema>;`}</pre>
                        </div>
                    </div>
                </div>

                {/* Example 3 */}
                <div className="space-y-3 pt-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-xs font-mono">
                            Example 3
                        </span>
                        <span>
                            MSW v2 Handler (Tab 3) &amp; Typed Fetch + TanStack Query v5 Hook (Tab 4)
                        </span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                            <div className="text-amber-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                TAB 3: msw-handlers.ts (MSW v2 http.* + HttpResponse.json)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`import { http, HttpResponse } from 'msw';

export function mockGetCustomerByIdHandler(overrideResponse?: unknown) {
  return http.get(\`\${BASE_URL}/customers/:customerId\`, () => {
    return HttpResponse.json(overrideResponse ?? {
      id: "550e8400-e29b-41d4-a716-446655440000",
      email: "alex.rivera@acmecloud.io",
      tier: "starter"
    }, { status: 200 });
  });
}`}</pre>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                            <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                TAB 4: api-client.ts (Fetch SDK + TanStack Query v5 Hook)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`export function useGetCustomerByIdQuery(
  params: GetCustomerByIdPathParams,
  query?: GetCustomerByIdQueryParams,
  options?: Omit<UseQueryOptions<GetCustomerByIdResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<GetCustomerByIdResponse>({
    queryKey: ["getCustomerById", params, query],
    queryFn: () => defaultApiClient.getCustomerById(params, query),
    ...options,
  });
}`}</pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================================
                SECTION 5: COMPETITOR COMPARISON MATRIX (REAL INSPECTED RIVALS)
                ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-competitor-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4"
            >
                <div>
                    <h2
                        id="openapi-ts-competitor-matrix"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Online Browser Studio vs. CLI &amp; Web Converters (Honest Comparison)
                    </h2>
                    <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        CLIs like <code>openapi-typescript</code> and <code>Orval</code> are built for automated CI/CD
                        pipelines, while browser converters let you inspect, lint, and generate code instantly. Here is
                        how KivaroTools compares to directly inspected web and CLI tools:
                    </p>
                </div>

                <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[840px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Capability</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-indigo-600 dark:text-indigo-400">
                                    KivaroTools Studio
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">GitLoop</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">DevToolLab</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">TestMu AI</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">GetZenQuery / ToolMono</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">openapi-ts / Orval CLI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    OpenAPI 3.1 / 3.0 &amp; Swagger 2.0 (YAML + JSON)
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    All 3 versions + 1-Click Swagger 2.0 → 3.1 Auto-Fix
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">OpenAPI 3.x (YAML/JSON)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">3.x &amp; Swagger 2.0 (no Auto-Fix)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">3.x only (rejects Swagger 2.0)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">GetZenQuery: JSON 3.x only; ToolMono: mocks only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Full spec + remote URLs (CLI setup)</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Topological Zod + <code>z.lazy()</code> Cycle Guard
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Built-In (DFS sort + z.lazy() + z.coerce)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">TS types only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">TS types only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">TS types only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Orval plugin / CLI config</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    MSW v2 Handlers &amp; Fetch / TanStack Query v5
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    MSW v2 + Native Fetch + TanStack v5 + Mock JSON
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">ToolMono: MSW v2 + Express mocks (no TS/SDK)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Orval supports React Query, Axios &amp; MSW</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    10-Point Linter &amp; 3-Sheet Excel (.xlsx) Audit
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    10 Rules (0–100) + CWE-1236 .xlsx &amp; .csv
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Separate linter (Redocly / Spectral)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
                SECTION 6: 8 DELIVERABLES & 10-POINT LINTER RULES
                ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-deliverables-and-linter"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-8"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <h2
                            id="openapi-ts-deliverables-and-linter"
                            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                        >
                            6 Real-Time Code &amp; Mock Tabs + 2 Spreadsheet Audits (8 Total Deliverables)
                        </h2>
                    </div>
                    <div className="w-full mt-4 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="min-w-[680px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                                <tr>
                                    <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">#</th>
                                    <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Deliverable</th>
                                    <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Target Runtime</th>
                                    <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">What It Generates</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {[
                                    ['1', 'api-types.ts', 'TypeScript 5.x (strict)', 'Interfaces/types, 3 enum styles, *PathParams/*QueryParams/*RequestBody/*Response & ApiPaths.'],
                                    ['2', 'api-schemas.zod.ts', 'Zod v3 / v4', 'Topologically sorted z.object(), z.lazy() circular guards, z.discriminatedUnion(), z.coerce & z.infer.'],
                                    ['3', 'msw-handlers.ts', 'MSW v2 (http.*)', 'http.get/post/put/patch/delete handlers returning HttpResponse.json() with test override args.'],
                                    ['4', 'api-client.ts', 'Fetch + TanStack Query v5', 'Zero-dependency createApiClient() + typed useQuery and useMutation hooks.'],
                                    ['5', 'mock-payloads.json', 'RFC 8259 JSON', 'Mulberry32 PRNG-seeded JSON fixtures keyed by operationId (1–5 array items).'],
                                    ['6', 'openapi-3.1.normalized.json', 'OpenAPI 3.1.0 JSON', 'Normalized OpenAPI 3.1.0 upgraded from YAML, Swagger 2.0, or OpenAPI 3.0.'],
                                    ['7', 'openapi-contract-inventory.xlsx', 'Excel / Sheets (.xlsx)', '3-sheet OpenXML workbook (API_Endpoints, Component_Schemas, Spec_Lint_Audit), CWE-1236 guarded.'],
                                    ['8', 'openapi-endpoints-inventory.csv', 'UTF-8 CSV', 'Flat endpoint inventory spreadsheet for architecture reviews and QA handoffs.'],
                                ].map(([num, file, target, desc]) => (
                                    <tr key={num}>
                                        <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">{num}</td>
                                        <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">{file}</td>
                                        <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">{target}</td>
                                        <td className="p-3 border border-slate-200 dark:border-slate-700">{desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 10-Point OpenAPI Linter & Validator Reference */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        10-Point OpenAPI Linter &amp; Validator Rules (<code>OAPI_001</code> – <code>OAPI_010</code>)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Built into the bottom inspector as an in-browser <strong>openapi linter</strong> and{' '}
                        <strong>openapi validator</strong>, auditing Swagger 2.0 legacy syntax (<code>OAPI_001</code>),
                        missing <code>operationId</code>s (<code>OAPI_002</code>), dangling <code>$ref</code> pointers (
                        <code>OAPI_003</code>), circular <code>$ref</code> cycles (<code>OAPI_004</code>), undeclared
                        path parameters (<code>OAPI_005</code>), missing error responses (<code>OAPI_006</code>),
                        duplicate discriminators (<code>OAPI_007</code>), untyped objects (<code>OAPI_008</code>),
                        cleartext HTTP servers (<code>OAPI_009</code>), and missing JSDoc descriptions (
                        <code>OAPI_010</code>).
                    </p>
                </div>
            </section>

            {/* ============================================================================
                SECTION 7: 3 PRACTICAL WORKFLOWS (REPLACES KEYWORD DUMP) & COMMON PITFALLS
                ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-workflows"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
            >
                <div>
                    <h2
                        id="openapi-ts-workflows"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Practical Engineering Workflows &amp; Common Codegen Pitfalls
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Three everyday workflows where a zero-install browser compiler saves sprint time:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            1. Legacy Swagger 2.0 → OpenAPI 3.1 + TS
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Use 1-Click Auto-Fix as a <strong>swagger to openapi</strong> /{' '}
                            <strong>swagger to openapi 3</strong> upgrader, then copy clean{' '}
                            <strong>swagger to typescript</strong> interfaces without rewriting <code>in: body</code>{' '}
                            blocks by hand.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            2. Runtime Boundary Validation with Zod
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Turn third-party OpenAPI specs into <strong>openapi to zod</strong> schemas with{' '}
                            <code>.strict()</code>, <code>z.coerce</code> query validation, and <code>z.lazy()</code>{' '}
                            tree guards ready for Next.js Route Handlers.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            3. Frontend Mocking &amp; React Query Hooks
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Unblock UI development before the backend deploys by exporting <strong>openapi to msw</strong>{' '}
                            v2 handlers, seeded JSON fixtures, and <strong>openapi to tanstack query</strong> v5 hooks
                            in parallel.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {[
                        {
                            title: 'Alphabetical Zod Ordering Causes Runtime TDZ Crashes',
                            body: 'Emitting AccountSchema before UserSchema throws ReferenceError at module load. Always rely on topological $ref sorting.',
                        },
                        {
                            title: 'Uncoerced URL Query Strings Fail Number/Boolean Checks',
                            body: 'Query params (?limit=25&active=true) arrive as strings. Keep Query z.coerce enabled in Advanced Options so Zod coerces them safely.',
                        },
                        {
                            title: 'Legacy MSW v1 rest.get Syntax Breaks MSW v2 Suites',
                            body: 'MSW v2 replaced rest.get and ctx.json with http.get and HttpResponse.json(). Tab 3 emits MSW v2 syntax natively.',
                        },
                        {
                            title: 'Missing operationId Forces Fragile Function Naming',
                            body: 'Run the 10-Point Linter and 1-Click Auto-Fix to inject deterministic camelCase operationIds before generating SDK hooks.',
                        },
                    ].map((pitfall) => (
                        <div
                            key={pitfall.title}
                            className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-1.5 min-w-0"
                        >
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>{pitfall.title}</span>
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{pitfall.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ============================================================================
                SECTION 8: FREQUENTLY ASKED QUESTIONS (12 INTERACTIVE ACCORDIONS)
                ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-faq"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="openapi-ts-faq"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="space-y-3">
                    {OPENAPI_TO_TYPESCRIPT_FAQS.map((faq, index) => (
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
                SECTION 9: RELATED DEVELOPER & API UTILITIES (ZERO OUTER BULLET DOTS)
                ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-related"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="openapi-ts-related"
                        className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Related Developer &amp; API Engineering Utilities
                    </h2>
                </div>
                <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    Continue your API contract, payload inspection, and developer documentation workflow:
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            href: '/developer/json-formatter',
                            title: 'JSON Formatter, Validator & Tree Viewer →',
                            desc: 'Validate and format OpenAPI 3.1 JSON schemas and mock payloads up to 25 MB.',
                        },
                        {
                            href: '/developer/json-converter',
                            title: 'JSON to CSV, Excel (.xlsx), YAML & XML →',
                            desc: 'Flatten nested API JSON payloads into spreadsheets or YAML locally.',
                        },
                        {
                            href: '/developer/har-analyzer',
                            title: 'HAR File Analyzer & Sanitizer →',
                            desc: 'Inspect HTTP waterfalls, scrub Bearer tokens, and export k6/Playwright scripts.',
                        },
                        {
                            href: '/developer/jwt-debugger',
                            title: 'JWT, PASETO & SAML 2.0 Debugger →',
                            desc: 'Inspect API auth tokens, claims, and signatures locally in your browser.',
                        },
                        {
                            href: '/developer/regex-tester',
                            title: 'Regex Tester & Code Generator →',
                            desc: 'Test OpenAPI pattern constraints and Zod .regex() rules with ReDoS protection.',
                        },
                        {
                            href: '/seo/llms-txt-generator',
                            title: 'llms.txt & AI Crawler robots.txt Studio →',
                            desc: 'Build llmstxt.org v2 documentation indexes for your API developer portal.',
                        },
                    ].map((tool) => (
                        <Link
                            key={tool.href}
                            href={tool.href}
                            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0 no-underline"
                        >
                            <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                                {tool.title}
                            </div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{tool.desc}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </article>
    );
}
