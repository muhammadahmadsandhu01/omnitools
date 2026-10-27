import React from 'react';
import Link from 'next/link';

export const PDF_COMPRESSOR_FAQS = [
  {
    question: 'How does KivaroTools compress PDF files to 50KB, 100KB, 200KB, or 500KB locally in the browser?',
    answer:
      'KivaroTools uses an automated 6-Pass Progressive Target-KB Binary Solver combined with an in-browser PDF 1.5+ Object-Stream optimizer (pdf-lib) and HTML5 Canvas downsampling engine. When you select an exact target like 100 KB or 200 KB, the engine tests progressive resolution tiers (180 DPI down to 60 DPI) and discrete cosine transform (DCT) JPEG quantization levels in browser RAM, halting on the highest-clarity candidate that fits strictly below your target byte ceiling.',
  },
  {
    question: 'Are my confidential PDF documents uploaded to any cloud server during compression?',
    answer:
      'Never. Unlike iLovePDF, Smallpdf, Adobe Acrobat Online, or Pi7 which transmit files to remote cloud servers, KivaroTools processes 100% of the PDF byte streams, XMP metadata stripping, and image downsampling inside your local browser memory via ArrayBuffers. Passports, national identity cards (CNIC/Aadhaar), tax returns, banking statements, and legal contracts never leave your personal computer or mobile device.',
  },
  {
    question: 'What is the difference between Balanced, Exact Target KB, Extreme, and Lossless Vector modes?',
    answer:
      'Lossless Vector Mode preserves 100% of crisp selectable vector text and vector line art while stripping XMP metadata bloat and repacking objects into compressed PDF 1.5+ Object Streams (useObjectStreams: true). Balanced Mode (150 DPI @ 74% quality) shrinks image-heavy reports and scanned PDFs by 50%–70% with Retina screen clarity. Exact Target KB Mode runs the 6-pass solver to meet strict portal upload limits. Extreme Mode (96 DPI @ 50%–58% quality) achieves 75%–90% size reduction for archival storage and email attachment caps.',
  },
  {
    question: 'How does the mathematical Never-Grow Integrity Guard prevent vector PDFs from becoming larger?',
    answer:
      'Basic PDF compressors often inflate pure vector text documents by rasterizing sharp vector glyphs into heavy bitmap images. Our Never-Grow Integrity Guard initializes the output buffer to the smaller of the lossless vector pass or original file (bestBytes = losslessPass.bytes.byteLength < originalBytes ? losslessPass.bytes : pdfBytes). A raster downsampling pass is rejected if its byte size exceeds this baseline (unless grayscale was explicitly requested), guaranteeing output bytes never exceed input bytes.',
  },
  {
    question: 'How does the 6-Pass Progressive Target-KB Candidate Ladder work?',
    answer:
      'When you select or type a target byte ceiling (e.g., 100 KB), the engine tests candidate tiers sequentially: Pass 1 (180 DPI @ 82% quality), Pass 2 (144 DPI @ 70%), Pass 3 (115 DPI @ 56%), Pass 4 (92 DPI @ 44%), Pass 5 (72 DPI @ 30%), and Pass 6 (60 DPI @ 22%). The solver halts immediately on the first pass that fits beneath the target byte limit, ensuring your document retains maximum possible resolution and readability.',
  },
  {
    question: 'Does converting a scanned PDF to 8-Bit ITU-R BT.709 Grayscale reduce file size further?',
    answer:
      'Yes. Enabling the Grayscale Monochrome toggle executes an 8-bit ITU-R BT.709 luminance transform (Luminance = round(0.2126*R + 0.7152*G + 0.0722*B)) on every rendered page canvas. This eliminates color chroma channels from scanned agreements, tax forms, receipts, and university applications, shrinking color-tinted smartphone scans by an additional 30%–45% with high typographical contrast.',
  },
  {
    question: 'What is the Internal PDF Space X-Ray Audit and how does it diagnose file bloat?',
    answer:
      'The Space X-Ray Audit performs non-destructive lexical scanning of internal PDF stream dictionaries (decoding up to 4 MB of text samples via Latin-1). It calculates byte distribution across Embedded Images (/Subtype /Image and /DCTDecode), Content Streams & Fonts, XMP Metadata packets (<x:xmpmeta>), and Cross-Reference (xref) tables, displaying interactive color-coded percentage bars before and after compression.',
  },
  {
    question: 'Can I batch compress multiple PDF files at once and download them as a ZIP archive?',
    answer:
      'Yes. You can drag and drop up to 25 PDF documents simultaneously (up to 500 MB total batch capacity) in PdfCompressor.tsx. Each document is compressed sequentially with individual progress tracking, and you can download files individually or package the entire completed queue into a single DEFLATE-compressed ZIP archive with one click.',
  },
  {
    question: 'How does KivaroTools strip hidden XMP and producer metadata from PDFs for privacy?',
    answer:
      'Desktop publishing software (such as Adobe InDesign, Photoshop, and printer drivers) embeds hundreds of kilobytes of uncompressed XMP XML packets, document editing history, local file system paths, and software producer tags. KivaroTools purges dead incremental-update revisions via cleanDoc.copyPages(), resets document info dictionaries (Title, Author, Subject, Keywords, Creator, Producer), and omits unreferenced metadata.',
  },
  {
    question: 'What should I do if a 50-page scanned document cannot physically fit below a strict 50KB or 100KB cap?',
    answer:
      'Pixel data has mathematical entropy limits; 50 high-resolution pages cannot be compressed below 100 KB (2 KB per page) without severe illegibility. When facing rigid upload portals with multi-page PDFs, use our PDF Merge & Split Tool to extract only the essential pages (e.g., front and back ID cards, or key financial summary pages) before running the Target-KB solver.',
  },
  {
    question: 'Can I preview the visual quality and readability before downloading the compressed PDF?',
    answer:
      'Yes. KivaroTools features an interactive Before vs. After Page 1 Readability Inspector. For any completed file in your queue, you can compare a side-by-side rendering of Page 1 at the applied DPI resolution against the original, verifying that contract clauses, numbers, and signature stamps remain crisp before saving.',
  },
  {
    question: 'Why do pure vector text PDFs shrink less than scanned image PDFs in Lossless Mode?',
    answer:
      'Vector text streams created by modern word processors and LaTeX compilers are already compressed using Flate (zlib) algorithms. In Lossless Mode, vector text glyphs are untouched, and savings (typically 10%–35%) come from stripping redundant XMP metadata and compacting cross-reference tables into PDF 1.5+ Object Streams. Scanned image PDFs, conversely, contain unquantized 300–600 DPI bitmap streams that can shrink by 75%–90% under perceptual downsampling.',
  },
  {
    question: 'Can I compress password-protected or encrypted PDF documents?',
    answer:
      'PDFs with active owner or user encryption (isEncrypted: true) restrict reading internal /Contents streams and object dictionaries. For security and compliance, remove the password using your original PDF viewer or password removal utility before uploading. Corrupted files missing the standard %PDF- header within the first 1,024 bytes are rejected cleanly with a clear diagnostic message.',
  },
  {
    question: 'How does KivaroTools offer unlimited, free compression without watermarks or paywalls?',
    answer:
      'Cloud-based PDF compressors operate expensive GPU server clusters that process gigabytes of customer files, forcing them to impose daily task limits (1–2 files/day), file size caps (15–50 MB), and $12–$20/month subscription paywalls for strong compression. KivaroTools executes on your device CPU via WebAssembly and JavaScript, eliminating server overhead and enabling 100% free, unlimited, watermark-free compression.',
  },
  {
    question: 'How can I chain Compress PDF with other KivaroTools utilities for complete document workflows?',
    answer:
      'You can assemble photos into a PDF using Image to PDF, compress the compiled document with Compress PDF for portal upload, convert tables to spreadsheets via PDF to Excel & CSV, and convert editable sections into Word documents using PDF to Word. All utilities share the same 100% client-side privacy architecture.',
  },
];

