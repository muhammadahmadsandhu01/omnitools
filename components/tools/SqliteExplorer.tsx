"use client";

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
    Database,
    ShieldAlert,
    Upload,
    Download,
    Search,
    AlertTriangle,
    CheckCircle2,
    Code2,
    FileSpreadsheet,
    FileCode,
    Layers,
    Terminal,
    Cpu,
    Play,
    Copy,
    Check,
    Plus,
    Trash2,
    Info,
    Wrench,
    KeyRound,
    HardDrive,
    GitCompare,
    Lock,
    Table as TableIcon,
    Sparkles,
    X,
} from 'lucide-react';

import {
    SQLITE_EXPLORER_ENGINE_VERSION,
    decodeForensicTimestamp,
    parseSqliteOrDuckDbFile,
    parseSqliteWalBytes,
    exportBinarySqliteDatabase,
    syncWorkspaceBinaryTelemetry,
    executeSqlQuery,
    autoOptimizeDatabaseWorkspace,
    anonymizeDatabasePii,
    compareSqliteDatabases,
    compileAllDatabaseDeliverables,
    exportDatabaseCsv,
    exportDatabaseXlsx,
    generateSampleDatabase,
    type SqliteCellValue,
    type SqliteTableRecord,
    type SqliteWorkspaceState,
    type DatabaseDiffReport,
} from '@/lib/sqliteExplorerEngine';

type SqliteWorkbenchTab =
    | 'sql_runner'
    | 'erd_schema'
    | 'linter_profiler'
    | 'binary_forensics'
    | 'export_diff';

const SAMPLE_DATABASES: {
    id: 'saas_ecommerce' | 'finledger_forensic_demo' | 'browser_mobile_artifacts';
    shortTitle: string;
    subtitle: string;
}[] = [
        {
            id: 'saas_ecommerce',
            shortTitle: 'SaaS Prod',
            subtitle: '3 relational tables (organizations, users, orders), 12 rows, 2 unindexed FKs (76/100 → 100/100 via Auto-Optimize).',
        },
        {
            id: 'finledger_forensic_demo',
            shortTitle: 'Forensic DB',
            subtitle: 'Contains 2 deleted offshore wire rows in freelist space, orphaned FK row & live PII to test 1-Click Fix.',
        },
        {
            id: 'browser_mobile_artifacts',
            shortTitle: 'Chrome / iOS',
            subtitle: 'WebKit 1601 microsecond timestamps & Apple CoreData 2001 nanosecond timestamps.',
        },
    ];

const PRESET_SQL_QUERIES: { label: string; sql: string; description: string }[] = [
    {
        label: 'JOIN & Spend',
        sql: 'SELECT u.id, u.full_name, u.plan_tier, COUNT(o.id) AS total_orders, SUM(o.amount_usd) AS lifetime_spend_usd FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id ORDER BY lifetime_spend_usd DESC;',
        description: 'Joins users and orders with GROUP BY aggregation',
    },
    {
        label: 'SUMMARIZE',
        sql: 'SUMMARIZE orders;',
        description: 'Runs DuckDB columnar statistical profiler on orders',
    },
    {
        label: 'EXCLUDE col',
        sql: "SELECT * EXCLUDE (metadata_json) FROM orders WHERE status = 'PAID' ORDER BY amount_usd DESC;",
        description: 'Uses DuckDB EXCLUDE projection to omit bulky JSON column',
    },
    {
        label: 'EXPLAIN PLAN',
        sql: 'EXPLAIN QUERY PLAN SELECT * FROM orders WHERE user_id = 101;',
        description: 'Verifies whether WHERE filter uses B-tree index or full table scan',
    },
    {
        label: 'FK Check',
        sql: 'PRAGMA foreign_key_check;',
        description: 'Audits all child rows for orphaned foreign-key references',
    },
    {
        label: 'Table Info',
        sql: 'PRAGMA table_info(users);',
        description: 'Inspects SQLite column affinities, NOT NULL, and PK flags',
    },
];

