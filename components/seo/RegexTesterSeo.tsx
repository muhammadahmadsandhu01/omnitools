import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const REGEX_TESTER_FAQS: FaqItem[] = [
  {
    question: 'How does KivaroTools protect against Regular Expression Denial of Service (ReDoS)?',
    answer:
      'Catastrophic backtracking (ReDoS) occurs when nested quantifiers or overlapping alternations (such as (a+)+ or (a|a)+) cause backtracking engines to evaluate an exponential number of permutations, freezing the CPU. KivaroTools executes regular expression evaluation inside an isolated background Web Worker with a strict 1,200 ms timeout watchdog. If a pattern stalls, the worker terminates safely, preventing browser tab freezes.',
  },
  {
    question: 'What do the 7 ECMAScript regex flags (g, i, m, s, u, y, d) do?',
    answer:
      'The flags control matching behavior: (1) g (Global) finds all matches rather than stopping at the first; (2) i (Ignore Case) enables case-insensitive matching; (3) m (Multiline) causes ^ and $ anchors to match start and end of each line; (4) s (DotAll) allows . to match newline characters; (5) u (Unicode) enables full Unicode code point handling; (6) y (Sticky) matches only starting at the exact lastIndex position; and (7) d (Indices) generates exact [start, end] substring boundary coordinates for all capture groups.',
  },
  {
    question: 'How does the ReDoS Risk Analyzer score regular expressions from 0 to 100?',
    answer:
      'The ReDoS analyzer inspects your pattern AST for structural vulnerability signatures: nested repetitions (e.g. (.*)*), overlapping alternations with shared prefixes, unanchored wildcards, and excessive greedy branches. It computes a risk score from 0 to 100, assigns a severity rating (Low, Moderate, High), and suggests safer token alternatives.',
  },
  {
    question: 'How do replacement tokens work ($1, $&, $`, $\', and $<name>)?',
    answer:
      'In the Replace panel, replacement strings support standard substitution tokens: $& inserts the entire matched substring, $1 and $2 insert numbered capture groups, $<name> inserts named groups, $` inserts the text preceding the match, $\' inserts the text following the match, and $$ inserts a literal dollar sign.',
  },
  {
    question: 'What is the difference between ECMAScript (V8), Python (re), Go (RE2), and Java regex?',
    answer:
      'JavaScript V8, Python re, and Java java.util.regex use backtracking engines supporting lookaheads, lookbehinds, and backreferences. In contrast, Go uses Google\'s RE2 engine, which guarantees linear O(n) execution time by intentionally omitting backreferences and lookaround assertions to prevent ReDoS. The Cross-Engine Compatibility Matrix highlights which tokens are portable across these languages.',
  },
  {
    question: 'How does the automatic infinite loop guard handle zero-width matches?',
    answer:
      'Patterns that match empty strings (such as ^, $, \\b, or a*) can cause infinite loops in global matching if lastIndex fails to advance. KivaroTools detects zero-width matches and automatically advances the search offset by one UTF-16 code unit, preventing thread lockup.',
  },
  {
    question: 'Are my regular expressions, test strings, or log snippets uploaded to any server?',
    answer:
      'No. 100% of pattern compilation, string matching, syntax explanation, ReDoS analysis, and polyglot code generation execute locally in your browser memory inside a dedicated Web Worker. Confidential log files and test inputs are never uploaded to any server or cloud API.',
  },
  {
    question: 'Can I share a regex pattern and test string with colleagues without saving to a database?',
    answer:
      'Yes. Clicking "Share via URL Hash" compresses your pattern, active flags, and test string directly into the client-side URL fragment (#pattern=...&flags=...). You can share this link with teammates, and when opened, the workbench reconstructs the entire session client-side with zero server storage.',
  },
  {
    question: 'What is the maximum test string length and match limit supported?',
    answer:
      'KivaroTools supports test strings up to 150,000 characters and patterns up to 4,000 characters. The engine records up to 10,000 total matches and displays the first 300 visual highlight spans simultaneously in the syntax overlay.',
  },
  {
    question: 'How does the Plain English AST Explainer work?',
    answer:
      'The Explain tab deconstructs your regular expression into its component grammar tokens. It provides natural-language descriptions for every character class, quantifier, assertion, and group (e.g., explaining \\b[A-Za-z0-9._%+-]+ as "Word boundary followed by one or more letters, digits, or allowed email symbols").',
  },
  {
    question: 'What programming languages can I generate code for?',
    answer:
      'The Code tab generates production-ready boilerplate code with one-click copy buttons for: (1) JavaScript (RegExp.exec and matchAll), (2) Python (re.finditer and re.search), (3) Java (java.util.regex.Pattern and Matcher), and (4) Go (regexp.MustCompile and FindAllStringSubmatch).',
  },
  {
    question: 'How does the Match Breakdown table display capture groups?',
    answer:
      'The Breakdown panel paginates matches (50 per page) in an interactive table showing match index, character range [start, end], full matched text, numbered capture groups ($1, $2), and named groups (?<name>), with one-click copying for any extracted value.',
  },
  {
    question: 'What built-in pattern presets are available in the library?',
    answer:
      'The preset library includes 12 battle-tested patterns: RFC 5322 Email, Strong Password (lookahead policy), RFC 3986 URL, IPv4 Address, HTML Tags, ISO 8601 Date (YYYY-MM-DD), UUID v4, Hex Color, Currency, Semantic Versioning (SemVer), North American Phone, and Quoted String.',
  },
  {
    question: 'How does the Split panel help with text parsing and data extraction?',
    answer:
      'The Split tab evaluates your regular expression as a delimiter to split the test string into an indexed array of substrings, allowing you to test complex log parsing and CSV extraction logic before writing backend code.',
  },
  {
    question: 'How does the Regex Tester protect my browser tab against catastrophic backtracking (ReDoS)?',
    answer:
      'All pattern execution is isolated inside a dedicated background Web Worker guarded by a strict 1,200 ms watchdog timer. If an exponential backtracking pattern stalls, the worker terminates cleanly without freezing your UI.',
  },
];

