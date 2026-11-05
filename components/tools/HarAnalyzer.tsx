"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    Activity,
    ShieldCheck,
    ShieldAlert,
    Upload,
    Download,
    Search,
    Filter,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Lock,
    Unlock,
    KeyRound,
    Code2,
    FileSpreadsheet,
    FileCode,
    FileText,
    Sparkles,
    Layers,
    Terminal,
    Cpu,
    Globe,
    Clock,
    Zap,
    GitCompare,
    Copy,
    Check,
    Plus,
    Trash2,
    Sliders,
    Info,
    Eye,
    X,
} from 'lucide-react';

import {
    HAR_ENGINE_VERSION,
    MAX_SAFE_HAR_BYTES,
    parseHarFile,
    applyHarPreset,
    sanitizeHarAndVerify,
    compareHarFiles,
    exportEntryToCurl,
    exportToK6Script,
    exportToPlaywrightTest,
    exportToOpenApiSpecJson,
    exportToPostmanCollectionJson,
    exportToMarkdownBugReport,
    generateHarComplianceCertificateJson,
    exportHarNetworkLogCsv,
    exportHarNetworkLogXlsx,
    generateSampleHarFile,
    createHarWorkerDispatcher,
    isHarCancelledError,
    type HarWorkflowPresetId,
    type HarRedactionMode,
    type HarResourceType,
    type HarEntryModel,
    type DetectedHarSecret,
    type HarParseResult,
    type HarSanitizeOutcome,
    type HarDiffComparisonReport,
    type HarWorkerDispatcher,
} from '@/lib/harAnalyzerEngine';

type HarWorkbenchTab =
    | 'waterfall_grid'
    | 'diagnostics'
    | 'sanitizer_studio'
    | 'protocol_inspector'
    | 'export_and_diff';

const WORKFLOW_PRESETS: {
    id: HarWorkflowPresetId;
    name: string;
    shortBadge: string;
    description: string;
}[] = [
        {
            id: 'support_ticket_safe',
            name: 'Support Ticket Safe (Zendesk / Okta / Auth0)',
            shortBadge: 'Deterministic [TOKEN_01]',
            description:
                'Scrubs all 14 HAR surfaces (cookies, Bearer JWTs, API keys, passwords, PII) using deterministic tokens ([JWT_TOKEN_01]) so support engineers can trace session continuity with zero credential exposure.',
        },
        {
            id: 'sso_saml_oauth_debug',
            name: 'SSO / SAML 2.0 / OIDC Auth Debugger',
            shortBadge: 'Decode SAML & JWT Exp',
            description:
                'Extracts and decodes Base64 SAMLResponse XML assertions, OAuth2 /authorize & /token steps, and JWT expiry claims while scrubbing live signatures and session cookies.',
        },
        {
            id: 'performance_only_slim',
            name: 'Web Performance & Bloat Slimmer',
            shortBadge: 'Shrink HAR Size 85%+',
            description:
                'Strips bulky Base64 images, fonts, and 200 OK static JS/CSS response bodies while preserving 100% of 7-phase waterfall timings, headers, and 4xx/5xx error payloads.',
        },
        {
            id: 'qa_load_test_replay',
            name: 'QA Load Test & Replay Prep (k6 / Playwright)',
            shortBadge: '{{ENV_PLACEHOLDER}} Mode',
            description:
                'Replaces live production tokens and user PII with environment variable placeholders ({{JWT_TOKEN_01}}) ready for Grafana k6 load scripts and Playwright E2E tests.',
        },
        {
            id: 'ai_llm_har_anonymizer',
            name: 'AI / ChatGPT Network Log Anonymizer',
            shortBadge: 'Anonymize Hosts & IPs',
            description:
                'Tokenizes internal corporate hostnames, server IPs, auth tokens, and customer PII so you can safely paste network logs or Markdown reports into ChatGPT or Claude.',
        },
        {
            id: 'strict_zero_trust_cdr',
            name: 'Strict Zero-Trust Security Audit',
            shortBadge: 'Full 14-Surface Purge',
            description:
                'Maximum sanitization preset: redacts all detected secrets, cookies, query values, IPs, and strips all response bodies across the entire HAR container.',
        },
    ];

