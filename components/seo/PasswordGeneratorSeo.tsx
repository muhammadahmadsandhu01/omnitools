import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const PASSWORD_GENERATOR_FAQS: FaqItem[] = [
  {
    question: 'How does Cryptographically Secure Pseudorandom Number Generation (CSPRNG) differ from Math.random()?',
    answer:
      'Standard Math.random() uses deterministic pseudo-random algorithms (such as xoshiro128+) designed for speed, not security. An attacker observing past outputs can deduce internal state and predict future outputs. OmniTools uses the Web Cryptography API (crypto.getRandomValues), which sources entropy directly from the operating system kernel CSPRNG (such as Linux /dev/urandom or Windows BCryptGenRandom), ensuring cryptographically unpredictable outputs.',
  },
  {
    question: 'What is rejection sampling, and why is it necessary to eliminate modulo bias?',
    answer:
      'When mapping a 32-bit random integer (0 to 4,294,967,295) onto a pool of characters using simple modulo division (rand % poolLength), smaller numbers receive slightly higher probabilities if the pool length does not divide 2^32 evenly. OmniTools implements rejection sampling: values falling in the incomplete final bucket are discarded and resampled, guaranteeing mathematically uniform character distributions.',
  },
  {
    question: 'How is password entropy calculated mathematically?',
    answer:
      'Password entropy is measured in bits using Shannon entropy: E = L * log2(R), where L is password length and R is the character pool size. For example, a 16-character password chosen uniformly from 92 printable characters yields 16 * log2(92) = 104.37 bits of entropy, requiring approximately 2^103 brute-force guesses.',
  },
  {
    question: 'Why does NIST SP 800-63B recommend multi-word passphrases over complex short passwords?',
    answer:
      'The NIST Digital Identity Guidelines (SP 800-63B) emphasize length over forced character composition. Arbitrary complexity rules often lead users to predictable substitutions (such as replacing E with 3 or appending ! at the end). Multi-word passphrases (e.g. 5 or 6 random words) provide high mathematical entropy while remaining memorable and resistant to keyboard acoustic or shoulder-surfing attacks.',
  },
  {
    question: 'What is the fundamental difference between cryptographic hashing (SHA-256) and password encryption?',
    answer:
      'Encryption is a two-way function that scrambles data with a key so it can later be decrypted back to plaintext. A cryptographic hash (such as SHA-256 or SHA-512) is a one-way deterministic function that maps arbitrary data into a fixed-length fingerprint. Hashes cannot be reversed to reveal the original input; verification is achieved by hashing a candidate input and comparing the resulting digest.',
  },
  {
    question: 'Are my generated passwords, secrets, or file hashes saved or sent to a server?',
    answer:
      'No. All pseudorandom sampling, passphrase assembly, and cryptographic hashing (Web Cryptography API crypto.subtle.digest) execute purely within your browser client session. Generated credentials and file data are never transmitted over the network or saved to external storage.',
  },
];

export default function PasswordGeneratorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PASSWORD_GENERATOR_FAQS.map((faq) => ({
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
        Password Security &amp; Cryptography Guide: CSPRNG Entropy, NIST Standards &amp; Hashing
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Effective credential security relies on sound mathematical principles rather than arbitrary complexity rules.
        A password or cryptographic token is only as strong as its <strong>information entropy</strong>—the measure of
        unpredictability and brute-force search space. Weak pseudorandom generators or biased sampling undermine security
        even when passwords appear complex to human eyes.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        CSPRNG Generation &amp; Rejection Sampling Without Modulo Bias
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        OmniTools generates random characters and passphrases using the browser-native <strong>Web Cryptography API</strong>
        (<code className="text-xs">crypto.getRandomValues</code>). This interface taps into hardware entropy gathered by the underlying
        operating system kernel (such as Linux <code className="text-xs">/dev/urandom</code> or Windows CNG CryptoAPI).
      </p>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Furthermore, naive generators introduce <strong>modulo bias</strong> when scaling large integers down to smaller pool sizes.
        OmniTools applies strict <strong>rejection sampling</strong>: any generated 32-bit integer falling in the incomplete upper range
        (<code className="text-xs">2^32 - (2^32 % poolSize)</code>) is discarded and re-drawn, ensuring every character in your pool
        has an identical probability of selection.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Password Entropy Mathematical Formulas &amp; Strength Tiers
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Shannon entropy is calculated by multiplying character count by the logarithm base-2 of the pool size:
      </p>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 mb-4 font-mono text-xs overflow-x-auto text-blue-600 dark:text-blue-400">
        E = L * log2(R)
      </div>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Where <code className="text-xs">L</code> is password length and <code className="text-xs">R</code> is the character pool size:
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Entropy Level</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Bits of Entropy</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Brute Force Search Space</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-red-600 dark:text-red-400">Weak</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">&lt; 40 bits</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">&lt; 10^12 combinations</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Vulnerable to instant offline cracking via standard GPUs</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">Moderate</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">40–60 bits</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">10^12 to 10^18 combinations</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Acceptable for low-risk casual accounts with rate-limiting</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Strong</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">60–80 bits</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">10^18 to 10^24 combinations</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Recommended baseline for personal email and banking logins</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">Very Strong</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">&gt; 80 bits</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">&gt; 10^24 combinations</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Required for root servers, master password managers, and API secrets</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        NIST SP 800-63B Guidelines &amp; Multi-Word Passphrases
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        In its <em>Digital Identity Guidelines (Special Publication 800-63B)</em>, the <strong>National Institute of Standards and Technology (NIST)</strong>
        discourages legacy complexity rules that force users to include special symbols or change passwords every 90 days.
        Instead, NIST advocates for <strong>longer, memorable passphrases</strong>.
      </p>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        OmniTools includes a dedicated Passphrase Generator using a curated 1,024-word dictionary. Because each word is sampled uniformly,
        every word delivers exactly <code className="text-xs">log2(1024) = 10.0 bits</code> of theoretical entropy:
      </p>
      <ul className="list-disc space-y-1 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li><strong>4 words:</strong> 40 bits of entropy</li>
        <li><strong>5 words:</strong> 50 bits of entropy</li>
        <li><strong>6 words:</strong> 60 bits of entropy (strong everyday threshold)</li>
        <li><strong>7 words:</strong> 70 bits of entropy (high-security recommendation)</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Cryptographic Hashing &amp; Checksums
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Beyond password generation, the tool computes cryptographic digests client-side using the native
        <code className="text-xs">crypto.subtle.digest</code> API for modern algorithms:
      </p>
      <ul className="list-disc space-y-1 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li><strong>SHA-256 (256-bit):</strong> FIPS 180-4 standard used in Bitcoin, TLS certificates, and modern authentication tokens.</li>
        <li><strong>SHA-512 (512-bit):</strong> High-security variant optimal for 64-bit architectures.</li>
        <li><strong>SHA-1 &amp; MD5:</strong> Provided strictly for legacy file checksum and integrity verification against legacy repositories.</li>
      </ul>

      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <dl className="space-y-6 mb-6">
        {PASSWORD_GENERATOR_FAQS.map((faq, index) => (
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
            href="/developer/base64-encoder"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Base64 Encoder &amp; Decoder &rarr;
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
            href="/developer/json-formatter"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            JSON Formatter &amp; Validator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/developer/sql-formatter"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            SQL Query Formatter &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}