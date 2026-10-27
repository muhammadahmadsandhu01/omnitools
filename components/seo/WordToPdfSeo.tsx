import React from 'react';
import Link from 'next/link';

export const WORD_TO_PDF_FAQS = [
  {
    question: 'How does the Word to PDF Converter turn .docx files into PDF without server uploads?',
    answer:
      'KivaroTools unzips your Microsoft Word (.docx) OpenXML archive directly in browser memory using JSZip, parses word/document.xml to extract headings, styled paragraphs, bullet lists, and tables (<w:tbl>), and typesets a genuine %PDF-1.7 vector document using pdf-lib. Zero bytes leave your device, eliminating cloud latency and third-party data processor risks.',
  },
  {
    question: 'Are the generated PDFs true searchable vector text or flat rasterized images?',
    answer:
      'Our engine produces 100% true vector PDF documents with embedded StandardFonts (Helvetica, Helvetica-Bold, Helvetica-Oblique). Text remains crisp and selectable at 500% zoom, supports full-text Ctrl+F search, copies cleanly to the clipboard, and passes automated ATS (Applicant Tracking System) parsers—unlike low-quality converters that take blurry HTML canvas screenshots.',
  },
  {
    question: 'Can I convert Markdown (.md) and Plain Text (.txt) files directly to PDF?',
    answer:
      'Yes. In addition to ECMA-376 Word (.docx) documents, our engine natively parses Markdown (.md) files—rendering # H1, ## H2, ### H3 headings, bullet and numbered lists, and | col | pipe tables—as well as UTF-8 Plain Text (.txt) logs and transcripts with deterministic pagination.',
  },
  {
    question: 'How do I choose between A4, US Letter, and US Legal page dimensions?',
    answer:
      'Select A4 (595.28 x 841.89 pt / 210 x 297 mm) for international business, European, and academic standards. Choose US Letter (612 x 792 pt / 8.5 x 11 in) for standard North American corporate documentation and US Legal (612 x 1008 pt / 8.5 x 14 in) for court filings, loan agreements, and real estate contracts.',
  },
  {
    question: 'When should I select Landscape orientation instead of Portrait for Word and Markdown documents?',
    answer:
      'Switch to Landscape mode (e.g., 841.89 x 595.28 pt for A4) when your Word or Markdown document contains wide multi-column tables, software API schema definitions, or horizontal process flowcharts. This expands horizontal printable width by over 40%, preventing column clipping and awkward cell word-wrapping.',
  },
  {
    question: 'How do Narrow (36 pt), Normal (54 pt), and Wide (72 pt) margins affect document layout and page count?',
    answer:
      'Narrow margins (36 pt / 0.5 in) maximize printable area for dense single-page resumes, technical specifications, and tabular invoices. Normal margins (54 pt / 0.75 in) provide balanced typography for business memos and executive proposals. Wide margins (72 pt / 1.0 in) create an elegant, spacious editorial aesthetic for formal publications and legal briefs.',
  },
  {
    question: 'How does sanitizeWinAnsiText() handle smart curly quotes, em-dashes, and special symbols?',
    answer:
      'Standard PDF font encoders crash when encountering unmapped Unicode characters. Our built-in sanitizeWinAnsiText() normalizer maps smart single/double quotes (\u2018..\u201F) to clean ASCII quotes, en/em-dashes (\u2013..\u2014) to standard hyphens, ellipsis (\u2026) to three dots, and trademark/copyright glyphs to WinAnsi equivalents (0x20..0xFF) for crash-free rendering.',
  },
  {
    question: 'Are tables, bulleted lists, and heading hierarchies preserved when converting to PDF?',
    answer:
      'Yes. The OpenXML AST parser extracts <w:tbl>, <w:tr>, and <w:tc> table nodes, calculating proportional column widths, rendering 0.5 pt slate borders (#cbd5e1), and shading header rows (#f1f5f9). Bullet lists (<w:numPr>) receive precise left indentation with bullet markers, while headings scale proportionally (H1 at 1.65x, H2 at 1.35x, H3 at 1.15x base font size).',
  },
  {
    question: 'Can I set custom PDF document metadata such as Title and Author before exporting?',
    answer:
      'Yes. KivaroTools allows you to specify a custom Document Title and Author name in the interface. The engine applies these directly into the PDF /Info dictionary (via pdfDoc.setTitle and pdfDoc.setAuthor) and stamps the creation date, ensuring professional metadata compliance for client deliverables and public archiving.',
  },
  {
    question: 'What is the maximum file size supported by the client-side Word to PDF Converter?',
    answer:
      'KivaroTools supports files up to 250 MB (250 * 1024 * 1024 bytes) in WordToPdf.tsx. Because document parsing, text wrapping, and PDF binary compilation execute inside your browser memory via ArrayBuffers, you can process extensive multi-chapter manuscripts without cloud upload queues.',
  },
  {
    question: 'Is it safe to convert confidential employment contracts, NDAs, and resumes with KivaroTools?',
    answer:
      'Yes. All operations execute 100% locally in your browser sandbox. No file content, employee PII, or confidential contract clauses are ever sent across the network. The converter functions completely offline once the page is loaded, complying with HIPAA, GDPR, and enterprise confidentiality policies.',
  },
  {
    question: 'Why does my legacy binary .doc file fail to convert, and how do I save it as .docx?',
    answer:
      'Legacy .doc files use Microsoft\'s proprietary OLE2 Compound Document binary format from Word 97–2003. Modern client-side tools require the ISO/IEC 29500 (ECMA-376) OpenXML standard (.docx), which is a structured ZIP container of XML files. To convert a .doc file, simply open it in Microsoft Word, Google Docs, or LibreOffice and choose "Save As" > Word Document (.docx).',
  },
  {
    question: 'How does automatic multi-page word-wrapping and "Page X of Y" pagination work?',
    answer:
      'Our engine measures the exact width of candidate word strings against the active font and point size via font.widthOfTextAtSize(). When the vertical cursor approaches the bottom margin boundary (margin + 24 pt), the engine automatically allocates a fresh PDF page, continues rendering, and stamps a centered "Page X of Y" footer at the base of every page.',
  },
  {
    question: 'Why are vector PDFs from KivaroTools preferred by ATS (Applicant Tracking Systems) for resumes?',
    answer:
      'ATS scanners like Workday, Greenhouse, and Lever rely on raw text stream extraction. If a resume is converted using canvas screenshot rasterization, the text is trapped inside a flat image, resulting in zero parseable skills or work history. KivaroTools emits true vector text with correct reading order and embedded character encodings.',
  },
  {
    question: 'Can I edit text or preview extracted blocks before downloading the finalized PDF?',
    answer:
      'Yes. Before compiling the final PDF, you can review the parsed block hierarchy (Headings, Paragraphs, Lists, Tables) in the Live Document Preview and make real-time adjustments to typography, margins, paper size, and metadata without re-uploading your source document.',
  },
];

