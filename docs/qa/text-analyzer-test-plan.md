# OmniTools Text Analyzer — Comprehensive QA & Test Plan

**Document Date:** 2026-10-17
**Lead QA Engineer:** Specialist QA & Cross-Browser Verification Team
**Tool Target:** `text-analyzer` (`/seo/text-analyzer`)
**Scope:** Automated Unit/Regression Tests, Interaction QA, Responsive Viewport Testing, SEO Validation, and Security Audits

---

## 1. Quality Objectives & Pass Criteria

The objective of this test plan is to verify that the OmniTools Word Counter & Text Analyzer satisfies enterprise-grade standards across five pillars:
1. **Mathematical & Unicode Precision:** Tokenization, graphemes, word boundaries, numerical preservation, and readability formulas compute deterministically.
2. **Interactive UI Resilience:** Keystroke updates, sample text loading, goal progress tracking, file imports, text transforms, and clipboard operations function without error.
3. **Responsive Stability:** Flawless rendering with zero horizontal overflow, clipping, or overlap across viewports from 320px to 1440px.
4. **On-Page & Technical SEO:** Valid, non-duplicated JSON-LD schema (FAQPage and SoftwareApplication), exactly one H1, canonical URL, descriptive title/meta description, and sitemap inclusion.
5. **Zero-Server Privacy:** 100% in-browser memory execution with zero telemetry or network leakage.

---

## 2. Test Architecture & Automated Suite

A dedicated automated regression test suite (`scripts/test-text-analyzer.ts`) will be implemented and executed via `tsx` / Node.js.

### 2.1 Test Suites & Vector Matrix

| Test Suite | Vectors / Conditions | Expected Behavior |
| :--- | :--- | :--- |
| **Empty & Whitespace** | `""`, `"   "`, `"\n\t  \r\n"` | Words: 0, sentences: 0, paragraphs: 0, lines: 0 (or whitespace line count), reading time: 0, flesch: null, grade: "Not enough data". |
| **Contractions & Hyphens**| `"Don't worry, it's a state-of-the-art tool."` | 6 words: `don't`, `worry`, `it's`, `a`, `state-of-the-art`, `tool`. Exactly 1 sentence. |
| **Formatted Numbers** | `"Revenue reached $1,000,000 with a 3.14% margin in 2026."` | `1,000,000` is 1 word; `3.14` is 1 word; `2026` is 1 word. No fractional digit splitting. |
| **Abbreviation Protection** | `"Dr. Smith arrived at 4 p.m. with Mr. Jones e.g. for dinner."` | 1 sentence. Interior dots do not split the sentence. |
| **Quoted Dialogue** | `"Where are you going?" asked Alice. "To the library," said Bob.` | Dialogue sentences correctly segmented without splitting on interior quote punctuation. |
| **Compound Emojis** | `"Family 👨‍👩‍👧‍👦 thumbs 👍🏽 flag 🏳️‍🌈."` | Correct UTF-16 code units, code points, and grapheme clusters (5 visual tokens). |
| **Accented / Latin-Ext** | `"Enjoy a café résumé with naïve façade."` | Accented characters handled as standard alphabetical letters. Unique words: 7. |
| **Urdu & Arabic Script** | `"یہ ایک ٹیسٹ ہے۔ اردو زبان۔"`, `"مرحبا بالعالم! كيف حالك؟"` | Correct word counts and sentence segmentation using `۔` (U+06D4) and `؟` (U+061F). |
| **CJK Logographs** | `"这是一个测试。こんにちは世界！"` | Correct sentence segmentation using `。` (U+3002) and `！` (U+FF01). |
| **Punctuation Only** | `"! ? ... --- ,, ;; ::"` | Words: 0; countable sentences: 0. |
| **Line Ending Variants** | CRLF (`\r\n`), LF (`\n`), CR (`\r`), multiple blank lines | Normalized paragraph and physical line counts. |
| **Readability Math** | Benchmark 500-word essay with known syllable and sentence count | Flesch, FK Grade, Gunning Fog, SMOG, Coleman-Liau, and ARI match theoretical models within $\pm 0.2$. |
| **Timing Accuracy** | 450 words at 225 WPM; 300 words at 150 WPM | Reading time: exactly 2m 0s (120s); speaking time: exactly 2m 0s (120s). |
| **Keyword Density Math** | 100-word document with target word repeated 3 times | Exactly 3.0% density; stop words correctly filtered from top keyword rankings. |

---

## 3. Interactive Workflow & UI Testing Matrix

