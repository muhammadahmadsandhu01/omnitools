import React from 'react';
import Link from 'next/link';
import {
  Database,
  ShieldCheck,
  Layers,
  Binary,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  HelpCircle,
  Sparkles,
  FileSpreadsheet,
  Cpu,
  Search,
} from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

export const PARQUET_VIEWER_FAQS: FaqItem[] = [
  {
    question: 'How do I open and view a .parquet file online without Python or uploading to a server?',
    answer:
      'Drag and drop your .parquet file directly into the KivaroTools Parquet, Avro & Feather Viewer. The binary container is decoded 100% locally inside your browser memory using JavaScript ArrayBuffer and DataView readers. You do not need to install Python, Pandas, PyArrow, or DuckDB CLI, and your confidential data lake files are never uploaded to any remote server.',
  },
  {
    question: 'What is the difference between Apache Parquet, Apache Avro, and Apache Arrow Feather (.arrow)?',
    answer:
      'Apache Parquet (.parquet) is a compressed columnar storage format with a trailing Thrift FileMetaData footer, engineered for analytical OLAP data warehouses (Snowflake, AWS Athena, Google BigQuery, Databricks, DuckDB). Apache Avro (.avro) is a row-oriented binary container that embeds its JSON schema (avro.schema) in the file header alongside a 16-byte sync marker, making it ideal for Kafka event streaming and schema evolution. Apache Arrow Feather (.feather / .arrow / .ipc) is an in-memory columnar IPC format built on FlatBuffers for zero-copy dataframe exchange between Python (Pandas, Polars, PyArrow), R, and C++.',
  },
  {
    question: 'How does KivaroTools prevent 64-bit integer (INT64 / UINT64) precision loss in the browser?',
    answer:
      'Standard JavaScript numbers use IEEE-754 double-precision floating-point values, which only guarantee exact integer precision up to Number.MAX_SAFE_INTEGER (9,007,199,254,740,991). In ordinary online Parquet or JSON viewers, 64-bit Snowflake IDs, Stripe/Twitter transaction IDs, and nanosecond timestamps silently round to trailing zeros. KivaroTools decodes 64-bit physical integers using native JavaScript BigInt and serializes values exceeding safe bounds as exact decimal strings across the Data Grid, JSON/JSONL exports, SQL INSERT batches, and CSV/Excel downloads.',
  },
  {
    question: 'Can I convert Parquet, Avro, and Feather files to CSV and Microsoft Excel (.xlsx) for free without row caps?',
    answer:
      'Yes. Unlike freemium viewers that cap free CSV exports at 1,000 rows, KivaroTools lets you export either your filtered/projected view or the entire loaded dataset to RFC 4180 CSV (with custom comma, semicolon, tab, or pipe delimiters and UTF-8 BOM), native binary Microsoft Excel (.xlsx) PKZIP Office Open XML workbooks with frozen headers and auto-filters, JSON arrays, JSON Lines (.jsonl / NDJSON), SQL INSERT statements, Markdown tables, or standalone HTML tables completely free, plus cross-format binary transcoding (.parquet <-> .avro <-> .feather).',
  },
  {
    question: 'How does the tool read a Parquet file schema and Thrift footer metadata?',
    answer:
      'Every valid Apache Parquet file starts and ends with the 4-byte ASCII magic signature "PAR1" (0x50 0x41 0x52 0x31). Immediately preceding the trailing PAR1 bytes is a 4-byte little-endian integer specifying the byte length of the Thrift TCompactProtocol FileMetaData structure. Our Binary X-Ray Inspector seeks to the end of the file, reads the footer length, and decodes the schema tree, physical types, logical types, Row Group row counts, Column Chunk compression ratios, min/max zone map statistics, and custom key-value metadata (such as pandas or ARROW:schema).',
  },
  {
    question: 'Can I generate SQL CREATE TABLE DDL for Snowflake, BigQuery, PostgreSQL, DuckDB, and ClickHouse?',
    answer:
      'Yes. Open the Schema & DDL Generator tab to automatically translate your binary file schema into ready-to-run SQL DDL and typed SDK definitions across 10 targets: PostgreSQL, Snowflake Data Cloud, Google BigQuery, DuckDB (with CREATE TABLE and direct read_parquet() queries), ClickHouse MergeTree, TypeScript Interfaces, Python PyArrow (pa.schema), Python Polars (pl.Schema), Apache Avro (.avsc), and JSON Schema (Draft 2020-12).',
  },
  {
    question: 'What compression codecs and encodings are supported for Parquet, Avro, and Feather files?',
    answer:
      'The client-side binary engine supports Uncompressed (PLAIN), Snappy (LZ77 block decompression with Avro CRC32 checksum verification), GZIP / DEFLATE (RFC 1951), and LZ4 frame/block payloads, along with Parquet Hybrid Run-Length Encoding / Bit-Packing (RLE_DICTIONARY, PLAIN_DICTIONARY) for definition levels, repetition levels, and dictionary-encoded columns.',
  },
  {
    question: 'What is CWE-1236 CSV Formula Injection protection and why does it matter when exporting data?',
    answer:
      'When exporting untrusted string columns from a data lake or Kafka topic into CSV or Excel (.xlsx), cell values beginning with =, +, -, or @ can be interpreted by Microsoft Excel, Google Sheets, or LibreOffice Calc as executable formulas or DDE system commands (CWE-1236). KivaroTools includes a comprehensive 15-vector CWE-1236 Formula Guard that strips leading whitespace/tabs/CR/LF and neutralizes triggers including full-width Unicode equivalents (\\uFF1D, \\uFF0B, \\uFF20, \\uFF0D) and en/em-dashes by prepending a single quote (\'), while preserving legitimate negative numbers (such as -42.5 or -1.5e-4) untouched.',
  },
  {
    question: 'Why do international characters and emojis look garbled when opening exported CSVs in Windows Excel?',
    answer:
      'Microsoft Excel on Windows defaults to legacy ANSI/Windows-1252 encoding when opening a UTF-8 CSV file that lacks a Byte Order Mark, turning Arabic, Urdu, CJK, Cyrillic, accented European characters, and emojis into garbled mojibake text. Enabling the "Prepend UTF-8 BOM (\\uFEFF)" checkbox in the Export Studio writes the 3-byte UTF-8 signature at the start of the CSV file so Excel renders all Unicode characters cleanly.',
  },
  {
    question: 'How do I inspect nested STRUCT, LIST, and MAP columns inside a Parquet or Avro file?',
    answer:
      'In the Data Explorer Grid, complex nested structures (such as Parquet repeated groups, Avro nested records/maps, or Arrow list columns) are rendered as compact JSON previews inside the table cell. Clicking any row opens the interactive Row Deep Inspector Drawer (or Cell Value Modal), displaying the full pretty-printed JSON hierarchy alongside each field’s physical and logical type with a 1-click Copy Row JSON button.',
  },
  {
    question: 'Can I filter rows, sort columns, and hide sensitive PII columns before exporting to CSV or JSON?',
    answer:
      'Yes. You can combine global full-text search with multi-condition predicate filters across 11 operators (equals, not equals, greater than, greater or equal, less than, less or equal, contains, starts with, ends with, is NULL, is not NULL) supporting both AND and OR boolean combinator logic, sort any column ascending or descending with NULL-last ordering, and uncheck sensitive PII columns (such as email or ip_address) in the Column Projection picker. In the Export Studio, choose "Filtered & Projected" to export only the exact subset you curated.',
  },
  {
    question: 'What statistics does the Column Profiler & Data Quality tab calculate?',
    answer:
      'For every column in your dataset, the Column Profiler calculates total row count, non-null count, null count, null percentage, distinct cardinality count, uniqueness ratio (%), minimum and maximum values, arithmetic mean, standard deviation (StdDev), exact numeric quantiles (P25, P50 Median, and P75), string length distribution (min, max, average length), and the top frequent values with occurrence percentages.',
  },
  {
    question: 'Can I transcode files between binary formats (e.g., Parquet to Avro or Avro to Feather) in the browser?',
    answer:
      'Yes. In addition to text and spreadsheet exports, our engine includes binary container encoders for Apache Parquet (.parquet), Apache Avro (.avro), and Apache Arrow Feather (.feather). You can load an Avro stream, filter out invalid records, and re-encode the cleaned dataset directly into a binary Parquet or Feather container.',
  },
  {
    question: 'Why does my Parquet file fail to open with a "Missing trailing PAR1 footer magic bytes" warning?',
    answer:
      'Unlike CSV or JSON files which stream top-to-bottom, Apache Parquet stores its schema and row group offsets at the very end of the file right before the trailing 4-byte "PAR1" magic signature. If a file download from Amazon S3, GCS, or Azure Blob Storage was interrupted midway, the footer is missing. KivaroTools detects truncated PAR1 containers, alerts you to the incomplete transfer, and attempts heuristic recovery of readable payload tokens.',
  },
  {
    question: 'How does KivaroTools handle Encrypted Parquet (PARE) files?',
    answer:
      'Apache Parquet Modular Encryption encrypts footer and page structures using AES-GCM/CTR and replaces the header magic bytes with "PARE" (0x50 0x41 0x52 0x45). Because decryption requires external Key Management Service (KMS) keys not embedded in the file, KivaroTools identifies the PARE signature and displays a clear diagnostic message explaining that KMS key material is required.',
  },
  {
    question: 'When should I export to JSON Lines (.jsonl / NDJSON) instead of a standard JSON array (.json)?',
    answer:
      'Standard JSON wraps all records inside a single top-level array ([...]), which requires downstream parsers to load the entire file into RAM at once. JSON Lines (.jsonl / NDJSON) writes one self-contained JSON object per line separated by "\\n". Use JSONL when feeding records into OpenAI / LLM fine-tuning datasets, ClickHouse (JSONEachRow), Google BigQuery, AWS Kinesis, or Unix jq pipelines.',
  },
];