export default function WordToPdfSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: WORD_TO_PDF_FAQS.map((faq) => ({
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
    name: 'How to Convert Word (.docx) or Markdown to PDF Locally in Your Browser',
    description:
      'Convert Microsoft Word (.docx), Markdown (.md), or text documents into print-ready vector PDF files with custom margins and page numbering up to 250 MB.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Upload Your .DOCX, .MD, or .TXT Document (Up to 250 MB)',
        text: 'Drag and drop your Microsoft Word (.docx), Markdown (.md), or plain text file into the upload zone, or click "Load Sample Executive Proposal" to inspect the layout engine.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Configure Page Geometry, Orientation & Margins',
        text: 'Select A4, US Letter, or US Legal paper size, choose Portrait or Landscape orientation, and configure margin presets (Narrow 36pt, Normal 54pt, or Wide 72pt).',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Set Base Typography & Document Metadata',
        text: 'Choose base body font size (10pt, 11pt, or 12pt) and specify optional Document Title and Author metadata to be stamped into the PDF /Info dictionary.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Generate & Download Searchable Vector PDF',
        text: 'Click "Export Print-Ready PDF" to compile a true vector %PDF-1.7 document with automatic word wrapping and centered page numbering in milliseconds.',
      },
    ],
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      {/* FAQPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* HowTo Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <h2>Convert Word (.DOCX) &amp; Markdown to Print-Ready Vector PDF Online</h2>
      <p>
        The <strong>KivaroTools Word to PDF Converter</strong> is an executive-grade, client-side typesetting engine designed to transform <strong>Microsoft Word (<code>.docx</code>)</strong>, <strong>Markdown (<code>.md</code>)</strong>, and <strong>Plain Text (<code>.txt</code>)</strong> documents into crisp, searchable vector PDF files. Processing documents up to <strong>250 MB</strong> entirely within your browser&apos;s local RAM, it eliminates the file size limits, queues, and security vulnerabilities of remote cloud conversion portals.
      </p>

      <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800/60 not-italic">
        <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
          <strong>Deterministic Vector Typesetting:</strong> Unlike converters that rely on screen-capture canvas rendering, KivaroTools parses the OpenXML and Markdown Abstract Syntax Tree (AST) to generate true <code>%PDF-1.7</code> vector drawing instructions. Resumes, legal agreements, and corporate filings remain razor-sharp at any magnification and 100% readable by ATS scanners.
        </p>
      </blockquote>

      <h2>Page Geometry, Margin &amp; Typography Specification</h2>
      <p>
        The table below details the exact dimensional specifications, margin presets, and typographical scaling ratios implemented in <code>lib/wordToPdfEngine.ts</code>:
      </p>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 mb-6 not-prose">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700">Parameter</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700">Supported Values</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700">Exact Dimensions (Points / mm)</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700">Target Production Use Case</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">A4 Paper Size</td>
              <td className="p-3"><code>pageSize: &apos;a4&apos;</code></td>
              <td className="p-3">595.28 &times; 841.89 pt (210 &times; 297 mm)</td>
              <td className="p-3">International standard, UK/EU business &amp; academic</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">US Letter Size</td>
              <td className="p-3"><code>pageSize: &apos;letter&apos;</code></td>
              <td className="p-3">612.00 &times; 792.00 pt (8.5 &times; 11.0 in)</td>
              <td className="p-3">North American corporate memos, invoices &amp; resumes</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">US Legal Size</td>
              <td className="p-3"><code>pageSize: &apos;legal&apos;</code></td>
              <td className="p-3">612.00 &times; 1008.00 pt (8.5 &times; 14.0 in)</td>
              <td className="p-3">Court filings, loan disclosures &amp; real estate deeds</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">Narrow Margin</td>
              <td className="p-3"><code>margins: &apos;narrow&apos;</code></td>
              <td className="p-3">36.00 pt (0.50 in / 12.7 mm)</td>
              <td className="p-3">High-density single-page resumes &amp; technical specs</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">Normal Margin</td>
              <td className="p-3"><code>margins: &apos;normal&apos;</code></td>
              <td className="p-3">54.00 pt (0.75 in / 19.0 mm)</td>
              <td className="p-3">Standard executive proposals &amp; formal agreements</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">Wide Margin</td>
              <td className="p-3"><code>margins: &apos;wide&apos;</code></td>
              <td className="p-3">72.00 pt (1.00 in / 25.4 mm)</td>
              <td className="p-3">Spacious editorial publications &amp; legal briefs</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">Heading 1 Scale</td>
              <td className="p-3"><code>H1 = baseSize &times; 1.65</code></td>
              <td className="p-3">16.5 pt / 18.15 pt / 19.8 pt Bold</td>
              <td className="p-3">Document title and primary section divisions</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">Heading 2 Scale</td>
              <td className="p-3"><code>H2 = baseSize &times; 1.35</code></td>
              <td className="p-3">13.5 pt / 14.85 pt / 16.2 pt Bold</td>
              <td className="p-3">Major sub-sections and topic headers</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">Heading 3 Scale</td>
              <td className="p-3"><code>H3 = baseSize &times; 1.15</code></td>
              <td className="p-3">11.5 pt / 12.65 pt / 13.8 pt Bold</td>
              <td className="p-3">Minor sub-headings and module identifiers</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Enterprise Feature Comparison: KivaroTools vs. Cloud Word Converters</h2>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 mb-6 not-prose">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700">Feature / Capability</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700">KivaroTools Word to PDF</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700">Smallpdf / iLovePDF</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700">Adobe Acrobat Online</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700">Pandoc CLI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">Conversion Engine</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">100% In-Browser (pdf-lib Vector)</td>
              <td className="p-3 text-red-500">Cloud Server Farm</td>
              <td className="p-3 text-red-500">Adobe Document Cloud</td>
              <td className="p-3">Local CLI (Requires TeX Live)</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">Input Formats Supported</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">.DOCX, .MD (Markdown), .TXT</td>
              <td className="p-3">.DOCX / .DOC only</td>
              <td className="p-3">.DOCX only</td>
              <td className="p-3">Multiple (Requires CLI flags)</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">Max File Size Limit</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">250 MB (Instant RAM Processing)</td>
              <td className="p-3 text-amber-500">15 MB to 50 MB</td>
              <td className="p-3 text-amber-500">100 MB (Requires Login)</td>
              <td className="p-3">Local Disk Bound</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">ATS Resume Compatibility</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">100% Vector Text &amp; Standard Fonts</td>
              <td className="p-3">Good (Server Font Subs)</td>
              <td className="p-3">Excellent</td>
              <td className="p-3">Good (LaTeX Dependent)</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">Interactive Pre-Export Controls</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">Page Size, Orientation, Margins, Fonts</td>
              <td className="p-3 text-red-500">None (Blind Export)</td>
              <td className="p-3">Subscription Paywalled</td>
              <td className="p-3">CLI Arguments</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">Document Metadata Stamping</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">Title &amp; Author /Info Metadata</td>
              <td className="p-3 text-red-500">Stripped or Vendor Branded</td>
              <td className="p-3">Preserved</td>
              <td className="p-3">YAML Frontmatter</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">Daily Task Throttling</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">Zero Limits &amp; No Registration</td>
              <td className="p-3 text-amber-500">1–2 tasks / day cap</td>
              <td className="p-3 text-amber-500">1 trial task</td>
              <td className="p-3">Unlimited Local</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Word-to-PDF Typesetting &amp; Encoding Troubleshooting Grid</h2>
      <p>
        Resolve common document encoding, table formatting, and styling discrepancies with these diagnostic guidelines:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
            1. Why Binary .doc Files Fail and How to Save as .docx
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            Files with the <code>.doc</code> extension use the legacy Microsoft OLE2 Compound File binary format (Word 97&ndash;2003), which lacks the standardized XML hierarchy of ECMA-376. Open the document in Microsoft Word, Google Docs, or LibreOffice and select <strong>File &gt; Save As &gt; Word Document (.docx)</strong>. The resulting ZIP-based archive will unpack and convert instantly.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
            2. sanitizeWinAnsiText() Eliminates Font Encoder Exceptions
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            When standard PDF engines encounter curly smart quotes (&ldquo; &rdquo;), em-dashes (&mdash;), or typographic bullets outside basic ASCII, they often throw encoding exceptions. KivaroTools executes <code>sanitizeWinAnsiText()</code> on every text run, converting typographical quotes and dashes into safe WinAnsi code points (<code>0x20..0xFF</code>) without altering visual aesthetics.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
            3. Preventing Clipped Columns on Wide .docx &amp; Markdown Tables
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            If a document contains tables with 6 or more columns, Portrait mode may cause tight horizontal cell wrapping. Switch the orientation selector to <strong>Landscape</strong> and select <strong>Narrow Margins (36 pt)</strong>. This expands available horizontal printable width from 487 pt to over 769 pt on A4, providing ample room for multi-column data.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
            4. Accepting Track Changes &amp; Flattening Floating DrawingML Boxes
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            Word documents containing active Track Changes revisions (<code>&lt;w:del&gt;</code> and <code>&lt;w:ins&gt;</code>) or floating DrawingML absolute text frames (<code>&lt;w:drawing&gt;</code>) may omit unaccepted text. Prior to conversion, open the document in Microsoft Word, accept all revisions under the Review tab, and position content within standard flowing paragraphs.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
            5. ATS Resume Scanners Require Vector Text Streams
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            Applicant Tracking Systems (such as Greenhouse, Lever, and Workday) extract raw character streams. When resumes are exported as flat canvas image PDFs, ATS parsers read empty strings, causing immediate application rejection. KivaroTools compiles genuine vector <code>%PDF-1.7</code> text objects with standard font metrics for 100% ATS score fidelity.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
            6. Preserving Accented Latin-1 Characters (&eacute;, &uuml;, &ntilde;, &ccedil;)
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            Standard European accented letters within the Latin-1 Supplement range (such as &eacute;, &agrave;, &uuml;, &ouml;, &ntilde;, &ccedil;) are natively supported in the WinAnsi character map of <code>StandardFonts.Helvetica</code>. If your document uses non-Latin scripts (e.g. Cyrillic, Arabic, or CJK ideographs), the normalizer substitutes safe Latin transliterations to guarantee compilation.
          </p>
        </div>
      </div>

      <h2>Common Production Use Cases for Word &amp; Markdown to PDF</h2>
      <ul>
        <li>
          <strong>Executive Proposals &amp; Client Deliverables:</strong> Convert finalized <code>.docx</code> business proposals and sales agreements into immutable, professional PDF documents ready for electronic signature and distribution.
        </li>
        <li>
          <strong>Software Documentation &amp; README Publishing:</strong> Transform technical Markdown documentation, API change-logs, and architecture design records into paginated, table-formatted PDF handbooks without installing LaTeX or Pandoc.
        </li>
        <li>
          <strong>ATS-Optimized Resume Submission:</strong> Generate clean single-column or two-column vector PDFs from Word resumes, ensuring full readability across enterprise HR parsing software.
        </li>
        <li>
          <strong>Confidential Legal Briefs &amp; Board Packs:</strong> Typeset privileged internal memos and NDAs locally on air-gapped or restricted corporate workstations where cloud uploads are strictly barred.
        </li>
      </ul>

      <h2>Frequently Asked Questions (FAQ)</h2>
      <div className="space-y-3 not-prose mb-8">
        {WORD_TO_PDF_FAQS.map((faq, index) => (
          <details
            key={index}
            className="group rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
          >
            <summary className="font-semibold text-slate-900 dark:text-slate-100 text-base cursor-pointer select-none list-none flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 m-0">{faq.question}</h3>
              <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>

      <h2>Explore Related Document &amp; PDF Utilities</h2>
      <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
        <li>
          <Link href="/document/pdf-to-word" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            PDF to Word Converter (.DOCX, Markdown &amp; Text Extractor)
          </Link>{' '}
          &mdash; Reverse static PDF files into editable Word documents with heading and table reconstruction.
        </li>
        <li>
          <Link href="/document/excel-to-pdf" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Excel to PDF Converter (.XLSX &amp; CSV to Auto-Fitted Vector Tables)
          </Link>{' '}
          &mdash; Transform spreadsheets into executive PDF reports with repeating header rows and zebra striping.
        </li>
        <li>
          <Link href="/document/pdf-merge-split" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            PDF Merge &amp; Split Utility
          </Link>{' '}
          &mdash; Combine multiple converted chapters or extract specific page intervals with zero server uploads.
        </li>
        <li>
          <Link href="/document/image-to-pdf" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Image to PDF Converter (JPG, PNG, WebP &amp; HEIC to PDF)
          </Link>{' '}
          &mdash; Embed document cover pages, scanned receipts, and diagram photos into standalone or merged PDF files.
        </li>
        <li>
          <Link href="/developer/text-case-converter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Text Case Converter (Title Case, camelCase, UPPERCASE)
          </Link>{' '}
          &mdash; Clean and standardize document titles, headings, and legal clauses before generating PDF deliverables.
        </li>
      </ul>
    </article>
  );
}
