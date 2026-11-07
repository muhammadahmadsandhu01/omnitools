import React from 'react';
import Link from 'next/link';
import {
    Code2,
    ShieldCheck,
    Layers,
    AlertTriangle,
    Terminal,
    HelpCircle,
    Sparkles,
    FileSpreadsheet,
    Cpu,
    Search,
    GitBranch,
    Wrench,
    Braces,
} from 'lucide-react';

export interface FaqItem {
    question: string;
    answer: string;
}

export const OPENAPI_TO_TYPESCRIPT_FAQS: FaqItem[] = [
    {
        question: 'Why do generated Zod schemas fail with ReferenceError when $ref dependencies are out of order?',
        answer:
            'TypeScript interfaces and type aliases are erased at compile time and support forward references anywhere in a file. In contrast, Zod schemas (such as const CustomerSchema = z.object(...)) are runtime JavaScript constants subject to the Temporal Dead Zone (TDZ). If CustomerSchema references SubscriptionTierSchema before SubscriptionTierSchema is initialized, JavaScript throws a ReferenceError at runtime. Our engine builds a directed dependency graph across all $ref pointers and orders schemas topologically so leaf dependencies are declared first.',
    },
    {
        question: 'How does the compiler handle circular or self-referencing OpenAPI schemas (such as CategoryNode)?',
        answer:
            'Our dependency graph analyzer runs depth-first cycle detection across all component schemas. When a self-referencing or mutually recursive cycle is detected (such as CategoryNode referencing CategoryNode in Sample #2), the compiler annotates the root constant with z.ZodType<any> to prevent TypeScript TS7022 circular inference errors and wraps every recursive reference in z.lazy(() => CategoryNodeSchema). The mock generator also tracks visited $ref nodes and caps recursion depth so mock JSON generation terminates cleanly.',
    },
    {
        question: 'What is the difference between OpenAPI 3.0 nullable: true and OpenAPI 3.1 type arrays?',
        answer:
            'OpenAPI 3.0.x represents nullable properties using nullable: true alongside a single type string (for example, type: "string", nullable: true). OpenAPI 3.1.0 aligns with JSON Schema Draft 2020-12 and represents nullability via type arrays such as type: ["string", "null"] or anyOf branches containing { type: "null" }. Our normalizer converts both conventions into T | null in TypeScript and .nullable() (or .nullish() when Nullish mode is enabled) in Zod.',
    },
    {
        question: 'How does the 1-Click Auto-Fix Spec feature repair legacy Swagger 2.0 or broken specifications?',
        answer:
            'Clicking "1-Click Auto-Fix" in the Input Window header transforms the specification in place: it upgrades swagger: "2.0" headers to openapi: "3.1.0", moves legacy definitions into components.schemas, rewrites #/definitions/* and #/$defs/* pointers to #/components/schemas/*, converts Swagger 2.0 in: "body" parameters into OpenAPI 3.1 requestBody blocks, wraps Swagger 2.0 response schemas into content["application/json"].schema, injects deterministic camelCase operationIds where missing, declares missing {path} template parameters, scaffolds placeholder schemas for unresolved dangling $refs, populates missing schema JSDoc descriptions, and upgrades non-localhost http:// server URLs to https://.',
    },
    {
        question: 'What happens if my OpenAPI spec has an unresolved or dangling $ref pointer before I click Auto-Fix?',
        answer:
            'If a schema or operation references a $ref target that does not exist in components.schemas or definitions (flagged as OAPI_003_DANGLING_REF_POINTER by the linter), the compiler emits a safe fallback type alias (export type MissingModel = Record<string, unknown>;) in api-types.ts and a fallback runtime validator (export const MissingModelSchema = z.record(z.string(), z.unknown());) in api-schemas.zod.ts so your generated code still compiles without undeclared identifier errors.',
    },
    {
        question: 'Are my proprietary OpenAPI YAML or JSON specifications uploaded to any external server?',
        answer:
            'No. Your OpenAPI YAML and JSON specifications are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources.',
    },
    {
        question: 'How are OpenAPI oneOf / anyOf discriminator unions compiled into TypeScript and Zod?',
        answer:
            'In TypeScript, oneOf and anyOf schemas compile to union types (CardPaymentMethod | BankTransferPaymentMethod), while allOf schemas compile to intersections (A & B). In Zod, when a union defines a discriminator.propertyName and has two or more non-lazy object branches, the compiler emits z.discriminatedUnion("type", [CardPaymentMethodSchema, BankTransferPaymentMethodSchema]) for O(1) discriminator lookup; otherwise it falls back to z.union([...]).',
    },
    {
        question: 'Why does the MSW mock generator emit http.get and HttpResponse.json instead of rest.get?',
        answer:
            'Mock Service Worker (MSW) v2.0+ replaced the legacy MSW v1 rest.get(url, (req, res, ctx) => res(ctx.json(...))) syntax with standard Fetch API primitives (http.get and HttpResponse.json()). Tab #3 (msw-handlers.ts) emits MSW v2 handlers, converts OpenAPI {param} route templates into MSW :param syntax, and provides per-endpoint factory functions that accept optional response overrides for unit and integration tests.',
    },
    {
        question: 'What is included in Tab #4 (Fetch + TanStack Query v5 Client)?',
        answer:
            'Tab #4 (api-client.ts) imports your generated *PathParams, *QueryParams, *RequestBody, and *Response types from ./api-types and builds a zero-dependency createApiClient() wrapper around native fetch with automatic URL path parameter encoding and URLSearchParams query string serialization. Below the client, it generates typed useQuery hooks for GET endpoints and typed useMutation hooks for POST, PUT, PATCH, and DELETE endpoints targeting @tanstack/react-query v5.',
    },
    {
        question: 'How does the deterministic seeded mock JSON generator produce realistic payloads?',
        answer:
            'Rather than emitting random strings on every render or generic "string" placeholders, the mock generator uses a Mulberry32 pseudo-random number generator seeded by your configurable Mock Seed. It inspects OpenAPI format attributes (uuid, email, date-time, date, uri, ipv4), enum values, const literals, numeric minimum/maximum bounds, and property name hints (such as priceCents, currency, phone, or status) to synthesize consistent JSON fixtures.',
    },
    {
        question: 'When should I choose Literal Union vs. as const Object vs. TypeScript enum for Enum Output Style?',
        answer:
            'Literal Unions (export type SubscriptionTier = "starter" | "growth" | "enterprise") produce zero runtime JavaScript overhead and are preferred in modern TypeScript codebases. Selecting "as const Object" emits both a frozen runtime lookup object and its derived union type, which is helpful when iterating over enum values in UI dropdowns. Selecting "TS enum" emits traditional TypeScript enum declarations for legacy codebases.',
    },
    {
        question: 'What is the difference between Zod .strict(), Default (Strip), and .passthrough() modes?',
        answer:
            'By default, Zod z.object() strips unrecognized keys when parsing a payload. Selecting ".strict()" appends .strict() to every generated object schema so Zod throws a validation error if an unexpected key is present—ideal for catching undocumented API contract drift. Selecting ".passthrough()" appends .passthrough() so extra keys are preserved untouched.',
    },
    {
        question: 'Why should I enable z.coerce for URL query parameters?',
        answer:
            'In HTTP query strings (such as ?limit=25&includeInvoices=true), every parameter arrives from the URL parser as a raw string ("25" and "true"). Enabling "Coerce query params (z.coerce)" compiles query number and boolean schemas using z.coerce.number() and z.coerce.boolean() so string query parameters are safely converted and validated in Next.js Route Handlers, Express, or client routers.',
    },
    {
        question: 'What does the 10-Point OpenAPI Specification Linter check?',
        answer:
            'The built-in linter audits 10 contract rules (OAPI_001 through OAPI_010): legacy Swagger 2.0 constructs, missing explicit operationIds, unresolved dangling $ref pointers, circular $ref cycles, undeclared URL path template parameters, missing 4xx/default error responses, missing or duplicate union discriminator properties, untyped free-form object schemas, cleartext HTTP server URLs, and missing component schema JSDoc descriptions.',
    },
    {
        question: 'What is included in the 3-Sheet Excel (.xlsx) Contract Inventory export?',
        answer:
            'Clicking ".XLSX" in the Output Window header generates a standards-compliant OpenXML workbook locally in your browser with three worksheets: Sheet 1 (API_Endpoints_Inventory), Sheet 2 (Component_Schemas_Graph), and Sheet 3 (OpenAPI_Linter_Audit). Every cell is sanitized against CWE-1236 spreadsheet formula injection.',
    },
];

