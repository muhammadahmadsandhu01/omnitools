import Link from 'next/link';
import { SITE_URL } from '@/config/site';

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
];

export default function TextCaseConverterSeo() {
  const canonicalUrl = `${SITE_URL}/seo/text-case-converter`;

  // SoftwareApplication Schema
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'KivaroTools Text Case Converter',
    operatingSystem: 'Any (Web Browser)',
    applicationCategory: 'UtilityApplication',
    url: canonicalUrl,
    description:
      'Free client-side text case converter. Transform text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, and 15 writing and programming identifier formats with zero server uploads.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      '100% Client-side browser execution with zero server network calls',
      '7 Standard writing cases: UPPERCASE, lowercase, Sentence case, Title Case, Capitalized Case, aLtErNaTiNg cAsE, InVeRsE cAsE',
      '8 Developer identifier conventions: camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, path/case, COBOL-CASE',
      'Advanced developer tokenizer recognizing acronyms (e.g. XMLHttpRequest -> xmlHttpRequest)',
      '191 ISO 639-1 & ISO 639-3 languages supported in searchable locale registry',
      'Specialized orthography rules: Turkish dotted/dotless I, German ß -> SS, Dutch IJ digraph, Greek sigma final ς handling',
      'Unicameral script advisory for Arabic, Hebrew, Devanagari, and CJK characters',
      'Multiline preservation toggle for lists of database columns and code variables',
      'Quick cleanup actions: Trim Outer Whitespace, Normalize Single Spaces, Remove Blank Lines, Trim Lines',
      'Live text statistics: Characters, Characters Without Spaces, Words, Lines, Sentences, Paragraphs',
      'One-click Async Clipboard copy with selection fallback and plaintext (.txt) file download',
    ],
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'SEO & Text Tools',
        item: `${SITE_URL}/seo`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Text Case Converter',
        item: canonicalUrl,
      },
    ],
  };

  // FAQPage Schema
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
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      {/* Schema Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* SECTION 1: INTRODUCTION & OVERVIEW */}
      <section className="mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 text-slate-900 dark:text-white tracking-tight">
          Professional Text Case Converter: Standard Writing & Developer Formats
        </h2>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Changing the capitalization and naming format of text is a fundamental daily requirement across modern digital disciplines. Writers and book editors routinely need to format headlines and essay titles in compliance with standard editorial styles. Software developers, database architects, and API designers continuously refactor variable names, database column schemas, and URL slugs between disparate casing paradigms like <code>camelCase</code>, <code>PascalCase</code>, <code>snake_case</code>, and <code>kebab-case</code>.
        </p>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300">
          KivaroTools <strong>Text Case Converter</strong> delivers a zero-latency, client-side text transformation studio. Featuring 15 specialized conversion modes, intelligent acronym decomposition, a multiline line-preservation engine, quick whitespace cleanup tools, and a comprehensive 191-language ISO locale registry, it handles everything from accidental Caps Lock text to complex multilingual programming payloads entirely inside your browser.
        </p>
      </section>

      {/* SECTION 2: QUICK START WORKFLOW */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Quick Start Guide: How to Convert Text in Your Browser
        </h2>
        <ol className="list-decimal pl-6 space-y-3 text-slate-600 dark:text-slate-300">
          <li>
            <strong>Input Your Text:</strong> Type, paste, or drag your text into the left <em>Source Text</em> editor. If you wish to test common edge cases, click <strong>Load Sample Text</strong> to populate a curated snippet containing sentences, mixed-case identifiers (like <code>XMLHttpRequest</code> and <code>userID</code>), and dot-delimited tokens.
          </li>
          <li>
            <strong>Select Category & Case Mode:</strong> Switch between the <em>Standard Writing Cases</em> and <em>Developer Formats</em> tabs to display relevant conversion pills. Click any mode pill—such as <strong>Title Case</strong>, <strong>Sentence case</strong>, or <strong>snake_case</strong>—to view the transformed result instantly in the right editor.
          </li>
          <li>
            <strong>Configure Line Boundaries & Locale:</strong> If converting a list of database columns, toggle <strong>Preserve Lines</strong> to keep each entry on its own line. If converting text in Turkish, German, Dutch, or Greek, select the matching language from the <strong>Locale Selector</strong> or search the 191-language ISO registry modal.
          </li>
          <li>
            <strong>Apply Quick Text Cleanups:</strong> Use the <em>Text Cleanups</em> toolbar beneath the input editor to strip outer whitespace, normalize multiple spaces into single spaces, or remove empty lines.
          </li>
          <li>
            <strong>Export Converted Result:</strong> Click <strong>Copy Result</strong> to save the converted string to your clipboard via the Async Clipboard API, or click <strong>Download (.txt)</strong> to save a clean text file to your local drive.
          </li>
        </ol>
      </section>

      {/* SECTION 3: COMPREHENSIVE CASE MODES TABLE */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white">
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
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white">
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
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Developer Naming Conventions: camelCase, PascalCase, snake_case & Beyond
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
            <strong>Digit &amp; Version Preservation:</strong> Transitions between letters and digits are recognized cleanly. <code>IPv6Address</code> becomes <code>ipv6Address</code> or <code>ipv6_address</code>, rather than erroneously breaking into <code>i_pv_6_address</code>.
          </li>
          <li>
            <strong>Delimiter Agnosticism:</strong> Source identifiers can be separated by hyphens (<code>user-profile-id</code>), underscores (<code>user_profile_id</code>), dots (<code>user.profile.id</code>), slashes (<code>user/profile/id</code>), or spaces (<code>user profile id</code>). The engine normalizes them into identical token arrays before re-synthesizing the target format.
          </li>
          <li>
            <strong>Multiline Mode for Code Lists:</strong> When refactoring an entire database schema or a list of CSS utility classes, enabling the <em>Preserve Lines</em> toggle processes each line independently without joining rows into a single unreadable block.
          </li>
        </ul>
      </section>

      {/* SECTION 6: INTERNATIONALIZATION & UNICODE RULES */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Internationalization & Unicode Casing: Turkish, German, Dutch & Greek Rules
        </h2>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Text capitalization is not language-neutral. In many European and Mediterranean languages, standard ASCII uppercase and lowercase transformations produce grammatically incorrect and offensive results. KivaroTools includes dedicated linguistic handlers for key international scripts:
        </p>

        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              1. Turkish & Azerbaijani Casing (Dotted vs. Dotless I)
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

      {/* SECTION 7: CLIENT-SIDE PRIVACY */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white">
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

      {/* SECTION 8: LIMITATIONS & HUMAN REVIEW */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Limitations & Human Review Guidelines
        </h2>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          While automated case conversion drastically accelerates formatting workflows, certain natural language ambiguities cannot be determined programmatically with 100% accuracy without contextual human review:
        </p>
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <strong className="text-slate-900 dark:text-white">Proper Nouns &amp; Brand Names:</strong> Sentence case and lowercase conversion cannot automatically distinguish general vocabulary from proper nouns (such as <em>Apple</em>, <em>Mercedes</em>, or <em>Paris</em>). If converting an entire document to Sentence case, verify that brand names and personal names are reviewed and capitalized.
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <strong className="text-slate-900 dark:text-white">Contextual Preposition Capitalization:</strong> In Title Case, words like &ldquo;in&rdquo; or &ldquo;out&rdquo; remain lowercase when acting as simple prepositions (e.g. <em>Lost in the Woods</em>), but should be capitalized when acting as adverbs in phrasal verbs (e.g. <em>Log In to Your Account</em> or <em>Check In at Noon</em>). Review phrasal verbs in headlines.
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <strong className="text-slate-900 dark:text-white">Hyphenated Compound Words:</strong> Different editorial style guides (Chicago Manual of Style vs. AP Stylebook) specify conflicting rules for capitalizing the second element of hyphenated compounds (e.g. <em>Self-Driving Cars</em> vs. <em>Self-driving Cars</em>). Verify your publisher&apos;s specific style guide requirements.
          </div>
        </div>
      </section>

      {/* SECTION 9: FAQS */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Frequently Asked Questions (FAQ)
        </h2>
        <div className="space-y-4">
          {TEXT_CASE_FAQS.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-800/30"
            >
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base mb-2">
                {faq.question}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 10: RELATED KivaroTools UTILITIES */}
      <section className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-lg sm:text-xl font-bold mb-3 text-slate-900 dark:text-white">
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
