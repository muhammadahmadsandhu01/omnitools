import { tools, type Tool } from '@/config/toolsData';

export interface MediaSubtopicGroup {
    id: string;
    label: string;
    heading: string;
    description: string;
    slugs: readonly string[];
}

export interface MediaFaqItem {
    question: string;
    answer: string;
}

export interface MediaVerificationStep {
    step: string;
    title: string;
    detail: string;
}

export interface MediaComparisonRow {
    criterion: string;
    kivaroClientSide: string;
    cloudUploadSites: string;
}

export interface AdjacentMediaLink {
    categoryId: 'document' | 'developer';
    slug: string;
    hubLabel: string;
}

/**
 * Returns all currently published, visible image tools in the /media category from toolsData.ts.
 */
export function getPublishedMediaTools(): Tool[] {
    return tools.filter(
        (tool) =>
            tool.categoryId === 'media' &&
            tool.status === 'published' &&
            !tool.hidden
    );
}

/**
 * Logical subtopic workbench definitions covering all published /media image tools
 * in config/toolsData.ts. Organized around user workflow intent (Conversion/EXIF vs. Compression/Target-KB).
 */
export const MEDIA_SUBTOPIC_GROUPS: readonly MediaSubtopicGroup[] = [
    {
        id: 'format-conversion-exif',
        label: 'Format & EXIF Privacy',
        heading: 'Batch Format Converters & EXIF Privacy',
        description:
            'Batch convert iPhone HEIC/HEIF, AVIF, and WebP photos to JPG, lossless 8-bit alpha PNG, WebP, or printable PDF locally—with Display P3 to sRGB gamut mapping, custom hex alpha matte fill, binary ISOBMFF inspection, and 16-tag EXIF & GPS (0x8825) metadata scrubbing.',
        slugs: ['heic-to-jpg', 'webp-to-jpg-png'],
    },
    {
        id: 'compression-target-kb',
        label: 'Compress & Target KB',
        heading: 'Perceptual Compression & Target-KB Sizing',
        description:
            'Compress and resize up to 100 JPG, PNG, WebP, AVIF, and HEIC images locally with 0–100 perceptual SSIM scoring, 5-pass binary-search exact Target-KB sizing (10 KB–100 MB, including 20KB, 50KB, and 100KB portal limits), automatic EXIF stripping, and interactive Before/After split inspection.',
        slugs: ['image-compressor'],
    },
] as const;

/**
 * Verified per-tool technical spec badges derived directly from config/toolsData.ts.
 */
export const MEDIA_TOOL_SPECS: Record<string, string> = {
    'heic-to-jpg': 'HEIC/AVIF • P3→sRGB • 16-Tag EXIF',
    'webp-to-jpg-png': 'Up to 50 WebP • 250 MB • Alpha Fill',
    'image-compressor': 'Up to 100 Images • SSIM • 10KB–100MB',
};

/**
 * Cross-category image & visual utilities hosted in Document & Developer hubs.
 * Raises visual workflow breadth without duplicating routes or causing keyword cannibalization.
 */
export const ADJACENT_MEDIA_TOOL_REFS: readonly AdjacentMediaLink[] = [
    {
        categoryId: 'document',
        slug: 'image-to-pdf',
        hubLabel: 'Document Utilities Hub',
    },
    {
        categoryId: 'document',
        slug: 'pdf-to-jpg',
        hubLabel: 'Document Utilities Hub',
    },
    {
        categoryId: 'developer',
        slug: 'svg-optimizer',
        hubLabel: 'Developer Tools Hub',
    },
] as const;

/**
 * Helper that resolves all published /media tools into the defined workflow groups
 * plus an automatic fallback bucket so newly published image tools in toolsData.ts always appear.
 */
export function resolveMediaToolGroups(mediaTools: Tool[]) {
    const bySlug = new Map(mediaTools.map((tool) => [tool.slug, tool]));
    const assignedSlugs = new Set<string>();

    const groups = MEDIA_SUBTOPIC_GROUPS.map((group) => {
        const resolvedTools = group.slugs
            .map((slug) => bySlug.get(slug))
            .filter((tool): tool is Tool => Boolean(tool));

        resolvedTools.forEach((tool) => assignedSlugs.add(tool.slug));

        return {
            ...group,
            tools: resolvedTools,
        };
    }).filter((group) => group.tools.length > 0);

    const unassignedTools = mediaTools.filter(
        (tool) => !assignedSlugs.has(tool.slug)
    );

    if (unassignedTools.length > 0) {
        groups.push({
            id: 'additional-image-tools',
            label: 'More Image Tools',
            heading: 'Additional Browser Image Utilities',
            description:
                'Recently published client-side image utilities in the KivaroTools directory.',
            slugs: unassignedTools.map((t) => t.slug),
            tools: unassignedTools,
        });
    }

    return groups;
}

