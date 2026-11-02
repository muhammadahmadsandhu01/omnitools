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

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Header & Hero Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <Database className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Parquet, Avro & Feather Studio
                            </h2>
                            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Zero server uploads. Inspect Apache Parquet (`PAR1`), Avro (`Obj\x01`), and Arrow Feather (`ARROW1`) directly in memory.
                        </p>
                    </div>

                    {/* Quick Sample Loaders */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Try Samples:</span>
                        <button
                            type="button"
                            onClick={() => handleLoadSample('ecommerce_parquet')}
                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        >
                            📦 Parquet Lakehouse
                        </button>
                        <button
                            type="button"
                            onClick={() => handleLoadSample('iot_avro')}
                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        >
                            ⚡ Avro Stream
                        </button>
                        <button
                            type="button"
                            onClick={() => handleLoadSample('ml_feather')}
                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        >
                            🧠 Feather IPC
                        </button>
                    </div>
                </div>

                {/* Upload Drag & Drop Area */}
                <div className="mt-5">
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
                        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl p-6 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-900/50 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 group"
                    >
                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-105 transition">
                                <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                Click to select or drop a <span className="font-semibold text-indigo-600 dark:text-indigo-400">.parquet</span>, <span className="font-semibold text-indigo-600 dark:text-indigo-400">.avro</span>, or <span className="font-semibold text-indigo-600 dark:text-indigo-400">.feather</span> file
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isLoading ? 'Parsing binary columnar payload in local memory...' : 'Also accepts JSON Lines (.jsonl) and CSV files for instant binary conversion.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Bar */}
                {fileData && parseResult && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2">
                        <div className="flex items-center gap-3">
                            <span className="font-medium text-slate-900 dark:text-slate-200">
                                📄 {fileData.name}
                            </span>
                            <span>•</span>
                            <span className="uppercase font-semibold text-indigo-600 dark:text-indigo-400">
                                {parseResult.format} ({parseResult.metadata.magicBytes})
                            </span>
                            <span>•</span>
                            <span>{(fileData.size / 1024).toFixed(1)} KB</span>
                            <span>•</span>
                            <span>{parseResult.metadata.totalRows.toLocaleString()} rows</span>
                            <span>•</span>
                            <span>{parseResult.schema.length} columns</span>
                        </div>
                        <div className="text-slate-400">
                            Parsed in {parseResult.metadata.parseTimeMs.toFixed(1)}ms
                        </div>
                    </div>
                )}

                {errorMsg && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {errorMsg}
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            {parseResult && (
                <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto">
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
                                className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                                    active
                                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Tab 1: Data Explorer Grid */}
            {parseResult && activeTab === 'explorer' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                    {/* Controls Row */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Global search across all columns..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={addFilter}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
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
                                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                                <option value={10}>10 rows</option>
                                <option value={25}>25 rows</option>
                                <option value={50}>50 rows</option>
                                <option value={100}>100 rows</option>
                            </select>
                        </div>
                    </div>

                    {/* Filter Builder List */}
                    {filters.length > 0 && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <span>Active Predicate Filters (AND):</span>
                                <button
                                    type="button"
                                    onClick={() => setFilters([])}
                                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    Clear All
                                </button>
                            </div>
                            {filters.map((f, idx) => (
                                <div key={idx} className="flex flex-wrap items-center gap-2">
                                    <select
                                        value={f.column}
                                        onChange={(e) => updateFilter(idx, { column: e.target.value })}
                                        className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
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
                                        className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
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
                                            className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                        />
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => removeFilter(idx)}
                                        className="p-1 text-slate-400 hover:text-red-500 rounded"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Table Grid */}
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
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
                    <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 pt-2">
                        <div>
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

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 font-medium">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 2: Schema & DDL Generator */}
            {parseResult && activeTab === 'schema' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target:</span>
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
                                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                                        selectedTargetLang === key
                                            ? 'bg-indigo-600 text-white'
                                            : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Table name"
                                value={ddlTableName}
                                onChange={(e) => setDdlTableName(e.target.value)}
                                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                            />
                            <button
                                type="button"
                                onClick={handleCopyDdl}
                                className="px-3 py-1 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 hover:bg-indigo-100 transition"
                            >
                                {ddlCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                {ddlCopied ? 'Copied!' : 'Copy Code'}
                            </button>
                        </div>
                    </div>

                    <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto max-h-[500px] border border-slate-800">
                        <code>{generatedDdl}</code>
                    </pre>
                </div>
            )}

            {/* Tab 3: Column Profiler & Stats */}
            {parseResult && activeTab === 'profiler' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Column Distribution & Mathematical Profiling ({parseResult.columnProfiles.length} columns)
                    </h3>

                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
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
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-6">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Binary Container Low-Level Metadata & Layout
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="text-[11px] text-slate-400">Container Format</span>
                            <div className="text-base font-bold text-slate-900 dark:text-white uppercase mt-0.5">
                                {parseResult.format}
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="text-[11px] text-slate-400">Magic Bytes</span>
                            <div className="text-base font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                                {parseResult.metadata.magicBytes}
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="text-[11px] text-slate-400">Compression Codec</span>
                            <div className="text-base font-bold text-slate-900 dark:text-white uppercase mt-0.5">
                                {parseResult.metadata.compressionCodec}
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="text-[11px] text-slate-400">Compression Ratio</span>
                            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
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
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
                                {Object.entries(parseResult.metadata.keyValueMetadata).map(([k, v]) => (
                                    <div key={k} className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{k}</span>
                                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-lg">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tab 5: Export & Converter Studio */}
            {parseResult && activeTab === 'export' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Cross-Format Export & Enterprise Conversion Studio
                    </h3>

                    {/* Format Selector */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Format:</span>
                        {(['csv', 'tsv', 'json', 'jsonl', 'sql', 'markdown', 'html'] as ExportFormat[]).map((fmt) => (
                            <button
                                key={fmt}
                                type="button"
                                onClick={() => setExportFormat(fmt)}
                                className={`px-3 py-1.5 text-xs rounded-lg font-medium uppercase transition ${
                                    exportFormat === fmt
                                        ? 'bg-indigo-600 text-white'
                                        : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                {fmt}
                            </button>
                        ))}
                    </div>

                    {/* Options Row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                            <input
                                type="radio"
                                name="scope"
                                checked={exportScope === 'filtered'}
                                onChange={() => setExportScope('filtered')}
                            />
                            Filtered Query Subset ({queryResult.matchedCount} rows)
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                            <input
                                type="radio"
                                name="scope"
                                checked={exportScope === 'all'}
                                onChange={() => setExportScope('all')}
                            />
                            Full Dataset ({parseResult.metadata.totalRows} rows)
                        </label>

                        {exportFormat === 'json' && (
                            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={prettyJson}
                                    onChange={(e) => setPrettyJson(e.target.checked)}
                                />
                                Pretty Print (2-space indent)
                            </label>
                        )}

                        {exportFormat === 'csv' && (
                            <>
                                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={includeBom}
                                        onChange={(e) => setIncludeBom(e.target.checked)}
                                    />
                                    Include UTF-8 BOM (Excel compatibility)
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={sanitizeFormulas}
                                        onChange={(e) => setSanitizeFormulas(e.target.checked)}
                                    />
                                    CWE-1236 Formula Sanitization
                                </label>
                                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                    <span>Delimiter:</span>
                                    <select
                                        value={exportDelimiter}
                                        onChange={(e) => setExportDelimiter(e.target.value as ',' | ';' | '\t' | '|')}
                                        className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    >
                                        <option value=",">, (Comma)</option>
                                        <option value=";">; (Semicolon)</option>
                                        <option value={'\t'}>Tab</option>
                                        <option value="|">| (Pipe)</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleDownloadExport}
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-sm"
                        >
                            <Download className="w-4 h-4" /> Download {exportFormat.toUpperCase()} File
                        </button>
                        <button
                            type="button"
                            onClick={handleCopyExport}
                            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
                        >
                            {exportCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            {exportCopied ? 'Copied!' : 'Copy to Clipboard'}
                        </button>
                    </div>

                    {/* Text Preview */}
                    <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto max-h-[350px] border border-slate-800">
                        <code>{exportedText.slice(0, 5000)}</code>
                    </pre>
                </div>
            )}

            {/* Cell Inspection Popover / Modal */}
            {inspectedCell && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 max-w-xl w-full shadow-xl space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                Cell Value Inspector: {inspectedCell.col}
                            </h4>
                            <button
                                type="button"
                                onClick={() => setInspectedCell(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto max-h-[300px]">
                            {JSON.stringify(inspectedCell.val, null, 2)}
                        </pre>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setInspectedCell(null)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
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