export default function RegexTesterSeo() {
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
    <>
      {/* FAQPage JSON-LD Structured Data for Google Rich Snippets (BreadcrumbList emitted by shell) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Test, Debug, and Benchmark Regular Expressions with ReDoS Protection Online',
            description: 'Step-by-step guide to testing JavaScript/ECMAScript regular expressions, inspecting capture groups, running substitution previews, and auditing ReDoS safety.',
            step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Enter Regular Expression Pattern & Flags',
        text: 'Type your regex pattern and toggle ECMAScript flags (g, i, m, s, u, y, d) or load a curated pattern from the library.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Provide Test Strings & Edge Cases',
        text: 'Paste target text into the test editor to highlight all matches and non-matches in real time.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Inspect Capture Groups & Substitution Preview',
        text: 'Review numbered ($1, $2) and named (?<name>) capture groups with exact character offsets, and test replace() substitution templates.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Audit AST Token Explanation & ReDoS Safety',
        text: 'Check the plain-English token-by-token explanation and verify that the 1.5-second Web Worker watchdog reports zero catastrophic backtracking (ReDoS) risk.',
      }
            ],
          }),
        }}
      />

      <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
        {/* Zone 2: Deep-Dive Architecture & Engine Sections */}
        <section aria-labelledby="regex-tester-architecture" className="mb-8">
          <h2 id="regex-tester-architecture" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Real-Time Regular Expression Engineering, ReDoS Safety &amp; AST Analysis
          </h2>
          <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
            <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
              <strong>100% Client-Side In-Browser Execution:</strong> All regular expression evaluation, syntax explanation, ReDoS analysis, and polyglot code generation run locally on your device. Proprietary log snippets, customer inputs, and regex patterns are never uploaded to any server.
            </p>
          </blockquote>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            <strong>Regular Expressions (Regex)</strong> are algebraic patterns used for string validation, lexical tokenization, and text substitution. While indispensable across software engineering, writing correct regular expressions is notoriously error-prone. A single unanchored quantifier or misplaced alternation can cause unexpected false positives, corrupt capture groups, or introduce catastrophic backtracking vulnerabilities that crash backend servers.
          </p>
          <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
            KivaroTools provides a modern, privacy-first <strong>Regex Tester, Debugger &amp; Code Generator</strong> engineered for software developers. Powered by an isolated Web Worker with real-time match highlighting, 7 ECMAScript flags, automated ReDoS vulnerability analysis, and multi-language code generation, it transforms complex regex development into a deterministic, visual experience.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Web Worker Sandbox with 1,200 ms ReDoS Watchdog Timer
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Catastrophic backtracking (Regular Expression Denial of Service or ReDoS) occurs when ambiguous nested quantifiers (like <code>(a+)+$</code> or <code>([a-zA-Z]+)*</code>) force the regex engine into an exponential search tree when matching non-matching inputs. In traditional online tools, this freezes the browser tab. KivaroTools isolates all evaluation inside a dedicated <strong>Web Worker</strong> guarded by a <strong>1,200 ms execution timer</strong>. If a pattern stalls, the worker terminates instantly and highlights the catastrophic backtracking hazard.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            7 ECMAScript Flags Including Flag d (hasIndices) Substring Coordinates
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            KivaroTools supports all 7 ECMAScript regex flags: <code>g</code> (global search), <code>i</code> (case-insensitive), <code>m</code> (multiline anchors), <code>s</code> (dotAll wildcards matching newlines), <code>u</code> (full Unicode code points), <code>y</code> (sticky matching at lastIndex), and the modern ECMAScript <code>d</code> flag (hasIndices). Enabling <code>d</code> extracts exact <code>[start, end]</code> character indices for the full match and every individual capture group.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            ReDoS Risk Scoring &amp; Cross-Engine Compatibility Matrix
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            The Analyze panel computes an automated <strong>ReDoS Risk Score (0 to 100)</strong> by auditing your pattern for nested quantifiers, overlapping character classes, and ambiguous alternations. Alongside the risk score, a Cross-Engine Compatibility Matrix displays whether your tokens (lookaheads, lookbehinds, named groups) are portable across <strong>JavaScript (V8)</strong>, <strong>Python (re)</strong>, <strong>Go (RE2)</strong>, and <strong>Java (java.util.regex)</strong>.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Infinite Loop Guard for Zero-Width Matches
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Patterns matching zero-width assertions (such as <code>^</code>, <code>$</code>, <code>\b</code>, or <code>a*</code>) can cause infinite loops when evaluated globally. KivaroTools incorporates an automatic index incrementer: whenever a match has zero length, the pointer advances by one code unit, preventing browser freezing while capturing all boundary positions.
          </p>
        </section>

        {/* Zone 3: Interactive Feature & Use-Case Grid */}
        <section aria-labelledby="regex-tester-panels" className="mb-8">
          <h2 id="regex-tester-panels" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            7 Interactive Analysis &amp; Productivity Panels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                1. Match Breakdown Table
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Paginated match inspector (50 per page, up to 10,000 matches) displaying exact character offsets <code>[start, end]</code>, full match values, numbered groups (<code>$1, $2</code>), and named groups (<code>(?&lt;name&gt;)</code>).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                2. Live Replacement Preview
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Test replacement patterns in real-time with full support for standard substitution tokens: <code>$$</code> (dollar), <code>$&amp;</code> (full match), <code>$`</code> (before match), <code>$&apos;</code> (after match), <code>$1</code> (group), and <code>$&lt;name&gt;</code>.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                3. Delimiter Split Array Viewer
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Evaluate your regular expression as a split delimiter, rendering an indexed array of extracted segments for log line parsing and CSV delimiter testing.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                4. Searchable Interactive Cheatsheet
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Integrated quick reference categorized into Character Classes, Quantifiers (Greedy vs Lazy), Anchors, Lookarounds, Flags, and Replacement backreferences with instant copy-to-editor actions.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                5. Plain English AST Explainer
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Translates cryptic regular expression tokens into natural-language English explanations, breaking down lookaheads, word boundaries, and character sets for rapid code reviews.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                6. Polyglot Code Snippet Generator
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Export tested patterns as copyable boilerplate for JavaScript (<code>RegExp.exec / matchAll</code>), Python (<code>re.finditer / search</code>), Java (<code>Pattern / Matcher</code>), and Go (<code>regexp.MustCompile</code>).
              </p>
            </div>
          </div>
        </section>

        {/* Zone 4: Technical Specification & Comparison Matrices */}
        <section aria-labelledby="regex-tester-compatibility" className="mb-8">
          <h2 id="regex-tester-compatibility" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Technical Specification: Cross-Engine Regular Expression Compatibility
          </h2>
          <div className="overflow-x-auto overscroll-x-contain mb-6">
            <table className="min-w-[680px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Feature / Token</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">JavaScript (V8)</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Python (re)</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Go (RE2)</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Java (regex)</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Engine Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Positive Lookahead (?=...)</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Supported</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Supported</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-red-600 dark:text-red-400 font-medium">Unsupported</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Supported</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Go RE2 rejects lookarounds for linear time safety</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Lookbehind (?&lt;=...)</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Supported (V8)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 font-medium">Fixed Width Only</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-red-600 dark:text-red-400 font-medium">Unsupported</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Supported</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Python requires fixed-length pattern in lookbehind</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Named Groups (?&lt;name&gt;...)</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Supported (ES2018)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Supported (?P&lt;name&gt;)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Supported (?P&lt;name&gt;)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Supported (Java 7+)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Python &amp; Go use (?P&lt;name&gt;) syntax variant</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Backreferences (\\1, \\2)</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Supported</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Supported</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-red-600 dark:text-red-400 font-medium">Unsupported</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Supported</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Backreferences make matching NP-complete</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Unicode Escapes (\\p&#123;L&#125;)</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Supported (u flag)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 font-medium">regex module only</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Supported</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Supported</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Python built-in re requires third-party regex library</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Zone 5: Developer Troubleshooting & Error Reference */}
        <section aria-labelledby="regex-tester-troubleshooting" className="mb-8">
          <h2 id="regex-tester-troubleshooting" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Common Regular Expression Errors &amp; Fixes
          </h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Catastrophic Backtracking (ReDoS) Freezes Application
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Hazard:</strong> Nested repetitions like <code>(a+)+</code> or <code>(.*a)+b</code> cause exponential backtracking iterations when matched against long non-matching strings.
                <br />
                <strong>Fix:</strong> KivaroTools flags ReDoS vulnerabilities. Refactor nested quantifiers by anchoring strings with <code>^...$</code>, making quantifiers possessive or atomic, or using character class negation like <code>[^a]*</code>.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Unescaped Literal Dot Matches Any Character
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Hazard:</strong> Writing <code>filename.txt</code> or <code>192.168.1.1</code> without escaping dots allows any character (e.g. <code>filename-txt</code> or <code>192X168Y1Z1</code>) to match.
                <br />
                <strong>Fix:</strong> Always escape literal periods with backslashes (<code>filename\.txt</code> or <code>192\.168\.1\.1</code>).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Greedy Quantifier Matches Across Entire Multiline Payload
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Hazard:</strong> Using greedy wildcard matches like <code>&lt;div&gt;.*&lt;/div&gt;</code> consumes everything from the first opening tag to the final closing tag on the page.
                <br />
                <strong>Fix:</strong> Use lazy quantifiers (<code>&lt;div&gt;.*?&lt;/div&gt;</code>) or inverted character classes (<code>&lt;div&gt;[^&lt;]*&lt;/div&gt;</code>).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Word Boundary \b Fails on Non-ASCII Unicode Names
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Hazard:</strong> Standard <code>\b</code> boundaries only treat ASCII alphanumeric characters (<code>[a-zA-Z0-9_]</code>) as word characters, failing on accents or international names (e.g. René or Müller).
                <br />
                <strong>Fix:</strong> Enable the <code>u</code> flag and use Unicode property escapes like <code>(?&lt;=\s|^)\p&#123;L&#125;+(?=\s|$)</code> for international language matching.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Partial Match Passes Validation Due to Missing Anchors
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Hazard:</strong> Writing <code>\d&#123;5&#125;</code> to validate a 5-digit postal code erroneously passes strings like <code>abc12345xyz</code> because the substring matches.
                <br />
                <strong>Fix:</strong> Anchor validation patterns with <code>^</code> (start of string) and <code>$</code> (end of string): <code>^\d&#123;5&#125;$</code>.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Go RE2 Runtime Panic on Lookarounds and Backreferences
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Hazard:</strong> Testing patterns with lookahead assertions (<code>(?=...)</code>) and copying them into Go code causes <code>regexp.Compile</code> to error out at runtime.
                <br />
                <strong>Fix:</strong> Consult the Compatibility Matrix in the Analyze panel to verify that your pattern is valid for Go RE2 before deploying backend code.
              </p>
            </div>
          </div>
        </section>

        {/* Zone 6: Frequently Asked Questions */}
              {/* Competitor Comparison Section */}
      <section aria-labelledby="regex-competitor-comparison" className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h2 id="regex-competitor-comparison" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Regex Tester Comparison: KivaroTools vs. Regular Expression Tools
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm sm:text-base leading-relaxed">
          See why developers rely on KivaroTools for safe regular expression testing and ReDoS protection:
        </p>
        <div className="w-full max-w-full overflow-x-auto overscroll-x-contain my-6 not-prose">
          <table className="min-w-[680px] w-full text-xs sm:text-sm text-left border-collapse border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Capability / Metric</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold">KivaroTools (100% Free)</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Regex101</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Regexr</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">ExtendsClass</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">ReDoS Watchdog &amp; Backtracking Guard</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">1.2s Web Worker Execution Guard + Risk Alert</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Server worker crash</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Browser UI freezes</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">None</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Plain-English AST Explanation</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Instant Token-by-Token Narrative Breakdown</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Legend pane</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Hover tooltip only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">None</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Cross-Language Code Export</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">4 Languages (JavaScript, Python, Go &amp; Java)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Code generator</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">JS only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">None</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Capture Group Offsets &amp; CSV</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Numbered ($1) &amp; Named (?&lt;name&gt;) Groups to CSV</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Match table</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Preview only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Basic preview</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Zero Server Logging</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">100% In-Browser Memory (Works Offline)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Analytics tracking</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Analytics tracking</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Ad trackers</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="regex-tester-frequently-asked-questions" className="mb-8">
          <h2 id="regex-tester-frequently-asked-questions" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {REGEX_TESTER_FAQS.map((faq, index) => (
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
        <section aria-labelledby="regex-tester-related-utilities" className="mb-8">
          <h2 id="regex-tester-related-utilities" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Related Client-Side Developer Workflows
          </h2>
          <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-sm">
            Explore our integrated developer toolchain for full-stack engineering:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>
              <Link href="/developer/sql-formatter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                SQL Query Formatter &amp; Linter
              </Link>{' '}
              — Format database queries, CTEs, and regex filters across 19 dialects with static anti-pattern detection.
            </li>
            <li>
              <Link href="/developer/password-generator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Cryptographic Password &amp; Secret Generator
              </Link>{' '}
              — Test password complexity patterns and generate high-entropy secrets and 1 GB file checksums via Web Crypto.
            </li>
            <li>
              <Link href="/developer/json-formatter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                JSON Formatter, Validator &amp; Tree Viewer
              </Link>{' '}
              — Validate API payloads up to 25 MB with 64-bit BigInt precision loss detection and auto-repair.
            </li>
            <li>
              <Link href="/developer/json-converter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                JSON to CSV &amp; Excel Converter
              </Link>{' '}
              — Flatten nested JSON data into spreadsheets and YAML manifests with formula injection protection.
            </li>
            <li>
              <Link href="/developer/base64-encoder" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Base64 Encoder &amp; Decoder
              </Link>{' '}
              — Safely encode and decode UTF-8 text, emojis, Base64URL tokens, and binary files up to 25 MB.
            </li>
            <li>
              <Link href="/developer/svg-optimizer" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                SVG Optimizer &amp; Cleaner
              </Link>{' '}
              — Clean bloated vector graphics and sanitize malicious scripts with sandboxed visual previewing.
            </li>
          </ul>
        </section>
      
                {/* Programmatic Long-Tail Search Intent & Global Use-Case Coverage (36 Intents) */}
        <section id="programmatic-search-intents" aria-label="Supported Search Intents and Workflows" className="my-8 p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 not-prose">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
            Regex Tester, Debugger &amp; Code Generator — Supported Workflows &amp; Long-Tail Search Coverage (36 Intents)
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">regex tester debugger online</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">regular expression visualizer explainer</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">redos catastrophic backtracking vulnerability checker</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">regex capture group named group extractor</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">regex replace and split live preview</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">generate regex code javascript python go java rust</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">ecmascript regex flags g i m s u y d</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">zero length regex match infinite loop guard</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">common regex pattern library email url ipv4</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">client side web worker regex sandbox</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">regular expression tester online with real time match</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">redos vulnerability detector catastrophic backtracking analyzer</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">explain regex pattern in plain english step by step</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">regex capture groups inspector numbered and named groups</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">regex replace and substitution preview tester online</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">javascript regex tester ecmascript v8 flags g i m s u y</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">python regex tester re module pattern matching</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">java regex tester pattern and matcher syntax</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">test email validation regex pattern with edge cases</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">test url and domain regex pattern online</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">phone number international regex tester</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">date format yyyy mm dd regex pattern validator</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">password complexity regex tester uppercase lowercase symbol</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">regex cheat sheet character classes anchors quantifiers</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">copy regex pattern as escaped javascript python java string</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">safe regex execution web worker 1.5 second timeout</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">export regex match results to csv file</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">multiline regex matching and dotall flag tester</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">lookahead and lookbehind regex assertions tester</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">greedy vs lazy non greedy regex quantifiers tester</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">unicode property escapes regex matching emoji letters</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">debug complicated regex pattern with match offsets</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">client side regex workbench zero network logging</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">free regex debugger for software engineers</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">test ip address ipv4 ipv6 regex patterns online</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">enterprise regular expression tool with redos security score</span>
          </div>
        </section>
      </article>
    </>
  );
}