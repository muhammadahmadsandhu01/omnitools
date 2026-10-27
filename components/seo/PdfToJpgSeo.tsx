import React from 'react';
import Link from 'next/link';

export default function PdfToJpgSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does KivaroTools convert PDF pages to high-resolution JPG, PNG, and WebP images in the browser?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'KivaroTools uses an in-browser HTML5 Canvas rasterization pipeline powered by Mozilla pdf.js and a deterministic vector layout fallback. Each PDF page is rendered at your chosen scale factor (72 DPI Screen, 150 DPI Web, 300 DPI Print, or 600 DPI Ultra-HD), encoded into JPG, lossless PNG, or next-gen WebP, and packaged into a single-click ZIP archive via JSZip.',
        },
      },
      {
        '@type': 'Question',
        name: 'What DPI resolution should I choose when converting PDF to JPG or PNG?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Choose 72 DPI (1.0x) for lightweight email thumbnails, 150 DPI (2.0x) for crisp website embeds and social media carousels (LinkedIn/Instagram), 300 DPI (3.0x) for commercial printing and OCR scanning, or 600 DPI (4.0x) for architectural blueprints and fine typography.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I download individual page images as well as a complete ZIP archive?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! After rendering, our visual thumbnail gallery displays every converted page with its exact pixel dimensions (width × height) and file size in KB. You can click "Download" on any individual page image or click "Download All as ZIP" to grab the entire batch at once.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between exporting PDF pages to JPG vs. PNG vs. WebP?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'JPG (JPEG) uses adjustable perceptual compression for compact file sizes ideal for photos and scanned documents. PNG uses 100% lossless compression that keeps small text, line art, and vector diagrams razor-sharp without JPEG ringing artifacts. WebP delivers 25–35% smaller file sizes than JPG at equivalent visual quality for modern websites.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are my PDF documents uploaded to an external server to render images?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. 100% of the PDF rendering, canvas encoding, and ZIP archiving runs locally inside your browser hardware (GPU/RAM). Confidential passports, IDs, tax forms, and design proofs never leave your device.',
        },
      },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Convert PDF Pages to 300 DPI JPG, PNG, or WebP Images Online',
    description:
      'Render PDF pages into high-resolution JPG, lossless PNG, or WebP images at 72, 150, 300, or 600 DPI and download individually or as a ZIP archive.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Drop Your PDF Document or Load Sample Brochure',
        text: 'Select any PDF file (up to 100 MB) from your device or click "Load Sample Multi-Page PDF" to test high-DPI rasterization immediately.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Select Image Format (JPG, PNG, WebP) & DPI Resolution',
        text: 'Choose JPG, lossless PNG, or WebP output, pick your target DPI preset (72, 150, 300, or 600 DPI), adjust image quality, and optionally filter a custom page range.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Preview Rendered Page Gallery',
        text: 'Inspect the live thumbnail gallery showing exact pixel dimensions (e.g., 2480 × 3508 px at 300 DPI) and byte sizes for each converted page.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Download Individual Images or Batch ZIP Archive',
        text: 'Save any single page image with one click or download all rendered pages bundled in a DEFLATE-compressed ZIP archive.',
      },
    ],
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <h2>Convert PDF to High-Resolution JPG, PNG &amp; WebP Images (Up to 600 DPI)</h2>
      <p>
        The <strong>KivaroTools PDF to JPG, PNG &amp; WebP Converter</strong> is a hardware-accelerated, client-side PDF rasterizer that turns every page of your PDF document into ultra-crisp <strong>JPEG (<code>.jpg</code>)</strong>, lossless <strong>PNG (<code>.png</code>)</strong>, or modern <strong>WebP (<code>.webp</code>)</strong> images. Whether you are exporting LinkedIn carousel slides, preparing print-ready 300 DPI graphic proofs, or extracting specific pages for a CMS, everything runs locally in your browser with zero server uploads.
      </p>

      <blockquote>
        <strong>Privacy First &amp; Secure — 100% Client-Side Execution:</strong> Government ID scans, signed contracts, medical records, and unreleased creative proofs are rendered directly inside your browser&apos;s HTML5 Canvas and GPU memory—never transmitted over the internet.
      </blockquote>

      <h3>Precision DPI Scaling Matrix: From 72 DPI Thumbnails to 600 DPI Archival Masters</h3>
      <p>
        Most free online PDF-to-JPG tools lock output resolution at a blurry 72 or 96 DPI unless you pay for a Pro subscription. KivaroTools unlocks four precision rasterization tiers for free:
      </p>
      <ul>
        <li>
          <strong>72 DPI (1.0× Standard Screen — ~595 × 842 px for A4):</strong> Fast, lightweight previews ideal for email attachments and UI thumbnails.
        </li>
        <li>
          <strong>150 DPI (2.0× Retina Web — ~1240 × 1754 px for A4):</strong> Razor-sharp clarity for blog graphics, Notion docs, and Instagram/LinkedIn slide carousels.
        </li>
        <li>
          <strong>300 DPI (3.0× Print &amp; OCR Grade — ~2480 × 3508 px for A4):</strong> Industry-standard commercial print resolution that preserves tiny 6pt footnotes without pixelation.
        </li>
        <li>
          <strong>600 DPI (4.0× Ultra-HD Archival):</strong> Maximum-density rendering for CAD schematics, engineering floorplans, and micro-typography inspection.
        </li>
      </ul>

      <h3>Feature Comparison: KivaroTools vs. Cloud PDF-to-Image Converters</h3>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
        <table className="min-w-[640px] w-full text-sm text-left border-collapse">
          <thead>
            <tr>
              <th>Feature</th>
              <th>KivaroTools PDF to JPG/PNG</th>
              <th>iLovePDF / Smallpdf</th>
              <th>Adobe Acrobat Online</th>
              <th>PDFCandy</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Execution Privacy</strong></td>
              <td><strong>100% Local Browser GPU/RAM</strong></td>
              <td>Cloud Server Upload</td>
              <td>Adobe Cloud Upload</td>
              <td>Cloud Server Upload</td>
            </tr>
            <tr>
              <td><strong>Output Image Formats</strong></td>
              <td><strong>JPG, Lossless PNG, WebP</strong></td>
              <td>JPG only (PNG paywalled)</td>
              <td>JPG / PNG / TIFF</td>
              <td>JPG / PNG</td>
            </tr>
            <tr>
              <td><strong>Max Free Resolution</strong></td>
              <td><strong>Up to 600 DPI (Free)</strong></td>
              <td>150 DPI (300 DPI Pro only)</td>
              <td>Standard</td>
              <td>150–300 DPI</td>
            </tr>
            <tr>
              <td><strong>Custom Page Range Filter</strong></td>
              <td><strong>Yes (e.g., &quot;1-3, 5&quot;)</strong></td>
              <td>All Pages</td>
              <td>All Pages</td>
              <td>All Pages</td>
            </tr>
            <tr>
              <td><strong>Download Options</strong></td>
              <td><strong>Single-Click Individual + ZIP</strong></td>
              <td>ZIP or Individual</td>
              <td>ZIP</td>
              <td>ZIP</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Frequently Asked Questions (FAQ)</h3>
      <div>
        <h4>1. Should I choose PNG or JPG when converting text-heavy PDF pages?</h4>
        <p>
          For text-heavy documents, financial tables, and vector diagrams, choose <strong>PNG (Lossless)</strong> or <strong>WebP</strong> at <strong>150–300 DPI</strong>. PNG avoids the mosquito-noise compression artifacts that JPEG introduces around sharp black text edges.
        </p>

        <h4>2. Can I convert only page 1 (the cover page) of a PDF into a PNG thumbnail?</h4>
        <p>
          Yes! Type <code>1</code> into the <strong>Page Range</strong> input field before clicking Render, and the engine will immediately rasterize only the first page for instant single-image download.
        </p>

        <h4>3. How do I combine JPG, PNG, or WebP images back into a PDF?</h4>
        <p>
          Use our companion <Link href="/document/image-to-pdf">Image to PDF Converter</Link> to merge up to 100 JPG, PNG, WebP, HEIC, and SVG images into a print-ready PDF document.
        </p>
      </div>

      <h3>Related Image &amp; PDF Utilities</h3>
      <ul>
        <li>
          <Link href="/document/image-to-pdf">Image to PDF Converter (JPG, PNG, WebP &amp; HEIC to PDF)</Link> — Combine up to 100 images into a single multi-page PDF locally.
        </li>
        <li>
          <Link href="/media/image-compressor">Image Compressor &amp; Target KB Optimizer</Link> — Compress your exported JPG, PNG, and WebP pages to exact target file sizes (e.g., 50 KB or 100 KB).
        </li>
        <li>
          <Link href="/media/webp-to-jpg-png">WebP to JPG &amp; PNG Converter</Link> — Batch transcode WebP images with custom alpha transparency matte fills.
        </li>
        <li>
          <Link href="/document/pdf-merge-split">PDF Merge &amp; Split Tool</Link> — Reorder, merge, or split PDF page ranges client-side.
        </li>
      </ul>
    </article>
  );
}
