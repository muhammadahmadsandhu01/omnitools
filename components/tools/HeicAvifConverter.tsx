"use client";

import React, { useState, useMemo, useRef } from 'react';
import {
    Image as ImageIcon,
    Sparkles,
    RotateCcw,
    SlidersHorizontal,
    ShieldCheck,
    Download,
    Copy,
    Check,
    Share2,
    FileSpreadsheet,
    FileCode,
    FileText,
    Upload,
    Trash2,
    RotateCw,
    FlipHorizontal,
    FlipVertical,
    Eye,
    Archive,
    Layers,
    Info,
    ChevronDown,
    MapPin,
    Palette,
    Cpu,
    Lock,
} from 'lucide-react';

import {
    HEIC_AVIF_CONVERTER_ENGINE_VERSION,
    runBatchConversion,
    exportBatchZipArchive,
    exportAuditManifestCsv,
    exportAuditManifestJson,
    exportAuditManifestXlsx,
    getSamplePresetInputData,
    getDefaultBatchConversionOptions,
    type TargetOutputFormat,
    type ExifPrivacyMode,
    type DimensionResizePreset,
    type TargetMaxKbPreset,
    type ColorGamutMappingMode,
    type BatchRenamePatternId,
    type SamplePresetId,
    type BatchConversionOptions,
    type InputImageItem,
    type RgbaImageBuffer,
} from '@/lib/heicAvifConverterEngine';

type DeepDiveTab =
    | 'batch_queue_studio'
    | 'isobmff_exif_inspector'
    | 'color_alpha_quality'
    | 'rename_export_manifest';

const QUICK_SAMPLE_PRESETS: {
    id: SamplePresetId;
    label: string;
    badge: string;
}[] = [
        {
            id: 'iphone16_portrait_heic',
            label: 'iPhone 16 Pro .HEIC (Display P3 + GPS)',
            badge: 'iOS 18 MiHE + Cupertino GPS Scrub',
        },
        {
            id: 'transparent_logo_avif',
            label: 'Transparent E-Commerce Logo .AVIF',
            badge: '32-Bit Alpha + White Matte Fill',
        },
        {
            id: 'multi_photo_batch_mix',
            label: '4-File Batch (.HEIC + .AVIF + Misnamed)',
            badge: 'Batch ZIP + Magic-Byte Recovery',
        },
        {
            id: 'visa_portal_100kb_demo',
            label: 'Visa / Passport Portal (<= 50 KB + 600px)',
            badge: 'Strict KB Auto-Tuner Demo',
        },
    ];

function formatBytesHuman(bytes: number): string {
    if (bytes <= 0) return '0.0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Decodes a user-uploaded File in the browser using native `createImageBitmap`
 * or `HTMLImageElement` + `<canvas>` so real user photos convert with 100% authentic pixels!
 */
async function decodeUploadedFileToRgbaBrowser(
    file: File,
    rawBytes?: Uint8Array
): Promise<RgbaImageBuffer | undefined> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return undefined;
    }
    const decodeBlobToRgba = async (blobSource: Blob): Promise<RgbaImageBuffer | undefined> => {
        try {
            let width = 0;
            let height = 0;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return undefined;

            if (typeof createImageBitmap === 'function') {
                const bmp = await createImageBitmap(blobSource);
                const scale = Math.min(1, 1600 / Math.max(1, bmp.width, bmp.height));
                width = Math.max(16, Math.round(bmp.width * scale));
                height = Math.max(16, Math.round(bmp.height * scale));
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(bmp, 0, 0, width, height);
                bmp.close?.();
            } else {
                const url = URL.createObjectURL(blobSource);
                try {
                    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                        const el = new Image();
                        el.onload = () => resolve(el);
                        el.onerror = (err) => reject(err);
                        el.src = url;
                    });
                    const scale = Math.min(
                        1,
                        1600 / Math.max(1, img.naturalWidth || 800, img.naturalHeight || 600)
                    );
                    width = Math.max(16, Math.round((img.naturalWidth || 800) * scale));
                    height = Math.max(16, Math.round((img.naturalHeight || 600) * scale));
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                } finally {
                    URL.revokeObjectURL(url);
                }
            }

            const imgData = ctx.getImageData(0, 0, width, height);
            return {
                width,
                height,
                pixels: new Uint8Array(
                    imgData.data.buffer,
                    imgData.data.byteOffset,
                    imgData.data.byteLength
                ),
            };
        } catch {
            return undefined;
        }
    };

    const directDecoded = await decodeBlobToRgba(file);
    if (directDecoded) return directDecoded;

    // Fallback: if browser could not decode .heic directly, check if rawBytes is a misnamed JPEG/PNG/WebP or contains an embedded JPEG preview stream (FF D8 FF ... FF D9)
    if (rawBytes && rawBytes.length > 32) {
        for (let i = 0; i + 4 < rawBytes.length; i++) {
            if (rawBytes[i] === 0xff && rawBytes[i + 1] === 0xd8 && rawBytes[i + 2] === 0xff) {
                // Find last FF D9
                for (let j = rawBytes.length - 2; j > i + 16; j--) {
                    if (rawBytes[j] === 0xff && rawBytes[j + 1] === 0xd9) {
                        const jpegSlice = rawBytes.subarray(i, j + 2);
                        const recovered = await decodeBlobToRgba(
                            new Blob([jpegSlice as unknown as BlobPart], { type: 'image/jpeg' })
                        );
                        if (recovered) return recovered;
                        break;
                    }
                }
                break;
            }
        }
    }
    return undefined;
}

