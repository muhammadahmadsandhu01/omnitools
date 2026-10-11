export default function SvgOptimizerSeo() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-200">Advanced SVG Optimizer & Code Cleaner</h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Scalable Vector Graphics (SVGs) exported from design software like Figma, Illustrator, or Sketch often contain massive amounts of unnecessary metadata, comments, empty groups, and overly precise decimal paths. Our <strong>Free SVG Optimizer</strong> strips away the bloat directly in your browser, reducing file sizes drastically.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-300">The Power of Coordinate Precision</h3>
      <p className="mb-6 text-slate-600 dark:text-slate-400">
        The biggest culprit behind heavy SVG files is path data with too many decimal places (e.g., <code>14.5928491px</code>). Our Precision Engine rounds off these coordinate decimals using advanced Regular Expressions. Lowering the precision slider from 4 down to 1 or 2 can easily compress an SVG by over 50% without any visible quality loss.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-300">100% Client-Side Processing</h3>
      <p className="mb-4 text-slate-600 dark:text-slate-400">
        We value your privacy and security. Unlike other tools that upload your intellectual property to external servers for processing, our SVG minifier runs its entire regex-based optimization engine locally inside your browser. No uploads, zero latency, and absolute privacy.
      </p>
    </article>
  );
}