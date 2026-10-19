import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const PDF_MERGE_SPLIT_FAQS: FaqItem[] = [
  {
    question: 'How does client-side PDF processing protect document privacy?',
    answer:
      'Unlike traditional cloud converters that upload documents to external remote servers, KivaroTools executes all PDF parsing, page extraction, splitting, and merging 100% locally in your web browser memory via pdf-lib and Web APIs. Confidential contracts, legal briefs, tax filings, medical reports, and financial statements never travel across the internet or touch third-party disks.',
  },
  {
    question: 'Can I split a PDF into separate individual 1-page documents?',
    answer:
      'Yes. In Split & Extract mode, choose the "Every Page (ZIP)" option. The tool extracts each page as an independent single-page PDF document (e.g. document_page_01.pdf, document_page_02.pdf) and packages them into a clean, downloadable ZIP archive without server round-trips.',
  },
  {
    question: 'How do custom page ranges and multi-part splits work?',
    answer:
      'You can extract specific pages into a single document using comma-separated numbers and hyphenated ranges (e.g. "1-4, 7, 9-12"). If you select "By Ranges (ZIP)", you can separate distinct document sections using semicolons (e.g. "1-5; 6-10; 11-15"). Each section is assembled into its own standalone PDF file and bundled into a ZIP archive.',
  },
  {
    question: 'What are the file size and batch limits for merging?',
    answer:
      'You can merge up to 50 PDF files in a single session, with an individual file limit of 250 MB and a combined batch size limit of 750 MB. Because processing runs in client memory, these generous thresholds prevent browser tab crashes while accommodating heavy multi-page documents and image scans.',
  },
  {
    question: 'Why are password-protected or encrypted PDFs rejected?',
    answer:
      'Encrypted and password-protected PDF files restrict binary parsing and page extraction without authorized cryptographic decryption keys. To prevent document corruption, KivaroTools detects encrypted files during preflight inspection and prompts you to decrypt them with authorized software prior to processing.',
  },
  {
    question: 'Are bookmarks, vector fonts, and form fields preserved when merging?',
    answer:
      'Page visual layout, vector artwork, embedded fonts, image fidelity, crop boxes, and page rotations are preserved exactly. However, interactive AcroForm input fields, JavaScript actions, and complex hierarchical bookmarks are flattened to standard page streams to prevent catalog naming collisions between different source documents.',
  },
  {
    question: 'Can I reorder PDF files before merging on mobile devices?',
    answer:
      'Yes. In addition to drag-and-drop on desktop, every file in the merge list features dedicated, accessible Move Up and Move Down arrow buttons. This ensures reliable keyboard navigation and seamless touch reordering on smartphones and tablets.',
  },
];

