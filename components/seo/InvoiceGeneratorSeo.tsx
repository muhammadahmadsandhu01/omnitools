import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const INVOICE_GENERATOR_FAQS: FaqItem[] = [
  {
    question: 'How does client-side invoice generation protect confidential business data?',
    answer:
      'KivaroTools Invoice Generator executes 100% in your local web browser session using modern JavaScript and HTML5 Canvas APIs. Client billing addresses, proprietary hourly rates, registration numbers, line items, and banking instructions (IBAN/SWIFT) never transmit across the network to our servers or any third-party databases. Your draft is automatically saved to your browser local storage so you can safely resume editing later.',
  },
  {
    question: 'How does the automatic multi-page pagination algorithm prevent table cut-offs?',
    answer:
      'The generator includes a deterministic A4 page budgeting algorithm (computeInvoicePages in lib/invoiceEngine.ts). It measures vertical pixel heights for headers, logo graphics, multi-line item wrap lengths, and totals cards. When an invoice exceeds the standard A4 printable budget (1,030 pt usable height), items are cleanly partitioned across numbered continuation pages with synchronized column headers, guaranteeing that totals and bank remittance notes never collide with or truncate line items.',
  },
  {
    question: 'How are sub-unit decimals formatted across different international currencies?',
    answer:
      'Monetary calculations dynamically respect ISO 4217 specifications: zero decimals for zero-fraction currencies (such as Japanese Yen JPY and South Korean Won KRW), two decimals for standard currencies (such as USD, EUR, GBP, PKR, INR, AED, and SAR), and three decimals for Middle Eastern currencies (such as Kuwaiti Dinar KWD, Bahraini Dinar BHD, and Omani Rial OMR). All arithmetic uses decimal-safe half-up rounding to prevent binary floating-point discrepancies.',
  },
  {
    question: 'Can you include multiple customizable tax lines and discounts on a single invoice?',
    answer:
      'Yes. You can add multiple independent tax entries (such as State Sales Tax, Federal VAT, GST, or Municipal Surcharges) with custom percentage rates. Each line item can be toggled as taxable or tax-exempt. When a global discount is applied, our calculation engine proportionally allocates the discount between taxable and non-taxable subtotals, ensuring tax is calculated strictly on the net taxable balance.',
  },
  {
    question: 'Which file formats can I export my invoice to?',
    answer:
      'KivaroTools supports four versatile export pipelines: (1) Vector-rendered print-ready A4 PDF download via client-side PDF rendering; (2) Browser-native print formatting (@media print) allowing direct printing or Save as PDF; (3) Full JSON draft backup for re-importing and editing on any computer; and (4) Structured RFC 4180 CSV spreadsheet export of all line items for accounting ledgers like Excel or QuickBooks.',
  },
  {
    question: 'What are standard commercial payment terms (such as Net 30), and which should I choose?',
    answer:
      'Commercial payment terms define the credit window extended to the buyer before an invoice becomes overdue. Common terms include: "Due on Receipt" (immediate payment upon delivery), "Net 15" (payment due within 15 calendar days), "Net 30" (industry standard for B2B contracts, due within 30 days), "Net 60" (common for corporate or enterprise procurement), and "EOM" (End of Month). Shorter payment terms improve contractor cash flow, while longer terms are standard for large corporate clients.',
  },
  {
    question: 'Does this invoice generator fulfill government legal e-invoicing compliance requirements?',
    answer:
      'No standalone web document generator can replace official government-regulated e-invoicing portals. While KivaroTools generates commercially valid PDF invoices containing all standard commercial fields (Tax ID, registration numbers, itemized taxes, and remittance data), certain jurisdictions legally mandate cryptographically signed XML/UBL files routed through centralized tax authorities (such as Peppol in Europe, ZATCA in Saudi Arabia, Factur-X in France, or GSTN e-Invoicing in India). Always verify local statutory regulations.',
  },
  {
    question: 'What is the fundamental difference between an invoice, a receipt, and a quotation?',
    answer:
      'A quotation (estimate) is a pre-sale proposal outlining anticipated costs before work begins. An invoice is a formal commercial payment demand issued upon or during delivery of goods or services, creating a legal accounts receivable obligation. A receipt is an acknowledgment document issued strictly after payment has been completed, serving as proof of remittance.',
  },
  {
    question: 'How should sequential invoice numbers be structured for accounting audits?',
    answer:
      'Tax authorities (including IRS and HMRC) require sequential, non-repeating invoice numbering without gaps. Best practices include incorporating the fiscal year and a zero-padded integer, such as INV-2026-0001, or client-prefixed numbering like CLI-2026-042. Consistent numbering simplifies bank reconciliation and prevents audit penalties.',
  },
  {
    question: 'What image formats and dimensions are recommended for business logos?',
    answer:
      'Upload high-resolution PNG, JPG, or WebP images up to 2 MB. PNG files with transparent backgrounds are ideal for seamless rendering on white invoice paper. For security and cross-platform PDF consistency, SVG vector files are restricted to prevent embedded script execution.',
  },
  {
    question: 'How does the local draft recovery and auto-save feature work?',
    answer:
      'Every time you modify an invoice field, the state is synchronized in browser memory. Clicking "Save Draft" writes an encrypted snapshot to your browser localStorage (omni_invoice_draft_v4). When returning to KivaroTools, a restoration banner allows you to resume your draft with one click or discard it to start fresh.',
  },
  {
    question: 'How are partial payments, deposits, and retainers reflected on the invoice?',
    answer:
      'You can record upfront deposits or partial payments using the "Amount Paid" field. The calculation engine subtracts this figure from the Grand Total to clearly display the remaining "Balance Due", giving both you and your client transparent visibility into outstanding balances.',
  },
  {
    question: 'How does proportional discount allocation comply with VAT and GST tax audit rules?',
    answer:
      'When an invoice contains both taxable services and tax-exempt reimbursements alongside a global discount, applying the discount entirely against taxable items or non-taxable items creates audit non-compliance. KivaroTools calculates the exact Effective Taxable Discount = (Taxable Subtotal / Subtotal) × Discount Amount. This applies the discount proportionally across tax categories, ensuring full compliance with international VAT, GST, and sales tax regulations.',
  },
  {
    question: 'Why is SVG logo upload restricted in favor of PNG, JPG, and WebP formats?',
    answer:
      'Scalable Vector Graphics (SVG) are XML-based documents capable of executing embedded JavaScript (<script> tags or onload handlers). Allowing untrusted SVG uploads inside client-side generators poses a Stored Cross-Site Scripting (XSS) hazard. To protect your browser session and data integrity, KivaroTools accepts rasterized formats (PNG, JPG, WebP) and compresses them locally with high-DPI scaling.',
  },
  {
    question: 'How does KivaroTools defend CSV invoice exports against spreadsheet formula injection (CWE-1236)?',
    answer:
      'When exporting line items or financial totals to CSV, any text cell starting with mathematical formula trigger characters ("=", "+", "-", or "@") could execute unauthorized macros when opened in Microsoft Excel or Google Sheets. KivaroTools automatically prepends a single quote (\') to dangerous strings, completely neutralizing formula injection risks while preserving readable text.',
  },
];

