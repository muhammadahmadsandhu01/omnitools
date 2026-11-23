import Link from 'next/link';
import {
  ArrowUpRight,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Scan,
  HelpCircle,
} from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

export const QR_GENERATOR_FAQS: FaqItem[] = [
  {
    question: 'What is the difference between static and dynamic QR codes, and do static QR codes expire?',
    answer:
      'KivaroTools is a permanent QR code generator that creates static QR codes only. A static QR code encodes your destination URL, Wi-Fi credentials, vCard contact, or calendar event directly into the QR matrix with no third-party redirect server. Because nothing sits in the middle, static QR codes never expire, have no scan caps, require no sign-up, and keep working as long as the destination stays active. Dynamic QR codes point to a hosted redirect URL so you can edit links or track scans, which typically requires an account or recurring subscription.',
  },
  {
    question: 'How does this QR code generator with logo handle error correction levels?',
    answer:
      'As an ISO/IEC 18004 QR code generator error correction studio, KivaroTools supports all four Reed-Solomon tiers: Level L (~7% recovery), Level M (~15%), Level Q (~25%), and Level H (~30%). When you upload a center logo (PNG, JPEG, or WebP up to 5 MB), the logo excavates central data modules. KivaroTools automatically switches error correction to Level H so smartphone cameras can reconstruct the occluded area. Keep logo size at or below 20%–22% of QR width and run Verify Payload before printing.',
  },
  {
    question: 'What is the minimum quiet zone required for reliable QR code scanning?',
    answer:
      'Under the ISO/IEC 18004 standard, a QR code requires an uninterrupted blank border—called the quiet zone—at least 4 modules wide on all four sides. Cropping the quiet zone lets surrounding text, borders, or artwork blend into the three corner finder patterns and causes camera scanners to fail.',
  },
  {
    question: 'What export format should I choose: SVG, A4 PDF, PNG, JPEG, or WebP?',
    answer:
      'Use our QR code generator SVG export for Adobe Illustrator, Inkscape, Figma, signage, business cards, and commercial print runs—every QR code SVG free download scales infinitely without pixelation. Choose Print-Ready A4 PDF for office signs and table tents (centered at 120mm × 120mm with print guidelines). Choose PNG (up to 1200 × 1200 px) for websites, decks, and emails, WebP for lightweight web assets, or JPEG when a solid opaque raster file is required.',
  },
  {
    question: 'How large should a QR code be printed for business cards, menus, and posters?',
    answer:
      'Follow the 10:1 scanning distance-to-size rule: make the QR code width at least one-tenth of the expected scanning distance. For business cards scanned from 25–30 cm away, print at least 2.5 cm × 2.5 cm (1.0 in). For posters scanned from 1.5 meters away, print at least 15 cm wide. Denser payloads like multi-field vCards or ICS calendar events need larger minimum print sizes (3.5–6.0 cm).',
  },
  {
    question: 'Is this a QR code generator no sign up tool with local browser processing?',
    answer:
      'Yes. KivaroTools is a QR code generator no sign up utility—no account, login, or watermark removal step is required. QR matrix calculation, logo compositing, SVG serialization, A4 PDF generation, and optical payload verification all run locally in your browser using client-side JavaScript without uploading your Wi-Fi passwords, vCard details, or logos to a server.',
  },
  {
    question: 'Why do inverted or low-contrast QR codes fail to scan?',
    answer:
      'Camera barcode scanners expect dark modules on a light background. Low-contrast palettes (under 3.0:1) fail in dim or warm lighting, and inverted QR codes (light modules on a dark background) fail on many older Android devices and retail handheld scanners. KivaroTools computes the live WCAG 2.1 luminance contrast ratio, flags inverted polarity, and blocks export below 3.0:1.',
  },
  {
    question: 'Can I use generated static QR codes commercially without licensing fees?',
    answer:
      'Yes. QR Code is standardized under ISO/IEC 18004 and its patent holder, Denso Wave, chose not to exercise patent rights for standard-compliant codes. Static QR codes you create with KivaroTools are free to use on commercial packaging, restaurant menus, retail displays, and business cards with no royalties or attribution required.',
  },
  {
    question: 'How does KivaroTools calculate the 0–95 Scan Reliability Score?',
    answer:
      'The heuristic reliability model scores four measurable structural factors: (1) WCAG 2.1 luminance contrast ratio (up to 30 points for >= 7.0:1, with a 10-point penalty for inverted colors), (2) ISO/IEC 18004 quiet zone width (15 points for >= 4 modules), (3) Reed-Solomon error correction headroom relative to any center logo (up to 25 points), and (4) QR matrix version density (up to 30 points for V1–V5). The total is capped at 95/100 because software cannot measure real-world lighting, paper glare, or camera autofocus.',
  },
  {
    question: 'How does the in-browser Verify Payload optical scanner work?',
    answer:
      'Clicking "Verify Payload" decodes the live rendered HTML5 canvas directly in your browser using the native W3C BarcodeDetector API when available, automatically falling back to the client-side jsQR JavaScript decoder in other browsers. It confirms the decoded string matches your exact payload and automatically invalidates if you change any content or design setting.',
  },
  {
    question: 'What 8 static QR payload types are supported, and do they work offline?',
    answer:
      'KivaroTools combines 8 static modes in one studio: Website URL, Plain Text (plain text qr code generator up to 2,500 chars), Wi-Fi Network (wifi qr code generator for WPA/WPA2/WPA3, WEP, Open, and Hidden SSIDs), Contact (vcard qr code generator using vCard 3.0), Email (email qr code generator using mailto:), Phone (phone number qr code generator using tel:), SMS (sms qr code generator using sms:), and Calendar Event (event qr code generator / ics qr code generator using iCalendar VEVENT). Plain text, Wi-Fi, vCard contacts, and calendar events decode offline.',
  },
  {
    question: 'How are special characters in Wi-Fi passwords and vCard fields handled?',
    answer:
      'Wi-Fi QR strings (`WIFI:T:WPA;S:SSID;P:PASSWORD;H:false;;`) and vCard 3.0 / iCalendar payloads use semicolons, colons, commas, quotes, and backslashes as delimiters. KivaroTools automatically escapes these structural characters as you type so mobile scanners parse complex passwords and company names without truncation.',
  },
  {
    question: 'What fields can I encode when I create vCard QR code business cards?',
    answer:
      'The Contact (vCard) tab acts as a compact VCF QR code generator encoding First Name, Last Name, Phone Number, Email Address, Organization, and Website URL into vCard 3.0 format. Keeping fields concise lowers the QR matrix version so the code stays easily scannable at 2.5 cm on printed business cards.',
  },
  {
    question: 'Why does a QR scanner sometimes show my URL as plain text instead of opening a browser?',
    answer:
      'Many smartphone scanners treat bare domains without a protocol (like example.com) as plain text rather than a clickable link. Always include https:// or http://—the URL tab validates protocol formatting automatically so scanners launch the browser.',
  },
  {
    question: 'Can I copy a QR code image or raw SVG markup straight to my clipboard?',
    answer:
      'Yes. You can copy the rendered PNG QR image directly to your clipboard (using the browser Async Clipboard API) to paste into docs, slides, or chat, click "Copy SVG" to paste clean vector markup straight into Figma, Illustrator, or HTML, or click "Copy Raw Data" to inspect the exact encoded payload string.',
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

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create, Verify, and Export a Static QR Code (SVG, A4 PDF & PNG)',
    description:
      'Step-by-step guide to creating permanent, non-expiring static QR codes for URLs, Wi-Fi networks, vCard business cards, and calendar events with custom colors, center logos, and vector SVG or A4 PDF exports.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Select QR Payload Type',
        text: 'Choose from 8 static payload modes: Website URL, Plain Text, Wi-Fi Network, Email, Phone, SMS, Contact (vCard 3.0), or Event (ICS).',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Enter and Validate Payload Details',
        text: 'Fill in your payload fields. Real-time validation checks URL protocols, required fields, special-character escaping, and ISO/IEC 18004 byte capacity.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Customize Colors, Error Correction, Quiet Zone & Logo',
        text: 'Pick foreground and background hex colors with live WCAG contrast checking, choose error correction (L, M, Q, or H), keep a 4-module quiet zone, and optionally upload a center logo (auto-enabling Level H).',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Verify Scannability and Download',
        text: 'Check the 0–95 Scan Reliability Score, run the in-browser Verify Payload decoder (BarcodeDetector / jsQR), and export as vector SVG, print-ready A4 PDF, PNG (up to 1200×1200 px), WebP, JPEG, or copy to clipboard.',
      },
    ],
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-10">
      {/* Structured Data: FAQPage and HowTo */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* SECTION 1: EXECUTIVE OVERVIEW */}
      <section aria-labelledby="qr-static-generator-overview" className="mb-8">
        <h2
          id="qr-static-generator-overview"
          className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-100"
        >
          Free Static QR Code Generator: Vector SVG, A4 PDF, vCard &amp; Wi-Fi with No Sign-Up
        </h2>
        <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
          <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
            <strong>Local Browser Processing:</strong> QR matrix generation, logo compositing, optical payload verification, and SVG/PDF/PNG export run locally in your browser via client-side JavaScript. This tool does not upload your QR payload or logo image to a server.
          </p>
        </blockquote>
        <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400 text-base sm:text-lg">
          <strong>Quick Response (QR) codes</strong> are two-dimensional matrix barcodes standardized under <strong>ISO/IEC 18004</strong>.
          Whether you need a permanent <strong>static QR code generator</strong> for product packaging, a <strong>vCard QR code generator</strong> for printed business cards,
          a guest <strong>Wi-Fi QR code generator</strong> for a cafe or office, or an <strong>SVG QR code generator</strong> for print shops,
          KivaroTools is a <strong>QR code generator no sign up</strong> studio that builds unexpiring codes with live WCAG contrast enforcement,
          Reed-Solomon error correction (L/M/Q/H), quiet-zone controls, a 0–95 scan reliability score, and an in-browser optical decoder—with zero watermarks.
        </p>
      </section>

      {/* SECTION 2: HOW TO CREATE A STATIC QR CODE */}
      <section aria-labelledby="qr-generator-how-to-create-a-custom-qr-code" className="my-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 not-prose">
        <h2 id="qr-generator-how-to-create-a-custom-qr-code" className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>How to Create and Verify a Static QR Code in 4 Steps</span>
        </h2>
        <ol className="list-none pl-0 m-0 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <li className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">Step 1: Choose Payload Type</span>
            <span className="text-slate-600 dark:text-slate-300">Select URL, Plain Text, Wi-Fi, Email, Phone, SMS, Contact (vCard 3.0), or Calendar Event (ICS).</span>
          </li>
          <li className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">Step 2: Enter &amp; Validate Details</span>
            <span className="text-slate-600 dark:text-slate-300">Fill in your content. Real-time validation checks protocol syntax, character escaping, and ISO byte limits.</span>
          </li>
          <li className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">Step 3: Customize Colors, Margin &amp; Logo</span>
            <span className="text-slate-600 dark:text-slate-300">Set brand hex colors with live WCAG contrast checks, keep a 4-module quiet zone, and optionally add a center logo.</span>
          </li>
          <li className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">Step 4: Verify Payload &amp; Export</span>
            <span className="text-slate-600 dark:text-slate-300">Click Verify Payload to optically decode the preview, then download SVG, A4 PDF, PNG, JPEG, or WebP—or copy SVG/PNG directly.</span>
          </li>
        </ol>
      </section>

      {/* SECTION 3: STATIC VS DYNAMIC QR CODES */}
      <section aria-labelledby="qr-generator-static-vs-dynamic-qr-codes-why" className="mb-8">
        <h2 id="qr-generator-static-vs-dynamic-qr-codes-why" className="text-xl sm:text-2xl font-bold mb-3 text-slate-800 dark:text-slate-200">
          Static vs. Dynamic QR Codes: Why a Permanent QR Code Generator Protects Your Prints
        </h2>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          Many online QR makers default to <em>dynamic</em> QR codes that encode a third-party redirect URL rather than your real destination.
          If a 7- or 14-day free trial ends, a 250-scan cap is reached, or a subscription lapses, printed menus, business cards, flyers, and packaging stop resolving.
          A <strong>permanent QR code generator</strong> encodes static data directly into the matrix—zero redirect servers, zero scan limits, and zero expiration.
        </p>
        <div className="w-full overflow-x-auto overscroll-x-contain mb-6 not-prose">
          <table className="min-w-[640px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Comparison Factor</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold">KivaroTools Static QR Codes</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 text-slate-500">Hosted Dynamic QR Services</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Code Longevity</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Permanent &amp; unexpiring (no scan cap)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Depends on active vendor plan or trial window</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Destination Routing</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Direct payload encoding (zero middleman)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Routes through vendor short-link redirect server</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Editable After Printing</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">No (fixed payload—re-generate if link changes)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Yes (destination can be updated on vendor dashboard)</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Sign-Up &amp; Cost</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-medium">Free, no sign-up, no watermarks</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Usually requires account and paid plan after trial</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Offline Scannability</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Wi-Fi, vCard, ICS &amp; plain text decode offline</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Requires internet to resolve redirect URL</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 4: ALL 8 PAYLOAD MODES + PRACTICAL EXAMPLES */}
      <section aria-labelledby="qr-generator-supported-qr-code-payloads-amp" className="mb-8">
        <h2 id="qr-generator-supported-qr-code-payloads-amp" className="text-xl sm:text-2xl font-bold mb-3 text-slate-800 dark:text-slate-200">
          8 Supported Static QR Payloads: URL, Wi-Fi, vCard, Calendar Event (ICS), Email, Phone, SMS &amp; Plain Text
        </h2>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          Instead of juggling separate single-purpose utilities, KivaroTools combines a <strong>WiFi QR code generator</strong>, <strong>vCard QR code generator</strong>, <strong>calendar QR code generator</strong> (also an <strong>event QR code generator</strong> and <strong>ICS QR code generator</strong>), <strong>email QR code generator</strong>, <strong>SMS QR code generator</strong>, <strong>phone number QR code generator</strong>, and <strong>plain text QR code generator</strong> in one interface:
        </p>
        <div className="w-full overflow-x-auto overscroll-x-contain mb-6 not-prose">
          <table className="min-w-[680px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Payload Type</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Standard Data Format</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Mobile Device Action</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Typical Real-World Use Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Website URL</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-blue-600 dark:text-blue-400">https://yourdomain.com</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Opens default mobile browser directly to the page.</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Product packaging, restaurant menus, flyers, portfolios.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Wi-Fi QR Code</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-blue-600 dark:text-blue-400">WIFI:T:WPA;S:SSID;P:Pass;H:false;;</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Prompts to join WPA/WPA2/WPA3, WEP, or open Wi-Fi.</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Cafes, hotels, co-working spaces, Airbnbs, guest signs.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Contact (vCard 3.0)</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-blue-600 dark:text-blue-400">BEGIN:VCARD ... END:VCARD</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Prompts &ldquo;Save Contact&rdquo; with name, phone, email, org &amp; URL.</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Business cards, conference badges, networking handouts.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Calendar Event (ICS)</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-blue-600 dark:text-blue-400">BEGIN:VCALENDAR ... END:VEVENT</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Opens device calendar with title, start/end, location &amp; notes.</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Workshop flyers, conference passes, wedding invites.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Phone Number</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-blue-600 dark:text-blue-400">tel:+15551234567</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Opens phone dialer with number pre-entered.</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Support stickers, service vans, roadside signs.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">SMS Text Message</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-blue-600 dark:text-blue-400">sms:+15551234567?body=Hello</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Opens SMS app with recipient and drafted message.</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Real estate yard signs, booking requests, opt-in texts.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Email (mailto:)</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-blue-600 dark:text-blue-400">mailto:sales@ex.com?subject=...</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Opens mail app with recipient, subject &amp; body template.</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Warranty registration, customer feedback, inquiries.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Plain Text</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-blue-600 dark:text-blue-400">Raw UTF-8 text (up to 2,500 chars)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Displays text directly on screen without internet.</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Inventory labels, serial numbers, coupon codes, notes.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PRACTICAL WORKFLOW EXAMPLES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose mb-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Business Card vCard SVG
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Enter name, phone, email, and organization in the <strong>Contact (vCard)</strong> tab to create vCard QR code artwork in high-contrast dark navy (<code className="font-mono">#1E3A8A</code>) on white, keep Level M and a 4-module quiet zone, verify optically, and download <strong>SVG</strong> for Illustrator or InDesign at 2.5 cm.
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Cafe Guest Wi-Fi A4 PDF
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Enter your SSID and WPA/WPA2/WPA3 key in the <strong>Wi-Fi</strong> tab, optionally upload a cafe logo (auto-enabling Level H), verify the payload, and export a <strong>Print-Ready A4 PDF</strong> to frame on the counter.
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Workshop Flyer Calendar (ICS)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Add title, start/end times, and venue in the <strong>Event (ICS)</strong> tab, check the 0–95 reliability score and minimum print size for denser VEVENT payloads, run Verify Payload, and export <strong>SVG</strong> or <strong>PNG</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: VECTOR SVG, A4 PDF & RASTER EXPORT FORMATS */}
      <section aria-labelledby="qr-generator-export-formats-compared-when-t" className="mb-8">
        <h2 id="qr-generator-export-formats-compared-when-t" className="text-xl sm:text-2xl font-bold mb-3 text-slate-800 dark:text-slate-200">
          QR Code Generator SVG, Print-Ready A4 PDF, PNG (up to 1200 px), JPEG &amp; WebP Exports
        </h2>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          Built as a print-ready <strong>vector QR code generator</strong> and <strong>QR code generator SVG</strong> studio, KivaroTools exports five file formats plus one-click clipboard actions (<strong>Copy Image</strong>, <strong>Copy SVG</strong>, and <strong>Copy Raw Data</strong>):
        </p>
        <ul className="space-y-2 mb-6 text-slate-600 dark:text-slate-400 text-sm">
          <li>
            <strong>SVG (Scalable Vector Graphics):</strong> Best for commercial printing, packaging, signage, and design tools (Adobe Illustrator, Inkscape, Figma, InDesign). Every <strong>QR code SVG free</strong> export scales infinitely with zero pixelation, and you can copy raw SVG markup in one click.
          </li>
          <li>
            <strong>PDF (Print-Ready A4 Sheet):</strong> Generates a portrait A4 document via jsPDF with the QR code centered at <strong>120mm × 120mm</strong> plus an embedded Print &amp; Scannability Guidelines box—ready for office or home printers without design software.
          </li>
          <li>
            <strong>PNG (Raster Image, 160–1200 px):</strong> Crisp lossless raster output adjustable from 160 × 160 px up to <strong>1200 × 1200 px</strong>. Ideal for web pages, slide decks, newsletters, and email signatures.
          </li>
          <li>
            <strong>WebP (Compressed Raster):</strong> Lightweight modern raster format at 0.95 quality for smaller web asset payloads while keeping sharp module edges.
          </li>
          <li>
            <strong>JPEG (Opaque Raster):</strong> Standard raster image rendered onto a solid background fill at 0.95 quality for workflows that require <code>.jpeg</code> files.
          </li>
        </ul>
      </section>

      {/* SECTION 6: REED-SOLOMON ERROR CORRECTION & CENTER LOGOS */}
      <section aria-labelledby="qr-generator-reed-solomon-error-correction-" className="mb-8">
        <h2 id="qr-generator-reed-solomon-error-correction-" className="text-xl sm:text-2xl font-bold mb-3 text-slate-800 dark:text-slate-200">
          QR Code Generator Error Correction (L, M, Q, H) &amp; Center Logo Placement
        </h2>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          Every ISO/IEC 18004 QR code includes mathematical <strong>Reed-Solomon error correction</strong> parity blocks so scanners can still read the code if modules are scratched, smudged, or excavated by a <strong>QR code generator with logo</strong> workflow:
        </p>
        <div className="w-full overflow-x-auto overscroll-x-contain mb-6 not-prose">
          <table className="min-w-[640px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Tier</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Recovery &amp; Max Byte Capacity</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Matrix Density</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Recommended Use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono">Level L</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-medium text-emerald-600 dark:text-emerald-400">~7% recovery (2,953 bytes max)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Lowest density (largest modules)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Clean digital screens with long payloads and no logo.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono">Level M</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-medium text-blue-600 dark:text-blue-400">~15% recovery (2,331 bytes max)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Balanced default density</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">General print media, flyers, business cards, invoices.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono">Level Q</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-medium text-amber-600 dark:text-amber-400">~25% recovery (1,663 bytes max)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Moderately high density</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Industrial labels, transit passes, high-wear prints.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 font-mono">Level H</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-medium text-emerald-600 dark:text-emerald-400">~30% recovery (1,273 bytes max)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Highest density (maximum redundancy)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">Recommended for center logos &amp; outdoor signage.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400 text-sm">
          <strong>Center Logo Safety Rule:</strong> Uploading a PNG, JPEG, or WebP logo (up to 5 MB) automatically switches error correction to <strong>Level H</strong> and lets you tune logo width between <strong>12% and 28%</strong> (default 20%). Keep logo width at or below <strong>20%–22%</strong> so enough Reed-Solomon parity remains for real-world glare, tilt, and wear.
        </p>
      </section>

      {/* SECTION 7: PRINT SIZING & 10:1 RULE */}
      <section aria-labelledby="qr-generator-physical-printing-sizing-amp-t" className="mb-8">
        <h2 id="qr-generator-physical-printing-sizing-amp-t" className="text-xl sm:text-2xl font-bold mb-3 text-slate-800 dark:text-slate-200">
          Physical Print Sizing &amp; The 10:1 Scanning Distance Rule
        </h2>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          Printing a QR code too small for its viewing distance is one of the most common causes of field scan failures. Use the standard <strong>10:1 distance-to-size ratio</strong> as a baseline:
        </p>
        <div className="p-4 mb-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 not-prose">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 text-center font-mono">
            Minimum QR Code Width = Intended Scanning Distance ÷ 10
          </p>
        </div>
        <div className="w-full overflow-x-auto overscroll-x-contain mb-6 not-prose">
          <table className="min-w-[640px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Medium &amp; Context</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Typical Scanning Distance</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Recommended Minimum Size</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Recommended Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Business Card / Badge</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">25 – 35 cm (10 – 14 in)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">2.5 cm × 2.5 cm (1.0 in)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">SVG or PNG (1200 px)</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Table Tent / Menu / Wi-Fi Sign</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">40 – 50 cm (16 – 20 in)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">4.0 cm × 4.0 cm (1.6 in)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">A4 PDF or SVG</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Retail Window Poster / Flyer</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">1.0 – 1.5 meters (3.3 – 5.0 ft)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">10 – 15 cm (4.0 – 6.0 in)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">SVG Vector</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Outdoor Banner / Signage</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">5.0 – 10 meters (16 – 33 ft)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">50 – 100 cm (20 – 40 in)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">SVG Vector</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 8: SCAN RELIABILITY SCORE & IN-BROWSER VERIFICATION */}
      <section aria-labelledby="qr-generator-scan-reliability-and-verification" className="mb-8 p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 not-prose">
        <div className="flex items-center gap-2 mb-3">
          <Scan className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 id="qr-generator-scan-reliability-and-verification" className="text-xl font-bold text-slate-900 dark:text-white">
            Live 0–95 Scan Reliability Score &amp; In-Browser Verify Payload Scanner
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Before sending artwork to a printer, KivaroTools scores your QR code on a <strong>0–95 heuristic scale</strong> across four structural dimensions (capped at 95 because software cannot inspect physical lighting or paper glare):
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">1. WCAG 2.1 Luminance Contrast (up to 30 pts)</span>
            <span className="text-slate-600 dark:text-slate-400">Ratios &gt;= 7.0:1 earn 30 pts; &gt;= 4.5:1 earn 20 pts; inverted polarity deducts 10 pts; ratios below 3.0:1 block export.</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">2. ISO/IEC 18004 Quiet Zone (up to 15 pts)</span>
            <span className="text-slate-600 dark:text-slate-400">Margins &gt;= 4 modules earn 15 pts; 2–3 modules earn 5 pts; 0–1 modules earn 0 pts and trigger an edge-bleed warning.</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">3. Error Correction &amp; Logo Margin (up to 25 pts)</span>
            <span className="text-slate-600 dark:text-slate-400">Evaluates Reed-Solomon tier (L/M/Q/H) alongside center logo occlusion (up to 25 pts for Level H; warns if logo exceeds 20% or uses L/M/Q).</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">4. Matrix Version Density (up to 30 pts)</span>
            <span className="text-slate-600 dark:text-slate-400">Compact V1–V5 matrices earn 30 pts, V6–V10 earn 26 pts, V11–V20 earn 20 pts, and V21+ trigger larger minimum print size guidance.</span>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Click <strong>&quot;Verify Payload&quot;</strong> to decode the live rendered canvas using the browser&apos;s native <code>BarcodeDetector</code> API with an automatic pure-JavaScript <code>jsQR</code> fallback, confirming the decoded string matches your payload before you print.
        </p>
      </section>

      {/* SECTION 9: COMPETITOR COMPARISON MATRIX (GROUNDED IN VERIFIED AUDIT) */}
      <section aria-labelledby="qr-generator-competitor-comparison-matrix" className="mb-8">
        <h2 id="qr-generator-competitor-comparison-matrix" className="text-xl sm:text-2xl font-bold mb-3 text-slate-800 dark:text-slate-200">
          How KivaroTools Compares to Popular QR Code Generators
        </h2>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400 text-sm">
          Compare KivaroTools with widely used QR code tools across static longevity, vector SVG &amp; A4 PDF exports, prepress controls, commercial use, and built-in optical verification:
        </p>
        <div className="w-full overflow-x-auto overscroll-x-contain mb-6 not-prose">
          <table className="min-w-[700px] w-full text-xs text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">Feature / Prepress Criterion</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold">KivaroTools (Free)</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">QRCode Monkey</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">TEC-IT</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Adobe Express / Canva</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">QRStuff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Account &amp; Commercial Use</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">No sign-up · Royalty-free commercial use</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">No sign-up (static free)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">Free tier restricts commercial use</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Account / login required (Canva)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Paid plans for colors &amp; vector</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Free Vector SVG &amp; Print PDF</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">SVG + A4 PDF (120mm) + Copy SVG</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">SVG/PDF/EPS (PDF/EPS strip logos)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">PNG only on free tier</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">PNG/JPEG/PDF (no SVG on Adobe)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">PNG only on free tier</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Center Logo &amp; Auto Level H</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Up to 5 MB · Auto-promotes Level H</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Up to 2 MB · Manual settings</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-slate-400">No logo upload</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Basic overlay / add-on</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Paid tier</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">WCAG Contrast &amp; Quiet Zone</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Live WCAG ratio (3.0:1 block) + 0–12 slider</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-slate-400">No contrast or quiet-zone slider</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Quiet zone &amp; EC controls</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-slate-400">No prepress sliders</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-slate-400">No WCAG contrast check</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Built-In Optical Verification</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">0–95 Score + BarcodeDetector / jsQR</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-slate-400">None</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-slate-400">None</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-slate-400">None</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-slate-400">None</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 10: OPTICAL TROUBLESHOOTING GUIDE */}
      <section aria-labelledby="qr-generator-optical-troubleshooting-guide" className="mb-8">
        <h2 id="qr-generator-optical-troubleshooting-guide" className="text-xl sm:text-2xl font-bold mb-3 text-slate-800 dark:text-slate-200">
          Optical Troubleshooting &amp; Prepress Checklist
        </h2>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400 text-sm">
          If a phone camera or handheld scanner struggles to read a printed QR code, check these six common prepress issues:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-6">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              1. Inverted Colors (Light Dots on Dark Background)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Standard optical decoders expect dark modules on a light background. Older Android cameras and retail laser/2D scanners frequently reject inverted polarity. Keep the foreground darker than the background.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              2. Low Contrast &amp; Tinted Print Substrates
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Contrast ratios below 4.5:1 (and especially below 3.0:1) degrade rapidly under warm restaurant lighting or glossy lamination. Always place a solid light background box behind QR codes printed on dark or patterned packaging.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              3. Overly Dense Matrix Blurring
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Long URLs packed with tracking parameters or lengthy text force high QR versions (up to V40, 177×177 modules). Microscopic modules blur together on thermal or inkjet printers—shorten payloads or increase print size.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              4. Cropped Quiet Zone (&lt; 4 Modules)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              ISO/IEC 18004 requires a 4-module blank margin on all sides. Cropping tightly around the corner finder squares prevents camera edge-detection from isolating the matrix.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              5. Unescaped Characters in Wi-Fi Passwords
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Wi-Fi keys containing semicolons (<code>;</code>), colons (<code>:</code>), commas (<code>,</code>), quotes (<code>&quot;</code>), or backslashes (<code>\</code>) break naive parsers unless escaped. KivaroTools escapes them automatically.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              6. Oversized Center Logo (&gt; 22% Width)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Level H restores up to ~30% of lost codewords. Exceeding 20%–22% width leaves very little safety margin for scratches, glare, or angled scans.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 11: PRIVACY & CLIENT-SIDE EXECUTION */}
      <section aria-labelledby="qr-generator-privacy-by-design-100-in-brows" className="mb-8">
        <h2 id="qr-generator-privacy-by-design-100-in-brows" className="text-xl sm:text-2xl font-bold mb-3 text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Client-Side QR Generation &amp; Payload Privacy</span>
        </h2>
        <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400 text-sm">
          Unlike server-rendered QR generators that send your Wi-Fi keys, internal staging URLs, or personal contact details to a remote backend,
          KivaroTools executes QR matrix encoding, Reed-Solomon parity calculation, SVG vector building, A4 PDF generation, and optical decoding directly inside your browser.
          No payloads or uploaded logo images are sent to KivaroTools servers by this tool.
        </p>
      </section>

      {/* SECTION 12: FAQS (15 Items matching FAQPage JSON-LD) */}
      <section aria-labelledby="qr-generator-frequently-asked-questions" className="mb-8">
        <h2 id="qr-generator-frequently-asked-questions" className="text-xl sm:text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Frequently Asked Questions</span>
        </h2>
        <div className="space-y-3">
          {QR_GENERATOR_FAQS.map((faq, index) => (
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
      </section>

      {/* SECTION 13: CALL TO ACTION */}
      <section aria-labelledby="qr-generator-ready-to-create-your-free-perm" className="my-8 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center not-prose shadow-xl shadow-blue-500/10">
        <h2 id="qr-generator-ready-to-create-your-free-perm" className="text-xl sm:text-2xl font-bold mb-2 text-white">
          Ready to Create Your Free Static QR Code?
        </h2>
        <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto mb-5 leading-relaxed">
          Generate an unexpiring QR code for your website, Wi-Fi network, vCard business card, or event—verify scannability and export vector SVG or A4 PDF in seconds.
        </p>
        <a
          href="#qr-generator-tool"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-all shadow-md active:scale-95"
        >
          <span>Back to QR Code Generator</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </section>

      {/* SECTION 14: RELATED TOOLS INTERNAL LINKING */}
      <section aria-labelledby="qr-generator-related-tools" className="pt-6 border-t border-gray-200 dark:border-slate-800 not-prose">
        <h2 id="qr-generator-related-tools" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Related SEO, Vector &amp; Document Tools
        </h2>
        <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
          <Link
            href="/developer/svg-optimizer"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
          >
            SVG Optimizer &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/seo/meta-generator"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
          >
            Meta Tags &amp; Open Graph Generator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/seo/text-case-converter"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
          >
            Text Case Converter &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/seo/text-analyzer"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
          >
            Word Counter &amp; Text Analyzer &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/media/image-compressor"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
          >
            Image Compressor &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/document/image-to-pdf"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
          >
            Image to PDF Converter &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/developer/base64-encoder"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
          >
            Base64 Encoder &amp; Decoder &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/seo"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
          >
            All SEO &amp; Text Tools &rarr;
          </Link>
        </div>
      </section>
    </article>
  );
}