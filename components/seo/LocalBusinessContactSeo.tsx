import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Mail,
  Phone,
  Cpu,
  Layers,
  Terminal,
  HelpCircle,
  Sparkles,
  Search,
  ShieldCheck,
  FileSpreadsheet,
  Globe,
} from 'lucide-react';

export interface SeoMetaConfig {
  title: string;
  description: string;
  slug: string;
  category: string;
  canonicalUrl: string;
  keywords: string[];
}

export const LOCAL_BUSINESS_CONTACT_SEO_META: SeoMetaConfig = {
  title:
    'Local Business, Profession & Contact Finder — Extract Emails, Phones & Locations Free | KivaroTools',
  description:
    'Find local businesses, doctors, dental clinics, plumbers, lawyers, and B2B leads across 60 global city presets (or any custom city via Nominatim) and 36 professions using live OpenStreetMap Overpass queries and smart Google/directory paste enrichment. Filter Emails Only, Phones + WhatsApp Only, or Complete Profiles and export to 3-Sheet Excel (.xlsx), CSV, Mobile vCard (.vcf), GeoJSON, and JSON.',
  slug: 'business-contact-finder',
  category: 'seo',
  canonicalUrl: 'https://kivarotools.com/seo/business-contact-finder',
  keywords: [
    'local business contact finder by city and profession',
    'extract business emails and phone numbers online free',
    'openstreetmap overpass business lead extractor',
    'free google maps copy paste contact extractor',
    'find dental clinics and doctors official emails',
    'find plumbers and electricians phone numbers by city',
    'deobfuscate email addresses and cloudflare data-cfemail',
    'pakistan +92 ptcl 061 042 111 uan phone normalizer',
    'uae +971 and saudi +966 whatsapp link generator',
    'bulk business contacts to mobile vcard vcf converter',
    'verify email domain mx records via cloudflare doh',
    'export local business directory to 3-sheet excel xlsx',
  ],
};

export interface FaqItem {
  question: string;
  answer: string;
}