export default function OpenapiToTypescriptSeo() {
    const jsonLdSoftwareApp = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'OpenAPI (Swagger) to TypeScript, Zod & MSW v2 Mock Generator',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'All (Client-Side Browser Execution)',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description:
            'Client-side OpenAPI 3.1, OpenAPI 3.0, and Swagger 2.0 compiler that converts YAML or JSON API specifications into strict TypeScript interfaces, topologically sorted Zod runtime schemas (with automatic z.lazy() circular reference guards), MSW v2 request handlers, and typed Fetch / TanStack Query v5 hooks.',
        featureList: [
            'Built-In Dual YAML 1.2 & JSON Parser for OpenAPI 3.1, OpenAPI 3.0, and Swagger 2.0',
            'Topological $ref Dependency Graph Sorter & DFS Circular Reference Detector (z.lazy() Guard)',
            'Strict TypeScript Interface & Type Alias Emitter with Configurable Enum Styles',
            'Runtime Zod Schema Compiler (.min, .max, .regex, .email, .uuid, z.discriminatedUnion)',
            'Mock Service Worker (MSW v2) http.* + HttpResponse.json() Handler Generator',
            'Zero-Dependency Typed Fetch Client & TanStack Query v5 Hooks (useQuery / useMutation)',
            '10-Point OpenAPI Contract Linter with 1-Click Auto-Fix & 3-Sheet Excel (.xlsx) Export',
        ],
    };

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
        name: 'How to Convert an OpenAPI (Swagger) Specification to TypeScript, Zod Schemas, and MSW v2 Mocks',
        description:
            'Step-by-step guide to compiling an OpenAPI 3.1, 3.0, or Swagger 2.0 YAML/JSON specification into TypeScript interfaces, topologically sorted Zod validators, MSW v2 mock handlers, and TanStack Query v5 hooks.',
        step: [
            {
                '@type': 'HowToStep',
                position: 1,
                name: 'Select a Sample Specification or Import Your OpenAPI YAML / JSON File',
                text: 'Click one of the 3 top sample preset cards (AcmeCloud Billing OpenAPI 3.1 YAML, LuxeCommerce Circular Category Tree OpenAPI 3.0 JSON, or Legacy Orders Swagger 2.0 YAML) or click Import File in the Left Input Window header.',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Configure Compiler Options & Run 1-Click Auto-Fix',
                text: 'Use the Compiler Configuration bar below the samples to select export interface vs. export type, Enum style, and Zod strictness, or click 1-Click Auto-Fix in the Input Window header to upgrade Swagger 2.0 and scaffold dangling $ref pointers.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Copy or Download the 6 Real-Time Generated Outputs in the Right Window',
                text: 'Switch across the 6 output tabs in the Right Window (TypeScript, Zod Schemas, MSW v2 Mocks, Fetch + TanStack, Mock JSON, and OpenAPI 3.1) and click Copy Code, Download, or .XLSX in the Output Window header.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Inspect Endpoints, Topological Schema Order & 10-Point Linter Diagnostics',
                text: 'Use the bottom inspector tabs to filter normalized endpoints, inspect schema properties and circular z.lazy() badges, review 10-point linter findings, and verify all 5 AST invariants.',
            },
        ],
    };

    return (
        <article className="mt-16 space-y-12 w-full min-w-0 max-w-full overflow-x-hidden text-slate-700 dark:text-slate-300">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftwareApp) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaqPage) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }}
            />

            {/* ============================================================================
          SECTION 1: EXECUTIVE OVERVIEW & UNIFIED COMPILER ARCHITECTURE
          ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-architecture-overview"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2
                        id="openapi-ts-architecture-overview"
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
                    >
                        Client-Side OpenAPI (Swagger) to TypeScript, Topological Zod &amp; MSW v2 Studio
                    </h2>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shrink-0">
                        <Sparkles className="h-3.5 w-3.5" />
                        OpenAPI 3.1 + 3.0 + Swagger 2.0
                    </span>
                </div>

                <p className="mt-3 w-full text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Compile <strong>OpenAPI 3.1</strong>, <strong>OpenAPI 3.0</strong>, and{' '}
                    <strong>Swagger 2.0</strong> YAML or JSON specifications into synchronized{' '}
                    <strong>TypeScript interfaces (<code>api-types.ts</code>)</strong>,{' '}
                    <strong>topologically sorted Zod validation schemas (<code>api-schemas.zod.ts</code>)</strong> with
                    automatic <code>z.lazy()</code> circular reference protection,{' '}
                    <strong>Mock Service Worker v2 handlers (<code>msw-handlers.ts</code>)</strong>, and{' '}
                    <strong>typed Fetch + TanStack Query v5 hooks (<code>api-client.ts</code>)</strong> in real time.
                </p>

                <blockquote className="p-4 my-6 bg-indigo-50/80 border-l-4 border-indigo-600 rounded-r-xl dark:bg-slate-800/80 not-italic">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
                        <strong>Local Browser Processing &amp; Privacy Disclosure:</strong> Your OpenAPI YAML and JSON
                        specifications, internal endpoint routes, and data models are processed locally in your browser
                        memory and are not uploaded to KivaroTools servers. The website may still load general analytics
                        or other third-party website resources.
                    </p>
                </blockquote>

                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    <p>
                        In modern full-stack TypeScript architectures, relying solely on static compile-time{' '}
                        <code>interface</code> definitions leaves a critical runtime blind spot: because TypeScript
                        types are completely erased during transpilation, an unexpected backend payload change,
                        third-party webhook mutation, or nullable database field silently bypasses compile-time checks
                        and causes runtime exceptions deep inside UI components. Pairing compile-time TypeScript
                        contracts with <strong>runtime Zod boundary schemas</strong> and{' '}
                        <strong>deterministic MSW v2 request handlers</strong> guarantees that your API client,
                        validation layer, and integration test suite never drift apart.
                    </p>
                    <p>
                        However, existing code generation tools force developers into a painful trade-off. Heavy CLI
                        pipelines (such as <code>Orval</code>, <code>Kubb</code>, or <code>@hey-api/openapi-ts</code>)
                        require installing Node.js dependencies, authoring complex configuration files, and fixing every
                        legacy Swagger 2.0 construct or dangling <code>$ref</code> pointer before a build can succeed.
                        Conversely, lightweight browser paste utilities (such as <code>Transform.tools</code> or{' '}
                        <code>Quicktype</code>) only accept flat JSON samples—failing on full multi-endpoint OpenAPI
                        YAML documents, emitting Zod constants in alphabetical order (which triggers JavaScript{' '}
                        <code>ReferenceError: Cannot access before initialization</code> on nested <code>$ref</code>{' '}
                        chains), and crashing on self-referencing recursive schemas. KivaroTools solves all of these
                        challenges in a single zero-install parallel dual-window studio.
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                            <GitBranch className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            Topological $ref Sorter &amp; Circular z.lazy() Guard
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Builds a directed dependency graph across all <code>#/components/schemas/*</code> pointers
                            so leaf Zod schemas initialize before parent schemas, and wraps recursive cycles in{' '}
                            <code>z.lazy(() =&gt; Schema)</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                            <Code2 className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            6 Synchronized Code &amp; Mock Deliverables
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Compiles TypeScript interfaces &amp; <code>ApiPaths</code>, constraint-aware Zod schemas,
                            MSW v2 <code>http.*</code> handlers, typed Fetch + TanStack Query v5 hooks, seeded mock
                            JSON, and OpenAPI 3.1 JSON simultaneously.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            <Wrench className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            10-Rule Linter, 1-Click Auto-Fix &amp; .XLSX Audit
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Upgrades Swagger 2.0 <code>definitions</code> and <code>in: body</code> payloads to OpenAPI
                            3.1.0, scaffolds unresolved dangling <code>$ref</code> pointers, injects missing{' '}
                            <code>operationId</code>s, and exports a 3-sheet Excel workbook.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 2: COMPLETE INTERNAL WORKING STRUCTURE (HOW THE ENGINE WORKS)
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
                        Complete Working Structure: How the 6-Stage OpenAPI Compiler Pipeline Works
                    </h2>
                </div>
                <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    <code>lib/openapiToTypescriptEngine.ts</code> executes a 6-stage deterministic compilation pipeline
                    entirely in browser memory:
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                            1
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Dual YAML 1.2 &amp; JSON OpenAPI Parser
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <code>parseOpenApiYamlOrJson()</code> parses both strict JSON and indentation-based YAML 1.2
                            documents (supporting multiline block scalars <code>|</code> and <code>&gt;</code>, inline
                            flow arrays <code>[string, null]</code>, inline flow objects{' '}
                            <code>&#123; $ref: ... &#125;</code>, and comment stripping) without external libraries.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                            2
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Swagger 2.0 / OpenAPI 3.0 / 3.1 Normalizer
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Normalizes Swagger 2.0 <code>definitions</code>, <code>host + basePath</code>, and{' '}
                            <code>in: body</code> parameters alongside OpenAPI 3.0 <code>nullable: true</code> and
                            OpenAPI 3.1 JSON Schema type arrays (<code>type: [&quot;string&quot;, &quot;null&quot;]</code>
                            , <code>const</code>, <code>$defs</code>) into a unified <code>NormalizedSchemaNode</code>{' '}
                            AST.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
                            3
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            DFS Topological Sorter &amp; Cycle Detector
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <code>analyzeSchemaGraph()</code> walks every property, array item, and{' '}
                            <code>allOf</code>/<code>oneOf</code>/<code>anyOf</code> branch to order schemas so leaf
                            dependencies emit first. Any direct or mutual cycle is recorded in{' '}
                            <code>circularSchemas</code> for automatic <code>z.lazy()</code> wrapping.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                            4
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            TypeScript AST &amp; Zod Constraint Emitters
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Emits <code>export interface</code> or <code>export type</code> models, configurable enums,
                            per-endpoint <code>*PathParams</code> / <code>*QueryParams</code> /{' '}
                            <code>*RequestBody</code> / <code>*Response</code> contracts, and Zod validators (
                            <code>.min()</code>, <code>.max()</code>, <code>.regex()</code>, <code>.uuid()</code>,{' '}
                            <code>.email()</code>, <code>z.discriminatedUnion()</code>).
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white">
                            5
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            MSW v2 Mocks, Seeded PRNG &amp; Typed Fetch SDK
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Synthesizes Mulberry32-seeded JSON fixtures, MSW v2 <code>http.*</code> request handlers
                            with <code>HttpResponse.json()</code>, and a typed native <code>fetch</code> client with
                            TanStack Query v5 <code>useQuery</code> and <code>useMutation</code> hooks.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600 text-xs font-bold text-white">
                            6
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            10-Rule Linter, Auto-Fixer &amp; 5-Point Verifier
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Audits 10 contract quality rules (<code>OAPI_001</code>–<code>OAPI_010</code>), provides
                            1-click Swagger 2.0 $\rightarrow$ OpenAPI 3.1.0 auto-remediation, and verifies balanced AST
                            delimiters and valid RFC 8259 JSON output.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 2B: COMPLETE STEP-BY-STEP USER GUIDE
          ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-complete-user-guide"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
            >
                <div>
                    <h2
                        id="openapi-ts-complete-user-guide"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Complete Step-by-Step Guide: How to Convert OpenAPI to TypeScript, Zod &amp; MSW v2
                    </h2>
                    <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Follow these four steps to compile, lint, and export your API contract artifacts:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Step 1: Select a Top Sample Card or Click &ldquo;Import File&rdquo; in the Input Window
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Start with one of the three built-in sample specifications at the top of the workspace (
                            <strong>AcmeCloud Billing OpenAPI 3.1 YAML</strong>,{' '}
                            <strong>LuxeCommerce Circular Category Tree OpenAPI 3.0 JSON</strong>, or{' '}
                            <strong>Legacy Orders Swagger 2.0 YAML</strong>), paste your contract directly into the
                            Left Input Window, or click <strong>Import File</strong> in the Input Window header to load
                            a local <code>.yaml</code>, <code>.yml</code>, or <code>.json</code> file.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Step 2: Customize Compiler Options &amp; Run 1-Click Auto-Fix
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            In the <strong>Compiler Configuration &amp; Codegen Options</strong> bar below the samples,
                            choose between <code>export interface</code> and <code>export type</code>, select your enum
                            style (<code>Literal Union</code>, <code>as const Object</code>, or <code>TS enum</code>),
                            set Zod strictness (<code>.strict()</code>, <code>Default</code>, or{' '}
                            <code>.passthrough()</code>), and toggle <code>readonly</code>, <code>.nullish()</code>, or{' '}
                            <code>z.coerce</code>. If your spec has legacy Swagger 2.0 constructs or dangling{' '}
                            <code>$ref</code> pointers, click <strong>1-Click Auto-Fix</strong> in the Input Window
                            header.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Step 3: Preview, Copy &amp; Download All 6 Generated Outputs in the Right Window
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            The Right Output Window updates on every keystroke. Switch across the 6 output tabs (
                            <code>TypeScript .ts</code>, <code>Zod Schemas</code>, <code>MSW v2 Mocks</code>,{' '}
                            <code>Fetch + TanStack</code>, <code>Mock JSON</code>, and <code>OpenAPI 3.1 JSON</code>)
                            and use the Output Window header buttons to <strong>Copy Code</strong>,{' '}
                            <strong>Download</strong> the active file, or export the 3-sheet <strong>.XLSX</strong>{' '}
                            contract audit workbook.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Step 4: Inspect Topological Schema Order, Endpoints &amp; 10-Point Linter Findings
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Below the parallel windows, use the <strong>Visual Endpoint &amp; Schema Explorer</strong>{' '}
                            to filter operations by HTTP method and inspect each schema&apos;s topological emission
                            index and property types, or switch to the <strong>10-Point OpenAPI Linter</strong> and{' '}
                            <strong>5-Point Invariant Verification</strong> tabs.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 3: REAL PRACTICAL EXAMPLES (SIDE-BY-SIDE CODE SHOWCASES)
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
                            Real-World Code Examples: OpenAPI 3.1 Discriminated Unions, Circular <code>z.lazy()</code> &amp; MSW v2 + React Query
                        </h2>
                    </div>
                    <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Inspect the exact input specifications and the compiled TypeScript, Zod, MSW v2, and TanStack
                        Query v5 code produced by our engine:
                    </p>
                </div>

                {/* Example 1 */}
                <div className="space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-xs font-mono">
                            Example 1
                        </span>
                        <span>
                            OpenAPI 3.1 Nullable Type Arrays &amp; <code>oneOf</code> Discriminator $\rightarrow$ TypeScript &amp; <code>z.discriminatedUnion()</code>
                        </span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                            <div className="text-indigo-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                INPUT: OpenAPI 3.1.0 YAML (Sample #1 — AcmeCloud Billing)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`components:
  schemas:
    CardPaymentMethod:
      type: object
      required: [type, last4, expYear]
      properties:
        type: { const: "card" }
        last4: { type: string, minLength: 4, maxLength: 4 }
        expYear: { type: integer, minimum: 2026, maximum: 2040 }
    BankTransferPaymentMethod:
      type: object
      required: [type, ibanCountry]
      properties:
        type: { const: "sepa_debit" }
        ibanCountry: { type: string, pattern: "^[A-Z]{2}$" }
    PaymentMethod:
      discriminator:
        propertyName: type
      oneOf:
        - $ref: "#/components/schemas/CardPaymentMethod"
        - $ref: "#/components/schemas/BankTransferPaymentMethod"
    Customer:
      type: object
      required: [id, email]
      properties:
        id: { type: string, format: uuid }
        email: { type: string, format: email }
        companyName: { type: ["string", "null"], minLength: 2, maxLength: 120 }`}</pre>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                            <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                COMPILED OUTPUT: Topologically Sorted Zod + TypeScript (Tab 1 &amp; Tab 2)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`export const CardPaymentMethodSchema = z.object({
  type: z.literal("card"),
  last4: z.string().min(4).max(4),
  expYear: z.number().int().min(2026).max(2040),
}).strict();

