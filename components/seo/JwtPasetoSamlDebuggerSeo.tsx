import React from 'react';
import Link from 'next/link';
import {
    ShieldCheck,
    Sparkles,
    Layers,
    Cpu,
    Terminal,
    HelpCircle,
    AlertTriangle,
    Search,
    Code2,
    ArrowRightLeft,
} from 'lucide-react';

export interface JwtPasetoSamlFaqItem {
    question: string;
    answer: string;
}

export const JWT_PASETO_SAML_FAQS: JwtPasetoSamlFaqItem[] = [
    {
        question: 'Are my JWTs, PASETO tokens, SAML 2.0 assertions, or cryptographic keys uploaded to any server?',
        answer:
            'No. All Base64URL and RFC 1951 DEFLATE decoding, RFC 2104 HMAC-SHA256/384/512 verification, 65-password weak secret dictionary auditing, PASETO LE64 Pre-Authentication Encoding (PAE) framing, 5-part JWE decryption, SAML 2.0 XML Signature Wrapping (XSW) linting, and Excel/CSV exports execute 100% locally inside your browser memory. Your tokens and keys never leave your device.',
    },
    {
        question: 'How does PASETO (v1–v4) eliminate JWT algorithm confusion and "alg: none" vulnerabilities?',
        answer:
            'In a standard JWT (RFC 7515), the signing algorithm is declared inside the untrusted token header ("alg": "RS256" or "HS256" or "none"), which historically led to signature bypasses when verifiers trusted the header algorithm. PASETO (Platform-Agnostic Security Tokens) removes in-band algorithm negotiation completely: a token header such as "v4.public." or "v4.local." locks the cryptographic suite (Ed25519 or XChaCha20 + BLAKE2b-MAC) and binds the header, payload, footer, and optional Implicit Assertion inside a 64-bit Little-Endian length-prefixed Pre-Authentication Encoding (PAE) buffer.',
    },
    {
        question: 'What is the difference between a 3-part JWS and a 5-part JWE token?',
        answer:
            'A 3-part JWT is a JSON Web Signature (JWS, RFC 7515) structured as Header.Payload.Signature—its payload is Base64URL-encoded and readable by anyone, though integrity-protected. A 5-part JWT is a JSON Web Encryption (JWE, RFC 7516) token structured as ProtectedHeader.EncryptedKey.IV.Ciphertext.AuthenticationTag, where the claims payload is encrypted (e.g., via A256GCM) and authenticated with a 96-bit Initialization Vector and a 128-bit GCM Authentication Tag.',
    },
    {
        question: 'Why is a SAMLRequest unreadable when I only Base64-decode it?',
        answer:
            'In OASIS SAML 2.0, messages sent via the HTTP-POST binding (typically <samlp:Response>) are Base64-encoded UTF-8 XML. However, messages sent via the HTTP-Redirect binding (typically <samlp:AuthnRequest> and <samlp:LogoutRequest> inside URL query parameters) are compressed using Raw RFC 1951 DEFLATE (without zlib headers) BEFORE Base64 and URL encoding. Our engine automatically detects the binding, URL-decodes, Base64-decodes, and inflates the raw Deflate stream.',
    },
    {
        question: 'What is a SAML 2.0 XML Signature Wrapping (XSW1–XSW8) attack and how does the linter detect it?',
        answer:
            'XML Signature Wrapping (XSW) exploits a discrepancy between the XML-DSig verification module and the application’s XPath/DOM claim extractor. An attacker intercepts a legitimately signed <saml:Assertion ID="_legit">, moves or copies it, and injects an unsigned forged <saml:Assertion ID="_evil"> with admin privileges. The signature verifier checks Reference URI="#_legit" and passes, while the application reads the first <Assertion> in the document. Rule 12 (SAML-XSW-012) audits total <Assertion> count, <Signature> count, and <ds:Reference URI> alignment.',
    },
    {
        question: 'How does the built-in 65-Password Weak HMAC Secret Dictionary Auditor work?',
        answer:
            'Whenever you paste an HS256, HS384, or HS512 JWT, auditWeakHmacSecret() computes RFC 2104 HMAC digests over the Header.Payload signing input against 65 common default secrets (such as "secret", "your-256-bit-secret", "changeme", "jwt_secret", "123456", "nextauth-secret", and "password") in under 3 milliseconds. If a match is found, Rule 2 (JWT-KEY-002) flags a CRITICAL alert and displays the cracked secret.',
    },
    {
        question: 'What is the SAML <NameID> XML Comment Truncation vulnerability (CVE-2017-11427)?',
        answer:
            'During XML Exclusive Canonicalization (exc-c14n) without comments, <saml:NameID>admin@corp.com<!---->.attacker.com</saml:NameID> has its comment stripped, validating against the legitimate user’s signature or certificate rules, whereas certain DOM parsers that read only the first text child node (.firstChild.nodeValue) truncate the identity at the comment boundary and authenticate the user as "admin@corp.com". Rule 13 (SAML-NAMEID-013) detects embedded XML comments inside <NameID>.',
    },
    {
        question: 'How does RFC 9901 SD-JWT (Selective Disclosure JWT) work in the debugger?',
        answer:
            'An SD-JWT appends tilde-separated Base64URL disclosures after a standard JWS (Header.Payload.Signature~Disclosure1~Disclosure2~KB-JWT). Each disclosure is a JSON array [salt, claimName, claimValue] whose SHA-256 Base64URL digest is listed inside the "_sd" array of the signed JWT payload. Our engine decodes every disclosure, computes its SHA-256 digest, and verifies that it matches an entry in "_sd".',
    },
    {
        question: 'How does the 1-Click "Auto-Fix Vulnerabilities" button remediate flagged tokens?',
        answer:
            'Clicking "Auto-Fix Vulnerabilities" deterministically upgrades "alg": "none" or weak dictionary secrets to HS256 signed with a 256-bit CSPRNG key, strips untrusted jku/x5u/jwk header parameters, replaces path-traversal kid values with an RFC 7638 JWK SHA-256 thumbprint, scrubs plaintext password/SSN fields from the payload, refreshes expired exp timestamps to +1 hour, and removes unsigned XSW assertions from SAML XML.',
    },
    {
        question: 'What is an RFC 7638 JWK SHA-256 Thumbprint (kid)?',
        answer:
            'RFC 7638 defines a canonical method for computing a cryptographic key identifier (kid) by serializing only the required public key members of a JWK in lexicographical order (e.g., {"e":"AQAB","kty":"RSA","n":"..."} for RSA, {"crv":"P-256","kty":"EC","x":"...","y":"..."} for EC, or {"crv":"Ed25519","kty":"OKP","x":"..."} for EdDSA) with no whitespace and hashing the UTF-8 string with SHA-256.',
    },
    {
        question: 'How does the Cross-Protocol Identity Translator convert between SAML 2.0, JWT, and PASETO v4?',
        answer:
            'In Tab 3, translateTokenAcrossProtocols() maps SAML <Issuer>, <NameID>, <Audience>, <Conditions NotBefore/NotOnOrAfter>, and <AttributeStatement> into RFC 7519 claims (iss, sub, aud, nbf, exp, custom claims) and simultaneously compiles a signed HS256 JWT, a PASETO v4.public token with a JSON footer, and a complete SAML 2.0 <Response> in Raw XML, HTTP-POST Base64, and HTTP-Redirect DEFLATE formats.',
    },
    {
        question: 'What are PASERK (Platform-Agnostic Serialized Keys) strings like k4.public. and k4.pid.?',
        answer:
            'PASERK is the companion key-format specification for PASETO. Instead of ASN.1 DER/PEM or multi-field JWK objects, PASERK serializes keys with explicit version and purpose prefixes such as k4.local. (symmetric 256-bit key), k4.public. (Ed25519 public key), k4.pid. (public key ID thumbprint), and k4.lid. (local key ID thumbprint). Tab 4 generates all four alongside JWK and PEM.',
    },
    {
        question: 'Why does the debugger check 4 KB Cookie and 8 KB HTTP Header limits?',
        answer:
            'Browsers enforce a strict 4,096-byte (4 KB) limit per HTTP cookie (RFC 6265), and reverse proxies such as Nginx, Envoy, AWS ALB, and Cloudflare reject HTTP requests with "431 Request Header Fields Too Large" when Authorization headers exceed 8 KB. Bloated JWTs with dozens of RBAC group claims or SAML assertions frequently breach these ceilings.',
    },
    {
        question: 'How does the OAuth 2.0 PKCE (RFC 7636) S256 verifier in Advanced Options work?',
        answer:
            'Proof Key for Code Exchange (PKCE) protects OAuth 2.0 authorization code flows by binding a high-entropy code_verifier string to a code_challenge = BASE64URL(SHA256(ASCII(code_verifier))). Entering your code_verifier in Advanced Options computes the exact S256 challenge string in real time.',
    },
    {
        question: 'Which backend programming languages are supported in Tab 5 (Verification Code Generator)?',
        answer:
            'Tab 5 compiles copy-ready, security-hardened token verification snippets—complete with explicit algorithm allowlists, issuer and audience pinning, and 30-second clock-skew tolerance—for Node.js / TypeScript (jose v5), Python (PyJWT), Go (golang-jwt/jwt/v5), Rust (jsonwebtoken), Java 21 (Nimbus JOSE + JWT), C# / .NET 8 (JsonWebTokenHandler), PHP 8.3 (firebase/php-jwt), and Cloudflare Workers (WebCrypto SubtleCrypto).',
    },
    {
        question: 'Are the exported Excel (.xlsx) and CSV (.csv) audit logs protected against formula injection?',
        answer:
            'Yes. Every claim key, claim value, SAML attribute, and security evidence string exported to OpenXML .xlsx or UTF-8 BOM .csv is sanitized by sanitizeSpreadsheetCellCwe1236(), which prefixes strings starting with =, +, -, @, Tab, CR, or LF with a literal single quote (\') to prevent CWE-1236 spreadsheet formula execution.',
    },
];

