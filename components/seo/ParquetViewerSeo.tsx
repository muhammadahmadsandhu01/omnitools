import React from 'react';
import Link from 'next/link';
import { Database, Code2, Binary, ArrowRight, ServerOff, HelpCircle } from 'lucide-react';

export default function ParquetViewerSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I open and view a .parquet file online without uploading it to a server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Drop your .parquet file directly into the KivaroTools Parquet, Avro & Feather Viewer. The binary container is parsed 100% locally inside your browser using JavaScript ArrayBuffer and DataView readers—meaning your sensitive data warehouse tables never leave your device.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between Apache Parquet, Apache Avro, and Apache Arrow Feather?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Apache Parquet is a compressed columnar storage format optimized for OLAP analytical queries (Snowflake, AWS Athena, Spark, DuckDB). Apache Avro is a row-oriented binary container with an embedded JSON header ideal for Kafka event streaming. Apache Arrow Feather (.feather / .arrow) is an uncompressed or lightly compressed columnar IPC format designed for zero-copy in-memory exchange between Python (Pandas/Polars) and R.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does this viewer prevent 64-bit integer (INT64) precision loss in JavaScript?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Standard JavaScript Number values use IEEE 754 double-precision floats, which silently corrupt integers larger than Number.MAX_SAFE_INTEGER (9,007,199,254,740,991). Our engine decodes INT64 and UINT64 columns using native BigInt and serializes unsafe 64-bit snowflake IDs as exact strings during JSON and CSV export.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I convert Parquet, Avro, or Feather files to Microsoft Excel (.xlsx) and RFC 4180 CSV?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Open the Export & Converter Studio tab to export either your filtered/projected subset or the full dataset into RFC 4180 CSV (with optional UTF-8 BOM for Microsoft Excel), native binary Excel Workbooks (.xlsx), JSON, JSON Lines (.jsonl), SQL INSERT statements, Markdown tables, or cross-converted binary containers.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is CWE-1236 CSV Formula Injection protection during Parquet-to-CSV export?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'When exporting untrusted string columns to CSV or Excel (.xlsx), cells starting with =, +, -, or @ can trigger DDE command execution when opened in spreadsheet software. Enabling our CWE-1236 Formula Sanitization option prefixes dangerous cells with a safe single quote so spreadsheet formulas cannot execute.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I generate SQL CREATE TABLE DDL from a Parquet or Avro file?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Switch to the Schema & DDL Generator tab to automatically translate your file physical and logical schema into PostgreSQL, Snowflake, Google BigQuery, DuckDB, ClickHouse MergeTree DDL, TypeScript interfaces, PyArrow schemas, Polars schemas, or Apache Avro (.avsc) specifications.',
        },
      },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Inspect and Convert Parquet, Avro, and Feather Files Online',
    description:
      'Step-by-step guide to viewing schemas, filtering rows, profiling columns, and converting Apache Parquet, Avro, and Feather files to CSV, Excel (.xlsx), or SQL DDL in your browser.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Drop Your Binary Columnar or Row File',
        text: 'Drag and drop a .parquet, .avro, .feather, or .arrow file into the dropzone, or click one of the three built-in sample binary datasets.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Filter, Sort, and Inspect Nested Rows',
        text: 'Use the Data Explorer Grid to search across all fields, apply multi-condition filters, project specific columns, and click any row to inspect nested structs and lists.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Audit Schema, Statistics, and Binary Metadata',
        text: 'Review physical and logical data types, generate SQL DDL for Snowflake/BigQuery/PostgreSQL, and inspect Row Group compression ratios in the Binary X-Ray tab.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Export to CSV, Excel (.xlsx), JSON, or Binary',
        text: 'Open the Export Studio to download your filtered view or full dataset as an RFC 4180 CSV, native Excel (.xlsx) workbook, NDJSON stream, or transcoded binary container.',
      },
    ],
  };

  return (
    <div className="mt-16 space-y-14 text-slate-700 dark:text-slate-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* Section 1: Architectural Overview */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
          <Database className="w-3.5 h-3.5" />
          Client-Side Lakehouse & Streaming Binary Inspector
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Why Data Engineers Inspect Parquet, Avro &amp; Feather Files Locally in the Browser
        </h2>
        <p className="text-base leading-relaxed">
          Modern analytics pipelines store terabytes of structured records inside binary containers—most notably{' '}
          <strong>Apache Parquet</strong> for cloud data lakes (Snowflake, AWS Athena, Databricks, Apache Iceberg),{' '}
          <strong>Apache Avro</strong> for real-time event streaming (Apache Kafka, Confluent Schema Registry), and{' '}
          <strong>Apache Arrow Feather (.arrow / .feather)</strong> for zero-copy dataframe interchange between Python
          (Pandas, Polars, PyArrow) and R. Unlike plain-text CSV or JSON files, these binary formats cannot be opened in
          a standard text editor without first running a Python script or spinning up a warehouse cluster.
        </p>
        <p className="text-base leading-relaxed">
          The <strong>KivaroTools Parquet, Avro &amp; Feather Viewer &amp; Converter</strong> eliminates server round-trips
          and command-line setup. Every byte of your file is decoded directly inside your browser&apos;s{' '}
          <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-sm">ArrayBuffer</code>{' '}
          sandbox. You can verify magic signatures (<code className="font-mono text-sm">PAR1</code>,{' '}
          <code className="font-mono text-sm">Obj\x01</code>, <code className="font-mono text-sm">ARROW1</code>), inspect
          Row Group zone maps, query nested structs, and convert datasets into CWE-1236 sanitized CSV or native Excel{' '}
          <code className="font-mono text-sm">.xlsx</code> workbooks in milliseconds.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <ServerOff className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2.5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              100% Zero-Upload Privacy
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Production data lake partitions often contain PII, financial transactions, or HIPAA/GDPR records. Local
              in-memory parsing guarantees zero cloud telemetry or external API calls.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <Binary className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2.5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              BigInt-Safe 64-Bit Decoding
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Preserves 64-bit <code className="font-mono text-xs">INT64</code> snowflake IDs and nanosecond timestamps
              above <code className="font-mono text-xs">9,007,199,254,740,991</code> without silent IEEE-754 float
              rounding.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <Code2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2.5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              10-Target Schema &amp; DDL Studio
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Instantly translate binary file schemas into PostgreSQL, Snowflake, BigQuery, DuckDB, ClickHouse,
              TypeScript, PyArrow, Polars, and Avro <code className="font-mono text-xs">.avsc</code> definitions.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Technical Comparison of Parquet vs Avro vs Feather */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Technical Comparison: Apache Parquet vs. Apache Avro vs. Apache Arrow Feather
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Understanding the binary layout, magic bytes, and compression mechanics of each format helps you choose the
          right container for your data engineering architecture:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500">
                <th className="py-3 px-4">Specification</th>
                <th className="py-3 px-4">Apache Parquet (.parquet)</th>
                <th className="py-3 px-4">Apache Avro (.avro)</th>
                <th className="py-3 px-4">Apache Arrow Feather (.feather / .arrow)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Storage Orientation</td>
                <td className="py-3 px-4">Hybrid Columnar (Row Groups + Column Chunks)</td>
                <td className="py-3 px-4">Row-Oriented Binary Blocks</td>
                <td className="py-3 px-4">In-Memory Columnar IPC RecordBatches</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Magic Byte Signature</td>
                <td className="py-3 px-4 font-mono text-xs text-blue-600 dark:text-blue-400">
                  0x50 0x41 0x52 0x31 (&quot;PAR1&quot; header &amp; footer)
                </td>
                <td className="py-3 px-4 font-mono text-xs text-blue-600 dark:text-blue-400">
                  0x4F 0x62 0x6A 0x01 (&quot;Obj\x01&quot; header)
                </td>
                <td className="py-3 px-4 font-mono text-xs text-blue-600 dark:text-blue-400">
                  0x41 0x52 0x52 0x4F 0x57 0x31 (&quot;ARROW1&quot; / &quot;FEA1&quot;)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Schema Location</td>
                <td className="py-3 px-4">Thrift CompactProtocol Footer (at end of file)</td>
                <td className="py-3 px-4">JSON Header Map (<code className="font-mono text-xs">avro.schema</code>)</td>
                <td className="py-3 px-4">FlatBuffers Message Header &amp; Footer</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Primary Encodings</td>
                <td className="py-3 px-4">RLE_DICTIONARY, DELTA_BINARY_PACKED, PLAIN</td>
                <td className="py-3 px-4">Variable-Length ZigZag Varint + Raw Bytes</td>
                <td className="py-3 px-4">Contiguous Fixed-Width Buffers + Validity Bitmaps</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Compression Codecs</td>
                <td className="py-3 px-4">Snappy, ZSTD, GZIP, LZ4_RAW, Brotli</td>
                <td className="py-3 px-4">Null (Uncompressed), Deflate, Snappy (with CRC32), ZSTD</td>
                <td className="py-3 px-4">Uncompressed, LZ4_FRAME, ZSTD</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Best Use Case</td>
                <td className="py-3 px-4">OLAP Data Warehouses, Lakehouses, S3/GCS Archival</td>
                <td className="py-3 px-4">Kafka Event Streaming, Schema Evolution, RPC</td>
                <td className="py-3 px-4">High-Speed Python/Polars/Pandas/DuckDB Local I/O</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3: How KivaroTools Compares to Existing Online Viewers */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Enterprise Capabilities Benchmark
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500">
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4 text-blue-600 dark:text-blue-400">KivaroTools Unified Studio</th>
                <th className="py-3 px-4">Typical Single-Format Viewers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="py-2.5 px-4 font-semibold">Supported Binary Formats</td>
                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                  Parquet + Avro + Feather/Arrow + JSONL/CSV
                </td>
                <td className="py-2.5 px-4 text-slate-500">Single format only (Parquet OR Avro)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold">Binary X-Ray &amp; Row Group Stats</td>
                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                  Magic Hex, Thrift Footer, Zone Maps &amp; Sync Markers
                </td>
                <td className="py-2.5 px-4 text-slate-500">Basic row table only</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold">Polyglot DDL &amp; Schema Code</td>
                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                  10 Targets (Snowflake, BigQuery, Postgres, DuckDB, PyArrow, TS)
                </td>
                <td className="py-2.5 px-4 text-slate-500">None or raw JSON schema dump</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold">Spreadsheet Export Security</td>
                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                  CWE-1236 Formula Guard + UTF-8 BOM + Native .XLSX
                </td>
                <td className="py-2.5 px-4 text-slate-500">Unescaped plain CSV</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Frequently Asked Questions */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {faqSchema.mainEntity.map((item, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {item.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.acceptedAnswer.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: Related Developer Utilities */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Explore Related Data &amp; Developer Utilities
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              href: '/developer/json-converter',
              title: 'JSON to CSV & Excel Converter',
              desc: 'Flatten deeply nested JSON payloads up to 50 MB into spreadsheets.',
            },
            {
              href: '/developer/sql-formatter',
              title: 'SQL Formatter & AST Linter',
              desc: 'Format, beautify, and lint SQL across 19 dialects including Snowflake & DuckDB.',
            },
            {
              href: '/developer/json-formatter',
              title: 'JSON Formatter & Validator',
              desc: 'Validate, beautify, tree-view, and query JSON documents up to 25 MB.',
            },
            {
              href: '/developer/base64-encoder',
              title: 'Base64 & Binary Hex Inspector',
              desc: 'Encode/decode UTF-8 text and inspect binary file magic bytes locally.',
            },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {link.title}
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
