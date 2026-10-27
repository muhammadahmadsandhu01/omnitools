import React from 'react';
import Link from 'next/link';

export default function WordToPdfSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does the Word to PDF Converter turn .docx files into PDF without server uploads?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'KivaroTools unpacks your Microsoft Word (.docx) OpenXML archive directly in browser memory using JSZip, parses word/document.xml to extract headings, styled paragraphs, bullet lists, and tables (<w:tbl>), and typesets true vector PDF pages using pdf-lib. Your document never leaves your device.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are the generated PDFs true searchable vector text or flat rasterized images?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our engine produces 100% true vector PDF documents with embedded standard fonts (Helvetica/Times/Courier), crisp selectable text, automatic word-wrapping, bordered tables, and optional header/footer page numbering—not blurry canvas screenshots.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I customize page size, orientation, margins, and typography before exporting to PDF?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. You can choose between A4 (210 × 297 mm), US Letter (8.5 × 11 in), and Legal (8.5 × 14 in) page sizes, switch between Portrait and Landscape orientation, customize page margins (Narrow, Normal, Wide), adjust base font size, and stamp PDF document metadata (Title, Author, Subject).',
        },
      },
      {
        '@type': 'Question',
        name: 'What input file formats are supported besides Microsoft Word (.docx)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'In addition to Microsoft Word (.docx) files, our tool natively parses Markdown (.md) documents—automatically rendering # headings, pipe tables, and bullet lists—as well as Plain Text (.txt) files and live pasted content.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the converter handle special Unicode symbols or smart quotes in Word files?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our built-in WinAnsi typographical sanitizer automatically maps curly smart quotes, em/en dashes, ellipsis glyphs, and mathematical symbols to clean, standards-compliant PDF glyph encodings so your exported PDF never crashes or displays garbled boxes.',
        },
      },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Convert Word (.docx) or Markdown to PDF Locally in Your Browser',
    description:
      'Convert Microsoft Word (.docx), Markdown (.md), or text documents into print-ready vector PDF files with custom margins and page numbering.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Upload Your .DOCX, .MD, or .TXT Document',
        text: 'Drag and drop your Microsoft Word (.docx), Markdown (.md), or text file into the upload zone, or load the sample executive proposal to preview the layout engine.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Select Page Size, Orientation & Margins',
        text: 'Choose A4, US Letter, or Legal paper geometry, select Portrait or Landscape orientation, configure margins in millimeters, and enable "Page X of Y" footer numbering.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Preview & Edit Document Content',
        text: 'Inspect all parsed headings, paragraphs, and tables in the Live Document Preview, or switch to the Live Editor to polish text and metadata (Title & Author) prior to rendering.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Generate & Download Vector PDF',
        text: 'Click "Export Print-Ready PDF" to compile and download a crisp, searchable vector PDF document directly to your computer.',
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

      <h2>Convert Word (.DOCX) &amp; Markdown to Print-Ready Vector PDF Online</h2>
      <p>
        The <strong>KivaroTools Word to PDF Converter</strong> transforms editable <strong>Microsoft Word (<code>.docx</code>)</strong>, <strong>Markdown (<code>.md</code>)</strong>, and <strong>Plain Text (<code>.txt</code>)</strong> documents into archival-quality, searchable vector PDF files locally in your browser. Whether you are finalizing a client proposal, submitting an academic manuscript, or preparing legal filings, our deterministic PDF typesetting engine guarantees consistent pagination across every operating system.
      </p>

      <blockquote>
        <strong>Privacy First &amp; Secure — 100% Client-Side Execution:</strong> Your Word documents are parsed and compiled into PDF pages entirely within your device&apos;s RAM. Zero files are uploaded to external servers, ensuring strict compliance with GDPR, HIPAA, and corporate data governance policies.
      </blockquote>

      <h3>True Vector PDF Typesetting vs. Blurry HTML Screenshot Converters</h3>
      <p>
        Many browser-based Word-to-PDF scripts rely on <code>html2canvas</code>, which takes a low-resolution raster screenshot of your text—resulting in bloated 20 MB files where text cannot be selected, searched, or indexed by ATS resume scanners. KivaroTools uses a <strong>native vector PDF layout engine</strong> built on <code>pdf-lib</code>:
      </p>
      <ul>
        <li>
          <strong>OpenXML AST Parsing:</strong> Reads <code>word/document.xml</code> directly from the <code>.docx</code> archive, preserving heading hierarchies (<code>Heading1</code>–<code>Heading3</code>), bold/italic runs, bulleted lists, and multi-column tables (<code>&lt;w:tbl&gt;</code>).
        </li>
        <li>
          <strong>Greedy Knuth-Inspired Line Wrapping:</strong> Measures exact glyph widths in points (pt) against your selected paper width and margin settings, wrapping long paragraphs cleanly without mid-word clipping.
        </li>
        <li>
          <strong>Automatic Multi-Page Flow &amp; Table Grids:</strong> Dynamically allocates new pages when vertical cursor height exceeds the bottom margin, drawing crisp vector cell borders and shaded table headers.
        </li>
        <li>
          <strong>ATS-Friendly Selectable Text:</strong> Because text is written using native PDF font operators, every word remains 100% selectable, searchable (<code>Ctrl+F</code>), and machine-readable by Applicant Tracking Systems (ATS).
        </li>
      </ul>

      <h3>Feature Comparison: KivaroTools vs. Legacy Word-to-PDF Tools</h3>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
        <table className="min-w-[640px] w-full text-sm text-left border-collapse">
          <thead>
            <tr>
              <th>Capability</th>
              <th>KivaroTools Word to PDF</th>
              <th>Smallpdf / iLovePDF</th>
              <th>html2pdf Screenshot Tools</th>
              <th>Desktop Word Export</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Data Privacy</strong></td>
              <td><strong>100% Local Browser RAM</strong></td>
              <td>Uploaded to Cloud</td>
              <td>Local Browser</td>
              <td>Local Desktop</td>
            </tr>
            <tr>
              <td><strong>PDF Output Type</strong></td>
              <td><strong>Searchable Vector Text &amp; Tables</strong></td>
              <td>Vector PDF</td>
              <td>Blurry Raster Image</td>
              <td>Vector PDF</td>
            </tr>
            <tr>
              <td><strong>Custom Page Setup</strong></td>
              <td><strong>A4 / Letter / Legal + Margins</strong></td>
              <td>Locked in Free Tier</td>
              <td>Limited</td>
              <td>Full Setup</td>
            </tr>
            <tr>
              <td><strong>Live Pre-Export Editor</strong></td>
              <td><strong>Built-in Block &amp; Markdown Editor</strong></td>
              <td>No</td>
              <td>No</td>
              <td>Requires Office License</td>
            </tr>
            <tr>
              <td><strong>PDF Metadata Stamping</strong></td>
              <td><strong>Custom Title &amp; Author Tags</strong></td>
              <td>No</td>
              <td>No</td>
              <td>Partial</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Frequently Asked Questions (FAQ)</h3>
      <div>
        <h4>1. Are PDFs generated by this tool compatible with ATS resume parsers?</h4>
        <p>
          Yes! Because our engine writes native vector text streams rather than rasterized images, corporate Applicant Tracking Systems (Workday, Greenhouse, Lever) can read 100% of your resume headings, bullet points, and skills.
        </p>

        <h4>2. Can I convert Markdown (.md) documentation into a styled PDF?</h4>
        <p>
          Absolutely. Upload any <code>.md</code> file or paste Markdown syntax directly into the editor—our parser automatically converts <code>#</code>, <code>##</code>, and <code>###</code> headers, bullet lists, and Markdown pipe tables into formatted vector PDF pages.
        </p>

        <h4>3. How do I combine multiple converted PDFs into a single package?</h4>
        <p>
          Once you export your Word documents to PDF, you can combine up to 50 PDF files in any order using our <Link href="/document/pdf-merge-split">PDF Merge &amp; Split Tool</Link>.
        </p>
      </div>

      <h3>Related Document &amp; Conversion Tools</h3>
      <ul>
        <li>
          <Link href="/document/pdf-to-word">PDF to Word (.DOCX) Converter</Link> — Convert PDF contracts and reports back into editable Microsoft Word files.
        </li>
        <li>
          <Link href="/document/excel-to-pdf">Excel &amp; CSV to PDF Converter</Link> — Turn spreadsheets and tabular datasets into landscape or portrait vector PDF tables.
        </li>
        <li>
          <Link href="/document/image-to-pdf">Image to PDF Converter</Link> — Compile up to 100 JPG, PNG, WebP, and HEIC images into a print-ready PDF album.
        </li>
        <li>
          <Link href="/finance/invoice-generator">Free PDF Invoice Generator</Link> — Create itemized commercial invoices with tax calculations and instant PDF export.
        </li>
      </ul>
    </article>
  );
}
