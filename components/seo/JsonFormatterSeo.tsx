import Link from 'next/link';

export default function JsonFormatterSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What are the strict syntax rules mandated by the RFC 8259 JSON standard?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Under RFC 8259 and ECMA-404, all string literals and object property keys must be wrapped in standard double quotation marks. Single quotes are invalid. Trailing commas after the final key-value pair or array element are prohibited, and comments (// or /* */) are not permitted in standard JSON.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why does the "Unexpected token < in JSON at position 0" error occur?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'This error occurs when an application attempts to parse an HTTP response as JSON, but the backend server returned an HTML document instead (such as a 404 Not Found, 502 Bad Gateway, or Cloudflare challenge page starting with <!DOCTYPE html>).',
        },
      },
      {
        '@type': 'Question',
        name: 'How does JavaScript handle large 64-bit integers in JSON payloads?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'JavaScript parses JSON numbers using IEEE 754 double-precision floating point, which only guarantees exact integer precision up to 2^53 - 1 (9,007,199,254,740,991). Numbers larger than this, such as database 64-bit BigInts or Twitter/Discord Snowflake IDs, suffer silent rounding truncation unless transmitted as JSON strings.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the performance difference between formatted and minified JSON?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Formatted JSON with 2-space or 4-space indentation is human-readable and ideal for debugging and configuration files. Minified JSON strips all non-essential whitespace, line breaks, and tabs, reducing payload bandwidth by 20% to 40% when transferring data across production REST and GraphQL APIs.',
        },
      },
      {
        '@type': 'Question',
        name: 'What valid data types can be represented in standard JSON?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Standard JSON supports exactly six data types: string (UTF-8 double-quoted), number (integer or floating-point), boolean (true or false), array (ordered sequence), object (key-value collection), and null. Undefined, functions, dates, and symbols are not valid JSON primitives.',
        },
      },
    ],
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        JSON Specification &amp; Formatting Guide: RFC 8259 Standards, Tree Parsing &amp; Validation
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        <strong>JavaScript Object Notation (JSON)</strong> is an open-standard, text-based data interchange format governed by <strong>RFC 8259</strong> and <strong>ECMA-404</strong>. Although derived from JavaScript object syntax, JSON is completely language-independent and serves as the primary data exchange protocol for RESTful web services, cloud APIs, and NoSQL databases.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        RFC 8259 Syntax Rules: Common Validation Pitfalls
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Many developer syntax errors arise because JavaScript object literals are more lenient than strict JSON. To pass RFC 8259 validation, payloads must follow strict structural rules:
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
        Large Number Precision Limits (IEEE 754 Double Precision)
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        A subtle bug in distributed systems occurs when handling large integer identifiers in JSON. The IEEE 754 floating-point standard used by standard JSON parsers guarantees exact integer representation only up to:
      </p>
      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 font-mono text-sm sm:text-base mb-6 text-center text-slate-900 dark:text-slate-100">
        Number.MAX_SAFE_INTEGER = 2^53 - 1 = 9,007,199,254,740,991
      </div>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        When a backend returns a 64-bit integer (such as a database BigInt primary key or a Snowflake ID like <code>1740284918239019234</code>) as a raw JSON number, client-side JavaScript rounds the lower digits during parsing. To avoid silent data corruption, modern API architectures mandate serializing 64-bit IDs as string literals.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Formatting vs. Minification: When to Use Which
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">Beautified (Formatted) JSON</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Uses consistent 2-space or 4-space indentations and structural line breaks.
          </p>
          <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
            <li>&bull; Human inspection during API debugging</li>
            <li>&bull; Version control diffs in Git repositories</li>
            <li>&bull; Configuration files (package.json, tsconfig.json)</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">Minified (Compact) JSON</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Strips all unnecessary spaces, tabs, and newlines into a single line string.
          </p>
          <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
            <li>&bull; Production HTTP REST API payload transfers</li>
            <li>&bull; WebSocket real-time event streaming</li>
            <li>&bull; 20% to 40% bandwidth reduction over networks</li>
          </ul>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <div className="space-y-4 mb-6">
        {faqSchema.mainEntity.map((faq, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30"
          >
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
              {faq.name}
            </h4>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {faq.acceptedAnswer.text}
            </p>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Related Developer Utilities
      </h3>
      <p className="leading-relaxed text-slate-600 dark:text-slate-400">
        Convert JSON structures into CSV, XML, or YAML with the{' '}
        <Link href="/developer/json-converter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          JSON Converter
        </Link>
        , clean and beautify SQL queries with the{' '}
        <Link href="/developer/sql-formatter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          SQL Formatter
        </Link>
        , encode or decode binary payloads on the{' '}
        <Link href="/developer/base64-encoder" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Base64 Encoder &amp; Decoder
        </Link>
        , or test extraction patterns using the{' '}
        <Link href="/developer/regex-tester" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Regex Tester
        </Link>
        .
      </p>
    </article>
  );
}