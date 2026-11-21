import React from 'react';
import Link from 'next/link';
import {
  ArrowRightLeft,
  Code2,
  Cpu,
  Layers,
  Terminal,
  HelpCircle,
  Sparkles,
  Search,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';

export interface SeoMetaConfig {
  title: string;
  description: string;
  slug: string;
  category: string;
  canonicalUrl: string;
  keywords: string[];
}

export const YAML_JSON_SEO_META: SeoMetaConfig = {
  title:
    'YAML to JSON & JSON to YAML Converter, CST Validator & DevOps Linter Online | KivaroTools',
  description:
    'Convert YAML to JSON and JSON/JSONC to YAML 100% locally in your browser. Features YAML 1.2 vs 1.1 Norway Problem detection (NO, on, off, 0755), multi-document (---) Kubernetes stream support, << merge key resolution, 64-bit BigInt precision protection, exact line/column error highlighting, and built-in Kubernetes, Docker Compose, GitHub Actions & OpenAPI linting.',
  slug: 'yaml-json-converter',
  category: 'developer',
  canonicalUrl: 'https://kivarotools.com/developer/yaml-json-converter',
  keywords: [
    'yaml to json converter online',
    'json to yaml converter and formatter',
    'yaml validator with line error highlighting',
    'yaml 1.2 vs 1.1 norway problem detector',
    'multi-document yaml --- to json array converter',
    'yaml anchor alias and merge key << resolver',
    '64-bit bigint safe yaml to json parser',
    'jsonc with comments to yaml converter',
    'kubernetes manifest and docker compose yaml linter',
    'github actions workflow on: push yaml validator',
    'convert yaml to ndjson json lines online',
    'client-side zero-upload yaml json studio',
  ],
};

export interface FaqItem {
  question: string;
  answer: string;
}

export const YAML_JSON_FAQS: FaqItem[] = [
  {
    question:
      'What is the difference between YAML 1.2 and YAML 1.1 ("The Norway Problem"), and why do most online YAML-to-JSON converters corrupt country codes and GitHub Actions triggers?',
    answer:
      'Under the legacy YAML 1.1 specification (published in 2005 and still used by Python PyYAML and older online tools like json2yaml.com), 22 bare literals—including y, n, yes, no, NO, on, off, On, and Off—are implicitly coerced into boolean true or false. When a developer enters country code "NO" (Norway) or a GitHub Actions trigger "on: push", a YAML 1.1 parser silently converts them into boolean false or true. YAML 1.2 (the modern standard) restricts boolean literals strictly to true and false. KivaroTools defaults to strict YAML 1.2 while providing a live "Norway & BigInt X-Ray" tab and a 1-click "Auto-Quote Norway Traps" button so you can see and fix every scalar that behaves differently between YAML 1.1 and YAML 1.2.',
  },
  {
    question:
      'Are my Kubernetes manifests, Docker Compose files, CI/CD secrets, or JSON payloads uploaded to any server?',
    answer:
      'No. All YAML and JSON parsing, multi-document stream splitting, anchor/merge-key resolution, 64-bit BigInt protection, DevOps schema linting, and Excel/CSV audit generation run 100% locally in your browser RAM via lib/yamlJsonEngine.ts. None of your configuration files ever leave your device.',
  },
  {
    question:
      'Why do standard online YAML-to-JSON converters fail when I paste a Kubernetes manifest containing "---" document separators?',
    answer:
      'Most browser converters call a single-document parser function (like js-yaml.load()), which throws a "expected a single document in the stream, but found more" syntax error as soon as it encounters a second "---" document separator (such as a Kubernetes Deployment followed by a Service). KivaroTools natively parses multi-document YAML streams and lets you export them as a JSON Array ([doc1, doc2]), Newline-Delimited JSON (NDJSON / JSON Lines), or inspect each document individually in the Stream Docs tab.',
  },
  {
    question:
      'How does the engine handle YAML Anchors (&anchor), Aliases (*alias), and Merge Keys (<<: *alias)?',
    answer:
      'When you define a reusable configuration block with an anchor (for example, "&defaultLabels") and reference it via an alias ("*defaultLabels") or a merge key ("<<: *defaultLabels"), our parser clones the anchored object and merges its properties into the target mapping without overwriting keys explicitly defined on the child object. It also enforces a 1,000-expansion ceiling to protect your browser against recursive "Billion Laughs" YAML alias bombs.',
  },
  {
    question:
      'Why do standard JavaScript YAML and JSON converters corrupt 64-bit integers like Snowflake IDs, Discord IDs, or AWS record numbers?',
    answer:
      'Standard JavaScript parsers convert all numbers into IEEE-754 double-precision floats, which only have 53 bits of significand precision (Number.MAX_SAFE_INTEGER = 9,007,199,254,740,991). Any 64-bit integer above that threshold—such as "9007199254740993"—is silently rounded to "9007199254740992" by JSON.parse() and js-yaml. KivaroTools inspects integer tokens using native BigInt before float conversion and lets you preserve exact unquoted digits in JSON/YAML output or wrap them safely as strings.',
  },
  {
    question:
      'How does Duplicate Key Detection protect my Docker Compose and Kubernetes configurations?',
    answer:
      'If a YAML mapping or JSON/JSONC object accidentally defines the same key twice in the same scope (for example, two "environment:" or "ports:" blocks in the same service), standard converters and JSON.parse() silently discard the first block and keep only the last one. KivaroTools runs both a YAML mapping scope tracker and a lexical JSON object-key scanner to flag every duplicate key (YAML_DUPLICATE_KEY and JSON_DUPLICATE_KEY) with its exact 1-based line number and key path.',
  },
  {
    question:
      'Why does YAML forbid Tab characters for indentation, and how does the validator report them?',
    answer:
      'Section 6.1 of the YAML specification strictly prohibits Tab characters (\\t) in indentation because different editors render tabs as 2, 4, or 8 columns, making structural indentation ambiguous. Whenever our tokenizer encounters a leading Tab character outside a literal block scalar, it pinpoints the exact 1-indexed line and column and shows visual arrow markers so you can replace tabs with spaces.',
  },
  {
    question:
      'Can I preserve YAML "#" comments when converting to JSON, or convert JSONC ("//" and "/* */" comments) to YAML?',
    answer:
      'Yes. While strict RFC 8259 JSON does not allow comments, many modern toolchains (such as VS Code settings, TypeScript tsconfig.json, and Deno/Bun configs) use JSON with Comments (JSONC). Enabling "Preserve # ↔ // Comments (JSONC)" converts extracted YAML "#" comments into "//" header comments in JSONC mode, and converts "//" and "/* */" comments from JSONC into clean "#" comments when converting JSON to YAML.',
  },
  {
    question:
      'How do Literal ("|") and Folded (">") Block Scalars work during YAML-to-JSON conversion?',
    answer:
      'In YAML, the pipe indicator ("|") preserves internal newlines literally (ideal for embedded bash scripts in GitHub Actions or PEM certificates), while the greater-than indicator (">") folds single newlines into spaces. Our parser also honors chomping modifiers: strip ("|-" and ">-") removes trailing newlines, clip ("|" and ">") keeps a single trailing newline, and keep ("|+" and ">+") preserves trailing blank lines.',
  },
  {
    question:
      'What happens to unquoted colon values like Docker ports ("5432:5432" or "22:22") in YAML 1.1 vs YAML 1.2?',
    answer:
      'In YAML 1.1, unquoted numbers separated by colons where each segment is under 60 (such as "22:22" or "1:30:00") are parsed as sexagesimal (base-60) integers—turning port mapping "22:22" into integer 1342! In YAML 1.2, sexagesimal literals were removed so "22:22" remains a string. Our Norway Trap X-Ray highlights every base-60 colon value and lets you quote it in one click.',
  },
  {
    question:
      'How does the built-in DevOps Schema Linter validate Kubernetes, Docker Compose, GitHub Actions, and OpenAPI files?',
    answer:
      'When DevOps Schema Linter is set to "Auto-Detect", the engine inspects the parsed AST root keys: (1) For Kubernetes (apiVersion + kind), it verifies metadata.name, flags mutable ":latest" container image tags, warns on privileged containers (securityContext.privileged: true), and checks for CPU/memory resource limits; (2) For Docker Compose (services), it checks that every service defines image or build and notes obsolete top-level version keys; (3) For GitHub Actions (on + jobs), it checks job runs-on fields and warns if "on:" was coerced to boolean true; and (4) For OpenAPI 3.x, it validates info.title, info.version, and paths.',
  },
  {
    question:
      'What is the difference between Minimal, Single, and Double quote styles when converting JSON to YAML?',
    answer:
      'In "Minimal" mode (the idiomatic YAML default), strings are emitted unquoted unless they contain reserved YAML indicators (colons, hashes, brackets), leading/trailing whitespace, numeric strings, or YAML 1.1/1.2 boolean/null literals (like "NO" or "true", which are automatically quoted so they never misparse). "Single" wraps all string scalars in single quotes (escaping internal single quotes as \'\'), and "Double" wraps all strings in JSON-style double quotes.',
  },
  {
    question:
      'How does the "Swap Input ↔ Output" button help verify round-trip conversion fidelity?',
    answer:
      'Clicking "Swap Input ↔ Output" takes the currently generated JSON (or YAML) output, places it into the left source editor, and flips the conversion direction. This lets you immediately test round-trip serialization (YAML → JSON → YAML) and confirm that all data types, 64-bit integers, and nested arrays remain 100% intact.',
  },
  {
    question:
      'What is included in the 3-Sheet Excel (.xlsx) and CSV Audit Exports?',
    answer:
      'Clicking "Audit .XLSX" generates a native 3-sheet OpenXML workbook in browser memory: Sheet 1 ("Audit Summary") records document counts, key depth, anchor/merge counts, and schema status; Sheet 2 ("Syntax and DevOps Lint") lists every syntax error, duplicate key, and K8s/Docker/GHA lint finding with line numbers and remediation steps; and Sheet 3 ("Norway Traps and BigInt") itemizes every YAML 1.1 vs 1.2 coercion risk and 64-bit integer.',
  },
  {
    question:
      'How are exported Excel (.xlsx) and CSV audit files protected against Spreadsheet Formula Injection (CWE-1236)?',
    answer:
      'Any key path, snippet, or scalar value beginning with formula trigger characters (=, +, -, @, Tab, or CR) is automatically prefixed with a leading single quote (\') and stripped of illegal XML control characters before writing to CSV or OpenXML cells.',
  },
  {
    question:
      'How does KivaroTools compare to json2yaml.com, onlineyamltools.com, codebeautify.org, and transform.tools?',
    answer:
      'Legacy tools like json2yaml.com use YAML 1.1 (corrupting NO/on/off into booleans), onlineyamltools.com and codebeautify.org fail on multi-document "---" Kubernetes streams and truncate 64-bit integers above 2^53 - 1, and transform.tools lacks YAML 1.1 vs 1.2 diffing and DevOps schema linting. KivaroTools combines YAML 1.2/1.1 Norway trap diffing, multi-document stream modes, << merge key toggles, 64-bit BigInt protection, and DevOps linting in one zero-upload studio.',
  },
];

export default function YamlJsonSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: YAML_JSON_FAQS.map((faq) => ({
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
    name: 'How to Convert YAML to JSON, JSON to YAML, and Validate DevOps Manifests Online',
    description:
      'Step-by-step guide to converting YAML 1.2/1.1 and JSON/JSONC files, resolving anchors and merge keys, detecting Norway Problem boolean traps, protecting 64-bit integers, and linting Kubernetes, Docker Compose, and GitHub Actions configs in your browser.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Paste or Upload Your YAML or JSON/JSONC Configuration',
        text: 'Paste your YAML manifest, multi-document Kubernetes stream (---), Docker Compose file, GitHub Actions workflow, or JSON/JSONC payload into the source editor, drop a file up to 15 MB, or click one of the 4 built-in DevOps sample presets.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Configure YAML 1.2 vs 1.1 Spec, Multi-Doc Mode & 64-Bit BigInt Guard',
        text: 'Select your conversion direction (YAML → JSON, JSON → YAML, or Auto-Detect), choose YAML 1.2 Strict or YAML 1.1 Legacy mode, pick how multi-document streams (---) should format (JSON Array, NDJSON, or First Document), and choose how 64-bit integers (> 2^53 - 1) are preserved.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Inspect Linter Diagnostics & Norway Trap X-Ray',
        text: 'Switch to the "Linter & Diagnostics" tab to review exact line/column syntax errors, duplicate keys, and Kubernetes/Docker/GitHub Actions lint checks, or open "Norway & BigInt X-Ray" and click "Auto-Quote Norway Traps" to fix ambiguous scalars (NO, on, off, 0755) in one click.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Copy Converted Code or Export .JSON, .YAML, .NDJSON & 3-Sheet Audit .XLSX',
        text: 'Copy the formatted output to your clipboard in one click, download the converted .json, .yaml, or .ndjson file, or export a CWE-1236-safe 3-Sheet Excel (.xlsx) validation report.',
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
          SECTION 1: TITLE, DESCRIPTION & EXECUTIVE OVERVIEW
         ============================================================================ */}
      <section
        aria-labelledby="yaml-json-studio-overview"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h2
            id="yaml-json-studio-overview"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            YAML ↔ JSON Converter, CST Validator &amp; DevOps Linter
          </h2>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shrink-0">
            <Sparkles className="h-3.5 w-3.5" />
            YAML 1.2 + 1.1 Diff • Multi-Doc • 64-Bit BigInt Safe
          </span>
        </div>

        <p className="mt-3 w-full text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          Convert <strong>YAML to JSON</strong> and <strong>JSON / JSONC to YAML</strong> with 100% client-side privacy. Engineered for DevOps, platform, and full-stack teams with <strong>YAML 1.2 vs. 1.1 &quot;Norway Problem&quot; detection</strong>, <strong>multi-document (<code>---</code>) Kubernetes stream parsing</strong>, <strong>anchor (<code>&amp;</code>) and merge key (<code>&lt;&lt;</code>) resolution</strong>, <strong>lossless 64-bit <code>BigInt</code> protection</strong>, <strong>exact line and column syntax error pinpointing</strong>, and built-in <strong>Kubernetes, Docker Compose, GitHub Actions, and OpenAPI linting</strong>.
        </p>

        <blockquote className="p-4 my-6 bg-emerald-50/80 border-l-4 border-emerald-600 rounded-r-xl dark:bg-slate-800/80 not-italic">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
            <strong>100% Local Browser RAM Execution:</strong> Your Kubernetes manifests, Helm values, Docker Compose stacks, GitHub Actions workflows, and JSON configs are parsed and converted entirely inside your browser memory via <code>lib/yamlJsonEngine.ts</code>. Zero files or secrets are ever transmitted to any external server.
          </p>
        </blockquote>

        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
          <p>
            Almost every existing online YAML-to-JSON converter—including JSON2YAML.com, OnlineYAMLTools, CodeBeautify, and Transform.tools—suffers from critical specification blind spots that break production infrastructure configs. Legacy YAML 1.1 converters silently turn unquoted country code <code>NO</code> (Norway), GitHub Actions trigger <code>on: push</code>, and environment flag <code>SSL_ENABLED: yes</code> into booleans (<code>false</code>/<code>true</code>), and parse leading-zero file permissions like <code>0755</code> or colon port mappings like <code>22:22</code> as octal (<code>493</code>) or base-60 sexagesimal (<code>1342</code>) integers. Meanwhile, basic browser wrappers built on single-document <code>js-yaml.load()</code> crash as soon as you paste a multi-document Kubernetes file separated by <code>---</code>, silently overwrite duplicate mapping keys, and round 64-bit Snowflake IDs above <code>2^53 - 1</code> (`9007199254740991`) into corrupted floats.
          </p>
          <p>
            KivaroTools eliminates every one of those failure modes in a single bidirectional studio—giving you side-by-side <strong>YAML 1.2 vs. YAML 1.1 evaluation</strong>, <strong>1-click Norway Trap auto-quoting</strong>, <strong>multi-document JSON Array &amp; NDJSON export</strong>, <strong>64-bit integer protection</strong>, and <strong>real-time DevOps manifest linting</strong>.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              YAML 1.2 vs. 1.1 Norway Trap X-Ray
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Detects every unquoted <code>NO</code>, <code>yes</code>, <code>on</code>, <code>off</code>, octal <code>0755</code>, and base-60 <code>22:22</code> scalar that changes type between YAML 1.1 and YAML 1.2, with 1-click auto-quoting.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
              <Code2 className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              Multi-Doc (<code>---</code>), Anchors &amp; <code>&lt;&lt;</code> Merge
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Parses multi-document Kubernetes streams into JSON Arrays or NDJSON, resolves <code>&amp;anchor</code> / <code>*alias</code> / <code>&lt;&lt;</code> inheritance, and guards against recursive alias bombs.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              64-Bit BigInt Guard &amp; DevOps Linter
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Prevents IEEE-754 rounding on 64-bit IDs, flags duplicate keys and tab indentation with exact line/column offsets, and lints Kubernetes, Docker Compose, GitHub Actions, and OpenAPI specs.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 2: HOW THE TOOL WORKS INTERNALLY (5-STAGE PIPELINE)
         ============================================================================ */}
      <section
        aria-labelledby="yaml-json-working-pipeline"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2.5 mb-2">
          <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2
            id="yaml-json-working-pipeline"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            How the Tool Works Internally: 5-Stage Client-Side Architecture (<code>v2.7.0-enterprise</code>)
          </h2>
        </div>
        <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          Every YAML manifest and JSON/JSONC document passes through five deterministic stages inside <code>lib/yamlJsonEngine.ts</code>:
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
              1
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Stream Splitter &amp; Tab Guard
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Splits multi-document <code>---</code> / <code>...</code> boundaries outside literal block scalars (<code>|</code> / <code>&gt;</code>), extracts <code>#</code> and <code>{'//'}</code> comments, and checks for illegal Tab indentation.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
              2
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recursive Block &amp; Flow Parser
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Parses nested block mappings, indented and indentless sequences, compact inline sequence maps, flow collections (<code>{`{}`}</code> / <code>[]</code>), and chomped block scalars (<code>|-</code>, <code>|+</code>, <code>&gt;-</code>).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white">
              3
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Norway 1.1/1.2 &amp; BigInt Scanner
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Evaluates scalars under YAML 1.2 Core Schema or YAML 1.1 rules, recording every boolean/octal/sexagesimal coercion trap and guarding 64-bit integers above <code>2^53 - 1</code>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
              4
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Anchor, Alias &amp; Merge Resolver
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Resolves <code>&amp;anchor</code> definitions, <code>*alias</code> pointers, and <code>&lt;&lt;</code> single/array merge keys while tracking per-object duplicate keys and enforcing a 1,000-alias DoS cap.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
              5
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              DevOps Linter &amp; Serializer
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Runs Kubernetes, Docker Compose, GitHub Actions, and OpenAPI structural lint rules and serializes formatted JSON, NDJSON, YAML, or CWE-1236-safe 3-Sheet <code>.xlsx</code> audit reports.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 3: STEP-BY-STEP GUIDE (HOW TO USE THE TOOL)
         ============================================================================ */}
      <section
        aria-labelledby="yaml-json-user-guide"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
      >
        <div>
          <h2
            id="yaml-json-user-guide"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            How to Use the YAML ↔ JSON Converter &amp; Validator (Step-by-Step Guide)
          </h2>
          <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            Follow these four steps to convert, validate, and audit YAML and JSON configurations in your browser:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 1: Paste or Upload Your YAML or JSON/JSONC File
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Paste your YAML or JSON/JSONC snippet into the left editor, drag and drop a <code>.yaml</code>, <code>.yml</code>, <code>.json</code>, or <code>.jsonc</code> file up to 15 MB, or click one of the 4 built-in presets (<strong>K8s Multi-Doc + Norway Trap</strong>, <strong>Docker Compose</strong>, <strong>GitHub Actions</strong>, or <strong>JSON → YAML</strong>).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 2: Choose YAML Spec (1.2 vs. 1.1), Multi-Doc &amp; BigInt Options
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Keep <strong>YAML 1.2 Strict</strong> selected to prevent <code>NO</code>/<code>on</code>/<code>off</code> boolean corruption, or switch to <strong>YAML 1.1 Legacy</strong> to simulate older Python <code>PyYAML</code> behavior. Choose how multi-document <code>---</code> streams export (<strong>JSON Array</strong>, <strong>NDJSON</strong>, or <strong>First Document</strong>) and how 64-bit integers are preserved.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 3: Review Linter Diagnostics &amp; Auto-Quote Norway Traps
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Open the <strong>Linter &amp; Diagnostics</strong> tab to inspect exact line/column syntax errors, duplicate keys, and Kubernetes/Docker/GitHub Actions recommendations. Open <strong>Norway &amp; BigInt X-Ray</strong> and click <strong>Auto-Quote Norway Traps</strong> to wrap ambiguous scalars in quotes automatically.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 4: Swap Direction, Copy Output, or Export Audit .XLSX
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Click <strong>Swap Input ↔ Output</strong> to test round-trip conversion, click <strong>Copy Output</strong> or download <code>.JSON</code> / <code>.YAML</code> / <code>.NDJSON</code> directly, or click <strong>Audit .XLSX</strong> to download a 3-sheet compliance workbook.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 4: REAL-WORLD BEFORE VS. AFTER EXAMPLES (3 SHOWCASES)
         ============================================================================ */}
      <section
        aria-labelledby="yaml-json-real-examples"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2
              id="yaml-json-real-examples"
              className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Real-World Examples: How KivaroTools Prevents Production Config Bugs
            </h2>
          </div>
          <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            Compare how legacy YAML 1.1 / <code>js-yaml</code> tools corrupt real DevOps configs versus how KivaroTools parses them:
          </p>
        </div>

        {/* Example 1 */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Example 1: The YAML 1.1 &quot;Norway Problem&quot;, Octal Permissions &amp; 64-Bit Snowflake IDs
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs font-mono text-slate-300 overflow-x-auto">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400 mb-2">
                Source YAML Input (With Unquoted NO, on, 0755 &amp; 64-Bit ID)
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed">{`country_code: NO
feature_flag: on
chmod_mode: 0755
ssh_port_map: 22:22
snowflake_id: 9007199254740993`}</pre>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs font-mono text-emerald-300 overflow-x-auto">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
                KivaroTools YAML 1.2 Strict + Exact BigInt Output (vs. Legacy Corruption)
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed">{`{
  "country_code": "NO",        // Legacy YAML 1.1 outputs: false
  "feature_flag": "on",        // Legacy YAML 1.1 outputs: true
  "chmod_mode": 755,           // Legacy YAML 1.1 outputs: 493 (octal)
  "ssh_port_map": "22:22",     // Legacy YAML 1.1 outputs: 1342 (base-60)
  "snowflake_id": 9007199254740993 // Standard JS outputs: 9007199254740992
}`}</pre>
            </div>
          </div>
        </div>

        {/* Example 2 */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Example 2: Resolving YAML Anchors (<code>&amp;</code>) and Merge Keys (<code>&lt;&lt;: *alias</code>) into Clean JSON
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs font-mono text-slate-300 overflow-x-auto">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-2">
                Source YAML with Anchor &amp; Override
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed">{`defaults: &baseConfig
  timeout: 30
  retries: 3
production:
  <<: *baseConfig
  retries: 5`}</pre>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs font-mono text-emerald-300 overflow-x-auto">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
                Resolved JSON Output (Child Override Preserved)
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed">{`{
  "defaults": {
    "timeout": 30,
    "retries": 3
  },
  "production": {
    "timeout": 30,
    "retries": 5
  }
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 5: YAML 1.2 VS YAML 1.1 SPECIFICATION & DEVOPS LINTER REFERENCE
         ============================================================================ */}
      <section
        aria-labelledby="yaml-json-spec-reference"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <h2
          id="yaml-json-spec-reference"
          className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          Technical Reference: YAML 1.2 vs. YAML 1.1 Coercion Rules &amp; DevOps Linter Checks
        </h2>
        <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
              <tr>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700">
                  Scalar / Construct
                </th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700">
                  Example Input
                </th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">
                  YAML 1.2 Core Schema (Default)
                </th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">
                  YAML 1.1 Legacy Mode
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
              <tr>
                <td className="py-3 px-4 font-bold">Norway / Boolean Literals</td>
                <td className="py-3 px-4 font-mono">NO, no, yes, on, off, y, n</td>
                <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400">
                  String (&quot;NO&quot;, &quot;on&quot;, &quot;yes&quot;)
                </td>
                <td className="py-3 px-4 font-mono text-amber-600 dark:text-amber-400">
                  Boolean (false / true)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold">Standard Booleans</td>
                <td className="py-3 px-4 font-mono">true, True, TRUE, false, False</td>
                <td className="py-3 px-4 font-mono">Boolean (true / false)</td>
                <td className="py-3 px-4 font-mono">Boolean (true / false)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold">Leading-Zero Integers</td>
                <td className="py-3 px-4 font-mono">0755 vs 0o755</td>
                <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400">
                  0755 = 755 (Decimal); 0o755 = 493 (Octal)
                </td>
                <td className="py-3 px-4 font-mono text-amber-600 dark:text-amber-400">
                  0755 = 493 (Implicit Octal)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold">Colon-Separated Numbers</td>
                <td className="py-3 px-4 font-mono">22:22, 1:30:00</td>
                <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400">
                  String (&quot;22:22&quot;, &quot;1:30:00&quot;)
                </td>
                <td className="py-3 px-4 font-mono text-amber-600 dark:text-amber-400">
                  Base-60 Integer (1342, 5400)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold">64-Bit Integers (&gt; 2^53 - 1)</td>
                <td className="py-3 px-4 font-mono">9007199254740993</td>
                <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400">
                  Exact 9007199254740993 (BigInt Guard)
                </td>
                <td className="py-3 px-4 font-mono">
                  Truncates to 9007199254740992 in standard JS
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================================
          SECTION 6: HONEST COMPARISON WITH POPULAR ONLINE TOOLS
         ============================================================================ */}
      <section
        aria-labelledby="yaml-json-competitor-matrix"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <h2
          id="yaml-json-competitor-matrix"
          className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          Comparison with Popular Tools: KivaroTools vs. JSON2YAML, OnlineYAMLTools, CodeBeautify &amp; Transform.tools
        </h2>
        <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-[760px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
              <tr>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700">
                  Capability / Engineering Feature
                </th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">
                  KivaroTools YAML ↔ JSON Studio
                </th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700">
                  JSON2YAML.com / Online YAML Parser
                </th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700">
                  OnlineYAMLTools / CodeBeautify
                </th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700">
                  Transform.tools / Swagger Editor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
              <tr>
                <td className="py-3 px-4 font-semibold">
                  YAML 1.2 vs. 1.1 &quot;Norway Problem&quot; Diff &amp; Auto-Fix
                </td>
                <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                  Yes (Dual 1.2/1.1 Switch + 1-Click Auto-Quote)
                </td>
                <td className="py-3 px-4">No (Locked on legacy YAML 1.1)</td>
                <td className="py-3 px-4">No diff or warning</td>
                <td className="py-3 px-4">No diff or warning</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">
                  Multi-Document (<code>---</code>) Stream Support
                </td>
                <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                  Yes (JSON Array, NDJSON &amp; Per-Doc Explorer)
                </td>
                <td className="py-3 px-4">Throws single-document error</td>
                <td className="py-3 px-4">Throws syntax error on 2nd <code>---</code></td>
                <td className="py-3 px-4">Single document only</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">
                  64-Bit Integer Precision Guard (&gt; 2^53 - 1)
                </td>
                <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                  Yes (Exact Unquoted Digits or String Mode)
                </td>
                <td className="py-3 px-4">Silently truncates to Float64</td>
                <td className="py-3 px-4">Silently truncates to Float64</td>
                <td className="py-3 px-4">Silently truncates to Float64</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">
                  Anchors (<code>&amp;</code>), Aliases (<code>*</code>) &amp; Merge Keys (<code>&lt;&lt;</code>)
                </td>
                <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                  Yes (Toggleable &lt;&lt; Resolution + DoS Guard)
                </td>
                <td className="py-3 px-4">Basic resolution only</td>
                <td className="py-3 px-4">No toggle for merge keys</td>
                <td className="py-3 px-4">No toggle for merge keys</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">
                  Kubernetes, Docker Compose, GitHub Actions &amp; OpenAPI Linter
                </td>
                <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                  All 4 Schemas Built-In with Auto-Detection
                </td>
                <td className="py-3 px-4">No schema linting</td>
                <td className="py-3 px-4">No schema linting</td>
                <td className="py-3 px-4">Swagger Editor supports OpenAPI only</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">
                  Comment Preservation (<code>#</code> ↔ JSONC <code>{'//'}</code>) &amp; Audit .XLSX
                </td>
                <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                  Yes (JSONC Round-Trip + 3-Sheet .XLSX Export)
                </td>
                <td className="py-3 px-4">Strips all comments</td>
                <td className="py-3 px-4">Strips all comments</td>
                <td className="py-3 px-4">Strips all comments</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================================
          SECTION 7: 36 LOW-COMPETITION, LONG-TAIL KEYWORDS & WORKFLOW COVERAGE
         ============================================================================ */}
      <section
        aria-labelledby="yaml-json-keyword-coverage"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2 mb-2">
          <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2
            id="yaml-json-keyword-coverage"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Low-Competition, High-Intent Long-Tail Keywords &amp; Supported Workflows (36 Search Intents)
          </h2>
        </div>
        <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          Every developer workflow listed below is directly supported and verified in <code>lib/yamlJsonEngine.ts</code>:
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              1. Bidirectional YAML ↔ JSON &amp; Stream Conversion (12 Workflows)
            </h3>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
              <li>convert yaml to json online without losing 64-bit integers</li>
              <li>multi-document yaml --- to json array converter online</li>
              <li>convert kubernetes multi-resource yaml to ndjson json lines</li>
              <li>jsonc with comments and trailing commas to yaml converter</li>
              <li>resolve yaml anchors aliases and merge keys &lt;&lt; to json</li>
              <li>preserve yaml # comments as jsonc // comments online</li>
              <li>convert multiline yaml pipe | and folded &gt; strings to json</li>
              <li>json to yaml converter minimal single double quote styles</li>
              <li>alphabetical key sorter for yaml and json configuration files</li>
              <li>minify yaml to compact single-line json payload online</li>
              <li>client-side zero-upload yaml to json converter for secrets</li>
              <li>round-trip yaml to json to yaml fidelity tester in browser</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              2. YAML 1.2 vs. 1.1 Validation &amp; Bug Detection (12 Workflows)
            </h3>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
              <li>yaml 1.2 vs yaml 1.1 norway problem online detector</li>
              <li>fix unquoted NO yes on off boolean coercion in yaml</li>
              <li>auto-quote ambiguous yaml 1.1 scalars in 1 click</li>
              <li>detect duplicate mapping keys in yaml and docker compose</li>
              <li>yaml tab indentation error finder with line and column</li>
              <li>yaml octal 0755 vs 0o755 permission number validator</li>
              <li>detect yaml 1.1 base-60 sexagesimal port mapping trap 22:22</li>
              <li>protect 64-bit snowflake and discord ids in yaml to json</li>
              <li>yaml unclosed quote and flow bracket syntax error locator</li>
              <li>detect undefined yaml *alias references and circular anchors</li>
              <li>export yaml validation audit report to 3-sheet excel xlsx</li>
              <li>cwe-1236 safe csv diagnostic export for yaml syntax audits</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              3. Cloud-Native &amp; DevOps Manifest Linting (12 Workflows)
            </h3>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
              <li>kubernetes deployment and service yaml validator online</li>
              <li>check kubernetes yaml for mutable :latest image tags</li>
              <li>audit kubernetes containers for missing cpu memory limits</li>
              <li>docker compose yaml syntax validator and duplicate key checker</li>
              <li>github actions workflow yaml validator on: push trigger check</li>
              <li>verify github actions jobs runs-on runner configuration</li>
              <li>openapi 3.1 and swagger yaml to json converter and linter</li>
              <li>helm values.yaml anchor and merge key previewer to json</li>
              <li>ansible playbook and cloudformation yaml syntax checker</li>
              <li>gitlab ci and circleci config.yml to json structure inspector</li>
              <li>validate traefik and envoy proxy yaml configuration online</li>
              <li>offline browser devops config converter and schema auditor</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================================
          SECTION 8: FREQUENTLY ASKED QUESTIONS (16 INTERACTIVE ACCORDIONS)
         ============================================================================ */}
      <section
        aria-labelledby="yaml-json-faq-heading"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2.5 mb-6">
          <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2
            id="yaml-json-faq-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Frequently Asked Questions (16 Technical, Spec &amp; DevOps FAQs)
          </h2>
        </div>

        <div className="space-y-3">
          {YAML_JSON_FAQS.map((faq, index) => (
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
          SECTION 9: RELATED KIVAROTOOLS UTILITIES & INTERNAL LINKING MESH
         ============================================================================ */}
      <section
        aria-labelledby="yaml-json-related-tools"
        className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2
            id="yaml-json-related-tools"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Explore Related Developer, Data &amp; Security Utilities on KivaroTools
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Pair YAML and JSON validation with our other 100% client-side developer tools:
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/developer/json-formatter"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              JSON Formatter, Validator &amp; 64-Bit BigInt Scanner →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Inspect, query with JSONPath, and generate TypeScript/Zod schemas from converted JSON payloads up to 25 MB.
            </p>
          </Link>

          <Link
            href="/developer/har-analyzer"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              HAR File Analyzer &amp; 14-Surface Secret Sanitizer →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Analyze HTTP network waterfalls and scrub API keys, JWTs, and session cookies before sharing logs.
            </p>
          </Link>

          <Link
            href="/developer/sqlite-viewer"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              SQLite &amp; DuckDB Wasm Database Viewer →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Run SQL queries, inspect B-Tree pages, and generate ER diagrams on local SQLite and DuckDB files in RAM.
            </p>
          </Link>

          <Link
            href="/developer/parquet-viewer"
            className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
          >
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              Parquet, Avro, Feather &amp; ORC Viewer →
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Explore columnar data lakes and convert between Parquet, Arrow, CSV, and JSON in your browser.
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
              Generate llmstxt.org documentation indexes and robots.txt rules for 45 AI search and training bots.
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
              Permanently redact confidential PII and hidden metadata from PDF documents in browser memory.
            </p>
          </Link>
        </div>
      </section>
    </article>
  );
}