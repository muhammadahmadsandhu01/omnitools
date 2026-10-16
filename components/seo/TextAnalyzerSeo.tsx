import Link from 'next/link';
import {
  ArrowUp,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

export const TEXT_ANALYZER_FAQS: FaqItem[] = [
  {
    question: 'What is the ideal Flesch Reading Ease score for web content?',
    answer:
      'For general consumer websites, blogs, and marketing copy, the recommended Flesch Reading Ease score is 60 to 70, which corresponds to a standard 8th-to-9th grade reading level. Content in this range is clear, conversational, and accessible to the vast majority of adult English speakers without feeling oversimplified.',
  },
  {
    question: 'Does keyword density guarantee higher search engine rankings?',
    answer:
      'No. Modern search engines use deep neural language models and semantic entity evaluation to understand content relevance. Maintaining a keyword density between 1% and 2.5% helps ensure clear topical focus, but search engines do not rank pages based on strict keyword percentages. Overusing keywords (keyword stuffing) can trigger quality penalties.',
  },
  {
    question: 'How does reading time differ from speaking time?',
    answer:
      'Silent reading time is calculated at 225 words per minute (WPM), representing the natural pace at which an adult reads silently. Speaking time is calculated at 150 WPM (customizable from 60 to 300 WPM), representing a clear, conversational presentation pace for speeches, podcasts, and video voiceovers.',
  },
  {
    question: 'What is the difference between character count and grapheme cluster count?',
    answer:
      'Standard character counters calculate UTF-16 code units (the 16-bit blocks used in computer memory). A standard letter like "A" is 1 code unit. However, complex compound emojis (such as family emojis 👨‍👩‍👧‍👦) or accented characters with separate combining marks contain multiple code units while appearing as a single visual character. Grapheme cluster counting measures the exact number of visual characters perceived by the human eye.',
  },
  {
    question: 'Is my text saved or uploaded when using the Text Analyzer?',
    answer:
      'No. OmniTools Word Counter & Text Analyzer processes 100% of calculations directly in your browser. No text is uploaded to any server, database, or cloud API. Your documents remain completely private and confidential on your device.',
  },
  {
    question: 'Can I check text in languages other than English?',
    answer:
      'Yes. The character and word counters fully support international Unicode scripts including Arabic, Urdu, Hindi, Chinese, Japanese, Korean, Russian, and all European languages. However, the readability formulas (such as Flesch Reading Ease and Gunning Fog) are specifically calibrated for English phonetic syllable patterns and should be treated as indicative estimates when analyzing non-English text.',
  },
];

export default function TextAnalyzerSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: TEXT_ANALYZER_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <article className="prose prose-slate dark:prose-invert w-full max-w-4xl min-w-0 mx-auto bg-white dark:bg-[#111827] p-4 sm:p-10 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-sm overflow-hidden">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Overview Section */}
      <section className="mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
          Comprehensive Text Analysis &amp; Readability Studio
        </h2>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4 text-base sm:text-lg">
          Whether drafting an editorial article, university essay, keynote speech, novel manuscript, or search-optimized
          blog post, hitting precise length and comprehension targets is essential for clear communication. The OmniTools{' '}
          <strong>Word Counter &amp; Text Analyzer</strong> provides an advanced, browser-based writing studio that
          evaluates your prose across multiple structural and linguistic dimensions simultaneously.
        </p>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-base">
          Unlike basic counters that only track raw character lengths, OmniTools combines real-time counting with six classic
          educational readability formulas, keyword repetition tracking, speaking pace estimation, and contextual writing coach
          findings. Everything runs directly in your browser JavaScript memory—zero text is ever transmitted over the network or
          stored on external servers.
        </p>
      </section>

      {/* How to Use Section */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 inline-block" />
          How to Use the Text Analyzer
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose mb-6">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
              Enter or Upload Text
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Paste your draft into the editor, start typing, click <strong>Open Text File</strong> to load a <code>.txt</code> or <code>.md</code> file, or click <strong>Sample</strong> to test pre-populated copy.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
              Review Core Metrics
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Monitor synchronous counts for words, characters (with and without spaces), visual graphemes, sentences, paragraphs, physical lines, and reading/speaking times.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">3</span>
              Inspect Readability &amp; Grades
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Examine Flesch Reading Ease and 5 additional educational grade benchmarks (Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau, ARI) to ensure proper audience fit.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">4</span>
              Export or Copy Results
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Use <strong>Copy Stats</strong> to place formatted summary metrics on your clipboard, copy modified text, or download a structured editorial text report.
            </p>
          </div>
        </div>
      </section>

      {/* Counting Conventions Section */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400 inline-block" />
          Core Counting Conventions &amp; Definitions
        </h2>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          To provide dependable numbers for writers, publishers, and developers, OmniTools follows rigorous, documented counting conventions:
        </p>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400 mb-6">
          <li>
            <strong>Word Count:</strong> Contiguous sequences of Unicode letters (<code>\p&#123;L&#125;</code>) or numbers (<code>\p&#123;N&#125;</code>). Internal apostrophes in contractions (<em>don&apos;t</em>, <em>it&apos;s</em>, <em>we&apos;ll</em>) and internal hyphens in compound terms (<em>state-of-the-art</em>, <em>client-side</em>) are preserved as single word units. Standalone symbols and punctuation marks are excluded.
          </li>
          <li>
            <strong>Characters (with spaces):</strong> The total count of UTF-16 code units in your text, exactly matching the character counters used by word processors, content management systems, and web form inputs.
          </li>
          <li>
            <strong>Characters (no spaces):</strong> Total character count excluding all whitespace characters (spaces, tabs, and line breaks), providing a measure of net text density.
          </li>
          <li>
            <strong>Grapheme Clusters (Visual Glyphs):</strong> User-perceived visual character count calculated via the modern <code>Intl.Segmenter</code> API (with code-point fallback). This accurately accounts for multi-codepoint emoji sequences (such as family emojis 👨‍👩‍👧‍👦 or skin-tone modifiers 👍🏽) that consume multiple UTF-16 code units but display as a single visual character.
          </li>
          <li>
            <strong>Sentence Count:</strong> Determined through rule-based boundary analysis. Common abbreviations (<em>Mr.</em>, <em>Dr.</em>, <em>e.g.</em>, <em>i.e.</em>, <em>etc.</em>), international sentence terminators (Latin <code>.</code>, <code>!</code>, <code>?</code>, Arabic/Urdu <code>۔</code>, <code>؟</code>, and CJK <code>。</code>, <code>！</code>, <code>？</code>), website domains, email addresses, and decimal numbers (<em>3.14</em>, <em>1,000,000</em>) are protected against premature splitting.
          </li>
          <li>
            <strong>Paragraph Count:</strong> Incremented whenever two or more consecutive line breaks (<code>\n\n</code>) separate distinct text blocks. Whitespace-only lines do not artificially inflate paragraph numbers.
          </li>
          <li>
            <strong>Line Count:</strong> The count of physical lines separated by standard newline sequences (<code>\r\n</code> or <code>\n</code>), helping programmers, translators, and poets verify vertical line limits.
          </li>
        </ul>
      </section>

      {/* Readability Formulas & Benchmarks */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 inline-block" />
          Readability Formulas &amp; Educational Scoring Benchmarks
        </h2>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          Readability formulas provide mathematical estimates of the reading skill required to understand a given piece of writing. OmniTools computes six established formulas:
        </p>

        <div className="w-full max-w-full overflow-x-auto mb-6 not-prose">
          <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">Readability Formula</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">Core Evaluation Factors</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">Score Range</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">Plain English Target</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">Recommended Use Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Flesch Reading Ease</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Sentence length &amp; syllables per word</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">0 to 100</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold">60–70 (8th–9th grade)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Web articles, consumer journalism</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Flesch-Kincaid Grade Level</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">US school grade level mapping</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">1.0 to 18.0+</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold">7.0–8.0 (Junior High)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Educational material, government standards</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Gunning Fog Index</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Complex words (3+ syllables) &amp; sentence length</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">6.0 to 17.0+</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-semibold">7.0–8.0 (Clear Business)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Business writing, corporate memos</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">SMOG Index</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Polysyllabic words across sentence samples</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">4.0 to 18.0+</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-semibold">8.0–10.0 (High School)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Healthcare copy, medical consent forms</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Coleman-Liau Index</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Character counts per 100 words</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">1.0 to 16.0+</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">7.0–9.0 Grade</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Automated grading, non-phonetic scoring</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Automated Readability (ARI)</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Characters per word &amp; words per sentence</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">1.0 to 14.0+</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">7.0–8.0 Grade</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Real-time screenwriting, technical manuals</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
          Interpreting Flesch Reading Ease Scores:
        </h3>
        <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 mb-6 text-sm">
          <li><strong>90–100 (Very Easy):</strong> ~5th grade reading level. Simple, conversational language easily understood by an 11-year-old student.</li>
          <li><strong>70–89 (Easy / Fairly Easy):</strong> 6th to 7th grade level. Natural conversational English suitable for broad commercial copy.</li>
          <li><strong>60–69 (Standard):</strong> 8th to 9th grade level. Plain English; the industry benchmark for web content, blog posts, and mass-market non-fiction.</li>
          <li><strong>50–59 (Fairly Difficult):</strong> 10th to 12th grade level. High-school textbook standard.</li>
          <li><strong>30–49 (Difficult):</strong> College level. Suitable for specialized trade journals and academic papers.</li>
          <li><strong>0–29 (Very Difficult):</strong> University graduate level. Typical of legal contracts, scientific research, and complex technical specifications.</li>
        </ul>
      </section>

      {/* Reading Time & Speaking Time */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 inline-block" />
          Reading Time &amp; Speaking Time Calculation Standards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-6">
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">
              Silent Reading Time (225 WPM)
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Silent reading speed is estimated using the scientific standard of <strong>225 words per minute (WPM)</strong>. Cognitive research demonstrates that typical adult readers comfortably process non-fiction English text between 200 and 250 WPM. Bloggers and technical authors rely on this metric to provide accurate reading-time badges.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">
              Conversational Speaking Time (150 WPM)
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Speaking pace is calculated at a standard conversational delivery rate of <strong>150 WPM</strong>, with customizable pacing controls ranging from 60 to 300 WPM:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <li>• <strong>120–135 WPM:</strong> Deliberate keynote speeches and ceremonial addresses.</li>
              <li>• <strong>140–160 WPM:</strong> Standard conversational pacing for podcasts and video scripts.</li>
              <li>• <strong>160–180 WPM:</strong> Fast broadcast commentary and rapid-fire presentations.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Keyword Density & Repetition */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 inline-block" />
          Keyword Density &amp; Content Repetition Analysis
        </h2>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          Keyword density measures the percentage frequency of specific single words and multi-word phrases relative to the total word count of your draft:
        </p>
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 mb-4 text-center">
          Keyword Density (%) = (Specific Word Count / Total Document Words) &times; 100
        </div>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-3">
          <strong>Best Practices for Editorial &amp; SEO Analysis:</strong>
        </p>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400 mb-6">
          <li>
            <strong>Stop Word Filtering:</strong> OmniTools automatically filters out grammatical function words (<em>the</em>, <em>and</em>, <em>in</em>, <em>of</em>, <em>to</em>, <em>is</em>) from top keyword tables, highlighting genuine conceptual vocabulary.
          </li>
          <li>
            <strong>Editorial Repetition Diagnostics:</strong> Identifying frequently repeated phrases allows writers to eliminate accidental crutch words and vary phrasing using context-appropriate synonyms.
          </li>
          <li>
            <strong>No Fake Ranking Promises:</strong> Modern search engines rank pages based on user satisfaction, topic comprehensiveness, and natural entity relationships. There is no magical &quot;2% keyword density&quot; that guarantees search rankings. OmniTools presents keyword density strictly as an editorial clarity tool.
          </li>
        </ul>
      </section>

      {/* Digital Publishing & Character Limits */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Digital Publishing &amp; Character Limits Reference
        </h2>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          When preparing copy for search snippets and social networks, staying within platform truncation limits prevents vital information from being cut off:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
          <li><strong>Google SEO Title Tag:</strong> ~60 characters (~580 pixels on desktop). Titles longer than 60 characters risk truncation with an ellipsis (<code>...</code>) in organic search results.</li>
          <li><strong>Google Meta Description:</strong> ~155–160 characters (~960 pixels on desktop, ~680 pixels on mobile). Summaries within this threshold display fully without truncation.</li>
          <li><strong>X (formerly Twitter) Post:</strong> 280 characters for standard accounts.</li>
          <li><strong>LinkedIn Post:</strong> 3,000 characters maximum; the visible preview before the &quot;...see more&quot; fold is approximately 210 characters (3 lines).</li>
          <li><strong>Instagram Caption:</strong> 2,200 characters maximum; the visible preview before the &quot;more&quot; tag is approximately 125 characters.</li>
        </ul>
      </section>

      {/* Practical Applications */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Practical Applications Across Disciplines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-6">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 text-sm">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Students &amp; Academic Researchers</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Verify strict word count boundaries for essays and journal abstracts. Ensure research is accessible to peer reviewers by checking Gunning Fog and SMOG scores.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 text-sm">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Content Marketers &amp; SEO Writers</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Keep keyword density natural, match target reading grade levels for target demographics, and pace articles for optimal reader retention.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 text-sm">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Authors &amp; Novelists</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Track chapter word goals, monitor vocabulary variety, eliminate filler words, and inspect sentence length diversity to craft rhythmic narrative prose.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 text-sm">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Public Speakers &amp; Podcasters</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Convert written speeches into precise delivery times, ensuring keynote addresses, podcast intros, and video scripts fit exact event time slots.
            </p>
          </div>
        </div>
      </section>

      {/* Accuracy & Limitations */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Accuracy Guarantees &amp; Language Limitations
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
          <li>
            <strong>Unicode Script Support:</strong> The word and character counter reliably handles all Unicode-supported scripts, including Latin, Cyrillic, Greek, Arabic, Urdu, Hebrew, Devanagari, and CJK (Chinese, Japanese, Korean).
          </li>
          <li>
            <strong>English Readability Formulas:</strong> Syllable-counting formulas (Flesch, Flesch-Kincaid, Gunning Fog, SMOG) are calibrated around English phonotactic rules and vowel sequences. While the tool will calculate metrics for any Latin-script input, scores for Spanish, French, German, or transliterated languages should be viewed as indicative approximations rather than certified grade levels.
          </li>
          <li>
            <strong>Short Text Behavior:</strong> Readability formulas rely on statistical distributions across multi-sentence paragraphs. For samples under 30 words, readability scores are labeled as preliminary estimates.
          </li>
        </ol>
      </section>

      {/* Privacy Guarantee */}
      <section className="mb-10 p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 not-prose">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          100% Client-Side Privacy Guarantee
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
          OmniTools operates on a strict zero-server privacy architecture:
        </p>
        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <span><strong>Local In-Memory Execution:</strong> All counting algorithms, regex parsers, readability math, and writing coach rules execute entirely within your browser&apos;s local JavaScript thread.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <span><strong>Zero Network Transmission:</strong> Your draft text is never sent over the Internet, uploaded to cloud servers, or exposed to third-party language models.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <span><strong>RAM-Only Persistence:</strong> Text exists exclusively in temporary browser RAM while the tab is open. When you refresh or close your browser tab, your text is completely erased.</span>
          </li>
        </ul>
      </section>

      {/* Frequently Asked Questions */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Frequently Asked Questions
        </h2>
        <dl className="space-y-6">
          {TEXT_ANALYZER_FAQS.map((faq, index) => (
            <div key={index} className="border-b border-gray-100 dark:border-slate-800 pb-5 last:border-b-0">
              <dt className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {faq.question}
              </dt>
              <dd className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Related Content & Developer Utilities */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800 not-prose">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
          Related SEO &amp; Content Utilities
        </h3>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/seo/text-case-converter"
            className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700"
          >
            Text Case Converter &rarr;
          </Link>
          <Link
            href="/seo/meta-generator"
            className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700"
          >
            Meta Tags &amp; Open Graph Generator &rarr;
          </Link>
          <Link
            href="/seo/qr-generator"
            className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700"
          >
            Custom QR Code Generator &rarr;
          </Link>
          <Link
            href="/developer/json-formatter"
            className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700"
          >
            JSON Formatter &amp; Validator &rarr;
          </Link>
        </div>
      </div>

      {/* Return to Tool CTA */}
      <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-200 dark:border-slate-700 text-center not-prose">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Ready to inspect your draft, check reading pace, or calculate grade-level readability?
        </p>
        <a
          href="#text-analyzer-workspace"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-sm"
        >
          <ArrowUp className="w-4 h-4" />
          <span>Return to Text Analyzer Workspace</span>
        </a>
      </div>
    </article>
  );
}