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
  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Privacy Policy — KivaroTools',
            url: `${SITE_URL}/privacy`,
            publisher: { '@type': 'Organization', name: 'KivaroTools', url: SITE_URL },
          }),
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
            <span>Last Updated: October 2026</span>
            <span>•</span>
            <span>Effective Date: October 2026</span>
          </div>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
            This Privacy Policy describes how KivaroTools (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;),
            an independent digital utility website operated from {OPERATOR_LOCATION} and serving
            a worldwide audience at <strong>{SITE_URL}</strong>, handles information when you visit and use our web applications.
          </p>
        </header>

        {/* Article Body */}
        <article className="prose prose-slate dark:prose-invert max-w-none space-y-10 text-slate-700 dark:text-slate-300">

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <Cpu className="h-6 w-6 text-blue-600" />
              1. Core Architecture: Client-Side Processing
            </h2>
            <p>
              KivaroTools is architected from the ground up to minimize data collection. Unlike traditional web services
              that require uploading your confidential files, passwords, or personal financial figures to remote cloud
              servers for processing, KivaroTools utilities execute <strong>locally within your web browser</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Document &amp; Image Converters:</strong> When converting images (WebP, JPG, PNG, AVIF, HEIC), compressing
                photos, or merging and splitting PDFs, all rasterization, compression, and file serialization occur within your
                browser&apos;s memory via HTML5 Canvas, OffscreenCanvas, and WebAssembly. Your images and documents are not
                transmitted to our servers.
              </li>
              <li>
                <strong>Financial &amp; Tax Calculators:</strong> Salary deductions, compound interest projections, mortgage amortization,
                precious metals melt valuations, invoice generation, and loan schedules are computed using deterministic client-side
                JavaScript. Your income figures, loan balances, and financial inputs never leave your device.
              </li>
              <li>
                <strong>Developer, Cryptographic &amp; SEO Utilities:</strong> Text formatting, JSON conversion, Base64 encoding,
                SQL formatting, SVG optimization, CSPRNG password/hash generation, QR code creation, and regular expression testing
                run in client-side runtime memory.
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
              KivaroTools does not require registration, does not create user profiles, and does not collect names, credit cards,
              or physical addresses to use any tool.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                Infrastructure &amp; Edge Server Logs (Cloudflare &amp; Hosting Network)
              </h3>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                When you visit our site, our edge delivery and hosting infrastructure providers (such as Cloudflare, Inc. and Vercel Inc.)
                automatically process standard HTTP request headers for operational security, content delivery caching, denial-of-service
                (DDoS) mitigation, and infrastructure diagnostics. These transient logs typically record your internet protocol (IP) address,
                browser user-agent string, operating system, referring URL, requested page path, and timestamp of access.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                Browser Local Storage (<code>localStorage</code>)
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
              full disclosure of these services below in accordance with Google Publisher Policies:
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
                    (or{' '}
                    <a
                      href="https://myadcenter.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      Google My Ad Center
                    </a>
                    ).
                  </li>
                  <li>
                    Alternatively, you can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting{' '}
                    <a
                      href="https://www.aboutads.info/choices/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      www.aboutads.info/choices
                    </a>{' '}
                    or{' '}
                    <a
                      href="https://www.youronlinechoices.eu/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      www.youronlinechoices.eu
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
                  We use aggregated web analytics (including Ahrefs Web Analytics and, where enabled, Google Analytics) to measure
                  overall traffic volume, popular tool pages, general geographic regions, and device categories. Analytics scripts
                  never inspect, record, or transmit the contents of files, code, passwords, or numbers entered into our tool workspaces.
                  You can prevent Google Analytics tracking at any time by installing the{' '}
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
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <UserCheck className="h-6 w-6 text-blue-600" />
              4. International Privacy Rights (GDPR, UK GDPR &amp; CCPA/CPRA)
            </h2>
            <p>
              Because KivaroTools serves visitors from countries across the globe, we recognize and respect your privacy rights
              under applicable international data protection frameworks:
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                  European Economic Area, UK &amp; Switzerland (GDPR)
                </h3>
                <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                  If you are located in the EEA, UK, or Switzerland, you have the right to request access to, rectification of,
                  or erasure of any personal data held about you, the right to restrict or object to processing, and the right
                  to withdraw cookie consent or lodge a complaint with your local supervisory authority.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                  California &amp; US State Privacy Rights (CCPA / CPRA)
                </h3>
                <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                  KivaroTools does not sell personal information. California residents retain rights to know what categories of
                  data are collected, to request deletion, to opt out of cross-context behavioral advertising cookies via the
                  opt-out links in Section 3, and to non-discrimination.
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
