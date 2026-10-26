import Link from 'next/link';
import {
  HelpCircle,
  AlertTriangle,
  Wrench,
} from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

export const TEXT_CASE_FAQS: FaqItem[] = [
  {
    question: 'What is the exact difference between Title Case and Capitalized Case?',
    answer:
      'Title Case follows standard editorial conventions (such as Chicago, AP, and APA style principles) where major content words (nouns, verbs, adjectives, adverbs, and pronouns) are capitalized, while minor grammatical words (articles like "a", "an", "the"; short prepositions like "in", "of", "on", "at", "to", "for"; and coordinating conjunctions like "and", "but", "or") remain lowercase unless they appear as the first or last word of the title or immediately following a colon. In contrast, Capitalized Case (often called Start Case or Word Capitalization) capitalizes the initial letter of every single word without exception.',
  },
  {
    question: 'How does the converter handle complex developer acronyms like XMLHttpRequest or parseJSONResponse?',
    answer:
      'KivaroTools utilizes an intelligent identifier tokenizer that recognizes transitions between multi-character uppercase acronyms, camelCase humps, and numeric version markers. For example, "XMLHttpRequest" decomposes cleanly into ["XML", "Http", "Request"] to produce proper camelCase ("xmlHttpRequest") or snake_case ("xml_http_request") without clumping acronym boundaries together.',
  },
  {
    question: 'Is my text uploaded or stored on any server during case conversion?',
    answer:
      'No. KivaroTools Text Case Converter executes 100% locally in your web browser using client-side JavaScript memory. No user text, confidential prose, API keys, database column names, or code snippets are ever transmitted across the network, sent to external servers, or persisted in remote databases.',
  },
  {
    question: 'How does Sentence case handle punctuation, decimal numbers, and abbreviations?',
    answer:
      'Sentence case uses intelligent sentence boundary detection. It capitalizes the initial letter of the text and the first letter following terminal punctuation marks (. ! ?). Crucially, it preserves lowercase letters after decimal points in numbers (e.g. "version 2.5 is stable" does not become "version 2.5 Is stable") and handles common abbreviations without triggering false sentence breaks.',
  },
  {
    question: 'How does Turkish and Azerbaijani locale-specific casing work?',
    answer:
      'In Turkish (tr-TR) and Azerbaijani (az), the Latin letter "i" has two distinct phonemes: dotted (İ / i) and dotless (I / ı). When the Turkish or Azerbaijani locale is selected, lowercase "i" correctly capitalizes to dotted "İ" (e.g. "istanbul" -> "İSTANBUL"), and uppercase "I" lowercases to dotless "ı" (e.g. "IĞDIR" -> "ığdır"), preventing linguistic data corruption common in ASCII-only tools.',
  },
  {
    question: 'Does the tool support Dutch IJ digraph capitalization?',
    answer:
      'Yes. In the Dutch language (nl), the letter pair "IJ" functions as a single ligature digraph. When capitalizing Dutch titles or words at sentence starts (such as "ijsberg" or "ijsselmeer"), both letters must be capitalized together ("IJsberg", "IJsselmeer"). When the Dutch locale is active, KivaroTools respects this official orthographic rule.',
  },
  {
    question: 'How are German umlauts and the sharp S (ß / eszett) handled?',
    answer:
      'German umlauts (Ä, Ö, Ü) are preserved in both upper and lower case. Under official German orthography and Unicode standards, lowercase "ß" converts to "SS" in uppercase (e.g. "straße" -> "STRASSE"). When converting back from uppercase "STRASSE", standard Unicode converts to "strasse" because "SS" is ambiguous (e.g. "Masse" vs "Maße"), which requires human context to differentiate.',
  },
  {
    question: 'What happens when converting text written in unicameral scripts like Arabic, Hebrew, or Chinese?',
    answer:
      'Unicameral scripts do not possess uppercase or lowercase letterforms. When text containing Arabic, Hebrew, Devanagari, or CJK characters is processed, the native characters remain completely intact. Case conversions apply selectively to any embedded Latin or bicameral words, while developer tokenizers (such as snake_case or kebab-case) separate native word tokens with underscores or hyphens.',
  },
  {
    question: 'Can I convert multiline lists of database columns or CSS classes without merging lines?',
    answer:
      'Yes. Enabling the "Preserve Lines" toggle instructs the converter to process each line independently. This allows you to paste hundreds of lines of SQL column names, CSS selectors, or variable lists and convert them to camelCase, snake_case, or kebab-case while preserving exact line breaks.',
  },
  {
    question: 'When should I use camelCase, PascalCase, snake_case, or kebab-case in programming?',
    answer:
      'camelCase is standard for variables and functions in JavaScript, TypeScript, Java, and Go. PascalCase is used for classes, React components, and TypeScript interfaces. snake_case is convention in Python, Ruby, and SQL relational databases. kebab-case is standard for URLs, CSS class names, and package names. CONSTANT_CASE is used for global configuration and environment variables.',
  },
  {
    question: 'Are there limits on text input size or payload length?',
    answer:
      'Because all processing executes directly in your browser without network round-trips, typical documents up to 500 KB (approximately 75,000 words) convert in under 1 second. For extreme payloads (1 MB+), modern multi-core devices process conversions smoothly without browser freeze.',
  },
  {
    question: 'Why does alternating case (aLtErNaTiNg cAsE) skip punctuation and whitespace?',
    answer:
      'Alternating case (popularized for sarcastic or mocking tone in internet culture) cycles letter casing between lowercase and uppercase across alphabetical characters. Punctuation marks, spaces, and numbers do not increment the letter-casing parity counter, ensuring that alternating cadence remains visually balanced across words.',
  },
  {
    question: 'How do the 5 text cleanup tools (Trim, Normalize Spaces, Remove Blank Lines, Trim Lines, CRLF to LF) work?',
    answer:
      'The 5 cleanup filters run in memory instantly: Trim Whitespace strips outer margins; Normalize Spaces collapses repeated spaces and tabs into single spaces; Remove Blank Lines filters out empty lines; Trim Lines removes leading and trailing spaces per row; and Normalize Line Endings unifies Windows CRLF (\\r\\n) and classic Mac (\\r) breaks into standard Unix LF (\\n).',
  },
  {
    question: 'How are reading time and speaking time calculated from the live word count?',
    answer:
      'Reading time is calculated using the international standard silent reading benchmark of 200 words per minute (WPM). Speaking time is modeled at 130 words per minute, which represents the standard delivery pace for conference keynote presentations, podcasts, and video voiceovers.',
  },
  {
    question: 'What is the difference between CONSTANT_CASE and COBOL-CASE?',
    answer:
      'CONSTANT_CASE (often called SCREAMING_SNAKE_CASE) uses uppercase letters delimited by underscores (`MAX_BUFFER_SIZE`) and is standard for environment variables, C preprocessor macros, and Python constants. COBOL-CASE (also known as UPPER-KEBAB-CASE or TRAIN-CASE) uses uppercase letters delimited by hyphens (`WS-RECORD-COUNT`) and is standard in mainframe COBOL and HTTP custom header specifications.',
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

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Convert Text Across Writing and Developer Formats Online',
    description:
      'Step-by-step guide to transforming text between Title Case, Sentence case, camelCase, snake_case, and 15 writing and programming identifier formats with locale-aware Unicode rules.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Input Source Text',
        text: 'Type, paste, or drag and drop your text or code file into the source editor. You can also click Load Sample Text to test acronyms and mixed-case tokens.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Select Category and Case Mode',
        text: 'Choose between Standard Writing Cases and Developer Formats, then click your desired transformation pill (such as Title Case, Sentence case, camelCase, or snake_case).',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Configure Line Boundaries and Language Locales',
        text: 'Toggle Preserve Lines for multiline SQL or CSS lists, and select your language locale (such as Turkish, German, Dutch, or Greek) from the 191-language ISO registry.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Apply Quick Text Cleanups',
        text: 'Optionally strip outer whitespace, collapse multiple spaces, delete blank lines, trim lines, or normalize Windows CRLF line breaks to Unix LF.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Export Converted Result',
        text: 'Copy the transformed text to your clipboard using the Async Clipboard API or click Download (.txt) to save a clean text file.',
      },
    ],
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      {/* Schema Structured Data: FAQPage and HowTo (No duplicate BreadcrumbList) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* SECTION 1: INTRODUCTION & OVERVIEW */}
      <section aria-labelledby="text-case-converter-professional-text-case-convert" className="mb-10">
        <h2 id="text-case-converter-professional-text-case-convert" className="text-2xl sm:text-3xl font-extrabold mb-4 text-slate-900 dark:text-white tracking-tight">
          Professional Text Case Converter: Standard Writing &amp; Developer Formats
        </h2>
        <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
          <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
            <strong>Privacy First &amp; Secure:</strong> All processing is done locally in your browser via client-side JavaScript. No files, text, or data are ever uploaded to our servers.
          </p>
        </blockquote>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Changing the capitalization and naming format of text is a fundamental daily requirement across modern digital disciplines. Writers and book editors routinely need to format headlines and essay titles in compliance with standard editorial styles. Software developers, database architects, and API designers continuously refactor variable names, database column schemas, and URL slugs between disparate casing paradigms like <code>camelCase</code>, <code>PascalCase</code>, <code>snake_case</code>, and <code>kebab-case</code>.
        </p>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300">
          KivaroTools <strong>Text Case Converter</strong> delivers a zero-latency, client-side text transformation studio. Featuring 15 specialized conversion modes, intelligent acronym decomposition, a multiline line-preservation engine, quick whitespace cleanup tools, and a comprehensive 191-language ISO locale registry, it handles everything from accidental Caps Lock text to complex multilingual programming payloads entirely inside your browser.
        </p>
      </section>

      {/* SECTION 2: QUICK START WORKFLOW */}
      <section aria-labelledby="text-case-converter-quick-start-guide-how-to-conve" className="mb-10">
        <h2 id="text-case-converter-quick-start-guide-how-to-conve" className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Quick Start Guide: How to Convert Text in Your Browser
        </h2>
        <ol className="list-decimal pl-6 space-y-3 text-slate-600 dark:text-slate-300">
          <li>
            <strong>Input Your Text:</strong> Type, paste, or drag your text into the left <em>Source Text</em> editor. If you wish to test common edge cases, click <strong>Load Sample Text</strong> to populate a curated snippet containing sentences, mixed-case identifiers (like <code>XMLHttpRequest</code> and <code>userID</code>), and dot-delimited tokens.
          </li>
          <li>
            <strong>Select Category &amp; Case Mode:</strong> Switch between the <em>Standard Writing Cases</em> and <em>Developer Formats</em> tabs to display relevant conversion pills. Click any mode pill—such as <strong>Title Case</strong>, <strong>Sentence case</strong>, or <strong>snake_case</strong>—to view the transformed result instantly in the right editor.
          </li>
          <li>
            <strong>Configure Line Boundaries &amp; Locale:</strong> If converting a list of database columns, toggle <strong>Preserve Lines</strong> to keep each entry on its own line. If converting text in Turkish, German, Dutch, or Greek, select the matching language from the <strong>Locale Selector</strong> or search the 191-language ISO registry modal.
          </li>
          <li>
            <strong>Apply Quick Text Cleanups:</strong> Use the <em>Text Cleanups</em> toolbar beneath the input editor to strip outer whitespace, normalize multiple spaces into single spaces, remove empty lines, trim lines, or normalize CRLF line breaks.
          </li>
          <li>
            <strong>Export Converted Result:</strong> Click <strong>Copy Result</strong> to save the converted string to your clipboard via the Async Clipboard API, or click <strong>Download (.txt)</strong> to save a clean text file to your local drive.
          </li>
        </ol>
      </section>

      {/* SECTION 3: COMPREHENSIVE CASE MODES TABLE */}
      <section aria-labelledby="text-case-converter-comprehensive-guide-to-support" className="mb-10">
        <h2 id="text-case-converter-comprehensive-guide-to-support" className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Comprehensive Guide to Supported Case Formats
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          The table below illustrates all 15 supported casing modes, categorized by primary domain, accompanied by concrete before-and-after examples and primary real-world use cases:
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-xs sm:text-sm border-collapse border border-slate-200 dark:border-slate-800">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200">
                <th className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">Mode Name</th>
                <th className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">Group</th>
                <th className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">Sample Output</th>
                <th className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">Primary Applications</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-300">
              <tr>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">Sentence case</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Standard</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">The quick brown fox. Dr. Smith agreed.</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Body prose, blog posts, essays, correcting accidental all-caps</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">Title Case</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Standard</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">The Quick Brown Fox and the Lazy Dog</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Headlines, book titles, email subjects, academic paper headers</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">Capitalized Case</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Standard</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">The Quick Brown Fox And The Lazy Dog</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Form labels, table headers, certificate names, UI buttons</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">UPPERCASE</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Standard</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">CONFIDENTIAL NOTICE: ALL RIGHTS RESERVED</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Legal disclaimers, urgent alert banners, acronyms, badge headers</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">lowercase</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Standard</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">contact@example.com / username_handle</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Email addresses, search index normalization, domain routing</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">aLtErNaTiNg cAsE</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Standard</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">tHe qUiCk bRoWn fOx jUmPs</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Social media memes, satirical commentary, gaming handles</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">InVeRsE cAsE</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Standard</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">tHE QUICK BROWN FOX (from The quick brown fox)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Fixing accidental Caps Lock typing (e.g., cAPS lOCK)</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">camelCase</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">getUserAccountById, xmlHttpRequest</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">JavaScript, TypeScript, Java, C#, Swift variables and functions</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">PascalCase</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">UserProfileCard, PaymentGatewayService</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">React/Vue components, OOP classes, TypeScript interfaces, enums</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">snake_case</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">user_billing_address, created_at</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Python variables, SQL column names, PostgreSQL tables, Ruby gems</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">kebab-case</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">btn-primary-action, text-case-converter</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">CSS class selectors, HTML attributes, REST URL paths, npm packages</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">CONSTANT_CASE</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">MAX_RETRY_ATTEMPTS, API_AUTH_SECRET</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Environment variables (.env), global constants, enum values</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">dot.case</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">config.network.retry_limit</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">JSON paths, property files, Redis keys, logging namespaces</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">path/case</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">src/components/tools/editor</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">File system paths, URL routes, cloud storage object hierarchies</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">COBOL-CASE</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">WS-CUSTOMER-BALANCE</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">COBOL data division records, HTTP header names, mainframe feeds</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 4: EDITORIAL DIFFERENCES: TITLE CASE VS CAPITALIZED VS SENTENCE */}
      <section aria-labelledby="text-case-converter-title-case-vs-capitalized-case" className="mb-10">
        <h2 id="text-case-converter-title-case-vs-capitalized-case" className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Title Case vs. Capitalized Case vs. Sentence Case: Key Differences
        </h2>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          One of the most frequent points of confusion in digital writing is distinguishing between <strong>Title Case</strong>, <strong>Capitalized Case</strong>, and <strong>Sentence case</strong>. Although automated word processors often conflate them under a generic &ldquo;Capitalize&rdquo; button, each follows distinct grammatical and typographical rules:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-purple-700 dark:text-purple-300 mb-2">
              Title Case (Editorial)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
              Capitalizes nouns, verbs, adjectives, and adverbs. Keeps minor articles (<em>a, an, the</em>), coordinating conjunctions (<em>and, but, or</em>), and short prepositions (<em>in, of, on, at, to</em>) lowercase unless they are the first or last word.
            </p>
            <div className="font-mono text-xs bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
              The Old Man and the Sea
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-purple-700 dark:text-purple-300 mb-2">
              Capitalized Case (Start Case)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
              Capitalizes the initial letter of every individual word without grammatical exception. Prepositions and articles are capitalized equally alongside nouns and verbs.
            </p>
            <div className="font-mono text-xs bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
              The Old Man And The Sea
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-purple-700 dark:text-purple-300 mb-2">
              Sentence case (Prose)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
              Capitalizes only the very first word of each sentence, following terminal punctuation marks (periods, exclamation marks, question marks). All subsequent content words remain lowercase.
            </p>
            <div className="font-mono text-xs bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
              The old man and the sea.
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300">
          <strong>Best Practice Tip:</strong> Use Title Case for book titles, blog post headlines, and major section headers. Use Capitalized Case for tabular column headers and navigation bar pills. Use Sentence case for paragraph text, tooltips, alert messages, and subheadings.
        </p>
      </section>

      {/* SECTION 5: DEVELOPER TOKENIZATION ENGINE */}
      <section aria-labelledby="text-case-converter-developer-naming-conventions-c" className="mb-10">
        <h2 id="text-case-converter-developer-naming-conventions-c" className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Developer Naming Conventions: camelCase, PascalCase, snake_case &amp; Beyond
        </h2>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Converting developer code identifiers requires far more sophistication than simple word capitalization. Naive regex cleaners frequently fail when encountering industry-standard acronyms, numeric version tags, or pre-existing mixed-case identifiers.
        </p>

        <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-200">
          How KivaroTools Tokenizes Complex Identifiers:
        </h3>
        <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-4">
          <li>
            <strong>Acronym Boundary Splitting:</strong> In identifiers like <code>XMLHttpRequest</code> or <code>parseJSONResponse</code>, the algorithm recognizes that <code>XML</code> and <code>JSON</code> are multi-character acronyms followed by title-cased words (<code>Http</code> and <code>Response</code>). It decomposes them into discrete tokens: <code>[&quot;xml&quot;, &quot;http&quot;, &quot;request&quot;]</code> and <code>[&quot;parse&quot;, &quot;json&quot;, &quot;response&quot;]</code>.
          </li>
          <li>
            <strong>Digit &amp; Version Preservation:</strong> Transitions between letters and digits are recognized cleanly. <code>OAuth2Client</code> becomes <code>oauth2_client</code> and <code>IPv6Address</code> becomes <code>ipv6_address</code>, rather than erroneously breaking into <code>i_pv_6_address</code>.
          </li>
          <li>
            <strong>Delimiter Agnosticism:</strong> Source identifiers can be separated by hyphens (<code>user-profile-id</code>), underscores (<code>user_profile_id</code>), dots (<code>user.profile.id</code>), slashes (<code>user/profile/id</code>), or spaces (<code>user profile id</code>). The engine normalizes them into identical token arrays before re-synthesizing the target format.
          </li>
          <li>
            <strong>Multiline Mode for Code Lists:</strong> When refactoring an entire database schema or a list of CSS utility classes, enabling the <em>Preserve Lines</em> toggle processes each line independently without joining rows into a single unreadable block.
          </li>
        </ul>
      </section>

      {/* SECTION 6: CLEANUP UTILITIES & LIVE TELEMETRY */}
      <section aria-labelledby="text-case-converter-cleanup-utilities-and-telemetry" className="mb-10 p-6 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 not-prose">
        <div className="flex items-center gap-2 mb-3">
          <Wrench className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 id="text-case-converter-cleanup-utilities-and-telemetry" className="text-xl font-bold text-slate-900 dark:text-white">
            5 Text Cleanup Utilities &amp; 8 Real-Time Telemetry Counters
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Beyond case conversion, KivaroTools integrates instant text sanitization and live document metrics designed for editors, programmers, and speechwriters:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">5 Instant Cleanup Filters</span>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
              <li><strong>Trim Whitespace:</strong> Strips outer leading/trailing spaces.</li>
              <li><strong>Normalize Spaces:</strong> Replaces consecutive spaces/tabs with single space.</li>
              <li><strong>Remove Blank Lines:</strong> Strips empty rows from lists and logs.</li>
              <li><strong>Trim Lines:</strong> Strips trailing and leading margin on every line.</li>
              <li><strong>Normalize Line Endings:</strong> Unifies CRLF (<code>\r\n</code>) to Unix LF (<code>\n</code>).</li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">8 Live Telemetry Metrics</span>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
              <li><strong>Character Count:</strong> Real-time count with and without spaces.</li>
              <li><strong>Unicode Words:</strong> Segmented via standard or <code>Intl.Segmenter</code>.</li>
              <li><strong>Structural Units:</strong> Dynamic line, sentence, and paragraph counts.</li>
              <li><strong>Reading Time:</strong> Modeled at silent speed of 200 words per minute.</li>
              <li><strong>Speaking Time:</strong> Modeled at podium delivery of 130 words per minute.</li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          The editor also maintains a <strong>50-snapshot in-memory undo/redo history stack</strong>, allowing you to test multiple case variations and revert instantly without losing your original text draft.
        </p>
      </section>

      {/* SECTION 7: INTERNATIONALIZATION & UNICODE RULES */}
      <section aria-labelledby="text-case-converter-internationalization-unicode-c" className="mb-10">
        <h2 id="text-case-converter-internationalization-unicode-c" className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Internationalization &amp; Unicode Casing: Turkish, German, Dutch &amp; Greek Rules
        </h2>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Text capitalization is not language-neutral. In many European and Mediterranean languages, standard ASCII uppercase and lowercase transformations produce grammatically incorrect and offensive results. KivaroTools includes dedicated linguistic handlers for key international scripts:
        </p>

        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              1. Turkish &amp; Azerbaijani Casing (Dotted vs. Dotless I)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              In Turkish (<code>tr</code>) and Azerbaijani (<code>az</code>), &ldquo;I&rdquo; with a dot is a different vowel from &ldquo;I&rdquo; without a dot. Lowercase <code>i</code> uppercases to dotted <code>İ</code> (e.g. <em>istanbul</em> &rarr; <code>İSTANBUL</code>). Uppercase dotless <code>I</code> lowercases to dotless <code>ı</code> (e.g. <em>IĞDIR</em> &rarr; <code>ığdır</code>). ASCII tools corrupt this into <em>ISTANBUL</em> and <em>igdir</em>, which alters word meaning.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              2. German Eszett (ß) Expansion to SS
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              In German (<code>de</code>), the sharp S (<code>ß</code>) expands to <code>SS</code> in uppercase per Unicode standard casing rules (e.g. <em>straße</em> &rarr; <code>STRASSE</code>). In developer CONSTANT_CASE, <code>straße_name</code> correctly produces <code>STRASSE_NAME</code>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              3. Dutch IJ Digraph Capitalization
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              In Dutch (<code>nl</code>), the letter combination <code>ij</code> represents a single sound. When capitalized in Title Case, Sentence case, or PascalCase, both letters must capitalize together (e.g. <em>ijsberg</em> &rarr; <code>IJsberg</code>, <em>ijsselmeer</em> &rarr; <code>IJsselmeer</code>).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              4. Greek Terminal Sigma (ς) vs. Medial Sigma (σ)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              In Greek (<code>el</code>), uppercase <code>Σ</code> converts to final <code>ς</code> when it terminates a word, and medial <code>σ</code> when inside a word. Furthermore, in all-caps Greek, monotonic accent marks (tonos) are omitted according to Greek typographical convention.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 8: 5-COLUMN COMPETITOR COMPARISON MATRIX */}
      <section aria-labelledby="text-case-converter-competitor-matrix" className="mb-10">
        <h2 id="text-case-converter-competitor-matrix" className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Case Converter Comparison: KivaroTools vs. Alternative Utilities
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Compare how KivaroTools stacks up against older web converters and standard code editors:
        </p>
        <div className="overflow-x-auto mb-6 not-prose">
          <table className="min-w-full text-xs text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">Feature / Capability</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 text-purple-600 dark:text-purple-400 font-bold">KivaroTools (100% Free)</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">ConvertCase.net</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">CapitalizeMyTitle</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Standard IDEs / Editors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Supported Casing Modes</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">15 Modes (7 Writing + 8 Developer)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">8 Modes (Limited Developer)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Writing Cases Only</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-amber-600">Upper, Lower &amp; Title Only</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Acronym &amp; Version Tokenizer</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Decomposes XMLHttpRequest &amp; OAuth2</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-red-500">Clumps Acronyms</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-slate-400">None</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-slate-400">Plugins Required</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Unicode &amp; Locale Rules</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">191 Languages (tr, az, de, nl, el)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-red-500">ASCII-Only English</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-amber-600">Partial Editorial</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-slate-400">OS Default Locale</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Cleanups &amp; Preserve Lines</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">5 Cleanups + Preserve Lines Toggle</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-slate-400">None</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-slate-400">None</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Separate Find/Replace</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Privacy &amp; Telemetry</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">100% Client-Side / Zero Ad Trackers</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Ad-Supported</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Ad-Supported</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Local Disk</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 9: 6-CARD ENGINEERING & EDITORIAL TROUBLESHOOTING GRID */}
      <section aria-labelledby="text-case-converter-troubleshooting-grid" className="mb-10">
        <h2 id="text-case-converter-troubleshooting-grid" className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Engineering &amp; Editorial Troubleshooting Guide
        </h2>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300 mb-4 text-sm">
          Keep these 6 technical nuances in mind when processing complex code identifiers and editorial prose:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-6">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              1. Turkish Dotless I Corruption in ASCII
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Standard JavaScript <code>.toLowerCase()</code> converts uppercase <code>I</code> into dotted <code>i</code>. In Turkish, this corrupts city names like <em>IĞDIR</em> into <em>iğdir</em> instead of <em>ığdır</em>. Select the Turkish locale pill to enforce proper dotted/dotless Unicode mappings.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              2. Single-Letter Splits on Acronyms
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Naive regex splitters turn <code>HTTPSConnection</code> into <code>h_t_t_p_s_connection</code>. KivaroTools groups uppercase letter sequences before camelCase transitions, transforming it cleanly into <code>https_connection</code>.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              3. Sentence Case Decimal &amp; Abbreviation Protection
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Converting software release notes to sentence case often erroneously capitalizes numbers after decimals (e.g., <em>v2.5.Is released</em>). Our sentence parser explicitly preserves decimals, currency values, and honorific abbreviations like <em>Dr.</em> and <em>vs.</em>
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              4. Batch Converting Multiline SQL Lists
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              When pasting lists of 50 database columns, standard tools join all words into one single unreadable line. Toggle <strong>Preserve Lines</strong> ON so every column name transforms to camelCase or snake_case on its own row.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              5. Windows CRLF vs. Unix LF Git Diffs
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Copying text across operating systems can introduce mixed <code>\r\n</code> and <code>\n</code> line breaks, triggering full-file Git diff churn. Use the <em>Normalize Line Endings</em> cleanup before committing refactored constants.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              6. Contextual Proper Noun Review
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Brand names with internal capitalization (like <em>iPhone</em>, <em>GitHub</em>, <em>PostgreSQL</em>, or <em>LaTeX</em>) follow corporate trademark rules rather than English grammar. Review these terms after automated bulk transformations.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 10: CLIENT-SIDE PRIVACY */}
      <section aria-labelledby="text-case-converter-client-side-security-amp-priva" className="mb-10">
        <h2 id="text-case-converter-client-side-security-amp-priva" className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Client-Side Security &amp; Privacy: Zero Server Transmissions
        </h2>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Online text tools represent a significant data leak vector for developers and enterprise teams. Pasting proprietary source code, confidential customer lists, private database column names, or draft manuscripts into server-backed web tools transmits sensitive payloads across third-party networks, where they may be logged in web server access logs, cached in proxies, or stored in remote databases.
        </p>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          KivaroTools operates under a strict <strong>Zero-Transmission Architecture</strong>. All casing logic, text cleanup filters, and linguistic parsing execute 100% in-browser inside client-side JavaScript memory:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
          <li><strong>No Server Uploads:</strong> Text entered into the editor is never sent to any remote API endpoint.</li>
          <li><strong>Zero Tracking or Storage:</strong> No cookies, analytics payloads, or LocalStorage traces store your transformed text.</li>
          <li><strong>Offline Usability:</strong> Once the page bundle is loaded, the converter continues functioning with full fidelity even if your internet connection is disconnected.</li>
        </ul>
      </section>

      {/* SECTION 11: FAQS (15 Items matching FAQPage JSON-LD) */}
      <section aria-labelledby="text-case-converter-frequently-asked-questions-faq" className="mb-10">
        <h2 id="text-case-converter-frequently-asked-questions-faq" className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span>Frequently Asked Questions (FAQ)</span>
        </h2>
        <div className="space-y-3">
          {TEXT_CASE_FAQS.map((faq, index) => (
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

      {/* SECTION 12: RELATED KivaroTools UTILITIES */}
      <section aria-labelledby="text-case-converter-related-kivarotools-utilities" className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <h2 id="text-case-converter-related-kivarotools-utilities" className="text-lg sm:text-xl font-bold mb-3 text-slate-900 dark:text-white">
          Related KivaroTools Utilities
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Enhance your productivity with these related free, browser-based utilities in the KivaroTools workspace:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <li className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 transition-colors">
            <Link href="/seo/text-analyzer" className="font-semibold text-purple-700 dark:text-purple-300 hover:underline block mb-1">
              Word Counter &amp; Text Analyzer
            </Link>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Analyze word count, character density, reading level, and keyword usage.
            </span>
          </li>
          <li className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 transition-colors">
            <Link href="/developer/json-formatter" className="font-semibold text-purple-700 dark:text-purple-300 hover:underline block mb-1">
              JSON Formatter &amp; Validator
            </Link>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Format, validate, repair, and minify JSON data payloads with syntax highlighting.
            </span>
          </li>
          <li className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 transition-colors">
            <Link href="/developer/base64-encoder" className="font-semibold text-purple-700 dark:text-purple-300 hover:underline block mb-1">
              Base64 Encoder &amp; Decoder
            </Link>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Encode or decode UTF-8 text, binary files, and data URLs locally in your browser.
            </span>
          </li>
          <li className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 transition-colors">
            <Link href="/developer/regex-tester" className="font-semibold text-purple-700 dark:text-purple-300 hover:underline block mb-1">
              Regex Tester &amp; Debugger
            </Link>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Live regular expression testing with real-time match highlighting and code generation.
            </span>
          </li>
          <li className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 transition-colors">
            <Link href="/developer/svg-optimizer" className="font-semibold text-purple-700 dark:text-purple-300 hover:underline block mb-1">
              SVG Optimizer &amp; Cleaner
            </Link>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Optimize, minify, and sanitize vector graphics with sandboxed preview security.
            </span>
          </li>
          <li className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 transition-colors">
            <Link href="/seo/qr-generator" className="font-semibold text-purple-700 dark:text-purple-300 hover:underline block mb-1">
              QR Code Generator
            </Link>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Generate custom vector and raster QR codes with high-resolution export formats.
            </span>
          </li>
        </ul>
      </section>
    </article>
  );
}
