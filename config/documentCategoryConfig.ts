import { tools, type Tool } from '@/config/toolsData';

export interface DocumentSubtopicGroup {
    id: string;
    label: string;
    heading: string;
    description: string;
    slugs: readonly string[];
}

export interface DocumentFaqItem {
    question: string;
    answer: string;
}

export interface DocumentVerificationStep {
    step: string;
    title: string;
    detail: string;
}

export interface DocumentComparisonRow {
    criterion: string;
    kivaroClientSide: string;
    cloudUploadSites: string;
}

export interface AdjacentDocumentLink {
    categoryId: 'finance' | 'media';
    slug: string;
    hubLabel: string;
}

/**
 * Returns all currently published, visible document/PDF tools from toolsData.ts.
 */
export function getPublishedDocumentTools(): Tool[] {
    return tools.filter(
        (tool) =>
            tool.categoryId === 'document' &&
            tool.status === 'published' &&
            !tool.hidden
    );
}

/**
 * Logical subtopic workbench definitions covering all 11 published /document PDF tools
 * in config/toolsData.ts. Organized around user workflow intent.
 */
export const DOCUMENT_SUBTOPIC_GROUPS: readonly DocumentSubtopicGroup[] = [
    {
        id: 'organize-compress-pdfs',
        label: 'Organize & Compress',
        heading: 'Organize & Compress PDFs',
        description:
            'Combine up to 50 PDFs (750 MB batch), split or extract custom page ranges into ZIP archives, or shrink files up to 90% locally with the 6-pass Target-KB Solver (50KB–2MB) and Never-Grow Guard.',
        slugs: ['pdf-merge-split', 'compress-pdf'],
    },
    {
        id: 'convert-from-pdf',
        label: 'Convert From PDF',
        heading: 'Convert From PDF to Office & Images',
        description:
            'Extract editable Microsoft Word (.DOCX), multi-sheet Excel (.XLSX) & CSV tables, 16:9 or 4:3 PowerPoint (.PPTX) slide decks, and up to 600 DPI JPG, PNG, or WebP images locally in your browser.',
        slugs: ['pdf-to-word', 'pdf-to-excel', 'pdf-to-ppt', 'pdf-to-jpg'],
    },
    {
        id: 'convert-to-pdf',
        label: 'Convert To PDF',
        heading: 'Convert Word, Excel & Images to PDF',
        description:
            'Compile .DOCX, Markdown, .XLSX/.CSV spreadsheets, and up to 100 JPG, PNG, WebP, HEIC, or SVG images into searchable, print-ready vector PDF documents with zero server uploads.',
        slugs: ['word-to-pdf', 'excel-to-pdf', 'image-to-pdf'],
    },
    {
        id: 'sign-watermark-redact',
        label: 'Sign, Bates & Redact',
        heading: 'Sign, Watermark, Bates-Stamp & Redact PII',
        description:
            'Apply ISO 32000-1 /ByteRange digital signatures with SHA-256 audit pages, diagonal tiled watermarks, continuous multi-PDF legal Bates numbering, or permanently excise IBANs, SSNs, CNICs, PANs, and 12 metadata surfaces via Deep CDR.',
        slugs: ['pdf-signer-bates-stamper', 'pdf-scrubber'],
    },
] as const;

/**
 * Verified per-tool technical spec badges derived directly from config/toolsData.ts.
 */
export const DOCUMENT_TOOL_SPECS: Record<string, string> = {
    'pdf-merge-split': 'Up to 50 PDFs • 750 MB',
    'compress-pdf': 'Target KB Solver • 4 Modes',
    'pdf-to-word': 'DOCX • MD • TXT',
    'pdf-to-excel': 'XLSX • CSV • JSON',
    'pdf-to-ppt': 'PPTX • 16:9 & 4:3',
    'pdf-to-jpg': 'Up to 600 DPI • ZIP',
    'word-to-pdf': 'DOCX / MD → Vector PDF',
    'excel-to-pdf': 'XLSX / CSV → Auto-Fit PDF',
    'image-to-pdf': 'Up to 100 Images • 500 MB',
    'pdf-signer-bates-stamper': 'ISO 32000-1 • Bates • Watermark',
    'pdf-scrubber': 'Deep CDR • 8-Region PII',
};

/**
 * Cross-category PDF-adjacent tools hosted in Finance & Media hubs.
 * Helps users discover A4 PDF invoicing and HEIC/AVIF EXIF privacy workflows without duplicating routes.
 */
export const ADJACENT_DOCUMENT_TOOL_REFS: readonly AdjacentDocumentLink[] = [
    {
        categoryId: 'finance',
        slug: 'invoice-generator',
        hubLabel: 'Finance & Calculators Hub',
    },
    {
        categoryId: 'media',
        slug: 'heic-to-jpg',
        hubLabel: 'Media & Images Hub',
    },
] as const;

/**
 * Helper that resolves all published document tools into the defined groups
 * plus a safe fallback bucket so newly published tools in toolsData.ts always appear.
 */
