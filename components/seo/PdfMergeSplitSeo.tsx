export default function PdfMergeSplitSeo() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      <h2 className="text-2xl font-bold mb-4">The Ultimate Free PDF Merger & Splitter</h2>
      <p className="mb-6 leading-relaxed">
        Managing PDF documents shouldn't require expensive software or compromising your privacy. Our <strong>Ultimate PDF Merger and Splitter</strong> runs entirely inside your browser. Whether you need to combine multiple reports into a single file or extract a specific page from a large document, our tool does it instantly.
      </p>

      <h3 className="text-xl font-semibold mb-3">Privacy First: 100% Local Processing</h3>
      <p className="mb-6">
        Most free online PDF tools upload your highly sensitive documents (like invoices, legal contracts, or medical records) to their servers. <strong>We do not.</strong> By utilizing advanced <em>WebAssembly (Client-Side)</em> technology, your files are processed directly on your laptop or mobile phone. No uploads, no downloads, zero risk of data leakage.
      </p>

      <h3 className="text-xl font-semibold mb-3">How to Use?</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Merge Mode:</strong> Simply drag and drop multiple PDF files. Use the up and down arrows to arrange them in your desired order, and click "Merge & Download".</li>
        <li><strong>Split Mode:</strong> Upload a single PDF document. Type the exact pages you want to keep using ranges (e.g., <code>1-5, 8, 11-13</code>), and hit download. A new clean PDF will be generated instantly.</li>
      </ul>
    </article>
  );
}