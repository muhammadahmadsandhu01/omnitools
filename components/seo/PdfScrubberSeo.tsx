import React from 'react';
import Link from 'next/link';
import {
    ShieldCheck,
    Lock,
    Layers,
    Calculator,
    QrCode,
    FileSpreadsheet,
    CheckCircle2,
    AlertTriangle,
    FileText,
    Cpu,
    HelpCircle,
    Terminal,
    KeyRound,
    Search,
    Sparkles,
    EyeOff,
} from 'lucide-react';

export interface FaqItem {
    question: string;
    answer: string;
}

export const PDF_SCRUBBER_FAQS: FaqItem[] = [
    {
        question: 'Why is drawing a black rectangle over a bank statement in a standard PDF editor unsafe?',
        answer:
            'In conventional PDF editors, drawing a black or white rectangle only appends a visual path operator (re f) over the page while leaving the underlying Tj and TJ text-showing operators intact inside the content stream. Anyone who opens the file can press Ctrl+A, copy-paste into a text editor, or run pdftotext to read your raw bank account number, IBAN, credit card PAN, and transaction amounts. KivaroTools decompresses the PDF stream, excises the target characters from the text operators, and compiles a clean single-generation PDF binary.',
    },
    {
        question: 'Are my bank statements, tax returns, or invoices uploaded to any server?',
        answer:
            'No. Your selected file contents are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources.',
    },
    {
        question: 'What is the Financial Math Dependency & Reverse-Engineering Leak Guard?',
        answer:
            'If you redact a personal spend amount on Row #2 of a bank statement (for example, $120.00) but leave the Running Balance on Row #1 ($18,500.00) and Row #2 ($18,380.00) visible, any reviewer can subtract $18,500.00 - $18,380.00 to solve the exact redacted amount ($120.00). Similarly, redacting an invoice Subtotal while leaving the 15% VAT ($1,500.00) and Grand Total ($11,500.00) visible exposes the subtotal. Our Math Leak Guard detects these coupled equations automatically and locks the linked running balances or totals on export.',
    },
    {
        question: 'What are the 12 internal PDF surfaces inspected and sanitized by Deep CDR?',
        answer:
            'The engine inspects and purges all 12 leak vectors: (1) Page content stream Tj/TJ operators, (2) Invisible 3 Tr OCR text layers, (3) Document /Info dictionary keys, (4) XMP /Metadata XML packets, (5) /Outlines bookmarks and named destinations, (6) /Annots sticky notes, /URI links, and unapplied /Redact annotations, (7) /AcroForm /V and /DV form fields, (8) /EmbeddedFiles and hybrid Factur-X/ZUGFeRD XML attachments, (9) /JS and /OpenAction JavaScript triggers, (10) Incremental save history (multiple %%EOF trailers) and /Thumb page bitmaps, (11) /StructTreeRoot /ActualText accessibility attributes, and (12) Custom ToUnicode CMap tables and hidden /OCProperties layers.',
    },
    {
        question: 'How does the tool prevent false positives on dates, timestamps, and invoice numbers?',
        answer:
            'Instead of relying on naive digit-count regexes that mistakenly flag dates or reference codes as credit cards, the engine runs deterministic mathematical checksums—including Modulo-10 Luhn validation with IIN/BIN network classification for Card PANs, ISO 13616 Modulo-97-10 validation across country length tables for IBANs, Federal Reserve [3,7,1] Modulo-10 weights for US ABA routing numbers, Modulo-36 for Indian GSTINs, Verhoeff dihedral group D5 for Aadhaar, and Modulo-89 for Australian ABNs.',
    },
    {
        question: 'Which regional financial and tax identifiers are supported?',
        answer:
            'The detector covers 8 global financial regions: United States (SSN, IRS EIN, ABA Routing, Check MICR), United Kingdom & EU (IBAN, UK Sort Code, VIES VAT numbers), Pakistan (PK IBAN, 13-digit NADRA CNIC, 7+1 FBR NTN), Saudi Arabia & UAE (ZATCA 15-digit VAT TIN, ZATCA TLV Base64 QR codes, UAE TRN, SA/AE IBAN), India (15-char GSTIN, 10-char PAN, 12-digit Aadhaar), Australia (11-digit ABN, 6-digit BSB), Canada, and global SWIFT/BIC and PCI-DSS card networks.',
    },
    {
        question: 'How does Mortgage & Loan Underwriter Mode differ from Landlord Proof-of-Income Mode?',
        answer:
            'Mortgage & Loan Underwriter Mode keeps Account Holder Name, Billing Address, Running Balances, and Deposit rows visible while masking Account Numbers, IBANs, Card PANs, and Tax IDs to their last 4 digits (e.g., ************6702) and blacking out Routing/MICR codes. Landlord Proof-of-Income Mode keeps your name, address, and salary/payroll deposit rows visible while redacting personal spend rows and flagging coupled running balances.',
    },
    {
        question: 'What is AI / LLM Safe-Upload Pseudonymizer Mode?',
        answer:
            'When you want to analyze a bank statement or B2B invoice using ChatGPT, Claude, or another LLM without exposing real identities or bank accounts, AI Pseudonymizer Mode replaces every recurring PII string with a deterministic token—such as [PARTY_01], [IBAN_01], or [ACCT_01]—while leaving every numeric currency amount, date, and running balance intact so the AI can verify cashflow and accounting math.',
    },
    {
        question: 'How does ZATCA QR and Factur-X / ZUGFeRD Hybrid E-Invoice scrubbing work?',
        answer:
            'Modern B2B tax invoices often embed a Saudi ZATCA Base64 Tag-Length-Value (TLV) QR payload or a PDF/A-3 /AF XML attachment (Factur-X / ZUGFeRD) containing the seller name, VAT registration number, IBAN, and invoice totals. Our X-Ray inspector decodes and displays these embedded fields and strips both the QR payload and the attached XML stream during export.',
    },
    {
        question: 'What is the difference between Surgical Vector CDR Mode (Mode B) and Burn-In Flattened Mode (Mode A)?',
        answer:
            'Both modes physically remove redacted substrings from the content stream and purge all 12 hidden PDF surfaces into a single-generation xref file. Mode B preserves unredacted text and replacement tokens as crisp, searchable vector text operators, whereas Mode A converts redacted regions into opaque vector bars with zero underlying PII text tokens.',
    },
    {
        question: 'How does the Live Forensic "Unredact Self-Test" verify the output PDF?',
        answer:
            'Immediately after compiling the scrubbed PDF binary in memory, verifyRedactedPdfForensics() re-parses the output byte array from scratch, extracts all text streams and metadata dictionaries, and asserts that 0 of the selected secret strings appear anywhere in the extracted text or raw PDF bytes, that %%EOF count equals 1, and that all 12 CDR surfaces pass inspection.',
    },
    {
        question: 'What is included in the SHA-256 Compliance Audit Certificate (.json)?',
        answer:
            'The downloadable JSON certificate records the engine version, verification timestamp, original input SHA-256 hash, sanitized output SHA-256 hash, active workflow preset, category-by-category count of applied redactions, number of auto-masked coupled math cells, 12-surface CDR pass status, and regulatory alignment mappings (PCI-DSS Req 3.4, GDPR Art. 17/25/32, HIPAA Safe Harbor, FRCP Rule 5.2).',
    },
    {
        question: 'Does the eDiscovery Privilege Log (.xlsx / .csv) contain my raw secret numbers?',
        answer:
            'Never. Both the native OpenXML Excel (.xlsx) workbook and the RFC 4180 CSV export record only the Redaction ID, Page Number, PII Category, Field Label, Masked Replacement/Token, Redaction Style, Statutory Exemption Reason Code, Validator Name, and Jurisdiction—and sanitize all cells against CWE-1236 spreadsheet formula injection.',
    },
    {
        question: 'How does the Reversible Encrypted Sidecar (.kivaro-vault) work?',
        answer:
            'Because permanent redaction physically destroys the original characters inside the exported PDF, the PDF itself can never be unredacted. If you want a private backup of your redaction selections, you can enter a passphrase to download an encrypted .kivaro-vault sidecar (protected with a SHA256-CTR keystream and HMAC-SHA256 integrity verification) that only you can unlock locally.',
    },
    {
        question: 'Why are password-encrypted PDFs (/Encrypt) rejected until unlocked?',
        answer:
            'An encrypted PDF masks its internal content streams, form fields, and embedded XML attachments behind stream encryption filters, which prevents deterministic inspection of all 12 surfaces. Unlocking the PDF first ensures every text operator and metadata tree can be inspected and sanitized completely.',
    },
    {
        question: 'What are the file size and page count limits?',
        answer:
            'The engine enforces a 250 MB input file size cap, a 250 MB decompressed stream ceiling to prevent Zlib decompression bombs, and a 2,000-page ceiling per document.',
    },
];

