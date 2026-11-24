'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
    Code2,
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
    Trash2,
    ChevronDown,
    X,
} from 'lucide-react';
import {
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
    shortBadge: string;
    description: string;
}

const SAMPLE_PRESET_CARDS: SamplePresetCard[] = [
    {
        id: 'stripe_billing_openapi_31',
        title: 'Billing (3.1 YAML)',
        shortBadge: 'Unions',
        description:
            'OpenAPI 3.1 nullable type arrays, oneOf discriminator unions, const literals & UUID/Email formats.',
    },
    {
        id: 'ecommerce_circular_openapi_30',
        title: 'Category Tree (3.0 JSON)',
        shortBadge: 'Circular $ref',
        description:
            'Self-referencing CategoryNode schemas testing DFS cycle detection and automatic z.lazy() protection.',
    },
    {
        id: 'legacy_petstore_swagger_20',
        title: 'Legacy Orders (Swagger 2.0)',
        shortBadge: 'Auto-Fix',
        description:
            'Legacy definitions, in:body params, missing operationId & dangling $ref to test 1-Click Auto-Fix.',
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

/**
 * Lightweight pre-validation for malformed YAML flow syntax (e.g., unclosed brackets)
 * so broken YAML surfaces an explicit syntax error matching JSON behavior.
 */
function detectMalformedYamlSyntax(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) {
        return 'OpenAPI specification input is empty. Paste a YAML or JSON spec or select a sample above.';
    }
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        return null;
    }

    const lines = raw.split(/\r?\n/);
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let squareDepth = 0;
    let curlyDepth = 0;
    let firstUnclosedSquareLine = -1;
    let firstUnclosedCurlyLine = -1;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            const prev = i > 0 ? line[i - 1] : '';

            if (ch === "'" && !inDoubleQuote && prev !== '\\') {
                inSingleQuote = !inSingleQuote;
                continue;
            }
            if (ch === '"' && !inSingleQuote && prev !== '\\') {
                inDoubleQuote = !inDoubleQuote;
                continue;
            }
            if (inSingleQuote || inDoubleQuote) continue;

            if (ch === '#' && (i === 0 || /\s/.test(prev))) {
                break;
            }

            if (ch === '[') {
                if (squareDepth === 0) firstUnclosedSquareLine = lineIdx + 1;
                squareDepth++;
            } else if (ch === ']') {
                squareDepth--;
                if (squareDepth < 0) {
                    return `YAML syntax error on line ${lineIdx + 1}: unexpected closing bracket ']'.`;
                }
            } else if (ch === '{') {
                if (curlyDepth === 0) firstUnclosedCurlyLine = lineIdx + 1;
                curlyDepth++;
            } else if (ch === '}') {
                curlyDepth--;
                if (curlyDepth < 0) {
                    return `YAML syntax error on line ${lineIdx + 1}: unexpected closing brace '}'.`;
                }
            }
        }
    }

    if (squareDepth > 0) {
        return `YAML syntax error on line ${firstUnclosedSquareLine}: unclosed flow sequence '['.`;
    }
    if (curlyDepth > 0) {
        return `YAML syntax error on line ${firstUnclosedCurlyLine}: unclosed flow mapping '{'.`;
    }
    return null;
}

