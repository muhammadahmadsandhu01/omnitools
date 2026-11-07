'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
    Code2,
    FileCode2,
    ShieldCheck,
    Sparkles,
    Upload,
    Download,
    Copy,
    Check,
    Wrench,
    AlertTriangle,
    CheckCircle2,
    Info,
    Layers,
    Search,
    RefreshCw,
    FileSpreadsheet,
    Terminal,
    Braces,
    GitBranch,
    Sliders,
} from 'lucide-react';
import {
    OPENAPI_ENGINE_VERSION,
    type OpenApiSampleId,
    type OpenApiCodegenConfig,
    type TsDeclarationStyle,
    type TsEnumStyle,
    type ZodStrictnessMode,
    compileOpenApiSpec,
    autoFixOpenApiSpecText,
    exportOpenApiInventoryXlsx,
    getSampleOpenApiSpec,
} from '@/lib/openapiToTypescriptEngine';

type OutputArtifactTab =
    | 'typescript'
    | 'zod'
    | 'msw'
    | 'client'
    | 'mock_json'
    | 'openapi_31';

type BottomStudioTab = 'explorer' | 'linter' | 'verification';

interface SamplePresetCard {
    id: OpenApiSampleId;
    title: string;
    badge: string;
    formatBadge: string;
    description: string;
}

const SAMPLE_PRESET_CARDS: SamplePresetCard[] = [
    {
        id: 'stripe_billing_openapi_31',
        title: 'AcmeCloud Billing API',
        badge: 'OpenAPI 3.1 • Discriminated Union',
        formatBadge: 'YAML',
        description:
            'Tests OpenAPI 3.1 nullable type arrays [string, null], oneOf discriminator unions, const literals, UUID/Email formats & regex rules.',
    },
    {
        id: 'ecommerce_circular_openapi_30',
        title: 'LuxeCommerce Category Tree',
        badge: 'OpenAPI 3.0 • Circular $ref Tree',
        formatBadge: 'JSON',
        description:
            'Tests self-referencing CategoryNode schemas to verify DFS cycle detection and automatic z.lazy(() => Schema) runtime protection.',
    },
    {
        id: 'legacy_petstore_swagger_20',
        title: 'Legacy Orders Swagger 2.0',
        badge: 'Swagger 2.0 • 1-Click Auto-Fix Demo',
        formatBadge: 'YAML',
        description:
            'Contains legacy definitions, in:body params, missing operationId & a dangling $ref (#/definitions/ShippingAddress) to test 1-Click Auto-Fix.',
    },
];

const DEFAULT_CONFIG: OpenApiCodegenConfig = {
    declarationStyle: 'interface',
    enumStyle: 'union',
    readonlyProperties: false,
    optionalWithNullish: false,
    includeJsDocComments: true,
    zodStrictness: 'strict',
    emitZodInferTypes: true,
    coerceQueryAndPathParams: true,
    mockSeed: 42,
    mockArrayLength: 2,
    baseUrlOverride: '',
};

