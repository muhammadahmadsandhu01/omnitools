import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const PDF_MERGE_SPLIT_FAQS: FaqItem[] = [
  {
    question: 'How does client-side PDF processing protect my sensitive documents?',
    answer:
      'Unlike cloud services that upload files to external servers, OmniTools processes PDFs 100% locally in your browser memory using the client-side pdf-lib library. Confidential contracts, legal briefs, tax filings, and bank statements are never transmitted over the internet or saved to remote disks.',
  },
  {
    question: 'Does this tool support encrypted or password-protected PDF files?',
    answer:
      'No. Encrypted and password-protected PDFs cannot be edited or parsed in client-side memory without cryptographic keys. If a file is password-protected, the tool safely alerts you so you can decrypt the document with authorized software before merging or extracting pages.',
  },
  {
    question: 'What are the file size and document count limits for merging?',
    answer:
      'You can merge up to 50 PDF files simultaneously, with a maximum single file size of 250 MB and a total combined merge batch limit of 750 MB. Because processing utilizes client browser memory, large files are processed in streaming buffer chunks to ensure smooth operation.',
  },
  {
    question: 'How do custom page ranges work in Split Mode?',
    answer:
      'Split Mode allows you to extract specific pages using flexible comma-separated numbers and ranges (e.g. "1-5, 8, 11-14"). The parser automatically validates your range against the total page count, checks for invalid or out-of-order syntax, and generates a new standalone PDF containing only your selected pages.',
  },
  {
    question: 'Are bookmarks, form fields, and text annotations preserved when merging?',
    answer:
      'Standard vector paths, text glyphs, embedded images, and page dimensions are preserved with exact fidelity. However, because independent PDF documents often have conflicting internal bookmark trees and form field names, interactive form fields and complex bookmark hierarchies are flattened into standard pages to prevent document corruption.',
  },
];

export default function PdfMergeSplitSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PDF_MERGE_SPLIT_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        PDF Merge &amp; Split Studio: Secure Client-Side Document Management
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Managing Portable Document Format (PDF) files should not require expensive software licenses or sacrificing
        confidential data to third-party cloud servers. OmniTools <strong>PDF Merge &amp; Split Tool</strong> provides an
        intuitive, high-performance document workshop running 100% locally inside your browser using modern client-side
        binary manipulation. Combine multiple PDF reports into a single consolidated file or extract exact page ranges instantly.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Merge vs. Split Operation Comparison
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Mode</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Input Capacity</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Primary Actions</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Output Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Merge Mode</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Up to 50 files (750 MB total)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Drag-and-drop reordering, page count inspection</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-medium">Single consolidated multi-page PDF</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Split Mode</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">1 document (up to 250 MB)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Custom page range extraction (e.g. 1-3, 5, 8-10)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">Clean extracted PDF with selected pages</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How the Client-Side Engine Works
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Standard web services upload your files to a cloud server to execute CLI tools like Ghostscript or Poppler.
        OmniTools executes the entire PDF specification parser directly inside your web browser via <strong>pdf-lib</strong>:
      </p>
      <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Binary Tree Inspection:</strong> When you select a document, the parser reads its cross-reference table (<code className="text-xs">xref</code>) and trailer dictionary in memory to verify document validity and count total pages.
        </li>
        <li>
          <strong>Non-Destructive Page Copying:</strong> Pages are copied as native PDF content streams. Vector fonts, high-resolution imagery, and page crop boxes remain pixel-perfect without lossy re-compression.
        </li>
        <li>
          <strong>Client Memory Guard:</strong> Files up to 250 MB are supported without network lag or cloud bandwidth constraints. Because everything runs in browser memory, your documents remain private to your local computer.
        </li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Step-by-Step Instructions
      </h3>
      <ol className="list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Select Tool Mode:</strong> Click <em>Merge Files</em> to combine multiple documents, or <em>Split Document</em> to extract pages from a single file.
        </li>
        <li>
          <strong>Upload Unencrypted PDFs:</strong> Drag and drop your files into the workspace. Note that password-protected files must be decrypted prior to uploading.
        </li>
        <li>
          <strong>Reorder or Define Ranges:</strong> In Merge mode, use the arrow buttons to arrange files in your desired order. In Split mode, enter custom page ranges like <code className="text-xs">1-4, 7, 9-12</code>.
        </li>
        <li>
          <strong>Process &amp; Download:</strong> Click the action button to assemble your document in client memory and download your new PDF instantly.
        </li>
      </ol>

      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <dl className="space-y-6 mb-6">
        {PDF_MERGE_SPLIT_FAQS.map((faq, index) => (
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
          Related Document &amp; Media Utilities
        </h4>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/document/image-to-pdf"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Image to PDF Studio &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/finance/invoice-generator"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Invoice Generator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/media/image-compressor"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Image Compressor &amp; Optimizer &rarr;
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