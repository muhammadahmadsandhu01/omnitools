'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    Database,
    Upload,
    Code2,
    BarChart3,
    Download,
    Search,
    Filter,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Copy,
    Check,
    Eye,
    ShieldCheck,
    Sparkles,
    Layers,
    Table as TableIcon,
    CheckSquare,
    Square,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    X,
    Plus,
    Binary,
    HardDrive,
} from 'lucide-react';

import {
    MAX_SAFE_FILE_BYTES,
    createColumnarParseWorkerDispatcher,
    isColumnarParseCancelledError,
    generateSampleBinaryFile,
    type ColumnarParseWorkerDispatcher,
    queryDataset,
    generateSchemaCode,
    exportDatasetToText,
    encodeXlsxWorkbookBinary,
    encodeParquetBinary,
    encodeAvroBinary,
    encodeFeatherBinary,
    type ColumnarParseResult,
    type FilterCondition,
    type FilterOperator,
    type FilterLogicMode,
    type SortConfig,
    type SchemaTargetLanguage,
    type ExportFormat,
} from '@/lib/columnarViewerEngine';

type StudioTab = 'grid' | 'schema' | 'profiler' | 'xray' | 'export';

const SAMPLE_PRESETS = [
    {
        id: 'ecommerce_parquet' as const,
        label: 'E-Commerce Orders (.parquet)',
        badge: 'Parquet v2 • Snappy • INT64',
        description: '25 enterprise order records with INT64 IDs, timestamps, nested customer structs, and payment arrays.',
    },
    {
        id: 'iot_avro' as const,
        label: 'IoT Telemetry Stream (.avro)',
        badge: 'Avro Obj1 • ZigZag • Union Nulls',
        description: '20 industrial sensor payloads with nullable union fields, firmware metadata, and alert flags.',
    },
    {
        id: 'ml_feather' as const,
        label: 'LLM Embedding Store (.feather)',
        badge: 'Arrow IPC v2 • Float64 • Fast',
        description: '18 vector store rows with cosine similarity scores, token counts, latency metrics, and model tags.',
    },
];

const SCHEMA_TARGETS: { id: SchemaTargetLanguage; label: string; ext: string }[] = [
    { id: 'postgresql', label: 'PostgreSQL DDL', ext: 'sql' },
    { id: 'snowflake', label: 'Snowflake DDL', ext: 'sql' },
    { id: 'bigquery', label: 'Google BigQuery DDL', ext: 'sql' },
    { id: 'duckdb', label: 'DuckDB Analytics SQL', ext: 'sql' },
    { id: 'clickhouse', label: 'ClickHouse MergeTree', ext: 'sql' },
    { id: 'typescript', label: 'TypeScript Interface', ext: 'ts' },
    { id: 'pyarrow', label: 'Python PyArrow Schema', ext: 'py' },
    { id: 'polars', label: 'Python Polars Schema', ext: 'py' },
    { id: 'avro_schema', label: 'Apache Avro (.avsc)', ext: 'avsc' },
    { id: 'json_schema', label: 'JSON Schema (2020-12)', ext: 'json' },
];

const FILTER_OPERATORS: { id: FilterOperator; label: string }[] = [
    { id: 'contains', label: 'Contains' },
    { id: 'eq', label: 'Equals (=)' },
    { id: 'neq', label: 'Not Equals (≠)' },
    { id: 'gt', label: 'Greater Than (>)' },
    { id: 'gte', label: 'Greater or Equal (≥)' },
    { id: 'lt', label: 'Less Than (<)' },
    { id: 'lte', label: 'Less or Equal (≤)' },
    { id: 'starts_with', label: 'Starts With' },
    { id: 'ends_with', label: 'Ends With' },
    { id: 'is_null', label: 'Is NULL' },
    { id: 'is_not_null', label: 'Is Not NULL' },
];

function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const val = bytes / Math.pow(1024, idx);
    return `${val.toFixed(idx === 0 ? 0 : 2)} ${units[idx]}`;
}

function formatCellPreview(val: unknown): string {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'bigint') return val.toString();
    if (typeof val === 'object') {
        try {
            return JSON.stringify(val);
        } catch {
            return String(val);
        }
    }
    return String(val);
}

