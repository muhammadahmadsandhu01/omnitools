import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Layers,
  Terminal,
  HelpCircle,
  Sparkles,
  FileSpreadsheet,
  Search,
  Lock,
  ArrowRightLeft,
  KeyRound,
} from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

export const PII_REDACTOR_FAQS: FaqItem[] = [
  {
    question:
      'What is a Client-Side PII Redactor and AI Prompt Sanitizer, and why should I use it before ChatGPT or Claude?',
    answer:
      'Whenever corporate employees, software engineers, legal analysts, or support agents paste production logs, JSON payloads, CSV tables, or contracts into public or cloud AI models (like ChatGPT, Claude, Gemini, or DeepSeek), any embedded email addresses, cloud API keys, database passwords, credit card numbers, IBANs, or customer names are transmitted to external servers. A Client-Side PII Redactor & Prompt Sanitizer detects and replaces those confidential strings locally in your browser RAM with reversible placeholder tokens (such as [EMAIL_01] or [OPENAI_KEY_01]) before you copy the prompt.',
  },
  {
    question:
      'Are my confidential logs, prompts, or uploaded files sent to any server when using KivaroTools?',
    answer:
      'No. Your pasted text, prompts, and selected file contents are processed locally in your browser RAM and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources.',
  },
  {
    question:
      'How does 1-Click Reversible Tokenization and AI Response Restoration work in Tab 2?',
    answer:
      'When you sanitize a prompt in Tab 1 using "Reversible Indexed Token" mode, each unique sensitive string is mapped in local browser memory to a numbered placeholder—for example, "sarah.jenkins@apexhealth.org" becomes "[EMAIL_01]" across the entire document. Clicking "Copy + AI Wrapper" prepends a concise system instruction telling ChatGPT or Claude to preserve those exact placeholders in its reply. Once the AI responds, paste its answer into Tab 2 (Restore AI Response) and the engine swaps every "[EMAIL_01]" (even if the AI stripped brackets or lowercased it) back to "sarah.jenkins@apexhealth.org" in under a millisecond.',
  },
  {
    question:
      'Why is "Synthetic Faker (Format-Preserving)" mode better than "[REDACTED]" when asking an AI to write SQL, JSON, or code?',
    answer:
      'If you replace an email address, IPv4 address, or JSON string value with "[REDACTED]" or "████████", code compilers, SQL parsers, and JSON validators often fail or generate broken regexes because the replacement no longer looks like an email or IP address. Synthetic Faker mode replaces real PII with realistic, RFC-compliant dummy values (such as "user01@example.org", "198.51.100.1", "Alex Morgan", and "4111-1111-1111-1101")—and because every synthetic value is stored in your local Session Token Vault, Tab 2 can still restore the AI response back to your real values.',
  },
  {
    question:
      'How does KivaroTools avoid false positives on 16-digit order IDs, 5-digit numbers, and ISO log timestamps?',
    answer:
      'Many basic regex redactors flag any 16-digit number as a credit card, any 5-digit number ("customer 90210") as a ZIP code, and any ISO log timestamp ("2026-11-12T09:42:18Z") as a Date of Birth or phone number. KivaroTools eliminates those false positives using mathematical checksums and context guards: Credit Cards must pass the Luhn algorithm, IBANs must pass ISO 7064 Mod-97-10 verification, US ABA routing numbers must pass the 3-7-1 ABA checksum, US SSNs are checked against SSA invalid area/group rules, and Dates of Birth require explicit surrounding birth/DOB context labels.',
  },
  {
    question:
      'How does the Hybrid Local NER engine detect Person Names, Organizations, and Street Addresses without a 2 GB WebGPU download?',
    answer:
      'Tools that rely on in-browser WebGPU LLMs require downloading 500 MB to 2 GB of model weights, fail on devices without WebGPU hardware acceleration, and often cap scanning at 4,000 characters. KivaroTools runs a deterministic, zero-download Hybrid Local NER engine that combines: (1) Honorific & Title Grammar (Mr., Mrs., Ms., Dr., Prof., Engr.), (2) Salutation, Sign-Off & Role Triggers ("Prepared for", "Patient Name:", "Customer:", "Sincerely,"), (3) Corporate Legal Entity Suffixes (Inc., LLC, Ltd., Corp., GmbH, Pvt. Ltd., PLC, LLP), (4) Thoroughfare Street Suffixes, and (5) Structure-Aware JSON/CSV/.env Key Inspection—executing in under 5 milliseconds on any mobile or desktop browser.',
  },
  {
    question:
      'What does the Structure-Aware JSON, CSV, and .env Key Scanner do?',
    answer:
      'Unstructured regex scanners only inspect value shapes, missing unformatted names or custom secrets inside JSON objects. When "Structure-Aware JSON/CSV/.env Key Scanner" is enabled, KivaroTools inspects key names such as "customer_name", "patient_name", "company_name", "password", "client_secret", "api_key", and "webhook_secret" and masks the assigned value while keeping JSON quotes, braces, and commas 100% syntactically valid.',
  },
  {
    question:
      'Which developer secrets, cloud API keys, and database credentials are detected automatically?',
    answer:
      'Domain 1 (Developer Secrets & Cloud Credentials) scans for 12 credential families: PEM/SSH Private Key blocks, 3-part Base64URL JWT tokens (eyJ...), OpenAI API keys (sk-, sk-proj-, sk-svcacct-), Anthropic Claude keys (sk-ant-), AWS IAM Access Key IDs (AKIA, ASIA, AROA), GitHub Personal Access & Fine-Grained Tokens (ghp_, gho_, github_pat_), Stripe live/test/webhook keys (sk_live_, rk_live_, whsec_), Slack tokens & incoming webhooks (xoxb-, xoxp-), Google Cloud AIza keys, HTTP Authorization Bearer/Basic headers, Database Connection URIs (postgres://, mongodb+srv://, mysql://, redis://), and generic password/secret key-value pairs.',
  },
  {
    question:
      'Which international government, tax, and healthcare identifiers are supported?',
    answer:
      'Beyond US Social Security Numbers (SSN) and HIPAA Medical Record Numbers (MRN), KivaroTools natively detects Pakistani NADRA CNIC numbers (XXXXX-XXXXXXX-X), UK National Insurance Numbers (NINO), Luhn-verified Canadian Social Insurance Numbers (SIN), Indian Income Tax PAN cards, and ISO 13616 / Mod-97 verified IBAN bank accounts across 80+ countries.',
  },
  {
    question:
      'Why does the DevOps Log Scrubber preset keep 127.0.0.1 and 192.168.x.x unmasked by default?',
    answer:
      'When troubleshooting microservice routing or container logs, redacting localhost (127.0.0.1) or internal RFC 1918 private IPs (10.x.x.x, 192.168.x.x) often removes harmless local topology hints while hiding which public client IP triggered the request. Keeping "Preserve Loopback & Private IPs" checked masks external customer IPv4/IPv6 addresses while leaving internal loopback addresses readable (or uncheck it to mask all IPs).',
  },
  {
    question:
      'How can I whitelist a specific email address, IP, or company name so it is not redacted?',
    answer:
      'You can whitelist at two levels: (1) To turn off an entire category (such as all IPv4 addresses), click its chip in the "Detected Types" bar above the editor; or (2) To whitelist a single specific value (such as your own support email while redacting customer emails), click that badge in the X-Ray Inspector or click "Masking Active" next to that item in Tab 3 (Token Vault).',
  },
  {
    question:
      'Can I add my own company project codenames, client names, or employee ID formats?',
    answer:
      'Yes. Open Tab 4 (Custom Regex & Org Dictionary), enter a token prefix label (such as PROJECT_CODE or EMP_ID) and either a literal phrase (such as "Project Hyperion") or a regular expression (such as "EMP-\\d{5}"), and click Add Rule. Custom rules run at priority specificity (99) before general detectors.',
  },
  {
    question:
      'Can I save my Token Vault to restore AI responses tomorrow or in another browser tab?',
    answer:
      'Yes. In Tab 3 (Token Vault), click "Export Vault (.JSON)" to download your session mapping dictionary to your device. Whenever you return for a follow-up AI conversation, click "Import Vault (.JSON)" in Tab 2 to reload your token mappings into browser memory.',
  },
  {
    question:
      'How are exported CSV and 3-Sheet Excel (.xlsx) reports protected against spreadsheet formula injection (CWE-1236)?',
    answer:
      'Any exported cell value starting with =, +, -, @, Tab (0x09), or CR (0x0D) is automatically prefixed with a single quote (\') and stripped of illegal XML control characters so untrusted log strings can never trigger DDE formula execution in Excel or Google Sheets. Furthermore, raw unmasked PII values are excluded from exported spreadsheets by default unless you explicitly check "Include Raw Unmasked Values".',
  },
  {
    question:
      'Does using an automated browser redaction tool by itself guarantee formal GDPR, HIPAA, or PCI-DSS compliance?',
    answer:
      'An automated client-side redactor is a powerful technical safeguard to prevent accidental data exposure in AI prompts, tickets, and logs, but regulatory frameworks (such as HIPAA Safe Harbor or GDPR Article 32) also require human review and organizational governance. Always inspect the X-Ray preview and sanitized output before sharing sensitive documents externally.',
  },
  {
    question:
      'What happens if my prompt also contains invisible AI watermarks or hidden Plane 14 Unicode tags?',
    answer:
      'After sanitizing visible PII and secrets here, you can pass your text through our companion Invisible AI Watermark & Zero-Width Character Cleaner (/developer/zero-width-cleaner) to strip hidden U+200B, U+202F, and Plane 14 prompt-injection characters.',
  },
];

