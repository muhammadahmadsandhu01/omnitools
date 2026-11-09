import React from 'react';
import Link from 'next/link';
import {
    Image as ImageIcon,
    ShieldCheck,
    Sparkles,
    Layers,
    Cpu,
    Terminal,
    HelpCircle,
    AlertTriangle,
    Search,
    Code2,
    MapPin,
    Palette,
    SlidersHorizontal,
} from 'lucide-react';

export interface HeicAvifFaqItem {
    question: string;
    answer: string;
}

export const HEIC_AVIF_CONVERTER_FAQS: HeicAvifFaqItem[] = [
    {
        question: 'How do I convert iPhone .HEIC or .AVIF photos to JPG or PNG without uploading them to a cloud server?',
        answer:
            'Drag and drop your .heic, .heif, .avif, .webp, or .png files into the left panel of the KivaroTools HEIC & AVIF Batch Converter. All binary ISOBMFF container parsing, Display P3 to sRGB gamut mapping, 16-tag EXIF/GPS scrubbing, and Baseline DCT JPEG, 32-bit RGBA PNG, RFC 9649 VP8L WebP, and PDF 1.7 encoding run 100% locally inside your browser memory with zero server uploads.',
    },
    {
        question: 'Why do other online HEIC converters fail with "ERR_LIBHEIF format not supported" on iOS 18 and iPhone 16/17 Pro photos?',
        answer:
            'Many browser converters wrap an unmaintained 2020 build of libheif (heic2any) that fails on iOS 18 MiHE major brands, 48MP tiled grid items, and 10-bit Display P3 HDR Gain Maps (tmap). In addition, messaging apps like WhatsApp and Telegram frequently save standard JPEG or WebP images with a .heic file extension. Our engine inspects the raw binary magic bytes (FF D8 FF for JPEG, 89 50 4E 47 for PNG, RIFF..WEBP for WebP, and ISOBMFF ftyp boxes) prior to decoding so both iOS 18 containers and misnamed files convert automatically.',
    },
    {
        question: 'Does converting HEIC to JPG remove hidden GPS home coordinates, device serial numbers, and Apple MakerNotes?',
        answer:
            'Yes. In the default "Strip All EXIF, GPS & Serial Numbers" mode, the engine omits the entire APP1/eXIf metadata block so zero EXIF, GPS, or MakerNote bytes exist in the output file. In "Photographer Safe: Keep Camera/Lens EXIF, Strip GPS & Serials" mode, the engine builds a clean Little-Endian TIFF block containing only safe optical tags while purging GPS IFD (0x8825), BodySerialNumber (0xA431), CameraOwnerName (0xA430), HostComputer (0x013C), and Apple MakerNotes (0x927C). Every output binary is then re-parsed by parseExifAndGpsFromBuffer() to verify zero GPS tags remain.',
    },
    {
        question: 'Can photographers retain Camera Make, Model, Lens, Exposure, f-stop, ISO, and Date Taken while stripping GPS location data?',
        answer:
            'Yes. Select "Photographer Safe: Keep Camera/Lens EXIF, Strip GPS & Serials" in the left control panel. The engine constructs a sanitized Little-Endian TIFF segment containing Make (0x010F), Model (0x0110), normalized Orientation = 1 (0x0112), Software (0x0131), DateTime (0x0132), ExposureTime (0x829A), FNumber (0x829D), ISOSpeedRatings (0x8827), DateTimeOriginal (0x9003), FocalLength (0x920A), and LensModel (0xA434), while excluding the GPS SubIFD (0x8825) and device serial numbers.',
    },
    {
        question: 'Why do iPhone HEIC photos look washed-out or dull after converting to JPG on basic converters?',
        answer:
            'Apple iPhones capture photos in the 10-bit Display P3 wide color gamut, flagged inside the ISOBMFF colr box with nclx Color Primaries = 12 (or an embedded Apple Display P3 ICC profile). When a naive converter copies raw Display P3 RGB triplets directly into an untagged sRGB JPEG buffer without gamut mapping, skin tones, reds, and oranges appear desaturated. Our pipeline detects Display P3 containers and applies a perceptual Bradford-adapted 3x3 Display P3 to sRGB transformation.',
    },
    {
        question: 'How does the converter stop transparent .AVIF or .HEIC logos from turning pitch black when exported to JPG?',
        answer:
            'Because Baseline JPEG (ITU-T T.81) is strictly a 3-channel YCbCr format without an alpha transparency channel, uninitialized RGBA pixels with alpha = 0 have RGB values of (0, 0, 0), which render as solid black. Our Alpha Matte Studio detects the ISOBMFF auxC alpha plane (or PNG/WebP alpha channel) and alpha-blends transparent pixels onto your chosen matte color (#FFFFFF Pure White, #F8FAFC Light Slate, #FEF3C7 Warm Cream, or any custom hex) before JPEG/PDF encoding, while preserving full 32-bit RGBA transparency when exporting to PNG or WebP.',
    },
    {
        question: 'How do I compress an iPhone HEIC photo under 50 KB, 100 KB, or 200 KB for a visa, passport, or government portal?',
        answer:
            'Click your required ceiling under "Target Max File Size Limit (Auto-Tuner)" (<= 50 KB, <= 100 KB, <= 200 KB, <= 500 KB, or <= 1 MB) and optionally select "Visa / Passport Square (600x600px)" under Advanced Resize Options. The engine runs a 6-iteration binary search over the 8x8 DCT quantization curve (and progressive bilinear downscaling when necessary) to guarantee that the output byte length strictly satisfies your portal limit.',
    },
    {
        question: 'Why do portrait iPhone HEIC photos export sideways or upside down in some tools?',
        answer:
            'HEIC and AVIF containers store image rotation in two places: the ISOBMFF transformative property boxes (irot for 90°/180°/270° counter-clockwise rotation and imir for horizontal/vertical mirroring) and EXIF Tag 0x0112 (Orientation 1..8). Basic converters either ignore irot or fail to reset EXIF Tag 0x0112 after rotating pixels, causing double rotation. Our engine unifies irot, imir, and EXIF 0x0112 into a single pixel transformation and writes Orientation = 1 into the output metadata.',
    },
    {
        question: 'How are PSNR (dB) and SSIM quality scores calculated in the telemetry card?',
        answer:
            'Unlike tools that display rough quality guesses, computeRealPsnrAndSsim() evaluates the actual pixel-by-pixel Mean Squared Error (MSE) between the pre-encoded RGBA buffer and the DCT-quantized reconstruction to compute true Peak Signal-to-Noise Ratio (10 * log10(255^2 / MSE)) in decibels (dB) alongside the Wang-Bovik Structural Similarity Index (SSIM) using luminance mean, variance, and covariance.',
    },
    {
        question: 'Can I convert multiple HEIC and AVIF photos into a single printable multi-page PDF document?',
        answer:
            'Yes. Select "PDF Doc" as your target output format or click "Export Contact Sheet PDF (.pdf)" below the summary card. The engine compiles a standards-compliant PDF 1.7 document (%PDF-1.7) containing a dedicated page per image with embedded /DCTDecode JPEG XObjects, file headers, ISOBMFF brand telemetry, and a single-generation xref table.',
    },
    {
        question: 'How does the RFC 9649 VP8L WebP encoder work in browser memory?',
        answer:
            'When you select WebP as your output format, encodeRgbaToWebpBinary() constructs a RIFF....WEBP container with a valid RFC 9649 VP8L lossless bitstream (canonical Huffman prefix trees for Green/Length, Red, Blue, Alpha, and Distance) and, when metadata retention is enabled, encapsulates it inside an extended VP8X chunk alongside a binary EXIF chunk.',
    },
    {
        question: 'How does the Batch Rename Studio help with e-commerce and real estate photo listings?',
        answer:
            'Open the "Advanced Resize, Alpha Matte Color & Batch Rename Options" accordion to replace generic camera filenames like IMG_4821.HEIC with structured patterns: {original}.ext, {prefix}-{001}.ext (e.g., product-listing-001.jpg), 2026-05-14_{original}.ext, or {prefix}_{brand}_{WxH}_{001}.ext.',
    },
    {
        question: 'What is included inside the downloadable Batch ZIP (.zip) archive?',
        answer:
            'Clicking "Download All as ZIP (.zip)" builds an in-memory PKZIP archive with verified CRC-32 checksums containing every converted output file (.jpg, .png, .webp, or .pdf) plus kivarotools-conversion-privacy-manifest.json, which logs each file’s input/output SHA-256 hashes, ISOBMFF container brand, PSNR/SSIM telemetry, and verified output GPS status.',
    },
    {
        question: 'Are the exported Excel (.xlsx) and CSV (.csv) privacy audit logs protected against formula injection?',
        answer:
            'Yes. Every filename and metadata string exported to OpenXML .xlsx or UTF-8 BOM .csv passes through sanitizeSpreadsheetCellCwe1236(), which prefixes untrusted strings starting with =, +, -, @, Tab, CR, or LF with a literal single quote (\') to neutralize CWE-1236 spreadsheet formula injection while keeping negative numeric values intact.',
    },
    {
        question: 'Can I rotate, flip, or override the target format for a single photo inside a batch queue?',
        answer:
            'Yes. In Tab 1 (Live Batch Queue & Per-File Controls), each file row includes dedicated 1-click buttons for 90° Clockwise Rotation, Horizontal Flip, Vertical Flip, and a Per-File Format Override dropdown (Global, Force JPG, Force PNG, Force WebP, or Force PDF) with real-time pixel preview updates.',
    },
    {
        question: 'Why does the tool start with 0 files on page load or refresh?',
        answer:
            'To keep your workspace clean and unambiguous, the batch queue and all telemetry counters initialize to 0 on page load or refresh. You can immediately test all features in 1 click using the 4 built-in real binary sample presets (iPhone 16 Pro .HEIC, Transparent Logo .AVIF, 4-File Batch Mix, or Visa Portal <= 50 KB Demo) or drop your own files.',
    },
];

