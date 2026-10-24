import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const JSON_CONVERTER_FAQS: FaqItem[] = [
  {
    question: 'How does KivaroTools flatten deeply nested JSON into tabular CSV and Excel columns?',
    answer:
      'KivaroTools uses a recursive flattening algorithm (powered by a dedicated Web Worker in lib/jsonConverterEngine.ts) that traverses nested JSON objects and arrays. It constructs human-readable compound column headers using your chosen path separator (such as dot notation "user.address.city" or underscore "user_address_city"). Arrays can be serialized as JSON strings, comma-joined values, or exploded into indexed columns (e.g. roles[0], roles[1]).',
  },
  {
    question: 'What is CSV Formula Injection defense and why is it critical?',
    answer:
      'CSV Formula Injection (also known as Formula Injection or DDE injection) occurs when untrusted user inputs starting with characters like =, +, -, @, or tab are imported into spreadsheet software like Microsoft Excel or LibreOffice. The spreadsheet interprets these cells as executable formulas, potentially running malicious commands or exfiltrating data. KivaroTools includes an automated Formula Injection Defense toggle that prefixes hazardous leading characters with a single quote (\'), neutralizing code execution.',
  },
  {
    question: 'How does the UTF-8 BOM toggle resolve garbled characters in Microsoft Excel?',
    answer:
      'Microsoft Excel on Windows often fails to recognize standard UTF-8 CSV files, erroneously interpreting international Unicode characters (accents, Arabic, Cyrillic, Chinese, Kanji, and emojis) as garbled ANSI/CP-1252 text. Enabling the UTF-8 BOM toggle prepends a three-byte Byte Order Mark (\\uFEFF) to the export, forcing Excel to open the spreadsheet cleanly with correct character encoding.',
  },
  {
    question: 'What is the maximum JSON payload and file size supported by the converter?',
    answer:
      'KivaroTools supports JSON files up to 50 MB, scaling up to 200,000 root rows, 10,000 unique columns, and 5,000,000 total table cells. Payloads larger than 256 KB automatically delegate flattening and serialization to an isolated background Web Worker, ensuring fluid UI responsiveness throughout intensive conversions.',
  },
  {
    question: 'How does native Excel (.xlsx) export work without a server backend?',
    answer:
      'KivaroTools incorporates a patched in-browser SheetJS (xlsx) engine with jszip to construct real binary Office Open XML (.xlsx) workbooks directly inside browser memory. The generated Excel workbook includes frozen top header panes, automatic filter drop-downs across every column, and formatted worksheet cell types.',
  },
  {
    question: 'Can I deselect specific columns or filter out sensitive PII before exporting?',
    answer:
      'Yes. The interactive Column Selection Manager displays all detected properties alongside their inferred data types (string, number, boolean, object, array). You can use real-time substring search to filter columns, utilize quick actions (Select All, Deselect All, Invert Selection), or manually uncheck sensitive PII fields (like password_hash or internal_ip) before generating exports.',
  },
  {
    question: 'How are arrays handled during conversion from JSON to CSV or Excel?',
    answer:
      'You can select between three array handling strategies: (1) "json" keeps arrays as compact JSON string representations (e.g. ["admin", "editor"]); (2) "join" concatenates primitive items with a delimiter (e.g. admin, editor); or (3) "indexed" creates dedicated columns for each array index (e.g. items[0].name, items[1].name), ensuring flexible data modeling.',
  },
  {
    question: 'Are my JSON files, database dumps, or converted spreadsheets uploaded to any server?',
    answer:
      'No. 100% of JSON parsing, object flattening, column filtering, and binary file generation (CSV, .xlsx, YAML, XML, TSV, JSONL) execute locally in your client browser sandbox. Confidential enterprise databases, customer records, and internal API responses remain strictly private on your machine.',
  },
  {
    question: 'How does the converter handle inconsistent schema keys across JSON array objects?',
    answer:
      'In real-world API responses and MongoDB exports, individual objects in an array frequently contain divergent property keys. KivaroTools performs an exhaustive schema union pass across all records, collecting the complete superset of columns. Objects lacking a specific property are seamlessly padded with empty cells without breaking row alignment.',
  },
  {
    question: 'What formats can I export JSON into using KivaroTools?',
    answer:
      'You can export JSON into six formats with one click: CSV (Comma-Separated Values), native Excel (.xlsx workbook with auto-filters), YAML (human-readable config), XML (standard markup with customizable root tags), TSV (Tab-Separated Values), and JSON Lines (.jsonl / NDJSON for LLM fine-tuning and BigQuery ingestion).',
  },
  {
    question: 'How does the Virtualized Tabular Grid with cell inspection work?',
    answer:
      'Before downloading your converted file, you can switch to the Tabular Grid tab to preview your data in an interactive table with sticky headers and row counters. Clicking any cell opens a detailed Value Inspector modal, allowing you to examine multiline strings, nested objects, or raw array elements clearly.',
  },
  {
    question: 'How does JSON to JSONL (.jsonl / NDJSON) conversion benefit AI and LLM workflows?',
    answer:
      'Machine learning pipelines, OpenAI fine-tuning datasets, Hugging Face models, and large-scale data warehouses (BigQuery, Snowflake) require JSON Lines format where each line represents a standalone JSON object. KivaroTools strips wrapping array delimiters and emits streamable newline-delimited JSON instantly.',
  },
  {
    question: 'What recursion depth does the flattener support for deeply nested objects?',
    answer:
      'You can configure maximum flattening depth between 1 and 20 levels. Any object or array nested deeper than your chosen threshold is preserved as a formatted JSON string within that cell, preventing unwieldy column explosions on circular or hyper-nested structures.',
  },
  {
    question: 'Can I convert YAML, CSV, or XML back to JSON using KivaroTools?',
    answer:
      'Yes. Our suite supports bidirectional conversion, enabling developers to convert CSV files back to JSON arrays, parse YAML manifests into JSON objects, and transform XML schemas into structured JSON.',
  },
];

