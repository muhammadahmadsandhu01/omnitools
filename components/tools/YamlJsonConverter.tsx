'use client';

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useDeferredValue,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import {
  ArrowRightLeft,
  Code2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Copy,
  Check,
  Trash2,
  Upload,
  Download,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  FileJson,
  FileCode,
  Layers,
  SlidersHorizontal,
  Wand2,
  Terminal,
  Hash,
} from 'lucide-react';

import {
  YAML_JSON_SAMPLE_PRESETS,
  MAX_SAFE_YAML_JSON_BYTES,
  getDefaultYamlJsonOptions,
  convertAndValidateYamlJson,
  quoteAmbiguousScalarsInYaml,
  exportYamlJsonAuditCsv,
  exportYamlJsonAuditXlsx,
  formatJsonOutput,
  type YamlJsonConversionOptions,
  type ConversionDirection,
  type YamlSpecVersion,
  type MultiDocOutputMode,
  type BigIntHandlingMode,
  type YamlQuoteStyle,
  type DevOpsSchemaType,
} from '@/lib/yamlJsonConverterEngine';

type OutputInspectorTab =
  | 'converted_output'
  | 'diagnostics_linter'
  | 'norway_bigint_xray'
  | 'comments_sidecar'
  | 'multi_doc_explorer';

