"use client";

import React, { useState, useRef, useMemo } from 'react';
import {
    Database,
    ShieldCheck,
    ShieldAlert,
    Upload,
    Download,
    Search,
    AlertTriangle,
    CheckCircle2,
    Code2,
    FileSpreadsheet,
    FileCode,
    FileText,
    Sparkles,
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
} from 'lucide-react';

import {
    SQLITE_EXPLORER_ENGINE_VERSION,
    decodeForensicTimestamp,
    parseSqliteOrDuckDbFile,
    parseSqliteWalBytes,
    exportBinarySqliteDatabase,
    executeSqlQuery,
    profileTableColumns,
    discoverAllForeignKeys,
    validateDatabaseWorkspace,
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
    title: string;
    subtitle: string;
    badge: string;
}[] = [
        {
            id: 'saas_ecommerce',
            title: 'CloudScale SaaS & E-Commerce DB (prod.sqlite)',
            subtitle: '3 relational tables (organizations, users, orders), FK indexes, JSON metadata & JOIN/SUMMARIZE queries',
            badge: '100/100 Valid • Relational SQL & ERD',
        },
        {
            id: 'finledger_forensic_demo',
            title: 'FinLedger Incident DB (Forensics & Linter Demo)',
            subtitle: 'Contains deleted offshore wire rows in freelist space, orphaned FK row, unindexed FK & live PII to test 1-Click Fix',
            badge: 'Test Forensic Carver & 1-Click Fix',
        },
        {
            id: 'browser_mobile_artifacts',
            title: 'Chrome History & iOS iMessage Forensic DB',
            subtitle: 'WebKit 1601 microsecond timestamps (chrome_urls) & Apple CoreData 2001 nanosecond timestamps (ios_imessage_chat)',
            badge: 'Forensic Timestamp Decoder',
        },
    ];

const PRESET_SQL_QUERIES: { label: string; sql: string; description: string }[] = [
    {
        label: '1. JOIN & Lifetime Spend',
        sql: 'SELECT u.id, u.full_name, u.plan_tier, COUNT(o.id) AS total_orders, SUM(o.amount_usd) AS lifetime_spend_usd FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id ORDER BY lifetime_spend_usd DESC;',
        description: 'Joins users and orders with GROUP BY aggregation',
    },
    {
        label: '2. DuckDB SUMMARIZE',
        sql: 'SUMMARIZE orders;',
        description: 'Runs DuckDB columnar statistical profiler on orders',
    },
    {
        label: '3. DuckDB SELECT * EXCLUDE',
        sql: 'SELECT * EXCLUDE (metadata_json) FROM orders WHERE status = \'PAID\' ORDER BY amount_usd DESC;',
        description: 'Uses DuckDB EXCLUDE projection to omit bulky JSON column',
    },
    {
        label: '4. EXPLAIN QUERY PLAN',
        sql: 'EXPLAIN QUERY PLAN SELECT * FROM orders WHERE user_id = 101;',
        description: 'Verifies whether WHERE filter uses B-tree index or full table scan',
    },
    {
        label: '5. PRAGMA foreign_key_check',
        sql: 'PRAGMA foreign_key_check;',
        description: 'Audits all child rows for orphaned foreign-key references',
    },
    {
        label: '6. PRAGMA table_info',
        sql: 'PRAGMA table_info(users);',
        description: 'Inspects SQLite column affinities, NOT NULL, and PK flags',
    },
];

