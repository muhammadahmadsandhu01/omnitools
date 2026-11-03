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
      'Drag and drop your .parquet file directly into the KivaroTools Parquet, Avro & Feather Viewer. Your selected file contents are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources. You do not need to install Python, Pandas, PyArrow, or DuckDB CLI.',
  },
  {
    question: 'What is the difference between Apache Parquet, Apache Avro, and Apache Arrow Feather (.arrow)?',
    answer:
      'Apache Parquet (.parquet) is a compressed columnar storage format with a trailing Thrift FileMetaData footer, engineered for analytical OLAP data warehouses (Snowflake, AWS Athena, Google BigQuery, Databricks, DuckDB). Apache Avro (.avro) is a row-oriented Object Container File (Obj\\x01) that embeds its JSON schema (avro.schema) in the file header alongside a 16-byte sync marker. Feather exists in two distinct binary architectures: legacy Feather V1 (FEA1 magic bytes, which stores uncompressed columns described by a trailing CTable / PrimitiveArray FlatBuffer) and Feather V2 (ARROW1 magic bytes, which uses the Apache Arrow IPC encapsulated Schema + RecordBatch format with standard UNCOMPRESSED or LZ4_FRAME compression, plus a KivaroTools internal Snappy fallback container for in-browser transcoding). KivaroTools implements dedicated, separate parsers for both Feather V1 and Feather V2.',
  },
  {
    question: 'How does KivaroTools prevent 64-bit integer (INT64 / UINT64) precision loss in the browser?',
    answer:
      'Standard JavaScript numbers use IEEE-754 double-precision floating-point values, which only guarantee exact integer precision up to Number.MAX_SAFE_INTEGER (9,007,199,254,740,991). In ordinary online Parquet or JSON viewers, 64-bit Snowflake IDs, Stripe/Twitter transaction IDs, and nanosecond timestamps silently round to trailing zeros. KivaroTools decodes 64-bit physical integers using native JavaScript BigInt, executes exact BigInt-aware numeric predicate filtering (=, !=, >, >=, <, <= via compareExactNumericValues) and sorting without float conversion, and serializes values exceeding safe bounds as exact decimal strings across the Data Grid, JSON/JSONL exports, SQL INSERT batches, and CSV/Excel downloads.',
  },
  {
    question: 'Can I convert Parquet, Avro, and Feather files to CSV and Microsoft Excel (.xlsx) in the browser?',
    answer:
      'Yes. Within the 250 MB input file safeguard and 5,000,000-row allocation ceiling, KivaroTools lets you export either your filtered/projected view or the full loaded dataset (including rows outside the current paginated or virtualized viewport) to RFC 4180 CSV (with custom comma, semicolon, tab, or pipe delimiters and UTF-8 BOM), native binary Microsoft Excel (.xlsx) PKZIP Office Open XML workbooks with frozen headers and auto-filters, JSON arrays, JSON Lines (.jsonl / NDJSON), SQL INSERT statements, Markdown tables, or standalone HTML tables, plus cross-format binary transcoding across supported Parquet, Avro, and Feather types.',
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
      'The pure-TypeScript binary engine decodes Uncompressed (PLAIN), Snappy (LZ77 block decompression in Parquet, Avro with 4-byte CRC32 checksum verification, and the KivaroTools internal Feather fallback container), GZIP / DEFLATE (synchronous RFC 1951 / RFC 1952 INFLATE), and LZ4 (both LZ4 and LZ4_RAW in Parquet, and standard LZ4_FRAME in Feather V2 / Arrow IPC) blocks, along with Parquet Hybrid Run-Length Encoding / Bit-Packing (RLE_DICTIONARY, PLAIN_DICTIONARY, and boolean RLE) across DataPage v1, DataPage v2, and DictionaryPage structures. If a file uses an unsupported compression codec (such as ZSTD, Brotli, LZO, bzip2, or xz) or an unsupported delta page encoding (such as DELTA_BINARY_PACKED), the parser displays an explicit unsupported-codec diagnostic message rather than returning fabricated or corrupted data.',
  },
  {
    question: 'What is CWE-1236 CSV Formula Injection protection and why does it matter when exporting data?',
    answer:
      'When exporting untrusted string columns into CSV or Excel (.xlsx), cell values beginning with =, +, -, or @ may be interpreted by spreadsheet programs as formulas or DDE commands (CWE-1236). KivaroTools provides a tested 15-vector formula-injection mitigation that detects leading =, +, -, @, whitespace/tab/CR/LF/control prefixes, full-width Unicode variants (\\uFF1D, \\uFF0B, \\uFF20, \\uFF0D), and en/em-dashes, prepending a literal single quote (\') while preserving legitimate negative numbers (such as -42.5 or -1.5e-4). Because spreadsheet applications vary in how they parse imported text, this mitigation should be combined with safe import settings in your target spreadsheet tool.',
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
      'Unlike CSV or JSON files which stream top-to-bottom, Apache Parquet stores its Thrift FileMetaData schema and Row Group offsets at the very end of the file right before the trailing 4-byte "PAR1" magic signature. If a file download from Amazon S3, GCS, or Azure Blob Storage was interrupted midway, the trailing PAR1 signature or footer is missing. KivaroTools strictly validates both leading and trailing magic bytes plus footer byte bounds and immediately displays a clear truncation error so incomplete files are never mistaken for valid datasets.',
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
            Client-Side In-Browser Binary Engine
          </span>
        </div>

        <p className="mt-3 w-full text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          Open, query, profile, and convert binary <strong>Apache Parquet (<code>.parquet</code>)</strong>,{' '}
          <strong>Apache Avro (<code>.avro</code>)</strong>, and{' '}
          <strong>Apache Arrow Feather (<code>.feather</code> / <code>.arrow</code> / <code>.ipc</code>)</strong>{' '}
          datasets directly in your browser via a background Web Worker (with automatic main-thread fallback) and 64-bit{' '}
          <code>BigInt</code> precision safety. Your selected file contents are processed locally in your browser and are not uploaded to KivaroTools servers (the website may still load general analytics or other third-party website resources).
        </p>

        <blockquote className="p-4 my-6 bg-blue-50/80 border-l-4 border-blue-600 rounded-r-xl dark:bg-slate-800/80 not-italic">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
            <strong>Local Browser Processing &amp; Privacy Disclosure:</strong> Your selected file contents are processed
            locally in your browser and are not uploaded to KivaroTools servers. The website may still load general
            analytics or other third-party website resources.
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
              Exact 64-Bit BigInt Preservation
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
          When you drop a binary file into the studio (up to the <code>250 MB</code> input safeguard), a background Web Worker—with automatic main-thread fallback if Worker execution is unavailable—executes <code>lib/columnarViewerEngine.ts</code> through a deterministic 5-stage pipeline locally in browser memory:
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
              Preserves 64-bit integers outside <code>±9,007,199,254,740,991</code> as exact strings across display,
              sorting, and BigInt-aware numeric filters (<code>compareExactNumericValues</code>), while computing
              null ratios, distinct cardinality, mean, StdDev, and <code>P25 / P50 / P75</code> quantiles.
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
          SECTION 2B: COMPLETE STEP-BY-STEP USER GUIDE (HOW TO USE EVERY FEATURE)
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-complete-user-guide"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
      >
        <div>
          <h2
            id="parquet-viewer-complete-user-guide"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Complete Step-by-Step User Guide: How to Open, Filter, Profile &amp; Convert Files
          </h2>
          <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            Follow this walkthrough to use every tab, filter operator, grid mode, schema generator, and export option—even if you are opening a binary columnar file for the first time:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 1: Load Your File or Try a 1-Click Sample Dataset
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Drag and drop a local <code>.parquet</code>, <code>.avro</code>, <code>.feather</code> (Feather V1{' '}
              <code>FEA1</code> or Feather V2 <code>ARROW1</code>), <code>.arrow</code>, <code>.ipc</code>,{' '}
              <code>.jsonl</code>, or <code>.csv</code> file (up to <code>250 MB</code>) into the top upload box—or
              click one of the three built-in presets (<strong>E-Commerce Orders .parquet</strong>,{' '}
              <strong>IoT Telemetry .avro</strong>, or <strong>LLM Embedding Store .feather</strong>). The 6-card
              Telemetry Bar immediately shows the detected format version, magic signature bytes, row and column counts,
              compression codec, binary footprint, and parse latency.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 2: Search, Filter (11 Operators + AND/OR) &amp; Sort in the Data Grid
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              In the <strong>Data Explorer Grid</strong> tab, type into the search bar to match text across all columns
              and nested objects. To build structured queries, choose a column, select one of the <strong>11 operators</strong>{' '}
              (<code>Contains</code>, <code>=</code>, <code>≠</code>, <code>&gt;</code>, <code>≥</code>,{' '}
              <code>&lt;</code>, <code>≤</code>, <code>Starts With</code>, <code>Ends With</code>, <code>Is NULL</code>,{' '}
              <code>Is Not NULL</code>), enter a value, and click <strong>Add</strong>. Toggle between{' '}
              <code>AND</code> and <code>OR</code> combinators (evaluated sequentially left-to-right). All numeric
              comparisons use <code>compareExactNumericValues()</code> so 19-digit 64-bit <code>BigInt</code> IDs filter
              and sort without floating-point rounding.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 3: Toggle Paginated vs. Virtualized Scroll, Project Columns &amp; Inspect Rows
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Use the footer toggle to switch between <strong>Paginated Mode</strong> (<code>10</code>, <code>25</code>,{' '}
              <code>50</code>, <code>100</code>, or <code>250</code> rows per page) and{' '}
              <strong>Virtualized Scroll Mode</strong> (which renders a windowed viewport slice for continuous scrolling
              across large datasets). Click <strong>Columns (N/M)</strong> to hide sensitive PII columns before
              exporting, and click any row in the table to open the <strong>Row Deep Inspector Drawer</strong> showing
              pretty-printed nested <code>STRUCT</code>, <code>LIST</code>, and <code>MAP</code> JSON with a 1-click
              copy button.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 4: Generate 10-Dialect SQL DDL, Profile Quantiles &amp; Inspect Binary Footers
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Open <strong>Schema &amp; DDL Generator</strong> to translate the binary schema into{' '}
              <code>PostgreSQL</code>, <code>Snowflake</code>, <code>BigQuery</code>, <code>DuckDB</code>,{' '}
              <code>ClickHouse</code>, <code>TypeScript</code>, <code>PyArrow</code>, <code>Polars</code>,{' '}
              <code>Avro (.avsc)</code>, or <code>JSON Schema</code>. Open <strong>Column Profiler &amp; Stats</strong>{' '}
              to check null percentages, distinct ratios, <code>P25 / P50 / P75</code> quantiles, and top frequent
              values, or open <strong>Binary X-Ray Inspector</strong> to audit header/footer hex bytes, Row Group zone
              maps, and 16-byte Avro sync markers.
            </p>
          </div>
        </div>

        {/* Supported vs Unsupported Format & Codec Matrix */}
        <div className="pt-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Verified Format, Encoding &amp; Codec Compatibility Matrix
          </h3>
          <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-[680px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                <tr>
                  <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Container Format</th>
                  <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Supported Codecs &amp; Encodings (In-Browser)</th>
                  <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Supported Data Types</th>
                  <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Disclosed Unsupported Features (Explicit Error Shown)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                    Apache Parquet (<code>PAR1</code>)
                  </th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">
                    <code>UNCOMPRESSED</code>, <code>SNAPPY</code>, <code>GZIP</code>, <code>LZ4</code>, <code>LZ4_RAW</code> •{' '}
                    <code>PLAIN</code>, <code>RLE_DICTIONARY</code>, <code>PLAIN_DICTIONARY</code>, <code>RLE</code>{' '}
                    (DataPage v1 &amp; v2)
                  </td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">
                    <code>BOOLEAN</code>, <code>INT32</code>, <code>INT64</code> (BigInt), <code>UINT8..64</code>,{' '}
                    <code>INT96</code>, <code>FLOAT</code>, <code>DOUBLE</code>, <code>DECIMAL</code>,{' '}
                    <code>UTF8</code>, <code>DATE</code>, <code>TIMESTAMP</code>, <code>UUID</code>, 1-level{' '}
                    <code>LIST</code>
                  </td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">
                    <code>ZSTD</code>, <code>BROTLI</code>, <code>LZO</code>, <code>DELTA_BINARY_PACKED</code>,{' '}
                    <code>BYTE_STREAM_SPLIT</code>, multi-level Dremel repetition (<code>maxRepLevel &gt; 1</code>), KMS{' '}
                    <code>PARE</code> encryption
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                    Apache Avro OCF (<code>{'Obj\\x01'}</code>)
                  </th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">
                    <code>null</code> (uncompressed), <code>deflate</code> (RFC 1951), <code>snappy</code> (with 4-byte
                    CRC32 verification)
                  </td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">
                    <code>null</code>, <code>boolean</code>, <code>int</code>, <code>long</code> (BigInt),{' '}
                    <code>float</code>, <code>double</code>, <code>bytes</code>, <code>string</code>,{' '}
                    <code>record</code>, <code>enum</code>, <code>array</code>, <code>map</code>, <code>union</code>,{' '}
                    <code>fixed</code>, <code>decimal</code>
                  </td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">
                    <code>bzip2</code>, <code>xz</code>, <code>zstandard</code> codecs; external Confluent Wire Format
                    messages (<code>0x00</code> magic without embedded <code>avro.schema</code>)
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                    Feather V1 (<code>FEA1</code>)
                  </th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">
                    Dedicated V1 <code>CTable</code> / <code>PrimitiveArray</code> FlatBuffers reader (
                    <code>UNCOMPRESSED</code>, <code>PLAIN</code>)
                  </td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">
                    <code>BOOL</code>, <code>INT8..64</code> (BigInt), <code>UINT8..64</code>, <code>FLOAT</code>,{' '}
                    <code>DOUBLE</code>, <code>UTF8</code>, <code>BINARY</code>, <code>DATE</code>,{' '}
                    <code>TIMESTAMP</code> (with 8B-padded null bitmaps)
                  </td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">
                    Dictionary-encoded V1 categorical arrays (<code>encoding != PLAIN</code>)
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                    Feather V2 / Arrow IPC (<code>ARROW1</code> / <code>0xFFFFFFFF</code>)
                  </th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">
                    Encapsulated Arrow IPC <code>Schema</code> + <code>RecordBatch</code> FlatBuffers reader (standard{' '}
                    <code>UNCOMPRESSED</code>, <code>LZ4_FRAME</code>; plus KivaroTools internal Snappy fallback container)
                  </td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">
                    <code>Bool</code>, <code>Int8..64</code> (BigInt), <code>UInt8..64</code>, <code>Float32/64</code>,{' '}
                    <code>Utf8/LargeUtf8</code>, <code>Binary/LargeBinary</code>, <code>Date32/64</code>,{' '}
                    <code>Timestamp</code>
                  </td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">
                    <code>ZSTD</code> RecordBatch compression, <code>Float16</code>, nested IPC Union/Map/Tensor buffers
                  </td>
                </tr>
              </tbody>
            </table>
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
                  V1: 0x46454131 (&quot;FEA1&quot; CTable) • V2: 0x4152524F5731 (&quot;ARROW1&quot; IPC)
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
                  V1: Trailing CTable FlatBuffer • V2: Encapsulated Arrow IPC Schema &amp; Footer
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
                  Supported: PLAIN, RLE_DICTIONARY, PLAIN_DICTIONARY, RLE (DELTA_BINARY_PACKED unsupported)
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
                  Supported: UNCOMPRESSED, SNAPPY, GZIP, LZ4, LZ4_RAW (ZSTD, Brotli &amp; LZO unsupported)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Supported: null, deflate, snappy with CRC32 (zstandard, bzip2 &amp; xz unsupported)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Supported: V1 Uncompressed • V2 standard Uncompressed &amp; LZ4_FRAME + KivaroTools internal Snappy fallback (ZSTD unsupported)</td>
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
          Architectural Scope &amp; Feature Matrix: KivaroTools In-Browser Studio
        </h2>
        <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          Summary of verified client-side capabilities, safety limits, and architectural scope compared across common data inspection workflows:
        </p>

        <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
              <tr>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Capability / Feature</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">
                  KivaroTools (In-Browser Studio)
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                  Single-Format Previewers
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                  Raw JSON Schema Dumpers
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                  Server-Upload Converters
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Supported Binary Formats
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                  Parquet (PAR1) + Avro (Obj\x01) + Feather V1 (FEA1) &amp; V2 (ARROW1) + JSONL/CSV
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Single format only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Header/JSON dump only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Requires remote file upload</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Input &amp; Export Safeguards
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                  Up to 250 MB input / 5,000,000 rows in browser memory (Web Worker + main-thread fallback)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">
                  Often limited to visible preview page
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Unpaginated text output</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">
                  Network upload &amp; quota limits
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
                  In-memory binary transcoding across supported Parquet (PAR1), Avro (Obj\x01), and Arrow Feather (ARROW1 internal Snappy fallback container) schemas (preserving 64-bit BigInt strings, IEEE-754 Float32/Float64, booleans, nulls, and UTF-8)
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
              complete object, or verify the file&apos;s leading and trailing bytes in the Binary X-Ray tab.
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
              <li>Snappy, GZIP, LZ4 / LZ4_RAW &amp; RLE Parquet reader online (ZSTD/Brotli explicitly flagged as unsupported)</li>
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