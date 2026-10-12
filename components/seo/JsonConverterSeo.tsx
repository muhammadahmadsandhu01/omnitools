import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const JSON_CONVERTER_FAQS: FaqItem[] = [
  {
    question: 'How does the converter transform deeply nested JSON objects into flat spreadsheet rows?',
    answer:
      'The converter uses recursive flattening. Nested keys are concatenated using your chosen separator (such as an underscore or dot, producing keys like "user_address_city"). If an object contains nested child objects down to 20 levels deep, each terminal leaf value becomes an independent column header in the resulting tabular grid.',
  },
  {
    question: 'Why does Microsoft Excel show corrupted special characters in CSV files, and how does UTF-8 BOM fix it?',
    answer:
      'By default, desktop versions of Microsoft Excel open CSV files using the operating system legacy ANSI code page instead of UTF-8, garbling accents and non-Latin characters. OmniTools prepends a UTF-8 Byte Order Mark (\\uFEFF) to CSV exports, explicitly signaling to Excel that the file is encoded in UTF-8 so characters display accurately.',
  },
  {
    question: 'What are the strict rules for escaping commas and quotes under the RFC 4180 CSV standard?',
    answer:
      'Under RFC 4180, any cell containing a comma, newline, or double quotation mark must be enclosed in double quotation marks. Any literal double quotation mark inside the cell value must be escaped by preceding it with another double quote ("").',
  },
  {
    question: 'How does the tool defend against Spreadsheet Formula Injection (CSV Injection)?',
    answer:
      'Spreadsheet software like Excel and Google Sheets can automatically execute formulas if a cell starts with =, +, -, @, or tab characters. OmniTools inspects every cell string: if a string starts with one of these trigger characters (and is not a standard finite number), it automatically prepends an apostrophe (\') to neutralize formula execution while preserving text readability.',
  },
  {
    question: 'How are JSON arrays with variable lengths handled during tabular conversion?',
    answer:
      'OmniTools provides three configurable array strategies: (1) JSON stringification, preserving the raw JSON array in a single cell; (2) Joined strings, concatenating values with a readable separator (e.g. "admin, editor"); and (3) Indexed columns, creating individual numbered headers like tags_0 and tags_1.',
  },
  {
    question: 'Is any JSON data sent to a remote server during file conversion?',
    answer:
      'No. All parsing, schema flattening, and file generation (CSV, TSV, and native Excel .xlsx via SheetJS) execute strictly client-side within your browser. Payloads larger than 256 KB are processed inside a background Web Worker to keep the UI smooth, with zero network transmission.',
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
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        JSON to CSV &amp; Excel Conversion Guide: RFC 4180 Escaping, Object Flattening &amp; Spreadsheets
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        While modern web APIs and document databases store data in hierarchical <strong>JSON (JavaScript Object Notation)</strong>,
        analytical workflows in Microsoft Excel, Google Sheets, PowerBI, and SQL databases require two-dimensional,
        rectangular tables (rows and columns). Converting tree-structured JSON into tabular formats requires
        systematic flattening, header normalization, and strict delimiter escaping.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Recursive Flattening: Converting Nested JSON Trees to Flat Grids
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Standard tabular rows cannot natively hold nested sub-objects. When encountering nested properties,
        OmniTools recurses through the object hierarchy, combining path keys with a delimiter such as an underscore or dot:
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Original Nested JSON Object</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Flattened Column Key</th>
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
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">{`{"meta": {"geo": {"lat": 40.71, "lon": -74.00}}}`}</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-blue-600 dark:text-blue-400">meta_geo_lat, meta_geo_lon</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-xs">40.71, -74.00</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">{`{"roles": ["admin", "editor"]}`}</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-emerald-600 dark:text-emerald-400">roles (Joined mode)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-xs">&quot;admin, editor&quot;</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        RFC 4180 Escaping Standards &amp; Formula Injection Defense
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        A naive comma replacement breaks down whenever textual data contains commas, quotation marks, or newlines.
        OmniTools adheres strictly to <strong>RFC 4180</strong> and incorporates formula injection defenses:
      </p>
      <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Enclosing Quotes:</strong> Any cell containing a comma, tab, or newline character is automatically wrapped in double quotes.
        </li>
        <li>
          <strong>Quote Escaping:</strong> If a string contains a literal double quote (e.g. <code className="text-xs">12&quot; Screen</code>), it is escaped by doubling it to <code className="text-xs">&quot;&quot;</code> (e.g. <code className="text-xs">&quot;12&quot;&quot; Screen&quot;</code>).
        </li>
        <li>
          <strong>UTF-8 Byte Order Mark (BOM):</strong> A leading <code className="text-xs">\uFEFF</code> character is added to ensure that non-ASCII international characters render correctly in Excel without manual import wizard configurations.
        </li>
        <li>
          <strong>Formula Injection Mitigation:</strong> Text beginning with spreadsheet formula triggers (<code className="text-xs">=</code>, <code className="text-xs">+</code>, <code className="text-xs">-</code>, <code className="text-xs">@</code>) is safely quoted with a leading apostrophe to prevent unintentional formula execution in desktop spreadsheets.
        </li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        File Format Comparison: CSV vs. TSV vs. Excel (.xlsx)
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Format</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Delimiter</th>
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
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">TSV (.tsv)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Tab (\t)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Text-heavy payloads containing embedded commas or punctuation</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Lowest (plain text)</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Excel (.xlsx)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Binary OpenXML</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Business spreadsheets, native Excel workbooks, typed columns</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">Moderate (zipped XML)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <dl className="space-y-6 mb-6">
        {JSON_CONVERTER_FAQS.map((faq, index) => (
          <div key={index}>
            <dt className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {faq.question}
            </dt>
            <dd className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {faq.answer}
            </dd>
          </div>
        ))}
      </dl>

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