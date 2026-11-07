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
            'Clicking "1-Click Auto-Fix Spec" transforms the input contract in place: it upgrades swagger: "2.0" headers to openapi: "3.1.0", moves legacy definitions into components.schemas, rewrites #/definitions/* and #/$defs/* pointers to #/components/schemas/*, converts Swagger 2.0 in: "body" parameters into OpenAPI 3.1 requestBody blocks, wraps Swagger 2.0 response schemas into content["application/json"].schema, injects deterministic camelCase operationIds where missing, declares missing {path} template parameters, scaffolds placeholder schemas for unresolved dangling $refs, and upgrades non-localhost http:// server URLs to https://.',
    },
    {
        question: 'What happens if my OpenAPI spec has an unresolved or dangling $ref pointer before I click Auto-Fix?',
        answer:
            'If a schema or operation references a $ref target that does not exist in components.schemas or definitions (flagged as OAPI_003_DANGLING_REF_POINTER by the linter), the compiler emits a safe fallback type alias (export type MissingModel = Record<string, unknown>;) in api-types.ts and a fallback runtime validator (export const MissingModelSchema = z.record(z.string(), z.unknown());) in api-schemas.zod.ts so your generated code still compiles without undeclared identifier errors.',
    },
    {
        question: 'Are my proprietary OpenAPI YAML or JSON specifications uploaded to any external server?',
        answer:
            'No. All YAML and JSON parsing, $ref dependency graph analysis, TypeScript AST generation, Zod schema compilation, MSW v2 handler synthesis, and 3-sheet Excel (.xlsx) binary packaging run locally inside your browser tab and are not uploaded to KivaroTools servers.',
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
            'Rather than emitting random strings on every render or generic "string" placeholders, the mock generator uses a Mulberry32 pseudo-random number generator seeded by your configurable Mock PRNG Seed. It inspects OpenAPI format attributes (uuid, email, date-time, date, uri, ipv4), enum values, const literals, numeric minimum/maximum bounds, and property name hints (such as priceCents, currency, phone, or status) to synthesize consistent JSON fixtures.',
    },
    {
        question: 'What does the 10-Point OpenAPI Specification Linter check?',
        answer:
            'The built-in linter audits 10 contract rules (OAPI_001 through OAPI_010): legacy Swagger 2.0 constructs, missing explicit operationIds, unresolved dangling $ref pointers, circular $ref cycles, undeclared URL path template parameters, missing 4xx/default error responses, missing or duplicate union discriminator properties, untyped free-form object schemas, cleartext HTTP server URLs, and missing component schema JSDoc descriptions.',
    },
    {
        question: 'What is included in the 3-Sheet Excel (.xlsx) Contract Inventory export?',
        answer:
            'Clicking "Export 3-Sheet Excel (.xlsx)" generates a standards-compliant OpenXML workbook locally in your browser with three worksheets: Sheet 1 (API_Endpoints_Inventory), Sheet 2 (Component_Schemas_Graph), and Sheet 3 (OpenAPI_Linter_Audit). Every cell is sanitized against CWE-1236 spreadsheet formula injection.',
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
                name: 'Select a Sample Specification or Paste Your OpenAPI YAML / JSON Contract',
                text: 'Click one of the 3 top sample preset cards (AcmeCloud Billing OpenAPI 3.1 YAML, LuxeCommerce Circular Category Tree OpenAPI 3.0 JSON, or Legacy Orders Swagger 2.0 YAML) or paste/upload your own .yaml or .json specification in the Left Window.',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Configure Compiler Options & Run 1-Click Auto-Fix Spec',
                text: 'Choose between export interface or export type, select your enum representation (literal union, as const object, or TS enum), set Zod object strictness (.strict(), default, or .passthrough()), and click 1-Click Auto-Fix Spec to upgrade legacy Swagger 2.0 definitions or resolve dangling $ref pointers.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Inspect & Copy the 6 Real-Time Generated Code Artifacts in the Right Window',
                text: 'Switch across the 6 output tabs in the Right Window (api-types.ts, api-schemas.zod.ts, msw-handlers.ts, api-client.ts, mock-payloads.json, and openapi-3.1.normalized.json) to copy or download the generated files.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Audit Endpoints, Linter Findings & Export the 3-Sheet Excel (.xlsx) Inventory',
                text: 'Use the bottom inspector tabs to search normalized endpoints, inspect topological schema order, review 10-point linter diagnostics, and export the 3-sheet Excel (.xlsx) or CSV contract inventory.',
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
                        Unified OpenAPI (Swagger) to TypeScript, Topological Zod &amp; MSW v2 Studio
                    </h2>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shrink-0">
                        <Sparkles className="h-3.5 w-3.5" />
                        OpenAPI 3.1 / 3.0 / Swagger 2.0
                    </span>
                </div>

                <p className="mt-4 w-full text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 break-words">
                    Most browser-based code generators only convert flat JSON snippets into basic TypeScript interfaces,
                    while CLI tools require Node.js setup, plugin configuration files, and clean specifications before
                    they can emit a single line of code. Our{' '}
                    <strong>OpenAPI (Swagger) to TypeScript, Zod &amp; Mock Generator</strong> combines a{' '}
                    <strong>zero-dependency YAML 1.2 &amp; JSON OpenAPI parser</strong> with{' '}
                    <strong>topological $ref sorting, automatic circular z.lazy() guards, MSW v2 request handlers, and typed Fetch / TanStack Query v5 hooks</strong>{' '}
                    in a parallel dual-window browser workspace.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                            <Code2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span>Strict TypeScript AST</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Generates component interfaces or type aliases, configurable enums (literal unions,{' '}
                            <code>as const</code> objects, or TS enums), operation parameter/response contracts, and a
                            unified <code>ApiPaths</code> lookup map.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                            <GitBranch className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Topological Zod + z.lazy()</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Orders schemas topologically so referenced constants are initialized before use, and wraps
                            self-referencing or mutually recursive schemas in <code>z.lazy(() =&gt; Schema)</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                            <Terminal className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>MSW v2 &amp; TanStack v5 SDK</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Synthesizes Mock Service Worker v2 (<code>http.*</code> + <code>HttpResponse.json</code>)
                            handlers alongside a typed native <code>fetch</code> client and React Query v5{' '}
                            <code>useQuery</code> / <code>useMutation</code> hooks.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                            <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>10-Rule Linter &amp; Auto-Fix</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Audits 10 OpenAPI contract rules and provides a 1-Click Auto-Fix utility that upgrades
                            Swagger 2.0 to OpenAPI 3.1.0, injects missing <code>operationId</code>s, and scaffolds
                            dangling <code>$ref</code> targets.
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
                        Complete Working Structure: How the 6-Domain OpenAPI Compiler Engine Works
                    </h2>
                </div>
                <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    <code>lib/openapiToTypescriptEngine.ts</code> is organized into six deterministic compilation stages
                    verified by automated AST invariant checks:
                </p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            1. Dual YAML 1.2 / JSON Parser &amp; Multi-Version Normalizer
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            <code>parseOpenApiYamlOrJson()</code> parses both RFC 8259 JSON and indentation-structured
                            YAML 1.2 (including multiline block scalars <code>|</code> and <code>&gt;</code>, inline
                            flow arrays <code>[string, null]</code>, and inline flow objects{' '}
                            <code>&#123; $ref: ... &#125;</code>). The normalizer unifies Swagger 2.0{' '}
                            <code>definitions</code> and <code>in: body</code> parameters, OpenAPI 3.0{' '}
                            <code>nullable: true</code>, and OpenAPI 3.1 type arrays into a canonical AST.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            2. Topological $ref Dependency Graph &amp; Cycle Guard
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            <code>analyzeSchemaGraph()</code> traverses every property, array item,{' '}
                            <code>additionalProperties</code> schema, and <code>allOf</code> / <code>oneOf</code> /{' '}
                            <code>anyOf</code> branch to build a directed dependency graph. Depth-first traversal emits
                            leaf schemas before parent schemas and records any schema participating in a cycle inside{' '}
                            <code>circularSchemas</code> for automatic <code>z.lazy()</code> wrapping.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            3. TypeScript Contract &amp; Constraint-Aware Zod Emitters
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            <code>generateTypeScriptFileCode()</code> and <code>generateZodFileCode()</code> compile
                            models and endpoint operations into synchronized code. String formats (<code>uuid</code>,{' '}
                            <code>email</code>, <code>uri</code>, <code>date-time</code>, <code>ipv4</code>,{' '}
                            <code>ipv6</code>), bounds (<code>minLength</code>, <code>maxLength</code>,{' '}
                            <code>minimum</code>, <code>maximum</code>, <code>exclusiveMinimum</code>,{' '}
                            <code>multipleOf</code>), and regex patterns map directly to Zod validation chains.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            4. MSW v2, Seeded Mock Fixtures, Typed SDK &amp; 10-Rule Linter
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            <code>generateMswAndClientFiles()</code> uses a Mulberry32 seeded PRNG to synthesize
                            deterministic JSON fixtures, MSW v2 request handlers, and a typed Fetch + TanStack Query v5
                            client that imports <code>*PathParams</code>, <code>*QueryParams</code>,{' '}
                            <code>*RequestBody</code>, and <code>*Response</code>. Simultaneously,{' '}
                            <code>runOpenApiSpecLinter()</code> evaluates 10 contract health rules.
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
                        Complete Step-by-Step Guide: How to Use the Parallel Dual-Window OpenAPI Studio
                    </h2>
                    <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Follow these four steps to convert any OpenAPI or Swagger specification into production-ready
                        TypeScript, Zod, MSW v2, and React Query code:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                            Step 1 • Top Sample Row or Upload
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Load a Sample Spec or Paste YAML / JSON
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Click any of the 3 top sample cards (OpenAPI 3.1 Billing YAML, OpenAPI 3.0 Circular JSON,
                            or Legacy Swagger 2.0 YAML) or paste/upload your own specification in the Left Window.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                            Step 2 • Compiler Flags &amp; Auto-Fix
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Configure Emission Style &amp; Auto-Fix
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Select <code>interface</code> vs. <code>type</code>, choose your enum format, set Zod
                            object mode (<code>.strict()</code>, default, or <code>.passthrough()</code>), and click{' '}
                            <strong>1-Click Auto-Fix Spec</strong> if your file uses Swagger 2.0 or has dangling{' '}
                            <code>$ref</code> pointers.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                            Step 3 • Right Window Live Code
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Switch Across 6 Generated Output Tabs
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Inspect the live-compiled code in the Right Window across TypeScript, Zod Schemas, MSW v2
                            Mocks, Fetch + TanStack v5 SDK, Seeded Mock JSON, and Normalized OpenAPI 3.1 JSON.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                            Step 4 • Explorer, Linter &amp; .xlsx
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Audit Endpoints &amp; Export 3-Sheet .xlsx
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Review the Visual Endpoint &amp; Schema Explorer, inspect 10-point linter findings, verify
                            the 5 AST invariants, and download the 3-sheet Excel (<code>.xlsx</code>) or CSV contract
                            inventory.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 3: REAL PRACTICAL EXAMPLES (RECONCILED WITH ENGINE V1.0.0)
          ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-real-examples"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Terminal className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="openapi-ts-real-examples"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Reconciled Examples: Discriminated Unions, Circular z.lazy() Schemas &amp; Swagger 2.0 Auto-Fix
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Example 1: OpenAPI 3.1 Nullable Arrays &amp; Discriminated Unions (Sample #1)
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            In Sample #1 (<strong>AcmeCloud Billing API</strong>), <code>Customer.companyName</code>{' '}
                            uses OpenAPI 3.1 <code>type: [string, null]</code> with <code>minLength: 2</code> and{' '}
                            <code>maxLength: 120</code>, compiling to{' '}
                            <code>companyName?: string | null</code> in TypeScript and{' '}
                            <code>z.string().min(2).max(120).nullable().optional()</code> in Zod. The{' '}
                            <code>PaymentMethod</code> schema uses <code>oneOf</code> with{' '}
                            <code>discriminator.propertyName: &quot;type&quot;</code> across{' '}
                            <code>CardPaymentMethod</code> (<code>const: &quot;card&quot;</code>) and{' '}
                            <code>BankTransferPaymentMethod</code> (<code>const: &quot;sepa_debit&quot;</code>),
                            compiling to{' '}
                            <code>z.discriminatedUnion(&quot;type&quot;, [CardPaymentMethodSchema, BankTransferPaymentMethodSchema])</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Example 2: Self-Referencing CategoryNode Tree with z.lazy() (Sample #2)
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            In Sample #2 (<strong>LuxeCommerce Category Tree</strong>), <code>CategoryNode</code>{' '}
                            contains both a nullable self-reference (<code>parentCategory</code>) and a recursive array
                            (<code>subcategories: CategoryNode[]</code>). The graph analyzer flags{' '}
                            <code>CategoryNode</code> in <code>circularSchemas</code> and emits{' '}
                            <code>export const CategoryNodeSchema: z.ZodType&lt;any&gt; = z.object(&#123; ... parentCategory: z.lazy(() =&gt; CategoryNodeSchema).nullable().optional(), subcategories: z.array(z.lazy(() =&gt; CategoryNodeSchema)) &#125;).strict()</code>,
                            while ordering <code>CategoryNode</code> before <code>ProductItem</code> so{' '}
                            <code>ProductItemSchema</code> can safely reference it.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Example 3: Legacy Swagger 2.0 Linter &amp; 1-Click Auto-Fix (Sample #3)
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Sample #3 (<strong>Legacy Orders Swagger 2.0</strong>) intentionally includes{' '}
                            <code>swagger: &quot;2.0&quot;</code>, <code>schemes: [http]</code>, missing{' '}
                            <code>operationId</code>s, legacy <code>in: body</code> parameters, and an unresolved{' '}
                            <code>$ref: &quot;#/definitions/ShippingAddress&quot;</code> (initial Health Score:{' '}
                            <strong>42/100</strong> with safe <code>ShippingAddress</code> fallback stubs). Clicking{' '}
                            <strong>1-Click Auto-Fix Spec</strong> upgrades the document to OpenAPI 3.1.0, migrates{' '}
                            <code>in: body</code> to <code>requestBody</code>, scaffolds{' '}
                            <code>ShippingAddress</code> in <code>components.schemas</code>, injects{' '}
                            <code>getOrders</code> / <code>postOrders</code>, and raises the Health Score to{' '}
                            <strong>100/100</strong>.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 4: SWAGGER 2.0 vs OPENAPI 3.0 vs OPENAPI 3.1 NORMALIZATION MATRIX
          ============================================================================ */}
            <section
                aria-labelledby="openapi-ts-version-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="openapi-ts-version-matrix"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Swagger 2.0, OpenAPI 3.0.x &amp; OpenAPI 3.1.x Normalization Reference Matrix
                </h2>
                <div className="w-full mt-4 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[720px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Contract Construct</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Swagger 2.0</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">OpenAPI 3.0.x</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">OpenAPI 3.1.x</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Compiled TypeScript &amp; Zod Output</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="p-3 font-bold">Schema Definitions</td>
                                <td className="p-3 font-mono">#/definitions/Model</td>
                                <td className="p-3 font-mono">#/components/schemas/Model</td>
                                <td className="p-3 font-mono">#/components/schemas/Model or $defs</td>
                                <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                                    export interface Model / ModelSchema
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Nullable Fields</td>
                                <td className="p-3 font-mono">x-nullable: true</td>
                                <td className="p-3 font-mono">type: string, nullable: true</td>
                                <td className="p-3 font-mono">type: [&quot;string&quot;, &quot;null&quot;]</td>
                                <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                                    string | null / z.string().nullable()
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Request Payloads</td>
                                <td className="p-3 font-mono">parameters: [in: &quot;body&quot;, schema]</td>
                                <td className="p-3 font-mono">requestBody.content[&quot;application/json&quot;]</td>
                                <td className="p-3 font-mono">requestBody.content[&quot;application/json&quot;]</td>
                                <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                                    *RequestBody &amp; *RequestBodySchema
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Literal Constants</td>
                                <td className="p-3 font-mono">enum: [&quot;card&quot;]</td>
                                <td className="p-3 font-mono">enum: [&quot;card&quot;]</td>
                                <td className="p-3 font-mono">const: &quot;card&quot;</td>
                                <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                                    &quot;card&quot; / z.literal(&quot;card&quot;)
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Discriminated Unions</td>
                                <td className="p-3 font-mono">allOf polymorphism</td>
                                <td className="p-3 font-mono">oneOf + discriminator.propertyName</td>
                                <td className="p-3 font-mono">oneOf / anyOf + discriminator</td>
                                <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                                    A | B / z.discriminatedUnion(&quot;type&quot;, [...])
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Server Base URL</td>
                                <td className="p-3 font-mono">schemes + host + basePath</td>
                                <td className="p-3 font-mono">servers: [&#123; url &#125;]</td>
                                <td className="p-3 font-mono">servers: [&#123; url &#125;]</td>
                                <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                                    BASE_URL in MSW v2 &amp; Fetch Client
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
                    Feature Comparison: KivaroTools OpenAPI Studio vs. CLI &amp; Web Generators
                </h2>
                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Feature / Capability</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800 bg-indigo-50/60 dark:bg-indigo-950/40 font-bold">
                                    KivaroTools OpenAPI Studio
                                </th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">
                                    CLI Generators (openapi-typescript / Orval / Kubb)
                                </th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">
                                    Basic Web JSON-to-TS Converters
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="p-3 font-bold">Zero-Setup Browser Execution (YAML &amp; JSON)</td>
                                <td className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Instant Parallel Split Studio
                                </td>
                                <td className="p-3">Requires Node.js CLI &amp; Config Setup</td>
                                <td className="p-3">JSON Payloads Only (No OpenAPI Paths)</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Topological $ref Sorting &amp; Circular z.lazy()</td>
                                <td className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Automatic DFS Cycle Detection + z.lazy()
                                </td>
                                <td className="p-3">Varies by Plugin</td>
                                <td className="p-3 text-rose-500">✕ Fails on Recursive Schemas</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Simultaneous TypeScript + Zod + MSW v2 + React Query</td>
                                <td className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ All 6 Deliverables in One Click
                                </td>
                                <td className="p-3">Requires Multiple Separate Packages</td>
                                <td className="p-3 text-rose-500">✕ Static Interfaces Only</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">10-Point Contract Linter &amp; 1-Click Auto-Fix</td>
                                <td className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Upgrades Swagger 2.0 &amp; Scaffolds Dangling $refs
                                </td>
                                <td className="p-3 text-rose-500">✕ Aborts on Unresolved $refs</td>
                                <td className="p-3 text-rose-500">✕ No Contract Linting</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Deterministic Seeded Mock Payloads</td>
                                <td className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Mulberry32 PRNG + Format/Constraint Aware
                                </td>
                                <td className="p-3">Requires Faker.js Runtime Dependency</td>
                                <td className="p-3 text-rose-500">✕ Not Supported</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">3-Sheet Excel (.xlsx) &amp; CSV Contract Audit</td>
                                <td className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Native OpenXML .xlsx + CWE-1236 Sanitizer
                                </td>
                                <td className="p-3 text-rose-500">✕ Code Files Only</td>
                                <td className="p-3 text-rose-500">✕ Not Supported</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 6: SUPPORTED CODE & SPREADSHEET EXPORT DELIVERABLES TABLE
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
                        Supported Code, Mock &amp; Spreadsheet Export Formats
                    </h2>
                </div>
                <div className="w-full mt-4 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[680px] w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Output Tab / Export</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Default Filename</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Contents &amp; Engineering Use Case</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="p-3 font-bold">1. TypeScript Contracts</td>
                                <td className="p-3 font-mono">api-types.ts</td>
                                <td className="p-3">
                                    Component interfaces/types, configurable enums, <code>*PathParams</code>,{' '}
                                    <code>*QueryParams</code>, <code>*RequestBody</code>, <code>*Response</code>, and{' '}
                                    <code>ApiPaths</code> map.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">2. Runtime Zod Schemas</td>
                                <td className="p-3 font-mono">api-schemas.zod.ts</td>
                                <td className="p-3">
                                    Topologically ordered <code>z.object()</code> schemas, <code>z.lazy()</code>{' '}
                                    circular guards, <code>z.discriminatedUnion()</code>, <code>z.coerce</code> query
                                    validators, and <code>z.infer&lt;&gt;</code> types.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">3. MSW v2 Request Handlers</td>
                                <td className="p-3 font-mono">msw-handlers.ts</td>
                                <td className="p-3">
                                    Mock Service Worker v2 (<code>http.get</code>, <code>http.post</code>,{' '}
                                    <code>HttpResponse.json</code>) handlers for Vitest, Jest, Playwright, and
                                    Storybook.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">4. Fetch + TanStack Query v5</td>
                                <td className="p-3 font-mono">api-client.ts</td>
                                <td className="p-3">
                                    Typed <code>createApiClient()</code> wrapper with <code>URLSearchParams</code>{' '}
                                    serialization plus React Query v5 <code>useQuery</code> and{' '}
                                    <code>useMutation</code> hooks.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">5. Seeded Mock Payloads</td>
                                <td className="p-3 font-mono">mock-payloads.json</td>
                                <td className="p-3">
                                    Deterministic Mulberry32-seeded JSON fixtures keyed by <code>operationId</code>.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">6. Normalized OpenAPI 3.1</td>
                                <td className="p-3 font-mono">openapi-3.1.normalized.json</td>
                                <td className="p-3">
                                    Canonical OpenAPI 3.1.0 JSON specification upgraded from YAML, Swagger 2.0, or
                                    OpenAPI 3.0.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">7. 3-Sheet Excel Audit (.xlsx)</td>
                                <td className="p-3 font-mono">openapi-contract-inventory.xlsx</td>
                                <td className="p-3">
                                    OpenXML workbook with 3 tabs: <code>API_Endpoints_Inventory</code>,{' '}
                                    <code>Component_Schemas_Graph</code>, and <code>OpenAPI_Linter_Audit</code>.
                                </td>
                            </tr>
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
          SECTION 9: FREQUENTLY ASKED QUESTIONS (12 INTERACTIVE ACCORDIONS)
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
                        href="/document/pdf-scrubber"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            PDF Bank Statement &amp; Invoice Data Scrubber →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Sanitize sensitive PII, account numbers, and hidden XMP metadata from PDF documents in
                            browser memory.
                        </p>
                    </Link>

                    <Link
                        href="/finance/saas-burn-rate-calculator"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            SaaS Burn Rate, Runway &amp; Equity Dilution Calculator →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Model 60-month cash runway, Default Alive breakeven, YC Post-Money SAFE dilution, and
                            scenario M&amp;A waterfalls.
                        </p>
                    </Link>
                </div>
            </section>
        </article>
    );
}