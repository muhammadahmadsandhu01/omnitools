import React from 'react';
import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const PDF_COMPRESSOR_FAQS: FaqItem[] = [
  {
    "question": "How does KivaroTools compress PDF files up to 90% without uploading them to a server?",
    "answer": "Our dual-pipeline engine runs 100% in your browser RAM using pdf-lib for lossless catalog rebuilds (/ObjStm object streams and <x:xmpmeta> stripping) and HTML5 Canvas 2D for perceptual DCTDecode JPEG downsampling."
  },
  {
    "question": "How does the Exact Target KB Solver compress a PDF to 50KB, 100KB, or 200KB?",
    "answer": "It executes a deterministic 6-Pass Progressive Candidate Ladder: Pass 1 (180 DPI @ 82%), Pass 2 (144 DPI @ 70%), Pass 3 (115 DPI @ 56%), Pass 4 (92 DPI @ 44%), Pass 5 (72 DPI @ 30%), and Pass 6 (60 DPI @ 22%), halting on the highest-quality pass that fits under your target KB."
  },
  {
    "question": "What are the 7 built-in Target KB presets and custom range limits?",
    "answer": "You can click 1-tap presets for 50 KB, 100 KB, 200 KB, 300 KB, 500 KB, 1 MB (1,024 KB), and 2 MB (2,048 KB), or enter any custom target from 20 KB up to 51,200 KB (50 MB)."
  },
  {
    "question": "What is the difference between Balanced, Target KB, Extreme, and Lossless Vector modes?",
    "answer": "Balanced (150 DPI @ 74%) cuts scanned PDFs by 50%–70%; Target KB solves for an exact byte ceiling; Extreme (96–110 DPI @ 50%–58%) achieves 75%–90% reduction; and Lossless Vector strips XMP metadata and compacts PDF 1.5+ object streams without rasterizing vector text."
  },
  {
    "question": "What is the Mathematical Never-Grow Integrity Guard?",
    "answer": "The engine initializes bestBytes to the smaller of the Lossless Vector pass or your original PDF and refuses any raster pass that would increase byte size—guaranteeing your output file is never larger than your input."
  },
  {
    "question": "How many PDF files and how many megabytes can I compress in a single batch?",
    "answer": "You can queue up to 25 PDF files per batch with a combined total payload of up to 500 MB, and download them individually or as a single DEFLATE .zip archive."
  },
  {
    "question": "How does the ITU-R BT.709 8-Bit Grayscale option reduce file size further?",
    "answer": "It converts 24-bit RGB page scans into perceptual luminance (Luminance = round(0.2126*R + 0.7152*G + 0.0722*B)), eliminating color channel noise on stamped or smartphone-scanned forms for an extra 30%–45% byte reduction."
  },
  {
    "question": "What does the Internal PDF Space X-Ray audit show?",
    "answer": "It scans the raw PDF binary stream to report the exact percentage of bytes consumed by Embedded Images (/Subtype /Image), Text & Fonts (/FontDescriptor), Metadata & XMP Bloat (<x:xmpmeta>), and Object Structure."
  },
  {
    "question": "Does compressing a PDF change its physical print page dimensions (A4 or US Letter)?",
    "answer": "No. Downsampling reduces internal raster pixel density (DPI) to save bytes while preserving the exact original PostScript page dimensions (e.g., 595.28 × 841.89 pt for A4)."
  },
  {
    "question": "When should I choose Lossless Vector Mode?",
    "answer": "Choose Lossless Vector Mode for text-only contracts, LaTeX papers, invoices, and CAD vector drawings where Ctrl+F text selectability and infinite vector zoom must remain 100% intact."
  },
  {
    "question": "Why did Lossless Vector Mode shrink my Adobe PDF by over 90%?",
    "answer": "Design apps like Adobe InDesign and Illustrator often embed 300 KB+ of uncompressed <x:xmpmeta> XML history inside a 5 KB vector PDF. Stripping XMP and packing /ObjStm streams removes up to 99.1% of that bloat."
  },
  {
    "question": "Is it safe to compress Aadhaar cards, passports, tax returns, and legal contracts here?",
    "answer": "Yes. Unlike cloud compressors (iLovePDF, Smallpdf, Pi7, 11zon) that upload your documents to remote servers, KivaroTools processes 100% of bytes inside your local browser memory."
  },
  {
    "question": "What happens if my PDF is password-protected or encrypted?",
    "answer": "Encrypted PDFs must be unlocked before internal object streams or page canvases can be re-encoded. Our preflight check detects encrypted or corrupted headers immediately."
  },
  {
    "question": "Does KivaroTools add watermarks or daily task limits to compressed PDFs?",
    "answer": "Never. You get unlimited free PDF compressions with zero watermarks, zero timers, and zero sign-up forms."
  },
  {
    "question": "What if a 40-page PDF still exceeds a strict 100 KB portal limit after Pass 6?",
    "answer": "If physical page count prevents a 40-page scan from fitting under 100 KB even at 60 DPI, use our PDF Merge & Split Tool (/document/pdf-merge-split) to remove unneeded pages or split the file into two parts."
  }
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
    name: "How to Compress PDF Files to 100KB, 200KB, or 500KB Locally in Your Browser",
    description: "Reduce PDF file sizes up to 90% 100% locally in your browser across batches of up to 25 PDF files (500 MB total payload). Choose from 4 specialized compression engines\u2014Balanced (150 DPI @ 74%), Exact Target KB Solver (50KB, 100KB, 200KB, 300KB, 500KB, 1MB, 2MB via a 6-pass candidate ladder), Extreme (96 DPI @ 50%\u201358%), and Lossless Vector (/ObjStm object streams + XMP bloat stripping)\u2014backed by a mathematical Never-Grow Integrity Guard, ITU-R BT.709 8-bit grayscale, and an internal PDF Space X-Ray auditor.",
    step: [
    {
        "@type": "HowToStep",
        "position": 1,
        "name": "Upload Up to 25 PDF Files (Max 500 MB Batch)",
        "text": "Drag and drop up to 25 PDF documents (up to 500 MB total) into the workspace. Every file is verified for a valid %PDF- header and analyzed by our internal Space X-Ray scanner in local RAM."
    },
    {
        "@type": "HowToStep",
        "position": 2,
        "name": "Choose Compression Mode or Exact Target KB Preset",
        "text": "Select Balanced (150 DPI @ 74%), Lossless Vector (0% rasterization, strips XMP & packs /ObjStm), Extreme (96 DPI), or Exact Target KB (50KB, 100KB, 200KB, 300KB, 500KB, 1MB, 2MB, or custom 20KB\u201350MB)."
    },
    {
        "@type": "HowToStep",
        "position": 3,
        "name": "Configure Optional ITU-R BT.709 Grayscale & Metadata Stripping",
        "text": "Enable 8-bit perceptual grayscale (0.2126R + 0.7152G + 0.0722B) to shrink color-tinted scans by an extra 30%\u201345%, and keep Strip XMP & Author Metadata checked for maximum byte savings and privacy."
    },
    {
        "@type": "HowToStep",
        "position": 4,
        "name": "Inspect Space X-Ray & Download Compressed PDF or Batch .ZIP",
        "text": "Review the byte breakdown across Images, Text/Fonts, XMP Metadata, and Object Structure, verify that the Never-Grow Guard kept your file smaller, and download individual PDFs or a batch .zip."
    }
],
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* Opening Hero H2 */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
        Client-Side Compress PDF: 6-Pass Exact Target KB Solver (50KB–2MB), Lossless Vector &amp; Space X-Ray
      </h2>
      <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 mb-6">
        Reduce PDF file sizes up to 90% 100% locally in your browser across batches of up to 25 PDF files (500 MB total payload). Choose from 4 specialized compression engines—Balanced (150 DPI @ 74%), Exact Target KB Solver (50KB, 100KB, 200KB, 300KB, 500KB, 1MB, 2MB via a 6-pass candidate ladder), Extreme (96 DPI @ 50%–58%), and Lossless Vector (/ObjStm object streams + XMP bloat stripping)—backed by a mathematical Never-Grow Integrity Guard, ITU-R BT.709 8-bit grayscale, and an internal PDF Space X-Ray auditor.
      </p>

      {/* Step-by-Step Workflow */}
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        How to Compress PDF Files to 100KB, 200KB, or 500KB Locally in Your Browser
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 not-prose">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Step 1: Upload Up to 25 PDF Files (Max 500 MB Batch)
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 m-0">Drag and drop up to 25 PDF documents (up to 500 MB total) into the workspace. Every file is verified for a valid %PDF- header and analyzed by our internal Space X-Ray scanner in local RAM.</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Step 2: Choose Compression Mode or Exact Target KB Preset
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 m-0">Select Balanced (150 DPI @ 74%), Lossless Vector (0% rasterization, strips XMP &amp; packs /ObjStm), Extreme (96 DPI), or Exact Target KB (50KB, 100KB, 200KB, 300KB, 500KB, 1MB, 2MB, or custom 20KB–50MB).</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Step 3: Configure Optional ITU-R BT.709 Grayscale &amp; Metadata Stripping
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 m-0">Enable 8-bit perceptual grayscale (0.2126R + 0.7152G + 0.0722B) to shrink color-tinted scans by an extra 30%–45%, and keep Strip XMP &amp; Author Metadata checked for maximum byte savings and privacy.</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Step 4: Inspect Space X-Ray &amp; Download Compressed PDF or Batch .ZIP
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 m-0">Review the byte breakdown across Images, Text/Fonts, XMP Metadata, and Object Structure, verify that the Never-Grow Guard kept your file smaller, and download individual PDFs or a batch .zip.</p>
        </div>
      </div>

      {/* Technical Specification Table */}
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        4-Mode Compression Architecture &amp; 6-Pass Progressive Target-KB Solver Specification
      </h2>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left border-collapse text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white">
            <tr>
              <th scope="col" className="p-3.5 border-b border-slate-200 dark:border-slate-700 font-bold whitespace-nowrap">Mode / Solver Pass</th>
              <th scope="col" className="p-3.5 border-b border-slate-200 dark:border-slate-700 font-bold whitespace-nowrap">DPI Resolution & JPEG Quality</th>
              <th scope="col" className="p-3.5 border-b border-slate-200 dark:border-slate-700 font-bold whitespace-nowrap">Internal PDF Stream Operations</th>
              <th scope="col" className="p-3.5 border-b border-slate-200 dark:border-slate-700 font-bold whitespace-nowrap">Typical Size Reduction & Target Use Case</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-900 dark:text-white whitespace-nowrap">Lossless Vector Mode</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-mono text-xs text-blue-600 dark:text-blue-400">Native Vector (Zero Rasterization)</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">cleanDoc.copyPages() + /ObjStm (100/tick) + &lt;x:xmpmeta&gt; strip</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">10%–35% (Up to 99.1% on Adobe XMP-bloated vector PDFs)</td>
            </tr>
            <tr>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-900 dark:text-white whitespace-nowrap">Balanced Mode (Default)</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-mono text-xs text-blue-600 dark:text-blue-400">150 DPI Retina @ 0.74 (74% Quality)</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">DCTDecode JPEG downsampling + XMP/Info dictionary strip</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">50%–70% reduction for email attachments &amp; slide decks</td>
            </tr>
            <tr>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-900 dark:text-white whitespace-nowrap">Extreme Mode</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-mono text-xs text-blue-600 dark:text-blue-400">96–110 DPI @ 0.50–0.58 (50%–58% Quality)</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">High-ratio DCTDecode quantization + full catalog compaction</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">75%–90% reduction for bulk archival &amp; slow mobile links</td>
            </tr>
            <tr>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-900 dark:text-white whitespace-nowrap">Target-KB Pass 1 &amp; Pass 2</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-mono text-xs text-blue-600 dark:text-blue-400">Pass 1: 180 DPI @ 82% | Pass 2: 144 DPI @ 70%</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">Halts on first pass where byteLength &lt;= targetBytes</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">Fits 5 MB–15 MB scans under 500 KB, 1 MB, or 2 MB limits</td>
            </tr>
            <tr>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-900 dark:text-white whitespace-nowrap">Target-KB Pass 3 &amp; Pass 4</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-mono text-xs text-blue-600 dark:text-blue-400">Pass 3: 115 DPI @ 56% | Pass 4: 92 DPI @ 44%</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">Progressive resolution &amp; quantization step-down</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">Squeezes multi-page certificates &amp; forms under 100 KB–300 KB</td>
            </tr>
            <tr>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-900 dark:text-white whitespace-nowrap">Target-KB Pass 5 &amp; Pass 6</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-mono text-xs text-blue-600 dark:text-blue-400">Pass 5: 72 DPI @ 30% | Pass 6: 60 DPI @ 22%</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">Maximum compression floor + Never-Grow Integrity Guard</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">Hits strict 50 KB–100 KB government, visa &amp; exam portal caps</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5-Column Competitor Comparison Matrix */}
      <h2 id="competitor-comparison" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        Compress PDF Comparison: KivaroTools vs. Cloud PDF Compressors
      </h2>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left border-collapse text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white">
            <tr>
              <th scope="col" className="p-3.5 border-b border-slate-200 dark:border-slate-700 font-bold whitespace-nowrap ">Capability / Metric</th>
              <th scope="col" className="p-3.5 border-b border-slate-200 dark:border-slate-700 font-bold whitespace-nowrap text-blue-600 dark:text-blue-400">KivaroTools (100% Free)</th>
              <th scope="col" className="p-3.5 border-b border-slate-200 dark:border-slate-700 font-bold whitespace-nowrap ">iLovePDF</th>
              <th scope="col" className="p-3.5 border-b border-slate-200 dark:border-slate-700 font-bold whitespace-nowrap ">Smallpdf</th>
              <th scope="col" className="p-3.5 border-b border-slate-200 dark:border-slate-700 font-bold whitespace-nowrap ">Pi7 / 11zon Compressors</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-900 dark:text-white whitespace-nowrap">Processing Privacy</th>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-semibold text-emerald-600 dark:text-emerald-400">100% Client-Side Browser RAM (Zero Upload)</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">Cloud server upload</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">Cloud server upload</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">Remote server upload</td>
            </tr>
            <tr>
              <th scope="row" className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-900 dark:text-white whitespace-nowrap">Exact Target KB Solver</th>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-semibold text-emerald-600 dark:text-emerald-400">7 Presets (50KB–2MB) + Custom (20KB–50MB) 6-Pass</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">None (3 fixed presets)</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">None (2 presets, Pro)</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">Uploads sensitive IDs to server</td>
            </tr>
            <tr>
              <th scope="row" className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-900 dark:text-white whitespace-nowrap">Batch Queue Capacity</th>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-semibold text-emerald-600 dark:text-emerald-400">Up to 25 PDFs / 500 MB Total Batch + ZIP</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">1–2 files free tier</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">Daily task paywall</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">Ad-heavy server queues</td>
            </tr>
            <tr>
              <th scope="row" className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-900 dark:text-white whitespace-nowrap">Internal PDF Space X-Ray</th>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-semibold text-emerald-600 dark:text-emerald-400">Yes (Audits Images, Fonts, XMP &amp; Object Bloat)</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">None</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">None</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">None</td>
            </tr>
            <tr>
              <th scope="row" className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-900 dark:text-white whitespace-nowrap">Mathematical Never-Grow Guard</th>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-semibold text-emerald-600 dark:text-emerald-400">Guaranteed outputBytes &lt;= inputBytes</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">Can inflate vector PDFs</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">Can inflate small PDFs</td>
              <td className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">No lossless fallback</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 6-Card Troubleshooting Grid */}
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        Engineering Diagnostics, Prepress &amp; Edge-Case Troubleshooting Guide
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            1. How the Mathematical Never-Grow Integrity Guard Works
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            Naive compressors rasterize crisp 30 KB vector text PDFs into 400 KB images. Our engine benchmarks Lossless Vector compaction first and rejects any raster pass if rasterBytes &gt;= bestBytes.
          </p>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            2. Inside the 6-Pass Progressive Target-KB Solver (180 DPI down to 60 DPI)
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            When you select 100 KB or 200 KB, the solver tests Pass 1 (180 DPI @ 82%) first and only steps down through Passes 2–6 until pass.bytes.byteLength &lt;= targetBytes, preserving maximum legibility.
          </p>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            3. Shrinking Color-Tinted Scans by 30%–45% via ITU-R BT.709 Grayscale
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            Smartphone scans of black-and-white forms waste 24-bit RGB chroma channels on paper shadows. Enabling BT.709 Grayscale (0.2126R + 0.7152G + 0.0722B) collapses chroma entropy before JPEG encoding.
          </p>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            4. Stripping 300 KB+ of Hidden Adobe &lt;x:xmpmeta&gt; Bloat in Lossless Mode
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            PDFs exported from InDesign, Illustrator, or Photoshop often carry hundreds of kilobytes of XML edit history. Lossless mode strips &lt;x:xmpmeta&gt; packets while keeping 100% sharp vector fonts.
          </p>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            5. What to Do When a 50-Page Scan Cannot Physically Fit Under 100 KB
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            If a 50-page scanned PDF reaches Pass 6 (60 DPI @ 22%) and still exceeds 100 KB, pair with our PDF Merge &amp; Split Tool (/document/pdf-merge-split) to split the packet or remove blank appendix pages.
          </p>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            6. Auditing PDF Bloat Channels with Internal Space X-Ray
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            Before downloading, inspect the 4-channel Space X-Ray breakdown (Embedded Images, Text &amp; Fonts, Metadata/XMP, and Cross-Reference Structure) to see exactly why your PDF was large.
          </p>
        </div>
      </div>

      {/* 15 Interactive Details FAQs */}
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3 my-6 not-prose">
        {PDF_COMPRESSOR_FAQS.map((faq, idx) => (
          <details
            key={idx}
            className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 transition-colors"
          >
            <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white m-0">
                {faq.question}
              </h3>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>

      {/* Internal Cross-Links */}
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        Explore Related Client-Side Document &amp; Media Utilities
      </h2>
      <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400">
        <li>
          <Link href="/document/pdf-merge-split" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            PDF Merge &amp; Split Tool
          </Link> 
          &mdash; Remove unneeded pages or split large PDFs before compressing to strict 100KB caps.
        </li>
        <li>
          <Link href="/document/pdf-to-word" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            PDF to Word Converter
          </Link> 
          &mdash; Convert PDF documents into editable .docx, Markdown (.md), and Plain Text (.txt).
        </li>
        <li>
          <Link href="/document/pdf-to-jpg" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            PDF to JPG, PNG &amp; WebP Converter
          </Link> 
          &mdash; Render PDF pages into 72–600 DPI images with batch .zip export.
        </li>
        <li>
          <Link href="/media/image-compressor" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Image Compressor (Target KB Solver)
          </Link> 
          &mdash; Compress JPG, PNG, WebP, AVIF, and HEIC photos to 20KB/50KB/100KB locally.
        </li>
      </ul>
    
                {/* Programmatic Long-Tail Search Intent & Global Use-Case Coverage (27 Intents) */}
        <section id="programmatic-search-intents" aria-label="Supported Search Intents and Workflows" className="my-8 p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 not-prose">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
            Compress PDF to Target KB Size — Supported Workflows &amp; Long-Tail Search Coverage (27 Intents)
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">compress pdf online free no upload</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">reduce pdf file size without losing quality</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">compress pdf to 100kb 200kb 300kb 500kb</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">shrink pdf under 1mb for email portal</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">lossless vector pdf optimizer object streams</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">batch compress 25 pdf files zip download</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">convert scanned pdf to grayscale smaller size</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">strip xmp metadata bloat from pdf client side</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">before and after pdf compression quality preview</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">private browser based pdf size reducer</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">shrink pdf under 1mb for email portal upload</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">target kb pdf compressor 50kb 100kb 200kb</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">itu r bt 709 8 bit grayscale pdf compression</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">never grow integrity guard pdf compressor</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pdf internal space x ray byte auditor</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">compress pdf batch up to 500mb client side</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">reduce bank statement pdf file size for online portal</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">compress passport and visa pdf documents safely</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">free smallpdf and ilovepdf compressor alternative no limit</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">shrink scanned book pdf file size online free</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">fast webassembly pdf optimizer zero server storage</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">compress legal contract pdf without changing text clarity</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">extreme pdf compression preset for slow connections</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">compress pdf on mobile phone browser responsive</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">instant in browser pdf compression web worker</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">clean unreferenced objects and unused fonts from pdf</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">enterprise grade pdf compressor 100 percent free</span>
          </div>
        </section>
      </article>
  );
}
