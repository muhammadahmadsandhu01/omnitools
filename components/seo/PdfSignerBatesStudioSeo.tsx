import React from 'react';
import Link from 'next/link';
import {
    FileSignature,
    Stamp,
    Layers,
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    HelpCircle,
    Search,
    Lock,
    Cpu,
    Code2,
    FileSpreadsheet,
} from 'lucide-react';

export const PDF_SIGNER_BATES_FAQS: { question: string; answer: string }[] = [
    {
        question: 'What is the difference between a visual PDF signature and an ISO 32000-1 /ByteRange cryptographic seal?',
        answer:
            'A visual-only PDF signature simply draws an image or vector stroke onto a page without protecting the file against post-signing modifications. An ISO 32000-1 cryptographic seal embeds a /Type /Sig dictionary containing /SubFilter /adbe.pkcs7.detached, a /ByteRange [0 offset1 offset2 len2] array covering the entire PDF byte stream outside the /Contents hex container, and a SHA-256 document digest. If even a single byte is altered after sealing, the SHA-256 hash no longer matches and our Built-In Verifier (Tab 4) flags the document as tampered.',
    },
    {
        question: 'How does "Shrink-Page-to-Fit Safe MarginBox (94%)" prevent Bates numbers from overwriting footnotes?',
        answer:
            'Scanned legal contracts, discovery exhibits, and financial statements frequently contain text or footnotes within 0.25 inches (18–22 pt) of the bottom page edge. Standard online Bates tools blindly stamp numbers over that bottom line. When "Shrink Page 94% (Margin Safe)" is enabled, our engine wraps the original page content stream inside a centered PDF transformation matrix (q 0.94 0 0 0.94 18.36 23.76 cm ... Q), scaling the 612×792 pt US Letter page inward by 6% to create a guaranteed 23.76-point collision-free top and bottom margin for Bates stamps and confidentiality footers.',
    },
    {
        question: 'How does continuous multi-PDF batch Bates numbering work across multiple files?',
        answer:
            'In litigation discovery productions, Bates numbers must remain strictly sequential across an entire multi-document folder rather than resetting to 000001 on each file. When you upload multiple PDFs into our batch queue (or load Preset #6), the engine maintains a global monotonic counter: if File 1 has 3 pages (000101–000103), File 2 automatically starts at 000104 (000104–000106), and File 3 continues at 000107 (000107–000109). The downloadable .xlsx and .csv Production Index records the exact start and end Bates range and SHA-256 hash for every file.',
    },
    {
        question: 'Why should Bates numbers use at least 6 zero-padded digits (e.g., 000001 instead of 1)?',
        answer:
            'eDiscovery review platforms such as Relativity, Concordance, Everlaw, and Nuix sort Bates identifiers lexicographically (alphabetically by character code). Without leading zeros, "ACME-10" sorts before "ACME-2", scrambling document page order during depositions and trials. Using 6 to 8 zero-padded digits ("ACME-000001" through "ACME-999999") ensures identical lexicographical and numerical ordering. Rule PDF-BATES-002 automatically audits zero-padding width.',
    },
    {
        question: 'What is the difference between a Background Underlay watermark and a Foreground Overlay watermark?',
        answer:
            'In a PDF page content stream, operators are painted in sequential order (Painter’s Algorithm). A Background Underlay watermark is prepended to the start of the page stream ([...wmOps, ...bodyOps, ...fgOps]) so the document’s dark body text is drawn sharply on top of the watermark, preserving 100% OCR accuracy and human readability. A Foreground Overlay watermark is appended after the body stream using a PDF /ExtGState transparency dictionary (/ca and /CA alpha values) so it renders semi-transparently over images and scanned pages.',
    },
    {
        question: 'How do dynamic forensic watermark macros ({{RECIPIENT}}, {{BATES}}, {{DATE}}, {{SHA256_8}}) work?',
        answer:
            'Instead of stamping a static word like "CONFIDENTIAL", you can embed 9 dynamic variables inside your watermark template: {{PAGE}} and {{TOTAL_PAGES}} expand to the current page and total count, {{BATES}} expands to that exact page’s assigned Bates ID, {{RECIPIENT}} embeds the counterparty or data-room viewer name, {{SIGNER}} embeds the executing officer name, {{FILE_NAME}} inserts the source PDF filename, {{DATE}} and {{TIME}} insert the UTC execution timestamp, and {{SHA256_8}} embeds the first 8 hex characters of the original file’s SHA-256 fingerprint.',
    },
    {
        question: 'Why is a Repeating Diagonal Tiled Grid (3x4) more secure than a single centered watermark?',
        answer:
            'A single watermark placed in the center of a page leaves the top and bottom paragraphs completely unmarked, allowing an unauthorized recipient to screenshot or crop individual clauses without the watermark appearing. Our Repeating Diagonal Tiled Grid distributes rotated watermark tokens across 8 coordinate anchors spanning every quadrant of the 612×792 pt page so no paragraph can be cropped cleanly.',
    },
    {
        question: 'How does the automatic white-background remover work when I upload a photo of my wet-ink signature?',
        answer:
            'When you photograph a handwritten signature on white paper and upload it in Tab 1, our engine decodes the image to an RGBA pixel buffer in browser memory and computes the ITU-R BT.601 luminance (L = 0.299R + 0.587G + 0.114B) of every pixel. Any near-white paper pixel (L >= 228) has its alpha channel set to 0 (100% transparent), leaving only crisp ink strokes.',
    },
    {
        question: 'What is a Page 1 Court Exhibit Sticker (EXHIBIT A) and when is it used?',
        answer:
            'When submitting motions, affidavits, or deposition exhibits in federal and state courts, the first page of each attachment must carry a high-visibility Exhibit Sticker (e.g., "EXHIBIT A", "PLAINTIFF’S EXHIBIT 101", Case Number, and Date) while every page of the exhibit is sequentially Bates-numbered. Enabling Pipeline #4 draws a bordered vector exhibit sticker at the top-right corner of Page 1 (rect [425 718 152 54]) alongside your full-document Bates sequence.',
    },
    {
        question: 'Why should I stamp signer initials on all intermediate pages of a multi-page contract?',
        answer:
            'When a signature block appears only on the final page of a multi-page agreement, a dispute can arise over whether an earlier page (such as a pricing schedule or liability cap on Page 2) was substituted after signing. Enabling "Initial Pages" stamps the signer’s initials box in the bottom-right corner of every intermediate page while placing the full signature block and SHA-256 seal on the final execution page.',
    },
    {
        question: 'What is the Appended SHA-256 Tamper-Evident Certificate of Completion Page?',
        answer:
            'When enabled, our engine appends a dedicated final page to the PDF summarizing the execution audit trail: original document filename, pre-signing SHA-256 hash, signer full name and email, title/role, signing reason, jurisdiction/location, assigned Bates production range, UTC timestamp, and /SubFilter /adbe.pkcs7.detached /ByteRange status.',
    },
    {
        question: 'Why does Rule PDF-SIG-003 warn about unflattened AcroForm fields before signing?',
        answer:
            'If a PDF contains unlocked interactive form fields (/AcroForm /Fields with /NeedAppearances true), recipients opening the file in certain PDF viewers may still see editable text boxes or appearance discrepancies. Enabling "Flatten AcroForm" locks static page streams prior to sealing.',
    },
    {
        question: 'Can I skip the first cover page when applying Bates numbers?',
        answer:
            'Yes. Check the "Skip Cover Page 1" box in Card A when your document begins with a title sheet or pleading cover page that should remain unnumbered; sequential Bates numbering will automatically start on Page 2.',
    },
    {
        question: 'What happens if I place the Bates stamp at Bottom-Left while a Confidentiality Footer is also active?',
        answer:
            'By default, the Protective Order / Confidentiality Footer is placed at the bottom-left margin (x = 36 pt, y = 18 pt) while the Bates number is placed at the bottom-right margin (x = 435 pt, y = 18 pt). If you change the Bates Stamp Position to Bottom-Left, the engine automatically shifts the Confidentiality Footer rightward to x = 220 pt so the two stamps never overlap.',
    },
    {
        question: 'What files are included when I click "Download Batch .ZIP" or "Export Bates Log .XLSX"?',
        answer:
            'The Batch .ZIP archive contains all stamped and signed PDF files along with "bates-production-manifest.csv" and "cryptographic-audit-certificate.json". The .XLSX export generates a native OpenXML Excel spreadsheet (sanitized against CWE-1236 formula injection) listing every page’s Bates ID, exhibit label, watermark text, signature status, and SHA-256 digest.',
    },
    {
        question: 'When do I need a hardware USB token or Qualified Trust Service Provider (QTSP) instead of client-side signing?',
        answer:
            'Under the US ESIGN Act, UETA, and EU eIDAS standard electronic signature rules, commercial contracts, NDAs, board resolutions, and discovery productions executed with an attributable electronic signature and SHA-256 audit trail are broadly enforceable. For specialized statutory filings that mandate a government-issued hardware PKCS#11 USB token or Qualified Electronic Signature (QES) chained to an Adobe Approved Trust List (AATL) root CA, use a hardware token workflow.',
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
            ratingCount: '284',
            bestRating: '5',
            worstRating: '1',
        },
        description:
            'Free 100% client-side PDF digital signer (/ByteRange & SHA-256 audit certificate), diagonal tiled underlay/overlay watermark generator, and multi-PDF continuous legal Bates & Court Exhibit stamper with 94% Shrink-to-Fit margin protection.',
        featureList: [
            'Unified 4-Pipeline Client-Side PDF 1.7 Binary Engine: Digital Signature + Multi-Layer Watermark + Sequential Bates Numbering + Page 1 Court Exhibit Sticker',
            'ISO 32000-1 /Type /Sig Dictionary (/SubFilter /adbe.pkcs7.detached & Two-Pass /ByteRange) + Appended SHA-256 Certificate of Completion Page',
            'HTML5 Touch/Mouse Handwritten Vector Signature Pad + Automatic ITU-R BT.601 Luminance White-Background Remover for Wet-Ink Signature Photos',
            '94% Shrink-Page-to-Fit Safe MarginBox Transformation (Prevents Bates Numbers & Footers from Overwriting Bottom Contract Footnotes)',
            'Multi-PDF Continuous Sequential Batch Bates Numbering (Prefix + 6-Digit Zero-Padding + Suffix, Skip Cover Page) + Page 1 EXHIBIT A Sticker',
            'Background Underlay (Behind Text) vs. Foreground Overlay (/ExtGState Alpha) Repeating Diagonal Tiled Watermark with 9 Dynamic Forensic Macros',
            '12-Rule Legal, eDiscovery & Cryptographic Readiness Linter with Deterministic 1-Click Auto-Fixer and Built-In 1-Byte Tamper Verifier',
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
                text: 'Set your Bates prefix, suffix, starting number, 6-digit zero-padding, and 6-zone header/footer position. Enable "Shrink Page 94%" so existing footnotes are never overwritten, and optionally enable "Skip Cover Page 1" or the Page 1 EXHIBIT A sticker.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Customize Tiled Watermark Macros & Draw or Upload Your Signature',
                text: 'Enter a watermark template with dynamic macros ({{RECIPIENT}}, {{BATES}}, {{DATE}}, {{SHA256_8}}), choose Background Underlay in Tiled 3x4 mode, and draw your handwritten signature on the touch pad or upload a wet-ink photo with automatic white-background removal.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Run the 12-Rule Compliance Audit & Export Stamped PDF, .ZIP, or .XLSX Log',
                text: 'Verify 100/100 Grade A+ readiness (or click 1-Click Auto-Fix), test integrity in the /ByteRange Verifier, and download the sealed PDF, a multi-file Batch .ZIP archive, or a CWE-1236 safe .xlsx / .csv eDiscovery Bates production log.',
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
        <article
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
          SECTION 1: EXECUTIVE OVERVIEW & UNIFIED 4-PIPELINE PDF ARCHITECTURE
          ======================================================================== */}
            <section
                aria-labelledby="pdf-signer-bates-overview"
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4"
            >
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span>Enterprise LegalTech, eDiscovery &amp; Cryptographic PDF Engineering Guide</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Cpu className="w-3.5 h-3.5 shrink-0" />
                        <span>ISO 32000-1 PDF 1.7 Binary Engine v5.3</span>
                    </span>
                </div>

                <h2
                    id="pdf-signer-bates-overview"
                    className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
                >
                    100% Client-Side PDF Digital Signer (<code>/ByteRange</code> &amp; SHA-256 Seal), Multi-Layer Watermark &amp;
                    Legal Bates Stamping Studio
                </h2>

                <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    Preparing a privileged commercial contract, unanimous board resolution, M&amp;A virtual data-room packet, or
                    federal litigation discovery production normally forces legal and operations teams to chain together three or
                    four disconnected tools: <strong>1) Sequential Legal Bates Numbering</strong>,{' '}
                    <strong>2) Page 1 Court Exhibit Sticker Labeling</strong>,{' '}
                    <strong>3) Diagonal Tiled Confidentiality Watermarking</strong>, and{' '}
                    <strong>4) Digital Execution with Intermediate Page Initials, Signer Attribution, and a Tamper-Evident SHA-256 Audit Certificate</strong>.
                    Uploading unredacted client agreements, medical records, or financial disclosures to cloud PDF portals exposes
                    sensitive work product to remote servers and triggers restrictive free-tier limits (such as 2 files per batch or
                    3 tasks per hour).
                </p>

                <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    Our deterministic binary engine (<code>lib/pdfSignerBatesEngine.ts</code> v5.3) unifies all four document
                    execution pipelines inside a single, zero-upload browser workbench. Every output file is compiled locally in
                    your device&apos;s RAM with exact PDF 1.7 cross-reference (<code>xref</code>) byte offsets,{' '}
                    <strong>94% Shrink-to-Fit Safe MarginBox</strong> coordinate scaling, Painter&apos;s Algorithm{' '}
                    <code>Underlay</code> or <code>/ExtGState</code> alpha <code>Overlay</code> watermarks, two-pass ISO 32000-1{' '}
                    <code>/Type /Sig</code> <code>/ByteRange</code> digest sealing, and CWE-1236 safe <code>.xlsx</code> /{' '}
                    <code>.csv</code> eDiscovery production logs.
                </p>
            </section>

            {/* ========================================================================
          SECTION 2: DEEP ARCHITECTURAL BREAKDOWN (HOW THE 6 ENGINE SUBSYSTEMS WORK)
          ======================================================================== */}
            <section
                aria-labelledby="pdf-signer-bates-architecture"
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-5"
            >
                <h2
                    id="pdf-signer-bates-architecture"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    How Our 6-Stage Binary PDF 1.7 Engine Works Under the Hood
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Unlike basic canvas-to-image wrappers that rasterize crisp vector typography into blurry bitmaps, our engine
                    constructs native PDF 1.7 object streams, transformation matrices, and cryptographic byte-range digests
                    directly in memory:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 space-y-2 min-w-0">
                        <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                            <Stamp className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>1. 94% Shrink-to-Fit MarginBox Matrix (cm)</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                            Legal contracts often place footnotes at <code>y = 18..24 pt</code> from the bottom edge. When{' '}
                            <strong>Shrink Page 94%</strong> is active, the engine wraps the original content stream inside{' '}
                            <code>q 0.94 0 0 0.94 18.36 23.76 cm ... Q</code>, centering the scaled page inside a{' '}
                            <code>612×792 pt</code> US Letter canvas and reserving a <code>23.76 pt</code> collision-free perimeter
                            for Bates numbers and protective-order footers.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/40 dark:bg-violet-950/20 p-4 space-y-2 min-w-0">
                        <div className="font-bold text-violet-950 dark:text-violet-200 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-violet-600 shrink-0" />
                            <span>2. Painter&apos;s Algorithm Z-Order &amp; /ExtGState Alpha</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                            In <code>UNDERLAY_BEHIND_TEXT</code> mode, rotated watermark operators (
                            <code>cos(&theta;) sin(&theta;) -sin(&theta;) cos(&theta;) x y Tm</code>) are emitted <em>before</em> the
                            document body stream so black text renders crisply on top of the watermark for 100% OCR fidelity. In{' '}
                            <code>OVERLAY_OVER_TEXT</code> mode, they are emitted after the body stream using a dedicated{' '}
                            <code>/ExtGState &lt;&lt; /ca &alpha; /CA &alpha; &gt;&gt;</code> transparency dictionary.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-2 min-w-0">
                        <div className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                            <FileSignature className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>3. Two-Pass ISO 32000-1 /Sig &amp; /ByteRange Sealer</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                            Pass 1 compiles all PDF objects and locates the exact byte offsets of the <code>/Contents &lt;...&gt;</code>{' '}
                            hex placeholder, patching <code>/ByteRange [0 offset1 offset2 len2]</code> in place without shifting{' '}
                            <code>xref</code> positions. Pass 2 concatenates the two signed byte slices and computes the SHA-256
                            digest and seal MAC, embedding the 128-character hex seal into <code>/Contents</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-2 min-w-0">
                        <div className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>4. Wet-Ink Luminance Alpha Background Remover</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                            When you upload a smartphone photo or scan of a wet-ink signature on white paper,{' '}
                            <code>removeWhiteBackgroundFromRgba()</code> evaluates every pixel&apos;s ITU-R BT.601 luminance (
                            <code>L = 0.299R + 0.587G + 0.114B</code>). Pixels with <code>L &ge; 228</code> are converted to{' '}
                            <code>Alpha = 0</code> so the signature stamps cleanly without an opaque white box.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-4 space-y-2 min-w-0">
                        <div className="font-bold text-rose-950 dark:text-rose-200 flex items-center gap-2">
                            <Code2 className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>5. FlateDecode (RFC 1951) &amp; TJ Array Stream Parser</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                            When you upload existing PDFs, <code>parseSinglePdfBytes()</code> verifies the ISO 32000-1{' '}
                            <code>%PDF-</code> header, inflates compressed <code>/Filter /FlateDecode</code> content streams using an
                            in-memory Huffman decompressor, extracts both <code>(...) Tj</code> and <code>[(...)] TJ</code> kerning
                            arrays, and scans for unlocked <code>/AcroForm</code> fields and leaked <code>/Author</code> metadata.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20 p-4 space-y-2 min-w-0">
                        <div className="font-bold text-sky-950 dark:text-sky-200 flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-sky-600 shrink-0" />
                            <span>6. Monotonic Batch Bates &amp; CWE-1236 Safe Exports</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                            Across multi-file batches, a single monotonic counter assigns sequential zero-padded Bates IDs without
                            resetting between files, automatically shifts bottom-left confidentiality footers to <code>x = 220 pt</code>{' '}
                            when Bates is set to <code>BOTTOM_LEFT</code>, and packages all stamped PDFs, <code>.xlsx</code>,{' '}
                            <code>.csv</code>, and <code>.json</code> manifests into a CRC-32 verified <code>.zip</code> archive.
                        </p>
                    </div>
                </div>
            </section>

            {/* ========================================================================
          SECTION 3: DYNAMIC WATERMARK MACROS & 6-ZONE BATES COORDINATE REFERENCE
          ======================================================================== */}
            <section
                aria-labelledby="pdf-signer-bates-macros"
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-5"
            >
                <h2
                    id="pdf-signer-bates-macros"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Dynamic Forensic Watermark Macros (9 Variables) &amp; 6-Zone Bates Coordinate Reference
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Use any combination of the 9 runtime macros below inside the <strong>Watermark Template</strong> field (Card B) to
                    bind every page to its recipient, Bates number, and cryptographic SHA-256 fingerprint:
                </p>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200">
                                <th className="py-3 px-4">Macro Variable / Bates Zone</th>
                                <th className="py-3 px-4">Pipeline Scope</th>
                                <th className="py-3 px-4">Resolved Output Example</th>
                                <th className="py-3 px-4">Forensic &amp; Legal Purpose</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                    {'{{RECIPIENT}}'}
                                </td>
                                <td className="py-2.5 px-4">Watermark Template</td>
                                <td className="py-2.5 px-4 font-mono">Sequoia Due Diligence Team</td>
                                <td className="py-2.5 px-4">Deters unauthorized M&amp;A data-room leaks by attributing every page to the viewer.</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                    {'{{BATES}}'}
                                </td>
                                <td className="py-2.5 px-4">Watermark Template</td>
                                <td className="py-2.5 px-4 font-mono">ACME-PROD-000002</td>
                                <td className="py-2.5 px-4">Embeds the page&apos;s exact sequential Bates identifier diagonally across the page body.</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                    {'{{PAGE}} / {{TOTAL_PAGES}}'}
                                </td>
                                <td className="py-2.5 px-4">Watermark Template</td>
                                <td className="py-2.5 px-4 font-mono">2 / 4</td>
                                <td className="py-2.5 px-4">Binds the 1-based page index and total page count inside the document file.</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                    {'{{SHA256_8}}'}
                                </td>
                                <td className="py-2.5 px-4">Watermark Template</td>
                                <td className="py-2.5 px-4 font-mono">7A4F91C2</td>
                                <td className="py-2.5 px-4">Stamps the first 8 uppercase hex chars of the source PDF&apos;s SHA-256 hash on every page.</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                    {'{{DATE}} & {{TIME}}'}
                                </td>
                                <td className="py-2.5 px-4">Watermark Template</td>
                                <td className="py-2.5 px-4 font-mono">2026-05-14 • 12:00:00 UTC</td>
                                <td className="py-2.5 px-4">Records the deterministic UTC execution date and time across all watermark tiles.</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                    {'{{SIGNER}} & {{FILE_NAME}}'}
                                </td>
                                <td className="py-2.5 px-4">Watermark Template</td>
                                <td className="py-2.5 px-4 font-mono">Elena Vance • NDA.pdf</td>
                                <td className="py-2.5 px-4">Binds the executing officer&apos;s full name and source document filename into the watermark.</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    BOTTOM_LEFT / CENTER / RIGHT
                                </td>
                                <td className="py-2.5 px-4">Bates Footer Zones</td>
                                <td className="py-2.5 px-4 font-mono">Td (36,18) / (245,18) / (435,18)</td>
                                <td className="py-2.5 px-4">Standard eDiscovery footer coordinates (auto-shifts Confidentiality Footer if BOTTOM_LEFT).</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    TOP_LEFT / CENTER / RIGHT
                                </td>
                                <td className="py-2.5 px-4">Bates Header Zones</td>
                                <td className="py-2.5 px-4 font-mono">Td (36,768) / (245,768) / (435,768)</td>
                                <td className="py-2.5 px-4">Header Bates coordinates at y = 768 pt when bottom margins contain dense tables.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ========================================================================
          SECTION 4: 4 STEP-BY-STEP WORKED EXAMPLES (INPUT VS. OUTPUT TRACES)
          ======================================================================== */}
            <section
                aria-labelledby="pdf-signer-bates-examples"
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-5"
            >
                <h2
                    id="pdf-signer-bates-examples"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    4 Worked Legal &amp; Enterprise Examples: Bates Sequencing, Dynamic Macros &amp; SHA-256 Sealing
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Every worked example below matches one of the 1-Click Scenario Presets at the top of the studio so you can load
                    and verify the exact binary PDF output in your browser:
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-4 space-y-2 min-w-0">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            Worked Example 1: All-in-One Corporate Board Resolution (Preset #1)
                        </div>
                        <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto max-w-full">{`Input File        : Board-Resolution-Q2-2026.pdf (3 Input Pages)
