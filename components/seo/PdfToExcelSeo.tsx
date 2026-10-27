import React from 'react';
import Link from 'next/link';

export const PDF_TO_EXCEL_FAQS = [
  {
    question: 'How does KivaroTools extract PDF tables into native Excel (.xlsx) without server uploads?',
    answer:
      'KivaroTools uses an in-browser PDF coordinate parser (lib/pdfClientEngine.ts) combined with SheetJS (xlsx v0.18.5) and pdf-lib. The engine inflates /FlateDecode streams, measures exact X/Y Cartesian coordinates for every text run, groups runs sharing a vertical baseline (within 0.45x font size), detects column boundaries at horizontal gaps exceeding max(24 pt, 1.1x font size), and builds a structured 2D array that SheetJS serializes into a binary OpenXML .xlsx workbook directly in local RAM.',
  },
  {
    question: 'Why do copy-pasted PDF tables collapse into Column A in Excel, and how does your engine prevent it?',
    answer:
      'Standard operating system clipboards treat PDF text selections as an unformatted stream of characters separated by line breaks, discarding physical spatial coordinates. When pasted into Excel, all columns collapse into Column A. KivaroTools reconstructs the spatial 2D matrix by measuring horizontal X-spacing between glyph clusters, mapping each distinct column into an independent spreadsheet cell container.',
  },
  {
    question: 'What is the difference between "Merged Single Sheet" and "One Sheet Per Page" modes?',
    answer:
      'Merged Single Sheet mode appends extracted tables from all selected PDF pages into one continuous "Extracted_Data" worksheet tab, ideal for continuous bank transaction ledgers, credit card statements, and invoice batches. One Sheet Per Page mode allocates isolated worksheet tabs ("Page_1", "Page_2", ...) for each page, ideal for multi-department financial summaries and quarterly report packets.',
  },
  {
    question: 'How does CWE-1236 Spreadsheet Formula Injection sanitization protect against malicious CSV payloads?',
    answer:
      'CWE-1236 (Improper Neutralization of Formula Elements in a CSV File) occurs when untrusted cell values starting with =, +, -, @, \\t, or \\r execute external Dynamic Data Exchange (DDE) commands or macro payloads when opened in desktop Excel. Our built-in sanitizeSpreadsheetCell() prepends a neutralizing apostrophe (\') to escape potentially hazardous formula prefixes before serialization.',
  },
  {
    question: 'Why are negative accounting numbers like -$150.25 and -$1,200.00 exempted from formula escaping?',
    answer:
      'While leading minus signs (-) can trigger formula execution in vulnerable spreadsheets, legitimate accounting ledgers routinely feature negative balances and expenses. KivaroTools utilizes a strict numeric validation regex (/^-[0-9.,$€£¥₹%\\s]+$/). Legitimate negative numbers and currency values bypass formula sanitization and remain native numeric entries for calculation.',
  },
  {
    question: 'Can I export extracted tables to RFC-4180 CSV and structured JSON simultaneously with .xlsx?',
    answer:
      'Yes. KivaroTools provides a 3-in-1 export suite from the exact same parsed in-memory table model: native binary Microsoft Excel (.xlsx) with auto-sized column widths, standards-compliant RFC-4180 CSV (.csv) with comma/quote escaping, and structured JSON arrays (.json) for programmatic database or Python pandas ingestion.',
  },
  {
    question: 'How does automatic column width calculation (ws[\'!cols\']) prevent truncated "###" cells in Excel?',
    answer:
      'When spreadsheets open in Excel, columns narrower than their contained numeric or date strings display "###" overflow errors. KivaroTools calculates column width metadata using ws[\'!cols\'] = { wch: Math.min(42, Math.max(10, maxColCharLen + 3)) }, ensuring all currency figures, invoice dates, and descriptions render with comfortable padding.',
  },
  {
    question: 'Can I extract tables from only specific pages (e.g., pages 12-15) of a 200-page annual report?',
    answer:
      'Yes. Our custom page range filter supports "all" or specific intervals such as "1-5, 8, 12-15". The engine clamps out-of-bounds numbers, ignores non-tabular narrative pages, and processes only the designated financial tables, reducing memory usage and eliminating unwanted spreadsheet tabs.',
  },
  {
    question: 'Can I preview and edit table cells in the browser before downloading the spreadsheet?',
    answer:
      'Yes. KivaroTools renders an interactive Live Spreadsheet Grid Preview displaying extracted rows, column headers, and sheet tabs. You can audit column alignment, fix OCR typos, delete empty rows, and verify numbers directly inside the browser before exporting to .xlsx, .csv, or .json.',
  },
  {
    question: 'What is the maximum PDF file size supported for client-side Excel table extraction?',
    answer:
      'KivaroTools enforces a 250 MB (250 * 1024 * 1024 bytes) maximum file size limit in PdfToExcel.tsx. Because processing occurs entirely within browser memory via ArrayBuffers, large multi-year audit workbooks and government compendiums convert without server upload timeouts or throttles.',
  },
  {
    question: 'Is it safe to convert confidential bank statements, invoices, and payroll ledgers with KivaroTools?',
    answer:
      'Yes. 100% of the extraction and file construction occurs inside your browser sandbox. Bank account numbers, employee salaries, vendor tax IDs, and confidential balance sheets are never uploaded to any remote server or cloud bucket. The utility works completely offline once loaded.',
  },
  {
    question: 'Why does a scanned image PDF of a paper receipt fail to extract rows without OCR?',
    answer:
      'A scanned PDF or smartphone photo is a flat pixel bitmap (JPEG/PNG) without underlying text character streams (BT/ET, Tj). Because KivaroTools operates client-side without sending files to cloud OCR servers, scanned image PDFs contain no extractable text coordinates. For scanned documents, use our PDF to JPG/PNG Converter at 300 DPI for OCR preparation.',
  },
  {
    question: 'How are repeating table headers handled when merging multiple PDF pages into a single worksheet?',
    answer:
      'In Merged Single Sheet mode, multi-page tables often repeat column headers at the top of each page. The live preview lets you inspect and delete redundant header rows, or you can filter out duplicate header rows with a single Excel AutoFilter condition after opening the exported .xlsx workbook.',
  },
  {
    question: 'How do I open extracted CSV files in Microsoft Excel with UTF-8 currency symbols (€, £, ¥, ₹) intact?',
    answer:
      'Our RFC-4180 CSV export encodes all characters in clean UTF-8. When opening directly in older versions of Microsoft Excel, use the "Data > From Text/CSV" import wizard and select "65001: Unicode (UTF-8)" encoding to ensure international currency symbols and accented characters display with 100% fidelity.',
  },
  {
    question: 'Why are there zero daily task limits, subscriptions, or watermarks on KivaroTools?',
    answer:
      'Cloud-based conversion services incur heavy server maintenance and bandwidth overhead, forcing them to restrict free users to 1–2 files per day and paywall spreadsheet exports behind $10–$25/month subscriptions. KivaroTools utilizes client-side WebAssembly and JavaScript, enabling completely free, unlimited, and watermark-free conversions.',
  },
];