export default function JwtPasetoSamlDebuggerSeo() {
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: JWT_PASETO_SAML_FAQS.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    };

    const howToSchema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to Debug, Verify, and Audit JWT, PASETO, JWE, and SAML 2.0 Tokens Locally',
        description:
            'Step-by-step guide to decoding and verifying JWT (JWS/JWE/SD-JWT), PASETO (v1–v4), and SAML 2.0 tokens locally in your browser while auditing 16 cryptographic and SSO security rules.',
        step: [
            {
                '@type': 'HowToStep',
                position: 1,
                name: 'Paste Your Token, Bearer Header, or SAML Message (Or Click a Preset)',
                text: 'Paste any JWT, SD-JWT, 5-part JWE, PASETO (v1–v4), Authorization: Bearer header, or SAML 2.0 (Base64 / HTTP-Redirect DEFLATE / Raw XML) into the top token workbench, or click one of the 6 real cryptographic presets.',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Verify Signatures, Decrypt JWE/PASETO & Configure Clock Skew',
                text: 'Provide your HMAC secret, PEM/JWK key, or PASETO Implicit Assertion and adjust the Clock Skew Tolerance slider (0–300s) to verify signature authenticity and temporal validity.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Audit 16 Security Rules & Apply 1-Click Auto-Remediation',
                text: 'Review the 0–100 Security Score in the Royal Blue Hero Card and Tab 2 to catch alg:none, weak dictionary secrets, jku SSRF, and SAML XML Signature Wrapping (XSW), then click Auto-Fix Vulnerabilities.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Translate Across Protocols, Convert Keys & Export Verification Code',
                text: 'Translate between JWT, PASETO v4, and SAML 2.0 in Tab 3, convert JWK/JWKS <-> PEM <-> PASERK in Tab 4, and copy 8-language backend verification code or CWE-1236 safe .xlsx/.csv audit logs in Tab 5.',
            },
        ],
    };

    const softwareAppSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'KivaroTools Universal JWT, PASETO & SAML 2.0 Debugger, Verifier & SSO Security Linter',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web Browser (100% Client-Side Local Execution)',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        featureList: [
            '100% Client-Side 5-Protocol Token Debugger (JWT JWS, RFC 9901 SD-JWT, 5-Part JWE, PASETO v1–v4, and OASIS SAML 2.0)',
            'Built-In 65-Password Weak HMAC Secret Dictionary Auditor (HS256, HS384, HS512)',
            '16-Rule Cryptographic & SSO Security Vulnerability Linter with 1-Click Deterministic Auto-Fixer',
            'PASETO Binary 64-Bit Little-Endian Pre-Authentication Encoding (PAE) & Implicit Assertion Inspector',
            'SAML 2.0 Bidirectional HTTP-Redirect (RFC 1951 Raw DEFLATE + Base64 + URL) <-> HTTP-POST (Base64) <-> Raw XML Workbench',
            'Cross-Protocol Identity Translator (SAML 2.0 Assertion <-> OIDC JWT <-> PASETO v4.public)',
            'Integrated Cryptographic Key Studio (JWK / JWKS <-> SPKI/PKCS#8 PEM <-> PASERK + RFC 7638 Thumbprint kid)',
            '8-Language Production Backend Verification Code Generator + CWE-1236 Safe Excel (.xlsx) & CSV Audit Exports',
        ],
    };

    return (
        <article className="mt-16 w-full min-w-0 max-w-full overflow-x-hidden space-y-12 text-slate-700 dark:text-slate-300">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
            />

            {/* ============================================================================
          SECTION 1: EXECUTIVE OVERVIEW & UNIFIED MULTI-PROTOCOL IAM ARCHITECTURE
          ============================================================================ */}
            <section
                aria-labelledby="jwt-paseto-saml-overview"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2
                        id="jwt-paseto-saml-overview"
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
                    >
                        Universal JWT (JWS / JWE / SD-JWT), PASETO (v1–v4) &amp; SAML 2.0 Debugger, Verifier &amp; 16-Rule SSO Security Linter
                    </h2>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shrink-0">
                        <Sparkles className="h-3.5 w-3.5" />
                        5 Protocols • 16 Security Rules • Zero Upload
                    </span>
                </div>

                <p className="mt-3 w-full text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Decode, verify, sign, encrypt, and security-audit <strong>JSON Web Tokens (RFC 7515 JWS, RFC 7516 5-Part JWE, and RFC 9901 Selective Disclosure SD-JWT)</strong>, <strong>Platform-Agnostic Security Tokens (PASETO v1, v2, v3, and v4 local &amp; public with binary LE64 Pre-Authentication Encoding)</strong>, and <strong>OASIS SAML 2.0 Messages (HTTP-Redirect Raw DEFLATE + Base64, HTTP-POST Base64, and Raw XML)</strong> in one unified, 100% client-side browser studio. Automatically detect 16 critical authentication vulnerabilities—including <code>alg: &quot;none&quot;</code> bypasses, weak HMAC dictionary secrets, RS256-to-HS256 key confusion, <code>jku</code>/<code>x5u</code> SSRF, and SAML XML Signature Wrapping (<code>XSW1–XSW8</code>)—and remediate them in one click.
                </p>

                <blockquote className="p-4 my-6 bg-blue-50/80 border-l-4 border-blue-600 rounded-r-xl dark:bg-slate-800/80 not-italic">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
                        <strong>Local Browser Cryptographic Execution &amp; Privacy Disclosure:</strong> Bearer tokens, session cookies, SAML assertions, and signing keys are live credentials. Every decoding, HMAC/AEAD verification, dictionary check, and SAML decompression operation in this studio runs strictly inside your local browser tab memory and is never transmitted to KivaroTools servers.
                    </p>
                </blockquote>

                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    <p>
                        Modern enterprise Identity and Access Management (IAM) pipelines rarely rely on a single token format. A typical B2B SaaS login flow begins with an enterprise Identity Provider (Okta, Microsoft Entra ID, PingFederate, or Keycloak) issuing an <strong>OASIS SAML 2.0 <code>&lt;samlp:Response&gt;</code></strong> over HTTP-POST or an <strong><code>&lt;samlp:AuthnRequest&gt;</code></strong> compressed with raw <code>DEFLATE</code> over HTTP-Redirect. Your identity broker then exchanges that SAML assertion for an <strong>OpenID Connect <code>id_token</code> / OAuth 2.0 <code>access_token</code> (JWT JWS or 5-part encrypted JWE)</strong> or a microservice <strong>PASETO <code>v4.public</code> / <code>v4.local</code></strong> session token.
                    </p>
                    <p>
                        Previously, debugging that pipeline forced engineers to bounce between four disconnected websites—one for 3-part JWTs, another for 5-part JWEs or JWK-to-PEM conversion, a third for PASETO tokens, and a fourth for SAML Base64/Deflate decoding—none of which audited for cryptographic misconfigurations or translated claims across protocols. Our deterministic engine (<code>lib/jwtPasetoSamlEngine.ts</code> v5.1) unifies all five specifications into a single workbench.
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            <Layers className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            5-Protocol Auto-Detecting Decoder
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Automatically strips <code>Authorization: Bearer</code>, Cookie, and URL wrappers and decodes JWS, RFC 9901 SD-JWT, 5-part JWE, PASETO v1–v4, and SAML 2.0 Deflate/Base64 messages.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            16-Rule Security Linter &amp; Auto-Fixer
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Audits <code>alg:none</code>, 65 default HMAC secrets, RS256→HS256 confusion, <code>jku</code> SSRF, <code>kid</code> traversal, and SAML <code>XSW1–XSW8</code> wrapping—with 1-click deterministic remediation.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                            <ArrowRightLeft className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            Cross-Protocol &amp; Key Studio
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Translates claims between SAML 2.0, OIDC JWT, and PASETO v4, converts JWK/JWKS ↔ PEM ↔ PASERK with RFC 7638 thumbprints, and generates 8-language backend verifier code.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 2: COMPLETE INTERNAL WORKING STRUCTURE (5-STAGE PIPELINE)
          ============================================================================ */}
            <section
                aria-labelledby="jwt-paseto-saml-working-structure"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2.5 mb-2">
                    <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="jwt-paseto-saml-working-structure"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Complete Working Structure: How the 5-Stage Cryptographic &amp; SSO Audit Engine Works
                    </h2>
                </div>
                <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    <code>lib/jwtPasetoSamlEngine.ts</code> processes tokens through five deterministic stages in browser memory:
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                            1
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Wrapper &amp; Binding Unpacker
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Strips <code>Bearer</code>/<code>DPoP</code>/Cookie headers and URL query strings, and inflates RFC 1951 raw Deflate SAML streams.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                            2
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Cryptographic Verifier &amp; PAE
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Evaluates RFC 2104 HMAC-SHA256/384/512, PASETO LE64 <code>PAE</code> buffers, JWE GCM tags, and SD-JWT <code>_sd</code> digests.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
                            3
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            65-Secret &amp; 16-Rule Linter
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Runs a 65-password HMAC dictionary audit and evaluates 16 JWT, PASETO, and SAML XSW security rules.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white">
                            4
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Protocol &amp; Key Translator
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Translates claims across JWT ↔ PASETO v4 ↔ SAML 2.0 and converts JWK/JWKS ↔ PEM ↔ PASERK with RFC 7638 thumbprints.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                            5
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            8-Lang Code &amp; XLSX Export
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Generates hardened verification code in 8 languages and exports CWE-1236 safe <code>.xlsx</code> and <code>.csv</code> audit logs.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 3: REAL CRYPTOGRAPHIC WALKTHROUGHS (PASETO LE64 PAE & SAML XSW)
          ============================================================================ */}
            <section
                aria-labelledby="jwt-paseto-saml-walkthroughs"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-8"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Terminal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h2
                            id="jwt-paseto-saml-walkthroughs"
                            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                        >
                            Real-World Cryptographic Walkthroughs: PASETO v4 LE64 PAE Framing &amp; SAML 2.0 XSW Detection
                        </h2>
                    </div>
                    <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        See the exact binary framing and vulnerability checks performed on our built-in presets:
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                        <div className="text-blue-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                            Walkthrough 1: PASETO v4.public Pre-Authentication Encoding (LE64 PAE)
                        </div>
                        <pre className="leading-relaxed overflow-x-auto max-w-full">{`1. Token Components (Preset #4 — PASETO v4.public):
   • Header (h):    "v4.public." (10 bytes ASCII)
   • Payload (m):   {"iss":"https://auth.kivarotools.com","sub":"svc_payment..."}
   • Footer (f):    {"kid":"k4.pid.9f8e7d6c5b4a3210","wpk":"kivaro-ed25519-prod"}
   • Implicit (i):  "tenant:kivaro-global-prod" (25 bytes ASCII, unstored in token!)

2. Binary LE64 PAE Construction (buildPasetoPaeBuffer):
   PAE(h, m, f, i) = LE64(4) || LE64(|h|)||h || LE64(|m|)||m || LE64(|f|)||f || LE64(|i|)||i
   • Leading 16 Bytes Hex: 04 00 00 00 00 00 00 00 0A 00 00 00 00 00 00 00
   • Why It Beats JWT: An attacker cannot move bytes between payload and footer
     or strip the implicit tenant assertion without invalidating the 64-byte signature!`}</pre>
                    </div>

                    <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                        <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                            Walkthrough 2: SAML 2.0 XML Signature Wrapping (XSW) &amp; NameID Truncation
                        </div>
                        <pre className="leading-relaxed overflow-x-auto max-w-full">{`1. Input SAMLResponse Analysis (Preset #6 — SAML 2.0 XSW):
   • Assertion #1 (Unsigned): ID="_evil_unsigned_xsw_assertion"
     <saml:NameID>admin@kivarotools.com<!--XSW_TRUNC-->.attacker.org</saml:NameID>
     <saml:SubjectConfirmationData Recipient="https://wrong-sp.attacker.org/acs"/>
   • Assertion #2 (Signed):   ID="_legit_signed_assertion_01"
     <ds:SignatureMethod Algorithm="...#rsa-sha1"/>
     <ds:Reference URI="#_legit_signed_assertion_01"/>

2. 4 Security Findings Triggered Automatically:
   • [CRITICAL] SAML-XSW-012: 2 <Assertion> blocks found; Assertion #1 is unsigned!
   • [CRITICAL] SAML-NAMEID-013: XML comment inside <NameID> (CVE-2017-11427).
   • [WARNING]  SAML-CRYPTO-015: Deprecated rsa-sha1 signature/digest algorithm.
   • [WARNING]  SAML-COND-016: Destination vs. Recipient URL mismatch.`}</pre>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 4: 5-PROTOCOL CRYPTOGRAPHIC SPECIFICATION MATRIX
          ============================================================================ */}
            <section
                aria-labelledby="jwt-paseto-saml-protocol-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="jwt-paseto-saml-protocol-matrix"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Technical Reference: 5 Supported Authentication Token Protocols &amp; Cryptographic Suites
                    </h2>
                </div>

                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Protocol Family</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Wire Structure / Binding</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Standard / RFC</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Cryptographic Verification &amp; Forensic Capabilities</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">JWT / JWS (3-Part)</td>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">Header.Payload.Signature</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">RFC 7515 / RFC 7519 / RFC 8725</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Verifies &amp; signs HS256/384/512, audits 65 weak secrets, checks RFC 7638 kid thumbprints, and validates exp/nbf/iat.</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">SD-JWT (Selective Disclosure)</td>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">H.P.S~Disc1~Disc2~KB-JWT</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">IETF RFC 9901 (SD-JWT)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Decodes [salt, claimName, value] disclosures, computes SHA-256 Base64URL digests, and matches against payload _sd array.</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">JWE (5-Part Encrypted)</td>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">Hdr.CEK.IV.Cipher.Tag</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">RFC 7516 (JWE)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Inspects all 5 segments, 96-bit IV, and 128-bit Authentication Tag, and decrypts/encrypts dir/A256GCM payloads locally.</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">PASETO (v1, v2, v3, v4)</td>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">v4.public.Body[.Footer]</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">PASETO &amp; PASERK RFC</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Constructs 64-bit Little-Endian PAE framing, validates JSON Footers &amp; Implicit Assertions, and converts k4.pid/k4.lid keys.</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">OASIS SAML 2.0 SSO</td>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">XML / Base64 / Raw DEFLATE</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">OASIS SAML 2.0 Core &amp; Bindings</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Bidirectional HTTP-Redirect DEFLATE &lt;-&gt; HTTP-POST Base64 &lt;-&gt; XML, AttributeStatement extraction, and XSW1–XSW8 linting.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 5: 16-RULE CRYPTOGRAPHIC & SSO SECURITY AUDIT REFERENCE TABLE
          ============================================================================ */}
            <section
                aria-labelledby="jwt-paseto-saml-16-rules"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="jwt-paseto-saml-16-rules"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        16-Rule JWT, PASETO &amp; SAML 2.0 Security Vulnerability Audit Matrix
                    </h2>
                </div>

                <div className="w-full mt-4 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">#</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Audit Rule ID</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Severity &amp; Standard</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Exploit Vector &amp; 1-Click Auto-Fix Remediation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {[
                                ['1', 'JWT-ALG-001_NONE_BYPASS', 'CRITICAL • CWE-347', 'Detects alg:"none" or missing signature; upgrades to HS256 with a 256-bit key.'],
                                ['2', 'JWT-KEY-002_WEAK_DICTIONARY_SECRET', 'CRITICAL • CWE-798', 'Cracks HS256/384/512 tokens against 65 common default secrets ("secret", "changeme", etc.).'],
                                ['3', 'JWT-CONF-003_ASYMMETRIC_KEY_CONFUSION', 'CRITICAL • CVE-2016-5431', 'Detects RS256-to-HS256 downgrade where an RSA/EC PUBLIC KEY PEM is used as an HMAC secret.'],
                                ['4', 'JWT-HDR-004_JKU_X5U_SSRF_INJECTION', 'CRITICAL • CWE-918', 'Flags untrusted external jku or x5u URLs in header that trick servers into fetching attacker keys.'],
                                ['5', 'JWT-HDR-005_EMBEDDED_JWK_SELF_SIGN', 'CRITICAL • CVE-2018-0114', 'Detects attacker-supplied inline "jwk" public key objects embedded inside the JWS header.'],
                                ['6', 'JWT-KID-006_PATH_TRAVERSAL_OR_SQLI', 'CRITICAL • CWE-22 / CWE-89', 'Detects "../", "/dev/null", SQL quotes, or shell metacharacters inside the "kid" header parameter.'],
                                ['7', 'JWT-EXP-007_MISSING_OR_EXPIRED_TTL', 'CRITICAL/WARN • CWE-613', 'Flags tokens missing "exp" or expired past Clock Skew tolerance; refreshes exp to +1 hour.'],
                                ['8', 'JWT-TTL-008_EXCESSIVE_LIFETIME', 'WARNING • RFC 8725 §3.12', 'Flags access tokens with validity windows exceeding 24 hours (86,400 seconds).'],
                                ['9', 'JWT-CTX-009_MISSING_ISS_AUD_SUB_JTI', 'WARNING • RFC 8725 §3.8', 'Flags missing Issuer (iss), Audience (aud), or Subject (sub) context-binding claims.'],
                                ['10', 'JWT-PII-010_SENSITIVE_DATA_IN_PAYLOAD', 'CRITICAL • CWE-312', 'Detects plaintext password, ssn, credit_card, api_key, or secret fields in unencrypted claims.'],
                                ['11', 'JWT-CRIT-011_MISSING_EXPLICIT_TYP', 'OPTIMIZATION • RFC 9068', 'Recommends explicit media typing ("typ": "at+jwt" or "JWT") to prevent cross-JWT confusion.'],
                                ['12', 'SAML-XSW-012_XML_SIGNATURE_WRAPPING', 'CRITICAL • CVE-2024-6202', 'Detects multiple <Assertion> elements, unsigned assertions, or <ds:Reference URI> ID mismatches.'],
                                ['13', 'SAML-NAMEID-013_COMMENT_TRUNCATION', 'CRITICAL • CVE-2017-11427', 'Detects XML comments inside <saml:NameID> (admin@corp.com<!---->.evil.com) that spoof identities.'],
                                ['14', 'SAML-XXE-014_DOCTYPE_ENTITY_INJECTION', 'CRITICAL • CWE-611', 'Detects <!DOCTYPE or <!ENTITY declarations in SAML XML that enable XXE file/SSRF disclosure.'],
                                ['15', 'SAML-CRYPTO-015_WEAK_SHA1_DIGEST', 'WARNING • CWE-328', 'Flags deprecated rsa-sha1 and sha1 XML-DSig algorithms; upgrades to rsa-sha256.'],
                                ['16', 'SAML-COND-016_RECIPIENT_DESTINATION_MISMATCH', 'WARNING • SAML 2.0 Core', 'Detects mismatch between Response Destination and SubjectConfirmationData Recipient ACS URLs.'],
                            ].map(([num, ruleId, sev, desc]) => (
                                <tr key={num}>
                                    <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">{num}</td>
                                    <td className="p-3 font-mono font-semibold text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700">{ruleId}</td>
                                    <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">{sev}</td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">{desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 6: COMPETITOR COMPARISON MATRIX (VS 255+ MARKET TOOLS)
          ============================================================================ */}
            <section
                aria-labelledby="jwt-paseto-saml-competitor-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="jwt-paseto-saml-competitor-matrix"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Enterprise Benchmark: KivaroTools vs. Standalone JWT, PASETO &amp; SAML Decoders
                </h2>
                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Capability / Feature</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">
                                    KivaroTools Unified Studio (/developer/jwt-debugger)
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Standard JWT Decoders (jwt.io / jwt.ms)
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Basic PASETO Playgrounds
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Standalone SAML Decoders (samltool)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Supported Token Protocols
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    All 5: JWT (JWS), SD-JWT, 5-Part JWE, PASETO v1–v4 &amp; SAML 2.0
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">3-Part JWS only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">PASETO public only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">SAML XML only</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    16-Rule Security Linter &amp; 1-Click Fix
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Yes — 0–100 Score + 65-Secret Cracker + 1-Click Auto-Fix
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">No XSW / Comment Linter</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    PASETO LE64 PAE &amp; Implicit Assertion
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Full Binary PAE Hex Dump + v3/v4 Implicit Assertion + Local Decrypt
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Unsupported</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">Cannot decrypt local or show PAE</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Unsupported</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Cross-Protocol Identity Translator
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    1-Click SAML 2.0 ↔ OIDC JWT ↔ PASETO v4 Translation
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Key Studio &amp; 8-Lang Code Generator
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    JWK/JWKS ↔ PEM ↔ PASERK + 8 Backend Languages + .xlsx/.csv
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Library links only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Separate pages</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 7: 6 COMMON AUTHENTICATION & SSO PITFALLS (AND HOW TO FIX THEM)
          ============================================================================ */}
            <section
                aria-labelledby="jwt-paseto-saml-pitfalls"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="jwt-paseto-saml-pitfalls"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    6 Common JWT, PASETO &amp; SAML 2.0 Security Pitfalls (And How to Avoid Them)
                </h2>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            1. Trusting the JWT Header Algorithm Without an Allowlist
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Calling <code>jwt.verify(token, key)</code> without passing an explicit <code>algorithms: [&apos;RS256&apos;]</code> allowlist enables <code>alg: &quot;none&quot;</code> and RS256-to-HS256 public-key confusion attacks.
                            <br />
                            <strong>Fix:</strong> Copy our hardened verification snippets from Tab 5 or migrate internal tokens to <strong>PASETO v4</strong>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            2. Shipping Default .env Secrets to Production
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Leaving placeholder secrets like <code>your-256-bit-secret</code>, <code>secret</code>, or <code>nextauth-secret</code> allows anyone to offline-crack HS256 tokens in milliseconds.
                            <br />
                            <strong>Fix:</strong> Our built-in 65-secret dictionary auditor tests your token automatically on paste.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            3. Consuming Unsigned SAML Assertions (XSW Attacks)
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Validating <code>&lt;ds:Signature&gt;</code> on one node while reading <code>{'//saml:Assertion[1]/saml:Subject'}</code> allows attackers to inject an unsigned admin assertion.
                            <br />
                            <strong>Fix:</strong> Load Preset #6 and inspect Rule 12 (<code>SAML-XSW-012</code>) in Tab 2.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            4. Storing Secrets or PII in Unencrypted JWS Claims
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Developers sometimes mistake Base64URL encoding for encryption and embed database passwords, SSNs, or API keys inside standard JWTs.
                            <br />
                            <strong>Fix:</strong> Use <strong>5-Part Encrypted JWE (A256GCM)</strong> or <strong>PASETO v4.local</strong> when claims must remain confidential.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            5. Failing SAML HTTP-Redirect Logins Due to Missing Deflate
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Encoding a <code>SAMLRequest</code> query parameter with plain Base64 instead of Raw RFC 1951 Deflate + Base64 + URL-encoding causes IdPs to reject the request.
                            <br />
                            <strong>Fix:</strong> Copy the pre-built <code>HTTP-Redirect (RFC 1951 DEFLATE + Base64 + URL)</code> string from Tab 3.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            6. Breaching the 4 KB Browser Cookie Ceiling
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Packing 80+ Active Directory group GUIDs into a session JWT pushes the token past 4,096 bytes, causing browsers to silently drop the <code>Set-Cookie</code> header!
                            <br />
                            <strong>Fix:</strong> Monitor the live <strong>4 KB Cookie Budget Used %</strong> bar in the Royal Blue Output Card.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 8: SEARCH INTENT & WORKFLOW COVERAGE (33 TARGET WORKFLOWS)
          ============================================================================ */}
            <section
                aria-labelledby="jwt-paseto-saml-keyword-coverage"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="jwt-paseto-saml-keyword-coverage"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Supported JWT, JWE, PASETO, SAML 2.0 &amp; Key Management Workflows
                    </h2>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            JWT, JWE, SD-JWT &amp; OIDC Debugging (11 Workflows)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>client-side jwt decoder and signature verifier</li>
                            <li>jwe 5-part encrypted token debugger (a256gcm)</li>
                            <li>rfc 9901 sd-jwt selective disclosure debugger</li>
                            <li>oidc id_token and oauth2 access_token validator</li>
                            <li>jwt alg:none and rs256-to-hs256 confusion scanner</li>
                            <li>jwt weak hmac secret dictionary auditor online</li>
                            <li>jwt kid sql injection and jku ssrf header linter</li>
                            <li>jwt expiration timestamp and clock skew simulator</li>
                            <li>decode authorization bearer token header online</li>
                            <li>jwt 4kb cookie and 8kb http header size checker</li>
                            <li>oauth2 pkce code_verifier to s256 challenge tool</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            PASETO v1–v4, PASERK &amp; Key Studio (11 Workflows)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>paseto v4.public and v4.local token debugger</li>
                            <li>paseto pre-authentication encoding (pae) hex viewer</li>
                            <li>paseto v3 and v4 implicit assertion validator</li>
                            <li>convert jwt to paseto v4 token online</li>
                            <li>paserk k4.local and k4.public key generator</li>
                            <li>paserk k4.pid and k4.lid thumbprint calculator</li>
                            <li>convert jwk to pem and pem to jwks.json online</li>
                            <li>rfc 7638 jwk sha-256 thumbprint kid calculator</li>
                            <li>generate node.js jose jwt verification code</li>
                            <li>python pyjwt and golang jwt/v5 verifier generator</li>
                            <li>cloudflare workers webcrypto jwt verifier code</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            SAML 2.0 SSO, Deflate &amp; XSW Auditing (11 Workflows)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>decode saml 2.0 response and authnrequest xml</li>
                            <li>saml http-redirect deflate + base64 encoder/decoder</li>
                            <li>saml xml signature wrapping (xsw1–xsw8) scanner</li>
                            <li>saml nameid xml comment truncation checker</li>
                            <li>saml xxe doctype and rsa-sha1 security linter</li>
                            <li>saml destination vs recipient acs url validator</li>
                            <li>saml conditions notbefore and notonorafter skew</li>
                            <li>convert saml 2.0 assertion to oidc jwt claims</li>
                            <li>extract saml attributestatement to json and csv</li>
                            <li>export token security audit to cwe-1236 safe xlsx</li>
                            <li>zero-upload enterprise sso token debugger</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 9: FREQUENTLY ASKED QUESTIONS (16 INTERACTIVE ACCORDIONS)
          ============================================================================ */}
            <section
                aria-labelledby="jwt-paseto-saml-faq"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="jwt-paseto-saml-faq"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Frequently Asked Questions (JWT, JWE, PASETO, SAML 2.0 &amp; SSO Security)
                    </h2>
                </div>

                <div className="space-y-3">
                    {JWT_PASETO_SAML_FAQS.map((faq, index) => (
                        <details
                            key={index}
                            className="group rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
                        >
                            <summary className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base cursor-pointer select-none list-none flex items-center justify-between gap-3">
                                <span>
                                    {index + 1}. {faq.question}
                                </span>
                                <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform shrink-0">
                                    &#9662;
                                </span>
                            </summary>
                            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 break-words">
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </section>

            {/* ============================================================================
          SECTION 10: INTERNAL CROSS-LINKING TO RELATED DEVELOPER & SECURITY TOOLS
          ============================================================================ */}
            <section
                aria-labelledby="jwt-paseto-saml-related-tools"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Code2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="jwt-paseto-saml-related-tools"
                        className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Related Client-Side Security, Network Debugging &amp; Developer Utilities
                    </h2>
                </div>
                <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed break-words">
                    Chain your authentication token debugging with our local network waterfall, database, and privacy utilities:
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/developer/har-analyzer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            HAR File Analyzer &amp; 14-Surface Secret Sanitizer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect OAuth2/OIDC and SAML SSO redirects across HTTP waterfalls and scrub Bearer JWTs and cookies before sharing.
                        </p>
                    </Link>

                    <Link
                        href="/developer/base64-encoder"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            Base64URL Encoder, Decoder &amp; Binary Hex Inspector →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Convert between RFC 4648 Base64 and Base64URL and inspect raw binary ASN.1 DER / X.509 certificate payloads.
                        </p>
                    </Link>

                    <Link
                        href="/developer/json-formatter"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            JSON Formatter, Schema Validator &amp; Tree Viewer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Validate OIDC discovery documents (.well-known/openid-configuration), JWKS keysets, and complex claim trees.
                        </p>
                    </Link>

                    <Link
                        href="/developer/sqlite-viewer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            SQLite &amp; DuckDB B-Tree Explorer &amp; PII Masker →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect local browser/mobile auth session databases (.sqlite / .db) and scrub sensitive user tables client-side.
                        </p>
                    </Link>

                    <Link
                        href="/document/pdf-scrubber"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            PDF Bank Statement &amp; Invoice Deep CDR Scrubber →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Permanently redact PII, tax IDs, and hidden XMP metadata from compliance and audit PDF packets in your browser.
                        </p>
                    </Link>

                    <Link
                        href="/developer/llms-txt-generator"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            llms.txt, llms-full.txt &amp; AI Crawler Studio →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Generate llmstxt.org v2 documentation indexes and RFC 9309 AI crawler governance rules for developer portals.
                        </p>
                    </Link>
                </div>
            </section>
        </article>
    );
}