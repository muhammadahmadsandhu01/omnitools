'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
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
    ChevronDown,
    AlertTriangle,
    X,
    Plus,
    Binary,
    HardDrive,
    ExternalLink,
    Info,
    FolderOpen,
} from 'lucide-react';

import {
    MAX_SAFE_FILE_BYTES,
    createColumnarParseWorkerDispatcher,
    isColumnarParseCancelledError,
    generateSampleBinaryFile,
    buildForensicXRayMetadata,
    type ColumnarParseWorkerDispatcher,
    type ContainerBinaryMetadata,
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
        shortLabel: 'Orders (.parquet)',
        label: 'E-Commerce Orders (.parquet)',
        badge: 'Parquet v2 • Snappy • INT64',
        description: '25 order records with 18-digit INT64 IDs, timestamps, nested structs & arrays.',
    },
    {
        id: 'iot_avro' as const,
        shortLabel: 'IoT Stream (.avro)',
        label: 'IoT Telemetry Stream (.avro)',
        badge: 'Avro Obj1 • ZigZag • Unions',
        description: '20 sensor payloads with nullable unions, firmware metadata & alert flags.',
    },
    {
        id: 'ml_feather' as const,
        shortLabel: 'Embeddings (.feather)',
        label: 'LLM Embedding Store (.feather)',
        badge: 'Feather v2 • ARROW1 • Float64',
        description: '18 Arrow IPC rows with cosine similarity scores, token counts & float vectors.',
    },
];

const SUPPORTED_FORMAT_PILLS = [
    '.parquet',
    '.avro',
    '.feather',
    '.arrow',
    '.ipc',
    '.jsonl',
    '.csv',
];

