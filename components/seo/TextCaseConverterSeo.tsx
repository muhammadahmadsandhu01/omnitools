import Link from 'next/link';
import {
  HelpCircle,
  AlertTriangle,
  Wrench,
  Globe,
  Code2,
  ShieldCheck,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

export const TEXT_CASE_FAQS: FaqItem[] = [
  {
    question: 'What is the difference between Sentence case, Title Case, and Capitalized Case?',
    answer:
      'Sentence case capitalizes only the first letter of each sentence (and each new line) while keeping decimal numbers like "2.5" and common abbreviations like "Dr." intact. Title Case capitalizes major words while keeping short articles, conjunctions, and prepositions (such as "a", "an", "the", "and", "of", "in") lowercase unless they appear first, last, or after a colon. Capitalized Case capitalizes the first letter of every single word without exception.',
  },
  {
    question: 'Does the Title Case converter support selectable AP, APA, Chicago, or MLA style presets?',
    answer:
      'No. KivaroTools uses one built-in editorial minor-word Title Case rule set (keeping common short articles, prepositions, and conjunctions lowercase unless they open or close the title or follow a colon). It does not include separate switchable AP, APA, Chicago, or MLA preset modes, so review style-specific edge cases (such as 4-letter prepositions or brand names) before publication.',
  },
  {
    question: 'How does the camel case converter handle acronyms like XMLHttpRequest or IPv6Address?',
    answer:
      'The developer identifier tokenizer detects uppercase acronym boundaries, camelCase transitions, and protocol version markers. For example, "XMLHttpRequest" splits into ["XML", "Http", "Request"] to output "xmlHttpRequest" in camelCase or "xml_http_request" in snake_case, and "IPv6Address" converts to "ipv6_address" in snake_case. Note that "OAuth2Client" splits into ["OAuth", "2", "Client"] ("oauth_2_client") and "HTML5Canvas" splits into ["HTML", "5", "Canvas"] ("html_5_canvas").',
  },
  {
    question: 'Can I convert camelCase to snake_case or kebab-case across multiple lines at once?',
    answer:
      'Yes. Keep the "Preserve Lines" checkbox enabled (on by default) and paste a multiline list of variable names, SQL columns, or CSS classes. Each line converts independently to camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, path/case, or COBOL-CASE without merging rows together.',
  },
  {
    question: 'Is my text uploaded to a server when I use this text case converter?',
    answer:
      'No. The converter logic runs locally in your browser using client-side JavaScript. Text you type or paste into the editor is not sent to any remote API or stored in cookies or localStorage by the tool.',
  },
  {
    question: 'How does the Turkish case converter handle dotted İ and dotless ı?',
    answer:
      'In Turkish (tr) and Azerbaijani (az), dotted "i" and dotless "ı" are distinct letters. When you select Turkish or Azerbaijani from the 191-language locale picker, lowercase "i" uppercases to dotted "İ" ("istanbul" -> "İSTANBUL") and uppercase "I" lowercases to dotless "ı" ("IĞDIR" -> "ığdır"), avoiding the corruption caused by ASCII-only converters.',
  },
  {
    question: 'How does the converter handle Dutch IJ digraphs, German ß, and Greek final sigma?',
    answer:
      'With Dutch (nl) selected, words starting with "ij" capitalize both letters together ("ijsberg" -> "IJsberg", "ijsselmeer" -> "IJsselmeer"). With German (de), lowercase "ß" expands to "SS" in uppercase ("straße" -> "STRASSE"). With Greek (el), uppercase "Σ" lowercases to final "ς" at the end of a word ("ΚΌΣΜΟΣ" -> "κόσμος") and strips monotonic accent marks in uppercase ("κόσμος" -> "ΚΟΣΜΟΣ").',
  },
  {
    question: 'What happens when converting Arabic, Hebrew, Chinese, or other unicameral scripts?',
    answer:
      'Unicameral scripts do not have uppercase or lowercase letterforms. Native characters in Arabic, Hebrew, Devanagari, or CJK text remain unchanged during standard case conversions, while any embedded Latin words are converted normally. Developer modes such as snake_case and kebab-case join native word tokens with underscores or hyphens.',
  },
  {
    question: 'What is the difference between CONSTANT_CASE and COBOL-CASE?',
    answer:
      'CONSTANT_CASE (also called SCREAMING_SNAKE_CASE) joins uppercase words with underscores (for example, "MAX_RETRY_ATTEMPTS") and is widely used for environment variables and code constants. COBOL-CASE joins uppercase words with hyphens (for example, "CUSTOMER-BALANCE") and is used in COBOL data definitions and hyphenated uppercase identifiers.',
  },
  {
    question: 'What do the 5 text cleanup utilities do?',
    answer:
      'The 5 one-click cleanup buttons clean your source text in place before or after conversion: Trim Outer removes leading and trailing spaces, Single Spaces collapses repeated spaces and tabs into one space, Remove Blank Lines deletes empty rows, Trim Lines strips leading and trailing spaces on each line, and CRLF → LF converts Windows (\\r\\n) and classic Mac (\\r) line endings to Unix LF (\\n).',
  },
  {
    question: 'Why does alternating case (aLtErNaTiNg cAsE) skip spaces and punctuation?',
    answer:
      'Alternating case toggles between lowercase and uppercase only on alphabetic letters. Spaces, digits, and punctuation marks do not advance the alternation counter, keeping the visual pattern consistent across words.',
  },
  {
    question: 'Where can I check reading time, speaking time, or readability scores for my text?',
    answer:
      'This text case converter tracks 6 live counts (Characters, Characters Without Spaces, Words, Lines, Sentences, and Paragraphs). If you also need reading time, speaking pace, readability grade formulas, or keyword density, open the KivaroTools Word Counter & Text Analyzer.',
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
    name: 'How to Convert Text Across 15 Writing and Developer Case Formats',
    description:
      'Step-by-step instructions for converting text between Sentence case, Title Case, UPPERCASE, lowercase, camelCase, snake_case, kebab-case, and other formats with 191 Unicode locales.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Enter or Paste Your Source Text',
        text: 'Type or paste prose, headlines, or code identifiers into the Source Text editor, or click Load Sample to test mixed-case identifiers.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Choose a Writing or Developer Case Mode',
        text: 'Switch between Writing (7) and Developer (8) tabs and select a format such as Sentence case, Title Case, camelCase, snake_case, or kebab-case.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Set Preserve Lines and Language Locale',
        text: 'Keep Preserve Lines checked for multiline lists, and open the Locale options bar to choose from 191 ISO 639 languages when converting Turkish, Dutch, German, Greek, or other localized text.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Run Optional Text Cleanups',
        text: 'Use the 5 cleanup buttons (Trim Outer, Single Spaces, Remove Blank Lines, Trim Lines, and CRLF → LF) to clean whitespace and line endings.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Copy, Swap, or Download the Result',
        text: 'Click Copy Result to copy the converted text to your clipboard, Swap to chain another transformation, or Download (.txt) to save the output locally.',
      },
    ],
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      {/* Structured Data: FAQPage and HowTo (BreadcrumbList and SoftwareApplication are rendered by the page template) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* SECTION 1: OVERVIEW & PRIVACY */}
      <section aria-labelledby="tcc-overview" className="mb-10">
        <h2
          id="tcc-overview"
          className="text-2xl sm:text-3xl font-extrabold mb-4 text-slate-900 dark:text-white tracking-tight"
        >
          Online Text Case Converter for Writing, Editing &amp; Code Naming
        </h2>
        <div className="not-prose p-4 my-4 bg-purple-50/70 border-l-4 border-purple-600 rounded-r-xl dark:bg-purple-950/30 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
            <strong>Local Browser Execution:</strong> Your text is converted in client-side JavaScript memory inside your browser. The converter does not send your text to a remote API or store it in cookies or localStorage.
          </p>
        </div>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Retyping a paragraph typed with Caps Lock on—or manually renaming thirty SQL columns into TypeScript properties—is tedious and error-prone. This free <strong>text case converter</strong> brings 7 everyday writing formats and 8 developer naming conventions into one side-by-side workspace so you can see the result update live without overwriting your original draft.
        </p>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300">
          Use it as a <strong>sentence case converter</strong> for body prose, a <strong>title case converter</strong> for headings, an <strong>uppercase to lowercase</strong> cleaner, or a <strong>programming case converter</strong> for <code>camelCase</code>, <code>PascalCase</code>, <code>snake_case</code>, <code>kebab-case</code>, <code>CONSTANT_CASE</code>, <code>dot.case</code>, <code>path/case</code>, and <code>COBOL-CASE</code>—backed by 191 ISO 639 language locales, <strong>Preserve Lines</strong> batch mode, and instant <code>.txt</code> export.
        </p>
      </section>

      {/* SECTION 2: VISIBLE 5-STEP QUICK START GUIDE (Matches HowTo JSON-LD 1:1) */}
      <section
        aria-labelledby="tcc-quick-start"
        className="mb-10 p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 not-prose"
      >
        <h2
          id="tcc-quick-start"
          className="text-xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
          <span>How to Convert Text Case in 5 Simple Steps</span>
        </h2>
        <div role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
          <div role="listitem" className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">Step 1: Enter or Paste Source Text</span>
            <span className="text-slate-600 dark:text-slate-300">Drop prose, headings, or code identifiers into Source Text, or click Load Sample to test mixed-case tokens immediately.</span>
          </div>
          <div role="listitem" className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">Step 2: Pick a Writing or Developer Format</span>
            <span className="text-slate-600 dark:text-slate-300">Switch between the Writing (7) and Developer (8) tabs and click any mode pill—the Converted Result updates in real time.</span>
          </div>
          <div role="listitem" className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">Step 3: Configure Preserve Lines &amp; Locale</span>
            <span className="text-slate-600 dark:text-slate-300">Keep Preserve Lines checked for multi-row lists, and open the Locale bar for Turkish, Dutch, German, Greek, or 191 ISO languages.</span>
          </div>
          <div role="listitem" className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">Step 4: Run Optional Whitespace Cleanups</span>
            <span className="text-slate-600 dark:text-slate-300">Use the 5 cleanup buttons under Source Text to trim margins, collapse extra spaces, remove blank lines, or convert CRLF to LF.</span>
          </div>
          <div role="listitem" className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 sm:col-span-2">
            <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">Step 5: Copy, Swap, or Download (.txt)</span>
            <span className="text-slate-600 dark:text-slate-300">Click Copy Result to copy to your clipboard, Swap to feed the output back for another pass, or Download (.txt) to save locally.</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: ALL 15 FORMATS REFERENCE TABLE */}
      <section aria-labelledby="tcc-all-formats" className="mb-10">
        <h2
          id="tcc-all-formats"
          className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white"
        >
          All 15 Writing &amp; Developer Case Formats (Verified Examples)
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Every output below is verified directly against the KivaroTools engine:
        </p>

        <div className="w-full overflow-x-auto overscroll-x-contain mb-6 not-prose">
          <table className="min-w-[680px] w-full text-left text-xs sm:text-sm border-collapse border border-slate-200 dark:border-slate-800">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200">
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">Case Format</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">Group</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">Input → Verified Output</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">Common Use Cases</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-300">
              <tr>
                <th scope="row" className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-semibold text-slate-900 dark:text-white">Sentence case</th>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Writing</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs">version 2.5 is released. → Version 2.5 is released.</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Body copy, emails, fixing accidental ALL CAPS</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-semibold text-slate-900 dark:text-white">Title Case</th>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Writing</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs">the lord of the rings → The Lord of the Rings</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Article headlines, book titles, section headers</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-semibold text-slate-900 dark:text-white">Capitalized Case</th>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Writing</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs">war and peace → War And Peace</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">UI labels, table headers, form field names</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-semibold text-slate-900 dark:text-white">UPPERCASE</th>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Writing</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs">hello world → HELLO WORLD</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">All caps converter for badges, notices, acronyms</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-semibold text-slate-900 dark:text-white">lowercase</th>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Writing</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs">HELLO WORLD → hello world</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Lowercase converter for emails, tags, normalization</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-semibold text-slate-900 dark:text-white">aLtErNaTiNg cAsE</th>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Writing</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs">hello world → hElLo WoRlD</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Alternating case converter for social posts &amp; memes</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-semibold text-slate-900 dark:text-white">InVeRsE CaSe</th>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Writing</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs">cAPS lOCK → Caps Lock</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Inverse case converter to flip Caps Lock typos</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-semibold text-slate-900 dark:text-white">camelCase</th>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs">user_first_name → userFirstName</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Camel case converter for JS, TS, Java, Go variables</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-semibold text-slate-900 dark:text-white">PascalCase</th>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs">xml_http_request → XmlHttpRequest</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Pascal case converter for React components &amp; classes</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-semibold text-slate-900 dark:text-white">snake_case</th>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs">XMLHttpRequest → xml_http_request</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Snake case converter for Python, Ruby, SQL columns</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-semibold text-slate-900 dark:text-white">kebab-case</th>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs">user_profile_card → user-profile-card</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Kebab case converter for CSS classes &amp; URL paths</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-semibold text-slate-900 dark:text-white">CONSTANT_CASE</th>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs">maxRetryAttempts → MAX_RETRY_ATTEMPTS</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Constant case converter for .env keys &amp; constants</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-semibold text-slate-900 dark:text-white">dot.case</th>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs">config_network_timeout → config.network.timeout</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Dot case converter for property keys &amp; JSON paths</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-semibold text-slate-900 dark:text-white">path/case</th>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs">components_tools_case → components/tools/case</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Path case converter for routes &amp; directory trees</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-semibold text-slate-900 dark:text-white">COBOL-CASE</th>
                <td className="p-3 border border-slate-200 dark:border-slate-800">Developer</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs">customer_balance → CUSTOMER-BALANCE</td>
                <td className="p-3 border border-slate-200 dark:border-slate-800">COBOL case converter for mainframe &amp; header keys</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 4: EDITORIAL COMPARISON — TITLE VS CAPITALIZED VS SENTENCE */}
      <section aria-labelledby="tcc-editorial-differences" className="mb-10">
        <h2
          id="tcc-editorial-differences"
          className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white"
        >
          Title Case vs. Capitalized Case vs. Sentence Case: Which One Fits Your Copy?
        </h2>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Writers often treat &ldquo;Title Case&rdquo; and &ldquo;Capitalize Each Word&rdquo; as interchangeable, yet they produce noticeably different headings. Compare the same phrase across all three writing modes:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 not-prose">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-purple-700 dark:text-purple-300 mb-1.5">
                Title Case (Editorial)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                Keeps short articles (<em>a, an, the</em>), conjunctions (<em>and, but, or</em>), and short prepositions (<em>of, in, to, for</em>) lowercase unless they open, close, or follow a colon.
              </p>
            </div>
            <div className="font-mono text-xs bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              A Guide to Writing for the Web
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-purple-700 dark:text-purple-300 mb-1.5">
                Capitalized Case (Start Case)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                Capitalizes the first letter of every single word with zero grammatical exceptions—ideal for compact UI buttons, form labels, and table column headers.
              </p>
            </div>
            <div className="font-mono text-xs bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              A Guide To Writing For The Web
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-purple-700 dark:text-purple-300 mb-1.5">
                Sentence case (Prose)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                Capitalizes only the opening word of each sentence and line, making long subheadings, product descriptions, and help-center articles easier to scan.
              </p>
            </div>
            <div className="font-mono text-xs bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              A guide to writing for the web
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <strong>Editorial note:</strong> KivaroTools applies one built-in minor-word Title Case rule set (including hyphenated words like <code>step-by-step</code> → <code>Step-by-Step</code> and words after a colon like <code>hello: a new dawn</code> → <code>Hello: A New Dawn</code>) rather than selectable AP, APA, Chicago, or MLA presets.
        </p>
      </section>

      {/* SECTION 5: REAL-WORLD WORKED SCENARIOS (BEFORE -> AFTER) */}
      <section aria-labelledby="tcc-worked-scenarios" className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
          <h2 id="tcc-worked-scenarios" className="text-xl sm:text-2xl font-bold m-0 text-slate-900 dark:text-white">
            4 Real-World Before &amp; After Workflows
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Practical ways writers, analysts, and engineers combine case modes, Preserve Lines, and cleanups in a few seconds:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
              <span>1. SQL Columns → TypeScript camelCase</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mode: <strong>camelCase</strong> + <strong>Preserve Lines ON</strong>
            </p>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <pre className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 overflow-x-auto m-0">{`user_id\nbilling_address\ncreated_at`}</pre>
              <pre className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 text-purple-900 dark:text-purple-200 overflow-x-auto m-0">{`userId\nbillingAddress\ncreatedAt`}</pre>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
              <span>2. Marketing Label → Clean CSS / URL Slug</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mode: <strong>kebab-case</strong> (strips stray symbols like <code>&amp;</code>)
            </p>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <pre className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 overflow-x-auto m-0">{`e-commerce & payments`}</pre>
              <pre className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 text-purple-900 dark:text-purple-200 overflow-x-auto m-0">{`e-commerce-payments`}</pre>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
              <span>3. Accidental Caps Lock Paragraph Fix</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mode: <strong>Sentence case</strong> (keeps decimals intact)
            </p>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <pre className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 overflow-x-auto m-0">{`RELEASE 2.5 IS LIVE.\nCHECK THE LOGS!`}</pre>
              <pre className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 text-purple-900 dark:text-purple-200 overflow-x-auto m-0">{`Release 2.5 is live.\nCheck the logs!`}</pre>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
              <span>4. Messy Spreadsheet Export → snake_case</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cleanups: <strong>Trim Lines + Remove Blank Lines</strong> → <strong>snake_case</strong>
            </p>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <pre className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 overflow-x-auto m-0">{`  Order ID  \n\n  Total Amount  `}</pre>
              <pre className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 text-purple-900 dark:text-purple-200 overflow-x-auto m-0">{`order_id\ntotal_amount`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: DEVELOPER TOKENIZATION ARCHITECTURE */}
      <section aria-labelledby="tcc-developer-workflows" className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Code2 className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
          <h2 id="tcc-developer-workflows" className="text-xl sm:text-2xl font-bold m-0 text-slate-900 dark:text-white">
            How the Acronym-Aware Developer Tokenizer Works
          </h2>
        </div>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Converting identifiers between <strong>camelCase to snake_case</strong>, <code>PascalCase</code>, or <code>kebab-case</code> breaks in naive tools as soon as acronyms or mixed delimiters appear. Instead of simple find-and-replace, KivaroTools breaks each line into normalized tokens before re-assembling the target convention:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li>
            <strong>Acronym Boundary Detection:</strong> Consecutive uppercase letters followed by a title-cased word split cleanly at the acronym boundary—<code>parseJSONResponse</code> becomes <code>[&quot;parse&quot;, &quot;JSON&quot;, &quot;Response&quot;]</code> → <code>parse_json_response</code> or <code>parse-json-response</code>, never <code>parse_j_s_o_n_response</code>.
          </li>
          <li>
            <strong>Delimiter &amp; Symbol Normalization:</strong> Hyphens, underscores, dots, slashes, colons, spaces, and ASCII punctuation (<code>&amp;</code>, <code>@</code>, <code>!</code>, parentheses) act as clean word separators, so <code>user (primary) @ email!</code> converts cleanly to <code>user_primary_email</code>.
          </li>
          <li>
            <strong>Protocol &amp; Digit Rules:</strong> Known protocol tokens such as <code>IPv6Address</code> stay grouped (<code>ipv6_address</code>), while digit boundaries in identifiers like <code>OAuth2Client</code> and <code>HTML5Canvas</code> split digits as distinct tokens (<code>oauth_2_client</code>, <code>html_5_canvas</code>).
          </li>
          <li>
            <strong>Chained Conversions with Swap:</strong> Click <strong>Swap</strong> above the output pane to move any converted result back into Source Text—handy when chaining cleanups and multiple format passes.
          </li>
        </ul>
      </section>

      {/* SECTION 7: UNICODE & 191-LANGUAGE LOCALE ENGINE */}
      <section aria-labelledby="tcc-unicode-locales" className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
          <h2 id="tcc-unicode-locales" className="text-xl sm:text-2xl font-bold m-0 text-slate-900 dark:text-white">
            Unicode Case Converter: 191 ISO Locales (Turkish, Dutch, German &amp; Greek)
          </h2>
        </div>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          ASCII-only case converters corrupt non-English text because capitalization depends on language orthography. Open the <strong>Locale</strong> bar above to search all 191 ISO 639 languages (184 ISO 639-1 + 7 ISO 639-3):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 not-prose">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              Turkish &amp; Azerbaijani (tr, az)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Preserves dotted vs. dotless I: <code>istanbul</code> → <code>İSTANBUL</code> and <code>IĞDIR</code> → <code>ığdır</code>, including inside <code>CONSTANT_CASE</code> (<code>istanbul_park</code> → <code>İSTANBUL_PARK</code>).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              Dutch IJ Digraph (nl)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Capitalizes both letters of the Dutch <code>ij</code> digraph at word starts in Title Case, Sentence case, and PascalCase: <code>ijsberg</code> → <code>IJsberg</code> and <code>ijsselmeer</code> → <code>IJsselmeer</code>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              German Eszett ß (de)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Expands sharp S to <code>SS</code> in uppercase (<code>straße</code> → <code>STRASSE</code>, <code>straße_name</code> → <code>STRASSE_NAME</code>) while keeping lowercase <code>ß</code> intact.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              Greek Final Sigma &amp; Unicameral Scripts (el, ar, he, zh)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Converts terminal Greek sigma accurately (<code>ΚΌΣΜΟΣ</code> → <code>κόσμος</code>) and strips monotonic accents in uppercase (<code>κόσμος</code> → <code>ΚΟΣΜΟΣ</code>). Unicameral scripts (Arabic, Hebrew, Chinese) stay intact with an advisory banner.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 8: 5 CLEANUPS & 6 LIVE COUNTERS */}
      <section
        aria-labelledby="tcc-cleanups-stats"
        className="mb-10 p-6 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 not-prose"
      >
        <div className="flex items-center gap-2 mb-3">
          <Wrench className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
          <h2 id="tcc-cleanups-stats" className="text-xl font-bold text-slate-900 dark:text-white">
            5 Whitespace Cleanups &amp; 6 Live Text Counters
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Sanitize copied text directly inside Source Text before exporting your converted output:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40">
            <span className="font-bold text-slate-900 dark:text-white block mb-1.5">5 Text Cleanup Actions</span>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
              <li><strong>Trim Outer:</strong> Removes leading and trailing whitespace around the entire input.</li>
              <li><strong>Single Spaces:</strong> Collapses consecutive spaces and tabs into one space.</li>
              <li><strong>Remove Blank Lines:</strong> Strips empty or whitespace-only rows.</li>
              <li><strong>Trim Lines:</strong> Strips leading and trailing spaces from every line.</li>
              <li><strong>CRLF → LF:</strong> Normalizes Windows (<code>\r\n</code>) and classic Mac (<code>\r</code>) line endings to Unix LF (<code>\n</code>).</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40">
            <span className="font-bold text-slate-900 dark:text-white block mb-1.5">6 Live Text Statistics</span>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
              <li><strong>Characters &amp; No Spaces:</strong> Grapheme cluster counts via <code>Intl.Segmenter</code> (emoji-safe).</li>
              <li><strong>Words:</strong> Locale-aware Unicode word segmentation.</li>
              <li><strong>Lines, Sentences &amp; Paragraphs:</strong> Real-time structural counts.</li>
            </ul>
            <p className="mt-2.5 text-slate-500 dark:text-slate-400">
              Need reading time, speaking time, or Flesch readability scores? Use our{' '}
              <Link href="/seo/text-analyzer" className="font-semibold text-purple-700 dark:text-purple-300 underline">
                Word Counter &amp; Text Analyzer
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 9: VERIFIED TOP COMPETITORS COMPARISON TABLE */}
      <section aria-labelledby="tcc-competitor-comparison" className="mb-10">
        <h2
          id="tcc-competitor-comparison"
          className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white"
        >
          KivaroTools vs. Top Online Case Converters
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          How KivaroTools compares against leading online case converters across writing cases, developer naming formats, Unicode locales, and batch workflows:
        </p>

        <div className="w-full overflow-x-auto overscroll-x-contain mb-2 not-prose">
          <table className="min-w-[740px] w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-800">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200">
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Feature</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 text-purple-700 dark:text-purple-300 font-bold">KivaroTools</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">ConvertCase.net</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">App DevTools</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">OpenReplay</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">CaseConverter.cc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">Writing + Developer Cases</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">15 modes (7 writing + 8 dev) in one view</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Writing cases on homepage (dev cases omitted)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">14–15 dev cases (no Title, Alternating, or COBOL-CASE)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">11 simultaneous formats (no Alternating, Inverse, or COBOL)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">5 basic editorial buttons on homepage (splits others to subpages)</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">191-Language Unicode Locales</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">Yes (tr, az, nl, de, el &amp; 186 more)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">No</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">No</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">No</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">No</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">Multiline Preserve Lines</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">Yes (toggleable, ON by default)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">No</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">No</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Yes (line-by-line batch)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">No</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">Whitespace &amp; CRLF Cleanups</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">5 one-click cleanups (incl. CRLF → LF)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">No cleanup toolbar</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">No cleanup buttons</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">No cleanup buttons</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">No cleanup buttons</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">Live Counters &amp; .txt Export</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">6 live counters + Swap + .txt download</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Single-pane overwrite editor + .txt download</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">No counters, Swap, or .txt export</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">No counters or .txt export</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">4 live counts; no side-by-side preview or .txt export</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">Notable Competitor Strength</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">Single built-in editorial Title Case rule set</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">AP/APA/Chicago/MLA subpage &amp; custom dictionary</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Train-Case &amp; Pascal_Snake_Case modes</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Simultaneous multi-format preview cards</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Open-source MIT positioning</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 10: 6-CARD TROUBLESHOOTING & EDGE-CASE GUIDE */}
      <section aria-labelledby="tcc-troubleshooting" className="mb-10">
        <h2
          id="tcc-troubleshooting"
          className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white"
        >
          6 Practical Edge Cases &amp; Troubleshooting Tips
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Keep these real-world quirks in mind before pasting converted output into production code or published copy:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 not-prose">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
              <span>1. Decimals, URLs &amp; Abbreviations in Sentence Case</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Sentence case guards decimal numbers (<code>2.5</code>), domains (<code>example.com</code>), and common abbreviations (<code>Dr.</code>, <code>vs.</code>, <code>e.g.</code>) so periods inside them do not trigger false capitalization.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
              <span>2. Brand Trademarks &amp; Proper Nouns</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Automated Sentence case and Title Case follow grammar rules rather than trademark styling. Quickly scan converted copy for names like <em>iPhone</em>, <em>iOS</em>, <em>GitHub</em>, or <em>PostgreSQL</em>.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
              <span>3. Wrong Locale on Turkish or Dutch Text</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              If <code>istanbul</code> uppercases to <code>ISTANBUL</code> instead of <code>İSTANBUL</code>—or <code>ijsberg</code> becomes <code>Ijsberg</code>—open the <strong>Locale</strong> bar and switch from <code>en-US</code> to <code>tr</code> or <code>nl</code>.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
              <span>4. Lines Merging Into One Long Variable</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              If pasting a list of column names joins them into a single identifier, re-enable the <strong>Preserve Lines</strong> checkbox so every row transforms independently.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
              <span>5. Noisy Git Diffs From Mixed Line Endings</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Copying constants between Windows and macOS/Linux can mix <code>\r\n</code> and <code>\n</code> breaks. Click <strong>CRLF → LF</strong> in the cleanup bar before committing refactored code.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
              <span>6. Plain-Text Scope (No File Uploads)</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This converter works on pasted plain text rather than uploading <code>.docx</code>, <code>.pdf</code>, or <code>.csv</code> documents. Copy the text you need, transform it here, and download a clean <code>.txt</code> copy.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 11: FAQS (12 Items matching FAQPage JSON-LD 1:1) */}
      <section aria-labelledby="tcc-faq" className="mb-10">
        <h2
          id="tcc-faq"
          className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2"
        >
          <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
          <span>Frequently Asked Questions</span>
        </h2>
        <div className="space-y-3 not-prose">
          {TEXT_CASE_FAQS.map((faq, index) => (
            <details
              key={index}
              className="group rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
            >
              <summary className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base cursor-pointer select-none list-none flex items-center justify-between gap-2">
                <span>{faq.question}</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform shrink-0" aria-hidden="true">
                  &#9662;
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* SECTION 12: RELATED KIVAROTOOLS UTILITIES (Verified Existing Routes Only) */}
      <section aria-labelledby="tcc-related" className="pt-6 border-t border-slate-200 dark:border-slate-800 not-prose">
        <h2 id="tcc-related" className="text-lg sm:text-xl font-bold mb-3 text-slate-900 dark:text-white">
          Related KivaroTools Utilities
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Continue your writing, SEO, or coding workflow with these related browser-based tools:
        </p>
        <div role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div role="listitem" className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 transition-colors">
            <Link href="/seo/text-analyzer" className="font-semibold text-purple-700 dark:text-purple-300 hover:underline block mb-1">
              Word Counter &amp; Text Analyzer
            </Link>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Check reading time, speaking pace, readability scores, grammar, and keyword density.
            </span>
          </div>
          <div role="listitem" className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 transition-colors">
            <Link href="/seo/meta-generator" className="font-semibold text-purple-700 dark:text-purple-300 hover:underline block mb-1">
              Meta Tags &amp; Open Graph Generator
            </Link>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Preview SERP titles, meta descriptions, and social sharing cards with length checks.
            </span>
          </div>
          <div role="listitem" className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 transition-colors">
            <Link href="/developer/json-formatter" className="font-semibold text-purple-700 dark:text-purple-300 hover:underline block mb-1">
              JSON Formatter &amp; Validator
            </Link>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Format, validate, repair, and minify JSON payloads after refactoring key names.
            </span>
          </div>
          <div role="listitem" className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 transition-colors">
            <Link href="/developer/regex-tester" className="font-semibold text-purple-700 dark:text-purple-300 hover:underline block mb-1">
              Regex Tester &amp; Debugger
            </Link>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Test regular expressions with live match highlighting and pattern debugging.
            </span>
          </div>
          <div role="listitem" className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 transition-colors">
            <Link href="/developer/base64-encoder" className="font-semibold text-purple-700 dark:text-purple-300 hover:underline block mb-1">
              Base64 Encoder &amp; Decoder
            </Link>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Encode or decode UTF-8 text, Base64URL tokens, and binary files locally.
            </span>
          </div>
          <div role="listitem" className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 transition-colors">
            <Link href="/seo/qr-generator" className="font-semibold text-purple-700 dark:text-purple-300 hover:underline block mb-1">
              QR Code Generator
            </Link>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Generate vector and raster QR codes for URLs, Wi-Fi, and plain text.
            </span>
          </div>
        </div>
      </section>
    </article>
  );
}