export default function InvoiceGeneratorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: INVOICE_GENERATOR_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      {/* FAQ Schema Script Tag (Fix: previously missing in JSX) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Create and Download a Professional Tax-Compliant PDF Invoice Online',
            description: 'Step-by-step guide to building a custom commercial invoice with multi-currency formatting, line-item taxes, discounts, company logo, and vector PDF export.',
            step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Add Business Branding & Client Details',
        text: 'Upload your company logo (PNG, JPG, WebP), enter your business name, tax/VAT ID, billing address, and client recipient details.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Configure Invoice Number, Dates & Currency',
        text: 'Set your invoice number, issue date, payment due date, and choose from 150+ ISO currencies with automatic locale formatting.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Enter Line Items, Taxes & Discounts',
        text: 'Add products or services with quantities, unit prices, per-item or subtotal tax rates (GST, VAT, Sales Tax), discounts, and shipping fees.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Generate Print-Ready PDF or Export CSV/JSON',
        text: 'Preview the live A4/Letter invoice layout, download a high-resolution PDF, or export a CWE-1236 formula-safe CSV/JSON backup.',
      }
            ],
          }),
        }}
      />

      <section aria-labelledby="invoice-generator-free-professional-invoice-gene" className="mb-8">
        <h2 id="invoice-generator-free-professional-invoice-gene" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
          Free Professional Invoice Generator: Multi-Currency PDF Billing &amp; Local Auto-Save
        </h2>
        <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
          <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
            <strong>Privacy First &amp; Secure:</strong> All processing is done locally in your browser via client-side JavaScript. No client names, banking coordinates, item rates, or financial summaries are ever uploaded to remote servers.
          </p>
        </blockquote>
        <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
          Creating accurate, compliant invoices is critical for freelancers, consultants, contractors, and growing businesses.
          KivaroTools <strong>Invoice Generator</strong> delivers an enterprise-grade billing workspace directly in your web browser.
          Generate clean, print-ready PDF invoices with real-time tax calculations, itemized discounts, custom branding, and
          automatic multi-page pagination—with zero subscription fees, watermarks, or remote server uploads.
        </p>
      </section>

      {/* 1. Structural Elements Table */}
      <section aria-labelledby="invoice-generator-invoice-structure-amp-mandator" className="mb-8">
        <h3 id="invoice-generator-invoice-structure-amp-mandator" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
          Invoice Structure &amp; Mandatory Commercial Elements
        </h3>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          To ensure prompt payment and satisfy regional tax authority requirements (such as IRS W-9 guidelines, UK HMRC standards, or European VAT directives), commercial invoices must contain essential structural sections:
        </p>

        <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
          <table className="min-w-[640px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Section</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Required Fields</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Purpose &amp; Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Header &amp; Identity</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Company Name, Logo, Tax ID / VAT / GST, Registration Number</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Establishes legal identity of the issuing business entity.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Client Details</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Client Name, Billing Address, Shipping Address, Client Tax ID</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Directs liability and satisfies B2B input tax deduction rules.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Invoice Metadata</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Unique Invoice Number, Issue Date, Due Date, PO Number</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Enables cross-reference accounting and payment terms enforcement.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Line Items Grid</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Description, Quantity, Unit Type, Unit Rate, Line Discount</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Itemizes deliverable goods or billable service hours transparently.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Summary &amp; Remittance</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Subtotal, Tax Breakdowns, Total Due, Bank Details (IBAN/SWIFT)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Specifies exact payable amounts and direct banking routing.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Payment Terms Guide */}
      <section aria-labelledby="invoice-generator-standard-commercial-payment-te" className="mb-8">
        <h3 id="invoice-generator-standard-commercial-payment-te" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
          Standard Commercial Payment Terms: Cash Flow &amp; Enforcement
        </h3>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          Selecting appropriate payment terms directly affects your company cash flow and defines when late fees may legally apply:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
          <li>
            <strong>Due on Receipt:</strong> Payment is expected immediately upon delivery of the invoice. Recommended for freelancers, one-off digital assets, and milestone completion handoffs.
          </li>
          <li>
            <strong>Net 15:</strong> Payment must be remitted within 15 calendar days from the invoice date. Commonly used by agencies and small contractors to maintain tight 2-week receivables cycles.
          </li>
          <li>
            <strong>Net 30:</strong> The corporate standard for B2B billing. Grants the client 30 calendar days to process invoices through their internal accounts payable department.
          </li>
          <li>
            <strong>Net 60:</strong> Extended 60-day terms customary in enterprise supply chain procurement and government contracts.
          </li>
          <li>
            <strong>End of Month (EOM):</strong> Payment is due on the final calendar day of the month in which the invoice was issued.
          </li>
        </ul>
      </section>

      {/* 3. Document Comparison Table */}
      <section aria-labelledby="invoice-generator-invoice-vs-receipt-vs-quotatio" className="mb-8">
        <h3 id="invoice-generator-invoice-vs-receipt-vs-quotatio" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
          Invoice vs. Receipt vs. Quotation: Key Differences
        </h3>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          Using the correct commercial document prevents bookkeeping disputes and preserves audit integrity:
        </p>
        <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
          <table className="min-w-[640px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Document Type</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Issuance Timing</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Legal &amp; Accounting Function</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Quotation / Estimate</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Prior to project kickoff or delivery</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Commercial offer specifying expected scope and pricing. Not a debt demand.</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Unpaid (No debt created)</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Commercial Invoice</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Upon or during fulfillment of goods/services</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Formal legal payment demand; establishes accounts receivable &amp; payable.</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Outstanding (Payment demanded)</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Payment Receipt</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Strictly after funds are received</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Irrevocable proof that financial obligation has been settled.</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Settled (Funds cleared)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Calculation Order & Proportional Allocation */}
      <section aria-labelledby="invoice-generator-mathematical-calculation-order" className="mb-8">
        <h3 id="invoice-generator-mathematical-calculation-order" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
          Mathematical Calculation Order &amp; Proportional Tax Allocation
        </h3>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          To prevent floating-point calculation anomalies and ensure financial precision, KivaroTools employs a deterministic 7-step mathematical model:
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
          <li>
            <strong>Line Item Totals:</strong> <code>Line Total = round((Quantity &times; Rate) &minus; Line Discount)</code>, with negative discounts clamped to zero.
          </li>
          <li>
            <strong>Subtotal:</strong> Sum of all line item totals rounded to the currency&apos;s ISO minor unit.
          </li>
          <li>
            <strong>Taxable vs. Non-Taxable Subtotals:</strong> Items marked tax-exempt are isolated from the taxable subtotal pool.
          </li>
          <li>
            <strong>Proportional Global Discount Allocation:</strong> If an invoice-level discount is applied, it is proportionally distributed between taxable and exempt pools: <code>Effective Taxable Discount = (Taxable Subtotal / Subtotal) &times; Discount Amount</code>.
          </li>
          <li>
            <strong>Tax Calculation:</strong> Each enabled tax rate applies strictly to the net taxable base: <code>Tax Amount = round(Taxable Base &times; Rate%)</code>.
          </li>
          <li>
            <strong>Grand Total:</strong> <code>Grand Total = Taxable Base + Non-Taxable Base + Sum(Taxes) + Shipping + Additional Fees</code>.
          </li>
          <li>
            <strong>Balance Due:</strong> <code>Balance Due = max(0, Grand Total &minus; Amount Paid)</code>.
          </li>
        </ol>
      </section>

      {/* 5. A4 Pagination Engine */}
      <section aria-labelledby="invoice-generator-automatic-multi-page-a4-pagina" className="mb-8">
        <h3 id="invoice-generator-automatic-multi-page-a4-pagina" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
          Automatic Multi-Page A4 Pagination Engine
        </h3>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          A common flaw in simple web invoicing tools is awkward page breaks—where table rows get clipped in half, or total balances appear orphaned on a blank second page. KivaroTools solves this with an integrated <strong>A4 Page Budgeting Algorithm</strong>:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
          <li>
            <strong>Single-Page Optimization:</strong> If your invoice contains 15 items or fewer that fit cleanly within the 1,030-point printable height, the entire document is rendered on a single page with full header and summary cards.
          </li>
          <li>
            <strong>Continuation Pages:</strong> When extensive project scopes require multiple pages, the engine automatically generates compact continuation headers (e.g. &quot;Page 2 of 3&quot;) with synchronized table column widths.
          </li>
          <li>
            <strong>Summary Anchor Reserve:</strong> The engine reserves sufficient vertical budget on the final page so that tax breakdowns, bank transfer details, and sign-off terms always sit comfortably below line items.
          </li>
        </ul>
      </section>

      {/* 6. Step-by-Step Guide */}
      <section aria-labelledby="invoice-generator-how-to-create-amp-export-your-" className="mb-8">
        <h3 id="invoice-generator-how-to-create-amp-export-your-" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
          How to Create &amp; Export Your Invoice
        </h3>
        <ol className="list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
          <li>
            <strong>Enter Sender &amp; Client Info:</strong> Input your business name, contact details, tax numbers, and upload your high-resolution company logo.
          </li>
          <li>
            <strong>Set Currency &amp; Dates:</strong> Choose your billing currency (supporting 30+ global currencies including USD, EUR, GBP, PKR, INR, AED, and SAR), assign a sequential invoice number, and set payment due dates.
          </li>
          <li>
            <strong>Add Line Items:</strong> Add service items or physical goods, customize quantity units (hours, days, units, kg), and adjust unit rates.
          </li>
          <li>
            <strong>Configure Taxes &amp; Discounts:</strong> Enable relevant sales tax, VAT, or GST rates, apply itemized or global discounts, and add shipping or handling charges if applicable.
          </li>
          <li>
            <strong>Print or Download PDF:</strong> Click <em>Print / PDF</em> to generate a clean, vector-rendered A4 invoice via your browser print dialog, or export a JSON backup for future re-use.
          </li>
        </ol>
      </section>

      {/* ZONE 5: DEDICATED PITFALLS, EDGE CASES & VERIFICATION GUIDE */}
      <section aria-labelledby="invoice-generator-financial-pitfalls-and-edge-cases" className="mb-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h2 id="invoice-generator-financial-pitfalls-and-edge-cases" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Common Financial Pitfalls, Edge Cases &amp; Verification Guide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
              1. Flat Discount Deductions vs Proportional Tax Allocation
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              When an invoice mixes taxable consulting fees with non-taxable travel disbursements, subtracting a flat lump-sum discount exclusively from the total produces illegal VAT or GST calculations under audit. KivaroTools applies proportional discounting: <code>Effective Taxable Discount = (Taxable Subtotal / Subtotal) &times; Discount Amount</code>, ensuring tax is computed strictly on the discounted taxable fraction.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
              2. Multi-Page A4 Height Budgeting (1,030 pt Usable Space)
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Basic PDF generators often chop line items in half across page boundaries or push the summary totals to a detached second page. Our height-aware engine tracks printable space against a 1,030-point budget, automatically injecting repeating column headers and continuation page numbering so totals and remittance instructions never detach.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
              3. ISO-4217 Minor Currency Units: 0, 2 &amp; 3 Decimals
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Applying 2 decimals to currencies like Japanese Yen (JPY) or Korean Won (KRW) results in invalid financial records, while Middle Eastern currencies like Kuwaiti Dinar (KWD), Bahraini Dinar (BHD), and Omani Rial (OMR) mandate 3 decimal places. KivaroTools enforces native ISO-4217 fractional decimal rules across 30+ world currencies.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
              4. Vector Script Injection Security: Blocking Malicious SVG Logos
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Allowing arbitrary SVG image uploads introduces Stored Cross-Site Scripting (XSS) vulnerabilities because SVG files can contain embedded XML scripts. KivaroTools accepts high-resolution PNG, JPG, and WebP logos, compressing them safely in local browser memory with zero risk of code injection.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
              5. RFC-4180 CSV Export Security (CWE-1236 Defense)
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              When exporting line items to CSV for accounting imports, malicious cell entries starting with &ldquo;=&rdquo;, &ldquo;+&rdquo;, &ldquo;-&rdquo;, or &ldquo;@&rdquo; can execute formulas in Excel or Google Sheets. KivaroTools prepends an apostrophe prefix to neutralize spreadsheet formula injection while preserving clean tabular formatting.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
              6. Local Draft Auto-Recovery (omni_invoice_draft_v4)
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Accidental browser tab closure or power loss will not destroy your work. KivaroTools maintains your draft snapshot in encrypted browser localStorage. Upon reopening the page, a restore banner allows you to resume your invoice draft in one click or reset the workspace with zero server transmission.
            </p>
          </div>
        </div>
      </section>

      {/* 8. FAQs */}
      <section aria-labelledby="invoice-generator-frequently-asked-questions" className="mb-8">
        <h3 id="invoice-generator-frequently-asked-questions" className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {INVOICE_GENERATOR_FAQS.map((faq, index) => (
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

        {/* 9. Internal Linking Silo */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
            Related Financial &amp; Billing Utilities
          </h4>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/finance/salary-calculator"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Salary &amp; Net Take-Home Pay Calculator &rarr;
            </Link>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <Link
              href="/finance/crypto-converter"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Crypto &amp; Currency Converter &rarr;
            </Link>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <Link
              href="/finance/mortgage-calculator"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Mortgage &amp; Home Loan Calculator &rarr;
            </Link>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <Link
              href="/finance/emi-calculator"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Loan EMI &amp; Amortization Calculator &rarr;
            </Link>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <Link
              href="/finance/compound-interest"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Compound Interest Calculator &rarr;
            </Link>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <Link
              href="/finance/sip-calculator"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              SIP &amp; Mutual Funds Calculator &rarr;
            </Link>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <Link
              href="/finance/precious-metals"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Precious Metals Scrap Calculator &rarr;
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}