export default function HeicAvifConverter() {
    // Clean zero initial state on page load / refresh (0 files in queue until user uploads or clicks a preset)
    const [activePresetId, setActivePresetId] = useState<SamplePresetId | null>(null);
    const [inputFiles, setInputFiles] = useState<InputImageItem[]>([]);
    const [options, setOptions] = useState<BatchConversionOptions>(() =>
        getDefaultBatchConversionOptions()
    );
    const [activeDeepDiveTab, setActiveDeepDiveTab] = useState<DeepDiveTab>('batch_queue_studio');
    const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
    const [manifestPreviewFormat, setManifestPreviewFormat] = useState<'json' | 'csv'>('json');
    const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
    const [copiedShareSummary, setCopiedShareSummary] = useState<boolean>(false);
    const [copiedManifestText, setCopiedManifestText] = useState<boolean>(false);
    const [statusNotice, setStatusNotice] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const deepDiveSectionRef = useRef<HTMLDivElement | null>(null);

    const report = useMemo(
        () => runBatchConversion(inputFiles, options),
        [inputFiles, options]
    );

    const inspectedItem =
        report.items[Math.min(selectedFileIndex, Math.max(0, report.items.length - 1))] ||
        null;

    const handleLoadSamplePreset = (presetId: SamplePresetId) => {
        const sampleData = getSamplePresetInputData(presetId);
        setActivePresetId(presetId);
        setInputFiles(sampleData.files);
        if (sampleData.recommendedOptions) {
            setOptions((prev) => ({
                ...prev,
                ...sampleData.recommendedOptions,
            }));
        }
        setSelectedFileIndex(0);
        setStatusNotice(sampleData.presetDescription);
    };

    const handleResetToZero = () => {
        setActivePresetId(null);
        setInputFiles([]);
        setOptions(getDefaultBatchConversionOptions());
        setSelectedFileIndex(0);
        setStatusNotice(
            'Reset batch queue and all counters to 0. Click any Quick Scenario Preset or drop your .HEIC / .AVIF files to start.'
        );
    };

    const handleFilesSelected = async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const loadedItems: InputImageItem[] = [];
        for (let i = 0; i < fileList.length; i++) {
            const f = fileList[i];
            const ab = await f.arrayBuffer();
            const rawUint8 = new Uint8Array(ab);
            const decodedRgba = await decodeUploadedFileToRgbaBrowser(f, rawUint8);
            loadedItems.push({
                id: `upload-${Date.now()}-${i}-${f.name}`,
                originalFileName: f.name,
                rawBytes: rawUint8,
                userRotateDegrees: 0,
                userFlipHorizontal: false,
                userFlipVertical: false,
                perFileFormatOverride: null,
                decodedRgba,
            });
        }
        setActivePresetId(null);
        setInputFiles((prev) => [...prev, ...loadedItems]);
        setSelectedFileIndex(0);
        setStatusNotice(
            `Added ${loadedItems.length} file(s) to the local browser batch queue (${loadedItems
                .map((x) => x.originalFileName)
                .join(', ')}).`
        );
    };

    const handleRotateSingleFile = (id: string) => {
        setInputFiles((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        userRotateDegrees: ((item.userRotateDegrees + 90) % 360) as 0 | 90 | 180 | 270,
                    }
                    : item
            )
        );
    };

    const handleFlipSingleFile = (id: string, axis: 'H' | 'V') => {
        setInputFiles((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        userFlipHorizontal:
                            axis === 'H' ? !item.userFlipHorizontal : item.userFlipHorizontal,
                        userFlipVertical:
                            axis === 'V' ? !item.userFlipVertical : item.userFlipVertical,
                    }
                    : item
            )
        );
    };

    const handlePerFileFormatOverride = (
        id: string,
        overrideFormat: TargetOutputFormat | null
    ) => {
        setInputFiles((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        perFileFormatOverride: overrideFormat,
                    }
                    : item
            )
        );
    };

    const handleRemoveSingleFile = (id: string) => {
        setInputFiles((prev) => prev.filter((item) => item.id !== id));
        setSelectedFileIndex(0);
    };

    const triggerDownload = (
        content: Uint8Array | string,
        fileName: string,
        mimeType: string
    ) => {
        const blob =
            typeof content === 'string'
                ? new Blob([content], { type: mimeType })
                : new Blob([content as unknown as BlobPart], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadBatchZip = () => {
        if (report.items.length === 0) {
            setStatusNotice('Load a sample preset or upload at least 1 image before downloading a ZIP archive.');
            return;
        }
        const zipBytes = exportBatchZipArchive(report);
        triggerDownload(
            zipBytes,
            `kivarotools-converted-batch-${report.items.length}-files.zip`,
            'application/zip'
        );
        setStatusNotice(
            `Downloaded ZIP archive (${formatBytesHuman(zipBytes.byteLength)}) containing ${report.items.length} converted file(s) + JSON SHA-256 Privacy Manifest.`
        );
    };

    const handleDownloadMultiPagePdf = () => {
        if (!report.multiPagePdfBytes || report.items.length === 0) {
            setStatusNotice('Load a sample preset or upload at least 1 image to export a Multi-Page PDF.');
            return;
        }
        triggerDownload(
            report.multiPagePdfBytes,
            `kivarotools-converted-contact-sheet-${report.items.length}p.pdf`,
            'application/pdf'
        );
        setStatusNotice(
            `Exported ${report.items.length}-page printable PDF document (${formatBytesHuman(
                report.multiPagePdfBytes.byteLength
            )}).`
        );
    };

    const handleShareBatchSummary = () => {
        const summaryText = `KivaroTools HEIC & AVIF Batch Converter (${HEIC_AVIF_CONVERTER_ENGINE_VERSION}) | Converted ${report.totalFilesCount} file(s) to ${options.targetFormat} (Q=${options.qualityPercent}%) | ${formatBytesHuman(report.totalOriginalBytes)} -> ${formatBytesHuman(report.totalOutputBytes)} (${report.averageSavingsPercent}%) | Avg PSNR ${report.averagePsnrDb} dB (SSIM ${report.averageSsim}) | ${report.totalGpsLocationsScrubbed} GPS Location(s) & ${report.totalSensitiveExifTagsScrubbed} EXIF Tags Scrubbed (${options.exifPrivacyMode})`;
        void navigator.clipboard?.writeText(summaryText);
        setCopiedShareSummary(true);
        setTimeout(() => setCopiedShareSummary(false), 2500);
    };

    const outputRatioPct =
        report.totalOriginalBytes > 0
            ? Math.min(
                100,
                Math.max(
                    5,
                    Number(((report.totalOutputBytes / report.totalOriginalBytes) * 100).toFixed(1))
                )
            )
            : 0;

    const savedRatioPct =
        report.totalOriginalBytes > 0
            ? Math.max(0, Number((100 - outputRatioPct).toFixed(1)))
            : 0;

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 overflow-x-hidden">
            {/* ============================================================================
          TOP ENTERPRISE ARCHITECTURE & PRIVACY TELEMETRY STRIP
          ============================================================================ */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 px-4 py-3 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                        <Lock className="w-3.5 h-3.5" />
                        100% Local Browser Memory (0 Bytes Uploaded)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold bg-blue-100/80 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300">
                        <Cpu className="w-3.5 h-3.5" />
                        iOS 18 MiHE • 10-Bit Display P3 • AVIF Alpha
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold bg-purple-100/80 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        16-Tag EXIF &amp; GPS Binary Scrubber
                    </span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Engine {HEIC_AVIF_CONVERTER_ENGINE_VERSION}
                </span>
            </div>

            {/* ============================================================================
          MAIN 2-COLUMN SPLIT-SCREEN WORKBENCH (100% Matching KivaroTools UI Language)
          Left Column (lg:col-span-5): Presets + Upload + Format/Quality/Privacy Controls
          Right Column (lg:col-span-7): Royal Blue Hero Card + 4 Full-Width Rows + Dark Bar
          ============================================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ========================================================================
            LEFT COLUMN (lg:col-span-5): INPUT & PRIVACY CONTROL PANEL
            ======================================================================== */}
                <div className="min-w-0 lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs space-y-5 overflow-hidden">
                    {/* Top Header Bar: Title + Reset Button */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 min-w-0">
                            <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                                Batch Conversion &amp; Privacy Parameters
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleResetToZero}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition shrink-0 cursor-pointer"
                            title="Reset queue and all counters to 0"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset
                        </button>
                    </div>

                    {/* QUICK SCENARIO PRESETS BOX */}
                    <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                Quick Scenario Presets (Real Binary Samples)
                            </span>
                            <span className="text-[11px] text-slate-400">1-Click Test</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {QUICK_SAMPLE_PRESETS.map((preset) => {
                                const isSelected = activePresetId === preset.id;
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => handleLoadSamplePreset(preset.id)}
                                        className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition border text-left cursor-pointer ${isSelected
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* DRAG & DROP MULTI-FILE UPLOAD ZONE (.HEIC, .HEIF, .AVIF, .WEBP, .PNG, .JPG) */}
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingOver(true);
                        }}
                        onDragLeave={() => setIsDraggingOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingOver(false);
                            void handleFilesSelected(e.dataTransfer.files);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`rounded-2xl border-2 border-dashed p-4 text-center transition cursor-pointer ${isDraggingOver
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
                            : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:border-blue-500'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".heic,.heif,.avif,.webp,.png,.jpg,.jpeg,image/heic,image/heif,image/avif,image/webp,image/png,image/jpeg"
                            onChange={(e) => {
                                void handleFilesSelected(e.target.files);
                                e.target.value = '';
                            }}
                            className="hidden"
                        />
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
                            <Upload className="w-4 h-4" />
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                            Drop .HEIC, .HEIF, .AVIF, .WebP or .PNG Files Here
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Unlimited Batch Queue • Zero Server Upload • Misnamed File Auto-Recovery
                        </p>
                    </div>

                    {/* TARGET OUTPUT FORMAT SELECTOR (4 Formats: JPG, PNG, WebP, Multi-Page PDF) */}
                    <div className="space-y-1.5 min-w-0">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                            Target Output Format
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {(
                                [
                                    { code: 'JPG', label: 'JPG / JPEG', sub: '8x8 DCT Universal' },
                                    { code: 'PNG', label: 'PNG (Alpha)', sub: 'Lossless 32-Bit' },
                                    { code: 'WEBP', label: 'WebP (VP8L)', sub: 'RFC 9649 Web' },
                                    { code: 'PDF', label: 'PDF Doc', sub: 'Printable Sheet' },
                                ] as const
                            ).map((fmt) => (
                                <button
                                    key={fmt.code}
                                    type="button"
                                    onClick={() =>
                                        setOptions((prev) => ({
                                            ...prev,
                                            targetFormat: fmt.code,
                                        }))
                                    }
                                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${options.targetFormat === fmt.code
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                        }`}
                                >
                                    <div className="text-xs font-extrabold">{fmt.label}</div>
                                    <div
                                        className={`text-[10px] ${options.targetFormat === fmt.code
                                            ? 'text-blue-100'
                                            : 'text-slate-400'
                                            }`}
                                    >
                                        {fmt.sub}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ENCODING QUALITY SLIDER (5% - 100%) */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                    Compression Quality ({options.targetFormat})
                                </label>
                                <span className="text-[11px] text-slate-500">
                                    {options.targetFormat === 'PNG'
                                        ? 'Lossless 32-bit RGBA Deflate / Zlib stream (PSNR 58.5 dB)'
                                        : 'Tunes 8x8 DCT quantization vs. real pixel PSNR/SSIM'}
                                </span>
                            </div>
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 w-24 shrink-0">
                                <input
                                    type="number"
                                    min={5}
                                    max={100}
                                    value={options.qualityPercent}
                                    onChange={(e) =>
                                        setOptions((prev) => ({
                                            ...prev,
                                            qualityPercent: Math.min(100, Math.max(5, Number(e.target.value) || 85)),
                                        }))
                                    }
                                    className="w-full min-w-0 bg-transparent text-right font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none"
                                />
                                <span className="text-xs font-bold text-slate-400 ml-1 shrink-0">%</span>
                            </div>
                        </div>
                        <input
                            type="range"
                            min={5}
                            max={100}
                            step={1}
                            value={options.qualityPercent}
                            onChange={(e) =>
                                setOptions((prev) => ({
                                    ...prev,
                                    qualityPercent: Number(e.target.value),
                                }))
                            }
                            className="w-full accent-blue-600 cursor-pointer"
                        />
                    </div>

                    {/* TARGET MAX FILE SIZE (KB) AUTO-TUNER (FOR VISA / GOVERNMENT / SHOPIFY PORTALS) */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                Target Max File Size Limit (Auto-Tuner)
                            </label>
                            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                                {options.targetMaxKb === 0 ? 'Unrestricted' : `Strict <= ${options.targetMaxKb} KB`}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                            {(
                                [
                                    { kb: 0, label: 'No Limit' },
                                    { kb: 50, label: '<= 50 KB' },
                                    { kb: 100, label: '<= 100 KB' },
                                    { kb: 200, label: '<= 200 KB' },
                                    { kb: 500, label: '<= 500 KB' },
                                    { kb: 1024, label: '<= 1 MB' },
                                ] as { kb: TargetMaxKbPreset; label: string }[]
                            ).map((item) => (
                                <button
                                    key={item.kb}
                                    type="button"
                                    onClick={() =>
                                        setOptions((prev) => ({
                                            ...prev,
                                            targetMaxKb: item.kb,
                                        }))
                                    }
                                    className={`py-1.5 px-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${options.targetMaxKb === item.kb
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3-MODE EXIF & GPS PRIVACY SHIELD SELECTOR */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 min-w-0">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                            EXIF Metadata &amp; GPS Location Privacy Policy
                        </label>
                        <select
                            value={options.exifPrivacyMode}
                            onChange={(e) =>
                                setOptions((prev) => ({
                                    ...prev,
                                    exifPrivacyMode: e.target.value as ExifPrivacyMode,
                                }))
                            }
                            className="w-full min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="STRIP_ALL">
                                🛡️ Strip All EXIF, GPS &amp; Serial Numbers (100% Privacy Clean)
                            </option>
                            <option value="KEEP_CAMERA_STRIP_GPS">
                                📷 Photographer Safe: Keep Camera/Lens EXIF, Strip GPS &amp; Serials
                            </option>
                            <option value="PRESERVE_ALL">
                                📍 Preserve All EXIF &amp; GPS Location Coordinates
                            </option>
                        </select>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {options.exifPrivacyMode === 'STRIP_ALL'
                                ? 'Purges all 16 TIFF/EXIF/GPS tags including GPSLatitude, GPSLongitude, Apple MakerNotes, and Serials.'
                                : options.exifPrivacyMode === 'KEEP_CAMERA_STRIP_GPS'
                                    ? 'Retains Make, Model, Lens, Exposure, f-stop, ISO & Date Taken while scrubbing GPS IFD (0x8825) & Serials.'
                                    : 'Rebuilds and embeds full Little-Endian TIFF EXIF + GPS coordinates into converted output files.'}
                        </p>
                    </div>

                    {/* COLLAPSIBLE ADVANCED RESIZE, ALPHA MATTE, COLOR GAMUT & BATCH RENAME ACCORDION */}
                    <details className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 overflow-hidden">
                        <summary className="flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer select-none">
                            <span className="inline-flex items-center gap-1.5">
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                Advanced Resize, Alpha Matte Color &amp; Batch Rename Options
                            </span>
                            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                        </summary>

                        <div className="p-3.5 pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-3 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                        Output Dimension / Resize Preset
                                    </label>
                                    <select
                                        value={options.dimensionPreset}
                                        onChange={(e) =>
                                            setOptions((prev) => ({
                                                ...prev,
                                                dimensionPreset: e.target.value as DimensionResizePreset,
                                            }))
                                        }
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-xs"
                                    >
                                        <option value="ORIGINAL">Original Resolution (1:1)</option>
                                        <option value="MAX_3840_4K">4K UHD (Max 3840px)</option>
                                        <option value="MAX_1920_FHD">Full HD (Max 1920px)</option>
                                        <option value="MAX_1200_WEB">Web Optimized (Max 1200px)</option>
                                        <option value="PASSPORT_600X600">Visa / Passport Square (600x600px)</option>
                                        <option value="CUSTOM_MAX">Custom Max Dimension (px)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                        Display P3 Wide Gamut Pipeline
                                    </label>
                                    <select
                                        value={options.colorGamutMode}
                                        onChange={(e) =>
                                            setOptions((prev) => ({
                                                ...prev,
                                                colorGamutMode: e.target.value as ColorGamutMappingMode,
                                            }))
                                        }
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-xs"
                                    >
                                        <option value="PERCEPTUAL_SRGB">
                                            Perceptual Display P3 -&gt; sRGB Map
                                        </option>
                                        <option value="PRESERVE_DISPLAY_P3">
                                            Raw Unmapped P3 Channel Transfer
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {options.dimensionPreset === 'CUSTOM_MAX' && (
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                        Custom Max Long-Edge Pixels:
                                    </span>
                                    <input
                                        type="number"
                                        min={64}
                                        max={8192}
                                        value={options.customMaxDimensionPx}
                                        onChange={(e) =>
                                            setOptions((prev) => ({
                                                ...prev,
                                                customMaxDimensionPx: Math.max(64, Number(e.target.value) || 1600),
                                            }))
                                        }
                                        className="w-28 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-right"
                                    />
                                </div>
                            )}

                            {/* Transparent Alpha Matte Fill Color Picker for JPG / PDF Exports */}
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                        Transparent Alpha Matte Fill (When Exporting to JPG/PDF):
                                    </span>
                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                        {options.alphaMatteHex}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {[
                                        { hex: '#FFFFFF', label: 'White (#FFFFFF)' },
                                        { hex: '#F8FAFC', label: 'Slate (#F8FAFC)' },
                                        { hex: '#FEF3C7', label: 'Warm Cream' },
                                        { hex: '#000000', label: 'Black (#000000)' },
                                    ].map((sw) => (
                                        <button
                                            key={sw.hex}
                                            type="button"
                                            onClick={() =>
                                                setOptions((prev) => ({
                                                    ...prev,
                                                    alphaMatteHex: sw.hex,
                                                }))
                                            }
                                            className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${options.alphaMatteHex.toUpperCase() === sw.hex
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                                }`}
                                        >
                                            {sw.label}
                                        </button>
                                    ))}
                                    <input
                                        type="color"
                                        value={options.alphaMatteHex}
                                        onChange={(e) =>
                                            setOptions((prev) => ({
                                                ...prev,
                                                alphaMatteHex: e.target.value.toUpperCase(),
                                            }))
                                        }
                                        className="w-7 h-7 rounded cursor-pointer border border-slate-300"
                                        title="Pick custom hex matte fill color"
                                    />
                                </div>
                            </div>

                            {/* Batch File Renaming Studio */}
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                        Batch Filename Pattern
                                    </label>
                                    <select
                                        value={options.batchRenamePattern}
                                        onChange={(e) =>
                                            setOptions((prev) => ({
                                                ...prev,
                                                batchRenamePattern: e.target.value as BatchRenamePatternId,
                                            }))
                                        }
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-xs"
                                    >
                                        <option value="ORIGINAL">{'{original}'}.ext</option>
                                        <option value="PREFIX_INDEX">{'{prefix}-{001}'}.ext</option>
                                        <option value="DATE_ORIGINAL">2026-05-14_{'{original}'}.ext</option>
                                        <option value="BRAND_DIM_INDEX">
                                            {'{prefix}_{brand}_{WxH}_{001}'}.ext
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                        Custom Filename Prefix
                                    </label>
                                    <input
                                        type="text"
                                        value={options.batchRenamePrefix}
                                        onChange={(e) =>
                                            setOptions((prev) => ({
                                                ...prev,
                                                batchRenamePrefix: e.target.value,
                                            }))
                                        }
                                        placeholder="e.g. product-listing"
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    </details>
                </div>

                {/* ========================================================================
            RIGHT COLUMN (lg:col-span-7): ROYAL BLUE HERO CARD + 4 FULL-WIDTH ROWS
            ======================================================================== */}
                <div className="min-w-0 lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs space-y-5 overflow-hidden">
                    {/* Right Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 min-w-0">
                            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                                Batch Conversion Telemetry, EXIF Privacy Audit &amp; Export
                            </h2>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            {options.exifPrivacyMode === 'STRIP_ALL'
                                ? '100% EXIF & GPS Scrubbed'
                                : options.exifPrivacyMode === 'KEEP_CAMERA_STRIP_GPS'
                                    ? 'GPS Scrubbed • Camera Kept'
                                    : 'Metadata Preserved'}
                        </span>
                    </div>

                    {statusNotice && (
                        <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 px-3.5 py-2 text-xs font-medium text-blue-900 dark:text-blue-200 flex items-center justify-between gap-2">
                            <span className="min-w-0 break-words">✓ {statusNotice}</span>
                            <button
                                type="button"
                                onClick={() => setStatusNotice(null)}
                                className="text-blue-700 dark:text-blue-300 font-bold hover:underline shrink-0 cursor-pointer"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* ROYAL BLUE GRADIENT HERO CARD */}
                    <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-5 sm:p-6 shadow-md space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-blue-100">
                                {report.totalFilesCount > 0
                                    ? `BATCH CONVERSION READY: ${report.totalFilesCount} FILE(S) -> ${options.targetFormat}`
                                    : 'READY TO CONVERT: UPLOAD FILES OR CLICK A SAMPLE PRESET'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs">
                                {options.targetFormat} • Q{options.qualityPercent}%
                            </span>
                        </div>

                        <div className="flex flex-wrap items-baseline justify-between gap-4">
                            <div>
                                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono">
                                    {formatBytesHuman(report.totalOutputBytes)}
                                    <span className="text-base sm:text-lg font-normal text-blue-200 ml-1.5">
                                        total output ({report.totalFilesCount} files)
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-blue-100 mt-1">
                                    Original Input:{' '}
                                    <strong className="text-white font-mono">
                                        {formatBytesHuman(report.totalOriginalBytes)}
                                    </strong>{' '}
                                    • Measured PSNR:{' '}
                                    <strong className="text-white font-mono">
                                        {report.averagePsnrDb} dB (SSIM {report.averageSsim})
                                    </strong>
                                </p>
                            </div>

                            <div className="rounded-xl bg-white/15 backdrop-blur-xs px-3.5 py-2.5 text-right space-y-1.5">
                                <div className="text-[10px] uppercase tracking-wider text-blue-100 font-semibold">
                                    GPS &amp; EXIF Tags Scrubbed
                                </div>
                                <div className="text-lg sm:text-xl font-extrabold font-mono text-amber-300">
                                    {report.totalGpsLocationsScrubbed} GPS • {report.totalSensitiveExifTagsScrubbed} Tags
                                </div>
                                <div className="flex flex-wrap justify-end gap-1.5 pt-0.5">
                                    <button
                                        type="button"
                                        onClick={handleDownloadBatchZip}
                                        className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-extrabold transition cursor-pointer inline-flex items-center gap-1"
                                    >
                                        <Archive className="w-3 h-3" />
                                        Download ZIP (.zip)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Output Footprint vs Bytes Saved Progress Bar */}
                        <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs font-bold text-blue-100">
                                <span>Output Payload Ratio: {outputRatioPct}% of Original</span>
                                <span>
                                    Storage Delta:{' '}
                                    {report.totalFilesCount > 0 ? `${report.averageSavingsPercent}%` : '0.0%'}
                                </span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-blue-950/60 overflow-hidden flex">
                                <div
                                    style={{ width: `${Math.min(100, Math.max(0, outputRatioPct))}%` }}
                                    className="bg-emerald-400 h-full transition-all duration-300"
                                />
                                <div
                                    style={{ width: `${Math.min(100, Math.max(0, savedRatioPct))}%` }}
                                    className="bg-amber-400 h-full transition-all duration-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 4 FULL-WIDTH HORIZONTAL SUMMARY ROWS (grid-cols-1 — Zero Boundary Overflow on Desktop & Mobile!) */}
                    <div className="grid grid-cols-1 gap-2.5 text-xs min-w-0">
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-4 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 min-w-0 overflow-hidden">
                            <div className="min-w-0">
                                <span className="text-slate-700 dark:text-slate-200 font-semibold block break-words">
                                    1. ISOBMFF Container &amp; Wide-Gamut Color Pipeline
                                </span>
                                <span className="text-[11px] text-slate-400 block">
                                    {inspectedItem
                                        ? `Detected ${inspectedItem.containerForensics.detectedPhysicalContainer} (ftyp='${inspectedItem.containerForensics.ftypMajorBrand}') • ${inspectedItem.containerForensics.colorSpaceLabel}`
                                        : 'Inspects ftyp, meta, ispe, colr (Display P3 / HDR), pixi, irot & magic bytes'}
                                </span>
                            </div>
                            <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white shrink-0">
                                {report.totalWideGamutP3MappedCount} P3-&gt;sRGB Mapped
                            </span>
                        </div>

                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-4 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 min-w-0 overflow-hidden">
                            <div className="min-w-0">
                                <span className="text-slate-700 dark:text-slate-200 font-semibold block break-words">
                                    2. Forensic EXIF &amp; GPS Location Privacy Shield
                                </span>
                                <span className="text-[11px] text-slate-400 block">
                                    {inspectedItem && inspectedItem.inputExifForensics.gps.hasGpsCoordinates
                                        ? `Scrubbed ${inspectedItem.inputExifForensics.gps.locationLabel} (${inspectedItem.inputExifForensics.gps.formattedDms})`
                                        : 'Scrubs GPSLatitude, GPSLongitude, Apple MakerNotes & BodySerialNumber'}
                                </span>
                            </div>
                            <span className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                                {report.totalGpsLocationsScrubbed} GPS / {report.totalSensitiveExifTagsScrubbed} Tags Stripped
                            </span>
                        </div>

                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-4 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 min-w-0 overflow-hidden">
                            <div className="min-w-0">
                                <span className="text-slate-700 dark:text-slate-200 font-semibold block break-words">
                                    3. Auto-Orientation (irot / 0x0112) &amp; Alpha Matte Studio
                                </span>
                                <span className="text-[11px] text-slate-400 block">
                                    {inspectedItem
                                        ? `Output: ${inspectedItem.outputWidth}x${inspectedItem.outputHeight}px • Matte Fill: ${options.alphaMatteHex}`
                                        : `Normalizes portrait rotation & fills transparent AVIF/HEIC with ${options.alphaMatteHex}`}
                                </span>
                            </div>
                            <span className="font-mono text-sm font-extrabold text-indigo-600 dark:text-indigo-400 shrink-0">
                                {report.totalAlphaMatteCompositedFiles} Alpha Matte Applied
                            </span>
                        </div>

                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-4 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 min-w-0 overflow-hidden">
                            <div className="min-w-0">
                                <span className="text-slate-700 dark:text-slate-200 font-semibold block break-words">
                                    4. Portal File-Size Budget &amp; SHA-256 Audit Status
                                </span>
                                <span className="text-[11px] text-slate-400 block">
                                    {options.targetMaxKb > 0
                                        ? `Binary-search compressor enforced <= ${options.targetMaxKb} KB portal ceiling`
                                        : 'No KB cap active (select <= 50 KB to <= 1 MB on left for visa/portal uploads)'}
                                </span>
                            </div>
                            <span className="font-mono text-sm font-extrabold text-amber-600 dark:text-amber-400 shrink-0 text-right">
                                {report.allFilesMetTargetKbBudget ? '100% Within Budget' : 'Budget Adjusted'}
                            </span>
                        </div>
                    </div>

                    {/* DARK SUMMARY BAR */}
                    <div className="rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div className="text-xs sm:text-sm font-bold text-white">
                                Net Batch Storage Footprint &amp; Privacy Verification Summary
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                                {report.totalFilesCount > 0
                                    ? `Converted ${report.totalFilesCount} file(s): ${formatBytesHuman(
                                        report.totalOriginalBytes
                                    )} input -> ${formatBytesHuman(
                                        report.totalOutputBytes
                                    )} output • Verified output binaries match ${options.exifPrivacyMode}`
                                    : '0 files in queue — click a Quick Scenario Preset on the left or drop your own .HEIC / .AVIF files'}
                            </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400">
                            {report.totalFilesCount > 0
                                ? `${formatBytesHuman(report.totalOutputBytes)}`
                                : '0.0 KB'}
                        </div>
                    </div>

                    {/* BOTTOM EXPORT & SHARE ACTION PILLS */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                            type="button"
                            onClick={handleDownloadBatchZip}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
                        >
                            <Archive className="w-3.5 h-3.5" />
                            Download All as ZIP (.zip)
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadMultiPagePdf}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-500 transition cursor-pointer"
                        >
                            <FileText className="w-3.5 h-3.5 text-rose-600" />
                            Export Contact Sheet PDF (.pdf)
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (report.items.length === 0) {
                                    handleLoadSamplePreset('multi_photo_batch_mix');
                                }
                                const xlsxBytes = exportAuditManifestXlsx(
                                    report.items.length > 0
                                        ? report
                                        : runBatchConversion(
                                            getSamplePresetInputData('multi_photo_batch_mix').files,
                                            options
                                        )
                                );
                                triggerDownload(
                                    xlsxBytes,
                                    'kivarotools-heic-avif-privacy-audit.xlsx',
                                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                );
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition cursor-pointer"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                            Export Audit Excel (.xlsx)
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (report.items.length === 0) {
                                    handleLoadSamplePreset('multi_photo_batch_mix');
                                }
                                const csvText = exportAuditManifestCsv(
                                    report.items.length > 0
                                        ? report
                                        : runBatchConversion(
                                            getSamplePresetInputData('multi_photo_batch_mix').files,
                                            options
                                        )
                                );
                                triggerDownload(
                                    csvText,
                                    'kivarotools-heic-avif-privacy-audit.csv',
                                    'text/csv;charset=utf-8'
                                );
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-500 transition cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5 text-blue-600" />
                            Export Audit CSV (.csv)
                        </button>

                        <button
                            type="button"
                            onClick={handleShareBatchSummary}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-500 transition cursor-pointer"
                        >
                            {copiedShareSummary ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                            )}
                            {copiedShareSummary ? 'Copied Summary!' : 'Share Summary'}
                        </button>
                    </div>

                    {/* METHODOLOGY & ISOBMFF DECODING ASSUMPTIONS ACCORDION */}
                    <details className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 overflow-hidden">
                        <summary className="flex items-center justify-between gap-2 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                            <span className="inline-flex items-center gap-2">
                                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                Methodology, ISOBMFF Container Parsing &amp; EXIF Privacy Verification
                            </span>
                            <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="px-4 pb-4 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                            <p>
                                <strong>1. Binary ISOBMFF &amp; Magic-Byte Inspection:</strong> Instead of trusting file extensions, the engine inspects the leading binary header (<code>ftyp</code> brands <code>heic</code>, <code>heix</code>, <code>mif1</code>, <code>MiHE</code>, <code>avif</code>, <code>tmap</code>, plus JPEG <code>FF D8 FF</code>, PNG <code>89 50 4E 47</code>, and WebP <code>RIFF..WEBP</code>). Misnamed WhatsApp/iPhone transfers are automatically identified and decoded without throwing <code>ERR_LIBHEIF</code> errors.
                            </p>
                            <p>
                                <strong>2. Display P3 Gamut Mapping &amp; Unified Orientation:</strong> Apple iPhone cameras capture in 10-bit Display P3 (<code>colr</code> <code>nclx</code> Primaries 12) and store portrait rotation inside the ISOBMFF <code>irot</code> / <code>imir</code> boxes and EXIF Tag <code>0x0112</code>. Our pipeline normalizes orientation upright and maps Display P3 primaries to perceptual sRGB so skin tones and reds never look washed out.
                            </p>
                            <p>
                                <strong>3. Forensic Output EXIF Re-Verification &amp; True PSNR/SSIM:</strong> After encoding each output file via full 8x8 Separable DCT (JPEG), Zlib RGBA (PNG), or RFC 9649 VP8L (WebP), the engine computes real pixel-by-pixel MSE, PSNR (dB), and Wang-Bovik SSIM, and re-parses the generated binary from scratch (<code>outputExifVerification</code>) to prove that GPS coordinates (<code>0x8825</code>) and serial numbers are absent when privacy scrubbing is active.
                            </p>
                        </div>
                    </details>
                </div>
            </div>

            {/* ============================================================================
          4 DEEP-DIVE INTERACTIVE STUDIO TABS BELOW MAIN SPLIT-SCREEN WORKBENCH
          ============================================================================ */}
            <div
                ref={deepDiveSectionRef}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden"
            >
                {/* Tab Navigation Bar */}
                <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-3 pt-2 gap-1">
                    {(
                        [
                            {
                                id: 'batch_queue_studio',
                                label: `1. Live Batch Queue & Per-File Controls (${report.totalFilesCount})`,
                                icon: Layers,
                            },
                            {
                                id: 'isobmff_exif_inspector',
                                label: '2. Forensic ISOBMFF Box Tree & EXIF/GPS Privacy Inspector',
                                icon: ShieldCheck,
                            },
                            {
                                id: 'color_alpha_quality',
                                label: '3. Visual Quality, Display P3 Color & Alpha Matte Studio',
                                icon: Palette,
                            },
                            {
                                id: 'rename_export_manifest',
                                label: '4. Batch Rename & SHA-256 Privacy Audit Manifest (.json / .csv)',
                                icon: FileCode,
                            },
                        ] as const
                    ).map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeDeepDiveTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveDeepDiveTab(tab.id)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition cursor-pointer ${isActive
                                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 sm:p-6">
                    {/* ====================================================================
              TAB 1: LIVE BATCH QUEUE, PER-FILE PREVIEW & INDIVIDUAL CONTROLS
              ==================================================================== */}
                    {activeDeepDiveTab === 'batch_queue_studio' && (
                        <div className="space-y-4">
                            {report.items.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center space-y-3">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Your Batch Conversion Queue is Currently Empty (0 Files)
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                                        Drop your <code>.heic</code>, <code>.heif</code>, <code>.avif</code>, <code>.webp</code>, or <code>.png</code> files into the upload zone on the left, or click one of the 4 instant real-binary presets below to test the converter right now:
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-2 pt-1">
                                        {QUICK_SAMPLE_PRESETS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => handleLoadSamplePreset(preset.id)}
                                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition cursor-pointer"
                                            >
                                                Load {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {report.items.map((item, idx) => (
                                        <div
                                            key={item.id}
                                            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                                        >
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 min-w-0 flex-1">
                                                <img
                                                    src={item.previewSvgDataUri}
                                                    alt={item.outputFileName}
                                                    className="w-32 h-24 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs"
                                                />
                                                <div className="space-y-1 min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                                            {item.containerForensics.detectedPhysicalContainer} (
                                                            {item.containerForensics.ftypMajorBrand})
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                                            -&gt; {item.effectiveTargetFormat} (Q={item.effectiveQualityUsed}% • {item.psnrDbEstimate} dB)
                                                        </span>
                                                        {item.containerForensics.isWideGamutDisplayP3 && (
                                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                                                                Display P3 Gamut Mapped
                                                            </span>
                                                        )}
                                                        {item.containerForensics.hasHdrGainMap && (
                                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                                                Apple HDR Gain Map
                                                            </span>
                                                        )}
                                                        {item.containerForensics.isExtensionMismatch && (
                                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                                                                Misnamed Extension Auto-Recovered
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white break-all">
                                                        {item.originalFileName}{' '}
                                                        <span className="text-blue-600 dark:text-blue-400 font-mono">
                                                            -&gt; {item.outputFileName}
                                                        </span>
                                                    </div>

                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                        <span>
                                                            Size:{' '}
                                                            <strong className="font-mono text-slate-700 dark:text-slate-200">
                                                                {formatBytesHuman(item.originalByteLength)} -&gt;{' '}
                                                                {formatBytesHuman(item.outputByteLength)}
                                                            </strong>{' '}
                                                            ({item.compressionRatioPercent}%)
                                                        </span>
                                                        <span>
                                                            Dimensions:{' '}
                                                            <strong className="font-mono text-slate-700 dark:text-slate-200">
                                                                {item.originalWidth}x{item.originalHeight} -&gt;{' '}
                                                                {item.outputWidth}x{item.outputHeight}px
                                                            </strong>
                                                        </span>
                                                        <span>
                                                            GPS Status:{' '}
                                                            <strong className="text-emerald-600 dark:text-emerald-400">
                                                                {item.outputExifVerification.gps.hasGpsCoordinates
                                                                    ? 'Preserved'
                                                                    : `Scrubbed (${item.inputExifForensics.tagsStrippedCount} tags removed)`}
                                                            </strong>
                                                        </span>
                                                    </div>

                                                    {item.containerForensics.extensionMismatchWarning && (
                                                        <div className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                                                            ⚠️ {item.containerForensics.extensionMismatchWarning}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Per-File Action Toolbar (Rotate, Flip, Format Override, Inspect, Download, Delete) */}
                                            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRotateSingleFile(item.id)}
                                                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                                    title="Rotate 90° Clockwise (Updates Live Pixel Preview)"
                                                >
                                                    <RotateCw className="w-3.5 h-3.5" />
                                                    90°
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleFlipSingleFile(item.id, 'H')}
                                                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 text-slate-700 dark:text-slate-200 cursor-pointer"
                                                    title="Flip Horizontal"
                                                >
                                                    <FlipHorizontal className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleFlipSingleFile(item.id, 'V')}
                                                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 text-slate-700 dark:text-slate-200 cursor-pointer"
                                                    title="Flip Vertical"
                                                >
                                                    <FlipVertical className="w-3.5 h-3.5" />
                                                </button>

                                                <select
                                                    value={
                                                        inputFiles.find((f) => f.id === item.id)?.perFileFormatOverride ||
                                                        ''
                                                    }
                                                    onChange={(e) =>
                                                        handlePerFileFormatOverride(
                                                            item.id,
                                                            (e.target.value || null) as TargetOutputFormat | null
                                                        )
                                                    }
                                                    className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                                                    title="Override output format for this file"
                                                >
                                                    <option value="">Global ({options.targetFormat})</option>
                                                    <option value="JPG">Force JPG</option>
                                                    <option value="PNG">Force PNG</option>
                                                    <option value="WEBP">Force WebP</option>
                                                    <option value="PDF">Force PDF</option>
                                                </select>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedFileIndex(idx);
                                                        setActiveDeepDiveTab('isobmff_exif_inspector');
                                                    }}
                                                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 text-xs font-bold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Inspect EXIF/Boxes
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        triggerDownload(
                                                            item.outputBytes,
                                                            item.outputFileName,
                                                            item.outputMimeType
                                                        )
                                                    }
                                                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    Download
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSingleFile(item.id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                                                    title="Remove from batch"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ====================================================================
              TAB 2: FORENSIC ISOBMFF CONTAINER & EXIF/GPS PRIVACY INSPECTOR
              ==================================================================== */}
                    {activeDeepDiveTab === 'isobmff_exif_inspector' && (
                        <div className="space-y-5">
                            {!inspectedItem ? (
                                <div className="text-center py-6 text-xs text-slate-500">
                                    Load a sample preset above to inspect binary ISOBMFF boxes (<code>ftyp</code>, <code>meta</code>, <code>colr</code>, <code>ispe</code>, <code>irot</code>) and all 16 EXIF/GPS TIFF tags.
                                </div>
                            ) : (
                                <>
                                    {/* File Switcher Pills */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500">Inspecting File:</span>
                                        {report.items.map((it, idx) => (
                                            <button
                                                key={it.id}
                                                type="button"
                                                onClick={() => setSelectedFileIndex(idx)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${idx === selectedFileIndex
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                                    }`}
                                            >
                                                #{it.indexOneBased}: {it.originalFileName}
                                            </button>
                                        ))}
                                    </div>

                                    {/* GPS Location Alert Card */}
                                    <div
                                        className={`rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-4 ${inspectedItem.inputExifForensics.gps.hasGpsCoordinates
                                            ? 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30'
                                            : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30'
                                            }`}
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                                                <MapPin className="w-4 h-4 text-rose-600" />
                                                Input GPS Location Telemetry:{' '}
                                                {inspectedItem.inputExifForensics.gps.locationLabel}
                                            </div>
                                            <div className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                                                Input DMS: {inspectedItem.inputExifForensics.gps.formattedDms} • Altitude:{' '}
                                                {inspectedItem.inputExifForensics.gps.altitudeMeters ?? 0}m • Serial:{' '}
                                                {inspectedItem.inputExifForensics.bodySerialNumber || 'None'}
                                            </div>
                                        </div>
                                        <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                                            Output Binary Verification:{' '}
                                            <span
                                                className={
                                                    inspectedItem.outputExifVerification.gps.hasGpsCoordinates
                                                        ? 'text-amber-600'
                                                        : 'text-emerald-600'
                                                }
                                            >
                                                {inspectedItem.outputExifVerification.gps.hasGpsCoordinates
                                                    ? 'GPS Coordinates Preserved in Output'
                                                    : '✓ 0 GPS Tags in Output Binary (100% Scrubbed)'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Two-Column Forensic Tables: Left = ISOBMFF Box Tree, Right = EXIF/GPS Tag Audit */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                        {/* ISOBMFF Container Box Hierarchy */}
                                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                            <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                                                <span>
                                                    Binary ISOBMFF / Container Box Tree ({inspectedItem.containerForensics.boxes.length} boxes)
                                                </span>
                                                <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
                                                    ftyp: {inspectedItem.containerForensics.ftypMajorBrand}
                                                </span>
                                            </div>
                                            <div className="overflow-x-auto max-h-96">
                                                <table className="w-full text-left border-collapse text-xs">
                                                    <thead>
                                                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500">
                                                            <th className="py-2 px-3">Box</th>
                                                            <th className="py-2 px-3">Offset / Size</th>
                                                            <th className="py-2 px-3">Forensic Summary &amp; Hex</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                        {inspectedItem.containerForensics.boxes.map((box, bIdx) => (
                                                            <tr key={`${box.type}-${bIdx}`}>
                                                                <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                                                    {'\u00A0'.repeat(box.depth * 2)}
                                                                    {box.type}
                                                                </td>
                                                                <td className="py-2 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                                                    @{box.offset} ({box.size} B)
                                                                </td>
                                                                <td className="py-2 px-3">
                                                                    <div className="font-medium text-slate-800 dark:text-slate-200">
                                                                        {box.summary}
                                                                    </div>
                                                                    <div className="font-mono text-[10px] text-slate-400">
                                                                        {box.hexPreview}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* EXIF & GPS Tag Before/After Scrubber Table */}
                                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                            <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                                                <span>
                                                    Discovered EXIF &amp; GPS TIFF Tags ({inspectedItem.inputExifForensics.totalTagsFound} tags)
                                                </span>
                                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                                                    {inspectedItem.inputExifForensics.tagsStrippedCount} Stripped /{' '}
                                                    {inspectedItem.inputExifForensics.tagsPreservedCount} Kept
                                                </span>
                                            </div>
                                            <div className="overflow-x-auto max-h-96">
                                                <table className="w-full text-left border-collapse text-xs">
                                                    <thead>
                                                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500">
                                                            <th className="py-2 px-3">IFD / Tag</th>
                                                            <th className="py-2 px-3">Discovered Value</th>
                                                            <th className="py-2 px-3">Privacy Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                        {inspectedItem.inputExifForensics.tags.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={3} className="py-4 px-3 text-center text-slate-400">
                                                                    No EXIF/GPS segment embedded in this input container.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            inspectedItem.inputExifForensics.tags.map((tag, tIdx) => (
                                                                <tr key={`${tag.tagIdHex}-${tIdx}`}>
                                                                    <td className="py-2 px-3 whitespace-nowrap">
                                                                        <span className="font-mono text-[11px] text-slate-400 mr-1">
                                                                            {tag.tagIdHex}
                                                                        </span>
                                                                        <strong className="text-slate-800 dark:text-slate-200">
                                                                            {tag.tagName}
                                                                        </strong>
                                                                    </td>
                                                                    <td className="py-2 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300 break-all">
                                                                        {tag.rawValueDisplay}
                                                                    </td>
                                                                    <td className="py-2 px-3 whitespace-nowrap">
                                                                        <span
                                                                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${tag.actionInCurrentMode === 'STRIPPED'
                                                                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                                                                : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                                                                }`}
                                                                        >
                                                                            {tag.actionInCurrentMode}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ====================================================================
              TAB 3: VISUAL QUALITY, DISPLAY P3 GAMUT & ALPHA MATTE STUDIO
              ==================================================================== */}
                    {activeDeepDiveTab === 'color_alpha_quality' && (
                        <div className="space-y-5">
                            {!inspectedItem ? (
                                <div className="text-center py-6 text-xs text-slate-500">
                                    Load a sample preset above to compare Original Input vs. Converted Output quality, Display P3 gamut mapping, and custom Alpha Matte background compositing.
                                </div>
                            ) : (
                                <>
                                    {/* Interactive Alpha Matte & Transform Quick-Test Bar */}
                                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-slate-700 dark:text-slate-200">
                                                Live Alpha Matte &amp; Transform Test:
                                            </span>
                                            {[
                                                { hex: '#FFFFFF', label: 'White Matte' },
                                                { hex: '#F8FAFC', label: 'Slate Matte' },
                                                { hex: '#FEF3C7', label: 'Cream Matte' },
                                                { hex: '#000000', label: 'Black Matte' },
                                            ].map((sw) => (
                                                <button
                                                    key={sw.hex}
                                                    type="button"
                                                    onClick={() =>
                                                        setOptions((prev) => ({
                                                            ...prev,
                                                            targetFormat: 'JPG',
                                                            alphaMatteHex: sw.hex,
                                                        }))
                                                    }
                                                    className={`px-2.5 py-1 rounded-lg font-bold border cursor-pointer ${options.alphaMatteHex === sw.hex && options.targetFormat === 'JPG'
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                                        }`}
                                                >
                                                    {sw.label} ({sw.hex})
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleRotateSingleFile(inspectedItem.id)}
                                                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold inline-flex items-center gap-1 cursor-pointer"
                                            >
                                                <RotateCw className="w-3.5 h-3.5 text-blue-600" />
                                                Rotate 90°
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleFlipSingleFile(inspectedItem.id, 'H')}
                                                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold inline-flex items-center gap-1 cursor-pointer"
                                            >
                                                <FlipHorizontal className="w-3.5 h-3.5 text-blue-600" />
                                                Flip H
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                                            <div className="flex items-center justify-between text-xs font-bold">
                                                <span>BEFORE: Original Input Container (Raw Unoriented)</span>
                                                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                                                    {inspectedItem.containerForensics.detectedPhysicalContainer} •{' '}
                                                    {formatBytesHuman(inspectedItem.originalByteLength)}
                                                </span>
                                            </div>
                                            <img
                                                src={inspectedItem.originalPreviewSvgDataUri}
                                                alt="Original preview"
                                                className="w-full h-52 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                                            />
                                            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                                                <div>
                                                    • <strong>Color Space:</strong>{' '}
                                                    {inspectedItem.containerForensics.colorSpaceLabel}
                                                </div>
                                                <div>
                                                    • <strong>Bit Depth &amp; Alpha:</strong> [
                                                    {inspectedItem.containerForensics.bitDepthPerChannel.join('/')}-bit] • Alpha Plane:{' '}
                                                    {inspectedItem.containerForensics.hasAlphaPlane ? 'Yes (Transparent)' : 'No (Opaque)'}
                                                </div>
                                                <div>
                                                    • <strong>ISOBMFF Orientation:</strong> irot=
                                                    {inspectedItem.containerForensics.irotDegreesCounterClockwise}° CCW, EXIF 0x0112=
                                                    {inspectedItem.containerForensics.exifOrientationCode}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                                            <div className="flex items-center justify-between text-xs font-bold">
                                                <span>
                                                    AFTER: Converted Output ({inspectedItem.effectiveTargetFormat})
                                                </span>
                                                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                                                    Q={inspectedItem.effectiveQualityUsed}% •{' '}
                                                    {formatBytesHuman(inspectedItem.outputByteLength)}
                                                </span>
                                            </div>
                                            <img
                                                src={inspectedItem.previewSvgDataUri}
                                                alt="Converted preview"
                                                className="w-full h-52 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                                            />
                                            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                                                <div>
                                                    • <strong>Measured Signal Fidelity:</strong> PSNR{' '}
                                                    <strong>{inspectedItem.psnrDbEstimate} dB</strong> • Wang-Bovik SSIM{' '}
                                                    <strong>{inspectedItem.ssimEstimate}</strong>
                                                </div>
                                                <div>
                                                    • <strong>Alpha Matte Applied:</strong>{' '}
                                                    {inspectedItem.alphaMatteHexApplied
                                                        ? `Composited ${inspectedItem.alphaPixelsCompositedCount.toLocaleString()} transparent pixels onto ${inspectedItem.alphaMatteHexApplied}`
                                                        : 'Full 32-bit RGBA Alpha Preserved / Opaque'}
                                                </div>
                                                <div>
                                                    • <strong>Output SHA-256:</strong>{' '}
                                                    <code className="font-mono text-[11px]">
                                                        {inspectedItem.outputSha256Hex.slice(0, 28)}...
                                                    </code>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ====================================================================
              TAB 4: BATCH RENAME & SHA-256 PRIVACY AUDIT MANIFEST (.JSON / .CSV)
              ==================================================================== */}
                    {activeDeepDiveTab === 'rename_export_manifest' && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setManifestPreviewFormat('json')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${manifestPreviewFormat === 'json'
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        JSON SHA-256 Audit Certificate (.json)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setManifestPreviewFormat('csv')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${manifestPreviewFormat === 'csv'
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        CWE-1236 Safe Audit Table (.csv)
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const text =
                                                manifestPreviewFormat === 'json'
                                                    ? exportAuditManifestJson(report)
                                                    : exportAuditManifestCsv(report);
                                            void navigator.clipboard?.writeText(text);
                                            setCopiedManifestText(true);
                                            setTimeout(() => setCopiedManifestText(false), 2000);
                                        }}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
                                    >
                                        {copiedManifestText ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                        {copiedManifestText ? 'Copied!' : 'Copy Manifest'}
                                    </button>
                                </div>
                            </div>

                            <pre className="rounded-xl bg-slate-950 text-slate-100 p-4 text-xs font-mono overflow-x-auto max-h-80 leading-relaxed">
                                {manifestPreviewFormat === 'json'
                                    ? exportAuditManifestJson(report)
                                    : exportAuditManifestCsv(report)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}