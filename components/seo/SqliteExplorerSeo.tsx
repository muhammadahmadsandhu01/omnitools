import React from 'react';
import Link from 'next/link';
import {
    Database,
    ShieldCheck,
    Layers,
    AlertTriangle,
    Terminal,
    HelpCircle,
    Sparkles,
    FileSpreadsheet,
    Cpu,
    Search,
    Code2,
    HardDrive,
} from 'lucide-react';

export interface FaqItem {
    question: string;
    answer: string;
}

export const SQLITE_EXPLORER_FAQS: FaqItem[] = [
    {
        question: 'How does KivaroTools open and query .sqlite and .db files in the browser without uploading them?',
        answer:
            'KivaroTools parses the official SQLite 3 binary file format ("SQLite format 3\\0" magic header, 100-byte database header on Page 1, interior and leaf table/index B-tree pages 0x05/0x0d/0x02/0x0a, Huffman varint cell pointers, record serial types, and overflow chains) directly in browser memory using pure TypeScript. Your database files never leave your computer.',
    },
    {
        question: 'Are my SQLite, DuckDB, or SQL files uploaded to any external server?',
        answer:
            'No. Your selected database files (.sqlite, .db, .sqlite3, .db-wal, .duckdb, .sql, .csv) are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources.',
    },
    {
        question: 'Why does KivaroTools work offline and under strict corporate CSP when other sql.js or DuckDB-WASM viewers fail?',
        answer:
            'Many browser SQLite viewers fetch external WebAssembly (.wasm) binaries from third-party CDNs or download 35 MB+ Pyodide runtimes (such as Datasette Lite), which fail behind enterprise Content-Security-Policy (CSP) rules or air-gapped networks. KivaroTools embeds a self-contained binary B-tree parser, serializer, and SQL/DuckDB analytical execution engine with zero external CDN dependencies.',
    },
    {
        question: 'Can I edit cells, insert new rows, run UPDATE/DELETE queries, and save a new binary .sqlite file?',
        answer:
            'Yes. Unlike read-only web viewers (such as sqliteviewer.app, which restricts editing to a paid desktop/IDE license), KivaroTools lets you edit cells inline in the data grid, insert new rows with 1 click, run INSERT, UPDATE, DELETE, and CREATE TABLE statements, and download a standards-compliant binary .sqlite file that passes PRAGMA integrity_check.',
    },
    {
        question: 'What DuckDB analytical SQL commands are supported alongside standard SQLite syntax?',
        answer:
            'In addition to standard SQLite SELECT, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, EXPLAIN QUERY PLAN, and PRAGMA commands, the query runner supports DuckDB analytical commands including SUMMARIZE <table_name> (computing min, max, approx_unique, avg, count, and null_percentage across all columns), DESCRIBE <table_name>, SELECT * EXCLUDE (col1, col2), and GROUP BY ALL.',
    },
    {
        question: 'How does the Visual Entity-Relationship Diagram (ERD) discover relationships when FOREIGN KEY constraints are missing?',
        answer:
            'In many production SQLite databases (including mobile apps and Drizzle/Prisma projects), developers omit explicit FOREIGN KEY REFERENCES clauses in CREATE TABLE. Our engine plots both declared FOREIGN KEY constraints (solid lines) and auto-inferred implicit foreign keys matching naming conventions such as user_id -> users.id or organization_id -> organizations.id (dashed lines), and exports diagrams to Mermaid erDiagram and dbdiagram.io DBML.',
    },
    {
        question: 'Why can PRAGMA integrity_check return "ok" even when a SQLite database has broken foreign keys?',
        answer:
            'In SQLite, PRAGMA integrity_check only verifies internal B-tree page pointers, cell offsets, and index consistency; it does not check referential integrity. If PRAGMA foreign_keys was OFF during an import or DELETE, child rows can point to non-existent parent rows. Our 12-Point Linter runs PRAGMA foreign_key_check automatically (Rule SQLITE-003_ORPHANED_FOREIGN_KEY_ROWS) and repairs orphaned records in 1 click.',
    },
    {
        question: 'Why does the 12-Point Linter flag unindexed foreign key columns in SQLite?',
        answer:
            'Unlike primary keys, SQLite does NOT automatically create a secondary B-tree index on FOREIGN KEY columns. Whenever you JOIN a child table to its parent or delete a parent row, SQLite must perform a full table scan (SCAN TABLE) of the child table unless an explicit CREATE INDEX exists. Rule SQLITE-002_UNINDEXED_FOREIGN_KEY detects every unindexed foreign key and generates the exact CREATE INDEX statement.',
    },
    {
        question: 'How does the Forensic Deleted-Row Carver recover deleted records from a SQLite file?',
        answer:
            'When rows are deleted via DELETE FROM in SQLite (without PRAGMA secure_delete = ON or a subsequent VACUUM), SQLite simply moves whole empty pages to the freelist or marks cell byte ranges as unallocated freeblocks inside active leaf pages (0x0d). Tab 4 scans freelist trunk/leaf pages and unallocated cell gaps to carve residual UTF-8 strings and deleted records—and lets you run a 1-click VACUUM to permanently wipe them.',
    },
    {
        question: 'How do I inspect a SQLite Write-Ahead Log (.db-wal) file?',
        answer:
            'In Tab 4 (100-Byte Header, Freelist & PII Scrubber), click "+ Attach Companion .db-wal File" or upload any .db-wal file. The engine decodes the 32-byte WAL header (magic number 0x377f0682 or 0x377f0683, page size, checkpoint sequence number, salt-1, and salt-2) and inspects all 24-byte frame headers to list modified page numbers.',
    },
    {
        question: 'How does automatic Forensic Timestamp Decoding work for Chrome History and iOS sms.db files?',
        answer:
            'Forensic SQLite artifacts store timestamps in non-standard integer epochs: Chromium browsers (Chrome, Edge, Brave History and Cookies) store microseconds since January 1, 1601 UTC (WebKit timestamps around 1.34e16), while Apple iOS/macOS databases (sms.db, chat.db, CallHistory) store seconds or nanoseconds since January 1, 2001 UTC (CoreData timestamps). Our grid and column profiler automatically detect WebKit, CoreData, and Unix timestamps and display human-readable ISO-8601 UTC badges.',
    },
    {
        question: 'Can I convert a SQLite database into Drizzle ORM, Prisma, or PostgreSQL migration code?',
        answer:
            'Yes. Open Tab 2 (Visual ER Diagram & ORM Code) or Tab 5 (10-Format Export Studio) to compile your SQLite tables, column affinities, primary keys, and foreign keys into Drizzle ORM TypeScript (sqliteTable), Prisma (schema.prisma), or PostgreSQL 16+ DDL (mapping INTEGER PRIMARY KEY to BIGSERIAL, JSON strings to JSONB, and timestamps to TIMESTAMPTZ).',
    },
    {
        question: 'How do I anonymize sensitive PII and passwords in a .sqlite file before sharing it?',
        answer:
            'In Tab 4, click "1-Click Anonymize PII & Wipe Deleted Residue". The engine scans all columns for emails, bcrypt/argon2 password hashes, JWT/API tokens, Luhn credit card PANs, phone numbers, and national IDs, deterministically replacing them with safe dummy values (such as user_001@redacted.example and [REDACTED_PASSWORD_HASH_01]) while preserving primary/foreign key relationships.',
    },
    {
        question: 'Can I compare two SQLite databases side-by-side in the browser (sqldiff)?',
        answer:
            'Yes. In Tab 5, click "Upload 2nd .sqlite to Diff" (or test with "Run Demo Database Diff") to compare two SQLite databases side-by-side—identifying added tables, dropped tables, altered columns, row count deltas, and generating a runnable ALTER TABLE migration SQL script.',
    },
    {
        question: 'What is stored in the 100-byte header at the beginning of every SQLite 3 file?',
        answer:
            'Bytes 0–99 of Page 1 contain the 100-byte SQLite 3 database header defined by sqlite.org/fileformat.html: the 16-byte magic string ("SQLite format 3\\0"), page size (offset 16), WAL write/read format versions (offsets 18–19), file change counter (offset 24), total page count (offset 28), first freelist trunk page and freelist page count (offsets 32–39), schema cookie and format (offsets 40–47), text encoding UTF-8/UTF-16 (offset 56), user_version (offset 60), application_id (offset 68), and SQLITE_VERSION_NUMBER (offset 96).',
    },
    {
        question: 'Can I export SQLite tables or query results to Microsoft Excel (.xlsx) and CSV?',
        answer:
            'Yes. Click "Excel Workbook (.xlsx)" or "RFC 4180 CSV (.csv)" in Tab 5 (or "Export CSV" in Tab 1) to download spreadsheet exports protected by OWASP CWE-1236 formula injection guards.',
    },
];

