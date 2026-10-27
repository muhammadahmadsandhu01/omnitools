import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const PASSWORD_GENERATOR_FAQS: FaqItem[] = [
  {
    question: 'How does KivaroTools generate cryptographically secure passwords and secrets?',
    answer:
      'KivaroTools uses the standard Web Cryptography API (window.crypto.getRandomValues) implemented in modern browser engines (V8, JavaScriptCore, SpiderMonkey). Unlike pseudo-random generators like Math.random() that rely on predictable linear congruential algorithms, crypto.getRandomValues interfaces directly with OS-level entropy pools (/dev/urandom on Linux/macOS or CryptGenRandom / BCryptGenRandom on Windows) to generate cryptographically unpredictable bytes.',
  },
  {
    question: 'What is modulo bias and how does rejection sampling eliminate it?',
    answer:
      'Modulo bias is a subtle mathematical flaw in naive random generators where mapping random 32-bit unsigned integers to an alphabet length that does not divide 2^32 evenly creates a non-uniform distribution, biasing certain characters over others. KivaroTools implements rejection sampling: random numbers that fall into the biased remainder zone are discarded and re-drawn, mathematically guaranteeing true uniform probability across all permitted characters.',
  },
  {
    question: 'How is Shannon entropy in bits calculated for passwords and passphrases?',
    answer:
      'Shannon entropy measures the uncertainty or unpredictability of a credential. For random character passwords, entropy is calculated using H = L × log2(R), where L is password length and R is character pool size (e.g., 94 for full ASCII). For passphrases, entropy is calculated using our curated 1,024-word dictionary (10 bits/word, plus ~13.29 bits when the 4-digit number suffix is enabled). A 5-word passphrase with numbers yields ~63.3 bits of true entropy.',
  },
  {
    question: 'Are generated passwords, secrets, or file checksums ever sent over a network?',
    answer:
      'No. All cryptographic generation, Shannon entropy calculation, HMAC hashing, constant-time comparison, and streaming checksum calculation execute 100% locally in your browser memory. Zero credentials, hashes, or file bytes are ever uploaded to any backend server, telemetry endpoint, or external database.',
  },
  {
    question: 'How does the Have I Been Pwned breach check protect privacy using k-Anonymity?',
    answer:
      'The breach checker uses the mathematical k-Anonymity model designed by Troy Hunt and Cloudflare. The password is first hashed locally with SHA-1. Only the first 5 hexadecimal characters of the hash are queried against https://api.pwnedpasswords.com/range/{prefix} with the "Add-Padding: true" header. The API returns a list of matching hash suffixes, and KivaroTools searches that list locally in your browser. The full hash and plaintext password never leave your machine.',
  },
  {
    question: 'What is constant-time comparison in the hash comparison module and why is it needed?',
    answer:
      'Standard string comparison operators (like === or strcmp) terminate early upon finding the first differing character. Attackers can measure tiny variations in execution time (timing attacks) to guess credentials character-by-character. KivaroTools implements bitwise XOR constant-time comparison (cryptoConstantTimeCompare), evaluating every byte identically regardless of match position to eliminate timing side-channels.',
  },
  {
    question: 'What secret formats and byte lengths are supported in the Developer Secret Generator?',
    answer:
      'The Developer Secret Generator produces production-ready tokens in Hexadecimal, Standard Base64, URL-Safe Base64URL, and RFC 4122 UUID v4 formats. You can generate keys from 16 bytes (128-bit) up to 64 bytes (512-bit), ideal for NextAuth secrets, JWT HS256/HS512 signing keys, AES-256 encryption keys, Django secret_key, and Rails secret_key_base.',
  },
  {
    question: 'How does the 1 GB file integrity checksum generator work without freezing the browser?',
    answer:
      'Computing SHA-256 or SHA-512 hashes for large files can easily exceed browser memory limits. KivaroTools uses a chunked streaming reader inside a dedicated Web Worker, processing files in 64 KB slices via crypto.subtle.digest. It comfortably hashes files up to 1 GB (1,024 MB) with a real-time progress bar while keeping the main browser UI completely responsive.',
  },
  {
    question: 'Why are EFF multi-word passphrases considered superior to traditional passwords?',
    answer:
      'Short passwords with random punctuation are difficult for humans to remember and prone to insecure habits like writing them on sticky notes. Diceware passphrases made of 4 to 8 randomized words (e.g. "correct-horse-battery-staple") offer immense entropy against brute-force attacks while remaining effortless for human brains to recall without cognitive strain.',
  },
  {
    question: 'What are ambiguous characters and why should I exclude them?',
    answer:
      'Ambiguous characters are lookalike glyphs that are visually indistinguishable in standard monospace fonts (such as 0, O, o, 1, I, l, |, and `). Excluding ambiguous characters eliminates costly user authentication errors, server CLI typos, and customer support confusion when credentials must be manually transcribed.',
  },
  {
    question: 'Can I generate bulk passwords and export them at once?',
    answer:
      'Yes. KivaroTools includes a Bulk Generator option allowing you to generate 5, 10, 20, or 50 independent passwords simultaneously with a single click. You can copy individual items or use "Copy All" to export the entire list for staging database seeding or team credential provisioning.',
  },
  {
    question: 'What is HMAC and how does the keyed hash generator work?',
    answer:
      'A Hash-based Message Authentication Code (HMAC) combines a cryptographic hash function (such as SHA-256 or SHA-512) with a secret cryptographic key. It verifies both data integrity and authentication authenticity. KivaroTools lets you input any secret key and message (up to 8 MB) to instantly generate verified HMAC digests for webhook signatures (e.g. Stripe, GitHub, Shopify).',
  },
  {
    question: 'What password strength threshold does NIST SP 800-63B recommend?',
    answer:
      'NIST Special Publication 800-63B guidelines emphasize password length over complex arbitrary composition rules. A minimum length of 16 characters or a 5-to-6 word passphrase with at least 64 to 80 bits of Shannon entropy provides robust resistance against offline brute-force cracking using modern GPU clusters.',
  },
  {
    question: 'What hashing algorithms are supported in the text and file hash modules?',
    answer:
      'KivaroTools supports SHA-256, SHA-384, SHA-512, SHA-1, and MD5 for text hashing and HMAC calculation, and SHA-256, SHA-384, and SHA-512 for streaming file integrity checksum verification.',
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
            name: 'How to Generate Cryptographically Secure Passwords & Diceware Passphrases Online',
            description: 'Step-by-step guide to generating CSPRNG random passwords, EFF Diceware passphrases, and PIN codes with real-time Shannon & NIST entropy auditing.',
            step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Select Password Mode (Random, Passphrase, or PIN)',
        text: 'Choose Character Password mode for high-density strings, Diceware Passphrase mode for memorable multi-word phrases, or cryptographic PIN mode.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Configure Length & Character Sets',
        text: 'Set password length (4 to 128 characters) and toggle uppercase, lowercase, numbers, and custom symbols, or exclude ambiguous look-alike characters (0/O, 1/l/I).',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Verify Cryptographic Entropy & Crack-Time Resistance',
        text: 'Check the real-time entropy score (in bits) and offline GPU/ASIC brute-force crack-time estimates.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Copy Single Password or Bulk Generate',
        text: 'Copy your generated password with one click or generate up to 50 unique CSPRNG passwords in bulk for team or infrastructure rotation.',
      }
            ],
          }),
        }}
      />

      <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
        {/* Zone 2: Deep-Dive Architecture & Engine Sections */}
        <section aria-labelledby="password-generator-architecture" className="mb-8">
          <h2 id="password-generator-architecture" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Cryptographic Foundations: CSPRNG, Zero Modulo Bias &amp; Web Crypto API
          </h2>
          <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
            <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
              <strong>Zero-Trust Cryptographic Security:</strong> All random numbers, secrets, HMAC tokens, and file hashes are generated 100% client-side via the browser Web Crypto API. No generated strings, keys, or hashes are ever logged or transmitted over a network.
            </p>
          </blockquote>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Generating production credentials requires mathematical randomness. Most web applications and simple online generators mistakenly rely on JavaScript&apos;s native <code>Math.random()</code>, which utilizes a pseudo-random number generator (such as the xoshiro128+ or v8:MathRandom PRNG). PRNGs are deterministic and susceptible to state-recovery attacks, rendering them completely unsuitable for cryptographic keys, authentication tokens, or enterprise passwords.
          </p>
          <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
            KivaroTools exclusively leverages the <strong>Web Cryptography API</strong> (<code>window.crypto.getRandomValues</code> and <code>crypto.subtle.digest</code>), interfacing directly with operating system entropy seeds (Linux/macOS <code>/dev/urandom</code>, Windows <code>BCryptGenRandom</code>).
          </p>

          <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Eliminating Modulo Bias with Rejection Sampling
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            When mapping a 32-bit unsigned random integer (0 to 4,294,967,295) to an arbitrary character set (e.g. 62 alphanumeric characters), using the modulo operator (<code>rand % 62</code>) introduces <strong>modulo bias</strong>. Because 4,294,967,296 is not evenly divisible by 62, the first remainder values have a slightly higher probability of being chosen. KivaroTools implements <strong>rejection sampling</strong>: integers falling in the excess remainder window are rejected and regenerated, guaranteeing perfectly uniform probability across every selected character.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Shannon Entropy &amp; Real-Time Strength Meter
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Unlike deceptive visual strength bars that merely check for character classes, KivaroTools calculates mathematical <strong>Shannon entropy</strong> in bits:
          </p>
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-5 border border-slate-200 dark:border-slate-700 mb-6 text-center font-mono text-sm sm:text-base text-slate-900 dark:text-slate-100">
            H = L × log<sub>2</sub>(R) &nbsp;|&nbsp; Passphrase: H = W × log<sub>2</sub>(1024) = W × 10.0 bits (+ 13.29 bits with number)
          </div>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Where <code>L</code> is character length, <code>R</code> is character pool size, and <code>W</code> is the number of randomized words chosen from our curated 1,024-word dictionary (10 bits/word, plus ~13.29 bits when the 4-digit number suffix is enabled). An entropy score above <strong>128 bits</strong> guarantees resistance against multi-billion guess-per-second GPU brute-force attacks for decades.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            1 GB Streaming File Checksum Engine via Web Workers
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Verifying software installer binaries, ISO images, or database dumps requires high-throughput hashing. KivaroTools executes SHA-256, SHA-384, and SHA-512 streaming file hashing inside a background <strong>Web Worker</strong>. By reading files in progressive 64 KB chunks, it hashes files up to <strong>1 GB (1,024 MB)</strong> without exhausting browser memory or causing tab crashes.
          </p>
        </section>

        {/* Zone 3: Interactive Feature & Use-Case Grid */}
        <section aria-labelledby="password-generator-modules" className="mb-8">
          <h2 id="password-generator-modules" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            6 Specialized Cryptographic Modules in One Workbench
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                1. Password &amp; Memorable Passphrase Generator
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Generate random passwords up to 128 characters with granular character toggles, ambiguous character exclusion (0, O, 1, I, l), and EFF Diceware passphrases (3–10 words) with customizable separators.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                2. Developer Secret &amp; API Token Generator
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Create cryptographically secure secrets in Hexadecimal, Base64, URL-Safe Base64URL, and UUID v4 from 16 bytes (128-bit) to 64 bytes (512-bit) for NextAuth, JWT, Django, and Rails keys.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                3. Text Hash &amp; Keyed HMAC Generator
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Compute SHA-256, SHA-384, SHA-512, SHA-1, and MD5 digests across text inputs up to 8 MB. Toggle HMAC mode to generate keyed authentication signatures for webhooks and API requests.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                4. 1 GB Streaming File Integrity Checksum
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Verify downloaded OS binaries, container images, and software packages up to 1,024 MB using progressive SHA-256, SHA-384, or SHA-512 streaming hash calculation with live progress tracking.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                5. Constant-Time Hash Comparison
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Compare two cryptographic hashes using a constant-time bitwise XOR equality check (<code>cryptoConstantTimeCompare</code>) to prevent timing side-channel attacks during security audits.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
                6. Local Heuristic &amp; k-Anonymity Breach Checker
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Detect repeated characters, keyboard walks (qwerty), dictionary words, and run zero-knowledge Have I Been Pwned checks using 5-character SHA-1 prefixes with zero credential leakage.
              </p>
            </div>
          </div>
        </section>

        {/* Zone 4: Technical Specification & Comparison Matrices */}
        <section aria-labelledby="password-generator-strength-matrix" className="mb-8">
          <h2 id="password-generator-strength-matrix" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Technical Specification: Entropy, Crack Times &amp; Security Ratings
          </h2>
          <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
            <table className="min-w-[640px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Format / Length</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Character Pool</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Entropy</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Crack Time (100B guesses/sec)</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Recommended Use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">12 Characters</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Letters + Numbers (62)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">~71 bits</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">~1.5 hours</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Low-risk throwaway accounts</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">16 Characters</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Full ASCII (94)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">~104 bits</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">~6.4 million years</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Standard user accounts &amp; logins</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">5-Word Passphrase</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">EFF Wordlist (7,776)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">~64.6 bits</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">~8.8 years</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Memorable user login credentials</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">6-Word Passphrase</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">EFF Wordlist (7,776)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">~77.5 bits</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">~68,000 years</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Master passwords &amp; disk encryption</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">32-Byte Secret</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Base64 / Hex (256-bit)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">256 bits</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Exceeds age of universe</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">API keys, NextAuth, JWT HS256</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Zone 5: Developer Troubleshooting & Error Reference */}
        <section aria-labelledby="password-generator-troubleshooting" className="mb-8">
          <h2 id="password-generator-troubleshooting" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Common Password &amp; Secret Configuration Pitfalls
          </h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Database Connection URLs Break Due to Unencoded Symbols
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cause:</strong> Including special characters like <code>@</code>, <code>:</code>, <code>/</code>, <code>#</code>, or <code>?</code> in passwords used inside database connection strings (e.g. <code>postgres://user:pass@host/db</code>) causes URI parser syntax errors.
                <br />
                <strong>Fix:</strong> Generate alphanumeric passwords or use URL-Safe Base64URL secrets when configuring database environment variables.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                JWT Signing Key Length Too Short (HS256 Secret Errors)
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cause:</strong> RFC 7518 specifies that HMAC-SHA256 signing keys must be at least 256 bits (32 bytes). Using shorter strings causes authentication libraries to throw runtime warnings or reject tokens.
                <br />
                <strong>Fix:</strong> In the Developer Secret module, select the <strong>32 bytes (256-bit)</strong> preset in Hexadecimal or Base64URL format.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Bash History &amp; CLI Leaks when Using OpenSSL
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cause:</strong> Running commands like <code>openssl rand -base64 32</code> inside terminal shells records the command or generated output in local <code>.bash_history</code> logs.
                <br />
                <strong>Fix:</strong> Use KivaroTools in-browser secret generator with zero server upload to generate and copy production secrets directly to your clipboard.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Ambiguous Characters Cause Mobile Login Failures
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cause:</strong> Passwords containing lookalike characters (such as digit <code>0</code> vs capital letter <code>O</code>, or lowercase <code>l</code> vs digit <code>1</code>) trigger user frustration during manual entry.
                <br />
                <strong>Fix:</strong> Enable the <strong>Exclude Ambiguous Characters</strong> toggle to strip lookalikes from the character generation pool.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Timing Attack Vulnerability in Hash Comparison
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cause:</strong> Using standard equality checks (<code>hash1 === hash2</code>) allows side-channel analysis based on how quickly the comparison returns false.
                <br />
                <strong>Fix:</strong> Use our <strong>Constant-Time Hash Comparison</strong> module, which compares every byte using bitwise XOR operations regardless of character mismatch location.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                Browser Memory Exhaustion During Large File Hashing
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Cause:</strong> Attempting to load multi-gigabyte ISOs or video files into a single in-memory Uint8Array crashes the browser tab.
                <br />
                <strong>Fix:</strong> KivaroTools uses chunked FileReader streaming inside a Web Worker to hash files up to 1 GB sequentially in 64 KB slices.
              </p>
            </div>
          </div>
        </section>

        {/* Zone 6: Frequently Asked Questions */}
        <section aria-labelledby="password-generator-frequently-asked-questions" className="mb-8">
          <h2 id="password-generator-frequently-asked-questions" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {PASSWORD_GENERATOR_FAQS.map((faq, index) => (
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
        <section aria-labelledby="password-generator-related-utilities" className="mb-8">
          <h2 id="password-generator-related-utilities" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Related Client-Side Developer Workflows
          </h2>
          <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-sm">
            Explore companion utilities for security engineering and full-stack development:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>
              <Link href="/developer/base64-encoder" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Base64 Encoder &amp; Decoder
              </Link>{' '}
              — Encode tokens into URL-safe Base64URL strings or decode JWT headers and SAML assertions client-side.
            </li>
            <li>
              <Link href="/developer/regex-tester" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Regex Tester &amp; Code Generator
              </Link>{' '}
              — Test password validation regexes and strong policy lookaheads with live match feedback.
            </li>
            <li>
              <Link href="/developer/json-formatter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                JSON Formatter, Validator &amp; Tree Viewer
              </Link>{' '}
              — Safely inspect API tokens and confidential JSON payloads without remote server logging.
            </li>
            <li>
              <Link href="/developer/sql-formatter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                SQL Query Formatter &amp; Linter
              </Link>{' '}
              — Format database migration scripts and SQL queries across 19 dialects with zero query tracking.
            </li>
            <li>
              <Link href="/developer/json-converter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                JSON to CSV &amp; Excel Converter
              </Link>{' '}
              — Flatten nested JSON data with built-in formula injection defense for enterprise security.
            </li>
            <li>
              <Link href="/developer/svg-optimizer" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                SVG Optimizer &amp; Cleaner
              </Link>{' '}
              — Sanitize vector graphics, remove XSS scripts, and minify SVG markup with sandboxed previewing.
            </li>
          </ul>
        </section>
      </article>
    </>
  );
}