export function resolveDocumentToolGroups(documentTools: Tool[]) {
    const bySlug = new Map(documentTools.map((tool) => [tool.slug, tool]));
    const assignedSlugs = new Set<string>();

    const groups = DOCUMENT_SUBTOPIC_GROUPS.map((group) => {
        const resolvedTools = group.slugs
            .map((slug) => bySlug.get(slug))
            .filter((tool): tool is Tool => Boolean(tool));

        resolvedTools.forEach((tool) => assignedSlugs.add(tool.slug));

        return {
            ...group,
            tools: resolvedTools,
        };
    }).filter((group) => group.tools.length > 0);

    const unassignedTools = documentTools.filter(
        (tool) => !assignedSlugs.has(tool.slug)
    );

    if (unassignedTools.length > 0) {
        groups.push({
            id: 'additional-document-tools',
            label: 'More PDF Tools',
            heading: 'Additional PDF & Document Utilities',
            description:
                'Recently published browser-based PDF and document utilities in the KivaroTools directory.',
            slugs: unassignedTools.map((t) => t.slug),
            tools: unassignedTools,
        });
    }

    return groups;
}

/**
 * Live dynamic counts derived from toolsData.ts.
 */
export function getDocumentCategoryStats(
    documentTools: Tool[] = getPublishedDocumentTools()
) {
    const totalTools = documentTools.length;
    const groupCount = resolveDocumentToolGroups(documentTools).length;

    return {
        totalTools,
        groupCount,
    };
}

/**
 * Evidence-backed SEO metadata for /document with automatic live counts.
 * Note: app/layout.tsx applies `template: '%s | KivaroTools'`, so `seoTitle`
 * renders as "Free Online PDF Tools — No Upload | KivaroTools" (47 characters).
 */
export function getDocumentCategorySeo(
    documentTools: Tool[] = getPublishedDocumentTools()
) {
    const { totalTools, groupCount } = getDocumentCategoryStats(documentTools);

    return {
        seoTitle: 'Free Online PDF Tools — No Upload',
        seoDescription: `Use ${totalTools} free online PDF tools with zero server uploads: merge, split, compress to target KB, convert Word/Excel/PPT/JPG, sign, Bates-stamp & redact PII.`,
        h1Primary: 'Free Online PDF Tools',
        h1Accent: '(Zero Upload, Private by Design).',
        heroLead: `Process sensitive documents with ${totalTools} client-side PDF utilities across ${groupCount} workflows—merge and split up to 50 PDFs, compress to exact target KB sizes, convert PDF to and from Word, Excel, PowerPoint, and 600 DPI images, apply digital signatures, watermarks, and legal Bates stamps, or permanently scrub PII with zero file uploads and zero signup.`,
        keywords: [
            'free online pdf tools',
            'online pdf tools',
            'no upload pdf tools',
            'private pdf tools',
            'client-side pdf tools',
            'local pdf tools',
            'pdf utilities online',
            'pdf toolkit online',
            'pdf tools without uploading',
            'free pdf tools no watermark',
            'browser pdf tools',
            'all in one pdf tools',
        ],
    } as const;
}

/**
 * Factual comparison between KivaroTools browser-local PDF utilities and typical cloud-upload sites.
 */
export const DOCUMENT_ARCHITECTURE_COMPARISON: readonly DocumentComparisonRow[] =
    [
        {
            criterion: 'Document Processing',
            kivaroClientSide:
                'Runs locally in browser RAM using pdf-lib, pdf.js, SheetJS, and HTML5 Canvas—zero document bytes uploaded.',
            cloudUploadSites:
                'Uploads your PDF, Word, Excel, or image files to remote cloud servers for conversion or compression.',
        },
        {
            criterion: 'Server Retention',
            kivaroClientSide:
                'Nothing stored on remote servers; processed files exist only in local browser memory until you close the tab.',
            cloudUploadSites:
                'Files reside temporarily on third-party storage subject to timed auto-deletion policies.',
        },
        {
            criterion: 'Signup & Watermarks',
            kivaroClientSide:
                'Zero account walls, zero forced branding watermarks, and no per-hour cloud task paywalls.',
            cloudUploadSites:
                'Often gated by daily file limits, mandatory sign-in, or paid subscriptions for batch workflows.',
        },
        {
            criterion: 'Privacy Auditability',
            kivaroClientSide:
                'Independently verifiable in 30 seconds using your browser DevTools (F12) Network tab.',
            cloudUploadSites:
                'Requires trusting server-side privacy policies without direct client-side verification.',
        },
        {
            criterion: 'Sensitive Documents',
            kivaroClientSide:
                'Built for local handling of bank statements, tax forms, contracts, IDs, and legal exhibits.',
            cloudUploadSites:
                'Uploading regulated financial, medical, or legal records may conflict with internal data policies.',
        },
    ] as const;

/**
 * 30-second F12 DevTools Network verification steps.
 * Transparently distinguishes static JS library/worker loads from user document byte transmission.
 */
