import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const TEXT_CASE_FAQS: FaqItem[] = [
  {
    question: 'What is the difference between Title Case and Capitalized Case?',
    answer:
      'Title Case follows standard grammatical conventions where principal words are capitalized while minor grammatical articles, prepositions, and conjunctions (such as "a", "an", "the", "and", "but", "in", "of") remain in lowercase unless appearing as the first or last word. Capitalized Case (Start Case) capitalizes the initial letter of every single word without exception.',
  },
  {
    question: 'How does the converter handle developer acronyms like XMLHttpRequest or parseJSONResponse?',
    answer:
      'OmniTools utilizes an intelligent developer tokenization algorithm that recognizes multi-character acronyms and digit transitions. For example, "XMLHttpRequest" decomposes cleanly into ["XML", "Http", "Request"] to produce proper camelCase ("xmlHttpRequest") or snake_case ("xml_http_request") without clumping acronym boundaries.',
  },
  {
    question: 'Is my text uploaded or stored on any server during case conversion?',
    answer:
      'No. OmniTools Text Case Converter processes all text 100% locally in your web browser. All case conversion and text cleanup operations run entirely within client-side JavaScript memory—no user text is sent to our servers, third-party APIs, or external storage.',
  },
  {
    question: 'Does the tool support multiline text or lists of variable names?',
    answer:
      'Yes. The "Preserve Lines" toggle allows each line of text to be converted independently, making it easy to convert lists of database columns, CSS classes, or variable names without merging them into a single line.',
  },
  {
    question: 'How does Turkish locale-specific casing work?',
    answer:
      'In the Turkish and Azerbaijani alphabets, the letter "i" has two distinct forms: dotted (İ/i) and dotless (I/ı). When the Turkish locale is selected, "istanbul" properly capitalizes to "İSTANBUL", and "IĞDIR" lowercases to "ığdır", preventing common linguistic errors produced by standard ASCII casing.',
  },
  {
    question: 'Does the tool support international characters, accents, and emojis?',
    answer:
      'Yes. Accented Latin characters (é, ü, ç, ñ), Cyrillic, Greek, Devanagari, Arabic, CJK scripts, and multi-byte emojis (including skin-tone modifiers and ZWJ sequences) are fully supported using Unicode-aware code-point and grapheme cluster handling.',
  },
  {
    question: 'Are there limits on text input size?',
    answer:
      'Because execution is browser-native, standard documents and payloads up to 100 KB+ convert within hundreds of milliseconds without UI freeze or server latency.',
  },
];

export default function TextCaseConverterSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: TEXT_CASE_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 text-slate-900 dark:text-white">
        Professional Text Case Converter: Standard & Developer Naming Formats
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-300">
        Transforming text between casing conventions is an essential daily workflow for writers, editors, programmers, and data analysts. OmniTools <strong>Text Case Converter</strong> delivers an enterprise-grade text transformation studio running entirely in your browser. Whether you need to fix all-caps titles, generate clean programming identifiers (camelCase, PascalCase, snake_case, kebab-case), or clean up whitespace, all operations execute instantly with zero server latency.
      </p>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Supported Case Formats & Conventions
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200">
              <th className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">Format</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">Category</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">Example Output</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">Primary Use Case</th>
            </tr>
          </thead>
          <tbody className="text-slate-600 dark:text-slate-300">
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">Sentence case</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Writing</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">The quick brown fox.</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Standard prose, articles, reports</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">Title Case</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Writing</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">The Quick Brown Fox and the Hound</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Headlines, book & essay titles</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">Capitalized Case</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Writing</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">The Quick Brown Fox And The Hound</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Table headers, form labels</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">UPPERCASE</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Writing</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">HELLO WORLD</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Acronyms, alerts, legal notices</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">lowercase</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Writing</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">hello world</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">URLs, email handles, normalize text</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">camelCase</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">myVariableName</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">JavaScript, TypeScript, Java variables</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">PascalCase</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">MyClassName</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">React components, classes, types</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">snake_case</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">database_column_name</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Python, SQL, database tables</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">kebab-case</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">slug-url-path-name</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">CSS class names, URLs, package names</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">CONSTANT_CASE</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">MAX_RETRY_COUNT</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Environment variables, global constants</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">dot.case</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">config.network.timeout</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Properties, JSON keys, logging domains</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">path/case</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">src/components/button</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">File paths, API endpoint structures</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        How to Use the Converter
      </h3>
      <ol className="list-decimal pl-6 space-y-2 mb-6 text-slate-600 dark:text-slate-300">
        <li>
          <strong>Enter or Paste Text:</strong> Type or paste your source text into the left editor. You can also click &ldquo;Load Sample Text&rdquo; to test standard patterns.
        </li>
        <li>
          <strong>Select Your Target Case:</strong> Click on any mode pill (such as <em>camelCase</em>, <em>Title Case</em>, or <em>snake_case</em>). The output updates live.
        </li>
        <li>
          <strong>Apply Optional Cleanups:</strong> Use the cleanup bar to trim excess whitespace, collapse double spaces, or delete blank lines.
        </li>
        <li>
          <strong>Copy or Download:</strong> Click &ldquo;Copy Result&rdquo; to copy to your clipboard or &ldquo;.txt&rdquo; to download a plain text file.
        </li>
      </ol>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Client-Side Privacy: Your Text Stays on Your Machine
      </h3>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-300">
        Unlike cloud-based utilities that transmit confidential prose, private API keys, database schemas, or proprietary code to external APIs, OmniTools processes everything within your browser&apos;s local JavaScript runtime. All case conversion and text cleanup operations run entirely within client-side memory—no user text is sent to our servers, third-party APIs, or external storage.
      </p>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (FAQ)
      </h3>
      <div className="space-y-4 mb-8 text-slate-600 dark:text-slate-300">
        {TEXT_CASE_FAQS.map((faq, index) => (
          <div key={index}>
            <h4 className="font-semibold text-slate-900 dark:text-white">
              {faq.question}
            </h4>
            <p className="text-sm mt-1">{faq.answer}</p>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Related OmniTools Utilities
      </h3>
      <p className="mb-4 text-slate-600 dark:text-slate-300 text-sm">
        Explore other free, browser-based tools in the OmniTools workspace:
      </p>
      <ul className="list-disc pl-6 space-y-1.5 text-sm text-blue-600 dark:text-blue-400">
        <li>
          <Link href="/seo/text-analyzer" className="hover:underline">
            Word Counter & Text Analyzer — Analyze word count, character density, and readability
          </Link>
        </li>
        <li>
          <Link href="/developer/json-formatter" className="hover:underline">
            JSON Formatter & Validator — Format, validate, and minify JSON data
          </Link>
        </li>
        <li>
          <Link href="/developer/base64-encoder" className="hover:underline">
            Base64 Encoder & Decoder — Encode or decode text and strings in your browser
          </Link>
        </li>
        <li>
          <Link href="/developer/regex-tester" className="hover:underline">
            Regex Tester & Generator — Live regular expression testing with snippet generation
          </Link>
        </li>
      </ul>
    </article>
  );
}
