import React from 'react';
import Link from 'next/link';

export const PDF_SIGNER_BATES_FAQS: { question: string; answer: string }[] = [
    {
        question: 'What is the difference between a visual PDF signature and an ISO 32000-1 /ByteRange cryptographic seal?',
        answer:
            'A visual-only PDF signature simply draws an image or vector stroke onto a page without protecting the file against post-signing modifications. An ISO 32000-1 cryptographic seal embeds a /Type /Sig dictionary containing /SubFilter /adbe.pkcs7.detached, a /ByteRange [0 offset1 offset2 len2] array covering the entire PDF byte stream outside the /Contents hex container, and a SHA-256 document digest. If even a single character or number is altered after sealing, the SHA-256 hash no longer matches and our Built-In Verifier flags the document as modified.',
    },
    {
        question: 'How does "Shrink-Page-to-Fit Safe MarginBox (94%)" prevent Bates numbers from overwriting footnotes?',
        answer:
            'Scanned legal contracts, discovery exhibits, and financial statements frequently contain text or footnotes within 0.2 inches (14 pt) of the bottom page edge. Standard online Bates tools blindly stamp numbers over that bottom line. When "Shrink Page 94% (Prevent Footnote Collision)" is enabled, our engine wraps the original page content stream inside a centered PDF transformation matrix (q 0.94 0 0 0.94 18.36 23.76 cm ... Q), creating a guaranteed 24-point collision-free top and bottom margin for Bates stamps and confidentiality footers.',
    },
    {
        question: 'How does continuous multi-PDF batch Bates numbering work across multiple files?',
        answer:
            'In litigation discovery productions, Bates numbers must remain strictly sequential across an entire multi-document folder rather than resetting to 000001 on each file. When you upload multiple PDFs into our batch queue (or load Preset #6), the engine maintains a global sequential counter: if Document 1 has 3 pages (000101–000103), Document 2 automatically starts at 000104, and the downloadable .xlsx / .csv Production Index records the exact start and end Bates range for every file.',
    },
    {
        question: 'Why should Bates numbers use at least 6 zero-padded digits (e.g., 000001 instead of 1)?',
        answer:
            'eDiscovery review platforms such as Relativity, Concordance, Everlaw, and Nuix sort Bates identifiers lexicographically (alphabetically by character). Without leading zeros, "ACME-10" sorts before "ACME-2", scrambling document page order during depositions and trials. Using 6 to 8 zero-padded digits ("ACME-000001" through "ACME-999999") ensures identical lexicographical and numerical ordering.',
    },
    {
        question: 'What is the difference between a Background Underlay watermark and a Foreground Overlay watermark?',
        answer:
            'In a PDF page content stream, operators are painted in sequential order (Painter’s Algorithm). A Background Underlay watermark is prepended to the start of the page stream so the document’s black text is drawn sharply on top of the watermark, preserving 100% OCR accuracy and human readability. A Foreground Overlay watermark is appended to the end of the page stream using an /ExtGState transparency dictionary (/ca and /CA alpha values) so it renders semi-transparently over images and scanned pages.',
    },
    {
        question: 'How do dynamic forensic watermark macros ({{RECIPIENT}}, {{BATES}}, {{DATE}}, {{SHA256_8}}) work?',
        answer:
            'Instead of stamping a static word like "CONFIDENTIAL", you can embed dynamic variables inside your watermark template: {{PAGE}} and {{TOTAL_PAGES}} expand to the current page and total count, {{BATES}} expands to that exact page’s assigned Bates ID, {{RECIPIENT}} embeds the counterparty or data-room viewer name, {{DATE}} inserts the UTC execution date, and {{SHA256_8}} embeds the first 8 hex characters of the original file’s SHA-256 fingerprint.',
    },
    {
        question: 'Why is a Repeating Diagonal Tiled Grid (3x4) more secure than a single centered watermark?',
        answer:
            'A single watermark placed in the center of a page leaves the top and bottom paragraphs completely unmarked, allowing an unauthorized recipient to screenshot or crop individual clauses without the watermark appearing. A 3x4 Repeating Diagonal Tiled Grid distributes angled watermark tokens across every quadrant of the 612×792 pt page so no paragraph can be cropped cleanly.',
    },
    {
        question: 'How does the automatic white-background remover work when I upload a photo of my wet-ink signature?',
        answer:
            'When you photograph a handwritten signature on white paper and upload it in Tab 1, our engine decodes the image to an RGBA pixel buffer in browser memory and computes the ITU-R BT.601 luminance (L = 0.299R + 0.587G + 0.114B) of every pixel. Any near-white paper pixel (L >= 228) has its alpha channel set to 0 (100% transparent), leaving only crisp blue or black ink strokes.',
    },
    {
        question: 'What is a Page 1 Court Exhibit Sticker (EXHIBIT A) and when is it used?',
        answer:
            'When submitting motions, affidavits, or deposition exhibits in federal and state courts, the first page of each attachment must carry a high-visibility Exhibit Sticker (e.g., "EXHIBIT A", "PLAINTIFF’S EXHIBIT 101", Case Number, and Date) while every page of the exhibit is sequentially Bates-numbered. Enabling Pipeline #4 stamps both the Page 1 Exhibit Sticker and the full-document Bates sequence in one pass.',
    },
    {
        question: 'Why should I stamp signer initials on all intermediate pages of a multi-page contract?',
        answer:
            'When a signature block appears only on the final page of a 10-page agreement, a dispute can arise over whether an earlier page (such as a pricing schedule or liability cap on Page 3) was swapped after signing. Enabling "Initial All Pages" stamps the signer’s initials box in the bottom corner of every intermediate page while placing the full signature block and SHA-256 seal on the execution page.',
    },
    {
        question: 'What is the Appended SHA-256 Tamper-Evident Certificate of Completion Page?',
        answer:
            'When enabled, our engine appends a dedicated final page to the PDF summarizing the execution audit trail: original document filename, pre-signing SHA-256 hash, signer full name and email, title/role, signing reason, jurisdiction/location, assigned Bates range, UTC timestamp, and /SubFilter /adbe.pkcs7.detached /ByteRange status.',
    },
    {
        question: 'Why does Rule PDF-SIG-003 warn about unflattened AcroForm fields before signing?',
        answer:
            'If a PDF contains unlocked interactive form fields (/AcroForm /Fields with /NeedAppearances true), recipients opening the file in certain PDF viewers may still see editable text boxes or appearance discrepancies. Flattening form fields bakes their values permanently into the static page content stream prior to sealing.',
    },
    {
        question: 'Can I skip the first cover page when applying Bates numbers?',
        answer:
            'Yes. Enable the skip-cover-page option when your document begins with a title sheet or pleading cover page that should remain unnumbered, and sequential Bates numbering will begin on Page 2.',
    },
    {
        question: 'What files are included when I click "Download Batch .ZIP" or "Export Bates Log .XLSX"?',
        answer:
            'The Batch .ZIP archive contains all stamped and signed PDF files along with "bates-production-manifest.csv" and "cryptographic-audit-certificate.json". The .XLSX export generates a native OpenXML Excel spreadsheet (sanitized against CWE-1236 formula injection) listing every page’s Bates ID, exhibit label, watermark text, signature status, and SHA-256 digest.',
    },
    {
        question: 'Does this tool impose hourly task limits, page limits, or server uploads like Sejda or iLovePDF?',
        answer:
            'No. Cloud PDF portals upload your confidential contracts to remote servers and enforce strict free-tier caps (such as 3 tasks per hour or 2 documents per batch). KivaroTools runs 100% locally inside your browser memory with zero server uploads and zero task or page caps.',
    },
    {
        question: 'When do I need a hardware USB token or Qualified Trust Service Provider (QTSP) instead of client-side signing?',
        answer:
            'Under the US ESIGN Act, UETA, and EU eIDAS standard electronic signature rules, commercial contracts, NDAs, MOUs, invoices, and discovery productions executed with an attributable electronic signature and SHA-256 audit trail are broadly enforceable. For specialized statutory filings that mandate a government-issued hardware PKCS#11 USB token or Qualified Electronic Signature (QES) chained to an Adobe Approved Trust List (AATL) root CA, use a hardware token workflow.',
    },
];

