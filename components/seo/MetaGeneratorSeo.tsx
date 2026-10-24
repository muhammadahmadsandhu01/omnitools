import Link from 'next/link';
import {
  FileCheck2,
  Globe,
  HelpCircle,
  Layers,
  Share2,
  ShieldCheck,
  Sparkles,
  Code2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Terminal,
} from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

export const META_GENERATOR_FAQS: FaqItem[] = [
  {
    question: 'What is an HTML Meta Tag Generator and why is it necessary?',
    answer:
      'An HTML Meta Tag Generator is a developer utility that converts human-readable page metadata—such as page titles, descriptions, canonical URLs, crawler directives, and social share properties—into standard, syntactically valid HTML tags placed within the <head> element. It ensures that attribute values are properly escaped, character and pixel constraints are respected, and social network protocols (like Open Graph and Twitter Cards) are correctly formatted without manual syntax errors.',
  },
  {
    question: 'What is the difference between a <title> tag and a meta description?',
    answer:
      'The <title> tag defines the primary document title displayed on browser tabs, search engine results page (SERP) clickable headlines, and external bookmarks. The meta description (<meta name="description">) provides a concise summary displayed as the descriptive snippet below the headline in search results. While page titles have a direct influence on search rankings and click-through rates, meta descriptions are not a direct ranking signal but strongly influence organic search CTR.',
  },
  {
    question: 'Why does Google sometimes rewrite or replace my meta description?',
    answer:
      'Google rewrites or replaces meta descriptions in SERPs when its algorithms determine that another excerpt from the on-page text is more relevant to the searcher\'s specific query. To maximize the chance that Google uses your declared meta description, ensure it accurately summarizes the page content, contains relevant keywords naturally, remains within the 120–160 character window, and avoids generic or duplicate boilerplate copy across pages.',
  },
  {
    question: 'What is the Open Graph protocol and where is it used?',
    answer:
      'The Open Graph (OG) protocol was created by Facebook and is now universally supported by social platforms and messaging applications including Facebook, LinkedIn, Pinterest, Slack, Discord, WhatsApp, and Telegram. When a URL is shared, crawlers inspect properties like og:title, og:description, og:image, og:url, og:type, and og:site_name to render rich, visual media cards instead of plain text links.',
  },
  {
    question: 'How do Twitter / X Cards differ from Open Graph tags?',
    answer:
      'Twitter / X uses proprietary card markup prefixed with twitter: (e.g., twitter:card, twitter:title, twitter:description, twitter:image, twitter:site, twitter:creator). However, when Twitter-specific tags are absent, Twitter automatically falls back to corresponding Open Graph tags (og:title, og:description, and og:image). KivaroTools allows automatic inheritance so you never generate redundant or conflicting social preview data.',
  },
  {
    question: 'What is the recommended size and aspect ratio for social preview images (og:image)?',
    answer:
      'The industry standard dimension for social preview images is 1200 × 630 pixels, which represents an aspect ratio of 1.91:1. This resolution ensures sharp rendering on high-DPI retina screens across Facebook, LinkedIn, Twitter Large Image cards, and messaging apps without unwanted cropping. Images should be hosted at absolute HTTPS URLs and kept under 5 MB (ideally under 1 MB for optimal crawler fetch speed) in JPG, PNG, or WebP format.',
  },
  {
    question: 'What is a canonical URL tag and why does it matter?',
    answer:
      'A canonical tag (<link rel="canonical" href="...">) indicates the authoritative master version of a webpage to search engines. It prevents duplicate content penalties when the same content is accessible via multiple URLs—such as with or without trailing slashes, HTTP versus HTTPS, with tracking parameters (?utm_source=...), or across staging and production mirrors.',
  },
  {
    question: 'Is a canonical tag a guarantee that Google will index that specific URL?',
    answer:
      'No. A canonical tag is treated by search engines as a strong hint, not an absolute directive. If a page declares a canonical URL pointing to an unrelated page, a 404 error page, or a page with significantly different content, Google may ignore the canonical tag and select what it perceives as the most appropriate URL. Furthermore, canonical tags do not substitute for proper server-side 301 redirects.',
  },
  {
    question: 'What do the robots meta tag directives index, noindex, follow, and nofollow mean?',
    answer:
      'The robots meta tag instructs search engine crawlers how to handle a specific page. The "index" directive permits indexing in search results, while "noindex" excludes it. The "follow" directive permits crawlers to follow links on the page to discover new content, while "nofollow" instructs crawlers not to follow those links. KivaroTools defaults to "index, follow" for public pages and prominently warns users if "noindex" or "nofollow" is selected.',
  },
  {
    question: 'Is the robots meta tag a security or access control mechanism?',
    answer:
      'No. The robots meta tag is purely an advisory crawl directive. It does not protect sensitive data, restrict user access, or prevent direct file downloads. If a page contains private information, you must protect it with server-side authentication, authorization headers, or IP restrictions. Furthermore, crawlers must be able to fetch the page to read and honor the robots meta tag.',
  },
  {
    question: 'Does Google still use the meta keywords tag for search ranking?',
    answer:
      'No. Google officially announced in September 2009 that it does not use the meta keywords tag in web search ranking. Bing and other major search engines also ignore it or treat keyword stuffing in the tag as a spam signal. KivaroTools includes the keywords field strictly for legacy cataloging or internal search engines, clearly labelled as optional.',
  },
  {
    question: 'Can social media share titles and descriptions be different from SEO titles?',
    answer:
      'Yes. In fact, optimizing titles separately is an established best practice. SEO titles should be concise (50–60 characters), front-loaded with primary keywords, and focused on clear intent to satisfy searchers. Social titles (og:title and twitter:title) can be more conversational, emotive, or curiosity-driven (up to 70–80 characters) to maximize engagement and clicks in fast-scrolling social feeds.',
  },
  {
    question: 'How do I avoid duplicate meta tags when using a CMS or framework like Next.js or WordPress?',
    answer:
      'Modern web frameworks (like Next.js Metadata API) and CMS plugins (like Yoast or Rank Math) dynamically generate <head> tags from their own configuration. If you manually paste raw HTML meta tags into your template while a plugin or layout is already emitting them, search engines may see conflicting duplicate tags. When using KivaroTools, ensure you disable duplicate plugin outputs or copy only the specific tags that your framework does not automatically generate.',
  },
  {
    question: 'How does KivaroTools protect user privacy when generating meta tags?',
    answer:
      'KivaroTools executes all metadata formatting, character counting, pixel width estimations, live preview card simulations, and HTML generation 100% locally within your browser\'s JavaScript engine. Your draft titles, descriptions, and proprietary URLs are never uploaded to our servers, logged to analytics platforms, or shared with third parties.',
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
    <article className="mt-16 space-y-12">
      {/* Structured Data Script (FAQPage) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 1. Executive Overview */}
      <section aria-labelledby="meta-generator-understanding-html-meta-tags-s" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="meta-generator-understanding-html-meta-tags-s" className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Understanding HTML Meta Tags & Search Crawler Architecture
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Every modern webpage communicates its identity, indexing permissions, and visual preview cards through machine-readable metadata placed inside the HTML <code>&lt;head&gt;</code> element. Search engine bots (such as Googlebot and Bingbot) and social media crawlers (such as Facebook External Hit and Twitterbot) parse these directives before indexing content or rendering link previews.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            W3C & RFC Compliant
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
              Search Snippet Optimization
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Fine-tune clickable SERP headlines and descriptive snippets with character counters and approximate pixel-width guides for desktop and mobile displays.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
              <Share2 className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
              Social Card Formatting
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Generate pixel-perfect Open Graph and Twitter Card tags with automatic field inheritance, custom social overrides, and real-time live preview simulations.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
              Technical Crawl Directives
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Configure strict canonical URLs to prevent duplicate content penalties and configure robots meta crawl directives with built-in indexing safety alerts.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Step-by-Step Instructions */}
      <section aria-labelledby="meta-generator-step-by-step-guide-how-to-gene" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 id="meta-generator-step-by-step-guide-how-to-gene" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Step-by-Step Guide: How to Generate, Customize, and Deploy Tags on KivaroTools
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Follow this structured four-step workflow to generate clean, production-ready HTML metadata for your website:
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
              1
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Enter Primary Metadata
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Input your page title (aiming for 50–60 characters) and a descriptive meta description (120–160 characters). Provide your authoritative absolute HTTPS canonical URL.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
              2
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Configure Social Media
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Add your 1200×630 social preview image URL, descriptive alt text, and site name. Keep social sync enabled or disable it to write tailored social headlines.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white">
              3
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Inspect Live Previews
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Switch through the preview tabs (Google Desktop/Mobile, Facebook, Twitter/X, and LinkedIn) to visually verify card formatting and check for text truncation.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
              4
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Copy or Download Code
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Click &quot;Copy All&quot; to copy the entire <code>&lt;head&gt;</code> block to your clipboard, or download it as an HTML file. Paste directly into your template.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Supported Tags Specification Reference */}
      <section aria-labelledby="meta-generator-supported-output-tags-complete" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 id="meta-generator-supported-output-tags-complete" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Supported Output Tags & Complete Specification Reference
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          The table below documents every tag generated by KivaroTools, its W3C or vendor attribute format, recommended standards, and targeted crawler platforms:
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Element / Tag</th>
                <th className="px-4 py-3 font-semibold">Attribute Standard</th>
                <th className="px-4 py-3 font-semibold">Recommended Value / Format</th>
                <th className="px-4 py-3 font-semibold">Primary Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">&lt;title&gt;</td>
                <td className="px-4 py-3">Tag inner text</td>
                <td className="px-4 py-3">50–60 characters (~600px desktop width)</td>
                <td className="px-4 py-3">Google, Bing, browser tabs, bookmarks</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">description</td>
                <td className="px-4 py-3 font-mono">name=&quot;description&quot;</td>
                <td className="px-4 py-3">120–160 characters (~960px desktop width)</td>
                <td className="px-4 py-3">Search engine SERP descriptive snippets</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">canonical</td>
                <td className="px-4 py-3 font-mono">rel=&quot;canonical&quot;</td>
                <td className="px-4 py-3">Absolute HTTPS URL (e.g., https://example.com/page)</td>
                <td className="px-4 py-3">Duplicate content indexing consolidation</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">robots</td>
                <td className="px-4 py-3 font-mono">name=&quot;robots&quot;</td>
                <td className="px-4 py-3">index, follow, max-image-preview:large</td>
                <td className="px-4 py-3">Search crawler indexation & link-following</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">og:title</td>
                <td className="px-4 py-3 font-mono">property=&quot;og:title&quot;</td>
                <td className="px-4 py-3">Up to 70–80 characters (emotive, engaging headline)</td>
                <td className="px-4 py-3">Facebook, LinkedIn, Slack, Discord</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">og:description</td>
                <td className="px-4 py-3 font-mono">property=&quot;og:description&quot;</td>
                <td className="px-4 py-3">Up to 200 characters summarizing content</td>
                <td className="px-4 py-3">Social media feed link preview snippets</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">og:image</td>
                <td className="px-4 py-3 font-mono">property=&quot;og:image&quot;</td>
                <td className="px-4 py-3">1200 × 630 px (1.91:1 ratio, absolute HTTPS URL)</td>
                <td className="px-4 py-3">Visual social share link banners</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">og:image:alt</td>
                <td className="px-4 py-3 font-mono">property=&quot;og:image:alt&quot;</td>
                <td className="px-4 py-3">Descriptive text explaining image contents</td>
                <td className="px-4 py-3">Screen readers, accessibility crawlers</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">og:type</td>
                <td className="px-4 py-3 font-mono">property=&quot;og:type&quot;</td>
                <td className="px-4 py-3">website, article, product, profile</td>
                <td className="px-4 py-3">Open Graph entity classification</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">og:url</td>
                <td className="px-4 py-3 font-mono">property=&quot;og:url&quot;</td>
                <td className="px-4 py-3">Authoritative canonical URL of shared page</td>
                <td className="px-4 py-3">Social network share engagement attribution</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">og:site_name</td>
                <td className="px-4 py-3 font-mono">property=&quot;og:site_name&quot;</td>
                <td className="px-4 py-3">Overall brand or platform name</td>
                <td className="px-4 py-3">Social card brand attribution banner</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">twitter:card</td>
                <td className="px-4 py-3 font-mono">name=&quot;twitter:card&quot;</td>
                <td className="px-4 py-3">summary_large_image or summary</td>
                <td className="px-4 py-3">X (Twitter) Feed Preview card layout</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">twitter:site</td>
                <td className="px-4 py-3 font-mono">name=&quot;twitter:site&quot;</td>
                <td className="px-4 py-3">Publisher Twitter handle with @ prefix (e.g. @brand)</td>
                <td className="px-4 py-3">Publisher attribution on X link cards</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">twitter:creator</td>
                <td className="px-4 py-3 font-mono">name=&quot;twitter:creator&quot;</td>
                <td className="px-4 py-3">Content author handle with @ prefix (e.g. @author)</td>
                <td className="px-4 py-3">Author attribution on X link cards</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">theme-color</td>
                <td className="px-4 py-3 font-mono">name=&quot;theme-color&quot;</td>
                <td className="px-4 py-3">Hex color string (e.g., #3b82f6)</td>
                <td className="px-4 py-3">Mobile browser address bar accent tint</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">viewport</td>
                <td className="px-4 py-3 font-mono">name=&quot;viewport&quot;</td>
                <td className="px-4 py-3">width=device-width, initial-scale=1.0</td>
                <td className="px-4 py-3">Responsive mobile screen scaling directive</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Title vs. Description vs. Social Differentiation */}
      <section aria-labelledby="meta-generator-title-vs-description-vs-social" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 id="meta-generator-title-vs-description-vs-social" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Title vs. Description vs. Social Metadata: Decoupling and Customization
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          A common mistake in digital publishing is reusing the exact same copy across search engine snippets and social media cards. While searchers and social feed scrollers both consume summaries, their intent and browsing contexts differ fundamentally:
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 dark:border-blue-900/40 dark:bg-blue-950/20 space-y-2">
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              SEO Title & Description (Search Intent)
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Searchers are actively seeking a specific answer, tool, or product. Titles must be concise, front-load the target keyword, and clearly declare what the page provides. Meta descriptions should confirm relevance and provide a reassuring reason to click before other search results.
            </p>
            <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              &lt;title&gt;JSON Formatter &amp; Validator — Beautify &amp; Minify | KivaroTools&lt;/title&gt;
            </div>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-5 dark:border-purple-900/40 dark:bg-purple-950/20 space-y-2">
            <h3 className="text-sm font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Open Graph & Twitter Cards (Discovery Feed)
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Social users are browsing passively in a fast-scrolling feed. Social headlines (<code>og:title</code>) can be longer, more emotive, or question-based to generate curiosity. The <code>og:image</code> does 80% of the visual work to halt the user&apos;s scroll.
            </p>
            <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              &lt;meta property=&quot;og:title&quot; content=&quot;Stop Debugging Minified JSON by Hand: The Free In-Browser Formatter&quot; /&gt;
            </div>
          </div>
        </div>
      </section>

      {/* 5. Social Image Engineering Standard */}
      <section aria-labelledby="meta-generator-the-social-preview-image-engin" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 id="meta-generator-the-social-preview-image-engin" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          The Social Preview Image Engineering Standard (1200 × 630 px)
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Social preview images (<code>og:image</code> and <code>twitter:image</code>) are the single highest-impact metadata element for social click-through rates. To ensure crisp display across all platforms without distortion or cropping, adhere to these technical specifications:
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Dimensions & Aspect Ratio</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Use exactly <strong>1200 × 630 pixels</strong> (1.91:1 ratio). This prevents Facebook, LinkedIn, and Twitter from applying awkward auto-crops or blurring the preview banner.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Absolute HTTPS URLs</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Social platform crawlers do not resolve relative paths (e.g., <code>/banner.jpg</code>). Always provide an absolute HTTPS URL (e.g., <code>https://example.com/banner.jpg</code>).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">File Size & Format</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Keep file sizes under <strong>1 MB</strong> (hard ceiling 5 MB). Platforms like Twitter may fail to fetch images over 5 MB. Standard JPG, PNG, and WebP formats are supported.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Before-and-After Code Comparison */}
      <section aria-labelledby="meta-generator-real-before-and-after-code-exa" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 id="meta-generator-real-before-and-after-code-exa" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Real Before-and-After Code Example
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Compare a bare, incomplete HTML head snippet with a complete, production-ready metadata implementation generated by KivaroTools:
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Before */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Before: Incomplete & Risky Head Tags</span>
            </div>
            <pre className="p-4 rounded-2xl bg-red-50/40 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs font-mono text-red-900 dark:text-red-200 overflow-x-auto leading-relaxed">
{`<!-- Missing canonical, no social tags, unescaped quotes -->
<head>
  <title>KivaroTools - Online Tools for Devs</title>
  <meta name="description" content="Free online tools & utilities.">
  <!-- Missing charset, viewport, canonical -->
  <!-- Missing Open Graph tags -->
  <!-- Missing Twitter Cards -->
</head>`}
            </pre>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Risk: Shared links show blank thumbnails; mobile rendering scales unpredictably; duplicate content penalties possible without canonical URL.
            </p>
          </div>

          {/* After */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>After: Production-Ready KivaroTools Head Block</span>
            </div>
            <pre className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs font-mono text-emerald-900 dark:text-emerald-200 overflow-x-auto leading-relaxed">
{`<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KivaroTools — Fast Online Developer Utilities &amp; PDF Tools</title>
  <meta name="description" content="Free in-browser developer utilities..." />
  <link rel="canonical" href="https://kivarotools.app/tools" />
  <meta name="robots" content="index, follow, max-image-preview:large" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://kivarotools.app/tools" />
  <meta property="og:title" content="KivaroTools — Fast Online Developer Utilities" />
  <meta property="og:image" content="https://kivarotools.app/og-banner.jpg" />
  <meta property="og:image:alt" content="KivaroTools Developer Dashboard" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@kivarotools" />
</head>`}
            </pre>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Benefit: Crisp rich cards across Facebook, Twitter, and LinkedIn; absolute canonical prevents duplicate penalty; mobile viewport scales reliably.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Installation Guide & Duplicate Tag Warning */}
      <section aria-labelledby="meta-generator-where-to-install-generated-tag" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 id="meta-generator-where-to-install-generated-tag" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Where to Install Generated Tags (Static HTML, Next.js, WordPress)
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Depending on your web development stack, metadata is installed in different locations. Follow the appropriate workflow below:
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Static HTML / Jamstack</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Open your <code>index.html</code> file and paste the generated snippet directly between the opening <code>&lt;head&gt;</code> and closing <code>&lt;/head&gt;</code> tags, before stylesheets and script tags.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
              <Terminal className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Next.js App Router</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              In Next.js 13+, prefer exporting a typed <code>metadata</code> object from <code>layout.tsx</code> or <code>page.tsx</code>. Use KivaroTools to model values, then transfer them into the Next.js Metadata API.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
              <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>WordPress / Webflow / Shopify</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Paste the tags into your theme&apos;s custom head injection field or use an SEO plugin snippet manager. Ensure theme head hooks are properly executing.
            </p>
          </div>
        </div>

        {/* Duplicate Tag Warning */}
        <div className="mt-6 p-4 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-300 space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Important: Avoid Duplicate Head Metadata</span>
          </div>
          <p className="leading-relaxed">
            If your CMS or framework already includes an SEO plugin (like Yoast, Rank Math, or AIOSEO) or automated metadata generator, manually pasting static tags into your template may produce conflicting duplicate <code>&lt;title&gt;</code> or <code>&lt;link rel=&quot;canonical&quot;&gt;</code> tags. Search engines may flag duplicate tags as malformed. Always verify that only one authoritative tag exists per element.
          </p>
        </div>
      </section>

      {/* 8. Security & SSRF Architecture */}
      <section aria-labelledby="meta-generator-security-privacy-by-design" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2 id="meta-generator-security-privacy-by-design" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Security & Privacy by Design
          </h2>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          KivaroTools adheres to strict privacy and enterprise security standards when generating code and analyzing web metadata:
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              100% In-Browser Client-Side Processing
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              All form state management, character calculations, live card rendering, and HTML formatting run exclusively within local browser memory. No form inputs are transmitted to remote servers.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Safe HTML Parsing (Zero Script Execution)
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              When using the Pasted HTML Auditor, user-provided markup is parsed strictly via browser DOMParser. Script tags, inline event handlers, and remote iframes are inert and never executed in browser memory.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Deterministic Attribute Escaping
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              All generated HTML attributes undergo strict escaping for double quotes, ampersands, angle brackets, and multi-line strings, preventing broken tag syntax or attribute injection exploits.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              SSRF & Rebinding Defense (URL Inspection)
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Remote URL inspection queries our hardened serverless route which resolves DNS names before network connection and forbids loopback (127.0.0.1, ::1), RFC 1918 private subnets, and cloud metadata IPs.
            </p>
          </div>
        </div>
      </section>

      {/* 9. Frequently Asked Questions (14 Items matching FAQPage JSON-LD) */}
      <section aria-labelledby="meta-generator-frequently-asked-questions" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h2 id="meta-generator-frequently-asked-questions" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {META_GENERATOR_FAQS.map((faq, index) => (
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
          ))}        </div>
      </section>

      {/* 10. Related Tools Recommendation */}
      <section aria-labelledby="meta-generator-related-tools-for-web-develope" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 id="meta-generator-related-tools-for-web-develope" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Related Tools for Web Developers & SEO Professionals
          </h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Link
            href="/seo/text-case-converter"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-purple-300 dark:border-slate-800 dark:hover:border-purple-800"
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
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-300 dark:border-slate-800 dark:hover:border-blue-800"
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
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-emerald-300 dark:border-slate-800 dark:hover:border-emerald-800"
          >
            <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
              Custom QR Code Generator →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Generate scannable QR codes for marketing URLs and landing pages.
            </p>
          </Link>

          <Link
            href="/developer/json-formatter"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-amber-300 dark:border-slate-800 dark:hover:border-amber-800"
          >
            <div className="text-xs font-semibold text-slate-900 group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400">
              JSON Formatter & Validator →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Format and validate JSON-LD structured data and API payload responses.
            </p>
          </Link>
        </div>
      </section>
    </article>
  );
}