export const DOCUMENT_DEVTOOLS_VERIFICATION_STEPS: readonly DocumentVerificationStep[] =
    [
        {
            step: '01',
            title: 'Open DevTools Network Tab',
            detail:
                'Launch any PDF utility below, press F12 (or Cmd+Opt+I on macOS), select the Network tab, and enable Preserve log.',
        },
        {
            step: '02',
            title: 'Clear & Load Your File',
            detail:
                'Click the Clear button after the workspace finishes loading, then drop your local PDF, DOCX, XLSX, or image file.',
        },
        {
            step: '03',
            title: 'Verify Zero File Uploads',
            detail:
                'Run Merge, Compress, Convert, Sign, or Redact. Static parser scripts (such as pdf.js on first load) may initialize, while zero POST/PUT requests ever transmit your document bytes.',
        },
        {
            step: '04',
            title: 'Download from Local RAM',
            detail:
                'Your output file is generated as a local browser Blob URL and saved straight to disk—close the tab to release memory.',
        },
    ] as const;

/**
 * Category-level FAQs rendered in visible <details> accordions and mirrored
 * verbatim in FAQPage JSON-LD schema on /document—counts update automatically.
 */
export function getDocumentCategoryFaqs(
    documentTools: Tool[] = getPublishedDocumentTools()
): readonly DocumentFaqItem[] {
    const { totalTools, groupCount } = getDocumentCategoryStats(documentTools);

    return [
        {
            question:
                'Are these online PDF tools completely free with no signup or watermarks?',
            answer: `Yes. All ${totalTools} client-side PDF tools in this directory are free to use with no account registration, no email gates, no forced branding watermarks, and no cloud paywalls.`,
        },
        {
            question: 'Do KivaroTools PDF utilities upload my files to a server?',
            answer:
                'No. Your PDF, Word, Excel, PowerPoint, and image files are processed locally inside your browser memory with zero document uploads. While static application and parser scripts (such as pdf.js) load when you open a workspace, no POST or PUT request ever transmits your file bytes—which you can verify directly in the DevTools (F12) Network tab.',
        },
        {
            question:
                'What types of PDF and document tools are included in this directory?',
            answer: `This hub organizes ${totalTools} browser-local PDF utilities into ${groupCount} workflows: Organize & Compress (Merge/Split and Target-KB Compression), Convert From PDF (to Word .DOCX, Excel .XLSX/CSV, PowerPoint .PPTX, and up to 600 DPI JPG/PNG/WebP), Convert To PDF (from Word, Excel/CSV, and up to 100 images), and Sign, Watermark, Bates-Stamp & Deep CDR PII Redaction.`,
        },
        {
            question:
                'Can I compress a PDF to an exact target file size like 100KB or 200KB?',
            answer:
                'Yes. The Compress PDF tool includes a 6-pass Target-KB Solver with quick presets (50KB, 100KB, 200KB, 500KB, 1MB, and 2MB) alongside Balanced, Extreme, and Lossless Vector modes, a PDF Space X-Ray analyzer, and a Never-Grow Guard so output files never exceed the original size.',
        },
        {
            question:
                'How does the PDF Bank Statement & Invoice Data Scrubber redact sensitive data?',
            answer:
                'Instead of covering text with removable visual black boxes, the PDF Scrubber performs true PDF 1.7 content-stream (Tj/TJ) excision and 12-surface CDR metadata stripping. It includes built-in checksum validators across 8 regions for Luhn card PANs, Mod-97 IBANs, ABA routing numbers, SSNs, AU ABNs, Indian GSTIN/PAN/Aadhaar, Pakistan CNIC/NTN, and Saudi ZATCA QR payloads.',
        },
        {
            question:
                'Can I convert PDFs to editable Word, Excel, or PowerPoint files locally?',
            answer:
                'Yes. Our Convert From PDF suite reconstructs editable ECMA-376 Microsoft Word (.DOCX) documents with a live pre-download editor, extracts multi-sheet Excel (.XLSX) and CSV tables using spatial Y-baseline and X-column recovery, and generates 16:9 or 4:3 PowerPoint (.PPTX) slide decks—all locally in your browser.',
        },
        {
            question:
                'Does KivaroTools include an interactive inline PDF text or form editor?',
            answer:
                'No. KivaroTools focuses on private PDF organizing, target-KB compression, Office/image conversion, digital signing, watermarking, legal Bates stamping, and permanent PII redaction rather than interactive inline PDF form editing. To edit prose inside a PDF, convert it locally with PDF to Word (.DOCX) and edit it in the pre-download editor or your word processor.',
        },
        {
            question:
                'What file size limits apply to browser-based PDF processing?',
            answer:
                'Because processing runs locally in your device RAM rather than on a throttled cloud queue, limits are designed around browser memory stability—such as merging up to 50 PDFs (250 MB per file / 750 MB batch) in PDF Merge & Split and converting up to 100 images (500 MB total) in Image to PDF.',
        },
    ] as const;
}

/**
 * Default pre-computed exports (automatically derived from toolsData.ts).
 */
export const DOCUMENT_CATEGORY_SEO = getDocumentCategorySeo();
export const DOCUMENT_CATEGORY_FAQS = getDocumentCategoryFaqs();