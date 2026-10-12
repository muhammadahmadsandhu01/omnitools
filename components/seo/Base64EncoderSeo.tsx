import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const BASE64_FAQS: FaqItem[] = [
  {
    question: 'Why does Base64 encoding increase data size by roughly 33%?',
    answer:
      'Base64 groups 3 binary bytes (24 bits total) and redistributes them into 4 printable 6-bit sextets. Each 6-bit sextet maps directly to an ASCII character (8 bits). Because 3 input bytes expand into 4 output bytes, the raw size increases by exactly 4/3, or approximately 33.33% (plus minor padding characters).',
  },
  {
    question: 'What is the difference between standard Base64 and URL-Safe Base64?',
    answer:
      'Standard Base64 (RFC 4648 §4) uses plus (+) and slash (/) characters, which have reserved semantic meanings in URL paths, query strings, and HTTP headers. URL-Safe Base64 (RFC 4648 §5) substitutes plus with hyphen (-) and slash with underscore (_), and commonly omits trailing equals (=) padding to avoid URL parameter parsing issues.',
  },
  {
    question: 'What is the purpose of the equals (=) padding character in Base64?',
    answer:
      'Base64 processes binary streams in 3-byte blocks. When the input length is not an exact multiple of 3, trailing zero bits are added to complete the final 6-bit sextet, and one or two equals (=) characters are appended so the total output length remains an exact multiple of 4. When decoding, these padding characters instruct the decoder to ignore the trailing filler bits.',
  },
  {
    question: 'How does OmniTools handle multi-byte UTF-8 text and emoji characters?',
    answer:
      'Legacy browser window.btoa only accepts Latin-1 (code points 0–255), throwing a CharacterOutofRange error on multibyte Unicode. OmniTools uses the modern TextEncoder and TextDecoder Web APIs to encode UTF-8 bytes directly into a Uint8Array before conversion, guaranteeing full fidelity for Arabic, Chinese, Cyrillic, accented characters, and multi-byte emojis.',
  },
  {
    question: 'When should you embed an image as a Base64 Data URI instead of a regular file URL?',
    answer:
      'Data URIs eliminate extra HTTP round trips, making them useful for tiny inline SVGs, critical splash icons, or single-file HTML email templates. However, because Base64 carries ~33% size overhead and cannot be cached independently by browser caches or CDNs, larger images (over 20 KB) should generally be served as standalone asset files.',
  },
  {
    question: 'Are my files or text payloads transmitted to any server during conversion?',
    answer:
      'No. OmniTools Base64 Encoder & Decoder processes all data entirely within your browser using client-side JavaScript APIs (Uint8Array, FileReader, TextEncoder, and TextDecoder). No text strings, files, or binary buffers are uploaded to remote servers or stored externally.',
  },
];

export default function Base64EncoderSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: BASE64_FAQS.map((faq) => ({
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
        Base64 Encoding &amp; Decoding Guide: RFC 4648 Standards, Data URIs &amp; Binary Transfer
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        <strong>Base64</strong> is a group of binary-to-text encoding schemes standardized by <strong>RFC 4648</strong>.
        It represents arbitrary binary octets using an indexable alphabet of 64 printable US-ASCII characters. Base64 is not
        encryption or compression; its purpose is to allow binary assets—such as images, cryptographic keys,
        tokens, or compiled documents—to be safely transported across communication channels designed exclusively for text.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How Base64 Works: The 24-Bit to 4-Character Grouping Algorithm
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Computers store binary information in 8-bit bytes. Base64 processes data in blocks of three 8-bit bytes (24 bits total)
        and redistributes them into four 6-bit units known as <em>sextets</em>. Each 6-bit integer (ranging from 0 to 63)
        maps to an ASCII character in the Base64 alphabet table:
      </p>

      {/* Practical step-by-step bit example */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 mb-6 font-mono text-xs overflow-x-auto text-slate-800 dark:text-slate-200">
        <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Step-by-Step Bit Conversion Example: The word &quot;Man&quot;</p>
        <p className="text-slate-600 dark:text-slate-400">1. ASCII input: &apos;M&apos; (77), &apos;a&apos; (97), &apos;n&apos; (110)</p>
        <p className="text-slate-600 dark:text-slate-400">2. 8-bit binary: 01001101 01100001 01101110 (24 bits total)</p>
        <p className="text-slate-600 dark:text-slate-400">3. 6-bit sextets: 010011 | 010110 | 000101 | 101110</p>
        <p className="text-slate-600 dark:text-slate-400">4. Decimal values: 19 | 22 | 5 | 46</p>
        <p className="text-blue-600 dark:text-blue-400 font-semibold">5. Base64 output: &apos;T&apos; | &apos;W&apos; | &apos;F&apos; | &apos;u&apos; &rarr; &quot;TWFu&quot;</p>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Encoding Scheme</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Characters 0–61</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Index 62</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Index 63</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Padding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Standard Base64 (RFC 4648 §4)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">A–Z, a–z, 0–9</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">+ (plus)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">/ (slash)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200">=</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">URL-Safe Base64 (RFC 4648 §5)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">A–Z, a–z, 0–9</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">- (hyphen)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">_ (underscore)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200">Optional / Omitted</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Data URI Anatomy &amp; Media Handling
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        A <strong>Data URI</strong> allows you to embed binary media inline directly inside HTML markup, CSS stylesheets,
        or JSON payloads using the standard RFC 2397 format:
      </p>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 mb-4 font-mono text-xs overflow-x-auto text-slate-800 dark:text-slate-200">
        data:[&lt;mediatype&gt;][;base64],&lt;data&gt;
      </div>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        For example, a transparent 1x1 PNG tracker pixel can be represented as:
      </p>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 mb-6 font-mono text-xs overflow-x-auto text-blue-600 dark:text-blue-400">
        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How to Use the OmniTools Base64 Converter
      </h3>
      <ol className="list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Choose Input Mode:</strong> Select <em>Text</em> to paste strings, JWT tokens, or JSON payloads; or select <em>File</em> to upload images, PDFs, audio, or binary documents up to 25 MB.
        </li>
        <li>
          <strong>Configure Options:</strong> For encoding, toggle <em>URL-Safe</em> (RFC 4648 §5) or <em>Omit Padding</em> as required by your framework (such as JWT tokens). You can also export directly as a <em>Data URI</em> with automatic MIME-type detection.
        </li>
        <li>
          <strong>Decode with Automatic Detection:</strong> When decoding, the tool inspects magic bytes (file signatures) to detect PNG, JPEG, PDF, WebP, ZIP, and audio formats, allowing direct file download with correct file extensions.
        </li>
        <li>
          <strong>Verify Client-Side Execution:</strong> All buffer transformations execute locally in your web browser using modern Web APIs. No uploaded files or sensitive credentials ever leave your device.
        </li>
      </ol>

      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <dl className="space-y-6 mb-6">
        {BASE64_FAQS.map((faq, index) => (
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
          Related Developer Utilities
        </h4>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/developer/json-formatter"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            JSON Formatter &amp; Validator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/developer/password-generator"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Secure Password &amp; Hash Generator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/developer/regex-tester"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Regex Tester &amp; Code Generator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/seo/text-case-converter"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Text Case Converter &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/developer/json-converter"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            JSON to CSV / Excel &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}