export default function PdfToExcelSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PDF_TO_EXCEL_FAQS.map((faq) => ({
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
    name: 'How to Convert PDF Tables to Excel (.xlsx) and CSV Online Privately',
    description:
      'Step-by-step guide to extracting tabular data from PDF files into Microsoft Excel (.xlsx), CSV, and JSON formats locally in your browser up to 250 MB.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Select or Drag & Drop Your PDF Document (Up to 250 MB)',
        text: 'Upload any financial statement, invoice, or data report PDF up to 250 MB, or click "Load Sample Bank Statement" to test the extraction engine immediately.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Choose Worksheet Organization & Security Options',
        text: 'Select between "Merged Single Sheet" (for continuous ledgers) or "One Sheet Per Page", and ensure CWE-1236 Formula Sanitization is enabled for untrusted PDFs.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Inspect & Edit Extracted Spreadsheet Grid',
        text: 'Review the extracted rows and columns in the Live Data Grid. Inspect column alignment, edit cell values, or filter page ranges (e.g. "1-5, 8") as needed.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Download Native .XLSX, CSV, or JSON',
        text: 'Click "Download Excel (.xlsx)" to save an OpenXML workbook with auto-fitted column widths, or export as RFC-4180 CSV or JSON array for developer pipelines.',
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

      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
        Convert PDF Tables to Native Excel (.XLSX) &amp; CSV with Zero Server Uploads
      </h2>
      <p>
        The <strong>KivaroTools PDF to Excel &amp; CSV Converter</strong> is a high-speed, client-side table extraction suite built for financial auditors, accountants, data engineers, and quantitative researchers. Engineered with deterministic X/Y spatial coordinate clustering, it converts complex multi-page financial statements, bank transaction summaries, and invoice ledgers into native <strong>Microsoft Excel (<code>.xlsx</code>)</strong>, <strong>RFC-4180 CSV (<code>.csv</code>)</strong>, and <strong>Structured JSON (<code>.json</code>)</strong> formats up to <strong>250 MB</strong> entirely in browser RAM.
      </p>

      <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800/60 not-italic">
        <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
          <strong>Bank-Grade Privacy &amp; OWASP CWE-1236 Defense:</strong> Processing executes 100% locally on your device. Account balances, IBANs, payroll figures, and client billing records never leave your machine. Built-in formula sanitization neutralizes malicious macro and DDE injections while preserving legitimate negative accounting values.
        </p>
      </blockquote>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        How Spatial Coordinate Table Extraction Works
      </h2>
      <p>
        Unlike plain text extractors that collapse adjacent tabular columns into a single unformatted line, our engine performs a 4-stage spatial geometric reconstruction:
      </p>
      <ol>
        <li>
          <strong>Content Stream Inflation &amp; Coordinate Tracking:</strong> The parser uncompresses <code>/FlateDecode</code> streams, tokenizes glyph placement matrices (<code>Tm</code>, <code>Td</code>), and computes the exact physical point coordinates (<code>x</code>, <code>y</code>) and rendered font size of every text fragment.
        </li>
        <li>
          <strong>Baseline Y-Coordinate Row Grouping:</strong> Text fragments sharing a vertical baseline within a vertical threshold of <code>0.45 &times; fontSize</code> are grouped into unified horizontal rows.
        </li>
        <li>
          <strong>Horizontal X-Gap Column Boundary Detection:</strong> On each row, when the horizontal distance between adjacent text runs exceeds <code>max(24 pt, 1.1 &times; fontSize)</code>, the parser registers a distinct column boundary. Runs within a smaller gap are joined as single multi-word cell values.
        </li>
        <li>
          <strong>2D Grid Assembly &amp; Auto-Width Sizing:</strong> Consecutive rows with aligned column boundaries are structured into a 2D matrix. Column character lengths are analyzed to set SheetJS column width metadata (<code>ws[&apos;!cols&apos;]</code>) between 10 and 42 characters, eliminating truncated cells upon opening in Excel.
        </li>
      </ol>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        Spatial Table Extraction &amp; CWE-1236 Security Specification
      </h2>
      <p>
        The table below details the mathematical parameters, security sanitizers, and export capabilities implemented in <code>lib/pdfToExcelEngine.ts</code>:
      </p>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left border-collapse text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">Parameter / Rule</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[140px]">Mathematical Heuristic</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[160px]">Engine Behavior</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[160px]">Security / Output Objective</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">X-Coordinate Column Split</td>
              <td className="p-3"><code>gap &gt; max(24 pt, 1.1 &times; fontSize)</code></td>
              <td className="p-3">Partitions row into adjacent cell containers</td>
              <td className="p-3">Prevents multi-column table collapse into Column A</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Baseline Y-Tolerance</td>
              <td className="p-3"><code>|y1 - y2| &le; 0.45 &times; fontSize</code></td>
              <td className="p-3">Groups fragments into a single spreadsheet row</td>
              <td className="p-3">Aligns numbers with descriptions across row baseline</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Auto Column Width</td>
              <td className="p-3"><code>wch: clamp(10, maxLen + 3, 42)</code></td>
              <td className="p-3">Assigns SheetJS <code>ws[&apos;!cols&apos;]</code> metadata</td>
              <td className="p-3">Prevents &ldquo;###&rdquo; numeric overflow in Microsoft Excel</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">CWE-1236 Dangerous Prefixes</td>
              <td className="p-3">Starts with <code>=, +, -, @, \t, \r</code></td>
              <td className="p-3">Prepends neutralizing single quote (<code>&apos;</code>)</td>
              <td className="p-3">Blocks DDE macro execution and formula injection</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Negative Number Exemption</td>
              <td className="p-3"><code>/^-[0-9.,$€£¥₹%\s]+$/</code></td>
              <td className="p-3">Bypasses formula escaping for valid negatives</td>
              <td className="p-3">Preserves numeric status for accounting calculations</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Export Formats</td>
              <td className="p-3"><code>.xlsx, .csv (RFC-4180), .json</code></td>
              <td className="p-3">Single-pass binary and text serialization</td>
              <td className="p-3">Immediate compatibility with Excel, Calc, and pandas</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        Enterprise Feature Comparison: KivaroTools vs. Cloud PDF Table Extractors
      </h2>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left border-collapse text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">Feature / Capability</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[140px]">KivaroTools PDF to Excel</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[140px]">Smallpdf / iLovePDF</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[140px]">Adobe Acrobat Online</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[140px]">Tabula (Desktop)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Processing Location</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">100% In-Browser (Local RAM)</td>
              <td className="p-3 text-red-500">Cloud Server Upload</td>
              <td className="p-3 text-red-500">Adobe Cloud Upload</td>
              <td className="p-3">Local Desktop (Java JVM)</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Maximum File Size</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">250 MB (Instant RAM Processing)</td>
              <td className="p-3 text-amber-500">15 MB to 50 MB</td>
              <td className="p-3 text-amber-500">100 MB (Requires Account)</td>
              <td className="p-3">Local RAM Bound</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">CWE-1236 Formula Defense</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">Automatic with Negative Number Exemption</td>
              <td className="p-3 text-red-500">None</td>
              <td className="p-3 text-red-500">None</td>
              <td className="p-3 text-red-500">None</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Multi-Format Triple Export</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">.XLSX, RFC-4180 CSV, JSON Arrays</td>
              <td className="p-3">.XLSX only</td>
              <td className="p-3">.XLSX only</td>
              <td className="p-3">CSV / TSV</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Worksheet Organization Modes</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">Merged Single Sheet vs Sheet per Page</td>
              <td className="p-3">Single Sheet only</td>
              <td className="p-3">Page per Sheet only</td>
              <td className="p-3">Separate CSVs</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Live Grid Preview &amp; Editing</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">Interactive In-Browser Grid</td>
              <td className="p-3 text-red-500">None</td>
              <td className="p-3">Subscription Paywalled</td>
              <td className="p-3">Basic Selection Box</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Daily Task Limits</td>
              <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">Unlimited &amp; 100% Free Forever</td>
              <td className="p-3 text-amber-500">1–2 tasks / day cap</td>
              <td className="p-3 text-amber-500">1 free trial task</td>
              <td className="p-3">Unlimited Local</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        PDF-to-Excel Table Extraction &amp; Security Troubleshooting Grid
      </h2>
      <p>
        Address common spreadsheet alignment challenges, formula injection vulnerabilities, and multi-page anomalies:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            1. Why Copy-Pasting PDF Tables into Excel Fails
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            Operating system clipboards treat PDF text selections as a single unformatted stream, discarding column coordinates. When pasted into Excel, all columns collapse into Column A. KivaroTools measures horizontal X-spacing between glyph clusters, splitting runs at <code>max(24 pt, 1.1 &times; fontSize)</code> into discrete, structured spreadsheet cells.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            2. CWE-1236 Formula Defense &amp; Negative Number Safety
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            Malicious CSV payloads beginning with <code>=cmd|&apos;/c calc&apos;!A0</code> or <code>@SUM</code> execute arbitrary code when opened in desktop spreadsheets. KivaroTools prepends a single quote (<code>&apos;</code>) to escape dangerous characters. However, genuine accounting negatives (such as <code>-$150.25</code>) bypass escaping via regex validation to remain active numeric values.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            3. Choosing Merged Single Sheet vs. One Sheet Per Page
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            Use <strong>Merged Single Sheet</strong> mode for continuous transaction histories, bank statements, or credit card ledgers where all rows belong in a unified table. Select <strong>One Sheet Per Page</strong> mode for quarterly investor reports or multi-department audits where each page contains distinct, self-contained financial tables.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            4. Why Scanned Image PDFs Require OCR Pre-Processing
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            Scanned invoices, receipts, and camera captures consist of flat raster bitmap images without underlying vector text streams (<code>BT/ET</code>, <code>Tj</code>). Without character coordinates, spatial extraction returns zero rows. For photographed receipts, export pages using our <Link href="/document/pdf-to-jpg" className="text-blue-600 dark:text-blue-400 underline">PDF to JPG/PNG Converter</Link> at 300 DPI for optical character recognition.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            5. Handling Multi-Line Wrapped Descriptions in Table Cells
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            In financial invoices, line-item descriptions frequently wrap across 2 or 3 lines while quantity and price stay on one line. Our engine groups fragments by Y-tolerance. In the interactive preview grid, you can review wrapped rows and concatenate text before exporting, or use Excel&apos;s <code>TRIM()</code> and merge tools after download.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            6. Preserving UTF-8 Currency Symbols (€, £, ¥, ₹) in CSV
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
            When opening RFC-4180 CSV exports in older versions of Microsoft Excel, international currency glyphs may display garbled characters if Excel defaults to ANSI encoding. To preserve symbols cleanly, import the file via <strong>Data &gt; From Text/CSV</strong> with <strong>UTF-8 (65001)</strong> selected, or simply download the native binary <code>.xlsx</code> workbook.
          </p>
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        Common Production Use Cases for PDF Table Extraction
      </h2>
      <ul>
        <li>
          <strong>Bank Statement &amp; Ledger Reconciliation:</strong> Accountants and bookkeepers convert monthly PDF bank statements from Chase, Bank of America, Amex, and Barclays into clean Excel workbooks for QuickBooks or Xero importing.
        </li>
        <li>
          <strong>SEC 10-K &amp; 10-Q Financial Modeling:</strong> Financial analysts extract balance sheets, income statements, and cash flow schedules from 100+ page corporate filings into structured CSV and JSON arrays for valuation models.
        </li>
        <li>
          <strong>Vendor Invoice &amp; Purchase Order Processing:</strong> Supply chain managers convert PDF vendor billing sheets into tabular spreadsheets for ERP reconciliation without entering data manually.
        </li>
        <li>
          <strong>Academic Research &amp; Clinical Trial Data:</strong> Researchers extract statistical tables and demographic summaries from scientific PDF publications into pandas DataFrames or R environments.
        </li>
      </ul>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        Frequently Asked Questions (FAQ)
      </h2>
      <div className="space-y-3 not-prose mb-8">
        {PDF_TO_EXCEL_FAQS.map((faq, index) => (
          <details
            key={index}
            className="group rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
          >
            <summary className="font-semibold text-slate-900 dark:text-slate-100 text-base cursor-pointer select-none list-none flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white m-0">{faq.question}</h3>
              <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">
        Explore Related Document &amp; Spreadsheet Utilities
      </h2>
      <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
        <li>
          <Link href="/document/excel-to-pdf" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Excel to PDF Converter (.XLSX &amp; CSV to Auto-Fitted Vector Tables)
          </Link>{' '}
          &mdash; Convert formatted spreadsheets back into printable executive PDF reports with repeating headers.
        </li>
        <li>
          <Link href="/document/pdf-to-word" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            PDF to Word Converter (.DOCX, Markdown &amp; Text Extractor)
          </Link>{' '}
          &mdash; Transform PDF documents into fully editable Word files with heading and paragraph reconstruction.
        </li>
        <li>
          <Link href="/developer/json-converter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            JSON Converter (JSON to CSV, Excel, YAML &amp; XML)
          </Link>{' '}
          &mdash; Transform structured JSON arrays into flat spreadsheets with built-in formula injection defenses.
        </li>
        <li>
          <Link href="/document/pdf-merge-split" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            PDF Merge &amp; Split Utility
          </Link>{' '}
          &mdash; Split large annual reports into specific chapters before running tabular data extraction.
        </li>
        <li>
          <Link href="/finance/invoice-generator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Invoice Generator &amp; PDF Billing Tool
          </Link>{' '}
          &mdash; Create customizable, calculation-validated client invoices with instant PDF export.
        </li>
      </ul>
    </article>
  );
}