export const LOCAL_BUSINESS_CONTACT_FAQS: FaqItem[] = [
  {
    question:
      'How does the KivaroTools Local Business, Profession & Contact Intelligence Studio find real businesses by city and profession for free?',
    answer:
      'KivaroTools combines two complementary browser engines: Engine 1 connects directly from your browser to public, CORS-enabled OpenStreetMap Overpass API instances (overpass-api.de with automatic failover to overpass.private.coffee) to query mapped businesses, clinics, dental practices, plumbers, lawyers, and software offices across 60 built-in global city presets (or any custom city worldwide resolved via OpenStreetMap Nominatim) and 36 professions within a 2 km to 40 km radius under the Open Database License (ODbL). Engine 2 lets you copy-paste raw search listings from Google Search, Google Maps, regional directories (like Marham, Oladoc, YellowPages, or Zameen), raw HTML source, RFC 4180 CSV files, or vCards (.vcf) to extract and merge unmapped local businesses into the same filterable table.',
  },
  {
    question:
      'Why does Engine 2 use Smart Copy-Paste for Google Search and Google Maps instead of direct background scraping?',
    answer:
      'Google Search and Google Maps enforce strict Cross-Origin Resource Sharing (CORS) blocks and anti-bot challenges that prevent any client-side browser tab from fetching their SERP HTML directly, while the official Google Places API charges $17 to $32 per 1,000 requests and prohibits bulk CSV/Excel lead exporting under its Terms of Service. By pairing live OpenStreetMap Overpass API discovery (Engine 1) with an instant Ctrl+A / Ctrl+C Smart Paste Enricher (Engine 2), KivaroTools lets you capture both mapped OpenStreetMap POIs and unmapped Google/directory listings legally, at $0 cost, with zero API keys.',
  },
  {
    question:
      'What happens if I type a custom city name (like Rahim Yar Khan, Jhelum, Ajman, or Chicago) that is not in the 36 preset cities?',
    answer:
      'When you type a custom city name into the "City Label" box in Engine 1 and click "Fetch Live Businesses" without manually changing the latitude and longitude, the studio automatically queries the OpenStreetMap Nominatim geocoding service (nominatim.openstreetmap.org) to resolve that city’s true GPS coordinates and country dial code before executing the Overpass API query—ensuring your live search always targets the exact city you typed.',
  },
  {
    question:
      'Do the initial Multan sample records stay mixed in when I run a live search for another city like Lahore or Dubai?',
    answer:
      'No. On initial page load, the studio displays an 8-record Multan sample pack so you can preview the filters and export formats immediately. As soon as you run your first live city search in Engine 1—or type, paste, or upload your own data in Engine 2—the initial demo sample is automatically cleared so your table contains only your real queried or pasted businesses.',
  },
  {
    question:
      'How can I extract only email addresses or only phone numbers for a specific profession like Dentists or Plumbers in my city?',
    answer:
      'First select your target Industry Sector or Profession (such as "Dental Clinics" or "Plumbers") and City (such as "Multan", "Lahore", "Dubai", or "London") in the filter bar. Then click the "Emails Only" button or the "Phone Numbers & WhatsApp Only" button above the results table. The studio immediately isolates a deduplicated list of emails or phone numbers for that exact profession and location, ready to copy in 1 click or download as TXT, CSV, 3-Sheet Excel (.xlsx), JSON, or mobile vCard (.vcf).',
  },
  {
    question:
      'Which country phone formats, PTCL landlines, 111 UANs, and trunk prefixes are supported by the telecom normalizer?',
    answer:
      'Our telecom normalizer supports 69 worldwide country dial plans out of the box: Pakistan (+92, including 0300–0349 mobile numbers, PTCL city landlines such as 061 Multan, 042 Lahore, 021 Karachi, 051 Islamabad/Rawalpindi, 041 Faisalabad, 091 Peshawar, 052 Sialkot, 055 Gujranwala, 062 Bahawalpur, 048 Sargodha, 081 Quetta, 022 Hyderabad, and 0992 Abbottabad, plus 111 Universal Access Numbers like 061-111-244-685 and 0800 toll-free lines), UAE (+971), Saudi Arabia (+966), Qatar (+974), Oman (+968), Kuwait (+965), United Kingdom (+44), Germany (+49), Netherlands (+31), Turkey (+90), United States (+1), Canada (+1), Australia (+61), Singapore (+65), and Malaysia (+60). It also strips redundant international trunk prefixes like "+92 (0) 300..." and trailing extensions ("ext. 104") to produce valid ITU-T E.164 numbers and wa.me WhatsApp links.',
  },
  {
    question:
      'How does the de-obfuscation engine recover hidden emails from websites without turning normal English sentences into fake emails?',
    answer:
      'Many business directories and clinic websites hide email addresses from basic scrapers using bracketed substitutions ("info [at] clinic [dot] pk", "contact(at)domain(dot)com", "care{at}hospital{dot}org"), spaced symbols ("sales @ domain . com"), URL-encoded hex ("%40"), HTML character entities ("&#64;" and "&#46;"), or Cloudflare Email Address Obfuscation ("data-cfemail" XOR hex strings). KivaroTools decodes all of these patterns locally while requiring explicit obfuscation markers or verified TLD boundaries—so natural English sentences like "Visit us at Bosan. Road" or static image filenames like "logo@2x.png" never produce false-positive emails.',
  },
  {
    question:
      'How does the Weighted Profession Classifier avoid misclassifying businesses located near hospitals or universities?',
    answer:
      'Simple keyword tools scan the entire line linearly, so an electrical shop with the address "Near Nishtar Hospital, Multan" or a coworking space "Near Auto Spare Parts Market" gets misclassified as a Hospital or Spa. KivaroTools uses word-boundary matching (\\b) and assigns 3x weight to the business name and explicit category columns over street address landmarks, while prioritizing exact OpenStreetMap tags (amenity, healthcare, craft, office, shop) whenever present.',
  },
  {
    question:
      'How does the live DNS MX Record verification button work inside the browser?',
    answer:
      'When you click "Verify MX" next to any extracted email address, your browser sends a lightweight HTTPS request to Cloudflare’s public DNS-over-HTTPS resolver (https://cloudflare-dns.com/dns-query?type=MX) for that email domain. If the domain has active Mail Exchange (MX) servers configured, the badge updates to "MX Verified ✓". Note that MX verification confirms the domain can receive mail, not whether an individual mailbox exists.',
  },
  {
    question:
      'Can I import the extracted business phone numbers and emails directly into my Android or iPhone contacts?',
    answer:
      'Yes. Click the "Mobile vCard (.VCF)" button in the main toolbar (or inside the Phone Numbers Only view) to download a standard multi-contact vCard 3.0 file containing every filtered business’s name, profession title, work/mobile phone numbers, official email addresses, physical street address, website URL, and GPS coordinates. Opening that .vcf file on Android, iOS, macOS Contacts, or Microsoft Outlook imports all contacts in a single tap.',
  },
  {
    question:
      'Are my pasted lead lists, uploaded CSV/vCard files, or extracted contacts uploaded to any KivaroTools server?',
    answer:
      'No. All text parsing, HTML/JSON-LD extraction, phone normalization, multi-index deduplication, and Excel/CSV/vCard/GeoJSON/JSON file generation run 100% locally in your browser RAM. Network requests occur only when you explicitly click "Fetch Live Businesses" (which queries the public OpenStreetMap Overpass & Nominatim APIs directly from your browser) or "Verify MX" (which queries Cloudflare DNS-over-HTTPS directly).',
  },
  {
    question:
      'What happens if I paste raw HTML source code from a clinic or business website that uses Schema.org JSON-LD?',
    answer:
      'Before stripping HTML tags, Engine 2 scans for embedded <script type="application/ld+json"> blocks containing LocalBusiness, Dentist, Physician, MedicalClinic, Plumber, LegalService, or Organization objects (including nested @graph arrays). It extracts the structured business name, street address, city, postal code, WGS84 geo coordinates, telephone, email, and openingHours directly from the JSON-LD payload.',
  },
  {
    question:
      'How does multi-index deduplication work when combining Live OpenStreetMap results with pasted Google Maps listings?',
    answer:
      'When "Merge & deduplicate" is enabled, our engine indexes every record across three simultaneous lookup tables: canonical lowercase email address, normalized E.164 phone number, and normalized business name + city key. If an OpenStreetMap node has a clinic’s name, GPS coordinates, and landline number (061-6524819), and your pasted directory snippet has that same landline plus a mobile WhatsApp number and official email, the multi-index resolver merges both into a single 100%-complete business profile.',
  },
  {
    question:
      'What is the difference between Corporate Domain Emails and Free Webmail in the filter bar?',
    answer:
      'Enabling "Corporate Domain Emails Only" filters out 18 consumer webmail providers (such as gmail.com, yahoo.com, hotmail.com, outlook.com, live.com, icloud.com, proton.me, and zoho.com) so B2B outreach teams only view and export addresses hosted on custom organization or clinic domains (such as info@alshifadentalmultan.pk or partnerships@nexacloud.pk).',
  },
  {
    question:
      'What is contained in the 3-Sheet Excel (.xlsx) export workbook, and how is it protected against CWE-1236?',
    answer:
      'Unlike basic tools that only export flat CSV files, KivaroTools builds a native 3-sheet OpenXML Excel (.xlsx) workbook in browser RAM: Sheet 1 ("Summary Metrics") provides total counts and 6-sector breakdowns; Sheet 2 ("Business Directory") contains all 18 structured columns including Google Maps and WhatsApp links; and Sheet 3 ("Emails and Phones Only") provides a row-by-row outreach ledger. Every cell starting with =, +, -, @, Tab, or CR is prefixed with a leading single quote (\') to neutralize Spreadsheet Formula Injection (CWE-1236).',
  },
  {
    question:
      'Why do some OpenStreetMap Overpass live results have a business name, address, and GPS coordinates but no email address?',
    answer:
      'OpenStreetMap is a community-mapped open geospatial database: while almost every mapped clinic, shop, and office includes a name, category tag, street location, and GPS coordinates (and many include phone or website tags), smaller businesses in developing cities do not always publish an email tag on OpenStreetMap. That is why KivaroTools includes Engine 2 (Smart Paste Enricher) in the same studio—allowing you to copy-paste results from Google Search, Google Maps, or local directories to fill in missing emails and mobile numbers instantly.',
  },
];