export const BankTransferPaymentMethodSchema = z.object({
  type: z.literal("sepa_debit"),
  ibanCountry: z.string().regex(/^[A-Z]{2}$/),
}).strict();

export const PaymentMethodSchema = z.discriminatedUnion("type", [
  CardPaymentMethodSchema,
  BankTransferPaymentMethodSchema,
]);

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
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
                            Self-Referencing Circular Schema (<code>CategoryNode</code>) $\rightarrow$ Naive TDZ Crash vs. Automatic <code>z.lazy()</code> Guard
                        </span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                            <div className="text-rose-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                BEFORE: Naive Generator Output (Throws TS7022 &amp; Runtime ReferenceError!)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`// ❌ ERROR TS7022: 'CategoryNodeSchema' implicitly has type 'any'
// ❌ Runtime ReferenceError: Cannot access 'CategoryNodeSchema'
//    before initialization!
export const CategoryNodeSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  parentCategory: CategoryNodeSchema.nullable().optional(),
  subcategories: z.array(CategoryNodeSchema),
});`}</pre>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                            <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                AFTER: KivaroTools DFS Cycle Detector + z.lazy() Guard (Sample #2)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`// ✓ DFS Cycle Detected: Annotated with z.ZodType<any>
// ✓ Recursive $ref branches wrapped in z.lazy(() => CategoryNodeSchema)
export const CategoryNodeSchema: z.ZodType<any> = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
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
                            Synchronized MSW v2 Mock Handler (Tab 3) &amp; Typed Fetch + TanStack Query v5 Hook (Tab 4)
                        </span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                            <div className="text-amber-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                TAB 3 OUTPUT: msw-handlers.ts (MSW v2 http.* + HttpResponse.json)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`import { http, HttpResponse } from 'msw';

