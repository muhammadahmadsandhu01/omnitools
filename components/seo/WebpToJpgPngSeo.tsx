import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const WEBP_TO_JPG_PNG_FAQS: FaqItem[] = [
  {
    question: 'Why should I convert WebP images to JPG or PNG?',
    answer:
      'While WebP provides superior compression on modern web browsers, many legacy desktop applications, photo viewers, printing services, and older image editors cannot natively open .webp files. Converting WebP to JPG ensures universal compatibility across all operating systems and devices, while converting to PNG preserves full alpha transparency for logos and graphics.',
  },
  {
    question: 'How does the converter handle transparent WebP images when exporting to JPG?',
    answer:
      'Because the JPEG format does not support alpha transparency channels, any transparent pixels must be rendered against a solid color. OmniTools allows you to configure this background fill color (defaulting to clean white #ffffff, or customizable to black or custom hex values) before rasterizing.',
  },
  {
    question: 'Are my images uploaded to any remote server during conversion?',
    answer:
      'No. OmniTools WebP Converter operates entirely client-side using browser-native HTML5 Canvas 2D and OffscreenCanvas APIs. Your images are decoded, rasterized, and encoded directly within your device memory without transmitting any data over the internet.',
  },
  {
    question: 'What are the batch queue limits and can I download a ZIP archive?',
    answer:
      'You can select or drag-and-drop up to 50 WebP files simultaneously, with a generous 50 MB per-file limit and a 250 MB total queue ceiling. Once converted, you can download each image individually or click "Download All as ZIP" to receive a clean JSZip compressed archive.',
  },
  {
    question: 'Will converting WebP to JPG always produce a smaller file size?',
    answer:
      'Not necessarily. WebP was designed specifically to achieve higher compression efficiency than JPEG at comparable visual quality. Re-encoding a highly compressed WebP file into standard JPEG may result in a slightly larger file size to preserve visual fidelity at your selected quality setting.',
  },
];

export default function WebpToJpgPngSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: WEBP_TO_JPG_PNG_FAQS.map((faq) => ({
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
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 text-slate-900 dark:text-white">
        WebP to JPG &amp; PNG Converter: Fast, Private &amp; High-Fidelity
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-300">
        Google&apos;s WebP image format has become the standard for modern web optimization due to its compact file sizes and rich feature set. However, many email clients, desktop photo viewers, content management systems, and legacy editing programs still fail to open or import <code>.webp</code> files. OmniTools <strong>WebP to JPG &amp; PNG Converter</strong> provides a zero-friction, private solution to convert your WebP graphics and photos into universal JPEG or lossless PNG images directly within your browser.
      </p>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        How to Convert WebP Images to JPG or PNG
      </h3>
      <ol className="list-decimal pl-6 space-y-2 mb-6 text-slate-600 dark:text-slate-300">
        <li>
          <strong>Select or Drag WebP Files:</strong> Drop one or multiple <code>.webp</code> files into the upload zone or click browse to choose files from your device. You can batch process up to 50 images (up to 250 MB total) at once.
        </li>
        <li>
          <strong>Choose Target Output Format:</strong> Select <strong>JPG</strong> for standard photographs, wallpapers, and universal sharing, or select <strong>PNG</strong> to preserve lossless quality and transparent background layers.
        </li>
        <li>
          <strong>Configure JPEG Quality &amp; Background Fill:</strong> If converting to JPG, adjust the compression quality slider (default 90%) to balance clarity and file weight. For transparent WebP images, pick your preferred background fill color (white, black, or custom hex).
        </li>
        <li>
          <strong>Convert Single or Batch:</strong> Click &ldquo;Convert All&rdquo; to process your entire queue sequentially, or convert individual cards one by one.
        </li>
        <li>
          <strong>Download Converted Images:</strong> Download individual output files instantly or click &ldquo;Download All as ZIP&rdquo; to save the complete set in an organized archive.
        </li>
      </ol>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Format Comparison: WebP vs JPG vs PNG
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200">
              <th className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">Feature / Metric</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">WebP</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">JPG / JPEG</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">PNG</th>
            </tr>
          </thead>
          <tbody className="text-slate-600 dark:text-slate-300">
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-medium">Primary Use Case</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Modern web delivery</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Photographs &amp; universal sharing</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Logos, icons &amp; graphics</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-medium">Alpha Transparency</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Supported (lossy &amp; lossless)</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800 text-red-500 font-medium">Not supported (composited)</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800 text-emerald-600 font-medium">Full 8-bit alpha channel</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-medium">Device Compatibility</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Modern browsers</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-bold text-blue-600 dark:text-blue-400">100% Universal</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-bold text-blue-600 dark:text-blue-400">100% Universal</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-medium">Compression Algorithm</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">VP8 / VP8L predictive coding</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Discrete Cosine Transform (DCT)</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">DEFLATE / LZ77 lossless</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-medium">Color Profile</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">24-bit RGB / 32-bit RGBA</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">24-bit RGB</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">24-bit RGB / 32-bit RGBA</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Privacy First: 100% Local Browser-Side Processing
      </h3>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-300">
        Many online conversion websites upload personal files to unencrypted remote servers, process them in temporary cloud containers, and expose graphics to third-party data tracking. OmniTools utilizes client-side HTML5 Canvas and OffscreenCanvas technology to decode and re-encode your images locally inside your browser runtime. Zero images leave your computer or smartphone, guaranteeing absolute privacy for sensitive design assets, commercial imagery, and personal photo libraries.
      </p>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <div className="space-y-4 mb-8">
        {WEBP_TO_JPG_PNG_FAQS.map((faq, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30"
          >
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
              {faq.question}
            </h4>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Related OmniTools Utilities
      </h3>
      <p className="mb-4 text-slate-600 dark:text-slate-300 text-sm">
        Explore related media and document conversion utilities in the OmniTools workspace:
      </p>
      <ul className="list-disc pl-6 space-y-1.5 text-sm text-blue-600 dark:text-blue-400">
        <li>
          <Link href="/media/image-compressor" className="hover:underline">
            Image Compressor &amp; Optimizer — Compress JPG, PNG, and WebP images client-side
          </Link>
        </li>
        <li>
          <Link href="/document/image-to-pdf" className="hover:underline">
            Image to PDF Converter — Convert photos and raster graphics into standardized PDF documents
          </Link>
        </li>
        <li>
          <Link href="/developer/svg-optimizer" className="hover:underline">
            SVG Optimizer &amp; Cleaner — Strip redundant XML tags and shrink vector graphics
          </Link>
        </li>
        <li>
          <Link href="/document/pdf-merge-split" className="hover:underline">
            PDF Merge &amp; Split Tool — Reorder, combine, and extract pages in client memory
          </Link>
        </li>
      </ul>
    </article>
  );
}
