import Link from 'next/link';
import {
  FileCheck2,
  Globe,
  HelpCircle,
  Layers,
  Share2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

export const META_GENERATOR_FAQS: FaqItem[] = [
  {
    question: 'What are HTML meta tags and why do search engines care?',
    answer:
      'HTML meta tags are machine-readable snippets placed within the <head> element that summarize document title, description, indexing rules (robots), author, charset, and viewport configuration. While Google no longer uses the meta keywords tag as a direct ranking factor, the <title> tag and meta description directly influence click-through rates (CTR) in Search Engine Results Pages (SERPs), and robots directives control search engine indexation.',
  },
  {
    question: 'What is the Open Graph protocol and where is it used?',
    answer:
      'The Open Graph protocol (OG) was introduced by Facebook to transform web pages into rich graph objects on social networks. Modern social networks, messaging apps, and collaboration tools—including Facebook, LinkedIn, Pinterest, Slack, Discord, and WhatsApp—read og:title, og:description, og:image, og:url, og:type, and og:site_name to render social link cards when a URL is shared.',
  },
  {
    question: 'How do Twitter/X Cards differ from Open Graph tags?',
    answer:
      'Twitter/X uses its own proprietary card tags (such as twitter:card, twitter:title, twitter:image, twitter:site, and twitter:creator) to render summary and large-image cards. However, if Twitter-specific tags are absent, Twitter falls back to standard Open Graph tags (og:title, og:description, and og:image). OmniTools generates both sets and allows automatic inheritance so you never send redundant or conflicting social preview data.',
  },
  {
    question: 'What is the recommended size and aspect ratio for social preview images (og:image)?',
    answer:
      'The industry standard reference dimension for og:image is 1200 × 630 pixels (an aspect ratio of approximately 1.91:1). This resolution ensures crisp display on high-DPI displays across Facebook, LinkedIn, Twitter Large Image cards, and iMessage without awkward auto-cropping. Images should generally remain under 5 MB (or under 1 MB for optimal crawler fetch speed) in JPG, PNG, or WebP format.',
  },
  {
    question: 'Does Google have strict hard limits on title and meta description length?',
    answer:
      'Google does not enforce a rigid character limit; rather, SERP titles and descriptions are truncated based on pixel width (typically ~600px for desktop titles, which translates to roughly 50–60 characters, and ~960px for descriptions, or about 120–160 characters). Mobile viewports offer different display allowances. OmniTools provides character count guidelines, approximate desktop/mobile width metrics, and truncation simulations rather than treating 60 or 160 characters as absolute barriers.',
  },
  {
    question: 'How does the Live Page & HTML Auditor verify my existing tags?',
    answer:
      'The auditor provides two modes: client-side pasted HTML inspection and public URL inspection. Pasted HTML is parsed safely using DOMParser entirely within your browser without script execution or network requests. Public URL inspection queries our hardened serverless route with multi-layered SSRF protection (blocking private networks, link-local IPs, DNS rebinding, and credentials). The auditor generates a transparent 0–100 completeness score with actionable error, warning, and recommendation findings.',
  },
  {
    question: 'Can I import inspected tags directly into the generator editor?',
    answer:
      'Yes. When you inspect an existing page or paste an HTML head snippet, clicking "Import into Generator" automatically populates all form inputs with the extracted metadata, allowing you to edit, rectify warnings, and re-export clean HTML tags.',
  },
  {
    question: 'How should I deploy the generated HTML into my website?',
    answer:
      'Copy the generated code using the "Copy All" or section-specific copy buttons, then paste the tags into the <head>...</head> section of your HTML document, template, CMS header injection (e.g., WordPress, Webflow, Shopify), or Next.js metadata layout export.',
  },
];

export default function MetaGeneratorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: META_GENERATOR_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="mt-16 space-y-12">
      {/* Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Overview & Feature Highlights */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Complete Meta Tags, Open Graph & Social Card Engineering
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Transform search visibility and social click-through rates with deterministic HTML head generation, interactive live previews, and automated SEO auditing.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            <Sparkles className="h-3.5 w-3.5" />
            Zero-Bloat Output
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
              Standard SEO & Search Snippets
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Generate titles, meta descriptions, canonical URLs, robots directives, and author attribution with character and approximate pixel-width guides.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
              <Share2 className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
              Open Graph & Twitter Cards
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Support for Facebook, LinkedIn, Pinterest, Slack, and X card layouts with automatic metadata inheritance, custom overrides, and content-type presets.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
              Auditor & Quality Scorecard
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Audit pasted HTML or live public URLs against 10 critical SEO rules, compute an actionable 0–100 quality score, and import extracted tags in one click.
            </p>
          </div>
        </div>
      </section>

      {/* Technical Specifications Guide */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Social Platform Tag Comparison & Specification Guide
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Understanding how each major search engine and social crawler reads your page&apos;s head metadata ensures predictable presentation across the web.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Element / Tag</th>
                <th className="px-4 py-3 font-semibold">Standard Attribute</th>
                <th className="px-4 py-3 font-semibold">Recommended Format / Size</th>
                <th className="px-4 py-3 font-semibold">Primary Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">&lt;title&gt;</td>
                <td className="px-4 py-3">Tag text content</td>
                <td className="px-4 py-3">50–60 characters (~600px desktop)</td>
                <td className="px-4 py-3">Google, Bing, browser tabs</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">description</td>
                <td className="px-4 py-3 font-mono">name=&quot;description&quot;</td>
                <td className="px-4 py-3">120–160 characters (~960px desktop)</td>
                <td className="px-4 py-3">Search engine SERP snippets</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">canonical</td>
                <td className="px-4 py-3 font-mono">rel=&quot;canonical&quot;</td>
                <td className="px-4 py-3">Absolute HTTPS URL</td>
                <td className="px-4 py-3">Duplicate content prevention</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">robots</td>
                <td className="px-4 py-3 font-mono">name=&quot;robots&quot;</td>
                <td className="px-4 py-3">index/noindex, follow/nofollow, max-image-preview</td>
                <td className="px-4 py-3">Crawler indexing instructions</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">og:image</td>
                <td className="px-4 py-3 font-mono">property=&quot;og:image&quot;</td>
                <td className="px-4 py-3">1200 × 630 px (1.91:1 ratio, &lt; 5MB)</td>
                <td className="px-4 py-3">Facebook, LinkedIn, Slack, Discord</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">twitter:card</td>
                <td className="px-4 py-3 font-mono">name=&quot;twitter:card&quot;</td>
                <td className="px-4 py-3">summary_large_image or summary</td>
                <td className="px-4 py-3">X (Twitter) Feed Preview Cards</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Security & SSRF Architecture */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Security & Privacy by Design
          </h2>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          OmniTools adheres to strict privacy and enterprise security standards when generating code and analyzing web metadata:
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              SSRF & Rebinding Defense
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              URL inspection resolves DNS names before network connection and forbids loopback (127.0.0.1, ::1), RFC 1918 private subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), link-local addresses (169.254.0.0/16, fe80::/10), and cloud metadata endpoints. Every redirect is re-validated.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Safe HTML Parsing (No Script Execution)
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Pasted HTML is parsed strictly as untrusted text using browser-native DOMParser. Script tags, inline event attributes, and external iframes are completely inert and never executed in browser memory.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Deterministic Attribute Escaping
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              All generated HTML attributes undergo strict XML/HTML escaping for double quotes, ampersands, angle brackets, and multi-line strings, preventing broken head tag syntax or attribute injection exploits.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Zero Analytics & Third-Party Leaks
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your generated metadata, draft URLs, and audited titles are never transmitted to external analytics providers, marketing trackers, or third-party servers.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
          {META_GENERATOR_FAQS.map((faq, index) => (
            <div key={index} className="py-4 first:pt-0 last:pb-0">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {faq.question}
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools Recommendation */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Related Tools for Web Developers & SEO Professionals
          </h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/seo/text-case-converter"
            className="group rounded-xl border border-slate-200/80 p-4 transition-colors hover:border-purple-300 dark:border-slate-800 dark:hover:border-purple-800"
          >
            <div className="text-xs font-semibold text-slate-900 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
              Text Case Converter →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Format title case, sentence case, and kebab-case for SEO headings and URL slugs.
            </p>
          </Link>

          <Link
            href="/seo/text-analyzer"
            className="group rounded-xl border border-slate-200/80 p-4 transition-colors hover:border-blue-300 dark:border-slate-800 dark:hover:border-blue-800"
          >
            <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              Word Counter & Text Analyzer →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Check reading levels, keyword density, and word counts for web content.
            </p>
          </Link>

          <Link
            href="/seo/qr-generator"
            className="group rounded-xl border border-slate-200/80 p-4 transition-colors hover:border-emerald-300 dark:border-slate-800 dark:hover:border-emerald-800"
          >
            <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
              Custom QR Code Generator →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Generate scannable QR codes for marketing URLs and landing pages.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
