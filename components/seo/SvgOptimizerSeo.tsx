import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const SVG_OPTIMIZER_FAQS: FaqItem[] = [
  {
    question: 'Why is preserving the viewBox attribute critical for responsive web design?',
    answer:
      'The viewBox attribute defines the internal coordinate system and aspect ratio of an SVG graphic (e.g., viewBox="0 0 24 24"). When explicit width and height attributes are removed or overridden by modern CSS utilities (such as Tailwind CSS w-6 h-6 or width: 100%), web browsers use the viewBox to scale vector geometry fluidly without clipping or distortion. KivaroTools enables "Preserve viewBox" by default across all optimization presets.',
  },
  {
    question: 'How does coordinate decimal precision affect SVG file size and visual rendering?',
    answer:
      'Design applications like Adobe Illustrator and Figma frequently export path coordinates with 6 to 14 decimal places (such as d="M12.4829104819 4.9182390192..."). Rounding coordinates to 2 decimal places typically reduces total file size by 30% to 50% with zero perceivable difference on high-DPI Retina screens. For micro-icons, 1 to 2 decimals are optimal; for precision technical schematics, 3 to 4 decimals can be chosen using our precision slider.',
  },
  {
    question: 'Can SVG files contain malicious scripts or cross-site scripting (XSS) attacks?',
    answer:
      'Yes. Because SVG is valid XML, the SVG specification allows embedded <script> tags, foreignObject elements, and inline event handlers (like onload or onclick). Rendering unsanitized, user-uploaded SVGs directly in HTML can execute arbitrary JavaScript. KivaroTools isolates live visual previews inside a strictly sandboxed iframe (<iframe sandbox="">) and strips hazardous script elements and event handlers.',
  },
  {
    question: 'What is Breadth-First Search (BFS) defs reachability pruning?',
    answer:
      'During design iterations in Figma or Illustrator, gradient stops, drop shadow filters, and clipping masks are frequently created and discarded, leaving orphaned definitions inside the <defs> block. KivaroTools executes a Breadth-First Search (BFS) traversal starting from rendered graphic elements, recursively discovering all referenced IDs (via fill="url(#id)", clip-path, or mask). Any unreferenced definition is safely purged, eliminating hidden file bloat.',
  },
  {
    question: 'How do the Smart, Safe, Balanced, and Maximum optimization modes differ?',
    answer:
      'Smart mode dynamically balances byte savings against visual integrity based on graphic complexity. Safe mode applies zero visual risk transformations (stripping editor metadata, XML declarations, and comments). Balanced mode applies 2-decimal coordinate rounding, color minification, and group collapsing. Maximum mode aggressively flattens containers, normalizes paths into relative commands, and prunes all unused definitions for maximum compression.',
  },
  {
    question: 'How does the visual alteration risk health score work?',
    answer:
      'KivaroTools calculates a real-time risk score (Low, Medium, or High) by evaluating the density of path segments, presence of tiny curve segments, thin stroke widths, and non-scaling strokes. If coordinate rounding or transformation threatens to visibly distort fine lines, the interface alerts you immediately before you download or copy the code.',
  },
  {
    question: 'Does KivaroTools upload my proprietary logos or vector illustrations to a server?',
    answer:
      'No. 100% of XML parsing, path tokenization, coordinate normalization, DOM tree pruning, and sandboxed previewing occur locally in your browser memory using an isolated Web Worker. Your proprietary brand icons, trademarked graphics, and product illustrations never touch an external cloud server.',
  },
  {
    question: 'Can I copy the optimized SVG markup directly into React JSX or Next.js components?',
    answer:
      'Yes. The optimized SVG output is clean, standard XML that can be copied directly into React JSX/TSX components, imported using SVGR or @svgr/webpack, or saved as standalone .svg asset files for standard <img> or CSS background-image rules.',
  },
  {
    question: 'Why do exported SVGs from Figma and Illustrator contain so much bloat?',
    answer:
      'Desktop vector editors prioritize non-destructive re-editability over web delivery. They inject proprietary namespaces (like adobe:ns:meta, i:pgf, or inkscape:version), editor guide groups, unreferenced clip paths, and redundant layer containers that browsers do not need to render the graphic.',
  },
  {
    question: 'What is the maximum SVG file size supported by KivaroTools?',
    answer:
      'KivaroTools supports SVG files up to 10 MB. Transformations are processed in a dedicated Web Worker equipped with a 15-second watchdog timer, preventing browser UI freezing even when parsing intricate vector illustrations containing hundreds of thousands of path coordinates.',
  },
  {
    question: 'How does KivaroTools handle embedded raster images (Base64 data URIs)?',
    answer:
      'Design exports sometimes accidentally embed large PNG or JPEG bitmaps inside <image xlink:href="data:image/png;base64,..."> tags. KivaroTools preserves embedded raster images while optimizing surrounding vector geometry, and telemetry highlights embedded raster assets so you can replace them with pure vectors if desired.',
  },
  {
    question: 'How does color minification work in the SVG cleaner?',
    answer:
      'The color minification engine converts verbose rgb(255, 255, 255) syntax and 6-character hex codes (#ffffff) into compact 3-character equivalents (#fff) or shorter standard CSS color names (e.g. converting #ff0000 to red), saving bytes across repetitive fills and strokes.',
  },
  {
    question: 'Can optimizing an SVG break CSS animations or SVG stroke dashes?',
    answer:
      'In Safe and Balanced modes, animation tags (<animate>, <animateTransform>) and class/ID attributes targeted by CSS stylesheets are strictly preserved. If you have custom CSS keyframes targeting specific element IDs, using Safe mode ensures those identifiers remain untouched.',
  },
  {
    question: 'What is the difference between an AST/DOM-based cleaner and a regex regex minifier?',
    answer:
      'Naive regex minifiers perform crude text search-and-replace, frequently corrupting nested <style> blocks, damaging self-closing tags, and mangling path coordinate arrays. KivaroTools utilizes native DOM parsing and AST path segment tokenization, ensuring structural validity and zero geometric corruption.',
  },
];