export default function ParquetViewerSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PARQUET_VIEWER_FAQS.map((faq) => ({
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
    name: 'How to Open, Inspect, Query, and Convert Parquet, Avro, and Feather Files Online',
    description:
      'Step-by-step guide to viewing binary schemas, inspecting Row Group and Avro header metadata, profiling column quantiles, generating SQL DDL, and converting Apache Parquet, Avro, and Arrow Feather files to CSV, Excel (.xlsx), JSON, or JSONL locally in your browser.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Upload Your Binary File or Load a Sample Dataset',
        text: 'Drag and drop a local .parquet, .avro, .feather, .arrow, .ipc, .jsonl, or .csv file into the browser dropzone, or click one of the three built-in binary sample presets (E-Commerce Parquet, IoT Avro Stream, or ML Feather Embeddings).',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Search, Filter, Sort, and Inspect Nested Rows',
        text: 'Use the Data Explorer Grid to search across all columns, build multi-condition predicate filters across 11 operators, toggle column visibility for PII scrubbing, and click any cell or row to inspect nested STRUCT, LIST, and MAP values.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Audit Schema, Generate SQL DDL & Profile Column Statistics',
        text: 'Switch to the Schema & DDL Generator tab to compile CREATE TABLE statements for Snowflake, BigQuery, PostgreSQL, DuckDB, or ClickHouse, and open the Column Profiler & Binary X-Ray tabs to inspect P25/P50/P75 quantiles, null ratios, magic bytes, and Row Group compression.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Export to Sanitized CSV, Excel (.xlsx), JSONL, or SQL INSERTs',
        text: 'Open the Export & Converter Studio, choose between your filtered subset or the full dataset, enable UTF-8 BOM and CWE-1236 Formula Injection protection, and download your converted file.',
      },
    ],
  };

  return (
    <article className="mt-16 space-y-12 text-slate-700 dark:text-slate-300">
      {/* Structured Data Scripts (FAQPage & HowTo for Rich Snippets & AI Overviews) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* ============================================================================
          SECTION 1: EXECUTIVE OVERVIEW & CLIENT-SIDE LAKEHOUSE ARCHITECTURE
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-architecture-overview"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h2
            id="parquet-viewer-architecture-overview"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Client-Side Apache Parquet, Avro &amp; Feather Viewer, Schema Inspector &amp; Converter
          </h2>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shrink-0">
            <Sparkles className="h-3.5 w-3.5" />
            100% In-Browser Binary Engine
          </span>
        </div>

        <p className="mt-3 w-full text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          Open, query, profile, and convert binary <strong>Apache Parquet (<code>.parquet</code>)</strong>,{' '}
          <strong>Apache Avro (<code>.avro</code>)</strong>, and{' '}
          <strong>Apache Arrow Feather (<code>.feather</code> / <code>.arrow</code> / <code>.ipc</code>)</strong>{' '}
          datasets directly in your browser—with zero Python setup, zero server uploads, and 64-bit{' '}
          <code>BigInt</code> precision safety.
        </p>

        <blockquote className="p-4 my-6 bg-blue-50/80 border-l-4 border-blue-600 rounded-r-xl dark:bg-slate-800/80 not-italic">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
            <strong>Zero-Upload Privacy Guarantee:</strong> Production data warehouse partitions and Kafka event dumps
            routinely contain confidential financial records, customer PII, and proprietary telemetry. Every byte of
            your <code>.parquet</code>, <code>.avro</code>, or <code>.feather</code> file is decoded locally inside your
            browser&apos;s <code>ArrayBuffer</code> memory sandbox—nothing is ever transmitted to an external server.
          </p>
        </blockquote>

        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
          <p>
            In modern data engineering, plain-text CSV and JSON files have largely been replaced by high-performance
            binary storage formats. Cloud lakehouses built on <strong>Snowflake</strong>, <strong>AWS Athena</strong>,{' '}
            <strong>Google BigQuery</strong>, <strong>Databricks Delta Lake</strong>, <strong>Apache Iceberg</strong>,
            and <strong>DuckDB</strong> store analytical tables in <strong>Apache Parquet</strong> to achieve 5x–15x
            storage compression and column-pruned scan speeds. Real-time event buses running on{' '}
            <strong>Apache Kafka</strong> and <strong>Confluent Schema Registry</strong> serialize millions of messages
            per second into <strong>Apache Avro</strong> containers, while machine learning and data science pipelines in{' '}
            <strong>Python (Pandas, Polars, PyArrow)</strong> and <strong>R</strong> exchange in-memory tensors and
            dataframes using <strong>Apache Arrow IPC / Feather v2</strong>.
          </p>
          <p>
            However, when a developer downloads a single <code>part-00000.snappy.parquet</code> partition from Amazon
            S3, pulls a dead-letter <code>.avro</code> payload from Kafka, or receives a <code>.feather</code> feature
            dump from a data scientist, inspecting that file traditionally requires creating a Python virtual
            environment, installing <code>pyarrow</code> or <code>fastavro</code>, and writing boilerplate scripts just
            to check column types or export a spreadsheet for business stakeholders. KivaroTools eliminates that friction
            by embedding a unified, multi-format binary reader, statistical profiler, 10-dialect SQL DDL compiler, and
            CWE-1236 safe spreadsheet converter inside a single browser tab.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              3-in-1 Binary Container Support
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Automatically detects magic byte signatures for Apache Parquet (<code>PAR1</code>), Apache Avro (
              <code>Obj\x01</code>), and Arrow Feather (<code>ARROW1</code> / <code>FEA1</code> / IPC Stream), plus{' '}
              <code>.jsonl</code> and <code>.csv</code> fallbacks.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
              <Binary className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              Lossless 64-Bit BigInt Precision
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Decodes 64-bit <code>INT64</code> and <code>UINT64</code> values via native <code>BigInt</code>,
              preventing silent JavaScript IEEE-754 float corruption on Snowflake IDs above{' '}
              <code>9,007,199,254,740,991</code>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              CWE-1236 &amp; UTF-8 BOM Safe Exports
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Neutralizes malicious spreadsheet formulas (<code>=</code>, <code>+</code>, <code>-</code>, <code>@</code>
              ) while preserving negative numbers, and prepends UTF-8 BOM (<code>\uFEFF</code>) for Windows Excel.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 2: COMPLETE INTERNAL WORKING STRUCTURE (HOW THE ENGINE WORKS)
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-working-structure"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2.5 mb-2">
          <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2
            id="parquet-viewer-working-structure"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Complete Working Structure: How the Client-Side Binary Engine Works
          </h2>
        </div>
        <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          When you drop a binary file into the studio, <code>lib/columnarViewerEngine.ts</code> executes a deterministic
          5-stage pipeline inside browser memory without making a single network request:
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
              1
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Magic Signature &amp; Tail Inspection
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Reads the leading and trailing bytes of the <code>Uint8Array</code> buffer to verify format signatures:{' '}
              <code>0x50415231</code> (<code>PAR1</code>) at head &amp; tail for Parquet, <code>0x4F626A01</code> (
              <code>Obj\x01</code>) for Avro, <code>0x4152524F5731</code> (<code>ARROW1</code>) or <code>FEA1</code> for
              Feather, and <code>0xFFFFFFFF</code> for Arrow IPC streams.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
              2
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Binary Footer &amp; Schema Extraction
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              For Parquet, reads the 4-byte little-endian footer length at <code>fileSize - 8</code> and parses the
              Thrift <code>TCompactProtocol</code> <code>FileMetaData</code> tree. For Avro, decodes ZigZag varint
              blocks to extract the <code>avro.schema</code> JSON header and 16-byte sync marker.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
              3
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Page Decompression &amp; RLE Decoding
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Decompresses column chunks and data blocks using pure TypeScript <strong>Snappy</strong> (LZ77 literal &amp;
              copy-offset state machine), <strong>GZIP / DEFLATE</strong>, or <strong>LZ4</strong> decoders, and
              reconstructs dictionary indices and null bitmaps via Hybrid <strong>RLE / Bit-Packing</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white">
              4
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              BigInt Guard &amp; Column Profiling
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Preserves 64-bit integers outside <code>±9,007,199,254,740,991</code> as exact strings, while computing
              single-pass statistical profiles: null ratios, distinct cardinality, mean, standard deviation, and exact{' '}
              <code>P25 / P50 / P75</code> quantiles.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
              5
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Query, DDL &amp; Safe Serialization
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Executes multi-predicate filtering (11 operators supporting both AND and OR combinators), NULL-last sorting, and column projection in memory,
              then serializes into 10 SQL/SDK schema targets or 8 export formats (including native binary .xlsx workbooks) with CWE-1236 formula neutralization.
            </p>
          </div>
        </div>

        {/* Deep Dive Subsections */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/40 dark:bg-slate-800/20 space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Why Apache Parquet Stores Its Schema in the Footer (Not the Header)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              When distributed engines like Apache Spark, Trino, or DuckDB write a Parquet file, they stream data into{' '}
              <strong>Row Groups</strong> and <strong>Column Chunks</strong> on the fly without knowing the final row
              count, byte offsets, or column min/max zone map statistics ahead of time. Once all Row Groups are flushed,
              the writer appends the <code>FileMetaData</code> Thrift structure at the end of the file, writes its
              4-byte byte length, and closes with <code>PAR1</code>. Consequently, a Parquet reader always reads the{' '}
              <strong>last 8 bytes first</strong> to locate and parse the footer before touching any data pages.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/40 dark:bg-slate-800/20 space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              How Apache Avro Self-Describes Streaming Records with ZigZag Varints
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Unlike Parquet, an <strong>Apache Avro Object Container File (<code>Obj\x01</code>)</strong> is designed
              for append-heavy event streams. It places its complete JSON schema (<code>avro.schema</code>) and
              compression codec (<code>avro.codec</code>) inside a header map right after the 4-byte magic signature,
              followed by a random <strong>16-byte Sync Marker</strong>. Individual integers and string lengths inside
              data blocks use compact variable-length <strong>ZigZag encoding</strong>—mapping signed integers to
              unsigned varints so small negative and positive numbers occupy only a single byte.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 3: REAL PRACTICAL EXAMPLES (INPUT VS. OUTPUT SHOWCASES)
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-real-examples"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2
              id="parquet-viewer-real-examples"
              className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Real-World Examples: Schema Extraction, SQL DDL &amp; Safe CSV Conversion
            </h2>
          </div>
          <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            Examine three real production scenarios demonstrating how KivaroTools decodes binary metadata, preserves
            64-bit Snowflake IDs, compiles cloud warehouse DDL, and sanitizes spreadsheet exports:
          </p>
        </div>

        {/* Example 1 */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-xs font-mono">Example 1</span>
            <span>
              Apache Parquet Partition → Snowflake / PostgreSQL DDL &amp; PyArrow Schema Generation
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            Suppose you drop an e-commerce lakehouse partition (<code>ecommerce_orders_v2.parquet</code>) containing
            64-bit Snowflake IDs, nullable string columns, decimal prices, and nested shipping structs. Here is the
            extracted binary schema alongside the auto-generated Snowflake SQL DDL and Python PyArrow schema:
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
              <div className="text-blue-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                Extracted Binary Parquet Footer Metadata &amp; Schema
              </div>
              <pre className="leading-relaxed overflow-x-auto max-w-full">{`Format:        Apache Parquet v2.6.0 (Magic: 0x50 0x41 0x52 0x31 "PAR1")
Codec:         SNAPPY (Compression Ratio: 2.84x)
Row Groups:    1 Row Group (25 Rows × 11 Columns)
Created By:    kivarotools-columnar-engine (build PAR1)

Columns Decoded:
  1. order_id               INT32      -> INT32            (REQUIRED)
  2. customer_snowflake_id  INT64      -> INT64 [BigInt]   (REQUIRED)
  3. customer_email         BYTE_ARRAY -> UTF8             (OPTIONAL, 16% Nulls)
  4. region                 BYTE_ARRAY -> UTF8             (REQUIRED)
  5. total_usd              DOUBLE     -> DOUBLE           (REQUIRED)
  6. is_prime_member        BOOLEAN    -> BOOLEAN          (REQUIRED)
  7. created_at             INT64      -> TIMESTAMP_MILLIS (REQUIRED)
  8. shipping_meta          BYTE_ARRAY -> STRUCT           (REQUIRED)`}</pre>
            </div>

            <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
              <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                Generated Snowflake DDL &amp; Python PyArrow Schema
              </div>
              <pre className="leading-relaxed overflow-x-auto max-w-full">{`-- 1. Snowflake Data Cloud DDL
CREATE OR REPLACE TABLE "E_COMMERCE_ORDERS_V2" (
  "order_id" NUMBER(38, 0) NOT NULL,
  "customer_snowflake_id" NUMBER(38, 0) NOT NULL,
  "customer_email" VARCHAR,
  "region" VARCHAR NOT NULL,
  "total_usd" FLOAT NOT NULL,
  "is_prime_member" BOOLEAN NOT NULL,
  "created_at" TIMESTAMP_NTZ NOT NULL,
  "shipping_meta" VARIANT NOT NULL
);

# 2. Python PyArrow Schema Definition
import pyarrow as pa
ecommerce_orders_v2_schema = pa.schema([
    pa.field("order_id", pa.int32(), nullable=False),
    pa.field("customer_snowflake_id", pa.int64(), nullable=False),
    pa.field("customer_email", pa.string(), nullable=True),
    pa.field("total_usd", pa.float64(), nullable=False),
    pa.field("created_at", pa.timestamp("ms"), nullable=False),
])`}</pre>
            </div>
          </div>
        </div>

        {/* Example 2 */}
        <div className="space-y-3 pt-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-xs font-mono">Example 2</span>
            <span>
              64-Bit INT64 Precision Loss vs. KivaroTools BigInt-Safe JSON &amp; CSV Serialization
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            Compare what happens to a 64-bit Snowflake transaction ID (<code>9007199254740999123</code>) in a naive
            JavaScript viewer using <code>JSON.parse</code> / <code>Number()</code> versus KivaroTools&apos; BigInt-safe
            pipeline:
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="min-w-0 rounded-2xl bg-red-50/50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-900/50 text-xs font-mono text-red-900 dark:text-red-200 overflow-x-auto">
              <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Standard Browser Viewer (Silent IEEE-754 Corruption)</span>
              </div>
              <pre className="leading-relaxed overflow-x-auto max-w-full">{`// Raw 64-bit INT64 in Parquet column: 9007199254740999123
// Cast to JS Number(): 9007199254740999000 (Last 3 digits destroyed!)
{
  "order_id": 100450,
  "customer_snowflake_id": 9007199254740999000,
  "FormulaCell": "=HYPERLINK(\\"http://malicious.tld\\")"
}`}</pre>
            </div>

            <div className="min-w-0 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 p-4 border border-emerald-200 dark:border-emerald-900/50 text-xs font-mono text-emerald-900 dark:text-emerald-200 overflow-x-auto">
              <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>KivaroTools Export (Exact 64-Bit Digits + CWE-1236 Guard)</span>
              </div>
              <pre className="leading-relaxed overflow-x-auto max-w-full">{`// Exact 64-bit BigInt preserved & CWE-1236 formula neutralized:
{
  "order_id": 100450,
  "customer_snowflake_id": "9007199254740999123",
  "FormulaCell": "'=HYPERLINK(\\"http://malicious.tld\\")"
}`}</pre>
            </div>
          </div>
        </div>

        {/* Example 3 */}
        <div className="space-y-3 pt-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-mono">Example 3</span>
            <span>
              Kafka Apache Avro (Obj\x01) Container → JSON Lines (.jsonl / NDJSON) &amp; .avsc Schema Extraction
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            When debugging a Kafka topic dump (<code>iot_sensor_stream.avro</code>), KivaroTools extracts the embedded{' '}
            <code>avro.schema</code> JSON contract from the container header and converts the ZigZag-encoded binary
            records into streamable NDJSON (<code>.jsonl</code>):
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
              <div className="text-indigo-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                Extracted Avro Schema (.avsc) with Nullable Unions
              </div>
              <pre className="leading-relaxed overflow-x-auto max-w-full">{`{
  "type": "record",
  "name": "IoTTelemetryEvent",
  "namespace": "com.kivarotools.analytics",
  "fields": [
    { "name": "event_seq", "type": "int" },
    { "name": "device_uuid", "type": "string" },
    { "name": "temperature_c", "type": "double" },
    { "name": "alert_code", "type": ["null", "string"], "default": null }
  ]
}`}</pre>
            </div>

            <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-amber-300 overflow-x-auto">
              <div className="text-amber-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                Converted JSON Lines (.jsonl / NDJSON) Stream Output
              </div>
              <pre className="leading-relaxed overflow-x-auto max-w-full">{`{"event_seq":500001,"device_uuid":"dev-8840-0001","temperature_c":62.4,"alert_code":"WARN_TEMP_900"}
{"event_seq":500002,"device_uuid":"dev-8840-0002","temperature_c":72.33,"alert_code":null}
{"event_seq":500003,"device_uuid":"dev-8840-0003","temperature_c":73.13,"alert_code":null}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 4: TECHNICAL FORMAT COMPARISON TABLE (PARQUET VS AVRO VS FEATHER VS CSV)
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-format-comparison"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <h2
          id="parquet-viewer-format-comparison"
          className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          Technical Specification: Apache Parquet vs. Apache Avro vs. Arrow Feather vs. CSV
        </h2>
        <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          Compare the internal binary layout, magic byte headers, schema storage locations, encodings, and performance
          trade-offs of modern data engineering formats:
        </p>

        <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-[720px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
              <tr>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Architectural Dimension</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">
                  Apache Parquet (.parquet)
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-indigo-600 dark:text-indigo-400">
                  Apache Avro (.avro)
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400">
                  Arrow Feather (.feather / .arrow)
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Plain CSV (.csv)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Storage Orientation
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Hybrid Columnar (Row Groups + Column Chunks)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Row-Oriented Binary Data Blocks
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  In-Memory Columnar IPC RecordBatches
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Row-Oriented Delimited Text</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Magic Byte Signature
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">
                  0x50 0x41 0x52 0x31 (&quot;PAR1&quot; head &amp; tail)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-indigo-600 dark:text-indigo-400">
                  0x4F 0x62 0x6A 0x01 (&quot;Obj\x01&quot; head)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">
                  0x41 0x52 0x52 0x4F 0x57 0x31 (&quot;ARROW1&quot; / &quot;FEA1&quot;)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono">None (Optional \uFEFF BOM)</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Schema Storage Location
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Trailing Thrift <code>FileMetaData</code> Footer
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Leading JSON Header Map (<code>avro.schema</code>)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  FlatBuffers Message Header &amp; Footer
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Untyped (Header row names only)
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Binary Value Encodings
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  RLE_DICTIONARY, PLAIN, DELTA_BINARY_PACKED
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Variable-Length ZigZag Varints + Raw Bytes
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  64-Byte Aligned Buffers + Validity Bitmaps
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">UTF-8 / ASCII Text Strings</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Compression Codecs
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Snappy, ZSTD, GZIP, LZ4_RAW, Brotli
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  null, deflate, snappy (with CRC32), zstandard
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Uncompressed, LZ4_FRAME, ZSTD</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">External (.csv.gz / .zip)</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Predicate Pushdown / Stats
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Yes (Row Group Min/Max Zone Maps &amp; Null Counts)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Block-level sync markers only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">RecordBatch slicing</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400">
                  No (Full sequential scan required)
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Primary Industry Use Case
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  OLAP Warehouses (Snowflake, BigQuery, Athena, Spark)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Kafka Event Streaming, Debezium CDC, RPC
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Zero-Copy Python (Polars/Pandas), R &amp; ML Tensors
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Spreadsheet Handoffs (Excel / Google Sheets)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================================
          SECTION 5: COMPETITOR COMPARISON MATRIX (KIVAROTOOLS VS MARKET ALTERNATIVES)
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-competitor-matrix"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <h2
          id="parquet-viewer-competitor-matrix"
          className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          Enterprise Capabilities Benchmark: KivaroTools vs. Existing Online Viewers
        </h2>
        <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          See how the KivaroTools Parquet, Avro &amp; Feather Studio compares against standalone single-format viewers
          and freemium conversion portals:
        </p>

        <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
              <tr>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Capability / Feature</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">
                  KivaroTools (100% Free)
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                  Parquet-Viewer.com / ParquetReader
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                  DevToolLab / ExtendsClass (Avro)
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                  DataConverter.io / ConversionTools
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Supported Binary Formats
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                  Parquet + Avro + Feather/Arrow + JSONL/CSV
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Parquet Only (or separate pages)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Avro Only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Single format per tool URL</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Free Export Row Limit
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                  Unlimited (Full In-Browser Dataset)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">
                  Often capped at 1,000 rows on free tier
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Raw JSON dump only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">
                  Daily file size &amp; credit limits
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  64-Bit INT64 BigInt Safety
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                  Native BigInt String Preservation
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Partial (Varies by export format)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400">
                  Truncates &gt; Number.MAX_SAFE_INTEGER
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Varies</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Polyglot SQL DDL &amp; SDK Code
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                  10 Targets (Snowflake, BigQuery, Postgres, DuckDB, ClickHouse, PyArrow, Polars, TS, Avro, JSON Schema)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Basic column list only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Raw Avro JSON header only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Statistical Column Profiler
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                  Null %, Distinct %, P25/P50/P75 Quantiles, Mean, StdDev &amp; Top Values
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Min/Max &amp; Null count</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Binary X-Ray Footer Inspector
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                  Magic Hex, Thrift Footer, Row Group Zone Maps &amp; Sync Markers
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Basic metadata view</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">None</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">None</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  CWE-1236 Formula Defense &amp; BOM
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                  Built-In Formula Sanitizer + UTF-8 BOM Toggle
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Unescaped CSV</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Unescaped CSV</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Unescaped CSV</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================================
          SECTION 6: SUPPORTED EXPORT & SCHEMA TARGETS SPECIFICATION TABLE
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-export-targets"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2 mb-2">
          <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2
            id="parquet-viewer-export-targets"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Supported Export Formats &amp; Polyglot Schema Code Targets
          </h2>
        </div>
        <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          Every dataset loaded into the studio can be exported or compiled into the following tabular, streaming, and
          data warehouse formats:
        </p>

        <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-[680px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
              <tr>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Target Output</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Extension / Dialect</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Key Engineering Features</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Primary Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  RFC 4180 CSV Spreadsheet
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">
                  .csv (text/csv)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Custom delimiter (<code>,</code> <code>;</code> <code>\t</code> <code>|</code>), UTF-8 BOM (
                  <code>\uFEFF</code>), CWE-1236 Formula Guard
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Microsoft Excel, Google Sheets &amp; BI handoffs
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Native Microsoft Excel Workbook
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">
                  .xlsx (application/vnd.openxmlformats)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Real PKZIP Office Open XML binary workbook with frozen top header row, native auto-filter, XML-escaped cell content, 64-bit integer safety &amp; CWE-1236 guard
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Direct opening in Microsoft Excel 2013–365, Apple Numbers, Google Sheets &amp; LibreOffice Calc without text wizards
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Tab-Separated Values
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">
                  .tsv (text/tab-separated-values)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Zero comma collisions, clipboard-ready for spreadsheet paste
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  PostgreSQL <code>COPY</code> &amp; CLI awk/cut pipelines
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  JSON Array &amp; JSON Lines
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">
                  .json / .jsonl (NDJSON)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Preserves nested <code>STRUCT</code>/<code>LIST</code> trees &amp; BigInt string accuracy
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  REST APIs, LLM fine-tuning, BigQuery &amp; ClickHouse
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  SQL Batch INSERT Script
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">
                  .sql (INSERT INTO ... VALUES)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Single-quote escaping (<code>&apos;&apos;</code>), boolean &amp; <code>NULL</code> literal mapping
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Seeding relational staging &amp; test databases
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Markdown &amp; HTML5 Tables
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">
                  .md / .html
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Pipe-escaped GitHub Flavored Markdown &amp; XSS-escaped HTML entities
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  GitHub PRs, Notion docs, Confluence &amp; static reports
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  10-Dialect Schema &amp; DDL
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">
                  SQL / .ts / .py / .avsc / .json
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  PostgreSQL, Snowflake, BigQuery, DuckDB (with CREATE TABLE + read_parquet), ClickHouse, TS, PyArrow, Polars, Avro, JSON Schema
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Automated warehouse table creation &amp; SDK typing
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Cross-Format Binary Transcoding
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-indigo-600 dark:text-indigo-400">
                  .parquet / .avro / .feather
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Lossless in-memory binary transcoding between columnar Parquet (PAR1), streaming Avro (Obj\x01), and memory-mapped Arrow Feather (ARROW1)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Kafka Avro stream ingestion into Parquet lakehouses or Arrow dataframe pipelines without Python dependencies
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================================
          SECTION 7: DEVELOPER TROUBLESHOOTING & BINARY EDGE-CASE GUIDE
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-troubleshooting-guide"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <h2
          id="parquet-viewer-troubleshooting-guide"
          className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          Common Parquet, Avro &amp; Feather Errors, Edge Cases &amp; Fixes
        </h2>
        <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          Diagnose and resolve the 6 most common binary data engineering issues encountered when working with lakehouse
          and streaming files:
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              1. Missing Trailing &quot;PAR1&quot; Footer Magic Bytes
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Cause:</strong> Apache Parquet files store their Thrift <code>FileMetaData</code> footer at the
              very end of the file. An interrupted S3/GCS download or unclosed Spark writer stream leaves the file
              without its trailing <code>PAR1</code> bytes.
              <br />
              <strong>Fix:</strong> Verify the file byte size against your object storage bucket and re-download the
              complete object, or inspect the recovered tokens in the Binary X-Ray tab.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              2. 64-Bit Snowflake IDs Rounding to Zeros in Excel
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Cause:</strong> Even when a CSV preserves all 19 digits of an <code>INT64</code> ID (e.g.{' '}
              <code>9007199254740999123</code>), Microsoft Excel converts unquoted numeric columns over 15 digits into
              scientific notation with trailing zeros (<code>9.0072E+18</code>).
              <br />
              <strong>Fix:</strong> Export to JSON/JSONL (where KivaroTools quotes unsafe 64-bit integers as strings) or
              import the CSV via Excel&apos;s Data → From Text/CSV wizard and set the ID column type to{' '}
              <strong>Text</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              3. Confluent Wire Format vs. Avro Object Container Files
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Cause:</strong> Raw Kafka message payloads serialized with Confluent Schema Registry start with
              magic byte <code>0x00</code> + a 4-byte Schema ID (without the schema itself), whereas standalone{' '}
              <code>.avro</code> files start with <code>Obj\x01</code> (<code>0x4F626A01</code>) and embed the full{' '}
              <code>avro.schema</code> JSON.
              <br />
              <strong>Fix:</strong> Check the Binary X-Ray tab&apos;s Header Hex display to confirm whether your dump is
              an Avro Object Container File (<code>4F 62 6A 01</code>) or a schema-less wire payload.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              4. Legacy Spark / Impala INT96 Timestamps
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Cause:</strong> Older Apache Spark (pre-3.0) and Apache Impala pipelines wrote timestamps as
              12-byte <code>INT96</code> values (8-byte time-of-day nanoseconds + 4-byte Julian day number), which modern
              parsers sometimes show as raw byte arrays.
              <br />
              <strong>Fix:</strong> KivaroTools maps timestamp logical types cleanly to ISO-8601 UTC strings and
              generates <code>TIMESTAMPTZ</code> / <code>TIMESTAMP_NTZ</code> definitions in the DDL generator.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              5. Garbled UTF-8 Characters in Windows Excel (Mojibake)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Cause:</strong> Opening a standard UTF-8 CSV in Windows Excel without a Byte Order Mark causes
              multi-byte Unicode strings (Arabic, Urdu, Japanese, German umlauts, emojis) to render as corrupted ANSI
              symbols.
              <br />
              <strong>Fix:</strong> Keep the <strong>Include UTF-8 BOM (\uFEFF)</strong> toggle checked in the Export
              Studio before downloading your CSV.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              6. Feather v1 (FEA1) vs. Feather v2 / Arrow IPC (ARROW1)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Cause:</strong> Many modern Arrow tools dropped support for legacy Feather v1 (<code>FEA1</code>)
              files created by early versions of Pandas/R, throwing an invalid magic header error.
              <br />
              <strong>Fix:</strong> KivaroTools inspects both <code>FEA1</code> (Feather v1), <code>ARROW1</code>{' '}
              (Feather v2 IPC File), and <code>0xFFFFFFFF</code> (Arrow IPC Stream) containers seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 8: SEARCH INTENT & SUPPORTED WORKFLOW COVERAGE (30 TARGET KEYWORDS)
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-workflow-coverage"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2 mb-2">
          <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2
            id="parquet-viewer-workflow-coverage"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Supported Lakehouse, Streaming &amp; Conversion Workflows
          </h2>
        </div>
        <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          Whether you are debugging an AWS S3 data lake partition, inspecting a Kafka dead-letter queue, or converting a
          Polars dataframe for spreadsheet review, this unified studio consolidates 30+ specialized data workflows into
          one privacy-first interface:
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Parquet Viewer &amp; Converter Workflows
            </h3>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
              <li>Open Parquet file online without Python or Pandas</li>
              <li>Read Parquet file in browser without uploading</li>
              <li>Convert Parquet to CSV &amp; Excel (<code>.xlsx</code>) online</li>
              <li>Parquet to JSON &amp; JSONL (NDJSON) converter</li>
              <li>Parquet schema viewer &amp; Thrift footer inspector</li>
              <li>Parquet Row Group &amp; Column Chunk zone map viewer</li>
              <li>Snappy, GZIP, ZSTD &amp; RLE Parquet reader online</li>
              <li>64-bit INT64 BigInt safe Parquet to JSON converter</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Avro &amp; Kafka Streaming Workflows
            </h3>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
              <li>Avro viewer online free (<code>Obj\x01</code> container reader)</li>
              <li>Convert Avro to JSON &amp; JSON Lines (<code>.jsonl</code>) online</li>
              <li>Convert Avro to CSV &amp; Excel spreadsheet in browser</li>
              <li>Avro schema extractor &amp; <code>.avsc</code> contract viewer</li>
              <li>Kafka Avro binary message &amp; sync marker inspector</li>
              <li>Inspect Avro nullable union branches &amp; nested maps</li>
              <li>ZigZag varint &amp; Snappy CRC32 block inspector</li>
              <li>Transcode Avro to Parquet or Arrow Feather locally</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Arrow Feather, DDL &amp; Profiling Workflows
            </h3>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
              <li>Feather file viewer online (<code>.feather</code> / <code>.arrow</code>)</li>
              <li>Apache Arrow IPC file &amp; stream viewer in browser</li>
              <li>Convert Feather to CSV, JSON &amp; Parquet online</li>
              <li>Generate Snowflake, BigQuery &amp; Postgres DDL from Parquet</li>
              <li>DuckDB, ClickHouse, PyArrow &amp; Polars schema generator</li>
              <li>Column profiler with P25/P50/P75 quantiles &amp; cardinality</li>
              <li>CWE-1236 formula injection safe CSV exporter</li>
              <li>UTF-8 BOM CSV export for Microsoft Excel on Windows</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 9: FREQUENTLY ASKED QUESTIONS (16 INTERACTIVE ACCORDIONS)
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-frequently-asked-questions"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2
            id="parquet-viewer-frequently-asked-questions"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {PARQUET_VIEWER_FAQS.map((faq, index) => (
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
          SECTION 10: INTERNAL CROSS-LINKING TO RELATED DEVELOPER TOOLS
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-related-utilities"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2
            id="parquet-viewer-related-utilities"
            className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Related Client-Side Data Engineering &amp; Developer Utilities
          </h2>
        </div>
        <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed break-words">
          Continue your data transformation, schema formatting, and binary inspection workflow with our integrated
          browser tools:
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/developer/json-converter"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              JSON to CSV, Excel (.xlsx), YAML &amp; XML Converter →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Flatten deeply nested JSON payloads up to 50 MB (200,000 rows) into spreadsheets with CWE-1236 defense.
            </p>
          </Link>

          <Link
            href="/developer/sql-formatter"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              SQL Query Formatter, Linter &amp; AST Analyzer →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Format, beautify, and lint generated DDL and queries across 19 dialects including Snowflake, BigQuery &amp; DuckDB.
            </p>
          </Link>

          <Link
            href="/developer/json-formatter"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              JSON Formatter, Validator &amp; Tree Viewer →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Inspect, repair, and query exported JSON and Avro schema (.avsc) documents up to 25 MB.
            </p>
          </Link>

          <Link
            href="/developer/base64-encoder"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              Base64 Encoder, Decoder &amp; Binary Hex Inspector →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Decode Base64-encoded Kafka Avro payloads and inspect binary magic-byte signatures locally.
            </p>
          </Link>

          <Link
            href="/developer/regex-tester"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              Regex Tester, Debugger &amp; Code Generator →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Build and benchmark extraction patterns for log columns with a 1,200 ms ReDoS safety watchdog.
            </p>
          </Link>

          <Link
            href="/document/excel-to-pdf"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              Excel (.xlsx / .csv) to PDF Report Converter →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Turn your exported Parquet or Avro CSV/Excel spreadsheets into executive PDF tables in your browser.
            </p>
          </Link>
        </div>
      </section>
    </article>
  );
}
