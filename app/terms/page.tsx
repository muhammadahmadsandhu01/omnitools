import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ChevronRight,
  Home,
  FileCheck,
  AlertTriangle,
  Scale,
  ShieldAlert,
  HelpCircle,
  Globe,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { CONTACT_EMAIL, OPERATOR_LOCATION } from '@/config/site';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'KivaroTools Terms of Service. Essential terms governing the use of our free browser-based computational utilities, calculators, and converters.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Service — KivaroTools',
    description:
      'KivaroTools Terms of Service. Essential terms governing the use of our free browser-based computational utilities, calculators, and converters.',
    url: '/terms',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service — KivaroTools',
    description:
      'KivaroTools Terms of Service. Essential terms governing the use of our free browser-based computational utilities, calculators, and converters.',
  },
};

export default function TermsOfServicePage() {
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
              Terms of Service
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-12 border-b border-slate-200 pb-10 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
            <Scale className="h-4 w-4" />
            User Agreement &amp; Disclaimers
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            Terms of Service
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
            <span>Last Updated: October 2026</span>
            <span>•</span>
            <span>Effective Date: October 2026</span>
          </div>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
            Welcome to KivaroTools. These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use
            of the KivaroTools website and web applications. By accessing or using our website, you acknowledge
            that you have read, understood, and agreed to be bound by these Terms.
          </p>
        </header>

        {/* Article Body */}
        <article className="prose prose-slate dark:prose-invert max-w-none space-y-10 text-slate-700 dark:text-slate-300">

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <Globe className="h-6 w-6 text-blue-600" />
              1. Nature of the Service &amp; Global Access
            </h2>
            <p>
              KivaroTools is an independent digital utility suite developed and operated by an individual based
              in {OPERATOR_LOCATION}, provided free of charge for a worldwide audience. The platform offers client-side
              calculators, data converters, document utilities, and developer tools designed to run directly in your web browser.
            </p>
            <p>
              We reserve the right to modify, update, suspend, or discontinue any feature, tool, or calculation engine
              at any time without prior notice.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              2. Educational &amp; Informational Disclaimer (Non-Advisory)
            </h2>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
              <p className="text-sm font-semibold text-amber-950 dark:text-amber-200 mb-2">
                IMPORTANT: Not Professional Financial, Tax, or Legal Advice
              </p>
              <p className="text-xs leading-6 text-amber-900 dark:text-amber-300">
                All tools on KivaroTools—including but not limited to our 22 Country Salary Calculators, Mortgage Amortization
                Calculators, Personal &amp; Auto Loan EMI Calculators, Compound Interest Calculators, SIP Projection Engines,
                and Precious Metals Melt Rate Trackers—are provided strictly for <strong>educational estimation, preliminary modeling,
                and informational planning purposes</strong>.
              </p>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                <strong>Tax &amp; Payroll Estimates:</strong> While our statutory salary models codify published official tax
                schedules (such as IRS, HMRC, BMF, FBR, and ATO brackets), actual payroll withholdings and take-home pay depend on
                individual circumstances, employer benefits, localized municipal levies, family credits, and personal tax elections.
              </li>
              <li>
                <strong>Loans &amp; Interest:</strong> Loan schedules and EMI models are mathematical projections and do not constitute
                a binding loan quote, commercial offer, or formal Truth in Lending Act (TILA) disclosure. Actual lender terms, APR,
                closing costs, and insurance vary.
              </li>
              <li>
                <strong>Professional Consultation:</strong> You should consult a qualified accountant, certified tax advisor,
                financial planner, or legal counsel in your respective jurisdiction before making financial commitments, signing contracts,
                or filing statutory tax returns.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <CheckCircle className="h-6 w-6 text-blue-600" />
              3. User Responsibilities &amp; Acceptable Use
            </h2>
            <p>
              Because KivaroTools executes file transformations and calculations client-side in your device&apos;s browser,
              you retain sole responsibility for your use of the platform:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                <strong>Data Accuracy:</strong> You are responsible for verifying the accuracy and appropriateness of any converted
                images, generated PDFs, formatted queries, invoices, or numerical calculations before using them in commercial, legal,
                or production environments.
              </li>
              <li>
                <strong>Lawful Content:</strong> You agree not to use our tools to process, encode, or format material that is illegal,
                infringing on intellectual property rights, defamatory, or harmful.
              </li>
              <li>
                <strong>Platform Integrity:</strong> You agree not to attempt to interfere with our hosting network, launch denial-of-service
                attacks, bypass rate limits, or engage in automated scraping that degrades the service for other global visitors.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <FileCheck className="h-6 w-6 text-blue-600" />
              4. Intellectual Property Rights
            </h2>
            <p className="text-sm">
              The KivaroTools name, branding, visual design, custom layouts, and original software code are the intellectual property
              of the operator and are protected by applicable copyright and intellectual property standards.
            </p>
            <p className="text-sm">
              <strong>Your Content Remains Yours:</strong> We claim no intellectual property or proprietary rights over any text,
              images, PDF files, code snippets, or financial numbers you input, convert, or export through our browser-based tools.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <ShieldAlert className="h-6 w-6 text-blue-600" />
              5. Disclaimer of Warranties
            </h2>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50 text-xs leading-6 uppercase text-slate-600 dark:text-slate-400">
              KivaroTools is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis, without warranties of any kind,
              either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose,
              non-infringement, uninterrupted availability, or complete freedom from mathematical or programming errors. We do not
              warrant that calculation results will meet your specific accounting requirements or that the site will remain error-free.
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <Ban className="h-6 w-6 text-blue-600" />
              6. Limitation of Liability
            </h2>
            <p className="text-sm leading-6">
              To the maximum extent permitted by applicable law, in no event shall the operator of KivaroTools be liable for any indirect,
              incidental, special, consequential, or punitive damages, or any loss of profits, revenue, data, goodwill, or business
              opportunities arising out of or related to your use of, or inability to use, our website or calculation tools, even if
              advised of the possibility of such damages.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <Scale className="h-6 w-6 text-blue-600" />
              7. Governing Law &amp; Dispute Resolution
            </h2>
            <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 text-sm leading-6 text-slate-600 dark:text-slate-400 space-y-3">
              <p>
                KivaroTools is operated by an independent developer located in {OPERATOR_LOCATION}. To the extent permitted by law,
                these Terms are governed by and construed in accordance with the laws of {OPERATOR_LOCATION}, without regard to conflict
                of law principles.
              </p>
              <p>
                <strong>Worldwide Consumer Rights Notice:</strong> Because KivaroTools serves a worldwide audience, nothing in these
                Terms excludes, restricts, limits, or modifies any non-waivable statutory rights, consumer guarantees, or legal remedies
                that you are entitled to under the mandatory consumer protection laws of your country or jurisdiction of habitual
                residence (such as mandatory consumer rights under European Union, United Kingdom, or other local consumer protection legislation).
                The laws of Pakistan do not override these mandatory local consumer protections.
              </p>
              <p>
                Before seeking formal dispute resolution, we encourage you to contact us directly to resolve any concerns informally
                and amicably.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <HelpCircle className="h-6 w-6 text-blue-600" />
              8. Contact Regarding Terms
            </h2>
            <p className="text-sm">
              If you have questions regarding these Terms of Service, please visit our{' '}
              <Link href="/contact" className="underline font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400">
                Contact Page
              </Link>
              {CONTACT_EMAIL ? (
                <span> or reach out via email at <a href={`mailto:${CONTACT_EMAIL}`} className="underline font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400">{CONTACT_EMAIL}</a></span>
              ) : null}
              .
            </p>
          </section>

        </article>
      </div>
    </main>
  );
}