export default function LocalBusinessContactSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: LOCAL_BUSINESS_CONTACT_FAQS.map((faq) => ({
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
    name: 'How to Find Local Business Contacts, Official Emails, and Phone Numbers by City and Profession Online',
    description:
      'Step-by-step guide to discovering local business profiles, doctors, dental clinics, plumbers, lawyers, and B2B leads by city and profession and exporting filtered emails, WhatsApp numbers, or complete details to Excel, CSV, JSON, GeoJSON, and mobile vCard.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Select a City Preset (or Type Any City) & Profession in Engine 1',
        text: 'Choose from 60 global city presets (such as Multan, Lahore, Karachi, Islamabad, Dubai, Riyadh, London, or New York) or type any custom city name (auto-resolved via Nominatim), pick from 36 target professions, set your radius (2 km to 40 km), and click Fetch Live Businesses.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Enrich Unmapped Leads via Smart Copy-Paste in Engine 2',
        text: 'Copy search listings from Google Search, Google Maps, regional directories (Marham, Oladoc, YellowPages), raw HTML source, or RFC 4180 CSV / vCard (.vcf) files and paste them into Engine 2 to automatically extract and merge additional emails, phone numbers, and addresses.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Filter by Sector, Profession & City and Switch View Modes',
        text: 'Use the Sector, Profession, and City dropdowns alongside the 1-click view toggles to isolate Complete Business Details, Emails Only (corporate or all domains), or Phone Numbers & WhatsApp Links Only.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Verify Domain MX Records & Export in 5 Formats',
        text: 'Click Verify MX to check live domain mail servers via Cloudflare DNS-over-HTTPS, then export your filtered leads to a 3-Sheet Excel (.xlsx) workbook, CSV, mobile Contacts vCard (.vcf), GeoJSON, or JSON file.',
      },
    ],
  };

  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: LOCAL_BUSINESS_CONTACT_SEO_META.title,
    description: LOCAL_BUSINESS_CONTACT_SEO_META.description,
    url: LOCAL_BUSINESS_CONTACT_SEO_META.canonicalUrl,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All (Web Browser — Chrome, Edge, Firefox, Safari, iOS, Android)',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
  };

  return (
    <article className="mt-16 w-full min-w-0 max-w-full overflow-x-hidden space-y-12 text-slate-700 dark:text-slate-300">
      {/* Structured Data Scripts (SoftwareApplication, FAQPage & HowTo — < escaped) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareAppSchema).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema).replace(/</g, '\\u003c'),
        }}
      />

      {/* ============================================================================
          SECTION 1: TITLE, DESCRIPTION & DUAL-ENGINE CONTACT INTELLIGENCE OVERVIEW
         ============================================================================ */}
      <section
        aria-labelledby="business-contact-finder-overview"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h2
            id="business-contact-finder-overview"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Local Business, Profession &amp; B2B Contact Intelligence Studio
          </h2>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shrink-0">
            <Sparkles className="h-3.5 w-3.5" />
            Live Overpass API + Smart Paste + 1-Click Field Isolation
          </span>
        </div>

        <p className="mt-3 w-full text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          Discover and extract <strong>real business names, professions, official email addresses, ITU-T E.164 phone numbers, WhatsApp click-to-chat links, websites, and street addresses</strong> across any city worldwide. Filter by <strong>Industry Sector, Profession &amp; City</strong>, switch between <strong>Complete Business Details</strong>, <strong>Emails Only</strong>, or <strong>Phone Numbers &amp; WhatsApp Only</strong> in one click, and export directly to <strong>3-Sheet Excel (<code>.xlsx</code>), CSV, Mobile Contacts vCard (<code>.vcf</code>), GeoJSON, and JSON</strong>.
        </p>

        <blockquote className="p-4 my-6 bg-emerald-50/80 border-l-4 border-emerald-600 rounded-r-xl dark:bg-slate-800/80 not-italic">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
            <strong>100% Client-Side Processing &amp; Transparent Data Sourcing:</strong> All text parsing, email de-obfuscation, E.164 phone normalization, multi-index deduplication, and Excel/CSV/vCard file generation execute locally in your browser RAM without uploading your lead lists to KivaroTools servers. Live city queries connect directly from your browser to public <a href="https://wiki.openstreetmap.org/wiki/Overpass_API" target="_blank" rel="noopener noreferrer" className="underline font-semibold">OpenStreetMap Overpass API</a> and <a href="https://wiki.openstreetmap.org/wiki/Nominatim" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Nominatim</a> endpoints under the Open Database License (ODbL).
          </p>
        </blockquote>

        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
          <p>
            Whether you need the contact details of <strong>plumbers, electricians, dental clinics, specialist doctors, hospitals, pharmacies, lawyers, chartered accountants, real estate brokers, or software houses</strong> in <strong>Multan, Lahore, Karachi, Islamabad, Dubai, Riyadh, London, or New York</strong>, existing tools force an unnecessary compromise. Paid cloud scrapers like Apify, Outscraper, and PhantomBuster charge $56 to $99/month (or per 1,000 rows) and restrict free exports to 10 rows. Corporate B2B databases like ZoomInfo, Apollo.io, and Lusha focus on LinkedIn profiles and cap free users at 5 to 50 monthly credits. Meanwhile, free browser regex tools like TestMu AI or BetterBugs only extract flat, unassociated lists of emails or phone numbers—discarding the business name, profession, and street address.
          </p>
          <p>
            KivaroTools solves this by combining <strong>two honest, complementary browser engines</strong> in one workspace: <strong>Engine 1 (Live City &amp; Profession Overpass Finder)</strong> queries mapped OpenStreetMap businesses by city and category in real time with zero API keys, while <strong>Engine 2 (Smart Copy-Paste &amp; File Enricher)</strong> lets you copy-paste any Google Search/Maps local pack, medical or trade directory page (such as Marham, Oladoc, or YellowPages), raw HTML source, CSV, or vCard to extract and merge unmapped local businesses into the exact same deduplicated table.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              60 Cities + Worldwide Nominatim Auto-Geocoding &amp; 36 Professions
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Select from 60 built-in global city presets (14 Pakistan cities, 10 UAE/Saudi GCC hubs, 12 UK/EU/US/APAC centers) or type any custom city worldwide (auto-resolved via Nominatim) across 36 professions in 6 industry sectors.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              69-Country Worldwide E.164, PK 111 UAN &amp; 1-Click WhatsApp
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Normalizes mobile numbers, PTCL city landlines (<code>061</code> Multan, <code>042</code> Lahore, <code>021</code> Karachi, <code>051</code> Islamabad), <code>111</code> UANs, <code>0800</code> toll-free, and <code>+92 (0)</code> trunk prefixes across 69 countries worldwide into E.164 + <code>wa.me/</code> links.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              1-Click Emails Only, Phones Only &amp; 5 Exports
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Isolate official emails, phone numbers, or complete profiles by profession and export to CWE-1236-safe 3-Sheet Excel (<code>.xlsx</code>), CSV, Mobile Contacts (<code>.vcf</code>), GeoJSON, or JSON.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 2: HOW THE TOOL WORKS INTERNALLY (5-STAGE PIPELINE)
         ============================================================================ */}
      <section
        aria-labelledby="business-contact-working-pipeline"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2.5 mb-2">
          <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2
            id="business-contact-working-pipeline"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            How the Tool Works Internally: 5-Stage Client-Side Architecture (<code>v3.0.0-global</code>)
          </h2>
        </div>
        <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          Every live map query and pasted directory snippet passes through a deterministic 5-stage pipeline inside <code>lib/localBusinessContactEngine.ts</code>:
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
              1
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Nominatim Geocode &amp; Overpass QL
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Resolves preset or custom city coordinates via Nominatim, compiles deduplicated <code>nwr[amenity|healthcare|craft|office](around:r,lat,lon)</code> Overpass QL queries, and parses multi-line Google Maps cards, RFC 4180 CSVs, JSON-LD graphs, and vCards.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
              2
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Prose-Safe Email De-Obfuscation
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Decodes Cloudflare <code>data-cfemail</code> XOR hex strings, HTML entities (<code>&amp;#64;</code>/<code>&amp;#46;</code>), and <code>[at]</code>/<code>(dot)</code> patterns while rejecting natural prose sentences and static asset filenames (<code>logo@2x.png</code>).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
              3
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              69-Country Worldwide E.164 &amp; UAN Normalizer
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Strips international trunk <code>(0)</code> prefixes and extensions (<code>ext 104</code>), converts regional landlines, PK <code>111</code> UANs, <code>0800</code> toll-free, and mobile numbers across 69 countries worldwide into E.164 format, and builds <code>wa.me</code> links.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white">
              4
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Landmark-Immune Tagging &amp; Merge
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Classifies records into 36 professions using 3x business-title weighting (so street landmarks like <em>&quot;Near Nishtar Hospital&quot;</em> never hijack the profession) and merges duplicates across Email, E.164 Phone, and Name+City indices.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
              5
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Field Isolation &amp; 5-Format Export
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Routes filtered leads into Complete Directory (responsive mobile cards + desktop table), Emails Only, or Phones Only views and builds CWE-1236-safe <code>.xlsx</code>, <code>.csv</code>, <code>.vcf</code>, <code>.geojson</code>, and <code>.json</code> files.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 3: STEP-BY-STEP GUIDE (HOW TO USE THE TOOL)
         ============================================================================ */}
      <section
        aria-labelledby="business-contact-user-guide"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
      >
        <div>
          <h2
            id="business-contact-user-guide"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            How to Use the Local Business, Profession &amp; Contact Finder (Step-by-Step Guide)
          </h2>
          <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            Follow these four steps on desktop or mobile to discover, enrich, filter, and export business contacts for any profession and city:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 1: Run a Live City &amp; Profession Search in Engine 1
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Select your target city from the <strong>36 built-in presets</strong> (such as <strong>Multan, Lahore, Karachi, Islamabad, Peshawar, Hyderabad, Dubai, Riyadh, Doha, London, or New York</strong>) or type any custom city name into box #3 (automatically geocoded via OpenStreetMap Nominatim). Choose a profession from <strong>36 categories</strong> (e.g., <strong>Dental Clinics, Doctors, Plumbers, Electricians, Lawyers, or Software Houses</strong>), adjust your radius (2 km to 40 km), and click <strong>Fetch Live Businesses</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 2: Enrich Unmapped Businesses via Smart Copy-Paste in Engine 2
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              To capture local plumbers, clinics, or shops that only publish their phone number or email on Google Search, Google Maps, Marham, Oladoc, or YellowPages, select text on that search page (<code>Ctrl+A</code> then <code>Ctrl+C</code>) and paste it into <strong>Engine 2</strong>—or upload an <code>.html</code>, <code>.csv</code>, <code>.tsv</code>, or <code>.vcf</code> file up to 15 MB.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 3: Filter by Sector/Profession &amp; Switch to Emails Only or Phones Only
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Use the <strong>Industry Sector</strong>, <strong>Profession</strong>, <strong>City</strong>, and <strong>15-Country Dial Format</strong> dropdowns alongside the 1-click filter pills (<strong>Has Email Only</strong>, <strong>Corporate Domain Emails Only</strong>, <strong>Mobile / WhatsApp Numbers Only</strong>). Click <strong>Emails Only</strong> or <strong>Phone Numbers &amp; WhatsApp Only</strong> to isolate the exact contact field you need.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 4: Verify Domain MX Records &amp; Export in 5 Formats
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Click <strong>Verify MX</strong> next to any email address to check active mail exchange servers via Cloudflare DNS-over-HTTPS, then download your filtered leads as a <strong>3-Sheet Excel Workbook (<code>.xlsx</code>)</strong>, <strong>CSV (<code>.csv</code>)</strong>, <strong>Mobile Contacts vCard (<code>.vcf</code>)</strong>, <strong>GeoJSON (<code>.geojson</code>)</strong>, or <strong>JSON (<code>.json</code>)</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 4: REAL-WORLD BEFORE VS. AFTER EXAMPLES (3 SHOWCASES)
         ============================================================================ */}
      <section
        aria-labelledby="business-contact-real-examples"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2
              id="business-contact-real-examples"
              className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Real-World Examples: Raw Directory &amp; Maps Snippets vs. Normalized Studio Output
            </h2>
          </div>
          <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            See how the engine transforms raw multi-line Google Maps cards, obfuscated emails, and regional phone numbers into structured, filterable records:
          </p>
        </div>

        {/* Example 1 */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Example 1: Multan Dental Clinics, Hospital UAN &amp; Plumbers Snippet → E.164, WhatsApp &amp; De-Obfuscated Emails
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs font-mono text-slate-300 overflow-x-auto">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400 mb-2">
                Raw Copied Directory / Web Text (Before)
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed">{`Al-Shifa Dental & Orthodontic Center | Bosan Road, Multan | 061-6524819 | +92 (0) 300 6314820 | info [at] alshifadentalmultan [dot] pk
Buch International Hospital Outpatient Clinic | Bosan Road, Multan | 061-111-244-685 | helpdesk&#64;buchhospital&#46;com
Al-Madina Sanitary & Master Plumbing Services | Opposite Children Hospital, Multan | 0301-7458921 ext 12 | bookings@madinaplumbingmultan.pk`}</pre>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs font-mono text-emerald-300 overflow-x-auto">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
                Normalized Studio Output (After — Landmark-Immune + E.164 + WhatsApp)
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed">{`1. Al-Shifa Dental & Orthodontic Center [Dental Clinics — Multan]
   • Email: info@alshifadentalmultan.pk (Corporate, De-Obfuscated)
   • Phones: +92616524819 (Landline 061-6524819), +923006314820 (Mobile, trunk 0 stripped)
   • WhatsApp: https://wa.me/923006314820

2. Buch International Hospital Outpatient Clinic [Hospitals — Multan]
   • Email: helpdesk@buchhospital.com (Corporate, HTML Entity Decoded)
   • Phone: +9261111244685 (UAN 061-111-244-685)

3. Al-Madina Sanitary & Master Plumbing Services [Plumbers — Multan]
   • Email: bookings@madinaplumbingmultan.pk (Corporate)
   • Phone: +923017458921 (Mobile 0301-7458921, ext 12 stripped)
   • WhatsApp: https://wa.me/923017458921`}</pre>
            </div>
          </div>
        </div>

        {/* Example 2 */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Example 2: 1-Click &quot;Emails Only&quot; Isolation Scoped by Industry Sector (Named RFC 5322 Format)
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs font-mono text-slate-300 overflow-x-auto">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-2">
                Active Filter Configuration
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed">{`View Mode: Emails Only
Selected Sector: Healthcare, Doctors & Dental Clinics
Corporate Domain Only: Enabled
Format: Named RFC 5322 ("Business <email>")`}</pre>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs font-mono text-emerald-300 overflow-x-auto">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
                Instant 1-Click Copy / .TXT Download Output
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed">{`"Al-Shifa Dental & Orthodontic Implant Center (Dental Clinics - Multan)" <info@alshifadentalmultan.pk>
"Multan Smile Care & Maxillofacial Clinic (Dental Clinics - Multan)" <appointments@multansmilecare.com>
"City Heart & Specialist Medical Center (Dr. Kamran Raza FCPS) (Doctors & Clinics - Multan)" <care@cityheartmultan.org>
"Buch International Hospital Outpatient Clinic (Hospitals - Multan)" <helpdesk@buchhospital.com>`}</pre>
            </div>
          </div>
        </div>

        {/* Example 3 */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Example 3: Multi-Index Deduplication (Merging Live OpenStreetMap Node + Pasted Directory Snippet)
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs font-mono text-slate-300 overflow-x-auto">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2">
                Two Separate Inputs (Engine 1 OSM + Engine 2 Paste)
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed">{`[Engine 1 — Live Overpass Node #482910]
name="Al-Shifa Dental & Orthodontic Implant Center"
amenity="dentist", phone="061-6524819"
lat=30.16120, lon=71.52840 (No email tag on OSM)

[Engine 2 — Pasted Directory Line]
Al-Shifa Dental & Orthodontic Implant Center | 061-6524819 | 0300-6314820 | info@alshifadentalmultan.pk`}</pre>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs font-mono text-emerald-300 overflow-x-auto">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
                Merged Single Canonical Profile (100% Completeness Score)
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed">{`Business Name: Al-Shifa Dental & Orthodontic Implant Center
Profession: Dental Clinics (Healthcare Sector)
Emails (1): info@alshifadentalmultan.pk (Corporate)
Phones (2): +92616524819 (Landline), +923006314820 (Mobile WhatsApp)
Coordinates: 30.16120, 71.52840 (0.53 km from Multan center)
Completeness Score: 100% Complete`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 5: 36-PROFESSION & 15-COUNTRY TELECOM TECHNICAL REFERENCE MATRIX
         ============================================================================ */}
      <section
        aria-labelledby="business-contact-reference-matrix"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <h2
          id="business-contact-reference-matrix"
          className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          Technical Reference: 6 Macro Industry Sectors, 36 Profession Presets &amp; OSM Tag Mappings
        </h2>
        <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          Every profession in <code>lib/localBusinessContactEngine.ts</code> combines OpenStreetMap Overpass QL tag selectors with weighted local keyword classifiers:
        </p>

        <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
              <tr>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700">
                  Industry Sector
                </th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700">
                  Supported Professions (36 Presets)
                </th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700">
                  OpenStreetMap Overpass Tag Selectors
                </th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700">
                  Extracted Contact &amp; Geo Attributes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                  Healthcare, Doctors &amp; Dental
                </td>
                <td className="py-3 px-4">
                  Dental Clinics, Specialist Doctors &amp; Clinics, Hospitals, Pharmacies, Diagnostic Labs, Veterinary (6)
                </td>
                <td className="py-3 px-4 font-mono text-[11px]">
                  amenity=dentist|doctors|clinic|hospital|pharmacy|veterinary, healthcare=*
                </td>
                <td className="py-3 px-4">
                  Official Email, PTCL/Landline, 111 UAN, Mobile WhatsApp, Opening Hours, GPS Pin
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                  Plumbers &amp; Home Trades
                </td>
                <td className="py-3 px-4">
                  Plumbers, Electricians &amp; Solar, AC &amp; HVAC Techs, Carpenters &amp; Woodwork, Auto Mechanics, Builders &amp; Architects, Pest &amp; Cleaning (7)
                </td>
                <td className="py-3 px-4 font-mono text-[11px]">
                  craft=plumber|electrician|hvac|carpenter|builder|cleaning, shop=car_repair|electrical
                </td>
                <td className="py-3 px-4">
                  Mobile WhatsApp (<code>wa.me/</code>), Workshop Address, City Area Code, Service Type
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                  Legal, Tax &amp; Real Estate
                </td>
                <td className="py-3 px-4">
                  Lawyers &amp; Advocates, Accountants &amp; Tax, Real Estate Agencies, Banks &amp; Exchange, Insurance &amp; Takaful, Marketing Agencies (6)
                </td>
                <td className="py-3 px-4 font-mono text-[11px]">
                  office=lawyer|notary|accountant|tax_advisor|estate_agent|insurance|advertising_agency
                </td>
                <td className="py-3 px-4">
                  Corporate Domain Email, Office Landline, Chamber Address, Website URL
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                  Software Houses, IT &amp; Tech
                </td>
                <td className="py-3 px-4">
                  Software &amp; IT, Coworking &amp; Offices, Computers &amp; Mobile, Logistics &amp; Courier, CCTV &amp; Security, Printing &amp; Packaging (6)
                </td>
                <td className="py-3 px-4 font-mono text-[11px]">
                  office=it|software|telecommunication|company|logistics, craft=locksmith|printer
                </td>
                <td className="py-3 px-4">
                  HR/Partnerships Email, Corporate Website, MX Status, Tech Park Location
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                  Hospitality, Food &amp; Retail
                </td>
                <td className="py-3 px-4">
                  Restaurants &amp; Cafes, Hotels &amp; Lodging, Supermarkets, Clothing &amp; Textile, Hardware &amp; Sanitary, Jewelry &amp; Optics (6)
                </td>
                <td className="py-3 px-4 font-mono text-[11px]">
                  amenity=restaurant|cafe|fast_food, tourism=hotel|guest_house, shop=supermarket|hardware
                </td>
                <td className="py-3 px-4">
                  Booking Phone, Delivery WhatsApp, Street Address, Google Maps Direction Link
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                  Education, Fitness &amp; Lifestyle
                </td>
                <td className="py-3 px-4">
                  Schools &amp; Colleges, Gyms &amp; Fitness, Salons &amp; Aesthetics, Travel &amp; Visa, Events &amp; Photo Studios (5)
                </td>
                <td className="py-3 px-4 font-mono text-[11px]">
                  amenity=school|college|university, leisure=fitness_centre, shop=beauty|travel_agency|photo
                </td>
                <td className="py-3 px-4">
                  Admissions/Info Email, Reception Phone, Campus Coordinates, Website
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================================
          SECTION 6: HONEST COMPARISON WITH POPULAR ENTERPRISE & FREE TOOLS
         ============================================================================ */}
      <section
        aria-labelledby="business-contact-competitor-matrix"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <h2
          id="business-contact-competitor-matrix"
          className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          Comparison with Popular Tools: KivaroTools vs. Cloud Scrapers, B2B Databases &amp; Regex Extractors
        </h2>
        <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-[760px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
              <tr>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700">
                  Capability / Engineering Feature
                </th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">
                  KivaroTools Hybrid Studio
                </th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700">
                  Apify / Outscraper / PhantomBuster
                </th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700">
                  Apollo.io / Lusha / Hunter.io
                </th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700">
                  TestMu AI / BetterBugs / Lumail
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
              <tr>
                <td className="py-3 px-4 font-semibold">
                  Cost &amp; Usage Limits
                </td>
                <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                  $0 Forever (Zero API Key, Unlimited Local &amp; Overpass)
                </td>
                <td className="py-3 px-4">$672 to $960+/year (Per-row &amp; enrichment fees)</td>
                <td className="py-3 px-4">$432 to $1,188+/seat/year (5–50 free credits/mo)</td>
                <td className="py-3 px-4">$0 (Single-purpose regex boxes)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">
                  Live City + Profession Map Discovery
                </td>
                <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                  Yes (60 City Presets + Worldwide Nominatim Custom Cities + 36 Professions)
                </td>
                <td className="py-3 px-4">Yes (Paid cloud actor queue)</td>
                <td className="py-3 px-4">Corporate LinkedIn profiles only</td>
                <td className="py-3 px-4">No (Cannot search cities or professions)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">
                  Google Search / Maps &amp; Directory Paste Enricher
                </td>
                <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                  Yes (Multi-line card, CSV, JSON-LD &amp; vCard entity correlation)
                </td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4">Extracts flat unassociated lists only</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">
                  1-Click View Switcher (Emails Only / Phones Only / Full)
                </td>
                <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                  Yes (Scoped by Sector, Profession &amp; City)
                </td>
                <td className="py-3 px-4">Requires manual CSV cleanup</td>
                <td className="py-3 px-4">Costs separate email/phone credits</td>
                <td className="py-3 px-4">Split across separate tool URLs</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">
                  PK (+92 / 061 / 111 UAN), UAE (+971) &amp; KSA (+966) + WhatsApp
                </td>
                <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                  Yes (69 Countries + Trunk (0) Strip + 1-Click wa.me)
                </td>
                <td className="py-3 px-4">Raw unformatted phone strings</td>
                <td className="py-3 px-4">Low SMB coverage in South Asia/MENA</td>
                <td className="py-3 px-4">Misses regional landline &amp; UAN prefixes</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">
                  Multi-Format Export (.XLSX, .CSV, Mobile .VCF, .GeoJSON, .JSON)
                </td>
                <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                  All 5 Formats Built-In Free (CWE-1236 Safe)
                </td>
                <td className="py-3 px-4">CSV / JSON / XLSX (Paid tier)</td>
                <td className="py-3 px-4">CSV (Paid export credits)</td>
                <td className="py-3 px-4">Plain TXT or basic CSV only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================================
          SECTION 7: 36 LOW-COMPETITION, LONG-TAIL KEYWORDS & WORKFLOW COVERAGE
         ============================================================================ */}
      <section
        aria-labelledby="business-contact-keyword-coverage"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2 mb-2">
          <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2
            id="business-contact-keyword-coverage"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Low-Competition, High-Intent Long-Tail Keywords &amp; Supported Workflows (36 Search Intents)
          </h2>
        </div>
        <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          Every workflow listed below is directly implemented and verified in <code>lib/localBusinessContactEngine.ts</code>:
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              1. Local Business, Doctor &amp; Trade Discovery (12 Workflows)
            </h3>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
              <li>local business contact finder by city and profession free</li>
              <li>openstreetmap overpass api business lead extractor online</li>
              <li>find dental clinics and orthodontists official emails by city</li>
              <li>extract doctors and medical clinics phone numbers multan lahore</li>
              <li>find plumbers and sanitary contractors whatsapp numbers online</li>
              <li>dubai and riyadh polyclinic and real estate contact finder</li>
              <li>free browser alternative to apify and outscraper map leads</li>
              <li>extract b2b software houses and law firms by city radius</li>
              <li>google maps copy paste business name and phone extractor</li>
              <li>marham and oladoc directory text to structured contact table</li>
              <li>nominatim custom city coordinates overpass query builder</li>
              <li>export openstreetmap business pois to geojson and excel</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              2. Bulk Email De-Obfuscation &amp; Domain Verification (12 Workflows)
            </h3>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
              <li>extract only email addresses by profession and location</li>
              <li>decode cloudflare data-cfemail hex strings in browser</li>
              <li>deobfuscate bracketed [at] and [dot] email addresses online</li>
              <li>filter corporate domain emails vs free gmail yahoo webmail</li>
              <li>verify email domain mx records via cloudflare doh online</li>
              <li>extract localbusiness schema.org json-ld emails from html</li>
              <li>generate rfc 5322 named business email list for outreach</li>
              <li>group extracted business email addresses by company domain</li>
              <li>prose-safe email extractor without false positive asset tlds</li>
              <li>decode html entity &amp;#64; and %40 obfuscated mailto links</li>
              <li>identify role-based business emails info sales appointments</li>
              <li>client-side zero-upload bulk email extractor from csv html</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              3. Regional E.164 Telecom, WhatsApp &amp; vCard Exports (12 Workflows)
            </h3>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
              <li>pakistan +92 mobile and ptcl landline e164 normalizer (061 042 021)</li>
              <li>extract pakistan 111 uan and 0800 toll-free business numbers</li>
              <li>strip international trunk (0) and phone extensions to e164</li>
              <li>uae +971 and saudi +966 mobile whatsapp click-to-chat generator</li>
              <li>convert business directory phone list to mobile vcard .vcf</li>
              <li>import bulk local business contacts to iphone and android</li>
              <li>filter mobile whatsapp numbers vs office landlines online</li>
              <li>multi-index deduplication across osm and pasted lead lists</li>
              <li>export 3-sheet openxml excel .xlsx business contact workbook</li>
              <li>cwe-1236 formula-safe csv and xlsx lead list exporter</li>
              <li>round-trip vcard 3.0 .vcf contact parser and combiner</li>
              <li>69-country worldwide phone number extractor in browser ram</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 8: FREQUENTLY ASKED QUESTIONS (16 INTERACTIVE ACCORDIONS)
         ============================================================================ */}
      <section
        aria-labelledby="business-contact-faq-heading"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2.5 mb-6">
          <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2
            id="business-contact-faq-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Frequently Asked Questions (16 Technical, Accuracy &amp; Privacy FAQs)
          </h2>
        </div>

        <div className="space-y-3">
          {LOCAL_BUSINESS_CONTACT_FAQS.map((faq, index) => (
            <details
              key={index}
              className="group rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
            >
              <summary className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base cursor-pointer select-none list-none flex items-center justify-between gap-3">
                <span>{faq.question}</span>
                <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform shrink-0">
                  &#9662;
                </span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 break-words">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ============================================================================
          SECTION 9: RELATED KIVAROTOOLS UTILITIES & INTERNAL LINKING MESH
         ============================================================================ */}
      <section
        aria-labelledby="business-contact-related-tools"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2
            id="business-contact-related-tools"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Explore Related Data, Privacy &amp; Developer Utilities on KivaroTools
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Combine local business discovery and contact extraction with our other 100% client-side browser tools:
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/developer/sqlite-viewer"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              SQLite &amp; DuckDB Wasm Database Viewer →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Query exported lead CSVs and SQLite databases with full SQL, ER diagrams, and B-Tree page inspection in browser RAM.
            </p>
          </Link>

          <Link
            href="/developer/parquet-viewer"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              Parquet, Avro, Feather &amp; ORC Viewer →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Inspect large columnar datasets, run SQL aggregates, and convert between Parquet, CSV, and JSON locally.
            </p>
          </Link>

          <Link
            href="/developer/json-formatter"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              JSON Formatter, Validator &amp; GeoJSON Inspector →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Validate and format Overpass API JSON responses, GeoJSON feature collections, and nested API payloads up to 25 MB.
            </p>
          </Link>

          <Link
            href="/document/pdf-scrubber"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              PDF Bank Statement &amp; Invoice Data Scrubber →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Sanitize confidential client invoices, bank statements, and PDF metadata locally before sharing externally.
            </p>
          </Link>

          <Link
            href="/finance/contractor-vs-employee-calculator"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              Universal Contractor vs. Employee Calculator →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Compare B2B contractor day rates vs. salaried employment across US, UK IR35, Canada, Australia, Germany, and UAE.
            </p>
          </Link>

          <Link
            href="/seo/llms-txt-generator"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              llms.txt &amp; AI Crawler (robots.txt) Studio →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Configure AI search visibility and robots.txt rules for your business website across 45 AI crawlers.
            </p>
          </Link>
        </div>
      </section>
    </article>
  );
}