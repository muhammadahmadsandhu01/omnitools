import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const IMAGE_COMPRESSOR_FAQS: FaqItem[] = [
  {
    question: 'How does client-side browser image compression work without server uploads?',
    answer:
      'OmniTools utilizes the browser native HTML5 Canvas 2D API and HTMLCanvasElement.toBlob() encoder. When you add photos, the tool analyzes pixel edge energy, luma variance, and transparency in client memory, then dynamically encodes the image to your selected format and quality level. All processing occurs locally on your machine with zero server communication.',
  },
  {
    question: 'Why does converting JPEG and PNG to WebP achieve superior compression?',
    answer:
      'WebP is a modern image format developed by Google that incorporates advanced intra-frame prediction algorithms derived from the VP8 video codec. WebP typically yields 25% to 35% smaller file sizes than legacy JPEG at comparable perceptual quality, while also supporting alpha channel transparency unlike standard JPEG.',
  },
  {
    question: 'What are the batch limits and file size restrictions for compression?',
    answer:
      'You can queue up to 100 images in a single batch, with a maximum file size of 100 MB per image. Processed images can be downloaded individually or packaged together as a consolidated ZIP archive using client-side JSZip.',
  },
  {
    question: 'How does the Target File Size mode work?',
    answer:
      'In Target File Size mode, you specify a maximum target threshold in kilobytes (e.g. 500 KB for web upload portals). The compression engine conducts an iterative binary search across quality and dimension parameters to reach your desired byte ceiling while retaining maximum visual clarity.',
  },
  {
    question: 'Can this tool compress iPhone HEIC and HEIF photos?',
    answer:
      'Yes. OmniTools dynamically integrates client-side heic2any translation to decode Apple High Efficiency Image Container (HEIC/HEIF) photos directly into browser-compatible JPEG or WebP assets without sending them to external cloud services.',
  },
];

export default function ImageCompressorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: IMAGE_COMPRESSOR_FAQS.map((faq) => ({
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
        Client-Side Image Compressor &amp; Optimizer: Smart WebP, JPEG &amp; PNG Sizing
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        In modern web architecture, image weight accounts for over 60% of total web page payload. Bloated images
        damage Google Core Web Vitals (specifically Largest Contentful Paint / LCP) and increase mobile bandwidth consumption.
        OmniTools <strong>Image Compressor &amp; Optimizer</strong> delivers high-efficiency image minification running
        100% locally in your web browser. Reduce file sizes by up to 80% while preserving exceptional visual fidelity.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Image Compression Presets &amp; Modes
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Optimization Mode</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Quality Tuning</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Best Use Case</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Average Savings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Smart Mode</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Perceptually balanced (75–85%)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Web publishing, blog heroes, e-commerce catalog photos</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">50% to 75%</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Target Size (KB)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Binary-search iterative tuning</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Government portals, passport/visa uploads, strict email limits</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-medium">Precise to target</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Lossless / Near-Lossless</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Maximum fidelity (90–98%)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Photography portfolios, archival scans, graphic assets</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 font-medium">20% to 40%</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Maximum Compression</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Aggressive quantization (50–65%)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Low-bandwidth mobile applications, thumbnails, messaging</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">70% to 85%+</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Canvas 2D Rasterization &amp; Perceptual Analysis
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Unlike basic canvas scripts that indiscriminately compress images, OmniTools runs an initial sampling scan
        to measure luminosity variance and edge complexity. This prevents severe banding artifacts in gradient areas
        while maximizing compression on uniform backgrounds:
      </p>
      <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Transparency Detection:</strong> If an image contains an alpha channel (transparent background in PNG or WebP), the tool avoids forced JPEG conversions that would replace transparent areas with black backgrounds.
        </li>
        <li>
          <strong>Animated WebP &amp; GIF Guard:</strong> Animated files are identified to prevent accidental flattening of animation frames into single static slides.
        </li>
        <li>
          <strong>Interactive Split Slider:</strong> Inspect compressed results side-by-side with your original photo using an interactive comparison slider before downloading.
        </li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How to Compress &amp; Optimize Images
      </h3>
      <ol className="list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Add Images:</strong> Drag and drop up to 100 JPEG, PNG, WebP, AVIF, or HEIC images into the dropzone (up to 100 MB per file).
        </li>
        <li>
          <strong>Select Target Format:</strong> Choose <em>Auto</em> for optimal compression, convert specifically to modern <em>WebP</em>, or keep the original format.
        </li>
        <li>
          <strong>Tune Quality or Target Size:</strong> Adjust the quality percentage slider or switch to <em>Target Size (KB)</em> mode to specify an exact maximum file size.
        </li>
        <li>
          <strong>Compare Quality &amp; Download:</strong> Use the interactive comparison slider to review visual quality, then download files individually or as a single ZIP package.
        </li>
      </ol>

      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <dl className="space-y-6 mb-6">
        {IMAGE_COMPRESSOR_FAQS.map((faq, index) => (
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
            href="/media/webp-to-jpg-png"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            WebP to JPG &amp; PNG Converter &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/document/image-to-pdf"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Image to PDF Studio &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/developer/svg-optimizer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            SVG Optimizer &amp; Cleaner &rarr;
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