import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const JSON_FORMATTER_FAQS: FaqItem[] = [
  {
    question: 'What are the strict syntax rules mandated by the RFC 8259 JSON standard?',
    answer:
      'Under RFC 8259 and ECMA-404, all string literals and object property keys must be wrapped in standard double quotation marks ("..."). Single quotes are invalid. Trailing commas after the final key-value pair or array element are strictly prohibited, and comments (// or /* */) are not permitted in standard JSON.',
  },
  {
    question: 'How does OmniTools handle very large JSON payloads without freezing the browser?',
    answer:
      'OmniTools enforces a 25 MB input safety budget. For payloads exceeding 256 KB, parsing and structural tokenization automatically offload to a dedicated background Web Worker thread, keeping the main UI completely responsive. Additionally, the tree viewer utilizes virtualized row rendering to smoothly scroll through hundreds of thousands of nodes.',
  },
  {
    question: 'Why does JavaScript truncate large 64-bit integers in JSON and how does OmniTools detect it?',
    answer:
      'JavaScript native numbers follow IEEE 754 double-precision floating point, which guarantees exact integer precision only up to 2^53 - 1 (9,007,199,254,740,991). Numbers larger than Number.MAX_SAFE_INTEGER (such as database BigInts or Twitter/Discord Snowflake IDs) suffer silent rounding loss. OmniTools runs regex diagnostics on raw input strings to highlight unsafe numbers before JSON.parse truncates them.',
  },
  {
    question: 'How are duplicate object keys identified and flagged during validation?',
    answer:
      'Standard JSON.parse silently overwrites earlier duplicate keys with the last parsed value, masking critical configuration bugs. OmniTools runs a non-destructive lexical scanner across the raw text to detect duplicate object keys and reports their exact line and column coordinates.',
  },
  {
    question: 'What is the performance difference between formatted and minified JSON?',
    answer:
      'Formatted JSON with 2-space or 4-space indentation is optimized for human inspection, debugging, and Git diff tracking. Minified JSON strips all non-essential whitespace, line breaks, and tabs into a single contiguous stream, reducing network bandwidth by 20% to 40% across REST and GraphQL API payloads.',
  },
];

export default function JsonFormatterSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: JSON_FORMATTER_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        JSON Specification &amp; Formatting Guide: RFC 8259 Standards, Tree Parsing &amp; Precision Safety
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        <strong>JavaScript Object Notation (JSON)</strong> is an open-standard, text-based data interchange format governed by <strong>RFC 8259</strong> and <strong>ECMA-404</strong>. Although derived from JavaScript object syntax, JSON is language-agnostic and serves as the universal transport format across RESTful web services, cloud APIs, NoSQL stores, and distributed microservices.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        RFC 8259 Syntax Rules: Common Validation Pitfalls
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Many developer syntax errors arise because JavaScript object literals in source code are far more lenient than strict JSON specifications. To pass standard RFC 8259 validation, payloads must follow strict structural rules:
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Rule</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Valid JSON Syntax</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Invalid / Disallowed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Quotation Marks</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">&quot;key&quot;: &quot;value&quot;</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-red-600 dark:text-red-400">&apos;key&apos;: &apos;value&apos; (single quotes prohibited)</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Trailing Commas</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">[1, 2, 3]</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-red-600 dark:text-red-400">[1, 2, 3,] (trailing comma causes syntax error)</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Comments</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">&quot;description&quot;: &quot;note&quot;</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-red-600 dark:text-red-400">{'// Comment or /* Comment */ (invalid in JSON)'}</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Undefined / Functions</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">&quot;status&quot;: null</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-red-600 dark:text-red-400">&quot;status&quot;: undefined (undefined is invalid)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Large Integer Precision Limits (IEEE 754 Double Precision)
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        A subtle bug in distributed software occurs when transmitting 64-bit database identifiers in JSON. The IEEE 754 floating-point standard used by browser JavaScript engines guarantees exact integer representation only up to:
      </p>
      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 font-mono text-sm sm:text-base mb-6 text-center text-slate-900 dark:text-slate-100">
        Number.MAX_SAFE_INTEGER = 2^53 - 1 = 9,007,199,254,740,991
      </div>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        When an API returns a 64-bit integer (such as a database BigInt primary key or a Snowflake ID like <code>1740284918239019234</code>) as a raw JSON number, client-side JavaScript silently rounds the least-significant digits during parsing. OmniTools performs pre-parse regex scanning to flag integers exceeding safe bounds, recommending string serialization (e.g. <code>&quot;1740284918239019234&quot;</code>).
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Enterprise Safety &amp; Virtualized Tree Architecture
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        OmniTools JSON Formatter is engineered to handle production workloads with high reliability:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">25 MB Input Budget</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Enforces a hard 25 MB safety ceiling to prevent browser memory exhaustion and runaway garbage collection.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Web Worker Offloading</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Payloads over 256 KB automatically delegate parsing to a Web Worker background thread, preserving 60 FPS UI rendering.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Virtual Tree Viewer</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Virtualizes node rows with 28px height calculation, rendering up to 60,000 nodes without DOM lag.
          </p>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <div className="space-y-4 mb-6">
        {JSON_FORMATTER_FAQS.map((faq, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30"
          >
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
              {faq.question}
            </h4>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Related Developer Utilities
      </h3>
      <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-sm">
        Transform JSON payloads into CSV or Excel tables with the{' '}
        <Link href="/developer/json-converter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          JSON to CSV Converter
        </Link>
        , beautify complex queries using the{' '}
        <Link href="/developer/sql-formatter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          SQL Query Formatter
        </Link>
        , encode binary streams with the{' '}
        <Link href="/developer/base64-encoder" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Base64 Encoder &amp; Decoder
        </Link>
        , or validate regex extraction rules with the{' '}
        <Link href="/developer/regex-tester" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Regex Tester &amp; Code Generator
        </Link>
        .
      </p>
    </article>
  );
}