/**
 * Live dynamic counts derived from toolsData.ts so hero, metadata, tabs, and FAQs
 * auto-increment whenever new image tools are published.
 */
export function getMediaCategoryStats(
    mediaTools: Tool[] = getPublishedMediaTools()
) {
    const totalTools = mediaTools.length;
    const groupCount = resolveMediaToolGroups(mediaTools).length;

    return {
        totalTools,
        groupCount,
    };
}

/**
 * Evidence-backed SEO metadata for /media with automatic live counts.
 * Note: app/layout.tsx applies `template: '%s | KivaroTools'`, so `seoTitle`
 * renders as "Private Image Tools — No Upload | KivaroTools" (45 characters).
 * Keeps URL /media unchanged, drops "Media" from Title/H1, and avoids tool-page
 * cannibalization ("Compress" / "Convert").
 */
export function getMediaCategorySeo(
    mediaTools: Tool[] = getPublishedMediaTools()
) {
    const { totalTools, groupCount } = getMediaCategoryStats(mediaTools);
    const suiteLabel = groupCount === 1 ? 'workflow' : 'workflows';

    return {
        seoTitle: 'Private Image Tools — No Upload',
        seoDescription: `Use ${totalTools} free private online image utilities with zero uploads: batch convert HEIC, AVIF & WebP, strip GPS EXIF, and compress photos to exact KB size.`,
        h1Primary: 'Private Online Image Tools',
        h1Accent: '(Zero Upload, Client-Side Utilities).',
        heroLead: `Process personal, passport, and production photos with ${totalTools} free browser image utilities across ${groupCount} ${suiteLabel}—batch convert iPhone HEIC, AVIF, and WebP locally with Display P3 to sRGB color mapping, scrub 16-tag EXIF and GPS (0x8825) metadata, and compress up to 100 images to exact 20KB, 50KB, or 100KB portal limits with perceptual SSIM scoring and zero server uploads.`,
        keywords: [
            'no upload image tools',
            'free image tools no upload',
            'private image tools',
            'online image utilities',
            'batch image tools online',
            'client-side image tools',
            'free browser image tools',
            'privacy-first image tools',
        ],
    } as const;
}

/**
 * Factual comparison between KivaroTools browser-local image utilities and typical cloud-upload sites.
 */
export const MEDIA_ARCHITECTURE_COMPARISON: readonly MediaComparisonRow[] = [
    {
        criterion: 'Image Processing',
        kivaroClientSide:
            'Runs 100% locally in browser RAM using native Canvas, createImageBitmap, deterministic ISOBMFF/EXIF engines, and JSZip—zero image bytes uploaded.',
        cloudUploadSites:
            'Uploads your personal photos, IDs, and product assets to third-party servers before transcoding or compressing.',
    },
    {
        criterion: 'Server Retention',
        kivaroClientSide:
            'Zero server storage or retention queues; processed images exist only in local browser memory until you close the tab.',
        cloudUploadSites:
            'Files sit on remote servers for 30 minutes to 24 hours under automated deletion policies.',
    },
    {
        criterion: 'Batch Limits & Paywalls',
        kivaroClientSide:
            'High-volume local batches (up to 100 images / 100 MB per file in Image Compressor; up to 50 WebP / 250 MB batch), free for personal & commercial use with zero watermarks.',
        cloudUploadSites:
            'Commonly enforces 5–20 file caps, artificial wait timers, reCAPTCHAs, or monthly subscriptions for batch and commercial usage.',
    },
    {
        criterion: 'EXIF, GPS & Color Fidelity',
        kivaroClientSide:
            'Built-in 16-tag EXIF & GPS (0x8825) privacy scrubber, Display P3 to sRGB gamut mapping, and 0–100 perceptual SSIM scoring.',
        cloudUploadSites:
            'Often strips colors silently (washed-out iPhone HEIC exports) or omits verifiable GPS/MakerNote privacy controls.',
    },
    {
        criterion: 'Privacy Verification',
        kivaroClientSide:
            'Independently auditable in 30 seconds inside your browser DevTools (F12) Network tab.',
        cloudUploadSites:
            'Requires trusting server-side privacy claims without direct client-side verification.',
    },
] as const;

