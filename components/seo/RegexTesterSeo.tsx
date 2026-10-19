import Link from 'next/link';
import { SITE_URL } from '@/config/site';

export interface FaqItem {
  question: string;
  answer: string;
}

export const REGEX_TESTER_FAQS: FaqItem[] = [
  {
    question: 'How does the Web Worker protect against browser freezes during catastrophic backtracking?',
    answer:
      'Regular expressions are compiled and executed inside an isolated background Web Worker rather than on the browser main UI thread. The host thread enforces a strict 1,200 ms execution timeout. If a pattern enters an exponential backtracking loop, the worker thread is terminated and a fresh worker is initialized, keeping text input, page scrolling, and the user interface completely responsive.',
  },
  {
    question: 'Does the static regex risk scanner guarantee complete immunity against Regular Expression Denial of Service (ReDoS)?',
    answer:
      'No. The static risk analyzer is an early-warning heuristic that scans for common high-risk structures—such as nested quantifiers like (a+)+, overlapping alternations under repetition like (a|ab)+, and broad unanchored wildcard repetitions. While effective at catching common pitfalls, static heuristics cannot mathematically prove that an arbitrary regular expression is completely ReDoS-safe under all adversarial inputs.',
  },
  {
    question: 'What is the difference between greedy and lazy (reluctant) quantifiers?',
    answer:
      'Greedy quantifiers (*, +, {n,}) consume as many characters as possible and only backtrack when subsequent pattern tokens fail to match. Appending a question mark makes the quantifier lazy (*?, +?, {n,}?), instructing the engine to consume the absolute minimum number of characters necessary to satisfy the expression before proceeding.',
  },
  {
    question: 'How do lookaround assertions work, and do they consume characters in the match?',
    answer:
      'Lookarounds are zero-width assertions: they inspect the text immediately following (lookahead) or preceding (lookbehind) the current match index without advancing the search pointer or capturing characters into the final matched string ($0). For example, (?<=\\$)\\d+ matches digits only when preceded by a dollar sign, but the dollar sign is not included in the matched string.',
  },
  {
    question: 'Why do named capture groups written in JavaScript fail when ported to Python?',
    answer:
      'JavaScript conforms to ECMAScript syntax (?<name>...) and backreferences \\k<name>. Standard Python re uses PCRE-style syntax (?P<name>...) and backreferences (?P=name) or \\g<name> in replacements. KivaroTools provides an automated code generation tab that exports your expression into Python syntax with these conversions applied.',
  },
  {
    question: 'How does String.prototype.split() behave when the regex contains capturing parentheses?',
    answer:
      'In ECMAScript, if your split delimiter pattern contains capturing parentheses (e.g., \\s*([,;])\\s*), the captured delimiter characters are spliced directly into the returned output array alongside the split text segments. To split text without retaining the delimiters, use non-capturing groups (?:[,;]).',
  },
  {
    question: 'Are my regular expressions or test strings uploaded to a server?',
    answer:
      'No. All regular expression compilation, pattern explanation, replacement evaluation, split testing, and benchmarking execute locally inside your browser runtime. Confidential logs, proprietary text, and test fixtures never leave your device.',
  },
  {
    question: 'How are match start and end character offsets measured?',
    answer:
      'In accordance with the ECMAScript specification, match start and end indices are measured as zero-indexed UTF-16 code units. For standard ASCII and BMP characters, each character equals one code unit. Astral plane characters (such as emojis or rare historical scripts) occupy two UTF-16 code units (surrogate pairs).',
  },
];

