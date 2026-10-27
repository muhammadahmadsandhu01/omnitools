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
      'Yes. KivaroTools provides a dedicated Target Size (KB) mode. When you enter a target ceiling (e.g. 10 KB, 20 KB, 30 KB, 40 KB, 50 KB, 100 KB, 200 KB, 300 KB, 500 KB, 1 MB, or 2 MB), the engine executes an iterative 5-pass binary search across quality quantization levels and proportional resolution scaling (testing 92%, 84%, and 74% downscaled steps if full dimensions cannot fit) to find the optimal encoding that stays strictly below your requested byte limit while preserving the maximum possible visual clarity.',
  },
  {
    question: 'Why did my compressed image become larger than the original file?',
    answer:
      'This typically happens when you attempt to re-encode an image that is already heavily compressed, or when converting from a modern format (like WebP) to a less efficient legacy format (like uncompressed PNG). Furthermore, re-compressing an already quantized JPEG can introduce quantization noise that takes more bytes to store. In Smart and Auto modes, KivaroTools detects this and automatically retains your original file labeled as "Already Optimized" rather than generating an inflated output.',
  },
  {
    question: 'Will transparent PNG images retain their transparent backgrounds?',
    answer:
      'Yes, as long as you keep the output format as PNG, WebP, or AVIF. These formats fully support 8-bit alpha channel transparency. However, if you explicitly select JPEG output, transparency cannot be preserved because the JPEG specification does not support an alpha channel. In that scenario, KivaroTools automatically composites transparent pixels onto a clean, solid white background (#ffffff) so your image never turns into a black box or exhibits ugly dark fringing.',
  },
  {
    question: 'Which image format should I choose: JPEG, PNG, WebP, or AVIF?',
    answer:
      'For general web publishing and blog photography, WebP is recommended because it is supported by 97%+ of modern browsers and delivers 25% to 35% smaller file sizes than JPEG at equivalent quality. For graphics with sharp text, vector logos, and transparent backgrounds, PNG or WebP is ideal. If maximum universal compatibility with older legacy desktop software is required, choose JPEG. AVIF offers cutting-edge compression efficiency (saving 30% to 50% over JPEG) but requires modern browser support.',
  },
  {
    question: 'Does image compression strip EXIF, camera, and GPS location metadata?',
    answer:
      'Yes. When an image is rendered to an HTML5 Canvas 2D raster and re-encoded via canvas.toBlob() or canvas.toDataURL(), all embedded EXIF headers, camera model metadata, lens settings, timestamps, and GPS geolocation coordinates are stripped from the output file. This ensures privacy when sharing or publishing photos online and saves valuable kilobytes.',
  },
  {
    question: 'Can I compress multiple images simultaneously in a batch?',
    answer:
      'Yes. You can queue up to 100 images per batch, with each file up to 100 MB (up to 10 GB total queue capacity). The tool processes the queue sequentially in memory with automatic URL.revokeObjectURL() garbage collection to prevent browser tab crashes. Once compression is finished, you can download each photo individually or download the entire batch packaged into a single consolidated ZIP archive (KivaroTools_Optimized_Images.zip).',
  },
  {
    question: 'Can I compress images without changing their pixel dimensions?',
    answer:
      'Yes. By default, the Maximum Width / Height constraint is set to zero (Keep Original), meaning the optimizer compresses pixel quantization tables while strictly preserving 100% of your original pixel dimensions and aspect ratio. Dimension resizing is only applied if you explicitly choose one of the 9 aspect-ratio-locked presets (4096px, 3000px, 2560px, 2048px, 1920px, 1600px, 1280px, or 1024px) or if an aggressive target KB ceiling requires proportional downsampling.',
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
  {
    question: 'How is the perceptual quality match score (0 to 100) calculated, and how does Smart Mode choose the best compression candidate?',
    answer:
      'KivaroTools computes a multi-metric 0–100 Perceptual Quality Match score by sampling both source and compressed bitmaps onto a 160×160 analysis canvas using canvas.getContext(\'2d\', { willReadFrequently: true }). The scoring algorithm blends Structural Similarity (SSIM 16×16 luminance and covariance blocks at 0.34 weight), Sobel spatial edge energy gradient preservation (0.24 weight), Mean Absolute Error (MAE at 0.20 weight), Normalized RGB Color Error (0.12 weight), and Root Mean Square Error (RMSE at 0.10 weight). In Smart Mode, an automated 4-class classifier categorizes content into photos, text-graphics, transparent-graphics, or graphics. Photos require a perceptual score >= 88 while text-graphics require >= 92 to guarantee razor-sharp letterforms. Candidates within a 1.5-point equivalence band are ranked, and the engine automatically outputs the candidate with the smallest byte size.',
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

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Compress and Optimize Images Online Client-Side',
    description:
      'Step-by-step guide to compress JPG, PNG, WebP, AVIF, HEIC, and TIFF images up to 100MB with perceptual SSIM scoring and target KB sizing.',
    totalTime: 'PT30S',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Add Images to Batch Queue',
        text: 'Drag and drop your photos into the dropzone or click to browse. Queue up to 100 files (JPEG, PNG, WebP, AVIF, HEIC, TIFF, BMP, RAW, DNG, ICO) up to 100 MB per image.',
        url: 'https://kivarotools.com/media/image-compressor#step-1',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Choose Output Format',
        text: 'Select Auto for smart content-aware codec routing (AVIF/WebP/JPEG for photos, WebP/AVIF/PNG for graphics), choose WebP or AVIF for maximum web savings, or keep Original format.',
        url: 'https://kivarotools.com/media/image-compressor#step-2',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Configure Optimization Mode & Dimension Constraints',
        text: 'Select Smart Mode with adjustable Quality Ceiling (80% default), Target Size (KB) mode for strict portal limits (10 KB to 100 MB), Maximum Compression, or Lossless mode, and optionally choose an aspect-ratio-locked max dimension preset (1024px to 4096px).',
        url: 'https://kivarotools.com/media/image-compressor#step-3',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Process & Compare with Before/After Slider',
        text: 'Click Optimize All Images to run client-side quantization. Inspect live telemetry (KB saved, % reduction, perceptual match score) and click any item to open the interactive split-screen Before/After slider to verify visual quality.',
        url: 'https://kivarotools.com/media/image-compressor#step-4',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Download Individual Files or Consolidated ZIP',
        text: 'Download individual optimized images directly or click Download All (ZIP) to export the entire processed batch packaged into KivaroTools_Optimized_Images.zip in browser memory.',
        url: 'https://kivarotools.com/media/image-compressor#step-5',
      },
    ],
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      {/* Structured Data: FAQPage & HowTo */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* Section 1: Introduction & Architecture */}
      <section aria-labelledby="image-compressor-client-side-image-compressor-a" className="mb-10">
        <h2 id="image-compressor-client-side-image-compressor-a" className="text-2xl sm:text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100 tracking-tight">
          Client-Side Image Compressor &amp; Optimizer: Private, High-Performance Media Sizing
        </h2>
        <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
          <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
            <strong>Privacy First &amp; Secure:</strong> All image compression, pixel quantization, dimension downsampling, and format transcoding execute 100% locally in your web browser runtime. No files, pixels, or EXIF metadata are ever uploaded to remote servers or cloud processing queues.
          </p>
        </blockquote>
        <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Images represent over 60% of average web page weight. Unoptimized, high-resolution photographs increase mobile
          data consumption, slow down page loading speeds, and penalize Google Core Web Vitals—specifically{' '}
          <strong>Largest Contentful Paint (LCP)</strong>. Compressing high-resolution photos and graphics into modern formats like
          WebP and AVIF cuts bandwidth payloads by 50% to 85% while preserving pristine visual clarity.
        </p>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400">
          The <strong>KivaroTools Image Compressor</strong> delivers professional-grade lossy and lossless media optimization
          running <strong>100% client-side in your web browser</strong>. By leveraging the HTML5 Canvas 2D API, WebP encoders,
          hardware-accelerated AVIF capabilities, and dynamic WebAssembly decoders (such as <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">heic2any</code> for Apple iPhone photos),
          files are quantized directly in your local device memory. Whether you need to compress images under 50KB for government forms,
          optimize e-commerce product catalogs for Shopify and WooCommerce, or shrink 48MP camera RAW and TIFF exports for web publishing,
          KivaroTools achieves superior compression without third-party cloud queues, privacy compromises, or file counters.
        </p>
      </section>

      {/* Section 2: Mode Overview Table */}
      <section aria-labelledby="image-compressor-optimization-modes-amp-algorit" className="mb-10">
        <h2 id="image-compressor-optimization-modes-amp-algorit" className="text-xl sm:text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Optimization Modes &amp; Algorithm Tuning
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          Select the optimization mode best suited to your destination requirements: web publishing, strict upload portals, or lossless archival fidelity.
        </p>
        <div className="w-full overflow-x-auto overscroll-x-contain">
          <table className="min-w-[640px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
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
      <section aria-labelledby="image-compressor-format-comparison-guide-webp-a" className="mb-10">
        <h2 id="image-compressor-format-comparison-guide-webp-a" className="text-xl sm:text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Format Comparison Guide: WebP, AVIF, JPEG, and PNG
        </h2>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          Choosing the right format is as crucial as setting the compression ratio. The following matrix details the technical trade-offs across modern codecs:
        </p>
        <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
          <table className="min-w-[640px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
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
      <section aria-labelledby="image-compressor-target-file-size-mode-compress" className="mb-10">
        <h2 id="image-compressor-target-file-size-mode-compress" className="text-xl sm:text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
          Target File Size Mode: Compressing to 20KB, 50KB, 100KB, or 200KB Limits
        </h2>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          Many government immigration portals, academic test registration boards, passport authorities, and job application
          systems mandate strict byte ceilings (e.g., <em>&ldquo;Passport photo must be under 50 KB&rdquo;</em>, <em>&ldquo;Candidate signature must be between 10 KB and 20 KB&rdquo;</em>, or <em>&ldquo;Document scan must not exceed 200 KB&rdquo;</em>).
        </p>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          Rather than forcing users to guess quality numbers repeatedly, KivaroTools executes a <strong>5-pass binary search (bisection solver)</strong>.
          The algorithm tests quantization factors between the quality floor and quality ceiling. If an image has excessive resolution (e.g. a 4000×3000 DSLR capture)
          where no quantization level can fit under 50 KB without severe blockiness, the engine automatically tests proportional downscaled dimensions
          (<strong>92%</strong>, <strong>84%</strong>, and <strong>74%</strong>) so your photo remains sharp and legible while strictly meeting your upload portal limit.
        </p>
      </section>

      {/* Section 5: Real Benchmark Data */}
      <section aria-labelledby="image-compressor-empirical-benchmark-results-on" className="mb-10">
        <h2 id="image-compressor-empirical-benchmark-results-on" className="text-xl sm:text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
          Empirical Benchmark Results on Test Corpus Fixtures
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          All metrics below were measured on actual, reproducible test fixtures using the KivaroTools client-side compression pipeline.
          <em> Note: The Perceptual Match score is an internal heuristic (combining thumbnail block SSIM, edge preservation, and color variance) used by the engine to rank candidates from the same source; it is not an ISO/ITU standardized metric.</em>
        </p>
        <div className="w-full overflow-x-auto overscroll-x-contain">
          <table className="min-w-[640px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
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

      {/* Section 6: Architectural Comparison Matrix */}
      <section aria-labelledby="image-compressor-competitor-matrix" className="mb-10">
        <h2 id="image-compressor-competitor-matrix" className="text-xl sm:text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Architectural Comparison: KivaroTools vs. Cloud &amp; Web Image Compressors
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          Most online image compressors upload your sensitive media to remote cloud clusters, impose harsh 5 MB file caps, or limit batch sizes to force paid subscriptions. KivaroTools executes 100% client-side in your browser memory:
        </p>
        <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
          <table className="min-w-[640px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Feature / Capability</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">KivaroTools Image Compressor</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">TinyPNG / TinyJPG</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Google Squoosh</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Compressor.io / iLoveIMG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                  Processing Architecture
                </th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold">
                  100% Client-Side (Canvas 2D / Local Device RAM)
                </td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-rose-600 dark:text-rose-400">
                  Remote Cloud Upload
                </td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">
                  100% Client-Side (WASM)
                </td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-rose-600 dark:text-rose-400">
                  Remote Cloud Upload
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                  Max Batch Capacity
                </th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200">
                  100 Files / 100 MB per file (10 GB queue)
                </td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">
                  20 files max / 5 MB per file
                </td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">
                  Single file only (no batch queue)
                </td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">
                  Limited batch (10–30 files / daily caps)
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                  Target Size (KB) Bisection
                </th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Yes (5-pass binary search + dimension fallback)
                </td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-rose-600 dark:text-rose-400">
                  No (automatic black-box only)
                </td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-rose-600 dark:text-rose-400">
                  No (manual slider trial-and-error)
                </td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-rose-600 dark:text-rose-400">
                  No (fixed percentage presets)
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                  Perceptual Quality Scoring
                </th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200">
                  160×160 multi-metric (SSIM, Sobel, MAE, Color, RMSE)
                </td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">
                  Proprietary quantization (no user metrics)
                </td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">
                  Manual SSIM / Butteraugli inspect
                </td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">
                  None (no visual metric telemetry)
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                  Supported Formats
                </th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200">
                  JPG, PNG, WebP, AVIF, HEIC/HEIF, TIFF, RAW, BMP, ICO
                </td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">
                  WebP, JPEG, PNG only
                </td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">
                  JPEG, PNG, WebP, AVIF, JXL
                </td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">
                  JPEG, PNG, GIF, WebP
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                  Split-Screen Before/After Slider
                </th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Built-in interactive slider (0%–100%)
                </td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-rose-600 dark:text-rose-400">
                  No preview (blind download)
                </td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">
                  Interactive split-screen
                </td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-rose-600 dark:text-rose-400">
                  Limited / None
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 7: Privacy Disclosures & EXIF Metadata Stripping */}
      <section aria-labelledby="image-compressor-privacy-disclosures-amp-exif-m" className="mb-10">
        <h2 id="image-compressor-privacy-disclosures-amp-exif-m" className="text-xl sm:text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
          Privacy Disclosures &amp; EXIF Metadata Stripping
        </h2>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          Digital camera photos contain hidden Exchangeable Image File Format (EXIF) metadata. This often includes camera serial numbers,
          shutter speed, date/time timestamps, camera maker profiles, and precise <strong>GPS latitude/longitude geolocation</strong> coordinates showing where the photo was captured.
        </p>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
          Because KivaroTools decodes images into an isolated HTML5 Canvas bitmap buffer, the resulting compressed blob is generated fresh from raw pixel data.
          Consequently, all EXIF metadata, IPTC headers, and GPS tags are automatically stripped from your downloaded files (<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">stripMetadata = true</code> by default).
          This protects your privacy when publishing images to marketplaces, blogs, or public directories and saves valuable kilobytes on mobile transfer budgets.
        </p>
      </section>

      {/* Section 8: Troubleshooting, Edge Cases & Perceptual Optimization Guide */}
      <section aria-labelledby="image-compressor-troubleshooting-guide" className="mb-10">
        <h2 id="image-compressor-troubleshooting-guide" className="text-xl sm:text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Engineering Diagnostics, Edge Cases &amp; Perceptual Optimization Guide
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-6">
          Client-side in-browser media compression relies on native browser codecs, WebAssembly runtimes, and canvas graphics buffers. Review these 6 diagnostic procedures to handle edge cases smoothly:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              1. The &ldquo;Already Optimized&rdquo; Guard &amp; Byte-Expansion Prevention
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              When re-encoding an image that has already been aggressively compressed (or converting an indexed PNG to JPEG), the new Discrete Cosine Transform (DCT) quantization tables may generate more bytes than the original file. Rather than outputting an inflated payload, KivaroTools compares compressed bytes against source bytes. If compressed output is greater than or equal to source size, the engine activates the <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">already_optimized</code> guard, preserving your original file untouched with 100% fidelity.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              2. 5-Pass Bisection Solver &amp; Resolution Downscaling for Strict KB Limits
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              When targeting strict upload caps (such as 20 KB for signatures or 50 KB for passport portals), a high-resolution 12MP or 48MP photo cannot physically compress below the target at 1:1 dimensions without destroying readability. KivaroTools executes a 5-pass binary search between the quality ceiling and floor. If the file cannot fit at native resolution, it automatically tests proportional downscaling steps (<strong>92%</strong>, <strong>84%</strong>, and <strong>74%</strong>), hitting the exact byte limit while preserving clean lines.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              3. Transparent PNG Handling: WebP/AVIF Alpha vs. JPEG Solid Matte
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Compressing graphics with transparent backgrounds requires choosing the right codec. In <strong>Auto</strong>, <strong>WebP</strong>, or <strong>AVIF</strong> mode, 8-bit alpha transparency is fully preserved with zero background fringing. However, because the JPEG standard lacks an alpha channel, converting a transparent PNG to JPEG automatically composites transparent pixels onto a crisp <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">#ffffff</code> white background matte, preventing black boxes and dark halos around text or logos.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              4. Vector SVG Interception &amp; Dedicated SVG Optimization
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Vector graphics (<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">.svg</code> / <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">image/svg+xml</code>) consist of mathematical XML path coordinates rather than fixed pixel grids. Rasterizing an SVG into a canvas bitmap destroys its infinite scalability and inflates file size. KivaroTools intercepts SVGs upon upload and displays a direct link to the <Link href="/developer/svg-optimizer" className="text-blue-600 dark:text-blue-400 underline font-medium">SVG Optimizer</Link>, which cleans XML tags, strips editor bloat, and minifies vector coordinates without rasterization.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              5. AVIF Hardware Encoding Detection &amp; Seamless WebP Fallback
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              AVIF provides 30% to 50% better compression than JPEG, but client-side browser support for AVIF canvas re-encoding varies across browser versions. KivaroTools executes an instant runtime capability check via <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">canvas.toDataURL(&apos;image/avif&apos;)</code>. If the host browser lacks hardware or software AVIF encoding support, the engine automatically falls back to modern WebP encoding, guaranteeing that your batch compression never fails or stalls.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              6. Client-Side Apple HEIC / HEIF Decoding via Dynamic heic2any
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Modern iPhones capture photos in high-efficiency HEIC / HEIF format (<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">.heic</code>, <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">.heif</code>). Because standard HTML5 canvas cannot decode HEIC natively, KivaroTools dynamically imports the WebAssembly-backed <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">heic2any</code> library only when an HEIC file is detected. The image is unpacked in local memory into an RGBA blob and optimized into WebP or JPEG without sending confidential photos to cloud servers.
            </p>
          </div>
        </div>
      </section>

      {/* Section 9: How-To Guide */}
      <section aria-labelledby="image-compressor-how-to-compress-images-online-" className="mb-10">
        <h2 id="image-compressor-how-to-compress-images-online-" className="text-xl sm:text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
          How to Compress Images Online (Step-by-Step)
        </h2>
        <ol className="list-decimal space-y-3 pl-5 text-slate-600 dark:text-slate-400 mb-6">
          <li id="step-1">
            <strong>Add Images:</strong> Drag and drop your photos into the dropzone or click to browse. You can add up to 100 files at once (JPEG, PNG, WebP, AVIF, HEIC, TIFF, or BMP), up to 100 MB per image.
          </li>
          <li id="step-2">
            <strong>Choose Format:</strong> Leave on <em>Auto</em> for optimal format selection, choose <em>WebP</em> for modern web savings, or keep <em>Original</em> format.
          </li>
          <li id="step-3">
            <strong>Configure Optimization:</strong> Use <em>Smart Mode</em> with the slider (recommended 80%) for balanced compression, or switch to <em>Target Size (KB)</em> mode if you need to satisfy a strict upload ceiling. Optionally select an aspect-ratio-locked max dimension preset (1024px to 4096px).
          </li>
          <li id="step-4">
            <strong>Process &amp; Compare:</strong> Click <em>Optimize All Images</em>. Click on any file to open the interactive split comparison slider and visually inspect before-and-after image quality.
          </li>
          <li id="step-5">
            <strong>Download:</strong> Click the download icon on individual photos or click <em>Download All (ZIP)</em> to save the entire processed batch packaged into <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">KivaroTools_Optimized_Images.zip</code>.
          </li>
        </ol>
      </section>

      {/* Section 10: FAQs */}
      <section aria-labelledby="image-compressor-frequently-asked-questions" className="mb-10">
        <h2 id="image-compressor-frequently-asked-questions" className="text-xl sm:text-2xl font-semibold mb-6 text-slate-900 dark:text-slate-100">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {IMAGE_COMPRESSOR_FAQS.map((faq, index) => (
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
          ))}
        </div>
      </section>

      {/* Section 11: Related Tools & Internal Navigation */}
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