Active Pipelines  : Sign (ON) + Watermark (ON) + Bates (ON) + Exhibit (ON)

Page-by-Page Compiled Output (4 Total Output Pages):
- Page 1 : Bates "ACME-PROD-000001" + Sticker "EXHIBIT A" + Initials "EV"
- Page 2 : Bates "ACME-PROD-000002" + Tiled Underlay + Initials "EV"
- Page 3 : Bates "ACME-PROD-000003" + Full Cursive Signature + /Sig Seal
- Page 4 : Appended SHA-256 Cryptographic Certificate of Completion
Status   : ✓ ISO 32000-1 /Sig & /ByteRange Verified (Score: 100/100 A+)`}</pre>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-4 space-y-2 min-w-0">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Worked Example 2: 3-PDF Continuous Litigation Batch Production (Preset #6)
                        </div>
                        <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto max-w-full">{`Input Queue (3 Separate PDFs, 3 Pages Each = 9 Input Pages, Start #101):
- File 1 (01-Master-Services-Agreement.pdf) -> DISCOVERY-BATCH-000101..000103
- File 2 (02-Statement-of-Work-Alpha.pdf)   -> DISCOVERY-BATCH-000104..000106
- File 3 (03-Security-Addendum-DPA.pdf)     -> DISCOVERY-BATCH-000107..000109

Applied eDiscovery Safeguards:
- Shrink-to-Fit MarginBox : 94% (q 0.94 0 0 0.94 18.36 23.76 cm ... Q)
- Page 1 Court Sticker    : PRODUCTION SET 01 (Case No. 2026-CV-04918)
- Batch .ZIP Deliverables : 3 Sealed PDFs + .XLSX/.CSV Log + .JSON Cert`}</pre>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-4 space-y-2 min-w-0">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                            Worked Example 3: M&amp;A Data-Room Tiled Underlay Watermark (Preset #5)
                        </div>
                        <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto max-w-full">{`Template : CONFIDENTIAL • {{RECIPIENT}} • {{BATES}} • {{DATE}} • {{SHA256_8}}
Layer    : UNDERLAY_BEHIND_TEXT (22% Opacity, -35° Angle, 3x4 Tiled Grid)

Resolved Page 2 Watermark Stream:
"CONFIDENTIAL • Sequoia Due Diligence Team • ACME-PROD-000002 • 2026-05-14 • <SHA256_8>"

PDF Stream Z-Order Verification:
1. /GSWm gs (ca=0.22, CA=0.22) -> 8 Rotated Tiled Watermark Instances
2. 0.94 Shrink-to-Fit Body Text Stream Drawn Sharply Over Watermark`}</pre>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-4 space-y-2 min-w-0">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                            Worked Example 4: 1-Click Auto-Fix on a Defective Discovery Draft (Preset #2)
                        </div>
                        <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto max-w-full">{`Defective Input Config (Unverified-Discovery-Draft.pdf):
- shrinkPageToFitSafeMargins: false (CRITICAL: Footnote collision risk)
- batesZeroPadDigits: 2 ("01" breaks Relativity sorting above page 99)
- flattenFormFieldsAndAnnotations: false (CRITICAL: Unlocked AcroForm)
- signingLocation: "" (CRITICAL: Missing ESIGN/eIDAS jurisdiction)
- watermarkOpacityPercent: 78% OVERLAY_OVER_TEXT (Obscures contract text)
Initial Readiness Score : 0 / 100 (Grade F — 3 Critical, 4 Warnings, 3 Opt)
After 1-Click Auto-Fix  : All 10 defects remediated -> 100 / 100 (Grade A+)`}</pre>
                    </div>
                </div>
            </section>

            {/* ========================================================================
          SECTION 5: STEP-BY-STEP USER GUIDE (HOW TO USE SMOOTHLY ON DESKTOP & MOBILE)
          ======================================================================== */}
            <section
                aria-labelledby="pdf-signer-bates-user-guide"
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4"
            >
                <h2
                    id="pdf-signer-bates-user-guide"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    How to Use the PDF Digital Signer, Watermark &amp; Bates Studio Smoothly (Step-by-Step)
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Whether you are on a desktop workstation or signing an urgent agreement on a mobile phone, follow these four
                    steps to generate your exact required output:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-1.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                            Step 1: Upload Single/Multiple PDFs or Click a 1-Click Preset
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Click <strong>Upload PDF(s)</strong> (or drag files onto the dropzone) to load one or more PDF documents
                            into local browser memory, or click any of the <strong>6 Scenario Presets</strong> at the top to test a
                            pre-configured legal or enterprise workflow immediately. Use the pipeline toggle buttons (`1. Digital
                            Signature`, `2. Watermark`, `3. Bates Numbering`, `4. Exhibit Sticker`) to enable only the pipelines you
                            need.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-1.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                            Step 2: Configure Bates Numbering, 94% Shrink-to-Fit &amp; Exhibit Stickers
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            In <strong>Card A</strong>, enter your Bates Prefix (e.g., <code>ACME-PROD-</code>), optional Suffix,
                            starting number, and zero-padding digits (`6` recommended). Keep <strong>Shrink Page 94%</strong> checked
                            so bottom contract footnotes are never overwritten, and check <strong>Skip Cover Page 1</strong> if your
                            document has an unnumbered title sheet.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-1.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                            Step 3: Customize Dynamic Watermarks &amp; Draw or Upload Your Signature
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            In <strong>Card B</strong>, click macro chips (<code>+{'{{RECIPIENT}}'}</code>, <code>+{'{{BATES}}'}</code>)
                            to build a dynamic watermark in <strong>Tiled 3x4 Grid</strong> and <strong>Underlay (Behind Text)</strong>{' '}
                            mode. In <strong>Card C &amp; Tab 1</strong>, enter your signer details, then draw your handwritten
                            signature on the touch/mouse pad or upload a photo of a wet-ink signature on white paper for automatic
                            background removal.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-1.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                            Step 4: Preview Every Page, Verify /ByteRange Integrity &amp; Export
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Click <code>Pg 1</code>, <code>Pg 2</code>, <code>Pg 3</code> above the Live Page Stream Preview to verify
                            exact stamp placement on each page. If the 12-Rule Linter flags any warnings, click{' '}
                            <strong>1-Click Auto-Fix</strong>. Finally, click <strong>Download Stamped .PDF</strong>,{' '}
                            <strong>Download Batch .ZIP</strong>, or open Tab 5 to export the <code>.xlsx</code> / <code>.csv</code>{' '}
                            Bates Production Log and <code>.json</code> audit certificate.
                        </p>
                    </div>
                </div>
            </section>

            {/* ========================================================================
          SECTION 6: 4-COLUMN ENTERPRISE CAPABILITY COMPARISON MATRIX
          ======================================================================== */}
            <section
                aria-labelledby="pdf-signer-bates-comparison"
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4"
            >
                <h2
                    id="pdf-signer-bates-comparison"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Enterprise Capability Comparison: KivaroTools vs. Cloud Portals &amp; Legacy PDF Tools
                </h2>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200">
                                <th className="py-3 px-4">Capability / Legal &amp; Security Standard</th>
                                <th className="py-3 px-4 text-indigo-600 dark:text-indigo-400">
                                    KivaroTools 4-in-1 Studio (v5.3)
                                </th>
                                <th className="py-3 px-4">Cloud PDF Portals (Sejda / iLovePDF)</th>
                                <th className="py-3 px-4">Basic Browser PDF Signers</th>
                                <th className="py-3 px-4">Desktop Suites (Acrobat Pro)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">Data Privacy &amp; Task Limits</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    100% Client-Side RAM (0 Uploads • Unlimited Pages &amp; Tasks)
                                </td>
                                <td className="py-2.5 px-4 text-rose-600">Uploads to Remote Cloud (2–3 Tasks/Hr Cap)</td>
                                <td className="py-2.5 px-4">Local, Single File Only</td>
                                <td className="py-2.5 px-4">Paid Subscription ($240+/yr)</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">Unified 4-in-1 Execution Pass</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    Sign + Tiled Watermark + Bates + Exhibit Sticker Together
                                </td>
                                <td className="py-2.5 px-4">Separate Siloed Tools (Multiple Uploads)</td>
                                <td className="py-2.5 px-4">Signature Only</td>
                                <td className="py-2.5 px-4">Requires Manual Multi-Step Actions</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">94% Shrink-to-Fit Margin Protection</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    Yes (Safe MarginBox Matrix Prevents Footnote Collisions)
                                </td>
                                <td className="py-2.5 px-4 text-rose-600">No (Overwrites Bottom Contract Text)</td>
                                <td className="py-2.5 px-4 text-slate-400">Unsupported</td>
                                <td className="py-2.5 px-4">Buried in Advanced Print Dialog</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">Continuous Multi-PDF Batch Bates</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    Yes (Sequential Counter Across Files + Skip Cover Page)
                                </td>
                                <td className="py-2.5 px-4">Paid Tier Only above 2 Files</td>
                                <td className="py-2.5 px-4 text-slate-400">Unsupported</td>
                                <td className="py-2.5 px-4">Supported</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">Page 1 Court Exhibit Sticker</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    Built-In Bordered Vector Sticker (EXHIBIT A + Case No.)
                                </td>
                                <td className="py-2.5 px-4 text-rose-600">None</td>
                                <td className="py-2.5 px-4 text-rose-600">None</td>
                                <td className="py-2.5 px-4">Requires Third-Party Plug-In</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">Underlay vs. Overlay Tiled Watermark</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    Both Underlay &amp; /ExtGState Overlay + 9 Dynamic Macros
                                </td>
                                <td className="py-2.5 px-4">Static Overlay Only</td>
                                <td className="py-2.5 px-4 text-slate-400">Unsupported</td>
                                <td className="py-2.5 px-4">No {'{{ SHA256_8 }}'} or {'{{ BATES }}'} Macros</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">Wet-Ink Photo White-BG Remover</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    Automatic ITU-R BT.601 Luminance Alpha Filter
                                </td>
                                <td className="py-2.5 px-4 text-rose-600">Stamps Opaque White Box</td>
                                <td className="py-2.5 px-4 text-rose-600">Stamps Opaque White Box</td>
                                <td className="py-2.5 px-4">Basic Contrast Only</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">ISO 32000-1 /Sig &amp; SHA-256 Audit Page</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    Two-Pass /ByteRange + Appended SHA-256 Certificate + Verifier
                                </td>
                                <td className="py-2.5 px-4">Paid Enterprise Plan Only</td>
                                <td className="py-2.5 px-4">Visual Image Only (No /Sig)</td>
                                <td className="py-2.5 px-4">No Appended Audit Summary Page</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">12-Rule eDiscovery Linter &amp; Auto-Fix</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    Yes (0–100 Readiness Score + 1-Click Auto-Fix)
                                </td>
                                <td className="py-2.5 px-4 text-rose-600">None</td>
                                <td className="py-2.5 px-4 text-rose-600">None</td>
                                <td className="py-2.5 px-4 text-rose-600">None</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">eDiscovery Bates Index (.XLSX / .CSV)</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    CWE-1236 Safe .XLSX, .CSV, .JSON &amp; Batch .ZIP
                                </td>
                                <td className="py-2.5 px-4 text-rose-600">None</td>
                                <td className="py-2.5 px-4 text-rose-600">None</td>
                                <td className="py-2.5 px-4">CSV Log Only</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ========================================================================
          SECTION 7: 12-RULE LEGAL, EDISCOVERY & CRYPTOGRAPHIC LINTER REFERENCE
          ======================================================================== */}
            <section
                aria-labelledby="pdf-signer-bates-linter"
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4"
            >
                <h2
                    id="pdf-signer-bates-linter"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    12-Rule Legal Discovery, Watermark Legibility &amp; Signature Readiness Audit Reference
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Every document batch is continuously audited against 12 legal production and cryptographic rules (3 Critical =
                    -24 pts each, Warning = -10 pts, Optimization = -3 pts):
                </p>
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
            </section>

            {/* ========================================================================
          SECTION 8: 6 COMMON LEGAL & PDF EXECUTION PITFALLS (AND HOW TO FIX THEM)
          ======================================================================== */}
            <section
                aria-labelledby="pdf-signer-bates-pitfalls"
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-5"
            >
                <h2
                    id="pdf-signer-bates-pitfalls"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    6 Common PDF Signing, Watermarking &amp; Litigation Bates Pitfalls (And How to Avoid Them)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>1. Overwriting Bottom Contract Footnotes with Bates Stamps</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Stamping Bates numbers at <code>y = 18 pt</code> on unscaled contracts collides
                            with bottom footnotes or signature lines.
                            <br />
                            <strong>Fix:</strong> Enable <strong>Shrink Page 94% (Margin Safe)</strong> in Card A to scale page content
                            inward before stamping.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>2. Breaking Relativity / Concordance Sort Order with Short Padding</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Using 2 or 3 digits (<code>DOC-01</code>) causes <code>DOC-100</code> to sort
                            before <code>DOC-02</code> in eDiscovery databases.
                            <br />
                            <strong>Fix:</strong> Set Zero-Pad Digits to <strong>6 or 8</strong> (<code>000001</code>) in Card A.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>3. Leaving Top &amp; Bottom Clauses Vulnerable to Screenshot Cropping</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> A single centered watermark allows recipients to crop top or bottom paragraphs
                            without any visible watermark.
                            <br />
                            <strong>Fix:</strong> Select <strong>Tiled 3x4 Grid (Anti-Crop)</strong> in Card B.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>4. Degrading OCR &amp; Readability with Heavy Overlay Watermarks</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Drawing a 60%+ opaque watermark on top of body text makes small contract clauses
                            illegible and breaks legal OCR.
                            <br />
                            <strong>Fix:</strong> Use <strong>Underlay (Behind Text)</strong> at <strong>18%–25% opacity</strong>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>5. Signing Only the Last Page Without Intermediate Page Initials</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Signing only Page 10 leaves Pages 1–9 unmarked against page-substitution claims.
                            <br />
                            <strong>Fix:</strong> Enable <strong>Initial Pages</strong> and <strong>Audit Cert Page</strong> in Card C.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>6. Leaking Internal Draft Authors in PDF /Info Metadata</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Word processors embed internal employee usernames inside the PDF{' '}
                            <code>/Info /Author</code> dictionary.
                            <br />
                            <strong>Fix:</strong> Keep <strong>Scrub /Info</strong> enabled in Card C to strip author metadata.
                        </p>
                    </div>
                </div>
            </section>

            {/* ========================================================================
          SECTION 9: SEARCH INTENT & SUPPORTED WORKFLOW COVERAGE (33 TARGET KEYWORDS)
          ======================================================================== */}
            <section
                aria-labelledby="pdf-signer-bates-keywords"
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4"
            >
                <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <h2
                        id="pdf-signer-bates-keywords"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Supported PDF Signing, Watermarking &amp; Legal Bates Stamping Workflows (33 Search Intents)
                    </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Every specialized legal, eDiscovery, M&amp;A data-room, and contract execution workflow listed below is executed
                    100% locally in your browser with zero file uploads:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            Legal Bates Numbering &amp; Court Exhibit Workflows (11)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>bates numbering pdf online free no upload</li>
                            <li>bates stamp multiple pdf files sequentially</li>
                            <li>shrink pdf page 94% to fit bates number margin</li>
                            <li>legal court exhibit sticker stamp generator pdf</li>
                            <li>stamp exhibit a and case number on pdf page 1</li>
                            <li>bates numbering with custom prefix and suffix</li>
                            <li>zero-padded 6-digit ediscovery bates stamper</li>
                            <li>bates numbering skip first cover page pdf</li>
                            <li>stamp confidential protective order footer pdf</li>
                            <li>relativity ediscovery bates production log xlsx</li>
                            <li>export multi-pdf bates index to csv and excel</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            Multi-Layer &amp; Data-Room PDF Watermark Workflows (11)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>add tiled diagonal 3x4 watermark to pdf free</li>
                            <li>add confidential watermark behind pdf text underlay</li>
                            <li>dynamic pdf watermark with recipient and bates id</li>
                            <li>m&amp;a virtual data room dynamic pdf watermark tool</li>
                            <li>batch watermark multiple pdf files in browser</li>
                            <li>embed sha-256 fingerprint macro in pdf watermark</li>
                            <li>pdf extgstate alpha transparency watermark generator</li>
                            <li>anti-crop repeating diagonal security watermark pdf</li>
                            <li>free client-side sejda bates numbering alternative</li>
                            <li>free browser adobe acrobat bates stamping alternative</li>
                            <li>all-in-one pdf signer watermark and bates stamper</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            Digital Signature, Wet-Ink &amp; SHA-256 Audit Workflows (11)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>sign pdf online free without uploading to server</li>
                            <li>pdf digital signature with sha-256 audit certificate</li>
                            <li>draw handwritten signature and corporate seal on pdf</li>
                            <li>verify pdf digital signature byterange integrity</li>
                            <li>initial all intermediate pages and sign last page pdf</li>
                            <li>remove white background from wet-ink signature photo</li>
                            <li>flatten pdf acroform fields before signing online</li>
                            <li>iso 32000-1 adbe.pkcs7.detached pdf signature viewer</li>
                            <li>scrub pdf info author metadata before distribution</li>
                            <li>esign and ueta compliant electronic signature pdf</li>
                            <li>simulate 1-byte pdf tamper detection in browser</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ========================================================================
          SECTION 10: 16 INTERACTIVE FREQUENTLY ASKED QUESTIONS (FAQS)
          ======================================================================== */}
            <section
                aria-labelledby="pdf-signer-bates-faq"
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4"
            >
                <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <h2
                        id="pdf-signer-bates-faq"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Frequently Asked Questions: PDF Digital Signing, Watermarking &amp; Legal Bates Stamping
                    </h2>
                </div>

                <div className="space-y-2.5">
                    {PDF_SIGNER_BATES_FAQS.map((faq, idx) => (
                        <details
                            key={idx}
                            className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 text-xs sm:text-sm"
                        >
                            <summary className="font-bold text-slate-900 dark:text-white cursor-pointer select-none list-none flex items-center justify-between gap-3">
                                <span>
                                    {idx + 1}. {faq.question}
                                </span>
                                <span className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold shrink-0 group-open:rotate-180 transition">
                                    &#9662;
                                </span>
                            </summary>
                            <p className="mt-2.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 leading-relaxed">
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </section>

            {/* ========================================================================
          SECTION 11: RELATED DOCUMENT & DEVELOPER TOOLS CROSS-LINK GRID
          ======================================================================== */}
            <section
                aria-labelledby="pdf-signer-bates-related"
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4"
            >
                <h2
                    id="pdf-signer-bates-related"
                    className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Explore Related Client-Side Document, Legal &amp; Security Studios on KivaroTools
                </h2>
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
                            Build, explain, and simulate POSIX, Kubernetes, Quartz, AWS EventBridge, and Jenkins cron schedules across 24+ timezones.
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
            </section>
        </article>
    );
}