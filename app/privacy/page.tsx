import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ChevronRight,
  Home,
  ShieldCheck,
  Lock,
  Cpu,
  Eye,
  BarChart2,
  Share2,
  FileText,
  UserCheck,
} from 'lucide-react';
import { SITE_URL, CONTACT_EMAIL, OPERATOR_LOCATION, DEFAULT_OG_IMAGE } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy — Zero Upload Browser Tools',
  description:
    'Read the KivaroTools Privacy Policy covering 100% client-side file processing, zero server storage, cookies, analytics, and global GDPR/CCPA user rights.',
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy — Zero Upload Browser Tools | KivaroTools',
    description:
      'Read the KivaroTools Privacy Policy covering 100% client-side file processing, zero server storage, cookies, analytics, and global GDPR/CCPA user rights.',
    url: `${SITE_URL}/privacy`,
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kivarotools',
    creator: '@kivarotools',
    title: 'Privacy Policy — Zero Upload Browser Tools | KivaroTools',
    description:
      'Read the KivaroTools Privacy Policy covering 100% client-side file processing, zero server storage, cookies, analytics, and global GDPR/CCPA user rights.',
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function PrivacyPolicyPage() {
  const privacySchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}/privacy#webpage`,
    name: 'Privacy Policy — KivaroTools',
    url: `${SITE_URL}/privacy`,
    description:
      'KivaroTools Privacy Policy covering 100% client-side file processing, zero server storage, Google AdSense cookies, web analytics, and global GDPR/CCPA user rights.',
    inLanguage: 'en',
    datePublished: '2026-01-15',
    dateModified: '2026-11-10',
    publisher: {
      '@type': 'Organization',
      name: 'KivaroTools',
      url: SITE_URL,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: `${SITE_URL}/privacy` },
    ],
  };

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(privacySchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <li>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                <span>Home</span>
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li aria-current="page" className="text-slate-800 dark:text-slate-200">
              Privacy Policy
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-12 border-b border-slate-200 pb-10 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
            <ShieldCheck className="h-4 w-4" />
            Transparency &amp; Data Protection
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            Privacy Policy
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
            <span>Last Updated: November 2026</span>
            <span>•</span>
            <span>Effective Date: November 2026</span>
          </div>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
            This Privacy Policy describes how KivaroTools (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;),
            an independent digital utility website operated from {OPERATOR_LOCATION} and serving
            a worldwide audience at <strong>{SITE_URL}</strong>, handles information when you visit and use our 42 client-side web applications and 22 country salary calculators.
          </p>
        </header>

        {/* Article Body */}
        <article className="prose prose-slate dark:prose-invert max-w-none space-y-10 text-slate-700 dark:text-slate-300">

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <Cpu className="h-6 w-6 text-blue-600" />
              1. Core Architecture: 100% Client-Side Processing
            </h2>
            <p>
              KivaroTools is architected from the ground up to minimize data collection. Unlike traditional cloud services
              that require uploading your confidential documents, database files, tokens, or personal financial figures to remote
              servers for processing, KivaroTools utilities execute <strong>100% locally within your web browser</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Document &amp; Image Utilities:</strong> When converting images (HEIC, AVIF, WebP, JPG, PNG), compressing
                photos to target KB sizes, merging/splitting PDFs, digitally signing PDFs (<code>/ByteRange</code> &amp; SHA-256), applying
                watermarks and legal eDiscovery Bates stamps, scrubbing bank statement/invoice PII across 12 PDF surfaces, or converting
                between PDF, Word (<code>.docx</code>), Excel (<code>.xlsx</code>), and PowerPoint (<code>.pptx</code>), all parsing,
                rasterization, and serialization occur in local browser RAM via HTML5 Canvas, OffscreenCanvas, Web Workers, and WebAssembly.
                Your files are never transmitted to our servers.
              </li>
              <li>
                <strong>Financial, Tax &amp; Startup Calculators:</strong> Gross-to-net salary deductions across 22 statutory country tax
                engines, 3-way Contractor vs. Full-Time Employee comparisons (W-2 / 1099 / S-Corp / UK IR35 / Canada T4-CCPC / India 44ADA),
                SaaS burn rate, cash runway &amp; Post-Money SAFE cap table dilution models, mortgage PITI/PMI amortization schedules,
                loan EMI calculations, compound interest &amp; SIP projections, precious metals melt valuations, and PDF invoices are
                computed using deterministic client-side JavaScript. Your income figures, cap tables, and financial inputs never leave your device.
              </li>
              <li>
                <strong>Developer, Database, Security &amp; SEO Utilities:</strong> SQLite &amp; DuckDB database exploration, Apache Parquet,
                Avro &amp; Arrow Feather inspection, HAR file waterfall analysis &amp; secret sanitization, OpenAPI 3.1/Swagger to TypeScript,
                Zod &amp; MSW code generation, JWT (JWS/JWE/SD-JWT), PASETO &amp; SAML 2.0 security debugging, 7-dialect Cron expression
                simulation, 25MB JSON formatting, 19-dialect SQL beautification, Regex testing, SVG optimization, CSPRNG password/hash
                generation, QR code creation, and <code>llms.txt</code> / AI crawler <code>robots.txt</code> generation run entirely in
                client-side runtime memory.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <Eye className="h-6 w-6 text-blue-600" />
              2. Information Automatically Collected &amp; Local Storage
            </h2>
            <p>
              KivaroTools does not require registration, does not create user profiles, and does not collect names, passwords,
              credit cards, or physical addresses to use any tool.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                Infrastructure &amp; Edge Server Logs (Cloudflare &amp; Hosting Network)
              </h3>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                When you visit our site, our edge delivery and hosting infrastructure providers (such as Cloudflare, Inc.)
                automatically process standard HTTP request headers for operational security, content delivery caching, denial-of-service
                (DDoS) mitigation, and infrastructure diagnostics. These transient logs typically record your internet protocol (IP) address,
                browser user-agent string, operating system, referring URL, requested page path, and timestamp of access.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                Browser Local Storage (<code>localStorage</code>) &amp; Session Memory
              </h3>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                Certain tools offer optional convenience features—such as saving your dark/light theme preference, caching public
                foreign exchange reference rates for offline use, or saving an Invoice Generator draft on your device—that store
                data solely in your browser&apos;s local storage (<code>localStorage</code>). This data remains exclusively on your
                device and can be cleared at any time using in-tool reset buttons or your browser settings.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <BarChart2 className="h-6 w-6 text-blue-600" />
              3. Advertising Cookies (Google AdSense) &amp; Web Analytics
            </h2>
            <p>
              To support the ongoing operation, maintenance, and free availability of our tools, KivaroTools utilizes
              privacy-friendly web analytics and third-party advertising networks (including Google AdSense). We provide
              full disclosure of these services below in accordance with Google Publisher Policies and the Google EU User Consent Policy:
            </p>

            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 dark:border-blue-900/30 dark:bg-blue-950/20">
                <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Google AdSense &amp; Third-Party Advertising Cookies
                </h3>
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to
                  KivaroTools or other websites on the internet:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li>
                    Google&apos;s use of advertising cookies (including the DoubleClick / DART cookie) enables Google and its
                    partners to serve advertisements to our users based on their visit to KivaroTools and/or other sites on the Internet.
                  </li>
                  <li>
                    Users may opt out of personalized advertising at any time by visiting{' '}
                    <a
                      href="https://www.google.com/settings/ads"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      Google Ads Settings
                    </a>{' '}
                    or reviewing{' '}
                    <a
                      href="https://policies.google.com/technologies/ads"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      Google Advertising Policies &amp; Cookie Controls
                    </a>
                    .
                  </li>
                  <li>
                    Alternatively, you can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting{' '}
                    <a
                      href="https://optout.aboutads.info/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      optout.aboutads.info (Digital Advertising Alliance)
                    </a>{' '}
                    or{' '}
                    <a
                      href="https://youronlinechoices.eu/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      youronlinechoices.eu (EDAA European Opt-Out)
                    </a>
                    .
                  </li>
                  <li>
                    For more information on how Google uses data when you use partner sites or apps, please visit{' '}
                    <a
                      href="https://policies.google.com/technologies/partner-sites"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      How Google uses information from sites or apps that use our services
                    </a>
                    .
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 dark:border-blue-900/30 dark:bg-blue-950/20">
                <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Traffic &amp; Performance Analytics (Ahrefs Web Analytics &amp; Google Analytics)
                </h3>
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  We use aggregated web analytics (including Ahrefs Web Analytics and Google Analytics 4) to measure
                  overall traffic volume, popular tool pages, general geographic regions, and device categories. Analytics scripts
                  never inspect, record, or transmit the contents of files, databases, cryptographic tokens, passwords, or numbers
                  entered into our tool workspaces. You can prevent Google Analytics tracking at any time by installing the{' '}
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    Google Analytics Opt-out Browser Add-on
                  </a>
                  .
                </p>
              </div>
            </div>

            {/* Summary Table of Cookies & Storage */}
            <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 mt-4 not-prose">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">
                  <tr>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-800">Category</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-800">Provider / Mechanism</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-800">Purpose</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-800">User Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-950">
                  <tr>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">Strictly Necessary</td>
                    <td className="p-3">Browser <code>localStorage</code></td>
                    <td className="p-3">Stores dark/light theme preference and local tool workspace preferences on your device.</td>
                    <td className="p-3">Clear via in-tool Reset button or browser site data settings.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">Analytics</td>
                    <td className="p-3">Google Analytics (<code>_ga</code>) &amp; Ahrefs Analytics</td>
                    <td className="p-3">Aggregated pageview measurement, performance telemetry, and geographic traffic statistics.</td>
                    <td className="p-3">Opt out via browser cookie controls or Google Analytics Opt-out Add-on.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">Advertising</td>
                    <td className="p-3">Google AdSense (<code>IDE</code>, <code>__gads</code>, <code>__gpi</code>)</td>
                    <td className="p-3">Ad delivery, frequency capping, fraud prevention, and personalized/non-personalized ad serving.</td>
                    <td className="p-3">Manage via Google Ads Settings, EEA/UK consent banner, or DAA/EDAA opt-out portals.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <UserCheck className="h-6 w-6 text-blue-600" />
              4. International Privacy Rights (GDPR, UK GDPR, IAB TCF v2.2 &amp; CCPA/CPRA)
            </h2>
            <p>
              Because KivaroTools serves visitors from countries across the globe, we recognize and respect your privacy rights
              under applicable international data protection frameworks:
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                  European Economic Area, UK &amp; Switzerland (GDPR &amp; IAB TCF)
                </h3>
                <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                  If you are located in the EEA, UK, or Switzerland, you have the right to request access to, rectification of,
                  or erasure of any personal data held about you, the right to restrict or object to processing, and the right
                  to withdraw cookie consent (including Google certified CMP / IAB TCF v2.2 advertising consent choices) or lodge
                  a complaint with your local data protection supervisory authority.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                  California &amp; US State Privacy Rights (CCPA / CPRA &amp; GPC)
                </h3>
                <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                  KivaroTools does not sell personal information for monetary consideration. California and US state residents
                  retain rights to know what categories of data are collected, to request deletion, to opt out of cross-context
                  behavioral advertising cookies via Section 3 links or Global Privacy Control (<code>Sec-GPC: 1</code>) browser
                  signals, and to non-discrimination.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <Lock className="h-6 w-6 text-blue-600" />
              5. Children&apos;s Privacy (COPPA)
            </h2>
            <p>
              KivaroTools provides general-purpose professional and educational web utilities and does not knowingly collect
              personally identifiable information from children under the age of 13 (or under 16 where applicable under local
              regulations). If you believe a child has provided personal information through our website, please notify us so
              we can take immediate corrective measures.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <FileText className="h-6 w-6 text-blue-600" />
              6. Policy Modifications
            </h2>
            <p>
              We may revise this Privacy Policy periodically to reflect technological adjustments, regulatory updates, or
              new tool features. Any updates will be posted to this page with a revised effective date.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <Share2 className="h-6 w-6 text-blue-600" />
              7. Contact &amp; Privacy Inquiries
            </h2>
            <p>
              If you have questions, feedback, or requests regarding this Privacy Policy or our data handling practices,
              please reach out through our{' '}
              <Link href="/contact" className="underline font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400">
                Contact Page
              </Link>
              {CONTACT_EMAIL ? (
                <span>
                  {' '}or directly by email at{' '}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="underline font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </span>
              ) : null}
              .
            </p>
          </section>

        </article>
      </div>
    </main>
  );
}