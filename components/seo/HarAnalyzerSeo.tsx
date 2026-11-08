import React from 'react';
import Link from 'next/link';
import {
    Activity,
    ShieldCheck,
    Layers,
    KeyRound,
    CheckCircle2,
    AlertTriangle,
    Terminal,
    HelpCircle,
    Sparkles,
    FileSpreadsheet,
    Cpu,
    Search,
    Code2,
} from 'lucide-react';

export interface FaqItem {
    question: string;
    answer: string;
}

export const HAR_ANALYZER_FAQS: FaqItem[] = [
    {
        question: 'What is a HAR (.har) file and why is sharing an unsanitized HAR file dangerous?',
        answer:
            'A HAR (HTTP Archive v1.2) file is a JSON log of every network request and response recorded by your browser during a session. When you choose "Save all as HAR with content" in Chrome, Edge, Firefox, or Safari DevTools, the file records your live session cookies (Cookie and Set-Cookie headers), Authorization Bearer JWT tokens, OAuth2 codes, SAML 2.0 XML assertions, API keys, and plaintext passwords or credit card numbers inside POST bodies. Anyone who obtains an unsanitized HAR file can replay your session cookies to hijack your account.',
    },
    {
        question: 'Are my HAR files uploaded to any server when using KivaroTools?',
        answer:
            'No. Your selected file contents are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources.',
    },
    {
        question: 'How does KivaroTools differ from basic header cleaners like Cloudflare HAR Sanitizer?',
        answer:
            'Basic HAR sanitizers only match known header, cookie, and query parameter names (such as Authorization or Cookie) and overwrite them with the static word "[REDACTED]". KivaroTools combines a 7-phase Network Waterfall Analyzer with a 14-Surface Deep Sanitizer that recursively walks nested JSON AST payloads inside postData.text, GraphQL variables, response.content.text, Base64 SAMLResponse XML assertions, URL path tokens, and _webSocketMessages frames—and uses Deterministic Token Pseudonymization ([JWT_TOKEN_01]) so support engineers can still trace session continuity.',
    },
    {
        question: 'What is Deterministic Token Pseudonymization ([JWT_TOKEN_01]) and why do support engineers need it?',
        answer:
            'When troubleshooting an authentication failure across 200 HTTP requests, replacing every cookie and bearer token with the identical string "[REDACTED]" makes it impossible to tell whether Request #45 sent the same token as Request #1 or a newly rotated token. Deterministic Token Pseudonymization maps each unique secret string to a consistent label (such as [JWT_TOKEN_01 (exp: VALID)] or [SESSION_COOKIE_01]) across the entire HAR file while exposing 0 bytes of the actual credential.',
    },
    {
        question: 'What are the 14 internal HAR surfaces inspected and sanitized by the engine?',
        answer:
            'The engine inspects and scrubs: (1) Request & Response Auth Headers, (2) cookies[] arrays AND raw Cookie/Set-Cookie headers, (3) queryString[] arrays AND reconstructed request.url / redirectURL strings, (4) URL path segments containing inline emails or tokens, (5) Recursive JSON AST inside postData.text, (6) URL-encoded and Multipart form parameters, (7) GraphQL mutation/query variables, (8) Response JSON/HTML bodies (response.content.text), (9) JWT tokens across all fields, (10) Base64 SAMLResponse and SAMLRequest XML assertions, (11) WebSocket _webSocketMessages[] frames, (12) 40+ Cloud & SaaS API key prefixes (Stripe, AWS, GitHub, OpenAI, Slack), (13) Financial & Personal PII (Luhn Card PANs, IBANs, SSN, NADRA CNIC, Emails), and (14) Server IPs & _initiator stack URLs.',
    },
    {
        question: 'How do I extract and view a SAML 2.0 SAMLResponse XML assertion from a HAR file?',
        answer:
            'Drop your HAR capture into the workbench and open Tab 4 (JWT, SAML 2.0, GraphQL & WS). The engine automatically locates SAMLRequest and SAMLResponse parameters inside URL queries or application/x-www-form-urlencoded POST bodies, URL-decodes and Base64-decodes the payload, extracts the Issuer, NameID, StatusCode, and validity timestamps, and renders the formatted XML assertion without needing terminal base64 or xmllint commands.',
    },
    {
        question: 'How does the tool detect expired JWT tokens inside a HAR capture?',
        answer:
            'For every JWT (eyJ...) discovered in headers, cookies, URLs, or JSON payloads, decodeJwtToken() Base64URL-decodes the header and payload claims and compares the numeric "exp" (Expiration Time) claim against the exact entry.startedDateTime timestamp recorded when that HTTP request fired—flagging tokens that were already expired at request time (EXPIRED_AT_REQUEST).',
    },
    {
        question: 'How can I shrink a 100 MB+ HAR file so it fits Zendesk, Jira, or GitHub attachment limits?',
        answer:
            'In Tab 3 (14-Surface Sanitizer & Slimmer) or by selecting the "Web Performance & Bloat Slimmer" preset, enable "Strip Base64 Images/Fonts" and "Strip 200 OK Static JS/CSS". This removes bulky static media payloads while preserving 100% of HTTP headers, 7-phase waterfall timings, and 4xx/5xx error response bodies, typically reducing HAR file sizes by 80–95%.',
    },
    {
        question: 'What do the 7 timing phases in the Network Waterfall represent?',
        answer:
            'In the HAR 1.2 specification, each entry’s timings object breaks latency into: (1) blocked (time spent in the browser connection queue), (2) dns (domain name lookup time), (3) connect (TCP three-way handshake), (4) ssl (TLS handshake negotiation), (5) send (transmitting request bytes), (6) wait (Time to First Byte / TTFB waiting for backend processing), and (7) receive (downloading response content bytes).',
    },
    {
        question: 'What automated root-cause diagnostics does the analyzer run?',
        answer:
            'Tab 2 computes a Session Health Score (0–100) and automatically flags: (1) HTTP 4xx/5xx server/client errors and Status 0 network drops, (2) CORS preflight (OPTIONS) failures and missing Access-Control-Allow-Origin headers, (3) HTTP 401/403 authentication cascades and expired JWTs, (4) High-TTFB backend bottlenecks (>= 500 ms) and slow DNS/TLS handshakes, (5) N+1 duplicate API/GraphQL requests, and (6) Uncompressed text/JSON payloads missing Brotli (br) or GZIP.',
    },
    {
        question: 'Can I convert a HAR file into a Grafana k6 load test script or Playwright E2E test?',
        answer:
            'Yes. Open Tab 5 (10-Format Export & HAR Diff) to compile your captured API sequence into a runnable Grafana k6 load test script (.js) or a Playwright API test (.spec.ts) with live credentials automatically replaced by environment variable placeholders (__ENV.AUTH_TOKEN / process.env.TEST_AUTH_TOKEN).',
    },
    {
        question: 'Can I generate an OpenAPI 3.1 (Swagger) specification or Postman Collection from a HAR file?',
        answer:
            'Yes. In Tab 5, select "OpenAPI 3.1 Spec (.json)" or "Postman v2.1 (.json)". The engine groups captured Fetch/XHR endpoints by path and HTTP method, extracts query parameters and response status codes, scrubs sensitive headers, and outputs a valid OpenAPI 3.1.0 document or Postman v2.1 collection.',
    },
    {
        question: 'How does the WebSocket (_webSocketMessages) and GraphQL inspector work?',
        answer:
            'When Chrome DevTools exports a HAR capture containing WebSocket connections (HTTP 101 Switching Protocols), it stores frame traffic inside the custom _webSocketMessages[] array. Our engine extracts every send and receive frame and also parses GraphQL POST bodies into structured operationName, operationType (query/mutation/subscription), query text, and variables.',
    },
    {
        question: 'How does the Live Forensic Self-Test verify that my sanitized HAR file has zero leaks?',
        answer:
            'Immediately after generating the sanitized HAR JSON string in memory, sanitizeHarAndVerify() re-scans the serialized output string for every selected secret value and asserts that 0 secret strings remain anywhere in the output file, producing a downloadable SHA-256 Sanitization Audit Certificate (.json).',
    },
    {
        question: 'Can I compare two HAR files side-by-side to find latency regressions?',
        answer:
            'Yes. In Tab 5, click "Upload 2nd .HAR to Compare" to run compareHarFiles() between your baseline capture and a second capture, comparing total request count delta, failed request delta, P95 TTFB delta, transfer size delta, and endpoint-by-endpoint regressions.',
    },
    {
        question: 'How do I record a HAR file in Chrome, Edge, Firefox, or Safari?',
        answer:
            'Open your browser Developer Tools (F12 or Ctrl+Shift+I / Cmd+Option+I), switch to the Network tab, check "Preserve log", reproduce the issue on the page, and click the Export HAR (downward arrow) icon—or right-click any request in the network table and choose "Save all as HAR with content".',
    },
];