export default function YamlJsonConverter() {
  // 1. Input Text & Deferred Real-Time Parsing
  const [rawInput, setRawInput] = useState<string>(
    YAML_JSON_SAMPLE_PRESETS[0].content
  );
  const deferredInput = useDeferredValue(rawInput);

  // 2. Conversion & Validation Options
  const [options, setOptions] = useState<YamlJsonConversionOptions>(
    getDefaultYamlJsonOptions
  );

  // 3. Active Output Inspector Tab & Multi-Doc Selection
  const [activeTab, setActiveTab] =
    useState<OutputInspectorTab>('converted_output');
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);

  // 4. UI Feedback State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string>('');
  const [errorBanner, setErrorBanner] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Run Main Conversion, CST Validation, Norway Trap Diff & DevOps Linter
  const result = useMemo(
    () => convertAndValidateYamlJson(deferredInput, options),
    [deferredInput, options]
  );

  // Handler: Load Sample Preset
  const handleSelectSample = useCallback((sampleId: string) => {
    const found = YAML_JSON_SAMPLE_PRESETS.find((s) => s.id === sampleId);
    if (!found) return;
    setRawInput(found.content);
    setOptions((prev) => ({
      ...prev,
      direction: found.direction,
    }));
    setSelectedDocIndex(0);
    setStatusBanner(`Loaded sample preset: ${found.label}`);
    setErrorBanner('');
  }, []);

  // Handler: Swap Input & Output (Bidirectional Round-Trip)
  const handleSwapDirection = useCallback(() => {
    if (!result.outputText) return;
    const nextDirection: ConversionDirection =
      result.resolvedDirection === 'yaml_to_json'
        ? 'json_to_yaml'
        : 'yaml_to_json';
    setRawInput(result.outputText);
    setOptions((prev) => ({
      ...prev,
      direction: nextDirection,
    }));
    setActiveTab('converted_output');
    setStatusBanner(
      `Swapped output into input editor (${nextDirection === 'yaml_to_json' ? 'YAML → JSON' : 'JSON → YAML'}).`
    );
  }, [result.outputText, result.resolvedDirection]);

  // Handler: 1-Click Auto-Quote All YAML 1.1 Norway Trap Scalars
  const handleAutoQuoteNorwayTraps = useCallback(() => {
    const fixed = quoteAmbiguousScalarsInYaml(rawInput);
    setRawInput(fixed);
    setStatusBanner(
      'Auto-quoted all ambiguous YAML 1.1 vs 1.2 scalars (NO, on, off, yes, octal, sexagesimal).'
    );
  }, [rawInput]);

  // Handler: Copy to Clipboard
  const handleCopy = useCallback(async (text: string, key: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2000);
    } catch {
      // Fallback
    }
  }, []);

  // Handler: File Upload (.yaml, .yml, .json, .jsonc)
  const processUploadedFile = useCallback((file: File) => {
    if (file.size > MAX_SAFE_YAML_JSON_BYTES) {
      setErrorBanner('File exceeds the 15 MB local browser safety limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = typeof e.target?.result === 'string' ? e.target.result : '';
      const lower = file.name.toLowerCase();
      const autoDir: ConversionDirection =
        lower.endsWith('.json') || lower.endsWith('.jsonc')
          ? 'json_to_yaml'
          : lower.endsWith('.yaml') || lower.endsWith('.yml')
            ? 'yaml_to_json'
            : 'auto_detect';
      setRawInput(content);
      setOptions((prev) => ({ ...prev, direction: autoDir }));
      setStatusBanner(
        `Loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB) locally.`
      );
      setErrorBanner('');
    };
    reader.readAsText(file);
  }, []);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processUploadedFile(file);
      e.target.value = '';
    },
    [processUploadedFile]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processUploadedFile(file);
    },
    [processUploadedFile]
  );

  // Handler: Trigger File Downloads (.json, .yaml, .ndjson, .csv, .xlsx)
  const triggerDownload = useCallback(
    (content: string | Uint8Array, filename: string, mimeType: string) => {
      const blob =
        content instanceof Uint8Array
          ? new Blob([content as unknown as BlobPart], { type: mimeType })
          : new Blob([content], { type: `${mimeType};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    []
  );

  const outputExt =
    result.resolvedDirection === 'yaml_to_json'
      ? options.multiDocMode === 'ndjson' && result.metrics.documentCount > 1
        ? 'ndjson'
        : 'json'
      : 'yaml';

  return (
    <div className="w-full min-w-0 max-w-full space-y-6">
      {/* ============================================================================
          TOP BAR: SAMPLE PRESETS & 100% CLIENT-SIDE PRIVACY BADGES
         ============================================================================ */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              YAML 1.2 &amp; 1.1 Bidirectional CST Studio
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              100% Client-Side RAM (Zero Server Upload)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              DevOps Sample Packs:
            </span>
            {YAML_JSON_SAMPLE_PRESETS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample.id)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50/60 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-500"
              >
                {sample.badge}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setRawInput('');
                setStatusBanner('Cleared editor workspace.');
                setErrorBanner('');
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================================
          CONFIGURATION & SPEC CONTROL BAR
         ============================================================================ */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {/* 1. Conversion Direction */}
          <div className="space-y-1 min-w-0">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Direction
            </label>
            <select
              aria-label="Conversion Direction"
              value={options.direction}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  direction: e.target.value as ConversionDirection,
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="yaml_to_json">YAML → JSON</option>
              <option value="json_to_yaml">JSON / JSONC → YAML</option>
              <option value="auto_detect">
                Auto-Detect ({result.resolvedDirection === 'yaml_to_json' ? 'YAML' : 'JSON'})
              </option>
            </select>
          </div>

          {/* 2. YAML Specification Version (1.2 vs 1.1) */}
          <div className="space-y-1 min-w-0">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. YAML Spec Version
            </label>
            <select
              aria-label="YAML Specification Version"
              value={options.yamlSpec}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  yamlSpec: e.target.value as YamlSpecVersion,
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="1.2">YAML 1.2 Strict (NO=&quot;NO&quot;)</option>
              <option value="1.1">YAML 1.1 Legacy (NO=false)</option>
            </select>
          </div>

          {/* 3. Multi-Document (`---`) Output Mode */}
          <div className="space-y-1 min-w-0">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              3. Multi-Doc (---) Mode
            </label>
            <select
              aria-label="Multi-Document Output Mode"
              value={options.multiDocMode}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  multiDocMode: e.target.value as MultiDocOutputMode,
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="json_array">JSON Array ([doc1, doc2])</option>
              <option value="ndjson">NDJSON / JSON Lines (1/line)</option>
              <option value="first_document">First Document Only</option>
            </select>
          </div>

          {/* 4. 64-Bit BigInt Precision Guard */}
          <div className="space-y-1 min-w-0">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              4. 64-Bit BigInt Guard
            </label>
            <select
              aria-label="64-Bit BigInt Handling Mode"
              value={options.bigintMode}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  bigintMode: e.target.value as BigIntHandlingMode,
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="exact_number">Exact Unquoted Number</option>
              <option value="string_preserve">Preserve as String (&quot;...&quot;)</option>
              <option value="float_coerce">Standard JS Number (Float64)</option>
            </select>
          </div>

          {/* 5. DevOps Schema Linter */}
          <div className="space-y-1 min-w-0">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              5. DevOps Schema Linter
            </label>
            <select
              aria-label="DevOps Schema Linter"
              value={options.devOpsSchema}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  devOpsSchema: e.target.value as DevOpsSchemaType,
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="auto">
                Auto-Detect ({result.metrics.detectedSchema})
              </option>
              <option value="kubernetes">Kubernetes (K8s)</option>
              <option value="docker_compose">Docker Compose</option>
              <option value="github_actions">GitHub Actions</option>
              <option value="openapi">OpenAPI 3.x / Swagger</option>
              <option value="none">Disable Schema Linter</option>
            </select>
          </div>

          {/* 6. Indentation & Formatting */}
          <div className="space-y-1 min-w-0">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              6. Indentation / Quote
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <select
                aria-label="Indentation Spaces"
                value={options.indentSpaces}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    indentSpaces: Number(e.target.value) as 2 | 4 | 0,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value={2}>2 Spaces</option>
                <option value={4}>4 Spaces</option>
                <option value={0}>Minify (0)</option>
              </select>
              <select
                aria-label="YAML Quote Style"
                value={options.yamlQuoteStyle}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    yamlQuoteStyle: e.target.value as YamlQuoteStyle,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="minimal">Minimal</option>
                <option value="single">Single &apos;</option>
                <option value="double">Double &quot;</option>
              </select>
            </div>
          </div>
        </div>

        {/* Toggle Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {[
              {
                key: 'resolveMergeKeys' as const,
                label: 'Resolve << Merge Keys',
              },
              {
                key: 'detectDuplicateKeys' as const,
                label: 'Flag Duplicate Keys',
              },
              {
                key: 'preserveCommentsAsJsonc' as const,
                label: 'Preserve # ↔ // Comments (JSONC)',
              },
              {
                key: 'sortKeys' as const,
                label: 'Sort Keys Alphabetically',
              },
            ].map((pill) => {
              const active = options[pill.key];
              return (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() =>
                    setOptions((prev) => ({
                      ...prev,
                      [pill.key]: !prev[pill.key],
                    }))
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${active
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {result.norwayTraps.length > 0 && (
              <button
                type="button"
                onClick={handleAutoQuoteNorwayTraps}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-amber-600"
              >
                <Wand2 className="h-3.5 w-3.5" />
                Auto-Quote {result.norwayTraps.length} Norway Traps
              </button>
            )}

            <button
              type="button"
              onClick={handleSwapDirection}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Swap Input ↔ Output
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================================
          LIVE KPI TELEMETRY STRIP (6 CARDS)
         ============================================================================ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Syntax &amp; Schema Status
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            {result.isValid ? (
              <span className="inline-flex items-center gap-1 text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Valid {result.resolvedDirection === 'yaml_to_json' ? 'YAML' : 'JSON'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-base font-extrabold text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-4 w-4" />
                {result.metrics.errorsCount} Error(s)
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Documents &amp; Keys
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {result.metrics.documentCount}
            </span>
            <span className="text-xs text-slate-500">
              doc(s) • {result.metrics.totalKeysCount} keys
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Norway 1.1 vs 1.2 Traps
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {result.metrics.norwayTrapsCount}
            </span>
            <span className="text-xs text-slate-500">NO / on / octal</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Anchors &amp; &lt;&lt; Merges
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
              {result.metrics.anchorsDefinedCount}
            </span>
            <span className="text-xs text-slate-500">
              &amp; • {result.metrics.mergeKeysResolvedCount} &lt;&lt; merged
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            64-Bit BigInt Guard
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {result.metrics.bigIntCount}
            </span>
            <span className="text-xs text-slate-500">&gt; 2^53-1 protected</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Parse Speed
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {result.metrics.executionTimeMs}
            </span>
            <span className="text-xs text-slate-500">ms in RAM</span>
          </div>
        </div>
      </div>

      {/* ============================================================================
          DUAL-PANE WORKBENCH (LEFT: SOURCE EDITOR | RIGHT: MULTI-TAB OUTPUT & X-RAY)
         ============================================================================ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT PANE: INPUT SOURCE EDITOR + DRAG & DROP */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col rounded-3xl border bg-white p-4 sm:p-5 shadow-xs transition dark:bg-slate-900 min-w-0 ${isDragging
              ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/30'
              : 'border-slate-200 dark:border-slate-800'
            }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Source {result.resolvedDirection === 'yaml_to_json' ? 'YAML' : 'JSON / JSONC'} Input
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {result.metrics.inputLines} lines • {result.metrics.inputBytes} B
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".yaml,.yml,.json,.jsonc,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload (.YAML / .JSON)
              </button>
            </div>
          </div>

          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            rows={18}
            spellCheck={false}
            placeholder="Paste your YAML manifest, multi-document Kubernetes stream (---), Docker Compose, GitHub Actions workflow, or JSON/JSONC payload here..."
            className="mt-3 w-full flex-1 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 font-mono text-xs leading-relaxed text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-100"
          />

          {/* Inline Error Line Banner if invalid */}
          {!result.isValid && result.diagnostics.length > 0 && (
            <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  Line {result.diagnostics[0].line}, Column{' '}
                  {result.diagnostics[0].column}: {result.diagnostics[0].message}
                </span>
              </div>
              {result.diagnostics[0].snippet && (
                <pre className="mt-1 rounded-lg bg-rose-950/90 p-2 font-mono text-[11px] text-rose-200 overflow-x-auto">
                  {result.diagnostics[0].snippet}
                </pre>
              )}
              <div className="text-[11px] font-medium text-rose-700 dark:text-rose-300">
                Fix: {result.diagnostics[0].suggestion}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANE: MULTI-TAB CONVERTED OUTPUT, LINTER & NORWAY TRAP X-RAY */}
        <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 min-w-0 space-y-3">
          {/* Output Inspector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('converted_output')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${activeTab === 'converted_output'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
              >
                Converted {result.resolvedDirection === 'yaml_to_json' ? 'JSON' : 'YAML'}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('diagnostics_linter')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${activeTab === 'diagnostics_linter'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
              >
                Linter &amp; Diagnostics ({result.diagnostics.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('norway_bigint_xray')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${activeTab === 'norway_bigint_xray'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300'
                  }`}
              >
                Norway &amp; BigInt X-Ray (
                {result.norwayTraps.length + result.bigIntFindings.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('comments_sidecar')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${activeTab === 'comments_sidecar'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
              >
                Comments ({result.comments.length})
              </button>

              {result.documents.length > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('multi_doc_explorer')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${activeTab === 'multi_doc_explorer'
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-300'
                    }`}
                >
                  Stream Docs ({result.documents.length})
                </button>
              )}
            </div>

            {/* Copy & Export Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleCopy(result.outputText, 'copy-main-output')}
                className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
              >
                {copiedKey === 'copy-main-output' ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Output</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  triggerDownload(
                    result.outputText,
                    `kivarotools-converted.${outputExt}`,
                    outputExt === 'yaml' ? 'text/yaml' : 'application/json'
                  )
                }
                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Download className="h-3.5 w-3.5" />
                .{outputExt.toUpperCase()}
              </button>

              <button
                type="button"
                onClick={() => {
                  const csv = exportYamlJsonAuditCsv(result);
                  triggerDownload(
                    csv,
                    'kivarotools-yaml-json-audit.csv',
                    'text/csv'
                  );
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Download className="h-3.5 w-3.5" />
                Audit .CSV
              </button>

              <button
                type="button"
                onClick={() => {
                  const xlsx = exportYamlJsonAuditXlsx(result);
                  triggerDownload(
                    xlsx,
                    'kivarotools-yaml-json-audit.xlsx',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                  );
                }}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Audit .XLSX
              </button>
            </div>
          </div>

          {/* TAB 1: CONVERTED OUTPUT */}
          {activeTab === 'converted_output' && (
            <textarea
              readOnly
              value={
                result.outputText ||
                (result.isValid
                  ? ''
                  : '// Fix syntax errors in the source editor to generate output.')
              }
              rows={18}
              spellCheck={false}
              className="w-full flex-1 rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-300 focus:outline-none dark:border-slate-800"
            />
          )}

          {/* TAB 2: DIAGNOSTICS & DEVOPS SCHEMA LINTER */}
          {activeTab === 'diagnostics_linter' && (
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[430px] pr-1">
              {result.diagnostics.length === 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center dark:border-emerald-900/50 dark:bg-emerald-950/30">
                  <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  <p className="mt-2 text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Zero Syntax or DevOps Schema Issues Found
                  </p>
                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                    Detected Schema: <strong>{result.metrics.detectedSchema}</strong> •{' '}
                    {result.metrics.documentCount} document(s) verified.
                  </p>
                </div>
              ) : (
                result.diagnostics.map((d) => (
                  <div
                    key={d.id}
                    className={`rounded-2xl border p-3.5 text-xs space-y-1.5 ${d.severity === 'error'
                        ? 'border-rose-200 bg-rose-50/70 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200'
                        : d.severity === 'warning'
                          ? 'border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200'
                          : 'border-blue-200 bg-blue-50/70 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-bold">
                      <span>
                        [{d.severity.toUpperCase()}] {d.code} — Line {d.line}, Col{' '}
                        {d.column}
                      </span>
                      <span className="font-mono text-[11px] opacity-80">
                        {d.keyPath}
                      </span>
                    </div>
                    <p>{d.message}</p>
                    <p className="font-semibold opacity-90">
                      Recommendation: {d.suggestion}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: NORWAY 1.1 VS 1.2 TRAPS & 64-BIT BIGINT X-RAY */}
          {activeTab === 'norway_bigint_xray' && (
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[430px] pr-1">
              {result.norwayTraps.length === 0 &&
                result.bigIntFindings.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 text-center dark:border-slate-800 dark:bg-slate-800/30">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No YAML 1.1 Coercion Traps or Unsafe 64-Bit Integers Detected
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Every scalar in your document evaluates identically across YAML 1.1, YAML 1.2, and IEEE-754 JSON.
                  </p>
                </div>
              ) : (
                <>
                  {result.norwayTraps.map((trap) => (
                    <div
                      key={trap.id}
                      className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs space-y-1.5 dark:border-amber-900/50 dark:bg-amber-950/30"
                    >
                      <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-200">
                        <span>
                          Line {trap.line} • Token: <code>{trap.rawToken}</code>
                        </span>
                        <span className="font-mono text-[11px]">
                          {trap.keyPath}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">
                        {trap.reason}
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                        <div className="rounded-lg bg-white p-2 border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                          <span className="text-blue-600 font-bold">YAML 1.2:</span>{' '}
                          {trap.yaml12Value} ({trap.yaml12Type})
                        </div>
                        <div className="rounded-lg bg-white p-2 border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                          <span className="text-amber-600 font-bold">YAML 1.1:</span>{' '}
                          {trap.yaml11Value} ({trap.yaml11Type})
                        </div>
                      </div>
                    </div>
                  ))}

                  {result.bigIntFindings.map((bi, idx) => (
                    <div
                      key={`bi-${idx}`}
                      className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs space-y-1.5 dark:border-emerald-900/50 dark:bg-emerald-950/30"
                    >
                      <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200">
                        <span>
                          Line {bi.line} • 64-Bit Integer Protected (&gt; 2^53 - 1)
                        </span>
                        <span className="font-mono text-[11px]">{bi.keyPath}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                        <div className="rounded-lg bg-white p-2 border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                          <span className="text-emerald-600 font-bold">
                            Preserved:
                          </span>{' '}
                          {bi.exactDigits}
                        </div>
                        <div className="rounded-lg bg-white p-2 border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                          <span className="text-rose-600 font-bold">
                            Standard JS Float64:
                          </span>{' '}
                          {bi.truncatedFloat}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* TAB 4: COMMENTS SIDECAR MAP */}
          {activeTab === 'comments_sidecar' && (
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[430px] pr-1">
              {result.comments.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 text-center dark:border-slate-800 dark:bg-slate-800/30">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No # or // Comments Found in Source
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Any YAML # comments or JSONC // comments in your input will be indexed here by line number.
                  </p>
                </div>
              ) : (
                result.comments.map((c, idx) => (
                  <div
                    key={`comment-${idx}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs space-y-1 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                      <span>Line {c.line}</span>
                      <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
                        {c.keyPath}
                      </span>
                    </div>
                    <p className="font-mono text-slate-900 dark:text-white break-words">
                      # {c.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: MULTI-DOCUMENT STREAM EXPLORER */}
          {activeTab === 'multi_doc_explorer' && (
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {result.documents.map((_doc, idx) => (
                  <button
                    key={`doc-tab-${idx}`}
                    type="button"
                    onClick={() => setSelectedDocIndex(idx)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${Math.min(selectedDocIndex, Math.max(0, result.documents.length - 1)) === idx
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                  >
                    Document #{idx + 1}
                  </button>
                ))}
              </div>
              <pre className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-300 max-h-[380px]">
                {formatJsonOutput(
                  [
                    result.documents[
                    Math.min(selectedDocIndex, Math.max(0, result.documents.length - 1))
                    ] ?? null,
                  ],
                  { ...options, multiDocMode: 'first_document', indentSpaces: 2 },
                  []
                )}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Status / Error Toast */}
      {(statusBanner || errorBanner) && (
        <div
          className={`flex items-center justify-between rounded-2xl p-3.5 text-xs font-semibold ${errorBanner
              ? 'border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200'
            }`}
        >
          <span>{errorBanner || statusBanner}</span>
          <button
            type="button"
            onClick={() => {
              setStatusBanner('');
              setErrorBanner('');
            }}
            className="underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}