export default function OpenapiToTypescript() {
    const [activeSampleId, setActiveSampleId] = useState<OpenApiSampleId>('stripe_billing_openapi_31');
    const [rawSpecText, setRawSpecText] = useState<string>(() =>
        getSampleOpenApiSpec('stripe_billing_openapi_31')
    );
    const [config, setConfig] = useState<OpenApiCodegenConfig>(DEFAULT_CONFIG);
    const [showAdvancedConfig, setShowAdvancedConfig] = useState<boolean>(false);
    const [activeOutputTab, setActiveOutputTab] = useState<OutputArtifactTab>('typescript');
    const [activeBottomTab, setActiveBottomTab] = useState<BottomStudioTab>('explorer');
    const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
    const [copiedOutput, setCopiedOutput] = useState<boolean>(false);
    const [autoFixNotice, setAutoFixNotice] = useState<string | null>(null);
    const [endpointSearch, setEndpointSearch] = useState<string>('');
    const [methodFilter, setMethodFilter] = useState<string>('ALL');

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Real-time compilation whenever input spec or compiler flags change
    const compiledState = useMemo(() => {
        try {
            const result = compileOpenApiSpec(rawSpecText, config);
            return { result, error: null as string | null };
        } catch (err) {
            return {
                result: null,
                error: err instanceof Error ? err.message : 'Unable to parse OpenAPI specification.',
            };
        }
    }, [rawSpecText, config]);

    const compiled = compiledState.result;

    // Load 1-Click Sample Preset
    const handleSelectSample = (sampleId: OpenApiSampleId) => {
        setActiveSampleId(sampleId);
        setRawSpecText(getSampleOpenApiSpec(sampleId));
        setAutoFixNotice(null);
    };

    // Handle File Upload (.yaml, .yml, .json)
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setRawSpecText(reader.result);
                setAutoFixNotice(`Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    // 1-Click Auto-Fix Specification
    const handleAutoFixSpec = () => {
        try {
            const fixed = autoFixOpenApiSpecText(rawSpecText, config.baseUrlOverride);
            setRawSpecText(fixed);
            setAutoFixNotice(
                'Auto-Fixed: Upgraded to OpenAPI 3.1.0, migrated in:body & response schemas, injected missing operationIds, scaffolded dangling $refs & enforced HTTPS.'
            );
            setTimeout(() => setAutoFixNotice(null), 5000);
        } catch (err) {
            setAutoFixNotice(
                err instanceof Error ? `Auto-Fix failed: ${err.message}` : 'Could not auto-fix specification.'
            );
        }
    };

    // Determine currently selected output code & filename
    const currentOutputArtifact = useMemo(() => {
        if (!compiled) {
            return {
                code: '// Fix syntax error in the left OpenAPI editor to view generated output.',
                filename: 'error.txt',
                mime: 'text/plain',
                label: 'Compiler Output',
            };
        }
        switch (activeOutputTab) {
            case 'typescript':
                return {
                    code: compiled.typescriptCode,
                    filename: 'api-types.ts',
                    mime: 'text/typescript',
                    label: 'TypeScript Interfaces & Endpoint Contracts',
                };
            case 'zod':
                return {
                    code: compiled.zodSchemasCode,
                    filename: 'api-schemas.zod.ts',
                    mime: 'text/typescript',
                    label: 'Topologically Sorted Zod Schemas (with z.lazy() Guard)',
                };
            case 'msw':
                return {
                    code: compiled.mswHandlersCode,
                    filename: 'msw-handlers.ts',
                    mime: 'text/typescript',
                    label: 'Mock Service Worker (MSW v2) Request Handlers',
                };
            case 'client':
                return {
                    code: compiled.fetchAndTanstackClientCode,
                    filename: 'api-client.ts',
                    mime: 'text/typescript',
                    label: 'Zero-Dependency Fetch Client + TanStack Query v5 Hooks',
                };
            case 'mock_json':
                return {
                    code: compiled.mockPayloadsJson,
                    filename: 'mock-payloads.json',
                    mime: 'application/json',
                    label: 'Deterministic Seeded Mock JSON Payloads',
                };
            case 'openapi_31':
                return {
                    code: compiled.normalizedOpenApi31Json,
                    filename: 'openapi-3.1.normalized.json',
                    mime: 'application/json',
                    label: 'Normalized OpenAPI 3.1.0 Specification (JSON)',
                };
        }
    }, [compiled, activeOutputTab]);

    const outputLines = useMemo(
        () => currentOutputArtifact.code.split('\n'),
        [currentOutputArtifact.code]
    );

    const inputLineCount = useMemo(() => rawSpecText.split('\n').length, [rawSpecText]);

    // Copy active output code
    const handleCopyOutput = async () => {
        try {
            await navigator.clipboard.writeText(currentOutputArtifact.code);
            setCopiedOutput(true);
            setTimeout(() => setCopiedOutput(false), 2000);
        } catch {
            // Fallback
        }
    };

    // Download active code artifact
    const handleDownloadArtifact = () => {
        const blob = new Blob([currentOutputArtifact.code], {
            type: `${currentOutputArtifact.mime};charset=utf-8`,
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentOutputArtifact.filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Download 3-Sheet Excel (.xlsx) Inventory
    const handleDownloadXlsx = () => {
        if (!compiled) return;
        const bytes = exportOpenApiInventoryXlsx(compiled);
        const blob = new Blob([bytes as unknown as BlobPart], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'openapi-contract-inventory.xlsx';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Download CSV Inventory
    const handleDownloadCsv = () => {
        if (!compiled) return;
        const blob = new Blob([compiled.inventoryCsv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'openapi-endpoints-inventory.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Filtered endpoints for Visual Explorer
    const filteredOperations = useMemo(() => {
        if (!compiled) return [];
        return compiled.operations.filter((op) => {
            const matchesMethod = methodFilter === 'ALL' || op.method === methodFilter;
            const q = endpointSearch.trim().toLowerCase();
            const matchesQuery =
                !q ||
                op.path.toLowerCase().includes(q) ||
                op.operationId.toLowerCase().includes(q) ||
                op.summary.toLowerCase().includes(q);
            return matchesMethod && matchesQuery;
        });
    }, [compiled, methodFilter, endpointSearch]);

    const methodBadgeColor = (method: string) => {
        switch (method) {
            case 'GET':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
            case 'POST':
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
            case 'PUT':
            case 'PATCH':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800';
            case 'DELETE':
                return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800';
            default:
                return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* TOP STUDIO HEADER & GLOBAL ACTIONS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>
                                OpenAPI 3.1 / 3.0 / Swagger 2.0 → TypeScript + Zod + MSW v2 + TanStack Query v5 Studio v{OPENAPI_ENGINE_VERSION}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            OpenAPI (Swagger) to TypeScript, Zod &amp; Mock Generator
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
                            Paste or upload any OpenAPI YAML or JSON contract on the left to compile strict TypeScript interfaces, topologically sorted Zod schemas (with automatic <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs">z.lazy()</code> circular reference protection), MSW v2 mock handlers, and typed Fetch / TanStack Query hooks in real time on the right.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".yaml,.yml,.json,.txt"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold transition shadow-sm"
                        >
                            <Upload className="w-4 h-4" />
                            <span>Upload YAML / JSON</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleAutoFixSpec}
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition shadow-sm"
                            title="Upgrades Swagger 2.0 to OpenAPI 3.1, injects missing operationIds, scaffolds dangling $refs, and upgrades HTTP to HTTPS"
                        >
                            <Wrench className="w-4 h-4" />
                            <span>1-Click Auto-Fix Spec</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadXlsx}
                            disabled={!compiled}
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition shadow-sm"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Export 3-Sheet Excel (.xlsx)</span>
                        </button>
                    </div>
                </div>

                {autoFixNotice && (
                    <div className="mt-4 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <span>{autoFixNotice}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAutoFixNotice(null)}
                            className="text-xs underline hover:no-underline shrink-0"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* ROW 1: 3 INSTANT 1-CLICK SAMPLE SPECIFICATIONS */}
                <div className="mt-5 pt-5 border-t border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            3 Instant 1-Click Sample Specifications (Click Any Sample to Test Live Conversion):
                        </span>
                        {compiled && (
                            <span className="hidden sm:inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span>
                                    Detected: <strong className="text-slate-800 dark:text-slate-200">{compiled.inputFormat}</strong> ({compiled.detectedSpecVersion})
                                </span>
                                <span>•</span>
                                <span>
                                    Health Score: <strong className={compiled.specHealthScore >= 85 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{compiled.specHealthScore}/100</strong>
                                </span>
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {SAMPLE_PRESET_CARDS.map((sample) => {
                            const isSelected = activeSampleId === sample.id;
                            return (
                                <button
                                    key={sample.id}
                                    type="button"
                                    onClick={() => handleSelectSample(sample.id)}
                                    className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between gap-2 min-w-0 ${isSelected
                                            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                                            : 'bg-slate-50/70 hover:bg-slate-100/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800'
                                        }`}
                                >
                                    <div className="space-y-1.5 w-full">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                                {sample.title}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0 ${isSelected
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                    }`}
                                            >
                                                {isSelected ? '✓ Active' : `Load ${sample.formatBadge}`}
                                            </span>
                                        </div>

                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-100/80 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold">
                                            {sample.badge}
                                        </div>

                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                            {sample.description}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ROW 2: 2 PARALLEL SIDE-BY-SIDE WINDOWS (LEFT: INPUT SPEC & COMPILER OPTIONS | RIGHT: LIVE CONVERTED SOLUTION) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* LEFT WINDOW: OPENAPI YAML / JSON INPUT EDITOR & COMPILER SETTINGS */}
                <div className="lg:col-span-5 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden min-w-0">
                    {/* Left Window Top Bar */}
                    <div className="px-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <Braces className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                1. Input OpenAPI / Swagger Spec
                            </h2>
                            {compiled && (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                    {compiled.inputFormat} • {compiled.detectedSpecVersion}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleAutoFixSpec}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition"
                                title="Upgrade Swagger 2.0 to OpenAPI 3.1 & resolve dangling $refs"
                            >
                                <Wrench className="w-3.5 h-3.5" />
                                <span>Auto-Fix</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRawSpecText(getSampleOpenApiSpec(activeSampleId))}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                                title="Reset editor to active sample"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Reset</span>
                            </button>
                        </div>
                    </div>

                    {/* Compiler Quick Toggles Strip inside Left Window */}
                    <div className="p-3.5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    TS Declaration
                                </label>
                                <select
                                    value={config.declarationStyle}
                                    onChange={(e) =>
                                        setConfig((prev) => ({
                                            ...prev,
                                            declarationStyle: e.target.value as TsDeclarationStyle,
                                        }))
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="interface">export interface</option>
                                    <option value="type">export type =</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Enum Style
                                </label>
                                <select
                                    value={config.enumStyle}
                                    onChange={(e) =>
                                        setConfig((prev) => ({
                                            ...prev,
                                            enumStyle: e.target.value as TsEnumStyle,
                                        }))
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="union">Literal Union (&apos;a&apos; | &apos;b&apos;)</option>
                                    <option value="const_object">as const Object</option>
                                    <option value="ts_enum">TS enum</option>
                                </select>
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Zod Object Mode
                                </label>
                                <select
                                    value={config.zodStrictness}
                                    onChange={(e) =>
                                        setConfig((prev) => ({
                                            ...prev,
                                            zodStrictness: e.target.value as ZodStrictnessMode,
                                        }))
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="strict">.strict() (Reject Unknown)</option>
                                    <option value="default">Default (Strip Unknown)</option>
                                    <option value="passthrough">.passthrough() (Keep)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
                                <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.readonlyProperties}
                                        onChange={(e) =>
                                            setConfig((prev) => ({
                                                ...prev,
                                                readonlyProperties: e.target.checked,
                                            }))
                                        }
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>readonly</span>
                                </label>

                                <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.optionalWithNullish}
                                        onChange={(e) =>
                                            setConfig((prev) => ({
                                                ...prev,
                                                optionalWithNullish: e.target.checked,
                                            }))
                                        }
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>Nullish</span>
                                </label>

                                <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.coerceQueryAndPathParams}
                                        onChange={(e) =>
                                            setConfig((prev) => ({
                                                ...prev,
                                                coerceQueryAndPathParams: e.target.checked,
                                            }))
                                        }
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>z.coerce</span>
                                </label>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowAdvancedConfig((v) => !v)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                <Sliders className="w-3.5 h-3.5" />
                                <span>{showAdvancedConfig ? 'Hide Options' : 'More Options'}</span>
                            </button>
                        </div>

                        {showAdvancedConfig && (
                            <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5">
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                                    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.includeJsDocComments}
                                            onChange={(e) =>
                                                setConfig((prev) => ({
                                                    ...prev,
                                                    includeJsDocComments: e.target.checked,
                                                }))
                                            }
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span>Emit JSDoc comments</span>
                                    </label>

                                    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.emitZodInferTypes}
                                            onChange={(e) =>
                                                setConfig((prev) => ({
                                                    ...prev,
                                                    emitZodInferTypes: e.target.checked,
                                                }))
                                            }
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span>Emit z.infer&lt;&gt; types</span>
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                                            Mock PRNG Seed
                                        </label>
                                        <input
                                            type="number"
                                            value={config.mockSeed}
                                            onChange={(e) =>
                                                setConfig((prev) => ({
                                                    ...prev,
                                                    mockSeed: Number(e.target.value) || 1,
                                                }))
                                            }
                                            className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                                            Mock Array Items (1–5)
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={5}
                                            value={config.mockArrayLength}
                                            onChange={(e) =>
                                                setConfig((prev) => ({
                                                    ...prev,
                                                    mockArrayLength: Math.min(
                                                        5,
                                                        Math.max(1, Number(e.target.value) || 2)
                                                    ),
                                                }))
                                            }
                                            className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                                        />
                                    </div>

                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                                            Base URL Override
                                        </label>
                                        <input
                                            type="text"
                                            value={config.baseUrlOverride}
                                            onChange={(e) =>
                                                setConfig((prev) => ({
                                                    ...prev,
                                                    baseUrlOverride: e.target.value,
                                                }))
                                            }
                                            placeholder="https://api.custom.io"
                                            className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Live YAML / JSON Monospace Textarea */}
                    <div className="relative flex-1 flex flex-col min-h-[420px] lg:min-h-[520px]">
                        <textarea
                            value={rawSpecText}
                            onChange={(e) => setRawSpecText(e.target.value)}
                            spellCheck={false}
                            placeholder="Paste your OpenAPI 3.1, 3.0, or Swagger 2.0 YAML or JSON specification here..."
                            className="w-full flex-1 p-4 font-mono text-xs sm:text-[13px] leading-relaxed bg-slate-950 text-slate-100 placeholder-slate-500 focus:outline-none resize-y min-h-[420px] lg:min-h-[520px] overflow-x-auto overscroll-x-contain"
                        />
                    </div>

                    {/* Left Window Footer Status Bar */}
                    <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        {compiledState.error ? (
                            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span className="truncate">{compiledState.error}</span>
                            </div>
                        ) : compiled ? (
                            <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-300">
                                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Live AST Synced
                                </span>
                                <span>•</span>
                                <span>
                                    <strong>{compiled.schemas.length}</strong> Schemas
                                </span>
                                <span>•</span>
                                <span>
                                    <strong>{compiled.operations.length}</strong> Endpoints
                                </span>
                                {compiled.circularSchemas.length > 0 && (
                                    <>
                                        <span>•</span>
                                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                            {compiled.circularSchemas.length} Circular z.lazy()
                                        </span>
                                    </>
                                )}
                            </div>
                        ) : null}
                        <span className="text-slate-400 font-mono">
                            {inputLineCount} lines • {rawSpecText.length.toLocaleString()} chars
                        </span>
                    </div>
                </div>

                {/* RIGHT WINDOW: REAL-TIME CONVERTED CODE OUTPUT STUDIO */}
                <div className="lg:col-span-7 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden min-w-0">
                    {/* Right Window Top Output Tabs */}
                    <div className="px-3 pt-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-2 mb-2.5 px-1">
                            <div className="flex items-center gap-2 min-w-0">
                                <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                    2. Instant Converted Code &amp; Mock Output
                                </h2>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowLineNumbers((v) => !v)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                                >
                                    {showLineNumbers ? 'Hide # Lines' : 'Show # Lines'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCopyOutput}
                                    disabled={!compiled}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition shadow-sm"
                                >
                                    {copiedOutput ? (
                                        <>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>Copy Code</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDownloadArtifact}
                                    disabled={!compiled}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-semibold transition shadow-sm"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{currentOutputArtifact.filename}</span>
                                    <span className="sm:hidden">Save</span>
                                </button>
                            </div>
                        </div>

                        {/* 6 Output Tabs (Horizontally scrollable on mobile) */}
                        <div className="flex items-center gap-1.5 overflow-x-auto overscroll-x-contain pb-2 no-scrollbar">
                            {[
                                { id: 'typescript', label: 'TypeScript', badge: '.ts' },
                                { id: 'zod', label: 'Zod Schemas', badge: 'z.infer' },
                                { id: 'msw', label: 'MSW v2 Mocks', badge: 'http.*' },
                                { id: 'client', label: 'Fetch + TanStack v5', badge: 'SDK' },
                                { id: 'mock_json', label: 'Mock JSON', badge: 'Seed' },
                                { id: 'openapi_31', label: 'OpenAPI 3.1', badge: 'Norm' },
                            ].map((tab) => {
                                const active = activeOutputTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveOutputTab(tab.id as OutputArtifactTab)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition shrink-0 ${active
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                                            }`}
                                    >
                                        <span>{tab.label}</span>
                                        <span
                                            className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${active
                                                    ? 'bg-indigo-700 text-indigo-100'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                                }`}
                                        >
                                            {tab.badge}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active Output Subheader Banner */}
                    <div className="px-4 py-2 bg-slate-900 text-slate-300 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                            <FileCode2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="font-mono font-semibold text-white truncate">
                                {currentOutputArtifact.filename}
                            </span>
                            <span className="text-slate-500 hidden sm:inline">—</span>
                            <span className="text-slate-400 truncate hidden sm:inline">
                                {currentOutputArtifact.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 shrink-0">
                            <span>{outputLines.length} lines</span>
                            <button
                                type="button"
                                onClick={handleDownloadCsv}
                                className="text-indigo-400 hover:text-indigo-300 underline"
                            >
                                Export Endpoints .CSV
                            </button>
                        </div>
                    </div>

                    {/* Right Window Monospace Code Output Viewer */}
                    <div className="relative flex-1 bg-slate-950 text-slate-100 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto overscroll-x-contain overflow-y-auto min-h-[420px] lg:min-h-[520px] max-h-[640px] p-4">
                        <table className="w-full border-collapse">
                            <tbody>
                                {outputLines.map((line, idx) => (
                                    <tr key={idx} className="hover:bg-slate-900/80">
                                        {showLineNumbers && (
                                            <td className="select-none pr-4 text-right text-slate-600 w-10 align-top">
                                                {idx + 1}
                                            </td>
                                        )}
                                        <td className="whitespace-pre text-slate-100 align-top">
                                            {line || ' '}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Right Window Bottom Verification Summary Bar */}
                    {compiled && (
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                    <ShieldCheck className="w-4 h-4" />
                                    {compiled.invariantVerification.checks.filter((c) => c.passed).length}/
                                    {compiled.invariantVerification.checks.length} AST Invariants Passed
                                </span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-600 dark:text-slate-300">
                                    Topological Order:{' '}
                                    <strong className="font-mono">
                                        {compiled.topologicalOrder.slice(0, 4).join(' → ')}
                                        {compiled.topologicalOrder.length > 4 ? ' …' : ''}
                                    </strong>
                                </span>
                            </div>

                            {compiled.danglingRefs.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleAutoFixSpec}
                                    className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                                >
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>
                                        {compiled.danglingRefs.length} Dangling $ref (Fallback Active) — Click to Auto-Fix
                                    </span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ROW 3: RESPONSIVE BOTTOM INSPECTOR (VISUAL EXPLORER, 10-POINT LINTER & 5-POINT AST INVARIANTS) */}
            {compiled && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    {/* Bottom Inspector Navigation Bar */}
                    <div className="px-4 sm:px-6 pt-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 overflow-x-auto overscroll-x-contain pb-3 no-scrollbar">
                            <button
                                type="button"
                                onClick={() => setActiveBottomTab('explorer')}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${activeBottomTab === 'explorer'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                                    }`}
                            >
                                <Layers className="w-4 h-4" />
                                <span>
                                    Visual Endpoint &amp; Schema Explorer ({compiled.operations.length} Endpoints • {compiled.schemas.length} Schemas)
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveBottomTab('linter')}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${activeBottomTab === 'linter'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                                    }`}
                            >
                                <Wrench className="w-4 h-4" />
                                <span>
                                    10-Point OpenAPI Linter ({compiled.lintIssues.length} Findings • Score {compiled.specHealthScore}/100)
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveBottomTab('verification')}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${activeBottomTab === 'verification'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                                    }`}
                            >
                                <ShieldCheck className="w-4 h-4" />
                                <span>
                                    5-Point Codegen Invariant Verification
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        {/* TAB 1: VISUAL ENDPOINT & SCHEMA DEPENDENCY EXPLORER */}
                        {activeBottomTab === 'explorer' && (
                            <div className="space-y-6">
                                {/* Search & Method Filter Bar */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={endpointSearch}
                                            onChange={(e) => setEndpointSearch(e.target.value)}
                                            placeholder="Filter endpoints by path, operationId, or summary..."
                                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => setMethodFilter(m)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${methodFilter === m
                                                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Endpoints Table / Cards (7 cols) */}
                                    <div className="lg:col-span-7 space-y-3 min-w-0">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                            <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                                            Normalized API Endpoints ({filteredOperations.length})
                                        </h3>

                                        <div className="space-y-2.5">
                                            {filteredOperations.map((op) => (
                                                <div
                                                    key={op.id}
                                                    className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col gap-2"
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span
                                                                className={`px-2.5 py-0.5 rounded-md text-xs font-extrabold border ${methodBadgeColor(
                                                                    op.method
                                                                )}`}
                                                            >
                                                                {op.method}
                                                            </span>
                                                            <code className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white break-all">
                                                                {op.path}
                                                            </code>
                                                        </div>
                                                        <span className="px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                                                            fn: {op.operationId}()
                                                        </span>
                                                    </div>

                                                    {op.summary && (
                                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                                            {op.summary}
                                                        </p>
                                                    )}

                                                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                                                        <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                                            Params: <strong>{op.parameters.length}</strong>
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                                            Body:{' '}
                                                            <strong>
                                                                {op.requestBodySchema
                                                                    ? op.requestBodySchema.refTarget || op.requestBodySchema.type
                                                                    : 'None'}
                                                            </strong>
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                                                            {op.primarySuccessStatus} Response:{' '}
                                                            <strong>
                                                                {op.primarySuccessSchema
                                                                    ? op.primarySuccessSchema.refTarget || op.primarySuccessSchema.type
                                                                    : 'void'}
                                                            </strong>
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Topological Schema Graph Inspector (5 cols) */}
                                    <div className="lg:col-span-5 space-y-3 min-w-0">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                            <GitBranch className="w-3.5 h-3.5 text-emerald-500" />
                                            Topological $ref Schema Order ({compiled.schemas.length})
                                        </h3>

                                        <div className="space-y-2.5">
                                            {compiled.topologicalOrder.map((schemaName, index) => {
                                                const node = compiled.schemas.find((s) => s.name === schemaName);
                                                if (!node) return null;
                                                const isCircular = compiled.circularSchemas.includes(node.name);
                                                const propEntries = node.properties
                                                    ? Object.entries(node.properties)
                                                    : [];
                                                const reqSet = new Set(node.requiredProperties || []);
                                                return (
                                                    <div
                                                        key={node.name}
                                                        className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2"
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                                                                    #{index + 1}
                                                                </span>
                                                                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white truncate">
                                                                    {node.name}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                {isCircular && (
                                                                    <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-bold">
                                                                        Circular • z.lazy()
                                                                    </span>
                                                                )}
                                                                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-semibold">
                                                                    {node.type}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {node.description && (
                                                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                                                {node.description}
                                                            </p>
                                                        )}

                                                        {propEntries.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                                {propEntries.map(([pKey, pVal]) => (
                                                                    <span
                                                                        key={pKey}
                                                                        className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300"
                                                                    >
                                                                        {pKey}
                                                                        {reqSet.has(pKey) ? (
                                                                            <span className="text-rose-500 font-bold">*</span>
                                                                        ) : (
                                                                            '?'
                                                                        )}
                                                                        :{' '}
                                                                        <span className="text-indigo-600 dark:text-indigo-400">
                                                                            {pVal.refTarget || pVal.format || pVal.type}
                                                                        </span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-3">
                                                            <span>
                                                                Properties: <strong>{propEntries.length}</strong>
                                                            </span>
                                                            <span>
                                                                Required:{' '}
                                                                <strong>{node.requiredProperties?.length ?? 0}</strong>
                                                            </span>
                                                            {node.discriminatorProperty && (
                                                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                                                    Discriminator: {node.discriminatorProperty}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: 10-POINT OPENAPI LINTER & 1-CLICK AUTO-FIX */}
                        {activeBottomTab === 'linter' && (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                Specification Contract Health Score: {compiled.specHealthScore}/100
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded text-xs font-bold ${compiled.specHealthScore >= 90
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                    }`}
                                            >
                                                {compiled.lintIssues.length === 0
                                                    ? 'Clean Spec'
                                                    : `${compiled.lintIssues.length} Linter Issue(s)`}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            Audits Swagger 2.0 legacy constructs, missing operationIds, dangling $ref pointers, circular schema dependencies, undeclared path parameters, union discriminators, and HTTP cleartext servers.
                                        </p>
                                    </div>

                                    {compiled.lintIssues.some((i) => i.autoFixable) && (
                                        <button
                                            type="button"
                                            onClick={handleAutoFixSpec}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold transition shrink-0 shadow-sm"
                                        >
                                            <Wrench className="w-4 h-4" />
                                            <span>1-Click Auto-Fix All Fixable Issues</span>
                                        </button>
                                    )}
                                </div>

                                {compiled.lintIssues.length === 0 ? (
                                    <div className="p-6 text-center rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            Zero Linter Issues Detected
                                        </p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                            All $ref pointers resolve cleanly, explicit operationIds are present, and server endpoints enforce HTTPS.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        {compiled.lintIssues.map((issue) => (
                                            <div
                                                key={issue.id}
                                                className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${issue.severity === 'ERROR'
                                                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                                                : issue.severity === 'WARNING'
                                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                                            }`}
                                                    >
                                                        {issue.severity} • {issue.ruleCode}
                                                    </span>
                                                    <code className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                                                        {issue.location}
                                                    </code>
                                                </div>

                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {issue.title}
                                                </h4>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                                    {issue.detail}
                                                </p>
                                                <div className="pt-1 flex items-center justify-between gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                                    <span>Fix: {issue.recommendation}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: 5-POINT AST & DEPENDENCY GRAPH INVARIANT VERIFICATION */}
                        {activeBottomTab === 'verification' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {compiled.invariantVerification.checks.map((chk) => (
                                    <div
                                        key={chk.id}
                                        className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                {chk.label}
                                            </span>
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${chk.passed
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                    }`}
                                            >
                                                {chk.passed ? (
                                                    <>
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>Verified</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Info className="w-3 h-3" />
                                                        <span>Fallback Active</span>
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                            {chk.detail}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}