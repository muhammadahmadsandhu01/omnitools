import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const INVOICE_GENERATOR_FAQS: FaqItem[] = [
  {
    question: 'How does client-side invoice generation protect confidential business data?',
    answer:
      'OmniTools Invoice Generator executes entirely within your browser session using local JavaScript memory. Client billing details, proprietary unit rates, company registration codes, and banking instructions are never transmitted to our servers or stored in remote databases. Your draft is automatically saved to your browser local storage so you can resume editing later.',
  },
  {
    question: 'How does the automatic multi-page pagination algorithm prevent table cut-offs?',
    answer:
      'The generator includes an intelligent A4 page budget calculator (computeInvoicePages). It estimates exact pixel heights for every line item, logo header, and totals block. If your invoice exceeds standard A4 printable height (1,030 pt usable), it splits items cleanly across multiple numbered pages with continuation headers, ensuring summary blocks and payment details never overlap table rows.',
  },
  {
    question: 'How are sub-unit decimals formatted across different international currencies?',
    answer:
      'Currency formatting dynamically aligns with ISO 4217 specifications: zero decimals for zero-fraction currencies (such as Japanese Yen JPY and Korean Won KRW), two decimals for standard currencies (such as USD, EUR, GBP, PKR, and INR), and three decimals for Middle Eastern currencies (such as Kuwaiti Dinar KWD, Bahraini Dinar BHD, and Omani Rial OMR).',
  },
  {
    question: 'Can you include multiple customizable tax lines and discounts on a single invoice?',
    answer:
      'Yes. You can add multiple independent tax entries (such as State Sales Tax, Federal VAT, or GST) with custom percentage rates. Line items can be marked as taxable or tax-exempt individually, and discounts can be applied per line item or across the total invoice balance.',
  },
  {
    question: 'Can you export or backup invoices for bookkeeping records?',
    answer:
      'Yes. In addition to high-resolution print-to-PDF export, you can download a complete JSON backup of your invoice draft to import later, or export a structured CSV spreadsheet of all line items for spreadsheet accounting software.',
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
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Free Professional Invoice Generator: Multi-Currency PDF Billing &amp; Local Auto-Save
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Creating accurate, compliant invoices is critical for freelancers, consultants, contractors, and growing businesses.
        OmniTools <strong>Invoice Generator</strong> delivers an enterprise-grade billing workspace directly in your web browser.
        Generate clean, print-ready PDF invoices with real-time tax calculations, itemized discounts, custom branding, and
        automatic multi-page pagination—with zero subscription fees, watermarks, or remote server uploads.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Invoice Structure &amp; Mandatory Commercial Elements
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        To ensure prompt payment and satisfy regional tax authority requirements (such as IRS W-9 guidelines, UK HMRC standards, or European VAT directives), commercial invoices must contain essential structural sections:
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
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

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Automatic Multi-Page A4 Pagination Engine
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        A common flaw in simple web invoicing tools is awkward page breaks—where table rows get clipped in half, or total balances appear orphaned on a blank second page. OmniTools solves this with an integrated <strong>A4 Page Budgeting Algorithm</strong>:
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

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How to Create &amp; Download Your Invoice
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

      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <dl className="space-y-6 mb-6">
        {INVOICE_GENERATOR_FAQS.map((faq, index) => (
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

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
          Related Financial &amp; Document Utilities
        </h4>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/finance/salary-calculator"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Salary &amp; Net Take-Home Pay Calculator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/finance/crypto-converter"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Crypto &amp; Currency Converter &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/document/image-to-pdf"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Image to PDF Studio &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/document/pdf-merge-split"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            PDF Merge &amp; Split Tool &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}