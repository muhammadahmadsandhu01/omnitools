export default function SqlFormatterSeo() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-200">Advanced SQL Studio & Formatter</h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Stop writing messy, unreadable database queries. Our <strong>Advanced SQL Formatter</strong> acts as an in-browser developer studio. It instantly beautifies complex queries while providing real-time syntax highlighting for standard SQL, PostgreSQL, MySQL, MariaDB, and T-SQL.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-300">Minify & Execution Wrappers</h3>
      <p className="mb-6 text-slate-600 dark:text-slate-400">
        We understand a developer's workflow. Formatting a query is great for readability, but what if you need to paste it into a Node.js or Python backend? Use our <strong>Minify Mode</strong> to safely strip comments and compress your query into a single line. Then, use our <em>Export Menu</em> to instantly wrap the query in JavaScript Template Literals (<code>`...`</code>) or Python Docstrings (<code>"""..."""</code>) and copy it directly to your clipboard.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-300">Client-Side Local Privacy</h3>
      <p className="mb-4 text-slate-600 dark:text-slate-400">
        Database schemas and queries often contain sensitive business logic or proprietary table structures. Your SQL is processed locally in your browser using a dedicated Web Worker and is not sent to a remote SQL formatting service.
      </p>
    </article>
  );
}