import Link from 'next/link';
import { SITE_URL } from '@/config/site';

export interface FaqItem {
  question: string;
  answer: string;
}

export const SVG_OPTIMIZER_FAQS: FaqItem[] = [
  {
    question: 'Why is preserving the viewBox attribute critical for responsive web design?',
    answer:
      'The viewBox attribute defines the internal coordinate ratio of an SVG graphic (e.g. viewBox="0 0 24 24"). When width and height are removed or overridden by CSS rules (such as w-6 h-6 or width: 100%), browsers use the viewBox to scale the vector cleanly without distortion or clipping. The OmniTools SVG Optimizer preserves viewBox by default across all optimization modes.',
  },
  {
    question: 'How does coordinate decimal precision impact SVG file size and visual rendering?',
    answer:
      'Vector editing software often exports coordinates with 8 to 16 decimal places (such as 14.285714285714286). Rounding coordinates to 2 or 3 decimals significantly reduces character bytes across complex curves; in standard icon and illustration viewports this typically preserves visual fidelity, though high-precision CAD or scientific plots may require keeping higher precision.',
  },
  {
    question: 'Can SVG files contain malicious scripts or security threats (XSS)?',
    answer:
      'Yes. Because SVG is valid XML, the SVG specification permits embedded <script> tags, foreignObject containers, and inline event handlers (like onload or onclick). Rendering unsanitized user-supplied SVGs inline in HTML can execute arbitrary JavaScript. OmniTools isolates live visual previews inside a sandboxed iframe with zero execution privileges and strips active script attributes.',
  },
  {
    question: 'What is the difference between AST/DOM-based SVG cleaners and regular-expression minifiers?',
    answer:
      'Regex-only cleaners perform naive text find-and-replace, which frequently corrupts nested <style> blocks, damages self-closing tags, and breaks multi-line coordinate arrays. An AST or DOM-based cleaner (like OmniTools and SVGO) parses the SVG into a true Document Object Model tree, safely distinguishing element attributes, CSS selectors, XML namespaces, and geometric path tokens.',
  },
  {
    question: 'Why does the optimizer sometimes report 0% size reduction on already compact SVGs?',
    answer:
      'If an SVG has already been heavily minified, or if precision rounding would alter tiny geometric coordinates, OmniTools rolls back to the compact original input. Rather than forcing lossy transformations or artificially claiming savings, the tool preserves the original markup and clearly reports that no further safe reductions were found.',
  },
  {
    question: 'Does the optimizer remove IDs used by CSS styling or SVG gradients?',
    answer:
      'OmniTools builds an internal reference graph before running cleanup passes. IDs referenced by fill="url(#id)", clip-path="url(#id)", href="#id", aria-labelledby, or internal CSS stylesheets (#id selectors) are retained in standard modes. If your external application JavaScript targets IDs dynamically, you should verify those identifiers before deploying.',
  },
  {
    question: 'How does the defs reachability graph prevent broken graphic references?',
    answer:
      'Vector files frequently accumulate orphaned gradients, filters, and clipping masks inside <defs> when elements are deleted in design apps. OmniTools uses Breadth-First Search (BFS) reachability: only definitions with zero direct or indirect references from visible elements are removed, helping preserve referenced visual effects.',
  },
  {
    question: 'Are my proprietary vector assets uploaded to any remote server?',
    answer:
      'No. All XML parsing, path coordinate formatting, DOM tree manipulation, and preview rendering execute 100% client-side inside your web browser. Proprietary logos, brand illustrations, and product design icons never leave your local device.',
  },
  {
    question: 'How do I prepare SVGs exported from Adobe Illustrator for the web?',
    answer:
      'When exporting from Illustrator, select SVG, uncheck "Preserve Illustrator Editing Capabilities", set Decimal Places to 2 or 3, and choose "Presentation Attributes" for styling. Pasting that export into OmniTools will instantly strip the remaining DOCTYPE, XML declaration, RDF metadata, and empty layer groups.',
  },
  {
    question: 'Can I copy the optimized SVG markup directly into React or Next.js components?',
    answer:
      'Yes. The optimized SVG output is valid, compact XML that can be pasted directly into JSX/TSX files as inline SVG, imported via SVGR, or saved as a standalone .svg asset for use with standard <img> tags.',
  },
];

