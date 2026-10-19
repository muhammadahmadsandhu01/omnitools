import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const BASE64_FAQS: FaqItem[] = [
  {
    question: 'What is Base64 and why do developers use it?',
    answer:
      'Base64 is a binary-to-text encoding algorithm standardized by RFC 4648 that represents arbitrary binary bytes using an index of 64 printable US-ASCII characters. Developers use Base64 to safely transmit binary data—such as image files, cryptographic keys, hashes, and compiled blobs—across legacy protocols like HTTP headers, JSON, XML, and SMTP email that were designed strictly for printable text.',
  },
  {
    question: 'Why does Base64 encoding increase file size by roughly 33%?',
    answer:
      'Computers store data in 8-bit bytes. Base64 divides incoming data into 6-bit sextets (2^6 = 64 possible values). Because three 8-bit bytes (24 bits total) are redistributed into four 6-bit symbols (24 bits total, each represented by an 8-bit character in text), every 3 bytes of input expand into 4 bytes of text. This produces a mathematical size overhead of exactly 4/3, or approximately 33.33% (plus any trailing padding characters).',
  },
  {
    question: 'Is Base64 considered encryption or security?',
    answer:
      'No. Base64 is strictly a data formatting encoding, NOT encryption. It involves no secret keys, initialization vectors, or cryptographic protection. Anyone who receives a Base64 string can decode it back to the original plaintext in milliseconds using any standard decoder or browser console. Never use Base64 to conceal passwords, API keys, private tokens, or confidential data.',
  },
  {
    question: 'What is the difference between standard Base64 and URL-Safe Base64 (Base64URL)?',
    answer:
      'Standard Base64 (RFC 4648 §4) uses characters 62 as plus (+) and 63 as slash (/), with equals (=) for padding. Both plus and slash have reserved semantic meanings in URL paths, query parameters, and HTTP headers. URL-Safe Base64 (RFC 4648 §5) substitutes plus with hyphen (-) and slash with underscore (_), and commonly omits trailing padding characters (=) to prevent URL parameter parsing corruption in JWTs and web tokens.',
  },
  {
    question: 'Why do some Base64 strings end with one or two equals (=) signs?',
    answer:
      'Base64 processes binary data in 3-byte blocks. When the input length is not an exact multiple of 3, the final block contains only 1 or 2 bytes. The encoder pads the final 6-bit sextet with zero bits to reach a boundary, and then appends one (=) or two (==) padding characters so the total string length remains an exact multiple of 4. Decoders use these padding markers to discard the filler bits and restore the original byte count.',
  },
  {
    question: 'Can Base64 be safely decoded without trailing equals (=) padding?',
    answer:
      'Yes. In URL-safe environments like JSON Web Tokens (JWT, RFC 7519), padding is intentionally omitted because the length modulo 4 can be used to mathematically deduce whether 1 or 2 padding characters were omitted. KivaroTools includes a Tolerant Decoding mode that automatically recalculates and restores missing padding characters before decoding.',
  },
  {
    question: 'How does KivaroTools handle multi-byte UTF-8 Unicode, accents, and emoji?',
    answer:
      'Legacy JavaScript window.btoa only accepts 8-bit Latin-1 characters (code points 0 to 255) and throws an InvalidCharacterError when encountering characters outside that range. KivaroTools uses the modern WHATWG TextEncoder and TextDecoder Web APIs to serialize text into raw UTF-8 binary bytes before encoding. This guarantees 100% character fidelity for accented Latin, Cyrillic, Arabic, Hebrew, CJK, and modern multi-byte emojis.',
  },
  {
    question: 'What is a Base64 Data URI and when should you use it?',
    answer:
      'A Data URI (RFC 2397) embeds file content directly into HTML or CSS markup using the syntax "data:<mediatype>;base64,<data>". It eliminates extra HTTP network requests for tiny assets, making it ideal for 1x1 spacer pixels, critical splash icons, or self-contained HTML email templates. However, larger assets (over 15–20 KB) should be served as standalone files because Base64 carries ~33% size overhead and Data URIs cannot be cached independently by browser caches or CDNs.',
  },
  {
    question: 'Are my files or sensitive strings uploaded to any remote server?',
    answer:
      'No. KivaroTools Base64 Encoder & Decoder executes 100% client-side in your web browser using modern Web APIs (Uint8Array, FileReader, TextEncoder, and TextDecoder). No text strings, files, or binary buffers are uploaded to remote servers or stored externally.',
  },
  {
    question: 'Why is my decoded output showing garbled text or broken symbols?',
    answer:
      'If you decode a Base64 string that represents compiled binary data—such as a PNG image, PDF document, or ZIP archive—into text mode, the UTF-8 decoder attempts to interpret arbitrary binary bytes as printable text characters, producing unreadable replacement characters (like ). Switch the tool to File Mode or Auto Detect to download the binary file with its detected file extension.',
  },
  {
    question: 'What is Strict Validation versus Tolerant Mode in Base64 decoding?',
    answer:
      'Strict Mode enforces RFC 4648 Section 3.5 compliance: it rejects illegal characters, validates padding placement, and ensures that unused pad bits in the final sextet are strictly zero. Tolerant Mode is forgiving: it automatically strips spaces, line breaks, and tabs, converts URL-safe hyphens and underscores to standard Base64, and restores missing padding for quick developer workflows.',
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
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#070b14] p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-100">
        Base64 Encoding &amp; Decoding Guide: RFC 4648, UTF-8 Unicode, Base64URL &amp; Data URIs
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        <strong>Base64</strong> is a family of binary-to-text encoding algorithms standardized by <strong>RFC 4648</strong>.
        It converts arbitrary binary data—ranging from compiled executables and image bitmaps to multi-byte UTF-8 text—into
        an alphabet of 64 printable US-ASCII characters. Base64 is essential for transporting binary assets across
        protocols that are strictly designed for printable text, such as JSON payloads, HTTP headers, XML feeds, and MIME emails.
      </p>

      {/* Security Warning Notice */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5 dark:border-amber-500/20 dark:bg-amber-500/5 mb-8">
        <h3 className="text-base font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2 mb-1">
          <span>⚠️ Important Security Notice: Base64 Is Encoding, Not Encryption</span>
        </h3>
        <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-400 leading-relaxed">
          Base64 does not use a secret key, mathematical cipher, or password. Anyone who encounters a Base64 string can
          decode it back to the exact original bytes instantly. Never use Base64 to protect confidential data, passwords,
          private keys, or sensitive API secrets. If you need confidentiality, use strong authenticated encryption algorithms (like AES-GCM or ChaCha20-Poly1305) before encoding the resulting ciphertext.
        </p>
      </div>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        How Base64 Works: The 24-Bit to 4-Character Grouping Algorithm
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Computers store binary information in 8-bit bytes (octets). Base64 processes incoming bytes in groups of three (24 bits total)
        and redistributes them into four 6-bit units known as <em>sextets</em>. Because 2<sup>6</sup> equals 64, each sextet
        maps cleanly to an index in the standard Base64 character set (A–Z, a–z, 0–9, +, /).
      </p>

      {/* Practical step-by-step bit example */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 mb-6 font-mono text-xs overflow-x-auto text-slate-800 dark:text-slate-200">
        <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Step-by-Step Bit Conversion Example: The ASCII Word &quot;Man&quot;
        </p>
        <p className="text-slate-600 dark:text-slate-400">1. Input Characters: &apos;M&apos; (decimal 77), &apos;a&apos; (decimal 97), &apos;n&apos; (decimal 110)</p>
        <p className="text-slate-600 dark:text-slate-400">2. 8-Bit Binary Stream: 01001101 01100001 01101110 (24 bits total)</p>
        <p className="text-slate-600 dark:text-slate-400">3. 6-Bit Sextet Regrouping: 010011 | 010110 | 000101 | 101110</p>
        <p className="text-slate-600 dark:text-slate-400">4. Decimal Sextet Values: 19 | 22 | 5 | 46</p>
        <p className="text-blue-600 dark:text-blue-400 font-semibold">5. Base64 Alphabet Lookup: &apos;T&apos; | &apos;W&apos; | &apos;F&apos; | &apos;u&apos; &rarr; &quot;TWFu&quot;</p>
      </div>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Worked Examples &amp; Official RFC 4648 Vectors
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        The table below demonstrates standard RFC 4648 test vectors, padding mechanics, multi-byte UTF-8 encoding, and URL-safe Base64URL equivalents:
      </p>

      <div className="overflow-x-auto mb-8">
        <table className="min-w-full text-xs sm:text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Input Data</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Hex / UTF-8 Bytes</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Standard Base64 (RFC 4648 §4)</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">URL-Safe (Base64URL §5)</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Padding Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400 font-mono">
            <tr>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-sans font-semibold text-slate-800 dark:text-slate-200">&quot;&quot; (Empty)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">0 bytes</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-slate-400 dark:text-slate-600">&quot;&quot;</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-slate-400 dark:text-slate-600">&quot;&quot;</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-sans text-xs">No bytes to process</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-sans font-semibold text-slate-800 dark:text-slate-200">&quot;f&quot;</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">0x66 (1 byte)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold">Zg==</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Zg</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-sans text-xs">1 byte requires 2 padding chars (==)</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-sans font-semibold text-slate-800 dark:text-slate-200">&quot;fo&quot;</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">0x66 0x6F (2 bytes)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold">Zm8=</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Zm8</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-sans text-xs">2 bytes require 1 padding char (=)</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-sans font-semibold text-slate-800 dark:text-slate-200">&quot;foo&quot;</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">0x66 0x6F 0x6F (3 bytes)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold">Zm9v</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Zm9v</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-sans text-xs">Exact 3-byte multiple (no padding needed)</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-sans font-semibold text-slate-800 dark:text-slate-200">&quot;Hello, World!&quot;</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">13 bytes</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">SGVsbG8sIFdvcmxkIQ==</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">SGVsbG8sIFdvcmxkIQ</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-sans text-xs">13 mod 3 = 1 byte remaining (==)</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-sans font-semibold text-slate-800 dark:text-slate-200">&quot;café&quot; (Unicode)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">0x63 0x61 0x66 0xC3 0xA9 (5 bytes)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">Y2Fmw6k=</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Y2Fmw6k</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-sans text-xs">&apos;é&apos; expands to 2 UTF-8 bytes (C3 A9)</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-sans font-semibold text-slate-800 dark:text-slate-200">Binary [251, 255, 191]</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">0xFB 0xFF 0xBF (3 bytes)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold">+/+/</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">-_-_</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-sans text-xs">Demonstrates + &rarr; - and / &rarr; _</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Standard Base64 versus URL-Safe Base64 (Base64URL)
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        When Base64 is placed into web URLs, query strings, or HTTP headers, characters 62 (<code>+</code>) and 63 (<code>/</code>) create severe conflicts.
        In URL query strings, <code>+</code> is decoded as an ASCII space by web servers, while <code>/</code> is interpreted as a directory separator in file paths.
        To solve this, <strong>RFC 4648 Section 5</strong> introduced the <strong>Base64URL</strong> variant:
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-xs sm:text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Encoding Scheme</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Character Set (0–61)</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Index 62</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Index 63</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Padding (=)</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Primary Applications</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Standard Base64 (RFC 4648 §4)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">A–Z, a–z, 0–9</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">+ (plus)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">/ (slash)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">= (required)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">MIME email, PEM certs, Data URIs, XML feeds</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Base64URL (RFC 4648 §5)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">A–Z, a–z, 0–9</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">- (hyphen)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">_ (underscore)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Omitted / Optional</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">JWT tokens, OAuth state, URL slugs, filenames</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Data URI Anatomy &amp; Inline Asset Embedding (RFC 2397)
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        A <strong>Data URI</strong> allows you to embed binary media inline directly inside HTML documents, CSS stylesheets,
        or JSON responses using the standard RFC 2397 format:
      </p>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 mb-4 font-mono text-xs overflow-x-auto text-slate-800 dark:text-slate-200">
        data:[&lt;mediatype&gt;][;base64],&lt;data&gt;
      </div>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        For instance, an inline transparent 1×1 PNG pixel can be embedded in an <code>&lt;img&gt;</code> tag without triggering an external HTTP round-trip:
      </p>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 mb-6 font-mono text-xs overflow-x-auto text-blue-600 dark:text-blue-400">
        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=
      </div>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Common Developer Use Cases &amp; Practical Applications
      </h3>
      <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>JSON &amp; REST APIs:</strong> JSON does not natively support binary octet arrays. Binary images, files, or signatures are commonly transmitted within JSON payloads as Base64 strings.
        </li>
        <li>
          <strong>JWT (JSON Web Tokens, RFC 7519):</strong> JWT headers and claims payloads are encoded in URL-safe Base64URL without padding. Note: decoding a JWT inspects its claims, but does <em>not</em> cryptographically verify the signature.
        </li>
        <li>
          <strong>MIME &amp; SMTP Email (RFC 2045):</strong> Email attachments are encoded in Base64 wrapped strictly at 76 characters per line to comply with email protocol message limits.
        </li>
        <li>
          <strong>HTTP Basic Authentication (RFC 7617):</strong> Browsers encode credentials as <code>Authorization: Basic base64(username:password)</code>. Because Base64 is not encryption, this header is only secure when wrapped inside an encrypted HTTPS/TLS tunnel.
        </li>
        <li>
          <strong>X.509 Certificates &amp; PEM Keys:</strong> Cryptographic keys and certificates (such as <code>-----BEGIN CERTIFICATE-----</code>) encapsulate DER binary data inside Base64 blocks with 64-character line wrapping.
        </li>
      </ul>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Troubleshooting Common Base64 Errors &amp; Pitfalls
      </h3>
      <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-8">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">1. Why does my output contain trailing &apos;=&apos; signs?</h4>
          <p className="text-sm mt-1">
            Trailing equals signs are padding markers. If your input byte count is not evenly divisible by 3, the encoder appends <code>=</code> (for 2 remainder bytes) or <code>==</code> (for 1 remainder byte) so the total length is divisible by 4.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">2. Why does emoji or non-English text fail in some encoders?</h4>
          <p className="text-sm mt-1">
            Older tools rely directly on JavaScript&apos;s native <code>window.btoa()</code>, which throws an <code>InvalidCharacterError</code> when given characters outside Latin-1 (code points &gt; 255). KivaroTools passes all input through a WHATWG-compliant <code>TextEncoder</code>, converting characters to raw UTF-8 bytes first.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">3. Why is my decoded output unreadable or showing replacement characters?</h4>
          <p className="text-sm mt-1">
            If you decode a binary file (such as a PDF, JPEG, or ZIP archive) using Text Mode, the UTF-8 decoder cannot map arbitrary binary bytes to valid text characters. Use <strong>File Mode</strong> or <strong>Auto Detect</strong> to download the restored binary asset.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">4. What is the difference between Strict Validation and Tolerant Decoding?</h4>
          <p className="text-sm mt-1">
            Strict Mode (RFC 4648 §3.5) verifies that unused pad bits in the final sextet are strictly zero and rejects invalid characters. Tolerant Mode automatically cleans newlines, spaces, and tabs, normalizes Base64URL characters, and restores missing padding.
          </p>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <dl className="space-y-6 mb-8">
        {BASE64_FAQS.map((faq, index) => (
          <div key={index} className="border-b border-gray-100 dark:border-slate-800/80 pb-4 last:border-b-0">
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
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-3">
          Related Developer Utilities
        </h4>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link
            href="/developer/json-formatter"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            JSON Formatter &amp; Validator &rarr;
          </Link>
          <Link
            href="/developer/password-generator"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Password &amp; Hash Generator &rarr;
          </Link>
          <Link
            href="/developer/regex-tester"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Regex Tester &amp; Generator &rarr;
          </Link>
          <Link
            href="/seo/text-case-converter"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Text Case Converter &rarr;
          </Link>
          <Link
            href="/developer/json-converter"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            JSON to CSV / Excel &rarr;
          </Link>
          <Link
            href="/developer/sql-formatter"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            SQL Query Formatter &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}