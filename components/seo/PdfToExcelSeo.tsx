import React from 'react';
import Link from 'next/link';

export default function PdfToExcelSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does KivaroTools extract tables from PDF to Excel (.xlsx) and CSV in the browser?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our spatial table extraction engine reads the exact X/Y coordinate matrix of every text item on each PDF page, clusters items sharing the same horizontal Y-baseline into rows, maps horizontal X-gaps into distinct spreadsheet columns, and compiles native multi-sheet Excel (.xlsx) workbooks via SheetJS (xlsx) locally in your browser.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I convert multi-page bank statements and financial reports into a single consolidated sheet or separate sheets per page?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! You can toggle between "Separate Sheet per PDF Page" (Page_1, Page_2, etc.) and "Single Consolidated Master Sheet" (which stacks all extracted rows across every page into a unified ledger table for instant pivot-table analysis).',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the converter protect against CSV & Excel Formula Injection (CWE-1236)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'When exporting extracted PDF text to Excel (.xlsx) or RFC-4180 CSV, our CWE-1236 sanitizer automatically neutralizes cells starting with executable formula triggers (=, +, -, @, Tab, CR) so untrusted PDF invoices cannot trigger DDE or macro execution in Microsoft Excel.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does it automatically convert numeric currency strings into real Excel numbers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. When "Auto-Parse Numeric & Currency Values" is enabled, strings like "$14,250.00" or "85.4%" are parsed into native IEEE-754 numeric cells so you can run SUM(), AVERAGE(), and XLOOKUP() formulas immediately without manual text-to-column cleanup.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is it safe to convert confidential bank statements, payroll ledgers, and tax tables here?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '100% safe. Unlike online PDF-to-Excel websites that upload your bank statements to remote servers, KivaroTools processes your PDF entirely inside your local browser memory. Zero financial records ever leave your device.',
        },
      },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Convert PDF Tables & Bank Statements to Excel (.xlsx) or CSV Locally',
    description:
      'Extract tabular data, financial statements, and invoices from PDF documents into native Microsoft Excel (.xlsx), CSV, or JSON files 100% client-side.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Drop Your PDF Document or Load Sample Financial Ledger',
        text: 'Select any PDF containing financial tables, invoices, or schedules (up to 100 MB), or click "Load Sample Financial PDF" to test table extraction immediately.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Configure Sheet Structure & Numeric Parsing',
        text: 'Choose between Single Consolidated Sheet or One Sheet per Page, enable numeric/currency auto-typing, and ensure CWE-1236 Formula Injection Defense is active.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Inspect & Edit Cells in the Interactive Data Grid',
        text: 'Preview every extracted row and column right in the browser. Click any cell in the interactive grid to edit values before downloading.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Export to Excel (.XLSX), CSV, or JSON',
        text: 'Download a native multi-sheet Microsoft Excel (.xlsx) workbook, an RFC-4180 UTF-8 CSV file, or a structured JSON array.',
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

      <h2>Extract PDF Tables to Microsoft Excel (.XLSX), CSV &amp; JSON Locally</h2>
      <p>
        The <strong>KivaroTools PDF to Excel &amp; CSV Converter</strong> is a zero-upload financial and tabular data extraction engine designed for accountants, auditors, operations managers, and data analysts. It reconstructs rows, columns, and numeric values from PDF bank statements, vendor invoices, quarterly earnings reports, and inventory catalogs directly into native <strong>Microsoft Excel (<code>.xlsx</code>)</strong> workbooks, <strong>RFC-4180 CSV</strong> files, and <strong>JSON</strong> arrays—100% inside your browser.
      </p>

      <blockquote>
        <strong>Privacy First &amp; Secure — 100% Client-Side Execution:</strong> Financial statements, payroll summaries, and corporate tax schedules are among the most sensitive documents in any organization. With KivaroTools, your PDF is parsed in local browser RAM with zero server uploads.
      </blockquote>

      <h3>How Spatial X/Y Coordinate Clustering Reconstructs PDF Tables</h3>
      <p>
        Standard PDF files do not store HTML-like <code>&lt;table&gt;</code> tags; instead, every number and label is drawn at an arbitrary <code>(x, y)</code> coordinate on the page canvas. Our extraction pipeline recovers the underlying spreadsheet grid using deterministic spatial geometry:
      </p>
      <ol>
        <li>
          <strong>Y-Axis Row Quantization:</strong> Text runs whose vertical coordinates fall within a configurable baseline tolerance (3.5pt) are grouped into horizontal table rows and sorted top-to-bottom.
        </li>
        <li>
          <strong>X-Axis Column Boundary Alignment:</strong> Within each row, items are sorted left-to-right. Adjacent text tokens separated by less than a single word space are merged into a single cell, while wider horizontal jumps define distinct spreadsheet columns.
        </li>
        <li>
          <strong>Numeric &amp; Currency Type Inference:</strong> Accounting strings such as <code>$12,450.75</code>, <code>(450.00)</code>, and <code>18.5%</code> are automatically cleaned and typed as numeric values so Excel formulas work out of the box.
        </li>
        <li>
          <strong>CWE-1236 Formula Injection Hardening:</strong> Any extracted string beginning with <code>=</code>, <code>+</code>, <code>-</code>, or <code>@</code> is sanitized to block malicious spreadsheet formula execution.
        </li>
      </ol>

      <h3>Comparison: KivaroTools vs. Cloud PDF-to-Excel Extractors</h3>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
        <table className="min-w-[640px] w-full text-sm text-left border-collapse">
          <thead>
            <tr>
              <th>Feature</th>
              <th>KivaroTools PDF to Excel</th>
              <th>Smallpdf / iLovePDF</th>
              <th>Tabula (Desktop Java)</th>
              <th>Adobe Acrobat Online</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Zero-Upload Local Privacy</strong></td>
              <td><strong>100% In-Browser RAM</strong></td>
              <td>Cloud Server Upload</td>
              <td>Local (Requires Java VM)</td>
              <td>Adobe Cloud Upload</td>
            </tr>
            <tr>
              <td><strong>Live Editable Cell Preview</strong></td>
              <td><strong>Interactive Browser Grid</strong></td>
              <td>No (Blind Download)</td>
              <td>No</td>
              <td>Paywalled</td>
            </tr>
            <tr>
              <td><strong>Export Formats</strong></td>
              <td><strong>.XLSX, .CSV, .JSON</strong></td>
              <td>.XLSX only</td>
              <td>.CSV / .TSV</td>
              <td>.XLSX</td>
            </tr>
            <tr>
              <td><strong>Sheet Consolidation Modes</strong></td>
              <td><strong>Merged Master or Per-Page Tabs</strong></td>
              <td>Fixed</td>
              <td>Per-Selection</td>
              <td>Single Sheet</td>
            </tr>
            <tr>
              <td><strong>CWE-1236 Formula Guard</strong></td>
              <td><strong>Built-In Protection</strong></td>
              <td>No</td>
              <td>No</td>
              <td>No</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Frequently Asked Questions (FAQ)</h3>
      <div>
        <h4>1. Can I edit cells in the browser before downloading the Excel file?</h4>
        <p>
          Yes! Every cell in the extracted preview table is live-editable. You can fix a header label, adjust a number, or inspect multi-page sheets right in the workspace before clicking Export.
        </p>

        <h4>2. What is the difference between &ldquo;Single Consolidated Sheet&rdquo; and &ldquo;One Sheet per Page&rdquo;?</h4>
        <p>
          <strong>Single Consolidated Sheet</strong> appends rows from all PDF pages into one continuous table—ideal for 12-month bank statements or multi-page invoices. <strong>One Sheet per Page</strong> creates separate worksheet tabs (<code>Page_1</code>, <code>Page_2</code>, etc.) inside the <code>.xlsx</code> workbook.
        </p>

        <h4>3. How can I convert an Excel spreadsheet back into a formatted PDF?</h4>
        <p>
          Use our companion <Link href="/document/excel-to-pdf">Excel &amp; CSV to PDF Converter</Link> to render <code>.xlsx</code> and <code>.csv</code> files into vector landscape or portrait PDF tables with repeating headers.
        </p>
      </div>

      <h3>Related Financial &amp; Document Utilities</h3>
      <ul>
        <li>
          <Link href="/document/excel-to-pdf">Excel to PDF Converter (.XLSX / .CSV to .PDF)</Link> — Render spreadsheets into auto-fitted landscape or portrait PDF report tables.
        </li>
        <li>
          <Link href="/developer/json-converter">JSON to Excel &amp; CSV Converter</Link> — Flatten nested JSON payloads up to 50 MB into native <code>.xlsx</code> and <code>.csv</code> files.
        </li>
        <li>
          <Link href="/document/pdf-to-word">PDF to Word (.DOCX) Converter</Link> — Reconstruct full PDF documents into editable Microsoft Word files.
        </li>
        <li>
          <Link href="/finance/invoice-generator">Free PDF Invoice Generator</Link> — Build commercial invoices with automatic tax and discount calculations.
        </li>
      </ul>
    </article>
  );
}