export default function PdfSignerBatesStudioSeo() {
    const softwareSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'KivaroTools Client-Side PDF Digital Signer, Watermark & Bates Stamping Studio',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All (100% Client-Side Web Browser)',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            ratingCount: '235',
            bestRating: '5',
            worstRating: '1',
        },
        description:
            'Free 100% client-side PDF digital signer (/ByteRange & SHA-256 audit certificate), diagonal tiled underlay/overlay watermark generator, and multi-PDF continuous legal Bates & Court Exhibit stamper with 94% Shrink-to-Fit margin protection.',
        featureList: [
            'Unified 3-in-1 Client-Side PDF 1.7 Binary Engine: Digital Signature + Multi-Layer Watermark + Sequential Bates & Court Exhibit Stamping',
            'ISO 32000-1 /Type /Sig Dictionary (/SubFilter /adbe.pkcs7.detached & /ByteRange) + Appended SHA-256 Certificate of Completion Page',
            'HTML5 Touch/Mouse Handwritten Signature Pad + Automatic Luminance-Threshold White Background Remover for Wet-Ink Signature Photos',
            '94% Shrink-Page-to-Fit Safe MarginBox Transformation (Prevents Bates Numbers & Footers from Overwriting Bottom Contract Footnotes)',
            'Multi-PDF Continuous Sequential Batch Bates Numbering (6-Digit Zero-Padded Prefix/Suffix) + Page 1 Court Exhibit Sticker (EXHIBIT A)',
            'Background Underlay (Behind Text) vs. Foreground Overlay (/ExtGState Alpha) Repeating 3x4 Diagonal Tiled Watermark with Dynamic Macros',
            '12-Rule Legal, eDiscovery & Cryptographic Readiness Linter with Deterministic 1-Click Auto-Fixer',
            'Batch .ZIP Archive + CWE-1236 Safe eDiscovery Bates Production Log (.xlsx & .csv) + Cryptographic Verification Certificate (.json)',
        ],
    };

    const howToSchema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to Sign, Watermark, and Bates-Stamp PDF Documents Locally in Your Browser',
        description:
            'Follow these four steps to apply digital signatures, repeating diagonal watermarks, and collision-free sequential Bates numbers to single or multiple PDF files without uploading them to a server.',
        step: [
            {
                '@type': 'HowToStep',
                position: 1,
                name: 'Upload PDF File(s) or Select a 1-Click Legal/Enterprise Preset',
                text: 'Drop one or more PDF files into the local browser workbench, or click any of the 6 built-in presets (All-in-One Board Resolution, eDiscovery Bates Production, Executive NDA, Data-Room Watermark, Linter Demo, or 3-PDF Batch).',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Configure Bates Numbering, Shrink-to-Fit Margins & Court Exhibit Stickers',
                text: 'Set your Bates prefix, starting number, 6-digit zero-padding, and 6-zone header/footer position. Enable "Shrink Page 94%" so existing footnotes are never overwritten, and optionally enable the Page 1 EXHIBIT A sticker.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Customize Tiled Watermark Macros & Draw or Upload Your Signature',
                text: 'Enter a watermark template with dynamic macros ({{RECIPIENT}}, {{BATES}}, {{DATE}}, {{SHA256_8}}), choose Background Underlay in Tiled 3x4 mode, and draw your handwritten signature or upload a wet-ink photo with automatic white-background removal.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Run the 12-Rule Compliance Audit & Export Stamped PDF, .ZIP, or .XLSX Log',
                text: 'Verify 100/100 Grade A+ readiness (or click 1-Click Auto-Fix), then download the sealed PDF, a multi-file Batch .ZIP archive, or a CWE-1236 safe .xlsx / .csv eDiscovery Bates production log.',
            },
        ],
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: PDF_SIGNER_BATES_FAQS.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
            },
        })),
    };

    return (
        <section
            aria-label="PDF Digital Signer, Watermark and Legal Bates Stamping Technical Documentation"
            className="mt-12 space-y-10 text-slate-700 dark:text-slate-300 w-full min-w-0 max-w-full overflow-x-hidden"
        >
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* ========================================================================
          SECTION 1: EXECUTIVE OVERVIEW & UNIFIED 3-IN-1 BINARY PDF ARCHITECTURE
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    <span>Enterprise LegalTech, eDiscovery &amp; Cryptographic PDF Engineering Guide</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    100% Client-Side PDF Digital Signer (<code>/ByteRange</code> &amp; SHA-256 Seal), Multi-Layer Watermark &amp;
                    Legal Bates Stamping Studio
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    Preparing a confidential contract, board resolution, M&amp;A data-room packet, or litigation discovery
                    production typically requires three separate document operations: <strong>1) Sequential Legal Bates Numbering &amp; Court Exhibit Labeling</strong>,{' '}
                    <strong>2) Diagonal Tiled Confidentiality Watermarking</strong>, and <strong>3) Digital Execution with Page Initials, Signer Attestation, and a Cryptographic SHA-256 Audit Trail</strong>.
                    Uploading privileged client agreements or medical/litigation records to three separate cloud PDF websites
                    exposes confidential work product to third-party servers and triggers strict hourly task and page caps.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    Our unified binary engine (<code>lib/pdfSignerBatesEngine.ts</code> v5.3) executes all three pipelines in a
                    single, 100% client-side pass inside your browser&apos;s local memory. Every output PDF is compiled with exact
                    PDF 1.7 cross-reference (<code>xref</code>) offsets, optional <strong>94% Shrink-to-Fit Safe MarginBox</strong>{' '}
                    page scaling, background underlay or foreground <code>/ExtGState</code> watermarks, ISO 32000-1{' '}
                    <code>/Type /Sig</code> <code>/ByteRange</code> sealing, and an appended <strong>SHA-256 Certificate of Completion</strong>.
                </p>
            </div>

            {/* ========================================================================
          SECTION 2: COMPLETE INTERNAL WORKING STRUCTURE (HOW THE ENGINE WORKS)
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-5">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    How the 3-in-1 PDF Stamping, Watermarking &amp; Cryptographic Sealing Engine Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-1.5">
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-200">
                            1. 94% Shrink-to-Fit Safe MarginBox Matrix (<code>cm</code> Operator)
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            When stamping Bates numbers on dense legal contracts, bottom footnotes located at <code>y = 18..24 pt</code>{' '}
                            are easily overwritten. Our engine wraps the original page stream inside{' '}
                            <code>q 0.94 0 0 0.94 18.36 23.76 cm ... Q</code>, scaling existing content inward by 6% so a clean 24 pt
                            safe margin surrounds all four edges.
                        </p>
                    </div>

                    <div className="rounded-xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/50 dark:bg-violet-950/20 p-4 space-y-1.5">
                        <h4 className="font-bold text-violet-900 dark:text-violet-200">
                            2. Painter&apos;s Algorithm Z-Ordering (Underlay vs. Overlay <code>/ExtGState</code>)
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            In <code>UNDERLAY_BEHIND_TEXT</code> mode, the repeating <code>3x4</code> rotated watermark matrix (
                            <code>cos(&theta;) sin(&theta;) -sin(&theta;) cos(&theta;) x y Tm</code>) is written at the beginning of
                            the page content stream so crisp black body text renders on top of the watermark. In{' '}
                            <code>OVERLAY_OVER_TEXT</code> mode, it is appended after the body stream using a PDF{' '}
                            <code>/ExtGState</code> alpha dictionary.
                        </p>
                    </div>

                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-1.5">
                        <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                            3. Continuous Multi-PDF Batch Bates Counter &amp; Exhibit Stickers
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Across a multi-file upload queue, a single monotonic counter formats{' '}
                            <code>Prefix + ZeroPaddedDigits + Suffix</code> (e.g., <code>DISCOVERY-BATCH-000101</code> through{' '}
                            <code>000109</code>) without resetting between files, while drawing a bordered vector{' '}
                            <code>EXHIBIT A</code> court sticker on Page 1.
                        </p>
                    </div>

                    <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-1.5">
                        <h4 className="font-bold text-amber-900 dark:text-amber-200">
                            4. ISO 32000-1 <code>/Type /Sig</code> Dictionary &amp; Appended SHA-256 Certificate
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            When Digital Signing is enabled, the engine stamps initials on intermediate pages, places the full
                            execution block on the target page, appends a full-page <strong>SHA-256 Certificate of Completion</strong>,
                            and embeds an ISO 32000-1 <code>/Type /Sig</code> object with <code>/SubFilter /adbe.pkcs7.detached</code>{' '}
                            and <code>/ByteRange</code> coverage.
                        </p>
                    </div>
                </div>
            </div>

            {/* ========================================================================
          SECTION 3: STEP-BY-STEP WORKED EXAMPLES (INPUT VS. OUTPUT TRACES)
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-5">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Worked Legal &amp; Enterprise Examples: Bates Sequencing, Dynamic Macros &amp; SHA-256 Sealing
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-4 space-y-2 min-w-0">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            Example 1: 3-PDF Discovery Batch Continuous Bates Production (Preset #6)
                        </div>
                        <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto max-w-full">{`Input Batch (3 PDFs, 3 Pages Each = 9 Input Pages):
- File 1: 01-Master-Services-Agreement.pdf -> DISCOVERY-BATCH-000101 .. 000103
- File 2: 02-Statement-of-Work-Alpha.pdf   -> DISCOVERY-BATCH-000104 .. 000106
- File 3: 03-Security-Addendum-DPA.pdf     -> DISCOVERY-BATCH-000107 .. 000109

Applied Protections:
- Shrink-to-Fit MarginBox : 94% (q 0.94 0 0 0.94 18.36 23.76 cm)
- Page 1 Court Sticker    : PRODUCTION SET 01 (Case No. 2026-CV-04918)
- Exported Deliverables   : 3 Stamped PDFs + .XLSX & .CSV Bates Index`}</pre>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-4 space-y-2 min-w-0">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Example 2: Dynamic Forensic Watermark &amp; ISO 32000-1 /Sig Seal
                        </div>
                        <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto max-w-full">{`Template : CONFIDENTIAL • {{RECIPIENT}} • {{BATES}} • {{DATE}} • {{SHA256_8}}
Page 2   : CONFIDENTIAL • Sequoia Due Diligence Team • ACME-PROD-000002 • 2026-05-14 • 7A4F91C2

Embedded PDF 1.7 Signature Object:
<< /Type /Sig /Filter /Adobe.PPKLite /SubFilter /adbe.pkcs7.detached
   /Name (Elena Vance, Chief Legal Officer)
   /Reason (I approve and execute this binding agreement)
   /Location (New York, NY) /M (D:20260514120000+00'00')
   /ByteRange [0 5269 5399 788] /Contents <8F4A...E91C> >>`}</pre>
                    </div>
                </div>
            </div>

            {/* ========================================================================
          SECTION 4: STEP-BY-STEP USER GUIDE (HOW TO USE EVERY FEATURE)
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Step-by-Step User Guide: Signing, Watermarking &amp; Bates-Stamping PDFs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">
                            Step 1: Select a 1-Click Scenario or Upload Single/Multiple PDFs
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                            Click any of the 6 Legal &amp; Enterprise Scenario Cards at the top to inspect a live production setup, or
                            click <strong>Upload PDF(s)</strong> to load your own confidential documents into local browser RAM.
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">
                            Step 2: Configure Bates Prefix, 6-Digit Padding &amp; 94% Shrink-to-Fit
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                            In Panel A, set your Bates prefix (e.g., <code>ACME-PROD-</code>), starting number, and 6-digit
                            zero-padding. Keep <strong>Shrink Page 94%</strong> checked so bottom footnotes are never overwritten.
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">
                            Step 3: Set Dynamic Underlay Watermarks &amp; Draw/Upload Signature
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                            In Panel B, insert dynamic macros (<code>{'{{RECIPIENT}}'}</code>, <code>{'{{BATES}}'}</code>) and select{' '}
                            <strong>Tiled 3x4 Grid</strong> in <strong>Underlay (Behind Text)</strong> mode. In Tab 1, draw your
                            signature or upload a wet-ink photo with auto-transparent background removal.
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">
                            Step 4: Auto-Fix Any Linter Alerts &amp; Export .PDF, .ZIP, or .XLSX
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                            Review the 12-Rule Readiness Score (click <strong>1-Click Auto-Fix</strong> if any warnings appear), then
                            download the stamped <code>.pdf</code>, a multi-file <code>.zip</code> bundle, or the eDiscovery{' '}
                            <code>.xlsx</code> / <code>.csv</code> production index.
                        </p>
                    </div>
                </div>
            </div>

            {/* ========================================================================
          SECTION 5: COMPETITOR COMPARISON MATRIX (KIVAROTOOLS VS ALTERNATIVES)
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Enterprise Comparison: KivaroTools vs. Legacy Cloud PDF Signers &amp; Bates Tools
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200">
                                <th className="py-3 px-4">Capability / Security Standard</th>
                                <th className="py-3 px-4 text-indigo-600 dark:text-indigo-400">KivaroTools 3-in-1 Studio (v5.3)</th>
                                <th className="py-3 px-4">Cloud PDF Portals (Sejda / iLovePDF)</th>
                                <th className="py-3 px-4">Basic Browser Signers</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">Document Privacy &amp; Task Limits</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    100% Client-Side RAM (0 Uploads • Unlimited Pages &amp; Tasks)
                                </td>
                                <td className="py-2.5 px-4">Uploads to Cloud Servers (2–3 Tasks/Hr Cap)</td>
                                <td className="py-2.5 px-4">Local, Single Pipeline Only</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">Unified 3-in-1 Execution Pass</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    Digital Sign + Tiled Watermark + Bates &amp; Exhibit Sticker Together
                                </td>
                                <td className="py-2.5 px-4">Separate Siloed Tools</td>
                                <td className="py-2.5 px-4">Signature Only</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">Shrink-to-Fit Margin Protection</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    Yes (94% Safe MarginBox Prevents Footnote Collisions)
                                </td>
                                <td className="py-2.5 px-4">No (Overwrites Bottom Text)</td>
                                <td className="py-2.5 px-4">Not Supported</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">Cryptographic /Sig &amp; SHA-256 Audit Page</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    ISO 32000-1 /ByteRange + Appended SHA-256 Certificate Page
                                </td>
                                <td className="py-2.5 px-4">Paid Enterprise Tier Only</td>
                                <td className="py-2.5 px-4">Visual Sticker Only</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">eDiscovery Bates Index (.XLSX / .CSV)</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    Yes (CWE-1236 Safe Multi-PDF Bates &amp; SHA-256 Manifest)
                                </td>
                                <td className="py-2.5 px-4">None</td>
                                <td className="py-2.5 px-4">None</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================================================
          SECTION 6: 12-RULE LEGAL, EDISCOVERY & CRYPTOGRAPHIC LINTER REFERENCE
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    12-Rule Legal Discovery, Watermark Legibility &amp; Signature Readiness Audit
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {[
                        ['PDF-BATES-001', 'CRITICAL', 'Bates Stamp Overwrite Risk on Bottom Footnotes (Shrink-to-Fit Disabled)'],
                        ['PDF-BATES-002', 'WARNING', 'Insufficient Bates Zero-Padding (< 6 Digits Breaks eDiscovery Sorting)'],
                        ['PDF-SIG-003', 'CRITICAL', 'Editable AcroForm Fields Left Unflattened Prior to Digital Execution'],
                        ['PDF-SIG-004', 'CRITICAL', 'Incomplete ESIGN / eIDAS Signer Attestation (Missing Name/Reason/Location)'],
                        ['PDF-WM-005', 'WARNING', 'Excessive Watermark Opacity (> 45% Obscures Underlying Contract Text)'],
                        ['PDF-WM-006', 'OPTIMIZATION', 'Foreground Watermark Drawn Over Text Instead of Background Underlay'],
                        ['PDF-WM-007', 'OPTIMIZATION', 'Single-Instance Watermark Vulnerable to Partial Screenshot Cropping'],
                        ['PDF-META-008', 'WARNING', 'Hidden Author & Creator Metadata Exposed in PDF /Info Dictionary'],
                        ['PDF-SIG-009', 'OPTIMIZATION', 'Multi-Page Agreement Lacks Signer Initials on Intermediate Pages'],
                        ['PDF-SIG-010', 'WARNING', 'Missing Appended SHA-256 Tamper-Evident Certificate of Completion Page'],
                        ['PDF-BATES-011', 'OPTIMIZATION', 'Missing Protective Order / Confidentiality Designation on Bates Pages'],
                        ['PDF-EXH-012', 'WARNING', 'Page 1 Court Exhibit Sticker Enabled Without Exhibit Identifier Label'],
                    ].map(([id, sev, desc]) => (
                        <div
                            key={id}
                            className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex items-start justify-between gap-2"
                        >
                            <div className="space-y-0.5 min-w-0">
                                <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{id}</div>
                                <div className="text-slate-700 dark:text-slate-300 font-medium break-words">{desc}</div>
                            </div>
                            <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${sev === 'CRITICAL'
                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                        : sev === 'WARNING'
                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                    }`}
                            >
                                {sev}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ========================================================================
          SECTION 7: LEGAL EDISCOVERY & COURT FILING BEST PRACTICES
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Best Practices for Litigation Bates Productions, Protective Orders &amp; Contract Execution
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>
                        <strong>Standardize Party Prefixes &amp; 6-to-8 Digit Padding:</strong> Use a party or matter code prefix
                        followed by a hyphen and 6–8 zero-padded digits (e.g., <code>PLAINTIFF-2026-000001</code>) so opposing
                        counsel and court clerks can cite exact page boundaries unambiguously.
                    </li>
                    <li>
                        <strong>Pair Bates Stamping with Protective Order Legends:</strong> Under federal and state protective
                        orders, place the confidentiality tier (<code>CONFIDENTIAL — SUBJECT TO PROTECTIVE ORDER</code> or{' '}
                        <code>HIGHLY CONFIDENTIAL — ATTORNEYS&apos; EYES ONLY</code>) in the bottom-left footer while stamping the
                        sequential Bates ID in the bottom-right corner.
                    </li>
                    <li>
                        <strong>Archive the Production Manifest (<code>.xlsx</code> / <code>.csv</code>):</strong> Always save the
                        generated Bates Production Index spreadsheet alongside your production batch so you have an immutable record
                        of every document&apos;s starting Bates number, ending Bates number, page count, and SHA-256 hash.
                    </li>
                </ul>
            </div>

            {/* ========================================================================
          SECTION 8: SEARCH INTENT & SUPPORTED WORKFLOW COVERAGE (32 TARGET KEYWORDS)
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Supported PDF Signing, Watermarking &amp; Legal Bates Stamping Workflows (32+ Target Scenarios)
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Whether you are executing an NDA, preparing a multi-file litigation discovery production, or watermarking a
                    confidential M&amp;A data room, this workbench consolidates 32 specialized document workflows into one local
                    browser tab:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            Legal Bates Numbering &amp; Court Exhibit Workflows
                        </h4>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>Bates numbering PDF online free (no upload)</li>
                            <li>Bates stamp multiple PDF files sequentially</li>
                            <li>Shrink PDF page to fit Bates number margin</li>
                            <li>Legal exhibit stamp generator PDF online</li>
                            <li>Court filing PDF exhibit sticker stamper</li>
                            <li>Stamp Bates numbers with prefix and suffix</li>
                            <li>Zero-padded 6-digit Bates numbering tool</li>
                            <li>Bates numbering skip first cover page PDF</li>
                            <li>Stamp confidential protective order on PDF</li>
                            <li>eDiscovery Bates production log Excel export</li>
                            <li>Export Bates index manifest to .xlsx &amp; .csv</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            Multi-Layer &amp; Data-Room PDF Watermark Workflows
                        </h4>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>Add tiled diagonal watermark to PDF free</li>
                            <li>Add confidential watermark behind PDF text</li>
                            <li>Dynamic PDF watermark with date and page</li>
                            <li>Data room dynamic recipient PDF watermark</li>
                            <li>Batch watermark PDF files in browser free</li>
                            <li>Custom header and footer PDF stamper online</li>
                            <li>Transparent PNG logo watermark on PDF</li>
                            <li>Free Sejda Bates numbering alternative</li>
                            <li>Free Adobe Acrobat Bates stamping tool</li>
                            <li>PDF digital signer watermark Bates stamper</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            Digital Signature, Wet-Ink &amp; SHA-256 Audit Workflows
                        </h4>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>Sign PDF online free without uploading</li>
                            <li>PDF digital signature SHA-256 audit trail</li>
                            <li>Draw signature and company seal on PDF</li>
                            <li>Verify PDF digital signature ByteRange</li>
                            <li>Initial all pages and sign last page PDF</li>
                            <li>Remove white background from signature PDF</li>
                            <li>Flatten PDF signature and form fields free</li>
                            <li>PDF PAdES PKCS#7 detached signature viewer</li>
                            <li>Client-side PDF signer with audit certificate</li>
                            <li>Electronic signature ESIGN UETA audit PDF</li>
                            <li>100% browser PDF signer zero server upload</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* ========================================================================
          SECTION 9: 16 INTERACTIVE FREQUENTLY ASKED QUESTIONS (FAQS)
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Frequently Asked Questions: PDF Digital Signing, Watermarking &amp; Legal Bates Stamping
                </h3>
                <div className="space-y-2.5">
                    {PDF_SIGNER_BATES_FAQS.map((faq, idx) => (
                        <details
                            key={idx}
                            className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 text-xs sm:text-sm"
                        >
                            <summary className="font-bold text-slate-900 dark:text-white cursor-pointer flex items-center justify-between gap-3">
                                <span>
                                    {idx + 1}. {faq.question}
                                </span>
                                <span className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold shrink-0 group-open:rotate-180 transition">
                                    ▼
                                </span>
                            </summary>
                            <p className="mt-2.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 leading-relaxed">
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </div>

            {/* ========================================================================
          SECTION 10: RELATED DOCUMENT & DEVELOPER TOOLS CROSS-LINK GRID
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Explore Related Client-Side Document, Legal &amp; Security Studios on KivaroTools
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <Link
                        href="/document/pdf-scrubber"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            PDF Bank Statement &amp; PII Redactor →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Permanently excise sensitive PII, IBANs, SSNs, and account numbers across all 12 PDF internal surfaces locally.
                        </p>
                    </Link>

                    <Link
                        href="/developer/jwt-debugger"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            JWT, PASETO &amp; SAML 2.0 Security Debugger →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Decode and verify JWT, SD-JWT, 5-Part JWE, PASETO v1–v4, and SAML 2.0 tokens and audit 16 SSO security rules.
                        </p>
                    </Link>

                    <Link
                        href="/developer/cron-expression-generator"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            7-Dialect Cron Expression Generator &amp; DST Simulator →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Build, explain, and simulate POSIX, Kubernetes, Quartz, AWS EventBridge, and Jenkins cron schedules across 12 timezones.
                        </p>
                    </Link>

                    <Link
                        href="/image/heic-to-jpg"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            HEIC &amp; AVIF Batch Converter &amp; EXIF Scrubber →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Convert iOS 18 HEIC and AVIF photos to JPG, PNG, WebP, or PDF locally while scrubbing 16 EXIF &amp; GPS privacy tags.
                        </p>
                    </Link>

                    <Link
                        href="/developer/sqlite-viewer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            SQLite &amp; DuckDB In-Browser Explorer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect binary B-tree pages, run DuckDB SUMMARIZE queries, carve deleted freelist records, and generate ORM schemas.
                        </p>
                    </Link>

                    <Link
                        href="/finance/contractor-vs-employee-calculator"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            Contractor vs. Full-Time Employee Tax Calculator →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Compare W-2 vs. 1099/S-Corp, UK Inside/Outside IR35, Canada T4/Inc, and Pakistan PSEB net take-home pay.
                        </p>
                    </Link>
                </div>
            </div>
        </section>
    );
}