/**
 * 30-second F12 DevTools Network verification steps.
 * Transparently distinguishes initial page/script load from user image byte transmission.
 */
export const MEDIA_DEVTOOLS_VERIFICATION_STEPS: readonly MediaVerificationStep[] =
    [
        {
            step: '01',
            title: 'Open DevTools Network Tab',
            detail:
                'Open any image utility below, press F12 (or Cmd+Opt+I on macOS), switch to the Network tab, and check Preserve log.',
        },
        {
            step: '02',
            title: 'Clear & Drop Your Photos',
            detail:
                'Click Clear once the workspace has loaded, then drop your local HEIC, AVIF, WebP, JPG, or PNG files into the browser.',
        },
        {
            step: '03',
            title: 'Verify Zero File Uploads',
            detail:
                'Run batch conversion, EXIF/GPS scrubbing, or exact Target-KB compression. Zero POST or PUT requests ever transmit your image bytes to any server.',
        },
        {
            step: '04',
            title: 'Download from Local RAM',
            detail:
                'Converted images, PDFs, and ZIP archives are created as local browser Blob URLs and saved straight to disk—close the tab to release memory.',
        },
    ] as const;

/**
 * Category-level FAQs rendered in visible <details> accordions and mirrored
 * verbatim in FAQPage JSON-LD schema on /media—counts update automatically.
 */
export function getMediaCategoryFaqs(
    mediaTools: Tool[] = getPublishedMediaTools()
): readonly MediaFaqItem[] {
    const { totalTools, groupCount } = getMediaCategoryStats(mediaTools);
    const suiteLabel = groupCount === 1 ? 'workflow' : 'workflows';

    return [
        {
            question:
                'Are my photos uploaded to a server when compressing or converting, and are they safe for passport and ID photos?',
            answer: `No. All ${totalTools} browser image utilities in this directory run 100% client-side inside your browser memory with zero server uploads. Because no image bytes leave your device, these tools are built for private handling of passport photos, visa applications, national IDs, and personal documents—and you can confirm zero uploads in 30 seconds using your browser DevTools (F12) Network tab.`,
        },
        {
            question:
                'Can I convert iPhone HEIC and AVIF photos to JPG or PDF locally without uploading them?',
            answer:
                'Yes. The HEIC & AVIF to JPG, PNG, WebP & PDF Batch Converter — EXIF Privacy Studio decodes iPhone .HEIC, .HEIF, and .AVIF photos directly in your browser. It maps Display P3 wide color gamut to sRGB so photos do not look washed out, recovers misnamed WhatsApp files via binary ISOBMFF inspection, and exports single images, ZIP archives, or multi-page printable PDFs with zero server uploads.',
        },
        {
            question:
                'Does compressing or converting strip GPS location and camera EXIF metadata?',
            answer:
                'Yes. The Image Compressor automatically strips EXIF and GPS metadata during optimization, and the HEIC & AVIF EXIF Privacy Studio includes a 16-tag EXIF & GPS (0x8825) privacy engine with three modes: Strip All EXIF & GPS, Keep Camera/Lens EXIF while Stripping GPS Coordinates, or Preserve All Metadata.',
        },
        {
            question:
                'Can I compress a photo to an exact KB limit (20KB, 50KB, 100KB) for online forms, and how many images can I batch-process at once?',
            answer: `Yes. Across our ${groupCount} image ${suiteLabel}, the Image Compressor uses a 5-pass binary-search Target File Size engine (10 KB to 100 MB, including 20KB, 50KB, and 100KB portal limits) with 0–100 perceptual SSIM scoring and supports batches of up to 100 images (100 MB per file). The WebP Converter handles up to 50 WebP files (50 MB per file / 250 MB batch), and the HEIC & AVIF Studio also includes target KB auto-tuning (<= 50 KB to <= 1 MB) for visa and passport portals.`,
        },
        {
            question:
                'Are there watermarks, sign-up requirements, daily file limits, or paid commercial-use restrictions?',
            answer: `No. All ${totalTools} private online image tools on KivaroTools are free for both personal and commercial use with zero watermarks, zero account registration, no artificial wait timers, and no daily cloud credit caps.`,
        },
    ] as const;
}

/**
 * Default pre-computed exports (automatically derived from toolsData.ts).
 */
export const MEDIA_CATEGORY_SEO = getMediaCategorySeo();
export const MEDIA_CATEGORY_FAQS = getMediaCategoryFaqs();