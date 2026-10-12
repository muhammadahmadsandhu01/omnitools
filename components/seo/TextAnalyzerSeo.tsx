import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const TEXT_ANALYZER_FAQS: FaqItem[] = [
  {
    question: 'How is the Flesch Reading Ease score calculated, and what does it mean?',
    answer:
      'The Flesch Reading Ease formula computes readability on a 0–100 scale using the equation: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words). Scores between 60 and 70 correspond to standard plain English (easily understood by 8th-to-9th grade students). Higher scores (80–100) represent conversational, easy-to-read prose, while scores below 50 indicate complex academic or legal documentation.',
  },
  {
    question: 'How are reading time and speaking time estimated?',
    answer:
      'Reading time is calculated using an industry-standard silent reading speed of 225 words per minute (WPM). Speaking time is calculated at a standard conversational presentation pace of 135 words per minute. These metrics help content creators and public speakers pace video scripts, podcasts, and speeches accurately.',
  },
  {
    question: 'Why is keyword density analysis important for search engine optimization (SEO)?',
    answer:
      'Keyword density measures how frequently specific single words and multi-word phrases appear as a percentage of total word count (excluding stop words like "the", "and", "in"). Search engines reward natural topical coverage while penalizing keyword stuffing. Maintaining target keyword density between 1% and 2.5% ensures strong relevance without triggering spam filters.',
  },
  {
    question: 'How do character counter limits help prevent Google snippet truncation?',
    answer:
      'Google search result pages (SERPs) allocate fixed pixel widths for organic snippets—typically truncating title tags after ~60 characters and meta descriptions after ~155–160 characters. OmniTools displays live progress bars for SEO titles, meta descriptions, and social media platforms (X/Twitter, LinkedIn, Instagram) to prevent truncation.',
  },
  {
    question: 'Is my written text uploaded or saved to any server during analysis?',
    answer:
      'No. OmniTools Word Counter & Text Analyzer processes all tokenization, syllable counting, readability math, and keyword frequency checks client-side within your browser JavaScript memory. Zero text is transmitted across the network, ensuring complete confidentiality for unreleased manuscripts, legal documents, and corporate copy.',
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
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Word Counter &amp; SEO Text Analyzer: Readability Metrics, Speaking Time &amp; Keyword Density
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Whether drafting an SEO article, academic essay, speech script, or social media post, hitting target length
        and comprehension levels is essential for audience engagement. OmniTools <strong>Word Counter &amp; Text Analyzer</strong>
        delivers an advanced linguistic studio running 100% locally in your web browser. Analyze word counts, character density,
        reading pace, keyword repetition, writing tone, and six industry-standard readability formulas in real time.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Readability Index Formulas &amp; Scoring Benchmarks
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        OmniTools computes six established educational and linguistic readability indices to determine the exact grade level required to understand your writing:
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Readability Metric</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Formula Base Factors</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Score Range</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Target Standard</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Flesch Reading Ease</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Sentence length &amp; syllables per word</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">0 to 100</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">60–70 (Plain English / 8th Grade)</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Flesch-Kincaid Grade</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">US school grade level mapping</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">1 to 18+</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">7th to 9th Grade (Web Content)</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Gunning Fog Index</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Complex words (3+ syllables) &amp; sentence length</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">6 to 17+</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-medium">7–8 (Universal Business Clarity)</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">SMOG Index</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Polysyllabic word count across 30 sentences</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">4 to 18+</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-medium">Healthcare &amp; Technical Manuals</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Coleman-Liau Index</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Letter counts per 100 words</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">1 to 16+</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Objective character-based grade scale</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Social Media &amp; SEO Metadata Character Tracking
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Avoid manual character counting with built-in live limits for digital publishing channels:
      </p>
      <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li><strong>Google SEO Title:</strong> 60 characters (~580 px max before truncation in search engine results).</li>
        <li><strong>Google Meta Description:</strong> 160 characters (optimal snippet summary length).</li>
        <li><strong>X (Twitter) Post:</strong> 280 characters for standard post limits.</li>
        <li><strong>LinkedIn Post:</strong> 3,000 characters maximum for professional updates.</li>
        <li><strong>Instagram Caption:</strong> 2,200 characters limit.</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How to Use the Text Analyzer
      </h3>
      <ol className="list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Paste or Type Text:</strong> Enter your manuscript, article draft, speech, or social media caption directly into the workspace.
        </li>
        <li>
          <strong>Review Core Statistics:</strong> Monitor real-time counts for words, characters, sentences, paragraphs, and estimated reading and speaking durations.
        </li>
        <li>
          <strong>Examine Readability &amp; Tone:</strong> Check your Flesch Reading Ease score and grade level recommendations to align with your intended audience.
        </li>
        <li>
          <strong>Inspect Keyword Density &amp; Style:</strong> Review the top single words and 2-to-3 word phrases to eliminate accidental repetition, filler phrases, or keyword stuffing.
        </li>
      </ol>

      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <dl className="space-y-6 mb-6">
        {TEXT_ANALYZER_FAQS.map((faq, index) => (
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
          Related SEO &amp; Content Utilities
        </h4>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/seo/text-case-converter"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Text Case Converter &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/seo/meta-generator"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Meta Tags &amp; Open Graph Generator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/seo/qr-generator"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Custom QR Code Generator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/developer/json-formatter"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            JSON Formatter &amp; Validator &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}