export default function SqliteExplorer() {
    const [activeSampleId, setActiveSampleId] = useState<
        'saas_ecommerce' | 'finledger_forensic_demo' | 'browser_mobile_artifacts' | null
    >(null);

    const [workspace, setWorkspace] = useState<SqliteWorkspaceState | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const [activeTab, setActiveTab] = useState<SqliteWorkbenchTab>('sql_runner');
    const [showSqlEditor, setShowSqlEditor] = useState<boolean>(false);
    const [showSpecs, setShowSpecs] = useState<boolean>(false);
    const [showAddRowDrawer, setShowAddRowDrawer] = useState<boolean>(false);
    const [showNewTableDrawer, setShowNewTableDrawer] = useState<boolean>(false);
    const [statusBanner, setStatusBanner] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Tab 1: Grid & SQL state
    const [rowSearchFilter, setRowSearchFilter] = useState<string>('');
    const [gridSortColumn, setGridSortColumn] = useState<string | null>(null);
    const [gridSortDirection, setGridSortDirection] = useState<'asc' | 'desc'>('asc');
    const [newRowInputs, setNewRowInputs] = useState<Record<string, string>>({});
    const [recentlyAddedRowIndex, setRecentlyAddedRowIndex] = useState<number | null>(null);
    const [rowActionNotice, setRowActionNotice] = useState<string | null>(null);
    const [newTableNameInput, setNewTableNameInput] = useState<string>('');
    const [tableActionNotice, setTableActionNotice] = useState<string | null>(null);

    // Tab 2: Schema & ORM
    const [schemaCodeFormat, setSchemaCodeFormat] = useState<
        'drizzle_ts' | 'prisma' | 'postgres_sql' | 'sqlite_sql' | 'mermaid_erd' | 'dbml'
    >('drizzle_ts');
    const [copiedTab2Schema, setCopiedTab2Schema] = useState<boolean>(false);

    // Tab 3: Linter & Profiler
    const [linterActionNotice, setLinterActionNotice] = useState<string | null>(null);
    const [profilerTableFilter, setProfilerTableFilter] = useState<string>('ALL');

    // Tab 4: Forensics & PII
    const [forensicActionNotice, setForensicActionNotice] = useState<string | null>(null);

    // Tab 5: Export & Diff
    const [exportFormat, setExportFormat] = useState<
        | 'sqlite_sql'
        | 'postgres_sql'
        | 'duckdb_sql'
        | 'drizzle_ts'
        | 'prisma'
        | 'mermaid_erd'
        | 'dbml'
        | 'certificate_json'
    >('drizzle_ts');
    const [copiedExport, setCopiedExport] = useState<boolean>(false);
    const [diffReport, setDiffReport] = useState<DatabaseDiffReport | null>(null);
    const [diffNotice, setDiffNotice] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const walInputRef = useRef<HTMLInputElement | null>(null);
    const diffInputRef = useRef<HTMLInputElement | null>(null);

    const compiled = useMemo(
        () => (workspace ? compileAllDatabaseDeliverables(workspace) : null),
        [workspace]
    );

    const [manualQueryResult, setManualQueryResult] = useState<ReturnType<typeof executeSqlQuery>['result'] | null>(
        null
    );

    const liveQueryExecution = useMemo(() => {
        if (!workspace) {
            return {
                columns: [] as string[],
                rows: [] as Record<string, SqliteCellValue>[],
                executionTimeMs: 0,
                rowsAffected: 0,
                isMutation: false,
                explainPlan: [] as string[],
                scanStrategy: 'IDLE',
                error: null as string | null,
            };
        }
        if (manualQueryResult) return manualQueryResult;
        return executeSqlQuery(workspace, workspace.activeSqlQuery).result;
    }, [workspace, manualQueryResult]);

    const activeTableObj = useMemo(
        () =>
            workspace
                ? workspace.tables.find((t) => t.name === workspace.activeTableName) ||
                workspace.tables[0] ||
                null
                : null,
        [workspace]
    );

    const gridColumns = useMemo(() => {
        if (!liveQueryExecution.error && liveQueryExecution.columns.length > 0) {
            return liveQueryExecution.columns;
        }
        return activeTableObj ? activeTableObj.columns.map((c) => c.name) : [];
    }, [liveQueryExecution, activeTableObj]);

    const filteredDisplayRows = useMemo(() => {
        const sourceRows = liveQueryExecution.error ? activeTableObj?.rows || [] : liveQueryExecution.rows;
        let rows = sourceRows;
        if (rowSearchFilter.trim()) {
            const q = rowSearchFilter.toLowerCase();
            rows = rows.filter((r) =>
                Object.values(r).some((v) => v !== null && String(v).toLowerCase().includes(q))
            );
        }
        if (gridSortColumn) {
            rows = [...rows].sort((a, b) => {
                const va = a[gridSortColumn];
                const vb = b[gridSortColumn];
                if (va === vb) return 0;
                if (va === null || va === undefined) return 1;
                if (vb === null || vb === undefined) return -1;
                if (typeof va === 'number' && typeof vb === 'number') {
                    return gridSortDirection === 'asc' ? va - vb : vb - va;
                }
                return gridSortDirection === 'asc'
                    ? String(va).localeCompare(String(vb))
                    : String(vb).localeCompare(String(va));
            });
        }
        return rows;
    }, [liveQueryExecution, activeTableObj, rowSearchFilter, gridSortColumn, gridSortDirection]);

    const totalRowCount = useMemo(
        () => (workspace ? workspace.tables.reduce((acc, t) => acc + t.rows.length, 0) : 0),
        [workspace]
    );

    const handleSelectSample = (
        sampleId: 'saas_ecommerce' | 'finledger_forensic_demo' | 'browser_mobile_artifacts'
    ) => {
        setErrorMessage(null);
        setManualQueryResult(null);
        setRowActionNotice(null);
        setLinterActionNotice(null);
        setForensicActionNotice(null);
        const nextWs = generateSampleDatabase(sampleId);
        setActiveSampleId(sampleId);
        setWorkspace(nextWs);
        setStatusBanner(null);
    };

    const processUploadedFile = async (file: File) => {
        setErrorMessage(null);
        setManualQueryResult(null);
        try {
            const buf = await file.arrayBuffer();
            const bytes = new Uint8Array(buf);
            const lowerName = file.name.toLowerCase();

            if (lowerName.endsWith('-wal') || lowerName.endsWith('.wal')) {
                if (!workspace) {
                    setErrorMessage('Please open the main .sqlite or .db file first before attaching a companion .db-wal file.');
                    return;
                }
                const walInfo = parseSqliteWalBytes(bytes, file.name);
                setWorkspace((prev) => (prev ? { ...prev, walSummary: walInfo } : prev));
                setActiveTab('binary_forensics');
                setForensicActionNotice(
                    `Loaded WAL "${file.name}" (${walInfo.totalFrames} frame(s), checkpoint #${walInfo.checkpointSequence}).`
                );
            } else {
                const parsedWs = parseSqliteOrDuckDbFile(bytes, file.name);
                setActiveSampleId(null);
                setWorkspace(parsedWs);
                setActiveTab('sql_runner');
                setStatusBanner(`Opened "${file.name}" (${parsedWs.tables.length} tables).`);
            }
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : 'Unable to parse uploaded database file.');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await processUploadedFile(file);
        e.target.value = '';
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            await processUploadedFile(file);
        }
    };

    const handleRunSql = (customSql?: string) => {
        if (!workspace) return;
        setErrorMessage(null);
        const sqlToRun = (customSql ?? workspace.activeSqlQuery).trim();
        if (!sqlToRun) return;
        const { result, updatedWorkspace } = executeSqlQuery(workspace, sqlToRun);
        if (result.isMutation && !result.error) {
            setWorkspace(
                syncWorkspaceBinaryTelemetry({
                    ...updatedWorkspace,
                    activeSqlQuery: sqlToRun,
                })
            );
            setManualQueryResult(result);
            setRowActionNotice(`Executed SQL (${result.rowsAffected} row(s) affected) in ${result.executionTimeMs} ms.`);
        } else {
            if (customSql) {
                setWorkspace((prev) => (prev ? { ...prev, activeSqlQuery: customSql } : prev));
            }
            setManualQueryResult(result);
        }
    };

    const handleAddRowToActiveTable = () => {
        if (!workspace || !activeTableObj) return;
        setErrorMessage(null);
        const newRow: Record<string, SqliteCellValue> = {};

        activeTableObj.columns.forEach((col, cIdx) => {
            const rawInput = (newRowInputs[col.name] ?? '').trim();
            if (rawInput !== '') {
                if (/^NULL$/i.test(rawInput)) {
                    newRow[col.name] = null;
                } else if (
                    (col.affinity === 'INTEGER' || col.affinity === 'REAL' || col.affinity === 'NUMERIC') &&
                    /^-?\d+(?:\.\d+)?$/.test(rawInput)
                ) {
                    newRow[col.name] = Number(rawInput);
                } else {
                    newRow[col.name] = rawInput;
                }
            } else {
                if (col.isPrimaryKey && col.affinity === 'INTEGER') {
                    const maxId = activeTableObj.rows.reduce(
                        (max, r) => Math.max(max, Number(r[col.name]) || 0),
                        0
                    );
                    newRow[col.name] = maxId + 1;
                } else if (col.affinity === 'INTEGER') {
                    newRow[col.name] = cIdx === 1 ? 1 : 100;
                } else if (col.affinity === 'REAL' || col.affinity === 'NUMERIC') {
                    newRow[col.name] = 250.0;
                } else if (/created|date|time/i.test(col.name)) {
                    newRow[col.name] = new Date().toISOString();
                } else if (/json/i.test(col.name)) {
                    newRow[col.name] = '{"source":"manual_insert"}';
                } else {
                    newRow[col.name] = `New_${col.name}_${activeTableObj.rows.length + 1}`;
                }
            }
        });

        const nextTables = workspace.tables.map((t) =>
            t.name === activeTableObj.name ? { ...t, rows: [newRow, ...t.rows] } : t
        );
        const nextSelectSql = `SELECT * FROM ${activeTableObj.name} LIMIT 50;`;
        setWorkspace((prev) =>
            prev
                ? syncWorkspaceBinaryTelemetry({
                    ...prev,
                    tables: nextTables,
                    activeSqlQuery: nextSelectSql,
                })
                : prev
        );
        setManualQueryResult(null);
        setNewRowInputs({});
        setRecentlyAddedRowIndex(0);
        setShowAddRowDrawer(false);

        const pkCol = activeTableObj.columns.find((c) => c.isPrimaryKey)?.name || activeTableObj.columns[0]?.name;
        setRowActionNotice(`Inserted row (${pkCol}=${newRow[pkCol]}) into "${activeTableObj.name}".`);
    };

    const handleCreateQuickTable = () => {
        if (!workspace) return;
        const cleanName =
            newTableNameInput
                .trim()
                .replace(/[^A-Za-z0-9_]/g, '_')
                .replace(/^(\d)/, 't_$1') || `custom_table_${workspace.tables.length + 1}`;

        if (workspace.tables.some((t) => t.name.toLowerCase() === cleanName.toLowerCase())) {
            setTableActionNotice(`Table "${cleanName}" already exists.`);
            return;
        }

        const newTbl: SqliteTableRecord = {
            name: cleanName,
            type: 'table',
            rootPage: workspace.tables.length + 2,
            createSql: `CREATE TABLE "${cleanName}" ("id" INTEGER PRIMARY KEY, "name" TEXT NOT NULL, "value" REAL NOT NULL, "created_at" TEXT NOT NULL)`,
            withoutRowId: false,
            strictMode: true,
            columns: [
                { name: 'id', rawType: 'INTEGER', affinity: 'INTEGER', notNull: true, isPrimaryKey: true, isAutoIncrement: true, isUnique: true, defaultValue: null },
                { name: 'name', rawType: 'TEXT', affinity: 'TEXT', notNull: true, isPrimaryKey: false, isAutoIncrement: false, isUnique: false, defaultValue: null },
                { name: 'value', rawType: 'REAL', affinity: 'REAL', notNull: true, isPrimaryKey: false, isAutoIncrement: false, isUnique: false, defaultValue: null },
                { name: 'created_at', rawType: 'TEXT', affinity: 'TIMESTAMP', notNull: true, isPrimaryKey: false, isAutoIncrement: false, isUnique: false, defaultValue: null },
            ],
            foreignKeys: [],
            indexes: [],
            rows: [
                { id: 1, name: `${cleanName}_item_1`, value: 100.0, created_at: new Date().toISOString() },
            ],
        };

        const nextSql = `SELECT * FROM ${cleanName} LIMIT 50;`;
        setWorkspace((prev) =>
            prev
                ? syncWorkspaceBinaryTelemetry({
                    ...prev,
                    tables: [...prev.tables, newTbl],
                    activeTableName: cleanName,
                    activeSqlQuery: nextSql,
                })
                : prev
        );
        setManualQueryResult(null);
        setNewTableNameInput('');
        setShowNewTableDrawer(false);
        setTableActionNotice(`Created "${cleanName}".`);
    };

    const triggerDownload = (content: Uint8Array | string, fileName: string, mimeType: string) => {
        const blob =
            typeof content === 'string'
                ? new Blob([content], { type: mimeType })
                : new Blob([content as unknown as BlobPart], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const activeSchemaCodeText = useMemo(() => {
        if (!compiled) return '';
        if (schemaCodeFormat === 'drizzle_ts') return compiled.drizzleOrmSchemaTs;
        if (schemaCodeFormat === 'prisma') return compiled.prismaSchema;
        if (schemaCodeFormat === 'postgres_sql') return compiled.postgresMigrationSql;
        if (schemaCodeFormat === 'mermaid_erd') return compiled.mermaidErDiagram;
        if (schemaCodeFormat === 'dbml') return compiled.dbmlSchema;
        return compiled.sqliteSqlDump;
    }, [schemaCodeFormat, compiled]);

    const activeExportText = useMemo(() => {
        if (!compiled) return '';
        if (exportFormat === 'sqlite_sql') return compiled.sqliteSqlDump;
        if (exportFormat === 'postgres_sql') return compiled.postgresMigrationSql;
        if (exportFormat === 'duckdb_sql') return compiled.duckdbAnalyticalSql;
        if (exportFormat === 'drizzle_ts') return compiled.drizzleOrmSchemaTs;
        if (exportFormat === 'prisma') return compiled.prismaSchema;
        if (exportFormat === 'mermaid_erd') return compiled.mermaidErDiagram;
        if (exportFormat === 'dbml') return compiled.dbmlSchema;
        return compiled.auditCertificateJson;
    }, [exportFormat, compiled]);

    return (
        <div className="w-full min-w-0 max-w-full overflow-x-hidden text-slate-900 dark:text-slate-100">
            <input
                ref={fileInputRef}
                type="file"
                accept=".sqlite,.db,.sqlite3,.db3,.db-wal,.wal,.duckdb,.sql,.csv,.tsv,.json,.jsonl"
                onChange={handleFileUpload}
                className="hidden"
            />

            {/* ============================================================================
                STATE 1: CLEAN IMPORT WORKSPACE + OPTIONAL SAMPLE FILES SECTION (NO AUTO-LOAD)
                ============================================================================ */}
            {(!workspace || !compiled) ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            void handleDrop(e);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        aria-label="Open a SQLite, DB, DuckDB, SQL, or CSV file"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                fileInputRef.current?.click();
                            }
                        }}
                        className={`p-8 sm:p-12 text-center cursor-pointer transition-colors ${isDragging
                                ? 'bg-indigo-50/70 dark:bg-indigo-950/30'
                                : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/30'
                            }`}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
                            <Database className="w-6 h-6" />
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            Drop your SQLite or DuckDB file here — or click to browse
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-lg mx-auto">
                            Supports <span className="font-mono">.sqlite</span>, <span className="font-mono">.db</span>,{' '}
                            <span className="font-mono">.sqlite3</span>, <span className="font-mono">.duckdb</span>,{' '}
                            <span className="font-mono">.sql</span>, and <span className="font-mono">.csv</span>. Processed locally in your browser with zero server upload.
                        </p>
                        <div className="mt-5">
                            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-xs transition">
                                <Upload className="w-4 h-4" />
                                <span>Import Your File</span>
                            </span>
                        </div>
                    </div>

                    {errorMessage && (
                        <div role="alert" className="mx-6 mb-4 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2.5 flex items-center justify-between gap-2 text-rose-800 dark:text-rose-200 text-xs">
                            <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />{errorMessage}</span>
                            <button type="button" onClick={() => setErrorMessage(null)}><X className="w-3.5 h-3.5" /></button>
                        </div>
                    )}

                    {/* Clearly Labeled Optional Sample Files Section */}
                    <div className="px-6 py-5 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span>Sample Files (Optional — For Testing Only)</span>
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                Click any sample below to try the tool, or import your own file above
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                            {SAMPLE_DATABASES.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => handleSelectSample(s.id)}
                                    className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 transition cursor-pointer space-y-1"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">{s.shortTitle}</span>
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">
                                            Sample
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                                        {s.subtitle}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* ============================================================================
                   STATE 2: MINIMAL TABLEPLUS / FLUENTDB-STYLE UNIFIED WORKSPACE
                   ============================================================================ */
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                    {/* 1. Clean Top Header Bar */}
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                            <div className="inline-flex items-center gap-2 min-w-0">
                                <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[220px]" title={workspace.fileName}>
                                    {workspace.fileName}
                                </span>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                {workspace.tables.length} tables · {totalRowCount} rows · {(workspace.fileByteSize / 1024).toFixed(1)} KB
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {/* Clearly Labeled Sample Files Switcher */}
                            <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 pl-2 text-[11px]">
                                <span className="text-[10px] font-semibold text-slate-400 mr-0.5">Sample Files:</span>
                                {SAMPLE_DATABASES.map((s) => {
                                    const active = activeSampleId === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            title={s.subtitle}
                                            onClick={() => handleSelectSample(s.id)}
                                            className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${active
                                                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                        >
                                            {s.shortTitle}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Open File</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    const bin = exportBinarySqliteDatabase(workspace);
                                    triggerDownload(bin, workspace.fileName.replace(/\.[a-z0-9]+$/i, '') + '.sqlite', 'application/x-sqlite3');
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Save .sqlite</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowSpecs((v) => !v)}
                                aria-expanded={showSpecs}
                                title="Supported formats, memory limits & privacy"
                                className={`p-1.5 rounded-xl border transition cursor-pointer ${showSpecs
                                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                            >
                                <Info className="w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setWorkspace(null);
                                    setActiveSampleId(null);
                                    setManualQueryResult(null);
                                    setStatusBanner(null);
                                    setErrorMessage(null);
                                    setDiffReport(null);
                                }}
                                title="Close file and return to import screen"
                                aria-label="Close active database"
                                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:border-rose-400 hover:text-rose-600 transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Collapsible Info Drawer */}
                    {showSpecs && (
                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                            <p>
                                <strong>Supported (v{SQLITE_EXPLORER_ENGINE_VERSION}):</strong> <code>.sqlite</code>, <code>.db</code>, <code>.sqlite3</code>, <code>.db-wal</code>, <code>.duckdb</code>, <code>.sql</code>, and <code>.csv</code>. For <code>.parquet</code>, <code>.avro</code>, or <code>.feather</code>, use our{' '}
                                <Link href="/developer/parquet-viewer" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                                    Parquet Viewer →
                                </Link>
                            </p>
                            <p>
                                <strong>Local Privacy &amp; Limits:</strong> Processed locally in browser RAM via zero-CDN TypeScript B-tree parsing (smooth up to ~100–250 MB; site analytics may still load). SQLCipher encrypted files are not supported.
                            </p>
                        </div>
                    )}

                    {errorMessage && (
                        <div role="alert" className="mx-4 mt-3 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 flex items-center justify-between gap-2 text-rose-800 dark:text-rose-200 text-xs">
                            <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />{errorMessage}</span>
                            <button type="button" onClick={() => setErrorMessage(null)}><X className="w-3.5 h-3.5" /></button>
                        </div>
                    )}

                    {statusBanner && (
                        <div role="status" className="mx-4 mt-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 flex items-center justify-between gap-2 text-emerald-800 dark:text-emerald-200 text-xs">
                            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" />{statusBanner}</span>
                            <button type="button" onClick={() => setStatusBanner(null)}><X className="w-3.5 h-3.5" /></button>
                        </div>
                    )}

                    {/* 2. Clean 5-Tab Navigation Bar */}
                    <div
                        role="tablist"
                        aria-label="SQLite workspace tabs"
                        className="px-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-900"
                    >
                        <div className="flex flex-wrap items-center gap-1">
                            {[
                                { id: 'sql_runner' as const, label: 'Data & SQL', icon: TableIcon },
                                { id: 'erd_schema' as const, label: 'ERD & ORM', icon: Layers },
                                { id: 'linter_profiler' as const, label: 'Linter & Stats', icon: ShieldAlert },
                                { id: 'binary_forensics' as const, label: 'Forensics & PII', icon: HardDrive },
                                { id: 'export_diff' as const, label: 'Export & Diff', icon: Code2 },
                            ].map((tab) => {
                                const Icon = tab.icon;
                                const active = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer -mb-px ${active
                                                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
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
                            onClick={() => setActiveTab('linter_profiler')}
                            className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md cursor-pointer ${compiled.healthScore >= 85
                                    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60'
                                    : 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/60'
                                }`}
                        >
                            Health {compiled.healthScore}/100
                        </button>
                    </div>

                    {/* ============================================================================
                    TAB 1: DATA & SQL (CLEAN TABLE VIEW FIRST; SQL EDITOR ON 1-CLICK TOGGLE)
                    ============================================================================ */}
                    {activeTab === 'sql_runner' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
                            {/* Minimal Left Table Sidebar */}
                            <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 p-3.5 space-y-2.5 bg-slate-50/40 dark:bg-slate-950/30">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Tables ({workspace.tables.length})
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewTableDrawer((v) => !v)}
                                        title="Create new table"
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                    >
                                        <Plus className="w-3 h-3" />
                                        New
                                    </button>
                                </div>

                                {showNewTableDrawer && (
                                    <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-2">
                                        <input
                                            type="text"
                                            value={newTableNameInput}
                                            onChange={(e) => setNewTableNameInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleCreateQuickTable();
                                                }
                                            }}
                                            placeholder="Table name (e.g. api_keys)"
                                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCreateQuickTable}
                                            className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer"
                                        >
                                            Create Table
                                        </button>
                                    </div>
                                )}

                                {tableActionNotice && (
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">✓ {tableActionNotice}</p>
                                )}

                                <div className="space-y-1">
                                    {workspace.tables.map((tbl) => {
                                        const active = workspace.activeTableName === tbl.name;
                                        return (
                                            <button
                                                key={tbl.name}
                                                type="button"
                                                onClick={() => {
                                                    const sql = `SELECT * FROM ${tbl.name} LIMIT 50;`;
                                                    setWorkspace((p) => (p ? {
                                                        ...p,
                                                        activeTableName: tbl.name,
                                                        activeSqlQuery: sql,
                                                    } : p));
                                                    setManualQueryResult(null);
                                                }}
                                                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-xs transition cursor-pointer ${active
                                                        ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                <span className="font-mono truncate">{tbl.name}</span>
                                                <span className={`font-mono text-[10px] shrink-0 ${active ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                    {tbl.rows.length}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </aside>

                            {/* Main Clean Data Grid Area */}
                            <div className="min-w-0 lg:col-span-9 p-4 space-y-3.5">
                                {/* Single Clean Action Bar */}
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="relative flex-1 min-w-[180px] max-w-xs">
                                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={rowSearchFilter}
                                            onChange={(e) => setRowSearchFilter(e.target.value)}
                                            placeholder="Filter rows..."
                                            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setShowSqlEditor((v) => !v)}
                                            aria-expanded={showSqlEditor}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${showSqlEditor
                                                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400'
                                                }`}
                                        >
                                            <Terminal className="w-3.5 h-3.5" />
                                            <span>SQL Query</span>
                                        </button>

                                        {activeTableObj && (
                                            <button
                                                type="button"
                                                onClick={() => setShowAddRowDrawer((v) => !v)}
                                                aria-expanded={showAddRowDrawer}
                                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${showAddRowDrawer
                                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-400'
                                                    }`}
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>Add Row</span>
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const csv = exportDatabaseCsv(filteredDisplayRows, gridColumns, true);
                                                triggerDownload(csv, `${workspace.activeTableName || 'query'}_export.csv`, 'text/csv;charset=utf-8');
                                            }}
                                            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-200 cursor-pointer"
                                        >
                                            Export CSV
                                        </button>
                                    </div>
                                </div>

                                {/* Collapsible SQL & DuckDB Query Console */}
                                {showSqlEditor && (
                                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-1">
                                                {PRESET_SQL_QUERIES.map((pq) => (
                                                    <button
                                                        key={pq.label}
                                                        type="button"
                                                        title={pq.description}
                                                        onClick={() => handleRunSql(pq.sql)}
                                                        className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 cursor-pointer"
                                                    >
                                                        {pq.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const baseQ = workspace.activeSqlQuery.replace(/^EXPLAIN\s+(?:QUERY\s+PLAN\s+)?/i, '');
                                                        handleRunSql(`EXPLAIN QUERY PLAN ${baseQ}`);
                                                    }}
                                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                                                >
                                                    Explain
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRunSql()}
                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                                                >
                                                    <Play className="w-3.5 h-3.5" />
                                                    Run
                                                </button>
                                            </div>
                                        </div>
                                        <textarea
                                            aria-label="SQLite and DuckDB SQL query editor"
                                            rows={3}
                                            value={workspace.activeSqlQuery}
                                            onChange={(e) => setWorkspace((p) => (p ? { ...p, activeSqlQuery: e.target.value } : p))}
                                            onKeyDown={(e) => {
                                                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleRunSql();
                                                }
                                            }}
                                            placeholder="SELECT * FROM users; or SUMMARIZE orders;"
                                            className="w-full p-3 bg-slate-950 text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none"
                                        />
                                        {liveQueryExecution.error ? (
                                            <div role="alert" className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-mono flex items-center justify-between gap-2">
                                                <span>SQL Error: {liveQueryExecution.error}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setWorkspace((p) => (p ? { ...p, activeSqlQuery: `SELECT * FROM ${activeTableObj?.name || 'users'} LIMIT 50;` } : p));
                                                        setManualQueryResult(null);
                                                    }}
                                                    className="underline font-sans font-semibold cursor-pointer"
                                                >
                                                    Reset
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
                                                <span className="truncate">{liveQueryExecution.explainPlan.join(' → ') || liveQueryExecution.scanStrategy}</span>
                                                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">{liveQueryExecution.executionTimeMs} ms</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Collapsible Add Row Drawer */}
                                {showAddRowDrawer && activeTableObj && (
                                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                                                Add row to <code className="font-mono text-indigo-600">{activeTableObj.name}</code>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleAddRowToActiveTable}
                                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                                            >
                                                Insert Row
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                            {activeTableObj.columns.map((col) => (
                                                <input
                                                    key={col.name}
                                                    type="text"
                                                    value={newRowInputs[col.name] ?? ''}
                                                    onChange={(e) => setNewRowInputs((prev) => ({ ...prev, [col.name]: e.target.value }))}
                                                    placeholder={`${col.name} (${col.rawType})`}
                                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px]"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {rowActionNotice && (
                                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                                        <span>✓ {rowActionNotice}</span>
                                        <button type="button" onClick={() => setRowActionNotice(null)}><X className="w-3.5 h-3.5" /></button>
                                    </div>
                                )}

                                {/* Clean Editable Table Grid */}
                                <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 max-h-[440px]">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead className="bg-slate-50 dark:bg-slate-800/90 text-[11px] text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                                            <tr>
                                                <th className="py-2.5 px-3 font-mono w-10 text-slate-400">#</th>
                                                {gridColumns.map((col) => {
                                                    const isSorted = gridSortColumn === col;
                                                    return (
                                                        <th
                                                            key={col}
                                                            onClick={() => {
                                                                if (gridSortColumn === col) {
                                                                    setGridSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
                                                                } else {
                                                                    setGridSortColumn(col);
                                                                    setGridSortDirection('asc');
                                                                }
                                                            }}
                                                            className="py-2.5 px-3 font-mono font-bold cursor-pointer select-none hover:text-indigo-600"
                                                        >
                                                            <span className="inline-flex items-center gap-1">
                                                                <span>{col}</span>
                                                                <span className="text-[10px] text-indigo-500">
                                                                    {isSorted ? (gridSortDirection === 'asc' ? '↑' : '↓') : '↕'}
                                                                </span>
                                                            </span>
                                                        </th>
                                                    );
                                                })}
                                                <th className="py-2.5 px-3 text-right w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                                            {filteredDisplayRows.map((row, rIdx) => {
                                                const isNewRow = recentlyAddedRowIndex === rIdx;
                                                const pkColName =
                                                    activeTableObj?.columns.find((c) => c.isPrimaryKey)?.name ||
                                                    activeTableObj?.columns[0]?.name;
                                                const matchesTargetRow = (origRow: Record<string, SqliteCellValue>, origIdx: number) => {
                                                    if (origRow === row) return true;
                                                    if (pkColName && origRow[pkColName] !== undefined && row[pkColName] !== undefined) {
                                                        return origRow[pkColName] === row[pkColName];
                                                    }
                                                    return origIdx === rIdx;
                                                };

                                                return (
                                                    <tr
                                                        key={rIdx}
                                                        className={
                                                            isNewRow
                                                                ? 'bg-emerald-50/70 dark:bg-emerald-950/30'
                                                                : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/30'
                                                        }
                                                    >
                                                        <td className="py-2 px-3 font-mono text-[11px] text-slate-400">{rIdx + 1}</td>
                                                        {gridColumns.map((col) => {
                                                            const val = row[col];
                                                            const tsDecoded = decodeForensicTimestamp(val);
                                                            return (
                                                                <td key={col} className="py-2 px-3 font-mono text-[11px] align-top">
                                                                    <input
                                                                        type="text"
                                                                        value={val === null || val === undefined ? 'NULL' : String(val)}
                                                                        onChange={(e) => {
                                                                            if (!activeTableObj) return;
                                                                            const raw = e.target.value;
                                                                            const parsedVal: SqliteCellValue =
                                                                                raw === 'NULL'
                                                                                    ? null
                                                                                    : /^-?\d+(?:\.\d+)?$/.test(raw)
                                                                                        ? Number(raw)
                                                                                        : raw;
                                                                            setWorkspace((prev) =>
                                                                                prev ? syncWorkspaceBinaryTelemetry({
                                                                                    ...prev,
                                                                                    tables: prev.tables.map((t) =>
                                                                                        t.name === activeTableObj.name
                                                                                            ? {
                                                                                                ...t,
                                                                                                rows: t.rows.map((origRow, idx) =>
                                                                                                    matchesTargetRow(origRow, idx)
                                                                                                        ? { ...origRow, [col]: parsedVal }
                                                                                                        : origRow
                                                                                                ),
                                                                                            }
                                                                                            : t
                                                                                    ),
                                                                                }) : prev
                                                                            );
                                                                            setManualQueryResult(null);
                                                                        }}
                                                                        className="w-full min-w-[72px] bg-transparent border-b border-transparent focus:border-indigo-500 outline-none text-slate-900 dark:text-slate-100"
                                                                    />
                                                                    {tsDecoded.isoString && tsDecoded.category !== 'ISO8601_DATETIME' && (
                                                                        <span
                                                                            title={tsDecoded.explanation || ''}
                                                                            className="mt-0.5 inline-block px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-sans"
                                                                        >
                                                                            {tsDecoded.isoString.slice(0, 19).replace('T', ' ')} UTC
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className="py-2 px-3 text-right">
                                                            <button
                                                                type="button"
                                                                title="Delete row"
                                                                onClick={() => {
                                                                    if (!activeTableObj) return;
                                                                    setWorkspace((prev) =>
                                                                        prev ? syncWorkspaceBinaryTelemetry({
                                                                            ...prev,
                                                                            tables: prev.tables.map((t) =>
                                                                                t.name === activeTableObj.name
                                                                                    ? {
                                                                                        ...t,
                                                                                        rows: t.rows.filter((origRow, idx) => !matchesTargetRow(origRow, idx)),
                                                                                    }
                                                                                    : t
                                                                            ),
                                                                        }) : prev
                                                                    );
                                                                    setManualQueryResult(null);
                                                                    setRowActionNotice(`Deleted row from "${activeTableObj.name}".`);
                                                                }}
                                                                className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-500 cursor-pointer"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================================================
                    TAB 2: VISUAL ER DIAGRAM & ORM CODE
                    ============================================================================ */}
                    {activeTab === 'erd_schema' && (
                        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
                            <div className="min-w-0 lg:col-span-6 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Visual ER Diagram ({compiled.inferredForeignKeys.length} Relations)
                                        </h3>
                                        <p className="text-xs text-slate-500">Declared FOREIGN KEYs &amp; implicit <code>*_id</code> edges.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            triggerDownload(
                                                compiled.svgErDiagram,
                                                `${workspace.fileName.replace(/\.[a-z0-9]+$/i, '')}_erd.svg`,
                                                'image/svg+xml;charset=utf-8'
                                            )
                                        }
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download .svg</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {workspace.tables.map((tbl) => (
                                        <div key={tbl.name} className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                            <div className="bg-slate-900 dark:bg-slate-800 text-white px-3 py-2 flex items-center justify-between">
                                                <span className="font-mono font-bold text-xs">{tbl.name}</span>
                                                <span className="text-[10px] text-slate-300">{tbl.rows.length} rows</span>
                                            </div>
                                            <div className="p-2.5 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                                {tbl.columns.map((c) => {
                                                    const fk = compiled.inferredForeignKeys.find(
                                                        (f) => f.fromTable === tbl.name && f.fromColumn === c.name
                                                    );
                                                    return (
                                                        <div key={c.name} className="py-1.5 flex items-center justify-between gap-2">
                                                            <span className="font-mono text-[11px] font-semibold">
                                                                {c.isPrimaryKey ? 'PK ' : ''}{fk ? 'FK ' : ''}{c.name}
                                                            </span>
                                                            <span className="font-mono text-[10px] text-slate-500">{c.rawType}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="min-w-0 lg:col-span-6 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap gap-1">
                                        {[
                                            { id: 'drizzle_ts' as const, label: 'Drizzle' },
                                            { id: 'prisma' as const, label: 'Prisma' },
                                            { id: 'postgres_sql' as const, label: 'PostgreSQL' },
                                            { id: 'mermaid_erd' as const, label: 'Mermaid' },
                                            { id: 'dbml' as const, label: 'DBML' },
                                            { id: 'sqlite_sql' as const, label: 'SQLite DDL' },
                                        ].map((tab) => (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setSchemaCodeFormat(tab.id)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${schemaCodeFormat === tab.id
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                                    }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void navigator.clipboard?.writeText(activeSchemaCodeText);
                                                setCopiedTab2Schema(true);
                                                setTimeout(() => setCopiedTab2Schema(false), 2000);
                                            }}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-white cursor-pointer"
                                        >
                                            {copiedTab2Schema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedTab2Schema ? 'Copied' : 'Copy'}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const extMap: Record<typeof schemaCodeFormat, string> = {
                                                    drizzle_ts: 'schema.ts',
                                                    prisma: 'schema.prisma',
                                                    postgres_sql: 'postgres_migration.sql',
                                                    sqlite_sql: 'sqlite_ddl.sql',
                                                    mermaid_erd: 'schema_erd.mmd',
                                                    dbml: 'schema.dbml',
                                                };
                                                triggerDownload(activeSchemaCodeText, extMap[schemaCodeFormat], 'text/plain;charset=utf-8');
                                            }}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white cursor-pointer"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Download</span>
                                        </button>
                                    </div>
                                </div>

                                <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-w-full max-h-[460px] whitespace-pre-wrap break-words leading-relaxed">
                                    {activeSchemaCodeText}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* ============================================================================
                    TAB 3: LINTER & PROFILER
                    ============================================================================ */}
                    {activeTab === 'linter_profiler' && (
                        <div className="p-4 space-y-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-bold">12-Point Health &amp; Index Advisor ({compiled.healthScore}/100)</h3>
                                    <p className="text-xs text-slate-500">Detects missing PKs, unindexed FKs, orphaned rows, freelist bloat &amp; PII.</p>
                                </div>
                                {compiled.lintIssues.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setWorkspace((prev) => (prev ? autoOptimizeDatabaseWorkspace(prev) : prev));
                                            setLinterActionNotice('Applied 1-Click Auto-Optimize (Score: 100/100).');
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                                    >
                                        <Wrench className="w-3.5 h-3.5" />
                                        <span>1-Click Auto-Optimize ({compiled.lintIssues.length})</span>
                                    </button>
                                )}
                            </div>

                            {linterActionNotice && (
                                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                                    ✓ {linterActionNotice}
                                </div>
                            )}

                            {compiled.lintIssues.length === 0 ? (
                                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                                    <strong>Passed all 12 integrity &amp; index checks (100/100).</strong>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {compiled.lintIssues.map((issue) => (
                                        <div key={issue.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-bold">{issue.title}</span>
                                                <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-slate-900 text-white">{issue.ruleCode}</span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400">{issue.explanation}</p>
                                            <pre className="p-2 rounded bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto">{issue.remediationSql}</pre>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="text-sm font-bold flex items-center gap-1.5">
                                        <Cpu className="w-4 h-4 text-indigo-600" />
                                        <span>Column Profiler (DuckDB SUMMARIZE)</span>
                                    </h3>
                                    <div className="flex flex-wrap gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setProfilerTableFilter('ALL')}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${profilerTableFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                                                }`}
                                        >
                                            All
                                        </button>
                                        {workspace.tables.map((t) => (
                                            <button
                                                key={t.name}
                                                type="button"
                                                onClick={() => setProfilerTableFilter(t.name)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold cursor-pointer ${profilerTableFilter === t.name ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                                                    }`}
                                            >
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                                    <table className="min-w-[640px] w-full text-left border-collapse text-xs">
                                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="py-2 px-3">Table.Column</th>
                                                <th className="py-2 px-3">Type</th>
                                                <th className="py-2 px-3">Semantic</th>
                                                <th className="py-2 px-3">Distinct</th>
                                                <th className="py-2 px-3">Null %</th>
                                                <th className="py-2 px-3">Sample</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                                            {compiled.columnProfiles
                                                .filter((prof) => profilerTableFilter === 'ALL' || prof.tableName === profilerTableFilter)
                                                .map((prof) => (
                                                    <tr key={`${prof.tableName}.${prof.columnName}`}>
                                                        <td className="py-2 px-3 font-mono font-bold">{prof.tableName}.{prof.columnName}</td>
                                                        <td className="py-2 px-3 font-mono">{prof.declaredType}</td>
                                                        <td className="py-2 px-3 font-mono text-[10px]">{prof.semanticCategory}</td>
                                                        <td className="py-2 px-3 font-mono">{prof.distinctCount}</td>
                                                        <td className="py-2 px-3 font-mono">{prof.nullPercent}%</td>
                                                        <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{prof.sampleDecodedPreview}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================================================
                    TAB 4: FORENSICS & PII
                    ============================================================================ */}
                    {activeTab === 'binary_forensics' && (
                        <div className="p-4 space-y-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-bold flex items-center gap-1.5">
                                        <Lock className="w-4 h-4 text-indigo-600" />
                                        <span>Deleted-Row Carver, Companion .db-wal &amp; PII Scrubber</span>
                                    </h3>
                                    <p className="text-xs text-slate-500">Attach .db-wal logs, run VACUUM, or anonymize PII before sharing.</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <input ref={walInputRef} type="file" accept=".db-wal,.sqlite-wal,.wal" onChange={handleFileUpload} className="hidden" />
                                    <button type="button" onClick={() => walInputRef.current?.click()} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 cursor-pointer">
                                        + Attach .db-wal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const { updatedWorkspace } = executeSqlQuery(workspace, 'VACUUM;');
                                            setWorkspace(syncWorkspaceBinaryTelemetry(updatedWorkspace));
                                            setForensicActionNotice('Executed VACUUM: compacted B-tree pages and zero-wiped freelist slack.');
                                        }}
                                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white cursor-pointer"
                                    >
                                        VACUUM
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setWorkspace((prev) => (prev ? anonymizeDatabasePii(prev) : prev));
                                            setForensicActionNotice('Anonymized PII columns and zero-wiped deleted freelist artifacts.');
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white cursor-pointer"
                                    >
                                        <KeyRound className="w-3.5 h-3.5" />
                                        <span>Anonymize PII &amp; Wipe Residue</span>
                                    </button>
                                </div>
                            </div>

                            {forensicActionNotice && (
                                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                                    ✓ {forensicActionNotice}
                                </div>
                            )}

                            {workspace.recoveredArtifacts.length === 0 ? (
                                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                                    Zero unvacuumed deleted artifacts found. Switch to <strong>Forensic DB</strong> above to test live deleted-row carving.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {workspace.recoveredArtifacts.map((art) => (
                                        <div key={art.id} className="p-3 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20 text-xs space-y-1">
                                            <div className="flex items-center justify-between gap-2 font-bold">
                                                <span>Page #{art.pageNumber} (Offset {art.byteOffset}) — {art.sourceRegion}</span>
                                                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-600 text-white">{art.inferredTable}</span>
                                            </div>
                                            <pre className="p-2 rounded bg-slate-950 text-amber-300 font-mono text-[11px] overflow-x-auto">{art.recoveredText}</pre>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                <div className="min-w-0 lg:col-span-6 space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">100-Byte Header (Page 1)</h4>
                                    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                                        <table className="min-w-[400px] w-full text-left border-collapse text-xs">
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-mono text-[11px]">
                                                {[
                                                    ['0..15', 'Magic', workspace.headerInfo.magicHeaderString],
                                                    ['16..17', 'Page Size', `${workspace.headerInfo.pageSize} B`],
                                                    ['18..19', 'Journal', workspace.headerInfo.writeFormatVersion === 2 ? 'WAL (2)' : 'Rollback (1)'],
                                                    ['28..31', 'Pages', `${workspace.headerInfo.databaseSizeInPages}`],
                                                    ['32..39', 'Freelist', `Trunk ${workspace.headerInfo.firstFreelistTrunkPage} · Total ${workspace.headerInfo.totalFreelistPages}`],
                                                    ['56..59', 'Encoding', workspace.headerInfo.textEncodingLabel],
                                                    ['96..99', 'SQLite Ver', workspace.headerInfo.sqliteVersionString],
                                                ].map(([off, name, val]) => (
                                                    <tr key={off}>
                                                        <td className="py-2 px-3 text-slate-500">{off}</td>
                                                        <td className="py-2 px-3 font-sans font-semibold">{name}</td>
                                                        <td className="py-2 px-3 text-indigo-600 dark:text-indigo-400 font-bold">{val}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="min-w-0 lg:col-span-6 space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">B-Tree Page Map ({workspace.pageMap.length})</h4>
                                    <div className="space-y-1.5 max-h-[280px] overflow-y-auto text-xs">
                                        {workspace.pageMap.map((pg) => (
                                            <div key={pg.pageNumber} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                                                <div>
                                                    <span className="font-mono font-bold">Page #{pg.pageNumber} — {pg.ownerObjectName}</span>
                                                    <div className="text-[11px] text-slate-500">{pg.cellCount} cells · {pg.unallocatedBytes} B slack</div>
                                                </div>
                                                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                                    {pg.pageTypeLabel}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================================================
                    TAB 5: 11-FORMAT EXPORT & SIDE-BY-SIDE DIFF
                    ============================================================================ */}
                    {activeTab === 'export_diff' && (
                        <div className="p-4 space-y-6">
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-bold">11-Format Export Studio</h3>
                                        <p className="text-xs text-slate-500">Local downloads with CWE-1236 Excel/CSV formula protection.</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const bin = exportBinarySqliteDatabase(workspace);
                                                triggerDownload(bin, workspace.fileName.replace(/\.[a-z0-9]+$/i, '') + '.sqlite', 'application/x-sqlite3');
                                            }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white cursor-pointer"
                                        >
                                            <Download className="w-3.5 h-3.5" />1. Binary .sqlite
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const xlsx = exportDatabaseXlsx(workspace);
                                                triggerDownload(xlsx, `${workspace.activeTableName || 'database'}_export.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                                            }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white cursor-pointer"
                                        >
                                            <FileSpreadsheet className="w-3.5 h-3.5" />2. Excel (.xlsx)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const tbl = activeTableObj || workspace.tables[0];
                                                const csv = exportDatabaseCsv(tbl ? tbl.rows : [], tbl ? tbl.columns.map((c) => c.name) : [], true);
                                                triggerDownload(csv, `${tbl?.name || 'database'}.csv`, 'text/csv;charset=utf-8');
                                            }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 cursor-pointer"
                                        >
                                            <FileCode className="w-3.5 h-3.5" />3. CSV (.csv)
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap gap-1">
                                        {[
                                            { id: 'drizzle_ts' as const, label: '4. Drizzle' },
                                            { id: 'prisma' as const, label: '5. Prisma' },
                                            { id: 'postgres_sql' as const, label: '6. PostgreSQL' },
                                            { id: 'duckdb_sql' as const, label: '7. DuckDB' },
                                            { id: 'sqlite_sql' as const, label: '8. SQLite Dump' },
                                            { id: 'mermaid_erd' as const, label: '9. Mermaid' },
                                            { id: 'dbml' as const, label: '10. DBML' },
                                            { id: 'certificate_json' as const, label: '11. SHA-256 Cert' },
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => setExportFormat(item.id)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${exportFormat === item.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                                                    }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void navigator.clipboard?.writeText(activeExportText);
                                                setCopiedExport(true);
                                                setTimeout(() => setCopiedExport(false), 2000);
                                            }}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-white cursor-pointer"
                                        >
                                            {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedExport ? 'Copied' : 'Copy'}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const extMap: Record<typeof exportFormat, string> = {
                                                    drizzle_ts: 'schema.ts',
                                                    prisma: 'schema.prisma',
                                                    postgres_sql: 'postgres_migration.sql',
                                                    duckdb_sql: 'duckdb_lakehouse.sql',
                                                    sqlite_sql: 'sqlite_dump.sql',
                                                    mermaid_erd: 'schema_erd.mmd',
                                                    dbml: 'schema.dbml',
                                                    certificate_json: 'sqlite_sha256_audit_certificate.json',
                                                };
                                                triggerDownload(activeExportText, extMap[exportFormat], 'text/plain;charset=utf-8');
                                            }}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white cursor-pointer"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Download</span>
                                        </button>
                                    </div>
                                </div>

                                <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-w-full max-h-[340px] whitespace-pre-wrap break-words leading-relaxed">
                                    {activeExportText}
                                </pre>
                            </div>

                            <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-bold flex items-center gap-1.5">
                                            <GitCompare className="w-4 h-4 text-indigo-600" />
                                            <span>Side-by-Side Database Diff (sqldiff)</span>
                                        </h3>
                                        <p className="text-xs text-slate-500">Compare against a second <code>.sqlite</code> / <code>.sql</code> file to generate a migration patch.</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <input
                                            ref={diffInputRef}
                                            type="file"
                                            accept=".sqlite,.db,.sqlite3,.sql"
                                            onChange={async (e) => {
                                                const f = e.target.files?.[0];
                                                if (!f) return;
                                                const buf = await f.arrayBuffer();
                                                const secondWs = parseSqliteOrDuckDbFile(new Uint8Array(buf), f.name);
                                                setDiffReport(compareSqliteDatabases(workspace, secondWs));
                                                setDiffNotice(`Compared "${workspace.fileName}" vs "${f.name}".`);
                                                e.target.value = '';
                                            }}
                                            className="hidden"
                                        />
                                        <button type="button" onClick={() => diffInputRef.current?.click()} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white cursor-pointer">
                                            Upload 2nd .sqlite
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const stagingDemo = generateSampleDatabase('finledger_forensic_demo');
                                                setDiffReport(compareSqliteDatabases(workspace, stagingDemo));
                                                setDiffNotice(`Compared "${workspace.fileName}" vs "${stagingDemo.fileName}".`);
                                            }}
                                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white cursor-pointer"
                                        >
                                            Run Demo Diff
                                        </button>
                                    </div>
                                </div>

                                {diffNotice && <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">✓ {diffNotice}</p>}

                                {diffReport && (
                                    <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-h-[260px]">
                                        {diffReport.migrationSqlScript}
                                    </pre>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}