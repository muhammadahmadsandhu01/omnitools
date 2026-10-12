import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const IMAGE_TO_PDF_FAQS: FaqItem[] = [
  {
    question: 'Will converting multiple images reduce their original resolution or visual quality?',
    answer:
      'By default, OmniTools preserves high resolution using high-grade canvas rendering or direct binary embedding for uncompressed PNG and JPEG files. If you select the "Original / Lossless" quality preset, unrotated JPEG and PNG images are embedded directly into the PDF document stream without re-compression.',
  },
  {
    question: 'How do standard page sizes and margins work during conversion?',
    answer:
      'Standard ISO sizes (A4, A3, A5) and North American formats (US Letter, US Legal) use exact typographic point geometry (72 points per inch). In "Contain" mode, images are centered within your specified margins without cropping. In "Cover" mode, images fill the entire page canvas, while "Fit to Image" sets page dimensions directly to each image pixel dimensions.',
  },
  {
    question: 'Can you generate separate PDF documents instead of one combined file?',
    answer:
      'Yes. Toggle output mode from "Single Combined PDF" to "Separate PDFs (ZIP)". OmniTools generates an individual standalone PDF for every image in your queue and packages them into a clean, downloadable ZIP archive using client-side JSZip.',
  },
  {
    question: 'How does the tool handle iPhone HEIC and HEIF photos?',
    answer:
      'OmniTools dynamically imports the heic2any decoder in your browser to convert Apple High Efficiency Image Container (HEIC/HEIF) files into standard JPEG streams locally before embedding them into your PDF, requiring no cloud server uploads.',
  },
  {
    question: 'Are my images or generated PDF documents uploaded to an external server?',
    answer:
      'No. All image loading, orientation rotation, canvas rasterization, and PDF document generation execute 100% locally in your browser memory via pdf-lib. Confidential receipts, passport photos, and business documents never leave your local machine.',
  },
];

export default function ImageToPdfSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: IMAGE_TO_PDF_FAQS.map((faq) => ({
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
        Professional Image to PDF Studio: High-Resolution Client-Side Document Creation
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Converting photos, scanned receipts, official document scans, design mockups, and artwork into PDF shouldn&apos;t
        require expensive software subscriptions or sacrificing sensitive personal records to third-party cloud servers.
        OmniTools <strong>Image to PDF Studio</strong> provides a complete document generation studio running 100% locally
        inside your browser. Assemble multi-page PDF documents with customizable page geometry, margins, rotation, and compression.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How to Convert Images into a Combined PDF
      </h3>
      <ol className="list-decimal pl-6 space-y-2 mb-6 text-slate-600 dark:text-slate-400">
        <li>
          <strong>Select or Drop Images:</strong> Drag and drop up to 100 JPG, PNG, WebP, BMP, GIF, SVG, or HEIC files into the upload area.
        </li>
        <li>
          <strong>Arrange Page Sequence:</strong> The order of items in your queue matches the page order in the final PDF. Use the up and down arrow controls to rearrange pages.
        </li>
        <li>
          <strong>Rotate &amp; Orient:</strong> Rotate individual pages 90° clockwise or counter-clockwise as needed. Auto-orientation dynamically matches landscape and portrait files.
        </li>
        <li>
          <strong>Customize Page Layout:</strong> Select standard page sizes (A4, US Letter, A3, A5, Legal) or choose <em>Fit to Image</em> to preserve exact pixel bounds without white borders.
        </li>
        <li>
          <strong>Set Compression &amp; Margins:</strong> Choose from lossless preservation, balanced quality, or compact compression, and adjust page margins (None, Small, Large).
        </li>
        <li>
          <strong>Convert &amp; Download:</strong> Generate a single consolidated multi-page PDF or download individual PDFs bundled in a single ZIP archive.
        </li>
      </ol>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Supported Image Formats &amp; Technical Capabilities
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Format</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Handling Policy</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Compression &amp; Alpha Support</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono text-xs">JPEG / JPG</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Direct binary stream embedding or canvas re-compression</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Adjustable quality ratio (60% to 95%)</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono text-xs">PNG</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Lossless embedding with alpha transparency preservation</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Configurable page background color</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono text-xs">WebP</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Browser-decoded into high-fidelity canvas raster</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Optimized PDF image stream packaging</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono text-xs">BMP &amp; GIF</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Native browser canvas raster decoding</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">First frame extracted for animated GIFs</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono text-xs">HEIC / HEIF</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Client-side translation via heic2any module</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Decoded into high-quality JPEG stream locally</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <dl className="space-y-6 mb-6">
        {IMAGE_TO_PDF_FAQS.map((faq, index) => (
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
          Related Document &amp; Media Utilities
        </h4>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/document/pdf-merge-split"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            PDF Merge &amp; Split Tool &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
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
            href="/finance/invoice-generator"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Free Invoice Generator &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}
