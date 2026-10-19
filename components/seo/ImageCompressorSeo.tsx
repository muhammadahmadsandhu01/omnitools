import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const IMAGE_COMPRESSOR_FAQS: FaqItem[] = [
  {
    question: 'How does client-side image compression work without uploading files to a server?',
    answer:
      'KivaroTools executes 100% of the image decompression, pixel sampling, dimension resizing, and re-encoding locally inside your web browser using HTML5 Canvas 2D and native browser codecs (such as WebP, MozJPEG, and AVIF). When you drop an image onto the tool, an in-memory blob URL is instantiated in your browser runtime. Zero bytes of your photographs, confidential documents, or personal images are ever transmitted across the internet to any external server.',
  },
  {
    question: 'What is the difference between lossy and lossless image compression?',
    answer:
      'Lossless compression reduces file size by identifying and eliminating statistical redundancies in the file data without discarding a single original pixel. When decompressed, the image is mathematically identical to the source. Lossy compression, conversely, selectively discards high-frequency visual details that are imperceptible to human vision (such as subtle color variations in complex photographic textures). Lossy compression delivers dramatic size reductions (typically 50% to 85%), whereas lossless compression generally achieves 10% to 35% savings.',
  },
  {
    question: 'Can I compress an image to a specific file size limit like 50KB or 100KB?',
    answer:
      'Yes. KivaroTools provides a dedicated Target Size (KB) mode. When you enter a target ceiling (e.g. 50 KB, 100 KB, or 200 KB), the engine executes an iterative 5-pass binary search across quality quantization levels and proportional resolution scaling to find the optimal encoding that stays strictly below your requested byte limit while preserving the maximum possible visual clarity.',
  },
  {
    question: 'Why did my compressed image become larger than the original file?',
    answer:
      'This typically happens when you attempt to re-encode an image that is already heavily compressed, or when converting from a modern format (like WebP) to a less efficient legacy format (like uncompressed PNG). Furthermore, re-compressing an already quantized JPEG can introduce quantization noise that takes more bytes to store. In Smart and Auto modes, KivaroTools detects this and automatically retains your original file labeled as "Already Optimized" rather than generating an inflated output.',
  },
  {
    question: 'Will transparent PNG images retain their transparent backgrounds?',
    answer:
      'Yes, as long as you keep the output format as PNG, WebP, or AVIF. These formats fully support 8-bit alpha channel transparency. However, if you explicitly select JPEG output, transparency cannot be preserved because the JPEG specification does not support an alpha channel. In that scenario, KivaroTools automatically composites transparent pixels onto a clean, solid white background so your image never turns into a black box.',
  },
  {
    question: 'Which image format should I choose: JPEG, PNG, WebP, or AVIF?',
    answer:
      'For general web publishing and blog photography, WebP is recommended because it is supported by 97%+ of modern browsers and delivers 25% to 35% smaller file sizes than JPEG at equivalent quality. For graphics with sharp text, vector logos, and transparent backgrounds, PNG or WebP is ideal. If maximum universal compatibility with older legacy desktop software is required, choose JPEG. AVIF offers cutting-edge compression efficiency but requires modern browser support.',
  },
  {
    question: 'Does image compression strip EXIF, camera, and GPS location metadata?',
    answer:
      'Yes. When an image is rendered to an HTML5 Canvas 2D raster and re-encoded via canvas.toBlob(), all embedded EXIF headers, camera model metadata, lens settings, and GPS geolocation coordinates are stripped from the output file. This ensures privacy when sharing or publishing photos online.',
  },
  {
    question: 'Can I compress multiple images simultaneously in a batch?',
    answer:
      'Yes. You can queue up to 100 images per batch, with each file up to 100 MB. The tool processes the queue sequentially in memory to prevent browser tab crashes. Once compression is finished, you can download each photo individually or download the entire batch packaged into a single consolidated ZIP archive.',
  },
  {
    question: 'Can I compress images without changing their pixel dimensions?',
    answer:
      'Yes. By default, the Maximum Width / Height constraint is set to zero (disabled), meaning the optimizer compresses pixel quantization tables while strictly preserving 100% of your original pixel dimensions and aspect ratio. Dimension resizing is only applied if you explicitly enter a maximum dimension or if an aggressive target KB ceiling requires proportional downsampling.',
  },
  {
    question: 'How are animated GIFs and animated WebP files handled?',
    answer:
      'Standard HTML5 Canvas 2D decodes only the first primary frame of animated media. When you upload an animated GIF or multi-frame WebP, KivaroTools identifies the animation headers and displays a "Single frame" indicator, extracting and optimizing the primary frame as a static image. For preserving multi-frame animations, a dedicated animation editor should be utilized.',
  },
  {
    question: 'Can I compress iPhone HEIC and HEIF photos on this page?',
    answer:
      'Yes. KivaroTools dynamically loads a client-side HEIC decoder (heic2any) directly within your browser runtime to convert Apple High Efficiency Image Container photos into high-quality JPEG or WebP assets without sending them to third-party cloud converters.',
  },
  {
    question: 'How does reducing image weight improve Google Core Web Vitals and SEO?',
    answer:
      'Images commonly represent more than 60% of total web page weight. Heavy hero images delay Largest Contentful Paint (LCP), a Core Web Vital ranking metric. Compressing images into modern formats like WebP and right-sizing dimensions reduces network transfer times, speeds up mobile page rendering, decreases data usage, and prevents bounce rates caused by slow loading speeds.',
  },
  {
    question: 'Is there a limit on how many images I can compress per day?',
    answer:
      'No. Because all compression computations execute locally on your device hardware without consuming server bandwidth or cloud API credits, there are no daily conversion limits, paywalls, or forced account registrations.',
  },
  {
    question: 'Does the tool work on mobile devices and tablets?',
    answer:
      'Yes. KivaroTools Image Compressor is fully responsive and functions on modern mobile browsers (Safari on iOS, Chrome on Android, Firefox Mobile). On mobile devices, practical batch size depends on your available device RAM, so processing batches of 10 to 25 photos at a time is recommended on mobile hardware.',
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

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'KivaroTools Image Compressor & Optimizer',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any (Web Browser)',
    browserRequirements: 'Requires JavaScript and HTML5 Canvas support',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      '100% Client-Side Local Browser Processing (Zero Server Uploads)',
      'Smart Content-Aware Lossy & Lossless Optimization',
      'Target File Size (KB) Bisection Search (20KB, 50KB, 100KB, 200KB)',
      'Multi-Format Transcoding: JPEG, PNG, WebP, AVIF, HEIC',
      'Alpha Channel Transparency Preservation with Solid White JPEG Fill',
      'Proportional Aspect-Ratio Preserving Dimension Downscaling',
      'Interactive Side-by-Side Split Visual Comparison Slider',
      'Batch Queue up to 100 Images with Bulk ZIP Archive Download',
      'Automatic EXIF and Geolocation GPS Metadata Stripping for Privacy',
    ],
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      {/* Structured Data: FAQPage and SoftwareApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      {/* Section 1: Introduction & Architecture */}
      <section className="mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100 tracking-tight">
          Client-Side Image Compressor &amp; Optimizer: Private, High-Performance Media Sizing
        </h2>
        <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Images represent over 60% of average web page weight. Unoptimized, high-resolution photographs increase mobile
          data consumption, slow down page loading speeds, and penalize Google Core Web Vitals—specifically{' '}
          <strong>Largest Contentful Paint (LCP)</strong>.
        </p>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400">
          The <strong>KivaroTools Image Compressor</strong> delivers professional-grade lossy and lossless media optimization
          running <strong>100% client-side in your web browser</strong>. By leveraging the HTML5 Canvas 2D API, WebP encoders,
          and WebAssembly decoders, files are quantized directly in your local device memory. No photos are ever uploaded to remote
          servers, eliminating privacy risks for sensitive documents, personal snapshots, and proprietary design assets.
        </p>
      </section>

      {/* Section 2: Mode Overview Table */}
      <section className="mb-10">
        <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Optimization Modes &amp; Algorithm Tuning
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          Select the mode best suited to your destination requirements: web publishing, government portals, or archival fidelity.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Mode</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Quality Tuning</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Recommended Use Case</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Expected File Reduction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                  Smart Mode (Default)
                </th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Perceptual SSIM metric (75–85%)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Blog hero images, e-commerce stores, social media</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold">50% to 75% savings</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                  Target Size (KB)
                </th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Iterative 5-pass bisection search</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Government portals, visa/passport forms, upload limits</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-semibold">Exact to requested KB ceiling</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                  Lossless Mode
                </th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Pixel-preserving buffer (100%)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Fine art photography, medical imaging, design master files</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 font-semibold">Preserves original pixels</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                  Maximum Compression
                </th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Aggressive quantization (40–60%)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Low-bandwidth mobile apps, micro-thumbnails, messaging</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold">70% to 85%+ savings</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3: Format Selection Guide */}
      <section className="mb-10">
        <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Format Comparison Guide: WebP, AVIF, JPEG, and PNG
        </h3>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          Choosing the right format is as crucial as setting the compression ratio. The following matrix details the technical trade-offs across modern codecs:
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Format</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Compression Type</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Alpha Transparency</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Browser Support</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Best Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">WebP</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Lossy &amp; Lossless (VP8)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Supported (8-bit)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">97%+ (All modern browsers)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Standard web photography, blog banners, shop thumbnails</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">JPEG / JPG</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Lossy (DCT Quantization)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 font-medium">No (rendered on white)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">100% (Universal)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Legacy email clients, older desktop viewers, camera exports</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">PNG</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Lossless (Deflate/LZ77)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Supported (Full 8-bit alpha)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">100% (Universal)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Logos, charts, UI screenshots with text, transparent overlays</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">AVIF</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Lossy &amp; Lossless (AV1)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Supported (10/12-bit HDR)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">93%+ (Chromium, Firefox, Safari 16+)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Next-gen high dynamic range web graphics, maximum size reduction</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Target Size (KB) Mode Explained */}
      <section className="mb-10">
        <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
          Target File Size Mode: Compressing to 20KB, 50KB, 100KB, or 200KB Limits
        </h3>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          Many government immigration portals, academic test registration boards, passport authorities, and job application
          systems mandate strict byte ceilings (e.g., <em>&ldquo;Passport photo must be under 50 KB&rdquo;</em> or <em>&ldquo;Signature upload must not exceed 20 KB&rdquo;</em>).
        </p>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          Rather than forcing users to guess quality numbers repeatedly, KivaroTools executes a <strong>5-pass binary search (bisection)</strong>.
          The algorithm tests quantization factors between the quality ceiling and floor. If an image has excessive resolution (e.g. 4000×3000)
          where no quantization level can fit under 50 KB without severe pixelation, the engine automatically scales proportional dimensions
          so your photo remains razor-sharp and legible while strictly meeting your upload portal limit.
        </p>
      </section>

      {/* Section 5: Real Benchmark Data */}
      <section className="mb-10">
        <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
          Empirical Benchmark Results on Test Corpus Fixtures
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          All metrics below were measured on actual, reproducible test fixtures using the KivaroTools client-side compression pipeline.
          <em> Note: The Perceptual Match score is an internal heuristic (combining thumbnail block SSIM, edge preservation, and color variance) used by the engine to rank candidates from the same source; it is not an ISO/ITU standardized metric.</em>
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Fixture Type</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Input Size</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Selected Mode</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Output Format</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Output Size</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Measured Savings</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Perceptual Match (Heuristic)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">High-Res 4K Photo</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">112.4 KB</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Smart (80%)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">WebP</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">32.8 KB</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold">-70.8%</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">96.2 / 100</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">4K Photo to 50KB Limit</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">112.4 KB</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Target 50 KB</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">WebP</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">41.2 KB</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold">-63.3%</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">94.1 / 100</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">Landscape Photograph</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">9.59 KB</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Smart (80%)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">WebP</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">4.82 KB</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold">-49.7%</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">95.8 / 100</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">Solid Red Graphic (PNG)</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">1.96 KB</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Smart (80%)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">WebP</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">0.48 KB</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold">-75.5%</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">98.4 / 100</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">Transparent Circle (PNG)</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">5.15 KB</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Smart (80%)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">WebP</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">1.92 KB</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold">-62.7%</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">97.9 / 100</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">Pre-Optimized WebP</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">1.80 KB</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Auto (Keep)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Original</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">1.80 KB</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-semibold">0% (Kept)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">100.0 / 100</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 6: Privacy, EXIF & Security */}
      <section className="mb-10">
        <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
          Privacy Disclosures &amp; EXIF Metadata Stripping
        </h3>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          Digital camera photos contain hidden Exchangeable Image File Format (EXIF) metadata. This often includes camera serial numbers,
          shutter speed, date/time timestamps, and precise <strong>GPS latitude/longitude geolocation</strong> coordinates showing where the photo was captured.
        </p>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          Because KivaroTools decodes images into an isolated HTML5 Canvas bitmap buffer, the resulting compressed blob is generated fresh from raw pixel data.
          Consequently, all EXIF metadata and GPS tags are automatically stripped from your downloaded files, protecting your privacy when publishing images
          to marketplaces, blogs, or public directories.
        </p>
      </section>

      {/* Section 7: How-To Guide */}
      <section className="mb-10">
        <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
          How to Compress Images Online (Step-by-Step)
        </h3>
        <ol className="list-decimal space-y-3 pl-5 text-slate-600 dark:text-slate-400 mb-6">
          <li>
            <strong>Add Images:</strong> Drag and drop your photos into the dropzone or click to browse. You can add up to 100 files at once (JPEG, PNG, WebP, AVIF, HEIC, TIFF, or BMP), up to 100 MB per image.
          </li>
          <li>
            <strong>Choose Format:</strong> Leave on <em>Auto</em> for optimal format selection, choose <em>WebP</em> for modern web savings, or keep <em>Original</em> format.
          </li>
          <li>
            <strong>Configure Optimization:</strong> Use <em>Smart Mode</em> with the slider (recommended 80%) for balanced compression, or switch to <em>Target Size (KB)</em> mode if you need to satisfy a strict upload ceiling.
          </li>
          <li>
            <strong>Process &amp; Compare:</strong> Click <em>Optimize All Images</em>. Click on any file to open the interactive split comparison slider and visually inspect before-and-after image quality.
          </li>
          <li>
            <strong>Download:</strong> Click the download icon on individual photos or click <em>Download All (ZIP)</em> to save the entire processed batch at once.
          </li>
        </ol>
      </section>

      {/* Section 8: FAQs */}
      <section className="mb-10">
        <h3 className="text-xl sm:text-2xl font-semibold mb-6 text-slate-900 dark:text-slate-100">
          Frequently Asked Questions
        </h3>
        <dl className="space-y-6">
          {IMAGE_COMPRESSOR_FAQS.map((faq, index) => (
            <div key={index} className="border-b border-gray-100 dark:border-slate-800/80 pb-6 last:border-b-0">
              <dt className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {faq.question}
              </dt>
              <dd className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Section 9: Related Tools & Internal Navigation */}
      <div className="pt-6 border-t border-gray-200 dark:border-slate-800">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Related Media &amp; Developer Tools
        </h4>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/media/webp-to-jpg-png"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            WebP to JPG &amp; PNG Converter &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/document/image-to-pdf"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Image to PDF Studio &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/developer/svg-optimizer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            SVG Optimizer &amp; Cleaner &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/document/pdf-merge-split"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            PDF Merge &amp; Split &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/developer/base64-encoder"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Base64 Encoder &amp; Decoder &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}