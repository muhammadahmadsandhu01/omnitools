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
} from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

export const PARQUET_VIEWER_FAQS: FaqItem[] = [
  {
    question: 'How do I open Parquet file online without Python, Spark, or a desktop app?',
    answer:
      'Drop any local .parquet file (up to 250 MB / 5,000,000 rows) into this parquet viewer online. KivaroTools works as a browser-based parquet file reader via a background Web Worker—no Python, PyArrow, or installation required. Your selected file contents stay locally in browser memory and are not uploaded to KivaroTools servers (the website may still load general analytics or third-party resources).',
  },
  {
    question: 'How do I convert Parquet to CSV or Parquet to Excel (.xlsx) for free?',
    answer:
      'Load your .parquet file, optionally filter rows or hide columns in Tab 1 so your export stays compact, then open Tab 5 (Export). Choose CSV (with custom delimiters, UTF-8 BOM, and CWE-1236 formula protection) or native Excel (.xlsx) and download free with zero signup or watermarks.',
  },
  {
    question: 'How do I open an Avro (.avro) or Feather (.feather) file online and convert it to CSV or Parquet?',
    answer:
      'Drop any Apache Avro OCF (Obj\\x01) or Arrow Feather V1/V2 (FEA1 / ARROW1) file into this free avro file viewer and feather file viewer online. Browse rows in the grid, export avro to csv online or feather to csv online, or use Tab 5 as an avro to parquet converter (and parquet to avro online / → .feather) directly in your browser.',
  },
  {
    question: 'What is the difference between Apache Parquet, Apache Avro, and Arrow Feather?',
    answer:
      'Parquet is a compressed columnar format with a trailing Thrift footer built for analytical OLAP warehouses (Snowflake, BigQuery, Athena, DuckDB). Avro is a row-oriented streaming container (Obj\\x01) with a leading JSON schema map and 16-byte sync markers suited to Kafka and schema evolution. Feather stores columnar Arrow memory buffers—legacy V1 (FEA1) uses a trailing CTable FlatBuffer, while V2 (ARROW1) uses encapsulated Arrow IPC Schema, DictionaryBatch, and RecordBatch messages.',
  },
  {
    question: 'Can I run custom SQL SELECT queries on my Parquet file here?',
    answer:
      'No free-text SQL console runs on this page. Use the 11-operator AND/OR Predicate Filter in Tab 1 (including Is NULL / Is Not NULL and exact 64-bit BigInt comparisons) or generate CREATE TABLE DDL and INSERT scripts in Tabs 2 and 5. For full SQL SELECT, JOIN, CTE, and GROUP BY execution in the browser, open KivaroTools’ SQLite & DuckDB Browser Studio (/developer/sqlite-viewer).',
  },
  {
    question: 'Which compression codecs are supported—and why will ZSTD files not open?',
    answer:
      'The browser engine decodes UNCOMPRESSED, SNAPPY (with Avro CRC32 verification), GZIP/DEFLATE, LZ4, LZ4_RAW, and Arrow LZ4_FRAME. Native C++ codecs (ZSTD, Brotli, LZO, bzip2, xz), delta encodings (DELTA_BINARY_PACKED), Apache ORC, and KMS-encrypted Parquet (PARE) are currently unsupported for row decoding—though header/footer hex bytes can still be inspected in Forensic Binary X-Ray.',
  },
  {
    question: 'How does KivaroTools preserve 64-bit INT64 / BigInt precision without rounding?',
    answer:
      'JavaScript’s Number type loses integer accuracy above 9,007,199,254,740,991 (2^53 − 1), collapsing 18-digit Snowflake IDs into duplicate floats. For binary Parquet (INT64/UINT64), Avro (long), and Arrow/Feather (Int64/UInt64) files, KivaroTools decodes 64-bit integers with native BigInt, compares them accurately in filters and sorts, and serializes unsafe values as exact decimal strings across JSON, CSV, SQL, and .xlsx exports.',
  },
  {
    question: 'How do I inspect Parquet Row Groups, Thrift metadata, and generate SQL DDL?',
    answer:
      'Open Tab 2 (Schema & DDL) to view physical and logical types and compile parquet to SQL DDL—including parquet to Snowflake DDL, parquet to BigQuery DDL, PostgreSQL, DuckDB, ClickHouse, PyArrow, Polars, TypeScript, Avro (.avsc), and JSON Schema. Open Tab 4 (Binary X-Ray) to inspect Row Groups, Column Chunks, codecs, encodings, min/max zone maps, and trailing footer hex.',
  },
  {
    question: 'Can I edit cell values inside a Parquet file or stream remote S3 URLs?',
    answer:
      'No. This tool is a local read, filter, profile, schema, and conversion workbench—it does not edit cells inline or stream remote S3, GCS, HTTPS, or Hugging Face URLs. Download the file locally first (within the 250 MB / 5M-row ceiling) and drop it into the viewer.',
  },
  {
    question: 'How does the CWE-1236 CSV formula guard and UTF-8 BOM protect Excel users?',
    answer:
      'Untrusted strings starting with =, +, -, or @ can execute as spreadsheet formulas (CWE-1236). KivaroTools’ 15-vector sanitizer prefixes risky cells with a single quote while preserving valid negative numbers (like -42.5). Enabling UTF-8 BOM (\\uFEFF) prevents Windows Excel from mangling Arabic, Urdu, CJK, accented European text, and emojis.',
  },
  {
    question: 'What happens if my Parquet or Avro file has a truncated footer or CRC32 error?',
    answer:
      'Interrupted cloud downloads often cut off Parquet’s trailing PAR1 footer or corrupt an Avro block checksum. Instead of failing silently, KivaroTools displays a clear diagnostic error and unlocks Forensic Partial X-Ray Mode in Tab 4 so you can inspect the leading header signature, trailing 16 hex bytes, and file size.',
  },
  {
    question: 'When should I export parquet to JSONL online (.jsonl / NDJSON) instead of JSON (.json)?',
    answer:
      'Standard JSON wraps every record inside one top-level array ([...]), forcing downstream parsers to buffer the whole file in RAM. JSON Lines (.jsonl / NDJSON) writes one self-contained JSON object per line—ideal for BigQuery loads, ClickHouse JSONEachRow, LLM fine-tuning sets, and Unix jq streaming.',
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
    name: 'How to Open, Filter, Inspect, and Convert Parquet, Avro, and Feather Files Online',
    description:
      'Step-by-step guide to viewing Apache Parquet, Avro, and Arrow Feather files locally in your browser, filtering rows with 64-bit BigInt accuracy, generating 10-target SQL DDL, inspecting Binary X-Ray Row Groups, and exporting 11 formats including CSV and Excel (.xlsx).',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Drop a Local Binary File or Load a Built-In Sample',
        text: 'Drop a local .parquet, .avro, .feather, .arrow, .ipc, .jsonl, or .csv file (up to 250 MB) into the browser dropzone, or click one of the three built-in sample datasets.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Search, Filter, Sort, and Inspect Nested JSON Rows',
        text: 'Use Tab 1 (Data Grid) to search across columns, open the 11-operator AND/OR Predicate Filter, hide PII columns, switch between Paginated and Virtual Scroll modes, and click any row to inspect nested STRUCT, LIST, and MAP values.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Generate 10-Target SQL DDL, Profile Quantiles & Audit Binary X-Ray',
        text: 'Use Tab 2 to generate PostgreSQL, Snowflake, BigQuery, DuckDB, ClickHouse, PyArrow, or Polars schemas; Tab 3 to inspect P25/P50/P75 quantiles, Mean, StdDev, and Top 5 values; and Tab 4 to inspect header/footer hex and Row Group bounds.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Export 11 Tabular, Text, or Binary Container Formats',
        text: 'Open Tab 5 (Export), select Filtered View or Full Dataset, keep CWE-1236 formula protection and UTF-8 BOM enabled, and download CSV, native Excel (.xlsx), JSON, JSONL, SQL INSERTs, or transcoded .parquet, .avro, and .feather files.',
      },
    ],
  };

  return (
    <article className="not-prose mt-16 space-y-12 text-slate-700 dark:text-slate-300">
      {/* Structured Data (1:1 synced with visible FAQs and steps) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* ============================================================================
          SECTION 1: OVERVIEW & LOCAL BROWSER PROCESSING DISCLOSURE
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-overview"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h2
            id="parquet-viewer-overview"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Parquet Viewer Online &amp; Avro Viewer: Inspect Schemas &amp; Convert Parquet to CSV or Excel
          </h2>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shrink-0">
            <Sparkles className="h-3.5 w-3.5" />
            PAR1 • Obj\x01 • FEA1 / ARROW1
          </span>
        </div>

        <p className="mt-3 w-full text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          Open Parquet file online without spinning up Python, PyArrow, or desktop apps. This browser-based{' '}
          <strong>parquet viewer online</strong>, <strong>avro viewer</strong>, and{' '}
          <strong>feather file viewer</strong> acts as a unified <strong>parquet file viewer</strong> and{' '}
          <strong>online parquet viewer</strong>—letting you browse nested rows, profile column stats, generate 10
          warehouse DDLs, and convert <strong>parquet to csv</strong>, <strong>parquet to excel</strong> (native{' '}
          <code>.xlsx</code>), and <strong>parquet to json</strong> free with zero signup.
        </p>

        <blockquote className="p-4 my-6 bg-blue-50/80 border-l-4 border-blue-600 rounded-r-xl dark:bg-slate-800/80 not-italic">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
            <strong>Local Browser Processing &amp; Privacy Disclosure:</strong> Your selected file contents are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources. Client-side parsing operates in a background Web Worker up to 250 MB / 5,000,000 rows.
          </p>
        </blockquote>

        <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
          When you pull a single <code>part-00000.snappy.parquet</code> file from Amazon S3, inspect a Kafka{' '}
          <code>.avro</code> dead-letter payload, or verify a Polars <code>.feather</code> feature dump, waiting on a
          local Python environment slows down routine debugging. KivaroTools keeps the entire inspection, schema DDL,
          binary X-Ray, and spreadsheet export loop inside one clean tab—while explicitly flagging unsupported codecs
          and edge cases rather than silently corrupting data.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              Unified Parquet, Avro &amp; Feather Engine
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Dedicated pure-TypeScript decoders for Parquet (<code>PAR1</code>), Avro OCF (<code>Obj\x01</code>),
              Feather V1 (<code>FEA1</code>), and Arrow IPC / Feather V2 (<code>ARROW1</code>), plus{' '}
              <code>.jsonl</code> and <code>.csv</code> files.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
              <Binary className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              Exact 64-Bit BigInt &amp; Nano Timestamps
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Decodes 64-bit <code>INT64</code> / <code>UINT64</code> IDs with native <code>BigInt</code> and formats{' '}
              <code>MILLIS</code>, <code>MICROS</code>, <code>NANOS</code>, and <code>INT96</code> timestamps without
              IEEE-754 float rounding.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              Free 11-Format Export &amp; CWE-1236 Defense
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Export filtered slices or full tables to 8 tabular/text formats (including native <code>.xlsx</code> and
              UTF-8 BOM CSV) plus 3 binary container transcoders—no export paywalls.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 2: HOW TO USE IN 4 STEPS (CLEAN CARDS, ZERO OUTER MARKERS)
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-how-to"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5"
      >
        <div>
          <h2
            id="parquet-viewer-how-to"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            How to Open, Filter &amp; Convert Parquet, Avro &amp; Feather Files in 4 Steps
          </h2>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Whether you need a quick schema check or a clean Excel handoff, the entire workflow runs in four steps:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400">
              Step 1: Drop a Local File or Pick a 1-Click Sample
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Drop any local <code>.parquet</code>, <code>.avro</code>, <code>.feather</code>, <code>.arrow</code>,{' '}
              <code>.ipc</code>, <code>.jsonl</code>, or <code>.csv</code> file (up to <code>250 MB</code>) into the
              dropzone—or click <strong>Orders (.parquet)</strong>, <strong>IoT Stream (.avro)</strong>, or{' '}
              <strong>Embeddings (.feather)</strong> to test immediately.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400">
              Step 2: Filter, Hide PII Columns &amp; Inspect Nested Rows
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              In <strong>Data Grid</strong>, search text globally or open <strong>Filter</strong> for 11 operators
              with <code>AND/OR</code> logic and exact 64-bit <code>BigInt</code> matching (via{' '}
              <code className="break-all">compareExactNumericValues</code>). Toggle <strong>Columns</strong> to exclude
              PII fields, switch between <strong>Paginated</strong> and <strong>Virtual Scroll</strong>, and click any
              row to inspect nested JSON.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400">
              Step 3: Compile SQL DDL, Profile Quantiles &amp; Check Binary X-Ray
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Switch to <strong>Schema &amp; DDL</strong> for 10 database/SDK schemas, <strong>Profiler</strong> for
              null ratios, <code>P25/Median/P75</code> quantiles, Mean, StdDev, string lengths, and Top 5 values, or{' '}
              <strong>Binary X-Ray</strong> for Row Group zone maps, Avro blocks, and header/footer hex bytes.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400">
              Step 4: Download CSV, Excel (.xlsx), JSONL or Binary Formats
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              In <strong>Export</strong>, pick <strong>Filtered View</strong> or <strong>Full Dataset</strong>, keep the
              CWE-1236 formula guard and UTF-8 BOM checked for Excel safety, and download any of the 8 tabular/text
              formats or 3 binary container formats (11 total).
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 3: SINGLE AUTHORITATIVE FORMAT, CODEC & ARCHITECTURE MATRIX
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-format-matrix"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2
              id="parquet-viewer-format-matrix"
              className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Binary Architecture, Supported Codecs &amp; Disclosed Limits (Parquet, Avro &amp; Feather)
            </h2>
          </div>
          <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            This single compatibility reference documents every binary container, magic header, schema layout, supported
            codec, and explicitly unsupported feature in <code>lib/columnarViewerEngine.ts</code> (bounds: 250 MB
            buffer, 5,000,000 rows, 2,048 columns):
          </p>
        </div>

        <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-[780px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
              <tr>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Format &amp; Magic Bytes</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Schema &amp; Orientation</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Supported Codecs &amp; Types</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Disclosed Unsupported (Error + X-Ray)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Apache Parquet<br />
                  <code className="text-blue-600 dark:text-blue-400">PAR1</code> (head &amp; tail)
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Hybrid Columnar (Row Groups + Column Chunks); trailing Thrift <code>FileMetaData</code> footer
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  <code>UNCOMPRESSED</code>, <code>SNAPPY</code>, <code>GZIP</code>, <code>LZ4</code>,{' '}
                  <code>LZ4_RAW</code> • <code>PLAIN</code>, <code>RLE_DICTIONARY</code>, <code>RLE</code> •{' '}
                  <code>INT64</code> BigInt, <code>INT96</code>, <code>DECIMAL</code>, <code>TIMESTAMP</code> (ms/us/ns),{' '}
                  <code>STRUCT</code>, <code>MAP</code>, <code>LIST</code> &amp; <code>LIST-of-STRUCT</code>
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  <code>ZSTD</code>, <code>BROTLI</code>, <code>LZO</code>, <code>DELTA_BINARY_PACKED</code>,{' '}
                  <code>BYTE_STREAM_SPLIT</code>, KMS <code>PARE</code> encryption
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Apache Avro OCF<br />
                  <code className="text-indigo-600 dark:text-indigo-400">{'Obj\\x01'}</code> (head)
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Row-Oriented Data Blocks; leading JSON <code>avro.schema</code> map + 16B sync markers
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  <code>null</code>, <code>deflate</code> (RFC 1951), <code>snappy</code> (CRC32 verified) • ZigZag{' '}
                  <code>int/long</code> (BigInt), <code>union</code>, <code>record</code>, <code>enum</code>,{' '}
                  <code>array</code>, <code>map</code>, <code>fixed</code>, <code>decimal</code>, timestamps
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  <code>bzip2</code>, <code>xz</code>, <code>zstandard</code>; raw Confluent Wire (<code>0x00</code> +
                  4B Schema ID detected &amp; shown in X-Ray)
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Feather V1<br />
                  <code className="text-emerald-600 dark:text-emerald-400">FEA1</code> (head &amp; tail)
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Columnar 8B-aligned buffers; trailing <code>CTable</code> / <code>PrimitiveArray</code> FlatBuffer
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  <code>UNCOMPRESSED</code> <code>PLAIN</code> &amp; <code>CategoryMetadata</code> • <code>BOOL</code>,{' '}
                  <code>INT8..64</code> (BigInt), <code>UINT8..64</code>, <code>FLOAT/DOUBLE</code>, <code>UTF8</code>,{' '}
                  <code>DATE/TIMESTAMP</code>
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Non-PLAIN V1 bit-packed integer encodings
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Feather V2 / Arrow IPC<br />
                  <code className="text-emerald-600 dark:text-emerald-400">ARROW1</code> / <code>0xFFFFFFFF</code>
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Encapsulated Arrow IPC <code>Schema</code> + <code>DictionaryBatch</code> + <code>RecordBatch</code>
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  <code>UNCOMPRESSED</code> &amp; <code>LZ4_FRAME</code> • <code>Int/UInt8..64</code>,{' '}
                  <code>Float16/32/64</code>, <code>Decimal128/256</code>, <code>Utf8/LargeUtf8</code>,{' '}
                  <code>List/LargeList/FixedSizeList</code>, <code>Struct</code>, <code>Map</code>,{' '}
                  <code>Dictionary</code>
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  <code>ZSTD</code> RecordBatch compression, dense/sparse <code>Union</code>, <code>Interval/Duration</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Concise Architectural Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 bg-slate-50/40 dark:bg-slate-800/20 space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Why Parquet Puts Its Schema in the Footer (Last 8 Bytes)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Writers like Spark, Trino, and DuckDB flush compressed Row Groups before final row counts, byte offsets,
              and min/max zone maps are known. Once finished, the writer appends Thrift <code>FileMetaData</code>, a
              4-byte little-endian length, and the closing <code>PAR1</code> signature—which is why any{' '}
              <strong>parquet metadata inspector</strong> seeks to the end of the file first.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 bg-slate-50/40 dark:bg-slate-800/20 space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Why Avro Uses ZigZag Varints &amp; 16-Byte Sync Markers
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Designed for append-heavy Kafka and CDC pipelines, Avro OCF stores its JSON contract (
              <code>avro.schema</code>) up front, encodes small signed integers in 1 byte via ZigZag varints, and
              separates blocks with a random 16-byte sync marker so distributed consumers can split and resync mid-file.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 4: REAL-WORLD WORKED EXAMPLES (VERIFIED AGAINST BUILT-IN SAMPLES)
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
              Worked Examples: Parquet Schema Viewer, Snowflake DDL &amp; BigInt-Safe CSV Export
            </h2>
          </div>
          <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            Every output below is computed directly from the studio’s built-in binary samples—click the sample buttons
            above to reproduce them live:
          </p>
        </div>

        {/* Example 1 */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-xs font-mono">Example 1</span>
            <span>
              Parquet to SQL DDL: <code>ecommerce_orders_v2.parquet</code> → Snowflake DDL &amp; PyArrow Schema
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Use Tab 2 as a <strong>parquet schema viewer</strong> to compile <strong>parquet to sql ddl</strong>{' '}
            (including <strong>parquet to snowflake ddl</strong> and <strong>parquet to bigquery ddl</strong>) alongside
            typed Python PyArrow and Polars definitions:
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
              <div className="text-blue-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                Decoded Parquet Thrift Footer (25 Rows × 11 Columns)
              </div>
              <pre className="leading-relaxed overflow-x-auto max-w-full">{`Format:  Parquet 2.0 (TCompactProtocol) [Magic: PAR1]
Codec:   SNAPPY • 1 Row Group

 1. order_id               INT32      -> INT32            (REQUIRED)
 2. customer_snowflake_id  INT64      -> INT64 [BigInt]   (REQUIRED)
 3. customer_email         BYTE_ARRAY -> UTF8             (OPTIONAL, 16% Nulls)
 4. region / order_status  BYTE_ARRAY -> UTF8             (REQUIRED)
 5. total_usd / discount   DOUBLE     -> DOUBLE           (REQUIRED)
 6. is_prime_member        BOOLEAN    -> BOOLEAN          (REQUIRED)
 7. created_at             INT64      -> TIMESTAMP_MILLIS (REQUIRED)
 8. shipping_meta          BYTE_ARRAY -> STRUCT           (REQUIRED)
 9. line_skus              BYTE_ARRAY -> LIST             (REPEATED)`}</pre>
            </div>

            <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
              <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                Generated Snowflake DDL &amp; PyArrow Schema
              </div>
              <pre className="leading-relaxed overflow-x-auto max-w-full">{`CREATE OR REPLACE TABLE "ECOMMERCE_ORDERS_V2" (
  "order_id" NUMBER(38, 0) NOT NULL,
  "customer_snowflake_id" NUMBER(38, 0) NOT NULL,
  "customer_email" VARCHAR,
  "region" VARCHAR NOT NULL,
  "total_usd" FLOAT NOT NULL,
  "created_at" TIMESTAMP_NTZ NOT NULL,
  "shipping_meta" VARIANT NOT NULL,
  "line_skus" ARRAY NOT NULL
);

# PyArrow: pa.field("customer_snowflake_id", pa.int64(), nullable=False)`}</pre>
            </div>
          </div>
        </div>

        {/* Example 2 */}
        <div className="space-y-3 pt-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-xs font-mono">Example 2</span>
            <span>
              Convert Parquet to CSV Safely: 64-Bit INT64 Preservation + CWE-1236 Guard
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            When you <strong>convert parquet to csv</strong> using a naive browser script, 18-digit warehouse IDs round
            to identical IEEE-754 floats and formula strings pass through unguarded. Our{' '}
            <strong>parquet to csv converter</strong> preserves every digit via <code>BigInt</code>:
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="min-w-0 rounded-2xl bg-red-50/50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-900/50 text-xs font-mono text-red-900 dark:text-red-200 overflow-x-auto">
              <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Naive JS Number() Viewer (Silent Corruption)</span>
              </div>
              <pre className="leading-relaxed overflow-x-auto max-w-full">{`// Raw INT64: 900719925474099100 -> rounded to 900719925474099072
{
  "order_id": 100450,
  "customer_snowflake_id": 900719925474099072,
  "FormulaCell": "=HYPERLINK(\\"http://malicious.tld\\")"
}`}</pre>
            </div>

            <div className="min-w-0 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 p-4 border border-emerald-200 dark:border-emerald-900/50 text-xs font-mono text-emerald-900 dark:text-emerald-200 overflow-x-auto">
              <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>KivaroTools Output (Exact BigInt + Neutralized Formula)</span>
              </div>
              <pre className="leading-relaxed overflow-x-auto max-w-full">{`// Exact 64-bit digits preserved & formula cell escaped
{
  "order_id": 100450,
  "customer_snowflake_id": "900719925474099100",
  "FormulaCell": "'=HYPERLINK(\\"http://malicious.tld\\")"
}`}</pre>
            </div>
          </div>
        </div>

        {/* Example 3 */}
        <div className="space-y-3 pt-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-mono">Example 3</span>
            <span>
              Kafka Avro (<code>iot_sensor_stream.avro</code>) → <code>.avsc</code> Contract &amp; JSONL / NDJSON Stream
            </span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
              <div className="text-indigo-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                Extracted Avro Schema (.avsc)
              </div>
              <pre className="leading-relaxed overflow-x-auto max-w-full">{`{
  "type": "record",
  "name": "IoTTelemetryEvent",
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
                Exported JSON Lines (.jsonl / NDJSON)
              </div>
              <pre className="leading-relaxed overflow-x-auto max-w-full">{`{"event_seq":500001,"device_uuid":"dev-8840-0001","temperature_c":62.4,"alert_code":"WARN_TEMP_900"}
{"event_seq":500002,"device_uuid":"dev-8840-0002","temperature_c":72.33,"alert_code":null}
{"event_seq":500003,"device_uuid":"dev-8840-0003","temperature_c":73.13,"alert_code":null}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 5: HONEST COMPETITOR COMPARISON MATRIX
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-competitor-matrix"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4"
      >
        <div>
          <h2
            id="parquet-viewer-competitor-matrix"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            How KivaroTools Compares to Other Parquet, Avro &amp; Feather Viewers
          </h2>
          <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            DuckDB-WASM viewers like <code>parquet-viewer.com</code>, <code>viewparquet.com</code>, and{' '}
            <code>ChatDB</code> excel at free-text SQL and ZSTD/remote URL reads, while KivaroTools focuses on
            unified <strong>Parquet + Avro + Feather</strong> inspection, free native Excel <code>.xlsx</code> &amp;
            11-format exports, 10-target Polyglot DDL generation, exact 64-bit <code>BigInt</code> profiling, and Binary
            X-Ray forensics without paywalls:
          </p>
        </div>

        <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-[840px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
              <tr>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Capability</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">
                  KivaroTools Studio
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">ParquetReader</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">parquet-viewer.com</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">viewparquet.com</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">ChatDB</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Filestash / ExtendsClass</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Formats Supported
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                  Parquet + Avro + Feather V1/V2
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Parquet, Avro, Feather, ORC, Vortex</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Parquet only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Parquet &amp; GeoParquet</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Parquet only (split across 4–5 pages)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Filestash: multi-format; ExtendsClass: Avro raw JSON</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Free CSV &amp; Native <code>.xlsx</code>
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                  100% Free (11 formats incl. .xlsx &amp; CWE-1236 CSV)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">Exports paywalled</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">No .xlsx; uncapped exports $59/yr Pro</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">CSV/JSON free (explicitly no .xlsx)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">CSV/JSON only (no .xlsx or CWE-1236)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">No spreadsheet export</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Filtering / SQL Mode
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  11-Operator AND/OR Filter + BigInt (no SQL console)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400">Free-text SQL</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400">DuckDB SQL (full SQL Pro)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400">Multi-tab DuckDB-WASM SQL</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400">DuckDB-WASM SQL</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Basic sort / raw text</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  10-Target SQL DDL &amp; Binary X-Ray
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                  10 Warehouse/SDK DDLs + Hex/Row Group X-Ray
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Schema view only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  ZSTD / Remote URLs / Privacy
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Local files (up to 250 MB); no ZSTD or remote S3 URLs
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-amber-600">Temp server upload + S3/GCS</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Local WASM + ZSTD + S3/HTTPS</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Local WASM + ZSTD + S3/GCS</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Local DuckDB-WASM + ZSTD</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Local WASM/JS</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================================
          SECTION 6: 11 EXPORT FORMATS, 10 DDL TARGETS & PRACTICAL WORKFLOWS
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-export-targets"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2
              id="parquet-viewer-export-targets"
              className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              11 Export &amp; Binary Transcoding Formats + Practical Workflows
            </h2>
          </div>
          <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            Tab 5 exports either your filtered/projected subset or the full dataset across 8 tabular/text formats plus 3
            binary container formats, while Tab 2 compiles 10 database and SDK schemas:
          </p>
        </div>

        <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-[680px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
              <tr>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Output Format</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Extension</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Key Safeguards &amp; Use Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">RFC 4180 CSV &amp; TSV</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">.csv / .tsv</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Custom delimiter (<code>, ; \t |</code>), UTF-8 BOM, CWE-1236 formula guard — Parquet to CSV, Avro to CSV &amp; Feather to CSV</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">Native Excel Workbook</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">.xlsx</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">PKZIP Office Open XML with frozen headers, auto-filters, inline-string INT64 safety &amp; CWE-1236 guard</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">JSON &amp; JSON Lines</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">.json / .jsonl</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Nested <code>STRUCT/LIST/MAP</code> trees &amp; exact BigInt strings — <strong>parquet to json converter</strong> &amp; <strong>parquet to ndjson</strong></td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">SQL INSERT, Markdown &amp; HTML5</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">.sql / .md / .html</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Escaped SQL staging inserts, GitHub PR Markdown tables, and XSS-safe HTML5 tables</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">Binary Container Transcoders (3)</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-indigo-600 dark:text-indigo-400">.parquet / .avro / .feather</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">In-browser <strong>avro to parquet converter</strong>, <strong>parquet to avro online</strong>, and Arrow IPC (<code>ARROW1</code>) writer</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">10-Target Schema &amp; DDL</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">.sql / .ts / .py / .avsc / .json</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">PostgreSQL, Snowflake, BigQuery, DuckDB, ClickHouse, TypeScript, PyArrow, Polars, Avro &amp; JSON Schema</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              1. Lakehouse Parquet Audit → Excel
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Filter out null or out-of-range rows, uncheck PII columns like <code>customer_email</code>, and export{' '}
              <strong>parquet to csv</strong> or <strong>parquet to excel</strong> (<code>.xlsx</code>) cleanly.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              2. Kafka Avro OCF → CSV or Parquet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Use the <strong>avro viewer online</strong> to inspect nullable unions, copy the <code>.avsc</code>{' '}
              schema, export <strong>avro to csv</strong>, or transcode directly to Snappy <code>.parquet</code>.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              3. Arrow Feather → Quantiles &amp; DDL
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Drop <code>.feather</code> or <code>.arrow</code> files into the <strong>arrow file viewer</strong> (and{' '}
              <strong>arrow ipc viewer online</strong>) to verify ML feature quantiles and export{' '}
              <strong>feather to csv online</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 7: TROUBLESHOOTING 6 REAL BINARY EDGE CASES
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-troubleshooting"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5"
      >
        <div>
          <h2
            id="parquet-viewer-troubleshooting"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Common Parquet, Avro &amp; Feather Errors and Fixes
          </h2>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Quickly diagnose the six most frequent binary data issues encountered in production pipelines:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: '1. Missing Trailing "PAR1" Footer (Truncated File)',
              body: 'Interrupted S3/GCS downloads cut off the trailing Thrift footer. Click Inspect in Binary X-Ray on the error banner to verify header/footer hex bytes, then re-download the complete object.',
            },
            {
              title: '2. 18-Digit Snowflake IDs Rounding in Excel',
              body: 'Excel turns unquoted 16+ digit CSV numbers into scientific notation (9.0072E+17). Export to Native .XLSX (inline text cells) or JSON/JSONL instead.',
            },
            {
              title: '3. Confluent Wire Format (0x00) vs. Avro OCF',
              body: 'Single Kafka messages prefixed with 0x00 + 4-byte Schema ID lack an embedded schema. KivaroTools extracts the Schema ID in Forensic X-Ray so you can fetch the matching schema from your registry.',
            },
            {
              title: '4. Microsecond, Nanosecond & INT96 Timestamps',
              body: 'Spark and PyArrow write MICROS/NANOS LogicalType timestamps or legacy 12-byte INT96 values. KivaroTools reads the TimeUnit union and Julian days directly for exact ISO-8601 output.',
            },
            {
              title: '5. Garbled Unicode Characters in Windows Excel',
              body: 'Windows Excel defaults to ANSI on BOM-less UTF-8 CSVs, corrupting Arabic, Urdu, CJK, and emojis. Keep Prepend UTF-8 BOM (\\uFEFF) checked in Tab 5.',
            },
            {
              title: '6. Legacy Feather V1 (FEA1) Compatibility',
              body: 'Older Pandas/R Feather V1 files fail in V2-only Arrow readers. KivaroTools auto-detects FEA1 and routes it through a dedicated V1 CTable parser.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-1.5 min-w-0"
            >
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{item.title}</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================================
          SECTION 8: FREQUENTLY ASKED QUESTIONS (12 CONCISE ACCORDIONS)
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-faq"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2
            id="parquet-viewer-faq"
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
          SECTION 9: RELATED DATA ENGINEERING & DEVELOPER TOOLS (ZERO BULLET DOTS)
          ============================================================================ */}
      <section
        aria-labelledby="parquet-viewer-related"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2
            id="parquet-viewer-related"
            className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Related Data Engineering &amp; Developer Utilities
          </h2>
        </div>
        <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
          Continue your SQL querying, JSON conversion, and schema workflow with these verified browser tools:
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              href: '/developer/sqlite-viewer',
              title: 'SQLite & DuckDB Browser Studio (Full SQL) →',
              desc: 'Run free-text SQL SELECT, JOIN, CTE, and GROUP BY queries directly in your browser.',
            },
            {
              href: '/developer/json-converter',
              title: 'JSON to CSV, Excel (.xlsx), YAML & XML →',
              desc: 'Flatten nested JSON arrays into spreadsheets with CWE-1236 formula protection.',
            },
            {
              href: '/developer/sql-formatter',
              title: 'SQL Formatter, Linter & AST Analyzer →',
              desc: 'Format generated Snowflake, BigQuery, DuckDB, and PostgreSQL DDL across 19 dialects.',
            },
            {
              href: '/developer/json-formatter',
              title: 'JSON Formatter, Validator & Tree Viewer →',
              desc: 'Validate, repair, and inspect exported JSON and Avro .avsc schema files.',
            },
            {
              href: '/developer/base64-encoder',
              title: 'Base64 Encoder, Decoder & Hex Inspector →',
              desc: 'Decode Base64 Kafka payloads and inspect binary headers locally.',
            },
            {
              href: '/developer/regex-tester',
              title: 'Regex Tester & Code Generator →',
              desc: 'Test extraction patterns for string columns with a 1,200 ms ReDoS watchdog.',
            },
          ].map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 no-underline"
            >
              <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
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