| Workflow Feature | Test Action | Verification Criterion |
| :--- | :--- | :--- |
| **Live Keystroke Typing** | Type 20 words into `#editor-textarea` | Header counts and stats grid update in $< 5\text{ ms}$ with no perceptible input lag. |
| **Sample Text Loading** | Click `#btn-load-sample` | Populates editor with rich multi-paragraph demo text; triggers full diagnostic analysis. |
| **Clear / Reset** | Click `#btn-reset-text` | Resets textarea, comparison view, search text, and file errors cleanly. |
| **Copy Text** | Click `#btn-copy-text` | Writes editor text to system clipboard via `navigator.clipboard`; toggles checkmark icon for 1.2s. |
| **Copy Statistics** | Click `#btn-copy-stats` | Copies formatted summary metrics (words, chars, reading time, readability) to clipboard. |
| **Download Text** | Click `#btn-download-text` | Triggers browser download of `omnitools_text.txt`. |
| **Download Report** | Click `#btn-export-analysis-report`| Triggers browser download of `omnitools-text-analysis.txt`. |
| **Case Transformations** | Click `UPPER`, `lower`, `Title` | Textarea transforms immediately; selection or caret preserved. |
| **Whitespace Cleaning** | Click Clean Spaces / Clean Lines | Collapses redundant consecutive spaces/tabs and empty blank lines. |
| **Find & Replace** | Search for phrase and click Replace All | All occurrences replaced; special regex characters safely escaped. |
| **Speech Synthesis** | Click Read Aloud, then Stop | Triggers `speechSynthesis.speak()` with active cancellation upon Stop or component unmount. |
| **File Upload** | Select local `.txt` or `.md` file | `FileReader` reads file into textarea; files $>10\text{ MB}$ rejected with inline notice. |
| **Word Target Goal** | Set goal to 500 words | Circular / linear progress bar shows percentage completion (e.g., 250 words = 50%). |

---

## 4. Responsive Viewport Testing Matrix

The tool workspace must be tested across seven realistic viewport breakpoints:

| Breakpoint Name | Viewport Dimensions | Critical Elements Checked |
| :--- | :---: | :--- |
| **Narrow Mobile** | 320 × 568 px | No horizontal overflow; toolbar wraps cleanly; stats cards stack 2-column or 1-column. |
| **Standard Mobile** | 360 × 640 px | Comfortable touch targets ($\ge 44 \times 44\text{ px}$); readable text; zero horizontal scroll. |
| **Modern iPhone** | 390 × 844 px | Fluid typography; clean spacing in toolbar and tabs. |
| **Large Mobile** | 430 × 932 px | Ample whitespace; crisp readability gauge. |
| **Tablet Portrait** | 768 × 1024 px | 2-column layout transition; editor min-height optimal; stats grid balanced. |
| **Small Desktop** | 1024 × 768 px | 3-column desktop layout activates (editor spans 2 cols, stats span 1 col). |
| **Wide Desktop** | 1440 × 900 px | Maximum container constrained (`max-w-5xl`); centered layout with consistent margins. |

---

## 5. SEO & Metadata Verification Suite

1. **Title Tag:** Exactly `Word Counter & Text Analyzer — Readability, Characters & Pacing` ($\le 60$ characters).
2. **Meta Description:** Clear summary highlighting words, characters, readability scores, and privacy ($\le 160$ characters).
3. **Heading Hierarchy:**
   - Exactly one `<h1>` rendered by `app/[category]/[slug]/page.tsx`.
   - SEO component uses `<h2>` for major sections and `<h3>` for subsections.
   - Zero heading level skips (no `<h4>` directly following `<h2>`).
4. **Canonical URL:** `https://omnitools-navy.vercel.app/seo/text-analyzer`.
5. **Robots Directives:** Standard `index, follow` (no accidental `noindex`).
6. **Structured Data (JSON-LD):**
   - `SoftwareApplication` entity emitted by `page.tsx` with price `$0` and operating system `All`.
   - `FAQPage` entity emitted by `TextAnalyzerSeo.tsx` with all 6 matching questions and answers.
   - JSON-LD syntax must parse without errors.
7. **Sitemap Coverage:** Present in `app/sitemap.ts` under published tools.

---

## 6. Security, Privacy & Network Verification

1. **Zero Outbound Network Traffic:** Network inspection during live typing, analysis, and text transformation must confirm 0 outgoing HTTP requests.
2. **No Persistent Tracking:** LocalStorage/SessionStorage must not store user drafts.
3. **XSS Protection:** Pasting malicious scripts (e.g. `<script>alert(1)</script>`, `<img src=x onerror=alert(1)>`) into the editor must render as raw text with zero DOM execution.
4. **File Import Security:** Disallow binary or executable formats; process text strictly via safe text readers.

---

## 7. Execution Checklist & Sign-Off Criteria

- [ ] Automated calculation test suite passes 100% of assertion vectors.
- [ ] TypeScript compilation (`npx tsc --noEmit`) passes with 0 errors.
- [ ] Registry validation (`npm run test:registry`) passes with 0 errors.
- [ ] Next.js production build (`npm run build`) builds cleanly with static optimization.
- [ ] Responsive browser verification completed across all 7 target viewports.
- [ ] Git working tree clean of unauthorized or temporary scratch files before release.