export default function PdfMergeSplitSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PDF_MERGE_SPLIT_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-6 sm:p-8 md:p-10 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        In-Browser PDF Management: Fast, Private Document Merging &amp; Splitting
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Managing Portable Document Format (PDF) files should not require expensive software subscriptions, command-line complexity,
        or uploading confidential information to third-party cloud servers. The KivaroTools <strong>PDF Merge &amp; Split Tool</strong>{' '}
        delivers a streamlined document workshop running 100% locally in your web browser. Combine multiple PDF reports into a single
        continuous document, extract exact page selections, split multi-page files into individual 1-page documents, or partition
        records by custom ranges into ZIP archives—all with zero server uploads and instant local processing.
      </p>

      {/* WORKFLOW COMPARISON TABLE */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Supported PDF Workflows at a Glance
      </h3>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 font-bold">Workflow Mode</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 font-bold">Input Capacity</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 font-bold">Key Capabilities</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 font-bold">Output Format</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Merge PDFs</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">2 to 50 files (750 MB total)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Keyboard reordering, preflight validation, custom filename</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-medium">Single consolidated .pdf</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Extract Pages</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">1 document (up to 250 MB)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Custom ranges (e.g. 1-3, 5), presets (Odd, Even, First/Last)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Trimmed .pdf with selected pages</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Every Page (ZIP)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">1 document (up to 250 MB)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Automated 1-click single-page splitting with padded numbering</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-purple-600 dark:text-purple-400 font-medium">Compressed .zip with separate PDFs</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">By Ranges (ZIP)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">1 document (up to 250 MB)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Multi-part splitting with semicolon syntax (e.g. 1-5; 6-10)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-purple-600 dark:text-purple-400 font-medium">Compressed .zip with partitioned PDFs</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* STEP BY STEP GUIDES */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Step-by-Step Instructions
      </h3>

      <div className="space-y-6 mb-8">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
            How to Merge Multiple PDF Files into One
          </h4>
          <ol className="list-decimal space-y-1.5 pl-5 text-slate-600 dark:text-slate-400">
            <li>Ensure the <strong>Merge PDFs</strong> tab is active at the top of the workspace.</li>
            <li>Drag and drop your PDF documents into the upload region or click to select files from your file explorer.</li>
            <li>Inspect the document list. Check individual file sizes, page counts, and verification badges.</li>
            <li>Adjust page sequence using the <strong>Move Up</strong> and <strong>Move Down</strong> arrow buttons. The top-to-bottom list sequence strictly determines the final page order.</li>
            <li>(Optional) Type a custom name into the <em>Output Filename</em> field.</li>
            <li>Click <strong>Merge &amp; Download PDF</strong>. The tool combines page trees in browser memory and downloads the consolidated document immediately.</li>
          </ol>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
            How to Extract Selected Pages into a New PDF
          </h4>
          <ol className="list-decimal space-y-1.5 pl-5 text-slate-600 dark:text-slate-400">
            <li>Switch to the <strong>Split &amp; Extract</strong> tab and upload your target PDF document.</li>
            <li>Select the <strong>Extract Pages</strong> splitting method.</li>
            <li>Enter your target page numbers or intervals in the <em>Pages to Extract</em> field (e.g., <code className="text-xs">1-3, 5, 8-10</code>), or click a quick preset button (<em>Odd Pages</em>, <em>Even Pages</em>, or <em>First &amp; Last</em>).</li>
            <li>Verify the live status badge confirming the number of selected pages.</li>
            <li>Click <strong>Extract &amp; Download PDF</strong> to download your trimmed document.</li>
          </ol>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
            How to Split a PDF into Separate Individual Pages or Parts (ZIP)
          </h4>
          <ol className="list-decimal space-y-1.5 pl-5 text-slate-600 dark:text-slate-400">
            <li>Upload your document in the <strong>Split &amp; Extract</strong> workspace.</li>
            <li>Choose <strong>Every Page (ZIP)</strong> to automatically turn each page into an independent 1-page PDF.</li>
            <li>Alternatively, choose <strong>By Ranges (ZIP)</strong> and specify section boundaries separated by semicolons (e.g., <code className="text-xs">1-5; 6-10; 11-15</code>).</li>
            <li>Click <strong>Split &amp; Download ZIP</strong>. Each document part is generated, verified, and packaged into a ZIP archive for immediate local download.</li>
          </ol>
        </div>
      </div>

      {/* HOW CLIENT-SIDE ENGINE WORKS */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How Client-Side PDF Processing Works
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Conventional online PDF converters send your files to remote cloud servers running command-line utilities
        like Ghostscript or Poppler. KivaroTools executes the entire PDF specification parser directly inside your web browser
        using pure JavaScript binary manipulation via <strong>pdf-lib</strong> and <strong>JSZip</strong>:
      </p>
      <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-8">
        <li>
          <strong>In-Memory Preflight Inspection:</strong> When you drop a document into the workspace, the tool inspects
          the header slice for valid magic bytes (<code className="text-xs">%PDF-</code>), parses the cross-reference (<code className="text-xs">xref</code>)
          table, and verifies that the document is unencrypted and syntactically sound.
        </li>
        <li>
          <strong>Native Content Stream Copying:</strong> Pages are copied as native PDF content stream dictionaries.
          Embedded OpenType/TrueType vector fonts, vector paths, high-resolution imagery, and page crop boxes remain intact
          without lossy rasterization or quality degradation.
        </li>
        <li>
          <strong>Post-Generation Invariant Verification:</strong> Before triggering a file download, the generated byte stream
          is reloaded into an independent parser to verify that its byte structure is valid and that output page counts match
          the expected mathematical sum.
        </li>
        <li>
          <strong>Zero Network Footprint:</strong> Because document objects are constructed inside browser heap memory,
          your files are never transmitted across the network, stored on third-party drives, or exposed to cloud data retention policies.
        </li>
      </ul>

      {/* REAL-WORLD USE CASES */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Practical Real-World Use Cases
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-sm">
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
          <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">Legal &amp; Real Estate Briefs</p>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            Combine deeds, title documents, addendums, and disclosures into a single organized packet, preserving confidential client data without cloud exposure.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
          <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">Financial &amp; Tax Filings</p>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            Extract relevant schedules from voluminous tax returns, or consolidate monthly bank statements and receipts into one audit-ready document.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
          <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">Academic &amp; Research Reports</p>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            Extract selected journal figures, separate thesis chapters into individual files, or combine multi-author research papers for peer distribution.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
          <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">Office Invoices &amp; Receipts</p>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            Split a scanned monthly stack of 50 receipts into individual single-page PDF files using <em>Every Page (ZIP)</em> mode for streamlined bookkeeping.
          </p>
        </div>
      </div>

      {/* TROUBLESHOOTING & COMMON ERRORS */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Troubleshooting Common PDF Issues
      </h3>
      <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-8">
        <li>
          <strong>&ldquo;File is encrypted or password-protected&rdquo;:</strong> PDF files protected with user or owner passwords cannot be
          reorganized in browser memory without encryption keys. Remove the password using your authorized PDF reader before merging or extracting.
        </li>
        <li>
          <strong>&ldquo;Invalid reversed range (e.g. 5-2)&rdquo;:</strong> Range start numbers cannot exceed end numbers. Re-enter the range in ascending order (e.g. <code className="text-xs">2-5</code>).
        </li>
        <li>
          <strong>&ldquo;Page exceeds document total&rdquo;:</strong> Verify that your requested page numbers exist in the source document. The live validation badge indicates the total available pages.
        </li>
        <li>
          <strong>Browser Memory Alerts:</strong> If merging dozens of high-DPI image scans, ensure your device has sufficient free RAM. The tool enforces a 250 MB single-file and 750 MB batch limit to maintain stability.
        </li>
      </ul>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <dl className="space-y-6 mb-8">
        {PDF_MERGE_SPLIT_FAQS.map((faq, index) => (
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

      {/* RELATED TOOLS */}
      <div className="pt-6 border-t border-gray-200 dark:border-slate-800">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
          Related Document &amp; Productivity Utilities
        </h4>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/document/image-to-pdf"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Image to PDF Converter &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/finance/invoice-generator"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Invoice Generator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/media/image-compressor"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Image Compressor &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/developer/base64-encoder"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Base64 Encoder &amp; Decoder &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}