export default function RegexTesterSeo() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_URL}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Developer Tools',
        item: `${SITE_URL}/developer`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Regex Tester & Code Generator',
        item: `${SITE_URL}/developer/regex-tester`,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: REGEX_TESTER_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      {/* Structured Data: BreadcrumbList & FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Regular Expression (Regex) Guide: ECMAScript Engine, Flag Mechanics &amp; Safe Testing
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        <strong>Regular Expressions (Regex)</strong> are declarative patterns used for pattern matching, validation,
        find-and-replace transformations, and string tokenization. Modern web browsers evaluate regular expressions using
        high-performance <strong>ECMAScript</strong> regex engines (such as V8 in Chromium, SpiderMonkey in Firefox, and
        JavaScriptCore in WebKit). Because backtracking regex engines evaluate non-deterministic finite automata (NFA),
        flawed patterns can trigger severe performance degradation or catastrophic backtracking.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Execution Architecture &amp; Client-Side Safeguards
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        KivaroTools executes regular expressions with multiple client-side safety measures:
      </p>
      <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Isolated Web Worker Execution:</strong> All evaluation runs inside a dedicated background Web Worker, ensuring that text input, scrolling, and tab switching remain responsive even during intensive evaluations. If Blob workers are restricted, a guarded synchronous fallback prevents application errors.
        </li>
        <li>
          <strong>1,200 ms Timeout Guard:</strong> If a regex fails to complete within 1,200 milliseconds, the host thread forcefully terminates the worker and reports an execution timeout, preventing infinite CPU spinning.
        </li>
        <li>
          <strong>Zero-Width Match Protection:</strong> Empty matches (such as <code className="text-xs">\b</code>, <code className="text-xs">^</code>, or <code className="text-xs">(?=...)</code>) automatically advance the regex search index with full Unicode surrogate pair awareness, preventing infinite loops.
        </li>
        <li>
          <strong>Structural Risk Heuristic:</strong> The static analyzer scans for known catastrophic backtracking shapes: nested quantifiers (e.g. <code className="text-xs">(a+)+</code>), ambiguous alternations (e.g. <code className="text-xs">(a|ab)+</code>), and broad unanchored wildcard repetitions. <em>Note: This heuristic serves as an early-warning diagnostic, not a formal mathematical proof of immunity under all adversarial inputs.</em>
        </li>
        <li>
          <strong>Formula Injection Defense:</strong> All match data exported as CSV is sanitized to neutralize spreadsheet formula prefixes (<code className="text-xs">=</code>, <code className="text-xs">+</code>, <code className="text-xs">-</code>, <code className="text-xs">@</code>).
        </li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        ECMAScript Regular Expression Flags
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Flag</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Name</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Behavior</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">g</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Global</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Finds all matches throughout the text rather than stopping after the first occurrence.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">i</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Ignore Case</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Treats uppercase and lowercase characters as equivalent ([a-z] matches [A-Z]).</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">m</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Multiline</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Anchors ^ and $ match the start and end of every line (\n), not just start and end of string.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">s</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">DotAll</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Allows the dot (.) wildcard to match newline characters (\n, \r).</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">u</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Unicode</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Enables full Unicode code point support, surrogate pair stepping, and Unicode property escapes (\p&#123;Letter&#125;).</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">y</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Sticky</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Matches only from the exact position indicated by the lastIndex property.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">d</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Indices</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Generates precise character start and end offsets for each capture group in match.indices.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Lookaround Assertions: Syntax &amp; Usage
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Lookarounds match positions without consuming characters, making them invaluable for validation requirements:
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Assertion Type</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Syntax</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Meaning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Positive Lookahead</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-emerald-600 dark:text-emerald-400">q(?=u)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Matches &quot;q&quot; only if followed immediately by &quot;u&quot;.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Negative Lookahead</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-red-600 dark:text-red-400">q(?!u)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Matches &quot;q&quot; only if NOT followed immediately by &quot;u&quot;.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Positive Lookbehind</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-emerald-600 dark:text-emerald-400">(?&lt;=\$)\d+</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Matches digits only if preceded immediately by a dollar sign ($).</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Negative Lookbehind</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-red-600 dark:text-red-400">(?&lt;!\\)&quot;</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Matches a quotation mark only if NOT preceded by a backslash.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Cross-Language Compatibility Considerations
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        While ECMAScript syntax is widely used, regular expression engines differ significantly across language runtimes:
      </p>
      <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Python (<code>re</code> module):</strong> Uses <code className="text-xs">(?P&lt;name&gt;...)</code> for named groups and <code className="text-xs">(?P=name)</code> for pattern backreferences. Standard Python requires fixed-width lookbehind assertions and does not support the <code className="text-xs">\p&#123;...&#125;</code> syntax without the third-party <code className="text-xs">regex</code> package.
        </li>
        <li>
          <strong>Java (<code>java.util.regex</code>):</strong> Supports <code className="text-xs">(?&lt;name&gt;...)</code> named groups since Java 7. Java has no global flag; iteration is handled with <code className="text-xs">while (matcher.find())</code>.
        </li>
        <li>
          <strong>Go (<code>regexp</code> package):</strong> Uses the Google RE2 engine, which guarantees linear-time <code className="text-xs">O(n)</code> execution. To prevent exponential backtracking, RE2 intentionally omits support for lookarounds and backreferences.
        </li>
      </ul>

      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <dl className="space-y-6 mb-6">
        {REGEX_TESTER_FAQS.map((faq, index) => (
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
          Related Developer &amp; SEO Utilities
        </h4>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/seo/text-analyzer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Word Counter &amp; Text Analyzer &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/seo/text-case-converter"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Text Case Converter &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
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
        </div>
      </div>
    </article>
  );
}