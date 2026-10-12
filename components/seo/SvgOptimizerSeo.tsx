import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const SVG_OPTIMIZER_FAQS: FaqItem[] = [
  {
    question: 'How does reducing path coordinate decimal precision reduce SVG file size?',
    answer:
      'Vector editors frequently export path coordinate numbers with 10 to 16 decimal places (e.g. 14.285714285714286). Because physical computer screens cannot display fractions of a sub-pixel smaller than 0.01px, rounding coordinates to 2 or 3 decimal places eliminates 40% to 60% of character bytes across complex paths without any visible change in rendering quality.',
  },
  {
    question: 'Why should width and height attributes often be removed in favor of viewBox?',
    answer:
      'The viewBox attribute establishes an internal aspect-ratio coordinate system (e.g. viewBox="0 0 24 24"). Hardcoded width and height attributes enforce fixed pixel dimensions. Removing width and height allows CSS rules (like width: 100% or utility classes) to cleanly scale the vector graphic responsively across any screen dimensions.',
  },
  {
    question: 'Can SVG files contain executable malicious scripts (XSS vulnerabilities)?',
    answer:
      'Yes. Because SVG is valid XML, the SVG specification supports embedded <script> tags, foreignObject elements, and inline event handlers (like onload or onclick). Serving unsanitized user-uploaded SVGs directly inline in HTML can lead to Cross-Site Scripting (XSS). OmniTools flags embedded scripts, javascript: links, and event handlers during analysis.',
  },
  {
    question: 'What editor-specific metadata is safely stripped during optimization?',
    answer:
      'Design software injects non-rendering XML metadata used only for re-editing in that specific app. This includes Inkscape namespace attributes (sodipodi:docname, inkscape:version), Sketch layers (xmlns:sketch), Illustrator XML declarations, DOCTYPE headers, and editor guide layers. Stripping them reduces payload size without affecting browser rendering.',
  },
  {
    question: 'Are my SVG graphic files uploaded to a remote server for optimization?',
    answer:
      'No. All XML parsing, path coordinate formatting, regex cleaning, and DOM serialization execute entirely client-side in your web browser. Proprietary logos, brand icons, and illustration vectors never leave your device.',
  },
];

export default function SvgOptimizerSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SVG_OPTIMIZER_FAQS.map((faq) => ({
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
        SVG Optimization Guide: XML Cleansing, Coordinate Precision &amp; Web Performance
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        <strong>Scalable Vector Graphics (SVG)</strong> is an XML-based vector image format standard maintained by the <strong>W3C</strong>.
        Unlike raster images (JPEG, PNG, WebP) which store pixel grids, SVGs describe geometric shapes, paths,
        and typography mathematically. Because vector design software (Figma, Adobe Illustrator, Inkscape) prioritizes
        non-destructive editing over web delivery, exported SVGs routinely carry 50% to 80% non-essential bloat.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Anatomy of an Optimized SVG: Sources of File Bloat
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        A production-ready SVG should contain only the elements necessary for browser rendering engines:
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Bloat Category</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Example Bloat in Raw Export</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Optimized Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">XML Headers &amp; Comments</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-red-600 dark:text-red-400">{`<?xml version="1.0"?> <!DOCTYPE svg...>`}</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Stripped (redundant in HTML5)</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Editor Namespaces</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-red-600 dark:text-red-400">{`inkscape:version="1.2" xmlns:sketch="..."`}</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Removed without rendering impact</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Excess Coordinate Decimals</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-red-600 dark:text-red-400">d=&quot;M12.4928194 8.1928471...&quot;</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Rounded to 2 decimals (d=&quot;M12.49 8.19...&quot;)</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Empty Container Tags</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-red-600 dark:text-red-400">{`<g id="Layer_1"><g></g></g>`}</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Collapsed and pruned</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Color Minification</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-red-600 dark:text-red-400">fill=&quot;#ffffff&quot; or rgb(255,255,255)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Shortened to fill=&quot;#fff&quot;</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Security &amp; Sanitization: SVGs as Active XML
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Unlike static bitmap formats (JPEG or PNG), an SVG is an active XML document capable of declaring DOM events.
        If an untrusted SVG file is embedded directly into web applications, malicious actors can execute Cross-Site Scripting (XSS)
        attacks using payloads like <code className="text-xs">&lt;script&gt;</code> tags, <code className="text-xs">onload</code> attributes,
        or <code className="text-xs">&lt;a href=&quot;javascript:...&quot;&gt;</code> links.
      </p>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        The OmniTools SVG Cleaner inspects markup for embedded scripts, external resource links, and active event handlers,
        alerting developers before unsafe graphics are deployed into production web apps.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How to Use the OmniTools SVG Optimizer
      </h3>
      <ol className="list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Upload or Paste SVG:</strong> Drop an SVG file or paste raw XML markup directly into the workspace.
        </li>
        <li>
          <strong>Choose an Optimization Preset:</strong> Select <em>Smart</em> (recommended for modern web icons), <em>Safe</em> (preserves all IDs and classes), or <em>Maximum</em> (aggressive precision reduction).
        </li>
        <li>
          <strong>Adjust Coordinate Precision:</strong> Lower the decimal precision slider (typically 2 or 3 digits) while checking the live visual preview against checkerboard, light, and dark backgrounds.
        </li>
        <li>
          <strong>Copy or Download:</strong> Instantly copy clean inline SVG markup for React/HTML, or download the optimized <code className="text-xs">.svg</code> asset file.
        </li>
      </ol>

      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <dl className="space-y-6 mb-6">
        {SVG_OPTIMIZER_FAQS.map((faq, index) => (
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
          Related Media &amp; Developer Utilities
        </h4>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/media/image-compressor"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Image Compressor &amp; Optimizer &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/media/webp-to-jpg-png"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            WebP to JPG &amp; PNG Converter &rarr;
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