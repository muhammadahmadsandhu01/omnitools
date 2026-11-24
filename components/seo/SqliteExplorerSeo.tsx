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
    Cpu,
    Code2,
    HardDrive,
} from 'lucide-react';

export interface FaqItem {
    question: string;
    answer: string;
}

export const SQLITE_EXPLORER_FAQS: FaqItem[] = [
    {
        question: 'How do I open a .db or .sqlite file online without installing DB Browser for SQLite?',
        answer:
            'Click Open File in this sqlite viewer online and db file viewer to load any .sqlite, .db, or .sqlite3 file directly in your browser. Our zero-CDN TypeScript B-tree parser opens tables, schemas, SQL/DuckDB queries, ER diagrams, and exports immediately without installing desktop software or creating an account.',
    },
    {
        question: 'What is the difference between .db, .sqlite, and .sqlite3 files (and why do some .db files fail)?',
        answer:
            'For SQLite 3 databases, .db, .sqlite, and .sqlite3 are interchangeable extensions—every valid SQLite 3 file starts with the 16-byte "SQLite format 3\\0" header. A .db file will not open if it belongs to a non-SQLite format (Microsoft Access, Paradox, dBase/FoxPro .dbf), is encrypted with SQLCipher or WhatsApp .crypt, or was copied mid-write without its companion -wal file.',
    },
    {
        question: 'Can I edit a SQLite database online and save the modified binary .sqlite file?',
        answer:
            'Yes. Unlike read-only viewers, this sqlite editor online lets you edit cells inline, add new rows, create tables, run INSERT/UPDATE/DELETE queries, auto-index foreign keys, scrub PII/freelist residue, and download a valid binary .sqlite file that passes PRAGMA integrity_check.',
    },
    {
        question: 'How do I export a SQLite database to Excel (.xlsx), CSV, or JSON without uploading to a server?',
        answer:
            'Load your file, optionally filter rows with SQL, and open Tab 5 (11-Format Export & Diff) to convert sqlite to excel (.xlsx with CWE-1236 formula protection), sqlite to csv (RFC 4180), sqlite to postgresql online, or JSON locally in your browser without remote server uploads.',
    },
    {
        question: 'How do I open an iMessage chat.db or Chrome History file and decode 1601/2001 timestamps?',
        answer:
            'Copy your local Chrome History, Firefox places.sqlite, or Apple iMessage chat.db/sms.db file and open it in Tab 1. The data grid automatically detects Chromium WebKit 1601 microsecond timestamps and Apple CoreData 2001 nanosecond timestamps and displays human-readable UTC dates inline.',
    },
    {
        question: 'How do I open a companion .sqlite-wal file or inspect deleted rows in freelist space?',
        answer:
            'A -wal file stores uncheckpointed Write-Ahead Log frames and requires the main .db file. Open Tab 4 (Forensics & PII) to attach a companion .db-wal file (acting as a sqlite wal viewer online), inspect carved deleted records from unvacuumed freelist pages, and run 1-Click VACUUM or PII anonymization before sharing.',
    },
    {
        question: 'How do I generate an ER diagram or Drizzle / Prisma schema from a binary SQLite file?',
        answer:
            'Open Tab 2 (ER Diagram & ORM) to generate an interactive sqlite er diagram online from your binary .sqlite file—plotting both declared FOREIGN KEY constraints and implicit *_id relations—then download a Vector ERD (.svg) or copy Drizzle (schema.ts), Prisma (schema.prisma), PostgreSQL, Mermaid, or DBML.',
    },
    {
        question: 'How can I compare (diff) two SQLite databases online without uploading them?',
        answer:
            'Open Tab 5 and use Side-by-Side Database Diff (sqlite diff online) to upload a second .sqlite or .sql file (or run the built-in demo diff). The engine compares added, removed, and modified tables locally and generates a copy-ready SQL migration patch.',
    },
    {
        question: 'Can I run DuckDB analytical queries like SUMMARIZE on SQLite tables—or open .parquet files here?',
        answer:
            'Yes for DuckDB analytical syntax: Tab 1 supports DuckDB SUMMARIZE <table>, DESCRIBE, SELECT * EXCLUDE (...), and GROUP BY ALL on loaded SQLite tables. However, this page does not open .parquet files directly—use our Parquet, Avro & Feather Viewer at /developer/parquet-viewer for columnar lakehouse files.',
    },
    {
        question: 'What is the maximum SQLite file size I can open in the browser, and when should I use desktop DB Browser?',
        answer:
            'Because everything runs locally in browser RAM, practical file size depends on your device memory (typically smooth up to ~100–250 MB). Use desktop DB Browser for SQLite for multi-GB databases, SQLCipher-encrypted files, or heavy batch ETL workloads.',
    },
    {
        question: 'Why does KivaroTools use a zero-CDN TypeScript B-tree parser instead of external WASM?',
        answer:
            'Many browser viewers fetch external .wasm binaries from third-party CDNs that break under strict corporate Content-Security-Policy (CSP) rules. Our self-contained TypeScript B-tree parser decodes the 100-byte header and pages directly in browser memory. Your database files are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources.',
    },
    {
        question: 'How do I find and fix missing foreign-key indexes and orphaned rows?',
        answer:
            'Open Tab 3 (Linter & Profiler) to run our 12-point integrity audit (including PRAGMA foreign_key_check) and click 1-Click Auto-Optimize & Repair All to index foreign keys, clean orphaned child rows, and lift your Health Score to 100/100.',
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
        name: 'How to Open, Query, Edit, and Export a SQLite (.db / .sqlite3) File Online',
        description:
            'Step-by-step guide to opening .sqlite, .db, .db-wal, and .sql files locally in your browser, running SQLite and DuckDB SUMMARIZE queries, generating SVG ER diagrams and Drizzle/Prisma schemas, and exporting to Excel (.xlsx), CSV, or binary .sqlite.',
        step: [
            {
                '@type': 'HowToStep',
                position: 1,
                name: 'Open a Local .sqlite / .db File or Load a Sample Database',
                text: 'Click Open File to load a local .sqlite, .db, .sqlite3, .db-wal, .duckdb, .sql, or .csv file, or click one of the 3 built-in sample pills (SaaS Prod, Forensic Incident, or Chrome / iOS DB).',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Run SQLite & DuckDB Queries or Edit Rows Inline',
                text: 'Use Tab 1 to run SELECT, JOIN, PRAGMA, or DuckDB SUMMARIZE queries, edit cells inline, add rows, or create new tables in memory.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Generate SVG ER Diagrams, ORM Schemas & Run the 12-Point Linter',
                text: 'Switch to Tab 2 for interactive ERDs and Drizzle/Prisma/PostgreSQL codegen, Tab 3 for the 12-Point Linter & Auto-Optimize, or Tab 4 for 100-byte header, freelist carving & PII scrubbing.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Export to Binary .sqlite, Native Excel (.xlsx), CSV, or Diff Two Databases',
                text: 'Open Tab 5 to save your modified binary .sqlite database, download CWE-1236 guarded .xlsx or .csv spreadsheets, or run Side-by-Side Database Diff.',
            },
        ],
    };

    return (
        <article className="not-prose mt-16 w-full min-w-0 max-w-full overflow-x-hidden space-y-12 text-slate-700 dark:text-slate-300">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />

            {/* ============================================================================
                SECTION 1: EXECUTIVE OVERVIEW & PRIVACY DISCLOSURE
                ============================================================================ */}
            <section
                aria-labelledby="sqlite-viewer-overview"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2
                        id="sqlite-viewer-overview"
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
                    >
                        SQLite Viewer Online, .db File Viewer &amp; In-Browser SQLite Editor
                    </h2>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shrink-0">
                        <Sparkles className="h-3.5 w-3.5" />
                        Read + Write · Zero-CDN B-Tree
                    </span>
                </div>

                <p className="mt-3 w-full text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Use this browser-based <strong>sqlite viewer online</strong>, <strong>db file viewer</strong>, and{' '}
                    <strong>sqlite editor online</strong> to <strong>open sqlite file online</strong> (
                    <code>.sqlite</code>, <code>.db</code>, <code>.sqlite3</code>, companion <code>.db-wal</code>,{' '}
                    <code>.duckdb</code>, and <code>.sql</code>) directly in browser memory—acting as a zero-install{' '}
                    <strong>sqlite browser online</strong> and <strong>db browser for sqlite online</strong> alternative.
                    Run SQLite and <strong>duckdb online</strong> analytical queries (<code>SUMMARIZE</code>,{' '}
                    <code>SELECT * EXCLUDE</code>), edit rows inline, save modified binary <code>.sqlite</code> files,
                    and export <strong>sqlite to excel</strong> (<code>.xlsx</code>) or <strong>sqlite to csv</strong>{' '}
                    free without signup.
                </p>

                <blockquote className="p-4 my-6 bg-indigo-50/80 border-l-4 border-indigo-600 rounded-r-xl dark:bg-slate-800/80 not-italic">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
                        <strong>Local Browser Processing &amp; Scope Disclosure:</strong> Your database files are
                        processed locally in your browser and are not uploaded to KivaroTools servers. The website may
                        still load general analytics or other third-party website resources. Practical file size depends
                        on available browser RAM (typically smooth up to ~100–250 MB). Encrypted SQLCipher / WhatsApp{' '}
                        <code>.crypt</code> databases are not supported, and <code>.parquet</code> files are handled by
                        our{' '}
                        <Link
                            href="/developer/parquet-viewer"
                            className="font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
                        >
                            Parquet, Avro &amp; Feather Viewer
                        </Link>
                        .
                    </p>
                </blockquote>

                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                            <Database className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            Read/Write SQLite + DuckDB Analytical SQL
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Unlike read-only viewers, edit cells inline, create tables, run <code>JOIN</code>,{' '}
                            <code>SUMMARIZE</code>, and <code>EXPLAIN QUERY PLAN</code>, and save binary{' '}
                            <code>.sqlite</code> files.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                            <Layers className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            SVG ER Diagrams + Drizzle &amp; Prisma ORM
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Generate an interactive <strong>sqlite er diagram</strong> (Vector <code>.svg</code>,
                            Mermaid, DBML) plus <strong>sqlite to drizzle schema</strong>,{' '}
                            <strong>sqlite to prisma schema</strong>, and PostgreSQL migrations.
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
                            Inspect Page 1 binary headers, attach companion <code>.db-wal</code> logs, decode Chrome
                            1601 / Apple 2001 timestamps, carve deleted freelist rows, and scrub PII in 1 click.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
                SECTION 2: HOW TO USE IN 4 STEPS
                ============================================================================ */}
            <section
                aria-labelledby="sqlite-how-to"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5"
            >
                <div>
                    <h2
                        id="sqlite-how-to"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        How to Browse, Query, Edit &amp; Export SQLite (.db / .sqlite3) Files in 4 Steps
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                        Go from a raw binary database to Excel spreadsheets, ORM schemas, or a clean migration patch:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        {
                            step: 'Step 1: Open a Local File or Click a Sample Pill',
                            body: 'Click Open File to load .sqlite, .db, .sqlite3, .db-wal, .duckdb, or .sql files—or test immediately with SaaS Prod, Forensic Incident, or Chrome / iOS DB.',
                        },
                        {
                            step: 'Step 2: Run SQL / DuckDB Queries & Edit Inline',
                            body: 'Use Tab 1 to run SELECT, JOIN, PRAGMA, or DuckDB SUMMARIZE queries, sort/filter the grid, click any cell to edit inline, or open + Add Row / + New Table.',
                        },
                        {
                            step: 'Step 3: Inspect ERDs, Auto-Fix Indexes & Scrub Forensics',
                            body: 'Download Vector ERD (.svg) or Drizzle/Prisma code in Tab 2, auto-fix missing FK indexes (76→100) in Tab 3, or inspect 100-byte headers & wipe deleted freelist rows in Tab 4.',
                        },
                        {
                            step: 'Step 4: Export 11 Formats or Run Side-by-Side DB Diff',
                            body: 'Open Tab 5 to save your modified binary .sqlite, export sqlite to excel online (.xlsx) or sqlite to csv online, or diff two SQLite databases locally.',
                        },
                    ].map((s) => (
                        <div
                            key={s.step}
                            className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-1.5 min-w-0"
                        >
                            <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{s.step}</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ============================================================================
                SECTION 3: WORKED EXAMPLES & 100-BYTE HEADER REFERENCE
                ============================================================================ */}
            <section
                aria-labelledby="sqlite-examples-and-header"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Terminal className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <h2
                            id="sqlite-examples-and-header"
                            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                        >
                            Worked Examples: DuckDB Analytical SQL, Drizzle ORM &amp; 100-Byte Header Decoding
                        </h2>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Verified against the built-in <code>cloudscale_saas_prod.sqlite</code> and{' '}
                        <code>forensic_places_and_sms.sqlite</code> sample databases:
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                        <div className="text-indigo-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                            Example 1: DuckDB SUMMARIZE &amp; EXCLUDE on SQLite Tables
                        </div>
                        <pre className="leading-relaxed overflow-x-auto max-w-full">{`-- Profile all columns in 1 command (0.4 ms):
SUMMARIZE orders;

-- Omit bulky JSON column via DuckDB EXCLUDE:
SELECT * EXCLUDE (metadata_json)
FROM orders
WHERE status = 'PAID'
ORDER BY amount_usd DESC;`}</pre>
                    </div>

                    <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                        <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                            Example 2: Auto-Generated Drizzle ORM Schema (schema.ts)
                        </div>
                        <pre className="leading-relaxed overflow-x-auto max-w-full">{`import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organization_id: integer('organization_id').notNull().references(() => organizations.id),
  full_name: text('full_name').notNull(),
  plan_tier: text('plan_tier').notNull(),
});`}</pre>
                    </div>
                </div>

                <div className="pt-2 space-y-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-indigo-600" />
                        <span>100-Byte SQLite 3 Binary Header Specification (Page 1, Bytes 0–99)</span>
                    </h3>
                    <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="min-w-[680px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                                <tr>
                                    <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Offset (Size)</th>
                                    <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Header Field</th>
                                    <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Values</th>
                                    <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Forensic &amp; Performance Meaning</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                <tr>
                                    <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">0..15 (16 B)</td>
                                    <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">Magic String</td>
                                    <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">&quot;SQLite format 3\0&quot;</td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">Identifies a valid SQLite 3 binary file regardless of <code>.db</code> or <code>.sqlite3</code> extension.</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">16..17 (2 B)</td>
                                    <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">Page Size</td>
                                    <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">512–65536 B</td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">Modern SQLite defaults to <code>4096</code> bytes per B-tree page.</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">18..19 (2 B)</td>
                                    <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">Write/Read Version</td>
                                    <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">1=Rollback, 2=WAL</td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700"><code>2</code> indicates Write-Ahead Logging (<code>.db-wal</code>) mode.</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">32..39 (8 B)</td>
                                    <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">Freelist Pages</td>
                                    <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">Two 32-bit uints</td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">Non-zero count means unvacuumed deleted pages exist and can be carved in Tab 4.</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">56..59 (4 B)</td>
                                    <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">Text Encoding</td>
                                    <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">1=UTF-8, 2/3=UTF-16</td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">Controls how TEXT record payloads are decoded.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ============================================================================
                SECTION 4: HONEST COMPETITOR COMPARISON TABLE (UPDATED FOR REAL RIVALS)
                ============================================================================ */}
            <section
                aria-labelledby="sqlite-competitor-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4"
            >
                <div>
                    <h2
                        id="sqlite-competitor-matrix"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Browser SQLite Viewer vs. Desktop DB Browser &amp; Online Incumbents (Honest Comparison)
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                        Verified against directly inspected web viewers and desktop tools:
                    </p>
                </div>

                <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[840px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Capability</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-indigo-600 dark:text-indigo-400">
                                    KivaroTools Studio
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">sqliteviewer.app / Inloop / FluentDB</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">ChatDB / PondPilot</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">RebaseData</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Desktop DB Browser (DB4S)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Inline Editing &amp; Binary <code>.sqlite</code> Save
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Free Read + Write + Binary .sqlite Save
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400">
                                    Strictly Read-Only on web
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Read-only analytics focus</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Conversion-only (server upload)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Full Read + Write (desktop install)</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Local Excel (<code>.xlsx</code>) &amp; CSV Export
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Local .xlsx (CWE-1236) + CSV + 11 Formats
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">CSV only (no native .xlsx)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">ChatDB: CSV/JSON; PondPilot: CSV/Parquet/Excel</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Server-upload .xlsx/.csv (up to 50 GB)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">CSV / SQL / JSON only</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    SVG ER Diagram &amp; Drizzle/Prisma ORM
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    SVG ERD (Declared + Implicit) + Drizzle/Prisma
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None (DBConvert Streams has declared-FK ERD)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">No built-in ERD or ORM</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Forensics (<code>-wal</code>, Freelist, PII) &amp; DB Diff
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    100-Byte Header, Freelist, WAL, PII &amp; Diff
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Ignore -wal, no forensics or diff</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">PondPilot handles WAL + DuckDB; no freelist/PII/diff</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Reads -wal on server</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Supports SQLCipher &amp; multi-GB files</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
                SECTION 5: 3 PRACTICAL WORKFLOWS (REPLACES 32-PHRASE KEYWORD DUMP) & TROUBLESHOOTING
                ============================================================================ */}
            <section
                aria-labelledby="sqlite-workflows-and-troubleshooting"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
            >
                <div>
                    <h2
                        id="sqlite-workflows-and-troubleshooting"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Practical Database Workflows &amp; Common SQLite Pitfalls
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                        Everyday engineering and forensic tasks supported directly in your browser:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            1. Browse, Edit &amp; Export .db / .sqlite3
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Use as a <strong>db file viewer online</strong>, <strong>sqlite database viewer online</strong>,
                            and <strong>sqlite3 viewer online</strong> to inspect tables, convert{' '}
                            <strong>sqlite to excel</strong>, <strong>sqlite to csv</strong>, or{' '}
                            <strong>sqlite to json online</strong> locally.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            2. ERD, ORM &amp; Migration Diffs
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Generate an interactive <strong>sqlite er diagram online</strong>, compile{' '}
                            <strong>sqlite to postgresql online</strong>, Drizzle, or Prisma schemas, and run{' '}
                            <strong>sqlite diff</strong> to produce <code>ALTER TABLE</code> patches.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            3. Forensics, DuckDB &amp; PII Scrubbing
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Run <strong>duckdb viewer online</strong> <code>SUMMARIZE</code> stats, inspect{' '}
                            <strong>sqlite wal viewer online</strong> frames, carve deleted freelist records, and wipe
                            PII before sharing <code>.sqlite</code> files.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {[
                        {
                            title: 'Missing Recent Rows from Uncheckpointed .db-wal',
                            body: 'In WAL mode, recent writes live in database.db-wal until checkpointed. Run PRAGMA wal_checkpoint(TRUNCATE); before copying, or attach your .db-wal file in Tab 4.',
                        },
                        {
                            title: 'Slow JOINs on Unindexed Foreign Keys',
                            body: 'SQLite auto-indexes PRIMARY KEYs but NOT FOREIGN KEY columns. Run Tab 3 (12-Point Linter) and click 1-Click Auto-Optimize to index every FK.',
                        },
                        {
                            title: 'Deleted Rows Still Recoverable in Shared Files',
                            body: 'DELETE FROM leaves deleted text inside freelist pages until VACUUM runs. Click 1-Click Anonymize PII & Wipe Residue in Tab 4 before exporting.',
                        },
                        {
                            title: '17-Digit Timestamps in Chrome & iOS Databases',
                            body: 'Chrome History (WebKit 1601 microseconds) and iOS sms.db (CoreData 2001 nanoseconds) are decoded automatically into readable UTC badges in Tab 1.',
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-1.5 min-w-0"
                        >
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>{item.title}</span>
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ============================================================================
                SECTION 6: FREQUENTLY ASKED QUESTIONS (12 INTERACTIVE ACCORDIONS)
                ============================================================================ */}
            <section
                aria-labelledby="sqlite-faq"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="sqlite-faq"
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
                SECTION 7: RELATED DEVELOPER & DATA ENGINEERING TOOLS
                ============================================================================ */}
            <section
                aria-labelledby="sqlite-related-tools"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Code2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="sqlite-related-tools"
                        className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Related Developer &amp; Data Engineering Utilities
                    </h2>
                </div>
                <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    Continue your database, columnar file, and API engineering workflow:
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            href: '/developer/parquet-viewer',
                            title: 'Parquet, Avro & Feather Viewer + CSV/XLSX →',
                            desc: 'Inspect .parquet, .avro, and .feather files locally with 64-bit BigInt safety and 10 SQL DDLs.',
                        },
                        {
                            href: '/developer/sql-formatter',
                            title: 'SQL Formatter, Beautifier & Linter →',
                            desc: 'Format complex SQLite, PostgreSQL, DuckDB, MySQL, and Snowflake queries.',
                        },
                        {
                            href: '/developer/json-converter',
                            title: 'JSON to CSV, Excel (.xlsx), YAML & XML →',
                            desc: 'Flatten nested JSON exports into spreadsheets locally.',
                        },
                        {
                            href: '/developer/openapi-to-typescript',
                            title: 'OpenAPI to TypeScript, Zod & Mock Generator →',
                            desc: 'Compile OpenAPI 3.1/3.0 & Swagger 2.0 specs into TS types, Zod schemas & MSW v2.',
                        },
                        {
                            href: '/developer/har-analyzer',
                            title: 'HAR File Analyzer & Sanitizer →',
                            desc: 'Inspect HTTP waterfalls, scrub secrets, and export k6/Playwright scripts.',
                        },
                        {
                            href: '/developer/jwt-debugger',
                            title: 'JWT, PASETO & SAML 2.0 Debugger →',
                            desc: 'Decode and verify auth tokens and SSO assertions locally.',
                        },
                    ].map((tool) => (
                        <Link
                            key={tool.href}
                            href={tool.href}
                            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0 no-underline"
                        >
                            <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                                {tool.title}
                            </div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{tool.desc}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </article>
    );
}