export default function SqliteExplorerSeo() {
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: SQLITE_EXPLORER_FAQS.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    const howToSchema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to Open, Query, Inspect, and Convert a SQLite or DuckDB Database File Online',
        description:
            'Step-by-step guide to opening .sqlite, .db, .db-wal, and .sql files locally in your browser, running SQLite and DuckDB SUMMARIZE queries, visualizing ER diagrams, carving deleted freelist rows, and exporting to Drizzle, Prisma, PostgreSQL, or Excel.',
        step: [
            {
                '@type': 'HowToStep',
                position: 1,
                name: 'Open a Local .sqlite / .db File or Load a 1-Click Sample Database',
                text: 'Drop any .sqlite, .db, .sqlite3, .db-wal, .duckdb, .sql, or .csv file into the browser workbench, or click one of the 3 built-in sample databases (CloudScale SaaS DB, FinLedger Forensic Demo, or Chrome/iOS Artifact DB).',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Run SQLite & DuckDB Analytical Queries and Edit Rows Inline',
                text: 'Use Tab 1 to run standard SQLite queries (JOIN, GROUP BY, EXPLAIN QUERY PLAN, PRAGMA) or DuckDB commands (SUMMARIZE, DESCRIBE, SELECT * EXCLUDE), edit cells inline, or insert new rows.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Inspect Visual ER Diagrams, 12-Point Integrity Linter & Binary Forensics',
                text: 'Explore declared and implicit foreign keys in Tab 2, run the 12-Point Index & Foreign-Key Linter in Tab 3, and inspect the 100-byte binary header, B-tree page map, and deleted freelist records in Tab 4.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Export to Binary .sqlite, Drizzle ORM, Prisma, PostgreSQL, or Excel (.xlsx)',
                text: 'Open Tab 5 to download your modified binary .sqlite database, Drizzle/Prisma/PostgreSQL schemas, CWE-1236 safe .xlsx/.csv spreadsheets, or run a side-by-side database diff (sqldiff).',
            },
        ],
    };

    return (
        <article className="mt-16 w-full min-w-0 max-w-full overflow-x-hidden space-y-12 text-slate-700 dark:text-slate-300">
            {/* Structured Data Scripts (FAQPage & HowTo) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />

            {/* ============================================================================
          SECTION 1: EXECUTIVE OVERVIEW & ZERO-CDN BINARY B-TREE ARCHITECTURE
          ============================================================================ */}
            <section
                aria-labelledby="sqlite-explorer-architecture-overview"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2
                        id="sqlite-explorer-architecture-overview"
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
                    >
                        Client-Side SQLite 3 &amp; DuckDB Database Explorer, Visual ERD &amp; Binary B-Tree Forensic Studio
                    </h2>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shrink-0">
                        <Sparkles className="h-3.5 w-3.5" />
                        Zero-CDN Binary B-Tree + DuckDB SQL
                    </span>
                </div>

                <p className="mt-3 w-full text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Open, query, edit, compare, and forensically inspect <strong>SQLite 3 (<code>.sqlite</code>, <code>.db</code>, <code>.sqlite3</code>)</strong>,{' '}
                    <strong>Write-Ahead Logs (<code>.db-wal</code>)</strong>, <strong>DuckDB catalogs</strong>, and{' '}
                    <strong>SQL dumps (<code>.sql</code>)</strong> 100% locally in your browser. Execute standard SQLite queries
                    alongside DuckDB analytical commands (<code>SUMMARIZE</code>, <code>DESCRIBE</code>,{' '}
                    <code>SELECT * EXCLUDE</code>, <code>GROUP BY ALL</code>), visualize declared and implicit foreign keys on an
                    interactive Entity-Relationship Diagram (ERD), recover deleted records from freelist space, and compile schemas
                    into <strong>Drizzle ORM</strong>, <strong>Prisma</strong>, and <strong>PostgreSQL 16+</strong>.
                </p>

                <blockquote className="p-4 my-6 bg-indigo-50/80 border-l-4 border-indigo-600 rounded-r-xl dark:bg-slate-800/80 not-italic">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
                        <strong>Local Browser Processing &amp; Privacy Disclosure:</strong> Your selected database files (
                        <code>.sqlite</code>, <code>.db</code>, <code>.db-wal</code>, <code>.duckdb</code>, <code>.sql</code>) are
                        processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load
                        general analytics or other third-party website resources.
                    </p>
                </blockquote>

                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    <p>
                        SQLite is the most widely deployed database engine in the world—powering edge databases like{' '}
                        <strong>Cloudflare D1</strong> and <strong>Turso (libSQL)</strong>, local-first web and mobile applications (
                        <strong>Expo SQLite</strong>, <strong>React Native</strong>, <strong>Electron</strong>), and operating
                        system artifacts (Chrome <code>History</code>, Firefox <code>places.sqlite</code>, iOS <code>sms.db</code>,
                        and WhatsApp <code>msgstore.db</code>). Yet inspecting a <code>.sqlite</code> file in the browser has
                        historically forced developers into painful compromises.
                    </p>
                    <p>
                        Traditional web viewers are either <strong>strictly read-only</strong> (locking inline editing and exports
                        behind paid subscriptions), rely on external CDN WebAssembly fetches that break under corporate
                        Content-Security-Policy (CSP) rules, ignore <code>-wal</code> files and deleted freelist records, or fail to
                        draw Entity-Relationship Diagrams when schemas omit formal <code>FOREIGN KEY</code> declarations. KivaroTools
                        solves all of these limitations inside a unified 5-tab client-side workbench.
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                            <Database className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            Read/Write SQLite + DuckDB Analytical SQL
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Run <code>SELECT</code>, <code>JOIN</code>, <code>GROUP BY ALL</code>, <code>SELECT * EXCLUDE</code>,{' '}
                            <code>SUMMARIZE</code>, and <code>EXPLAIN QUERY PLAN</code>, edit cells inline, and save a binary{' '}
                            <code>.sqlite</code> file.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                            <Layers className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            Visual ERD + Drizzle, Prisma &amp; Postgres Compiler
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Automatically maps both declared <code>FOREIGN KEY</code> constraints and implicit <code>*_id</code>{' '}
                            relations and generates Drizzle ORM, Prisma, PostgreSQL, Mermaid, and DBML code.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            <HardDrive className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            100-Byte Header, Freelist Carver &amp; PII Scrubber
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Inspects all 22 fields of the 100-byte binary header, B-tree page maps, and <code>.db-wal</code> frames,
                            carves deleted freelist rows, and scrubs PII in 1 click.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 2: COMPLETE INTERNAL WORKING STRUCTURE (5-STAGE PIPELINE)
          ============================================================================ */}
            <section
                aria-labelledby="sqlite-explorer-working-structure"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2.5 mb-2">
                    <Cpu className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="sqlite-explorer-working-structure"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Complete Working Structure: How the Client-Side Binary SQLite 3 &amp; DuckDB Engine Works
                    </h2>
                </div>
                <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    <code>lib/sqliteExplorerEngine.ts</code> executes a 5-stage deterministic binary and relational pipeline in
                    browser memory:
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                            1
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            100-Byte Header &amp; B-Tree Traversal
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Validates the <code>SQLite format 3\0</code> signature, decodes Page 1 metadata, and traverses interior (
                            <code>0x05</code>) and leaf (<code>0x0d</code>) B-tree pages and overflow chains.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                            2
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Varint Serial Type &amp; Epoch Decoding
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Decodes 9-byte Huffman varints, serial types (8-to-64-bit ints, IEEE-754 floats, UTF-8/UTF-16 text, BLOBs),
                            and WebKit 1601 / CoreData 2001 timestamps.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
                            3
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            SQLite + DuckDB Analytical Engine
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Executes relational <code>JOIN</code>, <code>GROUP BY ALL</code>, <code>SELECT * EXCLUDE</code>,{' '}
                            <code>SUMMARIZE</code>, <code>EXPLAIN QUERY PLAN</code>, and live DML/DDL mutations.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white">
                            4
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            12-Point Linter &amp; Forensic Carver
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Audits <code>PRAGMA foreign_key_check</code>, missing FK indexes, freelist bloat, and carves deleted
                            records from unvacuumed cell gaps.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                            5
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Binary .sqlite Serializer &amp; 10 Exports
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Re-serializes B-tree pages into a valid binary <code>.sqlite</code> file and compiles Drizzle, Prisma,
                            PostgreSQL, Mermaid, and CWE-1236 safe <code>.xlsx</code> files.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 3: REAL PRACTICAL EXAMPLES (SQL, ORM & FORENSIC SHOWCASES)
          ============================================================================ */}
            <section
                aria-labelledby="sqlite-explorer-real-examples"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-8"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Terminal className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <h2
                            id="sqlite-explorer-real-examples"
                            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                        >
                            Real-World Examples: DuckDB Analytical SQL, Drizzle ORM Introspection &amp; Index Optimization
                        </h2>
                    </div>
                    <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        See how KivaroTools transforms raw binary <code>.sqlite</code> files into analytical insights and modern
                        TypeScript ORM schemas:
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                        <div className="text-indigo-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                            Example 1: DuckDB Analytical Shorthand on a SQLite Table
                        </div>
                        <pre className="leading-relaxed overflow-x-auto max-w-full">{`-- 1. Profile all columns in 1 command:
SUMMARIZE orders;

-- 2. Omit bulky JSON column using EXCLUDE:
SELECT * EXCLUDE (metadata_json)
FROM orders
WHERE status = 'PAID'
ORDER BY amount_usd DESC;`}</pre>
                    </div>

                    <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                        <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                            Example 2: Auto-Generated Drizzle ORM Schema (schema.ts)
                        </div>
                        <pre className="leading-relaxed overflow-x-auto max-w-full">{`import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organization_id: integer('organization_id').notNull().references(() => organizations.id),
  full_name: text('full_name').notNull(),
  plan_tier: text('plan_tier').notNull(),
});`}</pre>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 4: 100-BYTE SQLITE 3 BINARY HEADER SPECIFICATION TABLE
          ============================================================================ */}
            <section
                aria-labelledby="sqlite-100-byte-header-spec"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="sqlite-100-byte-header-spec"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Technical Reference: The 100-Byte SQLite 3 Database Header &amp; B-Tree Page Types
                </h2>
                <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Every valid SQLite 3 database begins with a 100-byte big-endian binary header on Page 1 before the root{' '}
                    <code>sqlite_schema</code> B-tree header at byte offset <code>100</code>:
                </p>

                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[720px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Byte Offset (Size)</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Header Field Name</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Expected Values</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Forensic &amp; Performance Impact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">0..15 (16 B)</td>
                                <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">Header Magic String</td>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">53 51 4c 69 74 65 20 66 6f 72 6d 61 74 20 33 00</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">ASCII string <code>&quot;SQLite format 3\0&quot;</code> identifying a SQLite 3 binary image.</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">16..17 (2 B)</td>
                                <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">Database Page Size</td>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">512..32768 (1 = 65536)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Power of 2; modern SQLite defaults to <code>4096</code> bytes per B-tree page.</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">18..19 (2 B)</td>
                                <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">File Format Write/Read Version</td>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">1 = Rollback, 2 = WAL</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Value <code>2</code> indicates Write-Ahead Logging (<code>.db-wal</code>) mode.</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">32..39 (8 B)</td>
                                <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">Freelist Trunk &amp; Page Count</td>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">Two 32-bit uints</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Non-zero count means unvacuumed deleted pages exist and can be forensically carved.</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">56..59 (4 B)</td>
                                <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">Text Encoding</td>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">1=UTF-8, 2=UTF-16le, 3=UTF-16be</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Determines how serial type <code>&gt;=13 (odd)</code> TEXT payloads are decoded.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 5: 12-POINT DATABASE INTEGRITY & INDEX ADVISOR RULES TABLE
          ============================================================================ */}
            <section
                aria-labelledby="sqlite-12-point-linter-rules"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="sqlite-12-point-linter-rules"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        12-Point Database Health, <code>PRAGMA foreign_key_check</code> &amp; Index Advisor Rules
                    </h2>
                </div>
                <div className="w-full mt-4 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">#</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Linter Rule Code</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Severity</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">What It Detects &amp; 1-Click Auto-Optimize Remediation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {[
                                ['1', 'SQLITE-001_MISSING_PRIMARY_KEY', 'CRITICAL', 'Detects tables lacking an explicit PRIMARY KEY; adds an INTEGER PRIMARY KEY column.'],
                                ['2', 'SQLITE-002_UNINDEXED_FOREIGN_KEY', 'HIGH', 'Flags foreign key columns missing a secondary B-tree index; generates CREATE INDEX.'],
                                ['3', 'SQLITE-003_ORPHANED_FOREIGN_KEY_ROWS', 'CRITICAL', 'Runs PRAGMA foreign_key_check to catch child rows pointing to missing parent IDs.'],
                                ['4', 'SQLITE-004_IMPLICIT_FK_MISSING_CONSTRAINT', 'MEDIUM', 'Detects *_id columns matching parent tables without formal REFERENCES clauses.'],
                                ['5', 'SQLITE-005_FREELIST_VACUUM_FRAGMENTATION', 'MEDIUM', 'Flags non-zero freelist page counts and reclaims wasted space via VACUUM.'],
                                ['6', 'SQLITE-006_HIGH_CARDINALITY_UNINDEXED_FILTER', 'MEDIUM', 'Identifies high-cardinality filter columns that benefit from secondary indexing.'],
                                ['7', 'SQLITE-007_DYNAMIC_TYPE_AFFINITY_MISMATCH', 'MEDIUM', 'Detects mixed text/numeric values stored in the same column.'],
                                ['8', 'SQLITE-008_UNSCRUBBED_PII_OR_CREDENTIALS', 'HIGH', 'Detects live emails, bcrypt password hashes, JWT tokens, and card PANs before sharing.'],
                                ['9', 'SQLITE-009_SUBOPTIMAL_PAGE_SIZE_OR_LEGACY_JOURNAL', 'MEDIUM', 'Flags legacy 1024-byte page sizes and recommends 4096-byte pages with WAL mode.'],
                                ['10', 'SQLITE-010_LARGE_INLINE_TEXT_BLOB_OVERFLOW', 'MEDIUM', 'Identifies oversized inline payloads that spill into B-tree overflow page chains.'],
                                ['11', 'SQLITE-011_REDUNDANT_DUPLICATE_INDEX', 'MEDIUM', 'Finds duplicate secondary indexes covering the same column sequence.'],
                                ['12', 'SQLITE-012_RECOVERABLE_DELETED_FORENSIC_RESIDUE', 'CRITICAL', 'Detects deleted records still recoverable from freelist pages or unallocated cell gaps.'],
                            ].map(([num, codeStr, sev, desc]) => (
                                <tr key={num}>
                                    <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">{num}</td>
                                    <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-semibold border border-slate-200 dark:border-slate-700">{codeStr}</td>
                                    <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">{sev}</td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">{desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 6: COMPETITOR COMPARISON MATRIX
          ============================================================================ */}
            <section
                aria-labelledby="sqlite-explorer-competitor-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="sqlite-explorer-competitor-matrix"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Feature Comparison: KivaroTools vs. Online SQLite Viewers &amp; Desktop Tools
                </h2>
                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Capability / Feature</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-indigo-600 dark:text-indigo-400">
                                    KivaroTools SQLite &amp; DuckDB Studio
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Basic Web SQLite Viewers (sqliteviewer.app / inloop)
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Online ERD / Schema Converters
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Desktop DB Browser for SQLite
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Inline Editing + Save Binary .sqlite
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    100% Free Read/Write + Binary .sqlite Export
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                                    Read-only on web (Locked behind paid PRO)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">No data viewing</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Requires desktop OS install</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    DuckDB SUMMARIZE &amp; EXCLUDE Grammar
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Yes — Built-In Analytical SQL
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">No</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">No</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">No</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Visual ERD + Implicit FK Discovery
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Yes — Declared + Implicit (*_id) + Mermaid/DBML
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Declared FKs from text only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">No built-in ERD</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    100-Byte Header, Freelist Carver &amp; .db-wal
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Yes — Full Forensic Suite + WebKit/CoreData Timestamps
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                                    Ignores -wal and deleted freelist records
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Basic pragmas only</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Drizzle ORM, Prisma, Postgres &amp; sqldiff
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    10 Export Formats + Side-by-Side Database Diff
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Text-only conversion</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">SQLite .sql / .csv only</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 7: TROUBLESHOOTING COMMON SQLITE & DUCKDB ISSUES (6 SCENARIOS)
          ============================================================================ */}
            <section
                aria-labelledby="sqlite-explorer-troubleshooting"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="sqlite-explorer-troubleshooting"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Common SQLite &amp; Edge Database Issues and How to Fix Them
                </h2>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            1. Missing Recent Rows Because of Uncheckpointed .db-wal
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Issue:</strong> In WAL mode, recent writes live inside <code>database.db-wal</code> until a
                            checkpoint occurs. Copying only the <code>.db</code> file misses recent commits.
                            <br />
                            <strong>Fix:</strong> Run <code>PRAGMA wal_checkpoint(TRUNCATE);</code> before copying, or attach your{' '}
                            <code>.db-wal</code> file in Tab 4.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            2. Slow JOINs &amp; DELETEs on Unindexed Foreign Keys
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Issue:</strong> SQLite creates an automatic B-tree index for <code>PRIMARY KEY</code> and{' '}
                            <code>UNIQUE</code> columns, but NOT for <code>FOREIGN KEY</code> columns.
                            <br />
                            <strong>Fix:</strong> Use Tab 3 (12-Point Linter) to generate <code>CREATE INDEX</code> statements for
                            every foreign key column.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            3. Deleted Rows Still Recoverable in Shared .sqlite Files
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Issue:</strong> Running <code>DELETE FROM users</code> leaves the deleted strings sitting inside
                            freelist pages and cell freeblocks inside the binary file.
                            <br />
                            <strong>Fix:</strong> Click <strong>1-Click Anonymize PII &amp; Wipe Deleted Residue</strong> in Tab 4
                            and re-export a clean binary <code>.sqlite</code> file.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            4. PRAGMA integrity_check Passing with Orphaned Foreign Keys
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Issue:</strong> Because <code>PRAGMA foreign_keys</code> defaults to <code>OFF</code> per
                            connection in SQLite, child rows frequently reference deleted parent IDs.
                            <br />
                            <strong>Fix:</strong> Run <code>PRAGMA foreign_key_check;</code> in Tab 1 or click{' '}
                            <strong>1-Click Auto-Optimize</strong> in Tab 3.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            5. Unreadable 17-Digit Timestamps in Chrome &amp; iOS Databases
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Issue:</strong> Chrome stores microseconds since <code>1601-01-01</code> and iOS{' '}
                            <code>sms.db</code> stores nanoseconds since <code>2001-01-01</code>, which look like random 17-digit
                            integers in standard SQLite viewers.
                            <br />
                            <strong>Fix:</strong> Our data grid automatically detects and displays human-readable UTC timestamps.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            6. SQLite-to-PostgreSQL Migration Failing on Dynamic Types
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Issue:</strong> Raw SQLite <code>.dump</code> scripts use <code>AUTOINCREMENT</code> and store
                            JSON/timestamps as plain <code>TEXT</code>, which fails or loses indexing in PostgreSQL.
                            <br />
                            <strong>Fix:</strong> Export the <strong>PostgreSQL Migration (.sql)</strong> in Tab 5, which maps columns
                            to <code>BIGSERIAL</code>, <code>JSONB</code>, and <code>TIMESTAMPTZ</code>.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 8: SEARCH INTENT & WORKFLOW COVERAGE (32 TARGET KEYWORDS)
          ============================================================================ */}
            <section
                aria-labelledby="sqlite-explorer-keyword-coverage"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Search className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="sqlite-explorer-keyword-coverage"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Supported SQLite 3, DuckDB, ERD, Forensics &amp; Migration Workflows
                    </h2>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            In-Browser SQLite &amp; DuckDB Explorer (11 Workflows)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>sqlite viewer online</li>
                            <li>open sqlite file online no upload</li>
                            <li>in-browser duckdb and sqlite explorer</li>
                            <li>view .db and .sqlite3 files in browser</li>
                            <li>edit sqlite database online and save</li>
                            <li>sql.js and sqlite-wasm browser ide</li>
                            <li>duckdb summarize table profiler online</li>
                            <li>cloudflare d1 and turso sqlite explorer</li>
                            <li>expo sqlite and react native db viewer</li>
                            <li>csv and json to sqlite database maker</li>
                            <li>convert sqlite to csv and jsonl free</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            ERD, ORM Code &amp; Database Migration (11 Workflows)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>sqlite erd diagram generator online</li>
                            <li>generate mermaid erd from sqlite file</li>
                            <li>convert sqlite to postgresql online</li>
                            <li>sqlite to drizzle orm schema generator</li>
                            <li>sqlite to prisma schema converter</li>
                            <li>compare two sqlite databases online</li>
                            <li>sqlite schema diff and migration tool</li>
                            <li>sqlite pragma integrity_check online</li>
                            <li>sqlite foreign key violation checker</li>
                            <li>sqlite explain query plan visualizer</li>
                            <li>sqlite missing index advisor online</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            Binary B-Tree Forensics, WAL &amp; PII Scrubbing (10 Workflows)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>sqlite wal file viewer and analyzer</li>
                            <li>recover deleted rows sqlite freelist</li>
                            <li>sqlite 100 byte header analyzer online</li>
                            <li>sqlite b-tree page allocation viewer</li>
                            <li>anonymize sqlite database pii online</li>
                            <li>sqlite vacuum and freelist cleaner</li>
                            <li>convert sqlite to excel xlsx online</li>
                            <li>chrome history and places.sqlite viewer</li>
                            <li>ios sms.db and whatsapp msgstore viewer</li>
                            <li>client-side sqlite forensic studio</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 9: FREQUENTLY ASKED QUESTIONS (16 INTERACTIVE ACCORDIONS)
          ============================================================================ */}
            <section
                aria-labelledby="sqlite-explorer-frequently-asked-questions"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="sqlite-explorer-frequently-asked-questions"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="space-y-3">
                    {SQLITE_EXPLORER_FAQS.map((faq, index) => (
                        <details
                            key={index}
                            className="group rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
                        >
                            <summary className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base cursor-pointer select-none list-none flex items-center justify-between gap-3">
                                <span>{faq.question}</span>
                                <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform shrink-0">
                                    &#9662;
                                </span>
                            </summary>
                            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 break-words">
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </section>

            {/* ============================================================================
          SECTION 10: INTERNAL CROSS-LINKING TO RELATED DEVELOPER & DATA TOOLS
          ============================================================================ */}
            <section
                aria-labelledby="sqlite-explorer-related-utilities"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Code2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="sqlite-explorer-related-utilities"
                        className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Related Client-Side Data Engineering, Developer &amp; Security Utilities
                    </h2>
                </div>
                <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed break-words">
                    Continue your database engineering, lakehouse analytics, and privacy workflow with our integrated browser
                    tools:
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/developer/parquet-viewer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            Parquet, Avro &amp; Feather Viewer + CSV/XLSX →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect binary lakehouse files locally with 64-bit BigInt safety, 10-dialect SQL DDL, and Excel export.
                        </p>
                    </Link>

                    <Link
                        href="/developer/har-analyzer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            HAR File Analyzer, Waterfall Viewer &amp; Sanitizer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect 7-phase HTTP waterfalls, decode SAML 2.0 &amp; JWT tokens, scrub 14 secret surfaces, and export to k6.
                        </p>
                    </Link>

                    <Link
                        href="/seo/llms-txt-generator"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            llms.txt, llms-full.txt &amp; AI Crawler (robots.txt) Studio →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Build llmstxt.org v2 compliant llms.txt &amp; llms-full.txt indexes, configure 45 AI crawler bots, and fix RFC 9309 leaks.
                        </p>
                    </Link>

                    <Link
                        href="/developer/sql-formatter"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            SQL Formatter, Beautifier &amp; Query Linter →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Format complex SQLite, PostgreSQL, DuckDB, MySQL, and Snowflake queries with custom indentation.
                        </p>
                    </Link>

                    <Link
                        href="/developer/json-converter"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            JSON to CSV, Excel (.xlsx), YAML &amp; XML Converter →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Transform nested JSON API responses and database exports into flat spreadsheets locally.
                        </p>
                    </Link>

                    <Link
                        href="/document/pdf-scrubber"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            PDF Bank Statement &amp; Invoice Data Scrubber →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Permanently redact IBANs, Luhn Card PANs, Tax IDs, and all 12 hidden PDF metadata surfaces locally.
                        </p>
                    </Link>

                    <Link
                        href="/developer/jwt-debugger"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            JWT, PASETO &amp; SAML 2.0 Security Debugger →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Decode and verify JWT (JWS/JWE/SD-JWT), PASETO v1–v4, and SAML 2.0 Deflate/Base64 messages and audit 16 SSO security rules locally.
                        </p>
                    </Link>
                </div>
            </section>
        </article>
    );
}