import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const QR_GENERATOR_FAQS: FaqItem[] = [
  {
    question: 'How do QR code error correction levels work when adding a custom logo?',
    answer:
      'QR codes use Reed-Solomon error correction across four standardized tiers: L (~7% recovery), M (~15%), Q (~25%), and H (~30%). When you embed a logo in the center of the QR code, the logo physically covers a portion of the data modules. OmniTools automatically recommends Level H (High) error correction, ensuring the surrounding modules contain sufficient redundant parity bits for smartphones to decode the symbol instantly.',
  },
  {
    question: 'What is the minimum quiet zone required for reliable QR code scanning?',
    answer:
      'Per the ISO/IEC 18004 standard, a QR code requires a "quiet zone"—an uninterrupted blank border surrounding all four sides—of at least 4 modules (blocks) wide. Without an adequate quiet zone, camera sensors struggle to distinguish the finder patterns from surrounding background graphics or printed packaging.',
  },
  {
    question: 'Why should QR code foreground and background colors meet contrast standards?',
    answer:
      'Optical barcode scanners rely on luminosity contrast to differentiate between dark and light modules. Inverted or low-contrast combinations (such as yellow on white or navy on black) fail in low-light environments. OmniTools includes a real-time WCAG contrast calculator that alerts you if the contrast ratio falls below the 4.5:1 threshold.',
  },
  {
    question: 'What specialized QR formats are supported beyond standard web URLs?',
    answer:
      'OmniTools supports eight distinct data payloads: Web URLs, Plain Text, Wi-Fi network credentials (WPA/WPA2/WEP with auto-connect), Email messages (mailto: with subject and body), Direct phone calls (tel:), SMS text messages (sms:), vCard 3.0 business contact cards, and iCalendar (.ics) calendar events.',
  },
  {
    question: 'When should you download a vector SVG instead of a raster PNG QR code?',
    answer:
      'Raster PNG or JPEG files have fixed pixel resolutions and will pixelate if enlarged for large-format physical printing. Vector SVG (Scalable Vector Graphics) mathematically describes every module, making SVG ideal for commercial printing, billboards, merchandise, and vector design tools like Adobe Illustrator or Figma.',
  },
];

export default function QrGeneratorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: QR_GENERATOR_FAQS.map((faq) => ({
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
        Custom QR Code Generator Studio: Wi-Fi, vCard, Custom Logos &amp; Vector SVG
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        <strong>Quick Response (QR) Codes</strong> are two-dimensional matrix barcodes governed by the <strong>ISO/IEC 18004</strong> standard.
        Originally invented for industrial logistics by Denso Wave, QR codes now serve as the primary bridge between physical collateral
        and digital web experiences. OmniTools <strong>Custom QR Code Generator</strong> creates high-precision, scannable QR codes
        directly inside your browser with custom branding, color controls, Reed-Solomon error correction, and vector SVG exports.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Supported QR Code Payloads &amp; Data Schemas
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">QR Payload Type</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Encoded Schema</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Smartphone Native Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Website URL</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-blue-600 dark:text-blue-400">https://example.com</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Opens default mobile web browser.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Wi-Fi Network</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-blue-600 dark:text-blue-400">WIFI:S:MySSID;T:WPA;P:pass;;</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Prompts user to join Wi-Fi without typing passwords.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Contact Card (vCard)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-blue-600 dark:text-blue-400">BEGIN:VCARD ... END:VCARD</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Opens address book to save new phone contact.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Calendar Event</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-blue-600 dark:text-blue-400">BEGIN:VEVENT ... END:VEVENT</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Adds meeting with start/end time to device calendar.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Email &amp; SMS</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-blue-600 dark:text-blue-400">mailto: / smsto:</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Pre-populates recipient and drafted message.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Reed-Solomon Error Correction &amp; Logo Placement
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        QR codes incorporate mathematical error correction algorithms that allow scanners to recover data even if the code
        is partially dirty, torn, or overlaid with a central brand icon:
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Level</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Data Recovery</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Data Density</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Recommended Use</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono">Level L</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">~7% of bytes</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Highest payload capacity</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Clean digital screen displays with no logo.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono">Level M</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-medium">~15% of bytes</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Standard default density</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">General print materials, posters, table tents.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono">Level Q</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 font-medium">~25% of bytes</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Moderate payload density</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Industrial labeling, small centered badges.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono">Level H</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">~30% of bytes</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Lowest payload capacity</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-semibold text-blue-600 dark:text-blue-400">Mandatory for central logo branding &amp; outdoor signage.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How to Create &amp; Download Custom QR Codes
      </h3>
      <ol className="list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Choose Content Type:</strong> Select from URL, Wi-Fi, vCard Contact, Email, Phone, SMS, or Event.
        </li>
        <li>
          <strong>Input Information:</strong> Fill out the validated form fields. The tool enforces ISO schema escaping for Wi-Fi and vCard characters.
        </li>
        <li>
          <strong>Customize Colors &amp; Contrast:</strong> Select foreground and background colors while reviewing the live WCAG contrast ratio indicator.
        </li>
        <li>
          <strong>Add Brand Logo:</strong> Upload a PNG or JPEG logo to be centered automatically with high-tier error correction.
        </li>
        <li>
          <strong>Export Format:</strong> Download a high-res PNG for digital graphics or an infinite-resolution vector SVG for professional print production.
        </li>
      </ol>

      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <dl className="space-y-6 mb-6">
        {QR_GENERATOR_FAQS.map((faq, index) => (
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
          Related SEO &amp; Developer Utilities
        </h4>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/seo/text-analyzer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Word Counter &amp; Text Analyzer &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/seo/meta-generator"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Meta Tags &amp; Open Graph Generator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/seo/text-case-converter"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Text Case Converter &rarr;
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