const SAMPLE_HAR_FILES: {
    id: 'ecommerce_checkout_incident' | 'sso_saml_oidc_trace' | 'graphql_websocket_stream';
    title: string;
    subtitle: string;
    badge: string;
}[] = [
        {
            id: 'ecommerce_checkout_incident',
            title: 'E-Commerce 502 & CORS Incident',
            subtitle: 'HTTP 502 Bad Gateway, 1,150ms TTFB spike, CORS Preflight block, N+1 GETs, Luhn Visa PAN & Stripe Key',
            badge: '5 Diagnostics • 9 Surfaces',
        },
        {
            id: 'sso_saml_oidc_trace',
            title: 'Enterprise SAML 2.0 & OIDC Trace',
            subtitle: 'Base64 SAMLResponse XML Assertion, OAuth2 /authorize redirect, Valid vs. Expired JWTs & HTTP 401',
            badge: 'SAML XML • Expired JWT',
        },
        {
            id: 'graphql_websocket_stream',
            title: 'GraphQL + WebSocket Trading Stream',
            subtitle: 'GraphQL Mutation variables, 101 Switching Protocols WebSocket _webSocketMessages frames & UK IBAN',
            badge: 'GraphQL • WebSocket Frames',
        },
    ];

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function HarAnalyzer() {
    const [parsed, setParsed] = useState<HarParseResult | null>(null);
    const [activePreset, setActivePreset] = useState<HarWorkflowPresetId>('support_ticket_safe');
    const [activeTab, setActiveTab] = useState<HarWorkbenchTab>('waterfall_grid');
    const [executionMode, setExecutionMode] = useState<'worker' | 'main-thread-fallback'>('worker');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [statusBanner, setStatusBanner] = useState<string | null>(null);

    // Waterfall & Request Grid Filters
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [resourceFilter, setResourceFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [selectedEntryIndex, setSelectedEntryIndex] = useState<number | null>(0);
    const [gridViewMode, setGridViewMode] = useState<'paginated' | 'virtualized'>('paginated');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 25;

    // Sanitizer & Slimmer Controls
    const [redactionMode, setRedactionMode] = useState<HarRedactionMode>('deterministic_token');
    const [stripBase64Media, setStripBase64Media] = useState<boolean>(true);
    const [stripStatic200Bodies, setStripStatic200Bodies] = useState<boolean>(false);
    const [removeAllResponseBodies, setRemoveAllResponseBodies] = useState<boolean>(false);
    const [anonymizeInternalIps, setAnonymizeInternalIps] = useState<boolean>(true);
    const [anonymizeHostnames, setAnonymizeHostnames] = useState<boolean>(false);
    const [secretSearch, setSecretSearch] = useState<string>('');
    const [secretCategoryFilter, setSecretCategoryFilter] = useState<string>('ALL');
    const [customKeywordInput, setCustomKeywordInput] = useState<string>('');
    const [customKeywords, setCustomKeywords] = useState<string[]>([]);

    // Export & Diff Studio State
    const [sanitizeOutcome, setSanitizeOutcome] = useState<HarSanitizeOutcome | null>(null);
    const [codePreviewFormat, setCodePreviewFormat] = useState<
        'k6' | 'playwright' | 'openapi' | 'postman' | 'markdown' | 'certificate' | 'curl'
    >('k6');
    const [copiedCode, setCopiedCode] = useState<boolean>(false);
    const [diffReport, setDiffReport] = useState<HarDiffComparisonReport | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const diffInputRef = useRef<HTMLInputElement | null>(null);
    const dispatcherRef = useRef<HarWorkerDispatcher | null>(null);

    useEffect(() => {
        dispatcherRef.current = createHarWorkerDispatcher();
        return () => {
            dispatcherRef.current?.dispose();
        };
    }, []);

    // Recompute sanitized HAR & live forensic verification whenever parsed state or options change
    useEffect(() => {
        if (!parsed) {
            setSanitizeOutcome(null);
            return;
        }
        try {
            const outcome = sanitizeHarAndVerify(parsed, {
                redactionMode,
                stripBase64Media,
                stripStatic200Bodies,
                removeAllResponseBodies,
                anonymizeInternalIps,
                anonymizeHostnames,
                customSecretKeywords: customKeywords,
            });
            setSanitizeOutcome(outcome);
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : String(err));
        }
    }, [
        parsed,
        redactionMode,
        stripBase64Media,
        stripStatic200Bodies,
        removeAllResponseBodies,
        anonymizeInternalIps,
        anonymizeHostnames,
        customKeywords,
    ]);

    const handleLoadBytes = useCallback(
        async (bytes: Uint8Array, fileName: string, presetToApply: HarWorkflowPresetId) => {
            setIsLoading(true);
            setErrorMessage(null);
            setStatusBanner(null);
            setCurrentPage(1);
            setDiffReport(null);

            try {
                if (dispatcherRef.current) {
                    const outcome = await dispatcherRef.current.parse(bytes, fileName, presetToApply);
                    setParsed(outcome.result);
                    setExecutionMode(outcome.executionMode);
                    setActivePreset(presetToApply);
                    setSelectedEntryIndex(outcome.result.entries.length > 0 ? 0 : null);
                } else {
                    const res = parseHarFile(bytes, fileName, presetToApply);
                    setParsed(res);
                    setExecutionMode('main-thread-fallback');
                    setActivePreset(presetToApply);
                    setSelectedEntryIndex(res.entries.length > 0 ? 0 : null);
                }
            } catch (err: unknown) {
                if (isHarCancelledError(err)) return;
                setErrorMessage(err instanceof Error ? err.message : 'Unable to parse HAR file.');
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    // Load default sample on initial mount
    useEffect(() => {
        const sample = generateSampleHarFile('ecommerce_checkout_incident');
        void handleLoadBytes(sample.bytes, sample.fileName, sample.recommendedPreset);
    }, [handleLoadBytes]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const buf = await file.arrayBuffer();
        await handleLoadBytes(new Uint8Array(buf), file.name, activePreset);
        e.target.value = '';
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        const buf = await file.arrayBuffer();
        await handleLoadBytes(new Uint8Array(buf), file.name, activePreset);
    };

    const handleSelectSample = async (
        sampleId: 'ecommerce_checkout_incident' | 'sso_saml_oidc_trace' | 'graphql_websocket_stream'
    ) => {
        const sample = generateSampleHarFile(sampleId);
        await handleLoadBytes(sample.bytes, sample.fileName, sample.recommendedPreset);
        setStatusBanner(`Loaded sample "${sample.fileName}" with preset "${sample.recommendedPreset}".`);
    };

    const handlePresetChange = (presetId: HarWorkflowPresetId) => {
        setActivePreset(presetId);
        if (presetId === 'performance_only_slim') {
            setStripBase64Media(true);
            setStripStatic200Bodies(true);
            setRemoveAllResponseBodies(false);
            setRedactionMode('deterministic_token');
        } else if (presetId === 'qa_load_test_replay') {
            setRedactionMode('env_placeholder');
            setStripBase64Media(true);
            setStripStatic200Bodies(false);
            setRemoveAllResponseBodies(false);
        } else if (presetId === 'ai_llm_har_anonymizer') {
            setRedactionMode('deterministic_token');
            setAnonymizeHostnames(true);
            setAnonymizeInternalIps(true);
        } else if (presetId === 'strict_zero_trust_cdr') {
            setRedactionMode('static_redacted');
            setRemoveAllResponseBodies(true);
            setAnonymizeInternalIps(true);
        } else {
            setRedactionMode('deterministic_token');
            setStripBase64Media(true);
            setStripStatic200Bodies(false);
            setRemoveAllResponseBodies(false);
            setAnonymizeHostnames(false);
        }

        if (!parsed) return;
        const clonedSecrets = parsed.secrets.map((s) => ({ ...s }));
        applyHarPreset(presetId, clonedSecrets);
        setParsed({ ...parsed, secrets: clonedSecrets });
    };

    const handleToggleSecret = (secretId: string) => {
        if (!parsed) return;
        const updated = parsed.secrets.map((s) =>
            s.id === secretId ? { ...s, selected: !s.selected } : s
        );
        setParsed({ ...parsed, secrets: updated });
    };

    const handleBulkSelectSecrets = (selectAll: boolean) => {
        if (!parsed) return;
        const updated = parsed.secrets.map((s) => ({ ...s, selected: selectAll }));
        setParsed({ ...parsed, secrets: updated });
    };

    const handleAddCustomKeyword = () => {
        const kw = customKeywordInput.trim();
        if (!kw || customKeywords.includes(kw)) return;
        setCustomKeywords((prev) => [...prev, kw]);
        setCustomKeywordInput('');
        setStatusBanner(`Added custom redaction string "${kw}".`);
    };

    const handleCompareHarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !parsed) return;
        try {
            const buf = await file.arrayBuffer();
            const targetParsed = parseHarFile(new Uint8Array(buf), file.name, activePreset);
            setDiffReport(compareHarFiles(parsed, targetParsed));
            setStatusBanner(`Compared baseline "${parsed.metadata.fileName}" against "${file.name}".`);
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : String(err));
        }
        e.target.value = '';
    };

    const handleCompareWithSample = (
        sampleId: 'ecommerce_checkout_incident' | 'sso_saml_oidc_trace' | 'graphql_websocket_stream'
    ) => {
        if (!parsed) return;
        const sample = generateSampleHarFile(sampleId);
        const targetParsed = parseHarFile(sample.bytes, sample.fileName, sample.recommendedPreset);
        setDiffReport(compareHarFiles(parsed, targetParsed));
    };

    const triggerDownload = (bytesOrText: Uint8Array | string, fileName: string, mimeType: string) => {
        const blob =
            typeof bytesOrText === 'string'
                ? new Blob([bytesOrText], { type: mimeType })
                : new Blob([bytesOrText as unknown as BlobPart], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const filteredEntries = useMemo(() => {
        if (!parsed) return [];
        return parsed.entries.filter((e) => {
            if (resourceFilter === 'THIRD_PARTY' && !e.isThirdParty) return false;
            if (
                resourceFilter !== 'ALL' &&
                resourceFilter !== 'THIRD_PARTY' &&
                e.resourceType !== resourceFilter
            ) {
                return false;
            }
            if (statusFilter === 'FAILED' && e.status < 400 && e.status !== 0) return false;
            if (statusFilter === 'SLOW' && e.timings.wait < 500 && e.timings.total < 500) return false;
            if (statusFilter === '2XX' && (e.status < 200 || e.status >= 300)) return false;
            if (statusFilter === '3XX' && (e.status < 300 || e.status >= 400)) return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const inUrl = e.url.toLowerCase().includes(q);
                const inMethod = e.method.toLowerCase().includes(q);
                const inStatus = String(e.status).includes(q);
                const inBody =
                    e.postDataText.toLowerCase().includes(q) || e.responseText.toLowerCase().includes(q);
                return inUrl || inMethod || inStatus || inBody;
            }
            return true;
        });
    }, [parsed, resourceFilter, statusFilter, searchQuery]);

    const displayedEntries = useMemo(() => {
        if (gridViewMode === 'virtualized') return filteredEntries.slice(0, 200);
        const start = (currentPage - 1) * pageSize;
        return filteredEntries.slice(start, start + pageSize);
    }, [filteredEntries, gridViewMode, currentPage]);

    const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));

    const inspectedEntry: HarEntryModel | null = useMemo(() => {
        if (!parsed || selectedEntryIndex === null) return null;
        return parsed.entries[selectedEntryIndex] || null;
    }, [parsed, selectedEntryIndex]);

    const filteredSecrets = useMemo(() => {
        if (!parsed) return [];
        return parsed.secrets.filter((s) => {
            if (secretCategoryFilter !== 'ALL' && s.category !== secretCategoryFilter) return false;
            if (secretSearch.trim()) {
                const q = secretSearch.toLowerCase();
                return (
                    s.fieldName.toLowerCase().includes(q) ||
                    s.category.toLowerCase().includes(q) ||
                    s.deterministicToken.toLowerCase().includes(q) ||
                    s.detectorName.toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [parsed, secretCategoryFilter, secretSearch]);

    const selectedSecretsCount = useMemo(
        () => (parsed ? parsed.secrets.filter((s) => s.selected).length : 0),
        [parsed]
    );

    const exposedSurfacesCount = useMemo(
        () => (parsed ? parsed.surfaces.filter((s) => s.statusInOriginal === 'EXPOSED').length : 0),
        [parsed]
    );

    const activePreviewCode = useMemo(() => {
        if (!parsed || !sanitizeOutcome) return '';
        if (codePreviewFormat === 'k6') return exportToK6Script(parsed);
        if (codePreviewFormat === 'playwright') return exportToPlaywrightTest(parsed);
        if (codePreviewFormat === 'openapi') return exportToOpenApiSpecJson(parsed);
        if (codePreviewFormat === 'postman') return exportToPostmanCollectionJson(parsed);
        if (codePreviewFormat === 'markdown') return exportToMarkdownBugReport(parsed, sanitizeOutcome);
        if (codePreviewFormat === 'certificate') {
            return generateHarComplianceCertificateJson(parsed, sanitizeOutcome, activePreset);
        }
        const targetEntry = inspectedEntry || parsed.entries[0];
        return targetEntry ? exportEntryToCurl(targetEntry, parsed.secrets, true) : '';
    }, [parsed, sanitizeOutcome, codePreviewFormat, activePreset, inspectedEntry]);

    const sessionMaxTimelineMs = useMemo(() => {
        if (!parsed || parsed.entries.length === 0) return 1000;
        return Math.max(
            100,
            ...parsed.entries.map((e) => e.relativeStartMs + e.timings.total)
        );
    }, [parsed]);

    return (
        <div className="space-y-6 w-full min-w-0 max-w-full overflow-x-hidden text-slate-900 dark:text-slate-100">
            {/* TOP DROPZONE & 3 INSTANT SAMPLE HAR LOADERS */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="min-w-0">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-2">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>Client-Side HAR 1.2 Waterfall Analyzer &amp; 14-Surface Sanitizer v{HAR_ENGINE_VERSION}</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            HAR File Analyzer, Waterfall Inspector &amp; Deep Secret Sanitizer
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Visualize 7-phase HTTP waterfalls, diagnose 502/CORS/TTFB bottlenecks, decode SAML 2.0 XML &amp; JWT tokens, scrub all 14 secret surfaces with deterministic tokens, and export to k6, Playwright, or OpenAPI 3.1 locally in your browser.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".har,.json,application/json"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-sm transition"
                        >
                            <Upload className="w-4 h-4 shrink-0" />
                            <span>Select .HAR File</span>
                        </button>
                        {sanitizeOutcome && (
                            <button
                                type="button"
                                onClick={() =>
                                    triggerDownload(
                                        sanitizeOutcome.sanitizedHarJson,
                                        sanitizeOutcome.sanitizedFileName,
                                        'application/json'
                                    )
                                }
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
                            >
                                <Download className="w-4 h-4 shrink-0" />
                                <span>
                                    Download Sanitized .HAR ({formatBytes(sanitizeOutcome.forensicReport.sanitizedSizeBytes)})
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Dropzone + 3 1-Click Sample HAR Files */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4">
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="min-w-0 lg:col-span-5 cursor-pointer rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/70 dark:bg-slate-800/40 p-4 flex flex-col justify-center items-center text-center transition"
                    >
                        <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-1.5" />
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {isLoading
                                ? 'Analyzing HAR capture in background Web Worker...'
                                : 'Drop Chrome / Edge / Firefox / Charles / Fiddler .HAR file here'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Up to {MAX_SAFE_HAR_BYTES / (1024 * 1024)} MB • 100% Local Browser Memory • Zero Server Upload
                        </p>
                    </div>

                    <div className="min-w-0 lg:col-span-7 flex flex-col justify-between">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>Instant 1-Click Sample HAR Captures (Test Waterfalls, SAML/JWT &amp; 14-Surface Scrubbing):</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {SAMPLE_HAR_FILES.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => handleSelectSample(s.id)}
                                    className="min-w-0 text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/60 dark:bg-slate-800/50 transition group"
                                >
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                            {s.title}
                                        </span>
                                    </div>
                                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 mb-1">
                                        {s.badge}
                                    </span>
                                    <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400 line-clamp-2">
                                        {s.subtitle}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Disclosure & Privacy Bar */}
                <details className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <summary className="cursor-pointer font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>Technical Capabilities, 14-Surface Deep HAR Sanitization Scope &amp; Browser Privacy Disclosure</span>
                        </span>
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium shrink-0">
                            Click to expand
                        </span>
                    </summary>
                    <div className="mt-2.5 space-y-1.5 leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-2.5">
                        <p>
                            <strong>Privacy &amp; Local Execution:</strong> Your selected file contents are processed locally in your
                            browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other
                            third-party website resources.
                        </p>
                        <p>
                            <strong>14-Surface Deep HAR Scrubbing vs. Basic Header Cleaners:</strong> Standard HAR sanitizers only
                            check header and cookie names. This engine recursively walks JSON AST payloads inside{' '}
                            <code>postData.text</code>, GraphQL <code>variables</code>, <code>response.content.text</code>, Base64{' '}
                            <code>SAMLResponse</code> assertions, URL paths/queries, and <code>_webSocketMessages</code> frames,
                            replacing secrets with deterministic tokens (<code>[JWT_TOKEN_01]</code>) so support engineers retain
                            debugging context with zero credential exposure.
                        </p>
                    </div>
                </details>
            </div>

            {errorMessage && (
                <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 p-4 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold">HAR Processing Alert</p>
                        <p className="text-xs mt-0.5 break-words">{errorMessage}</p>
                    </div>
                </div>
            )}

            {statusBanner && (
                <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-emerald-900 dark:text-emerald-200">
                    <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{statusBanner}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setStatusBanner(null)}
                        className="text-emerald-700 dark:text-emerald-300 hover:underline font-medium shrink-0"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {parsed && (
                <>
                    {/* 6 PURPOSE-BUILT WORKFLOW PRESETS */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    1-Click HAR Sanitization &amp; Debugging Workflow Presets
                                </h3>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                Configures token pseudonymization, response body slimming, and hostname/IP anonymization
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {WORKFLOW_PRESETS.map((preset) => {
                                const isActive = activePreset === preset.id;
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => handlePresetChange(preset.id)}
                                        className={`min-w-0 text-left p-3 rounded-xl border transition ${isActive
                                                ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-500/40'
                                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {preset.name}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${isActive
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                    }`}
                                            >
                                                {preset.shortBadge}
                                            </span>
                                        </div>
                                        <p className="text-[11px] leading-snug text-slate-600 dark:text-slate-400">
                                            {preset.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 6-CARD ACTIVE TELEMETRY BAR */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                        <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Requests &amp; Errors</div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                                {parsed.metadata.totalEntries} Total ({parsed.metadata.failedEntriesCount} Failed)
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 truncate">
                                {parsed.metadata.thirdPartyRequestCount} 3rd-Party • {parsed.metadata.primaryHost}
                            </div>
                        </div>

                        <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Health &amp; Root-Cause</div>
                            <div
                                className={`text-sm font-bold mt-0.5 truncate ${parsed.metadata.healthScore >= 80
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : parsed.metadata.healthScore >= 55
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : 'text-rose-600 dark:text-rose-400'
                                    }`}
                            >
                                Score: {parsed.metadata.healthScore} / 100
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 truncate">
                                {parsed.diagnostics.length} Bottleneck Alert(s)
                            </div>
                        </div>

                        <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Latency &amp; TTFB</div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                                Peak TTFB: {parsed.metadata.peakTtfbMs} ms
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 truncate">
                                P95 TTFB: {parsed.metadata.p95TtfbMs} ms • Span: {parsed.metadata.totalSessionDurationMs} ms
                            </div>
                        </div>

                        <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">14-Surface Sanitizer</div>
                            <div className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5 truncate">
                                {selectedSecretsCount} Secrets ({exposedSurfacesCount}/14 Surfaces)
                            </div>
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 truncate">
                                → 14/14 Purged on Export
                            </div>
                        </div>

                        <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Auth, GQL &amp; WS</div>
                            <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                                {parsed.jwtTokens.length} JWT • {parsed.samlPayloads.length} SAML
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 truncate">
                                {parsed.graphqlOperations.length} GraphQL • {parsed.oauthFlows.length} SSO Step(s)
                            </div>
                        </div>

                        <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Forensic Self-Test</div>
                            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1 truncate">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>
                                    {sanitizeOutcome?.forensicReport.passedAllChecks ? 'PASSED (0 Leaks)' : 'Pending'}
                                </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 truncate">
                                {executionMode === 'worker' ? 'Web Worker' : 'Main Thread'} • {parsed.metadata.parseTimeMs} ms
                            </div>
                        </div>
                    </div>

                    {/* 5-TAB WORKBENCH NAVIGATION (Mobile Grid-Cols-1 -> Desktop Flex Wrap) */}
                    <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                        <button
                            type="button"
                            onClick={() => setActiveTab('waterfall_grid')}
                            className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'waterfall_grid'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400'
                                }`}
                        >
                            <span className="inline-flex items-center gap-2">
                                <Activity className="w-4 h-4 shrink-0" />
                                <span>1. Waterfall &amp; Request Inspector</span>
                            </span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                                {filteredEntries.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('diagnostics')}
                            className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'diagnostics'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400'
                                }`}
                        >
                            <span className="inline-flex items-center gap-2">
                                <Zap className="w-4 h-4 shrink-0" />
                                <span>2. Root-Cause Diagnostics</span>
                            </span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                                {parsed.diagnostics.length} Alerts
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('sanitizer_studio')}
                            className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'sanitizer_studio'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400'
                                }`}
                        >
                            <span className="inline-flex items-center gap-2">
                                <Lock className="w-4 h-4 shrink-0" />
                                <span>3. 14-Surface Sanitizer &amp; Slimmer</span>
                            </span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                                {selectedSecretsCount} Secrets
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('protocol_inspector')}
                            className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'protocol_inspector'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400'
                                }`}
                        >
                            <span className="inline-flex items-center gap-2">
                                <KeyRound className="w-4 h-4 shrink-0" />
                                <span>4. JWT, SAML 2.0, GraphQL &amp; WS</span>
                            </span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                                {parsed.jwtTokens.length + parsed.samlPayloads.length + parsed.graphqlOperations.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('export_and_diff')}
                            className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'export_and_diff'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400'
                                }`}
                        >
                            <span className="inline-flex items-center gap-2">
                                <Code2 className="w-4 h-4 shrink-0" />
                                <span>5. 10-Format Export &amp; HAR Diff</span>
                            </span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                                k6 / OpenAPI
                            </span>
                        </button>
                    </div>

                    {/* ============================================================
              TAB 1: WATERFALL & REQUEST INSPECTOR
              ============================================================ */}
                    {activeTab === 'waterfall_grid' && (
                        <div className="space-y-4">
                            {/* Filter Bar */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                    <div className="md:col-span-5 relative min-w-0">
                                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            placeholder="Search URLs, methods, status codes, JSON bodies..."
                                            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                                        />
                                    </div>
                                    <div className="md:col-span-4 min-w-0">
                                        <select
                                            value={resourceFilter}
                                            onChange={(e) => {
                                                setResourceFilter(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                                        >
                                            <option value="ALL">All Resource Types ({parsed.entries.length})</option>
                                            <option value="fetch_xhr">Fetch / XHR API</option>
                                            <option value="graphql">GraphQL Operations</option>
                                            <option value="websocket">WebSocket (101 Upgrade)</option>
                                            <option value="doc">Document / HTML</option>
                                            <option value="script">JavaScript</option>
                                            <option value="stylesheet">CSS</option>
                                            <option value="THIRD_PARTY">3rd-Party Domains Only</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-3 min-w-0">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => {
                                                setStatusFilter(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                                        >
                                            <option value="ALL">All Statuses</option>
                                            <option value="FAILED">Failed Only (4xx / 5xx / Status 0)</option>
                                            <option value="SLOW">Slow Requests (&gt; 500 ms)</option>
                                            <option value="2XX">2xx Success</option>
                                            <option value="3XX">3xx Redirects</option>
                                        </select>
                                    </div>
                                </div>

                                {/* 7-Phase Timing Legend */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">7-Phase Waterfall Legend:</span>
                                        <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-slate-400" /> Blocked</span>
                                        <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-teal-500" /> DNS</span>
                                        <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-amber-500" /> Connect</span>
                                        <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-purple-500" /> SSL/TLS</span>
                                        <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Wait (TTFB)</span>
                                        <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-blue-500" /> Receive</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setGridViewMode((m) => (m === 'paginated' ? 'virtualized' : 'paginated'))}
                                            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                        >
                                            Mode: {gridViewMode === 'paginated' ? 'Paginated (25/page)' : 'Continuous Virtual Scroll'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Waterfall Table */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                                <div className="w-full overflow-x-auto overscroll-x-contain">
                                    <table className="min-w-[820px] w-full text-left border-collapse text-xs">
                                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="py-2.5 px-3">#</th>
                                                <th className="py-2.5 px-3">Method</th>
                                                <th className="py-2.5 px-3">Status</th>
                                                <th className="py-2.5 px-3">Host &amp; Endpoint Path</th>
                                                <th className="py-2.5 px-3">Type</th>
                                                <th className="py-2.5 px-3">Size</th>
                                                <th className="py-2.5 px-3">TTFB / Total</th>
                                                <th className="py-2.5 px-3 w-56">7-Phase Waterfall Timeline</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                                            {displayedEntries.map((e) => {
                                                const isSelected = selectedEntryIndex === e.entryIndex;
                                                const isError = e.status >= 400 || e.status === 0;
                                                const leftPct = Math.min(92, (e.relativeStartMs / sessionMaxTimelineMs) * 100);
                                                const widthPct = Math.max(3, Math.min(100 - leftPct, (e.timings.total / sessionMaxTimelineMs) * 100));

                                                return (
                                                    <tr
                                                        key={e.entryIndex}
                                                        onClick={() => setSelectedEntryIndex(e.entryIndex)}
                                                        className={`cursor-pointer transition ${isSelected
                                                                ? 'bg-blue-50/80 dark:bg-blue-950/40'
                                                                : isError
                                                                    ? 'bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/70'
                                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                                            }`}
                                                    >
                                                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                                                            {e.entryIndex + 1}
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            <span
                                                                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${e.method === 'POST'
                                                                        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                                                        : e.method === 'OPTIONS'
                                                                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                                                    }`}
                                                            >
                                                                {e.method}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-3 font-mono font-bold">
                                                            <span
                                                                className={
                                                                    isError
                                                                        ? 'text-rose-600 dark:text-rose-400'
                                                                        : e.status >= 300
                                                                            ? 'text-amber-600 dark:text-amber-400'
                                                                            : 'text-emerald-600 dark:text-emerald-400'
                                                                }
                                                            >
                                                                {e.status === 0 ? '0 (CORS/ERR)' : e.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-3 max-w-xs">
                                                            <div className="font-mono text-[11px] font-semibold text-slate-900 dark:text-white truncate">
                                                                {e.pathname}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 truncate">
                                                                <span>{e.host}</span>
                                                                {e.isThirdParty && (
                                                                    <span className="px-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                                                        3rd-Party
                                                                    </span>
                                                                )}
                                                                {e.secretIds.length > 0 && (
                                                                    <span className="px-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                                                                        {e.secretIds.length} Secret(s)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-3 font-mono text-[11px]">
                                                            {e.resourceType}
                                                        </td>
                                                        <td className="py-2.5 px-3 font-mono text-[11px]">
                                                            {formatBytes(e.transferSizeBytes)}
                                                        </td>
                                                        <td className="py-2.5 px-3 font-mono text-[11px]">
                                                            <span className={e.timings.wait >= 500 ? 'text-rose-600 font-bold' : ''}>
                                                                {e.timings.wait} ms
                                                            </span>{' '}
                                                            / {e.timings.total} ms
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                                                <div
                                                                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                                                                    className="h-full absolute top-0 flex rounded-full overflow-hidden"
                                                                >
                                                                    <div
                                                                        style={{ width: `${(e.timings.dns / Math.max(1, e.timings.total)) * 100}%` }}
                                                                        className="bg-teal-500 h-full"
                                                                    />
                                                                    <div
                                                                        style={{ width: `${(e.timings.connect / Math.max(1, e.timings.total)) * 100}%` }}
                                                                        className="bg-amber-500 h-full"
                                                                    />
                                                                    <div
                                                                        style={{ width: `${(e.timings.ssl / Math.max(1, e.timings.total)) * 100}%` }}
                                                                        className="bg-purple-500 h-full"
                                                                    />
                                                                    <div
                                                                        style={{ width: `${(e.timings.wait / Math.max(1, e.timings.total)) * 100}%` }}
                                                                        className="bg-emerald-500 h-full"
                                                                    />
                                                                    <div className="bg-blue-500 h-full flex-1" />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {gridViewMode === 'paginated' && totalPages > 1 && (
                                    <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                                        <span>
                                            Page {currentPage} of {totalPages} ({filteredEntries.length} matching requests)
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                disabled={currentPage <= 1}
                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40"
                                            >
                                                Prev
                                            </button>
                                            <button
                                                type="button"
                                                disabled={currentPage >= totalPages}
                                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Selected Entry Deep Inspector Drawer */}
                            {inspectedEntry && (
                                <div className="rounded-2xl border border-blue-200 dark:border-blue-900/70 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-xs font-bold">
                                                    Entry #{inspectedEntry.entryIndex + 1} • {inspectedEntry.method}
                                                </span>
                                                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">
                                                    HTTP {inspectedEntry.status} ({inspectedEntry.statusText})
                                                </span>
                                            </div>
                                            <p className="font-mono text-xs text-slate-500 mt-1 break-all">
                                                {inspectedEntry.url}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const curl = exportEntryToCurl(inspectedEntry, parsed.secrets, true);
                                                void navigator.clipboard?.writeText(curl);
                                                setStatusBanner(`Copied sanitized cURL for Entry #${inspectedEntry.entryIndex + 1} to clipboard!`);
                                            }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-blue-600 text-white shrink-0"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>Copy Sanitized cURL</span>
                                        </button>
                                    </div>

                                    {/* 7-Phase Timing Breakdown Pills */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
                                        {[
                                            { label: 'Blocked', val: inspectedEntry.timings.blocked, color: 'text-slate-600' },
                                            { label: 'DNS Lookup', val: inspectedEntry.timings.dns, color: 'text-teal-600' },
                                            { label: 'TCP Connect', val: inspectedEntry.timings.connect, color: 'text-amber-600' },
                                            { label: 'SSL / TLS', val: inspectedEntry.timings.ssl, color: 'text-purple-600' },
                                            { label: 'Send', val: inspectedEntry.timings.send, color: 'text-indigo-600' },
                                            { label: 'Wait (TTFB)', val: inspectedEntry.timings.wait, color: 'text-emerald-600 font-bold' },
                                            { label: 'Receive', val: inspectedEntry.timings.receive, color: 'text-blue-600' },
                                        ].map((phase) => (
                                            <div
                                                key={phase.label}
                                                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800"
                                            >
                                                <div className="text-[10px] text-slate-400 uppercase">{phase.label}</div>
                                                <div className={`font-mono text-xs mt-0.5 ${phase.color}`}>{phase.val} ms</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Headers & Payload Split View */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                                        <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-950 space-y-2">
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                Request Headers ({inspectedEntry.requestHeaders.length}) &amp; POST Payload
                                            </div>
                                            <div className="space-y-1 font-mono text-[11px] max-h-48 overflow-y-auto">
                                                {inspectedEntry.requestHeaders.map((h, idx) => (
                                                    <div key={idx} className="break-all">
                                                        <span className="text-blue-600 dark:text-blue-400 font-semibold">{h.name}:</span>{' '}
                                                        <span className="text-slate-600 dark:text-slate-300">{h.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {inspectedEntry.postDataText && (
                                                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                                                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                                                        Request POST Body ({inspectedEntry.postDataMimeType}):
                                                    </div>
                                                    <pre className="font-mono text-[11px] whitespace-pre-wrap break-all bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 max-h-40 overflow-y-auto">
                                                        {inspectedEntry.postDataText}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-950 space-y-2">
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                Response Headers ({inspectedEntry.responseHeaders.length}) &amp; Body Preview
                                            </div>
                                            <div className="space-y-1 font-mono text-[11px] max-h-48 overflow-y-auto">
                                                {inspectedEntry.responseHeaders.map((h, idx) => (
                                                    <div key={idx} className="break-all">
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{h.name}:</span>{' '}
                                                        <span className="text-slate-600 dark:text-slate-300">{h.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {inspectedEntry.responseText && (
                                                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                                                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                                                        Response Body ({inspectedEntry.mimeType || 'text'}):
                                                    </div>
                                                    <pre className="font-mono text-[11px] whitespace-pre-wrap break-all bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 max-h-40 overflow-y-auto">
                                                        {inspectedEntry.responseText.slice(0, 1500)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ============================================================
              TAB 2: AUTOMATED ROOT-CAUSE DIAGNOSTICS & DOMAIN BREAKDOWN
              ============================================================ */}
                    {activeTab === 'diagnostics' && (
                        <div className="space-y-5">
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                                    <div>
                                        <h3 className="text-base font-bold flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-amber-500 shrink-0" />
                                            <span>Automated Root-Cause &amp; Performance Bottleneck Scorecard</span>
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Automatically detects HTTP 4xx/5xx/0 failures, CORS preflight blocks, expired JWTs, TTFB spikes,
                                            N+1 duplicate API queries, and uncompressed responses.
                                        </p>
                                    </div>
                                    <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                                        Session Health Score: {parsed.metadata.healthScore} / 100
                                    </div>
                                </div>

                                {parsed.diagnostics.length === 0 ? (
                                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                        <span>Zero HTTP errors, CORS blocks, or high-TTFB bottlenecks detected in this capture.</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        {parsed.diagnostics.map((d) => (
                                            <div
                                                key={d.id}
                                                className={`p-4 rounded-xl border text-xs space-y-2 min-w-0 ${d.severity === 'CRITICAL'
                                                        ? 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20'
                                                        : 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                                        <span>{d.title}</span>
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-900 text-white shrink-0">
                                                        {d.metricBadge}
                                                    </span>
                                                </div>
                                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{d.explanation}</p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    <strong>Fix:</strong> {d.remediation}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {d.affectedEntryIndices.slice(0, 6).map((idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedEntryIndex(idx);
                                                                setActiveTab('waterfall_grid');
                                                            }}
                                                            className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-semibold hover:border-blue-500"
                                                        >
                                                            Inspect Entry #{idx + 1} →
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Domain Breakdown Table */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                                    <span>1st-Party vs. 3rd-Party Domain Breakdown ({parsed.domains.length} Hosts)</span>
                                </h3>
                                <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                                    <table className="min-w-[640px] w-full text-left border-collapse text-xs">
                                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="py-2.5 px-3">Host / Domain</th>
                                                <th className="py-2.5 px-3">Classification</th>
                                                <th className="py-2.5 px-3">Requests</th>
                                                <th className="py-2.5 px-3">Failed</th>
                                                <th className="py-2.5 px-3">Transfer Size</th>
                                                <th className="py-2.5 px-3">Avg Duration</th>
                                                <th className="py-2.5 px-3">Peak TTFB</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                                            {parsed.domains.map((dom) => (
                                                <tr key={dom.host}>
                                                    <td className="py-2.5 px-3 font-mono font-semibold">{dom.host}</td>
                                                    <td className="py-2.5 px-3">
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${dom.isThirdParty
                                                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                                                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                                                }`}
                                                        >
                                                            {dom.isThirdParty ? '3rd-Party External' : '1st-Party Primary'}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 font-mono">{dom.requestCount}</td>
                                                    <td className="py-2.5 px-3 font-mono text-rose-600 font-bold">{dom.failedCount}</td>
                                                    <td className="py-2.5 px-3 font-mono">{formatBytes(dom.totalBytes)}</td>
                                                    <td className="py-2.5 px-3 font-mono">{dom.avgDurationMs} ms</td>
                                                    <td className="py-2.5 px-3 font-mono">{dom.maxTtfbMs} ms</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================================
              TAB 3: 14-SURFACE SANITIZER, SECRET QUEUE & HAR SLIMMER
              ============================================================ */}
                    {activeTab === 'sanitizer_studio' && (
                        <div className="space-y-5">
                            {/* Sanitizer & Slimmer Controls */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                                    <div>
                                        <h3 className="text-base font-bold flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>14-Surface Deep HAR Sanitizer &amp; File Size Slimmer Controls</span>
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Choose how secrets are replaced and strip bloated static bodies before attaching your HAR file to
                                            a support ticket.
                                        </p>
                                    </div>
                                    {sanitizeOutcome && (
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                            Output Size: {formatBytes(sanitizeOutcome.forensicReport.sanitizedSizeBytes)} (
                                            {sanitizeOutcome.forensicReport.sizeReductionPercent}% Slimmer)
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                            Token &amp; Secret Replacement Mode
                                        </label>
                                        <select
                                            value={redactionMode}
                                            onChange={(e) => setRedactionMode(e.target.value as HarRedactionMode)}
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium"
                                        >
                                            <option value="deterministic_token">
                                                Deterministic Token ([JWT_TOKEN_01] — Preserves Session Flow)
                                            </option>
                                            <option value="static_redacted">Static [REDACTED] (Maximum Anonymity)</option>
                                            <option value="env_placeholder">
                                                Environment Variable Placeholder ({'{{JWT_TOKEN_01}}'} for k6/Tests)
                                            </option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                                        <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={stripBase64Media}
                                                onChange={(e) => setStripBase64Media(e.target.checked)}
                                                className="rounded text-blue-600"
                                            />
                                            <span>Strip Base64 Images/Fonts</span>
                                        </label>
                                        <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={stripStatic200Bodies}
                                                onChange={(e) => setStripStatic200Bodies(e.target.checked)}
                                                className="rounded text-blue-600"
                                            />
                                            <span>Strip 200 OK Static JS/CSS</span>
                                        </label>
                                        <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={anonymizeHostnames}
                                                onChange={(e) => setAnonymizeHostnames(e.target.checked)}
                                                className="rounded text-blue-600"
                                            />
                                            <span>Anonymize Hostnames</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* 14-Surface Audit Table */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                                    <span>14-Surface Internal HAR Leak X-Ray Matrix</span>
                                </h3>
                                <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                                    <table className="min-w-[720px] w-full text-left border-collapse text-xs">
                                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="py-2 px-3">#</th>
                                                <th className="py-2 px-3">HAR Internal Surface</th>
                                                <th className="py-2 px-3">Source Status</th>
                                                <th className="py-2 px-3">Sample Detected Leak</th>
                                                <th className="py-2 px-3">Sanitization Action</th>
                                                <th className="py-2 px-3">Export Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                                            {parsed.surfaces.map((s) => (
                                                <tr key={s.surfaceNumber}>
                                                    <td className="py-2 px-3 font-mono font-bold">#{s.surfaceNumber}</td>
                                                    <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                                                        {s.surfaceName}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <span
                                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.statusInOriginal === 'EXPOSED'
                                                                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                                                }`}
                                                        >
                                                            {s.statusInOriginal} ({s.findingsCount})
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-3 font-mono text-[11px] text-rose-600 dark:text-rose-400 max-w-xs truncate">
                                                        {s.sampleLeakPreview || '—'}
                                                    </td>
                                                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{s.scrubAction}</td>
                                                    <td className="py-2 px-3">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                                            <Check className="w-3 h-3" />
                                                            <span>{s.statusAfterScrub}</span>
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Interactive Secret Queue */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="text-sm font-bold">
                                        Detected Secrets, Tokens, Cookies &amp; PII Queue ({filteredSecrets.length})
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleBulkSelectSecrets(true)}
                                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleBulkSelectSecrets(false)}
                                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                    <div className="sm:col-span-5">
                                        <input
                                            type="text"
                                            value={secretSearch}
                                            onChange={(e) => setSecretSearch(e.target.value)}
                                            placeholder="Filter secrets by field name, JWT, cookie, IBAN..."
                                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                                        />
                                    </div>
                                    <div className="sm:col-span-4">
                                        <select
                                            value={secretCategoryFilter}
                                            onChange={(e) => setSecretCategoryFilter(e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                                        >
                                            <option value="ALL">All Categories ({parsed.secrets.length})</option>
                                            <option value="JWT_TOKEN">JWT Tokens</option>
                                            <option value="SESSION_COOKIE">Session Cookies</option>
                                            <option value="AUTH_HEADER">Auth Headers</option>
                                            <option value="SAML_ASSERTION">SAML 2.0 XML</option>
                                            <option value="CLOUD_API_KEY">Cloud &amp; SaaS API Keys</option>
                                            <option value="JSON_BODY_SECRET">JSON Body Secrets</option>
                                            <option value="GRAPHQL_VARIABLE">GraphQL Variables</option>
                                            <option value="FINANCIAL_CARD_IBAN_SSN">Cards / IBAN / SSN / CNIC</option>
                                            <option value="PII_EMAIL_PHONE">Emails &amp; Contact PII</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-3 flex gap-1">
                                        <input
                                            type="text"
                                            value={customKeywordInput}
                                            onChange={(e) => setCustomKeywordInput(e.target.value)}
                                            placeholder="+ Custom secret"
                                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCustomKeyword}
                                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                                    {filteredSecrets.map((sec) => (
                                        <label
                                            key={sec.id}
                                            className={`flex items-start justify-between gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${sec.selected
                                                    ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/20'
                                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 opacity-70'
                                                }`}
                                        >
                                            <div className="flex items-start gap-2.5 min-w-0">
                                                <input
                                                    type="checkbox"
                                                    checked={sec.selected}
                                                    onChange={() => handleToggleSecret(sec.id)}
                                                    className="mt-0.5 rounded text-emerald-600"
                                                />
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <span className="font-bold text-slate-900 dark:text-white">{sec.fieldName}</span>
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-700">
                                                            Surface #{sec.surfaceNumber}
                                                        </span>
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                                                            {sec.detectorName}
                                                        </span>
                                                    </div>
                                                    <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 mt-1 break-all">
                                                        Preview: <span className="text-rose-600 line-through">{sec.maskedPreview}</span> → Replaced
                                                        With:{' '}
                                                        <strong className="text-emerald-600 dark:text-emerald-400">
                                                            {redactionMode === 'env_placeholder'
                                                                ? sec.envPlaceholder
                                                                : redactionMode === 'static_redacted'
                                                                    ? '[REDACTED]'
                                                                    : sec.deterministicToken}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                                Entry #{sec.entryIndex + 1}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================================
              TAB 4: JWT, SAML 2.0, GRAPHQL & WEBSOCKET INSPECTOR
              ============================================================ */}
                    {activeTab === 'protocol_inspector' && (
                        <div className="space-y-5">
                            {/* Decoded JWT Tokens */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <KeyRound className="w-4 h-4 text-blue-600 shrink-0" />
                                    <span>Decoded JSON Web Tokens (JWT) &amp; Request-Timestamp Expiry Audit ({parsed.jwtTokens.length})</span>
                                </h3>
                                {parsed.jwtTokens.length === 0 ? (
                                    <p className="text-xs text-slate-500">No JWT Bearer or Cookie tokens detected in this HAR file.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        {parsed.jwtTokens.map((j) => (
                                            <div
                                                key={j.id}
                                                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs space-y-2 min-w-0"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                                        {j.pseudonymToken}
                                                    </span>
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${j.expiryStatusAtRequest === 'EXPIRED_AT_REQUEST'
                                                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                                            }`}
                                                    >
                                                        {j.expiryStatusAtRequest}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-500">
                                                    Location: {j.location} • Alg: <code>{j.algorithm}</code> • Sub: <code>{j.subject}</code>
                                                </div>
                                                <pre className="font-mono text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full">
                                                    {JSON.stringify(j.payloadJson, null, 2)}
                                                </pre>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Decoded SAML 2.0 XML Assertions */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>Decoded SAML 2.0 Base64 XML Assertions ({parsed.samlPayloads.length})</span>
                                </h3>
                                {parsed.samlPayloads.length === 0 ? (
                                    <p className="text-xs text-slate-500">
                                        No SAMLRequest or SAMLResponse parameters detected (click &quot;Enterprise SAML 2.0 &amp; OIDC
                                        Trace&quot; sample above to inspect a live decoded SAML assertion).
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {parsed.samlPayloads.map((sp) => (
                                            <div
                                                key={sp.id}
                                                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs space-y-2"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <span className="font-bold text-slate-900 dark:text-white">
                                                        {sp.direction} (Entry #{sp.entryIndex + 1}) — Issuer: {sp.issuer}
                                                    </span>
                                                    <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                                                        NameID: {sp.nameId}
                                                    </span>
                                                </div>
                                                <pre className="font-mono text-[11px] bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full whitespace-pre-wrap break-all">
                                                    {sp.formattedXml}
                                                </pre>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* GraphQL Operations & WebSocket Frames */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
                                    <h3 className="text-sm font-bold">
                                        Parsed GraphQL Queries &amp; Mutations ({parsed.graphqlOperations.length})
                                    </h3>
                                    {parsed.graphqlOperations.length === 0 ? (
                                        <p className="text-xs text-slate-500">
                                            No GraphQL operations detected (load the &quot;GraphQL + WebSocket&quot; sample to test).
                                        </p>
                                    ) : (
                                        parsed.graphqlOperations.map((gql, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs space-y-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                        {gql.operationType.toUpperCase()}: {gql.operationName}
                                                    </span>
                                                    <span className="text-[11px] font-mono">
                                                        HTTP {gql.status} • {gql.durationMs} ms
                                                    </span>
                                                </div>
                                                <pre className="font-mono text-[11px] bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full">
                                                    {gql.queryText}
                                                </pre>
                                                <div className="text-[10px] font-bold uppercase text-slate-400">Variables:</div>
                                                <pre className="font-mono text-[11px] bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full">
                                                    {gql.variablesJson}
                                                </pre>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
                                    <h3 className="text-sm font-bold">
                                        WebSocket (_webSocketMessages) Frame Stream
                                    </h3>
                                    {parsed.entries.every((e) => e.webSocketFrames.length === 0) ? (
                                        <p className="text-xs text-slate-500">
                                            No WebSocket frames found in this capture (load the &quot;GraphQL + WebSocket&quot; sample to
                                            inspect 101 Switching Protocols frames).
                                        </p>
                                    ) : (
                                        parsed.entries
                                            .filter((e) => e.webSocketFrames.length > 0)
                                            .map((e) => (
                                                <div key={e.entryIndex} className="space-y-2 text-xs">
                                                    <div className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 break-all">
                                                        Entry #{e.entryIndex + 1}: {e.url}
                                                    </div>
                                                    {e.webSocketFrames.map((f) => (
                                                        <div
                                                            key={f.frameIndex}
                                                            className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-[11px]"
                                                        >
                                                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                                                <span className="uppercase font-bold text-blue-600 dark:text-blue-400">
                                                                    {f.type} (Opcode {f.opcode})
                                                                </span>
                                                                {f.containsSecret && (
                                                                    <span className="text-rose-600 font-bold">Contains Secret (Scrubbed on Export)</span>
                                                                )}
                                                            </div>
                                                            <div className="break-all">{f.data}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================================
              TAB 5: 10-FORMAT DEVOPS EXPORTER, FORENSIC PROOF & HAR DIFF
              ============================================================ */}
                    {activeTab === 'export_and_diff' && sanitizeOutcome && (
                        <div className="space-y-5">
                            {/* Forensic Proof & Download Studio */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <div>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>
                                                Forensic Self-Test:{' '}
                                                {sanitizeOutcome.forensicReport.passedAllChecks
                                                    ? `PASSED — 0 / ${sanitizeOutcome.forensicReport.totalSecretsChecked} SECRETS LEAKED`
                                                    : 'REVIEW REQUIRED'}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold">
                                            10-Target DevOps Code Generator, Sanitized HAR &amp; Audit Certificate Exporter
                                        </h3>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                triggerDownload(
                                                    sanitizeOutcome.sanitizedHarJson,
                                                    sanitizeOutcome.sanitizedFileName,
                                                    'application/json'
                                                )
                                            }
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Download Sanitized .HAR</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const xlsx = exportHarNetworkLogXlsx(parsed);
                                                const base = parsed.metadata.fileName.replace(/\.har$/i, '');
                                                triggerDownload(
                                                    xlsx,
                                                    `${base}_network_log.xlsx`,
                                                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                                );
                                            }}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-blue-600 text-white"
                                        >
                                            <FileSpreadsheet className="w-3.5 h-3.5" />
                                            <span>Export Excel (.xlsx)</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const csv = exportHarNetworkLogCsv(parsed, true);
                                                const base = parsed.metadata.fileName.replace(/\.har$/i, '');
                                                triggerDownload(csv, `${base}_network_log.csv`, 'text/csv;charset=utf-8');
                                            }}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white"
                                        >
                                            <FileCode className="w-3.5 h-3.5" />
                                            <span>Export CSV (.csv)</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Code Generator Tabs */}
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap gap-1.5">
                                        {[
                                            { id: 'k6' as const, label: 'Grafana k6 Script (.js)' },
                                            { id: 'playwright' as const, label: 'Playwright Test (.spec.ts)' },
                                            { id: 'openapi' as const, label: 'OpenAPI 3.1 Spec (.json)' },
                                            { id: 'postman' as const, label: 'Postman v2.1 (.json)' },
                                            { id: 'markdown' as const, label: 'Markdown Bug Report (.md)' },
                                            { id: 'certificate' as const, label: 'SHA-256 Audit Cert (.json)' },
                                            { id: 'curl' as const, label: 'Sanitized cURL' },
                                        ].map((fmt) => (
                                            <button
                                                key={fmt.id}
                                                type="button"
                                                onClick={() => setCodePreviewFormat(fmt.id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${codePreviewFormat === fmt.id
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                                    }`}
                                            >
                                                {fmt.label}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            void navigator.clipboard?.writeText(activePreviewCode);
                                            setCopiedCode(true);
                                            setTimeout(() => setCopiedCode(false), 2000);
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white"
                                    >
                                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedCode ? 'Copied!' : 'Copy Generated Code'}</span>
                                    </button>
                                </div>

                                <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-w-full max-h-96">
                                    {activePreviewCode}
                                </pre>
                            </div>

                            {/* Side-by-Side HAR Diff / Regression Comparator */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-sm font-bold flex items-center gap-2">
                                            <GitCompare className="w-4 h-4 text-blue-600 shrink-0" />
                                            <span>Side-by-Side HAR Diff &amp; Latency Regression Comparator</span>
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Compare the current baseline HAR against a second capture to spot TTFB regressions, added/removed
                                            endpoints, and status changes.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <input
                                            ref={diffInputRef}
                                            type="file"
                                            accept=".har,.json"
                                            onChange={handleCompareHarUpload}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => diffInputRef.current?.click()}
                                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white"
                                        >
                                            Upload 2nd .HAR to Compare
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleCompareWithSample('sso_saml_oidc_trace')}
                                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800"
                                        >
                                            Demo Diff vs. SSO Trace
                                        </button>
                                    </div>
                                </div>

                                {diffReport && (
                                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                <div className="text-[10px] text-slate-400 uppercase">Request Count Delta</div>
                                                <div className="text-sm font-bold font-mono mt-0.5">
                                                    {diffReport.requestCountDelta > 0 ? `+${diffReport.requestCountDelta}` : diffReport.requestCountDelta}
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                <div className="text-[10px] text-slate-400 uppercase">Failed Requests Delta</div>
                                                <div className="text-sm font-bold font-mono mt-0.5">
                                                    {diffReport.failedCountDelta > 0 ? `+${diffReport.failedCountDelta}` : diffReport.failedCountDelta}
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                <div className="text-[10px] text-slate-400 uppercase">P95 TTFB Delta</div>
                                                <div className="text-sm font-bold font-mono mt-0.5">
                                                    {diffReport.p95TtfbDeltaMs > 0 ? `+${diffReport.p95TtfbDeltaMs} ms` : `${diffReport.p95TtfbDeltaMs} ms`}
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                <div className="text-[10px] text-slate-400 uppercase">Transfer Size Delta</div>
                                                <div className="text-sm font-bold font-mono mt-0.5">
                                                    {diffReport.transferBytesDelta > 0
                                                        ? `+${formatBytes(diffReport.transferBytesDelta)}`
                                                        : formatBytes(diffReport.transferBytesDelta)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}