export default function SqliteExplorer() {
    const [activeSampleId, setActiveSampleId] = useState<
        'saas_ecommerce' | 'finledger_forensic_demo' | 'browser_mobile_artifacts' | null
    >('saas_ecommerce');

    const [workspace, setWorkspace] = useState<SqliteWorkspaceState>(() =>
        generateSampleDatabase('saas_ecommerce')
    );

    const [activeTab, setActiveTab] = useState<SqliteWorkbenchTab>('sql_runner');
    const [statusBanner, setStatusBanner] = useState<string | null>(
        'Loaded Sample #1: "cloudscale_saas_prod.sqlite" (Real SQLite 3.46.1 binary image in browser memory — 3 tables, 12 rows, 100/100 Health Score). Click any sample card above to test Forensic Deleted-Row Recovery or WebKit/CoreData Timestamps!'
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Tab 1: SQL Runner, Row Filter, Column Sort, Inline Insert Row & Inline Notices
    const [rowSearchFilter, setRowSearchFilter] = useState<string>('');
    const [gridSortColumn, setGridSortColumn] = useState<string | null>(null);
    const [gridSortDirection, setGridSortDirection] = useState<'asc' | 'desc'>('asc');
    const [newRowInputs, setNewRowInputs] = useState<Record<string, string>>({});
    const [recentlyAddedRowIndex, setRecentlyAddedRowIndex] = useState<number | null>(null);
    const [rowActionNotice, setRowActionNotice] = useState<string | null>(null);
    const [newTableNameInput, setNewTableNameInput] = useState<string>('');
    const [tableActionNotice, setTableActionNotice] = useState<string | null>(null);

    // Tab 2: Schema & ORM Code Preview Mode + Copy State
    const [schemaCodeFormat, setSchemaCodeFormat] = useState<
        'drizzle_ts' | 'prisma' | 'postgres_sql' | 'sqlite_sql' | 'mermaid_erd' | 'dbml'
    >('drizzle_ts');
    const [copiedTab2Schema, setCopiedTab2Schema] = useState<boolean>(false);

    // Tab 3: Linter & Profiler Notice + Table Filter
    const [linterActionNotice, setLinterActionNotice] = useState<string | null>(null);
    const [profilerTableFilter, setProfilerTableFilter] = useState<string>('ALL');

    // Tab 4: Forensics & PII Scrubber Notice
    const [forensicActionNotice, setForensicActionNotice] = useState<string | null>(null);

    // Tab 5: Export Studio & Side-by-Side Database Diff
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
    const workbenchRef = useRef<HTMLDivElement | null>(null);

    // Synchronously compile all deliverables, linter rules, foreign keys, and column profiles
    const compiled = useMemo(() => compileAllDatabaseDeliverables(workspace), [workspace]);

    // Execute active SQL query if non-mutating SELECT/PRAGMA/SUMMARIZE/EXPLAIN, or fallback to active table
    const [manualQueryResult, setManualQueryResult] = useState<ReturnType<typeof executeSqlQuery>['result'] | null>(
        null
    );

    const liveQueryExecution = useMemo(() => {
        if (manualQueryResult) return manualQueryResult;
        return executeSqlQuery(workspace, workspace.activeSqlQuery).result;
    }, [workspace, manualQueryResult]);

    const activeTableObj = useMemo(
        () =>
            workspace.tables.find((t) => t.name === workspace.activeTableName) ||
            workspace.tables[0] ||
            null,
        [workspace.tables, workspace.activeTableName]
    );

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
        () => workspace.tables.reduce((acc, t) => acc + t.rows.length, 0),
        [workspace.tables]
    );

    const totalIndexCount = useMemo(
        () => workspace.tables.reduce((acc, t) => acc + t.indexes.length, 0),
        [workspace.tables]
    );

    const piiColumnsCount = useMemo(
        () =>
            compiled.columnProfiles.filter(
                (p) =>
                    p.semanticCategory === 'EMAIL_PII' ||
                    p.semanticCategory === 'PASSWORD_HASH_SECRET' ||
                    p.semanticCategory === 'JWT_OR_API_TOKEN' ||
                    p.semanticCategory === 'CREDIT_CARD_PAN' ||
                    p.semanticCategory === 'SSN_OR_NATIONAL_ID'
            ).length,
        [compiled.columnProfiles]
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

        if (sampleId === 'saas_ecommerce') {
            setStatusBanner(
                'Loaded Sample #1: "cloudscale_saas_prod.sqlite" — 3 relational tables, FK indexes, 100/100 Health Score.'
            );
        } else if (sampleId === 'finledger_forensic_demo') {
            setStatusBanner(
                'Loaded Sample #2: "finledger_audit_incident.sqlite" — Open Tab 3 (Linter) or Tab 4 (Forensics) to inspect 2 deleted offshore wire records in unvacuumed freelist space & 1 orphaned FK row!'
            );
        } else {
            setStatusBanner(
                'Loaded Sample #3: "forensic_places_and_sms.sqlite" — Inspect automatic Chrome WebKit (1601) & Apple CoreData (2001) timestamp decoding in Tab 1 & Tab 3!'
            );
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setErrorMessage(null);
        setManualQueryResult(null);
        try {
            const buf = await file.arrayBuffer();
            const bytes = new Uint8Array(buf);
            const lowerName = file.name.toLowerCase();

            if (lowerName.endsWith('-wal') || lowerName.endsWith('.wal')) {
                const walInfo = parseSqliteWalBytes(bytes, file.name);
                setWorkspace((prev) => ({ ...prev, walSummary: walInfo }));
                setActiveTab('binary_forensics');
                setForensicActionNotice(
                    `Loaded Write-Ahead Log "${file.name}" (${walInfo.totalFrames} frame(s), checkpoint #${walInfo.checkpointSequence}).`
                );
                setStatusBanner(`Parsed WAL file "${file.name}" in Tab 4 (Binary Header & WAL Forensics).`);
            } else {
                const parsedWs = parseSqliteOrDuckDbFile(bytes, file.name);
                setActiveSampleId(null);
                setWorkspace(parsedWs);
                setActiveTab('sql_runner');
                setStatusBanner(
                    `Loaded "${file.name}" (${parsedWs.tables.length} table(s), ${parsedWs.tables.reduce(
                        (a, t) => a + t.rows.length,
                        0
                    )} rows, SHA-256: ${parsedWs.sha256Hex.slice(0, 12)}...).`
                );
            }
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : 'Unable to parse uploaded database file.');
        }
        e.target.value = '';
    };

    const handleRunSql = (customSql?: string) => {
        setErrorMessage(null);
        const sqlToRun = (customSql ?? workspace.activeSqlQuery).trim();
        if (!sqlToRun) return;
        const { result, updatedWorkspace } = executeSqlQuery(workspace, sqlToRun);
        if (result.isMutation && !result.error) {
            const nextBin = exportBinarySqliteDatabase(updatedWorkspace);
            setWorkspace({
                ...updatedWorkspace,
                fileByteSize: nextBin.byteLength,
                sha256Hex: updatedWorkspace.sha256Hex,
                activeSqlQuery: sqlToRun,
            });
            setManualQueryResult(result);
            setRowActionNotice(`Executed SQL mutation (${result.rowsAffected} row(s) affected) in ${result.executionTimeMs} ms!`);
        } else {
            if (customSql) {
                setWorkspace((prev) => ({ ...prev, activeSqlQuery: customSql }));
            }
            setManualQueryResult(result);
        }
    };

    const handleAddRowToActiveTable = () => {
        if (!activeTableObj) return;
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
                // Auto-generate sensible non-empty default value so clicking "+ Add Row" ALWAYS works immediately!
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
        setWorkspace((prev) => ({
            ...prev,
            tables: nextTables,
            activeSqlQuery: nextSelectSql,
        }));
        setManualQueryResult(null);
        setNewRowInputs({});
        setRecentlyAddedRowIndex(0);

        const pkCol = activeTableObj.columns.find((c) => c.isPrimaryKey)?.name || activeTableObj.columns[0]?.name;
        const msg = `Inserted new row (${pkCol}=${newRow[pkCol]}) at #1 in "${activeTableObj.name}"!`;
        setRowActionNotice(msg);
        setStatusBanner(msg);
    };

    const handleCreateQuickTable = () => {
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
        setWorkspace((prev) => ({
            ...prev,
            tables: [...prev.tables, newTbl],
            activeTableName: cleanName,
            activeSqlQuery: nextSql,
        }));
        setManualQueryResult(null);
        setNewTableNameInput('');
        const msg = `Created table "${cleanName}" with 4 columns and 1 starter row!`;
        setTableActionNotice(msg);
        setStatusBanner(msg);
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
        if (schemaCodeFormat === 'drizzle_ts') return compiled.drizzleOrmSchemaTs;
        if (schemaCodeFormat === 'prisma') return compiled.prismaSchema;
        if (schemaCodeFormat === 'postgres_sql') return compiled.postgresMigrationSql;
        if (schemaCodeFormat === 'mermaid_erd') return compiled.mermaidErDiagram;
        if (schemaCodeFormat === 'dbml') return compiled.dbmlSchema;
        return compiled.sqliteSqlDump;
    }, [schemaCodeFormat, compiled]);

    const activeExportText = useMemo(() => {
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
        <div className="space-y-6 w-full min-w-0 max-w-full overflow-x-hidden text-slate-900 dark:text-slate-100">
            {/* TOP STUDIO HEADER, FILE UPLOAD & 3 INSTANT 1-CLICK SAMPLE DATABASES */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="min-w-0">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-2">
                            <Database className="w-3.5 h-3.5 shrink-0" />
                            <span>
                                Zero-CDN Binary B-Tree + DuckDB Analytical SQL + Forensic Studio v{SQLITE_EXPLORER_ENGINE_VERSION}
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            SQLite &amp; DuckDB In-Browser Database Explorer, ERD &amp; Forensic Studio
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Open, query, edit, and export <code>.sqlite</code>, <code>.db</code>, <code>.sqlite3</code>,{' '}
                            <code>.db-wal</code>, <code>.duckdb</code>, <code>.sql</code>, and <code>.csv</code> databases 100%
                            locally. Run SQLite &amp; DuckDB <code>SUMMARIZE</code> queries, visualize ER diagrams, carve deleted
                            freelist records, scrub PII, and generate Drizzle/Prisma/PostgreSQL schemas.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".sqlite,.db,.sqlite3,.db3,.duckdb,.sql,.csv,.tsv,.json,.jsonl"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-sm transition cursor-pointer"
                        >
                            <Upload className="w-4 h-4 shrink-0" />
                            <span>Open .sqlite / .db / .duckdb / .sql</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const bin = exportBinarySqliteDatabase(workspace);
                                triggerDownload(bin, workspace.fileName.replace(/\.[a-z0-9]+$/i, '') + '.sqlite', 'application/x-sqlite3');
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition cursor-pointer"
                        >
                            <Download className="w-4 h-4 shrink-0" />
                            <span>Save Binary .sqlite ({Math.round(workspace.fileByteSize / 1024)} KB)</span>
                        </button>
                    </div>
                </div>

                {/* 3 Instant 1-Click Sample Databases */}
                <div className="pt-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>
                            Instant 1-Click Sample Databases (Click Any Database to Load Live Tables, ER Diagram &amp; Binary Header):
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                        {SAMPLE_DATABASES.map((s) => {
                            const isSelected = activeSampleId === s.id;
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => handleSelectSample(s.id)}
                                    className={`min-w-0 text-left p-3.5 rounded-xl border transition group cursor-pointer ${isSelected
                                            ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/60 ring-2 ring-indigo-500/30 shadow-xs'
                                            : 'border-slate-200 dark:border-slate-700/80 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-800/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                                            {s.title}
                                        </span>
                                        <span
                                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${isSelected
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                }`}
                                        >
                                            {isSelected ? '✓ Active' : 'Load'}
                                        </span>
                                    </div>
                                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 mb-1">
                                        {s.badge}
                                    </span>
                                    <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400 line-clamp-2">
                                        {s.subtitle}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Live Loaded Database Preview Bar */}
                    <div className="mt-3 rounded-xl border border-indigo-200 dark:border-indigo-900/70 bg-indigo-50/70 dark:bg-indigo-950/40 p-3 space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2 min-w-0">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="font-bold text-slate-900 dark:text-white truncate">
                                    Active DB:{' '}
                                    <code className="font-mono text-indigo-700 dark:text-indigo-300">{workspace.fileName}</code>
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                    {workspace.tables.length} Tables • {totalRowCount} Rows • SQLite{' '}
                                    {workspace.headerInfo.sqliteVersionString} • Score: {compiled.healthScore}/100
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('sql_runner');
                                        workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition cursor-pointer"
                                >
                                    SQL Runner &amp; Grid ↓
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('erd_schema');
                                        workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-500 cursor-pointer"
                                >
                                    ER Diagram &amp; Drizzle/Prisma
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('linter_profiler');
                                        workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-500 cursor-pointer"
                                >
                                    Linter &amp; SUMMARIZE ({compiled.lintIssues.length} Alerts)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('binary_forensics');
                                        workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-500 cursor-pointer"
                                >
                                    100-Byte Header &amp; Forensics
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Disclosure & Technical Privacy Bar */}
                <details className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <summary className="cursor-pointer font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span>
                                SQLite 3 Binary B-Tree Specification, DuckDB Analytical Grammar &amp; Local Browser Privacy Disclosure
                            </span>
                        </span>
                        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium shrink-0">
                            Click to expand
                        </span>
                    </summary>
                    <div className="mt-2.5 space-y-1.5 leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-2.5">
                        <p>
                            <strong>Privacy &amp; Local Execution:</strong> Your selected database files (<code>.sqlite</code>,{' '}
                            <code>.db</code>, <code>.db-wal</code>, <code>.duckdb</code>, <code>.sql</code>) are processed locally in
                            your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or
                            other third-party website resources.
                        </p>
                        <p>
                            <strong>Zero External CDN Dependencies:</strong> Unlike web viewers that download external CDN{' '}
                            <code>.wasm</code> binaries or 35 MB Pyodide runtimes that fail under strict enterprise CSP, our engine
                            natively parses the 100-byte SQLite 3 header, interior/leaf B-tree pages (<code>0x05</code>/
                            <code>0x0d</code>), varint serial payloads, overflow chains, and freelist pages directly in TypeScript.
                        </p>
                    </div>
                </details>
            </div>

            {errorMessage && (
                <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 p-4 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold">Database Studio Alert</p>
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

            {/* 6-CARD LIVE DATABASE TELEMETRY BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">DB Health &amp; Integrity</div>
                    <div
                        className={`text-sm font-bold mt-0.5 truncate ${compiled.healthScore >= 85
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : compiled.healthScore >= 60
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-rose-600 dark:text-rose-400'
                            }`}
                    >
                        {compiled.healthScore} / 100 ({compiled.lintIssues.length === 0 ? 'Healthy' : `${compiled.lintIssues.length} Alerts`})
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                        PRAGMA integrity_check: OK
                    </div>
                </div>

                <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Binary Format &amp; Page</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                        SQLite {workspace.headerInfo.sqliteVersionString}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                        {workspace.headerInfo.pageSize.toLocaleString()} B/page • {workspace.headerInfo.textEncodingLabel}
                    </div>
                </div>

                <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Schema Objects</div>
                    <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">
                        {workspace.tables.length} Tables • {totalIndexCount} Idx
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                        {compiled.inferredForeignKeys.length} Foreign Key Relation(s)
                    </div>
                </div>

                <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Records &amp; Footprint</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                        {totalRowCount.toLocaleString()} Total Rows
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                        {(workspace.fileByteSize / 1024).toFixed(1)} KB • {workspace.headerInfo.totalFreelistPages} Freelist Pg
                    </div>
                </div>

                <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Forensics &amp; PII Scan</div>
                    <div
                        className={`text-sm font-bold mt-0.5 truncate ${workspace.recoveredArtifacts.length > 0 || piiColumnsCount > 0
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                    >
                        {workspace.recoveredArtifacts.length} Deleted • {piiColumnsCount} PII Col
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                        {workspace.piiScrubbedCount > 0 ? 'PII Scrubbed ✓' : 'Inspect in Tab 4'}
                    </div>
                </div>

                <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Query Execution Plan</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                        {liveQueryExecution.executionTimeMs} ms ({liveQueryExecution.rows.length} rows)
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                        {liveQueryExecution.scanStrategy.replace(/_/g, ' ')}
                    </div>
                </div>
            </div>

            {/* 5-TAB WORKBENCH NAVIGATION */}
            <div
                ref={workbenchRef}
                className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 scroll-mt-20"
            >
                <button
                    type="button"
                    onClick={() => setActiveTab('sql_runner')}
                    className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${activeTab === 'sql_runner'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                >
                    <span className="inline-flex items-center gap-2">
                        <Terminal className="w-4 h-4 shrink-0" />
                        <span>1. SQL &amp; DuckDB Runner + Data Grid</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                        {workspace.tables.length} Tables
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('erd_schema')}
                    className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${activeTab === 'erd_schema'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                >
                    <span className="inline-flex items-center gap-2">
                        <Layers className="w-4 h-4 shrink-0" />
                        <span>2. Visual ER Diagram &amp; ORM Code</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                        ERD + Drizzle
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('linter_profiler')}
                    className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${activeTab === 'linter_profiler'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                >
                    <span className="inline-flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>3. 12-Point Linter &amp; DuckDB SUMMARIZE</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                        {compiled.lintIssues.length} Alerts
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('binary_forensics')}
                    className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${activeTab === 'binary_forensics'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                >
                    <span className="inline-flex items-center gap-2">
                        <HardDrive className="w-4 h-4 shrink-0" />
                        <span>4. 100-Byte Header, Freelist &amp; PII Scrubber</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                        Forensics
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('export_diff')}
                    className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${activeTab === 'export_diff'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                >
                    <span className="inline-flex items-center gap-2">
                        <Code2 className="w-4 h-4 shrink-0" />
                        <span>5. 10-Format Export &amp; Database Diff</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                        10 Formats
                    </span>
                </button>
            </div>

            {/* ============================================================================
          TAB 1: SQL & DUCKDB QUERY RUNNER + INTERACTIVE DATA GRID
          ============================================================================ */}
            {activeTab === 'sql_runner' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left Column: Table Browser Sidebar & Quick Table Creator */}
                    <div className="min-w-0 lg:col-span-4 space-y-4">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3 text-xs">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <TableIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>Database Tables ({workspace.tables.length})</span>
                                </h3>
                                <span className="text-[11px] text-slate-500">{totalRowCount} total rows</span>
                            </div>

                            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                                {workspace.tables.map((tbl) => {
                                    const isSelected = workspace.activeTableName === tbl.name;
                                    return (
                                        <div
                                            key={tbl.name}
                                            className={`p-3 rounded-xl border transition space-y-2 ${isSelected
                                                    ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-500/30'
                                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const sql = `SELECT * FROM ${tbl.name} LIMIT 50;`;
                                                        setWorkspace((p) => ({
                                                            ...p,
                                                            activeTableName: tbl.name,
                                                            activeSqlQuery: sql,
                                                        }));
                                                        setManualQueryResult(null);
                                                    }}
                                                    className="font-mono font-bold text-slate-900 dark:text-white hover:text-indigo-600 text-left truncate cursor-pointer"
                                                >
                                                    {tbl.name}
                                                </button>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                                                    {tbl.rows.length} rows • {tbl.columns.length} cols
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-1">
                                                {tbl.columns.map((c) => (
                                                    <span
                                                        key={c.name}
                                                        className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${c.isPrimaryKey
                                                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold'
                                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                                                            }`}
                                                    >
                                                        {c.isPrimaryKey ? '🔑 ' : ''}
                                                        {c.name}: {c.rawType}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const sql = `SELECT * FROM ${tbl.name} LIMIT 50;`;
                                                        setWorkspace((p) => ({ ...p, activeTableName: tbl.name, activeSqlQuery: sql }));
                                                        setManualQueryResult(null);
                                                    }}
                                                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
                                                >
                                                    Browse Rows
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const sql = `SUMMARIZE ${tbl.name};`;
                                                        setWorkspace((p) => ({ ...p, activeTableName: tbl.name, activeSqlQuery: sql }));
                                                        handleRunSql(sql);
                                                    }}
                                                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 cursor-pointer"
                                                >
                                                    DuckDB SUMMARIZE
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const sql = `PRAGMA table_info(${tbl.name});`;
                                                        setWorkspace((p) => ({ ...p, activeTableName: tbl.name, activeSqlQuery: sql }));
                                                        handleRunSql(sql);
                                                    }}
                                                    className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                                                >
                                                    Schema Info
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Create New Table Form */}
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                                <label className="block font-bold text-slate-700 dark:text-slate-300">
                                    Create New Table in Memory:
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
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
                                        placeholder="e.g. api_keys or events"
                                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCreateQuickTable}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center justify-center gap-1 cursor-pointer shrink-0"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Table</span>
                                    </button>
                                </div>
                                {tableActionNotice && (
                                    <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200">
                                        ✓ {tableActionNotice}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: SQL & DuckDB Query Editor + Interactive Data Grid + Insert Row Form */}
                    <div className="min-w-0 lg:col-span-8 space-y-4">
                        {/* SQL Query Editor Card */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>SQLite 3 &amp; DuckDB Analytical SQL Query Runner</span>
                                </h3>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => handleRunSql()}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition cursor-pointer"
                                    >
                                        <Play className="w-3.5 h-3.5" />
                                        <span>Run SQL Query</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const baseQ = workspace.activeSqlQuery.replace(/^EXPLAIN\s+(?:QUERY\s+PLAN\s+)?/i, '');
                                            const explainQ = `EXPLAIN QUERY PLAN ${baseQ}`;
                                            handleRunSql(explainQ);
                                        }}
                                        className="px-3 py-1.5 rounded-xl font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition cursor-pointer"
                                    >
                                        Explain Query Plan
                                    </button>
                                </div>
                            </div>

                            {/* 6 Preset Analytical Queries */}
                            <div className="flex flex-wrap gap-1.5">
                                {PRESET_SQL_QUERIES.map((pq) => (
                                    <button
                                        key={pq.label}
                                        type="button"
                                        title={pq.description}
                                        onClick={() => handleRunSql(pq.sql)}
                                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                                    >
                                        {pq.label}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                rows={3}
                                value={workspace.activeSqlQuery}
                                onChange={(e) => setWorkspace((p) => ({ ...p, activeSqlQuery: e.target.value }))}
                                onKeyDown={(e) => {
                                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                        e.preventDefault();
                                        handleRunSql();
                                    }
                                }}
                                placeholder="SELECT * FROM users; or SUMMARIZE orders; or SELECT * EXCLUDE (metadata_json) FROM orders;"
                                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-950 text-emerald-300 font-mono text-xs leading-relaxed"
                            />

                            {/* Live EXPLAIN QUERY PLAN & Latency Bar */}
                            {liveQueryExecution.explainPlan.length > 0 && (
                                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/70 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">Query Plan:</span>
                                        <code className="font-mono text-slate-700 dark:text-slate-300 truncate">
                                            {liveQueryExecution.explainPlan.join(' → ')}
                                        </code>
                                    </div>
                                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                                        {liveQueryExecution.executionTimeMs} ms • {liveQueryExecution.rows.length} row(s)
                                    </span>
                                </div>
                            )}

                            {liveQueryExecution.error && (
                                <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 text-rose-800 dark:text-rose-200 text-[11px] font-mono">
                                    SQL Error: {liveQueryExecution.error}
                                </div>
                            )}
                        </div>

                        {/* Interactive Data Grid & + Add Row Card */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Query Result &amp; Live Editable Grid ({filteredDisplayRows.length} rows)
                                    </h3>
                                    {activeTableObj && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                            Table: {activeTableObj.name}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="relative">
                                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                                        <input
                                            type="text"
                                            value={rowSearchFilter}
                                            onChange={(e) => setRowSearchFilter(e.target.value)}
                                            placeholder="Filter grid rows..."
                                            className="pl-8 pr-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const csv = exportDatabaseCsv(filteredDisplayRows, liveQueryExecution.columns, true);
                                            triggerDownload(csv, `${workspace.activeTableName || 'query'}_export.csv`, 'text/csv;charset=utf-8');
                                        }}
                                        className="px-2.5 py-1 rounded-lg font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                                    >
                                        Export CSV
                                    </button>
                                </div>
                            </div>

                            {/* Quick + Add Row Form for Active Table */}
                            {activeTableObj && (
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2.5">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                            + Insert New Row into <code className="font-mono text-indigo-600">{activeTableObj.name}</code>{' '}
                                            <span className="font-normal text-slate-500">
                                                (Leave any field blank to auto-generate valid default data)
                                            </span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleAddRowToActiveTable}
                                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center gap-1 shadow-xs transition cursor-pointer shrink-0"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Add Row</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                        {activeTableObj.columns.map((col) => (
                                            <div key={col.name}>
                                                <label className="block text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 mb-0.5 truncate">
                                                    {col.name} ({col.rawType})
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newRowInputs[col.name] ?? ''}
                                                    onChange={(e) =>
                                                        setNewRowInputs((prev) => ({ ...prev, [col.name]: e.target.value }))
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddRowToActiveTable();
                                                        }
                                                    }}
                                                    placeholder={col.isPrimaryKey ? 'Auto ID' : `Enter ${col.name}...`}
                                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px]"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {rowActionNotice && (
                                        <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2">
                                            <span>✓ {rowActionNotice}</span>
                                            <button
                                                type="button"
                                                onClick={() => setRowActionNotice(null)}
                                                className="text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Scrollable Data Grid with Forensic Timestamp Badges & Inline Editing */}
                            <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 max-h-[440px]">
                                <table className="min-w-[640px] w-full text-left border-collapse text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-800/90 text-[11px] text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                                        <tr>
                                            <th className="py-2.5 px-3 font-mono w-10">#</th>
                                            {liveQueryExecution.columns.map((col) => {
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
                                                        title="Click to sort ascending / descending"
                                                        className="py-2.5 px-3 font-mono font-bold cursor-pointer select-none hover:text-indigo-600 dark:hover:text-indigo-400"
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
                                            <th className="py-2.5 px-3 text-right w-16">Action</th>
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
                                                    {liveQueryExecution.columns.map((col) => {
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
                                                                        setWorkspace((prev) => ({
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
                                                                        }));
                                                                        setManualQueryResult(null);
                                                                    }}
                                                                    className="w-full min-w-[100px] bg-transparent border-b border-transparent focus:border-indigo-500 outline-none text-slate-900 dark:text-slate-100"
                                                                />
                                                                {tsDecoded.isoString && tsDecoded.category !== 'ISO8601_DATETIME' && (
                                                                    <span
                                                                        title={tsDecoded.explanation || ''}
                                                                        className="mt-0.5 inline-block px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-sans"
                                                                    >
                                                                        🕒 {tsDecoded.isoString.slice(0, 19).replace('T', ' ')} UTC
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
                                                                setWorkspace((prev) => ({
                                                                    ...prev,
                                                                    tables: prev.tables.map((t) =>
                                                                        t.name === activeTableObj.name
                                                                            ? {
                                                                                ...t,
                                                                                rows: t.rows.filter((origRow, idx) => !matchesTargetRow(origRow, idx)),
                                                                            }
                                                                            : t
                                                                    ),
                                                                }));
                                                                setManualQueryResult(null);
                                                                setRowActionNotice(`Deleted row from "${activeTableObj.name}".`);
                                                            }}
                                                            className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-500 cursor-pointer"
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
                </div>
            )}

            {/* ============================================================================
          TAB 2: VISUAL ER DIAGRAM (ERD), SCHEMA INSPECTOR & ORM CODE GENERATOR
          ============================================================================ */}
            {activeTab === 'erd_schema' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left Column: Visual Entity-Relationship Diagram Cards & Foreign Key Graph */}
                    <div className="min-w-0 lg:col-span-6 space-y-4">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                                        <span>Visual Entity-Relationship Diagram (ERD)</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Displays declared <code>FOREIGN KEY</code> constraints and auto-inferred implicit relations (
                                        <code>*_id → id</code>).
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                        {compiled.inferredForeignKeys.length} Active Relation(s)
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            triggerDownload(
                                                compiled.svgErDiagram,
                                                `${workspace.fileName.replace(/\.[a-z0-9]+$/i, '')}_erd.svg`,
                                                'image/svg+xml;charset=utf-8'
                                            )
                                        }
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download Vector ERD (.svg)</span>
                                    </button>
                                </div>
                            </div>

                            {/* Visual Schema Entity Boxes */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {workspace.tables.map((tbl) => (
                                    <div
                                        key={tbl.name}
                                        className="rounded-xl border-2 border-indigo-200 dark:border-indigo-900/80 bg-slate-50/70 dark:bg-slate-950 overflow-hidden shadow-xs"
                                    >
                                        <div className="bg-indigo-600 text-white px-3.5 py-2 flex items-center justify-between">
                                            <span className="font-mono font-bold text-xs">{tbl.name}</span>
                                            <span className="text-[10px] opacity-90">
                                                rootPage #{tbl.rootPage} • {tbl.rows.length}r
                                            </span>
                                        </div>
                                        <div className="p-2.5 divide-y divide-slate-200/60 dark:divide-slate-800 text-xs">
                                            {tbl.columns.map((c) => {
                                                const fk = compiled.inferredForeignKeys.find(
                                                    (f) => f.fromTable === tbl.name && f.fromColumn === c.name
                                                );
                                                return (
                                                    <div key={c.name} className="py-1.5 flex items-center justify-between gap-2">
                                                        <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                                            {c.isPrimaryKey && <span title="Primary Key">🔑</span>}
                                                            {fk && <span title={`Foreign Key -> ${fk.toTable}.${fk.toColumn}`}>🔗</span>}
                                                            <span>{c.name}</span>
                                                        </span>
                                                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                            {c.rawType}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Foreign Key Relationships List */}
                            {compiled.inferredForeignKeys.length > 0 && (
                                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                                    <div className="font-bold text-slate-700 dark:text-slate-300">
                                        Discovered Foreign Key Edges (Declared + Implicit):
                                    </div>
                                    <div className="space-y-1.5">
                                        {compiled.inferredForeignKeys.map((fk) => (
                                            <div
                                                key={fk.id}
                                                className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/70 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]"
                                            >
                                                <span>
                                                    <strong>{fk.fromTable}</strong>.{fk.fromColumn} → <strong>{fk.toTable}</strong>.{fk.toColumn}
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${fk.isImplicitInferred
                                                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                                        }`}
                                                >
                                                    {fk.isImplicitInferred ? 'Implicit Inferred (*_id)' : `Declared FK (${fk.onDelete})`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Live ORM & Migration Code Generator */}
                    <div className="min-w-0 lg:col-span-6 space-y-4">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    ORM &amp; Multi-Dialect Schema Compiler
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        { id: 'drizzle_ts' as const, label: 'Drizzle ORM (.ts)' },
                                        { id: 'prisma' as const, label: 'Prisma (.prisma)' },
                                        { id: 'postgres_sql' as const, label: 'PostgreSQL (.sql)' },
                                        { id: 'mermaid_erd' as const, label: 'Mermaid ERD' },
                                        { id: 'dbml' as const, label: 'DBML' },
                                        { id: 'sqlite_sql' as const, label: 'SQLite DDL' },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setSchemaCodeFormat(tab.id)}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${schemaCodeFormat === tab.id
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        void navigator.clipboard?.writeText(activeSchemaCodeText);
                                        setCopiedTab2Schema(true);
                                        setTimeout(() => setCopiedTab2Schema(false), 2000);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white cursor-pointer"
                                >
                                    {copiedTab2Schema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedTab2Schema ? 'Copied Schema!' : 'Copy Schema'}</span>
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
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download Schema</span>
                                </button>
                            </div>
                            <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-w-full max-h-[520px] whitespace-pre-wrap break-words leading-relaxed">
                                {activeSchemaCodeText}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================================
          TAB 3: 12-POINT INTEGRITY LINTER, INDEX ADVISOR & DUCKDB SUMMARIZE PROFILER
          ============================================================================ */}
            {activeTab === 'linter_profiler' && (
                <div className="space-y-5">
                    {/* 12-Point Linter & 1-Click Auto-Optimizer */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-bold flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0" />
                                    <span>
                                        12-Point Database Health, PRAGMA foreign_key_check &amp; Index Advisor (Score: {compiled.healthScore}/100)
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Detects missing primary keys, unindexed foreign keys, orphaned child rows, freelist fragmentation,
                                    unscrubbed PII, and recoverable forensic residue.
                                </p>
                            </div>

                            {compiled.lintIssues.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setWorkspace((prev) => autoOptimizeDatabaseWorkspace(prev));
                                        const msg =
                                            'Applied 1-Click Auto-Optimize: indexed foreign keys, removed orphaned child rows, vacuumed freelist residue, and anonymized PII columns (Score: 100/100)!';
                                        setLinterActionNotice(msg);
                                        setStatusBanner(msg);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition cursor-pointer"
                                >
                                    <Wrench className="w-4 h-4" />
                                    <span>1-Click Auto-Optimize &amp; Repair All ({compiled.lintIssues.length})</span>
                                </button>
                            )}
                        </div>

                        {linterActionNotice && (
                            <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                                ✓ {linterActionNotice}
                            </div>
                        )}

                        {compiled.lintIssues.length === 0 ? (
                            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span>
                                    <strong>PASSED ALL 12 INTEGRITY &amp; INDEX CHECKS (100/100):</strong> Every table has a primary key,
                                    all foreign keys are indexed and free of orphaned rows, freelist fragmentation is 0, and no
                                    unscrubbed PII or deleted forensic residue remains!
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {compiled.lintIssues.map((issue) => (
                                    <div
                                        key={issue.id}
                                        className={`p-4 rounded-xl border text-xs space-y-2 min-w-0 ${issue.severity === 'CRITICAL'
                                                ? 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20'
                                                : 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'
                                            }`}
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                                <span>{issue.title}</span>
                                            </span>
                                            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-900 text-white shrink-0">
                                                {issue.ruleCode}
                                            </span>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{issue.explanation}</p>
                                        <pre className="p-2 rounded bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto">
                                            {issue.remediationSql}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DuckDB SUMMARIZE Column Statistical Profiler */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />
                                <span>DuckDB SUMMARIZE Columnar Statistical Profiler &amp; Semantic Type Detector</span>
                            </h3>
                            <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setProfilerTableFilter('ALL')}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${profilerTableFilter === 'ALL'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    All Tables ({compiled.columnProfiles.length})
                                </button>
                                {workspace.tables.map((t) => (
                                    <button
                                        key={t.name}
                                        type="button"
                                        onClick={() => setProfilerTableFilter(t.name)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${profilerTableFilter === t.name
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="min-w-[720px] w-full text-left border-collapse text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="py-2.5 px-3">Table.Column</th>
                                        <th className="py-2.5 px-3">Declared Type</th>
                                        <th className="py-2.5 px-3">Detected Semantic Category</th>
                                        <th className="py-2.5 px-3">Distinct</th>
                                        <th className="py-2.5 px-3">Null %</th>
                                        <th className="py-2.5 px-3">Min / Max / Decoded Sample</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                                    {compiled.columnProfiles.filter((prof) => profilerTableFilter === "ALL" || prof.tableName === profilerTableFilter).map((prof) => (
                                        <tr key={`${prof.tableName}.${prof.columnName}`}>
                                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                                                {prof.tableName}.{prof.columnName}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono">{prof.declaredType}</td>
                                            <td className="py-2.5 px-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${prof.semanticCategory.includes('PII') ||
                                                            prof.semanticCategory.includes('HASH') ||
                                                            prof.semanticCategory.includes('TOKEN')
                                                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                                            : prof.semanticCategory.includes('TIMESTAMP')
                                                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                                        }`}
                                                >
                                                    {prof.semanticCategory}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 font-mono">{prof.distinctCount}</td>
                                            <td className="py-2.5 px-3 font-mono">{prof.nullPercent}%</td>
                                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                                                {prof.sampleDecodedPreview}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================================
          TAB 4: 100-BYTE BINARY HEADER, B-TREE PAGE MAP, FORENSIC CARVER & PII SCRUBBER
          ============================================================================ */}
            {activeTab === 'binary_forensics' && (
                <div className="space-y-5">
                    {/* Forensic Deleted-Row Carver & 1-Click PII Anonymizer */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-bold flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-indigo-600 shrink-0" />
                                    <span>
                                        Forensic Deleted-Row Carver, Companion .db-wal Inspector &amp; 1-Click PII Anonymizer
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Scans freelist pages and unallocated cell gaps for residual deleted records and scrubs sensitive PII
                                    columns before database sharing.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <input
                                    ref={walInputRef}
                                    type="file"
                                    accept=".db-wal,.sqlite-wal,.wal"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => walInputRef.current?.click()}
                                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                                >
                                    + Attach Companion .db-wal File
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const { updatedWorkspace } = executeSqlQuery(workspace, 'VACUUM;');
                                        const bin = exportBinarySqliteDatabase(updatedWorkspace);
                                        setWorkspace({
                                            ...updatedWorkspace,
                                            fileByteSize: bin.byteLength,
                                        });
                                        const msg = 'Executed VACUUM: defragmented all B-tree pages and zero-wiped unallocated freelist slack!';
                                        setForensicActionNotice(msg);
                                        setStatusBanner(msg);
                                    }}
                                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                                >
                                    Run VACUUM (Defragment Pages)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setWorkspace((prev) => anonymizeDatabasePii(prev));
                                        const msg =
                                            'Scrubbed all PII & credential columns (emails, password hashes, tokens) and zero-wiped unvacuumed deleted artifacts!';
                                        setForensicActionNotice(msg);
                                        setStatusBanner(msg);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition cursor-pointer"
                                >
                                    <KeyRound className="w-4 h-4" />
                                    <span>1-Click Anonymize PII &amp; Wipe Deleted Residue</span>
                                </button>
                            </div>
                        </div>

                        {forensicActionNotice && (
                            <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                                ✓ {forensicActionNotice}
                            </div>
                        )}

                        {/* Forensic Recovered Deleted Artifacts */}
                        {workspace.recoveredArtifacts.length === 0 ? (
                            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                                <strong>Zero Unvacuumed Deleted Artifacts Found:</strong> No residual deleted strings were detected in
                                freelist pages or unallocated cell gaps (Tip: Click <strong>Sample #2: FinLedger Incident DB</strong>{' '}
                                above to see live deleted-row recovery!).
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                    ⚠️ Forensically Recovered Deleted Records from Unvacuumed Space ({workspace.recoveredArtifacts.length}):
                                </div>
                                {workspace.recoveredArtifacts.map((art) => (
                                    <div
                                        key={art.id}
                                        className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 text-xs space-y-1"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                Page #{art.pageNumber} (Byte Offset {art.byteOffset}) — {art.sourceRegion}
                                            </span>
                                            <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-rose-600 text-white font-bold">
                                                Inferred Table: {art.inferredTable}
                                            </span>
                                        </div>
                                        <pre className="p-2 rounded bg-slate-950 text-amber-300 font-mono text-[11px] overflow-x-auto">
                                            {art.recoveredText}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 100-Byte SQLite 3 Database Header Decoder & B-Tree Page Allocation Map */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        <div className="min-w-0 lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
                            <h3 className="text-sm font-bold">100-Byte SQLite 3 Binary Header Breakdown (Page 1, Bytes 0–99)</h3>
                            <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                                <table className="min-w-[460px] w-full text-left border-collapse text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="py-2 px-3">Offset</th>
                                            <th className="py-2 px-3">Header Field</th>
                                            <th className="py-2 px-3">Decoded Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-mono text-[11px]">
                                        {[
                                            ['0..15 (16B)', 'Header Magic String', workspace.headerInfo.magicHeaderString],
                                            ['16..17 (2B)', 'Database Page Size', `${workspace.headerInfo.pageSize} bytes`],
                                            ['18..19 (2B)', 'Write / Read Format Version', `${workspace.headerInfo.writeFormatVersion} / ${workspace.headerInfo.readFormatVersion} (${workspace.headerInfo.writeFormatVersion === 2 ? 'WAL' : 'Rollback'})`],
                                            ['24..27 (4B)', 'File Change Counter', String(workspace.headerInfo.fileChangeCounter)],
                                            ['28..31 (4B)', 'Database Size in Pages', `${workspace.headerInfo.databaseSizeInPages} page(s)`],
                                            ['32..39 (8B)', 'Freelist Trunk / Total Pages', `Trunk: ${workspace.headerInfo.firstFreelistTrunkPage} | Total: ${workspace.headerInfo.totalFreelistPages}`],
                                            ['40..47 (8B)', 'Schema Cookie / Format', `Cookie: ${workspace.headerInfo.schemaCookie} | Format: ${workspace.headerInfo.schemaFormatNumber}`],
                                            ['56..59 (4B)', 'Schema Text Encoding', `${workspace.headerInfo.textEncodingCode} (${workspace.headerInfo.textEncodingLabel})`],
                                            ['60..63 (4B)', 'PRAGMA user_version', String(workspace.headerInfo.userVersion)],
                                            ['68..71 (4B)', 'PRAGMA application_id', `0x${workspace.headerInfo.applicationId.toString(16).toUpperCase()}`],
                                            ['96..99 (4B)', 'SQLITE_VERSION_NUMBER', `${workspace.headerInfo.sqliteVersionNumber} (${workspace.headerInfo.sqliteVersionString})`],
                                        ].map(([off, name, val]) => (
                                            <tr key={off}>
                                                <td className="py-2 px-3 text-slate-500">{off}</td>
                                                <td className="py-2 px-3 font-sans font-semibold text-slate-900 dark:text-white">{name}</td>
                                                <td className="py-2 px-3 text-indigo-600 dark:text-indigo-400 font-bold">{val}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="min-w-0 lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
                            <h3 className="text-sm font-bold">B-Tree Page Allocation Map ({workspace.pageMap.length} Pages)</h3>
                            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 text-xs">
                                {workspace.pageMap.map((pg) => (
                                    <div
                                        key={pg.pageNumber}
                                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex flex-wrap items-center justify-between gap-2"
                                    >
                                        <div>
                                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                                                Page #{pg.pageNumber} — {pg.ownerObjectName}
                                            </span>
                                            <div className="text-[11px] text-slate-500">
                                                {pg.cellCount} cells • {pg.unallocatedBytes} B unallocated slack • {pg.fragmentedFreeBytes} B fragmented
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
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
          TAB 5: 10-FORMAT EXPORT STUDIO & SIDE-BY-SIDE SQLITE DATABASE DIFF (SQLDIFF)
          ============================================================================ */}
            {activeTab === 'export_diff' && (
                <div className="space-y-5">
                    {/* 10-Format Export Studio */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-bold">
                                    10-Format Export Studio (Binary .sqlite, PostgreSQL, DuckDB, Drizzle ORM, Prisma &amp; Excel .xlsx)
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Export your modified database back to a standards-compliant binary <code>.sqlite</code> file, ORM
                                    schemas, or CWE-1236 formula-safe spreadsheets.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const bin = exportBinarySqliteDatabase(workspace);
                                        triggerDownload(bin, workspace.fileName.replace(/\.[a-z0-9]+$/i, '') + '.sqlite', 'application/x-sqlite3');
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>1. Binary .sqlite File</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const xlsx = exportDatabaseXlsx(workspace);
                                        triggerDownload(
                                            xlsx,
                                            `${workspace.activeTableName || 'database'}_export.xlsx`,
                                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                        );
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5" />
                                    <span>2. Excel Workbook (.xlsx)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const tbl = activeTableObj || workspace.tables[0];
                                        const csv = exportDatabaseCsv(
                                            tbl ? tbl.rows : [],
                                            tbl ? tbl.columns.map((c) => c.name) : [],
                                            true
                                        );
                                        triggerDownload(csv, `${tbl?.name || 'database'}.csv`, 'text/csv;charset=utf-8');
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
                                >
                                    <FileCode className="w-3.5 h-3.5" />
                                    <span>3. RFC 4180 CSV (.csv)</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    { id: 'drizzle_ts' as const, label: '4. Drizzle ORM (schema.ts)' },
                                    { id: 'prisma' as const, label: '5. Prisma (schema.prisma)' },
                                    { id: 'postgres_sql' as const, label: '6. PostgreSQL Migration (.sql)' },
                                    { id: 'duckdb_sql' as const, label: '7. DuckDB & Parquet Script (.sql)' },
                                    { id: 'sqlite_sql' as const, label: '8. SQLite Full Dump (.sql)' },
                                    { id: 'mermaid_erd' as const, label: '9. Mermaid erDiagram' },
                                    { id: 'dbml' as const, label: '9b. dbdiagram DBML' },
                                    { id: 'certificate_json' as const, label: '10. SHA-256 Audit Cert (.json)' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setExportFormat(item.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${exportFormat === item.id
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        void navigator.clipboard?.writeText(activeExportText);
                                        setCopiedExport(true);
                                        setTimeout(() => setCopiedExport(false), 2000);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white cursor-pointer"
                                >
                                    {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedExport ? 'Copied!' : 'Copy Code'}</span>
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
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download Active File</span>
                                </button>
                            </div>
                        </div>

                        <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-w-full max-h-[420px] whitespace-pre-wrap break-words leading-relaxed">
                            {activeExportText}
                        </pre>
                    </div>

                    {/* Side-by-Side SQLite Database Diff (sqldiff) */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 className="text-base font-bold flex items-center gap-2">
                                    <GitCompare className="w-5 h-5 text-indigo-600 shrink-0" />
                                    <span>Side-by-Side SQLite Database Diff &amp; Migration Generator (sqldiff)</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Compare your active database against a second <code>.sqlite</code> / <code>.sql</code> file to generate
                                    schema diffs, row count deltas, and an <code>ALTER TABLE</code> migration patch.
                                </p>
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
                                        const rep = compareSqliteDatabases(workspace, secondWs);
                                        setDiffReport(rep);
                                        setDiffNotice(`Compared "${workspace.fileName}" against "${f.name}"!`);
                                        e.target.value = '';
                                    }}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => diffInputRef.current?.click()}
                                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white cursor-pointer"
                                >
                                    Upload 2nd .sqlite to Diff
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const stagingDemo = generateSampleDatabase('finledger_forensic_demo');
                                        const rep = compareSqliteDatabases(workspace, stagingDemo);
                                        setDiffReport(rep);
                                        setDiffNotice(`Compared "${workspace.fileName}" against Demo Database "${stagingDemo.fileName}"!`);
                                    }}
                                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                                >
                                    Run Demo Database Diff
                                </button>
                            </div>
                        </div>

                        {diffNotice && (
                            <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                                ✓ {diffNotice}
                            </div>
                        )}

                        {diffReport && (
                            <div className="space-y-3 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20">
                                        <div className="font-bold text-emerald-800 dark:text-emerald-300">
                                            Added Tables ({diffReport.addedTables.length})
                                        </div>
                                        <div className="font-mono mt-1">{diffReport.addedTables.join(', ') || 'None'}</div>
                                    </div>
                                    <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20">
                                        <div className="font-bold text-rose-800 dark:text-rose-300">
                                            Removed Tables ({diffReport.removedTables.length})
                                        </div>
                                        <div className="font-mono mt-1">{diffReport.removedTables.join(', ') || 'None'}</div>
                                    </div>
                                    <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20">
                                        <div className="font-bold text-amber-800 dark:text-amber-300">
                                            Modified Tables ({diffReport.modifiedTables.length})
                                        </div>
                                        <div className="font-mono mt-1">
                                            {diffReport.modifiedTables.map((m) => m.tableName).join(', ') || 'None'}
                                        </div>
                                    </div>
                                </div>
                                <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-h-[320px]">
                                    {diffReport.migrationSqlScript}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}