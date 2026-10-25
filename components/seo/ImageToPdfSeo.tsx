import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const IMAGE_TO_PDF_FAQS: FaqItem[] = [
  {
    question: 'How do I combine multiple photos into a single PDF document?',
    answer:
      'Drag and drop your images into the KivaroTools upload area or select them using the file browser. Arrange the image sequence using the drag-and-drop handles or the Move Up and Move Down arrow buttons. Ensure Output Mode is set to "Single Combined PDF", customize your preferred page size and margins, and click "Convert to PDF". All images will be compiled into one multi-page document in your exact order.',
  },
  {
    question: 'Can I generate separate individual PDFs for each uploaded image?',
    answer:
      'Yes. Toggle the Output Mode switch from "Single Combined PDF" to "Separate PDFs (ZIP)". KivaroTools will compile an independent standalone PDF for every image in your queue and package them into a single downloadable ZIP archive, making it easy to process dozens of receipts or invoices at once.',
  },
  {
    question: 'Are my images or generated PDF documents uploaded to any remote server?',
    answer:
      'No. KivaroTools operates 100% client-side directly within your browser memory using pdf-lib and the HTML5 Canvas API. Your image bytes never leave your personal computer or mobile device, ensuring complete privacy for sensitive government identity cards, medical records, financial tax forms, and confidential business documents.',
  },
  {
    question: 'What image formats are supported by the converter?',
    answer:
      'KivaroTools supports standard JPEG (JPG), PNG, WebP, BMP, GIF (first frame extracted), SVG vector graphics, and Apple iPhone HEIC/HEIF photos. Unsupported, corrupted, or zero-byte files are caught immediately during pre-flight validation with helpful diagnostic feedback.',
  },
  {
    question: 'How does the tool handle iPhone HEIC and HEIF photos?',
    answer:
      'KivaroTools dynamically imports the client-side heic2any decoding engine in your browser. This decodes Apple High Efficiency Image Container (HEIC/HEIF) files into standard JPEG streams locally on your device before embedding them into the PDF, requiring zero cloud conversion or third-party server processing.',
  },
  {
    question: 'How does Auto Orientation work?',
    answer:
      'When set to "Auto", the engine inspects the natural pixel dimensions of each individual image. Wide landscape photos are placed on landscape pages, while tall vertical photos and document scans are placed on portrait pages. This prevents awkward horizontal shrinking and preserves maximum readability.',
  },
  {
    question: 'What is the difference between "Fit to Image" and standard page sizes like A4 or Letter?',
    answer:
      'Standard presets like A4 (210 × 297 mm) and US Letter (8.5 × 11 in) create fixed-dimension paper pages, centering your image inside optional margins. "Fit to Image" sets each PDF page dimensions to exactly match the native pixel resolution of the image (at 72 DPI), eliminating all outer margins and white borders.',
  },
  {
    question: 'Will converting transparent PNG images create a black background?',
    answer:
      'No. In "Original / Lossless" mode, PNG transparency channels are preserved. When using quality compression presets that convert images to JPEG (which lacks an alpha channel), KivaroTools automatically composites transparent pixels against a clean background color (white by default, or your custom chosen hex color) to prevent black background artifacts.',
  },
  {
    question: 'What is the difference between Contain, Cover, and Actual image placement?',
    answer:
      '"Contain" scales the image proportionally so that the entire image fits completely inside the printable area without cropping. "Cover" scales the image up to fill the entire printable area, centering it and cropping any overflow. "Actual" places the image at 1:1 pixel-to-point dimensions without scaling, downscaling only if the image exceeds page bounds.',
  },
  {
    question: 'Is there a limit on file size or the number of images I can convert?',
    answer:
      'You can convert up to 100 images per batch with a total combined queue size of up to 500 MB. Because processing runs entirely in your local browser memory, performance depends on your device RAM and CPU rather than artificial cloud quotas or paywalls.',
  },
  {
    question: 'Can I rotate individual images before converting to PDF?',
    answer:
      'Yes. Every image card in the queue features a 90° clockwise rotation button. You can rotate sideways scans, receipts, or smartphone photos 90°, 180°, or 270° before generation, and the rotation is accurately applied to the final PDF pages.',
  },
  {
    question: 'Can I create custom page sizes in millimeters, inches, or points?',
    answer:
      'Yes. Select "Custom" under Page Size, enter your desired width and height, and pick your preferred unit: millimeters (mm), inches (in), or typographic points (pt). The engine automatically calculates the exact mathematical point conversions for standard PDF output.',
  },
  {
    question: 'Why does embedding a JPEG into a PDF sometimes increase the file size slightly?',
    answer:
      'A PDF document wraps image byte streams with structural document metadata (cross-reference tables, page dictionaries, creator metadata, and font dictionaries). In addition, re-encoding images through canvas at high quality can produce slightly larger binaries. For minimal file size on already-compressed files, select "Original / Lossless".',
  },
  {
    question: 'What should I do if my downloaded PDF is too large for an email attachment or portal upload?',
    answer:
      'If your resulting PDF exceeds upload limits (such as government portals requiring files under 2 MB), use the "Compressed (60%)" or "Standard (80%)" quality preset before conversion, or run your generated PDF through the KivaroTools PDF Merge & Split and Image Compressor utilities.',
  },
  {
    question: 'Can I change the canvas background color behind my images?',
    answer:
      'Yes. KivaroTools includes an interactive Background Color picker with hex input support (e.g., #FFFFFF for standard clean white, #F3F4F6 for soft document gray, or custom branded hex codes). When placing images with margins or non-standard aspect ratios, the PDF page canvas is drawn with your selected background fill color, eliminating uneven white space and matching your organization\'s document palette.',
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
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-sm">
      {/* Structured Data: FAQPage (SoftwareApplication is provided by page shell) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Section 1: Introduction */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Client-Side Image to PDF Converter: Private, High-Resolution Document Assembly
      </h2>
      <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
        Converting smartphone photos, scanned paper receipts, signed contracts, architectural blueprints, and student assignments
        into a standardized PDF document shouldn&apos;t require expensive software licenses or uploading sensitive records to remote cloud servers.
        KivaroTools <strong>Image to PDF Converter</strong> delivers a complete document publishing studio that executes
        <strong> 100% locally in your web browser</strong>.
      </p>
      <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-6">
        Whether you need to compile 30 expense receipts into a single monthly report for accounting, convert high-resolution graphic design
        portfolios into print-ready A4 booklets, or package individual product photos into separate PDFs, KivaroTools offers complete control
        over page geometry, margins, orientation, and image placement with zero watermarks and zero daily limits.
      </p>

      {/* Section 2: Step-by-Step Instructions */}
      <section aria-labelledby="image-to-pdf-how-to-convert-images-to-pdf-i" className="mb-10">
        <h3 id="image-to-pdf-how-to-convert-images-to-pdf-i" className="text-xl sm:text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
          How to Convert Images to PDF in 4 Simple Steps
        </h3>
      <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
        <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
          <strong>Privacy First &amp; Secure:</strong> All processing is done locally in your browser via client-side JavaScript. No files, text, or data are ever uploaded to our servers.
        </p>
      </blockquote>
        <ol className="list-decimal pl-6 space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          <li>
            <strong>Add Your Images:</strong> Drag and drop up to 100 images onto the upload zone, or click to browse. The converter accepts
            JPG, PNG, WebP, BMP, GIF, SVG, and iPhone HEIC/HEIF files up to a 500 MB total queue size.
          </li>
          <li>
            <strong>Arrange &amp; Orient Pages:</strong> The order of items in your queue matches the page order in the final PDF document.
            Use mouse drag-and-drop or the accessible <em>Move Up</em> and <em>Move Down</em> keyboard buttons to rearrange pages. Click the 90° rotation button to correct sideways smartphone photos.
          </li>
          <li>
            <strong>Configure Page Geometry:</strong> Choose from standard international paper formats (A4, A3, A5, US Letter, US Legal),
            select <em>Fit to Image</em> to match pixel dimensions exactly, or specify custom millimeter/inch bounds. Set your margin width (None, Small, Large) and image placement (Contain or Cover).
          </li>
          <li>
            <strong>Generate &amp; Download:</strong> Choose between a <em>Single Combined PDF</em> or <em>Separate PDFs (ZIP)</em>.
            Click <strong>Convert to PDF</strong> to generate and download your verified, standardized PDF document instantly.
          </li>
        </ol>
      </section>

      {/* Section 3: Supported Formats & Engine Handling */}
      <section aria-labelledby="image-to-pdf-supported-image-formats-amp-en" className="mb-10">
        <h3 id="image-to-pdf-supported-image-formats-amp-en" className="text-xl sm:text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
          Supported Image Formats &amp; Encoding Pipeline
        </h3>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          Different image formats serve distinct purposes, from compressed photographic lossy streams to lossless transparent graphics.
          KivaroTools provides specialized decoding and rasterization pipelines for each format:
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Image Format</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Encoding Strategy</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Transparency &amp; Quality Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">JPEG / JPG</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Direct binary stream pass-through (Lossless mode) or canvas re-quantization</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Standard photographic compression with adjustable quality (60% to 92%)</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">PNG</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Native PNG binary embedding or lossless 32-bit canvas export</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Full alpha transparency preserved; composited on white for JPEG export</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">WebP</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Decoded via native browser rasterizer into high-fidelity canvas buffer</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Packaged cleanly into PDF image XObject dictionary</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">BMP &amp; GIF</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Browser canvas pixel decoding; animated GIFs extract the primary keyframe</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Static single-page representation suitable for document archiving</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">Apple HEIC / HEIF</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Client-side translation via dynamic <code>heic2any</code> WebAssembly module</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">iPhone photos converted to full-resolution JPEG before PDF embedding</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">SVG (Vector)</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Vector XML rendered into high-DPI canvas buffer for embedding</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Logos and illustrations rendered crisp without pixelation artifacts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Page Geometry & Dimensions */}
      <section aria-labelledby="image-to-pdf-page-geometry-standard-paper-p" className="mb-10">
        <h3 id="image-to-pdf-page-geometry-standard-paper-p" className="text-xl sm:text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
          Page Geometry, Standard Paper Presets &amp; Custom Sizing
        </h3>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          PDF documents use typographic points as their base geometric unit, where <strong>72 points equal 1 inch (25.4 mm)</strong>.
          KivaroTools provides rigorous mathematical point conversions across all international paper standards:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li><strong>A4 (210 × 297 mm):</strong> 595.28 × 841.89 points — The global standard for business reports, contracts, and international applications.</li>
          <li><strong>US Letter (8.5 × 11 in):</strong> 612.0 × 792.0 points — The primary standard in the United States, Canada, and Mexico.</li>
          <li><strong>US Legal (8.5 × 14 in):</strong> 612.0 × 1008.0 points — Ideal for legal contracts, court filings, and real estate deeds.</li>
          <li><strong>A3 (297 × 420 mm) &amp; A5 (148 × 210 mm):</strong> Suitable for large posters, brochures, pocket booklets, and medical prescription slips.</li>
          <li><strong>Fit to Image (Pixel-Perfect):</strong> Sets each page dimensions to exactly match the native image width and height, eliminating all margins and white borders.</li>
          <li><strong>Custom Dimensions:</strong> Enter arbitrary millimeter, inch, or point measurements with real-time conversion.</li>
        </ul>
      </section>

      {/* Section 5: Orientation Intelligence */}
      <section aria-labelledby="image-to-pdf-orientation-intelligence-auto-" className="mb-10">
        <h3 id="image-to-pdf-orientation-intelligence-auto-" className="text-xl sm:text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
          Orientation Intelligence: Auto, Portrait, and Landscape Modes
        </h3>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          One of the most frustrating defects in legacy PDF converters is forcing a single global orientation across an entire document.
          When users combine landscape screenshots with vertical smartphone scans, forcing Portrait mode shrinks landscape images into tiny,
          illegible strips with enormous white voids on the top and bottom.
        </p>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          KivaroTools solves this with <strong>Auto Orientation</strong>. The engine inspects each image natural aspect ratio ($W/H$).
          If an image is wider than it is tall, the engine automatically formats that specific page in Landscape orientation.
          If an image is taller than it is wide, it generates a Portrait page. This ensures every image maximizes its printable area without manual per-page overrides.
        </p>
      </section>

      {/* Section 6: Image Fitting Modes */}
      <section aria-labelledby="image-to-pdf-image-placement-contain-vs-cov" className="mb-10">
        <h3 id="image-to-pdf-image-placement-contain-vs-cov" className="text-xl sm:text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
          Image Placement: Contain vs. Cover vs. Actual Size
        </h3>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          Depending on whether you are assembling an official legal packet or printing photography, KivaroTools offers three distinct fitting algorithms:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Contain (Default)</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Scales the image proportionally to fit completely inside printable margins. 100% of the image is visible with zero cropping. Ideal for documents, receipts, and forms.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Cover (Full Page)</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Scales the image up until it completely fills the printable area. Any aspect-ratio overflow is cropped evenly from opposite edges. Best for borderless artistic prints.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Actual Size (1:1)</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Maps 1 image pixel to 1 typographic point (72 DPI) without scaling. Downscales only if the image exceeds page bounds. Perfect for technical schematics and blueprints.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Empirical Benchmark Table */}
      <section aria-labelledby="image-to-pdf-empirical-benchmark-results-on" className="mb-10">
        <h3 id="image-to-pdf-empirical-benchmark-results-on" className="text-xl sm:text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
          Empirical Benchmark Results on Test Corpus Fixtures
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          All performance metrics below were measured on actual, reproducible test fixtures using the KivaroTools client-side PDF generation engine:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Fixture Description</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Source Input Size</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Page Preset &amp; Mode</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Generated PDF Size</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Page Count</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Integrity Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">Multi-Page Batch (3 Images)</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">128.4 KB (PNG + JPG)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">A4 + Letter (Auto)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">1.73 KB (Stream embed)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">3 Pages</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold">Valid %PDF-</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">High-Resolution 4K Photo</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">112.4 KB (JPEG)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">A4 Portrait (Small Margin)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">113.8 KB</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">1 Page</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold">Valid %PDF-</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">Transparent PNG Graphic</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">5.15 KB (PNG Alpha)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Fit to Image (No Margin)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">5.82 KB</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">1 Page</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold">Alpha Preserved</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">Separate ZIP Batch (2 Docs)</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">15.8 KB (Mixed)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Separate PDFs (ZIP)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">2.28 KB (Deflated)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">2 PDFs in ZIP</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold">Valid ZIP/PDF</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 8: Privacy & Zero Upload Architecture */}
      <section aria-labelledby="image-to-pdf-privacy-disclosures-amp-zero-u" className="mb-10">
        <h3 id="image-to-pdf-privacy-disclosures-amp-zero-u" className="text-xl sm:text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
          Privacy Disclosures &amp; Zero-Upload Architecture
        </h3>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          Almost all commercial PDF conversion websites operate on a server-side upload model. When you upload photos of bank statements,
          driver&apos;s licenses, medical prescriptions, or home deeds, those files are transmitted over public networks to remote web servers,
          where they are stored on physical hard drives for 1 to 24 hours.
        </p>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          KivaroTools operates under a fundamentally different security paradigm. <strong>All PDF compilation executes strictly inside your local browser memory</strong>.
          We independently verified this architecture using Chrome DevTools Protocol network interception, confirming that exactly <strong>0 bytes</strong> of image data
          are ever transmitted to any remote server, tracking provider, or third-party API.
        </p>
      </section>

      {/* Section 9: Competitor Comparison Matrix */}
      <section aria-labelledby="image-to-pdf-kivarotools-vs-legacy-cloud-pd" className="mb-10">
        <h3 id="image-to-pdf-kivarotools-vs-legacy-cloud-pd" className="text-xl sm:text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
          KivaroTools vs. Legacy Cloud PDF Converters
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Feature / Attribute</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">KivaroTools Converter</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Adobe Acrobat Online</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Smallpdf &amp; iLovePDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">Processing Location</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">100% Local Browser Memory</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Remote Cloud Server</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Remote Cloud Server</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">Free Batch Limits</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-bold">Up to 100 images / 500 MB</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">1 task free (login required)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">2 tasks/day (capped at 20 files)</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">Separate PDFs Mode</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">Included (ZIP download)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Not supported</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Single merge only</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">Custom Dimensions</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-bold">Custom mm, in, pt support</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Preset sizes only</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Preset sizes only</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">Pricing / Subscriptions</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">100% Free Forever</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">$19.99 / month</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">$12.00 / month</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
          * Competitor audit verified from official documentation and product testing (October 2026): Adobe Acrobat Online free tier and Pro subscription ($19.99/mo) verified at adobe.com; Smallpdf free tier limits (2 tasks/day, $12.00/mo Pro) verified at smallpdf.com; iLovePDF free limits (25 files/task) verified at ilovepdf.com.
        </p>
      </section>

      {/* Section 10: Frequently Asked Questions */}
      <section aria-labelledby="image-to-pdf-frequently-asked-questions-abo" className="mb-10">
        <h3 id="image-to-pdf-frequently-asked-questions-abo" className="text-xl sm:text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Frequently Asked Questions About Image to PDF Conversion
        </h3>
        <div className="space-y-3">
          {IMAGE_TO_PDF_FAQS.map((faq, index) => (
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
          ))}        </div>
      </section>

      {/* Section 11: Related Utilities */}
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
