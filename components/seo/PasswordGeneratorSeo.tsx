import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const PASSWORD_GENERATOR_FAQS: FaqItem[] = [
  {
    question: 'How does Cryptographically Secure Pseudorandom Number Generation (CSPRNG) differ from Math.random()?',
    answer:
      'Standard Math.random() relies on deterministic pseudorandom algorithms (such as xoshiro128+ in modern JavaScript engines) engineered for rapid execution in non-security contexts like simulations and gaming. Because these algorithms maintain small internal states, an adversary who observes past outputs can deduce future values. In contrast, OmniTools uses the browser-native Web Cryptography API (crypto.getRandomValues), which sources entropy directly from the host operating system kernel (e.g., Linux /dev/urandom or Windows BCryptGenRandom/CNG), guaranteeing cryptographically unpredictable outputs.',
  },
  {
    question: 'What is rejection sampling, and why is it necessary to eliminate modulo bias?',
    answer:
      'When mapping a 32-bit unsigned random integer (0 to 4,294,967,295) onto an arbitrary character pool of size N using standard modulo division (rand % N), numbers in the incomplete final bucket receive slightly higher probability of selection whenever N does not evenly divide 2^32. OmniTools eliminates modulo bias through strict rejection sampling: any 32-bit random integer equal to or greater than 2^32 - (2^32 % N) is discarded and resampled, ensuring every character in your chosen pool has a mathematically identical selection probability.',
  },
  {
    question: 'How is password entropy calculated mathematically?',
    answer:
      'Password entropy is quantified in bits using Shannon information entropy. For character passwords, E = L * log2(R), where L is length and R is the active pool size. For passphrases of W words sampled without replacement from an N-word dictionary, the ordered permutation keyspace is P(N, W) = N! / (N - W)!, giving entropy E = sum(log2(N - i)) for i = 0 to W - 1. If a 4-digit suffix (0000–9999) is appended, it adds log2(10000) ≈ 13.29 bits. Theoretical entropy measures the mathematical keyspace size under uniform random generation; it is not a guaranteed real-world crack-time estimate, which depends on offline vs online rate limits, GPU cluster capabilities, dictionary attack heuristics, and the specific key derivation function used (e.g. Argon2id vs fast unsalted digests).',
  },
  {
    question: 'Why does NIST SP 800-63B recommend multi-word passphrases over complex short passwords?',
    answer:
      'The National Institute of Standards and Technology (NIST) Digital Identity Guidelines (SP 800-63B Rev. 4) emphasize that length provides exponential security gains, whereas forced character composition rules (such as mandating one symbol and one digit) lead users to predictable substitutions (e.g., replacing E with 3 or appending !1 at the end). Multi-word passphrases (e.g., 5 or 6 random dictionary words) deliver high mathematical entropy while remaining human-memorable and resilient against shoulder-surfing and keyboard-walk attacks.',
  },
  {
    question: 'Why do some websites and legacy systems reject passwords containing certain symbols?',
    answer:
      'Certain legacy web applications and enterprise backends pass credentials into SQL queries, LDAP directories, or shell commands without adequate parameterization. To prevent command injection or database syntax errors, these systems restrict symbols like quotes, ampersands, semicolons, or angle brackets (<, >, \', ", &). OmniTools allows you to disable symbol inclusion or exclude ambiguous characters to satisfy restrictive platform requirements.',
  },
  {
    question: 'Are my generated passwords, secrets, or file hashes saved or sent to a server?',
    answer:
      'No. All pseudorandom sampling, passphrase generation, developer secret creation, and cryptographic hashing (Web Cryptography API crypto.subtle.digest) execute 100% locally within your browser client session. Generated credentials are never transmitted over the network, saved to external databases, or written to browser storage.',
  },
  {
    question: 'Why is reusing passwords across different online accounts extremely dangerous?',
    answer:
      'When an online service suffers a data breach, cybercriminals extract credential tables and launch automated credential stuffing attacks across thousands of popular websites (banking, email, social media, shopping). If you reuse the same password across multiple services, a single compromised platform grants attackers access to your entire digital identity. Every distinct account must possess a unique, cryptographically random password.',
  },
  {
    question: 'What is the fundamental difference between cryptographic hashing (SHA-256) and password encryption?',
    answer:
      'Encryption is a two-way mathematical process that scrambles plaintext using a cryptographic key so it can later be decrypted back to its original form. Cryptographic hashing (such as SHA-256 or SHA-512) is a one-way deterministic function that maps arbitrary input data into a fixed-length fingerprint that cannot be reversed. Fast cryptographic hashes are intended for data integrity and signatures; for storing passwords, systems must use dedicated, memory-hard key derivation functions like Argon2id or bcrypt.',
  },
  {
    question: 'How does the local heuristic vulnerability analyzer evaluate password strength without sending data to servers?',
    answer:
      'The heuristic analyzer evaluates candidate passwords locally in your browser memory using regular expressions, Shannon information entropy formulas, and a curated set of known keyboard walks, sequential characters, and common weak passwords. All checks execute entirely within the client session without transmitting credentials or queries over the network.',
  },
  {
    question: 'Can I generate passwords in bulk or create developer API tokens?',
    answer:
      'Yes. OmniTools includes a built-in Bulk Password Generator supporting batches of 5, 10, 20, or 50 passwords with one-click "Copy All" and individual copy buttons. Additionally, the Developer Secret Generator produces cryptographically secure Hex keys, Base64 tokens, Base64URL strings (for JWTs and OAuth), and RFC 4122 v4 UUIDs with proper version and variant bits.',
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
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 md:p-12 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-sm">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Password Security &amp; Cryptography Guide: CSPRNG Entropy, NIST Standards &amp; Hashing
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Modern credential security depends on sound information-theoretic principles rather than arbitrary complexity rules.
        A password, cryptographic token, or master passphrase is only as strong as its <strong>information entropy</strong>—the
        measure of unpredictability and mathematical search space. Weak pseudorandom generators or biased sampling undermine security
        even when passwords appear complex to human eyes.
      </p>

      {/* STEP BY STEP USAGE INSTRUCTIONS */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How to Use the OmniTools Password Generator (Step-by-Step)
      </h3>
      <ol className="list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Choose Your Mode:</strong> Select <em>Random Characters</em> for high-security accounts, API tokens, and service credentials, or <em>Memorable Passphrase</em> for master passwords, Wi-Fi networks, and credentials requiring frequent manual typing.
        </li>
        <li>
          <strong>Select Password Length:</strong> Use the interactive slider or click a quick preset (12, 16, 20, 24, 32, or 64). Industry standards recommend a minimum of <strong>16 to 20 characters</strong> for general online accounts.
        </li>
        <li>
          <strong>Configure Character Classes:</strong> Enable or disable uppercase letters (A–Z), lowercase letters (a–z), numbers (0–9), and symbols (!@#$). Enable <em>Exclude Ambiguous</em> if you need to visually read and retype the password without confusing characters like <code>0/O</code> or <code>1/l/I</code>.
        </li>
        <li>
          <strong>Generate &amp; Review:</strong> Click <em>Generate New</em>. Inspect the real-time Shannon entropy meter and heuristic strength rating.
        </li>
        <li>
          <strong>Copy Securely:</strong> Click the copy button to transfer the credential to your operating system clipboard, paste it immediately into your encrypted password manager vault, and clear session history.
        </li>
      </ol>

      {/* CSPRNG & REJECTION SAMPLING */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        CSPRNG Generation &amp; Rejection Sampling Without Modulo Bias
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        OmniTools generates random characters and passphrases using the browser-native <strong>Web Cryptography API</strong>{' '}
        (<code className="text-xs font-mono">crypto.getRandomValues</code>). This interface taps into hardware entropy gathered by the underlying
        operating system kernel (such as Linux <code className="text-xs font-mono">/dev/urandom</code> or Windows CNG CryptoAPI).
      </p>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Furthermore, naive generators introduce <strong>modulo bias</strong> when scaling large random integers down to smaller pool sizes.
        OmniTools applies strict <strong>rejection sampling</strong>: any generated 32-bit unsigned integer falling in the incomplete upper range
        (<code className="text-xs font-mono">2^32 - (2^32 % poolSize)</code>) is discarded and re-drawn, ensuring every character in your pool
        has an identical probability of selection.
      </p>

      {/* SHANNON ENTROPY */}
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
        Where <code className="text-xs font-mono">L</code> is password length and <code className="text-xs font-mono">R</code> is the character pool size:
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
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">Fair</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">40–59 bits</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">10^12 to 10^18 combinations</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Acceptable for low-risk casual accounts with rate-limiting</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">Strong</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">60–79 bits</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">10^18 to 10^24 combinations</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Recommended baseline for personal email and banking logins</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">Very Strong</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">&ge; 80 bits</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">&gt; 10^24 combinations</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Required for root servers, master password managers, and API secrets</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* NIST SP 800-63B GUIDANCE */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        NIST SP 800-63B Guidelines &amp; Multi-Word Passphrases
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        In its <em>Digital Identity Guidelines (Special Publication 800-63B Rev. 4)</em>, the <strong>National Institute of Standards and Technology (NIST)</strong>
        discourages legacy complexity rules that force users to include special symbols or change passwords every 90 days.
        Instead, NIST advocates for <strong>longer, memorable passphrases</strong> and backend screening against known breach databases.
      </p>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        OmniTools includes a dedicated Passphrase Generator using a curated 1,024-word English dictionary. Because an ordered sequence of <code className="text-xs font-mono">W</code> words is sampled uniformly without replacement, the total permutation search space is <code className="text-xs font-mono">P(1024, W) = 1024! / (1024 - W)!</code>, yielding exact Shannon entropy <code className="text-xs font-mono">sum(log2(1024 - i))</code>:
      </p>
      <ul className="list-disc space-y-1 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li><strong>3 words:</strong> ~30 bits dictionary entropy (~43 bits with 4-digit number)</li>
        <li><strong>4 words:</strong> ~40 bits dictionary entropy (~53 bits with 4-digit number)</li>
        <li><strong>5 words:</strong> ~50 bits dictionary entropy (~63 bits with 4-digit number, default)</li>
        <li><strong>6 words:</strong> ~60 bits dictionary entropy (~73 bits with 4-digit number, master password baseline)</li>
        <li><strong>7 words:</strong> ~70 bits dictionary entropy (~83 bits with 4-digit number)</li>
        <li><strong>8 words:</strong> ~80 bits dictionary entropy (~93 bits with 4-digit number, disk encryption tier)</li>
      </ul>
      <p className="mb-6 leading-relaxed text-xs text-slate-500 dark:text-slate-400">
        Appending a 4-digit suffix adds <code className="text-xs font-mono">log2(10000) ≈ 13.29 bits</code>. Deterministic transformations (capitalization and separator symbols) add zero bits of random entropy. Theoretical entropy measures search space size and is not an absolute real-world crack-time guarantee.
      </p>

      {/* CREDENTIAL REUSE & ZERO LEAKAGE */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Credential Stuffing Defense &amp; Client-Side Zero-Leakage Privacy
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        When online databases are breached, attackers extract compromised username and password combinations and test them
        against banking portals, email providers, and corporate VPNs in automated <strong>credential stuffing</strong> campaigns.
        Reusing even a complex 25-character password across two websites exposes both services if one is compromised.
      </p>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        To protect user confidentiality, OmniTools enforces a strict <strong>zero-leakage architecture</strong>: password generation,
        secret token assembly, and cryptographic hashing take place entirely within your browser&rsquo;s JavaScript runtime.
        Freshly generated credentials are never sent to external servers, logged in telemetry, or stored in browser storage.
      </p>

      {/* CRYPTOGRAPHIC HASHING */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Cryptographic Hashing, HMAC &amp; File Checksums
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Beyond password generation, the tool computes cryptographic digests client-side using the native
        <code className="text-xs font-mono">crypto.subtle.digest</code> API for modern algorithms:
      </p>
      <ul className="list-disc space-y-1 pl-5 text-slate-600 dark:text-slate-400 mb-6">
        <li><strong>SHA-256 (256-bit):</strong> FIPS 180-4 standard used in Bitcoin, TLS certificates, and modern authentication tokens.</li>
        <li><strong>SHA-512 (512-bit):</strong> High-security variant optimal for 64-bit architectures and high-throughput hashing.</li>
        <li><strong>SHA-1 &amp; MD5:</strong> Provided strictly for legacy file checksum and integrity verification against historic repositories.</li>
      </ul>

      {/* FAQ SECTION */}
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

      {/* RELATED DEVELOPER UTILITIES */}
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