export default function ParquetViewer() {
    // Core dataset state
    const [dataset, setDataset] = useState<ColumnarParseResult | null>(null);
    const [activeTab, setActiveTab] = useState<StudioTab>('grid');
    const [isDragging, setIsDragging] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Explorer state (Search, Filter with AND/OR logic, Sort, Projection, Pagination, Row Drawer)
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterCondition[]>([]);
    const [filterLogic, setFilterLogic] = useState<FilterLogicMode>('AND');
    const [newFilterCol, setNewFilterCol] = useState('');
    const [newFilterOp, setNewFilterOp] = useState<FilterOperator>('contains');
    const [newFilterVal, setNewFilterVal] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [showColumnPicker, setShowColumnPicker] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [gridMode, setGridMode] = useState<'paginated' | 'virtualized'>('paginated');
    const [virtualScrollTop, setVirtualScrollTop] = useState(0);
    const [inspectedRowIndex, setInspectedRowIndex] = useState<number | null>(null);

    // Schema & Code Generator state
    const [schemaTarget, setSchemaTarget] = useState<SchemaTargetLanguage>('postgresql');
    const [tableName, setTableName] = useState('analytics_dataset');

    // Export Studio state
    const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
    const [csvDelimiter, setCsvDelimiter] = useState<',' | ';' | '\t' | '|'>(',');
    const [includeUtf8Bom, setIncludeUtf8Bom] = useState(true);
    const [sanitizeFormulas, setSanitizeFormulas] = useState(true);
    const [prettyJson, setPrettyJson] = useState(true);
    const [exportScope, setExportScope] = useState<'filtered' | 'all'>('filtered');

    // Copy feedback & background Worker parsing state
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const parseDispatcherRef = useRef<ColumnarParseWorkerDispatcher | null>(null);
    const uploadSeqRef = useRef(0);

    useEffect(() => {
        return () => {
            parseDispatcherRef.current?.dispose();
            parseDispatcherRef.current = null;
        };
    }, []);

    const triggerCopy = useCallback((text: string, id: string) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(text).catch(() => { });
        }
        setCopiedId(id);
        setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
    }, []);

    const applyParsedDataset = useCallback((parsed: ColumnarParseResult, fileName: string) => {
        setDataset(parsed);
        const colNames = parsed.schema.map((c) => c.name);
        setSelectedColumns(colNames);
        setNewFilterCol(colNames[0] || '');
        setFilters([]);
        setSearchQuery('');
        setSortConfig(null);
        setCurrentPage(1);
        setInspectedRowIndex(null);
        const cleanName = fileName
            .replace(/\.[a-z0-9]+$/i, '')
            .replace(/[^a-zA-Z0-9_]/g, '_')
            .toLowerCase();
        if (cleanName) setTableName(cleanName);
    }, []);

    // Load binary buffer into engine via Web Worker with automatic main-thread fallback
    const handleLoadBuffer = useCallback(
        (bytes: Uint8Array, fileName: string) => {
            setErrorMsg(null);
            if (!parseDispatcherRef.current) {
                parseDispatcherRef.current = createColumnarParseWorkerDispatcher();
            }
            setIsParsing(true);
            parseDispatcherRef.current
                .parse(bytes, fileName)
                .then((outcome) => {
                    setIsParsing(false);
                    applyParsedDataset(outcome.result, fileName);
                })
                .catch((err: unknown) => {
                    if (isColumnarParseCancelledError(err)) {
                        return;
                    }
                    setIsParsing(false);
                    setDataset(null);
                    setInspectedRowIndex(null);
                    setErrorMsg(err instanceof Error ? err.message : 'Unable to parse binary file.');
                });
        },
        [applyParsedDataset]
    );

    // Do NOT auto-load a file on mount: let the user upload their own file or click a 1-Click Sample Preset

    const handleSelectSample = useCallback(
        (presetId: 'ecommerce_parquet' | 'iot_avro' | 'ml_feather') => {
            uploadSeqRef.current++;
            const sample = generateSampleBinaryFile(presetId);
            handleLoadBuffer(sample.bytes, sample.fileName);
        },
        [handleLoadBuffer]
    );

    const handleFileUpload = useCallback(
        async (file: File) => {
            if (!file) return;
            const seq = ++uploadSeqRef.current;
            parseDispatcherRef.current?.cancelCurrent('New file upload initiated.');
            setErrorMsg(null);
            if (file.size > MAX_SAFE_FILE_BYTES) {
                setIsParsing(false);
                setDataset(null);
                setInspectedRowIndex(null);
                setErrorMsg(
                    `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the in-browser allocation safeguard of ${MAX_SAFE_FILE_BYTES / (1024 * 1024)
                    } MB.`
                );
                return;
            }
            setIsParsing(true);
            try {
                const arrayBuffer = await file.arrayBuffer();
                if (seq !== uploadSeqRef.current) return;
                handleLoadBuffer(new Uint8Array(arrayBuffer), file.name);
            } catch (err: unknown) {
                if (seq !== uploadSeqRef.current) return;
                setIsParsing(false);
                setErrorMsg(err instanceof Error ? err.message : 'Failed to read uploaded file.');
            }
        },
        [handleLoadBuffer]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) {
                void handleFileUpload(file);
            }
        },
        [handleFileUpload]
    );

    // Filtered, sorted, and projected dataset (supports both AND and OR filterLogic)
    const queriedResult = useMemo(() => {
        if (!dataset) return { rows: [], matchedCount: 0 };
        return queryDataset(dataset.rows, {
            searchQuery,
            filters,
            filterLogic,
            sort: sortConfig,
            selectedColumns: selectedColumns.length > 0 ? selectedColumns : undefined,
        });
    }, [dataset, searchQuery, filters, filterLogic, sortConfig, selectedColumns]);

    // Pagination slice
    const totalPages = Math.max(1, Math.ceil(queriedResult.matchedCount / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedRows = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return queriedResult.rows.slice(start, start + pageSize);
    }, [queriedResult.rows, safePage, pageSize]);

    // Windowed Row Virtualization (for Virtualized Scroll mode)
    const VIRTUAL_ROW_HEIGHT = 36;
    const VIRTUAL_VIEWPORT_HEIGHT = 504;
    const VIRTUAL_OVERSCAN = 12;
    const virtualWindow = useMemo(() => {
        const total = queriedResult.rows.length;
        const startIdx = Math.max(0, Math.floor(virtualScrollTop / VIRTUAL_ROW_HEIGHT) - VIRTUAL_OVERSCAN);
        const endIdx = Math.min(
            total,
            Math.ceil((virtualScrollTop + VIRTUAL_VIEWPORT_HEIGHT) / VIRTUAL_ROW_HEIGHT) + VIRTUAL_OVERSCAN
        );
        return {
            startIdx,
            endIdx,
            topSpacerHeight: startIdx * VIRTUAL_ROW_HEIGHT,
            bottomSpacerHeight: Math.max(0, (total - endIdx) * VIRTUAL_ROW_HEIGHT),
            rows: queriedResult.rows.slice(startIdx, endIdx),
        };
    }, [queriedResult.rows, virtualScrollTop]);

    const displayedRows = gridMode === 'virtualized' ? virtualWindow.rows : paginatedRows;

    // Visible columns in grid
    const visibleSchema = useMemo(() => {
        if (!dataset) return [];
        const set = new Set(selectedColumns);
        return dataset.schema.filter((c) => set.has(c.name));
    }, [dataset, selectedColumns]);

    // Generated Schema / DDL Code
    const generatedCode = useMemo(() => {
        if (!dataset) return '';
        return generateSchemaCode(dataset.schema, schemaTarget, tableName || 'dataset_table');
    }, [dataset, schemaTarget, tableName]);

    // Generated Export Text Preview
    const exportPreviewText = useMemo(() => {
        if (!dataset) return '';
        const targetRows = exportScope === 'filtered' ? queriedResult.rows : dataset.rows;
        const previewRows = targetRows.slice(0, 100);
        const cols = exportScope === 'filtered' ? selectedColumns : dataset.schema.map((s) => s.name);
        return exportDatasetToText(previewRows, cols, {
            format: exportFormat,
            csvDelimiter,
            includeUtf8Bom: false,
            sanitizeFormulas,
            tableName: tableName || 'dataset_table',
            prettyJson,
            selectedColumns: cols,
        });
    }, [
        dataset,
        exportScope,
        queriedResult.rows,
        selectedColumns,
        exportFormat,
        csvDelimiter,
        sanitizeFormulas,
        tableName,
        prettyJson,
    ]);

    // Add filter handler
    const handleAddFilter = useCallback(() => {
        if (!newFilterCol) return;
        if (newFilterOp !== 'is_null' && newFilterOp !== 'is_not_null' && newFilterVal.trim() === '') {
            return;
        }
        setFilters((prev) => [
            ...prev,
            {
                column: newFilterCol,
                operator: newFilterOp,
                value: newFilterVal,
                join: filterLogic,
            },
        ]);
        setNewFilterVal('');
        setCurrentPage(1);
    }, [newFilterCol, newFilterOp, newFilterVal, filterLogic]);

    const handleRemoveFilter = useCallback((idx: number) => {
        setFilters((prev) => prev.filter((_, i) => i !== idx));
        setCurrentPage(1);
    }, []);

    const handleToggleSort = useCallback((colName: string) => {
        setSortConfig((prev) => {
            if (!prev || prev.column !== colName) {
                return { column: colName, direction: 'asc' };
            }
            if (prev.direction === 'asc') {
                return { column: colName, direction: 'desc' };
            }
            return null;
        });
    }, []);

    const handleToggleColumn = useCallback((colName: string) => {
        setSelectedColumns((prev) =>
            prev.includes(colName) ? prev.filter((c) => c !== colName) : [...prev, colName]
        );
    }, []);

    // Download Text/Tabular Export or Native Binary PKZIP .XLSX Workbook
    const handleDownloadExport = useCallback(() => {
        if (!dataset) return;
        const targetRows = exportScope === 'filtered' ? queriedResult.rows : dataset.rows;
        const cols = exportScope === 'filtered' ? selectedColumns : dataset.schema.map((s) => s.name);
        const baseName = (dataset.metadata.fileName || 'dataset').replace(/\.[a-z0-9]+$/i, '');

        if (exportFormat === 'xlsx') {
            const xlsxBytes = encodeXlsxWorkbookBinary(targetRows, cols, {
                sheetName: (tableName || 'Dataset').slice(0, 31),
                sanitizeFormulas,
            });
            const blob = new Blob([xlsxBytes as unknown as BlobPart], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${baseName}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return;
        }

        const fullText = exportDatasetToText(targetRows, cols, {
            format: exportFormat,
            csvDelimiter,
            includeUtf8Bom,
            sanitizeFormulas,
            tableName: tableName || 'dataset_table',
            prettyJson,
            selectedColumns: cols,
        });

        const mimeMap: Record<ExportFormat, string> = {
            csv: 'text/csv;charset=utf-8',
            tsv: 'text/tab-separated-values;charset=utf-8',
            json: 'application/json;charset=utf-8',
            jsonl: 'application/x-ndjson;charset=utf-8',
            sql: 'application/sql;charset=utf-8',
            markdown: 'text/markdown;charset=utf-8',
            html: 'text/html;charset=utf-8',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
        const extMap: Record<ExportFormat, string> = {
            csv: 'csv',
            tsv: 'tsv',
            json: 'json',
            jsonl: 'jsonl',
            sql: 'sql',
            markdown: 'md',
            html: 'html',
            xlsx: 'xlsx',
        };

        const blob = new Blob([fullText], { type: mimeMap[exportFormat] });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}.${extMap[exportFormat]}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [
        dataset,
        exportScope,
        queriedResult.rows,
        selectedColumns,
        exportFormat,
        csvDelimiter,
        includeUtf8Bom,
        sanitizeFormulas,
        tableName,
        prettyJson,
    ]);

    // Cross-Format Binary Transcoding Download (.parquet, .avro, .feather)
    const handleDownloadBinaryTranscode = useCallback(
        (targetBinary: 'parquet' | 'avro' | 'feather') => {
            if (!dataset) return;
            const targetRows = exportScope === 'filtered' ? queriedResult.rows : dataset.rows;
            const baseName = (dataset.metadata.fileName || 'dataset').replace(/\.[a-z0-9]+$/i, '');
            let bytes: Uint8Array;
            let ext: string;
            if (targetBinary === 'parquet') {
                bytes = encodeParquetBinary(targetRows);
                ext = 'parquet';
            } else if (targetBinary === 'avro') {
                bytes = encodeAvroBinary(targetRows);
                ext = 'avro';
            } else {
                bytes = encodeFeatherBinary(targetRows);
                ext = 'feather';
            }
            const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${baseName}_converted.${ext}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },
        [dataset, exportScope, queriedResult.rows]
    );

    const inspectedRow =
        inspectedRowIndex !== null && queriedResult.rows[inspectedRowIndex]
            ? queriedResult.rows[inspectedRowIndex]
            : null;

    return (
        <div className="space-y-6">
            {/* Top Dropzone & Sample Studio Bar */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    {/* Drag and drop zone */}
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        aria-label="Upload Parquet, Avro, Feather, Arrow, CSV, or JSON file"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                fileInputRef.current?.click();
                            }
                        }}
                        className={`min-w-0 lg:col-span-7 flex flex-col justify-center items-center text-center rounded-xl border-2 border-dashed p-5 sm:p-6 transition-all cursor-pointer ${isDragging
                            ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30'
                            : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/60 dark:bg-slate-800/40'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".parquet,.avro,.feather,.arrow,.ipc,.json,.jsonl,.ndjson,.csv,.tsv"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void handleFileUpload(file);
                                e.target.value = '';
                            }}
                        />
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                            <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            {isParsing
                                ? 'Parsing binary container in background worker...'
                                : 'Drop Apache Parquet, Avro, or Feather (.arrow) file here — or click to browse'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                            Supports <span className="font-mono font-semibold">.parquet</span> (PAR1 Thrift, PLAIN/RLE_DICTIONARY, Uncompressed/Snappy/GZIP/LZ4),{' '}
                            <span className="font-mono font-semibold">.avro</span> ({'Obj\\x01'} OCF, Null/Deflate/Snappy),{' '}
                            <span className="font-mono font-semibold">.feather</span> (V1 <span className="font-mono">FEA1</span> CTable &amp; V2 <span className="font-mono">ARROW1</span> IPC),{' '}
                            <span className="font-mono font-semibold">.arrow / .ipc</span>, plus <span className="font-mono font-semibold">.jsonl / .csv</span>.
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 max-w-xl">
                            Your selected file contents are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources.
                        </p>
                        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>Local Browser Processing • Exact 64-Bit BigInt Filters • Native .XLSX &amp; CSV</span>
                        </div>
                    </div>

                    {/* 3 Built-In Sample Binary Presets */}
                    <div className="min-w-0 lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 p-4">
                        <div>
                            <div className="flex items-center justify-between mb-2.5">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    Instant Binary Sample Datasets
                                </span>
                                <span className="text-[11px] font-medium text-slate-400">1-Click Load</span>
                            </div>
                            <div className="space-y-2">
                                {SAMPLE_PRESETS.map((sample) => {
                                    const isCurrent = dataset?.metadata.fileName.includes(
                                        sample.id === 'ecommerce_parquet'
                                            ? 'ecommerce_orders'
                                            : sample.id === 'iot_avro'
                                                ? 'iot_sensor'
                                                : 'ml_feature'
                                    );
                                    return (
                                        <button
                                            key={sample.id}
                                            type="button"
                                            onClick={() => handleSelectSample(sample.id)}
                                            className={`w-full text-left p-2.5 rounded-lg border transition-all ${isCurrent
                                                ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 shadow-xs'
                                                : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 hover:border-blue-400'
                                                }`}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                    {sample.label}
                                                </span>
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold">
                                                    {sample.badge}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                                {sample.description}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-3.5 text-sm text-red-700 dark:text-red-300">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="font-bold">Binary Container Parse Alert</p>
                            <p className="text-xs mt-0.5 break-words">{errorMsg}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setErrorMsg(null)}
                            className="text-xs font-semibold underline shrink-0"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Active File Telemetry Bar */}
                {dataset && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                        <div className="min-w-0 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/70 dark:border-slate-700/60">
                            <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                                Detected Format
                            </span>
                            <div className="flex items-center gap-1.5 mt-1 min-w-0" title={dataset.metadata.formatVersion}>
                                <Database className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span className="text-sm font-bold text-slate-900 dark:text-white uppercase truncate">
                                    {dataset.metadata.magicBytes === 'FEA1' ? 'FEATHER V1' : dataset.metadata.magicBytes === 'ARROW1' ? 'FEATHER V2' : dataset.format}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                                    {dataset.metadata.magicBytes}
                                </span>
                            </div>
                        </div>

                        <div className="min-w-0 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/70 dark:border-slate-700/60">
                            <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                                Rows × Columns
                            </span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                                {dataset.metadata.totalRows.toLocaleString()} × {dataset.metadata.totalColumns} cols
                            </p>
                        </div>

                        <div className="min-w-0 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/70 dark:border-slate-700/60">
                            <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                                Codec &amp; Ratio
                            </span>
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono truncate">
                                {dataset.metadata.compressionCodec} ({dataset.metadata.compressionRatio}x)
                            </p>
                        </div>

                        <div className="min-w-0 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/70 dark:border-slate-700/60">
                            <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                                Binary Footprint
                            </span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                                {formatBytes(dataset.metadata.fileSizeBytes)}{' '}
                                <span className="text-xs font-normal text-slate-500">
                                    ({dataset.metadata.rowGroupCount} RG)
                                </span>
                            </p>
                        </div>

                        <div className="min-w-0 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/70 dark:border-slate-700/60">
                            <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                                Parse Latency
                            </span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 font-mono truncate">
                                {dataset.metadata.parseTimeMs.toFixed(2)} ms
                            </p>
                        </div>

                        <div className="min-w-0 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/70 dark:border-slate-700/60">
                            <div className="flex items-center justify-between gap-1">
                                <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                                    Active File
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        uploadSeqRef.current++;
                                        parseDispatcherRef.current?.cancelCurrent('Cleared by user.');
                                        setIsParsing(false);
                                        setDataset(null);
                                        setErrorMsg(null);
                                        setInspectedRowIndex(null);
                                    }}
                                    className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline"
                                >
                                    Clear
                                </button>
                            </div>
                            <p
                                className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate font-mono"
                                title={dataset.metadata.fileName}
                            >
                                {dataset.metadata.fileName}
                            </p>
                        </div>
                    </div>
                )}

                {/* Transparent Format Capabilities, Supported Codecs & Limitations Disclosure */}
                <details className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 group">
                    <summary className="cursor-pointer select-none font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>Supported Formats, Codecs, Known Limitations &amp; Quick-Start Guide</span>
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 group-open:underline">
                            View Technical Specs &amp; How to Use
                        </span>
                    </summary>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                            <span className="font-bold text-slate-900 dark:text-white block">
                                1. Supported Formats &amp; Codecs
                            </span>
                            <p className="leading-relaxed">
                                <strong>Parquet (PAR1):</strong> Thrift footer + DataPage v1/v2 &amp; DictionaryPage (PLAIN, RLE_DICTIONARY, PLAIN_DICTIONARY, RLE boolean, 1-level Dremel LIST, DECIMAL, INT96) with <span className="font-mono">UNCOMPRESSED</span>, <span className="font-mono">SNAPPY</span>, <span className="font-mono">GZIP</span>, &amp; <span className="font-mono">LZ4_RAW</span>.<br />
                                <strong>Avro OCF ({'Obj\\x01'}):</strong> Header schema, 16B sync markers, ZigZag records/unions/arrays/maps with <span className="font-mono">null</span>, <span className="font-mono">deflate</span>, &amp; <span className="font-mono">snappy</span> (CRC32 verified).<br />
                                <strong>Feather V1 (FEA1) &amp; V2 (ARROW1):</strong> Dedicated V1 CTable parser (<span className="font-mono">UNCOMPRESSED</span>) &amp; V2 Arrow IPC FlatBuffers parser (<span className="font-mono">UNCOMPRESSED</span>, <span className="font-mono">LZ4_FRAME</span>).
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                            <span className="font-bold text-slate-900 dark:text-white block">
                                2. Disclosed Limitations &amp; Safeguards
                            </span>
                            <p className="leading-relaxed">
                                Files compressed with native C++ codecs (<span className="font-mono">ZSTD</span>, <span className="font-mono">BROTLI</span>, <span className="font-mono">LZO</span>, <span className="font-mono">bzip2</span>, <span className="font-mono">xz</span>), delta encodings (<span className="font-mono">DELTA_BINARY_PACKED</span>), multi-level nested repetition (<span className="font-mono">maxRepLevel &gt; 1</span>), or KMS-encrypted Parquet (<span className="font-mono">PARE</span>) are explicitly rejected with an actionable error message rather than returning fabricated rows. Input buffer safeguard: <span className="font-mono">250 MB</span> (actual capacity depends on device memory).
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                            <span className="font-bold text-slate-900 dark:text-white block">
                                3. Quick-Start Workflow
                            </span>
                            <p className="leading-relaxed">
                                Drop a file or click a sample preset above → filter across 11 operators (with exact 64-bit <span className="font-mono">BigInt</span> comparison and <span className="font-mono">AND/OR</span> logic) → toggle <strong>Paginated</strong> or <strong>Virtualized Scroll</strong> mode → click any row to inspect nested JSON → switch tabs for 10-dialect SQL DDL, Column Quantiles, Binary X-Ray, or Native <span className="font-mono">.XLSX</span> / CSV export.
                            </p>
                        </div>
                    </div>
                </details>
            </div>

            {/* 5-Tab Workbench Navigation */}
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                {[
                    {
                        id: 'grid' as const,
                        label: 'Data Explorer Grid',
                        icon: TableIcon,
                        badge: dataset ? `${queriedResult.matchedCount}` : undefined,
                    },
                    {
                        id: 'schema' as const,
                        label: 'Schema & DDL Generator',
                        icon: Code2,
                        badge: dataset ? `${dataset.schema.length} cols` : undefined,
                    },
                    {
                        id: 'profiler' as const,
                        label: 'Column Profiler & Stats',
                        icon: BarChart3,
                    },
                    {
                        id: 'xray' as const,
                        label: 'Binary X-Ray Inspector',
                        icon: Binary,
                        badge: dataset?.metadata.magicBytes,
                    },
                    {
                        id: 'export' as const,
                        label: 'Export & Converter Studio',
                        icon: Download,
                        badge: '11 Formats',
                    },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`inline-flex items-center justify-between sm:justify-start gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${isActive
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400'
                                }`}
                        >
                            <span className="inline-flex items-center gap-2">
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{tab.label}</span>
                            </span>
                            {tab.badge && (
                                <span
                                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Empty State when no file or sample is selected yet */}
            {!dataset && !errorMsg && (
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-8 sm:p-10 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                        <Database className="w-6 h-6" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        No Dataset Loaded Yet — Drop a File Above or Select a 1-Click Sample Preset
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Upload your own <span className="font-mono font-semibold">.parquet</span>,{' '}
                        <span className="font-mono font-semibold">.avro</span>,{' '}
                        <span className="font-mono font-semibold">.feather</span> (V1 or V2),{' '}
                        <span className="font-mono font-semibold">.arrow</span>,{' '}
                        <span className="font-mono font-semibold">.jsonl</span>, or{' '}
                        <span className="font-mono font-semibold">.csv</span> file using the dropzone above, or click one of the three{' '}
                        <strong>Instant Binary Sample Datasets</strong> to test the Data Grid, 10-Dialect SQL DDL Generator, Column Profiler, Binary X-Ray, and Native <span className="font-mono font-semibold">.XLSX</span> Exporter.
                    </p>
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                        {SAMPLE_PRESETS.map((sample) => (
                            <button
                                key={sample.id}
                                type="button"
                                onClick={() => handleSelectSample(sample.id)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Load {sample.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ============================================================
          TAB 1: DATA EXPLORER GRID
          ============================================================ */}
            {activeTab === 'grid' && dataset && (
                <div className="space-y-4">
                    {/* Search, Filter Builder (AND/OR) & Column Projection Bar */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* Global Full-Text Search */}
                            <div className="relative flex-1 min-w-0">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Search across all rows, nested structs, and string columns..."
                                    aria-label="Global full-text search across dataset"
                                    className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setCurrentPage(1);
                                        }}
                                        aria-label="Clear search query"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Column Projection Picker Toggle */}
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowColumnPicker((prev) => !prev)}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-blue-500"
                                >
                                    <Layers className="w-4 h-4 text-blue-500" />
                                    Columns ({selectedColumns.length}/{dataset.schema.length})
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab('export')}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Export CSV / .XLSX
                                </button>
                            </div>
                        </div>

                        {/* Column Projection Drawer */}
                        {showColumnPicker && (
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Column Projection &amp; PII Masking (Select columns to display &amp; export)
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedColumns(dataset.schema.map((c) => c.name))}
                                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            Select All
                                        </button>
                                        <span className="text-slate-300 dark:text-slate-600">|</span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedColumns(dataset.schema.slice(0, 1).map((c) => c.name))
                                            }
                                            className="text-xs font-semibold text-slate-500 hover:underline"
                                        >
                                            First Column Only
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {dataset.schema.map((col) => {
                                        const checked = selectedColumns.includes(col.name);
                                        return (
                                            <button
                                                key={col.name}
                                                type="button"
                                                onClick={() => handleToggleColumn(col.name)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${checked
                                                    ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold'
                                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500'
                                                    }`}
                                            >
                                                {checked ? (
                                                    <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                                ) : (
                                                    <Square className="w-3.5 h-3.5 shrink-0" />
                                                )}
                                                <span>{col.name}</span>
                                                <span className="text-[10px] opacity-75">({col.logicalType})</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Predicates / Filter Builder with AND / OR Logic Toggle */}
                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 pt-1">
                            <div className="inline-flex items-center justify-between sm:justify-start gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
                                <span className="inline-flex items-center gap-1.5">
                                    <Filter className="w-3.5 h-3.5 text-blue-500" />
                                    Predicate Filter:
                                </span>
                                {/* AND / OR Combinator Switch */}
                                <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
                                    {(['AND', 'OR'] as const).map((mode) => (
                                        <button
                                            key={mode}
                                            type="button"
                                            onClick={() => setFilterLogic(mode)}
                                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all ${filterLogic === mode
                                                ? 'bg-blue-600 text-white'
                                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                                }`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <select
                                value={newFilterCol}
                                onChange={(e) => setNewFilterCol(e.target.value)}
                                aria-label="Filter column"
                                className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200"
                            >
                                {dataset.schema.map((col) => (
                                    <option key={col.name} value={col.name}>
                                        {col.name} ({col.logicalType})
                                    </option>
                                ))}
                            </select>

                            <select
                                value={newFilterOp}
                                onChange={(e) => setNewFilterOp(e.target.value as FilterOperator)}
                                aria-label="Filter operator"
                                className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                            >
                                {FILTER_OPERATORS.map((op) => (
                                    <option key={op.id} value={op.id}>
                                        {op.label}
                                    </option>
                                ))}
                            </select>

                            {newFilterOp !== 'is_null' && newFilterOp !== 'is_not_null' && (
                                <input
                                    type="text"
                                    value={newFilterVal}
                                    onChange={(e) => setNewFilterVal(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddFilter();
                                        }
                                    }}
                                    placeholder="Filter value..."
                                    aria-label="Filter value"
                                    className="w-full sm:w-44 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                                />
                            )}

                            <button
                                type="button"
                                onClick={handleAddFilter}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add ({filterLogic})
                            </button>

                            {filters.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFilters([]);
                                        setCurrentPage(1);
                                    }}
                                    className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline ml-1"
                                >
                                    Clear All ({filters.length})
                                </button>
                            )}
                        </div>

                        {/* Active Filter Pills */}
                        {filters.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                {filters.map((f, idx) => (
                                    <React.Fragment key={`${f.column}-${idx}`}>
                                        {idx > 0 && (
                                            <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                {f.join ?? filterLogic}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-mono text-blue-700 dark:text-blue-300">
                                            <strong>{f.column}</strong> {f.operator}{' '}
                                            {f.operator !== 'is_null' && f.operator !== 'is_not_null' && (
                                                <span>&quot;{f.value}&quot;</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFilter(idx)}
                                                aria-label={`Remove filter on ${f.column}`}
                                                className="hover:text-red-500"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </span>
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Interactive Data Table + Optional Row Drawer */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        <div
                            className={`min-w-0 ${inspectedRow ? 'lg:col-span-8' : 'lg:col-span-12'
                                } rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm`}
                        >
                            <div
                                onScroll={(e) => {
                                    if (gridMode === 'virtualized') {
                                        setVirtualScrollTop(e.currentTarget.scrollTop);
                                    }
                                }}
                                className="w-full overflow-x-auto overscroll-x-contain max-h-[540px]"
                            >
                                <table className="min-w-[680px] w-full text-left border-collapse">
                                    <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="py-2.5 px-3 text-[11px] font-mono uppercase text-slate-400 w-12 text-center">
                                                #
                                            </th>
                                            {visibleSchema.map((col) => {
                                                const isSorted = sortConfig?.column === col.name;
                                                return (
                                                    <th
                                                        key={col.name}
                                                        onClick={() => handleToggleSort(col.name)}
                                                        className="py-2.5 px-3.5 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 select-none whitespace-nowrap"
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-mono">{col.name}</span>
                                                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-normal">
                                                                {col.logicalType}
                                                            </span>
                                                            {isSorted ? (
                                                                sortConfig.direction === 'asc' ? (
                                                                    <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                                ) : (
                                                                    <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                                )
                                                            ) : (
                                                                <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                                                            )}
                                                        </div>
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-xs font-mono">
                                        {displayedRows.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={visibleSchema.length + 1}
                                                    className="py-12 text-center text-slate-500 dark:text-slate-400 font-sans"
                                                >
                                                    No rows match your current search or filter predicates.
                                                </td>
                                            </tr>
                                        ) : (
                                            <>
                                                {gridMode === 'virtualized' && virtualWindow.topSpacerHeight > 0 && (
                                                    <tr aria-hidden="true">
                                                        <td
                                                            colSpan={visibleSchema.length + 1}
                                                            style={{ height: `${virtualWindow.topSpacerHeight}px`, padding: 0, border: 0 }}
                                                        />
                                                    </tr>
                                                )}
                                                {displayedRows.map((row, idx) => {
                                                    const absoluteRowIdx =
                                                        gridMode === 'virtualized'
                                                            ? virtualWindow.startIdx + idx
                                                            : (safePage - 1) * pageSize + idx;
                                                    const isSelected = inspectedRowIndex === absoluteRowIdx;
                                                    return (
                                                        <tr
                                                            key={absoluteRowIdx}
                                                            onClick={() =>
                                                                setInspectedRowIndex(isSelected ? null : absoluteRowIdx)
                                                            }
                                                            className={`cursor-pointer transition-colors ${isSelected
                                                                ? 'bg-blue-50/90 dark:bg-blue-950/50'
                                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                                }`}
                                                        >
                                                            <td className="py-2 px-3 text-center text-[11px] text-slate-400 font-semibold">
                                                                {absoluteRowIdx + 1}
                                                            </td>
                                                            {visibleSchema.map((col) => {
                                                                const val = row[col.name];
                                                                const isNull = val === null || val === undefined;
                                                                const isBool = typeof val === 'boolean';
                                                                const isObj = typeof val === 'object' && val !== null;
                                                                return (
                                                                    <td
                                                                        key={col.name}
                                                                        className="py-2 px-3.5 max-w-[260px] truncate text-slate-800 dark:text-slate-200"
                                                                        title={formatCellPreview(val)}
                                                                    >
                                                                        {isNull ? (
                                                                            <span className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-400 text-[10px] italic">
                                                                                NULL
                                                                            </span>
                                                                        ) : isBool ? (
                                                                            <span
                                                                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${val
                                                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                                                    }`}
                                                                            >
                                                                                {String(val)}
                                                                            </span>
                                                                        ) : isObj ? (
                                                                            <span className="text-indigo-600 dark:text-indigo-400">
                                                                                {formatCellPreview(val)}
                                                                            </span>
                                                                        ) : (
                                                                            formatCellPreview(val)
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    );
                                                })}
                                                {gridMode === 'virtualized' && virtualWindow.bottomSpacerHeight > 0 && (
                                                    <tr aria-hidden="true">
                                                        <td
                                                            colSpan={visibleSchema.length + 1}
                                                            style={{ height: `${virtualWindow.bottomSpacerHeight}px`, padding: 0, border: 0 }}
                                                        />
                                                    </tr>
                                                )}
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span>
                                        Showing{' '}
                                        <strong className="text-slate-900 dark:text-white">
                                            {queriedResult.matchedCount === 0
                                                ? 0
                                                : (safePage - 1) * pageSize + 1}
                                        </strong>{' '}
                                        to{' '}
                                        <strong className="text-slate-900 dark:text-white">
                                            {Math.min(safePage * pageSize, queriedResult.matchedCount)}
                                        </strong>{' '}
                                        of{' '}
                                        <strong className="text-slate-900 dark:text-white">
                                            {queriedResult.matchedCount.toLocaleString()}
                                        </strong>{' '}
                                        rows
                                    </span>
                                    <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                                    <span className="text-[11px] text-blue-600 dark:text-blue-400">
                                        Click any row to inspect nested JSON &amp; types
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
                                    <div
                                        role="group"
                                        aria-label="Data grid rendering mode"
                                        className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setGridMode('paginated')}
                                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${gridMode === 'paginated'
                                                ? 'bg-blue-600 text-white'
                                                : 'text-slate-600 dark:text-slate-400'
                                                }`}
                                        >
                                            Paginated
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setGridMode('virtualized');
                                                setVirtualScrollTop(0);
                                            }}
                                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${gridMode === 'virtualized'
                                                ? 'bg-blue-600 text-white'
                                                : 'text-slate-600 dark:text-slate-400'
                                                }`}
                                        >
                                            Virtualized Scroll
                                        </button>
                                    </div>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        aria-label="Rows per page"
                                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                                    >
                                        {[10, 25, 50, 100, 250].map((size) => (
                                            <option key={size} value={size}>
                                                {size} / page
                                            </option>
                                        ))}
                                    </select>

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            disabled={safePage <= 1}
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            aria-label="Previous page"
                                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-900"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="px-2 font-mono font-bold text-slate-800 dark:text-slate-200">
                                            {safePage} / {totalPages}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={safePage >= totalPages}
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            aria-label="Next page"
                                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-900"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row JSON & Type Inspector Drawer */}
                        {inspectedRow && inspectedRowIndex !== null && (
                            <div className="min-w-0 lg:col-span-4 rounded-2xl border border-blue-500/40 bg-white dark:bg-slate-900 p-4 shadow-md space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <Eye className="w-4 h-4 text-blue-500" />
                                            Row #{inspectedRowIndex + 1} Deep Inspector
                                        </h3>
                                        <p className="text-[11px] text-slate-500">
                                            Nested Struct, Array &amp; INT64 Tree View
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                triggerCopy(JSON.stringify(inspectedRow, null, 2), 'row-json')
                                            }
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold"
                                        >
                                            {copiedId === 'row-json' ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    Copy JSON
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setInspectedRowIndex(null)}
                                            aria-label="Close row inspector"
                                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                                    {dataset.schema.map((col) => {
                                        const val = inspectedRow[col.name];
                                        return (
                                            <div
                                                key={col.name}
                                                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60"
                                            >
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                                        {col.name}
                                                    </span>
                                                    <span className="font-mono text-blue-600 dark:text-blue-400">
                                                        {col.physicalType} → {col.logicalType}
                                                    </span>
                                                </div>
                                                <pre className="mt-1 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-all">
                                                    {typeof val === 'object' && val !== null
                                                        ? JSON.stringify(val, null, 2)
                                                        : formatCellPreview(val)}
                                                </pre>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ============================================================
          TAB 2: SCHEMA & POLYGLOT DDL GENERATOR
          ============================================================ */}
            {activeTab === 'schema' && dataset && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Column Schema Metadata Table */}
                    <div className="min-w-0 lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                    Physical &amp; Logical Schema Tree
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Decoded directly from the {dataset.format.toUpperCase()} binary descriptor
                                </p>
                            </div>
                            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                                {dataset.schema.length} Columns
                            </span>
                        </div>

                        <div className="w-full overflow-x-auto overscroll-x-contain">
                            <table className="min-w-[680px] w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[11px]">
                                        <th className="py-2 px-2.5">#</th>
                                        <th className="py-2 px-2.5">Column</th>
                                        <th className="py-2 px-2.5">Physical</th>
                                        <th className="py-2 px-2.5">Logical</th>
                                        <th className="py-2 px-2.5">Repetition</th>
                                        <th className="py-2 px-2.5">Codec</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800 font-mono">
                                    {dataset.schema.map((col) => (
                                        <tr key={col.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="py-2.5 px-2.5 text-slate-400">{col.index + 1}</td>
                                            <td className="py-2.5 px-2.5 font-bold text-slate-900 dark:text-white">
                                                {col.name}
                                            </td>
                                            <td className="py-2.5 px-2.5 text-indigo-600 dark:text-indigo-400">
                                                {col.physicalType}
                                            </td>
                                            <td className="py-2.5 px-2.5 text-blue-600 dark:text-blue-400">
                                                {col.logicalType}
                                            </td>
                                            <td className="py-2.5 px-2.5">
                                                <span
                                                    className={`px-1.5 py-0.5 rounded text-[10px] ${col.nullable
                                                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                        }`}
                                                >
                                                    {col.repetitionType}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-2.5 text-slate-500">{col.compressionCodec}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 10-Target Code & DDL Generator */}
                    <div className="min-w-0 lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                    Polyglot Schema &amp; SQL DDL Generator (10 Targets)
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Compile ready-to-run data warehouse DDL and typed SDK definitions
                                </p>
                            </div>

                            <input
                                type="text"
                                value={tableName}
                                onChange={(e) => setTableName(e.target.value)}
                                placeholder="Table / Type name"
                                aria-label="Target table or interface name"
                                className="w-full sm:w-44 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                            />
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {SCHEMA_TARGETS.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setSchemaTarget(t.id)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${schemaTarget === t.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative min-w-0">
                            <div className="absolute right-3 top-3 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => triggerCopy(generatedCode, 'schema-code')}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs"
                                >
                                    {copiedId === 'schema-code' ? (
                                        <>
                                            <Check className="w-3.5 h-3.5" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            Copy Code
                                        </>
                                    )}
                                </button>
                            </div>
                            <pre className="p-4 pt-12 rounded-xl bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto max-w-full max-h-[420px] leading-relaxed">
                                {generatedCode}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================
          TAB 3: COLUMN PROFILER & STATISTICS
          ============================================================ */}
            {activeTab === 'profiler' && dataset && (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Column-Level Data Quality, Cardinality &amp; Quantile Profiler
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Inspect null ratios, distinct cardinality, numeric quantiles (P25 / P50 Median / P75), and top frequent values for every column.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {dataset.columnProfiles.map((prof) => {
                                const nonNullPct = (100 - prof.nullPercentage).toFixed(1);
                                return (
                                    <div
                                        key={prof.name}
                                        className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-4 space-y-3"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-bold font-mono text-slate-900 dark:text-white truncate">
                                                    {prof.name}
                                                </h3>
                                                <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400">
                                                    {prof.physicalType} ({prof.logicalType})
                                                </span>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                    {nonNullPct}% Complete
                                                </span>
                                                <span className="block text-[11px] text-slate-400">
                                                    {prof.nullCount} nulls / {prof.distinctCount} distinct
                                                </span>
                                            </div>
                                        </div>

                                        {/* Completeness & Cardinality Bars */}
                                        <div className="space-y-1.5">
                                            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500"
                                                    style={{
                                                        width: `${Math.min(100, Math.max(0, 100 - prof.nullPercentage))}%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                                                <span>Distinct Ratio: {prof.uniquenessRatio}%</span>
                                                <span>Non-Null: {prof.nonNullCount.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* Numeric / String Summary */}
                                        {prof.min !== null && (
                                            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
                                                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                                                    <span className="text-slate-400 block">Min</span>
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                                                        {String(prof.min)}
                                                    </span>
                                                </div>
                                                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                                                    <span className="text-slate-400 block">
                                                        {prof.median !== null ? 'Median (P50)' : 'Mean'}
                                                    </span>
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                                                        {prof.median !== null
                                                            ? prof.median
                                                            : prof.mean !== null
                                                                ? prof.mean
                                                                : '—'}
                                                    </span>
                                                </div>
                                                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                                                    <span className="text-slate-400 block">Max</span>
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                                                        {String(prof.max)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Top Values */}
                                        {prof.topValues.length > 0 && (
                                            <div className="pt-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                                                    Top Frequent Values
                                                </span>
                                                <div className="space-y-1">
                                                    {prof.topValues.slice(0, 3).map((tv, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center justify-between text-xs font-mono bg-white dark:bg-slate-900 px-2.5 py-1 rounded border border-slate-200/60 dark:border-slate-800"
                                                        >
                                                            <span className="truncate max-w-[200px] text-slate-700 dark:text-slate-300">
                                                                {tv.value}
                                                            </span>
                                                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold shrink-0">
                                                                {tv.count} ({tv.percentage}%)
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================
          TAB 4: BINARY X-RAY METADATA INSPECTOR
          ============================================================ */}
            {activeTab === 'xray' && dataset && (
                <div className="space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* Binary Header & Footer Forensics */}
                        <div className="min-w-0 lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Binary className="w-4 h-4 text-blue-500 shrink-0" />
                                Container Binary Header &amp; Footer X-Ray
                            </h2>
                            <div className="space-y-2 text-xs font-mono">
                                <div className="flex justify-between gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Format Version:</span>
                                    <span className="font-bold text-slate-900 dark:text-white text-right">
                                        {dataset.metadata.formatVersion}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Magic Signature:</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400 text-right">
                                        {dataset.metadata.magicBytes} ({dataset.metadata.headerHex})
                                    </span>
                                </div>
                                <div className="flex justify-between gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Created By / Producer:</span>
                                    <span className="font-bold text-slate-900 dark:text-white text-right">
                                        {dataset.metadata.createdBy}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Endianness:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {dataset.metadata.byteOrder}
                                    </span>
                                </div>
                                {dataset.metadata.syncMarkerHex && (
                                    <div className="flex justify-between gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
                                        <span className="text-slate-500">Avro 16-Byte Sync Marker:</span>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-right">
                                            {dataset.metadata.syncMarkerHex}
                                        </span>
                                    </div>
                                )}
                                <div className="pt-2">
                                    <span className="text-slate-500 block mb-1">Footer Trailing Hex Bytes:</span>
                                    <code className="block p-2.5 rounded-xl bg-slate-950 text-emerald-400 text-[11px] break-all">
                                        {dataset.metadata.footerHex}
                                    </code>
                                </div>
                            </div>
                        </div>

                        {/* Key-Value File Metadata */}
                        <div className="min-w-0 lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-blue-500 shrink-0" />
                                Embedded Key-Value Metadata Dictionary
                            </h2>
                            <div className="space-y-2 max-h-[280px] overflow-y-auto">
                                {Object.entries(dataset.metadata.keyValueMetadata).map(([k, v]) => (
                                    <div
                                        key={k}
                                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 font-mono text-xs"
                                    >
                                        <span className="font-bold text-blue-600 dark:text-blue-400 block">{k}</span>
                                        <span className="text-slate-700 dark:text-slate-300 break-all mt-0.5 block">
                                            {v}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Row Groups & Column Chunks Breakdown */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Row Group &amp; Column Chunk Physical Layout ({dataset.metadata.rowGroups.length} Row Group)
                        </h2>
                        {dataset.metadata.rowGroups.map((rg) => (
                            <div key={rg.index} className="space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl">
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        Row Group #{rg.index} • {rg.rowCount.toLocaleString()} Rows
                                    </span>
                                    <span className="text-slate-600 dark:text-slate-300">
                                        Compressed: {formatBytes(rg.compressedBytes)} → Uncompressed:{' '}
                                        {formatBytes(rg.totalByteSize)} ({rg.compressionRatio}x ratio)
                                    </span>
                                </div>
                                <div className="w-full overflow-x-auto overscroll-x-contain">
                                    <table className="min-w-[680px] w-full text-left border-collapse text-xs font-mono">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] uppercase">
                                                <th className="py-2 px-3">Column Chunk</th>
                                                <th className="py-2 px-3">Codec</th>
                                                <th className="py-2 px-3">Encodings</th>
                                                <th className="py-2 px-3">Compressed</th>
                                                <th className="py-2 px-3">Uncompressed</th>
                                                <th className="py-2 px-3">Nulls / Distinct</th>
                                                <th className="py-2 px-3">Zone Map (Min → Max)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                                            {rg.columns.map((c) => (
                                                <tr key={c.name}>
                                                    <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                                                        {c.name}
                                                    </td>
                                                    <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400">
                                                        {c.codec} ({c.compressionRatio}x)
                                                    </td>
                                                    <td className="py-2 px-3 text-slate-500">{c.encodings.join(', ')}</td>
                                                    <td className="py-2 px-3">{formatBytes(c.compressedSize)}</td>
                                                    <td className="py-2 px-3">{formatBytes(c.uncompressedSize)}</td>
                                                    <td className="py-2 px-3">
                                                        {c.nullCount} nulls / {c.distinctCount} dist
                                                    </td>
                                                    <td className="py-2 px-3 text-blue-600 dark:text-blue-400 truncate max-w-[240px]">
                                                        {c.minValue ?? '—'} → {c.maxValue ?? '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ============================================================
          TAB 5: EXPORT & CONVERTER STUDIO
          ============================================================ */}
            {activeTab === 'export' && dataset && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Export Configuration Controls */}
                    <div className="min-w-0 lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                Tabular &amp; Binary Converter Studio
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Convert {dataset.format.toUpperCase()} to RFC 4180 CSV, native binary Excel (.xlsx), JSON, SQL, or transcode across binary formats.
                            </p>
                        </div>

                        {/* Scope Selector */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                                1. Export Row &amp; Column Scope
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setExportScope('filtered')}
                                    className={`p-2.5 rounded-xl border text-left text-xs font-bold ${exportScope === 'filtered'
                                        ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                                        : 'border-slate-200 dark:border-slate-800 text-slate-600'
                                        }`}
                                >
                                    Filtered &amp; Projected ({queriedResult.matchedCount} rows, {selectedColumns.length}{' '}
                                    cols)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setExportScope('all')}
                                    className={`p-2.5 rounded-xl border text-left text-xs font-bold ${exportScope === 'all'
                                        ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                                        : 'border-slate-200 dark:border-slate-800 text-slate-600'
                                        }`}
                                >
                                    Full Dataset ({dataset.rows.length} rows, {dataset.schema.length} cols)
                                </button>
                            </div>
                        </div>

                        {/* Format Selector */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                                2. Target Export Format
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {[
                                    { id: 'csv' as const, label: 'CSV Spreadsheet (.csv)' },
                                    { id: 'xlsx' as const, label: 'Excel Workbook (.xlsx)' },
                                    { id: 'json' as const, label: 'JSON Array (.json)' },
                                    { id: 'jsonl' as const, label: 'JSON Lines (.jsonl)' },
                                    { id: 'tsv' as const, label: 'Tab-Separated (.tsv)' },
                                    { id: 'sql' as const, label: 'SQL INSERT Batch (.sql)' },
                                    { id: 'markdown' as const, label: 'Markdown Table (.md)' },
                                    { id: 'html' as const, label: 'HTML5 Table (.html)' },
                                ].map((fmt) => (
                                    <button
                                        key={fmt.id}
                                        type="button"
                                        onClick={() => setExportFormat(fmt.id)}
                                        className={`px-3 py-2 rounded-xl border text-xs font-bold text-left transition-all ${exportFormat === fmt.id
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        {fmt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* CSV & Security Options */}
                        {(exportFormat === 'csv' || exportFormat === 'xlsx' || exportFormat === 'tsv') && (
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                                {exportFormat === 'csv' && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                            CSV Field Delimiter:
                                        </span>
                                        <select
                                            value={csvDelimiter}
                                            onChange={(e) =>
                                                setCsvDelimiter(e.target.value as ',' | ';' | '\t' | '|')
                                            }
                                            aria-label="CSV delimiter"
                                            className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                                        >
                                            <option value=",">Comma (,)</option>
                                            <option value=";">Semicolon (;)</option>
                                            <option value="&#9;">Tab (\t)</option>
                                            <option value="|">Pipe (|)</option>
                                        </select>
                                    </div>
                                )}

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={sanitizeFormulas}
                                        onChange={(e) => setSanitizeFormulas(e.target.checked)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                                        CWE-1236 CSV/Excel Formula Injection Guard (neutralize leading =, +, -, @)
                                    </span>
                                </label>

                                {exportFormat === 'csv' && (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={includeUtf8Bom}
                                            onChange={(e) => setIncludeUtf8Bom(e.target.checked)}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                                            Prepend UTF-8 BOM (\uFEFF) for Microsoft Excel Unicode safety
                                        </span>
                                    </label>
                                )}
                            </div>
                        )}

                        {/* JSON Format Options */}
                        {exportFormat === 'json' && (
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={prettyJson}
                                        onChange={(e) => setPrettyJson(e.target.checked)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                                        Pretty Print JSON (2-space indent formatting)
                                    </span>
                                </label>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleDownloadExport}
                            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            Download Converted .{exportFormat.toUpperCase()} File
                        </button>

                        {/* Cross-Format Binary Transcoder */}
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                                3. Cross-Format Binary Container Transcoder
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleDownloadBinaryTranscode('parquet')}
                                    className="py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50"
                                >
                                    → .parquet
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDownloadBinaryTranscode('avro')}
                                    className="py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50"
                                >
                                    → .avro
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDownloadBinaryTranscode('feather')}
                                    className="py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50"
                                >
                                    → .feather
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Live Output Preview Pane */}
                    <div className="min-w-0 lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Live {exportFormat.toUpperCase()} Output Preview (First 100 Rows)
                                </h3>
                                <p className="text-xs text-slate-500">
                                    BigInt INT64 values and nested structs are serialized without precision loss
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => triggerCopy(exportPreviewText, 'export-preview')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold shrink-0"
                            >
                                {copiedId === 'export-preview' ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        Copy Preview
                                    </>
                                )}
                            </button>
                        </div>

                        <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 text-xs font-mono overflow-auto max-w-full max-h-[430px] leading-relaxed">
                            {exportPreviewText}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}