export default function JsonConverterSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: JSON_CONVERTER_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      {/* FAQPage JSON-LD Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
        {/* Zone 2: Deep-Dive Architecture & Engine Sections */}
        <section aria-labelledby="json-converter-architecture" className="mb-8">
          <h2 id="json-converter-architecture" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Multi-Format JSON Conversion Architecture &amp; Client-Side Flattening Engine
          </h2>
          <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
            <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
              <strong>100% Client-Side In-Browser Execution:</strong> All JSON transformation, spreadsheet flattening, and binary Excel generation occur locally on your machine. Confidential customer data, proprietary database dumps, and enterprise records are never uploaded to any server.
            </p>
          </blockquote>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            While <strong>JavaScript Object Notation (JSON)</strong> is the undisputed standard for web APIs, microservices, and NoSQL databases, business analysts, data scientists, and DevOps teams frequently require data in tabular or alternate markup formats—such as <strong>CSV</strong> for data warehousing, <strong>Excel (.xlsx)</strong> for executive reporting, <strong>YAML</strong> for Kubernetes and CI/CD manifests, <strong>XML</strong> for legacy enterprise systems, and <strong>JSONL (NDJSON)</strong> for LLM training pipelines.
          </p>
          <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
            Converting hierarchical JSON into two-dimensional tabular data is computationally challenging: nested sub-objects must be flattened into composite headers, arrays must be serialized without schema collisions, and disparate keys across records must be merged into a unified columnar matrix.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            High-Capacity Web Worker Flattening Engine (50 MB &amp; 200,000 Rows)
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Converting tens of thousands of nested JSON objects into millions of spreadsheet cells causes massive memory allocation spikes. KivaroTools utilizes a high-capacity background <strong>Web Worker</strong> (implemented in <code>lib/jsonConverterEngine.ts</code>). Processing payloads up to <strong>50 MB</strong>, <strong>200,000 root rows</strong>, <strong>10,000 columns</strong>, and <strong>5,000,000 cells</strong>, it runs heavy recursive flattening in an isolated thread, keeping the user interface smooth and responsive.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Native Excel (.xlsx) Generation with Frozen Panes &amp; Auto-Filters
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Rather than simply renaming CSV files with a pseudo <code>.xls</code> extension (which triggers security warnings in Microsoft Office), KivaroTools compiles authentic binary Office Open XML workbooks using an optimized in-browser <strong>SheetJS (xlsx)</strong> engine paired with a custom <code>jszip</code> patch. Workbooks are exported with a frozen top header row and active column auto-filter dropdowns, ready for immediate data analysis.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Enterprise CSV Formula Injection Defense
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Exporting user-generated content to CSV exposes organizations to <strong>Formula Injection</strong> (CSV/DDE injection attacks). If a field begins with <code>=</code>, <code>+</code>, <code>-</code>, <code>@</code>, or tab characters, spreadsheet software may execute system commands or exfiltrate credentials upon opening. KivaroTools provides a built-in <strong>Formula Injection Defense</strong> toggle that automatically prefixes dangerous initial characters with a single apostrophe (<code>&apos;</code>), neutralizing formula execution.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Windows Excel UTF-8 BOM (\uFEFF) Encoding Protection
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            When standard UTF-8 CSVs are opened in Microsoft Excel on Windows, international characters and emojis frequently degrade into garbled mojibake text (such as <code>Ã©</code> instead of <code>é</code>). KivaroTools includes a dedicated <strong>UTF-8 BOM</strong> toggle that prepends the standard byte order mark (<code>\uFEFF</code>) to CSV and TSV outputs, ensuring seamless character rendering in Windows Excel.
          </p>
        </section>

        {/* Zone 3: Interactive Feature & Use-Case Grid */}
        <section aria-labelledby="json-converter-use-cases" className="mb-8">
          <h2 id="json-converter-use-cases" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Data Engineering &amp; Conversion Workflows
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                API Response to Spreadsheet Reporting
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Transform complex nested JSON responses from Stripe, Shopify, GitHub, or internal microservices into clean, multi-column Excel workbooks or CSV files for finance, marketing, and operations teams.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                JSON Lines (.jsonl / NDJSON) for LLM Training
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Convert standard JSON arrays into newline-delimited JSONL files formatted specifically for OpenAI fine-tuning, Hugging Face dataset loading, and streaming big data ingestion into Google BigQuery.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                Kubernetes &amp; Cloud YAML Manifest Generation
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Convert JSON configuration structures into clean, standardized YAML manifests with proper indentation and array notation for Kubernetes pods, Docker Compose, and GitHub Actions workflows.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                Enterprise XML Schema Interchange
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Transform JSON payloads into valid, well-formed XML documents with customizable root wrapper tags and element structures for integration with legacy enterprise SOAP APIs and banking services.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                Tabular Grid Preview &amp; Value Inspection
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Inspect converted data inside an interactive virtualized data table with sticky headers and click-to-inspect cell modals before committing to file download.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                Interactive Column Filtering &amp; PII Scrubbing
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Use the Column Manager to filter and deselect sensitive properties (such as customer email addresses or internal system keys) to generate sanitized datasets for third-party vendors.
              </p>
            </div>
          </div>
        </section>

        {/* Zone 4: Technical Specification & Comparison Matrices */}
        <section aria-labelledby="json-converter-specifications" className="mb-8">
          <h2 id="json-converter-specifications" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Technical Specification: Supported Output Formats Comparison
          </h2>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Target Format</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Extension</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">MIME Type</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Key Features</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Primary Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">CSV</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">.csv</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">text/csv</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Formula defense, UTF-8 BOM, custom separators</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Data warehouse ingestion &amp; BI reporting</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Excel</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">.xlsx</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">application/vnd.openxmlformats...</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Binary workbook, frozen header row, auto-filters</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Spreadsheet analysis in Microsoft Excel</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">YAML</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">.yaml</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">application/x-yaml</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Clean hierarchical indentation, type inference</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Kubernetes manifests &amp; DevOps configs</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">XML</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">.xml</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">application/xml</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Structured elements, customizable root wrappers</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Legacy enterprise &amp; SOAP integrations</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">TSV</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">.tsv</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">text/tab-separated-values</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Tab delimiters, zero comma collision</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Bioinformatics, CLI &amp; database bulk load</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">JSONL / NDJSON</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">.jsonl</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">application/x-ndjson</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">One record per line, streamable parsing</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">LLM fine-tuning &amp; BigQuery streaming</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Zone 5: Developer Troubleshooting & Error Reference */}
        <section aria-labelledby="json-converter-troubleshooting" className="mb-8">
          <h2 id="json-converter-troubleshooting" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Common JSON Conversion Errors, Edge Cases &amp; Fixes
          </h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                CSV Formula Injection Warning in Spreadsheet Applications
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cause:</strong> Cell values starting with formula control characters (<code>=</code>, <code>+</code>, <code>-</code>, <code>@</code>) can trigger arbitrary formula execution when opened in Excel.
                <br />
                <strong>Fix:</strong> Keep the <strong>Formula Injection Defense</strong> toggle enabled. KivaroTools will safely escape initial formula characters with a leading apostrophe.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Garbled Unicode &amp; Emojis in Windows Excel (Mojibake)
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cause:</strong> Windows Excel defaulting to ANSI code pages rather than standard UTF-8 when parsing CSV files without a byte order mark.
                <br />
                <strong>Fix:</strong> Enable the <strong>UTF-8 BOM</strong> toggle before clicking Download CSV. The prepended <code>\uFEFF</code> instructs Excel to parse multi-byte UTF-8 cleanly.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Column Header Name Collisions on Deeply Nested Objects
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cause:</strong> Multiple sub-properties sharing identical names across different nesting branches when flattening without unique path prefixes.
                <br />
                <strong>Fix:</strong> Select the <strong>Dot (.)</strong> or <strong>Underscore (_)</strong> nested path separator to generate fully qualified column keys (e.g. <code>billing_address_city</code> vs <code>shipping_address_city</code>).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Exploding Column Count on Arbitrary-Length Arrays
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cause:</strong> Using indexed column expansion on arrays with hundreds of elements creates hundreds of sparse columns.
                <br />
                <strong>Fix:</strong> Switch the Array Strategy to <strong>&quot;join&quot;</strong> (delimiting items with commas or pipes) or <strong>&quot;json&quot;</strong> (preserving the array stringified in a single cell).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Single Root Object vs. Array of Records Ambiguity
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cause:</strong> Inputting a single top-level JSON object rather than a collection array (<code>[...]</code>).
                <br />
                <strong>Fix:</strong> KivaroTools automatically detects single objects and treats them as a 1-row table, mapping top-level keys to columns without requiring manual array wrapping.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Leading Zeros Stripped by Excel on Postal Codes &amp; IDs
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cause:</strong> Excel automatically casting numeric strings (such as ZIP code <code>&quot;02134&quot;</code>) to integers, stripping the leading zero.
                <br />
                <strong>Fix:</strong> Use our <strong>Download Excel (.xlsx)</strong> export instead of CSV. The binary SheetJS serializer explicitly flags string columns with string cell types, preserving leading zeros.
              </p>
            </div>
          </div>
        </section>

        {/* Zone 6: Frequently Asked Questions */}
        <section aria-labelledby="json-converter-frequently-asked-questions" className="mb-8">
          <h2 id="json-converter-frequently-asked-questions" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {JSON_CONVERTER_FAQS.map((faq, index) => (
              <details
                key={index}
                className="group rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
              >
                <summary className="font-semibold text-slate-900 dark:text-slate-100 text-base cursor-pointer select-none list-none flex items-center justify-between">
                  <span>{faq.question}</span>
                  <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform">&#9662;</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Internal Cross-Linking Block */}
        <section aria-labelledby="json-converter-related-utilities" className="mb-8">
          <h2 id="json-converter-related-utilities" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Related Client-Side Developer Workflows
          </h2>
          <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-sm">
            Explore our integrated developer utilities for data engineering and API workflows:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>
              <Link href="/developer/json-formatter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                JSON Formatter, Validator &amp; Tree Viewer
              </Link>{' '}
              — Pre-validate, beautify, and repair broken JSON payloads up to 25 MB before converting.
            </li>
            <li>
              <Link href="/developer/sql-formatter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                SQL Query Formatter &amp; Linter
              </Link>{' '}
              — Format database schemas, SQL insert batches, and complex queries across 19 database dialects.
            </li>
            <li>
              <Link href="/developer/base64-encoder" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Base64 Encoder &amp; Decoder
              </Link>{' '}
              — Encode CSV or JSON datasets into Data URIs or decode base64-encoded database payloads.
            </li>
            <li>
              <Link href="/developer/regex-tester" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Regex Tester &amp; Code Generator
              </Link>{' '}
              — Test delimiter patterns and extraction regexes with live match tables and ReDoS safety.
            </li>
            <li>
              <Link href="/developer/password-generator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Cryptographic Password &amp; Secret Generator
              </Link>{' '}
              — Generate high-entropy API secrets, HMAC tokens, and 1 GB file checksums via Web Crypto.
            </li>
            <li>
              <Link href="/developer/svg-optimizer" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                SVG Optimizer &amp; Cleaner
              </Link>{' '}
              — Prune unused vector defs and compress SVG markup with sandboxed visual previewing.
            </li>
          </ul>
        </section>
      </article>
    </>
  );
}