const SCHEMA_TARGETS: { id: SchemaTargetLanguage; label: string; ext: string }[] = [
    { id: 'postgresql', label: 'PostgreSQL', ext: 'sql' },
    { id: 'snowflake', label: 'Snowflake', ext: 'sql' },
    { id: 'bigquery', label: 'BigQuery', ext: 'sql' },
    { id: 'duckdb', label: 'DuckDB SQL', ext: 'sql' },
    { id: 'clickhouse', label: 'ClickHouse', ext: 'sql' },
    { id: 'typescript', label: 'TypeScript', ext: 'ts' },
    { id: 'pyarrow', label: 'PyArrow', ext: 'py' },
    { id: 'polars', label: 'Polars', ext: 'py' },
    { id: 'avro_schema', label: 'Avro (.avsc)', ext: 'avsc' },
    { id: 'json_schema', label: 'JSON Schema', ext: 'json' },
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
    // Core dataset & forensic fallback state
    const [dataset, setDataset] = useState<ColumnarParseResult | null>(null);
    const [forensicXRay, setForensicXRay] = useState<ContainerBinaryMetadata | null>(null);
    const [activeTab, setActiveTab] = useState<StudioTab>('grid');
    const [isDragging, setIsDragging] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Progressive disclosure panels (keeps primary workspace clean & uncluttered)
    const [showFilterBuilder, setShowFilterBuilder] = useState(false);
    const [showColumnPicker, setShowColumnPicker] = useState(false);
    const [showSpecsDrawer, setShowSpecsDrawer] = useState(false);

    // Explorer state (Search, Filter with AND/OR logic, Sort, Projection, Pagination, Row Drawer)
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterCondition[]>([]);
    const [filterLogic, setFilterLogic] = useState<FilterLogicMode>('AND');
    const [newFilterCol, setNewFilterCol] = useState('');
    const [newFilterOp, setNewFilterOp] = useState<FilterOperator>('contains');
    const [newFilterVal, setNewFilterVal] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
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
        setForensicXRay(null);
        const colNames = parsed.schema.map((c) => c.name);
        setSelectedColumns(colNames);
        setNewFilterCol(colNames[0] || '');
        setFilters([]);
        setSearchQuery('');
        setSortConfig(null);
        setCurrentPage(1);
        setInspectedRowIndex(null);
        setActiveTab('grid');
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
            setForensicXRay(null);
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
                    const message = err instanceof Error ? err.message : 'Unable to parse binary file.';
                    setIsParsing(false);
                    setDataset(null);
                    setInspectedRowIndex(null);
                    setErrorMsg(message);
                    if (bytes && bytes.length > 0) {
                        setForensicXRay(buildForensicXRayMetadata(bytes, fileName, message));
                    }
                });
        },
        [applyParsedDataset]
    );

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
            setForensicXRay(null);
            if (file.size > MAX_SAFE_FILE_BYTES) {
                setIsParsing(false);
                setDataset(null);
                setInspectedRowIndex(null);
                setErrorMsg(
                    `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the in-browser allocation safeguard of ${MAX_SAFE_FILE_BYTES / (1024 * 1024)} MB.`
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

    const handleClearWorkspace = useCallback(() => {
        uploadSeqRef.current++;
        parseDispatcherRef.current?.cancelCurrent('Cleared by user.');
        setIsParsing(false);
        setDataset(null);
        setForensicXRay(null);
        setErrorMsg(null);
        setInspectedRowIndex(null);
        setShowFilterBuilder(false);
        setShowColumnPicker(false);
    }, []);

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

    const activeXRayMeta = dataset?.metadata ?? forensicXRay;
    const hasActiveWorkspace = Boolean(dataset || forensicXRay);

    const xrayLayoutHeading = useMemo(() => {
        if (!activeXRayMeta) return 'Physical Container Layout';
        if (activeXRayMeta.format === 'parquet') {
            return `Parquet Row Groups & Column Chunks (${activeXRayMeta.rowGroups.length})`;
        }
        if (activeXRayMeta.format === 'avro') {
            return `Avro OCF Physical Data Blocks (${activeXRayMeta.rowGroups.length})`;
        }
        if (activeXRayMeta.format === 'feather' || activeXRayMeta.format === 'arrow_stream') {
            return `Arrow IPC / Feather RecordBatches (${activeXRayMeta.rowGroups.length})`;
        }
        return 'In-Memory Text Stream Partition (Synthetic Estimate)';
    }, [activeXRayMeta]);

    const formatBadgeLabel = useMemo(() => {
        if (!activeXRayMeta) return '';
        if (activeXRayMeta.magicBytes === 'FEA1') return 'FEATHER V1';
        if (activeXRayMeta.magicBytes === 'ARROW1') return 'FEATHER V2';
        return activeXRayMeta.format.toUpperCase();
    }, [activeXRayMeta]);

    return (
        <div
            className="relative space-y-4"
            onDragOver={(e) => {
                e.preventDefault();
                if (!isDragging) setIsDragging(true);
            }}
            onDragLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
                setIsDragging(false);
            }}
            onDrop={handleDrop}
        >
            {/* Shared Hidden File Input */}
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

            {/* Full-Workspace Drag Overlay when a file is already loaded */}
            {hasActiveWorkspace && isDragging && (
                <div className="fixed inset-0 z-50 bg-blue-950/50 backdrop-blur-xs flex items-center justify-center p-4 pointer-events-none">
                    <div className="rounded-3xl border-2 border-dashed border-blue-400 bg-white dark:bg-slate-900 px-8 py-10 text-center shadow-2xl max-w-md w-full">
                        <Upload className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                        <p className="text-base font-bold text-slate-900 dark:text-white">
                            Drop file to inspect locally
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Supports .parquet, .avro, .feather, .arrow, .ipc, .jsonl &amp; .csv
                        </p>
                    </div>
                </div>
            )}

            {/* ========================================================================
                STATE 1: CLEAN, FOCUSED LANDING DROPZONE (BEFORE A FILE IS OPENED)
                ======================================================================== */}
            {!hasActiveWorkspace && (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        aria-label="Drop or select a Parquet, Avro, Feather, Arrow, CSV, or JSONL file"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                fileInputRef.current?.click();
                            }
                        }}
                        className={`m-3 sm:m-5 rounded-2xl border-2 border-dashed px-6 py-10 sm:py-14 text-center transition-all cursor-pointer ${isDragging
                                ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30'
                                : 'border-slate-200 dark:border-slate-700/80 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/60 dark:bg-slate-950/40'
                            }`}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-6 h-6" />
                        </div>

                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {isParsing
                                ? 'Decoding binary file in background worker...'
                                : 'Drop a Parquet, Avro, or Feather file here'}
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto">
                            Browse rows, inspect schemas &amp; stats, generate SQL DDL, or export to CSV and Excel (.xlsx) right in your browser.
                        </p>

                        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-xs transition-colors">
                                <FolderOpen className="w-4 h-4" />
                                Choose File
                            </span>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
                            {SUPPORTED_FORMAT_PILLS.map((ext) => (
                                <span
                                    key={ext}
                                    className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 font-mono text-[11px] font-medium text-slate-600 dark:text-slate-400"
                                >
                                    {ext}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Clean Sample Bar + Privacy & Specs Footer */}
                    <div className="px-4 sm:px-6 pb-5 pt-1 flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-2.5">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 inline-flex items-center justify-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                Or try a sample:
                            </span>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                {SAMPLE_PRESETS.map((sample) => (
                                    <button
                                        key={sample.id}
                                        type="button"
                                        onClick={() => handleSelectSample(sample.id)}
                                        title={sample.description}
                                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all"
                                    >
                                        {sample.shortLabel}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <div className="inline-flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>
                                    Files stay on your device (up to 250 MB / 5M rows) · Exact 64-bit BigInt · No signup
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSpecsDrawer((v) => !v)}
                                aria-expanded={showSpecsDrawer}
                                className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline self-start sm:self-auto"
                            >
                                <Info className="w-3.5 h-3.5" />
                                <span>{showSpecsDrawer ? 'Hide codecs & limits' : 'Supported codecs & limits'}</span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSpecsDrawer ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================
                ERROR BANNER (SHOWN ABOVE WORKSPACE OR LANDING DROPZONE)
                ======================================================================== */}
            {errorMsg && (
                <div
                    role="alert"
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-red-200 dark:border-red-800/80 bg-red-50/90 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-300"
                >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="font-bold">Unable to decode binary file</p>
                            <p className="text-xs mt-0.5 break-words">{errorMsg}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {forensicXRay && (
                            <button
                                type="button"
                                onClick={() => setActiveTab('xray')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-xs"
                            >
                                <Binary className="w-3.5 h-3.5" />
                                Inspect in Binary X-Ray
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setErrorMsg(null)}
                            className="text-xs font-semibold underline px-2 py-1"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* ========================================================================
                COLLAPSIBLE TECHNICAL SPECS & CODEC DISCLOSURE (PROGRESSIVE DISCLOSURE)
                ======================================================================== */}
            {showSpecsDrawer && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                            Supported Formats, Codecs &amp; Disclosed Limitations
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowSpecsDrawer(false)}
                            aria-label="Close specifications"
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                            <span className="font-bold text-slate-900 dark:text-white block">
                                1. Supported Formats &amp; Codecs
                            </span>
                            <p className="leading-relaxed">
                                <strong>Parquet (PAR1):</strong> Thrift footer, DataPage v1/v2, PLAIN, RLE_DICTIONARY, RLE, Dremel LIST/STRUCT/MAP, DECIMAL, INT96 &amp; ms/us/ns timestamps (<span className="font-mono">UNCOMPRESSED</span>, <span className="font-mono">SNAPPY</span>, <span className="font-mono">GZIP</span>, <span className="font-mono">LZ4</span>, <span className="font-mono">LZ4_RAW</span>).<br />
                                <strong>Avro OCF ({'Obj\\x01'}):</strong> <span className="font-mono">null</span>, <span className="font-mono">deflate</span> &amp; <span className="font-mono">snappy</span> (CRC32 verified), plus Confluent <span className="font-mono">0x00</span> wire detection.<br />
                                <strong>Feather V1 (FEA1) &amp; V2 (ARROW1):</strong> CTable &amp; Arrow IPC FlatBuffers (<span className="font-mono">UNCOMPRESSED</span> &amp; <span className="font-mono">LZ4_FRAME</span>, DictionaryBatch, Decimal, List, Struct &amp; Map).
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                            <span className="font-bold text-slate-900 dark:text-white block">
                                2. Disclosed Limitations &amp; Privacy
                            </span>
                            <p className="leading-relaxed">
                                Native C++ codecs (<span className="font-mono">ZSTD</span>, <span className="font-mono">BROTLI</span>, <span className="font-mono">LZO</span>, <span className="font-mono">bzip2</span>, <span className="font-mono">xz</span>), delta encodings (<span className="font-mono">DELTA_BINARY_PACKED</span>), and KMS-encrypted Parquet (<span className="font-mono">PARE</span>) are flagged with diagnostic errors and Forensic Binary X-Ray inspection. Your selected file contents are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources.
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                            <span className="font-bold text-slate-900 dark:text-white block">
                                3. Capabilities Summary
                            </span>
                            <p className="leading-relaxed">
                                11-operator <span className="font-mono">AND/OR</span> Predicate Filter with exact 64-bit <span className="font-mono">BigInt</span> comparison • Paginated &amp; Virtualized Scroll • 10-target SQL DDL &amp; SDK generator • Column Quantiles (P25/P50/P75, Mean, StdDev, Top 5) • Binary X-Ray • 11 export formats (8 tabular/text incl. native <span className="font-mono">.xlsx</span> + 3 binary transcoders).
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================
                STATE 2: UNIFIED, COMPACT WORKSPACE SHELL (ONCE A FILE IS LOADED)
                ======================================================================== */}
            {hasActiveWorkspace && (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                    {/* Compact Top File & Telemetry Header */}
                    <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/80">
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <Database className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className="text-sm font-bold font-mono text-slate-900 dark:text-white truncate max-w-[240px] sm:max-w-xs"
                                        title={activeXRayMeta?.fileName}
                                    >
                                        {activeXRayMeta?.fileName}
                                    </span>
                                    {formatBadgeLabel && (
                                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                                            {formatBadgeLabel} · {activeXRayMeta?.magicBytes}
                                        </span>
                                    )}
                                    {isParsing && (
                                        <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                                            Parsing…
                                        </span>
                                    )}
                                </div>
                                {dataset && (
                                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                        <span>
                                            <strong className="text-slate-700 dark:text-slate-200">{dataset.metadata.totalRows.toLocaleString()}</strong> rows ×{' '}
                                            <strong className="text-slate-700 dark:text-slate-200">{dataset.metadata.totalColumns}</strong> cols
                                        </span>
                                        <span className="text-slate-300 dark:text-slate-700">·</span>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                            {dataset.metadata.compressionCodec} ({dataset.metadata.compressionRatio}x)
                                        </span>
                                        <span className="text-slate-300 dark:text-slate-700">·</span>
                                        <span>
                                            {formatBytes(dataset.metadata.fileSizeBytes)} ({dataset.metadata.rowGroupCount}{' '}
                                            {dataset.format === 'avro' ? 'Blk' : dataset.format === 'feather' || dataset.format === 'arrow_stream' ? 'Batch' : 'RG'})
                                        </span>
                                        <span className="text-slate-300 dark:text-slate-700">·</span>
                                        <span>{dataset.metadata.parseTimeMs.toFixed(2)} ms</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Compact Actions: Switch Sample, Open File, Specs, Close */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5">
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
                                            title={sample.description}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${isCurrent
                                                    ? 'bg-blue-600 text-white shadow-xs'
                                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                        >
                                            {sample.shortLabel}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                            >
                                <Upload className="w-3.5 h-3.5 text-blue-500" />
                                Open File
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowSpecsDrawer((v) => !v)}
                                title="Supported codecs & limits"
                                aria-label="Supported codecs and limits"
                                className={`p-1.5 rounded-xl border transition-colors ${showSpecsDrawer
                                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                            >
                                <Info className="w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                onClick={handleClearWorkspace}
                                title="Close file"
                                aria-label="Close file and return to dropzone"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold text-slate-500 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Close</span>
                            </button>
                        </div>
                    </div>

                    {/* Clean Underline Navigation Tabs */}
                    <div
                        role="tablist"
                        aria-label="Workspace views"
                        className="px-4 sm:px-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto"
                    >
                        {[
                            {
                                id: 'grid' as const,
                                label: 'Data Grid',
                                icon: TableIcon,
                                badge: dataset ? queriedResult.matchedCount.toLocaleString() : undefined,
                                disabled: !dataset,
                            },
                            {
                                id: 'schema' as const,
                                label: 'Schema & DDL',
                                icon: Code2,
                                badge: dataset ? `${dataset.schema.length}` : undefined,
                                disabled: !dataset,
                            },
                            {
                                id: 'profiler' as const,
                                label: 'Profiler',
                                icon: BarChart3,
                                disabled: !dataset,
                            },
                            {
                                id: 'xray' as const,
                                label: 'Binary X-Ray',
                                icon: Binary,
                                badge: activeXRayMeta?.magicBytes,
                                disabled: !activeXRayMeta,
                            },
                            {
                                id: 'export' as const,
                                label: 'Export',
                                icon: Download,
                                badge: '11 formats',
                                disabled: !dataset,
                            },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    disabled={tab.disabled}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative inline-flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px disabled:opacity-40 disabled:cursor-not-allowed ${isActive
                                            ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span>{tab.label}</span>
                                    {tab.badge && (
                                        <span
                                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isActive
                                                    ? 'bg-blue-600/10 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                                }`}
                                        >
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* ============================================================
                        TAB 1: DATA EXPLORER GRID
                        ============================================================ */}
                    {activeTab === 'grid' && dataset && (
                        <div className="p-4 sm:p-5 space-y-4">
                            {/* Single Clean Action Bar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div className="relative flex-1 min-w-0">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        placeholder="Search across all rows, nested structs & columns..."
                                        aria-label="Global full-text search across dataset"
                                        className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                                <div className="flex flex-wrap items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setShowFilterBuilder((v) => !v)}
                                        aria-expanded={showFilterBuilder}
                                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${showFilterBuilder || filters.length > 0
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-400'
                                            }`}
                                    >
                                        <Filter className="w-3.5 h-3.5" />
                                        <span>Filter</span>
                                        {filters.length > 0 && (
                                            <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-mono">
                                                {filters.length}
                                            </span>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowColumnPicker((v) => !v)}
                                        aria-expanded={showColumnPicker}
                                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${showColumnPicker || selectedColumns.length < dataset.schema.length
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-400'
                                            }`}
                                    >
                                        <Layers className="w-3.5 h-3.5" />
                                        <span>
                                            Columns ({selectedColumns.length}/{dataset.schema.length})
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('export')}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Export CSV / XLSX
                                    </button>
                                </div>
                            </div>

                            {/* Collapsible Predicate Filter Builder Drawer */}
                            {showFilterBuilder && (
                                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-2">
                                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
                                            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900 self-start">
                                                {(['AND', 'OR'] as const).map((mode) => (
                                                    <button
                                                        key={mode}
                                                        type="button"
                                                        onClick={() => setFilterLogic(mode)}
                                                        className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${filterLogic === mode
                                                                ? 'bg-blue-600 text-white'
                                                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                                            }`}
                                                    >
                                                        {mode}
                                                    </button>
                                                ))}
                                            </div>

                                            <select
                                                value={newFilterCol}
                                                onChange={(e) => setNewFilterCol(e.target.value)}
                                                aria-label="Filter column"
                                                className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200"
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
                                                className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
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
                                                    placeholder="Value..."
                                                    aria-label="Filter value"
                                                    className="w-full sm:w-44 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                                                />
                                            )}

                                            <button
                                                type="button"
                                                onClick={handleAddFilter}
                                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Add Filter
                                            </button>
                                        </div>

                                        <Link
                                            href="/developer/sqlite-viewer"
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline self-start sm:self-center"
                                        >
                                            <span>Need full SQL SELECT / JOIN? DuckDB Studio</span>
                                            <ExternalLink className="w-3 h-3 shrink-0" />
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Active Filter Pills (Always Visible Even When Drawer Is Collapsed) */}
                            {filters.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                    {filters.map((f, idx) => (
                                        <React.Fragment key={`${f.column}-${idx}`}>
                                            {idx > 0 && (
                                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                    {f.join ?? filterLogic}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs font-mono text-blue-700 dark:text-blue-300">
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
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFilters([]);
                                            setCurrentPage(1);
                                        }}
                                        className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline ml-1"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}

                            {/* Collapsible Column Projection Drawer */}
                            {showColumnPicker && (
                                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            Select visible columns (also filters exported columns)
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
                                    <div className="flex flex-wrap gap-1.5">
                                        {dataset.schema.map((col) => {
                                            const checked = selectedColumns.includes(col.name);
                                            return (
                                                <button
                                                    key={col.name}
                                                    type="button"
                                                    onClick={() => handleToggleColumn(col.name)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${checked
                                                            ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold'
                                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500'
                                                        }`}
                                                >
                                                    {checked ? (
                                                        <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                                    ) : (
                                                        <Square className="w-3.5 h-3.5 shrink-0" />
                                                    )}
                                                    <span>{col.name}</span>
                                                    <span className="text-[10px] opacity-70">{col.logicalType}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Interactive Data Table + Optional Row Inspector */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                                <div
                                    className={`min-w-0 ${inspectedRow ? 'lg:col-span-8' : 'lg:col-span-12'
                                        } rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden`}
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
                                            <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-700">
                                                <tr>
                                                    <th className="py-2.5 px-3 text-[11px] font-mono text-slate-400 w-12 text-center">
                                                        #
                                                    </th>
                                                    {visibleSchema.map((col) => {
                                                        const isSorted = sortConfig?.column === col.name;
                                                        return (
                                                            <th
                                                                key={col.name}
                                                                onClick={() => handleToggleSort(col.name)}
                                                                className="py-2.5 px-3.5 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none whitespace-nowrap"
                                                            >
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-mono">{col.name}</span>
                                                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 font-normal">
                                                                        {col.logicalType}
                                                                    </span>
                                                                    {isSorted ? (
                                                                        sortConfig.direction === 'asc' ? (
                                                                            <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                                        ) : (
                                                                            <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                                        )
                                                                    ) : (
                                                                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-50" />
                                                                    )}
                                                                </div>
                                                            </th>
                                                        );
                                                    })}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs font-mono">
                                                {displayedRows.length === 0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={visibleSchema.length + 1}
                                                            className="py-12 text-center text-slate-500 dark:text-slate-400 font-sans"
                                                        >
                                                            No rows match your current search or filter criteria.
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
                                                                            ? 'bg-blue-50/90 dark:bg-blue-950/40'
                                                                            : 'hover:bg-slate-50/90 dark:hover:bg-slate-800/40'
                                                                        }`}
                                                                >
                                                                    <td className="py-2 px-3 text-center text-[11px] text-slate-400">
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
                                                                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] italic">
                                                                                        NULL
                                                                                    </span>
                                                                                ) : isBool ? (
                                                                                    <span
                                                                                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${val
                                                                                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                                                                                : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
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

                                    {/* Minimal Table Footer */}
                                    <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span>
                                                <strong className="text-slate-800 dark:text-slate-200">
                                                    {queriedResult.matchedCount === 0
                                                        ? 0
                                                        : (safePage - 1) * pageSize + 1}
                                                    –{Math.min(safePage * pageSize, queriedResult.matchedCount)}
                                                </strong>{' '}
                                                of{' '}
                                                <strong className="text-slate-800 dark:text-slate-200">
                                                    {queriedResult.matchedCount.toLocaleString()}
                                                </strong>{' '}
                                                rows
                                            </span>
                                            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>
                                            <span className="text-[11px]">Click any row to inspect JSON</span>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
                                            <div
                                                role="group"
                                                aria-label="Data grid rendering mode"
                                                className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setGridMode('paginated')}
                                                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${gridMode === 'paginated'
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
                                                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${gridMode === 'virtualized'
                                                            ? 'bg-blue-600 text-white'
                                                            : 'text-slate-600 dark:text-slate-400'
                                                        }`}
                                                >
                                                    Virtual Scroll
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
                                                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-900"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <span className="px-2 font-mono font-semibold text-slate-700 dark:text-slate-200">
                                                    {safePage} / {totalPages}
                                                </span>
                                                <button
                                                    type="button"
                                                    disabled={safePage >= totalPages}
                                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                    aria-label="Next page"
                                                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-900"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Row JSON & Type Inspector Side Panel */}
                                {inspectedRow && inspectedRowIndex !== null && (
                                    <div className="min-w-0 lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                    <Eye className="w-4 h-4 text-blue-500" />
                                                    Row #{inspectedRowIndex + 1}
                                                </h3>
                                                <p className="text-[11px] text-slate-500">
                                                    Nested JSON &amp; exact INT64 values
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        triggerCopy(JSON.stringify(inspectedRow, null, 2), 'row-json')
                                                    }
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold"
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
                                                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800"
                                                    >
                                                        <div className="flex items-center justify-between gap-2 text-[11px]">
                                                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                                                                {col.name}
                                                            </span>
                                                            <span className="font-mono text-blue-600 dark:text-blue-400 shrink-0">
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
                        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                            {/* Column Schema Table */}
                            <div className="min-w-0 lg:col-span-6 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Physical &amp; Logical Schema
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Decoded from {dataset.format.toUpperCase()} descriptor
                                        </p>
                                    </div>
                                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                                        {dataset.schema.length} cols
                                    </span>
                                </div>

                                <div className="w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <table className="min-w-[540px] w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px]">
                                                <th className="py-2.5 px-3">#</th>
                                                <th className="py-2.5 px-3">Column</th>
                                                <th className="py-2.5 px-3">Physical</th>
                                                <th className="py-2.5 px-3">Logical</th>
                                                <th className="py-2.5 px-3">Nullability</th>
                                                <th className="py-2.5 px-3">Codec</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
                                            {dataset.schema.map((col) => (
                                                <tr key={col.name} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                                    <td className="py-2 px-3 text-slate-400">{col.index + 1}</td>
                                                    <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                                                        {col.name}
                                                    </td>
                                                    <td className="py-2 px-3 text-indigo-600 dark:text-indigo-400">
                                                        {col.physicalType}
                                                    </td>
                                                    <td className="py-2 px-3 text-blue-600 dark:text-blue-400">
                                                        {col.logicalType}
                                                        {col.precision !== undefined ? `(${col.precision},${col.scale ?? 0})` : ''}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <span
                                                            className={`px-1.5 py-0.5 rounded text-[10px] ${col.nullable
                                                                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                                                    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                                }`}
                                                        >
                                                            {col.repetitionType}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-3 text-slate-500">{col.compressionCodec}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 10-Target Code & DDL Generator */}
                            <div className="min-w-0 lg:col-span-6 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Polyglot DDL &amp; Schema Generator (10 Targets)
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Ready-to-paste SQL DDL &amp; typed SDK definitions
                                        </p>
                                    </div>
                                    <input
                                        type="text"
                                        value={tableName}
                                        onChange={(e) => setTableName(e.target.value)}
                                        placeholder="Table / Type name"
                                        aria-label="Target table or interface name"
                                        className="w-full sm:w-44 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {SCHEMA_TARGETS.map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setSchemaTarget(t.id)}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${schemaTarget === t.id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative min-w-0">
                                    <button
                                        type="button"
                                        onClick={() => triggerCopy(generatedCode, 'schema-code')}
                                        className="absolute right-3 top-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700"
                                    >
                                        {copiedId === 'schema-code' ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                    <pre className="p-4 pt-12 rounded-2xl bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto max-w-full max-h-[420px] leading-relaxed">
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
                        <div className="p-4 sm:p-5 space-y-4">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Column Data Quality, Cardinality &amp; Quantile Profiler
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Completeness, distinct counts, exact BigInt min/max, P25/Median/P75 quantiles, Mean, StdDev, string lengths &amp; Top 5 values.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dataset.columnProfiles.map((prof) => {
                                    const nonNullPct = (100 - prof.nullPercentage).toFixed(1);
                                    const hasQuantiles = prof.p25 !== null || prof.median !== null || prof.p75 !== null;
                                    return (
                                        <div
                                            key={prof.name}
                                            className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/25 p-4 space-y-3"
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
                                                        {nonNullPct}% complete
                                                    </span>
                                                    <span className="block text-[11px] text-slate-400">
                                                        {prof.nullCount} nulls · {prof.distinctCount} distinct
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500"
                                                        style={{
                                                            width: `${Math.min(100, Math.max(0, 100 - prof.nullPercentage))}%`,
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                                                    <span>Distinct: {prof.uniquenessRatio}%</span>
                                                    <span>Non-null: {prof.nonNullCount.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {prof.min !== null && (
                                                <div className="space-y-2 text-[11px] font-mono">
                                                    {hasQuantiles ? (
                                                        <>
                                                            <div className="grid grid-cols-5 gap-1.5">
                                                                {[
                                                                    { k: 'Min', v: String(prof.min) },
                                                                    { k: 'P25', v: String(prof.p25 ?? '—') },
                                                                    { k: 'Median', v: String(prof.median ?? '—'), hi: true },
                                                                    { k: 'P75', v: String(prof.p75 ?? '—') },
                                                                    { k: 'Max', v: String(prof.max) },
                                                                ].map((cell) => (
                                                                    <div
                                                                        key={cell.k}
                                                                        className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800"
                                                                    >
                                                                        <span className="text-slate-400 block text-[10px]">{cell.k}</span>
                                                                        <span
                                                                            className={`font-bold truncate block ${cell.hi
                                                                                    ? 'text-blue-600 dark:text-blue-400'
                                                                                    : 'text-slate-800 dark:text-slate-200'
                                                                                }`}
                                                                            title={cell.v}
                                                                        >
                                                                            {cell.v}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                                                                    <span className="text-slate-400">Mean</span>
                                                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                                                        {prof.mean ?? '—'}
                                                                    </span>
                                                                </div>
                                                                <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                                                                    <span className="text-slate-400">StdDev (σ)</span>
                                                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                                                        {prof.stdDev ?? '—'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                                                                <span className="text-slate-400 block text-[10px]">Min</span>
                                                                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block" title={String(prof.min)}>
                                                                    {String(prof.min)}
                                                                </span>
                                                            </div>
                                                            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                                                                <span className="text-slate-400 block text-[10px]">Max</span>
                                                                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block" title={String(prof.max)}>
                                                                    {String(prof.max)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {prof.minStringLength !== null && (
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-center">
                                                                <span className="text-slate-400 text-[10px] block">Min Len</span>
                                                                <span className="font-bold text-slate-700 dark:text-slate-300">{prof.minStringLength}</span>
                                                            </div>
                                                            <div className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-center">
                                                                <span className="text-slate-400 text-[10px] block">Avg Len</span>
                                                                <span className="font-bold text-slate-700 dark:text-slate-300">{prof.avgStringLength}</span>
                                                            </div>
                                                            <div className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-center">
                                                                <span className="text-slate-400 text-[10px] block">Max Len</span>
                                                                <span className="font-bold text-slate-700 dark:text-slate-300">{prof.maxStringLength}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {prof.topValues.length > 0 && (
                                                <div className="pt-1 space-y-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                                        Top {Math.min(5, prof.topValues.length)} Values
                                                    </span>
                                                    {prof.topValues.slice(0, 5).map((tv, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center justify-between text-xs font-mono bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800"
                                                        >
                                                            <span className="truncate max-w-[200px] text-slate-700 dark:text-slate-300" title={tv.value}>
                                                                {tv.value}
                                                            </span>
                                                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold shrink-0">
                                                                {tv.count} ({tv.percentage}%)
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ============================================================
                        TAB 4: BINARY X-RAY METADATA INSPECTOR
                        ============================================================ */}
                    {activeTab === 'xray' && activeXRayMeta && (
                        <div className="p-4 sm:p-5 space-y-5">
                            {activeXRayMeta.isForensicPartial && (
                                <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                                    <p className="font-bold text-sm flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        Forensic Partial X-Ray Mode
                                    </p>
                                    <p>
                                        Full row decoding could not complete ({activeXRayMeta.forensicError}), but the leading header signature, trailing footer bytes, and container diagnostics are shown below.
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                <div className="min-w-0 lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/25 p-4 space-y-3">
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Binary className="w-4 h-4 text-blue-500 shrink-0" />
                                        Binary Header &amp; Footer Forensics
                                    </h2>
                                    <div className="space-y-2 text-xs font-mono">
                                        <div className="flex justify-between gap-2 py-1.5 border-b border-slate-200/70 dark:border-slate-800">
                                            <span className="text-slate-500">Format Version</span>
                                            <span className="font-semibold text-slate-900 dark:text-white text-right">
                                                {activeXRayMeta.formatVersion}
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-2 py-1.5 border-b border-slate-200/70 dark:border-slate-800">
                                            <span className="text-slate-500">Magic Signature</span>
                                            <span className="font-semibold text-blue-600 dark:text-blue-400 text-right">
                                                {activeXRayMeta.magicBytes} ({activeXRayMeta.headerHex})
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-2 py-1.5 border-b border-slate-200/70 dark:border-slate-800">
                                            <span className="text-slate-500">Created By</span>
                                            <span className="font-semibold text-slate-900 dark:text-white text-right">
                                                {activeXRayMeta.createdBy}
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-2 py-1.5 border-b border-slate-200/70 dark:border-slate-800">
                                            <span className="text-slate-500">Endianness</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {activeXRayMeta.byteOrder}
                                            </span>
                                        </div>
                                        {activeXRayMeta.syncMarkerHex && (
                                            <div className="flex justify-between gap-2 py-1.5 border-b border-slate-200/70 dark:border-slate-800">
                                                <span className="text-slate-500">Avro 16B Sync Marker</span>
                                                <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-right">
                                                    {activeXRayMeta.syncMarkerHex}
                                                </span>
                                            </div>
                                        )}
                                        <div className="pt-1">
                                            <span className="text-slate-500 block mb-1">Footer Trailing Hex</span>
                                            <code className="block p-2.5 rounded-xl bg-slate-950 text-emerald-400 text-[11px] break-all">
                                                {activeXRayMeta.footerHex}
                                            </code>
                                        </div>
                                    </div>
                                </div>

                                <div className="min-w-0 lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/25 p-4 space-y-3">
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <HardDrive className="w-4 h-4 text-blue-500 shrink-0" />
                                        Embedded Key-Value Metadata
                                    </h2>
                                    <div className="space-y-2 max-h-[270px] overflow-y-auto pr-1">
                                        {Object.entries(activeXRayMeta.keyValueMetadata).map(([k, v]) => (
                                            <div
                                                key={k}
                                                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 font-mono text-xs"
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

                            {activeXRayMeta.rowGroups.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {xrayLayoutHeading}
                                        </h2>
                                        {activeXRayMeta.rowGroups[0]?.isSyntheticEstimate && (
                                            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold">
                                                Synthetic In-Memory Partition Estimate
                                            </span>
                                        )}
                                    </div>
                                    {activeXRayMeta.rowGroups.map((rg) => (
                                        <div key={rg.index} className="space-y-2">
                                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono bg-slate-100 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl">
                                                <span className="font-bold text-slate-900 dark:text-white">
                                                    {rg.containerUnitLabel ?? 'Row Group'} #{rg.index} · {rg.rowCount.toLocaleString()} rows
                                                </span>
                                                <span className="text-slate-600 dark:text-slate-300">
                                                    {formatBytes(rg.compressedBytes)} → {formatBytes(rg.totalByteSize)} ({rg.compressionRatio}x)
                                                </span>
                                            </div>
                                            <div className="w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200 dark:border-slate-800">
                                                <table className="min-w-[680px] w-full text-left border-collapse text-xs font-mono">
                                                    <thead>
                                                        <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px]">
                                                            <th className="py-2 px-3">Column</th>
                                                            <th className="py-2 px-3">Codec</th>
                                                            <th className="py-2 px-3">Encodings</th>
                                                            <th className="py-2 px-3">Compressed</th>
                                                            <th className="py-2 px-3">Uncompressed</th>
                                                            <th className="py-2 px-3">Nulls / Distinct</th>
                                                            <th className="py-2 px-3">Min → Max Bounds</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                                        {rg.columns.map((c) => (
                                                            <tr key={c.name}>
                                                                <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                                                                    {c.name}
                                                                </td>
                                                                <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400">
                                                                    {c.codec} ({c.compressionRatio}x)
                                                                </td>
                                                                <td className="py-2 px-3 text-slate-500">{c.encodings.join(', ')}</td>
                                                                <td className="py-2 px-3">{formatBytes(c.compressedSize)}</td>
                                                                <td className="py-2 px-3">{formatBytes(c.uncompressedSize)}</td>
                                                                <td className="py-2 px-3">
                                                                    {c.nullCount} / {c.distinctCount}
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
                            )}
                        </div>
                    )}

                    {/* ============================================================
                        TAB 5: 11-FORMAT EXPORT & CONVERTER STUDIO
                        ============================================================ */}
                    {activeTab === 'export' && dataset && (
                        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                            {/* Left Column: Clean Export Settings */}
                            <div className="min-w-0 lg:col-span-5 space-y-4">
                                {/* 1. Scope */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                                        Rows &amp; Columns to Export
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setExportScope('filtered')}
                                            className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${exportScope === 'filtered'
                                                    ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                                                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                                }`}
                                        >
                                            <span className="block">Filtered View</span>
                                            <span className="text-[11px] font-mono opacity-80">
                                                {queriedResult.matchedCount} rows · {selectedColumns.length} cols
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setExportScope('all')}
                                            className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${exportScope === 'all'
                                                    ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                                                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                                }`}
                                        >
                                            <span className="block">Full Dataset</span>
                                            <span className="text-[11px] font-mono opacity-80">
                                                {dataset.rows.length} rows · {dataset.schema.length} cols
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* 2. Format Picker (8 Tabular & Text Formats) */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                                        Output Format (8 Tabular &amp; Text)
                                    </label>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {[
                                            { id: 'csv' as const, label: 'CSV (.csv)' },
                                            { id: 'xlsx' as const, label: 'Excel (.xlsx)' },
                                            { id: 'json' as const, label: 'JSON (.json)' },
                                            { id: 'jsonl' as const, label: 'JSONL (.jsonl)' },
                                            { id: 'tsv' as const, label: 'TSV (.tsv)' },
                                            { id: 'sql' as const, label: 'SQL INSERT (.sql)' },
                                            { id: 'markdown' as const, label: 'Markdown (.md)' },
                                            { id: 'html' as const, label: 'HTML5 (.html)' },
                                        ].map((fmt) => (
                                            <button
                                                key={fmt.id}
                                                type="button"
                                                onClick={() => setExportFormat(fmt.id)}
                                                className={`px-3 py-2 rounded-xl border text-xs font-semibold text-left transition-all ${exportFormat === fmt.id
                                                        ? 'border-blue-600 bg-blue-600 text-white'
                                                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                                                    }`}
                                            >
                                                {fmt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Format-specific Options */}
                                {(exportFormat === 'csv' || exportFormat === 'xlsx' || exportFormat === 'tsv') && (
                                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2.5 text-xs">
                                        {exportFormat === 'csv' && (
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                                    Delimiter
                                                </span>
                                                <select
                                                    value={csvDelimiter}
                                                    onChange={(e) =>
                                                        setCsvDelimiter(e.target.value as ',' | ';' | '\t' | '|')
                                                    }
                                                    aria-label="CSV delimiter"
                                                    className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                                                >
                                                    <option value=",">Comma (,)</option>
                                                    <option value=";">Semicolon (;)</option>
                                                    <option value="&#9;">Tab (\t)</option>
                                                    <option value="|">Pipe (|)</option>
                                                </select>
                                            </div>
                                        )}

                                        <label className="flex items-start gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={sanitizeFormulas}
                                                onChange={(e) => setSanitizeFormulas(e.target.checked)}
                                                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-slate-700 dark:text-slate-300">
                                                CWE-1236 Formula Injection Guard (neutralize leading =, +, -, @)
                                            </span>
                                        </label>

                                        {exportFormat === 'csv' && (
                                            <label className="flex items-start gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={includeUtf8Bom}
                                                    onChange={(e) => setIncludeUtf8Bom(e.target.checked)}
                                                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-slate-700 dark:text-slate-300">
                                                    Prepend UTF-8 BOM (\uFEFF) for Windows Excel
                                                </span>
                                            </label>
                                        )}
                                    </div>
                                )}

                                {exportFormat === 'json' && (
                                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-xs">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={prettyJson}
                                                onChange={(e) => setPrettyJson(e.target.checked)}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                                                Pretty-print JSON (2-space indent)
                                            </span>
                                        </label>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={handleDownloadExport}
                                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Download .{exportFormat.toUpperCase()}
                                </button>

                                {/* 3. Cross-Format Binary Transcoder */}
                                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                                        Binary Container Transcoder (3 Formats)
                                    </span>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleDownloadBinaryTranscode('parquet')}
                                            className="py-2 px-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 transition-colors"
                                        >
                                            → .parquet
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDownloadBinaryTranscode('avro')}
                                            className="py-2 px-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 transition-colors"
                                        >
                                            → .avro
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDownloadBinaryTranscode('feather')}
                                            title="Standard Apache Arrow IPC / Feather V2 (ARROW1 FlatBuffers)"
                                            className="py-2 px-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 transition-colors"
                                        >
                                            → .feather
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Writes spec-compliant <span className="font-mono">PAR1</span> Snappy, <span className="font-mono">Obj\x01</span> Snappy+CRC32, or <span className="font-mono">ARROW1</span> IPC binary files.
                                    </p>
                                </div>
                            </div>

                            {/* Right Column: Top-Aligned Live Output Preview */}
                            <div className="min-w-0 lg:col-span-7 space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Live {exportFormat.toUpperCase()} Preview (first 100 rows)
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Exact 64-bit INT64 values &amp; nested structs preserved
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => triggerCopy(exportPreviewText, 'export-preview')}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shrink-0 transition-colors"
                                    >
                                        {copiedId === 'export-preview' ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>

                                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 text-xs font-mono overflow-auto max-w-full max-h-[460px] leading-relaxed">
                                    {exportPreviewText}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