export default function SvgOptimizerSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SVG_OPTIMIZER_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      {/* FAQPage JSON-LD Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Optimize, Clean, and Minify SVG Vector Files Without Losing Visual Quality',
            description: 'Step-by-step guide to stripping editor metadata, pruning unused defs via BFS reachability, rounding path coordinates, and comparing before/after SVG rendering.',
            step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Upload SVG File or Paste Raw XML Markup',
        text: 'Drag and drop an .svg file (up to 10 MB) exported from Figma, Illustrator, or Inkscape, or paste raw SVG markup.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Select Optimization Preset (Smart, Safe, Balanced, or Maximum)',
        text: 'Choose Smart or Safe mode for zero visual risk, or Balanced/Maximum mode for coordinate rounding and path minification.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Compare Side-by-Side Visual Preview & Risk Score',
        text: 'Inspect the sandboxed live preview, byte reduction percentage, and visual alteration risk health indicator.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Copy Clean SVG/JSX Code or Download .svg File',
        text: 'Copy the optimized XML markup directly into your web project or download the compressed .svg asset.',
      }
            ],
          }),
        }}
      />

      <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
        {/* Zone 2: Deep-Dive Architecture & Engine Sections */}
        <section aria-labelledby="svg-optimizer-architecture" className="mb-8">
          <h2 id="svg-optimizer-architecture" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Client-Side SVG Optimization Architecture &amp; Vector Precision Engineering
          </h2>
          <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
            <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
              <strong>100% Client-Side In-Browser Execution:</strong> All SVG parsing, coordinate rounding, and markup minification run locally on your device. Proprietary branding, UI icons, and enterprise vector assets are never uploaded to any remote server.
            </p>
          </blockquote>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            <strong>Scalable Vector Graphics (SVG)</strong> is the XML-based vector graphics standard established by the <strong>World Wide Web Consortium (W3C)</strong>. Unlike raster image formats (PNG, JPEG, WebP, AVIF) that define fixed pixel grids, SVGs describe vector paths, Bezier curves, and geometric shapes mathematically. Because design tools like Figma, Adobe Illustrator, Inkscape, and Sketch prioritize non-destructive re-editability, exported files routinely carry <strong>40% to 75% non-essential bloat</strong>.
          </p>
          <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
            A dedicated <strong>SVG Optimizer &amp; Cleaner</strong> parses that verbose XML markup, strips editor metadata, rounds floating-point path coordinates, collapses empty container groups, and purges orphaned defs to create lightning-fast, lightweight vector assets optimized for modern web performance and Core Web Vitals.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Web Worker Architecture with 15-Second Watchdog Timer
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Complex vector illustrations containing tens of thousands of path nodes can choke browser execution. KivaroTools offloads parsing, path tokenization, and transformation to an isolated background <strong>Web Worker</strong>. Equipped with a 15-second watchdog timer and automatic main-thread fallback, it safely processes files up to <strong>10 MB</strong> without dropping frames or freezing your browser tab.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            BFS Reachability Graph Pruning Unreferenced Definitions
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            During UI design iterations, gradients, filters, and clip-paths are frequently created and abandoned. KivaroTools performs a <strong>Breadth-First Search (BFS)</strong> reachability traversal across the document object model. Starting from visible elements, it traces every <code>fill=&quot;url(#id)&quot;</code>, <code>clip-path</code>, <code>mask</code>, and <code>href</code> link, systematically pruning orphaned <code>&lt;defs&gt;</code>, unused <code>&lt;linearGradient&gt;</code> stops, and empty <code>&lt;filter&gt;</code> nodes with zero risk of breaking active graphics.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Custom Path Normalizer &amp; Coordinate Precision Slider
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Path data strings (<code>d=&quot;...&quot;</code>) typically account for over 70% of an SVG&apos;s total byte weight. Our AST path segment normalizer converts verbose absolute coordinates to relative commands where shorter, strips leading zeros (e.g. converting <code>0.5</code> to <code>.5</code>), and allows granular coordinate precision adjustment from <strong>0 to 4 decimal places</strong> via an interactive slider.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Sandboxed Visual Preview &amp; XSS Defense
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Because SVG allows embedded scripts, rendering untrusted vector markup poses severe Cross-Site Scripting (XSS) risks. KivaroTools renders visual previews inside an isolated <code>&lt;iframe sandbox=&quot;&quot;&gt;</code> with zero execution privileges. An interactive canvas background switcher lets you inspect graphics against <strong>Dark (#111827)</strong>, <strong>Light (#ffffff)</strong>, and <strong>Transparent Checkerboard</strong> grids to verify contrast and transparency.
          </p>
        </section>

        {/* Zone 3: Interactive Feature & Use-Case Grid */}
        <section aria-labelledby="svg-optimizer-use-cases" className="mb-8">
          <h2 id="svg-optimizer-use-cases" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Production Workflows &amp; Vector Optimization Scenarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                Figma &amp; Adobe Illustrator Export Cleaning
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Strip proprietary editor metadata, XML declarations (<code>&lt;?xml?&gt;</code>), DOCTYPE definitions, Inkscape namespaces, and redundant <code>&lt;g&gt;</code> wrapper layers generated during design asset export.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                Inline React, Next.js &amp; Vue Component Optimization
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Prepare lightweight SVG markup for direct inline embedding in React JSX/TSX or Vue components, reducing client-side bundle sizes and avoiding hydration mismatches caused by editor comments.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                Tailwind CSS &amp; currentColor Icon Theming
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Clean icon geometry and preserve responsive <code>viewBox</code> dimensions while replacing hardcoded hex fills with <code>currentColor</code> for effortless dynamic hover styling with Tailwind CSS utility classes.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                Core Web Vitals &amp; LCP Optimization
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Minimize vector hero illustration file sizes to improve Largest Contentful Paint (LCP) and First Contentful Paint (FCP) metrics across mobile and desktop Lighthouse audits.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                SVG Spritesheet &amp; Symbol Consolidation
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Prune duplicate IDs, collapse empty container wrappers, and normalize coordinate scales before assembling vector icon libraries into consolidated SVG spritesheets.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                CSS Background Data URI Preparation
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Clean and minify SVGs before encoding them into <code>data:image/svg+xml;base64</code> strings for ultra-compact inline CSS background images and custom bullet points.
              </p>
            </div>
          </div>
        </section>

        {/* Zone 4: Technical Specification & Comparison Matrices */}
        <section aria-labelledby="svg-optimizer-comparison-matrix" className="mb-8">
          <h2 id="svg-optimizer-comparison-matrix" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Technical Specification: Optimization Presets Comparison
          </h2>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Preset Mode</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Coordinate Precision</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Defs Pruning</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Visual Risk Rating</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Typical Size Reduction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Safe</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Preserved exactly</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Only empty containers</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Zero Risk</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">15% to 30%</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Balanced (Default)</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">2 decimal places</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">BFS reachability pruning</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-medium">Low Risk</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">40% to 65%</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Smart</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Adaptive (1–3 decimals)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">BFS reachability pruning</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-medium">Low Risk</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">45% to 70%</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Maximum</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">1 decimal place</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Aggressive defs &amp; group collapse</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 font-medium">Moderate Risk</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">60% to 80%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Zone 5: Developer Troubleshooting & Error Reference */}
        <section aria-labelledby="svg-optimizer-troubleshooting" className="mb-8">
          <h2 id="svg-optimizer-troubleshooting" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Common SVG Optimization Errors, Edge Cases &amp; Fixes
          </h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                SVG Clips or Scales Distorted when Resized in CSS
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cause:</strong> The vector export had explicit <code>width</code> and <code>height</code> attributes but lacked a valid <code>viewBox</code> attribute, preventing responsive scaling.
                <br />
                <strong>Fix:</strong> Ensure the <strong>Preserve viewBox</strong> checkbox is checked. KivaroTools will synthesize a responsive <code>viewBox=&quot;0 0 width height&quot;</code> and strip fixed pixel bounds.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Icons Render as Solid Black Shapes After Optimization
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cause:</strong> In standard SVG, shapes without an explicit <code>fill</code> attribute default to black (<code>#000000</code>). When class-based styles inside a stripped <code>&lt;style&gt;</code> block are removed, default black fills take over.
                <br />
                <strong>Fix:</strong> Switch to <strong>Safe mode</strong> or check that presentation attributes (<code>fill=&quot;...&quot;</code>) are applied directly to path elements before minifying.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                ID Collisions when Inlining Multiple SVGs on a Page
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cause:</strong> Vector tools export generic IDs like <code>id=&quot;clip0&quot;</code> or <code>id=&quot;paint0_linear&quot;</code>. Inlining several SVGs with identical IDs causes browsers to cross-reference the wrong gradients or masks.
                <br />
                <strong>Fix:</strong> KivaroTools prunes unused clip paths and localizes referenced gradient IDs, ensuring unique scoped namespaces across inlined assets.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Loss of Fine Detail on Technical Plots and Micro-Curves
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cause:</strong> Setting coordinate precision too low (e.g. 0 decimals) rounds subtle curve control points to whole integers, flattening subtle arcs.
                <br />
                <strong>Fix:</strong> Adjust the <strong>Coordinate Precision slider</strong> to 2 or 3 decimals and monitor the Visual Preview toggle to verify that curve fidelity is maintained.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Bloated File Size Due to Embedded Raster Images
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cause:</strong> An illustration exported from Illustrator or Canva contains an embedded Base64-encoded bitmap inside an <code>&lt;image&gt;</code> tag, inflating size to several megabytes.
                <br />
                <strong>Fix:</strong> KivaroTools flags embedded image tags in telemetry, enabling you to export pure vector layers or compress the embedded raster asset separately.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                XSS Vulnerability Warnings from Security Scanners
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cause:</strong> Vector files downloaded from third-party icon repositories may contain embedded <code>&lt;script&gt;</code> tags or <code>onload</code> event attributes.
                <br />
                <strong>Fix:</strong> KivaroTools strips active script nodes and event handler attributes automatically during cleanup, rendering safe markup.
              </p>
            </div>
          </div>
        </section>

        {/* Zone 6: Frequently Asked Questions */}
        <section aria-labelledby="svg-optimizer-frequently-asked-questions" className="mb-8">
          <h2 id="svg-optimizer-frequently-asked-questions" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {SVG_OPTIMIZER_FAQS.map((faq, index) => (
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

        {/* Internal Cross-Linking Block */}
        <section aria-labelledby="svg-optimizer-related-utilities" className="mb-8">
          <h2 id="svg-optimizer-related-utilities" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Related Client-Side Developer Workflows
          </h2>
          <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-sm">
            Explore our complete suite of private, browser-based developer utilities:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>
              <Link href="/developer/base64-encoder" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Base64 Encoder &amp; Decoder
              </Link>{' '}
              — Convert optimized SVG markup into compact Data URIs for inline CSS background images and HTML embeds.
            </li>
            <li>
              <Link href="/developer/json-formatter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                JSON Formatter, Validator &amp; Tree Viewer
              </Link>{' '}
              — Format, validate, and repair complex API payloads up to 25 MB with 64-bit integer precision detection.
            </li>
            <li>
              <Link href="/developer/regex-tester" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Regex Tester &amp; Code Generator
              </Link>{' '}
              — Test regular expression patterns in real-time with capture groups and ReDoS catastrophic backtracking safety.
            </li>
            <li>
              <Link href="/developer/sql-formatter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                SQL Query Formatter &amp; Linter
              </Link>{' '}
              — Beautify and lint complex queries across 19 dialects including PostgreSQL, MySQL, and Snowflake.
            </li>
            <li>
              <Link href="/developer/password-generator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Cryptographic Password &amp; Secret Generator
              </Link>{' '}
              — Generate zero-bias passwords, API tokens, and 1 GB streaming file checksums via Web Crypto.
            </li>
            <li>
              <Link href="/developer/json-converter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                JSON to CSV &amp; Excel Converter
              </Link>{' '}
              — Transform nested JSON structures into spreadsheets and YAML manifests with formula injection protection.
            </li>
          </ul>
        </section>
      </article>
    </>
  );
}