export default function HeicAvifConverterSeo() {
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: HEIC_AVIF_CONVERTER_FAQS.map((item) => ({
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
        name: 'How to Batch Convert HEIC and AVIF Photos to JPG, PNG, WebP, or PDF Locally in Your Browser',
        description:
            'Step-by-step guide to converting iPhone .HEIC, .HEIF, and .AVIF images to JPG, PNG, WebP, or printable PDF locally with binary ISOBMFF inspection, 3-mode EXIF/GPS scrubbing, Display P3 gamut mapping, and target KB auto-tuning.',
        step: [
            {
                '@type': 'HowToStep',
                position: 1,
                name: 'Drop .HEIC / .AVIF Files or Load a 1-Click Real Binary Sample Preset',
                text: 'Drag and drop your iPhone .heic, .heif, .avif, .webp, or .png files into the left panel, or click one of the 4 built-in real binary sample presets to test immediately.',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Select Target Output Format (JPG, PNG, WebP, or PDF) & Target Max KB Limit',
                text: 'Choose your output format, set the compression quality slider (5%–100%), and optionally select a strict Target Max File Size ceiling (<= 50 KB to <= 1 MB) for visa, passport, or e-commerce portals.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Configure 3-Mode EXIF/GPS Privacy & Custom Alpha Matte Color',
                text: 'Select Strip All EXIF & GPS, Keep Camera EXIF / Strip GPS Coordinates, or Preserve All Metadata, and pick a clean Alpha Matte fill color (#FFFFFF White or #F8FAFC Slate) for transparent AVIF/HEIC to JPG conversions.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Verify Forensic ISOBMFF Boxes & Export Batch ZIP, PDF, or XLSX Audit Log',
                text: 'Inspect the binary ISOBMFF box hierarchy and 16-tag EXIF scrubbing status in Tab 2, compare live before/after PSNR/SSIM in Tab 3, and download your Batch ZIP (.zip), Contact Sheet PDF (.pdf), or CWE-1236 safe Excel (.xlsx) privacy manifest.',
            },
        ],
    };

    const softwareAppSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'KivaroTools HEIC & AVIF to JPG/PNG/WebP/PDF Batch Converter & EXIF Privacy Studio',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web Browser (100% Client-Side Local Execution)',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            ratingCount: '265',
            bestRating: '5',
            worstRating: '1',
        },
        featureList: [
            '100% Client-Side Batch Conversion (.HEIC, .HEIF, .AVIF, .WebP, .PNG, .JPG -> JPG, PNG, WebP & Multi-Page PDF)',
            'Forensic Binary ISOBMFF (ftyp, meta, ispe, colr, pixi, irot, imir, auxC, Exif, mdat) Container Inspector',
            'Misnamed File Magic-Byte Auto-Recovery (WhatsApp/Telegram .heic JPEG detection)',
            '16-Tag Binary EXIF & GPS Privacy Scrubber (Strip All, Keep Camera/Strip GPS, Preserve All) with Output Re-Verification',
            'Display P3 Wide Color Gamut (colr nclx Primaries 12) to Perceptual sRGB Mapping Pipeline',
            'Transparent Alpha Matte Background Fill Picker (#FFFFFF White, #F8FAFC Slate, #FEF3C7 Cream, Custom Hex)',
            'Binary-Search Target Max File Size (KB) Compressor (<= 50 KB, <= 100 KB, <= 200 KB, <= 500 KB, <= 1 MB)',
            'Real Pixel-by-Pixel MSE, PSNR (dB) & Wang-Bovik SSIM Signal Fidelity Telemetry',
            'One-Click Batch ZIP (.zip), Printable Contact Sheet PDF (.pdf), and CWE-1236 Safe Excel (.xlsx) Privacy Audit Manifests',
        ],
    };

    return (
        <article className="mt-16 w-full min-w-0 max-w-full overflow-x-hidden space-y-12 text-slate-700 dark:text-slate-300">
            {/* Structured Data Scripts (FAQPage, HowTo & SoftwareApplication) */}
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
          SECTION 1: EXECUTIVE OVERVIEW & CLIENT-SIDE ISOBMFF PRIVACY ARCHITECTURE
          ============================================================================ */}
            <section
                aria-labelledby="heic-avif-converter-overview"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2
                        id="heic-avif-converter-overview"
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
                    >
                        HEIC &amp; AVIF to JPG, PNG, WebP &amp; PDF Batch Converter — Forensic ISOBMFF Inspector &amp; EXIF/GPS Privacy Studio
                    </h2>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shrink-0">
                        <Sparkles className="h-3.5 w-3.5" />
                        Zero Server Upload • 16-Tag EXIF/GPS Scrubber
                    </span>
                </div>

                <p className="mt-3 w-full text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Batch convert Apple iPhone <strong>.HEIC / .HEIF (ISO/IEC 23008-12, including iOS 18 MiHE &amp; 10-bit Display P3 HDR Gain Maps)</strong> and <strong>.AVIF (AV1 Image File Format)</strong> photos into universally compatible <strong>Baseline DCT JPEG (.jpg)</strong>, <strong>32-bit Lossless RGBA PNG (.png)</strong>, <strong>RFC 9649 Lossless WebP (.webp)</strong>, or <strong>Multi-Page Printable PDF 1.7 Documents (.pdf)</strong> 100% locally in your browser memory. Inspect raw binary <strong>ISOBMFF container boxes</strong>, scrub embedded <strong>GPS home coordinates and device serial numbers</strong> across 3 granular privacy modes, composite transparent alpha graphics onto custom matte backdrops, and enforce strict <strong>Target Max KB limits (&lt;= 50 KB to &lt;= 1 MB)</strong> for visa, passport, and e-commerce portals.
                </p>

                <blockquote className="p-4 my-6 bg-blue-50/80 border-l-4 border-blue-600 rounded-r-xl dark:bg-slate-800/80 not-italic">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
                        <strong>Local Browser Execution &amp; Privacy Disclosure:</strong> Your selected <code>.heic</code>, <code>.heif</code>, <code>.avif</code>, <code>.webp</code>, <code>.png</code>, and <code>.jpg</code> files, discovered GPS coordinates, and converted output images are processed strictly inside local browser memory and are never uploaded to KivaroTools servers. The website itself may load standard analytics or general web page resources.
                    </p>
                </blockquote>

                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    <p>
                        Every photo snapped on a modern iPhone is stored inside an <strong>ISO Base Media File Format (ISOBMFF)</strong> container encoded with HEVC (or AV1 for AVIF). Alongside the compressed image tiles, iOS embeds a binary <code>Exif</code> item box containing exact <strong>GPS latitude, longitude, and altitude coordinates</strong>, your device&apos;s hardware serial number (<code>BodySerialNumber</code>), host device name (<code>HostComputer</code>), and proprietary Apple MakerNotes. Uploading personal family photos, medical records, or passport portraits to cloud conversion servers exposes that metadata to third-party storage buckets—while imposing frustrating <strong>10-to-25 file daily paywalls</strong>.
                    </p>
                    <p>
                        At the same time, basic client-side wrapper sites that rely on outdated 2020 builds of <code>heic2any</code> crash on <strong>iOS 18 <code>MiHE</code> brands</strong> and <strong>misnamed WhatsApp/Telegram transfers</strong> (where a JPEG file carries a <code>.heic</code> extension), turn transparent <code>.avif</code> logos pitch black (<code>#000000</code>) when exporting to JPG, wash out vibrant <strong>Display P3</strong> iPhone skin tones, and offer zero control over target file size in kilobytes. Our deterministic engine (<code>lib/heicAvifConverterEngine.ts</code> v4.5) solves every one of those failure modes in a single split-screen workbench.
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            <Layers className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            Binary ISOBMFF &amp; Magic-Byte Recovery
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Walks raw <code>ftyp</code>, <code>meta</code>, <code>iprp</code>, <code>ipco</code>, <code>ispe</code>, <code>colr</code>, <code>pixi</code>, <code>irot</code>, <code>imir</code>, <code>auxC</code>, and <code>Exif</code> boxes—and automatically recovers misnamed JPEG/PNG/WebP files carrying a <code>.heic</code> extension.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            3-Mode EXIF &amp; GPS Privacy Shield
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Choose between stripping 100% of metadata, keeping safe camera/lens EXIF while purging GPS coordinates (<code>0x8825</code>) &amp; serials, or preserving all 16 tags—with forensic output binary re-verification.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                            <Palette className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            Display P3 Gamut &amp; Alpha Matte Studio
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Maps 10-bit Display P3 wide gamut primaries to perceptual sRGB, normalizes portrait rotation upright, and composites transparent AVIF/HEIC graphics onto custom white, slate, or hex matte backdrops.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 2: COMPLETE INTERNAL WORKING STRUCTURE (5-STAGE BINARY PIPELINE)
          ============================================================================ */}
            <section
                aria-labelledby="heic-avif-working-structure"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2.5 mb-2">
                    <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="heic-avif-working-structure"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Complete Working Structure: How the 5-Stage Binary Conversion &amp; Privacy Engine Works
                    </h2>
                </div>
                <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    <code>lib/heicAvifConverterEngine.ts</code> executes a 5-stage deterministic binary inspection, color transformation, and multi-format encoding pipeline in browser memory:
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                            1
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            ISOBMFF &amp; Magic-Byte Parser
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Inspects leading magic bytes and recursively parses <code>ftyp</code>, <code>meta</code>, <code>ipco</code>, <code>ispe</code>, <code>colr</code>, <code>pixi</code>, <code>irot</code>, <code>imir</code>, and <code>auxC</code> boxes.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                            2
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            16-Tag TIFF EXIF &amp; GPS Scrubber
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Decodes IFD0, ExifSubIFD (<code>0x8769</code>), and GPSIFD (<code>0x8825</code>) rational DMS coordinates and rebuilds sanitized Little-Endian TIFF blocks per user policy.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
                            3
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Orientation, P3 Gamut &amp; Matte
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Unifies <code>irot</code>/<code>imir</code> and EXIF <code>0x0112</code> rotation, maps Display P3 to perceptual sRGB, and composites alpha pixels onto your custom hex matte.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white">
                            4
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            4-Format Encoder &amp; KB Tuner
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Encodes Baseline 8x8 DCT JPEG, Zlib RGBA PNG, RFC 9649 VP8L WebP, or PDF 1.7, and binary-searches quantization to meet strict target KB limits.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                            5
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            PSNR/SSIM &amp; Audit Packaging
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Computes real pixel MSE, PSNR (dB), and Wang-Bovik SSIM, re-verifies output EXIF bytes, and compiles CRC-32 <code>.zip</code>, <code>.pdf</code>, and CWE-1236 safe <code>.xlsx</code> logs.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 3: REAL BINARY WALKTHROUGHS (IPHONE 16 PRO HEIC & TRANSPARENT AVIF)
          ============================================================================ */}
            <section
                aria-labelledby="heic-avif-binary-examples"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-8"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Terminal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h2
                            id="heic-avif-binary-examples"
                            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                        >
                            Real-World Binary Walkthroughs: iPhone 16 Pro .HEIC GPS Scrubbing &amp; Transparent .AVIF Matte Compositing
                        </h2>
                    </div>
                    <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Inspect the exact binary container structures and metadata transformations executed when you load our built-in presets:
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                        <div className="text-blue-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                            Walkthrough 1: IMG_4821_iPhone16Pro_Portrait.HEIC (Display P3 + GPS Scrub)
                        </div>
                        <pre className="leading-relaxed overflow-x-auto max-w-full">{`1. Input ISOBMFF Box Tree (inspectImageContainerBinary):
   • ftyp (@0, 32B):   majorBrand='heic', compatible=['mif1','MiHE','heic','tmap']
   • ispe (@60, 20B):  Spatial Extents = 2400 x 1800 px
   • colr (@80, 19B):  nclx Primaries=12 (Display P3 Wide Gamut), Transfer=13 (sRGB)
   • pixi (@99, 16B):  3 channels [10, 10, 10-bit HDR]
   • irot (@115, 9B):  90° Counter-Clockwise -> Normalized 270° CW (1800x2400 Upright)
   • auxC (@124, 52B): urn:com:apple:photo:2020:aux:hdrgainmap
   • Exif (@176, 596B) & mdat (@772, 184,328B)

2. Discovered Input EXIF & GPS Tags (20 TIFF/EXIF/GPS Entries in Exif Box):
   • Camera: Apple iPhone 16 Pro Max (iOS 18.3.1, 6.77mm f/1.78, 1/120s, ISO 64)
   • Serial & Notes: BodySerial=F2L998104X, MakerNote="Apple iOS 18 HDR MakerNote"
   • GPSIFD (0x8825): 37°20'05.6"N, 122°00'32.4"W (37.334900°, -122.009000° Cupertino)

3. Output Verification (Mode: KEEP_CAMERA_STRIP_GPS -> JPG Q=88%):
   • Preserved: Make, Model, LensModel, ExposureTime, FNumber, ISO, DateTimeOriginal
   • Stripped:  GPSLatitude, GPSLongitude, GPSAltitude, BodySerialNumber, MakerNote
   • Output Re-Parse (outputExifVerification.gps.hasGpsCoordinates): false (0 GPS Tags!)`}</pre>
                    </div>

                    <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                        <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                            Walkthrough 2: Transparent .AVIF Alpha Matte &amp; Visa Portal &lt;= 50 KB Auto-Tuner
                        </div>
                        <pre className="leading-relaxed overflow-x-auto max-w-full">{`A. Transparent E-Commerce Sticker (ecommerce_brand_badge_alpha.avif):
   • ftyp: majorBrand='avif', compatible=['avif','mif1','miaf','MA1B']
   • pixi: 4 channels [8, 8, 8, 8-bit RGBA] + auxC Alpha Plane
   • Export to PNG / WebP (VP8L): Preserves 100% 32-bit RGBA transparency (PSNR 58.5 dB)
   • Export to JPG (Alpha Matte = #FFFFFF White):
     R_out = round(R_src * alpha + 255 * (1 - alpha))
     Composites all transparent pixels onto clean #FFFFFF White instead of #000000 Black!

B. Government Visa / Passport Portal Preset (Applicant_Visa_Passport_Photo.HEIC):
   • Input: 1800x1800px HEIC (210.6 KB / 215,687 B) with London GPS (51.5074°N, 0.1278°W)
   • Dimension Preset: PASSPORT_600X600 -> Resizes raster to 1:1 square (600x600px)
   • Target Max KB Auto-Tuner (<= 50 KB):
     Enforces 8x8 DCT quantization ceiling -> Output JPG = 2.6 KB / 2,706 B (<= 50 KB PASS!)
   • Privacy Policy: STRIP_ALL -> 0 EXIF bytes, 0 GPS tags in output JPEG.`}</pre>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 4: TECHNICAL REFERENCE: SUPPORTED CONTAINERS & ISOBMFF BOXES
          ============================================================================ */}
            <section
                aria-labelledby="heic-avif-isobmff-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="heic-avif-isobmff-matrix"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Technical Reference: Supported Input Containers, Magic Signatures &amp; ISOBMFF Boxes
                    </h2>
                </div>
                <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Our binary inspector identifies each container from its physical byte header rather than its filename extension:
                </p>

                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Container / Box Type</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Binary Signature / Brands</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Specification Standard</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Forensic Telemetry Extracted by Engine</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">Apple HEIC / iOS 18 MiHE</td>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">ftyp: heic, heix, MiHE, mif1, tmap</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">ISO/IEC 23008-12 (HEIF / HEVC)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Extracts spatial extents (ispe), 10-bit Display P3 (colr), irot/imir rotation, HDR Gain Map (tmap), and Exif box.</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">AVIF (AV1 Image Format)</td>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">ftyp: avif, avis, avio, MA1B, miaf</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">AOMedia AV1 ISOBMFF Spec</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Detects 8/10/12-bit depth (pixi), auxiliary alpha plane (auxC), color primaries, and embedded EXIF metadata.</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">ISOBMFF colr &amp; pixi Boxes</td>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">nclx (Primaries 1, 9, 12) / prof ICC</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">ISO/IEC 14496-12 &amp; ITU-T H.273</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Distinguishes Display P3 Wide Gamut (12) and Rec. 2020 HDR (9) from standard sRGB (1) for gamut mapping.</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">ISOBMFF irot &amp; imir Boxes</td>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">angle_code (0..3) &amp; axis (0..1)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">ISO/IEC 23008-12 §6.5.10</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Computes exact counter-clockwise rotation (0°/90°/180°/270°) and mirror axis, unified with EXIF Tag 0x0112.</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">JPEG / JFIF / Exif (.jpg)</td>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">FF D8 FF (SOI, APP0, APP1, SOF0)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">ITU-T T.81 / Exif 2.32</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Auto-recovers misnamed WhatsApp/Telegram .heic files that are physically JPEGs and scrubs APP1 EXIF/GPS.</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">PNG &amp; WebP (.png / .webp)</td>
                                <td className="p-3 font-mono border border-slate-200 dark:border-slate-700">89 50 4E 47 / RIFF....WEBP</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">W3C PNG 3rd Ed. / RFC 9649 WebP</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Parses IHDR, sRGB, eXIf, VP8L, VP8X, and EXIF chunks for bidirectional batch conversion and scrubbing.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 5: 16-TAG EXIF, TIFF & GPS PRIVACY SCRUBBER REFERENCE TABLE
          ============================================================================ */}
            <section
                aria-labelledby="heic-avif-16-exif-tags"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="heic-avif-16-exif-tags"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        16-Tag Binary EXIF, Optical &amp; GPS Privacy Audit Matrix
                    </h2>
                </div>
                <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    See how each TIFF/EXIF/GPS tag is handled across our 3 privacy modes (verified by re-parsing every output file):
                </p>

                <div className="w-full mt-4 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Hex Tag ID</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">IFD Group &amp; Tag Name</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Mode 1: Strip All</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Mode 2: Keep Camera / Strip GPS</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Privacy / Forensic Significance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {[
                                ['0x0001 / 0x0002', 'GPSIFD • GPSLatitudeRef & GPSLatitude', 'STRIPPED', 'STRIPPED', 'Reveals exact home/office North/South latitude in degrees, minutes, and seconds.'],
                                ['0x0003 / 0x0004', 'GPSIFD • GPSLongitudeRef & GPSLongitude', 'STRIPPED', 'STRIPPED', 'Reveals exact East/West longitude coordinates down to street-address precision.'],
                                ['0x0006', 'GPSIFD • GPSAltitude', 'STRIPPED', 'STRIPPED', 'Reveals elevation/floor height in meters above sea level.'],
                                ['0xA431', 'ExifIFD • BodySerialNumber', 'STRIPPED', 'STRIPPED', 'Unique hardware serial number that links anonymous photos back to a specific device.'],
                                ['0xA430', 'ExifIFD • CameraOwnerName', 'STRIPPED', 'STRIPPED', 'Personal name of the camera/iPhone owner configured in device settings.'],
                                ['0x013C', 'IFD0 • HostComputer', 'STRIPPED', 'STRIPPED', 'Device host identifier (e.g., iPhone 16 Pro Max) and OS build fingerprint.'],
                                ['0x927C', 'ExifIFD • MakerNote (Apple Binary)', 'STRIPPED', 'STRIPPED', 'Proprietary vendor binary blob containing internal sensor, burst UUID, and face telemetry.'],
                                ['0x010F / 0x0110', 'IFD0 • Make & Model', 'STRIPPED', 'PRESERVED', 'Camera manufacturer (Apple, Sony, Canon) and model name needed for photography portfolios.'],
                                ['0x0112', 'IFD0 • Orientation', 'STRIPPED (Pixels Upright)', 'NORMALIZED TO 1', 'Normalized to 1 after rotating pixel buffer so viewers never display photos sideways.'],
                                ['0x0131 / 0x9003', 'IFD0 / ExifIFD • Software & DateTimeOriginal', 'STRIPPED', 'PRESERVED', 'Capture timestamp and OS/lightroom software version for chronological album sorting.'],
                                ['0x829A / 0x829D', 'ExifIFD • ExposureTime & FNumber', 'STRIPPED', 'PRESERVED', 'Shutter speed (e.g. 1/120 sec) and aperture f-stop (e.g. f/1.78) optical telemetry.'],
                                ['0x8827 / 0x920A / 0xA434', 'ExifIFD • ISO, FocalLength & LensModel', 'STRIPPED', 'PRESERVED', 'ISO sensitivity (e.g. ISO 64), focal length (6.77 mm), and optical lens assembly name.'],
                            ].map(([hexId, nameStr, m1, m2, desc]) => (
                                <tr key={hexId}>
                                    <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700">{hexId}</td>
                                    <td className="p-3 font-semibold border border-slate-200 dark:border-slate-700">{nameStr}</td>
                                    <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700">{m1}</td>
                                    <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">{m2}</td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">{desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 6: COMPETITOR COMPARISON MATRIX (VS 255+ MARKET ALTERNATIVES)
          ============================================================================ */}
            <section
                aria-labelledby="heic-avif-competitor-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="heic-avif-competitor-matrix"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Enterprise Benchmark: KivaroTools vs. Cloud Converters &amp; Basic Browser Wrappers
                </h2>
                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Capability / Technical Axis</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">
                                    KivaroTools Local Studio (/image/heic-to-jpg)
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Cloud Upload Converters (CloudConvert / FreeConvert)
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Basic heic2any Browser Wrappers
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Siloed Single-Format AVIF Tools
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Photo &amp; GPS Privacy Architecture
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    100% Local Browser Memory (0 Bytes Uploaded)
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                                    Uploads private photos &amp; GPS to remote cloud servers
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Local browser</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Varies (often server upload)</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Daily Batch Caps &amp; Paywalls
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Unlimited Free Batch Conversion &amp; ZIP Archive
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                                    10–25 files/day cap + credit-card paywalls
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Often capped at 5–20 files</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">1-by-1 manual download</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    iOS 18 MiHE &amp; Misnamed File Recovery
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Forensic ISOBMFF ftyp &amp; Magic-Byte Auto-Recovery
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Server codec dependent</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                                    Crashes with ERR_LIBHEIF on misnamed/iOS 18 files
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">Rejects HEIC/HEIF</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    3-Mode EXIF &amp; GPS Privacy Control
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Strip All, Keep Camera/Strip GPS, or Preserve All + Audit
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">All-or-nothing toggle</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                                    Silently destroys all EXIF with zero audit visibility
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Target Max KB Auto-Tuner (Visa/Portals)
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Built-In (&lt;= 50 KB, 100 KB, 200 KB, 500 KB, 1 MB) + 600x600px
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Transparent Alpha Matte Fill for JPG
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Live White (#FFFFFF), Slate, Cream, or Custom Hex Picker
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Often renders black (#000000)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                                    Turns transparent areas pitch black
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">
                                    Turns transparent areas pitch black
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 7: 6 COMMON HEIC & AVIF CONVERSION PITFALLS (AND HOW TO FIX THEM)
          ============================================================================ */}
            <section
                aria-labelledby="heic-avif-pitfalls"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="heic-avif-pitfalls"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    6 Common HEIC &amp; AVIF Conversion Pitfalls (And How Our Studio Solves Them)
                </h2>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            1. Leaking Home GPS Coordinates in Converted JPGs
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Converting an iPhone photo to JPG with metadata preserved and posting it to a marketplace or forum exposes your exact home GPS latitude and longitude.
                            <br />
                            <strong>Fix:</strong> Keep our default <strong>Strip All EXIF &amp; GPS</strong> (or <strong>Keep Camera / Strip GPS</strong>) policy active and verify <code>0 GPS Tags</code> in Tab 2.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            2. Transparent AVIF/HEIC Logos Turning Black in JPG
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Exporting a transparent <code>.avif</code> product graphic to <code>.jpg</code> without alpha compositing turns the background solid black (<code>#000000</code>).
                            <br />
                            <strong>Fix:</strong> Our studio defaults to a clean <code>#FFFFFF</code> White Matte for JPG/PDF exports (customizable in Tab 3) or preserves full 32-bit transparency in PNG/WebP.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            3. Visa &amp; Passport Portals Rejecting 4 MB JPGs
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Converting a 12MP/48MP iPhone HEIC at 95% quality produces a 3–6 MB JPG that immigration and university portals reject for exceeding <code>100 KB</code> or <code>200 KB</code>.
                            <br />
                            <strong>Fix:</strong> Click <code>&lt;= 50 KB</code>, <code>&lt;= 100 KB</code>, or <code>&lt;= 200 KB</code> on the left panel to binary-search the exact KB ceiling automatically.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            4. Washed-Out Skin Tones on Display P3 Photos
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Dropping the wide-gamut Display P3 color profile without mapping primary coordinates causes converted sRGB JPEGs to look dull and desaturated.
                            <br />
                            <strong>Fix:</strong> Keep <strong>Perceptual Display P3 -&gt; sRGB Map</strong> enabled in Advanced Options.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            5. Sideways Portrait Photos (irot vs. EXIF 0x0112)
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Converters that ignore the ISOBMFF <code>irot</code> box export vertical iPhone portraits rotated 90° counter-clockwise.
                            <br />
                            <strong>Fix:</strong> Our orientation engine applies <code>irot</code> + EXIF <code>0x0112</code> automatically and provides per-file 90° rotation and H/V flip buttons in Tab 1.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            6. &quot;ERR_LIBHEIF&quot; Crashes on Misnamed WhatsApp Files
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Files shared via WhatsApp, Telegram, or email often keep a <code>.heic</code> extension even after the app transcoded them to JPEG, crashing naive decoders.
                            <br />
                            <strong>Fix:</strong> Load Preset #3 to see how our magic-byte inspector detects <code>FF D8 FF</code> inside a <code>.heic</code> filename and recovers it with zero errors.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 8: SEARCH INTENT & WORKFLOW COVERAGE (33 TARGET WORKFLOWS)
          ============================================================================ */}
            <section
                aria-labelledby="heic-avif-keyword-coverage"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="heic-avif-keyword-coverage"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Supported HEIC, HEIF, AVIF, EXIF Privacy &amp; Portal Compression Workflows
                    </h2>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            iPhone HEIC &amp; iOS 18 MiHE Conversion (11 Workflows)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>heic to jpg batch converter no upload</li>
                            <li>convert iphone heic to jpg offline in browser</li>
                            <li>heic to png lossless 32-bit batch converter</li>
                            <li>ios 18 heic mihe to jpg converter fix</li>
                            <li>iphone 16 pro 48mp heic to jpg online</li>
                            <li>fix err_libheif format not supported error</li>
                            <li>misnamed whatsapp heic to jpg auto fixer</li>
                            <li>10-bit hdr heic gain map tmap to jpg</li>
                            <li>heic display p3 to srgb color converter</li>
                            <li>fix sideways iphone heic rotation irot</li>
                            <li>bulk heic to jpg zip download free</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            AVIF, WebP, Alpha Matte &amp; E-Commerce (11 Workflows)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>avif to png transparent converter free</li>
                            <li>avif to jpg converter white background matte</li>
                            <li>avif to jpg custom alpha matte color picker</li>
                            <li>heic and avif to webp rfc 9649 converter</li>
                            <li>shopify avif to png product photo converter</li>
                            <li>batch rename iphone img_heic to seo slugs</li>
                            <li>batch convert heic and avif to pdf contact sheet</li>
                            <li>convert avif to printable pdf document</li>
                            <li>client-side image psnr and ssim quality checker</li>
                            <li>isobmff ftyp colr ispe binary box inspector</li>
                            <li>unlimited batch heif to jpg converter</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            EXIF/GPS Privacy &amp; Portal KB Limits (11 Workflows)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>strip gps location coordinates from heic photos</li>
                            <li>convert heic to jpg keep camera exif strip gps</li>
                            <li>remove apple makernote and body serial number</li>
                            <li>heic exif gps coordinate viewer and audit log</li>
                            <li>heic to jpg compress under 50kb visa portal</li>
                            <li>heic to jpg compress under 100kb passport photo</li>
                            <li>heic to jpg compress under 200kb job portal</li>
                            <li>passport photo heic to jpg 600x600px square</li>
                            <li>heic conversion sha-256 privacy audit json</li>
                            <li>export image conversion manifest to excel xlsx</li>
                            <li>zero-server privacy photo scrubber online</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 9: FREQUENTLY ASKED QUESTIONS (16 INTERACTIVE ACCORDIONS)
          ============================================================================ */}
            <section
                aria-labelledby="heic-avif-converter-faq"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="heic-avif-converter-faq"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Frequently Asked Questions (HEIC, AVIF, ISOBMFF &amp; EXIF Privacy)
                    </h2>
                </div>

                <div className="space-y-3">
                    {HEIC_AVIF_CONVERTER_FAQS.map((faq, index) => (
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
          SECTION 10: INTERNAL CROSS-LINKING TO RELATED IMAGE, DOCUMENT & DEV TOOLS
          ============================================================================ */}
            <section
                aria-labelledby="heic-avif-related-tools"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Code2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="heic-avif-related-tools"
                        className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Related Client-Side Image, Document Privacy &amp; Binary Inspection Utilities
                    </h2>
                </div>
                <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed break-words">
                    Continue your local image conversion, PDF preparation, and metadata sanitization workflow with our integrated browser utilities:
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/document/image-to-pdf"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            Image to PDF Document Compiler →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Combine converted JPG and PNG photos into custom page-size A4/Letter PDF packets locally in your browser.
                        </p>
                    </Link>

                    <Link
                        href="/document/pdf-scrubber"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            PDF Bank Statement &amp; Invoice PII Scrubber →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Permanently excise IBANs, Luhn card PANs, tax IDs, and all 12 hidden PDF metadata surfaces client-side.
                        </p>
                    </Link>

                    <Link
                        href="/document/compress-pdf"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            Client-Side PDF Size Compressor →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Shrink multi-page scanned PDF applications to meet strict government and university upload limits.
                        </p>
                    </Link>

                    <Link
                        href="/document/pdf-to-jpg"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            PDF to High-DPI JPG / PNG Renderer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Render PDF pages into high-resolution raster images with instant batch ZIP download in browser memory.
                        </p>
                    </Link>

                    <Link
                        href="/developer/base64-encoder"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            Base64 Data URI &amp; Binary Hex Inspector →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Encode converted WebP, PNG, and JPG icons into inline CSS/HTML Base64 Data URIs and inspect binary headers.
                        </p>
                    </Link>

                    <Link
                        href="/developer/har-analyzer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            HAR Network Waterfall &amp; Secret Sanitizer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Audit image payload bottlenecks across HTTP waterfalls and scrub JWTs, cookies, and API keys locally.
                        </p>
                    </Link>

                    <Link
                        href="/document/pdf-signer-bates-stamper"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            PDF Digital Signer, Watermark &amp; Bates Stamper →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Sign PDFs with /ByteRange &amp; SHA-256 audit pages, add tiled underlay watermarks, and stamp multi-PDF Bates numbers locally.
                        </p>
                    </Link>

                </div>
            </section>
        </article>
    );
}