export default function SvgOptimizerSeo() {
  const canonicalUrl = `${SITE_URL}/developer/svg-optimizer`;

  // SoftwareApplication Schema
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'OmniTools SVG Optimizer & Cleaner',
    operatingSystem: 'Any (Web Browser)',
    applicationCategory: 'DeveloperApplication',
    url: canonicalUrl,
    description:
      'Free client-side SVG optimizer, minifier, and cleaner. Strip redundant editor metadata, format path coordinates, collapse empty groups, and reduce vector file sizes with zero server uploads.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Client-side XML DOM parsing with off-thread Web Worker',
      'viewBox preservation designed for responsive web scaling',
      'Configurable coordinate precision rounding (0 to 4 decimals)',
      'Reachability graph pruning of unused defs, gradients, and filters',
      'Sandboxed preview protecting against XSS scripts and hazards',
      'SVG 1.1 compliant color minification',
      'Three built-in one-click sample presets',
      'One-click clipboard copy and sanitized SVG file download',
    ],
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Developer Tools',
        item: `${SITE_URL}/developer`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'SVG Optimizer & Cleaner',
        item: canonicalUrl,
      },
    ],
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      {/* Structured Data: SoftwareApplication & BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Complete SVG Optimization &amp; Cleanup Guide: Architecture, Web Performance &amp; Vector Precision
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        <strong>Scalable Vector Graphics (SVG)</strong> is the open, XML-based vector graphics standard established by the <strong>World Wide Web Consortium (W3C)</strong>.
        Unlike raster formats (JPEG, PNG, WebP, AVIF) that map colors to fixed pixel grids, SVGs describe vector shapes, Bezier curves, and gradients mathematically.
        Because vector authoring tools (such as Figma, Adobe Illustrator, Inkscape, and Sketch) prioritize non-destructive re-editability over web delivery,
        raw vector exports routinely carry <strong>40% to 75% non-essential bloat</strong>.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        What Causes SVG File Bloat in Modern Web Development?
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        When an illustration or UI icon is exported from a vector graphics application, the software injects proprietary metadata,
        verbose XML declarations, authoring layer groups, and high-precision floating-point numbers designed for physical print accuracy.
        On the web, every extra character increases HTML bundle size, delays First Contentful Paint (FCP), and consumes mobile CPU cycles during XML parsing.
      </p>

      {/* Bloat Breakdown Table */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Bloat Category</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Raw Export Example</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">OmniTools Optimized Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">XML &amp; DOCTYPE Headers</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-red-600 dark:text-red-400">{`<?xml version="1.0"?> <!DOCTYPE svg...>`}</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Stripped (redundant in HTML5 and modern bundlers)</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Editor Namespaces</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-red-600 dark:text-red-400">{`inkscape:version="1.2" sodipodi:docname="..."`}</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Removed safely without altering geometry</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Excess Coordinate Decimals</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-red-600 dark:text-red-400">{`d="M64.00000000 34.12345678..."`}</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Rounded to 2 decimals ({`d="M64 34.12..."`})</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Empty Wrapper Groups</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-red-600 dark:text-red-400">{`<g id="Layer_1"><g></g></g>`}</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Pruned and collapsed into direct child elements</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Orphaned &lt;defs&gt;</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-red-600 dark:text-red-400">{`<linearGradient id="unused_grad">...`}</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Removed via reachability graph verification</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Hex Color Minification</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-red-600 dark:text-red-400">{`fill="#ffffff" stroke="#222222"`}</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Shortened to fill=&quot;#fff&quot; stroke=&quot;#222&quot;</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Empirical Optimization Benchmarks: Verified Engine Performance
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        The table below shows real, uncompressed byte savings measured directly using the OmniTools client-side optimization engine across representative vector fixtures:
      </p>

      {/* Benchmark Table */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Fixture Type</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Original Size</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Optimized Size</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Bytes Saved</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Reduction %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Geometric Star Icon</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">342 B</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">218 B</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">124 B</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">36.3%</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Dual-Gradient Badge</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">814 B</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">492 B</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">322 B</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">39.6%</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Illustrator Export with Metadata</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">1,489 B</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">426 B</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">1,063 B</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">71.4%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Security &amp; Sanitization: Mitigating SVG Cross-Site Scripting (XSS)
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Unlike static bitmap formats (JPEG, PNG), SVG files are active XML documents. The SVG specification allows executable scripts
        via <code className="text-xs">&lt;script&gt;</code> elements, active event attributes (such as <code className="text-xs">onload=&quot;alert(1)&quot;</code>),
        and interactive hyperlinks (<code className="text-xs">&lt;a href=&quot;javascript:...&quot;&gt;</code>).
      </p>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        If an untrusted SVG is rendered directly in an application's DOM, it can compromise user session cookies and execute unauthorized API calls.
        OmniTools employs two layers of protection:
      </p>
      <ul className="list-disc pl-5 space-y-2 mb-6 text-slate-600 dark:text-slate-400">
        <li>
          <strong>Sandboxed Iframe Isolation:</strong> Visual previews are rendered inside an isolated <code className="text-xs">&lt;iframe sandbox=&quot;&quot;&gt;</code> container with zero script execution privileges.
        </li>
        <li>
          <strong>Hazard Inspection &amp; Stripping:</strong> The analysis engine identifies embedded scripts, foreignObjects, and event handlers, stripping them during preview preparation and flagging them in the health report.
        </li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How to Use the OmniTools SVG Optimizer
      </h3>
      <ol className="list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Load or Paste SVG:</strong> Drag and drop an <code className="text-xs">.svg</code> file, paste raw XML into the editor, or click one of the preset samples (<em>Star Icon</em>, <em>Badge</em>, or <em>Bloated Export</em>).
        </li>
        <li>
          <strong>Select an Optimization Mode:</strong> Choose <em>Smart</em> (recommended for modern web icons), <em>Safe</em> (preserves all IDs and classes), <em>Balanced</em> (merges safe strokes), or <em>Maximum</em> (aggressive path simplification).
        </li>
        <li>
          <strong>Adjust Coordinate Precision:</strong> Fine-tune the decimal precision slider (typically 2 or 3 decimals) while verifying visual fidelity in the live preview against checkerboard, dark, or light backgrounds.
        </li>
        <li>
          <strong>Copy or Download:</strong> Instantly copy clean vector markup to your clipboard for HTML/JSX, or download the optimized asset with a sanitized filename.
        </li>
      </ol>

      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <dl className="space-y-6 mb-6">
        {SVG_OPTIMIZER_FAQS.map((faq, index) => (
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
          Related Media &amp; Developer Utilities
        </h4>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/media/image-compressor"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Image Compressor &amp; Optimizer &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/media/webp-to-jpg-png"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            WebP to JPG &amp; PNG Converter &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/developer/sql-formatter"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            SQL Formatter &amp; Beautifier &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/developer/json-formatter"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            JSON Formatter &amp; Validator &rarr;
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