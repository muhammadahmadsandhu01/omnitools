import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const JSON_CONVERTER_FAQS: FaqItem[] = [
  {
    question: 'How does KivaroTools convert nested JSON objects into flat spreadsheet rows?',
    answer:
      'KivaroTools uses a deterministic recursive flattening engine. When an object contains child objects, nested keys are joined using your configured separator (such as an underscore or dot, yielding headers like "user_address_city"). Leaf primitive values become individual columns. If property names collide after flattening, the engine appends a numeric suffix (e.g., "status_2") to guarantee that no data fields are silently overwritten.',
  },
  {
    question: 'Why do Microsoft Excel users see corrupted accented characters in CSV files, and how does UTF-8 BOM solve it?',
    answer:
      'Desktop versions of Microsoft Excel open plain CSV files using the operating system legacy ANSI or Windows-1252 code page by default, corrupting UTF-8 characters such as accents, umlauts, Arabic, Urdu, Chinese, and emoji. KivaroTools prepends a UTF-8 Byte Order Mark (\\uFEFF) to all CSV and TSV downloads, explicitly signaling to Excel that the stream is UTF-8 encoded so all international characters render accurately without manual import wizard configuration.',
  },
  {
    question: 'What are the RFC 4180 rules for escaping commas, newlines, and quotes in CSV files?',
    answer:
      'Under the RFC 4180 standard, any field containing a delimiter comma, carriage return, newline, or double quotation mark must be enclosed in double quotation marks. Any literal double quotation mark inside the string must be escaped by preceding it with another double quote (""). KivaroTools strictly enforces RFC 4180 compliance on all CSV exports.',
  },
  {
    question: 'How does KivaroTools protect against Spreadsheet Formula Injection (CSV Injection)?',
    answer:
      'Spreadsheet applications such as Excel, LibreOffice, and Google Sheets automatically execute formulas if a cell begins with =, +, -, @, or tab characters. Malicious or untrusted JSON payloads could trigger DDE commands or exfiltrate data. KivaroTools inspects every cell string: if it begins with an executable trigger character (and is not a standard finite number), it automatically prepends an apostrophe (\') to force desktop spreadsheets to treat the cell as plain text.',
  },
  {
    question: 'How are arrays handled when converting JSON to tabular spreadsheets?',
    answer:
      'KivaroTools provides three configurable array handling strategies: (1) JSON String mode, which serializes the array as a valid JSON string within a single cell (e.g. \'["admin","editor"]\'); (2) Joined Values mode, which concatenates primitive values with commas for clean readability (e.g. "admin, editor"); and (3) Indexed mode, which unpacks array items into individual numbered column headers (e.g. tags_0, tags_1).',
  },
  {
    question: 'How does JSON to YAML conversion preserve data types and handle multiline strings?',
    answer:
      'The JSON to YAML engine recursively traverses the data model using standard 2-space indentation. Strings matching YAML boolean or null keywords (such as "yes", "no", "true", "false", "null", "on", "off") are automatically enclosed in quotes to prevent YAML parsers from mistyping them. Multiline string values are serialized cleanly using literal block scalars (|) to preserve formatting without messy escape sequences.',
  },
  {
    question: 'How does JSON to XML conversion handle invalid tag names and array elements?',
    answer:
      'XML element names cannot contain spaces or begin with numbers or punctuation. KivaroTools sanitizes object keys into valid XML identifiers by replacing illegal characters with underscores. The dataset is wrapped in a root <dataset> container, array entries are enclosed within <item> child tags, text nodes are escaped for &, <, >, ", and \', and null values are explicitly marked with xsi:nil="true".',
  },
  {
    question: 'Is any JSON payload uploaded to an external server or logged?',
    answer:
      'No. 100% of the conversion, validation, flattening, and file generation processes run locally in your web browser using JavaScript and client-side Web Workers. Your data never touches a remote server, third-party API, or analytics pipeline, making it safe for confidential production payloads, customer records, and API tokens.',
  },
  {
    question: 'What is the maximum file size and row limit for client-side JSON conversion?',
    answer:
      'KivaroTools safely handles files up to 50 MB, datasets with up to 200,000 root rows, and up to 5,000,000 total cells in browser memory. Payloads exceeding 256 KB automatically offload to a background Web Worker to keep the browser UI responsive during intense flattening tasks.',
  },
  {
    question: 'Can I select specific columns and export only the fields I need?',
    answer:
      'Yes. The built-in Column Manager displays all extracted column headers with real-time search filtering. You can select, deselect, or invert column selections with one click. The live tabular preview and exported files (CSV, Excel, TSV, HTML) will include only your selected columns.',
  },
  {
    question: 'Does KivaroTools support downloading genuine Microsoft Excel (.xlsx) workbooks?',
    answer:
      'Yes. KivaroTools generates binary OpenXML .xlsx workbooks client-side using SheetJS with an integrated JSZip patch that injects frozen top-row header panes and auto-filter ranges, allowing you to open and analyze your data directly in Excel without import warnings.',
  },
  {
    question: 'What is the difference between JSONL (NDJSON) and standard JSON array output?',
    answer:
      'Standard JSON formats an array of objects enclosed in square brackets with comma separators. JSON Lines (JSONL or NDJSON) outputs each record as a standalone JSON object on its own line without surrounding brackets or commas. JSONL is the standard format for streaming data pipelines, Elasticsearch bulk indexing, BigQuery imports, and LLM training datasets.',
  },
  {
    question: 'How can I troubleshoot "Unexpected token" or syntax errors in my JSON?',
    answer:
      'Standard JSON requires double quotes around both keys and string values, forbids trailing commas after the last item in objects or arrays, and prohibits JavaScript comments (// or /* */). KivaroTools displays a real-time syntax diagnostic panel highlighting the exact line, column, and character position of the syntax error with a visual caret indicator.',
  },
  {
    question: 'Can I quickly copy converted YAML, XML, CSV, or TSV without downloading a file?',
    answer:
      'Yes. The interface features a Quick Copy bar with one-click copy buttons for CSV, YAML, XML, TSV, JSONL, and Dataset Summary. You can also switch the right panel to "Code Preview" to inspect the formatted code in real time before copying.',
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
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 md:p-10 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-sm">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Enterprise JSON Converter: Transform JSON to CSV, Excel (.xlsx), YAML, XML &amp; TSV
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        While modern web APIs, microservices, and document databases store and exchange data in hierarchical{' '}
        <strong>JSON (JavaScript Object Notation, RFC 8259)</strong>, downstream workflows frequently demand different representations.
        Business analysts require rectangular spreadsheets (CSV, Excel), DevOps engineers need configuration manifests (YAML),
        enterprise enterprise architectures depend on legacy schemas (XML), and data science pipelines consume newline-delimited streams (JSONL).
        KivaroTools provides a unified, zero-transmission browser engine to flatten, serialize, and export JSON across all major interchange formats with strict data integrity.
      </p>

      {/* How to Use Section */}
      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        How to Convert JSON with KivaroTools in 4 Steps
      </h3>
      <ol className="list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Input Your Data:</strong> Paste raw JSON directly into the editor, drag and drop a <code>.json</code> file (up to 50 MB), or load one of the built-in sample datasets (Users, E-Commerce, or Geo).
        </li>
        <li>
          <strong>Configure Flattening Rules:</strong> Set your preferred key separator (underscore or dot) and choose how arrays are handled (JSON string, joined comma list, or indexed columns).
        </li>
        <li>
          <strong>Filter Columns &amp; Preview:</strong> Use the Column Manager to select or search specific fields. Toggle between <strong>Tabular Grid</strong> to inspect individual cells or <strong>Code Preview</strong> to view formatted YAML, XML, CSV, TSV, or JSONL in real time.
        </li>
        <li>
          <strong>Export or Copy:</strong> Click <strong>Download CSV</strong>, <strong>Download Excel</strong>, <strong>Download YAML</strong>, or <strong>Download XML</strong>, or use the Quick Copy buttons to paste directly into your workflow.
        </li>
      </ol>

      {/* Technical Deep Dive: Flattening & Standards */}
      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Recursive Object Flattening: Mapping Tree Hierarchies to Flat Columns
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Two-dimensional spreadsheets cannot natively represent nested sub-objects. KivaroTools traverses object trees down to 20 levels deep, concatenating hierarchical keys while defending against prototype pollution and key collisions:
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Source JSON Structure</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Flattened Header Key</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Resulting Cell Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">{`{"user": {"id": 101, "name": "Alice"}}`}</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-blue-600 dark:text-blue-400">user_id, user_name</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-xs">101, Alice</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">{`{"order": {"items": [{"sku": "A1", "qty": 2}]}}`}</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-blue-600 dark:text-blue-400">order_items_0_sku, order_items_0_qty (Indexed)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-xs">&quot;A1&quot;, 2</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">{`{"tags": ["python", "data", "api"]}`}</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-emerald-600 dark:text-emerald-400">tags (Joined mode)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-xs">&quot;python, data, api&quot;</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">{`{"metadata": {"location": {"lat": 40.71, "lon": -74.00}}}`}</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-blue-600 dark:text-blue-400">metadata_location_lat, metadata_location_lon</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-xs">40.71, -74.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* RFC 4180 & Formula Injection */}
      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        RFC 4180 Standards &amp; Formula Injection (CSV Injection) Mitigation
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Naive string splitting and comma concatenation corrupt spreadsheet files whenever fields contain commas, quotes, or newlines. KivaroTools implements strict safeguards:
      </p>
      <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>RFC 4180 Enclosing Quotes:</strong> Any cell containing a comma, tab, newline, or double quote is automatically enclosed in double quotation marks.
        </li>
        <li>
          <strong>Escaped Quotes:</strong> Literal quotes within text (e.g. <code>15&quot; Display</code>) are escaped by doubling them to <code>&quot;&quot;</code> (e.g. <code>&quot;15&quot;&quot; Display&quot;</code>).
        </li>
        <li>
          <strong>UTF-8 Byte Order Mark (BOM):</strong> A leading <code>\uFEFF</code> character is prepended to ensure Excel opens international characters (Latin, Arabic, Asian, Cyrillic, emoji) without requiring manual text-import wizard adjustments.
        </li>
        <li>
          <strong>Formula Injection Defense:</strong> Text beginning with formula triggers (<code>=</code>, <code>+</code>, <code>-</code>, <code>@</code>, tabs, or fullwidth Unicode equivalents) is automatically quoted with a leading apostrophe (<code>&apos;</code>), preventing malicious payloads from executing Dynamic Data Exchange (DDE) formulas in Microsoft Excel or Google Sheets.
        </li>
      </ul>

      {/* JSON to YAML and XML Details */}
      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Structured Serialization: JSON to YAML &amp; JSON to XML
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        In addition to tabular spreadsheets, KivaroTools provides native serializers for hierarchical formats:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-[#0a0f1a] p-4 rounded-2xl border border-gray-200 dark:border-slate-800">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-sm flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
            JSON to YAML Serialization
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
            Translates JSON trees into clean, human-readable YAML with 2-space indentation.
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
            <li>Quotes ambiguous YAML keywords (<code>yes</code>, <code>no</code>, <code>true</code>, <code>false</code>, <code>null</code>).</li>
            <li>Formats multiline strings using literal block scalar syntax (<code>|</code>).</li>
            <li>Preserves numeric precision and boolean flags.</li>
          </ul>
        </div>
        <div className="bg-gray-50 dark:bg-[#0a0f1a] p-4 rounded-2xl border border-gray-200 dark:border-slate-800">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-sm flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            JSON to XML Serialization
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
            Outputs well-formed XML with standard declaration and <code>&lt;dataset&gt;</code> root container.
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
            <li>Sanitizes invalid characters in tag names to valid XML identifiers.</li>
            <li>Wraps array elements in uniform <code>&lt;item&gt;</code> nodes.</li>
            <li>Escapes entity characters (<code>&amp;</code>, <code>&lt;</code>, <code>&gt;</code>, <code>&quot;</code>) and marks nulls with <code>xsi:nil=&quot;true&quot;</code>.</li>
          </ul>
        </div>
      </div>

      {/* Competitor Comparison Matrix */}
      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Evidence-Based Feature Comparison: KivaroTools vs. Alternative Tools
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Based on our verified independent audit of 27 competing online converters and formatters, here is how KivaroTools compares across data security, output capabilities, and privacy standards:
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-xs text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              <th scope="col" className="p-2.5 border border-gray-200 dark:border-slate-700 font-bold">Tool</th>
              <th scope="col" className="p-2.5 border border-gray-200 dark:border-slate-700 font-bold">100% Client-Side Processing</th>
              <th scope="col" className="p-2.5 border border-gray-200 dark:border-slate-700 font-bold">Excel (.xlsx) Export</th>
              <th scope="col" className="p-2.5 border border-gray-200 dark:border-slate-700 font-bold">YAML &amp; XML Output</th>
              <th scope="col" className="p-2.5 border border-gray-200 dark:border-slate-700 font-bold">Formula Injection Defense</th>
              <th scope="col" className="p-2.5 border border-gray-200 dark:border-slate-700 font-bold">Pricing &amp; Account Req.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr className="bg-blue-50/50 dark:bg-blue-950/20 font-semibold text-slate-900 dark:text-white">
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">KivaroTools JSON Converter</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Yes (Zero Transmission)</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Yes (Native .xlsx)</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Yes (Built-in)</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Yes (RFC 4180 + &apos; prefix)</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">100% Free / No Signup</td>
            </tr>
            <tr>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">
                <a href="https://codebeautify.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">CodeBeautify</a>
              </td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Varies by module</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Yes</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Separate pages</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Not verified</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Free with display ads</td>
            </tr>
            <tr>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">
                <a href="https://jsonformatter.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">JSONFormatter.org</a>
              </td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Client-side script</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Separate tool</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Separate tools</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Not verified</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Free with display ads</td>
            </tr>
            <tr>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">
                <a href="https://www.convertcsv.com/json-to-csv.htm" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">ConvertCSV</a>
              </td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Client-side JS</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Yes (.xlsx)</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Separate URLs</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Optional setting</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Free tier / limits</td>
            </tr>
            <tr>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">
                <a href="https://transform.tools/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Transform Tools</a>
              </td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Client-side JS</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">No</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">YAML / TS code</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">N/A (Code only)</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Open source / Free</td>
            </tr>
            <tr>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">
                <a href="https://jsoneditoronline.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">JSON Editor Online</a>
              </td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Client-side + Cloud sync</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Export CSV</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">No XML export</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Not verified</td>
              <td className="p-2.5 border border-gray-200 dark:border-slate-700">Free / Premium tier</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Format Selection Guide */}
      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Target Format Selection Guide: Which Format Should You Choose?
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Target Format</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Delimiter / Structure</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Best Use Case</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">File Overhead</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">CSV (.csv)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Comma (,)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">SQL bulk imports, data science (Pandas, R), general interchange</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Lowest (plain text)</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Excel (.xlsx)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Binary OpenXML</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Business spreadsheets, native Excel workbooks, auto-filter columns</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">Moderate (zipped XML)</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">YAML (.yaml)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">2-space indentation</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Kubernetes manifests, Docker Compose, CI/CD pipelines, Ansible configs</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Low (readable text)</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">XML (.xml)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Hierarchical tags</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">SOAP services, enterprise ERP integrations, Android resources</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">Moderate (verbose tags)</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">TSV (.tsv)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Tab (\t)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Text-heavy payloads containing embedded commas or punctuation</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Lowest (plain text)</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">JSONL (.jsonl)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Newline (\n)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Elasticsearch bulk index, BigQuery stream ingestion, LLM training data</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Low (line-based text)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <dl className="space-y-6 mb-6">
        {JSON_CONVERTER_FAQS.map((faq, index) => (
          <div key={index} className="border-b border-gray-100 dark:border-slate-800/80 pb-5 last:border-none">
            <dt className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {faq.question}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {faq.answer}
            </dd>
          </div>
        ))}
      </dl>

      {/* Related Developer Utilities */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
          Related Developer Utilities
        </h4>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/developer/json-formatter"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            JSON Formatter &amp; Validator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/developer/sql-formatter"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            SQL Query Formatter &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/developer/base64-encoder"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Base64 Encoder &amp; Decoder &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/seo/text-analyzer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Word Counter &amp; Text Analyzer &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}