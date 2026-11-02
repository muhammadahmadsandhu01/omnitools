'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
    Database,
    Upload,
    FileSpreadsheet,
    Code2,
    BarChart3,
    Binary,
    Download,
    Copy,
    Check,
    Search,
    Filter,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    X,
    ShieldCheck,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import {
    parseColumnarFile,
    generateSampleBinaryFile,
    queryDataset,
    generateSchemaCode,
    exportDatasetToText,
    encodeParquetBinary,
    encodeAvroBinary,
    encodeFeatherBinary,
    type ColumnarParseResult,
    type FilterCondition,
    type FilterOperator,
    type SortConfig,
    type SchemaTargetLanguage,
    type ExportFormat,
} from '@/lib/columnarViewerEngine';

type ActiveTab = 'explorer' | 'schema' | 'profiler' | 'xray' | 'export';

export default function ParquetViewer() {
    const [fileData, setFileData] = useState<{ name: string; size: number } | null>(null);
    const [parseResult, setParseResult] = useState<ColumnarParseResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('explorer');

    // Tab 1: Data Explorer state
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterCondition[]>([]);
    const [sort, setSort] = useState<SortConfig | null>(null);
    const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [inspectedCell, setInspectedCell] = useState<{ col: string; val: unknown } | null>(null);

    // Tab 2: Schema & DDL Generator state
    const [selectedTargetLang, setSelectedTargetLang] = useState<SchemaTargetLanguage>('postgresql');
    const [ddlTableName, setDdlTableName] = useState('analytics_table');
    const [ddlCopied, setDdlCopied] = useState(false);

    // Tab 5: Export Studio state
    const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
    const [exportDelimiter, setExportDelimiter] = useState<',' | ';' | '\t' | '|'>(',');
    const [includeBom, setIncludeBom] = useState(true);
    const [sanitizeFormulas, setSanitizeFormulas] = useState(true);
    const [prettyJson, setPrettyJson] = useState(true);
    const [exportTableName, setExportTableName] = useState('exported_data');
    const [exportScope, setExportScope] = useState<'all' | 'filtered'>('filtered');
    const [exportCopied, setExportCopied] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Process uploaded or generated Uint8Array
    const processBinaryBuffer = useCallback((bytes: Uint8Array, fileName: string) => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            const result = parseColumnarFile(bytes, fileName);
            setParseResult(result);
            setFileData({ name: fileName, size: bytes.length });
            setDdlTableName(fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_]/g, '_') || 'dataset');
            setExportTableName(fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_]/g, '_') || 'exported_table');
            setFilters([]);
            setSort(null);
            setSearchQuery('');
            setHiddenColumns(new Set());
            setCurrentPage(1);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setErrorMsg(`Failed to parse binary file: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // File input handler
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const buffer = event.target?.result as ArrayBuffer;
            if (buffer) {
                processBinaryBuffer(new Uint8Array(buffer), file.name);
            }
        };
        reader.onerror = () => {
            setErrorMsg('Browser failed to read local file.');
            setIsLoading(false);
        };
        reader.readAsArrayBuffer(file);
    };

    // Load sample datasets
    const handleLoadSample = (preset: 'ecommerce_parquet' | 'iot_avro' | 'ml_feather') => {
        const sample = generateSampleBinaryFile(preset);
        processBinaryBuffer(sample.bytes, sample.fileName);
    };

    // Columns present in dataset
    const allColumnNames = useMemo(() => {
        if (!parseResult) return [];
        return parseResult.schema.map((c) => c.name);
    }, [parseResult]);

    const visibleColumnNames = useMemo(() => {
        return allColumnNames.filter((c) => !hiddenColumns.has(c));
    }, [allColumnNames, hiddenColumns]);

    // Queried & filtered rows
    const queryResult = useMemo(() => {
        if (!parseResult) return { rows: [], matchedCount: 0 };
        return queryDataset(parseResult.rows, {
            searchQuery,
            filters,
            sort,
            selectedColumns: visibleColumnNames,
        });
    }, [parseResult, searchQuery, filters, sort, visibleColumnNames]);

    // Paginated rows for grid display
    const paginatedRows = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return queryResult.rows.slice(start, start + pageSize);
    }, [queryResult.rows, currentPage, pageSize]);

    const totalPages = Math.max(1, Math.ceil(queryResult.matchedCount / pageSize));

    // Handle column sort toggle
    const handleSortToggle = (col: string) => {
        if (!sort || sort.column !== col) {
            setSort({ column: col, direction: 'asc' });
        } else if (sort.direction === 'asc') {
            setSort({ column: col, direction: 'desc' });
        } else {
            setSort(null);
        }
    };

    // Filter builder handlers
    const addFilter = () => {
        if (allColumnNames.length === 0) return;
        setFilters((prev) => [
            ...prev,
            { column: allColumnNames[0], operator: 'eq', value: '' },
        ]);
    };

    const updateFilter = (index: number, patch: Partial<FilterCondition>) => {
        setFilters((prev) =>
            prev.map((f, i) => (i === index ? { ...f, ...patch } : f))
        );
    };

    const removeFilter = (index: number) => {
        setFilters((prev) => prev.filter((_, i) => i !== index));
    };

    // Schema DDL Code
    const generatedDdl = useMemo(() => {
        if (!parseResult) return '';
        return generateSchemaCode(parseResult.schema, selectedTargetLang, ddlTableName);
    }, [parseResult, selectedTargetLang, ddlTableName]);

    const handleCopyDdl = () => {
        navigator.clipboard.writeText(generatedDdl);
        setDdlCopied(true);
        setTimeout(() => setDdlCopied(false), 2000);
    };

    // Export output text
    const exportedText = useMemo(() => {
        if (!parseResult) return '';
        const rowsToExport = exportScope === 'all' ? parseResult.rows : queryResult.rows;
        return exportDatasetToText(rowsToExport, visibleColumnNames, {
            format: exportFormat,
            csvDelimiter: exportDelimiter,
            includeUtf8Bom: includeBom,
            sanitizeFormulas,
            tableName: exportTableName,
            prettyJson,
        });
    }, [
        parseResult,
        exportScope,
        queryResult.rows,
        visibleColumnNames,
        exportFormat,
        exportDelimiter,
        includeBom,
        sanitizeFormulas,
        exportTableName,
        prettyJson,
    ]);

    const handleDownloadExport = () => {
        if (!exportedText) return;
        const extMap: Record<ExportFormat, string> = {
            csv: 'csv',
            tsv: 'tsv',
            json: 'json',
            jsonl: 'jsonl',
            sql: 'sql',
            markdown: 'md',
            html: 'html',
            xlsx: 'csv',
        };
        const mimeMap: Record<ExportFormat, string> = {
            csv: 'text/csv;charset=utf-8',
            tsv: 'text/tab-separated-values;charset=utf-8',
            json: 'application/json;charset=utf-8',
            jsonl: 'application/x-ndjson;charset=utf-8',
            sql: 'application/sql;charset=utf-8',
            markdown: 'text/markdown;charset=utf-8',
            html: 'text/html;charset=utf-8',
            xlsx: 'text/csv;charset=utf-8',
        };
        const ext = extMap[exportFormat] || 'txt';
        const mime = mimeMap[exportFormat] || 'text/plain';
        const blob = new Blob([exportedText], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportTableName}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopyExport = () => {
        navigator.clipboard.writeText(exportedText);
        setExportCopied(true);
        setTimeout(() => setExportCopied(false), 2000);
    };

    // Binary Transcoder Download
    const handleDownloadBinary = (target: 'parquet' | 'avro' | 'feather') => {
        if (!parseResult) return;
        const rowsToExport = exportScope === 'all' ? parseResult.rows : queryResult.rows;
        let bytes: Uint8Array;
        let ext = 'bin';

        if (target === 'parquet') {
            bytes = encodeParquetBinary(rowsToExport, parseResult.metadata.keyValueMetadata);
            ext = 'parquet';
        } else if (target === 'avro') {
            bytes = encodeAvroBinary(rowsToExport, exportTableName);
            ext = 'avro';
        } else {
            bytes = encodeFeatherBinary(rowsToExport, parseResult.metadata.keyValueMetadata);
            ext = 'feather';
        }

        const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportTableName}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Header & Hero Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                                <Database className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                                    Parquet, Avro &amp; Feather Studio
                                </h2>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full shrink-0">
                            <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side Sandbox
                        </span>
                    </div>
                    <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Zero server uploads. Inspect Apache Parquet (<code>PAR1</code>), Avro (<code>Obj</code>), and Arrow Feather (<code>ARROW1</code>) directly in memory with lossless 64-bit <code>BigInt</code> safety.
                    </p>
                </div>

                {/* 12-Column Responsive Grid: Dropzone (lg:col-span-7) & Sample Presets (lg:col-span-5) */}
                <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Upload Drag & Drop Area */}
                    <div className="lg:col-span-7 min-w-0">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".parquet,.pq,.avro,.feather,.arrow,.ipc,.csv,.tsv,.jsonl,.json"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const dropped = e.dataTransfer.files?.[0];
                                if (dropped) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        const buf = event.target?.result as ArrayBuffer;
                                        if (buf) processBinaryBuffer(new Uint8Array(buf), dropped.name);
                                    };
                                    reader.readAsArrayBuffer(dropped);
                                }
                            }}
                            className="h-full min-h-[170px] border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl p-4 sm:p-5 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-900/50 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 group flex flex-col items-center justify-center gap-2"
                        >
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-xs group-hover:scale-105 transition">
                                <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                                Click to select or drop a <span className="font-semibold text-indigo-600 dark:text-indigo-400">.parquet</span>, <span className="font-semibold text-indigo-600 dark:text-indigo-400">.avro</span>, or <span className="font-semibold text-indigo-600 dark:text-indigo-400">.feather</span> file
                            </div>
                            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-md">
                                {isLoading ? 'Parsing binary columnar payload in local memory...' : 'Also accepts JSON Lines (.jsonl) and CSV files for instant binary conversion.'}
                            </p>
                        </div>
                    </div>

                    {/* 3 Sample Presets Card */}
                    <div className="lg:col-span-5 min-w-0 flex flex-col justify-between gap-2 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Or Load Built-In Binary Test Presets:
                        </span>

                        <button
                            type="button"
                            onClick={() => handleLoadSample('ecommerce_parquet')}
                            className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/30 transition flex flex-wrap items-center justify-between gap-1.5 min-h-[40px]"
                        >
                            <span className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>📦 E-Commerce Lakehouse</span>
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40 shrink-0">
                                Parquet v1 • Snappy • INT64
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleLoadSample('iot_avro')}
                            className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 transition flex flex-wrap items-center justify-between gap-1.5 min-h-[40px]"
                        >
                            <span className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>⚡ IoT Sensor Stream</span>
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40 shrink-0">
                                Avro Container • ZigZag • Sync
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleLoadSample('ml_feather')}
                            className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50/30 dark:hover:bg-purple-950/30 transition flex flex-wrap items-center justify-between gap-1.5 min-h-[40px]"
                        >
                            <span className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>🧠 ML Embeddings Matrix</span>
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40 shrink-0">
                                Arrow Feather • IPC • Float32
                            </span>
                        </button>
                    </div>
                </div>

                {/* Active File Telemetry Bar (6 Stat Cards) */}
                {fileData && parseResult && (
                    <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                            {/* Card 1: Filename */}
                            <div className="min-w-0 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Loaded File</span>
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate block mt-0.5" title={fileData.name}>
                                    {fileData.name}
                                </span>
                            </div>

                            {/* Card 2: Format & Magic */}
                            <div className="min-w-0 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Format &amp; Magic</span>
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase truncate block mt-0.5">
                                    {parseResult.format} ({parseResult.metadata.magicBytes})
                                </span>
                            </div>

                            {/* Card 3: Size */}
                            <div className="min-w-0 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Container Size</span>
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate block mt-0.5">
                                    {(fileData.size / 1024).toFixed(1)} KB
                                </span>
                            </div>

                            {/* Card 4: Total Rows */}
                            <div className="min-w-0 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total Rows</span>
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate block mt-0.5">
                                    {parseResult.metadata.totalRows.toLocaleString()}
                                </span>
                            </div>

                            {/* Card 5: Columns */}
                            <div className="min-w-0 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Schema Columns</span>
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate block mt-0.5">
                                    {parseResult.schema.length} cols
                                </span>
                            </div>

                            {/* Card 6: Codec & Speed */}
                            <div className="min-w-0 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Codec • Speed</span>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase truncate block mt-0.5" title={`${parseResult.metadata.compressionCodec} (${parseResult.metadata.parseTimeMs.toFixed(1)}ms)`}>
                                    {parseResult.metadata.compressionCodec} ({parseResult.metadata.parseTimeMs.toFixed(1)}ms)
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {errorMsg && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="break-words">{errorMsg}</span>
                    </div>
                )}
            </div>

            {/* 5-Tab Workbench Navigation Bar */}
            {parseResult && (
                <div className="w-full overflow-x-auto overscroll-x-contain pb-1 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
                        {[
                            { id: 'explorer', label: 'Data Explorer Grid', icon: FileSpreadsheet },
                            { id: 'schema', label: 'Schema & DDL Generator', icon: Code2 },
                            { id: 'profiler', label: 'Column Profiler & Stats', icon: BarChart3 },
                            { id: 'xray', label: 'Binary X-Ray Inspector', icon: Binary },
                            { id: 'export', label: 'Export & Converter Studio', icon: Download },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id as ActiveTab)}
                                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition whitespace-nowrap min-h-[40px] shrink-0 ${
                                        active
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Tab 1: Data Explorer Grid */}
            {parseResult && activeTab === 'explorer' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                    {/* Controls Row */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="relative w-full sm:max-w-md">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Global search across all columns..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[38px]"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={addFilter}
                                className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 min-h-[38px]"
                            >
                                <Filter className="w-3.5 h-3.5 text-indigo-500" /> Add Filter ({filters.length})
                            </button>

                            {/* Page size selector */}
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="w-full sm:w-auto px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 min-h-[38px]"
                            >
                                <option value={10}>10 rows per page</option>
                                <option value={25}>25 rows per page</option>
                                <option value={50}>50 rows per page</option>
                                <option value={100}>100 rows per page</option>
                            </select>
                        </div>
                    </div>

                    {/* Filter Builder List */}
                    {filters.length > 0 && (
                        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <span>Active Predicate Filters (AND):</span>
                                <button
                                    type="button"
                                    onClick={() => setFilters([])}
                                    className="text-indigo-600 dark:text-indigo-400 hover:underline min-h-[32px] flex items-center"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                            {filters.map((f, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 min-w-0">
                                    <select
                                        value={f.column}
                                        onChange={(e) => updateFilter(idx, { column: e.target.value })}
                                        className="w-full sm:w-44 px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 min-h-[36px]"
                                    >
                                        {allColumnNames.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={f.operator}
                                        onChange={(e) => updateFilter(idx, { operator: e.target.value as FilterOperator })}
                                        className="w-full sm:w-40 px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 min-h-[36px]"
                                    >
                                        <option value="eq">= (equals)</option>
                                        <option value="neq">!= (not equals)</option>
                                        <option value="gt">&gt; (greater)</option>
                                        <option value="gte">&gt;= (greater or equal)</option>
                                        <option value="lt">&lt; (less)</option>
                                        <option value="lte">&lt;= (less or equal)</option>
                                        <option value="contains">contains</option>
                                        <option value="starts_with">starts with</option>
                                        <option value="ends_with">ends with</option>
                                        <option value="is_null">is null</option>
                                        <option value="is_not_null">is not null</option>
                                    </select>

                                    {f.operator !== 'is_null' && f.operator !== 'is_not_null' && (
                                        <input
                                            type="text"
                                            placeholder="Filter value..."
                                            value={f.value}
                                            onChange={(e) => updateFilter(idx, { value: e.target.value })}
                                            className="w-full sm:flex-1 px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-h-[36px]"
                                        />
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => removeFilter(idx)}
                                        className="self-end sm:self-center p-2 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
                                        title="Remove filter"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Table Grid */}
                    <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold select-none">
                                <tr>
                                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                                    {visibleColumnNames.map((col) => {
                                        const isSorted = sort?.column === col;
                                        return (
                                            <th
                                                key={col}
                                                onClick={() => handleSortToggle(col)}
                                                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition whitespace-nowrap"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <span>{col}</span>
                                                    {isSorted ? (
                                                        sort?.direction === 'asc' ? (
                                                            <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                                                        ) : (
                                                            <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                                                        )
                                                    ) : (
                                                        <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-60" />
                                                    )}
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                                {paginatedRows.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={visibleColumnNames.length + 1}
                                            className="py-8 text-center text-slate-400 font-sans"
                                        >
                                            No rows match the active search and filter conditions.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedRows.map((row, rIdx) => {
                                        const globalRowIndex = (currentPage - 1) * pageSize + rIdx + 1;
                                        return (
                                            <tr
                                                key={rIdx}
                                                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                                            >
                                                <td className="py-2 px-3 text-center text-slate-400 font-sans text-[11px]">
                                                    {globalRowIndex}
                                                </td>
                                                {visibleColumnNames.map((col) => {
                                                    const cellVal = row[col];
                                                    const isNull = cellVal === null || cellVal === undefined;
                                                    const isObject = typeof cellVal === 'object' && cellVal !== null;
                                                    const cellString = isNull
                                                        ? 'NULL'
                                                        : isObject
                                                        ? JSON.stringify(cellVal)
                                                        : String(cellVal);

                                                    return (
                                                        <td
                                                            key={col}
                                                            onClick={() => isObject && setInspectedCell({ col, val: cellVal })}
                                                            className={`py-2 px-3 truncate max-w-xs ${
                                                                isNull
                                                                    ? 'text-slate-300 dark:text-slate-600 italic'
                                                                    : isObject
                                                                    ? 'cursor-pointer text-indigo-600 dark:text-indigo-400 hover:underline'
                                                                    : 'text-slate-800 dark:text-slate-200'
                                                            }`}
                                                            title={cellString}
                                                        >
                                                            {cellString}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3 pt-2">
                        <div className="text-center sm:text-left">
                            Showing{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {queryResult.matchedCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {Math.min(currentPage * pageSize, queryResult.matchedCount)}
                            </span>{' '}
                            of{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {queryResult.matchedCount.toLocaleString()}
                            </span>{' '}
                            filtered rows ({parseResult.metadata.totalRows.toLocaleString()} total)
                        </div>

                        <div className="flex items-center justify-center gap-1.5">
                            <button
                                type="button"
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 min-h-[36px] min-w-[36px] flex items-center justify-center transition"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3 font-medium">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 min-h-[36px] min-w-[36px] flex items-center justify-center transition"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 2: Schema & DDL Generator */}
            {parseResult && activeTab === 'schema' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mr-1">Target:</span>
                            {(
                                [
                                    ['postgresql', 'PostgreSQL'],
                                    ['snowflake', 'Snowflake'],
                                    ['bigquery', 'BigQuery'],
                                    ['duckdb', 'DuckDB'],
                                    ['clickhouse', 'ClickHouse'],
                                    ['typescript', 'TypeScript'],
                                    ['pyarrow', 'PyArrow'],
                                    ['polars', 'Polars'],
                                    ['avro_schema', 'Avro Schema'],
                                    ['json_schema', 'JSON Schema'],
                                ] as [SchemaTargetLanguage, string][]
                            ).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setSelectedTargetLang(key)}
                                    className={`px-2.5 py-1.5 text-xs rounded-lg font-medium transition min-h-[36px] ${
                                        selectedTargetLang === key
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                                type="text"
                                placeholder="Table name"
                                value={ddlTableName}
                                onChange={(e) => setDdlTableName(e.target.value)}
                                className="w-full sm:w-48 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 min-h-[36px]"
                            />
                            <button
                                type="button"
                                onClick={handleCopyDdl}
                                className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition min-h-[36px]"
                            >
                                {ddlCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                {ddlCopied ? 'Copied!' : 'Copy Code'}
                            </button>
                        </div>
                    </div>

                    <div className="w-full min-w-0">
                        <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-w-full max-h-[500px] border border-slate-800 leading-relaxed">
                            <code>{generatedDdl}</code>
                        </pre>
                    </div>
                </div>
            )}

            {/* Tab 3: Column Profiler & Stats */}
            {parseResult && activeTab === 'profiler' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Column Distribution &amp; Mathematical Profiling ({parseResult.columnProfiles.length} columns)
                    </h3>

                    <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="min-w-[700px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                                <tr>
                                    <th className="py-2.5 px-3">Column</th>
                                    <th className="py-2.5 px-3">Type</th>
                                    <th className="py-2.5 px-3">Nulls (%)</th>
                                    <th className="py-2.5 px-3">Distinct</th>
                                    <th className="py-2.5 px-3">Min</th>
                                    <th className="py-2.5 px-3">Max</th>
                                    <th className="py-2.5 px-3">Mean / Avg</th>
                                    <th className="py-2.5 px-3">Median (p50)</th>
                                    <th className="py-2.5 px-3">Top Frequencies</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                                {parseResult.columnProfiles.map((cp) => (
                                    <tr key={cp.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                                            {cp.name}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                {cp.logicalType}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <span className={cp.nullCount > 0 ? 'text-amber-600 font-medium' : ''}>
                                                {cp.nullCount} ({cp.nullPercentage}%)
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3">
                                            {cp.distinctCount} ({cp.uniquenessRatio}%)
                                        </td>
                                        <td className="py-2.5 px-3 truncate max-w-[120px]">{cp.min ?? '—'}</td>
                                        <td className="py-2.5 px-3 truncate max-w-[120px]">{cp.max ?? '—'}</td>
                                        <td className="py-2.5 px-3">{cp.mean !== null ? cp.mean : cp.avgStringLength !== null ? `${cp.avgStringLength} ch` : '—'}</td>
                                        <td className="py-2.5 px-3">{cp.median !== null ? cp.median : '—'}</td>
                                        <td className="py-2.5 px-3">
                                            <div className="flex flex-wrap gap-1 max-w-xs font-sans text-[11px]">
                                                {cp.topValues.slice(0, 3).map((tv, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-[100px]"
                                                        title={`${tv.value}: ${tv.count} (${tv.percentage}%)`}
                                                    >
                                                        {tv.value}: {tv.count}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 4: Binary X-Ray Inspector */}
            {parseResult && activeTab === 'xray' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-6">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Binary Container Low-Level Metadata &amp; Layout
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <div className="min-w-0 p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Container Format</span>
                            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase truncate mt-0.5">
                                {parseResult.format}
                            </div>
                        </div>
                        <div className="min-w-0 p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Magic Bytes</span>
                            <div className="text-sm sm:text-base font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate mt-0.5">
                                {parseResult.metadata.magicBytes}
                            </div>
                        </div>
                        <div className="min-w-0 p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Compression Codec</span>
                            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase truncate mt-0.5">
                                {parseResult.metadata.compressionCodec}
                            </div>
                        </div>
                        <div className="min-w-0 p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Compression Ratio</span>
                            <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
                                {parseResult.metadata.compressionRatio}x
                            </div>
                        </div>
                    </div>

                    {/* Key-Value Footer Metadata */}
                    {Object.keys(parseResult.metadata.keyValueMetadata).length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Container Key-Value Metadata
                            </h4>
                            <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono overflow-hidden">
                                {Object.entries(parseResult.metadata.keyValueMetadata).map(([k, v]) => (
                                    <div key={k} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 min-w-0">
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">{k}</span>
                                        <span className="text-slate-700 dark:text-slate-300 break-all sm:break-words">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tab 5: Export & Converter Studio */}
            {parseResult && activeTab === 'export' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Cross-Format Export &amp; Enterprise Conversion Studio
                    </h3>

                    {/* Format Selector */}
                    <div className="space-y-2">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Spreadsheet &amp; Text Formats:</span>
                        <div className="flex flex-wrap gap-1.5">
                            {(['csv', 'tsv', 'json', 'jsonl', 'sql', 'markdown', 'html'] as ExportFormat[]).map((fmt) => (
                                <button
                                    key={fmt}
                                    type="button"
                                    onClick={() => setExportFormat(fmt)}
                                    className={`px-3.5 py-2 text-xs rounded-lg font-medium uppercase transition min-h-[40px] ${
                                        exportFormat === fmt
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {fmt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Options Row */}
                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 min-h-[32px]">
                                <input
                                    type="radio"
                                    name="scope"
                                    checked={exportScope === 'filtered'}
                                    onChange={() => setExportScope('filtered')}
                                    className="text-indigo-600"
                                />
                                Filtered Query Subset ({queryResult.matchedCount} rows)
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 min-h-[32px]">
                                <input
                                    type="radio"
                                    name="scope"
                                    checked={exportScope === 'all'}
                                    onChange={() => setExportScope('all')}
                                    className="text-indigo-600"
                                />
                                Full Dataset ({parseResult.metadata.totalRows} rows)
                            </label>
                        </div>

                        {exportFormat === 'json' && (
                            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 min-h-[32px]">
                                <input
                                    type="checkbox"
                                    checked={prettyJson}
                                    onChange={(e) => setPrettyJson(e.target.checked)}
                                    className="text-indigo-600"
                                />
                                Pretty Print (2-space indent)
                            </label>
                        )}

                        {exportFormat === 'csv' && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 min-h-[32px]">
                                    <input
                                        type="checkbox"
                                        checked={includeBom}
                                        onChange={(e) => setIncludeBom(e.target.checked)}
                                        className="text-indigo-600"
                                    />
                                    Include UTF-8 BOM (Excel compatibility)
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 min-h-[32px]">
                                    <input
                                        type="checkbox"
                                        checked={sanitizeFormulas}
                                        onChange={(e) => setSanitizeFormulas(e.target.checked)}
                                        className="text-indigo-600"
                                    />
                                    CWE-1236 Formula Sanitization
                                </label>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 min-h-[32px]">
                                    <span>Delimiter:</span>
                                    <select
                                        value={exportDelimiter}
                                        onChange={(e) => setExportDelimiter(e.target.value as ',' | ';' | '\t' | '|')}
                                        className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 min-h-[32px]"
                                    >
                                        <option value=",">, (Comma)</option>
                                        <option value=";">; (Semicolon)</option>
                                        <option value={'\t'}>Tab (\t)</option>
                                        <option value="|">| (Pipe)</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleDownloadExport}
                            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-xs min-h-[40px]"
                        >
                            <Download className="w-4 h-4" /> Download {exportFormat.toUpperCase()} File
                        </button>
                        <button
                            type="button"
                            onClick={handleCopyExport}
                            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2 min-h-[40px]"
                        >
                            {exportCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            {exportCopied ? 'Copied!' : 'Copy to Clipboard'}
                        </button>
                    </div>

                    {/* Binary Transcoder Section */}
                    <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Binary className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                Binary Transcoder (Convert &amp; Download Lakehouse Formats):
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => handleDownloadBinary('parquet')}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/30 transition flex items-center justify-between gap-1.5 min-h-[40px] text-xs font-medium text-slate-800 dark:text-slate-200"
                            >
                                <span>📦 Convert to <strong>.parquet</strong></span>
                                <Download className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDownloadBinary('avro')}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 transition flex items-center justify-between gap-1.5 min-h-[40px] text-xs font-medium text-slate-800 dark:text-slate-200"
                            >
                                <span>⚡ Convert to <strong>.avro</strong></span>
                                <Download className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDownloadBinary('feather')}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-500 hover:bg-purple-50/30 dark:hover:bg-purple-950/30 transition flex items-center justify-between gap-1.5 min-h-[40px] text-xs font-medium text-slate-800 dark:text-slate-200"
                            >
                                <span>🧠 Convert to <strong>.feather</strong></span>
                                <Download className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            </button>
                        </div>
                    </div>

                    {/* Text Preview */}
                    <div className="w-full min-w-0 pt-2">
                        <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-w-full max-h-[350px] border border-slate-800 leading-relaxed">
                            <code>{exportedText.slice(0, 5000)}</code>
                        </pre>
                    </div>
                </div>
            )}

            {/* Cell Inspection Popover / Modal */}
            {inspectedCell && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl space-y-3 overflow-hidden">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                Cell Value Inspector: <span className="font-mono text-indigo-600 dark:text-indigo-400">{inspectedCell.col}</span>
                            </h4>
                            <button
                                type="button"
                                onClick={() => setInspectedCell(null)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <pre className="p-3.5 bg-slate-950 text-slate-100 rounded-xl text-xs font-mono overflow-auto flex-1 max-h-[60vh] border border-slate-800 leading-relaxed">
                            {JSON.stringify(inspectedCell.val, null, 2)}
                        </pre>
                        <div className="flex justify-end pt-1">
                            <button
                                type="button"
                                onClick={() => setInspectedCell(null)}
                                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 min-h-[38px] transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
