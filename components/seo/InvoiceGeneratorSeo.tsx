import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const INVOICE_GENERATOR_FAQS: FaqItem[] = [
  {
    question: 'Is this free online invoice generator really no signup and no watermark?',
    answer:
      'Yes. KivaroTools opens directly in your browser with no signup, no login wall, and no monthly cap. Downloaded A4 PDFs and printed invoices have no watermark or KivaroTools branding footer, and you can save drafts locally or export JSON and CSV files without registering.',
  },
  {
    question: 'Where is my invoice data processed and stored?',
    answer:
      'All invoice calculations, A4 preview rendering, PDF export, CSV export, and JSON import/export run in client-side JavaScript inside your browser. Your invoice fields are not uploaded to KivaroTools servers. When you click Save Draft, the invoice is saved as a plain JSON snapshot in your browser localStorage (omni_invoice_draft_v4) on that device until you discard it or clear browser storage.',
  },
  {
    question: 'Can I bill in local and international currencies like USD, EUR, GBP, PKR, INR, AED, CAD, PHP, NGN, and ZAR?',
    answer:
      'Yes. The currency selector loads 150+ ISO-4217 currencies via the browser Intl API (with a built-in fallback list of major global currencies). Minor-unit decimal formatting adjusts automatically: 0 decimals for currencies such as JPY and KRW, 2 decimals for USD, EUR, GBP, PKR, INR, AED, CAD, PHP, NGN, and ZAR, and 3 decimals for KWD, BHD, and OMR.',
  },
  {
    question: 'How do I show a 50% deposit, partial payment, and remaining balance on an invoice?',
    answer:
      'Enter the full project line items, set Status to Partially Paid, and enter the upfront deposit in Amount Already Paid. The tool subtracts the paid amount from the Grand Total and prints both Amount Paid and Balance Due on the A4 invoice.',
  },
  {
    question: 'Can I add both per-line discounts and an invoice-wide discount?',
    answer:
      'Yes. Each line item includes a Line Disc. field for item-specific reductions, and the Adjustments section lets you apply an invoice-wide percentage (0–100%) or fixed-amount discount. Discounts reduce the taxable base before taxes are calculated.',
  },
  {
    question: 'How do multiple tax rows and mixed taxable and non-taxable items work?',
    answer:
      'Click + Add Tax to add multiple invoice-level tax rows (for example, 5% GST and provincial PST, or federal and local taxes). Use the Tax checkbox on each line item to mark whether that line is taxable or non-taxable (exempt). When an invoice-level discount is applied alongside mixed taxable and exempt items, the discount is allocated proportionally: Effective Taxable Discount = (Taxable Subtotal / Subtotal) × Discount Amount. Note: tax rates apply at the invoice level to all checked taxable items rather than assigning different positive tax percentages to separate rows.',
  },
  {
    question: 'Does shipping get taxed automatically on this invoice generator?',
    answer:
      'No. Shipping and Additional Fees (such as a Processing Fee) are added after tax calculation and are excluded from the taxable base. If your jurisdiction requires taxing delivery charges on taxable goods, add delivery as a taxable line item instead.',
  },
  {
    question: 'How can I include bank wire details (IBAN, SWIFT/BIC) and my Tax ID or NTN?',
    answer:
      'Enter your Tax ID, VAT, GST, or NTN and Business Registration Number in the From (Business Details) section, and add your Bank Name, Account Name, Account Number or IBAN, and SWIFT/BIC in Payment Instructions. All entered details appear cleanly in the A4 header and remittance footer.',
  },
  {
    question: 'How do I reuse a past invoice as a template or export line items to Excel?',
    answer:
      'Click Save Draft to store your current invoice in your browser for quick restoration on your next visit, or click JSON to download a portable backup file you can reload on any device using Import JSON. Click CSV to download an RFC 4180 spreadsheet file with CWE-1236 formula-injection protection (prepending a leading apostrophe to text cells beginning with =, +, -, or @ while preserving valid numeric amounts) for Excel or Google Sheets.',
  },
  {
    question: 'What is the difference between Download PDF and Print?',
    answer:
      'Download PDF renders each A4 page locally in your browser at 2× resolution into a print-ready A4 PDF file without opening a print dialog. Print triggers your browser native print layout (@media print), which lets you print directly or choose Save as PDF for native selectable vector text.',
  },
  {
    question: 'Does this tool generate statutory government e-invoices (FBR PRAL, India GST Rule 46, UAE FTA, UK HMRC VAT, CRA, BIR, NRS/FIRS, SARS)?',
    answer:
      'No. KivaroTools generates general-purpose English commercial A4 invoices suitable for freelancers, agencies, and cross-border service billing. Businesses legally required to issue government-integrated e-invoices, cryptographically signed QR codes, bilingual tax layouts, or per-line multi-rate VAT invoices—such as Pakistan FBR PRAL, India CBIC Rule 46/48 HSN/IRN, UAE bilingual FTA Tax Invoices, UK HMRC multi-rate VAT (VATREC5010), Canada CRA RC4022, Philippines BIR EOPT/EIS (RMC 77-2024), Nigeria NRS/FIRS, or South Africa SARS VAT 404—must use licensed statutory compliance software.',
  },
  {
    question: 'What image formats are supported for company logos, and why is SVG blocked?',
    answer:
      'You can upload PNG, JPG, or WebP logos up to 2 MB (transparent PNGs look cleanest on white A4 paper). SVG files are blocked because SVG is an XML format that can contain embedded scripts, posing a cross-site scripting (XSS) risk and inconsistent canvas rendering during PDF export.',
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

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create and Download a Free A4 PDF Invoice Online',
    description:
      'Step-by-step guide to creating a commercial A4 PDF invoice in your browser with no signup, no watermark, multi-currency formatting, line-item discounts, multiple tax rows, partial payments, and CSV/JSON export.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Set Invoice Details, Currency & Branding',
        text: 'Enter your invoice number, issue date, payment terms (which auto-calculate the due date), optional PO/Reference number, billing currency from 150+ ISO-4217 options, and an optional PNG/JPG/WebP logo.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Enter Business (From) & Client (Bill To) Information',
        text: 'Add your business name, address, email, and optional Tax ID/VAT/GST/NTN, registration number, and website alongside your client billing and shipping details.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Add Line Items, Discounts, Taxes & Deposits',
        text: 'List services or products with quantity, unit, unit price, optional per-line discount, and taxable/exempt checkbox. Configure invoice-wide discounts, one or more tax rows, shipping, fees, and any Amount Already Paid.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Review Live A4 Preview & Export PDF, Print, CSV, or JSON',
        text: 'Check the height-aware multi-page A4 preview, add bank wire details (IBAN/SWIFT) and notes, then download your A4 PDF, print via browser print, export a formula-safe CSV, or save a reusable JSON backup.',
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

      {/* Section 1: 60-Second Workflow */}
      <section aria-labelledby="invoice-howto-heading" className="mb-8">
        <h2 id="invoice-howto-heading" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
          How to Create &amp; Download a Clean A4 PDF Invoice in 60 Seconds
        </h2>
        <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
          <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
            <strong>No Signup, No Watermark &amp; Client-Side:</strong> Build and download clean A4 PDF invoices immediately with no signup and no watermark. All calculations and exports run locally in your browser without sending your billing details to KivaroTools servers.
          </p>
        </blockquote>
        <ol className="list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-4">
          <li>
            <strong>Configure Metadata &amp; Currency:</strong> Set your sequential invoice number (for example, <code>INV-2026-001</code>), pick your payment terms (such as <em>Net 15</em> or <em>Net 30</em>—the due date updates automatically), add an optional PO/Reference, upload a PNG/JPG/WebP logo, and choose from 150+ ISO-4217 currencies.
          </li>
          <li>
            <strong>Enter Sender &amp; Client Details:</strong> Fill in your business name, billing address, email, and optional Tax ID / VAT / GST / NTN or registration number, plus your client&apos;s billing and optional shipping address.
          </li>
          <li>
            <strong>Add Line Items &amp; Adjustments:</strong> Enter each service or product with quantity, unit, rate, optional per-line discount, and taxable/exempt checkbox. Add invoice-wide discounts, multiple tax rows, shipping, processing fees, or upfront deposits.
          </li>
          <li>
            <strong>Add Bank Details &amp; Export:</strong> Paste wire instructions (Bank Name, Account Name, IBAN, SWIFT/BIC) and terms, inspect the live multi-page A4 preview, and click <strong>Download PDF</strong>, <strong>Print</strong>, <strong>CSV</strong>, or <strong>JSON</strong>.
          </li>
        </ol>
      </section>

      {/* Section 2: Multi-Currency & Cross-Border Freelance Billing */}
      <section aria-labelledby="invoice-multicurrency-heading" className="mb-8">
        <h2 id="invoice-multicurrency-heading" className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
          Freelance, Cross-Border &amp; Multi-Currency Billing (150+ Currencies)
        </h2>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          Whether you are invoicing domestic clients in PKR, INR, AED, PHP, NGN, ZAR, GBP, or CAD or billing international retainers in USD and EUR, the currency selector supports 150+ ISO-4217 currencies with automatic minor-unit decimal precision: <strong>0 decimals</strong> for currencies like JPY and KRW, <strong>2 decimals</strong> for USD, EUR, GBP, PKR, INR, AED, CAD, PHP, NGN, and ZAR, and <strong>3 decimals</strong> for KWD, BHD, and OMR.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-4">
          <li>
            <strong>Direct Bank Wire Fields (IBAN &amp; SWIFT/BIC):</strong> Include your Bank Name, Account Name, IBAN/Account Number, and SWIFT/BIC inside <em>Payment Instructions</em> so international clients can remit via bank transfer or Wise without card-processing fees.
          </li>
          <li>
            <strong>Zero-Tax Export &amp; Non-VAT Billing:</strong> Leave the tax list empty for 0% tax-free commercial invoices—common for cross-border freelance services in Pakistan, India (export of services under LUT), the Philippines, or non-VAT sole proprietors in the UK, UAE, and South Africa.
          </li>
          <li>
            <strong>Native Multi-Page A4 Pagination:</strong> When long project scopes exceed a single A4 sheet (794&times;1123 px canvas with 990 px usable content height), the pagination engine automatically splits rows onto numbered continuation pages with repeating table headers so totals never clip or detach awkwardly.
          </li>
        </ul>
      </section>

      {/* Section 3: Deposits & Partial Payments */}
      <section aria-labelledby="invoice-partial-payments-heading" className="mb-8">
        <h2 id="invoice-partial-payments-heading" className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
          How to Track Deposits &amp; Partial Payments (Amount Paid &amp; Balance Remaining)
        </h2>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          Freelancers, agencies, and contractors frequently collect a 30% or 50% upfront deposit before delivery. Instead of manually editing line items to hide previous payments, use the built-in partial payment workflow:
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-4">
          <li>List the full project deliverables so the invoice clearly documents the complete contract value and subtotal.</li>
          <li>Set the invoice <strong>Status</strong> dropdown to <strong>Partially Paid</strong>.</li>
          <li>Enter the deposit already received in <strong>Amount Already Paid</strong>. The live A4 totals card displays <em>Total Due</em>, <em>Amount Paid</em>, and the exact remaining <strong>Balance Due</strong>.</li>
          <li>Export a <strong>JSON</strong> backup so you can reload the invoice later and update the status to <em>Paid</em> once the final installment clears.</li>
        </ol>
      </section>

      {/* Section 4: Calculation Order & Mixed Tax Math */}
      <section aria-labelledby="invoice-math-heading" className="mb-8">
        <h2 id="invoice-math-heading" className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
          Per-Line Discounts, Multi-Tax Rows &amp; Mixed Taxable / Non-Taxable Math
        </h2>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          To eliminate floating-point rounding drift, all totals use decimal-safe commercial half-up rounding in a fixed, transparent 7-step sequence:
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-4">
          <li>
            <strong>Line Item Totals:</strong> <code>Line Total = round((Qty &times; Rate) &minus; Line Discount)</code>, with negative inputs clamped to 0 and line discounts capped at the line gross.
          </li>
          <li>
            <strong>Subtotal:</strong> Sum of all line totals rounded to the selected currency&apos;s ISO decimal places.
          </li>
          <li>
            <strong>Taxable vs. Non-Taxable Pools:</strong> Items with the <em>Tax</em> checkbox checked enter the taxable subtotal; unchecked items remain tax-exempt.
          </li>
          <li>
            <strong>Proportional Invoice Discount:</strong> An invoice-wide percentage (0–100%) or fixed discount is allocated proportionally between taxable and exempt subtotals: <code>Effective Taxable Discount = (Taxable Subtotal / Subtotal) &times; Discount Amount</code>.
          </li>
          <li>
            <strong>Multiple Tax Rows:</strong> Click <strong>+ Add Tax</strong> to apply one or more independent invoice-level taxes (for example, 5% GST plus provincial PST) strictly against the net <code>Taxable Base</code>.
          </li>
          <li>
            <strong>Shipping &amp; Additional Fees:</strong> Shipping and custom fees (such as a Processing Fee) are added outside the tax base: <code>Grand Total = Taxable Base + Non-Taxable Base + Total Tax + Shipping + Fee</code>. If your local rules require taxing delivery, enter delivery as a taxable line item.
          </li>
          <li>
            <strong>Balance Due:</strong> <code>Balance Due = max(0, Grand Total &minus; Amount Paid)</code>.
          </li>
        </ol>
      </section>

      {/* Section 5: Reuse Without an Account */}
      <section aria-labelledby="invoice-reuse-heading" className="mb-8">
        <h2 id="invoice-reuse-heading" className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
          Reuse Invoices Without an Account: Local Drafts, JSON Import &amp; CSV Export
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose my-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1.5">
              1. Browser Draft Save
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Click <strong>Save Draft</strong> to store your seller profile, bank details, and active line items locally in browser storage (<code>omni_invoice_draft_v4</code>). A banner lets you restore or discard it on your next visit.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1.5">
              2. Portable JSON Templates
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Export any invoice to <strong>JSON</strong> to keep a lightweight client template on your computer. Next month, click <strong>Import JSON</strong>, increment the invoice number and dates, and export a fresh PDF in seconds.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1.5">
              3. Formula-Safe CSV Bookkeeping
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Click <strong>CSV</strong> to export metadata, line items, and totals in RFC 4180 format for Excel or Google Sheets. Text cells starting with <code>=</code>, <code>+</code>, <code>-</code>, or <code>@</code> are escaped against spreadsheet formula injection (CWE-1236).
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Practical Worked Examples */}
      <section aria-labelledby="invoice-examples-heading" className="mb-8">
        <h2 id="invoice-examples-heading" className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
          Practical Worked Examples Across Key Markets
        </h2>
        <div className="overflow-x-auto overscroll-x-contain my-4 not-prose">
          <table className="min-w-[680px] w-full text-xs sm:text-sm text-left border-collapse border border-slate-200 dark:border-slate-800">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Scenario</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Inputs Entered</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Calculated Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                  Mixed Taxable &amp; Exempt Items
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  $500 taxable services + $100 exempt disbursement; 10% invoice discount; 10% tax
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Subtotal $600 &rarr; Discount -$60 ($50 allocated to taxable) &rarr; Taxable Base $450 &rarr; Tax +$45 &rarr; <strong>Grand Total $585.00</strong>
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                  50% Deposit Final Milestone
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  $2,000 web project total; Status: Partially Paid; Amount Already Paid: $1,000
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Total Due $2,000.00 &minus; Paid $1,000.00 &rarr; <strong>Balance Due $1,000.00</strong>
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                  Multi-Tax Regional Billing (CAD)
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  CA$1,200 taxable software work; + Add Tax: 5% GST and 7% PST
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Taxable Base CA$1,200 + GST CA$60.00 + PST CA$84.00 &rarr; <strong>Grand Total CA$1,344.00</strong>
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                  Cross-Border Freelance Retainer (PK / IN / PH)
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  40 hrs &times; $25 USD (or local PKR / INR / PHP), Net 15, 0% tax, IBAN/SWIFT in Payment Instructions
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Auto Due Date (+15 days), 0% tax &rarr; <strong>Grand Total $1,000.00</strong> ready for wire transfer
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                  Nigeria Agency Milestone (NGN)
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  &#8358;400,000 taxable design (7.5% VAT) + &#8358;50,000 untaxed reimbursement; &#8358;240,000 Amount Paid
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Subtotal &#8358;450,000 + VAT &#8358;30,000 = &#8358;480,000 &minus; Paid &#8358;240,000 &rarr; <strong>Balance Due &#8358;240,000.00</strong>
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                  South Africa Sole Proprietor (ZAR)
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  R12,500 consulting fee, R500 Line Disc., 0% tax (non-VAT), EFT bank details in Payment Instructions
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Line Total R12,000.00, 0% VAT &rarr; <strong>Grand Total R12,000.00</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 7: Honest Feature Comparison Across Free No-Signup Generators */}
      <section aria-labelledby="invoice-comparison-heading" className="mb-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h2 id="invoice-comparison-heading" className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
          How KivaroTools Compares to Other Free No-Signup Invoice Generators
        </h2>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          Most free browser invoice tools omit partial payment tracking, per-line discounts, multi-tax rows, or free CSV/JSON exports unless you create an account. Here is a factual feature comparison of free, no-signup browser workflows:
        </p>
        <div className="overflow-x-auto overscroll-x-contain my-4 not-prose">
          <table className="min-w-[700px] w-full text-xs sm:text-sm text-left border-collapse border border-slate-200 dark:border-slate-800">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Free Tool Capability</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">KivaroTools</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Invoice-Generator.com</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Wise Free Generator</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Zoho Free Generator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">No Signup &amp; No Watermark</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-medium text-emerald-700 dark:text-emerald-400">Yes (Zero branding footer)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Yes</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Yes</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Adds Zoho footer branding</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Per-Line &amp; Invoice Discounts</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-medium text-emerald-700 dark:text-emerald-400">Per-line + % or Fixed (Proportional)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Invoice-level only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Fixed amount only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Not in free form</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Multiple Tax Rows &amp; Exempt Items</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-medium text-emerald-700 dark:text-emerald-400">Multiple rows + per-line Tax toggle</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Single tax field</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Single tax % only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Single tax field</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Amount Paid &amp; Balance Due</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-medium text-emerald-700 dark:text-emerald-400">Yes (Built-in + Partially Paid)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Yes</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">No</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Requires Zoho account</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">CSV &amp; Reusable JSON Export</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 font-medium text-emerald-700 dark:text-emerald-400">Yes (PDF + Print + CSV + JSON)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">PDF only (no-signup)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">PDF only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Requires Zoho account</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Visual Layout Options</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">1 clean A4 layout (fixed)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">1 layout (editable labels)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">1 standard layout</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">3 free visual themes</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Comparison reflects publicly accessible free, no-signup browser generators audited in November 2026; capabilities inside paid or account-based suites differ.
          </p>
        </div>
      </section>

      {/* Section 8: Scope Boundaries & Regional Tax Disclaimers */}
      <section aria-labelledby="invoice-scope-heading" className="mb-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h2 id="invoice-scope-heading" className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
          Commercial Scope &amp; Regional Tax Disclaimers
        </h2>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          KivaroTools generates general-purpose English commercial A4 invoices. It does <strong>not</strong> connect to government tax portals, transmit real-time e-invoices, generate cryptographic QR codes, or assign different positive VAT rates to separate line items. If your business is legally required to comply with statutory e-invoicing or tax-invoice formatting—such as <strong>Pakistan FBR PRAL</strong>, <strong>India CBIC GST Rule 46/48</strong> (HSN/SAC &amp; IRN), <strong>UAE FTA bilingual Arabic/English Tax Invoices</strong>, <strong>UK HMRC multi-rate VAT (VATREC5010)</strong>, <strong>Canada CRA RC4022</strong> (taxable shipping / early-payment rules), <strong>Philippines BIR EOPT/EIS (RMC 77-2024)</strong>, <strong>Nigeria NRS/FIRS</strong>, or <strong>South Africa SARS VAT 404</strong>—verify requirements with a qualified accountant or use licensed statutory software.
        </p>

        {/* Document Type Quick Reference */}
        <div className="overflow-x-auto overscroll-x-contain my-4 not-prose">
          <table className="min-w-[600px] w-full text-xs sm:text-sm text-left border-collapse border border-slate-200 dark:border-slate-800">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Document</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">When Issued</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Accounting Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Quotation / Estimate</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Before work starts</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Proposes scope and pricing; does not create a payment obligation.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Commercial Invoice</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">At milestone or delivery</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Requests payment for delivered goods or services and records accounts receivable.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Payment Receipt</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700">After funds clear</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Confirms that payment has been received in full or in part.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQs */}
      <section aria-labelledby="invoice-generator-frequently-asked-questions" className="mb-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h2 id="invoice-generator-frequently-asked-questions" className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3 not-prose">
          {INVOICE_GENERATOR_FAQS.map((faq, index) => (
            <details
              key={index}
              className="group rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
            >
              <summary className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base cursor-pointer select-none list-none flex items-center justify-between gap-3">
                <span>{faq.question}</span>
                <span className="shrink-0 text-slate-400 group-open:rotate-180 transition-transform" aria-hidden="true">
                  &#9662;
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

        {/* Verified Internal Links */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800 not-prose">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
            Related Finance &amp; PDF Utilities
          </h3>
          <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm">
            <Link href="/finance" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              All Finance Tools &rarr;
            </Link>
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">&bull;</span>
            <Link href="/finance/contractor-vs-employee-calculator" className="text-blue-600 dark:text-blue-400 hover:underline">
              Contractor vs. Employee Rate Calculator &rarr;
            </Link>
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">&bull;</span>
            <Link href="/finance/salary-calculator" className="text-blue-600 dark:text-blue-400 hover:underline">
              Salary &amp; Take-Home Pay Calculator &rarr;
            </Link>
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">&bull;</span>
            <Link href="/finance/crypto-converter" className="text-blue-600 dark:text-blue-400 hover:underline">
              Currency &amp; Crypto Converter &rarr;
            </Link>
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">&bull;</span>
            <Link href="/document/pdf-signer-bates-stamper" className="text-blue-600 dark:text-blue-400 hover:underline">
              Sign &amp; Stamp PDF Invoices &rarr;
            </Link>
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">&bull;</span>
            <Link href="/document/compress-pdf" className="text-blue-600 dark:text-blue-400 hover:underline">
              Compress Logo-Heavy PDF Invoices &rarr;
            </Link>
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">&bull;</span>
            <Link href="/document/pdf-scrubber" className="text-blue-600 dark:text-blue-400 hover:underline">
              PDF Invoice &amp; Bank Statement Redactor &rarr;
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}