export default function PiiRedactorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PII_REDACTOR_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Redact PII, Scrub API Keys, and Anonymize AI Prompts for ChatGPT & Claude Online',
    description:
      'Step-by-step guide to masking emails, cloud secrets, Luhn credit cards, IBANs, SSNs, and names with reversible tokens in your browser and restoring AI responses in 1 click.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Paste Your Prompt, Log, JSON, or CSV Locally',
        text: 'Paste your confidential text, production log, JSON payload, CSV table, or contract into the editor, drop a file up to 15 MB, or load a built-in B2B sample.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Choose a Workflow Preset & Masking Mode',
        text: 'Select "AI Prompt Safe — Reversible Tokens" to replace PII with deterministic tokens ([EMAIL_01], [OPENAI_KEY_01]), or choose "Synthetic Faker" to preserve data formats for code/SQL generation.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Copy Sanitized Prompt + AI System Wrapper to ChatGPT or Claude',
        text: 'Review the interactive X-Ray badges (whitelisting any non-sensitive items in 1 click) and click "Copy + AI Wrapper" to paste the safe prompt into your AI assistant.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Restore Original Values from the AI Reply in Tab 2',
        text: 'Paste the AI model’s reply into Tab 2 (Restore AI Response) to automatically swap all [TOKEN_01] or synthetic placeholders back to your original values locally.',
      },
    ],
  };

  return (
    <article className="mt-16 w-full min-w-0 max-w-full overflow-x-hidden space-y-12 text-slate-700 dark:text-slate-300">
      {/* Structured Data Scripts (FAQPage & HowTo) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* ============================================================================
          SECTION 1: EXECUTIVE OVERVIEW & ZERO-TRUST PROMPT SANITIZATION ARCHITECTURE
         ============================================================================ */}
      <section
        aria-labelledby="pii-redactor-architecture-overview"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h2
            id="pii-redactor-architecture-overview"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Client-Side PII Redactor, Secret Scrubber &amp; Reversible AI Prompt Sanitizer
          </h2>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 shrink-0">
            <Sparkles className="h-3.5 w-3.5" />
            34 Detectors + Luhn/Mod-97 + 1-Click AI Restore
          </span>
        </div>

        <p className="mt-3 w-full text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          Sanitize <strong>prompts, production logs, JSON payloads, CSV datasets, <code>.env</code> configs, and legal contracts</strong> locally in your browser before pasting them into ChatGPT, Claude, Gemini, Cursor, or external support tickets. Automatically replace <strong>34 classes of PII and cloud credentials</strong> with <strong>deterministic reversible tokens (<code>[EMAIL_01]</code>, <code>[OPENAI_KEY_01]</code>)</strong> or <strong>format-preserving synthetic values</strong>, and restore the AI&apos;s reply in 1 click.
        </p>

        <blockquote className="p-4 my-6 bg-emerald-50/80 border-l-4 border-emerald-600 rounded-r-xl dark:bg-slate-800/80 not-italic">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
            <strong>Local Browser Processing &amp; Privacy Disclosure:</strong> Your pasted text, prompts, and uploaded files are processed locally in your browser RAM and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources.
          </p>
        </blockquote>

        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
          <p>
            Every day, software engineers, DevOps teams, legal analysts, healthcare staff, and customer support specialists copy stack traces, webhook payloads, database dumps, and contracts into Large Language Models to debug code or summarize documents. However, raw enterprise text almost always contains regulated <strong>Personally Identifiable Information (PII)</strong>—such as customer emails, phone numbers, Luhn-valid payment card PANs, IBAN bank accounts, Social Security or National ID numbers, and patient names—alongside live <strong>cloud credentials</strong> like OpenAI <code>sk-proj-</code> keys, AWS <code>AKIA</code> keys, Bearer JWTs, and PostgreSQL connection passwords.
          </p>
          <p>
            Existing online redaction tools suffer from severe limitations: basic regex scrubbers permanently overwrite every value with a static <code>[REDACTED]</code> block—destroying relational context across multi-line logs and making it impossible to restore real values when the AI replies. Worse, naive pattern matchers lack mathematical checksum validation and structure awareness, falsely flagging 5-digit customer IDs as ZIP codes and ISO log timestamps (<code>2026-11-12</code>) as birthdays while completely missing unformatted names inside JSON keys (<code>&quot;customer_name&quot;</code>) or non-US government IDs. KivaroTools unifies <strong>mathematical checksum validation</strong>, <strong>zero-download Hybrid Local NER</strong>, <strong>structure-aware JSON/CSV/.env key inspection</strong>, and <strong>fuzzy-tolerant 1-click AI response restoration</strong> inside a single client-side studio.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              Reversible Tokens &amp; 1-Click AI Response Restore
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Maps identical secrets to consistent tokens (<code>[EMAIL_01]</code>, <code>[PERSON_01]</code>) and restores original values from ChatGPT/Claude replies in Tab 2—even if the LLM alters casing or strips brackets.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              Luhn, Mod-97 IBAN &amp; ABA Checksum Precision
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Verifies Credit Cards via Luhn, 80+ country IBANs via ISO 7064 Mod-97-10, US Routing Numbers via ABA checksum, and SSNs/CNICs/NINOs while leaving log timestamps untouched.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              Structure-Aware JSON/CSV + Hybrid Local NER
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Detects names, organizations, addresses, and passwords via JSON/CSV/.env keys, honorifics, salutations, and legal suffixes in under 5 ms with zero model downloads.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 2: COMPLETE INTERNAL WORKING ARCHITECTURE (5-STAGE PIPELINE)
         ============================================================================ */}
      <section
        aria-labelledby="pii-redactor-working-pipeline"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2.5 mb-2">
          <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2
            id="pii-redactor-working-pipeline"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Complete Working Architecture: How <code>lib/piiRedactorEngine.ts</code> Executes
          </h2>
        </div>
        <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          Every input is processed through a 5-stage deterministic pipeline in local browser memory:
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
              1
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              34-Detector &amp; Key-Value Scan
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Scans input across 12 secret signatures, 6 personal/NER patterns, 5 financial validators, 6 national/HIPAA IDs, 4 network rules, and JSON/CSV/.env key names.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
              2
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Mathematical Checksum Gating
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Filters candidate numbers through Luhn (cards/SIN), ISO 7064 Mod-97-10 (IBAN), ABA 3-7-1 (routing), SSA SSN area rules, and IPv4 octet range checks.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
              3
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Specificity Span Conflict Resolution
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Resolves overlapping candidate matches by specificity rank (<code>100</code> down to <code>74</code>) and span length so PEM blocks, DB URIs, and AWS keys are never split in half.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white">
              4
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Deterministic Vault &amp; 6 Masking Modes
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Assigns each unique entity a canonical <code>[PREFIX_01]</code> token and synthetic counterpart, applying your chosen masking mode while honoring per-value whitelists.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
              5
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Zero-Leak Self-Test &amp; Round-Trip Restore
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Verifies that 0 non-whitelisted secrets remain in the sanitized output, generates SHA-256 receipts, and enables fuzzy-tolerant de-anonymization in Tab 2.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 3: STEP-BY-STEP USER GUIDE (HOW TO USE THE 5-TAB WORKBENCH)
         ============================================================================ */}
      <section
        aria-labelledby="pii-redactor-user-guide"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
      >
        <div>
          <h2
            id="pii-redactor-user-guide"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Complete Step-by-Step Guide: How to Anonymize Prompts &amp; Restore AI Replies
          </h2>
          <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            Follow these four steps to protect sensitive corporate, customer, and developer data across AI assistants and support workflows:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 1: Paste Your Prompt/Log or Drop a File in Tab 1
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Paste raw logs, JSON payloads, CSV data, or legal text into the left editor—or drag and drop any <code>.txt</code>, <code>.log</code>, <code>.json</code>, <code>.csv</code>, <code>.env</code>, or <code>.md</code> file up to <code>15 MB</code>. You can also load one of the 3 built-in B2B sample presets to test live detection immediately.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 2: Choose Your Preset, Masking Mode &amp; Chip Toggles
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Select <strong>AI Prompt Safe (Reversible)</strong> for ChatGPT/Claude prompts or <strong>CSV &amp; JSON Dataset Masker (Synthetic Faker)</strong> when you need format-valid dummy data. Click any chip in the <strong>Detected Types</strong> bar above the editor to toggle an entire category on or off, or click a specific badge in the X-Ray viewer to whitelist a single value.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 3: Copy with AI System Wrapper &amp; Query ChatGPT / Claude
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Click <strong>Copy + AI Wrapper</strong> on the right pane. This copies your sanitized text along with a brief system instruction directing the LLM to keep placeholder tokens (like <code>[EMAIL_01]</code> and <code>[OPENAI_KEY_01]</code>) intact in its answer.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 4: Paste AI Reply in Tab 2 to Restore Original Values in 1 Click
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Switch to <strong>Tab 2 (Restore AI Response)</strong> and paste the AI&apos;s reply. The engine automatically swaps every placeholder token or synthetic faker string back to your original confidential values locally in browser memory.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 4: REAL-WORLD BEFORE VS. AFTER SHOWCASES (3 CODE/TEXT EXAMPLES)
         ============================================================================ */}
      <section
        aria-labelledby="pii-redactor-real-examples"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2
              id="pii-redactor-real-examples"
              className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Real-World Examples: Production Logs, JSON Synthetic Masking &amp; 1-Click AI Restoration
            </h2>
          </div>
          <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            Compare raw confidential inputs against the deterministic tokenized and synthetic outputs produced by KivaroTools:
          </p>
        </div>

        {/* Example 1 */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-xs font-mono">
              Example 1
            </span>
            <span>
              Production Error Log (OpenAI Key, Postgres URI, Luhn Visa Card, IBAN &amp; Loopback IP Guard)
            </span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
              <div className="text-rose-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                BEFORE: Unsanitized Production Log (High Breach Risk)
              </div>
              <pre className="leading-relaxed overflow-x-auto max-w-full">{`[2026-11-12T09:42:18Z] ERROR Charge failed for Dr. Sarah Jenkins (sarah.jenkins@apexhealth.org)
Card: 4111 1111 1111 1111 | IBAN: DE89 3704 0044 0532 0130 00
Client IP: 198.51.100.44 (Local Proxy: 127.0.0.1)
DB: postgres://admin:Sup3rS3cr3t@db.internal:5432/prod
Key: sk-proj-9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p`}</pre>
            </div>

            <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
              <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                AFTER: Reversible Token Mode (Timestamp &amp; 127.0.0.1 Preserved!)
              </div>
              <pre className="leading-relaxed overflow-x-auto max-w-full">{`[2026-11-12T09:42:18Z] ERROR Charge failed for [PERSON_01] ([EMAIL_01])
Card: [CARD_PAN_01] | IBAN: [IBAN_01]
Client IP: [IPV4_01] (Local Proxy: 127.0.0.1)
DB: [DB_URI_01]
Key: [OPENAI_KEY_01]`}</pre>
            </div>
          </div>
        </div>

        {/* Example 2 */}
        <div className="space-y-3 pt-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-600 text-white text-xs font-mono">
              Example 2
            </span>
            <span>
              Structured JSON Payload in Synthetic Faker Mode (Valid JSON Syntax + Key-Aware NER)
            </span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
              <div className="text-rose-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                BEFORE: Confidential Customer Webhook JSON
              </div>
              <pre className="leading-relaxed overflow-x-auto max-w-full">{`{
  "customer_name": "Usman Tariq",
  "company_name": "FinEdge Solutions Pvt. Ltd.",
  "email": "usman.tariq@finedge.pk",
  "nadra_cnic": "35202-1234567-1",
  "stripe_key": "sk_test_51NxYzABC1234567890defGHIJKL"
}`}</pre>
            </div>

            <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
              <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                AFTER: Synthetic Faker Mode (100% Valid JSON &amp; Reversible!)
              </div>
              <pre className="leading-relaxed overflow-x-auto max-w-full">{`{
  "customer_name": "Alex Morgan",
  "company_name": "ExampleCorp Inc.",
  "email": "user01@example.org",
  "nadra_cnic": "00000-0000001-0",
  "stripe_key": "sk_test_SYNTHETIC_STRIPE_01"
}`}</pre>
            </div>
          </div>
        </div>

        {/* Example 3 */}
        <div className="space-y-3 pt-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-mono">
              Example 3
            </span>
            <span>
              1-Click AI Response De-Anonymization (Fuzzy-Tolerant ChatGPT &amp; Claude Reply Restoration)
            </span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
              <div className="text-amber-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                BEFORE: AI Reply from ChatGPT / Claude (Contains Tokens &amp; Dropped Brackets)
              </div>
              <pre className="leading-relaxed overflow-x-auto max-w-full">{`Summary of Incident for [PERSON_01]:
1. The payment attempt on card [CARD_PAN_01] from IP IPV4_01 was declined.
2. Rotate leaked credentials ([OPENAI_KEY_01] and [db_uri_01]) immediately.
3. Send the remediation report to [EMAIL_01] and settle via IBAN [IBAN_01].`}</pre>
            </div>

            <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
              <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                AFTER: 1-Click Restored Output in Tab 2 (&lt; 1 ms Local RAM Swap)
              </div>
              <pre className="leading-relaxed overflow-x-auto max-w-full">{`Summary of Incident for Dr. Sarah Jenkins:
1. The payment attempt on card 4111 1111 1111 1111 from IP 198.51.100.44 was declined.
2. Rotate leaked credentials (sk-proj-9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p and postgres://admin:Sup3rS3cr3t@db.internal:5432/prod) immediately.
3. Send the remediation report to sarah.jenkins@apexhealth.org and settle via IBAN DE89 3704 0044 0532 0130 00.`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 5: 34-DETECTOR / 5-DOMAIN TECHNICAL REFERENCE MATRIX
         ============================================================================ */}
      <section
        aria-labelledby="pii-redactor-reference-matrix"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <h2
          id="pii-redactor-reference-matrix"
          className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          Technical Reference: 34 Built-In Entity Detectors Across 5 Taxonomic Domains
        </h2>
        <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          Every entity type in <code>lib/piiRedactorEngine.ts</code> is paired with a specificity priority score and validation method:
        </p>

        <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
              <tr>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">
                  Taxonomic Domain
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">
                  Supported Entity Types (34)
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">
                  Validation &amp; Anti-False-Positive Guard
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">
                  Sample Token / Synthetic Format
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <th
                  scope="row"
                  className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400"
                >
                  1. Developer Secrets &amp; Cloud Keys (12 Types)
                </th>
                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                  PRIVATE_KEY_PEM, DB_CONNECTION_URI, JWT_TOKEN, OPENAI_API_KEY, ANTHROPIC_API_KEY, AWS_ACCESS_KEY, GITHUB_TOKEN, STRIPE_KEY, SLACK_TOKEN, GOOGLE_CLOUD_KEY, BEARER_AUTH_HEADER, GENERIC_SECRET_KV
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Vendor prefix grammar (<code>sk-proj-</code>, <code>sk-ant-</code>, <code>AKIA</code>, <code>ghp_</code>, <code>eyJ</code>), PEM block matching &amp; JSON/.env key inspection
                </td>
                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                  [OPENAI_KEY_01] / sk-proj-SYNTHETIC_01
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400"
                >
                  2. Financial, Cards &amp; Banking (5 Types)
                </th>
                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                  CREDIT_CARD, IBAN_ACCOUNT, US_ABA_ROUTING, CRYPTO_WALLET, SWIFT_BIC
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Luhn checksum + card brand attribution, ISO 7064 Mod-97-10 IBAN check, ABA 3-7-1 routing check, Bech32/0x wallet grammar
                </td>
                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                  [CARD_PAN_01] / 4111-1111-1111-1101
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400"
                >
                  3. Government, Tax &amp; HIPAA IDs (6 Types)
                </th>
                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                  US_SSN, PK_NADRA_CNIC, UK_NINO, CA_SIN, IN_PAN_TAX_ID, MEDICAL_RECORD_MRN
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  SSA area/group exclusion (000/666/900+), NADRA 13-digit dash grammar, HMRC NINO prefix check, Luhn SIN check, MRN context guard
                </td>
                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                  [US_SSN_01], [PK_CNIC_01], [PATIENT_MRN_01]
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400"
                >
                  4. Personal Contact &amp; Local NER (6 Types)
                </th>
                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                  EMAIL_ADDRESS, PHONE_NUMBER, PERSON_NAME, ORGANIZATION_NAME, STREET_ADDRESS, DATE_OF_BIRTH
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  Honorifics, salutations, corporate suffixes (Inc., LLC, Pvt. Ltd.), JSON/CSV keys, DOB context guard (ignores log timestamps)
                </td>
                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                  [EMAIL_01], [PERSON_01] / Alex Morgan
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-cyan-600 dark:text-cyan-400"
                >
                  5. Network, Infra &amp; Custom (5 Types)
                </th>
                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                  IPV4_ADDRESS, IPV6_ADDRESS, MAC_ADDRESS, SENSITIVE_QUERY_URL, CUSTOM_PATTERN
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  0–255 octet check + optional loopback/RFC1918 preservation (127.0.0.1), URL query token scanner, custom user regex/keywords
                </td>
                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">
                  [IPV4_01] / 198.51.100.1, [CUSTOM_01]
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================================
          SECTION 6: COMPETITOR ARCHITECTURE COMPARISON MATRIX
         ============================================================================ */}
      <section
        aria-labelledby="pii-redactor-competitor-matrix"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <h2
          id="pii-redactor-competitor-matrix"
          className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          Architecture Comparison: KivaroTools vs. Legacy Regex Redactors &amp; Basic Prompt Scrubbers
        </h2>
        <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
              <tr>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">
                  Capability / Engineering Feature
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">
                  KivaroTools 5-Tab PII &amp; Prompt Studio
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                  Legacy Regex Log Redactors
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                  Basic Prompt Anonymizers
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                  Tabular CSV-Only Cleaners
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  1-Click AI Response De-Anonymization (Round-Trip)
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                  Yes — Fuzzy-Tolerant Token &amp; Synthetic Restorer + Vault Export
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                  No (Irreversible one-way destruction)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-amber-600">
                  Exact bracket match only (Breaks if LLM edits brackets)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                  No
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Structure-Aware JSON, CSV &amp; .env Key Inspection
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                  Yes — Inspects JSON/Object Keys While Preserving Valid Syntax
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                  No (Blind to field names like &quot;customer_name&quot;)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                  No
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  CSV columns only (Cannot parse JSON or logs)
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Mathematical Checksums &amp; Global IDs (IBAN, CNIC, NINO, SIN)
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                  Yes — Luhn, ISO 7064 Mod-97-10, ABA, SSN, CNIC, NINO, SIN, PAN
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-amber-600">
                  US SSN &amp; Luhn Card only (Misses IBAN &amp; global IDs)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-amber-600">
                  Basic regex only
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-amber-600">
                  Column heuristics only
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Zero-Download Local NER (Names, Orgs &amp; Addresses)
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                  Yes — Instant (&lt; 5 ms) Hybrid Grammar + Key NER (0 MB Download)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                  Requires 1–2 GB WebGPU download &amp; does not auto-redact
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                  Naive capital-word regex (Flags normal words)
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">
                  Header name only
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                  Masking Modes, Whitelisting &amp; Audit Exports
                </th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                  6 Masking Modes + Per-Value Whitelist + 3-Sheet .XLSX &amp; SHA-256 Receipt
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  3 global modes, plain .txt only
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  2 global modes, copy only
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">
                  CSV export only
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================================
          SECTION 7: 36 TARGET RANKING KEYWORDS & B2B SEARCH WORKFLOW COVERAGE
         ============================================================================ */}
      <section
        aria-labelledby="pii-redactor-keyword-coverage"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2 mb-2">
          <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2
            id="pii-redactor-keyword-coverage"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Supported PII Redaction, Prompt Sanitization &amp; Log Scrubbing Workflows (36 Search Intents)
          </h2>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              AI Prompt Sanitization &amp; Reversible Masking (12 Workflows)
            </h3>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
              <li>client-side pii redactor online free</li>
              <li>ai prompt sanitizer for chatgpt and claude</li>
              <li>anonymize text before pasting into chatgpt</li>
              <li>reversible pii tokenizer and response restorer</li>
              <li>mask emails and names for llm prompts locally</li>
              <li>format-preserving synthetic data masker for ai</li>
              <li>anonymize legal contracts and nda for ai summary</li>
              <li>hipaa clinical note de-identifier in browser ram</li>
              <li>zero-upload gdpr text anonymizer tool</li>
              <li>custom regex organization keyword redactor</li>
              <li>export reversible pii token vault json</li>
              <li>1-click de-anonymize chatgpt claude response</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              DevSecOps Log &amp; Cloud Secret Scrubbing (12 Workflows)
            </h3>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
              <li>redact api keys and secrets from logs online</li>
              <li>scrub openai sk-proj and anthropic sk-ant keys</li>
              <li>remove aws access key akia and github pat from logs</li>
              <li>sanitize database connection string passwords postgres</li>
              <li>redact bearer jwt tokens and pem private keys</li>
              <li>sanitize json webhook payload without breaking syntax</li>
              <li>scrub .env file secrets before sharing in tickets</li>
              <li>redact customer ip addresses keep 127.0.0.1 loopback</li>
              <li>stripe sk_live and slack xoxb token scrubber</li>
              <li>anonymize support ticket logs for zendesk and jira</li>
              <li>url query token and password parameter scrubber</li>
              <li>client-side secret scanner and log anonymizer</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Financial, National ID &amp; Compliance Audits (12 Workflows)
            </h3>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
              <li>luhn verified credit card number redactor online</li>
              <li>iso 7064 mod-97 iban bank account anonymizer</li>
              <li>us social security number ssn redaction tool</li>
              <li>pakistani nadra cnic number masker online</li>
              <li>uk national insurance number nino redactor</li>
              <li>canadian sin and indian pan card anonymizer</li>
              <li>us aba bank routing number checksum scanner</li>
              <li>csv and json pii column anonymizer in browser</li>
              <li>export pii redaction audit report to excel xlsx</li>
              <li>cwe-1236 formula-safe csv pii audit ledger</li>
              <li>sha-256 pii sanitization compliance certificate</li>
              <li>zero-trust browser dlp and data masking studio</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 8: FREQUENTLY ASKED QUESTIONS (16 INTERACTIVE ACCORDIONS)
         ============================================================================ */}
      <section
        aria-labelledby="pii-redactor-frequently-asked-questions"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2
            id="pii-redactor-frequently-asked-questions"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Frequently Asked Questions (16 Technical &amp; Privacy FAQs)
          </h2>
        </div>

        <div className="space-y-3">
          {PII_REDACTOR_FAQS.map((faq, index) => (
            <details
              key={index}
              className="group rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
            >
              <summary className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base cursor-pointer select-none list-none flex items-center justify-between gap-3">
                <span>{faq.question}</span>
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
          SECTION 9: INTERNAL CROSS-LINKING TO RELATED DEVELOPER & PRIVACY TOOLS
         ============================================================================ */}
      <section
        aria-labelledby="pii-redactor-related-utilities"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2
            id="pii-redactor-related-utilities"
            className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Related Client-Side Privacy, Security &amp; Developer Utilities
          </h2>
        </div>
        <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed break-words">
          Chain prompt sanitization with our other 100% in-browser security and developer tools:
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
              Inspect 7-phase HTTP waterfalls, decode SAML 2.0 &amp; JWT tokens, scrub 14 network capture surfaces, and export to k6 &amp; Playwright.
            </p>
          </Link>

          <Link
            href="/document/pdf-scrubber"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              PDF Bank Statement &amp; Invoice Data Scrubber →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Permanently redact IBANs, Luhn Card PANs, Tax IDs, and hidden XMP/Info PDF metadata before uploading documents.
            </p>
          </Link>

          <Link
            href="/seo/llms-txt-generator"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              llms.txt &amp; AI Crawler (robots.txt) Studio →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Compile llmstxt.org v2 documentation indexes and configure 45 AI search &amp; training crawlers without RFC 9309 inheritance leaks.
            </p>
          </Link>

          <Link
            href="/developer/json-formatter"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              JSON Formatter, Validator &amp; 64-Bit BigInt Scanner →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Format, minify, and validate up to 25 MB of JSON in a Web Worker while detecting duplicate keys and IEEE-754 integer truncation.
            </p>
          </Link>

          <Link
            href="/developer/jwt-debugger"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              JWT, PASETO &amp; SAML 2.0 Security Debugger →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Decode and verify JWS, 5-part JWE, SD-JWT, PASETO v1–v4, and SAML 2.0 assertions against 16 security rules locally.
            </p>
          </Link>

          <Link
            href="/developer/regex-tester"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              Regex Tester &amp; ReDoS Vulnerability Linter →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Design and benchmark custom PII detection regular expressions with real-time capture groups and ReDoS safety scoring.
            </p>
          </Link>
        </div>
      </section>
    </article>
  );
}