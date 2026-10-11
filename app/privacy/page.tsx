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
import { CONTACT_EMAIL, OPERATOR_LOCATION } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'OmniTools Privacy Policy. Detailed disclosures regarding client-side processing, server logs, planned analytics and advertising, and worldwide user rights.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy — OmniTools',
    description:
      'OmniTools Privacy Policy. Detailed disclosures regarding client-side processing, server logs, planned analytics and advertising, and worldwide user rights.',
    url: '/privacy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy — OmniTools',
    description:
      'OmniTools Privacy Policy. Detailed disclosures regarding client-side processing, server logs, planned analytics and advertising, and worldwide user rights.',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
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
            This Privacy Policy describes how OmniTools (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;),
            an independent digital utility website operated by an individual based in {OPERATOR_LOCATION} and serving
            a worldwide audience, handles information when you visit and use our web applications.
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
              OmniTools is architected from the ground up to minimize data collection. Unlike traditional web services
              that require uploading your confidential files, passwords, or personal financial figures to remote cloud
              servers for processing, the majority of OmniTools utilities execute <strong>locally within your web browser</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Document &amp; Image Converters:</strong> When converting images (WebP, JPG, PNG) or assembling
                PDFs, all rasterization, compression, and file serialization occur within your browser&apos;s memory via HTML5 Canvas
                and WebAssembly. Your images and documents are not transmitted over the internet to our servers.
              </li>
              <li>
                <strong>Financial &amp; Tax Calculators:</strong> Salary deductions, compound interest projections, mortgage amortization,
                and loan schedules are computed using deterministic client-side JavaScript. Your income figures, loan balances,
                and financial inputs never leave your device.
              </li>
              <li>
                <strong>Developer Utilities:</strong> Text formatting, JSON conversion, Base64 encoding, SQL formatting, and
                regular expression testing run entirely in client-side runtime memory.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <Eye className="h-6 w-6 text-blue-600" />
              2. Information Automatically Collected (Current Active State)
            </h2>
            <p>
              In our current operating state, OmniTools does not require registration, does not create user profiles,
              and does not collect names, credit cards, or physical addresses.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                Server Hosting Logs (Vercel Edge Network)
              </h3>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                When you visit our site, our hosting infrastructure provider (Vercel Inc.) automatically logs standard
                HTTP requests for operational security, denial-of-service (DDoS) prevention, and infrastructure debugging.
                These transient server logs typically record your internet protocol (IP) address, browser user-agent string,
                operating system, referring URL, requested page path, and timestamp of access. We do not use these logs to
                identify individual visitors.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                Local Storage &amp; Browser Cookies
              </h3>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                In our current state, we do not set tracking or profiling cookies. Certain tools offer optional convenience
                features (for instance, the Invoice Generator can remember your business name for subsequent visits) that store
                data solely in your device&apos;s local storage (<code>localStorage</code>). This data remains exclusively on your device
                and can be erased at any time through your browser settings.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <BarChart2 className="h-6 w-6 text-blue-600" />
              3. Planned Third-Party Integrations (Future / Upon Activation)
            </h2>
            <p>
              To support the ongoing operation, maintenance, and development of our free tools, we plan to integrate
              industry-standard analytics and advertising platforms following our public launch. We provide full upfront
              disclosure of these planned integrations below:
            </p>

            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 dark:border-blue-900/30 dark:bg-blue-950/20">
                <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Planned: Google Analytics
                </h3>
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  When enabled, Google Analytics (a web analytics service provided by Google LLC) uses first-party cookies
                  to collect aggregated, non-identifying telemetry about how visitors interact with our site (such as pages visited,
                  session length, general geographic region, and device category). This helps us understand which tools are useful
                  and optimize site performance. You can prevent Google Analytics tracking at any time by installing the{' '}
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    Google Analytics Opt-out Browser Add-on
                  </a>.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 dark:border-blue-900/30 dark:bg-blue-950/20">
                <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Planned: Google AdSense &amp; Third-Party Advertising
                </h3>
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  When enabled, third-party vendors, including Google, will use cookies to serve advertisements based on your
                  prior visits to OmniTools or other websites on the internet.
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                  <li>
                    Google&apos;s use of advertising cookies (such as the DART cookie) enables it and its partners to serve ads
                    based on user visits to this site and/or other sites across the internet.
                  </li>
                  <li>
                    You may opt out of personalized advertising by visiting{' '}
                    <a
                      href="https://www.google.com/settings/ads"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      Google Ads Settings
                    </a>.
                  </li>
                  <li>
                    Alternatively, you can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting{' '}
                    <a
                      href="https://www.aboutads.info/choices/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      www.aboutads.info
                    </a>.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <UserCheck className="h-6 w-6 text-blue-600" />
              4. International Privacy Rights &amp; User Choices
            </h2>
            <p>
              Because OmniTools serves visitors from countries across the globe, we recognize and respect your privacy rights
              under applicable international data protection frameworks:
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                  European Economic Area &amp; UK (GDPR)
                </h3>
                <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                  If you are located in the EEA or UK, you have the right to request access to, rectification of, or erasure
                  of any personal data held about you, the right to restrict or object to processing, and the right to lodge
                  a complaint with your local data protection supervisory authority.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                  California Residents (CCPA / CPRA)
                </h3>
                <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                  We do not sell personal information or share personal data for cross-context behavioral advertising in our
                  current operating state. California residents retain rights to know, delete, and non-discrimination regarding
                  their data.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <Lock className="h-6 w-6 text-blue-600" />
              5. Children&apos;s Privacy
            </h2>
            <p>
              OmniTools provides general-purpose web utilities and does not knowingly collect personally identifiable information
              from children under the age of 13 (or under 16 where applicable under local regulations). If you believe a child has
              provided personal information through our website, please notify us so we can take immediate corrective measures.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <FileText className="h-6 w-6 text-blue-600" />
              6. Policy Modifications
            </h2>
            <p>
              We may revise this Privacy Policy periodically to reflect technological adjustments, regulatory updates, or the
              activation of planned features (such as advertising or analytics). Any updates will be posted to this page with a revised
              effective date. We encourage visitors to review this policy periodically.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <Share2 className="h-6 w-6 text-blue-600" />
              7. Contact &amp; Privacy Inquiries
            </h2>
            <p>
              If you have questions, feedback, or concerns regarding this Privacy Policy or our data handling practices,
              please reach out through our{' '}
              <Link href="/contact" className="underline font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400">
                Contact Page
              </Link>
              {CONTACT_EMAIL ? (
                <span> or directly by email at <a href={`mailto:${CONTACT_EMAIL}`} className="underline font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400">{CONTACT_EMAIL}</a></span>
              ) : (
                <span>. Our dedicated contact email inbox will be published upon our upcoming public launch</span>
              )}
              .
            </p>
          </section>

        </article>
      </div>
    </main>
  );
}