export default function OpenapiToTypescript() {
    const [activeSampleId, setActiveSampleId] = useState<OpenApiSampleId | null>('stripe_billing_openapi_31');
    const [rawSpecText, setRawSpecText] = useState<string>(() =>
        getSampleOpenApiSpec('stripe_billing_openapi_31')
    );
    const [config, setConfig] = useState<OpenApiCodegenConfig>(DEFAULT_CONFIG);
    const [activeOutputTab, setActiveOutputTab] = useState<OutputArtifactTab>('typescript');
    const [activeBottomTab, setActiveBottomTab] = useState<BottomStudioTab>('explorer');
    const [showOptionsDrawer, setShowOptionsDrawer] = useState<boolean>(false);
    const [showInspector, setShowInspector] = useState<boolean>(false);
    const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
    const [copiedOutput, setCopiedOutput] = useState<boolean>(false);
    const [autoFixNotice, setAutoFixNotice] = useState<string | null>(null);
    const [endpointSearch, setEndpointSearch] = useState<string>('');
    const [methodFilter, setMethodFilter] = useState<string>('ALL');

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const compiledState = useMemo(() => {
        const yamlPreError = detectMalformedYamlSyntax(rawSpecText);
        if (yamlPreError) {
            return { result: null, error: yamlPreError };
        }
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

    const handleSelectSample = (sampleId: OpenApiSampleId) => {
        setActiveSampleId(sampleId);
        setRawSpecText(getSampleOpenApiSpec(sampleId));
        setAutoFixNotice(null);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setActiveSampleId(null);
                setRawSpecText(reader.result);
                setAutoFixNotice(`Imported "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleAutoFixSpec = () => {
        try {
            const fixed = autoFixOpenApiSpecText(rawSpecText, config.baseUrlOverride);
            setRawSpecText(fixed);
            setAutoFixNotice(
                'Auto-Fixed: Upgraded to OpenAPI 3.1.0, migrated in:body & response schemas, injected operationIds & scaffolded dangling $refs.'
            );
            setTimeout(() => setAutoFixNotice(null), 5000);
        } catch (err) {
            setAutoFixNotice(
                err instanceof Error ? `Auto-Fix failed: ${err.message}` : 'Could not auto-fix specification.'
            );
        }
    };

    const handleClearEditor = () => {
        setActiveSampleId(null);
        setRawSpecText('');
        setAutoFixNotice(null);
    };

    const currentOutputArtifact = useMemo(() => {
        if (!compiled) {
            return {
                code: '// Fix syntax error in the left OpenAPI editor to view generated output.',
                filename: 'error.txt',
                mime: 'text/plain',
            };
        }
        switch (activeOutputTab) {
            case 'typescript':
                return { code: compiled.typescriptCode, filename: 'api-types.ts', mime: 'text/typescript' };
            case 'zod':
                return { code: compiled.zodSchemasCode, filename: 'api-schemas.zod.ts', mime: 'text/typescript' };
            case 'msw':
                return { code: compiled.mswHandlersCode, filename: 'msw-handlers.ts', mime: 'text/typescript' };
            case 'client':
                return { code: compiled.fetchAndTanstackClientCode, filename: 'api-client.ts', mime: 'text/typescript' };
            case 'mock_json':
                return { code: compiled.mockPayloadsJson, filename: 'mock-payloads.json', mime: 'application/json' };
            case 'openapi_31':
                return { code: compiled.normalizedOpenApi31Json, filename: 'openapi-3.1.normalized.json', mime: 'application/json' };
        }
    }, [compiled, activeOutputTab]);

    const outputLines = useMemo(
        () => currentOutputArtifact.code.split('\n'),
        [currentOutputArtifact.code]
    );

    const inputLineCount = useMemo(() => rawSpecText.split('\n').length, [rawSpecText]);

    const handleCopyOutput = async () => {
        try {
            await navigator.clipboard.writeText(currentOutputArtifact.code);
            setCopiedOutput(true);
            setTimeout(() => setCopiedOutput(false), 2000);
        } catch {
            // Fallback
        }
    };

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
        <div className="w-full max-w-7xl mx-auto space-y-3.5 min-w-0">
            {/* ============================================================================
                SINGLE SLEEK TOOLBAR (SAMPLES + HEALTH + OPTIONS TOGGLE)
                ============================================================================ */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-xs space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                    {/* Sample Selector Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 inline-flex items-center gap-1 mr-1">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            Examples:
                        </span>
                        {SAMPLE_PRESET_CARDS.map((sample) => {
                            const isSelected = activeSampleId === sample.id;
                            return (
                                <button
                                    key={sample.id}
                                    type="button"
                                    onClick={() => handleSelectSample(sample.id)}
                                    title={sample.description}
                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${isSelected
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                            : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                                        }`}
                                >
                                    {sample.title}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Side: Subtle Health Pill + Options Drawer Button */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {compiled && (
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveBottomTab('linter');
                                    setShowInspector(true);
                                }}
                                title="Click to open 10-Point Linter"
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-semibold border transition ${compiled.specHealthScore >= 90
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                                    }`}
                            >
                                <span>{compiled.detectedSpecVersion}</span>
                                <span>·</span>
                                <span>Health {compiled.specHealthScore}/100</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setShowOptionsDrawer((v) => !v)}
                            aria-expanded={showOptionsDrawer}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${showOptionsDrawer
                                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400'
                                }`}
                        >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Options</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showOptionsDrawer ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Collapsible Compiler Options Drawer (keeps workspace serene; values retained when collapsed) */}
                {showOptionsDrawer && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
                            <div>
                                <label htmlFor="ts-decl-style" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                    TS Declaration
                                </label>
                                <select
                                    id="ts-decl-style"
                                    value={config.declarationStyle}
                                    onChange={(e) =>
                                        setConfig((prev) => ({
                                            ...prev,
                                            declarationStyle: e.target.value as TsDeclarationStyle,
                                        }))
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                                >
                                    <option value="interface">export interface</option>
                                    <option value="type">export type =</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="ts-enum-style" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                    Enum Style
                                </label>
                                <select
                                    id="ts-enum-style"
                                    value={config.enumStyle}
                                    onChange={(e) =>
                                        setConfig((prev) => ({
                                            ...prev,
                                            enumStyle: e.target.value as TsEnumStyle,
                                        }))
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                                >
                                    <option value="union">Literal Union</option>
                                    <option value="const_object">as const Object</option>
                                    <option value="ts_enum">TS enum</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="zod-strictness" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                    Zod Strictness
                                </label>
                                <select
                                    id="zod-strictness"
                                    value={config.zodStrictness}
                                    onChange={(e) =>
                                        setConfig((prev) => ({
                                            ...prev,
                                            zodStrictness: e.target.value as ZodStrictnessMode,
                                        }))
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                                >
                                    <option value="strict">.strict()</option>
                                    <option value="default">Default (Strip)</option>
                                    <option value="passthrough">.passthrough()</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="mock-seed-input" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                    Mock Seed
                                </label>
                                <input
                                    id="mock-seed-input"
                                    type="number"
                                    value={config.mockSeed}
                                    onChange={(e) =>
                                        setConfig((prev) => ({ ...prev, mockSeed: Number(e.target.value) || 1 }))
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200"
                                />
                            </div>

                            <div>
                                <label htmlFor="mock-array-len" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                    Array Items (1–5)
                                </label>
                                <input
                                    id="mock-array-len"
                                    type="number"
                                    min={1}
                                    max={5}
                                    value={config.mockArrayLength}
                                    onChange={(e) =>
                                        setConfig((prev) => ({
                                            ...prev,
                                            mockArrayLength: Math.min(5, Math.max(1, Number(e.target.value) || 2)),
                                        }))
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200"
                                />
                            </div>

                            <div>
                                <label htmlFor="base-url-override" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                    Base URL Override
                                </label>
                                <input
                                    id="base-url-override"
                                    type="text"
                                    value={config.baseUrlOverride}
                                    onChange={(e) =>
                                        setConfig((prev) => ({ ...prev, baseUrlOverride: e.target.value }))
                                    }
                                    placeholder="https://api.acme.io/v1"
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                                <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.readonlyProperties}
                                        onChange={(e) =>
                                            setConfig((prev) => ({ ...prev, readonlyProperties: e.target.checked }))
                                        }
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>readonly props</span>
                                </label>

                                <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.optionalWithNullish}
                                        onChange={(e) =>
                                            setConfig((prev) => ({ ...prev, optionalWithNullish: e.target.checked }))
                                        }
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>.nullish()</span>
                                </label>

                                <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.coerceQueryAndPathParams}
                                        onChange={(e) =>
                                            setConfig((prev) => ({ ...prev, coerceQueryAndPathParams: e.target.checked }))
                                        }
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>z.coerce query</span>
                                </label>

                                <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.includeJsDocComments}
                                        onChange={(e) =>
                                            setConfig((prev) => ({ ...prev, includeJsDocComments: e.target.checked }))
                                        }
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>JSDoc</span>
                                </label>

                                <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.emitZodInferTypes}
                                        onChange={(e) =>
                                            setConfig((prev) => ({ ...prev, emitZodInferTypes: e.target.checked }))
                                        }
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>z.infer</span>
                                </label>
                            </div>

                            <button
                                type="button"
                                onClick={() => setConfig(DEFAULT_CONFIG)}
                                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400"
                            >
                                Reset defaults
                            </button>
                        </div>
                    </div>
                )}

                {autoFixNotice && (
                    <div
                        role="status"
                        className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <span className="truncate">{autoFixNotice}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAutoFixNotice(null)}
                            aria-label="Dismiss notice"
                            className="p-0.5 hover:opacity-75 shrink-0"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* ============================================================================
                50/50 CLEAN SPLIT WORKBENCH (LEFT: OPENAPI INPUT | RIGHT: GENERATED CODE)
                ============================================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                {/* LEFT PANE: OPENAPI / SWAGGER INPUT */}
                <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden min-w-0">
                    <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <Braces className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                OpenAPI / Swagger Input
                            </span>
                            <span className="hidden sm:inline text-[11px] font-mono text-slate-400">
                                {inputLineCount} lines
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
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
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold transition"
                                title="Import a local .yaml, .yml, or .json OpenAPI file"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Import</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleAutoFixSpec}
                                disabled={!rawSpecText.trim()}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition"
                                title="Upgrade Swagger 2.0 to OpenAPI 3.1, inject operationIds & scaffold dangling $refs"
                            >
                                <Wrench className="w-3.5 h-3.5" />
                                <span>Auto-Fix</span>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setRawSpecText(
                                        getSampleOpenApiSpec(activeSampleId || 'stripe_billing_openapi_31')
                                    )
                                }
                                title="Reset to sample"
                                aria-label="Reset editor to sample"
                                className="p-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            <button
                                type="button"
                                onClick={handleClearEditor}
                                disabled={!rawSpecText}
                                title="Clear input"
                                aria-label="Clear input editor"
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-40 text-slate-600 dark:text-slate-400 transition"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <div className="relative flex-1 flex flex-col min-h-[460px] lg:min-h-[540px]">
                        <textarea
                            aria-label="OpenAPI or Swagger YAML/JSON input"
                            value={rawSpecText}
                            onChange={(e) => setRawSpecText(e.target.value)}
                            spellCheck={false}
                            placeholder="Paste your OpenAPI 3.1, 3.0, or Swagger 2.0 YAML or JSON specification here..."
                            className="w-full flex-1 p-4 font-mono text-xs sm:text-[13px] leading-relaxed bg-slate-950 text-slate-100 placeholder-slate-500 focus:outline-none resize-y min-h-[460px] lg:min-h-[540px] max-h-[640px] overflow-x-auto overscroll-x-contain"
                        />
                    </div>

                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        {compiledState.error ? (
                            <div role="alert" className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold min-w-0">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span className="break-words">{compiledState.error}</span>
                            </div>
                        ) : compiled ? (
                            <div className="flex flex-wrap items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                <span className="inline-flex items-center gap-1 font-sans font-semibold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Synced
                                </span>
                                <span>·</span>
                                <span>{compiled.schemas.length} schemas</span>
                                <span>·</span>
                                <span>{compiled.operations.length} endpoints</span>
                                {compiled.circularSchemas.length > 0 && (
                                    <>
                                        <span>·</span>
                                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                            {compiled.circularSchemas.length} z.lazy()
                                        </span>
                                    </>
                                )}
                            </div>
                        ) : null}
                        <span className="text-[11px] text-slate-400">Local browser processing</span>
                    </div>
                </div>

                {/* RIGHT PANE: GENERATED CODE & MOCK OUTPUT */}
                <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden min-w-0">
                    <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                {currentOutputArtifact.filename}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                            <button
                                type="button"
                                onClick={handleCopyOutput}
                                disabled={!compiled}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition"
                            >
                                {copiedOutput ? (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadArtifact}
                                disabled={!compiled}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-semibold transition"
                                title={`Download ${currentOutputArtifact.filename}`}
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadXlsx}
                                disabled={!compiled}
                                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition"
                                title="Download 3-Sheet Excel (.xlsx) API Contract Inventory"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                <span>.XLSX</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadCsv}
                                disabled={!compiled}
                                className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-400 disabled:opacity-50 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold transition"
                                title="Download CSV Endpoint Inventory"
                            >
                                .CSV
                            </button>
                        </div>
                    </div>

                    {/* All 6 Output Tabs Wrapped Cleanly (zero horizontal clipping) */}
                    <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-1.5">
                        <div role="tablist" aria-label="Generated output formats" className="flex flex-wrap items-center gap-1">
                            {[
                                { id: 'typescript' as const, label: 'TypeScript' },
                                { id: 'zod' as const, label: 'Zod' },
                                { id: 'msw' as const, label: 'MSW v2' },
                                { id: 'client' as const, label: 'Fetch + Query' },
                                { id: 'mock_json' as const, label: 'Mock JSON' },
                                { id: 'openapi_31' as const, label: 'OpenAPI 3.1' },
                            ].map((tab) => {
                                const active = activeOutputTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setActiveOutputTab(tab.id)}
                                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${active
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowLineNumbers((v) => !v)}
                            className="text-[11px] font-mono text-slate-400 hover:text-white transition shrink-0"
                        >
                            {showLineNumbers ? 'Hide #' : 'Show #'}
                        </button>
                    </div>

                    <div className="relative flex-1 bg-slate-950 text-slate-100 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto overscroll-x-contain overflow-y-auto min-h-[460px] lg:min-h-[540px] max-h-[640px] p-4">
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

                    {compiled && (
                        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                {compiled.invariantVerification.checks.filter((c) => c.passed).length}/
                                {compiled.invariantVerification.checks.length} Invariants Verified
                            </span>

                            {compiled.danglingRefs.length > 0 ? (
                                <button
                                    type="button"
                                    onClick={handleAutoFixSpec}
                                    className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                                >
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>{compiled.danglingRefs.length} Dangling $ref — Auto-Fix</span>
                                </button>
                            ) : (
                                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
                                    {compiled.topologicalOrder.slice(0, 3).join(' → ')}
                                    {compiled.topologicalOrder.length > 3 ? ' …' : ''}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ============================================================================
                COLLAPSIBLE INSPECTOR DRAWER (ENDPOINTS, 10-POINT LINTER & 5 INVARIANTS)
                ============================================================================ */}
            {compiled && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-2">
                        <div role="tablist" aria-label="Specification inspector views" className="flex flex-wrap items-center gap-1.5">
                            {[
                                {
                                    id: 'explorer' as const,
                                    icon: Layers,
                                    label: `Endpoints & Schemas (${compiled.operations.length} · ${compiled.schemas.length})`,
                                },
                                {
                                    id: 'linter' as const,
                                    icon: Wrench,
                                    label: `10-Point Linter (${compiled.lintIssues.length})`,
                                },
                                {
                                    id: 'verification' as const,
                                    icon: ShieldCheck,
                                    label: '5-Point Invariants',
                                },
                            ].map((tab) => {
                                const Icon = tab.icon;
                                const active = showInspector && activeBottomTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => {
                                            if (showInspector && activeBottomTab === tab.id) {
                                                setShowInspector(false);
                                            } else {
                                                setActiveBottomTab(tab.id);
                                                setShowInspector(true);
                                            }
                                        }}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${active
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                            }`}
                                    >
                                        <Icon className="w-3.5 h-3.5 shrink-0" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowInspector((v) => !v)}
                            aria-expanded={showInspector}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400"
                        >
                            <span>{showInspector ? 'Hide Inspector' : 'Open Inspector'}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showInspector ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {showInspector && (
                        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800">
                            {activeBottomTab === 'explorer' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="relative flex-1 max-w-md">
                                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={endpointSearch}
                                                onChange={(e) => setEndpointSearch(e.target.value)}
                                                placeholder="Filter endpoints by path or operationId..."
                                                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1">
                                            {['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => setMethodFilter(m)}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${methodFilter === m
                                                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                        <div className="lg:col-span-7 space-y-2 min-w-0">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                                <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                                                Endpoints ({filteredOperations.length})
                                            </h3>
                                            {filteredOperations.map((op) => (
                                                <div
                                                    key={op.id}
                                                    className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5"
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${methodBadgeColor(op.method)}`}>
                                                                {op.method}
                                                            </span>
                                                            <code className="font-mono text-xs font-bold text-slate-900 dark:text-white break-all">
                                                                {op.path}
                                                            </code>
                                                        </div>
                                                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                                            {op.operationId}()
                                                        </span>
                                                    </div>
                                                    {op.summary && (
                                                        <p className="text-xs text-slate-600 dark:text-slate-400">{op.summary}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="lg:col-span-5 space-y-2 min-w-0">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                                <GitBranch className="w-3.5 h-3.5 text-emerald-500" />
                                                Topological Schema Order ({compiled.schemas.length})
                                            </h3>
                                            {compiled.topologicalOrder.map((schemaName, index) => {
                                                const node = compiled.schemas.find((s) => s.name === schemaName);
                                                if (!node) return null;
                                                const isCircular = compiled.circularSchemas.includes(node.name);
                                                return (
                                                    <div
                                                        key={node.name}
                                                        className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                                                                {index + 1}
                                                            </span>
                                                            <span className="font-mono font-semibold text-xs text-slate-900 dark:text-white truncate">
                                                                {node.name}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            {isCircular && (
                                                                <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                                                                    z.lazy()
                                                                </span>
                                                            )}
                                                            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                                                                {node.type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeBottomTab === 'linter' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                                        <div>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                Contract Health Score: {compiled.specHealthScore}/100
                                            </span>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Audits Swagger 2.0 constructs, operationIds, dangling $refs, circular refs, path params &amp; HTTPS servers.
                                            </p>
                                        </div>
                                        {compiled.lintIssues.some((i) => i.autoFixable) && (
                                            <button
                                                type="button"
                                                onClick={handleAutoFixSpec}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0"
                                            >
                                                <Wrench className="w-3.5 h-3.5" />
                                                <span>1-Click Auto-Fix</span>
                                            </button>
                                        )}
                                    </div>

                                    {compiled.lintIssues.length === 0 ? (
                                        <div className="p-5 text-center rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 text-xs text-emerald-800 dark:text-emerald-200 font-medium">
                                            Zero linter issues detected. All $ref pointers resolve cleanly and servers enforce HTTPS.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {compiled.lintIssues.map((issue) => (
                                                <div
                                                    key={issue.id}
                                                    className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                            {issue.severity} · {issue.ruleCode}
                                                        </span>
                                                        <code className="text-[11px] text-slate-500 truncate max-w-[180px]">
                                                            {issue.location}
                                                        </code>
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{issue.title}</h4>
                                                    <p className="text-slate-600 dark:text-slate-400">{issue.detail}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeBottomTab === 'verification' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {compiled.invariantVerification.checks.map((chk) => (
                                        <div
                                            key={chk.id}
                                            className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-bold text-slate-700 dark:text-slate-200">{chk.label}</span>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${chk.passed
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                        }`}
                                                >
                                                    {chk.passed ? <CheckCircle2 className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                                                    <span>{chk.passed ? 'Verified' : 'Fallback'}</span>
                                                </span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400">{chk.detail}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