const BASE_URL = "https://api.acmecloud.io/v1";

export function mockGetCustomerByIdHandler(overrideResponse?: unknown) {
  return http.get(\`\${BASE_URL}/customers/:customerId\`, () => {
    return HttpResponse.json(overrideResponse ?? {
      id: "550e8400-e29b-41d4-a716-446655440000",
      email: "alex.rivera@acmecloud.io",
      companyName: "Enterprise Cloud Plan",
      tier: "starter",
      createdAt: "2026-11-07T09:30:00Z"
    }, { status: 200 });
  });
}`}</pre>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                            <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                TAB 4 OUTPUT: api-client.ts (Typed Fetch SDK + React Query v5 Hooks)
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
          SECTION 4: 10-POINT LINTER RULES & MULTI-VERSION NORMALIZATION MATRIX
          ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-linter-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
            >
                <div>
                    <h2
                        id="openapi-ts-linter-matrix"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Technical Reference: 10-Point OpenAPI Linter Rules &amp; 1-Click Auto-Fix Behavior
                    </h2>
                    <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Every specification pasted or imported into the studio is audited across 10 structural and
                        type-safety rules before emission:
                    </p>
                </div>

                <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Rule Code</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Severity</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">What the Compiler Audits</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">1-Click Auto-Fix / Fallback Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                                    OAPI_001_SWAGGER_2_LEGACY
                                </td>
                                <td className="p-3 font-bold text-amber-600 border border-slate-200 dark:border-slate-700">WARNING</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Detects legacy <code>swagger: &quot;2.0&quot;</code> headers, <code>definitions</code>, and <code>in: body</code> parameters.
                                </td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold border border-slate-200 dark:border-slate-700">
                                    Upgrades to <code>openapi: &quot;3.1.0&quot;</code>, <code>components.schemas</code> &amp; <code>requestBody</code>.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                                    OAPI_002_MISSING_OPERATION_ID
                                </td>
                                <td className="p-3 font-bold text-amber-600 border border-slate-200 dark:border-slate-700">WARNING</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Flags HTTP path operations that omit an explicit <code>operationId</code> string.
                                </td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold border border-slate-200 dark:border-slate-700">
                                    Injects deterministic camelCase <code>operationId</code>s from method + path segments.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                                    OAPI_003_DANGLING_REF_POINTER
                                </td>
                                <td className="p-3 font-bold text-rose-600 border border-slate-200 dark:border-slate-700">ERROR</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Detects <code>$ref</code> pointers whose target schema does not exist in <code>components.schemas</code>.
                                </td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold border border-slate-200 dark:border-slate-700">
                                    Emits safe fallback stubs in code &amp; scaffolds missing schema in 1-Click Auto-Fix.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                                    OAPI_004_CIRCULAR_SCHEMA_REF
                                </td>
                                <td className="p-3 font-bold text-blue-600 border border-slate-200 dark:border-slate-700">INFO</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Identifies self-referencing or mutually recursive schema cycles via DFS traversal.
                                </td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold border border-slate-200 dark:border-slate-700">
                                    Automatically wraps recursive Zod references in <code>z.lazy(() =&gt; Schema)</code>.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                                    OAPI_005_UNDECLARED_PATH_PARAM
                                </td>
                                <td className="p-3 font-bold text-amber-600 border border-slate-200 dark:border-slate-700">WARNING</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Checks URL route templates (e.g. <code>/orders/&#123;orderId&#125;</code>) for missing <code>in: &quot;path&quot;</code> parameters.
                                </td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold border border-slate-200 dark:border-slate-700">
                                    Synthesizes required string path parameters in TypeScript &amp; Auto-Fix.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                                    OAPI_006_MISSING_ERROR_RESPONSE
                                </td>
                                <td className="p-3 font-bold text-blue-600 border border-slate-200 dark:border-slate-700">INFO</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Flags operations that only define <code>2xx</code> responses without a <code>4xx</code> or <code>default</code> error entry.
                                </td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold border border-slate-200 dark:border-slate-700">
                                    Injects a standard <code>default</code> error response block during Auto-Fix.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                                    OAPI_007_DUPLICATE_DISCRIMINATOR
                                </td>
                                <td className="p-3 font-bold text-rose-600 border border-slate-200 dark:border-slate-700">ERROR</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Audits <code>oneOf</code>/<code>anyOf</code> discriminated unions for missing or duplicate literal tags.
                                </td>
                                <td className="p-3 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                    Reports exact union branch conflict for schema author review.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                                    OAPI_008_UNTYPED_OBJECT_SCHEMA
                                </td>
                                <td className="p-3 font-bold text-amber-600 border border-slate-200 dark:border-slate-700">WARNING</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Flags <code>type: &quot;object&quot;</code> schemas with zero properties and no <code>additionalProperties</code>.
                                </td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold border border-slate-200 dark:border-slate-700">
                                    Safely compiles to <code>Record&lt;string, unknown&gt;</code> &amp; <code>z.record()</code>.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                                    OAPI_009_HTTP_INSECURE_SERVER
                                </td>
                                <td className="p-3 font-bold text-amber-600 border border-slate-200 dark:border-slate-700">WARNING</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Detects non-localhost server URLs using unencrypted <code>http://</code> instead of <code>https://</code>.
                                </td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold border border-slate-200 dark:border-slate-700">
                                    Upgrades server origin URLs to <code>https://</code> in 1-Click Auto-Fix.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                                    OAPI_010_MISSING_SCHEMA_DESCRIPTION
                                </td>
                                <td className="p-3 font-bold text-blue-600 border border-slate-200 dark:border-slate-700">INFO</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Checks whether component schemas include <code>description</code> strings for JSDoc generation.
                                </td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold border border-slate-200 dark:border-slate-700">
                                    Populates clean model descriptions during 1-Click Auto-Fix.
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
                aria-labelledby="openapi-ts-competitor-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="openapi-ts-competitor-matrix"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Feature &amp; Architecture Comparison: KivaroTools vs. CLI &amp; Web Generators
                </h2>
                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[760px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Capability / Feature</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-indigo-600 dark:text-indigo-400">
                                    KivaroTools OpenAPI Studio
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    openapi-typescript CLI
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Orval / Kubb CLI Suites
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Transform.tools / Quicktype Web
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Zero-Install Browser Studio (YAML &amp; JSON)
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Yes — Instant 50/50 Split Studio
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Node.js CLI only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Node.js CLI + config file</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-amber-600">
                                    Raw JSON snippets only (No OpenAPI paths)
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Topological Zod + Circular z.lazy() Guard
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Yes — Built-In DFS Sorter + z.lazy()
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">
                                    No Zod output (Types only)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Plugin-dependent</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                                    Crashes on circular $ref chains
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    MSW v2 (http.*) + TanStack Query v5 Hooks
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Yes — Generated Simultaneously
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Requires separate plugins</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    1-Click Swagger 2.0 &amp; Dangling $ref Auto-Fix
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Yes — Built-In Auto-Fix + Fallback Stubs
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                                    Throws CLI error on unresolved $refs
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                                    Throws CLI error on unresolved $refs
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    3-Sheet Excel (.xlsx) &amp; CSV Contract Audit
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Yes — CWE-1236 Guarded .xlsx &amp; .csv
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 6: 8 SUPPORTED EXPORT DELIVERABLES TABLE
          ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-export-deliverables"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h2
                        id="openapi-ts-export-deliverables"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        8 Supported Code, Mock &amp; Contract Audit Export Deliverables
                    </h2>
                </div>
                <div className="w-full mt-4 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[680px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">#</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Deliverable File</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Target Runtime / Spec</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Contents &amp; Engineering Use Case</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {[
                                [
                                    '1',
                                    'api-types.ts',
                                    'TypeScript 5.x (strict: true)',
                                    'Component interfaces/type aliases, configurable enums, *PathParams, *QueryParams, *RequestBody, *Response, and unified ApiPaths lookup map.',
                                ],
                                [
                                    '2',
                                    'api-schemas.zod.ts',
                                    'Zod v3 / v4 Runtime Validator',
                                    'Topologically sorted z.object() constants, z.lazy() circular guards, z.discriminatedUnion(), z.coerce query schemas, and z.infer<> exports.',
                                ],
                                [
                                    '3',
                                    'msw-handlers.ts',
                                    'Mock Service Worker (MSW v2)',
                                    'Ready-to-import http.get/post/put/patch/delete handlers returning HttpResponse.json() with per-endpoint override parameters for Vitest/Playwright.',
                                ],
                                [
                                    '4',
                                    'api-client.ts',
                                    'Native Fetch + @tanstack/react-query v5',
                                    'Zero-dependency createApiClient() with URLSearchParams query serialization plus typed useQuery and useMutation hooks.',
                                ],
                                [
                                    '5',
                                    'mock-payloads.json',
                                    'RFC 8259 JSON Fixtures',
                                    'Deterministic Mulberry32 PRNG-seeded JSON payloads keyed by operationId respecting uuid/email/date-time formats and min/max bounds.',
                                ],
                                [
                                    '6',
                                    'openapi-3.1.normalized.json',
                                    'OpenAPI 3.1.0 Specification',
                                    'Canonical OpenAPI 3.1.0 JSON upgraded from YAML, Swagger 2.0 definitions/in:body, or OpenAPI 3.0 contracts.',
                                ],
                                [
                                    '7',
                                    'openapi-contract-inventory.xlsx',
                                    'Microsoft Excel / Google Sheets (.xlsx)',
                                    '3-sheet OpenXML workbook (API_Endpoints_Inventory, Component_Schemas_Graph, OpenAPI_Linter_Audit) with CWE-1236 formula protection.',
                                ],
                                [
                                    '8',
                                    'openapi-endpoints-inventory.csv',
                                    'UTF-8 BOM CSV Spreadsheet',
                                    'Flat endpoint and component schema inventory for spreadsheet auditing and architecture documentation.',
                                ],
                            ].map(([num, file, target, desc]) => (
                                <tr key={num}>
                                    <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">
                                        {num}
                                    </td>
                                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                                        {file}
                                    </td>
                                    <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                        {target}
                                    </td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">{desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 7: COMMON OPENAPI & TYPESCRIPT/ZOD CODEGEN MISTAKES (6 SCENARIOS)
          ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-troubleshooting"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="openapi-ts-troubleshooting"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Common OpenAPI to TypeScript &amp; Zod Code Generation Pitfalls to Avoid
                </h2>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>1. Emitting Zod Schemas in Alphabetical Instead of Topological Order</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Alphabetical schema emission fails whenever <code>AccountSchema</code> references{' '}
                            <code>UserSchema</code> before <code>UserSchema</code> is evaluated. Always sort{' '}
                            <code>$ref</code> dependencies topologically so leaf schemas initialize first.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>2. Forgetting z.lazy() on Recursive Tree or Graph Schemas</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Self-referencing schemas (such as nested comments, folder hierarchies, or{' '}
                            <code>CategoryNode</code>) cause both TypeScript TS7022 errors and runtime stack overflows
                            unless wrapped in <code>z.lazy(() =&gt; Schema)</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>3. Treating URL Query Parameters as Uncoerced Numbers or Booleans</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            In Express, Next.js Route Handlers, and browser URLs, query parameters arrive as raw strings
                            (e.g. <code>?limit=&quot;20&quot;</code>). Enabling <code>z.coerce</code> converts query
                            numbers and booleans safely at validation time.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>4. Omitting Explicit operationId Attributes Across Endpoints</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            When endpoints lack explicit <code>operationId</code>s, SDK generators must guess function
                            names from URL segments. Use the 10-point linter and 1-Click Auto-Fix to standardize clean{' '}
                            <code>camelCase</code> identifiers.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>5. Using Legacy MSW v1 rest.get Syntax in Modern Test Suites</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            MSW v2 deprecated <code>rest.get</code> and <code>ctx.json</code> in favor of standard{' '}
                            <code>http.get</code> and <code>HttpResponse.json()</code> primitives. Ensure generated mock
                            handlers match MSW v2 conventions.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>6. Overlooking OpenAPI 3.1 Type Arrays (type: [&quot;string&quot;, &quot;null&quot;])</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Legacy OpenAPI 3.0 parsers often fail when encountering OpenAPI 3.1 JSON Schema type arrays
                            like <code>type: [&quot;string&quot;, &quot;null&quot;]</code>, silently dropping the type
                            to <code>any</code> instead of <code>string | null</code>.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 8: SEARCH INTENT & DEVELOPER WORKFLOW COVERAGE
          ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-keyword-coverage"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Search className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="openapi-ts-keyword-coverage"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Supported OpenAPI, TypeScript, Zod &amp; API Mocking Workflows
                    </h2>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            OpenAPI &amp; Swagger to TypeScript Codegen
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>openapi to typescript converter online</li>
                            <li>swagger to typescript interfaces generator</li>
                            <li>openapi 3.1 to typescript type generator</li>
                            <li>convert openapi yaml to typescript online</li>
                            <li>swagger json to typescript definitions</li>
                            <li>openapi paths and operations to typescript</li>
                            <li>swagger 2.0 to openapi 3.1 converter online</li>
                            <li>openapi enum to typescript union or const object</li>
                            <li>openapi discriminator oneof to typescript union</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            Runtime Zod Schema &amp; Circular $ref Compilation
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>openapi to zod schema generator online</li>
                            <li>swagger to zod validator converter</li>
                            <li>json schema to zod with circular reference z.lazy</li>
                            <li>topologically sorted zod schema generator</li>
                            <li>openapi discriminated union to zod schema</li>
                            <li>openapi string format uuid email regex to zod</li>
                            <li>zod infer types from openapi specification</li>
                            <li>zod strict vs passthrough openapi generator</li>
                            <li>openapi query params z.coerce validator</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            MSW v2 Mocks, TanStack Query SDK &amp; Linting
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>openapi to msw v2 mock handlers generator</li>
                            <li>mock service worker httpresponse generator</li>
                            <li>openapi to tanstack react query v5 hooks</li>
                            <li>type safe fetch client generator from openapi</li>
                            <li>deterministic seeded mock json from openapi</li>
                            <li>openapi specification linter and auto fix online</li>
                            <li>fix dangling ref pointers in swagger openapi</li>
                            <li>export openapi endpoints inventory to excel xlsx</li>
                            <li>client side browser openapi code generator</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 9: FREQUENTLY ASKED QUESTIONS (15 INTERACTIVE ACCORDIONS)
          ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-frequently-asked-questions"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="openapi-ts-frequently-asked-questions"
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
          SECTION 10: INTERNAL CROSS-LINKING TO RELATED DEVELOPER & API TOOLS
          ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-related-utilities"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="openapi-ts-related-utilities"
                        className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Related Developer, API &amp; Data Architecture Utilities
                    </h2>
                </div>
                <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed break-words">
                    Continue your API engineering, payload inspection, and developer documentation workflow with our
                    integrated browser utilities:
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/developer/json-converter"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            JSON to CSV, Excel (.xlsx), YAML &amp; XML Converter →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Transform nested REST API JSON payloads and mock responses into flat spreadsheets, YAML, or
                            XML locally.
                        </p>
                    </Link>

                    <Link
                        href="/developer/har-analyzer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            HAR File Analyzer, Waterfall Viewer &amp; Sanitizer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect recorded HTTP network traffic, scrub Bearer tokens and cookies, and generate k6 or
                            Playwright test scripts.
                        </p>
                    </Link>

                    <Link
                        href="/developer/llms-txt-generator"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            llms.txt, llms-full.txt &amp; AI Crawler (robots.txt) Studio →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Compile llmstxt.org v2 documentation indexes and AI crawler robots.txt policies for your
                            developer portal.
                        </p>
                    </Link>

                    <Link
                        href="/developer/parquet-viewer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            Parquet, Avro &amp; Feather Viewer + Excel (.xlsx) →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Query columnar data files with SQL in your browser and inspect schema metadata without
                            server uploads.
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
                            Validate and format OpenAPI 3.1 JSON schemas, mock payloads, and Schema.org JSON-LD graphs.
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
                            Test OpenAPI string validation patterns and Zod .regex() rules with live match highlighting.
                        </p>
                    </Link>
                </div>
            </section>
        </article>
    );
}