export default function HarAnalyzerSeo() {
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: HAR_ANALYZER_FAQS.map((faq) => ({
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
        name: 'How to Analyze, Debug, and Sanitize a HAR File Online in Your Browser',
        description:
            'Step-by-step guide to visualizing 7-phase HTTP waterfalls, diagnosing CORS/502/TTFB bottlenecks, decoding SAML 2.0 & JWT tokens, scrubbing all 14 secret surfaces, and exporting to k6, Playwright, or OpenAPI 3.1.',
        step: [
            {
                '@type': 'HowToStep',
                position: 1,
                name: 'Load Your .HAR File or Try a 1-Click Sample Capture',
                text: 'Drag and drop a local .har file (up to 250 MB) from Chrome, Edge, Firefox, Safari, Charles, or Fiddler into the browser dropzone, or click one of the 3 built-in sample HAR captures.',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Inspect the 7-Phase Network Waterfall & Root-Cause Diagnostics',
                text: 'Filter requests by status code, resource type, or latency in Tab 1, and review automated root-cause alerts (HTTP 4xx/5xx/0, CORS preflight blocks, TTFB spikes, N+1 duplicate calls) in Tab 2.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Sanitize All 14 Secret Surfaces & Slim Bloated Response Bodies',
                text: 'Select a workflow preset (such as Support Ticket Safe) in Tab 3 to scrub cookies, Bearer JWTs, API keys, JSON POST passwords, and SAML assertions using deterministic tokens ([JWT_TOKEN_01]).',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Verify Zero Leaks & Export to .HAR, k6, Playwright, OpenAPI, or Excel',
                text: 'Confirm 0 leaked secrets in the Forensic Self-Test in Tab 5 and download your sanitized .har file, SHA-256 Certificate (.json), Grafana k6 script, Playwright test, OpenAPI 3.1 spec, or Excel (.xlsx) network log.',
            },
        ],
    };

    return (
        <article className="mt-16 w-full min-w-0 max-w-full overflow-x-hidden space-y-12 text-slate-700 dark:text-slate-300">
            {/* Structured Data Scripts (FAQPage & HowTo for Rich Snippets & AI Overviews) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />

            {/* ============================================================================
          SECTION 1: EXECUTIVE OVERVIEW & CLIENT-SIDE HAR ARCHITECTURE
          ============================================================================ */}
            <section
                aria-labelledby="har-analyzer-architecture-overview"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2
                        id="har-analyzer-architecture-overview"
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
                    >
                        Client-Side HAR File Analyzer, 7-Phase Waterfall Inspector &amp; 14-Surface Deep Secret Sanitizer
                    </h2>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shrink-0">
                        <Sparkles className="h-3.5 w-3.5" />
                        Web Worker + 14-Surface Sanitizer
                    </span>
                </div>

                <p className="mt-3 w-full text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Open, visualize, diagnose, and sanitize <strong>HTTP Archive (<code>.har</code> v1.2)</strong> network captures
                    from Chrome, Edge, Firefox, Safari, Charles Proxy, Fiddler, and Playwright directly in your browser via a
                    background Web Worker. Scrub live session cookies, <code>Authorization: Bearer</code> JWTs, Base64{' '}
                    <code>SAMLResponse</code> assertions, GraphQL variables, and JSON POST secrets across{' '}
                    <strong>14 internal HAR surfaces</strong>—and convert traces into <strong>Grafana k6</strong>,{' '}
                    <strong>Playwright</strong>, <strong>OpenAPI 3.1</strong>, <strong>Postman v2.1</strong>, or{' '}
                    <strong>Excel (<code>.xlsx</code>)</strong>.
                </p>

                <blockquote className="p-4 my-6 bg-blue-50/80 border-l-4 border-blue-600 rounded-r-xl dark:bg-slate-800/80 not-italic">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
                        <strong>Local Browser Processing &amp; Privacy Disclosure:</strong> Your selected file contents are processed
                        locally in your browser and are not uploaded to KivaroTools servers. The website may still load general
                        analytics or other third-party website resources.
                    </p>
                </blockquote>

                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    <p>
                        Whenever a production web application fails—whether an e-commerce checkout returns <code>502 Bad Gateway</code>,
                        an enterprise Single Sign-On (SSO) login loops between <strong>Okta / Entra ID / Auth0</strong> and a service
                        provider, or a cross-origin API call fails with a <code>CORS</code> preflight error—support and engineering
                        teams ask for a <strong>HAR (<code>.har</code>) file</strong>. However, sharing a raw HAR file is one of the
                        most severe security risks in modern DevOps. Because a HAR file records every HTTP header, cookie, query
                        parameter, and request/response body sent during the session, an unsanitized HAR file acts as a complete
                        session-hijacking kit. In the widely publicized enterprise support system breaches, threat actors extracted
                        live session cookies and bearer tokens from customer-uploaded HAR files to impersonate administrator sessions.
                    </p>
                    <p>
                        Existing tools force developers to choose between two incomplete options: <strong>online waterfall viewers</strong>{' '}
                        that visualize timings but perform zero secret sanitization, or <strong>basic header cleaners</strong> that
                        only match top-level header names while leaving passwords inside nested JSON <code>postData.text</code>,
                        GraphQL <code>variables</code>, server response bodies (<code>response.content.text</code>), Base64{' '}
                        <code>SAMLResponse</code> XML assertions, and <code>_webSocketMessages</code> frames completely exposed.
                        KivaroTools unifies a <strong>7-phase interactive waterfall analyzer</strong>, an{' '}
                        <strong>automated root-cause bottleneck engine</strong>, a <strong>14-surface deep AST sanitizer</strong>{' '}
                        with deterministic token pseudonymization (<code>[JWT_TOKEN_01]</code>), and a{' '}
                        <strong>10-format DevOps code generator</strong> inside a single local-first workbench.
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            <Activity className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            7-Phase Waterfall &amp; Root-Cause AI-Free Diagnostics
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Visualizes <code>blocked</code>, <code>dns</code>, <code>connect</code>, <code>ssl</code>,{' '}
                            <code>send</code>, <code>wait</code> (TTFB), and <code>receive</code> timings and automatically flags
                            CORS blocks, N+1 duplicate calls, and expired JWTs.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            14-Surface Deep AST Sanitizer &amp; Slimmer
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Recursively scrubs headers, synced <code>cookies[]</code>, URLs, JSON POST bodies, GraphQL variables,
                            response bodies, SAML XML, and WebSocket frames while shrinking bloated HARs by up to 85%+.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                            <Code2 className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            10-Format DevOps &amp; QA Code Generator
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Exports sanitized <code>.har</code> files, SHA-256 Audit Certificates, Grafana <code>k6</code> scripts,{' '}
                            <code>Playwright</code> tests, <code>OpenAPI 3.1</code> specs, <code>Postman v2.1</code> collections, and{' '}
                            <code>.xlsx</code> logs.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 2: COMPLETE INTERNAL WORKING STRUCTURE (HOW THE ENGINE WORKS)
          ============================================================================ */}
            <section
                aria-labelledby="har-analyzer-working-structure"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2.5 mb-2">
                    <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="har-analyzer-working-structure"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Complete Working Structure: How the Client-Side HAR Engine Works
                    </h2>
                </div>
                <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    When you load a <code>.har</code> file into the studio (up to the <code>250 MB</code> input safeguard and{' '}
                    <code>100,000</code> entries), captures up to <code>8 MB</code> execute synchronously on the main thread in
                    under <code>5 ms</code>, while larger captures run in a background Web Worker (with automatic main-thread
                    fallback) through a 5-stage analysis and sanitization pipeline in <code>lib/harAnalyzerEngine.ts</code>:
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                            1
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            HAR 1.2 Stream &amp; Timing Normalization
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Computes the input SHA-256 digest, parses <code>log.pages</code> and <code>log.entries</code>, normalizes
                            7-phase timing offsets (clamping negative <code>-1</code> markers), and classifies 1st-party vs. 3rd-party
                            hosts.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                            2
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Protocol &amp; Auth Flow Extraction
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Decodes Base64URL <strong>JWTs</strong> (auditing <code>exp</code> against{' '}
                            <code>entry.startedDateTime</code>), Base64 <strong>SAML 2.0 XML</strong> assertions, OAuth2 redirect
                            chains, GraphQL <code>query</code>/<code>variables</code>, and <code>_webSocketMessages</code> frames.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
                            3
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            14-Surface Deep Secret &amp; PII Scanner
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Recursively walks headers, cookies, query strings, URL paths, JSON AST request/response bodies, and
                            WebSocket frames using 40+ cloud API key signatures plus Luhn Card PAN and ISO 13616 IBAN checksums.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white">
                            4
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Root-Cause &amp; Bottleneck Diagnostics
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Evaluates session health across HTTP <code>4xx/5xx/0</code> errors, CORS preflight blocks, token expiry
                            cascades, TTFB server spikes, N+1 duplicate fetches, and missing Brotli/GZIP compression.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                            5
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Deterministic Scrub, Slim &amp; Verify
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Reconstructs a valid HAR 1.2 JSON container with deterministic tokens (<code>[JWT_TOKEN_01]</code>),
                            strips optional static media bloat, verifies <code>0</code> leaked secrets, and compiles 10 export formats.
                        </p>
                    </div>
                </div>

                {/* Deep Dive Subsections */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/40 dark:bg-slate-800/20 space-y-2 min-w-0">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Why Shallow Header Cleaners Still Leak Session Cookies &amp; JSON Secrets
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            In a HAR 1.2 file, cookies and query parameters are stored twice: once as parsed arrays (
                            <code>request.cookies[]</code> and <code>request.queryString[]</code>) and a second time inside the raw{' '}
                            <code>Cookie</code> header string and <code>request.url</code> string. Furthermore, modern SPAs transmit
                            credentials inside nested JSON POST bodies (<code>postData.text</code>), GraphQL <code>variables</code>,
                            and JSON responses (<code>response.content.text</code>). Our engine synchronizes and scrubs all 14
                            locations simultaneously while preserving valid JSON syntax.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/40 dark:bg-slate-800/20 space-y-2 min-w-0">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            How Deterministic Token Pseudonymization Preserves Support Debugging
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            When a user experiences a sudden <code>401 Unauthorized</code> error mid-session, support engineers need
                            to know whether the browser sent the original token, an expired token, or a newly refreshed token. By
                            mapping each distinct secret to a deterministic identifier—such as{' '}
                            <code>[JWT_TOKEN_01 (exp: VALID)]</code> vs. <code>[JWT_TOKEN_02 (exp: EXPIRED_AT_REQUEST)]</code>—your
                            support team can diagnose the exact token rotation bug without ever seeing the raw token string.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 2B: COMPLETE STEP-BY-STEP USER GUIDE (HOW TO USE EVERY FEATURE)
          ============================================================================ */}
            <section
                aria-labelledby="har-analyzer-complete-user-guide"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
            >
                <div>
                    <h2
                        id="har-analyzer-complete-user-guide"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Complete Step-by-Step User Guide: How to Inspect, Diagnose, Sanitize &amp; Convert HAR Files
                    </h2>
                    <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Follow this walkthrough to analyze network bottlenecks, decode SAML/JWT payloads, scrub sensitive data, and
                        generate DevOps test scripts:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Step 1: Load Your .HAR File or Try a 1-Click Sample Capture
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Drag and drop a local <code>.har</code> or <code>.json</code> network capture (up to <code>250 MB</code>)
                            into the top upload zone—or click one of the three built-in sample captures (
                            <strong>E-Commerce 502 &amp; CORS Incident</strong>, <strong>Enterprise SAML 2.0 &amp; OIDC Trace</strong>,
                            or <strong>GraphQL + WebSocket Trading Stream</strong>). The 6-card Telemetry Bar immediately summarizes
                            total and failed requests, session health score, Peak/P95 TTFB, detected secrets across 14 surfaces, and
                            parse latency.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Step 2: Filter the 7-Phase Waterfall &amp; Audit Root-Cause Diagnostics
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            In Tab 1 (<strong>Waterfall &amp; Request Inspector</strong>), filter by resource type (
                            <code>Fetch/XHR</code>, <code>GraphQL</code>, <code>WebSocket</code>, <code>3rd-Party</code>) or status (
                            <code>Failed Only</code>, <code>Slow &gt;500ms</code>) and click any row to inspect its 7 timing phases,
                            headers, and payloads. Switch to Tab 2 (<strong>Root-Cause Diagnostics</strong>) to view automated cards
                            for HTTP <code>4xx/5xx/0</code> errors, CORS preflight blocks, expired JWTs, TTFB spikes, and N+1
                            duplicate API calls.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Step 3: Configure 14-Surface Sanitization, Slimmer &amp; Protocol Inspection
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Choose one of the <strong>6 Workflow Presets</strong> (such as <code>Support Ticket Safe</code> or{' '}
                            <code>Web Performance &amp; Bloat Slimmer</code>). In Tab 3 (
                            <strong>14-Surface Sanitizer &amp; Slimmer</strong>), review the 14-Surface X-Ray Matrix, toggle Base64
                            media/static body stripping, or add custom secret strings. Open Tab 4 (
                            <strong>JWT, SAML 2.0, GraphQL &amp; WS</strong>) to inspect decoded JWT claims, formatted SAML XML
                            assertions, GraphQL operations, and WebSocket frames.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Step 4: Verify Forensic Self-Test, Compare HAR Diffs &amp; Export 10 Formats
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Open Tab 5 (<strong>10-Format Export &amp; HAR Diff</strong>) to confirm the green{' '}
                            <code>PASSED — 0 / N SECRETS LEAKED</code> forensic badge, download your sanitized <code>.har</code> file,
                            export a native Excel (<code>.xlsx</code>) or CSV network log, copy generated{' '}
                            <strong>Grafana k6</strong>, <strong>Playwright</strong>, <strong>OpenAPI 3.1</strong>,{' '}
                            <strong>Postman v2.1</strong>, or <strong>Markdown Bug Report</strong> code, or upload a second{' '}
                            <code>.har</code> file to compare latency regressions.
                        </p>
                    </div>
                </div>

                {/* Verified Compatibility Matrix */}
                <div className="pt-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                        Verified HAR Producer, Protocol &amp; Secret Detector Compatibility Matrix
                    </h3>
                    <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="min-w-[680px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                                <tr>
                                    <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Subsystem Dimension</th>
                                    <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Supported Formats &amp; Protocols (In-Browser)</th>
                                    <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Engine Validators &amp; Decoders</th>
                                    <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Disclosed Boundaries</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                <tr>
                                    <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                        HAR Producers &amp; Versions
                                    </th>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        HAR <code>1.1</code> &amp; <code>1.2</code> from Chrome, Edge, Firefox, Safari, Charles Proxy,
                                        Fiddler, Proxyman, mitmproxy, Requestly &amp; Playwright
                                    </td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        UTF-8 &amp; UTF-8 BOM JSON parser with <code>250 MB</code> / <code>100,000</code> entry safeguards
                                    </td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        Binary <code>.saz</code> (Fiddler archive) or <code>.chls</code> files must be exported as{' '}
                                        <code>.har</code> first
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                        Auth &amp; Identity Protocols
                                    </th>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        RFC 7519 <code>JWT</code>, <code>SAML 2.0</code> (<code>SAMLRequest</code> /{' '}
                                        <code>SAMLResponse</code>), <code>OAuth 2.0 / OIDC</code> (PKCE, <code>code</code>,{' '}
                                        <code>state</code>), Basic &amp; Bearer Auth
                                    </td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        <code>decodeJwtToken()</code> (with request-timestamp expiry check) &amp;{' '}
                                        <code>decodeSamlBase64Xml()</code>
                                    </td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        Deflate-compressed SAML Redirect binding queries without raw XML tags are scrubbed as opaque tokens
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                        API &amp; Realtime Transports
                                    </th>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        <code>HTTP/1.1</code>, <code>HTTP/2 (h2)</code>, <code>HTTP/3 (h3)</code>, <code>REST JSON</code>,{' '}
                                        <code>GraphQL</code> (Queries/Mutations), <code>WebSockets</code> (<code>_webSocketMessages</code>)
                                    </td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        Recursive JSON AST walker, GraphQL operation/variables splitter &amp; WebSocket frame scanner
                                    </td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        Binary Protobuf/gRPC-Web payloads are preserved or stripped as opaque Base64 blobs
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 3: REAL PRACTICAL EXAMPLES (INPUT VS. OUTPUT SHOWCASES)
          ============================================================================ */}
            <section
                aria-labelledby="har-analyzer-real-examples"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-8"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Terminal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h2
                            id="har-analyzer-real-examples"
                            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                        >
                            Real-World Examples: 14-Surface Deep HAR Scrubbing, SAML Decoding &amp; k6 Generation
                        </h2>
                    </div>
                    <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Examine three production scenarios showing how KivaroTools scrubs nested JSON secrets, decodes SAML 2.0
                        assertions, and converts HAR captures into load-testing scripts:
                    </p>
                </div>

                {/* Example 1 */}
                <div className="space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-xs font-mono">Example 1</span>
                        <span>
                            Raw Checkout HAR Entry (Leaking JWT, Stripe Key &amp; Card PAN) vs. Deterministic Sanitized Output
                        </span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                            <div className="text-rose-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                BEFORE: Raw HAR Entry (Unsanitized Support Upload)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`{
  "serverIPAddress": "10.24.88.14",
  "request": {
    "method": "POST",
    "url": "https://payments.kivaro-commerce.io/v1/charge",
    "headers": [
      { "name": "Authorization", "value": "Bearer eyJhbGciOiJIUzI1NiIs..." },
      { "name": "X-API-Key", "value": "sk-live-mock-api-key-sample-redacted" }
    ],
    "postData": {
      "text": "{\\"card_pan\\":\\"4532-0151-1283-0366\\",\\"password\\":\\"Secret!2026\\"}"
    }
  }
}`}</pre>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                            <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                AFTER: Sanitized HAR Entry (Valid JSON AST + Deterministic Tokens)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`{
  "serverIPAddress": "[NET_ADDR_01]",
  "request": {
    "method": "POST",
    "url": "https://payments.kivaro-commerce.io/v1/charge",
    "headers": [
      { "name": "Authorization", "value": "Bearer [JWT_TOKEN_01 (exp:VALID)]" },
      { "name": "X-API-Key", "value": "[API_KEY_02]" }
    ],
    "postData": {
      "text": "{\\"card_pan\\":\\"[FIN_PII_02]\\",\\"password\\":\\"[BODY_SECRET_01]\\"}"
    }
  }
}`}</pre>
                        </div>
                    </div>
                </div>

                {/* Example 2 */}
                <div className="space-y-3 pt-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-xs font-mono">Example 2</span>
                        <span>
                            Base64 SAMLResponse Form Parameter in HAR → Decoded SAML 2.0 XML &amp; Expired JWT Diagnostic
                        </span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                            <div className="text-indigo-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                Decoded SAML 2.0 XML Assertion (Automatic Base64 Decode)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`Direction:   SAMLResponse (Entry #2 POST /sso/saml/acs)
Issuer:      https://idp.okta-enterprise.example/app/exk99182
NameID:      ayesha.siddiqui@corp-tech.io
StatusCode:  urn:oasis:names:tc:SAML:2.0:status:Success
Validity:    2026-10-30T10:55:00Z -> 2026-10-30T11:05:00Z`}</pre>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-amber-300 overflow-x-auto">
                            <div className="text-amber-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                Automated JWT Request-Timestamp Expiry Check (Entry #3)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`Token ID:          [JWT_TOKEN_02 (exp:EXPIRED_AT_REQUEST)]
Request Fired At:  2026-10-30T11:00:00.320Z
Token "exp" Claim: 2020-09-13T13:26:40.000Z (1600003600)
Diagnostic Alert:  JWT was already expired when Entry #3 fired -> HTTP 401`}</pre>
                        </div>
                    </div>
                </div>

                {/* Example 3 */}
                <div className="space-y-3 pt-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-mono">Example 3</span>
                        <span>
                            HAR Capture → Sanitized Grafana k6 Load Test Script (.js) &amp; OpenAPI 3.1 Specification (.json)
                        </span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                            <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                Generated Grafana k6 Load Test Script (Secrets Replaced with __ENV)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: { http_req_duration: ['p(95)<800'] },
};

export default function () {
  const res = http.get("https://shop.kivaro-commerce.io/api/v1/cart/items", {
    headers: { "Authorization": "Bearer \${__ENV.AUTH_TOKEN || 'REDACTED'}" }
  });
  check(res, { 'GET /api/v1/cart/items status is 200': (r) => r.status === 200 });
  sleep(1);
}`}</pre>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-blue-300 overflow-x-auto">
                            <div className="text-blue-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                Auto-Generated OpenAPI 3.1.0 Specification (.json)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`{
  "openapi": "3.1.0",
  "info": {
    "title": "Sanitized API Specification (shop.kivaro-commerce.io)",
    "version": "1.0.0"
  },
  "paths": {
    "/api/v1/cart/items": {
      "get": {
        "summary": "GET /api/v1/cart/items",
        "responses": { "200": { "description": "OK" } }
      }
    }
  }
}`}</pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 4: TECHNICAL SPECIFICATION: 14-SURFACE HAR SANITIZATION MATRIX
          ============================================================================ */}
            <section
                aria-labelledby="har-analyzer-surface-comparison"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="har-analyzer-surface-comparison"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Technical Specification: 14-Surface Deep HAR Secret &amp; PII Sanitization Matrix
                </h2>
                <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Inspect all 14 internal JSON paths inside a HAR 1.2 file where session tokens, API keys, and personal data
                    leak, and how <code>sanitizeHarAndVerify()</code> cleans each surface:
                </p>

                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[720px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">#</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">
                                    HAR 1.2 Internal Surface
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-rose-600 dark:text-rose-400">
                                    Security &amp; Session Hijacking Risk
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400">
                                    KivaroTools Sanitization Mechanism
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {[
                                ['#1', 'Auth & Security Headers (headers[])', 'Exposes Authorization Bearer/Basic tokens, X-API-Key, X-CSRF-Token, and AWS security headers.', 'Matches 60+ sensitive header names and replaces values with deterministic tokens.'],
                                ['#2', 'Session Cookies (cookies[] & Cookie / Set-Cookie)', 'Allows immediate session replay and account takeover if raw Cookie strings or arrays remain.', 'Synchronizes and scrubs both cookies[] objects and raw semicolon-delimited Cookie headers.'],
                                ['#3', 'URL Query Strings (queryString[] & request.url)', 'Leaks OAuth2 code=, state=, access_token=, api_key=, and presigned URL signatures.', 'Scrubs queryString[] entries and reconstructs request.url and response.redirectURL.'],
                                ['#4', 'URL Path Segments (pathname)', 'REST paths often embed user emails, account numbers, or inline verification JWTs.', 'Scans path segments for inline emails, JWTs, Luhn cards, and IBANs.'],
                                ['#5', 'POST / PUT JSON Request Bodies (postData.text)', 'Login and checkout payloads contain plaintext passwords, MFA codes, and CVVs inside JSON.', 'Walks the recursive JSON AST to scrub sensitive keys while preserving valid JSON syntax.'],
                                ['#6', 'Form-Urlencoded & Multipart Params (params[])', 'HTML form submissions store username, password, client_secret, and SAML payloads.', 'Scrubs both postData.params[] objects and raw URL-encoded form strings.'],
                                ['#7', 'GraphQL Variables (postData.text.variables)', 'GraphQL mutations pass API keys, passwords, and IBANs inside the variables object.', 'Preserves operationName and query structure while scrubbing sensitive variable values.'],
                                ['#8', 'Response Bodies (response.content.text)', 'Server responses return newly minted access_tokens, customer SSNs, IBANs, and emails.', 'Recursively scrubs JSON/text response payloads or strips bloated static bodies.'],
                                ['#9', 'JSON Web Tokens (eyJ... Across All Surfaces)', 'JWTs appear inside headers, cookies, URLs, POST bodies, and WebSocket init payloads.', 'Decodes header/payload for expiry audit and replaces JWTs with [JWT_TOKEN_01].'],
                                ['#10', 'SAML 2.0 Base64 XML (SAMLResponse / SAMLRequest)', 'Base64 XML assertions expose NameID emails, user attributes, and XML signatures.', 'Decodes XML in Tab 4 and scrubs SAML parameters in the exported HAR.'],
                                ['#11', 'WebSocket Frames (_webSocketMessages[])', 'Real-time Socket.io and GraphQL subscription frames transmit auth tokens over WebSockets.', 'Scans and scrubs every send and receive frame inside _webSocketMessages[].'],
                                ['#12', 'Cloud & SaaS API Keys (40+ Signatures)', 'Hardcoded Stripe (sk_live_), AWS (AKIA), GitHub (ghp_), OpenAI (sk-), and Slack (xoxb-) keys.', 'High-precision prefix and structure matchers scrub keys across all text fields.'],
                                ['#13', 'Financial & National PII (Cards, IBAN, SSN, CNIC)', 'Payment and KYC traces leak credit cards, bank IBANs, US SSNs, and NADRA CNICs.', 'Runs Modulo-10 Luhn, ISO 13616 Mod-97 IBAN, SSN, and CNIC checksum validators.'],
                                ['#14', 'Server IPs (serverIPAddress) & _initiator URLs', 'Exposes internal RFC 1918 private network IPs (10.x.x.x) and initiator query tokens.', 'Anonymizes internal IPs and scrubs query strings inside _initiator stack traces.'],
                            ].map(([num, surf, risk, action]) => (
                                <tr key={num}>
                                    <th scope="row" className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">
                                        {num}
                                    </th>
                                    <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">{surf}</td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">{risk}</td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">{action}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 5: COMPETITOR COMPARISON MATRIX (KIVAROTOOLS VS MARKET ALTERNATIVES)
          ============================================================================ */}
            <section
                aria-labelledby="har-analyzer-competitor-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="har-analyzer-competitor-matrix"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Architectural Scope &amp; Feature Matrix: KivaroTools vs. Common HAR Workflows
                </h2>
                <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Compare how KivaroTools unifies waterfall analysis, deep AST sanitization, SAML/JWT inspection, and DevOps
                    code generation compared to standalone viewers and header cleaners:
                </p>

                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Capability / Feature</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">
                                    KivaroTools (Analyzer + 14-Surface Sanitizer)
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Basic Online HAR Viewers
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Standalone Header Sanitizers
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    CLI Converters (har-to-k6)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    7-Phase Network Waterfall &amp; Filtering
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Yes — Interactive 7-Phase Timeline + Virtualized Scroll
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Yes (Often freezes on &gt;50 MB)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    14-Surface Deep Secret &amp; JSON AST Scrubbing
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Headers, Cookies, URLs, JSON Bodies, GraphQL, SAML, WS &amp; Luhn/IBAN
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400">
                                    None (Leaves live cookies exposed)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">
                                    Shallow key-name match only (Misses JSON/WS bodies)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400">
                                    Hardcodes live tokens into script
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Deterministic Token Pseudonymization
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Yes — [JWT_TOKEN_01 (exp:VALID)] Preserves Session Continuity
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Static &quot;REDACTED&quot; only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    SAML 2.0 XML &amp; JWT Expiry Inspector
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Automatic Base64 SAML XML Decoder + Request-Time JWT Expiry Audit
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Manual Base64 copy</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    DevOps Code &amp; Spec Generation
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    10 Targets (k6, Playwright, OpenAPI 3.1, Postman v2.1, cURL, .XLSX, .CSV)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">cURL copy only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">.har export only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Single CLI target only</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 6: SUPPORTED EXPORT DELIVERABLES & CODE TARGETS TABLE
          ============================================================================ */}
            <section
                aria-labelledby="har-analyzer-export-targets"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h2
                        id="har-analyzer-export-targets"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Supported Export Formats, Load Test Scripts &amp; API Specifications
                    </h2>
                </div>
                <div className="w-full mt-4 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[680px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Target Deliverable</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Extension / Format</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Key Engineering Features</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Primary Workflow</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Sanitized &amp; Slimmed HAR 1.2
                                </th>
                                <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
                                    _sanitized_verified.har
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    14-surface scrubbed HAR 1.2 JSON with optional Base64/static bloat stripping
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Zendesk, Okta, Auth0, Cloudflare, Jira &amp; vendor support tickets
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Grafana k6 Load Test Script
                                </th>
                                <td className="p-3 font-mono text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700">
                                    .js (k6 ES6 Module)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Includes <code>options.thresholds</code>, status assertions (<code>check()</code>), and{' '}
                                    <code>__ENV.AUTH_TOKEN</code> injection
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Performance &amp; stress testing API sequences in CI/CD
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Playwright E2E API Test
                                </th>
                                <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                                    .spec.ts (@playwright/test)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Generates <code>request.get/post</code> assertions with <code>process.env.TEST_AUTH_TOKEN</code>
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Automated API regression testing
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    OpenAPI 3.1.0 &amp; Postman v2.1
                                </th>
                                <td className="p-3 font-mono text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700">
                                    .json (OpenAPI / Postman)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Infers endpoint paths, query parameters, methods, and status codes with scrubbed headers
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    API documentation &amp; Postman/Insomnia/Bruno import
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Native Excel &amp; CSV Network Log
                                </th>
                                <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
                                    .xlsx / .csv (UTF-8 BOM)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    PKZIP OpenXML workbook &amp; RFC 4180 CSV with CWE-1236 spreadsheet formula guard
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Executive latency audits &amp; spreadsheet filtering
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    SHA-256 Certificate &amp; Incident Markdown
                                </th>
                                <td className="p-3 font-mono text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700">
                                    .json / .md
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Input/output SHA-256 hashes, 14-surface pass proof, and formatted GitHub/Jira bug report table
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    SecOps compliance sign-off &amp; engineering post-mortems
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 7: TROUBLESHOOTING & NETWORK DEBUGGING GUIDE
          ============================================================================ */}
            <section
                aria-labelledby="har-analyzer-troubleshooting-guide"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="har-analyzer-troubleshooting-guide"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Common HAR Debugging Scenarios, Network Errors &amp; Fixes
                </h2>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            1. HTTP Status 0 (Blocked / CORS / Network Drop)
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Cause:</strong> Status <code>0</code> in a HAR file means the browser never received a valid HTTP
                            response—typically caused by a failed CORS <code>OPTIONS</code> preflight, an ad-blocker/extension, or an
                            aborted TCP connection.
                            <br />
                            <strong>Fix:</strong> Check Tab 2 for <code>CORS_PREFLIGHT_FAILURE</code> alerts and verify whether the
                            preceding <code>OPTIONS</code> request returned <code>Access-Control-Allow-Origin</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            2. High &quot;Wait (TTFB)&quot; vs. High &quot;Receive&quot; Time
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Cause:</strong> A green <code>wait (TTFB)</code> bar over <code>500 ms</code> indicates slow
                            backend SQL queries or upstream microservice calls, whereas a long blue <code>receive</code> bar indicates
                            an oversized, uncompressed payload or slow client bandwidth.
                            <br />
                            <strong>Fix:</strong> Check Tab 2 to see if the response is missing <code>Content-Encoding: br/gzip</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            3. Missing Cookies or Authorization Headers in Chrome 130+ HARs
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Cause:</strong> Recent Chrome versions omit <code>Cookie</code> and <code>Authorization</code>{' '}
                            headers by default unless you explicitly choose <strong>Export HAR (with sensitive data)</strong> in
                            DevTools settings.
                            <br />
                            <strong>Fix:</strong> If you need to debug an auth/cookie bug, export with sensitive data enabled in
                            DevTools, then run the file through KivaroTools&apos; <strong>Support Ticket Safe</strong> preset to
                            pseudonymize tokens into <code>[JWT_TOKEN_01]</code> before sharing.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            4. SAML 2.0 Login Loops &amp; Clock Skew Rejections
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Cause:</strong> SAML assertions fail when the Service Provider clock is outside the IdP&apos;s{' '}
                            <code>NotBefore</code> / <code>NotOnOrAfter</code> window or when <code>NameID</code> format mismatches.
                            <br />
                            <strong>Fix:</strong> Open Tab 4 to inspect the decoded SAML XML assertion&apos;s exact validity window
                            and <code>StatusCode</code>.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 8: SEARCH INTENT & SUPPORTED WORKFLOW COVERAGE (32 TARGET KEYWORDS)
          ============================================================================ */}
            <section
                aria-labelledby="har-analyzer-workflow-coverage"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="har-analyzer-workflow-coverage"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Supported Network Analysis, HAR Sanitization &amp; DevOps Workflows
                    </h2>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            HAR Waterfall &amp; Bottleneck Analysis
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>HAR file analyzer and viewer online free</li>
                            <li>Open and inspect HAR file waterfall online</li>
                            <li>Find slow TTFB and network bottlenecks in HAR</li>
                            <li>Diagnose CORS preflight errors in HAR file</li>
                            <li>Detect N+1 duplicate API requests in HAR</li>
                            <li>Compare two HAR files waterfall diff online</li>
                            <li>Analyze HTTP/3 and HTTP/2 timing phases in HAR</li>
                            <li>Offline browser HAR viewer for large files</li>
                            <li>Shrink and compress large HAR file size</li>
                            <li>Strip Base64 images and bloat from HAR file</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            14-Surface HAR Sanitization &amp; Support Workflows
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>Sanitize HAR file online before sharing</li>
                            <li>Client-side HAR file sanitizer (no upload)</li>
                            <li>Remove cookies and JWT tokens from HAR file</li>
                            <li>Redact passwords and API keys in HAR postData</li>
                            <li>Scrub sensitive response bodies in HAR file</li>
                            <li>HAR file scrubber for Zendesk &amp; Okta support</li>
                            <li>Anonymize HAR file network log for ChatGPT</li>
                            <li>Verify HAR file sanitization zero leaks</li>
                            <li>HAR file SHA-256 sanitization audit report</li>
                            <li>Generate Markdown bug report from HAR file</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            SAML/OAuth Debugging &amp; DevOps Code Generation
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>Debug SAML 2.0 response from HAR file online</li>
                            <li>Extract SAML assertion XML from HAR file</li>
                            <li>Decode JWT bearer tokens in HAR file online</li>
                            <li>Trace OAuth2 and OIDC redirect chain in HAR</li>
                            <li>Inspect WebSocket messages in HAR file online</li>
                            <li>GraphQL query and variables HAR file viewer</li>
                            <li>Convert HAR file to k6 load test script</li>
                            <li>Convert HAR file to OpenAPI 3.1 Swagger spec</li>
                            <li>Convert HAR to Postman collection v2.1 online</li>
                            <li>Generate Playwright test script from HAR file</li>
                            <li>Convert HAR file requests to cURL and fetch</li>
                            <li>Export HAR file network log to Excel (<code>.xlsx</code>)</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 9: FREQUENTLY ASKED QUESTIONS (16 INTERACTIVE ACCORDIONS)
          ============================================================================ */}
            <section
                aria-labelledby="har-analyzer-frequently-asked-questions"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="har-analyzer-frequently-asked-questions"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="space-y-3">
                    {HAR_ANALYZER_FAQS.map((faq, index) => (
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
          SECTION 10: INTERNAL CROSS-LINKING TO RELATED DEVELOPER TOOLS
          ============================================================================ */}
            <section
                aria-labelledby="har-analyzer-related-utilities"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="har-analyzer-related-utilities"
                        className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Related Client-Side Developer, Security &amp; Data Engineering Utilities
                    </h2>
                </div>
                <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed break-words">
                    Continue your API debugging, payload formatting, and document sanitization workflow with our integrated
                    browser tools:
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/developer/parquet-viewer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            Parquet, Avro &amp; Feather Viewer + CSV/XLSX →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect binary lakehouse files locally with 64-bit BigInt safety, 10-dialect SQL DDL, and Excel export.
                        </p>
                    </Link>

                    <Link
                        href="/developer/json-formatter"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            JSON Formatter, Validator &amp; Tree Viewer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Format, repair, and query exported HAR JSON payloads, OpenAPI 3.1 specs, and Postman collections.
                        </p>
                    </Link>

                    <Link
                        href="/developer/json-converter"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            JSON to CSV, Excel (.xlsx), YAML &amp; XML Converter →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Flatten nested API response payloads and convert OpenAPI JSON into YAML or spreadsheets locally.
                        </p>
                    </Link>

                    <Link
                        href="/developer/cron-expression-generator"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            7-Dialect Cron Expression Generator &amp; DST Simulator →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Build, explain, and simulate POSIX, Kubernetes, Quartz, AWS EventBridge, and Jenkins cron schedules across 12 timezones locally.
                        </p>
                    </Link>

                    <Link
                        href="/developer/base64-encoder"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            Base64 Encoder, Decoder &amp; Binary Hex Inspector →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Decode Base64-encoded SAML assertions, HTTP Basic Auth headers, and binary response streams.
                        </p>
                    </Link>

                    <Link
                        href="/developer/regex-tester"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            Regex Tester, Debugger &amp; Code Generator →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Build and benchmark custom token and log-scrubbing regex patterns with a 1,200 ms ReDoS watchdog.
                        </p>
                    </Link>

                    <Link
                        href="/document/pdf-scrubber"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            PDF Bank Statement &amp; Invoice Data Scrubber →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Permanently redact IBANs, Luhn Card PANs, Tax IDs, and all 12 hidden PDF metadata surfaces client-side.
                        </p>
                    </Link>

                    <Link
                        href="/developer/jwt-debugger"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            JWT, PASETO &amp; SAML 2.0 Security Debugger →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Decode and verify JWT (JWS/JWE/SD-JWT), PASETO v1–v4, and SAML 2.0 Deflate/Base64 messages and audit 16 SSO security rules locally.
                        </p>
                    </Link>
                </div>
            </section>
        </article>
    );
}