export default function PdfCompressorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PDF_COMPRESSOR_FAQS.map((faq) => ({
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
    name: 'How to Compress a PDF File to 50KB, 100KB, 200KB, or 500KB Online Privately',
    description:
      'Step-by-step guide to reducing PDF file size locally in your browser using Balanced, Extreme, Lossless Vector, or 6-Pass Exact Target-KB modes up to 500 MB.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Select Compression Mode or Exact Target KB Preset',
        text: 'Choose Balanced (150 DPI Retina), Extreme (96 DPI), Lossless Vector (100% sharp text), or Exact Target KB mode with built-in presets (50KB, 100KB, 200KB, 300KB, 500KB, 1MB, 2MB) or custom KB input.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Drop Your PDF Files (Up to 25 Files / 500 MB Batch)',
        text: 'Drag and drop up to 25 PDF documents into the upload zone, or click "Load Sample Bloated PDF" to test 1-click optimization on an uncompressed test file.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Inspect the PDF Space X-Ray & Before/After Visual Preview',
        text: 'Review the Space X-Ray byte allocation bars (Images, Text/Fonts, XMP Metadata, Structure) and compare Page 1 text sharpness before and after compression.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Download Compressed PDF or Batch ZIP Archive',
        text: 'Click "Download" to save your optimized PDF immediately, or click "Download All ZIP" to save all completed files in a single DEFLATE archive.',
      },
    ],
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      {/* 1:1 FAQPage & HowTo Structured Data (BreadcrumbList & WebApplication handled globally by page shell) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
        Compress PDF Online Free — Reduce PDF Size to 100KB, 200KB &amp; 500KB Client-Side
      </h2>
      <p>
        The <strong>KivaroTools PDF Compressor</strong> is an enterprise-grade, 100% browser-based PDF size reducer that shrinks oversized PDF documents by up to <strong>90%</strong> without uploading your files to any external cloud server. Whether you need to compress a scanned visa application or passport under <strong>100 KB or 200 KB</strong> for a government portal, optimize a 50 MB corporate report for email attachment limits, or strip hidden XMP metadata bloat from legal filings, our dual-pipeline compression engine delivers deterministic results in seconds.
      </p>

      <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800/60 not-italic">
        <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
          <strong>Privacy First &amp; Secure — 100% Client-Side Execution:</strong> Traditional PDF compressors upload your private bank statements, passports, tax returns, and signed contracts to remote cloud servers. KivaroTools processes every byte locally inside your browser RAM using WebAssembly and HTML5 Canvas—your files never leave your device, ensuring complete compliance with GDPR, HIPAA, and confidential NDA standards.
        </p>
      </blockquote>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        How Our Dual-Pipeline PDF Compression &amp; Optimization Engine Works
      </h2>
      <p>
        A PDF document is a complex binary container housing vector glyph instructions, embedded TrueType/OpenType font subsets, high-resolution raster images (<code>/DCTDecode</code> and <code>/FlateDecode</code> XObjects), XMP XML metadata packets, and cross-reference (<code>xref</code>) tables. Compressing all PDFs with a single blunt method either ruins vector text or fails to shrink scanned images. KivaroTools solves this with <strong>four specialized compression modes</strong>:
      </p>
      <ol>
        <li>
          <strong>Lossless Vector &amp; Object-Stream Optimization:</strong> Rebuilds the document catalog from scratch using <code>pdf-lib</code>, purges orphaned incremental-update objects via <code>cleanDoc.copyPages()</code>, strips verbose XMP/Creator metadata blocks, and packs object dictionaries into compressed PDF 1.5+ Object Streams (<code>useObjectStreams: true, objectsPerTick: 100</code>)—keeping 100% of vector text and original resolution intact.
        </li>
        <li>
          <strong>Balanced Retina Re-Encoding (150 DPI @ 74% Quality):</strong> Downsamples oversized 300–600 DPI scanner images to crisp 150 DPI Retina resolution using perceptual discrete cosine transform (DCT) JPEG quantization, achieving <strong>50%–70% file size reductions</strong> with zero visible loss on desktop or mobile screens.
        </li>
        <li>
          <strong>6-Pass Progressive Target-KB Solver (50KB / 100KB / 200KB / 500KB):</strong> Eliminates manual trial-and-error for strict upload portals. Select your exact ceiling (e.g., <code>100 KB</code> or <code>200 KB</code>) and the solver automatically tests progressive <code>(DPI &times; Quality)</code> candidate tiers in browser RAM until the output PDF fits strictly under your target byte limit.
        </li>
        <li>
          <strong>Extreme Compression + ITU-R BT.709 Grayscale Monochrome:</strong> Converts 24-bit RGB scans into 8-bit luminance grayscale at 96 DPI, shrinking heavy multi-page scanned contracts by up to <strong>75%–90%</strong>.
        </li>
      </ol>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        6-Pass Target-KB Candidate Ladder &amp; Presets Specification
      </h2>
      <p>
        The table below details the mathematical candidate tiers, DPI resolutions, and perceptual JPEG quality constants executed by <code>lib/pdfCompressorEngine.ts</code> during automated Target-KB compression:
      </p>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left border-collapse text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">Solver Candidate</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[130px]">Target Resolution</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[130px]">JPEG Quality</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[140px]">Typical Reduction</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[180px]">Target Portal &amp; Use Case</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Pass 1 (High Clarity)</td>
              <td className="p-3"><code>180 DPI</code></td>
              <td className="p-3"><code>82% (0.82)</code></td>
              <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">35% – 50%</td>
              <td className="p-3">&le; 1 MB / 2 MB portals, high-res corporate presentations</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Pass 2 (Balanced)</td>
              <td className="p-3"><code>144 DPI</code></td>
              <td className="p-3"><code>70% (0.70)</code></td>
              <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">50% – 65%</td>
              <td className="p-3">&le; 500 KB forms, standard web portal uploads, email attachments</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Pass 3 (Compact)</td>
              <td className="p-3"><code>115 DPI</code></td>
              <td className="p-3"><code>56% (0.56)</code></td>
              <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">65% – 75%</td>
              <td className="p-3">&le; 300 KB university admissions, scholarship applications</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Pass 4 (Aggressive)</td>
              <td className="p-3"><code>92 DPI</code></td>
              <td className="p-3"><code>44% (0.44)</code></td>
              <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">75% – 85%</td>
              <td className="p-3">&le; 200 KB embassy visa portals, KYC banking verification</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Pass 5 (Ultra-Compact)</td>
              <td className="p-3"><code>72 DPI</code></td>
              <td className="p-3"><code>30% (0.30)</code></td>
              <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">82% – 90%</td>
              <td className="p-3">&le; 100 KB government recruitment portals, civil exam uploads</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Pass 6 (Maximum Floor)</td>
              <td className="p-3"><code>60 DPI</code></td>
              <td className="p-3"><code>22% (0.22)</code></td>
              <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">88% – 94%</td>
              <td className="p-3">&le; 50 KB strict identity card, signature stamp, and biometric uploads</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        KivaroTools vs. Top Global PDF Compressors
      </h2>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left border-collapse text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">Feature / Capability</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[140px]">KivaroTools Compress PDF</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[130px]">iLovePDF / Smallpdf</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[140px]">Adobe Acrobat Online</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[130px]">Pi7 / 11zon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Processing Architecture</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">100% Client-Side Browser RAM</td>
              <td className="p-3 text-red-500">Cloud Server Upload</td>
              <td className="p-3 text-red-500">Adobe Cloud Upload</td>
              <td className="p-3 text-red-500">Remote Server Upload</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Exact Target KB Solver</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">Built-in (50KB–2MB + Custom)</td>
              <td className="p-3 text-red-500">Not Supported</td>
              <td className="p-3 text-red-500">No Exact KB Input</td>
              <td className="p-3">Ad-Heavy Separate Pages</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Mathematical Never-Grow Guard</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">Guaranteed (Vector Fallback)</td>
              <td className="p-3">Partial</td>
              <td className="p-3">Yes</td>
              <td className="p-3 text-amber-500">Can Inflate Text PDFs</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Internal PDF Space X-Ray</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">Live Byte Breakdown by Type</td>
              <td className="p-3 text-red-500">No</td>
              <td className="p-3 text-red-500">No</td>
              <td className="p-3 text-red-500">No</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Before / After Visual Preview</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">Side-by-Side Page 1 Readability</td>
              <td className="p-3 text-red-500">Blind Download First</td>
              <td className="p-3">Requires Sign-In</td>
              <td className="p-3 text-red-500">No</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Batch Capacity &amp; ZIP Export</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">Up to 25 files / 500 MB (ZIP)</td>
              <td className="p-3 text-amber-500">Capped at 2–20 files</td>
              <td className="p-3 text-amber-500">Single File Free</td>
              <td className="p-3 text-amber-500">3–5 files cap</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Pricing &amp; Subscriptions</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">100% Free Forever (No Paywall)</td>
              <td className="p-3 text-amber-500">$12.00 / month Pro</td>
              <td className="p-3 text-amber-500">$19.99 / month Pro</td>
              <td className="p-3">Ad-Supported Free</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        PDF Compression Engineering &amp; Prepress Troubleshooting Diagnostic Grid
      </h2>
      <p>
        Master internal PDF stream behavior, resolution limits, and memory optimization with these engineering resolutions:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            1. Why Pure Vector PDFs Could Inflate Under Rasterization
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            A pure vector text PDF (such as a 1-page invoice or LaTeX paper) consists of compact mathematical curves taking only 20 KB. Naive rasterization renders that page into thousands of image pixels, producing a 150 KB JPEG stream. KivaroTools solves this with our <strong>Never-Grow Integrity Guard</strong>: if a raster downsampling pass produces more bytes than the original or lossless vector pass, the engine automatically discards the raster pass and outputs the smaller vector stream.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            2. Balancing Text Readability vs. Byte Size on Scanned Forms
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            Scanned government forms and tax returns often contain tiny 6pt or 8pt footnote text. In <strong>Balanced Mode (150 DPI @ 74% quality)</strong>, characters remain sharp and legible for screen verification. If an upload portal requires strict compliance (e.g. &le; 100 KB), use the <strong>Exact Target KB</strong> solver and check the Before/After Visual Preview to verify that critical numbers and serial codes remain readable before saving.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            3. When a Multi-Page PDF Cannot Fit Below a 50KB or 100KB Limit
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            A 40-page scanned legal agreement has physical entropy constraints; even at the lowest candidate pass (60 DPI @ 22% quality), 40 pages require at least 300 KB to 500 KB to store basic bitmap headers. When facing strict portal caps, split the document using our <Link href="/document/pdf-merge-split" className="text-blue-600 dark:text-blue-400 underline">PDF Merge &amp; Split Tool</Link> to submit individual chapters or extract only the signature and schedule pages.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            4. Shrinking Smartphone Scans by 30%–45% via 8-Bit Grayscale
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            Documents captured with phone camera scanner apps (such as CamScanner or iPhone Notes) often contain uneven yellow lighting and color noise. Enabling the <strong>Grayscale Monochrome (BT.709)</strong> toggle converts 24-bit RGB pixels into 8-bit luminance values, discarding unnecessary chroma channels and slashing compressed byte size by an additional 30% to 45% while boosting black-and-white contrast.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            5. Unlocking Password-Protected PDFs &amp; Diagnosing Corrupted Headers
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            Encrypted documents (<code>isEncrypted: true</code>) restrict client-side stream reading and object catalog reconstruction. Remove user or owner passwords prior to uploading. KivaroTools verifies the standard <code>%PDF-</code> magic byte signature within the first 1,024 bytes and validates a minimum 32-byte buffer length, rejecting corrupt or zero-byte files immediately with informative diagnostics.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            6. Managing Browser RAM Across 25-File / 500 MB Batches
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            KivaroTools processes queue items sequentially to keep browser heap consumption predictable. After each document completes, intermediate canvas buffers and uncompressed stream objects are unreferenced for browser garbage collection. Use the <strong>Clear Queue</strong> button to immediately reclaim memory after downloading your batch ZIP archive.
          </p>
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        Production Use Cases for In-Browser PDF Compression
      </h2>
      <ul>
        <li>
          <strong>Civil Service &amp; Exam Portal Uploads:</strong> Compress scanned identity cards, educational diplomas, and signature forms to exact 50 KB, 100 KB, or 200 KB thresholds required by government examination and job application portals.
        </li>
        <li>
          <strong>Embassy Visa &amp; Immigration Portals:</strong> Reduce multi-page bank statements, hotel bookings, and employment letters beneath strict 2 MB or 5 MB visa portal submission ceilings.
        </li>
        <li>
          <strong>Corporate Legal Discovery &amp; Court E-Filing:</strong> Strip hidden XMP metadata, creator identities, and scanner paths from legal contracts and litigation exhibits to comply with court e-filing file size limits (10 MB to 25 MB).
        </li>
        <li>
          <strong>Email Attachment Optimization:</strong> Shrink 50 MB graphic presentations and financial audit reports down to 3 MB–5 MB, bypassing corporate Microsoft Exchange and Gmail 25 MB attachment bounce limits.
        </li>
      </ul>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        Frequently Asked Questions (FAQ)
      </h2>
      <div className="space-y-3 not-prose mb-8">
        {PDF_COMPRESSOR_FAQS.map((faq, index) => (
          <details
            key={index}
            className="group rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
          >
            <summary className="font-semibold text-slate-900 dark:text-slate-100 text-base cursor-pointer select-none list-none flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white m-0 inline">{faq.question}</h3>
              <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        Explore Related Document &amp; PDF Compression Utilities
      </h2>
      <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
        <li>
          <Link href="/document/pdf-merge-split" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            PDF Merge &amp; Split Tool (Up to 750 MB Batch)
          </Link>{' '}
          &mdash; Combine up to 50 PDFs or extract specific page intervals to partition oversized documents before compression.
        </li>
        <li>
          <Link href="/media/image-compressor" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Image Compressor to 20KB, 50KB &amp; 100KB
          </Link>{' '}
          &mdash; Compress JPG, PNG, WebP, AVIF, and HEIC photos with perceptual SSIM scoring and target-KB solvers.
        </li>
        <li>
          <Link href="/document/pdf-to-word" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            PDF to Word (.DOCX) Converter
          </Link>{' '}
          &mdash; Reconstruct static PDF documents into editable Microsoft Word documents with heading and table reconstruction.
        </li>
        <li>
          <Link href="/document/pdf-to-jpg" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            PDF to JPG, PNG &amp; WebP Converter (Up to 600 DPI)
          </Link>{' '}
          &mdash; Rasterize PDF pages into high-resolution JPG, PNG, or WebP images with single-page or batch ZIP download.
        </li>
        <li>
          <Link href="/document/image-to-pdf" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Image to PDF Converter (JPG, PNG, WebP &amp; HEIC to PDF)
          </Link>{' '}
          &mdash; Convert up to 100 JPG, PNG, WebP, and HEIC images into a compact, standardized PDF document.
        </li>
        <li>
          <Link href="/document/pdf-to-excel" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            PDF to Excel &amp; CSV Converter (.XLSX &amp; CSV Table Extractor)
          </Link>{' '}
          &mdash; Extract financial ledgers, bank transactions, and invoices into multi-sheet Excel workbooks with formula protection.
        </li>
      </ul>
    </article>
  );
}