export default function PdfScrubberSeo() {
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: PDF_SCRUBBER_FAQS.map((faq) => ({
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
        name: 'How to Permanently Redact a PDF Bank Statement or Invoice Locally in Your Browser',
        description:
            'Step-by-step guide to scrubbing IBANs, Luhn Card PANs, ABA Routing/MICR lines, Tax IDs, coupled running balances, and all 12 hidden PDF metadata surfaces locally in your browser.',
        step: [
            {
                '@type': 'HowToStep',
                position: 1,
                name: 'Load Your Financial PDF or Try a 1-Click Sample Document',
                text: 'Drop a local PDF bank statement, B2B tax invoice, or W-2 form (up to 250 MB) into the browser dropzone, or click one of the 3 built-in financial sample PDFs.',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Choose a Purpose-Built Financial Workflow Preset',
                text: 'Select Mortgage Underwriter (Keep-Last-4), Landlord Proof-of-Income, Freelancer Portfolio Invoice, External Tax Audit, AI/LLM Pseudonymizer, or Strict Zero-PII FOIA Mode.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Resolve Coupled Running Balance & Invoice Math Leaks',
                text: 'Open the Transaction Scrubber & Math Guard tab to inspect arithmetic reverse-engineering warnings and lock coupled running balances or invoice totals.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Audit 12 CDR Surfaces, Verify Forensics & Export Deliverables',
                text: 'Confirm 12/12 purged PDF surfaces and 0 recoverable secret tokens in the Forensic Self-Test tab, then download your scrubbed PDF, SHA-256 Audit Certificate (.json), Privilege Log (.xlsx/.csv), or encrypted .kivaro-vault.',
            },
        ],
    };

    return (
        <article className="mt-16 w-full min-w-0 max-w-full overflow-x-hidden space-y-12 text-slate-700 dark:text-slate-300">
            {/* Structured Data Scripts (FAQPage & HowTo for Rich Snippets & AI Overviews) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />

            {/* ============================================================================
          SECTION 1: EXECUTIVE OVERVIEW & CLIENT-SIDE DEEP CDR ARCHITECTURE
          ============================================================================ */}
            <section
                aria-labelledby="pdf-scrubber-architecture-overview"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2
                        id="pdf-scrubber-architecture-overview"
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
                    >
                        Client-Side PDF Bank Statement &amp; Invoice Data Scrubber, Deep CDR Sanitizer &amp; PII Redactor
                    </h2>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 shrink-0">
                        <Sparkles className="h-3.5 w-3.5" />
                        12-Surface Deep CDR Engine
                    </span>
                </div>

                <p className="mt-3 w-full text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Permanently excise <strong>International IBANs</strong>, <strong>Luhn Credit/Debit Card PANs</strong>,{' '}
                    <strong>US ABA Routing &amp; Check MICR lines</strong>, <strong>Tax &amp; National IDs</strong> (
                    <code>SSN</code>, <code>EIN</code>, <code>NADRA CNIC</code>, <code>FBR NTN</code>, <code>India GSTIN/PAN/Aadhaar</code>,{' '}
                    <code>Saudi ZATCA VAT</code>, <code>UK/EU VAT</code>, <code>Australian ABN</code>),{' '}
                    <strong>coupled Running Balances</strong>, and all <strong>12 internal PDF metadata and attachment surfaces</strong>{' '}
                    directly in your browser via a background Web Worker. Your selected file contents are processed locally in your browser and are not uploaded to KivaroTools servers (the website may still load general analytics or other third-party website resources).
                </p>

                <blockquote className="p-4 my-6 bg-blue-50/80 border-l-4 border-blue-600 rounded-r-xl dark:bg-slate-800/80 not-italic">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
                        <strong>Local Browser Processing &amp; Privacy Disclosure:</strong> Your selected file contents are processed
                        locally in your browser and are not uploaded to KivaroTools servers. The website may still load general
                        analytics or other third-party website resources.
                    </p>
                </blockquote>

                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    <p>
                        When mortgage underwriters, landlords, external auditors, legal discovery teams, or freelance clients ask
                        for a <strong>PDF bank statement</strong>, <strong>B2B tax invoice</strong>, or <strong>W-2 / payslip</strong>,
                        most people open a basic PDF editor and draw black rectangles over their account number or personal
                        purchases. Structurally, that is one of the most common causes of financial data breaches. A PDF file is not
                        a flat image; it is an indexed object database where visible shapes and text-showing instructions (
                        <code>Tj</code>, <code>TJ</code>) live separately. Covering text with a black rectangle leaves the raw digits
                        selectable via <code>Ctrl+A</code>, copy-paste, or <code>pdftotext</code>, while core banking and ERP systems
                        (such as SAP S/4HANA, Workday, Stripe, and QuickBooks) duplicate customer names, account numbers, and tax
                        IDs across <strong>12 internal PDF surfaces</strong>—including <code>/Info</code> dictionaries, XMP XML
                        streams, <code>/Outlines</code> bookmarks, <code>/AcroForm</code> field values, hybrid{' '}
                        <strong>Factur-X / ZUGFeRD XML</strong> attachments, <strong>ZATCA Base64 TLV QR codes</strong>, invisible{' '}
                        <code>3 Tr</code> OCR text layers, and incremental <code>%%EOF</code> save trailers.
                    </p>
                    <p>
                        Even when text is removed properly, financial PDFs suffer from a second flaw that generic redactors ignore:{' '}
                        <strong>arithmetic reverse-engineering</strong>. If you redact a <code>$120.00</code> personal purchase on
                        Row #2 of a bank statement but leave the adjacent Running Balances on Row #1 (<code>$18,500.00</code>) and
                        Row #2 (<code>$18,380.00</code>) visible, any recipient can subtract the two balances to solve the exact
                        redacted spend. KivaroTools solves both problems in a single client-side pass by combining{' '}
                        <strong>content-stream character excision</strong>, <strong>12-surface Deep Content Disarm &amp; Reconstruction (CDR)</strong>,{' '}
                        <strong>Financial Math Leak Guard</strong>, and an automated <strong>Forensic Unredact Self-Test</strong>.
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                            <Layers className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            12-Surface Deep CDR Sanitizer
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Excises redacted characters from <code>Tj</code>/<code>TJ</code> content streams, strips{' '}
                            <code>/Info</code>, XMP, bookmarks, <code>/AcroForm</code> fields, Factur-X XML attachments, and{' '}
                            <code>3 Tr</code> OCR layers, and writes a fresh single-generation <code>xref</code> PDF.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            8-Region Checksum Precision
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Eliminates false positives on dates and reference codes using Modulo-10 Luhn (Cards), ISO 13616 Mod-97
                            (IBAN), Federal Reserve <code>[3,7,1]</code> (ABA), Mod-36 (GSTIN), Verhoeff (Aadhaar), and Mod-89 (ABN).
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                            <Calculator className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            Math Leak Guard &amp; Forensic Proof
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Flags redacted amounts that can be reverse-engineered from visible Running Balances or VAT equations, and
                            verifies <code>0</code> recoverable secret tokens via an in-browser Unredact Self-Test.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 2: COMPLETE INTERNAL WORKING STRUCTURE (HOW THE ENGINE WORKS)
          ============================================================================ */}
            <section
                aria-labelledby="pdf-scrubber-working-structure"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2.5 mb-2">
                    <Cpu className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h2
                        id="pdf-scrubber-working-structure"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Complete Working Structure: How the Client-Side PDF Scrubber Engine Works
                    </h2>
                </div>
                <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    When you load a financial PDF into the workbench (up to the <code>250 MB</code> input safeguard), a background
                    Web Worker—with automatic main-thread fallback—executes <code>lib/pdfFinancialScrubberEngine.ts</code> through
                    a deterministic 5-stage sanitization pipeline in browser RAM:
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                            1
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Header, Stream &amp; Zlib Decompression
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Validates the <code>%PDF-1.x</code> header, rejects locked <code>/Encrypt</code> containers, decompresses
                            RFC 1950/1951 <code>/FlateDecode</code> streams (with a 250 MB bomb guard), and tokenizes{' '}
                            <code>BT ... ET</code> text blocks and <code>3 Tr</code> OCR layers.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                            2
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            12-Surface Deep CDR X-Ray Audit
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Scans the raw PDF object graph for exposed <code>/Info</code> keys, XMP <code>/Metadata</code> packets,{' '}
                            <code>/Outlines</code> bookmarks, <code>/Annots</code> sticky notes &amp; <code>/URI</code> links,{' '}
                            <code>/AcroForm /V</code> values, <code>/EmbeddedFiles</code> (Factur-X XML), and multiple{' '}
                            <code>%%EOF</code> revisions.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
                            3
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            5-Layer Checksum &amp; QR/XML Detection
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Executes Luhn Mod-10, ISO 13616 Mod-97 IBAN, ABA <code>[3,7,1]</code>, GSTIN Mod-36, Aadhaar Verhoeff,
                            ABN Mod-89, NADRA CNIC, FBR NTN, Check MICR, and ZATCA Base64 TLV QR (Tags 1–5) decoders across every
                            extracted line.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white">
                            4
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Tabular &amp; Math Dependency Guard
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Reconstructs statement transaction rows and invoice line items, then runs{' '}
                            <code>detectFinancialMathLeaks()</code> to flag redacted amounts solvable via adjacent Running Balances or{' '}
                            <code>Subtotal + Tax = Total</code> equations.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                            5
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Single-Xref Compile &amp; Self-Test
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Excises target substrings, compiles a brand-new single-generation PDF 1.7 binary (
                            <code>%%EOF count = 1</code>) with zero hidden surfaces, and runs <code>verifyRedactedPdfForensics()</code>{' '}
                            to prove <code>0</code> leaked tokens.
                        </p>
                    </div>
                </div>

                {/* Deep Dive Subsections */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/40 dark:bg-slate-800/20 space-y-2 min-w-0">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Why Incremental PDF Saves (Multiple %%EOF Trailers) Leak Deleted Data
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Under ISO 32000-1 (PDF 1.7 §7.5.6), many PDF editors save edits using an{' '}
                            <strong>Incremental Update</strong>—appending modified objects and a new <code>xref</code> section with a{' '}
                            <code>/Prev</code> pointer to the end of the file without erasing earlier bytes. Even if text disappears
                            from the screen, the original unredacted page stream remains intact before the first <code>%%EOF</code>{' '}
                            marker. KivaroTools never appends incremental updates; it compiles a brand-new single-generation{' '}
                            <code>xref</code> table from scratch (<code>%%EOF count = 1</code>).
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/40 dark:bg-slate-800/20 space-y-2 min-w-0">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            How the Financial Math Guard Stops Running-Balance Reverse Engineering
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Bank statements form a continuous ledger chain where{' '}
                            <code>Balance[i] = Balance[i - 1] + Credit[i] - Debit[i]</code>. When an applicant hides a personal
                            debit on Row <code>i</code> for a landlord or lender, leaving <code>Balance[i - 1]</code> and{' '}
                            <code>Balance[i]</code> visible leaks the exact dollar amount via simple subtraction. Our engine links
                            every transaction amount to its adjacent balance entities and automatically masks coupled balances when{' '}
                            <strong>Auto-Mask Coupled Math</strong> is enabled.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 2B: COMPLETE STEP-BY-STEP USER GUIDE (HOW TO USE EVERY FEATURE)
          ============================================================================ */}
            <section
                aria-labelledby="pdf-scrubber-complete-user-guide"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
            >
                <div>
                    <h2
                        id="pdf-scrubber-complete-user-guide"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Complete Step-by-Step User Guide: How to Scrub Bank Statements, Invoices &amp; Tax PDFs
                    </h2>
                    <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Follow this walkthrough to use every workflow preset, replacement style, math leak guard, X-Ray surface
                        inspector, and compliance export option:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Step 1: Load Your Financial PDF or Try a 1-Click Sample Document
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Drag and drop a local PDF bank statement, B2B tax invoice, or W-2 / payroll packet (up to{' '}
                            <code>250 MB</code>) into the dropzone—or click one of the three built-in sample documents (
                            <strong>Commercial Bank Statement</strong>, <strong>Hybrid B2B Tax Invoice</strong>, or{' '}
                            <strong>Payroll &amp; W-2 Tax Packet</strong>). The 6-card Telemetry Bar immediately displays the detected
                            document class, PDF version, checksum-verified PII count, active Math Leak alerts, exposed CDR surfaces,
                            and Web Worker parse time.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Step 2: Select a Financial Preset, Replacement Style &amp; Custom Zones
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Pick one of the <strong>6 Financial Workflow Presets</strong> (such as{' '}
                            <code>Mortgage &amp; Loan Underwriter</code> for Keep-Last-4 masking or{' '}
                            <code>Landlord Proof-of-Income</code> to hide personal spend rows). In Tab 1 (
                            <strong>Visual Canvas &amp; Entity Queue</strong>), click any entity badge on the page preview or in the
                            filterable queue to toggle redaction, switch between <code>Blackout</code>, <code>Whiteout</code>,{' '}
                            <code>Keep Last-4 (****1234)</code>, or <code>Consistent Token ([IBAN_01])</code>, add custom keyword
                            matches, or add a <strong>Custom Coordinate Zone</strong> across all pages for signatures and bank stamps.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Step 3: Resolve Math Leaks &amp; Inspect 12 Hidden PDF Surfaces
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Switch to Tab 2 (<strong>Transaction Scrubber &amp; Math Guard</strong>) to review flagged{' '}
                            <code>RUNNING_BALANCE_SUBTRACTION</code> and <code>INVOICE_SUBTOTAL_TAX_SOLVER</code> equations and click{' '}
                            <strong>Lock All Coupled Balances &amp; Totals</strong>. Open Tab 3 (
                            <strong>12-Surface Deep CDR X-Ray &amp; QR/XML</strong>) to inspect exposed <code>/Info</code> keys, XMP
                            streams, bookmarks, <code>/AcroForm /V</code> values, decoded <strong>ZATCA TLV Base64 QR</strong> tags,
                            and embedded <strong>Factur-X / ZUGFeRD XML</strong> payloads slated for removal.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Step 4: Verify Forensic Self-Test &amp; Export PDF, Certificate, Logs or Vault
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Open Tab 4 (<strong>Forensic Unredact Self-Test</strong>) to view the side-by-side Before vs. After raw
                            content-stream text extraction proof confirming <code>0 / N</code> recoverable secret tokens and{' '}
                            <code>%%EOF count = 1</code>. Download your verified scrubbed PDF, <strong>SHA-256 Compliance Certificate (<code>.json</code>)</strong>,{' '}
                            <strong>eDiscovery Privilege Log (<code>.xlsx</code> or <code>.csv</code>)</strong>, or passphrase-encrypted{' '}
                            <strong><code>.kivaro-vault</code></strong> sidecar in Tab 5.
                        </p>
                    </div>
                </div>

                {/* Supported vs Unsupported Format & Identifier Matrix */}
                <div className="pt-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                        Verified Financial Identifier, Checksum &amp; PDF Container Compatibility Matrix
                    </h3>
                    <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="min-w-[680px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                                <tr>
                                    <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Detection / Container Layer</th>
                                    <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Engine Validator / Mechanism (In-Browser)</th>
                                    <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Supported Regions &amp; Formats</th>
                                    <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Disclosed Boundaries (Explicit Handling)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                <tr>
                                    <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                        Card PAN &amp; Banking Routing
                                    </th>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        <code>validateLuhnMod10()</code>, <code>validateIbanMod97()</code>,{' '}
                                        <code>validateAbaRoutingMod10()</code>, Check MICR &amp; SWIFT/BIC matchers
                                    </td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        Visa, Mastercard, Amex, Discover, JCB, UnionPay • 80+ IBAN countries (<code>PK</code>,{' '}
                                        <code>GB</code>, <code>DE</code>, <code>FR</code>, <code>SA</code>, <code>AE</code>) • US ABA, UK
                                        Sort Code, AU BSB
                                    </td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        Unanchored 4–5 digit internal branch codes require custom keyword addition
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                        National &amp; Business Tax IDs
                                    </th>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        <code>validateGstinMod36()</code>, <code>validateVerhoeffAadhaar()</code>,{' '}
                                        <code>validateAustralianAbnMod89()</code>, SSA SSN &amp; NADRA/FBR matchers
                                    </td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        US <code>SSN</code> &amp; <code>EIN</code>, Pakistan <code>NADRA CNIC</code> &amp;{' '}
                                        <code>FBR NTN</code>, India <code>GSTIN</code>, <code>PAN</code> &amp; <code>Aadhaar</code>, Saudi{' '}
                                        <code>ZATCA TIN</code>, EU/UK <code>VAT</code>, AU <code>ABN</code>
                                    </td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        Non-standard local municipal tax IDs can be added via the Custom Pattern input
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                        E-Invoice QR &amp; XML Payloads
                                    </th>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        <code>decodeZatcaTlvBase64()</code> (Tags 1–5) &amp; PDF/A-3 <code>/AF</code>{' '}
                                        <code>CrossIndustryInvoice</code> XML extractor
                                    </td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        Saudi ZATCA Phase 1/2 Base64 TLV QR payloads &amp; EU/German Factur-X / ZUGFeRD embedded XML streams
                                    </td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        Raster-only QR bitmaps without a text/metadata payload require Custom Coordinate Zone redaction
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                        PDF 1.7 Streams &amp; Encryption
                                    </th>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        Uncompressed &amp; RFC 1950/1951 <code>/FlateDecode</code> streams, <code>Tj</code>/<code>TJ</code>{' '}
                                        literal &amp; UTF-16BE hex strings, 12-surface CDR compiler
                                    </td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        Up to <code>250 MB</code> file size, <code>250 MB</code> decompressed stream cap, and{' '}
                                        <code>2,000 pages</code> per document
                                    </td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">
                                        Password-encrypted PDFs (<code>/Encrypt</code>) are explicitly rejected until unlocked; image-only
                                        scans without text/OCR require Custom Zone boxes
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 3: REAL PRACTICAL EXAMPLES (INPUT VS. OUTPUT SHOWCASES)
          ============================================================================ */}
            <section
                aria-labelledby="pdf-scrubber-real-examples"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-8"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Terminal className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <h2
                            id="pdf-scrubber-real-examples"
                            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                        >
                            Real-World Examples: Content-Stream Excision, Math Leak Guard &amp; ZATCA/Factur-X Scrubbing
                        </h2>
                    </div>
                    <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Examine three production scenarios showing how KivaroTools excises sensitive financial tokens from PDF
                        streams, prevents running-balance subtraction leaks, and generates cryptographic audit certificates:
                    </p>
                </div>

                {/* Example 1 */}
                <div className="space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-xs font-mono">Example 1</span>
                        <span>
                            Commercial Bank Statement (Landlord Income Proof Mode) → Content-Stream Excision &amp; Balance Lock
                        </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        When you load <code>apex_commercial_bank_statement_oct2026.pdf</code> under{' '}
                        <strong>Landlord / Rental Proof-of-Income Mode</strong>, the engine keeps your name, address, and payroll
                        deposits visible, masks IBAN/Account/Card numbers to their last 4 digits, blackouts personal spend rows, and
                        locks coupled running balances:
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                            <div className="text-rose-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                BEFORE: Raw PDF Content Stream &amp; Hidden Surfaces
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`PK IBAN: PK36SCBL0000001123456702   UK IBAN: GB29NWBK60161331926819
US ABA Routing Number: 021000021   Account No: 884019283746
Corporate Visa Card: 4532-0151-1283-0366
2026-10-03 | STRIPE ENTERPRISE PAYROLL SETTLEMENT | PAYROLL_DEPOSIT | - | $8,500.00 | $18,500.00
2026-10-08 | BLUE BOTTLE COFFEE & DINING | PERSONAL_SPEND | $120.00 | - | $18,380.00
HIDDEN_OCR_LAYER: Account 884019283746 Card 4532-0151-1283-0366
/Author (Zayd Al-Mansoor Account #884019283746)  %%EOF Count: 2`}</pre>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                            <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                AFTER: Scrubbed Single-Xref Output Stream (0 Recoverable Secrets)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`PK IBAN: ********************6702 [VERIFIED LAST-4]   UK IBAN: ******************6819 [VERIFIED LAST-4]
US ABA Routing Number: [REDACTED: PRIVACY REDACTED]   Account No: ********3746 [VERIFIED LAST-4]
Corporate Visa Card: ****-****-****-0366 [VERIFIED LAST-4]
2026-10-03 | STRIPE ENTERPRISE PAYROLL SETTLEMENT | PAYROLL_DEPOSIT | - | $8,500.00 | [REDACTED: PRIVACY REDACTED]
2026-10-08 | [TRANSACTION ROW REDACTED]
[3 Tr Hidden OCR Layer: PURGED]  [/Info & XMP: PURGED]  %%EOF Count: 1`}</pre>
                        </div>
                    </div>
                </div>

                {/* Example 2 */}
                <div className="space-y-3 pt-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-xs font-mono">Example 2</span>
                        <span>
                            Naive &quot;Black Box&quot; Redaction &amp; Balance Subtraction Leak vs. KivaroTools Math Leak Guard
                        </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Compare what happens when you hide a transaction row in a standard PDF editor versus KivaroTools&apos;
                        Financial Math Dependency Guard:
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="min-w-0 rounded-2xl bg-red-50/50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-900/50 text-xs font-mono text-red-900 dark:text-red-200 overflow-x-auto">
                            <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400 mb-2">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>Standard PDF Editor (Copy-Paste + Math Subtraction Leak)</span>
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`// 1. Underlying Tj operator still present under black rectangle:
BT /F1 10 Tf (2026-10-08 | BLUE BOTTLE | $120.00 | $18,380.00) Tj ET

// 2. Even if "$120.00" is removed, adjacent Running Balances remain:
Row #1 Balance: $18,500.00 (Visible)
Row #2 Debit:   [REDACTED]  | Row #2 Balance: $18,380.00 (Visible)
// Attacker solves: |$18,380.00 - $18,500.00| = $120.00!`}</pre>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 p-4 border border-emerald-200 dark:border-emerald-900/50 text-xs font-mono text-emerald-900 dark:text-emerald-200 overflow-x-auto">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>KivaroTools Output (Stream Excision + Coupled Balance Lock)</span>
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`// 1. detectFinancialMathLeaks() flags Row #2 coupling automatically:
Proof: |18380.00 - 18500.00| = 120.00 (Coupled Balances Auto-Locked)

// 2. Output PDF stream after applyPdfRedactionsAndSanitize():
Row #1 Balance: [REDACTED: PRIVACY REDACTED]
Row #2:         2026-10-08 | [TRANSACTION ROW REDACTED]
// Forensic Check: 0/16 secret tokens recoverable in output PDF`}</pre>
                        </div>
                    </div>
                </div>

                {/* Example 3 */}
                <div className="space-y-3 pt-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-mono">Example 3</span>
                        <span>
                            Hybrid B2B Tax Invoice (ZATCA TLV Base64 QR &amp; Factur-X XML) → SHA-256 Audit Certificate
                        </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        When scrubbing a hybrid PDF/A-3 invoice (<code>b2b_hybrid_tax_invoice_facturx_zatca.pdf</code>), KivaroTools
                        decodes and strips both the Saudi ZATCA TLV Base64 QR payload and the embedded <code>factur-x.xml</code>{' '}
                        attachment, then issues a cryptographic SHA-256 Compliance Certificate:
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                            <div className="text-indigo-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                Decoded ZATCA TLV QR &amp; Factur-X XML Payloads Found in PDF
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`[ZATCA_TLV_BASE64_QR Decoded Tags 1..5]:
  seller_name_tag1:       "Kivaro Cloud Systems Pvt Ltd"
  vat_reg_number_tag2:    "300123456700003"
  invoice_timestamp_tag3: "2026-10-25T14:30:00Z"
  invoice_total_tag4:     "11500.00"
  vat_total_tag5:         "1500.00"

[FACTUR_X_ZUGFERD_XML /AF Attachment]:
  seller_or_party: "Horizon Global Logistics Ltd"
  embedded_iban:   "DE89370400440532013000"
  grand_total:     "11500.00"`}</pre>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-amber-300 overflow-x-auto">
                            <div className="text-amber-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                                Exported SHA-256 Redaction Compliance Certificate (.json)
                            </div>
                            <pre className="leading-relaxed overflow-x-auto max-w-full">{`{
  "certificateVersion": "2.0",
  "processingMode": "100% Local Browser Memory (Zero Server Upload)",
  "redactionSummary": {
    "activeWorkflowPreset": "freelancer_portfolio_invoice",
    "totalRedactedEntities": 22,
    "deepCdrSurfacesPurged": 9
  },
  "forensicSelfTest": {
    "passedAllChecks": true,
    "ctrlAPasteTestPassed": true,
    "singleGenerationXrefVerified": true,
    "outputEofCount": 1,
    "all12SurfacesClean": true
  }
}`}</pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 4: TECHNICAL SPECIFICATION: 12-SURFACE PDF DEEP CDR MATRIX
          ============================================================================ */}
            <section
                aria-labelledby="pdf-scrubber-surface-comparison"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="pdf-scrubber-surface-comparison"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Technical Specification: 12-Surface PDF Deep Content Disarm &amp; Reconstruction (CDR) Matrix
                </h2>
                <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Inspect how each of the 12 internal PDF object and stream surfaces can leak financial PII and how{' '}
                    <code>applyPdfRedactionsAndSanitize()</code> neutralizes them during export:
                </p>

                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[720px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">#</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">
                                    Internal PDF Surface / Dictionary Key
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-rose-600 dark:text-rose-400">
                                    How Financial PII Leaks in Standard Editors
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400">
                                    KivaroTools Deep CDR Sanitization Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <th scope="row" className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">#1</th>
                                <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Page Content Streams (<code>Tj</code>, <code>TJ</code>, <code>&apos;</code>, <code>&quot;</code>)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Visual black rectangles leave underlying account numbers and card PANs selectable via Ctrl+A or{' '}
                                    <code>pdftotext</code>.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Decompresses <code>/FlateDecode</code> streams, excises matched substrings from text operators, and
                                    recompiles clean page streams.
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">#2</th>
                                <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Hidden OCR Text Layer (<code>3 Tr</code> Rendering Mode)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Scanned statements with searchable OCR contain invisible text blocks directly behind the page image.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Detects and purges all <code>3 Tr</code> invisible text rendering blocks during reconstruction.
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">#3</th>
                                <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Document <code>/Info</code> Dictionary (<code>/Title</code>, <code>/Author</code>)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Banking portals embed strings like <code>Statement_Zayd_Acct_884019283746</code> inside{' '}
                                    <code>/Title</code> and <code>/Author</code>.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Completely omits the legacy <code>/Info</code> dictionary from the rebuilt trailer.
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">#4</th>
                                <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    XMP <code>/Metadata</code> XML Stream (<code>&lt;x:xmpmeta&gt;</code>)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Retains Dublin Core author names, titles, and revision history even after <code>/Info</code> is
                                    cleared.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Strips all XMP <code>/Metadata</code> XML streams from the root <code>/Catalog</code>.
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">#5</th>
                                <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Bookmarks &amp; Document Outline (<code>/Outlines</code> &amp; <code>/Dests</code>)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Sidebar bookmarks repeat section headers such as <code>Account #884019283746 Summary</code>.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Purges the <code>/Outlines</code> tree and named destination dictionaries.
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">#6</th>
                                <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Annotations, Sticky Notes, <code>/URI</code> Links &amp; <code>/Redact</code> Marks
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Reviewer sticky notes, portal query URLs (<code>?acct=...</code>), and unapplied{' '}
                                    <code>/Subtype /Redact</code> objects store raw secrets.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Removes all <code>/Annots</code> arrays, comment dictionaries, and hyperlink action URIs.
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">#7</th>
                                <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Interactive Form Fields (<code>/AcroForm /V</code>, <code>/DV</code> &amp; <code>/XFA</code>)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Fillable W-2, 1099, and KYC forms store raw SSNs and account numbers inside <code>/V</code> and{' '}
                                    <code>/DV</code> entries.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Purges <code>/AcroForm</code> and <code>/XFA</code> trees and flattens remaining visible lines.
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">#8</th>
                                <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Embedded Files &amp; Hybrid E-Invoice XML (<code>/EmbeddedFiles</code> &amp; <code>/AF</code>)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    PDF/A-3 hybrid invoices attach machine-readable <code>factur-x.xml</code> / ZUGFeRD files containing
                                    unredacted IBANs and totals.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Decodes for X-Ray inspection and strips all <code>/EmbeddedFiles</code> and <code>/AF</code> XML
                                    streams.
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">#9</th>
                                <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Embedded JavaScript &amp; Actions (<code>/JS</code>, <code>/OpenAction</code>, <code>/Launch</code>)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Can trigger external network callbacks or store hardcoded validation strings on document open.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Disarms and removes all <code>/JS</code>, <code>/JavaScript</code>, <code>/OpenAction</code>, and{' '}
                                    <code>/AA</code> triggers.
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">#10</th>
                                <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Incremental Save History (<code>xref</code> / <code>%%EOF</code>) &amp; <code>/Thumb</code> Bitmaps
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Earlier unredacted object revisions and pre-redaction page thumbnail bitmaps survive before prior{' '}
                                    <code>%%EOF</code> markers.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Serializes a single-generation <code>xref</code> table (<code>%%EOF count = 1</code>, <code>0 /Prev</code>,{' '}
                                    <code>0 /Thumb</code>).
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">#11</th>
                                <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Tagged PDF Accessibility Tree (<code>/StructTreeRoot /ActualText</code>)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Screen-reader tags retain duplicate plaintext strings inside <code>/ActualText</code> and{' '}
                                    <code>/Alt</code> attributes.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Purges <code>/StructTreeRoot</code> accessibility trees containing residual plaintext attributes.
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">#12</th>
                                <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Font <code>/ToUnicode</code> CMap &amp; Optional Content Groups (<code>/OCProperties</code>)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Custom subset font CMap tables and hidden Optional Content Groups (<code>/OCGs</code>) can leak
                                    character tables or layers.
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Emits standard <code>/WinAnsiEncoding</code> Type1 fonts with zero custom CMap streams or OCG layers.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 5: COMPETITOR COMPARISON MATRIX (KIVAROTOOLS VS MARKET ALTERNATIVES)
          ============================================================================ */}
            <section
                aria-labelledby="pdf-scrubber-competitor-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="pdf-scrubber-competitor-matrix"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Architectural Scope &amp; Feature Matrix: KivaroTools vs. Common PDF Redaction Workflows
                </h2>
                <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Compare how KivaroTools&apos; client-side Deep CDR engine handles privacy, content-stream excision, financial
                    math coupling, and forensic verification versus traditional redaction approaches:
                </p>

                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Capability / Security Axis</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400">
                                    KivaroTools (In-Browser Deep CDR Studio)
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Visual &quot;Whiteout / Box&quot; Editors
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Cloud AI Upload Redactors
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Manual Desktop PDF Editors
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Data Processing Location
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    100% Local Browser Memory (Web Worker + Main-Thread Fallback)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">
                                    Often uploads PDF to remote servers
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400">
                                    Transmits PDF text to cloud LLM/NLP APIs
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Local desktop install required ($130–$240/yr)
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Content-Stream Character Excision
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Yes — Physical Tj/TJ Excision + Burn-In Mode (Passes Ctrl+A Test)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400">
                                    No — Draws rectangle over selectable text
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Yes (Server-side rewrite)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">
                                    Fails if user forgets &quot;Apply Redactions&quot; step
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    12-Surface Deep CDR Sanitization
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Automatic 1-Step Purge (/Info, XMP, /AcroForm, Factur-X XML, Single xref)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400">
                                    Leaves metadata &amp; incremental saves intact
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Partial (Varies by vendor)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">
                                    Requires separate manual &quot;Sanitize Document&quot; step
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Mathematical Checksum Validators
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Luhn Mod-10, ISO 13616 Mod-97 IBAN, ABA [3,7,1], GSTIN Mod-36, Verhoeff, ABN Mod-89
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Manual drawing only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Probabilistic LLM / basic regex</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Basic regex pattern search</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Financial Math Dependency Guard
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Built-In Running Balance Subtraction &amp; Subtotal+VAT=Total Solver
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Keep-Last-4 &amp; AI Tokenization
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    1-Click Keep-Last-4 (****1234) &amp; Deterministic [IBAN_01] Tokens
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Manual box sizing</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Paid templates only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Manual character selection</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    ZATCA QR &amp; Factur-X XML Scrub
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Decodes ZATCA Base64 TLV (Tags 1–5) &amp; Strips /AF Factur-X XML
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Rarely supported</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Manual attachment removal</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Live Forensic Self-Test &amp; Logs
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    In-Browser Unredact Verifier + SHA-256 JSON Cert + .XLSX/.CSV Privilege Log
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Cloud audit log (paid tiers)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 6: SUPPORTED EXPORT DELIVERABLES & WORKFLOW PRESETS TABLE
          ============================================================================ */}
            <section
                aria-labelledby="pdf-scrubber-export-targets"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h2
                        id="pdf-scrubber-export-targets"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Supported Export Deliverables &amp; Financial Workflow Presets
                    </h2>
                </div>
                <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Every statement or invoice processed in the workbench can be exported into the following verified document,
                    audit, and eDiscovery deliverables:
                </p>

                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[680px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Deliverable / Preset</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Extension / ID</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Key Security &amp; Formatting Features</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Primary Compliance Workflow</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Scrubbed PDF (Mode B: Surgical Vector CDR)
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">
                                    _scrubbed_verified.pdf
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Excises target characters from content streams, keeps unredacted text sharp &amp; searchable, purges
                                    all 12 surfaces, single <code>xref</code> (<code>%%EOF = 1</code>)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Mortgage underwriting, rental applications, tax audits &amp; AI/LLM analysis
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Scrubbed PDF (Mode A: Burn-In Flattened)
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">
                                    _scrubbed_verified.pdf
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Replaces redacted substrings with empty content and draws opaque vector blackout/whiteout bars with
                                    anti-inference width jitter
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Strict FOIA responses, litigation productions &amp; public filings
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    SHA-256 Compliance Audit Certificate
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-indigo-600 dark:text-indigo-400">
                                    _redaction_certificate.json
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Input/output SHA-256 hashes, category counts, 12-surface pass verification, non-alteration
                                    attestation, zero raw PII logged
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    PCI-DSS v4.0 Req 3.4, GDPR Art. 17/32, HIPAA Safe Harbor &amp; FRCP Rule 5.2 proof
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Native Excel eDiscovery Privilege Log
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">
                                    _privilege_log.xlsx
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    PKZIP Office Open XML workbook with bold header row, Redaction ID, Page, Category, Masked Preview,
                                    Statutory Reason Code &amp; CWE-1236 formula guard
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Legal eDiscovery privilege logs, FOIA exemption schedules &amp; audit binders
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    RFC 4180 CSV Privilege Log
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400">
                                    _privilege_log.csv
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    UTF-8 BOM (<code>\uFEFF</code>) prepended for Windows Excel + CWE-1236 formula injection
                                    neutralization
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Case management imports, compliance ticketing &amp; spreadsheet review
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Reversible Encrypted Redaction Vault
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 font-mono text-amber-600 dark:text-amber-400">
                                    .kivaro-vault (JSON)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Passphrase-derived <code>SHA256-CTR-HMAC</code> keystream encryption with tamper-evident HMAC-SHA256
                                    verification tag
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">
                                    Internal team restoration of redaction selections without storing PII in the shared PDF
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 7: TROUBLESHOOTING & FORENSIC EDGE-CASE GUIDE
          ============================================================================ */}
            <section
                aria-labelledby="pdf-scrubber-troubleshooting-guide"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="pdf-scrubber-troubleshooting-guide"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Common PDF Redaction Failures, Forensic Edge Cases &amp; Fixes
                </h2>
                <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Diagnose and prevent the 6 most dangerous document redaction failures encountered when sharing bank
                    statements, invoices, and tax filings:
                </p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            1. Text Under Black Boxes Still Copy-Pasteable (Ctrl+A Leak)
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Cause:</strong> Drawing a black shape in a general PDF editor only adds a graphic overlay while
                            leaving the underlying <code>(Account: 884019283746) Tj</code> operator untouched.
                            <br />
                            <strong>Fix:</strong> Process the file through KivaroTools and check Tab 4 (
                            <strong>Forensic Unredact Self-Test</strong>) to verify <code>0 / N</code> secret tokens remain in the
                            output text stream.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            2. Redacted Spend Solved from Visible Running Balances
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Cause:</strong> Redacting a single transaction amount while leaving the prior and current Running
                            Balance columns visible allows trivial subtraction (<code>Balance[i-1] - Balance[i]</code>).
                            <br />
                            <strong>Fix:</strong> Keep <strong>Auto-Mask Coupled Math</strong> enabled or click{' '}
                            <strong>Lock All Coupled Balances &amp; Totals</strong> in Tab 2.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            3. Account Numbers Leaking in /Info, XMP or Bookmarks
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Cause:</strong> Automated banking statements often write the customer&apos;s name and account
                            number into the PDF <code>/Title</code>, XMP <code>dc:title</code> packet, and sidebar{' '}
                            <code>/Outlines</code> bookmarks.
                            <br />
                            <strong>Fix:</strong> Our 12-Surface Deep CDR compiler automatically strips <code>/Info</code>, XMP{' '}
                            <code>/Metadata</code>, and <code>/Outlines</code> on every export.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            4. Incremental Save Revisions (Multiple %%EOF Markers)
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Cause:</strong> Saving a PDF incrementally appends a second <code>xref</code> table at the end of
                            the file while leaving the original unredacted page objects intact earlier in the byte buffer.
                            <br />
                            <strong>Fix:</strong> Verify in Tab 4 that <code>Single-Generation xref Verified</code> is green and{' '}
                            <code>%%EOF Count = 1</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            5. Password-Protected PDFs (/Encrypt Dictionary Rejected)
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Cause:</strong> Bank statements protected with an open or permissions password encrypt internal
                            streams, preventing deterministic inspection across all 12 surfaces.
                            <br />
                            <strong>Fix:</strong> Unlock or print-to-unencrypted PDF in your browser first, then load the unlocked PDF
                            into the scrubber.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            6. Hybrid Factur-X XML &amp; ZATCA QR Code Leaks on Invoices
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Cause:</strong> Redacting visible text on a PDF/A-3 e-invoice leaves the attached{' '}
                            <code>factur-x.xml</code> file and Base64 TLV QR payload intact with the seller&apos;s VAT TIN, IBAN, and
                            grand total.
                            <br />
                            <strong>Fix:</strong> Inspect decoded QR/XML fields in Tab 3; the exporter automatically purges{' '}
                            <code>/EmbeddedFiles</code> and <code>/AF</code> XML attachments.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 8: SEARCH INTENT & SUPPORTED WORKFLOW COVERAGE (32 TARGET KEYWORDS)
          ============================================================================ */}
            <section
                aria-labelledby="pdf-scrubber-workflow-coverage"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h2
                        id="pdf-scrubber-workflow-coverage"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Supported Financial Redaction, Compliance &amp; Deep CDR Workflows
                    </h2>
                </div>
                <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Whether you are preparing bank statements for a mortgage or apartment application, anonymizing B2B invoices for
                    portfolio sharing, or sanitizing tax documents for AI analysis, this workbench consolidates 32+ specialized
                    privacy workflows into one browser tab:
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            Bank Statement, Mortgage &amp; Rental Workflows
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>PDF bank statement scrubber online free (zero upload)</li>
                            <li>Redact bank statement PDF for rental application</li>
                            <li>Redact bank statement for mortgage loan underwriter</li>
                            <li>Redact account number keep last 4 digits PDF</li>
                            <li>Hide personal spend on bank statement PDF</li>
                            <li>Prevent running balance subtraction leak in PDF</li>
                            <li>Redact IBAN and SWIFT BIC code from PDF</li>
                            <li>Mask credit card PAN with Luhn check in PDF</li>
                            <li>Redact US ABA routing and check MICR line PDF</li>
                            <li>Redact payslip and salary statement PDF free</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            Invoice, Tax Form &amp; Regional ID Workflows
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>Scrub sensitive data from PDF invoice online</li>
                            <li>Redact unit price and total on sample invoice PDF</li>
                            <li>Redact W-2 and 1099 tax form PDF online</li>
                            <li>Redact SSN, EIN, and tax ID from PDF online</li>
                            <li>Redact Pakistan CNIC, NTN, and IBAN in PDF</li>
                            <li>Redact Indian GSTIN, PAN, and Aadhaar in PDF</li>
                            <li>Scrub ZATCA QR code and VAT TIN in PDF invoice</li>
                            <li>Remove embedded Factur-X &amp; ZUGFeRD XML in PDF</li>
                            <li>Validate Australian ABN (Mod-89) &amp; BSB in PDF</li>
                            <li>Permanent PDF redactor without Adobe Acrobat</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            Deep CDR, Forensic Proof &amp; AI/eDiscovery Workflows
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>Client-side PDF PII redactor (no server upload)</li>
                            <li>Anonymize bank statement PDF for ChatGPT &amp; AI</li>
                            <li>Tokenize PII in financial PDF for LLM RAG pipelines</li>
                            <li>Remove hidden metadata from bank statement PDF</li>
                            <li>PDF Deep CDR sanitizer (remove XMP &amp; AcroForm)</li>
                            <li>Strip incremental save history (<code>xref</code>) in PDF</li>
                            <li>Remove hidden OCR text layer (<code>3 Tr</code>) from scanned PDF</li>
                            <li>Verify if PDF redaction is permanent online</li>
                            <li>Test PDF redaction Ctrl+A copy-paste leak</li>
                            <li>Export PDF redaction privilege log to <code>.xlsx</code> &amp; <code>.csv</code></li>
                            <li>PDF redaction SHA-256 audit certificate (<code>.json</code>)</li>
                            <li>Reversible encrypted PDF redaction vault (<code>.kivaro-vault</code>)</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 9: FREQUENTLY ASKED QUESTIONS (16 INTERACTIVE ACCORDIONS)
          ============================================================================ */}
            <section
                aria-labelledby="pdf-scrubber-frequently-asked-questions"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h2
                        id="pdf-scrubber-frequently-asked-questions"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="space-y-3">
                    {PDF_SCRUBBER_FAQS.map((faq, index) => (
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
          SECTION 10: INTERNAL CROSS-LINKING TO RELATED DOCUMENT & DEVELOPER TOOLS
          ============================================================================ */}
            <section
                aria-labelledby="pdf-scrubber-related-utilities"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h2
                        id="pdf-scrubber-related-utilities"
                        className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Related Client-Side Document, Financial &amp; Data Engineering Utilities
                    </h2>
                </div>
                <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed break-words">
                    Continue your financial document preparation, table extraction, and data sanitization workflow with our
                    integrated browser tools:
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/document/excel-to-pdf"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-emerald-400 dark:border-slate-800 dark:hover:border-emerald-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                            Excel (.xlsx / .csv) to PDF Report Converter →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Convert exported eDiscovery Privilege Logs (.xlsx / .csv) and accounting sheets into auto-fitted vector
                            PDF tables.
                        </p>
                    </Link>

                    <Link
                        href="/document/pdf-merge-split"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-emerald-400 dark:border-slate-800 dark:hover:border-emerald-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                            PDF Merge &amp; Split (Up to 750 MB) →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Combine multi-month scrubbed bank statements into a single underwriting packet or extract specific pages
                            locally.
                        </p>
                    </Link>

                    <Link
                        href="/document/pdf-to-excel"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-emerald-400 dark:border-slate-800 dark:hover:border-emerald-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                            PDF to Excel (.XLSX) &amp; CSV Table Extractor →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Extract tabular bank statement transactions and invoice line items into clean spreadsheets in your
                            browser.
                        </p>
                    </Link>

                    <Link
                        href="/finance/invoice-generator"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-emerald-400 dark:border-slate-800 dark:hover:border-emerald-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                            Free PDF Invoice Generator →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Create professional, print-ready B2B tax and freelance invoices locally with zero watermarks.
                        </p>
                    </Link>

                    <Link
                        href="/document/pdf-to-word"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-emerald-400 dark:border-slate-800 dark:hover:border-emerald-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                            PDF to Word (.DOCX) Document Converter →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Convert unencrypted PDF reports and agreements into editable Microsoft Word (.docx) documents client-side.
                        </p>
                    </Link>

                    <Link
                        href="/developer/parquet-viewer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-emerald-400 dark:border-slate-800 dark:hover:border-emerald-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                            Parquet, Avro &amp; Feather Viewer + CSV/XLSX →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect columnar lakehouse files locally with 64-bit BigInt exactness, SQL DDL generation, and CWE-1236
                            safe Excel export.
                        </p>
                    </Link>

                    <Link
                        href="/developer/har-analyzer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            HAR File Analyzer, Waterfall Viewer &amp; Sanitizer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect 7-phase HTTP waterfalls, decode JWT &amp; SAML 2.0 assertions, scrub secrets across 14 surfaces, and export to k6, Playwright &amp; OpenAPI 3.1.
                        </p>
                    </Link>
                </div>
            </section>
        </article>
    );
}